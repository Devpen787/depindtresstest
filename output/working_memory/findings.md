# Findings - Onocoy First-User Readiness

## Evidence Sources
- docs/DASHBOARD_REDUNDANCY_REVIEW.md
- docs/DASHBOARD_SCOPE_DECISION_MATRIX_2026-02-14.md
- docs/WIKI.md
- docs/DASHBOARD_INFORMATION_CONSIDERATIONS_AUDIT_2026-02-11.md
- docs/ONOCOY_DASHBOARD_ACCEPTANCE_CHECKLIST_2026-02-14.md
- docs/ONOCOY_DASHBOARD_ESSENTIAL_GAPS_2026-02-11.md
- prior thread analysis (2026-01-05, 2026-01-20)

## Working Findings
1. Redundancy is known and partially remediated; metric label consistency is fixed, control duplication remains.
2. Canonical journey is already defined in docs but not fully enforced in UX flow.
3. Biggest current gap is decision layer quality (recommendations + confidence + ownership), not raw chart count.
4. External-review readiness depends on trust scaffolding as much as UI simplification.

## Hypothesis
A targeted hardening + flow alignment sprint can make the dashboard presentation-ready without deleting analytical depth.

## Missed Perspectives Deep-Dive

### 1) Decision Accountability
- Why it matters:
  - First external reviewer will ask "what action do we take, by when, and who owns it?"
- Current gap evidence:
  - Decision layer scattered; no single accountable recommendation object across tabs.
- Risk if omitted:
  - Dashboard is seen as informative but non-operational.
- Required move:
  - Standardize recommendation payload with `owner_role`, `action`, `trigger`, `window`, `expected_effect`.

### 2) Confidence + Provenance
- Why it matters:
  - Onocoy review credibility depends on claim traceability and data grade.
- Current gap evidence:
  - Audit flags non-universal source-grade contract and blocked evidence for some high-impact panels.
- Risk if omitted:
  - Insight quality is challenged even if UX improves.
- Required move:
  - Enforce evidence metadata on all high-impact metrics:
    - `source_grade`, `source_url_or_query_id`, `extraction_timestamp_utc`, `reproducibility_status`.

### 3) Audience-Mode Separation (Investor vs Builder vs Thesis)
- Why it matters:
  - Different audiences need different default depth and framing.
- Current gap evidence:
  - Existing flow has high cognitive load and no explicit "start here by user intent" gate.
- Risk if omitted:
  - First reviewer gets overloaded and misses core value.
- Required move:
  - Add explicit mode entry and default journey presets.

### 4) Outcome Telemetry
- Why it matters:
  - You need proof the redesign works before scaling reviews.
- Current gap evidence:
  - Acceptance audit shows broad pass/fail but no in-app flow completion metrics.
- Risk if omitted:
  - No feedback loop; decisions remain subjective.
- Required move:
  - Track: time-to-first-insight, tab drop-off, first-action completion, recommendation acceptance/reject.

### 5) Threshold Governance
- Why it matters:
  - Guardrails must be stable and controlled for stakeholder trust.
- Current gap evidence:
  - Thresholds/risk bands exist but ownership/change-control is not explicit.
- Risk if omitted:
  - "Healthy/Watchlist/Intervention" meanings drift over time.
- Required move:
  - Add threshold registry with version + owner + change rationale.

### 6) Accessibility + Presentation Reliability
- Why it matters:
  - First review may happen live under time pressure and mixed devices.
- Current gap evidence:
  - Prior findings emphasize density and interpretation friction; no explicit accessibility gate in readiness path.
- Risk if omitted:
  - Demo succeeds technically but fails in comprehension.
- Required move:
  - Define presentation mode constraints:
    - readable contrast, legend clarity, no hidden critical controls, deterministic chart ordering.

### 7) Operational Memory + Decision Continuity
- Why it matters:
  - You need run-to-run continuity when iterating with external reviewers.
- Current gap evidence:
  - Outputs exist but not consistently structured as a decision history artifact.
- Risk if omitted:
  - Learnings reset each session; hard to show progression.
- Required move:
  - Persist decision briefs with scenario ID, seed, assumptions, recommendations, and final disposition.
