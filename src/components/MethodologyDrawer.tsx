import React from 'react';
import { X, BookOpen, Sigma } from 'lucide-react';
import { DTSE_METRIC_INSIGHTS } from '../data/dtseContent';
import { DTSE_LEARN_CONTENT } from '../data/research';

interface MethodologyDrawerProps {
    mode: 'how-dtse-works' | 'metric-definitions' | null;
    onClose: () => void;
}

const METRIC_ORDER = [
    'solvency_ratio',
    'payback_period',
    'weekly_retention_rate',
    'network_utilization',
    'tail_risk_score',
    'vampire_churn',
] as const;

const METRIC_TITLES: Record<(typeof METRIC_ORDER)[number], string> = {
    solvency_ratio: 'Solvency Ratio',
    payback_period: 'Payback Period',
    weekly_retention_rate: 'Weekly Retention',
    network_utilization: 'Network Utilization',
    tail_risk_score: 'Tail Risk Score',
    vampire_churn: 'Vampire Churn',
};

export const MethodologyDrawer: React.FC<MethodologyDrawerProps> = ({ mode, onClose }) => {
    if (!mode) return null;

    const isMetricMode = mode === 'metric-definitions';
    const headerTitle = isMetricMode ? DTSE_LEARN_CONTENT.metricDefinitions.title : DTSE_LEARN_CONTENT.howItWorks.title;
    const headerEyebrow = isMetricMode ? DTSE_LEARN_CONTENT.metricDefinitions.eyebrow : DTSE_LEARN_CONTENT.howItWorks.eyebrow;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="relative w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-slate-900/95 backdrop-blur border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                            {isMetricMode ? <Sigma size={20} /> : <BookOpen size={20} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{headerTitle}</h2>
                            <p className="text-xs text-slate-400 font-mono uppercase tracking-[0.18em]">{headerEyebrow}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-10">
                    {isMetricMode ? (
                        <section className="space-y-6">
                            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">{DTSE_LEARN_CONTENT.metricDefinitions.eyebrow}</p>
                                <p className="mt-2 text-sm leading-relaxed text-slate-200">{DTSE_LEARN_CONTENT.metricDefinitions.intro}</p>
                                <p className="mt-2 text-sm leading-relaxed text-slate-300">{DTSE_LEARN_CONTENT.metricDefinitions.helper}</p>
                            </div>

                            <div className="space-y-5">
                                {METRIC_ORDER.map((metricId) => {
                                    const metric = DTSE_METRIC_INSIGHTS[metricId];
                                    if (!metric) return null;

                                    return (
                                        <div key={metricId} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80">
                                            <div className="border-b border-slate-800 bg-slate-900/70 p-4">
                                                <h3 className="text-base font-bold text-slate-100">{METRIC_TITLES[metricId]}</h3>
                                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">{metric.target}</p>
                                            </div>
                                            <div className="space-y-4 p-5">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">What it measures</p>
                                                    <p className="mt-1 text-sm leading-relaxed text-slate-200">{metric.definition}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Why DTSE uses it</p>
                                                    <p className="mt-1 text-sm leading-relaxed text-slate-200">{metric.why_relevant}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Decision use</p>
                                                    <p className="mt-1 text-sm leading-relaxed text-slate-200">{metric.decision_use}</p>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3">
                                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Healthy</p>
                                                        <p className="mt-1 text-sm leading-relaxed text-slate-200">{metric.interpretation.healthy}</p>
                                                    </div>
                                                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-3">
                                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">Watchlist</p>
                                                        <p className="mt-1 text-sm leading-relaxed text-slate-200">{metric.interpretation.watchlist}</p>
                                                    </div>
                                                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/8 p-3">
                                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-300">Intervention</p>
                                                        <p className="mt-1 text-sm leading-relaxed text-slate-200">{metric.interpretation.intervention}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ) : (
                        <>
                            <section className="rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">{DTSE_LEARN_CONTENT.howItWorks.eyebrow}</p>
                                <p className="mt-2 text-sm leading-relaxed text-slate-200">{DTSE_LEARN_CONTENT.howItWorks.intro}</p>
                                <p className="mt-2 text-sm leading-relaxed text-slate-300">{DTSE_LEARN_CONTENT.howItWorks.helper}</p>
                            </section>

                            <section className="space-y-5">
                                {DTSE_LEARN_CONTENT.howItWorks.sections.map((section) => (
                                    <div key={section.title} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                                        <h3 className="text-base font-bold text-slate-100">{section.title}</h3>
                                        <div className="mt-3 space-y-3">
                                            {section.body.map((paragraph) => (
                                                <p key={paragraph} className="text-sm leading-relaxed text-slate-300">{paragraph}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
