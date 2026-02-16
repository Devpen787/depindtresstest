import type { AggregateResult, SimulationParams } from '../../model/SimulationAdapter';
import type { DerivedMetrics } from '../../model/types';

export type QuestionId = string;
export type QuestionVerdict = 'yes' | 'no' | 'at_risk' | 'insufficient_data';
export type AnswerabilityGrade = 'Y' | 'P' | 'N';

export interface AnswerMetricValue {
    id: string;
    label: string;
    value: number | string;
    unit?: string;
}

export interface AnswerEvidenceRef {
    kind: 'chart' | 'table' | 'panel' | 'metric';
    ref: string;
    label: string;
}

export interface QuestionAnswer {
    questionId: QuestionId;
    answerability: AnswerabilityGrade;
    verdict: QuestionVerdict;
    summary: string;
    window: string;
    thresholds: string[];
    metrics: AnswerMetricValue[];
    evidence: AnswerEvidenceRef[];
    reproducible: boolean;
    confidence: number;
}

export interface AnswerContext {
    runId: string;
    params: SimulationParams;
    aggregated: AggregateResult[];
    baselineAggregated?: AggregateResult[] | null;
    derivedMetrics?: DerivedMetrics | null;
}

export type QuestionEvaluator = (context: AnswerContext) => QuestionAnswer;

export interface QuestionDefinition {
    id: QuestionId;
    section: string;
    stakeholder: string;
    prompt: string;
    implementation: 'implemented' | 'stub';
    evaluator: QuestionEvaluator;
}

