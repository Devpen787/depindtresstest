import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { ProtocolProfileV1 } from '../../data/protocols';
import { PROTOCOL_PROFILES } from '../../data/protocols';
import type { AggregateResult, DerivedMetrics, SimulationParams } from '../../model/types';
import type { TokenMarketData } from '../../services/coingecko';
import type { DTSEApplicabilityEntry, DTSEFailureSignature, DTSEOutcome, DTSEProtocolInsight, DTSERecommendation, DTSERunContext, DTSEStressChannel } from '../../types/dtse';
import {
  buildDTSEProtocolPack,
  DTSE_METRIC_INSIGHTS,
  DTSE_REASON_LABELS,
} from '../../data/dtseContent';
import { DTSE_PEER_ANALOGS } from '../../data/dtsePeerAnalogs';
import { buildLiveDTSEOutputs, buildLiveDTSERunContext } from '../../utils/dtseLiveOutputs';
import { buildLiveDTSEFailureSignatures } from '../../utils/dtseLiveSignatures';
import { buildLiveDTSERecommendations } from '../../utils/dtseLiveRecommendations';
import { buildLiveDTSEApplicability } from '../../utils/dtseLiveApplicability';
import { inferDTSEStressChannel } from '../../utils/dtseStressChannel';
import { buildDTSESequenceView } from '../../utils/dtseSequenceView';
import { buildDTSEProtocolInsights } from '../../utils/dtseProtocolInsights';
import { DTSEContextStage } from './DTSEContextStage';
import { DTSEApplicabilityStage } from './DTSEApplicabilityStage';
import { DTSEOutcomesStage, type DTSEThresholdConfig } from './DTSEOutcomesStage';
import { DTSESignatureStage } from './DTSESignatureStage';
import { DTSERecommendationsStage } from './DTSERecommendationsStage';
import {
  PAYBACK_GUARDRAILS,
  RETENTION_GUARDRAILS,
  SOLVENCY_GUARDRAILS,
  TAIL_RISK_GUARDRAILS,
  UTILIZATION_GUARDRAILS,
} from '../../constants/guardrails';

const STAGE_COUNT = 5;

const STAGE_LABELS: string[] = [
  'Protocol Context',
  'Applicability',
  'Outcomes',
  'Failure Autopsy',
  'Response Paths',
];
type DTSEViewMode = 'guided' | 'overview';

const STRESS_CHANNEL_OPTIONS: Array<{ id: DTSEStressChannel['id']; label: string }> = [
  { id: 'baseline_neutral', label: 'Baseline Neutral' },
  { id: 'demand_contraction', label: 'Demand Contraction' },
  { id: 'liquidity_shock', label: 'Liquidity Shock' },
  { id: 'competitive_yield_pressure', label: 'Competitive-Yield Pressure' },
  { id: 'provider_cost_inflation', label: 'Provider Cost Inflation' },
];

const METRIC_LABELS: Record<string, string> = {
  solvency_ratio: 'Solvency Ratio',
  payback_period: 'Payback Period',
  weekly_retention_rate: 'Weekly Retention',
  network_utilization: 'Network Utilization',
  tail_risk_score: 'Tail Risk Score',
  vampire_churn: 'Vampire Churn',
};

const UNIT_MAP: Record<string, string> = {
  solvency_ratio: 'x',
  payback_period: 'months',
  weekly_retention_rate: '%',
  network_utilization: '%',
  tail_risk_score: 'score',
};

const METRIC_THRESHOLD_CONFIG: Record<string, DTSEThresholdConfig> = {
  solvency_ratio: {
    healthyTarget: SOLVENCY_GUARDRAILS.healthyRatio,
    direction: 'higher',
    label: `${SOLVENCY_GUARDRAILS.healthyRatio.toFixed(2)}x`,
  },
  payback_period: {
    healthyTarget: PAYBACK_GUARDRAILS.healthyMaxMonths,
    direction: 'lower',
    label: `${PAYBACK_GUARDRAILS.healthyMaxMonths} months`,
  },
  weekly_retention_rate: {
    healthyTarget: RETENTION_GUARDRAILS.benchmarkMinPct,
    direction: 'higher',
    label: `${RETENTION_GUARDRAILS.benchmarkMinPct}%`,
  },
  network_utilization: {
    healthyTarget: UTILIZATION_GUARDRAILS.healthyMinPct,
    direction: 'higher',
    label: `${UTILIZATION_GUARDRAILS.healthyMinPct}%`,
  },
  tail_risk_score: {
    healthyTarget: TAIL_RISK_GUARDRAILS.healthyMax,
    direction: 'lower',
    label: `${TAIL_RISK_GUARDRAILS.healthyMax}`,
  },
};

