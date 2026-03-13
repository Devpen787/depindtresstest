import React from 'react';
import type { TokenMarketData } from '../../services/coingecko';
import type { DTSEProtocolBrief, DTSEStressChannel } from '../../types/dtse';
import { formatDTSEUsdPrice, type DTSETrustSummary } from '../../utils/dtsePresentation';

interface DTSEPeerContext {
  peerNames: string[];
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}

interface DTSEContextStageProps {
  protocolBrief: DTSEProtocolBrief;
  marketData?: TokenMarketData | null;
  peerContext?: DTSEPeerContext;
  stressChannel?: DTSEStressChannel;
  trustSummary?: DTSETrustSummary;
  applicabilityCounts?: {
    scoredNow: number;
    heldOut: number;
    total: number;
  };
  showAdvanced?: boolean;
  modelVersion: string;
  generatedAt: string;
  horizonWeeks: number;
  nSims: number;
  compact?: boolean;
}

export const DTSEContextStage: React.FC<DTSEContextStageProps> = ({
  protocolBrief,
  marketData,
  stressChannel,
  trustSummary,
  applicabilityCounts,
  modelVersion,
  generatedAt,
  horizonWeeks,
  nSims,
  compact = false,
}) => {
  const formatCompactNumber = (value: number): string =>
    new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: value >= 100 ? 0 : 1,
    }).format(value);

  const formatUsdCompact = (value: number): string =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);

  const hasLiveMarketData = Boolean(marketData);
  const marketSectionTitle = hasLiveMarketData ? 'Live market context' : 'Reference market context';

  const marketStats = marketData
    ? [
        {
          label: 'Price',
          value: formatDTSEUsdPrice(marketData.currentPrice),
          detail: `${marketData.symbol} · live`,
        },
        {
          label: 'Market Cap',
          value: formatUsdCompact(marketData.marketCap),
          detail: 'Live market value',
        },
        {
          label: 'Circulating Supply',
          value: `${formatCompactNumber(marketData.circulatingSupply)} ${marketData.symbol}`,
          detail: 'Live circulating supply',
        },
        {
          label: 'Supply Cap',
          value:
            marketData.maxSupply && marketData.maxSupply > 0
              ? `${formatCompactNumber(marketData.maxSupply)} ${marketData.symbol}`
              : 'Unspecified',
          detail: marketData.maxSupply && marketData.maxSupply > 0 ? 'Live max supply' : 'No max supply feed',
        },
      ]
    : [
        {
          label: 'Price',
          value: formatDTSEUsdPrice(protocolBrief.token_price_usd),
          detail: 'Reference baseline',
        },
        {
          label: 'Market Cap',
          value: formatUsdCompact(protocolBrief.market_cap_usd),
          detail: 'Reference baseline',
        },
        {
          label: 'Supply Structure',
          value: protocolBrief.supply_structure,
          detail: 'Live cap feed unavailable',
        },
        {
          label: 'Supply Cap',
          value: protocolBrief.supply_structure === 'Capped' ? 'Capped' : 'Not capped',
          detail: 'Protocol baseline profile',
        },
      ];

  const modelStats = [
    {
      label: 'Token Stock',
      value: `${formatCompactNumber(protocolBrief.supply_count)} ${protocolBrief.supply_unit}`,
      detail: 'Simulation assumption',
    },
    {
      label: 'Weekly Emission',
      value: `${formatCompactNumber(protocolBrief.weekly_emissions)} ${protocolBrief.weekly_emissions_unit}`,
      detail: `${protocolBrief.burn_fraction_pct.toFixed(0)}% burn-linked`,
    },
    {
      label: 'Provider Count',
      value: `${formatCompactNumber(protocolBrief.active_providers)} ${protocolBrief.active_providers_unit}`,
      detail: 'Simulation start state',
    },
    {
      label: 'Model Structure',
      value: protocolBrief.supply_structure,
      detail: `Baseline input ${formatDTSEUsdPrice(protocolBrief.token_price_usd)}`,
    },
  ];

  const generatedDate = (() => {
    const parsed = new Date(generatedAt);
    if (Number.isNaN(parsed.getTime())) return generatedAt;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(parsed);
  })();

  const protocolSummaryMeta = [protocolBrief.chain, protocolBrief.mechanism].filter(Boolean).join(' · ');
  const tokenRoleItems =
    protocolBrief.token_utility.length > 0 ? protocolBrief.token_utility : ['No token-role detail available.'];
  const stressEntryLabel = stressChannel?.label ?? 'Saved stress bundle';
  const stressEntrySummary =
    stressChannel?.summary ?? 'Saved scenario framing is active for this run.';
  const stressEntryBasis =
    stressChannel?.basis ?? 'Using the saved DTSE bundle because a live stress basis was not available.';

  const likelyPressurePoint = (() => {
    switch (stressChannel?.id) {
      case 'liquidity_shock':
        return {
          title: 'Provider economics compress first',
          detail: 'Fiat-equivalent rewards and solvency usually weaken before visible station loss.',
        };
      case 'competitive_yield_pressure':
        return {
          title: 'Mobile supply loyalty gets tested',
          detail: 'Provider retention and outside yield pressure matter before node count looks weak.',
        };
      case 'provider_cost_inflation':
        return {
          title: 'Payback stretches before visible churn',
          detail: 'Cost pressure usually hits operator tolerance before physical capacity visibly disappears.',
        };
      case 'demand_contraction':
        return {
          title: 'Demand conversion weakens first',
          detail: 'Utilization and revenue support usually soften before physical network exits.',
        };
      default:
        return {
          title: 'Use Stage 3 to verify the first break',
          detail: 'Stage 1 frames likely pressure; Stage 3 validates timing and order.',
        };
    }
  })();

  const scoredNowValue = applicabilityCounts ? `${applicabilityCounts.scoredNow}` : '—';
  const heldOutValue = applicabilityCounts ? `${applicabilityCounts.heldOut}` : '—';
  const scoringConfidence = trustSummary?.scoringConfidenceStatus ?? 'Partial';
  const laggingSignal = {
    title: 'Coverage and active station visibility',
    detail: 'These usually lag provider economics, so visible footprint can look fine after unit economics already slipped.',
  };

  return (
    <div
      data-cy="dtse-context-stage"
      className={`${compact ? 'space-y-3 p-3' : 'space-y-3.5 p-4'} animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-[20px] bg-white border-slate-200 dark:bg-slate-900/40 dark:border-white/5 dark:backdrop-blur-xl border shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-slate-800 dark:text-slate-100 transition-colors`}
    >
      <div className="space-y-0.5">
        <h2 className={`${compact ? 'text-[15px]' : 'text-base'} font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-slate-100 dark:via-slate-300 dark:to-slate-500`}>
          Stage 1 — Protocol Context
        </h2>
        <p className={`${compact ? 'max-w-3xl text-[13px]' : 'max-w-[52rem] text-[13px]'} leading-relaxed text-slate-500 dark:text-slate-400`}>
          Confirm what this run is about before trusting any score.
        </p>
      </div>

      <section className="bg-slate-50 border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 rounded-2xl p-4 space-y-3 transition-colors">
        <div className="overflow-x-auto">
          <div className="grid min-w-[900px] grid-cols-6 gap-x-1.5 gap-y-1 rounded-xl border border-slate-200 bg-white dark:border-white/5 dark:bg-slate-900/40 shadow-sm dark:shadow-inner px-2.5 py-2 md:grid-cols-3 xl:min-w-0 xl:grid-cols-6 transition-colors">
            <article className="space-y-0.5 xl:border-r border-slate-200 dark:border-slate-700/50 xl:pr-2 transition-colors">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Protocol</p>
              <p className="text-[12.5px] font-semibold leading-snug text-slate-800 dark:text-slate-200">
                {protocolBrief.protocol_name} <span className="text-slate-400">· {protocolSummaryMeta}</span>
              </p>
            </article>
            <article className="space-y-0.5 xl:border-r border-slate-200 dark:border-slate-700/50 xl:px-2 transition-colors">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Stress</p>
              <p className="text-[12.5px] leading-snug text-slate-700 dark:text-slate-300">{stressChannel?.label ?? 'Saved stress bundle'}</p>
            </article>
            <article className="space-y-0.5 xl:border-r border-slate-200 dark:border-slate-700/50 xl:px-2 transition-colors">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Run / model</p>
              <p className="text-[12.5px] leading-snug text-slate-700 dark:text-slate-300">
                {modelVersion} · {horizonWeeks}w · {nSims} sims · {generatedDate}
              </p>
            </article>
            <article className="space-y-0.5 xl:border-r border-slate-200 dark:border-slate-700/50 xl:px-2 transition-colors">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Confidence</p>
              <p className="text-[13px] font-semibold leading-snug text-rose-600 dark:text-rose-400">{scoringConfidence}</p>
            </article>
            <article className="space-y-0.5 xl:border-r border-slate-200 dark:border-slate-700/50 xl:px-2 transition-colors">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Scored</p>
              <p className="text-[13px] font-semibold leading-snug text-emerald-600 dark:text-emerald-400">{scoredNowValue}</p>
            </article>
            <article className="space-y-0.5 xl:pl-2 transition-colors">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Held out</p>
              <p className="text-[13px] font-semibold leading-snug text-amber-600 dark:text-amber-400">{heldOutValue}</p>
            </article>
          </div>
        </div>

        <section className="rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/60 p-3 shadow-sm dark:shadow-inner transition-colors">
          <div className="mb-1.5 border-b border-slate-200 dark:border-slate-700/50 pb-1.5 transition-colors">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-400">Baseline mechanism map</p>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/80 transition-colors">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr_1.2fr_1fr]">
              <article className="relative border-b border-slate-200 dark:border-slate-700/50 p-3 lg:border-b-0 lg:border-r transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Baseline setup</p>
                <div className="mt-2 space-y-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-2 dark:border-slate-700/50 dark:bg-slate-900/40 transition-colors">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Demand driver</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">{protocolBrief.demand_signal}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-2 dark:border-slate-700/50 dark:bg-slate-900/40 transition-colors">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Token roles</p>
                    <ul className="mt-1 space-y-1">
                      {tokenRoleItems.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">
                          <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <span className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-slate-400 dark:text-slate-600 lg:block transition-colors">→</span>
              </article>

              <article className="relative border-b border-slate-200 dark:border-slate-700/50 bg-indigo-50 dark:bg-indigo-500/10 p-3 lg:border-b-0 lg:border-r transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-300">Stress entry</p>
                <div className="mt-2 space-y-2">
                  <div className="rounded-lg border border-indigo-200/70 bg-white/70 p-2 dark:border-indigo-400/20 dark:bg-slate-900/30 transition-colors">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-300">Activated contract</p>
                    <p className="mt-1 text-[12px] font-semibold leading-snug text-slate-800 dark:text-slate-200">{stressEntryLabel}</p>
                  </div>
                  <div className="rounded-lg border border-indigo-200/70 bg-white/70 p-2 dark:border-indigo-400/20 dark:bg-slate-900/30 transition-colors">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-300">Why it matters</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">{stressEntrySummary}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{stressEntryBasis}</p>
                  </div>
                </div>
                <span className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-slate-400 dark:text-slate-600 lg:block transition-colors">→</span>
              </article>

              <article className="relative border-b border-slate-200 dark:border-slate-700/50 bg-rose-50 dark:bg-rose-500/10 p-3 lg:border-b-0 lg:border-r transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-rose-600 dark:text-rose-300">Likely pressure point</p>
                <div className="mt-2 rounded-lg border border-rose-200/70 bg-white/70 p-2.5 dark:border-rose-400/20 dark:bg-slate-900/30 transition-colors">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-rose-600 dark:text-rose-300">Primary read</p>
                  <p className="mt-1 text-[13px] font-bold leading-snug text-slate-900 dark:text-white">{likelyPressurePoint.title}</p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">{likelyPressurePoint.detail}</p>
                </div>
                <span className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-rose-500 dark:text-slate-600 lg:block">→</span>
              </article>

              <article className="bg-slate-100 dark:bg-slate-800/50 p-3 transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Lagging signal</p>
                <div className="mt-2 rounded-lg border border-slate-200 bg-white/80 p-2.5 dark:border-slate-700/50 dark:bg-slate-900/30 transition-colors">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Read this later</p>
                  <p className="mt-1 text-[12px] font-semibold leading-snug text-slate-800 dark:text-slate-200">{laggingSignal.title}</p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">{laggingSignal.detail}</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 dark:border-slate-700/50 dark:bg-slate-900/30 transition-colors">
          <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-400 transition-colors">
            <span className="font-bold text-slate-800 dark:text-white">Run briefing:</span> Identify the protocol, the stress contract, and where pressure is most likely to show first.
          </p>
        </div>
      </section>

      <section className="bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700/50 shadow-sm dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)] rounded-2xl p-4 transition-colors">
        <div className="mb-1.5 border-b border-slate-200 dark:border-slate-700/50 pb-1.5 transition-colors">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-400">Context & assumptions</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Setup boundaries for reading later stages.</p>
        </div>
        <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2 mt-2">
          <section>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-300">{marketSectionTitle}</p>
              <span
                className={`rounded-md border px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em] ${
                  marketData ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                }`}
              >
                {marketData ? 'Live' : 'Reference'}
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/40 shadow-sm dark:shadow-inner transition-colors">
              {marketStats.map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`grid gap-1 px-2.5 py-1 sm:grid-cols-[130px_1fr] transition-colors ${idx > 0 ? 'border-t border-slate-200 dark:border-slate-700/50' : ''}`}
                >
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">{stat.value}</span>
                    <span className="text-slate-500 dark:text-slate-400"> · {stat.detail}</span>
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-300">Model assumptions</p>
              <span className="rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em] dark:text-indigo-300 transition-colors">
                Simulation
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-slate-900/40 shadow-sm dark:shadow-inner transition-colors">
              {modelStats.map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`grid gap-1 px-2.5 py-1 sm:grid-cols-[140px_1fr] transition-colors ${idx > 0 ? 'border-t border-slate-200 dark:border-slate-700/50' : ''}`}
                >
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">{stat.value}</span>
                    <span className="text-slate-500 dark:text-slate-400"> · {stat.detail}</span>
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};
