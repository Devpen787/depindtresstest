# Owner Purpose Alignment (2026-02-17)

## Why this doc exists
Define all current owners, their purpose, and how they collaborate as one coherent decision workflow.

## Owner Layers

### Layer 1: State Owners (cross-cutting)
1. Global run context owner: `index.tsx` + `useSimulationRunner`.
Purpose: single source for selected protocol, scenario params, simulation outputs, and view mode.
Must guarantee:
- no protocol/scenario desync between tabs,
- one run context propagated everywhere,
- consistent guardrail thresholds and metric definitions.

2. Evidence/guardrail contract owner: metric evidence + guardrail constants.
Purpose: ensure all critical KPIs expose source grade, freshness, and threshold meaning consistently.
Must guarantee:
- same threshold labels everywhere (`Healthy/Watchlist/Intervention`),
- same evidence semantics across owner and mirrors.

## Layer 2: Surface Owners (what each major surface owns)

| Owner Surface | Core Purpose | Primary Output | Should Not Own |
|---|---|---|---|
| `Browse` (Workspace) | Discovery and shortlisting | Candidate protocol set | Final decision narrative |
| `Benchmark` | Executive peer-relative snapshot | Headline comparative KPI readout | Deep root-cause decomposition |
| `Experiment` (Sandbox) | Assumption tuning and simulation lab | Parameterized scenario outcomes | Final recommendation copy |
| `Root Causes` | Why the system fails/holds | Causal diagnosis + sensitivity | Portfolio/strategy final narrative |
| `Strategy` | Convert analysis into action framing | Action plan + tradeoff narrative | Raw low-level simulation controls |
| `Evidence` | Educational and external context appendix | Background explanation and case storytelling | Real-time decision gates |
| `Decide` (Decision Tree) | Guided first-review path | Structured branch decision + next step | Duplicate metric logic separate from owners |

## Layer 3: KPI Owners (current baseline)

| KPI Family | Owner | Mirrors | Owner responsibility |
|---|---|---|---|
| Payback / Miner ROI | `Benchmark` + `Decision Tree Miner` | `Compare`, `Experiment`, `Strategy` | Canonical threshold meaning and wording |
| Solvency / Burn-vs-Emission | `Root Causes` + `Decision Tree Financial` | `Benchmark summary`, `Experiment` | Canonical solvency narrative and guardrails |
| Utility / Capacity / Utilization | `Decision Tree Utility` | `Benchmark`, `Experiment`, `Strategy` | Canonical utilization interpretation |
| Sensitivity | `Root Causes` | `Decision Tree Risk`, `Benchmark summary` | Canonical lever-impact and uncertainty framing |
| Tail Risk | `Decision Tree Risk` | `Root Causes` | Canonical downside-risk interpretation |

## How Owners Work Together (canonical choreography)

1. `Browse` -> select candidate protocol.
2. `Benchmark` -> confirm peer-relative posture quickly.
3. `Decide` -> choose review branch by user goal.
4. `Root Causes` (if weak signals) -> explain why degradation appears.
5. `Experiment` -> test lever changes and scenario alternatives.
6. `Strategy` -> convert results into action recommendation.
7. `Export` -> generate shareable decision brief.
8. `Evidence` -> optional appendix for deeper context.

## Collaboration Contracts (non-negotiable)

1. One owner per KPI interpretation.
- Mirrors can display, but cannot redefine meaning or thresholds.

2. Mirrors are read-through, not forked logic.
- Mirror charts/tables should consume owner metric contract, not recalculate independently.

3. Single global protocol + scenario context.
- Any header change must propagate to all owner surfaces in the same frame.

4. Owner must provide plain-language headline.
- Every owner KPI needs one non-technical sentence and one action trigger.

5. Default flow is decision-first.
- Advanced depth remains accessible but does not block first-review completion.

## Current Friction Points Blocking Clean Collaboration

1. `Decide` is primary in clarity but secondary in navigation (mode split).
2. Strategy still holds lab-like controls that belong to Experiment.
3. Root Causes naming and internal "Diagnostic/Audit" terminology drift.
4. Payback and solvency are repeated broadly without strict owner/mirror enforcement yet.

## Immediate Execution Questions

1. Should `Decide` become the default landing path for first-review users?
2. Which exact Strategy controls are moved back to Experiment in first cleanup pass?
3. Do we enforce owner contracts in code via shared selectors/hooks before more UI renaming?
4. What is the max default chart budget per owner surface?

## Done Criteria For Owner Alignment

1. Every top KPI has one explicit owner and documented mirrors.
2. Scenario/protocol changes remain synchronized across all surfaces.
3. No mirror chart uses divergent threshold text from owner.
4. First-review user completes Browse -> Benchmark -> Decide -> Strategy in one pass without dead ends.

