# Task Plan - Onocoy First-User Readiness

## Goal
Prepare the dashboard for a high-stakes first external review (Onocoy) by reducing UX ambiguity without losing analytical depth.

## Decision
Adopt a staged approach:
1. Deep-dive missed perspectives and turn them into explicit design/ops requirements.
2. Architecture hardening sprint (minimal seams, no full rewrite).
3. Flow alignment sprint (canonical journey + de-duplication).
4. Recommendation/confidence layer (decision outputs with evidence).

Execution note:
- Preserve depth by defaulting to "park, not delete" for advanced panels.
- Keep all current capability reachable via Advanced drawers / appendix modes.

## Phases

### Phase 1 - Missed Perspectives Deep-Dive
Status: completed
Deliverables:
- Prioritized perspective checklist (accountability, provenance, audience modes, telemetry, governance, accessibility, memory)
- Risk of omission for each perspective
- Acceptance criteria for each perspective

### Phase 2 - Architecture Hardening Sprint
Status: in_progress
Scope:
- Global scenario/protocol state
- Shared metric contract
- Shared status/guardrail vocabulary
- Shared recommendation payload schema

Outputs:
- Mapping doc of current vs target ownership
- Minimal refactor plan with test gates

Acceptance checks:
- No duplicate scenario/protocol pickers driving conflicting state.
- Metric values match across tabs for the same underlying run.
- Guardrail status labels are consistent everywhere.
- Recommendation object serializes consistently in all decision surfaces.

### Phase 3 - Flow Alignment + Consolidation
Status: pending
Scope:
- Canonical journey wiring
- Hide/park advanced content while preserving access
- Remove duplicate selectors/refresh paths
- Cross-tab handoff chips

Outputs:
- Updated UX behavior checklist
- Regression checklist across tabs

Acceptance checks:
- First-time reviewer can complete canonical journey in <= 7 minutes.
- Each step ends with one explicit "next action" CTA.
- Advanced content remains available without polluting default flow.

### Phase 4 - Recommendation + Confidence Layer
Status: pending
Scope:
- Decision brief output
- Action mapping by threshold
- Confidence/evidence tags and freshness indicators

Outputs:
- First-user review package
- Presenter script and one-page summary

Acceptance checks:
- Every recommendation includes owner + trigger + expected effect.
- Every high-impact KPI includes evidence grade and freshness metadata.
- Decision brief is exportable and reproducible from saved run context.

## Guardrails
- No feature deletion without explicit "parked but accessible" path.
- No recommendation text without evidence class.
- No threshold language without owner/versioning metadata.

## Definition of Done (for first external review)
- First-time user can complete canonical journey without dead-ends.
- Every recommendation has evidence and confidence context.
- High-impact controls are singular (no duplicates across tabs).
- Output artifacts are presentation-ready and reproducible.
