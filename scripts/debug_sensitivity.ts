import { Optimizer } from '../src/model/optimizer';
import { SimulationParams } from '../src/model/types';
import { AggregateResult } from '../src/model/types'; // Import this

// Mock params based on default "ONOCOY" profile or similar
const mockParams: SimulationParams = {
    T: 52,
    nSims: 1, // Fast mode
    initialPrice: 0.50,
    maxMintWeekly: 100000,
    burnPct: 0.1,
    baseDemand: 12000, // [FIX] Added base demand
    revenueStrategy: 'burn',
    emissionModel: 'fixed',
    demandType: 'growth',
    macro: 'neutral',
    // Provider Economics
    initialProviders: 1000,
    providerCostPerWeek: 5,
    hardwareCost: 800,
    churnThreshold: 5,
    proTierPct: 0.8,
    rewardLagWeeks: 4, // Was missing, caused crash
    // Risk
    priceShock: 0,
    insiderOverhang: 0,
    competitorYield: 0,
    // Model Params
    kBuyPressure: 1.0,
    kMintPrice: 1.0,
    maxServicePrice: 100,
    seed: 42
};

console.log("Running Sensitivity Sweep Debug...");
try {
    const results = Optimizer.runSensitivitySweep(mockParams);
    console.log("Sweep Results:");
    console.log(JSON.stringify(results, null, 2));
} catch (error) {
    console.error("Error running sweep:", error);
}
