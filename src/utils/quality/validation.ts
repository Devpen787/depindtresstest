import type { AggregateResult } from '../../model/types.ts';

export interface ValidationIssue {
    type: 'error' | 'warning';
    message: string;
    context?: any;
}

export interface ValidationReport {
    isValid: boolean;
    issues: ValidationIssue[];
}

/**
 * Validates a simulation result against core thesis invariants.
 * "Great Expectations" style checks.
 */
export function validateSimulationResult(results: AggregateResult[]): ValidationReport {
    const issues: ValidationIssue[] = [];

    // 1. Structural Integrity
    if (!results || results.length === 0) {
        return {
            isValid: false,
            issues: [{ type: 'error', message: 'Simulation result is empty.' }]
        };
    }

    // 2. Time Consistency
    const timeSteps = results.map(a => a.t);
    const isMonotonic = timeSteps.every((val, i, arr) => !i || val > arr[i - 1]);
    if (!isMonotonic) {
        issues.push({ type: 'error', message: 'Time steps are not monotonic.' });
    }

    // 3. Financial Invariants
    results.forEach((step) => {
        // Price must be non-negative (using min statistic to be safe)
        if (step.price.min < 0) {
            issues.push({ type: 'error', message: `Negative price detected at step ${step.t}`, context: step.price });
        }

        // Supply shouldn't be negative
        if (step.supply.min < 0) {
            issues.push({ type: 'error', message: `Negative supply detected at step ${step.t}`, context: step.supply });
        }

        // Providers shouldn't be negative
        if (step.providers.min < 0) {
            issues.push({ type: 'error', message: `Negative provider count at step ${step.t}`, context: step.providers });
        }
    });

    // 4. Thesis Specific Checks
    // Solvency Score should be defined
    const hasSolvency = results.every(step => step.solvencyScore && step.solvencyScore.mean !== undefined);
    if (!hasSolvency) {
        issues.push({ type: 'warning', message: 'Solvency score missing or undefined in some steps.' });
    }

    return {
        isValid: issues.filter(i => i.type === 'error').length === 0,
        issues
    };
}
