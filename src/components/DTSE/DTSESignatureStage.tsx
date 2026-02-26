import React from 'react';
import { AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';
import type { DTSEFailureSignature } from '../../types/dtse';

interface DTSESignatureStageProps {
  signatures: DTSEFailureSignature[];
}

const SEVERITY_CONFIG: Record<DTSEFailureSignature['severity'], {
  icon: React.ReactNode;
  bg: string;
  border: string;
  badge: string;
  badgeText: string;
}> = {
  critical: {
    icon: <AlertOctagon size={18} className="text-red-400" />,
    bg: 'bg-red-950/30',
    border: 'border-red-900/50',
    badge: 'bg-red-900/60',
    badgeText: 'text-red-400',
  },
  high: {
    icon: <ShieldAlert size={18} className="text-orange-400" />,
    bg: 'bg-orange-950/20',
    border: 'border-orange-900/40',
    badge: 'bg-orange-900/60',
    badgeText: 'text-orange-400',
  },
  medium: {
    icon: <AlertTriangle size={18} className="text-amber-400" />,
    bg: 'bg-amber-950/20',
    border: 'border-amber-900/40',
    badge: 'bg-amber-900/60',
    badgeText: 'text-amber-400',
  },
  low: {
    icon: <Info size={18} className="text-slate-400" />,
    bg: 'bg-slate-900/80',
    border: 'border-slate-800',
    badge: 'bg-slate-800',
    badgeText: 'text-slate-400',
  },
};

export const DTSESignatureStage: React.FC<DTSESignatureStageProps> = ({ signatures }) => {
  const sorted = [...signatures].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
  });

  return (
    <div data-cy="dtse-signature-stage" className="space-y-6">
      <div>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
          Stage 4 — Failure Signature
        </h2>
        <p className="text-sm text-slate-500">
          Structural fragility patterns detected in the simulation. Sorted by severity.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-500">No failure signatures detected.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((sig) => {
            const cfg = SEVERITY_CONFIG[sig.severity];
            return (
              <div
                key={sig.id}
                data-cy={`dtse-signature-${sig.id}`}
                className={`${cfg.bg} border ${cfg.border} rounded-xl p-5 space-y-3`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-100">{sig.label}</h3>
                      <span className={`${cfg.badge} ${cfg.badgeText} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded`}>
                        {sig.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{sig.pattern}</p>
                  </div>
                </div>

                {sig.affected_metrics.length > 0 && (
                  <div className="flex items-center gap-2 pl-9">
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Affected:</span>
                    <div className="flex flex-wrap gap-1">
                      {sig.affected_metrics.map((m) => (
                        <span key={m} className="bg-slate-800/80 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
