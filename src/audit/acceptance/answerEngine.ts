import { ACCEPTANCE_QUESTION_IDS, QUESTION_REGISTRY } from './questionRegistry';
import type {
    AnswerContext,
    AnswerabilityGrade,
    QuestionAnswer,
    QuestionDefinition,
    QuestionId
} from './types';

export interface CoverageSectionSummary {
    section: string;
    questions: number;
    y: number;
    p: number;
    n: number;
    directCoveragePct: number;
    practicalCoveragePct: number;
    pass80Practical: boolean;
}

export interface CoverageSummary {
    total: CoverageSectionSummary;
    bySection: CoverageSectionSummary[];
}

function toGradeCounter(answers: QuestionAnswer[]) {
    const counts: Record<AnswerabilityGrade, number> = { Y: 0, P: 0, N: 0 };
    answers.forEach((answer) => {
        counts[answer.answerability] += 1;
    });
    return counts;
}

function buildSectionSummary(section: string, answers: QuestionAnswer[]): CoverageSectionSummary {
    const counts = toGradeCounter(answers);
    const questions = answers.length;
    const directCoveragePct = questions > 0 ? (counts.Y / questions) * 100 : 0;
    const practicalCoveragePct = questions > 0 ? ((counts.Y + (0.5 * counts.P)) / questions) * 100 : 0;
    return {
        section,
        questions,
        y: counts.Y,
        p: counts.P,
        n: counts.N,
        directCoveragePct,
        practicalCoveragePct,
        pass80Practical: practicalCoveragePct >= 80
    };
}

export function evaluateQuestion(
    questionId: QuestionId,
    context: AnswerContext,
    registry: Record<QuestionId, QuestionDefinition> = QUESTION_REGISTRY
): QuestionAnswer {
    const definition = registry[questionId];
    if (!definition) {
        return {
            questionId,
            answerability: 'N',
            verdict: 'insufficient_data',
            summary: `Question ${questionId} is not registered.`,
            window: 'N/A',
            thresholds: [],
            metrics: [],
            evidence: [],
            reproducible: false,
            confidence: 0
        };
    }

    try {
        return definition.evaluator(context);
    } catch (error) {
        return {
            questionId,
            answerability: 'N',
            verdict: 'insufficient_data',
            summary: `Evaluator failed for ${questionId}: ${(error as Error).message}`,
            window: 'N/A',
            thresholds: [],
            metrics: [],
            evidence: [],
            reproducible: false,
            confidence: 0
        };
    }
}

export function evaluateQuestions(
    questionIds: QuestionId[],
    context: AnswerContext,
    registry: Record<QuestionId, QuestionDefinition> = QUESTION_REGISTRY
): QuestionAnswer[] {
    return questionIds.map((questionId) => evaluateQuestion(questionId, context, registry));
}

export function evaluateAllQuestions(
    context: AnswerContext,
    registry: Record<QuestionId, QuestionDefinition> = QUESTION_REGISTRY
): QuestionAnswer[] {
    return evaluateQuestions(ACCEPTANCE_QUESTION_IDS, context, registry);
}

export function summarizeCoverage(answers: QuestionAnswer[]): CoverageSummary {
    const sectionBuckets = new Map<string, QuestionAnswer[]>();
    answers.forEach((answer) => {
        const section = `${answer.questionId[0]} ${({
            A: 'Core',
            B: 'Builders',
            C: 'Governance',
            D: 'Providers',
            E: 'Users',
            F: 'Researchers',
            G: 'Comparative',
            H: 'Token',
            M: 'Onocoy Inputs'
        } as Record<string, string>)[answer.questionId[0]] || 'Unknown'}`;

        if (!sectionBuckets.has(section)) sectionBuckets.set(section, []);
        sectionBuckets.get(section)?.push(answer);
    });

    const bySection = Array.from(sectionBuckets.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([section, sectionAnswers]) => buildSectionSummary(section, sectionAnswers));

    return {
        bySection,
        total: buildSectionSummary('Total', answers)
    };
}

export function validateRegistryCoverage(
    registry: Record<QuestionId, QuestionDefinition> = QUESTION_REGISTRY
): { valid: boolean; missing: QuestionId[]; unexpected: QuestionId[] } {
    const expected = new Set(ACCEPTANCE_QUESTION_IDS);
    const actual = new Set(Object.keys(registry));

    const missing = ACCEPTANCE_QUESTION_IDS.filter((id) => !actual.has(id));
    const unexpected = Array.from(actual).filter((id) => !expected.has(id));
    return { valid: missing.length === 0 && unexpected.length === 0, missing, unexpected };
}
