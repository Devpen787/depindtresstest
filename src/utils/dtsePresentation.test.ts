import { describe, expect, it } from 'vitest';
import { buildDTSETrustSummary, formatDTSEMetricValue, formatDTSEUsdPrice, sanitizeDTSETriggerText } from './dtsePresentation';

describe('dtsePresentation', () => {
  it('formats DTSE prices without collapsing small values to zero', () => {
    expect(formatDTSEUsdPrice(12.345)).toBe('$12.35');
    expect(formatDTSEUsdPrice(0.125678)).toBe('$0.1257');
    expect(formatDTSEUsdPrice(0.004321)).toBe('$0.004321');
    expect(formatDTSEUsdPrice(0)).toBe('$0.00');
  });

  it('formats small DTSE metric values without collapsing trust-sensitive ratios to zero', () => {
    expect(formatDTSEMetricValue('solvency_ratio', 0)).toBe('0.00');
    expect(formatDTSEMetricValue('solvency_ratio', 0.0042)).toBe('<0.01');
    expect(formatDTSEMetricValue('solvency_ratio', 3)).toBe('≥3.00');
    expect(formatDTSEMetricValue('weekly_retention_rate', 92.23)).toBe('92.2');
    expect(formatDTSEMetricValue('payback_period', 60)).toBe('60+');
    expect(formatDTSEMetricValue('payback_period', 0.04)).toBe('<0.1');
  });

  it('builds trust summary fields for export and UI chips', () => {
    const summary = buildDTSETrustSummary({
      hasLiveMarketContext: false,
      hasCurrentRunOutputs: true,
      evidenceStatus: 'partial',
      applicability: [
        { metricId: 'solvency_ratio', verdict: 'R', reasonCode: 'PROXY_ACCEPTED' },
        { metricId: 'vampire_churn', verdict: 'NR', reasonCode: 'SCENARIO_INACTIVE' },
      ],
      metricLabels: {
        solvency_ratio: 'Solvency Ratio',
        vampire_churn: 'Vampire Churn',
      },
    });

    expect(summary.marketContextStatus).toBe('Reference');
    expect(summary.modelSourceStatus).toBe('Current run');
    expect(summary.scoringConfidenceStatus).toBe('Partial');
    expect(summary.proxyMetricLabels).toEqual(['Solvency Ratio']);
    expect(summary.fallbackReferenceValuesUsed[0]).toContain('Saved reference market values');
  });

  it('downgrades confidence when DTSE is using saved-pack outputs', () => {
    const summary = buildDTSETrustSummary({
      hasLiveMarketContext: false,
      hasCurrentRunOutputs: false,
      evidenceStatus: 'complete',
      applicability: [],
      metricLabels: {},
    });

    expect(summary.modelSourceStatus).toBe('Saved pack');
    expect(summary.scoringConfidenceStatus).toBe('Limited');
  });

  it('drops implausible trigger narratives', () => {
    expect(sanitizeDTSETriggerText('price compression is -999%, max drawdown is 0%')).toBeUndefined();
    expect(sanitizeDTSETriggerText('Tail risk is elevated under the current liquidity window.')).toBe('Tail risk is elevated under the current liquidity window.');
  });
});
