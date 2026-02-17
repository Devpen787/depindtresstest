# Phase 1 Implementation Checklist (2026-02-17)

## Objective
Implement the first owner-consolidation pass without introducing new product surfaces.

References:
- `docs/OWNER_MIRROR_DECISION_MATRIX_2026-02-17.md`
- `docs/TAB_CONTENT_CENSUS_2026-02-17.md`
- `docs/TAB_CHART_ORDER_CENSUS_2026-02-17.md`

## Scope (Phase 1 Only)
1. Enforce owner boundaries in current navigation and content behavior.
2. Reduce duplicated default content (park mirrors behind advanced where needed).
3. Ensure Decision Brief output contract exists and is exportable.
4. Add confidence/evidence gate behavior for final call.

## Work Items

### A) Navigation + Owner Boundary
- [ ] Keep current routes, but align visible labels/copy to owner roles.
- [ ] Make `Benchmark` the only default peer-comparison narrative owner.
- [ ] Keep `Compare` as matrix detail only (no independent recommendation framing).
- [ ] Reduce `Strategy` to recommendation framing; move low-level controls to `Scenario Lab`.
- [ ] Keep `Decision Brief` output as required endpoint of the first-review flow.

### B) KPI Owner Enforcement
- [ ] Tag each core KPI with owner metadata (`payback`, `solvency`, `utility`, `sensitivity`, `tail_risk`).
- [ ] For mirror panels, consume owner values/labels (no local threshold variants).
- [ ] Standardize guardrail terms across owners/mirrors (`Healthy/Watchlist/Intervention`).

### C) Decision Brief Minimum Contract
- [ ] Ensure export payload includes:
  - decision, confidence, top drivers, actions, scenario_id, protocol_id, evidence_status, generated_at_utc.
- [ ] If evidence is partial/missing, downgrade recommendation to `hold` by policy.
- [ ] Show plain-language summary line in Decision Brief.

### D) Default Complexity Control
- [ ] Keep default owner surfaces within budget:
  - 1 primary chart
  - up to 3 supporting KPI cards
  - up to 1 control cluster
- [ ] Park duplicate mirror charts behind Advanced/toggle zones.

### E) Performance + Stability
- [ ] Add/confirm instrumentation for tab switch timing and scenario update timing.
- [ ] Verify no regression in tab responsiveness after content consolidation.

## Verification Gates

### Functional
- [ ] Scenario/protocol selection stays synchronized across all owner surfaces.
- [ ] Mirror panels display owner-consistent thresholds and wording.
- [ ] First-review flow can complete without dead ends.

### Output
- [ ] Decision Brief export contains all required fields.
- [ ] Confidence/evidence policy is visible and enforced.

### Build/Test
- [ ] `npm run build` passes.
- [ ] Relevant Cypress/acceptance specs pass for:
  - tab switching
  - keyboard navigation
  - decision brief export
  - global state sync

## Phase 1 Done Criteria
1. Owner contracts are visible in behavior, not only docs.
2. Duplicate KPI interpretation in default flow is removed.
3. Decision Brief is actionable and consistent with owner data.
4. Baseline performance remains acceptable after changes.

## Execution Progress (2026-02-17)

Completed in code:
- Navigation boundary pass in `index.tsx`:
  - Benchmark-first landing.
  - Advanced workspace entry moved behind Evidence.
  - Decision Tree moved into primary flow as `Decide`.
  - Consolidated `Decide` into the primary tablist and removed the duplicate standalone header button to reduce top-nav noise.
  - Reduced header action density by moving contextual controls (`Open Stress Lab`, `Back to Evidence`, `Settings`, `Export`) into a compact `Actions` dropdown.
- Decision Brief shell contract wired and exportable in `index.tsx`:
  - Benchmark, Diagnostics, Strategy decision-brief cards.
  - Header export action downloads contextual brief payload.
  - Added `runId` and `kpiOwnerVersions` in export payload for stronger reproducibility/audit trace.
  - Added evidence-policy fields (`initialVerdict`, `evidenceStatus`, `policyNotes`) and forced `go -> hold` downgrade when evidence is partial/missing.
- Accessibility + journey hardening:
  - Primary/advanced tabs expose ARIA tab semantics and keyboard roving focus.
  - Header dropdowns expose ARIA menu semantics.
  - Decision-tree exit keyboard activation support.
- Census-driven complexity reduction:
  - Benchmark snapshot now defaults to owner chart + canonical matrix.
  - Secondary benchmark analyses moved behind `Advanced Analysis` toggle.
  - Diagnostics deep modules moved behind `Advanced Root-Cause Analysis` toggle while keeping core scorecard/signals visible.
  - Strategy now defaults to core stability chart; composition/flow/ROI panels are behind `Advanced Strategy Analysis`.
  - Sandbox duplicate compact chart grid is now behind `Advanced Mirror Charts`.
