import { describe, expect, it } from 'vitest';
import type { AggregateResult, DerivedMetrics, SimulationParams } from '../model/types';
import { buildLiveDTSEOutputs, buildLiveDTSERunContext } from './dtseLiveOutputs';

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

const buildPoint = (
  overrides: Partial<AggregateResult>,
  t: number,
): AggregateResult => ({
  t,
  price: metric(1),
  supply: metric(1000),
  demand: metric(100),
  demandServed: metric(50),
  providers: metric(100),
  capacity: metric(120),
  servicePrice: metric(1),
  minted: metric(200),
  burned: metric(100),
  utilisation: metric(0),
  profit: metric(0),
  scarcity: metric(0),
  incentive: metric(0),
  buyPressure: metric(0),
  sellPressure: metric(0),
  netFlow: metric(0),
  churnCount: metric(2),
  joinCount: metric(1),
  solvencyScore: metric(1.2),
  netDailyLoss: metric(0),
  dailyMintUsd: metric(0),
  dailyBurnUsd: metric(0),
  urbanCount: metric(50),
  ruralCount: metric(50),
  weightedCoverage: metric(75),
  proCount: metric(10),
  treasuryBalance: metric(10000),
  vampireChurn: metric(1),
  mercenaryCount: metric(5),
  underwaterCount: metric(4),
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
  retentionRate: 94,
  avgUtilisation: 0,
  demandSatisfactionRate: 0,
  capacityUtilisationEfficiency: 0,
  totalNetworkRevenue: 0,
  totalProviderRevenue: 0,
  totalBurnedValue: 0,
};

describe('dtseLiveOutputs', () => {
  it('builds DTSE outcomes from aggregate simulation data', () => {
    const aggregated: AggregateResult[] = [
      buildPoint({
        price: metric(1.0),
        providers: metric(100),
        minted: metric(110),
        demand: metric(100),
        demandServed: metric(42),
        utilisation: metric(42),
        churnCount: metric(4),
        solvencyScore: metric(1.4),
      }, 0),
      buildPoint({
        price: metric(1.1),
        providers: metric(96),
        minted: metric(108),
        demand: metric(100),
        demandServed: metric(40),
        utilisation: metric(40),
        churnCount: metric(3),
        solvencyScore: metric(1.25),
      }, 1),
      buildPoint({
        price: metric(1.15),
        providers: metric(94),
        minted: metric(105),
        demand: metric(100),
        demandServed: metric(38),
        utilisation: metric(38),
        churnCount: metric(2),
        solvencyScore: metric(1.18),
      }, 2),
      buildPoint({
        price: metric(1.2),
        providers: metric(93),
        minted: metric(104),
        demand: metric(100),
        demandServed: metric(37),
        utilisation: metric(37),
        churnCount: metric(2),
        solvencyScore: metric(1.16),
      }, 3),
    ];

    const result = buildLiveDTSEOutputs(aggregated, params, derivedMetrics);

    expect(result).not.toBeNull();
    expect(result?.outcomes.map((outcome) => outcome.metric_id)).toEqual([
      'solvency_ratio',
      'payback_period',
      'weekly_retention_rate',
      'network_utilization',
      'tail_risk_score',
      'stress_resilience_index',
    ]);
    expect(result?.outcomes.find((outcome) => outcome.metric_id === 'solvency_ratio')?.value).toBe(1.16);
    expect(result?.outcomes.find((outcome) => outcome.metric_id === 'network_utilization')?.value).toBe(37);
    expect(result?.weeklySolvency).toEqual([1.4, 1.25, 1.18, 1.16]);
  });

  it('builds live run context metadata from the simulation run', () => {
    const outcomes = [{ metric_id: 'solvency_ratio', value: 1.1, band: 'watchlist' as const }];
    const context = buildLiveDTSERunContext({
      profileId: 'ono_v3_calibrated',
      params,
      simulationRunId: 7,
      modelVersion: 'Agent-Based v2',
      outcomes,
      weeklySolvency: [1.2, 1.1],
    });

    expect(context.run_id).toBe('dtse-live-ono_v3_calibrated-7');
    expect(context.horizon_weeks).toBe(params.T);
    expect(context.n_sims).toBe(params.nSims);
    expect(context.evidence_status).toBe('partial');
    expect(context.model_version).toBe('Agent-Based v2');
    expect(context.outcomes).toEqual(outcomes);
    expect(context.weekly_solvency).toEqual([1.2, 1.1]);
  });
});
