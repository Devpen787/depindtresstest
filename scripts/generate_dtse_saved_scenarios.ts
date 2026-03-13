import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { PROTOCOL_PROFILES } from '../src/data/protocols';
import { DTSE_PEER_ANALOGS } from '../src/data/dtsePeerAnalogs';
import { DEFAULT_PARAMS } from '../src/model/params';
import { calculateDerivedMetrics, runSimulation } from '../src/model';
import type { AggregateResult, SimulationParams } from '../src/model/types';
import { getProtocolModule } from '../src/protocols/registry';
import { useSimEngine } from '../src/hooks/simulation/useSimEngine';
import { buildLiveDTSEApplicability } from '../src/utils/dtseLiveApplicability';
import { buildLiveDTSEOutputs, buildLiveDTSERunContext } from '../src/utils/dtseLiveOutputs';
import { buildLiveDTSEFailureSignatures } from '../src/utils/dtseLiveSignatures';
import { buildLiveDTSERecommendations } from '../src/utils/dtseLiveRecommendations';
import { buildDTSESequenceView } from '../src/utils/dtseSequenceView';
import { DTSE_STRESS_CHANNEL_OPTIONS, resolveDTSEStressChannelSelection } from '../src/utils/dtseStressChannel';
import { makeDTSESavedScenarioPackKey, type DTSESavedScenarioPack } from '../src/data/dtseSavedScenarios';

const OUTPUT_DIR = path.resolve('src', 'data', 'generated');
const MANIFEST_PATH = path.resolve(OUTPUT_DIR, 'dtseSavedScenarioPacks.manifest.generated.ts');
const LEGACY_OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'dtseSavedScenarioPacks.generated.ts');
const DEFAULT_HORIZON_WEEKS = 52;
const DEFAULT_SIMS = 25;
const DEFAULT_SEED = 42;

interface GeneratedFilePayload {
  generatedAtUtc: string;
  packsByProtocol: Record<string, Record<string, DTSESavedScenarioPack>>;
}

const stableStringify = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const createHash = (value: unknown): string => crypto
  .createHash('sha256')
  .update(JSON.stringify(value))
  .digest('hex');

const engine = useSimEngine();

function buildRuntimeParams(
  profile: (typeof PROTOCOL_PROFILES)[number],
  updates: Partial<SimulationParams>,
): SimulationParams {
  const baseParams: SimulationParams = {
    ...DEFAULT_PARAMS,
    T: DEFAULT_HORIZON_WEEKS,
    nSims: DEFAULT_SIMS,
    seed: DEFAULT_SEED,
  };

  return engine.buildLocalParams(profile, false, { ...baseParams, ...updates }, updates);
}

function buildBaselineParams(
  profile: (typeof PROTOCOL_PROFILES)[number],
  stressedParams: SimulationParams,
): SimulationParams {
  return {
    ...stressedParams,
    scenario: 'baseline',
    macro: 'sideways',
    demandType: profile.parameters.demand_regime.value,
    providerCostPerWeek: profile.parameters.provider_economics.opex_weekly.value,
    competitorYield: 0,
    investorSellPct: 0,
    growthCallEventWeek: 0,
    growthCallEventPct: 0,
  };
}

function runAggregatedSeries(
  profileId: string,
  params: SimulationParams,
): { aggregate: AggregateResult[]; derivedMetrics: ReturnType<typeof calculateDerivedMetrics> } {
  const protocolModule = getProtocolModule<SimulationParams, AggregateResult>(profileId);
  const rawSeries = runSimulation(params);
  const aggregate = engine.mapNewResultsToAggregate(rawSeries);
  const postProcessed = protocolModule.postProcessAggregates
    ? protocolModule.postProcessAggregates(aggregate)
    : aggregate;

  return {
    aggregate: postProcessed,
    derivedMetrics: calculateDerivedMetrics(rawSeries, params),
  };
}

