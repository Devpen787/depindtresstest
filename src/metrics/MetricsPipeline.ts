/**
 * MetricsPipeline - Central computation module for all simulation metrics
 * 
 * This is the SINGLE SOURCE OF TRUTH for metric computations.
 * All UI components must consume precomputed metrics from this pipeline.
 * No inline formulas in React components.
 */

import { METRICS, MetricDataPoint, RegisteredMetric } from '../data/MetricRegistry';

// Re-export types for consumers
export type { MetricDataPoint } from '../data/MetricRegistry';

// Simulation params needed for some metric computations
export interface MetricParams {
    hardwareCost?: number;
    initialProviders?: number;
    [key: string]: number | string | undefined;
}

// Computed metrics output shape - matches all registry metrics
export interface ComputedMetrics {
    // Tier 1: Survival
    solvencyRatio: number;
    weeklyRetentionRate: number;
    urbanDensity: number;
    treasuryBalance: number;

    // Tier 2: Viability
    paybackPeriodMonths: number;
    networkCoverageScore: number;
    vampireChurn: number;

    // Tier 3: Utility
    effectiveCapacity: number;
    ruralDensity: number;
    networkUtilization: number;
    qualityDistribution: number;
    supplyTrajectory: number;
}

/**
 * Compute a single metric by ID using the registry
 */
export function computeMetric(
    metricId: string,
    data: MetricDataPoint,
    params?: MetricParams
): number {
    const metric = METRICS[metricId];
    if (!metric) {
        console.warn(`Metric not found in registry: ${metricId}`);
        return 0;
    }
    if (!metric.compute) {
        console.warn(`Metric ${metricId} has no compute function`);
        return 0;
    }
    return metric.compute(data, params);
}

/**
 * Compute ALL registered metrics for a single data point
 */
export function computeAllMetrics(
    data: MetricDataPoint,
    params?: MetricParams
): ComputedMetrics {
    return {
        // Tier 1: Survival
        solvencyRatio: computeMetric('solvency_ratio', data, params),
        weeklyRetentionRate: computeMetric('weekly_retention_rate', data, params),
        urbanDensity: computeMetric('urban_density', data, params),
        treasuryBalance: computeMetric('treasury_balance', data, params),

        // Tier 2: Viability
        paybackPeriodMonths: computeMetric('payback_period', data, params),
        networkCoverageScore: computeMetric('network_coverage_score', data, params),
        vampireChurn: computeMetric('vampire_churn', data, params),

        // Tier 3: Utility
        effectiveCapacity: computeMetric('effective_capacity', data, params),
        ruralDensity: computeMetric('rural_density', data, params),
        networkUtilization: computeMetric('network_utilization', data, params),
        qualityDistribution: computeMetric('quality_distribution', data, params),
        supplyTrajectory: computeMetric('supply_trajectory', data, params),
    };
}

/**
 * Compute metrics for an array of weekly data points
 */
export function computeMetricsTimeSeries(
    weeklyData: MetricDataPoint[],
    params?: MetricParams
): ComputedMetrics[] {
    return weeklyData.map(week => computeAllMetrics(week, params));
}

/**
 * Get the health status of a metric based on its thresholds
 */
export function getMetricHealth(
    metricId: string,
    value: number
): 'healthy' | 'warning' | 'critical' {
    const metric = METRICS[metricId];
    if (!metric?.thresholds) return 'healthy';

    const { healthy, critical } = metric.thresholds;

    // For metrics where higher is better (like solvency ratio)
    if (healthy > critical) {
        if (value >= healthy) return 'healthy';
        if (value >= critical) return 'warning';
        return 'critical';
    }

    // For metrics where lower is better (like payback period)
    if (value <= healthy) return 'healthy';
    if (value <= critical) return 'warning';
    return 'critical';
}

/**
 * Get metrics by tier for display grouping
 */
export function getMetricsByTier(tier: 'survival' | 'viability' | 'utility'): RegisteredMetric[] {
    return Object.values(METRICS).filter(m => m.tier === tier);
}

/**
 * Validate that all metrics have compute functions defined
 */
export function validateRegistryCompleteness(): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    Object.entries(METRICS).forEach(([id, metric]) => {
        if (!metric.compute) {
            missing.push(id);
        }
    });
    return { valid: missing.length === 0, missing };
}
