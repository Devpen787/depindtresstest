import React from 'react';
import {
    Lock, Activity, RefreshCw, BarChart3, Database, Users, Scale, DollarSign, TrendingDown, Clock
} from 'lucide-react';
import { ProtocolProfileV1 } from '../../data/protocols';
import { LegacyAggregateResult as AggregateResult, LegacySimulationParams as SimulationParams } from '../../model/legacy/engine';
import { TokenMarketData } from '../../services/coingecko';
import { calculateRegime } from '../../utils/regime';
import { formatCompact } from '../../utils/format';
import MetricEvidenceBadge from '../ui/MetricEvidenceBadge';
import { getMetricEvidence } from '../../data/metricEvidence';
import {
    OWNER_KPI_BAND_CLASSIFIERS,
    OWNER_KPI_THRESHOLD_VALUES,
    calculateOwnerRetentionPct
} from '../../audit/kpiOwnerMath';
import { GUARDRAIL_BAND_LABELS, type GuardrailBand } from '../../constants/guardrails';
// import MetricEvidenceLegend from '../ui/MetricEvidenceLegend';

interface ComparisonViewProps {
    selectedProtocolIds: string[];
    setSelectedProtocolIds: (ids: string[]) => void;
    profiles: ProtocolProfileV1[];
    multiAggregated: Record<string, AggregateResult[]>;
    liveData: Record<string, TokenMarketData | null>;
    liveDataLoading: boolean;
    fetchLiveData: () => void;
    params: SimulationParams;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
    selectedProtocolIds,
    setSelectedProtocolIds,
    profiles,
    multiAggregated,
    liveData,
    liveDataLoading,
    fetchLiveData,
    params
}) => {
    const bandTextClass: Record<GuardrailBand, string> = {
        healthy: 'text-emerald-400',
        watchlist: 'text-amber-400',
        intervention: 'text-rose-400'
    };

    const classifyUtilizationBand = (utilizationPct: number): GuardrailBand => {
        if (utilizationPct < OWNER_KPI_THRESHOLD_VALUES.utilizationWatchlistMinPct) return 'intervention';
        if (utilizationPct < OWNER_KPI_THRESHOLD_VALUES.utilizationHealthyMinPct) return 'watchlist';
        return 'healthy';
    };

    const protocolMetrics = profiles
        .filter(p => selectedProtocolIds.includes(p.metadata.id))
        .map(p => {
            const data = multiAggregated[p.metadata.id] || [];
            const last = data[data.length - 1];
            const first = data[0];
            const live = liveData[p.metadata.id];

            // Price & Token metrics
            const livePrice = live?.currentPrice || 0;
            const defaultPrice = livePrice > 0 ? livePrice : params.initialPrice;
            const finalPrice = last?.price?.mean || defaultPrice;
            const initialPrice = first?.price?.mean || defaultPrice;
            const priceChange = initialPrice > 0 ? ((finalPrice - initialPrice) / initialPrice) * 100 : 0;

            // Calculate max drawdown
            let peak = initialPrice;
            let maxDrawdown = 0;
            data.forEach(d => {
                const price = d?.price?.mean || 0;
                if (price > peak) peak = price;
                const dd = peak > 0 ? ((peak - price) / peak) * 100 : 0;
                if (dd > maxDrawdown) maxDrawdown = dd;
            });

            // Supply & Inflation
            const defaultSupply = p.parameters?.supply?.value || 100_000_000;
            const finalSupply = last?.supply?.mean || defaultSupply;
            const initialSupply = first?.supply?.mean || defaultSupply;
            const supplyChange = initialSupply > 0 ? ((finalSupply - initialSupply) / initialSupply) * 100 : 0;
            const annualisedInflation = data.length > 0 ? supplyChange * (52 / data.length) : 0;

            // Net emissions
            const totalMinted = data.reduce((sum, d) => sum + (d?.minted?.mean || 0), 0);
            const totalBurned = data.reduce((sum, d) => sum + (d?.burned?.mean || 0), 0);
            const netEmissions = totalMinted - totalBurned;

            // Provider metrics
            const finalProviders = last?.providers?.mean || 30;
            const initialProviders = first?.providers?.mean || 30;
            const providerGrowth = initialProviders > 0 ? ((finalProviders - initialProviders) / initialProviders) * 100 : 0;
            const totalChurn = data.reduce((sum, d) => sum + (d?.churnCount?.mean || 0), 0);
            const totalJoins = data.reduce((sum, d) => sum + (d?.joinCount?.mean || 0), 0);
            const churnRate = totalJoins > 0 ? (totalChurn / totalJoins) * 100 : 0;

            // Utilisation
            const avgUtilisation = data.length > 0
                ? data.reduce((sum, d) => sum + (d?.utilization?.mean || 0), 0) / data.length
                : 0;

            // Unit Economics
            const weeklyOpEx = p.parameters?.provider_economics?.opex_weekly?.value || 26;
            const avgWeeklyReward = data.length > 0 && finalProviders > 0
                ? (totalMinted / data.length) / finalProviders
                : 0;
            const avgRewardValue = avgWeeklyReward * finalPrice;
            const weeklyProfit = avgRewardValue - weeklyOpEx;
            const monthlyEarnings = weeklyProfit * 4.33;
            const hardwareCost = p.metadata.id === 'ono_v3_calibrated' ? 650 :
                p.metadata.id === 'helium_bme_v1' ? 500 :
                    p.metadata.id === 'hivemapper_map_v1' ? 549 :
                        p.metadata.id === 'dimo_vehicle_v1' ? 350 : 1000;
            const paybackWeeks = weeklyProfit > 0 ? hardwareCost / weeklyProfit : Infinity;
            const breakEvenPrice = avgWeeklyReward > 0 ? weeklyOpEx / avgWeeklyReward : 0;

            // Risk metrics
            const regime = calculateRegime(data, p);
            const deathSpiralRisk = maxDrawdown > 80 ? 'HIGH' : maxDrawdown > 50 ? 'MEDIUM' : 'LOW';

            // Sustainability ratio (real revenue vs emissions)
            const totalRevenue = data.reduce((sum, d) => {
                // Support both legacy and new aggregate schemas.
                const served = (d as any)?.demandServed?.mean ?? d?.demand_served?.mean ?? 0;
                const svcPrice = d?.servicePrice?.mean || 0;
                return sum + (served * svcPrice);
            }, 0);
            const emissionValue = totalMinted * finalPrice;
            const sustainabilityRatio = emissionValue > 0 ? (totalRevenue / emissionValue) * 100 : 0;
            const paybackMonths = paybackWeeks / 4.33;
            const retentionPct = calculateOwnerRetentionPct(100 - churnRate);
            const solvencyRatio = last?.solvencyScore?.mean || 0;

            return {
                protocol: p,
                live,
                regime,
                finalPrice,
                priceChange,
                annualisedInflation,
                maxDrawdown,
                finalProviders,
                providerGrowth,
                avgUtilisation,
                churnRate,
                netEmissions,
                hardwareCost,
                monthlyEarnings,
                paybackWeeks,
                breakEvenPrice,
                weeklyProfit,
                deathSpiralRisk,
                sustainabilityRatio,
                finalSupply,
                paybackMonths,
                retentionPct,
                solvencyRatio
            };
        });

    const baseline = protocolMetrics[0];

    const MetricRow = ({
        icon,
        iconColor,
        label,
        getValue,
        format,
        goodDirection,
        getDelta,
        formatDelta,
        getBand,
        hint,
        metricEvidenceId
    }: {
        icon: React.ReactNode;
        iconColor: string;
        label: string;
        getValue: (m: typeof protocolMetrics[0]) => number;
        format: (v: number) => string;
        goodDirection: 'up' | 'down' | 'neutral';
        getDelta?: (m: typeof protocolMetrics[0], baseline: typeof protocolMetrics[0]) => number | null;
        formatDelta?: (delta: number) => string;
        getBand?: (m: typeof protocolMetrics[0]) => GuardrailBand | null;
        hint?: string;
        metricEvidenceId?: string;
    }) => {
        // 1. Calculate Min/Max for Heatmap
        const allValues = protocolMetrics.map(getValue);
        const validValues = allValues.filter(v => isFinite(v) && !isNaN(v));
        const min = validValues.length > 0 ? Math.min(...validValues) : 0;
        const max = validValues.length > 0 ? Math.max(...validValues) : 0;
        const range = max - min;

        return (
            <tr className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors group">
                <td className="p-3 text-[10px] font-bold text-slate-400 bg-slate-950/30 sticky left-0 z-10 w-[200px]">
                    <div className="flex items-center gap-2">
                        <span className={iconColor}>{icon}</span>
                        <span>{label}</span>
                        <MetricEvidenceBadge evidence={metricEvidenceId ? getMetricEvidence(metricEvidenceId) : undefined} variant="icon" />
                        {hint && (
                            <span className="opacity-0 group-hover:opacity-100 text-[8px] text-slate-600 transition-opacity">
                                {hint}
                            </span>
                        )}
                    </div>
                </td>
                {protocolMetrics.map((m, idx) => {
                    const value = getValue(m);
                    const delta = getDelta && idx > 0 && baseline ? getDelta(m, baseline) : null;
                    const band = getBand ? getBand(m) : null;
                    const hasDelta = delta !== null && Number.isFinite(delta);

                    // Heatmap Logic
                    let bgStyle = {};
                    if (goodDirection !== 'neutral' && range > 0 && isFinite(value)) {
                        let normalized = (value - min) / range;
                        if (goodDirection === 'down') normalized = 1 - normalized;
                        const opacity = 0.05 + (normalized * 0.15); // Base 5% + up to 15%
                        const color = normalized > 0.5 ? '16, 185, 129' : '244, 63, 94'; // Emerald vs Rose
                        let strength = Math.abs(normalized - 0.5) * 2;
                        bgStyle = {
                            backgroundColor: `rgba(${color}, ${strength * 0.2})`
                        };
                    }

                    const valueClass = band
                        ? bandTextClass[band]
                        : goodDirection === 'neutral' || !hasDelta
                            ? 'text-white'
                            : goodDirection === 'up'
                                ? (delta! >= 0 ? 'text-emerald-400' : 'text-rose-400')
                                : (delta! <= 0 ? 'text-emerald-400' : 'text-rose-400');

                    const deltaClass = !hasDelta
                        ? 'text-slate-500'
                        : goodDirection === 'up'
                            ? (delta! >= 0 ? 'text-emerald-400' : 'text-rose-400')
                            : goodDirection === 'down'
                                ? (delta! <= 0 ? 'text-emerald-400' : 'text-rose-400')
                                : 'text-slate-500';

                    return (
                        <td key={m.protocol.metadata.id} className="p-3 text-center transition-colors" style={bgStyle}>
                            <div className={`text-sm font-mono font-bold ${valueClass}`}>
                                {format(value)}
                            </div>
                            {hasDelta && (
                                <div className={`text-[9px] mt-0.5 font-bold ${deltaClass}`}>
                                    {formatDelta ? formatDelta(delta!) : `${delta! >= 0 ? '+' : ''}${delta!.toFixed(1)}%`}
                                </div>
                            )}
                        </td>
                    );
                })}
            </tr>
        );
    };

    const SectionHeader = ({ icon, iconColor, title, hint }: { icon: React.ReactNode; iconColor: string; title: string; hint: string }) => (
        <tr className="bg-slate-950/80">
            <td colSpan={protocolMetrics.length + 1} className="p-3">
                <div className="flex items-center gap-2">
                    <span className={iconColor}>{icon}</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{title}</span>
                    <span className="text-[9px] text-slate-500 ml-2">{hint}</span>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl"><Lock size={18} /></div>
                    <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Comparative Control Method</h3>
                        <p className="text-[10px] text-slate-500 font-medium italic">Locked stress parameters for structural comparability across all archetypes.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-bold">{selectedProtocolIds.length} of {profiles.length} selected</span>
                    <button
                        onClick={() => setSelectedProtocolIds(profiles.map(p => p.metadata.id))}
                        className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 text-[10px] font-bold rounded-lg hover:bg-indigo-600/30 transition-colors"
                    >
                        Select All
                    </button>
                </div>
            </div>

            {Object.keys(liveData).length > 0 && (
                <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Activity size={16} className="text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider">Live Market Data</h3>
                                <p className="text-[9px] text-emerald-400/70">
                                    From CoinGecko • Updated
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={fetchLiveData}
                            disabled={liveDataLoading}
                            className="text-[9px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                            <RefreshCw size={12} className={liveDataLoading ? 'animate-spin' : ''} /> Refresh
                        </button>
                    </div>
                </div>
            )}

            {/* Legend Removed per Simplification Plan */}

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BarChart3 size={16} className="text-indigo-400" />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">DePIN Protocol Scorecard</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[9px]">
                            <span className="text-emerald-400">● {GUARDRAIL_BAND_LABELS.healthy}</span>
                            <span className="text-amber-400">● {GUARDRAIL_BAND_LABELS.watchlist}</span>
                            <span className="text-rose-400">● {GUARDRAIL_BAND_LABELS.intervention}</span>
                        </div>
                        <div className="text-[9px] text-slate-500">
                            Baseline: <span className="text-indigo-400 font-bold">{baseline?.protocol.metadata.name}</span>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-950 text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-3 text-left sticky left-0 z-20 bg-slate-950 w-[200px]">Metric</th>
                                {protocolMetrics.map(m => (
                                    <th key={m.protocol.metadata.id} className="p-3 text-center min-w-[140px]">
                                        <div className="text-white mb-1">{m.protocol.metadata.name}</div>
                                        <div className={`px-2 py-0.5 rounded-full inline-block text-[8px] bg-${m.regime.color}-500/10 text-${m.regime.color}-400 border border-${m.regime.color}-500/20`}>
                                            {m.regime.id.split(' ')[0]}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* SECTION: TOKENOMICS */}
                            <SectionHeader icon={<Database size={12} />} iconColor="text-violet-400" title="Tokenomics" hint="Supply & Price dynamics" />
                            <MetricRow label="Token Price (End)" icon={<DollarSign size={12} />} iconColor="text-slate-400" getValue={m => m.finalPrice} format={v => `$${formatCompact(v)}`} goodDirection="up" getDelta={(m, b) => ((m.finalPrice - b.finalPrice) / b.finalPrice) * 100} metricEvidenceId="comp_token_price_end" />
                            <MetricRow label="Inflation (APY)" icon={<Activity size={12} />} iconColor="text-slate-400" getValue={m => m.annualisedInflation} format={v => `${v.toFixed(1)}%`} goodDirection="down" getDelta={(m, b) => m.annualisedInflation - b.annualisedInflation} metricEvidenceId="comp_inflation_apy" />
                            <MetricRow label="Max Drawdown" icon={<TrendingDown size={12} />} iconColor="text-rose-400" getValue={m => m.maxDrawdown} format={v => `${v.toFixed(1)}%`} goodDirection="down" hint="Worst peak-to-trough drop" metricEvidenceId="comp_max_drawdown" />

                            {/* SECTION: NETWORK GROWTH */}
                            <SectionHeader icon={<Users size={12} />} iconColor="text-emerald-400" title="Network Growth" hint="Physical/Digital Infrastructure" />
                            <MetricRow label="Active Nodes (End)" icon={<Users size={12} />} iconColor="text-slate-400" getValue={m => m.finalProviders} format={formatCompact} goodDirection="up" getDelta={(m, b) => ((m.finalProviders - b.finalProviders) / b.finalProviders) * 100} metricEvidenceId="comp_active_nodes_end" />
                            <MetricRow
                                label="Retention (Derived)"
                                icon={<Activity size={12} />}
                                iconColor="text-slate-400"
                                getValue={m => m.retentionPct}
                                format={v => `${v.toFixed(1)}%`}
                                goodDirection="up"
                                getDelta={(m, b) => m.retentionPct - b.retentionPct}
                                getBand={m => OWNER_KPI_BAND_CLASSIFIERS.retention(m.retentionPct)}
                                metricEvidenceId="comp_churn_rate"
                                hint="Proxy metric = 100 - cumulative churn rate."
                            />
                            <MetricRow
                                label="Utilization"
                                icon={<Activity size={12} />}
                                iconColor="text-slate-400"
                                getValue={m => m.avgUtilisation}
                                format={v => `${v.toFixed(1)}%`}
                                goodDirection="up"
                                getDelta={(m, b) => m.avgUtilisation - b.avgUtilisation}
                                getBand={m => classifyUtilizationBand(m.avgUtilisation)}
                                metricEvidenceId="comp_utilization"
                            />

                            {/* SECTION: UNIT ECONOMICS */}
                            <SectionHeader icon={<Scale size={12} />} iconColor="text-amber-400" title="Miner Economics" hint="Profitability per Node" />
                            <MetricRow label="Monthly Earnings" icon={<DollarSign size={12} />} iconColor="text-slate-400" getValue={m => m.monthlyEarnings} format={v => `$${formatCompact(v)}`} goodDirection="up" getDelta={(m, b) => ((m.monthlyEarnings - b.monthlyEarnings) / b.monthlyEarnings) * 100} metricEvidenceId="comp_monthly_earnings" />
                            <MetricRow
                                label="Payback Period"
                                icon={<Clock size={12} />}
                                iconColor="text-slate-400"
                                getValue={m => m.paybackMonths}
                                format={v => isFinite(v) ? `${v.toFixed(1)} mo` : 'Never'}
                                goodDirection="down"
                                getDelta={(m, b) => m.paybackMonths - b.paybackMonths}
                                formatDelta={(delta) => `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} mo`}
                                getBand={m => OWNER_KPI_BAND_CLASSIFIERS.payback(m.paybackMonths)}
                                metricEvidenceId="comp_payback_period"
                            />

                            {/* SECTION: SUSTAINABILITY */}
                            <SectionHeader icon={<Scale size={12} />} iconColor="text-blue-400" title="Sustainability" hint="Long-term viability" />
                            <MetricRow
                                label="Solvency Ratio"
                                icon={<Scale size={12} />}
                                iconColor="text-slate-400"
                                getValue={m => m.solvencyRatio}
                                format={v => `${v.toFixed(2)}x`}
                                goodDirection="up"
                                getDelta={(m, b) => m.solvencyRatio - b.solvencyRatio}
                                formatDelta={(delta) => `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}x`}
                                getBand={m => OWNER_KPI_BAND_CLASSIFIERS.solvency(m.solvencyRatio)}
                                hint="Owner guardrail: below 1.0x implies incentive burn is outpacing viable economics."
                                metricEvidenceId="solvency_ratio"
                            />
                            <MetricRow
                                label="Real Rev / Emissions"
                                icon={<Scale size={12} />}
                                iconColor="text-slate-400"
                                getValue={m => m.sustainabilityRatio}
                                format={v => `${v.toFixed(1)}%`}
                                goodDirection="up"
                                getDelta={(m, b) => m.sustainabilityRatio - b.sustainabilityRatio}
                                getBand={m => OWNER_KPI_BAND_CLASSIFIERS.solvency(m.sustainabilityRatio / 100)}
                                hint="Protocol Revenue vs Token Incentives (100% = 1.0x break-even)."
                                metricEvidenceId="comp_real_rev_emissions"
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
