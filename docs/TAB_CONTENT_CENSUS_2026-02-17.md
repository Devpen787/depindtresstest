# Tab Content Census (2026-02-17)

## Purpose
Create a concrete inventory of what each dashboard tab currently contains, where content overlaps, and what should be kept, moved, merged, or parked before final navigation redesign.

Companion artifact for chart-level depth:
- `docs/TAB_CHART_ORDER_CENSUS_2026-02-17.md`
- `docs/OWNER_PURPOSE_ALIGNMENT_2026-02-17.md`
- `docs/OWNER_MIRROR_DECISION_MATRIX_2026-02-17.md`
- `docs/PHASE1_IMPLEMENTATION_CHECKLIST_2026-02-17.md`

## Scope (Code Surfaces Reviewed)
- `index.tsx`
- `src/components/explorer/ExplorerTab.tsx`
- `src/components/Simulator/ComparisonView.tsx`
- `src/components/Simulator/SandboxView.tsx`
- `src/components/Simulator/SimulatorSidebar.tsx`
- `src/components/Benchmark/BenchmarkView.tsx`
- `src/components/ThesisDashboard.tsx`
- `src/components/Diagnostic/AuditDashboard.tsx`
- `src/components/CaseStudy/TokenomicsStudy.tsx`
- `src/components/DecisionTree/DecisionTreeDashboard.tsx`
- `src/components/DecisionTree/Wizard/WizardView.tsx`
- `src/components/DecisionTree/Branches/*`

## Current Navigation Model (As Implemented)

### Top-level tabs (legacy mode)
- `Workspace` (`simulator`)
- `Benchmark` (`benchmark`)
- `Strategy` (`thesis`)
- `Root Causes` (`diagnostic`)
- `Evidence` (`case_study`)

### Secondary nav inside Workspace
- `Browse` (`explorer`)
- `Compare` (`comparison`)
- `Experiment` (`sandbox`)
- `Settings` (icon action)

### Separate mode
- `Decide` launches `DecisionTreeDashboard` as a separate full-screen mode (`dashboardMode = v2`), not a normal top tab.

## Content Census by Surface

### 1) Workspace > Browse (`ExplorerTab`)
Primary job:
- Discovery and first-pass protocol screening.

Main content:
- Protocol table with search/sort/filter.
- Real-time market fields (price, market cap, volume) and supply verification.
- Lightweight derived stress signals: risk level, payback estimate, stress score.
- Direct actions to analyze protocol or add to compare.

Observed overlap:
- Repeats payback/risk framing also shown in Benchmark and Decision Tree cards.

Decision:
- `KEEP` as entry point for protocol selection.
- `NARROW` to discovery + handoff only; avoid deeper decision narrative here.

### 2) Workspace > Compare (`ComparisonView`)
Primary job:
- Cross-protocol side-by-side scorecard under shared assumptions.

Main content:
- Comparative scorecard sections: Tokenomics, Network Growth, Miner Economics, Sustainability.
- Heatmap deltas against baseline protocol.
- Live data refresh indicator.

Observed overlap:
- Duplicates many KPI families from Benchmark (payback, retention, sustainability, utilization).

Decision:
- `MERGE-BOUNDARY`: keep as "cross-protocol matrix" only.
- Move narrative conclusions to Strategy/Decide.
- Do not duplicate benchmark storytelling blocks.

### 3) Workspace > Experiment (`SandboxView` + `SimulatorSidebar`)
Primary job:
- Parameterized simulation lab and deep diagnostics.

Main content:
- Heavy control sidebar (stress controls, vampire/treasury, presets, tokenomics, advanced provider/simulation config).
- Tiered chart sections (Survival, Viability, Utility) with expandable chart modals.
- Scenario tools, comparison toggles, evidence tags, interpretation cards.
- Additional advanced chart grid and scenario comparison panel.

Observed overlap:
- Significant metric overlap with Benchmark and Root Causes.
- Interpretation blocks overlap with Decision Tree branch explanations.

