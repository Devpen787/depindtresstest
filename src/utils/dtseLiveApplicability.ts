import { evaluateApplicability } from '../data/dtseApplicabilityPolicy';
import { getMetricEvidence } from '../data/metricEvidence';
import type { DTSEApplicabilityEntry } from '../types/dtse';
import type { AggregateResult, DerivedMetrics, SimulationParams } from '../model/types';

const DTSE_METRIC_IDS = [
  'solvency_ratio',
  'payback_period',
  'weekly_retention_rate',
  'network_utilization',
  'tail_risk_score',
  'vampire_churn',
] as const;

type MetricId = typeof DTSE_METRIC_IDS[number];

const hasFiniteValue = (value: number | undefined | null): boolean => Number.isFinite(value);

const hasSeriesField = (
  aggregated: AggregateResult[],
  extractor: (point: AggregateResult) => number | undefined | null,
): boolean => aggregated.some((point) => hasFiniteValue(extractor(point)));

const defaultProxyEntry = (metricId: MetricId): DTSEApplicabilityEntry => {
  const evidence = getMetricEvidence(metricId);
  if (evidence) {
    return evaluateApplicability(metricId, evidence);
  }

  return {
    metricId,
    verdict: 'NR',
    reasonCode: 'DATA_MISSING',
    details: `No evidence policy is registered for ${metricId}.`,
  };
};

export function buildLiveDTSEApplicability(
  aggregated: AggregateResult[],
  params: SimulationParams,
  derivedMetrics?: DerivedMetrics | null,
): DTSEApplicabilityEntry[] | null {
  if (!Array.isArray(aggregated) || aggregated.length === 0) {
    return null;
  }

  const entries: DTSEApplicabilityEntry[] = [];

  for (const metricId of DTSE_METRIC_IDS) {
    const baseEntry = defaultProxyEntry(metricId);

    if (metricId === 'solvency_ratio') {
      const hasSolvency = hasSeriesField(aggregated, (point) => point.solvencyScore?.mean);
      entries.push(hasSolvency
        ? {
          ...baseEntry,
          details: 'Simulation output contains weekly solvencyScore aggregates for this run.',
        }
        : {
          metricId,
          verdict: 'NR',
          reasonCode: 'DATA_MISSING',
          details: 'No solvencyScore series is present in the current simulation output.',
        });
      continue;
    }

    if (metricId === 'payback_period') {
      if (!Number.isFinite(params.hardwareCost) || params.hardwareCost <= 0) {
        entries.push({
          metricId,
          verdict: 'NR',
          reasonCode: 'DATA_AVAILABLE',
          details: 'Hardware cost is zero or undefined for this protocol, so payback is not decision-relevant.',
        });
        continue;
      }

      const hasRevenueInputs = hasSeriesField(aggregated, (point) => point.price?.mean)
        && hasSeriesField(aggregated, (point) => point.minted?.mean)
        && hasSeriesField(aggregated, (point) => point.providers?.mean);

      entries.push(hasRevenueInputs
        ? {
          ...baseEntry,
          details: 'Payback is computed from live reward, price, provider-count, OPEX, and hardware-cost inputs.',
        }
        : {
          metricId,
          verdict: 'NR',
          reasonCode: 'DATA_MISSING',
          details: 'Missing price, mint, or provider series required to compute payback.',
        });
      continue;
    }

    if (metricId === 'weekly_retention_rate') {
      const hasRetentionInputs = hasSeriesField(aggregated, (point) => point.providers?.mean)
        && hasSeriesField(aggregated, (point) => point.churnCount?.mean);
      const hasDerivedRetention = hasFiniteValue(derivedMetrics?.retentionRate);

      entries.push((hasRetentionInputs || hasDerivedRetention)
        ? {
          ...baseEntry,
          details: hasDerivedRetention
            ? 'Retention is backed by the current provider trajectory plus derived retention summaries.'
            : 'Retention is computed from provider and churn trajectories in the current run.',
        }
        : {
          metricId,
          verdict: 'NR',
          reasonCode: 'DATA_MISSING',
          details: 'Provider trajectory or churn series is missing, so retention cannot be estimated reliably.',
        });
      continue;
    }

    if (metricId === 'network_utilization') {
      const hasUtilization = hasSeriesField(
        aggregated,
        (point) => (point as AggregateResult & { utilization?: { mean?: number } }).utilization?.mean ?? point.utilisation?.mean,
      );
      const hasDemandCoverageInputs = hasSeriesField(aggregated, (point) => point.demand?.mean)
        && hasSeriesField(
          aggregated,
          (point) => (point as AggregateResult & { demandServed?: { mean?: number }, demand_served?: { mean?: number } }).demandServed?.mean
            ?? (point as AggregateResult & { demand_served?: { mean?: number } }).demand_served?.mean,
        );

      entries.push((hasUtilization || hasDemandCoverageInputs)
        ? {
          ...baseEntry,
          details: 'Utilization is computed from current capacity and demand-served series in the simulation output.',
        }
        : {
          metricId,
          verdict: 'NR',
          reasonCode: 'DATA_MISSING',
          details: 'Demand/capacity inputs are missing, so utilization cannot be computed for this run.',
        });
      continue;
    }

    if (metricId === 'tail_risk_score') {
      const hasTailRiskInputs = hasSeriesField(aggregated, (point) => point.price?.mean)
        && hasSeriesField(aggregated, (point) => point.price?.p10)
        && hasSeriesField(aggregated, (point) => point.solvencyScore?.mean);

      entries.push(hasTailRiskInputs
        ? {
          ...baseEntry,
          details: 'Tail risk is derived from drawdown, tail dispersion, and insolvency behavior in the live simulation path.',
        }
        : {
          metricId,
          verdict: 'NR',
          reasonCode: 'DATA_MISSING',
          details: 'Tail-risk inputs are incomplete; need price and solvency distributions across the run.',
        });
      continue;
    }

    if (metricId === 'vampire_churn') {
      if (!Number.isFinite(params.competitorYield) || params.competitorYield <= 0) {
        entries.push({
          metricId,
          verdict: 'NR',
          reasonCode: 'DATA_AVAILABLE',
          details: 'Competitor-yield stress is inactive in this run, so vampire churn is excluded to avoid unfair scoring.',
        });
        continue;
      }

      const hasVampireSeries = hasSeriesField(aggregated, (point) => point.vampireChurn?.mean);
      entries.push(hasVampireSeries
        ? {
          ...baseEntry,
          details: 'Vampire churn is computed from the live competitive-yield stress path for this run.',
        }
        : {
          metricId,
          verdict: 'NR',
          reasonCode: 'DATA_MISSING',
          details: 'Competitor-yield stress is configured, but no vampire-churn series was emitted by the model.',
        });
      continue;
    }
  }

  return entries;
}
