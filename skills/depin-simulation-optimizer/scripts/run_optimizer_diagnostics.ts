import fs from 'fs';
import path from 'path';
import { runSimulation } from '../../../src/model/simulation.ts';
import type { SimulationParams, AggregateResult } from '../../../src/model/types.ts';
import { GENERATED_PROTOCOL_PROFILES } from '../../../src/data/generated/protocolProfiles.generated.ts';
import { getProtocolRuntimeCalibration } from '../../../src/data/protocolRuntimeCalibrations.ts';

type Mode = 'quick' | 'full';

interface CliOptions {
    mode: Mode;
    profileId?: string;
    outputDir: string;
}

interface BaselineSummary {
    minSolvency: number;
    finalSolvency: number;
    finalProviders: number;
    finalPrice: number;
}

interface ProtocolProfileV1 {
    metadata: {
        id: string;
        name: string;
    };
    parameters: {
        supply: { value: number };
        emissions: { value: number };
        burn_fraction: { value: number };
        adjustment_lag: { value: number };
        demand_regime: { value: SimulationParams['demandType'] };
        provider_economics: {
            opex_weekly: { value: number };
            churn_threshold: { value: number };
        };
        initial_active_providers: { value: number };
        initial_price: { value: number };
        hardware_cost: { value: number };
        pro_tier_pct?: { value: number };
    };
}

const PROTOCOL_PROFILES = GENERATED_PROTOCOL_PROFILES as ProtocolProfileV1[];

