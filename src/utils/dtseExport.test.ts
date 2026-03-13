import { describe, expect, it } from 'vitest';
import { buildDTSEStakeholderBriefMarkdown } from './dtseExport';
import type { DTSEProtocolBrief } from '../types/dtse';

const protocolBrief: DTSEProtocolBrief = {
  protocol_id: 'ono_v3_calibrated',
  protocol_name: 'ONOCOY',
  chain: 'Solana',
  mechanism: 'Fixed Emissions w/ Partial Burn',
  depin_surface: 'GNSS reference-station network',
  supply_count: 1,
  supply_unit: 'tokens',
  supply_structure: 'Capped',
  token_price_usd: 0.12,
  market_cap_usd: 1,
  weekly_emissions: 1,
  weekly_emissions_unit: 'tokens/week',
  burn_fraction_pct: 50,
  active_providers: 1,
  active_providers_unit: 'stations',
  demand_signal: 'Demand depends on coverage quality.',
  supply_signal: 'Providers run stations.',
  token_utility: ['Provider rewards'],
  notes: 'Test protocol.',
};

describe('dtseExport', () => {
  it('includes the data-source summary and protocol name in stakeholder markdown', () => {
    const markdown = buildDTSEStakeholderBriefMarkdown(
      {
        runContext: {
          scenario_grid_id: 'baseline',
          run_id: 'dtse-live-ono-1',
          seed_policy: { seed: 42, locked: true },
          horizon_weeks: 52,
          n_sims: 25,
          evidence_status: 'partial',
          protocol_id: 'ono_v3_calibrated',
          model_version: 'Agent-Based v2',
          generated_at_utc: '2026-03-07T00:00:00.000Z',
          bundle_hash: 'hash',
        },
        protocolBrief,
        applicability: [
          { metricId: 'solvency_ratio', verdict: 'R', reasonCode: 'PROXY_ACCEPTED', details: 'Proxy accepted for this run.' },
        ],
        outcomes: [
          { metric_id: 'solvency_ratio', value: 1.1, band: 'watchlist' },
        ],
        failureSignatures: [
          {
            id: 'liquidity-driven-compression',
            label: 'Liquidity-Driven Compression',
            pattern: 'Market stress compresses rewards.',
            severity: 'high',
            affected_metrics: ['tail_risk_score'],
            trigger_logic: 'price compression is -999%, max drawdown is 0%',
          },
        ],
        recommendations: [
          {
            id: 'rec-1',
            priority: 'high',
            owner: 'Tokenomics lead',
            rationale: 'Solvency is below the healthy band.',
            action: 'Rerun with lower net emissions and stronger demand sinks',
          },
        ],
        protocolInsights: [],
        dataSourceSummary: {
          marketContextStatus: 'Reference',
          modelSourceStatus: 'Saved pack',
          scoringConfidenceStatus: 'Partial',
          proxyMetricLabels: ['Solvency Ratio'],
          fallbackReferenceValuesUsed: ['Saved reference market values for price, market cap, and supply context'],
        },
      },
      {
        solvency_ratio: 'Solvency Ratio',
      },
      {
        PROXY_ACCEPTED: 'Using proxy',
      } as Record<string, string>,
    );

    expect(markdown).toContain('**Protocol:** ONOCOY');
    expect(markdown).toContain('## Data Source Summary');
    expect(markdown).toContain('Market context status: Reference');
    expect(markdown).toContain('Model source status: Saved pack');
    expect(markdown).toContain('Proxy metrics used: Solvency Ratio');
    expect(markdown).not.toContain('-999%');
  });
});
