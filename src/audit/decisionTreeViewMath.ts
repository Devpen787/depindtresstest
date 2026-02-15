import type { AggregateResult } from '../model/types';
import { calculateVolatility } from '../model/metrics';

export interface WizardMetrics {
  solvencyScore: number;
  solvencyFloor: number;
  paybackMonths: number;
  networkUtilization: number;
  resilienceScore: number;
  maxDrawdown: number;
  avgChurnRate: number;
  insolvencyWeeks: number;
}

export interface WizardPercentiles {
  solvency: number;
  payback: number;
  utilization: number;
  resilience: number;
  peerCount: number;
}

export interface RiskMetrics {
  drawdown: number;
  volatility: number;
  tailRiskScore: number;
  insolvencyWeeks: number;
  insolvencyRate: number;
  p10FloorRatio: number;
  finalSolvency: number;
}

export interface MinerChartPoint {
  t: number;
  paybackMonths: number;
  actualPayback: number;
  providers: number;
  churnNodes: number;
  churnRatePct: number;
  profit: number;
  isUnprofitable: boolean;
  cumulativeProfit: number;
}

export interface UtilityChartPoint {
  t: number;
  demand: number;
  demandServed: number;
  demandCoverage: number;
  utilization: number;
  proNodes: number;
  mercenaryNodes: number;
  totalNodes: number;
}

export interface UtilitySummary {
  utilization: number;
  demandCoverage: number;
  proShare: number;
  lowSample: boolean;
  overprovisioned: boolean;
  utilityHealthScore: number;
  utilityState: 'Strong Utility' | 'Developing Utility' | 'Weak Utility';
}

export interface TreasuryPoint {
  t: number;
  balance: number;
  cumulativeBurn: number;
  burn: number;
  mint: number;
  netBurnMinusMint: number;
}

