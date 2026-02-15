import { describe, expect, it } from 'vitest';
import type { SimResult } from '../model/types';
import {
  PAPER_FAILURE_THRESHOLD,
  classifyHeatBand,
  evaluatePaperStressRun,
  runPaperStressMatrix,
} from './paperStressPack';

function makeStep(overrides: Partial<SimResult>): SimResult {
  return {
    t: 0,
    price: 1,
    supply: 1,
    demand: 1,
    demandServed: 1,
    providers: 100,
    capacity: 1,
    servicePrice: 1,
    minted: 1,
    burned: 1,
    utilisation: 1,
    profit: 1,
    scarcity: 0,
    incentive: 0,
    buyPressure: 0,
    sellPressure: 0,
    netFlow: 0,
    churnCount: 0,
    joinCount: 0,
    solvencyScore: 1,
    netDailyLoss: 0,
    dailyMintUsd: 0,
    dailyBurnUsd: 0,
    urbanCount: 50,
    ruralCount: 50,
    weightedCoverage: 80,
    proCount: 20,
    treasuryBalance: 0,
    vampireChurn: 0,
    mercenaryCount: 80,
    underwaterCount: 0,
    costPerCapacity: 0,
    revenuePerCapacity: 0,
    entryBarrierActive: 0,
    ...overrides,
  };
}

describe('paper stress pack helpers', () => {
  it('flags failures when >1% thresholds are breached', () => {
    const run = [
      makeStep({ t: 0, providers: 100, underwaterCount: 0, solvencyScore: 1.1 }),
      makeStep({ t: 1, providers: 100, underwaterCount: 2, solvencyScore: 1.05 }),
      makeStep({ t: 2, providers: 95, underwaterCount: 0, solvencyScore: 0.98 }),
    ];

    const outcome = evaluatePaperStressRun(run, PAPER_FAILURE_THRESHOLD);

    expect(outcome.maxUnderwaterShare).toBe(0.02);
    expect(outcome.finalSolvencyDeficit).toBeCloseTo(0.02, 12);
    expect(outcome.finalProviderCollapseShare).toBeCloseTo(0.05, 12);
    expect(outcome.liquidatableFailure).toBe(true);
    expect(outcome.insolvencyFailure).toBe(true);
  });

  it('classifies heat bands', () => {
    expect(classifyHeatBand(0.05)).toBe('GREEN');
    expect(classifyHeatBand(0.25)).toBe('YELLOW');
    expect(classifyHeatBand(0.6)).toBe('RED');
  });

  it('runs deterministic mini stress matrix', () => {
    const options = {
      demandVolatilityLevels: [0.05, 0.25],
      debtRatios: [0.5, 1.0],
      runsPerCell: 4,
      seedBase: 9001,
      baseParams: {
        T: 16,
        initialProviders: 300,
      },
    };

    const first = runPaperStressMatrix(options);
    const second = runPaperStressMatrix(options);

    expect(first.cells).toHaveLength(4);
    expect(first.liquidatableHeatmap).toHaveLength(2);
    expect(first.insolvencyHeatmap).toHaveLength(2);
    first.cells.forEach((cell) => {
      expect(cell.runCount).toBe(4);
      expect(cell.liquidatableFailureRate).toBeGreaterThanOrEqual(0);
      expect(cell.liquidatableFailureRate).toBeLessThanOrEqual(1);
      expect(cell.insolvencyFailureRate).toBeGreaterThanOrEqual(0);
      expect(cell.insolvencyFailureRate).toBeLessThanOrEqual(1);
    });

    // Same seeds should yield exact same matrix.
    expect(first.cells).toEqual(second.cells);
  });
});
