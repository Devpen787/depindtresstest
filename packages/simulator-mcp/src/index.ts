#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Import directly from the source model
// tsx handles the resolution of these files
import { runSimulation } from "../../src/model/simulation";
import { DEFAULT_PARAMS } from "../../src/model/params";
import { SimulationParams, AggregateResult } from "../../src/model/types";

// --- Server Setup ---
const server = new Server(
    {
        name: "depin-simulator-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// --- Helpers ---
// Simplify the output to avoid context window explosion
function simplifyResults(results: AggregateResult[]): any[] {
    // Return every 4th datapoint (approx monthly) + last point
    const filtered = results.filter((_, i) => i % 4 === 0 || i === results.length - 1);
    return filtered.map(r => ({
        t: r.t,
        price: r.price.mean,
        providers: r.providers.mean,
        revenue: r.dailyMintUsd.mean,
        solvency: r.solvencyScore.mean
    }));
}

// --- Tool Handlers ---
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "run_simulation",
                description: "Run the DePIN Stress Test Simulation with custom parameters.",
                inputSchema: {
                    type: "object",
                    properties: {
                        initialPrice: { type: "number", description: "Initial token price in USD" },
                        initialProviders: { type: "number", description: "Starting number of nodes" },
                        maxMintWeekly: { type: "number", description: "Max tokens minted per week" },
                        competitorYield: { type: "number", description: "Competitor APY (e.g., 0.5 for 50%)" },
                        scenario: { type: "string", enum: ["baseline", "bull_run", "bear_market", "comp_war"], description: "Macro scenario preset" }
                    },
                },
            },
            {
                name: "get_default_params",
                description: "Get the baseline simulation parameters.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            }
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;

        if (name === "get_default_params") {
            return { content: [{ type: "text", text: JSON.stringify(DEFAULT_PARAMS, null, 2) }] };
        }

        if (name === "run_simulation") {
            const overrides = args as Partial<SimulationParams>;

            // Merge defaults with overrides
            const params: SimulationParams = {
                ...DEFAULT_PARAMS,
                ...overrides,
                // Ensure derived/complex objects are preserved if not overridden
                // For now, rely on shallow merge for top-level keys
            };

            // Run the simulation
            // runSimulation returns AggregateResult[] directly in the new model?
            // Let's check the signature in src/model/simulation.ts. 
            // It exports 'runSimulation' that returns 'AggregateResult[]'

            const results = runSimulation(params);

            // Simplify for LLM consumption
            const simplified = simplifyResults(results);

            // Calculate summary stats
            const final = results[results.length - 1];
            const summary = {
                final_price: final.price.mean,
                final_providers: final.providers.mean,
                min_solvency: Math.min(...results.map(r => r.solvencyScore.mean)),
                is_solvent: Math.min(...results.map(r => r.solvencyScore.mean)) > 0
            };

            return {
                content: [
                    {
                        type: "text",
                        text: `Simulation Complete.\n\nSummary:\n${JSON.stringify(summary, null, 2)}\n\nSampled Trajectory:\n${JSON.stringify(simplified, null, 2)}`
                    }
                ]
            };
        }

        throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
        };
    }
});

// --- Start Server ---
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

runServer().catch(console.error);
