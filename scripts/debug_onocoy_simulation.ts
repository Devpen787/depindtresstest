
import { runSimulation } from '../src/model/simulation.ts'; // Explicit extension for ts-node environment
import { PROTOCOL_PROFILES } from '../src/data/protocols.ts';

const onocoy = PROTOCOL_PROFILES.find(p => p.metadata.id === 'ono_v3_calibrated');

if (!onocoy) {
    console.error("ONOCOY profile not found!");
    process.exit(1);
}

console.log("Running Simulation for ONOCOY...");
console.log("Params:", JSON.stringify(onocoy.parameters, null, 2));

try {
    // Map V1 Profile to Simulation Params
    const simParams: any = {
        T: 52,
        initialSupply: onocoy.parameters.supply.value,
        initialPrice: onocoy.parameters.initial_price.value,
        maxMintWeekly: onocoy.parameters.emissions.value,
        burnPct: onocoy.parameters.burn_fraction.value,
        initialProviders: onocoy.parameters.initial_active_providers.value,
        baseDemand: 1000, // Default baseline if not in profile
        demandType: onocoy.parameters.demand_regime.value,
        providerCostPerWeek: onocoy.parameters.provider_economics.opex_weekly.value,
        churnThreshold: onocoy.parameters.provider_economics.churn_threshold.value,
        hardwareCost: onocoy.parameters.hardware_cost.value,
        proTierPct: onocoy.parameters.pro_tier_pct.value,
        // Defaults for missing params
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
        sybilAttackEnabled: false,
        sybilSize: 0,
        scenario: 'base',
        competitorYield: 0,
        demandVolatility: 0.2,
        rewardLagWeeks: onocoy.parameters.adjustment_lag.value
    };

    const results = runSimulation(simParams);
    // Handle both potential return types (Array or Object)
    const agg = Array.isArray(results) ? results : (results as any).aggregated || [];

    console.log(`\nSimulation Steps: ${agg.length}`);
    if (agg.length > 0) {
        console.log("First 5 Weeks Data:");
        agg.slice(0, 5).forEach(d => {
            console.log(`Week ${d.t}:`);
            console.log(`  Treasury: $${d.treasury?.mean?.toFixed(2)}`);
            console.log(`  Price: $${d.price?.mean?.toFixed(4)}`);
            console.log(`  Active Nodes: ${d.providers?.mean?.toFixed(0)}`);
            console.log(`  Burned: ${d.burned?.mean?.toFixed(2)} tokens`);
        });

        console.log("\nLast 5 Weeks Data:");
        agg.slice(-5).forEach(d => {
            console.log(`Week ${d.t}:`);
            console.log(`  Treasury: $${d.treasury?.mean?.toFixed(2)}`);
            console.log(`  Price: $${d.price?.mean?.toFixed(4)}`);
            console.log(`  Active Nodes: ${d.providers?.mean?.toFixed(0)}`);
        });
    } else {
        console.error("Aggregation returned EMPTY array.");
    }

} catch (e) {
    console.error("Simulation CRASHED:", e);
}
