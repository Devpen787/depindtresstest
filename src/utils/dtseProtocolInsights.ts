import type { ProtocolProfileV1 } from '../data/protocols';
import { getVerifiedProject, type VerifiedProject } from '../data/verifiedProjectData';
import type {
  DTSEFailureSignature,
  DTSEOutcome,
  DTSEProtocolBrief,
  DTSEProtocolInsight,
} from '../types/dtse';
import type { DTSESequenceView } from './dtseSequenceView';
import { sanitizeDTSETriggerText } from './dtsePresentation';

interface BuildDTSEProtocolInsightsOptions {
  profile: ProtocolProfileV1;
  protocolBrief: DTSEProtocolBrief;
  outcomes: DTSEOutcome[];
  failureSignatures: DTSEFailureSignature[];
  sequenceView?: DTSESequenceView | null;
  peerNames?: string[];
}

interface ProfileSpecificInsight {
  title: string;
  observation: string;
  implication: string;
  trigger: string;
  confidence: DTSEProtocolInsight['confidence'];
  provenance: string[];
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
const formatCount = (value: number): string => new Intl.NumberFormat('en-US', {
  notation: value >= 100000 ? 'compact' : 'standard',
  maximumFractionDigits: 1,
}).format(value);

const coerceInsightTrigger = (preferred?: string, fallback?: string): string | undefined => {
  const sanitizedPreferred = sanitizeDTSETriggerText(preferred);
  if (sanitizedPreferred) return sanitizedPreferred;
  return sanitizeDTSETriggerText(fallback) ?? fallback;
};

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

const PROFILE_SPECIFIC_INSIGHTS: Record<string, ProfileSpecificInsight> = {
  ono_v3_calibrated: {
    title: 'Coverage density and reward discipline move together',
    observation: 'Onocoy depends on high-quality GNSS coverage density. Emissions can look stable while local station economics weaken in softer demand pockets.',
    implication: 'Review utilization, payback, and reward discipline together before using station count as proof of resilience.',
    trigger: 'Prioritize review when utilization and payback deteriorate at the same time.',
    confidence: 'mixed',
    provenance: [
      'Profile context: GNSS correction surface',
      'Mechanism context: fixed emissions with partial burn',
    ],
  },
  helium_bme_v1: {
    title: 'Traffic conversion is the core resilience hinge',
    observation: 'Helium’s burn-and-mint loop depends on real service traffic converting into demand-side sinks quickly enough to offset issuance.',
    implication: 'Read utilization, burn-linked demand, and solvency as one contract; headline hotspot count is secondary.',
    trigger: 'Escalate when utilization weakens while solvency drifts toward watchlist.',
    confidence: 'mixed',
    provenance: [
      'Profile context: wireless location-based network',
      'Mechanism context: burn-and-mint equilibrium',
    ],
  },
  adaptive_elastic_v1: {
    title: 'Elastic GPU supply can overshoot durable demand',
    observation: 'Render’s supply adjusts quickly, so reward pressure can persist even when paid workload quality softens.',
    implication: 'Use payback and retention as early checks for whether supply elasticity is helping or amplifying stress.',
    trigger: 'Escalate when payback extends while retention enters watchlist.',
    confidence: 'mixed',
    provenance: [
      'Profile context: distributed GPU compute',
      'Mechanism context: burn-and-mint plus work rewards',
    ],
  },
  filecoin_v1: {
    title: 'Collateral protects quality but can delay adaptation',
    observation: 'Filecoin’s collateral-heavy structure improves commitment quality but can slow healthy rebalancing during stress windows.',
    implication: 'Interpret retention with payback and utilization to distinguish durable commitment from trapped economics.',
    trigger: 'Escalate when payback stretches while utilization softens.',
    confidence: 'mixed',
    provenance: [
      'Profile context: proof-of-storage network',
      'Mechanism context: collateralized provider participation',
    ],
  },
  akash_v1: {
    title: 'Capacity health depends on buyer consistency',
    observation: 'Akash capacity can remain visibly available while revenue quality shifts across workloads and price bands.',
    implication: 'Prioritize utilization and solvency progression over raw provider counts when evaluating durability.',
    trigger: 'Escalate when utilization and solvency trend down together.',
    confidence: 'mixed',
    provenance: [
      'Profile context: open compute marketplace',
      'Mechanism context: market-priced workload allocation',
    ],
  },
  hivemapper_v1: {
    title: 'Map freshness economics drive long-run retention',
    observation: 'Hivemapper’s provider behavior hinges on whether reward emissions keep pace with genuine map-demand value.',
    implication: 'Interpret retention and utilization together; strong contributor activity without demand conversion can hide fragility.',
    trigger: 'Escalate when retention softens while utilization remains below healthy.',
    confidence: 'mixed',
    provenance: [
      'Profile context: drive-to-earn mapping network',
      'Mechanism context: emissions-linked contribution rewards',
    ],
  },
  dimo_v1: {
    title: 'Vehicle participation quality matters more than volume',
    observation: 'DIMO can maintain visible participant counts even when monetizable telemetry quality compresses under stress.',
    implication: 'Use solvency, utilization, and retention sequencing to separate durable demand from participation inertia.',
    trigger: 'Escalate when solvency and utilization deteriorate before retention reacts.',
    confidence: 'mixed',
    provenance: [
      'Profile context: vehicle data network',
      'Mechanism context: tokenized participation incentives',
    ],
  },
  grass_v1: {
    title: 'Low switching cost increases exit elasticity',
    observation: 'Grass relies on low-friction bandwidth supply, which can reprice or churn quickly when external yields improve.',
    implication: 'Treat retention and tail-risk shifts as first-class early warnings, not secondary metrics.',
    trigger: 'Escalate when retention and tail risk both move toward watchlist.',
    confidence: 'mixed',
    provenance: [
      'Profile context: bandwidth sharing surface',
      'Mechanism context: low-capex provider base',
    ],
  },
  ionet_v1: {
    title: 'Heterogeneous GPU supply raises quality variance risk',
    observation: 'io.net aggregates mixed GPU tiers, so usable capacity can deviate from headline supply under stressed incentives.',
    implication: 'Read utilization with solvency and payback to confirm that available hardware is economically durable.',
    trigger: 'Escalate when utilization weakens while payback lengthens.',
    confidence: 'mixed',
    provenance: [
      'Profile context: heterogeneous GPU marketplace',
      'Mechanism context: device-tiered reward structure',
    ],
  },
  nosana_v1: {
    title: 'Job continuity, not node count, defines resilience',
    observation: 'Nosana’s operational risk appears first in workload continuity and reward durability, not in raw node visibility.',
    implication: 'Use retention and utilization drift to detect emerging fragility before supply visibly contracts.',
    trigger: 'Escalate when utilization and retention both slip from healthy bands.',
    confidence: 'mixed',
    provenance: [
      'Profile context: decentralized AI compute jobs',
      'Mechanism context: reward-linked job execution',
    ],
  },
  geodnet_v1: {
    title: 'Regional saturation can mask network fragility',
    observation: 'Geodnet’s location-based rewards can look robust in aggregate while marginal regional ROI deteriorates.',
    implication: 'Pair utilization and payback with density-aware interpretation to avoid false confidence from aggregate node growth.',
    trigger: 'Escalate when payback worsens in parallel with soft utilization.',
    confidence: 'mixed',
    provenance: [
      'Profile context: GNSS correction network',
      'Mechanism context: location-conditioned rewards',
    ],
  },
  aleph_v1: {
    title: 'Service-mix balance determines stress absorption',
    observation: 'Aleph’s multi-service surface can hide weak segments if aggregate demand appears stable.',
    implication: 'Use solvency and tail risk to check whether aggregate stability is masking concentration risk.',
    trigger: 'Escalate when tail risk rises despite stable top-line utilization.',
    confidence: 'mixed',
    provenance: [
      'Profile context: decentralized cloud/storage mix',
      'Mechanism context: multi-surface token utility',
    ],
  },
  xnet_v1: {
    title: 'Coverage economics can degrade before visible exits',
    observation: 'XNET’s wireless deployment economics can weaken under stress before node-level participation visibly drops.',
    implication: 'Use solvency, utilization, and retention sequence timing to detect stress early rather than waiting for node contraction.',
    trigger: 'Escalate when solvency and utilization breach watchlist ahead of retention changes.',
    confidence: 'mixed',
    provenance: [
      'Profile context: wireless infrastructure network',
      'Mechanism context: infrastructure-heavy deployment economics',
    ],
  },
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
  const profileSpecificInsight = PROFILE_SPECIFIC_INSIGHTS[profile.metadata.id];

  if (profileSpecificInsight) {
    insights.push({
      id: `profile-context-${profile.metadata.id}`,
      title: profileSpecificInsight.title,
      observation: profileSpecificInsight.observation,
      implication: profileSpecificInsight.implication,
      trigger: profileSpecificInsight.trigger,
      confidence: profileSpecificInsight.confidence,
      provenance: [
        ...profileSpecificInsight.provenance,
        `Protocol context: ${protocolBrief.protocol_name}`,
      ],
    });
  }

  if (earliestLabel && hasNumber(earliestWeek)) {
    const lagText = hasNumber(retentionWeek) && retentionWeek > earliestWeek
      ? `Visible ${providerUnit} softness does not appear until ${formatWeek(retentionWeek)}.`
      : `Visible ${providerUnit} participation remains a later or weaker signal than the initial break.`;
    insights.push({
      id: 'lagging-signal',
      title: laggingSignalTitle(protocolBrief),
      observation: `${protocolBrief.protocol_name} first breaks in ${earliestLabel} at ${formatWeek(earliestWeek)}. ${lagText}`,
      implication: `For ${protocolBrief.protocol_name}, treat utilization, solvency, and provider economics as earlier warning signals than visible ${providerUnit} participation.`,
      trigger: `Earliest break: ${earliestLabel} at ${formatWeek(earliestWeek)}`,
      confidence: 'derived',
      provenance: [
        `Current run sequence: first break in ${earliestLabel} (${formatWeek(earliestWeek)})`,
        hasNumber(retentionWeek)
          ? `Current run sequence: retention / churn weakens at ${formatWeek(retentionWeek)}`
          : 'Current run sequence: retention / churn remains secondary in this run',
        `Protocol setup: active supply measured in ${providerUnit}`,
      ],
    });
  }

  if (protocolBrief.supply_structure === 'Capped') {
    insights.push({
      id: 'capped-supply-tradeoff',
      title: 'Scarcity shifts the shock elsewhere',
      observation: `${protocolBrief.protocol_name} runs a capped supply with ${protocolBrief.burn_fraction_pct}% burn pressure and ${formatCount(protocolBrief.weekly_emissions)} ${protocolBrief.weekly_emissions_unit}. That limits open-ended token inflation, but it pushes more stress onto ${providerUnit} economics when paid demand softens.`,
      implication: `This run already shows that tradeoff: solvency is ${formatRatio(solvency)} and payback is ${formatMonths(payback)}. ${notes}.`,
      trigger: 'Use solvency and payback as the primary check on whether capped supply is actually protecting the network.',
      confidence: 'mixed',
      provenance: [
        `Protocol setup: capped supply / ${protocolBrief.mechanism}`,
        `Protocol setup: burn fraction ${protocolBrief.burn_fraction_pct}%`,
        `Current run: solvency ${formatRatio(solvency)}`,
        `Current run: payback ${formatMonths(payback)}`,
      ],
    });
  } else if (protocolBrief.mechanism.toLowerCase().includes('burn-and-mint') || signatures['reward-demand-decoupling']) {
    insights.push({
      id: 'demand-linked-balance',
      title: 'Demand quality matters more than headline activity',
      observation: `${protocolBrief.protocol_name} depends on real demand converting into sinks, burns, or work settlement to keep issuance in balance. ${stripTrailingPeriod(protocolBrief.demand_signal)}.`,
      implication: `If demand quality softens before that conversion improves, the network can still look active while the economic base weakens. ${notes}.`,
      trigger: coerceInsightTrigger(
        signatures['reward-demand-decoupling']?.trigger_logic,
        'Protocol balance depends on real demand converting into sinks or work settlement.',
      ),
      confidence: 'mixed',
      provenance: [
        `Protocol setup: ${protocolBrief.mechanism}`,
        `Demand signal: ${stripTrailingPeriod(protocolBrief.demand_signal)}`,
        signatures['reward-demand-decoupling']
          ? `Failure pattern: ${signatures['reward-demand-decoupling'].label}`
          : 'Protocol mechanism: demand-linked balance path',
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
      observation: `${protocolBrief.protocol_name} carries a tail-risk score of ${roundTo(tailRisk, 0)} in this run. Market compression is reaching ${providerUnit} economics before physical capacity fully resets.`,
      implication: `A customer-facing pricing shield is not enough if ${providerUnit} still reprice quickly under token stress. ${stripTrailingPeriod(protocolBrief.supply_signal)}.`,
      trigger: coerceInsightTrigger(
        signatures['liquidity-driven-compression']?.trigger_logic,
        `Tail risk score: ${roundTo(tailRisk, 0)}`,
      ),
      confidence: 'derived',
      provenance: [
        `Current run: tail risk ${roundTo(tailRisk, 0)}`,
        signatures['liquidity-driven-compression']
          ? `Failure pattern: ${signatures['liquidity-driven-compression'].label}`
          : 'Current run threshold: tail risk above DTSE watch band',
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
      implication: `Competitive yield and external alternatives need active monitoring. Internal utilization alone will not explain supply risk early enough. ${mobilityNarrative(protocolBrief, verifiedProject)}`,
      trigger: coerceInsightTrigger(
        signatures['elastic-provider-exit'].trigger_logic,
        'Supply exits can appear after economics weaken, not before.',
      ),
      confidence: 'derived',
      provenance: [
        `Failure pattern: ${signatures['elastic-provider-exit'].label}`,
        `Current run: weekly retention ${formatPercent(retention)}`,
        verifiedProject
          ? `Verified protocol context: ${verifiedProject.taxonomy.hardware.ecosystem} hardware / ${verifiedProject.taxonomy.hardware.spacing} deployment`
          : `Protocol setup: ${stripTrailingPeriod(protocolBrief.supply_signal)}`,
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
        `Verified protocol context: ${verifiedProject.taxonomy.hardware.ecosystem} hardware / ${verifiedProject.taxonomy.hardware.spacing} deployment`,
        `Current run: utilization ${formatPercent(utilization)}`,
        `Current run: weekly retention ${formatPercent(retention)}`,
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
        `Verified protocol context: ${verifiedProject.name}`,
        `Verified risk note: ${verifiedProject.riskLevel}`,
        `Verified constraint: ${verifiedProject.criticalFlaw}`,
        `Verification basis: ${verifiedProject.validation.method.value}`,
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
        `Peer comparison set: ${peerNames.slice(0, 3).join(', ')}`,
        `Protocol setup: ${protocolBrief.mechanism}`,
      ],
    });
  }

  return insights.slice(0, 6);
}
