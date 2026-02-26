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

  return (
    <div data-cy="dtse-applicability-stage" className="space-y-6">
      <div>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
          Stage 2 — Applicability
        </h2>
        <p className="text-sm text-slate-500">
          Determines which metrics have sufficient data quality to produce reliable DTSE verdicts.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200">Metric Readiness</h3>
          <span className="text-xs text-slate-400">
            <span className="text-emerald-400 font-bold">{runnableCount}</span> / {totalCount} runnable
          </span>
        </div>

        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.metricId}
              data-cy={`dtse-applicability-${entry.metricId}`}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                entry.verdict === 'R'
                  ? 'bg-emerald-950/30 border-emerald-900/50'
                  : 'bg-red-950/20 border-red-900/40'
              }`}
            >
              <div className="flex items-center gap-3">
                {entry.verdict === 'R' ? (
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-400 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {metricLabels[entry.metricId] ?? entry.metricId}
                  </p>
                  {entry.details && (
                    <p className="text-xs text-slate-500 mt-0.5">{entry.details}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  entry.verdict === 'R'
                    ? 'bg-emerald-900/60 text-emerald-400'
                    : 'bg-red-900/60 text-red-400'
                }`}>
                  {entry.verdict === 'R' ? 'Runnable' : 'Not Runnable'}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">{entry.reasonCode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
