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
    <div data-cy="dtse-context-stage" className="space-y-6">
      <div>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
          Stage 1 — Protocol Context
        </h2>
        <p className="text-sm text-slate-500">
          Identifies the protocol under evaluation and the model configuration used to generate results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Server size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Protocol</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-100">{protocolName}</p>
            <p className="text-xs text-slate-500 mt-1 font-mono">{protocolId}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Model Version</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-100">{modelVersion}</p>
            <p className="text-xs text-slate-500 mt-1">Engine configuration for this evaluation run</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Hash size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Mechanism</span>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-100">DePIN Token Stress</p>
            <p className="text-xs text-slate-500 mt-1">DTSE evaluation framework — tokenomics resilience under adversarial scenarios</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Clock size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Generated</span>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-100">
              {new Date(generatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-slate-500 mt-1">
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
