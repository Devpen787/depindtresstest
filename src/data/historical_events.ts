export interface HistoricalDataPoint {
    week: number;
    price: number;
    activeNodes: number;
    revenue: number; // Weekly revenue
    burnToMint: number;
}

export interface HistoricalEvent {
    id: string;
    protocolId: string;
    name: string;
    timeRange: string;
    description: string;
    data: HistoricalDataPoint[];
}

const seededNoise = (seed: number, index: number, amplitude: number): number => {
    const x = Math.sin((seed * 9301 + index * 49297) % 233280) * 10000;
    const normalized = x - Math.floor(x); // 0..1
    return (normalized - 0.5) * amplitude;
};

// Helper to generate interpolated data for smoother charts
const generateCurve = (
    start: number,
    end: number,
    weeks: number,
    curveType: 'linear' | 'exponential_decay' | 'exponential_growth' | 'volatile',
    seed: number = 1
): number[] => {
    const points: number[] = [];
    for (let i = 0; i < weeks; i++) {
        const t = i / (weeks - 1);
        let val = 0;
        if (curveType === 'linear') {
            val = start + (end - start) * t;
        } else if (curveType === 'exponential_decay') {
            val = start * Math.pow(end / start, t);
        } else if (curveType === 'exponential_growth') {
            val = start * Math.pow(end / start, t);
        } else if (curveType === 'volatile') {
            // Seeded noise for deterministic, reproducible backtest overlays.
            const trend = start + (end - start) * t;
            const noise = seededNoise(seed, i, start * 0.1);
            val = trend + noise;
        }
        points.push(val);
    }
    return points;
};

// --- DATASETS ---

// Helium 2022: The "Liquidity Shock"
// Context: HNT dropped from ~$50 to ~$2. Nodes stayed largely online (sticky).
const heliumWeeks = 52;
const hntPrice = generateCurve(45, 2, heliumWeeks, 'exponential_decay');
const hntNodes = generateCurve(850000, 950000, heliumWeeks, 'linear'); // Slow growth/plateau
const hntRev = generateCurve(100000, 20000, heliumWeeks, 'exponential_decay'); // Revenue dipped with activity

const heliumDataset: HistoricalDataPoint[] = Array.from({ length: heliumWeeks }).map((_, i) => ({
    week: i,
    price: hntPrice[i],
    activeNodes: hntNodes[i],
    revenue: hntRev[i],
    burnToMint: hntRev[i] / (625000 * hntPrice[i]) // Approx emissions ~625k/week
}));


// Geodnet 2024: "Competitive Consistency"
// Context: Stable growth, high B2B revenue focus.
const geodWeeks = 52;
const geodPrice = generateCurve(0.15, 0.30, geodWeeks, 'linear'); // Healthy growth
const geodNodes = generateCurve(5000, 9500, geodWeeks, 'linear');
const geodRev = generateCurve(5000, 15000, geodWeeks, 'exponential_growth');

const geodDataset: HistoricalDataPoint[] = Array.from({ length: geodWeeks }).map((_, i) => ({
    week: i,
    price: geodPrice[i],
    activeNodes: geodNodes[i],
    revenue: geodRev[i],
    burnToMint: geodRev[i] / (2500000 * geodPrice[i]) // Emissions ~2.5M/week
}));


// Hivemapper 2024: "Operational Resilience"
// Context: Price volatile/down, Contributors +100% (Linear Growth).
const hmWeeks = 52;
const hmPrice = generateCurve(0.25, 0.09, hmWeeks, 'volatile', 2024); // ~60% drop with volatility
const hmNodes = generateCurve(30000, 60000, hmWeeks, 'linear'); // Doubled contributors
const hmRev = generateCurve(50000, 150000, hmWeeks, 'exponential_growth'); // Revenue grew with partnerships

const hmDataset: HistoricalDataPoint[] = Array.from({ length: hmWeeks }).map((_, i) => ({
    week: i,
    price: hmPrice[i],
    activeNodes: hmNodes[i],
    revenue: hmRev[i],
    burnToMint: hmRev[i] / (3000000 * hmPrice[i]) // Emissions ~3M/week
}));

// Render 2022: "Utility Decoupling"
// Context: Price -90%, Frames Rendered +75% (Stable/Growth).
const renderWeeks = 52;
const rndrPrice = generateCurve(4.76, 0.40, renderWeeks, 'exponential_decay'); // ~90% drop
const rndrNodes = generateCurve(2000, 3500, renderWeeks, 'linear'); // Steady growth despite crash
const rndrRev = generateCurve(200000, 350000, renderWeeks, 'linear'); // Usage grew

const rndrDataset: HistoricalDataPoint[] = Array.from({ length: renderWeeks }).map((_, i) => ({
    week: i,
    price: rndrPrice[i],
    activeNodes: rndrNodes[i],
    revenue: rndrRev[i],
    burnToMint: rndrRev[i] / (1000000 * rndrPrice[i]) // Emissions ~1M/week
}));


export const HISTORICAL_EVENTS: HistoricalEvent[] = [
    {
        id: 'helium_shock_2022',
        protocolId: 'helium_bme_v1',
        name: 'Helium Crypto Winter (2022)',
        timeRange: 'Jan 2022 - Jan 2023',
        description: 'A classic "Liquidity Shock" event. Token price collapsed 95%, but node retention remained high due to hardware sunk costs.',
        data: heliumDataset
    },
    {
        id: 'geodnet_growth_2024',
        protocolId: 'geodnet_v1',
        name: 'Geodnet Organic Growth (2024)',
        timeRange: 'Jan 2024 - Dec 2024',
        description: 'Example of "Sustainable Growth". Price and revenue correlated, with a focus on B2B utility (RTK) driving burn.',
        data: geodDataset
    },
    {
        id: 'hivemapper_resilience_2024',
        protocolId: 'hivemapper_v1',
        name: 'Hivemapper Operational Resilience (2024)',
        timeRange: 'Jan 2024 - Dec 2024',
        description: 'Price volatility (-60%) did not stop contributor growth (+100%), proving the "Operational" value proposition.',
        data: hmDataset
    },
    {
        id: 'render_decoupling_2022',
        protocolId: 'adaptive_elastic_v1',
        name: 'Render Utility Decoupling (2022)',
        timeRange: 'Jan 2022 - Dec 2022',
        description: 'Significant decoupling where Token Price crashed 91% but Network Utility (Frames Rendered) grew 75%.',
        data: rndrDataset
    }
];
