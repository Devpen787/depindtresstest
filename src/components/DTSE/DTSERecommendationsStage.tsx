import React from 'react';
import { Download, ArrowRight, Zap } from 'lucide-react';
import type { DTSERecommendation } from '../../types/dtse';

interface DTSERecommendationsStageProps {
  recommendations: DTSERecommendation[];
  onExport: () => void;
}

const PRIORITY_STYLES: Record<DTSERecommendation['priority'], { dot: string; badge: string; badgeText: string; shadow: string }> = {
  critical: {
    dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    badge: 'bg-rose-950/60 border-rose-900/50',
    badgeText: 'text-rose-400',
    shadow: 'shadow-[0_0_20px_rgba(225,29,72,0.1)] hover:shadow-[0_0_30px_rgba(225,29,72,0.15)] border-rose-500/30'
  },
  high: {
    dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]',
    badge: 'bg-orange-950/60 border-orange-900/50',
    badgeText: 'text-orange-400',
    shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.05)] hover:shadow-[0_0_25px_rgba(249,115,22,0.1)] border-orange-500/30'
  },
  medium: {
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    badge: 'bg-amber-950/60 border-amber-900/50',
    badgeText: 'text-amber-400',
    shadow: 'shadow-md border-amber-500/20 hover:border-amber-500/40'
  },
  low: {
    dot: 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.5)]',
    badge: 'bg-slate-800 border-slate-700',
    badgeText: 'text-slate-300',
    shadow: 'shadow-sm border-white/5 hover:border-white/10'
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
    <div data-cy="dtse-recommendations-stage" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
            Stage 5 — Recommendations
          </h2>
          <p className="text-sm font-medium text-slate-400">
            Execution playbook with actionable engineering fixes and prioritized mitigation steps.
          </p>
        </div>
        <button
          data-cy="dtse-export-btn"
          onClick={onExport}
          className="relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-5 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(91,33,182,0.5)] flex items-center gap-2 border border-indigo-400/30 hover:-translate-y-0.5"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-[shimmer_1.5s_infinite]" />
          <Download size={14} className="relative z-10 drop-shadow-sm" />
          <span className="relative z-10">Export Report</span>
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center shadow-inner flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
            <Zap size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-1">No Recommendations Needed</h3>
          <p className="text-xs text-slate-500">The protocol passed all evaluated stress scenarios within healthy guardrails.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="absolute top-0 right-0 p-64 bg-violet-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

          {sorted.map((rec, idx) => {
            const ps = PRIORITY_STYLES[rec.priority];
            const isCritical = rec.priority === 'critical';
            return (
              <div
                key={rec.id}
                data-cy={`dtse-rec-${rec.id}`}
                className={`relative overflow-hidden bg-slate-900/40 backdrop-blur-md border rounded-2xl p-6 ${ps.shadow} transition-all duration-300 group hover:-translate-y-0.5 space-y-4`}
                style={{ animationDelay: `${idx * 75}ms` }}
              >
                {isCritical && (
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent animate-pulse" />
                )}

                <div className="flex items-start gap-4 relative z-10">
                  <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black bg-slate-950/80 text-slate-300 border border-white/5 shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-base font-black tracking-tight text-slate-100">{rec.action}</h3>
                      <span className={`${ps.badge} border ${ps.badgeText} text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded shadow-inner`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium mb-3 pr-4">{rec.rationale}</p>
                  </div>
                </div>

                <div className="pl-12 relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center gap-4 bg-slate-950/30 rounded-xl border border-white/5 p-3 px-4 shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Owner:</span>
                      <span className="text-xs font-bold text-slate-200">{rec.owner}</span>
                    </div>
                    <div className="w-px h-4 bg-slate-800 hidden sm:block"></div>
                    {rec.timeframe && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Timeline:</span>
                        <span className="text-xs font-bold text-slate-200">{rec.timeframe}</span>
                      </div>
                    )}
                    {rec.expected_effect && (
                      <div className="flex items-center gap-2 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 ml-auto">
                        <ArrowRight size={10} className="text-indigo-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">{rec.expected_effect}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rec.success_metric && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Success Metric</p>
                        <p className="text-xs text-slate-400 font-medium">{rec.success_metric}</p>
                      </div>
                    )}
                    {rec.dependency && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Dependency</p>
                        <p className="text-xs text-slate-400 font-medium">{rec.dependency}</p>
                      </div>
                    )}
                    {rec.risk_if_delayed && (
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/70 mb-0.5">Risk if Delayed</p>
                        <p className="text-xs text-slate-400 font-medium">{rec.risk_if_delayed}</p>
                      </div>
                    )}
                    {rec.peer_analog && (
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/70 mb-0.5">Peer Analog</p>
                        <p className="text-xs text-slate-400 font-medium">{rec.peer_analog}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
