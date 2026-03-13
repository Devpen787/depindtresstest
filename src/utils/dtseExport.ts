import type {
  DTSEApplicabilityEntry,
  DTSEFailureSignature,
  DTSEOutcome,
  DTSEProtocolBrief,
  DTSEProtocolInsight,
  DTSERecommendation,
  DTSERunContext,
} from '../types/dtse';
import type { DTSETrustSummary } from './dtsePresentation';
import { sanitizeDTSETriggerText } from './dtsePresentation';

export interface DTSEStakeholderBriefPayload {
  runContext: DTSERunContext;
  protocolBrief: DTSEProtocolBrief;
  applicability: DTSEApplicabilityEntry[];
  outcomes: DTSEOutcome[];
  failureSignatures: DTSEFailureSignature[];
  recommendations: DTSERecommendation[];
  protocolInsights: DTSEProtocolInsight[];
  dataSourceSummary: DTSETrustSummary;
}

export function buildDTSEStakeholderBriefMarkdown(
  payload: DTSEStakeholderBriefPayload,
  metricLabels: Record<string, string>,
  reasonLabels: Record<string, string>,
): string {
  const bandCounts = payload.outcomes.reduce(
    (counts, outcome) => {
      counts[outcome.band] += 1;
      return counts;
    },
    { healthy: 0, watchlist: 0, intervention: 0 } as Record<'healthy' | 'watchlist' | 'intervention', number>,
  );
  const overallBand = bandCounts.intervention > 0
    ? 'Intervention'
    : bandCounts.watchlist > 0
      ? 'Watchlist'
      : 'Healthy';

  const applicabilityLines = payload.applicability.map((entry) => {
    const verdictLabel = entry.verdict === 'R' ? 'Included' : 'Held out';
    const reasonLabel = reasonLabels[entry.reasonCode] ?? entry.reasonCode;
    return `- **${metricLabels[entry.metricId] ?? entry.metricId}** — ${verdictLabel}; reason: ${reasonLabel}${entry.details ? `; note: ${entry.details}` : ''}`;
  });

  const outcomeLines = payload.outcomes.map((outcome) => (
    `- **${metricLabels[outcome.metric_id] ?? outcome.metric_id}**: ${outcome.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${outcome.band})`
  ));

  const signatureLines = payload.failureSignatures.length === 0
    ? ['- No Stage 4 failure pattern was triggered in this run.']
    : payload.failureSignatures.map((signature) => {
      const triggerText = sanitizeDTSETriggerText(signature.trigger_logic);
      return `- **${signature.label}** (${signature.severity}) — ${signature.pattern}${triggerText ? ` Trigger: ${triggerText}` : ''}`;
    });

  const recommendationLines = payload.recommendations.length === 0
    ? ['- No immediate next test is flagged; continue monitoring under matched conditions.']
    : payload.recommendations.map((recommendation) => (
      `- **${recommendation.action}** [${recommendation.priority}] — Why now: ${recommendation.rationale}`
    ));

  const insightLines = payload.protocolInsights.length === 0
    ? ['- No protocol-specific insight was generated for this run.']
    : payload.protocolInsights.map((insight) => (
      `- **${insight.title}** (${insight.confidence}) — ${insight.observation}`
    ));

  const proxyMetrics = payload.dataSourceSummary.proxyMetricLabels.length > 0
    ? payload.dataSourceSummary.proxyMetricLabels.join(', ')
    : 'None';
  const fallbackValues = payload.dataSourceSummary.fallbackReferenceValuesUsed.length > 0
    ? payload.dataSourceSummary.fallbackReferenceValuesUsed.join('; ')
    : 'None';

  return [
    '# DTSE Stakeholder Brief',
    '',
    `**Protocol:** ${payload.protocolBrief.protocol_name}`,
    `**Run ID:** ${payload.runContext.run_id}`,
    `**Stress Channel:** ${payload.runContext.stress_channel?.label ?? payload.runContext.scenario_grid_id}`,
    `**Generated (UTC):** ${payload.runContext.generated_at_utc}`,
    '',
    '## Interpretation Boundary',
    'DTSE is baseline-relative and comparative. This brief does not forecast price, assign a universal rank, or claim live-network truth outside the modeled stress contract.',
    '',
    '## Data Source Summary',
    `- Market context status: ${payload.dataSourceSummary.marketContextStatus}`,
    `- Model source status: ${payload.dataSourceSummary.modelSourceStatus}`,
    `- Scoring confidence status: ${payload.dataSourceSummary.scoringConfidenceStatus}`,
    `- Proxy metrics used: ${proxyMetrics}`,
    `- Fallback/reference values used: ${fallbackValues}`,
    '',
    '## Executive Snapshot',
    `- Overall posture: **${overallBand}**`,
    `- Band mix: ${bandCounts.healthy} healthy · ${bandCounts.watchlist} watchlist · ${bandCounts.intervention} intervention`,
    `- Evidence status: ${payload.runContext.evidence_status}`,
    `- Simulation envelope: ${payload.runContext.horizon_weeks} weeks · ${payload.runContext.n_sims} sims`,
    '',
    '## Stage 2 — What Can Be Scored',
    ...applicabilityLines,
    '',
    '## Stage 3 — What Broke First',
    ...outcomeLines,
    '',
    '## Stage 4 — Failure Patterns',
    ...signatureLines,
    '',
    '## Stage 5 — Next Tests',
    ...recommendationLines,
    '',
    '## Protocol Insights',
    ...insightLines,
    '',
    '---',
    'Prepared from DTSE app export artifacts (.json + .md) for stakeholder review.',
  ].join('\n');
}
