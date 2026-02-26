import type { DTSEPeerAnalog } from '../types/dtse';

/**
 * Curated static peer analog mapping for DTSE cross-protocol comparison.
 * Config-driven and deterministic — no runtime API calls.
 *
 * Keys use canonical protocol IDs from protocolProfiles.generated.ts.
 */
export const DTSE_PEER_ANALOGS: Record<string, DTSEPeerAnalog> = {
    ono_v3_calibrated: {
        protocol_id: 'ono_v3_calibrated',
        peer_ids: ['geodnet_v1', 'helium_bme_v1'],
        rationale: 'GNSS/positioning DePIN networks with comparable location-based proof-of-coverage economics.',
        confidence: 'high',
    },
    helium_bme_v1: {
        protocol_id: 'helium_bme_v1',
        peer_ids: ['ono_v3_calibrated', 'geodnet_v1', 'xnet_v1'],
        rationale: 'IoT/connectivity DePIN with location-based coverage incentives and burn-and-mint equilibrium.',
        confidence: 'high',
    },
    adaptive_elastic_v1: {
        protocol_id: 'adaptive_elastic_v1',
        peer_ids: ['akash_v1', 'ionet_v1', 'nosana_v1'],
        rationale: 'Decentralized compute/GPU networks competing for fungible resource workloads.',
        confidence: 'medium',
    },
    filecoin_v1: {
        protocol_id: 'filecoin_v1',
        peer_ids: ['aleph_v1'],
        rationale: 'Decentralized storage networks with long-term data persistence guarantees and staking collateral.',
        confidence: 'high',
    },
    akash_v1: {
        protocol_id: 'akash_v1',
        peer_ids: ['adaptive_elastic_v1', 'ionet_v1', 'nosana_v1'],
        rationale: 'Decentralized cloud compute marketplace with fungible resource pricing.',
        confidence: 'medium',
    },
    hivemapper_v1: {
        protocol_id: 'hivemapper_v1',
        peer_ids: ['dimo_v1', 'grass_v1'],
        rationale: 'Sensor-data DePIN with map-to-earn model; peers share data-collection-for-rewards structure.',
        confidence: 'medium',
    },
    dimo_v1: {
        protocol_id: 'dimo_v1',
        peer_ids: ['hivemapper_v1', 'helium_bme_v1'],
        rationale: 'Hardware-dependent data collection networks with consumer device onboarding and marketplace dynamics.',
        confidence: 'medium',
    },
    grass_v1: {
        protocol_id: 'grass_v1',
        peer_ids: ['hivemapper_v1', 'dimo_v1'],
        rationale: 'Passive resource sharing networks with very low switching cost and AI/data-driven demand.',
        confidence: 'low',
    },
    ionet_v1: {
        protocol_id: 'ionet_v1',
        peer_ids: ['adaptive_elastic_v1', 'akash_v1', 'nosana_v1'],
        rationale: 'Decentralized GPU marketplace peers competing in the same AI inference compute market.',
        confidence: 'medium',
    },
    nosana_v1: {
        protocol_id: 'nosana_v1',
        peer_ids: ['ionet_v1', 'akash_v1', 'adaptive_elastic_v1'],
        rationale: 'Solana-native GPU grid competing for CI/CD and AI inference workloads.',
        confidence: 'medium',
    },
    geodnet_v1: {
        protocol_id: 'geodnet_v1',
        peer_ids: ['ono_v3_calibrated', 'helium_bme_v1'],
        rationale: 'GNSS reference station network with overlapping geographic coverage model and token burn.',
        confidence: 'high',
    },
    aleph_v1: {
        protocol_id: 'aleph_v1',
        peer_ids: ['filecoin_v1', 'akash_v1'],
        rationale: 'Decentralized cloud/storage with staking-based security and utility-sink tokenomics.',
        confidence: 'medium',
    },
    xnet_v1: {
        protocol_id: 'xnet_v1',
        peer_ids: ['helium_bme_v1'],
        rationale: 'Wireless connectivity DePIN competing in mobile network space with burn-based tokenomics.',
        confidence: 'low',
    },
} as const;
