import { GUARDRAIL_BAND_LABELS, type GuardrailBand } from '../constants/guardrails';
import type { MetricEvidence } from '../data/metricEvidence';
import type {
    DecisionBriefAction,
    DecisionBriefContext,
    DecisionEvidenceStatus,
    DecisionBriefDriver,
    DecisionBriefEvidenceRef,
    DecisionBriefFreshness,
    DecisionBriefPayload,
    DecisionConfidenceLabel,
    DecisionFreshnessLabel,
    DecisionVerdict
} from '../types/decisionBrief';
import { resolveKpiOwnerVersions } from '../audit/kpiOwnerRegistry';

const SOURCE_GRADE_SCORE: Record<MetricEvidence['sourceGrade'], number> = {
    primary: 0.95,
    secondary: 0.82,
    proxy: 0.62,
    interpolated: 0.45
};

const REPRODUCIBILITY_SCORE: Record<MetricEvidence['reproducibilityStatus'], number> = {
    runnable: 0.08,
    not_runnable: -0.08
};

const FRESHNESS_SCORE: Record<DecisionFreshnessLabel, number> = {
    Fresh: 0.04,
    Recent: 0.02,
    Stale: -0.06,
    Unknown: -0.1
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export const classifyFreshness = (asOf?: string | Date | null): DecisionBriefFreshness => {
    if (!asOf) {
        return { label: 'Unknown' };
    }

    const asDate = typeof asOf === 'string' ? new Date(asOf) : asOf;
    if (Number.isNaN(asDate.getTime())) {
        return { label: 'Unknown' };
    }

    const ageMinutes = Math.max(0, (Date.now() - asDate.getTime()) / 60000);
    let label: DecisionFreshnessLabel = 'Stale';
    if (ageMinutes <= 30) label = 'Fresh';
    else if (ageMinutes <= 240) label = 'Recent';

    return {
        label,
        asOfUtc: asDate.toISOString(),
        ageMinutes: Math.round(ageMinutes)
    };
};

export const toConfidenceLabel = (score: number): DecisionConfidenceLabel => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
};

export const computeConfidenceScore = (
    evidence: DecisionBriefEvidenceRef[],
    freshness: DecisionBriefFreshness
): number => {
    if (evidence.length === 0) return 0.25;

    const total = evidence.reduce((acc, item) => {
        return acc + SOURCE_GRADE_SCORE[item.sourceGrade] + REPRODUCIBILITY_SCORE[item.reproducibilityStatus];
    }, 0);
    const base = total / evidence.length;
    return clamp(base + FRESHNESS_SCORE[freshness.label], 0.2, 0.98);
};

interface BuildDecisionBriefInput {
    context: DecisionBriefContext;
    verdict: DecisionVerdict;
    guardrailBand: GuardrailBand;
    summary: string;
    drivers: DecisionBriefDriver[];
    actions: DecisionBriefAction[];
    evidence: Array<MetricEvidence | undefined>;
    asOfUtc?: string | Date | null;
    reproducibility?: {
        runId?: string | number;
        runTimestampUtc?: string | Date;
        paramsSnapshot?: Record<string, unknown>;
    };
}

const classifyEvidenceStatus = (
    evidenceRefs: DecisionBriefEvidenceRef[],
    expectedEvidenceCount: number
): DecisionEvidenceStatus => {
    if (evidenceRefs.length === 0) {
        return 'missing';
    }

    const hasMissingEvidence = evidenceRefs.length < expectedEvidenceCount;
    const hasNonRunnableEvidence = evidenceRefs.some((item) => item.reproducibilityStatus !== 'runnable');

    if (hasMissingEvidence || hasNonRunnableEvidence) {
        return 'partial';
    }

    return 'complete';
};

const applyEvidencePolicy = (
    verdict: DecisionVerdict,
    evidenceStatus: DecisionEvidenceStatus
): { verdict: DecisionVerdict; policyNotes: string[] } => {
    if (evidenceStatus !== 'complete' && verdict === 'go') {
        return {
            verdict: 'hold',
            policyNotes: ['Verdict downgraded to HOLD because evidence status is not complete.']
        };
    }

    return { verdict, policyNotes: [] };
};

