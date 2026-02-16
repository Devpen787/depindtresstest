import fs from 'node:fs';
import path from 'node:path';
import { GENERATED_PROTOCOL_PROFILES } from '../src/data/generated/protocolProfiles.generated.ts';
import { runHeliumBacktestCalibration, type BacktestWeeklyRow } from '../src/audit/backtestCalibration.ts';
import { simulateOne } from '../src/model/simulation.ts';
import type { SimulationParams } from '../src/model/types.ts';
import { maxDrawdown, summarizeDistribution } from '../src/audit/mathAuditMetrics.ts';

const PROTOCOL_PROFILES = GENERATED_PROTOCOL_PROFILES;

interface ScenarioSummaryRow {
  scenarioId: string;
  scenarioName: string;
  seedCount: number;
  meanFinalPrice: number;
  p05FinalPrice: number;
  p95FinalPrice: number;
  meanRetention: number;
  p05Retention: number;
  p95Retention: number;
  meanFinalSolvency: number;
  p05FinalSolvency: number;
  p95FinalSolvency: number;
  meanMaxDrawdown: number;
  p95MaxDrawdown: number;
  probPriceDrop50: number;
  probRetentionBelow70: number;
  probSolvencyBelow1: number;
  probDrawdownAbove80: number;
}

function round(value: number, digits: number = 4): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function percentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function ensureProfile(profileId: string) {
  const profile = PROTOCOL_PROFILES.find((entry) => entry.metadata.id === profileId);
  if (!profile) {
    throw new Error(`Profile not found: ${profileId}`);
  }
  return profile;
}

function buildSimulationParams(profileId: string, overrides: Partial<SimulationParams> = {}): SimulationParams {
  const profile = ensureProfile(profileId);
  return {
    T: 52,
    initialSupply: profile.parameters.supply.value,
    initialPrice: Math.max(0.01, profile.parameters.initial_price.value),
    maxMintWeekly: profile.parameters.emissions.value,
    burnPct: profile.parameters.burn_fraction.value,
    initialLiquidity: 500_000,
    investorUnlockWeek: 26,
    investorSellPct: 0.05,
    scenario: 'baseline',
    demandType: profile.parameters.demand_regime.value,
    baseDemand: Math.max(12_000, Math.round(profile.parameters.initial_active_providers.value * 180 * 0.65)),
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
    kBuyPressure: 0.08,
    kSellPressure: 0.12,
    kDemandPrice: 0.15,
    kMintPrice: 0.35,
    baseServicePrice: 0.5,
    servicePriceElasticity: 0.6,
    minServicePrice: 0.05,
    maxServicePrice: 5,
    rewardLagWeeks: profile.parameters.adjustment_lag.value,
    nSims: 30,
    seed: 42,
    competitorYield: 0,
    emissionModel: 'fixed',
    revenueStrategy: 'burn',
    networkEffectsEnabled: false,
    hardwareCost: profile.parameters.hardware_cost.value,
    proTierPct: profile.parameters.pro_tier_pct?.value || 0,
    proTierEfficiency: 1.5,
    sybilAttackEnabled: false,
    sybilSize: 0,
    ...overrides,
  };
}

function backtestCalibration(): {
  metadata: Record<string, unknown>;
  metrics: Record<string, unknown>;
  weeklyRows: BacktestWeeklyRow[];
  calibration: Record<string, unknown>;
} {
  const calibration = runHeliumBacktestCalibration({
    sampleCount: 240,
    nSimsSearch: 12,
    nSimsFinal: 80,
    randomSeed: 20260216,
  });

  return {
    metadata: {
      generatedAtIso: new Date().toISOString(),
      profileId: 'helium_bme_v1',
      profileName: ensureProfile('helium_bme_v1').metadata.name,
      weeks: calibration.historicalLength,
      nSims: calibration.evidence.nSimsFinal,
      sampleCount: calibration.evidence.sampleCount,
      searchSeed: calibration.evidence.randomSeed,
      objectiveImprovementPct: round(calibration.evidence.objectiveImprovementPct * 100, 2),
      providerAlignmentLimited: calibration.evidence.providerAlignmentLimited,
      note: 'Price and node paths are normalized to index=100 at week 0.',
    },
    metrics: {
      baseline: {
        objective: calibration.baseline.objective,
        price: calibration.baseline.price,
        providers: calibration.baseline.providers,
      },
      calibrated: {
        objective: calibration.final.objective,
      },
      price: calibration.final.price,
      providers: calibration.final.providers,
    },
    weeklyRows: calibration.final.weeklyRows,
    calibration: {
      selectedParams: calibration.chosenParams,
      limitations: calibration.evidence.limitations,
    },
  };
}

