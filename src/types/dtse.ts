import type { GuardrailBand } from '../constants/guardrails';
import type { MetricEvidence } from '../data/metricEvidence';

// ---------------------------------------------------------------------------
// DTSE Applicability
// ---------------------------------------------------------------------------

export type DTSEApplicabilityVerdict = 'R' | 'NR';

export type DTSEApplicabilityReasonCode =
    | 'DATA_AVAILABLE'
    | 'DATA_MISSING'
    | 'SOURCE_GRADE_INSUFFICIENT'
    | 'MANUAL_OVERRIDE'
    | 'PROXY_ACCEPTED'
    | 'INTERPOLATION_RISK';

export interface DTSEApplicabilityEntry {
    metricId: string;
    verdict: DTSEApplicabilityVerdict;
    reasonCode: DTSEApplicabilityReasonCode;
    details?: string;
    override?: DTSEOverrideMetadata;
}

export interface DTSEOverrideMetadata {
    reviewer: string;
    timestamp: string;
    reason: string;
}

// ---------------------------------------------------------------------------
// DTSE Peer Analogs
// ---------------------------------------------------------------------------

export interface DTSEPeerAnalog {
    protocol_id: string;
    peer_ids: string[];
    rationale: string;
    confidence: 'high' | 'medium' | 'low';
}

// ---------------------------------------------------------------------------
// DTSE Run Context & Bundle
// ---------------------------------------------------------------------------

export interface DTSESeedPolicy {
    seed: number;
    locked: boolean;
}

export interface DTSERunContext {
    scenario_grid_id: string;
    run_id: string;
    seed_policy: DTSESeedPolicy;
    horizon_weeks: number;
    n_sims: number;
    evidence_status: 'complete' | 'partial' | 'missing';
    protocol_id: string;
    model_version: string;
    generated_at_utc: string;
    bundle_hash: string;
    outcomes?: DTSEOutcome[];
    failure_signatures?: DTSEFailureSignature[];
    recommendations?: DTSERecommendation[];
}

export interface DTSEBundleArtifact {
    name: string;
    path: string;
    sha256: string;
}

export interface DTSEBundleManifest {
    version: string;
    generated_at_utc: string;
    artifacts: DTSEBundleArtifact[];
    root_checksum: string;
}

export interface DTSEBundleVerification {
    valid: boolean;
    missingFields: string[];
    warnings: string[];
}

// ---------------------------------------------------------------------------
// DTSE Outcomes, Failures & Recommendations
// ---------------------------------------------------------------------------

export interface DTSEOutcome {
    metric_id: string;
    value: number;
    band: GuardrailBand;
    evidence_ref?: string;
}

export interface DTSEFailureSignature {
    id: string;
    label: string;
    pattern: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    affected_metrics: string[];
    trigger_logic?: string;
    why_it_matters?: string;
}

export interface DTSERecommendation {
    id: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    owner: string;
    rationale: string;
    action: string;
    expected_effect?: string;
    timeframe?: string;
    success_metric?: string;
    dependency?: string;
    risk_if_delayed?: string;
    peer_analog?: string;
}

export interface DTSEProtocolBrief {
    protocol_id: string;
    protocol_name: string;
    chain: string;
    depin_surface: string;
    demand_signal: string;
    supply_signal: string;
    token_utility: string[];
    notes: string;
}

export interface DTSEMetricInsight {
    metric_id: string;
    definition: string;
    why_relevant: string;
    decision_use: string;
    target: string;
    interpretation: {
        healthy: string;
        watchlist: string;
        intervention: string;
    };
}
