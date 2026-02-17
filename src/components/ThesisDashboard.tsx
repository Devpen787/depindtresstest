
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { History } from 'lucide-react';
import { HELIUM_2022_DATA } from '../data/historical/helium_2022';
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

import { ChartContextHeader } from './ui/ChartContextHeader';
import MetricEvidenceBadge from './ui/MetricEvidenceBadge';
// import MetricEvidenceLegend from './ui/MetricEvidenceLegend';
import { getMetricEvidence } from '../data/metricEvidence';
import {
    GUARDRAIL_BAND_LABELS,
    GUARDRAIL_COPY,
    PAYBACK_GUARDRAILS
} from '../constants/guardrails';
import { VolumetricFlowChart } from './charts/VolumetricFlowChart';
import { AggregateResult } from '../model/types';
import {
    OWNER_KPI_BAND_CLASSIFIERS,
    OWNER_KPI_THRESHOLD_VALUES,
    calculateOwnerPaybackMonths,
    calculateOwnerRetentionPct,
    mergeGuardrailBands
} from '../audit/kpiOwnerMath';

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
    activeScenarioId?: string | null;
    onScenarioSelect?: (scenarioId: string | null) => void;
}

const formatCompact = (value: number) => {
    if (!Number.isFinite(value)) return '0';
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
};

