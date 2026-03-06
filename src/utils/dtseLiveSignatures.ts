import { CHURN_GUARDRAILS, SOLVENCY_GUARDRAILS } from '../constants/guardrails';
import { buildMinerChartData, buildUtilityChartData, calculateRiskMetrics, summarizeUtility } from '../audit/decisionTreeViewMath';
import type { AggregateResult, SimulationParams } from '../model/types';
import type { DTSEFailureSignature, DTSEOutcome } from '../types/dtse';

const roundTo = (value: number, digits: number = 1): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const byMetricId = (outcomes: DTSEOutcome[]): Record<string, DTSEOutcome> => (
  outcomes.reduce<Record<string, DTSEOutcome>>((acc, outcome) => {
    acc[outcome.metric_id] = outcome;
    return acc;
  }, {})
);

const hasVisibleStress = (
  outcomesByMetric: Record<string, DTSEOutcome>,
  metricIds: string[],
): boolean => metricIds.some((metricId) => outcomesByMetric[metricId]?.band && outcomesByMetric[metricId].band !== 'healthy');

export function buildLiveDTSEFailureSignatures(
  aggregated: AggregateResult[],
  params: SimulationParams,
  outcomes: DTSEOutcome[],
): DTSEFailureSignature[] {
  if (!Array.isArray(aggregated) || aggregated.length === 0) {
    return [];
  }

  const latestByMetric = byMetricId(outcomes);
  const solvency = latestByMetric.solvency_ratio?.value ?? 0;
  const payback = latestByMetric.payback_period?.value ?? Number.POSITIVE_INFINITY;
  const retention = latestByMetric.weekly_retention_rate?.value ?? 100;
  const utilization = latestByMetric.network_utilization?.value ?? 0;
  const tailRisk = latestByMetric.tail_risk_score?.value ?? 0;

  const utilitySummary = summarizeUtility(buildUtilityChartData(aggregated));
  const minerChart = buildMinerChartData(aggregated, params.hardwareCost);
  const recentMinerWindow = minerChart.slice(-8);
  const avgTrailingChurn = recentMinerWindow.length > 0
    ? recentMinerWindow.reduce((sum, point) => sum + point.churnRatePct, 0) / recentMinerWindow.length
    : 0;
  const panicWeeks = minerChart.filter((point) => point.churnRatePct >= CHURN_GUARDRAILS.panicPctPerWeek).length;
  const risk = calculateRiskMetrics(aggregated);
  const latestPoint = aggregated[aggregated.length - 1];
  const burned = latestPoint?.burned?.mean ?? 0;
  const minted = latestPoint?.minted?.mean ?? 0;
  const burnToMint = minted > 0 ? burned / minted : 0;
  const priceSeries = aggregated
    .map((point) => point.price?.mean ?? NaN)
    .filter((value) => Number.isFinite(value));
  const firstPrice = priceSeries[0] ?? 0;
  const lastPrice = priceSeries[priceSeries.length - 1] ?? 0;
  const rawCompression = firstPrice > 0 ? ((firstPrice - lastPrice) / firstPrice) * 100 : 0;
  const priceCompressionPct = Math.min(999, Math.max(-999, rawCompression));
  const avgVampireChurn = aggregated.reduce((sum, point) => sum + (point.vampireChurn?.mean ?? 0), 0) / aggregated.length;
  const initialProviders = aggregated[0]?.providers?.mean ?? 0;
  const currentProviders = latestPoint?.providers?.mean ?? 0;
  const providerRetentionPct = initialProviders > 0 ? (currentProviders / initialProviders) * 100 : 100;

  const signatures: DTSEFailureSignature[] = [];

  if (
    hasVisibleStress(latestByMetric, ['solvency_ratio', 'payback_period', 'tail_risk_score'])
    && solvency < SOLVENCY_GUARDRAILS.healthyRatio
    && (payback > 24 || burnToMint < 0.8)
  ) {
    signatures.push({
      id: 'reward-demand-decoupling',
      label: 'Reward–Demand Decoupling',
      pattern: 'Reward issuance remains too high relative to demand-linked sinks, so provider economics depend on continued token support rather than operating demand.',
      severity: solvency < SOLVENCY_GUARDRAILS.criticalRatio || payback > 36 ? 'critical' : 'high',
      affected_metrics: ['solvency_ratio', 'payback_period', 'tail_risk_score'],
      why_it_matters: 'When rewards and real demand separate, apparent network activity can persist while the economic base weakens underneath it.',
      trigger_logic: `Triggered because solvency is ${roundTo(solvency, 2)}x, payback is ${roundTo(payback, 1)} months, and burn-to-mint coverage is ${roundTo(burnToMint * 100, 0)}%. Healthy requires solvency ≥ ${SOLVENCY_GUARDRAILS.healthyRatio.toFixed(2)}x and payback ≤ 24 months.`,
    });
  }

  if (
    hasVisibleStress(latestByMetric, ['tail_risk_score', 'solvency_ratio'])
    && (priceCompressionPct >= 20 || risk.drawdown >= 40 || tailRisk >= 35)
  ) {
    signatures.push({
      id: 'liquidity-driven-compression',
      label: 'Liquidity-Driven Compression',
      pattern: 'Market stress compresses fiat-equivalent rewards faster than the network can adjust, squeezing provider economics even if token issuance remains unchanged.',
      severity: risk.drawdown >= 60 || tailRisk >= 65 ? 'critical' : 'high',
      affected_metrics: ['tail_risk_score', 'solvency_ratio'],
      why_it_matters: 'A liquidity dislocation can turn a manageable token design into a rapid economic squeeze without any immediate change in physical network state.',
      trigger_logic: `Triggered because price compression is ${roundTo(priceCompressionPct, 1)}%, max drawdown is ${roundTo(risk.drawdown, 1)}%, and tail risk is ${roundTo(tailRisk, 0)}.`,
    });
  }

  if (
    hasVisibleStress(latestByMetric, ['weekly_retention_rate', 'network_utilization'])
    && params.competitorYield > 0
    && (avgVampireChurn >= 2 || retention < 92)
  ) {
    signatures.push({
      id: 'elastic-provider-exit',
      label: 'Elastic Provider Exit',
      pattern: 'Competing yields pull providers away before internal demand visibly collapses, showing that supply is more mobile than headline node count suggests.',
      severity: avgVampireChurn >= 4 || retention < 90 ? 'high' : 'medium',
      affected_metrics: ['vampire_churn', 'weekly_retention_rate', 'network_utilization'],
      why_it_matters: 'When providers can leave for better external yields, physical capacity can vanish faster than users or governance expect.',
      trigger_logic: `Triggered because competitor yield is ${roundTo(params.competitorYield * 100, 0)}% of baseline, average vampire churn is ${roundTo(avgVampireChurn, 1)} providers per step, and weekly retention is ${roundTo(retention, 1)}%.`,
    });
  }

  if (
    hasVisibleStress(latestByMetric, ['weekly_retention_rate', 'tail_risk_score', 'payback_period'])
    && (retention < 92 || avgTrailingChurn >= (CHURN_GUARDRAILS.panicPctPerWeek * 0.6) || panicWeeks > 0)
  ) {
    signatures.push({
      id: 'profitability-induced-churn',
      label: 'Profitability-Induced Churn',
      pattern: 'Provider economics weaken enough that operators begin powering down or deferring participation, translating cost pressure into supply instability.',
      severity: retention < 90 || panicWeeks >= 2 ? 'high' : 'medium',
      affected_metrics: ['payback_period', 'weekly_retention_rate', 'tail_risk_score'],
      why_it_matters: 'Once operating economics fall below provider tolerance, churn becomes an endogenous amplifier of network fragility.',
      trigger_logic: `Triggered because weekly retention is ${roundTo(retention, 1)}%, trailing average churn is ${roundTo(avgTrailingChurn, 1)}% per week, payback is ${roundTo(payback, 1)} months, and panic-threshold churn was hit in ${panicWeeks} week(s).`,
    });
  }

  if (
    hasVisibleStress(latestByMetric, ['network_utilization', 'solvency_ratio'])
    && (utilization < 35 || utilitySummary.overprovisioned || providerRetentionPct >= 80)
  ) {
    signatures.push({
      id: 'latent-capacity-degradation',
      label: 'Latent Capacity Degradation',
      pattern: 'Physical capacity appears to persist, but demand conversion and utilization weaken first, hiding deterioration until service quality is harder to recover.',
      severity: utilization < 20 || utilitySummary.demandCoverage < 85 ? 'high' : 'medium',
      affected_metrics: ['network_utilization', 'solvency_ratio'],
      why_it_matters: 'DePIN capacity can look stable for a while because hardware is sunk cost, but weak utilization is often the earlier sign of structural decay.',
      trigger_logic: utilitySummary.overprovisioned
        ? `Triggered because provider retention remains ${roundTo(providerRetentionPct, 1)}% while utilization is only ${roundTo(utilization, 1)}% and demand coverage is ${roundTo(utilitySummary.demandCoverage, 1)}%.`
        : `Triggered because utilization is ${roundTo(utilization, 1)}%, demand coverage is ${roundTo(utilitySummary.demandCoverage, 1)}%, and active providers still sit at ${roundTo(providerRetentionPct, 1)}% of the starting base.`,
    });
  }

  const severityRank: Record<DTSEFailureSignature['severity'], number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return signatures.sort((left, right) => severityRank[left.severity] - severityRank[right.severity]);
}
