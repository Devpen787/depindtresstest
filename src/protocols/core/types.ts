export interface ProtocolSimulationModule<TParams, TAggregate> {
    id: string;
    displayName: string;
    matchesProtocol?: (protocolId: string) => boolean;
    normalizeParams?: (params: TParams) => TParams;
    postProcessAggregates?: (aggregates: TAggregate[]) => TAggregate[];
}

export const createPassThroughModule = <TParams, TAggregate>(
    id: string,
    displayName: string
): ProtocolSimulationModule<TParams, TAggregate> => ({
    id,
    displayName
});
