import { useState, useEffect } from 'react';
import {
    PROTOCOL_PROFILES,
    ProtocolProfileV1
} from '../data/protocols';
import { PEER_GROUPS } from '../data/peerGroups';
import { getDecisionTreeCalibration } from '../data/decisionTreeCalibration';
import {
    type SimulationParams as NewSimulationParams,
    type AggregateResult as NewAggregateResult,
    type DerivedMetrics,
    runSimulation as runNewSimulation,
    calculateDerivedMetrics,
} from '../model';
// Use adapter instead of direct engine imports (Phase 9: Engine Consolidation)
import {
    SimulationParams,
    SimResult,
    AggregateResult,
    simulateOne
} from '../model/SimulationAdapter';
import { Optimizer } from '../model/optimizer';
import { getProtocolModule } from '../protocols/registry';
import {
    buildOnocoyUnlockCurve,
    computeOnocoyReward,
    deriveOnocoyIntegritySignals,
    type OnocoyIntegritySignals,
    type OnocoyRewardBreakdown,
    type OnocoyUnlockPoint
} from '../protocols/onocoy';

export interface OnocoyProtocolHookSnapshot {
    protocolId: string;
    rewardProxy: OnocoyRewardBreakdown;
    unlockPreview: OnocoyUnlockPoint[];
    integrityProxy: OnocoyIntegritySignals;
    sourceTagIds: string[];
}

