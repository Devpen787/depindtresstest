import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Moon, Sun } from 'lucide-react';
import type { ProtocolProfileV1 } from '../../data/protocols';
import { PROTOCOL_PROFILES } from '../../data/protocols';
import type { AggregateResult, DerivedMetrics, SimulationParams } from '../../model/types';
import type { TokenMarketData } from '../../services/coingecko';
import type { DTSEApplicabilityEntry, DTSEFailureSignature, DTSEOutcome, DTSEProtocolInsight, DTSERecommendation, DTSERunContext, DTSEStressChannel } from '../../types/dtse';
import {
  buildDTSEProtocolPack,
  DTSE_METRIC_INSIGHTS,
  DTSE_PROTOCOL_PACKS,
  DTSE_REASON_LABELS,
  mergeSavedScenarioPackIntoDTSEPack,
} from '../../data/dtseContent';
import type { DTSESavedScenarioPack } from '../../data/dtseSavedScenarios';
import { loadDTSESavedScenarioPack } from '../../data/dtseSavedScenarioLoader';
import { DTSE_PEER_ANALOGS } from '../../data/dtsePeerAnalogs';
import { buildLiveDTSEOutputs, buildLiveDTSERunContext } from '../../utils/dtseLiveOutputs';
import { buildLiveDTSEFailureSignatures } from '../../utils/dtseLiveSignatures';
import { buildLiveDTSERecommendations } from '../../utils/dtseLiveRecommendations';
import { buildLiveDTSEApplicability } from '../../utils/dtseLiveApplicability';
import { DTSE_STRESS_CHANNEL_OPTIONS, inferDTSEStressChannel, resolveDTSEStressChannelSelection } from '../../utils/dtseStressChannel';
import { buildDTSESequenceView } from '../../utils/dtseSequenceView';
import { buildDTSEProtocolInsights } from '../../utils/dtseProtocolInsights';
import { buildDTSEStakeholderBriefMarkdown } from '../../utils/dtseExport';
import { buildDTSETrustSummary } from '../../utils/dtsePresentation';
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
  'Context',
  'What Can Be Scored',
  'What Broke First',
  'Failure Patterns',
  'Next Tests',
];
type DTSEViewMode = 'guided' | 'overview';

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
  loading?: boolean;
  exportRequestToken?: number;
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
  loading = false,
  exportRequestToken = 0,
}) => {
  const availableProfiles = profiles && profiles.length > 0 ? profiles : PROTOCOL_PROFILES;
  const dtseProfiles = useMemo(
    () => availableProfiles.filter((p) => p.metadata.id in DTSE_PROTOCOL_PACKS),
    [availableProfiles],
  );
  const fallbackProfile = (dtseProfiles[0] ?? availableProfiles[0] ?? PROTOCOL_PROFILES[0]) as ProtocolProfileV1;
  const [currentStage, setCurrentStage] = useState(0);
  const [viewMode, setViewMode] = useState<DTSEViewMode>('guided');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(false);
  const lastExportRequestToken = React.useRef(0);
  const [selectedProtocolId, setSelectedProtocolId] = useState(
    activeProfile?.metadata.id ?? fallbackProfile.metadata.id
  );

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference on initial load
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('dtse-theme');
      if (storedTheme) {
        return storedTheme === 'dark';
      }
      if (typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return true;
    }
    return true; // Default to dark for "cockpit" theme
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('dtse-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('dtse-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (activeProfile?.metadata.id && activeProfile.metadata.id in DTSE_PROTOCOL_PACKS) {
      setSelectedProtocolId(activeProfile.metadata.id);
    }
  }, [activeProfile?.metadata.id]);

  useEffect(() => {
    if (selectedProtocolId && !(selectedProtocolId in DTSE_PROTOCOL_PACKS)) {
      setSelectedProtocolId(fallbackProfile.metadata.id);
    }
  }, [selectedProtocolId, fallbackProfile.metadata.id]);

  const selectedProfile = useMemo(
    () => dtseProfiles.find((profile) => profile.metadata.id === selectedProtocolId) ?? fallbackProfile,
    [dtseProfiles, fallbackProfile, selectedProtocolId],
  );

  const requestedStressChannel = useMemo(
    () => (params
      ? inferDTSEStressChannel(params, selectedProfile)
      : resolveDTSEStressChannelSelection('baseline_neutral', selectedProfile).stressChannel),
    [params, selectedProfile],
  );
  const basePack = useMemo(
    () => buildDTSEProtocolPack(selectedProfile, requestedStressChannel),
    [requestedStressChannel, selectedProfile],
  );
  const [savedScenarioPack, setSavedScenarioPack] = useState<DTSESavedScenarioPack | null>(null);
  const [savedScenarioStatus, setSavedScenarioStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const isSelectedProtocolActive = activeProfile?.metadata.id === selectedProfile.metadata.id;
  const liveSelectionKey = useMemo(() => {
    if (!params || !isSelectedProtocolActive) return null;
    return JSON.stringify({
      protocolId: selectedProfile.metadata.id,
      stressChannelId: requestedStressChannel.id,
      scenario: params.scenario,
      macro: params.macro,
      demandType: params.demandType,
      providerCostPerWeek: params.providerCostPerWeek,
      competitorYield: params.competitorYield,
      investorSellPct: params.investorSellPct,
      initialProviders: params.initialProviders,
      maxMintWeekly: params.maxMintWeekly,
      burnPct: params.burnPct,
    });
  }, [isSelectedProtocolActive, params, requestedStressChannel.id, selectedProfile.metadata.id]);
  const [resolvedLiveSelectionKey, setResolvedLiveSelectionKey] = useState<string | null>(() => liveSelectionKey);
  const [resolvedLiveRunId, setResolvedLiveRunId] = useState<number>(simulationRunId);
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
  const canUseLiveOutputs = Boolean(!loading && params && isSelectedProtocolActive && liveAggregated.length > 0);
  useEffect(() => {
    if (!canUseLiveOutputs || !liveSelectionKey) return;
    if (simulationRunId === resolvedLiveRunId) return;
    setResolvedLiveSelectionKey(liveSelectionKey);
    setResolvedLiveRunId(simulationRunId);
  }, [canUseLiveOutputs, liveSelectionKey, resolvedLiveRunId, simulationRunId]);
  const hasRuntimeSelection = Boolean(params);
  const liveSelectionStale = Boolean(
    hasRuntimeSelection
    && isSelectedProtocolActive
    && liveSelectionKey
    && resolvedLiveSelectionKey
    && liveSelectionKey !== resolvedLiveSelectionKey,
  );
  const currentRunPending = hasRuntimeSelection && (loading || simulationRunId === 0 || liveSelectionStale);
  const selectedMarketData = liveData?.[selectedProfile.metadata.id] ?? null;
  useEffect(() => {
    let cancelled = false;

    if (currentRunPending) {
      setSavedScenarioStatus('idle');
      setSavedScenarioPack(null);
      return () => {
        cancelled = true;
      };
    }

    setSavedScenarioStatus('loading');
    setSavedScenarioPack(null);

    loadDTSESavedScenarioPack(selectedProfile.metadata.id, requestedStressChannel.id)
      .then((nextPack) => {
        if (cancelled) return;
        if (!nextPack) {
          setSavedScenarioStatus('error');
          return;
        }
        setSavedScenarioPack(nextPack);
        setSavedScenarioStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setSavedScenarioStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [currentRunPending, requestedStressChannel.id, selectedProfile.metadata.id]);
  const activeSavedScenarioPack = useMemo(() => {
    if (!savedScenarioPack) return null;
    if (savedScenarioPack.runContext.protocol_id !== selectedProfile.metadata.id) return null;
    if (savedScenarioPack.runContext.stress_channel?.id !== requestedStressChannel.id) return null;
    return savedScenarioPack;
  }, [requestedStressChannel.id, savedScenarioPack, selectedProfile.metadata.id]);
  const pack = useMemo(
    () => (activeSavedScenarioPack ? mergeSavedScenarioPackIntoDTSEPack(basePack, activeSavedScenarioPack) : basePack),
    [activeSavedScenarioPack, basePack],
  );
  const liveOutputs = useMemo(() => {
    if (!canUseLiveOutputs || !params) return null;
    return buildLiveDTSEOutputs(liveAggregated, params, derivedMetrics);
  }, [canUseLiveOutputs, derivedMetrics, liveAggregated, params]);
  const liveApplicability = useMemo(() => {
    if (!canUseLiveOutputs || !params) return null;
    return buildLiveDTSEApplicability(liveAggregated, params, derivedMetrics);
  }, [canUseLiveOutputs, derivedMetrics, liveAggregated, params]);
  const liveSequenceView = useMemo(() => {
    if (!canUseLiveOutputs || !params) return null;
    return buildDTSESequenceView(liveAggregated, liveBaselineAggregated, params);
  }, [canUseLiveOutputs, liveAggregated, liveBaselineAggregated, params]);
  const hasLiveSequenceTrigger = typeof liveSequenceView?.earliestTriggerWeek === 'number';
  const displayedSequenceView = useMemo(
    () => (hasLiveSequenceTrigger ? liveSequenceView : (pack.sequenceView ?? liveSequenceView ?? null)),
    [hasLiveSequenceTrigger, liveSequenceView, pack.sequenceView],
  );
  const displayedApplicability = useMemo(
    () => liveApplicability ?? pack.applicability,
    [liveApplicability, pack.applicability],
  );
  const displayedOutcomes = useMemo(
    () => (liveOutputs?.outcomes ?? pack.outcomes).filter((outcome) => outcome.metric_id !== 'stress_resilience_index'),
    [liveOutputs?.outcomes, pack.outcomes],
  );
  const displayedFailureSignatures = useMemo(() => {
    if (!canUseLiveOutputs || !params || !liveOutputs) {
      return pack.failureSignatures;
    }
    return buildLiveDTSEFailureSignatures(liveAggregated, params, displayedOutcomes, displayedSequenceView);
  }, [canUseLiveOutputs, displayedOutcomes, displayedSequenceView, liveAggregated, liveOutputs, pack.failureSignatures, params]);
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
  const selectedStressChannel = requestedStressChannel;
  const stressChannel = useMemo(
    () => (canUseLiveOutputs && params
      ? inferDTSEStressChannel(params, selectedProfile)
      : (pack.runContext.stress_channel ?? requestedStressChannel)),
    [canUseLiveOutputs, pack.runContext.stress_channel, params, requestedStressChannel, selectedProfile],
  );
  const displayedRecommendations = useMemo(() => {
    if (!canUseLiveOutputs || !liveOutputs) {
      return pack.recommendations;
    }
    return buildLiveDTSERecommendations(displayedFailureSignatures, displayedOutcomes, {
      protocolName: selectedProfile.metadata.name,
      peerNames: peerContext?.peerNames,
    });
  }, [canUseLiveOutputs, displayedFailureSignatures, displayedOutcomes, liveOutputs, pack.recommendations, peerContext?.peerNames, selectedProfile.metadata.name]);
  const displayedProtocolInsights = useMemo(() => (
    buildDTSEProtocolInsights({
      profile: selectedProfile,
      protocolBrief: pack.protocolBrief,
      outcomes: displayedOutcomes,
      failureSignatures: displayedFailureSignatures,
      sequenceView: displayedSequenceView,
      peerNames: peerContext?.peerNames,
    })
  ), [displayedFailureSignatures, displayedOutcomes, displayedSequenceView, pack.protocolBrief, peerContext?.peerNames, selectedProfile]);
  const ctx = useMemo(() => {
    if (!canUseLiveOutputs || !params || !liveOutputs) {
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
  }, [canUseLiveOutputs, displayedFailureSignatures, displayedOutcomes, displayedRecommendations, liveOutputs, pack, params, selectedProfile.metadata.id, simulationRunId, stressChannel, useNewModel]);
  const trustSummary = useMemo(() => buildDTSETrustSummary({
    hasLiveMarketContext: Boolean(selectedMarketData),
    hasCurrentRunOutputs: canUseLiveOutputs,
    evidenceStatus: ctx.evidence_status,
    applicability: displayedApplicability,
    metricLabels: METRIC_LABELS,
  }), [canUseLiveOutputs, ctx.evidence_status, displayedApplicability, selectedMarketData]);
  const fallbackEvidenceLoading = !canUseLiveOutputs && !currentRunPending && savedScenarioStatus === 'loading';
  const fallbackEvidenceUnavailable = !canUseLiveOutputs && !currentRunPending && savedScenarioStatus === 'error';
  const handleProtocolChange = useCallback((nextId: string) => {
    setSelectedProtocolId(nextId);
    setCurrentStage(0);
    const profile = dtseProfiles.find((candidate) => candidate.metadata.id === nextId);
    if (profile && onSelectProtocol) {
      onSelectProtocol(profile);
    }
  }, [dtseProfiles, onSelectProtocol]);

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

  const renderCurrentRunGuard = (stageIdx: number) => {
    const stageLabel = STAGE_LABELS[stageIdx];
    const isPending = currentRunPending;
    const isFallbackLoading = !isPending && fallbackEvidenceLoading;
    const isFallbackUnavailable = !isPending && fallbackEvidenceUnavailable;

    return (
      <div
        data-cy="dtse-current-run-guard"
        className="bg-white border-slate-200 dark:bg-slate-900/40 dark:border-white/5 dark:backdrop-blur-xl border rounded-[20px] p-1 shadow-sm dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-colors"
      >
        <div className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-xl p-5 transition-colors">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400 transition-colors">
            {isPending
              ? 'Current run updating'
              : isFallbackLoading
                ? 'Loading saved scenario pack'
                : isFallbackUnavailable
                  ? 'Saved scenario pack unavailable'
                  : 'Current run unavailable'}
          </p>
          <h3 className="mt-2 text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 transition-colors">
            {isPending
              ? `${stageLabel} depends on the selected run, not the saved pack.`
              : `${stageLabel} depends on resolved scenario evidence.`}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 transition-colors">
            {isPending
              ? 'DTSE is recomputing this protocol and stress selection now. Use Stage 1 for setup context, then rely on this stage once the current run finishes.'
              : isFallbackLoading
                ? 'DTSE is loading the saved scenario evidence for this protocol and stress selection. This stage stays withheld until that pack is ready.'
                : 'DTSE could not resolve the saved scenario evidence for this protocol and stress selection, so this stage is intentionally withheld instead of showing stale fallback conclusions.'}
          </p>
        </div>
      </div>
    );
  };

  const renderStageContent = (stageIdx: number, compact = false) => {
    if (stageIdx === 0) {
      return (
        <DTSEContextStage
          protocolBrief={pack.protocolBrief}
          marketData={selectedMarketData}
          peerContext={peerContext}
          stressChannel={ctx.stress_channel ?? selectedStressChannel}
          trustSummary={trustSummary}
          applicabilityCounts={!currentRunPending && !fallbackEvidenceLoading && !fallbackEvidenceUnavailable ? {
            scoredNow: displayedApplicability.filter((entry) => entry.verdict === 'R').length,
            heldOut: displayedApplicability.filter((entry) => entry.verdict === 'NR').length,
            total: displayedApplicability.length,
          } : undefined}
          showAdvanced={showAdvanced}
          modelVersion={ctx.model_version}
          generatedAt={ctx.generated_at_utc}
          horizonWeeks={ctx.horizon_weeks}
          nSims={ctx.n_sims}
          compact={compact}
        />
      );
    }

    if (currentRunPending || fallbackEvidenceLoading || fallbackEvidenceUnavailable) {
      return renderCurrentRunGuard(stageIdx);
    }

    if (stageIdx === 1) {
      return (
        <DTSEApplicabilityStage
          entries={displayedApplicability}
          metricLabels={METRIC_LABELS}
          metricInsights={DTSE_METRIC_INSIGHTS}
          reasonLabels={DTSE_REASON_LABELS}
          showAdvanced={showAdvanced}
          compact={compact}
        />
      );
    }

    if (stageIdx === 2) {
      return (
        <DTSEOutcomesStage
          isLoading={loading}
          hasStressSeries={liveAggregated.length > 0}
          hasBaselineSeries={liveBaselineAggregated.length > 0}
          outcomes={displayedOutcomes}
          weeklySolvency={ctx.weekly_solvency}
          trajectorySource={liveOutputs ? 'model' : 'frozen'}
          metricLabels={METRIC_LABELS}
          unitMap={UNIT_MAP}
            applicabilityEntries={displayedApplicability}
            metricInsights={DTSE_METRIC_INSIGHTS}
            thresholdConfigMap={METRIC_THRESHOLD_CONFIG}
            sequenceView={displayedSequenceView ?? undefined}
            stressChannel={ctx.stress_channel}
            showAdvanced={showAdvanced}
            compact={compact}
          />
      );
    }

    if (stageIdx === 3) {
      return (
        <DTSESignatureStage
          signatures={displayedFailureSignatures}
          metricLabels={METRIC_LABELS}
          showAdvanced={showAdvanced}
          compact={compact}
        />
      );
    }

    return (
      <DTSERecommendationsStage
        recommendations={displayedRecommendations}
        insights={displayedProtocolInsights}
        onExport={handleExport}
        showAdvanced={showAdvanced}
        exportFeedback={exportFeedback}
        compact={compact}
      />
    );
  };

  const handleExport = useCallback(() => {
    const exportHasResolvedEvidence = !currentRunPending && !fallbackEvidenceLoading && !fallbackEvidenceUnavailable;
    const exportRunContext = exportHasResolvedEvidence
      ? ctx
      : {
        ...ctx,
        evidence_status: 'missing' as const,
        stress_channel: ctx.stress_channel ?? selectedStressChannel,
      };
    const exportTrustSummary = exportHasResolvedEvidence
      ? trustSummary
      : {
        ...trustSummary,
        scoringConfidenceStatus: 'Limited' as const,
        fallbackReferenceValuesUsed: [
          ...trustSummary.fallbackReferenceValuesUsed,
          'Current run outputs were not ready at export time, so Stage 2–5 evidence was intentionally withheld.',
        ],
      };
    const payload = {
      runContext: exportRunContext,
      protocolBrief: pack.protocolBrief,
      applicability: exportHasResolvedEvidence ? displayedApplicability : [],
      outcomes: exportHasResolvedEvidence ? displayedOutcomes : [],
      failureSignatures: exportHasResolvedEvidence ? displayedFailureSignatures : [],
      recommendations: exportHasResolvedEvidence ? displayedRecommendations : [],
      protocolInsights: exportHasResolvedEvidence ? displayedProtocolInsights : [],
      dataSourceSummary: exportTrustSummary,
      exportedAt: new Date().toISOString(),
    };
    const dateKey = new Date().toISOString().slice(0, 10);
    const baseName = `dtse-export-${exportRunContext.run_id}-${dateKey}`;

    downloadTextFile(`${baseName}.json`, JSON.stringify(payload, null, 2), 'application/json');

    const stakeholderBrief = buildDTSEStakeholderBriefMarkdown(
      payload,
      METRIC_LABELS,
      DTSE_REASON_LABELS,
    );
    downloadTextFile(`${baseName}.md`, stakeholderBrief, 'text/markdown');

    setExportFeedback(true);
    window.setTimeout(() => setExportFeedback(false), 3000);
  }, [ctx, currentRunPending, displayedApplicability, displayedFailureSignatures, displayedOutcomes, displayedProtocolInsights, displayedRecommendations, fallbackEvidenceLoading, fallbackEvidenceUnavailable, pack.protocolBrief, selectedStressChannel, trustSummary]);

  useEffect(() => {
    if (exportRequestToken <= 0 || exportRequestToken === lastExportRequestToken.current) return;
    lastExportRequestToken.current = exportRequestToken;
    handleExport();
  }, [exportRequestToken, handleExport]);

  return (
    <div
      data-cy="dtse-dashboard-root"
      data-loading={loading ? 'true' : 'false'}
      data-simulation-run-id={simulationRunId}
      data-selected-protocol-id={selectedProfile.metadata.id}
      data-stress-channel-id={selectedStressChannel.id}
      className="dtse-shell-bg flex h-full flex-col overflow-hidden"
    >
      <div className="relative flex h-full flex-col">
        <header className="shrink-0 border-b border-slate-200 bg-white/60 dark:border-white/5 dark:bg-slate-900/60 backdrop-blur-md px-4 py-3 lg:px-6 z-10 transition-colors">
          <div className="dtse-content-width space-y-2.5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 transition-colors">Stage {currentStage + 1} · {STAGE_LABELS[currentStage]}</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">DTSE run setup and interpretation controls.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-900 p-1 shadow-inner transition-colors">
                  <button
                    data-cy="dtse-view-mode-guided"
                    onClick={() => setViewMode('guided')}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${viewMode === 'guided'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                      }`}
                  >
                    Guided
                  </button>
                  <button
                    data-cy="dtse-view-mode-overview"
                    onClick={handleSwitchToOverview}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${viewMode === 'overview'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                      }`}
                  >
                    Overview
                  </button>
                </div>
                
                <button
                  onClick={() => setIsDarkMode(prev => !prev)}
                  className="rounded-xl border p-2 text-slate-500 border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Toggle theme"
                  title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                <button
                  data-cy="dtse-toggle-advanced"
                  onClick={() => setShowAdvanced((current) => !current)}
                  className={`rounded-xl border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${showAdvanced
                    ? 'border-indigo-400/30 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                >
                  More {showAdvanced ? 'On' : 'Off'}
                </button>
              </div>
            </div>

            <div
              data-cy="dtse-intro-card"
              className="bg-white border-slate-200 dark:bg-slate-900/40 dark:border-white/5 dark:backdrop-blur-xl border rounded-2xl px-4 py-4 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-slate-800 dark:text-slate-100 transition-colors"
            >
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-300 transition-colors">Protocol</span>
                    <select
                      data-cy="dtse-protocol-select"
                      aria-label="Select protocol"
                      value={selectedProfile.metadata.id}
                      onChange={(event) => handleProtocolChange(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {dtseProfiles.map((profile) => (
                        <option key={profile.metadata.id} value={profile.metadata.id}>
                          {profile.metadata.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-300 transition-colors">Stress Channel</span>
                    <select
                      data-cy="dtse-stress-select"
                      aria-label="Select stress channel"
                      value={selectedStressChannel.id}
                      onChange={(event) => onSelectStressChannel?.(event.target.value as DTSEStressChannel['id'])}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {DTSE_STRESS_CHANNEL_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

              <div className="flex flex-wrap gap-1.5 xl:justify-end">
                  <span
                    data-cy="dtse-trust-chip-market"
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.02em] transition-colors ${trustSummary.marketContextStatus === 'Live'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                      }`}
                  >
                    Market context: {trustSummary.marketContextStatus}
                  </span>
                  <span
                    data-cy="dtse-trust-chip-model"
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.02em] transition-colors ${trustSummary.modelSourceStatus === 'Current run'
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-300'
                      : 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-600/50 dark:bg-slate-700/30 dark:text-slate-400'
                      }`}
                  >
                    Model source: {trustSummary.modelSourceStatus}
                  </span>
                  <span
                    data-cy="dtse-trust-chip-confidence"
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.02em] transition-colors ${trustSummary.scoringConfidenceStatus === 'Full'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : trustSummary.scoringConfidenceStatus === 'Partial'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                        : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                      }`}
                  >
                    Scoring confidence: {trustSummary.scoringConfidenceStatus}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/50 pt-3 transition-colors">
                DTSE compares the selected stress contract to a matched baseline to show what weakens first. Read Stage 1 for setup, Stage 3 for failure order, and Stage 5 for the next rerun.
              </p>
            </div>
          </div>
        </header>

        <div className="shrink-0 flex justify-center py-5">
          <div
            className="bg-white border-slate-200 dark:bg-slate-900/40 dark:border-white/5 dark:backdrop-blur-xl border rounded-full flex gap-1 p-1 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors"
            role={viewMode === 'guided' ? 'tablist' : undefined}
            aria-label="DTSE evaluation stages"
          >
            {STAGE_LABELS.map((label, idx) => (
              <button
                key={label}
                id={`dtse-stage-btn-${idx}`}
                role={viewMode === 'guided' ? 'tab' : undefined}
                tabIndex={viewMode === 'guided' ? (currentStage === idx ? 0 : -1) : 0}
                aria-selected={viewMode === 'guided' ? currentStage === idx : undefined}
                aria-controls={viewMode === 'guided' ? `dtse-stage-panel-${idx}` : undefined}
                aria-current={viewMode === 'overview' && currentStage === idx ? 'step' : undefined}
                data-cy={`dtse-stage-${idx + 1}`}
                onClick={() => activateStage(idx)}
                onKeyDown={(e) => handleStageKeyDown(e, idx)}
                className={`px-4 py-1.5 text-sm rounded-full transition-all duration-300 ${currentStage === idx
                  ? 'font-semibold text-white bg-indigo-600 shadow-[0_4px_15px_rgba(79,70,229,0.4)] border border-indigo-500/50 cursor-default'
                  : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 cursor-pointer'
                  }`}
              >
                {idx + 1} <span className="hidden sm:inline ml-1">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stage content */}
        <div id="dtse-stage-content" className="flex-1 overflow-y-auto custom-scrollbar bg-transparent px-4 py-3 lg:px-6" tabIndex={-1}>
          <div className="dtse-content-width">
            {viewMode === 'guided' ? (
              <div
                id={`dtse-stage-panel-${currentStage}`}
                role="tabpanel"
                aria-labelledby={`dtse-stage-btn-${currentStage}`}
                data-cy={`dtse-stage-panel-${currentStage + 1}`}
                className="dtse-stage-frame rounded-3xl p-3"
              >
                {renderStageContent(currentStage)}
              </div>
            ) : (
              <div data-cy="dtse-overview-root" className="space-y-4">
                {STAGE_LABELS.map((label, idx) => (
                  <section
                    key={label}
                    id={`dtse-overview-section-${idx}`}
                    data-cy={`dtse-stage-panel-${idx + 1}`}
                    className="dtse-stage-frame scroll-mt-4 rounded-3xl p-3"
                  >
                    {renderStageContent(idx, true)}
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation footer */}
        {viewMode === 'guided' ? (
          <div className="shrink-0 border-t border-slate-200 bg-white/60 dark:border-white/5 dark:bg-slate-900/60 backdrop-blur-xl px-4 py-3 lg:px-6 z-10 transition-colors">
            <div className="dtse-content-width flex items-center justify-between">
              <button
              data-cy="dtse-prev-stage"
              aria-label="Previous stage"
              onClick={goPrev}
              onKeyDown={(e) => handleFooterNavKeyDown(e, 'prev')}
              disabled={currentStage === 0}
              className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-lg text-xs font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 ${currentStage === 0
                  ? 'border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-600/50 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              <ChevronLeft size={14} />
              Previous
            </button>

              <button
              data-cy="dtse-next-stage"
              aria-label="Next stage"
              onClick={goNext}
              onKeyDown={(e) => handleFooterNavKeyDown(e, 'next')}
              disabled={currentStage === STAGE_COUNT - 1}
              className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-lg text-xs font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 ${currentStage === STAGE_COUNT - 1
                  ? 'border-transparent text-slate-600 cursor-not-allowed'
                  : 'border-indigo-500/50 bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
            >
              Next
              <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="shrink-0 border-t border-slate-200 bg-white/60 dark:border-white/5 dark:bg-slate-900/60 backdrop-blur-xl px-4 py-3 lg:px-6 z-10 transition-colors">
            <div className="dtse-content-width flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-[0.14em] transition-colors">All stages</span>
              <button
              data-cy="dtse-switch-guided-footer"
              aria-label="Switch to guided mode"
              onClick={() => setViewMode('guided')}
              className="px-3 py-2 min-h-[44px] rounded text-xs font-bold uppercase tracking-[0.12em] border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Back to Guided
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
