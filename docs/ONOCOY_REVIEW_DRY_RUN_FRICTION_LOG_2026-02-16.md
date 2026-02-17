# Onocoy Review Dry-Run Friction Log

Date: 2026-02-16  
Scope: internal 7-minute reviewer rehearsal path (`Decision Tree -> Benchmark -> Diagnostics -> Strategy -> Appendix`)

## Execution Evidence
1. `npm run test:e2e`  
Result: PASS (7/7) including `review-rehearsal.cy.ts`
2. `npm run build`  
Result: PASS
3. `npm run acceptance:generate -- --profile ono_v3_calibrated --mode quick`  
Result: PASS
4. `npm run ci:dashboard:acceptance:gate -- --require-section-pass --exclude-sections 'I Onocoy Inputs'`  
Result: PASS

## What Was Verified
1. Canonical tab path is completable end-to-end.
2. Decision brief appears in Benchmark, Diagnostics, and Strategy.
3. Reproducibility line is present in each brief (`Run ... • Hash #...`).
4. Header `Export Brief` enables on decision tabs and disables in Decision Tree/simulator context.
5. Scenario context can persist across tab switches when global scenario selector is visible.

## Friction Findings
1. `P2` Responsive context controls hidden below `xl` breakpoint.
Impact: Protocol/scenario controls are not visible at many laptop widths, blocking the "change scenario from global header" rehearsal step.
Evidence: initial rehearsal run failed when selector parent rendered as `display: none`.
Decision: resolved in follow-up; header visibility updated from `xl` to `lg` so controls are available on standard laptop widths.
Status: resolved

2. `P2` Decision Tree exit routes to simulator sandbox, not prior review tab.
Impact: Reviewer leaves the canonical path unexpectedly and must manually navigate back to Benchmark/Diagnostics/Strategy.
Evidence: `decision-tree-exit` currently routes through `openAdvancedWorkspace('sandbox')`.
Decision: resolved in follow-up; `decision-tree-exit` now returns to prior tab and label updated to `Back to Previous Tab`.
Status: resolved

3. `P3` Dual export affordances can feel redundant for first-time users.
Impact: Both card-level export and header export are visible without explaining the difference.
Evidence: `DecisionBriefCard` export + global header `Export Brief`.
Decision: resolved in follow-up; card-level export action removed from default flow so header `Export Brief` is the primary path, and card helper text clarifies where export lives.
Status: resolved

4. `P3` No explicit in-app confirmation after export.
Impact: Download action is silent; user may click repeatedly or assume failure.
Evidence: export triggers download directly with no toast/status feedback.
Decision: resolved in follow-up; export now shows a lightweight `Exported ...` toast for explicit confirmation.
Status: resolved

## Improvements Completed In This Slice
1. Added stable rehearsal selectors for decision briefs:
- `benchmark-decision-brief`
- `diagnostic-decision-brief`
- `policy-decision-brief`
2. Added reproducibility selectors:
- `${brief}-repro`
3. Added resilient rehearsal automation:
- `cypress/e2e/smoke/review-rehearsal.cy.ts`
4. Added global header selector hooks:
- `global-protocol-select`
- `global-scenario-select`

## Recommendation Before External Review
1. No open P2/P3 blockers remain from the rehearsal friction set.
