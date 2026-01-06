
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
  CheckCircle2
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
  events: any[];
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
}

// Multi-language strings
const TRANSLATIONS: any = {
  en: {
    appTitle: "DePIN Stress Test",
    version: "Thesis & Robustness Simulator V3.2",
    btnRun: "Run Simulation",
    btnBlueprint: "Research Blueprint",
    sidebarParams: "Parameters",
    sidebarHorizon: "Time Horizon",
    sidebarDuration: "Duration",
    sidebarWeeks: "weeks",
    sidebarTokenomics: "Tokenomics",
    sidebarInitialSupply: "Initial Supply",
    sidebarInitialPrice: "Initial Price",
    sidebarBurnRate: "Burn Rate",
    sidebarEnvironment: "Market Environment",
    sidebarDemandRegime: "Demand Regime",
    sidebarMacro: "Macro Trend",
    sidebarQuality: "Simulation Quality",
    sidebarQualityLabel: "Monte Carlo Runs",
    aiBtn: "AI ROBUSTNESS AUDIT",
    metricPrice: "Final Price (Trend)",
    metricSupply: "Circulating Supply",
    metricCapacity: "Final Capacity",
    metricUtilization: "Avg. Utilization",
    toolbarStatus: "Status",
    toolbarPlayback: "Playback",
    toolbarBaseline: "Set Baseline",
    toolbarWeek: "Week",
    chartTitle1: "Capacity vs Demand Served",
    chartTitle2: "Provider Retention",
    chartTitle3: "Burn vs Emissions",
    chartTitle4: "Network Efficiency (%)",
    chartTitle5: "Supply Trajectory",
    chartTitle6: "Service Pricing Proxy",
    healthStable: "ROBUST",
    healthCritical: "FRAGILE",
    healthAtRisk: "STRESSED",
    aiAuditTitle: "Research Assistant: Robustness Report",
    aiProcessing: "Assessing directional robustness...",
    aiClose: "Close Report",
    blueprintTitle: "Research Blueprint: ONO Stress Framework",
    blueprintMappingText: "Parameters represent relative forces, not exact predictions. Use these to test directional protocol survival.",
    blueprintGoodBad: "Operational Performance Guide (Good vs. Bad)",
    blueprintMethods: "Methodology (Thesis-Ready)",
    blueprintExit: "Exit Blueprint",
    aiPersona: "DePIN Protocol Research Lead",
    aiPromptRisk: "Analyze 'Death Spiral' triggers and 'Incentive Misalignment'. Avoid price targets.",
    adviceNote: "Focus on Directional Robustness • Not financial advice"
  },
  de: {
    appTitle: "DePIN Stress-Test",
    version: "Thesen- & Robustheits-Simulator V3.2",
    btnRun: "Simulation Starten",
    btnBlueprint: "Forschungs-Blueprint",
    sidebarParams: "Parameter",
    sidebarHorizon: "Zeithorizont",
    sidebarDuration: "Dauer",
    sidebarWeeks: "Wochen",
    sidebarTokenomics: "Tokenomics",
    sidebarInitialSupply: "Startangebot",
    sidebarInitialPrice: "Startpreis",
    sidebarBurnRate: "Burn-Rate",
    sidebarEnvironment: "Marktumgebung",
    sidebarDemandRegime: "Nachfrage-Regime",
    sidebarMacro: "Makro-Trend",
    sidebarQuality: "Simulations-Qualität",
    sidebarQualityLabel: "Monte Carlo Durchläufe",
    aiBtn: "AI ROBUSTHEITS-AUDIT",
    metricPrice: "Preis-Trend",
    metricSupply: "Umlaufmenge",
    metricCapacity: "Netzwerkkapazität",
    metricUtilization: "Ø Auslastung",
    toolbarStatus: "Status",
    toolbarPlayback: "Playback",
    toolbarBaseline: "Baseline setzen",
    toolbarWeek: "Woche",
    chartTitle1: "Kapazität vs. Genutzte Nachfrage",
    chartTitle2: "Anbieter-Retention",
    chartTitle3: "Burn vs. Emissionen",
    chartTitle4: "Netzwerk-Effizienz (%)",
    chartTitle5: "Supply-Trajektorie",
    chartTitle6: "Service-Preis Proxy",
    healthStable: "ROBUST",
    healthCritical: "FRAGIL",
    healthAtRisk: "GEFÄHRDET",
    aiAuditTitle: "Forschungsassistent: Robustheits-Bericht",
    aiProcessing: "Analyse der Richtungs-Robustheit...",
    aiClose: "Bericht Schliessen",
    blueprintTitle: "Forschungs-Blueprint: ONO Stress-Framework",
    blueprintMappingText: "Parameter stellen relative Kräfte dar, keine exakten Vorhersagen. Testen Sie das Überleben des Protokolls.",
    blueprintGoodBad: "Operativer Leitfaden (Gut vs. Schlecht)",
    blueprintMethods: "Methodik (Thesis-Ready)",
    blueprintExit: "Blueprint verlassen",
    aiPersona: "Leitender DePIN-Protokollforscher",
    aiPromptRisk: "Analysiere 'Death Spiral' Trigger und 'Incentive Misalignment'. Keine Preisziele.",
    adviceNote: "Fokus auf Richtungs-Robustheit • Keine Finanzberatung"
  }
};

