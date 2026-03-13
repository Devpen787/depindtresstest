import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DTSEApplicabilityStage } from './DTSEApplicabilityStage';

describe('DTSEApplicabilityStage', () => {
  it('groups metrics into scored-now and held-out sections without foregrounding scenario-inactive items as exceptions', () => {
    render(
      <DTSEApplicabilityStage
        entries={[
          { metricId: 'solvency_ratio', verdict: 'R', reasonCode: 'PROXY_ACCEPTED', details: 'Proxy accepted for this run.' },
          { metricId: 'tail_risk_score', verdict: 'NR', reasonCode: 'DATA_MISSING', details: 'Tail-risk inputs are incomplete.' },
          { metricId: 'vampire_churn', verdict: 'NR', reasonCode: 'SCENARIO_INACTIVE', details: 'Competitive-yield stress is not active in this run, so vampire churn is held out.' },
        ]}
        metricLabels={{
          solvency_ratio: 'Solvency Ratio',
          tail_risk_score: 'Tail Risk Score',
          vampire_churn: 'Vampire Churn',
        }}
        metricInsights={{
          solvency_ratio: {
            metric_id: 'solvency_ratio',
            definition: 'Daily burn divided by daily mint.',
            why_relevant: 'It shows whether demand support is keeping up with issuance.',
            decision_use: 'Use it to read issuance quality.',
            target: 'Healthy > 1.3x',
            interpretation: { healthy: '', watchlist: '', intervention: '' },
          },
          tail_risk_score: {
            metric_id: 'tail_risk_score',
            definition: 'Composite tail fragility score.',
            why_relevant: 'It captures downside concentration.',
            decision_use: 'Use it to compare downside controls.',
            target: 'Healthy < 35',
            interpretation: { healthy: '', watchlist: '', intervention: '' },
          },
          vampire_churn: {
            metric_id: 'vampire_churn',
            definition: 'Competitive-yield churn pressure.',
            why_relevant: 'It shows rotation risk.',
            decision_use: 'Use it when the scenario activates competitive yield pressure.',
            target: 'Lower is better',
            interpretation: { healthy: '', watchlist: '', intervention: '' },
          },
        }}
        reasonLabels={{
          PROXY_ACCEPTED: 'Using proxy',
          DATA_MISSING: 'Data missing',
          SCENARIO_INACTIVE: 'Not used in this scenario',
        }}
      />,
    );

    expect(screen.getByText('Scoring summary')).toBeTruthy();
    expect(screen.getByText(/metrics are scoreable in this run\./)).toBeTruthy();
    expect(screen.getAllByText('Scored now').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Held out').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Proxy-backed').length).toBeGreaterThan(0);
    expect(screen.getByText('Coverage')).toBeTruthy();
    expect(screen.getByText(/Conclusion:/)).toBeTruthy();
    expect(screen.getByText(/Blind spot:/)).toBeTruthy();
    expect(screen.getByText('Metrics in this run')).toBeTruthy();
    expect(screen.getAllByText('View rationale').length).toBeGreaterThan(0);

    const exceptionsPanel = screen.getByText('Run constraints').closest('div');
    expect(exceptionsPanel).toBeTruthy();
    expect(within(exceptionsPanel as HTMLElement).getByText('Tail Risk Score')).toBeTruthy();
    expect((exceptionsPanel as HTMLElement).textContent).toContain('Data missing');
    expect(within(exceptionsPanel as HTMLElement).queryByText(/Vampire Churn/)).toBeNull();
    expect(screen.getByText('Solvency Ratio')).toBeTruthy();
    expect(screen.getByText('Economics')).toBeTruthy();
    expect(screen.getByText('Reads reward coverage')).toBeTruthy();
    expect(screen.getByText('Solvency Ratio: reads whether rewards cover emissions burden; usable here via weekly solvency aggregates.')).toBeTruthy();
    expect(within(exceptionsPanel as HTMLElement).queryByText('Solvency Ratio · Scored now · Using proxy')).toBeNull();
  });
});
