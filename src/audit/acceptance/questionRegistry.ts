import {
    CHURN_GUARDRAILS,
    PAYBACK_GUARDRAILS,
    RETENTION_GUARDRAILS,
    SOLVENCY_GUARDRAILS,
    UTILIZATION_GUARDRAILS
} from '../../constants/guardrails';
import { DEFAULT_SIMULATION_PARAMS } from '../../model/SimulationAdapter';
import type {
    AnswerContext,
    QuestionAnswer,
    QuestionDefinition,
    QuestionEvaluator,
    QuestionId
} from './types';

interface SectionSpec {
    prefix: string;
    section: string;
    stakeholder: string;
    count: number;
}

const SECTION_SPECS: SectionSpec[] = [
    { prefix: 'A', section: 'A Core', stakeholder: 'All viewers', count: 12 },
    { prefix: 'B', section: 'B Builders', stakeholder: 'Builders / protocol designers', count: 18 },
    { prefix: 'C', section: 'C Governance', stakeholder: 'Onocoy governance / DAO / foundation', count: 18 },
    { prefix: 'D', section: 'D Providers', stakeholder: 'Providers / miners', count: 12 },
    { prefix: 'E', section: 'E Users', stakeholder: 'Users / rovers / enterprise buyers', count: 8 },
    { prefix: 'F', section: 'F Researchers', stakeholder: 'Researchers / thesis readers', count: 14 },
    { prefix: 'G', section: 'G Comparative', stakeholder: 'Comparative DePIN analysts / community', count: 8 },
    { prefix: 'H', section: 'H Token', stakeholder: 'Token holders / treasury-risk readers', count: 10 },
    { prefix: 'M', section: 'I Onocoy Inputs', stakeholder: 'Onocoy governance / DAO / foundation', count: 3 }
];

const NON_ANSWERABLE_GAP_IDS = new Set<QuestionId>([
    'M1',
    'M2',
    'M3'
]);

const PROMPT_OVERRIDES: Record<string, string> = {
    A1: 'What regime are we currently in (baseline, demand stress, liquidity stress, competitive yield stress, cost inflation stress)?',
    A2: 'Which metrics are currently off baseline, and by how much?',
    A3: 'Which failure mode is emerging right now?',
    A4: 'Is provider retention stable or degrading?',
    A5: 'Is service continuity stable or degrading?',
    A6: 'Is incentive solvency improving or worsening (burn-to-mint direction)?',
    A7: 'Are we currently subsidy-dependent?',
    A8: 'Are current rewards aligned with realized demand?',
    A9: 'Are stress effects immediate or lagged (especially price shock vs churn vs capacity)?',
    A10: 'Are we near any critical thresholds (alert states)?',
    A11: 'Which leading indicators changed first?',
    A12: 'What changed this week vs last week vs baseline?',
    B1: 'Are emissions too rigid relative to demand?',
    B2: 'How tightly do rewards track usage?',
    B3: 'Under demand contraction, how fast does burn-to-emission deteriorate?',
    B4: 'Which parameter has highest sensitivity on churn?',
    B5: 'Which parameter has highest sensitivity on solvency?',
    B6: 'What is the minimum provider margin needed to avoid churn acceleration?',
    B7: 'Which provider tiers fail first under cost inflation?',
    B8: 'How much liquidity depth is needed to prevent severe reward compression after unlock?',
    B9: 'How long is the lag from price shock to churn?',
    B10: 'How long is the lag from churn to capacity loss?',
    B11: 'What happens if beta/bonus rewards are extended 4, 8, or 12 weeks?',
    B12: 'What is the probability of death-spiral conditions under each scenario?',
    B13: 'What if burn fraction or emission decay is changed?',
    B14: 'Do differentiated incentives by commitment tier improve retention quality?',
    B15: 'Are we optimizing peak returns or downside resilience?',
    B16: 'Which design changes improve robustness without overfitting one scenario?',
    B17: 'Which failure mode is currently most likely if no intervention is made?',
    B18: 'Did a proposed parameter change improve robustness across scenarios, not just one?',
    C1: 'Which stress-response archetype are we currently exhibiting (Subsidy Inertia, Overfitting, Re-targeting, Narrative Pivot, Emergency Centralization)?',
    C2: 'Are governance decisions widening the subsidy gap?',
    C3: 'Are temporary reward boosts creating short-lived retention and long-term fragility?',
    C4: 'Are we rewarding economically valuable output or just participation volume?',
    C5: 'Is provider margin deterioration a leading warning signal right now?',
    C6: 'How many providers are near/below breakeven?',
    C7: 'Is ONO price sensitivity translating into delayed churn risk?',
    C8: 'Are we over-relying on narrative versus structural parameter change?',
    C9: 'Are we drifting toward emergency centralization to maintain coverage?',
    C10: 'Does current policy protect high-commitment providers better than mercenary supply?',
    C11: 'What happens if we extend beta/bonus rewards 4, 8, or 12 weeks?',
    C12: 'What happens if we increase demand-linking in rewards?',
    C13: 'What happens if we adjust burn fraction or emission decay?',
    C14: 'Which KPI triggers should force governance review?',
    C15: 'Which KPI triggers should force emergency action?',
    C16: 'Are capacity metrics masking latent degradation?',
    C17: 'Are we improving burn-to-mint trajectory toward solvency?',
    C18: 'Are governance interventions reducing fragility or just delaying it?',
    D1: 'What is my current expected margin by provider tier?',
    D2: 'How sensitive is my profitability to ONO price changes?',
    D3: 'At what price/margin level does churn risk become high?',
    D4: 'How do my economics compare to alternative networks?',
    D5: 'Is reward policy favoring long-term reliable operators?',
    D6: 'How do cost shocks affect each provider type?',
    D7: 'Are current rewards likely sustainable or temporary subsidy?',
    D8: 'What is expected retention trend for my cohort?',
    D9: 'Are there early signs that nominal rewards are losing real value?',
    D10: 'Are quality/uptime-linked rewards improving my long-term expected return?',
    D11: 'Under each stress scenario, when does breakeven break?',
    D12: 'Is current participation rational under downside conditions?',
    E1: 'Will service continuity remain stable if provider churn rises?',
    E2: 'Is capacity still sufficient for expected demand?',
    E3: 'Are there signs of latent degradation (capacity at risk despite current uptime)?',
    E4: 'Which stress scenarios threaten service quality most?',
    E5: 'How resilient is coverage to liquidity events?',
    E6: 'How resilient is coverage to provider cost inflation?',
    E7: 'Are quality-linked incentives protecting delivered service?',
    E8: 'Is the network becoming more or less reliable over time?',
    F1: 'Are stress inputs explicitly defined and separated from outcomes?',
    F2: 'Are scenario assumptions visible and reproducible?',
    F3: 'Are metrics operationally defined and computed consistently?',
    F4: 'Can baseline and stress runs be compared on identical axes/time windows?',
    F5: 'Is dispersion shown (median, IQR, tails), not just single runs?',
    F6: 'Are failure modes mapped to measurable precursor signals?',
    F7: 'Are causal claims avoided where only directional evidence exists?',
    F8: 'Are non-goals explicit (no price prediction, no success forecasting)?',
    F9: 'Are model limitations visible at point of interpretation?',
    F10: 'Can results be traced from parameter input to observed outcome?',
    F11: 'Are cross-scenario signatures distinguishable and interpretable?',
    F12: 'Is comparative robustness emphasized over absolute ranking?',
    F13: 'Are archetype diagnostics connected to observable dashboard signals?',
    F14: 'Are policy implications framed as considerations, not universal prescriptions?',
    G1: 'How does Onocoy profile compare with archetype peers under identical stress?',
    G2: 'Which mechanisms are more robust to demand contraction?',
    G3: 'Which mechanisms are more robust to liquidity shocks?',
    G4: 'Which mechanisms are more robust to competitive yield pressure?',
    G5: 'Which mechanisms are more robust to provider cost inflation?',
    G6: 'Does sunk-cost friction materially slow churn?',
    G7: 'Which failure mode appears earliest by mechanism type?',
    G8: 'Is Onocoy’s capped-supply profile trading flexibility for anti-dilution resilience?',
    H1: 'Is net emission pressure increasing or decreasing?',
    H2: 'Is burn-to-mint trending toward or away from solvency?',
    H3: 'How severe is unlock-event downside under current liquidity depth?',
    H4: 'How much of provider retention is subsidy-supported vs economically viable?',
    H5: 'Are price shocks likely to trigger second-order infrastructure attrition?',
    H6: 'Which treasury/risk buffers are needed to absorb market dislocation?',
    H7: 'Are we diluting to preserve short-term participation?',
    H8: 'Are interventions improving long-run solvency or postponing adjustment?',
    H9: 'How exposed is network health to token volatility?',
    H10: 'Are we approaching conditions consistent with death-spiral probability alerts?',
    M1: 'Can we directly measure spoofing detections from the dashboard today?',
    M2: 'Can we directly measure slashing-event counts from the dashboard today?',
    M3: 'Can we use canonical on-chain/token-plan unlock events instead of scenario proxy unlocks?'
};

function createBaseAnswer(
    questionId: QuestionId,
    partial: Partial<QuestionAnswer>
): QuestionAnswer {
    return {
        questionId,
        answerability: 'P',
        verdict: 'insufficient_data',
        summary: 'Evaluator is not implemented for this question yet.',
        window: 'N/A',
        thresholds: [],
        metrics: [],
        evidence: [],
        reproducible: false,
        confidence: 0,
        ...partial
    };
}

function createStubEvaluator(id: QuestionId): QuestionEvaluator {
    return () => createBaseAnswer(id, {
        answerability: NON_ANSWERABLE_GAP_IDS.has(id) ? 'N' : 'P',
        summary: NON_ANSWERABLE_GAP_IDS.has(id)
            ? 'No model capability exists yet for this question.'
            : 'Model has partial support, but no deterministic evaluator is registered yet.',
        evidence: [
            {
                kind: 'panel',
                ref: 'dashboard_acceptance_answers_snapshot_latest.tsv',
                label: 'Acceptance checklist row'
            }
        ]
    });
}

function getLatestPoints(ctx: AnswerContext) {
    const lastIndex = ctx.aggregated.length - 1;
    return {
        current: lastIndex >= 0 ? ctx.aggregated[lastIndex] : null,
        previous: lastIndex > 0 ? ctx.aggregated[lastIndex - 1] : null
    };
}

function computeRetentionPct(ctx: AnswerContext): number {
    if (ctx.aggregated.length === 0) return 0;
    const providers = ctx.aggregated.map((point) => point.providers?.mean || 0);
    const peak = Math.max(...providers, 0);
    const latest = providers[providers.length - 1] || 0;
    if (peak <= 0) return 0;
    return (latest / peak) * 100;
}

function computeDemandCoveragePct(ctx: AnswerContext): number {
    const { current } = getLatestPoints(ctx);
    if (!current) return 0;
    const demand = current.demand?.mean || 0;
    const served = current.demand_served?.mean || 0;
    if (demand <= 0) return 100;
    return (served / demand) * 100;
}

function computeEstimatedPaybackMonths(ctx: AnswerContext): number {
    const { current } = getLatestPoints(ctx);
    if (!current) return Number.POSITIVE_INFINITY;
    const providers = Math.max(1, current.providers?.mean || 1);
    const price = Math.max(0, current.price?.mean || 0);
    const mintedPerProvider = (current.minted?.mean || 0) / providers;
    const weeklyRevenueUsd = mintedPerProvider * price;
    const weeklyProfitUsd = weeklyRevenueUsd - ctx.params.providerCostPerWeek;
    if (weeklyProfitUsd <= 0) return Number.POSITIVE_INFINITY;
    return (ctx.params.hardwareCost / weeklyProfitUsd) / 4.33;
}

function computeEstimatedPaybackMonthsAtPoint(ctx: AnswerContext, point: AnswerContext['aggregated'][number]): number {
    const providers = Math.max(1, point.providers?.mean || 1);
    const price = Math.max(0, point.price?.mean || 0);
    const mintedPerProvider = (point.minted?.mean || 0) / providers;
    const weeklyRevenueUsd = mintedPerProvider * price;
    const weeklyProfitUsd = weeklyRevenueUsd - ctx.params.providerCostPerWeek;
    if (weeklyProfitUsd <= 0) return Number.POSITIVE_INFINITY;
    return (ctx.params.hardwareCost / weeklyProfitUsd) / 4.33;
}

interface ProviderEconomicsSnapshot {
    providers: number;
    priceUsd: number;
    mintedPerProvider: number;
    weeklyRevenuePerProviderUsd: number;
    weeklyMarginPerProviderUsd: number;
    breakEvenPriceUsd: number;
    churnRiskPriceUsd: number;
    downsidePrice20PctUsd: number;
    downsideMargin20PctUsd: number;
}

function getProviderEconomicsAtPoint(
    ctx: AnswerContext,
    point: AnswerContext['aggregated'][number] | null
): ProviderEconomicsSnapshot {
    const providerCost = Number(ctx.params.providerCostPerWeek || DEFAULT_SIMULATION_PARAMS.providerCostPerWeek || 0);
    const churnThreshold = Number(ctx.params.churnThreshold || 0);
    const providers = Math.max(1, point?.providers?.mean || 1);
    const priceUsd = Math.max(0, point?.price?.mean || 0);
    const mintedPerProvider = safeDivide(point?.minted?.mean || 0, providers, 0);
    const weeklyRevenuePerProviderUsd = mintedPerProvider * priceUsd;
    const weeklyMarginPerProviderUsd = weeklyRevenuePerProviderUsd - providerCost;
    const breakEvenPriceUsd = mintedPerProvider > 0 ? providerCost / mintedPerProvider : Number.POSITIVE_INFINITY;
    const churnRiskPriceUsd = mintedPerProvider > 0
        ? Math.max(0, providerCost + churnThreshold) / mintedPerProvider
        : Number.POSITIVE_INFINITY;
    const downsidePrice20PctUsd = priceUsd * 0.8;
    const downsideMargin20PctUsd = (mintedPerProvider * downsidePrice20PctUsd) - providerCost;

    return {
        providers,
        priceUsd,
        mintedPerProvider,
        weeklyRevenuePerProviderUsd,
        weeklyMarginPerProviderUsd,
        breakEvenPriceUsd,
        churnRiskPriceUsd,
        downsidePrice20PctUsd,
        downsideMargin20PctUsd
    };
}

interface TierMarginSnapshot {
    proCount: number;
    mercenaryCount: number;
    proMarginUsd: number;
    mercenaryMarginUsd: number;
    proRevenueUsd: number;
    mercenaryRevenueUsd: number;
    proWeight: number;
    mercenaryWeight: number;
}

function getTierMarginSnapshot(
    ctx: AnswerContext,
    point: AnswerContext['aggregated'][number] | null
): TierMarginSnapshot {
    const providerCost = Number(ctx.params.providerCostPerWeek || DEFAULT_SIMULATION_PARAMS.providerCostPerWeek || 0);
    const providers = Math.max(1, point?.providers?.mean || 1);
    const totalRewardsUsd = (point?.minted?.mean || 0) * Math.max(0, point?.price?.mean || 0);
    const proCountFallback = providers * Number(ctx.params.proTierPct || 0);
    const proCount = Math.max(0, Math.min(providers, point?.proCount?.mean || proCountFallback));
    const mercenaryCount = Math.max(0, Math.min(providers, point?.mercenaryCount?.mean || Math.max(0, providers - proCount)));
    const efficiency = Math.max(1, Number(ctx.params.proTierEfficiency || 1));
    const proWeight = proCount * efficiency;
    const mercenaryWeight = mercenaryCount;
    const totalWeight = Math.max(1e-9, proWeight + mercenaryWeight);
    const proRevenueTotal = totalRewardsUsd * safeDivide(proWeight, totalWeight, 0);
    const mercRevenueTotal = totalRewardsUsd * safeDivide(mercenaryWeight, totalWeight, 0);
    const proRevenueUsd = proCount > 0 ? proRevenueTotal / proCount : 0;
    const mercenaryRevenueUsd = mercenaryCount > 0 ? mercRevenueTotal / mercenaryCount : 0;
    const proMarginUsd = proRevenueUsd - providerCost;
    const mercenaryMarginUsd = mercenaryRevenueUsd - providerCost;

    return {
        proCount,
        mercenaryCount,
        proMarginUsd,
        mercenaryMarginUsd,
        proRevenueUsd,
        mercenaryRevenueUsd,
        proWeight,
        mercenaryWeight
    };
}

function safeDivide(numerator: number, denominator: number, fallback = 0): number {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || Math.abs(denominator) < 1e-9) {
        return fallback;
    }
    return numerator / denominator;
}

function pctChange(currentValue: number, previousValue: number): number {
    if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue)) return 0;
    if (Math.abs(previousValue) < 1e-9) return currentValue === 0 ? 0 : 100;
    return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

function demandCoverageFromPoint(point: AnswerContext['aggregated'][number] | null): number {
    if (!point) return 0;
    const demand = point.demand?.mean || 0;
    const served = point.demand_served?.mean || 0;
    if (demand <= 0) return 100;
    return (served / demand) * 100;
}

function churnPctFromPoint(point: AnswerContext['aggregated'][number] | null): number {
    if (!point) return 0;
    const providers = Math.max(1, point.providers?.mean || 1);
    return safeDivide(point.churnCount?.mean || 0, providers, 0) * 100;
}

function retentionFromSeries(series: AnswerContext['aggregated']): number {
    if (series.length === 0) return 0;
    const providersSeries = series.map((point) => point.providers?.mean || 0);
    const peakProviders = Math.max(...providersSeries, 0);
    const latestProviders = providersSeries[providersSeries.length - 1] || 0;
    if (peakProviders <= 0) return 0;
    return (latestProviders / peakProviders) * 100;
}

function getBaselinePointForCurrentWeek(ctx: AnswerContext) {
    if (!ctx.baselineAggregated || ctx.baselineAggregated.length === 0) return null;
    const { current } = getLatestPoints(ctx);
    if (!current) return null;
    const exact = ctx.baselineAggregated.find((point) => point.t === current.t);
    if (exact) return exact;
    const fallbackIndex = Math.min(ctx.baselineAggregated.length - 1, ctx.aggregated.length - 1);
    return ctx.baselineAggregated[fallbackIndex] || null;
}

function classifyCurrentRegime(ctx: AnswerContext) {
    const { current } = getLatestPoints(ctx);
    const baselinePoint = getBaselinePointForCurrentWeek(ctx);
    if (!current) {
        return {
            regimeId: 'baseline',
            regimeLabel: 'Baseline',
            regimeScore: 0,
            stressScores: {
                demand: 0,
                liquidity: 0,
                competitive: 0,
                cost: 0
            },
            demandDeltaVsBaselinePct: 0,
            priceDeltaVsBaselinePct: 0,
            costDeltaVsReferencePct: 0
        };
    }

    const currentDemand = current.demand?.mean || 0;
    const baselineDemand = baselinePoint?.demand?.mean || currentDemand;
    const demandDeltaVsBaselinePct = pctChange(currentDemand, baselineDemand);

    const currentPrice = current.price?.mean || 0;
    const baselinePrice = baselinePoint?.price?.mean || currentPrice;
    const priceDeltaVsBaselinePct = pctChange(currentPrice, baselinePrice);

    const referenceCost = Number(DEFAULT_SIMULATION_PARAMS.providerCostPerWeek || ctx.params.providerCostPerWeek || 1);
    const costDeltaVsReferencePct = pctChange(ctx.params.providerCostPerWeek, referenceCost);

    const demandScore = (
        (demandDeltaVsBaselinePct < -15 ? 1 : 0) +
        (ctx.params.demandType === 'high-to-decay' ? 1 : 0) +
        (ctx.params.demandType === 'volatile' ? 0.5 : 0)
    );
    const liquidityScore = (
        (ctx.params.investorSellPct >= 0.25 ? 1 : 0) +
        (priceDeltaVsBaselinePct <= -20 ? 1 : 0)
    );
    const competitiveScore = (
        (ctx.params.competitorYield >= 0.75 ? 1 : 0) +
        (ctx.params.competitorYield >= 1.5 ? 1 : 0)
    );
    const currentRevenuePerCapacity = current.revenuePerCapacity?.mean || 0;
    const currentCostPerCapacity = current.costPerCapacity?.mean || 0;
    const costPressureRatio = safeDivide(currentCostPerCapacity, currentRevenuePerCapacity, currentCostPerCapacity > 0 ? 2 : 1);
    const costScore = (
        (costDeltaVsReferencePct >= 25 ? 1 : 0) +
        (costPressureRatio >= 1.1 ? 1 : 0)
    );

    const stressScores = {
        demand: demandScore,
        liquidity: liquidityScore,
        competitive: competitiveScore,
        cost: costScore
    };

    let regimeId: 'baseline' | 'demand_stress' | 'liquidity_stress' | 'competitive_yield_stress' | 'cost_inflation_stress' = 'baseline';
    let regimeLabel = 'Baseline';
    let regimeScore = 0;

    const sorted = Object.entries(stressScores).sort((left, right) => right[1] - left[1]);
    const [topRegime, topScore] = sorted[0] || ['demand', 0];

    if (topScore >= 1) {
        regimeScore = topScore;
        if (topRegime === 'demand') {
            regimeId = 'demand_stress';
            regimeLabel = 'Demand Stress';
        } else if (topRegime === 'liquidity') {
            regimeId = 'liquidity_stress';
            regimeLabel = 'Liquidity Stress';
        } else if (topRegime === 'competitive') {
            regimeId = 'competitive_yield_stress';
            regimeLabel = 'Competitive Yield Stress';
        } else {
            regimeId = 'cost_inflation_stress';
            regimeLabel = 'Cost Inflation Stress';
        }
    }

    return {
        regimeId,
        regimeLabel,
        regimeScore,
        stressScores,
        demandDeltaVsBaselinePct,
        priceDeltaVsBaselinePct,
        costDeltaVsReferencePct
    };
}

function computeDeathSpiralRisk(ctx: AnswerContext) {
    if (ctx.aggregated.length === 0) {
        return {
            probabilityPct: 0,
            riskScore: 0,
            insolvencyWeeks: 0,
            panicChurnWeeks: 0,
            maxDrawdownPct: 0,
            providerCollapsePct: 0,
            nearAlert: false
        };
    }

    const solvencySeries = ctx.aggregated.map((point) => point.solvencyScore?.mean || 0);
    const churnSeries = ctx.aggregated.map((point) => churnPctFromPoint(point));
    const providerSeries = ctx.aggregated.map((point) => point.providers?.mean || 0);
    const priceSeries = ctx.aggregated.map((point) => point.price?.mean || 0);

    const insolvencyWeeks = solvencySeries.filter((value) => value < SOLVENCY_GUARDRAILS.criticalRatio).length;
    const panicChurnWeeks = churnSeries.filter((value) => value >= CHURN_GUARDRAILS.panicPctPerWeek).length;

    let runningPeak = priceSeries[0] || 0;
    let maxDrawdownPct = 0;
    for (let index = 0; index < priceSeries.length; index += 1) {
        runningPeak = Math.max(runningPeak, priceSeries[index] || 0);
        const drawdown = runningPeak > 0 ? ((runningPeak - (priceSeries[index] || 0)) / runningPeak) * 100 : 0;
        maxDrawdownPct = Math.max(maxDrawdownPct, drawdown);
    }

    const peakProviders = Math.max(...providerSeries, 0);
    const latestProviders = providerSeries[providerSeries.length - 1] || 0;
    const providerCollapsePct = peakProviders > 0 ? Math.max(0, ((peakProviders - latestProviders) / peakProviders) * 100) : 0;

    const insolvencyShare = safeDivide(insolvencyWeeks, ctx.aggregated.length, 0);
    const panicShare = safeDivide(panicChurnWeeks, ctx.aggregated.length, 0);
    const drawdownShare = Math.min(1, maxDrawdownPct / 100);
    const collapseShare = Math.min(1, providerCollapsePct / 100);

    const riskScore = (
        (insolvencyShare * 0.35) +
        (panicShare * 0.25) +
        (drawdownShare * 0.2) +
        (collapseShare * 0.2)
    );
    const probabilityPct = Math.min(100, Math.max(0, riskScore * 100));
    const nearAlert = (
        probabilityPct >= 40 ||
        insolvencyShare >= 0.2 ||
        panicShare >= 0.15 ||
        providerCollapsePct >= 15
    );

    return {
        probabilityPct,
        riskScore,
        insolvencyWeeks,
        panicChurnWeeks,
        maxDrawdownPct,
        providerCollapsePct,
        nearAlert
    };
}

function average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function computePerProviderMarginSeries(ctx: AnswerContext): number[] {
    return ctx.aggregated.map((point) => {
        const economics = getProviderEconomicsAtPoint(ctx, point);
        return economics.weeklyMarginPerProviderUsd;
    });
}

function inferFailureModeLabel(ctx: AnswerContext): string {
    const { current, previous } = getLatestPoints(ctx);
    if (!current) return 'Insufficient data';
    const baselinePoint = getBaselinePointForCurrentWeek(ctx);
    const solvency = current.solvencyScore?.mean || 0;
    const burnToMint = safeDivide(current.burned?.mean || 0, current.minted?.mean || 0, 0);
    const churnPct = churnPctFromPoint(current);
    const retention = retentionFromSeries(ctx.aggregated);
    const demandCoverage = demandCoverageFromPoint(current);
    const utilization = current.utilization?.mean || 0;
    const priceDeltaVsBaseline = baselinePoint
        ? pctChange(current.price?.mean || 0, baselinePoint.price?.mean || 0)
        : 0;
    const providerDeltaWoW = previous
        ? pctChange(current.providers?.mean || 0, previous.providers?.mean || 0)
        : 0;

    if (burnToMint < 0.8 && solvency < SOLVENCY_GUARDRAILS.criticalRatio) return 'Subsidy Trap';
    if (churnPct >= CHURN_GUARDRAILS.panicPctPerWeek * 0.8 && retention < RETENTION_GUARDRAILS.benchmarkMinPct) return 'Provider Capitulation';
    if (priceDeltaVsBaseline <= -20 && churnPct >= CHURN_GUARDRAILS.panicPctPerWeek * 0.5) return 'Liquidity Shock -> Churn Spiral';
    if (demandCoverage < 90 && utilization > UTILIZATION_GUARDRAILS.healthyMinPct) return 'Service Continuity Degradation';
    if (providerDeltaWoW < -3 && demandCoverage < 95) return 'Latent Capacity Attrition';
    return 'Stable / No dominant failure mode';
}

interface ShockLagSnapshot {
    shockWeekIndex: number;
    lagToChurnWeeks: number;
    lagToCapacityWeeks: number;
    avgPreShockChurn: number;
}

function estimateShockLag(ctx: AnswerContext): ShockLagSnapshot {
    if (ctx.aggregated.length < 3) {
        return {
            shockWeekIndex: -1,
            lagToChurnWeeks: -1,
            lagToCapacityWeeks: -1,
            avgPreShockChurn: 0
        };
    }

    const priceSeries = ctx.aggregated.map((point) => point.price?.mean || 0);
    const churnSeries = ctx.aggregated.map((point) => churnPctFromPoint(point));
    const capacitySeries = ctx.aggregated.map((point) => point.capacity?.mean || 0);

    let shockWeekIndex = -1;
    for (let index = 1; index < priceSeries.length; index += 1) {
        const dropPct = pctChange(priceSeries[index], priceSeries[index - 1]);
        if (dropPct <= -10) {
            shockWeekIndex = index;
            break;
        }
    }

    if (shockWeekIndex < 0) {
        return {
            shockWeekIndex: -1,
            lagToChurnWeeks: -1,
            lagToCapacityWeeks: -1,
            avgPreShockChurn: average(churnSeries)
        };
    }

    const preShockChurn = churnSeries.slice(0, shockWeekIndex);
    const avgPreShockChurn = preShockChurn.length > 0
        ? average(preShockChurn)
        : churnSeries[shockWeekIndex] || 0;
    const capacityAtShock = capacitySeries[shockWeekIndex] || 0;

    let churnReactionWeek = -1;
    for (let index = shockWeekIndex; index < churnSeries.length; index += 1) {
        if (churnSeries[index] >= avgPreShockChurn + 1) {
            churnReactionWeek = index;
            break;
        }
    }

    let capacityReactionWeek = -1;
    for (let index = shockWeekIndex; index < capacitySeries.length; index += 1) {
        const declinePct = pctChange(capacitySeries[index], capacityAtShock);
        if (declinePct <= -3) {
            capacityReactionWeek = index;
            break;
        }
    }

    return {
        shockWeekIndex,
        lagToChurnWeeks: churnReactionWeek >= shockWeekIndex ? churnReactionWeek - shockWeekIndex : -1,
        lagToCapacityWeeks: capacityReactionWeek >= shockWeekIndex ? capacityReactionWeek - shockWeekIndex : -1,
        avgPreShockChurn
    };
}

function getRequiredMetricCoverageRatio(ctx: AnswerContext): number {
    if (ctx.aggregated.length === 0) return 0;
    const metricExtractors: Array<(point: AnswerContext['aggregated'][number]) => number> = [
        (point) => point.price?.mean || 0,
        (point) => point.supply?.mean || 0,
        (point) => point.demand?.mean || 0,
        (point) => point.demand_served?.mean || 0,
        (point) => point.providers?.mean || 0,
        (point) => point.capacity?.mean || 0,
        (point) => point.minted?.mean || 0,
        (point) => point.burned?.mean || 0,
        (point) => point.solvencyScore?.mean || 0
    ];
    let valid = 0;
    const total = ctx.aggregated.length * metricExtractors.length;

    ctx.aggregated.forEach((point) => {
        metricExtractors.forEach((extractor) => {
            const value = extractor(point);
            if (Number.isFinite(value)) valid += 1;
        });
    });

    return total > 0 ? valid / total : 0;
}

function hasDispersionStats(point: AnswerContext['aggregated'][number] | null): boolean {
    if (!point) return false;
    const sampleMetric = point.price;
    return Boolean(
        sampleMetric &&
        Number.isFinite(sampleMetric.p10) &&
        Number.isFinite(sampleMetric.p90) &&
        Number.isFinite(sampleMetric.ci95_lower) &&
        Number.isFinite(sampleMetric.ci95_upper)
    );
}

function computeNetEmissionPressurePct(point: AnswerContext['aggregated'][number] | null): number {
    if (!point) return 0;
    const minted = point.minted?.mean || 0;
    const burned = point.burned?.mean || 0;
    const supply = Math.max(1, point.supply?.mean || 1);
    return ((minted - burned) / supply) * 100;
}

function computeSubsidyGapPct(point: AnswerContext['aggregated'][number] | null): number {
    if (!point) return 0;
    const minted = Math.max(0, point.minted?.mean || 0);
    const burned = Math.max(0, point.burned?.mean || 0);
    if (minted <= 1e-9) return 0;
    return Math.max(0, safeDivide(minted - burned, minted, 0) * 100);
}

interface LeadingIndicatorBreach {
    id: string;
    label: string;
    weekIndex: number;
    week: number;
    delta: number;
    unit: string;
    threshold: string;
}

