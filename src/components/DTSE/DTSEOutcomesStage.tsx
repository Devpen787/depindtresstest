import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DTSEApplicabilityEntry, DTSEMetricInsight, DTSEOutcome } from '../../types/dtse';
import type { GuardrailBand } from '../../constants/guardrails';

interface DTSEOutcomesStageProps {
  outcomes: DTSEOutcome[];
  metricLabels: Record<string, string>;
  unitMap: Record<string, string>;
  applicabilityEntries: DTSEApplicabilityEntry[];
  metricInsights: Record<string, DTSEMetricInsight>;
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
  metricLabels,
  unitMap,
  applicabilityEntries,
  metricInsights,
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
  for (const o of scoredOutcomes) bandCounts[o.band]++;

  return (
    <div data-cy="dtse-outcomes-stage" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
          Stage 3 — Stress Results
        </h2>
        <p className="text-sm font-medium text-slate-400">
          Evaluate token resilience against defined safety guardrails under structural stress.
        </p>
      </div>

      {/* Band summary */}
      <div className="grid grid-cols-3 gap-3">
        {(['healthy', 'watchlist', 'intervention'] as GuardrailBand[]).map((band) => {
          const s = BAND_STYLES[band];
          return (
            <div key={band} className={`relative overflow-hidden ${s.bg} border ${s.border} rounded-xl p-5 text-center ${s.shadow} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-default`}>
              <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r ${s.glow} opacity-50`} />
              <div className={`text-4xl font-black tracking-tighter ${s.text} drop-shadow-md`}>{bandCounts[band]}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">
                {band}
              </div>
            </div>
          );
        })}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scoredOutcomes.map((outcome, idx) => {
          const s = BAND_STYLES[outcome.band];
          const label = metricLabels[outcome.metric_id] ?? outcome.metric_id;
          const unit = unitMap[outcome.metric_id] ?? '';
          const insight = metricInsights[outcome.metric_id];
          const interpretation = insight?.interpretation[outcome.band] ?? 'Interpret using guardrail context and peer comparisons.';
          const isDerived = !applicabilityByMetric[outcome.metric_id];
          return (
            <div
              key={outcome.metric_id}
              data-cy={`dtse-outcome-${outcome.metric_id}`}
              className={`relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 space-y-4 hover:-translate-y-1 transition-all duration-300 group hover:border-white/10 ${s.shadow}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${s.glow} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />

              <div className="flex items-start justify-between relative z-10">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <div className="p-1.5 rounded-md bg-slate-950/50 border border-slate-800 shadow-inner">
                  <BandIcon band={outcome.band} />
                </div>
              </div>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className={`text-3xl font-black tracking-tight ${s.text} drop-shadow-sm`}>
                  {typeof outcome.value === 'number' ? outcome.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : outcome.value}
                </span>
                {unit && <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{unit}</span>}
              </div>
              <div className="flex items-center gap-2 relative z-10 pb-3 border-b border-white/5">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${s.text}`}>{outcome.band}</span>
                {isDerived && (
                  <>
                    <span className="text-slate-600 px-1">·</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Derived</span>
                  </>
                )}
              </div>
              {insight && (
                <div className="space-y-2 relative z-10 pt-1">
                  <p className="text-[11px] text-slate-500/90 leading-relaxed font-medium">
                    <span className="text-slate-400 font-bold tracking-wide">Target:</span> {insight.target}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{interpretation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {excludedOutcomes.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-5 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Excluded from scoring (NR)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {excludedOutcomes.map((outcome) => {
              const label = metricLabels[outcome.metric_id] ?? outcome.metric_id;
              const applicability = applicabilityByMetric[outcome.metric_id];
              return (
                <div key={outcome.metric_id} className="rounded-xl border border-white/5 bg-slate-900/30 p-4 transition-colors hover:bg-slate-900/50">
                  <p className="text-xs font-bold text-slate-300 tracking-wide">{label}</p>
                  <p className="text-[11px] text-slate-500 mt-1.5 font-medium leading-relaxed">
                    {applicability?.details ?? 'Excluded due to applicability policy.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
