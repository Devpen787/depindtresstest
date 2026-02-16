
import { runSimulation } from "../../src/model/simulation";
import { DEFAULT_PARAMS } from "../../src/model/params";

console.log("Imports successful!");
console.log("Default Initial Price:", DEFAULT_PARAMS.initialPrice);

try {
    const results = runSimulation(DEFAULT_PARAMS);
    console.log("Simulation run successful. Result count:", results.length);
} catch (e) {
    console.error("Simulation failed:", e);
    process.exit(1);
}
