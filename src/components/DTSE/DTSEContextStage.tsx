import React from 'react';
import { Server, ArrowRightLeft, Coins, Sparkles, Layers3, BadgeDollarSign, Factory, Flame } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DTSEProtocolBrief, DTSEOutcome, DTSEStressChannel } from '../../types/dtse';
import type { TokenMarketData } from '../../services/coingecko';

interface DTSEPeerContext {
  peerNames: string[];
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

interface DTSEContextStageProps {
  protocolBrief: DTSEProtocolBrief;
  outcomes: DTSEOutcome[];
  marketData?: TokenMarketData | null;
  metricLabels: Record<string, string>;
  peerContext?: DTSEPeerContext;
  stressChannel?: DTSEStressChannel;
  showAdvanced?: boolean;
  modelVersion: string;
  generatedAt: string;
  horizonWeeks: number;
  nSims: number;
}

export const DTSEContextStage: React.FC<DTSEContextStageProps> = ({
  protocolBrief,
  outcomes,
  marketData,
  metricLabels,
  peerContext,
  stressChannel,
  showAdvanced = false,
  modelVersion,
  generatedAt,
  horizonWeeks,
  nSims,
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
  const marketStats = marketData ? [
    {
      label: 'Price',
      value: formatUsdCompact(marketData.currentPrice),
      detail: `${marketData.symbol} · live market`,
      icon: BadgeDollarSign,
    },
    {
      label: 'Market Cap',
      value: formatUsdCompact(marketData.marketCap),
      detail: 'Live market value',
      icon: Layers3,
    },
    {
      label: 'Circulating Supply',
      value: `${formatCompactNumber(marketData.circulatingSupply)} ${marketData.symbol}`,
      detail: 'Live circulating supply',
      icon: Factory,
    },
    {
      label: 'Supply Cap',
      value: marketData.maxSupply && marketData.maxSupply > 0
        ? `${formatCompactNumber(marketData.maxSupply)} ${marketData.symbol}`
        : 'Not reported',
      detail: marketData.maxSupply && marketData.maxSupply > 0
        ? 'Max supply (live market data)'
        : 'No max supply reported by market source',
      icon: Coins,
    },
  ] : [];

  const modelStats = [
    {
      label: 'Starting Token Stock',
      value: `${formatCompactNumber(protocolBrief.supply_count)} ${protocolBrief.supply_unit}`,
      detail: 'Simulation assumption (not live token cap)',
      icon: Layers3,
    },
    {
      label: 'Weekly Emission Input',
      value: `${formatCompactNumber(protocolBrief.weekly_emissions)} ${protocolBrief.weekly_emissions_unit}`,
      detail: `${protocolBrief.burn_fraction_pct.toFixed(0)}% burn-linked in model`,
      icon: Flame,
    },
    {
      label: 'Starting Provider Count',
      value: `${formatCompactNumber(protocolBrief.active_providers)} ${protocolBrief.active_providers_unit}`,
      detail: 'Simulation start state',
      icon: Factory,
    },
    {
      label: 'Model Structure',
      value: protocolBrief.supply_structure,
      detail: `Baseline price input ${formatUsdCompact(protocolBrief.token_price_usd)}`,
      icon: BadgeDollarSign,
    },
  ];

  const CardHeader = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
    <div className="mb-3 flex items-center gap-2">
      <div className="rounded-md border border-cyan-500/20 bg-cyan-950/30 p-1.5">
        <Icon size={14} className="text-cyan-400" />
      </div>
      <span className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{label}</span>
    </div>
  );

  const coreOutcomes = outcomes;
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
    : `${attentionCount} of ${coreOutcomes.length} core indicators need attention.${driverLabels.length > 0 ? ` ${driverLabels.join(' and ')} drive most of the stress.` : ''}`;
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
  const tokenRoleSummary = protocolBrief.token_utility.length > 0
    ? protocolBrief.token_utility.join(' • ')
    : 'No token-role detail available.';

  return (
    <div data-cy="dtse-context-stage" className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
          Stage 1 — Protocol Context
        </h2>
        <p className="text-sm font-medium text-slate-400">
          Enough context to understand what DTSE is testing and how to read the next stages.
        </p>
      </div>

      <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/5 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-200">Interpretation Boundary</p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
          DTSE is baseline-relative and comparative. It does not predict price, assign a universal rank, or claim live-network truth outside the modeled scenario.
        </p>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Stress setup</p>
          <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 text-xs font-black uppercase tracking-[0.16em] text-indigo-200">
            Matched Conditions
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-xl border border-white/5 bg-slate-900/20 p-4 backdrop-blur-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Stress Channel</p>
            <p className="mt-2 text-lg font-black tracking-tight text-slate-100">{stressChannel?.label ?? 'Saved DTSE Bundle'}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{stressChannel?.summary ?? 'This view is using a saved DTSE bundle under predefined stress conditions.'}</p>
            {showAdvanced && (
              <details className="mt-4 rounded-xl border border-white/5 bg-slate-950/25 px-3.5 py-3 text-sm text-slate-400">
                <summary className="cursor-pointer list-none text-xs font-black uppercase tracking-[0.16em] text-slate-300">
                  Run details
                </summary>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Model</p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">{modelVersion}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Run Envelope</p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">{horizonWeeks} weeks · {nSims} sims</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Generated</p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">{new Date(generatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Assessment</p>

        <div data-cy="dtse-overall-verdict" className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-md ${bandClass}`}>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-white/5 via-transparent to-transparent" />
            <div className="relative z-10 space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.22em]">Overall assessment</p>
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
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                    <p className={`mt-2 text-2xl font-black ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Sparkles size={14} />
                  <span className="text-xs font-black uppercase tracking-[0.18em]">Primary drivers</span>
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
                    <span className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Protocol</span>
                    <span className="rounded-[4px] border border-slate-700/50 bg-slate-800/80 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-slate-200">
                      {protocolBrief.chain}
                    </span>
                  </div>
                  <h3 className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-3xl font-black tracking-tight text-transparent">
                    {protocolBrief.protocol_name}
                  </h3>
                  <p className="mt-1 text-xs font-mono text-slate-500">{protocolBrief.protocol_id}</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-slate-950/30 p-3.5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">Surface</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-300">{protocolBrief.depin_surface}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-slate-950/30 p-3.5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">Mechanism</p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-300">{protocolBrief.mechanism}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-slate-950/30 p-3.5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">What to watch next</p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-300">
                      Stage 2 shows which metrics are fair to score. Stage 3 shows what breaks first under stress.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3.5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">Notes</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{protocolBrief.notes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <details className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-sm">
          <summary className="cursor-pointer list-none text-sm font-bold text-slate-200">
            Supplementary data (market snapshot + simulation assumptions)
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Use this for deeper context only. Market cards are live; model cards are simulation assumptions.
          </p>

          <div className="mt-4 space-y-5">
            {marketStats.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Market Snapshot</p>
                  <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                    Live Market
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {marketStats.map(({ label, value, detail, icon }) => (
                    <div key={label} className="rounded-xl border border-emerald-500/20 bg-slate-900/45 p-4 backdrop-blur-sm">
                      <CardHeader icon={icon} label={label} />
                      <p className="text-lg font-black tracking-tight text-slate-100">{value}</p>
                      <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-300">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Model Inputs</p>
                  <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 text-xs font-black uppercase tracking-[0.16em] text-indigo-300">
                    Simulation
                  </span>
                </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {modelStats.map(({ label, value, detail, icon }) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-slate-900/45 p-4 backdrop-blur-sm">
                    <CardHeader icon={icon} label={label} />
                    <p className="text-lg font-black tracking-tight text-slate-100">{value}</p>
                    <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-300">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>
      </section>

      <section className="space-y-2">
        <details className="rounded-2xl border border-white/10 bg-slate-900/35 p-4 backdrop-blur-sm">
          <summary className="cursor-pointer list-none text-sm font-bold text-slate-200">
            Additional protocol context (optional)
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Open this only when you need deeper peer and mechanism context.
          </p>

          <div className="mt-4 space-y-4">
            {peerContext && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-4 space-y-3">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Comparable peers</p>
                    <span className={`rounded border px-2 py-0.5 text-xs font-bold uppercase tracking-[0.16em] ${peerConfidenceClass}`}>
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
                  <div className="rounded-xl border border-white/10 bg-slate-950/25 px-3.5 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">Why these peers</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{peerContext.rationale}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { icon: ArrowRightLeft, label: 'Demand Side', text: protocolBrief.demand_signal },
                { icon: Server, label: 'Supply Side', text: protocolBrief.supply_signal },
              ].map((block) => (
                <div key={block.label} className="rounded-xl border border-white/10 bg-slate-900/20 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-900/35">
                  <CardHeader icon={block.icon} label={block.label} />
                  <p className="text-sm leading-relaxed text-slate-300">{block.text}</p>
                </div>
              ))}

              <div className="rounded-xl border border-white/10 bg-slate-900/20 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-900/35">
                <CardHeader icon={Coins} label="Token Role" />
                <p className="text-sm leading-relaxed text-slate-300">{tokenRoleSummary}</p>
              </div>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
};
