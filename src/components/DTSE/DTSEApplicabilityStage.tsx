import React from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import type { DTSEApplicabilityEntry, DTSEMetricInsight } from '../../types/dtse';

interface DTSEApplicabilityStageProps {
  entries: DTSEApplicabilityEntry[];
  metricLabels: Record<string, string>;
  metricInsights: Record<string, DTSEMetricInsight>;
  reasonLabels: Record<string, string>;
  showAdvanced?: boolean;
  compact?: boolean;
}

const INCLUDED_REASON_CODES = new Set(['PROXY_ACCEPTED', 'INTERPOLATION_RISK']);
const METRIC_REASON_LINES: Record<string, { read: string; usable: string; heldOut?: string }> = {
  solvency_ratio: {
    read: 'reads whether rewards cover emissions burden',
    usable: 'usable here via weekly solvency aggregates',
  },
  payback_period: {
    read: 'reads operator payback pressure',
    usable: 'usable here via modeled reward, price, and cost inputs',
  },
  weekly_retention_rate: {
    read: 'reads supply stickiness',
    usable: 'usable here via provider trajectory summaries',
  },
  network_utilization: {
    read: 'reads demand served versus capacity',
    usable: 'usable here via simulation demand and capacity series',
  },
  tail_risk_score: {
    read: 'reads downside fragility under stress',
    usable: 'usable here via drawdown and dispersion outputs',
  },
  vampire_churn: {
    read: 'reads competitor-yield substitution risk',
    usable: 'usable only when competitive-yield stress is active',
    heldOut: 'held out because competitor-yield substitution is inactive in this scenario',
  },
};
const METRIC_VISUAL_AIDS: Record<string, { family: string; reads: string }> = {
  solvency_ratio: {
    family: 'Economics',
    reads: 'reward coverage',
  },
  payback_period: {
    family: 'Economics',
    reads: 'operator payback',
  },
  weekly_retention_rate: {
    family: 'Supply Stability',
    reads: 'supply stickiness',
  },
  network_utilization: {
    family: 'Demand / Capacity',
    reads: 'capacity use',
  },
  tail_risk_score: {
    family: 'Fragility',
    reads: 'downside stress',
  },
  vampire_churn: {
    family: 'External Yield Pressure',
    reads: 'outside yield substitution',
  },
};
const METRIC_RATIONALE_BASE: Record<string, { scored: string; heldOut: string }> = {
  solvency_ratio: {
    scored: 'Solvency Ratio shows whether rewards are still covering the network emissions burden. In this run it matters because solvency weakness is one of the earliest signs that incentive quality is slipping.',
    heldOut: 'Solvency Ratio is meant to show whether reward support is keeping up with emissions pressure, which is why it is usually an early economic warning signal.',
  },
  payback_period: {
    scored: 'Payback Period captures how quickly operators can recover hardware and operating costs. In this run it matters because stretched payback usually weakens participation before visible supply loss.',
    heldOut: 'Payback Period is used to read operator cost pressure and participation durability when conditions tighten.',
  },
  weekly_retention_rate: {
    scored: 'Weekly Retention tracks whether active providers are sticking with the network from week to week. In this run it matters because retention softening often confirms that economics are no longer holding.',
    heldOut: 'Weekly Retention is the practical stickiness check for productive supply under stress.',
  },
  network_utilization: {
    scored: 'Network Utilization reads how much available capacity is actually converting into paid demand. In this run it matters because weak conversion can reveal demand stress before headline growth metrics react.',
    heldOut: 'Network Utilization is the demand-conversion signal that shows whether capacity is being productively used.',
  },
  tail_risk_score: {
    scored: 'Tail Risk Score summarizes downside fragility under stress rather than average behavior. In this run it matters because it catches non-linear damage that smoother metrics can hide.',
    heldOut: 'Tail Risk Score is designed to capture downside concentration and stress fragility, especially when paths become asymmetric.',
  },
  vampire_churn: {
    scored: 'Vampire Churn tracks whether providers are being pulled away by outside yield alternatives. In this run it matters because external yield competition can accelerate exits even when headline metrics still look stable.',
    heldOut: 'Vampire Churn tracks rotation pressure into outside yield alternatives.',
  },
};