function summarizeScenario(
  scenarioId: string,
  scenarioName: string,
  params: SimulationParams,
  seedCount: number,
  seedBase: number,
): ScenarioSummaryRow {
  const finalPriceValues: number[] = [];
  const finalProviderValues: number[] = [];
  const retentionValues: number[] = [];
  const finalSolvencyValues: number[] = [];
  const totalChurnValues: number[] = [];
  const maxDrawdownValues: number[] = [];

  for (let offset = 0; offset < seedCount; offset += 1) {
    const seed = seedBase + offset;
    const runParams = { ...params, seed, nSims: 1 };
    const steps = simulateOne(runParams, seed, 1);
    const last = steps[steps.length - 1];

    finalPriceValues.push(last.price);
    finalProviderValues.push(last.providers);
    retentionValues.push(last.providers / Math.max(runParams.initialProviders, 1));
    finalSolvencyValues.push(last.solvencyScore);
    totalChurnValues.push(steps.reduce((acc, step) => acc + step.churnCount, 0));
    maxDrawdownValues.push(maxDrawdown(steps.map((step) => step.price)));
  }

  const finalPrice = summarizeDistribution(finalPriceValues);
  const retention = summarizeDistribution(retentionValues);
  const finalSolvency = summarizeDistribution(finalSolvencyValues);
  const maxDd = summarizeDistribution(maxDrawdownValues);

  const priceDrop50 = finalPriceValues.filter((value) => value <= params.initialPrice * 0.5).length / seedCount;
  const retentionBelow70 = retentionValues.filter((value) => value < 0.7).length / seedCount;
  const solvencyBelowOne = finalSolvencyValues.filter((value) => value < 1).length / seedCount;
  const drawdownAbove80 = maxDrawdownValues.filter((value) => value > 0.8).length / seedCount;

  return {
    scenarioId,
    scenarioName,
    seedCount,
    meanFinalPrice: round(finalPrice.mean, 6),
    p05FinalPrice: round(finalPrice.p05, 6),
    p95FinalPrice: round(finalPrice.p95, 6),
    meanRetention: round(retention.mean, 6),
    p05Retention: round(retention.p05, 6),
    p95Retention: round(retention.p95, 6),
    meanFinalSolvency: round(finalSolvency.mean, 6),
    p05FinalSolvency: round(finalSolvency.p05, 6),
    p95FinalSolvency: round(finalSolvency.p95, 6),
    meanMaxDrawdown: round(maxDd.mean, 6),
    p95MaxDrawdown: round(maxDd.p95, 6),
    probPriceDrop50: round(priceDrop50, 6),
    probRetentionBelow70: round(retentionBelow70, 6),
    probSolvencyBelow1: round(solvencyBelowOne, 6),
    probDrawdownAbove80: round(drawdownAbove80, 6),
  };
}

