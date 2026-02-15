import { describe, expect, it } from 'vitest';
import {
  calculateAnnualGrowthYoY,
  calculateAnnualizedRevenue,
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
  resolveSourceLabel,
  safeAbsoluteDelta,
  safePercentDelta,
  toPaybackScore,
} from './benchmarkViewMath';

describe('benchmarkViewMath', () => {
  it('derives annual growth, revenue, burn, and sustainability consistently', () => {
    expect(calculateAnnualGrowthYoY(1000, 5000, 52)).toBeCloseTo(400, 10);
    expect(calculateAnnualizedRevenue(true, 1000, 0, 0)).toBe(52000);
    expect(calculateAnnualizedRevenue(false, 0, 200, 0.5)).toBe(5200);
    expect(calculateWeeklyBurn(true, 250, 100)).toBe(250);
    expect(calculateSustainabilityRatioPct(1000, 0.5, 500, 0.5)).toBeCloseTo(50, 10);
  });

  it('computes head-to-head deltas and source label resolution', () => {
    expect(safePercentDelta(5000, 4000)).toEqual({ delta: 25, isValid: true });
    expect(safePercentDelta(1, 0)).toEqual({ delta: 0, isValid: false });
    expect(safeAbsoluteDelta(10, 7)).toEqual({ delta: 3, isValid: true });
    expect(resolveSourceLabel(['live']).label).toBe('Live Data');
    expect(resolveSourceLabel(['mixed', 'simulated']).label).toBe('Anchored');
    expect(resolveSourceLabel(['simulated']).isProjected).toBe(true);
  });

  it('derives payback and ROI math for benchmark cards', () => {
    const revenuePerNode = calculateRevenuePerNode(52000, 5000);
    expect(revenuePerNode).toBeCloseTo(10.4, 10);
    expect(calculateHardwareRoiPct(revenuePerNode, 150)).toBeCloseTo(6.9333333333, 10);

    const paybackMonths = calculatePaybackMonths(150, 52000, 5000);
    expect(paybackMonths).toBeCloseTo(173.0769230769, 10);
    expect(normalizePaybackMonths(paybackMonths)).toBe(60);
    expect(toPaybackScore(18)).toBeCloseTo(50, 10);
  });

  it('calculates retention and efficiency with trailing window logic', () => {
    const fallback = calculateRetentionFallback(900, 1000);
    expect(fallback).toBe(90);

    const retention = calculateWeeklyRetentionEstimate(
      [
        { providers: 1000, churn: 0 },
        { providers: 980, churn: 20 },
        { providers: 960, churn: 25 },
        { providers: 940, churn: 30 },
        { providers: 920, churn: 35 },
        { providers: 900, churn: 40 },
        { providers: 880, churn: 50 },
        { providers: 860, churn: 60 },
      ],
      fallback,
    );
    expect(retention).toBeCloseTo(95.9827159822, 9);

    expect(calculateEfficiencyScore(82, 90, 80)).toBeCloseTo(95.2, 10);
  });

  it('smooths solvency projections over trailing windows', () => {
    const series = [1.2, 1.1, 0.9, 0.8];
    expect(calculateSmoothedSolvencyIndex(series, 2)).toBeCloseTo(106.6666666667, 10);
    expect(calculateSmoothedSolvencyIndex(series, 0)).toBeCloseTo(120, 10);
  });
});
