import { describe, expect, it } from 'vitest';
import { DEFAULT_PARAMS } from '../../model';
import { PROTOCOL_PROFILES } from '../../data/protocols';
import { useSimEngine } from './useSimEngine';

function getProfile(id: string) {
  const profile = PROTOCOL_PROFILES.find((entry) => entry.metadata.id === id);
  if (!profile) {
    throw new Error(`Missing profile: ${id}`);
  }
  return profile;
}

describe('useSimEngine runtime structural calibration', () => {
  it('injects Helium structural defaults when params do not override them', () => {
    const engine = useSimEngine();
    const helium = getProfile('helium_bme_v1');

    const local = engine.buildLocalParams(helium, false, {
      ...DEFAULT_PARAMS,
      seed: 2026,
      nSims: 12,
    });

    expect(local.preorderBacklogFraction).toBeCloseTo(0.8743521455, 6);
    expect(local.preorderReleaseWeeks).toBe(12);
    expect(local.sunkCostChurnDamping).toBeCloseTo(0.3168906988, 6);
  });

  it('leaves non-Helium profiles on neutral structural defaults', () => {
    const engine = useSimEngine();
    const onocoy = getProfile('ono_v3_calibrated');

    const local = engine.buildLocalParams(onocoy, false, {
      ...DEFAULT_PARAMS,
      seed: 2026,
      nSims: 12,
    });

    expect(local.preorderBacklogFraction).toBe(0);
    expect(local.preorderReleaseWeeks).toBe(0);
    expect(local.sunkCostChurnDamping).toBe(0);
  });
});
