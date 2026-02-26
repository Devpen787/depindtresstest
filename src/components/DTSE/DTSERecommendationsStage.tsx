import React from 'react';
import { Download, ArrowRight } from 'lucide-react';
import type { DTSERecommendation } from '../../types/dtse';

interface DTSERecommendationsStageProps {
  recommendations: DTSERecommendation[];
  onExport: () => void;
}

const PRIORITY_STYLES: Record<DTSERecommendation['priority'], { dot: string; badge: string; badgeText: string }> = {
  critical: { dot: 'bg-red-400', badge: 'bg-red-900/60', badgeText: 'text-red-400' },
  high: { dot: 'bg-orange-400', badge: 'bg-orange-900/60', badgeText: 'text-orange-400' },
  medium: { dot: 'bg-amber-400', badge: 'bg-amber-900/60', badgeText: 'text-amber-400' },
  low: { dot: 'bg-slate-500', badge: 'bg-slate-800', badgeText: 'text-slate-400' },
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
    <div data-cy="dtse-recommendations-stage" className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
            Stage 5 — Recommendations
          </h2>
          <p className="text-sm text-slate-500">
            Actionable items derived from the failure analysis. Export a full DTSE report bundle.
          </p>
        </div>
        <button
          data-cy="dtse-export-btn"
          onClick={onExport}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
        >
          <Download size={14} />
          Export Report
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-500">No recommendations generated.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((rec, idx) => {
            const ps = PRIORITY_STYLES[rec.priority];
            return (
              <div
                key={rec.id}
                data-cy={`dtse-rec-${rec.id}`}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-slate-800 text-slate-400`}>
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 flex-1">{rec.action}</h3>
                  <span className={`${ps.badge} ${ps.badgeText} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded`}>
                    {rec.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pl-9">{rec.rationale}</p>

                <div className="flex items-center gap-4 pl-9">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Owner:</span>
                    <span className="text-xs text-slate-300">{rec.owner}</span>
                  </div>
                  {rec.expected_effect && (
                    <div className="flex items-center gap-1.5">
                      <ArrowRight size={10} className="text-slate-600" />
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