export const ThesisDashboard: React.FC<ThesisDashboardProps> = ({
    activeProfile,
    protocols,
    onSelectProtocol,
    activeScenarioId,
    onScenarioSelect
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
    const [showHistoricalOverlay, setShowHistoricalOverlay] = useState(false); // [NEW] Helium Overlay Toggle
    const [showAdvancedStrategyAnalysis, setShowAdvancedStrategyAnalysis] = useState(false);
    const selectedScenarioId = activeScenarioId || 'baseline';

    const applyScenarioPreset = useCallback((scenarioId: string) => {
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
    }, []);

    useEffect(() => {
        applyScenarioPreset(selectedScenarioId);
    }, [applyScenarioPreset, selectedScenarioId]);

    const handleScenarioChange = (scenarioId: string) => {
        if (onScenarioSelect) {
            onScenarioSelect(scenarioId);
            return;
        }
        applyScenarioPreset(scenarioId);
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
        const annualizedRevenue = finalMonthlyRevenue * 12 * Math.max(1, finalNodes);
        const finalPayback = calculateOwnerPaybackMonths({
            hardwareCost: capex,
            annualizedRevenue,
            activeNodes: Math.max(1, finalNodes)
        });

        // KPI Calcs
        const retentionRate = Math.round(calculateOwnerRetentionPct(finalNodes / Math.max(1, INITIAL_NODES)));

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
            stabilityStatus,
            // [NEW] Adapter for Volumetric Chart
            volumetricData: priceData.map((p, i) => {
                const isBurn = revenueStrategy === 'burn';
                const burnValue = isBurn
                    ? (1000000 * p) // If burn, we burn 100% of revenue? No, let's assume mechanism.
                    : (1000000 * p * 0.1); // If reserve, we assume 10% take rate?

                return {
                    t: i,
                    dailyMintUsd: { mean: 1000000 * p, min: 0, max: 0 }, // Simplified: Mint Value = Emissions * Price
                    dailyBurnUsd: { mean: burnValue, min: 0, max: 0 },
                    // Mocking other required fields to satisfy type
                    price: { mean: p, min: p, max: p },
                    providers: { mean: nodeData[i], min: 0, max: 0 },
                    solvencyScore: { mean: 1, min: 0, max: 0 },
                    supply: { mean: 0, min: 0, max: 0 },
                    marketCap: { mean: 0, min: 0, max: 0 },
                    demand: { mean: 0, min: 0, max: 0 },
                    revenue: { mean: 0, min: 0, max: 0 },
                    utilisation: { mean: 0, min: 0, max: 0 }
                } as unknown as AggregateResult;
            })
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
    const stabilityData = useMemo(() => {
        if (showHistoricalOverlay) {
            // NORMALIZED MODE (Index 100)
            const startPrice = simulationData.priceData[0] || 1;
            const startNodes = simulationData.nodeData[0] || 1;

            const simPriceIndex = simulationData.priceData.map(p => (p / startPrice) * 100);
            const simNodeIndex = simulationData.nodeData.map(n => (n / startNodes) * 100);

            return {
                labels: simulationData.months,
                datasets: [
                    {
                        label: 'Simulation Price (Normalized)',
                        data: simPriceIndex,
                        borderColor: '#6366f1',
                        backgroundColor: '#6366f1',
                        yAxisID: 'y',
                        tension: 0.4
                    },
                    {
                        label: 'Simulation Nodes (Normalized)',
                        data: simNodeIndex,
                        borderColor: '#cbd5e1',
                        backgroundColor: '#cbd5e1',
                        yAxisID: 'y', // Same axis for index comparison
                        tension: 0.4,
                        borderDash: [5, 5]
                    },
                    {
                        label: 'Helium \'22 Price (Historical)',
                        data: HELIUM_2022_DATA.priceIndex.slice(0, 12), // Align to 12 months
                        borderColor: 'rgba(239, 68, 68, 0.5)', // Red (Crash)
                        borderDash: [2, 2],
                        pointRadius: 0,
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Helium \'22 Nodes (Historical)',
                        data: HELIUM_2022_DATA.nodeCountIndex.slice(0, 12),
                        borderColor: 'rgba(16, 185, 129, 0.5)', // Green (Growth)
                        borderDash: [2, 2],
                        pointRadius: 0,
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Index Baseline (100)',
                        data: simulationData.months.map(() => 100),
                        borderColor: 'rgba(148, 163, 184, 0.35)',
                        backgroundColor: 'rgba(148, 163, 184, 0.35)',
                        borderDash: [6, 6],
                        pointRadius: 0,
                        borderWidth: 1,
                        yAxisID: 'y'
                    }
                ]
            };
        } else {
            // STANDARD MODE
            return {
                labels: simulationData.months,
                datasets: [
                    {
                        label: 'Token Price ($)',
                        data: simulationData.priceData,
                        borderColor: '#6366f1',
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
        }
    }, [simulationData, showHistoricalOverlay]);

    const stabilityOptions = useMemo(() => ({
        ...commonOptions,
        plugins: {
            ...commonOptions.plugins,
            tooltip: {
                ...commonOptions.plugins.tooltip,
                callbacks: {
                    label: (context: any) => {
                        const label = context.dataset.label || '';
                        const rawValue = Number(context.raw ?? 0);
                        if (showHistoricalOverlay) {
                            return `${label}: ${rawValue.toFixed(1)} idx`;
                        }
                        if (context.dataset.yAxisID === 'y') {
                            return `${label}: $${rawValue.toFixed(3)}`;
                        }
                        return `${label}: ${formatCompact(rawValue)} nodes`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#64748b' },
                title: { display: true, text: 'Month', color: '#94a3b8', font: { size: 11, weight: 'bold' as const } }
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                grid: { color: '#334155' },
                ticks: {
                    color: '#64748b',
                    callback: (value: any) => showHistoricalOverlay
                        ? `${Number(value).toFixed(0)}`
                        : `$${Number(value).toFixed(2)}`
                },
                title: {
                    display: true,
                    text: showHistoricalOverlay ? 'Normalized Index (Month 0 = 100)' : 'Token Price (USD)',
                    color: '#94a3b8',
                    font: { size: 11, weight: 'bold' as const }
                }
            },
            y1: {
                type: 'linear' as const,
                display: !showHistoricalOverlay,
                position: 'right' as const,
                grid: { drawOnChartArea: false },
                ticks: {
                    color: '#64748b',
                    callback: (value: any) => formatCompact(Number(value))
                },
                title: {
                    display: !showHistoricalOverlay,
                    text: 'Active Nodes',
                    color: '#94a3b8',
                    font: { size: 11, weight: 'bold' as const }
                }
            }
        }
    }), [commonOptions, showHistoricalOverlay]);

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

    const thesisStatus = useMemo(() => {
        const paybackBand = OWNER_KPI_BAND_CLASSIFIERS.payback(simulationData.finalPayback);
        const retentionBand = OWNER_KPI_BAND_CLASSIFIERS.retention(simulationData.retentionRate);
        const reserveBand = revenueStrategy === 'reserve' && simulationData.finalReserve > 0
            ? 'healthy'
            : 'watchlist';
        const overallBand = mergeGuardrailBands([paybackBand, retentionBand, reserveBand]);

        if (overallBand === 'intervention') {
            return { tone: 'critical' as const, label: GUARDRAIL_BAND_LABELS.intervention, detail: 'Multiple resilience guardrails are off-target' };
        }
        if (overallBand === 'watchlist') {
            return { tone: 'caution' as const, label: GUARDRAIL_BAND_LABELS.watchlist, detail: 'One resilience guardrail needs action' };
        }
        return { tone: 'healthy' as const, label: GUARDRAIL_BAND_LABELS.healthy, detail: 'Resilience guardrails are inside target ranges' };
    }, [revenueStrategy, simulationData.finalReserve, simulationData.finalPayback, simulationData.retentionRate]);

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
                                data-cy={`thesis-protocol-${p.metadata.id}`}
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
                    {/* Sidebar Status Removed per Simplification Plan */}

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
                                Strategy <span className="text-slate-500 font-normal">| {activeProfile ? activeProfile.metadata.name : 'Onocoy'}</span>
                            </h1>
                            <p className="text-xs text-slate-400">Test strategy levers under stress to choose the next safest move.</p>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[10px] text-slate-300">
                                <Info size={12} className="text-cyan-400" />
                                Simplified 12-month strategy model (illustrative, not a market forecast)
                            </div>
                        </div>
                        {/* Header Status Removed per Simplification Plan */}
                    </div>

                    <div className="w-full h-px bg-slate-800" />



                    {/* Legend Removed per Simplification Plan */}

                    {/* KPI Summary Cards */}
                    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-500/50">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Network Solvency</div>
                                <MetricEvidenceBadge evidence={getMetricEvidence('thesis_network_solvency')} variant="icon" />
                            </div>
                            <div className="text-2xl font-bold text-white">{simulationData.solvencyText}</div>
                            <div className={`text-xs mt-1 ${revenueStrategy === 'reserve' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {revenueStrategy === 'reserve' ? 'Runway Remaining' : 'No Reserves (Burn Mode)'}
                            </div>
                        </div>
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-500/50">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Miner Retention</div>
                                <MetricEvidenceBadge evidence={getMetricEvidence('thesis_miner_retention')} variant="icon" />
                            </div>
                            <div className={`text-2xl font-bold ${OWNER_KPI_BAND_CLASSIFIERS.retention(simulationData.retentionRate) === 'intervention' ? 'text-red-500' : OWNER_KPI_BAND_CLASSIFIERS.retention(simulationData.retentionRate) === 'watchlist' ? 'text-amber-400' : 'text-white'}`}>
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
                            <ChartContextHeader
                                title="How To Read Strategy Charts"
                                what="These charts show what happens to price, node health, and runway under one chosen stress scenario."
                                why="Each line updates when you change scenario severity, competitor pressure, emission mode, revenue strategy, or hardware cost."
                                reference={GUARDRAIL_COPY.thesisChartReference}
                                nextQuestion="Which single lever changes the outcome the most?"
                                actionTrigger={`If breakeven goes above ${PAYBACK_GUARDRAILS.healthyMaxMonths} months or retention falls below ${OWNER_KPI_THRESHOLD_VALUES.retentionWatchlistMinPct}%, switch from growth recommendation to intervention plan.`}
                            />

                            {/* Chart 1: Stability */}
                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-white">Network Stability (Aggregate)</h3>
                                        <MetricEvidenceBadge evidence={getMetricEvidence('historical_overlay_reference')} variant="icon" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setShowHistoricalOverlay(!showHistoricalOverlay)}
                                            className={`text-xs font-bold px-3 py-1 rounded-full border transition-all flex items-center gap-2 ${showHistoricalOverlay
                                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                                : 'bg-slate-700 text-slate-400 border-transparent hover:bg-slate-600'
                                                }`}
                                        >
                                            <History size={12} />
                                            {showHistoricalOverlay ? 'vs Helium Crash (Normalized)' : 'Compare vs History'}
                                        </button>
                                    </div>
                                </div>
                                <p className="mb-3 text-[11px] text-slate-400">
                                    {showHistoricalOverlay
                                        ? 'Overlay mode: all lines are normalized to index 100 at Month 0 to compare slope and direction only.'
                                        : 'Dual-axis mode: price is on the left axis (USD) and active nodes are on the right axis (count).'}
                                </p>
                                <div className="h-[200px]">
                                    <Line
                                        data={stabilityData}
                                        options={stabilityOptions as any}
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Advanced Strategy Analysis</h3>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Open secondary strategy charts and diagnostics after reviewing the core stability view.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvancedStrategyAnalysis((prev) => !prev)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${showAdvancedStrategyAnalysis
                                            ? 'bg-indigo-600 text-white border-indigo-500'
                                            : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-indigo-500/60 hover:text-white'
                                            }`}
                                    >
                                        {showAdvancedStrategyAnalysis ? 'Hide Advanced Strategy Analysis' : 'Open Advanced Strategy Analysis'}
                                    </button>
                                </div>
                            </div>

                            {showAdvancedStrategyAnalysis && (
                                <>
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

                                    {/* Chart 3: Volumetric Flow (D3) */}
                                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Volumetric Flow (Mint vs Burn)</h3>
                                                <p className="text-xs text-slate-400">Visualizing the subsidy gap (model reference 6.2.1)</p>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-400 rounded-sm"></span> Incentives (Mint)</div>
                                                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-sm"></span> Revenue (Burn)</div>
                                            </div>
                                        </div>
                                        <div className="h-[250px] w-full">
                                            <VolumetricFlowChart data={simulationData.volumetricData} width={600} height={250} />
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
                                                        className={`h-full transition-all duration-500 ${OWNER_KPI_BAND_CLASSIFIERS.payback(simulationData.finalPayback) === 'intervention'
                                                            ? 'bg-red-500'
                                                            : OWNER_KPI_BAND_CLASSIFIERS.payback(simulationData.finalPayback) === 'watchlist'
                                                                ? 'bg-amber-500'
                                                                : 'bg-indigo-500'}`}
                                                        style={{ width: `${Math.min(100, (simulationData.finalPayback / PAYBACK_GUARDRAILS.watchlistMaxMonths) * 100)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-slate-500">
                                                    <span>Instant</span>
                                                    <span className={OWNER_KPI_BAND_CLASSIFIERS.payback(simulationData.finalPayback) === 'intervention'
                                                        ? 'text-red-400 font-bold'
                                                        : OWNER_KPI_BAND_CLASSIFIERS.payback(simulationData.finalPayback) === 'watchlist'
                                                            ? 'text-amber-300 font-semibold'
                                                            : 'text-slate-300'}>
                                                        {simulationData.finalPayback > PAYBACK_GUARDRAILS.extendedHorizonMonths
                                                            ? `>${(PAYBACK_GUARDRAILS.extendedHorizonMonths / 12).toFixed(0)} Years`
                                                            : simulationData.finalPayback.toFixed(1) + ' Mo'} Breakeven
                                                    </span>
                                                    <span>{PAYBACK_GUARDRAILS.watchlistMaxMonths} Mo</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

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
