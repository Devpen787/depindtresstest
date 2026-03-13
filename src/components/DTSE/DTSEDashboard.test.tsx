import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PROTOCOL_PROFILES } from '../../data/protocols';
import { DTSEDashboard } from './DTSEDashboard';
import type { AggregateResult, SimulationParams } from '../../model/types';

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

const aggregatePoint = (t: number): AggregateResult => ({
  t,
  price: metric(1),
  supply: metric(1000),
  demand: metric(100),
  demandServed: metric(42),
  providers: metric(100),
  capacity: metric(120),
  servicePrice: metric(1),
  minted: metric(90),
  burned: metric(80),
  utilisation: metric(42),
  profit: metric(12),
  scarcity: metric(0),
  incentive: metric(0),
  buyPressure: metric(0),
  sellPressure: metric(0),
  netFlow: metric(0),
  churnCount: metric(1),
  joinCount: metric(1),
  solvencyScore: metric(1.45),
  netDailyLoss: metric(0),
  dailyMintUsd: metric(0),
  dailyBurnUsd: metric(0),
  urbanCount: metric(50),
  ruralCount: metric(50),
  weightedCoverage: metric(75),
  proCount: metric(10),
  treasuryBalance: metric(10000),
  vampireChurn: metric(0),
  mercenaryCount: metric(0),
  underwaterCount: metric(1),
  costPerCapacity: metric(1),
  revenuePerCapacity: metric(2),
  entryBarrierActive: metric(0),
});

const baseParams: SimulationParams = {
  scenario: 'baseline',
  T: 52,
  initialSupply: 810000000,
  initialPrice: 0.1,
  initialLiquidity: 500000,
  investorUnlockWeek: 20,
  investorSellPct: 0,
  maxMintWeekly: 5000000,
  burnPct: 0.65,
  demandType: 'consistent',
  baseDemand: 1000,
  demandVolatility: 0.05,
  macro: 'sideways',
  initialProviders: 3000,
  baseCapacityPerProvider: 1,
  capacityStdDev: 0.2,
  providerCostPerWeek: 150,
  costStdDev: 0.15,
  hardwareLeadTime: 2,
  churnThreshold: 0,
  profitThresholdToJoin: 15,
  maxProviderGrowthRate: 0.15,
  maxProviderChurnRate: 0.1,
  kBuyPressure: 0.08,
  kSellPressure: 0.12,
  kDemandPrice: 0.6,
  kMintPrice: 0.2,
  baseServicePrice: 0.5,
  servicePriceElasticity: 0.6,
  minServicePrice: 0.05,
  maxServicePrice: 5,
  rewardLagWeeks: 8,
  nSims: 25,
  seed: 42,
  competitorYield: 0,
  emissionModel: 'fixed',
  revenueStrategy: 'burn',
  hardwareCost: 1000,
  proTierPct: 0,
  proTierEfficiency: 1.5,
};

