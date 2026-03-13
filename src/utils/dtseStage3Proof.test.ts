import { describe, expect, it } from 'vitest';
import { PROTOCOL_PROFILES } from '../data/protocols';
import { loadDTSESavedScenarioPack } from '../data/dtseSavedScenarioLoader';
import { DTSE_STRESS_CHANNEL_OPTIONS } from './dtseStressChannel';
import { resolveDTSEStage3Proof } from './dtseStage3Proof';

describe('dtseStage3Proof matrix', () => {
  it('resolves a coherent Stage 3 proof state for every saved protocol and stress pack', async () => {
    for (const profile of PROTOCOL_PROFILES) {
      for (const stressOption of DTSE_STRESS_CHANNEL_OPTIONS) {
        const pack = await loadDTSESavedScenarioPack(profile.metadata.id, stressOption.id);
        expect(pack, `${profile.metadata.id}::${stressOption.id}`).toBeDefined();
        expect(pack?.sequenceView, `${profile.metadata.id}::${stressOption.id} sequence`).not.toBeNull();
        if (!pack?.sequenceView) continue;

        const proof = resolveDTSEStage3Proof(pack.sequenceView);
        const expectedLeadRow = pack.sequenceView.pathway.find((row) => (
          row.label === pack.sequenceView?.earliestTriggerLabel
          && row.triggerWeek === pack.sequenceView?.earliestTriggerWeek
        )) ?? pack.sequenceView.pathway.find((row) => row.triggerWeek !== null) ?? pack.sequenceView.pathway[0] ?? null;

        expect(proof.leadBreakLabel, `${profile.metadata.id}::${stressOption.id} lead label`).toBe(
          pack.sequenceView.earliestTriggerLabel ?? expectedLeadRow?.label ?? 'No early break detected',
        );
        expect(proof.firstBreakWeek, `${profile.metadata.id}::${stressOption.id} lead week`).toBe(
          pack.sequenceView.earliestTriggerWeek ?? expectedLeadRow?.triggerWeek ?? null,
        );

        if (proof.canShowDriftProofChart) {
          expect(proof.firstMarkedWeek, `${profile.metadata.id}::${stressOption.id} proof week`).not.toBeNull();
          expect(proof.firstMarkedValue, `${profile.metadata.id}::${stressOption.id} proof value`).not.toBeNull();
          expect(proof.firstMarkedWeek!, `${profile.metadata.id}::${stressOption.id} proof lower bound`).toBeGreaterThanOrEqual(proof.firstBreakWeek ?? 0);
          expect(proof.firstMarkedWeek!, `${profile.metadata.id}::${stressOption.id} proof upper bound`).toBeLessThanOrEqual((proof.firstBreakWeek ?? 0) + 6);

          switch (expectedLeadRow?.familyId) {
            case 'profitability':
              expect(['profitabilityDeltaPct', 'solvencyDeltaPct']).toContain(proof.primaryDriftKey);
              break;
            case 'utilization':
              expect(proof.primaryDriftKey).toBe('utilizationDeltaPct');
              break;
            case 'solvency_proxy':
              expect(proof.primaryDriftKey).toBe('solvencyDeltaPct');
              break;
            case 'modeled_price':
              expect(proof.primaryDriftKey).toBe('priceDeltaPct');
              break;
            case 'retention_churn':
              expect(proof.primaryDriftKey).toBe('retentionDeltaPct');
              break;
            default:
              break;
          }
        } else {
          expect(proof.driftProofUnavailableReason, `${profile.metadata.id}::${stressOption.id} proof withheld reason`).toMatch(/withheld/i);
        }
      }
    }
  }, 45000);

  it('uses retention / churn as the lead Stage 3 family for ONOCOY competitive-yield pressure', async () => {
    const pack = await loadDTSESavedScenarioPack('ono_v3_calibrated', 'competitive_yield_pressure');
    expect(pack).toBeDefined();
    expect(pack?.sequenceView).not.toBeNull();
    if (!pack?.sequenceView) return;

    const proof = resolveDTSEStage3Proof(pack.sequenceView);

    expect(pack.sequenceView.earliestTriggerLabel).toBe('Retention / Churn');
    expect(pack.sequenceView.earliestTriggerWeek).toBe(1);
    expect(proof.leadBreakLabel).toBe('Retention / Churn');
    expect(proof.firstBreakWeek).toBe(1);
    expect(proof.primaryDriftKey).toBe('retentionDeltaPct');
    expect(proof.canShowDriftProofChart).toBe(true);
  });
});
