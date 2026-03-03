import type { ProtocolProfileV1 } from '../data/protocols';
import type { SimulationParams } from '../model/types';
import type { DTSEStressChannel } from '../types/dtse';

const ratio = (current: number, baseline: number): number => {
  if (!Number.isFinite(current) || !Number.isFinite(baseline) || baseline <= 0) return 1;
  return current / baseline;
};

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