export interface FinancialSummary {
  useBurnMetric: boolean;
  currentBalance: number;
  balanceSlope: number;
  isDraining: boolean;
  weeksToEmpty: number;
  currentNetFlow: number;
  netFlowQuality: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateMaxDrawdownFromMeans(meanPrices: number[]): number {
  const validPrices = meanPrices.filter((value) => Number.isFinite(value) && value > 0);
  if (validPrices.length === 0) return 0;

  const peak = Math.max(...validPrices);
  const troughAfterPeak = Math.min(...validPrices.slice(Math.max(0, validPrices.indexOf(peak))));
  return peak > 0 ? ((peak - troughAfterPeak) / peak) * 100 : 0;
}

export function calculateWizardMetrics(
  series: AggregateResult[],
  hardwareCost: number,
): WizardMetrics {
  if (!series || series.length === 0) {
    return {
      solvencyScore: 0,
      solvencyFloor: 0,
      paybackMonths: 0,
      networkUtilization: 0,
      resilienceScore: 0,
      maxDrawdown: 0,
      avgChurnRate: 0,
      insolvencyWeeks: 0,
    };
  }

  const lastStep = series[series.length - 1];
  const solvencyScore = lastStep.solvencyScore?.mean ?? 0;
  const minSolvency = Math.min(...series.map((step) => step.solvencyScore?.mean ?? 0));

  const weeklyProfit = lastStep.profit?.mean ?? 0;
  const paybackWeeks = weeklyProfit > 0.01 ? hardwareCost / weeklyProfit : 520;
  const paybackMonths = paybackWeeks / 4.33;

  const networkUtilization = (lastStep as unknown as { utilisation?: { mean: number }; utilization?: { mean: number } }).utilisation?.mean
    ?? (lastStep as unknown as { utilization?: { mean: number } }).utilization?.mean
    ?? 0;

  const meanPrices = series.map((step) => step.price?.mean ?? 0);
  const maxDrawdown = calculateMaxDrawdownFromMeans(meanPrices);

  const trailing = series.slice(-12);
  const churnRates = trailing.map((step, idx) => {
    const prior = trailing[Math.max(0, idx - 1)];
    const providers = prior?.providers?.mean ?? step.providers?.mean ?? 0;
    const churn = step.churnCount?.mean ?? 0;
    if (providers <= 0) return 0;
    return (churn / providers) * 100;
  });
  const avgChurnRate = churnRates.length > 0
    ? churnRates.reduce((sum, value) => sum + value, 0) / churnRates.length
    : 0;

  const insolvencyWeeks = series.filter((step) => (step.solvencyScore?.mean ?? 0) < 1).length;
  const insolvencyRate = series.length > 0 ? insolvencyWeeks / series.length : 0;
  const annualizedVolatility = calculateVolatility(series.map((step) => step.price));

  const solvencyFloorScore = clamp((minSolvency / 1.2) * 20, 0, 20);
  const finalSolvencyScore = clamp((solvencyScore / 1.5) * 30, 0, 30);
  const utilizationScore = clamp((networkUtilization / 80) * 20, 0, 20);
  const insolvencyScore = clamp((1 - insolvencyRate) * 20, 0, 20);
  const volatilityScore = clamp((1 - (annualizedVolatility / 1200)) * 10, 0, 10);
  const churnScore = clamp((1 - (avgChurnRate / 8)) * 10, 0, 10);
  const resilienceScore = Math.round(
    solvencyFloorScore +
    finalSolvencyScore +
    utilizationScore +
    insolvencyScore +
    volatilityScore +
    churnScore,
  );

  return {
    solvencyScore,
    solvencyFloor: minSolvency,
    paybackMonths,
    networkUtilization,
    resilienceScore,
    maxDrawdown,
    avgChurnRate,
    insolvencyWeeks,
  };
}

function percentileRank(values: number[], value: number, higherIsBetter: boolean): number {
  if (!values || values.length === 0) return 50;
  const favorable = higherIsBetter
    ? values.filter((v) => v <= value).length
    : values.filter((v) => v >= value).length;
  return Math.round((favorable / values.length) * 100);
}

export function calculateWizardPercentiles(
  active: WizardMetrics,
  peerMetrics: WizardMetrics[],
): WizardPercentiles | null {
  if (!peerMetrics || peerMetrics.length < 2) return null;

  const solvencyValues = peerMetrics.map((m) => m.solvencyScore);
  const paybackValues = peerMetrics.map((m) => m.paybackMonths);
  const utilizationValues = peerMetrics.map((m) => m.networkUtilization);
  const resilienceValues = peerMetrics.map((m) => m.resilienceScore);

  return {
    solvency: percentileRank(solvencyValues, active.solvencyScore, true),
    payback: percentileRank(paybackValues, active.paybackMonths, false),
    utilization: percentileRank(utilizationValues, active.networkUtilization, true),
    resilience: percentileRank(resilienceValues, active.resilienceScore, true),
    peerCount: peerMetrics.length,
  };
}

export function calculateRiskMetrics(data: AggregateResult[]): RiskMetrics {
  if (!data || data.length === 0) {
    return {
      drawdown: 0,
      volatility: 0,
      tailRiskScore: 0,
      insolvencyWeeks: 0,
      insolvencyRate: 0,
      p10FloorRatio: 1,
      finalSolvency: 1,
    };
  }

  const meanPrices = data.map((step) => step.price?.mean ?? 0).filter((value) => Number.isFinite(value) && value > 0);
  const initialPrice = meanPrices[0] || 1;
  const drawdown = calculateMaxDrawdownFromMeans(meanPrices);
  const volatility = calculateVolatility(data.map((step) => step.price));

  const p10Floor = Math.min(...data.map((step) => step.price?.p10 ?? step.price?.mean ?? initialPrice));
  const p10FloorRatio = initialPrice > 0 ? p10Floor / initialPrice : 1;

  const last = data[data.length - 1];
  const lastMeanPrice = last.price?.mean ?? 0;
  const downsideSpread = lastMeanPrice > 0
    ? ((lastMeanPrice - (last.price?.p10 ?? lastMeanPrice)) / lastMeanPrice)
    : 0;

  const insolvencyWeeks = data.filter((step) => (step.solvencyScore?.mean ?? 0) < 1).length;
  const insolvencyRate = data.length > 0 ? insolvencyWeeks / data.length : 0;

  const floorRisk = clamp(1 - p10FloorRatio, 0, 1);
  const spreadRisk = clamp(downsideSpread / 0.6, 0, 1);
  const drawdownRisk = clamp(drawdown / 100, 0, 1);
  const tailRiskScore = Math.round(
    (insolvencyRate * 0.45 + floorRisk * 0.2 + drawdownRisk * 0.2 + spreadRisk * 0.15) * 100,
  );

  return {
    drawdown,
    volatility,
    tailRiskScore,
    insolvencyWeeks,
    insolvencyRate,
    p10FloorRatio,
    finalSolvency: last.solvencyScore?.mean ?? 0,
  };
}

export function buildMinerChartData(data: AggregateResult[], hardwareCost: number): MinerChartPoint[] {
  if (!data || data.length === 0) return [];

  const points = data.map((d, idx) => {
    const weeklyProfit = d.profit?.mean ?? 0;
    const isUnprofitable = weeklyProfit <= 0.1;
    const paybackWeeks = isUnprofitable ? 520 : hardwareCost / weeklyProfit;
    const paybackMonths = paybackWeeks / 4.33;
    const providers = d.providers?.mean ?? 0;
    const previousProviders = idx > 0 ? (data[idx - 1]?.providers?.mean ?? providers) : providers;
    const churnNodes = d.churnCount?.mean ?? 0;
    const churnRatePct = previousProviders > 0 ? (churnNodes / previousProviders) * 100 : 0;

    return {
      t: d.t,
      paybackMonths: clamp(paybackMonths, 0, 120),
      actualPayback: paybackMonths,
      providers,
      churnNodes,
      churnRatePct,
      profit: weeklyProfit,
      isUnprofitable,
      cumulativeProfit: 0,
    };
  });

  let cumulative = 0;
  for (const point of points) {
    cumulative += point.profit;
    point.cumulativeProfit = cumulative;
  }

  return points;
}

export function buildUtilityChartData(data: AggregateResult[]): UtilityChartPoint[] {
  if (!data || data.length === 0) return [];

  return data.map((d) => {
    const demand = d.demand?.mean ?? 0;
    const demandServed = (d as unknown as { demandServed?: { mean: number }; demand_served?: { mean: number } }).demandServed?.mean
      ?? (d as unknown as { demand_served?: { mean: number } }).demand_served?.mean
      ?? 0;
    const utilization = (d as unknown as { utilisation?: { mean: number }; utilization?: { mean: number } }).utilisation?.mean
      ?? (d as unknown as { utilization?: { mean: number } }).utilization?.mean
      ?? 0;

    const proNodes = d.proCount?.mean ?? (d as unknown as { urbanCount?: { mean: number } }).urbanCount?.mean ?? 0;
    const mercenaryNodes = d.mercenaryCount?.mean ?? (d as unknown as { ruralCount?: { mean: number } }).ruralCount?.mean ?? 0;
    const providers = d.providers?.mean ?? 0;
    const fallbackSplit = providers > 0 && proNodes + mercenaryNodes === 0;

    const resolvedPro = fallbackSplit ? providers * 0.5 : proNodes;
    const resolvedMercenary = fallbackSplit ? providers * 0.5 : mercenaryNodes;
    const totalNodes = Math.max(0, resolvedPro + resolvedMercenary);
    const demandCoverage = demand > 0 ? (demandServed / demand) * 100 : 0;

    return {
      t: d.t,
      demand,
      demandServed,
      demandCoverage: clamp(demandCoverage, 0, 100),
      utilization: clamp(utilization, 0, 100),
      proNodes: Math.max(0, resolvedPro),
      mercenaryNodes: Math.max(0, resolvedMercenary),
      totalNodes,
    };
  });
}

export function summarizeUtility(points: UtilityChartPoint[]): UtilitySummary {
  const last = points[points.length - 1] || {
    utilization: 0,
    demandCoverage: 0,
    proNodes: 0,
    totalNodes: 0,
  };

  const utilization = last.utilization;
  const demandCoverage = last.demandCoverage;
  const proShare = last.totalNodes > 0 ? (last.proNodes / last.totalNodes) * 100 : 50;
  const lowSample = last.totalNodes < 50;
  const overprovisioned = demandCoverage >= 98 && utilization < 35;
  const utilityHealthScore = Math.round((utilization * 0.45) + (demandCoverage * 0.55));
  const utilityState = utilityHealthScore >= 60
    ? 'Strong Utility'
    : utilityHealthScore >= 40
      ? 'Developing Utility'
      : 'Weak Utility';

  return {
    utilization,
    demandCoverage,
    proShare,
    lowSample,
    overprovisioned,
    utilityHealthScore,
    utilityState,
  };
}

export function buildTreasuryChartData(data: AggregateResult[]): TreasuryPoint[] {
  return data.map((d) => ({
    t: d.t,
    balance: d.treasuryBalance.mean,
    cumulativeBurn: (d.treasuryBalance.mean === 0) ? (d.dailyBurnUsd.mean * 7 * d.t) : 0,
    burn: d.dailyBurnUsd.mean * 7,
    mint: d.dailyMintUsd.mean * 7,
    netBurnMinusMint: (d.dailyBurnUsd.mean - d.dailyMintUsd.mean) * 7,
  }));
}

export function summarizeFinancial(treasuryData: TreasuryPoint[]): FinancialSummary {
  const lastPoint = treasuryData[treasuryData.length - 1];
  const useBurnMetric = (lastPoint?.balance ?? 0) === 0;
  const currentBalance = useBurnMetric ? (lastPoint?.cumulativeBurn || 0) : (lastPoint?.balance || 0);

  const recentWindow = treasuryData.slice(-12);
  const balanceSlope = recentWindow.length > 1
    ? (recentWindow[recentWindow.length - 1].balance - recentWindow[0].balance) / (recentWindow.length - 1)
    : 0;
  const isDraining = !useBurnMetric && balanceSlope < 0;
  const weeksToEmpty = isDraining && currentBalance > 0 ? currentBalance / Math.abs(balanceSlope) : Infinity;
  const currentNetFlow = lastPoint?.netBurnMinusMint || 0;
  const netFlowQuality = clamp(currentNetFlow / 500_000, -1, 1);

  return {
    useBurnMetric,
    currentBalance,
    balanceSlope,
    isDraining,
    weeksToEmpty,
    currentNetFlow,
    netFlowQuality,
  };
}
