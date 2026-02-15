import React, { useMemo } from 'react';
import { SensitivityTornadoChart } from '../../../Diagnostic/SensitivityTornadoChart';
import { AggregateResult } from '../../../../model/types';
import { Activity, Info, ExternalLink } from 'lucide-react';
import { calculateRiskMetrics } from '../../../../audit/decisionTreeViewMath';
import { ChartContextHeader } from '../../../ui/ChartContextHeader';
import {
    classifyTailRiskBand,
    GUARDRAIL_BAND_LABELS,
    GUARDRAIL_COPY
} from '../../../../constants/guardrails';

interface RiskStabilityViewProps {
    data: AggregateResult[];
    onRunAnalysis: () => any[];
    onOpenSandbox: () => void;
}

export const RiskStabilityView: React.FC<RiskStabilityViewProps> = ({ data, onRunAnalysis, onOpenSandbox }) => {
    if (!data || data.length === 0) {
        return (
            <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-slate-900 rounded-xl"></div>
                    <div className="h-32 bg-slate-900 rounded-xl"></div>
                    <div className="h-32 bg-slate-900 rounded-xl"></div>
                </div>
                <div className="h-96 bg-slate-900 rounded-xl"></div>
            </div>
        );
    }

    const riskMetrics = useMemo(() => {
        return calculateRiskMetrics(data);
    }, [data]);

    const riskBand = classifyTailRiskBand(riskMetrics.tailRiskScore);
    const riskLevelClass = riskBand === 'healthy'
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : riskBand === 'watchlist'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    const p10FloorLabel = (riskMetrics.p10FloorRatio * 100) < 0.1
        ? '<0.1%'
        : `${(riskMetrics.p10FloorRatio * 100).toFixed(1)}%`;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group cursor-help">
                    <div className="absolute top-4 right-4 text-slate-600 group-hover:text-slate-400 transition-colors">
                        <Info size={16} />
                    </div>
                    <div className="absolute left-6 bottom-full mb-2 w-56 p-3 bg-slate-800 text-xs text-slate-300 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <strong className="text-white block mb-1">Max Drawdown</strong>
                        Largest peak-to-trough decline in the mean simulated price path.
                    </div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Max Drawdown</h3>
                    <div className="text-4xl font-mono font-bold text-rose-400">-{riskMetrics.drawdown.toFixed(1)}%</div>
                    <p className="text-xs text-slate-500 mt-2">Peak-to-trough downside stress</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Price Volatility</h3>
                    <div className="text-4xl font-mono font-bold text-amber-400">±{riskMetrics.volatility.toFixed(1)}%</div>
                    <p className="text-xs text-slate-500 mt-2">Annualized log-return volatility</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group cursor-help">
                    <div className="absolute top-4 right-4 text-slate-600 group-hover:text-slate-400 transition-colors">
                        <Info size={16} />
                    </div>
                    <div className="absolute left-6 bottom-full mb-2 w-60 p-3 bg-slate-800 text-xs text-slate-300 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <strong className="text-white block mb-1">Tail Risk Score</strong>
                        Composite lower-tail risk based on p10 floor degradation, downside spread, and drawdown severity.
                    </div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Tail Risk Score</h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${riskLevelClass}`}>
                        <div className={`w-2 h-2 rounded-full ${riskBand === 'healthy' ? 'bg-emerald-500' : riskBand === 'watchlist' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        {GUARDRAIL_BAND_LABELS[riskBand]} ({riskMetrics.tailRiskScore}/100)
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Insolvency exposure: {(riskMetrics.insolvencyRate * 100).toFixed(0)}% • P10 floor: {p10FloorLabel} of start price
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Final solvency score: {riskMetrics.finalSolvency.toFixed(2)}x</p>
                    <button
                        onClick={onOpenSandbox}
                        className="mt-3 text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                        <ExternalLink size={12} /> Open Sandbox Inputs
                    </button>
                </div>
            </div>

            <ChartContextHeader
                title="How To Read Tail Risk"
                what="This branch summarizes downside severity: drawdown, volatility, insolvency exposure, and lower-tail floor behavior."
                why="Tail risk score blends p10 floor degradation, downside spread, and drawdown. Sensitivity then shows which assumptions drive payback risk."
                reference={GUARDRAIL_COPY.tailRiskReference}
                nextQuestion="Which assumption change reduces tail risk most with the smallest tradeoff to growth?"
            />

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-indigo-500" size={24} />
                        Sensitivity Analysis
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Tornado sweep of key assumptions and their impact on provider payback risk.
                    </p>
                </div>
                {onRunAnalysis ? (
                    <SensitivityTornadoChart onRunAnalysis={onRunAnalysis} />
                ) : (
                    <div className="p-10 text-center text-slate-500">Analysis engine not connected</div>
                )}
            </div>
        </div>
    );
};
