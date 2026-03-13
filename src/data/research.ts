export interface LearnContentSection {
  title: string;
  body: string[];
}

export const DTSE_LEARN_CONTENT = {
  howItWorks: {
    title: 'How DTSE Works',
    eyebrow: 'DTSE guide',
    intro: 'DTSE compares a selected stress scenario against a matched baseline and shows what weakens first. Use it to understand failure order and next tests. Do not use it as a price forecast or a universal protocol ranking.',
    helper: 'Read Stage 1 before trusting the scores. Read Stage 3 before reading Stage 5.',
    sections: [
      {
        title: 'What DTSE is',
        body: [
          'DTSE is a guided workflow for reading a DePIN stress run from context to failure order to next tests.',
          'It helps a user separate live market context, saved reference values, and model outputs before making a judgment about the run.',
        ],
      },
      {
        title: 'What DTSE is not',
        body: [
          'DTSE is not a price predictor, a trading signal, or a universal protocol ranking.',
          'A weak DTSE result means the selected scenario exposes a fragile path under matched conditions. It does not claim the live network is already failing.',
        ],
      },
      {
        title: 'How to read a run',
        body: [
          'Stage 1 tells you what is live market context, what is reference context, and what the model assumed.',
          'Stage 2 tells you which metrics are fair to score in this exact run.',
          'Stage 3 shows failure order. Stage 4 groups those outputs into interpreted patterns. Stage 5 turns them into reruns or decision discussions.',
        ],
      },
      {
        title: 'Where data comes from',
        body: [
          'Market context can come from a live CoinGecko pull or from saved reference values when live data is unavailable.',
          'Model outputs come from the current simulator run when those series exist. Otherwise DTSE falls back to the saved protocol pack.',
        ],
      },
      {
        title: 'How evidence quality affects scoring',
        body: [
          'DTSE only scores metrics that are fair under the selected protocol, stress channel, and evidence quality.',
          'Metrics can still appear in the workflow but be held out from scoring when the scenario does not activate them, the evidence is too weak, or the metric would be misleading for this protocol.',
        ],
      },
      {
        title: 'Use DTSE with Stress Lab',
        body: [
          'Use DTSE first to find the failure order and the likely weak link.',
          'Then open Stress Lab to rerun the same protocol with one or two targeted changes so you can see whether the sequence improves, not just the final headline metric.',
        ],
      },
    ] as LearnContentSection[],
  },
  metricDefinitions: {
    title: 'Metric Definitions',
    eyebrow: 'Scored metrics',
    intro: 'These are the DTSE metrics the app can score when the active protocol, stress channel, and evidence quality support a fair readout.',
    helper: 'Start with the metric definition, then read the target, the decision use, and the healthy/watchlist/intervention interpretation.',
  },
};
