import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { ProtocolProfileV1 } from '../../data/protocols';
import { PROTOCOL_PROFILES } from '../../data/protocols';
import type { AggregateResult, DerivedMetrics, SimulationParams } from '../../model/types';
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
import { DTSEContextStage } from './DTSEContextStage';
import { DTSEApplicabilityStage } from './DTSEApplicabilityStage';
import { DTSEOutcomesStage, type DTSEThresholdConfig } from './DTSEOutcomesStage';
import { DTSESignatureStage } from './DTSESignatureStage';
import { DTSERecommendationsStage } from './DTSERecommendationsStage';
import {
  PAYBACK_GUARDRAILS,
  RETENTION_GUARDRAILS,
  RESILIENCE_GUARDRAILS,
  SOLVENCY_GUARDRAILS,
  TAIL_RISK_GUARDRAILS,
  UTILIZATION_GUARDRAILS,
} from '../../constants/guardrails';

const STAGE_COUNT = 5;

const STAGE_LABELS: string[] = [
  'Protocol Context',
  'Applicability',
  'Outcomes',
  'Failure Signature',
  'Recommendations',
];
type DTSEViewMode = 'guided' | 'overview';

const METRIC_LABELS: Record<string, string> = {
  solvency_ratio: 'Solvency Ratio',
  payback_period: 'Payback Period',
  weekly_retention_rate: 'Weekly Retention',
  network_utilization: 'Network Utilization',
  tail_risk_score: 'Tail Risk Score',
  vampire_churn: 'Vampire Churn',
  stress_resilience_index: 'Stress Resilience Index',
};

const UNIT_MAP: Record<string, string> = {
  solvency_ratio: 'x',
  payback_period: 'months',
  weekly_retention_rate: '%',
  network_utilization: '%',
  tail_risk_score: 'score',
  stress_resilience_index: 'score',
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
  stress_resilience_index: {
    healthyTarget: RESILIENCE_GUARDRAILS.healthyMinScore,
    direction: 'higher',
    label: `${RESILIENCE_GUARDRAILS.healthyMinScore}`,
  },
};

interface DTSEDashboardProps {
  activeProfile?: ProtocolProfileV1;
  profiles?: ProtocolProfileV1[];
  onSelectProtocol?: (profile: ProtocolProfileV1) => void;
  params?: SimulationParams;
  aggregated?: AggregateResult[];
  multiAggregated?: Record<string, AggregateResult[]>;
  derivedMetrics?: DerivedMetrics | null;
  simulationRunId?: number;
  useNewModel?: boolean;
}