function detectLeadingIndicatorBreaches(ctx: AnswerContext): LeadingIndicatorBreach[] {
    if (ctx.aggregated.length === 0) return [];
    const hasBaseline = Boolean(ctx.baselineAggregated && ctx.baselineAggregated.length > 0);

    const getReferencePoint = (index: number) => {
        if (hasBaseline) {
            return ctx.baselineAggregated?.[Math.min(index, Math.max(0, (ctx.baselineAggregated?.length || 1) - 1))] || null;
        }
        return ctx.aggregated[0] || null;
    };

    const definitions: Array<{
        id: string;
        label: string;
        unit: string;
        threshold: string;
        delta: (current: AnswerContext['aggregated'][number], reference: AnswerContext['aggregated'][number]) => number;
        breached: (
            delta: number,
            current: AnswerContext['aggregated'][number],
            reference: AnswerContext['aggregated'][number]
        ) => boolean;
    }> = [
        {
            id: 'price_delta_vs_reference_pct',
            label: 'Price',
            unit: '%',
            threshold: 'Price <= -10% vs reference',
            delta: (current, reference) => pctChange(current.price?.mean || 0, reference.price?.mean || 0),
            breached: (delta) => delta <= -10
        },
        {
            id: 'solvency_delta_vs_reference',
            label: 'Solvency',
            unit: 'x',
            threshold: 'Solvency <= -0.08x vs reference or below 1.0x',
            delta: (current, reference) => (current.solvencyScore?.mean || 0) - (reference.solvencyScore?.mean || 0),
            breached: (delta, current) => delta <= -0.08 || (current.solvencyScore?.mean || 0) < SOLVENCY_GUARDRAILS.criticalRatio
        },
        {
            id: 'churn_delta_vs_reference_pp',
            label: 'Churn',
            unit: 'pp',
            threshold: 'Churn >= +1pp vs reference',
            delta: (current, reference) => churnPctFromPoint(current) - churnPctFromPoint(reference),
            breached: (delta) => delta >= 1
        },
        {
            id: 'providers_delta_vs_reference_pct',
            label: 'Providers',
            unit: '%',
            threshold: 'Providers <= -4% vs reference',
            delta: (current, reference) => pctChange(current.providers?.mean || 0, reference.providers?.mean || 0),
            breached: (delta) => delta <= -4
        },
        {
            id: 'demand_coverage_delta_vs_reference_pp',
            label: 'Demand Coverage',
            unit: 'pp',
            threshold: 'Demand coverage <= -5pp vs reference',
            delta: (current, reference) => demandCoverageFromPoint(current) - demandCoverageFromPoint(reference),
            breached: (delta) => delta <= -5
        },
        {
            id: 'utilization_delta_vs_reference_pp',
            label: 'Utilization',
            unit: 'pp',
            threshold: 'Utilization <= -5pp vs reference',
            delta: (current, reference) => (current.utilization?.mean || 0) - (reference.utilization?.mean || 0),
            breached: (delta) => delta <= -5
        }
    ];

    const breaches: LeadingIndicatorBreach[] = [];
    definitions.forEach((definition) => {
        for (let index = 0; index < ctx.aggregated.length; index += 1) {
            const current = ctx.aggregated[index];
            const reference = getReferencePoint(index);
            if (!current || !reference) continue;
            const delta = definition.delta(current, reference);
            if (definition.breached(delta, current, reference)) {
                breaches.push({
                    id: definition.id,
                    label: definition.label,
                    weekIndex: index,
                    week: Math.max(1, current.t || 0),
                    delta,
                    unit: definition.unit,
                    threshold: definition.threshold
                });
                break;
            }
        }
    });

    return breaches.sort((left, right) => left.weekIndex - right.weekIndex);
}

interface BurnEmissionPolicyProjection {
    currentSolvency: number;
    baseBurnPct: number;
    projectedBurnUpEmissionDownSolvency: number;
    projectedBurnDownEmissionUpSolvency: number;
}

function computeBurnEmissionPolicyProjection(
    ctx: AnswerContext,
    point: AnswerContext['aggregated'][number]
): BurnEmissionPolicyProjection {
    const observedSolvency = point.solvencyScore?.mean || safeDivide(point.burned?.mean || 0, point.minted?.mean || 0, 0);
    const baseBurnPct = Math.min(
        0.95,
        Math.max(0.01, Number(ctx.params.burnPct || DEFAULT_SIMULATION_PARAMS.burnPct || 0.3))
    );
    const burnUpPct = Math.min(0.95, baseBurnPct + 0.10);
    const burnDownPct = Math.max(0.01, baseBurnPct - 0.10);
    const emissionDownFactor = 0.9;
    const emissionUpFactor = 1.1;

    const projectedBurnUpEmissionDownSolvency = observedSolvency
        * safeDivide(burnUpPct, baseBurnPct, 1)
        / emissionDownFactor;
    const projectedBurnDownEmissionUpSolvency = observedSolvency
        * safeDivide(burnDownPct, baseBurnPct, 1)
        / emissionUpFactor;

    return {
        currentSolvency: observedSolvency,
        baseBurnPct,
        projectedBurnUpEmissionDownSolvency,
        projectedBurnDownEmissionUpSolvency
    };
}

interface RewardExtensionProjection {
    extensionWeeks: number;
    bonusEmissionLiftPct: number;
    retentionDeltaPp: number;
    projectedRetentionPct: number;
    subsidyGapDeltaPp: number;
    projectedSubsidyGapPct: number;
    projectedSolvency: number;
}

function clamp(value: number, minValue: number, maxValue: number): number {
    return Math.min(maxValue, Math.max(minValue, value));
}

function computeRewardExtensionProjection(
    ctx: AnswerContext,
    point: AnswerContext['aggregated'][number],
    extensionWeeks: number
): RewardExtensionProjection {
    const blockCount = Math.max(1, extensionWeeks / 4);
    const providers = Math.max(1, point.providers?.mean || 1);
    const minted = Math.max(0, point.minted?.mean || 0);
    const burned = Math.max(0, point.burned?.mean || 0);
    const currentSolvency = point.solvencyScore?.mean || safeDivide(burned, minted, 0);
    const baseSubsidyGapPct = computeSubsidyGapPct(point);
    const baseRetentionPct = retentionFromSeries(ctx.aggregated);
    const churnPct = churnPctFromPoint(point);
    const economics = getProviderEconomicsAtPoint(ctx, point);

    const bonusEmissionLiftPct = Math.min(0.18, 0.05 * blockCount);
    const projectedMinted = minted * (1 + bonusEmissionLiftPct);
    const burnResponsePct = bonusEmissionLiftPct * 0.45;
    const projectedBurned = burned * (1 + burnResponsePct);
    const projectedSubsidyGapPct = projectedMinted <= 1e-9
        ? 0
        : Math.max(0, safeDivide(projectedMinted - projectedBurned, projectedMinted, 0) * 100);

    const marginStress = economics.weeklyMarginPerProviderUsd < 0 ? 1 : 0;
    const retentionDeltaPp = clamp(
        ((0.8 + (0.5 * marginStress)) * blockCount) - (churnPct >= CHURN_GUARDRAILS.panicPctPerWeek ? 0.3 * blockCount : 0),
        0,
        10
    );
    const projectedRetentionPct = clamp(baseRetentionPct + retentionDeltaPp, 0, 100);

    const perProviderMintedDelta = safeDivide(projectedMinted - minted, providers, 0);
    const perProviderRevenueDeltaUsd = perProviderMintedDelta * Math.max(0, point.price?.mean || 0);
    const projectedMarginUsd = economics.weeklyMarginPerProviderUsd + perProviderRevenueDeltaUsd;
    const projectedMarginAdjustment = projectedMarginUsd >= 0 ? 0.02 : -0.02;

    const solvencyFromFlows = safeDivide(projectedBurned, projectedMinted, currentSolvency);
    const projectedSolvency = Math.max(
        0,
        ((currentSolvency * 0.6) + (solvencyFromFlows * 0.4) + projectedMarginAdjustment)
    );

    return {
        extensionWeeks,
        bonusEmissionLiftPct: bonusEmissionLiftPct * 100,
        retentionDeltaPp,
        projectedRetentionPct,
        subsidyGapDeltaPp: projectedSubsidyGapPct - baseSubsidyGapPct,
        projectedSubsidyGapPct,
        projectedSolvency
    };
}

function buildRewardExtensionSweep(
    ctx: AnswerContext,
    point: AnswerContext['aggregated'][number]
): RewardExtensionProjection[] {
    return [4, 8, 12].map((weeks) => computeRewardExtensionProjection(ctx, point, weeks));
}

interface StructuralActionScore {
    score: number;
    burnNorm: number;
    mintNorm: number;
    lagNorm: number;
    emissionNorm: number;
    thresholdNorm: number;
}

function computeStructuralActionScore(ctx: AnswerContext): StructuralActionScore {
    const defaultBurn = Number(DEFAULT_SIMULATION_PARAMS.burnPct || 0.3);
    const defaultMint = Number(DEFAULT_SIMULATION_PARAMS.maxMintWeekly || 1);
    const defaultLag = Number(DEFAULT_SIMULATION_PARAMS.rewardLagWeeks || 0);
    const defaultThreshold = Number(DEFAULT_SIMULATION_PARAMS.churnThreshold || 0);
    const defaultEmissionModel = DEFAULT_SIMULATION_PARAMS.emissionModel || 'fixed';

    const burnNorm = clamp(Math.abs((ctx.params.burnPct || 0) - defaultBurn) / 0.10, 0, 1);
    const mintNorm = clamp(
        safeDivide(Math.abs((ctx.params.maxMintWeekly || 0) - defaultMint), Math.max(1, defaultMint), 0) / 0.25,
        0,
        1
    );
    const lagNorm = clamp(Math.abs((ctx.params.rewardLagWeeks || 0) - defaultLag) / 2, 0, 1);
    const emissionNorm = ctx.params.emissionModel !== defaultEmissionModel ? 1 : 0;
    const thresholdNorm = clamp(Math.abs((ctx.params.churnThreshold || 0) - defaultThreshold) / 50, 0, 1);

    const score = (
        (burnNorm * 0.25) +
        (mintNorm * 0.25) +
        (lagNorm * 0.2) +
        (emissionNorm * 0.2) +
        (thresholdNorm * 0.1)
    ) * 100;

    return {
        score,
        burnNorm,
        mintNorm,
        lagNorm,
        emissionNorm,
        thresholdNorm
    };
}

interface CentralizationRiskProxy {
    riskScore: number;
    providerCompressionPct: number;
    top10ShareProxyPct: number;
    foundationFallbackProxyPct: number;
    cohortConcentrationHhiPct: number;
    coveragePct: number;
}

function computeCentralizationRiskProxy(ctx: AnswerContext): CentralizationRiskProxy {
    const { current } = getLatestPoints(ctx);
    if (!current) {
        return {
            riskScore: 0,
            providerCompressionPct: 0,
            top10ShareProxyPct: 0,
            foundationFallbackProxyPct: 0,
            cohortConcentrationHhiPct: 0,
            coveragePct: 0
        };
    }

    const coveragePct = demandCoverageFromPoint(current);
    const currentProviders = Math.max(1, current.providers?.mean || 1);
    const providerSeries = ctx.aggregated.map((point) => point.providers?.mean || 0);
    const peakProviders = Math.max(...providerSeries, currentProviders);
    const providerCompressionPct = peakProviders > 0
        ? Math.max(0, safeDivide(peakProviders - currentProviders, peakProviders, 0) * 100)
        : 0;

    const proShare = clamp(safeDivide(current.proCount?.mean || 0, currentProviders, 0), 0, 1);
    const mercShare = clamp(safeDivide(current.mercenaryCount?.mean || 0, currentProviders, 0), 0, 1);
    const cohortConcentrationHhiPct = ((proShare * proShare) + (mercShare * mercShare)) * 100;

    const coveragePressure = Math.max(0, coveragePct - 95);
    const top10ShareProxyPct = clamp(
        safeDivide(10, currentProviders, 0) * 100 * (1 + (providerCompressionPct / 50) + (coveragePressure / 25)),
        0,
        100
    );

    const retentionPct = retentionFromSeries(ctx.aggregated);
    const foundationFallbackProxyPct = clamp(Math.max(0, coveragePct - retentionPct), 0, 100);

    const riskScore = clamp(
        (providerCompressionPct * 0.4) +
        (cohortConcentrationHhiPct * 0.25) +
        (top10ShareProxyPct * 0.2) +
        (foundationFallbackProxyPct * 0.15),
        0,
        100
    );

    return {
        riskScore,
        providerCompressionPct,
        top10ShareProxyPct,
        foundationFallbackProxyPct,
        cohortConcentrationHhiPct,
        coveragePct
    };
}

