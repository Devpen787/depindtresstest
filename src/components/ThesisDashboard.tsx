
import React, { useState, useMemo } from 'react';
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
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
    Activity,
    ShieldAlert,
    TrendingDown,
    Zap,
    Wallet,
    Users,
    AlertTriangle,
    CheckCircle2,
    Settings2,
    Server,
    Hammer,
    ChevronRight,
    Github,
    MessageSquare,
    Info
} from 'lucide-react';
import type { ProtocolProfileV1 } from '../data/protocols';
import { SCENARIOS, SimulationScenario } from '../data/scenarios';

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
    Filler
);

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
    // Risk Engine Inputs
    const [marketStress, setMarketStress] = useState<number>(-20); // -90 to +20
    const [competitorYield, setCompetitorYield] = useState<number>(0); // 0 to 200
    const [emissionType, setEmissionType] = useState<'fixed' | 'demand'>('fixed');
    const [revenueStrategy, setRevenueStrategy] = useState<'burn' | 'reserve'>('burn');

    // Legacy Inputs (Restored)
    const [capex, setCapex] = useState<number>(800); // Hardware Cost

    // Sidebar State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Scenario State
    const [selectedScenarioId, setSelectedScenarioId] = useState<string>('baseline');

    const handleScenarioChange = (scenarioId: string) => {
        setSelectedScenarioId(scenarioId);
        const scenario = SCENARIOS.find(s => s.id === scenarioId);
        if (!scenario) return;

        // map scenario params to dashboard inputs
        if (scenario.id === 'death_spiral') {
            setMarketStress(-50);
            setCompetitorYield(0);
        } else if (scenario.id === 'vampire_attack') {
            setMarketStress(-10);
            setCompetitorYield(200);
        } else if (scenario.id === 'growth_shock') {
            // New Scenario: Reset stress, focus on Supply Shock logic (which we will add)
            setMarketStress(0);
            setCompetitorYield(0);
        } else {
            // Reset
            setMarketStress(-20);
            setCompetitorYield(0);
        }
    };

    // --- LOGIC ENGINE (MERGED) ---
    const simulationData = useMemo(() => {
        // Constants (Original + New)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Use activeProfile parameters if available, else fallback to defaults
        const basePrice = activeProfile?.parameters?.price?.initial?.value || 0.03;
        const INITIAL_NODES = activeProfile?.parameters?.providers?.initial?.value || 10000;

        let currentPrice = basePrice;
        let currentNodes = INITIAL_NODES;
        // Split Initial Nodes: 70% Urban (Speculative), 30% Rural (Utility)
        let currentUrban = INITIAL_NODES * 0.70;
        let currentRural = INITIAL_NODES * 0.30;

        let currentReserve = 0; // In USD

        const priceData: number[] = [];
        const nodeData: number[] = [];
        const urbanData: number[] = [];
        const ruralData: number[] = [];
        const reserveData: number[] = [];

        // Loop over 12 months
        for (let i = 0; i < 12; i++) {
            // A. Price Dynamics (Risk Engine Logic)
            let monthlyStress = (marketStress / 100) / 12;

            // Dampener effect of Sinking Fund
            if (revenueStrategy === 'reserve' && monthlyStress < 0) {
                monthlyStress = monthlyStress * 0.5;
            }
            // Amplification of Burn (downside)
            if (revenueStrategy === 'burn' && monthlyStress < 0) {
                monthlyStress = monthlyStress * 1.1;
            }

            // Apply Price Change with volatility (deterministic based on month for reproducibility)
            // Using a simple deterministic formula instead of random variation
            const randomVol = ((i * 17 + 7) % 20 - 10) * 0.005; // Produces -0.05 to +0.05 range
            currentPrice = currentPrice * (1 + monthlyStress + randomVol);
            if (currentPrice < 0.001) currentPrice = 0.001;

            // B. Emission & Financials
            let monthlyEmissions = 1000000;
            if (emissionType === 'demand') {
                if (marketStress < 0) {
                    monthlyEmissions = monthlyEmissions * 0.6;
                    currentPrice = currentPrice * 1.02; // Price constraint support
                }
            }

            // [NEW] Growth Shock (Module 5)
            if (selectedScenarioId === 'growth_shock' && i === 5) {
                // Massive Marketing Spike in Month 5
                currentNodes = currentNodes * 1.5; // +50% Shock
                currentUrban = currentUrban * 1.6;
                currentRural = currentRural * 1.3;
            }

            // C. Layered Churn Logic (Legacy + Risk Engine)
            // 1. Calculate Revenue per Node
            let minerRevenueUSD = (monthlyEmissions / (currentUrban + currentRural)) * currentPrice;
            let profit = minerRevenueUSD - 5; // Assumed $5/mo OpEx
            let paybackPeriod = profit > 0 ? capex / profit : 999;

            // 2. Vampire Attack Factor
            let vampirePressure = 0;
            if (competitorYield > 20) {
                let diff = (competitorYield / 100);
                vampirePressure = (diff * 0.1); // Base pressure
            }

            // 3. Urban Logic (Speculators)
            let urbanChurn = 0.02; // Natural baseline
            if (profit < 0) urbanChurn += 0.15; // Unprofitable = fast exit
            if (paybackPeriod > 18) urbanChurn += 0.05; // Slow ROI = exit
            if (marketStress < -20) urbanChurn += 0.05; // Panic selling
            urbanChurn += (vampirePressure * 1.5); // Speculators chase yield aggressively

            // 4. Rural Logic (Utility/Resilient)
            let ruralChurn = 0.01; // Low baseline
            if (profit < -10) ruralChurn += 0.05; // Deep unprofitability only
            ruralChurn += (vampirePressure * 0.2); // Stickier hardware

            // Apply Churn
            currentUrban = Math.max(0, currentUrban * (1 - urbanChurn));
            currentRural = Math.max(0, currentRural * (1 - ruralChurn));
            currentNodes = currentUrban + currentRural;

            // D. Treasury Logic
            if (revenueStrategy === 'reserve') {
                currentReserve += (monthlyEmissions * currentPrice * 0.1);
            } else {
                currentPrice = currentPrice * 1.005;
            }

            priceData.push(currentPrice);
            nodeData.push(Math.round(currentNodes));
            urbanData.push(Math.round(currentUrban));
            ruralData.push(Math.round(currentRural));
            reserveData.push(currentReserve);
        }

        // Metrics for final state
        const finalPrice = priceData[11];
        const finalNodes = nodeData[11];
        const finalReserve = reserveData[11];

        // ROI Calculation for visualization
        let monthlyEmissions = 1000000;
        if (emissionType === 'demand' && marketStress < 0) monthlyEmissions *= 0.6;
        let finalMonthlyRevenue = (monthlyEmissions / finalNodes) * finalPrice;
        let finalPayback = finalMonthlyRevenue > 0 ? capex / finalMonthlyRevenue : 999;

        // KPI Calcs
        const retentionRate = Math.round((finalNodes / INITIAL_NODES) * 100);

        let solvencyText = "Stable";
        if (revenueStrategy === 'reserve') {
            solvencyText = "$" + Math.round(finalReserve).toLocaleString();
        } else {
            solvencyText = "0 Mo";
        }

        let stabilityStatus = "High";
        if (revenueStrategy === 'burn' && marketStress < -20) stabilityStatus = "Critical";
        if (emissionType === 'demand' && revenueStrategy === 'reserve') stabilityStatus = "Optimal";

        return {
            months,
            priceData,
            nodeData,
            urbanData,
            ruralData,
            reserveData,
            finalPrice,
            finalNodes,
            finalReserve,
            finalMonthlyRevenue,
            finalPayback,
            retentionRate,
            solvencyText,
            stabilityStatus
        };
    }, [marketStress, competitorYield, emissionType, revenueStrategy, capex, activeProfile, selectedScenarioId]);

    // --- CHART OPTIONS ---
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#94a3b8', font: { family: "'Space Grotesk', sans-serif" } } },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
                borderWidth: 1,
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { maxTicksLimit: 12, color: '#64748b' } },
            y: { grid: { color: '#334155' }, ticks: { color: '#64748b' } }
        }
    };

    // Chart 1: Stability (Price vs Total Nodes)
    const stabilityData = {
        labels: simulationData.months,
        datasets: [
            {
                label: 'Token Price ($)',
                data: simulationData.priceData,
                borderColor: '#6366f1', // Indigo-500
                backgroundColor: '#6366f1',
                yAxisID: 'y',
                tension: 0.4
            },
            {
                label: 'Total Active Nodes',
                data: simulationData.nodeData,
                borderColor: '#cbd5e1',
                backgroundColor: '#cbd5e1',
                yAxisID: 'y1',
                tension: 0.4,
                borderDash: [5, 5]
            }
        ]
    };

    // Chart 2: Network Composition (Urban vs Rural) - RESTORED
    const compositionData = {
        labels: simulationData.months,
        datasets: [
            {
                label: 'Rural Utility (Resilient)',
                data: simulationData.ruralData,
                borderColor: '#10b981', // Emerald-500
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Urban Speculators (High Risk)',
                data: simulationData.urbanData,
                borderColor: '#f43f5e', // Rose-500
                backgroundColor: 'rgba(244, 63, 94, 0.5)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    // Chart 3: Treasury
    const treasuryData = {
        labels: simulationData.months,
        datasets: [{
            label: revenueStrategy === 'reserve' ? 'Treasury Value ($)' : 'Value Burned (Theoretical)',
            data: revenueStrategy === 'reserve'
                ? simulationData.reserveData
                : simulationData.reserveData.map((_, i) => (i + 1) * 1000),
            backgroundColor: revenueStrategy === 'reserve' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
            borderColor: revenueStrategy === 'reserve' ? '#10b981' : '#ef4444',
            borderWidth: 1
        }]
    };

    const sidebarProtocols = protocols || [];

    return (
        <div className="flex h-full bg-slate-950 text-[#f8fafc] font-sans overflow-hidden">

            {/* SIDEBAR NAVIGATION */}
            <aside className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20 fixed inset-y-0 left-0 lg:relative lg:translate-x-0 ${!sidebarCollapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    {!sidebarCollapsed && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Protocols</span>}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        {sidebarCollapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-500 rounded-full" /><div className="w-1 h-1 bg-slate-500 rounded-full" /></div>}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {sidebarProtocols.map(p => {
                        const isActive = activeProfile?.metadata.id === p.metadata.id;
                        return (
                            <button
                                key={p.metadata.id}
                                onClick={() => onSelectProtocol && onSelectProtocol(p)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${isActive
                                    ? 'bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/5 border border-indigo-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'
                                    }`}>
                                    {p.metadata.name.substring(0, 2).toUpperCase()}
                                </div>
                                {!sidebarCollapsed && (
                                    <div className="flex flex-col items-start truncate">
                                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-400' : ''}`}>
                                            {p.metadata.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 truncate">
                                            {p.metadata.mechanism}
                                        </span>
                                    </div>
                                )}
                                {isActive && !sidebarCollapsed && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-800 space-y-4">
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {!sidebarCollapsed && (
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                                <span className="text-xs font-bold text-emerald-400">Simulation Active</span>
                            </div>
                        )}
                    </div>

                    <div className={`grid ${sidebarCollapsed ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-2'}`}>
                        <a
                            href="https://github.com/volt-capital/depin-stress-test"
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-800 group transition-colors"
                            title="GitHub Repo"
                        >
                            <Github size={16} className="text-slate-500 group-hover:text-white" />
                        </a>
                        <button
                            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-800 group transition-colors"
                            title="Why we built this"
                        >
                            <Info size={16} className="text-slate-500 group-hover:text-emerald-400" />
                        </button>
                        <a
                            href="mailto:hello@depinstresstest.com"
                            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-800 group transition-colors"
                            title="Send Feedback"
                        >
                            <MessageSquare size={16} className="text-slate-500 group-hover:text-indigo-400" />
                        </a>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 w-full space-y-8">

                    {/* REMOVED DUPLICATE HEADER */}
                    {/* Main Title and Context integrated into top of content */}



                    {/* Title Section (formerly in Header) */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                DePIN Risk Engine <span className="text-slate-500 font-normal">| {activeProfile ? activeProfile.metadata.name : 'Onocoy'} Thesis</span>
                            </h1>
                            <p className="text-xs text-slate-400">Stress-Testing Tokenomics against "Vampire Attacks" & Market Crashes</p>
                        </div>
                        <div className="hidden md:flex gap-4 text-xs font-mono text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> System Online</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Model v3.0</span>
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-800" />

                    {/* KPI Summary Cards */}
                    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-500/50">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Network Solvency</div>
                            <div className="text-2xl font-bold text-white">{simulationData.solvencyText}</div>
                            <div className={`text-xs mt-1 ${revenueStrategy === 'reserve' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {revenueStrategy === 'reserve' ? 'Runway Remaining' : 'No Reserves (Burn Mode)'}
                            </div>
                        </div>
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-500/50">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Miner Retention</div>
                            <div className={`text-2xl font-bold ${simulationData.retentionRate < 70 ? 'text-red-500' : 'text-white'}`}>
                                {simulationData.retentionRate}%
                            </div>
                            <div className="text-xs text-slate-400 mt-1">Hardware Active</div>
                        </div>
                        {/* ... other KPIs ... */}
                    </section>

                    {/* Main "War Room" Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        <div className="lg:col-span-4 space-y-6">

                            {/* SCENARIO SELECTOR (RESTORED) */}
                            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Zap size={16} className="text-yellow-400" />
                                    Select Scenario
                                </h3>
                                <select
                                    value={selectedScenarioId}
                                    onChange={(e) => handleScenarioChange(e.target.value)}
                                    className="w-full bg-slate-900 text-white text-sm border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="baseline">Baseline (Organic Growth)</option>
                                    {SCENARIOS.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-2">
                                    {SCENARIOS.find(s => s.id === selectedScenarioId)?.description || "Standard baseline simulation."}
                                </p>
                            </div>

                            {/* External Factors */}
                            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <TrendingDown size={16} className="text-red-500" />
                                    Market Stressors
                                </h3>
                                {/* Market Stress Slider */}
                                <div className="mb-6">
                                    <label className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                                        <span>Bear Market Severity</span>
                                        <span className="text-white">{marketStress}%</span>
                                    </label>
                                    <input
                                        type="range" min="-90" max="20" step="10"
                                        value={marketStress} onChange={(e) => setMarketStress(parseInt(e.target.value))}
                                        className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                                {/* Vampire Attack Slider */}
                                <div className="mb-0">
                                    <label className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                                        <span>Vampire Attack (Competitor Yield)</span>
                                        <span className="text-white">+{competitorYield}%</span>
                                    </label>
                                    <input
                                        type="range" min="0" max="200" step="20"
                                        value={competitorYield} onChange={(e) => setCompetitorYield(parseInt(e.target.value))}
                                        className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Hardware Economics (RESTORED) */}
                            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <Server size={16} className="text-indigo-500" />
                                    Hardware Economics
                                </h3>
                                <div className="mb-0">
                                    <label className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                                        <span>Hardware Cost (Capex)</span>
                                        <span className="text-white">${capex}</span>
                                    </label>
                                    <input
                                        type="range" min="200" max="3000" step="100"
                                        value={capex} onChange={(e) => setCapex(parseInt(e.target.value))}
                                        className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-2">
                                        Higher Capex makes "Urban" nodes exit faster during stress.
                                    </p>
                                </div>
                            </div>

                            {/* Internal Levers */}
                            <div className="bg-slate-800/50 backdrop-blur-md border-t-4 border-t-indigo-500 border-x border-b border-slate-700/50 rounded-xl p-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <Settings2 size={16} className="text-indigo-500" />
                                    Protocol Levers
                                </h3>
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-slate-400">Emission Model</span>
                                        <span className="text-xs font-bold text-indigo-400">
                                            {emissionType === 'fixed' ? 'Fixed Schedule' : 'KPI-Based'}
                                        </span>
                                    </div>
                                    <select
                                        value={emissionType} onChange={(e) => setEmissionType(e.target.value as 'fixed' | 'demand')}
                                        className="w-full bg-slate-900 text-white text-xs border border-slate-600 rounded p-2"
                                    >
                                        <option value="fixed">Fixed (Halving Schedule)</option>
                                        <option value="demand">KPI-Based (Demand Driven)</option>
                                    </select>
                                </div>
                                <div className="mb-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-slate-400">Revenue Strategy</span>
                                        <span className="text-xs font-bold text-indigo-400">
                                            {revenueStrategy === 'burn' ? 'Burn Token' : 'Sinking Fund'}
                                        </span>
                                    </div>
                                    <select
                                        value={revenueStrategy} onChange={(e) => setRevenueStrategy(e.target.value as 'burn' | 'reserve')}
                                        className="w-full bg-slate-900 text-white text-xs border border-slate-600 rounded p-2"
                                    >
                                        <option value="burn">Buy & Burn (Deflationary)</option>
                                        <option value="reserve">Sinking Fund (Treasury)</option>
                                    </select>
                                </div>
                            </div>

                        </div>

                        {/* Visualization Column */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Chart 1: Stability */}
                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-white">Network Stability (Aggregate)</h3>
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-500 rounded-sm"></span> Price</div>
                                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-400 rounded-sm"></span> Total Nodes</div>
                                    </div>
                                </div>
                                <div className="h-[200px]">
                                    <Line
                                        data={stabilityData}
                                        options={{
                                            ...commonOptions,
                                            scales: {
                                                y: { type: 'linear', display: true, position: 'left', grid: { color: '#334155' } },
                                                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } },
                                                x: { grid: { display: false } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Chart 2: Network Composition (RESTORED) */}
                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Grid Composition (Urban vs Rural)</h3>
                                        <p className="text-xs text-slate-400">Visualizing where potential capitulation starts (Speculators vs Utility).</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Rural (Utility)</div>
                                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Urban (Speculators)</div>
                                    </div>
                                </div>
                                <div className="h-[200px]">
                                    <Line data={compositionData} options={commonOptions} />
                                </div>
                            </div>

                            {/* Bottom Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Chart 3: Treasury */}
                                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg flex flex-col">
                                    <h3 className="text-sm font-bold text-white mb-4">Protocol Health (Reserves)</h3>
                                    <div className="flex-1 min-h-[200px]">
                                        <Bar data={treasuryData} options={commonOptions} />
                                    </div>
                                </div>

                                {/* Chart 4: ROI */}
                                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg flex flex-col justify-center">
                                    <h3 className="text-sm font-bold text-white mb-4">Miner ROI Status</h3>
                                    <div className="flex flex-col space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Hardware Cost</span>
                                            <span className="text-white">${capex}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Avg Monthly Reward</span>
                                            <span className="text-indigo-400 font-mono">${simulationData.finalMonthlyRevenue.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${simulationData.finalPayback > 24 ? 'bg-red-500' : 'bg-indigo-500'}`}
                                                style={{ width: `${Math.min(100, (simulationData.finalPayback / 36) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-500">
                                            <span>Instant</span>
                                            <span className={simulationData.finalPayback > 24 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                                                {simulationData.finalPayback > 60 ? '>5 Years' : simulationData.finalPayback.toFixed(1) + ' Mo'} Breakeven
                                            </span>
                                            <span>36 Mo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="border-t border-slate-800 pt-8 pb-12">
                        {/* ... footer ... */}
                    </footer>
                </main>
            </div>
        </div>
    );
};
