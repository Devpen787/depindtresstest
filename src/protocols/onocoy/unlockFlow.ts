export interface OnocoyUnlockPlan {
    cliffWeek: number;
    cliffTokens: number;
    streamStartWeek: number;
    streamWeeks: number;
    streamTokensTotal: number;
}

export interface OnocoyUnlockPoint {
    week: number;
    unlockedTokens: number;
    cumulativeUnlockedTokens: number;
    phase: 'cliff' | 'stream';
}

/**
 * Unlock-curve scaffold for BONO -> ONO style staged releases.
 * The final schedule should be fed by primary source contract or official export data.
 */
export function buildOnocoyUnlockCurve(plan: OnocoyUnlockPlan): OnocoyUnlockPoint[] {
    const points: OnocoyUnlockPoint[] = [];

    let cumulativeUnlockedTokens = 0;
    cumulativeUnlockedTokens += Math.max(0, plan.cliffTokens);
    points.push({
        week: plan.cliffWeek,
        unlockedTokens: Math.max(0, plan.cliffTokens),
        cumulativeUnlockedTokens,
        phase: 'cliff'
    });

    const streamWeeks = Math.max(0, Math.floor(plan.streamWeeks));
    if (streamWeeks === 0) return points;

    const streamPerWeek = Math.max(0, plan.streamTokensTotal) / streamWeeks;
    for (let offset = 0; offset < streamWeeks; offset += 1) {
        const week = plan.streamStartWeek + offset;
        cumulativeUnlockedTokens += streamPerWeek;
        points.push({
            week,
            unlockedTokens: streamPerWeek,
            cumulativeUnlockedTokens,
            phase: 'stream'
        });
    }

    return points;
}
