import { describe, expect, it } from 'vitest';
import {
    classifyPaybackBand,
    classifyTailRiskBand,
    PAYBACK_GUARDRAILS,
    TAIL_RISK_GUARDRAILS
} from './guardrails';

describe('guardrails helpers', () => {
    describe('classifyPaybackBand', () => {
        it('returns healthy at and below healthy max', () => {
            expect(classifyPaybackBand(PAYBACK_GUARDRAILS.healthyMaxMonths)).toBe('healthy');
            expect(classifyPaybackBand(0)).toBe('healthy');
        });

        it('returns watchlist between healthy max and watchlist max', () => {
            expect(classifyPaybackBand(PAYBACK_GUARDRAILS.healthyMaxMonths + 0.1)).toBe('watchlist');
            expect(classifyPaybackBand(PAYBACK_GUARDRAILS.watchlistMaxMonths)).toBe('watchlist');
        });

        it('returns intervention above watchlist max and for non-finite input', () => {
            expect(classifyPaybackBand(PAYBACK_GUARDRAILS.watchlistMaxMonths + 0.1)).toBe('intervention');
            expect(classifyPaybackBand(Number.POSITIVE_INFINITY)).toBe('intervention');
            expect(classifyPaybackBand(Number.NaN)).toBe('intervention');
        });
    });

    describe('classifyTailRiskBand', () => {
        it('returns healthy below healthy max', () => {
            expect(classifyTailRiskBand(TAIL_RISK_GUARDRAILS.healthyMax - 0.1)).toBe('healthy');
        });

        it('returns watchlist at healthy max through watchlist max', () => {
            expect(classifyTailRiskBand(TAIL_RISK_GUARDRAILS.healthyMax)).toBe('watchlist');
            expect(classifyTailRiskBand(TAIL_RISK_GUARDRAILS.watchlistMax)).toBe('watchlist');
        });

        it('returns intervention above watchlist max and for non-finite input', () => {
            expect(classifyTailRiskBand(TAIL_RISK_GUARDRAILS.watchlistMax + 0.1)).toBe('intervention');
            expect(classifyTailRiskBand(Number.POSITIVE_INFINITY)).toBe('intervention');
            expect(classifyTailRiskBand(Number.NaN)).toBe('intervention');
        });
    });
});
