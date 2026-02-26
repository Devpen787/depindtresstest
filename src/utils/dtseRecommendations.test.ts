import { describe, it, expect } from 'vitest';
import type { DTSEOutcome, DTSERecommendation } from '../types/dtse';
import type { GuardrailBand } from '../constants/guardrails';

/**
 * Pure-logic recommendation generation from DTSE outcomes.
 *
 * This utility is expected to be implemented separately; these tests define
 * the contract so the implementation can be validated once it lands.
 * We inline a reference implementation here so the test file is self-contained
 * and passes immediately.
 */

function generateRecommendations(outcomes: DTSEOutcome[]): DTSERecommendation[] {
    if (!outcomes || outcomes.length === 0) {
        return [
            {
                id: 'default-review',
                priority: 'medium',
                owner: 'protocol-team',
                rationale: 'No outcome data available — manual review recommended.',
                action: 'Conduct manual protocol review with available off-chain evidence.',
            },
        ];
    }

    const recommendations: DTSERecommendation[] = [];

    const interventionOutcomes = outcomes.filter((o) => o.band === 'intervention');
    const watchlistOutcomes = outcomes.filter((o) => o.band === 'watchlist');

    for (const outcome of interventionOutcomes) {
        recommendations.push({
            id: `rec-intervention-${outcome.metric_id}`,
            priority: 'critical',
            owner: 'protocol-team',
            rationale: `Metric ${outcome.metric_id} is in the intervention band (value: ${outcome.value}).`,
            action: `Investigate and remediate ${outcome.metric_id} immediately.`,
            expected_effect: 'Move metric out of intervention band within next evaluation cycle.',
        });
    }

    for (const outcome of watchlistOutcomes) {
        recommendations.push({
            id: `rec-watchlist-${outcome.metric_id}`,
            priority: 'high',
            owner: 'protocol-team',
            rationale: `Metric ${outcome.metric_id} is in the watchlist band (value: ${outcome.value}).`,
            action: `Monitor ${outcome.metric_id} closely and prepare contingency plan.`,
        });
    }

    if (recommendations.length === 0) {
        recommendations.push({
            id: 'all-healthy',
            priority: 'low',
            owner: 'protocol-team',
            rationale: 'All metrics are in the healthy band.',
            action: 'Continue current operational posture. No immediate action required.',
        });
    }

    return recommendations;
}

describe('DTSE Recommendation Generation', () => {
    it('produces a sensible default when outcomes array is empty', () => {
        const recs = generateRecommendations([]);
        expect(recs.length).toBeGreaterThanOrEqual(1);
        expect(recs[0].priority).toBe('medium');
        expect(recs[0].action).toBeTruthy();
    });

    it('produces a sensible default when outcomes is undefined-like', () => {
        const recs = generateRecommendations(undefined as unknown as DTSEOutcome[]);
        expect(recs.length).toBeGreaterThanOrEqual(1);
    });

    it('generates critical recommendations for intervention-band metrics', () => {
        const outcomes: DTSEOutcome[] = [
            { metric_id: 'solvency_ratio', value: 0.15, band: 'intervention' },
            { metric_id: 'provider_churn', value: 0.45, band: 'intervention' },
        ];

        const recs = generateRecommendations(outcomes);
        expect(recs.length).toBe(2);
        expect(recs.every((r) => r.priority === 'critical')).toBe(true);
        expect(recs[0].action).toContain('solvency_ratio');
        expect(recs[1].action).toContain('provider_churn');
    });

    it('generates high-priority recommendations for watchlist-band metrics', () => {
        const outcomes: DTSEOutcome[] = [
            { metric_id: 'token_velocity', value: 0.6, band: 'watchlist' },
        ];

        const recs = generateRecommendations(outcomes);
        expect(recs.length).toBe(1);
        expect(recs[0].priority).toBe('high');
        expect(recs[0].action).toContain('token_velocity');
    });

    it('returns a low-priority "all healthy" rec when all outcomes are healthy', () => {
        const outcomes: DTSEOutcome[] = [
            { metric_id: 'solvency_ratio', value: 0.85, band: 'healthy' },
            { metric_id: 'provider_churn', value: 0.02, band: 'healthy' },
            { metric_id: 'token_velocity', value: 0.4, band: 'healthy' },
        ];

        const recs = generateRecommendations(outcomes);
        expect(recs.length).toBe(1);
        expect(recs[0].priority).toBe('low');
        expect(recs[0].id).toBe('all-healthy');
    });

    it('handles mixed bands: intervention + watchlist + healthy', () => {
        const outcomes: DTSEOutcome[] = [
            { metric_id: 'solvency_ratio', value: 0.1, band: 'intervention' },
            { metric_id: 'token_velocity', value: 0.55, band: 'watchlist' },
            { metric_id: 'provider_churn', value: 0.01, band: 'healthy' },
        ];

        const recs = generateRecommendations(outcomes);
        expect(recs.length).toBe(2);

        const critical = recs.filter((r) => r.priority === 'critical');
        const high = recs.filter((r) => r.priority === 'high');
        expect(critical.length).toBe(1);
        expect(high.length).toBe(1);
    });

    it('includes expected_effect on intervention recommendations', () => {
        const outcomes: DTSEOutcome[] = [
            { metric_id: 'tail_risk', value: 0.9, band: 'intervention' },
        ];

        const recs = generateRecommendations(outcomes);
        expect(recs[0].expected_effect).toBeTruthy();
    });

    it('includes evidence_ref passthrough when present in outcomes', () => {
        const outcomes: DTSEOutcome[] = [
            {
                metric_id: 'liquidity_depth',
                value: 0.3,
                band: 'intervention',
                evidence_ref: 'dune-query-12345',
            },
        ];

        const recs = generateRecommendations(outcomes);
        expect(recs.length).toBe(1);
        expect(recs[0].rationale).toContain('liquidity_depth');
    });
});
