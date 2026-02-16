import { useEffect } from 'react';
import {
    PROTOCOL_PROFILES,
    ProtocolProfileV1
} from '../data/protocols';
import { PEER_GROUPS } from '../data/peerGroups';
import { OnChainMetrics } from '../services/dune';
import {
    SimulationParams as NewSimulationParams,
    AggregateResult as NewAggregateResult,
    runSimulation as runNewSimulation,
    calculateDerivedMetrics,
    SimResult,
    AggregateResult,
    simulateOne
} from '../model';
import { SimulationParams } from '../model/SimulationAdapter';
import { Optimizer } from '../model/optimizer';
import { getProtocolModule } from '../protocols/registry';

// Sub-hooks
import { useSimState } from './simulation/useSimState';
import { useSimEngine } from './simulation/useSimEngine';
import { useOnocoyAdapter, OnocoyProtocolHookSnapshot } from './simulation/useOnocoyAdapter';

type ProtocolTelemetryById = Record<string, (OnChainMetrics & { sourceType?: string }) | null>;
export type { OnocoyProtocolHookSnapshot };

export const useSimulationRunner = (protocolTelemetryById: ProtocolTelemetryById = {}) => {
    // 1. STATE
    const state = useSimState();
    const {
        params, setParams,
        viewMode, setViewMode,
        activeProfile, setActiveProfile,
        selectedProtocolIds, setSelectedProtocolIds,
        multiAggregated, setMultiAggregated,
        setOnocoyHookSnapshots,
        setAggregated,
        setLoading,
        autoRun, setAutoRun,
        playbackWeek,
        setPlaybackWeek,
        setDerivedMetrics,
        setPeerWizardAggregated,
        loading,
        useNewModel,
        onocoyHookSnapshots,
        focusChart, setFocusChart
    } = state;

    // 2. LOGIC ADAPTERS
    const engine = useSimEngine();
    const onocoyAdapter = useOnocoyAdapter();

    // 3. CORE SIMULATION RUNNER
    const runSimulation = () => {
        setLoading(true);
        setPlaybackWeek(0);

        setTimeout(() => {
            const allResults: Record<string, AggregateResult[]> = {};
            const protocolSnapshots: Record<string, OnocoyProtocolHookSnapshot> = {};

            const benchmarkIds = Array.from(new Set(PEER_GROUPS.flatMap(group => group.members)));

            const protocolsToSimulate = viewMode === 'comparison'
                ? PROTOCOL_PROFILES.filter(p => selectedProtocolIds.includes(p.metadata.id))
                : viewMode === 'benchmark'
                    ? PROTOCOL_PROFILES.filter(p => benchmarkIds.includes(p.metadata.id))
                    : [activeProfile];

            protocolsToSimulate.forEach(profile => {
                const isSandbox = viewMode === 'sandbox';
                const localParams = engine.buildLocalParams(profile, isSandbox, params);
                const protocolModule = getProtocolModule<NewSimulationParams, AggregateResult>(profile.metadata.id);
                const moduleParams = protocolModule.normalizeParams
                    ? protocolModule.normalizeParams(localParams)
                    : localParams;

                let aggregate: AggregateResult[];

                if (useNewModel) {
                    const newResults = runNewSimulation(moduleParams);
                    aggregate = engine.mapNewResultsToAggregate(newResults);
                    aggregate = protocolModule.postProcessAggregates
                        ? protocolModule.postProcessAggregates(aggregate)
                        : aggregate;

                    if (profile.metadata.id === activeProfile.metadata.id) {
                        const metrics = calculateDerivedMetrics(newResults, moduleParams);
                        setDerivedMetrics(metrics);
                    }
                } else {
                    const allSims: SimResult[][] = [];
                    for (let i = 0; i < params.nSims; i++) {
                        allSims.push(simulateOne(moduleParams as unknown as SimulationParams, params.seed + i));
                    }

                    // Legacy Aggregation Logic (Inline for now, could be extracted further)
                    aggregate = [];
                    const keys: (keyof SimResult)[] = ['price', 'supply', 'demand', 'demand_served', 'providers', 'capacity', 'servicePrice', 'minted', 'burned', 'utilization', 'profit', 'scarcity', 'incentive', 'solvencyScore', 'netDailyLoss', 'dailyMintUsd', 'dailyBurnUsd', 'treasuryBalance', 'vampireChurn', 'mercenaryCount', 'proCount', 'underwaterCount', 'costPerCapacity', 'revenuePerCapacity', 'entryBarrierActive'];

                    for (let tStep = 0; tStep < params.T; tStep++) {
                        const step: any = { t: tStep };
                        keys.forEach(key => {
                            const values = allSims.map(sim => sim[tStep]?.[key] as number).filter(v => v !== undefined).sort((a, b) => a - b);
                            if (values.length === 0) return;
                            const mean = values.reduce((a, b) => a + b, 0) / values.length;
                            const p10 = values[Math.floor(values.length * 0.1)] || 0;
                            const p90 = values[Math.floor(values.length * 0.9)] || 0;
                            step[key] = { mean, p10, p90 };
                        });
                        aggregate.push(step as AggregateResult);
                    }
                    aggregate = protocolModule.postProcessAggregates
                        ? protocolModule.postProcessAggregates(aggregate)
                        : aggregate;
                }

                if (protocolModule.id === 'onocoy') {
                    protocolSnapshots[profile.metadata.id] = onocoyAdapter.buildOnocoyHookSnapshot(
                        profile.metadata.id,
                        aggregate,
                        moduleParams,
                        protocolTelemetryById[profile.metadata.id]
                    );
                }

                allResults[profile.metadata.id] = aggregate;
            });

            setMultiAggregated(allResults);
            setOnocoyHookSnapshots(protocolSnapshots);
            if (allResults[activeProfile.metadata.id]) {
                setAggregated(allResults[activeProfile.metadata.id]);
            }
            setLoading(false);
            setPlaybackWeek(params.T);
        }, 100);
    };

    // 4. HELPERS
    const loadProfile = (profile: ProtocolProfileV1) => {
        setActiveProfile(profile);
        if (!selectedProtocolIds.includes(profile.metadata.id)) {
            setSelectedProtocolIds([...selectedProtocolIds, profile.metadata.id]);
        }
        setParams({
            ...params,
            initialSupply: profile.parameters.supply.value,
            initialPrice: profile.parameters.initial_price.value,
            maxMintWeekly: profile.parameters.emissions.value,
            burnPct: profile.parameters.burn_fraction.value,
            rewardLagWeeks: profile.parameters.adjustment_lag.value,
            providerCostPerWeek: profile.parameters.provider_economics.opex_weekly.value,
            churnThreshold: profile.parameters.provider_economics.churn_threshold.value,
            hardwareCost: profile.parameters.hardware_cost.value,
            initialProviders: profile.parameters.initial_active_providers?.value || 30,
            proTierPct: profile.parameters.pro_tier_pct?.value || 0.0,
        });
        setTimeout(runSimulation, 50);
    };

    const resetToDefaults = () => {
        loadProfile(activeProfile);
        setParams(prev => ({
            ...prev,
            scenario: 'baseline',
            macro: 'sideways',
            demandType: activeProfile.parameters.demand_regime.value,
            nSims: 25,
            competitorYield: 0.0,
            emissionModel: 'fixed',
            revenueStrategy: 'burn',
            initialLiquidity: 500000,
            investorSellPct: 0.05,
            hardwareCost: activeProfile.parameters.hardware_cost.value,
            initialProviders: activeProfile.parameters.initial_active_providers?.value || 30,
            proTierPct: activeProfile.parameters.pro_tier_pct?.value || 0.0,
            proTierEfficiency: 1.5,
        }));
        setViewMode('sandbox');
    };

    const toggleProtocolSelection = (id: string) => {
        if (selectedProtocolIds.includes(id)) {
            if (selectedProtocolIds.length > 1) {
                setSelectedProtocolIds(selectedProtocolIds.filter(pid => pid !== id));
            }
        } else {
            setSelectedProtocolIds([...selectedProtocolIds, id]);
        }
    };

    // 5. EFFECTS
    useEffect(() => {
        if (autoRun && (viewMode === 'sandbox' || viewMode === 'benchmark')) {
            const timer = setTimeout(() => {
                runSimulation();
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [params, autoRun, viewMode, JSON.stringify(protocolTelemetryById)]);

    useEffect(() => { runSimulation(); }, []);

    // Peer Wizard Effect
    useEffect(() => {
        if (viewMode === 'benchmark' && Object.keys(multiAggregated).length > 1) {
            setPeerWizardAggregated(multiAggregated);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(() => {
            try {
                const peerResults: Record<string, AggregateResult[]> = {};
                const peerNSims = Math.max(8, Math.min(12, params.nSims));

                PROTOCOL_PROFILES.forEach(profile => {
                    const peerParams = engine.buildLocalParams(profile, false, params, {
                        nSims: peerNSims,
                        seed: params.seed
                    });
                    const protocolModule = getProtocolModule<NewSimulationParams, AggregateResult>(profile.metadata.id);
                    const normalizedPeerParams = protocolModule.normalizeParams
                        ? protocolModule.normalizeParams(peerParams)
                        : peerParams;

                    const peerSeries = runNewSimulation(normalizedPeerParams);
                    const mappedPeerSeries = engine.mapNewResultsToAggregate(peerSeries);
                    peerResults[profile.metadata.id] = protocolModule.postProcessAggregates
                        ? protocolModule.postProcessAggregates(mappedPeerSeries)
                        : mappedPeerSeries;
                });

                if (!cancelled) {
                    setPeerWizardAggregated(peerResults);
                }
            } catch (error) {
                console.error('Peer wizard calibration failed', error);
                if (!cancelled) {
                    setPeerWizardAggregated({});
                }
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [
        viewMode,
        multiAggregated,
        params.T,
        params.scenario,
        params.initialPrice,
        params.burnPct,
        params.demandType,
        params.macro,
        params.providerCostPerWeek,
        params.churnThreshold,
        params.kDemandPrice,
        params.kMintPrice,
        params.rewardLagWeeks,
        params.competitorYield,
        params.initialLiquidity,
        params.investorSellPct,
        params.investorUnlockWeek,
        params.seed,
        params.nSims,
        params.baseCapacityPerProvider,
        params.proTierEfficiency,
        params.hardwareCost,
        params.proTierPct,
        params.emissionModel,
        params.revenueStrategy
    ]);

    // 6. RETURN API
    return {
        // State
        params, setParams,
        viewMode, setViewMode,
        activeProfile,
        selectedProtocolIds, setSelectedProtocolIds,
        aggregated: state.aggregated,
        multiAggregated: state.multiAggregated,
        peerWizardAggregated: state.peerWizardAggregated,
        loading,
        autoRun, setAutoRun,
        playbackWeek, setPlaybackWeek,
        derivedMetrics: state.derivedMetrics,
        onocoyHookSnapshots: state.onocoyHookSnapshots,
        onocoyHookSnapshot: onocoyHookSnapshots[activeProfile.metadata.id],
        focusChart, setFocusChart,
        useNewModel: state.useNewModel, setUseNewModel: state.setUseNewModel,

        // Actions
        runSimulation,
        resetToDefaults,
        toggleProtocolSelection,
        loadProfile,

        // Optimizer Actions
        findBreakEven: () => {
            setLoading(true);
            setTimeout(() => {
                const optimalPrice = Optimizer.findBreakEvenPrice(params, 'solvency', 1.0);
                setParams(prev => ({ ...prev, initialPrice: optimalPrice }));
                setLoading(false);
            }, 100);
        },
        runOptimization: (type: 'scale' | 'defense') => {
            setLoading(true);
            setTimeout(() => {
                if (type === 'scale') {
                    const maxScale = Optimizer.findMaxScalableSupply(params);
                    setParams(prev => ({ ...prev, initialProviders: maxScale }));
                } else if (type === 'defense') {
                    const threat = params.competitorYield > 0 ? params.competitorYield : 0.5;
                    const optimalEmission = Optimizer.findRetentionAPY({ ...params, competitorYield: threat });
                    setParams(prev => ({ ...prev, maxMintWeekly: optimalEmission, competitorYield: threat }));
                }
                setLoading(false);
            }, 100);
        },
        runSensitivityAnalysis: () => {
            const isSandbox = viewMode === 'sandbox';
            const localParams = engine.buildLocalParams(activeProfile, isSandbox, params);
            return Optimizer.runSensitivitySweep(localParams as any);
        }
    };
};
