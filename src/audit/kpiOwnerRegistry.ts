import type { DecisionKpiFamily, DecisionKpiOwnerVersion } from '../types/decisionBrief';

export const KPI_OWNER_REGISTRY: Record<DecisionKpiFamily, DecisionKpiOwnerVersion> = {
  payback: { owner: 'Benchmark', version: 'benchmark.payback.v1' },
  solvency: { owner: 'Root Causes', version: 'diagnostic.solvency.v1' },
  utility: { owner: 'Strategy', version: 'strategy.utility.v1' },
  sensitivity: { owner: 'Root Causes', version: 'diagnostic.sensitivity.v1' },
  tail_risk: { owner: 'Strategy', version: 'strategy.tail-risk.v1' }
};

const EXPLICIT_METRIC_FAMILY: Record<string, DecisionKpiFamily> = {
  payback_period: 'payback',
  benchmark_payback: 'payback',
  comp_payback_period: 'payback',
  solvency_ratio: 'solvency',
  benchmark_sustain: 'solvency',
  diagnostic_cost_vs_revenue: 'solvency',
  diagnostic_underwater_count: 'solvency',
  network_utilization: 'utility',
  utility_health_score: 'utility',
  benchmark_efficiency: 'utility',
  effective_capacity: 'utility',
  diagnostic_join_flow: 'sensitivity',
  sensitivity_delta: 'sensitivity',
  weekly_retention_rate: 'tail_risk',
  benchmark_retention: 'tail_risk',
  vampire_churn: 'tail_risk',
  tail_risk_score: 'tail_risk'
};

export const resolveKpiFamily = (metricId: string): DecisionKpiFamily | null => {
  if (!metricId) return null;

  const normalized = metricId.trim().toLowerCase();
  if (!normalized) return null;

  const explicit = EXPLICIT_METRIC_FAMILY[normalized];
  if (explicit) return explicit;

  if (normalized.includes('payback') || normalized.includes('roi')) return 'payback';
  if (normalized.includes('solvency') || normalized.includes('underwater') || normalized.includes('burn')) return 'solvency';
  if (normalized.includes('capacity') || normalized.includes('utilization') || normalized.includes('efficiency')) return 'utility';
  if (normalized.includes('sensitivity') || normalized.includes('join_flow')) return 'sensitivity';
  if (normalized.includes('risk') || normalized.includes('retention') || normalized.includes('churn')) return 'tail_risk';

  return null;
};

export const resolveKpiOwnerVersions = (
  metricIds: string[]
): Partial<Record<DecisionKpiFamily, DecisionKpiOwnerVersion>> => {
  const result: Partial<Record<DecisionKpiFamily, DecisionKpiOwnerVersion>> = {};
  for (const metricId of metricIds) {
    const family = resolveKpiFamily(metricId);
    if (!family || result[family]) continue;
    result[family] = KPI_OWNER_REGISTRY[family];
  }
  return result;
};
