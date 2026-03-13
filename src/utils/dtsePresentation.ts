import type { DTSEApplicabilityEntry, DTSERunContext } from '../types/dtse';

export type DTSEMarketContextStatus = 'Live' | 'Reference';
export type DTSEModelSourceStatus = 'Current run' | 'Saved pack';
export type DTSEScoringConfidenceStatus = 'Full' | 'Partial' | 'Limited';

export interface DTSETrustSummary {
  marketContextStatus: DTSEMarketContextStatus;
  modelSourceStatus: DTSEModelSourceStatus;
  scoringConfidenceStatus: DTSEScoringConfidenceStatus;
  proxyMetricLabels: string[];
  fallbackReferenceValuesUsed: string[];
}

interface BuildDTSETrustSummaryOptions {
  hasLiveMarketContext: boolean;
  hasCurrentRunOutputs: boolean;
  evidenceStatus: DTSERunContext['evidence_status'];
  applicability: DTSEApplicabilityEntry[];
  metricLabels: Record<string, string>;
}

const CONFIDENCE_LABEL_BY_EVIDENCE: Record<DTSERunContext['evidence_status'], DTSEScoringConfidenceStatus> = {
  complete: 'Full',
  partial: 'Partial',
  missing: 'Limited',
};

export function formatDTSEUsdPrice(value: number): string {
  if (!Number.isFinite(value)) return '$0.00';

  const absolute = Math.abs(value);
  const prefix = value < 0 ? '-$' : '$';

  if (absolute === 0) {
    return '$0.00';
  }

  if (absolute >= 1) {
    return `${prefix}${absolute.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (absolute >= 0.01) {
    return `${prefix}${absolute.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })}`;
  }

  return `${prefix}${new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 6,
    useGrouping: false,
  }).format(absolute)}`;
}

export function formatDTSEMetricValue(metricId: string, value: number): string {
  if (!Number.isFinite(value)) return 'N/A';

  if (metricId === 'solvency_ratio') {
    if (value >= 3) {
      return '≥3.00';
    }
    if (value !== 0 && Math.abs(value) < 0.01) {
      return value > 0 ? '<0.01' : '>-0.01';
    }
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (metricId === 'weekly_retention_rate' || metricId === 'network_utilization') {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  if (metricId === 'payback_period') {
    if (value >= 60) {
      return '60+';
    }
    if (value > 0 && value < 0.1) {
      return '<0.1';
    }
    return value.toLocaleString('en-US', {
      minimumFractionDigits: value < 10 ? 1 : 0,
      maximumFractionDigits: 1,
    });
  }

  if (metricId === 'tail_risk_score' || metricId === 'vampire_churn') {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function buildDTSETrustSummary({
  hasLiveMarketContext,
  hasCurrentRunOutputs,
  evidenceStatus,
  applicability,
  metricLabels,
}: BuildDTSETrustSummaryOptions): DTSETrustSummary {
  const proxyMetricLabels = Array.from(
    new Set(
      applicability
        .filter((entry) => entry.reasonCode === 'PROXY_ACCEPTED')
        .map((entry) => metricLabels[entry.metricId] ?? entry.metricId),
    ),
  );

  const fallbackReferenceValuesUsed: string[] = [];

  if (!hasLiveMarketContext) {
    fallbackReferenceValuesUsed.push('Saved reference market values for price, market cap, and supply context');
  }

  if (!hasCurrentRunOutputs) {
    fallbackReferenceValuesUsed.push('Saved DTSE pack outputs for scored results, patterns, and next tests');
  }

  const scoringConfidenceStatus = hasCurrentRunOutputs
    ? CONFIDENCE_LABEL_BY_EVIDENCE[evidenceStatus]
    : 'Limited';

  return {
    marketContextStatus: hasLiveMarketContext ? 'Live' : 'Reference',
    modelSourceStatus: hasCurrentRunOutputs ? 'Current run' : 'Saved pack',
    scoringConfidenceStatus,
    proxyMetricLabels,
    fallbackReferenceValuesUsed,
  };
}

export function sanitizeDTSETriggerText(text?: string): string | undefined {
  if (!text) return undefined;

  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return undefined;

  if (
    /price compression is -?\d{4,}%/i.test(normalized)
    || /-999%/.test(normalized)
    || /max drawdown is 0%/i.test(normalized)
  ) {
    return undefined;
  }

  return normalized;
}