Decision:
- `KEEP` as advanced lab.
- `PARK` secondary/duplicate explanatory panels behind Advanced by default.
- Keep this as source of truth for tunable assumptions, not final recommendation surface.

### 4) Benchmark (`BenchmarkView`)
Primary job:
- Snapshot performance and peer-relative benchmarking for chosen scenario.

Main content:
- Snapshot and Deep Dive modes.
- Core KPI cards (payback, efficiency, sustainability, retention).
- Matrix/radar/sensitivity and export actions.
- AI insight summary and benchmark evidence tags.

Observed overlap:
- Competes with Compare for side-by-side KPI storytelling.
- Repeats solvency/profitability risk framing from Root Causes and Decision Tree.

Decision:
- `KEEP` as executive benchmark view.
- `MERGE` comparison ownership: Benchmark owns high-level peer comparison narrative, Compare owns dense table/matrix details.

### 5) Strategy (`ThesisDashboard`)
Primary job:
- Strategy synthesis and lever tradeoff exploration.

Main content:
- KPI summary cards and scenario-driven charts.
- Protocol lever controls (emission/revenue strategy and stress parameters).
- Narrative panels for stability, composition, flow, reserve/ROI health.

Observed overlap:
- Contains control and simulation logic already present in Sandbox.
- Contains decision framing that also exists in Decision Tree.

Decision:
- `NARROW` to decision narrative and recommended action framing.
- `MOVE` raw control manipulation back to Sandbox where possible.

### 6) Root Causes (`AuditDashboard`, internally still "Engineering Audit: Signals of Death")
Primary job:
- Failure-mode diagnosis and causal decomposition.

Main content:
- Global resilience scorecard and Signals of Death panel.
- Sensitivity tornado/heatmap.
- Solvency scorecard and proof matrix.
- Failure mode sections (subsidy trap, churn, density trap, adversarial resilience).
- Strategic recommendation panel.

Observed overlap:
- Solvency and sensitivity blocks repeat Decision Tree branch content.
- Recommendation language overlaps Strategy.

Decision:
- `KEEP` as diagnosis workspace.
- `MERGE-RULE`: diagnosis explains "why failing"; Strategy/Decide explains "what to do now".

### 7) Evidence (`TokenomicsStudy`)
Primary job:
- Long-form explanatory case study and narrative evidence.

Main content:
- Story-first educational narrative (coupling vs speculation, solvency matrix, scenario outcomes).
- Rich visual metaphors and case framing.

Observed overlap:
- Conceptual explanation overlaps Strategy intro content.

Decision:
- `KEEP` as educational appendix.
- Keep out of default first-review path; make it optional depth.

### 8) Decide mode (`DecisionTreeDashboard` + Wizard + Branches)
Primary job:
- Guided decision flow with branch-specific guardrails.

Main content:
- Wizard question: "What is your Validation Goal?"
- Four branches: Financial Stability, Miner Profitability, Real Utility, Risk & Stability.
- Each branch has clear "How to Read" context + chart stack + open-sandbox handoff.

Observed overlap:
- Reuses many KPIs/charts from Benchmark/Root Causes/Sandbox.
- Represents the cleanest guided IA pattern but currently lives outside top-tab model.

Decision:
- `PRIORITIZE` as canonical first-review journey.
- Integrate with top navigation semantics (or make explicit primary mode) to avoid context switching confusion.

## Overlap Hotspots (High Confidence)
1. Payback + miner ROI appears in Browse, Compare, Benchmark, Sandbox, Strategy, Decision Tree.
2. Solvency/burn-vs-mint appears in Benchmark, Sandbox, Root Causes, Decision Tree Financial.
3. Sensitivity analysis appears in Root Causes and Decision Tree Risk (and partially Benchmark deep-dive).
4. Retention/churn appears in Compare, Benchmark, Sandbox, Decision Tree Miner/Risk.

## Naming Drift and Semantic Mismatch
1. UI says `Root Causes`, component naming still `Diagnostic/Audit/Signals of Death`.
2. `Decide` exists as mode switch instead of tab, but functionally acts like primary flow.
3. `Workspace` is broad and hides three distinct jobs (discover, compare, experiment).
4. Strategy still includes lab-like controls, blurring strategy vs experimentation boundaries.

