import { describe, expect, it } from 'vitest';
import { getProtocolModule } from './registry';
import { computeOnocoyReward, buildOnocoyUnlockCurve, deriveOnocoyIntegritySignals } from './onocoy';

describe('protocol registry scaffolding', () => {
    it('matches Onocoy module by generated profile id', () => {
        const module = getProtocolModule('ono_v3_calibrated');
        expect(module.id).toBe('onocoy');
    });

    it('falls back to default module when unknown', () => {
        const module = getProtocolModule('unknown_protocol');
        expect(module.id).toBe('default');
    });
});

describe('onocoy helper scaffolds', () => {
    it('computes multiplicative reward factors', () => {
        const reward = computeOnocoyReward({
            baseRewardTokens: 100,
            locationScale: 0.8,
            qualityScale: 0.9,
            availabilityScale: 1
        });

        expect(reward.rewardTokens).toBeCloseTo(72);
    });

    it('builds cliff plus stream unlock curve', () => {
        const points = buildOnocoyUnlockCurve({
            cliffWeek: 1,
            cliffTokens: 100,
            streamStartWeek: 2,
            streamWeeks: 4,
            streamTokensTotal: 200
        });

        expect(points).toHaveLength(5);
        expect(points[0].phase).toBe('cliff');
        expect(points[4].cumulativeUnlockedTokens).toBeCloseTo(300);
    });

    it('derives integrity pressure score from rates', () => {
        const signals = deriveOnocoyIntegritySignals({
            activeStations: 1000,
            spoofingDetections: 10,
            slashingEvents: 5,
            latencyBreaches: 20
        });

        expect(signals.integrityPressureScore).toBeGreaterThan(0);
        expect(signals.integrityPressureScore).toBeLessThanOrEqual(100);
    });
});
