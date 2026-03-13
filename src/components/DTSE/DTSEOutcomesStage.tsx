import React from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Cell,
  CartesianGrid,
} from 'recharts';
import type { DTSEApplicabilityEntry, DTSEMetricInsight, DTSEOutcome } from '../../types/dtse';
import type { DTSEStressChannel } from '../../types/dtse';
import type { GuardrailBand } from '../../constants/guardrails';
import type { DTSESequenceView } from '../../utils/dtseSequenceView';
import { DTSE_STAGE3_DRIFT_SERIES_CONFIG, resolveDTSEStage3Proof } from '../../utils/dtseStage3Proof';
import { formatDTSEMetricValue } from '../../utils/dtsePresentation';
import { DTSEStageHeader } from './DTSEStageHeader';

export interface DTSEThresholdConfig {
  healthyTarget: number;
  direction: 'higher' | 'lower';
  label: string;
}

interface DTSEOutcomesStageProps {
  isLoading?: boolean;
  hasStressSeries?: boolean;
  hasBaselineSeries?: boolean;
  outcomes: DTSEOutcome[];
  weeklySolvency?: number[];
  trajectorySource?: 'model' | 'frozen';
  metricLabels: Record<string, string>;
  unitMap: Record<string, string>;
  applicabilityEntries: DTSEApplicabilityEntry[];
  metricInsights: Record<string, DTSEMetricInsight>;
  thresholdConfigMap: Record<string, DTSEThresholdConfig>;
  sequenceView?: DTSESequenceView;
  stressChannel?: DTSEStressChannel;
  showAdvanced?: boolean;
  compact?: boolean;
}

const BAND_STYLES: Record<GuardrailBand, {
  bg: string; border: string; text: string; dot: string; shadow: string; glow: string;
}> = {
  healthy: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    shadow: 'shadow-[0_8px_16px_rgba(16,185,129,0.08)]',
    glow: 'from-emerald-200/70 to-transparent',
  },
  watchlist: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    shadow: 'shadow-[0_8px_16px_rgba(245,158,11,0.08)]',
    glow: 'from-amber-200/70 to-transparent',
  },
  intervention: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    shadow: 'shadow-[0_8px_16px_rgba(225,29,72,0.08)]',
    glow: 'from-rose-200/70 to-transparent',
  },
};

const BandIcon: React.FC<{ band: GuardrailBand }> = ({ band }) => {
  if (band === 'healthy') return <TrendingUp size={16} className="text-emerald-600" />;
  if (band === 'intervention') return <TrendingDown size={16} className="text-rose-600" />;
  return <Minus size={16} className="text-amber-600" />;
};

const getLeadPathwayFamily = (sequenceView?: DTSESequenceView | null): DTSESequenceView['pathway'][number]['familyId'] | null => {
  if (!sequenceView) return null;
  return sequenceView.pathway.find((row) => (
    row.label === sequenceView.earliestTriggerLabel
    && row.triggerWeek === sequenceView.earliestTriggerWeek
  ))?.familyId ?? sequenceView.pathway.find((row) => row.triggerWeek !== null)?.familyId ?? null;
};

const isLeadMetricForFamily = (
  metricId: string,
  leadFamily: DTSESequenceView['pathway'][number]['familyId'] | null,
): boolean => {
  if (!leadFamily) return false;
  if (leadFamily === 'profitability') return metricId === 'solvency_ratio' || metricId === 'payback_period';
  if (leadFamily === 'solvency_proxy') return metricId === 'solvency_ratio';
  if (leadFamily === 'utilization') return metricId === 'network_utilization';
  if (leadFamily === 'retention_churn') return metricId === 'weekly_retention_rate';
  if (leadFamily === 'modeled_price') return metricId === 'tail_risk_score';
  return false;
};

