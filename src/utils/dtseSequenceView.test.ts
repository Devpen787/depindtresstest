import { describe, expect, it } from 'vitest';
import type { AggregateResult, SimulationParams } from '../model/types';
import { buildDTSESequenceView } from './dtseSequenceView';

const metric = (mean: number) => ({
  mean,
  p10: mean * 0.9,
  p90: mean * 1.1,
  min: mean * 0.8,
  max: mean * 1.2,
  stdDev: Math.abs(mean) * 0.05,
  ci95_lower: mean * 0.95,
  ci95_upper: mean * 1.05,
});

const point = (t: number, overrides: Partial<AggregateResult> = {}): AggregateResult => ({
  t,
  price: metric(1),
  supply: metric(1000),
  demand: metric(100),
  demandServed: metric(42),
  providers: metric(100),
  capacity: metric(120),
  servicePrice: metric(1),
  minted: metric(90),
  burned: metric(80),
  utilisation: metric(42),
  profit: metric(12),
  scarcity: metric(0),
  incentive: metric(0),
  buyPressure: metric(0),
  sellPressure: metric(0),
  netFlow: metric(0),
  churnCount: metric(1),
  joinCount: metric(1),
  solvencyScore: metric(1.45),
  netDailyLoss: metric(0),
  dailyMintUsd: metric(0),
  dailyBurnUsd: metric(0),
  urbanCount: metric(50),
  ruralCount: metric(50),
  weightedCoverage: metric(75),
  proCount: metric(10),
  treasuryBalance: metric(10000),
  vampireChurn: metric(0),
  mercenaryCount: metric(0),
  underwaterCount: metric(1),
  costPerCapacity: metric(1),
  revenuePerCapacity: metric(2),
  entryBarrierActive: metric(0),
  ...overrides,
});

const params: SimulationParams = {
  T: 4,
  initialSupply: 1000,
  initialPrice: 1,
  maxMintWeekly: 200,
  burnPct: 0.5,
  initialLiquidity: 1000,
  investorUnlockWeek: 20,
  investorSellPct: 0,
  scenario: 'baseline',
  demandType: 'consistent',
  baseDemand: 100,
  demandVolatility: 0.1,
  macro: 'neutral',
  initialProviders: 100,
  baseCapacityPerProvider: 1,
  capacityStdDev: 0.1,
  providerCostPerWeek: 1,
  costStdDev: 0.1,
  hardwareLeadTime: 1,
  churnThreshold: -1,
  profitThresholdToJoin: 0,
  maxProviderGrowthRate: 0.1,
  maxProviderChurnRate: 0.1,
  kBuyPressure: 0.1,
  kSellPressure: 0.1,
  kDemandPrice: 0.1,
  kMintPrice: 0.1,
  baseServicePrice: 1,
  servicePriceElasticity: 0.1,
  minServicePrice: 0.5,
  maxServicePrice: 2,
  rewardLagWeeks: 1,
  nSims: 25,
  seed: 42,
  competitorYield: 0,
  emissionModel: 'fixed',
  revenueStrategy: 'burn',
  hardwareCost: 100,
  growthCallEventWeek: 0,
  growthCallEventPct: 0,
  proTierPct: 0,
  proTierEfficiency: 1.5,
  sybilAttackEnabled: false,
  sybilSize: 0,
};

describe('dtseSequenceView', () => {
  it('computes baseline deviation series and trigger order from aligned runs', () => {
    const baseline = [
      point(0),
      point(1, { price: metric(1.01), providers: metric(101), utilisation: metric(43), solvencyScore: metric(1.44) }),
      point(2, { price: metric(1.02), providers: metric(102), utilisation: metric(44), solvencyScore: metric(1.43) }),
      point(3, { price: metric(1.03), providers: metric(103), utilisation: metric(44), solvencyScore: metric(1.42) }),
    ];

    const stressed = [
      point(0, { profit: metric(-2), solvencyScore: metric(1.35) }),
      point(1, { price: metric(0.82), profit: metric(-4), solvencyScore: metric(1.18), utilisation: metric(34) }),
      point(2, { price: metric(0.76), providers: metric(93), churnCount: metric(6), utilisation: metric(28), solvencyScore: metric(1.05) }),
      point(3, { price: metric(0.74), providers: metric(88), churnCount: metric(8), utilisation: metric(18), solvencyScore: metric(0.94) }),
    ];

    const result = buildDTSESequenceView(stressed, baseline, params);

    expect(result).not.toBeNull();
    expect(result?.deviationSeries).toHaveLength(4);
    expect(result?.deviationSeries[1]?.priceDeltaPct).toBeCloseTo(-18.8, 1);
    expect(result?.earliestTriggerWeek).toBe(1);
    expect(result?.earliestTriggerLabel).toBe('Provider Profitability');

    const profitability = result?.pathway.find((row) => row.familyId === 'profitability');
    const price = result?.pathway.find((row) => row.familyId === 'modeled_price');
    const retention = result?.pathway.find((row) => row.familyId === 'retention_churn');

    expect(profitability?.triggerWeek).toBe(1);
    expect(price?.triggerWeek).toBe(2);
    expect(retention?.triggerWeek).toBe(3);
    expect(result?.illusionWarning).toContain('lagging indicator');
  });

  it('returns null without aligned baseline data', () => {
    const result = buildDTSESequenceView([point(0)], [], params);
    expect(result).toBeNull();
  });
});