export const DTSEApplicabilityStage: React.FC<DTSEApplicabilityStageProps> = ({
  entries,
  metricLabels,
  metricInsights,
  reasonLabels,
  showAdvanced = false,
  compact = false,
}) => {
  const scoredEntries = entries.filter((entry) => entry.verdict === 'R');
  const heldOutEntries = entries.filter((entry) => entry.verdict !== 'R');
  const proxyScoredEntries = scoredEntries.filter((entry) => entry.reasonCode === 'PROXY_ACCEPTED');
  const totalCount = entries.length;

  const coverageHeadline = `${scoredEntries.length}/${totalCount} metrics are scoreable in this run.`;
  const summaryTakeaway = (() => {
    if (totalCount === 0) return 'No metrics are configured for this run.';
    if (heldOutEntries.length === 0 && proxyScoredEntries.length === 0) {
      return 'All tracked metrics are directly scoreable in this run.';
    }
    if (heldOutEntries.length === 0) {
      return `All tracked metrics are scoreable; ${proxyScoredEntries.length} use accepted proxy evidence.`;
    }
    if (proxyScoredEntries.length === 0) {
      return `${scoredEntries.length} metrics are scoreable now; ${heldOutEntries.length} are held out.`;
    }
    return proxyScoredEntries.length > 0
      ? `${scoredEntries.length} metrics are scoreable now; ${heldOutEntries.length} are held out, with ${proxyScoredEntries.length} proxy-backed.`
      : `${scoredEntries.length} metrics are scoreable now; ${heldOutEntries.length} are held out.`;
  })();
  const coverageValue = `${scoredEntries.length}/${totalCount}`;
  const supportReadLine = (() => {
    if (totalCount === 0) return 'Conclusion: no scoreable metrics are configured in this run.';
    if (scoredEntries.length === 0) {
      return `Conclusion: no fair metric read is available. Blind spot: all ${heldOutEntries.length} tracked metrics are held out.`;
    }
    if (heldOutEntries.length === 0) {
      return `Conclusion: scored metrics provide a complete fair read for this run. Blind spot: none from held-out metrics.`;
    }
    return `Conclusion: scored metrics provide a fair read on ${scoredEntries.length}/${totalCount} tracked metrics. Blind spot: ${heldOutEntries.length} held-out metric${heldOutEntries.length === 1 ? '' : 's'} remain outside this read.`;
  })();

  const exceptionEntries = entries.filter((entry) => {
    if (entry.reasonCode === 'SCENARIO_INACTIVE') return false;
    if (entry.verdict === 'R' && (entry.reasonCode === 'DATA_AVAILABLE' || entry.reasonCode === 'PROXY_ACCEPTED')) return false;
    if (entry.reasonCode === 'DATA_AVAILABLE' && !entry.details) return false;
    return true;
  });

  const runConstraintSummary = exceptionEntries.length > 0
    ? `${exceptionEntries.length} run-specific caveat${exceptionEntries.length === 1 ? '' : 's'} need to be read before you treat this stage as full coverage.`
    : heldOutEntries.length > 0
      ? 'Read held-out metrics as the boundary of what this run can conclude.'
      : 'No special caveats beyond standard DTSE scoring rules.';

  const buildMetricIntent = (metricId: string) => {
    const definition = metricInsights[metricId]?.definition;
    const relevance = metricInsights[metricId]?.why_relevant;
    if (definition && relevance) {
      return `${definition} This matters because ${relevance.charAt(0).toLowerCase()}${relevance.slice(1)}`;
    }
    return definition ?? relevance ?? 'No analytical note available for this metric.';
  };

  const summarizeReason = (entry: DTSEApplicabilityEntry, isScored: boolean): string => {
    const metricLabel = metricLabels[entry.metricId] ?? entry.metricId;
    const metricLine = METRIC_REASON_LINES[entry.metricId];

    if (metricLine) {
      if (isScored) {
        if (entry.reasonCode === 'INTERPOLATION_RISK') {
          return `${metricLabel}: ${metricLine.read}; usable with interpolation risk in this run.`;
        }
        if (entry.reasonCode === 'MANUAL_OVERRIDE') {
          return `${metricLabel}: ${metricLine.read}; usable here via manual review override.`;
        }
        return `${metricLabel}: ${metricLine.read}; ${metricLine.usable}.`;
      }
      if (entry.reasonCode === 'SCENARIO_INACTIVE' && metricLine.heldOut) {
        return `${metricLabel}: ${metricLine.heldOut}.`;
      }
      if (entry.reasonCode === 'DATA_MISSING') {
        return `${metricLabel}: ${metricLine.read}; held out because required inputs are missing in this run.`;
      }
      if (entry.reasonCode === 'SOURCE_GRADE_INSUFFICIENT') {
        return `${metricLabel}: ${metricLine.read}; held out due to insufficient evidence quality.`;
      }
      if (entry.reasonCode === 'MANUAL_OVERRIDE') {
        return `${metricLabel}: ${metricLine.read}; held out by manual review override.`;
      }
      return `${metricLabel}: ${metricLine.read}; held out in this run.`;
    }

    const fallbackIntent = buildMetricIntent(entry.metricId).replace(/\.$/, '');
    const shortIntent = fallbackIntent.length > 110 ? `${fallbackIntent.slice(0, 107)}...` : fallbackIntent;
    if (isScored) {
      if (entry.reasonCode === 'INTERPOLATION_RISK') return `${metricLabel}: ${shortIntent}; usable with interpolation risk in this run.`;
      if (entry.reasonCode === 'MANUAL_OVERRIDE') return `${metricLabel}: ${shortIntent}; usable via manual review override.`;
      return `${metricLabel}: ${shortIntent}; usable in this run.`;
    }
    if (entry.reasonCode === 'SCENARIO_INACTIVE') return `${metricLabel}: inactive under this stress scenario.`;
    if (entry.reasonCode === 'DATA_MISSING') return `${metricLabel}: held out because required inputs are missing in this run.`;
    if (entry.reasonCode === 'SOURCE_GRADE_INSUFFICIENT') return `${metricLabel}: held out due to insufficient evidence quality.`;
    if (entry.reasonCode === 'MANUAL_OVERRIDE') return `${metricLabel}: held out by manual review override.`;
    return `${metricLabel}: held out in this run.`;
  };

  const buildExpandedRationale = (entry: DTSEApplicabilityEntry, isScored: boolean): string => {
    const base = METRIC_RATIONALE_BASE[entry.metricId];
    const metricLabel = metricLabels[entry.metricId] ?? entry.metricId;
    const fallbackBase = buildMetricIntent(entry.metricId).replace(/\.$/, '');
    const scoredLead = base?.scored ?? `${metricLabel} ${fallbackBase.charAt(0).toLowerCase()}${fallbackBase.slice(1)}.`;
    const heldOutLead = base?.heldOut ?? `${metricLabel} ${fallbackBase.charAt(0).toLowerCase()}${fallbackBase.slice(1)}.`;

    if (isScored) {
      const scoredTail = (() => {
        switch (entry.reasonCode) {
          case 'PROXY_ACCEPTED':
            return 'This run has stable proxy evidence for it, so it remains usable.';
          case 'INTERPOLATION_RISK':
            return 'It is still usable here, but read it with interpolation risk in mind.';
          case 'MANUAL_OVERRIDE':
            return 'It is included in this run after manual review.';
          default:
            return 'The required run outputs are present, so it can be scored directly.';
        }
      })();
      return `${scoredLead} ${scoredTail}`;
    }

    const heldOutTail = (() => {
      switch (entry.reasonCode) {
        case 'SCENARIO_INACTIVE':
          return 'That pressure is not active in this scenario, so scoring it would be misleading.';
        case 'DATA_MISSING':
          return 'Key inputs are missing in this run, so scoring it would create false precision.';
        case 'SOURCE_GRADE_INSUFFICIENT':
          return 'Evidence quality is not strong enough in this run to score it fairly.';
        case 'MANUAL_OVERRIDE':
          return 'It is intentionally excluded in this run after manual review.';
        default:
          return 'This run does not support a fair score for this metric.';
      }
    })();
    return `${heldOutLead} ${heldOutTail}`;
  };

  const renderMetricRow = (entry: DTSEApplicabilityEntry) => {
    const isScored = entry.verdict === 'R';
    const reasonLabel = reasonLabels[entry.reasonCode] ?? entry.reasonCode;
    const reasonTone = isScored
      ? (INCLUDED_REASON_CODES.has(entry.reasonCode) ? 'text-amber-400' : 'text-emerald-400')
      : (entry.reasonCode === 'SCENARIO_INACTIVE' ? 'text-slate-500' : 'text-rose-400');
    const sourceLabel = isScored
      ? (entry.reasonCode === 'PROXY_ACCEPTED' ? 'Proxy-backed' : 'Direct')
      : (entry.reasonCode === 'SCENARIO_INACTIVE' ? 'Scenario inactive' : 'Excluded');
    const sourceTone = isScored
      ? (entry.reasonCode === 'PROXY_ACCEPTED'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300'
        : 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300')
      : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400';
    const summaryReason = summarizeReason(entry, isScored);
    const expandedRationale = buildExpandedRationale(entry, isScored);
    const visualAid = METRIC_VISUAL_AIDS[entry.metricId] ?? {
      family: 'Core signal',
      reads: (METRIC_REASON_LINES[entry.metricId]?.read ?? 'reads run behavior').replace(/^reads\s+/i, ''),
    };
    const showReasonTag = entry.reasonCode !== 'PROXY_ACCEPTED' && entry.reasonCode !== 'DATA_AVAILABLE';

    return (
      <div
        key={entry.metricId}
        data-cy={`dtse-applicability-${entry.metricId}`}
        className={`rounded-lg border px-3 py-2 transition-colors ${isScored
          ? 'border-indigo-200 bg-white shadow-sm dark:border-indigo-500/20 dark:bg-slate-800/60 dark:shadow-md'
          : 'border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-900/40'
          }`}
      >
        <div className="flex flex-col gap-1.5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="mt-0.5 shrink-0">
              {isScored ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <XCircle size={16} className={entry.reasonCode === 'SCENARIO_INACTIVE' ? 'text-slate-500' : 'text-rose-400'} />
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{metricLabels[entry.metricId] ?? entry.metricId}</p>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${isScored
                    ? 'dtse-glow-success'
                    : 'border border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                >
                  {isScored ? 'Scored now' : 'Held out'}
                </span>
                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${sourceTone}`}>
                  {sourceLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-slate-400 transition-colors">
                  {visualAid.family}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 transition-colors">Reads {visualAid.reads}</p>
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-300 transition-colors">{summaryReason}</p>
            </div>
          </div>

          {showReasonTag && (
            <div className="flex items-center gap-2 lg:pl-4">
              <span className={`text-[11px] font-bold uppercase tracking-[0.14em] ${reasonTone}`}>{reasonLabel}</span>
            </div>
          )}
        </div>

        <details className="mt-1 border-t border-slate-200 dark:border-slate-700/50 pt-1 leading-none transition-colors">
          <summary className="cursor-pointer text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 list-none [&::-webkit-details-marker]:hidden transition-colors">
            View rationale
          </summary>
          <div className="mt-1.5">
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">{expandedRationale}</p>
          </div>
        </details>
      </div>
    );
  };

  const renderMetricGroup = (groupLabel: string, rows: DTSEApplicabilityEntry[], tone: 'emerald' | 'slate') => (
    <section className="rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/40 p-2.5 shadow-sm dark:shadow-inner transition-colors">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className={`text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${tone === 'emerald' ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>
          {groupLabel}
        </p>
        <span className={`rounded-md border px-2 py-0.5 text-xs font-bold transition-colors ${tone === 'emerald'
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300'
          : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400'}`}>
          {rows.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {rows.length > 0 ? (
          rows.map(renderMetricRow)
        ) : (
          <p className="text-[12px] text-slate-500 dark:text-slate-400 transition-colors">None in this run.</p>
        )}
      </div>
    </section>
  );

  return (
    <div
      data-cy="dtse-applicability-stage"
      className={`${compact ? 'space-y-2.5 p-3' : 'space-y-3 p-3.5'} animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-[20px] bg-white border-slate-200 dark:bg-slate-900/40 dark:border-white/5 dark:backdrop-blur-xl border shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-slate-800 dark:text-slate-100 transition-colors`}
    >
      <div className="space-y-0.5">
        <h2 className={`${compact ? 'text-[15px]' : 'text-base'} font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-slate-100 dark:via-slate-300 dark:to-slate-500`}>
          Stage 2 — What Can Be Scored
        </h2>
        <p className={`${compact ? 'max-w-3xl text-[13px]' : 'max-w-[52rem] text-[13px]'} leading-relaxed text-slate-500 dark:text-slate-400 transition-colors`}>
          Which metrics are fair to use in this run.
        </p>
      </div>

      <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-4 transition-colors">
        <div className="flex items-start gap-2.5">
          <Info size={16} className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400 transition-colors" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400 transition-colors">Scoring summary</p>
            <h3 className="mt-1 text-[17px] font-black tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{coverageHeadline}</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300 transition-colors">{summaryTakeaway}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/40 px-3 py-2 md:grid-cols-4 shadow-sm dark:shadow-inner transition-colors">
          <div className="space-y-0.5">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Scored now</p>
            <p className="text-[14px] font-semibold tracking-tight text-slate-700 dark:text-slate-200 transition-colors">{scoredEntries.length}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Held out</p>
            <p className="text-[14px] font-semibold tracking-tight text-slate-600 dark:text-slate-300 transition-colors">{heldOutEntries.length}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Proxy-backed</p>
            <p className="text-[14px] font-semibold tracking-tight text-amber-600 dark:text-amber-400 transition-colors">{proxyScoredEntries.length}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 transition-colors">Coverage</p>
            <p className="text-[14px] font-semibold tracking-tight text-slate-900 dark:text-white transition-colors">{coverageValue}</p>
          </div>
          <div className="col-span-2 border-t border-slate-200 dark:border-slate-700/50 pt-1.5 md:col-span-4 transition-colors">
            <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
              {supportReadLine}
            </p>
          </div>
        </div>

        <section className="mt-2.5 space-y-2 border-t border-slate-200 dark:border-slate-700/50 pt-2.5 transition-colors">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">Metrics in this run</p>

          <div className="grid grid-cols-1 gap-2.5">
            {renderMetricGroup('Scored now', scoredEntries, 'emerald')}
            {renderMetricGroup('Held out', heldOutEntries, 'slate')}
          </div>
        </section>

        <div data-cy="dtse-applicability-exceptions" className="mt-2.5 border-t border-slate-200 dark:border-slate-700/50 pt-2.5 transition-colors">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">Run constraints</p>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">{runConstraintSummary}</p>
          {exceptionEntries.length > 0 ? (
            <ul className="mt-1.5 space-y-1.5">
              {exceptionEntries.map((entry) => (
                <li
                  key={`exception-${entry.metricId}`}
                  data-cy={`dtse-applicability-note-${entry.metricId}`}
                  className="rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-900/60 px-2 py-1.5 text-[12px] text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <span className="font-semibold text-slate-900 dark:text-white transition-colors">{metricLabels[entry.metricId] ?? entry.metricId}</span>
                  {' · '}
                  {entry.verdict === 'R' ? 'Scored now' : 'Held out'}
                  {' · '}
                  {reasonLabels[entry.reasonCode] ?? entry.reasonCode}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400 transition-colors">No run-specific scoring exceptions were detected.</p>
          )}
        </div>

        {showAdvanced && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-900/40 p-3 shadow-sm dark:shadow-inner transition-colors">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-indigo-600 dark:text-indigo-400 transition-colors" />
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">Reason code legend</p>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              {Object.entries(reasonLabels).map(([key, label]) => (
                <p key={key} className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                  <span className="mr-1.5 rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 transition-colors">
                    {key}
                  </span>
                  {label}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