const normalizeForStableStringify = (value: unknown): unknown => {
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) {
        return value.map((item) => normalizeForStableStringify(item));
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, val]) => [key, normalizeForStableStringify(val)]);
        return Object.fromEntries(entries);
    }
    return value;
};

const stableStringify = (value: unknown): string => JSON.stringify(normalizeForStableStringify(value));

const hashString = (value: string): string => {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
};

export const buildDecisionBrief = ({
    context,
    verdict,
    guardrailBand,
    summary,
    drivers,
    actions,
    evidence,
    asOfUtc,
    reproducibility
}: BuildDecisionBriefInput): DecisionBriefPayload => {
    const expectedEvidenceCount = evidence.length;
    const evidenceRefs: DecisionBriefEvidenceRef[] = evidence
        .filter((item): item is MetricEvidence => Boolean(item))
        .map((item) => ({
            metricId: item.metricId,
            sourceGrade: item.sourceGrade,
            reproducibilityStatus: item.reproducibilityStatus,
            timeWindow: item.timeWindow,
            sourceUrlOrQueryId: item.sourceUrlOrQueryId,
            extractionTimestampUtc: item.extractionTimestampUtc
        }));
    const evidenceStatus = classifyEvidenceStatus(evidenceRefs, expectedEvidenceCount);
    const verdictWithPolicy = applyEvidencePolicy(verdict, evidenceStatus);

    const paramsSnapshot = reproducibility?.paramsSnapshot || {};
    const normalizedParams = stableStringify(paramsSnapshot);
    const providedRunTimestamp = reproducibility?.runTimestampUtc
        ? (reproducibility.runTimestampUtc instanceof Date
            ? reproducibility.runTimestampUtc
            : new Date(reproducibility.runTimestampUtc))
        : null;
    const runTimestamp = providedRunTimestamp && !Number.isNaN(providedRunTimestamp.getTime())
        ? providedRunTimestamp.toISOString()
        : new Date().toISOString();
    const runId = reproducibility?.runId !== undefined && reproducibility?.runId !== null
        ? String(reproducibility.runId)
        : `run_${hashString(`${context.protocolId || context.protocolName}_${runTimestamp}_${normalizedParams}`)}`;
    const metricIdsForOwnership = Array.from(new Set([
        ...drivers.map((driver) => driver.metricId),
        ...evidenceRefs.map((item) => item.metricId)
    ]));
    const kpiOwnerVersions = resolveKpiOwnerVersions(metricIdsForOwnership);
    const freshness = classifyFreshness(asOfUtc ?? runTimestamp ?? evidenceRefs[0]?.extractionTimestampUtc);
    const confidenceScore = computeConfidenceScore(evidenceRefs, freshness);

    return {
        generatedAtUtc: new Date().toISOString(),
        runId,
        context,
        reproducibility: {
            runTimestampUtc: runTimestamp,
            paramsSnapshot,
            paramsHash: hashString(normalizedParams)
        },
        kpiOwnerVersions,
        verdict: verdictWithPolicy.verdict,
        initialVerdict: verdict,
        evidenceStatus,
        policyNotes: verdictWithPolicy.policyNotes,
        guardrailBand,
        summary,
        confidenceScore,
        confidenceLabel: toConfidenceLabel(confidenceScore),
        freshness,
        drivers,
        actions,
        evidence: evidenceRefs
    };
};

const toSafeSlug = (value: string): string =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const EXPORT_TOAST_TIMEOUT_KEY = '__decisionBriefExportToastTimeoutId';
type DownloadDecisionBriefOptions = {
    showToast?: boolean;
};

const showExportToast = (filename: string): void => {
    const existingToast = document.querySelector<HTMLElement>('[data-cy="export-toast"]');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.setAttribute('data-cy', 'export-toast');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.className = 'fixed bottom-4 right-4 z-[140] rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 shadow-lg shadow-emerald-900/30';
    toast.textContent = `Exported ${filename}`;
    document.body.appendChild(toast);

    const timeoutHost = window as typeof window & { [EXPORT_TOAST_TIMEOUT_KEY]?: number };
    if (typeof timeoutHost[EXPORT_TOAST_TIMEOUT_KEY] === 'number') {
        window.clearTimeout(timeoutHost[EXPORT_TOAST_TIMEOUT_KEY]);
    }
    timeoutHost[EXPORT_TOAST_TIMEOUT_KEY] = window.setTimeout(() => {
        toast.remove();
    }, 2200);
};