## Proposed Ownership Model (for next refactor)
1. Discover: protocol search and shortlisting (`Browse`).
2. Benchmark: executive peer snapshot + deltas.
3. Lab: parameter tuning and deep simulation (`Experiment` + advanced controls).
4. Root Causes: causal failure diagnostics + sensitivity.
5. Strategy: decision recommendation and action plan.
6. Evidence: optional educational appendix.
7. Decide flow: guided entry path that orchestrates 2 -> 4 -> 5 and links to Lab only when needed.

## Unique Purpose Test (Naming + Ownership Gate)
Rule:
- Each owner must answer one unique question and produce one unique output artifact.
- If two owners answer the same question, merge or narrow scope before renaming.

### Proposed owner set and unique purpose
1. `Explore`
- Unique question: What should we review?
- Unique output: shortlisted protocol(s).

2. `Benchmark`
- Unique question: How does it perform versus peers?
- Unique output: peer-relative KPI snapshot.

3. `Diagnose`
- Unique question: Why is it weak or strong?
- Unique output: root-cause and sensitivity findings.

4. `Scenario Lab`
- Unique question: What changes if we move levers?
- Unique output: scenario delta runs (before/after).

5. `Decision Brief`
- Unique question: What is our call now?
- Unique output: go/hold/no-go decision + confidence + actions.

6. `Case Studies`
- Unique question: What precedent supports this?
- Unique output: supporting case evidence and narrative context.

### Name quality checklist
1. Does the name imply a unique action?
2. Can a first-time user predict what they will get there?
3. Does it avoid overlap with another owner name?
4. Does it match the output artifact generated in that surface?

## Keep / Move / Merge / Park Summary
- Keep:
  - Browse table, Benchmark snapshot cards, Root Causes failure panels, Decision Tree wizard branches.
- Move:
  - Strategy low-level parameter controls -> Sandbox sidebar.
- Merge:
  - High-level peer narrative in Benchmark; dense protocol matrix detail in Compare.
  - Sensitivity ownership: Root Causes primary, Decision Tree Risk uses same engine/output contract.
- Park:
  - Secondary duplicate chart sets in Sandbox and verbose explanatory blocks not needed for first-pass review.

## Immediate Next Step (Execution-Ready)
Create a "content authority map" per KPI (single owner surface + allowed mirrors) before renaming/re-ordering tabs.

Proposed first KPI authority pass:
- Payback: owner `Benchmark`; mirrors `Compare`, `Decision Tree Miner`, `Sandbox`.
- Solvency: owner `Root Causes` + `Decision Tree Financial`; mirror `Benchmark summary` only.
- Utilization: owner `Decision Tree Utility`; mirrors `Benchmark`, `Sandbox`.
- Tail Risk: owner `Decision Tree Risk`; mirror `Root Causes`.

## Addendum: Information To Capture Next (For Simplicity Without Quality Loss)
Add these fields per tab surface before final nav/cleanup decisions:

1. Primary user question:
- Example: "Is the network solvent under this scenario?"

2. One-sentence takeaway:
- Plain-language summary a non-technical reviewer should remember.

3. Decision handoff:
- Explicit next action button/intention this tab should trigger.

4. Audience level:
- `first_review`, `operator`, `analyst`, `advanced`.

5. Default vs advanced boundary:
- What stays visible by default vs parked behind advanced.

6. Confidence contract:
- Required evidence metadata for every primary KPI (`source_grade`, `freshness`, `reproducibility`).

7. Cognitive load budget:
- Max default chart count and max concurrent controls allowed in this tab.

8. Terminology guard:
- Approved plain-language term + forbidden legacy aliases (prevents naming drift).

### Suggested Tab Metadata Template
```md
### <Tab Name>
- Primary question:
- One-sentence takeaway:
- Required next action:
- Audience level:
- Default content (must show):
- Advanced content (can hide):
- KPI owner(s):
- Evidence contract required:
- Terms to use / terms to avoid:
- Exit criterion (user done when...):
```
