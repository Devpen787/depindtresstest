import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
  Cell,
  CartesianGrid,
} from 'recharts';
import type { DTSEApplicabilityEntry, DTSEMetricInsight, DTSEOutcome } from '../../types/dtse';
import type { GuardrailBand } from '../../constants/guardrails';
import type { DTSESequenceView } from '../../utils/dtseSequenceView';

export interface DTSEThresholdConfig {
  healthyTarget: number;
  direction: 'higher' | 'lower';
  label: string;
}

interface DTSEOutcomesStageProps {
  outcomes: DTSEOutcome[];
  weeklySolvency?: number[];
  trajectorySource?: 'model' | 'frozen';
  metricLabels: Record<string, string>;
  unitMap: Record<string, string>;
  applicabilityEntries: DTSEApplicabilityEntry[];
  metricInsights: Record<string, DTSEMetricInsight>;
  thresholdConfigMap: Record<string, DTSEThresholdConfig>;
  sequenceView?: DTSESequenceView;
}

const BAND_STYLES: Record<GuardrailBand, {
  bg: string; border: string; text: string; dot: string; shadow: string; glow: string;
}> = {
  healthy: {
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.05)]',
    glow: 'from-emerald-500/20 to-transparent',
  },
  watchlist: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.05)]',
    glow: 'from-amber-500/20 to-transparent',
  },
  intervention: {
    bg: 'bg-rose-500/5',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]',
    shadow: 'shadow-[0_0_20px_rgba(225,29,72,0.05)]',
    glow: 'from-rose-500/20 to-transparent',
  },
};

const BandIcon: React.FC<{ band: GuardrailBand }> = ({ band }) => {
  if (band === 'healthy') return <TrendingUp size={16} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />;
  if (band === 'intervention') return <TrendingDown size={16} className="text-rose-400 drop-shadow-[0_0_5px_rgba(225,29,72,0.5)]" />;
  return <Minus size={16} className="text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />;
};

