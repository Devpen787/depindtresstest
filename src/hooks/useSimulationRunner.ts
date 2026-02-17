import { useEffect, useRef } from 'react';
import {
    PROTOCOL_PROFILES,
    ProtocolProfileV1
} from '../data/protocols';
import { PEER_GROUPS } from '../data/peerGroups';
import { OnChainMetrics } from '../services/dune';
import {
    SimulationParams as NewSimulationParams,
    runSimulation as runNewSimulation,
    calculateDerivedMetrics,
    SimResult,
    AggregateResult,
    simulateOne
} from '../model';
import { SimulationParams } from '../model/SimulationAdapter';
import { Optimizer } from '../model/optimizer';
import { getProtocolModule } from '../protocols/registry';
import { recordPerf } from '../utils/perf';

// Sub-hooks
import { useSimState } from './simulation/useSimState';
import { useSimEngine } from './simulation/useSimEngine';
import { useOnocoyAdapter, OnocoyProtocolHookSnapshot } from './simulation/useOnocoyAdapter';
import type {
    SimulationWorkerJob,
    SimulationWorkerPeerJob,
    SimulationWorkerRequest,
    SimulationWorkerResponse,
    SimulationWorkerRunResult,
    SimulationWorkerPeerResult
} from '../workers/simulationWorkerTypes';

type ProtocolTelemetryById = Record<string, (OnChainMetrics & { sourceType?: string }) | null>;
export type { OnocoyProtocolHookSnapshot };

interface UseSimulationRunnerOptions {
    enablePeerWizardCalibration?: boolean;
}

