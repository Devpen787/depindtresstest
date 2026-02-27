import { describe, it, expect } from 'vitest';
import { PROTOCOL_PROFILES } from './protocols';
import {
    DTSE_PROTOCOL_PACKS,
    getDTSEProtocolPack,
    buildDTSEProtocolPack,
} from './dtseContent';

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
    for (const profile of PROTOCOL_PROFILES) {
        it(`builds a complete dashboard pack for ${profile.metadata.id}`, () => {
            const pack = buildDTSEProtocolPack(profile);

            expect(pack.runContext.protocol_id).toBe(profile.metadata.id);
            expect(pack.protocolBrief.protocol_id).toBe(profile.metadata.id);
            expect(pack.protocolBrief.protocol_name).toBe(profile.metadata.name);

            expect(pack.applicability.length).toBe(APPLICABILITY_METRICS.length);
            for (const metricId of APPLICABILITY_METRICS) {
                expect(pack.applicability.some((entry) => entry.metricId === metricId)).toBe(true);
            }

            for (const metricId of STANDARD_METRICS) {
                expect(pack.outcomes.some((outcome) => outcome.metric_id === metricId)).toBe(true);
            }
            expect(pack.outcomes.some((outcome) => outcome.metric_id === 'stress_resilience_index')).toBe(true);

            expect(pack.failureSignatures.length).toBeGreaterThan(0);
            expect(pack.recommendations.length).toBeGreaterThan(0);

            expect(Array.isArray(pack.runContext.weekly_solvency)).toBe(true);
            expect(pack.runContext.weekly_solvency?.length).toBe(pack.runContext.horizon_weeks);
            expect(pack.runContext.weekly_solvency?.every((point) => Number.isFinite(point))).toBe(true);
            const finalSolvency = pack.outcomes.find((outcome) => outcome.metric_id === 'solvency_ratio')?.value;
            const finalSeriesPoint = pack.runContext.weekly_solvency?.[pack.runContext.weekly_solvency.length - 1];
            expect(finalSeriesPoint).toBeCloseTo(finalSolvency ?? 1, 3);
        });
    }
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
