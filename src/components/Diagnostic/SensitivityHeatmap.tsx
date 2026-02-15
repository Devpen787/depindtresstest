import React, { useState } from 'react';
import { Activity, Play, RefreshCw } from 'lucide-react';
import { runSimulation } from '../../model/simulation';
import { DEFAULT_PARAMS } from '../../model/params';
import { SimulationParams } from '../../model/types';
import {
    buildSensitivitySweepGrid,
    calculateBurnPctStep,
    calculateDisplayMintForRow,
    classifySensitivityHeatmapBand
} from '../../audit/diagnosticViewMath';

interface HeatmapCell {
    x: number; // Burn Rate
    y: number; // Mint Rate
    score: number; // Solvency Score
}

export const SensitivityHeatmap: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<HeatmapCell[]>([]);
    const [verdict, setVerdict] = useState<string | null>(null);

    const runSweep = async () => {
        setLoading(true);
        // Async to let UI render loader
        setTimeout(() => {
            const results: HeatmapCell[] = [];
            const xSteps = 5;
            const ySteps = 5;
            const minMint = 1_000_000;
            const maxMint = 10_000_000;

            // X-Axis: Burn Rate (0% to 100%)
            // Y-Axis: Max Mint (1M to 10M)
            const sweepPoints = buildSensitivitySweepGrid(xSteps, ySteps, minMint, maxMint);

            sweepPoints.forEach(({ burnPct, maxMintWeekly }) => {
                const params: SimulationParams = {
                    ...DEFAULT_PARAMS,
                    nSims: 5, // Low sample size for speed
                    burnPct,
                    maxMintWeekly,
                    T: 52 // 1 year
                };

                const timeSeries = runSimulation(params);
                const finalResult = timeSeries[timeSeries.length - 1];

                results.push({
                    x: burnPct,
                    y: maxMintWeekly,
                    score: finalResult ? finalResult.solvencyScore.mean : 0
                });
            });
            setData(results);
            setLoading(false);
            setVerdict("Heatmap Generated: High emission + Low burn = Insolvency Zone (Red).");
        }, 100);
    };

    // Helper to get color
    const getColor = (score: number) => {
        const band = classifySensitivityHeatmapBand(score);
        if (band === 'red') return 'bg-red-500/80';
        if (band === 'yellow') return 'bg-yellow-500/80';
        return 'bg-emerald-500/80';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white mb-2">II. Protocol Levers Heatmap</h3>
                    <p className="text-sm text-slate-400">
                        2D Sensitivity Analysis: Burn Rate (X) vs Emission Cap (Y).
                    </p>
                </div>
                <button
                    onClick={runSweep}
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50"
                >
                    {loading ? <RefreshCw className="animate-spin" size={14} /> : <Play size={14} />}
                    Run Sweep
                </button>
            </div>

            {data.length === 0 ? (
                <div className="h-64 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center text-slate-600 text-sm">
                    Click "Run Sweep" to generate heatmap layer.
                </div>
            ) : (
                <div className="relative bg-slate-900 rounded-xl p-6 border border-slate-800">
                    <div className="flex">
                        {/* Y-Axis Container */}
                        <div className="flex flex-col items-center justify-center mr-2">
                            <div className="-rotate-90 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap mb-2">
                                Emission Cap
                            </div>
                        </div>

                        {/* Y-Axis Labels */}
                        <div className="flex flex-col justify-between h-64 text-[10px] text-slate-400 font-mono pr-2 text-right pt-2 pb-2">
                            {[...Array(5)].map((_, row) => {
                                const val = calculateDisplayMintForRow(row, 5, 1_000_000, 10_000_000);
                                return <span key={row}>{(val / 1_000_000).toFixed(1)}M</span>;
                            })}
                        </div>

                        {/* Heatmap Grid */}
                        <div className="flex-1">
                            <div className="grid grid-cols-5 gap-1 h-64 w-full">
                                {[...Array(5)].map((_, row) => {
                                    // Row loop
                                    return [...Array(5)].map((_, col) => {
                                        // Col loop
                                        const burnPct = calculateBurnPctStep(col, 5);
                                        const maxMint = calculateDisplayMintForRow(row, 5, 1_000_000, 10_000_000);
                                        // Fuzzy match because floats
                                        const cell = data.find(d => Math.abs(d.x - burnPct) < 0.01 && Math.abs(d.y - maxMint) < 1000);
                                        const scorePct = cell ? cell.score * 100 : 0;

                                        return (
                                            <div
                                                key={`${row}-${col}`}
                                                className={`w-full h-full rounded-sm flex items-center justify-center text-[10px] font-bold text-white/90 cursor-help transition-all hover:scale-105 hover:ring-2 ring-white/20 ${cell ? getColor(scorePct) : 'bg-slate-800'}`}
                                                title={`Burn: ${Math.round(burnPct * 100)}%, Mint: ${(maxMint / 1e6).toFixed(1)}M, Coverage: ${scorePct.toFixed(0)}%`}
                                            >
                                                {cell ? (scorePct > 999 ? '>999' : scorePct.toFixed(0)) : '-'}%
                                            </div>
                                        );
                                    });
                                })}
                            </div>

                            {/* X-Axis Labels */}
                            <div className="grid grid-cols-5 text-[10px] text-slate-600 font-mono mt-2 text-center">
                                <span>0%</span>
                                <span>25%</span>
                                <span>50%</span>
                                <span>75%</span>
                                <span>100%</span>
                            </div>
                            <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                Burn Rate (%)
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mt-6 border-t border-slate-800 pt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500/80 rounded-sm"></div>
                            <span className="text-[10px] text-slate-400">Inefficient (&lt;40%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500/80 rounded-sm"></div>
                            <span className="text-[10px] text-slate-400">Neutral (40-70%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500/80 rounded-sm"></div>
                            <span className="text-[10px] text-slate-400">Deflationary (&gt;70%)</span>
                        </div>
                    </div>
                </div>
            )}

            {verdict && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-center">
                    <p className="text-xs text-indigo-300 font-bold">{verdict}</p>
                </div>
            )}
        </div>
    );
};
