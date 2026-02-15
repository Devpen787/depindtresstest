import { LegacyAggregateResult as AggregateResult } from '../model/legacy/engine';
import { ProtocolProfileV1 } from '../data/protocols';

export interface IncentiveRegime {
    id: string;
    regime: string;
    color: 'slate' | 'rose' | 'amber' | 'emerald';
    drivers: string[];
    summary: string;
}

export const calculateRegime = (data: AggregateResult[], profile: ProtocolProfileV1): IncentiveRegime => {
    if (!data || !data.length) return { id: 'INITIALIZING', regime: 'INITIALIZING', color: 'slate', drivers: [], summary: 'N/A' };
    const last = data[data.length - 1];
    if (!last || !last.providers) return { id: 'INITIALIZING', regime: 'INITIALIZING', color: 'slate', drivers: [], summary: 'N/A' };

    const retention = (last.providers?.mean || 30) / 30;
    const burnRatio = (last.burned?.mean || 0) / Math.max(last.minted?.mean || 0, 0.0001);
    const utilization = last.utilization?.mean || (last as any).utilisation?.mean || 0;
    const profit = last.profit?.mean || 0;
    const churnThreshold = profile.parameters.provider_economics.churn_threshold.value;

    if (retention < 0.75 || profit < churnThreshold) {
        return {
            id: 'LOW-INCENTIVE DOMINANT',
            regime: 'LOW-INCENTIVE DOMINANT',
            color: 'rose',
            drivers: ['Provider Count'],
            summary: 'Operational attrition outpaces incentive velocity.'
        };
    }

    if ((burnRatio < 0.1 && utilization < 25) || utilization > 90) {
        const isSaturation = utilization > 90;
        return {
            id: 'HIGH-INCENTIVE DOMINANT',
            regime: 'HIGH-INCENTIVE DOMINANT',
            color: 'amber',
            drivers: isSaturation ? ['Network Utilization (%)', 'Service Pricing Proxy'] : ['Burn vs Emissions', 'Network Utilization (%)'],
            summary: isSaturation ? 'Infrastructure saturation limits scalability.' : 'Speculative issuance outstripping utility.'
        };
    }

    return {
        id: 'EQUILIBRIUM WINDOW',
        regime: 'EQUILIBRIUM WINDOW',
        color: 'emerald',
        drivers: ['Capacity vs Demand'],
        summary: 'Sustainable balance of utility capture and issuance.'
    };
};
