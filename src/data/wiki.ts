export interface WikiSection {
  id: string;
  title: string;
  icon?: string;
  content: string;
  subsections?: {
    title: string;
    content: string;
  }[];
}

export const WIKI_CONTENT: WikiSection[] = [
  {
    id: 'intro',
    title: 'Welcome',
    icon: '👋',
    content: `
# DePIN Stress Test Simulator

The dashboard uses **DTSE** (DePIN Token Stress Evaluation) as the primary landing tab — a 5-stage guided workflow for protocol evaluation.

Advanced depth views (Benchmark, Root Causes, Strategy, Decide, Evidence) remain accessible in the tab bar for detailed analysis.

- **DTSE** — primary evaluation workflow (Protocol Context → Applicability → Outcomes → Failure Signature → Recommendations)
- **Benchmark** — peer scorecards and comparative matrices
- **Root Causes** — structural fragility diagnostics
- **Strategy** — intervention planning
- **Decide** — decision tree analysis
- **Evidence** — case study narratives

Use this wiki as the source of truth for current controls and behavior.
    `,
  },
  {
    id: 'dtse',
    title: 'DTSE Workflow',
    icon: '🔬',
    content: `
## DTSE — DePIN Token Stress Evaluation

DTSE is the primary evaluation workflow. It loads a frozen simulation bundle and presents results through 5 progressive stages:

1. **Protocol Context** — protocol identity, scenario grid, model version, evidence status
2. **Applicability** — metric readiness verdicts (Runnable / Not Runnable) with reason codes
3. **Outcomes** — key simulation KPIs classified by guardrail band (healthy / watchlist / intervention)
4. **Failure Signature** — structural fragility patterns sorted by severity
5. **Recommendations** — actionable items with priority, owner assignment, and export

### Run Context Strip

A persistent strip at the top shows protocol, scenario grid, horizon, evidence status, and model version.

### Frozen Bundle

DTSE loads pre-computed results from \`public/dtse/\`. Use \`npm run dtse:verify\` to validate bundle integrity.
    `,
  },
  {
    id: 'engine',
    title: 'Engine Modes',
    icon: '⚙️',
    content: `
## Runtime Engine Toggle

Engine selection is controlled by **Data -> Use V2 Model** in the header.

- **ON (default):** Agent-based pipeline in \`src/model/simulation.ts\`
- **OFF:** Legacy vector engine in \`src/model/legacy/engine.ts\` via \`src/model/SimulationAdapter.ts\`

## Behavior Differences

- In V2, \`revenueStrategy=reserve\` accumulates treasury but does not apply explicit price dampening.
- In V1 legacy, \`revenueStrategy=reserve\` includes dampening logic.
- In V1 legacy, \`emissionModel\` (\`fixed\`/\`kpi\`) changes mint behavior.
- In V2, emissions are dynamic with guardrails; \`emissionModel\` is currently passed through but not used as a branch toggle.
    `,
  },
  {
    id: 'simulator',
    title: 'Simulator Controls',
    icon: '🔬',
    content: `
## Stress Controls

- **Time Horizon (T):** 12-104 weeks
- **Exogenous Load (demandType):** consistent, growth, volatile, high-to-decay
- **Network Effects:** Exogenous Only / Endogenous (Metcalfe)
- **Macro Condition:** bearish, sideways, bullish

Note: quick presets can also set \`macro=neutral\`.

## Vampire & Treasury

- **Competitor Yield Advantage:** 0-200%
- **Emission Model:** fixed / kpi
- **Revenue Strategy:** burn / reserve

## Tokenomics

- **Initial Token Price:** numeric input (0.01-100)
- **Burn Percentage:** 0-100%
- **Weekly Emission Cap:** numeric token cap

## Advanced Configuration

Provider economics:

- **Initial Node Count:** 10-50,000
- **Pro Hardware Share:** 0-100%
- **Weekly OpEx Cost:** 5-200 USD/week
- **Hardware Cost (CapEx):** 200-2,000 USD
- **Churn Threshold:** -20 to 50 USD/week

Simulation:

- **Monte Carlo Runs (nSims):** 20-500
- **Random Seed:** 1-999999
    `,
  },
  {
    id: 'presets',
    title: 'Quick Presets',
    icon: '⚡',
    content: `
Current preset list:

- **Liquidity Shock**
- **The Subsidy Trap**
- **Vampire Attack**
- **Aggressive Expansion**
- **Project: Onocoy**
- **Project: Hivemapper**
- **Project: Grass**
- **Vs Geodnet**

Presets update one or more model parameters and can override macro/demand assumptions.
    `,
  },
  {
    id: 'benchmark',
    title: 'Benchmark',
    icon: '📊',
    content: `
Benchmark has two panels:

- **Dashboard:** peer metrics, matrices, radar, sensitivity summary, export
- **Research:** resilience scorecards and Monte Carlo cone views

Benchmark reuses the same simulation parameter surface and engine toggle semantics.
    `,
  },
  {
    id: 'diagnostic',
    title: 'Diagnostic',
    icon: '🛡️',
    content: `
Diagnostic focuses on structural fragility and intervention planning.

Core outputs include:

- Signals of Death
- Subsidy Trap
- Density Trap
- Hex Degradation Map
- Strategic action recommendations
    `,
  },
  {
    id: 'data',
    title: 'Data & Integrations',
    icon: '🔗',
    content: `
## Header Data Menu

- **Fetch Live Data:** CoinGecko market pulls
- **Auto Refresh:** 5-minute cycle
- **DePIN Browser:** token browser modal
- **Use V2 Model:** runtime engine selection

## Interpretation

- Explorer combines live market context with protocol profiles.
- Simulator and Benchmark are scenario-driven model outputs.
- Outputs are stress-test evidence, not forward price predictions.
    `,
  },
  {
    id: 'metrics',
    title: 'Metrics & Formulas',
    icon: '🧮',
    content: `
## Core Metrics

- **Solvency Score:** \`dailyBurnUsd / dailyMintUsd\`
- **Net Daily Loss:** \`((burned/7) - (minted/7)) * price\`
- **Utilization:** \`demandServed / capacity\`
- **Vampire Churn:** competitor-induced churn proxy
- **Payback Months:** derived from weekly provider profit and hardware cost in Sandbox

## Formula Notes

- Price combines macro drift, buy/sell pressure, scarcity pressure, emission pressure, and noise.
- Unlock shock uses a constant-product pool representation.
- V2 emissions are dynamic with demand/saturation + guardrails.
    `,
  },
  {
    id: 'defaults',
    title: 'Defaults',
    icon: '📌',
    content: `
Runner-level defaults (before profile-specific overrides/calibration):

- \`T=52\`
- \`nSims=25\`
- \`seed=42\`
- \`macro=sideways\`
- \`investorUnlockWeek=26\`
- \`initialLiquidity=500000\`
- \`investorSellPct=0.05\`

Source: \`src/hooks/useSimulationRunner.ts\`.
    `,
  },
  {
    id: 'limitations',
    title: 'Limitations',
    icon: '⚠️',
    content: `
- Weekly timestep model (not intraday market microstructure).
- Geography is represented statistically, not full physical-network simulation.
- Thesis tab uses a separate simplified logic path from Sandbox/Benchmark.
- Scenario outputs are decision-support stress tests, not guaranteed forecasts.
    `,
  },
  {
    id: 'developer',
    title: 'Developer Notes',
    icon: '👨‍💻',
    content: `
Relevant files for extension work:

- \`src/data/protocols.ts\` (protocol profiles)
- \`src/data/scenarios.ts\` (quick presets)
- \`src/hooks/useSimulationRunner.ts\` (simulation orchestration)
- \`src/model/simulation.ts\` (agent-based engine)
- \`src/model/legacy/engine.ts\` (legacy vector engine)
- \`src/components/MethodologySheet.tsx\` (wiki modal renderer)
    `,
  },
  {
    id: 'version',
    title: 'Documentation Status',
    icon: '📅',
    content: `
This in-app wiki was refreshed on **2026-02-15**.

Companion markdown wiki: \`docs/WIKI.md\`.
    `,
  },
];
