# Dashboard Scope Decision Matrix (2026-02-14)

## Objective
Reduce cognitive load while preserving decision quality across:
- Benchmark
- Diagnostics
- Thesis
- Decision Tree
- Case Study

This matrix is optimized for three user outcomes:
1. Understand what they are looking at
2. Understand why the numbers are what they are and where they stand
3. Understand status quo and what to decide next

## Scope Rule
Keep a panel in the default flow only if it passes all three tests:
- Distinct decision value (changes a real action)
- Clear reference point (guardrail, peer baseline, or threshold)
- Minimal overlap (not already answered better elsewhere)

## Recommended Canonical Journey
1. Decision Tree: pick the risk branch that matters now
2. Benchmark: place current protocol versus peers
3. Diagnostics: identify root-cause failure mode
4. Thesis: test policy lever tradeoffs
5. Case Study: narrative appendix only

---

## Benchmark
Primary user question: "Where do we stand versus peers, and which gap matters first?"

### Keep (default)
- `PeerToggle`
- 4 KPI cards (`Payback`, `Efficiency`, `Sustainability`, `Retention`)
- `DecisionPromptCard`
- `HealthMetricsBarChart`
- `SolvencyProjectionChart`
- `ComparativeMatrix`

### Park (advanced drawer)
- `StrategicEdgeRadar` (harder to decode than matrix + bars)
- `SensitivitySummary`
- `BenchmarkExportButton`
- `AIInsights`
- `ResearchView` tab (advanced evidence mode)

### Remove / merge
- Remove duplicate "so what" narrative where chart headers already cover it.
- Use one benchmark "status chip" only; avoid multiple conflicting status framings.

---

## Diagnostics
Primary user question: "What is breaking first and which intervention has highest leverage?"

### Keep (default)
- `DecisionPromptCard`
- `SignalsOfDeathPanel`
- Single failure-mode module at a time (highest current risk)
- `StrategicRecommendationsPanel` (only if evidence-confidence is explicit)

### Park (advanced drawer)
- `MasterProofMatrix`
- `SolvencyScorecard`
- `SensitivityTornadoChart`, `SensitivityHeatmap`, `InflationCapacityScatter`
- Full multi-section failure-mode stack shown simultaneously
- `HumanArchetypePanel`

### Remove / merge
- Collapse repeated "impact translator" blocks into one dynamic summary strip.
- Avoid showing all four failure modes in one pass; force focus on one active mode.
- Add clear "Illustrative / Live / Mixed" badge for every diagnostic visual.

---

## Thesis
Primary user question: "Which policy lever improves resilience under this stress path?"

### Keep (default)
- Scenario selector
- 3 core controls: market stress, emission mode, revenue strategy
- 3 core outputs: stability, retention, payback/ROI
- `DecisionPromptCard`

### Park (advanced drawer)
- Historical overlay toggle
- Composition chart (urban vs rural)
- Treasury detail chart (when not in reserve mode)
- Sidebar utility links and non-essential footer noise

### Remove / merge
- Remove duplicate protocol selector from thesis sidebar (use global protocol state).
- Remove duplicate scenario control sources; thesis should consume shared scenario state.

---

## Decision Tree
Primary user question: "Where do I investigate first?"

### Keep (default)
- `WizardView` branch cards
- Absolute vs percentile toggle
- Branch status metrics with guardrail references

### Park (advanced drawer)
- Full branch chart stacks by default
- Deep tooltips that duplicate `ChartContextHeader` content

### Remove / merge
- Add deep-link context to sandbox (`DecisionTreeDashboard.tsx` TODO already exists).
- Avoid duplicating full sensitivity narrative if it already exists in Diagnostics.

---

## Case Study
Primary user question: "How does this mechanism story map to a real design pattern?"

### Keep (default)
- Case selector
- Intro + mechanism narrative
- One flagship chart (`Coupling vs Speculation`)
- One takeaway block

### Park (advanced drawer)
- Solvency heatmap
- Payback scenario chart
- Radar chart

### Remove / merge
- Keep this tab as appendix mode, not part of default decision workflow.
- Limit decorative density when it competes with numeric interpretation.

---

## Cross-Tab Consolidation (High Priority)

### Single sources of truth
- Protocol selection: one global control
- Scenario selection: one global control
- Status language: one guardrail band system (`Healthy`, `Watchlist`, `Intervention`)

### Shared interpretation pattern
Each chart should always expose:
- What this is
- Why the value moves
- Reference point
- Next question

This is already implemented via `ChartContextHeader`; apply consistently and avoid parallel bespoke explainers.

### Visual best-practice constraints
- Max 1 primary takeaway per panel
- Max 2 reference lines per chart
- Max 4 simultaneously salient colors
- Always pair absolute value with baseline/delta/threshold
- If metric is normalized, show normalization rule in-context

---

## Phase Plan

### Phase 1 (fast trim, no model changes)
- Hide parked components behind "Advanced" accordions in each tab
- Keep only core decision panels in default flow
- Remove duplicate scenario/protocol pickers from local tabs

### Phase 2 (flow alignment)
- Enforce canonical tab journey
- Add cross-tab handoff chips (e.g., "Next: Diagnostics -> Failure mode X")
- Ensure each tab ends with one explicit recommended next action

### Phase 3 (rigor + trust)
- Add evidence-confidence tags everywhere (`Primary`, `Secondary`, `Illustrative`)
- Add confidence badges to recommendation text
- Standardize guardrail labels and thresholds in all legends/tooltips

