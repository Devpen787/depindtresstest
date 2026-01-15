
import { describe, it, expect } from 'vitest';
import { runSimulation } from './simulation';
import type { SimulationParams } from './types';

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
    nSims: 5, // Low nSims for speed
    seed: 12345,
    competitorYield: 0.0, // NO THREAT
    emissionModel: 'fixed',
    revenueStrategy: 'burn',
    hardwareCost: 1000,
};

describe('Sensitivity Audit: Vampire Attack', () => {
    it('should show significant different in churn when competitor yield is high', () => {
        // 1. Run Baseline
        const baselineResults = runSimulation(BASELINE_PARAMS);
        const lastBaseline = baselineResults[baselineResults.length - 1];
        const baselineChurn = lastBaseline.churnCount.mean;
        const baselineProviders = lastBaseline.providers.mean;

        console.log(`[Baseline] Churn: ${baselineChurn}, Providers: ${baselineProviders}`);

        // 2. Run Vampire Attack
        const ATTACK_PARAMS = { ...BASELINE_PARAMS, competitorYield: 5.0 }; // Extreme yield to force churnvantage
        const attackResults = runSimulation(ATTACK_PARAMS);
        const lastAttack = attackResults[attackResults.length - 1];
        const attackChurn = lastAttack.churnCount.mean;
        const attackProviders = lastAttack.providers.mean;

        console.log(`[Attack] Churn: ${attackChurn}, Providers: ${attackProviders}`);

        // 3. Assert Impact
        // Should have MORE churn and FEWER providers
        // Currently expected to FAIL (be equal)
        const churnDelta = attackChurn - baselineChurn;

        console.log(`[Delta] Churn Increase: ${churnDelta}`);

        // We expect Providers to be wiped out (or significantly lower)
        console.log(`[Differences] Providers: ${baselineProviders} -> ${attackProviders}`);
        if (baselineProviders > 100) {
            expect(attackProviders).toBeLessThan(baselineProviders * 0.1); // At least 90% drop
        } else {
            expect(attackProviders).toBe(0);
        }
    });
});
