import { describe, expect, it } from 'vitest';
import { PROTOCOL_PROFILES } from '../data/protocols';
import { loadDTSESavedScenarioPack } from '../data/dtseSavedScenarioLoader';
import { DTSE_STRESS_CHANNEL_OPTIONS } from './dtseStressChannel';

const expectedLeadSignatureId = (
  familyId: string | undefined,
  stressId: string,
): string | null => {
  switch (familyId) {
    case 'profitability':
    case 'solvency_proxy':
      return 'reward-demand-decoupling';
    case 'utilization':
      return 'latent-capacity-degradation';
    case 'modeled_price':
      return 'liquidity-driven-compression';
    case 'retention_churn':
      return stressId === 'competitive_yield_pressure'
        ? 'elastic-provider-exit'
        : 'profitability-induced-churn';
    default:
      return null;
  }
};

describe('dtseStage4 semantics matrix', () => {
  it('keeps the lead Stage 4 signature aligned with the Stage 3 first-break family for every saved scenario pack', async () => {
    for (const profile of PROTOCOL_PROFILES) {
      for (const stressOption of DTSE_STRESS_CHANNEL_OPTIONS) {
        const pack = await loadDTSESavedScenarioPack(profile.metadata.id, stressOption.id);
        expect(pack, `${profile.metadata.id}::${stressOption.id}`).toBeDefined();
        expect(pack?.sequenceView, `${profile.metadata.id}::${stressOption.id} sequence`).not.toBeNull();
        if (!pack?.sequenceView) continue;

        const leadRow = pack.sequenceView.pathway.find((row) => (
          row.label === pack.sequenceView?.earliestTriggerLabel
          && row.triggerWeek === pack.sequenceView?.earliestTriggerWeek
        )) ?? pack.sequenceView.pathway.find((row) => row.triggerWeek !== null);
        const expectedSignatureId = expectedLeadSignatureId(leadRow?.familyId, stressOption.id);

        if (!expectedSignatureId) continue;

        expect(pack.failureSignatures.length, `${profile.metadata.id}::${stressOption.id} signatures`).toBeGreaterThan(0);
        expect(pack.failureSignatures[0]?.id, `${profile.metadata.id}::${stressOption.id} lead signature`).toBe(expectedSignatureId);
        expect(
          pack.failureSignatures[0]?.affected_metrics.some((metricId) => (
            leadRow?.familyId === 'profitability'
              ? ['solvency_ratio', 'payback_period'].includes(metricId)
              : leadRow?.familyId === 'utilization'
                ? ['network_utilization'].includes(metricId)
                : leadRow?.familyId === 'solvency_proxy'
                  ? ['solvency_ratio'].includes(metricId)
                  : leadRow?.familyId === 'modeled_price'
                    ? ['tail_risk_score', 'solvency_ratio'].includes(metricId)
                    : ['weekly_retention_rate', 'vampire_churn', 'payback_period'].includes(metricId)
          )),
          `${profile.metadata.id}::${stressOption.id} lead signature metrics`,
        ).toBe(true);
      }
    }
  }, 45000);
});
