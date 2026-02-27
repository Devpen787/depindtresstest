import {
  UTILIZATION_GUARDRAILS,
  classifyPaybackBand,
  classifyTailRiskBand,
  type GuardrailBand,
} from '../constants/guardrails';
import { calculateWeeklyRetentionEstimate, normalizePaybackMonths } from '../audit/benchmarkViewMath';
import {
  calculateOwnerSolvencyRatio,
  calculateOwnerTailRiskScore,
  calculateOwnerUtilitySnapshot,
  classifyRetentionBand,
  classifySolvencyBand,
} from '../audit/kpiOwnerMath';
import type { AggregateResult, DerivedMetrics, SimulationParams } from '../model/types';
import type { DTSERunContext, DTSEOutcome } from '../types/dtse';

const roundTo = (value: number, digits: number = 2): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const classifyNetworkUtilizationBand = (utilizationPct: number): GuardrailBand => {
  if (!Number.isFinite(utilizationPct)) return 'intervention';
  if (utilizationPct < UTILIZATION_GUARDRAILS.watchlistMinPct) return 'intervention';
  if (utilizationPct < UTILIZATION_GUARDRAILS.healthyMinPct) return 'watchlist';
  return 'healthy';
};

const deriveStressResilienceOutcome = (outcomes: DTSEOutcome[]): DTSEOutcome => {
  const scoreByBand: Record<GuardrailBand, number> = {
    healthy: 85,
    watchlist: 62,
    intervention: 38,
  };
  const avgScore = outcomes.length === 0
    ? 60
    : Math.round(outcomes.reduce((sum, outcome) => sum + scoreByBand[outcome.band], 0) / outcomes.length);
  const band = avgScore >= 70 ? 'healthy' : avgScore >= 55 ? 'watchlist' : 'intervention';

  return {
    metric_id: 'stress_resilience_index',
    value: avgScore,
    band,
    evidence_ref: 'derived_from_live_model_outputs',
  };
};

const calculatePaybackMonthsFromAggregate = (
  point: AggregateResult | undefined,
  params: SimulationParams,
): number => {
  if (!point) return normalizePaybackMonths(Number.POSITIVE_INFINITY);
  if (!Number.isFinite(params.hardwareCost) || params.hardwareCost <= 0) return 0;

  const providers = Math.max(1, point.providers?.mean || 1);
  const price = Math.max(0, point.price?.mean || 0);
  const mintedPerProvider = (point.minted?.mean || 0) / providers;
  const weeklyRevenueUsd = mintedPerProvider * price;
  const weeklyProfitUsd = weeklyRevenueUsd - params.providerCostPerWeek;

  if (weeklyProfitUsd <= 0) {
    return normalizePaybackMonths(Number.POSITIVE_INFINITY);
  }

  return roundTo((params.hardwareCost / weeklyProfitUsd) / 4.33, 1);
};

export interface BuildLiveDTSEOutputsResult {
  outcomes: DTSEOutcome[];
  weeklySolvency: number[];
}

export function buildLiveDTSEOutputs(
  aggregated: AggregateResult[],
  params: SimulationParams,
  derivedMetrics?: DerivedMetrics | null,
): BuildLiveDTSEOutputsResult | null {
  if (!Array.isArray(aggregated) || aggregated.length === 0) {
    return null;
  }

  const lastPoint = aggregated[aggregated.length - 1];
  const fallbackRetention = Number.isFinite(derivedMetrics?.retentionRate)
    ? Number(derivedMetrics?.retentionRate)
    : 100;
  const weeklyRetentionRate = calculateWeeklyRetentionEstimate(
    aggregated.map((point) => ({
      providers: point.providers?.mean || 0,
      churn: point.churnCount?.mean || 0,
    })),
    fallbackRetention,
  );
  const networkUtilization = calculateOwnerUtilitySnapshot(lastPoint).utilizationPct;
  const tailRiskScore = calculateOwnerTailRiskScore(aggregated);
  const paybackPeriod = calculatePaybackMonthsFromAggregate(lastPoint, params);

  const primaryOutcomes: DTSEOutcome[] = [
    {
      metric_id: 'solvency_ratio',
      value: roundTo(calculateOwnerSolvencyRatio(lastPoint), 2),
      band: classifySolvencyBand(calculateOwnerSolvencyRatio(lastPoint)),
      evidence_ref: 'model.aggregate.final.solvencyScore.mean',
    },
    {
      metric_id: 'payback_period',
      value: paybackPeriod,
      band: classifyPaybackBand(paybackPeriod),
      evidence_ref: 'model.derived.final.provider_payback_months',
    },
    {
      metric_id: 'weekly_retention_rate',
      value: roundTo(weeklyRetentionRate, 1),
      band: classifyRetentionBand(weeklyRetentionRate),
      evidence_ref: 'model.derived.trailing_weekly_retention_rate',
    },
    {
      metric_id: 'network_utilization',
      value: roundTo(networkUtilization, 1),
      band: classifyNetworkUtilizationBand(networkUtilization),
      evidence_ref: 'model.aggregate.final.utilization.mean',
    },
    {
      metric_id: 'tail_risk_score',
      value: roundTo(tailRiskScore, 0),
      band: classifyTailRiskBand(tailRiskScore),
      evidence_ref: 'model.derived.tail_risk_score',
    },
  ];

  const outcomes = [...primaryOutcomes, deriveStressResilienceOutcome(primaryOutcomes)];
  const weeklySolvency = aggregated.map((point) => roundTo(calculateOwnerSolvencyRatio(point), 3));

  return { outcomes, weeklySolvency };
}

export interface BuildLiveDTSERunContextInputs {
  profileId: string;
  params: SimulationParams;
  simulationRunId: number;
  modelVersion: string;
  outcomes: DTSEOutcome[];
  weeklySolvency: number[];
  fallbackScenarioGridId?: string;
  failureSignatures?: DTSERunContext['failure_signatures'];
  recommendations?: DTSERunContext['recommendations'];
}

export function buildLiveDTSERunContext({
  profileId,
  params,
  simulationRunId,
  modelVersion,
  outcomes,
  weeklySolvency,
  fallbackScenarioGridId,
  failureSignatures,
  recommendations,
}: BuildLiveDTSERunContextInputs): DTSERunContext {
  const scenarioGridId = [
    params.scenario || fallbackScenarioGridId || 'runtime',
    profileId,
    `${params.T}w`,
  ].filter(Boolean).join('-');

  return {
    scenario_grid_id: scenarioGridId,
    run_id: `dtse-live-${profileId}-${simulationRunId}`,
    seed_policy: { seed: params.seed, locked: true },
    horizon_weeks: params.T,
    n_sims: params.nSims,
    evidence_status: 'partial',
    protocol_id: profileId,
    model_version: modelVersion,
    generated_at_utc: new Date().toISOString(),
    bundle_hash: `runtime:${profileId}:${simulationRunId}`,
    weekly_solvency: weeklySolvency,
    outcomes,
    failure_signatures: failureSignatures,
    recommendations,
  };
}