export const useSimulationRunner = () => {
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    const clampUnit = (value: number) => clamp(value, 0, 1);

    const deriveMarketCalibration = (profile: ProtocolProfileV1, isSandbox: boolean) => {
        const calibration = getDecisionTreeCalibration(profile);

        if (isSandbox) {
            return {
                initialLiquidity: params.initialLiquidity,
                investorSellPct: params.investorSellPct,
                macro: params.macro
            };
        }

        const priceAnchor = profile.parameters.initial_price.value > 0
            ? profile.parameters.initial_price.value
            : params.initialPrice;
        const impliedMarketCap = profile.parameters.supply.value * priceAnchor;
        const calibratedLiquidity = clamp(
            impliedMarketCap * calibration.liquidityPctOfMarketCap,
            calibration.liquidityMinUsd,
            calibration.liquidityMaxUsd
        );
        const calibratedSellPct = clamp(
            params.investorSellPct * calibration.investorSellMultiplier,
            calibration.investorSellPctMin,
            calibration.investorSellPctMax
        );

        return {
            initialLiquidity: Math.max(calibration.liquidityFloorUsd, calibratedLiquidity),
            investorSellPct: calibratedSellPct,
            macro: params.macro
        };
    };

    // --- STATE ---
    const [viewMode, setViewMode] = useState<'sandbox' | 'comparison' | 'thesis' | 'benchmark' | 'settings' | 'explorer'>('sandbox');
    const [selectedProtocolIds, setSelectedProtocolIds] = useState<string[]>([PROTOCOL_PROFILES[0].metadata.id]);
    const [activeProfile, setActiveProfile] = useState<ProtocolProfileV1>(PROTOCOL_PROFILES[0]);
    const [focusChart, setFocusChart] = useState<string | null>(null);

    const [params, setParams] = useState<SimulationParams>({
        T: 52,
        initialSupply: PROTOCOL_PROFILES[0].parameters.supply.value,
        initialPrice: PROTOCOL_PROFILES[0].parameters.initial_price.value,
        maxMintWeekly: PROTOCOL_PROFILES[0].parameters.emissions.value,
        burnPct: PROTOCOL_PROFILES[0].parameters.burn_fraction.value,
        demandType: PROTOCOL_PROFILES[0].parameters.demand_regime.value,
        macro: 'sideways',
        nSims: 25,
        seed: 42,
        providerCostPerWeek: PROTOCOL_PROFILES[0].parameters.provider_economics.opex_weekly.value,
        baseCapacityPerProvider: 180.0,
        hardwareCost: PROTOCOL_PROFILES[0].parameters.hardware_cost.value,
        kDemandPrice: 0.15,
        kMintPrice: 0.35,
        rewardLagWeeks: PROTOCOL_PROFILES[0].parameters.adjustment_lag.value,
        churnThreshold: PROTOCOL_PROFILES[0].parameters.provider_economics.churn_threshold.value,
        initialLiquidity: 500000,
        investorUnlockWeek: 26,
        investorSellPct: 0.05,
        competitorYield: 0.0,
        emissionModel: 'fixed',
        revenueStrategy: 'burn',
        initialProviders: 5000,
        proTierPct: PROTOCOL_PROFILES[0].parameters.pro_tier_pct?.value || 0.0,
        proTierEfficiency: 1.5,
    });

    const [aggregated, setAggregated] = useState<AggregateResult[]>([]);
    const [multiAggregated, setMultiAggregated] = useState<Record<string, AggregateResult[]>>({});
    const [peerWizardAggregated, setPeerWizardAggregated] = useState<Record<string, AggregateResult[]>>({});
    const [loading, setLoading] = useState(false);
    const [autoRun, setAutoRun] = useState(true);
    const [playbackWeek, setPlaybackWeek] = useState(52);
    const [derivedMetrics, setDerivedMetrics] = useState<DerivedMetrics | null>(null);
    const [useNewModel, setUseNewModel] = useState(true);
    const [onocoyHookSnapshots, setOnocoyHookSnapshots] = useState<Record<string, OnocoyProtocolHookSnapshot>>({});

    // --- ACTIONS ---

    const mapNewResultsToAggregate = (newResults: NewAggregateResult[]): AggregateResult[] => {
        return newResults.map(r => ({
            t: r.t,
            price: r.price,
            supply: r.supply,
            demand: r.demand,
            demand_served: r.demandServed,
            providers: r.providers,
            capacity: r.capacity,
            servicePrice: r.servicePrice,
            minted: r.minted,
            burned: r.burned,
            utilization: r.utilisation,
            profit: r.profit,
            scarcity: r.scarcity,
            incentive: r.incentive,
            buyPressure: r.buyPressure,
            sellPressure: r.sellPressure,
            netFlow: r.netFlow,
            churnCount: r.churnCount,
            joinCount: r.joinCount,
            solvencyScore: r.solvencyScore,
            netDailyLoss: r.netDailyLoss,
            dailyMintUsd: r.dailyMintUsd,
            dailyBurnUsd: r.dailyBurnUsd,
            urbanCount: r.urbanCount,
            ruralCount: r.ruralCount,
            weightedCoverage: r.weightedCoverage,
            treasuryBalance: r.treasuryBalance || { mean: 0, p10: 0, p90: 0 },
            vampireChurn: r.vampireChurn || { mean: 0, p10: 0, p90: 0 },
            mercenaryCount: r.mercenaryCount || { mean: 0, p10: 0, p90: 0 },
            proCount: r.proCount || { mean: 0, p10: 0, p90: 0 },
            underwaterCount: r.underwaterCount || { mean: 0, p10: 0, p90: 0 },
            costPerCapacity: r.costPerCapacity || { mean: 0, p10: 0, p90: 0 },
            revenuePerCapacity: r.revenuePerCapacity || { mean: 0, p10: 0, p90: 0 },
            entryBarrierActive: r.entryBarrierActive || { mean: 0, p10: 0, p90: 0 }
        })) as unknown as AggregateResult[];
    };

    const buildOnocoyHookSnapshot = (
        profileId: string,
        aggregate: AggregateResult[],
        localParams: NewSimulationParams
    ): OnocoyProtocolHookSnapshot => {
        const lastPoint = aggregate[aggregate.length - 1];
        const providers = Math.max(1, lastPoint?.providers?.mean || 0);
        const proCount = Math.max(0, lastPoint?.proCount?.mean || 0);
        const churnCount = Math.max(0, lastPoint?.churnCount?.mean || 0);
        const weightedCoverage = Math.max(0, lastPoint?.weightedCoverage?.mean || 0);

        const rewardProxy = computeOnocoyReward({
            baseRewardTokens: 1,
            locationScale: clampUnit(weightedCoverage / providers),
            qualityScale: clampUnit(0.35 + (proCount / providers)),
            availabilityScale: clampUnit(1 - (churnCount / providers))
        });

        const unlockPreview = buildOnocoyUnlockCurve({
            cliffWeek: localParams.investorUnlockWeek,
            cliffTokens: localParams.initialSupply * localParams.investorSellPct,
            streamStartWeek: localParams.investorUnlockWeek + 1,
            streamWeeks: 12,
            streamTokensTotal: (localParams.initialSupply * localParams.investorSellPct) * 0.5
        });

        // No direct integrity telemetry is currently wired; this remains a placeholder proxy.
        const integrityProxy = deriveOnocoyIntegritySignals({
            activeStations: providers,
            spoofingDetections: 0,
            slashingEvents: 0,
            latencyBreaches: 0
        });

        return {
            protocolId: profileId,
            rewardProxy,
            unlockPreview,
            integrityProxy,
            sourceTagIds: [
                'onocoy_reward_fidelity',
                'onocoy_unlock_flow',
                'onocoy_integrity_signals'
            ]
        };
    };

    const buildLocalParams = (
        profile: ProtocolProfileV1,
        isSandbox: boolean,
        overrides: Partial<NewSimulationParams> = {}
    ): NewSimulationParams => {
        const calibration = getDecisionTreeCalibration(profile);
        const calibratedMarket = deriveMarketCalibration(profile, isSandbox);
        const selectedInitialPrice = isSandbox
            ? params.initialPrice
            : profile.parameters.initial_price.value;
        const safePrice = Math.max(selectedInitialPrice, 0.01);
        const emissionRateCap = profile.parameters.supply.value * calibration.emissionCapPctOfSupply;
        const normalizedBaseDemand = Math.max(
            calibration.baseDemandFloor,
            profile.parameters.initial_active_providers.value * params.baseCapacityPerProvider * calibration.targetUtilization
        );
        const providerBreakEvenMint = (
            profile.parameters.initial_active_providers.value *
            profile.parameters.provider_economics.opex_weekly.value
        ) / safePrice;
        const burnBackedMint = (
            profile.parameters.burn_fraction.value *
            ((normalizedBaseDemand * calibration.burnBackedDemandFraction) / safePrice)
        ) * calibration.burnBackedMintMultiplier;
        const structuralMintCap = Math.max(
            providerBreakEvenMint * calibration.breakEvenMintMultiplier,
            burnBackedMint
        );
        const normalizedMaxMintWeekly = isSandbox
            ? params.maxMintWeekly
            : Math.min(profile.parameters.emissions.value, emissionRateCap, structuralMintCap);

        return {
            scenario: params.scenario,
            T: params.T,
            initialSupply: profile.parameters.supply.value,
            initialPrice: selectedInitialPrice,
            initialLiquidity: calibratedMarket.initialLiquidity,
            investorUnlockWeek: params.investorUnlockWeek,
            investorSellPct: calibratedMarket.investorSellPct,
            maxMintWeekly: normalizedMaxMintWeekly,
            burnPct: isSandbox ? params.burnPct : profile.parameters.burn_fraction.value,
            demandType: isSandbox ? params.demandType : profile.parameters.demand_regime.value,
            baseDemand: isSandbox ? calibration.baseDemandFloor : normalizedBaseDemand,
            demandVolatility: 0.05,
            macro: calibratedMarket.macro,
            initialProviders: profile.parameters.initial_active_providers.value,
            baseCapacityPerProvider: params.baseCapacityPerProvider,
            capacityStdDev: 0.2,
            providerCostPerWeek: isSandbox ? params.providerCostPerWeek : profile.parameters.provider_economics.opex_weekly.value,
            costStdDev: 0.15,
            hardwareLeadTime: 2,
            churnThreshold: isSandbox ? params.churnThreshold : profile.parameters.provider_economics.churn_threshold.value,
            profitThresholdToJoin: 15,
            maxProviderGrowthRate: 0.15,
            maxProviderChurnRate: 0.10,
            kBuyPressure: 0.08,
            kSellPressure: 0.12,
            kDemandPrice: params.kDemandPrice,
            kMintPrice: params.kMintPrice,
            baseServicePrice: 0.5,
            servicePriceElasticity: 0.6,
            minServicePrice: 0.05,
            maxServicePrice: 5.0,
            rewardLagWeeks: profile.parameters.adjustment_lag.value,
            nSims: params.nSims,
            seed: params.seed,
            competitorYield: params.competitorYield,
            emissionModel: params.emissionModel,
            revenueStrategy: params.revenueStrategy,
            hardwareCost: isSandbox ? params.hardwareCost : profile.parameters.hardware_cost.value,
            proTierPct: isSandbox ? params.proTierPct : (profile.parameters.pro_tier_pct?.value || 0.0),
            proTierEfficiency: params.proTierEfficiency,
            ...overrides
        };
    };

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
                const localParams = buildLocalParams(profile, isSandbox);
                const protocolModule = getProtocolModule<NewSimulationParams, AggregateResult>(profile.metadata.id);
                const moduleParams = protocolModule.normalizeParams
                    ? protocolModule.normalizeParams(localParams)
                    : localParams;

                let aggregate: AggregateResult[];

                if (useNewModel) {
                    const newResults = runNewSimulation(moduleParams);
                    aggregate = mapNewResultsToAggregate(newResults);
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
                    protocolSnapshots[profile.metadata.id] = buildOnocoyHookSnapshot(profile.metadata.id, aggregate, moduleParams);
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

    useEffect(() => {
        if (autoRun && (viewMode === 'sandbox' || viewMode === 'benchmark')) {
            const timer = setTimeout(() => {
                runSimulation();
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [params, autoRun, viewMode]);

    useEffect(() => { runSimulation(); }, []);

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
                    const peerParams = buildLocalParams(profile, false, {
                        nSims: peerNSims,
                        seed: params.seed
                    });
                    const protocolModule = getProtocolModule<NewSimulationParams, AggregateResult>(profile.metadata.id);
                    const normalizedPeerParams = protocolModule.normalizeParams
                        ? protocolModule.normalizeParams(peerParams)
                        : peerParams;
                    const peerSeries = runNewSimulation(normalizedPeerParams);
                    const mappedPeerSeries = mapNewResultsToAggregate(peerSeries);
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

    return {
        params, setParams,
        aggregated,
        multiAggregated,
        peerWizardAggregated,
        loading,
        autoRun, setAutoRun,
        playbackWeek, setPlaybackWeek,
        derivedMetrics,
        onocoyHookSnapshots,
        onocoyHookSnapshot: onocoyHookSnapshots[activeProfile.metadata.id],
        viewMode, setViewMode,
        selectedProtocolIds,
        activeProfile,
        runSimulation,
        resetToDefaults,
        toggleProtocolSelection,
        loadProfile,
        setSelectedProtocolIds,
        focusChart, setFocusChart,
        useNewModel, setUseNewModel,
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
                    // Ensure we have a threat to defend against
                    const threat = params.competitorYield > 0 ? params.competitorYield : 0.5;
                    const optimalEmission = Optimizer.findRetentionAPY({ ...params, competitorYield: threat });
                    setParams(prev => ({ ...prev, maxMintWeekly: optimalEmission, competitorYield: threat }));
                }
                setLoading(false);
                setLoading(false);
            }, 100);
        },
        runSensitivityAnalysis: () => {
            const isSandbox = viewMode === 'sandbox';
            const localParams = buildLocalParams(activeProfile, isSandbox);
            return Optimizer.runSensitivitySweep(localParams as any);
        }
    };
};
