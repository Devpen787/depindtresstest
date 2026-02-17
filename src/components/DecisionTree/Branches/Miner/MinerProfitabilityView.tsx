import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, ReferenceLine, ReferenceArea
} from 'recharts';
import { AggregateResult } from '../../../../model/types';
import { Info, ExternalLink } from 'lucide-react';
import { buildMinerChartData } from '../../../../audit/decisionTreeViewMath';
import { ChartContextHeader } from '../../../ui/ChartContextHeader';
import {
    CHURN_GUARDRAILS,
    GUARDRAIL_COPY,
    PAYBACK_GUARDRAILS
} from '../../../../constants/guardrails';

interface MinerProfitabilityViewProps {
    data: AggregateResult[];
    hardwareCost: number;
    onOpenSandbox: () => void;
}

export const MinerProfitabilityView: React.FC<MinerProfitabilityViewProps> = ({ data, hardwareCost, onOpenSandbox }) => {
    // LOADING STATE
    if (!data || data.length === 0) {
        return (
            <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-slate-900 rounded-xl"></div>
                    <div className="h-32 bg-slate-900 rounded-xl"></div>
                    <div className="h-32 bg-slate-900 rounded-xl"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-72 bg-slate-900 rounded-xl"></div>
                    <div className="h-72 bg-slate-900 rounded-xl"></div>
                </div>
            </div>
        );
    }

    const chartData = React.useMemo(() => {
        try {
            return buildMinerChartData(data, hardwareCost);
        } catch (error) {
            console.error('Error calculating miner metrics', error);
            return [];
        }
    }, [data, hardwareCost]);

    if (chartData.length === 0) return <div className="p-10 text-center text-slate-500">No Miner Data Available</div>;

    const current = chartData[chartData.length - 1];
    const isProfitable = !current.isUnprofitable && current.actualPayback <= PAYBACK_GUARDRAILS.healthyMaxMonths;
    const currentPaybackDisplay = current.isUnprofitable ? '> 10 Yrs' : `${current.actualPayback.toFixed(1)} Mo`;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group cursor-help">
                    <div className="absolute top-4 right-4 text-slate-600 group-hover:text-slate-400 transition-colors">
                        <Info size={16} />
                    </div>
                    <div className="absolute left-6 bottom-full mb-2 w-56 p-3 bg-slate-800 text-xs text-slate-300 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <strong className="text-white block mb-1">Return on Investment (ROI)</strong>
                        Time required for a miner to recover hardware costs at current token prices.
                    </div>

                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Current ROI Period</h3>
                    <div className={`text-4xl font-mono font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {currentPaybackDisplay}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Time to break even at current token price</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Miner Breakeven Progress</h3>
                    <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden mt-2 mb-2">
                        <div
                            className={`h-full ${isProfitable ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, (PAYBACK_GUARDRAILS.watchlistMaxMonths / (current.actualPayback || 120)) * 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 flex justify-between">
                        <span>Hardware Cost: ${hardwareCost}</span>
                        <span>Target: {PAYBACK_GUARDRAILS.excellentMonths}-{PAYBACK_GUARDRAILS.watchlistMaxMonths} Mo</span>
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Metric Status</h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isProfitable ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        <div className={`w-2 h-2 rounded-full ${isProfitable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {isProfitable ? 'Healthy Incentives' : 'ROI Stress'}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {isProfitable
                            ? `Current net weekly miner profit: $${current.profit.toFixed(2)}`
                            : `Current net weekly miner profit is weak: $${current.profit.toFixed(2)}`}
                    </p>
                    <button
                        onClick={onOpenSandbox}
                        className="mt-3 text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                        <ExternalLink size={12} /> Open Sandbox Inputs
                    </button>
                </div>
            </div>

            <ChartContextHeader
                title="How To Read Miner Profitability"
                what="This branch shows if providers can earn back hardware cost fast enough to stay in the network."
                why="Payback is driven by token price, emissions, and active provider count. Longer payback usually leads to higher churn."
                reference={GUARDRAIL_COPY.minerReference}
                nextQuestion="Which lever improves ROI fastest without breaking solvency?"
                actionTrigger={`If payback stays above ${PAYBACK_GUARDRAILS.watchlistMaxMonths} months, treat incentives as stressed and move to intervention design.`}
            />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                        <span>Payback Period Trend</span>
                        <span className="text-xs font-normal text-slate-500">Lower is better</span>
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPayback" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="t" stroke="#64748b" tickFormatter={(val) => `W${val}`} tick={{ fontSize: 12 }} />
                                <YAxis stroke="#64748b" tickFormatter={(val) => `${val}mo`} tick={{ fontSize: 12 }} domain={[0, 120]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                    formatter={(val: number) => [val >= 120 ? '> 10 Years' : `${val.toFixed(1)} Months`, 'Payback']}
                                    labelFormatter={(label) => `Week ${label}`}
                                />
                                <ReferenceLine
                                    y={PAYBACK_GUARDRAILS.excellentMonths}
                                    stroke="#10b981"
                                    strokeDasharray="3 3"
                                    label={{ value: `Strong (${PAYBACK_GUARDRAILS.excellentMonths}m)`, fill: '#10b981', fontSize: 10 }}
                                />
                                <ReferenceLine
                                    y={PAYBACK_GUARDRAILS.watchlistMaxMonths}
                                    stroke="#f59e0b"
                                    strokeDasharray="3 3"
                                    label={{ value: `Watchlist (${PAYBACK_GUARDRAILS.watchlistMaxMonths}m)`, fill: '#f59e0b', fontSize: 10 }}
                                />
                                <Area type="monotone" dataKey="paybackMonths" stroke="#f43f5e" fillOpacity={1} fill="url(#colorPayback)" activeDot={{ r: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                        <span>Cumulative Earnings vs Capex</span>
                        <span className="text-xs font-normal text-slate-500">Intersection = Breakeven</span>
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="t" stroke="#64748b" tickFormatter={(val) => `W${val}`} tick={{ fontSize: 12 }} />
                                <YAxis stroke="#64748b" tickFormatter={(val) => `$${val}`} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                    formatter={(val: number) => [`$${val.toFixed(0)}`, '']}
                                    labelFormatter={(label) => `Week ${label}`}
                                />
                                <ReferenceLine y={hardwareCost} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Capex', fill: '#ef4444' }} />
                                <Line type="monotone" dataKey="cumulativeProfit" name="Earnings" stroke="#3b82f6" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-white font-bold mb-4">Active Provider Count</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="t" stroke="#64748b" tickFormatter={(val) => `W${val}`} />
                            <YAxis stroke="#64748b" />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                            <Area type="monotone" dataKey="providers" name="Active Providers" stroke="#8b5cf6" fill="url(#colorRetention)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                    <span>Miner Churn Rate</span>
                    <span className="text-xs font-normal text-slate-500">
                        <span className="text-rose-500 font-bold">Red Zone</span> = Panic Churn ({'>'}{CHURN_GUARDRAILS.panicPctPerWeek}%)
                    </span>
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="t" stroke="#64748b" tickFormatter={(val) => `W${val}`} />
                            <YAxis stroke="#64748b" tickFormatter={(val) => `${val.toFixed(1)}%`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                formatter={(val: number) => [`${val.toFixed(2)}%`, 'Weekly Churn']}
                            />
                            {/* @ts-ignore */}
                            <ReferenceArea y1={CHURN_GUARDRAILS.panicPctPerWeek} y2={100} fill="#ef4444" fillOpacity={0.15} label={{ value: 'PANIC ZONE', position: 'insideTopRight', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
                            <Area type="monotone" dataKey="churnRatePct" name="Churn Rate (%)" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
