/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY.
 *
 * Source: src/data/protocol_master_sheet.tsv
 * Generator: scripts/generate_protocol_artifacts.mjs
 */

export interface ProtocolVerificationSummary {
    diagnosticProjectId: string | null;
    category: string | null;
    riskLevel: 'low' | 'moderate' | 'high' | 'extreme' | 'unknown';
    allCorePointsVerified: boolean;
}

export const GENERATED_PROTOCOL_VERIFICATION_SUMMARY: Record<string, ProtocolVerificationSummary> = {
    "ono_v3_calibrated": {
        "diagnosticProjectId": "onocoy",
        "category": "GNSS Corrections",
        "riskLevel": "low",
        "allCorePointsVerified": true
    },
    "helium_bme_v1": {
        "diagnosticProjectId": "helium_mobile",
        "category": "5G Wireless",
        "riskLevel": "moderate",
        "allCorePointsVerified": true
    },
    "adaptive_elastic_v1": {
        "diagnosticProjectId": "render",
        "category": "GPU Compute",
        "riskLevel": "low",
        "allCorePointsVerified": true
    },
    "filecoin_v1": {
        "diagnosticProjectId": null,
        "category": null,
        "riskLevel": "unknown",
        "allCorePointsVerified": false
    },
    "akash_v1": {
        "diagnosticProjectId": null,
        "category": null,
        "riskLevel": "unknown",
        "allCorePointsVerified": false
    },
    "hivemapper_v1": {
        "diagnosticProjectId": "hivemapper",
        "category": "Mapping",
        "riskLevel": "high",
        "allCorePointsVerified": true
    },
    "dimo_v1": {
        "diagnosticProjectId": "dimo",
        "category": "Vehicle Data",
        "riskLevel": "moderate",
        "allCorePointsVerified": true
    },
    "grass_v1": {
        "diagnosticProjectId": "grass",
        "category": "AI Data / Bandwidth",
        "riskLevel": "extreme",
        "allCorePointsVerified": true
    },
    "ionet_v1": {
        "diagnosticProjectId": "ionet",
        "category": "GPU Compute",
        "riskLevel": "moderate",
        "allCorePointsVerified": true
    },
    "nosana_v1": {
        "diagnosticProjectId": "nosana",
        "category": "AI Inference Compute",
        "riskLevel": "low",
        "allCorePointsVerified": true
    },
    "geodnet_v1": {
        "diagnosticProjectId": "geodnet",
        "category": "GNSS Corrections",
        "riskLevel": "low",
        "allCorePointsVerified": true
    },
    "aleph_v1": {
        "diagnosticProjectId": null,
        "category": null,
        "riskLevel": "unknown",
        "allCorePointsVerified": false
    },
    "xnet_v1": {
        "diagnosticProjectId": null,
        "category": null,
        "riskLevel": "unknown",
        "allCorePointsVerified": false
    }
};
