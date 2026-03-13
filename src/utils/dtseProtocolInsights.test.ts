import { describe, expect, it } from 'vitest';
import type { ProtocolProfileV1 } from '../data/protocols';
import type { DTSEFailureSignature, DTSEOutcome, DTSEProtocolBrief } from '../types/dtse';
import type { DTSESequenceView } from './dtseSequenceView';
import { buildDTSEProtocolInsights } from './dtseProtocolInsights';

const profile: ProtocolProfileV1 = {
  version: '1',
  metadata: {
    id: 'ono_v3_calibrated',
    name: 'ONOCOY',
    mechanism: 'Fixed Emissions w/ Partial Burn',
    notes: '',
    model_type: 'location_based',
    source: 'test',
    coingeckoId: 'onocoy-token',
    chain: 'solana',
  },
  parameters: {
    supply: { value: 1, unit: 'tokens' },
    emissions: { value: 1, unit: 'tokens' },
    burn_fraction: { value: 1, unit: '%' },
    adjustment_lag: { value: 1, unit: 'weeks' },
    demand_regime: { value: 'consistent', unit: 'mode' },
    provider_economics: {
      opex_weekly: { value: 1, unit: 'usd/week' },
      churn_threshold: { value: -1, unit: 'usd/week' },
    },
    initial_active_providers: { value: 100, unit: 'providers' },
    initial_price: { value: 1, unit: 'usd' },
    hardware_cost: { value: 100, unit: 'usd' },
    pro_tier_pct: { value: 0, unit: '%' },
  },
};

const protocolBrief: DTSEProtocolBrief = {
  protocol_id: 'ono_v3_calibrated',
  protocol_name: 'ONOCOY',
  chain: 'Solana',
  mechanism: 'Fixed Emissions w/ Partial Burn',
  depin_surface: 'GNSS reference-station network',
  supply_count: 410000000,
  supply_unit: 'tokens',
  supply_structure: 'Capped',
  token_price_usd: 0.1,
  market_cap_usd: 41000000,
  weekly_emissions: 5000000,
  weekly_emissions_unit: 'tokens/week',
  burn_fraction_pct: 65,
  active_providers: 3000,
  active_providers_unit: 'stations',
  demand_signal: 'Demand depends on coverage quality.',
  supply_signal: 'Providers run stations.',
  token_utility: ['Provider rewards'],
  notes: 'Coverage density and reward discipline are primary resilience levers.',
};

const outcomes: DTSEOutcome[] = [
  { metric_id: 'solvency_ratio', value: 1.12, band: 'watchlist' },
  { metric_id: 'payback_period', value: 28, band: 'watchlist' },
  { metric_id: 'weekly_retention_rate', value: 94.2, band: 'healthy' },
  { metric_id: 'network_utilization', value: 31, band: 'watchlist' },
  { metric_id: 'tail_risk_score', value: 42, band: 'watchlist' },
];

const failureSignatures: DTSEFailureSignature[] = [
  {
    id: 'liquidity-driven-compression',
    label: 'Liquidity-Driven Compression',
    pattern: 'Market stress compresses rewards.',
    severity: 'high',
    affected_metrics: ['tail_risk_score'],
    trigger_logic: 'Tail risk is elevated.',
  },
  {
    id: 'elastic-provider-exit',
    label: 'Elastic Provider Exit',
    pattern: 'Providers can leave early.',
    severity: 'medium',
    affected_metrics: ['weekly_retention_rate'],
    trigger_logic: 'Competitive yield exceeds internal returns.',
  },
];

const sequenceView: DTSESequenceView = {
  deviationSeries: [],
  earliestTriggerWeek: 12,
  earliestTriggerLabel: 'Capacity Utilization',
  illusionWarning: 'Node count is a lagging indicator.',
  pathway: [
    { familyId: 'profitability', label: 'Provider Profitability', triggerWeek: 16, triggerLabel: '', detail: '', cells: [] },
    { familyId: 'utilization', label: 'Capacity Utilization', triggerWeek: 12, triggerLabel: '', detail: '', cells: [] },
    { familyId: 'solvency_proxy', label: 'Solvency Proxy', triggerWeek: 18, triggerLabel: '', detail: '', cells: [] },
    { familyId: 'modeled_price', label: 'Modeled Price', triggerWeek: 14, triggerLabel: '', detail: '', cells: [] },
    { familyId: 'retention_churn', label: 'Retention / Churn', triggerWeek: 49, triggerLabel: '', detail: '', cells: [] },
  ],
};

describe('buildDTSEProtocolInsights', () => {
  it('builds protocol-specific insight cards from sequence, signatures, and verified data', () => {
    const insights = buildDTSEProtocolInsights({
      profile,
      protocolBrief,
      outcomes,
      failureSignatures,
      sequenceView,
      peerNames: ['GEODNET', 'Helium'],
    });

    expect(insights.length).toBeGreaterThanOrEqual(4);
    expect(insights.some((insight) => insight.id === 'lagging-signal')).toBe(true);
    expect(insights.some((insight) => insight.id === 'capped-supply-tradeoff')).toBe(true);
    expect(insights.some((insight) => insight.id === 'liquidity-exposure')).toBe(true);
    expect(insights.some((insight) => insight.id === 'comparative-anchor')).toBe(true);
    expect(insights.find((insight) => insight.id === 'lagging-signal')?.title).toBe('Station count can lag the economic break');
    expect(insights.find((insight) => insight.id === 'lagging-signal')?.observation).toContain('Week 12');
    expect(insights.find((insight) => insight.id === 'lagging-signal')?.observation).toContain('Week 49');
    expect(insights.find((insight) => insight.id === 'capped-supply-tradeoff')?.provenance).toContain('Protocol setup: capped supply / Fixed Emissions w/ Partial Burn');
    expect(insights.find((insight) => insight.id === 'liquidity-exposure')?.provenance).toContain('Failure pattern: Liquidity-Driven Compression');
    expect(insights.find((insight) => insight.id === 'comparative-anchor')?.provenance).toContain('Peer comparison set: GEODNET, Helium');
  });

  it('sanitizes implausible trigger narratives before exposing protocol insights', () => {
    const insights = buildDTSEProtocolInsights({
      profile,
      protocolBrief,
      outcomes,
      failureSignatures: [
        {
          id: 'liquidity-driven-compression',
          label: 'Liquidity-Driven Compression',
          pattern: 'Market stress compresses rewards.',
          severity: 'high',
          affected_metrics: ['tail_risk_score'],
          trigger_logic: 'Triggered because price compression is -999%, max drawdown is 0%, and tail risk is 45.',
        },
      ],
      sequenceView,
      peerNames: ['GEODNET', 'Helium'],
    });

    const liquidityInsight = insights.find((insight) => insight.id === 'liquidity-exposure');
    expect(liquidityInsight).toBeDefined();
    expect(liquidityInsight?.trigger).toBe('Tail risk score: 42');
  });
});
