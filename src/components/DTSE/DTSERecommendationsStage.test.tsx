import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DTSERecommendationsStage } from './DTSERecommendationsStage';

describe('DTSERecommendationsStage', () => {
  it('renders rerun-style recommendation cards with the new section labels', () => {
    render(
      <DTSERecommendationsStage
        recommendations={[
          {
            id: 'rec-1',
            priority: 'high',
            owner: 'Tokenomics lead',
            rationale: 'Solvency weakens before demand improves.',
            action: 'Rerun with lower net emissions and stronger demand sinks',
            expected_effect: 'Lower net emissions while holding the same stress contract.',
            timeframe: 'Next model review',
            success_metric: 'Solvency moves toward 1.30x+.',
            risk_if_delayed: 'The team can mistake subsidy persistence for resilience.',
          },
        ]}
        insights={[]}
        onExport={vi.fn()}
      />,
    );

    expect(screen.getByText('Stage 5 — Next Tests')).toBeTruthy();
    expect(screen.getByText('Decision story')).toBeTruthy();
    expect(screen.getByText('What this means')).toBeTruthy();
    expect(screen.getByText('Takeaway for discussion')).toBeTruthy();
    expect(screen.getByText('Start with this rerun')).toBeTruthy();
    expect(screen.getByText('Success signal')).toBeTruthy();
    expect(screen.getByText('Test whether demand support can catch up with reward spend')).toBeTruthy();
    expect(screen.getAllByText('Rerun with lower net emissions and stronger demand sinks').length).toBeGreaterThan(0);

    const recommendation = screen.getByText('Risk if ignored').closest('[data-cy^="dtse-rec-"]');
    expect(recommendation).toBeTruthy();
    expect(within(recommendation as HTMLElement).getByText('Why now')).toBeTruthy();
    expect(within(recommendation as HTMLElement).getByText('What to change in the rerun')).toBeTruthy();
    expect(within(recommendation as HTMLElement).getByText('What success looks like')).toBeTruthy();
    expect(within(recommendation as HTMLElement).getByText('Risk if ignored')).toBeTruthy();
  });

  it('keeps protocol meaning visible and sanitizes bad insight trigger strings', () => {
    render(
      <DTSERecommendationsStage
        recommendations={[
          {
            id: 'live-response-reward-demand-decoupling',
            priority: 'high',
            owner: 'Tokenomics lead',
            rationale: 'Solvency weakens before demand improves.',
            action: 'Rerun with lower net emissions and stronger demand sinks',
          },
        ]}
        insights={[
          {
            id: 'liquidity-exposure',
            title: 'Market stress reaches providers quickly',
            observation: 'Market compression reaches provider economics before physical capacity fully resets.',
            implication: 'The rerun should test downside controls before assuming the market path will self-correct.',
            trigger: 'Triggered because price compression is -999%, max drawdown is 0%, and tail risk is 45.',
            confidence: 'derived',
            provenance: ['Current run: tail risk 45'],
          },
        ]}
        onExport={vi.fn()}
      />,
    );

    expect(screen.getByText('Decision story')).toBeTruthy();
    expect(screen.getByText('Protocol meaning for this run')).toBeTruthy();
    expect(screen.getAllByText('Market stress reaches providers quickly').length).toBeGreaterThan(0);
    expect(screen.getByText('Protocol structure and current DTSE readout.')).toBeTruthy();
    expect(screen.queryByText(/-999%/)).toBeNull();
  });
});
