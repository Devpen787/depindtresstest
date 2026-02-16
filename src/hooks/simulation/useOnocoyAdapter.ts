import {
    OnChainMetrics
} from '../../services/dune';
import {
    AggregateResult,
    SimulationParams as NewSimulationParams
} from '../../model';
import {
    buildOnocoyUnlockCurve,
    computeOnocoyReward,
    deriveOnocoyIntegritySignals,
    OnocoyIntegritySignals,
    OnocoyRewardBreakdown,
    OnocoyUnlockPoint
} from '../../protocols/onocoy';

export interface OnocoyProtocolHookSnapshot {
    protocolId: string;
    rewardProxy: OnocoyRewardBreakdown;
    unlockPreview: OnocoyUnlockPoint[];
    integrityProxy: OnocoyIntegritySignals;
    sourceTagIds: string[];
    missingInputs: Array<{
        key: string;
        description: string;
        status: 'missing' | 'proxy_only';
    }>;
    rewardSource: 'telemetry' | 'proxy';
    unlockSource: 'telemetry' | 'proxy';
    integritySource: 'telemetry' | 'proxy';
    telemetrySourceType?: string;
    telemetryLastUpdated?: string;
}

export const useOnocoyAdapter = () => {
    const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

    const buildOnocoyHookSnapshot = (
        profileId: string,
        aggregate: AggregateResult[],
        localParams: NewSimulationParams,
        telemetry: (OnChainMetrics & { sourceType?: string }) | null | undefined
    ): OnocoyProtocolHookSnapshot => {
        const lastPoint = aggregate[aggregate.length - 1];
        const providers = Math.max(1, lastPoint?.providers?.mean || 0);
        const proCount = Math.max(0, lastPoint?.proCount?.mean || 0);
        const churnCount = Math.max(0, lastPoint?.churnCount?.mean || 0);
        const weightedCoverage = Math.max(0, lastPoint?.weightedCoverage?.mean || 0);

        const rewardLocationProxy = clampUnit(weightedCoverage / providers);
        const rewardQualityProxy = clampUnit(0.35 + (proCount / providers));
        const rewardAvailabilityProxy = clampUnit(1 - (churnCount / providers));

        const hasRewardTelemetry = Boolean(
            telemetry &&
            (
                (telemetry.activeNodes24h > 0 && telemetry.activeNodesTotal > 0) ||
                telemetry.networkUptime > 0 ||
                telemetry.avgRewardPerNode > 0
            )
        );

        const rewardLocationScale = hasRewardTelemetry && telemetry && telemetry.activeNodesTotal > 0
            ? clampUnit(telemetry.activeNodes24h / telemetry.activeNodesTotal)
            : rewardLocationProxy;
        const rewardQualityScale = hasRewardTelemetry && telemetry && telemetry.networkUptime > 0
            ? clampUnit(telemetry.networkUptime / 100)
            : rewardQualityProxy;
        const rewardAvailabilityScale = hasRewardTelemetry && telemetry && telemetry.avgRewardPerNode > 0
            ? clampUnit(telemetry.avgRewardPerNode / 25)
            : rewardAvailabilityProxy;

        const rewardProxy = computeOnocoyReward({
            baseRewardTokens: 1,
            locationScale: rewardLocationScale,
            qualityScale: rewardQualityScale,
            availabilityScale: rewardAvailabilityScale
        });

        const unlockSource: 'telemetry' | 'proxy' = 'proxy';
        const unlockPreview = buildOnocoyUnlockCurve({
            cliffWeek: localParams.investorUnlockWeek,
            cliffTokens: localParams.initialSupply * localParams.investorSellPct,
            streamStartWeek: localParams.investorUnlockWeek + 1,
            streamWeeks: 12,
            streamTokensTotal: (localParams.initialSupply * localParams.investorSellPct) * 0.5
        });

        const hasIntegrityTelemetry = Boolean(
            telemetry &&
            (
                telemetry.networkUptime > 0 ||
                telemetry.activeNodes24h > 0
            )
        );
        const integrityActiveStations = hasIntegrityTelemetry && telemetry
            ? Math.max(1, telemetry.activeNodes24h || telemetry.activeNodesTotal || providers)
            : providers;
        const uptimeScale = hasIntegrityTelemetry && telemetry
            ? clampUnit(telemetry.networkUptime / 100)
            : clampUnit(1 - (churnCount / providers));
        const latencyBreaches = Math.round((1 - uptimeScale) * integrityActiveStations);

        const integrityProxy = deriveOnocoyIntegritySignals({
            activeStations: integrityActiveStations,
            spoofingDetections: 0,
            slashingEvents: 0,
            latencyBreaches
        });

        const rewardSource: 'telemetry' | 'proxy' = hasRewardTelemetry ? 'telemetry' : 'proxy';
        const integritySource: 'telemetry' | 'proxy' = hasIntegrityTelemetry ? 'telemetry' : 'proxy';
        const missingInputs: OnocoyProtocolHookSnapshot['missingInputs'] = [
            {
                key: 'spoofingDetections',
                description: 'Direct spoofing detection counts are not in the telemetry feed yet.',
                status: 'missing'
            },
            {
                key: 'slashingEvents',
                description: 'Direct slashing-event counts are not in the telemetry feed yet.',
                status: 'missing'
            },
            {
                key: 'canonicalUnlockEvents',
                description: 'Vesting/contract-level unlock events are not wired; unlock card uses scenario proxy.',
                status: 'proxy_only'
            }
        ];

        return {
            protocolId: profileId,
            rewardProxy,
            unlockPreview,
            integrityProxy,
            sourceTagIds: [
                rewardSource === 'telemetry' ? 'onocoy_reward_telemetry' : 'onocoy_reward_fidelity',
                'onocoy_unlock_flow',
                integritySource === 'telemetry' ? 'onocoy_integrity_telemetry' : 'onocoy_integrity_signals'
            ],
            missingInputs,
            rewardSource,
            unlockSource,
            integritySource,
            telemetrySourceType: telemetry?.sourceType,
            telemetryLastUpdated: telemetry?.lastUpdated
        };
    };

    return { buildOnocoyHookSnapshot };
};
