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
    if (signature.id.includes('subsidy-trap')) {
      recommendations.push({
        id: 'live-rec-subsidy-trap',
        priority: signature.severity === 'critical' ? 'critical' : 'high',
        owner: 'Tokenomics',
        rationale: `${options.protocolName} is running with solvency at ${roundTo(solvency, 2)}x and payback at ${roundTo(payback, 1)} months, which indicates subsidy dependence rather than self-sustaining provider economics.`,
        action: 'Reduce net emission pressure and tighten reward issuance until burn coverage and provider ROI return to healthy guardrails.',
        expected_effect: `Move solvency from ${roundTo(solvency, 2)}x toward 1.30x+ and payback toward 24 months or better.`,
        timeframe: signature.severity === 'critical' ? '0-30 days' : '0-45 days',
        success_metric: 'Solvency ratio ≥ 1.30x with payback trending below 24 months.',
        dependency: 'Emission schedule governance and provider communication plan.',
        risk_if_delayed: 'Continued dilution risk and slower path to defensible unit economics.',
        peer_analog: peerAnalog ? `${peerAnalog} tightened emissions or reward quality during fragile growth phases.` : undefined,
      });
      continue;
    }

    if (signature.id.includes('demand-gap')) {
      recommendations.push({
        id: 'live-rec-demand-gap',
        priority: signature.severity === 'critical' ? 'high' : 'medium',
        owner: 'Growth',
        rationale: `Utilization is only ${roundTo(utilization, 1)}%, which means current supply and incentive spend are not being converted into enough paid demand.`,
        action: 'Concentrate GTM on high-conviction demand segments and slow undifferentiated supply expansion until utilization improves.',
        expected_effect: `Increase utilization from ${roundTo(utilization, 1)}% toward the 35%+ healthy band.`,
        timeframe: '30-90 days',
        success_metric: 'Utilization ≥ 35% with higher demand coverage and stronger revenue conversion.',
        dependency: 'Priority customer pipeline, packaging, and service-level commitments.',
        risk_if_delayed: 'Supply continues to outpace monetized demand, keeping solvency and payback under pressure.',
        peer_analog: peerAnalog ? `${peerAnalog} improved resilience by prioritizing higher-quality demand before broadening supply.` : undefined,
      });
      continue;
    }

    if (signature.id.includes('churn-cascade')) {
      recommendations.push({
        id: 'live-rec-churn-cascade',
        priority: signature.severity === 'high' ? 'high' : 'medium',
        owner: 'Operations',
        rationale: `Weekly retention is ${roundTo(retention, 1)}%, and current churn behavior suggests supply quality may erode if operator confidence slips further.`,
        action: 'Deploy retention defenses for productive operators: loyalty weighting, quality-linked rewards, and proactive communication on earnings stability.',
        expected_effect: `Stabilize retention above 92% and reduce panic-churn behavior in stressed weeks.`,
        timeframe: '14-60 days',
        success_metric: 'Weekly retention ≥ 92% with lower churn volatility across trailing windows.',
        dependency: 'Operator segmentation, reward policy tuning, and comms cadence.',
        risk_if_delayed: 'Coverage and service continuity degrade faster than the network can refill quality supply.',
        peer_analog: peerAnalog ? `${peerAnalog} used tenure or quality weighting to reduce mercenary churn pressure.` : undefined,
      });
      continue;
    }

    if (signature.id.includes('tail-fragility')) {
      recommendations.push({
        id: 'live-rec-tail-fragility',
        priority: signature.severity === 'critical' ? 'critical' : 'high',
        owner: 'Strategy',
        rationale: `Tail risk is ${roundTo(tailRisk, 0)}, which means downside paths remain materially worse than the average headline suggests.`,
        action: 'Introduce downside controls: scenario-specific circuit breakers, treasury/risk buffers, and explicit thresholds for intervention before stress deepens.',
        expected_effect: `Reduce tail risk from ${roundTo(tailRisk, 0)} toward the healthy <35 range.`,
        timeframe: '0-45 days',
        success_metric: 'Tail risk score < 35 with fewer insolvency or severe-drawdown weeks under reruns.',
        dependency: 'Governance alignment on intervention thresholds and risk controls.',
        risk_if_delayed: 'A modest average case can hide a severe failure path that arrives too late to contain.',
        peer_analog: peerAnalog ? `${peerAnalog} benefited from tighter risk controls when average metrics hid fragile downside behavior.` : undefined,
      });
      continue;
    }
  }

  if (recommendations.length === 0) {
    return [
      {
        id: 'live-rec-healthy',
        priority: 'low',
        owner: 'Protocol Team',
        rationale: `${options.protocolName} is currently inside healthy guardrails across the primary DTSE metrics.`,
        action: 'Maintain current posture, monitor guardrails, and rerun DTSE after any major tokenomics or demand-side change.',
        expected_effect: 'Preserves current resilience while keeping a reproducible monitoring cadence.',
        timeframe: 'Ongoing',
        success_metric: 'Primary DTSE metrics remain inside healthy bands on the next run.',
      },
    ];
  }

  return recommendations.sort((left, right) => priorityRank[left.priority] - priorityRank[right.priority]);
}
