import { BenchmarkPoint } from '../data/benchmarks/helium';

export interface NormalizedBenchmark {
    t: number;
    benchmarkPrice: number;
    benchmarkNodes: number;
}

/**
 * Normalizes benchmark data to match the simulation's starting conditions.
 * Scaled so that Benchmark Start Price = Simulation Start Price.
 */
export function normalizeBenchmark(
    data: BenchmarkPoint[],
    simStartPrice: number,
    simStartNodes: number,
    totalWeeks: number
): NormalizedBenchmark[] {
    if (!data || data.length === 0) return [];

    const basePrice = data[0].price;
    const baseNodes = data[0].nodes;

    const priceScale = simStartPrice / Math.max(0.0001, basePrice);
    const nodeScale = simStartNodes / Math.max(1, baseNodes);

    // We need to map Month (benchmark) to Week (simulation)
    // Interpolate for every week 0 to totalWeeks
    const result: NormalizedBenchmark[] = [];

    for (let t = 0; t <= totalWeeks; t++) {
        const month = t / 4.33;

        // Find surrounding points
        const p1 = data.find(d => d.month <= month && (data.indexOf(d) === data.length - 1 || data[data.indexOf(d) + 1].month > month));

        if (!p1) continue; // Should not happen if t starts at 0

        const nextIdx = data.indexOf(p1) + 1;
        const p2 = nextIdx < data.length ? data[nextIdx] : p1;

        // Linear Interpolation
        let ratio = 0;
        if (p2.month > p1.month) {
            ratio = (month - p1.month) / (p2.month - p1.month);
        }

        const priceRaw = p1.price + (p2.price - p1.price) * ratio;
        const nodesRaw = p1.nodes + (p2.nodes - p1.nodes) * ratio;

        result.push({
            t,
            benchmarkPrice: priceRaw * priceScale,
            benchmarkNodes: nodesRaw * nodeScale
        });
    }

    return result;
}
