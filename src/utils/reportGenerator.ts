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
    const finalUtilization = last.utilisation?.mean || 0;

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
| **Final Utilization** | — | ${(last.utilisation?.mean || 0).toFixed(1)}% | — |
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
