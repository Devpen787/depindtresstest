import React from 'react';
import { AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';
import type { DTSEFailureSignature } from '../../types/dtse';

interface DTSESignatureStageProps {
  signatures: DTSEFailureSignature[];
}

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'] as const;

const SEVERITY_CONFIG: Record<DTSEFailureSignature['severity'], {
  icon: React.ReactNode;
  bg: string;
  border: string;
  badge: string;
  badgeText: string;
  accent: string;
}> = {
  critical: {
    icon: <AlertOctagon size={18} className="text-red-400" />,
    bg: 'bg-red-950/20',
    border: 'border-red-900/40',
    badge: 'bg-red-900/50',
    badgeText: 'text-red-400',
    accent: 'border-l-red-500',
  },
  high: {
    icon: <ShieldAlert size={18} className="text-orange-400" />,
    bg: 'bg-orange-950/15',
    border: 'border-orange-900/30',
    badge: 'bg-orange-900/50',
    badgeText: 'text-orange-400',
    accent: 'border-l-orange-500',
  },
  medium: {
    icon: <AlertTriangle size={18} className="text-amber-400" />,
    bg: 'bg-amber-950/15',
    border: 'border-amber-900/30',
    badge: 'bg-amber-900/50',
    badgeText: 'text-amber-400',
    accent: 'border-l-amber-500',
  },
  low: {
    icon: <Info size={18} className="text-slate-400" />,
    bg: 'bg-slate-900/60',
    border: 'border-slate-800/60',
    badge: 'bg-slate-800',
    badgeText: 'text-slate-400',
    accent: 'border-l-slate-600',
  },
};

export const DTSESignatureStage: React.FC<DTSESignatureStageProps> = ({ signatures }) => {
  const sorted = [...signatures].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
  });

  const severityCounts: Record<string, number> = {};
  for (const sig of signatures) {
    severityCounts[sig.severity] = (severityCounts[sig.severity] ?? 0) + 1;
  }

  const summaryParts = SEVERITY_ORDER
    .filter((s) => severityCounts[s])
    .map((s) => `${severityCounts[s]} ${s.toUpperCase()}`);

  return (
    <div data-cy="dtse-signature-stage" className="space-y-8">
      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
          Stage 4 — Failure Signature
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          Structural fragility patterns detected in the simulation. Sorted by severity.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-10 text-center">
          <p className="text-sm text-slate-500">No failure signatures detected.</p>
        </div>
      ) : (
        <>
          {/* Summary count bar */}
          <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl px-6 py-4 flex items-center gap-3">
            <span className="text-sm font-bold text-slate-200">
              {sorted.length} {sorted.length === 1 ? 'pattern' : 'patterns'} detected
            </span>
            <span className="text-slate-700">—</span>
            <span className="text-xs text-slate-400">
              {summaryParts.join(', ')}
            </span>
          </div>

          {/* Signature cards */}
          <div className="space-y-4">
            {sorted.map((sig) => {
              const cfg = SEVERITY_CONFIG[sig.severity];
              return (
                <div
                  key={sig.id}
                  data-cy={`dtse-signature-${sig.id}`}
                  className={`${cfg.bg} border ${cfg.border} ${cfg.accent} border-l-2 rounded-xl p-6 space-y-4`}
                >
                  {/* Header row */}
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 shrink-0">{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-slate-100">{sig.label}</h3>
                        <span className={`${cfg.badge} ${cfg.badgeText} text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md`}>
                          {sig.severity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trigger pattern */}
                  <div className="pl-10 space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-1">Pattern</span>
                      <p className="text-sm text-slate-300 leading-relaxed">{sig.pattern}</p>
                    </div>

                    {sig.affected_metrics.length > 0 && (
                      <div className="flex items-center gap-2.5 pt-1">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Affected:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {sig.affected_metrics.map((m) => (
                            <span key={m} className="bg-slate-800/60 text-slate-400 text-[10px] font-mono px-2.5 py-1 rounded-md">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
