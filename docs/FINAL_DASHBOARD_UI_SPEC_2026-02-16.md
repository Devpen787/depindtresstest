# Final Dashboard UI Spec (One Page)

Date: 2026-02-16
Owner: Dashboard hardening sprint
Goal: first-user review readiness for Onocoy without losing analytical depth

## 1. Navigation (Canonical Journey)

Top-level nav order:
1. Decision Tree
2. Benchmark
3. Diagnostics
4. Policy Lab
5. Appendix

Notes:
- Policy Lab maps current Thesis controls and scenario tradeoff testing.
- Appendix contains Case Study, research-heavy views, and parked advanced analysis.

## 2. Global Control Bar (Persistent Across All Screens)

Always-visible sticky header:
1. Protocol selector (single source of truth)
2. Scenario selector (single source of truth)
3. Baseline toggle (`Current` vs `Baseline`)
4. Run/refresh state chip
5. Evidence status chip (`Primary`, `Secondary`, `Proxy`, `Interpolated`)
6. Model/version chip
7. Quick action: `Export Decision Brief`

Behavior:
- Changing protocol or scenario updates all tabs immediately.
- No local per-tab protocol/scenario selectors in default mode.
- No backtracking required to change context.

## 3. Default Surfaces Per Tab

### Decision Tree
1. Branch cards with status bands and guardrail references
2. Absolute/percentile toggle
3. One explicit next-step CTA (`Go to Benchmark` or `Go to Diagnostics`)

### Benchmark
1. Four KPI cards (`Payback`, `Efficiency`, `Sustainability`, `Retention`)
2. Health metrics bar chart
3. Solvency projection chart
4. Comparative matrix
5. One benchmark status chip

### Diagnostics
1. Signals of death panel
2. One active failure-mode panel (highest risk first)
3. Strategy recommendation summary with confidence

### Policy Lab
1. Three core levers (`market stress`, `emission mode`, `revenue strategy`)
2. Three core outputs (`stability`, `retention`, `payback/ROI`)
3. Baseline delta summary (`what changed and why`)

### Appendix
1. Case Study visuals
2. Sensitivity deep dives
3. Research/export-heavy views

## 4. Advanced Content Rule (Preserve, Don’t Delete)

Rule:
1. Keep full chart depth available in `Advanced` drawers or Appendix mode.
2. Default flow shows only decision-critical panels.
3. Each advanced module must map to one explicit question.

## 5. Consolidation Rule

For each key metric:
1. One primary chart in default flow
2. Secondary variants moved to Advanced
3. Duplicate narrative wrappers removed

High-priority de-duplication:
1. Protocol selection controls
2. Scenario controls
3. Refresh controls
4. Repeated metric cards with same conclusion

## 6. Decision Layer Contract

Every recommendation block must include:
1. Verdict
2. Top three drivers
3. Recommended actions
4. Owner role
5. Trigger threshold
6. Expected effect
7. Confidence and evidence metadata

## 7. First-User Success Criteria

1. Reviewer completes canonical flow in <= 7 minutes.
2. Reviewer identifies current status and one next action without help.
3. No conflicting protocol/scenario state across tabs.
4. Decision brief is exportable and reproducible.
