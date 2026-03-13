import { describe, expect, it } from 'vitest';
import type { ProtocolProfileV1 } from '../data/protocols';
import type { SimulationParams } from '../model/types';
import { inferDTSEStressChannel, resolveDTSEStressChannelSelection } from './dtseStressChannel';

const profile: ProtocolProfileV1 = {
  version: '1',
  metadata: {
    id: 'test',
    name: 'Test',
    mechanism: 'Fixed',
    notes: '',
    model_type: 'location_based',
    source: 'test',
    coingeckoId: 'test',
    chain: 'solana',
  },
  parameters: {
    supply: { value: 1000, unit: 'token' },
    emissions: { value: 100, unit: 'token/week' },
    burn_fraction: { value: 0.5, unit: '%' },
    adjustment_lag: { value: 1, unit: 'week' },
    demand_regime: { value: 'consistent', unit: 'mode' },
    provider_economics: {
      opex_weekly: { value: 10, unit: 'usd/week' },
      churn_threshold: { value: 0, unit: 'usd' },
    },
    initial_active_providers: { value: 100, unit: 'providers' },
    initial_price: { value: 1, unit: 'usd' },
    hardware_cost: { value: 100, unit: 'usd' },
    pro_tier_pct: { value: 0.2, unit: '%' },
  },
};

const baseParams: SimulationParams = {
  T: 52,
  initialSupply: 1000,
  initialPrice: 1,
  maxMintWeekly: 100,
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
  providerCostPerWeek: 10,
  costStdDev: 0.1,
  hardwareLeadTime: 1,
  churnThreshold: 0,
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
  nSims: 100,
  seed: 42,
  competitorYield: 0,
  emissionModel: 'fixed',
  revenueStrategy: 'burn',
  hardwareCost: 100,
  growthCallEventWeek: 0,
  growthCallEventPct: 0,
  proTierPct: 0.2,
  proTierEfficiency: 1.5,
  sybilAttackEnabled: false,
  sybilSize: 0,
};

describe('inferDTSEStressChannel', () => {
  it('maps liquidity-led runs to the liquidity shock channel', () => {
    expect(inferDTSEStressChannel({ ...baseParams, investorSellPct: 0.25 }, profile).id).toBe('liquidity_shock');
  });

  it('maps competitor-yield runs to the competitive-yield channel', () => {
    expect(inferDTSEStressChannel({ ...baseParams, competitorYield: 0.4 }, profile).id).toBe('competitive_yield_pressure');
  });

  it('maps elevated provider opex to provider cost inflation', () => {
    expect(inferDTSEStressChannel({ ...baseParams, providerCostPerWeek: 13 }, profile).id).toBe('provider_cost_inflation');
  });

  it('falls back to baseline neutral when no stress channel is active', () => {
    expect(inferDTSEStressChannel(baseParams, profile).id).toBe('baseline_neutral');
  });
});

describe('resolveDTSEStressChannelSelection', () => {
  it('returns the canonical DTSE contract for liquidity shock', () => {
    const selection = resolveDTSEStressChannelSelection('liquidity_shock', profile);
    expect(selection.scenarioIdForState).toBe('death_spiral');
    expect(selection.updates.investorSellPct).toBe(0.35);
    expect(selection.updates.macro).toBe('bearish');
    expect(selection.stressChannel.id).toBe('liquidity_shock');
  });

  it('returns the canonical DTSE contract for provider cost inflation', () => {
    const selection = resolveDTSEStressChannelSelection('provider_cost_inflation', profile);
    expect(selection.scenarioIdForState).toBe('provider_cost_inflation');
    expect(selection.updates.providerCostPerWeek).toBe(12.5);
    expect(selection.stressChannel.id).toBe('provider_cost_inflation');
  });
});
