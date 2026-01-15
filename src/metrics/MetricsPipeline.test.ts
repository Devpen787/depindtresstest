import { describe, it, expect } from 'vitest';
import {
    computeMetric,
    computeAllMetrics,
    getMetricHealth,
    validateRegistryCompleteness,
    MetricDataPoint
} from './MetricsPipeline';
import { METRICS } from '../data/MetricRegistry';

describe('MetricsPipeline', () => {
    describe('validateRegistryCompleteness', () => {
        it('should report all metrics have compute functions', () => {
            const result = validateRegistryCompleteness();
            expect(result.valid).toBe(true);
            expect(result.missing).toEqual([]);
        });
    });

    describe('computeMetric', () => {
        it('should compute solvency_ratio correctly', () => {
            const data: MetricDataPoint = { burned: 100, minted: 80 };
            const result = computeMetric('solvency_ratio', data);
            expect(result).toBeCloseTo(1.25, 2);
        });

        it('should handle edge case with zero minted', () => {
            const data: MetricDataPoint = { burned: 100, minted: 0 };
            const result = computeMetric('solvency_ratio', data);
            expect(result).toBeCloseTo(100, 0); // burned / max(minted, 1)
        });

        it('should compute weekly_retention_rate correctly', () => {
            const data: MetricDataPoint = { providers: 90, churnCount: 10 };
            const result = computeMetric('weekly_retention_rate', data);
            expect(result).toBeCloseTo(90, 0); // 90% retention
        });

        it('should compute payback_period with params', () => {
            const data: MetricDataPoint = {
                weeklyProfit: 100 // $100/week profit
            };
            const params = { hardwareCost: 1000 };
            const result = computeMetric('payback_period', data, params);
            // Monthly profit = (100/7) * 30 ≈ 428.57
            // Payback = 1000 / 428.57 ≈ 2.33 months
            expect(result).toBeCloseTo(2.33, 1);
        });

        it('should return 0 for unknown metric', () => {
            const data: MetricDataPoint = {};
            const result = computeMetric('unknown_metric', data);
            expect(result).toBe(0);
        });
    });

    describe('computeAllMetrics', () => {
        it('should return all computed metrics', () => {
            const data: MetricDataPoint = {
                burned: 100,
                minted: 100,
                providers: 100,
                churnCount: 5,
                urbanCount: 30,
                ruralCount: 70,
                treasuryBalance: 500000,
                supply: 1000000
            };
            const result = computeAllMetrics(data);

            expect(result.solvencyRatio).toBeCloseTo(1.0, 2);
            expect(result.weeklyRetentionRate).toBeGreaterThan(90);
            expect(result.urbanDensity).toBe(30);
            expect(result.ruralDensity).toBe(70);
            expect(result.treasuryBalance).toBe(500000);
            expect(result.supplyTrajectory).toBe(1000000);
        });
    });

    describe('getMetricHealth', () => {
        it('should return healthy for solvency > 1.0', () => {
            expect(getMetricHealth('solvency_ratio', 1.2)).toBe('healthy');
        });

        it('should return warning for solvency between 0.8 and 1.0', () => {
            expect(getMetricHealth('solvency_ratio', 0.9)).toBe('warning');
        });

        it('should return critical for solvency < 0.8', () => {
            expect(getMetricHealth('solvency_ratio', 0.5)).toBe('critical');
        });

        it('should return healthy for payback < 12 months', () => {
            expect(getMetricHealth('payback_period', 6)).toBe('healthy');
        });

        it('should return critical for payback > 24 months', () => {
            expect(getMetricHealth('payback_period', 30)).toBe('critical');
        });
    });

    describe('Registry Integrity', () => {
        it('all metrics should have required fields', () => {
            Object.values(METRICS).forEach(metric => {
                expect(metric.id).toBeDefined();
                expect(metric.label).toBeDefined();
                expect(metric.description).toBeDefined();
                expect(metric.formula).toBeDefined();
                expect(metric.tier).toBeDefined();
                expect(['survival', 'viability', 'utility']).toContain(metric.tier);
            });
        });

        it('all compute functions should be callable', () => {
            const testData: MetricDataPoint = {
                burned: 100,
                minted: 100,
                providers: 100,
                churnCount: 5,
                urbanCount: 30,
                ruralCount: 70,
                supply: 1000000
            };

            Object.entries(METRICS).forEach(([id, metric]) => {
                expect(metric.compute).toBeDefined();
                const result = metric.compute!(testData, {});
                expect(typeof result).toBe('number');
                expect(Number.isNaN(result)).toBe(false);
            });
        });
    });
});
