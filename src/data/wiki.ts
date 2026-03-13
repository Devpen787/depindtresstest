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
    id: 'overview',
    title: 'What DTSE Is',
    icon: '🧭',
    content: `
# DTSE Product Docs

## What DTSE is

DTSE compares a selected stress scenario against a matched baseline and shows what weakens first.

Use it to understand failure order, scoring fairness, and the next reruns or decision discussions worth testing.

## What DTSE is not

- DTSE is **not** a price forecast.
- DTSE is **not** a universal protocol ranking.
- DTSE is **not** a claim that the live network is already failing.

Read DTSE as a comparative stress workflow, not as a standalone verdict.
    `,
  },
  {
    id: 'stages',
    title: 'What Each Stage Does',
    icon: '🪜',
    content: `
## Stage 1 — Context

Shows what the run is about before you trust any score.

- live market context or saved reference market context
- simulation inputs and structural assumptions
- peer context and stress channel framing

## Stage 2 — What Can Be Scored

Shows which metrics are fair to score in the current protocol, stress channel, and evidence setup.

- **Scored now** means DTSE considers the metric fair for this run.
- **Held out** means DTSE is intentionally not scoring the metric to avoid a misleading readout.

## Stage 3 — What Broke First

Shows deterioration order before you focus on the metric levels.

- baseline drift
- earliest trigger timing
- transmission pathway
- scored outcome cards

## Stage 4 — Failure Patterns

Groups the Stage 3 outputs into interpreted failure patterns.

Patterns are model interpretations, not direct observations of live network events.

## Stage 5 — Next Tests

Turns the readout into reruns or decision discussions.

These are not direct prescriptions. They are the next tests worth running under matched conditions.
    `,
  },
  {
    id: 'data-sources',
    title: 'Where Data Comes From',
    icon: '🔎',
    content: `
## Market context

DTSE can show market context in two ways:

- **Live**: fetched from CoinGecko through the header Data menu
- **Reference**: saved protocol baseline values used when live market data is unavailable

## Model source

DTSE can show outcome layers in two ways:

- **Current run**: built from the active simulator output for the selected protocol
- **Saved pack**: built from the protocol's saved DTSE pack when current-run series are unavailable

This means DTSE is not only a static bundle viewer. It prefers current simulation output when it exists.
    `,
  },
  {
    id: 'scoring',
    title: 'Evidence Quality and Scoring',
    icon: '🧪',
    content: `
## How evidence quality affects scoring

DTSE only scores metrics that are fair under the selected protocol, stress channel, and evidence quality.

Common scoring outcomes:

- **Data available**: the metric is supported well enough to score
- **Using proxy**: the metric is scored, but part of the evidence uses an accepted proxy
- **Not used in this scenario**: the metric is intentionally held out because the active stress channel does not make it relevant
- **Data missing / source quality insufficient**: the metric is held out to avoid a false sense of precision

The trust chip **Scoring confidence** summarizes the overall evidence posture as **Full**, **Partial**, or **Limited**.
    `,
  },
  {
    id: 'stress-lab',
    title: 'How To Use DTSE With Stress Lab',
    icon: '🛠️',
    content: `
## Suggested workflow

1. Open DTSE and identify the earliest break in Stage 3.
2. Confirm in Stage 2 that the key metric is actually fair to score.
3. Read Stage 4 to understand the interpreted failure pattern.
4. Open **Actions -> Open Stress Lab**.
5. Rerun the same protocol with one targeted change at a time.

## Good rerun hygiene

- Hold most assumptions constant.
- Change only the lever the Stage 5 recommendation is testing.
- Compare the new run against the same baseline.
- Look for a better failure order, not just a prettier top-line score.
    `,
  },
  {
    id: 'header-controls',
    title: 'Header Controls',
    icon: '🧰',
    content: `
## Learn

- **How DTSE Works**: product explanation for first-time readers
- **Metric Definitions**: what each DTSE metric measures and how to interpret it
- **Product Docs**: these longer-form docs

## Data

- **Refresh market data**
- **Auto-refresh every 5 minutes**
- **Model engine: Agent-Based v2** or **Legacy v1**

## Actions

- **Export DTSE run** while you are on DTSE
- **Open Stress Lab** from DTSE and the other tabs
    `,
  },
  {
    id: 'engines',
    title: 'Model Engines',
    icon: '⚙️',
    content: `
## Engine choices

The Data menu lets you switch between the current agent-based engine and the legacy engine.

- **Agent-Based v2** is the default runtime path.
- **Legacy v1** remains available for comparison and compatibility.

Use engine changes carefully. A DTSE result should only be compared across runs when the engine, baseline, and stress assumptions are all matched.
    `,
  },
  {
    id: 'limitations',
    title: 'Limitations',
    icon: '⚠️',
    content: `
## Product limitations

- DTSE is a weekly-step stress workflow, not an intraday market simulator.
- Geographic and hardware behavior are modeled abstractions, not a full physical-network reconstruction.
- Some metrics rely on proxy evidence or saved reference data depending on protocol coverage.
- A strong DTSE result does not remove governance, liquidity, or execution risk outside the tested scenario.
    `,
  },
  {
    id: 'developer',
    title: 'Developer Notes',
    icon: '👨‍💻',
    content: `
Relevant files for DTSE work:

- \`index.tsx\`
- \`src/components/DTSE/\`
- \`src/data/dtseContent.ts\`
- \`src/utils/dtseLiveApplicability.ts\`
- \`src/utils/dtseLiveOutputs.ts\`
- \`src/utils/dtseLiveRecommendations.ts\`
- \`src/utils/dtseProtocolInsights.ts\`
- \`src/components/MethodologyDrawer.tsx\`
- \`src/components/MethodologySheet.tsx\`
    `,
  },
];
