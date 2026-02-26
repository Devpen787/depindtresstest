import React, { Suspense, lazy, useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Scale, BookOpen, Activity, RefreshCw, Settings2, Download, Search, GitCompare, LayoutGrid, Play, Zap, SlidersHorizontal
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai"; // Keep for future use?

// Components
import { MethodologyDrawer } from './src/components/MethodologyDrawer';
import { MethodologySheet } from './src/components/MethodologySheet';
import { HeaderDropdown, DropdownItem, DropdownToggle, DropdownDivider } from './src/components/ui/HeaderDropdown';
import { SimulatorSidebar } from './src/components/Simulator/SimulatorSidebar';

// Hooks & Utils
import { useSimulationRunner } from './src/hooks/useSimulationRunner';
import { calculateRegime } from './src/utils/regime';
import { fetchMultipleTokens, type TokenMarketData, ALL_DEPIN_TOKEN_IDS, getTimeUntilNextRefresh, autoRefreshManager } from './src/services/coingecko';
import { SolanaVerifier, type NetworkStatus } from './src/model/solana';
import { useProtocolMetrics } from './src/hooks/useProtocolMetrics'; // Import Hook
import { PROTOCOL_PROFILES } from './src/data/protocols';
import { PEER_GROUPS } from './src/data/peerGroups';
import { SCENARIOS } from './src/data/scenarios';
import { recordPerf } from './src/utils/perf';
import { DecisionBriefPayload, DecisionBriefSurface } from './src/types/decisionBrief';
import { buildDecisionBrief, downloadDecisionBrief, downloadDecisionBriefMarkdown } from './src/utils/decisionBrief';
import { getMetricEvidence, withExtractionTimestamp } from './src/data/metricEvidence';
import {
  OWNER_KPI_BAND_CLASSIFIERS,
  OWNER_KPI_THRESHOLD_COPY,
  calculateOwnerPaybackMonths,
  calculateOwnerRetentionPct,
  calculateOwnerSensitivityFromSpread,
  calculateOwnerSolvencyRatio,
  calculateOwnerTailRiskScore,
  calculateOwnerUtilitySnapshot,
  mergeGuardrailBands
} from './src/audit/kpiOwnerMath';
import DecisionBriefCard from './src/components/ui/DecisionBriefCard';

const ThesisDashboard = lazy(() => import('./src/components/ThesisDashboard').then((m) => ({ default: m.ThesisDashboard })));
const TokenomicsStudy = lazy(() => import('./src/components/CaseStudy/TokenomicsStudy').then((m) => ({ default: m.TokenomicsStudy })));
const ExplorerTab = lazy(() => import('./src/components/explorer/ExplorerTab').then((m) => ({ default: m.ExplorerTab })));
const Settings = lazy(() => import('./src/components/Settings').then((m) => ({ default: m.Settings })));
const AuditDashboard = lazy(() => import('./src/components/Diagnostic/AuditDashboard').then((m) => ({ default: m.AuditDashboard })));
const BenchmarkView = lazy(() => import('./src/components/Benchmark/BenchmarkView').then((m) => ({ default: m.BenchmarkView })));
const SandboxView = lazy(() => import('./src/components/Simulator/SandboxView').then((m) => ({ default: m.SandboxView })));
const ComparisonView = lazy(() => import('./src/components/Simulator/ComparisonView').then((m) => ({ default: m.ComparisonView })));
const DecisionTreeDashboard = lazy(() => import('./src/components/DecisionTree/DecisionTreeDashboard').then((m) => ({ default: m.DecisionTreeDashboard })));
const DTSEDashboard = lazy(() => import('./src/components/DTSE/DTSEDashboard').then((m) => ({ default: m.DTSEDashboard })));

type AppTab = 'simulator' | 'thesis' | 'case_study' | 'benchmark' | 'diagnostic' | 'decision_tree' | 'dtse';
type PrimaryTab = Exclude<AppTab, 'simulator'>;


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dtse');
  const profiles = PROTOCOL_PROFILES;
  const { metrics: onChainMetrics } = useProtocolMetrics(
    profiles.map(p => p.metadata.id)
  );

  // Use Custom Hook for Simulation Logic
  const sim = useSimulationRunner(onChainMetrics, {
    enablePeerWizardCalibration: activeTab === 'decision_tree'
  });

  // --- UI STATE ---
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>('baseline');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    stress: false, competitive: false, scenarios: true, tokenomics: true, advanced: true, providers: true, simulation: true,
  });

  // Modals & Panels
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [showAuditPanel, setShowAuditPanel] = useState(false);
  const [showKnowledgeLayer, setShowKnowledgeLayer] = useState(false);
  const [hasVisitedDiagnostic, setHasVisitedDiagnostic] = useState(false);
  const [hasVisitedThesis, setHasVisitedThesis] = useState(false);
  const priorPrimaryTabBeforeDecisionTree = useRef<AppTab>('benchmark');

  const primaryTabs: PrimaryTab[] = [
    'dtse',
    'benchmark',
    'diagnostic',
    'thesis',
    'decision_tree',
    'case_study'
  ];

  const primaryTabLabel: Record<AppTab, string> = {
    dtse: 'DTSE',
    benchmark: 'Benchmark',
    diagnostic: 'Root Causes',
    thesis: 'Strategy',
    case_study: 'Evidence',
    decision_tree: 'Decide',
    simulator: 'Advanced'
  };
  const secondaryTabLabel = {
    explorer: 'Browse',
    comparison: 'Compare',
    sandbox: 'Stress Lab'
  } as const;

  // Live Data State (Hoisted to App level for sharing)
  const [liveData, setLiveData] = useState<Record<string, TokenMarketData | null>>({});
  const [liveDataLoading, setLiveDataLoading] = useState(false);
  const [liveDataError, setLiveDataError] = useState<string | null>(null);
  const [lastLiveDataFetch, setLastLiveDataFetch] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<string>('');
  const [allDePINData, setAllDePINData] = useState<Record<string, TokenMarketData>>({});
  // REMOVED: onChainMetrics state (replaced by hook)
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const { useNewModel, setUseNewModel } = sim;
  const priorViewMode = useRef(sim.viewMode);
  const priorSelected = useRef(sim.selectedProtocolIds);
  const lastBenchmarkRunKey = useRef<string | null>(null);
  const tabSwitchStartedAt = useRef<number | null>(null);
  const diagnosticRunTimer = useRef<number | null>(null);

  // --- ACTIONS ---

  const setActiveTabTracked = (tab: AppTab) => {
    if (tab === 'decision_tree' && activeTab !== 'decision_tree') {
      priorPrimaryTabBeforeDecisionTree.current = activeTab;
    }
    if (tab === 'diagnostic') {
      setHasVisitedDiagnostic(true);
    }
    if (tab === 'thesis') {
      setHasVisitedThesis(true);
    }
    tabSwitchStartedAt.current = performance.now();
    setActiveTab(tab);
  };

  const scrollToControl = (sectionKey: string) => {
    const parentMap: Record<string, string> = { 'providers': 'advanced', 'simulation': 'advanced' };
    setCollapsedSections(prev => {
      const next = { ...prev, [sectionKey]: false };
      if (parentMap[sectionKey]) next[parentMap[sectionKey]] = false;
      return next;
    });
    setTimeout(() => {
      const element = document.getElementById(`section-${sectionKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-indigo-500', 'bg-slate-900');
        setTimeout(() => element.classList.remove('ring-2', 'ring-indigo-500', 'bg-slate-900'), 1000);
      }
    }, 200);
  };

  const renderPanelFallback = (label: string) => (
    <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-500 text-sm font-semibold uppercase tracking-wider">
      Loading {label}...
    </div>
  );

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const fetchLiveData = async () => {
    setLiveDataLoading(true);
    setLiveDataError(null);
    try {
      const data = await fetchMultipleTokens(ALL_DEPIN_TOKEN_IDS);
      setAllDePINData(data);
      const mappedData: Record<string, TokenMarketData | null> = {};
      for (const profile of PROTOCOL_PROFILES) {
        const coingeckoId = profile.metadata.coingeckoId;
        if (coingeckoId && data[coingeckoId]) mappedData[profile.metadata.id] = data[coingeckoId];
      }
      setLiveData(mappedData);
      setLastLiveDataFetch(new Date());
    } catch (error) {
      setLiveDataError('Failed to fetch live data.');
      console.error(error);
    } finally {
      setLiveDataLoading(false);
    }
  };

  // --- EFFECTS ---

  useEffect(() => {
    // Initial Loads (Network Status)
    SolanaVerifier.getNetworkStatus().then(setNetworkStatus);

    // Auto-refresh logic (CoinGecko)
    if (autoRefreshEnabled) {
      autoRefreshManager.start(fetchLiveData, 5 * 60 * 1000);
    } else {
      autoRefreshManager.stop();
    }
    return () => autoRefreshManager.stop();
  }, [autoRefreshEnabled]);

  useEffect(() => {
    if (activeTab === 'benchmark') {
      if (sim.viewMode !== 'benchmark') {
        priorViewMode.current = sim.viewMode;
        priorSelected.current = sim.selectedProtocolIds;
      }

      const benchmarkGroup = PEER_GROUPS[0];
      sim.setViewMode('benchmark');
      if (benchmarkGroup) {
        sim.setSelectedProtocolIds(benchmarkGroup.members);
      }
      const benchmarkMembers = benchmarkGroup?.members ?? [];
      const hasBenchmarkResults = benchmarkMembers.length > 0
        && benchmarkMembers.every((id) => (sim.multiAggregated[id] || []).length > 0);
      const benchmarkRunKey = JSON.stringify({
        params: sim.params,
        useNewModel: sim.useNewModel,
        benchmarkMembers
      });
      if (!hasBenchmarkResults || lastBenchmarkRunKey.current !== benchmarkRunKey) {
        lastBenchmarkRunKey.current = benchmarkRunKey;
        sim.runSimulation();
      }
      return;
    }

    if (activeTab === 'simulator' && sim.viewMode === 'benchmark') {
      sim.setViewMode(priorViewMode.current || 'sandbox');
      if (priorSelected.current?.length) {
        sim.setSelectedProtocolIds(priorSelected.current);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const startedAt = tabSwitchStartedAt.current;
    if (startedAt === null) return;
    tabSwitchStartedAt.current = null;
    requestAnimationFrame(() => {
      recordPerf('tab-switch', performance.now() - startedAt, {
        activeTab,
        viewMode: sim.viewMode
      });
    });
  }, [activeTab, sim.viewMode]);

  useEffect(() => {
    return () => {
      if (diagnosticRunTimer.current !== null) {
        window.clearTimeout(diagnosticRunTimer.current);
      }
    };
  }, []);

  const incentiveRegime = React.useMemo(() => calculateRegime(sim.aggregated, sim.activeProfile), [sim.aggregated, sim.activeProfile]);

  const handlePrimaryTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, tab: AppTab) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveTabTracked(tab);
      return;
    }

    const currentIndex = primaryTabs.indexOf(tab);
    if (currentIndex < 0) return;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % primaryTabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + primaryTabs.length) % primaryTabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = primaryTabs.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const nextTab = primaryTabs[nextIndex];
      setActiveTabTracked(nextTab);
      window.requestAnimationFrame(() => {
        document.getElementById(`tab-${nextTab}`)?.focus();
      });
    }
  };

  const simulatorViews: Array<'explorer' | 'comparison' | 'sandbox'> = ['explorer', 'comparison', 'sandbox'];
  const handleAdvancedTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    viewMode: 'explorer' | 'comparison' | 'sandbox'
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      sim.setViewMode(viewMode);
      return;
    }

    const currentIndex = simulatorViews.indexOf(viewMode);
    if (currentIndex < 0) return;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % simulatorViews.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + simulatorViews.length) % simulatorViews.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = simulatorViews.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const nextView = simulatorViews[nextIndex];
      sim.setViewMode(nextView);
      window.requestAnimationFrame(() => {
        document.getElementById(`tab-sim-view-${nextView}`)?.focus();
      });
    }
  };

  const applyGlobalScenario = useCallback((
    scenarioParams?: Partial<Record<string, unknown>>,
    scenarioId?: string | null
  ) => {
    const startedAt = performance.now();
    const resolvedScenarioId = scenarioId ?? (scenarioParams ? 'custom' : activeScenarioId ?? 'baseline');
    setActiveScenarioId(resolvedScenarioId);

    if (scenarioParams) {
      sim.setParams((prev) => ({ ...prev, ...(scenarioParams as any) }));
      requestAnimationFrame(() => {
        recordPerf('scenario-update', performance.now() - startedAt, {
          scenarioId: resolvedScenarioId ?? 'custom',
          source: 'scenario-manager',
          activeTab
        });
      });
      return;
    }

    const selectedScenario = SCENARIOS.find((scenario) => scenario.id === resolvedScenarioId);
    if (!selectedScenario) {
      return;
    }

    sim.setParams((prev) => ({ ...prev, ...(selectedScenario.params as any) }));
    requestAnimationFrame(() => {
      recordPerf('scenario-update', performance.now() - startedAt, {
        scenarioId: resolvedScenarioId,
        source: 'global-select',
        activeTab
      });
    });
  }, [activeScenarioId, activeTab, sim.setParams]);

  const briefInputs = React.useMemo(() => {
    const scenarioLabel = activeScenarioId
      ? SCENARIOS.find((scenario) => scenario.id === activeScenarioId)?.name
        ?? activeScenarioId.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
      : 'Default Scenario';

    const latestPoint = sim.aggregated.length > 0 ? sim.aggregated[sim.aggregated.length - 1] : null;
    const latestSolvency = calculateOwnerSolvencyRatio(latestPoint);
    const retentionPct = calculateOwnerRetentionPct(sim.derivedMetrics?.retentionRate, latestPoint);
    const utilitySnapshot = calculateOwnerUtilitySnapshot(latestPoint);
    const tailRiskScore = calculateOwnerTailRiskScore(sim.aggregated as any);
    const sensitivityMaxAbsDelta = calculateOwnerSensitivityFromSpread(latestPoint as any);
    const sensitivityBand = OWNER_KPI_BAND_CLASSIFIERS.sensitivity(sensitivityMaxAbsDelta);
    const activeProvidersForPayback = Math.max(
      1,
      latestPoint?.providers?.mean ?? sim.params.initialProviders
    );
    const annualizedRevenue = ((sim.derivedMetrics?.totalProviderRevenue ?? 0) / Math.max(1, sim.params.T)) * 52;
    const estimatedPaybackMonths = calculateOwnerPaybackMonths({
      hardwareCost: sim.params.hardwareCost,
      annualizedRevenue,
      activeNodes: activeProvidersForPayback
    });
    const paybackBand = OWNER_KPI_BAND_CLASSIFIERS.payback(estimatedPaybackMonths);
    const solvencyBand = OWNER_KPI_BAND_CLASSIFIERS.solvency(latestSolvency);
    const retentionBand = OWNER_KPI_BAND_CLASSIFIERS.retention(retentionPct);
    const utilityBand = OWNER_KPI_BAND_CLASSIFIERS.utility(utilitySnapshot.utilityHealthScore);
    const tailRiskBand = OWNER_KPI_BAND_CLASSIFIERS.tailRisk(tailRiskScore);
    const benchmarkBand = mergeGuardrailBands([paybackBand, retentionBand]);
    const diagnosticsBand = mergeGuardrailBands([solvencyBand, sensitivityBand, tailRiskBand]);
    const strategyBand = mergeGuardrailBands([paybackBand, solvencyBand, retentionBand, utilityBand, tailRiskBand, sensitivityBand]);

    return {
      scenarioLabel,
      latestSolvency,
      retentionPct,
      estimatedPaybackMonths,
      benchmarkBand,
      diagnosticsBand,
      strategyBand
    };
  }, [
    activeScenarioId,
    sim.aggregated,
    sim.derivedMetrics?.retentionRate,
    sim.derivedMetrics?.totalProviderRevenue,
    sim.params.initialProviders,
    sim.params.T,
    sim.params.hardwareCost
  ]);

  const buildBriefForSurface = React.useCallback((
    surface: DecisionBriefSurface,
    summary: string,
    guardrailBand: 'healthy' | 'watchlist' | 'intervention',
    evidenceMetricIds: string[]
  ): DecisionBriefPayload => buildDecisionBrief({
    context: {
      surface,
      protocolName: sim.activeProfile.metadata.name,
      protocolId: sim.activeProfile.metadata.id,
      scenarioName: briefInputs.scenarioLabel,
      scenarioId: activeScenarioId,
      modelVersion: useNewModel ? 'Agent-Based v2' : 'Legacy v1'
    },
    verdict: guardrailBand === 'healthy' ? 'go' : guardrailBand === 'watchlist' ? 'hold' : 'no_go',
    guardrailBand,
    summary,
    drivers: [
      {
        label: 'Solvency floor',
        value: `${Math.max(0, briefInputs.latestSolvency * 100).toFixed(1)}%`,
        threshold: OWNER_KPI_THRESHOLD_COPY.solvency,
        metricId: 'solvency_ratio'
      },
      {
        label: 'Expected payback',
        value: `${briefInputs.estimatedPaybackMonths.toFixed(1)} months`,
        threshold: OWNER_KPI_THRESHOLD_COPY.payback,
        metricId: 'payback_period'
      },
      {
        label: 'Retention pressure',
        value: `${briefInputs.retentionPct.toFixed(1)}%`,
        threshold: OWNER_KPI_THRESHOLD_COPY.retention,
        metricId: 'weekly_retention_rate'
      }
    ],
    actions: [
      {
        action: 'Confirm scenario assumptions before sharing externally.',
        ownerRole: 'Analyst',
        trigger: 'Any model rerun or scenario change',
        expectedEffect: 'Keeps exports reproducible and comparable.'
      },
      {
        action: 'Document one concrete next step with owner and timeline.',
        ownerRole: 'Protocol team',
        trigger: 'Decision brief generated',
        expectedEffect: 'Turns dashboard output into an actionable review artifact.'
      }
    ],
    evidence: evidenceMetricIds.map((metricId) => withExtractionTimestamp(getMetricEvidence(metricId))),
    asOfUtc: lastLiveDataFetch,
    reproducibility: {
      runId: sim.simulationRunId,
      runTimestampUtc: new Date().toISOString(),
      paramsSnapshot: { ...sim.params, selectedProtocolIds: sim.selectedProtocolIds, viewMode: sim.viewMode }
    }
  }), [
    sim.activeProfile.metadata.name,
    sim.activeProfile.metadata.id,
    briefInputs.scenarioLabel,
    briefInputs.latestSolvency,
    briefInputs.estimatedPaybackMonths,
    briefInputs.retentionPct,
    activeScenarioId,
    useNewModel,
    lastLiveDataFetch,
    sim.simulationRunId,
    sim.params,
    sim.selectedProtocolIds,
    sim.viewMode
  ]);

  const briefsBySurface: Record<DecisionBriefSurface, DecisionBriefPayload> = React.useMemo(() => ({
    benchmark: buildBriefForSurface(
      'benchmark',
      'Benchmark compares Onocoy against selected peers under one shared scenario to expose relative strengths and gaps.',
      briefInputs.benchmarkBand,
      ['benchmark_payback', 'benchmark_efficiency', 'benchmark_sustain', 'benchmark_retention']
    ),
    diagnostics: buildBriefForSurface(
      'diagnostics',
      'Root-cause diagnostics highlight which structural parameters are currently pushing solvency and retention toward failure.',
      briefInputs.diagnosticsBand,
      ['diagnostic_underwater_count', 'diagnostic_cost_vs_revenue', 'diagnostic_join_flow', 'solvency_ratio']
    ),
    strategy: buildBriefForSurface(
      'strategy',
      'Strategy translates stress outcomes into a clear action plan with explicit tradeoffs before any external decision call.',
      briefInputs.strategyBand,
      ['payback_period', 'weekly_retention_rate', 'solvency_ratio', 'network_utilization', 'diagnostic_join_flow', 'vampire_churn']
    )
  }), [
    buildBriefForSurface,
    briefInputs.benchmarkBand,
    briefInputs.diagnosticsBand,
    briefInputs.strategyBand
  ]);

  const activeBriefSurface: DecisionBriefSurface | null = activeTab === 'benchmark'
    ? 'benchmark'
    : activeTab === 'diagnostic'
      ? 'diagnostics'
      : activeTab === 'thesis'
        ? 'strategy'
        : null;

  const activeBrief = React.useMemo(
    () => (activeBriefSurface ? briefsBySurface[activeBriefSurface] : null),
    [activeBriefSurface, briefsBySurface]
  );

  const handleDiagnosticProtocolChange = useCallback((id: string) => {
    const profile = PROTOCOL_PROFILES.find((p) => p.metadata.id === id);
    if (profile) {
      sim.loadProfile(profile);
    }
  }, [sim.loadProfile]);

  const handleDiagnosticParamChange = useCallback((updates: Partial<Record<string, unknown>>) => {
    sim.setParams((prev) => ({ ...prev, ...updates as any }));
    if (!sim.autoRun) {
      return;
    }
    if (diagnosticRunTimer.current !== null) {
      window.clearTimeout(diagnosticRunTimer.current);
    }
    diagnosticRunTimer.current = window.setTimeout(() => {
      sim.runSimulation();
    }, 250);
  }, [sim.setParams, sim.autoRun, sim.runSimulation]);

  const handleDiagnosticRunSensitivity = useCallback(() => sim.runSensitivityAnalysis(), [sim.runSensitivityAnalysis]);
  const handleThesisScenarioSelect = useCallback((scenarioId: string) => {
    applyGlobalScenario(undefined, scenarioId);
  }, [applyGlobalScenario]);

  const exportDisabled = !activeBrief;
  const handleExport = () => {
    if (!activeBriefSurface || !activeBrief) return;
    const dateKey = new Date().toISOString().slice(0, 10);
    downloadDecisionBrief(activeBrief, `decision-brief-${activeBriefSurface}-${dateKey}.json`, { showToast: false });
    downloadDecisionBriefMarkdown(activeBrief, `decision-brief-${activeBriefSurface}-${dateKey}.md`);
  };

  const exitDecisionTree = () => {
    const target = priorPrimaryTabBeforeDecisionTree.current;
    if (target === 'decision_tree' || target === 'simulator') {
      setActiveTabTracked('benchmark');
      return;
    }
    setActiveTabTracked(target);
  };

  return (
    <div
      data-cy="dashboard-root"
      className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden"
    >
      {/* HEADER */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-xl shrink-0 z-[100]">
        <div
          data-cy="global-context-state"
          data-protocol-id={sim.activeProfile.metadata.id}
          data-scenario-id={activeScenarioId ?? 'baseline'}
          className="hidden"
        />
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 border border-indigo-400/20">
              <Scale className="text-white" size={20} />
            </div>
            <div>
              <h1 data-cy="app-title" className="text-md font-extrabold tracking-tight">DePIN Stress Test</h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">CAS Decision Architecture</p>
            </div>
          </div>

          <div role="tablist" aria-label="Primary dashboard sections" className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
            {primaryTabs.map((tab, idx) => (
              <React.Fragment key={tab}>
                {tab === 'benchmark' && (
                  <div className="w-px h-5 bg-slate-700/60 mx-0.5" aria-hidden="true" />
                )}
                <button
                  onClick={() => setActiveTabTracked(tab)}
                  onKeyDown={(event) => handlePrimaryTabKeyDown(event, tab)}
                  data-cy={`tab-${tab}`}
                  id={`tab-${tab}`}
                  role="tab"
                  tabIndex={activeTab === tab ? 0 : -1}
                  aria-selected={activeTab === tab}
                  aria-controls={`panel-${tab}`}
                  aria-pressed={activeTab === tab}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                    ? tab === 'dtse' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' :
                      tab === 'benchmark' ? 'bg-indigo-600 text-white shadow-lg' :
                        tab === 'decision_tree' ? 'bg-indigo-600 text-white shadow-lg' :
                          tab === 'thesis' ? 'bg-emerald-600 text-white shadow-lg' :
                            tab === 'diagnostic' ? 'bg-rose-600 text-white shadow-lg' : 'bg-orange-500 text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  {primaryTabLabel[tab]}
                </button>
              </React.Fragment>
            ))}
          </div>

          {activeTab === 'simulator' && (
            <nav role="tablist" aria-label="Advanced workspace views" className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => { setActiveTabTracked('simulator'); sim.setViewMode('explorer'); }}
                onKeyDown={(event) => handleAdvancedTabKeyDown(event, 'explorer')}
                data-cy="sim-view-explorer"
                id="tab-sim-view-explorer"
                role="tab"
                tabIndex={activeTab === 'simulator' && sim.viewMode === 'explorer' ? 0 : -1}
                aria-selected={activeTab === 'simulator' && sim.viewMode === 'explorer'}
                aria-controls="panel-sim-view-explorer"
                aria-pressed={activeTab === 'simulator' && sim.viewMode === 'explorer'}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'simulator' && sim.viewMode === 'explorer' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Search size={14} /> {secondaryTabLabel.explorer}
              </button>
              <button
                onClick={() => {
                  setActiveTabTracked('simulator');
                  sim.setViewMode('comparison');
                }}
                onKeyDown={(event) => handleAdvancedTabKeyDown(event, 'comparison')}
                data-cy="sim-view-comparison"
                id="tab-sim-view-comparison"
                role="tab"
                tabIndex={activeTab === 'simulator' && sim.viewMode === 'comparison' ? 0 : -1}
                aria-selected={activeTab === 'simulator' && sim.viewMode === 'comparison'}
                aria-controls="panel-sim-view-comparison"
                aria-pressed={activeTab === 'simulator' && sim.viewMode === 'comparison'}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'simulator' && sim.viewMode === 'comparison' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <GitCompare size={14} /> {secondaryTabLabel.comparison}
              </button>
              <button
                onClick={() => { setActiveTabTracked('simulator'); sim.setViewMode('sandbox'); }}
                onKeyDown={(event) => handleAdvancedTabKeyDown(event, 'sandbox')}
                data-cy="sim-view-sandbox"
                id="tab-sim-view-sandbox"
                role="tab"
                tabIndex={activeTab === 'simulator' && sim.viewMode === 'sandbox' ? 0 : -1}
                aria-selected={activeTab === 'simulator' && sim.viewMode === 'sandbox'}
                aria-controls="panel-sim-view-sandbox"
                aria-pressed={activeTab === 'simulator' && sim.viewMode === 'sandbox'}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'simulator' && sim.viewMode === 'sandbox' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutGrid size={14} /> {secondaryTabLabel.sandbox}
              </button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <HeaderDropdown dataCy="header-learn" label="Learn" icon={<BookOpen size={14} />} isActive={isMethodologyOpen || showSpecModal || showAuditPanel}>
            <DropdownItem icon={<BookOpen size={14} />} onClick={() => setIsMethodologyOpen(true)} description="Simulation methodology & assumptions">Methodology</DropdownItem>
            <DropdownItem icon={<Zap size={14} />} onClick={() => setIsMethodologyOpen(true)} description="Mathematical formulas & equations">Math Specification</DropdownItem>
            <DropdownItem icon={<Scale size={14} />} onClick={() => setShowAuditPanel(true)} description="Wiki documentation & tutorials">System Wiki</DropdownItem>
          </HeaderDropdown>

          <HeaderDropdown dataCy="header-data" label="Data" icon={<Activity size={14} />} isActive={Object.keys(liveData).length > 0}>
            <DropdownItem icon={liveDataLoading ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />} onClick={fetchLiveData} disabled={liveDataLoading} description={lastLiveDataFetch ? `Last: ${lastLiveDataFetch.toLocaleTimeString()}` : 'Pull from CoinGecko'}>
              {liveDataLoading ? 'Fetching...' : Object.keys(liveData).length > 0 ? 'Refresh Live Data ✓' : 'Fetch Live Data'}
            </DropdownItem>
            <DropdownToggle icon={<RefreshCw size={14} />} checked={autoRefreshEnabled} onChange={() => setAutoRefreshEnabled(!autoRefreshEnabled)} description="Auto-refresh every 5 minutes">Auto Refresh</DropdownToggle>
            <DropdownDivider />
            <DropdownToggle icon={<Zap size={14} />} checked={useNewModel} onChange={() => setUseNewModel(!useNewModel)} description={useNewModel ? 'V2: With sell pressure model' : 'V1: Legacy model'}>Use V2 Model</DropdownToggle>
          </HeaderDropdown>

          <HeaderDropdown dataCy="header-actions" label="Actions" icon={<SlidersHorizontal size={14} />} isActive={activeTab === 'simulator' || activeTab === 'case_study'}>
            {activeTab === 'case_study' && (
              <DropdownItem
                dataCy="open-advanced-workspace"
                icon={<LayoutGrid size={14} />}
                onClick={() => { setActiveTabTracked('simulator'); sim.setViewMode('sandbox'); }}
                description="Open sandbox controls and stress scenarios"
              >
                Open Stress Lab
              </DropdownItem>
            )}
            {activeTab === 'simulator' && (
              <>
                <DropdownItem
                  dataCy="sim-view-return-appendix"
                  icon={<BookOpen size={14} />}
                  onClick={() => setActiveTabTracked('case_study')}
                  description="Return to case-study narrative"
                >
                  Back to Evidence
                </DropdownItem>
                <DropdownItem
                  dataCy="open-settings"
                  icon={<Settings2 size={14} />}
                  onClick={() => { setActiveTabTracked('simulator'); sim.setViewMode('settings'); }}
                  description="Open advanced simulation settings"
                >
                  Open Settings
                </DropdownItem>
                {sim.viewMode === 'sandbox' && (
                  <DropdownToggle
                    dataCy="toggle-auto-apply"
                    icon={<Zap size={14} />}
                    checked={sim.autoRun}
                    onChange={() => sim.setAutoRun(!sim.autoRun)}
                    description="Automatically rerun on control changes"
                  >
                    Auto Apply
                  </DropdownToggle>
                )}
              </>
            )}
            <DropdownDivider />
            <DropdownItem
              dataCy="toggle-export"
              icon={<Download size={14} />}
              onClick={handleExport}
              disabled={exportDisabled}
              description={exportDisabled ? 'Available on Benchmark, Root Causes, and Strategy' : 'Download decision brief (.json + .md)'}
            >
              Export Brief
            </DropdownItem>
          </HeaderDropdown>

          {activeTab === 'simulator' && sim.viewMode === 'sandbox' && (
            <button
              onClick={sim.runSimulation}
              data-cy="run-matrix"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95"
            >
              {sim.loading ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />} Run Matrix
            </button>
          )}
        </div>
      </header>



      {/* MAIN CONTENT AREA */}
      {activeTab === 'dtse' ? (
        <div id="panel-dtse" role="tabpanel" aria-labelledby="tab-dtse" className="flex-1 overflow-hidden bg-slate-950">
          <Suspense fallback={renderPanelFallback('DTSE')}>
            <DTSEDashboard
              activeProfile={sim.activeProfile}
              profiles={PROTOCOL_PROFILES}
              onSelectProtocol={sim.loadProfile}
            />
          </Suspense>
        </div>
      ) : activeTab === 'benchmark' ? (
        <div id="panel-benchmark" role="tabpanel" aria-labelledby="tab-benchmark" className="flex-1 overflow-y-auto bg-slate-950 p-6 custom-scrollbar">
          <div className="mb-6 space-y-3">
            <DecisionBriefCard brief={briefsBySurface.benchmark} dataCy="benchmark-decision-brief" />
            <p className="text-xs text-slate-400">
              Next step: open <strong className="text-slate-200">Root Causes</strong> to confirm which parameter is driving the gap before sharing externally.
            </p>
          </div>
          <Suspense fallback={renderPanelFallback('benchmark')}>
            <BenchmarkView
              params={sim.params}
              setParams={sim.setParams}
              multiAggregated={sim.multiAggregated}
              profiles={PROTOCOL_PROFILES}
              liveData={liveData}
              onChainData={onChainMetrics}
              engineLabel={useNewModel ? 'Agent-Based v2' : 'Legacy v1.2'}
              lastLiveDataFetch={lastLiveDataFetch}
              loading={sim.loading}
              activeScenarioId={activeScenarioId}
              onScenarioLoad={(scenarioParams, scenarioId) => applyGlobalScenario(scenarioParams, scenarioId)}
            />
          </Suspense>
        </div>
      ) : activeTab === 'case_study' ? (
        <div id="panel-case_study" role="tabpanel" aria-labelledby="tab-case_study" className="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar">
          <Suspense fallback={renderPanelFallback('evidence')}>
            <TokenomicsStudy />
          </Suspense>
        </div>
      ) : activeTab === 'thesis' ? null : activeTab === 'diagnostic' ? null : activeTab === 'decision_tree' ? (
        <div id="panel-decision_tree" role="tabpanel" aria-labelledby="tab-decision_tree" className="flex-1 overflow-hidden bg-slate-950">
          <Suspense fallback={renderPanelFallback('decision flow')}>
            <DecisionTreeDashboard
              sim={sim}
              onBackToLegacy={exitDecisionTree}
            />
          </Suspense>
        </div>
      ) : activeTab === 'simulator' ? (
        <div className="flex flex-1 overflow-hidden bg-slate-950">
          {sim.viewMode === 'settings' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar" id="panel-sim-view-settings" role="tabpanel" aria-labelledby="open-settings">
              <Suspense fallback={renderPanelFallback('settings')}>
                <Settings onBack={() => sim.setViewMode('sandbox')} onReset={sim.resetToDefaults} />
              </Suspense>
            </div>
          ) : sim.viewMode === 'explorer' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar" id="panel-sim-view-explorer" role="tabpanel" aria-labelledby="tab-sim-view-explorer">
              <Suspense fallback={renderPanelFallback('browser')}>
                <ExplorerTab
                  profiles={PROTOCOL_PROFILES}
                  networkStatus={networkStatus}
                  onAnalyze={(id) => {
                    const profile = PROTOCOL_PROFILES.find(p => p.metadata.id === id || p.metadata.coingeckoId === id);
                    if (profile) { sim.loadProfile(profile); sim.setViewMode('sandbox'); }
                  }}
                  onCompare={(id) => {
                    const profile = PROTOCOL_PROFILES.find(p => p.metadata.id === id || p.metadata.coingeckoId === id);
                    if (profile) {
                      sim.toggleProtocolSelection(profile.metadata.id);
                      sim.setViewMode('comparison');
                    }
                  }}
                />
              </Suspense>
            </div>
          ) : (
            <>
              {/* SHARED SIDEBAR */}
              <SimulatorSidebar
                viewMode={sim.viewMode as any}
                activeProfile={sim.activeProfile}
                selectedProtocolIds={sim.selectedProtocolIds}
                loadProfile={sim.loadProfile}
                toggleProtocolSelection={sim.toggleProtocolSelection}
                params={sim.params}
                setParams={sim.setParams}
                incentiveRegime={incentiveRegime}
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
                activeScenarioId={activeScenarioId}
                setActiveScenarioId={(scenarioId) => applyGlobalScenario(undefined, scenarioId)}
                setFocusChart={sim.setFocusChart}
                setShowKnowledgeLayer={setShowKnowledgeLayer}
                findBreakEven={sim.findBreakEven}
                runOptimization={sim.runOptimization}
              />

              <main className="flex-1 overflow-y-auto p-6 custom-scrollbar relative" id={sim.viewMode === 'sandbox' ? 'panel-sim-view-sandbox' : 'panel-sim-view-comparison'} role="tabpanel" aria-labelledby={sim.viewMode === 'sandbox' ? 'tab-sim-view-sandbox' : 'tab-sim-view-comparison'}>
                {sim.viewMode === 'sandbox' ? (
                  <Suspense fallback={renderPanelFallback('experiment')}>
                    <SandboxView
                      activeProfile={sim.activeProfile}
                      params={sim.params}
                      setParams={sim.setParams}
                      aggregated={sim.aggregated}
                      onocoyHookSnapshot={sim.onocoyHookSnapshot}
                      playbackWeek={sim.playbackWeek}
                      incentiveRegime={incentiveRegime}
                      scrollToControl={scrollToControl}
                      focusChart={sim.focusChart}
                      setFocusChart={sim.setFocusChart}
                      activeScenarioId={activeScenarioId}
                      onScenarioLoad={(scenarioParams, scenarioId) => applyGlobalScenario(scenarioParams, scenarioId)}
                    />
                  </Suspense>
                ) : (
                  <Suspense fallback={renderPanelFallback('comparison')}>
                    <ComparisonView
                      selectedProtocolIds={sim.selectedProtocolIds}
                      setSelectedProtocolIds={(ids) => {
                        // Manually update hook state if needed, or expose setter.
                        // Hook exposes `selectedProtocolIds` and `toggleProtocolSelection`.
                        // We need a bulk setter or iterate.
                        // Hook does NOT expose bulk setter. I should add `setSelectedProtocolIds` to hook return.
                        // For now, I'll access it via `sim.setSelectedProtocolIds` if I add it.
                        // Checking hook... it sends `selectedProtocolIds`. `setSelectedProtocolIds` is NOT returned.
                        // I will PATCH the HOOK to return `setSelectedProtocolIds`.
                      }}
                      profiles={PROTOCOL_PROFILES}
                      multiAggregated={sim.multiAggregated}
                      liveData={liveData}
                      liveDataLoading={liveDataLoading}
                      fetchLiveData={fetchLiveData}
                      params={sim.params}
                    />
                  </Suspense>
                )}
              </main>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 bg-slate-950" />
      )}

      {(activeTab === 'thesis' || hasVisitedThesis) && (
        <div
          id="panel-thesis"
          role="tabpanel"
          aria-labelledby="tab-thesis"
          aria-hidden={activeTab !== 'thesis'}
          className={activeTab === 'thesis'
            ? 'flex-1 overflow-y-auto bg-slate-950 custom-scrollbar p-6'
            : 'hidden'}
        >
          <div className="mb-6 space-y-3">
            <DecisionBriefCard brief={briefsBySurface.strategy} dataCy="strategy-decision-brief" />
            <p className="text-xs text-slate-400">
              Next step: convert this strategy into one owner-assigned action and export the brief for review.
            </p>
          </div>
          <Suspense fallback={renderPanelFallback('strategy')}>
            <ThesisDashboard
              activeProfile={sim.activeProfile}
              protocols={PROTOCOL_PROFILES}
              onSelectProtocol={sim.loadProfile}
              activeScenarioId={activeScenarioId}
              onScenarioSelect={handleThesisScenarioSelect}
            />
          </Suspense>
        </div>
      )}

      {(activeTab === 'diagnostic' || hasVisitedDiagnostic) && (
        <div
          id="panel-diagnostic"
          role="tabpanel"
          aria-labelledby="tab-diagnostic"
          aria-hidden={activeTab !== 'diagnostic'}
          className={activeTab === 'diagnostic'
            ? 'flex-1 overflow-y-auto bg-slate-950 custom-scrollbar p-6'
            : 'hidden'}
        >
          <div className="mb-6 space-y-3">
            <DecisionBriefCard brief={briefsBySurface.diagnostics} dataCy="diagnostic-decision-brief" />
            <p className="text-xs text-slate-400">
              Use Suggested Mode for first pass, then confirm the highest-impact failure mode.
            </p>
            <p className="text-xs text-slate-400">
              Next step: validate one intervention in Stress Lab and re-export the brief.
            </p>
          </div>
          <Suspense fallback={renderPanelFallback('root causes')}>
            <AuditDashboard
              simulationData={sim.aggregated}
              loading={sim.loading}
              profileName={sim.activeProfile.metadata.name}
              onProtocolChange={handleDiagnosticProtocolChange}
              onRunSensitivity={handleDiagnosticRunSensitivity}
              onParamChange={handleDiagnosticParamChange}
            />
          </Suspense>
        </div>
      )}

      {/* MODALS (Methodology, Wiki, etc) */}
      <MethodologyDrawer isOpen={isMethodologyOpen} onClose={() => setIsMethodologyOpen(false)} />
      <MethodologySheet isOpen={showAuditPanel} onClose={() => setShowAuditPanel(false)} />

    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
