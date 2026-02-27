import { describe, expect, it } from 'vitest';
import type { DTSEFailureSignature, DTSEOutcome } from '../types/dtse';
import { buildLiveDTSERecommendations } from './dtseLiveRecommendations';

describe('dtseLiveRecommendations', () => {
  it('selects trigger-driven recommendations from live signatures', () => {
    const signatures: DTSEFailureSignature[] = [
      {
        id: 'live-subsidy-trap',
        label: 'Subsidy Trap',
        pattern: '',
        severity: 'critical',
        affected_metrics: ['solvency_ratio', 'payback_period'],
      },
      {
        id: 'live-demand-gap',
        label: 'Demand Gap',
        pattern: '',
        severity: 'high',
        affected_metrics: ['network_utilization'],
      },
    ];

    const outcomes: DTSEOutcome[] = [
      { metric_id: 'solvency_ratio', value: 0.88, band: 'intervention' },
      { metric_id: 'payback_period', value: 34, band: 'watchlist' },
      { metric_id: 'weekly_retention_rate', value: 91, band: 'watchlist' },
      { metric_id: 'network_utilization', value: 18, band: 'intervention' },
      { metric_id: 'tail_risk_score', value: 68, band: 'intervention' },
    ];

    const recommendations = buildLiveDTSERecommendations(signatures, outcomes, {
      protocolName: 'Onocoy',
      peerNames: ['GEODNET', 'Helium'],
    });

    expect(recommendations).toHaveLength(2);
    expect(recommendations[0].id).toBe('live-rec-subsidy-trap');
    expect(recommendations[0].priority).toBe('critical');
    expect(recommendations[0].expected_effect).toContain('1.30x+');
    expect(recommendations[1].id).toBe('live-rec-demand-gap');
    expect(recommendations[1].peer_analog).toContain('GEODNET');
  });

  it('returns a low-priority monitoring recommendation when no signatures fire', () => {
    const recommendations = buildLiveDTSERecommendations([], [], {
      protocolName: 'Onocoy',
    });

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].priority).toBe('low');
    expect(recommendations[0].action).toContain('Maintain current posture');
  });
});
