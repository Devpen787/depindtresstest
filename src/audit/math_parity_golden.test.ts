import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import type { AggregateResult } from '../model/types';
import {
  DEFAULT_TOLERANCE,
  binarySearchHistory,
  calculateRBe,
  calculateSurvivalRate,
  firstGauntletCrossoverWeek,
  gauntletCostPerGb,
  gauntletRevPerGb,
  mercenaryChurn,
  priceImpactFunction,
  trapDoorGrowth,
} from './mathParity';
import {
  buildSensitivitySweepGrid,
  calculateArchitecturalProof,
  calculateBurnPctStep,
  calculateDensityTrapSeries,
  calculateDiagnosticSignals,
  calculateDiagnosticState,
  calculateDisplayMintForRow,
  calculateHexStateProbabilities,
  calculateMethodologicalProof,
  calculateMintStep,
  calculateSolutionProof,
  calculateStrategicProof,
  calculateSubsidyTrapSeries,
  classifySensitivityHeatmapBand,
} from './diagnosticViewMath';
import {
  buildMinerChartData,
  buildUtilityChartData,
  calculateRiskMetrics,
  calculateWizardMetrics,
  summarizeFinancial,
  summarizeUtility,
  type TreasuryPoint,
} from './decisionTreeViewMath';
import {
  calculateAnnualGrowthYoY,
  calculateAnnualizedRevenue,
  calculateDemandCoveragePct,
  calculateEfficiencyScore,
  calculateHardwareRoiPct,
  calculatePaybackMonths,
  calculateRetentionFallback,
  calculateRevenuePerNode,
  calculateSmoothedSolvencyIndex,
  calculateSustainabilityRatioPct,
  calculateWeeklyBurn,
  calculateWeeklyRetentionEstimate,
  normalizePaybackMonths,
  normalizeSustainabilityRatio,
  safeAbsoluteDelta,
  safePercentDelta,
  toPaybackScore,
  type RetentionPoint,
} from './benchmarkViewMath';
import type { DiagnosticInput, DiagnosticState } from '../components/Diagnostic/types';

type JsonValue = number | string | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type ScalarInputs = Record<string, JsonValue>;
type SequenceInputs = Record<string, JsonValue>;

type ScalarCase = {
  id: string;
  formula: string;
  inputs: ScalarInputs;
  expected: number;
  tolerance?: number;
};

type SequenceCase = {
  id: string;
  formula: string;
  inputs: SequenceInputs;
  expected: number[];
  tolerance?: number;
};

type GoldenVectors = {
  default_tolerance?: number;
  scalar_cases: ScalarCase[];
  sequence_cases: SequenceCase[];
};

function getFixturePath(): string {
  return path.resolve(process.cwd(), 'src/audit/fixtures/math_golden_vectors.json');
}

function loadGoldenVectors(): GoldenVectors {
  const fixturePath = getFixturePath();
  const raw = fs.readFileSync(fixturePath, 'utf8');
  return JSON.parse(raw) as GoldenVectors;
}

function asNumber(value: JsonValue, key: string): number {
  if (typeof value !== 'number') throw new Error(`Expected numeric ${key}, got ${typeof value}`);
  return value;
}

function asString(value: JsonValue, key: string): string {
  if (typeof value !== 'string') throw new Error(`Expected string ${key}, got ${typeof value}`);
  return value;
}

function asBoolean(value: JsonValue, key: string): boolean {
  if (typeof value !== 'boolean') throw new Error(`Expected boolean ${key}, got ${typeof value}`);
  return value;
}

function asArray(value: JsonValue, key: string): JsonValue[] {
  if (!Array.isArray(value)) throw new Error(`Expected array ${key}`);
  return value;
}

function parseDiagnosticInput(inputs: ScalarInputs): DiagnosticInput {
  return {
    minerProfile: asString(inputs.minerProfile, 'minerProfile') as DiagnosticInput['minerProfile'],
    emissionSchedule: asString(inputs.emissionSchedule, 'emissionSchedule') as DiagnosticInput['emissionSchedule'],
    growthCoordination: asString(inputs.growthCoordination, 'growthCoordination') as DiagnosticInput['growthCoordination'],
    demandLag: asString(inputs.demandLag, 'demandLag') as DiagnosticInput['demandLag'],
    priceShock: asString(inputs.priceShock, 'priceShock') as DiagnosticInput['priceShock'],
    insiderOverhang: asString(inputs.insiderOverhang, 'insiderOverhang') as DiagnosticInput['insiderOverhang'],
    sybilResistance: asString(inputs.sybilResistance, 'sybilResistance') as DiagnosticInput['sybilResistance'],
  };
}

