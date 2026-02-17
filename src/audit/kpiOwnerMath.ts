import {
  benchmarkClamp,
  calculatePaybackMonths,
  calculateSmoothedSolvencyIndex,
  normalizePaybackMonths
} from './benchmarkViewMath';
import {
  PAYBACK_GUARDRAILS,
  RETENTION_GUARDRAILS,
  SOLVENCY_GUARDRAILS,
  TAIL_RISK_GUARDRAILS,
  UTILIZATION_GUARDRAILS,
  classifyPaybackBand,
  classifyTailRiskBand,
  type GuardrailBand
} from '../constants/guardrails';
import { calculateRiskMetrics } from './decisionTreeViewMath';

const WEEKS_PER_YEAR = 52;
const RETENTION_WATCHLIST_MIN_PCT = 90;
const UTILITY_HEALTHY_SCORE = 60;
const UTILITY_WATCHLIST_SCORE = 40;
const SENSITIVITY_HEALTHY_MAX_PCT = 10;
const SENSITIVITY_WATCHLIST_MAX_PCT = 25;

type MeanMetric = { mean?: number } | undefined;

interface OwnerPoint {
  price?: MeanMetric;
  minted?: MeanMetric;
  providers?: MeanMetric;
  demand?: MeanMetric;
  demandServed?: MeanMetric;
  demand_served?: MeanMetric;
  utilization?: MeanMetric;
  utilisation?: MeanMetric;
  solvencyScore?: MeanMetric;
  retentionRate?: number;
}

export interface PaybackOwnerInputs {
  hardwareCost: number;
  annualizedRevenue: number;
  activeNodes: number;
}

export interface UtilityOwnerSnapshot {
  utilizationPct: number;
  demandCoveragePct: number;
  utilityHealthScore: number;
}

export interface SensitivitySweepPointLike {
  delta: number;
}

const toFinite = (value: number | undefined | null, fallback = 0): number => (
  Number.isFinite(value) ? Number(value) : fallback
);

const resolveUtilizationPct = (point: OwnerPoint | null | undefined): number => {
  return benchmarkClamp(
    toFinite(point?.utilization?.mean, toFinite(point?.utilisation?.mean, 0)),
    0,
    100
  );
};

const resolveDemandCoveragePct = (point: OwnerPoint | null | undefined): number => {
  const demand = toFinite(point?.demand?.mean, 0);
  const demandServed = toFinite(point?.demandServed?.mean, toFinite(point?.demand_served?.mean, 0));
  if (demand <= 0) return 0;
  return benchmarkClamp((demandServed / demand) * 100, 0, 100);
};

const normalizePercent = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value <= 1) return benchmarkClamp(value * 100, 0, 100);
  return benchmarkClamp(value, 0, 100);
};

export const annualizedRevenueFromWeeklyProviderRevenue = (
  weeklyProviderRevenue: number,
  activeNodes: number
): number => {
  const safeWeekly = Number.isFinite(weeklyProviderRevenue) ? weeklyProviderRevenue : 0;
  const safeNodes = Math.max(1, Number.isFinite(activeNodes) ? activeNodes : 1);
  return safeWeekly * WEEKS_PER_YEAR * safeNodes;
};

export const calculateOwnerPaybackMonths = ({
  hardwareCost,
  annualizedRevenue,
  activeNodes
}: PaybackOwnerInputs): number => {
  const rawPayback = calculatePaybackMonths(hardwareCost, annualizedRevenue, activeNodes);
  return normalizePaybackMonths(rawPayback);
};

export const calculateOwnerPaybackFromAggregatePoint = (
  point: OwnerPoint,
  hardwareCost: number
): number => {
  const activeNodes = Math.max(1, point?.providers?.mean || 0);
  const weeklyProviderRevenue = ((point?.minted?.mean || 0) / activeNodes) * (point?.price?.mean || 0);
  const annualizedRevenue = annualizedRevenueFromWeeklyProviderRevenue(weeklyProviderRevenue, activeNodes);
  return calculateOwnerPaybackMonths({
    hardwareCost,
    annualizedRevenue,
    activeNodes
  });
};

export const calculateOwnerSolvencyRatio = (point: OwnerPoint | null | undefined): number => {
  return benchmarkClamp(toFinite(point?.solvencyScore?.mean, 0), 0, 3);
};

export const calculateOwnerSolvencyIndex = (point: OwnerPoint | null | undefined): number => {
  const ratio = calculateOwnerSolvencyRatio(point);
  return benchmarkClamp(ratio * 100, 0, 220);
};

export const calculateOwnerSmoothedSolvencyIndex = (
  series: Array<OwnerPoint | null | undefined>,
  index: number
): number => {
  const solvencySeries = series.map((step) => toFinite(step?.solvencyScore?.mean, 0));
  return calculateSmoothedSolvencyIndex(solvencySeries, index);
};

export const classifySolvencyBand = (solvencyRatio: number): GuardrailBand => {
  if (!Number.isFinite(solvencyRatio)) return 'intervention';
  if (solvencyRatio < SOLVENCY_GUARDRAILS.criticalRatio) return 'intervention';
  if (solvencyRatio < SOLVENCY_GUARDRAILS.healthyRatio) return 'watchlist';
  return 'healthy';
};

