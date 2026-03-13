import { CHURN_GUARDRAILS, SOLVENCY_GUARDRAILS } from '../constants/guardrails';
import { buildMinerChartData, buildUtilityChartData, calculateRiskMetrics, summarizeUtility } from '../audit/decisionTreeViewMath';
import type { AggregateResult, SimulationParams } from '../model/types';
import type { DTSEFailureSignature, DTSEOutcome } from '../types/dtse';
import type { DTSESequenceView } from './dtseSequenceView';

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

const CANONICAL_SIGNATURE_ORDER: DTSEFailureSignature['id'][] = [
  'reward-demand-decoupling',
  'liquidity-driven-compression',
  'elastic-provider-exit',
  'profitability-induced-churn',
  'latent-capacity-degradation',
];

const LEAD_SIGNATURE_BY_FAMILY = {
  profitability: 'reward-demand-decoupling',
  utilization: 'latent-capacity-degradation',
  solvency_proxy: 'reward-demand-decoupling',
  modeled_price: 'liquidity-driven-compression',
  retention_churn: 'profitability-induced-churn',
} as const;

const sequenceSeverityToSignatureSeverity = (
  severity: DTSESequenceView['pathway'][number]['cells'][number]['severity'] | undefined,
): DTSEFailureSignature['severity'] => {
  switch (severity) {
    case 'critical':
      return 'critical';
    case 'alert':
      return 'high';
    case 'watch':
      return 'medium';
    default:
      return 'low';
  }
};

function resolveLeadSignatureId(
  sequenceView: DTSESequenceView | undefined,
  params: SimulationParams,
): DTSEFailureSignature['id'] | null {
  if (!sequenceView) return null;
  const leadRow = sequenceView.pathway.find((row) => (
    row.label === sequenceView.earliestTriggerLabel
    && row.triggerWeek === sequenceView.earliestTriggerWeek
  )) ?? sequenceView.pathway.find((row) => row.triggerWeek !== null);

  if (!leadRow) return null;
  if (leadRow.familyId === 'retention_churn' && params.competitorYield > 0) {
    return 'elastic-provider-exit';
  }
  return LEAD_SIGNATURE_BY_FAMILY[leadRow.familyId] ?? null;
}

