import type { AggregateResult } from '../model/types';
import type { DiagnosticInput, DiagnosticState, DiagnosticVerdict } from '../components/Diagnostic/types';
import { RETENTION_GUARDRAILS, RESILIENCE_GUARDRAILS } from '../constants/guardrails';
import { OWNER_KPI_THRESHOLD_VALUES } from './kpiOwnerMath';

export type SignalStatus = 'Safe' | 'Warning' | 'Critical';

export interface DiagnosticSignals {
  capacityDegradation: number;
  capacityStatus: SignalStatus;
  validationOverhead: number;
  validationStatus: SignalStatus;
}

export interface InflationCapacityPoint {
  x: number;
  y: number;
}

export interface InflationCapacityRegression {
  points: InflationCapacityPoint[];
  slope: number;
  intercept: number;
  rSquared: number;
}

export interface StrategicProofResult {
  mercenaryRaw: number[];
  proRaw: number[];
  mercenaryShare: number[];
  proShare: number[];
  panicIndex: number;
  maxDrop: number;
}

export interface ArchitecturalProofResult {
  revenue: number[];
  cost: number[];
  deficit: number[];
  maxGap: number;
  maxGapIndex: number;
}

export interface MethodologicalProofResult {
  realPrice: number[];
  excelForecast: number[];
  diffPct: number[];
  midIndex: number;
}

export interface SolutionProofResult {
  dynamicPrice: number[];
  staticShadowPrice: number[];
  supplyStatic: number[];
  supplyDynamic: number[];
  savedValue: number[];
}

export interface SensitivitySweepPoint {
  burnPct: number;
  maxMintWeekly: number;
}

export type SensitivityHeatmapBand = 'red' | 'yellow' | 'green';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateDiagnosticState(inputs: DiagnosticInput): DiagnosticState {
  let r_be = 0.8;
  if (inputs.emissionSchedule === 'Fixed') r_be -= 0.4;
  if (inputs.demandLag === 'High') r_be -= 0.3;
  if (inputs.emissionSchedule === 'Dynamic') r_be += 0.2;
  r_be = clamp(r_be, 0.05, 1.5);

  let nrr = 98;
  if (inputs.minerProfile === 'Mercenary') {
    nrr = 85;
    if (inputs.priceShock === 'Moderate') nrr = 60;
    if (inputs.priceShock === 'Severe') nrr = 30;
  } else {
    nrr = 95;
    if (inputs.priceShock === 'Moderate') nrr = 92;
    if (inputs.priceShock === 'Severe') nrr = 85;
  }

  let cpv = 12;
  if (inputs.minerProfile === 'Professional') cpv = 18;
  if (inputs.minerProfile === 'Mercenary') cpv = 6;
  if (inputs.emissionSchedule === 'Fixed' && inputs.demandLag === 'High') cpv += 12;

  let lur = 10;
  if (inputs.insiderOverhang === 'High') lur += 30;
  if (inputs.demandLag === 'High') lur += 10;

  let govScore = 80;
  if (inputs.growthCoordination === 'Uncoordinated') govScore -= 30;
  if (inputs.emissionSchedule === 'Fixed') govScore -= 10;
  if (inputs.sybilResistance === 'Weak') govScore -= 20;

  const s_ber = Math.min(100, (r_be / 1.0) * 100);
  const s_nrr = Math.max(0, (nrr - 50) * 2);
  const s_lur = Math.max(0, 100 - (lur * 2));
  const finalScore = (s_ber * 0.4) + (s_nrr * 0.2) + (s_lur * 0.2) + (govScore * 0.2);

  let verdict: DiagnosticVerdict = 'Robust';
  if (finalScore < RESILIENCE_GUARDRAILS.healthyMinScore) verdict = 'Fragile';
  if (finalScore < RESILIENCE_GUARDRAILS.watchlistMinScore) verdict = 'Zombie';
  if (finalScore < 20) verdict = 'Insolvent';

  return {
    r_be,
    lur,
    nrr,
    cpv,
    govScore,
    resilienceScore: Math.round(finalScore),
    verdict,
  };
}

export function calculateDiagnosticSignals(state: DiagnosticState): DiagnosticSignals {
  const capacityDegradation = 100 - state.nrr;
  const capacityWarningFloor = OWNER_KPI_THRESHOLD_VALUES.retentionWatchlistMinPct;
  const capacityCriticalFloor = RETENTION_GUARDRAILS.thesisMinPct;
  let capacityStatus: SignalStatus = 'Safe';
  if (state.nrr < capacityWarningFloor) capacityStatus = 'Warning';
  if (state.nrr < capacityCriticalFloor) capacityStatus = 'Critical';

  const validationOverhead = Math.max(0, 100 - state.govScore);
  const validationWarningFloor = RESILIENCE_GUARDRAILS.healthyMinScore;
  const validationCriticalFloor = RESILIENCE_GUARDRAILS.watchlistMinScore;
  let validationStatus: SignalStatus = 'Safe';
  if (state.govScore < validationWarningFloor) validationStatus = 'Warning';
  if (state.govScore < validationCriticalFloor) validationStatus = 'Critical';

  return {
    capacityDegradation,
    capacityStatus,
    validationOverhead,
    validationStatus,
  };
}

