import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Types for the simulation result (simplified)
interface SimulationResult {
    metadata: {
        timestamp: string;
        description: string;
    };
    metrics: {
        breakEvenMonth?: number;
        minTokenPrice?: number;
        maxDrawdown?: number;
        finalSunkCost?: number;
    };
}

const analyze = () => {
    try {
        // 1. Read latest result (mock path for now, usually passed as arg)
        const resultPath = process.argv[2] || 'simulation-result.json';

        // Check if file exists, if not usage mock data for demo
        let data: SimulationResult;
        try {
            const fileContent = readFileSync(resultPath, 'utf-8');
            data = JSON.parse(fileContent);
        } catch (e) {
            console.log(`No result found at ${resultPath}, using mock data for demo.`);
            data = {
                metadata: { timestamp: new Date().toISOString(), description: 'Demo Run' },
                metrics: { breakEvenMonth: 14, minTokenPrice: 0.45, maxDrawdown: 12, finalSunkCost: 1500 }
            };
        }

        // 2. Determine Headline & Tone
        const { breakEvenMonth, minTokenPrice } = data.metrics;
        let headline = "Simulation Analysis";
        let tone: 'success' | 'warning' | 'failure' = 'neutral';
        let prompt = "";

        if (minTokenPrice && minTokenPrice < 0.10) {
            headline = "Critical Failure: Token Collapse";
            tone = "failure";
            prompt = "Shattered glass abstract, dark moody colors, glitch art style, dramatic shadows, red warning lights";
        } else if (breakEvenMonth && breakEvenMonth < 18) {
            headline = "Strong Performance: Early Break-Even";
            tone = "success";
            prompt = "Futuristic eco-city, golden hour sunlight, soaring geometric structures, hyper-realistic, 8k, cinematic lighting";
        } else {
            headline = "Moderate Growth: Sustainability Check Required";
            tone = "warning";
            prompt = "Storm clouds gathering over digital landscape, neon orange warning lights, cyberpunk aesthetic, atmospheric fog";
        }

        // 3. Output as JSON for the Agent to use
        const output = {
            headline,
            tone,
            narrative_prompt: `Write a financial news summary for a DePIN project with these stats: Break-Even Month ${breakEvenMonth}, Min Price $${minTokenPrice}. Tone: ${tone}.`,
            image_prompt: prompt,
            data
        };

        console.log(JSON.stringify(output, null, 2));

        // Optional: save to file for the agent to read
        writeFileSync('analysis_output.json', JSON.stringify(output, null, 2));

    } catch (error) {
        console.error("Analysis failed:", error);
        process.exit(1);
    }
};

analyze();
