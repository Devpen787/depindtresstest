import type { ProtocolProfileV1 } from '../data/protocols';
import type { SimulationParams } from '../model/types';
import type { DTSEStressChannel } from '../types/dtse';

export const DTSE_STRESS_CHANNEL_OPTIONS: Array<{ id: DTSEStressChannel['id']; label: string }> = [
  { id: 'baseline_neutral', label: 'Baseline Neutral' },
  { id: 'demand_contraction', label: 'Demand Contraction' },
  { id: 'liquidity_shock', label: 'Liquidity Shock' },
  { id: 'competitive_yield_pressure', label: 'Competitive-Yield Pressure' },
  { id: 'provider_cost_inflation', label: 'Provider Cost Inflation' },
];

const ratio = (current: number, baseline: number): number => {
  if (!Number.isFinite(current) || !Number.isFinite(baseline) || baseline <= 0) return 1;
  return current / baseline;
};

const buildBaselineUpdate = (
  profile: ProtocolProfileV1,
): Pick<SimulationParams, 'scenario' | 'competitorYield' | 'investorSellPct' | 'macro' | 'demandType' | 'providerCostPerWeek'> => ({
  scenario: 'baseline',
  competitorYield: 0,
  investorSellPct: 0,
  macro: 'sideways',
  demandType: profile.parameters.demand_regime.value,
  providerCostPerWeek: profile.parameters.provider_economics.opex_weekly.value,
});

export interface DTSEStressSelection {
  scenarioIdForState: string;
  updates: Partial<SimulationParams>;
  stressChannel: DTSEStressChannel;
}

export function resolveDTSEStressChannelSelection(
  channelId: DTSEStressChannel['id'],
  profile?: ProtocolProfileV1,
): DTSEStressSelection {
  if (!profile) {
    const fallbackChannel = inferDTSEStressChannel(
      {
        scenario: 'baseline',
        competitorYield: 0,
        investorSellPct: 0,
        macro: 'sideways',
        demandType: 'consistent',
        providerCostPerWeek: 1,
      } as SimulationParams,
      undefined,
    );
    return {
      scenarioIdForState: 'baseline',
      updates: {},
      stressChannel: fallbackChannel,
    };
  }

  const baselineUpdate = buildBaselineUpdate(profile);

  switch (channelId) {
    case 'demand_contraction':
      return {
        scenarioIdForState: 'demand_contraction',
        updates: {
          ...baselineUpdate,
          demandType: 'high-to-decay',
          macro: 'bearish',
        },
        stressChannel: {
          id: 'demand_contraction',
          label: 'Demand Contraction',
          summary: 'Demand softens relative to baseline, testing whether the token design can absorb weaker service-side revenue conversion.',
          basis: 'Triggered by a high-to-decay demand curve.',
        },
      };
    case 'liquidity_shock':
      return {
        scenarioIdForState: 'death_spiral',
        updates: {
          ...baselineUpdate,
          investorSellPct: 0.35,
          investorUnlockWeek: 20,
          macro: 'bearish',
        },
        stressChannel: {
          id: 'liquidity_shock',
          label: 'Liquidity Shock',
          summary: 'A sell-side dislocation compresses token price and fiat-equivalent rewards faster than the network can adjust.',
          basis: 'Triggered by investor sell pressure at 35% of supply during the unlock window.',
        },
      };
    case 'competitive_yield_pressure':
      return {
        scenarioIdForState: 'vampire_attack',
        updates: {
          ...baselineUpdate,
          competitorYield: 1.5,
        },
        stressChannel: {
          id: 'competitive_yield_pressure',
          label: 'Competitive-Yield Pressure',
          summary: 'External yield competition tests whether providers remain loyal when adjacent networks offer stronger returns.',
          basis: 'Triggered by competitor yield at 150% of baseline reward conditions.',
        },
      };
    case 'provider_cost_inflation':
      return {
        scenarioIdForState: 'provider_cost_inflation',
        updates: {
          ...baselineUpdate,
          providerCostPerWeek: Number((profile.parameters.provider_economics.opex_weekly.value * 1.25).toFixed(2)),
        },
        stressChannel: {
          id: 'provider_cost_inflation',
          label: 'Provider Cost Inflation',
          summary: 'Provider economics are stressed by higher operating costs before the demand side necessarily moves.',
          basis: 'Triggered by provider OPEX at 1.25x the protocol baseline assumption.',
        },
      };
    case 'baseline_neutral':
    default:
      return {
        scenarioIdForState: 'baseline',
        updates: baselineUpdate,
        stressChannel: {
          id: 'baseline_neutral',
          label: 'Baseline Neutral',
          summary: 'Reference case for matched-condition comparison with no explicit stress channel activated.',
          basis: 'No explicit liquidity, competitor-yield, provider-cost, or demand-contraction stress override is active.',
        },
      };
  }
}

export function inferDTSEStressChannel(
  params: SimulationParams,
  profile?: ProtocolProfileV1,
): DTSEStressChannel {
  const baselineOpex = profile?.parameters.provider_economics.opex_weekly.value ?? params.providerCostPerWeek;
  const costRatio = ratio(params.providerCostPerWeek, baselineOpex);

  if (params.competitorYield > 0) {
    return {
      id: 'competitive_yield_pressure',
      label: 'Competitive-Yield Pressure',
      summary: 'External yield competition tests whether providers remain loyal when adjacent networks offer stronger returns.',
      basis: `Triggered by competitor yield at ${Math.round(params.competitorYield * 100)}% of baseline reward conditions.`,
    };
  }

  if (params.investorSellPct > 0 || params.scenario === 'winter') {
    return {
      id: 'liquidity_shock',
      label: 'Liquidity Shock',
      summary: 'A sell-side dislocation compresses token price and fiat-equivalent rewards faster than the network can adjust.',
      basis: params.investorSellPct > 0
        ? `Triggered by investor sell pressure at ${(params.investorSellPct * 100).toFixed(0)}% of supply during the unlock window.`
        : 'Triggered by the legacy winter scenario preset, interpreted in DTSE as a liquidity-led compression channel.',
    };
  }

  if (costRatio >= 1.15) {
    return {
      id: 'provider_cost_inflation',
      label: 'Provider Cost Inflation',
      summary: 'Provider economics are stressed by higher operating costs before the demand side necessarily moves.',
      basis: `Triggered by provider OPEX at ${costRatio.toFixed(2)}x the protocol baseline assumption.`,
    };
  }

  if (params.demandType === 'high-to-decay' || params.macro === 'bearish') {
    return {
      id: 'demand_contraction',
      label: 'Demand Contraction',
      summary: 'Demand softens relative to baseline, testing whether the token design can absorb weaker service-side revenue conversion.',
      basis: params.demandType === 'high-to-decay'
        ? 'Triggered by a high-to-decay demand curve.'
        : 'Triggered by a bearish macro regime interpreted as weaker demand conversion.',
    };
  }

  return {
    id: 'baseline_neutral',
    label: 'Baseline Neutral',
    summary: 'Reference case for matched-condition comparison with no explicit stress channel activated.',
    basis: 'No explicit liquidity, competitor-yield, provider-cost, or demand-contraction stress override is active.',
  };
}