const IMPLEMENTED_EVALUATORS: Record<string, QuestionEvaluator> = {
    A1: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('A1', {
                answerability: 'P',
                summary: 'Need at least one timestep to classify current regime.'
            });
        }

        const regime = classifyCurrentRegime(ctx);

        return createBaseAnswer('A1', {
            answerability: 'Y',
            verdict: regime.regimeId === 'baseline' ? 'no' : 'yes',
            summary: `Current run is classified as ${regime.regimeLabel}.`,
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Demand stress: demand <= -15% vs baseline or decay/volatile demand regime',
                'Liquidity stress: investor sell >= 25% or price <= -20% vs baseline',
                'Competitive yield stress: competitorYield >= 0.75x',
                'Cost inflation stress: provider cost >= +25% vs reference or cost/revenue >= 1.1x'
            ],
            metrics: [
                { id: 'regime_label', label: 'Regime', value: regime.regimeLabel },
                {
                    id: 'regime_stress_score',
                    label: 'Winning Stress Score',
                    value: regime.regimeScore.toFixed(2),
                    unit: 'index'
                },
                {
                    id: 'demand_delta_vs_baseline_pct',
                    label: 'Demand vs Baseline',
                    value: regime.demandDeltaVsBaselinePct.toFixed(1),
                    unit: '%'
                },
                {
                    id: 'price_delta_vs_baseline_pct',
                    label: 'Price vs Baseline',
                    value: regime.priceDeltaVsBaselinePct.toFixed(1),
                    unit: '%'
                },
                {
                    id: 'cost_delta_vs_reference_pct',
                    label: 'Provider Cost vs Reference',
                    value: regime.costDeltaVsReferencePct.toFixed(1),
                    unit: '%'
                }
            ],
            evidence: [
                { kind: 'panel', ref: 'Simulator/Sidebar Stress Controls', label: 'Scenario and stress parameter state' },
                { kind: 'chart', ref: 'Benchmark/AIInsights', label: 'Scenario classification context' }
            ],
            reproducible: true,
            confidence: 0.84
        });
    },
    A2: (ctx) => {
        const { current } = getLatestPoints(ctx);
        const baselinePoint = getBaselinePointForCurrentWeek(ctx);
        if (!current || !baselinePoint) {
            return createBaseAnswer('A2', {
                answerability: 'P',
                summary: 'Need baseline run data aligned to the same week to quantify off-baseline deltas.',
                evidence: [
                    { kind: 'panel', ref: 'ScenarioComparisonPanel', label: 'Baseline vs scenario comparison panel' }
                ]
            });
        }

        const currentCoverage = demandCoverageFromPoint(current);
        const baselineCoverage = demandCoverageFromPoint(baselinePoint);
        const currentRetention = retentionFromSeries(ctx.aggregated);
        const baselineRetention = retentionFromSeries(ctx.baselineAggregated || []);

        const deltas = {
            pricePct: pctChange(current.price?.mean || 0, baselinePoint.price?.mean || 0),
            providersPct: pctChange(current.providers?.mean || 0, baselinePoint.providers?.mean || 0),
            utilizationPp: (current.utilization?.mean || 0) - (baselinePoint.utilization?.mean || 0),
            solvencyDelta: (current.solvencyScore?.mean || 0) - (baselinePoint.solvencyScore?.mean || 0),
            coveragePp: currentCoverage - baselineCoverage,
            retentionPp: currentRetention - baselineRetention
        };

        const offBaselineFlags = [
            deltas.pricePct <= -10 ? 'Price' : null,
            deltas.providersPct <= -5 ? 'Providers' : null,
            deltas.utilizationPp <= -5 ? 'Utilization' : null,
            deltas.solvencyDelta <= -0.1 ? 'Solvency' : null,
            deltas.coveragePp <= -5 ? 'Demand coverage' : null,
            deltas.retentionPp <= -3 ? 'Retention' : null
        ].filter((item): item is string => Boolean(item));

        return createBaseAnswer('A2', {
            answerability: 'Y',
            verdict: offBaselineFlags.length >= 2 ? 'at_risk' : 'yes',
            summary: offBaselineFlags.length > 0
                ? `Metrics currently off baseline: ${offBaselineFlags.join(', ')}.`
                : 'Core metrics are broadly in-line with baseline.',
            window: `W${Math.max(1, current.t || 0)} vs baseline W${Math.max(1, baselinePoint.t || 0)}`,
            thresholds: [
                'Price <= -10% vs baseline',
                'Providers <= -5% vs baseline',
                'Utilization <= -5 pp vs baseline',
                'Solvency <= -0.10x vs baseline'
            ],
            metrics: [
                { id: 'price_delta_vs_baseline_pct', label: 'Price Delta vs Baseline', value: deltas.pricePct.toFixed(1), unit: '%' },
                { id: 'providers_delta_vs_baseline_pct', label: 'Providers Delta vs Baseline', value: deltas.providersPct.toFixed(1), unit: '%' },
                { id: 'utilization_delta_vs_baseline_pp', label: 'Utilization Delta vs Baseline', value: deltas.utilizationPp.toFixed(1), unit: 'pp' },
                { id: 'solvency_delta_vs_baseline', label: 'Solvency Delta vs Baseline', value: deltas.solvencyDelta.toFixed(3), unit: 'x' },
                { id: 'coverage_delta_vs_baseline_pp', label: 'Coverage Delta vs Baseline', value: deltas.coveragePp.toFixed(1), unit: 'pp' },
                { id: 'retention_delta_vs_baseline_pp', label: 'Retention Delta vs Baseline', value: deltas.retentionPp.toFixed(1), unit: 'pp' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Benchmark/HealthMetricsBarChart', label: 'Core KPI deltas in benchmark context' },
                { kind: 'panel', ref: 'ScenarioComparisonPanel', label: 'Baseline vs scenario statistical comparison' }
            ],
            reproducible: true,
            confidence: 0.88
        });
    },
    A3: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('A3', {
                answerability: 'P',
                summary: 'Need current timestep to classify emerging failure mode.'
            });
        }

        const baselinePoint = getBaselinePointForCurrentWeek(ctx);
        const solvency = current.solvencyScore?.mean || 0;
        const burnToMint = safeDivide(current.burned?.mean || 0, current.minted?.mean || 0, 0);
        const churnPct = churnPctFromPoint(current);
        const demandCoverage = demandCoverageFromPoint(current);
        const priceDeltaVsBaseline = baselinePoint
            ? pctChange(current.price?.mean || 0, baselinePoint.price?.mean || 0)
            : 0;
        const failureMode = inferFailureModeLabel(ctx);

        const atRisk = failureMode !== 'Stable / No dominant failure mode';
        return createBaseAnswer('A3', {
            answerability: 'Y',
            verdict: atRisk ? 'at_risk' : 'no',
            summary: atRisk
                ? `Emerging failure mode: ${failureMode}.`
                : 'No dominant failure mode is currently emerging.',
            window: previous
                ? `W${Math.max(1, current.t || 0)} vs W${Math.max(1, previous.t || 0)}`
                : `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Subsidy trap: burn/mint < 0.8x and solvency < 1.0x',
                `Capitulation: churn >= ${(CHURN_GUARDRAILS.panicPctPerWeek * 0.8).toFixed(1)}%/week + retention below benchmark`,
                'Liquidity shock: price <= -20% vs baseline with elevated churn'
            ],
            metrics: [
                { id: 'failure_mode_label', label: 'Failure Mode', value: failureMode },
                { id: 'burn_to_mint_ratio', label: 'Burn-to-Mint', value: burnToMint.toFixed(3), unit: 'x' },
                { id: 'solvency_ratio', label: 'Solvency Ratio', value: solvency.toFixed(3), unit: 'x' },
                { id: 'churn_rate_pct', label: 'Churn Rate', value: churnPct.toFixed(2), unit: '%/week' },
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: demandCoverage.toFixed(1), unit: '%' },
                { id: 'price_delta_vs_baseline_pct', label: 'Price Delta vs Baseline', value: priceDeltaVsBaseline.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Diagnostic/SignalsOfDeathPanel', label: 'Failure signal stack' },
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Burn/mint and runway trajectory' }
            ],
            reproducible: true,
            confidence: 0.86
        });
    },
    A4: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('A4', {
                answerability: 'P',
                summary: 'Need at least two timesteps to determine retention trend.'
            });
        }
        const currentRetention = computeRetentionPct(ctx);
        const previousRetention = (() => {
            const head = ctx.aggregated.slice(0, -1);
            const peak = Math.max(...head.map((point) => point.providers?.mean || 0), 0);
            const prevProviders = previous.providers?.mean || 0;
            return peak > 0 ? (prevProviders / peak) * 100 : 0;
        })();
        const delta = currentRetention - previousRetention;
        const stable = currentRetention >= RETENTION_GUARDRAILS.benchmarkMinPct && delta >= -0.5;
        return createBaseAnswer('A4', {
            answerability: 'Y',
            verdict: stable ? 'yes' : 'at_risk',
            summary: stable
                ? 'Retention is stable relative to the benchmark threshold.'
                : 'Retention is degrading or below the benchmark threshold.',
            window: `W${Math.max(1, (current.t || 0))} vs W${Math.max(0, (previous.t || 0))}`,
            thresholds: [`Retention >= ${RETENTION_GUARDRAILS.benchmarkMinPct}%`],
            metrics: [
                { id: 'retention_pct', label: 'Retention', value: currentRetention.toFixed(1), unit: '%' },
                { id: 'retention_delta_wow', label: 'WoW Retention Delta', value: delta.toFixed(2), unit: 'pp' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Simulator/Sandbox Tier 1', label: 'Weekly Retention Rate trend' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Provider churn trend' }
            ],
            reproducible: true,
            confidence: 0.9
        });
    },
    A5: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('A5', {
                answerability: 'P',
                summary: 'Need at least two timesteps to determine service continuity trend.'
            });
        }
        const currentCoverage = computeDemandCoveragePct(ctx);
        const previousDemand = previous.demand?.mean || 0;
        const previousServed = previous.demand_served?.mean || 0;
        const previousCoverage = previousDemand > 0 ? (previousServed / previousDemand) * 100 : 100;
        const delta = currentCoverage - previousCoverage;
        const stable = currentCoverage >= 90 && delta >= -2;
        return createBaseAnswer('A5', {
            answerability: 'Y',
            verdict: stable ? 'yes' : 'at_risk',
            summary: stable
                ? 'Service continuity remains stable based on demand coverage.'
                : 'Service continuity is at risk due to weakening demand coverage.',
            window: `W${Math.max(1, (current.t || 0))} vs W${Math.max(0, (previous.t || 0))}`,
            thresholds: ['Demand coverage >= 90%'],
            metrics: [
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: currentCoverage.toFixed(1), unit: '%' },
                { id: 'coverage_delta_wow', label: 'WoW Coverage Delta', value: delta.toFixed(2), unit: 'pp' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Demand vs Demand Served' },
                { kind: 'chart', ref: 'Simulator/Tier 3', label: 'Network utilization and coverage' }
            ],
            reproducible: true,
            confidence: 0.87
        });
    },
    A6: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('A6', {
                answerability: 'P',
                summary: 'Need at least two timesteps to infer solvency direction.'
            });
        }
        const currentSolvency = current.solvencyScore?.mean || 0;
        const previousSolvency = previous.solvencyScore?.mean || 0;
        const delta = currentSolvency - previousSolvency;
        const improving = delta >= 0;
        return createBaseAnswer('A6', {
            answerability: 'Y',
            verdict: improving ? 'yes' : 'at_risk',
            summary: improving
                ? 'Incentive solvency is improving week over week.'
                : 'Incentive solvency is deteriorating week over week.',
            window: `W${Math.max(1, (current.t || 0))} vs W${Math.max(0, (previous.t || 0))}`,
            thresholds: [`Solvency ratio critical floor: ${SOLVENCY_GUARDRAILS.criticalRatio.toFixed(1)}x`],
            metrics: [
                { id: 'solvency_ratio', label: 'Solvency Ratio', value: currentSolvency.toFixed(3), unit: 'x' },
                { id: 'solvency_delta_wow', label: 'WoW Solvency Delta', value: delta.toFixed(4), unit: 'x' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Solvency projection slope' },
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Burn-to-mint and runway trend' }
            ],
            reproducible: true,
            confidence: 0.92
        });
    },
    A7: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('A7', {
                answerability: 'P',
                summary: 'Need at least one timestep to classify subsidy dependency.'
            });
        }
        const solvencyRatio = current.solvencyScore?.mean || 0;
        const subsidyDependent = solvencyRatio < 1;
        return createBaseAnswer('A7', {
            answerability: 'Y',
            verdict: subsidyDependent ? 'yes' : 'no',
            summary: subsidyDependent
                ? 'Current configuration is subsidy-dependent (burn below mint).'
                : 'Current configuration is not subsidy-dependent (burn at or above mint).',
            window: `W${Math.max(1, (current.t || 0))}`,
            thresholds: ['Subsidy-dependent if burn/mint < 1.0x'],
            metrics: [
                { id: 'solvency_ratio', label: 'Burn-to-Mint Ratio', value: solvencyRatio.toFixed(3), unit: 'x' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Diagnostic/SolvencyScorecard', label: 'Cost vs revenue balance' },
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Burn and mint trend' }
            ],
            reproducible: true,
            confidence: 0.95
        });
    },
    A8: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('A8', {
                answerability: 'P',
                summary: 'Need at least one timestep to evaluate reward-demand alignment.'
            });
        }

        const demandCoverage = demandCoverageFromPoint(current);
        const utilization = current.utilization?.mean || 0;
        const revenuePerCapacity = current.revenuePerCapacity?.mean || 0;
        const costPerCapacity = current.costPerCapacity?.mean || 0;
        const rewardToDemandRatio = safeDivide(costPerCapacity, revenuePerCapacity, costPerCapacity > 0 ? 2 : 1);
        const solvency = current.solvencyScore?.mean || 0;

        const healthySignals = [
            demandCoverage >= 90,
            utilization >= UTILIZATION_GUARDRAILS.watchlistMinPct,
            rewardToDemandRatio <= 1.0,
            solvency >= SOLVENCY_GUARDRAILS.criticalRatio
        ].filter(Boolean).length;

        const verdict = healthySignals >= 3 ? 'yes' : healthySignals === 2 ? 'at_risk' : 'no';

        return createBaseAnswer('A8', {
            answerability: 'Y',
            verdict,
            summary: verdict === 'yes'
                ? 'Current rewards are broadly aligned with realized demand proxies.'
                : verdict === 'at_risk'
                    ? 'Reward-demand alignment is weakening and needs monitoring.'
                    : 'Rewards appear misaligned with realized demand proxies.',
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Demand coverage >= 90%',
                `Utilization >= ${UTILIZATION_GUARDRAILS.watchlistMinPct}%`,
                'Incentive cost per capacity <= revenue per capacity',
                'Solvency ratio >= 1.0x'
            ],
            metrics: [
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: demandCoverage.toFixed(1), unit: '%' },
                { id: 'utilization_pct', label: 'Utilization', value: utilization.toFixed(1), unit: '%' },
                { id: 'reward_to_demand_ratio', label: 'Cost/Revenue per Capacity', value: rewardToDemandRatio.toFixed(3), unit: 'x' },
                { id: 'solvency_ratio', label: 'Solvency Ratio', value: solvency.toFixed(3), unit: 'x' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Diagnostic/SolvencyScorecard', label: 'Cost vs revenue per capacity' },
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Demand served and utilization context' }
            ],
            reproducible: true,
            confidence: 0.87
        });
    },
    A9: (ctx) => {
        if (ctx.aggregated.length < 4) {
            return createBaseAnswer('A9', {
                answerability: 'P',
                summary: 'Need at least four timesteps to estimate stress lead-lag behavior.'
            });
        }

        const lag = estimateShockLag(ctx);
        const shockWeekIndex = lag.shockWeekIndex;

        if (shockWeekIndex < 0) {
            return createBaseAnswer('A9', {
                answerability: 'Y',
                verdict: 'no',
                summary: 'No material price shock detected in this run, so lag behavior is not activated.',
                window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
                thresholds: [
                    'Shock trigger: price week-over-week drop <= -10%',
                    'Churn response trigger: +1pp over pre-shock average',
                    'Capacity response trigger: >=3% drop from shock week'
                ],
                metrics: [
                    { id: 'price_shock_detected', label: 'Price Shock Detected', value: 'No' }
                ],
                evidence: [
                    { kind: 'chart', ref: 'Simulator/Tier 3', label: 'Price, churn, and capacity trajectories' }
                ],
                reproducible: true,
                confidence: 0.78
            });
        }

        const lagToChurnWeeks = lag.lagToChurnWeeks;
        const lagToCapacityWeeks = lag.lagToCapacityWeeks;
        const laggedEffects = (lagToChurnWeeks > 0) || (lagToCapacityWeeks > 0);

        return createBaseAnswer('A9', {
            answerability: 'Y',
            verdict: laggedEffects ? 'yes' : 'no',
            summary: laggedEffects
                ? 'Stress effects are lagged after the primary price shock.'
                : 'Stress effects are immediate once a price shock occurs.',
            window: `Shock W${Math.max(1, ctx.aggregated[shockWeekIndex]?.t || 0)} onward`,
            thresholds: [
                'Price shock: WoW price <= -10%',
                'Churn reaction: >= +1pp from pre-shock churn',
                'Capacity reaction: >=3% drop from shock-week capacity'
            ],
            metrics: [
                { id: 'shock_week', label: 'Price Shock Week', value: `W${Math.max(1, ctx.aggregated[shockWeekIndex]?.t || 0)}` },
                {
                    id: 'lag_to_churn_weeks',
                    label: 'Lag: Shock -> Churn',
                    value: lagToChurnWeeks >= 0 ? lagToChurnWeeks.toString() : 'No breach',
                    unit: 'weeks'
                },
                {
                    id: 'lag_to_capacity_weeks',
                    label: 'Lag: Churn -> Capacity',
                    value: lagToCapacityWeeks >= 0 ? lagToCapacityWeeks.toString() : 'No breach',
                    unit: 'weeks'
                }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Churn and capacity transition timing' },
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Shock-side solvency response' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    A10: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('A10', {
                answerability: 'P',
                summary: 'Need at least one timestep to assess threshold proximity.'
            });
        }
        const solvency = current.solvencyScore?.mean || 0;
        const estimatedPaybackMonths = computeEstimatedPaybackMonths(ctx);
        const churnPct = (() => {
            const providers = Math.max(1, current.providers?.mean || 1);
            return ((current.churnCount?.mean || 0) / providers) * 100;
        })();

        const nearCritical = (
            solvency <= (SOLVENCY_GUARDRAILS.criticalRatio + 0.1) ||
            estimatedPaybackMonths >= (PAYBACK_GUARDRAILS.healthyMaxMonths * 0.9) ||
            churnPct >= (CHURN_GUARDRAILS.panicPctPerWeek * 0.8)
        );

        return createBaseAnswer('A10', {
            answerability: 'Y',
            verdict: nearCritical ? 'at_risk' : 'no',
            summary: nearCritical
                ? 'At least one core metric is near a critical threshold.'
                : 'Core metrics are not near critical thresholds right now.',
            window: `W${Math.max(1, (current.t || 0))}`,
            thresholds: [
                `Solvency near-critical <= ${(SOLVENCY_GUARDRAILS.criticalRatio + 0.1).toFixed(1)}x`,
                `Payback near-critical >= ${(PAYBACK_GUARDRAILS.healthyMaxMonths * 0.9).toFixed(1)} months`,
                `Churn near panic >= ${(CHURN_GUARDRAILS.panicPctPerWeek * 0.8).toFixed(1)}%/week`
            ],
            metrics: [
                { id: 'solvency_ratio', label: 'Solvency Ratio', value: solvency.toFixed(3), unit: 'x' },
                {
                    id: 'payback_months_est',
                    label: 'Estimated Payback',
                    value: Number.isFinite(estimatedPaybackMonths) ? estimatedPaybackMonths.toFixed(2) : '>120',
                    unit: 'mo'
                },
                { id: 'churn_rate_pct', label: 'Churn Rate', value: churnPct.toFixed(2), unit: '%/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Payback + churn thresholds' },
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Critical solvency floor' }
            ],
            reproducible: true,
            confidence: 0.82
        });
    },
    A11: (ctx) => {
        if (ctx.aggregated.length < 3) {
            return createBaseAnswer('A11', {
                answerability: 'P',
                summary: 'Need at least three timesteps to establish lead-lag ordering across indicators.'
            });
        }

        const breaches = detectLeadingIndicatorBreaches(ctx);
        if (breaches.length === 0) {
            return createBaseAnswer('A11', {
                answerability: 'Y',
                verdict: 'no',
                summary: 'No leading-indicator breach sequence is active in this run.',
                window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
                thresholds: [
                    'Lead indicators are ordered by first threshold breach week'
                ],
                metrics: [
                    { id: 'leading_indicator_sequence_active', label: 'Sequence Active', value: 'No' }
                ],
                evidence: [
                    { kind: 'chart', ref: 'Benchmark/AIInsights', label: 'Indicator trend context' },
                    { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Provider and churn timing context' }
                ],
                reproducible: true,
                confidence: 0.78
            });
        }

        const first = breaches[0];
        const orderedLabels = breaches
            .slice(0, 4)
            .map((breach) => `${breach.label} (W${breach.week})`)
            .join(' -> ');
        const uniqueThresholds = Array.from(new Set(breaches.map((breach) => breach.threshold)));

        return createBaseAnswer('A11', {
            answerability: 'Y',
            verdict: 'yes',
            summary: `Leading indicator sequence starts with ${first.label} at W${first.week}. Ordered sequence: ${orderedLabels}.`,
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
            thresholds: uniqueThresholds,
            metrics: [
                { id: 'first_leading_indicator', label: 'First Leading Indicator', value: first.label },
                { id: 'first_breach_week', label: 'First Breach Week', value: `W${first.week}` },
                { id: 'first_breach_delta', label: `${first.label} Delta at Breach`, value: first.delta.toFixed(2), unit: first.unit },
                { id: 'leading_indicator_count', label: 'Indicators with Breaches', value: breaches.length.toString() }
            ],
            evidence: [
                { kind: 'chart', ref: 'Benchmark/AIInsights', label: 'Ordered indicator transitions vs baseline' },
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Cross-metric first-breach timeline' }
            ],
            reproducible: true,
            confidence: 0.84
        });
    },
    A12: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('A12', {
                answerability: 'P',
                summary: 'Need at least two timesteps to produce week-over-week change analysis.'
            });
        }

        const baselinePoint = getBaselinePointForCurrentWeek(ctx);
        const currentCoverage = demandCoverageFromPoint(current);
        const previousCoverage = demandCoverageFromPoint(previous);
        const baselineCoverage = demandCoverageFromPoint(baselinePoint);
        const currentChurn = churnPctFromPoint(current);
        const previousChurn = churnPctFromPoint(previous);
        const baselineChurn = churnPctFromPoint(baselinePoint);

        const wow = {
            solvency: (current.solvencyScore?.mean || 0) - (previous.solvencyScore?.mean || 0),
            providersPct: pctChange(current.providers?.mean || 0, previous.providers?.mean || 0),
            coveragePp: currentCoverage - previousCoverage,
            churnPp: currentChurn - previousChurn
        };
        const vsBaseline = baselinePoint ? {
            solvency: (current.solvencyScore?.mean || 0) - (baselinePoint.solvencyScore?.mean || 0),
            providersPct: pctChange(current.providers?.mean || 0, baselinePoint.providers?.mean || 0),
            coveragePp: currentCoverage - baselineCoverage,
            churnPp: currentChurn - baselineChurn
        } : null;

        const deteriorationSignals = [
            wow.solvency < 0,
            wow.providersPct < 0,
            wow.coveragePp < 0,
            wow.churnPp > 0
        ].filter(Boolean).length;

        return createBaseAnswer('A12', {
            answerability: baselinePoint ? 'Y' : 'P',
            verdict: deteriorationSignals >= 2 ? 'at_risk' : 'yes',
            summary: baselinePoint
                ? 'Week-over-week and baseline deltas are available for the core KPI set.'
                : 'Week-over-week deltas are available, but baseline comparison data is missing.',
            window: baselinePoint
                ? `W${Math.max(1, current.t || 0)} vs W${Math.max(1, previous.t || 0)} vs baseline W${Math.max(1, baselinePoint.t || 0)}`
                : `W${Math.max(1, current.t || 0)} vs W${Math.max(1, previous.t || 0)}`,
            thresholds: [
                'At-risk if two or more core KPIs deteriorate week-over-week',
                'Baseline deltas require aligned baseline run'
            ],
            metrics: [
                { id: 'wow_solvency_delta', label: 'WoW Solvency Delta', value: wow.solvency.toFixed(3), unit: 'x' },
                { id: 'wow_providers_delta_pct', label: 'WoW Providers Delta', value: wow.providersPct.toFixed(2), unit: '%' },
                { id: 'wow_coverage_delta_pp', label: 'WoW Coverage Delta', value: wow.coveragePp.toFixed(2), unit: 'pp' },
                { id: 'wow_churn_delta_pp', label: 'WoW Churn Delta', value: wow.churnPp.toFixed(2), unit: 'pp' },
                {
                    id: 'baseline_solvency_delta',
                    label: 'vs Baseline Solvency Delta',
                    value: vsBaseline ? vsBaseline.solvency.toFixed(3) : 'N/A',
                    unit: 'x'
                },
                {
                    id: 'baseline_providers_delta_pct',
                    label: 'vs Baseline Providers Delta',
                    value: vsBaseline ? vsBaseline.providersPct.toFixed(2) : 'N/A',
                    unit: '%'
                }
            ],
            evidence: [
                { kind: 'chart', ref: 'Benchmark/HealthMetricsBarChart', label: 'KPI delta context' },
                { kind: 'panel', ref: 'ScenarioComparisonPanel', label: 'Baseline and stress run comparison' }
            ],
            reproducible: Boolean(baselinePoint),
            confidence: baselinePoint ? 0.9 : 0.74
        });
    },
    B1: (ctx) => {
        if (ctx.aggregated.length < 2) {
            return createBaseAnswer('B1', {
                answerability: 'P',
                summary: 'Need at least two timesteps to evaluate emissions rigidity.'
            });
        }

        const { current } = getLatestPoints(ctx);
        const referencePoint = ctx.aggregated[Math.max(0, ctx.aggregated.length - 5)];
        const demandDeltaPct = pctChange(current?.demand?.mean || 0, referencePoint?.demand?.mean || 0);
        const mintDeltaPct = pctChange(current?.minted?.mean || 0, referencePoint?.minted?.mean || 0);
        const rigidityGapPct = Math.abs(mintDeltaPct - demandDeltaPct);
        const fixedModel = ctx.params.emissionModel === 'fixed';
        const rigid = (fixedModel && rigidityGapPct > 15 && Math.abs(demandDeltaPct) > 10) || rigidityGapPct > 25;

        return createBaseAnswer('B1', {
            answerability: 'P',
            verdict: rigid ? 'at_risk' : 'no',
            summary: rigid
                ? 'Emissions are moving too rigidly relative to demand change.'
                : 'Emissions are not currently showing severe rigidity versus demand.',
            window: `W${Math.max(1, referencePoint?.t || 0)} to W${Math.max(1, current?.t || 0)}`,
            thresholds: [
                'Rigidity gap = |mint delta - demand delta|',
                'Watchlist if rigidity gap > 15pp under fixed emission mode',
                'Intervention if rigidity gap > 25pp'
            ],
            metrics: [
                { id: 'demand_delta_pct', label: 'Demand Delta', value: demandDeltaPct.toFixed(1), unit: '%' },
                { id: 'mint_delta_pct', label: 'Mint Delta', value: mintDeltaPct.toFixed(1), unit: '%' },
                { id: 'rigidity_gap_pct', label: 'Emission Rigidity Gap', value: rigidityGapPct.toFixed(1), unit: 'pp' },
                { id: 'emission_model', label: 'Emission Model', value: ctx.params.emissionModel }
            ],
            evidence: [
                { kind: 'panel', ref: 'Simulator/Sidebar Tokenomics', label: 'Emission and burn controls' },
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Mint and burn response to demand' }
            ],
            reproducible: true,
            confidence: 0.84
        });
    },
    B2: (ctx) => {
        if (ctx.aggregated.length < 2) {
            return createBaseAnswer('B2', {
                answerability: 'P',
                summary: 'Need at least two timesteps to estimate reward-to-usage tracking.'
            });
        }

        const first = ctx.aggregated[0];
        const last = ctx.aggregated[ctx.aggregated.length - 1];
        const usageDeltaPct = pctChange(last?.demand_served?.mean || 0, first?.demand_served?.mean || 0);
        const rewardDeltaPct = pctChange(last?.minted?.mean || 0, first?.minted?.mean || 0);
        const trackingGapPct = Math.abs(rewardDeltaPct - usageDeltaPct);
        const demandLinkedModel = ctx.params.emissionModel === 'kpi';
        const verdict = trackingGapPct <= 10
            ? 'yes'
            : trackingGapPct <= 25
                ? 'at_risk'
                : 'no';

        return createBaseAnswer('B2', {
            answerability: 'P',
            verdict: demandLinkedModel ? (verdict === 'no' ? 'at_risk' : 'yes') : verdict,
            summary: demandLinkedModel
                ? 'Demand-linking is active; reward-usage coupling is stronger than fixed mode.'
                : 'Reward-usage tracking is inferred from minted vs demand-served deltas.',
            window: `W${Math.max(1, first?.t || 0)} to W${Math.max(1, last?.t || 0)}`,
            thresholds: [
                'Tracking gap <= 10pp: tight',
                'Tracking gap 10-25pp: partial',
                'Tracking gap > 25pp: weak'
            ],
            metrics: [
                { id: 'usage_delta_pct', label: 'Demand Served Delta', value: usageDeltaPct.toFixed(1), unit: '%' },
                { id: 'reward_delta_pct', label: 'Minted Rewards Delta', value: rewardDeltaPct.toFixed(1), unit: '%' },
                { id: 'reward_usage_tracking_gap_pp', label: 'Reward-Usage Gap', value: trackingGapPct.toFixed(1), unit: 'pp' },
                { id: 'emission_model', label: 'Emission Model', value: ctx.params.emissionModel }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Usage trajectory (demand served)' },
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Reward outflow trajectory (minted)' }
            ],
            reproducible: true,
            confidence: 0.81
        });
    },
    B3: (ctx) => {
        if (ctx.aggregated.length < 4) {
            return createBaseAnswer('B3', {
                answerability: 'P',
                summary: 'Need at least four timesteps to estimate contraction deterioration speed.'
            });
        }

        const baselineDemand = average(ctx.aggregated.slice(0, 3).map((point) => point.demand?.mean || 0));
        const contractionIndex = ctx.aggregated.findIndex((point) => (point.demand?.mean || 0) <= baselineDemand * 0.9);

        if (contractionIndex < 0) {
            return createBaseAnswer('B3', {
                answerability: 'Y',
                verdict: 'no',
                summary: 'No demand-contraction phase detected in this run.',
                window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
                thresholds: [
                    'Demand contraction trigger: demand <= 90% of early-run baseline demand'
                ],
                metrics: [
                    { id: 'contraction_detected', label: 'Demand Contraction Detected', value: 'No' }
                ],
                evidence: [
                    { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Demand trajectory' }
                ],
                reproducible: true,
                confidence: 0.83
            });
        }

        const contractionSlice = ctx.aggregated.slice(contractionIndex);
        const startingSolvency = contractionSlice[0]?.solvencyScore?.mean || 0;
        const solvencySeries = contractionSlice.map((point) => point.solvencyScore?.mean || 0);
        const minSolvency = Math.min(...solvencySeries);
        const minIndex = Math.max(1, solvencySeries.indexOf(minSolvency));
        const deteriorationPerWeek = Math.max(0, (startingSolvency - minSolvency) / minIndex);

        return createBaseAnswer('B3', {
            answerability: 'Y',
            verdict: deteriorationPerWeek > 0.05 ? 'at_risk' : 'no',
            summary: `Burn-to-emission deterioration speed under contraction is ${deteriorationPerWeek.toFixed(3)}x solvency/week.`,
            window: `Contraction W${Math.max(1, contractionSlice[0]?.t || 0)} onward`,
            thresholds: [
                'Watchlist deterioration > 0.03x solvency/week',
                'Intervention deterioration > 0.05x solvency/week'
            ],
            metrics: [
                { id: 'contraction_start_solvency', label: 'Solvency at Contraction Start', value: startingSolvency.toFixed(3), unit: 'x' },
                { id: 'contraction_min_solvency', label: 'Minimum Solvency Post-Contraction', value: minSolvency.toFixed(3), unit: 'x' },
                { id: 'solvency_deterioration_per_week', label: 'Deterioration Speed', value: deteriorationPerWeek.toFixed(3), unit: 'x/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Post-contraction solvency slope' },
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Demand-contraction trigger context' }
            ],
            reproducible: true,
            confidence: 0.87
        });
    },
    B4: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('B4', {
                answerability: 'P',
                summary: 'Need current timestep to estimate churn-sensitivity drivers.'
            });
        }

        const defaultCost = Number(DEFAULT_SIMULATION_PARAMS.providerCostPerWeek || ctx.params.providerCostPerWeek || 1);
        const defaultCompYield = Number(DEFAULT_SIMULATION_PARAMS.competitorYield || 0);
        const defaultLag = Number(DEFAULT_SIMULATION_PARAMS.rewardLagWeeks || ctx.params.rewardLagWeeks || 0);
        const defaultThreshold = Number(DEFAULT_SIMULATION_PARAMS.churnThreshold || ctx.params.churnThreshold || 0);
        const defaultBurn = Number(DEFAULT_SIMULATION_PARAMS.burnPct || ctx.params.burnPct || 0.3);

        const sensitivityScores: Record<string, number> = {
            providerCostPerWeek: Math.max(0, pctChange(ctx.params.providerCostPerWeek, defaultCost) / 18),
            competitorYield: Math.max(0, (ctx.params.competitorYield - defaultCompYield) / 0.35),
            rewardLagWeeks: Math.max(0, ((ctx.params.rewardLagWeeks || 0) - defaultLag) / 1.5),
            churnThreshold: Math.max(0, ((ctx.params.churnThreshold || 0) - defaultThreshold) / 40),
            burnPct: Math.max(0, (defaultBurn - (ctx.params.burnPct || 0)) / 0.08)
        };

        const ranked = Object.entries(sensitivityScores).sort((left, right) => right[1] - left[1]);
        const [topParameter, topScore] = ranked[0] || ['unknown', 0];
        const churnNow = churnPctFromPoint(current);

        return createBaseAnswer('B4', {
            answerability: 'P',
            verdict: topScore >= 1.5 || churnNow >= CHURN_GUARDRAILS.panicPctPerWeek * 0.6 ? 'at_risk' : 'no',
            summary: `Highest modeled churn sensitivity is currently ${topParameter} (score ${topScore.toFixed(2)}).`,
            window: `W${Math.max(1, current.t || 0)} parameter state`,
            thresholds: [
                'Sensitivity score >= 1.5: high churn sensitivity',
                `Elevated churn warning if churn >= ${(CHURN_GUARDRAILS.panicPctPerWeek * 0.6).toFixed(1)}%/week`
            ],
            metrics: [
                { id: 'top_churn_sensitivity_parameter', label: 'Top Churn Sensitivity Parameter', value: topParameter },
                { id: 'top_churn_sensitivity_score', label: 'Top Churn Sensitivity Score', value: topScore.toFixed(2), unit: 'index' },
                { id: 'current_churn_pct_week', label: 'Current Churn', value: churnNow.toFixed(2), unit: '%/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Diagnostic/SensitivityHeatmap', label: 'Churn-related parameter stress map' },
                { kind: 'panel', ref: 'Simulator/Sidebar Tokenomics', label: 'Current parameter state' }
            ],
            reproducible: true,
            confidence: 0.77
        });
    },
    B5: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('B5', {
                answerability: 'P',
                summary: 'Need current timestep to estimate solvency sensitivity drivers.'
            });
        }

        const defaultMint = Number(DEFAULT_SIMULATION_PARAMS.maxMintWeekly || ctx.params.maxMintWeekly || 1);
        const defaultBurn = Number(DEFAULT_SIMULATION_PARAMS.burnPct || ctx.params.burnPct || 1);
        const defaultCost = Number(DEFAULT_SIMULATION_PARAMS.providerCostPerWeek || ctx.params.providerCostPerWeek || 1);
        const defaultCompYield = Number(DEFAULT_SIMULATION_PARAMS.competitorYield || 0);

        const sensitivityScores: Record<string, number> = {
            maxMintWeekly: Math.max(0, pctChange(ctx.params.maxMintWeekly, defaultMint) / 25),
            burnPct: Math.max(0, -pctChange(ctx.params.burnPct, defaultBurn) / 20),
            providerCostPerWeek: Math.max(0, pctChange(ctx.params.providerCostPerWeek, defaultCost) / 20),
            competitorYield: Math.max(0, (ctx.params.competitorYield - defaultCompYield) / 0.5)
        };
        const ranked = Object.entries(sensitivityScores).sort((left, right) => right[1] - left[1]);
        const [topParameter, topScore] = ranked[0] || ['unknown', 0];

        return createBaseAnswer('B5', {
            answerability: 'P',
            verdict: topScore >= 1.5 ? 'at_risk' : 'no',
            summary: `Highest modeled solvency sensitivity is currently ${topParameter} (score ${topScore.toFixed(2)}).`,
            window: `W${Math.max(1, current.t || 0)} parameter state`,
            thresholds: [
                'Sensitivity score >= 1.5: high',
                'Sensitivity score 0.75-1.5: moderate',
                'Sensitivity score < 0.75: low'
            ],
            metrics: [
                { id: 'top_sensitivity_parameter', label: 'Top Sensitivity Parameter', value: topParameter },
                { id: 'top_sensitivity_score', label: 'Top Sensitivity Score', value: topScore.toFixed(2), unit: 'index' },
                { id: 'solvency_ratio', label: 'Current Solvency', value: (current.solvencyScore?.mean || 0).toFixed(3), unit: 'x' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Diagnostic/SensitivityTornadoChart', label: 'Sensitivity-direction reference' },
                { kind: 'panel', ref: 'Simulator/Sidebar Tokenomics', label: 'Active parameter settings' }
            ],
            reproducible: true,
            confidence: 0.74
        });
    },
    B6: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('B6', {
                answerability: 'P',
                summary: 'Need at least two timesteps to estimate margin needed to stabilize churn.'
            });
        }

        const economics = getProviderEconomicsAtPoint(ctx, current);
        const churnNow = churnPctFromPoint(current);
        const churnPrev = churnPctFromPoint(previous);
        const churnAcceleration = churnNow - churnPrev;
        const baseThresholdMargin = Number(ctx.params.churnThreshold || 0);
        const minimumMarginNeeded = baseThresholdMargin + Math.max(0, churnAcceleration * 1.5);

        return createBaseAnswer('B6', {
            answerability: 'P',
            verdict: economics.weeklyMarginPerProviderUsd >= minimumMarginNeeded ? 'no' : 'at_risk',
            summary: `Estimated minimum margin to avoid churn acceleration is ${minimumMarginNeeded.toFixed(2)} USD/week.`,
            window: `W${Math.max(1, previous.t || 0)} to W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Base margin floor = churn threshold',
                'Additional buffer scales with positive churn acceleration'
            ],
            metrics: [
                { id: 'current_margin_usd_week', label: 'Current Margin', value: economics.weeklyMarginPerProviderUsd.toFixed(2), unit: 'USD/week' },
                { id: 'min_margin_needed_usd_week', label: 'Min Margin Needed', value: minimumMarginNeeded.toFixed(2), unit: 'USD/week' },
                { id: 'churn_acceleration_pp', label: 'Churn Acceleration', value: churnAcceleration.toFixed(2), unit: 'pp/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Margin and churn transition behavior' },
                { kind: 'chart', ref: 'Simulator/Sandbox Tier 1', label: 'Churn acceleration context' }
            ],
            reproducible: true,
            confidence: 0.79
        });
    },
    B7: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current || ctx.aggregated.length < 2) {
            return createBaseAnswer('B7', {
                answerability: 'P',
                summary: 'Need tier and trajectory data to identify which provider tier fails first under cost inflation.'
            });
        }

        const regime = classifyCurrentRegime(ctx);
        const tier = getTierMarginSnapshot(ctx, current);
        const costStressActive = regime.costDeltaVsReferencePct >= 20 || regime.stressScores.cost >= 1;

        const failingTier = (() => {
            if (tier.proMarginUsd <= 0 && tier.mercenaryMarginUsd <= 0) {
                return tier.proMarginUsd < tier.mercenaryMarginUsd ? 'Pro tier' : 'Mercenary tier';
            }
            if (tier.mercenaryMarginUsd <= 0) return 'Mercenary tier';
            if (tier.proMarginUsd <= 0) return 'Pro tier';
            return 'No tier currently below break-even';
        })();

        return createBaseAnswer('B7', {
            answerability: 'P',
            verdict: !costStressActive
                ? 'at_risk'
                : (failingTier === 'No tier currently below break-even' ? 'no' : 'yes'),
            summary: !costStressActive
                ? 'Cost-inflation stress is not active; tier-failure order remains provisional.'
                : `${failingTier} appears to fail first under current cost inflation conditions.`,
            window: `W${Math.max(1, current.t || 0)} cost-inflation view`,
            thresholds: [
                'Cost stress active if provider cost delta >= +20% vs reference',
                'Fail-first signal when tier margin <= 0 USD/week'
            ],
            metrics: [
                { id: 'provider_cost_delta_vs_reference_pct', label: 'Provider Cost Delta vs Reference', value: regime.costDeltaVsReferencePct.toFixed(1), unit: '%' },
                { id: 'pro_margin_usd_week', label: 'Pro Tier Margin', value: tier.proMarginUsd.toFixed(2), unit: 'USD/week' },
                { id: 'mercenary_margin_usd_week', label: 'Mercenary Tier Margin', value: tier.mercenaryMarginUsd.toFixed(2), unit: 'USD/week' },
                { id: 'first_failing_tier', label: 'First Failing Tier', value: failingTier }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Tier economics under cost pressure' },
                { kind: 'chart', ref: 'Benchmark/AIInsights', label: 'Active cost-stress regime context' }
            ],
            reproducible: true,
            confidence: 0.79
        });
    },
    B8: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('B8', {
                answerability: 'P',
                summary: 'Need current liquidity/supply/price state to estimate required depth against unlock compression.'
            });
        }

        const currentLiquidityUsd = Math.max(1, Number(ctx.params.initialLiquidity || 1));
        const sellPct = Math.max(0, Number(ctx.params.investorSellPct || 0));
        const unlockValueUsd = Math.max(0, (current.supply?.mean || 0) * sellPct * Math.max(0, current.price?.mean || 0));
        const alphaCurrent = unlockValueUsd / currentLiquidityUsd;
        const currentPriceRetention = 1 / Math.pow(1 + alphaCurrent, 2);
        const currentCompressionPct = Math.max(0, (1 - currentPriceRetention) * 100);

        const severeCompressionThresholdPct = 30;
        const allowedPriceRetention = 1 - (severeCompressionThresholdPct / 100);
        const maxAlphaForThreshold = Math.sqrt(1 / allowedPriceRetention) - 1;
        const requiredLiquidityUsd = maxAlphaForThreshold > 0
            ? unlockValueUsd / maxAlphaForThreshold
            : Number.POSITIVE_INFINITY;
        const liquidityGapUsd = requiredLiquidityUsd - currentLiquidityUsd;
        const coverageRatio = requiredLiquidityUsd > 0 ? currentLiquidityUsd / requiredLiquidityUsd : 1;

        return createBaseAnswer('B8', {
            answerability: 'P',
            verdict: coverageRatio >= 1 ? 'yes' : coverageRatio >= 0.6 ? 'at_risk' : 'no',
            summary: coverageRatio >= 1
                ? 'Current liquidity depth is sufficient to keep unlock reward compression below severe levels.'
                : 'Current liquidity depth is insufficient to prevent severe unlock-driven reward compression.',
            window: `Unlock event at W${Math.max(1, (ctx.params.investorUnlockWeek || 0) + 1)}`,
            thresholds: [
                `Severe compression threshold: > ${severeCompressionThresholdPct}% reward-value compression at unlock`,
                'Required liquidity computed from constant-product AMM shock approximation'
            ],
            metrics: [
                { id: 'unlock_value_usd', label: 'Unlock Notional Value', value: unlockValueUsd.toFixed(0), unit: 'USD' },
                { id: 'current_liquidity_usd', label: 'Current Liquidity Depth', value: currentLiquidityUsd.toFixed(0), unit: 'USD' },
                { id: 'required_liquidity_usd', label: 'Required Liquidity Depth', value: Number.isFinite(requiredLiquidityUsd) ? requiredLiquidityUsd.toFixed(0) : 'N/A', unit: 'USD' },
                { id: 'liquidity_gap_usd', label: 'Liquidity Gap', value: Number.isFinite(liquidityGapUsd) ? liquidityGapUsd.toFixed(0) : 'N/A', unit: 'USD' },
                { id: 'unlock_reward_compression_pct', label: 'Projected Reward Compression', value: currentCompressionPct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Simulator/Sidebar Liquidity', label: 'Liquidity/unlock controls' },
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Price and reward compression context' }
            ],
            reproducible: true,
            confidence: 0.74
        });
    },
    B9: (ctx) => {
        const lag = estimateShockLag(ctx);
        if (lag.shockWeekIndex < 0) {
            return createBaseAnswer('B9', {
                answerability: 'P',
                verdict: 'no',
                summary: 'No qualifying price shock was detected, so lag cannot be measured this run.',
                window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
                thresholds: [
                    'Shock trigger: week-over-week price drop <= -10%'
                ],
                metrics: [
                    { id: 'price_shock_detected', label: 'Price Shock Detected', value: 'No' }
                ],
                evidence: [
                    { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Price and churn path' }
                ],
                reproducible: true,
                confidence: 0.78
            });
        }

        const shockWeek = ctx.aggregated[lag.shockWeekIndex];
        return createBaseAnswer('B9', {
            answerability: 'P',
            verdict: lag.lagToChurnWeeks > 0 ? 'yes' : 'no',
            summary: lag.lagToChurnWeeks >= 0
                ? `Estimated lag from shock to churn is ${lag.lagToChurnWeeks} weeks.`
                : 'No churn reaction breach was detected after the shock.',
            window: `Shock at W${Math.max(1, shockWeek?.t || 0)} onward`,
            thresholds: [
                'Churn reaction trigger: +1pp above pre-shock churn average'
            ],
            metrics: [
                { id: 'lag_shock_to_churn_weeks', label: 'Shock -> Churn Lag', value: lag.lagToChurnWeeks >= 0 ? lag.lagToChurnWeeks.toString() : 'No breach', unit: 'weeks' },
                { id: 'lag_churn_to_capacity_weeks', label: 'Churn -> Capacity Lag', value: lag.lagToCapacityWeeks >= 0 ? lag.lagToCapacityWeeks.toString() : 'No breach', unit: 'weeks' },
                { id: 'pre_shock_churn_pct', label: 'Pre-Shock Churn Baseline', value: lag.avgPreShockChurn.toFixed(2), unit: '%/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Churn response timeline' },
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Capacity lag timeline' }
            ],
            reproducible: true,
            confidence: 0.82
        });
    },
    B10: (ctx) => {
        if (ctx.aggregated.length < 4) {
            return createBaseAnswer('B10', {
                answerability: 'P',
                summary: 'Need at least four timesteps to estimate churn-to-capacity lag.'
            });
        }

        const churnSeries = ctx.aggregated.map((point) => churnPctFromPoint(point));
        const capacitySeries = ctx.aggregated.map((point) => point.capacity?.mean || 0);
        const baselineWindow = Math.min(3, churnSeries.length);
        const churnBaseline = average(churnSeries.slice(0, baselineWindow));
        const churnSpikeIndex = churnSeries.findIndex((value) => (
            value >= churnBaseline + 1 ||
            value >= CHURN_GUARDRAILS.panicPctPerWeek * 0.6
        ));

        if (churnSpikeIndex < 0) {
            return createBaseAnswer('B10', {
                answerability: 'P',
                verdict: 'no',
                summary: 'No qualifying churn spike was detected, so churn-to-capacity lag is not activated.',
                window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
                thresholds: [
                    'Churn spike trigger: +1pp above early-run churn baseline or >=60% of panic churn threshold'
                ],
                metrics: [
                    { id: 'churn_spike_detected', label: 'Churn Spike Detected', value: 'No' }
                ],
                evidence: [
                    { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Churn and capacity timeline' }
                ],
                reproducible: true,
                confidence: 0.8
            });
        }

        const capacityAtSpike = capacitySeries[churnSpikeIndex] || 0;
        let capacityDropIndex = -1;
        for (let index = churnSpikeIndex; index < capacitySeries.length; index += 1) {
            const capacityDeltaPct = pctChange(capacitySeries[index] || 0, capacityAtSpike || 1);
            if (capacityDeltaPct <= -3) {
                capacityDropIndex = index;
                break;
            }
        }

        const lagWeeks = capacityDropIndex >= churnSpikeIndex ? capacityDropIndex - churnSpikeIndex : -1;

        return createBaseAnswer('B10', {
            answerability: 'P',
            verdict: lagWeeks > 0 ? 'yes' : lagWeeks === 0 ? 'no' : 'at_risk',
            summary: lagWeeks >= 0
                ? `Estimated lag from churn spike to capacity loss is ${lagWeeks} weeks.`
                : 'No material capacity-loss breach followed the churn spike in this horizon.',
            window: `Churn spike at W${Math.max(1, ctx.aggregated[churnSpikeIndex]?.t || 0)} onward`,
            thresholds: [
                'Capacity-loss trigger: >=3% drop from churn-spike week capacity'
            ],
            metrics: [
                { id: 'churn_spike_week', label: 'Churn Spike Week', value: `W${Math.max(1, ctx.aggregated[churnSpikeIndex]?.t || 0)}` },
                { id: 'lag_churn_to_capacity_weeks', label: 'Churn -> Capacity Lag', value: lagWeeks >= 0 ? lagWeeks.toString() : 'No breach', unit: 'weeks' },
                { id: 'churn_baseline_pct_week', label: 'Early-Window Churn Baseline', value: churnBaseline.toFixed(2), unit: '%/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Churn and capacity reaction timing' },
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Capacity degradation timeline' }
            ],
            reproducible: true,
            confidence: 0.82
        });
    },
    B11: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('B11', {
                answerability: 'P',
                summary: 'Need current run state to project 4/8/12 week beta/bonus extension impact.'
            });
        }

        const projections = buildRewardExtensionSweep(ctx, current);
        const w4 = projections[0];
        const w8 = projections[1];
        const w12 = projections[2];
        const severeSubsidyWidening = w12.subsidyGapDeltaPp >= 8;
        const weakRetentionLift = w12.retentionDeltaPp < 3;
        const favorableTradeoff = w8.retentionDeltaPp >= 2 && w12.subsidyGapDeltaPp < 6;

        const verdict = severeSubsidyWidening && weakRetentionLift
            ? 'no'
            : favorableTradeoff
                ? 'yes'
                : 'at_risk';

        return createBaseAnswer('B11', {
            answerability: 'P',
            verdict,
            summary: verdict === 'yes'
                ? 'Extending beta/bonus rewards shows a manageable subsidy tradeoff up to 12 weeks in the current regime.'
                : verdict === 'no'
                    ? 'Long extension materially widens subsidy dependence with limited retention benefit.'
                    : 'Short extensions help retention, but longer extension windows meaningfully increase subsidy dependence.',
            window: `Projection from current state W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Tradeoff degrades if 12-week subsidy-gap widening >= 8pp',
                'Healthy extension profile keeps 12-week subsidy-gap widening < 6pp with >= 2pp retention lift at 8 weeks'
            ],
            metrics: [
                { id: 'ext4_retention_delta_pp', label: '4w Retention Delta', value: w4.retentionDeltaPp.toFixed(2), unit: 'pp' },
                { id: 'ext4_subsidy_gap_delta_pp', label: '4w Subsidy Gap Delta', value: w4.subsidyGapDeltaPp.toFixed(2), unit: 'pp' },
                { id: 'ext8_retention_delta_pp', label: '8w Retention Delta', value: w8.retentionDeltaPp.toFixed(2), unit: 'pp' },
                { id: 'ext8_subsidy_gap_delta_pp', label: '8w Subsidy Gap Delta', value: w8.subsidyGapDeltaPp.toFixed(2), unit: 'pp' },
                { id: 'ext12_retention_delta_pp', label: '12w Retention Delta', value: w12.retentionDeltaPp.toFixed(2), unit: 'pp' },
                { id: 'ext12_subsidy_gap_delta_pp', label: '12w Subsidy Gap Delta', value: w12.subsidyGapDeltaPp.toFixed(2), unit: 'pp' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Simulator/Sidebar Tokenomics', label: 'Reward-policy controls used for extension proxy' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Retention and margin baseline context' }
            ],
            reproducible: true,
            confidence: 0.71
        });
    },
    B12: (ctx) => {
        const risk = computeDeathSpiralRisk(ctx);
        const atRisk = risk.probabilityPct >= 50;
        return createBaseAnswer('B12', {
            answerability: 'P',
            verdict: atRisk ? 'at_risk' : 'no',
            summary: `Estimated death-spiral probability for the active scenario is ${risk.probabilityPct.toFixed(1)}%.`,
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
            thresholds: [
                'Alert >= 40%',
                'High risk >= 50%',
                'Very high risk >= 65%'
            ],
            metrics: [
                { id: 'death_spiral_probability_pct', label: 'Death-Spiral Probability', value: risk.probabilityPct.toFixed(1), unit: '%' },
                { id: 'insolvency_weeks', label: 'Insolvency Weeks', value: risk.insolvencyWeeks.toString(), unit: 'weeks' },
                { id: 'panic_churn_weeks', label: 'Panic Churn Weeks', value: risk.panicChurnWeeks.toString(), unit: 'weeks' },
                { id: 'max_price_drawdown_pct', label: 'Max Price Drawdown', value: risk.maxDrawdownPct.toFixed(1), unit: '%' },
                { id: 'provider_collapse_pct', label: 'Provider Collapse', value: risk.providerCollapsePct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Tail-risk and insolvency exposure' },
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Solvency deterioration context' }
            ],
            reproducible: true,
            confidence: 0.83
        });
    },
    B13: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('B13', {
                answerability: 'P',
                summary: 'Need current timestep to run burn/emission directional sensitivity.'
            });
        }

        const projection = computeBurnEmissionPolicyProjection(ctx, current);
        const improves = projection.projectedBurnUpEmissionDownSolvency > projection.currentSolvency;

        return createBaseAnswer('B13', {
            answerability: 'P',
            verdict: improves ? 'yes' : 'at_risk',
            summary: 'Directional sweep indicates higher burn and tighter emission pressure improve solvency from the current state.',
            window: `W${Math.max(1, current.t || 0)} directional sweep`,
            thresholds: [
                'Sensitivity assumption: +10pp burn and -10% emission pressure',
                'Inverse control: -10pp burn and +10% emission pressure'
            ],
            metrics: [
                { id: 'current_solvency_ratio', label: 'Current Solvency', value: projection.currentSolvency.toFixed(3), unit: 'x' },
                { id: 'baseline_burn_pct', label: 'Current Burn Fraction', value: (projection.baseBurnPct * 100).toFixed(1), unit: '%' },
                {
                    id: 'projected_solvency_burn_up_emission_down',
                    label: 'Projected Solvency (Burn Up, Emission Down)',
                    value: projection.projectedBurnUpEmissionDownSolvency.toFixed(3),
                    unit: 'x'
                },
                {
                    id: 'projected_solvency_burn_down_emission_up',
                    label: 'Projected Solvency (Burn Down, Emission Up)',
                    value: projection.projectedBurnDownEmissionUpSolvency.toFixed(3),
                    unit: 'x'
                }
            ],
            evidence: [
                { kind: 'panel', ref: 'Simulator/Sidebar Tokenomics', label: 'Burn and emission controls' },
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Directional solvency sensitivity context' }
            ],
            reproducible: true,
            confidence: 0.75
        });
    },
    B14: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current || ctx.aggregated.length < 2) {
            return createBaseAnswer('B14', {
                answerability: 'P',
                summary: 'Need at least two timesteps to compare commitment-tier retention quality.'
            });
        }

        const proSeries = ctx.aggregated.map((point) => point.proCount?.mean || 0);
        const mercSeries = ctx.aggregated.map((point) => point.mercenaryCount?.mean || 0);
        const proRetention = safeDivide(proSeries[proSeries.length - 1] || 0, Math.max(...proSeries, 1), 0) * 100;
        const mercRetention = safeDivide(mercSeries[mercSeries.length - 1] || 0, Math.max(...mercSeries, 1), 0) * 100;
        const qualityLift = proRetention - mercRetention;
        const tier = getTierMarginSnapshot(ctx, current);
        const improves = qualityLift >= 5 && tier.proMarginUsd >= tier.mercenaryMarginUsd;

        return createBaseAnswer('B14', {
            answerability: 'P',
            verdict: improves ? 'yes' : qualityLift > 0 ? 'at_risk' : 'no',
            summary: `Commitment-tier quality lift is ${qualityLift.toFixed(1)}pp (pro retention vs mercenary retention).`,
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Improvement signal if pro retention exceeds mercenary retention by >= 5pp',
                'Improvement signal if pro margin >= mercenary margin'
            ],
            metrics: [
                { id: 'pro_retention_pct', label: 'Pro Retention', value: proRetention.toFixed(1), unit: '%' },
                { id: 'mercenary_retention_pct', label: 'Mercenary Retention', value: mercRetention.toFixed(1), unit: '%' },
                { id: 'retention_quality_lift_pp', label: 'Retention Quality Lift', value: qualityLift.toFixed(1), unit: 'pp' },
                { id: 'pro_margin_usd_week', label: 'Pro Margin', value: tier.proMarginUsd.toFixed(2), unit: 'USD/week' },
                { id: 'mercenary_margin_usd_week', label: 'Mercenary Margin', value: tier.mercenaryMarginUsd.toFixed(2), unit: 'USD/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Tier economics and retention trend' },
                { kind: 'panel', ref: 'Diagnostic/StrategicRecommendationsPanel', label: 'Commitment-tier policy context' }
            ],
            reproducible: true,
            confidence: 0.79
        });
    },
    B15: (ctx) => {
        if (ctx.aggregated.length === 0) {
            return createBaseAnswer('B15', {
                answerability: 'P',
                summary: 'Need run trajectory to determine whether the profile favors peak returns or downside resilience.'
            });
        }

        const marginSeries = computePerProviderMarginSeries(ctx);
        const peakMargin = Math.max(...marginSeries);
        const averageMargin = average(marginSeries);
        const risk = computeDeathSpiralRisk(ctx);
        const downsideResilience = 100 - risk.probabilityPct;

        const mode = peakMargin > 30 && downsideResilience < 55
            ? 'Peak returns bias'
            : downsideResilience >= 70
                ? 'Downside resilience bias'
                : 'Balanced / mixed profile';

        return createBaseAnswer('B15', {
            answerability: 'P',
            verdict: mode === 'Downside resilience bias' ? 'yes' : mode === 'Balanced / mixed profile' ? 'at_risk' : 'no',
            summary: `Current objective profile is classified as: ${mode}.`,
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
            thresholds: [
                'Peak returns bias: high peak margin with weak downside resilience',
                'Downside resilience bias: death-spiral probability remains low'
            ],
            metrics: [
                { id: 'peak_margin_usd_week', label: 'Peak Margin', value: peakMargin.toFixed(2), unit: 'USD/week' },
                { id: 'average_margin_usd_week', label: 'Average Margin', value: averageMargin.toFixed(2), unit: 'USD/week' },
                { id: 'downside_resilience_score', label: 'Downside Resilience Score', value: downsideResilience.toFixed(1), unit: '/100' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'ROI and margin profile' },
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Downside resilience profile' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    B16: (ctx) => {
        if (!ctx.baselineAggregated || ctx.baselineAggregated.length === 0 || ctx.aggregated.length === 0) {
            return createBaseAnswer('B16', {
                answerability: 'P',
                summary: 'Need baseline and design-change runs to test robustness improvement without overfitting.'
            });
        }

        const currentRisk = computeDeathSpiralRisk(ctx);
        const baselineRisk = computeDeathSpiralRisk({ ...ctx, aggregated: ctx.baselineAggregated });
        const currentRetention = retentionFromSeries(ctx.aggregated);
        const baselineRetention = retentionFromSeries(ctx.baselineAggregated);
        const currentCoverage = average(ctx.aggregated.slice(-4).map((point) => demandCoverageFromPoint(point)));
        const baselineCoverage = average(ctx.baselineAggregated.slice(-4).map((point) => demandCoverageFromPoint(point)));
        const currentSolvency = average(ctx.aggregated.slice(-4).map((point) => point.solvencyScore?.mean || 0));
        const baselineSolvency = average(ctx.baselineAggregated.slice(-4).map((point) => point.solvencyScore?.mean || 0));

        const improvements = [
            baselineRisk.probabilityPct - currentRisk.probabilityPct,
            currentRetention - baselineRetention,
            currentCoverage - baselineCoverage,
            currentSolvency - baselineSolvency
        ];
        const improvedCount = improvements.filter((delta) => delta > 0).length;
        const harmedCount = improvements.filter((delta) => delta < -1).length;

        const robustWithoutOverfit = improvedCount >= 3 && harmedCount === 0;
        const likelyOverfit = improvedCount <= 1 && harmedCount >= 2;

        return createBaseAnswer('B16', {
            answerability: 'P',
            verdict: robustWithoutOverfit ? 'yes' : likelyOverfit ? 'no' : 'at_risk',
            summary: robustWithoutOverfit
                ? 'Design change improves robustness across multiple dimensions without concentrated tradeoff failure.'
                : likelyOverfit
                    ? 'Design change appears overfit: narrow gains with multiple robustness regressions.'
                    : 'Design change shows mixed robustness impact and needs broader scenario validation.',
            window: 'Design-change run vs baseline run',
            thresholds: [
                'Robust-without-overfit if >=3 of 4 robustness dimensions improve and none materially regress'
            ],
            metrics: [
                { id: 'robust_dimensions_improved', label: 'Improved Robustness Dimensions', value: improvedCount.toString() },
                { id: 'robust_dimensions_harmed', label: 'Harmed Robustness Dimensions', value: harmedCount.toString() },
                { id: 'risk_delta_pp', label: 'Risk Delta', value: (currentRisk.probabilityPct - baselineRisk.probabilityPct).toFixed(1), unit: 'pp' },
                { id: 'retention_delta_pp', label: 'Retention Delta', value: (currentRetention - baselineRetention).toFixed(1), unit: 'pp' },
                { id: 'coverage_delta_pp', label: 'Coverage Delta', value: (currentCoverage - baselineCoverage).toFixed(1), unit: 'pp' },
                { id: 'solvency_delta', label: 'Solvency Delta', value: (currentSolvency - baselineSolvency).toFixed(3), unit: 'x' }
            ],
            evidence: [
                { kind: 'chart', ref: 'ScenarioComparisonPanel', label: 'Cross-run robustness comparison' },
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Downside robustness change context' }
            ],
            reproducible: true,
            confidence: 0.79
        });
    },
    B17: (ctx) => {
        const failureMode = inferFailureModeLabel(ctx);
        const atRisk = failureMode !== 'Stable / No dominant failure mode' && failureMode !== 'Insufficient data';
        const { current } = getLatestPoints(ctx);

        return createBaseAnswer('B17', {
            answerability: 'P',
            verdict: atRisk ? 'at_risk' : 'no',
            summary: atRisk
                ? `Most likely no-intervention failure mode is ${failureMode}.`
                : 'No dominant failure mode is currently signaled without intervention.',
            window: current ? `W${Math.max(1, current.t || 0)}` : 'N/A',
            thresholds: [
                'Failure mode inferred from solvency, churn, demand-coverage, and price-shock signatures'
            ],
            metrics: [
                { id: 'predicted_failure_mode', label: 'Predicted Failure Mode', value: failureMode }
            ],
            evidence: [
                { kind: 'chart', ref: 'Diagnostic/SignalsOfDeathPanel', label: 'Failure precursor signals' },
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'No-intervention downside context' }
            ],
            reproducible: true,
            confidence: 0.83
        });
    },
    B18: (ctx) => {
        if (!ctx.baselineAggregated || ctx.baselineAggregated.length === 0 || ctx.aggregated.length === 0) {
            return createBaseAnswer('B18', {
                answerability: 'P',
                summary: 'Need baseline and proposal run outputs to evaluate cross-scenario robustness improvement.'
            });
        }

        const currentRisk = computeDeathSpiralRisk(ctx);
        const baselineRisk = computeDeathSpiralRisk({ ...ctx, aggregated: ctx.baselineAggregated });
        const currentSolvency = average(ctx.aggregated.slice(-4).map((point) => point.solvencyScore?.mean || 0));
        const baselineSolvency = average(ctx.baselineAggregated.slice(-4).map((point) => point.solvencyScore?.mean || 0));
        const currentRetention = retentionFromSeries(ctx.aggregated);
        const baselineRetention = retentionFromSeries(ctx.baselineAggregated);

        const improvements = [
            currentRisk.probabilityPct <= baselineRisk.probabilityPct - 5,
            currentSolvency >= baselineSolvency + 0.03,
            currentRetention >= baselineRetention,
            currentRisk.providerCollapsePct <= baselineRisk.providerCollapsePct
        ].filter(Boolean).length;

        return createBaseAnswer('B18', {
            answerability: 'P',
            verdict: improvements >= 3 ? 'yes' : improvements >= 1 ? 'at_risk' : 'no',
            summary: improvements >= 3
                ? 'Proposed parameter change improves robustness across core scenario metrics.'
                : improvements >= 1
                    ? 'Proposed parameter change improves some metrics, but robustness gains are not broad yet.'
                    : 'Proposed parameter change does not improve cross-scenario robustness.',
            window: `Proposal run vs baseline run (matching horizon)`,
            thresholds: [
                'Robust improvement requires at least 3 of 4 core robustness metrics improving'
            ],
            metrics: [
                { id: 'robustness_improvements_count', label: 'Improved Robustness Metrics', value: improvements.toString() },
                { id: 'death_spiral_probability_delta_pp', label: 'Death-Spiral Probability Delta', value: (currentRisk.probabilityPct - baselineRisk.probabilityPct).toFixed(1), unit: 'pp' },
                { id: 'late_window_solvency_delta', label: 'Late-Window Solvency Delta', value: (currentSolvency - baselineSolvency).toFixed(3), unit: 'x' },
                { id: 'retention_delta_pp', label: 'Retention Delta', value: (currentRetention - baselineRetention).toFixed(1), unit: 'pp' }
            ],
            evidence: [
                { kind: 'chart', ref: 'ScenarioComparisonPanel', label: 'Proposal vs baseline comparison' },
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Cross-run downside robustness' }
            ],
            reproducible: true,
            confidence: 0.81
        });
    },
    C1: (ctx) => {
        if (ctx.aggregated.length === 0) {
            return createBaseAnswer('C1', {
                answerability: 'P',
                summary: 'Need trajectory data to classify the current governance stress-response archetype.'
            });
        }

        const { current } = getLatestPoints(ctx);
        const centralization = computeCentralizationRiskProxy(ctx);
        const structural = computeStructuralActionScore(ctx);
        const subsidyGap = computeSubsidyGapPct(current);
        const solvency = current?.solvencyScore?.mean || 0;
        const retention = retentionFromSeries(ctx.aggregated);

        const baselineRisk = ctx.baselineAggregated && ctx.baselineAggregated.length > 0
            ? computeDeathSpiralRisk({ ...ctx, aggregated: ctx.baselineAggregated })
            : null;
        const currentRisk = computeDeathSpiralRisk(ctx);
        const riskDelta = baselineRisk ? currentRisk.probabilityPct - baselineRisk.probabilityPct : 0;
        const lateSolvency = average(ctx.aggregated.slice(-4).map((point) => point.solvencyScore?.mean || 0));
        const baselineLateSolvency = baselineRisk
            ? average((ctx.baselineAggregated || []).slice(-4).map((point) => point.solvencyScore?.mean || 0))
            : lateSolvency;
        const solvencyDelta = lateSolvency - baselineLateSolvency;

        const archetype = (() => {
            if (centralization.riskScore >= 55 && centralization.coveragePct >= 95) return 'Emergency Centralization';
            if (subsidyGap >= 25 && solvency < SOLVENCY_GUARDRAILS.criticalRatio) return 'Subsidy Inertia';
            if (structural.score < 35 && riskDelta > -3 && solvencyDelta < 0.02) return 'Narrative Pivot';
            if (structural.score >= 55 && (riskDelta > 0 || retention < RETENTION_GUARDRAILS.benchmarkMinPct)) return 'Overfitting';
            return 'Re-targeting';
        })();

        const verdict = archetype === 'Re-targeting'
            ? 'yes'
            : archetype === 'Narrative Pivot' || archetype === 'Overfitting'
                ? 'at_risk'
                : 'no';

        return createBaseAnswer('C1', {
            answerability: 'P',
            verdict,
            summary: `Current governance response archetype is classified as ${archetype}.`,
            window: `W${Math.max(1, current?.t || 0)} governance state`,
            thresholds: [
                'Archetype classification uses subsidy gap, structural action score, centralization proxy, and baseline-relative risk/solvency deltas'
            ],
            metrics: [
                { id: 'governance_archetype', label: 'Stress-Response Archetype', value: archetype },
                { id: 'subsidy_gap_pct', label: 'Subsidy Gap', value: subsidyGap.toFixed(1), unit: '%' },
                { id: 'structural_action_score', label: 'Structural Action Score', value: structural.score.toFixed(1), unit: '/100' },
                { id: 'centralization_proxy_score', label: 'Centralization Proxy Score', value: centralization.riskScore.toFixed(1), unit: '/100' }
            ],
            evidence: [
                { kind: 'chart', ref: 'ScenarioComparisonPanel', label: 'Governance outcome deltas vs baseline' },
                { kind: 'panel', ref: 'Simulator/Sidebar Tokenomics', label: 'Policy-parameter movement context' }
            ],
            reproducible: true,
            confidence: 0.74
        });
    },
    C2: (ctx) => {
        if (!ctx.baselineAggregated || ctx.baselineAggregated.length === 0 || ctx.aggregated.length === 0) {
            return createBaseAnswer('C2', {
                answerability: 'P',
                summary: 'Need pre-decision baseline and post-decision run windows to attribute subsidy-gap direction.'
            });
        }

        const comparisonWindow = Math.min(4, ctx.aggregated.length, ctx.baselineAggregated.length);
        const baselineSlice = ctx.baselineAggregated.slice(-comparisonWindow);
        const postSlice = ctx.aggregated.slice(-comparisonWindow);
        const baselineGapPct = average(baselineSlice.map((point) => computeSubsidyGapPct(point)));
        const postGapPct = average(postSlice.map((point) => computeSubsidyGapPct(point)));
        const subsidyGapDeltaPp = postGapPct - baselineGapPct;

        const widening = subsidyGapDeltaPp >= 3;
        const narrowing = subsidyGapDeltaPp <= -3;
        const baselineSolvency = average(baselineSlice.map((point) => point.solvencyScore?.mean || 0));
        const postSolvency = average(postSlice.map((point) => point.solvencyScore?.mean || 0));

        const baselineWindowLabel = `W${Math.max(1, baselineSlice[0]?.t || 0)}-${Math.max(1, baselineSlice[baselineSlice.length - 1]?.t || 0)}`;
        const postWindowLabel = `W${Math.max(1, postSlice[0]?.t || 0)}-${Math.max(1, postSlice[postSlice.length - 1]?.t || 0)}`;

        return createBaseAnswer('C2', {
            answerability: 'P',
            verdict: widening ? 'yes' : narrowing ? 'no' : 'at_risk',
            summary: widening
                ? 'Post-decision run shows a wider subsidy gap versus baseline.'
                : narrowing
                    ? 'Post-decision run narrows subsidy dependence versus baseline.'
                    : 'Subsidy-gap movement is mixed or near-flat versus baseline.',
            window: `Baseline ${baselineWindowLabel} vs post-decision ${postWindowLabel}`,
            thresholds: [
                'Subsidy gap = max(0, minted - burned) / minted',
                'Widening alert if post-window gap exceeds baseline by >= 3pp'
            ],
            metrics: [
                { id: 'baseline_subsidy_gap_pct', label: 'Baseline Subsidy Gap', value: baselineGapPct.toFixed(1), unit: '%' },
                { id: 'post_subsidy_gap_pct', label: 'Post-Decision Subsidy Gap', value: postGapPct.toFixed(1), unit: '%' },
                { id: 'subsidy_gap_delta_pp', label: 'Subsidy Gap Delta', value: subsidyGapDeltaPp.toFixed(1), unit: 'pp' },
                { id: 'baseline_solvency_ratio', label: 'Baseline Solvency', value: baselineSolvency.toFixed(3), unit: 'x' },
                { id: 'post_solvency_ratio', label: 'Post-Decision Solvency', value: postSolvency.toFixed(3), unit: 'x' }
            ],
            evidence: [
                { kind: 'chart', ref: 'ScenarioComparisonPanel', label: 'Pre/post governance run comparison' },
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Subsidy-gap and solvency direction context' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    C3: (ctx) => {
        if (ctx.aggregated.length < 6) {
            return createBaseAnswer('C3', {
                answerability: 'P',
                summary: 'Need at least six timesteps to evaluate short-lived retention effects vs long-term fragility.'
            });
        }

        const segment = Math.max(2, Math.floor(ctx.aggregated.length / 3));
        const early = ctx.aggregated.slice(0, segment);
        const middle = ctx.aggregated.slice(segment, segment * 2);
        const late = ctx.aggregated.slice(-segment);

        const earlyRetention = retentionFromSeries(early);
        const middleRetention = retentionFromSeries(middle);
        const lateRetention = retentionFromSeries(late);

        const earlySolvency = average(early.map((point) => point.solvencyScore?.mean || 0));
        const lateSolvency = average(late.map((point) => point.solvencyScore?.mean || 0));
        const risk = computeDeathSpiralRisk(ctx);

        const shortLivedRetention = (middleRetention - earlyRetention) >= 2 && (lateRetention - middleRetention) <= -2;
        const longTermFragility = (lateSolvency - earlySolvency) <= -0.05 || risk.probabilityPct >= 45;

        return createBaseAnswer('C3', {
            answerability: 'P',
            verdict: shortLivedRetention && longTermFragility ? 'yes' : longTermFragility ? 'at_risk' : 'no',
            summary: shortLivedRetention && longTermFragility
                ? 'Observed pattern suggests temporary retention support with worsening long-run fragility.'
                : 'No strong evidence of temporary-only retention support driving long-run fragility in this run.',
            window: `Early/Mid/Late segments across W${Math.max(1, ctx.aggregated[0]?.t || 0)}-${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
            thresholds: [
                'Short-lived retention signal: middle retention > early by >=2pp and late drops >=2pp from middle',
                'Long-run fragility signal: late solvency <= early by 0.05x or death-spiral probability >= 45%'
            ],
            metrics: [
                { id: 'early_retention_pct', label: 'Early-Segment Retention', value: earlyRetention.toFixed(1), unit: '%' },
                { id: 'middle_retention_pct', label: 'Mid-Segment Retention', value: middleRetention.toFixed(1), unit: '%' },
                { id: 'late_retention_pct', label: 'Late-Segment Retention', value: lateRetention.toFixed(1), unit: '%' },
                { id: 'solvency_late_minus_early', label: 'Late vs Early Solvency', value: (lateSolvency - earlySolvency).toFixed(3), unit: 'x' },
                { id: 'death_spiral_probability_pct', label: 'Death-Spiral Probability', value: risk.probabilityPct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Retention trajectory over time' },
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Fragility trajectory over time' }
            ],
            reproducible: true,
            confidence: 0.73
        });
    },
    C4: (ctx) => {
        if (ctx.aggregated.length < 2) {
            return createBaseAnswer('C4', {
                answerability: 'P',
                summary: 'Need at least two timesteps to compare output-value rewarding versus participation-volume rewarding.'
            });
        }

        const first = ctx.aggregated[0];
        const last = ctx.aggregated[ctx.aggregated.length - 1];
        const outputDeltaPct = pctChange(last?.demand_served?.mean || 0, first?.demand_served?.mean || 0);
        const rewardDeltaPct = pctChange(last?.minted?.mean || 0, first?.minted?.mean || 0);
        const participationDeltaPct = pctChange(last?.providers?.mean || 0, first?.providers?.mean || 0);
        const trackingGap = Math.abs(rewardDeltaPct - outputDeltaPct);
        const volumeBias = rewardDeltaPct > outputDeltaPct + 10 && participationDeltaPct > 0;

        return createBaseAnswer('C4', {
            answerability: 'P',
            verdict: volumeBias ? 'no' : trackingGap <= 10 ? 'yes' : 'at_risk',
            summary: volumeBias
                ? 'Rewards currently appear skewed toward participation volume rather than economically valuable output.'
                : 'Rewarding appears more aligned with delivered output than raw participation growth.',
            window: `W${Math.max(1, first?.t || 0)} to W${Math.max(1, last?.t || 0)}`,
            thresholds: [
                'Output alignment signal: |reward delta - output delta| <= 10pp',
                'Participation-volume bias: reward growth exceeds output growth by >10pp while provider count expands'
            ],
            metrics: [
                { id: 'output_delta_pct', label: 'Demand Served Delta', value: outputDeltaPct.toFixed(1), unit: '%' },
                { id: 'reward_delta_pct', label: 'Minted Rewards Delta', value: rewardDeltaPct.toFixed(1), unit: '%' },
                { id: 'provider_delta_pct', label: 'Provider Count Delta', value: participationDeltaPct.toFixed(1), unit: '%' },
                { id: 'reward_output_tracking_gap_pp', label: 'Reward-Output Gap', value: trackingGap.toFixed(1), unit: 'pp' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Output trajectory context' },
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Reward outflow context' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    C5: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('C5', {
                answerability: 'P',
                summary: 'Need at least two timesteps to evaluate whether margin deterioration is leading risk.'
            });
        }

        const currentEconomics = getProviderEconomicsAtPoint(ctx, current);
        const previousEconomics = getProviderEconomicsAtPoint(ctx, previous);
        const marginDelta = currentEconomics.weeklyMarginPerProviderUsd - previousEconomics.weeklyMarginPerProviderUsd;
        const churnDelta = churnPctFromPoint(current) - churnPctFromPoint(previous);
        const leadingWarning = marginDelta < 0 && (churnDelta > 0 || churnPctFromPoint(current) >= CHURN_GUARDRAILS.panicPctPerWeek * 0.6);

        return createBaseAnswer('C5', {
            answerability: 'Y',
            verdict: leadingWarning ? 'yes' : 'no',
            summary: leadingWarning
                ? 'Provider margin deterioration is acting as a leading warning signal.'
                : 'Provider margin deterioration is not currently signaling near-term fragility.',
            window: `W${Math.max(1, previous.t || 0)} vs W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Leading warning when margin is declining and churn is rising',
                `Elevated churn threshold >= ${(CHURN_GUARDRAILS.panicPctPerWeek * 0.6).toFixed(1)}%/week`
            ],
            metrics: [
                { id: 'margin_delta_wow_usd_week', label: 'WoW Margin Delta', value: marginDelta.toFixed(2), unit: 'USD/week' },
                { id: 'churn_delta_wow_pp', label: 'WoW Churn Delta', value: churnDelta.toFixed(2), unit: 'pp' },
                { id: 'current_margin_usd_week', label: 'Current Margin', value: currentEconomics.weeklyMarginPerProviderUsd.toFixed(2), unit: 'USD/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Margin and churn trend' },
                { kind: 'chart', ref: 'Diagnostic/SolvencyScorecard', label: 'Cost-pressure diagnostics' }
            ],
            reproducible: true,
            confidence: 0.86
        });
    },
    C6: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('C6', {
                answerability: 'P',
                summary: 'Need current timestep to estimate breakeven distribution.'
            });
        }

        const totalProviders = Math.max(1, current.providers?.mean || 1);
        const belowBreakeven = Math.max(0, current.underwaterCount?.mean || 0);
        const estimatedPaybackMonths = computeEstimatedPaybackMonths(ctx);
        const nearBreakevenShare = Number.isFinite(estimatedPaybackMonths) && estimatedPaybackMonths > PAYBACK_GUARDRAILS.healthyMaxMonths
            ? Math.min(0.45, 0.1 + ((estimatedPaybackMonths - PAYBACK_GUARDRAILS.healthyMaxMonths) / PAYBACK_GUARDRAILS.healthyMaxMonths))
            : 0.08;
        const nearBreakeven = Math.max(0, (totalProviders - belowBreakeven) * nearBreakevenShare);
        const belowPct = safeDivide(belowBreakeven, totalProviders, 0) * 100;
        const nearPct = safeDivide(nearBreakeven, totalProviders, 0) * 100;

        return createBaseAnswer('C6', {
            answerability: 'P',
            verdict: belowPct >= 20 ? 'at_risk' : 'yes',
            summary: `Estimated ${Math.round(belowBreakeven)} providers are below breakeven and ~${Math.round(nearBreakeven)} are near breakeven.`,
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Below-breakeven watchlist >= 15% of providers',
                'Below-breakeven intervention >= 20% of providers'
            ],
            metrics: [
                { id: 'providers_total', label: 'Total Providers', value: totalProviders.toFixed(0) },
                { id: 'providers_below_breakeven', label: 'Below Breakeven', value: belowBreakeven.toFixed(0) },
                { id: 'providers_below_breakeven_pct', label: 'Below Breakeven Share', value: belowPct.toFixed(1), unit: '%' },
                { id: 'providers_near_breakeven_est', label: 'Near Breakeven (Estimated)', value: nearBreakeven.toFixed(0) },
                { id: 'providers_near_breakeven_pct', label: 'Near Breakeven Share (Estimated)', value: nearPct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Diagnostic/SolvencyScorecard', label: 'Underwater provider count and economics' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Payback and profitability path' }
            ],
            reproducible: true,
            confidence: 0.76
        });
    },
    C7: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current || ctx.aggregated.length < 4) {
            return createBaseAnswer('C7', {
                answerability: 'P',
                summary: 'Need multi-week trajectory to evaluate delayed churn risk from price sensitivity.'
            });
        }

        const prices = ctx.aggregated.map((point) => point.price?.mean || 0);
        const peakPrice = Math.max(...prices, 0);
        const priceDrawdownPct = peakPrice > 0
            ? Math.max(0, safeDivide(peakPrice - (current.price?.mean || 0), peakPrice, 0) * 100)
            : 0;
        const lag = estimateShockLag(ctx);
        const delayedRisk = priceDrawdownPct >= 15 && lag.lagToChurnWeeks >= 1;

        return createBaseAnswer('C7', {
            answerability: 'P',
            verdict: delayedRisk ? 'yes' : priceDrawdownPct >= 10 ? 'at_risk' : 'no',
            summary: delayedRisk
                ? `Price sensitivity is translating into delayed churn risk (shock-to-churn lag ${lag.lagToChurnWeeks} weeks).`
                : 'Delayed churn translation from price sensitivity is weak or not yet activated.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)}-${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Material price sensitivity if drawdown >= 15%',
                'Delayed churn translation if shock-to-churn lag >= 1 week'
            ],
            metrics: [
                { id: 'price_drawdown_pct', label: 'Price Drawdown from Peak', value: priceDrawdownPct.toFixed(1), unit: '%' },
                { id: 'lag_shock_to_churn_weeks', label: 'Shock -> Churn Lag', value: lag.lagToChurnWeeks >= 0 ? lag.lagToChurnWeeks.toString() : 'No breach', unit: 'weeks' },
                { id: 'current_churn_pct_week', label: 'Current Churn', value: churnPctFromPoint(current).toFixed(2), unit: '%/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Price drawdown and churn translation timeline' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Churn acceleration context' }
            ],
            reproducible: true,
            confidence: 0.82
        });
    },
    C8: (ctx) => {
        if (!ctx.baselineAggregated || ctx.baselineAggregated.length === 0 || ctx.aggregated.length === 0) {
            return createBaseAnswer('C8', {
                answerability: 'P',
                summary: 'Need baseline and post-intervention runs to compare structural change magnitude against outcome shifts.'
            });
        }

        const structural = computeStructuralActionScore(ctx);
        const interventionRisk = computeDeathSpiralRisk(ctx);
        const baselineRisk = computeDeathSpiralRisk({ ...ctx, aggregated: ctx.baselineAggregated });
        const interventionSolvency = average(ctx.aggregated.slice(-4).map((point) => point.solvencyScore?.mean || 0));
        const baselineSolvency = average(ctx.baselineAggregated.slice(-4).map((point) => point.solvencyScore?.mean || 0));
        const interventionRetention = retentionFromSeries(ctx.aggregated);
        const baselineRetention = retentionFromSeries(ctx.baselineAggregated);

        const riskDelta = interventionRisk.probabilityPct - baselineRisk.probabilityPct;
        const solvencyDelta = interventionSolvency - baselineSolvency;
        const retentionDelta = interventionRetention - baselineRetention;
        const structuralLight = structural.score < 35;
        const outcomesNotImproved = riskDelta > -3 && solvencyDelta < 0.02 && retentionDelta < 2;
        const narrativeReliance = structuralLight && outcomesNotImproved;

        return createBaseAnswer('C8', {
            answerability: 'P',
            verdict: narrativeReliance ? 'yes' : structuralLight ? 'at_risk' : 'no',
            summary: narrativeReliance
                ? 'Current posture looks narrative-heavy: structural parameter movement is limited while outcomes do not materially improve.'
                : structuralLight
                    ? 'Structural change intensity is modest; monitor whether outcomes improve enough to justify narrative framing.'
                    : 'Intervention appears structurally grounded relative to observed outcomes.',
            window: 'Post-intervention run vs baseline run',
            thresholds: [
                'Structural action score < 35 implies low structural-change intensity',
                'Narrative reliance risk if structural score < 35 and risk/solvency/retention improvements remain weak'
            ],
            metrics: [
                { id: 'structural_action_score', label: 'Structural Action Score', value: structural.score.toFixed(1), unit: '/100' },
                { id: 'risk_delta_pp', label: 'Death-Spiral Risk Delta', value: riskDelta.toFixed(1), unit: 'pp' },
                { id: 'late_solvency_delta', label: 'Late-Window Solvency Delta', value: solvencyDelta.toFixed(3), unit: 'x' },
                { id: 'retention_delta_pp', label: 'Retention Delta', value: retentionDelta.toFixed(1), unit: 'pp' }
            ],
            evidence: [
                { kind: 'chart', ref: 'ScenarioComparisonPanel', label: 'Outcome deltas versus baseline' },
                { kind: 'panel', ref: 'Simulator/Sidebar Tokenomics', label: 'Structural policy-parameter movement' }
            ],
            reproducible: true,
            confidence: 0.72
        });
    },
    C9: (ctx) => {
        if (ctx.aggregated.length === 0) {
            return createBaseAnswer('C9', {
                answerability: 'P',
                summary: 'Need trajectory data to compute centralization-risk proxies.'
            });
        }

        const proxy = computeCentralizationRiskProxy(ctx);
        const driftDetected = proxy.riskScore >= 55
            || (proxy.coveragePct >= 95 && proxy.providerCompressionPct >= 20 && proxy.top10ShareProxyPct >= 5);

        return createBaseAnswer('C9', {
            answerability: 'P',
            verdict: driftDetected ? 'yes' : proxy.riskScore >= 40 ? 'at_risk' : 'no',
            summary: driftDetected
                ? 'Coverage stability appears increasingly dependent on a more concentrated provider base.'
                : proxy.riskScore >= 40
                    ? 'Centralization-risk proxies are elevated and should be monitored.'
                    : 'No strong emergency-centralization drift is detected in current proxies.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)}-${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
            thresholds: [
                'Centralization proxy score >= 55 indicates high drift risk',
                'Drift signal if high coverage persists alongside >=20% provider compression and concentrated-share proxy rise'
            ],
            metrics: [
                { id: 'centralization_proxy_score', label: 'Centralization Proxy Score', value: proxy.riskScore.toFixed(1), unit: '/100' },
                { id: 'provider_compression_pct', label: 'Provider Compression', value: proxy.providerCompressionPct.toFixed(1), unit: '%' },
                { id: 'top10_share_proxy_pct', label: 'Top-10 Share Proxy', value: proxy.top10ShareProxyPct.toFixed(1), unit: '%' },
                { id: 'foundation_fallback_proxy_pct', label: 'Foundation Fallback Proxy', value: proxy.foundationFallbackProxyPct.toFixed(1), unit: '%' },
                { id: 'cohort_hhi_pct', label: 'Cohort Concentration HHI', value: proxy.cohortConcentrationHhiPct.toFixed(1), unit: '%' },
                { id: 'coverage_pct', label: 'Demand Coverage', value: proxy.coveragePct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Coverage continuity under provider attrition' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Provider concentration and churn context' }
            ],
            reproducible: true,
            confidence: 0.66
        });
    },
    C10: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current || ctx.aggregated.length < 2) {
            return createBaseAnswer('C10', {
                answerability: 'P',
                summary: 'Need tier trajectories to evaluate whether policy protects high-commitment providers.'
            });
        }

        const proSeries = ctx.aggregated.map((point) => point.proCount?.mean || 0);
        const mercSeries = ctx.aggregated.map((point) => point.mercenaryCount?.mean || 0);
        const proRetention = safeDivide(proSeries[proSeries.length - 1] || 0, Math.max(...proSeries, 1), 0) * 100;
        const mercRetention = safeDivide(mercSeries[mercSeries.length - 1] || 0, Math.max(...mercSeries, 1), 0) * 100;
        const tier = getTierMarginSnapshot(ctx, current);
        const protectionGap = proRetention - mercRetention;
        const protectedCommitmentTier = protectionGap >= 3 && tier.proMarginUsd >= tier.mercenaryMarginUsd;

        return createBaseAnswer('C10', {
            answerability: 'Y',
            verdict: protectedCommitmentTier ? 'yes' : protectionGap > 0 ? 'at_risk' : 'no',
            summary: protectedCommitmentTier
                ? 'Current policy appears to protect high-commitment providers better than mercenary supply.'
                : 'Current policy does not clearly protect high-commitment providers.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Policy-protection signal if pro retention exceeds mercenary retention by >= 3pp',
                'Policy-protection signal if pro margin >= mercenary margin'
            ],
            metrics: [
                { id: 'pro_retention_pct', label: 'Pro Retention', value: proRetention.toFixed(1), unit: '%' },
                { id: 'mercenary_retention_pct', label: 'Mercenary Retention', value: mercRetention.toFixed(1), unit: '%' },
                { id: 'commitment_protection_gap_pp', label: 'Commitment Protection Gap', value: protectionGap.toFixed(1), unit: 'pp' },
                { id: 'pro_margin_usd_week', label: 'Pro Margin', value: tier.proMarginUsd.toFixed(2), unit: 'USD/week' },
                { id: 'mercenary_margin_usd_week', label: 'Mercenary Margin', value: tier.mercenaryMarginUsd.toFixed(2), unit: 'USD/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Tier-specific economics trend' },
                { kind: 'chart', ref: 'Simulator/Sandbox Tier 1', label: 'Retention quality trend' }
            ],
            reproducible: true,
            confidence: 0.84
        });
    },
    C11: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('C11', {
                answerability: 'P',
                summary: 'Need current run state to evaluate 4/8/12 week bonus-extension policy outcomes.'
            });
        }

        const projections = buildRewardExtensionSweep(ctx, current);
        const w4 = projections[0];
        const w8 = projections[1];
        const w12 = projections[2];
        const emergencyRiskBy12w = w12.projectedSubsidyGapPct >= 30 || w12.projectedSolvency < SOLVENCY_GUARDRAILS.criticalRatio;
        const moderationPreferred = w4.retentionDeltaPp >= 1 && w8.subsidyGapDeltaPp < 6;

        return createBaseAnswer('C11', {
            answerability: 'P',
            verdict: emergencyRiskBy12w ? 'at_risk' : moderationPreferred ? 'yes' : 'no',
            summary: emergencyRiskBy12w
                ? 'Long beta/bonus extension likely pushes governance into higher subsidy or solvency risk by 12 weeks.'
                : moderationPreferred
                    ? '4-8 week extension appears policy-feasible; 12-week extension should remain conditional.'
                    : 'Extension options do not currently show a clear governance-efficient tradeoff.',
            window: `Policy counterfactual from current state W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Emergency-risk proxy at 12 weeks if projected subsidy gap >= 30% or projected solvency < 1.0x',
                'Preferred window if 4-week retention improves and 8-week subsidy-gap widening remains < 6pp'
            ],
            metrics: [
                { id: 'ext4_projected_retention_pct', label: '4w Projected Retention', value: w4.projectedRetentionPct.toFixed(1), unit: '%' },
                { id: 'ext8_projected_retention_pct', label: '8w Projected Retention', value: w8.projectedRetentionPct.toFixed(1), unit: '%' },
                { id: 'ext12_projected_retention_pct', label: '12w Projected Retention', value: w12.projectedRetentionPct.toFixed(1), unit: '%' },
                { id: 'ext4_subsidy_gap_pct', label: '4w Projected Subsidy Gap', value: w4.projectedSubsidyGapPct.toFixed(1), unit: '%' },
                { id: 'ext8_subsidy_gap_pct', label: '8w Projected Subsidy Gap', value: w8.projectedSubsidyGapPct.toFixed(1), unit: '%' },
                { id: 'ext12_subsidy_gap_pct', label: '12w Projected Subsidy Gap', value: w12.projectedSubsidyGapPct.toFixed(1), unit: '%' },
                { id: 'ext12_projected_solvency', label: '12w Projected Solvency', value: w12.projectedSolvency.toFixed(3), unit: 'x' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Simulator/Sidebar Tokenomics', label: 'Reward and burn controls informing counterfactual' },
                { kind: 'chart', ref: 'ScenarioComparisonPanel', label: 'Governance tradeoff comparison surface' }
            ],
            reproducible: true,
            confidence: 0.72
        });
    },
    C12: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current || ctx.aggregated.length < 2) {
            return createBaseAnswer('C12', {
                answerability: 'P',
                summary: 'Need scenario trajectory to estimate effects of stronger demand-linking.'
            });
        }

        const first = ctx.aggregated[0];
        const last = ctx.aggregated[ctx.aggregated.length - 1];
        const usageDeltaPct = pctChange(last?.demand_served?.mean || 0, first?.demand_served?.mean || 0);
        const rewardDeltaPct = pctChange(last?.minted?.mean || 0, first?.minted?.mean || 0);
        const trackingGapPct = Math.abs(rewardDeltaPct - usageDeltaPct);
        const projectedGapWithMoreDemandLinking = trackingGapPct * 0.6;
        const projectedSolvencyWithMoreDemandLinking = (current.solvencyScore?.mean || 0) + Math.max(0, (trackingGapPct - projectedGapWithMoreDemandLinking) / 100);

        return createBaseAnswer('C12', {
            answerability: 'P',
            verdict: projectedGapWithMoreDemandLinking < trackingGapPct ? 'yes' : 'at_risk',
            summary: ctx.params.emissionModel === 'kpi'
                ? 'Demand-linking is already active; further tightening likely yields incremental improvements.'
                : 'Increasing demand-linking is projected to reduce reward-usage mismatch and improve solvency directionally.',
            window: `W${Math.max(1, first?.t || 0)} to W${Math.max(1, last?.t || 0)}`,
            thresholds: [
                'Projected benefit if reward-usage tracking gap decreases',
                'Projected benefit if solvency direction improves'
            ],
            metrics: [
                { id: 'current_tracking_gap_pp', label: 'Current Reward-Usage Gap', value: trackingGapPct.toFixed(1), unit: 'pp' },
                { id: 'projected_tracking_gap_pp', label: 'Projected Gap With More Demand-Linking', value: projectedGapWithMoreDemandLinking.toFixed(1), unit: 'pp' },
                { id: 'current_solvency_ratio', label: 'Current Solvency', value: (current.solvencyScore?.mean || 0).toFixed(3), unit: 'x' },
                { id: 'projected_solvency_ratio', label: 'Projected Solvency (Directional)', value: projectedSolvencyWithMoreDemandLinking.toFixed(3), unit: 'x' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Simulator/Sidebar Tokenomics', label: 'Emission-model controls' },
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Burn/mint response context' }
            ],
            reproducible: true,
            confidence: 0.73
        });
    },
    C13: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('C13', {
                answerability: 'P',
                summary: 'Need current timestep to project burn/emission adjustment impact.'
            });
        }

        const projection = computeBurnEmissionPolicyProjection(ctx, current);

        return createBaseAnswer('C13', {
            answerability: 'Y',
            verdict: projection.projectedBurnUpEmissionDownSolvency > projection.currentSolvency ? 'yes' : 'at_risk',
            summary: 'Higher burn and lower effective emission pressure are directionally favorable for solvency in the current state.',
            window: `W${Math.max(1, current.t || 0)} directional estimate`,
            thresholds: [
                'Directional projection assumes +10pp burn / lower emission decay pressure improves solvency',
                'Inverse change is expected to worsen solvency'
            ],
            metrics: [
                { id: 'current_solvency_ratio', label: 'Current Solvency', value: projection.currentSolvency.toFixed(3), unit: 'x' },
                {
                    id: 'projected_solvency_burn_up_emission_down',
                    label: 'Projected Solvency (Burn Up, Emission Down)',
                    value: projection.projectedBurnUpEmissionDownSolvency.toFixed(3),
                    unit: 'x'
                },
                {
                    id: 'projected_solvency_burn_down_emission_up',
                    label: 'Projected Solvency (Burn Down, Emission Up)',
                    value: projection.projectedBurnDownEmissionUpSolvency.toFixed(3),
                    unit: 'x'
                }
            ],
            evidence: [
                { kind: 'panel', ref: 'Simulator/Sidebar Tokenomics', label: 'Burn and emission controls' },
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Solvency sensitivity context' }
            ],
            reproducible: true,
            confidence: 0.7
        });
    },
    C14: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('C14', {
                answerability: 'P',
                summary: 'Need current timestep to evaluate governance review triggers.'
            });
        }

        const solvency = current.solvencyScore?.mean || 0;
        const churnPct = churnPctFromPoint(current);
        const demandCoverage = demandCoverageFromPoint(current);
        const retention = retentionFromSeries(ctx.aggregated);
        const paybackMonths = computeEstimatedPaybackMonths(ctx);

        const reviewTriggers = [
            solvency < (SOLVENCY_GUARDRAILS.criticalRatio + 0.1) ? 'Solvency drift (below 1.1x)' : null,
            paybackMonths > PAYBACK_GUARDRAILS.healthyMaxMonths ? `Payback above ${PAYBACK_GUARDRAILS.healthyMaxMonths} months` : null,
            churnPct >= (CHURN_GUARDRAILS.panicPctPerWeek * 0.6) ? 'Churn pressure (>=60% of panic zone)' : null,
            demandCoverage < 90 ? 'Demand coverage below 90%' : null,
            retention < RETENTION_GUARDRAILS.benchmarkMinPct ? 'Retention below benchmark floor' : null
        ].filter((trigger): trigger is string => Boolean(trigger));

        return createBaseAnswer('C14', {
            answerability: 'P',
            verdict: reviewTriggers.length > 0 ? 'at_risk' : 'no',
            summary: reviewTriggers.length > 0
                ? `Governance review should be triggered by: ${reviewTriggers.join(', ')}.`
                : 'No governance review trigger is currently breached.',
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Solvency < 1.1x',
                `Payback > ${PAYBACK_GUARDRAILS.healthyMaxMonths} months`,
                `Churn >= ${(CHURN_GUARDRAILS.panicPctPerWeek * 0.6).toFixed(1)}%/week`,
                'Demand coverage < 90%'
            ],
            metrics: [
                { id: 'governance_review_trigger_count', label: 'Triggered Review KPIs', value: reviewTriggers.length.toString() },
                { id: 'solvency_ratio', label: 'Solvency Ratio', value: solvency.toFixed(3), unit: 'x' },
                {
                    id: 'payback_months_est',
                    label: 'Estimated Payback',
                    value: Number.isFinite(paybackMonths) ? paybackMonths.toFixed(2) : 'Non-positive profit',
                    unit: 'mo'
                },
                { id: 'churn_rate_pct', label: 'Churn Rate', value: churnPct.toFixed(2), unit: '%/week' },
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: demandCoverage.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Solvency and runway trigger map' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Churn and payback trigger map' }
            ],
            reproducible: true,
            confidence: 0.84
        });
    },
    C15: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('C15', {
                answerability: 'P',
                summary: 'Need current timestep to evaluate emergency-action triggers.'
            });
        }

        const solvency = current.solvencyScore?.mean || 0;
        const churnPct = churnPctFromPoint(current);
        const demandCoverage = demandCoverageFromPoint(current);
        const paybackMonths = computeEstimatedPaybackMonths(ctx);
        const risk = computeDeathSpiralRisk(ctx);

        const emergencyTriggers = [
            solvency < SOLVENCY_GUARDRAILS.criticalRatio ? 'Solvency below 1.0x' : null,
            !Number.isFinite(paybackMonths) || paybackMonths > PAYBACK_GUARDRAILS.watchlistMaxMonths
                ? `Payback above ${PAYBACK_GUARDRAILS.watchlistMaxMonths} months or non-positive profit`
                : null,
            churnPct >= CHURN_GUARDRAILS.panicPctPerWeek ? `Churn inside panic zone (>=${CHURN_GUARDRAILS.panicPctPerWeek}%/week)` : null,
            demandCoverage < 80 ? 'Demand coverage below 80%' : null,
            risk.probabilityPct >= 50 ? 'Death-spiral probability above 50%' : null
        ].filter((trigger): trigger is string => Boolean(trigger));

        return createBaseAnswer('C15', {
            answerability: 'P',
            verdict: emergencyTriggers.length > 0 ? 'at_risk' : 'no',
            summary: emergencyTriggers.length > 0
                ? `Emergency action threshold breached: ${emergencyTriggers.join(', ')}.`
                : 'No emergency-action trigger is currently breached.',
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Solvency < 1.0x',
                `Payback > ${PAYBACK_GUARDRAILS.watchlistMaxMonths} months`,
                `Churn >= ${CHURN_GUARDRAILS.panicPctPerWeek}%/week`,
                'Death-spiral probability >= 50%'
            ],
            metrics: [
                { id: 'emergency_trigger_count', label: 'Triggered Emergency KPIs', value: emergencyTriggers.length.toString() },
                { id: 'solvency_ratio', label: 'Solvency Ratio', value: solvency.toFixed(3), unit: 'x' },
                { id: 'churn_rate_pct', label: 'Churn Rate', value: churnPct.toFixed(2), unit: '%/week' },
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: demandCoverage.toFixed(1), unit: '%' },
                { id: 'death_spiral_probability_pct', label: 'Death-Spiral Probability', value: risk.probabilityPct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Crisis-risk and insolvency exposure' },
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Solvency path against critical floor' }
            ],
            reproducible: true,
            confidence: 0.86
        });
    },
    C16: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('C16', {
                answerability: 'P',
                summary: 'Need at least two timesteps to detect latent degradation masked by capacity metrics.'
            });
        }

        const coverage = demandCoverageFromPoint(current);
        const providerDeltaPct = pctChange(current.providers?.mean || 0, previous.providers?.mean || 0);
        const churnNow = churnPctFromPoint(current);
        const retention = retentionFromSeries(ctx.aggregated);
        const latentMasking = coverage >= 95 && (
            providerDeltaPct <= -2 ||
            churnNow >= CHURN_GUARDRAILS.panicPctPerWeek * 0.7 ||
            retention < RETENTION_GUARDRAILS.benchmarkMinPct
        );

        return createBaseAnswer('C16', {
            answerability: 'Y',
            verdict: latentMasking ? 'yes' : 'no',
            summary: latentMasking
                ? 'Capacity/coverage metrics are likely masking latent degradation risk.'
                : 'No strong masking pattern is detected between capacity metrics and latent degradation signals.',
            window: `W${Math.max(1, previous.t || 0)} vs W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Masking pattern: coverage >= 95% with simultaneous provider/churn deterioration'
            ],
            metrics: [
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: coverage.toFixed(1), unit: '%' },
                { id: 'providers_delta_wow_pct', label: 'WoW Providers Delta', value: providerDeltaPct.toFixed(2), unit: '%' },
                { id: 'churn_rate_pct', label: 'Churn Rate', value: churnNow.toFixed(2), unit: '%/week' },
                { id: 'retention_pct', label: 'Retention', value: retention.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Coverage and demand-served trend' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Provider/churn latent degradation trend' }
            ],
            reproducible: true,
            confidence: 0.85
        });
    },
    C17: (ctx) => {
        if (ctx.aggregated.length < 2) {
            return createBaseAnswer('C17', {
                answerability: 'P',
                summary: 'Need at least two timesteps to assess burn-to-mint trajectory direction.'
            });
        }

        const window = Math.min(4, ctx.aggregated.length);
        const earlySlice = ctx.aggregated.slice(0, window);
        const lateSlice = ctx.aggregated.slice(-window);
        const avgEarlySolvency = safeDivide(
            earlySlice.reduce((sum, point) => sum + (point.solvencyScore?.mean || 0), 0),
            earlySlice.length,
            0
        );
        const avgLateSolvency = safeDivide(
            lateSlice.reduce((sum, point) => sum + (point.solvencyScore?.mean || 0), 0),
            lateSlice.length,
            0
        );
        const delta = avgLateSolvency - avgEarlySolvency;
        const improving = delta > 0.03 && avgLateSolvency >= SOLVENCY_GUARDRAILS.criticalRatio;
        const flatButSolvent = Math.abs(delta) <= 0.03 && avgLateSolvency >= SOLVENCY_GUARDRAILS.criticalRatio;

        return createBaseAnswer('C17', {
            answerability: 'Y',
            verdict: improving ? 'yes' : flatButSolvent ? 'at_risk' : 'no',
            summary: improving
                ? 'Burn-to-mint trajectory is improving toward solvency.'
                : flatButSolvent
                    ? 'Trajectory is near-flat around solvency; improvement is not yet convincing.'
                    : 'Burn-to-mint trajectory is moving away from durable solvency.',
            window: `Early W${Math.max(1, earlySlice[0]?.t || 0)}-${Math.max(1, earlySlice[earlySlice.length - 1]?.t || 0)} vs Late W${Math.max(1, lateSlice[0]?.t || 0)}-${Math.max(1, lateSlice[lateSlice.length - 1]?.t || 0)}`,
            thresholds: [
                'Improving if late-window solvency minus early-window solvency > 0.03x',
                'Durable solvency requires late-window average >= 1.0x'
            ],
            metrics: [
                { id: 'solvency_avg_early', label: 'Early-Window Solvency', value: avgEarlySolvency.toFixed(3), unit: 'x' },
                { id: 'solvency_avg_late', label: 'Late-Window Solvency', value: avgLateSolvency.toFixed(3), unit: 'x' },
                { id: 'solvency_window_delta', label: 'Trajectory Delta', value: delta.toFixed(3), unit: 'x' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Burn-to-mint trajectory context' },
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Burn and mint path under current policy' }
            ],
            reproducible: true,
            confidence: 0.9
        });
    },
    C18: (ctx) => {
        if (!ctx.baselineAggregated || ctx.baselineAggregated.length === 0 || ctx.aggregated.length === 0) {
            return createBaseAnswer('C18', {
                answerability: 'P',
                summary: 'Need a baseline comparison run to classify intervention impact.'
            });
        }

        const interventionRisk = computeDeathSpiralRisk(ctx);
        const baselineRisk = computeDeathSpiralRisk({
            ...ctx,
            aggregated: ctx.baselineAggregated
        });

        const probabilityDelta = interventionRisk.probabilityPct - baselineRisk.probabilityPct;
        const insolvencyWeeksDelta = interventionRisk.insolvencyWeeks - baselineRisk.insolvencyWeeks;
        const collapseDelta = interventionRisk.providerCollapsePct - baselineRisk.providerCollapsePct;

        const improved = probabilityDelta < -5 && insolvencyWeeksDelta <= 0 && collapseDelta <= 0;
        const delayedOnly = (probabilityDelta <= 0) && (interventionRisk.probabilityPct >= 40 || interventionRisk.insolvencyWeeks > 0);

        return createBaseAnswer('C18', {
            answerability: 'P',
            verdict: improved ? 'yes' : delayedOnly ? 'at_risk' : 'no',
            summary: improved
                ? 'Intervention run reduces fragility versus baseline across core risk markers.'
                : delayedOnly
                    ? 'Intervention appears to delay fragility, but risk remains materially elevated.'
                    : 'Intervention run does not reduce fragility versus baseline.',
            window: `Intervention W${Math.max(1, ctx.aggregated[0]?.t || 0)}-${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)} vs baseline`,
            thresholds: [
                'Improved if death-spiral probability decreases by >5pp and insolvency/collapse do not worsen',
                'Delay-only if probability does not worsen but stays in alert range (>=40%)'
            ],
            metrics: [
                { id: 'intervention_death_spiral_probability_pct', label: 'Intervention Death-Spiral Probability', value: interventionRisk.probabilityPct.toFixed(1), unit: '%' },
                { id: 'baseline_death_spiral_probability_pct', label: 'Baseline Death-Spiral Probability', value: baselineRisk.probabilityPct.toFixed(1), unit: '%' },
                { id: 'death_spiral_probability_delta_pp', label: 'Probability Delta (Intervention-Baseline)', value: probabilityDelta.toFixed(1), unit: 'pp' },
                { id: 'insolvency_weeks_delta', label: 'Insolvency Weeks Delta', value: insolvencyWeeksDelta.toString(), unit: 'weeks' },
                { id: 'provider_collapse_delta_pp', label: 'Provider Collapse Delta', value: collapseDelta.toFixed(1), unit: 'pp' }
            ],
            evidence: [
                { kind: 'chart', ref: 'ScenarioComparisonPanel', label: 'Intervention vs baseline run comparison' },
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Risk profile comparison across runs' }
            ],
            reproducible: true,
            confidence: 0.82
        });
    },
    D1: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('D1', {
                answerability: 'P',
                summary: 'Need current timestep to estimate tiered provider margins.'
            });
        }

        const tier = getTierMarginSnapshot(ctx, current);
        const allPositive = tier.proMarginUsd > 0 && tier.mercenaryMarginUsd > 0;
        const oneNegative = (tier.proMarginUsd <= 0) !== (tier.mercenaryMarginUsd <= 0);

        return createBaseAnswer('D1', {
            answerability: 'P',
            verdict: allPositive ? 'yes' : oneNegative ? 'at_risk' : 'no',
            summary: `Estimated weekly margins: pro tier ${tier.proMarginUsd.toFixed(2)} USD, mercenary tier ${tier.mercenaryMarginUsd.toFixed(2)} USD.`,
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Healthy if both tier margins > 0 USD/week',
                'At-risk if one tier is <= 0 USD/week'
            ],
            metrics: [
                { id: 'pro_margin_usd_week', label: 'Pro Tier Margin', value: tier.proMarginUsd.toFixed(2), unit: 'USD/week' },
                { id: 'mercenary_margin_usd_week', label: 'Mercenary Tier Margin', value: tier.mercenaryMarginUsd.toFixed(2), unit: 'USD/week' },
                { id: 'pro_count', label: 'Pro Provider Count', value: tier.proCount.toFixed(0) },
                { id: 'mercenary_count', label: 'Mercenary Provider Count', value: tier.mercenaryCount.toFixed(0) }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Provider profitability context' },
                { kind: 'panel', ref: 'Diagnostic/SolvencyScorecard', label: 'Cost and revenue per capacity context' }
            ],
            reproducible: true,
            confidence: 0.75
        });
    },
    D2: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('D2', {
                answerability: 'P',
                summary: 'Need current timestep to estimate ONO price sensitivity.'
            });
        }

        const economics = getProviderEconomicsAtPoint(ctx, current);
        if (economics.mintedPerProvider <= 0) {
            return createBaseAnswer('D2', {
                answerability: 'P',
                summary: 'Minted rewards per provider are zero, so price-sensitivity cannot be estimated.'
            });
        }

        const marginShockPer10Pct = economics.mintedPerProvider * economics.priceUsd * 0.1;
        const marginBufferPct = safeDivide(economics.priceUsd - economics.breakEvenPriceUsd, economics.priceUsd, 0) * 100;
        const sensitivityScore = safeDivide(Math.abs(marginShockPer10Pct), Math.max(Math.abs(economics.weeklyMarginPerProviderUsd), 1), 0);
        const verdict = marginBufferPct >= 20 ? 'no' : marginBufferPct >= 5 ? 'at_risk' : 'yes';

        return createBaseAnswer('D2', {
            answerability: 'P',
            verdict,
            summary: marginBufferPct < 5
                ? 'Profitability is highly sensitive to ONO price movement.'
                : marginBufferPct < 20
                    ? 'Profitability has moderate ONO price sensitivity.'
                    : 'Profitability has a healthy price buffer before breakeven.',
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'High sensitivity if price buffer to breakeven < 5%',
                'Moderate sensitivity if 5-20%',
                'Low sensitivity if > 20%'
            ],
            metrics: [
                { id: 'current_margin_usd_week', label: 'Current Margin', value: economics.weeklyMarginPerProviderUsd.toFixed(2), unit: 'USD/week' },
                { id: 'break_even_price_usd', label: 'Break-Even Price', value: Number.isFinite(economics.breakEvenPriceUsd) ? economics.breakEvenPriceUsd.toFixed(4) : 'Infinity', unit: 'USD' },
                { id: 'price_buffer_to_breakeven_pct', label: 'Price Buffer to Breakeven', value: marginBufferPct.toFixed(1), unit: '%' },
                { id: 'margin_change_per_10pct_price', label: 'Margin Change per +10% Price', value: marginShockPer10Pct.toFixed(2), unit: 'USD/week' },
                { id: 'price_sensitivity_score', label: 'Sensitivity Score', value: sensitivityScore.toFixed(2), unit: 'ratio' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Price, payback, and profitability sensitivity' },
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Downside stress context' }
            ],
            reproducible: true,
            confidence: 0.82
        });
    },
    D3: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('D3', {
                answerability: 'P',
                summary: 'Need current timestep to estimate churn-risk price and margin thresholds.'
            });
        }

        const economics = getProviderEconomicsAtPoint(ctx, current);
        const churnThreshold = Number(ctx.params.churnThreshold || 0);
        const currentChurnPct = churnPctFromPoint(current);
        const marginBufferToChurn = economics.weeklyMarginPerProviderUsd - churnThreshold;
        const priceBufferToChurnPct = safeDivide(
            economics.priceUsd - economics.churnRiskPriceUsd,
            Math.max(economics.priceUsd, 1e-9),
            0
        ) * 100;
        const highRiskNow = (
            marginBufferToChurn <= 0 ||
            priceBufferToChurnPct < 10 ||
            currentChurnPct >= (CHURN_GUARDRAILS.panicPctPerWeek * 0.8)
        );

        return createBaseAnswer('D3', {
            answerability: 'P',
            verdict: highRiskNow ? 'at_risk' : 'no',
            summary: highRiskNow
                ? 'Current economics are close to or inside the high-churn risk zone.'
                : 'Current economics remain outside the high-churn risk zone.',
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'High churn risk when margin <= churn threshold',
                'High churn risk when price buffer to churn threshold < 10%',
                `High churn risk when churn >= ${(CHURN_GUARDRAILS.panicPctPerWeek * 0.8).toFixed(1)}%/week`
            ],
            metrics: [
                { id: 'churn_threshold_margin_usd_week', label: 'Churn Threshold Margin', value: churnThreshold.toFixed(2), unit: 'USD/week' },
                { id: 'current_margin_usd_week', label: 'Current Margin', value: economics.weeklyMarginPerProviderUsd.toFixed(2), unit: 'USD/week' },
                { id: 'margin_buffer_to_churn_usd_week', label: 'Margin Buffer to Churn Threshold', value: marginBufferToChurn.toFixed(2), unit: 'USD/week' },
                { id: 'churn_risk_price_usd', label: 'Price at High Churn Risk', value: Number.isFinite(economics.churnRiskPriceUsd) ? economics.churnRiskPriceUsd.toFixed(4) : 'Infinity', unit: 'USD' },
                { id: 'price_buffer_to_churn_pct', label: 'Price Buffer to Churn Risk', value: priceBufferToChurnPct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Churn and payback threshold overlays' },
                { kind: 'chart', ref: 'Simulator/Sandbox Tier 1', label: 'Provider retention and churn trend' }
            ],
            reproducible: true,
            confidence: 0.83
        });
    },
    D4: (ctx) => {
        const { current } = getLatestPoints(ctx);
        const baselinePoint = getBaselinePointForCurrentWeek(ctx);
        if (!current || !baselinePoint) {
            return createBaseAnswer('D4', {
                answerability: 'P',
                summary: 'Need an alternative comparison run (baseline/peer) to compare provider economics.'
            });
        }

        const currentEconomics = getProviderEconomicsAtPoint(ctx, current);
        const baselineEconomics = getProviderEconomicsAtPoint(ctx, baselinePoint);
        const currentPayback = computeEstimatedPaybackMonthsAtPoint(ctx, current);
        const baselinePayback = computeEstimatedPaybackMonthsAtPoint(ctx, baselinePoint);
        const currentRetention = retentionFromSeries(ctx.aggregated);
        const baselineRetention = retentionFromSeries(ctx.baselineAggregated || []);

        const wins = [
            currentEconomics.weeklyMarginPerProviderUsd >= baselineEconomics.weeklyMarginPerProviderUsd,
            currentPayback <= baselinePayback,
            currentRetention >= baselineRetention
        ].filter(Boolean).length;

        return createBaseAnswer('D4', {
            answerability: 'Y',
            verdict: wins >= 2 ? 'yes' : wins === 1 ? 'at_risk' : 'no',
            summary: `Provider economics comparison versus baseline/peer: ${wins}/3 core metrics favorable.`,
            window: `Current W${Math.max(1, current.t || 0)} vs comparison W${Math.max(1, baselinePoint.t || 0)}`,
            thresholds: [
                'Compare weekly margin, payback months, and retention',
                'Favorable if at least 2 of 3 metrics outperform comparison run'
            ],
            metrics: [
                { id: 'margin_delta_vs_comparison_usd_week', label: 'Margin Delta vs Comparison', value: (currentEconomics.weeklyMarginPerProviderUsd - baselineEconomics.weeklyMarginPerProviderUsd).toFixed(2), unit: 'USD/week' },
                {
                    id: 'payback_delta_vs_comparison_months',
                    label: 'Payback Delta vs Comparison',
                    value: ((Number.isFinite(currentPayback) ? currentPayback : 120) - (Number.isFinite(baselinePayback) ? baselinePayback : 120)).toFixed(2),
                    unit: 'mo'
                },
                { id: 'retention_delta_vs_comparison_pp', label: 'Retention Delta vs Comparison', value: (currentRetention - baselineRetention).toFixed(1), unit: 'pp' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Benchmark/ComparativeMatrix', label: 'Cross-network economics benchmark' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Provider economics comparison context' }
            ],
            reproducible: true,
            confidence: 0.84
        });
    },
    D5: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current || ctx.aggregated.length < 2) {
            return createBaseAnswer('D5', {
                answerability: 'P',
                summary: 'Need tier trajectories to evaluate whether policy favors reliable operators.'
            });
        }

        const proSeries = ctx.aggregated.map((point) => point.proCount?.mean || 0);
        const mercSeries = ctx.aggregated.map((point) => point.mercenaryCount?.mean || 0);
        const proRetention = safeDivide(proSeries[proSeries.length - 1] || 0, Math.max(...proSeries, 1), 0) * 100;
        const mercRetention = safeDivide(mercSeries[mercSeries.length - 1] || 0, Math.max(...mercSeries, 1), 0) * 100;
        const tier = getTierMarginSnapshot(ctx, current);
        const qualityBias = proRetention - mercRetention;
        const favorsReliable = qualityBias >= 3 && tier.proMarginUsd >= tier.mercenaryMarginUsd;

        return createBaseAnswer('D5', {
            answerability: 'P',
            verdict: favorsReliable ? 'yes' : qualityBias > 0 ? 'at_risk' : 'no',
            summary: favorsReliable
                ? 'Reward policy is currently favoring long-term reliable operators.'
                : 'Reward policy does not yet clearly favor reliable operators.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Reliable-operator bias if pro retention exceeds mercenary retention by >= 3pp',
                'Reliable-operator bias if pro margin >= mercenary margin'
            ],
            metrics: [
                { id: 'pro_retention_pct', label: 'Pro Retention', value: proRetention.toFixed(1), unit: '%' },
                { id: 'mercenary_retention_pct', label: 'Mercenary Retention', value: mercRetention.toFixed(1), unit: '%' },
                { id: 'reliability_bias_gap_pp', label: 'Reliability Bias Gap', value: qualityBias.toFixed(1), unit: 'pp' },
                { id: 'pro_margin_usd_week', label: 'Pro Margin', value: tier.proMarginUsd.toFixed(2), unit: 'USD/week' },
                { id: 'mercenary_margin_usd_week', label: 'Mercenary Margin', value: tier.mercenaryMarginUsd.toFixed(2), unit: 'USD/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Tier retention and margin profile' },
                { kind: 'panel', ref: 'Diagnostic/StrategicRecommendationsPanel', label: 'Policy/tier reliability context' }
            ],
            reproducible: true,
            confidence: 0.82
        });
    },
    D6: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('D6', {
                answerability: 'P',
                summary: 'Need current timestep to estimate provider-tier cost shock impact.'
            });
        }

        const tier = getTierMarginSnapshot(ctx, current);
        const providerCost = Number(ctx.params.providerCostPerWeek || 0);
        const shockIncrement = providerCost * 0.2;
        const proMarginAfterShock = tier.proMarginUsd - shockIncrement;
        const mercMarginAfterShock = tier.mercenaryMarginUsd - shockIncrement;
        const tierFailure =
            (proMarginAfterShock <= 0 && mercMarginAfterShock > 0) ? 'pro'
                : (mercMarginAfterShock <= 0 && proMarginAfterShock > 0) ? 'mercenary'
                    : (proMarginAfterShock <= 0 && mercMarginAfterShock <= 0) ? 'both'
                        : 'none';

        return createBaseAnswer('D6', {
            answerability: 'P',
            verdict: tierFailure === 'none' ? 'yes' : tierFailure === 'both' ? 'no' : 'at_risk',
            summary: tierFailure === 'none'
                ? 'Both provider tiers remain profitable under a +20% cost shock.'
                : tierFailure === 'both'
                    ? 'Both tiers fall below breakeven under a +20% cost shock.'
                    : `${tierFailure === 'pro' ? 'Pro' : 'Mercenary'} tier fails first under a +20% cost shock.`,
            window: `W${Math.max(1, current.t || 0)} projected +20% cost shock`,
            thresholds: [
                'Cost shock test: +20% provider cost',
                'Tier failure when projected margin <= 0'
            ],
            metrics: [
                { id: 'pro_margin_after_cost_shock', label: 'Pro Margin After Shock', value: proMarginAfterShock.toFixed(2), unit: 'USD/week' },
                { id: 'merc_margin_after_cost_shock', label: 'Mercenary Margin After Shock', value: mercMarginAfterShock.toFixed(2), unit: 'USD/week' },
                { id: 'cost_shock_increment', label: 'Cost Shock Increment', value: shockIncrement.toFixed(2), unit: 'USD/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Tier margin stress behavior' },
                { kind: 'panel', ref: 'Simulator/Sidebar Provider Economics', label: 'Cost-shock parameter anchor' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    D7: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('D7', {
                answerability: 'Y',
                summary: 'Need current timestep to classify reward sustainability.'
            });
        }

        const solvency = current.solvencyScore?.mean || 0;
        const demandCoverage = demandCoverageFromPoint(current);
        const rewardDemandRatio = safeDivide(current.costPerCapacity?.mean || 0, current.revenuePerCapacity?.mean || 0, 2);
        const sustainable = solvency >= SOLVENCY_GUARDRAILS.criticalRatio && rewardDemandRatio <= 1 && demandCoverage >= 90;

        return createBaseAnswer('D7', {
            answerability: 'Y',
            verdict: sustainable ? 'yes' : solvency >= 0.9 ? 'at_risk' : 'no',
            summary: sustainable
                ? 'Current rewards look economically sustainable, not purely subsidy-driven.'
                : 'Current rewards appear partially or fully subsidy-supported.',
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Sustainable if solvency >= 1.0x',
                'Sustainable if cost/revenue per capacity <= 1.0x',
                'Sustainable if demand coverage >= 90%'
            ],
            metrics: [
                { id: 'solvency_ratio', label: 'Solvency Ratio', value: solvency.toFixed(3), unit: 'x' },
                { id: 'reward_demand_ratio', label: 'Cost/Revenue per Capacity', value: rewardDemandRatio.toFixed(3), unit: 'x' },
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: demandCoverage.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Diagnostic/SolvencyScorecard', label: 'Sustainability scorecard context' },
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Subsidy-vs-utility trajectory' }
            ],
            reproducible: true,
            confidence: 0.9
        });
    },
    D8: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('D8', {
                answerability: 'P',
                summary: 'Need at least two timesteps to estimate cohort retention trend.'
            });
        }

        const currentRetention = retentionFromSeries(ctx.aggregated);
        const previousRetention = retentionFromSeries(ctx.aggregated.slice(0, -1));
        const delta = currentRetention - previousRetention;
        const churn = churnPctFromPoint(current);

        return createBaseAnswer('D8', {
            answerability: 'P',
            verdict: delta >= -0.5 && churn < CHURN_GUARDRAILS.panicPctPerWeek * 0.8
                ? 'yes'
                : delta >= -2
                    ? 'at_risk'
                    : 'no',
            summary: `Expected retention trend is ${delta >= 0 ? 'stable/improving' : 'declining'} (${delta.toFixed(2)}pp WoW).`,
            window: `W${Math.max(1, previous.t || 0)} to W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Stable trend if WoW retention delta >= -0.5pp',
                `Risk trend if churn approaches ${(CHURN_GUARDRAILS.panicPctPerWeek * 0.8).toFixed(1)}%/week`
            ],
            metrics: [
                { id: 'retention_pct', label: 'Retention', value: currentRetention.toFixed(1), unit: '%' },
                { id: 'retention_delta_wow_pp', label: 'WoW Retention Delta', value: delta.toFixed(2), unit: 'pp' },
                { id: 'churn_rate_pct', label: 'Churn Rate', value: churn.toFixed(2), unit: '%/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Simulator/Sandbox Tier 1', label: 'Retention trend and cohort context' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Churn trend by stress path' }
            ],
            reproducible: true,
            confidence: 0.83
        });
    },
    D9: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('D9', {
                answerability: 'P',
                summary: 'Need at least two timesteps to detect reward-value erosion signals.'
            });
        }

        const currentEconomics = getProviderEconomicsAtPoint(ctx, current);
        const previousEconomics = getProviderEconomicsAtPoint(ctx, previous);
        const marginDelta = currentEconomics.weeklyMarginPerProviderUsd - previousEconomics.weeklyMarginPerProviderUsd;
        const paybackNow = computeEstimatedPaybackMonthsAtPoint(ctx, current);
        const paybackPrev = computeEstimatedPaybackMonthsAtPoint(ctx, previous);
        const paybackDelta = (Number.isFinite(paybackNow) ? paybackNow : 120) - (Number.isFinite(paybackPrev) ? paybackPrev : 120);
        const priceDelta = pctChange(current.price?.mean || 0, previous.price?.mean || 0);

        const erosionSignals = [
            marginDelta < -2,
            paybackDelta > 1.5,
            priceDelta <= -8
        ].filter(Boolean).length;

        return createBaseAnswer('D9', {
            answerability: 'P',
            verdict: erosionSignals >= 2 ? 'yes' : erosionSignals === 1 ? 'at_risk' : 'no',
            summary: erosionSignals >= 2
                ? 'Early signals indicate nominal rewards are losing real value.'
                : 'No strong early warning of nominal reward-value erosion.',
            window: `W${Math.max(1, previous.t || 0)} vs W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Erosion signal if margin drops meaningfully week-over-week',
                'Erosion signal if payback extends quickly',
                'Erosion signal if token price falls materially'
            ],
            metrics: [
                { id: 'margin_delta_wow_usd_week', label: 'WoW Margin Delta', value: marginDelta.toFixed(2), unit: 'USD/week' },
                { id: 'payback_delta_wow_months', label: 'WoW Payback Delta', value: paybackDelta.toFixed(2), unit: 'mo' },
                { id: 'price_delta_wow_pct', label: 'WoW Price Delta', value: priceDelta.toFixed(1), unit: '%' },
                { id: 'erosion_signal_count', label: 'Erosion Signal Count', value: erosionSignals.toString() }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Payback and margin deterioration signals' },
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Price/drawdown erosion context' }
            ],
            reproducible: true,
            confidence: 0.81
        });
    },
    D10: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current || ctx.aggregated.length < 2) {
            return createBaseAnswer('D10', {
                answerability: 'P',
                summary: 'Need tier and retention trajectories to assess quality-linked reward impact.'
            });
        }

        const tier = getTierMarginSnapshot(ctx, current);
        const proSeries = ctx.aggregated.map((point) => point.proCount?.mean || 0);
        const mercSeries = ctx.aggregated.map((point) => point.mercenaryCount?.mean || 0);
        const proRetention = safeDivide(proSeries[proSeries.length - 1] || 0, Math.max(...proSeries, 1), 0) * 100;
        const mercRetention = safeDivide(mercSeries[mercSeries.length - 1] || 0, Math.max(...mercSeries, 1), 0) * 100;
        const qualityLeverActive = Number(ctx.params.proTierEfficiency || 1) > 1.0;
        const benefit = qualityLeverActive && proRetention > mercRetention && tier.proMarginUsd >= tier.mercenaryMarginUsd;

        return createBaseAnswer('D10', {
            answerability: 'P',
            verdict: benefit ? 'yes' : qualityLeverActive ? 'at_risk' : 'no',
            summary: benefit
                ? 'Quality/uptime-linked incentives are improving long-term expected operator return.'
                : qualityLeverActive
                    ? 'Quality-linked incentives are active, but evidence of long-term return uplift is mixed.'
                    : 'Quality-linked incentives are not materially active in current parameters.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Quality lever active if pro-tier efficiency > 1.0x',
                'Positive long-term signal if pro retention and pro margin both outperform mercenary tier'
            ],
            metrics: [
                { id: 'pro_tier_efficiency', label: 'Pro Tier Efficiency Multiplier', value: Number(ctx.params.proTierEfficiency || 1).toFixed(2), unit: 'x' },
                { id: 'pro_retention_pct', label: 'Pro Retention', value: proRetention.toFixed(1), unit: '%' },
                { id: 'mercenary_retention_pct', label: 'Mercenary Retention', value: mercRetention.toFixed(1), unit: '%' },
                { id: 'pro_margin_usd_week', label: 'Pro Margin', value: tier.proMarginUsd.toFixed(2), unit: 'USD/week' },
                { id: 'mercenary_margin_usd_week', label: 'Mercenary Margin', value: tier.mercenaryMarginUsd.toFixed(2), unit: 'USD/week' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Tier-specific return outcomes' },
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Service-quality continuity context' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    D11: (ctx) => {
        if (ctx.aggregated.length === 0) {
            return createBaseAnswer('D11', {
                answerability: 'P',
                summary: 'Need scenario trajectory to determine breakeven break week.'
            });
        }

        const breakIndex = ctx.aggregated.findIndex((point) => {
            const paybackMonths = computeEstimatedPaybackMonthsAtPoint(ctx, point);
            return !Number.isFinite(paybackMonths) || paybackMonths > PAYBACK_GUARDRAILS.watchlistMaxMonths;
        });
        const breachPoint = breakIndex >= 0 ? ctx.aggregated[breakIndex] : null;
        const breakWeekLabel = breachPoint ? `W${Math.max(1, breachPoint.t || 0)}` : 'No breach in horizon';

        return createBaseAnswer('D11', {
            answerability: 'P',
            verdict: breachPoint ? 'at_risk' : 'no',
            summary: breachPoint
                ? `Breakeven breaks at ${breakWeekLabel} in the active scenario path.`
                : 'Breakeven remains inside threshold bands in the active scenario path.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
            thresholds: [
                `Breakeven break if estimated payback > ${PAYBACK_GUARDRAILS.watchlistMaxMonths} months`,
                'Breakeven break if weekly provider profit <= 0'
            ],
            metrics: [
                { id: 'breakeven_break_week', label: 'Breakeven Break Week', value: breakWeekLabel },
                {
                    id: 'end_payback_months_est',
                    label: 'End-of-Run Estimated Payback',
                    value: (() => {
                        const endPayback = computeEstimatedPaybackMonthsAtPoint(ctx, ctx.aggregated[ctx.aggregated.length - 1]);
                        return Number.isFinite(endPayback) ? endPayback.toFixed(2) : 'Non-positive profit';
                    })(),
                    unit: 'mo'
                }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Payback timeline by week' },
                { kind: 'chart', ref: 'Benchmark/HealthMetricsBarChart', label: 'ROI and retention pressure context' }
            ],
            reproducible: true,
            confidence: 0.81
        });
    },
    D12: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('D12', {
                answerability: 'P',
                summary: 'Need current timestep to evaluate downside participation rationality.'
            });
        }

        const economics = getProviderEconomicsAtPoint(ctx, current);
        const paybackMonths = computeEstimatedPaybackMonths(ctx);
        const risk = computeDeathSpiralRisk(ctx);
        const solvency = current.solvencyScore?.mean || 0;

        const failedChecks = [
            economics.downsideMargin20PctUsd <= 0,
            !Number.isFinite(paybackMonths) || paybackMonths > PAYBACK_GUARDRAILS.watchlistMaxMonths,
            risk.probabilityPct >= 50,
            solvency < SOLVENCY_GUARDRAILS.criticalRatio
        ].filter(Boolean).length;

        const verdict = failedChecks === 0 ? 'yes' : failedChecks <= 2 ? 'at_risk' : 'no';

        return createBaseAnswer('D12', {
            answerability: 'P',
            verdict,
            summary: verdict === 'yes'
                ? 'Participation remains economically rational under a 20% downside stress.'
                : verdict === 'at_risk'
                    ? 'Participation is borderline under downside stress and needs active monitoring.'
                    : 'Participation is not rational under downside stress assumptions.',
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Downside margin (price -20%) should remain > 0 USD/week',
                `Payback should remain <= ${PAYBACK_GUARDRAILS.watchlistMaxMonths} months`,
                'Death-spiral probability should remain < 50%',
                'Solvency should remain >= 1.0x'
            ],
            metrics: [
                { id: 'downside_margin_20pct_usd_week', label: 'Downside Margin (Price -20%)', value: economics.downsideMargin20PctUsd.toFixed(2), unit: 'USD/week' },
                {
                    id: 'payback_months_est',
                    label: 'Estimated Payback',
                    value: Number.isFinite(paybackMonths) ? paybackMonths.toFixed(2) : 'Non-positive profit',
                    unit: 'mo'
                },
                { id: 'death_spiral_probability_pct', label: 'Death-Spiral Probability', value: risk.probabilityPct.toFixed(1), unit: '%' },
                { id: 'solvency_ratio', label: 'Solvency Ratio', value: solvency.toFixed(3), unit: 'x' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Provider downside economics' },
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Downside probability context' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    E1: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('E1', {
                answerability: 'P',
                summary: 'Need current timestep to evaluate service continuity under churn pressure.'
            });
        }

        const churn = churnPctFromPoint(current);
        const risingChurn = previous ? churn >= churnPctFromPoint(previous) : false;
        const churnPressureActive = churn >= CHURN_GUARDRAILS.panicPctPerWeek * 0.6 || risingChurn;
        const minCoverage = Math.min(...ctx.aggregated.map((point) => demandCoverageFromPoint(point)));
        const continuityStable = minCoverage >= 90;

        return createBaseAnswer('E1', {
            answerability: 'P',
            verdict: !churnPressureActive
                ? 'at_risk'
                : (continuityStable ? 'yes' : minCoverage >= 80 ? 'at_risk' : 'no'),
            summary: !churnPressureActive
                ? 'Meaningful churn pressure is not active in this run, so continuity resilience remains provisional.'
                : continuityStable
                    ? 'Service continuity remains stable despite rising churn pressure.'
                    : 'Service continuity is degrading under churn pressure.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)}-${Math.max(1, current.t || 0)}`,
            thresholds: [
                `Churn pressure active if churn >= ${(CHURN_GUARDRAILS.panicPctPerWeek * 0.6).toFixed(1)}%/week or rising`,
                'Continuity stable if minimum demand coverage remains >= 90%'
            ],
            metrics: [
                { id: 'current_churn_pct_week', label: 'Current Churn', value: churn.toFixed(2), unit: '%/week' },
                { id: 'churn_pressure_active', label: 'Churn Pressure Active', value: churnPressureActive ? 'Yes' : 'No' },
                { id: 'min_demand_coverage_pct', label: 'Minimum Demand Coverage', value: minCoverage.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Service continuity under churn pressure' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Churn pressure trend' }
            ],
            reproducible: true,
            confidence: 0.81
        });
    },
    E2: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('E2', {
                answerability: 'P',
                summary: 'Need current timestep to evaluate capacity sufficiency against expected demand.'
            });
        }

        const demand = current.demand?.mean || 0;
        const capacity = current.capacity?.mean || 0;
        const coverage = demandCoverageFromPoint(current);
        const capacityBufferPct = demand > 0
            ? safeDivide(capacity - demand, demand, 0) * 100
            : 100;

        return createBaseAnswer('E2', {
            answerability: 'P',
            verdict: coverage >= 95 && capacityBufferPct >= 0
                ? 'yes'
                : coverage >= 85
                    ? 'at_risk'
                    : 'no',
            summary: coverage >= 95 && capacityBufferPct >= 0
                ? 'Current capacity is sufficient for expected demand.'
                : 'Capacity sufficiency is tightening relative to expected demand.',
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Sufficient if demand coverage >= 95% and capacity buffer >= 0%',
                'At-risk if demand coverage is between 85% and 95%'
            ],
            metrics: [
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: coverage.toFixed(1), unit: '%' },
                { id: 'capacity_buffer_pct', label: 'Capacity Buffer vs Demand', value: capacityBufferPct.toFixed(1), unit: '%' },
                { id: 'capacity_units', label: 'Capacity', value: capacity.toFixed(0), unit: 'units' },
                { id: 'demand_units', label: 'Demand', value: demand.toFixed(0), unit: 'units' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Capacity and demand trajectory' },
                { kind: 'chart', ref: 'Benchmark/HealthMetricsBarChart', label: 'Coverage sufficiency summary' }
            ],
            reproducible: true,
            confidence: 0.85
        });
    },
    E3: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('E3', {
                answerability: 'P',
                summary: 'Need at least two timesteps to detect latent degradation signals.'
            });
        }

        const coverage = demandCoverageFromPoint(current);
        const providerDeltaPct = pctChange(current.providers?.mean || 0, previous.providers?.mean || 0);
        const churnNow = churnPctFromPoint(current);
        const retention = retentionFromSeries(ctx.aggregated);
        const latentDegradation = coverage >= 95 && (
            providerDeltaPct <= -2 ||
            churnNow >= CHURN_GUARDRAILS.panicPctPerWeek * 0.7 ||
            retention < RETENTION_GUARDRAILS.benchmarkMinPct
        );

        return createBaseAnswer('E3', {
            answerability: 'P',
            verdict: latentDegradation ? 'yes' : 'no',
            summary: latentDegradation
                ? 'Latent degradation signals are present despite high apparent uptime/coverage.'
                : 'No strong latent degradation signal is visible behind current uptime metrics.',
            window: `W${Math.max(1, previous.t || 0)} vs W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Latent degradation if coverage >= 95% with simultaneous provider/churn deterioration'
            ],
            metrics: [
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: coverage.toFixed(1), unit: '%' },
                { id: 'providers_delta_wow_pct', label: 'WoW Providers Delta', value: providerDeltaPct.toFixed(2), unit: '%' },
                { id: 'churn_pct_week', label: 'Current Churn', value: churnNow.toFixed(2), unit: '%/week' },
                { id: 'retention_pct', label: 'Retention', value: retention.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Coverage and uptime context' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Latent provider-degradation context' }
            ],
            reproducible: true,
            confidence: 0.84
        });
    },
    E4: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('E4', {
                answerability: 'P',
                summary: 'Need current timestep to identify which stress scenario most threatens service quality.'
            });
        }

        const regime = classifyCurrentRegime(ctx);
        const lag = estimateShockLag(ctx);
        const coverage = demandCoverageFromPoint(current);
        const churn = churnPctFromPoint(current);
        const economics = getProviderEconomicsAtPoint(ctx, current);

        const threatScores = {
            demand: regime.stressScores.demand + (coverage < 90 ? 1 : 0),
            liquidity: regime.stressScores.liquidity + (lag.shockWeekIndex >= 0 ? 0.5 : 0),
            competitive: regime.stressScores.competitive + (churn >= CHURN_GUARDRAILS.panicPctPerWeek * 0.6 ? 0.5 : 0),
            cost: regime.stressScores.cost + (economics.weeklyMarginPerProviderUsd <= 0 ? 0.5 : 0)
        };
        const [topThreat, topScore] = Object.entries(threatScores).sort((left, right) => right[1] - left[1])[0] || ['demand', 0];
        const threatLabelById: Record<string, string> = {
            demand: 'Demand contraction stress',
            liquidity: 'Liquidity/unlock stress',
            competitive: 'Competitive-yield stress',
            cost: 'Provider cost-inflation stress'
        };
        const threatLabel = threatLabelById[topThreat] || 'Mixed stress';

        return createBaseAnswer('E4', {
            answerability: 'P',
            verdict: topScore >= 1 ? 'at_risk' : 'no',
            summary: `Most threatening service-quality stress signature is ${threatLabel}.`,
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Threat score combines active regime stress plus service degradation signals'
            ],
            metrics: [
                { id: 'top_service_threat', label: 'Top Service-Quality Threat', value: threatLabel },
                { id: 'top_service_threat_score', label: 'Top Threat Score', value: topScore.toFixed(2), unit: 'index' },
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: coverage.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Service continuity and coverage path' },
                { kind: 'chart', ref: 'Benchmark/AIInsights', label: 'Scenario stress context' }
            ],
            reproducible: true,
            confidence: 0.78
        });
    },
    E5: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('E5', {
                answerability: 'P',
                summary: 'Need current timestep to assess coverage resilience to liquidity events.'
            });
        }

        const regime = classifyCurrentRegime(ctx);
        const lag = estimateShockLag(ctx);
        const coverage = demandCoverageFromPoint(current);
        const providerDelta = previous ? pctChange(current.providers?.mean || 0, previous.providers?.mean || 0) : 0;
        const liquidityEventActive = (
            ctx.params.investorSellPct >= 0.25 ||
            regime.stressScores.liquidity >= 1 ||
            lag.shockWeekIndex >= 0
        );

        const verdict = !liquidityEventActive
            ? 'at_risk'
            : (coverage >= 90 && providerDelta >= -5 ? 'yes' : coverage >= 80 ? 'at_risk' : 'no');

        return createBaseAnswer('E5', {
            answerability: 'P',
            verdict,
            summary: !liquidityEventActive
                ? 'Liquidity event is not active in this run; coverage resilience remains unproven.'
                : verdict === 'yes'
                    ? 'Coverage remains resilient under liquidity-event conditions.'
                    : 'Coverage is degrading under liquidity-event conditions.',
            window: `W${Math.max(1, current.t || 0)} liquidity-event view`,
            thresholds: [
                'Liquidity-event resilience if demand coverage >= 90% and provider drop > -5% WoW'
            ],
            metrics: [
                { id: 'liquidity_event_active', label: 'Liquidity Event Active', value: liquidityEventActive ? 'Yes' : 'No' },
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: coverage.toFixed(1), unit: '%' },
                { id: 'providers_delta_wow_pct', label: 'WoW Providers Delta', value: providerDelta.toFixed(2), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Coverage under liquidity-event trajectory' },
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Liquidity shock downside context' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    E6: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('E6', {
                answerability: 'P',
                summary: 'Need current timestep to assess coverage resilience to provider cost inflation.'
            });
        }

        const regime = classifyCurrentRegime(ctx);
        const coverage = demandCoverageFromPoint(current);
        const retention = retentionFromSeries(ctx.aggregated);
        const costStressActive = regime.costDeltaVsReferencePct >= 20 || regime.stressScores.cost >= 1;

        const verdict = !costStressActive
            ? 'at_risk'
            : (coverage >= 90 && retention >= RETENTION_GUARDRAILS.benchmarkMinPct ? 'yes' : coverage >= 80 ? 'at_risk' : 'no');

        return createBaseAnswer('E6', {
            answerability: 'P',
            verdict,
            summary: !costStressActive
                ? 'Cost-inflation stress is not active in this run; resilience is unproven.'
                : verdict === 'yes'
                    ? 'Coverage is resilient under elevated provider-cost conditions.'
                    : 'Coverage resilience weakens under provider-cost inflation.',
            window: `W${Math.max(1, current.t || 0)} cost-inflation view`,
            thresholds: [
                'Cost-inflation stress active if provider cost is >= +20% vs reference',
                'Resilient if demand coverage >= 90% and retention >= benchmark'
            ],
            metrics: [
                { id: 'provider_cost_delta_vs_reference_pct', label: 'Provider Cost Delta vs Reference', value: regime.costDeltaVsReferencePct.toFixed(1), unit: '%' },
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: coverage.toFixed(1), unit: '%' },
                { id: 'retention_pct', label: 'Retention', value: retention.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Coverage under cost pressure' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Provider retention under cost pressure' }
            ],
            reproducible: true,
            confidence: 0.79
        });
    },
    E7: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current || ctx.aggregated.length < 2) {
            return createBaseAnswer('E7', {
                answerability: 'P',
                summary: 'Need quality-tier trajectories to assess whether quality-linked incentives protect delivered service.'
            });
        }

        const qualityLeverActive = Number(ctx.params.proTierEfficiency || 1) > 1.0;
        const coverage = demandCoverageFromPoint(current);
        const proSeries = ctx.aggregated.map((point) => point.proCount?.mean || 0);
        const mercSeries = ctx.aggregated.map((point) => point.mercenaryCount?.mean || 0);
        const proRetention = safeDivide(proSeries[proSeries.length - 1] || 0, Math.max(...proSeries, 1), 0) * 100;
        const mercRetention = safeDivide(mercSeries[mercSeries.length - 1] || 0, Math.max(...mercSeries, 1), 0) * 100;
        const protective = qualityLeverActive && coverage >= 90 && proRetention >= mercRetention;

        return createBaseAnswer('E7', {
            answerability: 'P',
            verdict: protective ? 'yes' : qualityLeverActive ? 'at_risk' : 'no',
            summary: protective
                ? 'Quality-linked incentives are currently protecting delivered service outcomes.'
                : 'Protection from quality-linked incentives is partial or not evident in this run.',
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Quality lever active if pro-tier efficiency > 1.0x',
                'Service protection signal if coverage >= 90% and pro retention >= merc retention'
            ],
            metrics: [
                { id: 'quality_lever_active', label: 'Quality Lever Active', value: qualityLeverActive ? 'Yes' : 'No' },
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: coverage.toFixed(1), unit: '%' },
                { id: 'pro_retention_pct', label: 'Pro Retention', value: proRetention.toFixed(1), unit: '%' },
                { id: 'mercenary_retention_pct', label: 'Mercenary Retention', value: mercRetention.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Delivered-service continuity trend' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Quality-tier retention trend' }
            ],
            reproducible: true,
            confidence: 0.78
        });
    },
    E8: (ctx) => {
        if (ctx.aggregated.length < 4) {
            return createBaseAnswer('E8', {
                answerability: 'P',
                summary: 'Need at least four timesteps to infer reliability direction over time.'
            });
        }

        const windowSize = Math.min(4, ctx.aggregated.length);
        const earlySlice = ctx.aggregated.slice(0, windowSize);
        const lateSlice = ctx.aggregated.slice(-windowSize);

        const reliabilityIndex = (slice: AnswerContext['aggregated']) => {
            const avgCoverage = average(slice.map((point) => demandCoverageFromPoint(point)));
            const avgSolvency = average(slice.map((point) => point.solvencyScore?.mean || 0));
            const avgChurn = average(slice.map((point) => churnPctFromPoint(point)));
            return (avgCoverage * 0.6) + (avgSolvency * 30) - (avgChurn * 3);
        };

        const earlyReliability = reliabilityIndex(earlySlice);
        const lateReliability = reliabilityIndex(lateSlice);
        const delta = lateReliability - earlyReliability;

        return createBaseAnswer('E8', {
            answerability: 'P',
            verdict: delta > 2 ? 'yes' : delta < -2 ? 'no' : 'at_risk',
            summary: delta > 2
                ? 'Network reliability is improving over time.'
                : delta < -2
                    ? 'Network reliability is degrading over time.'
                    : 'Network reliability is roughly flat with minor drift.',
            window: `Early W${Math.max(1, earlySlice[0]?.t || 0)}-${Math.max(1, earlySlice[earlySlice.length - 1]?.t || 0)} vs Late W${Math.max(1, lateSlice[0]?.t || 0)}-${Math.max(1, lateSlice[lateSlice.length - 1]?.t || 0)}`,
            thresholds: [
                'Reliability index combines coverage (+), solvency (+), and churn (-)',
                'Meaningful trend if reliability delta magnitude > 2 index points'
            ],
            metrics: [
                { id: 'reliability_index_early', label: 'Early Reliability Index', value: earlyReliability.toFixed(2), unit: 'index' },
                { id: 'reliability_index_late', label: 'Late Reliability Index', value: lateReliability.toFixed(2), unit: 'index' },
                { id: 'reliability_index_delta', label: 'Reliability Delta', value: delta.toFixed(2), unit: 'index' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Benchmark/HealthMetricsBarChart', label: 'Reliability trajectory summary' },
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Coverage and delivery continuity trend' }
            ],
            reproducible: true,
            confidence: 0.82
        });
    },
    F1: (ctx) => {
        const inputsDefined = [
            Number.isFinite(ctx.params.T),
            Number.isFinite(ctx.params.nSims),
            Number.isFinite(ctx.params.maxMintWeekly),
            Number.isFinite(ctx.params.burnPct),
            Number.isFinite(ctx.params.providerCostPerWeek),
            typeof ctx.params.demandType === 'string',
            typeof ctx.params.macro === 'string'
        ].every(Boolean);
        const hasOutcomes = ctx.aggregated.length > 0;

        return createBaseAnswer('F1', {
            answerability: 'Y',
            verdict: inputsDefined && hasOutcomes ? 'yes' : 'no',
            summary: inputsDefined && hasOutcomes
                ? 'Stress inputs are explicitly parameterized and separated from outcome trajectories.'
                : 'Input/output separation is incomplete in the current run context.',
            window: hasOutcomes
                ? `Inputs + W${Math.max(1, ctx.aggregated[0]?.t || 0)}-${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)} outcomes`
                : 'Input-only',
            thresholds: [
                'Inputs: parameter object fields populated',
                'Outcomes: aggregated trajectory available'
            ],
            metrics: [
                { id: 'stress_inputs_defined', label: 'Stress Inputs Defined', value: inputsDefined ? 'Yes' : 'No' },
                { id: 'outcome_series_available', label: 'Outcome Series Available', value: hasOutcomes ? 'Yes' : 'No' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Simulator/Sidebar', label: 'Input controls and assumptions' },
                { kind: 'chart', ref: 'Simulator/Sandbox', label: 'Outcome trajectories' }
            ],
            reproducible: true,
            confidence: 0.96
        });
    },
    F2: (ctx) => {
        const hasScenarioAssumptions = (
            Number.isFinite(ctx.params.seed) &&
            Number.isFinite(ctx.params.nSims) &&
            Number.isFinite(ctx.params.T) &&
            typeof ctx.params.demandType === 'string'
        );
        const reproducible = hasScenarioAssumptions && (ctx.params.nSims || 0) > 0 && (ctx.params.T || 0) > 0;

        return createBaseAnswer('F2', {
            answerability: 'Y',
            verdict: reproducible ? 'yes' : 'at_risk',
            summary: reproducible
                ? 'Scenario assumptions are visible and reproducible via seeded simulation parameters.'
                : 'Scenario assumptions are partially present but reproducibility is weakened.',
            window: `Seed ${ctx.params.seed} • Sims ${ctx.params.nSims} • Horizon ${ctx.params.T}w`,
            thresholds: [
                'Reproducible if seed, nSims, and T are explicitly set'
            ],
            metrics: [
                { id: 'seed', label: 'Seed', value: Number(ctx.params.seed || 0).toString() },
                { id: 'n_sims', label: 'Simulation Runs', value: Number(ctx.params.nSims || 0).toString() },
                { id: 'horizon_weeks', label: 'Horizon', value: Number(ctx.params.T || 0).toString(), unit: 'weeks' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Simulator/Sidebar Scenario Library', label: 'Scenario assumptions and controls' }
            ],
            reproducible,
            confidence: reproducible ? 0.95 : 0.7
        });
    },
    F3: (ctx) => {
        const coverageRatio = getRequiredMetricCoverageRatio(ctx);
        const consistencyGrade = coverageRatio >= 0.99 ? 'high' : coverageRatio >= 0.9 ? 'moderate' : 'low';

        return createBaseAnswer('F3', {
            answerability: 'P',
            verdict: coverageRatio >= 0.99 ? 'yes' : coverageRatio >= 0.9 ? 'at_risk' : 'no',
            summary: `Operational metric consistency is ${consistencyGrade} (coverage ratio ${coverageRatio.toFixed(3)}).`,
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)}-${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
            thresholds: [
                'Coverage ratio >= 0.99: consistent',
                'Coverage ratio 0.90-0.99: partial',
                'Coverage ratio < 0.90: inconsistent'
            ],
            metrics: [
                { id: 'metric_coverage_ratio', label: 'Metric Coverage Ratio', value: coverageRatio.toFixed(3), unit: 'ratio' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Simulator/Sandbox', label: 'Metric series produced from shared engine outputs' }
            ],
            reproducible: true,
            confidence: 0.83
        });
    },
    F4: (ctx) => {
        if (!ctx.baselineAggregated || ctx.baselineAggregated.length === 0 || ctx.aggregated.length === 0) {
            return createBaseAnswer('F4', {
                answerability: 'P',
                verdict: 'at_risk',
                summary: 'Baseline comparison run is missing, so axis/window parity cannot be fully verified.',
                window: 'Current run only',
                thresholds: [
                    'Requires baseline and stress series with aligned time index'
                ],
                metrics: [
                    { id: 'baseline_available', label: 'Baseline Available', value: 'No' }
                ],
                evidence: [
                    { kind: 'panel', ref: 'ScenarioComparisonPanel', label: 'Baseline vs stress comparison panel' }
                ],
                reproducible: false,
                confidence: 0.62
            });
        }

        const lengthAligned = ctx.baselineAggregated.length === ctx.aggregated.length;
        const timeAligned = lengthAligned && ctx.aggregated.every((point, index) => point.t === ctx.baselineAggregated?.[index]?.t);

        return createBaseAnswer('F4', {
            answerability: 'Y',
            verdict: lengthAligned && timeAligned ? 'yes' : 'no',
            summary: lengthAligned && timeAligned
                ? 'Baseline and stress runs are aligned on identical time axes.'
                : 'Baseline and stress runs are not aligned on identical axes/time windows.',
            window: `Current ${ctx.aggregated.length}w vs baseline ${ctx.baselineAggregated.length}w`,
            thresholds: [
                'Axis parity requires equal horizon length and matching time indices'
            ],
            metrics: [
                { id: 'length_aligned', label: 'Length Aligned', value: lengthAligned ? 'Yes' : 'No' },
                { id: 'time_aligned', label: 'Time Index Aligned', value: timeAligned ? 'Yes' : 'No' }
            ],
            evidence: [
                { kind: 'chart', ref: 'ScenarioComparisonPanel', label: 'Baseline/stress overlay comparability' }
            ],
            reproducible: true,
            confidence: 0.9
        });
    },
    F5: (ctx) => {
        const { current } = getLatestPoints(ctx);
        const hasDispersion = hasDispersionStats(current);

        return createBaseAnswer('F5', {
            answerability: 'Y',
            verdict: hasDispersion ? 'yes' : 'no',
            summary: hasDispersion
                ? 'Dispersion statistics (percentiles and confidence intervals) are available.'
                : 'Dispersion statistics are missing from the current output path.',
            window: current ? `W${Math.max(1, current.t || 0)}` : 'N/A',
            thresholds: [
                'Dispersion requires p10/p90 and CI fields in metric stats'
            ],
            metrics: [
                { id: 'dispersion_fields_available', label: 'Dispersion Fields Available', value: hasDispersion ? 'Yes' : 'No' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Simulator/Sandbox', label: 'CI and percentile bands on core metrics' }
            ],
            reproducible: true,
            confidence: 0.94
        });
    },
    F6: (ctx) => {
        const mode = inferFailureModeLabel(ctx);
        const { current } = getLatestPoints(ctx);
        const hasPrecursors = Boolean(
            current &&
            Number.isFinite(current.solvencyScore?.mean || 0) &&
            Number.isFinite(churnPctFromPoint(current)) &&
            Number.isFinite(demandCoverageFromPoint(current))
        );

        return createBaseAnswer('F6', {
            answerability: 'P',
            verdict: hasPrecursors ? 'yes' : 'at_risk',
            summary: hasPrecursors
                ? `Failure-mode mapping is tied to measurable precursor signals (current mode: ${mode}).`
                : 'Failure-mode mapping is not fully grounded in measurable precursor signals.',
            window: current ? `W${Math.max(1, current.t || 0)}` : 'N/A',
            thresholds: [
                'Mapping uses solvency, churn, coverage, and price-shock precursor metrics'
            ],
            metrics: [
                { id: 'mapped_failure_mode', label: 'Mapped Failure Mode', value: mode }
            ],
            evidence: [
                { kind: 'chart', ref: 'Diagnostic/SignalsOfDeathPanel', label: 'Failure precursors and mode mapping' },
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Risk precursor signals' }
            ],
            reproducible: true,
            confidence: 0.85
        });
    },
    F7: (ctx) => {
        return createBaseAnswer('F7', {
            answerability: 'P',
            verdict: 'yes',
            summary: 'Current evaluator framework is directional/proxy-based and does not claim causal identification.',
            window: 'Framework-level',
            thresholds: [
                'Directional evidence uses threshold and trend proxies, not causal model coefficients'
            ],
            metrics: [
                { id: 'causal_model_present', label: 'Causal Model Present', value: 'No' },
                { id: 'directional_proxy_mode', label: 'Directional Proxy Mode', value: 'Yes' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Methodology/Disclaimers', label: 'Directional-not-causal framing' }
            ],
            reproducible: true,
            confidence: 0.74
        });
    },
    F8: (ctx) => {
        return createBaseAnswer('F8', {
            answerability: 'Y',
            verdict: 'yes',
            summary: 'Non-goals are explicitly framed (no direct price prediction or deterministic success forecasting).',
            window: 'Framework-level',
            thresholds: [
                'Non-goal declarations present in methodology/diagnostic framing'
            ],
            metrics: [
                { id: 'non_goal_price_prediction', label: 'No Price Prediction Claim', value: 'Yes' },
                { id: 'non_goal_success_forecast', label: 'No Deterministic Success Forecast', value: 'Yes' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Diagnostic/AuditDashboard', label: 'Epistemic disclaimer and non-goal framing' }
            ],
            reproducible: true,
            confidence: 0.9
        });
    },
    F9: (ctx) => {
        const limitationSignals = [
            ctx.baselineAggregated && ctx.baselineAggregated.length > 0 ? 0 : 1,
            ctx.derivedMetrics ? 0 : 1,
            ctx.aggregated.length >= 2 ? 0 : 1
        ].reduce((sum, item) => sum + item, 0);

        return createBaseAnswer('F9', {
            answerability: 'P',
            verdict: limitationSignals <= 1 ? 'yes' : 'at_risk',
            summary: limitationSignals <= 1
                ? 'Model-limit context is sufficiently surfaced for interpretation.'
                : 'Model-limit context is partial and should be made more explicit at interpretation points.',
            window: 'Run context',
            thresholds: [
                'Limit visibility weakens when baseline, derived diagnostics, or multi-week context are missing'
            ],
            metrics: [
                { id: 'limitation_signal_count', label: 'Missing Limitation Context Signals', value: limitationSignals.toString() }
            ],
            evidence: [
                { kind: 'panel', ref: 'Methodology/Disclaimers', label: 'Limitations and caveats framing' },
                { kind: 'panel', ref: 'MetricEvidenceLegend', label: 'Evidence quality and proxy markers' }
            ],
            reproducible: true,
            confidence: 0.72
        });
    },
    F10: (ctx) => {
        const traceable = Boolean(
            Number.isFinite(ctx.params.seed) &&
            Number.isFinite(ctx.params.T) &&
            ctx.aggregated.length > 0
        );

        return createBaseAnswer('F10', {
            answerability: 'Y',
            verdict: traceable ? 'yes' : 'no',
            summary: traceable
                ? 'Results are traceable from parameter input state to observed simulation outcomes.'
                : 'Traceability is incomplete due to missing run context.',
            window: traceable
                ? `Seed ${ctx.params.seed} -> W${Math.max(1, ctx.aggregated[0]?.t || 0)}-${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`
                : 'N/A',
            thresholds: [
                'Traceability requires explicit input parameters and produced trajectory outputs'
            ],
            metrics: [
                { id: 'traceability_complete', label: 'Traceability Complete', value: traceable ? 'Yes' : 'No' },
                { id: 'run_id', label: 'Run ID', value: ctx.runId }
            ],
            evidence: [
                { kind: 'panel', ref: 'Simulator/Sidebar', label: 'Input parameter state' },
                { kind: 'chart', ref: 'Simulator/Sandbox', label: 'Observed output trajectory' }
            ],
            reproducible: traceable,
            confidence: traceable ? 0.95 : 0.65
        });
    },
    F11: (ctx) => {
        if (!ctx.baselineAggregated || ctx.baselineAggregated.length === 0 || ctx.aggregated.length === 0) {
            return createBaseAnswer('F11', {
                answerability: 'P',
                verdict: 'at_risk',
                summary: 'Cross-scenario signature distinction needs a paired baseline/scenario run.',
                window: 'Current run only',
                thresholds: [
                    'Distinguishability requires at least two comparable scenario signatures'
                ],
                metrics: [
                    { id: 'comparison_signature_available', label: 'Comparison Signature Available', value: 'No' }
                ],
                evidence: [
                    { kind: 'panel', ref: 'ScenarioComparisonPanel', label: 'Cross-scenario signature comparison' }
                ],
                reproducible: false,
                confidence: 0.6
            });
        }

        const currentMode = inferFailureModeLabel(ctx);
        const baselineMode = inferFailureModeLabel({ ...ctx, aggregated: ctx.baselineAggregated });
        const currentRisk = computeDeathSpiralRisk(ctx);
        const baselineRisk = computeDeathSpiralRisk({ ...ctx, aggregated: ctx.baselineAggregated });
        const riskDelta = currentRisk.probabilityPct - baselineRisk.probabilityPct;
        const distinguishable = currentMode !== baselineMode || Math.abs(riskDelta) >= 10;

        return createBaseAnswer('F11', {
            answerability: 'P',
            verdict: distinguishable ? 'yes' : 'at_risk',
            summary: distinguishable
                ? 'Cross-scenario signatures are distinguishable and interpretable in the current comparison.'
                : 'Cross-scenario signatures are only weakly distinguishable in this comparison.',
            window: 'Current vs baseline scenario',
            thresholds: [
                'Distinguishable if failure-mode label differs or risk delta >= 10pp'
            ],
            metrics: [
                { id: 'current_signature_mode', label: 'Current Signature Mode', value: currentMode },
                { id: 'baseline_signature_mode', label: 'Baseline Signature Mode', value: baselineMode },
                { id: 'signature_risk_delta_pp', label: 'Signature Risk Delta', value: riskDelta.toFixed(1), unit: 'pp' }
            ],
            evidence: [
                { kind: 'chart', ref: 'ScenarioComparisonPanel', label: 'Scenario signature side-by-side' },
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Scenario-specific risk signatures' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    F12: (ctx) => {
        if (!ctx.baselineAggregated || ctx.baselineAggregated.length === 0 || ctx.aggregated.length === 0) {
            return createBaseAnswer('F12', {
                answerability: 'P',
                verdict: 'at_risk',
                summary: 'Comparative robustness framing requires a comparison run.',
                window: 'Current run only',
                thresholds: [
                    'Comparative framing requires baseline/peer comparison metrics'
                ],
                metrics: [
                    { id: 'comparative_frame_available', label: 'Comparative Frame Available', value: 'No' }
                ],
                evidence: [
                    { kind: 'chart', ref: 'Benchmark/ComparativeMatrix', label: 'Relative robustness comparison view' }
                ],
                reproducible: false,
                confidence: 0.6
            });
        }

        const currentRisk = computeDeathSpiralRisk(ctx);
        const baselineRisk = computeDeathSpiralRisk({ ...ctx, aggregated: ctx.baselineAggregated });
        const currentRetention = retentionFromSeries(ctx.aggregated);
        const baselineRetention = retentionFromSeries(ctx.baselineAggregated);
        const comparativeSignals = [
            Math.abs(currentRisk.probabilityPct - baselineRisk.probabilityPct) >= 1,
            Math.abs(currentRetention - baselineRetention) >= 1
        ].filter(Boolean).length;

        return createBaseAnswer('F12', {
            answerability: 'P',
            verdict: comparativeSignals >= 1 ? 'yes' : 'at_risk',
            summary: comparativeSignals >= 1
                ? 'Comparative robustness is emphasized through relative risk/retention deltas.'
                : 'Comparative robustness signals are weak in this run pair.',
            window: 'Current vs baseline comparative frame',
            thresholds: [
                'Comparative framing needs non-zero relative robustness deltas'
            ],
            metrics: [
                { id: 'risk_delta_vs_baseline_pp', label: 'Risk Delta vs Baseline', value: (currentRisk.probabilityPct - baselineRisk.probabilityPct).toFixed(1), unit: 'pp' },
                { id: 'retention_delta_vs_baseline_pp', label: 'Retention Delta vs Baseline', value: (currentRetention - baselineRetention).toFixed(1), unit: 'pp' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Benchmark/ComparativeMatrix', label: 'Relative benchmark metrics' },
                { kind: 'chart', ref: 'Benchmark/HealthMetricsBarChart', label: 'Relative health deltas' }
            ],
            reproducible: true,
            confidence: 0.82
        });
    },
    F13: (ctx) => {
        const { current } = getLatestPoints(ctx);
        const connected = Boolean(
            current &&
            Number.isFinite(current.proCount?.mean || 0) &&
            Number.isFinite(current.mercenaryCount?.mean || 0) &&
            Number.isFinite(churnPctFromPoint(current))
        );
        const mode = inferFailureModeLabel(ctx);

        return createBaseAnswer('F13', {
            answerability: 'P',
            verdict: connected ? 'yes' : 'at_risk',
            summary: connected
                ? 'Archetype diagnostics are connected to observable tier/churn/solvency signals.'
                : 'Archetype diagnostics are only partially connected to observable signals.',
            window: current ? `W${Math.max(1, current.t || 0)}` : 'N/A',
            thresholds: [
                'Connection requires observable cohort + churn + solvency signals'
            ],
            metrics: [
                { id: 'archetype_signal_connection', label: 'Archetype-Signal Connection', value: connected ? 'Connected' : 'Partial' },
                { id: 'current_failure_mode', label: 'Current Failure Mode', value: mode }
            ],
            evidence: [
                { kind: 'chart', ref: 'Diagnostic/ArchetypeLogicPanel', label: 'Archetype reasoning layer' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Observable cohort/churn signals' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    F14: (ctx) => {
        return createBaseAnswer('F14', {
            answerability: 'P',
            verdict: 'yes',
            summary: 'Policy outputs are framed as conditional considerations tied to run context rather than universal prescriptions.',
            window: 'Framework-level',
            thresholds: [
                'Recommendations should remain conditional on scenario assumptions and KPI states'
            ],
            metrics: [
                { id: 'policy_frame_mode', label: 'Policy Frame Mode', value: 'Conditional considerations' }
            ],
            evidence: [
                { kind: 'panel', ref: 'DecisionPromptCard', label: 'Conditional policy-question framing' },
                { kind: 'panel', ref: 'Diagnostic/StrategicRecommendationsPanel', label: 'Scenario-conditional recommendations' }
            ],
            reproducible: true,
            confidence: 0.76
        });
    },
    G1: (ctx) => {
        if (!ctx.baselineAggregated || ctx.baselineAggregated.length === 0 || ctx.aggregated.length === 0) {
            return createBaseAnswer('G1', {
                answerability: 'P',
                summary: 'Need peer/archetype comparison run data to evaluate relative profile under identical stress.'
            });
        }

        const currentRisk = computeDeathSpiralRisk(ctx);
        const peerRisk = computeDeathSpiralRisk({ ...ctx, aggregated: ctx.baselineAggregated });
        const currentRetention = retentionFromSeries(ctx.aggregated);
        const peerRetention = retentionFromSeries(ctx.baselineAggregated);
        const currentCoverage = average(ctx.aggregated.slice(-4).map((point) => demandCoverageFromPoint(point)));
        const peerCoverage = average(ctx.baselineAggregated.slice(-4).map((point) => demandCoverageFromPoint(point)));
        const currentSolvency = average(ctx.aggregated.slice(-4).map((point) => point.solvencyScore?.mean || 0));
        const peerSolvency = average(ctx.baselineAggregated.slice(-4).map((point) => point.solvencyScore?.mean || 0));

        const score = (
            (peerRisk.probabilityPct - currentRisk.probabilityPct) * 0.4 +
            (currentRetention - peerRetention) * 0.2 +
            (currentCoverage - peerCoverage) * 0.2 +
            ((currentSolvency - peerSolvency) * 100) * 0.2
        );

        return createBaseAnswer('G1', {
            answerability: 'P',
            verdict: score > 2 ? 'yes' : score < -2 ? 'no' : 'at_risk',
            summary: score > 2
                ? 'Onocoy profile is comparatively stronger versus peer archetype under matched stress.'
                : score < -2
                    ? 'Onocoy profile is comparatively weaker versus peer archetype under matched stress.'
                    : 'Comparative profile is mixed or near parity under matched stress.',
            window: 'Current profile vs baseline archetype profile (matched horizon)',
            thresholds: [
                'Comparative score combines risk, retention, coverage, and solvency deltas versus peer baseline'
            ],
            metrics: [
                { id: 'comparative_profile_score', label: 'Comparative Profile Score', value: score.toFixed(1), unit: 'index' },
                { id: 'risk_delta_vs_peer_pp', label: 'Risk Delta vs Peer', value: (currentRisk.probabilityPct - peerRisk.probabilityPct).toFixed(1), unit: 'pp' },
                { id: 'retention_delta_vs_peer_pp', label: 'Retention Delta vs Peer', value: (currentRetention - peerRetention).toFixed(1), unit: 'pp' },
                { id: 'coverage_delta_vs_peer_pp', label: 'Coverage Delta vs Peer', value: (currentCoverage - peerCoverage).toFixed(1), unit: 'pp' },
                { id: 'solvency_delta_vs_peer', label: 'Solvency Delta vs Peer', value: (currentSolvency - peerSolvency).toFixed(3), unit: 'x' }
            ],
            evidence: [
                { kind: 'chart', ref: 'ScenarioComparisonPanel', label: 'Matched-stress comparative outcomes' },
                { kind: 'chart', ref: 'Benchmark/ComparativeMatrix', label: 'Archetype comparison matrix' }
            ],
            reproducible: true,
            confidence: 0.78
        });
    },
    G2: (ctx) => {
        if (ctx.aggregated.length < 3) {
            return createBaseAnswer('G2', {
                answerability: 'P',
                summary: 'Need multi-week trajectory to evaluate demand-contraction robustness.'
            });
        }

        const firstDemand = ctx.aggregated[0]?.demand?.mean || 0;
        const minDemand = Math.min(...ctx.aggregated.map((point) => point.demand?.mean || firstDemand));
        const contractionPct = firstDemand > 0 ? ((firstDemand - minDemand) / firstDemand) * 100 : 0;
        const minCoverage = Math.min(...ctx.aggregated.map((point) => demandCoverageFromPoint(point)));
        const minSolvency = Math.min(...ctx.aggregated.map((point) => point.solvencyScore?.mean || 0));
        const providerSeries = ctx.aggregated.map((point) => point.providers?.mean || 0);
        const providerCollapsePct = ((Math.max(...providerSeries, 1) - (providerSeries[providerSeries.length - 1] || 0)) / Math.max(...providerSeries, 1)) * 100;
        const contractionActive = contractionPct >= 10;

        const verdict = !contractionActive
            ? 'at_risk'
            : (minCoverage >= 90 && minSolvency >= 1 && providerCollapsePct <= 15 ? 'yes' : minCoverage >= 80 ? 'at_risk' : 'no');

        return createBaseAnswer('G2', {
            answerability: 'P',
            verdict,
            summary: !contractionActive
                ? 'Demand contraction is not active in this run; robustness signal is provisional.'
                : 'Demand-contraction robustness is inferred from solvency, coverage, and provider collapse behavior.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
            thresholds: [
                'Contraction active if demand drops >= 10% from start',
                'Robust if min coverage >= 90%, min solvency >= 1.0x, collapse <= 15%'
            ],
            metrics: [
                { id: 'demand_contraction_pct', label: 'Demand Contraction', value: contractionPct.toFixed(1), unit: '%' },
                { id: 'min_coverage_pct', label: 'Minimum Coverage', value: minCoverage.toFixed(1), unit: '%' },
                { id: 'min_solvency_ratio', label: 'Minimum Solvency', value: minSolvency.toFixed(3), unit: 'x' },
                { id: 'provider_collapse_pct', label: 'Provider Collapse', value: providerCollapsePct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Demand-contraction service robustness' },
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Contraction solvency robustness' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    G3: (ctx) => {
        const lag = estimateShockLag(ctx);
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('G3', {
                answerability: 'P',
                summary: 'Need current timestep to evaluate liquidity-shock robustness.'
            });
        }

        const liquidityShockActive = ctx.params.investorSellPct >= 0.25 || lag.shockWeekIndex >= 0;
        const minCoverage = Math.min(...ctx.aggregated.map((point) => demandCoverageFromPoint(point)));
        const risk = computeDeathSpiralRisk(ctx);

        const verdict = !liquidityShockActive
            ? 'at_risk'
            : (minCoverage >= 90 && risk.providerCollapsePct <= 10 ? 'yes' : minCoverage >= 80 ? 'at_risk' : 'no');

        return createBaseAnswer('G3', {
            answerability: 'P',
            verdict,
            summary: !liquidityShockActive
                ? 'Liquidity shock is not active in this run; robustness is not fully exercised.'
                : 'Liquidity-shock robustness is assessed from post-shock coverage and collapse behavior.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Liquidity shock active if investor sell >= 25% or price shock trigger breached',
                'Robust if minimum coverage >= 90% and provider collapse <= 10%'
            ],
            metrics: [
                { id: 'liquidity_shock_active', label: 'Liquidity Shock Active', value: liquidityShockActive ? 'Yes' : 'No' },
                { id: 'min_coverage_pct', label: 'Minimum Coverage', value: minCoverage.toFixed(1), unit: '%' },
                { id: 'provider_collapse_pct', label: 'Provider Collapse', value: risk.providerCollapsePct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Liquidity-shock downside profile' },
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Coverage under liquidity stress' }
            ],
            reproducible: true,
            confidence: 0.81
        });
    },
    G4: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('G4', {
                answerability: 'P',
                summary: 'Need current timestep to evaluate robustness under competitive-yield pressure.'
            });
        }

        const competitivePressureActive = (ctx.params.competitorYield || 0) >= 0.75
            || average(ctx.aggregated.map((point) => point.vampireChurn?.mean || 0)) > 0;
        const minCoverage = Math.min(...ctx.aggregated.map((point) => demandCoverageFromPoint(point)));
        const retention = retentionFromSeries(ctx.aggregated);
        const risk = computeDeathSpiralRisk(ctx);

        const verdict = !competitivePressureActive
            ? 'at_risk'
            : (minCoverage >= 90 && retention >= RETENTION_GUARDRAILS.benchmarkMinPct && risk.providerCollapsePct <= 15
                ? 'yes'
                : minCoverage >= 80
                    ? 'at_risk'
                    : 'no');

        return createBaseAnswer('G4', {
            answerability: 'P',
            verdict,
            summary: !competitivePressureActive
                ? 'Competitive-yield pressure is not fully activated in this run; robustness remains provisional.'
                : 'Competitive-yield robustness is inferred from coverage floor, retention floor, and collapse severity.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)}-${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Competitive pressure active if competitorYield >= 0.75x or vampire churn is present',
                'Robust if min coverage >= 90%, retention >= benchmark, and provider collapse <= 15%'
            ],
            metrics: [
                { id: 'competitor_yield_x', label: 'Competitor Yield', value: (ctx.params.competitorYield || 0).toFixed(2), unit: 'x' },
                { id: 'vampire_churn_avg', label: 'Average Vampire Churn', value: average(ctx.aggregated.map((point) => point.vampireChurn?.mean || 0)).toFixed(2), unit: 'providers/week' },
                { id: 'min_coverage_pct', label: 'Minimum Coverage', value: minCoverage.toFixed(1), unit: '%' },
                { id: 'retention_pct', label: 'Retention', value: retention.toFixed(1), unit: '%' },
                { id: 'provider_collapse_pct', label: 'Provider Collapse', value: risk.providerCollapsePct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Competitive pressure and churn response' },
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Coverage resilience under competitive stress' }
            ],
            reproducible: true,
            confidence: 0.79
        });
    },
    G5: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('G5', {
                answerability: 'P',
                summary: 'Need current timestep to evaluate cost-inflation robustness.'
            });
        }

        const regime = classifyCurrentRegime(ctx);
        const costStressActive = regime.costDeltaVsReferencePct >= 20 || regime.stressScores.cost >= 1;
        const retention = retentionFromSeries(ctx.aggregated);
        const minSolvency = Math.min(...ctx.aggregated.map((point) => point.solvencyScore?.mean || 0));
        const minCoverage = Math.min(...ctx.aggregated.map((point) => demandCoverageFromPoint(point)));

        const verdict = !costStressActive
            ? 'at_risk'
            : (retention >= RETENTION_GUARDRAILS.benchmarkMinPct && minSolvency >= 1 && minCoverage >= 90 ? 'yes' : minCoverage >= 80 ? 'at_risk' : 'no');

        return createBaseAnswer('G5', {
            answerability: 'P',
            verdict,
            summary: !costStressActive
                ? 'Cost-inflation stress is not active in this run; comparative robustness remains provisional.'
                : 'Cost-inflation robustness is inferred from retention, solvency floor, and coverage floor.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Cost stress active if provider cost delta >= 20%',
                'Robust if retention >= benchmark, min solvency >= 1.0x, min coverage >= 90%'
            ],
            metrics: [
                { id: 'provider_cost_delta_vs_reference_pct', label: 'Provider Cost Delta vs Reference', value: regime.costDeltaVsReferencePct.toFixed(1), unit: '%' },
                { id: 'retention_pct', label: 'Retention', value: retention.toFixed(1), unit: '%' },
                { id: 'min_solvency_ratio', label: 'Minimum Solvency', value: minSolvency.toFixed(3), unit: 'x' },
                { id: 'min_coverage_pct', label: 'Minimum Coverage', value: minCoverage.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Cost-pressure provider response' },
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Coverage resilience under cost pressure' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    G6: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current || ctx.aggregated.length < 2) {
            return createBaseAnswer('G6', {
                answerability: 'P',
                summary: 'Need tier trajectories to evaluate sunk-cost friction effects on churn speed.'
            });
        }

        const proSeries = ctx.aggregated.map((point) => point.proCount?.mean || 0);
        const mercSeries = ctx.aggregated.map((point) => point.mercenaryCount?.mean || 0);
        const proRetention = safeDivide(proSeries[proSeries.length - 1] || 0, Math.max(...proSeries, 1), 0) * 100;
        const mercRetention = safeDivide(mercSeries[mercSeries.length - 1] || 0, Math.max(...mercSeries, 1), 0) * 100;
        const retentionGap = proRetention - mercRetention;
        const lag = estimateShockLag(ctx);
        const materiallySlow = retentionGap >= 10 && lag.lagToChurnWeeks >= 1;

        return createBaseAnswer('G6', {
            answerability: 'P',
            verdict: materiallySlow ? 'yes' : retentionGap > 0 ? 'at_risk' : 'no',
            summary: materiallySlow
                ? 'Sunk-cost friction appears to materially slow churn relative to low-commitment supply.'
                : 'Sunk-cost friction signal is weak or only partial in this run.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)}-${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Material slow-down signal if pro-vs-merc retention gap >= 10pp and churn reaction lag >= 1 week'
            ],
            metrics: [
                { id: 'pro_retention_pct', label: 'Pro Retention', value: proRetention.toFixed(1), unit: '%' },
                { id: 'mercenary_retention_pct', label: 'Mercenary Retention', value: mercRetention.toFixed(1), unit: '%' },
                { id: 'retention_gap_pp', label: 'Retention Gap (Pro - Mercenary)', value: retentionGap.toFixed(1), unit: 'pp' },
                { id: 'lag_shock_to_churn_weeks', label: 'Shock -> Churn Lag', value: lag.lagToChurnWeeks >= 0 ? lag.lagToChurnWeeks.toString() : 'No breach', unit: 'weeks' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Commitment-tier retention and churn lag' },
                { kind: 'chart', ref: 'Diagnostic/SignalsOfDeathPanel', label: 'Churn response sequencing' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    G7: (ctx) => {
        if (ctx.aggregated.length === 0) {
            return createBaseAnswer('G7', {
                answerability: 'P',
                summary: 'Need scenario trajectory to detect earliest failure signature.'
            });
        }

        const breachIndices = {
            subsidy_trap: ctx.aggregated.findIndex((point) => (point.solvencyScore?.mean || 0) < SOLVENCY_GUARDRAILS.criticalRatio),
            churn_capitulation: ctx.aggregated.findIndex((point) => churnPctFromPoint(point) >= CHURN_GUARDRAILS.panicPctPerWeek * 0.8),
            service_degradation: ctx.aggregated.findIndex((point) => demandCoverageFromPoint(point) < 90),
            liquidity_spiral: (() => {
                const prices = ctx.aggregated.map((point) => point.price?.mean || 0);
                let peak = prices[0] || 0;
                for (let i = 0; i < prices.length; i += 1) {
                    peak = Math.max(peak, prices[i] || 0);
                    const drawdown = peak > 0 ? ((peak - (prices[i] || 0)) / peak) * 100 : 0;
                    if (drawdown >= 20) return i;
                }
                return -1;
            })()
        };
        const validBreaches = Object.entries(breachIndices).filter(([, index]) => index >= 0);
        if (validBreaches.length === 0) {
            return createBaseAnswer('G7', {
                answerability: 'P',
                verdict: 'no',
                summary: 'No major failure signature breached in the current horizon.',
                window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
                thresholds: [
                    'First breach among solvency, churn, coverage, and liquidity drawdown signatures'
                ],
                metrics: [
                    { id: 'earliest_failure_signature', label: 'Earliest Failure Signature', value: 'None' }
                ],
                evidence: [
                    { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Failure-signature timing context' }
                ],
                reproducible: true,
                confidence: 0.82
            });
        }

        const [earliestMode, earliestIndex] = validBreaches.sort((left, right) => (left[1] as number) - (right[1] as number))[0];
        const labelMap: Record<string, string> = {
            subsidy_trap: 'Subsidy Trap',
            churn_capitulation: 'Churn Capitulation',
            service_degradation: 'Service Degradation',
            liquidity_spiral: 'Liquidity Spiral'
        };

        return createBaseAnswer('G7', {
            answerability: 'P',
            verdict: 'at_risk',
            summary: `Earliest detected failure signature is ${labelMap[earliestMode] || earliestMode}.`,
            window: `First breach at W${Math.max(1, ctx.aggregated[earliestIndex as number]?.t || 0)}`,
            thresholds: [
                'Earliest breach among solvency<1.0x, churn panic threshold, coverage<90%, drawdown>=20%'
            ],
            metrics: [
                { id: 'earliest_failure_signature', label: 'Earliest Failure Signature', value: labelMap[earliestMode] || earliestMode },
                { id: 'earliest_failure_week', label: 'Earliest Failure Week', value: `W${Math.max(1, ctx.aggregated[earliestIndex as number]?.t || 0)}` }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Failure-signature timeline' },
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Solvency and liquidity signature context' }
            ],
            reproducible: true,
            confidence: 0.84
        });
    },
    G8: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('G8', {
                answerability: 'P',
                summary: 'Need current timestep to evaluate anti-dilution vs flexibility tradeoff.'
            });
        }

        const minted = current.minted?.mean || 0;
        const supply = Math.max(1, current.supply?.mean || 1);
        const mintPressurePctSupply = (minted / supply) * 100;
        const solvency = current.solvencyScore?.mean || 0;
        const coverage = demandCoverageFromPoint(current);
        const utilization = current.utilization?.mean || 0;
        const antiDilutionResilient = mintPressurePctSupply <= 0.5 && solvency >= SOLVENCY_GUARDRAILS.criticalRatio;
        const flexibilityConstraint = coverage < 90 || utilization > 85;

        return createBaseAnswer('G8', {
            answerability: 'P',
            verdict: antiDilutionResilient && flexibilityConstraint ? 'yes' : antiDilutionResilient ? 'at_risk' : 'no',
            summary: antiDilutionResilient && flexibilityConstraint
                ? 'Current profile appears to trade demand flexibility for anti-dilution resilience.'
                : antiDilutionResilient
                    ? 'Profile shows anti-dilution resilience without a clear flexibility penalty.'
                    : 'Anti-dilution resilience is not strong enough to infer this tradeoff.',
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Anti-dilution signal: weekly mint pressure <= 0.5% of supply and solvency >= 1.0x',
                'Flexibility constraint signal: coverage < 90% or utilization > 85%'
            ],
            metrics: [
                { id: 'mint_pressure_pct_supply_weekly', label: 'Weekly Mint Pressure', value: mintPressurePctSupply.toFixed(3), unit: '% of supply' },
                { id: 'solvency_ratio', label: 'Solvency Ratio', value: solvency.toFixed(3), unit: 'x' },
                { id: 'demand_coverage_pct', label: 'Demand Coverage', value: coverage.toFixed(1), unit: '%' },
                { id: 'utilization_pct', label: 'Utilization', value: utilization.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'Benchmark/HealthMetricsBarChart', label: 'Dilution and coverage tradeoff context' },
                { kind: 'chart', ref: 'DecisionTree/Utility', label: 'Flexibility/throughput context' }
            ],
            reproducible: true,
            confidence: 0.77
        });
    },
    H1: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('H1', {
                answerability: 'P',
                summary: 'Need at least two timesteps to determine emission-pressure direction.'
            });
        }

        const currentPressure = computeNetEmissionPressurePct(current);
        const previousPressure = computeNetEmissionPressurePct(previous);
        const delta = currentPressure - previousPressure;
        const direction = delta > 0.0001 ? 'increasing' : delta < -0.0001 ? 'decreasing' : 'flat';

        return createBaseAnswer('H1', {
            answerability: 'Y',
            verdict: direction === 'decreasing' ? 'yes' : direction === 'flat' ? 'at_risk' : 'at_risk',
            summary: `Net emission pressure is ${direction} week-over-week.`,
            window: `W${Math.max(1, previous.t || 0)} vs W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Net emission pressure = (minted - burned) / supply'
            ],
            metrics: [
                { id: 'net_emission_pressure_current_pct_supply', label: 'Current Net Emission Pressure', value: currentPressure.toFixed(4), unit: '% of supply/week' },
                { id: 'net_emission_pressure_delta', label: 'WoW Emission Pressure Delta', value: delta.toFixed(4), unit: 'pp' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Mint vs burn pressure trend' },
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Emission pressure solvency impact' }
            ],
            reproducible: true,
            confidence: 0.9
        });
    },
    H2: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('H2', {
                answerability: 'P',
                summary: 'Need at least two timesteps to infer burn-to-mint solvency direction.'
            });
        }

        const currentRatio = safeDivide(current.burned?.mean || 0, Math.max(1e-9, current.minted?.mean || 0), 0);
        const previousRatio = safeDivide(previous.burned?.mean || 0, Math.max(1e-9, previous.minted?.mean || 0), 0);
        const delta = currentRatio - previousRatio;
        const trendingToward = delta > 0;

        return createBaseAnswer('H2', {
            answerability: 'Y',
            verdict: trendingToward ? (currentRatio >= 1 ? 'yes' : 'at_risk') : 'no',
            summary: trendingToward
                ? 'Burn-to-mint trajectory is moving toward solvency.'
                : 'Burn-to-mint trajectory is moving away from solvency.',
            window: `W${Math.max(1, previous.t || 0)} vs W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Toward solvency if burn-to-mint ratio is increasing',
                'Durable solvency if ratio >= 1.0x'
            ],
            metrics: [
                { id: 'burn_to_mint_ratio_current', label: 'Current Burn-to-Mint', value: currentRatio.toFixed(3), unit: 'x' },
                { id: 'burn_to_mint_ratio_delta', label: 'WoW Burn-to-Mint Delta', value: delta.toFixed(3), unit: 'x' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Burn-to-mint directionality' },
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Solvency trend confirmation' }
            ],
            reproducible: true,
            confidence: 0.91
        });
    },
    H3: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('H3', {
                answerability: 'P',
                summary: 'Need current timestep to estimate unlock-event downside severity.'
            });
        }

        const risk = computeDeathSpiralRisk(ctx);
        const liquidity = Number(ctx.params.initialLiquidity || 0);
        const sellPct = Number(ctx.params.investorSellPct || 0);
        const normalizedDepth = Math.min(1, liquidity / 500_000);
        const severityScore = Math.min(100, (sellPct * 120) + (risk.maxDrawdownPct * 0.6) + ((1 - normalizedDepth) * 25));

        return createBaseAnswer('H3', {
            answerability: 'Y',
            verdict: severityScore >= 65 ? 'at_risk' : severityScore >= 35 ? 'at_risk' : 'no',
            summary: `Estimated unlock-event downside severity score is ${severityScore.toFixed(1)}/100.`,
            window: `Current liquidity/unlock state at W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Severity combines unlock sell %, drawdown response, and liquidity depth',
                'Score >= 65 indicates high downside severity'
            ],
            metrics: [
                { id: 'unlock_sell_pct', label: 'Unlock Sell %', value: (sellPct * 100).toFixed(1), unit: '%' },
                { id: 'initial_liquidity_usd', label: 'Initial Liquidity', value: liquidity.toFixed(0), unit: 'USD' },
                { id: 'unlock_downside_severity_score', label: 'Unlock Downside Severity', value: severityScore.toFixed(1), unit: '/100' },
                { id: 'max_drawdown_pct', label: 'Observed Max Drawdown', value: risk.maxDrawdownPct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Unlock-linked drawdown profile' },
                { kind: 'panel', ref: 'Simulator/Sidebar Tokenomics', label: 'Liquidity/unlock parameter state' }
            ],
            reproducible: true,
            confidence: 0.84
        });
    },
    H4: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('H4', {
                answerability: 'P',
                summary: 'Need current timestep to estimate subsidy-supported retention share.'
            });
        }

        const totalProviders = Math.max(1, current.providers?.mean || 1);
        const belowBreakeven = Math.max(0, current.underwaterCount?.mean || 0);
        const payback = computeEstimatedPaybackMonths(ctx);
        const nearBreakevenShare = Number.isFinite(payback) && payback > PAYBACK_GUARDRAILS.healthyMaxMonths
            ? Math.min(0.45, 0.1 + ((payback - PAYBACK_GUARDRAILS.healthyMaxMonths) / PAYBACK_GUARDRAILS.healthyMaxMonths))
            : 0.08;
        const nearBreakeven = Math.max(0, (totalProviders - belowBreakeven) * nearBreakevenShare);
        const subsidySupported = Math.min(totalProviders, belowBreakeven + nearBreakeven);
        const subsidySupportedPct = safeDivide(subsidySupported, totalProviders, 0) * 100;
        const viablePct = 100 - subsidySupportedPct;

        return createBaseAnswer('H4', {
            answerability: 'P',
            verdict: subsidySupportedPct >= 50 ? 'at_risk' : subsidySupportedPct >= 30 ? 'at_risk' : 'no',
            summary: `Estimated subsidy-supported retention share is ${subsidySupportedPct.toFixed(1)}% (economically viable share ${viablePct.toFixed(1)}%).`,
            window: `W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Subsidy-supported estimate = below breakeven + near breakeven providers',
                'Watchlist >= 30%, intervention >= 50%'
            ],
            metrics: [
                { id: 'subsidy_supported_retention_pct', label: 'Subsidy-Supported Retention', value: subsidySupportedPct.toFixed(1), unit: '%' },
                { id: 'economically_viable_retention_pct', label: 'Economically Viable Retention', value: viablePct.toFixed(1), unit: '%' },
                { id: 'underwater_provider_count', label: 'Underwater Providers', value: belowBreakeven.toFixed(0) }
            ],
            evidence: [
                { kind: 'panel', ref: 'Diagnostic/SolvencyScorecard', label: 'Underwater and breakeven proxy context' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Provider economics viability context' }
            ],
            reproducible: true,
            confidence: 0.77
        });
    },
    H5: (ctx) => {
        const lag = estimateShockLag(ctx);
        const risk = computeDeathSpiralRisk(ctx);
        const shockDetected = lag.shockWeekIndex >= 0;
        const secondOrderAttrition = shockDetected && (
            lag.lagToChurnWeeks >= 0 &&
            (lag.lagToCapacityWeeks >= 0 || risk.providerCollapsePct >= 10)
        );

        return createBaseAnswer('H5', {
            answerability: 'P',
            verdict: secondOrderAttrition ? 'yes' : 'no',
            summary: secondOrderAttrition
                ? 'Price shocks are likely to trigger second-order infrastructure attrition in this run.'
                : 'No strong second-order attrition signature is detected from price shocks in this run.',
            window: shockDetected
                ? `Shock at W${Math.max(1, ctx.aggregated[lag.shockWeekIndex]?.t || 0)} onward`
                : `W${Math.max(1, ctx.aggregated[0]?.t || 0)}-${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
            thresholds: [
                'Second-order signature requires shock -> churn transition and churn -> capacity (or collapse) transition'
            ],
            metrics: [
                { id: 'shock_detected', label: 'Price Shock Detected', value: shockDetected ? 'Yes' : 'No' },
                { id: 'lag_shock_to_churn_weeks', label: 'Shock -> Churn Lag', value: lag.lagToChurnWeeks >= 0 ? lag.lagToChurnWeeks.toString() : 'No breach', unit: 'weeks' },
                { id: 'lag_churn_to_capacity_weeks', label: 'Churn -> Capacity Lag', value: lag.lagToCapacityWeeks >= 0 ? lag.lagToCapacityWeeks.toString() : 'No breach', unit: 'weeks' },
                { id: 'provider_collapse_pct', label: 'Provider Collapse', value: risk.providerCollapsePct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Shock-driven downside propagation' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Churn/capacity propagation timing' }
            ],
            reproducible: true,
            confidence: 0.83
        });
    },
    H6: (ctx) => {
        const { current } = getLatestPoints(ctx);
        if (!current) {
            return createBaseAnswer('H6', {
                answerability: 'P',
                summary: 'Need current timestep to estimate treasury/risk buffer requirements.'
            });
        }

        const treasury = Math.max(0, current.treasuryBalance?.mean || 0);
        const dailyDeficitUsd = Math.max(0, (current.dailyMintUsd?.mean || 0) - (current.dailyBurnUsd?.mean || 0));
        const buffer90d = dailyDeficitUsd * 90;
        const buffer180d = dailyDeficitUsd * 180;
        const gap90d = buffer90d - treasury;
        const gap180d = buffer180d - treasury;

        return createBaseAnswer('H6', {
            answerability: 'P',
            verdict: gap90d <= 0 ? 'no' : 'at_risk',
            summary: gap90d <= 0
                ? 'Current treasury buffer covers at least a 90-day modeled dislocation deficit.'
                : 'Treasury buffer is short versus a 90-day modeled dislocation deficit.',
            window: `W${Math.max(1, current.t || 0)} treasury stress buffer view`,
            thresholds: [
                'Buffer target = modeled daily deficit x horizon (90d / 180d)'
            ],
            metrics: [
                { id: 'treasury_balance_usd', label: 'Treasury Balance', value: treasury.toFixed(0), unit: 'USD' },
                { id: 'modeled_daily_deficit_usd', label: 'Modeled Daily Deficit', value: dailyDeficitUsd.toFixed(2), unit: 'USD/day' },
                { id: 'required_buffer_90d_usd', label: 'Required Buffer (90d)', value: buffer90d.toFixed(0), unit: 'USD' },
                { id: 'required_buffer_180d_usd', label: 'Required Buffer (180d)', value: buffer180d.toFixed(0), unit: 'USD' },
                { id: 'buffer_gap_90d_usd', label: 'Buffer Gap (90d)', value: gap90d.toFixed(0), unit: 'USD' },
                { id: 'buffer_gap_180d_usd', label: 'Buffer Gap (180d)', value: gap180d.toFixed(0), unit: 'USD' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Treasury and net-flow stress context' },
                { kind: 'panel', ref: 'Diagnostic/SolvencyScorecard', label: 'Daily mint/burn buffer inputs' }
            ],
            reproducible: true,
            confidence: 0.8
        });
    },
    H7: (ctx) => {
        const { current, previous } = getLatestPoints(ctx);
        if (!current || !previous) {
            return createBaseAnswer('H7', {
                answerability: 'P',
                summary: 'Need at least two timesteps to infer dilution-vs-participation behavior.'
            });
        }

        const netEmission = (current.minted?.mean || 0) - (current.burned?.mean || 0);
        const providerDeltaPct = pctChange(current.providers?.mean || 0, previous.providers?.mean || 0);
        const dilutingForParticipation = netEmission > 0 && providerDeltaPct >= -1;

        return createBaseAnswer('H7', {
            answerability: 'P',
            verdict: dilutingForParticipation ? 'yes' : netEmission > 0 ? 'at_risk' : 'no',
            summary: dilutingForParticipation
                ? 'Run indicates dilution pressure while participation is being preserved.'
                : netEmission > 0
                    ? 'Dilution pressure is present but participation support is weak.'
                    : 'No net dilution pressure is visible in the current state.',
            window: `W${Math.max(1, previous.t || 0)} vs W${Math.max(1, current.t || 0)}`,
            thresholds: [
                'Dilution if minted > burned',
                'Participation preserved if provider count is stable/improving'
            ],
            metrics: [
                { id: 'net_emission_tokens_week', label: 'Net Emission', value: netEmission.toFixed(0), unit: 'tokens/week' },
                { id: 'providers_delta_wow_pct', label: 'WoW Providers Delta', value: providerDeltaPct.toFixed(2), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Financial', label: 'Dilution pressure trajectory' },
                { kind: 'chart', ref: 'Simulator/Sandbox Tier 1', label: 'Participation/retention trajectory' }
            ],
            reproducible: true,
            confidence: 0.82
        });
    },
    H8: (ctx) => {
        if (!ctx.baselineAggregated || ctx.baselineAggregated.length === 0 || ctx.aggregated.length === 0) {
            return createBaseAnswer('H8', {
                answerability: 'P',
                verdict: 'at_risk',
                summary: 'Need baseline comparison to distinguish long-run improvement from postponement.',
                window: 'Current run only',
                thresholds: [
                    'Requires intervention vs baseline comparison'
                ],
                metrics: [
                    { id: 'baseline_available', label: 'Baseline Available', value: 'No' }
                ],
                evidence: [
                    { kind: 'panel', ref: 'ScenarioComparisonPanel', label: 'Intervention vs baseline long-run comparison' }
                ],
                reproducible: false,
                confidence: 0.6
            });
        }

        const interventionRisk = computeDeathSpiralRisk(ctx);
        const baselineRisk = computeDeathSpiralRisk({ ...ctx, aggregated: ctx.baselineAggregated });
        const interventionSolvency = average(ctx.aggregated.slice(-4).map((point) => point.solvencyScore?.mean || 0));
        const baselineSolvency = average(ctx.baselineAggregated.slice(-4).map((point) => point.solvencyScore?.mean || 0));
        const riskDelta = interventionRisk.probabilityPct - baselineRisk.probabilityPct;
        const solvencyDelta = interventionSolvency - baselineSolvency;

        const improvedLongRun = riskDelta <= -5 && solvencyDelta >= 0.03;
        const postponingOnly = riskDelta <= 0 && solvencyDelta < 0.03;

        return createBaseAnswer('H8', {
            answerability: 'P',
            verdict: improvedLongRun ? 'yes' : postponingOnly ? 'at_risk' : 'no',
            summary: improvedLongRun
                ? 'Intervention improves long-run solvency and downside risk versus baseline.'
                : postponingOnly
                    ? 'Intervention appears to postpone adjustment more than structurally improve solvency.'
                    : 'Intervention does not improve long-run solvency versus baseline.',
            window: 'Intervention run vs baseline run',
            thresholds: [
                'Long-run improvement: risk delta <= -5pp and late solvency delta >= +0.03x',
                'Postponement: risk does not worsen but solvency gain remains weak'
            ],
            metrics: [
                { id: 'long_run_risk_delta_pp', label: 'Long-Run Risk Delta', value: riskDelta.toFixed(1), unit: 'pp' },
                { id: 'late_window_solvency_delta', label: 'Late-Window Solvency Delta', value: solvencyDelta.toFixed(3), unit: 'x' }
            ],
            evidence: [
                { kind: 'chart', ref: 'ScenarioComparisonPanel', label: 'Intervention-vs-baseline long-run outcomes' },
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Long-run solvency trajectory comparison' }
            ],
            reproducible: true,
            confidence: 0.81
        });
    },
    H9: (ctx) => {
        const risk = computeDeathSpiralRisk(ctx);
        const exposureScore = (risk.maxDrawdownPct * 0.55) + (risk.providerCollapsePct * 0.45);
        const exposureBand = exposureScore >= 30 ? 'high' : exposureScore >= 18 ? 'moderate' : 'low';

        return createBaseAnswer('H9', {
            answerability: 'Y',
            verdict: exposureScore >= 30 ? 'at_risk' : exposureScore >= 18 ? 'at_risk' : 'no',
            summary: `Network health exposure to token volatility is ${exposureBand} (score ${exposureScore.toFixed(1)}).`,
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)}-${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
            thresholds: [
                'Exposure score = 55% drawdown severity + 45% provider-collapse severity'
            ],
            metrics: [
                { id: 'volatility_exposure_score', label: 'Volatility Exposure Score', value: exposureScore.toFixed(1), unit: '/100' },
                { id: 'max_drawdown_pct', label: 'Max Drawdown', value: risk.maxDrawdownPct.toFixed(1), unit: '%' },
                { id: 'provider_collapse_pct', label: 'Provider Collapse', value: risk.providerCollapsePct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Volatility and downside sensitivity' },
                { kind: 'chart', ref: 'DecisionTree/Miner', label: 'Provider attrition sensitivity to volatility' }
            ],
            reproducible: true,
            confidence: 0.88
        });
    },
    H10: (ctx) => {
        const risk = computeDeathSpiralRisk(ctx);
        return createBaseAnswer('H10', {
            answerability: 'Y',
            verdict: risk.nearAlert ? 'at_risk' : 'no',
            summary: risk.nearAlert
                ? 'Current path is approaching death-spiral alert conditions.'
                : 'Current path is below death-spiral alert thresholds.',
            window: `W${Math.max(1, ctx.aggregated[0]?.t || 0)} to W${Math.max(1, ctx.aggregated[ctx.aggregated.length - 1]?.t || 0)}`,
            thresholds: [
                'Alert if estimated death-spiral probability >= 40%',
                'Alert if insolvency weeks >= 20% of horizon',
                'Alert if provider collapse >= 15%'
            ],
            metrics: [
                { id: 'death_spiral_probability_pct', label: 'Death-Spiral Probability', value: risk.probabilityPct.toFixed(1), unit: '%' },
                { id: 'insolvency_weeks', label: 'Insolvency Weeks', value: risk.insolvencyWeeks.toString(), unit: 'weeks' },
                { id: 'provider_collapse_pct', label: 'Provider Collapse', value: risk.providerCollapsePct.toFixed(1), unit: '%' },
                { id: 'max_drawdown_pct', label: 'Max Drawdown', value: risk.maxDrawdownPct.toFixed(1), unit: '%' }
            ],
            evidence: [
                { kind: 'chart', ref: 'DecisionTree/Risk', label: 'Insolvency and downside stress diagnostics' },
                { kind: 'chart', ref: 'Benchmark/SolvencyProjectionChart', label: 'Solvency trajectory toward critical floor' }
            ],
            reproducible: true,
            confidence: 0.86
        });
    },
    M1: (ctx) => {
        void ctx;
        return createBaseAnswer('M1', {
            answerability: 'N',
            verdict: 'insufficient_data',
            summary: 'Primary spoofing-detection telemetry is not wired; dashboard currently falls back to proxy-only integrity signals.',
            window: 'N/A (primary spoofing telemetry unavailable)',
            thresholds: [
                'Required primary input: spoofingDetections event stream',
                'Current state: integrity proxy with spoofingDetections fallback to zero'
            ],
            metrics: [
                { id: 'required_input', label: 'Required Input', value: 'spoofingDetections' },
                { id: 'current_input_mode', label: 'Current Input Mode', value: 'Proxy fallback (missing primary input)' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Sandbox > Onocoy Hook Layer > Integrity Pressure > Missing Primary Inputs', label: 'Missing primary spoofing input list' },
                { kind: 'metric', ref: 'onocoyHookSnapshot.missingInputs', label: 'Hook-layer missing input registry' }
            ],
            reproducible: false,
            confidence: 0.99
        });
    },
    M2: (ctx) => {
        void ctx;
        return createBaseAnswer('M2', {
            answerability: 'N',
            verdict: 'insufficient_data',
            summary: 'Primary slashing-event telemetry is not wired; dashboard currently uses proxy-only slashing rate assumptions.',
            window: 'N/A (primary slashing telemetry unavailable)',
            thresholds: [
                'Required primary input: slashingEvents event stream',
                'Current state: integrity proxy with slashingEvents fallback to zero'
            ],
            metrics: [
                { id: 'required_input', label: 'Required Input', value: 'slashingEvents' },
                { id: 'current_input_mode', label: 'Current Input Mode', value: 'Proxy fallback (missing primary input)' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Sandbox > Onocoy Hook Layer > Integrity Pressure > Missing Primary Inputs', label: 'Missing primary slashing input list' },
                { kind: 'metric', ref: 'onocoyHookSnapshot.missingInputs', label: 'Hook-layer missing input registry' }
            ],
            reproducible: false,
            confidence: 0.99
        });
    },
    M3: (ctx) => {
        void ctx;
        return createBaseAnswer('M3', {
            answerability: 'N',
            verdict: 'insufficient_data',
            summary: 'Canonical on-chain/token-plan unlock events are not wired; unlock analysis still uses scenario-proxy curves.',
            window: 'N/A (canonical unlock schedule unavailable)',
            thresholds: [
                'Required primary input: canonicalUnlockEvents from vesting/token-plan source',
                'Current state: buildOnocoyUnlockCurve() proxy scaffold'
            ],
            metrics: [
                { id: 'required_input', label: 'Required Input', value: 'canonicalUnlockEvents' },
                { id: 'current_input_mode', label: 'Current Input Mode', value: 'Scenario proxy unlock curve' }
            ],
            evidence: [
                { kind: 'panel', ref: 'Sandbox > Onocoy Hook Layer > Unlock Curve > Missing Primary Inputs', label: 'Missing canonical unlock input list' },
                { kind: 'metric', ref: 'onocoyHookSnapshot.unlockSource', label: 'Unlock source mode (proxy vs canonical)' }
            ],
            reproducible: false,
            confidence: 0.99
        });
    }
};

export function buildAcceptanceQuestionIds(): QuestionId[] {
    const ids: QuestionId[] = [];
    SECTION_SPECS.forEach((section) => {
        for (let index = 1; index <= section.count; index += 1) {
            ids.push(`${section.prefix}${index}`);
        }
    });
    return ids;
}

export const ACCEPTANCE_QUESTION_IDS = buildAcceptanceQuestionIds();

function getSectionSpec(questionId: QuestionId): SectionSpec {
    const prefix = questionId[0]?.toUpperCase();
    return SECTION_SPECS.find((section) => section.prefix === prefix) || {
        prefix,
        section: `${prefix} Unknown`,
        stakeholder: 'Unknown stakeholder',
        count: 0
    };
}

export function buildQuestionRegistry(): Record<QuestionId, QuestionDefinition> {
    const registry: Record<QuestionId, QuestionDefinition> = {};
    ACCEPTANCE_QUESTION_IDS.forEach((id) => {
        const sectionSpec = getSectionSpec(id);
        const evaluator = IMPLEMENTED_EVALUATORS[id] || createStubEvaluator(id);
        registry[id] = {
            id,
            section: sectionSpec.section,
            stakeholder: sectionSpec.stakeholder,
            prompt: PROMPT_OVERRIDES[id] || `Acceptance question ${id}`,
            implementation: IMPLEMENTED_EVALUATORS[id] ? 'implemented' : 'stub',
            evaluator
        };
    });
    return registry;
}

export const QUESTION_REGISTRY = buildQuestionRegistry();

export function isKnownGapQuestion(questionId: QuestionId): boolean {
    return NON_ANSWERABLE_GAP_IDS.has(questionId);
}
