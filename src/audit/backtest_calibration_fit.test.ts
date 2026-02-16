import { describe, expect, it } from 'vitest';
import { runHeliumBacktestCalibration } from './backtestCalibration';

describe('Helium backtest calibration search', () => {
  it('improves fit objective over baseline without degrading provider MAE materially', () => {
    const result = runHeliumBacktestCalibration({
      sampleCount: 36,
      nSimsSearch: 6,
      nSimsFinal: 12,
      randomSeed: 98765,
    });

    expect(result.baseline.objective).toBeGreaterThan(0);
    expect(result.final.objective).toBeGreaterThan(0);
    expect(result.final.objective).toBeLessThan(result.baseline.objective * 0.8);

    expect(result.final.price.correlation).toBeGreaterThan(result.baseline.price.correlation);
    expect(result.final.price.mae).toBeLessThan(result.baseline.price.mae);

    expect(result.final.providers.correlation).toBeGreaterThan(0.1);
    expect(result.final.providers.mae).toBeLessThan(result.baseline.providers.mae);
  });
});