function parseDiagnosticState(inputs: ScalarInputs): DiagnosticState {
  return {
    r_be: asNumber(inputs.r_be, 'r_be'),
    lur: asNumber(inputs.lur, 'lur'),
    nrr: asNumber(inputs.nrr, 'nrr'),
    cpv: asNumber(inputs.cpv, 'cpv'),
    govScore: asNumber(inputs.govScore, 'govScore'),
    resilienceScore: asNumber(inputs.resilienceScore, 'resilienceScore'),
    verdict: asString(inputs.verdict, 'verdict') as DiagnosticState['verdict'],
  };
}

function parseAggregateSeries(value: JsonValue, key: string): AggregateResult[] {
  const arr = asArray(value, key);
  return arr as unknown as AggregateResult[];
}

function parseTreasuryPoints(value: JsonValue): TreasuryPoint[] {
  const arr = asArray(value, 'points');
  return arr as unknown as TreasuryPoint[];
}

function parseRetentionPoints(value: JsonValue): RetentionPoint[] {
  return asArray(value, 'retentionPoints').map((entry, index) => {
    if (!entry || Array.isArray(entry) || typeof entry !== 'object') {
      throw new Error(`Expected object retentionPoints[${index}]`);
    }
    const point = entry as Record<string, JsonValue>;
    return {
      providers: asNumber(point.providers, `retentionPoints[${index}].providers`),
      churn: asNumber(point.churn, `retentionPoints[${index}].churn`),
    };
  });
}

