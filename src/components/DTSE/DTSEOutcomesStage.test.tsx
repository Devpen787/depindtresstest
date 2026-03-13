import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DTSEOutcomesStage } from './DTSEOutcomesStage';

describe('DTSEOutcomesStage', () => {
  it('shows a compact no-drift state when baseline deltas are materially flat', () => {
    const { container } = render(
      <DTSEOutcomesStage
        outcomes={[
          { metric_id: 'solvency_ratio', value: 0, band: 'intervention' },
        ]}
        metricLabels={{ solvency_ratio: 'Solvency Ratio' }}
        unitMap={{ solvency_ratio: 'x' }}
        applicabilityEntries={[]}
        metricInsights={{
          solvency_ratio: {
            metric_id: 'solvency_ratio',
            definition: 'Revenue coverage relative to emissions burden.',
            why_relevant: 'It shows whether issuance quality is holding up.',
            decision_use: 'Use it to read issuance discipline.',
            target: 'Healthy > 1.3x',
            interpretation: { healthy: '', watchlist: '', intervention: '' },
          },
        }}
        thresholdConfigMap={{
          solvency_ratio: {
            healthyTarget: 1.3,
            direction: 'higher',
            label: '1.30x',
          },
        }}
        sequenceView={{
          deviationSeries: [
            {
              week: 1,
              profitabilityDeltaPct: 0,
              priceDeltaPct: 0,
              providerDeltaPct: 0,
              utilizationDeltaPct: 0,
              solvencyDeltaPct: 0,
              retentionDeltaPct: 0,
            },
          ],
          pathway: [
            {
              familyId: 'profitability',
              label: 'Provider Profitability',
              triggerWeek: 1,
              triggerLabel: 'Provider margin compresses before supply visibly exits.',
              detail: 'Tracks profitability drift.',
              cells: [{ week: 1, severity: 'alert' }],
            },
          ],
          earliestTriggerWeek: 1,
          earliestTriggerLabel: 'Provider Profitability',
          illusionWarning: 'Node count is a lagging indicator.',
        }}
        stressChannel={{
          id: 'liquidity_shock',
          label: 'Liquidity Shock',
          summary: 'A sell-side dislocation compresses token price and rewards.',
          basis: 'Triggered by investor sell pressure.',
        }}
      />,
    );

    expect(screen.getByText('No material baseline drift in this run.')).toBeTruthy();
    expect(screen.getByText('Failure sequence in this run')).toBeTruthy();
    expect(screen.getByText('Stress enters through')).toBeTruthy();
    expect(screen.getByText('Moves first')).toBeTruthy();
    expect(screen.getByText('First break claim')).toBeTruthy();
    expect(screen.getAllByText('First break').length).toBeGreaterThan(0);
    expect(screen.getByText('Provider Profitability breaks first at Week 1.')).toBeTruthy();
    expect(container.querySelector('[data-cy="dtse-baseline-drift-chart"]')).toBeNull();
    expect(screen.getByText('0.00')).toBeTruthy();
  });

  it('withholds the drift proof chart when the lead-family proxy does not support the claimed break', () => {
    const { container } = render(
      <DTSEOutcomesStage
        outcomes={[
          { metric_id: 'solvency_ratio', value: 0.72, band: 'intervention' },
        ]}
        metricLabels={{ solvency_ratio: 'Solvency Ratio' }}
        unitMap={{ solvency_ratio: 'x' }}
        applicabilityEntries={[]}
        metricInsights={{
          solvency_ratio: {
            metric_id: 'solvency_ratio',
            definition: 'Revenue coverage relative to emissions burden.',
            why_relevant: 'It shows whether issuance quality is holding up.',
            decision_use: 'Use it to read issuance discipline.',
            target: 'Healthy > 1.3x',
            interpretation: { healthy: '', watchlist: '', intervention: '' },
          },
        }}
        thresholdConfigMap={{
          solvency_ratio: {
            healthyTarget: 1.3,
            direction: 'higher',
            label: '1.30x',
          },
        }}
        sequenceView={{
          deviationSeries: [
            {
              week: 1,
              profitabilityDeltaPct: 215,
              priceDeltaPct: 0,
              providerDeltaPct: -12,
              utilizationDeltaPct: 6,
              solvencyDeltaPct: 3,
              retentionDeltaPct: 0,
            },
            {
              week: 2,
              profitabilityDeltaPct: 148,
              priceDeltaPct: 2,
              providerDeltaPct: -14,
              utilizationDeltaPct: 5,
              solvencyDeltaPct: 7,
              retentionDeltaPct: -6,
            },
          ],
          pathway: [
            {
              familyId: 'profitability',
              label: 'Provider Profitability',
              triggerWeek: 1,
              triggerLabel: 'Provider margin compresses before supply visibly exits.',
              detail: 'Tracks profitability drift.',
              cells: [{ week: 1, severity: 'alert' }, { week: 2, severity: 'alert' }],
            },
          ],
          earliestTriggerWeek: 1,
          earliestTriggerLabel: 'Provider Profitability',
          illusionWarning: 'Node count is a lagging indicator.',
        }}
        stressChannel={{
          id: 'competitive_yield_pressure',
          label: 'Competitive-Yield Pressure',
          summary: 'Outside yield alternatives pull providers away.',
          basis: 'Triggered by competitor-yield spread.',
        }}
      />,
    );

    expect(screen.getByText('Drift proof withheld')).toBeTruthy();
    expect(screen.getByText(/no clean matched-baseline move appears within the first-break window/i)).toBeTruthy();
    expect(container.querySelector('[data-cy="dtse-baseline-drift-chart"]')).toBeNull();
  });

  it('shows drift proof when the lead-family move appears shortly after the trigger week', () => {
    const { container } = render(
      <DTSEOutcomesStage
        outcomes={[
          { metric_id: 'weekly_retention_rate', value: 88.1, band: 'watchlist' },
        ]}
        metricLabels={{ weekly_retention_rate: 'Weekly Retention' }}
        unitMap={{ weekly_retention_rate: '%' }}
        applicabilityEntries={[]}
        metricInsights={{
          weekly_retention_rate: {
            metric_id: 'weekly_retention_rate',
            definition: 'Share of active providers retained week-over-week.',
            why_relevant: 'It shows when stickiness weakens.',
            decision_use: 'Use it to read provider stability.',
            target: 'Healthy > 92%',
            interpretation: { healthy: '', watchlist: '', intervention: '' },
          },
        }}
        thresholdConfigMap={{
          weekly_retention_rate: {
            healthyTarget: 92,
            direction: 'higher',
            label: '92%',
          },
        }}
        sequenceView={{
          deviationSeries: [
            {
              week: 1,
              profitabilityDeltaPct: 4,
              priceDeltaPct: 0,
              providerDeltaPct: -8,
              utilizationDeltaPct: 2,
              solvencyDeltaPct: 3,
              retentionDeltaPct: 0,
            },
            {
              week: 2,
              profitabilityDeltaPct: 6,
              priceDeltaPct: 1,
              providerDeltaPct: -10,
              utilizationDeltaPct: 1,
              solvencyDeltaPct: 4,
              retentionDeltaPct: -14,
            },
          ],
          pathway: [
            {
              familyId: 'retention_churn',
              label: 'Retention / Churn',
              triggerWeek: 1,
              triggerLabel: 'Operators start exiting after economics weaken.',
              detail: 'Confirms when provider retention finally breaks after upstream stress signals move first.',
              cells: [{ week: 1, severity: 'critical' }, { week: 2, severity: 'critical' }],
            },
          ],
          earliestTriggerWeek: 1,
          earliestTriggerLabel: 'Retention / Churn',
          illusionWarning: 'Node count is a lagging indicator.',
        }}
        stressChannel={{
          id: 'competitive_yield_pressure',
          label: 'Competitive-Yield Pressure',
          summary: 'Outside yield alternatives pull providers away.',
          basis: 'Triggered by competitor-yield spread.',
        }}
      />,
    );

    expect(screen.queryByText('Drift proof withheld')).toBeNull();
    expect(container.querySelector('[data-cy="dtse-baseline-drift-chart"]')).toBeTruthy();
    expect(screen.getAllByText('Retention / churn drift').length).toBeGreaterThan(0);
  });
});
