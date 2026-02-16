import React, { useState, useMemo, useCallback } from 'react';
import { LegacySimulationParams as SimulationParams, LegacyAggregateResult as AggregateResult } from '../../model/legacy/engine';
import { ProtocolProfileV1 } from '../../data/protocols';
import { TokenMarketData } from '../../services/coingecko';
import { ProtocolMetrics } from '../../hooks/useProtocolMetrics';
import { useBenchmarkViewModel } from '../../viewmodels/BenchmarkViewModel';
import { useSensitivityAnalysis } from '../../hooks/useSensitivityAnalysis';

// Components
import { BenchmarkHeader } from './BenchmarkHeader';
import { PeerToggle, PeerId } from './PeerToggle';
import { ComparativeMatrix } from './ComparativeMatrix';
import { AIInsights, generateInsights } from './AIInsights';
import { SensitivitySummary } from './SensitivitySummary';
import { BenchmarkExportButton } from './BenchmarkExportButton';
import { SolvencyProjectionChart } from './SolvencyProjectionChart';
import { HealthMetricsBarChart } from './HealthMetricsBarChart';
import { StrategicEdgeRadar } from './StrategicEdgeRadar';
import { PEER_GROUPS, BENCHMARK_PEERS } from '../../data/peerGroups';

import { InsightCard } from '../Story/InsightCard';
import MetricEvidenceLegend from '../ui/MetricEvidenceLegend';
import { getMetricEvidence, withExtractionTimestamp } from '../../data/metricEvidence';
import {
    GUARDRAIL_BAND_LABELS,
    PAYBACK_GUARDRAILS,
    RETENTION_GUARDRAILS,
    SUSTAINABILITY_GUARDRAILS
} from '../../constants/guardrails';
import {
    benchmarkClamp,
    calculateDemandCoveragePct,
    calculateEfficiencyScore,
    calculatePaybackMonths,
    calculateRetentionFallback,
    calculateSmoothedSolvencyIndex,
    calculateWeeklyRetentionEstimate,
    normalizePaybackMonths,
    normalizeSustainabilityRatio,
    toPaybackScore
} from '../../audit/benchmarkViewMath';
import ResearchView from './ResearchView';

interface BenchmarkViewProps {
    params: SimulationParams;
    setParams: (p: SimulationParams) => void;
    multiAggregated: Record<string, AggregateResult[]>;
    profiles: ProtocolProfileV1[];
    liveData: Record<string, TokenMarketData | null>;
    onChainData: Record<string, ProtocolMetrics | null>;
    engineLabel: string;
    lastLiveDataFetch?: Date | null;
    loading?: boolean;
    activeScenarioId?: string | null;  // From Scenario Library
}

interface ProtocolBenchmarkMetrics {
    payback: number;
    efficiency: number;
    sustain: number;
    retention: number;
}

interface SolvencyProjectionPoint {
    week: number;
    label: string;
    onocoy: number;
    [key: string]: number | string;
}

interface StrategicRadarPoint {
    dimension: string;
    onocoy: number;
    fullMark: number;
    [key: string]: number | string;
}

const ALL_BENCHMARK_PROTOCOL_IDS = Array.from(new Set(PEER_GROUPS.flatMap(group => group.members)));

