/**
 * Statistical Utilities for DePIN Stress Test Simulator
 * Focus: Scientific Rigor (Confidence Intervals, Variance, Stability)
 */

export interface StatisticalSummary {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    p05: number;
    p10: number;
    p90: number;
    p95: number;
    ci95_lower: number; // Lower bound of 95% Confidence Interval for the MEAN
    ci95_upper: number; // Upper bound of 95% Confidence Interval for the MEAN
    n: number;
}

/**
 * Calculate comprehensive statistical summary for a dataset
 */
export function calculateStats(values: number[]): StatisticalSummary {
    const n = values.length;
    if (n === 0) {
        return {
            mean: 0, median: 0, stdDev: 0, min: 0, max: 0,
            p05: 0, p10: 0, p90: 0, p95: 0,
            ci95_lower: 0, ci95_upper: 0, n: 0
        };
    }

    // 1. Basic Stats
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // 2. Variance & StdDev
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // 3. Sorting for Percentiles
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[n - 1];

    // Helper for percentile interpolation
    const getPercentile = (p: number) => {
        const index = (n - 1) * p;
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        if (upper >= n) return sorted[n - 1];
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    };

    const median = getPercentile(0.5);
    const p05 = getPercentile(0.05);
    const p10 = getPercentile(0.10);
    const p90 = getPercentile(0.90);
    const p95 = getPercentile(0.95);

    // 4. Confidence Interval (95%)
    // CI = Mean ± (Z * (StdDev / sqrt(n)))
    // For n > 30, Z ~ 1.96. For smaller n, T-distribution is better, but 1.96 is standard approx.
    const zScore = 1.96;
    const standardError = stdDev / Math.sqrt(n);
    const marginOfError = zScore * standardError;

    return {
        mean,
        median,
        stdDev,
        min,
        max,
        p05,
        p10,
        p90,
        p95,
        ci95_lower: mean - marginOfError,
        ci95_upper: mean + marginOfError,
        n
    };
}

/**
 * Welch's T-Test Result
 */
export interface TTestResult {
    tStatistic: number;
    degreesOfFreedom: number;
    pValue: number;          // Approximation using normal distribution for df > 30
    significant: boolean;    // p < 0.05
    effectSize: number;      // Cohen's d
    effectInterpretation: 'negligible' | 'small' | 'medium' | 'large';
}

/**
 * Perform Welch's T-Test (unequal variances assumed)
 * Compares means of two independent samples
 */
export function performWelchTTest(control: number[], treatment: number[]): TTestResult {
    const stats1 = calculateStats(control);
    const stats2 = calculateStats(treatment);

    const n1 = stats1.n;
    const n2 = stats2.n;
    const mean1 = stats1.mean;
    const mean2 = stats2.mean;
    const var1 = stats1.stdDev ** 2;
    const var2 = stats2.stdDev ** 2;

    // Welch's t-statistic
    const tStat = (mean1 - mean2) / Math.sqrt(var1 / n1 + var2 / n2);

    // Welch-Satterthwaite degrees of freedom
    const numerator = (var1 / n1 + var2 / n2) ** 2;
    const denominator = ((var1 / n1) ** 2) / (n1 - 1) + ((var2 / n2) ** 2) / (n2 - 1);
    const df = numerator / denominator;

    // P-value approximation (using normal distribution for large df)
    // For small df, this underestimates p-value, but it's a reasonable approximation
    const pValue = 2 * (1 - normalCDF(Math.abs(tStat)));

    // Effect size (Cohen's d)
    const pooledStdDev = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2));
    const cohensD = Math.abs(mean1 - mean2) / pooledStdDev;

    // Interpretation
    let effectInterpretation: 'negligible' | 'small' | 'medium' | 'large';
    if (cohensD < 0.2) effectInterpretation = 'negligible';
    else if (cohensD < 0.5) effectInterpretation = 'small';
    else if (cohensD < 0.8) effectInterpretation = 'medium';
    else effectInterpretation = 'large';

    return {
        tStatistic: tStat,
        degreesOfFreedom: df,
        pValue,
        significant: pValue < 0.05,
        effectSize: cohensD,
        effectInterpretation
    };
}

/**
 * Calculate Cohen's d (effect size) between two samples
 * Interpretation: |d| < 0.2 = negligible, 0.2-0.5 = small, 0.5-0.8 = medium, > 0.8 = large
 */
export function calculateCohensD(control: number[], treatment: number[]): number {
    const stats1 = calculateStats(control);
    const stats2 = calculateStats(treatment);

    const n1 = stats1.n;
    const n2 = stats2.n;
    const var1 = stats1.stdDev ** 2;
    const var2 = stats2.stdDev ** 2;

    const pooledStdDev = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2));
    return Math.abs(stats1.mean - stats2.mean) / pooledStdDev;
}

/**
 * Standard normal CDF approximation (Abramowitz and Stegun)
 */
function normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
}

/**
 * Simple significance check using CI overlap (faster, less rigorous)
 */
export function isStatisticallySignificant(control: number[], treatment: number[]): boolean {
    const result = performWelchTTest(control, treatment);
    return result.significant;
}

