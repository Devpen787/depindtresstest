import { createPassThroughModule, type ProtocolSimulationModule } from './core/types';
import { onocoySimulationModule } from './onocoy';

const DEFAULT_MODULE = createPassThroughModule<unknown, unknown>('default', 'Default');

const REGISTERED_MODULES = [
    onocoySimulationModule
] as const;

export function listProtocolModules() {
    return [...REGISTERED_MODULES];
}

export function getProtocolModule<TParams, TAggregate>(
    protocolId?: string
): ProtocolSimulationModule<TParams, TAggregate> {
    if (!protocolId) {
        return DEFAULT_MODULE as ProtocolSimulationModule<TParams, TAggregate>;
    }

    const normalizedProtocolId = protocolId.trim().toLowerCase();
    const matched = REGISTERED_MODULES.find((module) => {
        if (module.matchesProtocol) return module.matchesProtocol(normalizedProtocolId);
        return module.id.toLowerCase() === normalizedProtocolId;
    });

    if (!matched) {
        return DEFAULT_MODULE as ProtocolSimulationModule<TParams, TAggregate>;
    }

    return matched as unknown as ProtocolSimulationModule<TParams, TAggregate>;
}
