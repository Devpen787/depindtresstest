import React from 'react';
import { Download, ArrowRight, Zap, Lightbulb } from 'lucide-react';
import type { DTSEProtocolInsight, DTSERecommendation } from '../../types/dtse';

interface DTSERecommendationsStageProps {
  recommendations: DTSERecommendation[];
  insights: DTSEProtocolInsight[];
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

const INSIGHT_CONFIDENCE_META: Record<
  DTSEProtocolInsight['confidence'],
  { label: string; badge: string; badgeText: string; description: string }
> = {
  model: {
    label: 'Model',
    badge: 'bg-emerald-950/60 border-emerald-900/50',
    badgeText: 'text-emerald-300',
    description: 'Directly reflected in the current matched DTSE run.',
  },
  derived: {
    label: 'Derived',
    badge: 'bg-cyan-950/60 border-cyan-900/50',
    badgeText: 'text-cyan-300',
    description: 'Computed from current run outputs and DTSE thresholds.',
  },
  mixed: {
    label: 'Mixed',
    badge: 'bg-violet-950/60 border-violet-900/50',
    badgeText: 'text-violet-300',
    description: 'Current DTSE outputs interpreted with protocol-specific facts.',
  },
  curated: {
    label: 'Curated',
    badge: 'bg-amber-950/60 border-amber-900/50',
    badgeText: 'text-amber-300',
    description: 'Based on verified protocol facts or curated peer mapping.',
  },
};

export const DTSERecommendationsStage: React.FC<DTSERecommendationsStageProps> = ({
  recommendations,
  insights,
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
          Stage 5 — Response Paths
        </h2>
        <p className="text-sm font-medium text-slate-400">
          Response areas and tradeoffs for discussion, not model-issued prescriptions.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-slate-900/40 p-12 text-center shadow-inner backdrop-blur-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
            <Zap size={24} className="text-emerald-400" />
          </div>
          <h3 className="mb-1 text-sm font-bold text-slate-200">No Immediate Response Path</h3>
          <p className="text-xs text-slate-500">The current run stays inside healthy guardrails, so DTSE stays in monitoring mode.</p>
        </div>
      ) : (
        <>
          <section className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Response Posture</p>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-white/5 bg-slate-900/35 p-5 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Lead response path</p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-white">
                  {leadRecommendation ? leadRecommendation.action : 'No action required'}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Main areas to examine: {uniqueOwners.join(', ')}
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900/35 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Export</p>
                    <p className="mt-1 text-sm text-slate-400">Capture this run for discussion or review.</p>
                  </div>
                  <button
                    data-cy="dtse-export-btn"
                    onClick={onExport}
                    className="flex items-center gap-2 rounded-xl border border-indigo-400/25 bg-indigo-500/10 px-4 py-2 text-xs font-black tracking-wide text-indigo-100 transition-colors hover:bg-indigo-500/15"
                  >
                    <Download size={14} />
                    <span>Export</span>
                  </button>
                </div>
                <details className="mt-4 rounded-xl border border-white/5 bg-slate-950/20 p-3">
                  <summary className="cursor-pointer list-none text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Priority Mix
                  </summary>
                  <p className="mt-2 text-xs text-slate-400">Use this as a discussion filter, not a fixed execution queue.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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
                </details>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Interpretive Paths</p>
            <div className="space-y-3">
              {sorted.map((rec, idx) => {
                const ps = PRIORITY_STYLES[rec.priority];

                return (
                  <div
                    key={rec.id}
                    data-cy={`dtse-rec-${rec.id}`}
                    className={`group relative overflow-hidden rounded-2xl border bg-slate-900/28 p-5 space-y-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 ${ps.shadow}`}
                    style={{ animationDelay: `${idx * 75}ms` }}
                  >
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
                      {rec.expected_effect && (
                        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-500/15 bg-indigo-500/8 p-3 px-3.5">
                          <ArrowRight size={12} className="text-indigo-400" />
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300">Expected effect</span>
                          <span className="text-xs font-semibold text-slate-200">{rec.expected_effect}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                        {rec.success_metric && (
                          <div className="rounded-xl border border-white/5 bg-slate-950/20 p-3.5">
                            <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">What To Compare</p>
                            <p className="text-xs font-medium leading-relaxed text-slate-400">{rec.success_metric}</p>
                          </div>
                        )}
                        {rec.dependency && (
                          <div className="rounded-xl border border-white/5 bg-slate-950/20 p-3.5">
                            <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Boundary</p>
                            <p className="text-xs font-medium leading-relaxed text-slate-400">{rec.dependency}</p>
                          </div>
                        )}
                        {(rec.risk_if_delayed || rec.peer_analog) && (
                          <div className="rounded-xl border border-white/5 bg-slate-950/18 p-3 md:col-span-2">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              {rec.risk_if_delayed && (
                                <div>
                                  <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/70">Why It Matters</p>
                                  <p className="text-xs font-medium leading-relaxed text-slate-400">{rec.risk_if_delayed}</p>
                                </div>
                              )}
                              {rec.peer_analog && (
                                <div>
                                  <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/70">Comparable Context</p>
                                  <p className="text-xs font-medium leading-relaxed text-slate-400">{rec.peer_analog}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <details className="rounded-xl border border-white/5 bg-slate-950/16 p-3">
                        <summary className="cursor-pointer list-none text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                          Implementation Details
                        </summary>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Review area</span>
                            <span className="font-semibold text-slate-200">{rec.owner}</span>
                          </div>
                          {rec.timeframe && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Window</span>
                              <span className="font-semibold text-slate-200">{rec.timeframe}</span>
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {insights.length > 0 && (
        <section className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Protocol Insights</p>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {insights.map((insight) => (
              <div
                key={insight.id}
                data-cy={`dtse-insight-${insight.id}`}
                className="rounded-2xl border border-white/5 bg-slate-900/28 p-5 backdrop-blur-md"
              >
                {(() => {
                  const confidenceMeta = INSIGHT_CONFIDENCE_META[insight.confidence];

                  return (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2">
                            <Lightbulb size={16} className="text-amber-300" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-black tracking-tight text-slate-100">{insight.title}</p>
                              <span className={`${confidenceMeta.badge} ${confidenceMeta.badgeText} rounded-md border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em]`}>
                                {confidenceMeta.label}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] font-semibold text-slate-500">
                              {confidenceMeta.description}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-300">{insight.observation}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                        <div className="rounded-xl border border-white/5 bg-slate-950/20 p-3.5">
                          <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Why it matters</p>
                          <p className="text-xs font-medium leading-relaxed text-slate-400">{insight.implication}</p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-slate-950/20 p-3.5">
                          <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Primary basis</p>
                          <p className="text-xs font-medium leading-relaxed text-slate-400">{insight.trigger ?? 'Protocol structure and current DTSE readout.'}</p>
                        </div>
                      </div>
                      <details className="mt-3 rounded-xl border border-white/5 bg-slate-950/16 p-3">
                        <summary className="cursor-pointer list-none text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                          Source Trace
                        </summary>
                        <ul className="mt-3 space-y-2">
                          {insight.provenance.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-xs font-medium leading-relaxed text-slate-400">
                              <span className="mt-0.5 text-slate-500">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
