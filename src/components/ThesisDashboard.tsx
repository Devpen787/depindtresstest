
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ScatterController,
    ScriptableContext
} from 'chart.js';
import { Line, Chart as ChartComponent, Scatter } from 'react-chartjs-2';
import { Activity, ShieldAlert, TrendingDown, BookOpen, AlertCircle, CheckCircle2, ChevronRight, Play, Settings2, FolderGit2 } from 'lucide-react';
import type { ProtocolProfileV1 } from '../data/protocols';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ScatterController
);

// --- STYLING CONSTANTS ---
const COLORS = {
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8',
    green: '#22c55e', // Green-500
    greenDark: '#15803d', // Green-700
    red: '#f43f5e',   // Rose-500
    redDark: '#be123c', // Rose-700
    blue: '#3b82f6',
    yellow: '#fbbf24',
    purple: '#a855f7'
};

const FONTS = "'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'";

// Set Defaults
ChartJS.defaults.color = COLORS.muted;
ChartJS.defaults.font.family = FONTS;
ChartJS.defaults.borderColor = '#334155';

interface ThesisDashboardProps {
    activeProfile?: ProtocolProfileV1;
    protocols?: ProtocolProfileV1[];
    onSelectProtocol?: (profile: ProtocolProfileV1) => void;
}

