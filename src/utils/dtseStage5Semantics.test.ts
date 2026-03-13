import { describe, expect, it } from 'vitest';
import { PROTOCOL_PROFILES } from '../data/protocols';
import { loadDTSESavedScenarioPack } from '../data/dtseSavedScenarioLoader';
import { DTSE_STRESS_CHANNEL_OPTIONS } from './dtseStressChannel';

const recommendationIdBySignatureId: Record<string, string> = {
  'reward-demand-decoupling': 'live-response-reward-demand-decoupling',
  'liquidity-driven-compression': 'live-response-liquidity-driven-compression',
  'elastic-provider-exit': 'live-response-elastic-provider-exit',
  'profitability-induced-churn': 'live-response-profitability-induced-churn',
  'latent-capacity-degradation': 'live-response-latent-capacity-degradation',
};

describe('dtseStage5 semantics matrix', () => {
  it('keeps the top Stage 5 recommendation aligned with the top Stage 4 signature for every saved scenario pack', async () => {
    for (const profile of PROTOCOL_PROFILES) {
      for (const stressOption of DTSE_STRESS_CHANNEL_OPTIONS) {
        const pack = await loadDTSESavedScenarioPack(profile.metadata.id, stressOption.id);
        expect(pack, `${profile.metadata.id}::${stressOption.id}`).toBeDefined();
        if (!pack) continue;

        if (pack.failureSignatures.length === 0) {
          expect(pack.recommendations).toHaveLength(1);
          expect(pack.recommendations[0]?.id, `${profile.metadata.id}::${stressOption.id} monitoring`).toBe('live-response-monitoring');
          continue;
        }

        const leadSignature = pack.failureSignatures[0];
        const expectedRecommendationId = recommendationIdBySignatureId[leadSignature.id];

        expect(expectedRecommendationId, `${profile.metadata.id}::${stressOption.id} mapped recommendation`).toBeTruthy();
        expect(pack.recommendations.length, `${profile.metadata.id}::${stressOption.id} recommendations`).toBeGreaterThan(0);
        expect(pack.recommendations[0]?.id, `${profile.metadata.id}::${stressOption.id} top recommendation`).toBe(expectedRecommendationId);
        expect(pack.recommendations[0]?.rationale, `${profile.metadata.id}::${stressOption.id} rationale`).toBeTruthy();
        expect(pack.recommendations[0]?.action, `${profile.metadata.id}::${stressOption.id} action`).toBeTruthy();
      }
    }
  }, 45000);
});