const OPERATIONAL_GUIDE = {
  en: [
    { metric: "Provider Count", good: "Sticky or growing nodes even if rewards drop 20%.", bad: "Mass exit when reward < OpEx floor." },
    { metric: "Utilization", good: "Steady 40-70% range. Balanced growth.", bad: "<10% (Ghost town) or >95% (System congestion)." },
    { metric: "Burn/Mint Ratio", good: "Burn > Mint in high demand phases.", bad: "Mint >> Burn consistently (Supply hyperinflation)." },
    { metric: "Service Price", good: "Stable cost for users despite token volatility.", bad: "Service cost spikes causing users to churn." }
  ],
  de: [
    { metric: "Anbieter-Zahl", good: "Nodes bleiben stabil, auch wenn Belohnungen um 20% sinken.", bad: "Massen-Exodus sobald Belohnung < OpEx-Grenze." },
    { metric: "Auslastung", good: "Stabile 40-70% Range. Ausgewogenes Wachstum.", bad: "<10% (Ghost Town) oder >95% (System-Stau)." },
    { metric: "Burn/Mint Ratio", good: "Burn > Mint in Hochphasen.", bad: "Mint >> Burn dauerhaft (Hyperinflation)." },
    { metric: "Service-Preis", good: "Stabile Kosten für Nutzer trotz Token-Volatilität.", bad: "Preisspitzen führen zu Nutzerverlust (Churn)." }
  ]
};

const PROTOCOL_PROFILES = [
  {
    id: "ono",
    name: "ONO (Calibrated V3)",
    description: "Enterprise resource DePIN. Calibrated via interview: 900k/week emissions, 65% burn fraction, 6-week reward lag.",
    tokenomics: {
      model: "Fee-to-Burn (Manual Lag)",
      emissions_per_week: 900000,
      burn_fraction: 0.65,
      op_ex_threshold_chf: "17.3 - 34.6 per week",
      churn_logic: "Sensitive below 10 CHF/week"
    }
  },
  {
    id: "helium",
    name: "Helium-like (BME + Halvings)",
    description: "Emissions-heavy bootstrap phase. Burn-and-Mint Equilibrium (BME) logic with aggressive 2-year halvings.",
    tokenomics: {
      model: "BME",
      burn_dynamic: "Demand absorbs supply, fixed emission schedule",
      emission_style: "Hard-scheduled halving"
    }
  },
  {
    id: "adaptive",
    name: "Adaptive DePIN (Algorithmic)",
    description: "Automated response system. Rewards adjust to demand signals within a 2-week governance window.",
    tokenomics: {
      model: "Demand-Pull Adaptive",
      burn_dynamic: "Variable burn fraction based on utilization",
      emission_style: "Algorithmic supply elasticity"
    }
  }
];

