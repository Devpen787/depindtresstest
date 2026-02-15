import type {
    LegacyAggregateResult,
    LegacySimulationParams
} from '../../model/legacy/engine';
import type { ProtocolSimulationModule } from '../core/types';
import {
    computeOnocoyReward,
    type OnocoyRewardInputs,
    type OnocoyRewardBreakdown
} from './rewardModel';
import {
    buildOnocoyUnlockCurve,
    type OnocoyUnlockPlan,
    type OnocoyUnlockPoint
} from './unlockFlow';
import {
    deriveOnocoyIntegritySignals,
    type OnocoyIntegritySnapshot,
    type OnocoyIntegritySignals
} from './integritySignals';

const isOnocoyProtocol = (protocolId: string): boolean => {
    const normalized = protocolId.trim().toLowerCase();
    return normalized === 'onocoy' || normalized.startsWith('ono_');
};

/**
 * No-op adapter hook for now.
 * Behavior stays unchanged until protocol-specific math is explicitly enabled.
 */
export const onocoySimulationModule: ProtocolSimulationModule<LegacySimulationParams, LegacyAggregateResult> = {
    id: 'onocoy',
    displayName: 'Onocoy',
    matchesProtocol: isOnocoyProtocol,
    normalizeParams: (params) => params,
    postProcessAggregates: (aggregates) => aggregates
};

export {
    computeOnocoyReward,
    buildOnocoyUnlockCurve,
    deriveOnocoyIntegritySignals
};

export type {
    OnocoyRewardInputs,
    OnocoyRewardBreakdown,
    OnocoyUnlockPlan,
    OnocoyUnlockPoint,
    OnocoyIntegritySnapshot,
    OnocoyIntegritySignals
};
