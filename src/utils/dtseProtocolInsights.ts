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

const hasNumber = (value: number | null | undefined): value is number => (
  typeof value === 'number' && Number.isFinite(value)
);

const stripTrailingPeriod = (value: string): string => value.replace(/\.$/, '');

const formatWeek = (week: number): string => `Week ${week}`;

const formatRatio = (value: number): string => `${roundTo(value, 2)}x`;

const formatMonths = (value: number): string => `${roundTo(value, 1)} months`;

const formatPercent = (value: number): string => `${roundTo(value, 1)}%`;

const formatUnitLabel = (value: string): string => value.toLowerCase();

const countLabel = (value: string): string => {
  const normalized = value.trim().replace(/s$/, '');
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)} count`;
};

const surfaceKind = (protocolBrief: DTSEProtocolBrief): 'coverage' | 'compute' | 'storage' | 'vehicle' | 'bandwidth' | 'generic' => {
  const surface = protocolBrief.depin_surface.toLowerCase();
  if (surface.includes('gnss') || surface.includes('wireless') || surface.includes('coverage') || surface.includes('location')) {
    return 'coverage';
  }
  if (surface.includes('gpu') || surface.includes('compute') || surface.includes('cloud') || surface.includes('render')) {
    return 'compute';
  }
  if (surface.includes('storage')) {
    return 'storage';
  }
  if (surface.includes('vehicle') || surface.includes('telemetry')) {
    return 'vehicle';
  }
  if (surface.includes('bandwidth') || surface.includes('routing')) {
    return 'bandwidth';
  }
  return 'generic';
};

const laggingSignalTitle = (protocolBrief: DTSEProtocolBrief): string => {
  switch (surfaceKind(protocolBrief)) {
    case 'coverage':
      return `${countLabel(protocolBrief.active_providers_unit)} can lag the economic break`;
    case 'compute':
      return 'Compute supply can look stable after economics weaken';
    case 'storage':
      return 'Storage participation can lag the stress signal';
    case 'vehicle':
      return 'Vehicle participation can lag monetization stress';
    case 'bandwidth':
      return 'Node count can lag routing-economics deterioration';
    default:
      return 'Physical participation is a lagging signal';
  }
};

const mobilityNarrative = (protocolBrief: DTSEProtocolBrief, verifiedProject?: VerifiedProject): string => {
  if (!verifiedProject) {
    return `${protocolBrief.protocol_name} still needs utilization and retention to be read together, not as separate stories.`;
  }

  const ecosystem = verifiedProject.taxonomy.hardware.ecosystem;
  const spacing = verifiedProject.taxonomy.hardware.spacing;

  if (ecosystem === 'open' && spacing === 'global') {
    return `${protocolBrief.protocol_name} runs on open hardware with low geographic lock-in, so supply can reprice or relocate faster than headline participation suggests.`;
  }

  if (ecosystem === 'open' && spacing === 'required') {
    return `${protocolBrief.protocol_name} uses open hardware, but deployment spacing requirements create surface-level stickiness that can mask weakening economics for a while.`;
  }

  if (ecosystem === 'licensed') {
    return `${protocolBrief.protocol_name} relies on a licensed hardware base, which slows supply expansion but can concentrate fragility when economics deteriorate.`;
  }

  return `${protocolBrief.protocol_name} depends on a relatively closed supply base, so visible exits may lag the underlying economic break.`;
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
  const solvencyBand = metrics.solvency_ratio?.band ?? 'healthy';
  const tailRiskBand = metrics.tail_risk_score?.band ?? 'healthy';
  const retentionBand = metrics.weekly_retention_rate?.band ?? 'healthy';

  const retentionRow = sequenceView?.pathway.find((row) => row.familyId === 'retention_churn');
  const earliestLabel = sequenceView?.earliestTriggerLabel;
  const earliestWeek = sequenceView?.earliestTriggerWeek;
  const retentionWeek = retentionRow?.triggerWeek ?? null;
  const providerUnit = formatUnitLabel(protocolBrief.active_providers_unit);
  const notes = stripTrailingPeriod(protocolBrief.notes);

  if (earliestLabel && hasNumber(earliestWeek)) {
    const lagText = hasNumber(retentionWeek) && retentionWeek > earliestWeek
      ? `${protocolBrief.active_providers_unit} participation does not visibly soften until ${formatWeek(retentionWeek)}.`
      : `${protocolBrief.active_providers_unit} participation remains a later or weaker signal than the initial break.`;
    insights.push({
      id: 'lagging-signal',
      title: laggingSignalTitle(protocolBrief),
      observation: `${protocolBrief.protocol_name} first breaks in ${earliestLabel} at ${formatWeek(earliestWeek)}. ${lagText}`,
      implication: `For ${protocolBrief.protocol_name}, treat utilization, solvency, and provider economics as earlier warning signals than active ${providerUnit}.`,
      trigger: `Earliest break: ${earliestLabel} at ${formatWeek(earliestWeek)}`,
      confidence: 'derived',
      provenance: [
        `Sequence: first break in ${earliestLabel} (${formatWeek(earliestWeek)})`,
        hasNumber(retentionWeek)
          ? `Sequence: retention / churn weakens at ${formatWeek(retentionWeek)}`
          : 'Sequence: retention / churn remains secondary in this run',
        `Protocol brief: active supply measured in ${providerUnit}`,
      ],
    });
  }

  if (protocolBrief.supply_structure === 'Capped') {
    insights.push({
      id: 'capped-supply-tradeoff',
      title: 'Scarcity shifts the shock elsewhere',
      observation: `${protocolBrief.protocol_name} runs a capped supply with ${protocolBrief.burn_fraction_pct}% burn pressure and ${roundTo(protocolBrief.weekly_emissions, 0)} ${protocolBrief.weekly_emissions_unit}. That limits open-ended token inflation, but it pushes more stress onto ${providerUnit} economics when paid demand softens.`,
      implication: `The current DTSE run already shows that tradeoff: solvency is ${formatRatio(solvency)} and payback is ${formatMonths(payback)}. ${notes}.`,
      trigger: 'Use solvency and payback as the primary check on whether capped supply is actually protecting the network.',
      confidence: 'mixed',
      provenance: [
        `Brief: capped supply / ${protocolBrief.mechanism}`,
        `Brief: burn fraction ${protocolBrief.burn_fraction_pct}%`,
        `Outcome: solvency ${formatRatio(solvency)}`,
        `Outcome: payback ${formatMonths(payback)}`,
      ],
    });
  } else if (protocolBrief.mechanism.toLowerCase().includes('burn-and-mint') || signatures['reward-demand-decoupling']) {
    insights.push({
      id: 'demand-linked-balance',
      title: 'Demand quality matters more than headline activity',
      observation: `${protocolBrief.protocol_name} depends on real demand converting into sinks, burns, or work settlement to keep issuance in balance. ${stripTrailingPeriod(protocolBrief.demand_signal)}.`,
      implication: `If demand quality softens before that conversion improves, the network can still look active while the economic base weakens. ${notes}.`,
      trigger: signatures['reward-demand-decoupling']?.trigger_logic,
      confidence: 'mixed',
      provenance: [
        `Brief: ${protocolBrief.mechanism}`,
        `Demand signal: ${stripTrailingPeriod(protocolBrief.demand_signal)}`,
        signatures['reward-demand-decoupling']
          ? `Signature: ${signatures['reward-demand-decoupling'].label}`
          : 'Mechanism: demand-linked balance path',
      ],
    });
  }

  const liquidityPressureActive = Boolean(signatures['liquidity-driven-compression'])
    || tailRiskBand !== 'healthy'
    || solvencyBand !== 'healthy'
    || tailRisk >= 35;

  if (liquidityPressureActive) {
    insights.push({
      id: 'liquidity-exposure',
      title: 'Market stress reaches providers quickly',
      observation: `${protocolBrief.protocol_name} carries a tail-risk score of ${roundTo(tailRisk, 0)} in the current run, indicating that market compression reaches ${providerUnit} economics before physical capacity fully resets.`,
      implication: `A customer-facing pricing shield is not enough if ${providerUnit} still reprice immediately under token stress. ${stripTrailingPeriod(protocolBrief.supply_signal)}.`,
      trigger: signatures['liquidity-driven-compression']?.trigger_logic ?? `Tail risk score: ${roundTo(tailRisk, 0)}`,
      confidence: 'derived',
      provenance: [
        `Outcome: tail risk ${roundTo(tailRisk, 0)}`,
        signatures['liquidity-driven-compression']
          ? `Signature: ${signatures['liquidity-driven-compression'].label}`
          : 'Outcome threshold: tail risk above DTSE watch band',
        `Supply signal: ${stripTrailingPeriod(protocolBrief.supply_signal)}`,
      ],
    });
  }

  const elasticSupplyActive = Boolean(signatures['elastic-provider-exit'])
    || retentionBand !== 'healthy';

  if (elasticSupplyActive && signatures['elastic-provider-exit']) {
    insights.push({
      id: 'elastic-supply',
      title: 'Supply is more mobile than node count suggests',
      observation: `Weekly retention still reads ${formatPercent(retention)}, but the run triggered Elastic Provider Exit. For ${protocolBrief.protocol_name}, ${providerUnit} can leave before internal demand visibly collapses.`,
      implication: `Competitive yield and external alternatives need active monitoring; internal utilization alone will not explain supply risk early enough. ${mobilityNarrative(protocolBrief, verifiedProject)}`,
      trigger: signatures['elastic-provider-exit'].trigger_logic,
      confidence: 'derived',
      provenance: [
        `Signature: ${signatures['elastic-provider-exit'].label}`,
        `Outcome: weekly retention ${formatPercent(retention)}`,
        verifiedProject
          ? `Verified taxonomy: ${verifiedProject.taxonomy.hardware.ecosystem} / ${verifiedProject.taxonomy.hardware.spacing}`
          : `Protocol brief: ${stripTrailingPeriod(protocolBrief.supply_signal)}`,
      ],
    });
  } else if (verifiedProject?.taxonomy.hardware.ecosystem === 'open') {
    insights.push({
      id: 'supply-mobility-profile',
      title: 'Hardware friction shapes how exits appear',
      observation: mobilityNarrative(protocolBrief, verifiedProject),
      implication: `Monitor utilization (${formatPercent(utilization)}) and retention (${formatPercent(retention)}) together rather than reading active ${providerUnit} as a standalone health signal.`,
      confidence: 'mixed',
      provenance: [
        `Verified taxonomy: ${verifiedProject.taxonomy.hardware.ecosystem} / ${verifiedProject.taxonomy.hardware.spacing}`,
        `Outcome: utilization ${formatPercent(utilization)}`,
        `Outcome: weekly retention ${formatPercent(retention)}`,
      ],
    });
  }

  if (verifiedProject?.criticalFlaw) {
    insights.push({
      id: 'documented-constraint',
      title: 'There is a documented structural constraint',
      observation: `Verified protocol research flags a structural constraint for ${protocolBrief.protocol_name}: ${verifiedProject.criticalFlaw}.`,
      implication: `Treat that constraint as part of the DTSE interpretation, especially when comparing peers under matched conditions. Verified project risk is currently marked ${verifiedProject.riskLevel}.`,
      confidence: 'curated',
      provenance: [
        `Verified project: ${verifiedProject.name}`,
        `Verified risk: ${verifiedProject.riskLevel}`,
        `Verified constraint: ${verifiedProject.criticalFlaw}`,
        `Validation method: ${verifiedProject.validation.method.value}`,
      ],
    });
  }

  if (peerNames && peerNames.length > 0) {
    insights.push({
      id: 'comparative-anchor',
      title: 'Interpret this protocol comparatively, not in isolation',
      observation: `${protocolBrief.protocol_name} should be read against comparable peers such as ${peerNames.slice(0, 2).join(' and ')} under the same stress contract, not as a standalone health score.`,
      implication: `Use peers to test whether the fragility comes from ${protocolBrief.mechanism.toLowerCase()} mechanics or from this protocol’s own execution and evidence constraints.`,
      confidence: 'curated',
      provenance: [
        `Peer mapping: ${peerNames.slice(0, 3).join(', ')}`,
        `Brief: ${protocolBrief.mechanism}`,
      ],
    });
  }

  return insights.slice(0, 6);
}