const STRESS_SCENARIOS = [
  { name: "Bear market drawdown", duration: 52, stress: "Macro Price Decay", sensitivity: "Provider OpEx floor" },
  { name: "Demand shock", duration: 12, stress: "Rapid Utility Compression", sensitivity: "Burn volume drop" },
  { name: "Emissions taper", duration: 26, stress: "Incentive Reduction", sensitivity: "Provider attrition" },
  { name: "Provider churn shock", duration: 8, stress: "Operational Exit Spike", sensitivity: "Capacity redundancy" }
];

const RESEARCH_METHODS = {
  en: `This methodology describes the "directional robustness" of Decentralized Physical Infrastructure Networks (DePIN) under adverse operational conditions. It is critical to note that this framework does not aim to forecast absolute market prices. Instead, it functions as a mechanistic stress-testing tool designed to evaluate the structural integrity of tokenomic designs. By simulating the feedback loops between token supply, service demand, and provider incentives, we identify the specific thresholds where a protocol either maintains equilibrium or collapses into a "death spiral."

To ensure a standardized comparison, we evaluate three distinct protocol archetypes: a standard buy-and-burn model (ONO), a Burn-and-Mint Equilibrium model (Helium-like), and an algorithmic adaptive system. These archetypes are subjected to four identical stress scenarios, including macro-economic drawdowns, sudden demand shocks, and accelerated provider churn. The ONO profile used in this study was calibrated using data ranges derived from public technical documentation and expert interview data to ensure the simulation reflects realistic operational costs and incentive structures.

We employ Monte Carlo simulation methods (n=100 per run) to account for stochastic market volatility and parameter uncertainty. This probabilistic approach allows for the observation of emergent system behaviors that deterministic models fail to capture. The primary output metrics focus on network utility, provider retention, and the "sustainability gap" between token emissions and burns. In alignment with the principles of scientific transparency and academic rigor suitable for HSLU-level research, all simulation code, underlying mathematical assumptions, and scenario configurations are documented for full reproducibility.`,
  de: `Diese Methodik beschreibt die "richtungsweisende Robustheit" von dezentralisierten physischen Infrastrukturnetzwerken (DePIN) unter widrigen Betriebsbedingungen. Es ist wichtig festzuhalten, dass dieser Rahmen nicht darauf abzielt, absolute Marktpreise vorherzusagen. Stattdessen fungiert er als mechanistisches Stresstest-Tool zur Bewertung der strukturellen Integrität von tokenomischen Designs.

Um einen standardisierten Vergleich zu gewährleisten, evaluieren wir drei verschiedene Protokoll-Archetypen: ein Standard-Buy-and-Burn-Modell (ONO), ein Burn-and-Mint-Equilibrium-Modell (Helium-ähnlich) und ein algorithmisches adaptives System. Diese Archetypen werden vier identischen Stressszenarien unterzogen. Das ONO-Profil in dieser Studie wurde unter Verwendung von Datenbereichen kalibriert, die aus öffentlichen technischen Dokumentationen und Experteninterviews abgeleitet wurden.

Wir verwenden Monte-Carlo-Simulationsmethoden (n=100 pro Durchlauf), um stochastische Marktvolatilität und Parameterunsicherheiten zu berücksichtigen. Dieser probabilistische Ansatz ermöglicht die Beobachtung von emergentem Systemverhalten. Alle Simulationscodes, mathematischen Annahmen und Szenariokonfigurationen sind für die vollständige Reproduzierbarkeit dokumentiert.`
};

