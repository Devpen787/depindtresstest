/**
 * DePIN Stress Test - Investment Memo Generator
 * 
 * Generates professional markdown investment memos from simulation results.
 */

import type { AggregateResult } from '../model/types';
import type { SimulationParams } from '../model/types';
import type { ProtocolProfileV1 } from '../data/protocols';

export type Verdict = 'STRONG BUY' | 'CAUTIOUS' | 'HIGH RISK' | 'UNINVESTABLE';

interface VerdictResult {
    verdict: Verdict;
    reason: string;
    color: string;
}

const getUtilizationMean = (point: any): number => {
    return point?.utilization?.mean ?? point?.utilisation?.mean ?? 0;
};

/**
 * Analyze simulation results and generate a verdict
 */
export function generateVerdict(
    results: AggregateResult[],
    params: SimulationParams
): VerdictResult {
    if (!results || results.length === 0) {
        return { verdict: 'UNINVESTABLE', reason: 'No simulation data available', color: 'red' };
    }

    const last = results[results.length - 1];
    const first = results[0];

    // Key metrics
    const priceChange = ((last.price.mean - first.price.mean) / first.price.mean) * 100;
    const providerRetention = (last.providers.mean / first.providers.mean) * 100;
    const solvencyScore = last.solvencyScore?.mean || 0;
    const finalUtilization = getUtilizationMean(last);

    // Verdict Logic
    if (priceChange < -70) {
        return { verdict: 'UNINVESTABLE', reason: 'Price collapsed >70% - network death spiral', color: 'red' };
    }
    if (providerRetention < 30) {
        return { verdict: 'UNINVESTABLE', reason: 'Mass miner exodus (>70% churn)', color: 'red' };
    }
    if (priceChange < -50) {
        return { verdict: 'HIGH RISK', reason: 'Severe volatility (>50% price drop)', color: 'orange' };
    }
    if (solvencyScore < 0.5 && finalUtilization < 20) {
        return { verdict: 'HIGH RISK', reason: 'Inflationary pressure with low utility', color: 'orange' };
    }
    if (priceChange < -20 || providerRetention < 70) {
        return { verdict: 'CAUTIOUS', reason: 'Moderate stress signals detected', color: 'yellow' };
    }

    return { verdict: 'STRONG BUY', reason: 'Resilient under stress conditions', color: 'green' };
}

const formatPercent = (value: number, digits: number = 1) => {
    if (!Number.isFinite(value)) return 'N/A';
    return `${value.toFixed(digits)}%`;
};

const formatMonths = (value: number) => {
    if (!Number.isFinite(value)) return 'Never';
    return `${value.toFixed(1)} mo`;
};

const pickStatus = (value: number, good: number, warn: number) => {
    if (!Number.isFinite(value)) return 'Unknown';
    if (value >= good) return 'Strong';
    if (value >= warn) return 'Mixed';
    return 'Weak';
};

