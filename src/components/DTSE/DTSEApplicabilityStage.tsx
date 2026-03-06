import React from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import type { DTSEApplicabilityEntry, DTSEMetricInsight } from '../../types/dtse';

interface DTSEApplicabilityStageProps {
  entries: DTSEApplicabilityEntry[];
  metricLabels: Record<string, string>;
  metricInsights: Record<string, DTSEMetricInsight>;
  reasonLabels: Record<string, string>;
  showAdvanced?: boolean;
}

export const DTSEApplicabilityStage: React.FC<DTSEApplicabilityStageProps> = ({
  entries,
  metricLabels,
  metricInsights,
  reasonLabels,
  showAdvanced = false,
}) => {
  const runnableCount = entries.filter((e) => e.verdict === 'R').length;
  const totalCount = entries.length;

  const buildMetricIntent = (metricId: string) => {
    const definition = metricInsights[metricId]?.definition;
    const relevance = metricInsights[metricId]?.why_relevant;
    if (definition && relevance) {
      return `${definition} This matters because ${relevance.charAt(0).toLowerCase()}${relevance.slice(1)}`;
    }
    return definition ?? relevance ?? 'No analytical note available for this metric.';
  };

  return (
    <div data-cy="dtse-applicability-stage" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-slate-400">
          Stage 2 — Data Readiness
        </h2>
        <p className="text-sm text-slate-500">
          Which metrics we can fairly score in this run.
        </p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-indigo-500/[0.03] blur-[100px] rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-6 relative z-10 border-b border-white/5 pb-4">
          <h3 className="text-sm font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">Applicability Decisions</h3>
          <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-800 px-3 py-1.5 rounded-full shadow-inner">
            <span className="text-emerald-400 font-bold text-sm tracking-wide">{runnableCount}</span>
            <span className="text-xs font-bold text-slate-300">/ {totalCount} included</span>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          {entries.map((entry) => {
            const isRunnable = entry.verdict === 'R';
            const reasonTone = entry.verdict === 'NR'
              ? 'text-rose-300'
              : (entry.reasonCode === 'PROXY_ACCEPTED' || entry.reasonCode === 'INTERPOLATION_RISK')
                ? 'text-amber-300'
                : 'text-slate-300';
            return (
              <div
                key={entry.metricId}
                data-cy={`dtse-applicability-${entry.metricId}`}
                className={`flex flex-col md:flex-row md:items-start justify-between p-4 rounded-lg border transition-all duration-300 shadow-lg group ${isRunnable
                    ? 'bg-emerald-500/10 border-emerald-500/25 hover:border-emerald-400/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.06)]'
                    : 'bg-rose-500/10 border-rose-500/25 hover:border-rose-400/50 hover:shadow-[0_0_12px_rgba(225,29,72,0.06)]'
                  }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">
                    {isRunnable ? (
                      <CheckCircle2 size={18} className="text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]" />
                    ) : (
                      <XCircle size={18} className="text-rose-400 drop-shadow-[0_0_4px_rgba(225,29,72,0.3)]" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-slate-200 tracking-wide">
                      {metricLabels[entry.metricId] ?? entry.metricId}
                    </p>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      {entry.details || (isRunnable ? 'Included in DTSE scoring.' : 'Excluded from DTSE scoring.')}
                    </p>
                    <details className="mt-2 rounded-lg border border-white/10 bg-slate-950/35 p-3">
                      <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                        Details
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {buildMetricIntent(entry.metricId)}
                      </p>
                    </details>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex shrink-0 flex-col items-end justify-center gap-1.5 pl-10 md:pl-0">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border shadow-inner ${isRunnable
                      ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'
                      : 'bg-rose-950/40 border-rose-900/50 text-rose-400'
                    }`}>
                    <span className="text-xs font-black uppercase tracking-[0.18em]">
                      {isRunnable ? 'Included' : 'Excluded'}
                    </span>
                  </div>
                  <p className={`text-xs font-semibold tracking-wide ${reasonTone}`}>
                    {reasonLabels[entry.reasonCode] ?? entry.reasonCode}
                  </p>
                  {showAdvanced && (
                    <p className="text-[11px] font-mono text-slate-500">{entry.reasonCode}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showAdvanced && (
          <details className="mt-8 rounded-xl border border-white/10 bg-slate-950/30 p-4 relative z-10 transition-all duration-300 hover:border-white/15">
            <summary className="flex cursor-pointer list-none items-center gap-2">
              <Info size={14} className="text-indigo-400" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">Data quality reasons</p>
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(reasonLabels).map(([key, label]) => (
                <p key={key} className="text-xs text-slate-300 font-medium">
                  <span className="mr-1.5 rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 font-mono text-xs tracking-wider text-slate-200">
                    {key}
                  </span>
                  {label}
                </p>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};
