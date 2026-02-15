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

## Data Notes

- Live token market data is fetched from CoinGecko.
- On-chain protocol telemetry is integrated through service hooks where available.
- Simulator and benchmark outputs are scenario-driven model outputs, not price predictions.
