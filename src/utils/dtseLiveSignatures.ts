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

  const signatures: DTSEFailureSignature[] = [];

  if (solvency < SOLVENCY_GUARDRAILS.healthyRatio && payback > 24) {
    signatures.push({
      id: 'live-subsidy-trap',
      label: 'Subsidy Trap',
      pattern: 'Emissions and payout obligations are outrunning demand-linked economics, leaving provider ROI dependent on continued token support.',
      severity: solvency < SOLVENCY_GUARDRAILS.criticalRatio || payback > 36 ? 'critical' : 'high',
      affected_metrics: ['solvency_ratio', 'payback_period', 'tail_risk_score'],
      why_it_matters: 'Sustained subsidy dependence can force token dilution, weaken operator confidence, and delay real unit economics.',
      trigger_logic: `Triggered because solvency is ${roundTo(solvency, 2)}x while payback is ${roundTo(payback, 1)} months. Healthy requires solvency ≥ ${SOLVENCY_GUARDRAILS.healthyRatio.toFixed(2)}x and payback ≤ 24 months.`,
    });
  }

  if (utilization < 35 || utilitySummary.overprovisioned) {
    signatures.push({
      id: 'live-demand-gap',
      label: 'Demand Gap',
      pattern: 'Available capacity is not being converted into enough served demand to justify current incentive spend.',
      severity: utilization < 20 || utilitySummary.demandCoverage < 85 ? 'high' : 'medium',
      affected_metrics: ['network_utilization', 'solvency_ratio'],
      why_it_matters: 'Low utilization weakens revenue conversion and keeps the network dependent on emissions rather than durable demand.',
      trigger_logic: utilitySummary.overprovisioned
        ? `Triggered because demand coverage is ${roundTo(utilitySummary.demandCoverage, 1)}% but utilization is only ${roundTo(utilization, 1)}%, indicating overprovisioned supply.`
        : `Triggered because utilization is ${roundTo(utilization, 1)}% and demand coverage is ${roundTo(utilitySummary.demandCoverage, 1)}%, below healthy network absorption.`,
    });
  }

  if (retention < 92 || avgTrailingChurn >= (CHURN_GUARDRAILS.panicPctPerWeek * 0.6) || panicWeeks > 0) {
    signatures.push({
      id: 'live-churn-cascade',
      label: 'Churn Cascade',
      pattern: 'Provider exit pressure is rising faster than healthy replacement, increasing the risk of supply quality deterioration.',
      severity: retention < 90 || panicWeeks >= 2 ? 'high' : 'medium',
      affected_metrics: ['weekly_retention_rate', 'tail_risk_score'],
      why_it_matters: 'Once churn becomes self-reinforcing, service continuity weakens and recovery becomes more expensive.',
      trigger_logic: `Triggered because weekly retention is ${roundTo(retention, 1)}%, trailing average churn is ${roundTo(avgTrailingChurn, 1)}% per week, and panic-threshold churn was hit in ${panicWeeks} week(s).`,
    });
  }

  if (tailRisk >= 35 || risk.drawdown >= 40 || risk.insolvencyWeeks > 0) {
    signatures.push({
      id: 'live-tail-fragility',
      label: 'Tail Fragility',
      pattern: 'Downside outcomes concentrate in severe paths even when the headline average appears manageable.',
      severity: tailRisk >= 65 || risk.drawdown >= 60 ? 'critical' : tailRisk >= 35 ? 'high' : 'medium',
      affected_metrics: ['tail_risk_score', 'solvency_ratio', 'weekly_retention_rate'],
      why_it_matters: 'Fat-tail stress means a modest average result can still hide brittle failure behavior in adverse states.',
      trigger_logic: `Triggered because tail risk is ${roundTo(tailRisk, 0)}, max drawdown is ${roundTo(risk.drawdown, 1)}%, and solvency breached 1.0x in ${risk.insolvencyWeeks} week(s).`,
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
