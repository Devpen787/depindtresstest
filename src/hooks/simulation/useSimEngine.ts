import {
    ProtocolProfileV1,
    PROTOCOL_PROFILES
} from '../../data/protocols';
import { getDecisionTreeCalibration } from '../../data/decisionTreeCalibration';
import { getProtocolRuntimeCalibration } from '../../data/protocolRuntimeCalibrations';
import {
    SimulationParams as NewSimulationParams,
    AggregateResult as NewAggregateResult,
    runSimulation as runNewSimulation,
    calculateDerivedMetrics,
    DerivedMetrics,
    SimResult,
    AggregateResult,
    simulateOne
} from '../../model';
import { getProtocolModule } from '../../protocols/registry';
import { SimulationParams } from '../../model/SimulationAdapter';

export const useSimEngine = () => {
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    const deriveMarketCalibration = (profile: ProtocolProfileV1, isSandbox: boolean, params: NewSimulationParams) => {
        const calibration = getDecisionTreeCalibration(profile);

        if (isSandbox) {
            return {
                initialLiquidity: params.initialLiquidity,
                investorSellPct: params.investorSellPct,
                macro: params.macro
            };
        }

        const priceAnchor = profile.parameters.initial_price.value > 0
            ? profile.parameters.initial_price.value
            : params.initialPrice;
        const impliedMarketCap = profile.parameters.supply.value * priceAnchor;
        const calibratedLiquidity = clamp(
            impliedMarketCap * calibration.liquidityPctOfMarketCap,
            calibration.liquidityMinUsd,
            calibration.liquidityMaxUsd
        );
        const calibratedSellPct = clamp(
            params.investorSellPct * calibration.investorSellMultiplier,
            calibration.investorSellPctMin,
            calibration.investorSellPctMax
        );

        return {
            initialLiquidity: Math.max(calibration.liquidityFloorUsd, calibratedLiquidity),
            investorSellPct: calibratedSellPct,
            macro: params.macro
        };
    };

    const buildLocalParams = (
        profile: ProtocolProfileV1,
        isSandbox: boolean,
        params: NewSimulationParams,
        overrides: Partial<NewSimulationParams> = {}
    ): NewSimulationParams => {
        const calibration = getDecisionTreeCalibration(profile);
        const runtimeCalibration = getProtocolRuntimeCalibration(profile.metadata.id);
        const calibratedMarket = deriveMarketCalibration(profile, isSandbox, params);
        const selectedInitialPrice = isSandbox
            ? params.initialPrice
            : profile.parameters.initial_price.value;
        const safePrice = Math.max(selectedInitialPrice, 0.01);
        const emissionRateCap = profile.parameters.supply.value * calibration.emissionCapPctOfSupply;

        const normalizedBaseDemand = Math.max(
            calibration.baseDemandFloor,
            profile.parameters.initial_active_providers.value * params.baseCapacityPerProvider * calibration.targetUtilization
        );

        const providerBreakEvenMint = (
            profile.parameters.initial_active_providers.value *
            profile.parameters.provider_economics.opex_weekly.value
        ) / safePrice;

        const burnBackedMint = (
            profile.parameters.burn_fraction.value *
            ((normalizedBaseDemand * calibration.burnBackedDemandFraction) / safePrice)
        ) * calibration.burnBackedMintMultiplier;

        const structuralMintCap = Math.max(
            providerBreakEvenMint * calibration.breakEvenMintMultiplier,
            burnBackedMint
        );

        const normalizedMaxMintWeekly = isSandbox
            ? params.maxMintWeekly
            : Math.min(profile.parameters.emissions.value, emissionRateCap, structuralMintCap);

        const calibratedKBuyPressure = isSandbox
            ? params.kBuyPressure
            : (runtimeCalibration.kBuyPressure ?? 0.08);
        const calibratedKSellPressure = isSandbox
            ? params.kSellPressure
            : (runtimeCalibration.kSellPressure ?? 0.12);
        const calibratedKDemandPrice = isSandbox
            ? params.kDemandPrice
            : (runtimeCalibration.kDemandPrice ?? params.kDemandPrice);
        const calibratedKMintPrice = isSandbox
            ? params.kMintPrice
            : (runtimeCalibration.kMintPrice ?? params.kMintPrice);
        const calibratedBaseServicePrice = isSandbox
            ? params.baseServicePrice
            : (runtimeCalibration.baseServicePrice ?? 0.5);
        const calibratedServicePriceElasticity = isSandbox
            ? params.servicePriceElasticity
            : (runtimeCalibration.servicePriceElasticity ?? 0.6);
        const calibratedPreorderBacklogFraction = params.preorderBacklogFraction
            ?? runtimeCalibration.preorderBacklogFraction
            ?? 0;
        const calibratedPreorderReleaseWeeks = params.preorderReleaseWeeks
            ?? runtimeCalibration.preorderReleaseWeeks
            ?? 0;
        const calibratedSunkCostChurnDamping = params.sunkCostChurnDamping
            ?? runtimeCalibration.sunkCostChurnDamping
            ?? 0;

        return {
            scenario: params.scenario,
            T: params.T,
            initialSupply: profile.parameters.supply.value,
            initialPrice: selectedInitialPrice,
            initialLiquidity: calibratedMarket.initialLiquidity,
            investorUnlockWeek: params.investorUnlockWeek,
            investorSellPct: calibratedMarket.investorSellPct,
            maxMintWeekly: normalizedMaxMintWeekly,
            burnPct: isSandbox ? params.burnPct : profile.parameters.burn_fraction.value,
            demandType: isSandbox ? params.demandType : profile.parameters.demand_regime.value,
            baseDemand: isSandbox ? calibration.baseDemandFloor : normalizedBaseDemand,
            demandVolatility: 0.05,
            macro: calibratedMarket.macro,
            initialProviders: profile.parameters.initial_active_providers.value,
            baseCapacityPerProvider: params.baseCapacityPerProvider,
            capacityStdDev: 0.2,
            providerCostPerWeek: isSandbox ? params.providerCostPerWeek : profile.parameters.provider_economics.opex_weekly.value,
            costStdDev: 0.15,
            hardwareLeadTime: 2,
            churnThreshold: isSandbox ? params.churnThreshold : profile.parameters.provider_economics.churn_threshold.value,
            profitThresholdToJoin: 15,
            maxProviderGrowthRate: 0.15,
            maxProviderChurnRate: 0.10,
            preorderBacklogFraction: calibratedPreorderBacklogFraction,
            preorderReleaseWeeks: calibratedPreorderReleaseWeeks,
            sunkCostChurnDamping: calibratedSunkCostChurnDamping,
            kBuyPressure: calibratedKBuyPressure,
            kSellPressure: calibratedKSellPressure,
            kDemandPrice: calibratedKDemandPrice,
            kMintPrice: calibratedKMintPrice,
            baseServicePrice: calibratedBaseServicePrice,
            servicePriceElasticity: calibratedServicePriceElasticity,
            minServicePrice: 0.05,
            maxServicePrice: 5.0,
            rewardLagWeeks: profile.parameters.adjustment_lag.value,
            nSims: params.nSims,
            seed: params.seed,
            competitorYield: params.competitorYield,
            emissionModel: params.emissionModel,
            revenueStrategy: params.revenueStrategy,
            hardwareCost: isSandbox ? params.hardwareCost : profile.parameters.hardware_cost.value,
            proTierPct: isSandbox ? params.proTierPct : (profile.parameters.pro_tier_pct?.value || 0.0),
            proTierEfficiency: params.proTierEfficiency,
            ...overrides
        };
    };

    const mapNewResultsToAggregate = (newResults: NewAggregateResult[]): AggregateResult[] => {
        return newResults.map(r => ({
            t: r.t,
            price: r.price,
            supply: r.supply,
            demand: r.demand,
            demand_served: r.demandServed,
            providers: r.providers,
            capacity: r.capacity,
            servicePrice: r.servicePrice,
            minted: r.minted,
            burned: r.burned,
            utilization: r.utilisation,
            profit: r.profit,
            scarcity: r.scarcity,
            incentive: r.incentive,
            buyPressure: r.buyPressure,
            sellPressure: r.sellPressure,
            netFlow: r.netFlow,
            churnCount: r.churnCount,
            joinCount: r.joinCount,
            solvencyScore: r.solvencyScore,
            netDailyLoss: r.netDailyLoss,
            dailyMintUsd: r.dailyMintUsd,
            dailyBurnUsd: r.dailyBurnUsd,
            urbanCount: r.urbanCount,
            ruralCount: r.ruralCount,
            weightedCoverage: r.weightedCoverage,
            treasuryBalance: r.treasuryBalance || { mean: 0, p10: 0, p90: 0 },
            vampireChurn: r.vampireChurn || { mean: 0, p10: 0, p90: 0 },
            mercenaryCount: r.mercenaryCount || { mean: 0, p10: 0, p90: 0 },
            proCount: r.proCount || { mean: 0, p10: 0, p90: 0 },
            underwaterCount: r.underwaterCount || { mean: 0, p10: 0, p90: 0 },
            costPerCapacity: r.costPerCapacity || { mean: 0, p10: 0, p90: 0 },
            revenuePerCapacity: r.revenuePerCapacity || { mean: 0, p10: 0, p90: 0 },
            entryBarrierActive: r.entryBarrierActive || { mean: 0, p10: 0, p90: 0 }
        })) as unknown as AggregateResult[];
    };

    return { buildLocalParams, mapNewResultsToAggregate };
};