function buildSavedScenarioPack(
  profile: (typeof PROTOCOL_PROFILES)[number],
  stressChannelId: (typeof DTSE_STRESS_CHANNEL_OPTIONS)[number]['id'],
  generatedAtUtc: string,
): DTSESavedScenarioPack {
  const selection = resolveDTSEStressChannelSelection(stressChannelId, profile);
  const stressParams = buildRuntimeParams(profile, selection.updates);
  const baselineParams = buildBaselineParams(profile, stressParams);

  const stressedRun = runAggregatedSeries(profile.metadata.id, stressParams);
  const baselineRun = runAggregatedSeries(profile.metadata.id, baselineParams);

  const outputs = buildLiveDTSEOutputs(stressedRun.aggregate, stressParams, stressedRun.derivedMetrics);
  if (!outputs) {
    throw new Error(`No DTSE outputs generated for ${profile.metadata.id}::${stressChannelId}`);
  }

  const applicability = buildLiveDTSEApplicability(stressedRun.aggregate, stressParams, stressedRun.derivedMetrics);
  if (!applicability) {
    throw new Error(`No DTSE applicability generated for ${profile.metadata.id}::${stressChannelId}`);
  }

  const sequenceView = buildDTSESequenceView(stressedRun.aggregate, baselineRun.aggregate, stressParams);

  const failureSignatures = buildLiveDTSEFailureSignatures(
    stressedRun.aggregate,
    stressParams,
    outputs.outcomes,
    sequenceView,
  );

  const peerNames = DTSE_PEER_ANALOGS[profile.metadata.id]?.peer_ids.map((peerId) => (
    PROTOCOL_PROFILES.find((candidate) => candidate.metadata.id === peerId)?.metadata.name ?? peerId
  ));

  const recommendations = buildLiveDTSERecommendations(failureSignatures, outputs.outcomes, {
    protocolName: profile.metadata.name,
    peerNames,
  });

  const baseRunContext = buildLiveDTSERunContext({
    profileId: profile.metadata.id,
    params: stressParams,
    simulationRunId: 1,
    modelVersion: 'Agent-Based v2',
    outcomes: outputs.outcomes,
    weeklySolvency: outputs.weeklySolvency,
    stressChannel: selection.stressChannel,
    fallbackScenarioGridId: selection.scenarioIdForState,
    failureSignatures,
    recommendations,
  });

  const fingerprint = createHash({
    protocolId: profile.metadata.id,
    stressChannelId,
    outputs: outputs.outcomes,
    applicability,
    failureSignatures,
    recommendations,
    weeklySolvency: outputs.weeklySolvency,
  });

  return {
    runContext: {
      ...baseRunContext,
      scenario_grid_id: `${selection.stressChannel.id}-${profile.metadata.id}-saved-pack`,
      run_id: `dtse-saved-${profile.metadata.id}-${selection.stressChannel.id}`,
      generated_at_utc: generatedAtUtc,
      evidence_status: 'partial',
      bundle_hash: `saved-matrix:${fingerprint}`,
      stress_channel: selection.stressChannel,
      outcomes: outputs.outcomes,
      failure_signatures: failureSignatures,
      recommendations,
    },
    applicability,
    outcomes: outputs.outcomes,
    failureSignatures,
    recommendations,
    sequenceView,
  };
}

function buildSavedScenarioMatrix(): GeneratedFilePayload {
  const generatedAtUtc = new Date().toISOString();
  const packsByProtocol: Record<string, Record<string, DTSESavedScenarioPack>> = {};

  for (const profile of PROTOCOL_PROFILES) {
    packsByProtocol[profile.metadata.id] = {};
    for (const channel of DTSE_STRESS_CHANNEL_OPTIONS) {
      const key = makeDTSESavedScenarioPackKey(profile.metadata.id, channel.id);
      packsByProtocol[profile.metadata.id][key] = buildSavedScenarioPack(profile, channel.id, generatedAtUtc);
    }
  }

  return { generatedAtUtc, packsByProtocol };
}

function writeGeneratedFile(payload: GeneratedFilePayload): void {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const entry of fs.readdirSync(OUTPUT_DIR)) {
    if (entry.startsWith('dtseSavedScenarioPacks.protocol.') && entry.endsWith('.generated.ts')) {
      fs.rmSync(path.resolve(OUTPUT_DIR, entry));
    }
  }
  if (fs.existsSync(LEGACY_OUTPUT_PATH)) {
    fs.rmSync(LEGACY_OUTPUT_PATH);
  }

  const protocolIds = Object.keys(payload.packsByProtocol).sort();
  for (const protocolId of protocolIds) {
    const filePath = path.resolve(
      OUTPUT_DIR,
      `dtseSavedScenarioPacks.protocol.${protocolId}.generated.ts`,
    );
    const fileContents = `/* eslint-disable */\n// Auto-generated by scripts/generate_dtse_saved_scenarios.ts. Do not edit by hand.\nimport type { DTSESavedScenarioPack } from '../dtseSavedScenarios';\n\nexport const DTSE_SAVED_SCENARIO_PACKS_FOR_PROTOCOL: Record<string, DTSESavedScenarioPack> = ${stableStringify(payload.packsByProtocol[protocolId])};\n`;
    fs.writeFileSync(filePath, fileContents, 'utf-8');
  }

  const manifestContents = `/* eslint-disable */\n// Auto-generated by scripts/generate_dtse_saved_scenarios.ts. Do not edit by hand.\n\nexport const DTSE_SAVED_SCENARIO_PACKS_GENERATED_AT = ${JSON.stringify(payload.generatedAtUtc)};\nexport const DTSE_SAVED_SCENARIO_PROTOCOL_IDS = ${stableStringify(protocolIds)};\n`;
  fs.writeFileSync(MANIFEST_PATH, manifestContents, 'utf-8');
}

const payload = buildSavedScenarioMatrix();
writeGeneratedFile(payload);
console.log(`[DTSE] Wrote saved scenario matrix to ${OUTPUT_DIR}`);
