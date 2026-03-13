import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DTSESignatureStage } from './DTSESignatureStage';

describe('DTSESignatureStage', () => {
  it('renders a primary failure story and propagation chain for the leading signatures', () => {
    render(
      <DTSESignatureStage
        signatures={[
          {
            id: 'reward-demand-decoupling',
            label: 'Reward-Demand Decoupling',
            pattern: 'Reward issuance stays ahead of demand-linked support.',
            severity: 'critical',
            affected_metrics: ['solvency_ratio', 'payback_period'],
            why_it_matters: 'The network can look active while economic support weakens underneath it.',
          },
          {
            id: 'profitability-induced-churn',
            label: 'Profitability-Induced Churn',
            pattern: 'Provider economics weaken enough that operators begin exiting.',
            severity: 'high',
            affected_metrics: ['weekly_retention_rate'],
            why_it_matters: 'Churn compounds once operator tolerance is crossed.',
          },
        ]}
        metricLabels={{
          solvency_ratio: 'Solvency Ratio',
          payback_period: 'Payback Period',
          weekly_retention_rate: 'Weekly Retention',
        }}
      />,
    );

    expect(screen.getByText('Lead fracture in this run')).toBeTruthy();
    expect(screen.getAllByText('Reward-Demand Decoupling').length).toBeGreaterThan(0);
    expect(screen.getByText('Takeaway for this run')).toBeTruthy();
    expect(screen.getByText('Why this leads')).toBeTruthy();
    expect(screen.getByText('What it damages first')).toBeTruthy();
    expect(screen.getByText('Active signatures')).toBeTruthy();
    expect(screen.getByText('Watch first across the run')).toBeTruthy();
    expect(screen.getByText('How the fracture spreads')).toBeTruthy();
    expect(screen.getByText('Pattern details')).toBeTruthy();
    expect(screen.getByText('Starts with')).toBeTruthy();
    expect(screen.getByText('Feeds next:')).toBeTruthy();
    expect(screen.getAllByText('Reward-Demand Decoupling').length).toBeGreaterThan(1);
  });

  it('sanitizes implausible trigger logic before exposing advanced trigger copy', () => {
    render(
      <DTSESignatureStage
        signatures={[
          {
            id: 'liquidity-driven-compression',
            label: 'Liquidity-Driven Compression',
            pattern: 'Market stress compresses rewards faster than providers can adjust.',
            severity: 'high',
            affected_metrics: ['tail_risk_score'],
            trigger_logic: 'Triggered because price compression is -999%, max drawdown is 0%, and tail risk is 45.',
            why_it_matters: 'The market path reaches provider economics first.',
          },
        ]}
        metricLabels={{
          tail_risk_score: 'Tail Risk Score',
        }}
        showAdvanced
      />,
    );

    expect(screen.getByText('Lead fracture in this run')).toBeTruthy();
    expect(screen.queryByText(/Triggered by:/)).toBeNull();
    expect(screen.queryByText(/-999%/)).toBeNull();
  });

  it('preserves the provided signature order instead of re-sorting by severity', () => {
    render(
      <DTSESignatureStage
        signatures={[
          {
            id: 'elastic-provider-exit',
            label: 'Elastic Provider Exit',
            pattern: 'Competing yields pull providers away before internal demand visibly collapses.',
            severity: 'medium',
            affected_metrics: ['weekly_retention_rate'],
            why_it_matters: 'Mobile supply should lead the story in this run.',
          },
          {
            id: 'reward-demand-decoupling',
            label: 'Reward-Demand Decoupling',
            pattern: 'Rewards stay ahead of demand support.',
            severity: 'critical',
            affected_metrics: ['solvency_ratio'],
            why_it_matters: 'This remains severe, but not the lead fracture for this run.',
          },
        ]}
        metricLabels={{
          weekly_retention_rate: 'Weekly Retention',
          solvency_ratio: 'Solvency Ratio',
        }}
      />,
    );

    expect(screen.getAllByText('Elastic Provider Exit').length).toBeGreaterThan(0);
    expect(screen.getByText('Read this run first as Elastic Provider Exit. Mobile supply should lead the story in this run.')).toBeTruthy();
    expect(screen.getAllByText('Reward-Demand Decoupling').length).toBeGreaterThan(0);
  });
});
