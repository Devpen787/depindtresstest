import type { MetricEvidence } from './metricEvidence';
import type {
    DTSEApplicabilityEntry,
    DTSEApplicabilityReasonCode,
    DTSEApplicabilityVerdict,
    DTSEOverrideMetadata,
} from '../types/dtse';

/**
 * Structured reason codes for DTSE applicability decisions.
 */
export const DTSE_APPLICABILITY_REASON_CODES: Readonly<Record<DTSEApplicabilityReasonCode, string>> = {
    DATA_AVAILABLE: 'Primary or secondary data is available and sufficient.',
    DATA_MISSING: 'Required data is missing entirely.',
    SOURCE_GRADE_INSUFFICIENT: 'Source grade does not meet minimum threshold for this metric.',
    MANUAL_OVERRIDE: 'Applicability was manually overridden by a reviewer.',
    PROXY_ACCEPTED: 'Proxy-grade source accepted under current evaluation policy.',
    INTERPOLATION_RISK: 'Interpolated data carries elevated uncertainty; flagged for review.',
} as const;

const RUNNABLE_SOURCE_GRADES = new Set(['primary', 'secondary']);

/**
 * Evaluate whether a metric is Runnable (R) or Not Runnable (NR) for DTSE
 * based on its evidence record.
 */
export function evaluateApplicability(
    metricId: string,
    evidence: MetricEvidence,
): DTSEApplicabilityEntry {
    if (!evidence.sourceUrlOrQueryId && !evidence.definition) {
        return entry(metricId, 'NR', 'DATA_MISSING', 'No source or definition available.');
    }

    if (evidence.sourceGrade === 'interpolated') {
        return entry(metricId, 'NR', 'INTERPOLATION_RISK', `Interpolated source for ${metricId}.`);
    }

    if (evidence.sourceGrade === 'proxy') {
        if (evidence.reproducibilityStatus === 'runnable') {
            return entry(metricId, 'R', 'PROXY_ACCEPTED', `Proxy source accepted (runnable) for ${metricId}.`);
        }
        return entry(metricId, 'NR', 'SOURCE_GRADE_INSUFFICIENT', `Proxy source is not runnable for ${metricId}.`);
    }

    if (RUNNABLE_SOURCE_GRADES.has(evidence.sourceGrade)) {
        return entry(metricId, 'R', 'DATA_AVAILABLE');
    }

    return entry(metricId, 'NR', 'SOURCE_GRADE_INSUFFICIENT', `Unrecognized source grade: ${evidence.sourceGrade}.`);
}

/**
 * Apply a manual override to an existing applicability entry.
 * The override metadata (reviewer, timestamp, reason) is attached and the
 * verdict is flipped according to the reviewer's decision.
 */
export function applyOverride(
    existing: DTSEApplicabilityEntry,
    override: DTSEOverrideMetadata,
): DTSEApplicabilityEntry {
    const newVerdict: DTSEApplicabilityVerdict = existing.verdict === 'R' ? 'NR' : 'R';
    return {
        ...existing,
        verdict: newVerdict,
        reasonCode: 'MANUAL_OVERRIDE',
        details: override.reason,
        override,
    };
}

function entry(
    metricId: string,
    verdict: DTSEApplicabilityVerdict,
    reasonCode: DTSEApplicabilityReasonCode,
    details?: string,
): DTSEApplicabilityEntry {
    return { metricId, verdict, reasonCode, ...(details ? { details } : {}) };
}
