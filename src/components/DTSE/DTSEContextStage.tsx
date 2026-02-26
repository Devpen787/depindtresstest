import React from 'react';
import { Server, Hash, Clock, Cpu } from 'lucide-react';

interface DTSEContextStageProps {
  protocolId: string;
  protocolName: string;
  modelVersion: string;
  generatedAt: string;
}

export const DTSEContextStage: React.FC<DTSEContextStageProps> = ({
  protocolId,
  protocolName,
  modelVersion,
  generatedAt,
}) => {
  return (
    <div data-cy="dtse-context-stage" className="space-y-8">
      {/* Hero brief */}
      <div className="space-y-3">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
            Stage 1 — Protocol Context
          </h2>
          <p className="text-4xl font-extrabold text-slate-50 tracking-tight">
            {protocolName}
          </p>
          <p className="text-base text-slate-400 mt-1.5">
            DePIN Token Stress Evaluation
          </p>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
          Evaluating tokenomics resilience under adversarial stress scenarios — identifying structural fragilities before they surface in production.
        </p>
      </div>

      {/* Context grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900/70 border border-slate-800/60 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Server size={15} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Protocol</span>
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-100">{protocolName}</p>
            <p className="text-xs text-slate-500 mt-1.5 font-mono">{protocolId}</p>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/60 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Cpu size={15} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Model Version</span>
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-100">{modelVersion}</p>
            <p className="text-xs text-slate-500 mt-1.5">Engine configuration for this evaluation run</p>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/60 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Hash size={15} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Mechanism</span>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-100">DePIN Token Stress</p>
            <p className="text-xs text-slate-500 mt-1.5">DTSE framework — tokenomics resilience under adversarial scenarios</p>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/60 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Clock size={15} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Generated</span>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-100">
              {new Date(generatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-slate-500 mt-1.5">
              {new Date(generatedAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })} UTC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
