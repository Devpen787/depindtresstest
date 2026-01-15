
import { describe, it, expect } from 'vitest';
import { runSimulation } from '../model/simulation';
import type { SimulationParams, SimResult } from '../model/types';

// Baseline parameters (Peace Time)
const BASELINE_PARAMS: SimulationParams = {
    T: 52,
    initialSupply: 100000000,
    initialPrice: 1.0,
    maxMintWeekly: 500000,
    burnPct: 0.1,
    initialLiquidity: 5000000,
    investorUnlockWeek: 100, // Never happen
    investorSellPct: 0.0,
    scenario: 'baseline',
    demandType: 'growth',
    baseDemand: 10000,
    demandVolatility: 0.1,
    macro: 'sideways',
    initialProviders: 1000,
    baseCapacityPerProvider: 100,
    capacityStdDev: 0.2,
    providerCostPerWeek: 50,
    costStdDev: 0.1,
    hardwareLeadTime: 4,
    churnThreshold: -50,
    profitThresholdToJoin: 10,
    maxProviderGrowthRate: 0.05,
    maxProviderChurnRate: 0.1,
    kBuyPressure: 0.0001,
    kSellPressure: 0.0001,
    kDemandPrice: 0.0001,
    kMintPrice: 0.0001,
    baseServicePrice: 0.01,
    servicePriceElasticity: 0.5,
    minServicePrice: 0.001,
    maxServicePrice: 0.1,
    rewardLagWeeks: 0,
    nSims: 5,
    seed: 12345,
    competitorYield: 0.0,
    emissionModel: 'fixed',
    revenueStrategy: 'burn',
    hardwareCost: 1000,
};

function getMetrics(results: SimResult[]) {
    const last = results[results.length - 1];
    return {
        price: last.price, // Mean is usually not available on SimResult[], wait. SimResult[] is ONE sim. 
        // Oh runSimulation returns AggregateResult[].
        supply: last.supply,
        providers: last.providers,
    };
}
// runSimulation returns AggregateResult[] which has { mean, p10, p90 } for each metric
function getAggMetrics(agg: any[]) {
    const last = agg[agg.length - 1];
    return {
        price: last.price.mean,
        stdDev: last.price.stdDev,
        supply: last.supply.mean,
        providers: last.providers.mean,
        treasury: last.treasuryBalance?.mean || 0
    };
}

describe('Global Sensitivity & Math Audit', () => {

    // Baseline Run
    const baselineResults = runSimulation(BASELINE_PARAMS);
    const baseline = getAggMetrics(baselineResults);
    console.log('\n=== BASELINE METRICS ===');
    console.log(JSON.stringify(baseline, null, 2));

    // Helper to run audit
    const auditParam = (name: string, override: Partial<SimulationParams>, check: (base: any, newM: any) => void) => {
        it(`Audit: ${name}`, () => {
            const params = { ...BASELINE_PARAMS, ...override };
            const results = runSimulation(params);
            const metrics = getAggMetrics(results);

            console.log(`\n--- Audit: ${name} ---`);
            console.log('Params:', JSON.stringify(override));
            console.log('Result:', JSON.stringify(metrics, null, 2));

            // Calculate Delta
            const priceDelta = ((metrics.price - baseline.price) / baseline.price) * 100;
            const supplyDelta = ((metrics.supply - baseline.supply) / baseline.supply) * 100;
            const provDelta = ((metrics.providers - baseline.providers) / baseline.providers) * 100;

            console.log(`Delta % -> Price: ${priceDelta.toFixed(2)}%, Supply: ${supplyDelta.toFixed(2)}%, Providers: ${provDelta.toFixed(2)}%`);

            check(baseline, metrics);
        });
    };

    // 1. BURN RATE Audit
    // Expectation: Higher Burn -> Lower Supply -> Higher Price
    auditParam('High Burn Rate (50%)', { burnPct: 0.5 }, (base, curr) => {
        // Burn reduces Supply -> Increases Price (via Deflation Pressure)
        expect(curr.price).toBeGreaterThan(base.price); // Math Check

        // Sensitivity Check (Price should move UP)
        const priceDelta = curr.price - base.price;
        console.log(`Burn Price Delta: ${priceDelta}`);
        expect(priceDelta).toBeGreaterThan(0);
    });

    // 2. MINT RATE Audit
    // Expectation: Higher Mint -> Higher Supply -> Lower Price (Dilution)
    auditParam('High Mint Rate (5M/week)', { maxMintWeekly: 5000000 }, (base, curr) => {
        expect(curr.supply).toBeGreaterThan(base.supply);
        expect(curr.price).toBeLessThan(base.price);

        const priceChange = Math.abs((curr.price - base.price) / base.price);
        expect(priceChange).toBeGreaterThan(0.05);
    });

    // 3. INITIAL LIQUIDITY Audit
    // Expectation: Liquidity Depth changes simulation outcome significantly
    it('Audit: Liquidity Impact', () => {
        // High Demand Scenario
        const demandParams = { ...BASELINE_PARAMS, baseDemand: 50000 };

        const lowLiq = runSimulation({ ...demandParams, initialLiquidity: 100000 }); // $100k
        const highLiq = runSimulation({ ...demandParams, initialLiquidity: 100000000 }); // $100M

        const lowM = getAggMetrics(lowLiq);
        const highM = getAggMetrics(highLiq);

        console.log(`\n--- Audit: Liquidity Sensitivity ---`);
        console.log(`Low Liq Price: ${lowM.price}`);
        console.log(`High Liq Price: ${highM.price}`);

        // Different Liquidity -> Different Outcomes
        expect(lowM.price).not.toBe(highM.price);

        const diff = Math.abs((lowM.price - highM.price) / highM.price);
        console.log(`Liquidity Impact Delta: ${(diff * 100).toFixed(2)}%`);
        expect(diff).toBeGreaterThan(0.02); // >2% difference
    });

    // 4. INVESTOR UNLOCK Audit
    // Expectation: Unlock -> Price Drop
    auditParam('Investor Unlock (10% dump)', { investorUnlockWeek: 20, investorSellPct: 0.1 }, (base, curr) => {
        // Compare outcomes. Since unlock happens at week 20, by week 52 price might recover or stay low.
        // But "curr" price should generally be lower than baseline (peace time)
        expect(curr.price).toBeLessThan(base.price);

        const drop = (base.price - curr.price) / base.price;
        console.log(`Unlock Price Drop: ${(drop * 100).toFixed(2)}%`);
        expect(drop).toBeGreaterThan(0.05);
    });

    // 5. HARDWARE COST Audit
    // Expectation: Higher HW Cost -> Fewer Providers (Higher barrier/ROI)
    auditParam('High Hardware Cost ($5000)', { hardwareCost: 5000 }, (base, curr) => {
        expect(curr.providers).toBeLessThan(base.providers);
        const drop = (base.providers - curr.providers) / base.providers;
        console.log(`Provider Drop from Cost: ${(drop * 100).toFixed(2)}%`);
        expect(drop).toBeGreaterThan(0.1);
    });
});
