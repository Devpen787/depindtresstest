import type { DTSEPeerAnalog } from '../types/dtse';

/**
 * Curated static peer analog mapping for DTSE cross-protocol comparison.
 * Config-driven and deterministic — no runtime API calls.
 */
export const DTSE_PEER_ANALOGS: Record<string, DTSEPeerAnalog> = {
    onocoy: {
        protocol_id: 'onocoy',
        peer_ids: ['geodnet', 'helium'],
        rationale: 'GNSS/positioning DePIN networks with comparable location-based proof-of-coverage economics.',
        confidence: 'high',
    },
    render: {
        protocol_id: 'render',
        peer_ids: ['akash', 'ionet'],
        rationale: 'Decentralized compute/GPU networks competing for fungible resource workloads.',
        confidence: 'medium',
    },
    filecoin: {
        protocol_id: 'filecoin',
        peer_ids: ['arweave'],
        rationale: 'Decentralized storage networks with long-term data persistence guarantees.',
        confidence: 'high',
    },
    helium: {
        protocol_id: 'helium',
        peer_ids: ['onocoy', 'geodnet'],
        rationale: 'IoT/connectivity DePIN with location-based coverage incentives.',
        confidence: 'high',
    },
    geodnet: {
        protocol_id: 'geodnet',
        peer_ids: ['onocoy', 'helium'],
        rationale: 'GNSS reference station network with overlapping geographic coverage model.',
        confidence: 'high',
    },
    akash: {
        protocol_id: 'akash',
        peer_ids: ['render', 'ionet'],
        rationale: 'Decentralized cloud compute marketplace with fungible resource pricing.',
        confidence: 'medium',
    },
} as const;
