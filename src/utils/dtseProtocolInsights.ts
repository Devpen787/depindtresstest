import type { ProtocolProfileV1 } from '../data/protocols';
import { getVerifiedProject, type VerifiedProject } from '../data/verifiedProjectData';
import type {
  DTSEFailureSignature,
  DTSEOutcome,
  DTSEProtocolBrief,
  DTSEProtocolInsight,
} from '../types/dtse';
import type { DTSESequenceView } from './dtseSequenceView';

interface BuildDTSEProtocolInsightsOptions {
  profile: ProtocolProfileV1;
  protocolBrief: DTSEProtocolBrief;
  outcomes: DTSEOutcome[];
  failureSignatures: DTSEFailureSignature[];
  sequenceView?: DTSESequenceView | null;
  peerNames?: string[];
}

const roundTo = (value: number, digits = 1): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const VERIFIED_PROJECT_ID_BY_PROFILE: Record<string, string> = {
  ono_v3_calibrated: 'onocoy',
  helium_bme_v1: 'helium_legacy',
  adaptive_elastic_v1: 'render',
  hivemapper_v1: 'hivemapper',
  ionet_v1: 'ionet',
  geodnet_v1: 'geodnet',
  grass_v1: 'grass',
  dimo_v1: 'dimo',
  nosana_v1: 'nosana',
};

const outcomeByMetric = (outcomes: DTSEOutcome[]): Record<string, DTSEOutcome> => (
  outcomes.reduce<Record<string, DTSEOutcome>>((acc, outcome) => {
    acc[outcome.metric_id] = outcome;
    return acc;
  }, {})
);

const signatureById = (signatures: DTSEFailureSignature[]): Record<string, DTSEFailureSignature> => (
  signatures.reduce<Record<string, DTSEFailureSignature>>((acc, signature) => {
    acc[signature.id] = signature;
    return acc;
  }, {})
);

const getVerifiedProjectForProfile = (profileId: string): VerifiedProject | undefined => {
  const verifiedId = VERIFIED_PROJECT_ID_BY_PROFILE[profileId];
  return verifiedId ? getVerifiedProject(verifiedId) : undefined;
};