const ctxLikeFallback = (scenarioGridId: string) => ({
  id: 'baseline_neutral' as const,
  label: 'Saved DTSE Bundle',
  summary: 'Static DTSE pack loaded without a live runtime scenario mapping.',
  basis: scenarioGridId,
});

interface DTSEStakeholderBriefPayload {
  runContext: DTSERunContext;
  applicability: DTSEApplicabilityEntry[];
  outcomes: DTSEOutcome[];
  failureSignatures: DTSEFailureSignature[];
  recommendations: DTSERecommendation[];
  protocolInsights: DTSEProtocolInsight[];
}

const downloadTextFile = (filename: string, contents: string, mimeType: string) => {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const buildDTSEStakeholderBriefMarkdown = (
  payload: DTSEStakeholderBriefPayload,
  metricLabels: Record<string, string>,
  reasonLabels: Record<string, string>,
): string => {
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
    const verdictLabel = entry.verdict === 'R' ? 'Included' : 'Excluded (NR)';
    const reasonLabel = reasonLabels[entry.reasonCode] ?? entry.reasonCode;
    return `- **${metricLabels[entry.metricId] ?? entry.metricId}** — ${verdictLabel}; reason: ${reasonLabel}${entry.details ? `; note: ${entry.details}` : ''}`;
  });

  const outcomeLines = payload.outcomes.map((outcome) => (
    `- **${metricLabels[outcome.metric_id] ?? outcome.metric_id}**: ${outcome.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${outcome.band})`
  ));

  const signatureLines = payload.failureSignatures.length === 0
    ? ['- No Stage 2 failure signature was triggered in this run.']
    : payload.failureSignatures.map((signature) => (
      `- **${signature.label}** (${signature.severity}) — ${signature.pattern}${signature.trigger_logic ? ` Trigger: ${signature.trigger_logic}` : ''}`
    ));

  const recommendationLines = payload.recommendations.length === 0
    ? ['- No immediate response path flagged; continue monitoring under matched conditions.']
    : payload.recommendations.map((recommendation) => (
      `- **${recommendation.action}** [${recommendation.priority}] — ${recommendation.rationale}`
    ));

  const insightLines = payload.protocolInsights.length === 0
    ? ['- No protocol-specific insight was generated for this run.']
    : payload.protocolInsights.map((insight) => (
      `- **${insight.title}** (${insight.confidence}) — ${insight.observation}`
    ));

  return [
    '# DTSE Stakeholder Brief',
    '',
    `**Protocol:** ${payload.runContext.protocol_id}`,
    `**Run ID:** ${payload.runContext.run_id}`,
    `**Stress Channel:** ${payload.runContext.stress_channel?.label ?? payload.runContext.scenario_grid_id}`,
    `**Generated (UTC):** ${payload.runContext.generated_at_utc}`,
    '',
    '## Interpretation Boundary',
    'DTSE is baseline-relative and comparative. This brief does not forecast price, assign a universal rank, or claim live-network truth outside the modeled stress contract.',
    '',
    '## Executive Snapshot',
    `- Overall posture: **${overallBand}**`,
    `- Band mix: ${bandCounts.healthy} healthy · ${bandCounts.watchlist} watchlist · ${bandCounts.intervention} intervention`,
    `- Evidence status: ${payload.runContext.evidence_status}`,
    `- Simulation envelope: ${payload.runContext.horizon_weeks} weeks · ${payload.runContext.n_sims} sims`,
    '',
    '## Stage 2 — Applicability (Fair Scoring Gate)',
    ...applicabilityLines,
    '',
    '## Stage 3 — Outcomes (Sequence Over Magnitude)',
    ...outcomeLines,
    '',
    '## Stage 4 — Failure Signatures',
    ...signatureLines,
    '',
    '## Stage 5 — Response Paths (Interpretive, Not Prescriptive)',
    ...recommendationLines,
    '',
    '## Protocol Insights',
    ...insightLines,
    '',
    '---',
    'Prepared from DTSE app export artifacts (.json + .md) for stakeholder review.',
  ].join('\n');
};

