import { GENERATED_PROTOCOL_PROFILES } from '../data/generated/protocolProfiles.generated.ts';
import { HELIUM_2022_DATA } from '../data/historical/helium_2022.ts';
import { runSimulation } from '../model/simulation.ts';
import type { DemandType, MacroCondition, SimulationParams } from '../model/types.ts';
import {
  bandCoverage,
  directionalAccuracy,
  mae,
  mape,
  normalizeToIndex,
  pearsonCorrelation,
  rmse,
} from './mathAuditMetrics.ts';

export interface BacktestWeeklyRow {
  week: number;
  historicalPriceIndex: number;
  simulatedPriceIndex: number;
  simulatedPriceP10Index: number;
  simulatedPriceP90Index: number;
  historicalNodeIndex: number;
  simulatedNodeIndex: number;
  simulatedNodeP10Index: number;
  simulatedNodeP90Index: number;
}

export interface BacktestMetricSet {
  mae: number;
  rmse: number;
  mapePct: number;
  correlation: number;
  directionalAccuracy: number;
  p10p90Coverage: number;
}

export interface BacktestFitSnapshot {
  objective: number;
  price: BacktestMetricSet;
  providers: BacktestMetricSet;
  finalPriceIndex: number;
  finalProviderIndex: number;
  weeklyRows: BacktestWeeklyRow[];
}

export interface HeliumCalibrationEvidence {
  sampleCount: number;
  nSimsSearch: number;
  nSimsFinal: number;
  randomSeed: number;
  baselineObjective: number;
  finalObjective: number;
  objectiveImprovementPct: number;
  providerAlignmentLimited: boolean;
  limitations: string[];
}

export interface HeliumBacktestCalibrationResult {
  historicalLength: number;
  baseline: BacktestFitSnapshot;
  final: BacktestFitSnapshot;
  chosenParams: SimulationParams;
  evidence: HeliumCalibrationEvidence;
}

export interface HeliumBacktestCalibrationOptions {
  sampleCount?: number;
  nSimsSearch?: number;
  nSimsFinal?: number;
  randomSeed?: number;
}

interface HistoricalSeries {
  price: number[];
  providers: number[];
}

function round(value: number, digits: number = 6): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function ensureHeliumProfile() {
  const profile = GENERATED_PROTOCOL_PROFILES.find((entry) => entry.metadata.id === 'helium_bme_v1');
  if (!profile) {
    throw new Error('Helium profile not found: helium_bme_v1');
  }
  return profile;
}

function historicalSeries(): HistoricalSeries {
  const historicalLength = Math.min(HELIUM_2022_DATA.priceIndex.length, HELIUM_2022_DATA.nodeCountIndex.length);
  return {
    price: HELIUM_2022_DATA.priceIndex.slice(0, historicalLength),
    providers: HELIUM_2022_DATA.nodeCountIndex.slice(0, historicalLength),
  };
}

export function buildHeliumBacktestParams(overrides: Partial<SimulationParams> = {}): SimulationParams {
  const profile = ensureHeliumProfile();
  return {
    T: 52,
    initialSupply: profile.parameters.supply.value,
    initialPrice: Math.max(0.01, profile.parameters.initial_price.value),
    maxMintWeekly: profile.parameters.emissions.value,
    burnPct: profile.parameters.burn_fraction.value,
    initialLiquidity: 500_000,
    investorUnlockWeek: 999,
    investorSellPct: 0,
    scenario: 'baseline',
    demandType: profile.parameters.demand_regime.value,
    baseDemand: Math.max(12_000, Math.round(profile.parameters.initial_active_providers.value * 180 * 0.65)),
    demandVolatility: 0.03,
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
    maxProviderChurnRate: 0.1,
    preorderBacklogFraction: 0,
    preorderReleaseWeeks: 0,
    sunkCostChurnDamping: 0,
    kBuyPressure: 0.08,
    kSellPressure: 0.12,
    kDemandPrice: 0.15,
    kMintPrice: 0.35,
    baseServicePrice: 0.5,
    servicePriceElasticity: 0.6,
    minServicePrice: 0.05,
    maxServicePrice: 5,
    rewardLagWeeks: profile.parameters.adjustment_lag.value,
    nSims: 80,
    seed: 2026,
    competitorYield: 0,
    emissionModel: 'fixed',
    revenueStrategy: 'burn',
    networkEffectsEnabled: false,
    hardwareCost: profile.parameters.hardware_cost.value,
    proTierPct: profile.parameters.pro_tier_pct?.value || 0,
    proTierEfficiency: 1.5,
    sybilAttackEnabled: false,
    sybilSize: 0,
    ...overrides,
  };
}

function scoreCorrelation(correlation: number): number {
  return (1 - Math.max(-1, Math.min(1, correlation))) / 2;
}

