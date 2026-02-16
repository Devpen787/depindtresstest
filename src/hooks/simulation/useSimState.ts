import { useState } from 'react';
import { PROTOCOL_PROFILES, ProtocolProfileV1 } from '../../data/protocols';
import { SimulationParams, AggregateResult, DerivedMetrics } from '../../model';
import { OnocoyProtocolHookSnapshot } from '../useSimulationRunner';

export const useSimState = () => {
    // --- View & Selection ---
    const [viewMode, setViewMode] = useState<'sandbox' | 'comparison' | 'thesis' | 'benchmark' | 'settings' | 'explorer'>('sandbox');
    const [selectedProtocolIds, setSelectedProtocolIds] = useState<string[]>([PROTOCOL_PROFILES[0].metadata.id]);
    const [activeProfile, setActiveProfile] = useState<ProtocolProfileV1>(PROTOCOL_PROFILES[0]);
    const [focusChart, setFocusChart] = useState<string | null>(null);

    // --- Simulation Parameters ---
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

    // --- Results & Metrics ---
    const [aggregated, setAggregated] = useState<AggregateResult[]>([]);
    const [multiAggregated, setMultiAggregated] = useState<Record<string, AggregateResult[]>>({});
    const [peerWizardAggregated, setPeerWizardAggregated] = useState<Record<string, AggregateResult[]>>({});
    const [loading, setLoading] = useState(false);
    const [autoRun, setAutoRun] = useState(true);
    const [playbackWeek, setPlaybackWeek] = useState(52);
    const [derivedMetrics, setDerivedMetrics] = useState<DerivedMetrics | null>(null);
    const [useNewModel, setUseNewModel] = useState(true);

    // --- Protocol Specific Snapshots ---
    const [onocoyHookSnapshots, setOnocoyHookSnapshots] = useState<Record<string, OnocoyProtocolHookSnapshot>>({});

    return {
        viewMode, setViewMode,
        selectedProtocolIds, setSelectedProtocolIds,
        activeProfile, setActiveProfile,
        focusChart, setFocusChart,
        params, setParams,

        aggregated, setAggregated,
        multiAggregated, setMultiAggregated,
        peerWizardAggregated, setPeerWizardAggregated,
        loading, setLoading,
        autoRun, setAutoRun,
        playbackWeek, setPlaybackWeek,
        derivedMetrics, setDerivedMetrics,
        useNewModel, setUseNewModel,
        onocoyHookSnapshots, setOnocoyHookSnapshots
    };
};