export const calculateOwnerRetentionPct = (
  derivedRetentionRate?: number | null,
  fallbackPoint?: OwnerPoint | null
): number => {
  if (Number.isFinite(derivedRetentionRate)) {
    return normalizePercent(Number(derivedRetentionRate));
  }
  return normalizePercent(toFinite(fallbackPoint?.retentionRate, 100));
};

export const classifyRetentionBand = (retentionPct: number): GuardrailBand => {
  const normalized = normalizePercent(retentionPct);
  if (normalized < RETENTION_WATCHLIST_MIN_PCT) return 'intervention';
  if (normalized < RETENTION_GUARDRAILS.benchmarkMinPct) return 'watchlist';
  return 'healthy';
};

export const calculateOwnerUtilitySnapshot = (
  point: OwnerPoint | null | undefined
): UtilityOwnerSnapshot => {
  const utilizationPct = resolveUtilizationPct(point);
  const demandCoveragePct = resolveDemandCoveragePct(point);
  const utilityHealthScore = Math.round((utilizationPct * 0.45) + (demandCoveragePct * 0.55));
  return {
    utilizationPct,
    demandCoveragePct,
    utilityHealthScore
  };
};

export const classifyUtilityBand = (utilityHealthScore: number): GuardrailBand => {
  if (!Number.isFinite(utilityHealthScore)) return 'intervention';
  if (utilityHealthScore < UTILITY_WATCHLIST_SCORE) return 'intervention';
  if (utilityHealthScore < UTILITY_HEALTHY_SCORE) return 'watchlist';
  return 'healthy';
};

export const calculateOwnerTailRiskScore = (
  series: Array<{ price?: MeanMetric; solvencyScore?: MeanMetric } | null | undefined>
): number => {
  const safeSeries = series.filter(Boolean) as Array<{ price?: MeanMetric; solvencyScore?: MeanMetric }>;
  if (safeSeries.length === 0) return 100;
  return benchmarkClamp(calculateRiskMetrics(safeSeries as any).tailRiskScore, 0, 100);
};

export const classifySensitivityBand = (maxAbsDeltaPct: number): GuardrailBand => {
  if (!Number.isFinite(maxAbsDeltaPct)) return 'intervention';
  if (maxAbsDeltaPct > SENSITIVITY_WATCHLIST_MAX_PCT) return 'intervention';
  if (maxAbsDeltaPct > SENSITIVITY_HEALTHY_MAX_PCT) return 'watchlist';
  return 'healthy';
};

export const calculateOwnerSensitivityMaxAbsDelta = (
  sweepResults: SensitivitySweepPointLike[]
): number => {
  if (!Array.isArray(sweepResults) || sweepResults.length === 0) return 0;
  return benchmarkClamp(
    sweepResults.reduce((maxDelta, row) => Math.max(maxDelta, Math.abs(toFinite(row?.delta, 0))), 0),
    0,
    100
  );
};

export const calculateOwnerSensitivityFromSpread = (
  point: { solvencyScore?: { mean?: number; p10?: number; p90?: number } } | null | undefined
): number => {
  const mean = toFinite(point?.solvencyScore?.mean, 0);
  if (mean <= 0) return 0;
  const p10 = toFinite(point?.solvencyScore?.p10, mean);
  const p90 = toFinite(point?.solvencyScore?.p90, mean);
  const spreadPct = ((p90 - p10) / mean) * 100;
  return benchmarkClamp(spreadPct, 0, 100);
};

export const mergeGuardrailBands = (bands: GuardrailBand[]): GuardrailBand => {
  if (bands.includes('intervention')) return 'intervention';
  if (bands.includes('watchlist')) return 'watchlist';
  return 'healthy';
};

export const OWNER_KPI_THRESHOLD_COPY = {
  payback: `Watchlist above ${PAYBACK_GUARDRAILS.healthyMaxMonths} months`,
  solvency: `Healthy above ${(SOLVENCY_GUARDRAILS.healthyRatio * 100).toFixed(0)}%`,
  retention: `Intervention below ${RETENTION_WATCHLIST_MIN_PCT}%`,
  utility: `Watchlist below ${UTILITY_HEALTHY_SCORE}/100`,
  tailRisk: `Intervention above ${TAIL_RISK_GUARDRAILS.watchlistMax}`,
  sensitivity: `Intervention above ${SENSITIVITY_WATCHLIST_MAX_PCT}% delta`
} as const;

export const OWNER_KPI_BAND_CLASSIFIERS = {
  payback: classifyPaybackBand,
  solvency: classifySolvencyBand,
  retention: classifyRetentionBand,
  utility: classifyUtilityBand,
  tailRisk: classifyTailRiskBand,
  sensitivity: classifySensitivityBand
} as const;

export const OWNER_KPI_THRESHOLD_VALUES = {
  retentionWatchlistMinPct: RETENTION_WATCHLIST_MIN_PCT,
  utilityHealthyScore: UTILITY_HEALTHY_SCORE,
  utilityWatchlistScore: UTILITY_WATCHLIST_SCORE,
  sensitivityHealthyMaxPct: SENSITIVITY_HEALTHY_MAX_PCT,
  sensitivityWatchlistMaxPct: SENSITIVITY_WATCHLIST_MAX_PCT,
  utilizationHealthyMinPct: UTILIZATION_GUARDRAILS.healthyMinPct,
  utilizationWatchlistMinPct: UTILIZATION_GUARDRAILS.watchlistMinPct
} as const;
