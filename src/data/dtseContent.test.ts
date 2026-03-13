import { describe, it, expect } from 'vitest';
import { PROTOCOL_PROFILES } from './protocols';
import {
    DTSE_PROTOCOL_PACKS,
    getDTSEProtocolPack,
    buildDTSEProtocolPack,
} from './dtseContent';
import { DTSE_SAVED_SCENARIO_PROTOCOL_IDS } from './generated/dtseSavedScenarioPacks.manifest.generated';
import { DTSE_PEER_ANALOGS } from './dtsePeerAnalogs';
import { makeDTSESavedScenarioPackKey } from './dtseSavedScenarios';
import { loadDTSESavedScenarioPack } from './dtseSavedScenarioLoader';
import { DTSE_STRESS_CHANNEL_OPTIONS, resolveDTSEStressChannelSelection } from '../utils/dtseStressChannel';

const STANDARD_METRICS = [
    'solvency_ratio',
    'payback_period',
    'weekly_retention_rate',
    'network_utilization',
    'tail_risk_score',
];

const APPLICABILITY_METRICS = [
    ...STANDARD_METRICS,
    'vampire_churn',
];

describe('DTSE protocol pack coverage', () => {
    it('has one raw protocol pack per generated profile', () => {
        expect(Object.keys(DTSE_PROTOCOL_PACKS).length).toBe(PROTOCOL_PROFILES.length);
    });

    it('covers every generated profile id', () => {
        for (const profile of PROTOCOL_PROFILES) {
            expect(DTSE_PROTOCOL_PACKS[profile.metadata.id]).toBeDefined();
        }
    });

    it('does not include orphan protocol ids', () => {
        const profileIds = new Set(PROTOCOL_PROFILES.map((profile) => profile.metadata.id));
        for (const packId of Object.keys(DTSE_PROTOCOL_PACKS)) {
            expect(profileIds.has(packId)).toBe(true);
        }
    });
});