function computeScalar(formula: string, inputs: ScalarInputs): number {
  switch (formula) {
    case 'trap_door_growth':
      return trapDoorGrowth(asNumber(inputs.profit, 'profit'), asNumber(inputs.barrier, 'barrier'), asNumber(inputs.sensitivity, 'sensitivity'));
    case 'mercenary_churn':
      return mercenaryChurn(asNumber(inputs.price, 'price'), asNumber(inputs.threshold, 'threshold'), asNumber(inputs.k, 'k'));
    case 'price_impact_function':
      return priceImpactFunction(asNumber(inputs.pressure, 'pressure'), asNumber(inputs.liquidity, 'liquidity'), asNumber(inputs.k, 'k'));
    case 'calculate_r_be':
      return calculateRBe(asNumber(inputs.token_price, 'token_price'), asNumber(inputs.emission, 'emission'), asNumber(inputs.cost, 'cost'));
    case 'gauntlet_cost_per_gb':
      return gauntletCostPerGb(
        asNumber(inputs.week, 'week'),
        asNumber(inputs.minted_tokens, 'minted_tokens'),
        asNumber(inputs.initial_price, 'initial_price'),
        asNumber(inputs.decay, 'decay'),
        asNumber(inputs.capacity, 'capacity'),
      );
    case 'gauntlet_rev_per_gb':
      return gauntletRevPerGb(
        asNumber(inputs.week, 'week'),
        asNumber(inputs.demand_gb, 'demand_gb'),
        asNumber(inputs.service_price_gb, 'service_price_gb'),
        asNumber(inputs.capacity, 'capacity'),
      );
    case 'first_gauntlet_crossover_week': {
      const week = firstGauntletCrossoverWeek(
        asNumber(inputs.weeks, 'weeks'),
        asNumber(inputs.minted_tokens, 'minted_tokens'),
        asNumber(inputs.initial_price, 'initial_price'),
        asNumber(inputs.decay, 'decay'),
        asNumber(inputs.capacity, 'capacity'),
        asNumber(inputs.demand_gb, 'demand_gb'),
        asNumber(inputs.service_price_gb, 'service_price_gb'),
      );
      return week === null ? Number.NaN : week;
    }
    case 'calculate_survival_rate':
      return calculateSurvivalRate(
        asNumber(inputs.price_drop_percent, 'price_drop_percent'),
        asNumber(inputs.capex, 'capex'),
        asNumber(inputs.sensitivity, 'sensitivity'),
      );
    case 'binary_search_final_low':
      return binarySearchHistory(
        asNumber(inputs.low, 'low'),
        asNumber(inputs.high, 'high'),
        asNumber(inputs.root, 'root'),
        asNumber(inputs.iterations, 'iterations'),
      ).low;
    case 'binary_search_final_high':
      return binarySearchHistory(
        asNumber(inputs.low, 'low'),
        asNumber(inputs.high, 'high'),
        asNumber(inputs.root, 'root'),
        asNumber(inputs.iterations, 'iterations'),
      ).high;
    case 'diagnostic_state_field': {
      const field = asString(inputs.field, 'field');
      const state = calculateDiagnosticState(parseDiagnosticInput(inputs));
      return asNumber((state as unknown as Record<string, JsonValue>)[field], field);
    }
    case 'diagnostic_signal_field': {
      const field = asString(inputs.field, 'field');
      const signal = calculateDiagnosticSignals(parseDiagnosticState(inputs));
      const value = (signal as unknown as Record<string, JsonValue>)[field];
      if (typeof value === 'string') {
        if (value === 'Safe') return 0;
        if (value === 'Warning') return 1;
        if (value === 'Critical') return 2;
        throw new Error(`Unsupported status value ${value}`);
      }
      return asNumber(value, field);
    }
    case 'subsidy_series_value': {
      const series = calculateSubsidyTrapSeries(parseDiagnosticInput(inputs), asNumber(inputs.years, 'years'));
      const which = asString(inputs.series, 'series');
      const idx = asNumber(inputs.index, 'index');
      return which === 'emissions' ? series.emissions[idx] : series.burn[idx];
    }
    case 'density_series_value': {
      const series = calculateDensityTrapSeries(asString(inputs.growthCoordination, 'growthCoordination') as DiagnosticInput['growthCoordination']);
      const which = asString(inputs.series, 'series');
      const idx = asNumber(inputs.index, 'index');
      return which === 'earnings' ? series.earnings[idx] : series.costs[idx];
    }
    case 'hex_probability_field': {
      const probabilities = calculateHexStateProbabilities({
        priceShock: asString(inputs.priceShock, 'priceShock') as DiagnosticInput['priceShock'],
        minerProfile: asString(inputs.minerProfile, 'minerProfile') as DiagnosticInput['minerProfile'],
      });
      const field = asString(inputs.field, 'field');
      return asNumber((probabilities as unknown as Record<string, JsonValue>)[field], field);
    }
    case 'wizard_metric_field': {
      const data = parseAggregateSeries(inputs.series, 'series');
      const hardwareCost = asNumber(inputs.hardwareCost, 'hardwareCost');
      const field = asString(inputs.field, 'field');
      const metrics = calculateWizardMetrics(data, hardwareCost);
      return asNumber((metrics as unknown as Record<string, JsonValue>)[field], field);
    }
    case 'risk_metric_field': {
      const data = parseAggregateSeries(inputs.series, 'series');
      const field = asString(inputs.field, 'field');
      const metrics = calculateRiskMetrics(data);
      return asNumber((metrics as unknown as Record<string, JsonValue>)[field], field);
    }
    case 'miner_chart_field': {
      const data = parseAggregateSeries(inputs.series, 'series');
      const hardwareCost = asNumber(inputs.hardwareCost, 'hardwareCost');
      const index = asNumber(inputs.index, 'index');
      const field = asString(inputs.field, 'field');
      const chartData = buildMinerChartData(data, hardwareCost);
      return asNumber((chartData[index] as unknown as Record<string, JsonValue>)[field], field);
    }
    case 'utility_summary_field': {
      const data = parseAggregateSeries(inputs.series, 'series');
      const field = asString(inputs.field, 'field');
      const summary = summarizeUtility(buildUtilityChartData(data));
      return asNumber((summary as unknown as Record<string, JsonValue>)[field], field);
    }
    case 'financial_summary_field': {
      const points = parseTreasuryPoints(inputs.points);
      const field = asString(inputs.field, 'field');
      const summary = summarizeFinancial(points);
      const value = (summary as unknown as Record<string, JsonValue>)[field];
      return asNumber(value, field);
    }
    case 'strategic_proof_field': {
      const data = parseAggregateSeries(inputs.series, 'series');
      const field = asString(inputs.field, 'field');
      const index = asNumber(inputs.index ?? 0, 'index');
      const result = calculateStrategicProof(data);
      const value = (result as unknown as Record<string, JsonValue>)[field];
      if (Array.isArray(value)) {
        return asNumber(value[index], `${field}[${index}]`);
      }
      return asNumber(value, field);
    }
    case 'architectural_proof_field': {
      const data = parseAggregateSeries(inputs.series, 'series');
      const field = asString(inputs.field, 'field');
      const index = asNumber(inputs.index ?? 0, 'index');
      const result = calculateArchitecturalProof(data);
      const value = (result as unknown as Record<string, JsonValue>)[field];
      if (Array.isArray(value)) {
        return asNumber(value[index], `${field}[${index}]`);
      }
      return asNumber(value, field);
    }
    case 'methodological_proof_field': {
      const data = parseAggregateSeries(inputs.series, 'series');
      const field = asString(inputs.field, 'field');
      const index = asNumber(inputs.index ?? 0, 'index');
      const result = calculateMethodologicalProof(data);
      const value = (result as unknown as Record<string, JsonValue>)[field];
      if (Array.isArray(value)) {
        return asNumber(value[index], `${field}[${index}]`);
      }
      return asNumber(value, field);
    }
    case 'solution_proof_field': {
      const data = parseAggregateSeries(inputs.series, 'series');
      const field = asString(inputs.field, 'field');
      const index = asNumber(inputs.index ?? 0, 'index');
      const result = calculateSolutionProof(data);
      const value = (result as unknown as Record<string, JsonValue>)[field];
      if (Array.isArray(value)) {
        return asNumber(value[index], `${field}[${index}]`);
      }
      return asNumber(value, field);
    }
    case 'sensitivity_step_value': {
      const kind = asString(inputs.kind, 'kind');
      if (kind === 'burn_step') {
        return calculateBurnPctStep(asNumber(inputs.index, 'index'), asNumber(inputs.steps, 'steps'));
      }
      if (kind === 'mint_step') {
        return calculateMintStep(
          asNumber(inputs.index, 'index'),
          asNumber(inputs.steps, 'steps'),
          asNumber(inputs.minMint, 'minMint'),
          asNumber(inputs.maxMint, 'maxMint'),
        );
      }
      if (kind === 'display_row_mint') {
        return calculateDisplayMintForRow(
          asNumber(inputs.row, 'row'),
          asNumber(inputs.steps, 'steps'),
          asNumber(inputs.minMint, 'minMint'),
          asNumber(inputs.maxMint, 'maxMint'),
        );
      }
      throw new Error(`Unknown sensitivity step kind: ${kind}`);
    }
    case 'sensitivity_band_code': {
      const band = classifySensitivityHeatmapBand(asNumber(inputs.score, 'score'));
      if (band === 'red') return 0;
      if (band === 'yellow') return 1;
      return 2;
    }
    case 'sweep_grid_field': {
      const grid = buildSensitivitySweepGrid(
        asNumber(inputs.xSteps, 'xSteps'),
        asNumber(inputs.ySteps, 'ySteps'),
        asNumber(inputs.minMint, 'minMint'),
        asNumber(inputs.maxMint, 'maxMint'),
      );
      const index = asNumber(inputs.index, 'index');
      const field = asString(inputs.field, 'field');
      return asNumber((grid[index] as unknown as Record<string, JsonValue>)[field], field);
    }
    case 'benchmark_safe_percent_delta':
      return safePercentDelta(asNumber(inputs.a, 'a'), asNumber(inputs.b, 'b')).delta;
    case 'benchmark_safe_percent_is_valid':
      return safePercentDelta(asNumber(inputs.a, 'a'), asNumber(inputs.b, 'b')).isValid ? 1 : 0;
    case 'benchmark_safe_absolute_delta':
      return safeAbsoluteDelta(asNumber(inputs.a, 'a'), asNumber(inputs.b, 'b')).delta;
    case 'benchmark_safe_absolute_is_valid':
      return safeAbsoluteDelta(asNumber(inputs.a, 'a'), asNumber(inputs.b, 'b')).isValid ? 1 : 0;
    case 'benchmark_annual_growth_yoy':
      return calculateAnnualGrowthYoY(
        asNumber(inputs.startNodes, 'startNodes'),
        asNumber(inputs.endNodes, 'endNodes'),
        asNumber(inputs.weeks, 'weeks'),
      );
    case 'benchmark_annualized_revenue':
      return calculateAnnualizedRevenue(
        asBoolean(inputs.hasLiveRevenue, 'hasLiveRevenue'),
        asNumber(inputs.liveRevenueUsd7d, 'liveRevenueUsd7d'),
        asNumber(inputs.demandServedMean, 'demandServedMean'),
        asNumber(inputs.servicePriceMean, 'servicePriceMean'),
      );
    case 'benchmark_weekly_burn':
      return calculateWeeklyBurn(
        asBoolean(inputs.hasLiveBurn, 'hasLiveBurn'),
        asNumber(inputs.liveBurn7d, 'liveBurn7d'),
        asNumber(inputs.simulatedBurn, 'simulatedBurn'),
      );
    case 'benchmark_sustainability_ratio_pct':
      return calculateSustainabilityRatioPct(
        asNumber(inputs.mintedTokens, 'mintedTokens'),
        asNumber(inputs.simulationPrice, 'simulationPrice'),
        asNumber(inputs.burnAmount, 'burnAmount'),
        asNumber(inputs.burnPrice, 'burnPrice'),
      );
    case 'benchmark_revenue_per_node':
      return calculateRevenuePerNode(
        asNumber(inputs.annualizedRevenue, 'annualizedRevenue'),
        asNumber(inputs.activeNodes, 'activeNodes'),
      );
    case 'benchmark_hardware_roi_pct':
      return calculateHardwareRoiPct(
        asNumber(inputs.revenuePerNode, 'revenuePerNode'),
        asNumber(inputs.hardwareCost, 'hardwareCost'),
      );
    case 'benchmark_payback_months':
      return calculatePaybackMonths(
        asNumber(inputs.hardwareCost, 'hardwareCost'),
        asNumber(inputs.annualizedRevenue, 'annualizedRevenue'),
        asNumber(inputs.activeNodes, 'activeNodes'),
      );
    case 'benchmark_normalize_payback_months':
      return normalizePaybackMonths(asNumber(inputs.paybackMonths, 'paybackMonths'));
    case 'benchmark_retention_fallback':
      return calculateRetentionFallback(
        asNumber(inputs.finalProviders, 'finalProviders'),
        asNumber(inputs.peakProviders, 'peakProviders'),
      );
    case 'benchmark_weekly_retention_estimate':
      return calculateWeeklyRetentionEstimate(
        parseRetentionPoints(inputs.retentionPoints),
        asNumber(inputs.fallback, 'fallback'),
      );
    case 'benchmark_demand_coverage_pct':
      return calculateDemandCoveragePct(
        asNumber(inputs.demand, 'demand'),
        asNumber(inputs.demandServed, 'demandServed'),
      );
    case 'benchmark_efficiency_score': {
      const previousUtilization = typeof inputs.previousUtilization === 'number'
        ? inputs.previousUtilization
        : undefined;
      return calculateEfficiencyScore(
        asNumber(inputs.utilization, 'utilization'),
        asNumber(inputs.demandCoverage, 'demandCoverage'),
        previousUtilization,
      );
    }
    case 'benchmark_normalize_sustainability_ratio':
      return normalizeSustainabilityRatio(asNumber(inputs.sustainabilityRatioPct, 'sustainabilityRatioPct'));
    case 'benchmark_payback_score':
      return toPaybackScore(asNumber(inputs.paybackMonths, 'paybackMonths'));
    case 'benchmark_smoothed_solvency_index': {
      const series = asArray(inputs.series, 'series').map((value, index) => asNumber(value, `series[${index}]`));
      return calculateSmoothedSolvencyIndex(series, asNumber(inputs.index, 'index'));
    }
    default:
      throw new Error(`Unknown scalar formula: ${formula}`);
  }
}

