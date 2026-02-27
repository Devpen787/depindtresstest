import React from 'react';
import { Server, ArrowRightLeft, Coins, Sparkles, Layers3, BadgeDollarSign, Factory, Flame } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DTSERunContext, DTSEProtocolBrief, DTSEOutcome } from '../../types/dtse';

interface DTSEPeerContext {
  peerNames: string[];
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

interface DTSEContextStageProps {
  protocolBrief: DTSEProtocolBrief;
  outcomes: DTSEOutcome[];
  metricLabels: Record<string, string>;
  peerContext?: DTSEPeerContext;
  modelVersion: string;
  generatedAt: string;
  scenarioGridId: string;
  horizonWeeks: number;
  nSims: number;
  evidenceStatus: DTSERunContext['evidence_status'];
}

export const DTSEContextStage: React.FC<DTSEContextStageProps> = ({
  protocolBrief,
  outcomes,
  metricLabels,
  peerContext,
  modelVersion: _modelVersion,
  generatedAt: _generatedAt,
  scenarioGridId: _scenarioGridId,
  horizonWeeks: _horizonWeeks,
  nSims: _nSims,
  evidenceStatus,
}) => {
  const formatCompactNumber = (value: number): string => new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
  const formatUsdCompact = (value: number): string => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
  const contextStats = [
    {
      label: 'Supply',
      value: `${formatCompactNumber(protocolBrief.supply_count)} ${protocolBrief.supply_unit}`,
      detail: protocolBrief.supply_structure,
      icon: Layers3,
    },
    {
      label: 'Market Cap',
      value: formatUsdCompact(protocolBrief.market_cap_usd),
      detail: `at ${formatUsdCompact(protocolBrief.token_price_usd)} / token`,
      icon: BadgeDollarSign,
    },
    {
      label: 'Weekly Emissions',
      value: `${formatCompactNumber(protocolBrief.weekly_emissions)} ${protocolBrief.weekly_emissions_unit}`,
      detail: `${protocolBrief.burn_fraction_pct.toFixed(0)}% burn-linked`,
      icon: Flame,
    },
    {
      label: 'Active Supply Side',
      value: `${formatCompactNumber(protocolBrief.active_providers)} ${protocolBrief.active_providers_unit}`,
      detail: protocolBrief.mechanism,
      icon: Factory,
    },
  ];

  const CardHeader = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
    <div className="mb-3 flex items-center gap-2">
      <div className="rounded-md border border-cyan-500/20 bg-cyan-950/30 p-1.5">
        <Icon size={14} className="text-cyan-400" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/90">{label}</span>
    </div>
  );

  const coreOutcomes = outcomes.filter((outcome) => outcome.metric_id !== 'stress_resilience_index');
  const bandCounts = coreOutcomes.reduce(
    (counts, outcome) => {
      counts[outcome.band] += 1;
      return counts;
    },
    { healthy: 0, watchlist: 0, intervention: 0 } as Record<'healthy' | 'watchlist' | 'intervention', number>,
  );
  const overallBand = bandCounts.intervention > 0
    ? 'intervention'
    : bandCounts.watchlist > 0
      ? 'watchlist'
      : 'healthy';
  const bandClass = overallBand === 'healthy'
    ? 'bg-emerald-500/8 border-emerald-500/30 text-emerald-300'
    : overallBand === 'watchlist'
      ? 'bg-amber-500/8 border-amber-500/30 text-amber-300'
      : 'bg-rose-500/8 border-rose-500/30 text-rose-300';
  const driverLabels = coreOutcomes
    .filter((outcome) => outcome.band !== 'healthy')
    .sort((left, right) => {
      const rank: Record<string, number> = { intervention: 0, watchlist: 1, healthy: 2 };
      return rank[left.band] - rank[right.band];
    })
    .slice(0, 2)
    .map((outcome) => metricLabels[outcome.metric_id] ?? outcome.metric_id);
  const attentionCount = bandCounts.watchlist + bandCounts.intervention;
  const verdictSummary = overallBand === 'healthy'
    ? `All ${coreOutcomes.length} core indicators are in healthy range.`
    : `${attentionCount} of ${coreOutcomes.length} core indicators need attention.${driverLabels.length > 0 ? ` ${driverLabels.join(' and ')} are the main drivers.` : ''}`;
  const verdictTitle = overallBand === 'healthy'
    ? 'Structure looks durable.'
    : overallBand === 'watchlist'
      ? 'Resilience is present, but the margin is thin.'
      : 'The current token design breaks under stress.';
  const peerConfidenceClass = peerContext?.confidence === 'high'
    ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300'
    : peerContext?.confidence === 'medium'
      ? 'bg-amber-950/40 border-amber-900/60 text-amber-300'
      : 'bg-slate-900/70 border-slate-700/70 text-slate-300';