export const downloadDecisionBrief = (
    brief: DecisionBriefPayload,
    filename?: string,
    options?: DownloadDecisionBriefOptions
): void => {
    const fallbackName = `decision-brief-${toSafeSlug(brief.context.surface)}-${new Date().toISOString().slice(0, 10)}.json`;
    const resolvedFilename = filename || fallbackName;
    if (options?.showToast !== false) {
        showExportToast(resolvedFilename);
    }
    const blob = new Blob([JSON.stringify(brief, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = resolvedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const formatList = (items: string[]): string => items.length ? items.map((item) => `- ${item}`).join('\n') : '- None';

export const formatDecisionBriefMarkdown = (brief: DecisionBriefPayload): string => {
    const ownerVersionLines = Object.entries(brief.kpiOwnerVersions)
        .map(([family, details]) => `${family}: ${details.owner} (${details.version})`);

    const driverLines = brief.drivers.map((driver) =>
        `1. **${driver.label}:** ${driver.value}\n- Trigger: ${driver.threshold}\n- Metric: \`${driver.metricId}\``
    );

    const actionLines = brief.actions.map((action) =>
        `1. **${action.action}**\n- Owner: ${action.ownerRole}\n- Trigger: ${action.trigger}\n- Expected effect: ${action.expectedEffect}`
    );

    const evidenceLines = brief.evidence.map((evidence) =>
        `1. \`${evidence.metricId}\` (${evidence.sourceGrade}, ${evidence.reproducibilityStatus})\n- Source: ${evidence.sourceUrlOrQueryId}\n- Time window: ${evidence.timeWindow}`
    );

    return [
        '# Decision Brief',
        '',
        `- Generated: ${brief.generatedAtUtc}`,
        `- Protocol: ${brief.context.protocolName} (${brief.context.protocolId || 'n/a'})`,
        `- Scenario: ${brief.context.scenarioName} (${brief.context.scenarioId || 'n/a'})`,
        `- Surface: ${brief.context.surface}`,
        `- Model: ${brief.context.modelVersion}`,
        '',
        '## Verdict',
        '',
        `- Initial verdict: ${brief.initialVerdict.toUpperCase()}`,
        `- Final verdict: ${brief.verdict.toUpperCase()}`,
        `- Guardrail band: ${GUARDRAIL_BAND_LABELS[brief.guardrailBand]}`,
        `- Evidence status: ${brief.evidenceStatus}`,
        `- Confidence: ${Math.round(brief.confidenceScore * 100)}% (${brief.confidenceLabel})`,
        `- Freshness: ${brief.freshness.label}${brief.freshness.asOfUtc ? ` (as of ${brief.freshness.asOfUtc})` : ''}`,
        '',
        '## Summary',
        '',
        brief.summary,
        '',
        '## Policy Notes',
        '',
        formatList(brief.policyNotes),
        '',
        '## Top Drivers',
        '',
        driverLines.length ? driverLines.join('\n') : '- None',
        '',
        '## Actions',
        '',
        actionLines.length ? actionLines.join('\n') : '- None',
        '',
        '## Evidence',
        '',
        evidenceLines.length ? evidenceLines.join('\n') : '- None',
        '',
        '## Reproducibility',
        '',
        `- Run ID: ${brief.runId}`,
        `- Run timestamp: ${brief.reproducibility.runTimestampUtc}`,
        `- Params hash: ${brief.reproducibility.paramsHash}`,
        '',
        '### KPI Owner Versions',
        '',
        formatList(ownerVersionLines),
        '',
        '### Params Snapshot',
        '',
        '```json',
        JSON.stringify(brief.reproducibility.paramsSnapshot, null, 2),
        '```',
        ''
    ].join('\n');
};

export const downloadDecisionBriefMarkdown = (
    brief: DecisionBriefPayload,
    filename?: string,
    options?: DownloadDecisionBriefOptions
): void => {
    const fallbackName = `decision-brief-${toSafeSlug(brief.context.surface)}-${new Date().toISOString().slice(0, 10)}.md`;
    const resolvedFilename = filename || fallbackName;
    if (options?.showToast !== false) {
        showExportToast(resolvedFilename);
    }
    const blob = new Blob([formatDecisionBriefMarkdown(brief)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = resolvedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
