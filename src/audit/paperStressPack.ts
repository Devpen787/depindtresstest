import { simulateOne } from '../model/simulation.ts';
import type { SimResult, SimulationParams } from '../model/types.ts';

export const PAPER_STRESS_RUNS_PER_CELL = 30;
export const PAPER_FAILURE_THRESHOLD = 0.01;
export const PAPER_VOLATILITY_LEVELS = [0.03, 0.1, 0.2, 0.35, 0.5];
export const PAPER_DEBT_RATIO_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.25];

export type HeatBand = 'GREEN' | 'YELLOW' | 'RED';

export interface PaperStressRunOutcome {
  maxUnderwaterShare: number;
  finalSolvencyDeficit: number;
  finalProviderCollapseShare: number;
  finalSolvencyScore: number;
  finalPrice: number;
  finalProviders: number;
  liquidatableFailure: boolean;
  insolvencyFailure: boolean;
}

export interface PaperStressCell {
  debtRatio: number;
  demandVolatility: number;
  runCount: number;
  liquidatableFailureRate: number;
  insolvencyFailureRate: number;
  avgMaxUnderwaterShare: number;
  avgFinalSolvencyDeficit: number;
  avgFinalProviderCollapseShare: number;
  avgFinalSolvencyScore: number;
  avgFinalPrice: number;
  avgFinalProviders: number;
}

export interface PaperStressMatrixReport {
  generatedAtIso: string;
  runsPerCell: number;
  failureThreshold: number;
  debtRatios: number[];
  demandVolatilityLevels: number[];
  cells: PaperStressCell[];
  liquidatableHeatmap: number[][];
  insolvencyHeatmap: number[][];
}

interface MatrixOptions {
  baseParams?: Partial<SimulationParams>;
  demandVolatilityLevels?: number[];
  debtRatios?: number[];
  runsPerCell?: number;
  failureThreshold?: number;
  seedBase?: number;
}

