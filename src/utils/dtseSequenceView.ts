import { RETENTION_GUARDRAILS, SOLVENCY_GUARDRAILS, UTILIZATION_GUARDRAILS } from '../constants/guardrails';
import { calculateWeeklyRetentionEstimate } from '../audit/benchmarkViewMath';
import { calculateOwnerSolvencyRatio, calculateOwnerUtilitySnapshot } from '../audit/kpiOwnerMath';
import type { AggregateResult, SimulationParams } from '../model/types';

type Severity = 'none' | 'watch' | 'alert' | 'critical';

export interface DTSEDeviationPoint {
  week: number;
  priceDeltaPct: number;
  providerDeltaPct: number;
  utilizationDeltaPct: number;
  solvencyDeltaPct: number;
  retentionDeltaPct: number;
}

export interface DTSETransmissionCell {
  week: number;
  severity: Severity;
}

export interface DTSETransmissionPathwayRow {
  familyId: 'profitability' | 'utilization' | 'solvency_proxy' | 'modeled_price' | 'retention_churn';
  label: string;
  triggerWeek: number | null;
  triggerLabel: string;
  detail: string;
  cells: DTSETransmissionCell[];
}

export interface DTSESequenceView {
  deviationSeries: DTSEDeviationPoint[];
  pathway: DTSETransmissionPathwayRow[];
  earliestTriggerWeek: number | null;
  earliestTriggerLabel?: string;
  illusionWarning: string;
}

const roundTo = (value: number, digits = 1): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const pctDelta = (stress: number, baseline: number): number => {
  if (!Number.isFinite(stress) || !Number.isFinite(baseline) || baseline === 0) return 0;
  return ((stress - baseline) / Math.abs(baseline)) * 100;
};

const trailingRetention = (series: AggregateResult[], index: number): number => calculateWeeklyRetentionEstimate(
  series.slice(0, index + 1).map((point) => ({
    providers: point.providers?.mean || 0,
    churn: point.churnCount?.mean || 0,
  })),
  100,
);

const classifyProfitabilitySeverity = (stress: AggregateResult, baseline: AggregateResult): Severity => {
  const stressProfit = stress.profit?.mean ?? 0;
  const baselineProfit = baseline.profit?.mean ?? 0;
  if (stressProfit <= 0 && baselineProfit > 0) return 'critical';
  if (stressProfit <= baselineProfit * 0.55) return 'alert';
  if (stressProfit <= baselineProfit * 0.8) return 'watch';
  return 'none';
};

const classifyUtilizationSeverity = (stress: AggregateResult, baseline: AggregateResult): Severity => {
  const stressUtil = calculateOwnerUtilitySnapshot(stress).utilizationPct;
  const baselineUtil = calculateOwnerUtilitySnapshot(baseline).utilizationPct;
  if (stressUtil < UTILIZATION_GUARDRAILS.watchlistMinPct) return 'critical';
  if (stressUtil < UTILIZATION_GUARDRAILS.healthyMinPct) return 'alert';
  if (baselineUtil - stressUtil >= 5) return 'watch';
  return 'none';
};

const classifySolvencySeverity = (stress: AggregateResult, baseline: AggregateResult): Severity => {
  const stressSolvency = calculateOwnerSolvencyRatio(stress);
  const baselineSolvency = calculateOwnerSolvencyRatio(baseline);
  if (stressSolvency < SOLVENCY_GUARDRAILS.criticalRatio) return 'critical';
  if (stressSolvency < SOLVENCY_GUARDRAILS.healthyRatio) return 'alert';
  if (baselineSolvency - stressSolvency >= 0.1) return 'watch';
  return 'none';
};

const classifyPriceSeverity = (stress: AggregateResult, baseline: AggregateResult): Severity => {
  const stressPrice = stress.price?.mean ?? 0;
  const baselinePrice = baseline.price?.mean ?? 0;
  if (baselinePrice <= 0) return 'none';
  const ratio = stressPrice / baselinePrice;
  if (ratio <= 0.7) return 'critical';
  if (ratio <= 0.85) return 'alert';
  if (ratio <= 0.95) return 'watch';
  return 'none';
};

const classifyRetentionSeverity = (
  stressSeries: AggregateResult[],
  baselineSeries: AggregateResult[],
  index: number,
): Severity => {
  const stressRetention = trailingRetention(stressSeries, index);
  const baselineRetention = trailingRetention(baselineSeries, index);
  const stressProviders = stressSeries[index]?.providers?.mean ?? 0;
  const baselineProviders = baselineSeries[index]?.providers?.mean ?? 0;
  const stressChurn = stressSeries[index]?.churnCount?.mean ?? 0;
  const baselineChurn = baselineSeries[index]?.churnCount?.mean ?? 0;
  if (stressRetention < RETENTION_GUARDRAILS.thesisMinPct) return 'critical';
  if (stressRetention < RETENTION_GUARDRAILS.benchmarkMinPct) return 'alert';
  if (baselineProviders > 0 && stressProviders <= baselineProviders * 0.95) return 'watch';
  if (baselineChurn > 0 && stressChurn >= baselineChurn * 2) return 'watch';
  if (baselineRetention - stressRetention >= 3) return 'watch';
  return 'none';
};

