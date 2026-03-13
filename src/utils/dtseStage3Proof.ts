import type { DTSESequenceView } from './dtseSequenceView';

export type DTSEStage3DriftSeriesKey =
  | 'profitabilityDeltaPct'
  | 'solvencyDeltaPct'
  | 'utilizationDeltaPct'
  | 'providerDeltaPct'
  | 'priceDeltaPct'
  | 'retentionDeltaPct';

export const DTSE_STAGE3_DRIFT_SERIES_CONFIG: Array<{ key: DTSEStage3DriftSeriesKey; label: string }> = [
  { key: 'profitabilityDeltaPct', label: 'Profitability' },
  { key: 'solvencyDeltaPct', label: 'Coverage' },
  { key: 'utilizationDeltaPct', label: 'Utilization' },
  { key: 'providerDeltaPct', label: 'Providers' },
  { key: 'priceDeltaPct', label: 'Price' },
  { key: 'retentionDeltaPct', label: 'Retention' },
];

const PRIMARY_SERIES_BY_FAMILY: Record<
  'profitability' | 'utilization' | 'solvency_proxy' | 'modeled_price' | 'retention_churn',
  DTSEStage3DriftSeriesKey
> = {
  profitability: 'profitabilityDeltaPct',
  utilization: 'utilizationDeltaPct',
  solvency_proxy: 'solvencyDeltaPct',
  modeled_price: 'priceDeltaPct',
  retention_churn: 'retentionDeltaPct',
};

const PRIMARY_LEGEND_LABEL_BY_FAMILY: Partial<Record<DTSESequenceView['pathway'][number]['familyId'], string>> = {
  profitability: 'Provider profitability',
  utilization: 'Capacity utilization drift',
  solvency_proxy: 'Reward coverage drift',
  modeled_price: 'Token price pressure',
  retention_churn: 'Retention / churn drift',
};

const EXPECTED_PROOF_DIRECTION_BY_FAMILY: Partial<Record<DTSESequenceView['pathway'][number]['familyId'], 'negative'>> = {
  profitability: 'negative',
  utilization: 'negative',
  solvency_proxy: 'negative',
  modeled_price: 'negative',
  retention_churn: 'negative',
};

export interface DTSEStage3ProofResolution {
  hasMeaningfulDrift: boolean;
  leadPathwayRow: DTSESequenceView['pathway'][number] | null;
  secondaryPathwayRows: DTSESequenceView['pathway'];
  firstBreakWeek: number | null;
  leadBreakLabel: string;
  primaryDriftKey: DTSEStage3DriftSeriesKey;
  primaryLegendLabel: string;
  secondarySeriesLabels: string;
  firstMarkedWeek: number | null;
  firstMarkedValue: number | null;
  canShowDriftProofChart: boolean;
  driftProofUnavailableReason: string;
  driftDomain: [number, number];
  driftTicks: number[];
  usingFallbackProxy: boolean;
}

