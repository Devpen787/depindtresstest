# Tab Chart Order Census (2026-02-17)

## Purpose
Chart-level inventory by surface: exact render order and what each chart communicates to a reviewer.

## Reading Rules
- "Order" means top-to-bottom in the currently rendered UI path.
- If a tab has modes (for example `Snapshot` vs `Deep Dive`), each mode is listed separately.
- "Chart" includes classic charts plus matrix/heatmap visuals used for decision interpretation.

## 1) Workspace -> Browse (`ExplorerTab` + `ExplorerTable`)

### Default order
1. `7d Trend` sparkline (one mini area chart per protocol row).
What it shows: short momentum shape for each token over 7 days (direction/smoothness, not deep causality).

Notes:
- Main Browse surface is table-first; only sparkline charts appear inline per row.

## 2) Workspace -> Compare (`ComparisonView`)

### Default order
1. Comparative scorecard matrix (table with heat-colored cells).
What it shows: cross-protocol values and baseline deltas in this order:
- Tokenomics: Token Price (End), Inflation (APY), Max Drawdown
- Network Growth: Active Nodes (End), Churn Rate, Utilization
- Miner Economics: Monthly Earnings, Payback Period
- Sustainability: Real Rev / Emissions

Notes:
- No line/area/bar charts in this view; comparison is matrix/table-driven.

## 3) Workspace -> Experiment (`SandboxView`)

### Storyline charts (default flow)

#### Tier 1: Survival
1. `Solvency Ratio` (composed chart with threshold + confidence band).
What it shows: burn/emissions sustainability regime over time, with deflationary boundary.
2. `Weekly Retention Rate` (area chart).
What it shows: provider stickiness and churn pressure.
3. `Urban Density` (area chart with CI band).
What it shows: concentration of fragile/high-speculator node cohorts.

#### Tier 2: Viability
4. `Payback Period` (line chart with healthy/risk thresholds).
What it shows: miner ROI time deterioration or recovery.
5. `Network Coverage Score` (area chart).
What it shows: coverage quality trajectory.

#### Tier 3: Utility
6. `Effective Capacity` (composed area+line).
What it shows: capacity vs served demand; overbuild vs productive usage.

### Additional compact chart grid (rendered below tiers)
7. `Payback Period` (compact).
8. `Solvency Ratio` (compact).
9. `Urban vs Rural Density` stacked area.
10. `Effective Capacity` (compact).
11. `Quality Distribution` stacked area (basic vs pro cohorts).
12. `Supply Trajectory` (line + CI band).
13. `Network Utilization` (area).

### Focus modal charts (on expand)
- Same metric family can open full-screen chart variants:
1. Solvency Ratio
2. Weekly Retention
3. Urban Density
4. Treasury Balance
5. Payback Period
6. Network Coverage Score
7. Vampire Churn
8. Effective Capacity
9. Rural Density
10. Quality Distribution
11. Supply Trajectory
12. Network Utilization
13. Liquidity Shock Impact (price path around unlock event)

## 4) Benchmark (`BenchmarkView`)

### Snapshot mode order
1. `Key Health Metrics Comparison` (grouped bar chart, normalized 0-100).
What it shows: apples-to-apples score comparison across payback/efficiency/sustainability/retention.
2. `Solvency Projection` (multi-line chart with critical and healthy reference lines).
What it shows: solvency-index trajectory and breach horizon for Onocoy vs peers.
3. Comparative matrix table.
What it shows: raw values and directional advantage/disadvantage per KPI.
4. `Strategic Edge` radar chart.
What it shows: multidimensional strategic posture per protocol.
5. `Key Sustainability Levers` impact bars.
What it shows: ranked lever sensitivity/impact magnitude.

### Deep Dive mode order (`ResearchView`)
1. `Empirical Resilience Scorecard` line chart (simulation vs historical overlay, normalized index).
What it shows: whether simulated behavior tracks known stress-event patterns.
2. `Monte Carlo Scenario Cone` area chart (metric toggle: price/nodes/revenue).
What it shows: mean path plus percentile bounds (uncertainty envelope).

## 5) Strategy (`ThesisDashboard`)

### Default order
1. `Network Stability (Aggregate)` line chart (dual-axis or normalized overlay mode).
What it shows: price/node stability coupling; optional historical comparison against Helium crash pattern.
2. `Grid Composition (Urban vs Rural)` line chart (filled bands).
What it shows: cohort composition stress and potential capitulation zones.
3. `Volumetric Flow (Mint vs Burn)` custom D3 area chart.
What it shows: subsidy gap over time (incentive minted value vs burned/revenue value).
4. `Protocol Health (Reserves)` bar chart.
What it shows: reserve accumulation/depletion profile by revenue strategy mode.
5. Miner ROI status panel (progress-style indicator, non-chartjs).
What it shows: capex vs reward pace and breakeven stress.

## 6) Root Causes (`AuditDashboard`)

### Section A: Master Proof Matrix (top of page)
1. `Strategic Proof: mVaR` stacked line/area chart.
What it shows: pro vs mercenary share dynamics and exodus timing.
2. `Architectural Proof` dual-line with deficit shading.
What it shows: incentive cost vs network revenue (subsidy gap).
3. `Methodological Proof` dual-line (ABM vs linear/excel projection).
What it shows: model risk hidden by linear assumptions.
4. `Solution Proof` dual-line (dynamic vs static policy).
What it shows: downside containment from adaptive emission policy.

### Section B: Solvency Scorecard (reused component)
5. `Network Distress Levels` area chart.
What it shows: underwater nodes and distress accumulation.
6. `Capital Efficiency (The Gauntlet)` dual-line chart.
What it shows: cost per unit vs revenue per unit crossing/divergence.
7. `Network Growth & Trap Door` bar chart.
What it shows: join flow and barrier-lock periods.