export const DTSEDashboard: React.FC<DTSEDashboardProps> = ({
  activeProfile,
  profiles,
  onSelectProtocol,
  params,
  aggregated,
  multiAggregated,
  derivedMetrics,
  simulationRunId = 0,
  useNewModel = true,
}) => {
  const availableProfiles = profiles && profiles.length > 0 ? profiles : PROTOCOL_PROFILES;
  const fallbackProfile = (availableProfiles[0] ?? PROTOCOL_PROFILES[0]) as ProtocolProfileV1;
  const [currentStage, setCurrentStage] = useState(0);
  const [viewMode, setViewMode] = useState<DTSEViewMode>('guided');
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
  const liveOutputs = useMemo(() => {
    if (!params) return null;
    return buildLiveDTSEOutputs(liveAggregated, params, derivedMetrics);
  }, [derivedMetrics, liveAggregated, params]);
  const displayedApplicability = useMemo(() => {
    if (!params) {
      return pack.applicability;
    }
    return buildLiveDTSEApplicability(liveAggregated, params, derivedMetrics) ?? pack.applicability;
  }, [derivedMetrics, liveAggregated, pack.applicability, params]);
  const displayedOutcomes = liveOutputs?.outcomes ?? pack.outcomes;
  const displayedFailureSignatures = useMemo(() => {
    if (!params || !liveOutputs) {
      return pack.failureSignatures;
    }
    const liveSignatures = buildLiveDTSEFailureSignatures(liveAggregated, params, liveOutputs.outcomes);
    return liveSignatures.length > 0 ? liveSignatures : pack.failureSignatures;
  }, [liveAggregated, liveOutputs, pack.failureSignatures, params]);
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
  const displayedRecommendations = useMemo(() => {
    if (!liveOutputs) {
      return pack.recommendations;
    }
    return buildLiveDTSERecommendations(displayedFailureSignatures, liveOutputs.outcomes, {
      protocolName: selectedProfile.metadata.name,
      peerNames: peerContext?.peerNames,
    });
  }, [displayedFailureSignatures, liveOutputs, pack.recommendations, peerContext?.peerNames, selectedProfile.metadata.name]);
  const ctx = useMemo(() => {
    if (!params || !liveOutputs) {
      return pack.runContext;
    }
    return buildLiveDTSERunContext({
      profileId: selectedProfile.metadata.id,
      params,
      simulationRunId,
      modelVersion: useNewModel ? 'Agent-Based v2' : 'Legacy v1',
      outcomes: liveOutputs.outcomes,
      weeklySolvency: liveOutputs.weeklySolvency,
      fallbackScenarioGridId: pack.runContext.scenario_grid_id,
      failureSignatures: displayedFailureSignatures,
      recommendations: displayedRecommendations,
    });
  }, [displayedFailureSignatures, displayedRecommendations, liveOutputs, pack, params, selectedProfile.metadata.id, simulationRunId, useNewModel]);
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
          metricLabels={METRIC_LABELS}
          peerContext={peerContext}
          modelVersion={ctx.model_version}
          generatedAt={ctx.generated_at_utc}
          scenarioGridId={ctx.scenario_grid_id}
          horizonWeeks={ctx.horizon_weeks}
          nSims={ctx.n_sims}
          evidenceStatus={ctx.evidence_status}
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
        />
      );
    }

    if (stageIdx === 3) {
      return (
        <DTSESignatureStage
          signatures={displayedFailureSignatures}
          metricLabels={METRIC_LABELS}
        />
      );
    }

    return (
      <DTSERecommendationsStage
        recommendations={displayedRecommendations}
        onExport={handleExport}
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
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dtse-export-${ctx.run_id}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [ctx, displayedApplicability, displayedFailureSignatures, displayedOutcomes, displayedRecommendations, pack]);

  return (
    <div data-cy="dtse-dashboard-root" className="flex flex-col h-full">
      {/* Persistent run context strip */}
      <div className="shrink-0 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Protocol</span>
              <div className="mt-1">
                <select
                  data-cy="dtse-protocol-select"
                  value={selectedProfile.metadata.id}
                  onChange={(event) => handleProtocolChange(event.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-100 text-sm font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableProfiles.map((profile) => (
                    <option key={profile.metadata.id} value={profile.metadata.id}>
                      {profile.metadata.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Scenario Grid</span>
              <p className="text-sm font-bold text-slate-100 font-mono">{ctx.scenario_grid_id}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Horizon</span>
              <p className="text-sm font-bold text-slate-100">{ctx.horizon_weeks}w &middot; {ctx.n_sims} sims</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Evidence</span>
              <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                ctx.evidence_status === 'complete'
                  ? 'bg-emerald-900/60 text-emerald-400'
                  : ctx.evidence_status === 'partial'
                    ? 'bg-amber-900/60 text-amber-400'
                    : 'bg-red-900/60 text-red-400'
              }`}>
                {ctx.evidence_status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-900 p-1">
              <button
                data-cy="dtse-view-mode-guided"
                onClick={() => setViewMode('guided')}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${
                  viewMode === 'guided'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Guided
              </button>
              <button
                data-cy="dtse-view-mode-overview"
                onClick={handleSwitchToOverview}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${
                  viewMode === 'overview'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview
              </button>
            </div>
            <div className="text-[10px] text-slate-600 font-mono">
              {ctx.model_version} &middot; {ctx.run_id}
            </div>
          </div>
        </div>
      </div>

      {/* Stage indicator bar */}
      <div className="shrink-0 px-6 py-4 border-b border-slate-800/50">
        <div
          role={viewMode === 'guided' ? 'tablist' : undefined}
          aria-label="DTSE evaluation stages"
          className="flex items-center gap-1"
        >
          {STAGE_LABELS.map((label, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <div className={`h-px flex-1 max-w-[40px] transition-colors ${
                  idx <= currentStage ? 'bg-indigo-500' : 'bg-slate-800'
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  currentStage === idx
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : idx < currentStage
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-900 text-slate-500 hover:text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStage === idx
                    ? 'bg-white/20'
                    : idx < currentStage
                      ? 'bg-indigo-600/40 text-indigo-300'
                      : 'bg-slate-800 text-slate-600'
                }`}>
                  {idx + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
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
                className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-indigo-900/60 text-[10px] font-black text-indigo-300">
                    {idx + 1}
                  </span>
                  <h2 className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</h2>
                </div>
                {renderStageContent(idx)}
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Navigation footer */}
      {viewMode === 'guided' ? (
        <div className="shrink-0 border-t border-slate-800 bg-slate-950/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
          <button
            data-cy="dtse-prev-stage"
            onClick={goPrev}
            onKeyDown={(e) => handleFooterNavKeyDown(e, 'prev')}
            disabled={currentStage === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              currentStage === 0
                ? 'text-slate-700 cursor-not-allowed'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          <span className="text-[10px] text-slate-600 font-mono">
            Stage {currentStage + 1} of {STAGE_COUNT}
          </span>

          <button
            data-cy="dtse-next-stage"
            onClick={goNext}
            onKeyDown={(e) => handleFooterNavKeyDown(e, 'next')}
            disabled={currentStage === STAGE_COUNT - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              currentStage === STAGE_COUNT - 1
                ? 'text-slate-700 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      ) : (
        <div className="shrink-0 border-t border-slate-800 bg-slate-950/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-[0.14em]">Overview mode: all stages visible</span>
          <button
            data-cy="dtse-switch-guided-footer"
            onClick={() => setViewMode('guided')}
            className="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-[0.12em] bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Back to Guided
          </button>
        </div>
      )}
    </div>
  );
};
