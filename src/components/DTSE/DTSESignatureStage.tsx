import React from 'react';
import { AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';
import type { DTSEFailureSignature } from '../../types/dtse';

interface DTSESignatureStageProps {
  signatures: DTSEFailureSignature[];
  metricLabels: Record<string, string>;
}

const SEVERITY_CONFIG: Record<DTSEFailureSignature['severity'], {
  icon: React.ReactNode;
  bg: string;
  border: string;
  badge: string;
  badgeText: string;
  shadow: string;
}> = {
  critical: {
    icon: <AlertOctagon size={20} className="text-rose-400 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]" />,
    bg: 'bg-rose-500/5',
    border: 'border-rose-500/30',
    badge: 'bg-rose-950/60 border-rose-900/50',
    badgeText: 'text-rose-400',
    shadow: 'shadow-[0_0_30px_rgba(225,29,72,0.1)] hover:shadow-[0_0_40px_rgba(225,29,72,0.15)]',
  },
  high: {
    icon: <ShieldAlert size={20} className="text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />,
    bg: 'bg-orange-500/5',
    border: 'border-orange-500/20',
    badge: 'bg-orange-950/60 border-orange-900/50',
    badgeText: 'text-orange-400',
    shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.05)] hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]',
  },
  medium: {
    icon: <AlertTriangle size={20} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />,
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    badge: 'bg-amber-950/60 border-amber-900/50',
    badgeText: 'text-amber-400',
    shadow: 'shadow-lg hover:shadow-xl hover:shadow-amber-500/10',
  },
  low: {
    icon: <Info size={20} className="text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />,
    bg: 'bg-slate-900/40',
    border: 'border-white/5',
    badge: 'bg-slate-900 border-slate-800',
    badgeText: 'text-slate-400',
    shadow: 'shadow-md hover:shadow-lg',
  },
};

export const DTSESignatureStage: React.FC<DTSESignatureStageProps> = ({ signatures, metricLabels }) => {
  const sorted = [...signatures].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
  });

  return (
    <div data-cy="dtse-signature-stage" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
          Stage 4 — Failure Signatures
        </h2>
        <p className="text-sm font-medium text-slate-400">
          Diagnose systemic breakdowns and structural protocol weaknesses.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center shadow-inner flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
            <Info size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-1">No Signatures Detected</h3>
          <p className="text-xs text-slate-500">The current scenario did not trigger any structural failure patterns.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((sig, idx) => {
            const cfg = SEVERITY_CONFIG[sig.severity];
            const isCritical = sig.severity === 'critical';
            return (
              <div
                key={sig.id}
                data-cy={`dtse-signature-${sig.id}`}
                className={`relative overflow-hidden ${cfg.bg} border ${cfg.border} rounded-2xl p-6 ${cfg.shadow} transition-all duration-300 backdrop-blur-md group hover:-translate-y-0.5`}
                style={{ animationDelay: `${idx * 75}ms` }}
              >
                {/* Subtle animated background gradient line for critical items */}
                {isCritical && (
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent animate-pulse" />
                )}

                <div className="flex items-start gap-4 relative z-10">
                  <div className="mt-1 shrink-0 p-2 rounded-xl bg-slate-950/50 border border-white/5 shadow-inner">
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-base font-black tracking-tight text-slate-100">{sig.label}</h3>
                      <span className={`${cfg.badge} border ${cfg.badgeText} text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded shadow-inner`}>
                        {sig.severity}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium mb-4 pr-4">{sig.pattern}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      {sig.why_it_matters && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Impact</p>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium pr-4">{sig.why_it_matters}</p>
                        </div>
                      )}
                      {sig.trigger_logic && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Trigger Condition</p>
                          <p className="text-xs text-slate-400 leading-relaxed font-mono pr-4">{sig.trigger_logic}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {sig.affected_metrics.length > 0 && (
                  <div className="flex items-center gap-3 pl-[4.5rem] mt-5 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/70">Trace:</span>
                    <div className="flex flex-wrap gap-2">
                      {sig.affected_metrics.map((m) => (
                        <span key={m} className="bg-slate-950/80 text-slate-400 text-[10px] font-mono font-medium px-2.5 py-1 rounded border border-white/5 shadow-inner">
                          {metricLabels[m] ?? m}
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
