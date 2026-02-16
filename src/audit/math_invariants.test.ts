import { describe, expect, it } from 'vitest';
import { runSimulation, simulateOne } from '../model/simulation';
import type { AggregateResult, SimulationParams } from '../model/types';

function makeBaseParams(seed: number): SimulationParams {
  return {
    T: 26,
    initialSupply: 120_000_000,
    initialPrice: 0.9,
    maxMintWeekly: 750_000,
    burnPct: 0.2,
    initialLiquidity: 2_000_000,
    investorUnlockWeek: 20,
    investorSellPct: 0.05,
    scenario: 'baseline',
    demandType: 'growth',
    baseDemand: 18_000,
    demandVolatility: 0.08,
    macro: 'sideways',
    initialProviders: 1_200,
    baseCapacityPerProvider: 140,
    capacityStdDev: 0.2,
    providerCostPerWeek: 55,
    costStdDev: 0.1,
    hardwareLeadTime: 3,
    churnThreshold: -30,
    profitThresholdToJoin: 12,
    maxProviderGrowthRate: 0.12,
    maxProviderChurnRate: 0.15,
    kBuyPressure: 0.00012,
    kSellPressure: 0.00012,
    kDemandPrice: 0.0002,
    kMintPrice: 0.00012,
    baseServicePrice: 0.015,
    servicePriceElasticity: 0.4,
    minServicePrice: 0.001,
    maxServicePrice: 0.08,
    rewardLagWeeks: 2,
    nSims: 10,
    seed,
    competitorYield: 0.0,
    emissionModel: 'fixed',
    revenueStrategy: 'burn',
    networkEffectsEnabled: false,
    hardwareCost: 900,
    proTierPct: 0.3,
    proTierEfficiency: 1.5,
    sybilAttackEnabled: false,
    sybilSize: 0,
  };
}

function randomParams(seed: number): SimulationParams {
  const base = makeBaseParams(seed);
  const r = (offset: number, min: number, max: number) => {
    const x = Math.sin((seed + offset) * 991.13) * 43758.5453;
    const unit = x - Math.floor(x);
    return min + (unit * (max - min));
  };

  const demandTypes: SimulationParams['demandType'][] = ['consistent', 'high-to-decay', 'growth', 'volatile'];
  const macroTypes: SimulationParams['macro'][] = ['sideways', 'bearish', 'bullish', 'neutral'];

  return {
    ...base,
    initialSupply: Math.round(r(1, 5_000_000, 600_000_000)),
    initialPrice: r(2, 0.02, 8),
    maxMintWeekly: Math.round(r(3, 20_000, 6_000_000)),
    burnPct: r(4, 0, 0.9),
    initialLiquidity: Math.round(r(5, 100_000, 100_000_000)),
    investorUnlockWeek: Math.floor(r(6, 4, base.T - 1)),
    investorSellPct: r(7, 0, 0.2),
    demandType: demandTypes[Math.floor(r(8, 0, demandTypes.length)) % demandTypes.length],
    baseDemand: Math.round(r(9, 1_000, 60_000)),
    demandVolatility: r(10, 0.0, 0.35),
    macro: macroTypes[Math.floor(r(11, 0, macroTypes.length)) % macroTypes.length],
    initialProviders: Math.round(r(12, 40, 3_000)),
    baseCapacityPerProvider: r(13, 20, 280),
    capacityStdDev: r(14, 0.05, 0.35),
    providerCostPerWeek: r(15, 5, 220),
    costStdDev: r(16, 0.05, 0.35),
    hardwareLeadTime: Math.floor(r(17, 1, 8)),
    churnThreshold: r(18, -120, 20),
    profitThresholdToJoin: r(19, 5, 60),
    maxProviderGrowthRate: r(20, 0.01, 0.25),
    maxProviderChurnRate: r(21, 0.05, 0.4),
    kBuyPressure: r(22, 0.00005, 0.12),
    kSellPressure: r(23, 0.00005, 0.12),
    kDemandPrice: r(24, 0.00005, 0.2),
    kMintPrice: r(25, 0.00005, 0.2),
    baseServicePrice: r(26, 0.002, 1),
    servicePriceElasticity: r(27, 0.05, 0.95),
    minServicePrice: r(28, 0.0005, 0.05),
    maxServicePrice: r(29, 0.1, 20),
    rewardLagWeeks: Math.floor(r(30, 0, 10)),
    competitorYield: r(31, 0, 1.0),
    hardwareCost: r(32, 80, 6_000),
    proTierPct: r(33, 0, 1),
    proTierEfficiency: r(34, 1.1, 2.4),
    sybilAttackEnabled: r(35, 0, 1) > 0.7,
    sybilSize: r(36, 0, 0.8),
  };
}

