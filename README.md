# DePIN Stress Test Simulator

Interactive dashboard for stress-testing DePIN tokenomics under macro shocks, liquidity unlocks, provider churn, and competitive pressure.

## Product Areas

- `Simulator`: explorer, comparison, and sandbox workflows for parameterized stress tests.
- `Benchmark`: peer scorecards, comparative matrices, and research overlays.
- `Thesis`: compact narrative dashboard for protocol-level thesis defense.
- `Diagnostic`: structural fragility audit (signals, failure modes, recommendations).
- `Case Study`: curated narrative view for report-style walkthroughs.
- `Decision Tree`: alternate V2 workflow focused on acceptance and decision-path analysis.

## Technical Stack

- React 18 + Vite + TypeScript + Tailwind CSS
- Charting with Recharts and Chart.js
- Dual simulation engines:
  - Agent-based engine: `src/model/simulation.ts`
  - Legacy vector engine: `src/model/legacy/engine.ts`
- Runtime engine toggle in-app: `Data -> Use V2 Model`

## Local Development

Prerequisites: Node.js 18+

1. Install dependencies:
   `npm install`
2. Start dev server:
   `npm run dev`
3. Open the local URL shown by Vite.

## Common Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run test` - test suite
- `npm run ci:optimizer` - run optimizer diagnostics + gate and write done-marker summary to `output/skill_reports/*_done_marker.md`
- `npm run acceptance:generate` - generate acceptance snapshots from live evaluator outputs
- `npm run ci:dashboard:acceptance` - generate acceptance snapshots and enforce temporary waiver gate (`M1,M2,M3`)

Acceptance notes:
- default generation applies interim operational promotion (`P -> Y`) for reproducible high-confidence answers.
- strict mode disables promotion: `npm run acceptance:generate -- --strict`
- dashboard acceptance gate enforces `>=80%` practical coverage for all sections except `I Onocoy Inputs` (excluded until primary inputs are wired).

## Done Marker

Completion criteria for this workstream are defined in:

- `/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/docs/DASHBOARD_DONE_MARKER.md`

Default CI scope is `optimizer`; switch to `dashboard` scope when you want full stakeholder acceptance coverage to block completion.

## Data Notes

- Live token market data is fetched from CoinGecko.
- On-chain protocol telemetry is integrated through service hooks where available.
- Simulator and benchmark outputs are scenario-driven model outputs, not price predictions.