export const useSimulationRunner = (
    protocolTelemetryById: ProtocolTelemetryById = {},
    options: UseSimulationRunnerOptions = {}
) => {
    const { enablePeerWizardCalibration = false } = options;
    const yieldToMainThread = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
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
    const workerRef = useRef<Worker | null>(null);
    const runSequenceRef = useRef(0);
    const peerSequenceRef = useRef(0);

    useEffect(() => {
        if (typeof Worker === 'undefined') return;
        const worker = new Worker(new URL('../workers/simulationWorker.ts', import.meta.url), { type: 'module' });
        workerRef.current = worker;
        return () => {
            worker.terminate();
            workerRef.current = null;
        };
    }, []);

    const requestWorker = <T extends SimulationWorkerResponse>(
        request: SimulationWorkerRequest,
        expectedType: T['type']
    ): Promise<T> => {
        return new Promise((resolve, reject) => {
            const worker = workerRef.current;
            if (!worker) {
                reject(new Error('Simulation worker unavailable'));
                return;
            }

            const onMessage = (event: MessageEvent<SimulationWorkerResponse>) => {
                const payload = event.data;
                if (payload.type !== expectedType || payload.runId !== request.runId) {
                    return;
                }

                worker.removeEventListener('message', onMessage as EventListener);
                worker.removeEventListener('error', onError);

                if ('error' in payload && payload.error) {
                    reject(new Error(payload.error));
                    return;
                }

                resolve(payload as T);
            };

            const onError = (event: ErrorEvent) => {
                worker.removeEventListener('message', onMessage as EventListener);
                worker.removeEventListener('error', onError);
                reject(event.error || new Error(event.message));
            };

            worker.addEventListener('message', onMessage as EventListener);
            worker.addEventListener('error', onError);
            worker.postMessage(request);
        });
    };

    const runSimulationOnMainThread = async (
        jobs: SimulationWorkerJob[],
        activeProfileId: string
    ): Promise<{ allResults: Record<string, AggregateResult[]>; derivedMetrics: ReturnType<typeof calculateDerivedMetrics> | null }> => {
        const allResults: Record<string, AggregateResult[]> = {};
        let derivedMetrics: ReturnType<typeof calculateDerivedMetrics> | null = null;

        for (const job of jobs) {
            const protocolModule = getProtocolModule<NewSimulationParams, AggregateResult>(job.protocolId);
            let aggregate: AggregateResult[];

            if (job.useNewModel) {
                const newResults = runNewSimulation(job.params);
                aggregate = engine.mapNewResultsToAggregate(newResults);
                aggregate = protocolModule.postProcessAggregates
                    ? protocolModule.postProcessAggregates(aggregate)
                    : aggregate;
                if (job.protocolId === activeProfileId) {
                    derivedMetrics = calculateDerivedMetrics(newResults, job.params);
                }
            } else {
                const allSims: SimResult[][] = [];
                for (let i = 0; i < job.params.nSims; i++) {
                    allSims.push(simulateOne(job.params as unknown as SimulationParams, job.params.seed + i));
                    if ((i + 1) % 6 === 0) {
                        await yieldToMainThread();
                    }
                }

                aggregate = [];
                const keys: (keyof SimResult)[] = ['price', 'supply', 'demand', 'demand_served', 'providers', 'capacity', 'servicePrice', 'minted', 'burned', 'utilization', 'profit', 'scarcity', 'incentive', 'solvencyScore', 'netDailyLoss', 'dailyMintUsd', 'dailyBurnUsd', 'treasuryBalance', 'vampireChurn', 'mercenaryCount', 'proCount', 'underwaterCount', 'costPerCapacity', 'revenuePerCapacity', 'entryBarrierActive'];

                for (let tStep = 0; tStep < job.params.T; tStep++) {
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
                    if ((tStep + 1) % 10 === 0) {
                        await yieldToMainThread();
                    }
                }

                aggregate = protocolModule.postProcessAggregates
                    ? protocolModule.postProcessAggregates(aggregate)
                    : aggregate;
            }

            allResults[job.protocolId] = aggregate;
            await yieldToMainThread();
        }

        return { allResults, derivedMetrics };
    };

    const runPeerCalibrationOnMainThread = async (jobs: SimulationWorkerPeerJob[]): Promise<Record<string, AggregateResult[]>> => {
        const peerResults: Record<string, AggregateResult[]> = {};

        for (const job of jobs) {
            const protocolModule = getProtocolModule<NewSimulationParams, AggregateResult>(job.protocolId);
            const peerSeries = runNewSimulation(job.params);
            const mappedPeerSeries = engine.mapNewResultsToAggregate(peerSeries);
            peerResults[job.protocolId] = protocolModule.postProcessAggregates
                ? protocolModule.postProcessAggregates(mappedPeerSeries)
                : mappedPeerSeries;
            await yieldToMainThread();
        }

        return peerResults;
    };

    // 3. CORE SIMULATION RUNNER
    const runSimulation = () => {
        setLoading(true);
        setPlaybackWeek(0);

        setTimeout(async () => {
            const startedAt = performance.now();
            const protocolSnapshots: Record<string, OnocoyProtocolHookSnapshot> = {};
            const runId = runSequenceRef.current + 1;
            runSequenceRef.current = runId;

            const benchmarkIds = Array.from(new Set(PEER_GROUPS.flatMap(group => group.members)));

            const protocolsToSimulate = viewMode === 'comparison'
                ? PROTOCOL_PROFILES.filter(p => selectedProtocolIds.includes(p.metadata.id))
                : viewMode === 'benchmark'
                    ? PROTOCOL_PROFILES.filter(p => benchmarkIds.includes(p.metadata.id))
                    : [activeProfile];
            const moduleParamsById: Record<string, NewSimulationParams> = {};
            const jobs: SimulationWorkerJob[] = protocolsToSimulate.map((profile) => {
                const isSandbox = viewMode === 'sandbox';
                const localParams = engine.buildLocalParams(profile, isSandbox, params);
                const protocolModule = getProtocolModule<NewSimulationParams, AggregateResult>(profile.metadata.id);
                const moduleParams = protocolModule.normalizeParams
                    ? protocolModule.normalizeParams(localParams)
                    : localParams;
                moduleParamsById[profile.metadata.id] = moduleParams;
                return {
                    protocolId: profile.metadata.id,
                    params: moduleParams,
                    useNewModel
                };
            });

            try {
                let allResults: Record<string, AggregateResult[]> = {};
                let derivedMetrics: ReturnType<typeof calculateDerivedMetrics> | null = null;

                if (workerRef.current) {
                    const response = await requestWorker<SimulationWorkerRunResult>({
                        type: 'runSimulation',
                        runId,
                        jobs,
                        activeProfileId: activeProfile.metadata.id
                    }, 'runSimulationResult');
                    allResults = response.allResults;
                    derivedMetrics = response.derivedMetrics;
                } else {
                    const fallback = await runSimulationOnMainThread(jobs, activeProfile.metadata.id);
                    allResults = fallback.allResults;
                    derivedMetrics = fallback.derivedMetrics;
                }

                if (runId !== runSequenceRef.current) {
                    return;
                }

                if (derivedMetrics) {
                    setDerivedMetrics(derivedMetrics);
                }

                protocolsToSimulate.forEach((profile) => {
                    const aggregate = allResults[profile.metadata.id];
                    if (!aggregate) return;
                    const protocolModule = getProtocolModule<NewSimulationParams, AggregateResult>(profile.metadata.id);
                    if (protocolModule.id !== 'onocoy') return;
                    protocolSnapshots[profile.metadata.id] = onocoyAdapter.buildOnocoyHookSnapshot(
                        profile.metadata.id,
                        aggregate,
                        moduleParamsById[profile.metadata.id],
                        protocolTelemetryById[profile.metadata.id]
                    );
                });

                setMultiAggregated(allResults);
                setOnocoyHookSnapshots(protocolSnapshots);
                if (allResults[activeProfile.metadata.id]) {
                    setAggregated(allResults[activeProfile.metadata.id]);
                }
            } catch (error) {
                if (runId !== runSequenceRef.current) {
                    return;
                }
                console.error('Simulation run failed', error);
            } finally {
                if (runId !== runSequenceRef.current) {
                    return;
                }
                setLoading(false);
                setPlaybackWeek(params.T);
                recordPerf('simulation-run', performance.now() - startedAt, {
                    viewMode,
                    protocols: protocolsToSimulate.length,
                    nSims: params.nSims,
                    model: useNewModel ? 'v2' : 'legacy',
                    worker: Boolean(workerRef.current)
                });
            }
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
    }, [params, autoRun, JSON.stringify(protocolTelemetryById)]);

    useEffect(() => { runSimulation(); }, []);

    // Peer Wizard Effect
    useEffect(() => {
        // Reuse benchmark cohort results whenever available.
        if (viewMode === 'benchmark' && Object.keys(multiAggregated).length > 1) {
            setPeerWizardAggregated(multiAggregated);
            return;
        }

        // Avoid expensive peer recalibration unless Decision Tree v2 is open.
        if (!enablePeerWizardCalibration) {
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            const runId = peerSequenceRef.current + 1;
            peerSequenceRef.current = runId;
            const startedAt = performance.now();
            try {
                const peerNSims = Math.max(8, Math.min(12, params.nSims));
                const peerJobs: SimulationWorkerPeerJob[] = PROTOCOL_PROFILES.map((profile) => {
                    const peerParams = engine.buildLocalParams(profile, false, params, {
                        nSims: peerNSims,
                        seed: params.seed
                    });
                    const protocolModule = getProtocolModule<NewSimulationParams, AggregateResult>(profile.metadata.id);
                    const normalizedPeerParams = protocolModule.normalizeParams
                        ? protocolModule.normalizeParams(peerParams)
                        : peerParams;
                    return {
                        protocolId: profile.metadata.id,
                        params: normalizedPeerParams
                    };
                });

                const peerResults = workerRef.current
                    ? (await requestWorker<SimulationWorkerPeerResult>({
                        type: 'runPeerCalibration',
                        runId,
                        jobs: peerJobs
                    }, 'runPeerCalibrationResult')).peerResults
                    : await runPeerCalibrationOnMainThread(peerJobs);

                if (cancelled || runId !== peerSequenceRef.current) {
                    return;
                }

                setPeerWizardAggregated(peerResults);
                recordPerf('peer-wizard-calibration', performance.now() - startedAt, {
                    peers: Object.keys(peerResults).length,
                    nSims: peerNSims,
                    worker: Boolean(workerRef.current)
                });
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
        enablePeerWizardCalibration,
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
        simulationRunId: runSequenceRef.current,

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
