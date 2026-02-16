# Tab Transformation Blueprint (Detailed)

Date: 2026-02-16
Purpose: define exactly what happens to existing tabs, panels, and charts during hardening + flow alignment.

## 1) Design Principles

1. Park, do not delete: advanced analysis remains accessible.
2. One source of context: protocol and scenario are global.
3. One primary chart per decision metric in default mode.
4. Each default panel must answer a decision question.
5. Recommendation text must include evidence + confidence metadata.

## 2) Final Top-Level Experience

Target navigation:
1. Decision Tree
2. Benchmark
3. Diagnostics
4. Policy Lab
5. Appendix

Persistent global controls:
1. Protocol selector
2. Scenario selector
3. Baseline comparison toggle
4. Data freshness + model version + evidence status

## 3) Current -> Target Mapping (High Level)

| Current surface | Target destination | Action | Why |
| --- | --- | --- | --- |
| Simulator > Explorer | Global protocol browser + Appendix | Move + split | Keep discovery power, remove duplicate protocol pickers in core flow |
| Simulator > Comparison | Benchmark default + Appendix advanced | Move + split | Comparison is important, but default needs less dense scorecarding |
| Simulator > Sandbox | Policy Lab default | Move + trim | This is where policy levers are tested; simplify default controls |
| Benchmark | Benchmark default + Advanced drawer | Keep + trim | Core stakeholder tab; reduce cognitive overhead |
| Diagnostic | Diagnostics default + Advanced drawer | Keep + focus | Best for root-cause; enforce one active failure mode |
| Thesis | Policy Lab + Appendix narrative | Merge + park | Avoid duplicate scenario/protocol controls; keep narrative assets |
| Case Study | Appendix | Park | Valuable for storytelling, not default decision path |

## 4) Tab-by-Tab Details

### A) Decision Tree (Entry)

Decision question:
- What should I investigate first right now?

Default content:
1. `WizardView` branch cards and branch status metrics
2. Absolute vs percentile toggle
3. One explicit next-step CTA (to Benchmark or Diagnostics)

Advanced content:
1. Deep branch stacks
2. Extended tooltip narratives

Why this decision:
- Fastest way to reduce first-user confusion and route attention to one risk branch.

---

### B) Benchmark (Position)

Decision question:
- Where do we stand relative to peers, and which gap matters first?

Default content:
1. 4 KPI cards (`Payback`, `Efficiency`, `Sustainability`, `Retention`)
2. `HealthMetricsBarChart`
3. `SolvencyProjectionChart`
4. `ComparativeMatrix`
5. Single benchmark status chip
6. Decision prompt with next action

Advanced drawer:
1. `StrategicEdgeRadar`
2. `SensitivitySummary`
3. `BenchmarkExportButton`
4. `AIInsights`
5. `ResearchView`

Why this decision:
- External reviewers care first about peer position and downside runway.
- Radar/sensitivity are useful, but defaulting to them increases interpretation cost.

---

### C) Diagnostics (Root Cause)

Decision question:
- What is breaking first, and what intervention has highest leverage?

Default content:
1. `SignalsOfDeathPanel`
2. One active failure-mode module (highest risk first)
3. Evidence-tagged recommendation strip

Advanced drawer:
1. `MasterProofMatrix`
2. `SolvencyScorecard`
3. `SensitivityTornadoChart`, `SensitivityHeatmap`, `InflationCapacityScatter`
4. Additional failure modes beyond active mode
5. `HumanArchetypePanel`

Why this decision:
- Showing all failure modes at once creates noise and slows action.
- Single active mode keeps diagnosis and mitigation concrete.

---

### D) Policy Lab (Current Thesis + Sandbox Core)

Decision question:
- Which lever improves resilience under this stress path?

Default content:
1. Three core controls (`market stress`, `emission mode`, `revenue strategy`)
2. Three core outputs (`stability`, `retention`, `payback/ROI`)
3. Baseline delta summary (`what changed vs baseline`)
4. Decision brief handoff

Advanced drawer:
1. Historical overlays
2. Composition chart details
3. Treasury detail chart when relevant
4. Secondary simulation controls not needed for first pass

Why this decision:
- Keeps policy testing central while removing redundant local pickers.
- Maintains rigor but gives a tractable first-user flow.

---

### E) Appendix (Preserve Depth)

Decision question:
- What deeper evidence or narrative support is available?

Content:
1. Case Study visuals (`Coupling vs Speculation`, heatmaps, scenario bars, radar)
2. Explorer table deep browse
3. Benchmark research-heavy views
4. Expanded diagnostics and sensitivity panels

Why this decision:
- Protects all existing analytical value without forcing it into default workflow.

## 5) What Happens to Remaining Tabs and Why

1. `Simulator` top-level shell is retired as a navigation concept.
- Rationale: it currently bundles too many intents (explore, compare, tune) and causes repeated controls.

2. `Explorer` remains available but no longer drives core state from a separate local context.
- Rationale: protocol choice must be global to avoid drift.

3. `Comparison` is not removed; it is split:
- default peer positioning in Benchmark
- heavy comparison tooling in Appendix/Advanced
- Rationale: keep power, reduce first-pass complexity.

4. `Thesis` is not deleted; it is absorbed into Policy Lab + Appendix narrative.
- Rationale: eliminate duplicated scenario/protocol controls while preserving storytelling assets.

5. `Case Study` remains as appendix mode.
- Rationale: high value for communication, low value for first decision loop.

## 6) Explicit Non-Loss Guarantees

1. No chart is removed without a documented destination.
2. Every parked module remains reachable in <= 2 clicks from its parent tab.
3. Advanced mode can be toggled without losing run context.
4. Exports include run context (protocol, scenario, seed, model version, evidence state).

## 7) Implementation Sequence

1. Architecture hardening:
- global protocol/scenario state, shared metric contract, shared guardrail vocabulary.

2. Flow alignment:
- navigation and panel consolidation, move parked content to Advanced/Appendix.

3. Recommendation/confidence layer:
- decision brief and evidence/confidence annotations across high-impact KPIs.
