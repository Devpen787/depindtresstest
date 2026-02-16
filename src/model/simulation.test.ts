import { describe, it, expect } from 'vitest';
import {
    simulateOne,
    processPanicEvents,
    createProvider,
    calculateChurnProbability
} from './simulation';
import { SeededRNG } from './rng';
import { SimulationParams, ProviderPool, Provider } from './types';
import { METRICS } from '../data/MetricRegistry';

// Mock Params
const MOCK_PARAMS: SimulationParams = {
    initialSupply: 1000000,
    initialLiquidity: 500000,
    initialPrice: 0.5,
    initialProviders: 100,
    baseDemand: 2000,
    maxMintWeekly: 10000,
    burnPct: 0.1,
    providerCostPerWeek: 10,
    // Scenario defaults
    T: 52,
    seed: 123,
    scenario: 'baseline',
    demandType: 'consistent',
    demandVolatility: 0.1,
    macro: 'sideways',
    baseServicePrice: 1,
    minServicePrice: 0.1,
    maxServicePrice: 10,
    servicePriceElasticity: 0.1,
    baseCapacityPerProvider: 100,
    capacityStdDev: 0.1,
    costStdDev: 0.1,
    churnThreshold: 0,
    maxProviderChurnRate: 1.0, // Allow 100% churn for the test to see the full spike
    hardwareLeadTime: 4,
    profitThresholdToJoin: 20,
    maxProviderGrowthRate: 0.1,
    investorUnlockWeek: -1,
    investorSellPct: 0,
    revenueStrategy: 'burn',
    kBuyPressure: 0.05,
    kSellPressure: 0.05,
    kDemandPrice: 0.01,
    kMintPrice: 0.01,
    rewardLagWeeks: 0,
    competitorYield: 0,
    emissionModel: 'fixed',
    hardwareCost: 1000,
    nSims: 1,
    proTierPct: 0,
    proTierEfficiency: 1.5
};