function buildSequenceAnchoredSignature(
  leadSignatureId: DTSEFailureSignature['id'],
  sequenceView: DTSESequenceView,
  params: SimulationParams,
  metrics: {
    solvency: number;
    payback: number;
    retention: number;
    utilization: number;
    tailRisk: number;
    avgVampireChurn: number;
    hasVampireSeries: boolean;
    providerRetentionPct: number;
    priceCompressionPct: number;
  },
): DTSEFailureSignature | null {
  const leadRow = sequenceView.pathway.find((row) => (
    row.label === sequenceView.earliestTriggerLabel
    && row.triggerWeek === sequenceView.earliestTriggerWeek
  )) ?? sequenceView.pathway.find((row) => row.triggerWeek !== null);

  if (!leadRow || leadRow.triggerWeek === null) return null;

  const leadCell = leadRow.cells.find((cell) => cell.week === leadRow.triggerWeek);
  const severity = sequenceSeverityToSignatureSeverity(leadCell?.severity);
  const triggerPrefix = `Anchored to Stage 3 because ${leadRow.label} is the earliest visible break at Week ${leadRow.triggerWeek}.`;

  switch (leadSignatureId) {
    case 'reward-demand-decoupling':
      return {
        id: 'reward-demand-decoupling',
        label: 'Reward–Demand Decoupling',
        pattern: 'Reward issuance is separating from demand-backed support, so provider economics weaken before the network visibly resets.',
        severity,
        affected_metrics: ['solvency_ratio', 'payback_period', 'tail_risk_score'],
        why_it_matters: 'When subsidy quality weakens first, later network health readings can lag behind the real economic break.',
        trigger_logic: `${triggerPrefix} Solvency is ${roundTo(metrics.solvency, 2)}x and payback is ${roundTo(metrics.payback, 1)} months.`,
      };
    case 'liquidity-driven-compression':
      return {
        id: 'liquidity-driven-compression',
        label: 'Liquidity-Driven Compression',
        pattern: 'Market-side compression is hitting provider economics faster than the network can adjust its incentive loop.',
        severity,
        affected_metrics: ['tail_risk_score', 'solvency_ratio'],
        why_it_matters: 'A price-led shock can damage economic resilience well before the visible network state catches up.',
        trigger_logic: `${triggerPrefix} Price compression is ${roundTo(metrics.priceCompressionPct, 1)}% and tail risk is ${roundTo(metrics.tailRisk, 0)}.`,
      };
    case 'elastic-provider-exit':
      return {
        id: 'elastic-provider-exit',
        label: 'Elastic Provider Exit',
        pattern: 'Outside yield pressure is pulling providers away before internal utilization visibly collapses.',
        severity,
        affected_metrics: metrics.hasVampireSeries
          ? ['vampire_churn', 'weekly_retention_rate', 'network_utilization']
          : ['weekly_retention_rate', 'network_utilization'],
        why_it_matters: 'When supply is mobile, node count can look stable right up until provider exits accelerate.',
        trigger_logic: `${triggerPrefix} Weekly retention is ${roundTo(metrics.retention, 1)}% and average vampire churn is ${roundTo(metrics.avgVampireChurn, 1)} providers per step.`,
      };
    case 'profitability-induced-churn':
      return {
        id: 'profitability-induced-churn',
        label: 'Profitability-Induced Churn',
        pattern: 'Operator economics are weakening enough that supply stability starts to follow the break path.',
        severity,
        affected_metrics: ['payback_period', 'weekly_retention_rate', 'tail_risk_score'],
        why_it_matters: 'Once provider tolerance is crossed, churn becomes an amplifier rather than a lagging side effect.',
        trigger_logic: `${triggerPrefix} Retention is ${roundTo(metrics.retention, 1)}%, payback is ${roundTo(metrics.payback, 1)} months, and provider retention sits at ${roundTo(metrics.providerRetentionPct, 1)}% of the starting base.`,
      };
    case 'latent-capacity-degradation':
      return {
        id: 'latent-capacity-degradation',
        label: 'Latent Capacity Degradation',
        pattern: 'Demand conversion is weakening before visible capacity disappears, so the network looks healthier than the economic flow underneath it.',
        severity,
        affected_metrics: ['network_utilization', 'solvency_ratio'],
        why_it_matters: 'Utilization can break first while physical supply still appears intact, which makes node count a lagging comfort signal.',
        trigger_logic: `${triggerPrefix} Utilization is ${roundTo(metrics.utilization, 1)}% while provider retention remains ${roundTo(metrics.providerRetentionPct, 1)}%.`,
      };
    default:
      return null;
  }
}

export function buildLiveDTSEFailureSignatures(
  aggregated: AggregateResult[],
  params: SimulationParams,
  outcomes: DTSEOutcome[],
  sequenceView?: DTSESequenceView | null,
): DTSEFailureSignature[] {
  if (!Array.isArray(aggregated) || aggregated.length === 0) {
    return [];
  }

  if (sequenceView && sequenceView.earliestTriggerWeek === null) {
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
  const hasVampireSeries = aggregated.some((point) => Number.isFinite(point.vampireChurn?.mean));
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
      affected_metrics: hasVampireSeries
        ? ['vampire_churn', 'weekly_retention_rate', 'network_utilization']
        : ['weekly_retention_rate', 'network_utilization'],
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

  const leadSignatureId = resolveLeadSignatureId(sequenceView ?? undefined, params);
  if (leadSignatureId && sequenceView) {
    const existingLeadSignature = signatures.find((signature) => signature.id === leadSignatureId);
    if (!existingLeadSignature) {
      const sequenceAnchoredSignature = buildSequenceAnchoredSignature(leadSignatureId, sequenceView, params, {
        solvency,
        payback,
        retention,
        utilization,
        tailRisk,
        avgVampireChurn,
        hasVampireSeries,
        providerRetentionPct,
        priceCompressionPct,
      });
      if (sequenceAnchoredSignature) {
        signatures.push(sequenceAnchoredSignature);
      }
    }
  }

  const severityRank: Record<DTSEFailureSignature['severity'], number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return signatures.sort((left, right) => {
    if (leadSignatureId) {
      if (left.id === leadSignatureId && right.id !== leadSignatureId) return -1;
      if (right.id === leadSignatureId && left.id !== leadSignatureId) return 1;
    }
    const severityDiff = severityRank[left.severity] - severityRank[right.severity];
    if (severityDiff !== 0) return severityDiff;
    return CANONICAL_SIGNATURE_ORDER.indexOf(left.id) - CANONICAL_SIGNATURE_ORDER.indexOf(right.id);
  });
}