const buildStage3ConfirmationLine = (
  outcome: DTSEOutcome,
  leadFamily: DTSESequenceView['pathway'][number]['familyId'] | null,
): string => {
  const isLeadMetric = isLeadMetricForFamily(outcome.metric_id, leadFamily);

  switch (outcome.metric_id) {
    case 'solvency_ratio':
      if (outcome.band === 'healthy') {
        return isLeadMetric
          ? 'Coverage is still holding, so the early break has not yet fully translated into a solvency failure.'
          : 'Coverage is still holding above the durable floor, so this is not the first visible break surface in the run.';
      }
      if (outcome.band === 'watchlist') {
        return isLeadMetric
          ? 'Coverage is thinning and sits on the lead economics path in this run.'
          : 'Coverage is thinning, which confirms the economics damage after the first break starts moving.';
      }
      return isLeadMetric
        ? 'Coverage has already broken below the healthy floor, so the lead economics path is no longer clearing emissions cleanly.'
        : 'Coverage has already broken below the healthy floor, confirming the run is carrying real economics damage.';
    case 'payback_period':
      if (outcome.band === 'healthy') {
        return isLeadMetric
          ? 'Payback is still workable, so operator economics are not yet fully seized up at the lead break.'
          : 'Payback is still inside a durable range, so operator economics are not the clearest failure surface here.';
      }
      if (outcome.band === 'watchlist') {
        return isLeadMetric
          ? 'Payback is stretching and supports the early provider-economics break in this run.'
          : 'Payback is stretching, which shows operator economics are getting less resilient under this stress.';
      }
      return isLeadMetric
        ? 'Payback is too long to sustain the lead provider-economics path under this stress.'
        : 'Payback is too long to support resilient operator economics once the run starts deteriorating.';
    case 'weekly_retention_rate':
      if (outcome.band === 'healthy') {
        return isLeadMetric
          ? 'Retention has not fully broken yet, so visible provider exits remain a lagging read even though churn pressure is leading.'
          : 'Retention is still holding, so provider exits remain a later or weaker signal than the lead break.';
      }
      if (outcome.band === 'watchlist') {
        return isLeadMetric
          ? 'Retention is softening and this is the lead visible break in the run.'
          : 'Retention is softening, which suggests provider exits are starting to follow the upstream damage.';
      }
      return isLeadMetric
        ? 'Retention has broken below the healthy band, so supply stability is now the lead visible failure surface.'
        : 'Retention has broken below the healthy band, so supply stability is now reinforcing the stress path.';
    case 'network_utilization':
      if (outcome.band === 'healthy') {
        return isLeadMetric
          ? 'Utilization is still broadly holding in level terms, but it is the earliest matched-baseline surface to weaken.'
          : 'Capacity use is still holding, so demand conversion is not yet the clearest visible break.';
      }
      if (outcome.band === 'watchlist') {
        return isLeadMetric
          ? 'Utilization is slipping and this is the first visible demand-conversion break in the run.'
          : 'Utilization is slipping, which points to weakening demand conversion after the lead break starts.';
      }
      return isLeadMetric
        ? 'Utilization has fallen sharply, so demand conversion is the lead visible failure surface in this run.'
        : 'Utilization has fallen sharply, meaning demand conversion is now failing alongside the main break.';
    case 'tail_risk_score':
      if (outcome.band === 'healthy') {
        return isLeadMetric
          ? 'Tail fragility is still contained even though this run’s lead price signal has already turned.'
          : 'Tail fragility remains contained relative to the matched baseline.';
      }
      if (outcome.band === 'watchlist') {
        return isLeadMetric
          ? 'Tail fragility is elevated, which makes the lead downside signal more dangerous if it keeps compounding.'
          : 'Tail fragility is elevated, so the downside path can worsen faster than average conditions imply.';
      }
      return isLeadMetric
        ? 'Tail fragility is concentrated, so the lead downside signal is carrying real failure risk now.'
        : 'Tail fragility is concentrated, so the run is carrying more downside stress than the averages suggest.';
    default:
      return 'This metric confirms how the run is behaving under the selected stress.';
  }
};

