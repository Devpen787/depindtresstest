import fs from 'node:fs';
import path from 'node:path';

import { GENERATED_PROTOCOL_PROFILES } from '../src/data/generated/protocolProfiles.generated';
import { getProtocolRuntimeCalibration } from '../src/data/protocolRuntimeCalibrations';
import { runSimulation } from '../src/model/simulation';
import type { AggregateResult, SimulationParams } from '../src/model/types';
import { evaluateAllQuestions } from '../src/audit/acceptance/answerEngine';
import { ACCEPTANCE_QUESTION_IDS, QUESTION_REGISTRY } from '../src/audit/acceptance/questionRegistry';

type Mode = 'quick' | 'full';

interface CliOptions {
  profileId: string;
  mode: Mode;
  outputDir: string;
  asOfDate?: string;
  competitorYield: number;
  baselineCompetitorYield: number;
  enableOperationalPromotion: boolean;
  operationalPromotionConfidenceThreshold: number;
}

interface ProtocolProfileV1 {
  metadata: {
    id: string;
    name: string;
  };
  parameters: {
    supply: { value: number };
    emissions: { value: number };
    burn_fraction: { value: number };
    adjustment_lag: { value: number };
    demand_regime: { value: SimulationParams['demandType'] };
    provider_economics: {
      opex_weekly: { value: number };
      churn_threshold: { value: number };
    };
    initial_active_providers: { value: number };
    initial_price: { value: number };
    hardware_cost: { value: number };
    pro_tier_pct?: { value: number };
  };
}

interface AcceptanceRow {
  id: string;
  section: string;
  stakeholder: string;
  question: string;
  answerable_now: 'Y' | 'P' | 'N';
  answerable_now_raw: 'Y' | 'P' | 'N';
  answerability_promotion: string;
  dashboard_location: string;
  metric_used: string;
  time_window: string;
  how_derived: string;
  owner: string;
  gap_note: string;
  verdict: string;
  confidence: string;
  reproducible: string;
}

interface CoverageRow {
  section: string;
  questions: number;
  Y: number;
  P: number;
  N: number;
  direct_coverage_pct: string;
  practical_coverage_pct: string;
  pass_80_practical: 'PASS' | 'FAIL';
}

interface CoverageAccumulator {
  questions: number;
  y: number;
  p: number;
  n: number;
}

const PROTOCOL_PROFILES = GENERATED_PROTOCOL_PROFILES as ProtocolProfileV1[];
function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    profileId: process.env.ACCEPTANCE_PROFILE || 'ono_v3_calibrated',
    mode: (process.env.ACCEPTANCE_MODE as Mode) || 'quick',
    outputDir: process.env.ACCEPTANCE_OUTPUT_DIR || path.join(process.cwd(), 'output', 'spreadsheet'),
    asOfDate: process.env.ACCEPTANCE_AS_OF_DATE,
    competitorYield: parseNumber(process.env.ACCEPTANCE_COMPETITOR_YIELD, 0.5),
    baselineCompetitorYield: parseNumber(process.env.ACCEPTANCE_BASELINE_COMPETITOR_YIELD, 0),
    enableOperationalPromotion:
      process.env.ACCEPTANCE_ENABLE_OPERATIONAL_PROMOTION !== '0',
    operationalPromotionConfidenceThreshold: parseNumber(
      process.env.ACCEPTANCE_OPERATIONAL_CONFIDENCE_THRESHOLD,
      0.79
    ),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--profile') {
      options.profileId = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--mode') {
      const mode = argv[i + 1];
      if (mode !== 'quick' && mode !== 'full') {
        throw new Error(`Invalid --mode value: ${mode}`);
      }
      options.mode = mode;
      i += 1;
      continue;
    }
    if (arg === '--output-dir') {
      options.outputDir = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--as-of-date') {
      options.asOfDate = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--competitor-yield') {
      options.competitorYield = parseNumber(argv[i + 1], options.competitorYield);
      i += 1;
      continue;
    }
    if (arg === '--baseline-competitor-yield') {
      options.baselineCompetitorYield = parseNumber(argv[i + 1], options.baselineCompetitorYield);
      i += 1;
      continue;
    }
    if (arg === '--strict') {
      options.enableOperationalPromotion = false;
      continue;
    }
    if (arg === '--operational-promotion-threshold') {
      options.operationalPromotionConfidenceThreshold = parseNumber(
        argv[i + 1],
        options.operationalPromotionConfidenceThreshold
      );
      i += 1;
      continue;
    }
  }

  return options;
}