function computeObjective(
  price: BacktestMetricSet,
  providers: BacktestMetricSet,
  finalPriceIndex: number,
  finalProviderIndex: number,
  historical: HistoricalSeries,
): number {
  const priceFinalGap = Math.abs(finalPriceIndex - historical.price[historical.price.length - 1]) / 100;
  const providerFinalGap = Math.abs(finalProviderIndex - historical.providers[historical.providers.length - 1]) / 100;

  return (
    (price.mae / 100) * 0.32
    + (providers.mae / 100) * 0.30
    + scoreCorrelation(price.correlation) * 0.10
    + scoreCorrelation(providers.correlation) * 0.16
    + (1 - price.directionalAccuracy) * 0.04
    + (1 - providers.directionalAccuracy) * 0.05
    + providerFinalGap * 0.02
    + priceFinalGap * 0.01
  );
}

export function evaluateHeliumBacktestFit(params: SimulationParams): BacktestFitSnapshot {
  const historical = historicalSeries();
  const historicalLength = Math.min(params.T, historical.price.length);
  const series = runSimulation({ ...params, T: historicalLength }).slice(0, historicalLength);

  const historicalPrice = historical.price.slice(0, historicalLength);
  const historicalProviders = historical.providers.slice(0, historicalLength);
  const simulatedPrice = normalizeToIndex(series.map((step) => step.price.mean));
  const simulatedPriceP10 = normalizeToIndex(series.map((step) => step.price.p10));
  const simulatedPriceP90 = normalizeToIndex(series.map((step) => step.price.p90));
  const simulatedProviders = normalizeToIndex(series.map((step) => step.providers.mean));
  const simulatedProvidersP10 = normalizeToIndex(series.map((step) => step.providers.p10));
  const simulatedProvidersP90 = normalizeToIndex(series.map((step) => step.providers.p90));

  const priceMetrics: BacktestMetricSet = {
    mae: round(mae(historicalPrice, simulatedPrice)),
    rmse: round(rmse(historicalPrice, simulatedPrice)),
    mapePct: round(mape(historicalPrice, simulatedPrice)),
    correlation: round(pearsonCorrelation(historicalPrice, simulatedPrice)),
    directionalAccuracy: round(directionalAccuracy(historicalPrice, simulatedPrice)),
    p10p90Coverage: round(bandCoverage(historicalPrice, simulatedPriceP10, simulatedPriceP90)),
  };

  const providerMetrics: BacktestMetricSet = {
    mae: round(mae(historicalProviders, simulatedProviders)),
    rmse: round(rmse(historicalProviders, simulatedProviders)),
    mapePct: round(mape(historicalProviders, simulatedProviders)),
    correlation: round(pearsonCorrelation(historicalProviders, simulatedProviders)),
    directionalAccuracy: round(directionalAccuracy(historicalProviders, simulatedProviders)),
    p10p90Coverage: round(bandCoverage(historicalProviders, simulatedProvidersP10, simulatedProvidersP90)),
  };

  const finalPriceIndex = round(simulatedPrice[simulatedPrice.length - 1] ?? 0);
  const finalProviderIndex = round(simulatedProviders[simulatedProviders.length - 1] ?? 0);
  const objective = round(computeObjective(priceMetrics, providerMetrics, finalPriceIndex, finalProviderIndex, historical));

  const weeklyRows: BacktestWeeklyRow[] = [];
  for (let week = 0; week < historicalLength; week += 1) {
    weeklyRows.push({
      week,
      historicalPriceIndex: round(historicalPrice[week], 4),
      simulatedPriceIndex: round(simulatedPrice[week], 4),
      simulatedPriceP10Index: round(simulatedPriceP10[week], 4),
      simulatedPriceP90Index: round(simulatedPriceP90[week], 4),
      historicalNodeIndex: round(historicalProviders[week], 4),
      simulatedNodeIndex: round(simulatedProviders[week], 4),
      simulatedNodeP10Index: round(simulatedProvidersP10[week], 4),
      simulatedNodeP90Index: round(simulatedProvidersP90[week], 4),
    });
  }

  return {
    objective,
    price: priceMetrics,
    providers: providerMetrics,
    finalPriceIndex,
    finalProviderIndex,
    weeklyRows,
  };
}

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function sampleNumber(rng: () => number, min: number, max: number): number {
  return min + ((max - min) * rng());
}

function sampleInt(rng: () => number, min: number, max: number): number {
  return Math.floor(sampleNumber(rng, min, max + 1));
}

function sampleFrom<T>(rng: () => number, values: readonly T[]): T {
  return values[Math.floor(rng() * values.length)];
}

