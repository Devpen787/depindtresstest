import React from 'react';
import { Download, ArrowRight, Zap, Lightbulb } from 'lucide-react';
import type { DTSEProtocolInsight, DTSERecommendation } from '../../types/dtse';
import { sanitizeDTSETriggerText } from '../../utils/dtsePresentation';
import { DTSEStageHeader } from './DTSEStageHeader';

interface DTSERecommendationsStageProps {
  recommendations: DTSERecommendation[];
  insights: DTSEProtocolInsight[];
  onExport: () => void;
  showAdvanced?: boolean;
  exportFeedback?: boolean;
  compact?: boolean;
}

const PRIORITY_STYLES: Record<DTSERecommendation['priority'], { badge: string; badgeText: string; shadow: string }> = {
  critical: {
    badge: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400',
    badgeText: 'text-rose-700 dark:text-rose-400',
    shadow: 'border-rose-200 shadow-sm dark:border-rose-500/30 dark:shadow-[0_8px_16px_rgba(225,29,72,0.15)] dark:shadow-rose-900/20',
  },
  high: {
    badge: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/30 dark:text-orange-400',
    badgeText: 'text-orange-700 dark:text-orange-400',
    shadow: 'border-orange-200 shadow-sm dark:border-orange-500/30 dark:shadow-[0_8px_16px_rgba(249,115,22,0.15)] dark:shadow-orange-900/20',
  },
  medium: {
    badge: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400',
    badgeText: 'text-amber-700 dark:text-amber-400',
    shadow: 'border-amber-200 shadow-sm dark:border-amber-500/30 dark:shadow-[0_8px_16px_rgba(245,158,11,0.15)] dark:shadow-amber-900/20',
  },
  low: {
    badge: 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700/50 dark:text-slate-400',
    badgeText: 'text-slate-500 dark:text-slate-400',
    shadow: 'border-slate-200 shadow-sm dark:border-slate-700/50 dark:shadow-[0_8px_16px_rgba(15,23,42,0.5)] dark:shadow-black/40',
  },
};

const INSIGHT_CONFIDENCE_META: Record<
  DTSEProtocolInsight['confidence'],
  { label: string; badge: string; badgeText: string; description: string }
> = {
  model: {
    label: 'From this run',
    badge: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 transition-colors',
    badgeText: 'text-emerald-700 dark:text-emerald-400 transition-colors',
    description: 'Directly reflected in the current matched DTSE run.',
  },
  derived: {
    label: 'Derived from this run',
    badge: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-500/10 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 transition-colors',
    badgeText: 'text-cyan-700 dark:text-cyan-400 transition-colors',
    description: 'Computed from current run outputs and DTSE thresholds.',
  },
  mixed: {
    label: 'Mixed',
    badge: 'bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/30 text-violet-700 dark:text-violet-400 transition-colors',
    badgeText: 'text-violet-700 dark:text-violet-400 transition-colors',
    description: 'Current DTSE outputs interpreted with protocol-specific facts.',
  },
  curated: {
    label: 'Verified protocol context',
    badge: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 transition-colors',
    badgeText: 'text-amber-700 dark:text-amber-400 transition-colors',
    description: 'Based on verified protocol facts or curated peer mapping.',
  },
};

function deriveLeadSummaryTitle(leadRecommendation?: DTSERecommendation): string {
  if (!leadRecommendation) {
    return 'Start with the highest-priority rerun';
  }

  const id = leadRecommendation.id;
  const action = leadRecommendation.action.toLowerCase();

  if (
    id === 'live-response-reward-demand-decoupling'
    || action.includes('lower net emissions')
    || action.includes('demand sinks')
  ) {
    return 'Test whether demand support can catch up with reward spend';
  }

  if (
    id === 'live-response-liquidity-driven-compression'
    || action.includes('liquidity buffers')
    || action.includes('unlock controls')
  ) {
    return 'Test whether downside controls absorb the compression window';
  }

  if (
    id === 'live-response-elastic-provider-exit'
    || action.includes('retention defense')
    || action.includes('cohort')
  ) {
    return 'Test whether retention defense holds for the mobile supply cohort';
  }

  if (
    id === 'live-response-profitability-induced-churn'
    || action.includes('provider cost relief')
  ) {
    return 'Test whether provider economics stabilize before churn compounds';
  }

  if (
    id === 'live-response-latent-capacity-degradation'
    || action.includes('slower supply expansion')
    || action.includes('demand quality')
  ) {
    return 'Test whether demand quality improves before adding more supply';
  }

  if (
    id === 'live-response-monitoring'
    || action.includes('next major market')
    || action.includes('control')
  ) {
    return 'Keep this setup as the control case';
  }

  return 'Start with the highest-priority rerun';
}

