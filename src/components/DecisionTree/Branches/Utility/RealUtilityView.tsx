import React, { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, ReferenceLine
} from 'recharts';
import { AggregateResult } from '../../../../model/types';
import { Info, ExternalLink } from 'lucide-react';
import { buildUtilityChartData, summarizeUtility } from '../../../../audit/decisionTreeViewMath';
import { ChartContextHeader } from '../../../ui/ChartContextHeader';
import { GUARDRAIL_COPY, UTILIZATION_GUARDRAILS } from '../../../../constants/guardrails';

interface RealUtilityViewProps {
    data: AggregateResult[];
    onOpenSandbox: () => void;
}

export const RealUtilityView: React.FC<RealUtilityViewProps> = ({ data, onOpenSandbox }) => {
    const chartData = useMemo(() => {
        try {
            return buildUtilityChartData(data);
        } catch (error) {
            console.error('Error processing utility data', error);
            return [];
        }
    }, [data]);

    if (!chartData || chartData.length === 0) {
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

    const utilitySummary = summarizeUtility(chartData);
    const last = chartData[chartData.length - 1];
    const {
        utilization,
        demandCoverage,
        proShare,
        lowSample,
        overprovisioned,
        utilityHealthScore,
        utilityState,
    } = utilitySummary;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group cursor-help">
                    <div className="absolute top-4 right-4 text-slate-600 group-hover:text-slate-400 transition-colors">
                        <Info size={16} />
                    </div>
                    <div className="absolute left-6 bottom-full mb-2 w-56 p-3 bg-slate-800 text-xs text-slate-300 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <strong className="text-white block mb-1">Network Utilization</strong>
                        Percentage of total capacity that is actively being consumed.
                    </div>

                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Network Utilization</h3>
                    <div className={`text-4xl font-mono font-bold ${utilization >= UTILIZATION_GUARDRAILS.healthyMinPct ? 'text-emerald-400' : utilization >= UTILIZATION_GUARDRAILS.watchlistMinPct ? 'text-amber-400' : 'text-rose-400'}`}>
                        {utilization.toFixed(1)}%
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Capacity actively used by demand</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Demand Coverage</h3>
                    <div className="text-2xl font-bold text-white">{demandCoverage.toFixed(1)}%</div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                        <div className="h-full bg-cyan-500" style={{ width: `${demandCoverage}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {overprovisioned
                            ? 'Coverage is high because capacity is overbuilt vs active demand'
                            : 'Share of requested demand that is served'}
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Cohort Quality Mix</h3>
                    <div className="flex items-end gap-2 mt-2">
                        <div className="text-2xl font-bold text-white">{proShare.toFixed(0)}% Pro</div>
                        <div className="text-sm text-slate-500 mb-1">/ {(100 - proShare).toFixed(0)}% Mercenary</div>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                        <div className="flex h-full w-full">
                            <div className="h-full bg-emerald-500" style={{ width: `${proShare}%` }} />
                            <div className="h-full bg-amber-500" style={{ width: `${100 - proShare}%` }} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Utility state: {utilityState} ({utilityHealthScore}/100)</p>
                    {lowSample && (
                        <p className="text-xs text-amber-400 mt-1">Low base size ({last.totalNodes.toFixed(0)} providers): cohort split is noisier.</p>
                    )}
                    <button
                        onClick={onOpenSandbox}
                        className="mt-3 text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                        <ExternalLink size={12} /> Open Sandbox Inputs
                    </button>
                </div>
            </div>

            <ChartContextHeader
                title="How To Read Real Utility"
                what="This branch checks whether the network is actually used, not just built out."
                why="Utilization compares demand served vs capacity. Cohort mix helps show if committed operators are carrying the network."
                reference={GUARDRAIL_COPY.utilityReference}
                nextQuestion="Should we focus first on demand capture or on reducing over-supply?"
                actionTrigger={`If utilization stays below ${UTILIZATION_GUARDRAILS.watchlistMinPct}%, freeze expansion and prioritize demand-side fixes.`}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                        <span>Network Utilization Rate</span>
                        <span className="text-xs font-normal text-slate-500">Usage / capability</span>
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="t" stroke="#64748b" tickFormatter={(val) => `W${val}`} tick={{ fontSize: 12 }} />
                                <YAxis stroke="#64748b" tickFormatter={(val) => `${val}%`} tick={{ fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                    formatter={(val: number) => [`${val.toFixed(1)}%`, 'Utilization']}
                                    labelFormatter={(label) => `Week ${label}`}
                                />
                                <ReferenceLine
                                    y={UTILIZATION_GUARDRAILS.healthyMinPct}
                                    stroke="#10b981"
                                    strokeDasharray="3 3"
                                    label={{ value: `Healthy (${UTILIZATION_GUARDRAILS.healthyMinPct}%)`, fill: '#10b981', fontSize: 10 }}
                                />
                                <Area type="monotone" dataKey="utilization" stroke="#f59e0b" fillOpacity={1} fill="url(#colorUtil)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                        <span>Demand vs Demand Served</span>
                        <span className="text-xs font-normal text-slate-500">Coverage quality</span>
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="t" stroke="#64748b" tickFormatter={(val) => `W${val}`} tick={{ fontSize: 12 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                                <Line type="monotone" dataKey="demand" name="Demand" stroke="#64748b" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="demandServed" name="Demand Served" stroke="#06b6d4" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                    <span>Provider Cohort Composition</span>
                    <span className="text-xs font-normal text-slate-500">Professional vs mercenary exposure</span>
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="t" stroke="#64748b" tickFormatter={(val) => `W${val}`} tick={{ fontSize: 12 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} labelFormatter={(label) => `Week ${label}`} />
                            <Area type="monotone" dataKey="proNodes" stackId="1" name="Professional Cohort" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                            <Area type="monotone" dataKey="mercenaryNodes" stackId="1" name="Mercenary Cohort" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
