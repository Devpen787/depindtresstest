# Dashboard Acceptance Checklist Audit (2026-02-11)

## Artifacts
- Full row-level checklist (100 questions): `output/spreadsheet/dashboard_acceptance_checklist_2026-02-11.tsv`
- Coverage summary table: `output/spreadsheet/dashboard_acceptance_coverage_summary_2026-02-11.tsv`
- This summary: `docs/ONOCOY_DASHBOARD_ACCEPTANCE_CHECKLIST_2026-02-11.md`

## Method
- Each question was scored using current dashboard implementation with code-backed evidence.
- Status values:
  - `Y` = directly answerable in current dashboard
  - `P` = partially answerable (manual stitching, proxy metric, or missing direct diagnostic)
  - `N` = not answerable with current dashboard capabilities
- Coverage score used for stakeholder completeness:
  - `Direct Coverage` = `Y / total`
  - `Practical Coverage` = `(Y + 0.5 * P) / total`

## Coverage Summary
| Section | Questions | Y | P | N | Direct Coverage | Practical Coverage |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| A Core | 12 | 6 | 5 | 1 | 50.0% | 70.8% |
| B Builders | 18 | 2 | 14 | 2 | 11.1% | 50.0% |
| C Governance | 18 | 5 | 9 | 4 | 27.8% | 52.8% |
| D Providers | 12 | 2 | 10 | 0 | 16.7% | 58.3% |
| E Users | 8 | 4 | 4 | 0 | 50.0% | 75.0% |
| F Researchers | 14 | 6 | 8 | 0 | 42.9% | 71.4% |
| G Comparative | 8 | 3 | 5 | 0 | 37.5% | 68.8% |
| H Token | 10 | 4 | 6 | 0 | 40.0% | 70.0% |
| **Total** | **100** | **32** | **61** | **7** | **32.0%** | **62.5%** |

## Non-Answerable Questions (N)
1. Leading-indicator ordering (A11)
2. Reward smoothing impact as an explicit dashboard experiment (B11)
3. Cross-scenario structural-signature similarity (B13)
4. Governance decision ledger widening subsidy gap (C2)
5. Narrative-vs-structural reliance instrumentation (C8)
6. Emergency-centralization drift metric (C9)
7. Explicit beta/bonus extension scenario control (C11)

## Key Gap Pattern
- The dashboard is strongest on **simulation mechanics** (solvency, churn, capacity, risk) and **comparative views**.
- It is weakest on **governance process telemetry** and **higher-order analytics** (lead-lag attribution, scenario signature clustering, policy event tracking).

## Evidence Map (Where + How)
| Code | Where in dashboard | How answers were derived | Primary sources |
| --- | --- | --- | --- |
| D01 | Simulator sidebar stress controls | Read/modify stress inputs and rerun | `src/components/Simulator/SimulatorSidebar.tsx` |
| D02 | Quick Presets scenarios | Apply named scenario shocks | `src/data/scenarios.ts` |
| D03 | Sandbox Tier 1 survival | Solvency/retention/treasury thresholds and trends | `src/components/Simulator/SandboxView.tsx` |
| D04 | Sandbox Tier 2 viability | Payback, coverage score, vampire churn | `src/components/Simulator/SandboxView.tsx` |
| D05 | Sandbox Tier 3 utility | Capacity vs demand, utilization, quality mix | `src/components/Simulator/SandboxView.tsx` |
| D06 | Comparison view | Cross-protocol metrics and regime labels | `src/components/Simulator/ComparisonView.tsx`, `src/utils/regime.ts` |
| D07 | Benchmark dashboard | Peer-relative scorecards, projection, matrix, sensitivity | `src/components/Benchmark/BenchmarkView.tsx` |
| D08 | Benchmark data/model normalization | How mixed live/simulated metrics are computed | `src/viewmodels/BenchmarkViewModel.ts` |
| D09 | Benchmark research tab | Monte Carlo cones and resilience backtest overlays | `src/components/Benchmark/ResearchView.tsx`, `src/components/Benchmark/ResilienceScorecard.tsx` |
| D10 | Diagnostic dashboard | Archetype diagnostics, signals of death, failure-mode heuristics | `src/components/Diagnostic/AuditDashboard.tsx`, `src/audit/diagnosticViewMath.ts` |
| D11 | Decision Tree financial branch | Burn/mint and treasury runway interpretation | `src/components/DecisionTree/Branches/Financial/FinancialStabilityView.tsx`, `src/audit/decisionTreeViewMath.ts` |
| D12 | Decision Tree miner branch | Payback, churn risk, profitability trend | `src/components/DecisionTree/Branches/Miner/MinerProfitabilityView.tsx`, `src/audit/decisionTreeViewMath.ts` |
| D13 | Decision Tree utility branch | Demand coverage, utilization, cohort quality state | `src/components/DecisionTree/Branches/Utility/RealUtilityView.tsx`, `src/audit/decisionTreeViewMath.ts` |
| D14 | Decision Tree risk branch | Tail risk, insolvency exposure, volatility | `src/components/DecisionTree/Branches/Risk/RiskStabilityView.tsx`, `src/audit/decisionTreeViewMath.ts` |
| D15 | Core engine mechanics | Reward lag, unlock shock, panic churn, emissions logic | `src/model/simulation.ts` |
| D16 | Optimization and sensitivity levers | Break-even and sensitivity sweeps | `src/model/optimizer.ts`, `src/hooks/useSensitivityAnalysis.ts` |
| D17 | Derived risk metrics | Death-spiral proxies, volatility, drawdown logic | `src/model/metrics.ts` |
| D18 | Known thesis/evidence gaps | Defensibility blockers and missing evidence layers | `docs/ONOCOY_DASHBOARD_ESSENTIAL_GAPS_2026-02-11.md`, `docs/DASHBOARD_INFORMATION_CONSIDERATIONS_AUDIT_2026-02-11.md`, `docs/DASHBOARD_CAPABILITIES_SUMMARY.md` |
| D19 | Reproducibility controls | Seed + Monte Carlo controls + deterministic run path | `src/components/Simulator/SimulatorSidebar.tsx`, `src/hooks/useSimulationRunner.ts` |
| D20 | Non-goal/limitation disclaimers | Point-of-interpretation caveats in UI/docs | `src/components/Diagnostic/AuditDashboard.tsx`, `src/components/Benchmark/ResilienceScorecard.tsx`, `docs/WIKI.md` |

## Dashboard Areas Not Needed To Answer This Checklist
These modules were mostly not required for answering the acceptance questions above:
- Explorer browsing UX and market table details: `src/components/explorer/ExplorerTab.tsx`
- Thesis narrative tab visuals: `src/components/ThesisDashboard.tsx`
- Case-study narrative module: `src/components/CaseStudy/TokenomicsStudy.tsx`
- Export plumbing and share artifacts: `src/components/Benchmark/BenchmarkExportButton.tsx`, `src/utils/export.ts`
- AI insight copy blocks (used for narrative, not core acceptance evidence): `src/components/Benchmark/AIInsights.tsx`
