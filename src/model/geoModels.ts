/**
 * DePIN Stress Test - Geospatial Modeling
 * 
 * Simulates geographic distribution of nodes to calculate "Saturation Penalty".
 * Instead of full H3 indexing (too heavy for browser sim), we use a "Region Bucket" model.
 */

export interface RegionBucket {
    id: string;
    tier: 'Urban Core' | 'Suburban' | 'Rural';
    capacity: number; // Max optimal nodes before saturation
    currentNodes: number;
    density: number; // current / capacity
    efficiency: number; // 0.0 to 1.0 (Reward Multiplier)
}

/**
 * Configure default regions for a simulation
 */
export function initializeRegions(totalNodes: number, profileType: 'urban' | 'rural' | 'balanced'): RegionBucket[] {
    // 5 Representative Regions
    const regions: RegionBucket[] = [
        { id: 'nyc_core', tier: 'Urban Core', capacity: 500, currentNodes: 0, density: 0, efficiency: 1 },
        { id: 'london_metro', tier: 'Urban Core', capacity: 400, currentNodes: 0, density: 0, efficiency: 1 },
        { id: 'sf_bay', tier: 'Suburban', capacity: 800, currentNodes: 0, density: 0, efficiency: 1 },
        { id: 'middle_america', tier: 'Rural', capacity: 5000, currentNodes: 0, density: 0, efficiency: 1 },
        { id: 'developing_market', tier: 'Rural', capacity: 10000, currentNodes: 0, density: 0, efficiency: 1 },
    ];

    // Distribute Total Nodes based on Profile
    // "Urban" profile -> 80% in top tiers
    // "Rural" profile -> 80% in bottom tiers
    let weights = [0.2, 0.2, 0.2, 0.2, 0.2];

    if (profileType === 'urban') {
        weights = [0.35, 0.30, 0.20, 0.10, 0.05];
    } else if (profileType === 'rural') {
        weights = [0.05, 0.05, 0.10, 0.40, 0.40];
    }

    // Assign nodes
    let nodesAssigned = 0;
    regions.forEach((r, i) => {
        // Stochastic fuzzing could be added here
        const share = weights[i];
        const count = Math.floor(totalNodes * share);
        r.currentNodes = count;
        nodesAssigned += count;
    });

    // Dump remainder in largest bucket
    regions[regions.length - 1].currentNodes += (totalNodes - nodesAssigned);

    // Calculate Metrics
    return calculateRegionMetrics(regions);
}

/**
 * Recalculate Density and Efficiency for all regions
 */
export function calculateRegionMetrics(regions: RegionBucket[]): RegionBucket[] {
    return regions.map(r => {
        const density = r.currentNodes / Math.max(1, r.capacity);

        // Saturation Curve:
        // Density < 1.0 -> Efficiency = 1.0
        // Density > 1.0 -> Efficiency decays
        // Formula: 1 / (1 + (Density - 1)^2) for aggressive decay
        let efficiency = 1.0;
        if (density > 1.0) {
            efficiency = 1.0 / (1.0 + Math.pow(density - 1, 1.5));
        }

        return {
            ...r,
            density,
            efficiency
        };
    });
}