export const DTSEOutcomesStage: React.FC<DTSEOutcomesStageProps> = ({
  outcomes,
  weeklySolvency,
  trajectorySource = 'frozen',
  metricLabels,
  unitMap,
  applicabilityEntries,
  metricInsights,
  thresholdConfigMap,
  sequenceView,
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
  const pathwaySeverityStyles = {
    none: 'bg-slate-900/80 border border-slate-800/80',
    watch: 'bg-amber-500/20 border border-amber-500/30',
    alert: 'bg-rose-500/30 border border-rose-500/40',
    critical: 'bg-rose-400/70 border border-rose-300/80 shadow-[0_0_8px_rgba(251,113,133,0.45)]',
  } as const;
  const triggeredFamilies = sequenceView?.pathway.filter((row) => row.triggerWeek !== null).length ?? 0;

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

  return (
    <div data-cy="dtse-outcomes-stage" className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
          Stage 3 — Stress Results
        </h2>
        <p className="text-sm font-medium text-slate-400">
          Read this as deterioration order under matched conditions. Focus on the first breaks and the path of deterioration, not raw magnitude.
        </p>
      </div>

      {sequenceView && (
        <>
          <section className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Baseline Drift</p>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-950/45 p-4 backdrop-blur-sm">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Stress deviation vs baseline</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                      Zero marks the matched baseline. Negative drift shows where stress pushes the network off its expected path.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-900/35 px-3 py-2 text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Earliest break</p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      {sequenceView.earliestTriggerWeek ? `Week ${sequenceView.earliestTriggerWeek}` : 'Contained'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">{sequenceView.earliestTriggerLabel ?? 'No early threshold breach detected'}</p>
                  </div>
                </div>
                <div data-cy="dtse-baseline-drift-chart" className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sequenceView.deviationSeries} margin={{ top: 12, right: 16, left: 6, bottom: 8 }}>
                      <CartesianGrid stroke="#172033" strokeDasharray="2 4" vertical={false} />
                      <XAxis
                        dataKey="week"
                        stroke="#475569"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(week) => `W${week}`}
                      />
                      <YAxis
                        stroke="#475569"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b' }}
                        labelStyle={{ color: '#cbd5e1' }}
                        formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                        labelFormatter={(label) => `Week ${label}`}
                      />
                      <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="solvencyDeltaPct" name="Solvency" stroke="#60a5fa" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="utilizationDeltaPct" name="Utilization" stroke="#34d399" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="providerDeltaPct" name="Providers" stroke="#fbbf24" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="priceDeltaPct" name="Price" stroke="#f472b6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-2xl border border-white/5 bg-slate-950/45 p-4 backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Earliest trigger</p>
                    <p className="mt-2 text-lg font-bold text-white">
                      {sequenceView.earliestTriggerWeek ? `Week ${sequenceView.earliestTriggerWeek}` : 'Contained'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{sequenceView.earliestTriggerLabel ?? 'No early breach detected.'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-slate-950/45 p-4 backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Triggered families</p>
                    <p className="mt-2 text-lg font-bold text-white">{triggeredFamilies}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">Subsystems that materially diverged from baseline.</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-slate-950/45 p-4 backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Interpretive boundary</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      DTSE compares drift from a matched baseline path. It does not forecast live-network truth or reduce unlike protocols to a single winner score.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">The DePIN Illusion</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {sequenceView.illusionWarning}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Transmission Pathway</p>
            <div className="rounded-2xl border border-white/5 bg-slate-950/45 p-4 backdrop-blur-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">What breaks first</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                    Each row shows when a subsystem first leaves the healthy or baseline envelope. Earlier rows usually absorb the shock before node count visibly reacts.
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-900/35 px-3 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Legend</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                    <span className={`h-2.5 w-2.5 rounded-sm ${pathwaySeverityStyles.watch}`} />
                    Watch
                    <span className={`ml-2 h-2.5 w-2.5 rounded-sm ${pathwaySeverityStyles.alert}`} />
                    Alert
                    <span className={`ml-2 h-2.5 w-2.5 rounded-sm ${pathwaySeverityStyles.critical}`} />
                    Critical
                  </div>
                </div>
              </div>

              <div data-cy="dtse-transmission-pathway" className="space-y-3">
                {sequenceView.pathway.map((row) => (
                  <div key={row.familyId} className="rounded-xl border border-white/5 bg-slate-900/20 p-3.5">
                    <div className="grid gap-3 xl:grid-cols-[240px_1fr_260px] xl:items-start">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-100">{row.label}</p>
                          <span className="rounded-full border border-white/5 bg-slate-900/60 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                            {row.triggerWeek ? `Week ${row.triggerWeek}` : 'Contained'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{row.triggerLabel}</p>
                      </div>
                      <div>
                        <div
                          className="grid gap-1"
                          style={{ gridTemplateColumns: `repeat(${row.cells.length}, minmax(0, 1fr))` }}
                        >
                          {row.cells.map((cell) => (
                            <div
                              key={`${row.familyId}-${cell.week}`}
                              title={`Week ${cell.week}`}
                              className={`h-6 rounded-[4px] ${pathwaySeverityStyles[cell.severity]}`}
                            />
                          ))}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-slate-500">
                          <span>Week 1</span>
                          <span>Week {row.cells.length}</span>
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500">{row.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Secondary Readout</p>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Band snapshot</p>
                  <h3 className="mt-2 text-base font-bold text-white">Where guardrails are holding or slipping</h3>
                </div>
              <div className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300">
                {trajectorySource === 'model' ? 'Current run' : 'Saved run'}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {(['healthy', 'watchlist', 'intervention'] as GuardrailBand[]).map((band) => {
                const s = BAND_STYLES[band];
                return (
                  <div key={band} className={`relative overflow-hidden rounded-xl border p-4 text-center backdrop-blur-sm ${s.bg} ${s.border} ${s.shadow}`}>
                    <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${s.glow} opacity-50`} />
                    <div className={`text-4xl font-black tracking-tighter ${s.text} drop-shadow-md`}>{bandCounts[band]}</div>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{band}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-slate-900/25 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Coverage</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {scoredOutcomes.length} scored metric{scoredOutcomes.length === 1 ? '' : 's'}
                  {excludedOutcomes.length > 0 ? ` · ${excludedOutcomes.length} excluded` : ''}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Keep this secondary. Sequence, timing, and baseline drift explain more than band counts alone.
                </p>
              </div>
            </div>

          {chartData.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-950/45 p-4 backdrop-blur-sm">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Threshold chart</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                    `100%` marks the healthy threshold for each metric.
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-900/35 px-3 py-2 text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Reference</p>
                  <p className="mt-1 text-sm font-semibold text-slate-200">100% = healthy</p>
                </div>
              </div>
              <div data-cy="dtse-threshold-chart" className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 18, left: 12, bottom: 8 }} barCategoryGap={10}>
                    <XAxis
                      type="number"
                      domain={[0, chartMax]}
                      tickFormatter={(value) => `${Math.round(value)}%`}
                      stroke="#475569"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={140}
                      stroke="#475569"
                      tick={{ fill: '#cbd5e1', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b' }}
                      labelStyle={{ color: '#cbd5e1' }}
                      formatter={(value: number) => [`${value.toFixed(0)}%`, 'Healthy proximity']}
                    />
                    <ReferenceLine
                      x={100}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      label={{ value: 'Healthy', fill: '#94a3b8', fontSize: 10, position: 'top' }}
                    />
                    <Bar
                      dataKey="normalized"
                      radius={[0, 8, 8, 0]}
                      barSize={18}
                      minPointSize={8}
                      background={{ fill: '#0f172a', radius: 8 }}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.metricId} fill={chartColorByBand[entry.band]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Lower bars show more distance from the target range.</p>
            </div>
          )}
        </div>
      </section>

      {hasTrajectory && (
        <section className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Solvency</p>
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Solvency trajectory (52 weeks)</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">Weekly solvency trend.</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-900/35 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Healthy line</p>
                <p className="mt-1 text-sm font-semibold text-slate-200">1.3x</p>
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
                    stroke="#475569"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(week) => `W${week}`}
                  />
                  <YAxis
                    domain={[trajectoryMin, trajectoryMax]}
                    stroke="#475569"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(value) => `${value.toFixed(1)}x`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b' }}
                    labelStyle={{ color: '#cbd5e1' }}
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
            <p className="mt-2 text-[11px] text-slate-500">
              {trajectorySource === 'model' ? 'Based on the current run.' : 'Based on the saved scenario data.'}
            </p>
          </div>
        </section>
      )}

      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Metrics</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scoredOutcomes.map((outcome, idx) => {
            const s = BAND_STYLES[outcome.band];
            const label = metricLabels[outcome.metric_id] ?? outcome.metric_id;
            const unit = unitMap[outcome.metric_id] ?? '';
            const insight = metricInsights[outcome.metric_id];
            const thresholdConfig = thresholdConfigMap[outcome.metric_id];
            const interpretation = insight?.interpretation[outcome.band] ?? 'Interpret using guardrail context.';
            const isDerived = !applicabilityByMetric[outcome.metric_id];

            return (
              <div
                key={outcome.metric_id}
                data-cy={`dtse-outcome-${outcome.metric_id}`}
                className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/28 p-4 space-y-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/10 ${s.shadow}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`absolute -right-10 -top-10 h-24 w-24 bg-gradient-to-br ${s.glow} blur-2xl opacity-10 transition-opacity duration-500 group-hover:opacity-20`} />

                <div className="relative z-10 flex items-start justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
                  <div className="rounded-md border border-slate-800 bg-slate-950/50 p-1.5 shadow-inner">
                    <BandIcon band={outcome.band} />
                  </div>
                </div>

                <div className="relative z-10 flex items-baseline gap-2">
                  <span className={`text-3xl font-black tracking-tight ${s.text} drop-shadow-sm`}>
                    {typeof outcome.value === 'number' ? outcome.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : outcome.value}
                  </span>
                  {unit && <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{unit}</span>}
                </div>

                <div className="relative z-10 flex items-center gap-2 border-b border-white/5 pb-2.5">
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${s.text}`}>{outcome.band}</span>
                  {isDerived && (
                    <>
                      <span className="px-1 text-slate-600">·</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Derived</span>
                    </>
                  )}
                </div>

                {thresholdConfig && (
                  <p className="relative z-10 -mt-1 text-[11px] leading-relaxed text-slate-500/95">
                    <span className="font-semibold text-slate-400">Healthy threshold:</span>{' '}
                    {thresholdConfig.direction === 'higher' ? '≥' : '≤'} {thresholdConfig.label}
                  </p>
                )}

                <div className="relative z-10 space-y-1.5 pt-0.5">
                  {insight && (
                    <p className="text-[11px] font-medium leading-relaxed text-slate-500/90">
                      <span className="font-bold tracking-wide text-slate-400">Target:</span> {insight.target}
                    </p>
                  )}
                  <p className="text-[11px] font-medium leading-relaxed text-slate-400">{interpretation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {excludedOutcomes.length > 0 && (
        <section className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Excluded</p>
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-950/35 p-4 backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">Excluded from scoring</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {excludedOutcomes.map((outcome) => {
                const label = metricLabels[outcome.metric_id] ?? outcome.metric_id;
                const applicability = applicabilityByMetric[outcome.metric_id];
                return (
                  <div key={outcome.metric_id} className="rounded-xl border border-white/5 bg-slate-900/20 p-3.5 transition-colors hover:bg-slate-900/35">
                    <p className="text-xs font-bold tracking-wide text-slate-300">{label}</p>
                    <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-slate-500">
                      {applicability?.details ?? 'Excluded from scoring.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
