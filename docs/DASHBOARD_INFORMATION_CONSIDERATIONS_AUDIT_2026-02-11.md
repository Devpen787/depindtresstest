# Dashboard Information & Considerations Audit (2026-02-11)

Purpose:
- Confirm whether the dashboard analysis is complete enough for thesis-grade claims.
- Identify missing information, missing considerations, and source-quality gaps that still block defensible conclusions.

Scope reviewed:
- Simulator, Benchmark, Diagnostic, Explorer, model and viewmodel layers.
- Evidence stack in `references/citation_manifest.csv` and Onocoy verification docs.

---

## 1) Thesis Objective Coverage (Status)

| Thesis requirement | Coverage status | Notes |
| --- | --- | --- |
| Exogenous stress injection (macro, demand, liquidity, competition) | Covered | Implemented in simulation params and scenario wiring. |
| Provider retention/churn and capacity degradation | Covered | Modeled in engine and exposed in UI metrics. |
| Burn-to-mint solvency and inflation pressure | Covered | Core metrics exist across simulator/benchmark. |
| Liquidity-shock lag effects on churn/capacity | Partially covered | Shock exists, but evidence quality for real unlock modeling still blocked by vesting integers. |
| Cost-pressure downside (margin compression before churn) | Partially covered | Static provider cost supported; explicit cost-inflation regime over time is not modeled. |
| Failure modes formalization (reward-demand decoupling, liquidity compression, etc.) | Partially covered | Available in diagnostic panels, but several outputs are heuristic/illustrative. |
| Human/governance reaction layer under stress | Partially covered | Present conceptually in diagnostic layer, not fully policy-feedback simulation. |
| Reproducible empirical backtest layer | Not fully covered | Historical overlays were synthetic; now deterministic, but still not raw empirical time series. |
| Per-metric source-grade confidence labeling | Not fully covered | Present in some areas (`sourceType`), not implemented as a universal metric contract. |

---

## 2) Critical Gaps Still Blocking Full Defensibility

1. Vesting integer gap (high)
- Exact investor/team cliff + vest durations and vest start anchor remain unresolved.
- Without these, unlock-overhang modeling for mid-2026 remains scenario-assumption only.

2. Reproducible burn and active-miner queries (high)
- Burn/miner claims require runnable query IDs/SQL + full addresses + timestamped outputs.
- Current materials still include placeholder or partial paths for some claims.

3. Source-grade layer not universal (high)
- Dashboard lacks one schema applied to every high-impact metric:
  - `source_grade` (`primary|secondary|proxy|interpolated`)
  - `source_url_or_query_id`
  - `extraction_timestamp_utc`
  - `reproducibility_status`

4. Engine and schema drift risk (high)
- Some analysis paths use legacy-shaped aggregates (`demand_served`), others use new schema (`demandServed`).
- This can silently distort panel-level calculations if not normalized.

5. Synthetic historical overlays risk over-interpretation (medium)
- Historical benchmark overlays are not raw protocol exports.
- They should remain clearly labeled as standardized reference curves.

6. Benchmark downside dimensions are narrow (medium)
- Matrix currently emphasizes only four metrics.
- Missing explicit downside axes:
  - unlock overhang pressure
  - liquidity depth elasticity
  - lagged churn after drawdown
  - cost inflation to capacity degradation lag

---

## 3) Code-Level Integrity Actions Completed In This Audit

1. Fixed schema mismatch in comparison sustainability metric
- File: `src/components/Simulator/ComparisonView.tsx`
- Change: sustainability revenue now supports both `demandServed` and `demand_served`.
- Why it matters: prevents false low/zero sustainability values in comparison mode.

2. Made historical volatile overlays deterministic
- File: `src/data/historical_events.ts`
- Change: replaced `Math.random()` with seeded deterministic noise for volatile curves.
- Why it matters: chart outputs are now reproducible across runs.

3. Added explicit evidence-status note in empirical scorecard
- File: `src/components/Benchmark/ResilienceScorecard.tsx`
- Change: UI note that overlays are deterministic synthetic reference curves, not raw on-chain exports.
- Why it matters: avoids overclaiming empirical validity.

---

## 4) References Coverage vs Contributor List

Contributors from your original list that are already represented in manifest-backed sources:
- Kevin Owocki
- Krzysztof (Kris) Paruch
- Shermin Voshmgir
- Michael Zargham
- Uros Kalabic (collaborator set tied to BlockScience/DePIN tokenomics papers)

High-priority contributor research still missing (for dashboard-relevant rigor):
- Gabe Pohl-Zaretsky (risk parameterization and stress testing methods)
- Nimrod Talmon (computational social choice for governance stress rules)
- Angela Kreitenweis (governance mechanism framing and public-goods governance)
- Trent McConaghy (tokenized data/market design under utility constraints)
- Danilo Lessa Bernardineli / Franklin Delehelle (token physics/engineering mechanism implementation details)
- Roderick McKinley (on-chain risk diagnostics and forensic monitoring methods)

Note:
- Missing does not mean unusable dashboard.
- Missing means weaker citation coverage for some analysis considerations in a thesis defense context.

---

## 5) Minimum “Thesis-Safe” Acceptance Gate

Before claiming full analysis completeness across the dashboard:

1. Every high-impact KPI links to a primary source or runnable query.
2. Every KPI has explicit source-grade metadata and extraction timestamp.
3. Unlock-risk panel uses verified vesting integers, not assumed schedules.
4. Backtest narratives distinguish clearly between synthetic references and empirical exports.
5. A single normalized metric schema is enforced across simulator/benchmark/diagnostic views.

---

## 6) Recommended Next Data Collection (Order)

1. Onocoy vesting integers + vesting anchor evidence.
2. Runnable burn query package and active-miner reconstruction package.
3. Raw 2025 weekly/monthly KPI export used for the +1,527% burn-growth claim.
4. Additional contributor papers focused on risk modeling and governance stress handling (list above).

---

## 7) Implementation Status (This Session)

Implemented now:
- Shared evidence contract (`metric_id`, source grade, source/query ref, time window, reproducibility, extraction timestamp support).
- Reusable evidence badges and legend components.
- Evidence tags wired into core KPI surfaces:
  - Sandbox (Tier cards + chart boxes),
  - Comparison scorecard rows,
  - Benchmark cards + matrix,
  - Diagnostic solvency panels,
  - Empirical resilience backtest header.

Extended in this pass:
- Decision Tree tab (Wizard KPI labels + legend).
- Explorer tab (legend + row-level evidence tags for risk/payback/score).
- Thesis tab (legend + KPI evidence tags + historical overlay evidence tag).
