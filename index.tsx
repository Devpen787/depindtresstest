
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ReferenceLine,
  ComposedChart
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
  RefreshCw,
  AlertTriangle,
  BrainCircuit,
  Menu,
  X,
  ShieldCheck,
  ZapOff,
  Plus,
  Trash2,
  Save,
  Clock,
  BookOpen,
  FileJson,
  Languages,
  LayoutDashboard,
  BarChart3,
  Scale,
  CheckCircle2,
  HeartPulse,
  ArrowDownUp,
  UserCheck,
  Download,
  Terminal,
  Calculator,
  Boxes,
  ListChecks,
  Repeat
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

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

interface ProtocolProfileV1 {
  version: string;
  metadata: {
    id: string;
    name: string;
    notes: string;
    source: 'Interview-Derived' | 'Placeholder-Derived';
  };
  parameters: {
    supply: { value: number; unit: string };
    emissions: { value: number; unit: string };
    burn_fraction: { value: number; unit: string };
    adjustment_lag: { value: number; unit: string };
    demand_regime: { value: DemandType; unit: string };
    provider_economics: {
      opex_weekly: { value: number; unit: string };
      churn_threshold: { value: number; unit: string };
    };
  };
}

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
  rewardLagWeeks: number;
  churnThreshold: number;
}

interface SimResult {
  t: number;
  price: number;
  supply: number;
  demand: number;
  demand_served: number;
  providers: number;
  capacity: number;
  servicePrice: number;
  minted: number;
  burned: number;
  utilization: number;
  profit: number;
}

interface MetricStats {
  mean: number;
  p10: number;
  p90: number;
}

interface AggregateResult {
  t: number;
  price: MetricStats;
  supply: MetricStats;
  demand: MetricStats;
  demand_served: MetricStats;
  providers: MetricStats;
  capacity: MetricStats;
  servicePrice: MetricStats;
  minted: MetricStats;
  burned: MetricStats;
  utilization: MetricStats;
  profit: MetricStats;
}

const TRANSLATIONS: any = {
  en: {
    appTitle: "DePIN Stress Test",
    version: "Thesis & Robustness Simulator V3.7",
    btnRun: "Run Simulation",
    btnBlueprint: "Research Blueprint",
    sidebarParams: "Parameters",
    sidebarHorizon: "Time Horizon",
    sidebarDuration: "Duration",
    sidebarWeeks: "weeks",
    sidebarTokenomics: "Tokenomics",
    sidebarInitialSupply: "Initial Supply (Tokens)",
    sidebarInitialPrice: "Initial Token Value (CHF)",
    sidebarBurnRate: "Burn Fraction",
    sidebarEnvironment: "Market Environment",
    sidebarDemandRegime: "Demand Regime",
    sidebarMacro: "Macro Trend",
    sidebarQuality: "Simulation Quality",
    sidebarQualityLabel: "Monte Carlo Runs",
    aiBtn: "AI ROBUSTNESS AUDIT",
    metricHealth: "Robustness Score",
    metricSupply: "Circulating Supply",
    metricGap: "Sustainability Gap",
    metricRetention: "Provider Retention",
    toolbarStatus: "Status",
    toolbarPlayback: "Playback",
    toolbarWeek: "Week",
    chartTitle1: "Capacity vs Demand (Units/Week)",
    chartTitle2: "Provider Count",
    chartTitle3: "Burn vs Emissions (Tokens/Week)",
    chartTitle4: "Network Utilization (%)",
    chartTitle5: "Supply Trajectory (Tokens)",
    chartTitle6: "Service Pricing Proxy (CHF/Unit)",
    healthStable: "ROBUST",
    healthCritical: "FRAGILE",
    healthAtRisk: "STRESSED",
    aiAuditTitle: "Research Assistant: Robustness Report",
    aiProcessing: "Assessing directional robustness...",
    aiClose: "Close Report",
    blueprintTitle: "Research Blueprint: DePIN Stress Framework",
    blueprintMappingText: "Parameters represent relative forces, not exact predictions.",
    blueprintGoodBad: "Performance Guide (Good vs. Bad)",
    blueprintMethods: "Methodology (Thesis-Ready)",
    blueprintExit: "Exit Blueprint",
    blueprintTransfer: "Transferability & Generalization",
    aiPersona: "DePIN Protocol Research Lead",
    aiPromptRisk: "Analyze 'Death Spiral' triggers and 'Incentive Misalignment'. Avoid price targets.",
    adviceNote: "Focus on Directional Robustness • Not financial advice"
  }
};

