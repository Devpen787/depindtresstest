export interface OnocoyRewardInputs {
    baseRewardTokens: number;
    locationScale: number;
    qualityScale: number;
    availabilityScale: number;
}

export interface OnocoyRewardBreakdown {
    rewardTokens: number;
    locationScale: number;
    qualityScale: number;
    availabilityScale: number;
}

const clampScale = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Protocol-specific reward hook scaffold.
 * This keeps Onocoy math isolated from the global model while we wire real telemetry.
 */
export function computeOnocoyReward(inputs: OnocoyRewardInputs): OnocoyRewardBreakdown {
    const locationScale = clampScale(inputs.locationScale);
    const qualityScale = clampScale(inputs.qualityScale);
    const availabilityScale = clampScale(inputs.availabilityScale);
    const rewardTokens = inputs.baseRewardTokens * locationScale * qualityScale * availabilityScale;

    return {
        rewardTokens,
        locationScale,
        qualityScale,
        availabilityScale
    };
}
