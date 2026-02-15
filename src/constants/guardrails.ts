export type GuardrailBand = 'healthy' | 'watchlist' | 'intervention';

export const GUARDRAIL_BAND_LABELS: Record<GuardrailBand, string> = {
    healthy: 'Healthy Band',
    watchlist: 'Watchlist Band',
    intervention: 'Intervention Band'
};

export const PAYBACK_GUARDRAILS = {
    excellentMonths: 12,
    healthyMaxMonths: 24,
    watchlistMaxMonths: 36,
    extendedHorizonMonths: 60
} as const;

export const RETENTION_GUARDRAILS = {
    benchmarkMinPct: 92,
    thesisMinPct: 70
} as const;

export const SUSTAINABILITY_GUARDRAILS = {
    benchmarkMinRatio: 1
} as const;

export const SOLVENCY_GUARDRAILS = {
    criticalIndex: 100,
    healthyIndex: 130,
    criticalRatio: 1.0,
    healthyRatio: 1.3
} as const;

export const UTILIZATION_GUARDRAILS = {
    healthyMinPct: 35,
    watchlistMinPct: 20
} as const;

export const TAIL_RISK_GUARDRAILS = {
    healthyMax: 35,
    watchlistMax: 65
} as const;

export const RESILIENCE_GUARDRAILS = {
    watchlistMinScore: 45,
    healthyMinScore: 70
} as const;

export const RUNWAY_GUARDRAILS = {
    healthyMinYears: 2,
    watchlistMinYears: 1
} as const;

export const CHURN_GUARDRAILS = {
    panicPctPerWeek: 5
} as const;

export const BER_GUARDRAILS = {
    healthyMin: 1.0
} as const;

export const RELATIVE_SCORE_GUARDRAILS = {
    healthyMin: 80,
    watchlistMin: 60
} as const;

export const GUARDRAIL_COPY = {
    benchmarkRelativeScoreReference: `Relative score only (not raw guardrails): ${RELATIVE_SCORE_GUARDRAILS.healthyMin}+ strong vs peers, ${RELATIVE_SCORE_GUARDRAILS.watchlistMin}-${RELATIVE_SCORE_GUARDRAILS.healthyMin} watchlist, below ${RELATIVE_SCORE_GUARDRAILS.watchlistMin} actionable gap.`,
    benchmarkSolvencyReference: `Healthy >=${SOLVENCY_GUARDRAILS.healthyIndex} (~${SOLVENCY_GUARDRAILS.healthyRatio.toFixed(1)}x), watchlist ${SOLVENCY_GUARDRAILS.criticalIndex}-${SOLVENCY_GUARDRAILS.healthyIndex} (~${SOLVENCY_GUARDRAILS.criticalRatio.toFixed(1)}-${SOLVENCY_GUARDRAILS.healthyRatio.toFixed(1)}x), intervention <${SOLVENCY_GUARDRAILS.criticalIndex} (<${SOLVENCY_GUARDRAILS.criticalRatio.toFixed(1)}x).`,
    thesisChartReference: `Guardrails: retention >=${RETENTION_GUARDRAILS.thesisMinPct}%, payback <=${PAYBACK_GUARDRAILS.healthyMaxMonths}m healthy, ${PAYBACK_GUARDRAILS.healthyMaxMonths}-${PAYBACK_GUARDRAILS.watchlistMaxMonths}m watchlist, >${PAYBACK_GUARDRAILS.watchlistMaxMonths}m intervention.`,
    financialBurnReference: 'Burn >= mint is healthy, burn < mint is watchlist, and persistent burn << mint is intervention.',
    financialRunwayReference: `Runway >${RUNWAY_GUARDRAILS.healthyMinYears} years is healthy, ${RUNWAY_GUARDRAILS.watchlistMinYears}-${RUNWAY_GUARDRAILS.healthyMinYears} years watchlist, and <${RUNWAY_GUARDRAILS.watchlistMinYears} year intervention.`,
    minerReference: `Payback <=${PAYBACK_GUARDRAILS.healthyMaxMonths}m is healthy, ${PAYBACK_GUARDRAILS.healthyMaxMonths}-${PAYBACK_GUARDRAILS.watchlistMaxMonths}m watchlist, >${PAYBACK_GUARDRAILS.watchlistMaxMonths}m intervention; sustained churn >${CHURN_GUARDRAILS.panicPctPerWeek}%/week indicates panic.`,
    utilityReference: `Utilization >=${UTILIZATION_GUARDRAILS.healthyMinPct}% is healthy, ${UTILIZATION_GUARDRAILS.watchlistMinPct}-${UTILIZATION_GUARDRAILS.healthyMinPct}% watchlist, and <${UTILIZATION_GUARDRAILS.watchlistMinPct}% intervention risk (likely overprovisioned).`,
    tailRiskReference: `Tail risk <${TAIL_RISK_GUARDRAILS.healthyMax} is healthy, ${TAIL_RISK_GUARDRAILS.healthyMax}-${TAIL_RISK_GUARDRAILS.watchlistMax} watchlist, and >${TAIL_RISK_GUARDRAILS.watchlistMax} intervention.`,
    diagnosticSignalsReference: `BER <${BER_GUARDRAILS.healthyMin.toFixed(1)} plus warning/critical capacity or overhead shifts state from watchlist toward intervention risk.`
} as const;

export const classifyPaybackBand = (months: number): GuardrailBand => {
    if (!Number.isFinite(months)) return 'intervention';
    if (months > PAYBACK_GUARDRAILS.watchlistMaxMonths) return 'intervention';
    if (months > PAYBACK_GUARDRAILS.healthyMaxMonths) return 'watchlist';
    return 'healthy';
};

export const classifyTailRiskBand = (score: number): GuardrailBand => {
    if (!Number.isFinite(score)) return 'intervention';
    if (score > TAIL_RISK_GUARDRAILS.watchlistMax) return 'intervention';
    if (score >= TAIL_RISK_GUARDRAILS.healthyMax) return 'watchlist';
    return 'healthy';
};