export function generateWrapUpScript(
    profile: ProtocolProfileV1,
    results: AggregateResult[],
    params: SimulationParams,
    scenario: string = 'Baseline'
): string {
    if (!results || results.length === 0) {
        return `## 6. Wrap-Up Script (5-7 min)\n\nNo simulation data available.`;
    }

    const last = results[results.length - 1];
    const first = results[0];
    const priceChange = first.price.mean > 0
        ? ((last.price.mean - first.price.mean) / first.price.mean) * 100
        : 0;
    const retentionPct = first.providers.mean > 0
        ? (last.providers.mean / first.providers.mean) * 100
        : 0;
    const solvency = last.solvencyScore?.mean || 0;
    const utilization = getUtilizationMean(last);
    const providers = last.providers.mean || 0;
    const weeklyReward = providers > 0 ? (last.minted.mean / providers) * (last.price.mean || 0) : 0;
    const weeklyProfit = weeklyReward - params.providerCostPerWeek;
    const paybackMonths = weeklyProfit > 0 ? (params.hardwareCost / weeklyProfit) / 4.33 : Infinity;
    const treasury = last.treasuryBalance?.mean || 0;

    const strengths: string[] = [];
    const risks: string[] = [];
    const actions: string[] = [];
    const nextTests: string[] = [];

    const solvencyStatus = pickStatus(solvency, 1.0, 0.6);
    const retentionStatus = pickStatus(retentionPct, 90, 75);
    const utilizationStatus = pickStatus(utilization, 60, 20);
    const paybackStatus = Number.isFinite(paybackMonths) && paybackMonths <= 12
        ? 'Strong'
        : Number.isFinite(paybackMonths) && paybackMonths <= 24
            ? 'Mixed'
            : 'Weak';

    if (solvency >= 1.0) strengths.push('Burn-to-mint is deflationary (solvency >= 1.0).');
    if (retentionPct >= 90) strengths.push('Provider base is sticky (retention >= 90%).');
    if (utilization >= 60) strengths.push('Demand is keeping pace with supply (utilization >= 60%).');
    if (Number.isFinite(paybackMonths) && paybackMonths <= 12) strengths.push('Payback period is competitive (<= 12 months).');

    if (solvency < 0.8) {
        risks.push('Solvency is below sustainable levels (burn/mint < 0.8).');
        actions.push('Reduce emissions or increase burn until burn/mint >= 1.0.');
        nextTests.push('Run the Subsidy Trap scenario to quantify the solvency floor.');
    }
    if (utilization < 20) {
        risks.push('Utilization is weak (demand is not absorbing supply).');
        actions.push('Pause supply growth and prioritize demand capture or pricing improvements.');
        nextTests.push('Run Aggressive Expansion to stress the demand lag.');
    }
    if (retentionPct < 75) {
        risks.push('Provider churn is high (retention < 75%).');
        actions.push('Improve operator ROI with targeted rewards, lockups, or tiered quality incentives.');
        nextTests.push('Run Vampire Attack to test competitive churn.');
    }
    if (Number.isFinite(paybackMonths) && paybackMonths > 24) {
        risks.push('Payback is too slow (> 24 months).');
        actions.push('Adjust rewards or offset OPEX to bring payback under 18 months.');
    }
    if (priceChange < -50) {
        risks.push('Price drawdown is severe (> 50% decline).');
        actions.push('Build liquidity or treasury buffers and stage unlocks to reduce sell pressure.');
        nextTests.push('Run Liquidity Shock to quantify drawdown resilience.');
    }

    if (params.revenueStrategy === 'reserve' && treasury <= 0) {
        risks.push('Treasury reserves are depleted under the reserve strategy.');
        actions.push('Increase reserve allocation or adjust emissions to rebuild runway.');
    }

    if (strengths.length === 0) strengths.push('No standout strengths in this run; system is balanced but not dominant.');
    if (risks.length === 0) risks.push('No critical red flags detected under this scenario.');
    if (actions.length === 0) actions.push('Maintain current parameters and monitor sensitivity levers.');
    if (nextTests.length === 0) nextTests.push('Re-run with a longer horizon and higher nSims to tighten confidence bands.');

    return `## 6. Wrap-Up Script (5-7 min)

**Opening (20s)**: "We ran ${profile.metadata.name} through a ${params.T}-week ${scenario} stress test to answer one question: does the system survive without breaking operator incentives?"

**Snapshot (30s)**: Solvency: ${solvency.toFixed(2)} (${solvencyStatus}). Payback: ${formatMonths(paybackMonths)} (${paybackStatus}). Retention: ${formatPercent(retentionPct)} (${retentionStatus}). Utilization: ${formatPercent(utilization)} (${utilizationStatus}). Price change: ${formatPercent(priceChange)}.

**What is working (45s)**:
- ${strengths.join('\n- ')}

**What is at risk (60s)**:
- ${risks.join('\n- ')}

**Recommendations (60s)**:
1. ${actions[0]}
2. ${actions[1] || actions[0]}
3. ${actions[2] || actions[0]}

**What to test next (30s)**:
- ${nextTests.join('\n- ')}

**Close (20s)**: "The key story here is solvency and operator ROI. If we fix the weak links above, the model shows a credible path to resilience."
`;
}

/**
 * Generate a full investment memo in Markdown format
 */
