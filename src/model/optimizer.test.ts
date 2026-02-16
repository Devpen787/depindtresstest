import { describe, it, expect } from 'vitest';
import { Optimizer } from './optimizer';
import { runSimulation } from './simulation';
import type { SimulationParams, AggregateResult } from './types';
import { GENERATED_PROTOCOL_PROFILES } from '../data/generated/protocolProfiles.generated';

function buildOptimizerParams(): SimulationParams {
  const profile =
    GENERATED_PROTOCOL_PROFILES.find(
      (candidate) => candidate.metadata.id === 'ono_v3_calibrated'
    ) || GENERATED_PROTOCOL_PROFILES[0];

  return {
    T: 26,
    initialSupply: profile.parameters.supply.value,
    initialPrice: Math.max(0.01, profile.parameters.initial_price.value),
    maxMintWeekly: profile.parameters.emissions.value,
    burnPct: profile.parameters.burn_fraction.value,
    initialLiquidity: 500_000,
    investorUnlockWeek: 26,
    investorSellPct: 0.05,
    scenario: 'baseline',
    demandType: profile.parameters.demand_regime.value,
    baseDemand: Math.max(
      12_000,
      Math.round(profile.parameters.initial_active_providers.value * 180 * 0.65)
    ),
    demandVolatility: 0.05,
    macro: 'sideways',
    initialProviders: profile.parameters.initial_active_providers.value,
    baseCapacityPerProvider: 180,
    capacityStdDev: 0.2,
    providerCostPerWeek: profile.parameters.provider_economics.opex_weekly.value,
    costStdDev: 0.15,
    hardwareLeadTime: 2,
    churnThreshold: profile.parameters.provider_economics.churn_threshold.value,
    profitThresholdToJoin: 15,
    maxProviderGrowthRate: 0.15,
    maxProviderChurnRate: 0.10,
    kBuyPressure: 0.08,
    kSellPressure: 0.12,
    kDemandPrice: 0.15,
    kMintPrice: 0.35,
    baseServicePrice: 0.5,
    servicePriceElasticity: 0.6,
    minServicePrice: 0.05,
    maxServicePrice: 5.0,
    rewardLagWeeks: profile.parameters.adjustment_lag.value,
    nSims: 8,
    seed: 42,
    competitorYield: 0,
    emissionModel: 'fixed',
    revenueStrategy: 'burn',
    hardwareCost: profile.parameters.hardware_cost.value,
    proTierPct: profile.parameters.pro_tier_pct?.value || 0,
    proTierEfficiency: 1.5,
    sybilAttackEnabled: false,
    sybilSize: 0
  };
}

function computeTailAverageSolvency(results: AggregateResult[]): number {
  const start = Math.floor(results.length / 2);
  const tail = results.slice(start);
  return tail.reduce((acc, point) => acc + point.solvencyScore.mean, 0) / tail.length;
}

function computeChurnRate(results: AggregateResult[], initialProviders: number): number {
  const totalChurn = results.reduce((acc, point) => acc + point.churnCount.mean, 0);
  if (initialProviders <= 0) {
    return 0;
  }
  return totalChurn / initialProviders;
}

describe('Optimizer quality gates', () => {
  it('findBreakEvenPrice should produce a price with healthy tail solvency', () => {
    const params = buildOptimizerParams();
    const suggestedPrice = Optimizer.findBreakEvenPrice(params, 'solvency', 1.0);

    const validationRun = runSimulation({
      ...params,
      initialPrice: suggestedPrice,
      nSims: 8
    });

    const tailAverageSolvency = computeTailAverageSolvency(validationRun);
    expect(tailAverageSolvency).toBeGreaterThanOrEqual(1.0);
  });

  it('findRetentionAPY should not worsen churn under threat scenario', () => {
    const params = buildOptimizerParams();
    const threatYield = 0.5;
    const threatParams = {
      ...params,
      competitorYield: threatYield
    };

    const baselineRun = runSimulation(threatParams);
    const baselineChurnRate = computeChurnRate(
      baselineRun,
      threatParams.initialProviders
    );

    const suggestedEmission = Optimizer.findRetentionAPY(threatParams);
    const optimizedRun = runSimulation({
      ...threatParams,
      maxMintWeekly: suggestedEmission
    });
    const optimizedChurnRate = computeChurnRate(
      optimizedRun,
      threatParams.initialProviders
    );

    expect(optimizedChurnRate).toBeLessThanOrEqual(baselineChurnRate);
  });

  it('findMaxScalableSupply should return a boundary where stress degrades retention ratio', () => {
    const params = buildOptimizerParams();
    const maxScale = Optimizer.findMaxScalableSupply(params);
    const stressScale = Math.max(maxScale + 1, Math.floor(maxScale * 1.1));

    const maxScaleRun = runSimulation({
      ...params,
      initialProviders: maxScale
    });
    const stressScaleRun = runSimulation({
      ...params,
      initialProviders: stressScale
    });

    const maxRetentionRatio =
      maxScaleRun[maxScaleRun.length - 1].providers.mean / Math.max(maxScale, 1);
    const stressRetentionRatio =
      stressScaleRun[stressScaleRun.length - 1].providers.mean / Math.max(stressScale, 1);

    expect(stressRetentionRatio).toBeLessThan(maxRetentionRatio);
  });
});
