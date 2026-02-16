import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_SIMULATION_PARAMS, type AggregateResult, type SimulationParams } from '../../model/SimulationAdapter';
import {
    ACCEPTANCE_QUESTION_IDS,
    QUESTION_REGISTRY,
    evaluateAllQuestions,
    evaluateQuestion,
    summarizeCoverage,
    validateRegistryCoverage
} from './index';
import type { AnswerContext } from './types';

function stats(mean: number) {
    return {
        mean,
        p10: mean,
        p90: mean,
        min: mean,
        max: mean,
        stdDev: 0,
        ci95_lower: mean,
        ci95_upper: mean
    };
}

function createAggregatePoint(t: number, overrides: Partial<AggregateResult> = {}): AggregateResult {
    return {
        t,
        price: stats(1),
        supply: stats(1_000_000),
        demand: stats(10_000),
        demand_served: stats(9_500),
        providers: stats(1_000),
        capacity: stats(15_000),
        servicePrice: stats(0.5),
        minted: stats(100_000),
        burned: stats(80_000),
        utilization: stats(63),
        profit: stats(25),
        scarcity: stats(0),
        incentive: stats(1.2),
        solvencyScore: stats(1.1),
        netDailyLoss: stats(0),
        dailyMintUsd: stats(8_000),
        dailyBurnUsd: stats(8_800),
        netFlow: stats(0),
        churnCount: stats(15),
        joinCount: stats(20),
        treasuryBalance: stats(500_000),
        vampireChurn: stats(0),
        mercenaryCount: stats(300),
        proCount: stats(700),
        underwaterCount: stats(120),
        costPerCapacity: stats(0.4),
        revenuePerCapacity: stats(0.45),
        entryBarrierActive: stats(1),
        ...overrides
    };
}

function buildContext(
    aggregated: AggregateResult[],
    options: {
        baselineAggregated?: AggregateResult[] | null;
        params?: Partial<SimulationParams>;
    } = {}
): AnswerContext {
    const params = {
        ...DEFAULT_SIMULATION_PARAMS,
        ...options.params
    } as SimulationParams;
    return {
        runId: 'test-run',
        params,
        aggregated,
        baselineAggregated: options.baselineAggregated ?? null
    };
}

