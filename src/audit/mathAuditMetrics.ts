export interface DistributionSummary {
  count: number;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  p05: number;
  p50: number;
  p95: number;
  ci95Lower: number;
  ci95Upper: number;
}

function sorted(values: number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

function safeDivide(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || Math.abs(denominator) < 1e-12) {
    return 0;
  }
  return numerator / denominator;
}

function percentileFromSorted(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const clamped = Math.min(1, Math.max(0, p));
  const index = Math.floor(clamped * (sortedValues.length - 1));
  return sortedValues[index];
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

export function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const variance = values.reduce((acc, value) => acc + ((value - m) ** 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function mae(actual: number[], predicted: number[]): number {
  if (actual.length === 0 || actual.length !== predicted.length) return 0;
  return mean(actual.map((value, idx) => Math.abs(predicted[idx] - value)));
}

export function rmse(actual: number[], predicted: number[]): number {
  if (actual.length === 0 || actual.length !== predicted.length) return 0;
  return Math.sqrt(mean(actual.map((value, idx) => (predicted[idx] - value) ** 2)));
}

export function mape(actual: number[], predicted: number[]): number {
  if (actual.length === 0 || actual.length !== predicted.length) return 0;
  const pctErrors = actual.map((value, idx) => {
    if (Math.abs(value) < 1e-12) return 0;
    return Math.abs((predicted[idx] - value) / value) * 100;
  });
  return mean(pctErrors);
}

export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length === 0 || x.length !== y.length) return 0;
  const meanX = mean(x);
  const meanY = mean(y);
  let numerator = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < x.length; i += 1) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  return safeDivide(numerator, Math.sqrt(denX * denY));
}

export function directionalAccuracy(actual: number[], predicted: number[]): number {
  if (actual.length < 2 || predicted.length !== actual.length) return 0;
  let matches = 0;
  let total = 0;
  for (let i = 1; i < actual.length; i += 1) {
    const actualDelta = Math.sign(actual[i] - actual[i - 1]);
    const predictedDelta = Math.sign(predicted[i] - predicted[i - 1]);
    if (actualDelta === predictedDelta) {
      matches += 1;
    }
    total += 1;
  }
  return safeDivide(matches, total);
}

export function normalizeToIndex(values: number[]): number[] {
  if (values.length === 0) return [];
  const base = Math.abs(values[0]) < 1e-12 ? 1 : values[0];
  return values.map((value) => safeDivide(value, base) * 100);
}

export function bandCoverage(target: number[], lower: number[], upper: number[]): number {
  if (target.length === 0 || target.length !== lower.length || target.length !== upper.length) return 0;
  let covered = 0;
  for (let i = 0; i < target.length; i += 1) {
    if (target[i] >= lower[i] && target[i] <= upper[i]) {
      covered += 1;
    }
  }
  return safeDivide(covered, target.length);
}

export function maxDrawdown(values: number[]): number {
  if (values.length === 0) return 0;
  let peak = values[0];
  let worst = 0;
  for (const value of values) {
    if (value > peak) peak = value;
    const drawdown = safeDivide(peak - value, Math.max(peak, 1e-12));
    if (drawdown > worst) {
      worst = drawdown;
    }
  }
  return worst;
}

export function summarizeDistribution(values: number[]): DistributionSummary {
  if (values.length === 0) {
    return {
      count: 0,
      mean: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      p05: 0,
      p50: 0,
      p95: 0,
      ci95Lower: 0,
      ci95Upper: 0,
    };
  }

  const sortedValues = sorted(values);
  const m = mean(values);
  const sd = stdDev(values);
  const margin = 1.96 * safeDivide(sd, Math.sqrt(values.length));

  return {
    count: values.length,
    mean: m,
    stdDev: sd,
    min: sortedValues[0],
    max: sortedValues[sortedValues.length - 1],
    p05: percentileFromSorted(sortedValues, 0.05),
    p50: percentileFromSorted(sortedValues, 0.50),
    p95: percentileFromSorted(sortedValues, 0.95),
    ci95Lower: m - margin,
    ci95Upper: m + margin,
  };
}
