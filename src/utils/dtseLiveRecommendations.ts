import type { DTSEFailureSignature, DTSEOutcome, DTSERecommendation } from '../types/dtse';

const roundTo = (value: number, digits: number = 1): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const priorityRank: Record<DTSERecommendation['priority'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const outcomeMap = (outcomes: DTSEOutcome[]): Record<string, DTSEOutcome> => (
  outcomes.reduce<Record<string, DTSEOutcome>>((acc, outcome) => {
    acc[outcome.metric_id] = outcome;
    return acc;
  }, {})
);

interface BuildLiveDTSERecommendationsOptions {
  protocolName: string;
  peerNames?: string[];
}

export function buildLiveDTSERecommendations(
  signatures: DTSEFailureSignature[],
  outcomes: DTSEOutcome[],
  options: BuildLiveDTSERecommendationsOptions,
): DTSERecommendation[] {
  const metrics = outcomeMap(outcomes);
  const solvency = metrics.solvency_ratio?.value ?? 0;
  const payback = metrics.payback_period?.value ?? 0;
  const retention = metrics.weekly_retention_rate?.value ?? 0;
  const utilization = metrics.network_utilization?.value ?? 0;
  const tailRisk = metrics.tail_risk_score?.value ?? 0;
  const peerAnalog = options.peerNames && options.peerNames.length > 0
    ? options.peerNames.slice(0, 2).join(', ')
    : undefined;

  const recommendations: DTSERecommendation[] = [];

  for (const signature of signatures) {
    if (signature.id === 'reward-demand-decoupling') {
      recommendations.push({
        id: 'live-response-reward-demand-decoupling',
        priority: signature.severity === 'critical' ? 'critical' : 'high',
        owner: 'Tokenomics Review',
        rationale: `${options.protocolName} is showing reward spend ahead of demand support: solvency is ${roundTo(solvency, 2)}x and payback is ${roundTo(payback, 1)} months.`,
        action: 'Possible response path: test tighter issuance discipline, slower reward release, or stronger demand-linked sinks in reruns before treating growth as durable.',
        expected_effect: `What to examine next: whether reruns can move solvency toward 1.30x+ and compress payback toward 24 months.`,
        timeframe: 'Near-term design review',
        success_metric: 'Compare reruns under lower net emissions and stronger sink assumptions.',
        dependency: 'Requires scenario reruns under matched assumptions, not a direct governance mandate.',
        risk_if_delayed: 'The dashboard can misread subsidy persistence as resilience if the demand side is not separated from reward support.',
        peer_analog: peerAnalog ? `Comparable peer context: ${peerAnalog} faced similar pressure when rewards expanded faster than validated demand.` : undefined,
      });
      continue;
    }

    if (signature.id === 'liquidity-driven-compression') {
      recommendations.push({
        id: 'live-response-liquidity-driven-compression',
        priority: signature.severity === 'critical' ? 'critical' : 'high',
        owner: 'Treasury / Market Structure Review',
        rationale: `Tail risk is ${roundTo(tailRisk, 0)} and the current run suggests a market dislocation can compress rewards faster than providers can adjust.`,
        action: 'Possible response path: examine liquidity buffers, unlock staging, or downside-control variants as comparative scenarios, rather than assuming average-case metrics are sufficient.',
        expected_effect: 'What to examine next: whether stress reruns reduce drawdown severity and keep solvency from collapsing during price compression.',
        timeframe: 'Stress-test review window',
        success_metric: 'Compare current run against liquidity-buffer and unlock-management variants.',
        dependency: 'Requires matched-condition reruns; not a forecast of actual market depth or governance behavior.',
        risk_if_delayed: 'Averages can look acceptable while the downside path remains too brittle to absorb a dislocation.',
        peer_analog: peerAnalog ? `Comparable peer context: ${peerAnalog} became more legible once downside controls were tested against the same stress channel.` : undefined,
      });
      continue;
    }

    if (signature.id === 'elastic-provider-exit') {
      recommendations.push({
        id: 'live-response-elastic-provider-exit',
        priority: signature.severity === 'high' ? 'high' : 'medium',
        owner: 'Supply-Side Retention Review',
        rationale: `Weekly retention is ${roundTo(retention, 1)}% while external yield pressure is active, suggesting providers may be more mobile than the current node count implies.`,
        action: 'Possible response path: test retention-weighting, quality-linked rewards, or competitor-defense variants to understand which supply segments are actually sticky.',
        expected_effect: 'What to examine next: whether targeted retention variants defend productive supply without assuming broad reward escalation.',
        timeframe: 'Scenario iteration',
        success_metric: 'Compare reruns on retention stability and utilization continuity under competitive-yield pressure.',
        dependency: 'Requires explicit competitive-yield scenario assumptions and supply segmentation.',
        risk_if_delayed: 'Physical capacity can leave before the demand side visibly weakens, which makes node count a lagging comfort metric.',
        peer_analog: peerAnalog ? `Comparable peer context: ${peerAnalog} is useful for seeing how mobile supply responds under the same external-yield pressure.` : undefined,
      });
      continue;
    }

    if (signature.id === 'profitability-induced-churn') {
      recommendations.push({
        id: 'live-response-profitability-induced-churn',
        priority: signature.severity === 'critical' ? 'high' : 'medium',
        owner: 'Provider Economics Review',
        rationale: `Retention is ${roundTo(retention, 1)}% and payback is ${roundTo(payback, 1)} months, which suggests operator economics may be falling below tolerance.`,
        action: 'Possible response path: test cost relief, reward-quality, or hardware-specific support assumptions to see which provider cohorts fail first.',
        expected_effect: 'What to examine next: whether reruns stabilize retention without masking weak unit economics.',
        timeframe: 'Scenario iteration',
        success_metric: 'Compare reruns on provider retention, payback compression, and service continuity.',
        dependency: 'Requires explicit provider-cost assumptions and cohort-aware interpretation.',
        risk_if_delayed: 'Churn can become self-reinforcing before governance has a clear read on which provider segment is failing.',
        peer_analog: peerAnalog ? `Comparable peer context: ${peerAnalog} is useful for comparing how provider cost pressure propagates into churn.` : undefined,
      });
      continue;
    }

    if (signature.id === 'latent-capacity-degradation') {
      recommendations.push({
        id: 'live-response-latent-capacity-degradation',
        priority: signature.severity === 'high' ? 'high' : 'medium',
        owner: 'Demand / Capacity Review',
        rationale: `Utilization is ${roundTo(utilization, 1)}%, which means physical capacity may still look present even as economic conversion weakens.`,
        action: 'Possible response path: test slower supply expansion, higher-conviction demand assumptions, or capacity-quality filters before interpreting node count as a sign of health.',
        expected_effect: `What to examine next: whether utilization can move from ${roundTo(utilization, 1)}% toward the healthy band under matched conditions.`,
        timeframe: 'Scenario iteration',
        success_metric: 'Compare reruns on utilization, demand coverage, and solvency under the same baseline.',
        dependency: 'Requires baseline-relative comparison; low utilization alone is not a universal ranking signal.',
        risk_if_delayed: 'The physical network can appear stable while the coordination loop is already weakening underneath it.',
        peer_analog: peerAnalog ? `Comparable peer context: ${peerAnalog} helps frame whether weak utilization is structural or scenario-specific.` : undefined,
      });
      continue;
    }
  }

  if (recommendations.length === 0) {
    return [
      {
        id: 'live-response-monitoring',
        priority: 'low',
        owner: 'Monitoring',
        rationale: `${options.protocolName} is currently inside healthy guardrails across the primary DTSE metrics in this run.`,
        action: 'Possible response path: keep the current design as the reference case and rerun DTSE after any major market, demand, or tokenomics change.',
        expected_effect: 'What to examine next: whether the same pattern holds across the thesis stress channels under matched assumptions.',
        timeframe: 'Ongoing comparison cadence',
        success_metric: 'Primary DTSE metrics remain inside healthy bands across reruns of the same baseline-relative scenarios.',
      },
    ];
  }

  return recommendations.sort((left, right) => priorityRank[left.priority] - priorityRank[right.priority]);
}
