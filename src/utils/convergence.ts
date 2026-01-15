/**
 * Convergence & Stability Utilities for DePIN Stress Test Simulator
 * Focus: Determining if Monte Carlo sample size is sufficient for reliable results
 */

export type StabilityLevel = 'high' | 'medium' | 'low';

export interface ConvergenceResult {
    level: StabilityLevel;
    label: string;
    color: string;
    message: string;
    recommendation?: string;
}

/**
 * Determine simulation stability based on nSims and coefficient of variation
 * @param nSims Number of Monte Carlo simulations run
 * @param coefficientOfVariation StdDev / Mean for key metrics (should be < 0.1 for stable)
 */
export function assessConvergence(nSims: number, coefficientOfVariation: number): ConvergenceResult {
    // Rule of thumb thresholds
    // High: nSims >= 100 AND CV < 0.1 (10%)
    // Medium: nSims >= 30 OR (nSims >= 20 AND CV < 0.2)
    // Low: else

    if (nSims >= 100 && coefficientOfVariation < 0.1) {
        return {
            level: 'high',
            label: 'High Confidence',
            color: 'emerald',
            message: `Results are statistically stable (n=${nSims}, CV=${(coefficientOfVariation * 100).toFixed(1)}%).`
        };
    }

    if (nSims >= 30 || (nSims >= 20 && coefficientOfVariation < 0.2)) {
        return {
            level: 'medium',
            label: 'Medium Confidence',
            color: 'amber',
            message: `Results are moderately stable (n=${nSims}, CV=${(coefficientOfVariation * 100).toFixed(1)}%).`,
            recommendation: 'Increase nSims to 100+ for publication-quality results.'
        };
    }

    return {
        level: 'low',
        label: 'Low Confidence',
        color: 'rose',
        message: `Results may be dominated by noise (n=${nSims}, CV=${(coefficientOfVariation * 100).toFixed(1)}%).`,
        recommendation: 'Increase nSims to at least 30 for meaningful analysis.'
    };
}

/**
 * Calculate coefficient of variation for a metric across time series
 * Uses the average CV across all timesteps
 */
export function calculateAverageCV(means: number[], stdDevs: number[]): number {
    if (means.length === 0 || stdDevs.length === 0) return 1; // Worst case

    let totalCV = 0;
    let validCount = 0;

    for (let i = 0; i < means.length; i++) {
        const mean = means[i];
        const stdDev = stdDevs[i];

        if (mean !== 0 && !isNaN(mean) && !isNaN(stdDev)) {
            totalCV += Math.abs(stdDev / mean);
            validCount++;
        }
    }

    return validCount > 0 ? totalCV / validCount : 1;
}
