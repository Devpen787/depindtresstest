import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DTSEOutcome } from '../../types/dtse';
import type { GuardrailBand } from '../../constants/guardrails';

interface DTSEOutcomesStageProps {
  outcomes: DTSEOutcome[];
  metricLabels: Record<string, string>;
  unitMap: Record<string, string>;
}

const BAND_STYLES: Record<GuardrailBand, { bg: string; border: string; text: string; dot: string }> = {
  healthy: {
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-900/50',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  watchlist: {
    bg: 'bg-amber-950/30',
    border: 'border-amber-900/50',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  intervention: {
    bg: 'bg-red-950/30',
    border: 'border-red-900/50',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
};

const BandIcon: React.FC<{ band: GuardrailBand }> = ({ band }) => {
  if (band === 'healthy') return <TrendingUp size={14} className="text-emerald-400" />;
  if (band === 'intervention') return <TrendingDown size={14} className="text-red-400" />;
  return <Minus size={14} className="text-amber-400" />;
};

export const DTSEOutcomesStage: React.FC<DTSEOutcomesStageProps> = ({
  outcomes,
  metricLabels,
  unitMap,
}) => {
  const bandCounts: Record<GuardrailBand, number> = { healthy: 0, watchlist: 0, intervention: 0 };
  for (const o of outcomes) bandCounts[o.band]++;

  return (
    <div data-cy="dtse-outcomes-stage" className="space-y-6">
      <div>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
          Stage 3 — Simulation Outcomes
        </h2>
        <p className="text-sm text-slate-500">
          Key performance indicators from the Monte Carlo stress simulation, classified by guardrail band.
        </p>
      </div>

      {/* Band summary */}
      <div className="grid grid-cols-3 gap-3">
        {(['healthy', 'watchlist', 'intervention'] as GuardrailBand[]).map((band) => {
          const s = BAND_STYLES[band];
          return (
            <div key={band} className={`${s.bg} border ${s.border} rounded-xl p-4 text-center`}>
              <div className={`text-2xl font-extrabold ${s.text}`}>{bandCounts[band]}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                {band}
              </div>
            </div>
          );
        })}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {outcomes.map((outcome) => {
          const s = BAND_STYLES[outcome.band];
          const label = metricLabels[outcome.metric_id] ?? outcome.metric_id;
          const unit = unitMap[outcome.metric_id] ?? '';
          return (
            <div
              key={outcome.metric_id}
              data-cy={`dtse-outcome-${outcome.metric_id}`}
              className={`${s.bg} border ${s.border} rounded-xl p-5 space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <BandIcon band={outcome.band} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-extrabold ${s.text}`}>
                  {typeof outcome.value === 'number' ? outcome.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : outcome.value}
                </span>
                {unit && <span className="text-xs text-slate-500">{unit}</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${s.text}`}>{outcome.band}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