describe('DTSEDashboard', () => {
  it('renders the compact intro strip and trust chips for a saved-pack DTSE run', () => {
    const activeProfile = PROTOCOL_PROFILES.find((profile) => profile.metadata.id === 'ono_v3_calibrated');

    expect(activeProfile).toBeDefined();

    const { container } = render(
      <DTSEDashboard
        activeProfile={activeProfile}
        profiles={PROTOCOL_PROFILES}
        liveData={{}}
        simulationRunId={42}
      />,
    );

    expect(screen.getByText(/DTSE compares the selected stress contract to a matched baseline to show what weakens first\./)).toBeTruthy();
    expect(screen.getByText('Market context: Reference')).toBeTruthy();
    expect(screen.getByText('Model source: Saved pack')).toBeTruthy();
    expect(screen.getByText(/Scoring confidence:/)).toBeTruthy();

    const root = container.querySelector('[data-cy="dtse-dashboard-root"]');
    expect(root?.getAttribute('data-loading')).toBe('false');
    expect(root?.getAttribute('data-simulation-run-id')).toBe('42');
    expect(root?.getAttribute('data-selected-protocol-id')).toBe('ono_v3_calibrated');
    expect(root?.getAttribute('data-stress-channel-id')).toBe('baseline_neutral');
  });

  it('withholds Stage 2 conclusions while the selected DTSE run is still pending', () => {
    const activeProfile = PROTOCOL_PROFILES.find((profile) => profile.metadata.id === 'ono_v3_calibrated');

    expect(activeProfile).toBeDefined();

    render(
      <DTSEDashboard
        activeProfile={activeProfile}
        profiles={PROTOCOL_PROFILES}
        liveData={{}}
        params={baseParams}
        loading
        simulationRunId={0}
      />,
    );

    fireEvent.click(screen.getByText('What Can Be Scored'));

    expect(screen.getByText('Current run updating')).toBeTruthy();
    expect(screen.getByText(/depends on the selected run, not the saved pack/i)).toBeTruthy();
  });

  it('falls back to a scenario-aware saved pack when the run is unavailable but no longer pending', async () => {
    const activeProfile = PROTOCOL_PROFILES.find((profile) => profile.metadata.id === 'ono_v3_calibrated');

    expect(activeProfile).toBeDefined();

    render(
      <DTSEDashboard
        activeProfile={activeProfile}
        profiles={PROTOCOL_PROFILES}
        liveData={{}}
        params={{ ...baseParams, competitorYield: 1.5 }}
        simulationRunId={77}
      />,
    );

    fireEvent.click(screen.getByText('Failure Patterns'));

    expect(screen.queryByText('Current run unavailable')).toBeNull();
    expect((await screen.findAllByText('Elastic Provider Exit')).length).toBeGreaterThan(0);
  });

  it('uses saved sequence proof in Stage 3 when live outputs are unavailable', async () => {
    const activeProfile = PROTOCOL_PROFILES.find((profile) => profile.metadata.id === 'ono_v3_calibrated');

    expect(activeProfile).toBeDefined();

    render(
      <DTSEDashboard
        activeProfile={activeProfile}
        profiles={PROTOCOL_PROFILES}
        liveData={{}}
        params={{ ...baseParams, investorSellPct: 0.35, macro: 'bearish' }}
        simulationRunId={77}
      />,
    );

    fireEvent.click(screen.getByText('What Broke First'));

    expect(await screen.findByText(/breaks first at Week/i)).toBeTruthy();
    expect(await screen.findByText(/Matched baseline drift/i)).toBeTruthy();
  });

  it('keeps Stage 4 aligned with the saved sequence fallback when live baseline comparison data is missing', async () => {
    const activeProfile = PROTOCOL_PROFILES.find((profile) => profile.metadata.id === 'ono_v3_calibrated');

    expect(activeProfile).toBeDefined();

    render(
      <DTSEDashboard
        activeProfile={activeProfile}
        profiles={PROTOCOL_PROFILES}
        liveData={{}}
        params={{ ...baseParams, competitorYield: 1.5 }}
        aggregated={[aggregatePoint(0)]}
        simulationRunId={77}
      />,
    );

    fireEvent.click(screen.getByText('Failure Patterns'));

    await waitFor(() => {
      expect(screen.queryByText('No failure signatures in this run')).toBeNull();
    });
    expect((await screen.findAllByText('Elastic Provider Exit')).length).toBeGreaterThan(0);
  });

  it('withholds stale live outputs immediately after a DTSE stress change until the rerun resolves', () => {
    const activeProfile = PROTOCOL_PROFILES.find((profile) => profile.metadata.id === 'ono_v3_calibrated');

    expect(activeProfile).toBeDefined();

    const { rerender } = render(
      <DTSEDashboard
        activeProfile={activeProfile}
        profiles={PROTOCOL_PROFILES}
        liveData={{}}
        params={baseParams}
        aggregated={[aggregatePoint(0)]}
        simulationRunId={77}
      />,
    );

    rerender(
      <DTSEDashboard
        activeProfile={activeProfile}
        profiles={PROTOCOL_PROFILES}
        liveData={{}}
        params={{ ...baseParams, competitorYield: 1.5 }}
        aggregated={[aggregatePoint(0)]}
        simulationRunId={77}
      />,
    );

    fireEvent.click(screen.getByText('What Broke First'));

    expect(screen.getByText('Current run updating')).toBeTruthy();
    expect(screen.getByText(/depends on the selected run, not the saved pack/i)).toBeTruthy();
  });
});