- Plain-language interpretability pass:
  - Added explicit `Action Trigger` guidance to default chart-context headers (Benchmark, Diagnostics, Strategy).
  - Added Tier 1 Sandbox interpretation + trigger copy in the default flow.
- Performance telemetry hardening:
  - Added `scenario-update` perf instrumentation in global scenario apply path.
  - Memoized Decision Brief input calculations and surface payload generation in `index.tsx` to avoid repeated recomputation on unrelated UI state changes.
  - Added diagnostics tab keep-mounted behavior after first visit to avoid repeated heavy remounts during tab switches.
  - Added strategy tab keep-mounted behavior after first visit to avoid repeated remount cost in primary navigation.
  - Deferred benchmark view-mode restore until entering Simulator, removing unnecessary work from non-simulator tab transitions.
  - Memoized diagnostic dashboard and solvency-scorecard derived series to reduce render churn.
- KPI owner enforcement expansion:
  - Added shared owner math/classification helpers for `solvency`, `retention`, `utility`, `tail_risk`, and `sensitivity`.
  - Wired Decision Brief default drivers + guardrail band selection to owner math outputs (removed local threshold copy drift).
  - Fixed retention normalization mismatch by normalizing ratio vs percentage inputs in one owner function.
  - Added owner-registry mappings for `tail_risk_score`, `utility_health_score`, and `sensitivity_delta`.
  - Added unit tests for owner-family parity helpers and threshold copy consistency.
  - Migrated Strategy and Sandbox mirror thresholds/copy to owner constants (solvency floors, payback tiers, retention floor, utilization floors).
  - Replaced local Strategy/Sandbox status heuristics with owner band classifiers where applicable.
  - Migrated `Compare` KPI value coloring and threshold semantics to owner-band classifiers (payback, solvency, retention proxy, utilization).
  - Normalized `Compare` delta units (e.g., months for payback, x-ratio for solvency) to remove `%` unit drift.
  - Aligned diagnostic resilience/signal thresholds to shared guardrails (retention and resilience floors) and removed hardcoded BER trigger drift in key panels.
  - Aligned legacy diagnostic recommendation/archetype panels with shared guardrails (solvency floor, retention watchlist floor, resilience floor) to remove threshold copy drift in advanced root-cause modules.
  - Audited remaining narrative-heavy diagnostic blocks to confirm core KPI thresholds are constant-driven; left only external case-study numerics as non-guardrail reference facts.
- Decision Brief export hardening:
  - Added human-readable Markdown Decision Brief export while preserving JSON reproducibility export.
  - Header export now emits both `.md` (stakeholder-readable) and `.json` (machine-readable replay contract) artifacts.
  - Added unit test coverage for markdown brief formatting.
  - Removed residual `policy_lab` naming in brief surfaces/exports and normalized to `strategy` for plain-language consistency.
- Plain-language interpretability hardening:
  - Rewrote chart-context guidance in Benchmark, Diagnostics, Strategy, Decision Tree branches, and Appendix charts using direct plain-language instructions.
  - Added explicit action triggers on previously under-specified chart contexts so users know when to stop, hold, or escalate.
  - Simplified micro-copy on diagnostic signal cards to reduce interpretation ambiguity.
  - Simplified long-form narrative prose outside chart headers in Diagnostics, Decision Tree wizard, and Case Study surfaces so first-time users can understand intent without thesis vocabulary.

Verification evidence:
- `npm run build` passed.
- Cypress smoke suite passed:
  - `cypress/e2e/smoke/app-shell.cy.ts`
  - `cypress/e2e/smoke/keyboard-access.cy.ts`
  - `cypress/e2e/smoke/review-rehearsal.cy.ts`
- `npm run test:e2e` passed repeatedly (3/3 local reruns) without reproducing the prior wrapper close error.
- Tab-switch perf capture added and executed:
  - Spec: `cypress/e2e/analysis/tab-switch-perf.cy.ts`
  - Script: `npm run test:e2e:perf-tabs`
  - Report: `docs/TAB_SWITCH_PERF_REPORT_2026-02-17.md`
  - Post-optimization result: tab-switch p95 improved from `209.2ms` to `67.7ms`; diagnostic p95 improved from `300.3ms` to `72.9ms`.
  - Strategy keep-mounted follow-up: strategy p95 improved from `100.2ms` to `30.6ms`; overall tab-switch p95 improved from `67.7ms` to `51.6ms`.

Still pending for full Phase 1 closeout:
- None for the Phase 1 owner/copy consolidation pass.