export function calculateSubsidyTrapSeries(
  inputs: Pick<DiagnosticInput, 'emissionSchedule' | 'demandLag'>,
  years: number = 5,
): { emissions: number[]; burn: number[] } {
  const emissions: number[] = [];
  const burn: number[] = [];

  let currentEmission = 100;
  let currentBurn = 10;

  for (let i = 0; i < years; i += 1) {
    if (inputs.emissionSchedule === 'Fixed') {
      currentEmission *= 0.84;
    } else {
      currentEmission = (currentBurn * 1.2) + 20;
    }

    const growthRate = inputs.demandLag === 'Low' ? 1.5 : 1.1;
    currentBurn *= growthRate;

    emissions.push(Math.round(currentEmission));
    burn.push(Math.round(currentBurn));
  }

  return { emissions, burn };
}

export function calculateDensityTrapSeries(
  growthCoordination: DiagnosticInput['growthCoordination'],
): { earnings: number[]; costs: number[] } {
  const earnings: number[] = [];
  const costs: number[] = [];
  const baseCost = 20;

  for (let i = 0; i < 7; i += 1) {
    costs.push(baseCost + (i * 2));
    if (growthCoordination === 'Uncoordinated') {
      earnings.push(100 / Math.pow(1.6, i));
    } else {
      const val = 60 - (i * 3);
      earnings.push(Math.max(val, 25));
    }
  }

  return { earnings, costs };
}

export function calculateHexStateProbabilities(
  inputs: Pick<DiagnosticInput, 'priceShock' | 'minerProfile'>,
): { pGreen: number; pGrey: number; pBlack: number; effectiveCapacityPct: number } {
  let pGreen = 1.0;
  let pGrey = 0.0;
  let pBlack = 0.0;

  if (inputs.priceShock === 'None') {
    pGreen = 0.95;
    pGrey = 0.05;
  } else if (inputs.priceShock === 'Moderate') {
    if (inputs.minerProfile === 'Mercenary') {
      pGreen = 0.3;
      pGrey = 0.1;
      pBlack = 0.6;
    } else {
      pGreen = 0.4;
      pGrey = 0.5;
      pBlack = 0.1;
    }
  } else {
    if (inputs.minerProfile === 'Mercenary') {
      pGreen = 0.0;
      pGrey = 0.05;
      pBlack = 0.95;
    } else {
      pGreen = 0.1;
      pGrey = 0.7;
      pBlack = 0.2;
    }
  }

  return {
    pGreen,
    pGrey,
    pBlack,
    effectiveCapacityPct: Math.round((pGreen + pGrey) * 100),
  };
}

export function calculateInflationCapacityRegression(
  data: AggregateResult[],
  warmupWeeks: number = 10,
): InflationCapacityRegression {
  if (!data || data.length === 0) {
    return { points: [], slope: 0, intercept: 0, rSquared: 0 };
  }

  const points = data.slice(warmupWeeks).map((d) => {
    const capacity = d.capacity?.mean ?? (d as unknown as { totalCapacity?: { mean: number } }).totalCapacity?.mean ?? 0;
    const minted = d.minted?.mean ?? 0;
    return { x: capacity, y: minted };
  }).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

  if (points.length < 2) {
    return { points, slope: 0, intercept: 0, rSquared: 0 };
  }

  const n = points.length;
  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  const sumXY = points.reduce((acc, p) => acc + (p.x * p.y), 0);
  const sumXX = points.reduce((acc, p) => acc + (p.x * p.x), 0);
  const denominator = (n * sumXX) - (sumX * sumX);
  const slope = Math.abs(denominator) > 1e-12
    ? ((n * sumXY) - (sumX * sumY)) / denominator
    : 0;
  const intercept = (sumY - (slope * sumX)) / n;

  const meanY = sumY / n;
  const ssTot = points.reduce((acc, p) => acc + Math.pow(p.y - meanY, 2), 0);
  const ssRes = points.reduce((acc, p) => {
    const yPred = (slope * p.x) + intercept;
    return acc + Math.pow(p.y - yPred, 2);
  }, 0);
  const rSquared = 1 - (ssRes / (ssTot || 1));

  return { points, slope, intercept, rSquared };
}

function getMetricMeanSeries(data: AggregateResult[], key: keyof AggregateResult): number[] {
  return data.map((d) => {
    const metric = d[key] as unknown as { mean?: number } | undefined;
    return metric?.mean ?? 0;
  });
}

