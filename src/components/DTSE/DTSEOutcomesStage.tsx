import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DTSEOutcome } from '../../types/dtse';
import type { GuardrailBand } from '../../constants/guardrails';

interface DTSEOutcomesStageProps {
  outcomes: DTSEOutcome[];
  metricLabels: Record<string, string>;
  unitMap: Record<string, string>;
}

const BAND_STYLES: Record<GuardrailBand, { bg: string; border: string; text: string; dot: string; iconBg: string }> = {
  healthy: {
    bg: 'bg-emerald-950/20',
    border: 'border-emerald-900/40',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    iconBg: 'bg-emerald-900/30',
  },
  watchlist: {
    bg: 'bg-amber-950/20',
    border: 'border-amber-900/40',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    iconBg: 'bg-amber-900/30',
  },
  intervention: {
    bg: 'bg-red-950/20',
    border: 'border-red-900/40',
    text: 'text-red-400',
    dot: 'bg-red-400',
    iconBg: 'bg-red-900/30',
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
    <div data-cy="dtse-outcomes-stage" className="space-y-8">
      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
          Stage 3 — Stress Test Results
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          How the protocol performed under simulated stress, classified by risk level.
        </p>
      </div>

      {/* Band summary — wider cards with breathing room */}
      <div className="grid grid-cols-3 gap-4">
        {(['healthy', 'watchlist', 'intervention'] as GuardrailBand[]).map((band) => {
          const s = BAND_STYLES[band];
          return (
            <div key={band} className={`${s.bg} border ${s.border} rounded-xl px-6 py-5 flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}>
                <span className={`text-xl font-extrabold ${s.text}`}>{bandCounts[band]}</span>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {band}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {bandCounts[band] === 1 ? 'indicator' : 'indicators'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Metric cards — uniform height, value-dominant */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {outcomes.map((outcome) => {
          const s = BAND_STYLES[outcome.band];
          const label = metricLabels[outcome.metric_id] ?? outcome.metric_id;
          const unit = unitMap[outcome.metric_id] ?? '';
          return (
            <div
              key={outcome.metric_id}
              data-cy={`dtse-outcome-${outcome.metric_id}`}
              className={`${s.bg} border ${s.border} rounded-xl p-6 flex flex-col justify-between min-h-[140px]`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <div className={`w-7 h-7 rounded-md ${s.iconBg} flex items-center justify-center`}>
                  <BandIcon band={outcome.band} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-extrabold tracking-tight ${s.text}`}>
                    {typeof outcome.value === 'number' ? outcome.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : outcome.value}
                  </span>
                  {unit && <span className="text-sm text-slate-500 font-medium">{unit}</span>}
                </div>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${s.text}`}>{outcome.band}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
