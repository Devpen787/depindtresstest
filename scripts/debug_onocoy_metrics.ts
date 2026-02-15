
import { runSimulation } from '../src/model/simulation.ts';
import { PROTOCOL_PROFILES } from '../src/data/protocols.ts';

const onocoy = PROTOCOL_PROFILES.find(p => p.metadata.id === 'ono_v3_calibrated');

if (!onocoy) {
    console.error("ONOCOY profile not found!");
    process.exit(1);
}

// Map V1 Profile to Simulation Params (reusing previous logic)
const simParams: any = {
    T: 52,
    nSims: 5, // Fixed: Added nSims
    seed: 42, // Fixed: Added seed
    initialSupply: onocoy.parameters.supply.value,
    initialPrice: onocoy.parameters.initial_price.value,
    maxMintWeekly: onocoy.parameters.emissions.value,
    burnPct: onocoy.parameters.burn_fraction.value,
    initialProviders: onocoy.parameters.initial_active_providers.value,
    baseDemand: 1000,
    demandType: onocoy.parameters.demand_regime.value,
    providerCostPerWeek: onocoy.parameters.provider_economics.opex_weekly.value,
    churnThreshold: onocoy.parameters.provider_economics.churn_threshold.value,
    hardwareCost: onocoy.parameters.hardware_cost.value,
    proTierPct: onocoy.parameters.pro_tier_pct.value,
    capacityStdDev: 0.2, // Fixed: Added missing curr param
    baseCapacityPerProvider: 100, // Fixed: Added missing param
    // Defaults
    baseServicePrice: 0.1,
    maxServicePrice: 10.0,
    minServicePrice: 0.01,
    servicePriceElasticity: 0.5,
    hardwareLeadTime: 4,
    maxProviderGrowthRate: 0.15,
    maxProviderChurnRate: 0.20,
    profitThresholdToJoin: 20,
    initialLiquidity: 500000,
    investorUnlockWeek: 100,
    investorSellPct: 0.0,
    kBuyPressure: 0.5,
    kSellPressure: 0.5,
    kDemandPrice: 0.2,
    kMintPrice: 0.1,
    networkEffectsEnabled: true,
    scenario: 'base',
    demandVolatility: 0.2,
    rewardLagWeeks: onocoy.parameters.adjustment_lag.value
};

console.log("Sim Params:", JSON.stringify(simParams, null, 2));
const results = runSimulation(simParams);
const agg = Array.isArray(results) ? results : (results as any).aggregated || [];

if (agg.length > 0) {
    console.log("--- Capital Efficiency Audit ---");
    // Check middle and end
    [10, 25, 50].forEach(t => {
        const d = agg[t];
        if (d) {
            console.log(`Week ${t}:`);
            console.log(`  Cost/GB: ${d.costPerCapacity?.mean}`);
            console.log(`  Rev/GB: ${d.revenuePerCapacity?.mean}`);
            console.log(`  Total Providers: ${d.providers?.mean}`);
            console.log(`  Capacity: ${d.capacity?.mean}`);
        }
    });

    console.log("\n--- Growth Audit ---");
    agg.slice(0, 10).forEach(d => {
        console.log(`Week ${d.t}: Joiners=${d.joinCount?.mean.toFixed(1)} BarrierActive=${d.entryBarrierActive?.mean}`);
    });
}
