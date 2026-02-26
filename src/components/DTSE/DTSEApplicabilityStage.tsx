import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { DTSEApplicabilityEntry } from '../../types/dtse';

interface DTSEApplicabilityStageProps {
  entries: DTSEApplicabilityEntry[];
  metricLabels: Record<string, string>;
}

export const DTSEApplicabilityStage: React.FC<DTSEApplicabilityStageProps> = ({
  entries,
  metricLabels,
}) => {
  const runnableCount = entries.filter((e) => e.verdict === 'R').length;
  const totalCount = entries.length;
  const runnablePct = totalCount > 0 ? (runnableCount / totalCount) * 100 : 0;

  return (
    <div data-cy="dtse-applicability-stage" className="space-y-8">
      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
          Stage 2 — Data Readiness
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          Which metrics have enough data to produce a reliable evaluation.
        </p>
      </div>

      {/* Visual progress summary */}
      <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">Metric Readiness</h3>
          <span className="text-sm text-slate-400">
            <span className="text-emerald-400 font-bold">{runnableCount}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span>{totalCount}</span>
            <span className="text-slate-500 ml-1.5 text-xs">runnable</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500/80 rounded-full transition-all"
            style={{ width: `${runnablePct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-600">{Math.round(runnablePct)}% data coverage</span>
          <span className="text-[10px] text-slate-600">{totalCount - runnableCount} blocked</span>
        </div>
      </div>

      {/* Metric rows */}
      <div className="space-y-2.5">
        {entries.map((entry) => (
          <div
            key={entry.metricId}
            data-cy={`dtse-applicability-${entry.metricId}`}
            className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-colors ${
              entry.verdict === 'R'
                ? 'bg-emerald-950/20 border-emerald-900/30'
                : 'bg-red-950/10 border-red-900/25'
            }`}
          >
            <div className="flex items-center gap-3.5">
              {entry.verdict === 'R' ? (
                <CheckCircle size={16} className="text-emerald-400/80 shrink-0" />
              ) : (
                <XCircle size={16} className="text-red-400/80 shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  {metricLabels[entry.metricId] ?? entry.metricId}
                </p>
                {entry.details && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{entry.details}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md min-w-[90px] text-center ${
                entry.verdict === 'R'
                  ? 'bg-emerald-900/40 text-emerald-400/90'
                  : 'bg-red-900/40 text-red-400/90'
              }`}>
                {entry.verdict === 'R' ? 'Runnable' : 'Not Runnable'}
              </span>
              <span className="text-[10px] text-slate-600 font-mono min-w-[120px] text-right">{entry.reasonCode}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