const RESEARCH_METHODS: any = {
  en: `1. Monte Carlo Sampling: We execute multiple parallel stochastic runs (n=100) to observe the probability distribution of outcomes under varying initial seeds.
2. Token Velocity Modeling: The interaction between token supply, burn fraction, and service pricing creates a dynamic feedback loop (Burn-and-Mint Equilibrium).
3. Provider Churn Logic: Modeling provider retention as a function of 'Profit vs OpEx' thresholds, amplified by consecutive loss weeks.
4. Macro Trend Integration: Testing the protocol against sustained bearish or bullish market sentiment to evaluate structural resilience.
5. Death Spiral Analysis: Identifying triggers where declining price leads to provider exit, which reduces capacity, further hurting utility and price.`
};

const PROTOCOL_PROFILES: ProtocolProfileV1[] = [
  {
    version: "1.0",
    metadata: {
      id: "ono_v3_calibrated",
      name: "ONO (Expert Calibrated)",
      notes: "Emissions (900k) and burn fraction (0.65) derived from Sam's interview. OpEx weekly midpoint ($25.96) calculated from annual range. Reward lag (6w) reflects manual governance.",
      source: "Interview-Derived"
    },
    parameters: {
      supply: { value: 100000000, unit: "tokens" },
      emissions: { value: 900000, unit: "tokens/week" },
      burn_fraction: { value: 0.65, unit: "decimal" },
      adjustment_lag: { value: 6, unit: "weeks" },
      demand_regime: { value: "growth", unit: "category" },
      provider_economics: {
        opex_weekly: { value: 25.96, unit: "chf/week" },
        churn_threshold: { value: 10, unit: "chf/week_profit" }
      }
    }
  },
  {
    version: "1.0",
    metadata: {
      id: "helium_bme_v1",
      name: "Helium-like (BME)",
      notes: "High emission bootstrap phase. Burn-and-Mint Equilibrium logic. Reward lag is minimal due to hard-coded halving schedule.",
      source: "Placeholder-Derived"
    },
    parameters: {
      supply: { value: 100000000, unit: "tokens" },
      emissions: { value: 5000000, unit: "tokens/week" },
      burn_fraction: { value: 1.0, unit: "decimal" },
      adjustment_lag: { value: 0, unit: "weeks" },
      demand_regime: { value: "consistent", unit: "category" },
      provider_economics: {
        opex_weekly: { value: 50.00, unit: "chf/week" },
        churn_threshold: { value: 5.00, unit: "chf/week_profit" }
      }
    }
  },
  {
    version: "1.0",
    metadata: {
      id: "adaptive_elastic_v1",
      name: "Adaptive (Algorithmic)",
      notes: "Low lag governance with variable burn. High sensitivity to demand signals. Supply starts tighter to encourage early parity.",
      source: "Placeholder-Derived"
    },
    parameters: {
      supply: { value: 50000000, unit: "tokens" },
      emissions: { value: 450000, unit: "tokens/week" },
      burn_fraction: { value: 0.50, unit: "decimal" },
      adjustment_lag: { value: 2, unit: "weeks" },
      demand_regime: { value: "volatile", unit: "category" },
      provider_economics: {
        opex_weekly: { value: 15.00, unit: "chf/week" },
        churn_threshold: { value: 15.00, unit: "chf/week_profit" }
      }
    }
  }
];

const SANITY_EQUATIONS = [
  { eq: "supply[t+1] = supply[t] + emissions[t] - burned[t]", desc: "Conservation of token mass." },
  { eq: "burned[t] <= tokens_spent[t] * burn_fraction", desc: "Burn is capped by activity and liquidity." },
  { eq: "demand_served[t] = min(demand[t], capacity[t])", desc: "Hard network throughput limit." },
  { eq: "utilization[t] = demand_served[t] / capacity[t]", desc: "Efficiency ratio (zero-protected)." },
  { eq: "profit[t] = reward_value[t] - opex[t]", desc: "Net provider incentive signal." }
];

const BUG_CHECKLIST = [
  "Clamping Failure: Burn > Supply causing negative or near-zero supply spikes.",
  "Normalizing Error: Dividends cast to integers during reward calculations.",
  "Price Singularity: Zero supply or zero demand causing Infinity/NaN service prices.",
  "Mint Leak: Emissions continuing after demand collapse or supply caps.",
  "Reward Lag Overflow: Array length drift in governance windows over long T."
];

