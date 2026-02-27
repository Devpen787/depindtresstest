import { describe, expect, it } from 'vitest';
import type { AggregateResult, SimulationParams } from '../model/types';
import type { DTSEOutcome } from '../types/dtse';
import { buildLiveDTSEFailureSignatures } from './dtseLiveSignatures';

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
  demandServed: metric(30),
  providers: metric(100),
  capacity: metric(150),
  servicePrice: metric(1),
  minted: metric(110),
  burned: metric(80),
  utilisation: metric(20),
  profit: metric(0.4),
  scarcity: metric(0),
  incentive: metric(0),
  buyPressure: metric(0),
  sellPressure: metric(0),
  netFlow: metric(0),
  churnCount: metric(6),
  joinCount: metric(1),
  solvencyScore: metric(0.92),
  netDailyLoss: metric(0),
  dailyMintUsd: metric(0),
  dailyBurnUsd: metric(0),
  urbanCount: metric(50),
  ruralCount: metric(50),
  weightedCoverage: metric(70),
  proCount: metric(10),
  treasuryBalance: metric(1000),
  vampireChurn: metric(2),
  mercenaryCount: metric(10),
  underwaterCount: metric(20),
  costPerCapacity: metric(1),
  revenuePerCapacity: metric(0.5),
  entryBarrierActive: metric(0),
  ...overrides,
});

const params: SimulationParams = {
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

describe('dtseLiveSignatures', () => {
  it('builds trigger-driven signatures from stressed outputs', () => {
    const aggregated: AggregateResult[] = [
      buildPoint({ price: metric(1.0), providers: metric(100), churnCount: metric(3), utilisation: metric(28), solvencyScore: metric(1.05) }, 0),
      buildPoint({ price: metric(0.9), providers: metric(94), churnCount: metric(5), utilisation: metric(24), solvencyScore: metric(0.98) }, 1),
      buildPoint({ price: metric(0.82), providers: metric(88), churnCount: metric(6), utilisation: metric(18), solvencyScore: metric(0.93) }, 2),
      buildPoint({ price: metric(0.78), providers: metric(82), churnCount: metric(7), utilisation: metric(16), solvencyScore: metric(0.88) }, 3),
    ];

    const outcomes: DTSEOutcome[] = [
      { metric_id: 'solvency_ratio', value: 0.88, band: 'intervention' },
      { metric_id: 'payback_period', value: 40, band: 'intervention' },
      { metric_id: 'weekly_retention_rate', value: 86, band: 'intervention' },
      { metric_id: 'network_utilization', value: 16, band: 'intervention' },
      { metric_id: 'tail_risk_score', value: 71, band: 'intervention' },
      { metric_id: 'stress_resilience_index', value: 42, band: 'intervention' },
    ];

    const signatures = buildLiveDTSEFailureSignatures(aggregated, params, outcomes);

    expect(signatures.map((signature) => signature.label)).toEqual([
      'Subsidy Trap',
      'Tail Fragility',
      'Demand Gap',
      'Churn Cascade',
    ]);
    expect(signatures[0].trigger_logic).toContain('solvency is 0.88x');
    expect(signatures[2].affected_metrics).toContain('network_utilization');
  });

  it('returns no signatures for an empty run', () => {
    expect(buildLiveDTSEFailureSignatures([], params, [])).toEqual([]);
  });
});