class OptimizerMirror {
    static findBreakEvenPrice(
        baseParams: SimulationParams,
        targetMetric: 'solvency' | 'profit' = 'solvency',
        threshold = 1.0
    ): number {
        const fastParams = { ...baseParams, nSims: 8 };

        if (targetMetric === 'solvency') {
            const probes = [0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000];

            const passesThreshold = (price: number): boolean => {
                fastParams.initialPrice = price;
                const results = runSimulation(fastParams);
                const minSolvency = Math.min(...results.map((point) => point.solvencyScore.mean));
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
                return Number(probes[0].toFixed(6));
            }

            if (!foundBracket) {
                return Number(bestPassing.toFixed(6));
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

        let low = 0.01;
        let high = 1000.0;
        let bestPrice = high;

        for (let i = 0; i < 15; i++) {
            const mid = (low + high) / 2;
            fastParams.initialPrice = mid;
            const results = runSimulation(fastParams);

            const avgProfit = results.reduce((sum, point) => sum + point.profit.mean, 0) / results.length;
            const isPassing = avgProfit >= threshold;

            if (isPassing) {
                bestPrice = mid;
                high = mid;
            } else {
                low = mid;
            }
        }

        return Number(bestPrice.toFixed(2));
    }

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
        return selected ? selected.initialProviders : Math.max(1, Math.floor(baseParams.initialProviders));
    }

    static findRetentionAPY(baseParams: SimulationParams): number {
        if (baseParams.competitorYield <= 0) {
            return baseParams.maxMintWeekly;
        }

        const fastParams = { ...baseParams, nSims: 8 };
        const baselineRun = runSimulation(fastParams);
        const baselineChurnRate =
            baselineRun.reduce((sum, point) => sum + point.churnCount.mean, 0) /
            Math.max(baseParams.initialProviders, 1);
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
                results.reduce((sum, point) => sum + point.churnCount.mean, 0) /
                Math.max(baseParams.initialProviders, 1);
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

    static runSensitivitySweep(baseParams: SimulationParams): { parameter: string; low: number; high: number; delta: number }[] {
        const factors = [
            { key: 'hardwareCost', label: 'Hardware CapEx' },
            { key: 'churnThreshold', label: 'Churn Sensitivity' },
            { key: 'maxMintWeekly', label: 'Emission Cap' },
            { key: 'kBuyPressure', label: 'Demand Strength' },
            { key: 'kMintPrice', label: 'Dilution Sensitivity' }
        ] as const;

        const fastParams = { ...baseParams, nSims: 1 };
        const runBase = runSimulation(fastParams);

        const getMetric = (run: AggregateResult[]) => {
            const sum = run.reduce((acc, point) => acc + point.solvencyScore.mean, 0);
            return sum / run.length;
        };

        const baseMetric = getMetric(runBase);
        if (!Number.isFinite(baseMetric)) {
            return [];
        }

        const results: Array<{ parameter: string; low: number; high: number; delta: number }> = [];

        for (const factor of factors) {
            const paramsLow = {
                ...fastParams,
                [factor.key]: ((baseParams as unknown as Record<string, number>)[factor.key] ?? 0) * 0.8
            } as SimulationParams;
            const paramsHigh = {
                ...fastParams,
                [factor.key]: ((baseParams as unknown as Record<string, number>)[factor.key] ?? 0) * 1.2
            } as SimulationParams;

            const lowMetric = getMetric(runSimulation(paramsLow));
            const highMetric = getMetric(runSimulation(paramsHigh));
            const delta = Math.abs(highMetric - lowMetric);

            results.push({
                parameter: factor.label,
                low: lowMetric,
                high: highMetric,
                delta: Number(delta.toFixed(2))
            });
        }

        return results.sort((a, b) => b.delta - a.delta);
    }
}

function parseArgs(argv: string[]): CliOptions {
    const options: CliOptions = {
        mode: 'quick',
        outputDir: path.join(process.cwd(), 'output/skill_reports')
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--mode') {
            const value = argv[i + 1];
            if (value !== 'quick' && value !== 'full') {
                throw new Error(`Invalid --mode value: ${value}`);
            }
            options.mode = value;
            i += 1;
            continue;
        }
        if (arg === '--profile') {
            options.profileId = argv[i + 1];
            i += 1;
            continue;
        }
        if (arg === '--output-dir') {
            options.outputDir = argv[i + 1];
            i += 1;
            continue;
        }
    }

    return options;
}

function resolveProfile(profileId?: string): ProtocolProfileV1 {
    if (!profileId) {
        return PROTOCOL_PROFILES[0];
    }

    const profile = PROTOCOL_PROFILES.find((candidate) => candidate.metadata.id === profileId);
    if (!profile) {
        const ids = PROTOCOL_PROFILES.map((candidate) => candidate.metadata.id).join(', ');
        throw new Error(`Profile "${profileId}" not found. Available IDs: ${ids}`);
    }

    return profile;
}

function buildParams(profile: ProtocolProfileV1, mode: Mode): SimulationParams {
    const nSims = mode === 'quick' ? 8 : 25;
    const horizon = mode === 'quick' ? 26 : 52;
    const runtimeCalibration = getProtocolRuntimeCalibration(profile.metadata.id);
    const baseDemand = Math.max(
        12_000,
        Math.round(profile.parameters.initial_active_providers.value * 180 * 0.65)
    );

    return {
        T: horizon,
        initialSupply: profile.parameters.supply.value,
        initialPrice: Math.max(0.01, profile.parameters.initial_price.value),
        maxMintWeekly: profile.parameters.emissions.value,
        burnPct: profile.parameters.burn_fraction.value,
        initialLiquidity: 500_000,
        investorUnlockWeek: 26,
        investorSellPct: 0.05,
        scenario: 'baseline',
        demandType: profile.parameters.demand_regime.value,
        baseDemand,
        demandVolatility: 0.05,
        macro: 'sideways',
        initialProviders: profile.parameters.initial_active_providers.value,
        baseCapacityPerProvider: 180,
        capacityStdDev: 0.2,
        providerCostPerWeek: profile.parameters.provider_economics.opex_weekly.value,
        costStdDev: 0.15,
        hardwareLeadTime: 2,
        churnThreshold: profile.parameters.provider_economics.churn_threshold.value,
        profitThresholdToJoin: 15,
        maxProviderGrowthRate: 0.15,
        maxProviderChurnRate: 0.10,
        kBuyPressure: runtimeCalibration.kBuyPressure ?? 0.08,
        kSellPressure: runtimeCalibration.kSellPressure ?? 0.12,
        kDemandPrice: runtimeCalibration.kDemandPrice ?? 0.15,
        kMintPrice: runtimeCalibration.kMintPrice ?? 0.35,
        baseServicePrice: runtimeCalibration.baseServicePrice ?? 0.5,
        servicePriceElasticity: runtimeCalibration.servicePriceElasticity ?? 0.6,
        minServicePrice: 0.05,
        maxServicePrice: 5.0,
        rewardLagWeeks: profile.parameters.adjustment_lag.value,
        nSims,
        seed: 42,
        competitorYield: 0,
        emissionModel: 'fixed',
        revenueStrategy: 'burn',
        hardwareCost: profile.parameters.hardware_cost.value,
        proTierPct: profile.parameters.pro_tier_pct?.value || 0,
        proTierEfficiency: 1.5,
        sybilAttackEnabled: false,
        sybilSize: 0
    };
}

function round(value: number, precision = 4): number {
    const base = 10 ** precision;
    return Math.round(value * base) / base;
}

function summarizeBaseline(results: AggregateResult[]): BaselineSummary {
    const finalPoint = results[results.length - 1];
    const minSolvency = Math.min(...results.map((point) => point.solvencyScore.mean));
    return {
        minSolvency: round(minSolvency),
        finalSolvency: round(finalPoint.solvencyScore.mean),
        finalProviders: round(finalPoint.providers.mean, 2),
        finalPrice: round(finalPoint.price.mean, 6)
    };
}

function computeChurnRate(results: AggregateResult[], initialProviders: number): number {
    const totalChurn = results.reduce((acc, point) => acc + point.churnCount.mean, 0);
    if (initialProviders <= 0) {
        return 0;
    }
    return totalChurn / initialProviders;
}

function computeFinalProviders(results: AggregateResult[]): number {
    if (results.length === 0) {
        return 0;
    }
    return results[results.length - 1].providers.mean;
}

function ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function buildMarkdownReport(payload: any): string {
    return [
        '# DePIN Simulation Optimizer Diagnostics',
        '',
        `- Generated: ${payload.generatedAt}`,
        `- Profile: ${payload.profile.id} (${payload.profile.name})`,
        `- Mode: ${payload.mode}`,
        '',
        '## Baseline',
        `- Min Solvency: ${payload.baseline.minSolvency}`,
        `- Final Solvency: ${payload.baseline.finalSolvency}`,
        `- Final Providers: ${payload.baseline.finalProviders}`,
        `- Final Price: ${payload.baseline.finalPrice}`,
        '',
        '## Optimizer Checks',
        `- Break-even price: ${payload.optimizer.breakEven.suggestedPrice}`,
        `- Break-even min solvency at suggested price: ${payload.optimizer.breakEven.minSolvencyAtSuggestedPrice}`,
        `- Break-even threshold met: ${payload.optimizer.breakEven.isThresholdMetAtSuggestedPrice}`,
        `- Max scalable providers: ${payload.optimizer.scale.maxProviders}`,
        `- Min solvency at max scale: ${payload.optimizer.scale.minSolvencyAtMaxScale}`,
        `- Min solvency at +10% scale: ${payload.optimizer.scale.minSolvencyAtStressScale}`,
        `- Retention ratio at max scale: ${payload.optimizer.scale.retentionRatioAtMaxScale}`,
        `- Retention ratio at +10% scale: ${payload.optimizer.scale.retentionRatioAtStressScale}`,
        `- Defense emission (threat ${payload.optimizer.defense.threatYield}): ${payload.optimizer.defense.suggestedEmission}`,
        `- Baseline churn rate under threat: ${payload.optimizer.defense.baselineChurnRate}`,
        `- Optimized churn rate under threat: ${payload.optimizer.defense.optimizedChurnRate}`,
        `- Defense improved churn: ${payload.optimizer.defense.improvedVsBaseline}`,
        '',
        '## Top Sensitivity Factors',
        ...payload.optimizer.sensitivityTop.map(
            (entry: any, idx: number) => `${idx + 1}. ${entry.parameter} (delta=${entry.delta}, low=${entry.low}, high=${entry.high})`
        ),
        '',
        '## Flags',
        ...payload.flags.map((flag: string) => `- ${flag}`)
    ].join('\n');
}

function main(): void {
    const options = parseArgs(process.argv.slice(2));
    const profile = resolveProfile(options.profileId);
    const baseParams = buildParams(profile, options.mode);

    const baselineResults = runSimulation(baseParams);
    const baseline = summarizeBaseline(baselineResults);

    const breakEvenPrice = OptimizerMirror.findBreakEvenPrice(baseParams, 'solvency', 1.0);
    const breakEvenValidation = runSimulation({
        ...baseParams,
        initialPrice: breakEvenPrice,
        nSims: Math.min(8, baseParams.nSims)
    });
    const breakEvenMinSolvency = Math.min(...breakEvenValidation.map((point) => point.solvencyScore.mean));

    const maxScale = OptimizerMirror.findMaxScalableSupply(baseParams);
    const maxScaleValidation = runSimulation({
        ...baseParams,
        initialProviders: maxScale,
        nSims: Math.min(8, baseParams.nSims)
    });
    const stressScaleProviders = Math.max(maxScale + 1, Math.floor(maxScale * 1.1));
    const stressScaleValidation = runSimulation({
        ...baseParams,
        initialProviders: stressScaleProviders,
        nSims: Math.min(8, baseParams.nSims)
    });

    const threatYield = 0.5;
    const suggestedEmission = OptimizerMirror.findRetentionAPY({
        ...baseParams,
        competitorYield: threatYield
    });
    const defenseBaselineRun = runSimulation({
        ...baseParams,
        competitorYield: threatYield,
        nSims: Math.min(8, baseParams.nSims)
    });
    const defenseOptimizedRun = runSimulation({
        ...baseParams,
        competitorYield: threatYield,
        maxMintWeekly: suggestedEmission,
        nSims: Math.min(8, baseParams.nSims)
    });
    const baselineChurnRate = computeChurnRate(defenseBaselineRun, baseParams.initialProviders);
    const optimizedChurnRate = computeChurnRate(defenseOptimizedRun, baseParams.initialProviders);

    const sensitivityTop = OptimizerMirror.runSensitivitySweep(baseParams).slice(0, 5).map((entry) => ({
        parameter: entry.parameter,
        low: round(entry.low),
        high: round(entry.high),
        delta: round(entry.delta)
    }));

    const payload = {
        generatedAt: new Date().toISOString(),
        profile: {
            id: profile.metadata.id,
            name: profile.metadata.name
        },
        mode: options.mode,
        baseline,
        optimizer: {
            breakEven: {
                suggestedPrice: round(breakEvenPrice, 6),
                minSolvencyAtSuggestedPrice: round(breakEvenMinSolvency),
                isThresholdMetAtSuggestedPrice: breakEvenMinSolvency >= 1.0
            },
            scale: {
                maxProviders: maxScale,
                minSolvencyAtMaxScale: round(Math.min(...maxScaleValidation.map((point) => point.solvencyScore.mean))),
                minSolvencyAtStressScale: round(Math.min(...stressScaleValidation.map((point) => point.solvencyScore.mean))),
                finalProvidersAtMaxScale: round(computeFinalProviders(maxScaleValidation), 2),
                finalProvidersAtStressScale: round(computeFinalProviders(stressScaleValidation), 2),
                retentionRatioAtMaxScale: round(computeFinalProviders(maxScaleValidation) / Math.max(maxScale, 1), 4),
                retentionRatioAtStressScale: round(
                    computeFinalProviders(stressScaleValidation) / Math.max(stressScaleProviders, 1),
                    4
                )
            },
            defense: {
                threatYield,
                suggestedEmission: Math.floor(suggestedEmission),
                baselineChurnRate: round(baselineChurnRate),
                optimizedChurnRate: round(optimizedChurnRate),
                improvedVsBaseline: optimizedChurnRate <= baselineChurnRate
            },
            sensitivityTop
        },
        flags: [] as string[]
    };

    if (!payload.optimizer.breakEven.isThresholdMetAtSuggestedPrice) {
        payload.flags.push('Break-even threshold is not met at suggested price.');
    }
    if (!payload.optimizer.defense.improvedVsBaseline) {
        payload.flags.push('Defense emission did not reduce churn versus baseline threat run.');
    }
    if (payload.optimizer.scale.retentionRatioAtStressScale >= (payload.optimizer.scale.retentionRatioAtMaxScale - 0.01)) {
        payload.flags.push('Scale stress check did not degrade retention as expected; verify scale boundary assumptions.');
    }
    if (payload.flags.length === 0) {
        payload.flags.push('No immediate optimizer regressions detected in this run.');
    }

    ensureDir(options.outputDir);
    const safeProfile = profile.metadata.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const baseName = `${safeProfile}_${options.mode}_report`;
    const jsonPath = path.join(options.outputDir, `${baseName}.json`);
    const mdPath = path.join(options.outputDir, `${baseName}.md`);

    fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
    fs.writeFileSync(mdPath, `${buildMarkdownReport(payload)}\n`, 'utf-8');

    console.log(`Diagnostics complete for ${profile.metadata.id}`);
    console.log(`Markdown report: ${mdPath}`);
    console.log(`JSON report: ${jsonPath}`);
}

main();