describe('acceptance answer engine', () => {
    it('registers all 103 acceptance checklist question IDs', () => {
        expect(ACCEPTANCE_QUESTION_IDS).toHaveLength(103);
        expect(new Set(ACCEPTANCE_QUESTION_IDS).size).toBe(103);

        const coverage = validateRegistryCoverage();
        expect(coverage.valid).toBe(true);
        expect(coverage.missing).toEqual([]);
        expect(coverage.unexpected).toEqual([]);
    });

    it('stays aligned with the canonical acceptance TSV checklist IDs', () => {
        const spreadsheetDir = path.join(process.cwd(), 'output', 'spreadsheet');
        const datedSnapshots = fs.existsSync(spreadsheetDir)
            ? fs.readdirSync(spreadsheetDir)
                .filter((fileName) => /^dashboard_acceptance_answers_snapshot_\d{4}-\d{2}-\d{2}\.tsv$/.test(fileName))
                .sort()
            : [];

        const latestSnapshot = datedSnapshots.length > 0
            ? path.join(spreadsheetDir, datedSnapshots[datedSnapshots.length - 1])
            : path.join(spreadsheetDir, 'dashboard_acceptance_answers_snapshot_latest.tsv');

        expect(fs.existsSync(latestSnapshot)).toBe(true);

        const rows = fs.readFileSync(latestSnapshot, 'utf-8')
            .trim()
            .split('\n')
            .slice(1);
        const tsvIds = rows.map((row) => row.split('\t')[0]);

        expect(tsvIds).toHaveLength(103);
        expect(new Set(tsvIds).size).toBe(103);
        expect(ACCEPTANCE_QUESTION_IDS).toEqual(tsvIds);
    });

    it('evaluates all questions into a structured answer payload', () => {
        const context = buildContext([
            createAggregatePoint(1),
            createAggregatePoint(2)
        ]);
        const answers = evaluateAllQuestions(context);
        expect(answers).toHaveLength(103);
        expect(answers.every((answer) => typeof answer.summary === 'string')).toBe(true);
        expect(answers.every((answer) => Array.isArray(answer.metrics))).toBe(true);

        const summary = summarizeCoverage(answers);
        expect(summary.total.questions).toBe(103);
        expect(summary.bySection).toHaveLength(9);
    });

    it('keeps former hard-gap questions in deterministic answerable states', () => {
        const baseline = [
            createAggregatePoint(1, { minted: stats(100_000), burned: stats(95_000), providers: stats(1_000), demand_served: stats(9_500), demand: stats(10_000), proCount: stats(600), mercenaryCount: stats(400), solvencyScore: stats(1.02) }),
            createAggregatePoint(2, { minted: stats(100_000), burned: stats(94_000), providers: stats(980), demand_served: stats(9_450), demand: stats(10_000), proCount: stats(590), mercenaryCount: stats(390), solvencyScore: stats(1.00) })
        ];
        const current = [
            createAggregatePoint(1, { minted: stats(110_000), burned: stats(88_000), providers: stats(900), demand_served: stats(9_400), demand: stats(10_000), proCount: stats(700), mercenaryCount: stats(200), solvencyScore: stats(0.92), churnCount: stats(35) }),
            createAggregatePoint(2, { minted: stats(112_000), burned: stats(86_000), providers: stats(840), demand_served: stats(9_350), demand: stats(10_000), proCount: stats(690), mercenaryCount: stats(150), solvencyScore: stats(0.88), churnCount: stats(40) })
        ];
        const context = buildContext(current, { baselineAggregated: baseline });

        ['B11', 'C8', 'C9', 'C11'].forEach((questionId) => {
            const answer = evaluateQuestion(questionId, context, QUESTION_REGISTRY);
            expect(answer.answerability).not.toBe('N');
            expect(answer.verdict).not.toBe('insufficient_data');
        });
    });

    it('keeps Onocoy primary-input gaps explicitly marked as N (M1-M3)', () => {
        const context = buildContext([
            createAggregatePoint(1),
            createAggregatePoint(2)
        ]);

        ['M1', 'M2', 'M3'].forEach((questionId) => {
            const answer = evaluateQuestion(questionId, context, QUESTION_REGISTRY);
            expect(answer.answerability).toBe('N');
            expect(answer.verdict).toBe('insufficient_data');
            expect(answer.reproducible).toBe(false);
        });
    });

    it('computes a deterministic verdict for subsidy dependency (A7)', () => {
        const subsidyContext = buildContext([
            createAggregatePoint(1, { solvencyScore: stats(0.82) })
        ]);
        const subsidyAnswer = evaluateQuestion('A7', subsidyContext);
        expect(subsidyAnswer.answerability).toBe('Y');
        expect(subsidyAnswer.verdict).toBe('yes');

        const solventContext = buildContext([
            createAggregatePoint(1, { solvencyScore: stats(1.25) })
        ]);
        const solventAnswer = evaluateQuestion('A7', solventContext);
        expect(solventAnswer.answerability).toBe('Y');
        expect(solventAnswer.verdict).toBe('no');
    });

    it('computes retention trend verdict for A4', () => {
        const stableContext = buildContext([
            createAggregatePoint(1, { providers: stats(1_000) }),
            createAggregatePoint(2, { providers: stats(995) }),
            createAggregatePoint(3, { providers: stats(994) })
        ]);
        const stableAnswer = evaluateQuestion('A4', stableContext);
        expect(stableAnswer.answerability).toBe('Y');
        expect(stableAnswer.verdict).toBe('yes');

        const degradingContext = buildContext([
            createAggregatePoint(1, { providers: stats(1_000) }),
            createAggregatePoint(2, { providers: stats(930) }),
            createAggregatePoint(3, { providers: stats(900) })
        ]);
        const degradingAnswer = evaluateQuestion('A4', degradingContext);
        expect(degradingAnswer.answerability).toBe('Y');
        expect(degradingAnswer.verdict).toBe('at_risk');
    });

    it('classifies stress regime for A1 from parameter pressure', () => {
        const context = buildContext(
            [createAggregatePoint(1)],
            { params: { competitorYield: 1.5, demandType: 'consistent' } }
        );
        const answer = evaluateQuestion('A1', context);
        expect(answer.answerability).toBe('Y');
        expect(answer.verdict).toBe('yes');
        expect(answer.summary).toContain('Competitive Yield Stress');
    });

    it('computes off-baseline metric deltas for A2 when baseline exists', () => {
        const current = [
            createAggregatePoint(1, {
                price: stats(0.7),
                providers: stats(900),
                solvencyScore: stats(0.9),
                utilization: stats(55),
                demand: stats(10_000),
                demand_served: stats(8_500)
            })
        ];
        const baseline = [
            createAggregatePoint(1, {
                price: stats(1),
                providers: stats(1_000),
                solvencyScore: stats(1.2),
                utilization: stats(65),
                demand: stats(10_000),
                demand_served: stats(9_700)
            })
        ];
        const answer = evaluateQuestion('A2', buildContext(current, { baselineAggregated: baseline }));
        expect(answer.answerability).toBe('Y');
        expect(answer.verdict).toBe('at_risk');
        expect(answer.summary).toContain('off baseline');
    });

    it('detects reward-demand misalignment for A8', () => {
        const misaligned = buildContext([
            createAggregatePoint(1, {
                demand: stats(10_000),
                demand_served: stats(7_200),
                utilization: stats(18),
                revenuePerCapacity: stats(0.25),
                costPerCapacity: stats(0.5),
                solvencyScore: stats(0.7)
            })
        ]);
        const misalignedAnswer = evaluateQuestion('A8', misaligned);
        expect(misalignedAnswer.answerability).toBe('Y');
        expect(misalignedAnswer.verdict).toBe('no');

        const aligned = buildContext([
            createAggregatePoint(1, {
                demand: stats(10_000),
                demand_served: stats(9_700),
                utilization: stats(50),
                revenuePerCapacity: stats(0.6),
                costPerCapacity: stats(0.45),
                solvencyScore: stats(1.15)
            })
        ]);
        const alignedAnswer = evaluateQuestion('A8', aligned);
        expect(alignedAnswer.answerability).toBe('Y');
        expect(alignedAnswer.verdict).toBe('yes');
    });

    it('estimates lag behavior for A9 after a price shock', () => {
        const context = buildContext([
            createAggregatePoint(1, { price: stats(1.0), churnCount: stats(10), providers: stats(1_000), capacity: stats(15_000) }),
            createAggregatePoint(2, { price: stats(0.98), churnCount: stats(10), providers: stats(995), capacity: stats(14_980) }),
            createAggregatePoint(3, { price: stats(0.78), churnCount: stats(10), providers: stats(990), capacity: stats(14_970) }),
            createAggregatePoint(4, { price: stats(0.76), churnCount: stats(25), providers: stats(970), capacity: stats(14_600) }),
            createAggregatePoint(5, { price: stats(0.74), churnCount: stats(30), providers: stats(940), capacity: stats(14_200) })
        ]);
        const answer = evaluateQuestion('A9', context);
        expect(answer.answerability).toBe('Y');
        expect(answer.verdict).toBe('yes');
    });

    it('orders leading indicators by first breach for A11', () => {
        const baseline = [
            createAggregatePoint(1, { price: stats(1.0), solvencyScore: stats(1.10), providers: stats(1_000), churnCount: stats(10), demand: stats(10_000), demand_served: stats(9_600), utilization: stats(62) }),
            createAggregatePoint(2, { price: stats(1.0), solvencyScore: stats(1.10), providers: stats(1_000), churnCount: stats(10), demand: stats(10_000), demand_served: stats(9_600), utilization: stats(62) }),
            createAggregatePoint(3, { price: stats(1.0), solvencyScore: stats(1.10), providers: stats(1_000), churnCount: stats(10), demand: stats(10_000), demand_served: stats(9_600), utilization: stats(62) }),
            createAggregatePoint(4, { price: stats(1.0), solvencyScore: stats(1.10), providers: stats(1_000), churnCount: stats(10), demand: stats(10_000), demand_served: stats(9_600), utilization: stats(62) })
        ];
        const stressed = [
            createAggregatePoint(1, { price: stats(0.89), solvencyScore: stats(1.02), providers: stats(995), churnCount: stats(12), demand: stats(10_000), demand_served: stats(9_500), utilization: stats(60) }),
            createAggregatePoint(2, { price: stats(0.84), solvencyScore: stats(0.98), providers: stats(970), churnCount: stats(20), demand: stats(10_000), demand_served: stats(9_100), utilization: stats(57) }),
            createAggregatePoint(3, { price: stats(0.80), solvencyScore: stats(0.90), providers: stats(940), churnCount: stats(26), demand: stats(10_000), demand_served: stats(8_800), utilization: stats(53) }),
            createAggregatePoint(4, { price: stats(0.78), solvencyScore: stats(0.86), providers: stats(915), churnCount: stats(30), demand: stats(10_000), demand_served: stats(8_500), utilization: stats(50) })
        ];

        const answer = evaluateQuestion('A11', buildContext(stressed, { baselineAggregated: baseline }));
        expect(answer.answerability).toBe('Y');
        expect(answer.verdict).toBe('yes');
        expect(answer.summary).toContain('Price');
        expect(answer.metrics.some((metric) => metric.id === 'first_leading_indicator')).toBe(true);
    });

    it('computes WoW and baseline change matrix for A12', () => {
        const current = [
            createAggregatePoint(1, { providers: stats(1_000), solvencyScore: stats(1.1), churnCount: stats(12) }),
            createAggregatePoint(2, { providers: stats(970), solvencyScore: stats(0.95), churnCount: stats(26) })
        ];
        const baseline = [
            createAggregatePoint(1, { providers: stats(1_000), solvencyScore: stats(1.15), churnCount: stats(10) }),
            createAggregatePoint(2, { providers: stats(990), solvencyScore: stats(1.1), churnCount: stats(12) })
        ];
        const answer = evaluateQuestion('A12', buildContext(current, { baselineAggregated: baseline }));
        expect(answer.answerability).toBe('Y');
        expect(answer.verdict).toBe('at_risk');
        expect(answer.metrics.some((metric) => metric.id === 'baseline_solvency_delta')).toBe(true);
    });

    it('returns death-spiral alert status for H10 and scenario proxy for B12', () => {
        const stressed = buildContext([
            createAggregatePoint(1, { price: stats(1.0), providers: stats(1_000), solvencyScore: stats(1.0), churnCount: stats(10) }),
            createAggregatePoint(2, { price: stats(0.75), providers: stats(900), solvencyScore: stats(0.8), churnCount: stats(60) }),
            createAggregatePoint(3, { price: stats(0.55), providers: stats(760), solvencyScore: stats(0.7), churnCount: stats(80) }),
            createAggregatePoint(4, { price: stats(0.45), providers: stats(650), solvencyScore: stats(0.65), churnCount: stats(90) })
        ]);

        const h10 = evaluateQuestion('H10', stressed);
        expect(h10.answerability).toBe('Y');
        expect(h10.verdict).toBe('at_risk');

        const b12 = evaluateQuestion('B12', stressed);
        expect(b12.answerability).toBe('P');
        expect(b12.metrics.find((metric) => metric.id === 'death_spiral_probability_pct')).toBeTruthy();
    });

    it('flags governance review and emergency triggers (C14/C15)', () => {
        const stressed = buildContext([
            createAggregatePoint(1, {
                solvencyScore: stats(0.82),
                providers: stats(1_000),
                churnCount: stats(72),
                demand: stats(10_000),
                demand_served: stats(7_100),
                minted: stats(100_000),
                price: stats(0.7)
            })
        ], {
            params: {
                providerCostPerWeek: 95
            }
        });

        const c14 = evaluateQuestion('C14', stressed);
        expect(c14.answerability).toBe('P');
        expect(c14.verdict).toBe('at_risk');

        const c15 = evaluateQuestion('C15', stressed);
        expect(c15.answerability).toBe('P');
        expect(c15.verdict).toBe('at_risk');
    });

    it('tracks solvency trajectory direction for C17', () => {
        const improving = buildContext([
            createAggregatePoint(1, { solvencyScore: stats(0.88) }),
            createAggregatePoint(2, { solvencyScore: stats(0.94) }),
            createAggregatePoint(3, { solvencyScore: stats(0.97) }),
            createAggregatePoint(4, { solvencyScore: stats(1.00) }),
            createAggregatePoint(5, { solvencyScore: stats(1.08) }),
            createAggregatePoint(6, { solvencyScore: stats(1.14) })
        ]);
        const improvingAnswer = evaluateQuestion('C17', improving);
        expect(improvingAnswer.answerability).toBe('Y');
        expect(improvingAnswer.verdict).toBe('yes');

        const worsening = buildContext([
            createAggregatePoint(1, { solvencyScore: stats(1.18) }),
            createAggregatePoint(2, { solvencyScore: stats(1.05) }),
            createAggregatePoint(3, { solvencyScore: stats(0.94) }),
            createAggregatePoint(4, { solvencyScore: stats(0.82) })
        ]);
        const worseningAnswer = evaluateQuestion('C17', worsening);
        expect(worseningAnswer.answerability).toBe('Y');
        expect(worseningAnswer.verdict).toBe('no');
    });

    it('compares intervention risk vs baseline for C18', () => {
        const intervention = [
            createAggregatePoint(1, { price: stats(1.0), providers: stats(1_000), solvencyScore: stats(1.1), churnCount: stats(10) }),
            createAggregatePoint(2, { price: stats(0.98), providers: stats(1_000), solvencyScore: stats(1.08), churnCount: stats(11) }),
            createAggregatePoint(3, { price: stats(0.96), providers: stats(995), solvencyScore: stats(1.05), churnCount: stats(12) }),
            createAggregatePoint(4, { price: stats(0.95), providers: stats(990), solvencyScore: stats(1.03), churnCount: stats(12) })
        ];
        const baseline = [
            createAggregatePoint(1, { price: stats(1.0), providers: stats(1_000), solvencyScore: stats(0.95), churnCount: stats(22) }),
            createAggregatePoint(2, { price: stats(0.78), providers: stats(900), solvencyScore: stats(0.8), churnCount: stats(65) }),
            createAggregatePoint(3, { price: stats(0.62), providers: stats(780), solvencyScore: stats(0.7), churnCount: stats(80) }),
            createAggregatePoint(4, { price: stats(0.50), providers: stats(700), solvencyScore: stats(0.65), churnCount: stats(85) })
        ];

        const answer = evaluateQuestion('C18', buildContext(intervention, {
            baselineAggregated: baseline
        }));
        expect(answer.answerability).toBe('P');
        expect(answer.verdict).toBe('yes');
    });

    it('attributes subsidy-gap widening between baseline and post-decision windows (C2)', () => {
        const baseline = [
            createAggregatePoint(1, { minted: stats(100_000), burned: stats(96_000), solvencyScore: stats(1.05) }),
            createAggregatePoint(2, { minted: stats(100_000), burned: stats(95_000), solvencyScore: stats(1.02) }),
            createAggregatePoint(3, { minted: stats(100_000), burned: stats(94_000), solvencyScore: stats(1.00) }),
            createAggregatePoint(4, { minted: stats(100_000), burned: stats(94_000), solvencyScore: stats(0.99) })
        ];
        const postDecision = [
            createAggregatePoint(1, { minted: stats(100_000), burned: stats(88_000), solvencyScore: stats(0.94) }),
            createAggregatePoint(2, { minted: stats(100_000), burned: stats(84_000), solvencyScore: stats(0.90) }),
            createAggregatePoint(3, { minted: stats(100_000), burned: stats(80_000), solvencyScore: stats(0.86) }),
            createAggregatePoint(4, { minted: stats(100_000), burned: stats(76_000), solvencyScore: stats(0.82) })
        ];

        const answer = evaluateQuestion('C2', buildContext(postDecision, { baselineAggregated: baseline }));
        expect(answer.answerability).toBe('P');
        expect(answer.verdict).toBe('yes');
        expect(answer.metrics.some((metric) => metric.id === 'subsidy_gap_delta_pp')).toBe(true);
    });

    it('estimates tier margins and ONO price sensitivity (D1/D2)', () => {
        const context = buildContext([
            createAggregatePoint(1, {
                providers: stats(1_000),
                proCount: stats(220),
                mercenaryCount: stats(780),
                minted: stats(100_000),
                price: stats(1.0)
            })
        ], {
            params: {
                providerCostPerWeek: 95,
                proTierEfficiency: 1.8
            }
        });

        const d1 = evaluateQuestion('D1', context);
        expect(d1.answerability).toBe('P');
        expect(d1.verdict).toBe('at_risk');

        const sensitiveContext = buildContext([
            createAggregatePoint(1, {
                providers: stats(1_000),
                minted: stats(100_000),
                price: stats(1.0)
            })
        ], {
            params: {
                providerCostPerWeek: 99
            }
        });
        const d2 = evaluateQuestion('D2', sensitiveContext);
        expect(d2.answerability).toBe('P');
        expect(d2.verdict).toBe('yes');
    });

    it('computes churn-risk breakpoints and downside participation (D3/D12)', () => {
        const highRisk = buildContext([
            createAggregatePoint(1, {
                providers: stats(1_000),
                minted: stats(70_000),
                price: stats(1.0),
                churnCount: stats(55),
                solvencyScore: stats(0.82)
            }),
            createAggregatePoint(2, {
                providers: stats(940),
                minted: stats(70_000),
                price: stats(0.9),
                churnCount: stats(70),
                solvencyScore: stats(0.78)
            }),
            createAggregatePoint(3, {
                providers: stats(860),
                minted: stats(70_000),
                price: stats(0.8),
                churnCount: stats(85),
                solvencyScore: stats(0.74)
            })
        ], {
            params: {
                providerCostPerWeek: 80,
                churnThreshold: 10
            }
        });

        const d3 = evaluateQuestion('D3', highRisk);
        expect(d3.answerability).toBe('P');
        expect(d3.verdict).toBe('at_risk');

        const d12 = evaluateQuestion('D12', highRisk);
        expect(d12.answerability).toBe('P');
        expect(['at_risk', 'no']).toContain(d12.verdict);
    });

    it('evaluates emissions rigidity and reward-usage tracking (B1/B2)', () => {
        const context = buildContext([
            createAggregatePoint(1, {
                demand: stats(12_000),
                demand_served: stats(11_000),
                minted: stats(120_000)
            }),
            createAggregatePoint(2, {
                demand: stats(10_000),
                demand_served: stats(8_000),
                minted: stats(120_000)
            }),
            createAggregatePoint(3, {
                demand: stats(8_000),
                demand_served: stats(6_000),
                minted: stats(120_000)
            })
        ], {
            params: {
                emissionModel: 'fixed'
            }
        });

        const b1 = evaluateQuestion('B1', context);
        expect(b1.answerability).toBe('P');
        expect(b1.verdict).toBe('at_risk');

        const b2 = evaluateQuestion('B2', context);
        expect(b2.answerability).toBe('P');
        expect(b2.verdict).toBe('no');
    });

    it('measures contraction deterioration speed and shock-to-churn lag (B3/B9)', () => {
        const context = buildContext([
            createAggregatePoint(1, { price: stats(1.0), demand: stats(10_000), solvencyScore: stats(1.2), churnCount: stats(5), providers: stats(1_000), capacity: stats(15_000) }),
            createAggregatePoint(2, { price: stats(0.98), demand: stats(9_500), solvencyScore: stats(1.15), churnCount: stats(5), providers: stats(1_000), capacity: stats(15_000) }),
            createAggregatePoint(3, { price: stats(0.75), demand: stats(8_000), solvencyScore: stats(1.0), churnCount: stats(6), providers: stats(990), capacity: stats(14_900) }),
            createAggregatePoint(4, { price: stats(0.73), demand: stats(7_000), solvencyScore: stats(0.9), churnCount: stats(20), providers: stats(940), capacity: stats(14_200) }),
            createAggregatePoint(5, { price: stats(0.72), demand: stats(6_500), solvencyScore: stats(0.8), churnCount: stats(25), providers: stats(900), capacity: stats(13_900) })
        ]);

        const b3 = evaluateQuestion('B3', context);
        expect(b3.answerability).toBe('Y');
        expect(b3.verdict).toBe('at_risk');

        const b9 = evaluateQuestion('B9', context);
        expect(b9.answerability).toBe('P');
        expect(b9.verdict).toBe('yes');
    });

    it('scores solvency sensitivity and required margin floor (B5/B6)', () => {
        const context = buildContext([
            createAggregatePoint(1, { minted: stats(60_000), price: stats(1.0), providers: stats(1_000), churnCount: stats(10) }),
            createAggregatePoint(2, { minted: stats(60_000), price: stats(1.0), providers: stats(1_000), churnCount: stats(30) })
        ], {
            params: {
                providerCostPerWeek: 120,
                burnPct: 0.1,
                churnThreshold: 10
            }
        });

        const b5 = evaluateQuestion('B5', context);
        expect(b5.answerability).toBe('P');
        expect(b5.verdict).toBe('at_risk');

        const b6 = evaluateQuestion('B6', context);
        expect(b6.answerability).toBe('P');
        expect(b6.verdict).toBe('at_risk');
    });

    it('evaluates commitment-tier quality and governance protection (B14/C10)', () => {
        const context = buildContext([
            createAggregatePoint(1, { proCount: stats(400), mercenaryCount: stats(600), providers: stats(1_000), minted: stats(120_000), price: stats(2.0) }),
            createAggregatePoint(2, { proCount: stats(390), mercenaryCount: stats(500), providers: stats(890), minted: stats(120_000), price: stats(2.0) }),
            createAggregatePoint(3, { proCount: stats(385), mercenaryCount: stats(420), providers: stats(805), minted: stats(120_000), price: stats(2.0) })
        ], {
            params: {
                providerCostPerWeek: 90,
                proTierEfficiency: 2.0
            }
        });

        const b14 = evaluateQuestion('B14', context);
        expect(b14.answerability).toBe('P');
        expect(b14.verdict).toBe('yes');

        const c10 = evaluateQuestion('C10', context);
        expect(c10.answerability).toBe('Y');
        expect(c10.verdict).toBe('yes');
    });

    it('classifies objective bias and no-intervention risk signatures (B15/B17/C5/C16)', () => {
        const context = buildContext([
            createAggregatePoint(1, {
                price: stats(2.0),
                minted: stats(200_000),
                providers: stats(1_000),
                demand: stats(10_000),
                demand_served: stats(9_900),
                solvencyScore: stats(1.2),
                churnCount: stats(10)
            }),
            createAggregatePoint(2, {
                price: stats(1.2),
                minted: stats(180_000),
                providers: stats(900),
                demand: stats(9_800),
                demand_served: stats(9_700),
                solvencyScore: stats(0.95),
                churnCount: stats(40)
            }),
            createAggregatePoint(3, {
                price: stats(0.8),
                minted: stats(170_000),
                providers: stats(750),
                demand: stats(9_600),
                demand_served: stats(9_500),
                solvencyScore: stats(0.7),
                churnCount: stats(70)
            })
        ]);

        const b15 = evaluateQuestion('B15', context);
        expect(b15.answerability).toBe('P');
        expect(b15.verdict).toBe('no');

        const b17 = evaluateQuestion('B17', context);
        expect(b17.answerability).toBe('P');
        expect(b17.verdict).toBe('at_risk');

        const c5 = evaluateQuestion('C5', context);
        expect(c5.answerability).toBe('Y');
        expect(c5.verdict).toBe('yes');

        const c16 = evaluateQuestion('C16', context);
        expect(c16.answerability).toBe('Y');
        expect(c16.verdict).toBe('yes');
    });

    it('evaluates proposal robustness and policy-lever directionality (B13/B18/C12/C13)', () => {
        const proposal = [
            createAggregatePoint(1, { price: stats(1.0), providers: stats(1_000), solvencyScore: stats(1.05), churnCount: stats(12), demand_served: stats(8_200), minted: stats(100_000) }),
            createAggregatePoint(2, { price: stats(0.98), providers: stats(990), solvencyScore: stats(1.08), churnCount: stats(12), demand_served: stats(8_700), minted: stats(100_000) }),
            createAggregatePoint(3, { price: stats(0.97), providers: stats(985), solvencyScore: stats(1.12), churnCount: stats(11), demand_served: stats(9_000), minted: stats(100_000) }),
            createAggregatePoint(4, { price: stats(0.96), providers: stats(980), solvencyScore: stats(1.15), churnCount: stats(11), demand_served: stats(9_200), minted: stats(100_000) })
        ];
        const baseline = [
            createAggregatePoint(1, { price: stats(1.0), providers: stats(1_000), solvencyScore: stats(0.9), churnCount: stats(25), demand_served: stats(8_000), minted: stats(110_000) }),
            createAggregatePoint(2, { price: stats(0.82), providers: stats(900), solvencyScore: stats(0.78), churnCount: stats(60), demand_served: stats(7_500), minted: stats(110_000) }),
            createAggregatePoint(3, { price: stats(0.70), providers: stats(820), solvencyScore: stats(0.72), churnCount: stats(70), demand_served: stats(7_300), minted: stats(110_000) }),
            createAggregatePoint(4, { price: stats(0.62), providers: stats(760), solvencyScore: stats(0.69), churnCount: stats(75), demand_served: stats(7_100), minted: stats(110_000) })
        ];

        const context = buildContext(proposal, {
            baselineAggregated: baseline,
            params: {
                emissionModel: 'fixed'
            }
        });

        const b18 = evaluateQuestion('B18', context);
        expect(b18.answerability).toBe('P');
        expect(b18.verdict).toBe('yes');

        const b13 = evaluateQuestion('B13', context);
        expect(b13.answerability).toBe('P');
        expect(b13.verdict).toBe('yes');

        const c12 = evaluateQuestion('C12', context);
        expect(c12.answerability).toBe('P');
        expect(c12.verdict).toBe('yes');

        const c13 = evaluateQuestion('C13', context);
        expect(c13.answerability).toBe('Y');
        expect(c13.verdict).toBe('yes');
    });

    it('projects bonus-extension outcomes and governance concentration proxies (B11/C8/C9/C11)', () => {
        const baseline = [
            createAggregatePoint(1, { price: stats(1.0), providers: stats(1_000), solvencyScore: stats(1.08), churnCount: stats(10), minted: stats(100_000), burned: stats(95_000), demand: stats(10_000), demand_served: stats(9_700), proCount: stats(650), mercenaryCount: stats(350) }),
            createAggregatePoint(2, { price: stats(0.98), providers: stats(990), solvencyScore: stats(1.05), churnCount: stats(12), minted: stats(100_000), burned: stats(94_000), demand: stats(10_000), demand_served: stats(9_680), proCount: stats(645), mercenaryCount: stats(345) }),
            createAggregatePoint(3, { price: stats(0.97), providers: stats(980), solvencyScore: stats(1.04), churnCount: stats(12), minted: stats(100_000), burned: stats(94_000), demand: stats(10_000), demand_served: stats(9_670), proCount: stats(640), mercenaryCount: stats(340) }),
            createAggregatePoint(4, { price: stats(0.96), providers: stats(970), solvencyScore: stats(1.03), churnCount: stats(13), minted: stats(100_000), burned: stats(93_000), demand: stats(10_000), demand_served: stats(9_650), proCount: stats(635), mercenaryCount: stats(335) })
        ];
        const current = [
            createAggregatePoint(1, { price: stats(1.0), providers: stats(1_000), solvencyScore: stats(1.00), churnCount: stats(20), minted: stats(110_000), burned: stats(86_000), demand: stats(10_000), demand_served: stats(9_800), proCount: stats(760), mercenaryCount: stats(240) }),
            createAggregatePoint(2, { price: stats(0.82), providers: stats(700), solvencyScore: stats(0.90), churnCount: stats(45), minted: stats(115_000), burned: stats(83_000), demand: stats(10_000), demand_served: stats(9_800), proCount: stats(640), mercenaryCount: stats(60) }),
            createAggregatePoint(3, { price: stats(0.68), providers: stats(450), solvencyScore: stats(0.82), churnCount: stats(60), minted: stats(118_000), burned: stats(80_000), demand: stats(10_000), demand_served: stats(9_800), proCount: stats(420), mercenaryCount: stats(30) }),
            createAggregatePoint(4, { price: stats(0.60), providers: stats(300), solvencyScore: stats(0.76), churnCount: stats(72), minted: stats(120_000), burned: stats(77_000), demand: stats(10_000), demand_served: stats(9_800), proCount: stats(280), mercenaryCount: stats(20) })
        ];
        const context = buildContext(current, {
            baselineAggregated: baseline
        });

        const b11 = evaluateQuestion('B11', context);
        expect(b11.answerability).toBe('P');
        expect(b11.metrics.some((metric) => metric.id === 'ext12_subsidy_gap_delta_pp')).toBe(true);

        const c11 = evaluateQuestion('C11', context);
        expect(c11.answerability).toBe('P');
        expect(c11.metrics.some((metric) => metric.id === 'ext12_projected_solvency')).toBe(true);

        const c8 = evaluateQuestion('C8', context);
        expect(c8.answerability).toBe('P');
        expect(c8.verdict).toBe('yes');

        const c9 = evaluateQuestion('C9', context);
        expect(c9.answerability).toBe('P');
        expect(c9.verdict).toBe('yes');
        expect(c9.metrics.some((metric) => metric.id === 'centralization_proxy_score')).toBe(true);
    });

    it('covers remaining builder/governance/user/comparative evaluators (B4/B7/B8/B10/B16/C1/C3/C4/C7/E1/E2/E3/E8/G1/G4/G6)', () => {
        const baseline = [
            createAggregatePoint(1, { price: stats(1.0), providers: stats(1_000), capacity: stats(15_000), churnCount: stats(10), solvencyScore: stats(1.08), minted: stats(100_000), burned: stats(95_000), demand: stats(10_000), demand_served: stats(9_700), proCount: stats(650), mercenaryCount: stats(350) }),
            createAggregatePoint(2, { price: stats(0.99), providers: stats(995), capacity: stats(14_980), churnCount: stats(11), solvencyScore: stats(1.06), minted: stats(100_000), burned: stats(94_500), demand: stats(10_000), demand_served: stats(9_700), proCount: stats(648), mercenaryCount: stats(347) }),
            createAggregatePoint(3, { price: stats(0.98), providers: stats(990), capacity: stats(14_960), churnCount: stats(12), solvencyScore: stats(1.04), minted: stats(100_000), burned: stats(94_000), demand: stats(10_000), demand_served: stats(9_680), proCount: stats(646), mercenaryCount: stats(344) }),
            createAggregatePoint(4, { price: stats(0.97), providers: stats(985), capacity: stats(14_940), churnCount: stats(12), solvencyScore: stats(1.03), minted: stats(100_000), burned: stats(93_500), demand: stats(10_000), demand_served: stats(9_670), proCount: stats(644), mercenaryCount: stats(341) }),
            createAggregatePoint(5, { price: stats(0.96), providers: stats(980), capacity: stats(14_920), churnCount: stats(13), solvencyScore: stats(1.02), minted: stats(100_000), burned: stats(93_000), demand: stats(10_000), demand_served: stats(9_660), proCount: stats(642), mercenaryCount: stats(338) }),
            createAggregatePoint(6, { price: stats(0.95), providers: stats(975), capacity: stats(14_900), churnCount: stats(13), solvencyScore: stats(1.01), minted: stats(100_000), burned: stats(93_000), demand: stats(10_000), demand_served: stats(9_650), proCount: stats(640), mercenaryCount: stats(335) })
        ];
        const stressed = [
            createAggregatePoint(1, { price: stats(1.0), providers: stats(1_000), capacity: stats(15_000), churnCount: stats(12), solvencyScore: stats(1.00), minted: stats(110_000), burned: stats(90_000), demand: stats(10_000), demand_served: stats(9_800), proCount: stats(700), mercenaryCount: stats(300) }),
            createAggregatePoint(2, { price: stats(0.90), providers: stats(930), capacity: stats(14_900), churnCount: stats(12), solvencyScore: stats(0.95), minted: stats(112_000), burned: stats(88_000), demand: stats(10_000), demand_served: stats(9_750), proCount: stats(670), mercenaryCount: stats(260) }),
            createAggregatePoint(3, { price: stats(0.78), providers: stats(820), capacity: stats(14_500), churnCount: stats(30), solvencyScore: stats(0.88), minted: stats(115_000), burned: stats(85_000), demand: stats(10_000), demand_served: stats(9_700), proCount: stats(620), mercenaryCount: stats(200) }),
            createAggregatePoint(4, { price: stats(0.72), providers: stats(720), capacity: stats(14_000), churnCount: stats(42), solvencyScore: stats(0.82), minted: stats(118_000), burned: stats(82_000), demand: stats(10_000), demand_served: stats(9_650), proCount: stats(560), mercenaryCount: stats(160) }),
            createAggregatePoint(5, { price: stats(0.68), providers: stats(640), capacity: stats(13_300), churnCount: stats(50), solvencyScore: stats(0.78), minted: stats(120_000), burned: stats(80_000), demand: stats(10_000), demand_served: stats(9_600), proCount: stats(500), mercenaryCount: stats(140) }),
            createAggregatePoint(6, { price: stats(0.64), providers: stats(580), capacity: stats(12_600), churnCount: stats(55), solvencyScore: stats(0.74), minted: stats(122_000), burned: stats(78_000), demand: stats(10_000), demand_served: stats(9_550), proCount: stats(460), mercenaryCount: stats(120) })
        ];

        const context = buildContext(stressed, {
            baselineAggregated: baseline,
            params: {
                competitorYield: 1.2,
                providerCostPerWeek: 75,
                initialLiquidity: 500_000,
                investorSellPct: 0.25
            }
        });

        const checks: Array<{ id: string; metricId?: string }> = [
            { id: 'B4', metricId: 'top_churn_sensitivity_parameter' },
            { id: 'B7', metricId: 'first_failing_tier' },
            { id: 'B8', metricId: 'required_liquidity_usd' },
            { id: 'B10', metricId: 'lag_churn_to_capacity_weeks' },
            { id: 'B16', metricId: 'robust_dimensions_improved' },
            { id: 'C1', metricId: 'governance_archetype' },
            { id: 'C3', metricId: 'late_retention_pct' },
            { id: 'C4', metricId: 'reward_output_tracking_gap_pp' },
            { id: 'C7', metricId: 'price_drawdown_pct' },
            { id: 'E1', metricId: 'churn_pressure_active' },
            { id: 'E2', metricId: 'capacity_buffer_pct' },
            { id: 'E3', metricId: 'providers_delta_wow_pct' },
            { id: 'E8', metricId: 'reliability_index_delta' },
            { id: 'G1', metricId: 'comparative_profile_score' },
            { id: 'G4', metricId: 'competitor_yield_x' },
            { id: 'G6', metricId: 'retention_gap_pp' }
        ];

        checks.forEach(({ id, metricId }) => {
            const answer = evaluateQuestion(id, context);
            expect(answer.answerability).toBe('P');
            expect(['yes', 'no', 'at_risk']).toContain(answer.verdict);
            if (metricId) {
                expect(answer.metrics.some((metric) => metric.id === metricId)).toBe(true);
            }
        });
    });

    it('evaluates provider comparative, sustainability, and quality-linked views (D4-D10)', () => {
        const current = [
            createAggregatePoint(1, {
                providers: stats(1_000),
                proCount: stats(220),
                mercenaryCount: stats(780),
                minted: stats(100_000),
                price: stats(1.0),
                solvencyScore: stats(1.12),
                demand: stats(10_000),
                demand_served: stats(9_600),
                costPerCapacity: stats(0.4),
                revenuePerCapacity: stats(0.5),
                churnCount: stats(14)
            }),
            createAggregatePoint(2, {
                providers: stats(980),
                proCount: stats(215),
                mercenaryCount: stats(765),
                minted: stats(95_000),
                price: stats(0.95),
                solvencyScore: stats(1.05),
                demand: stats(9_800),
                demand_served: stats(9_250),
                costPerCapacity: stats(0.42),
                revenuePerCapacity: stats(0.48),
                churnCount: stats(28)
            })
        ];
        const baseline = [
            createAggregatePoint(1, {
                providers: stats(1_000),
                minted: stats(80_000),
                price: stats(1.0),
                solvencyScore: stats(0.92),
                demand: stats(10_000),
                demand_served: stats(9_100)
            }),
            createAggregatePoint(2, {
                providers: stats(940),
                minted: stats(78_000),
                price: stats(0.92),
                solvencyScore: stats(0.88),
                demand: stats(9_800),
                demand_served: stats(8_900)
            })
        ];

        const compareContext = buildContext(current, {
            baselineAggregated: baseline,
            params: {
                providerCostPerWeek: 80,
                proTierEfficiency: 1.8
            }
        });

        const d4 = evaluateQuestion('D4', compareContext);
        expect(d4.answerability).toBe('Y');
        expect(d4.verdict).toBe('yes');

        const d5 = evaluateQuestion('D5', compareContext);
        expect(d5.answerability).toBe('P');
        expect(['yes', 'at_risk', 'no']).toContain(d5.verdict);

        const d7 = evaluateQuestion('D7', compareContext);
        expect(d7.answerability).toBe('Y');
        expect(['yes', 'at_risk']).toContain(d7.verdict);

        const d8 = evaluateQuestion('D8', compareContext);
        expect(d8.answerability).toBe('P');
        expect(['yes', 'at_risk', 'no']).toContain(d8.verdict);

        const d9 = evaluateQuestion('D9', compareContext);
        expect(d9.answerability).toBe('P');
        expect(['yes', 'at_risk']).toContain(d9.verdict);

        const d10 = evaluateQuestion('D10', compareContext);
        expect(d10.answerability).toBe('P');
        expect(['yes', 'at_risk']).toContain(d10.verdict);

        const costShockContext = buildContext([
            createAggregatePoint(1, {
                providers: stats(1_000),
                proCount: stats(200),
                mercenaryCount: stats(800),
                minted: stats(100_000),
                price: stats(1.0)
            })
        ], {
            params: {
                providerCostPerWeek: 95,
                proTierEfficiency: 2.0
            }
        });

        const d6 = evaluateQuestion('D6', costShockContext);
        expect(d6.answerability).toBe('P');
        expect(['at_risk', 'no', 'yes']).toContain(d6.verdict);
    });

    it('evaluates user-facing service resilience signals (E4-E7)', () => {
        const stressContext = buildContext([
            createAggregatePoint(1, {
                price: stats(1.0),
                providers: stats(1_000),
                proCount: stats(300),
                mercenaryCount: stats(700),
                demand: stats(10_000),
                demand_served: stats(9_300),
                solvencyScore: stats(1.05),
                churnCount: stats(12)
            }),
            createAggregatePoint(2, {
                price: stats(0.74),
                providers: stats(930),
                proCount: stats(295),
                mercenaryCount: stats(635),
                demand: stats(9_900),
                demand_served: stats(8_300),
                solvencyScore: stats(0.9),
                churnCount: stats(40)
            }),
            createAggregatePoint(3, {
                price: stats(0.66),
                providers: stats(860),
                proCount: stats(290),
                mercenaryCount: stats(570),
                demand: stats(9_700),
                demand_served: stats(7_900),
                solvencyScore: stats(0.82),
                churnCount: stats(55)
            })
        ], {
            params: {
                investorSellPct: 0.35,
                providerCostPerWeek: 85,
                proTierEfficiency: 1.6
            }
        });

        const e4 = evaluateQuestion('E4', stressContext);
        expect(e4.answerability).toBe('P');
        expect(e4.verdict).toBe('at_risk');

        const e5 = evaluateQuestion('E5', stressContext);
        expect(e5.answerability).toBe('P');
        expect(['at_risk', 'no']).toContain(e5.verdict);

        const e6 = evaluateQuestion('E6', stressContext);
        expect(e6.answerability).toBe('P');
        expect(['at_risk', 'no']).toContain(e6.verdict);

        const e7 = evaluateQuestion('E7', stressContext);
        expect(e7.answerability).toBe('P');
        expect(['yes', 'at_risk', 'no']).toContain(e7.verdict);
    });

    it('evaluates comparative robustness and signature timing (G2/G3/G5/G7/G8)', () => {
        const comparativeStress = buildContext([
            createAggregatePoint(1, {
                price: stats(1.0),
                demand: stats(10_000),
                demand_served: stats(9_400),
                providers: stats(1_000),
                solvencyScore: stats(1.05),
                churnCount: stats(10),
                supply: stats(1_000_000),
                minted: stats(80_000)
            }),
            createAggregatePoint(2, {
                price: stats(0.75),
                demand: stats(8_200),
                demand_served: stats(7_400),
                providers: stats(900),
                solvencyScore: stats(0.86),
                churnCount: stats(48),
                supply: stats(1_010_000),
                minted: stats(75_000)
            }),
            createAggregatePoint(3, {
                price: stats(0.65),
                demand: stats(7_000),
                demand_served: stats(6_100),
                providers: stats(820),
                solvencyScore: stats(0.78),
                churnCount: stats(62),
                supply: stats(1_020_000),
                minted: stats(70_000)
            })
        ], {
            params: {
                investorSellPct: 0.3,
                providerCostPerWeek: 85
            }
        });

        const g2 = evaluateQuestion('G2', comparativeStress);
        expect(g2.answerability).toBe('P');
        expect(['at_risk', 'no']).toContain(g2.verdict);

        const g3 = evaluateQuestion('G3', comparativeStress);
        expect(g3.answerability).toBe('P');
        expect(['at_risk', 'no']).toContain(g3.verdict);

        const g5 = evaluateQuestion('G5', comparativeStress);
        expect(g5.answerability).toBe('P');
        expect(['at_risk', 'no']).toContain(g5.verdict);

        const g7 = evaluateQuestion('G7', comparativeStress);
        expect(g7.answerability).toBe('P');
        expect(g7.verdict).toBe('at_risk');

        const antiDilutionTradeoff = buildContext([
            createAggregatePoint(1, {
                price: stats(1.0),
                supply: stats(2_000_000),
                minted: stats(6_000),
                solvencyScore: stats(1.15),
                demand: stats(10_000),
                demand_served: stats(8_600),
                utilization: stats(88)
            })
        ]);
        const g8 = evaluateQuestion('G8', antiDilutionTradeoff);
        expect(g8.answerability).toBe('P');
        expect(['yes', 'at_risk']).toContain(g8.verdict);
    });

    it('evaluates researcher-readability and methodology diagnostics (F1-F14)', () => {
        const current = [
            createAggregatePoint(1, {
                price: stats(1.0),
                providers: stats(1_000),
                solvencyScore: stats(1.1),
                demand_served: stats(9_500),
                churnCount: stats(10),
                proCount: stats(320),
                mercenaryCount: stats(680)
            }),
            createAggregatePoint(2, {
                price: stats(0.9),
                providers: stats(960),
                solvencyScore: stats(0.98),
                demand_served: stats(8_900),
                churnCount: stats(35),
                proCount: stats(315),
                mercenaryCount: stats(645)
            }),
            createAggregatePoint(3, {
                price: stats(0.82),
                providers: stats(920),
                solvencyScore: stats(0.92),
                demand_served: stats(8_300),
                churnCount: stats(42),
                proCount: stats(305),
                mercenaryCount: stats(615)
            })
        ];
        const baseline = [
            createAggregatePoint(1, { price: stats(1.0), providers: stats(1_000), solvencyScore: stats(1.2), demand_served: stats(9_600), churnCount: stats(8) }),
            createAggregatePoint(2, { price: stats(1.02), providers: stats(1_005), solvencyScore: stats(1.18), demand_served: stats(9_700), churnCount: stats(8) }),
            createAggregatePoint(3, { price: stats(1.03), providers: stats(1_010), solvencyScore: stats(1.16), demand_served: stats(9_750), churnCount: stats(9) })
        ];

        const context = buildContext(current, {
            baselineAggregated: baseline,
            params: {
                seed: 1337,
                nSims: 32,
                T: 52,
                demandType: 'growth'
            }
        });

        const f1 = evaluateQuestion('F1', context);
        expect(f1.answerability).toBe('Y');
        expect(f1.verdict).toBe('yes');

        const f2 = evaluateQuestion('F2', context);
        expect(f2.answerability).toBe('Y');
        expect(f2.verdict).toBe('yes');

        const f3 = evaluateQuestion('F3', context);
        expect(f3.answerability).toBe('P');
        expect(['yes', 'at_risk']).toContain(f3.verdict);

        const f4 = evaluateQuestion('F4', context);
        expect(f4.answerability).toBe('Y');
        expect(f4.verdict).toBe('yes');

        const f5 = evaluateQuestion('F5', context);
        expect(f5.answerability).toBe('Y');
        expect(f5.verdict).toBe('yes');

        const f6 = evaluateQuestion('F6', context);
        expect(f6.answerability).toBe('P');
        expect(['yes', 'at_risk']).toContain(f6.verdict);

        const f7 = evaluateQuestion('F7', context);
        expect(f7.answerability).toBe('P');
        expect(f7.verdict).toBe('yes');

        const f8 = evaluateQuestion('F8', context);
        expect(f8.answerability).toBe('Y');
        expect(f8.verdict).toBe('yes');

        const f9 = evaluateQuestion('F9', context);
        expect(f9.answerability).toBe('P');
        expect(['yes', 'at_risk']).toContain(f9.verdict);

        const f10 = evaluateQuestion('F10', context);
        expect(f10.answerability).toBe('Y');
        expect(f10.verdict).toBe('yes');

        const f11 = evaluateQuestion('F11', context);
        expect(f11.answerability).toBe('P');
        expect(['yes', 'at_risk']).toContain(f11.verdict);

        const f12 = evaluateQuestion('F12', context);
        expect(f12.answerability).toBe('P');
        expect(['yes', 'at_risk']).toContain(f12.verdict);

        const f13 = evaluateQuestion('F13', context);
        expect(f13.answerability).toBe('P');
        expect(['yes', 'at_risk']).toContain(f13.verdict);

        const f14 = evaluateQuestion('F14', context);
        expect(f14.answerability).toBe('P');
        expect(f14.verdict).toBe('yes');
    });

    it('evaluates treasury-risk diagnostics (H1-H9)', () => {
        const stressed = [
            createAggregatePoint(1, {
                price: stats(1.0),
                supply: stats(1_000_000),
                minted: stats(90_000),
                burned: stats(70_000),
                providers: stats(1_000),
                churnCount: stats(10),
                solvencyScore: stats(1.05),
                dailyMintUsd: stats(10_000),
                dailyBurnUsd: stats(8_500),
                treasuryBalance: stats(220_000),
                underwaterCount: stats(180)
            }),
            createAggregatePoint(2, {
                price: stats(0.72),
                supply: stats(1_010_000),
                minted: stats(95_000),
                burned: stats(55_000),
                providers: stats(950),
                churnCount: stats(40),
                solvencyScore: stats(0.86),
                dailyMintUsd: stats(13_000),
                dailyBurnUsd: stats(7_500),
                treasuryBalance: stats(210_000),
                underwaterCount: stats(260)
            }),
            createAggregatePoint(3, {
                price: stats(0.58),
                supply: stats(1_025_000),
                minted: stats(100_000),
                burned: stats(45_000),
                providers: stats(870),
                churnCount: stats(62),
                solvencyScore: stats(0.78),
                dailyMintUsd: stats(14_500),
                dailyBurnUsd: stats(7_000),
                treasuryBalance: stats(195_000),
                underwaterCount: stats(340)
            })
        ];
        const baseline = [
            createAggregatePoint(1, { price: stats(1.0), providers: stats(1_000), solvencyScore: stats(1.2), churnCount: stats(8), minted: stats(80_000), burned: stats(82_000) }),
            createAggregatePoint(2, { price: stats(1.02), providers: stats(1_010), solvencyScore: stats(1.18), churnCount: stats(8), minted: stats(78_000), burned: stats(84_000) }),
            createAggregatePoint(3, { price: stats(1.03), providers: stats(1_015), solvencyScore: stats(1.16), churnCount: stats(9), minted: stats(76_000), burned: stats(85_000) })
        ];

        const context = buildContext(stressed, {
            baselineAggregated: baseline,
            params: {
                investorSellPct: 0.35,
                initialLiquidity: 120_000,
                providerCostPerWeek: 95
            }
        });

        const h1 = evaluateQuestion('H1', context);
        expect(h1.answerability).toBe('Y');
        expect(['at_risk', 'yes']).toContain(h1.verdict);

        const h2 = evaluateQuestion('H2', context);
        expect(h2.answerability).toBe('Y');
        expect(['no', 'at_risk', 'yes']).toContain(h2.verdict);

        const h3 = evaluateQuestion('H3', context);
        expect(h3.answerability).toBe('Y');
        expect(h3.verdict).toBe('at_risk');

        const h4 = evaluateQuestion('H4', context);
        expect(h4.answerability).toBe('P');
        expect(['at_risk', 'no']).toContain(h4.verdict);

        const h5 = evaluateQuestion('H5', context);
        expect(h5.answerability).toBe('P');
        expect(['yes', 'no']).toContain(h5.verdict);

        const h6 = evaluateQuestion('H6', context);
        expect(h6.answerability).toBe('P');
        expect(['at_risk', 'no']).toContain(h6.verdict);

        const h7 = evaluateQuestion('H7', context);
        expect(h7.answerability).toBe('P');
        expect(['yes', 'at_risk', 'no']).toContain(h7.verdict);

        const h8 = evaluateQuestion('H8', context);
        expect(h8.answerability).toBe('P');
        expect(['yes', 'at_risk', 'no']).toContain(h8.verdict);

        const h9 = evaluateQuestion('H9', context);
        expect(h9.answerability).toBe('Y');
        expect(['at_risk', 'no']).toContain(h9.verdict);
    });
});