export function resolveDTSEStage3Proof(
  sequenceView?: DTSESequenceView | null,
): DTSEStage3ProofResolution {
  const maxAbsDelta = sequenceView
    ? sequenceView.deviationSeries.reduce((max, point) => {
      const localMax = Math.max(
        Math.abs(point.profitabilityDeltaPct),
        Math.abs(point.solvencyDeltaPct),
        Math.abs(point.utilizationDeltaPct),
        Math.abs(point.providerDeltaPct),
        Math.abs(point.priceDeltaPct),
        Math.abs(point.retentionDeltaPct),
      );
      return Math.max(max, localMax);
    }, 0)
    : 0;
  const hasMeaningfulDrift = maxAbsDelta >= 0.1;

  const triggeredPathwayRows = sequenceView?.pathway.filter((row) => row.triggerWeek !== null) ?? [];
  const leadPathwayRow = sequenceView
    ? (
      triggeredPathwayRows.find((row) => (
        row.label === sequenceView.earliestTriggerLabel
        && row.triggerWeek === sequenceView.earliestTriggerWeek
      ))
      ?? [...triggeredPathwayRows].sort(
        (left, right) => (left.triggerWeek ?? Number.POSITIVE_INFINITY) - (right.triggerWeek ?? Number.POSITIVE_INFINITY),
      )[0]
      ?? sequenceView.pathway[0]
      ?? null
    )
    : null;
  const secondaryPathwayRows = leadPathwayRow && sequenceView
    ? sequenceView.pathway.filter((row) => row.familyId !== leadPathwayRow.familyId)
    : [];

  const firstBreakWeek = leadPathwayRow?.triggerWeek ?? sequenceView?.earliestTriggerWeek ?? null;
  const leadBreakLabel = leadPathwayRow?.label ?? sequenceView?.earliestTriggerLabel ?? 'No early break detected';

  const directPrimaryDriftKey: DTSEStage3DriftSeriesKey = leadPathwayRow
    ? PRIMARY_SERIES_BY_FAMILY[leadPathwayRow.familyId]
    : 'solvencyDeltaPct';

  const proofWindowEndWeek = firstBreakWeek !== null ? firstBreakWeek + 6 : null;
  const findLeadProofPoint = (seriesKey: DTSEStage3DriftSeriesKey) => sequenceView?.deviationSeries.find((point) => {
    if (firstBreakWeek === null || proofWindowEndWeek === null) return false;
    if (point.week < firstBreakWeek || point.week > proofWindowEndWeek) return false;
    const value = point[seriesKey];
    const expectedDirection = leadPathwayRow ? EXPECTED_PROOF_DIRECTION_BY_FAMILY[leadPathwayRow.familyId] : 'negative';
    if (expectedDirection === 'negative') return value <= -0.1;
    return Math.abs(value) >= 0.1;
  }) ?? null;

  const directLeadProofPoint = findLeadProofPoint(directPrimaryDriftKey);
  const fallbackPrimaryDriftKey: DTSEStage3DriftSeriesKey | null = leadPathwayRow?.familyId === 'profitability'
    ? 'solvencyDeltaPct'
    : null;
  const fallbackLeadProofPoint = !directLeadProofPoint && fallbackPrimaryDriftKey
    ? findLeadProofPoint(fallbackPrimaryDriftKey)
    : null;

  const primaryDriftKey = fallbackLeadProofPoint && fallbackPrimaryDriftKey
    ? fallbackPrimaryDriftKey
    : directPrimaryDriftKey;
  const leadProofPoint = fallbackLeadProofPoint ?? directLeadProofPoint;
  const usingFallbackProxy = Boolean(fallbackLeadProofPoint && fallbackPrimaryDriftKey === primaryDriftKey);

  const primarySeriesAbsMax = sequenceView
    ? sequenceView.deviationSeries.reduce((max, point) => Math.max(max, Math.abs(point[primaryDriftKey])), 0)
    : 0;
  const supportingSeriesAbsMax = sequenceView
    ? sequenceView.deviationSeries.reduce((max, point) => {
      const localMax = DTSE_STAGE3_DRIFT_SERIES_CONFIG.reduce((seriesMax, series) => {
        if (series.key === primaryDriftKey) return seriesMax;
        return Math.max(seriesMax, Math.abs(point[series.key]));
      }, 0);
      return Math.max(max, localMax);
    }, 0)
    : 0;
  const displayDriftExtent = Math.max(
    20,
    Math.ceil(
      Math.max(
        primarySeriesAbsMax * 1.08,
        Math.min(supportingSeriesAbsMax, Math.max(primarySeriesAbsMax * 0.7, 24)),
      ) / 25,
    ) * 25,
  );
  const driftDomain: [number, number] = [-displayDriftExtent, displayDriftExtent];
  const driftTicks = [driftDomain[0], 0, driftDomain[1]];

  const primarySeriesConfig = DTSE_STAGE3_DRIFT_SERIES_CONFIG.find((series) => series.key === primaryDriftKey) ?? DTSE_STAGE3_DRIFT_SERIES_CONFIG[0];
  const primarySeriesLabel = primarySeriesConfig.label;
  const primaryLegendLabel = leadPathwayRow
    ? (
      leadPathwayRow.familyId === 'profitability' && usingFallbackProxy
        ? 'Provider profitability (solvency proxy)'
        : (PRIMARY_LEGEND_LABEL_BY_FAMILY[leadPathwayRow.familyId] ?? primarySeriesLabel)
    )
    : primarySeriesLabel;
  const secondarySeriesLabels = DTSE_STAGE3_DRIFT_SERIES_CONFIG
    .filter((series) => series.key !== primaryDriftKey)
    .map((series) => series.label)
    .join(' · ');

  const firstMarkedWeek = leadProofPoint?.week ?? null;
  const firstMarkedValue = leadProofPoint?.[primaryDriftKey] ?? null;
  const canShowDriftProofChart = Boolean(
    sequenceView
    && hasMeaningfulDrift
    && firstBreakWeek !== null
    && firstMarkedValue !== null
    && Number.isFinite(firstMarkedValue)
  );
  const driftProofUnavailableReason = leadPathwayRow
    ? `Direct drift proof is withheld for ${leadPathwayRow.label.toLowerCase()} because no clean matched-baseline move appears within the first-break window.`
    : 'Direct drift proof is withheld because the matched-baseline proxy does not support the claimed break cleanly enough to chart.';

  return {
    hasMeaningfulDrift,
    leadPathwayRow,
    secondaryPathwayRows,
    firstBreakWeek,
    leadBreakLabel,
    primaryDriftKey,
    primaryLegendLabel,
    secondarySeriesLabels,
    firstMarkedWeek,
    firstMarkedValue,
    canShowDriftProofChart,
    driftProofUnavailableReason,
    driftDomain,
    driftTicks,
    usingFallbackProxy,
  };
}
