
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { 
  Play, 
  Settings2, 
  TrendingUp, 
  Activity, 
  Database, 
  Users, 
  Zap, 
  DollarSign, 
  Info,
  ChevronRight,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

/**
 * Seedable Random Number Generator
 */
class SeededRNG {
  private state: number;
  constructor(seed: number) {
    this.state = seed || 42;
  }
  next() {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }
  normal() {
    let u = 0, v = 0;
    while(u === 0) u = this.next();
    while(v === 0) v = this.next();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
}

// Types
type DemandType = 'consistent' | 'high-to-decay' | 'growth' | 'volatile';
type MacroCondition = 'bearish' | 'bullish' | 'sideways';

interface SimulationParams {
  T: number;
  initialSupply: number;
  initialPrice: number;
  maxMintWeekly: number;
  burnPct: number;
  demandType: DemandType;
  macro: MacroCondition;
  nSims: number;
  seed: number;
  providerCostPerWeek: number;
  baseCapacityPerProvider: number;
  kDemandPrice: number;
  kMintPrice: number;
}

interface SimResult {
  t: number;
  price: number;
  supply: number;
  demand: number;
  providers: number;
  capacity: number;
  servicePrice: number;
  minted: number;
  burned: number;
}

interface AggregateResult {
  t: number;
  price: { mean: number; p10: number; p90: number };
  supply: { mean: number; p10: number; p90: number };
  demand: { mean: number; p10: number; p90: number };
  providers: { mean: number; p10: number; p90: number };
  capacity: { mean: number; p10: number; p90: number };
  servicePrice: { mean: number; p10: number; p90: number };
}

// Logic Port
function getDemandSeries(T: number, base: number, type: DemandType, rng: SeededRNG): number[] {
  const series: number[] = [];
  for (let t = 0; t < T; t++) {
    let d = 0;
    if (type === 'consistent') {
      d = base * (1 + 0.03 * rng.normal());
    } else if (type === 'high-to-decay') {
      d = base * (1.6 * Math.exp(-t / 10) + 0.6);
      d *= (1 + 0.05 * rng.normal());
    } else if (type === 'growth') {
      d = base * (0.8 + 0.02 * t);
      d *= (1 + 0.05 * rng.normal());
    } else if (type === 'volatile') {
      d = base * (1 + 0.20 * rng.normal());
      if (rng.next() < 0.1) { // Random shocks
        d *= (0.5 + rng.next() * 1.3);
      }
    }
    series.push(Math.max(0, d));
  }
  return series;
}

function simulateOne(params: SimulationParams, simSeed: number): SimResult[] {
  const rng = new SeededRNG(simSeed);
  const { T, initialSupply, initialPrice, maxMintWeekly, burnPct, demandType, macro, 
          providerCostPerWeek, baseCapacityPerProvider, kDemandPrice, kMintPrice } = params;

  let mu = 0.002, sigma = 0.05;
  if (macro === 'bearish') { mu = -0.01; sigma = 0.06; }
  else if (macro === 'bullish') { mu = 0.015; sigma = 0.06; }

  const demands = getDemandSeries(T, 12000, demandType, rng);
  const results: SimResult[] = [];

  let currentSupply = initialSupply;
  let currentPrice = initialPrice;
  let currentProviders = 20;
  let currentServicePrice = 0.5;

  for (let t = 0; t < T; t++) {
    const demand = demands[t];
    const capacity = currentProviders * baseCapacityPerProvider;
    const scarcity = (demand - capacity) / Math.max(capacity, 1.0);
    
    // Update service price based on scarcity
    currentServicePrice = Math.min(Math.max(currentServicePrice * (1 + 0.8 * scarcity), 0.05), 5.0);

    const tokensSpent = (demand * currentServicePrice) / Math.max(currentPrice, 1e-9);
    const burned = burnPct * tokensSpent;

    const demandFactor = Math.tanh(demand / 15000.0);
    const minted = Math.min(maxMintWeekly, maxMintWeekly * (0.6 + 0.6 * demandFactor));

    currentSupply = Math.max(1.0, currentSupply + minted - burned);

    const rewardPerProviderValue = (minted / Math.max(currentProviders, 1.0)) * currentPrice;
    const joinProb = 1 / (1 + Math.exp(-(rewardPerProviderValue - providerCostPerWeek) / 5));
    const delta = (joinProb - 0.5) * 6 + rng.normal() * 0.6;
    
    // Market Dynamics
    const demandPressure = kDemandPrice * Math.tanh(scarcity);
    const dilutionPressure = -kMintPrice * (minted / Math.max(currentSupply, 1.0)) * 100;
    const logRet = mu + demandPressure + dilutionPressure + sigma * rng.normal();
    const nextPrice = Math.max(0.05, currentPrice * Math.exp(logRet));

    results.push({
      t,
      price: currentPrice,
      supply: currentSupply,
      demand,
      providers: currentProviders,
      capacity,
      servicePrice: currentServicePrice,
      minted,
      burned
    });

    // Prepare next step
    currentPrice = nextPrice;
    currentProviders = Math.max(1, currentProviders + delta);
  }

  return results;
}

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    T: 52,
    initialSupply: 1000000,
    initialPrice: 3.0,
    maxMintWeekly: 3500,
    burnPct: 0.5,
    demandType: 'consistent',
    macro: 'bearish',
    nSims: 150,
    seed: 42,
    providerCostPerWeek: 15.0,
    baseCapacityPerProvider: 180.0,
    kDemandPrice: 0.15,
    kMintPrice: 0.35
  });

  const [aggregated, setAggregated] = useState<AggregateResult[]>([]);
  const [sampleRun, setSampleRun] = useState<SimResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runSimulation = () => {
    setLoading(true);
    setTimeout(() => {
      const allSims: SimResult[][] = [];
      for (let i = 0; i < params.nSims; i++) {
        allSims.push(simulateOne(params, params.seed + i));
      }

      const aggregate: AggregateResult[] = [];
      const keys: (keyof SimResult)[] = ['price', 'supply', 'demand', 'providers', 'capacity', 'servicePrice'];
      
      for (let t = 0; t < params.T; t++) {
        const step: any = { t };
        keys.forEach(key => {
          const values = allSims.map(sim => sim[t][key] as number).sort((a, b) => a - b);
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const p10 = values[Math.floor(values.length * 0.1)];
          const p90 = values[Math.floor(values.length * 0.9)];
          step[key] = { mean, p10, p90 };
        });
        aggregate.push(step as AggregateResult);
      }

      setAggregated(aggregate);
      setSampleRun(allSims[0]);
      setLoading(false);
    }, 100);
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const formatNum = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const formatCompact = (n: number) => n.toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 1 });

  const ChartSection = ({ title, dataKey, yLabel, icon: Icon, color }: { title: string; dataKey: keyof AggregateResult; yLabel: string; icon: any; color: string }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[320px]">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-1.5 rounded-lg bg-${color}-500/10 text-${color}-400`}>
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-medium text-slate-200">{title}</h3>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={aggregated} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : color === 'amber' ? '#f59e0b' : color === 'violet' ? '#8b5cf6' : '#64748b'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : color === 'amber' ? '#f59e0b' : color === 'violet' ? '#8b5cf6' : '#64748b'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="t" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} label={{ value: 'Weeks', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#475569' }} />
            <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCompact} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              formatter={(value: any) => [formatNum(value), ""]}
            />
            <Area 
              type="monotone" 
              dataKey={(d: any) => d[dataKey].p90} 
              stroke="none" 
              fill={`url(#color-${dataKey})`} 
              baseLine={(d: any) => d[dataKey].p10}
              name="P10-P90 Band"
            />
            <Line 
              type="monotone" 
              dataKey={(d: any) => d[dataKey].mean} 
              stroke={color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : color === 'amber' ? '#f59e0b' : color === 'violet' ? '#8b5cf6' : '#64748b'} 
              strokeWidth={2} 
              dot={false}
              name="Mean"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">DePIN Stress Test</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Protocol Simulator v2.4</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <Info size={14} className="text-blue-400" />
            <span>Illustrative stress-testing • Not financial advice</span>
          </div>
          <button 
            onClick={runSimulation}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
            Run Simulation
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-80 border-r border-slate-800 p-6 overflow-y-auto hidden lg:block custom-scrollbar bg-slate-950/30">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 size={18} className="text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Parameters</h2>
          </div>

          <div className="space-y-6">
            <section>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-3">Time Horizon</label>
              <input 
                type="range" min="12" max="104" step="1" 
                value={params.T} 
                onChange={e => setParams({...params, T: parseInt(e.target.value)})}
                className="w-full accent-blue-600 mb-2"
              />
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Duration</span>
                <span className="text-blue-400 font-mono">{params.T} weeks</span>
              </div>
            </section>

            <section className="space-y-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase">Tokenomics</label>
              
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Initial Supply</label>
                <input 
                  type="number" 
                  value={params.initialSupply}
                  onChange={e => setParams({...params, initialSupply: parseFloat(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Initial Price ($)</label>
                <input 
                  type="number" step="0.1"
                  value={params.initialPrice}
                  onChange={e => setParams({...params, initialPrice: parseFloat(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Burn Percentage</label>
                <input 
                  type="range" min="0" max="1" step="0.05"
                  value={params.burnPct}
                  onChange={e => setParams({...params, burnPct: parseFloat(e.target.value)})}
                  className="w-full accent-blue-600"
                />
                <div className="text-right text-xs text-blue-400 font-mono">{(params.burnPct * 100).toFixed(0)}%</div>
              </div>
            </section>

            <section className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase">Environment</label>
              
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Demand Regime</label>
                <div className="grid grid-cols-2 gap-2">
                  {['consistent', 'growth', 'volatile', 'high-to-decay'].map(type => (
                    <button
                      key={type}
                      onClick={() => setParams({...params, demandType: type as DemandType})}
                      className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-all border ${
                        params.demandType === type 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/10' 
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400">Macro Condition</label>
                <div className="flex gap-2">
                  {['bearish', 'sideways', 'bullish'].map(m => (
                    <button
                      key={m}
                      onClick={() => setParams({...params, macro: m as MacroCondition})}
                      className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all border ${
                        params.macro === m 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="pt-4 border-t border-slate-800">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1 text-blue-400">
                  <Activity size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Simulation Quality</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Monte Carlo Runs</span>
                  <span className="text-xs font-mono text-blue-400">{params.nSims}</span>
                </div>
                <input 
                  type="range" min="50" max="500" step="50"
                  value={params.nSims}
                  onChange={e => setParams({...params, nSims: parseInt(e.target.value)})}
                  className="w-full accent-blue-600 mt-2"
                />
              </div>
            </section>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Final Price (Mean)</div>
              <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                ${aggregated.length > 0 ? formatNum(aggregated[aggregated.length - 1].price.mean) : '0.00'}
                <span className={`text-xs font-medium ${
                  aggregated.length > 0 && aggregated[aggregated.length - 1].price.mean > params.initialPrice ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {aggregated.length > 0 ? (
                    ((aggregated[aggregated.length - 1].price.mean / params.initialPrice - 1) * 100).toFixed(1) + '%'
                  ) : ''}
                </span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Final Supply</div>
              <div className="text-2xl font-bold text-white">
                {aggregated.length > 0 ? formatCompact(aggregated[aggregated.length - 1].supply.mean) : '0'}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Network Capacity</div>
              <div className="text-2xl font-bold text-white">
                {aggregated.length > 0 ? formatCompact(aggregated[aggregated.length - 1].capacity.mean) : '0'}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-slate-500 text-xs font-semibold uppercase mb-1">Avg Service Price</div>
              <div className="text-2xl font-bold text-white">
                ${aggregated.length > 0 ? formatNum(aggregated[aggregated.length - 1].servicePrice.mean) : '0.00'}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <ChartSection title="Token Price Over Time" dataKey="price" yLabel="Price ($)" icon={DollarSign} color="blue" />
            <ChartSection title="Token Supply Over Time" dataKey="supply" yLabel="Supply" icon={Database} color="violet" />
            <ChartSection title="Service Demand Over Time" dataKey="demand" yLabel="Units" icon={TrendingUp} color="emerald" />
            <ChartSection title="Total Network Capacity" dataKey="capacity" yLabel="Capacity" icon={Zap} color="amber" />
            <ChartSection title="Active Node Providers" dataKey="providers" yLabel="Providers" icon={Users} color="indigo" />
            <ChartSection title="Service Price (Unit)" dataKey="servicePrice" yLabel="USD" icon={DollarSign} color="rose" />
          </div>

          {/* Raw Data Sample */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-slate-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Example Single Simulation Log</h3>
              </div>
              <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded">Showing Run #1</span>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 sticky top-0 z-10">
                  <tr className="text-slate-400 uppercase tracking-tighter">
                    <th className="px-4 py-3 font-bold">Week</th>
                    <th className="px-4 py-3 font-bold">Price</th>
                    <th className="px-4 py-3 font-bold">Supply</th>
                    <th className="px-4 py-3 font-bold">Demand</th>
                    <th className="px-4 py-3 font-bold">Providers</th>
                    <th className="px-4 py-3 font-bold">Capacity</th>
                    <th className="px-4 py-3 font-bold">Minted</th>
                    <th className="px-4 py-3 font-bold">Burned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {sampleRun.map((row) => (
                    <tr key={row.t} className="hover:bg-slate-800/50 transition-colors text-slate-300">
                      <td className="px-4 py-3 text-slate-500">{row.t}</td>
                      <td className="px-4 py-3 font-semibold">${formatNum(row.price)}</td>
                      <td className="px-4 py-3">{formatCompact(row.supply)}</td>
                      <td className="px-4 py-3">{formatNum(row.demand)}</td>
                      <td className="px-4 py-3">{row.providers.toFixed(0)}</td>
                      <td className="px-4 py-3">{formatCompact(row.capacity)}</td>
                      <td className="px-4 py-3 text-emerald-400">+{formatNum(row.minted)}</td>
                      <td className="px-4 py-3 text-rose-400">-{formatNum(row.burned)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        input[type="range"] { -webkit-appearance: none; background: transparent; }
        input[type="range"]::-webkit-scrollbar { display: none; }
        input[type="range"]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: #1e293b; border-radius: 2px; }
        input[type="range"]::-webkit-slider-thumb { height: 16px; width: 16px; border-radius: 50%; background: #3b82f6; cursor: pointer; -webkit-appearance: none; margin-top: -6px; border: 2px solid #0f172a; box-shadow: 0 0 10px rgba(59, 130, 246, 0.4); }
        input[type="range"]:active::-webkit-slider-thumb { transform: scale(1.2); transition: 0.1s; }
      `}</style>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
