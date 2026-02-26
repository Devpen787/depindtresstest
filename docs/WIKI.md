# DePIN Stress Test Simulator Wiki

This wiki reflects the current app behavior and control surface.

## 1. Product Map

The app's primary workflow is **DTSE (DePIN Token Stress Evaluation)**, which is the default landing tab. Legacy depth views are grouped under **Advanced**.

### DTSE — Primary Workflow

DTSE is a 6-stage guided evaluation:

1. **Data Ingestion & Applicability** — Load a pre-computed bundle; classify metrics as Runnable (R) or Not Runnable (NR).
2. **Peer Analog Selection** — Confirm cross-protocol comparison peers.
3. **Scenario Configuration** — Review horizon, seed policy, simulation count, macro conditions.
4. **Stress Execution & Results** — View simulation outcomes with guardrail band classification.
5. **Failure Signatures & Recommendations** — Surface structural failures and generate prioritized actions.
6. **Export & Report** — Export the evaluation as PDF, JSON bundle, or clipboard summary.

DTSE operates in **frozen bundle** mode by default (pre-computed, deterministic results from `public/dtse/`) or **recompute** mode for fresh simulation runs.

### Advanced Depth Views

The following tabs are available under the Advanced grouping:

- `Simulator` (with `Explorer`, `Comparison`, and `Sandbox` sub-views)
- `Benchmark`
- `Thesis`
- `Diagnostic`
- `Case Study`
- `Decision Tree` (separate mode launched from header)

These remain fully functional for deep-dive analysis beyond the DTSE workflow.

## 2. Engine Modes

Engine execution is controlled by `Data -> Use V2 Model` in the header.

- `ON` (default): agent-based pipeline in `src/model/simulation.ts`
- `OFF`: legacy vector engine in `src/model/legacy/engine.ts` through `src/model/SimulationAdapter.ts`

Important differences:

- In V2, `revenueStrategy=reserve` accumulates treasury but does not apply explicit price dampening.
- In V1 legacy, `revenueStrategy=reserve` includes price dampening behavior.
- In V1 legacy, `emissionModel` (`fixed`/`kpi`) changes mint logic.
- In V2, emissions are dynamic with guardrails; `emissionModel` is currently passed through but not used as a branch toggle.

## 3. Simulator Controls (Sandbox Sidebar)

### Stress Controls

- `Time Horizon (T)`: `12-104` weeks
- `Exogenous Load (demandType)`: `consistent`, `growth`, `volatile`, `high-to-decay`
- `Network Effects`: toggle (`Exogenous Only` / `Endogenous (Metcalfe)`)
- `Macro Condition`: `bearish`, `sideways`, `bullish`

Note: quick presets can also set `macro=neutral`.

### Vampire & Treasury

- `Competitor Yield Advantage`: `0-200%`
- `Emission Model`: `fixed` or `kpi`
- `Revenue Strategy`: `burn` or `reserve`

### Quick Presets

Current presets include:

- `Liquidity Shock`
- `The Subsidy Trap`
- `Vampire Attack`
- `Aggressive Expansion`
- `Project: Onocoy`
- `Project: Hivemapper`
- `Project: Grass`
- `Vs Geodnet`

### Tokenomics

- `Initial Token Price`: number input (`0.01-100`)
- `Burn Percentage`: slider (`0-100%`)
- `Weekly Emission Cap`: numeric token cap

### Advanced Configuration

Provider economics:

- `Initial Node Count`: `10-50,000`
- `Pro Hardware Share`: `0-100%`
- `Weekly OpEx Cost`: `5-200` USD/week
- `Hardware Cost (CapEx)`: `200-2,000` USD
- `Churn Threshold`: `-20` to `50` USD/week

Simulation:

- `Monte Carlo Runs (nSims)`: `20-500`
- `Random Seed`: `1-999999`

## 4. Header Actions

- `Learn`: Methodology, Math Specification, System Wiki
- `Data`: Fetch Live Data, Auto Refresh (5m), DePIN Browser, Use V2 Model
- `Settings`
- `Export`
- `Decision Tree`
- `Run Matrix` (Simulator tab)

## 5. Runtime Defaults

Baseline defaults in the runner are profile-driven plus global defaults:

- `T=52`
- `nSims=25`
- `seed=42`
- `macro=sideways`
- `investorUnlockWeek=26`
- `initialLiquidity=500000`
- `investorSellPct=0.05` before profile-specific calibration

Source: `src/hooks/useSimulationRunner.ts`.

## 6. Key Metrics

- `solvencyScore = dailyBurnUsd / dailyMintUsd`
- `netDailyLoss = ((burned/7) - (minted/7)) * price`
- `paybackMonths` is derived in the Sandbox view from provider weekly profit and hardware cost
- `utilization = demandServed / capacity`
- `vampireChurn` tracks competitor-induced departures

## 7. Formula Notes

### Price Update (high-level)

V2 combines:

- macro drift (`mu`, depends on macro condition)
- buy pressure effect
- sell pressure effect
- demand scarcity pressure
- net-emission pressure
- stochastic noise

Then applies log-return clamping before next price.

### Liquidity Shock (unlock)

On `investorUnlockWeek`, unlock sell pressure is routed through a constant-product pool representation, then panic churn checks run.

### Emissions (V2)

V2 emissions use demand/saturation with demand-backed and inflation guardrails. Mint is bounded by multiple caps.

### Churn

- baseline provider churn is probabilistic from consecutive losses/profit
- panic churn can trigger after sharp unlock-driven price drops
- vampire churn depends on `competitorYield`

## 8. Limitations

- Model outputs are scenario analyses, not forecasts.
- Weekly timesteps smooth intraday dynamics.
- Geography is represented statistically; it is not a geospatial physics engine.
- The Thesis tab uses a separate simplified model path from Sandbox/Benchmark.

## 9. In-App Wiki Source

The in-app `System Wiki` modal is rendered from:

- `src/data/wiki.ts`

`docs/WIKI.md` is the repository markdown companion.

---

## 10. DTSE Bundle Loading

DTSE bundles are loaded from `public/dtse/` and consist of:

- `manifest.json` — artifact listing with checksums.
- `run_context.json` — scenario metadata (run ID, seed policy, horizon, evidence status).
- `outcomes.json` — metric-level results with guardrail band classification.
- `applicability.json` — per-metric R/NR classification with reason codes.

The bundle loader (`src/services/dtseBundle.ts`) validates all required fields on load and rejects incomplete or malformed bundles with actionable error messages.

See also: `docs/DTSE_PRODUCT_SPEC_V1.md` for the full specification.

---

Last updated: 2026-02-26