  return (
    <div data-cy="dtse-context-stage" className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
          Stage 1 — Protocol Context
        </h2>
        <p className="text-sm font-medium text-slate-400">
          Protocol snapshot, key drivers, and confidence level.
        </p>
      </div>

      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Assessment</p>

        <div data-cy="dtse-overall-verdict" className={`relative overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-md ${bandClass}`}>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-white/5 via-transparent to-transparent" />
            <div className="relative z-10 space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.22em]">Overall assessment</p>
                <h3 className="max-w-xl text-2xl font-black tracking-tight text-slate-100">{verdictTitle}</h3>
                <p className="max-w-2xl text-sm font-semibold leading-relaxed text-slate-100">{verdictSummary}</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
                {([
                  { label: 'Healthy', value: bandCounts.healthy, tone: 'text-emerald-300' },
                  { label: 'Watchlist', value: bandCounts.watchlist, tone: 'text-amber-300' },
                  { label: 'Intervention', value: bandCounts.intervention, tone: 'text-rose-300' },
                ]).map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-slate-950/35 p-3.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    <p className={`mt-2 text-2xl font-black ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Sparkles size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em]">Primary drivers</span>
                </div>
                {(driverLabels.length > 0 ? driverLabels : ['No stressed drivers detected']).map((driver) => (
                  <span
                    key={driver}
                    className="rounded-md border border-white/10 bg-slate-950/35 px-2.5 py-1 text-xs font-semibold text-slate-200"
                  >
                    {driver}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="space-y-3">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400/80">Protocol</span>
                    <span className="rounded-[4px] border border-slate-700/50 bg-slate-800/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-300">
                      {protocolBrief.chain}
                    </span>
                  </div>
                  <h3 className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-3xl font-black tracking-tight text-transparent">
                    {protocolBrief.protocol_name}
                  </h3>
                  <p className="mt-1 text-xs font-mono text-slate-500">{protocolBrief.protocol_id}</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-slate-950/30 p-3.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Surface</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-300">{protocolBrief.depin_surface}</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-slate-950/30 p-3.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Mechanism</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-300">{protocolBrief.mechanism}</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-slate-950/30 p-3.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Notes</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{protocolBrief.notes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Tokenomics Snapshot</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {contextStats.map(({ label, value, detail, icon }) => (
            <div key={label} className="rounded-xl border border-white/5 bg-slate-900/20 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-slate-900/35">
              <CardHeader icon={icon} label={label} />
              <p className="text-lg font-black tracking-tight text-slate-100">{value}</p>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-400">{detail}</p>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          This context explains what later DTSE stages are testing: whether current supply structure, issuance, burn pressure, and provider economics can survive stress without unfairly penalizing the protocol.
        </p>
      </section>

      {peerContext && (
        <section className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Comparables</p>
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Comparable peers</p>
                  <span className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] ${peerConfidenceClass}`}>
                    {peerContext.confidence} confidence
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {peerContext.peerNames.map((peerName) => (
                    <span key={peerName} className="rounded-md border border-slate-700/70 bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-slate-200">
                      {peerName}
                    </span>
                  ))}
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-950/25 px-3.5 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Why these peers</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{peerContext.rationale}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Mechanics</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { icon: ArrowRightLeft, label: 'Demand Signal', text: protocolBrief.demand_signal },
            { icon: Server, label: 'Supply Signal', text: protocolBrief.supply_signal },
          ].map((block) => (
            <div key={block.label} className="rounded-xl border border-white/5 bg-slate-900/20 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-slate-900/35">
              <CardHeader icon={block.icon} label={block.label} />
              <p className="text-sm leading-relaxed text-slate-300">{block.text}</p>
            </div>
          ))}

          <div className="rounded-xl border border-white/5 bg-slate-900/20 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-slate-900/35">
            <CardHeader icon={Coins} label="Token Utility" />
            <ul className="list-inside list-disc space-y-1.5 marker:text-cyan-500/50">
              {protocolBrief.token_utility.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-slate-300">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