const MIN_VIABLE_CALIBRATION = [
  { item: "Circulating Supply", source: "Public Block Explorer / CoinGecko" },
  { item: "Emission Schedule", source: "Whitepaper / Technical Docs" },
  { item: "Burn/Mint Logic", source: "Smart Contract Logic (BME vs Buy-and-Burn)" },
  { item: "Estimated Weekly OpEx", source: "Hardware Wattage * Avg Electricity Price" },
  { item: "Demand Archetype", source: "Project Roadmap (Enterprise vs Retail growth)" }
];

const NICE_TO_HAVE_CALIBRATION = [
  { item: "Secondary Sinks", source: "Staking requirements or slashing data" },
  { item: "Hardware Lifecycle", source: "Mean time to failure (MTTF) for churn precision" },
  { item: "Governance Lag", source: "Avg time from proposal to implementation" },
  { item: "Price Correlation", source: "Beta to BTC/ETH for macro scaling" }
];

const MetricCard: React.FC<{ 
  title: string; 
  value: string; 
  subValue?: string; 
  subColor?: string;
  icon?: any;
}> = ({ title, value, subValue, subColor, icon: Icon }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <div className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">{title}</div>
      {Icon && <Icon size={14} className="text-slate-700" />}
    </div>
    <div className="flex items-baseline gap-2">
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {subValue && <div className={`text-[10px] font-bold ${subColor || 'text-rose-400'}`}>{subValue}</div>}
    </div>
  </div>
);

const BaseChartBox: React.FC<{ 
  title: string; 
  icon: any; 
  color: string; 
  children: React.ReactNode 
}> = ({ title, icon: Icon, color, children }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[280px] shadow-sm relative overflow-hidden">
    <div className="flex items-center gap-2 mb-4 z-10">
      <div className={`p-1.5 rounded-lg bg-slate-950/50 text-${color}-400`}>
        <Icon size={16} />
      </div>
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-tight">{title}</h3>
    </div>
    <div className="flex-1 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children as any}
      </ResponsiveContainer>
    </div>
  </div>
);

function getDemandSeries(T: number, base: number, type: DemandType, rng: SeededRNG): number[] {
  const series: number[] = [];
  for (let t = 0; t < T; t++) {
    let d = 0;
    if (type === 'consistent') d = base * (1 + 0.03 * rng.normal());
    else if (type === 'high-to-decay') d = base * (1.6 * Math.exp(-t / 10) + 0.6) * (1 + 0.05 * rng.normal());
    else if (type === 'growth') d = base * (0.8 + 0.02 * t) * (1 + 0.05 * rng.normal());
    else if (type === 'volatile') d = base * (1 + 0.20 * rng.normal());
    series.push(Math.max(0, d));
  }
  return series;
}

function simulateOne(params: SimulationParams, simSeed: number): SimResult[] {
  const rng = new SeededRNG(simSeed);
  const { T, initialSupply, initialPrice, maxMintWeekly, burnPct, demandType, macro, 
          providerCostPerWeek, baseCapacityPerProvider, kDemandPrice, kMintPrice, rewardLagWeeks, churnThreshold } = params;

  let mu = 0.002, sigma = 0.05;
  if (macro === 'bearish') { mu = -0.01; sigma = 0.06; }
  else if (macro === 'bullish') { mu = 0.015; sigma = 0.06; }

  const demands = getDemandSeries(T, 12000, demandType, rng);
  const results: SimResult[] = [];

  let currentSupply = initialSupply;
  let currentPrice = initialPrice;
  let currentProviders = 30;
  let currentServicePrice = 0.5;
  
  let consecutiveLowProfitWeeks = 0;
  const rewardHistory: number[] = new Array(Math.max(1, rewardLagWeeks)).fill(params.providerCostPerWeek * 1.5);

  for (let t = 0; t < T; t++) {
    const demand = demands[t];
    const capacity = Math.max(0.001, currentProviders * baseCapacityPerProvider);
    const demand_served = Math.min(demand, capacity);
    const utilization = (demand_served / capacity) * 100;
    
    const scarcity = (demand - capacity) / capacity;
    currentServicePrice = Math.min(Math.max(currentServicePrice * (1 + 0.6 * scarcity), 0.05), 5.0);
    
    const safePrice = Math.max(currentPrice, 0.0001);
    const tokensSpent = (demand_served * currentServicePrice) / safePrice;
    
    const burnedRaw = burnPct * tokensSpent;
    const burned = Math.min(currentSupply * 0.95, burnedRaw); 
    
    const minted = Math.min(maxMintWeekly, maxMintWeekly * (0.6 + 0.6 * Math.tanh(demand / 15000.0)));
    currentSupply = Math.max(1000.0, currentSupply + minted - burned);
    
    const instantRewardValue = (minted / Math.max(currentProviders, 0.1)) * safePrice;
    rewardHistory.push(instantRewardValue);
    if (rewardHistory.length > Math.max(1, rewardLagWeeks)) rewardHistory.shift();
    
    const delayedReward = rewardHistory[0];
    const profit = delayedReward - providerCostPerWeek;
    const incentive = profit / providerCostPerWeek;
    
    if (profit < churnThreshold) {
      consecutiveLowProfitWeeks++;
    } else {
      consecutiveLowProfitWeeks = Math.max(0, consecutiveLowProfitWeeks - 1);
    }
    
    let churnMultiplier = 1.0;
    if (consecutiveLowProfitWeeks > 2) churnMultiplier = 1.8;
    if (consecutiveLowProfitWeeks > 5) churnMultiplier = 4.0;
    
    const delta = (incentive * 4.5 * churnMultiplier) + rng.normal() * 0.5;
    
    const demandPressure = kDemandPrice * Math.tanh(scarcity);
    const dilutionPressure = -kMintPrice * (minted / currentSupply) * 100;
    const logRet = mu + demandPressure + dilutionPressure + sigma * rng.normal();
    const nextPrice = Math.max(0.01, currentPrice * Math.exp(logRet));

    results.push({
      t, price: currentPrice, supply: currentSupply, demand, demand_served,
      providers: currentProviders, capacity, servicePrice: currentServicePrice,
      minted, burned, utilization, profit
    });

    currentPrice = nextPrice;
    currentProviders = Math.max(2, currentProviders + delta);
  }
  return results;
}

