import { describe, expect, it } from 'vitest';
import type { AggregateResult, DerivedMetrics, SimulationParams } from '../model/types';
import { buildLiveDTSEApplicability } from './dtseLiveApplicability';

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

const buildPoint = (overrides: Partial<AggregateResult>, t: number): AggregateResult => ({
  t,
  price: metric(1),
  supply: metric(1000),
  demand: metric(100),
  demandServed: metric(40),
  providers: metric(100),
  capacity: metric(120),
  servicePrice: metric(1),
  minted: metric(120),
  burned: metric(80),
  utilisation: metric(33),
  profit: metric(0.3),
  scarcity: metric(0),
  incentive: metric(0),
  buyPressure: metric(0),
  sellPressure: metric(0),
  netFlow: metric(0),
  churnCount: metric(3),
  joinCount: metric(1),
  solvencyScore: metric(1.12),
  netDailyLoss: metric(0),
  dailyMintUsd: metric(0),
  dailyBurnUsd: metric(0),
  urbanCount: metric(50),
  ruralCount: metric(50),
  weightedCoverage: metric(75),
  proCount: metric(10),
  treasuryBalance: metric(1000),
  vampireChurn: metric(2),
  mercenaryCount: metric(8),
  underwaterCount: metric(10),
  costPerCapacity: metric(1),
  revenuePerCapacity: metric(2),
  entryBarrierActive: metric(0),
  ...overrides,
});

const baseParams: SimulationParams = {
  T: 4,
  initialSupply: 1000,
  initialPrice: 1,
  maxMintWeekly: 100,
  burnPct: 0.5,
  initialLiquidity: 1000,
  investorUnlockWeek: 20,
  investorSellPct: 0.05,
  scenario: 'baseline',
  demandType: 'consistent',
  baseDemand: 100,
  demandVolatility: 0.1,
  macro: 'neutral',
  initialProviders: 100,
  baseCapacityPerProvider: 1,
  capacityStdDev: 0.1,
  providerCostPerWeek: 0.5,
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

const derivedMetrics: DerivedMetrics = {
  maxDrawdown: 0,
  priceVolatility: 0,
  sharpeRatio: 0,
  deathSpiralProbability: 0,
  tokenVelocity: 0,
  inflationRate: 0,
  netEmissions: 0,
  avgProviderProfit: 0,
  providerProfitability: 0,
  totalChurn: 0,
  totalJoins: 0,
  retentionRate: 95,
  avgUtilisation: 0,
  demandSatisfactionRate: 0,
  capacityUtilisationEfficiency: 0,
  totalNetworkRevenue: 0,
  totalProviderRevenue: 0,
  totalBurnedValue: 0,
};

describe('dtseLiveApplicability', () => {
  it('builds runtime applicability from model evidence and stress configuration', () => {
    const entries = buildLiveDTSEApplicability(
      [buildPoint({}, 0), buildPoint({}, 1)],
      { ...baseParams, competitorYield: 0.35 },
      derivedMetrics,
    );

    expect(entries).not.toBeNull();
    expect(entries?.find((entry) => entry.metricId === 'solvency_ratio')?.reasonCode).toBe('PROXY_ACCEPTED');
    expect(entries?.find((entry) => entry.metricId === 'vampire_churn')?.verdict).toBe('R');
    expect(entries?.find((entry) => entry.metricId === 'tail_risk_score')?.verdict).toBe('R');
  });

  it('excludes non-applicable metrics when the run does not activate them', () => {
    const entries = buildLiveDTSEApplicability(
      [buildPoint({}, 0)],
      { ...baseParams, competitorYield: 0, hardwareCost: 0 },
      derivedMetrics,
    );

    expect(entries?.find((entry) => entry.metricId === 'payback_period')?.verdict).toBe('NR');
    expect(entries?.find((entry) => entry.metricId === 'vampire_churn')?.verdict).toBe('NR');
    expect(entries?.find((entry) => entry.metricId === 'vampire_churn')?.details).toContain('excluded to avoid unfair scoring');
  });
});