export const ThesisDashboard: React.FC<ThesisDashboardProps> = ({
    activeProfile,
    protocols,
    onSelectProtocol
}) => {
    // --- STATE ---
    const [price, setPrice] = useState(0.020);
    const [capex, setCapex] = useState(800);
    const [scenario, setScenario] = useState<'baseline' | 'bearish' | 'taper'>('baseline');
    const [showCitations, setShowCitations] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Initial load effect to set sensible defaults based on profile if available
    useEffect(() => {
        if (activeProfile) {
            // Rough heuristic for "current price" or sensible default
            // If we had live data passed in, we'd use that. For now, reset to generic low default
            // setPrice(0.020); // Keep user control or reset? Let's keep existing behavior for now.
        }
    }, [activeProfile]);

    // --- SIMULATION ENGINE ---
    const simulationResult = useMemo(() => {
        // DERIVE CONSTANTS FROM PROFILE
        const profile = activeProfile?.parameters;

        // Default fallbacks if no profile
        const INITIAL_NODES = profile ? profile.initial_active_providers.value : 4500;
        const EMISSIONS_WEEKLY = profile ? profile.emissions.value : 5_000_000;
        const OPEX_COST = profile ? profile.provider_economics.opex_weekly.value / 7 : 5.00; // Daily OpEx
        const ANNUAL_DECAY = 0.16; // Standard decay assumption

        // Calculate implied average daily reward per node at start
        const avgDailyRewards = (EMISSIONS_WEEKLY / 7) / Math.max(1, INITIAL_NODES);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const urbanNodesArr: number[] = [];
        const ruralNodesArr: number[] = [];
        const solvencyArr: number[] = [];
        const vanityCoverageArr: number[] = [];
        const vanityMinersArr: number[] = [];

        // Initial Distribution
        let currentUrban = INITIAL_NODES * 0.70;
        let currentRural = INITIAL_NODES * 0.30;

        // Initial Coverage (km2) - simpler model: Urban adds little coverage (redundant), Rural adds lots
        let currentCoverage = (currentUrban * 0.05) + (currentRural * 5);

        const monthlyDecay = 1 - (ANNUAL_DECAY / 12);
        let currentReward = avgDailyRewards;

        // Solvency Base (Burn/Mint) - starts > 1.0 (Deflationary)
        let currentSolvency = 1.25;

        for (let i = 0; i < 12; i++) {
            // 1. Decay Rewards
            currentReward = currentReward * monthlyDecay;

            // 2. Financials
            const monthRevenue = (currentReward * 30) * price;
            const netProfit = monthRevenue - OPEX_COST * 30; // Monthly

            // 3. Agent Logic
            let urbanChurn = 0;
            let ruralChurn = 0;

            // Scenario Modifiers
            let macroStress = 0;
            if (scenario === 'bearish') macroStress = 0.05; // Extra 5% churn pressure
            if (scenario === 'taper') currentReward *= 0.95; // Extra emission cut

            // Urban (Mercenary)
            if (netProfit < 0) {
                urbanChurn = 0.25 + macroStress;
            } else {
                const payback = capex / netProfit;
                if (payback > 18) urbanChurn = 0.08 + macroStress;
                else if (payback > 12) urbanChurn = 0.02;
                else urbanChurn = -0.05; // Growth
            }

            // Rural (Utility)
            if (netProfit < -OPEX_COST * 15) { // Tolerance threshold (more resilient)
                ruralChurn = 0.10 + macroStress;
            } else if (netProfit > 0) {
                ruralChurn = -0.02; // Slow growth
            }

            // Apply Churn
            currentUrban = Math.max(0, currentUrban * (1 - urbanChurn));
            currentRural = Math.max(0, currentRural * (1 - ruralChurn));

            // Solvency Decay Logic (Simulated)
            // Fix: Use smoother sigmoid-like decay instead of linear hard crash at 0.05
            // Price > 0.10: Health 1.0. Price -> 0: Health -> 0 smoothly.
            const basePriceRef = 0.15; // Reference healthy price
            const priceImpact = Math.pow(Math.min(1, price / basePriceRef), 1.5); // Smoother curve
            const solvencyNoise = (Math.random() * 0.05) - 0.025;
            currentSolvency = (currentSolvency * 0.98 * priceImpact) + solvencyNoise;

            // Vanity Metrics
            const totalMiners = currentUrban + currentRural;
            // Urban has high diminishing returns on coverage, Rural is linear
            currentCoverage = (currentUrban * 0.05) + (currentRural * 5);

            urbanNodesArr.push(Math.round(currentUrban));
            ruralNodesArr.push(Math.round(currentRural));
            solvencyArr.push(currentSolvency);
            vanityCoverageArr.push(currentCoverage);
            vanityMinersArr.push(Math.round(totalMiners));
        }

        // Metrics Calculation
        const monthlyRevenue = (currentReward * 30) * price;
        const netProfit = monthlyRevenue - (OPEX_COST * 30);
        const paybackMonths = netProfit > 0 ? capex / netProfit : 999;

        const startNodes = INITIAL_NODES;
        const endNodes = urbanNodesArr[11] + ruralNodesArr[11];
        const survivalRate = Math.round((endNodes / startNodes) * 100);

        return {
            months,
            urbanNodes: urbanNodesArr,
            ruralNodes: ruralNodesArr,
            solvency: solvencyArr,
            vanityCoverage: vanityCoverageArr,
            vanityMiners: vanityMinersArr,
            paybackMonths,
            monthlyRevenue,
            survivalRate,
            opexMonthly: OPEX_COST * 30
        };

    }, [price, capex, scenario, activeProfile]);

    // --- CHART DATA GENERATION ---
    const stressData = {
        labels: simulationResult.months,
        datasets: [
            {
                label: 'Rural Utility (Resilient)',
                data: simulationResult.ruralNodes,
                borderColor: COLORS.green,
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'Urban Speculators (High Risk)',
                data: simulationResult.urbanNodes,
                borderColor: COLORS.red,
                backgroundColor: 'rgba(244, 63, 94, 0.5)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }
        ]
    };

    const solvencyChartData = {
        labels: simulationResult.months,
        datasets: [
            {
                label: 'Burn-to-Mint Ratio',
                data: simulationResult.solvency,
                segment: {
                    borderColor: (ctx: any) => ctx.p0.parsed.y < 1 ? COLORS.red : COLORS.green,
                    backgroundColor: (ctx: any) => ctx.p0.parsed.y < 1 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                },
                borderColor: COLORS.green,
                fill: true,
                tension: 0.4
            }
        ]
    };

    const vanityChartData = {
        labels: simulationResult.months,
        datasets: [
            {
                type: 'line' as const,
                label: 'Effective Coverage (km²)',
                data: simulationResult.vanityCoverage,
                borderColor: COLORS.purple,
                borderWidth: 3,
                yAxisID: 'y1',
                tension: 0.4
            },
            {
                type: 'bar' as const,
                label: 'Total Miners',
                data: simulationResult.vanityMiners,
                backgroundColor: 'rgba(148, 163, 184, 0.5)', // Slate-400
                borderRadius: 4,
                yAxisID: 'y'
            }
        ]
    };

    // --- GEOSPATIAL SCATTER ---
    // Generate static points but color them based on survival logic?
    // For simplicity, we keep the static scatter but update the legend/text based on state
    const geoData = useMemo(() => {
        const urbanPoints = Array.from({ length: 80 }, () => ({
            x: Math.random() * 30 + 35,
            y: Math.random() * 30 + 35
        }));
        const ruralPoints = Array.from({ length: 40 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100
        }));
        return {
            datasets: [
                {
                    label: 'Urban Cluster',
                    data: urbanPoints,
                    backgroundColor: simulationResult.paybackMonths > 18 ? COLORS.red : 'rgba(244, 63, 94, 0.3)',
                    borderColor: COLORS.red,
                    pointRadius: 4
                },
                {
                    label: 'Rural Node',
                    data: ruralPoints,
                    backgroundColor: COLORS.green,
                    borderColor: COLORS.green,
                    pointRadius: 6,
                    pointStyle: 'rectRot'
                }
            ]
        };
    }, [simulationResult.paybackMonths]);

    // --- OPTIONS ---
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: COLORS.text,
                bodyColor: COLORS.muted,
                borderColor: '#334155',
                borderWidth: 1,
                padding: 10,
                displayColors: true
            }
        },
        scales: {
            x: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 10 } } },
            y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 10 } } }
        }
    };

    // --- RENDER HELPERS ---
    const Citation: React.FC<{ tag: string }> = ({ tag }) => (
        <span className={`align-super text-[10px] text-indigo-400 font-serif ml-1 tracking-wide ${showCitations ? 'inline' : 'hidden'}`}>
            {tag}
        </span>
    );

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-[#f8fafc] font-sans selection:bg-indigo-500/30 overflow-hidden">

            {/* SIDEBAR CONTROL CENTER */}
            <aside className={`bg-[#0f172a] border-r border-slate-800 transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-40 lg:relative ${sidebarCollapsed ? 'w-16' : 'w-80'} mt-16 lg:mt-0`}>

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]">
                    {!sidebarCollapsed && (
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Settings2 size={16} className="text-indigo-400" /> Control Center
                            </h2>
                            <p className="text-[10px] text-slate-500 mt-1">Adjust Simulation Parameters</p>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        {sidebarCollapsed ? <Settings2 size={20} /> : <ChevronRight size={20} className="rotate-180" />}
                    </button>
                </div>

                {/* Controls - Hide if collapsed */}
                {!sidebarCollapsed && (
                    <div className="p-6 space-y-8 overflow-y-auto flex-1">

                        {/* Protocol Selector */}
                        {protocols && onSelectProtocol && activeProfile && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                    Simulated Protocol
                                </label>
                                <div className="space-y-1">
                                    <div className="relative">
                                        <select
                                            value={activeProfile.metadata.id}
                                            onChange={(e) => {
                                                const p = protocols.find(p => p.metadata.id === e.target.value);
                                                if (p) onSelectProtocol(p);
                                            }}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white mobile:text-sm focus:border-indigo-500 outline-none transition-colors appearance-none font-bold"
                                        >
                                            {protocols.map(p => (
                                                <option key={p.metadata.id} value={p.metadata.id}>{p.metadata.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-2.5 pointer-events-none text-indigo-400">
                                            <FolderGit2 size={14} />
                                        </div>
                                        <div className="absolute right-3 top-2.5 pointer-events-none text-slate-500">
                                            <ChevronRight size={14} className="rotate-90" />
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-slate-500 px-1 mt-1 flex items-center justify-between">
                                        <span>Uses calibrated {activeProfile.metadata.name} parameters.</span>
                                        {activeProfile.metadata.chain && (
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${activeProfile.metadata.chain === 'solana' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                                                activeProfile.metadata.chain === 'ethereum' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                                    activeProfile.metadata.chain === 'polygon' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                                        'bg-slate-500/20 text-slate-300 border-slate-500/30'
                                                }`}>
                                                {activeProfile.metadata.chain}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        <hr className="border-slate-800" />

                        {/* Price Slider */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Token Price <Citation tag="[Eq 2.1]" />
                                </label>
                                <span className="font-mono text-lg font-bold text-indigo-400">${price.toFixed(3)}</span>
                            </div>
                            <input
                                type="range"
                                min="0.005" max="0.30" step="0.001"
                                value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                                <span>$0.005 (Crash)</span>
                                <span>$0.30 (Moon)</span>
                            </div>
                        </div>

                        {/* CAPEX Selector */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                Hardware Cost <Citation tag="[Sec 3.2]" />
                            </label>
                            <div className="relative">
                                <select
                                    value={capex}
                                    onChange={(e) => setCapex(parseInt(e.target.value))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-300 focus:border-indigo-500 outline-none transition-colors appearance-none"
                                >
                                    <option value="400">Entry Level ($400 - DIY)</option>
                                    <option value="800">Prosumer ($800 - Standard)</option>
                                    <option value="2000">Enterprise ($2000 - Ref Grade)</option>
                                </select>
                                <div className="absolute right-3 top-2.5 pointer-events-none text-slate-500">
                                    <ChevronRight size={14} className="rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Scenario Selector */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                Macro Scenario <Citation tag="[Fig 9.1]" />
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { id: 'baseline', label: 'Baseline', desc: 'Organic Growth' },
                                    { id: 'bearish', label: 'Bearish Macro', desc: 'High Churn Pressure' },
                                    { id: 'taper', label: 'Emissions Taper', desc: 'Supply Shock' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setScenario(opt.id as any)}
                                        className={`text-left px-3 py-2 rounded-lg border transition-all ${scenario === opt.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                    >
                                        <div className="text-xs font-bold uppercase">{opt.label}</div>
                                        <div className={`text-[10px] ${scenario === opt.id ? 'text-indigo-200' : 'text-slate-600'}`}>{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Solana Advantage Card */}
                        {activeProfile.metadata.chain === 'solana' && (
                            <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-1 flex items-center justify-between">
                                    <span>Solana Architecture</span>
                                    <span className="text-[8px] bg-indigo-500 text-white px-1 rounded">ACTIVE</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[9px] text-slate-400">
                                        <CheckCircle2 size={10} className="text-emerald-400" />
                                        <span>SVM Parallel Execution</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-slate-400">
                                        <CheckCircle2 size={10} className="text-emerald-400" />
                                        <span>State Compression (cNFTs)</span>
                                    </div>
                                    <p className="text-[9px] text-indigo-400/80 mt-2 italic leading-tight">
                                        "Million-device scale at nearly zero cost."
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Toggles */}
                        <div className="pt-6 border-t border-slate-800">
                            <button
                                onClick={() => setShowCitations(!showCitations)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${showCitations ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                    <BookOpen size={14} /> Citations
                                </span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${showCitations ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${showCitations ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </button>
                        </div>

                        {/* Mini Verdict in Sidebar for Visibility */}
                        <div className={`p-4 rounded-lg border ${simulationResult.paybackMonths > 18 ? 'bg-red-950/30 border-red-900/50' : 'bg-emerald-950/30 border-emerald-900/50'}`}>
                            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                <Activity size={12} /> Status
                            </div>
                            <div className={`text-xs font-bold ${simulationResult.paybackMonths > 18 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {simulationResult.paybackMonths > 18 ? 'CAPITULATION RISK' : 'HEALTHY GROWTH'}
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide bg-[#0f172a]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                    {/* Header for Active Protocol */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                {activeProfile ? activeProfile.metadata.name : 'Unknown Protocol'}
                                <span className="text-[#94a3b8] font-normal text-sm hidden sm:inline-block">| Thesis Simulation</span>
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">
                                Mechanism: <span className="text-indigo-400">{activeProfile?.metadata.mechanism}</span>
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <span className="px-3 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] text-xs font-mono border border-[#3b82f6]/20">v.1.1.0 Interactive</span>
                        </div>
                    </div>

                    {/* METRICS GRID */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Activity size={64} />
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Network Resilience <Citation tag="[Def 1.2]" /></div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-mono font-bold ${simulationResult.survivalRate > 50 ? 'text-green-400' : 'text-red-400'}`}>
                                    {simulationResult.survivalRate}%
                                </span>
                                <span className="text-xs text-slate-500 font-bold uppercase">Survival Rate</span>
                            </div>
                            <div className="mt-4 text-xs text-slate-400 leading-relaxed">
                                Projected node retention. <strong className="text-white">Rural utility nodes</strong> represent the floor.
                            </div>
                        </div>

                        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShieldAlert size={64} />
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Miner Payback <Citation tag="[Eq 3.4]" /></div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-mono font-bold ${simulationResult.paybackMonths < 18 ? 'text-green-400' : 'text-red-400'}`}>
                                    {simulationResult.paybackMonths > 60 ? '>5y' : `${simulationResult.paybackMonths.toFixed(1)}mo`}
                                </span>
                                <span className="text-xs text-slate-500 font-bold uppercase">ROI Period</span>
                            </div>
                            <div className="mt-4 text-xs text-slate-400 leading-relaxed">
                                If Payback &gt; 18mo, <strong className="text-red-400">Urban Speculators</strong> capitulate. Rural nodes ignore this signal.
                            </div>
                        </div>

                        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingDown size={64} />
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Monthly Revenue <Citation tag="[Data 5.1]" /></div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-mono font-bold text-indigo-400">
                                    ${simulationResult.monthlyRevenue.toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-500 font-bold uppercase">Per Node</span>
                            </div>
                            <div className="mt-4 text-xs text-slate-400 leading-relaxed">
                                Vs OpEx: <strong className="text-emerald-400">${simulationResult.opexMonthly.toFixed(2)}</strong>. Net <span className={simulationResult.monthlyRevenue - simulationResult.opexMonthly > 0 ? 'text-emerald-400' : 'text-red-400'}>${(simulationResult.monthlyRevenue - simulationResult.opexMonthly).toFixed(2)}</span>
                            </div>
                        </div>
                    </section>

                    {/* THESIS VERDICT */}
                    <section className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-2xl">
                        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <BookOpen size={14} /> Thesis Verdict
                        </h3>
                        <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">
                            {simulationResult.paybackMonths > 18 ? (
                                <>
                                    At <strong>${price.toFixed(3)}</strong>, the Payback Period exceeds 18 months. <span className="text-red-400 bg-red-900/10 px-1 rounded">Urban miners capitulate</span> as capital seeks better yield. However, notice that <strong>Rural nodes</strong> (Green layer) remain relatively flat, validating the thesis that utility-driven deployments are price-inelastic compared to speculators.
                                </>
                            ) : (
                                <>
                                    At <strong>${price.toFixed(3)}</strong>, the network is profitable. Both Urban and Rural layers grow. This represents the "Flywheel" phase where token incentives successfully subsidize hardware CAPEX <Citation tag="[7]" />.
                                </>
                            )}
                        </p>
                    </section>

                    {/* MAIN CHARTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* CHART 1: CAPITULATION */}
                        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
                                        The Capitulation Curve <Citation tag="[Fig 5.2]" />
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">Urban (Red) vs Rural (Green) survival under stress.</p>
                                </div>
                            </div>
                            <div className="flex-1 min-h-[300px]">
                                <Line data={stressData} options={{ ...commonOptions, scales: { ...commonOptions.scales, y: { stacked: true, grid: { color: '#334155' } } } }} />
                            </div>
                        </div>

                        {/* CHART 2: SOLVENCY */}
                        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-yellow-500 rounded-full"></span>
                                        Solvency Mechanics <Citation tag="[Eq 4.2]" />
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">Burn-to-Mint Ratio. &lt; 1.0 means inflationary subsidy.</p>
                                </div>
                            </div>
                            <div className="flex-1 min-h-[300px]">
                                <ChartComponent type='line' data={solvencyChartData} options={commonOptions} />
                            </div>
                        </div>
                    </div>

                    {/* SECONDARY ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 overflow-hidden">

                        {/* CHART 3: VANITY TRAP */}
                        <div className="lg:col-span-2 bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                                        The Vanity Trap <Citation tag="[Sec 2.3]" />
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">Total Miners (Bars) vs Effective Coverage (Line).</p>
                                </div>
                            </div>
                            <div className="h-[300px]">
                                <ChartComponent type='bar' data={vanityChartData} options={{
                                    ...commonOptions,
                                    scales: {
                                        x: { grid: { display: false } },
                                        y: { type: 'linear', display: true, position: 'left', grid: { color: '#334155' } },
                                        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
                                    }
                                }} />
                            </div>
                        </div>

                        {/* CHART 4: GEOSPATIAL (Conditional) */}
                        {activeProfile?.metadata.model_type === 'location_based' && (
                            <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                                            Geospatial Resilience <Citation tag="[Map 1]" />
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">Topology Analysis (Abstract).</p>
                                    </div>
                                </div>
                                <div className="h-[300px]">
                                    <Scatter data={geoData} options={{
                                        ...commonOptions,
                                        scales: {
                                            x: { display: false },
                                            y: { display: false }
                                        }
                                    }} />
                                </div>
                                <div className="mt-4 flex gap-4 justify-center">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                        <span className={`w-2 h-2 rounded-full ${simulationResult.paybackMonths > 18 ? 'bg-red-500' : 'bg-red-500/30'}`}></span>
                                        Urban (Risk)
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Rural (Safe)
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};