interface DTSEDashboardProps {
  activeProfile?: ProtocolProfileV1;
  profiles?: ProtocolProfileV1[];
  onSelectProtocol?: (profile: ProtocolProfileV1) => void;
  onSelectStressChannel?: (channelId: DTSEStressChannel['id']) => void;
  liveData?: Record<string, TokenMarketData | null>;
  params?: SimulationParams;
  aggregated?: AggregateResult[];
  baselineAggregated?: AggregateResult[];
  multiAggregated?: Record<string, AggregateResult[]>;
  derivedMetrics?: DerivedMetrics | null;
  simulationRunId?: number;
  useNewModel?: boolean;
}

export const DTSEDashboard: React.FC<DTSEDashboardProps> = ({
  activeProfile,
  profiles,
  onSelectProtocol,
  onSelectStressChannel,
  liveData,
  params,
  aggregated,
  baselineAggregated,
  multiAggregated,
  derivedMetrics,
  simulationRunId = 0,
  useNewModel = true,
}) => {
  const availableProfiles = profiles && profiles.length > 0 ? profiles : PROTOCOL_PROFILES;
  const fallbackProfile = (availableProfiles[0] ?? PROTOCOL_PROFILES[0]) as ProtocolProfileV1;
  const [currentStage, setCurrentStage] = useState(0);
  const [viewMode, setViewMode] = useState<DTSEViewMode>('guided');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedProtocolId, setSelectedProtocolId] = useState(
    activeProfile?.metadata.id ?? fallbackProfile.metadata.id
  );

  useEffect(() => {
    if (activeProfile?.metadata.id) {
      setSelectedProtocolId(activeProfile.metadata.id);
    }
  }, [activeProfile?.metadata.id]);

  const selectedProfile = useMemo(
    () => availableProfiles.find((profile) => profile.metadata.id === selectedProtocolId) ?? fallbackProfile,
    [availableProfiles, fallbackProfile, selectedProtocolId]
  );

  const pack = useMemo(() => buildDTSEProtocolPack(selectedProfile), [selectedProfile]);
  const liveAggregated = useMemo(() => {
    if (activeProfile?.metadata.id === selectedProfile.metadata.id && aggregated && aggregated.length > 0) {
      return aggregated;
    }
    const selectedProfileSeries = multiAggregated?.[selectedProfile.metadata.id];
    if (selectedProfileSeries && selectedProfileSeries.length > 0) {
      return selectedProfileSeries;
    }
    return [];
  }, [activeProfile?.metadata.id, aggregated, multiAggregated, selectedProfile.metadata.id]);
  const liveBaselineAggregated = useMemo(() => {
    if (activeProfile?.metadata.id === selectedProfile.metadata.id && baselineAggregated && baselineAggregated.length > 0) {
      return baselineAggregated;
    }
    return [];
  }, [activeProfile?.metadata.id, baselineAggregated, selectedProfile.metadata.id]);
  const liveOutputs = useMemo(() => {
    if (!params) return null;
    return buildLiveDTSEOutputs(liveAggregated, params, derivedMetrics);
  }, [derivedMetrics, liveAggregated, params]);
  const sequenceView = useMemo(() => {
    if (!params) return null;
    return buildDTSESequenceView(liveAggregated, liveBaselineAggregated, params);
  }, [liveAggregated, liveBaselineAggregated, params]);
  const displayedApplicability = useMemo(() => {
    if (!params) {
      return pack.applicability;
    }
    return buildLiveDTSEApplicability(liveAggregated, params, derivedMetrics) ?? pack.applicability;
  }, [derivedMetrics, liveAggregated, pack.applicability, params]);
  const displayedOutcomes = useMemo(
    () => (liveOutputs?.outcomes ?? pack.outcomes).filter((outcome) => outcome.metric_id !== 'stress_resilience_index'),
    [liveOutputs?.outcomes, pack.outcomes],
  );
  const displayedFailureSignatures = useMemo(() => {
    if (!params || !liveOutputs) {
      return pack.failureSignatures;
    }
    return buildLiveDTSEFailureSignatures(liveAggregated, params, displayedOutcomes);
  }, [displayedOutcomes, liveAggregated, liveOutputs, pack.failureSignatures, params]);
  const peerContext = useMemo(() => {
    const analog = DTSE_PEER_ANALOGS[selectedProfile.metadata.id];
    if (!analog) return undefined;
    const peerNames = analog.peer_ids.map((peerId) => (
      availableProfiles.find((profile) => profile.metadata.id === peerId)?.metadata.name ?? peerId
    ));
    return {
      peerNames,
      rationale: analog.rationale,
      confidence: analog.confidence,
    };
  }, [availableProfiles, selectedProfile.metadata.id]);
  const stressChannel = useMemo(
    () => (params ? inferDTSEStressChannel(params, selectedProfile) : ctxLikeFallback(pack.runContext.scenario_grid_id)),
    [pack.runContext.scenario_grid_id, params, selectedProfile],
  );
  const displayedRecommendations = useMemo(() => {
    if (!liveOutputs) {
      return pack.recommendations;
    }
    return buildLiveDTSERecommendations(displayedFailureSignatures, displayedOutcomes, {
      protocolName: selectedProfile.metadata.name,
      peerNames: peerContext?.peerNames,
    });
  }, [displayedFailureSignatures, displayedOutcomes, liveOutputs, pack.recommendations, peerContext?.peerNames, selectedProfile.metadata.name]);
  const displayedProtocolInsights = useMemo(() => (
    buildDTSEProtocolInsights({
      profile: selectedProfile,
      protocolBrief: pack.protocolBrief,
      outcomes: displayedOutcomes,
      failureSignatures: displayedFailureSignatures,
      sequenceView,
      peerNames: peerContext?.peerNames,
    })
  ), [displayedFailureSignatures, displayedOutcomes, pack.protocolBrief, peerContext?.peerNames, selectedProfile, sequenceView]);
  const ctx = useMemo(() => {
    if (!params || !liveOutputs) {
      return pack.runContext;
    }
    return buildLiveDTSERunContext({
      profileId: selectedProfile.metadata.id,
      params,
      simulationRunId,
      modelVersion: useNewModel ? 'Agent-Based v2' : 'Legacy v1',
      outcomes: displayedOutcomes,
      weeklySolvency: liveOutputs.weeklySolvency,
      stressChannel,
      fallbackScenarioGridId: pack.runContext.scenario_grid_id,
      failureSignatures: displayedFailureSignatures,
      recommendations: displayedRecommendations,
    });
  }, [displayedFailureSignatures, displayedOutcomes, displayedRecommendations, liveOutputs, pack, params, selectedProfile.metadata.id, simulationRunId, stressChannel, useNewModel]);
  const handleProtocolChange = useCallback((nextId: string) => {
    setSelectedProtocolId(nextId);
    setCurrentStage(0);
    const profile = availableProfiles.find((candidate) => candidate.metadata.id === nextId);
    if (profile && onSelectProtocol) {
      onSelectProtocol(profile);
    }
  }, [availableProfiles, onSelectProtocol]);

  const scrollToOverviewStage = useCallback((stageIdx: number) => {
    document.getElementById(`dtse-overview-section-${stageIdx}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const activateStage = useCallback((stageIdx: number) => {
    setCurrentStage(stageIdx);
    if (viewMode === 'overview') {
      window.requestAnimationFrame(() => {
        scrollToOverviewStage(stageIdx);
      });
    }
  }, [scrollToOverviewStage, viewMode]);

  const goNext = useCallback(() => {
    setCurrentStage((s) => Math.min(s + 1, STAGE_COUNT - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentStage((s) => Math.max(s - 1, 0));
  }, []);

  const handleFooterNavKeyDown = useCallback((e: React.KeyboardEvent, direction: 'next' | 'prev') => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (direction === 'next') goNext();
    else goPrev();
  }, [goNext, goPrev]);

  const handleStageKeyDown = (e: React.KeyboardEvent, stageIdx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activateStage(stageIdx);
      return;
    }
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = Math.min(stageIdx + 1, STAGE_COUNT - 1);
    else if (e.key === 'ArrowLeft') next = Math.max(stageIdx - 1, 0);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = STAGE_COUNT - 1;

    if (next !== null) {
      e.preventDefault();
      activateStage(next);
      if (viewMode === 'guided') {
        window.requestAnimationFrame(() => {
          document.getElementById(`dtse-stage-btn-${next}`)?.focus();
        });
      }
    }
  };

  const handleSwitchToOverview = useCallback(() => {
    setViewMode('overview');
    window.requestAnimationFrame(() => {
      scrollToOverviewStage(currentStage);
    });
  }, [currentStage, scrollToOverviewStage]);

  const renderStageContent = (stageIdx: number) => {
    if (stageIdx === 0) {
      return (
        <DTSEContextStage
          protocolBrief={pack.protocolBrief}
          outcomes={displayedOutcomes}
          marketData={liveData?.[selectedProfile.metadata.id] ?? null}
          metricLabels={METRIC_LABELS}
          peerContext={peerContext}
          stressChannel={ctx.stress_channel}
          showAdvanced={showAdvanced}
          modelVersion={ctx.model_version}
          generatedAt={ctx.generated_at_utc}
          horizonWeeks={ctx.horizon_weeks}
          nSims={ctx.n_sims}
        />
      );
    }

    if (stageIdx === 1) {
      return (
        <DTSEApplicabilityStage
          entries={displayedApplicability}
          metricLabels={METRIC_LABELS}
          metricInsights={DTSE_METRIC_INSIGHTS}
          reasonLabels={DTSE_REASON_LABELS}
          showAdvanced={showAdvanced}
        />
      );
    }

    if (stageIdx === 2) {
      return (
        <DTSEOutcomesStage
          outcomes={displayedOutcomes}
          weeklySolvency={ctx.weekly_solvency}
          trajectorySource={liveOutputs ? 'model' : 'frozen'}
          metricLabels={METRIC_LABELS}
          unitMap={UNIT_MAP}
            applicabilityEntries={displayedApplicability}
            metricInsights={DTSE_METRIC_INSIGHTS}
            thresholdConfigMap={METRIC_THRESHOLD_CONFIG}
            sequenceView={sequenceView ?? undefined}
          />
      );
    }

    if (stageIdx === 3) {
      return (
        <DTSESignatureStage
          signatures={displayedFailureSignatures}
          metricLabels={METRIC_LABELS}
          showAdvanced={showAdvanced}
        />
      );
    }

    return (
      <DTSERecommendationsStage
        recommendations={displayedRecommendations}
        insights={displayedProtocolInsights}
        onExport={handleExport}
        showAdvanced={showAdvanced}
      />
    );
  };

  const handleExport = useCallback(() => {
    const payload = {
      runContext: ctx,
      protocolBrief: pack.protocolBrief,
      applicability: displayedApplicability,
      outcomes: displayedOutcomes,
      failureSignatures: displayedFailureSignatures,
      recommendations: displayedRecommendations,
      protocolInsights: displayedProtocolInsights,
      exportedAt: new Date().toISOString(),
    };
    const dateKey = new Date().toISOString().slice(0, 10);
    const baseName = `dtse-export-${ctx.run_id}-${dateKey}`;

    downloadTextFile(`${baseName}.json`, JSON.stringify(payload, null, 2), 'application/json');

    const stakeholderBrief = buildDTSEStakeholderBriefMarkdown(
      payload,
      METRIC_LABELS,
      DTSE_REASON_LABELS,
    );
    downloadTextFile(`${baseName}.md`, stakeholderBrief, 'text/markdown');
  }, [ctx, displayedApplicability, displayedFailureSignatures, displayedOutcomes, displayedProtocolInsights, displayedRecommendations, pack.protocolBrief]);

  return (
    <div data-cy="dtse-dashboard-root" className="flex flex-col h-full relative overflow-hidden bg-slate-950">
      {/* Decorative background blurs for depth */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-emerald-900/10 blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col h-full z-10">
        {/* Persistent run context strip */}
        <div className="shrink-0 border-b border-white/5 bg-slate-900/35 backdrop-blur-xl px-6 py-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="min-w-[180px]">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Protocol</span>
                <div className="mt-1">
                  <select
                    data-cy="dtse-protocol-select"
                    value={selectedProfile.metadata.id}
                    onChange={(event) => handleProtocolChange(event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {availableProfiles.map((profile) => (
                      <option key={profile.metadata.id} value={profile.metadata.id}>
                        {profile.metadata.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="min-w-[220px]">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Stress Channel</span>
                <div className="mt-1">
                  <select
                    data-cy="dtse-stress-select"
                    value={stressChannel.id}
                    onChange={(event) => onSelectStressChannel?.(event.target.value as DTSEStressChannel['id'])}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STRESS_CHANNEL_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {showAdvanced && (
                <div className="flex flex-wrap items-center gap-2 xl:mt-5">
                  <span className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${ctx.evidence_status === 'complete'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                      : ctx.evidence_status === 'partial'
                        ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                        : 'border-rose-500/20 bg-rose-500/10 text-rose-300'
                    }`}>
                    {ctx.evidence_status} evidence
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 xl:items-end">
              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <div className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-900 p-1">
                  <button
                    data-cy="dtse-view-mode-guided"
                    onClick={() => setViewMode('guided')}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'guided'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    Guided
                  </button>
                  <button
                    data-cy="dtse-view-mode-overview"
                    onClick={handleSwitchToOverview}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'overview'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    Overview
                  </button>
                </div>
                <button
                  data-cy="dtse-toggle-advanced"
                  onClick={() => setShowAdvanced((current) => !current)}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide transition-all border ${showAdvanced
                    ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200'
                    : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:text-slate-200'
                    }`}
                >
                  Advanced {showAdvanced ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stage indicator bar */}
        <div className="shrink-0 px-6 py-4 border-b border-white/5 bg-slate-900/20 backdrop-blur-md">
          <div
            role={viewMode === 'guided' ? 'tablist' : undefined}
            aria-label="DTSE evaluation stages"
            className="flex items-center gap-1"
          >
            {STAGE_LABELS.map((label, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div className={`h-px flex-1 max-w-[40px] transition-colors ${idx <= currentStage ? 'bg-indigo-500' : 'bg-slate-800'
                    }`} />
                )}
                <button
                  id={`dtse-stage-btn-${idx}`}
                  role={viewMode === 'guided' ? 'tab' : undefined}
                  tabIndex={viewMode === 'guided' ? (currentStage === idx ? 0 : -1) : 0}
                  aria-selected={viewMode === 'guided' ? currentStage === idx : undefined}
                  aria-controls={viewMode === 'guided' ? `dtse-stage-panel-${idx}` : undefined}
                  aria-current={viewMode === 'overview' && currentStage === idx ? 'step' : undefined}
                  data-cy={`dtse-stage-${idx + 1}`}
                  onClick={() => activateStage(idx)}
                  onKeyDown={(e) => handleStageKeyDown(e, idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap border ${currentStage === idx
                      ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                      : idx < currentStage
                        ? 'bg-slate-800/40 border-white/5 text-slate-300 hover:bg-slate-700/50'
                        : 'bg-slate-900/40 border-transparent text-slate-500 hover:text-slate-400 hover:bg-slate-800/30'
                    }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${currentStage === idx
                      ? 'bg-white/20'
                      : idx < currentStage
                        ? 'bg-indigo-600/40 text-indigo-300'
                        : 'bg-slate-800 text-slate-600'
                    }`}>
                    {idx + 1}
                  </span>
                  <span>{label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Stage content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {viewMode === 'guided' ? (
            <div
              id={`dtse-stage-panel-${currentStage}`}
              role="tabpanel"
              aria-labelledby={`dtse-stage-btn-${currentStage}`}
              data-cy={`dtse-stage-panel-${currentStage + 1}`}
            >
              {renderStageContent(currentStage)}
            </div>
          ) : (
            <div data-cy="dtse-overview-root" className="space-y-5">
              {STAGE_LABELS.map((label, idx) => (
                <section
                  key={label}
                  id={`dtse-overview-section-${idx}`}
                  data-cy={`dtse-stage-panel-${idx + 1}`}
                  className="rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-indigo-900/60 text-xs font-black text-indigo-300">
                      {idx + 1}
                    </span>
                    <h2 className="text-sm font-black uppercase tracking-[0.14em] text-slate-300">{label}</h2>
                  </div>
                  {renderStageContent(idx)}
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Navigation footer */}
        {viewMode === 'guided' ? (
          <div className="shrink-0 border-t border-white/5 bg-slate-900/40 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
            <button
              data-cy="dtse-prev-stage"
              onClick={goPrev}
              onKeyDown={(e) => handleFooterNavKeyDown(e, 'prev')}
              disabled={currentStage === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${currentStage === 0
                  ? 'border-transparent text-slate-700 cursor-not-allowed'
                  : 'bg-slate-800/40 border-white/10 text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`}
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <span className="text-xs text-slate-400 font-mono">
              Stage {currentStage + 1} of {STAGE_COUNT}
            </span>

            <button
              data-cy="dtse-next-stage"
              onClick={goNext}
              onKeyDown={(e) => handleFooterNavKeyDown(e, 'next')}
              disabled={currentStage === STAGE_COUNT - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${currentStage === STAGE_COUNT - 1
                  ? 'border-transparent text-slate-700 cursor-not-allowed'
                  : 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200 hover:bg-indigo-500/40 hover:text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                }`}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <div className="shrink-0 border-t border-white/5 bg-slate-900/40 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-300 uppercase tracking-[0.14em]">Overview mode: all stages visible</span>
            <button
              data-cy="dtse-switch-guided-footer"
              onClick={() => setViewMode('guided')}
              className="px-3 py-1 rounded text-xs font-bold uppercase tracking-[0.12em] bg-slate-800/40 border border-white/10 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all"
            >
              Back to Guided
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
