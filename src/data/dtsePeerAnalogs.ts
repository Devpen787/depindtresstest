import type { DTSEPeerAnalog } from '../types/dtse';

/**
 * Curated static peer analog mapping for DTSE cross-protocol comparison.
 * Config-driven and deterministic — no runtime API calls.
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
        peer_ids: ['ono_v3_calibrated', 'xnet_v1'],
        rationale: 'Wireless coverage networks where utilization and subscriber conversion shape burn sustainability.',
        confidence: 'high',
    },
    adaptive_elastic_v1: {
        protocol_id: 'adaptive_elastic_v1',
        peer_ids: ['ionet_v1', 'nosana_v1', 'akash_v1'],
        rationale: 'Decentralized compute/GPU networks competing for fungible resource workloads.',
        confidence: 'medium',
    },
    filecoin_v1: {
        protocol_id: 'filecoin_v1',
        peer_ids: ['aleph_v1', 'akash_v1'],
        rationale: 'Decentralized storage networks with long-term data persistence guarantees.',
        confidence: 'high',
    },
    akash_v1: {
        protocol_id: 'akash_v1',
        peer_ids: ['adaptive_elastic_v1', 'ionet_v1', 'aleph_v1'],
        rationale: 'Marketplace-style compute supply protocols where pricing pressure impacts provider retention.',
        confidence: 'medium',
    },
    hivemapper_v1: {
        protocol_id: 'hivemapper_v1',
        peer_ids: ['ono_v3_calibrated', 'geodnet_v1', 'dimo_v1'],
        rationale: 'Location-data DePIN with coverage-density economics and enterprise data monetization.',
        confidence: 'high',
    },
    dimo_v1: {
        protocol_id: 'dimo_v1',
        peer_ids: ['hivemapper_v1', 'xnet_v1'],
        rationale: 'Mobility/location-adjacent networks where demand contracts determine monetization reliability.',
        confidence: 'medium',
    },
    grass_v1: {
        protocol_id: 'grass_v1',
        peer_ids: ['ionet_v1', 'nosana_v1', 'adaptive_elastic_v1'],
        rationale: 'High-supply participation networks where retention and quality gating are critical.',
        confidence: 'medium',
    },
    ionet_v1: {
        protocol_id: 'ionet_v1',
        peer_ids: ['adaptive_elastic_v1', 'nosana_v1', 'akash_v1'],
        rationale: 'GPU cloud networks balancing payback periods, utilization, and token-incentive pressure.',
        confidence: 'high',
    },
    nosana_v1: {
        protocol_id: 'nosana_v1',
        peer_ids: ['ionet_v1', 'adaptive_elastic_v1'],
        rationale: 'Solana-native compute ecosystems where transition from mining incentives is a shared risk.',
        confidence: 'medium',
    },
    geodnet_v1: {
        protocol_id: 'geodnet_v1',
        peer_ids: ['ono_v3_calibrated', 'helium_bme_v1'],
        rationale: 'GNSS/location infrastructure networks with strong dependence on coverage quality.',
        confidence: 'high',
    },
    aleph_v1: {
        protocol_id: 'aleph_v1',
        peer_ids: ['filecoin_v1', 'akash_v1', 'adaptive_elastic_v1'],
        rationale: 'Generalized decentralized cloud stacks with utility-sink and utilization balancing challenges.',
        confidence: 'medium',
    },
    xnet_v1: {
        protocol_id: 'xnet_v1',
        peer_ids: ['helium_bme_v1', 'ono_v3_calibrated'],
        rationale: 'Wireless growth-phase networks where subscriber ramp and hardware payback dominate outcomes.',
        confidence: 'medium',
    },
} as const;