function seedRobustness(): {
  metadata: Record<string, unknown>;
  scenarios: ScenarioSummaryRow[];
} {
  const baseParams = buildSimulationParams('ono_v3_calibrated', {
    T: 52,
    nSims: 1,
    seed: 2026,
  });
  const seedCount = 200;
  const seedBase = 7_200;

  const scenarios = [
    { id: 'baseline', name: 'Baseline', overrides: {} },
    { id: 'unlock_10pct', name: 'Investor Unlock 10%', overrides: { investorUnlockWeek: 20, investorSellPct: 0.1 } },
    { id: 'high_mint_150pct', name: 'High Mint 150%', overrides: { maxMintWeekly: baseParams.maxMintWeekly * 1.5 } },
    { id: 'high_burn_80pct', name: 'High Burn 80%', overrides: { burnPct: Math.min(0.8, baseParams.burnPct + 0.15) } },
    { id: 'vampire_attack', name: 'Vampire Yield Attack', overrides: { competitorYield: 0.5 } },
    { id: 'bearish_macro', name: 'Bearish Macro', overrides: { macro: 'bearish' as const } },
  ];

  const rows = scenarios.map((scenario) => summarizeScenario(
    scenario.id,
    scenario.name,
    { ...baseParams, ...scenario.overrides },
    seedCount,
    seedBase,
  ));

  return {
    metadata: {
      generatedAtIso: new Date().toISOString(),
      profileId: 'ono_v3_calibrated',
      profileName: ensureProfile('ono_v3_calibrated').metadata.name,
      seedCount,
      seedBase,
      metricNotes: 'Retention is finalProviders / initialProviders. Drawdown is peak-to-trough on weekly price path.',
    },
    scenarios: rows,
  };
}

function toBacktestCsv(rows: BacktestWeeklyRow[]): string {
  const header = [
    'week',
    'historical_price_index',
    'simulated_price_index',
    'simulated_price_p10_index',
    'simulated_price_p90_index',
    'historical_node_index',
    'simulated_node_index',
    'simulated_node_p10_index',
    'simulated_node_p90_index',
  ];
  const body = rows.map((row) => [
    row.week,
    row.historicalPriceIndex,
    row.simulatedPriceIndex,
    row.simulatedPriceP10Index,
    row.simulatedPriceP90Index,
    row.historicalNodeIndex,
    row.simulatedNodeIndex,
    row.simulatedNodeP10Index,
    row.simulatedNodeP90Index,
  ].join(','));
  return [header.join(','), ...body].join('\n');
}

function toScenarioCsv(rows: ScenarioSummaryRow[]): string {
  const header = [
    'scenario_id',
    'scenario_name',
    'seed_count',
    'mean_final_price',
    'p05_final_price',
    'p95_final_price',
    'mean_retention',
    'p05_retention',
    'p95_retention',
    'mean_final_solvency',
    'p05_final_solvency',
    'p95_final_solvency',
    'mean_max_drawdown',
    'p95_max_drawdown',
    'prob_price_drop50',
    'prob_retention_below70',
    'prob_solvency_below1',
    'prob_drawdown_above80',
  ];
  const body = rows.map((row) => [
    row.scenarioId,
    `"${row.scenarioName}"`,
    row.seedCount,
    row.meanFinalPrice,
    row.p05FinalPrice,
    row.p95FinalPrice,
    row.meanRetention,
    row.p05Retention,
    row.p95Retention,
    row.meanFinalSolvency,
    row.p05FinalSolvency,
    row.p95FinalSolvency,
    row.meanMaxDrawdown,
    row.p95MaxDrawdown,
    row.probPriceDrop50,
    row.probRetentionBelow70,
    row.probSolvencyBelow1,
    row.probDrawdownAbove80,
  ].join(','));
  return [header.join(','), ...body].join('\n');
}

