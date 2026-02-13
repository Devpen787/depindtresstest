import React, { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { HISTORICAL_EVENTS, HistoricalDataPoint } from '../../data/historical_events';
import { LegacyAggregateResult as AggregateResult } from '../../model/legacy/engine';
import { ArrowRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import MetricEvidenceBadge from '../ui/MetricEvidenceBadge';
import { getMetricEvidence } from '../../data/metricEvidence';

interface ResilienceScorecardProps {
    simulationResults: AggregateResult[];
    viewModel: any; // Using explicit types would be better but keeping it simple for integration
}

export const ResilienceScorecard: React.FC<ResilienceScorecardProps> = ({
    simulationResults,
    viewModel
}) => {
    const [selectedEventId, setSelectedEventId] = useState<string>(HISTORICAL_EVENTS[0].id);

    const historicalData = useMemo(() => {
        return viewModel.getHistoricalOverlay(selectedEventId);
    }, [selectedEventId, viewModel]);

    // Normalize data for comparison (Index 100 at t=0)
    const chartData = useMemo(() => {
        if (!simulationResults || simulationResults.length === 0) return [];

        const simStartPrice = simulationResults[0]?.price.mean || 1;
        const simStartNodes = simulationResults[0]?.providers.mean || 1;

        const histStartPrice = historicalData?.[0]?.price || 1;
        const histStartNodes = historicalData?.[0]?.activeNodes || 1;

        // Map up to 52 weeks
        return Array.from({ length: 52 }).map((_, i) => {
            const simPoint = simulationResults[i];
            const histPoint = historicalData?.[i];

            return {
                week: i,
                // Simulation (Normalized)
                simPrice: simPoint ? (simPoint.price.mean / simStartPrice) * 100 : null,
                simNodes: simPoint ? (simPoint.providers.mean / simStartNodes) * 100 : null,

                // Historical (Normalized)
                histPrice: histPoint ? (histPoint.price / histStartPrice) * 100 : null,
                histNodes: histPoint ? (histPoint.activeNodes / histStartNodes) * 100 : null,
            };
        });
    }, [simulationResults, historicalData]);

    const currentEvent = HISTORICAL_EVENTS.find(e => e.id === selectedEventId);

    // Diagnostics Logic (Simplified)
    const diagnostics = useMemo(() => {
        // 1. Decoupling Check: Do nodes grow while price crashes?
        // Check correlation or just end state
        const lastSim = simulationResults[simulationResults.length - 1];
        const startSim = simulationResults[0];

        const priceDrop = lastSim && startSim ? (lastSim.price.mean < startSim.price.mean * 0.8) : false;
        const nodeGrowth = lastSim && startSim ? (lastSim.providers.mean > startSim.providers.mean * 1.1) : false;

        const decouplingRisk = priceDrop && nodeGrowth; // Nodes growing despite price crash = Decoupling/Bubble or Utility? 
        // Framework says: Reward-Demand Decoupling is High Emissions + Low Usage. 
        // Let's check Burn-to-Mint.
        const burnToMint = lastSim && lastSim.minted.mean > 0
            ? (lastSim.burned.mean * lastSim.price.mean) / (lastSim.minted.mean * lastSim.price.mean)
            : 0;

        return [
            {
                id: 'decoupling',
                name: 'Reward-Demand Decoupling',
                status: burnToMint > 0.5 ? 'Pass' : 'Fail', // >50% burn coverage is decent for early stage
                risk: burnToMint < 0.2 ? 'Critical' : burnToMint < 0.8 ? 'Moderate' : 'Low',
                desc: 'Ratio of Burned Revenue to Minted Rewards'
            },
            {
                id: 'liquidity',
                name: 'Liquidity Resilience',
                status: priceDrop ? (lastSim.churnCount.mean < 100 ? 'Pass' : 'Fail') : 'N/A', // If price drops, check churn
                risk: priceDrop && lastSim.churnCount.mean > 500 ? 'High' : 'Low',
                desc: 'Provider retention during price drawdowns'
            }
        ];
    }, [simulationResults]);

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Empirical Resilience Scorecard
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            BACKTEST
                        </span>
                        <MetricEvidenceBadge evidence={getMetricEvidence('historical_overlay_reference')} compact />
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Compare your simulation against historical DePIN stress events.
                    </p>
                    <p className="text-[11px] text-amber-400/80 mt-1">
                        Historical overlays are standardized reference curves (deterministic synthetic data), not raw on-chain exports.
                    </p>
                </div>

                {/* Event Selector */}
                <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {HISTORICAL_EVENTS.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Section */}
                <div className="lg:col-span-2 h-80 bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-400">Response Analysis (Normalized Index = 100)</span>
                        <div className="flex gap-4 text-[10px]">
                            <span className="flex items-center gap-1 text-indigo-400"><div className="w-2 h-0.5 bg-indigo-400"></div> Sim Price</span>
                            <span className="flex items-center gap-1 text-slate-500"><div className="w-2 h-0.5 bg-slate-500 border-dashed border-b"></div> {currentEvent?.name.split(' ')[0]} Price</span>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="week" stroke="#475569" fontSize={10} tickFormatter={(v) => `W${v}`} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: '12px' }}
                            />
                            {/* Simulation Lines */}
                            <Line type="monotone" dataKey="simPrice" stroke="#818cf8" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="simNodes" stroke="#34d399" strokeWidth={2} dot={false} />

                            {/* Historical Ghost Lines */}
                            <Line type="monotone" dataKey="histPrice" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                            <Line type="monotone" dataKey="histNodes" stroke="#64748b" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Diagnostics Matrix */}
                <div className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <h4 className="text-xs font-bold text-slate-300 uppercase mb-3">Diagnostic Matrix</h4>
                        <div className="space-y-3">
                            {diagnostics.map(d => (
                                <div key={d.id} className="flex flex-col gap-1 p-2 rounded bg-slate-900/50 border border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-200 font-medium">{d.name}</span>
                                        {d.status === 'Pass' ?
                                            <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                                            d.status === 'N/A' ? <span className="text-[10px] text-slate-500">N/A</span> :
                                                <XCircle className="w-4 h-4 text-rose-500" />
                                        }
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-slate-500">{d.desc}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${d.risk === 'Low' ? 'bg-emerald-500/20 text-emerald-400' :
                                                d.risk === 'Moderate' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-rose-500/20 text-rose-400'
                                            }`}>
                                            {d.risk} Risk
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded text-xs text-blue-200">
                            <strong>Thesis Insight:</strong> {currentEvent?.description}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