const MetricCard: React.FC<{ 
  title: string; 
  value: string; 
  subValue?: string; 
  subColor?: string 
}> = ({ title, value, subValue, subColor }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
    <div className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-2">{title}</div>
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
          providerCostPerWeek, baseCapacityPerProvider, kDemandPrice, kMintPrice } = params;

  let mu = 0.002, sigma = 0.05;
  if (macro === 'bearish') { mu = -0.01; sigma = 0.06; }
  else if (macro === 'bullish') { mu = 0.015; sigma = 0.06; }

  const demands = getDemandSeries(T, 12000, demandType, rng);
  const results: SimResult[] = [];

  let currentSupply = initialSupply;
  let currentPrice = initialPrice;
  let currentProviders = 30;
  let currentServicePrice = 0.5;

  for (let t = 0; t < T; t++) {
    const demand = demands[t];
    const capacity = currentProviders * baseCapacityPerProvider;
    const scarcity = (demand - capacity) / Math.max(capacity, 1.0);
    const demand_served = Math.min(demand, capacity);
    const utilization = (demand_served / Math.max(capacity, 1.0)) * 100;
    
    currentServicePrice = Math.min(Math.max(currentServicePrice * (1 + 0.6 * scarcity), 0.05), 5.0);
    const tokensSpent = (demand_served * currentServicePrice) / Math.max(currentPrice, 1e-6);
    const burned = burnPct * tokensSpent;
    const minted = Math.min(maxMintWeekly, maxMintWeekly * (0.6 + 0.6 * Math.tanh(demand / 15000.0)));

    currentSupply = Math.max(1.0, currentSupply + minted - burned);
    const rewardPerProvider = (minted / Math.max(currentProviders, 1.0)) * currentPrice;
    
    const incentive = (rewardPerProvider - providerCostPerWeek) / providerCostPerWeek;
    const delta = incentive * 5 + rng.normal() * 0.5;
    
    const demandPressure = kDemandPrice * Math.tanh(scarcity);
    const dilutionPressure = -kMintPrice * (minted / currentSupply) * 100;
    const logRet = mu + demandPressure + dilutionPressure + sigma * rng.normal();
    const nextPrice = Math.max(0.01, currentPrice * Math.exp(logRet));

    results.push({
      t, price: currentPrice, supply: currentSupply, demand, demand_served,
      providers: currentProviders, capacity, servicePrice: currentServicePrice,
      minted, burned, utilization
    });

    currentPrice = nextPrice;
    currentProviders = Math.max(2, currentProviders + delta);
  }
  return results;
}

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'de'>('en');
  const [params, setParams] = useState<SimulationParams>({
    T: 52, 
    initialSupply: 100000000, // Calibrated: Larger base for 900k emissions
    initialPrice: 3.0, 
    maxMintWeekly: 900000, // Calibrated: 900k emissions/week
    burnPct: 0.65, // Calibrated: 65% burn fraction
    demandType: 'growth', // Calibrated: "Early but growing"
    macro: 'bearish', 
    nSims: 100, 
    seed: 42,
    providerCostPerWeek: 25.0, // Calibrated: 900-1800 CHF/year midpoint
    baseCapacityPerProvider: 180.0, 
    kDemandPrice: 0.15, 
    kMintPrice: 0.35,
    events: []
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
      const keys: (keyof SimResult)[] = ['price', 'supply', 'demand', 'demand_served', 'providers', 'capacity', 'servicePrice', 'minted', 'burned', 'utilization'];
      
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

  const analyzeWithAI = async () => {
    if (!aggregated.length) return;
    setAiLoading(true);
    setShowAiSheet(true);
    try {
      const last = aggregated[aggregated.length - 1];
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as ${t('aiPersona')}. 
      Analyze this DePIN simulation for 'Directional Robustness'. 
      Burn Rate: ${params.burnPct*100}%. Final Capacity: ${last.capacity.mean.toFixed(0)}.
      Final Utilization: ${last.utilization.mean.toFixed(1)}%.
      ${t('aiPromptRisk')}
      No price predictions. Provide an audit in ${lang === 'de' ? 'German' : 'English'}.`;

      const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt });
      setAiAnalysis(response.text);
    } catch (e) {
      setAiAnalysis("Analysis failed. System error.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => { runSimulation(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const displayedData = useMemo(() => aggregated.slice(0, playbackWeek), [aggregated, playbackWeek]);
  
  const protocolHealth = useMemo(() => {
    if (!aggregated.length) return { status: t('healthStable'), score: 100 };
    const last = aggregated[aggregated.length - 1];
    if (last.utilization.mean > 95 || last.utilization.mean < 5) return { status: t('healthCritical'), score: 12 };
    if (last.providers.mean < 10) return { status: t('healthAtRisk'), score: 35 };
    return { status: t('healthStable'), score: 85 };
  }, [aggregated, lang]);

  const formatNum = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const formatCompact = (n: number) => n.toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 1 });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Scale className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-md font-extrabold tracking-tight">{t('appTitle')}</h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{t('version')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setLang(lang === 'en' ? 'de' : 'en')} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 uppercase">
            <Languages size={14} /><span>{lang}</span>
          </button>
          <button onClick={() => setShowResearchBlueprint(true)} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            <BookOpen size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">{t('btnBlueprint')}</span>
          </button>
          <button onClick={runSimulation} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2">
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
            {t('btnRun')}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[280px] border-r border-slate-800 p-6 overflow-y-auto bg-slate-950 flex flex-col gap-8 custom-scrollbar">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Settings2 size={14} className="text-slate-500" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('sidebarParams')}</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase mb-3">{t('sidebarHorizon')}</label>
                <input type="range" min="12" max="104" value={params.T} onChange={e => setParams({...params, T: parseInt(e.target.value)})} className="w-full accent-indigo-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer mb-2" />
                <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-600">{t('sidebarDuration')}</span><span className="text-indigo-400">{params.T} {t('sidebarWeeks')}</span></div>
              </div>
              <div className="space-y-4">
                <label className="block text-[9px] font-bold text-slate-600 uppercase">{t('sidebarTokenomics')}</label>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase">{t('sidebarInitialPrice')}</span>
                    <input type="number" value={params.initialPrice} onChange={e => setParams({...params, initialPrice: parseFloat(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-md px-2 py-1.5 text-xs font-mono" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span className="text-[9px] text-slate-500 uppercase">{t('sidebarBurnRate')}</span><span className="text-indigo-400 text-[9px] font-mono">{(params.burnPct*100).toFixed(0)}%</span></div>
                    <input type="range" min="0" max="1" step="0.01" value={params.burnPct} onChange={e => setParams({...params, burnPct: parseFloat(e.target.value)})} className="w-full accent-indigo-600 h-1 bg-slate-800 rounded-lg appearance-none" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span className="text-[9px] text-slate-500 uppercase">Max Weekly Mint</span><span className="text-indigo-400 text-[9px] font-mono">{formatCompact(params.maxMintWeekly)}</span></div>
                    <input type="range" min="1000" max="2000000" step="10000" value={params.maxMintWeekly} onChange={e => setParams({...params, maxMintWeekly: parseInt(e.target.value)})} className="w-full accent-indigo-600 h-1 bg-slate-800 rounded-lg appearance-none" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[9px] font-bold text-slate-600 uppercase">{t('sidebarEnvironment')}</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['consistent', 'growth', 'volatile', 'high-to-decay'].map(d => (
                    <button key={d} onClick={() => setParams({...params, demandType: d as any})} className={`py-1.5 rounded text-[8px] font-bold uppercase transition-all ${params.demandType === d ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-600 border border-slate-800'}`}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section className="mt-auto border-t border-slate-800 pt-6">
            <button onClick={analyzeWithAI} disabled={aiLoading} className="w-full bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-400 py-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2">
              <BrainCircuit size={14} /> {t('aiBtn')}
            </button>
          </section>
        </aside>

        <main className="flex-1 overflow-y-auto bg-slate-950 p-8 custom-scrollbar">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <MetricCard title={t('metricPrice')} value={`$${aggregated.length ? formatNum(aggregated[aggregated.length-1].price.mean) : '0.00'}`} />
            <MetricCard title={t('metricSupply')} value={aggregated.length ? formatCompact(aggregated[aggregated.length-1].supply.mean) : '0'} />
            <MetricCard title={t('metricCapacity')} value={aggregated.length ? formatCompact(aggregated[aggregated.length-1].capacity.mean) : '0'} />
            <MetricCard title={t('metricUtilization')} value={aggregated.length ? `${formatNum(aggregated[aggregated.length-1].utilization.mean)}%` : '0%'} />
          </div>

          <div className="flex items-center justify-between mb-8 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 border-r border-slate-800 pr-6">
                <span className="text-[9px] font-bold uppercase text-slate-600">{t('toolbarStatus')}</span>
                <div className={`px-2 py-0.5 rounded text-[9px] font-bold ${protocolHealth.status === t('healthStable') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{protocolHealth.status}</div>
              </div>
              <button onClick={() => setPlaybackMode(!playbackMode)} className={`flex items-center gap-2 text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg border ${playbackMode ? 'bg-indigo-600 text-white border-indigo-500' : 'border-slate-800 text-slate-500'}`}><Clock size={12} /> {t('toolbarPlayback')}</button>
            </div>
            <div className="text-[10px] font-mono text-slate-600">{t('toolbarWeek')} {playbackWeek} / {params.T}</div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <BaseChartBox title={t('chartTitle1')} icon={Activity} color="indigo">
              <ComposedChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} tickFormatter={formatCompact} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Area type="monotone" dataKey={(d: any) => d.capacity.mean} stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} />
                <Line type="monotone" dataKey={(d: any) => d.demand_served.mean} stroke="#fbbf24" strokeWidth={2} dot={false} />
              </ComposedChart>
            </BaseChartBox>

            <BaseChartBox title={t('chartTitle2')} icon={Users} color="emerald">
              <LineChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Line type="step" dataKey={(d: any) => d.providers.mean} stroke="#10b981" strokeWidth={2} dot={false} />
                <ReferenceLine y={10} stroke="#f43f5e" strokeDasharray="3 3" />
              </LineChart>
            </BaseChartBox>

            <BaseChartBox title={t('chartTitle3')} icon={Scale} color="amber">
              <ComposedChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Line type="monotone" dataKey={(d: any) => d.burned.mean} stroke="#fbbf24" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={(d: any) => d.minted.mean} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </BaseChartBox>

            <BaseChartBox title={t('chartTitle4')} icon={BarChart3} color="rose">
              <AreaChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Area type="monotone" dataKey={(d: any) => d.utilization.mean} stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} />
              </AreaChart>
            </BaseChartBox>

            <BaseChartBox title={t('chartTitle5')} icon={Database} color="violet">
              <LineChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} tickFormatter={formatCompact} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Line type="monotone" dataKey={(d: any) => d.supply.mean} stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </BaseChartBox>

            <BaseChartBox title={t('chartTitle6')} icon={DollarSign} color="blue">
              <LineChart data={displayedData} margin={{ left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }} />
                <Line type="monotone" dataKey={(d: any) => d.servicePrice.mean} stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </BaseChartBox>
          </div>

          {showResearchBlueprint && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                   <div className="flex items-center gap-3 text-emerald-400">
                     <FileJson size={20} /><h3 className="text-md font-bold">{t('blueprintTitle')}</h3>
                   </div>
                   <button onClick={() => setShowResearchBlueprint(false)} className="p-1.5 text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-full"><X size={18} /></button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-900 flex flex-col gap-10">
                  
                  {/* Research Methods Section */}
                  <section>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{t('blueprintMethods')}</h4>
                    <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-xl">
                      <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line italic">
                        {RESEARCH_METHODS[lang]}
                      </p>
                    </div>
                  </section>

                  {/* Protocol Profiles Comparison */}
                  <section>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Protocol Archetypes (Sam-Calibrated)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {PROTOCOL_PROFILES.map((p) => (
                        <div key={p.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl hover:border-emerald-500/50 transition-all">
                          <div className="text-[11px] font-bold text-emerald-400 uppercase mb-2">{p.name}</div>
                          <p className="text-[10px] text-slate-400 leading-relaxed mb-4">{p.description}</p>
                          <div className="space-y-1">
                             <div className="text-[8px] font-bold text-slate-600 uppercase">Tokenomics Logic</div>
                             <div className="text-[10px] text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">{p.tokenomics.model}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Good vs Bad Guide */}
                  <section>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{t('blueprintGoodBad')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(OPERATIONAL_GUIDE[lang] as any).map((item: any, i: number) => (
                        <div key={i} className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                          <div className="text-[11px] font-bold text-indigo-400 uppercase mb-3">{item.metric}</div>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                              <p className="text-[11px] text-slate-300"><span className="font-bold text-emerald-500">GOOD:</span> {item.good}</p>
                            </div>
                            <div className="flex gap-2">
                              <ZapOff size={14} className="text-rose-500 shrink-0" />
                              <p className="text-[11px] text-slate-400"><span className="font-bold text-rose-500">BAD:</span> {item.bad}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Standardization Logic & Checklist */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Research Differences</h4>
                      <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl space-y-4">
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Fixed emissions (Helium) rely on market price to sustain node OpEx, making them vulnerable to "death spirals" if tokens drop during halvings. Calibrated ONO models use direct fee-burn with manual reward lags, providing a "cushion" but potentially delaying system-correction during sudden shocks.
                        </p>
                      </div>
                    </section>
                    <section>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Standardization Checklist</h4>
                      <div className="bg-emerald-950/10 border border-emerald-500/20 p-6 rounded-xl grid grid-cols-2 gap-4">
                         <div className="space-y-3">
                            <div className="text-[9px] font-bold text-emerald-500 uppercase">Core Parameters</div>
                            {["Burn Rate", "Emission Cap", "Demand Sensitivity", "Macro Momentum"].map(item => (
                              <div key={item} className="flex items-center gap-2 text-[10px] text-slate-300"><CheckCircle2 size={12} className="text-emerald-500" />{item}</div>
                            ))}
                         </div>
                         <div className="space-y-3">
                            <div className="text-[9px] font-bold text-slate-500 uppercase">Optional Fields</div>
                            {["Governance Lag", "Staking Floor", "Exit Penalty", "Geographic Decay"].map(item => (
                              <div key={item} className="flex items-center gap-2 text-[10px] text-slate-500 opacity-50"><div className="w-3 h-3 border border-slate-700 rounded-sm" />{item}</div>
                            ))}
                         </div>
                      </div>
                    </section>
                  </div>

                  <section>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Calibrated Model Data (JSON)</h4>
                    <pre className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-[10px] text-emerald-400 font-mono overflow-x-auto whitespace-pre">
                      {JSON.stringify({ 
                        CALIBRATED_PROFILES: PROTOCOL_PROFILES,
                        STRESS_SCENARIOS
                      }, null, 2)}
                    </pre>
                  </section>
                </div>
                <div className="p-5 bg-slate-950/50 border-t border-slate-800 text-center">
                    <button onClick={() => setShowResearchBlueprint(false)} className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20">{t('blueprintExit')}</button>
                </div>
              </div>
            </div>
          )}

          {showAiSheet && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
               <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                 <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-3 text-indigo-400">
                     <BrainCircuit size={24} /><h3 className="text-lg font-bold">{t('aiAuditTitle')}</h3>
                   </div>
                   <button onClick={() => setShowAiSheet(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                 </div>
                 <div className="p-8 overflow-y-auto custom-scrollbar">
                   {aiLoading ? (
                     <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <RefreshCw className="animate-spin text-indigo-500" size={40} /><p className="text-slate-400 animate-pulse font-medium">{t('aiProcessing')}</p>
                     </div>
                   ) : (
                     <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{aiAnalysis || "Simulation finished."}</p>
                     </div>
                   )}
                 </div>
                 <div className="p-6 bg-slate-950/50 border-t border-slate-800 text-center">
                    <button onClick={() => setShowAiSheet(false)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all">{t('aiClose')}</button>
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
        input[type="range"]::-webkit-slider-thumb {
          height: 16px; width: 16px; border-radius: 50%; background: #4f46e5;
          border: 2px solid #0f172a; -webkit-appearance: none; margin-top: -6px;
        }
      `}</style>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
