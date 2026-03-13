import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DTSEContextStage } from './DTSEContextStage';

describe('DTSEContextStage', () => {
  it('formats generated dates with an unambiguous month-name format', () => {
    render(
      <DTSEContextStage
        protocolBrief={{
          protocol_id: 'ono_v3_calibrated',
          protocol_name: 'ONOCOY',
          chain: 'Solana',
          mechanism: 'Burn-and-mint',
          depin_surface: 'GNSS reference-station network for high-precision positioning.',
          supply_count: 810_000_000,
          supply_unit: 'tokens',
          supply_structure: 'Capped',
          token_price_usd: 0.1,
          market_cap_usd: 81_000_000,
          weekly_emissions: 5_000_000,
          weekly_emissions_unit: 'tokens/week',
          burn_fraction_pct: 65,
          active_providers: 3_000,
          active_providers_unit: 'stations',
          demand_signal: 'Enterprise demand depends on coverage quality.',
          supply_signal: 'Providers operate stations.',
          token_utility: ['Provider rewards'],
          notes: 'Coverage density and reward discipline are resilience levers.',
        }}
        modelVersion="Agent-Based v2"
        generatedAt="2026-03-07T00:00:00.000Z"
        horizonWeeks={52}
        nSims={25}
        stressChannel={{
          id: 'liquidity_shock',
          label: 'Liquidity Shock',
          summary: 'A sell-side dislocation compresses token price and rewards.',
          basis: 'Triggered by investor sell pressure.',
        }}
      />,
    );

    expect(screen.getByText('Protocol')).toBeTruthy();
    expect(screen.getByText('Stress')).toBeTruthy();
    expect(screen.getByText('Run / model')).toBeTruthy();
    expect(screen.getByText('Confidence')).toBeTruthy();
    expect(screen.getByText('Scored')).toBeTruthy();
    expect(screen.getByText('Held out')).toBeTruthy();
    expect(screen.getByText('Baseline mechanism map')).toBeTruthy();
    expect(screen.getAllByText('Likely pressure point').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Provider economics compress first').length).toBeGreaterThan(0);
    expect(screen.getByText(/Run briefing:/)).toBeTruthy();
    expect(screen.getByText('Identify the protocol, the stress contract, and where pressure is most likely to show first.')).toBeTruthy();
    expect(screen.getByText(/Burn-and-mint/)).toBeTruthy();
    expect(screen.getAllByText('Liquidity Shock').length).toBeGreaterThan(0);
    expect(screen.getByText(/Mar 7, 2026/)).toBeTruthy();
  });
});
