import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, ShieldAlert } from 'lucide-react';

type StatusTone = 'healthy' | 'caution' | 'critical' | 'neutral';
type CardVariant = 'dark' | 'light';

interface DecisionPromptCardProps {
    title: string;
    statusLabel: string;
    statusDetail: string;
    tone?: StatusTone;
    decisions: string[];
    questions: string[];
    provenance?: string;
    className?: string;
    variant?: CardVariant;
}

const DARK_TONE_CLASSES: Record<StatusTone, { badge: string; icon: React.ReactNode }> = {
    healthy: {
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: <CheckCircle2 size={13} className="text-emerald-400" />
    },
    caution: {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        icon: <AlertTriangle size={13} className="text-amber-400" />
    },
    critical: {
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        icon: <ShieldAlert size={13} className="text-rose-400" />
    },
    neutral: {
        badge: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
        icon: <HelpCircle size={13} className="text-slate-300" />
    }
};

const LIGHT_TONE_CLASSES: Record<StatusTone, { badge: string; icon: React.ReactNode }> = {
    healthy: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 size={13} className="text-emerald-700" />
    },
    caution: {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <AlertTriangle size={13} className="text-amber-700" />
    },
    critical: {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <ShieldAlert size={13} className="text-rose-700" />
    },
    neutral: {
        badge: 'bg-slate-100 text-slate-700 border-slate-300',
        icon: <HelpCircle size={13} className="text-slate-700" />
    }
};

export const DecisionPromptCard: React.FC<DecisionPromptCardProps> = ({
    title,
    statusLabel,
    statusDetail,
    tone = 'neutral',
    decisions,
    questions,
    provenance,
    className = '',
    variant = 'dark'
}) => {
    const toneClasses = (variant === 'light' ? LIGHT_TONE_CLASSES : DARK_TONE_CLASSES)[tone];
    const containerClass = variant === 'light'
        ? 'border-slate-200 bg-white'
        : 'border-slate-800 bg-slate-900/60';
    const titleClass = variant === 'light' ? 'text-slate-900' : 'text-white';
    const provenanceClass = variant === 'light' ? 'text-slate-500' : 'text-slate-500';
    const separatorClass = variant === 'light' ? 'text-slate-500' : 'text-slate-300';
    const panelClass = variant === 'light'
        ? 'border-slate-200 bg-slate-50'
        : 'border-slate-800 bg-slate-900/70';
    const itemClass = variant === 'light' ? 'text-slate-700' : 'text-slate-300';
    const decisionsHeadingClass = variant === 'light' ? 'text-indigo-700' : 'text-indigo-300';
    const questionsHeadingClass = variant === 'light' ? 'text-cyan-700' : 'text-cyan-300';

    return (
        <section className={`rounded-xl border p-4 ${containerClass} ${className}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className={`text-sm font-bold ${titleClass}`}>{title}</h3>
                    {provenance && <p className={`mt-1 text-[11px] ${provenanceClass}`}>{provenance}</p>}
                </div>
                <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${toneClasses.badge}`}>
                    {toneClasses.icon}
                    {statusLabel}
                    <span className={separatorClass}>|</span>
                    <span>{statusDetail}</span>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className={`rounded-lg border p-3 ${panelClass}`}>
                    <h4 className={`text-[11px] font-bold uppercase tracking-wide ${decisionsHeadingClass}`}>Decisions To Evaluate</h4>
                    <ul className={`mt-2 space-y-1 text-xs ${itemClass}`}>
                        {decisions.map((item) => (
                            <li key={item}>- {item}</li>
                        ))}
                    </ul>
                </div>
                <div className={`rounded-lg border p-3 ${panelClass}`}>
                    <h4 className={`text-[11px] font-bold uppercase tracking-wide ${questionsHeadingClass}`}>Questions To Ask Next</h4>
                    <ul className={`mt-2 space-y-1 text-xs ${itemClass}`}>
                        {questions.map((item) => (
                            <li key={item}>- {item}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};