function backtestMarkdown(payload: ReturnType<typeof backtestCalibration>): string {
  const baseline = payload.metrics.baseline as Record<string, unknown>;
  const baselinePrice = baseline.price as Record<string, number>;
  const baselineProviders = baseline.providers as Record<string, number>;
  const baselineObjective = baseline.objective as number;
  const calibrated = payload.metrics.calibrated as Record<string, number>;
  const price = payload.metrics.price as Record<string, number>;
  const providers = payload.metrics.providers as Record<string, number>;
  const calibration = payload.calibration as Record<string, unknown>;
  const limitations = (calibration.limitations as string[]) || [];

  return [
    '# Backtest Calibration Report',
    '',
    `Generated: ${payload.metadata.generatedAtIso}`,
    `Profile: ${payload.metadata.profileName} (${payload.metadata.profileId})`,
    `Weeks: ${payload.metadata.weeks}`,
    `Search Samples: ${payload.metadata.sampleCount}`,
    `Search Seed: ${payload.metadata.searchSeed}`,
    '',
    '## Calibration Objective',
    '',
    `- Baseline objective: ${baselineObjective}`,
    `- Calibrated objective: ${calibrated.objective}`,
    `- Improvement: ${payload.metadata.objectiveImprovementPct}%`,
    '',
    '## Price Index Fit',
    '',
    `- Baseline MAE: ${baselinePrice.mae}`,
    `- Baseline Correlation: ${baselinePrice.correlation}`,
    `- MAE: ${price.mae}`,
    `- RMSE: ${price.rmse}`,
    `- MAPE: ${price.mapePct}%`,
    `- Correlation: ${price.correlation}`,
    `- Directional Accuracy: ${percentage(price.directionalAccuracy)}`,
    `- p10-p90 Coverage: ${percentage(price.p10p90Coverage)}`,
    '',
    '## Provider Index Fit',
    '',
    `- Baseline MAE: ${baselineProviders.mae}`,
    `- Baseline Correlation: ${baselineProviders.correlation}`,
    `- MAE: ${providers.mae}`,
    `- RMSE: ${providers.rmse}`,
    `- MAPE: ${providers.mapePct}%`,
    `- Correlation: ${providers.correlation}`,
    `- Directional Accuracy: ${percentage(providers.directionalAccuracy)}`,
    `- p10-p90 Coverage: ${percentage(providers.p10p90Coverage)}`,
    '',
    '## Notes',
    '',
    '- Historical and simulated series are normalized to index=100 at week 0.',
    '- See `backtest_calibration.csv` for week-level values.',
    ...(limitations.length > 0
      ? ['', '## Known Limitations', '', ...limitations.map((item) => `- ${item}`)]
      : []),
    '',
  ].join('\n');
}

function seedMarkdown(payload: ReturnType<typeof seedRobustness>): string {
  const lines = [
    '# Seed Robustness Report',
    '',
    `Generated: ${payload.metadata.generatedAtIso}`,
    `Profile: ${payload.metadata.profileName} (${payload.metadata.profileId})`,
    `Seeds per scenario: ${payload.metadata.seedCount}`,
    '',
    '| Scenario | Final Price (mean / p05 / p95) | Retention mean | Solvency mean | Max Drawdown mean | P(price drop >50%) | P(retention <70%) | P(solvency <1) |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  payload.scenarios.forEach((scenario) => {
    lines.push([
      `| ${scenario.scenarioName}`,
      `${scenario.meanFinalPrice.toFixed(4)} / ${scenario.p05FinalPrice.toFixed(4)} / ${scenario.p95FinalPrice.toFixed(4)}`,
      `${percentage(scenario.meanRetention)}`,
      `${scenario.meanFinalSolvency.toFixed(3)}`,
      `${percentage(scenario.meanMaxDrawdown)}`,
      `${percentage(scenario.probPriceDrop50)}`,
      `${percentage(scenario.probRetentionBelow70)}`,
      `${percentage(scenario.probSolvencyBelow1)} |`,
    ].join(' | '));
  });

  lines.push('', '## Notes', '', '- See `seed_robustness.csv` for machine-readable values.');
  return lines.join('\n');
}

function writeArtifacts(): void {
  const backtest = backtestCalibration();
  const seed = seedRobustness();

  const outDir = path.resolve(process.cwd(), 'output/math_audit');
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'backtest_calibration.json'), JSON.stringify(backtest, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'backtest_calibration.csv'), toBacktestCsv(backtest.weeklyRows), 'utf8');
  fs.writeFileSync(path.join(outDir, 'backtest_calibration.md'), backtestMarkdown(backtest), 'utf8');

  fs.writeFileSync(path.join(outDir, 'seed_robustness.json'), JSON.stringify(seed, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'seed_robustness.csv'), toScenarioCsv(seed.scenarios), 'utf8');
  fs.writeFileSync(path.join(outDir, 'seed_robustness.md'), seedMarkdown(seed), 'utf8');

  console.log(`Wrote math audit bundle to ${outDir}`);
  console.log(`Backtest weeks: ${backtest.weeklyRows.length}`);
  console.log(`Robustness scenarios: ${seed.scenarios.length}`);
}

writeArtifacts();
