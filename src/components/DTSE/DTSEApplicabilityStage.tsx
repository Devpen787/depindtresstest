import React from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import type { DTSEApplicabilityEntry, DTSEMetricInsight } from '../../types/dtse';

interface DTSEApplicabilityStageProps {
  entries: DTSEApplicabilityEntry[];
  metricLabels: Record<string, string>;
  metricInsights: Record<string, DTSEMetricInsight>;
  reasonLabels: Record<string, string>;
}

export const DTSEApplicabilityStage: React.FC<DTSEApplicabilityStageProps> = ({
  entries,
  metricLabels,
  metricInsights,
  reasonLabels,
}) => {
  const runnableCount = entries.filter((e) => e.verdict === 'R').length;
  const totalCount = entries.length;

  return (
    <div data-cy="dtse-applicability-stage" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
          Stage 2 — Data Readiness
        </h2>
        <p className="text-sm font-medium text-slate-400">
          Filter the metric set to ensure only high-confidence data enters the simulation.
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-6 relative z-10 border-b border-white/5 pb-4">
          <h3 className="text-sm font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">Metric Applicability</h3>
          <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-800 px-3 py-1.5 rounded-full shadow-inner">
            <span className="text-emerald-400 font-bold text-sm tracking-wide">{runnableCount}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">/ {totalCount} Runnable</span>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          {entries.map((entry) => {
            const isRunnable = entry.verdict === 'R';
            return (
              <div
                key={entry.metricId}
                data-cy={`dtse-applicability-${entry.metricId}`}
                className={`flex flex-col md:flex-row md:items-start justify-between p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 shadow-lg group ${isRunnable
                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40 hover:shadow-[0_0_20px_rgba(225,29,72,0.1)]'
                  }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">
                    {isRunnable ? (
                      <CheckCircle2 size={18} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    ) : (
                      <XCircle size={18} className="text-rose-400 drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-slate-200 tracking-wide">
                      {metricLabels[entry.metricId] ?? entry.metricId}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {entry.details || (isRunnable ? 'High-fidelity data available for scoring.' : 'Excluded from simulation scoring.')}
                    </p>
                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/5 md:grid-cols-2 mt-2">
                      <p className="text-[11px] text-slate-500/90 leading-relaxed">
                        <span className="text-slate-400 font-bold tracking-wide">Measures:</span>{' '}
                        {metricInsights[entry.metricId]?.definition ?? 'No analytical definition.'}
                      </p>
                      <p className="text-[11px] text-slate-500/90 leading-relaxed">
                        <span className="text-slate-400 font-bold tracking-wide">Signal:</span>{' '}
                        {metricInsights[entry.metricId]?.why_relevant ?? 'No signal note available.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex shrink-0 items-center justify-end gap-3 pl-10 md:pl-0">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border shadow-inner ${isRunnable
                      ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'
                      : 'bg-rose-950/40 border-rose-900/50 text-rose-400'
                    }`}>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                      {isRunnable ? 'Runnable' : 'Not Runnable'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider font-semibold bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {entry.reasonCode}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-white/5 bg-slate-950/30 p-4 relative z-10 group transition-all duration-300 hover:border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-indigo-400" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/80">Override Context</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            {Object.entries(reasonLabels).map(([key, label]) => (
              <p key={key} className="text-[11px] text-slate-500/80 font-medium">
                <span className="text-slate-400 font-mono text-[10px] tracking-wider bg-slate-900 px-1.5 py-0.5 rounded mr-1.5 border border-slate-800">
                  {key}
                </span>{' '}
                {label}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
