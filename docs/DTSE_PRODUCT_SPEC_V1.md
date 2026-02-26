# DTSE Product Specification — V1

**DTSE** = **DePIN Token Stress Evaluation**

Version: 1.0  
Status: Draft  
Last updated: 2026-02-26

---

## 1. Overview

DTSE is the primary analytical workflow in the DePIN Stress Test dashboard. It replaces the legacy tab-based exploration with a structured, stage-gated evaluation that walks the user through a complete token stress assessment from data ingestion to actionable recommendations.

DTSE answers the question: _"Given the current on-chain and off-chain evidence, how resilient is this DePIN token's economics under realistic stress scenarios?"_

---

## 2. The 6-Stage Workflow

DTSE guides the analyst through six sequential stages:

| Stage | Name | Purpose |
|-------|------|---------|
| 1 | **Data Ingestion & Applicability** | Load the pre-computed bundle (or recompute). Assess which metrics are Runnable (R) vs Not Runnable (NR) based on evidence quality. |
| 2 | **Peer Analog Selection** | Select or confirm peer protocols for cross-protocol comparison. Peer mappings are config-driven and deterministic. |
| 3 | **Scenario Configuration** | Review and optionally adjust the scenario grid: horizon, seed policy, simulation count, macro conditions. |
| 4 | **Stress Execution & Results** | Execute (or display frozen) simulation outcomes. View metric-level results with guardrail band classification (healthy / watchlist / intervention). |
| 5 | **Failure Signatures & Recommendations** | Surface structural failure patterns and generate prioritized, actionable recommendations. |
| 6 | **Export & Report** | Export the evaluation as a shareable artifact (PDF, JSON bundle, or clipboard summary). |

Each stage must be completed (or acknowledged) before advancing to the next.

---

## 3. Frozen Bundle vs Recompute Modes

DTSE supports two operational modes:

### 3.1 Frozen Bundle (Default)

- A pre-computed bundle is loaded from `public/dtse/`.
- The bundle contains: `manifest.json`, `run_context.json`, `outcomes.json`, `applicability.json`.
- No simulation is re-run; results are deterministic and reproducible.
- Ideal for stakeholder presentations and audit trails.

### 3.2 Recompute Mode

- The user triggers a fresh simulation run with the current scenario configuration.
- Recompute respects the seed policy: if `locked: true`, the same seed produces identical results.
- Results overwrite the in-memory bundle but do not modify the on-disk bundle files.

---

## 4. Applicability Policy (R / NR)

Every metric entering DTSE is classified as either:

- **R (Runnable)**: Sufficient evidence exists to include this metric in the stress evaluation.
- **NR (Not Runnable)**: Evidence is missing, interpolated, or below the minimum source grade threshold.

### Reason Codes

| Code | Meaning |
|------|---------|
| `DATA_AVAILABLE` | Primary or secondary data is available and sufficient. |
| `DATA_MISSING` | Required data is missing entirely. |
| `SOURCE_GRADE_INSUFFICIENT` | Source grade does not meet minimum threshold. |
| `MANUAL_OVERRIDE` | Applicability was manually overridden by a reviewer. |
| `PROXY_ACCEPTED` | Proxy-grade source accepted under current evaluation policy. |
| `INTERPOLATION_RISK` | Interpolated data carries elevated uncertainty. |

### Override Mechanism

A reviewer can manually override any applicability decision. Overrides are recorded with reviewer identity, timestamp, and rationale for audit purposes.

---

## 5. Peer Analogs

Peer analogs enable cross-protocol comparison within DTSE. Each protocol has a curated set of peer protocols selected based on:

- Overlapping economic model (e.g., proof-of-coverage, compute marketplace)
- Comparable token mechanics (burn/mint dynamics, emission schedules)
- Geographic or vertical overlap

Peer mappings are static and config-driven (see `src/data/dtsePeerAnalogs.ts`). Confidence levels (`high`, `medium`, `low`) indicate the strength of the analogy.

Current peer groups include:
- **GNSS/positioning**: Onocoy, Geodnet, Helium
- **Decentralized compute**: Render, Akash, IO.net
- **Decentralized storage**: Filecoin, Arweave

---

## 6. Evidence Status Levels

The `evidence_status` field on a DTSE run context indicates overall data completeness:

| Status | Meaning |
|--------|---------|
| `complete` | All required metrics have R-grade evidence. Full confidence in results. |
| `partial` | Some metrics are NR. Results are valid but carry caveats for excluded metrics. |
| `missing` | Insufficient evidence to produce a meaningful evaluation. Manual review recommended. |

---

## 7. Integration with Existing Dashboard

DTSE is the **default landing tab** when the dashboard loads. The legacy tabs (Benchmark, Diagnostic, Thesis, Case Study, Decision Tree) remain accessible under an "Advanced" grouping for users who need depth views.

Key integration points:

- **Run Context Strip**: Displayed at the top of the DTSE dashboard, showing the active `run_id`, `protocol_id`, `evidence_status`, and `horizon_weeks`.
- **Guardrail Bands**: DTSE reuses the existing guardrail band system (`healthy`, `watchlist`, `intervention`) from `src/constants/guardrails.ts`.
- **Simulation Engine**: Recompute mode uses the same V2 agent-based engine (`src/model/simulation.ts`) as the Simulator/Sandbox views.
- **Bundle Loader**: `src/services/dtseBundle.ts` handles loading, parsing, and validating pre-computed bundles.

---

## 8. Residual Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Bundle staleness: pre-computed bundles may not reflect latest on-chain state | Medium | Display `generated_at_utc` prominently; encourage periodic recompute. |
| Applicability overrides could mask data quality issues | Medium | Require reviewer identity and rationale; audit trail in bundle metadata. |
| Peer analog mappings may become outdated as DePIN landscape evolves | Low | Periodic review cycle; confidence-level downgrade for stale mappings. |
| Recompute mode performance on large scenario grids (high `n_sims`) | Medium | Warn user before recompute; consider web-worker offloading. |
| NR metrics silently excluded may lead to false confidence in results | High | Surface NR count and specific exclusions prominently in Stage 1 and in export artifacts. |
| Bundle hash integrity not verified against a trusted registry | Low | Future: integrate bundle hash verification against a content-addressed store. |

---

_End of DTSE Product Specification V1._
