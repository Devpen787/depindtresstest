import { SeededRNG } from '../rng';
import { DemandType, MacroCondition, MetricStats } from '../types';

export interface LegacySimulationParams {
    T: number;
    initialSupply: number;
    initialPrice: number;
    initialProviders: number;
    maxMintWeekly: number;
    burnPct: number;

    // Liquidity & Investor Unlock (Module 3)
    initialLiquidity: number;
    investorUnlockWeek: number;
    investorSellPct: number;

    demandType: DemandType;
    macro: MacroCondition;
    nSims: number;
    seed: number;
    providerCostPerWeek: number;
    baseCapacityPerProvider: number;
    kDemandPrice: number;
    kMintPrice: number;
    rewardLagWeeks: number;
    churnThreshold: number;
    hardwareCost: number; // [NEW] Added for customizable payback calc

    // Module 4: Competitive Resilience (Risk Engine)
    competitorYield: number;  // 0.0 to 2.0 (0% to 200% competitor yield advantage)
    emissionModel: 'fixed' | 'kpi';  // Fixed schedule vs demand-driven
    revenueStrategy: 'burn' | 'reserve';  // Buy & Burn vs Sinking Fund

    // Module 5: Report-Aligned Scenarios
    growthCallEventWeek?: number;        // Week to trigger "Supply Shock"
    growthCallEventPct?: number;         // Magnitude of shock (0.5 = +50%)
}

export interface LegacySimResult {
    t: number;
    price: number;
    supply: number;
    demand: number;
    demand_served: number;
    providers: number;
    capacity: number;
    servicePrice: number;
    minted: number;
    burned: number;
    utilization: number;
    profit: number;
    scarcity: number;
    incentive: number;
    solvencyScore: number;
    netDailyLoss: number;
    dailyMintUsd: number;
    dailyBurnUsd: number;
    netFlow: number;
    churnCount: number;
    joinCount: number;
    treasuryBalance: number;  // Module 4: Accumulated Sinking Fund
    vampireChurn: number;     // Module 4: Churn from competitor yield
    mercenaryCount: number;   // [NEW] Cohort tracking
    proCount: number;         // [NEW] Cohort tracking
    // Solvency Scorecard Compatibility
    underwaterCount: number;
    costPerCapacity: number;
    revenuePerCapacity: number;
    entryBarrierActive: number;
}

export interface LegacyAggregateResult {
    t: number;
    price: MetricStats;
    supply: MetricStats;
    demand: MetricStats;
    demand_served: MetricStats;
    providers: MetricStats;
    capacity: MetricStats;
    servicePrice: MetricStats;
    minted: MetricStats;
    burned: MetricStats;
    utilization: MetricStats;
    profit: MetricStats;
    scarcity: MetricStats;
    incentive: MetricStats;
    solvencyScore: MetricStats;
    netDailyLoss: MetricStats;
    dailyMintUsd: MetricStats;
    dailyBurnUsd: MetricStats;
    netFlow: MetricStats;
    churnCount: MetricStats;
    joinCount: MetricStats;
    treasuryBalance: MetricStats;  // Module 4: Accumulated Sinking Fund
    vampireChurn: MetricStats;     // Module 4: Churn from competitor yield
    mercenaryCount: MetricStats;   // [NEW] Cohort tracking
    proCount: MetricStats;         // [NEW] Cohort tracking
    // Solvency Scorecard Compatibility
    underwaterCount: MetricStats;
    costPerCapacity: MetricStats;
    revenuePerCapacity: MetricStats;
    entryBarrierActive: MetricStats;
}

export function getDemandSeries(T: number, base: number, type: DemandType, rng: SeededRNG): number[] {
    const series: number[] = [];
    for (let t = 0; t < T; t++) {
        let d = 0;
        if (type === 'consistent') d = base * (1 + 0.03 * rng.normal());
        else if (type === 'high-to-decay') d = base * (1.6 * Math.exp(-t / 10) + 0.6) * (1 + 0.05 * rng.normal());
        else if (type === 'growth') d = base * (0.8 + 0.02 * t) * (1 + 0.05 * rng.normal());
        else if (type === 'volatile') d = base * (1 + 0.20 * rng.normal());
        series.push(Math.max(0, d));
    }
    return series;
}