export function generateInvestmentMemo(
    profile: ProtocolProfileV1,
    results: AggregateResult[],
    params: SimulationParams,
    scenario: string = 'Baseline'
): string {
    const verdict = generateVerdict(results, params);
    const last = results[results.length - 1];
    const first = results[0];

    const priceChange = ((last.price.mean - first.price.mean) / first.price.mean) * 100;
    const providerRetention = (last.providers.mean / first.providers.mean) * 100;
    const supplyChange = ((last.supply.mean - first.supply.mean) / first.supply.mean) * 100;

    const now = new Date().toISOString().split('T')[0];

    return `# Investment Memo: ${profile.metadata.name}
**Date**: ${now}  
**Scenario**: ${scenario}  
**Duration**: ${params.T} weeks  
**Verdict**: **${verdict.verdict}** — ${verdict.reason}

---

## 1. Executive Summary

The **${profile.metadata.name}** protocol was subjected to a ${params.T}-week simulation under the "${scenario}" stress scenario.

**Key Finding**: ${verdict.verdict === 'STRONG BUY'
            ? 'The network demonstrated resilience, maintaining price stability and provider retention throughout the test period.'
            : verdict.verdict === 'CAUTIOUS'
                ? 'The network showed some vulnerability under stress, but avoided catastrophic failure.'
                : 'The network exhibited significant weakness under stress conditions, raising concerns about long-term viability.'}

---

## 2. Stress Test Performance

| Metric | Start | End | Change |
|--------|-------|-----|--------|
| **Token Price** | $${first.price.mean.toFixed(4)} | $${last.price.mean.toFixed(4)} | ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(1)}% |
| **Provider Count** | ${first.providers.mean.toFixed(0)} | ${last.providers.mean.toFixed(0)} | ${(providerRetention - 100).toFixed(1)}% |
| **Token Supply** | ${(first.supply.mean / 1e6).toFixed(2)}M | ${(last.supply.mean / 1e6).toFixed(2)}M | ${supplyChange > 0 ? '+' : ''}${supplyChange.toFixed(1)}% |
| **Final Utilization** | — | ${getUtilizationMean(last).toFixed(1)}% | — |
| **Solvency Score** | — | ${(last.solvencyScore?.mean || 0).toFixed(2)} | — |

---

## 3. Key Risk Factors

${priceChange < -30 ? `- ⚠️ **Price Volatility**: Significant price decline of ${Math.abs(priceChange).toFixed(1)}% observed.\n` : ''}
${providerRetention < 80 ? `- ⚠️ **Miner Churn**: ${(100 - providerRetention).toFixed(1)}% of providers left the network.\n` : ''}
${supplyChange > 50 ? `- ⚠️ **Inflation Risk**: Token supply increased by ${supplyChange.toFixed(1)}%.\n` : ''}
${(last.solvencyScore?.mean || 1) < 1 ? `- ⚠️ **Solvency Pressure**: Burn rate does not offset emissions (ratio: ${(last.solvencyScore?.mean || 0).toFixed(2)}).\n` : ''}
${priceChange >= -30 && providerRetention >= 80 && supplyChange <= 50 ? '- ✅ No critical risk factors identified.\n' : ''}

---

## 4. Recommendations

${verdict.verdict === 'STRONG BUY' ? `1. **Maintain Current Strategy**: The tokenomics are well-balanced.
2. **Monitor Competitor Yields**: Watch for vampire attack vectors.
3. **Consider Strategic Treasury Allocation**: Build reserves during growth phase.`
            : verdict.verdict === 'CAUTIOUS' ? `1. **Increase Burn Rate**: Consider raising burn percentage to offset inflation.
2. **Improve Utility Capture**: Focus on demand-side metrics.
3. **Evaluate Emission Schedule**: Current rate may be too aggressive.`
                : `1. **Critical Review Required**: Fundamental tokenomics may need redesign.
2. **Reduce Emissions**: Immediately lower weekly minting.
3. **Add Circuit Breakers**: Implement emergency mechanisms for price crashes.`}

---

## 5. Simulation Parameters

| Parameter | Value |
|-----------|-------|
| Initial Price | $${params.initialPrice} |
| Initial Supply | ${(params.initialSupply / 1e6).toFixed(2)}M |
| Weekly Emissions | ${(params.maxMintWeekly / 1e3).toFixed(0)}K tokens |
| Burn Rate | ${(params.burnPct * 100).toFixed(0)}% |
| Initial Liquidity | $${(params.initialLiquidity / 1e3).toFixed(0)}K |
| Provider Cost/Week | $${params.providerCostPerWeek} |

---

${generateWrapUpScript(profile, results, params, scenario)}

---

*Generated by DePIN Stress Test Toolkit*
`;
}

/**
 * Trigger browser download of the memo
 */
export function downloadMemo(content: string, filename: string = 'investment_memo.md'): void {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
