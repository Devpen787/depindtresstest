/**
 * Diagnostic archetype selection keys mapped to simulation protocol ids.
 * Keep this map aligned with AuditDashboard preset option values.
 */
export const DIAGNOSTIC_ARCHETYPE_TO_PROTOCOL_ID: Record<string, string> = {
    onocoy: 'ono_v3_calibrated',
    render: 'adaptive_elastic_v1',
    ionet: 'ionet_v1',
    nosana: 'nosana_v1',
    geodnet: 'geodnet_v1',
    hivemapper: 'hivemapper_v1',
    dimo: 'dimo_v1',
    grass: 'grass_v1',
    helium_mobile: 'helium_bme_v1',
    helium_legacy: 'helium_bme_v1'
};

export const resolveDiagnosticProtocolId = (archetypeId: string): string => {
    return DIAGNOSTIC_ARCHETYPE_TO_PROTOCOL_ID[archetypeId] || archetypeId;
};