export function buildDTSEProtocolInsights({
  profile,
  protocolBrief,
  outcomes,
  failureSignatures,
  sequenceView,
  peerNames,
}: BuildDTSEProtocolInsightsOptions): DTSEProtocolInsight[] {
  const insights: DTSEProtocolInsight[] = [];
  const metrics = outcomeByMetric(outcomes);
  const signatures = signatureById(failureSignatures);
  const verifiedProject = getVerifiedProjectForProfile(profile.metadata.id);

  const utilization = metrics.network_utilization?.value ?? 0;
  const solvency = metrics.solvency_ratio?.value ?? 0;
  const payback = metrics.payback_period?.value ?? 0;
  const retention = metrics.weekly_retention_rate?.value ?? 0;
  const tailRisk = metrics.tail_risk_score?.value ?? 0;

  const retentionRow = sequenceView?.pathway.find((row) => row.familyId === 'retention_churn');
  const earliestLabel = sequenceView?.earliestTriggerLabel;
  const earliestWeek = sequenceView?.earliestTriggerWeek;
  const retentionWeek = retentionRow?.triggerWeek ?? null;

  if (earliestLabel && earliestWeek) {
    const lagText = retentionWeek && retentionWeek > earliestWeek
      ? `Retention does not visibly break until Week ${retentionWeek}.`
      : 'Retention remains a later or weaker signal than the initial break.';
    insights.push({
      id: 'lagging-signal',
      title: 'Physical participation is a lagging signal',
      observation: `The first material break appears in ${earliestLabel} at Week ${earliestWeek}. ${lagText}`,
      implication: 'Do not wait for node count or headline participation to fall before treating the stress path as active.',
      trigger: `Earliest trigger: ${earliestLabel}${earliestWeek ? ` (Week ${earliestWeek})` : ''}`,
      confidence: 'derived',
      provenance: ['DTSE sequence view', 'matched baseline comparison'],
    });
  }

  if (protocolBrief.supply_structure === 'Capped') {
    insights.push({
      id: 'capped-supply-tradeoff',
      title: 'Scarcity shifts the shock elsewhere',
      observation: `${protocolBrief.protocol_name} uses a capped supply structure, so the system cannot absorb stress through open-ended token expansion.`,
      implication: `When stress hits, the pressure tends to land faster on provider margins, payback, or retention. Solvency is currently ${roundTo(solvency, 2)}x and payback is ${roundTo(payback, 1)} months.`,
      trigger: 'Watch solvency and payback before relying on supply scarcity as a resilience story.',
      confidence: 'mixed',
      provenance: ['Protocol tokenomics brief', 'DTSE outcomes'],
    });
  } else if (protocolBrief.mechanism.toLowerCase().includes('burn-and-mint') || signatures['reward-demand-decoupling']) {
    insights.push({
      id: 'demand-linked-balance',
      title: 'Demand quality matters more than headline activity',
      observation: `${protocolBrief.protocol_name} relies on demand-linked sinks or work-linked burns to keep issuance in balance.`,
      implication: 'If demand quality softens before the sink side responds, the network can still look busy while the economic base weakens.',
      trigger: signatures['reward-demand-decoupling']?.trigger_logic,
      confidence: 'mixed',
      provenance: ['Protocol mechanism', 'Failure-signature mapping'],
    });
  }

  if (signatures['liquidity-driven-compression'] || tailRisk >= 35) {
    insights.push({
      id: 'liquidity-exposure',
      title: 'Market stress reaches providers quickly',
      observation: `Tail risk is ${roundTo(tailRisk, 0)} and the current run indicates that market compression can damage operator economics before physical capacity visibly shrinks.`,
      implication: 'A customer-facing pricing shield is not enough if provider economics still reprice immediately under token stress.',
      trigger: signatures['liquidity-driven-compression']?.trigger_logic ?? `Tail risk score: ${roundTo(tailRisk, 0)}`,
      confidence: 'derived',
      provenance: ['DTSE outcomes', 'Failure-signature mapping'],
    });
  }

  if (signatures['elastic-provider-exit']) {
    insights.push({
      id: 'elastic-supply',
      title: 'Supply is more mobile than node count suggests',
      observation: `Weekly retention is ${roundTo(retention, 1)}% and the run triggered Elastic Provider Exit, which means providers can leave before internal demand visibly collapses.`,
      implication: 'Competitive yield and external alternatives need active monitoring; internal utilization alone will not explain supply risk early enough.',
      trigger: signatures['elastic-provider-exit'].trigger_logic,
      confidence: 'derived',
      provenance: ['DTSE outcomes', 'Failure-signature mapping'],
    });
  } else if (verifiedProject?.taxonomy.hardware.ecosystem === 'open') {
    const mobilityQualifier = verifiedProject.taxonomy.hardware.spacing === 'global'
      ? 'highly portable'
      : 'constrained by deployment friction, but still economically mobile';
    insights.push({
      id: 'supply-mobility-profile',
      title: 'Hardware friction shapes how exits appear',
      observation: `${protocolBrief.protocol_name} relies on an ${mobilityQualifier} supply base, so physical persistence can hide weakening economics for a while.`,
      implication: `Monitor utilization (${roundTo(utilization, 1)}%) and retention (${roundTo(retention, 1)}%) together rather than reading active supply as a standalone health signal.`,
      confidence: 'mixed',
      provenance: ['Verified project taxonomy', 'DTSE outcomes'],
    });
  }

  if (verifiedProject?.criticalFlaw) {
    insights.push({
      id: 'documented-constraint',
      title: 'There is a documented structural constraint',
      observation: `${protocolBrief.protocol_name} carries a verified constraint: ${verifiedProject.criticalFlaw}.`,
      implication: `Treat that constraint as part of the stress interpretation, especially when comparing against peers under matched conditions. Current verification risk level is ${verifiedProject.riskLevel}.`,
      confidence: 'curated',
      provenance: ['Verified project data'],
    });
  }

  if (peerNames && peerNames.length > 0) {
    insights.push({
      id: 'comparative-anchor',
      title: 'Interpret this protocol comparatively, not in isolation',
      observation: `${protocolBrief.protocol_name} is best read against comparable peers such as ${peerNames.slice(0, 2).join(' and ')} under the same stress contract.`,
      implication: 'Use peers to test whether the fragility is structural to the mechanism or specific to this protocol’s assumptions and execution.',
      confidence: 'curated',
      provenance: ['Peer analog mapping'],
    });
  }

  return insights.slice(0, 6);
}