const App: React.FC = () => {
  const [lang] = useState<'en'>('en');
  const [params, setParams] = useState<SimulationParams>({
    T: 52, 
    initialSupply: 100000000, 
    initialPrice: 3.0, 
    maxMintWeekly: 900000, 
    burnPct: 0.65, 
    demandType: 'growth', 
    macro: 'bearish', 
    nSims: 100, 
    seed: 42,
    providerCostPerWeek: 25.96, 
    baseCapacityPerProvider: 180.0, 
    kDemandPrice: 0.15, 
    kMintPrice: 0.35,
    rewardLagWeeks: 6,
    churnThreshold: 10.0
  });

  const [aggregated, setAggregated] = useState<AggregateResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [playbackMode, setPlaybackMode] = useState(false);
  const [playbackWeek, setPlaybackWeek] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [showResearchBlueprint, setShowResearchBlueprint] = useState(false);

  const t = (key: string): string => TRANSLATIONS[lang][key] || key;
  const timerRef = useRef<number | null>(null);

  const runSimulation = () => {
    setLoading(true);
    setAiAnalysis(null);
    setPlaybackWeek(0);

    setTimeout(() => {
      const allSims: SimResult[][] = [];
      for (let i = 0; i < params.nSims; i++) {
        allSims.push(simulateOne(params, params.seed + i));
      }

      const aggregate: AggregateResult[] = [];
      const keys: (keyof SimResult)[] = ['price', 'supply', 'demand', 'demand_served', 'providers', 'capacity', 'servicePrice', 'minted', 'burned', 'utilization', 'profit'];
      
      for (let tStep = 0; tStep < params.T; tStep++) {
        const step: any = { t: tStep };
        keys.forEach(key => {
          const values = allSims.map(sim => sim[tStep][key] as number).sort((a, b) => a - b);
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const p10 = values[Math.floor(values.length * 0.1)] || 0;
          const p90 = values[Math.floor(values.length * 0.9)] || 0;
          step[key] = { mean, p10, p90 };
        });
        aggregate.push(step as AggregateResult);
      }

      setAggregated(aggregate);
      setLoading(false);
      if (playbackMode) startPlayback();
      else setPlaybackWeek(params.T);
    }, 100);
  };

  const startPlayback = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setPlaybackWeek(prev => {
        if (prev >= params.T) {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 30);
  };

  const loadProfile = (profile: ProtocolProfileV1) => {
    setParams({
      ...params,
      initialSupply: profile.parameters.supply.value,
      maxMintWeekly: profile.parameters.emissions.value,
      burnPct: profile.parameters.burn_fraction.value,
      rewardLagWeeks: profile.parameters.adjustment_lag.value,
      demandType: profile.parameters.demand_regime.value,
      providerCostPerWeek: profile.parameters.provider_economics.opex_weekly.value,
      churnThreshold: profile.parameters.provider_economics.churn_threshold.value
    });
    setTimeout(runSimulation, 100);
  };

  const analyzeWithAI = async () => {
    if (!aggregated.length) return;
    setAiLoading(true);
    setShowAiSheet(true);
    try {
      const last = aggregated[aggregated.length - 1];
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as ${t('aiPersona')}. 
      Analyze this DePIN simulation for 'Directional Robustness'. 
      Burn-to-Mint Gap: ${formatCompact(last.burned.mean - last.minted.mean)} tokens/wk.
      Final Utilization: ${last.utilization.mean.toFixed(1)}%.
      Provider Retention: ${((last.providers.mean/30)*100).toFixed(0)}%.
      Avg Weekly Provider Profit: ${last.profit.mean.toFixed(2)} CHF.
      ${t('aiPromptRisk')}
      No specific price targets. Return an expert audit.`;

      const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt });
      setAiAnalysis(response.text);
    } catch (e) {
      setAiAnalysis("Audit failed. System unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => { runSimulation(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const displayedData = useMemo(() => aggregated.slice(0, playbackWeek), [aggregated, playbackWeek]);
  
  const protocolHealth = useMemo(() => {
    if (!aggregated.length) return { status: t('healthStable'), score: 100 };
    const last = aggregated[aggregated.length - 1];
    let score = 100;
    
    if (last.utilization.mean < 15) score -= 25;
    if (last.utilization.mean > 95) score -= 15;
    const supplyDiff = Math.abs(last.supply.mean - params.initialSupply) / params.initialSupply;
    if (supplyDiff > 0.5) score -= 20;
    if (last.providers.mean < 10) score -= 50;
    
    score = Math.max(0, score);
    let status = t('healthStable');
    if (score < 40) status = t('healthCritical');
    else if (score < 70) status = t('healthAtRisk');
    
    return { status, score };
  }, [aggregated, params.initialSupply]);

  const formatCompact = (n: number) => n.toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 1 });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 border border-indigo-400/20">
            <Scale className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-md font-extrabold tracking-tight">{t('appTitle')}</h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">{t('version')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowResearchBlueprint(true)} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white transition-all bg-slate-900/50 hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-800 active:scale-95">
            <BookOpen size={14} className="text-emerald-400" />
            <span>{t('btnBlueprint')}</span>
          </button>
          <button onClick={runSimulation} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95">
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
            {t('btnRun')}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[300px] border-r border-slate-800 p-6 overflow-y-auto bg-slate-950 flex flex-col gap-8 custom-scrollbar">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Settings2 size={14} className="text-slate-500" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('sidebarParams')}</h2>
            </div>
            <div className="space-y-7">
              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase mb-4 tracking-widest">{t('sidebarHorizon')}</label>
                <input type="range" min="12" max="104" value={params.T} onChange={e => setParams({...params, T: parseInt(e.target.value)})} className="w-full accent-indigo-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer mb-2" />
                <div className="flex justify-between text-[10px] font-mono text-slate-400"><span>{t('sidebarDuration')}</span><span className="text-indigo-400 font-bold">{params.T} {t('sidebarWeeks')}</span></div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-widest">{t('sidebarTokenomics')}</label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-500 uppercase font-medium">{t('sidebarInitialSupply')}</span>
                    <input type="number" value={params.initialSupply} onChange={e => setParams({...params, initialSupply: parseFloat(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-[9px] text-slate-500 uppercase font-medium">{t('sidebarBurnRate')}</span><span className="text-indigo-400 text-[9px] font-bold">{(params.burnPct*100).toFixed(0)}%</span></div>
                    <input type="range" min="0" max="1" step="0.01" value={params.burnPct} onChange={e => setParams({...params, burnPct: parseFloat(e.target.value)})} className="w-full accent-indigo-600 h-1 bg-slate-800 rounded-lg appearance-none" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-[9px] text-slate-500 uppercase font-medium">Weekly Emissions</span><span className="text-indigo-400 text-[9px] font-bold">{formatCompact(params.maxMintWeekly)}</span></div>
                    <input type="range" min="1000" max="10000000" step="10000" value={params.maxMintWeekly} onChange={e => setParams({...params, maxMintWeekly: parseInt(e.target.value)})} className="w-full accent-indigo-600 h-1 bg-slate-800 rounded-lg appearance-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-widest">{t('sidebarEnvironment')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['consistent', 'growth', 'volatile', 'high-to-decay'].map(d => (
                    <button key={d} onClick={() => setParams({...params, demandType: d as any})} className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all border active:scale-95 ${params.demandType === d ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/20' : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700'}`}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>
          
          <section className="mt-auto pt-6 border-t border-slate-800">
            <button onClick={analyzeWithAI} disabled={aiLoading} className="w-full bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-400 py-3.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 group active:scale-95">
              <BrainCircuit size={14} className="group-hover:text-indigo-400" /> {t('aiBtn')}
            </button>
          </section>
        </aside>

        <main className="flex-1 overflow-y-auto bg-slate-950 p-8 custom-scrollbar">
          <div className="grid grid-cols-4 gap-5 mb-10">
            <MetricCard title={t('metricHealth')} value={protocolHealth.score.toString()} icon={HeartPulse} subValue={protocolHealth.status} subColor={protocolHealth.score > 70 ? 'text-emerald-400' : protocolHealth.score > 40 ? 'text-amber-400' : 'text-rose-400'} />
            <MetricCard title={t('metricSupply')} value={aggregated.length ? formatCompact(aggregated[aggregated.length-1].supply.mean) : '0'} icon={Database} />
            <MetricCard title={t('metricGap')} value={aggregated.length ? formatCompact(aggregated[aggregated.length-1].burned.mean - aggregated[aggregated.length-1].minted.mean) : '0'} icon={ArrowDownUp} subValue={aggregated.length && (aggregated[aggregated.length-1].burned.mean > aggregated[aggregated.length-1].minted.mean) ? "Deflationary" : "Inflationary"} subColor={aggregated.length && (aggregated[aggregated.length-1].burned.mean > aggregated[aggregated.length-1].minted.mean) ? "text-emerald-400" : "text-amber-400"} />
            <MetricCard title={t('metricRetention')} value={aggregated.length ? `${((aggregated[aggregated.length-1].providers.mean / 30) * 100).toFixed(0)}%` : '100%'} icon={UserCheck} />
          </div>

          <div className="flex items-center justify-between mb-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 border-r border-slate-800 pr-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{t('toolbarStatus')}</span>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${protocolHealth.score > 40 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>{protocolHealth.status}</div>
              </div>
              <button onClick={() => setPlaybackMode(!playbackMode)} className={`flex items-center gap-2 text-[10px] font-bold uppercase px-4 py-2 rounded-xl border transition-all active:scale-95 ${playbackMode ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30' : 'border-slate-800 text-slate-500 bg-slate-900/50 hover:bg-slate-800'}`}><Clock size={14} /> {t('toolbarPlayback')}</button>
            </div>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-800">{t('toolbarWeek')} {playbackWeek} / {params.T}</div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            <BaseChartBox title={t('chartTitle1')} icon={Activity} color="indigo">
              <ComposedChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} tickFormatter={formatCompact} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Area type="monotone" dataKey={(d: any) => d.capacity.mean} stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} name="Capacity" />
                <Line type="monotone" dataKey={(d: any) => d.demand_served.mean} stroke="#fbbf24" strokeWidth={2} dot={false} name="Demand Served" />
              </ComposedChart>
            </BaseChartBox>
            <BaseChartBox title={t('chartTitle2')} icon={Users} color="emerald">
              <LineChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Line type="step" dataKey={(d: any) => d.providers.mean} stroke="#10b981" strokeWidth={2.5} dot={false} name="Providers" />
                <ReferenceLine y={10} stroke="#f43f5e" strokeDasharray="3 3" />
              </LineChart>
            </BaseChartBox>
            <BaseChartBox title={t('chartTitle3')} icon={Scale} color="amber">
              <ComposedChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} tickFormatter={formatCompact} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Line type="monotone" dataKey={(d: any) => d.burned.mean} stroke="#fbbf24" strokeWidth={2} dot={false} name="Tokens Burned" />
                <Line type="monotone" dataKey={(d: any) => d.minted.mean} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Tokens Minted" />
              </ComposedChart>
            </BaseChartBox>
            <BaseChartBox title={t('chartTitle4')} icon={BarChart3} color="rose">
              <AreaChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Area type="monotone" dataKey={(d: any) => d.utilization.mean} stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} name="Utilization %" />
              </AreaChart>
            </BaseChartBox>
            <BaseChartBox title={t('chartTitle5')} icon={Database} color="violet">
              <LineChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} tickFormatter={formatCompact} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Line type="monotone" dataKey={(d: any) => d.supply.mean} stroke="#8b5cf6" strokeWidth={2} dot={false} name="Circ. Supply" />
              </LineChart>
            </BaseChartBox>
            <BaseChartBox title={t('chartTitle6')} icon={DollarSign} color="blue">
              <LineChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Line type="monotone" dataKey={(d: any) => d.servicePrice.mean} stroke="#3b82f6" strokeWidth={2} dot={false} name="CHF / Unit" />
              </LineChart>
            </BaseChartBox>
          </div>

          {showResearchBlueprint && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-700/50">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                   <div className="flex items-center gap-3 text-emerald-400 font-bold uppercase tracking-widest text-[11px]">
                     <FileJson size={20} /><span>{t('blueprintTitle')}</span>
                   </div>
                   <button onClick={() => setShowResearchBlueprint(false)} className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-900 flex flex-col gap-12">
                  
                  {/* Transferability Framework */}
                  <section className="bg-slate-950/40 border border-emerald-500/10 p-7 rounded-3xl shadow-inner">
                    <div className="flex items-center gap-3 mb-8 text-emerald-400">
                      <Boxes size={22} className="shrink-0" />
                      <div className="h-[2px] w-8 bg-emerald-500/20" />
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em]">{t('blueprintTransfer')}</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-5 tracking-widest flex items-center gap-2">
                          <ListChecks size={14} className="text-emerald-400" /> Minimum Viable Calibration (MVC)
                        </h5>
                        <div className="space-y-3">
                          {MIN_VIABLE_CALIBRATION.map((item, idx) => (
                            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                              <span className="text-[11px] text-slate-300 font-bold">{item.item}</span>
                              <span className="text-[9px] text-slate-600 bg-slate-900 px-2 py-1 rounded border border-slate-800 uppercase font-mono">{item.source}</span>
                            </div>
                          ))}
                        </div>

                        <h5 className="text-[10px] font-bold text-slate-500 uppercase mt-8 mb-5 tracking-widest flex items-center gap-2">
                           Nice-to-Have Data Points
                        </h5>
                        <div className="space-y-3">
                          {NICE_TO_HAVE_CALIBRATION.map((item, idx) => (
                            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center opacity-60 hover:opacity-100 transition-all">
                              <span className="text-[11px] text-slate-300 font-bold">{item.item}</span>
                              <span className="text-[9px] text-slate-600 px-2 py-1 font-mono">{item.source}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div>
                          <h5 className="text-[10px] font-bold text-indigo-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                            <Repeat size={14} /> Multi-DePIN Comparison Logic
                          </h5>
                          <div className="bg-indigo-950/5 border border-indigo-500/10 p-6 rounded-2xl">
                             <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                               Where precise internal data is unavailable, we employ **Range-Based Monte Carlo Analysis**.
                             </p>
                             <ul className="space-y-3 text-[10px] text-slate-500 font-medium">
                               <li className="flex gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full mt-1.5 shrink-0" /> Define <b>Lower/Upper Bounds</b> for unknown OpEx costs.</li>
                               <li className="flex gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full mt-1.5 shrink-0" /> Stochastic sampling picks random points within ranges per iteration.</li>
                               <li className="flex gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full mt-1.5 shrink-0" /> Observe if the system remains <b>Directionally Stable</b> across the entire range.</li>
                             </ul>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Thesis Explanation: Directional Robustness</h5>
                          <div className="p-5 border-l-2 border-indigo-500/50 bg-slate-950/50 rounded-r-2xl italic">
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              "This framework shifts the evaluation of DePIN protocols from **deterministic forecasting** (which relies on private data) to **mechanistic stress-testing**. By separating standardized scenarios (shocks) from protocol-specific calibrations, we can evaluate 'Directional Robustness'—the inherent ability of a network's incentive structure to correct itself under pressure, regardless of exact numerical starting conditions."
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Sanity Checks Section */}
                  <section className="bg-slate-950/40 border border-indigo-500/10 p-7 rounded-3xl shadow-inner">
                    <div className="flex items-center gap-3 mb-8 text-indigo-400">
                      <Calculator size={22} className="shrink-0" />
                      <div className="h-[2px] w-8 bg-indigo-500/20" />
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.2em]">Sanity Checks & Logic Guardrails</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-5 tracking-widest">Core Simulation Equations</h5>
                        <div className="space-y-4">
                          {SANITY_EQUATIONS.map((e, idx) => (
                            <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 group hover:border-indigo-500/40 transition-all">
                              <code className="block text-indigo-400 text-[11px] font-mono mb-2">{e.eq}</code>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{e.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-8">
                        <div>
                          <h5 className="text-[10px] font-bold text-rose-500/80 uppercase mb-5 tracking-widest flex items-center gap-2">
                            <AlertTriangle size={14} /> Debugging Guide
                          </h5>
                          <div className="bg-rose-950/5 border border-rose-500/10 p-6 rounded-2xl">
                             <ul className="space-y-4">
                               {BUG_CHECKLIST.map((bug, i) => (
                                 <li key={i} className="flex gap-3 text-[11px] text-slate-400 leading-relaxed font-medium">
                                   <span className="text-rose-500/50 font-mono text-[10px] mt-0.5">[{i+1}]</span>
                                   {bug}
                                 </li>
                               ))}
                             </ul>
                          </div>
                        </div>
                        <div className="bg-emerald-950/5 border border-emerald-500/10 p-6 rounded-2xl">
                          <h6 className="text-[10px] font-bold text-emerald-500 uppercase mb-3 tracking-widest">Operational Safeguards</h6>
                          <div className="space-y-2">
                             <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic border-l-2 border-emerald-500/30 pl-4">
                               1. Clamp `supply` floor at 1k.<br/>
                               2. Protect `capacity` zero-division spikes.<br/>
                               3. Cumulative loss churn (Consecutive week tracking).
                             </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Standardized Protocol Archetypes (V1)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {PROTOCOL_PROFILES.map((p) => (
                        <div key={p.metadata.id} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all flex flex-col group">
                          <div className="flex justify-between items-start mb-4">
                             <div className="text-[12px] font-extrabold text-emerald-400 uppercase tracking-tight">{p.metadata.name}</div>
                             <button onClick={() => loadProfile(p)} className="p-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95" title="Load Params"><Download size={16} /></button>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed mb-6 flex-1 italic group-hover:text-slate-400 transition-colors">{p.metadata.notes}</p>
                          <div className="space-y-2.5 pt-5 border-t border-slate-800/60 font-mono">
                             <div className="flex justify-between text-[10px] uppercase font-bold text-slate-600"><span>Lag Window</span><span className="text-slate-300">{p.parameters.adjustment_lag.value} {p.parameters.adjustment_lag.unit}</span></div>
                             <div className="flex justify-between text-[10px] uppercase font-bold text-slate-600"><span>Emissions</span><span className="text-slate-300">{formatCompact(p.parameters.emissions.value)} / wk</span></div>
                             <div className="flex justify-between text-[10px] uppercase font-bold text-slate-600"><span>OpEx Mid</span><span className="text-slate-300">{p.parameters.provider_economics.opex_weekly.value} CHF</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  
                </div>
                <div className="p-6 bg-slate-950/50 border-t border-slate-800 text-center">
                    <button onClick={() => setShowResearchBlueprint(false)} className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-xl shadow-indigo-600/30 active:scale-95">{t('blueprintExit')}</button>
                </div>
              </div>
            </div>
          )}

          {showAiSheet && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in zoom-in-95 duration-200">
               <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-slate-700/50">
                 <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                   <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase tracking-widest text-sm"><BrainCircuit size={22} /><span>Robustness Report</span></div>
                   <button onClick={() => setShowAiSheet(false)} className="p-1.5 text-slate-500 hover:text-white bg-slate-800 rounded-full transition-colors"><X size={18} /></button>
                 </div>
                 <div className="p-8 overflow-y-auto custom-scrollbar">
                   {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-5">
                      <div className="relative">
                        <RefreshCw className="animate-spin text-indigo-500" size={48} />
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse rounded-full" />
                      </div>
                      <p className="text-slate-400 animate-pulse font-bold tracking-widest text-[11px] uppercase">Processing Analysis...</p>
                    </div>
                   ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50">{aiAnalysis || "Simulation complete."}</div>
                    </div>
                   )}
                 </div>
                 <div className="p-6 bg-slate-950/50 border-t border-slate-800 text-center">
                  <button onClick={() => setShowAiSheet(false)} className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all uppercase tracking-widest active:scale-95">Close Report</button>
                 </div>
               </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        input[type="range"] { -webkit-appearance: none; background: transparent; }
        input[type="range"]::-webkit-slider-thumb {
          height: 18px; width: 18px; border-radius: 50%; background: #6366f1;
          border: 3px solid #0f172a; -webkit-appearance: none; margin-top: -7px;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.4); cursor: pointer;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          width: 100%; height: 4px; cursor: pointer; background: #1e293b; border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
