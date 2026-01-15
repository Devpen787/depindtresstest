/**
 * Simulation Engine Adapter
 * 
 * This adapter layer bridges the legacy engine (engine.ts) with the new
 * simulation.ts, ensuring consistent behavior across the codebase.
 * 
 * CONSOLIDATION STATUS:
 * - UI currently uses: engine.ts (LegacySimulationParams, simulateOne)
 * - Tests use: simulation.ts
 * - Python Parity: matches engine.ts logic
 * 
 * RECOMMENDATION: Continue using engine.ts as the primary engine.
 * simulation.ts should be deprecated or refactored to wrap engine.ts.
 */

import {
    LegacySimulationParams,
    LegacySimResult,
    LegacyAggregateResult,
    simulateOne
} from './legacy/engine';

// Re-export for unified access
export type SimulationParams = LegacySimulationParams;
export type SimResult = LegacySimResult;
export type AggregateResult = LegacyAggregateResult;

export { simulateOne };

/**
 * Default simulation parameters
 * Centralized here for consistency across UI, tests, and parity checks.
 */
export const DEFAULT_SIMULATION_PARAMS: Partial<SimulationParams> = {
    T: 52,
    nSims: 25,
    initialSupply: 250_000_000,
    initialPrice: 0.05,
    initialProviders: 100,
    maxMintWeekly: 10_000_000,
    burnPct: 0.3,
    initialLiquidity: 500_000,
    investorUnlockWeek: 26,
    investorSellPct: 0.15,
    demandType: 'consistent' as const,
    macro: 'sideways' as const,
    seed: 42,
    providerCostPerWeek: 50,
    baseCapacityPerProvider: 100,
    kDemandPrice: 0.1,
    kMintPrice: 0.05,
    rewardLagWeeks: 2,
    churnThreshold: -100,
    hardwareCost: 500,
    competitorYield: 0,
    emissionModel: 'fixed',
    revenueStrategy: 'burn'
};

/**
 * Run a full Monte Carlo simulation with aggregation
 */
export function runSimulation(
    params: SimulationParams,
    onProgress?: (pct: number) => void
): LegacyAggregateResult[] {
    const allResults: LegacySimResult[][] = [];

    for (let i = 0; i < params.nSims; i++) {
        const simSeed = params.seed + i;
        const results = simulateOne(params, simSeed);
        allResults.push(results);

        if (onProgress) {
            onProgress((i + 1) / params.nSims);
        }
    }

    return aggregateResults(allResults, params.T);
}

/**
 * Aggregate multiple simulation runs into statistical summaries
 */
function aggregateResults(allResults: LegacySimResult[][], T: number): LegacyAggregateResult[] {
    const aggregated: LegacyAggregateResult[] = [];

    for (let t = 0; t < T; t++) {
        const weekResults = allResults.map(run => run[t]).filter(Boolean);

        aggregated.push({
            t,
            price: calcStats(weekResults.map(r => r.price)),
            supply: calcStats(weekResults.map(r => r.supply)),
            demand: calcStats(weekResults.map(r => r.demand)),
            demand_served: calcStats(weekResults.map(r => r.demand_served)),
            providers: calcStats(weekResults.map(r => r.providers)),
            capacity: calcStats(weekResults.map(r => r.capacity)),
            servicePrice: calcStats(weekResults.map(r => r.servicePrice)),
            minted: calcStats(weekResults.map(r => r.minted)),
            burned: calcStats(weekResults.map(r => r.burned)),
            utilization: calcStats(weekResults.map(r => r.utilization)),
            profit: calcStats(weekResults.map(r => r.profit)),
            scarcity: calcStats(weekResults.map(r => r.scarcity)),
            incentive: calcStats(weekResults.map(r => r.incentive)),
            solvencyScore: calcStats(weekResults.map(r => r.solvencyScore)),
            netDailyLoss: calcStats(weekResults.map(r => r.netDailyLoss)),
            dailyMintUsd: calcStats(weekResults.map(r => r.dailyMintUsd)),
            dailyBurnUsd: calcStats(weekResults.map(r => r.dailyBurnUsd)),
            netFlow: calcStats(weekResults.map(r => r.netFlow)),
            churnCount: calcStats(weekResults.map(r => r.churnCount)),
            joinCount: calcStats(weekResults.map(r => r.joinCount)),
            treasuryBalance: calcStats(weekResults.map(r => r.treasuryBalance)),
            vampireChurn: calcStats(weekResults.map(r => r.vampireChurn))
        });
    }

    return aggregated;
}

/**
 * Calculate statistics for a set of values
 */
function calcStats(values: number[]): import('./types').MetricStats {
    const n = values.length;
    if (n === 0) return { mean: 0, p10: 0, p90: 0, min: 0, max: 0, stdDev: 0, ci95_lower: 0, ci95_upper: 0 };

    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, x) => sum + (x - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);

    const marginOfError = 1.96 * (stdDev / Math.sqrt(n));

    return {
        mean,
        p10: sorted[Math.floor(n * 0.1)] || 0,
        p90: sorted[Math.floor(n * 0.9)] || 0,
        min: sorted[0],
        max: sorted[n - 1],
        stdDev,
        ci95_lower: mean - marginOfError,
        ci95_upper: mean + marginOfError
    };
}