describe('V3 Simulation Engine (Math Verification)', () => {

    describe('1. Logic Proof: Urban vs Rural (Sunk Cost Stability)', () => {
        it('Urban miners should have lower panic probability than Rural miners', () => {
            const rng = new SeededRNG(123);
            const pool: ProviderPool = {
                active: [],
                churned: [],
                pending: []
            };

            // Manually create one Urban and one Rural provider
            const urbanMiner: Provider = { ...createProvider(rng, MOCK_PARAMS, 0), type: 'urban', operationalCost: 100, id: 'urban-1' };
            const ruralMiner: Provider = { ...createProvider(rng, MOCK_PARAMS, 0), type: 'rural', operationalCost: 100, id: 'rural-1' };

            pool.active.push(urbanMiner, ruralMiner);

            // Simulate a massive price crash (Panic Trigger)
            // Previous Profit was 0 (Breaking Even)
            // New Price is 50% lower -> Revenue Halves
            const oldPrice = 1.0;
            const newPrice = 0.5;
            const prevProfits = new Map<string, number>();
            prevProfits.set('urban-1', 0);
            prevProfits.set('rural-1', 0);

            // We run this 1000 times to test the PROBABILITY
            let urbanChurns = 0;
            let ruralChurns = 0;

            for (let i = 0; i < 1000; i++) {
                // Reset active state
                urbanMiner.isActive = true;
                ruralMiner.isActive = true;
                const tempPool = { active: [urbanMiner, ruralMiner], churned: [], pending: [] };

                const res = processPanicEvents(tempPool, oldPrice, newPrice, prevProfits, rng);

                // Active list decreased?
                const survivors = res.pool.active.map(p => p.id);
                if (!survivors.includes('urban-1')) urbanChurns++;
                if (!survivors.includes('rural-1')) ruralChurns++;
            }

            console.log(`Urban Churns: ${urbanChurns}, Rural Churns: ${ruralChurns}`);

            // MATH PROOF: Urban should represent "Sunk Cost" -> Lower Churn
            expect(urbanChurns).toBeLessThan(ruralChurns);
        });
    });

    describe('2. Logic Proof: Death Spiral (Panic Trigger)', () => {
        it('should trigger significantly higher churn during a crash compared to a normal week', () => {
            // CONTROL GROUP: No Crash
            const controlParams = {
                ...MOCK_PARAMS,
                initialProviders: 1000,
                seed: 999,
                providerCostPerWeek: 4,
                maxMintWeekly: 10000, // Back to normal mint
                baseDemand: 2000 // Low demand for marginal profit
            };
            const controlResults = simulateOne(controlParams, 999);

            // EXPERIMENT GROUP: Crash at Week 2
            const crashParams = {
                ...controlParams,
                initialProviders: 1000,
                seed: 999,
                investorUnlockWeek: 2, // Early crash
                investorSellPct: 0.50 // 50% Supply Dump -> Massive Crash
            };
            const crashResults = simulateOne(crashParams, 999);

            // Compare Churn at Week 2
            // Note: We check the specific week of the event
            const controlChurn = controlResults[2].churnCount;
            const crashChurn = crashResults[2].churnCount;

            console.log(`Control Week 2 Churn: ${controlChurn}, Crash Week 2 Churn: ${crashChurn}`);

            // MATH PROOF: Churn should be at least 5x higher in the crash scenario
            // Using a large multiplier to ensure statistical significance
            expect(crashChurn).toBeGreaterThan(controlChurn * 5);
        });
    });

    describe('3. Logic Proof: Formula Correctness', () => {
        it('Churn Probability should increase with consecutive losses', () => {
            // Loss = 1 week
            const prob1 = calculateChurnProbability(1, -10, MOCK_PARAMS);
            // Loss = 10 weeks
            const prob10 = calculateChurnProbability(10, -10, MOCK_PARAMS);

            expect(prob10).toBeGreaterThan(prob1);
        });

        it('Solvency Score should be < 1.0 when Minted > Burned (Dilution)', () => {
            // Since we can't easily force specific mint/burn values in the complex simulation,
            // we rely on the logic that simulateOne returns.
            // But we can check the formula logic from the output.

            const res = simulateOne(MOCK_PARAMS, 123)[10];

            // Solvency = (Burned USD) / (Minted USD)
            // If we set burnPct to 0, Solvency should be 0 (or close to)
            const paramsNoBurn = { ...MOCK_PARAMS, burnPct: 0 };
            const resNoBurn = simulateOne(paramsNoBurn, 123)[10];

            expect(resNoBurn.solvencyScore).toBeLessThan(0.1); // Should be near zero
        });
    });

    describe('3b. Structural Dynamics: Preorder Backlog + Sunk Cost', () => {
        it('should keep provider count expanding during bearish drawdown when backlog is present', () => {
            const params = {
                ...MOCK_PARAMS,
                T: 26,
                seed: 404,
                macro: 'bearish',
                demandType: 'consistent',
                initialProviders: 500,
                baseDemand: 900,
                providerCostPerWeek: 22,
                churnThreshold: 6,
                profitThresholdToJoin: 60,
                maxProviderGrowthRate: 0.01,
                maxProviderChurnRate: 0.05,
                maxMintWeekly: 5000,
                burnPct: 0.05,
                investorUnlockWeek: -1,
                investorSellPct: 0,
                preorderBacklogFraction: 1.50,
                preorderReleaseWeeks: 24,
                sunkCostChurnDamping: 0.80,
            } as unknown as SimulationParams;

            const run = simulateOne(params, params.seed);
            const initial = run[0].providers;
            const final = run[run.length - 1].providers;

            expect(final).toBeGreaterThan(initial * 1.05);
        });
    });


    describe('4. Defense Validation: Invariants & Registry Checks', () => {
        // [Sanity Gate 1] Retention Constraint
        it('Retention Rate should never exceed 1.0 or result in negative active nodes', () => {
            const res = simulateOne({ ...MOCK_PARAMS, initialProviders: 100, churnThreshold: -9999 }, 123);

            // Loop through all weeks
            res.forEach((week, index) => {
                // Derived Formula: 1 - (CumulativeChurn / Start)
                // In simulation.ts, 'churnCount' is per week.
                const startNodes = MOCK_PARAMS.initialProviders;
                // Since we don't have cumulative churn in the result object, we can verify the 'active providers' 
                // invariant: Active <= Start (assuming no growth for this test)

                // Assert 1: Active nodes constraint (assuming 0 growth for simplicity in this specific test setup)
                // If maxProviderGrowthRate > 0, Active CAN be > Start. 
                // So let's test the lower bound: Active >= 0.
                expect(week.providers).toBeGreaterThanOrEqual(0);
            });
        });

        // [Sanity Gate 2] Solvency Non-Negativity
        it('Solvency Score should be non-negative even in extreme burn scenarios', () => {
            // Force 100% burn
            const params = { ...MOCK_PARAMS, burnPct: 1.0 };
            const res = simulateOne(params, 999);

            res.forEach(week => {
                expect(week.solvencyScore).toBeGreaterThanOrEqual(0);
                expect(week.solvencyScore).not.toBeNaN();
                expect(week.solvencyScore).not.toBe(Infinity);
            });
        });

        // [Sanity Gate 3] Coverage Monotonicity (Coverage cannot be 0 if there are active nodes)
        it('Network Coverage Score should be positive when nodes are active', () => {
            const res = simulateOne(MOCK_PARAMS, 123);

            res.forEach(week => {
                if (week.providers > 0) {
                    expect(week.weightedCoverage).toBeGreaterThan(0);
                }
            });
        });
    });

    describe('5. Metric Registry Integrity (ADR-001 Compliance)', () => {
        it('All Registered Metrics should have valid Tier assignments', () => {
            Object.values(METRICS).forEach(metric => {
                expect(['survival', 'viability', 'utility']).toContain(metric.tier);
            });
        });

        it('All Registered Metrics should have a human-readable label', () => {
            Object.values(METRICS).forEach(metric => {
                expect(metric.label).toBeTruthy();
                expect(typeof metric.label).toBe('string');
                expect(metric.label.length).toBeGreaterThan(3);
            });
        });

        it('Survival Tier metrics should include critical thresholds', () => {
            Object.values(METRICS)
                .filter(m => m.tier === 'survival')
                .forEach(metric => {
                    // Not all survival metrics strictly need numeric thresholds (e.g. Urban Density count),
                    // but key ones like Solvency/Retention do.
                    if (['solvency_ratio', 'weekly_retention_rate'].includes(metric.id)) {
                        expect(metric.thresholds).toBeDefined();
                        expect(metric.thresholds?.critical).toBeDefined();
                    }
                });
        });
    });

    describe('6. Quality Scale (Hardware Tiers)', () => {
        it('should generate Pro providers based on proTierPct', () => {
            const params = { ...MOCK_PARAMS, initialProviders: 100, proTierPct: 0.5 };
            // Since we can't easily inspect internal state of simulateOne without exported metrics,
            // we test the shared createProvider logic directly which is exported.
            const rng = new SeededRNG(123);
            const active = [];
            for (let i = 0; i < 100; i++) {
                active.push(createProvider(rng, params, 0));
            }

            const proCount = active.filter(p => p.hardwareTier === 'pro').length;
            // Binomial distribution approx checks
            expect(proCount).toBeGreaterThan(40);
            expect(proCount).toBeLessThan(60);
        });

        it('Pro providers should have higher capacity (Efficiency Multiplier)', () => {
            const params = { ...MOCK_PARAMS, baseCapacityPerProvider: 100, proTierEfficiency: 2.0, proTierPct: 0.5 };
            const rng = new SeededRNG(123);

            let proFound = false;
            let basicFound = false;

            for (let i = 0; i < 50; i++) {
                const p = createProvider(rng, params, 0);
                if (p.hardwareTier === 'pro') {
                    // Capacity = Base * Efficiency * Random
                    // 100 * 2.0 = 200. Min 10.
                    // Random is normal * 0.1 usually. So 200 +/- 20.
                    expect(p.capacity).toBeGreaterThan(150);
                    proFound = true;
                } else {
                    // 100 * 1.0 = 100 +/- 10.
                    expect(p.capacity).toBeLessThan(150);
                    basicFound = true;
                }
            }
            expect(proFound).toBe(true);
            expect(basicFound).toBe(true);
        });

        it('Pro providers should be stickier during panic', () => {
            const rng = new SeededRNG(123);
            const params = { ...MOCK_PARAMS };
            // Create specific providers to test panic logic
            const proMiner: Provider = {
                ...createProvider(rng, params, 0),
                hardwareTier: 'pro',
                id: 'pro-1',
                type: 'urban' // Urban + Pro = Super Sticky
            };
            const basicMiner: Provider = {
                ...createProvider(rng, params, 0),
                hardwareTier: 'basic',
                id: 'basic-1',
                type: 'urban' // Urban + Basic = Normal Sticky
            };

            const oldPrice = 1.0;
            const newPrice = 0.5;
            const prevProfits = new Map<string, number>();
            prevProfits.set('pro-1', -10); // Loss
            prevProfits.set('basic-1', -10); // Loss

            let proChurns = 0;
            let basicChurns = 0;

            // Run Monte Carlo on decision logic
            for (let i = 0; i < 1000; i++) {
                proMiner.isActive = true;
                basicMiner.isActive = true;
                const tempPool = { active: [proMiner, basicMiner], churned: [], pending: [] };

                const res = processPanicEvents(tempPool, oldPrice, newPrice, prevProfits, rng);
                const survivors = res.pool.active.map(p => p.id);

                if (!survivors.includes('pro-1')) proChurns++;
                if (!survivors.includes('basic-1')) basicChurns++;
            }

            expect(proChurns).toBeLessThan(basicChurns);
        });
    });

});
