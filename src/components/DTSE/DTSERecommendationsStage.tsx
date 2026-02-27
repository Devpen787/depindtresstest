import React from 'react';
import { Download, ArrowRight, Zap } from 'lucide-react';
import type { DTSERecommendation } from '../../types/dtse';

interface DTSERecommendationsStageProps {
  recommendations: DTSERecommendation[];
  onExport: () => void;
}

const PRIORITY_STYLES: Record<DTSERecommendation['priority'], { badge: string; badgeText: string; shadow: string }> = {
  critical: {
    badge: 'bg-rose-950/60 border-rose-900/50',
    badgeText: 'text-rose-400',
    shadow: 'shadow-[0_0_20px_rgba(225,29,72,0.1)] hover:shadow-[0_0_30px_rgba(225,29,72,0.15)] border-rose-500/30',
  },
  high: {
    badge: 'bg-orange-950/60 border-orange-900/50',
    badgeText: 'text-orange-400',
    shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.05)] hover:shadow-[0_0_25px_rgba(249,115,22,0.1)] border-orange-500/30',
  },
  medium: {
    badge: 'bg-amber-950/60 border-amber-900/50',
    badgeText: 'text-amber-400',
    shadow: 'shadow-md border-amber-500/20 hover:border-amber-500/40',
  },
  low: {
    badge: 'bg-slate-800 border-slate-700',
    badgeText: 'text-slate-300',
    shadow: 'shadow-sm border-white/5 hover:border-white/10',
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

  const priorityCounts = sorted.reduce(
    (counts, rec) => {
      counts[rec.priority]++;
      return counts;
    },
    { critical: 0, high: 0, medium: 0, low: 0 } as Record<DTSERecommendation['priority'], number>,
  );

  const leadRecommendation = sorted[0];
  const uniqueOwners = Array.from(new Set(sorted.map((rec) => rec.owner)));

  return (
    <div data-cy="dtse-recommendations-stage" className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
          Stage 5 — Recommendations
        </h2>
        <p className="text-sm font-medium text-slate-400">
          Prioritized actions and ownership.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-slate-900/40 p-12 text-center shadow-inner backdrop-blur-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
            <Zap size={24} className="text-emerald-400" />
          </div>
          <h3 className="mb-1 text-sm font-bold text-slate-200">No Recommendations Needed</h3>
          <p className="text-xs text-slate-500">The protocol passed all evaluated stress scenarios within healthy guardrails.</p>
        </div>
      ) : (
        <>
          <section className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Priority Summary</p>
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/35 p-5 shadow-xl backdrop-blur-md">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent" />
              <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Top priority</p>
                  <h3 className="text-2xl font-black tracking-tight text-white">
                    {leadRecommendation ? leadRecommendation.action : 'No action required'}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    Owners: {uniqueOwners.join(', ')}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {(['critical', 'high', 'medium', 'low'] as DTSERecommendation['priority'][]).map((priority) => {
                      const ps = PRIORITY_STYLES[priority];
                      return (
                        <div key={priority} className={`rounded-xl border px-3.5 py-2.5 text-center ${ps.badge}`}>
                          <p className={`text-lg font-black ${ps.badgeText}`}>{priorityCounts[priority]}</p>
                          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{priority}</p>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    data-cy="dtse-export-btn"
                    onClick={onExport}
                    className="group relative flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-black tracking-wide text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500 hover:shadow-[0_0_30px_rgba(91,33,182,0.5)]"
                  >
                    <div className="absolute inset-0 h-full w-full -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                    <Download size={14} className="relative z-10 drop-shadow-sm" />
                    <span className="relative z-10">Export Report</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Action List</p>
            <div className="space-y-3">
              {sorted.map((rec, idx) => {
                const ps = PRIORITY_STYLES[rec.priority];
                const isCritical = rec.priority === 'critical';

                return (
                  <div
                    key={rec.id}
                    data-cy={`dtse-rec-${rec.id}`}
                    className={`group relative overflow-hidden rounded-2xl border bg-slate-900/28 p-5 space-y-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 ${ps.shadow}`}
                    style={{ animationDelay: `${idx * 75}ms` }}
                  >
                    {isCritical && (
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent animate-pulse" />
                    )}

                    <div className="relative z-10 flex items-start gap-3.5">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/5 bg-slate-950/80 text-[11px] font-black text-slate-300 shadow-inner transition-transform duration-300 group-hover:scale-110">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-3">
                          <h3 className="text-base font-black tracking-tight text-slate-100">{rec.action}</h3>
                          <span className={`${ps.badge} ${ps.badgeText} rounded border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] shadow-inner`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="pr-4 text-sm font-medium leading-relaxed text-slate-300">{rec.rationale}</p>
                      </div>
                    </div>

                    <div className="relative z-10 space-y-3 pl-11">
                      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-slate-950/22 p-3 px-3.5 shadow-inner">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Owner:</span>
                          <span className="text-xs font-bold text-slate-200">{rec.owner}</span>
                        </div>
                        {rec.timeframe && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Timeline:</span>
                            <span className="text-xs font-bold text-slate-200">{rec.timeframe}</span>
                          </div>
                        )}
                        {rec.expected_effect && (
                          <div className="ml-auto flex items-center gap-2 rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5">
                            <ArrowRight size={10} className="text-indigo-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">{rec.expected_effect}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {rec.success_metric && (
                          <div className="rounded-xl border border-white/5 bg-slate-950/20 p-3.5">
                            <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Success Metric</p>
                            <p className="text-xs font-medium leading-relaxed text-slate-400">{rec.success_metric}</p>
                          </div>
                        )}
                        {rec.dependency && (
                          <div className="rounded-xl border border-white/5 bg-slate-950/20 p-3.5">
                            <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Dependency</p>
                            <p className="text-xs font-medium leading-relaxed text-slate-400">{rec.dependency}</p>
                          </div>
                        )}
                        {rec.risk_if_delayed && (
                          <div className="rounded-xl border border-rose-500/10 bg-rose-950/8 p-3.5 md:col-span-2">
                            <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/70">Risk if Delayed</p>
                            <p className="text-xs font-medium leading-relaxed text-slate-400">{rec.risk_if_delayed}</p>
                          </div>
                        )}
                        {rec.peer_analog && (
                          <div className="rounded-xl border border-cyan-500/10 bg-cyan-950/8 p-3.5 md:col-span-2">
                            <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/70">Peer Analog</p>
                            <p className="text-xs font-medium leading-relaxed text-slate-400">{rec.peer_analog}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
