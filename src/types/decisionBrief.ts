import type { GuardrailBand } from '../constants/guardrails';
import type { MetricEvidence } from '../data/metricEvidence';

export type DecisionBriefSurface = 'benchmark' | 'diagnostics' | 'strategy';
export type DecisionKpiFamily = 'payback' | 'solvency' | 'utility' | 'sensitivity' | 'tail_risk';

export type DecisionConfidenceLabel = 'Low' | 'Medium' | 'High';
export type DecisionFreshnessLabel = 'Fresh' | 'Recent' | 'Stale' | 'Unknown';
export type DecisionVerdict = 'go' | 'hold' | 'no_go';
export type DecisionEvidenceStatus = 'complete' | 'partial' | 'missing';

export interface DecisionBriefDriver {
    label: string;
    value: string;
    threshold: string;
    metricId: string;
}

export interface DecisionBriefAction {
    action: string;
    ownerRole: string;
    trigger: string;
    expectedEffect: string;
}

export interface DecisionBriefContext {
    surface: DecisionBriefSurface;
    protocolName: string;
    protocolId?: string;
    scenarioName: string;
    scenarioId?: string | null;
    modelVersion: string;
}

export interface DecisionBriefReproducibility {
    runTimestampUtc: string;
    paramsHash: string;
    paramsSnapshot: Record<string, unknown>;
}

export interface DecisionBriefFreshness {
    label: DecisionFreshnessLabel;
    asOfUtc?: string;
    ageMinutes?: number;
}

export interface DecisionBriefEvidenceRef {
    metricId: string;
    sourceGrade: MetricEvidence['sourceGrade'];
    reproducibilityStatus: MetricEvidence['reproducibilityStatus'];
    timeWindow: string;
    sourceUrlOrQueryId: string;
    extractionTimestampUtc?: string;
}

export interface DecisionKpiOwnerVersion {
    owner: string;
    version: string;
}

export interface DecisionBriefPayload {
    generatedAtUtc: string;
    runId: string;
    context: DecisionBriefContext;
    reproducibility: DecisionBriefReproducibility;
    kpiOwnerVersions: Partial<Record<DecisionKpiFamily, DecisionKpiOwnerVersion>>;
    verdict: DecisionVerdict;
    initialVerdict: DecisionVerdict;
    evidenceStatus: DecisionEvidenceStatus;
    policyNotes: string[];
    guardrailBand: GuardrailBand;
    summary: string;
    confidenceScore: number;
    confidenceLabel: DecisionConfidenceLabel;
    freshness: DecisionBriefFreshness;
    drivers: DecisionBriefDriver[];
    actions: DecisionBriefAction[];
    evidence: DecisionBriefEvidenceRef[];
}