function mean(values: number[]): number {
  if (!values || values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

export function buildPaperStressBaseParams(overrides: Partial<SimulationParams> = {}): SimulationParams {
  return {
    T: 52,
    initialSupply: 100_000_000,
    initialPrice: 1.0,
    maxMintWeekly: 500_000,
    burnPct: 0.1,
    initialLiquidity: 5_000_000,
    investorUnlockWeek: 100,
    investorSellPct: 0,
    scenario: 'baseline',
    demandType: 'growth',
    baseDemand: 10_000,
    demandVolatility: 0.1,
    macro: 'sideways',
    initialProviders: 1_000,
    baseCapacityPerProvider: 100,
    capacityStdDev: 0.2,
    providerCostPerWeek: 60,
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
    nSims: 1,
    seed: 12_345,
    competitorYield: 0,
    emissionModel: 'fixed',
    revenueStrategy: 'burn',
    networkEffectsEnabled: false,
    hardwareCost: 1_000,
    growthCallEventWeek: undefined,
    growthCallEventPct: undefined,
    proTierPct: 0.2,
    proTierEfficiency: 1.5,
    sybilAttackEnabled: false,
    sybilSize: 0,
    ...overrides,
  };
}

export function evaluatePaperStressRun(
  results: SimResult[],
  failureThreshold: number = PAPER_FAILURE_THRESHOLD,
): PaperStressRunOutcome {
  if (!results || results.length === 0) {
    return {
      maxUnderwaterShare: 0,
      finalSolvencyDeficit: 0,
      finalProviderCollapseShare: 0,
      finalSolvencyScore: 0,
      finalPrice: 0,
      finalProviders: 0,
      liquidatableFailure: false,
      insolvencyFailure: false,
    };
  }

  let maxUnderwaterShare = 0;
  for (const step of results) {
    const share = step.providers > 0 ? step.underwaterCount / step.providers : 0;
    if (share > maxUnderwaterShare) {
      maxUnderwaterShare = share;
    }
  }

  const final = results[results.length - 1];
  const baselineProviders = Math.max(results[0]?.providers ?? final.providers ?? 1, 1);
  const finalProviderCollapseShare = Math.max(0, 1 - (final.providers / baselineProviders));
  const finalSolvencyDeficit = Math.max(0, 1 - final.solvencyScore);

  return {
    maxUnderwaterShare,
    finalSolvencyDeficit,
    finalProviderCollapseShare,
    finalSolvencyScore: final.solvencyScore,
    finalPrice: final.price,
    finalProviders: final.providers,
    liquidatableFailure: maxUnderwaterShare > failureThreshold,
    insolvencyFailure: finalProviderCollapseShare > failureThreshold,
  };
}

function buildHeatmap(
  cells: PaperStressCell[],
  demandVolatilityLevels: number[],
  debtRatios: number[],
  selector: (cell: PaperStressCell) => number,
): number[][] {
  return demandVolatilityLevels.map((volatility) => debtRatios.map((debtRatio) => {
    const cell = cells.find((entry) => entry.demandVolatility === volatility && entry.debtRatio === debtRatio);
    return cell ? selector(cell) : 0;
  }));
}

export function classifyHeatBand(rate: number): HeatBand {
  if (rate <= 0.10) return 'GREEN';
  if (rate <= 0.40) return 'YELLOW';
  return 'RED';
}

export function runPaperStressMatrix(options: MatrixOptions = {}): PaperStressMatrixReport {
  const demandVolatilityLevels = options.demandVolatilityLevels ?? PAPER_VOLATILITY_LEVELS;
  const debtRatios = options.debtRatios ?? PAPER_DEBT_RATIO_LEVELS;
  const runsPerCell = options.runsPerCell ?? PAPER_STRESS_RUNS_PER_CELL;
  const failureThreshold = options.failureThreshold ?? PAPER_FAILURE_THRESHOLD;
  const seedBase = options.seedBase ?? 2026_02_07;

  const base = buildPaperStressBaseParams(options.baseParams ?? {});
  const cells: PaperStressCell[] = [];

  demandVolatilityLevels.forEach((demandVolatility, volIdx) => {
    debtRatios.forEach((debtRatio, debtIdx) => {
      const runOutcomes: PaperStressRunOutcome[] = [];
      for (let run = 0; run < runsPerCell; run += 1) {
        const simSeed = seedBase + (volIdx * 10_000) + (debtIdx * 1_000) + run;
        const params: SimulationParams = {
          ...base,
          seed: simSeed,
          nSims: 1,
          demandVolatility,
          maxMintWeekly: base.maxMintWeekly * debtRatio,
        };
        const results = simulateOne(params, simSeed, 1);
        runOutcomes.push(evaluatePaperStressRun(results, failureThreshold));
      }

      const liquidatableFailureRate = mean(runOutcomes.map((entry) => (entry.liquidatableFailure ? 1 : 0)));
      const insolvencyFailureRate = mean(runOutcomes.map((entry) => (entry.insolvencyFailure ? 1 : 0)));

      cells.push({
        debtRatio,
        demandVolatility,
        runCount: runOutcomes.length,
        liquidatableFailureRate,
        insolvencyFailureRate,
        avgMaxUnderwaterShare: mean(runOutcomes.map((entry) => entry.maxUnderwaterShare)),
        avgFinalSolvencyDeficit: mean(runOutcomes.map((entry) => entry.finalSolvencyDeficit)),
        avgFinalProviderCollapseShare: mean(runOutcomes.map((entry) => entry.finalProviderCollapseShare)),
        avgFinalSolvencyScore: mean(runOutcomes.map((entry) => entry.finalSolvencyScore)),
        avgFinalPrice: mean(runOutcomes.map((entry) => entry.finalPrice)),
        avgFinalProviders: mean(runOutcomes.map((entry) => entry.finalProviders)),
      });
    });
  });

  return {
    generatedAtIso: new Date().toISOString(),
    runsPerCell,
    failureThreshold,
    debtRatios,
    demandVolatilityLevels,
    cells,
    liquidatableHeatmap: buildHeatmap(cells, demandVolatilityLevels, debtRatios, (cell) => cell.liquidatableFailureRate),
    insolvencyHeatmap: buildHeatmap(cells, demandVolatilityLevels, debtRatios, (cell) => cell.insolvencyFailureRate),
  };
}
