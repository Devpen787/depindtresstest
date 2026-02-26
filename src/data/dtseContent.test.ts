import { describe, it, expect } from 'vitest';
import { GENERATED_PROTOCOL_PROFILES } from '@/data/generated/protocolProfiles.generated';
import { DTSE_PROTOCOL_PACKS, getDTSEProtocolPack } from '@/data/dtseContent';

const generatedIds = GENERATED_PROTOCOL_PROFILES.map((p) => p.metadata.id);

describe('DTSE Protocol Packs coverage', () => {
    it('every generated protocol ID has a DTSE pack', () => {
        for (const id of generatedIds) {
            expect(DTSE_PROTOCOL_PACKS).toHaveProperty(id);
        }
    });

    it('every DTSE pack ID exists in generated profiles', () => {
        for (const id of Object.keys(DTSE_PROTOCOL_PACKS)) {
            expect(generatedIds).toContain(id);
        }
    });

    it('pack count matches generated profile count (1:1)', () => {
        expect(Object.keys(DTSE_PROTOCOL_PACKS).length).toBe(generatedIds.length);
    });

    describe.each(Object.entries(DTSE_PROTOCOL_PACKS))('%s pack completeness', (_id, pack) => {
        it('has non-empty outcomes', () => {
            expect(pack.runContext.outcomes!.length).toBeGreaterThan(0);
        });

        it('has non-empty failure_signatures', () => {
            expect(pack.runContext.failure_signatures!.length).toBeGreaterThan(0);
        });

        it('has non-empty recommendations', () => {
            expect(pack.runContext.recommendations!.length).toBeGreaterThan(0);
        });

        it('has non-empty applicability', () => {
            expect(pack.applicability.length).toBeGreaterThan(0);
        });

        it('has all 5 standard outcome metrics', () => {
            const metricIds = pack.runContext.outcomes!.map((o) => o.metric_id).sort();
            expect(metricIds).toEqual([
                'network_utilization',
                'payback_period',
                'solvency_ratio',
                'tail_risk_score',
                'weekly_retention_rate',
            ]);
        });

        it('has applicability entries for all 6 standard metrics', () => {
            const applicMetrics = pack.applicability.map((a) => a.metricId).sort();
            expect(applicMetrics).toEqual([
                'network_utilization',
                'payback_period',
                'solvency_ratio',
                'tail_risk_score',
                'vampire_churn',
                'weekly_retention_rate',
            ]);
        });

        it('protocolId matches the registry key', () => {
            expect(pack.protocolId).toBe(_id);
        });

        it('runContext.protocol_id matches pack protocolId', () => {
            expect(pack.runContext.protocol_id).toBe(pack.protocolId);
        });
    });

    describe('getDTSEProtocolPack', () => {
        it('returns the correct pack for a valid ID', () => {
            const pack = getDTSEProtocolPack('ono_v3_calibrated');
            expect(pack.protocolName).toBe('ONOCOY');
        });

        it('throws for an unknown protocol ID', () => {
            expect(() => getDTSEProtocolPack('nonexistent_protocol')).toThrowError(
                /No protocol pack found for "nonexistent_protocol"/,
            );
        });
    });
});
