import { runSimulation } from './index';
import { SimulationParams, AggregateResult } from './types';

export class Optimizer {
    /**
     * Finds the lowest initialPrice where the protocol remains solvent (Solvency > 1.0)
     * binary search.
     */
    static findBreakEvenPrice(
        baseParams: SimulationParams,
        targetMetric: 'solvency' | 'profit' = 'solvency',
        threshold: number = 1.0 // Deflationary Break Even > 1.0 (Burn > Mint)
    ): number {
        let low = 0.01;
        let high = 1000.0;
        let bestPrice = high;

        const fastParams = { ...baseParams, nSims: 5 };

        for (let i = 0; i < 15; i++) {
            const mid = (low + high) / 2;
            fastParams.initialPrice = mid;

            const results = runSimulation(fastParams);

            let isPassing = false;

            if (targetMetric === 'solvency') {
                // Check minimum weekly solvency (avoid any insolvency periods)
                const minSolvency = Math.min(...results.map(r => r.solvencyScore.mean));
                isPassing = minSolvency >= threshold;
            } else {
                const avgProfit = results.reduce((sum, r) => sum + r.profit.mean, 0) / results.length;
                isPassing = avgProfit >= threshold;
            }

            if (isPassing) {
                bestPrice = mid;
                high = mid; // Try lower
            } else {
                low = mid; // Need higher
            }
        }

        return parseFloat(bestPrice.toFixed(2));
    }

    /**
     * Finds the MAXIMUM Initial Providers the network can support before Solvency < 1.0
     * (Scale Limit Test)
     */
    static findMaxScalableSupply(baseParams: SimulationParams): number {
        let low = 100;
        let high = 5_000_000;
        let bestScale = low;

        const fastParams = { ...baseParams, nSims: 5 };

        for (let i = 0; i < 15; i++) {
            const mid = Math.floor((low + high) / 2);
            fastParams.initialProviders = mid;

            const results = runSimulation(fastParams);

            // Pass if Solvency > 1.0
            const minSolvency = Math.min(...results.map(r => r.solvencyScore.mean));
            const isPassing = minSolvency >= 1.0;

            if (isPassing) {
                bestScale = mid;
                low = mid; // Try higher (maximize)
            } else {
                high = mid; // Too big, scale down
            }
        }
        console.log(`[Optimizer] Max Scale: ${bestScale}`);
        return bestScale;
    }

    /**
     * Finds the MINIMUM Emissions (Max Mint Weekly) needed to keep churn low
     * against a high competitor yield. (Retention / Defense Test)
     */
    static findRetentionAPY(baseParams: SimulationParams): number {
        // If no competitor, no need to defend.
        if (baseParams.competitorYield <= 0) return baseParams.maxMintWeekly;

        let low = baseParams.maxMintWeekly; // Can't go lower than current if currently losing nodes? Actually we can.
        // Let's assume we search from 0 to 10x current.
        low = 100;
        let high = baseParams.maxMintWeekly * 20;
        let bestEmission = high; // Default to paying a lot to be safe

        const fastParams = { ...baseParams, nSims: 5 };

        for (let i = 0; i < 15; i++) {
            const mid = (low + high) / 2;
            fastParams.maxMintWeekly = mid;

            const results = runSimulation(fastParams);

            // Pass if total Churn < 5% of initial
            // Vampire Churn is logged in `vampireChurn`.
            // We want to minimize `vampireChurn` or `churnCount`.
            const totalChurn = results.reduce((sum, r) => sum + r.churnCount.mean, 0);
            const initial = baseParams.initialProviders;
            const churnRate = totalChurn / initial;

            const isPassing = churnRate < 0.10; // Allow max 10% churn over the period

            if (isPassing) {
                bestEmission = mid;
                high = mid; // Try lower emission (optimize cost)
            } else {
                low = mid; // Need more emission
            }
        }
        return Math.floor(bestEmission);
    }

    /**
     * [THESIS GAP #1] Sensitivity Analysis (Tornado Chart)
     * Sweeps key parameters +/- 20% to measure impact on Solvency.
     * Enforces nSims=1 for performance.
     */
    static runSensitivitySweep(baseParams: SimulationParams): { parameter: string; low: number; high: number; delta: number }[] {
        const factors = [
            { key: 'hardwareCost', label: 'Hardware CapEx' },
            { key: 'churnThreshold', label: 'Churn Sensitivity' },
            { key: 'maxMintWeekly', label: 'Emission Cap' },
            { key: 'kBuyPressure', label: 'Demand Strength' },
            { key: 'kMintPrice', label: 'Dilution Sensitivity' }
        ];

        // 1. Calculate Base solvency magnitude
        // 1. Calculate Base metric (Payback Period in Months)
        const fastParams = { ...baseParams, nSims: 1 };
        const runBase = runSimulation(fastParams);
        const lastResultBase = runBase[runBase.length - 1]; // Single Run result

        // 2. Metric: Impact on Solvency (Survival)
        const getMetric = (run: AggregateResult[]) => {
            // Use Average Solvency to capture duration/health even if it eventually crashes
            const sum = run.reduce((acc, r) => acc + r.solvencyScore.mean, 0);
            return sum / run.length;
        };

        const baseMetric = getMetric(runBase);

        const results = [];

        for (const factor of factors) {
            // Test Low (-20%)
            const paramsLow = { ...fastParams, [factor.key]: (baseParams as any)[factor.key] * 0.8 };
            const runLow = runSimulation(paramsLow);
            const lowMetric = getMetric(runLow);

            // Test High (+20%)
            const paramsHigh = { ...fastParams, [factor.key]: (baseParams as any)[factor.key] * 1.2 };
            const runHigh = runSimulation(paramsHigh);
            const highMetric = getMetric(runHigh);

            // Delta is the absolute range of impact
            const delta = Math.abs(highMetric - lowMetric);

            results.push({
                parameter: factor.label,
                low: lowMetric,
                high: highMetric,
                delta: parseFloat(delta.toFixed(2))
            });
        }

        // Sort by impact (highest delta first)
        return results.sort((a, b) => b.delta - a.delta);
    }
}