function expectFinite(value: number, label: string): void {
  expect(Number.isFinite(value), `${label} should be finite`).toBe(true);
  expect(Number.isNaN(value), `${label} should not be NaN`).toBe(false);
}

describe('Math invariants', () => {
  it('preserves supply conservation and bounded physics across randomized single-run scenarios', () => {
    for (let i = 0; i < 30; i += 1) {
      const params = randomParams(10_000 + i);
      const run = simulateOne(params, params.seed, 1);

      expect(run.length).toBe(params.T);

      for (let t = 0; t < run.length; t += 1) {
        const step = run[t];

        expectFinite(step.price, `price[t=${t}]`);
        expectFinite(step.supply, `supply[t=${t}]`);
        expectFinite(step.providers, `providers[t=${t}]`);
        expectFinite(step.capacity, `capacity[t=${t}]`);
        expectFinite(step.minted, `minted[t=${t}]`);
        expectFinite(step.burned, `burned[t=${t}]`);
        expectFinite(step.solvencyScore, `solvencyScore[t=${t}]`);

        expect(step.providers).toBeGreaterThanOrEqual(0);
        expect(step.capacity).toBeGreaterThanOrEqual(0);
        expect(step.minted).toBeGreaterThanOrEqual(0);
        expect(step.burned).toBeGreaterThanOrEqual(0);
        expect(step.supply).toBeGreaterThanOrEqual(1_000);

        expect(step.demandServed).toBeLessThanOrEqual(step.demand + 1e-9);
        expect(step.demandServed).toBeLessThanOrEqual(step.capacity + 1e-9);
        expect(step.utilisation).toBeGreaterThanOrEqual(0);
        expect(step.utilisation).toBeLessThanOrEqual(100 + 1e-9);

        const expectedSupply = t === 0
          ? Math.max(1_000, params.initialSupply + step.minted - step.burned)
          : Math.max(1_000, run[t - 1].supply + step.minted - step.burned);

        expect(step.supply).toBeCloseTo(expectedSupply, 6);
      }
    }
  });

  it('keeps aggregated Monte Carlo summaries finite and ordered', () => {
    const aggregate = runSimulation(makeBaseParams(4242));
    expect(aggregate.length).toBe(26);

    for (let t = 0; t < aggregate.length; t += 1) {
      const step = aggregate[t] as AggregateResult;
      const keys: Array<keyof AggregateResult> = [
        'price', 'supply', 'providers', 'capacity', 'minted', 'burned', 'solvencyScore', 'utilisation',
      ];

      keys.forEach((key) => {
        const stats = step[key];
        if (typeof stats === 'number') return;
        expectFinite(stats.mean, `${String(key)}.mean[t=${t}]`);
        expectFinite(stats.min, `${String(key)}.min[t=${t}]`);
        expectFinite(stats.max, `${String(key)}.max[t=${t}]`);
        expect(stats.min).toBeLessThanOrEqual(stats.mean + 1e-9);
        expect(stats.mean).toBeLessThanOrEqual(stats.max + 1e-9);
      });
    }
  });
});
