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
        const fastParams = { ...baseParams, nSims: 8 };

        if (targetMetric === 'solvency') {
            // In this model, higher price can increase dilution pressure (USD value of fixed token emissions).
            // Search for the HIGHEST price that still clears the solvency threshold.
            const probes = [0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000];

            const passesThreshold = (price: number): boolean => {
                fastParams.initialPrice = price;
                const results = runSimulation(fastParams);
                const minSolvency = Math.min(...results.map(r => r.solvencyScore.mean));
                return minSolvency >= threshold;
            };

            let bestPassing = probes[0];
            let foundPassing = false;
            let lowerBound = probes[0];
            let upperBound = probes[probes.length - 1];
            let foundBracket = false;

            for (const probe of probes) {
                const pass = passesThreshold(probe);
                if (pass) {
                    bestPassing = probe;
                    lowerBound = probe;
                    foundPassing = true;
                    continue;
                }
                if (foundPassing) {
                    upperBound = probe;
                    foundBracket = true;
                    break;
                }
            }

            if (!foundPassing) {
                return parseFloat(probes[0].toFixed(6));
            }

            if (!foundBracket) {
                return parseFloat(bestPassing.toFixed(6));
            }

            let bestPrice = bestPassing;
            for (let i = 0; i < 18; i++) {
                const mid = (lowerBound + upperBound) / 2;
                if (passesThreshold(mid)) {
                    bestPrice = mid;
                    lowerBound = mid;
                } else {
                    upperBound = mid;
                }
            }

            return bestPrice;
        }

        // Profit target keeps the original search direction: find minimum price that clears threshold.
        let low = 0.01;
        let high = 1000.0;
        let bestPrice = high;

        for (let i = 0; i < 15; i++) {
            const mid = (low + high) / 2;
            fastParams.initialPrice = mid;

            const results = runSimulation(fastParams);
            const avgProfit = results.reduce((sum, r) => sum + r.profit.mean, 0) / results.length;
            const isPassing = avgProfit >= threshold;

            if (isPassing) {
                bestPrice = mid;
                high = mid;
            } else {
                low = mid;
            }
        }

        return parseFloat(bestPrice.toFixed(2));
    }

    /**
     * Finds the MAXIMUM Initial Providers the network can support before Solvency < 1.0
     * (Scale Limit Test)
     */
    static findMaxScalableSupply(baseParams: SimulationParams): number {
        const fastParams = { ...baseParams, nSims: 8 };

        const evaluate = (initialProviders: number) => {
            const results = runSimulation({ ...fastParams, initialProviders });
            const finalProviders = results[results.length - 1].providers.mean;
            const retentionRatio = finalProviders / Math.max(initialProviders, 1);
            return { initialProviders, finalProviders, retentionRatio };
        };

        const searchCap = Math.max(1000, Math.floor(baseParams.initialProviders * 10));
        const coarseCandidates = [
            1, 2, 5, 10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 300, 500, 800, 1000
        ];
        const multipliers = [
            0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 2, 3, 4, 5, 7.5, 10
        ];

        const candidateSet = new Set<number>(coarseCandidates);
        for (const multiplier of multipliers) {
            candidateSet.add(Math.max(1, Math.floor(baseParams.initialProviders * multiplier)));
        }

        const candidates = Array.from(candidateSet)
            .filter((value) => value <= searchCap)
            .sort((a, b) => a - b);

        let bestFeasible: { initialProviders: number; finalProviders: number; retentionRatio: number } | null = null;
        let bestFallback: { initialProviders: number; finalProviders: number; retentionRatio: number } | null = null;

        for (const candidate of candidates) {
            const score = evaluate(candidate);

            if (
                bestFallback === null ||
                score.retentionRatio > bestFallback.retentionRatio ||
                (score.retentionRatio === bestFallback.retentionRatio && score.initialProviders > bestFallback.initialProviders)
            ) {
                bestFallback = score;
            }

            if (score.retentionRatio >= 1) {
                if (bestFeasible === null || score.initialProviders > bestFeasible.initialProviders) {
                    bestFeasible = score;
                }
            }
        }

        const selected = bestFeasible ?? bestFallback;
        const maxScale = selected ? selected.initialProviders : Math.max(1, Math.floor(baseParams.initialProviders));
        console.log(`[Optimizer] Max Scale: ${maxScale}`);
        return maxScale;
    }

    /**
     * Finds the MINIMUM Emissions (Max Mint Weekly) needed to keep churn low
     * against a high competitor yield. (Retention / Defense Test)
     */
    static findRetentionAPY(baseParams: SimulationParams): number {
        // If no competitor, no need to defend.
        if (baseParams.competitorYield <= 0) return baseParams.maxMintWeekly;

        const fastParams = { ...baseParams, nSims: 8 };
        const baselineRun = runSimulation(fastParams);
        const baselineChurnRate =
            baselineRun.reduce((sum, r) => sum + r.churnCount.mean, 0) / Math.max(baseParams.initialProviders, 1);
        const baselineFinalProviders = baselineRun[baselineRun.length - 1].providers.mean;

        const minEmission = 100;
        const maxEmission = Math.max(minEmission, baseParams.maxMintWeekly * 20);
        const multipliers = [0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 5, 8, 12, 20];
        const candidates = Array.from(
            new Set(
                multipliers.map((m) =>
                    Math.floor(
                        Math.max(minEmission, Math.min(maxEmission, baseParams.maxMintWeekly * m))
                    )
                )
            )
        ).sort((a, b) => a - b);

        let bestFallback = {
            emission: Math.floor(baseParams.maxMintWeekly),
            churnRate: baselineChurnRate,
            finalProviders: baselineFinalProviders
        };
        let bestFeasible: typeof bestFallback | null = null;

        for (const emission of candidates) {
            const results = runSimulation({ ...fastParams, maxMintWeekly: emission });
            const churnRate =
                results.reduce((sum, r) => sum + r.churnCount.mean, 0) / Math.max(baseParams.initialProviders, 1);
            const finalProviders = results[results.length - 1].providers.mean;

            if (
                churnRate < bestFallback.churnRate ||
                (churnRate === bestFallback.churnRate && finalProviders > bestFallback.finalProviders)
            ) {
                bestFallback = { emission, churnRate, finalProviders };
            }

            const improvesChurn = churnRate <= baselineChurnRate;
            const preservesEndState = finalProviders >= baselineFinalProviders;

            if (improvesChurn && preservesEndState) {
                if (bestFeasible === null || emission < bestFeasible.emission) {
                    bestFeasible = { emission, churnRate, finalProviders };
                }
            }
        }

        return bestFeasible ? bestFeasible.emission : bestFallback.emission;
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
