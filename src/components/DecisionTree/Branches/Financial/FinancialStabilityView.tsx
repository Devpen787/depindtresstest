import React from 'react';
import { AggregateResult } from '../../../../model/types';
import { SolvencyScorecard } from '../../../Diagnostic/SolvencyScorecard';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Info, ExternalLink } from 'lucide-react';
import { buildTreasuryChartData, summarizeFinancial } from '../../../../audit/decisionTreeViewMath';
import { ChartContextHeader } from '../../../ui/ChartContextHeader';
import { GUARDRAIL_COPY } from '../../../../constants/guardrails';

interface FinancialStabilityViewProps {
    data: AggregateResult[];
    onOpenSandbox: () => void;
}

export const FinancialStabilityView: React.FC<FinancialStabilityViewProps> = ({ data, onOpenSandbox }) => {
    // LOADING STATE
    if (!data || data.length === 0) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-12 animate-pulse">
                <div className="h-24 bg-slate-900 rounded-3xl w-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-96 bg-slate-900 rounded-3xl w-full"></div>
                    <div className="h-96 bg-slate-900 rounded-3xl w-full"></div>
                </div>
            </div>
        );
    }

    // Format data for Treasury Chart
    const treasuryData = buildTreasuryChartData(data);
    const {
        useBurnMetric,
        currentBalance,
        isDraining,
        weeksToEmpty,
        currentNetFlow,
        netFlowQuality
    } = summarizeFinancial(treasuryData);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">

            {/* SECTION 1: NARRATIVE */}
            <section className="space-y-4">
                <h1 className="text-3xl font-black text-white">Is the network <span className="text-indigo-400">Financially Stable</span>?</h1>
                <p className="text-slate-400 max-w-3xl text-lg leading-relaxed">
                    Financial stability in DePIN is defined by the relationship between <strong>Token Incentives</strong> (Cost) and <strong>Network Revenue</strong> (Utility).
                    If the protocol pays out more than it earns for too long, it risks a "Subsidy Trap" where it cannot stop inflating supply without collapsing the network.
                </p>

                <div className="flex gap-4 pt-2">
                    <div className={`px-4 py-2 rounded-lg border ${isDraining || netFlowQuality < 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'} text-sm font-bold flex items-center gap-2`}>
                        <Info size={16} />
                        {useBurnMetric
                            ? (currentNetFlow >= 0
                                ? 'Net Deflationary: Burn exceeds mint'
                                : 'Net Inflationary: Mint exceeds burn')
                            : (isDraining
                                ? `Runway Risk: ${(weeksToEmpty / 52).toFixed(1)}y to depletion`
                                : 'Reserve Mode: Treasury stable/growing')}
                    </div>
                    <button onClick={onOpenSandbox} className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 text-sm flex items-center gap-2 transition-all">
                        <ExternalLink size={14} /> See Raw Data in Sandbox
                    </button>
                </div>
            </section>

            <ChartContextHeader
                title="How To Read Financial Stability"
                what="This branch evaluates whether utility revenue can sustainably fund incentives without relying on persistent subsidy."
                why="Metrics combine burn/mint dynamics with treasury trajectory. If burn lags mint or runway drains, solvency weakens."
                reference={useBurnMetric
                    ? GUARDRAIL_COPY.financialBurnReference
                    : GUARDRAIL_COPY.financialRunwayReference}
                nextQuestion="Should we prioritize emission cuts, demand acceleration, or treasury policy changes first?"
            />

            {/* SECTION 2: SOLVENCY SCORECARD (REUSED) */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        1. Solvency & Burn-to-Emission
                        <div className="group relative">
                            <Info size={16} className="text-slate-500 cursor-help" />
                            <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-800 text-xs text-slate-300 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                <strong className="text-white block mb-1">What is this?</strong>
                                Comparing Daily Mint (Inflation) vs Daily Burn (Revenue).
                                <div className="mt-1 text-emerald-400">Score &gt; 1.0 = Deflationary</div>
                                <div className="text-rose-400">Score &lt; 1.0 = Inflationary</div>
                            </div>
                        </div>
                    </h2>
                    <p className="text-sm text-slate-500">
                        This scorecard visualizes the "Gauntlet" - the gap between cost and revenue.
                        A crossing of the lines indicates self-sustainability.
                    </p>
                </div>
                <div className="-m-4">
                    <SolvencyScorecard data={data} />
                </div>
            </section>

            {/* SECTION 3: TREASURY RUNWAY */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">2. Treasury Health</h2>
                        <p className="text-sm text-slate-500">
                            Projected {useBurnMetric ? 'Cumulative Buy & Burn' : 'Treasury Balance'} over the simulation period.
                            <br />{useBurnMetric ? 'Represents total value returned to token holders via deflation.' : 'Represents funds available for future growth and incentives.'}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase font-bold">{useBurnMetric ? 'Total Value Returned' : 'Projected Final Balance'}</div>
                        <div className={`text-2xl font-mono font-bold ${currentBalance > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ${(currentBalance / 1000000).toFixed(1)}M
                        </div>
                        {isDraining && Number.isFinite(weeksToEmpty) && weeksToEmpty < 260 && (
                            <div className="text-xs text-rose-500 font-bold mt-1">Empty in {(weeksToEmpty / 52).toFixed(1)} Years</div>
                        )}
                    </div>
                </div>

                <div className="h-[350px] w-full bg-slate-900 rounded-xl border border-slate-800 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={treasuryData}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isDraining ? "#f43f5e" : "#10b981"} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={isDraining ? "#f43f5e" : "#10b981"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                            <XAxis dataKey="t" stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(val) => `W${val}`} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                formatter={(val: number) => [`$${val.toLocaleString()}`, 'Balance']}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey={useBurnMetric ? "cumulativeBurn" : "balance"}
                                name={useBurnMetric ? "Cumulative Burn ($)" : "Treasury Balance ($)"}
                                stroke={useBurnMetric ? "#10b981" : (isDraining ? "#f43f5e" : "#10b981")}
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                            />
                            {useBurnMetric && (
                                <Area
                                    type="monotone"
                                    dataKey="mint"
                                    name="Weekly Mint ($)"
                                    stroke="#f59e0b"
                                    fillOpacity={0}
                                />
                            )}
                            {useBurnMetric && (
                                <Area
                                    type="monotone"
                                    dataKey="burn"
                                    name="Weekly Burn ($)"
                                    stroke="#10b981"
                                    fillOpacity={0}
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

        </div>
    );
};