export function calculateStrategicProof(data: AggregateResult[]): StrategicProofResult {
  const mercenaryRaw = getMetricMeanSeries(data, 'mercenaryCount');
  const proRaw = getMetricMeanSeries(data, 'proCount');
  const total = mercenaryRaw.map((m, i) => m + proRaw[i]);
  const mercenaryShare = mercenaryRaw.map((m, i) => (m / (total[i] || 1)) * 100);
  const proShare = proRaw.map((p, i) => (p / (total[i] || 1)) * 100);

  let panicIndex = -1;
  let maxDrop = 0;
  for (let i = 1; i < mercenaryRaw.length; i += 1) {
    const drop = mercenaryRaw[i - 1] - mercenaryRaw[i];
    if (drop > maxDrop) {
      maxDrop = drop;
      panicIndex = i;
    }
  }

  return {
    mercenaryRaw,
    proRaw,
    mercenaryShare,
    proShare,
    panicIndex,
    maxDrop,
  };
}

export function calculateArchitecturalProof(data: AggregateResult[]): ArchitecturalProofResult {
  const revenue = data.map((d) => (d.dailyBurnUsd?.mean ?? 0) * 7);
  const cost = data.map((d) => (d.dailyMintUsd?.mean ?? 0) * 7);
  const deficit = cost.map((c, i) => c - revenue[i]);

  let maxGap = 0;
  let maxGapIndex = 0;
  for (let i = 0; i < deficit.length; i += 1) {
    if (deficit[i] > maxGap) {
      maxGap = deficit[i];
      maxGapIndex = i;
    }
  }

  return { revenue, cost, deficit, maxGap, maxGapIndex };
}

export function calculateMethodologicalProof(data: AggregateResult[]): MethodologicalProofResult {
  const realPrice = getMetricMeanSeries(data, 'price');
  const initialPrice = realPrice[0] || 1.0;
  const excelForecast = data.map((_, i) => initialPrice * Math.pow(1.01, i));
  const diffPct = realPrice.map((p, i) => {
    const baseline = excelForecast[i] || 1;
    return ((p - baseline) / baseline) * 100;
  });
  const midIndex = Math.floor(realPrice.length / 2);

  return { realPrice, excelForecast, diffPct, midIndex };
}

export function calculateSolutionProof(data: AggregateResult[]): SolutionProofResult {
  const dynamicPrice = getMetricMeanSeries(data, 'price');
  const supplyDynamic = getMetricMeanSeries(data, 'supply');
  const burnDynamic = getMetricMeanSeries(data, 'burned');
  const minted = getMetricMeanSeries(data, 'minted');

  const s0 = supplyDynamic[0] || 100_000;
  const e0 = minted[0] || 1_000;
  let currentStaticSupply = s0;

  const supplyStatic = data.map((_, i) => {
    const staticEmission = e0 * 5;
    currentStaticSupply = currentStaticSupply + staticEmission - (burnDynamic[i] || 0);
    return currentStaticSupply;
  });

  const staticShadowPrice = dynamicPrice.map((p, i) => {
    const sDyn = supplyDynamic[i] || 1;
    const sStat = supplyStatic[i] || 1;
    return p * (sDyn / sStat);
  });

  const savedValue = dynamicPrice.map((p, i) => p - staticShadowPrice[i]);

  return {
    dynamicPrice,
    staticShadowPrice,
    supplyStatic,
    supplyDynamic,
    savedValue,
  };
}

export function calculateBurnPctStep(index: number, xSteps: number): number {
  if (xSteps <= 1) return 0;
  return index / (xSteps - 1);
}

export function calculateMintStep(index: number, ySteps: number, minMint: number, maxMint: number): number {
  if (ySteps <= 1) return minMint;
  return minMint + (index * ((maxMint - minMint) / (ySteps - 1)));
}

export function calculateDisplayMintForRow(
  row: number,
  ySteps: number,
  minMint: number,
  maxMint: number,
): number {
  const yIndex = (ySteps - 1) - row;
  return calculateMintStep(yIndex, ySteps, minMint, maxMint);
}

export function buildSensitivitySweepGrid(
  xSteps: number = 5,
  ySteps: number = 5,
  minMint: number = 1_000_000,
  maxMint: number = 10_000_000,
): SensitivitySweepPoint[] {
  const points: SensitivitySweepPoint[] = [];
  for (let i = 0; i < xSteps; i += 1) {
    for (let j = 0; j < ySteps; j += 1) {
      points.push({
        burnPct: calculateBurnPctStep(i, xSteps),
        maxMintWeekly: calculateMintStep(j, ySteps, minMint, maxMint),
      });
    }
  }
  return points;
}

export function classifySensitivityHeatmapBand(score: number): SensitivityHeatmapBand {
  if (score < 40) return 'red';
  if (score < 70) return 'yellow';
  return 'green';
}
