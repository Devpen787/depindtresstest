export const DEFAULT_PAYBACK_MONTHS = 60;

export interface DeltaResult {
  delta: number;
  isValid: boolean;
}

export type BenchmarkDataSource = 'simulated' | 'live' | 'mixed';

export interface SourceLabelResolution {
  label: 'Simulated' | 'Anchored' | 'Live Data';
  isProjected: boolean;
}

export interface RetentionPoint {
  providers: number;
  churn: number;
}

export function benchmarkClamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function safePercentDelta(a: number, b: number): DeltaResult {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) {
    return { delta: 0, isValid: false };
  }
  return { delta: ((a - b) / b) * 100, isValid: true };
}

export function safeAbsoluteDelta(a: number, b: number): DeltaResult {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { delta: 0, isValid: false };
  }
  return { delta: a - b, isValid: true };
}

export function resolveSourceLabel(sources: BenchmarkDataSource[]): SourceLabelResolution {
  const hasLive = sources.includes('live');
  const hasMixed = sources.includes('mixed');
  const hasSim = sources.includes('simulated');

  if (hasLive && !hasMixed && !hasSim) {
    return { label: 'Live Data', isProjected: false };
  }

  if (hasLive || hasMixed) {
    return { label: 'Anchored', isProjected: false };
  }

  return { label: 'Simulated', isProjected: true };
}

export function calculateAnnualGrowthYoY(startNodes: number, endNodes: number, weeks: number): number {
  if (!Number.isFinite(startNodes) || !Number.isFinite(endNodes) || !Number.isFinite(weeks)) return 0;
  if (weeks <= 0 || startNodes <= 0) return 0;

  const weeklyGrowth = Math.pow(endNodes / startNodes, 1 / weeks) - 1;
  if (!Number.isFinite(weeklyGrowth)) return 0;

  return (Math.pow(1 + weeklyGrowth, 52) - 1) * 100;
}

export function calculateAnnualizedRevenue(
  hasLiveRevenue: boolean,
  liveRevenueUsd7d: number,
  demandServedMean: number,
  servicePriceMean: number,
): number {
  const weeklyRevenue = hasLiveRevenue ? liveRevenueUsd7d : demandServedMean * servicePriceMean;
  return Number.isFinite(weeklyRevenue) ? weeklyRevenue * 52 : 0;
}

export function calculateWeeklyBurn(hasLiveBurn: boolean, liveBurn7d: number, simulatedBurn: number): number {
  const burn = hasLiveBurn ? liveBurn7d : simulatedBurn;
  return Number.isFinite(burn) ? burn : 0;
}

export function calculateDemandDataSource(
  hasLiveRevenue: boolean,
  hasLiveBurn: boolean,
): BenchmarkDataSource {
  if (hasLiveRevenue && hasLiveBurn) return 'live';
  if (hasLiveRevenue || hasLiveBurn) return 'mixed';
  return 'simulated';
}

export function calculateSustainabilityRatioPct(
  mintedTokens: number,
  simulationPrice: number,
  burnAmount: number,
  burnPrice: number,
): number {
  const emissionsVal = mintedTokens * simulationPrice;
  const burnVal = burnAmount * burnPrice;
  if (!Number.isFinite(emissionsVal) || !Number.isFinite(burnVal) || emissionsVal <= 0) {
    return 0;
  }
  return (burnVal / emissionsVal) * 100;
}

export function calculateRevenuePerNode(annualizedRevenue: number, activeNodes: number): number {
  if (!Number.isFinite(annualizedRevenue) || !Number.isFinite(activeNodes) || activeNodes <= 0) return 0;
  return annualizedRevenue / activeNodes;
}

export function calculateHardwareRoiPct(revenuePerNode: number, hardwareCost: number): number {
  if (!Number.isFinite(revenuePerNode) || !Number.isFinite(hardwareCost) || hardwareCost <= 0) return 0;
  return (revenuePerNode / hardwareCost) * 100;
}

export function calculatePaybackMonths(
  hardwareCost: number,
  annualizedRevenue: number,
  activeNodes: number,
): number {
  const annualRevenuePerNode = calculateRevenuePerNode(annualizedRevenue, activeNodes);
  const monthlyRevenuePerNode = annualRevenuePerNode / 12;

  if (!Number.isFinite(hardwareCost) || hardwareCost <= 0 || monthlyRevenuePerNode <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  return hardwareCost / monthlyRevenuePerNode;
}

export function normalizePaybackMonths(paybackMonths: number): number {
  return Number.isFinite(paybackMonths)
    ? benchmarkClamp(paybackMonths, 0, DEFAULT_PAYBACK_MONTHS)
    : DEFAULT_PAYBACK_MONTHS;
}

export function calculateRetentionFallback(finalProviders: number, peakProviders: number): number {
  if (!Number.isFinite(finalProviders) || !Number.isFinite(peakProviders) || peakProviders <= 0) return 0;
  return benchmarkClamp((finalProviders / peakProviders) * 100, 0, 100);
}

export function calculateWeeklyRetentionEstimate(points: RetentionPoint[], fallback: number): number {
  if (points.length < 2) return fallback;

  const trailing = points.slice(-8);
  const weeklyRetention: number[] = [];

  for (let i = 1; i < trailing.length; i += 1) {
    const prevProviders = trailing[i - 1]?.providers ?? 0;
    const churn = trailing[i]?.churn ?? 0;
    if (prevProviders <= 0) continue;
    weeklyRetention.push(benchmarkClamp((1 - churn / prevProviders) * 100, 0, 100));
  }

  return weeklyRetention.length > 0 ? mean(weeklyRetention) : fallback;
}

export function calculateDemandCoveragePct(demand: number, demandServed: number): number {
  if (!Number.isFinite(demand) || !Number.isFinite(demandServed) || demand <= 0) return 0;
  return benchmarkClamp((demandServed / demand) * 100, 0, 100);
}

export function calculateEfficiencyScore(
  utilization: number,
  demandCoverage: number,
  previousUtilization?: number,
): number {
  const boundedUtilization = benchmarkClamp(utilization, 0, 100);
  const boundedDemandCoverage = benchmarkClamp(demandCoverage, 0, 100);

  const utilizationBalance = benchmarkClamp(100 - Math.abs(boundedUtilization - 82) * 1.25, 0, 100);
  const utilizationTrendPenalty = Number.isFinite(previousUtilization)
    ? benchmarkClamp(Math.abs(boundedUtilization - benchmarkClamp(previousUtilization as number, 0, 100)) * 0.4, 0, 20)
    : 0;

  return benchmarkClamp((utilizationBalance * 0.6) + (boundedDemandCoverage * 0.4) - utilizationTrendPenalty, 0, 100);
}

export function normalizeSustainabilityRatio(sustainabilityRatioPct: number): number {
  return benchmarkClamp(sustainabilityRatioPct / 100, 0, 3);
}

export function toPaybackScore(paybackMonths: number): number {
  return benchmarkClamp(((36 - paybackMonths) / 36) * 100, 0, 100);
}

export function calculateSmoothedSolvencyIndex(series: number[], index: number): number {
  if (series.length === 0) return 0;

  const safeIndex = Math.max(0, Math.min(index, series.length - 1));
  const smoothWindow = series
    .slice(Math.max(0, safeIndex - 2), safeIndex + 1)
    .filter((value) => Number.isFinite(value) && value >= 0);

  const smoothSolvency = smoothWindow.length > 0
    ? mean(smoothWindow)
    : (Number.isFinite(series[safeIndex]) ? series[safeIndex] : 0);

  return benchmarkClamp(smoothSolvency * 100, 0, 220);
}