function randomCandidate(base: SimulationParams, rng: () => number, nSimsSearch: number): SimulationParams {
  const demandType = sampleFrom<DemandType>(rng, ['consistent', 'high-to-decay']);
  const macro = sampleFrom<MacroCondition>(rng, ['bearish', 'sideways']);
  const includeGrowthShock = rng() > 0.55;

  const maxServicePrice = sampleNumber(rng, 0.4, 3.0);
  const minServicePrice = Math.min(sampleNumber(rng, 0.001, 0.03), maxServicePrice * 0.5);

  return {
    ...base,
    initialLiquidity: Math.round(sampleNumber(rng, 250_000, 12_000_000)),
    investorUnlockWeek: sampleInt(rng, 8, 42),
    investorSellPct: sampleNumber(rng, 0.04, 0.45),
    demandType,
    demandVolatility: sampleNumber(rng, 0.01, 0.11),
    macro,
    baseDemand: Math.round(sampleNumber(rng, 6_000, 100_000)),
    providerCostPerWeek: sampleNumber(rng, 2, 20),
    churnThreshold: sampleNumber(rng, -10, 8),
    profitThresholdToJoin: sampleNumber(rng, 0, 8),
    maxProviderGrowthRate: sampleNumber(rng, 0.01, 0.18),
    maxProviderChurnRate: sampleNumber(rng, 0.004, 0.11),
    preorderBacklogFraction: sampleNumber(rng, 0, 0.9),
    preorderReleaseWeeks: sampleInt(rng, 4, 40),
    sunkCostChurnDamping: sampleNumber(rng, 0, 0.8),
    hardwareLeadTime: sampleInt(rng, 0, 8),
    kBuyPressure: sampleNumber(rng, 0.001, 0.05),
    kSellPressure: sampleNumber(rng, 0.01, 0.4),
    kDemandPrice: sampleNumber(rng, 0.001, 0.07),
    kMintPrice: sampleNumber(rng, 0.08, 0.5),
    burnPct: sampleNumber(rng, 0.35, 1),
    baseServicePrice: sampleNumber(rng, 0.01, 0.35),
    servicePriceElasticity: sampleNumber(rng, 0.1, 0.95),
    minServicePrice,
    maxServicePrice,
    rewardLagWeeks: sampleInt(rng, 0, 6),
    growthCallEventWeek: includeGrowthShock ? sampleInt(rng, 2, 24) : undefined,
    growthCallEventPct: includeGrowthShock ? sampleNumber(rng, 0.05, 0.6) : undefined,
    nSims: nSimsSearch,
  };
}

export function runHeliumBacktestCalibration(
  options: HeliumBacktestCalibrationOptions = {},
): HeliumBacktestCalibrationResult {
  const sampleCount = options.sampleCount ?? 220;
  const nSimsSearch = options.nSimsSearch ?? 14;
  const nSimsFinal = options.nSimsFinal ?? 80;
  const randomSeed = options.randomSeed ?? 20260216;

  const historical = historicalSeries();
  const baseParams = buildHeliumBacktestParams({ T: historical.price.length });
  const baseline = evaluateHeliumBacktestFit({ ...baseParams, nSims: nSimsFinal });

  let bestCandidate = { ...baseParams, nSims: nSimsSearch };
  let bestSearchFit = evaluateHeliumBacktestFit(bestCandidate);

  const rng = createRng(randomSeed);
  for (let i = 0; i < sampleCount; i += 1) {
    const candidate = randomCandidate(baseParams, rng, nSimsSearch);
    const fit = evaluateHeliumBacktestFit(candidate);
    if (fit.objective < bestSearchFit.objective) {
      bestSearchFit = fit;
      bestCandidate = candidate;
    }
  }

  const finalParams = { ...bestCandidate, nSims: nSimsFinal };
  const final = evaluateHeliumBacktestFit(finalParams);

  const objectiveImprovementPct = baseline.objective <= 0
    ? 0
    : (baseline.objective - final.objective) / baseline.objective;

  const limitations: string[] = [];
  const providerAlignmentLimited = final.providers.correlation < 0.1 || final.providers.directionalAccuracy < 0.35;
  if (providerAlignmentLimited) {
    limitations.push(
      'Provider trajectory remains weakly aligned to history after bounded calibration. '
      + 'This indicates a structural model gap, likely around explicit backlog/sunk-cost dynamics.',
    );
  }
  if (final.price.correlation < 0.5) {
    limitations.push('Price correlation remains below 0.5 under current bounded search space.');
  }

  return {
    historicalLength: historical.price.length,
    baseline,
    final,
    chosenParams: finalParams,
    evidence: {
      sampleCount,
      nSimsSearch,
      nSimsFinal,
      randomSeed,
      baselineObjective: baseline.objective,
      finalObjective: final.objective,
      objectiveImprovementPct: round(objectiveImprovementPct),
      providerAlignmentLimited,
      limitations,
    },
  };
}