function resolveProfile(profileId: string): ProtocolProfileV1 {
  const profile = PROTOCOL_PROFILES.find((candidate) => candidate.metadata.id === profileId);
  if (!profile) {
    const available = PROTOCOL_PROFILES.map((candidate) => candidate.metadata.id).join(', ');
    throw new Error(`Profile "${profileId}" not found. Available profile IDs: ${available}`);
  }
  return profile;
}

function buildSimulationParams(profile: ProtocolProfileV1, mode: Mode, competitorYield: number): SimulationParams {
  const nSims = mode === 'quick' ? 8 : 25;
  const horizon = mode === 'quick' ? 26 : 52;
  const runtimeCalibration = getProtocolRuntimeCalibration(profile.metadata.id);
  const baseDemand = Math.max(
    12_000,
    Math.round(profile.parameters.initial_active_providers.value * 180 * 0.65)
  );

  return {
    T: horizon,
    initialSupply: profile.parameters.supply.value,
    initialPrice: Math.max(0.01, profile.parameters.initial_price.value),
    maxMintWeekly: profile.parameters.emissions.value,
    burnPct: profile.parameters.burn_fraction.value,
    initialLiquidity: 500_000,
    investorUnlockWeek: 26,
    investorSellPct: 0.05,
    scenario: 'baseline',
    demandType: profile.parameters.demand_regime.value,
    baseDemand,
    demandVolatility: 0.05,
    macro: 'sideways',
    initialProviders: profile.parameters.initial_active_providers.value,
    baseCapacityPerProvider: 180,
    capacityStdDev: 0.2,
    providerCostPerWeek: profile.parameters.provider_economics.opex_weekly.value,
    costStdDev: 0.15,
    hardwareLeadTime: 2,
    churnThreshold: profile.parameters.provider_economics.churn_threshold.value,
    profitThresholdToJoin: 15,
    maxProviderGrowthRate: 0.15,
    maxProviderChurnRate: 0.1,
    kBuyPressure: runtimeCalibration.kBuyPressure ?? 0.08,
    kSellPressure: runtimeCalibration.kSellPressure ?? 0.12,
    kDemandPrice: runtimeCalibration.kDemandPrice ?? 0.15,
    kMintPrice: runtimeCalibration.kMintPrice ?? 0.35,
    baseServicePrice: runtimeCalibration.baseServicePrice ?? 0.5,
    servicePriceElasticity: runtimeCalibration.servicePriceElasticity ?? 0.6,
    minServicePrice: 0.05,
    maxServicePrice: 5,
    rewardLagWeeks: profile.parameters.adjustment_lag.value,
    nSims,
    seed: 42,
    competitorYield,
    emissionModel: 'fixed',
    revenueStrategy: 'burn',
    hardwareCost: profile.parameters.hardware_cost.value,
    proTierPct: profile.parameters.pro_tier_pct?.value || 0,
    proTierEfficiency: 1.5,
    sybilAttackEnabled: false,
    sybilSize: 0,
  };
}

function normalizeSection(section: string): string {
  if (section === 'M Onocoy Inputs') {
    return 'I Onocoy Inputs';
  }
  return section;
}

function formatPct(value: number): string {
  return value.toFixed(1);
}

function toDateTag(isoDateString: string): string {
  return isoDateString.slice(0, 10);
}

