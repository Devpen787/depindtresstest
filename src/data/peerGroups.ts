export interface PeerGroup {
    id: string;
    name: string;
    description: string;
    inclusionCriteria: string[];
    members: string[]; // Protocol IDs
}

export const PEER_GROUPS: PeerGroup[] = [
    {
        id: 'location_wireless',
        name: 'Wireless & Location',
        description: 'Physical networks for coverage (Wireless/GNSS) and mapping.',
        inclusionCriteria: [
            'Target: Location-based utility',
            'Hardware: Custom sensors/radios',
            'Model: Burn-and-Mint Equilibrium'
        ],
        members: [
            'ono_v3_calibrated', // Primary
            'geodnet_v1',        // GNSS
            'helium_bme_v1',     // Wireless
            'xnet_v1',           // Wireless (Mobile)
            'hivemapper_v1',     // Mapping
            'dimo_v1'            // Vehicle
        ]
    },
    {
        id: 'compute_ai',
        name: 'Compute & AI',
        description: 'Decentralized compute resources for AI training, inference, and cloud services.',
        inclusionCriteria: [
            'Target: Fungible compute/storage',
            'Hardware: GPUs/CPUs',
            'Model: Marketplace or Work Rewards'
        ],
        members: [
            'adaptive_elastic_v1', // Render
            'ionet_v1',            // io.net
            'nosana_v1',           // Nosana
            'grass_v1',            // Grass
            'aleph_v1',            // Aleph.im
            'akash_v1'             // Akash
        ]
    }
];

export const BENCHMARK_PEERS = {
    primary: 'ono_v3_calibrated',
    competitor: 'geodnet_v1'
};
