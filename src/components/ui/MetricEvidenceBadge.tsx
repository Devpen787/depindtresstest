import React from 'react';
import {
    MetricEvidence,
    REPRO_LABEL,
    SOURCE_GRADE_LABEL
} from '../../data/metricEvidence';

import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';

interface MetricEvidenceBadgeProps {
    evidence?: MetricEvidence;
    compact?: boolean;
    variant?: 'pill' | 'icon'; // [NEW] variant
}

const gradeClass: Record<MetricEvidence['sourceGrade'], string> = {
    primary: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    secondary: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    proxy: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    interpolated: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const reproClass: Record<MetricEvidence['reproducibilityStatus'], string> = {
    runnable: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    not_runnable: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};

export const MetricEvidenceBadge: React.FC<MetricEvidenceBadgeProps> = ({ evidence, compact = false, variant = 'pill' }) => {
    if (!evidence) return null;

    const tooltip = [
        `Metric: ${evidence.metricId}`,
        `Grade: ${SOURCE_GRADE_LABEL[evidence.sourceGrade]}`,
        `Reproducibility: ${REPRO_LABEL[evidence.reproducibilityStatus]}`,
        `Source: ${evidence.sourceUrlOrQueryId}`,
        `Window: ${evidence.timeWindow}`,
        evidence.extractionTimestampUtc ? `Extracted: ${evidence.extractionTimestampUtc}` : 'Extracted: n/a',
        evidence.notes ? `Notes: ${evidence.notes}` : '',
    ]
        .filter(Boolean)
        .join('\n');

    // [NEW] Icon Variant Logic
    if (variant === 'icon') {
        let Icon = Shield;
        let colorClass = 'text-slate-500 hover:text-slate-300';

        if (evidence.sourceGrade === 'primary') {
            Icon = ShieldCheck;
            colorClass = 'text-emerald-500/50 hover:text-emerald-400';
        } else if (evidence.sourceGrade === 'interpolated') {
            Icon = ShieldAlert;
            colorClass = 'text-rose-500/50 hover:text-rose-400';
        } else {
            Icon = ShieldQuestion;
            colorClass = 'text-amber-500/50 hover:text-amber-400';
        }

        return (
            <div className={`cursor-help transition-colors ${colorClass}`} title={tooltip}>
                <Icon size={14} />
            </div>
        );
    }

    const baseTextClass = compact ? 'text-[8px]' : 'text-[9px]';
    const basePadClass = compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5';

    return (
        <div className="inline-flex items-center gap-1 cursor-help" title={tooltip}>
            <span className={`${basePadClass} ${baseTextClass} border rounded font-semibold uppercase tracking-wide ${gradeClass[evidence.sourceGrade]}`}>
                {SOURCE_GRADE_LABEL[evidence.sourceGrade]}
            </span>
            <span className={`${basePadClass} ${baseTextClass} border rounded font-semibold uppercase tracking-wide ${reproClass[evidence.reproducibilityStatus]}`}>
                {REPRO_LABEL[evidence.reproducibilityStatus]}
            </span>
        </div>
    );
};

export default MetricEvidenceBadge;
