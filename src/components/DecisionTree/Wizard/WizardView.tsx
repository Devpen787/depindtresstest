import React from 'react';
import { Activity, Zap, TrendingUp, ShieldAlert, ChevronRight } from 'lucide-react';
import { DecisionPromptCard } from '../../ui/DecisionPromptCard';
import MetricEvidenceBadge from '../../ui/MetricEvidenceBadge';
import MetricEvidenceLegend from '../../ui/MetricEvidenceLegend';
import { getMetricEvidence } from '../../../data/metricEvidence';
import {
    PAYBACK_GUARDRAILS,
    RESILIENCE_GUARDRAILS,
    UTILIZATION_GUARDRAILS
} from '../../../constants/guardrails';

interface WizardViewProps {
    onSelectBranch: (branch: string) => void;
    metrics: {
        solvencyScore: number;
        solvencyFloor: number;
        paybackMonths: number;
        networkUtilization: number;
        resilienceScore: number;
        maxDrawdown: number;
        avgChurnRate: number;
        insolvencyWeeks: number;
    };
    percentiles?: {
        solvency: number;
        payback: number;
        utilization: number;
        resilience: number;
        peerCount: number;
    } | null;
}

export const WizardView: React.FC<WizardViewProps> = ({ onSelectBranch, metrics, percentiles }) => {
    const [scoreMode, setScoreMode] = React.useState<'absolute' | 'percentile'>('absolute');

    const paybackLabel = metrics.paybackMonths > 120
        ? '> 10y'
        : metrics.paybackMonths < 0.1
            ? '< 0.1 mo'
            : `${metrics.paybackMonths.toFixed(1)} mo`;
    const solvencyFloorLabel = metrics.solvencyFloor < 0.01 ? '< 0.01x' : `${metrics.solvencyFloor.toFixed(2)}x`;
    const hasPercentiles = Boolean(percentiles && percentiles.peerCount > 1);
    const showPercentiles = hasPercentiles && scoreMode === 'percentile';

    const percentileClass = (value: number) => value >= 70
        ? 'text-emerald-400'
        : value >= 40
            ? 'text-amber-400'
            : 'text-rose-400';

    const solvencyDisplayValue = showPercentiles ? `P${percentiles!.solvency}` : `${metrics.solvencyScore.toFixed(2)}x`;
    const solvencyDisplayClass = showPercentiles
        ? percentileClass(percentiles!.solvency)
        : (metrics.solvencyScore < 1 ? 'text-amber-500' : 'text-emerald-500');

    const paybackDisplayValue = showPercentiles ? `P${percentiles!.payback}` : paybackLabel;
    const paybackDisplayClass = showPercentiles
        ? percentileClass(percentiles!.payback)
        : (metrics.paybackMonths > PAYBACK_GUARDRAILS.healthyMaxMonths ? 'text-rose-500' : 'text-emerald-500');

    const utilizationDisplayValue = showPercentiles ? `P${percentiles!.utilization}` : `${metrics.networkUtilization.toFixed(1)}%`;
    const utilizationClass = showPercentiles
        ? percentileClass(percentiles!.utilization)
        : (metrics.networkUtilization >= UTILIZATION_GUARDRAILS.healthyMinPct
            ? 'text-cyan-400'
            : metrics.networkUtilization >= UTILIZATION_GUARDRAILS.watchlistMinPct
                ? 'text-amber-400'
                : 'text-rose-400');

    const resilienceDisplayValue = showPercentiles ? `P${percentiles!.resilience}` : `${metrics.resilienceScore}/100`;
    const resilienceDisplayClass = showPercentiles
        ? percentileClass(percentiles!.resilience)
        : (metrics.resilienceScore < RESILIENCE_GUARDRAILS.watchlistMinScore
            ? 'text-rose-500'
            : metrics.resilienceScore < RESILIENCE_GUARDRAILS.healthyMinScore
                ? 'text-amber-500'
                : 'text-emerald-500');

    const wizardTone = metrics.resilienceScore < RESILIENCE_GUARDRAILS.watchlistMinScore
        ? 'critical'
        : metrics.resilienceScore < RESILIENCE_GUARDRAILS.healthyMinScore
            ? 'caution'
            : 'healthy';

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 flex flex-col items-center">
            <div className="max-w-5xl w-full space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        What is your <span className="text-indigo-500">Validation Goal</span>?
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Select a diagnostic path to audit the protocol's mechanics.
                        All paths simulate stress conditions (market crashes, vampire attacks).
                    </p>
                    {hasPercentiles && (
                        <div className="flex items-center justify-center gap-2">
                            <div className="inline-flex bg-slate-900 border border-slate-800 rounded-lg p-1">
                                <button
                                    onClick={() => setScoreMode('absolute')}
                                    className={`px-3 py-1 text-xs font-bold rounded ${scoreMode === 'absolute' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Absolute
                                </button>
                                <button
                                    onClick={() => setScoreMode('percentile')}
                                    className={`px-3 py-1 text-xs font-bold rounded ${scoreMode === 'percentile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Percentile
                                </button>
                            </div>
                            <span className="text-xs text-slate-500">Relative to {percentiles!.peerCount} DePINs</span>
                        </div>
                    )}
                </div>

                <DecisionPromptCard
                    title="Decision Tree Storyline"
                    tone={wizardTone}
                    statusLabel="Guardrail Status"
                    statusDetail={`Resilience ${metrics.resilienceScore}/100`}
                    provenance={showPercentiles ? `Percentile mode vs ${percentiles!.peerCount} peers` : 'Absolute mode on current simulation'}
                    decisions={[
                        'Prioritize the branch with the largest risk-adjusted gap first (financial, miner, utility, or tail risk).',
                        'Decide whether to optimize for short-term survivability or long-term utility growth.',
                        'Set explicit threshold triggers for policy changes before running the next scenario.'
                    ]}
                    questions={[
                        `Is the main bottleneck solvency (${metrics.solvencyScore.toFixed(2)}x), payback (${paybackLabel}), or utilization (${metrics.networkUtilization.toFixed(1)}%)?`,
                        `How many insolvency weeks (${metrics.insolvencyWeeks}) are acceptable before governance action?`,
                        'Which branch result would change an executive decision today?'
                    ]}
                />

                <MetricEvidenceLegend />

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* CARD 1: FINANCIAL STABILITY */}
                    <button
                        onClick={() => onSelectBranch('financial')}
                        className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-8 text-left transition-all hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                    >
                        <div className="absolute top-8 right-8 p-3 bg-slate-800 rounded-2xl group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                            <Activity size={24} className="text-slate-500 group-hover:text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Financial Stability</h3>
                        <p className="text-sm text-slate-400 mb-8 pr-12">
                            "Is the protocol solvent?" Audit the burn-to-emission ratio and treasury runway under stress.
                        </p>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Solvency Score</div>
                                    <MetricEvidenceBadge evidence={getMetricEvidence('decision_financial_solvency')} compact />
                                </div>
                                <div className={`text-3xl font-mono font-bold ${solvencyDisplayClass}`}>
                                    {solvencyDisplayValue}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                    {showPercentiles ? `Raw solvency: ${metrics.solvencyScore.toFixed(2)}x • Min: ${solvencyFloorLabel}` : `Min solvency: ${solvencyFloorLabel}`}
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </button>

                    {/* CARD 2: MINER PROFITABILITY */}
                    <button
                        onClick={() => onSelectBranch('miner')}
                        className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-8 text-left transition-all hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
                    >
                        <div className="absolute top-8 right-8 p-3 bg-slate-800 rounded-2xl group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                            <Zap size={24} className="text-slate-500 group-hover:text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Miner Profitability</h3>
                        <p className="text-sm text-slate-400 mb-8 pr-12">
                            "Is it worth mining?" Analyze ROI periods, capitulation triggers, and hardware retention.
                        </p>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payback Period</div>
                                    <MetricEvidenceBadge evidence={getMetricEvidence('decision_miner_payback')} compact />
                                </div>
                                <div className={`text-3xl font-mono font-bold ${paybackDisplayClass}`}>
                                    {paybackDisplayValue}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                    {showPercentiles ? `Raw payback: ${paybackLabel} • Avg churn: ${metrics.avgChurnRate.toFixed(2)}%` : `Avg churn: ${metrics.avgChurnRate.toFixed(2)}% / week`}
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </button>

                    {/* CARD 3: REAL UTILITY */}
                    <button
                        onClick={() => onSelectBranch('utility')}
                        className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-8 text-left transition-all hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1"
                    >
                        <div className="absolute top-8 right-8 p-3 bg-slate-800 rounded-2xl group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                            <TrendingUp size={24} className="text-slate-500 group-hover:text-cyan-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Real Utility</h3>
                        <p className="text-sm text-slate-400 mb-8 pr-12">
                            "Is there real usage?" Measure effective capacity vs demand and network saturated density.
                        </p>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Network Utilization</div>
                                    <MetricEvidenceBadge evidence={getMetricEvidence('decision_utility_utilization')} compact />
                                </div>
                                <div className={`text-3xl font-mono font-bold ${utilizationClass}`}>
                                    {utilizationDisplayValue}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                    {showPercentiles ? `Raw utilization: ${metrics.networkUtilization.toFixed(1)}%` : 'Demand-to-capacity pressure'}
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </button>

                    {/* CARD 4: RISK & STABILITY */}
                    <button
                        onClick={() => onSelectBranch('risk')}
                        className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-8 text-left transition-all hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-1"
                    >
                        <div className="absolute top-8 right-8 p-3 bg-slate-800 rounded-2xl group-hover:bg-rose-500/20 group-hover:text-rose-400 transition-colors">
                            <ShieldAlert size={24} className="text-slate-500 group-hover:text-rose-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">Risk & Stability</h3>
                        <p className="text-sm text-slate-400 mb-8 pr-12">
                            "What kills the network?" Stress test sensitivity to token price, adoption lag, and sell pressure.
                        </p>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resilience Score</div>
                                    <MetricEvidenceBadge evidence={getMetricEvidence('decision_risk_resilience')} compact />
                                </div>
                                <div className={`text-3xl font-mono font-bold ${resilienceDisplayClass}`}>
                                    {resilienceDisplayValue}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                    {showPercentiles ? `Raw resilience: ${metrics.resilienceScore}/100 • Insolvency weeks: ${metrics.insolvencyWeeks}` : `Insolvency weeks: ${metrics.insolvencyWeeks}`}
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </button>

                </div>
            </div>
        </div>
    );
};
