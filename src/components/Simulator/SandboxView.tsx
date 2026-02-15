import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart, ReferenceLine, ComposedChart, ReferenceArea, ResponsiveContainer
} from 'recharts';
import {
    AlertTriangle, CheckCircle2, DollarSign, Activity, TrendingDown, ShieldAlert, Scale, Clock, Wallet, Lock, BarChart3, Database, ArrowUpRight, ArrowDownRight, TrendingUp, Layers, Zap, Info, MapPin, FileText, Swords
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend as ChartLegend, Filler } from 'chart.js';

import { ProtocolProfileV1 } from '../../data/protocols';
import { LegacySimulationParams as SimulationParams, LegacyAggregateResult as AggregateResult } from '../../model/legacy/engine';
import { IncentiveRegime } from '../../utils/regime';
import { FlywheelWidget } from '../FlywheelWidget';
import { SectionLayout } from '../SectionLayout';
import MetricCard from '../ui/MetricCard';
import BaseChartBox from '../ui/BaseChartBox';
import { GeoCoverageView } from '../GeoCoverageView';
import MetricEvidenceLegend from '../ui/MetricEvidenceLegend';
import MetricEvidenceBadge from '../ui/MetricEvidenceBadge';

import { formatCompact, formatCurrency, formatPercent, getColourClass } from '../../utils/format';
import { ChartInterpretation, CHART_INTERPRETATIONS } from '../../data/chartInterpretations';
import { METRICS } from '../../data/MetricRegistry';
import { getMetricEvidence } from '../../data/metricEvidence';
import { generateInvestmentMemo, generateVerdict } from '../../utils/reportGenerator';
import { MemoPreviewModal } from '../ui/MemoPreviewModal';
import { ScenarioManager } from '../ui/ScenarioManager';
import { ScenarioComparisonPanel } from '../ui/ScenarioComparisonPanel';
import { useSandboxViewModel } from '../../viewmodels/SandboxViewModel';
import { seededRandom, initGlobalRng } from '../../utils/seededRandom';
import type { OnocoyProtocolHookSnapshot } from '../../hooks/useSimulationRunner';

interface SandboxViewProps {
    activeProfile: ProtocolProfileV1;
    params: SimulationParams;
    setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
    aggregated: AggregateResult[];
    onocoyHookSnapshot?: OnocoyProtocolHookSnapshot;
    playbackWeek: number;
    incentiveRegime: IncentiveRegime;
    scrollToControl: (section: string) => void;
    focusChart: string | null;
    setFocusChart: (chart: string | null) => void;
}

