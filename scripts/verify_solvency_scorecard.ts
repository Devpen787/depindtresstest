
/**
 * Verification Script for Solvency Scorecard
 * Tests:
 * 1. Underwater Node Count (Consecutive Losses)
 * 2. Capital Efficiency (Cost vs Revenue)
 * 3. Hysteresis Barrier (Entry Block)
 */

import { runSimulation, SimulationParams } from '../src/model/SimulationAdapter';
import { DEFAULT_SIMULATION_PARAMS } from '../src/model/SimulationAdapter';

// Create a scenario likely to trigger distress
const STRESS_PARAMS: SimulationParams = {
    ...DEFAULT_SIMULATION_PARAMS as any,
    T: 20,
    initialPrice: 0.001, // Crash price
    initialProviders: 50000, // Dilute rewards massively (High Saturation)
    maxMintWeekly: 10000, // Starve rewards
    churnThreshold: -5, // Easier to be underwater
    profitThresholdToJoin: 5,
    hardwareCost: 500,
    nSims: 5,
};

console.log('Running Solvency Scorecard Verification...');
console.log('Parameters:', {
    T: STRESS_PARAMS.T,
    initialPrice: STRESS_PARAMS.initialPrice,
    churnThreshold: STRESS_PARAMS.churnThreshold,
    profitThresholdToJoin: STRESS_PARAMS.profitThresholdToJoin
});

const results = runSimulation(STRESS_PARAMS);

// Analyze Results
let distressFound = false;
let barrierActiveFound = false;

results.forEach(r => {
    // 1. Check Distress
    if (r.underwaterCount.mean > 0) {
        if (!distressFound) {
            console.log(`[VERIFIED] Week ${r.t}: Found ${r.underwaterCount.mean.toFixed(1)} underwater nodes.`);
            distressFound = true;
        }
    }

    // 2. Check Efficiency
    // Cost/GB should be defined
    if (r.costPerCapacity.mean === 0 && r.minted.mean > 0) {
        console.warn(`[WARNING] Week ${r.t}: Minted tokens but Cost/GB is 0. Check calculation.`);
    }

    // 3. Check Barrier
    if (r.entryBarrierActive.mean > 0.5) {
        if (!barrierActiveFound) {
            console.log(`[VERIFIED] Week ${r.t}: Entry Barrier ACTIVE (Growth Locked).`);
            barrierActiveFound = true;
        }
    }
});

if (distressFound) {
    console.log('✅ Network Distress Logic: PASS');
} else {
    console.log('⚠️ Network Distress Logic: NO DISTRESS FOUND (Try harsher params?)');
}

if (barrierActiveFound) {
    console.log('✅ Hysteresis Barrier Logic: PASS');
} else {
    console.log('⚠️ Hysteresis Barrier Logic: NO BARRIER FOUND (Try higher threshold?)');
}

// Print final week stats
const final = results[results.length - 1];
console.table({
    Week: final.t,
    Underwater: final.underwaterCount.mean.toFixed(1),
    CostPerGB: final.costPerCapacity.mean.toFixed(4),
    RevPerGB: final.revenuePerCapacity.mean.toFixed(4),
    BarrierActive: final.entryBarrierActive.mean > 0.5 ? 'YES' : 'NO'
});