function computeSequence(formula: string, inputs: SequenceInputs): number[] {
  switch (formula) {
    case 'binary_search_history':
      return binarySearchHistory(
        asNumber(inputs.low, 'low'),
        asNumber(inputs.high, 'high'),
        asNumber(inputs.root, 'root'),
        asNumber(inputs.iterations, 'iterations'),
      ).history;
    case 'survival_curve_points': {
      const points = asArray(inputs.points ?? [], 'points').map((value) => asNumber(value, 'point'));
      return points.map((point) => calculateSurvivalRate(
        point,
        asNumber(inputs.capex, 'capex'),
        asNumber(inputs.sensitivity, 'sensitivity'),
      ));
    }
    case 'subsidy_series': {
      const which = asString(inputs.series, 'series');
      const series = calculateSubsidyTrapSeries(parseDiagnosticInput(inputs), asNumber(inputs.years, 'years'));
      return which === 'emissions' ? series.emissions : series.burn;
    }
    case 'density_series': {
      const which = asString(inputs.series, 'series');
      const series = calculateDensityTrapSeries(asString(inputs.growthCoordination, 'growthCoordination') as DiagnosticInput['growthCoordination']);
      return which === 'earnings' ? series.earnings : series.costs;
    }
    case 'strategic_proof_series': {
      const data = parseAggregateSeries(inputs.series, 'series');
      const field = asString(inputs.field, 'field');
      const result = calculateStrategicProof(data) as unknown as Record<string, JsonValue>;
      const value = result[field];
      return asArray(value, field).map((entry) => asNumber(entry, field));
    }
    case 'architectural_proof_series': {
      const data = parseAggregateSeries(inputs.series, 'series');
      const field = asString(inputs.field, 'field');
      const result = calculateArchitecturalProof(data) as unknown as Record<string, JsonValue>;
      const value = result[field];
      return asArray(value, field).map((entry) => asNumber(entry, field));
    }
    case 'methodological_proof_series': {
      const data = parseAggregateSeries(inputs.series, 'series');
      const field = asString(inputs.field, 'field');
      const result = calculateMethodologicalProof(data) as unknown as Record<string, JsonValue>;
      const value = result[field];
      return asArray(value, field).map((entry) => asNumber(entry, field));
    }
    case 'solution_proof_series': {
      const data = parseAggregateSeries(inputs.series, 'series');
      const field = asString(inputs.field, 'field');
      const result = calculateSolutionProof(data) as unknown as Record<string, JsonValue>;
      const value = result[field];
      return asArray(value, field).map((entry) => asNumber(entry, field));
    }
    case 'sweep_grid_series': {
      const field = asString(inputs.field, 'field');
      const grid = buildSensitivitySweepGrid(
        asNumber(inputs.xSteps, 'xSteps'),
        asNumber(inputs.ySteps, 'ySteps'),
        asNumber(inputs.minMint, 'minMint'),
        asNumber(inputs.maxMint, 'maxMint'),
      ) as unknown as Array<Record<string, JsonValue>>;
      return grid.map((cell) => asNumber(cell[field], field));
    }
    case 'benchmark_smoothed_solvency_series': {
      const series = asArray(inputs.series, 'series').map((value, index) => asNumber(value, `series[${index}]`));
      const indexes = asArray(inputs.indexes, 'indexes').map((value, index) => asNumber(value, `indexes[${index}]`));
      return indexes.map((index) => calculateSmoothedSolvencyIndex(series, index));
    }
    default:
      throw new Error(`Unknown sequence formula: ${formula}`);
  }
}