export const SandboxView: React.FC<SandboxViewProps> = ({
    activeProfile,
    params,
    setParams,
    aggregated,
    onocoyHookSnapshot,
    playbackWeek,
    incentiveRegime,
    scrollToControl,
    focusChart,
    setFocusChart
}) => {
    // const [focusChart, setFocusChart] = useState<string | null>(null);
    const [showMemoModal, setShowMemoModal] = useState(false);
    const [memoContent, setMemoContent] = useState('');
    const [showBenchmark, setShowBenchmark] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    // Use ViewModel for all data transformations
    const {
        displayedData,
        counterfactualData,
        chartDataWithBenchmark,
        stabilityResult,
        lastMetrics
    } = useSandboxViewModel(aggregated, params, playbackWeek, showBenchmark);

    const resolveFocusedMetric = (value: string | null) => {
        if (!value) return null;
        return Object.values(METRICS).find((metric) => metric.id === value || metric.label === value) || null;
    };

    const calculatePaybackMonths = (point: any) => {
        const providerCount = Math.max(1, point?.providers?.mean || 0);
        const weeklyRevenue = ((point?.minted?.mean || 0) / providerCount) * (point?.price?.mean || 0);
        const weeklyProfit = weeklyRevenue - params.providerCostPerWeek;

        if (weeklyProfit <= 0) return 36;
        return Math.min((params.hardwareCost / weeklyProfit) / 4.33, 36);
    };

    const renderFocusChart = () => {
        if (!focusChart) return null;
        const focusedMetric = resolveFocusedMetric(focusChart);
        const focusedChartLabel = focusedMetric?.label || focusChart;
        const focusedMetricId = focusedMetric?.id || focusChart;
        const interp = CHART_INTERPRETATIONS[focusedMetricId];
        const isDriver = incentiveRegime.drivers.includes(focusedChartLabel);
        const focusedCounterfactual = counterfactualData.slice(0, playbackWeek);

        const renderMainChart = () => {
            switch (focusedChartLabel) {
                // --- TIER 1: SURVIVAL ---
                case METRICS.solvency_ratio.label:
                    return (
                        <ComposedChart data={displayedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={11} minTickGap={30} label={{ value: 'Time (Weeks)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                            <YAxis fontSize={11} domain={[0, 5]} allowDataOverflow={true} label={{ value: 'Burn/Mint Ratio', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                            <ReferenceArea y1={0} y2={1} {...{ fill: "#f43f5e", fillOpacity: 0.1 } as any} />
                            <ReferenceArea y1={1} y2={5} {...{ fill: "#10b981", fillOpacity: 0.05 } as any} />
                            <Line type="monotone" dataKey={(d: any) => Math.min(d?.solvencyScore?.mean || 0, 5)} stroke="#fbbf24" strokeWidth={3} dot={false} name="Sustainability Ratio" />
                            <ReferenceLine y={1} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Deflationary (>1.0)', fill: '#10b981', fontSize: 10, position: 'insideTopLeft' }} />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                        </ComposedChart>
                    );
                case METRICS.weekly_retention_rate.label:
                    return (
                        <AreaChart data={displayedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={11} minTickGap={30} />
                            <YAxis fontSize={11} domain={[80, 100]} label={{ value: 'Retention %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} formatter={(val: number) => `${val.toFixed(2)}%`} />
                            <Area type="monotone" dataKey="retentionRate" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Weekly Retention" />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                        </AreaChart>
                    );
                case METRICS.urban_density.label:
                    return (
                        <AreaChart data={displayedData}>
                            <defs>
                                <linearGradient id="urbanGradientFocus" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="ruralGradientFocus" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={11} minTickGap={30} label={{ value: 'Time (Weeks)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                            <YAxis fontSize={11} label={{ value: 'Node Count', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="ruralCount.mean" stackId="1" stroke="#10b981" fill="url(#ruralGradientFocus)" name="Rural (Utility)" />
                            <Area type="monotone" dataKey="urbanCount.mean" stackId="1" stroke="#ef4444" fill="url(#urbanGradientFocus)" name="Urban (Speculator)" />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                        </AreaChart>
                    );
                case METRICS.treasury_balance.label:
                    return (
                        <ComposedChart data={displayedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={11} minTickGap={30} />
                            <YAxis fontSize={11} tickFormatter={formatCompact} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="treasuryBalance.mean" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Treasury Reserve" />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                        </ComposedChart>
                    );

                // --- TIER 2: VIABILITY ---
                case METRICS.payback_period.label:
                    return (
                        <LineChart data={displayedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={11} minTickGap={30} label={{ value: 'Time (Weeks)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                            <YAxis fontSize={11} domain={[0, 36]} allowDataOverflow={true} label={{ value: 'Months', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                formatter={(val: number) => val >= 36 ? ['Never (Unprofitable)', 'Payback Period'] : [`${val.toFixed(1)} Months`, 'Payback Period']}
                                labelFormatter={(label) => `Week ${label}`}
                            />
                            <ReferenceArea y1={0} y2={12} {...{ fill: "#10b981", fillOpacity: 0.05 } as any} />
                            <ReferenceArea y1={24} y2={36} {...{ fill: "#f43f5e", fillOpacity: 0.05 } as any} />
                            <Line
                                type="monotone"
                                dataKey={calculatePaybackMonths}
                                stroke="#f43f5e"
                                strokeWidth={3}
                                dot={false}
                                name="Payback Period"
                            />
                            <ReferenceLine y={12} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Healthy (<12m)', fill: '#10b981', fontSize: 10, position: 'insideBottomRight' }} />
                            <ReferenceLine y={24} stroke="#fbbf24" strokeDasharray="3 3" label={{ value: 'Risk (>24m)', fill: '#fbbf24', fontSize: 10, position: 'insideTopRight' }} />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                        </LineChart>
                    );
                case METRICS.network_coverage_score.label:
                    return (
                        <AreaChart data={displayedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={11} minTickGap={30} />
                            <YAxis fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="weightedCoverage.mean" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Coverage Score" />
                        </AreaChart>
                    );
                case METRICS.vampire_churn.label:
                    return (
                        <ComposedChart data={displayedData}>
                            <XAxis dataKey="t" fontSize={11} />
                            <YAxis fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a' }} />
                            <Line type="monotone" dataKey="vampireChurn.mean" stroke="#ef4444" name="Vampire Churn" />
                        </ComposedChart>
                    );

                // --- TIER 3: UTILITY ---
                case METRICS.effective_capacity.label:
                    return (
                        <ComposedChart data={displayedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={11} minTickGap={30} label={{ value: 'Time (Weeks)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                            <YAxis fontSize={11} tickFormatter={formatCompact} label={{ value: 'Units', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey={(d: any) => d?.capacity?.mean} stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} name="Capacity" />
                            {isDriver && <Line data={focusedCounterfactual} type="monotone" dataKey="capacityRef" stroke="#475569" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Equilibrium Reference" opacity={0.4} />}
                            <Line type="monotone" dataKey={(d: any) => d?.demand_served?.mean} stroke="#fbbf24" strokeWidth={3} dot={false} name="Demand Served" />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                        </ComposedChart>
                    );
                case METRICS.rural_density.label:
                    // Using same chart as Urban for now but focused logic could differ
                    return (
                        <AreaChart data={displayedData}>
                            <XAxis dataKey="t" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="ruralCount.mean" stroke="#10b981" fill="#10b981" name="Rural (Low Sunk Cost)" />
                        </AreaChart>
                    );
                case METRICS.quality_distribution.label:
                    return (
                        <AreaChart data={displayedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={11} minTickGap={30} />
                            <YAxis fontSize={11} label={{ value: 'Nodes', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey={(d: any) => Math.max(0, d.providers.mean - (d.proCount?.mean || 0))} stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.45} name="Basic (Low Cap)" />
                            <Area type="monotone" dataKey={(d: any) => d.proCount?.mean || 0} stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.75} name="Pro (High Cap)" />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                        </AreaChart>
                    );
                case METRICS.supply_trajectory.label:
                    return (
                        <ComposedChart data={displayedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={11} minTickGap={30} />
                            <YAxis fontSize={11} tickFormatter={formatCompact} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey={(d: any) => [d.supply.ci95_lower, d.supply.ci95_upper]} stroke="none" fill="#8b5cf6" fillOpacity={0.1} name="95% CI" />
                            <Line type="monotone" dataKey={(d: any) => d?.supply?.mean} stroke="#8b5cf6" strokeWidth={3} dot={false} name="Supply" />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                        </ComposedChart>
                    );
                case METRICS.network_utilization.label:
                    return (
                        <AreaChart data={displayedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={11} minTickGap={30} />
                            <YAxis domain={[0, 100]} fontSize={11} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} formatter={(val: number) => `${val.toFixed(1)}%`} />
                            <ReferenceLine y={60} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Healthy', fill: '#10b981', fontSize: 10 }} />
                            <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical', fill: '#ef4444', fontSize: 10 }} />
                            <Area type="monotone" dataKey={(d: any) => d?.utilization?.mean} stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} name="Utilization" />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                        </AreaChart>
                    );

                // --- LEGACY / UNGROUPED ---
                case "Liquidity Shock Impact":
                    return (
                        <LineChart data={displayedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={11} minTickGap={30} label={{ value: 'Time (Weeks)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                            <YAxis fontSize={11} tickFormatter={(val: number) => `$${val.toFixed(2)}`} label={{ value: 'Price ($)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                            <ReferenceLine x={params.investorUnlockWeek} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Unlock', fill: '#f43f5e', fontSize: 10 }} />
                            <Line type="monotone" dataKey="price.mean" stroke="#a855f7" strokeWidth={3} dot={false} name="Token Price" />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                        </LineChart>
                    );

                default:
                    return null;
            }
        };

        return (
            <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                {focusedChartLabel}
                                {isDriver && <span className={`px-2 py-0.5 rounded-full bg-${incentiveRegime.color}-500/20 text-${incentiveRegime.color}-400 text-[10px] uppercase font-bold tracking-widest border border-${incentiveRegime.color}-500/30`}>Primary Driver</span>}
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">{interp?.subtitle || 'Detailed trend analysis.'}</p>
                        </div>
                        <button onClick={() => setFocusChart(null)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <span className="sr-only">Close</span>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-[400px] w-full bg-slate-950/50 rounded-2xl border border-slate-800 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {renderMainChart()!}
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <section>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Activity size={16} className="text-indigo-400" />
                                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Interpretation</h3>
                                    </div>
                                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 space-y-4">
                                        <div>
                                            <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1.5"><CheckCircle2 size={10} /> Healthy Signal</span>
                                            <p className="text-[10px] text-slate-400 leading-normal">{interp?.robust || 'Stable metrics.'}</p>
                                        </div>
                                        <div className="w-full h-px bg-slate-800/50"></div>
                                        <div>
                                            <span className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-1.5"><AlertTriangle size={10} /> Fragile Signal</span>
                                            <p className="text-[10px] text-slate-400 leading-normal">{interp?.fragile || 'Volatile metrics.'}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-center">
                        <button onClick={() => setFocusChart(null)} className="px-12 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all uppercase tracking-[0.2em] active:scale-95 shadow-xl shadow-indigo-600/20">Return to Sandbox</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-[1600px] mx-auto">
            {renderFocusChart()}

            <MemoPreviewModal
                isOpen={showMemoModal}
                onClose={() => setShowMemoModal(false)}
                memoContent={memoContent}
                protocolName={activeProfile.metadata.name}
                verdict={generateVerdict(aggregated, params as any).verdict}
            />

            <div className="space-y-20 pb-32">
                {/* Hero Section */}
                <section className="relative py-20 px-4 md:px-0">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                            <CheckCircle2 size={12} />
                            <span>Thesis Validation Framework 1.2</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
                            {activeProfile.metadata.name}
                            <span className="block text-slate-500 text-lg md:text-2xl font-bold tracking-widest mt-4">Stress Test Environment</span>
                        </h1>
                        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                            This dashboard subjects the protocol to the three canonical stress-tests defined in <strong>Chapter 9</strong> of the Thesis.
                            Scroll to explore the narrative impact of solvency, capitulation, and liquidity shocks.
                        </p>
                    </div>
                </section>

                {/* Tier Quick-Nav */}
                <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/50 py-3 px-4 -mx-6 mb-8">
                    <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mr-3">Jump to:</span>
                        <a href="#tier-1-survival" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/50 text-[10px] font-bold text-slate-400 hover:text-rose-400 transition-all">T1 Survival</a>
                        <a href="#tier-2-viability" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/50 text-[10px] font-bold text-slate-400 hover:text-amber-400 transition-all">T2 Viability</a>
                        <a href="#tier-3-utility" className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/50 text-[10px] font-bold text-slate-400 hover:text-emerald-400 transition-all">T3 Utility</a>
                        <div className="w-px h-4 bg-slate-700 mx-2"></div>
                        <button
                            onClick={() => {
                                const memo = generateInvestmentMemo(activeProfile, aggregated, params as any, 'Stress Test');
                                setMemoContent(memo);
                                setShowMemoModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-[10px] font-bold text-white transition-all flex items-center gap-1.5"
                        >
                            <FileText size={12} />
                            Generate Memo
                        </button>
                        <button
                            onClick={() => setShowBenchmark(!showBenchmark)}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1.5 ${showBenchmark ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50'}`}
                        >
                            <TrendingUp size={12} />
                            {showBenchmark ? 'Benchmark ON' : 'Reality Check'}
                        </button>
                        <ScenarioManager
                            currentParams={params}
                            protocolId={activeProfile.metadata.id}
                            protocolName={activeProfile.metadata.name}
                            onLoadScenario={(scenarioParams) => setParams(prev => ({ ...prev, ...scenarioParams }))}
                        />
                        {/* Stability Badge */}
                        <div
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 bg-${stabilityResult.color}-500/10 border-${stabilityResult.color}-500/30 text-${stabilityResult.color}-400`}
                            title={stabilityResult.message + (stabilityResult.recommendation ? ' ' + stabilityResult.recommendation : '')}
                        >
                            {stabilityResult.level === 'high' && <CheckCircle2 size={12} />}
                            {stabilityResult.level === 'medium' && <AlertTriangle size={12} />}
                            {stabilityResult.level === 'low' && <AlertTriangle size={12} />}
                            {stabilityResult.label}
                        </div>
                        {/* Compare Scenarios Button */}
                        <button
                            onClick={() => setShowComparison(!showComparison)}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1.5 ${showComparison ? 'bg-violet-600 border-violet-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-violet-400 hover:border-violet-500/50'}`}
                        >
                            <BarChart3 size={12} />
                            Compare
                        </button>
                    </div>
                </div>

                {/* Deep Dive & Flywheel Section */}
                <div className="space-y-8 mb-12">
                    <div className="border-b border-slate-800 pb-4">
                        <h2 className="text-xl font-bold text-white mb-2">Deep Dive Analysis</h2>
                        <p className="text-sm text-slate-400">Advanced diagnostics for {activeProfile.metadata.name}, including network health and thesis verification.</p>
                    </div>

                    {aggregated.length > 0 && (() => {
                        const lastPoint = aggregated[aggregated.length - 1];
                        const metrics = {
                            nodes: lastPoint.providers.mean,
                            utilization: lastPoint.utilization.mean,
                            revenue: lastPoint.revenue ? lastPoint.revenue.mean : (lastPoint.minted.mean * lastPoint.price.mean * 0.1),
                            incentive: lastPoint.solvencyScore.mean * 100
                        };
                        const isStressed = metrics.utilization < 10 || metrics.incentive < 50;
                        return (
                            <div className="mb-8">
                                <FlywheelWidget metrics={metrics} stress={isStressed} />
                            </div>
                        );
                    })()}

                    {/* Scenario Comparison Panel */}
                    {showComparison && aggregated.length > 0 && (
                        <div className="mb-8">
                            <ScenarioComparisonPanel
                                baselineResults={aggregated.slice(-10).map(d => d.solvencyScore?.mean || 0)}
                                scenarioResults={aggregated.slice(-10).map((d, i) => {
                                    // Use index-based deterministic variation for reproducibility
                                    const variation = 0.9 + (((i * 7919) % 100) / 500); // Produces 0.9-1.1 range
                                    return (d.solvencyScore?.mean || 0) * variation;
                                })}
                                baselineName="Current Run"
                                scenarioName="Stress Test"
                                metricName="Solvency Ratio"
                            />
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <MetricEvidenceLegend />
                </div>

                {onocoyHookSnapshot && (
                    <div className="mb-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                            <div>
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Onocoy Hook Layer</h3>
                                <p className="text-[11px] text-slate-400">
                                    Protocol-specific scaffolds are active for this profile. Values remain gated as model/proxy until primary telemetry is wired.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {onocoyHookSnapshot.sourceTagIds.map((tagId) => (
                                    <MetricEvidenceBadge key={tagId} evidence={getMetricEvidence(tagId)} compact />
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400">Reward Fidelity Proxy</p>
                                <p className="text-sm font-semibold text-white mt-1">
                                    {(onocoyHookSnapshot.rewardProxy.rewardTokens * 100).toFixed(1)}%
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Location {(onocoyHookSnapshot.rewardProxy.locationScale * 100).toFixed(0)}% ·
                                    Quality {(onocoyHookSnapshot.rewardProxy.qualityScale * 100).toFixed(0)}% ·
                                    Availability {(onocoyHookSnapshot.rewardProxy.availabilityScale * 100).toFixed(0)}%
                                </p>
                            </div>
                            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400">Unlock Curve Preview</p>
                                <p className="text-sm font-semibold text-white mt-1">
                                    {onocoyHookSnapshot.unlockPreview.length} points
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Cliff week {onocoyHookSnapshot.unlockPreview[0]?.week ?? '-'} ·
                                    Last week {onocoyHookSnapshot.unlockPreview[onocoyHookSnapshot.unlockPreview.length - 1]?.week ?? '-'}
                                </p>
                            </div>
                            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400">Integrity Pressure Proxy</p>
                                <p className="text-sm font-semibold text-white mt-1">
                                    {onocoyHookSnapshot.integrityProxy.integrityPressureScore.toFixed(2)}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Spoof {onocoyHookSnapshot.integrityProxy.spoofingRatePct.toFixed(2)}% ·
                                    Slash {onocoyHookSnapshot.integrityProxy.slashingRatePct.toFixed(2)}% ·
                                    Latency {onocoyHookSnapshot.integrityProxy.latencyBreachRatePct.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* TIER 1: SURVIVAL */}
                <SectionLayout
                    id="tier-1-survival"
                    title="Tier 1: Survival"
                    subtitle="Tier 01 // Existential Risk"
                    description={
                        <div className="space-y-6">
                            <p><strong>Can the network exist?</strong> This tier monitors the fundamental conditions for survival: solvency (burn greater than emission) and provider retention (loyalty). Failure here is fatal.</p>
                        </div>
                    }
                >
                    <div className="space-y-6">
                        {/* Status Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <MetricCard
                                title={METRICS.solvency_ratio.label}
                                value={aggregated[aggregated.length - 1]?.solvencyScore?.mean > 0 ? formatCompact(aggregated[aggregated.length - 1]?.solvencyScore?.mean) : '-'}
                                subValue={(aggregated[aggregated.length - 1]?.solvencyScore?.mean || 0) < 1.0 ? 'Dilutive' : 'Deflationary'}
                                subColor={(aggregated[aggregated.length - 1]?.solvencyScore?.mean || 0) < 1.0 ? 'text-amber-400' : 'text-emerald-400'}
                                icon={Activity}
                                tooltip={METRICS.solvency_ratio.description}
                                formula={METRICS.solvency_ratio.formula}
                                evidence={getMetricEvidence('solvency_ratio')}
                            />
                            <MetricCard
                                title={METRICS.weekly_retention_rate.label}
                                value={aggregated[aggregated.length - 1]?.retentionRate ? `${(aggregated[aggregated.length - 1]?.retentionRate).toFixed(1)}%` : '100%'}
                                subValue="Provider Loyalty"
                                subColor="text-slate-500"
                                icon={CheckCircle2}
                                tooltip={METRICS.weekly_retention_rate.description}
                                formula={METRICS.weekly_retention_rate.formula}
                                evidence={getMetricEvidence('weekly_retention_rate')}
                            />
                            <MetricCard
                                title={METRICS.treasury_balance.label}
                                value={params.revenueStrategy === 'reserve' ? `$${formatCompact(aggregated[aggregated.length - 1]?.treasuryBalance?.mean || 0)}` : 'N/A'}
                                subValue={params.revenueStrategy === 'reserve' ? 'Accumulated' : 'Burn Strategy'}
                                subColor={params.revenueStrategy === 'reserve' ? 'text-emerald-400' : 'text-slate-500'}
                                icon={Wallet}
                                tooltip={METRICS.treasury_balance.description}
                                formula={METRICS.treasury_balance.formula}
                                evidence={getMetricEvidence('treasury_balance')}
                            />
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <BaseChartBox
                                title={METRICS.solvency_ratio.label}
                                icon={TrendingDown}
                                color="amber"
                                source={METRICS.solvency_ratio.description}
                                evidence={getMetricEvidence('solvency_ratio')}
                                heightClass="h-[300px]"
                                onExpand={() => setFocusChart(METRICS.solvency_ratio.id)}
                                onConfigure={() => scrollToControl('tokenomics')}
                            >
                                <ComposedChart data={displayedData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="t" fontSize={9} interval={4} />
                                    <YAxis fontSize={9} domain={[0, 5]} allowDataOverflow={true} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                                    <ReferenceLine y={1} stroke="#10b981" strokeDasharray="5 5" label={{ value: '1.0', fill: '#10b981', fontSize: 10 }} />
                                    {/* Error Band (95% CI) */}
                                    <Area type="monotone" dataKey="solvencyScore.ci95_upper" stroke="none" fill="#fbbf24" fillOpacity={0.1} />
                                    <Area type="monotone" dataKey="solvencyScore.ci95_lower" stroke="none" fill="#0f172a" fillOpacity={1} />
                                    {/* Note: In Recharts, creating a 'band' usually requires a [min, max] range or stacking. 
                                        A simpler hack for Area/Composed charts is drawing the Upper then overlaying Lower with background color (if solid).
                                        Better approach for ComposedChart: Use `Area` with `dataKey={[min, max]}` if supported, or two areas.
                                        Let's try the 'Stacking' visual trick or just a simple light fill for Upper.
                                    */}
                                    <Area type="monotone" dataKey={(d: any) => [d.solvencyScore.ci95_lower, d.solvencyScore.ci95_upper]} stroke="none" fill="#fbbf24" fillOpacity={0.15} name="95% CI" />
                                    <Line type="monotone" dataKey="solvencyScore.mean" stroke="#fbbf24" strokeWidth={2} dot={false} name="Ratio" />
                                </ComposedChart>
                            </BaseChartBox>

                            <BaseChartBox
                                title={METRICS.weekly_retention_rate.label}
                                icon={ShieldAlert}
                                color="emerald"
                                source={METRICS.weekly_retention_rate.formula}
                                evidence={getMetricEvidence('weekly_retention_rate')}
                                heightClass="h-[300px]"
                                onExpand={() => setFocusChart(METRICS.weekly_retention_rate.id)}
                                onConfigure={() => scrollToControl('providers')}
                            >
                                <AreaChart data={displayedData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="t" fontSize={9} interval={4} />
                                    <YAxis fontSize={9} domain={[80, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} formatter={(val: number) => `${val.toFixed(2)}%`} />
                                    <Area type="monotone" dataKey="retentionRate" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} name="Retention" />
                                </AreaChart>
                            </BaseChartBox>
                        </div>

                        {/* Urban Density (High Sunk Cost) */}
                        <div className="grid grid-cols-1 gap-6">
                            <BaseChartBox
                                title={METRICS.urban_density.label}
                                icon={Layers}
                                color="rose"
                                source={METRICS.urban_density.description}
                                evidence={getMetricEvidence('urban_density')}
                                heightClass="h-[250px]"
                                onExpand={() => setFocusChart(METRICS.urban_density.id)}
                                onConfigure={() => scrollToControl('providers')}
                            >
                                <AreaChart data={displayedData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="urbanGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="t" fontSize={9} />
                                    <YAxis fontSize={9} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey={(d: any) => [d.urbanCount.ci95_lower, d.urbanCount.ci95_upper]} stroke="none" fill="#f43f5e" fillOpacity={0.1} name="95% CI" />
                                    <Area type="monotone" dataKey="urbanCount.mean" name="Urban (Fragile)" stroke="#f43f5e" fill="url(#urbanGradient)" strokeWidth={2} />
                                </AreaChart>
                            </BaseChartBox>
                        </div>

                    </div>
                </SectionLayout>

                {/* Module 2: Capitulation */}
                {/* TIER 2: VIABILITY */}
                <SectionLayout
                    id="tier-2-viability"
                    title="Tier 2: Viability"
                    subtitle="Tier 02 // Economic Health"
                    description={
                        <div className="space-y-6">
                            <p><strong>Is it sustainable?</strong> Once survival is secured, we evaluate long-term viability: miner profitability (Payback Period) and competitive yield resilience (Vampire Attack).</p>
                        </div>
                    }
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <MetricCard
                                title={METRICS.payback_period.label}
                                value={(() => {
                                    const last = aggregated[aggregated.length - 1];
                                    if (!last) return '-';
                                    const months = calculatePaybackMonths(last);
                                    return months >= 36 ? '>36mo' : `${months.toFixed(1)}mo`;
                                })()}
                                subValue="ROI Time"
                                subColor="text-slate-500"
                                icon={DollarSign}
                                tooltip={METRICS.payback_period.description}
                                formula={METRICS.payback_period.formula}
                                evidence={getMetricEvidence('payback_period')}
                            />
                            <MetricCard
                                title={METRICS.network_coverage_score.label}
                                value={formatCompact(aggregated[aggregated.length - 1]?.weightedCoverage?.mean || 0)}
                                subValue="Network Utility"
                                subColor="text-indigo-400"
                                icon={MapPin}
                                tooltip={METRICS.network_coverage_score.description}
                                formula={METRICS.network_coverage_score.formula}
                                evidence={getMetricEvidence('network_coverage_score')}
                            />
                            <MetricCard
                                title={METRICS.vampire_churn.label}
                                value={aggregated[aggregated.length - 1]?.vampireChurn?.mean > 1 ? formatCompact(aggregated[aggregated.length - 1]?.vampireChurn?.mean) : '0'}
                                subValue={params.competitorYield > 0.5 ? 'Active Attack' : 'Standard'}
                                subColor={params.competitorYield > 0.5 ? 'text-rose-400' : 'text-emerald-400'}
                                icon={Zap}
                                tooltip={METRICS.vampire_churn.description}
                                formula={METRICS.vampire_churn.formula}
                                evidence={getMetricEvidence('vampire_churn')}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <BaseChartBox
                                title={METRICS.payback_period.label}
                                icon={DollarSign}
                                color="rose"
                                source={METRICS.payback_period.formula}
                                evidence={getMetricEvidence('payback_period')}
                                heightClass="h-[300px]"
                                onExpand={() => setFocusChart(METRICS.payback_period.id)}
                                onConfigure={() => scrollToControl('providers')}
                            >
                                <LineChart data={displayedData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="t" fontSize={9} interval={4} />
                                    <YAxis fontSize={9} domain={[0, 36]} allowDataOverflow={true} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} formatter={(val: number) => val >= 36 ? 'Never' : `${val.toFixed(1)} mo`} />
                                    <ReferenceLine y={12} stroke="#10b981" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey={calculatePaybackMonths} stroke="#f43f5e" strokeWidth={2} dot={false} name="Payback" />
                                </LineChart>
                            </BaseChartBox>

                            <BaseChartBox
                                title={METRICS.network_coverage_score.label}
                                icon={MapPin}
                                color="indigo"
                                source={METRICS.network_coverage_score.formula}
                                evidence={getMetricEvidence('network_coverage_score')}
                                heightClass="h-[300px]"
                                onExpand={() => setFocusChart(METRICS.network_coverage_score.id)}
                                onConfigure={() => scrollToControl('providers')}
                            >
                                <AreaChart data={displayedData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="t" fontSize={9} interval={4} />
                                    <YAxis fontSize={9} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="weightedCoverage.mean" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Coverage" />
                                </AreaChart>
                            </BaseChartBox>
                        </div>
                    </div>
                </SectionLayout>

                {/* TIER 3: UTILITY */}
                <SectionLayout
                    id="tier-3-utility"
                    title="Tier 3: Utility"
                    subtitle="Tier 03 // Efficacy"
                    description={
                        <div className="space-y-6">
                            <p><strong>Is it useful?</strong> The final tier measures physical efficacy: Effective Capacity (supply matching demand) and Rural Density (geographic coverage).</p>
                        </div>
                    }
                >
                    <div className="space-y-6">
                        {/* Geo Coverage View (Moved from Module 2) */}
                        <div className="mb-8">
                            <GeoCoverageView
                                totalNodes={(() => {
                                    const last = aggregated[aggregated.length - 1];
                                    return last ? last.providers.mean : 0;
                                })()}
                                profileType={params.capacityStdDev > 0.4 ? 'rural' : params.capacityStdDev < 0.1 ? 'urban' : 'balanced'}
                                isStress={false}
                            />
                        </div>

                        <BaseChartBox
                            title={METRICS.effective_capacity.label}
                            icon={Zap}
                            color="indigo"
                            source={METRICS.effective_capacity.description}
                            evidence={getMetricEvidence('effective_capacity')}
                            heightClass="h-[300px]"
                            onExpand={() => setFocusChart(METRICS.effective_capacity.id)}
                            onConfigure={() => scrollToControl('demand')}
                        >
                            <ComposedChart data={displayedData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="t" fontSize={9} interval={4} />
                                <YAxis fontSize={9} tickFormatter={formatCompact} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                                <Area type="monotone" dataKey={(d: any) => d?.capacity?.mean} stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} name="Total Capacity" />
                                <Line type="monotone" dataKey={(d: any) => d?.demand_served?.mean} stroke="#fbbf24" strokeWidth={2} dot={false} name="Served Demand" />
                            </ComposedChart>
                        </BaseChartBox>
                    </div>
                </SectionLayout>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {/* Small Charts */}
                    <BaseChartBox
                        title={METRICS.payback_period.label}
                        icon={DollarSign}
                        color="rose"
                        onExpand={() => setFocusChart(METRICS.payback_period.id)}
                        isDriver={incentiveRegime.drivers.includes('Service Pricing Proxy')}
                        driverColor={incentiveRegime.color}
                        source={METRICS.payback_period.formula}
                        evidence={getMetricEvidence('payback_period')}
                        onConfigure={() => scrollToControl('providers')}
                    >
                        <LineChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={9} interval={4} label={{ value: 'Weeks', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 9 }} />
                            <YAxis fontSize={9} domain={[0, 36]} allowDataOverflow={true} label={{ value: 'Months', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 9 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} formatter={(val: number) => isFinite(val) ? `${val.toFixed(1)} mo` : 'Never'} labelFormatter={(label) => `Week ${label}`} />
                            <ReferenceArea y1={0} y2={12} {...{ fill: "#10b981", fillOpacity: 0.05 } as any} />
                            <ReferenceArea y1={24} y2={36} {...{ fill: "#f43f5e", fillOpacity: 0.05 } as any} />
                            <Line type="monotone" dataKey={calculatePaybackMonths} stroke="#f43f5e" strokeWidth={2} dot={false} name="Payback Period" />
                        </LineChart>
                    </BaseChartBox>

                    <BaseChartBox title={METRICS.solvency_ratio.label} icon={Scale} color="amber" onExpand={() => setFocusChart(METRICS.solvency_ratio.id)} isDriver={incentiveRegime.drivers.includes('Burn vs Emissions')} driverColor={incentiveRegime.color} source={METRICS.solvency_ratio.formula} evidence={getMetricEvidence('solvency_ratio')}>
                        <ComposedChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={9} interval={4} label={{ value: 'Weeks', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 9 }} />
                            <YAxis fontSize={9} domain={[0, 5]} allowDataOverflow={true} label={{ value: 'Ratio', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 9 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                            <ReferenceArea y1={0} y2={1} {...{ fill: "#f43f5e", fillOpacity: 0.1 } as any} />
                            <ReferenceArea y1={1} y2={5} {...{ fill: "#10b981", fillOpacity: 0.05 } as any} />
                            <Line type="monotone" dataKey={(d: any) => Math.min(d?.solvencyScore?.mean || 0, 5)} stroke="#fbbf24" strokeWidth={2} dot={false} name="Solvency Ratio" />
                        </ComposedChart>
                    </BaseChartBox>

                    <BaseChartBox title={METRICS.urban_density.label} icon={ShieldAlert} color="emerald" onExpand={() => setFocusChart(METRICS.urban_density.id)} isDriver={incentiveRegime.drivers.includes('Provider Count')} driverColor={incentiveRegime.color} source={METRICS.urban_density.description} evidence={getMetricEvidence('urban_density')}>
                        <AreaChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <defs>
                                <linearGradient id="urbanGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="ruralGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="t" fontSize={9} interval={4} label={{ value: 'Weeks', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 9 }} />
                            <YAxis fontSize={9} label={{ value: 'Nodes', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 9 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                            <Area type="monotone" dataKey="ruralCount.mean" stackId="1" stroke="#10b981" fill="url(#ruralGradient)" name="Rural (Utility)" />
                            <Area type="monotone" dataKey="urbanCount.mean" stackId="1" stroke="#ef4444" fill="url(#urbanGradient)" name="Urban (Speculator)" />
                        </AreaChart>
                    </BaseChartBox>

                    <BaseChartBox title={METRICS.effective_capacity.label} icon={Activity} color="indigo" onExpand={() => setFocusChart(METRICS.effective_capacity.id)} isDriver={incentiveRegime.drivers.includes('Capacity vs Demand')} driverColor={incentiveRegime.color} source={METRICS.effective_capacity.description} evidence={getMetricEvidence('effective_capacity')}>
                        <ComposedChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={9} interval={4} label={{ value: 'Weeks', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 9 }} />
                            <YAxis fontSize={9} tickFormatter={formatCompact} label={{ value: 'Units', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 9 }} />
                            {/* Error Band */}
                            <Area type="monotone" dataKey={(d: any) => [d?.capacity?.ci95_lower, d?.capacity?.ci95_upper]} stroke="none" fill="#4f46e5" fillOpacity={0.1} name="95% CI" />
                            <Area type="monotone" dataKey={(d: any) => d?.capacity?.mean} stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} name="Total Capacity" />
                            <Line type="monotone" dataKey={(d: any) => d?.demand_served?.mean} stroke="#fbbf24" strokeWidth={2} dot={false} name="Served Demand" />
                        </ComposedChart>
                    </BaseChartBox>

                    <BaseChartBox title={METRICS.quality_distribution.label} icon={Swords} color="emerald" onExpand={() => setFocusChart(METRICS.quality_distribution.id)} isDriver={params.proTierPct > 0} driverColor="emerald" source={METRICS.quality_distribution.description} evidence={getMetricEvidence('quality_distribution')}>
                        <AreaChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={9} interval={4} label={{ value: 'Weeks', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 9 }} />
                            <YAxis fontSize={9} label={{ value: 'Nodes', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 9 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }} />
                            <Area type="monotone" dataKey={(d: any) => Math.max(0, d.providers.mean - (d.proCount?.mean || 0))} stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.5} name="Basic (Low Cap)" />
                            <Area type="monotone" dataKey={(d: any) => d.proCount?.mean || 0} stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} name="Pro (High Cap)" />
                        </AreaChart>
                    </BaseChartBox>

                    <BaseChartBox title={METRICS.supply_trajectory.label} icon={Database} color="violet" onExpand={() => setFocusChart(METRICS.supply_trajectory.id)} isDriver={incentiveRegime.drivers.includes('Supply Trajectory')} driverColor={incentiveRegime.color} source={METRICS.supply_trajectory.description} evidence={getMetricEvidence('supply_trajectory')}>
                        <ComposedChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={9} interval={4} label={{ value: 'Weeks', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 9 }} />
                            <YAxis fontSize={9} tickFormatter={formatCompact} label={{ value: 'Supply', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 9 }} />
                            {/* Error Band - Note: LineChart needs 'Area' to be inside ComposedChart usually, but LineChart accepts ReferenceArea. Area component works in ComposedChart. Let's upgrade chart type or use Area if possible. Recharts LineChart doesn't support Area. Switching to ComposedChart for Supply. */}
                            <Area type="monotone" dataKey={(d: any) => [d.supply.ci95_lower, d.supply.ci95_upper]} stroke="none" fill="#8b5cf6" fillOpacity={0.1} name="95% CI" />
                            <Line type="monotone" dataKey={(d: any) => d?.supply?.mean} stroke="#8b5cf6" strokeWidth={2} dot={false} />
                        </ComposedChart>
                    </BaseChartBox>

                    <BaseChartBox title={METRICS.network_utilization.label} icon={BarChart3} color="rose" onExpand={() => setFocusChart(METRICS.network_utilization.id)} isDriver={incentiveRegime.drivers.includes('Network Utilization (%)')} driverColor={incentiveRegime.color} source={METRICS.network_utilization.description} evidence={getMetricEvidence('network_utilization')}>
                        <AreaChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="t" fontSize={9} interval={4} label={{ value: 'Weeks', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 9 }} />
                            <YAxis domain={[0, 100]} fontSize={9} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 9 }} />
                            <Area type="monotone" dataKey={(d: any) => d?.utilization?.mean} stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} />
                        </AreaChart>
                    </BaseChartBox>
                </div>
            </div>
        </div>
    );
};