export function simulateOne(params: LegacySimulationParams, simSeed: number): LegacySimResult[] {
    const rng = new SeededRNG(simSeed);
    // Modifying simulateOne to track Cohorts
    const { T, initialSupply, initialPrice, initialProviders, maxMintWeekly, burnPct, demandType, macro,
        providerCostPerWeek, baseCapacityPerProvider, kDemandPrice, kMintPrice, rewardLagWeeks, churnThreshold,
        initialLiquidity, investorUnlockWeek, investorSellPct,
        // Module 4: Competitive Resilience
        competitorYield, emissionModel, revenueStrategy
    } = params;

    let mu = 0.002, sigma = 0.05;
    if (macro === 'bearish') { mu = -0.01; sigma = 0.06; }
    else if (macro === 'bullish') { mu = 0.015; sigma = 0.06; }

    const demands = getDemandSeries(T, 12000, demandType, rng);
    const results: LegacySimResult[] = [];

    let currentSupply = initialSupply;
    let currentPrice = initialPrice;

    // COHORT INITIALIZATION
    // "The Great Flush" Tuning: 60% Mercenaries to ensure visible capitulation
    const MERCENARY_RATIO = 0.60;
    let activeMercenaries = (initialProviders || 30) * MERCENARY_RATIO;
    let activePros = (initialProviders || 30) * (1 - MERCENARY_RATIO);
    let currentProviders = activeMercenaries + activePros;

    let currentServicePrice = 0.5;

    let poolUsd = initialLiquidity;
    let poolTokens = poolUsd / currentPrice;
    const kAmm = poolUsd * poolTokens;

    let consecutiveLowProfitWeeks = 0;
    // Track price history for "Panic" logic
    const priceHistory: number[] = [];

    // Initialize reward history array properly for TS
    const rewardHistory: number[] = new Array(Math.max(1, rewardLagWeeks)).fill(params.providerCostPerWeek * 1.5);

    // Module 4: Treasury tracking for Sinking Fund
    let treasuryBalance = 0;

    for (let t = 0; t < T; t++) {
        priceHistory.push(currentPrice);
        const demand = demands[t];
        const capacity = Math.max(0.001, currentProviders * baseCapacityPerProvider);
        const demand_served = Math.min(demand, capacity);
        const utilization = (demand_served / capacity) * 100;

        const scarcity = (demand - capacity) / capacity;
        currentServicePrice = Math.min(Math.max(currentServicePrice * (1 + 0.6 * scarcity), 0.05), 5.0);

        const safePrice = Math.max(currentPrice, 0.0001);
        const tokensSpent = (demand_served * currentServicePrice) / safePrice;

        const burnedRaw = burnPct * tokensSpent;
        const burned = Math.min(currentSupply * 0.95, burnedRaw);

        // Emissions: Simplified Halving vs Dynamic logic
        const saturation = Math.min(1.0, currentProviders / 5000.0);
        let emissionFactor = 0.6 + 0.4 * Math.tanh(demand / 15000.0) - (0.2 * saturation);

        if (emissionModel === 'kpi') {
            const utilizationRatio = Math.min(1, demand_served / capacity);
            emissionFactor *= Math.max(0.3, utilizationRatio);
            if (currentPrice < initialPrice * 0.8) {
                emissionFactor *= 0.6;
            }
        }

        const minted = Math.max(0, Math.min(maxMintWeekly, maxMintWeekly * emissionFactor));
        currentSupply = Math.max(1000.0, currentSupply + minted - burned);

        const instantRewardValue = (minted / Math.max(currentProviders, 0.1)) * safePrice;
        rewardHistory.push(instantRewardValue);
        if (rewardHistory.length > Math.max(1, rewardLagWeeks)) rewardHistory.shift();

        const delayedReward = rewardHistory[0];
        const profit = delayedReward - providerCostPerWeek;
        const incentive = profit / providerCostPerWeek;

        // ---------- COHORT LOGIC ----------
        // 1. Mercenary Churn (Panic Driven)
        let mercenaryChurnRate = 0;

        // PANIC TRIGGER: Price < 80% of price 8 weeks ago (approx 2 months)
        if (t > 8) {
            const price2MonthsAgo = priceHistory[t - 8];
            if (currentPrice < price2MonthsAgo * 0.8) {
                // PANIC MODE: Dump 20% of remaining mercenaries per week (~80% in a month approx)
                mercenaryChurnRate = 0.20;
            } else if (profit < 0) {
                // Standard unprofitability churn (faster than pros)
                mercenaryChurnRate = 0.05;
            }
        }

        // 2. Pro Churn (Sticky)
        let proChurnRate = 0;
        if (profit < -providerCostPerWeek * 0.5) {
            // Only leave if losing MASSIVE money (deeply unprofitable)
            proChurnRate = 0.01;
        }

        // Apply Churn
        const mercsLeaving = activeMercenaries * mercenaryChurnRate;
        const prosLeaving = activePros * proChurnRate;
        activeMercenaries = Math.max(0, activeMercenaries - mercsLeaving);
        activePros = Math.max(0, activePros - prosLeaving);

        // Growth (New Entrants) - Split 50/50 for simplicity for now
        const maxGrowth = currentProviders * 0.15;
        const rawDelta = (incentive * 4.5) + rng.normal() * 0.5;
        let totalGrowth = Math.max(-currentProviders * 0.1, Math.min(maxGrowth, rawDelta));

        // Only grow if incentive is positive
        if (totalGrowth > 0) {
            activeMercenaries += totalGrowth * 0.5;
            activePros += totalGrowth * 0.5;
        }

        currentProviders = activeMercenaries + activePros;
        // ----------------------------------

        // Module 4: Vampire Attack logic (Simplified applied to Total)
        let vampireChurnAmount = 0;
        if (competitorYield > 0.2) {
            // Vampires steal MERCENARIES primarily
            vampireChurnAmount = activeMercenaries * competitorYield * 0.05;
            activeMercenaries = Math.max(0, activeMercenaries - vampireChurnAmount);
            currentProviders = activeMercenaries + activePros;
        }

        let netFlow = 0;
        let nextPrice = currentPrice;

        if (t === investorUnlockWeek) {
            const unlockAmount = currentSupply * investorSellPct;
            const newPoolTokens = poolTokens + unlockAmount;
            const newPoolUsd = kAmm / newPoolTokens;

            poolTokens = newPoolTokens;
            poolUsd = newPoolUsd;
            nextPrice = poolUsd / poolTokens;
            netFlow = -unlockAmount;

            // Investor dump triggers panic churn automatically via priceHistory check next week
        } else {
            const demandPressure = kDemandPrice * Math.tanh(scarcity);
            const dilutionPressure = -kMintPrice * (minted / currentSupply) * 100;
            const logRet = mu + demandPressure + dilutionPressure + sigma * rng.normal();
            nextPrice = Math.max(0.01, currentPrice * Math.exp(logRet));

            poolUsd = Math.sqrt(kAmm * nextPrice);
            poolTokens = Math.sqrt(kAmm / nextPrice);
        }

        const dailyMintUsd = (minted / 7) * currentPrice;
        const dailyBurnUsd = (burned / 7) * currentPrice;
        let netDailyLoss = dailyBurnUsd - dailyMintUsd;
        const solvencyScore = dailyMintUsd > 0 ? dailyBurnUsd / dailyMintUsd : 10;

        if (revenueStrategy === 'reserve') {
            treasuryBalance += minted * currentPrice * 0.1;
            if (nextPrice < currentPrice) {
                const priceDrop = currentPrice - nextPrice;
                nextPrice = currentPrice - (priceDrop * 0.5);
            }
        } else {
            nextPrice = nextPrice * 1.001;
        }

        results.push({
            t, price: currentPrice, supply: currentSupply, demand, demand_served,
            providers: currentProviders, capacity, servicePrice: currentServicePrice,
            minted, burned, utilization, profit, scarcity, incentive,
            solvencyScore, netDailyLoss, dailyMintUsd, dailyBurnUsd,
            netFlow, churnCount: mercsLeaving + prosLeaving, joinCount: totalGrowth > 0 ? totalGrowth : 0,
            treasuryBalance, vampireChurn: vampireChurnAmount,
            // [NEW] Cohort Data
            mercenaryCount: activeMercenaries,
            proCount: activePros,
            underwaterCount: profit < churnThreshold ? currentProviders : 0,

            costPerCapacity: (minted * currentPrice) / Math.max(capacity, 0.1),
            revenuePerCapacity: (demand_served * currentServicePrice) / Math.max(capacity, 0.1),
            // Legacy Hysteresis: We don't have a strict 'barrier' flag, but we have the condition.
            // Condition: totalGrowth (joinCount) <= 0 AND incentive is high enough? 
            // Actually, in legacy, growth is: let totalGrowth = ...; if (totalGrowth > 0) ...
            // The barrier logic is implicit in `totalGrowth` calculation.
            // Let's replicate the check:
            entryBarrierActive: (incentive * 4.5 < 0) ? 1 : 0 // heuristic for legacy
        } as LegacySimResult);

        currentPrice = nextPrice;
    }
    return results;
}
