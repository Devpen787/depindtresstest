export interface OnocoyIntegritySnapshot {
    activeStations: number;
    spoofingDetections: number;
    slashingEvents: number;
    latencyBreaches: number;
}

export interface OnocoyIntegritySignals {
    spoofingRatePct: number;
    slashingRatePct: number;
    latencyBreachRatePct: number;
    integrityPressureScore: number;
}

const safePct = (numerator: number, denominator: number): number => {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return 0;
    return (numerator / denominator) * 100;
};

/**
 * Integrity telemetry scaffold.
 * This will consume real platform metrics when available.
 */
export function deriveOnocoyIntegritySignals(snapshot: OnocoyIntegritySnapshot): OnocoyIntegritySignals {
    const spoofingRatePct = safePct(snapshot.spoofingDetections, snapshot.activeStations);
    const slashingRatePct = safePct(snapshot.slashingEvents, snapshot.activeStations);
    const latencyBreachRatePct = safePct(snapshot.latencyBreaches, snapshot.activeStations);

    // Weighted risk proxy in range [0,100].
    const integrityPressureScore = Math.min(
        100,
        (spoofingRatePct * 0.5) + (slashingRatePct * 0.3) + (latencyBreachRatePct * 0.2)
    );

    return {
        spoofingRatePct,
        slashingRatePct,
        latencyBreachRatePct,
        integrityPressureScore
    };
}
