import React, { useState, useMemo } from 'react';
import { BarChart3, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Loader2 } from 'lucide-react';
import { performWelchTTest, TTestResult } from '../../utils/statistics';

interface ScenarioComparisonProps {
    baselineResults: number[];  // Array of final metric values from baseline runs
    scenarioResults: number[];  // Array of final metric values from scenario runs
    baselineName: string;
    scenarioName: string;
    metricName: string;
    metricUnit?: string;
}

export const ScenarioComparisonPanel: React.FC<ScenarioComparisonProps> = ({
    baselineResults,
    scenarioResults,
    baselineName,
    scenarioName,
    metricName,
    metricUnit = ''
}) => {
    const comparison = useMemo(() => {
        if (baselineResults.length < 2 || scenarioResults.length < 2) {
            return null;
        }
        return performWelchTTest(baselineResults, scenarioResults);
    }, [baselineResults, scenarioResults]);

    if (!comparison) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-500 text-sm">Insufficient data for comparison (need at least 2 samples each).</p>
            </div>
        );
    }

    const baselineMean = baselineResults.reduce((a, b) => a + b, 0) / baselineResults.length;
    const scenarioMean = scenarioResults.reduce((a, b) => a + b, 0) / scenarioResults.length;
    const percentChange = baselineMean !== 0 ? ((scenarioMean - baselineMean) / Math.abs(baselineMean)) * 100 : 0;
    const isWorse = scenarioMean < baselineMean;

    const getEffectColor = (effect: string) => {
        switch (effect) {
            case 'large': return 'text-rose-400 bg-rose-500/10';
            case 'medium': return 'text-amber-400 bg-amber-500/10';
            case 'small': return 'text-yellow-400 bg-yellow-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Scenario Comparison</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getEffectColor(comparison.effectInterpretation)}`}>
                    {comparison.effectInterpretation} effect
                </span>
            </div>

            {/* Comparison Header */}
            <div className="grid grid-cols-3 gap-4 text-center border-b border-slate-800 pb-4">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Baseline</p>
                    <p className="text-lg font-bold text-emerald-400">{baselineName}</p>
                    <p className="text-sm text-slate-400">{baselineMean.toFixed(2)} {metricUnit}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <span className="text-slate-600">vs</span>
                    {isWorse ? (
                        <TrendingDown size={20} className="text-rose-400" />
                    ) : (
                        <TrendingUp size={20} className="text-emerald-400" />
                    )}
                    <span className={`text-sm font-bold ${isWorse ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
                    </span>
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Scenario</p>
                    <p className="text-lg font-bold text-amber-400">{scenarioName}</p>
                    <p className="text-sm text-slate-400">{scenarioMean.toFixed(2)} {metricUnit}</p>
                </div>
            </div>

            {/* Statistical Results */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Metric</span>
                    <span className="text-xs text-slate-300 font-medium">{metricName}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">p-value</span>
                    <span className={`text-xs font-mono ${comparison.pValue < 0.05 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {comparison.pValue < 0.001 ? '< 0.001' : comparison.pValue.toFixed(4)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Effect Size (Cohen's d)</span>
                    <span className="text-xs font-mono text-slate-300">{comparison.effectSize.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">t-statistic</span>
                    <span className="text-xs font-mono text-slate-400">{comparison.tStatistic.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Degrees of Freedom</span>
                    <span className="text-xs font-mono text-slate-400">{comparison.degreesOfFreedom.toFixed(1)}</span>
                </div>
            </div>

            {/* Verdict */}
            <div className={`rounded-lg p-3 flex items-start gap-3 ${comparison.significant ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800 border border-slate-700'}`}>
                {comparison.significant ? (
                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                    <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                )}
                <div>
                    <p className={`text-xs font-bold ${comparison.significant ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {comparison.significant ? 'Statistically Significant' : 'Not Statistically Significant'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                        {comparison.significant
                            ? `The difference between scenarios is unlikely due to chance (p < 0.05). The effect is ${comparison.effectInterpretation}.`
                            : `The difference may be due to random variation (p ≥ 0.05). Consider increasing nSims or the effect may be negligible.`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScenarioComparisonPanel;