function deriveLeadTakeaway(
  leadRecommendation?: DTSERecommendation,
  leadInsight?: DTSEProtocolInsight,
): string {
  if (leadInsight?.implication && leadRecommendation?.action) {
    return `${leadInsight.implication} Start with: ${leadRecommendation.action}.`;
  }

  if (leadRecommendation?.rationale && leadRecommendation?.action) {
    return `${leadRecommendation.rationale} Start with: ${leadRecommendation.action}.`;
  }

  if (leadRecommendation?.action) {
    return `Use this run to pressure-test one clear rerun first: ${leadRecommendation.action}.`;
  }

  return 'Use the highest-priority rerun first, then use the remaining cards as follow-up variants or control cases.';
}

export const DTSERecommendationsStage: React.FC<DTSERecommendationsStageProps> = ({
  recommendations,
  insights,
  onExport,
  showAdvanced = false,
  exportFeedback = false,
  compact = false,
}) => {
  const sorted = [...recommendations];

  const priorityCounts = sorted.reduce(
    (counts, rec) => {
      counts[rec.priority]++;
      return counts;
    },
    { critical: 0, high: 0, medium: 0, low: 0 } as Record<DTSERecommendation['priority'], number>,
  );

  const leadRecommendation = sorted[0];
  const uniqueOwners = Array.from(new Set(sorted.map((rec) => rec.owner)));
  const leadSummaryTitle = deriveLeadSummaryTitle(leadRecommendation);
  const leadTakeaway = deriveLeadTakeaway(leadRecommendation, insights[0]);
  const leadInsight = insights[0];
  const supportingInsights = insights.length > 1 ? insights.slice(1) : insights;
  const leadInsightMeta = leadInsight ? INSIGHT_CONFIDENCE_META[leadInsight.confidence] : null;

  return (
    <div
      data-cy="dtse-recommendations-stage"
      className={`${compact ? 'space-y-2.5 p-3' : 'space-y-3 p-3.5'} animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-[20px] bg-white border-slate-200 dark:bg-slate-900/40 dark:border-white/5 dark:backdrop-blur-xl border shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-slate-800 dark:text-slate-100 transition-colors`}
    >
      <DTSEStageHeader
        title="Stage 5 — Next Tests"
        description="Use these as reruns or decision discussions. They are not direct prescriptions."
        compact={compact}
      />

      {sorted.length === 0 ? (
        <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center rounded-2xl p-10 text-center transition-colors" role="status">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 transition-colors" aria-hidden="true">
            <Zap size={20} className="text-emerald-600 dark:text-emerald-400 transition-colors" />
          </div>
          <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white transition-colors">No immediate next test</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">The current run stays within healthy guardrails. Use the setup as the control case.</p>
        </div>
      ) : (
        <>
          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">Decision story</p>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl p-5 border border-indigo-200 bg-indigo-50/50 dark:border-indigo-500/30 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-indigo-900/40 dark:via-slate-900/80 dark:to-slate-900 shadow-sm dark:shadow-[0_4px_24px_-4px_rgba(99,102,241,0.15)] transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">What this means</p>
                    <h3 className="mt-1.5 text-xl font-black tracking-tight dtse-gradient-text">
                      {leadInsight?.title ?? 'This run points to a concrete next test.'}
                    </h3>
                  </div>
                  {leadInsightMeta && (
                    <p className={`text-[10px] font-bold uppercase tracking-[0.08em] ${leadInsightMeta.badgeText}`}>
                      {leadInsightMeta.label}
                    </p>
                  )}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                  {leadInsight?.implication ?? leadRecommendation?.rationale ?? 'Use the top rerun to test the main source of pressure in this run.'}
                </p>
                {leadInsight?.observation && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 transition-colors">
                    {leadInsight.observation}
                  </p>
                )}

                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-3 transition-colors">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700 dark:text-amber-400 transition-colors">Takeaway for discussion</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-900 dark:text-amber-200/90 transition-colors">{leadTakeaway}</p>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 border-t border-indigo-200/50 dark:border-slate-700/50 pt-3 xl:grid-cols-[1.05fr_1fr_0.85fr] transition-colors">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Start with this rerun</p>
                    <h4 className="mt-1 text-base font-black tracking-tight text-slate-900 dark:text-white line-clamp-3 transition-colors" title={leadSummaryTitle}>
                      {leadSummaryTitle}
                    </h4>
                    {leadRecommendation && (
                      <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                        {leadRecommendation.action}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">What to change</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                      {leadRecommendation?.expected_effect ?? 'Adjust the lead pressure point while keeping the same stress contract so the rerun stays comparable.'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Success signal</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                      {leadRecommendation?.success_metric ?? 'The rerun should reduce the first break without simply moving the damage somewhere else.'}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500 transition-colors">
                      Owners: {uniqueOwners.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-4 transition-colors">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Run focus</p>
                  <div className="mt-2 grid grid-cols-2 gap-3 border-t border-slate-200 dark:border-slate-700/50 pt-2 transition-colors">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">High priority</p>
                      <p className="mt-0.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">{priorityCounts.critical + priorityCounts.high}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Lower priority</p>
                      <p className="mt-0.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">{priorityCounts.medium + priorityCounts.low}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
                    Start with the highest-priority rerun, then use the remaining tests as follow-up variants or control cases.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-4 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Export</p>
                      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300 transition-colors">
                        {exportFeedback ? 'Downloaded' : 'Capture this run for discussion or review.'}
                      </p>
                    </div>
                    <button
                      data-cy="dtse-export-btn"
                      aria-label="Export DTSE run as JSON and Markdown"
                      onClick={onExport}
                      className="flex min-h-[40px] items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 dark:border-indigo-500/30 dark:bg-indigo-500/10 px-4 py-2 text-xs font-bold tracking-wide text-indigo-700 dark:text-indigo-300 transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <Download size={14} aria-hidden="true" />
                      <span>Export</span>
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 transition-colors">
                    Keep this run for decision review, stakeholder discussion, or rerun planning.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {supportingInsights.length > 0 && (
            <section className="space-y-2">
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 transition-colors">Protocol meaning for this run</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                  These supporting protocol-specific signals explain why the recommended reruns matter here.
                </p>
              </div>

              <div className="border border-indigo-200 bg-indigo-50/50 dark:border-indigo-500/30 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-indigo-900/40 dark:via-slate-900/80 dark:to-slate-900 shadow-sm dark:shadow-[0_4px_24px_-4px_rgba(99,102,241,0.15)] rounded-2xl p-4 transition-colors">
                {supportingInsights.map((insight, idx) => {
                  const confidenceMeta = INSIGHT_CONFIDENCE_META[insight.confidence];
                  const primaryBasis = sanitizeDTSETriggerText(insight.trigger) ?? 'Protocol structure and current DTSE readout.';
                  const isFirst = idx === 0;

                  return (
                    <div
                      key={insight.id}
                      data-cy={isFirst ? `dtse-insight-${insight.id}` : `dtse-insight-supporting-${insight.id}`}
                      className={`${isFirst ? '' : 'mt-3 border-t border-indigo-200/50 dark:border-slate-700/50 pt-3 transition-colors'}`}
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb size={14} className="mt-0.5 text-amber-600 dark:text-amber-400 transition-colors" />
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] font-bold uppercase tracking-[0.08em] ${confidenceMeta.badgeText}`}>
                            {confidenceMeta.label}
                          </p>
                          <p className="mt-0.5 text-sm font-black tracking-tight text-slate-900 dark:text-white md:text-[15px] transition-colors">{insight.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">{insight.observation}</p>
                        </div>
                      </div>

                      <div className="mt-2 grid gap-2 border-t border-indigo-200/50 dark:border-slate-700/50 pt-2 text-sm leading-relaxed lg:grid-cols-2 transition-colors">
                        <p className="text-slate-700 dark:text-slate-300 transition-colors">
                          <span className="font-semibold text-slate-900 dark:text-slate-200 transition-colors">Why it matters:</span>{' '}
                          {insight.implication}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 transition-colors">
                          <span className="font-semibold text-slate-800 dark:text-slate-300 transition-colors">Basis:</span>{' '}
                          {primaryBasis}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">Next tests</p>
            <div className="space-y-2.5">
              {sorted.map((rec, idx) => {
                const ps = PRIORITY_STYLES[rec.priority];
                const isLead = idx === 0;

                return (
                  <div
                    key={rec.id}
                    data-cy={`dtse-rec-${rec.id}`}
                    className={`bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 dtse-card-interactive transition-all ${ps.shadow}`}
                    style={{ animationDelay: `${idx * 75}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-500 dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-400 transition-colors">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white transition-colors">{rec.action}</h3>
                          <p className={`${ps.badgeText} text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded border ${ps.badge} transition-colors`}>
                            {rec.priority} priority
                          </p>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                          <span className="font-semibold text-slate-900 dark:text-slate-200 transition-colors">Why now:</span> {rec.rationale}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 pl-10">
                      {isLead ? (
                        <>
                          <div className="border-t border-slate-200 dark:border-slate-700/50 pt-3 transition-colors">
                            <div className="mb-3 space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Why now</p>
                              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">{rec.rationale}</p>
                              {rec.risk_if_delayed && (
                                <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 px-3 py-2 transition-colors">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-rose-700 dark:text-rose-400 transition-colors">Risk if ignored</p>
                                  <p className="mt-0.5 text-sm leading-relaxed text-rose-900 dark:text-rose-200/90 transition-colors">{rec.risk_if_delayed}</p>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_0.9fr]">
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="min-w-0">
                                  <div className="flex items-start gap-2">
                                    <ArrowRight size={12} className="mt-1 text-indigo-600 dark:text-indigo-400 transition-colors" />
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">What to change in the rerun</p>
                                      <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                                        {rec.expected_effect ?? 'Adjust the lead stress lever while keeping the comparison contract fixed.'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">What success looks like</p>
                                  <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">
                                    {rec.success_metric ?? 'The rerun should improve the first break without hiding the problem elsewhere.'}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Owner</p>
                                  <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">{rec.owner}</p>
                                </div>
                                {rec.timeframe && (
                                  <div>
                                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Timing</p>
                                      <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors">{rec.timeframe}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            {(rec.risk_if_delayed || rec.peer_analog || (showAdvanced && rec.dependency)) && (
                              <details className="mt-3 border-t border-slate-200 dark:border-slate-700/50 pt-2 transition-colors">
                                <summary className="cursor-pointer text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                                  View additional context
                                </summary>
                                <div className="mt-1.5 grid gap-1.5 text-[12px] leading-relaxed text-slate-600 dark:text-slate-400 transition-colors lg:grid-cols-3">
                                  {rec.risk_if_delayed && (
                                    <p>
                                      <span className="font-semibold text-rose-600 dark:text-rose-400 transition-colors">Risk if ignored:</span> {rec.risk_if_delayed}
                                    </p>
                                  )}
                                  {rec.peer_analog && (
                                    <p>
                                      <span className="font-semibold text-slate-800 dark:text-slate-300 transition-colors">Peer context:</span> {rec.peer_analog}
                                    </p>
                                  )}
                                  {showAdvanced && rec.dependency && (
                                    <p>
                                      <span className="font-semibold text-slate-800 dark:text-slate-300 transition-colors">Hold constant:</span> {rec.dependency}
                                    </p>
                                  )}
                                </div>
                              </details>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="border-t border-slate-200 dark:border-slate-700/50 pt-2 transition-colors">
                          <div className="grid gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors lg:grid-cols-[1fr_1fr_auto] lg:items-start">
                            <p><span className="font-semibold text-slate-900 dark:text-slate-200 transition-colors">Change:</span> {rec.expected_effect ?? 'Adjust the lead stress lever while keeping the comparison contract fixed.'}</p>
                            <p><span className="font-semibold text-slate-900 dark:text-slate-200 transition-colors">Success:</span> {rec.success_metric ?? 'The rerun should improve the first break without hiding the problem elsewhere.'}</p>
                            <div className="text-slate-500 dark:text-slate-400 transition-colors lg:text-right">
                              <p>{rec.owner}</p>
                              {rec.timeframe && <p className="mt-1">{rec.timeframe}</p>}
                            </div>
                          </div>

                          {(rec.risk_if_delayed || rec.peer_analog || (showAdvanced && rec.dependency)) && (
                            <details className="mt-2 border-t border-slate-200 dark:border-slate-700/50 pt-1.5 transition-colors">
                              <summary className="cursor-pointer text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                                View additional context
                              </summary>
                              <div className="mt-1.5 grid gap-1.5 text-[12px] leading-relaxed text-slate-600 dark:text-slate-400 transition-colors lg:grid-cols-3">
                              {rec.risk_if_delayed && (
                                <p>
                                    <span className="font-semibold text-rose-600 dark:text-rose-400 transition-colors">Risk:</span>{' '}
                                  {rec.risk_if_delayed}
                                </p>
                              )}
                              {rec.peer_analog && (
                                <p>
                                    <span className="font-semibold text-slate-800 dark:text-slate-300 transition-colors">Peer:</span>{' '}
                                  {rec.peer_analog}
                                </p>
                              )}
                              {showAdvanced && rec.dependency && (
                                <p>
                                    <span className="font-semibold text-slate-800 dark:text-slate-300 transition-colors">Hold constant:</span>{' '}
                                  {rec.dependency}
                                </p>
                              )}
                              </div>
                            </details>
                          )}
                        </div>
                      )}
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
