import type { DTSEFailureSignature, DTSEOutcome, DTSERecommendation } from '../types/dtse';
import { formatDTSEMetricValue } from './dtsePresentation';

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
  const formattedSolvency = `${formatDTSEMetricValue('solvency_ratio', solvency)}x`;
  const formattedPayback = `${formatDTSEMetricValue('payback_period', payback)} months`;
  const formattedRetention = `${formatDTSEMetricValue('weekly_retention_rate', retention)}%`;
  const formattedUtilization = `${formatDTSEMetricValue('network_utilization', utilization)}%`;
  const formattedTailRisk = formatDTSEMetricValue('tail_risk_score', tailRisk);

  for (const signature of signatures) {
    if (signature.id === 'reward-demand-decoupling') {
      recommendations.push({
        id: 'live-response-reward-demand-decoupling',
        priority: signature.severity === 'critical' ? 'critical' : 'high',
        owner: 'Tokenomics lead',
        rationale: `${options.protocolName} is spending rewards ahead of demand support. Solvency is ${formattedSolvency} and payback is ${formattedPayback}.`,
        action: 'Rerun with lower net emissions and stronger demand sinks',
        expected_effect: 'Lower net emissions, slow reward release, or strengthen demand-linked sinks. Keep the same stress contract.',
        timeframe: 'Next model review',
        success_metric: 'Move solvency toward 1.30x+ and payback toward 24 months without shifting the first break into another core metric.',
        dependency: 'Hold the same baseline, protocol, and stress channel constant so the comparison stays matched.',
        risk_if_delayed: 'The team can mistake subsidy persistence for resilience and keep reinforcing the same weak demand loop.',
        peer_analog: peerAnalog ? `${peerAnalog} faced similar pressure when rewards expanded faster than validated demand.` : undefined,
      });
      continue;
    }

    if (signature.id === 'liquidity-driven-compression') {
      recommendations.push({
        id: 'live-response-liquidity-driven-compression',
        priority: signature.severity === 'critical' ? 'critical' : 'high',
        owner: 'Treasury / market structure',
        rationale: `Tail risk is ${formattedTailRisk}. This run suggests a market dislocation can compress rewards faster than providers can adjust.`,
        action: 'Rerun with liquidity buffers and unlock controls',
        expected_effect: 'Test liquidity buffers, unlock staging, or downside controls. Keep demand and protocol assumptions constant.',
        timeframe: 'Next stress-test cycle',
        success_metric: 'Tail risk falls and solvency no longer collapses during the compression window under the same matched baseline.',
        dependency: 'Hold the same baseline and stress channel so the rerun isolates liquidity-side changes.',
        risk_if_delayed: 'Average metrics can look acceptable while the downside path stays too brittle to absorb a dislocation.',
        peer_analog: peerAnalog ? `${peerAnalog} became more legible once downside controls were tested against the same stress channel.` : undefined,
      });
      continue;
    }

    if (signature.id === 'elastic-provider-exit') {
      recommendations.push({
        id: 'live-response-elastic-provider-exit',
        priority: signature.severity === 'high' ? 'high' : 'medium',
        owner: 'Supply-side retention',
        rationale: `Weekly retention is ${formattedRetention} while external yield pressure is active. Providers may be more mobile than node count suggests.`,
        action: 'Rerun with stronger retention defense by cohort',
        expected_effect: 'Segment providers by cohort and test targeted retention weighting, quality-linked rewards, or competitor-defense assumptions instead of a flat reward increase.',
        timeframe: 'Next supply-side rerun',
        success_metric: 'The at-risk cohort retains more productive supply without pushing utilization or solvency lower elsewhere in the run.',
        dependency: 'Keep competitive-yield pressure active and hold the rest of the scenario constant so cohort effects stay visible.',
        risk_if_delayed: 'Mobile supply can leave before demand visibly weakens, which makes node count a lagging comfort metric.',
        peer_analog: peerAnalog ? `${peerAnalog} is useful for seeing how mobile supply responds under the same external-yield pressure.` : undefined,
      });
      continue;
    }

    if (signature.id === 'profitability-induced-churn') {
      recommendations.push({
        id: 'live-response-profitability-induced-churn',
        priority: signature.severity === 'critical' ? 'critical' : 'medium',
        owner: 'Provider economics',
        rationale: `Retention is ${formattedRetention} and payback is ${formattedPayback}. Operator economics may be falling below tolerance.`,
        action: 'Rerun with provider cost relief by cohort',
        expected_effect: 'Test cost relief, reward-quality changes, or hardware-specific support by provider cohort instead of a flat network-wide increase.',
        timeframe: 'Next provider-economics rerun',
        success_metric: 'Retention stabilizes and payback improves without hiding weak unit economics under broad subsidy.',
        dependency: 'Hold the same provider-cost assumptions except for the targeted cohort change being tested.',
        risk_if_delayed: 'Churn can become self-reinforcing before the team has a clean read on which provider segment is failing first.',
        peer_analog: peerAnalog ? `${peerAnalog} is useful for comparing how provider cost pressure propagates into churn.` : undefined,
      });
      continue;
    }

    if (signature.id === 'latent-capacity-degradation') {
      recommendations.push({
        id: 'live-response-latent-capacity-degradation',
        priority: signature.severity === 'high' ? 'high' : 'medium',
        owner: 'Demand / capacity',
        rationale: `Utilization is ${formattedUtilization}. Physical capacity may still look present even as economic conversion weakens.`,
        action: 'Rerun with slower supply expansion and tighter demand quality',
        expected_effect: 'Test slower supply expansion, higher-conviction demand assumptions, or capacity-quality filters before interpreting node count as health.',
        timeframe: 'Next demand-quality rerun',
        success_metric: `Utilization moves from ${formattedUtilization} toward the healthy band under the same matched baseline without worsening solvency.`,
        dependency: 'Keep the same baseline-relative comparison because low utilization alone is not a universal ranking signal.',
        risk_if_delayed: 'The physical network can appear stable while the coordination loop is already weakening underneath it.',
        peer_analog: peerAnalog ? `${peerAnalog} helps frame whether weak utilization is structural or scenario-specific.` : undefined,
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
        action: 'Rerun after the next major market or tokenomics change',
        expected_effect: 'Keep the current setup as the control and rerun only after a meaningful market, demand, or tokenomics change.',
        timeframe: 'Ongoing comparison cadence',
        success_metric: 'Primary DTSE metrics remain inside healthy bands across matched reruns of the same baseline-relative stress channels.',
      },
    ];
  }

  return recommendations;
}