export function buildDTSESequenceView(
  aggregated: AggregateResult[],
  baselineAggregated: AggregateResult[],
  _params: SimulationParams,
): DTSESequenceView | null {
  if (!Array.isArray(aggregated) || !Array.isArray(baselineAggregated) || aggregated.length === 0 || baselineAggregated.length === 0) {
    return null;
  }

  const length = Math.min(aggregated.length, baselineAggregated.length);
  if (length === 0) return null;

  const alignedStress = aggregated.slice(0, length);
  const alignedBaseline = baselineAggregated.slice(0, length);

  const deviationSeries = alignedStress.map((stressPoint, index) => {
    const baselinePoint = alignedBaseline[index];
    return {
      week: index + 1,
      priceDeltaPct: roundTo(pctDelta(stressPoint.price?.mean ?? 0, baselinePoint.price?.mean ?? 0)),
      providerDeltaPct: roundTo(pctDelta(stressPoint.providers?.mean ?? 0, baselinePoint.providers?.mean ?? 0)),
      utilizationDeltaPct: roundTo(
        pctDelta(
          calculateOwnerUtilitySnapshot(stressPoint).utilizationPct,
          calculateOwnerUtilitySnapshot(baselinePoint).utilizationPct,
        ),
      ),
      solvencyDeltaPct: roundTo(
        pctDelta(calculateOwnerSolvencyRatio(stressPoint), calculateOwnerSolvencyRatio(baselinePoint)),
      ),
      retentionDeltaPct: roundTo(
        pctDelta(trailingRetention(alignedStress, index), trailingRetention(alignedBaseline, index)),
      ),
    };
  });

  const pathway: DTSETransmissionPathwayRow[] = [
    {
      familyId: 'profitability',
      label: 'Provider Profitability',
      triggerLabel: 'Provider margin compresses before supply visibly exits.',
      detail: 'Tracks when provider economics rot before node count visibly reacts.',
      cells: alignedStress.map((point, index) => ({
        week: index + 1,
        severity: classifyProfitabilitySeverity(point, alignedBaseline[index]),
      })),
    },
    {
      familyId: 'utilization',
      label: 'Capacity Utilization',
      triggerLabel: 'Demand fill drops relative to the matched baseline.',
      detail: 'Highlights when network capacity stops converting into paid demand.',
      cells: alignedStress.map((point, index) => ({
        week: index + 1,
        severity: classifyUtilizationSeverity(point, alignedBaseline[index]),
      })),
    },
    {
      familyId: 'solvency_proxy',
      label: 'Solvency Proxy',
      triggerLabel: 'Reward coverage slips toward stress-dependent financing.',
      detail: 'Shows when the reward envelope weakens relative to baseline operating economics.',
      cells: alignedStress.map((point, index) => ({
        week: index + 1,
        severity: classifySolvencySeverity(point, alignedBaseline[index]),
      })),
    },
    {
      familyId: 'modeled_price',
      label: 'Modeled Price',
      triggerLabel: 'Market compression propagates into fiat-equivalent reward pressure.',
      detail: 'Compares modeled token price drift against the matched baseline path.',
      cells: alignedStress.map((point, index) => ({
        week: index + 1,
        severity: classifyPriceSeverity(point, alignedBaseline[index]),
      })),
    },
    {
      familyId: 'retention_churn',
      label: 'Retention / Churn',
      triggerLabel: 'Operators start exiting after economics weaken.',
      detail: 'Confirms when provider retention finally breaks after upstream stress signals move first.',
      cells: alignedStress.map((point, index) => ({
        week: index + 1,
        severity: classifyRetentionSeverity(alignedStress, alignedBaseline, index),
      })),
    },
  ].map((row) => ({
    ...row,
    triggerWeek: row.cells.find((cell) => cell.severity !== 'none')?.week ?? null,
  }));

  const earliest = [...pathway]
    .filter((row) => row.triggerWeek !== null)
    .sort((left, right) => (left.triggerWeek ?? Number.POSITIVE_INFINITY) - (right.triggerWeek ?? Number.POSITIVE_INFINITY))[0];

  return {
    deviationSeries,
    pathway,
    earliestTriggerWeek: earliest?.triggerWeek ?? null,
    earliestTriggerLabel: earliest?.label,
    illusionWarning: 'The DePIN illusion: node count is a lagging indicator. Provider economics and demand conversion usually break before physical capacity visibly disappears.',
  };
}
