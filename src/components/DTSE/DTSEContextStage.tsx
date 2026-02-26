import React from 'react';
import { Server, Clock, Cpu, Layers3, ArrowRightLeft, Coins } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DTSERunContext, DTSEProtocolBrief } from '../../types/dtse';

interface DTSEContextStageProps {
  protocolBrief: DTSEProtocolBrief;
  modelVersion: string;
  generatedAt: string;
  scenarioGridId: string;
  horizonWeeks: number;
  nSims: number;
  evidenceStatus: DTSERunContext['evidence_status'];
}

export const DTSEContextStage: React.FC<DTSEContextStageProps> = ({
  protocolBrief,
  modelVersion,
  generatedAt,
  scenarioGridId,
  horizonWeeks,
  nSims,
  evidenceStatus,
}) => {
  const evidenceClass = evidenceStatus === 'complete'
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
    : evidenceStatus === 'partial'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(225,29,72,0.15)]';

  const CardHeader = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="p-1.5 rounded-md bg-cyan-950/30 border border-cyan-500/20">
        <Icon size={14} className="text-cyan-400" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/90">{label}</span>
    </div>
  );

  return (
    <div data-cy="dtse-context-stage" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
          Stage 1 — Protocol Context
        </h2>
        <p className="text-sm font-medium text-slate-400">
          Defines the required macro environment and structural bounds of the stress evaluation.
        </p>
      </div>

      {/* Hero Protocol Card */}
      <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-white/10 group">
        <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-500" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400/80">Entity Brief</span>
              <span className="px-2.5 py-1 rounded-[4px] text-[9px] font-bold uppercase tracking-widest bg-slate-800/80 text-slate-300 border border-slate-700/50">
                {protocolBrief.chain}
              </span>
            </div>
            <h3 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              {protocolBrief.protocol_name}
            </h3>
            <p className="text-xs font-mono text-slate-500 mt-1">{protocolBrief.protocol_id}</p>
          </div>
        </div>
        
        <div className="relative z-10 mt-5 pt-5 border-t border-white/5">
          <p className="text-sm text-slate-300 leading-relaxed font-medium">{protocolBrief.depin_surface}</p>
          <p className="text-xs text-slate-500 leading-relaxed mt-2">{protocolBrief.notes}</p>
        </div>
      </div>

      {/* Mechanics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: ArrowRightLeft, label: "Demand Signal", text: protocolBrief.demand_signal, delay: "delay-[100ms]" },
          { icon: Server, label: "Supply Signal", text: protocolBrief.supply_signal, delay: "delay-[150ms]" },
        ].map((block, idx) => (
          <div key={idx} className={`bg-slate-900/30 backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:-translate-y-0.5 hover:bg-slate-900/50 hover:border-white/10 transition-all duration-300 shadow-lg ${block.delay}`}>
            <CardHeader icon={block.icon} label={block.label} />
            <p className="text-sm text-slate-300 leading-relaxed">{block.text}</p>
          </div>
        ))}

        <div className="bg-slate-900/30 backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:-translate-y-0.5 hover:bg-slate-900/50 hover:border-white/10 transition-all duration-300 shadow-lg delay-[200ms]">
          <CardHeader icon={Coins} label="Token Utility" />
          <ul className="space-y-1.5 marker:text-cyan-500/50 list-inside list-disc">
            {protocolBrief.token_utility.map((item) => (
              <li key={item} className="text-sm text-slate-300 leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Run Context Footer Strip */}
      <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 mt-8 shadow-inner">
        <div className="flex flex-wrap items-center gap-5 text-[11px] font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <Layers3 size={12} className="text-slate-500" />
            <span className="font-mono text-slate-300">{scenarioGridId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={12} className="text-slate-500" />
            <span>{modelVersion}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-slate-500" />
            <span>{new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="px-2 py-0.5 bg-slate-900 rounded select-none border border-slate-800">
            {horizonWeeks}w <span className="text-slate-600">·</span> {nSims} sims
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-[4px] text-[9px] font-black uppercase tracking-widest border ${evidenceClass}`}>
          {evidenceStatus} Evidence
        </span>
      </div>
    </div>
  );
};