const getUtilizationMean = (point?: AggregateResult | null): number => {
    return point?.utilization?.mean ?? (point as any)?.utilisation?.mean ?? 0;
};

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({
    params,
    setParams,
    multiAggregated,
    profiles,
    liveData,
    onChainData,
    engineLabel,
    loading = false,
    activeScenarioId = null
}) => {
    // 1. View Model (Stateless derivation)
    const viewModel = useBenchmarkViewModel(params, multiAggregated, profiles, liveData, onChainData, engineLabel);

    // 2. Sensitivity Hook
    const primaryId = BENCHMARK_PEERS.primary;
    const activeProfile = profiles.find(p => p.metadata.id === primaryId);

    const { results: sensitivityResults, isCalculating: isSensComputing } = useSensitivityAnalysis(
        params,
        activeProfile
    );



    // 3. V2 State: Selected Peers & Active Tab
    const [activeGroupId, setActiveGroupId] = useState<string>(PEER_GROUPS[0].id);
    const [selectedPeers, setSelectedPeers] = useState<PeerId[]>(['geodnet_v1']);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'research'>('dashboard');

    // Handle group change: switch group and reset selected peers to defaults
    const handleGroupChange = useCallback((groupId: string) => {
        const group = PEER_GROUPS.find(g => g.id === groupId);
        if (group) {
            setActiveGroupId(groupId);
            // Default to first 2 peers in the new group (excluding Onocoy)
            const defaults = group.members
                .filter(id => id !== BENCHMARK_PEERS.primary)
                .slice(0, 2);
            setSelectedPeers(defaults);
        }
    }, []);

    const togglePeer = useCallback((peerId: PeerId) => {
        setSelectedPeers(prev =>
            prev.includes(peerId)
                ? prev.filter(p => p !== peerId)
                : [...prev, peerId]
        );
    }, []);

    // 4. Derive benchmark metrics for each protocol from simulation/live sources.
    const peerMetrics = useMemo<Record<string, ProtocolBenchmarkMetrics>>(() => {
        const out: Record<string, ProtocolBenchmarkMetrics> = {};

        ALL_BENCHMARK_PROTOCOL_IDS.forEach(protocolId => {
            const supply = viewModel.getSupplySide(protocolId);
            const demand = viewModel.getDemandSide(protocolId);
            const tokenomics = viewModel.getTokenomics(protocolId);
            const series = multiAggregated[protocolId] || [];
            const lastPoint = series.length > 0 ? series[series.length - 1] : null;
            const previousPoint = series.length > 1 ? series[series.length - 2] : null;

            const rawPaybackMonths = calculatePaybackMonths(
                supply.hardwareCost,
                demand.annualizedRevenue,
                supply.activeNodes
            );

            const providersSeries = series
                .map(point => point.providers?.mean ?? 0)
                .filter(v => Number.isFinite(v) && v > 0);
            const finalProviders = providersSeries.length > 0
                ? providersSeries[providersSeries.length - 1]
                : supply.activeNodes;
            const peakProviders = providersSeries.length > 0
                ? Math.max(...providersSeries)
                : Math.max(1, supply.activeNodes);
            const retentionFallback = calculateRetentionFallback(finalProviders, peakProviders);

            const demandNow = lastPoint?.demand?.mean || 0;
            const demandServedNow = lastPoint?.demand_served?.mean || 0;
            const demandCoverage = calculateDemandCoveragePct(demandNow, demandServedNow);
            const utilization = benchmarkClamp(getUtilizationMean(lastPoint), 0, 100);
            const previousUtilization = previousPoint
                ? benchmarkClamp(getUtilizationMean(previousPoint), 0, 100)
                : undefined;
            const efficiencyScore = calculateEfficiencyScore(utilization, demandCoverage, previousUtilization);

            out[protocolId] = {
                payback: normalizePaybackMonths(rawPaybackMonths),
                efficiency: efficiencyScore,
                sustain: normalizeSustainabilityRatio(tokenomics.sustainabilityRatio),
                retention: calculateWeeklyRetentionEstimate(
                    series.map(point => ({
                        providers: point.providers?.mean ?? 0,
                        churn: point.churnCount?.mean ?? 0
                    })),
                    retentionFallback
                )
            };
        });

        return out;
    }, [viewModel, multiAggregated]);

    const onocoyData = useMemo<ProtocolBenchmarkMetrics>(() => {
        return peerMetrics[BENCHMARK_PEERS.primary] || {
            payback: 60,
            efficiency: 0,
            sustain: 0,
            retention: 0
        };
    }, [peerMetrics]);

    // 5. Calculate peer mean for selected cohort.
    const peerMedian = useMemo<ProtocolBenchmarkMetrics>(() => {
        if (selectedPeers.length === 0) {
            return onocoyData;
        }

        const metricKeys: Array<keyof ProtocolBenchmarkMetrics> = ['payback', 'efficiency', 'sustain', 'retention'];
        const result = { payback: 0, efficiency: 0, sustain: 0, retention: 0 };

        metricKeys.forEach(metric => {
            const values = selectedPeers
                .map(peerId => peerMetrics[peerId]?.[metric])
                .filter((value): value is number => Number.isFinite(value));

            result[metric] = values.length > 0
                ? values.reduce((sum, value) => sum + value, 0) / values.length
                : onocoyData[metric];
        });

        return result;
    }, [selectedPeers, peerMetrics, onocoyData]);

    // 6. Derive deltas
    const deltas = useMemo(() => ({
        payback: onocoyData.payback - peerMedian.payback,
        efficiency: onocoyData.efficiency - peerMedian.efficiency,
        sustain: onocoyData.sustain - peerMedian.sustain,
        retention: onocoyData.retention - peerMedian.retention
    }), [onocoyData, peerMedian]);

    // 7. Solvency projection chart from simulation output (index = solvency ratio * 100).
    const solvencyProjectionData = useMemo<SolvencyProjectionPoint[]>(() => {
        const protocolIds = [BENCHMARK_PEERS.primary, ...selectedPeers];
        const primarySeries = multiAggregated[BENCHMARK_PEERS.primary] || [];

        if (primarySeries.length === 0) {
            return [];
        }

        const maxLength = Math.max(
            ...protocolIds.map(id => (multiAggregated[id] || []).length),
            primarySeries.length
        );

        const sampledIndexSet = new Set<number>();
        for (let idx = 0; idx < maxLength; idx += 4) sampledIndexSet.add(idx);
        sampledIndexSet.add(maxLength - 1);

        const sampleIndexes = Array.from(sampledIndexSet).sort((a, b) => a - b);

        return sampleIndexes.map(idx => {
            const point: SolvencyProjectionPoint = {
                week: idx + 1,
                label: idx === 0 ? 'Now' : `W${idx + 1}`,
                onocoy: 0
            };

            protocolIds.forEach(protocolId => {
                const series = multiAggregated[protocolId] || [];
                if (series.length === 0) {
                    if (protocolId !== BENCHMARK_PEERS.primary) point[protocolId] = 0;
                    return;
                }

                const safeIndex = Math.min(idx, series.length - 1);
                const solvencySeries = series.map(item => item?.solvencyScore?.mean || 0);
                const value = calculateSmoothedSolvencyIndex(solvencySeries, safeIndex);

                if (protocolId === BENCHMARK_PEERS.primary) {
                    point.onocoy = value;
                } else {
                    point[protocolId] = value;
                }
            });

            return point;
        });
    }, [multiAggregated, selectedPeers]);

    // 8. Strategic radar from derived metrics and simulation output.
    const strategicEdgeData = useMemo<StrategicRadarPoint[]>(() => {
        const protocolIds = [BENCHMARK_PEERS.primary, ...selectedPeers];

        const scoresByProtocol: Record<string, Record<string, number>> = {};
        protocolIds.forEach(protocolId => {
            const series = multiAggregated[protocolId] || [];
            const last = series.length > 0 ? series[series.length - 1] : null;
            const benchmark = peerMetrics[protocolId] || { payback: 60, efficiency: 0, sustain: 0, retention: 0 };

            const demand = last?.demand?.mean || 0;
            const demandServed = last?.demand_served?.mean || 0;
            const demandCoverage = calculateDemandCoveragePct(demand, demandServed);

            scoresByProtocol[protocolId] = {
                roi: toPaybackScore(benchmark.payback),
                solvency: benchmarkClamp((last?.solvencyScore?.mean || 0) * 100, 0, 100),
                utilization: benchmarkClamp(getUtilizationMean(last), 0, 100),
                retention: benchmarkClamp(benchmark.retention, 0, 100),
                coverage: benchmarkClamp(demandCoverage, 0, 100)
            };
        });

        const dimensions: Array<{ key: string; label: string }> = [
            { key: 'roi', label: 'Provider ROI' },
            { key: 'solvency', label: 'Solvency' },
            { key: 'utilization', label: 'Utilization' },
            { key: 'retention', label: 'Retention' },
            { key: 'coverage', label: 'Demand Coverage' }
        ];

        return dimensions.map(({ key, label }) => {
            const point: StrategicRadarPoint = {
                dimension: label,
                onocoy: scoresByProtocol[BENCHMARK_PEERS.primary]?.[key] || 0,
                fullMark: 100
            };

            selectedPeers.forEach(peerId => {
                point[peerId] = scoresByProtocol[peerId]?.[key] || 0;
            });

            return point;
        });
    }, [multiAggregated, peerMetrics, selectedPeers]);

    // 9. Scenario identification - prefer activeScenarioId prop, fallback to params inference
    const scenarioId = useMemo(() => {
        if (activeScenarioId) return activeScenarioId; // Use actual scenario ID from library
        // Fallback inference for when no scenario is selected
        if (params.macro === 'bearish') return 'vampire_attack';
        if (params.demandType === 'growth') return 'growth_shock';
        if (params.investorSellPct > 0.3) return 'death_spiral';
        if (params.maxMintWeekly > 8_000_000) return 'infinite_subsidy';
        return 'baseline';
    }, [activeScenarioId, params]);

    const scenarioName = useMemo(() => {
        const names: Record<string, string> = {
            baseline: 'Baseline',
            death_spiral: 'Liquidity Shock',
            infinite_subsidy: 'The Subsidy Trap',
            vampire_attack: 'Vampire Attack',
            growth_shock: 'Aggressive Expansion'
        };
        return names[scenarioId] || 'Baseline';
    }, [scenarioId]);

    const aiInsights = useMemo(() => generateInsights(scenarioId, onocoyData, peerMedian), [scenarioId, onocoyData, peerMedian]);

    const isDataReady = (multiAggregated[BENCHMARK_PEERS.primary] || []).length > 0;
    const lastUpdatedIso = liveData[primaryId]?.lastUpdated || onChainData[primaryId]?.lastUpdated;
    const lastUpdated = lastUpdatedIso ? new Date(lastUpdatedIso) : undefined;

    const headToHeadMetrics = viewModel.getHeadToHeadMetrics();
    const benchmarkEvidence = useMemo(() => ({
        payback: withExtractionTimestamp(getMetricEvidence('benchmark_payback'), lastUpdatedIso),
        efficiency: withExtractionTimestamp(getMetricEvidence('benchmark_efficiency'), lastUpdatedIso),
        sustain: withExtractionTimestamp(getMetricEvidence('benchmark_sustain'), lastUpdatedIso),
        retention: withExtractionTimestamp(getMetricEvidence('benchmark_retention'), lastUpdatedIso),
    }), [lastUpdatedIso]);

    const benchmarkStatus = useMemo(() => {
        const paybackHealthy = onocoyData.payback <= PAYBACK_GUARDRAILS.healthyMaxMonths;
        const sustainHealthy = onocoyData.sustain >= SUSTAINABILITY_GUARDRAILS.benchmarkMinRatio;
        const retentionHealthy = onocoyData.retention >= RETENTION_GUARDRAILS.benchmarkMinPct;
        const healthySignals = [paybackHealthy, sustainHealthy, retentionHealthy].filter(Boolean).length;

        if (healthySignals <= 1) return { tone: 'critical' as const, label: GUARDRAIL_BAND_LABELS.intervention, detail: 'Multiple core guardrails are below target' };
        if (healthySignals === 2) return { tone: 'caution' as const, label: GUARDRAIL_BAND_LABELS.watchlist, detail: 'One core guardrail is below target' };
        return { tone: 'healthy' as const, label: GUARDRAIL_BAND_LABELS.healthy, detail: 'Core guardrails are inside target ranges' };
    }, [onocoyData]);

    if (!activeProfile) return <div>Loading Profile...</div>;

    // Research scenario mapping
    const getResearchScenario = () => {
        if (params.demandType === 'high-to-decay') return 'hyper';
        if (params.macro === 'bearish') return 'bear';
        if (params.competitorYield > 0.5) return 'bear';
        if (params.investorSellPct > 0.3) return 'bear';
        if (params.demandType === 'consistent' && params.maxMintWeekly > 8_000_000) return 'bear';
        if (params.macro === 'bullish') return 'bull';
        if ((params.growthCallEventPct || 0) > 0.3) return 'bull';
        return 'neutral';
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 overflow-hidden font-sans text-slate-200">
            {/* Header */}
            <BenchmarkHeader
                params={params}
                setParams={setParams}
                activeProtocolId={activeProfile.metadata.id}
                activeProtocolName={activeProfile.metadata.name}
                lastUpdated={lastUpdated}
                engineLabel={engineLabel}
                activeScenarioId={scenarioId}
            />

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800 w-fit">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('research')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'research' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Research
                        <span className="bg-purple-500/20 text-purple-200 text-[10px] px-1.5 py-0.5 rounded border border-purple-500/30">PYTHON</span>
                    </button>
                </div>

                {activeTab === 'research' ? (
                    <ResearchView
                        scenario={getResearchScenario()}
                        simulationResults={multiAggregated[BENCHMARK_PEERS.primary] || []}
                        viewModel={viewModel}
                    />
                ) : (
                    <>
                        <MetricEvidenceLegend />

                        {/* Peer Selector */}
                        <PeerToggle
                            selectedPeers={selectedPeers}
                            onToggle={togglePeer}
                            activeGroupId={activeGroupId}
                            onGroupChange={handleGroupChange}
                        />

                        {!isDataReady && loading ? (
                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-sm text-slate-400">
                                Running benchmark simulations… results will populate when the cohort finishes.
                            </div>
                        ) : (
                            <>
                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                    <InsightCard
                                        title="Payback Period"
                                        value={`${onocoyData.payback.toFixed(1)} mo`}
                                        trend={deltas.payback < 0 ? 'up' : 'down'}
                                        trendValue={`${deltas.payback > 0 ? '+' : ''}${deltas.payback.toFixed(1)} mo`}
                                        description="vs Peer Median (Lower is correct)"
                                    />
                                    <InsightCard
                                        title="Coverage Efficiency"
                                        value={`${onocoyData.efficiency.toFixed(0)}%`}
                                        trend={deltas.efficiency > 0 ? 'up' : 'down'}
                                        trendValue={`${deltas.efficiency > 0 ? '+' : ''}${deltas.efficiency.toFixed(0)}%`}
                                        description="vs Peer Median"
                                    />
                                    <InsightCard
                                        title="Sustainability Ratio"
                                        value={`${onocoyData.sustain.toFixed(1)}x`}
                                        trend={Math.abs(deltas.sustain) < 0.1 ? 'neutral' : deltas.sustain > 0 ? 'up' : 'down'}
                                        trendValue={`${deltas.sustain > 0 ? '+' : ''}${deltas.sustain.toFixed(1)}x`}
                                        description="vs Peer Median"
                                    />
                                    <InsightCard
                                        title="Retention (Est. Weekly)"
                                        value={`${onocoyData.retention.toFixed(1)}%`}
                                        trend={deltas.retention > 0 ? 'up' : 'down'}
                                        trendValue={`${deltas.retention > 0 ? '+' : ''}${deltas.retention.toFixed(1)}%`}
                                        description="vs Peer Median"
                                    />
                                </div>



                                {/* Charts Row */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <HealthMetricsBarChart
                                        selectedPeers={selectedPeers}
                                        onocoyData={onocoyData}
                                        peerData={peerMetrics}
                                    />
                                    <SolvencyProjectionChart
                                        data={solvencyProjectionData}
                                        selectedPeers={selectedPeers}
                                    />
                                </div>

                                {/* Matrix & Edge Grid */}
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    {/* Matrix (Span 2) */}
                                    <div className="xl:col-span-2">
                                        <ComparativeMatrix
                                            onocoyData={onocoyData}
                                            peerData={peerMetrics}
                                            selectedPeers={selectedPeers}
                                            onExport={() => {
                                                // Export logic from existing BenchmarkExportButton
                                            }}
                                        />
                                    </div>

                                    {/* Radar (Span 1) */}
                                    <StrategicEdgeRadar
                                        selectedPeers={selectedPeers}
                                        data={strategicEdgeData}
                                    />
                                </div>

                                {/* Sensitivity & Export Row */}
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    <div className="xl:col-span-2">
                                        <SensitivitySummary
                                            results={sensitivityResults}
                                            isLoading={isSensComputing}
                                        />
                                    </div>
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                        <h3 className="font-bold text-slate-200 text-sm mb-3">Export Data</h3>
                                        <p className="text-xs text-slate-400 mb-3">
                                            Download the full benchmark dataset.
                                        </p>
                                        <BenchmarkExportButton
                                            metrics={headToHeadMetrics}
                                            activeProtocolName={activeProfile.metadata.name}
                                        />
                                    </div>
                                </div>

                                {/* AI Insights */}
                                <AIInsights
                                    scenarioName={scenarioName}
                                    onocoyAdvantage={aiInsights.onocoyAdvantage}
                                    mainInsight={aiInsights.mainInsight}
                                    recommendation={aiInsights.recommendation}
                                />
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