function assertClose(actual: number, expected: number, tolerance: number, caseId: string): void {
  const diff = Math.abs(actual - expected);
  if (Number.isNaN(actual) || diff > tolerance) {
    throw new Error(
      `${caseId}: expected ${expected} got ${actual} (abs diff ${diff}, tolerance ${tolerance})`,
    );
  }
}

describe('Python <> TypeScript math parity (golden vectors)', () => {
  const vectors = loadGoldenVectors();
  const defaultTolerance = vectors.default_tolerance ?? DEFAULT_TOLERANCE;

  it('matches all scalar cases', () => {
    for (const testCase of vectors.scalar_cases) {
      const tolerance = testCase.tolerance ?? defaultTolerance;
      const actual = computeScalar(testCase.formula, testCase.inputs);
      assertClose(actual, testCase.expected, tolerance, testCase.id);
    }
  });

  it('matches all sequence cases', () => {
    for (const testCase of vectors.sequence_cases) {
      const tolerance = testCase.tolerance ?? defaultTolerance;
      const actual = computeSequence(testCase.formula, testCase.inputs);

      if (actual.length !== testCase.expected.length) {
        throw new Error(
          `${testCase.id}: expected length ${testCase.expected.length} got ${actual.length}`,
        );
      }

      for (let i = 0; i < actual.length; i += 1) {
        assertClose(actual[i], testCase.expected[i], tolerance, `${testCase.id}[${i}]`);
      }
    }
  });
});
