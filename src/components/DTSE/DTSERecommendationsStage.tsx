import React from 'react';
import { Download, ArrowRight } from 'lucide-react';
import type { DTSERecommendation } from '../../types/dtse';

interface DTSERecommendationsStageProps {
  recommendations: DTSERecommendation[];
  onExport: () => void;
}

const PRIORITY_STYLES: Record<DTSERecommendation['priority'], {
  dot: string;
  badge: string;
  badgeText: string;
  accent: string;
  numBg: string;
  numText: string;
}> = {
  critical: {
    dot: 'bg-red-400',
    badge: 'bg-red-900/50',
    badgeText: 'text-red-400',
    accent: 'border-l-red-500',
    numBg: 'bg-red-900/40',
    numText: 'text-red-400',
  },
  high: {
    dot: 'bg-orange-400',
    badge: 'bg-orange-900/50',
    badgeText: 'text-orange-400',
    accent: 'border-l-orange-500',
    numBg: 'bg-orange-900/40',
    numText: 'text-orange-400',
  },
  medium: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-900/50',
    badgeText: 'text-amber-400',
    accent: 'border-l-amber-500',
    numBg: 'bg-amber-900/40',
    numText: 'text-amber-400',
  },
  low: {
    dot: 'bg-slate-500',
    badge: 'bg-slate-800',
    badgeText: 'text-slate-400',
    accent: 'border-l-slate-600',
    numBg: 'bg-slate-800',
    numText: 'text-slate-400',
  },
};

export const DTSERecommendationsStage: React.FC<DTSERecommendationsStageProps> = ({
  recommendations,
  onExport,
}) => {
  const sorted = [...recommendations].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
  });

  return (
    <div data-cy="dtse-recommendations-stage" className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
            Stage 5 — Next Actions
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Concrete steps to address identified risks. Export the full evaluation report.
          </p>
        </div>
        <button
          data-cy="dtse-export-btn"
          onClick={onExport}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 shrink-0"
        >
          <Download size={14} />
          Export Report
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-10 text-center">
          <p className="text-sm text-slate-500">No actions required — all indicators within healthy range.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((rec, idx) => {
            const ps = PRIORITY_STYLES[rec.priority];
            return (
              <div
                key={rec.id}
                data-cy={`dtse-rec-${rec.id}`}
                className={`bg-slate-900/60 border border-slate-800/50 ${ps.accent} border-l-2 rounded-xl p-6 space-y-4`}
              >
                {/* Header */}
                <div className="flex items-start gap-4">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${ps.numBg} ${ps.numText} shrink-0`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-100 leading-snug">{rec.action}</h3>
                      <span className={`${ps.badge} ${ps.badgeText} text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0`}>
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rationale */}
                <p className="text-xs text-slate-400 leading-relaxed pl-12">{rec.rationale}</p>

                {/* Metadata row */}
                <div className="flex items-center gap-4 pl-12 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 bg-slate-800/60 text-slate-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md">
                    {rec.owner}
                  </span>
                  {rec.expected_effect && (
                    <div className="flex items-center gap-1.5">
                      <ArrowRight size={10} className="text-slate-600 shrink-0" />
                      <span className="text-xs text-slate-500 italic">{rec.expected_effect}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
