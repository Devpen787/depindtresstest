import { describe, expect, it } from 'vitest';
import {
  OWNER_KPI_THRESHOLD_COPY,
  calculateOwnerRetentionPct,
  calculateOwnerSensitivityMaxAbsDelta,
  calculateOwnerSensitivityFromSpread,
  calculateOwnerSolvencyIndex,
  calculateOwnerSolvencyRatio,
  calculateOwnerTailRiskScore,
  calculateOwnerUtilitySnapshot,
  annualizedRevenueFromWeeklyProviderRevenue,
  classifyRetentionBand,
  classifySensitivityBand,
  classifySolvencyBand,
  mergeGuardrailBands,
  calculateOwnerPaybackFromAggregatePoint,
  calculateOwnerPaybackMonths
} from './kpiOwnerMath';

describe('kpiOwnerMath', () => {
  it('uses benchmark owner formula for payback months', () => {
    const payback = calculateOwnerPaybackMonths({
      hardwareCost: 1200,
      annualizedRevenue: 62400,
      activeNodes: 100
    });

    expect(payback).toBeCloseTo(23.08, 2);
  });

  it('derives annualized revenue from weekly provider revenue', () => {
    const annualized = annualizedRevenueFromWeeklyProviderRevenue(25, 100);
    expect(annualized).toBe(130000);
  });

  it('computes payback from aggregate point using owner logic', () => {
    const point = {
      providers: { mean: 100 },
      minted: { mean: 5000 },
      price: { mean: 0.5 }
    };

    const payback = calculateOwnerPaybackFromAggregatePoint(point, 1000);
    expect(payback).toBeCloseTo(9.23, 2);
  });

  it('normalizes retention consistently from ratio and percent inputs', () => {
    expect(calculateOwnerRetentionPct(0.914)).toBeCloseTo(91.4, 3);
    expect(calculateOwnerRetentionPct(91.4)).toBeCloseTo(91.4, 3);
    expect(classifyRetentionBand(91.4)).toBe('watchlist');
  });

  it('classifies solvency ratio and index from owner source values', () => {
    const point = { solvencyScore: { mean: 1.12 } };
    expect(calculateOwnerSolvencyRatio(point)).toBeCloseTo(1.12, 4);
    expect(calculateOwnerSolvencyIndex(point)).toBeCloseTo(112, 4);
    expect(classifySolvencyBand(1.12)).toBe('watchlist');
  });

  it('computes utility snapshot and sensitivity/tail-risk signals from shared logic', () => {
    const utility = calculateOwnerUtilitySnapshot({
      demand: { mean: 1000 },
      demandServed: { mean: 760 },
      utilization: { mean: 58 }
    });
    expect(utility.demandCoveragePct).toBeCloseTo(76, 4);
    expect(utility.utilityHealthScore).toBeGreaterThan(60);

    const sensitivityMax = calculateOwnerSensitivityMaxAbsDelta([
      { delta: 4.2 },
      { delta: -17.1 },
      { delta: 9.5 }
    ]);
    expect(sensitivityMax).toBeCloseTo(17.1, 4);
    expect(classifySensitivityBand(sensitivityMax)).toBe('watchlist');

    const tailRisk = calculateOwnerTailRiskScore([
      { price: { mean: 1.0, p10: 0.9 }, solvencyScore: { mean: 1.2 } },
      { price: { mean: 0.6, p10: 0.3 }, solvencyScore: { mean: 0.85 } },
      { price: { mean: 0.8, p10: 0.5 }, solvencyScore: { mean: 0.95 } }
    ] as any);
    expect(tailRisk).toBeGreaterThanOrEqual(0);
    expect(tailRisk).toBeLessThanOrEqual(100);

    const spreadSensitivity = calculateOwnerSensitivityFromSpread({
      solvencyScore: { mean: 1.0, p10: 0.8, p90: 1.3 }
    });
    expect(spreadSensitivity).toBeCloseTo(50, 4);
  });

  it('merges guardrail bands by worst-case precedence', () => {
    expect(mergeGuardrailBands(['healthy', 'watchlist'])).toBe('watchlist');
    expect(mergeGuardrailBands(['healthy', 'intervention'])).toBe('intervention');
    expect(mergeGuardrailBands(['healthy'])).toBe('healthy');
  });

  it('exposes owner threshold copy for consistent mirror wording', () => {
    expect(OWNER_KPI_THRESHOLD_COPY.payback).toContain('Watchlist above');
    expect(OWNER_KPI_THRESHOLD_COPY.solvency).toContain('Healthy above');
  });
});