describe('buildDTSEProtocolPack', () => {
    it('has a generated saved scenario pack for every protocol and stress combination', async () => {
        expect(new Set(DTSE_SAVED_SCENARIO_PROTOCOL_IDS)).toEqual(
            new Set(PROTOCOL_PROFILES.map((profile) => profile.metadata.id)),
        );

        for (const profile of PROTOCOL_PROFILES) {
            for (const stressOption of DTSE_STRESS_CHANNEL_OPTIONS) {
                const key = makeDTSESavedScenarioPackKey(profile.metadata.id, stressOption.id);
                const pack = await loadDTSESavedScenarioPack(profile.metadata.id, stressOption.id);
                expect(pack).toBeDefined();
                expect(pack?.runContext.protocol_id).toBe(profile.metadata.id);
                expect(makeDTSESavedScenarioPackKey(pack?.runContext.protocol_id ?? '', pack?.runContext.stress_channel?.id ?? 'baseline_neutral')).toBe(key);
            }
        }
    }, 45000);

    for (const profile of PROTOCOL_PROFILES) {
        it(`builds a complete dashboard pack for ${profile.metadata.id}`, () => {
            const pack = buildDTSEProtocolPack(profile);

            expect(pack.runContext.protocol_id).toBe(profile.metadata.id);
            expect(pack.protocolBrief.protocol_id).toBe(profile.metadata.id);
            expect(pack.protocolBrief.protocol_name).toBe(profile.metadata.name);
            expect(pack.protocolBrief.mechanism).toBeTruthy();
            expect(pack.protocolBrief.supply_count).toBeGreaterThan(0);
            expect(pack.protocolBrief.supply_unit).toBeTruthy();
            expect(['Capped', 'Uncapped', 'Elastic']).toContain(pack.protocolBrief.supply_structure);
            expect(pack.protocolBrief.token_price_usd).toBeGreaterThanOrEqual(0);
            expect(pack.protocolBrief.market_cap_usd).toBeGreaterThanOrEqual(0);
            expect(pack.protocolBrief.weekly_emissions).toBeGreaterThanOrEqual(0);
            expect(pack.protocolBrief.burn_fraction_pct).toBeGreaterThanOrEqual(0);
            expect(pack.protocolBrief.active_providers).toBeGreaterThanOrEqual(0);

            expect(pack.applicability.length).toBe(APPLICABILITY_METRICS.length);
            for (const metricId of APPLICABILITY_METRICS) {
                expect(pack.applicability.some((entry) => entry.metricId === metricId)).toBe(true);
            }

            for (const metricId of STANDARD_METRICS) {
                expect(pack.outcomes.some((outcome) => outcome.metric_id === metricId)).toBe(true);
            }
            expect(pack.outcomes.some((outcome) => outcome.metric_id === 'stress_resilience_index')).toBe(false);

            expect(pack.recommendations.length).toBeGreaterThan(0);
            expect(pack.failureSignatures.every((signature) => [
                'Reward–Demand Decoupling',
                'Profitability-Induced Churn',
                'Liquidity-Driven Compression',
                'Elastic Provider Exit',
                'Latent Capacity Degradation',
            ].includes(signature.label))).toBe(true);
            expect(pack.recommendations.every((recommendation) => (
                recommendation.action.startsWith('Rerun ') || recommendation.action.startsWith('Review ')
            ))).toBe(true);

            const stressedMetricIds = new Set(
                pack.outcomes
                    .filter((outcome) => outcome.band !== 'healthy')
                    .map((outcome) => outcome.metric_id),
            );
            if (pack.failureSignatures.length > 0) {
                expect(pack.failureSignatures.every((signature) => (
                    signature.affected_metrics.some((metricId) => stressedMetricIds.has(metricId))
                ))).toBe(true);
            }

            if (DTSE_PEER_ANALOGS[profile.metadata.id] && pack.failureSignatures.length > 0) {
                expect(pack.recommendations.some((recommendation) => Boolean(recommendation.peer_analog))).toBe(true);
            }

            expect(Array.isArray(pack.runContext.weekly_solvency)).toBe(true);
            expect(pack.runContext.weekly_solvency?.length).toBe(pack.runContext.horizon_weeks);
            expect(pack.runContext.weekly_solvency?.every((point) => Number.isFinite(point))).toBe(true);
            const finalSolvency = pack.outcomes.find((outcome) => outcome.metric_id === 'solvency_ratio')?.value;
            const finalSeriesPoint = pack.runContext.weekly_solvency?.[pack.runContext.weekly_solvency.length - 1];
            expect(finalSeriesPoint).toBeCloseTo(finalSolvency ?? 1, 2);
            expect(pack.sequenceView).toBeNull();
        });
    }

    it('contains protocol-specific applicability rationale for every pack', () => {
        const applicabilitySignatures = new Set<string>();

        for (const profile of PROTOCOL_PROFILES) {
            const pack = buildDTSEProtocolPack(profile);
            const hasSpecificApplicability = pack.applicability.some((entry) => (
                entry.reasonCode !== 'DATA_AVAILABLE' || Boolean(entry.details)
            ));
            expect(hasSpecificApplicability).toBe(true);

            const signature = pack.applicability
                .map((entry) => `${entry.metricId}:${entry.verdict}:${entry.reasonCode}`)
                .sort()
                .join('|');
            applicabilitySignatures.add(signature);
        }

        expect(applicabilitySignatures.size).toBeGreaterThanOrEqual(2);
    });

    it('builds stress-aware base packs from the selected DTSE stress channel', () => {
        const profile = PROTOCOL_PROFILES.find((candidate) => candidate.metadata.id === 'ono_v3_calibrated');
        expect(profile).toBeDefined();
        if (!profile) return;

        const baselineStress = resolveDTSEStressChannelSelection('baseline_neutral', profile).stressChannel;
        const liquidityStress = resolveDTSEStressChannelSelection('liquidity_shock', profile).stressChannel;
        const competitiveStress = resolveDTSEStressChannelSelection('competitive_yield_pressure', profile).stressChannel;

        const baselinePack = buildDTSEProtocolPack(profile, baselineStress);
        const liquidityPack = buildDTSEProtocolPack(profile, liquidityStress);
        const competitivePack = buildDTSEProtocolPack(profile, competitiveStress);

        expect(liquidityPack.runContext.stress_channel?.id).toBe('liquidity_shock');
        expect(liquidityPack.runContext.scenario_grid_id).toContain('liquidity_shock');
        expect(competitivePack.runContext.stress_channel?.id).toBe('competitive_yield_pressure');
        expect(competitivePack.runContext.scenario_grid_id).toContain('competitive_yield_pressure');

        const baselineSolvency = baselinePack.outcomes.find((outcome) => outcome.metric_id === 'solvency_ratio')?.value ?? 0;
        const liquiditySolvency = liquidityPack.outcomes.find((outcome) => outcome.metric_id === 'solvency_ratio')?.value ?? 0;
        const baselinePayback = baselinePack.outcomes.find((outcome) => outcome.metric_id === 'payback_period')?.value ?? 0;
        const liquidityPayback = liquidityPack.outcomes.find((outcome) => outcome.metric_id === 'payback_period')?.value ?? 0;

        expect(liquidityPack.runContext.bundle_hash).not.toBe(baselinePack.runContext.bundle_hash);
        expect(liquiditySolvency).not.toBe(baselineSolvency);
        expect(liquidityPayback).not.toBe(baselinePayback);
        expect(liquidityPack.failureSignatures.some((signature) => signature.id === 'liquidity-driven-compression')).toBe(true);
        expect(competitivePack.failureSignatures.some((signature) => signature.id === 'elastic-provider-exit')).toBe(true);
        expect(liquidityPack.sequenceView).toBeNull();
        expect(liquidityPack.runContext.bundle_hash).toContain('saved:ono_v3_calibrated:liquidity_shock');

        expect(
            baselinePack.applicability.find((entry) => entry.metricId === 'vampire_churn')?.verdict,
        ).toBe('NR');
        expect(
            competitivePack.applicability.find((entry) => entry.metricId === 'vampire_churn')?.verdict,
        ).toBe('R');
    });
});

describe('getDTSEProtocolPack', () => {
    it('returns pack for valid id', () => {
        const id = PROTOCOL_PROFILES[0]?.metadata.id;
        expect(id).toBeTruthy();
        if (!id) return;
        const pack = getDTSEProtocolPack(id);
        expect(pack.protocolId).toBe(id);
    });

    it('throws on unknown id', () => {
        expect(() => getDTSEProtocolPack('unknown_protocol')).toThrow(/No protocol pack found/);
    });
});