export const DTSEOutcomesStage: React.FC<DTSEOutcomesStageProps> = ({
  isLoading = false,
  hasStressSeries = false,
  hasBaselineSeries = false,
  outcomes,
  weeklySolvency,
  trajectorySource = 'frozen',
  metricLabels,
  unitMap,
  applicabilityEntries,
  metricInsights,
  thresholdConfigMap,
  sequenceView,
  stressChannel,
  showAdvanced = false,
  compact = false,
}) => {
  const applicabilityByMetric: Record<string, DTSEApplicabilityEntry> = {};
  for (const entry of applicabilityEntries) {
    applicabilityByMetric[entry.metricId] = entry;
  }

  const scoredOutcomes = outcomes.filter((outcome) => {
    const applicability = applicabilityByMetric[outcome.metric_id];
    return !applicability || applicability.verdict === 'R';
  });
  const excludedOutcomes = outcomes.filter((outcome) => {
    const applicability = applicabilityByMetric[outcome.metric_id];
    return Boolean(applicability && applicability.verdict === 'NR');
  });

  const bandCounts: Record<GuardrailBand, number> = { healthy: 0, watchlist: 0, intervention: 0 };
  for (const outcome of scoredOutcomes) bandCounts[outcome.band]++;
  const leadPathwayFamily = getLeadPathwayFamily(sequenceView);

  const normalizeToHealthyPercent = (value: number, config: DTSEThresholdConfig): number => {
    if (!Number.isFinite(value)) return 0;
    if (config.direction === 'higher') return (value / config.healthyTarget) * 100;
    if (value <= 0) return 140;
    return (config.healthyTarget / value) * 100;
  };

  const chartData = scoredOutcomes
    .filter((outcome) => outcome.metric_id !== 'stress_resilience_index')
    .map((outcome) => {
      const config = thresholdConfigMap[outcome.metric_id];
      if (!config) return null;
      return {
        metricId: outcome.metric_id,
        label: metricLabels[outcome.metric_id] ?? outcome.metric_id,
        normalized: Math.max(0, Math.min(160, normalizeToHealthyPercent(outcome.value, config))),
        band: outcome.band,
      };
    })
    .filter((entry): entry is { metricId: string; label: string; normalized: number; band: GuardrailBand } => Boolean(entry));

  const chartMax = Math.max(
    120,
    Math.ceil(chartData.reduce((max, entry) => Math.max(max, entry.normalized), 100) / 20) * 20,
  );

  const chartColorByBand: Record<GuardrailBand, string> = {
    healthy: '#34d399',
    watchlist: '#fbbf24',
    intervention: '#fb7185',
  };
  const solvencyTrajectory = (weeklySolvency ?? [])
    .map((value, index) => ({ week: index + 1, solvency: value }))
    .filter((point) => Number.isFinite(point.solvency));
  const hasTrajectory = solvencyTrajectory.length > 1;
  const SOLVENCY_HEALTHY_FLOOR = 1.3;
  const SOLVENCY_INTERVENTION_FLOOR = 0.8;
  const solvencyRange = hasTrajectory
    ? solvencyTrajectory.reduce(
      (range, point) => ({
        min: Math.min(range.min, point.solvency),
        max: Math.max(range.max, point.solvency),
      }),
      { min: Infinity, max: -Infinity },
    )
    : { min: 0.6, max: 1.5 };
  const trajectoryMin = Math.min(0.6, Math.floor((solvencyRange.min - 0.1) * 10) / 10);
  const trajectoryMax = Math.max(1.6, Math.ceil((solvencyRange.max + 0.1) * 10) / 10);
  const severityRank: Record<'none' | 'watch' | 'alert' | 'critical', number> = {
    none: 0,
    watch: 1,
    alert: 2,
    critical: 3,
  };
  const severityLabel: Record<'none' | 'watch' | 'alert' | 'critical', string> = {
    none: 'Contained',
    watch: 'Watch',
    alert: 'Alert',
    critical: 'Critical',
  };
  const severityToneClass: Record<'none' | 'watch' | 'alert' | 'critical', string> = {
    none: 'text-slate-400',
    watch: 'text-amber-400',
    alert: 'text-rose-400',
    critical: 'text-rose-400',
  };
  const sequenceUnavailableReason = !hasStressSeries
    ? 'Run a stress simulation first to populate Stage 3 charts.'
    : !hasBaselineSeries
      ? 'Stress run is available, but baseline comparison is missing. Run baseline to unlock drift and transmission charts.'
      : 'Stress and baseline data are present, but sequence charts could not be built from this run.';
  const pathwayMetricMap: Record<'profitability' | 'utilization' | 'solvency_proxy' | 'modeled_price' | 'retention_churn', string> = {
    profitability: 'Feeds Payback + Solvency readout',
    utilization: 'Feeds Network Utilization readout',
    solvency_proxy: 'Feeds Solvency Ratio readout',
    modeled_price: 'Explains reward-price pressure',
    retention_churn: 'Feeds Weekly Retention readout',
  };
  const metricComputationBasis: Record<string, string> = {
    solvency_ratio: 'Final-week solvency score mean from aggregate simulation outputs.',
    payback_period: 'Hardware cost divided by final-week provider profit converted to months.',
    weekly_retention_rate: 'Trailing retention estimate from weekly provider and churn trajectories.',
    network_utilization: 'Final-week demand served divided by available capacity.',
    tail_risk_score: 'Tail-risk composite from the simulation path (price + solvency behavior).',
  };
  const {
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
  } = resolveDTSEStage3Proof(sequenceView);

  const primarySeriesStroke = '#1d4ed8';
  const firstBreakClaim = sequenceView?.earliestTriggerWeek
    ? `${leadBreakLabel} breaks first at Week ${sequenceView.earliestTriggerWeek}.`
    : 'No first-break trigger detected in this run.';
  const whyItMattersLine = leadPathwayRow?.detail ?? sequenceView?.illusionWarning ?? 'Early stress usually appears in economics before visible supply loss.';
  const severityBadgeClass: Record<'none' | 'watch' | 'alert' | 'critical', string> = {
    none: 'border-slate-200 bg-white text-slate-500 dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-400',
    watch: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    alert: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400',
    critical: 'border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-500/50 dark:bg-rose-500/20 dark:text-rose-300',
  };
  const downstreamRowToneClass: Record<'none' | 'watch' | 'alert' | 'critical', string> = {
    none: 'border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/50',
    watch: 'border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-500/10',
    alert: 'border-rose-200 bg-rose-50/50 dark:border-rose-500/30 dark:bg-rose-500/10',
    critical: 'border-rose-300 bg-rose-100/50 dark:border-rose-500/50 dark:bg-rose-500/20',
  };
  const stressEntryPoint = (() => {
    switch (stressChannel?.id) {
      case 'liquidity_shock':
        return 'token price and fiat-equivalent reward compression';
      case 'competitive_yield_pressure':
        return 'provider retention versus outside-yield substitution';
      case 'provider_cost_inflation':
        return 'provider cost structure and payback pressure';
      case 'demand_contraction':
        return 'utilization and demand-conversion softness';
      case 'baseline_neutral':
        return 'the matched baseline without extra external load';
      default:
        return 'the selected stress contract';
    }
  })();
  const baselineRead = hasMeaningfulDrift ? 'Material divergence' : 'Threshold failure';

  const summarizePathwayRow = (row: DTSESequenceView['pathway'][number]) => {
    const peakSeverity = row.cells.reduce<'none' | 'watch' | 'alert' | 'critical'>(
      (peak, cell) => (severityRank[cell.severity] > severityRank[peak] ? cell.severity : peak),
      'none',
    );
    const activeWeeks = row.cells.filter((cell) => cell.severity !== 'none').length;
    const firstAlertWeek = row.cells.find((cell) => cell.severity === 'alert' || cell.severity === 'critical')?.week ?? null;
    const firstCriticalWeek = row.cells.find((cell) => cell.severity === 'critical')?.week ?? null;
    const metricLink = pathwayMetricMap[row.familyId];
    return { peakSeverity, activeWeeks, firstAlertWeek, firstCriticalWeek, metricLink };
  };

  return (
    <div
      data-cy="dtse-outcomes-stage"
      className={`${compact ? 'space-y-2.5 p-3' : 'space-y-3 p-3.5'} animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-[20px] bg-white border-slate-200 dark:bg-slate-900/40 dark:border-white/5 dark:backdrop-blur-xl border shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-slate-800 dark:text-slate-100 transition-colors`}
    >
      <DTSEStageHeader
        title="Stage 3 — What Broke First"
        description="Failure order first, metric levels second."
        compact={compact}
      />

      {stressChannel && !sequenceView && (
        <section className="space-y-2">
          <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-4 transition-colors">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">Stress channel in this run</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white transition-colors">{stressChannel.label}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
              This run applies a controlled stress channel against a matched baseline to show failure order, not to predict a market path.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">{stressChannel.summary}</p>
            {stressChannel.basis && (
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-500 transition-colors">
                <span className="font-semibold text-slate-800 dark:text-slate-300 transition-colors">Activated by:</span> {stressChannel.basis}
              </p>
            )}
          </div>
        </section>
      )}

      {isLoading && (
        <section className="space-y-2" aria-live="polite" aria-busy="true">
          <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-4 transition-colors">
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-600 dark:text-indigo-400 transition-colors" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors">Computing stress outputs</p>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
              Building baseline-vs-stress comparison for the selected protocol and stress channel.
            </p>
          </div>
          <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-4 transition-colors" role="presentation">
            <div className="h-[220px] w-full animate-pulse rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/50 transition-colors" />
          </div>
        </section>
      )}

      {!isLoading && sequenceView && (
        <section className="space-y-2">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors">Failure sequence in this run</p>
          <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-4 transition-colors">
            <div className={`mb-2.5 rounded-xl border px-3 py-2.5 transition-colors ${sequenceView.earliestTriggerWeek ? 'dtse-animate-breathe border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10' : 'border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-900/60 shadow-sm dark:shadow-inner'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-[0.08em] transition-colors ${sequenceView.earliestTriggerWeek ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>First break claim</p>
              <p className="mt-1 text-lg font-black tracking-tight text-slate-900 dark:text-white transition-colors">{firstBreakClaim}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[0.88fr_1.12fr] xl:items-start mt-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/40 p-3 shadow-sm dark:shadow-inner transition-colors">
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/80 px-2.5 py-2 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Stress enters through</p>
                    <p className="mt-0.5 text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200 transition-colors">{stressEntryPoint}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/80 px-2.5 py-2 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Moves first</p>
                    <p className="mt-0.5 text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-200 transition-colors">
                      {sequenceView.earliestTriggerLabel ?? 'No early breach detected.'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/80 px-2.5 py-2 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Trigger week</p>
                    <p className="mt-0.5 text-xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
                      {sequenceView.earliestTriggerWeek ? `Week ${sequenceView.earliestTriggerWeek}` : 'Contained'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/80 px-2.5 py-2 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Why this matters</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 transition-colors">{whyItMattersLine}</p>
                  </div>
                </div>
              </div>

              <div className="self-start overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/40 p-4 shadow-sm dark:shadow-inner transition-colors">
                <div className="mb-2.5 flex flex-col gap-2.5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">Matched baseline drift (proof)</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
                      Blue shows the lead break signal. Muted lines stay only as baseline context.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">
                    <span className="flex items-center gap-1.5">
                      <i className="h-1.5 w-5 rounded-full" style={{ backgroundColor: primarySeriesStroke }} />
                      {primaryLegendLabel}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="h-0 w-5 border-t-2 border-slate-300 dark:border-slate-600 transition-colors" />
                      Context lines
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="h-0 w-5 border-t-2 border-dashed border-slate-300 dark:border-slate-500 transition-colors" />
                      Baseline
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="h-0 w-5 border-t-2 border-dashed border-rose-500 dark:border-rose-400 transition-colors" />
                      First break
                    </span>
                  </div>
                </div>
                {(hasMeaningfulDrift || showAdvanced) ? (
                  <>
                    {canShowDriftProofChart ? (
                      <>
                        <div data-cy="dtse-baseline-drift-chart" className="h-[252px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sequenceView.deviationSeries} margin={{ top: 10, right: 14, left: 4, bottom: 6 }}>
                              <CartesianGrid stroke="currentColor" className="text-slate-200 dark:text-slate-700 max-[0px]:hidden" strokeOpacity={0.5} strokeDasharray="3 6" vertical={false} />
                              <XAxis
                                dataKey="week"
                                stroke="currentColor"
                                className="text-slate-400 dark:text-slate-500"
                                tick={{ fill: 'currentColor', fontSize: 11 }}
                                tickFormatter={(week) => `W${week}`}
                                minTickGap={22}
                                interval="preserveStartEnd"
                              />
                              <YAxis
                                domain={driftDomain}
                                ticks={driftTicks}
                                stroke="currentColor"
                                className="text-slate-400 dark:text-slate-500"
                                tick={{ fill: 'currentColor', fontSize: 11 }}
                                tickFormatter={(value) => `${value > 0 ? '+' : ''}${Math.round(value)}%`}
                              />
                              <Tooltip
                                contentStyle={{ backgroundColor: 'var(--dtse-tooltip-bg, #ffffff)', border: '1px solid var(--dtse-tooltip-border, #e2e8f0)', color: 'var(--dtse-tooltip-text, #0f172a)' }}
                                itemStyle={{ color: 'var(--dtse-tooltip-text, #0f172a)' }}
                                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                                labelFormatter={(label) => `Week ${label}`}
                              />
                              <ReferenceLine
                                y={0}
                                stroke="#64748b"
                                strokeDasharray="4 4"
                                label={{ value: 'Baseline', fill: '#94a3b8', fontSize: 10, position: 'insideBottomRight' }}
                              />
                              {firstMarkedWeek && firstBreakWeek && firstMarkedWeek > firstBreakWeek && (
                                <ReferenceArea
                                  x1={Math.max(1, firstBreakWeek)}
                                  x2={firstMarkedWeek}
                                  {...({ fill: '#cbd5e1' } as any)}
                                  fillOpacity={0.15}
                                  strokeOpacity={0}
                                />
                              )}
                              {firstMarkedWeek && (
                                <ReferenceArea
                                  x1={Math.max(1, firstMarkedWeek - 0.5)}
                                  x2={firstMarkedWeek + 0.5}
                                  {...({ fill: '#93c5fd' } as any)}
                                  fillOpacity={0.25}
                                  strokeOpacity={0}
                                />
                              )}
                              {firstBreakWeek && (
                                <ReferenceLine
                                  x={firstBreakWeek}
                                  stroke="#fb7185"
                                  strokeDasharray="3 3"
                                />
                              )}
                              {DTSE_STAGE3_DRIFT_SERIES_CONFIG.map((series) => (
                                <Line
                                  key={series.key}
                                  type="monotone"
                                  dataKey={series.key}
                                  name={series.label}
                                  stroke={series.key === primaryDriftKey ? primarySeriesStroke : '#475569'}
                                  strokeWidth={series.key === primaryDriftKey ? 3.2 : 1.35}
                                  strokeOpacity={series.key === primaryDriftKey ? 1 : 0.62}
                                  dot={false}
                                  strokeLinecap="round"
                                  strokeDasharray={series.key === primaryDriftKey ? undefined : '0'}
                                  activeDot={{ r: series.key === primaryDriftKey ? 3.8 : 2.1, fill: series.key === primaryDriftKey ? primarySeriesStroke : '#64748b' }}
                                />
                              ))}
                              {firstMarkedWeek && firstMarkedValue !== null && (
                                <ReferenceDot
                                  x={firstMarkedWeek}
                                  y={firstMarkedValue}
                                  r={4.5}
                                  fill={primarySeriesStroke}
                                  stroke="#0f172a"
                                  strokeWidth={1.5}
                                />
                              )}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-500 transition-colors">
                          Drift signal: <span className="font-semibold text-slate-900 dark:text-slate-300 transition-colors">{baselineRead}</span>. Lead signal: <span className="font-semibold text-slate-900 dark:text-slate-300 transition-colors">{primaryLegendLabel}</span>. Context lines: {secondarySeriesLabels}.
                        </p>
                      </>
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-4 transition-colors">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 transition-colors">Drift proof withheld</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 transition-colors">
                          {driftProofUnavailableReason}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-4 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full border border-amber-300 bg-amber-100 dark:border-amber-400 dark:bg-amber-500/20 p-1.5 transition-colors" aria-hidden="true">
                        <Minus size={14} className="text-amber-600 dark:text-amber-400 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 transition-colors">
                          No material baseline drift in this run.
                        </p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 transition-colors">
                          This run's strongest signal is threshold failure, not baseline divergence.
                        </p>
                        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400 transition-colors">
                          Use first-break timing and threshold outcomes below for the actionable signal in this run.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-inner transition-colors">
              <div className="mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">Transmission pathway</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
                  Read top-down: first break first, then downstream deterioration or contained effects.
                </p>
              </div>

              <div data-cy="dtse-transmission-pathway" className="space-y-2">
                {leadPathwayRow && (() => {
                  const leadMeta = summarizePathwayRow(leadPathwayRow);
                  return (
                    <div className="rounded-lg border border-rose-300 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 p-3 transition-colors">
                      <div className="grid gap-2.5 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-rose-600 dark:text-rose-400 transition-colors">First break</p>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors ${severityBadgeClass[leadMeta.peakSeverity]}`}>
                              {severityLabel[leadMeta.peakSeverity]}
                            </span>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">
                              Basis: {leadMeta.metricLink}
                            </p>
                          </div>
                          <h4 className="mt-1 text-lg font-black tracking-tight text-slate-900 dark:text-white transition-colors">{leadPathwayRow.label}</h4>
                          <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">{leadPathwayRow.triggerLabel}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-t border-rose-200 dark:border-slate-700/50 pt-2 xl:grid-cols-1 transition-colors">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Trigger week</p>
                            <p className="mt-0.5 text-lg font-black tracking-tight text-slate-900 dark:text-white transition-colors">
                              {leadPathwayRow.triggerWeek ? `W${leadPathwayRow.triggerWeek}` : 'Contained'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Peak severity</p>
                            <p className={`mt-0.5 text-xs font-bold uppercase tracking-[0.08em] transition-colors ${severityToneClass[leadMeta.peakSeverity].split(' ').at(-1) ?? 'text-slate-500 dark:text-slate-400'}`}>
                              {severityLabel[leadMeta.peakSeverity]}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Active span</p>
                            <p className="mt-0.5 text-lg font-black tracking-tight text-slate-900 dark:text-white transition-colors">{leadMeta.activeWeeks}w</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {secondaryPathwayRows.map((row, rowIndex) => {
                  const rowMeta = summarizePathwayRow(row);

                  return (
                    <div key={row.familyId} className={`rounded-lg border px-3 py-2.5 transition-colors ${downstreamRowToneClass[rowMeta.peakSeverity]}`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 transition-colors">
                          {rowIndex + 2}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white transition-colors">{row.label}</p>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors ${severityBadgeClass[rowMeta.peakSeverity]}`}>
                              {severityLabel[rowMeta.peakSeverity]}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">
                              {row.triggerWeek ? `Downstream · W${row.triggerWeek}` : 'Contained'}
                            </span>
                            {showAdvanced && (
                              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500 transition-colors">
                                Basis: {rowMeta.metricLink}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                            {row.triggerLabel}
                            {showAdvanced && (rowMeta.firstAlertWeek || rowMeta.firstCriticalWeek) && (
                              <span className="text-xs text-slate-500">
                                {rowMeta.firstAlertWeek ? ` · alert W${rowMeta.firstAlertWeek}` : ''}
                                {rowMeta.firstCriticalWeek ? ` · critical W${rowMeta.firstCriticalWeek}` : ''}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {!isLoading && !sequenceView && (
        <section className="space-y-2">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-400">Sequence view unavailable</p>
            <p className="mt-1 text-sm text-amber-200">Run a simulation to unlock drift and transmission charts.</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-300/80">
              {sequenceUnavailableReason}
            </p>
          </div>
        </section>
      )}

      {!isLoading && showAdvanced && (
        <section className="space-y-2">
          <details className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-4 transition-colors">
            <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">
              Supplementary band snapshot
            </summary>
            <div className="mt-2 grid grid-cols-1 gap-3 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/40 p-4 shadow-sm dark:shadow-inner transition-colors">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-700/50 pb-3 transition-colors">
                <div>
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors">Where guardrails are holding or slipping</p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 transition-colors">
                    {scoredOutcomes.length} scored metric{scoredOutcomes.length === 1 ? '' : 's'}
                    {excludedOutcomes.length > 0 ? ` · ${excludedOutcomes.length} excluded` : ''}
                  </p>
                </div>
                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 transition-colors">
                  {trajectorySource === 'model' ? 'Current run' : 'Saved run'}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(['healthy', 'watchlist', 'intervention'] as GuardrailBand[]).map((band) => {
                  const s = BAND_STYLES[band];
                  return (
                    <div key={band} className={`rounded-lg border p-2.5 text-center ${s.bg} ${s.border}`}>
                      <div className={`text-2xl font-black tracking-tight ${s.text}`}>{bandCounts[band]}</div>
                      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">{band}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/40 p-4 shadow-sm dark:shadow-inner transition-colors">
                <div className="mb-3">
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors">Threshold chart</p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 transition-colors">100% marks the healthy threshold for each metric.</p>
                </div>
                <div data-cy="dtse-threshold-chart" className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 18, left: 12, bottom: 8 }} barCategoryGap={10}>
                      <XAxis
                        type="number"
                        domain={[0, chartMax]}
                        tickFormatter={(value) => `${Math.round(value)}%`}
                        stroke="currentColor"
                        className="text-slate-400 dark:text-slate-500"
                        tick={{ fill: 'currentColor', fontSize: 11 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={140}
                        stroke="currentColor"
                        className="text-slate-400 dark:text-slate-500"
                        tick={{ fill: 'currentColor', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--dtse-tooltip-bg, #ffffff)', border: '1px solid var(--dtse-tooltip-border, #e2e8f0)', color: 'var(--dtse-tooltip-text, #0f172a)' }}
                        itemStyle={{ color: 'var(--dtse-tooltip-text, #0f172a)' }}
                        formatter={(value: number) => [`${value.toFixed(0)}%`, 'Healthy proximity']}
                      />
                      <ReferenceLine
                        x={100}
                        stroke="currentColor"
                        className="text-slate-400 dark:text-slate-500"
                        strokeDasharray="4 4"
                        label={{ value: 'Healthy', fill: 'currentColor', fontSize: 10, position: 'top' }}
                      />
                      <Bar
                        dataKey="normalized"
                        radius={[0, 8, 8, 0]}
                        barSize={18}
                        minPointSize={8}
                        background={{ fill: 'var(--dtse-chart-bg, #f1f5f9)', radius: 8 }}
                      >
                        {chartData.map((entry) => (
                          <Cell key={entry.metricId} fill={chartColorByBand[entry.band]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-1 text-xs text-slate-500">Lower bars = further from healthy.</p>
              </div>
            )}
            </div>
          </details>
        </section>
      )}

      {showAdvanced && (
        <section className="space-y-2">
          <details className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-4 transition-colors">
            <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">
              Supplementary solvency trajectory
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
              Use this only after reading baseline drift and transmission order.
            </p>
            {hasTrajectory ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/40 p-4 shadow-sm dark:shadow-inner transition-colors">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 transition-colors">Solvency trajectory (52 weeks)</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">Weekly solvency trend.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/80 px-2.5 py-1.5 transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Healthy line</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white transition-colors">1.3x</p>
              </div>
            </div>
            <div data-cy="dtse-solvency-trajectory-chart" className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={solvencyTrajectory} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="dtseSolvencyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="week"
                    stroke="currentColor"
                    className="text-slate-400 dark:text-slate-500"
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    tickFormatter={(week) => `W${week}`}
                  />
                  <YAxis
                    domain={[trajectoryMin, trajectoryMax]}
                    stroke="currentColor"
                    className="text-slate-400 dark:text-slate-500"
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    tickFormatter={(value) => `${value.toFixed(1)}x`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--dtse-tooltip-bg, #ffffff)', border: '1px solid var(--dtse-tooltip-border, #e2e8f0)', color: 'var(--dtse-tooltip-text, #0f172a)' }}
                    itemStyle={{ color: 'var(--dtse-tooltip-text, #0f172a)' }}
                    formatter={(value: number) => [`${value.toFixed(2)}x`, 'Solvency ratio']}
                    labelFormatter={(label) => `Week ${label}`}
                  />
                  <ReferenceLine
                    y={SOLVENCY_HEALTHY_FLOOR}
                    stroke="#34d399"
                    strokeDasharray="4 4"
                    label={{ value: 'Healthy floor 1.3x', fill: '#34d399', fontSize: 10, position: 'right' }}
                  />
                  <ReferenceLine
                    y={SOLVENCY_INTERVENTION_FLOOR}
                    stroke="#fb7185"
                    strokeDasharray="4 4"
                    label={{ value: 'Intervention floor 0.8x', fill: '#fb7185', fontSize: 10, position: 'right' }}
                  />
                  <Area
                    dataKey="solvency"
                    type="monotone"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    fill="url(#dtseSolvencyFill)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-600 transition-colors">
              {trajectorySource === 'model' ? 'Based on the current run.' : 'Based on the saved scenario data.'}
            </p>
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 transition-colors">
                <p className="text-sm font-semibold text-amber-800 transition-colors">Trajectory unavailable</p>
                <p className="mt-1 text-sm text-slate-700 transition-colors">Insufficient weekly solvency data for this run.</p>
              </div>
            )}
          </details>
        </section>
      )}

      <section className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">Metric confirmations</p>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          {scoredOutcomes.map((outcome, idx) => {
            const s = BAND_STYLES[outcome.band];
            const label = metricLabels[outcome.metric_id] ?? outcome.metric_id;
            const unit = unitMap[outcome.metric_id] ?? '';
            const insight = metricInsights[outcome.metric_id];
            const thresholdConfig = thresholdConfigMap[outcome.metric_id];
            const interpretation = buildStage3ConfirmationLine(outcome, leadPathwayFamily);
            const isDerived = !applicabilityByMetric[outcome.metric_id];

            return (
              <div
                key={outcome.metric_id}
                data-cy={`dtse-outcome-${outcome.metric_id}`}
                className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] relative rounded-2xl p-4 dtse-card-interactive hover:bg-slate-50 dark:hover:bg-slate-800/80 has-[:open]:dtse-card-expanded has-[:open]:z-10 transition-colors"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">{label}</span>
                  <div className="rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-900/50 p-1 shadow-sm dark:shadow-inner transition-colors">
                    <BandIcon band={outcome.band} />
                  </div>
                </div>

                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className={`text-[22px] font-black tracking-tight tabular-nums ${s.text}`}>
                    {typeof outcome.value === 'number' ? formatDTSEMetricValue(outcome.metric_id, outcome.value) : outcome.value}
                  </span>
                  {unit && <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">{unit}</span>}
                </div>

                <div className="mt-1 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/50 pb-1.5 transition-colors">
                  <span className={`h-2 w-2 rounded-full transition-colors ${s.dot}`} />
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors ${s.text}`}>{outcome.band}</span>
                  {isDerived && (
                    <>
                      <span className="px-1 text-slate-400">·</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Derived</span>
                    </>
                  )}
                </div>

                {thresholdConfig && (
                  <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 transition-colors">Healthy threshold:</span>{' '}
                    {thresholdConfig.direction === 'higher' ? '≥' : '≤'} {thresholdConfig.label}
                  </p>
                )}

                <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-300 transition-colors">
                  {interpretation}
                </p>

                <details className="mt-1 border-t border-slate-200 dark:border-slate-700/50 pt-1.5 transition-colors">
                  <summary className="cursor-pointer text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                    View metric rationale
                  </summary>
                  <div className="mt-1.5 space-y-1">
                    <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-400 transition-colors">
                      <span className="font-semibold text-slate-800 dark:text-slate-300 transition-colors">What it measures:</span> {insight?.definition ?? 'No metric definition available.'}
                    </p>
                    <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-400 transition-colors">
                      <span className="font-semibold text-slate-800 dark:text-slate-300 transition-colors">Why it is flagged now:</span> {interpretation}
                    </p>
                    {showAdvanced && (
                      <p className="text-[12px] leading-relaxed text-slate-500 transition-colors">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 transition-colors">Calculated from:</span>{' '}
                        {metricComputationBasis[outcome.metric_id] ?? 'Model-derived metric pipeline.'}
                        {outcome.evidence_ref ? ` · Evidence ref: ${outcome.evidence_ref}` : ''}
                      </p>
                    )}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      </section>

      {excludedOutcomes.length > 0 && (
        <section className="space-y-2">
          <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-4 transition-colors">
            <p className="text-sm font-bold text-slate-900 dark:text-white transition-colors">Excluded metrics</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400 transition-colors">
              These are excluded to avoid unfair scoring under current evidence quality.
            </p>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/40 p-3 shadow-sm dark:shadow-inner transition-colors">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Excluded from scoring</h3>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {excludedOutcomes.map((outcome) => {
                const label = metricLabels[outcome.metric_id] ?? outcome.metric_id;
                const applicability = applicabilityByMetric[outcome.metric_id];
                return (
                  <div key={outcome.metric_id} className="rounded-lg border border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/80 px-2.5 py-2 transition-colors">
                    <p className="text-[11px] font-semibold tracking-wide text-slate-800 dark:text-white transition-colors">{label}</p>
                    <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
                      {applicability?.details ?? 'Excluded from scoring.'}
                    </p>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