function sanitizeTsvValue(value: unknown): string {
  return String(value ?? '')
    .replace(/\t/g, ' ')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function writeTsv<T extends Record<string, unknown>>(filePath: string, rows: T[], header: string[]): void {
  const lines = [header.join('\t')];
  for (const row of rows) {
    lines.push(header.map((column) => sanitizeTsvValue(row[column])).join('\t'));
  }
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf-8');
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function promoteAnswerability(
  rawAnswerability: 'Y' | 'P' | 'N',
  reproducible: boolean,
  confidence: number,
  verdict: string,
  options: CliOptions
): { answerability: 'Y' | 'P' | 'N'; promotionReason: string } {
  if (!options.enableOperationalPromotion) {
    return {
      answerability: rawAnswerability,
      promotionReason: 'operational_promotion_disabled',
    };
  }
  if (
    rawAnswerability === 'P' &&
    reproducible &&
    verdict !== 'insufficient_data' &&
    confidence >= options.operationalPromotionConfidenceThreshold
  ) {
    return {
      answerability: 'Y',
      promotionReason: `promoted_from_P_confidence>=${options.operationalPromotionConfidenceThreshold.toFixed(2)}_reproducible`,
    };
  }
  return {
    answerability: rawAnswerability,
    promotionReason: rawAnswerability === 'P' ? 'remains_P' : 'not_applicable',
  };
}

function buildCoverageRows(rows: AcceptanceRow[]): CoverageRow[] {
  const bySection = new Map<string, CoverageAccumulator>();

  for (const row of rows) {
    const key = normalizeSection(row.section);
    const existing = bySection.get(key) || { questions: 0, y: 0, p: 0, n: 0 };
    existing.questions += 1;
    if (row.answerable_now === 'Y') {
      existing.y += 1;
    } else if (row.answerable_now === 'P') {
      existing.p += 1;
    } else {
      existing.n += 1;
    }
    bySection.set(key, existing);
  }

  return Array.from(bySection.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([section, acc]) => {
      const directCoveragePct = acc.questions > 0 ? (acc.y / acc.questions) * 100 : 0;
      const practicalCoveragePct = acc.questions > 0 ? ((acc.y + 0.5 * acc.p) / acc.questions) * 100 : 0;
      return {
        section,
        questions: acc.questions,
        Y: acc.y,
        P: acc.p,
        N: acc.n,
        direct_coverage_pct: formatPct(directCoveragePct),
        practical_coverage_pct: formatPct(practicalCoveragePct),
        pass_80_practical: practicalCoveragePct >= 80 ? 'PASS' : 'FAIL',
      };
    });
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const profile = resolveProfile(options.profileId);
  const currentParams = buildSimulationParams(profile, options.mode, options.competitorYield);
  const baselineParams: SimulationParams = {
    ...currentParams,
    competitorYield: options.baselineCompetitorYield,
    investorSellPct: 0.01,
  };

  const aggregated = runSimulation(currentParams);
  const baselineAggregated = runSimulation(baselineParams);
  const answers = evaluateAllQuestions({
    runId: `acceptance-${profile.metadata.id}-${options.mode}`,
    params: currentParams,
    aggregated: aggregated as AggregateResult[],
    baselineAggregated: baselineAggregated as AggregateResult[],
  });

  const answerById = new Map(answers.map((answer) => [answer.questionId, answer]));
  const rows: AcceptanceRow[] = ACCEPTANCE_QUESTION_IDS.map((questionId) => {
    const definition = QUESTION_REGISTRY[questionId];
    const answer = answerById.get(questionId);
    if (!definition || !answer) {
      throw new Error(`Acceptance data missing for question ID ${questionId}`);
    }

    const promoted = promoteAnswerability(
      answer.answerability,
      answer.reproducible,
      answer.confidence,
      answer.verdict,
      options
    );

    return {
      id: questionId,
      section: definition.section,
      stakeholder: definition.stakeholder,
      question: definition.prompt,
      answerable_now: promoted.answerability,
      answerable_now_raw: answer.answerability,
      answerability_promotion: promoted.promotionReason,
      dashboard_location: answer.evidence.map((evidence) => evidence.ref).join('; '),
      metric_used: answer.metrics.map((metric) => metric.id).join('; '),
      time_window: answer.window,
      how_derived: answer.summary,
      owner: 'AutoEvaluator',
      gap_note: answer.answerability === 'Y' ? 'None' : answer.summary,
      verdict: answer.verdict,
      confidence: answer.confidence.toFixed(2),
      reproducible: answer.reproducible ? 'true' : 'false',
    };
  });

  const coverageRows = buildCoverageRows(rows);

  const missingRows = rows.filter((row) => row.answerable_now !== 'Y');

  const generatedAt = new Date().toISOString();
  const dateTag = options.asOfDate || toDateTag(generatedAt);

  ensureDir(options.outputDir);

  const answersDatedPath = path.join(
    options.outputDir,
    `dashboard_acceptance_answers_snapshot_${dateTag}.tsv`
  );
  const summaryDatedPath = path.join(
    options.outputDir,
    `dashboard_acceptance_coverage_summary_${dateTag}.tsv`
  );
  const missingDatedPath = path.join(
    options.outputDir,
    `dashboard_acceptance_missing_${dateTag}.tsv`
  );

  writeTsv(answersDatedPath, rows, [
    'id',
    'section',
    'stakeholder',
    'question',
    'answerable_now',
    'answerable_now_raw',
    'answerability_promotion',
    'dashboard_location',
    'metric_used',
    'time_window',
    'how_derived',
    'owner',
    'gap_note',
    'verdict',
    'confidence',
    'reproducible',
  ]);
  writeTsv(summaryDatedPath, coverageRows, [
    'section',
    'questions',
    'Y',
    'P',
    'N',
    'direct_coverage_pct',
    'practical_coverage_pct',
    'pass_80_practical',
  ]);
  writeTsv(missingDatedPath, missingRows, [
    'id',
    'section',
    'stakeholder',
    'question',
    'answerable_now',
    'dashboard_location',
    'metric_used',
    'time_window',
    'how_derived',
    'owner',
    'gap_note',
    'verdict',
    'confidence',
    'reproducible',
  ]);

  fs.copyFileSync(
    answersDatedPath,
    path.join(options.outputDir, 'dashboard_acceptance_answers_snapshot_latest.tsv')
  );
  fs.copyFileSync(
    summaryDatedPath,
    path.join(options.outputDir, 'dashboard_acceptance_coverage_summary_latest.tsv')
  );
  fs.copyFileSync(
    missingDatedPath,
    path.join(options.outputDir, 'dashboard_acceptance_missing_latest.tsv')
  );

  const answerabilityCounts = rows.reduce(
    (acc, row) => {
      acc[row.answerable_now] += 1;
      return acc;
    },
    { Y: 0, P: 0, N: 0 }
  );
  const rawAnswerabilityCounts = rows.reduce(
    (acc, row) => {
      acc[row.answerable_now_raw] += 1;
      return acc;
    },
    { Y: 0, P: 0, N: 0 }
  );
  const promotedCount = rows.filter(
    (row) => row.answerable_now_raw === 'P' && row.answerable_now === 'Y'
  ).length;

  console.log(`Generated dashboard acceptance artifacts for ${profile.metadata.id} (${options.mode}).`);
  console.log(`Generated at: ${generatedAt}`);
  console.log(
    `Rows: ${rows.length} (operational Y=${answerabilityCounts.Y}, P=${answerabilityCounts.P}, N=${answerabilityCounts.N}; raw Y=${rawAnswerabilityCounts.Y}, P=${rawAnswerabilityCounts.P}, N=${rawAnswerabilityCounts.N}; promoted=${promotedCount})`
  );
  console.log(
    `Operational promotion: ${options.enableOperationalPromotion ? `enabled (threshold=${options.operationalPromotionConfidenceThreshold.toFixed(2)})` : 'disabled'}`
  );
  console.log(`Coverage summary: ${summaryDatedPath}`);
  console.log(`Answer snapshot: ${answersDatedPath}`);
  console.log(`Missing snapshot: ${missingDatedPath}`);
}

main();
