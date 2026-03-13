import React from 'react';
import { AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';
import type { DTSEFailureSignature } from '../../types/dtse';
import { DTSEStageHeader } from './DTSEStageHeader';
import { sanitizeDTSETriggerText } from '../../utils/dtsePresentation';

interface DTSESignatureStageProps {
  signatures: DTSEFailureSignature[];
  metricLabels: Record<string, string>;
  showAdvanced?: boolean;
  compact?: boolean;
}

const SEVERITY_CONFIG: Record<DTSEFailureSignature['severity'], {
  icon: React.ReactNode;
  bg: string;
  border: string;
  badge: string;
  badgeText: string;
  shadow: string;
}> = {
  critical: {
    icon: <AlertOctagon size={18} className="text-rose-600 dark:text-rose-400 transition-colors" />,
    bg: 'bg-rose-50 dark:bg-rose-500/10 transition-colors',
    border: 'border-rose-200 dark:border-rose-500/30 transition-colors',
    badge: 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 transition-colors',
    badgeText: 'text-rose-700 dark:text-rose-400 transition-colors',
    shadow: 'shadow-sm border-rose-200 dark:shadow-[0_8px_16px_rgba(225,29,72,0.15)] dark:shadow-rose-900/20 dark:border-rose-500/30 transition-colors',
  },
  high: {
    icon: <ShieldAlert size={18} className="text-orange-600 dark:text-orange-400 transition-colors" />,
    bg: 'bg-orange-50 dark:bg-orange-500/10 transition-colors',
    border: 'border-orange-200 dark:border-orange-500/30 transition-colors',
    badge: 'bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/30 transition-colors',
    badgeText: 'text-orange-700 dark:text-orange-400 transition-colors',
    shadow: 'shadow-sm border-orange-200 dark:shadow-[0_8px_16px_rgba(249,115,22,0.15)] dark:shadow-orange-900/20 dark:border-orange-500/30 transition-colors',
  },
  medium: {
    icon: <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 transition-colors" />,
    bg: 'bg-amber-50 dark:bg-amber-500/10 transition-colors',
    border: 'border-amber-200 dark:border-amber-500/30 transition-colors',
    badge: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 transition-colors',
    badgeText: 'text-amber-700 dark:text-amber-400 transition-colors',
    shadow: 'shadow-sm border-amber-200 dark:shadow-[0_8px_16px_rgba(245,158,11,0.15)] dark:shadow-amber-900/20 dark:border-amber-500/30 transition-colors',
  },
  low: {
    icon: <Info size={18} className="text-slate-500 dark:text-slate-400 transition-colors" />,
    bg: 'bg-slate-50 dark:bg-slate-800/50 transition-colors',
    border: 'border-slate-200 dark:border-slate-700/50 transition-colors',
    badge: 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700/50 transition-colors',
    badgeText: 'text-slate-500 dark:text-slate-400 transition-colors',
    shadow: 'shadow-sm border-slate-200 dark:shadow-[0_8px_16px_rgba(15,23,42,0.5)] dark:shadow-black/40 dark:border-slate-700/50 transition-colors',
  },
};

export const DTSESignatureStage: React.FC<DTSESignatureStageProps> = ({ signatures, metricLabels, showAdvanced = false, compact = false }) => {
  const ordered = signatures;
  const leadSignature = ordered[0];
  const activeCount = ordered.filter((sig) => sig.severity !== 'low').length;
  const visibleMetricLabels = Array.from(new Set(ordered.flatMap((sig) => sig.affected_metrics))).slice(0, 6);
  const storyChain = ordered.slice(0, 3);
  const storyStepLabel = (idx: number): string => {
    if (idx === 0) return 'Starts with';
    if (idx === 1) return 'Then';
    return 'Then';
  };
  const nextSignatureLabel = (idx: number): string | null => ordered[idx + 1]?.label ?? null;
  const leadStoryTakeaway = leadSignature
    ? `Read this run first as ${leadSignature.label}. ${leadSignature.why_it_matters ?? leadSignature.pattern}`
    : null;
  const formatMetricList = (metricIds: string[]) => metricIds.map((m) => metricLabels[m] ?? m).join(', ');

  return (
    <div
      data-cy="dtse-signature-stage"
      className={`${compact ? 'space-y-2.5 p-3' : 'space-y-3 p-3.5'} animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-[20px] bg-white border-slate-200 dark:bg-slate-900/40 dark:border-white/5 dark:backdrop-blur-xl border shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-slate-800 dark:text-slate-100 transition-colors`}
    >
      <DTSEStageHeader
        title="Stage 4 — Failure Patterns"
        description="These are interpreted patterns inferred from the scored outputs above."
        compact={compact}
      />

      <div className="border border-indigo-200 bg-indigo-50/50 dark:border-indigo-500/30 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-indigo-900/40 dark:via-slate-900/80 dark:to-slate-900 shadow-sm dark:shadow-[0_4px_24px_-4px_rgba(99,102,241,0.15)] rounded-xl p-3 transition-colors">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
          Patterns are model interpretations, not direct observations of live network events.
        </p>
      </div>

      {ordered.length === 0 ? (
        <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-10 text-center transition-colors" role="status">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 transition-colors" aria-hidden="true">
            <Info size={20} className="text-emerald-600 dark:text-emerald-400 transition-colors" />
          </div>
          <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white transition-colors">No failure signatures in this run</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">The current scenario did not trigger thesis-stage failure patterns.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-5 transition-colors">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">Lead fracture in this run</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">{leadSignature?.label}</h3>
                  {leadSignature && (
                    <p className={`text-[11px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded border ${SEVERITY_CONFIG[leadSignature.severity].badge} ${SEVERITY_CONFIG[leadSignature.severity].badgeText} transition-colors`}>
                      {leadSignature.severity} severity
                    </p>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                  DTSE reads this run primarily as <span className="font-semibold text-slate-900 dark:text-white transition-colors">{leadSignature?.label}</span>. {leadSignature?.pattern}
                </p>

                {leadStoryTakeaway && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-3 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700 dark:text-amber-400 transition-colors">Takeaway for this run</p>
                    <p className="mt-1 text-sm leading-relaxed text-amber-900 dark:text-amber-200/90 transition-colors">{leadStoryTakeaway}</p>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div className="border-t border-slate-200 dark:border-slate-700/50 pt-3 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Why this leads</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                      {leadSignature?.why_it_matters ?? 'This pattern best explains why the run leaves the healthy path.'}
                    </p>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700/50 pt-3 transition-colors">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">What it damages first</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                      {leadSignature ? formatMetricList(leadSignature.affected_metrics) : 'No linked metrics.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700/50 pt-3 xl:border-l xl:border-t-0 xl:pl-5 transition-colors">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                  The lead story matters because the downstream patterns inherit from it rather than appearing independently.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-200 dark:border-slate-700/50 pt-3 transition-colors">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Active signatures</p>
                    <p className="mt-0.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">{activeCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Patterns total</p>
                    <p className="mt-0.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">{ordered.length}</p>
                  </div>
                </div>
                <div className="mt-3 border-t border-slate-200 dark:border-slate-700/50 pt-3 transition-colors">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Watch first across the run</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                    {visibleMetricLabels.map((m) => metricLabels[String(m)] ?? m).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {storyChain.length > 1 && (
            <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-5 transition-colors">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 transition-colors">How the fracture spreads</p>
              <div className="mt-3 grid grid-cols-1 gap-2 xl:grid-cols-3">
                {storyChain.map((sig, idx) => {
                  const cfg = SEVERITY_CONFIG[sig.severity];
                  const nextLabel = nextSignatureLabel(idx);
                  return (
                    <div
                      key={`story-${sig.id}`}
                      className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">{storyStepLabel(idx)}</p>
                        <p className={`${cfg.badgeText} text-[10px] font-bold uppercase tracking-[0.08em] transition-colors`}>{sig.severity}</p>
                      </div>
                      <p className="mt-1 text-sm font-black tracking-tight text-slate-900 dark:text-white transition-colors">{sig.label}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">{sig.pattern}</p>
                      <p className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-white/5 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 transition-colors">{nextLabel ? 'Feeds next:' : 'Ends here:'}</span>{' '}
                        {nextLabel ?? 'This is where the visible pattern chain stops in this run.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-5 transition-colors">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">Pattern details</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 transition-colors">Open a pattern to inspect rationale and linked metrics.</p>
            <div className="mt-3 space-y-2.5">
              {ordered.map((sig, idx) => {
                const nextLabel = nextSignatureLabel(idx);
                return (
                  <div
                    key={sig.id}
                    data-cy={`dtse-signature-${sig.id}`}
                    className="relative rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-white/5 px-4 py-3 dtse-card-interactive hover:bg-slate-100 dark:hover:bg-slate-800/80 has-[:open]:dtse-card-expanded has-[:open]:z-10 transition-colors"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white transition-colors">{sig.label}</h3>
                        <p className={`${SEVERITY_CONFIG[sig.severity].badgeText} text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded border ${SEVERITY_CONFIG[sig.severity].badge} transition-colors`}>
                            {sig.severity}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">{sig.pattern}</p>
                      <details className="border-t border-slate-200 dark:border-slate-700/50 pt-2.5 mt-1 transition-colors">
                        <summary className="cursor-pointer text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                          View rationale
                        </summary>
                        <div className="mt-2 grid gap-1.5 text-[12px] leading-relaxed text-slate-600 dark:text-slate-400 transition-colors lg:grid-cols-2">
                          {sig.why_it_matters && (
                            <p>
                              <span className="font-semibold text-slate-800 dark:text-slate-300 transition-colors">Why this matters:</span>{' '}
                              {sig.why_it_matters}
                            </p>
                          )}
                          {nextLabel && (
                            <p>
                              <span className="font-semibold text-slate-800 dark:text-slate-300 transition-colors">Next pressure:</span>{' '}
                              {nextLabel}
                            </p>
                          )}
                          {sig.affected_metrics.length > 0 && (
                            <p>
                              <span className="font-semibold text-slate-800 dark:text-slate-300 transition-colors">Linked metrics:</span>{' '}
                              {formatMetricList(sig.affected_metrics)}
                            </p>
                          )}
                          {showAdvanced && sig.trigger_logic && sanitizeDTSETriggerText(sig.trigger_logic) && (
                            <p>
                              <span className="font-semibold text-slate-800 dark:text-slate-300 transition-colors">Triggered by:</span>{' '}
                              {sanitizeDTSETriggerText(sig.trigger_logic)}
                            </p>
                          )}
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
