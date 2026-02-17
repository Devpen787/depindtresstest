# Onocoy Review Presenter Script (7 Minutes)

Date: 2026-02-16

## 0:00-0:45 - Setup
1. Set protocol from global header.
2. Set baseline scenario from global header.
3. Confirm that tab changes keep the same protocol/scenario context.

Script line:
"We now use one global context bar. Protocol and scenario changes are reflected across Benchmark, Diagnostics, and Strategy without backtracking."

## 0:45-2:15 - Benchmark
1. Open `Benchmark`.
2. Read status card and KPI trend.
3. Open decision brief card and highlight:
- verdict
- top drivers
- actions (owner/trigger/effect)
- confidence/freshness
4. Export from header `Export Brief` and confirm toast (`Exported decision-brief-benchmark-...`).

Script line:
"Benchmark answers where we stand versus peers and gives one immediate action path with confidence and evidence context."

## 2:15-3:45 - Diagnostics
1. Open `Diagnostics`.
2. Show active failure mode selector and recommended mode button.
3. Read decision brief card and action mapping.
4. Export from header `Export Brief` and confirm toast (`Exported decision-brief-diagnostics-...`).

Script line:
"Diagnostics answers what is breaking first and what intervention has the highest leverage under the same global scenario context."

## 3:45-5:15 - Strategy
1. Open `Strategy`.
2. Keep default three controls only (market stress, emission mode, revenue strategy).
3. Read decision brief card summary and action mapping.
4. Export from header `Export Brief` and confirm toast (`Exported decision-brief-policy_lab-...`).

Script line:
"Strategy answers which single lever improves resilience without introducing another guardrail breach."

## 5:15-6:15 - Stress Re-Run
1. Change to a stressed scenario from global header.
2. Revisit Benchmark decision brief and confirm updated verdict/confidence/freshness.
3. Export updated brief from header and confirm toast.

Script line:
"This demonstrates reproducibility: each exported brief includes run timestamp, scenario/protocol context, and parameter hash."

## 6:15-7:00 - Close
1. Show acceptance gate summary file:
- `output/skill_reports/dashboard_acceptance_gate.md`
2. Confirm review target:
- reviewer can identify status + next action + export reproducible brief.

Script line:
"The default flow is now decision-first and the advanced analysis remains available when needed, not forced up front."