### Section C: Global Resilience Signals
8. Gauge: `Latent Capacity Degradation`.
What it shows: post-shock capacity decay severity.
9. Gauge: `Validation Overhead`.
What it shows: anti-spoofing/verification burden.
10. `Equilibrium Gap` mini bar chart.
What it shows: market price vs utility value balance.
11. `Churn Elasticity` mini line chart.
What it shows: mercenary vs pro exit response archetype.

### Section D: Sensitivity block (if analysis hook enabled)
12. `Sensitivity Tornado` horizontal bar chart.
What it shows: parameter impact ranking on solvency.
13. `Protocol Levers Heatmap` 2D grid.
What it shows: solvency region across burn% x emission-cap sweep.
14. `Inflation vs Capacity Scatter` scatter + trend line.
What it shows: feedback-loop correlation strength (R²).

### Section E: Failure mode charts
15. `Subsidy Trap` line chart (+ LUR side bar indicator).
What it shows: emissions vs burn divergence and liquidity utilization pressure.
16. `Hex Degradation Map` hex heat state map.
What it shows: profitable vs zombie vs latent node distribution.
17. `Density Trap` line chart.
What it shows: miner earnings decay against relatively fixed cost baseline.

Notes:
- Adversarial simulator, archetype panel, and recommendation panel are primarily non-chart narrative/control surfaces.

## 7) Evidence (`TokenomicsStudy`)

### Default order
1. `Coupling vs Speculation` line chart.
What it shows: demand-coupled vs speculative token value paths under stress.
2. `Solvency Matrix` 4x4 heatmap grid.
What it shows: safe/unsafe zones by emissions level vs verification volume.
3. `Contributor ROI` horizontal bar chart.
What it shows: payback months by scenario.
4. `Resilience Radar` radar chart.
What it shows: attack-vector resilience profile vs generic model baseline.

## 8) Decide Mode (`DecisionTreeDashboard`)

### Wizard screen
- No classical charts; 4 decision cards with headline metrics.

### Financial Stability branch order
1. `Solvency Scorecard` bundle (same 3 charts as Root Causes scorecard).
2. `Treasury Health` area chart.
What it shows: treasury or cumulative burn trajectory and depletion risk.

### Miner Profitability branch order
1. `Payback Period Trend` area chart.
2. `Cumulative Earnings vs Capex` line chart.
3. `Active Provider Count` area chart.
4. `Miner Churn Rate` area chart.

### Real Utility branch order
1. `Network Utilization Rate` area chart.
2. `Demand vs Demand Served` line chart.
3. `Provider Cohort Composition` stacked area chart.

### Risk & Stability branch order
1. `Sensitivity Analysis` tornado chart.

## Cross-Tab Comparison Anchors (for redesign work)

### Highest overlap families
1. Payback/ROI: Benchmark, Sandbox, Compare, Strategy, Decision Tree Miner.
2. Solvency/Burn-vs-Emission: Root Causes, Sandbox, Benchmark, Decision Tree Financial.
3. Sensitivity: Root Causes + Decision Tree Risk.
4. Utilization/Capacity: Sandbox, Benchmark, Strategy, Decision Tree Utility.

### Recommended ownership baseline
1. Primary solvency story owner: Root Causes + Decision Tree Financial.
2. Primary ROI story owner: Benchmark + Decision Tree Miner.
3. Primary utility story owner: Decision Tree Utility.
4. Primary sensitivity owner: Root Causes (Decision Tree Risk as guided lens).

## Addendum: Chart Clarity Data To Add Before Consolidation
To keep rigor while simplifying, add these fields for each chart instance:

1. Decision question answered:
- What concrete question this chart resolves.

2. Plain-language headline:
- One sentence a non-technical user can repeat.

3. Common misread:
- Most likely wrong interpretation users make.

4. Guardrail interpretation:
- Exact red/yellow/green meaning with thresholds.

5. Action trigger:
- What action to take if chart enters warning/intervention range.

6. Owner + mirrors:
- Single source chart and where duplicates are allowed.

7. Keep / merge / park recommendation:
- Whether chart remains in default flow, moves, or hides under advanced.

8. Reading level:
- `plain`, `mixed`, `expert` (target should be `plain` for first-review path).

### Suggested Chart Metadata Template
```md
- Chart ID:
- Tab/Section:
- Render order:
- Question answered:
- Plain-language headline:
- What it shows (technical):
- Common misread:
- Guardrail thresholds:
- Recommended action if red:
- Owner tab:
- Allowed mirrors:
- Keep/Merge/Park:
- Reading level target:
```

### First-Pass Priority Charts (fill these first)
1. Payback Period family (all instances).
2. Solvency/Burn-vs-Emission family.
3. Sensitivity family (tornado/heatmap/scatter).
4. Utilization/Capacity family.

## Unique Purpose Linkage (Chart Gate)
Before keeping any chart in default flow, validate:

1. Owner question match:
- This chart must directly answer the owner's unique question for that surface.

2. Artifact contribution:
- This chart must materially contribute to that surface's unique output artifact.

3. Duplicate control:
- If a chart does not add new decision signal versus an existing owner chart, move it to mirror/advanced.

4. Plain-language requirement:
- The chart must have a one-line headline and one action trigger understandable by first-review users.

### Keep/Merge/Park decision rule
- `KEEP`: directly answers owner question and changes decision outcome.
- `MERGE`: same signal as another owner chart; keep one canonical variant.
- `PARK`: useful depth but not required for first-review decision completion.
