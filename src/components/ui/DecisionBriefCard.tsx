import React from 'react';
import { Download } from 'lucide-react';
import type { DecisionBriefPayload } from '../../types/decisionBrief';
import { GUARDRAIL_BAND_LABELS } from '../../constants/guardrails';
import { SOURCE_GRADE_LABEL, REPRO_LABEL } from '../../data/metricEvidence';

interface DecisionBriefCardProps {
    brief: DecisionBriefPayload;
    onExport?: () => void;
    title?: string;
    dataCy?: string;
}

const bandClass: Record<DecisionBriefPayload['guardrailBand'], string> = {
    healthy: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    watchlist: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    intervention: 'bg-rose-500/10 border-rose-500/30 text-rose-300'
};

const confidenceClass: Record<DecisionBriefPayload['confidenceLabel'], string> = {
    High: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    Medium: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    Low: 'bg-rose-500/10 border-rose-500/30 text-rose-300'
};

const freshnessClass: Record<DecisionBriefPayload['freshness']['label'], string> = {
    Fresh: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    Recent: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    Stale: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    Unknown: 'bg-slate-700/80 border-slate-600 text-slate-300'
};

const evidenceStatusClass: Record<DecisionBriefPayload['evidenceStatus'], string> = {
    complete: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    partial: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    missing: 'bg-rose-500/10 border-rose-500/30 text-rose-300'
};

export const DecisionBriefCard: React.FC<DecisionBriefCardProps> = ({
    brief,
    onExport,
    title = 'Decision Brief',
    dataCy = 'decision-brief'
}) => {
    return (
        <section data-cy={dataCy} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-200">{title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        {brief.context.protocolName} • {brief.context.scenarioName} • {brief.context.modelVersion}
                    </p>
                    <p data-cy={`${dataCy}-repro`} className="text-[10px] text-slate-500 mt-1">
                        Run {brief.runId} • {new Date(brief.reproducibility.runTimestampUtc).toLocaleString()} • Hash #{brief.reproducibility.paramsHash}
                    </p>
                </div>
                {onExport ? (
                    <button
                        onClick={onExport}
                        data-cy={`${dataCy}-export`}
                        className="self-start inline-flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                    >
                        <Download size={12} />
                        Export Decision Brief
                    </button>
                ) : (
                    <p data-cy={`${dataCy}-export-help`} className="text-[11px] text-slate-500">Use the header Export Brief action to download both Markdown and JSON versions.</p>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide ${bandClass[brief.guardrailBand]}`}>
                    {GUARDRAIL_BAND_LABELS[brief.guardrailBand]}
                </span>
                <span className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide ${confidenceClass[brief.confidenceLabel]}`}>
                    Confidence {Math.round(brief.confidenceScore * 100)}% ({brief.confidenceLabel})
                </span>
                <span className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide ${freshnessClass[brief.freshness.label]}`}>
                    Freshness {brief.freshness.label}
                </span>
                <span className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide ${evidenceStatusClass[brief.evidenceStatus]}`}>
                    Evidence {brief.evidenceStatus}
                </span>
                {brief.freshness.asOfUtc && (
                    <span className="text-[10px] text-slate-500">
                        as of {new Date(brief.freshness.asOfUtc).toLocaleString()}
                    </span>
                )}
            </div>

            {brief.policyNotes.length > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                    {brief.policyNotes.map((note, idx) => (
                        <p key={`${note}-${idx}`} className="text-[11px] text-amber-200">
                            {note}
                        </p>
                    ))}
                </div>
            )}

            <p className="text-sm text-slate-200 leading-relaxed">{brief.summary}</p>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Top Drivers</h4>
                    {brief.drivers.map((driver) => (
                        <div key={driver.metricId} className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">
                            <p className="text-xs font-semibold text-white">{driver.label}: {driver.value}</p>
                            <p className="text-[11px] text-slate-400 mt-1">Trigger: {driver.threshold}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Actions</h4>
                    {brief.actions.map((item, idx) => (
                        <div key={`${item.action}-${idx}`} className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">
                            <p className="text-xs font-semibold text-white">{item.action}</p>
                            <p className="text-[11px] text-slate-400 mt-1">Owner: {item.ownerRole}</p>
                            <p className="text-[11px] text-slate-400">Trigger: {item.trigger}</p>
                            <p className="text-[11px] text-slate-400">Expected effect: {item.expectedEffect}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Evidence Coverage</p>
                <div className="mt-2 grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {brief.evidence.map((item) => (
                        <div key={item.metricId} className="text-[11px] text-slate-400">
                            <span className="text-slate-200 font-semibold">{item.metricId}</span>
                            <span className="mx-1">•</span>
                            <span>{SOURCE_GRADE_LABEL[item.sourceGrade]}</span>
                            <span className="mx-1">•</span>
                            <span>{REPRO_LABEL[item.reproducibilityStatus]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Reproducibility</p>
                <p className="text-[11px] text-slate-400 mt-1">
                    Export includes full parameter snapshot for re-running this exact brief.
                </p>
                {Object.entries(brief.kpiOwnerVersions).length > 0 && (
                    <p className="text-[11px] text-slate-500 mt-2">
                        Owner math versions:{' '}
                        {Object.entries(brief.kpiOwnerVersions)
                            .map(([family, details]) => `${family}=${details.version}`)
                            .join(' • ')}
                    </p>
                )}
            </div>
        </section>
    );
};

export default DecisionBriefCard;
