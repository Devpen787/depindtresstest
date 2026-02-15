import React from 'react';
import { Calculator, Compass, Flag, HelpCircle } from 'lucide-react';

type HeaderVariant = 'dark' | 'light';

interface ChartContextHeaderProps {
    title: string;
    what: string;
    why: string;
    reference: string;
    nextQuestion: string;
    className?: string;
    variant?: HeaderVariant;
}

export const ChartContextHeader: React.FC<ChartContextHeaderProps> = ({
    title,
    what,
    why,
    reference,
    nextQuestion,
    className = '',
    variant = 'dark'
}) => {
    const containerClass = variant === 'light'
        ? 'border-slate-200 bg-white'
        : 'border-slate-800 bg-slate-900/40';
    const titleClass = variant === 'light' ? 'text-slate-900' : 'text-white';
    const panelClass = variant === 'light'
        ? 'border-slate-200 bg-slate-50'
        : 'border-slate-800 bg-slate-900/60';
    const bodyClass = variant === 'light' ? 'text-slate-700' : 'text-slate-300';
    const whatClass = variant === 'light' ? 'text-cyan-700' : 'text-cyan-400';
    const whyClass = variant === 'light' ? 'text-indigo-700' : 'text-indigo-400';
    const referenceClass = variant === 'light' ? 'text-amber-700' : 'text-amber-400';
    const questionClass = variant === 'light' ? 'text-emerald-700' : 'text-emerald-400';

    return (
        <div className={`rounded-xl border p-3 ${containerClass} ${className}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${titleClass}`}>{title}</h4>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className={`rounded-lg border p-2 ${panelClass}`}>
                    <div className={`mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${whatClass}`}>
                        <Compass size={11} />
                        What You Are Seeing
                    </div>
                    <p className={`text-[11px] ${bodyClass}`}>{what}</p>
                </div>
                <div className={`rounded-lg border p-2 ${panelClass}`}>
                    <div className={`mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${whyClass}`}>
                        <Calculator size={11} />
                        Why The Number Moves
                    </div>
                    <p className={`text-[11px] ${bodyClass}`}>{why}</p>
                </div>
                <div className={`rounded-lg border p-2 ${panelClass}`}>
                    <div className={`mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${referenceClass}`}>
                        <Flag size={11} />
                        Reference Point
                    </div>
                    <p className={`text-[11px] ${bodyClass}`}>{reference}</p>
                </div>
                <div className={`rounded-lg border p-2 ${panelClass}`}>
                    <div className={`mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${questionClass}`}>
                        <HelpCircle size={11} />
                        Next Question
                    </div>
                    <p className={`text-[11px] ${bodyClass}`}>{nextQuestion}</p>
                </div>
            </div>
        </div>
    );
};
