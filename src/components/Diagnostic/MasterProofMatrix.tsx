import React from 'react';
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
import { ChartWithTable } from './ChartWithTable';
import { AggregateResult } from '../../model/types';
import { ShieldCheck, TrendingDown, Users, Activity } from 'lucide-react';
import annotationPlugin from 'chartjs-plugin-annotation';
import {
    calculateArchitecturalProof,
    calculateMethodologicalProof,
    calculateSolutionProof,
    calculateStrategicProof
} from '../../audit/diagnosticViewMath';

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
    annotationPlugin
);

interface Props {
    data: AggregateResult[];
    loading: boolean;
    profileName?: string;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 3 }).format(val);
const formatLargeCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val);

export const MasterProofMatrix: React.FC<Props> = ({ data, loading, profileName = 'Protocol' }) => {
    // If no data, show simplified skeletal loading or empty state
    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-900/50">
                <h3 className="text-slate-400 font-medium animate-pulse">Waiting for Simulation Data...</h3>
                <p className="text-slate-500 text-xs mt-2">Go to Simulator &gt; Run Matrix to generate the proof.</p>
            </div>
        );
    }

    const labels = data.map(d => `W${d.t}`);

    // --- CHART 1: STRATEGIC PROOF (Mercenary Risk) ---
    const strategic = calculateStrategicProof(data);
    const mercenaryDataRaw = strategic.mercenaryRaw;
    const proDataRaw = strategic.proRaw;
    const mercenaryData = strategic.mercenaryShare;
    const proData = strategic.proShare;
    const panicIndex = strategic.panicIndex;

    const strategicChartData = {
        labels,
        datasets: [
            {
                label: 'Physical Capital (Pros)',
                data: proData,
                borderColor: '#52C41A',
                backgroundColor: 'rgba(82, 196, 26, 0.8)', // #52C41A
                fill: true,
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'Speculative Capital (Mercenaries)',
                data: mercenaryData,
                borderColor: '#FF4d4F',
                backgroundColor: 'rgba(255, 77, 79, 0.8)', // #FF4d4F
                fill: true,
                tension: 0.4,
                pointRadius: 0
            },
        ],
    };

    const strategicAnnotations = panicIndex > 0 ? {
        annotations: {
            line1: {
                type: 'line',
                xMin: panicIndex,
                xMax: panicIndex,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 1,
                borderDash: [4, 4],
                label: {
                    content: 'Mercenary Exodus',
                    display: true,
                    position: 'start',
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    color: 'white',
                    font: { size: 10, weight: 'bold' },
                    padding: 4
                }
            }
        }
    } : {};

    const strategicTable = {
        headers: ['Week', 'Pro Share', 'Merc Share', 'Pro Count', 'Merc Count'],
        rows: data.map((d, i) => [
            `W${d.t}`,
            `${proData[i].toFixed(1)}%`,
            `${mercenaryData[i].toFixed(1)}%`,
            Math.round(proDataRaw[i]),
            Math.round(mercenaryDataRaw[i])
        ])
    };

    // --- CHART 2: ARCHITECTURAL PROOF (Subsidy Gap) ---
    const architectural = calculateArchitecturalProof(data);
    const revenueData = architectural.revenue;
    const costData = architectural.cost;
    const maxGapIndex = architectural.maxGapIndex;
    const maxGap = architectural.maxGap;

    const architecturalChartData = {
        labels,
        datasets: [
            {
                type: 'line' as const,
                label: 'Network Revenue (Demand)',
                data: revenueData,
                borderColor: '#3b82f6', // Blue
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: 'origin',
                pointRadius: 0
            },
            {
                type: 'line' as const,
                label: 'Incentive Cost (Supply)',
                data: costData,
                borderColor: '#f43f5e', // Red
                backgroundColor: 'rgba(255, 0, 0, 0.2)', // Deficit Shading
                borderWidth: 2,
                tension: 0.3,
                fill: '-1', // Fill to previous dataset (Revenue)
                pointRadius: 0
            }
        ]
    };

    const architecturalAnnotations = maxGap > 0 ? {
        annotations: {
            line1: {
                type: 'line',
                xMin: maxGapIndex,
                xMax: maxGapIndex,
                yMin: revenueData[maxGapIndex],
                yMax: costData[maxGapIndex],
                borderColor: '#f43f5e',
                borderWidth: 2,
                label: {
                    content: 'Unfunded Liability',
                    display: true,
                    position: 'center',
                    backgroundColor: 'rgba(244, 63, 94, 0.9)',
                    color: 'white',
                    font: { size: 10, weight: 'bold' }
                }
            }
        }
    } : {};

    const architecturalTable = {
        headers: ['Week', 'Incentive Cost', 'Revenue', 'Deficit'],
        rows: data.map((d, i) => [
            `W${d.t}`,
            formatLargeCurrency(costData[i]),
            formatLargeCurrency(revenueData[i]),
            formatLargeCurrency(costData[i] - revenueData[i])
        ])
    };

    // --- CHART 3: METHODOLOGICAL PROOF ---
    const methodological = calculateMethodologicalProof(data);
    const realPrice = methodological.realPrice;
    const excelForecast = methodological.excelForecast;

    const methodologicalChartData = {
        labels,
        datasets: [
            {
                label: 'Agent-Based Reality',
                data: realPrice,
                borderColor: '#0000FF', // Bright Blue
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                borderDash: [] // Solid
            },
            {
                label: 'Excel Projection (Linear)',
                data: excelForecast,
                borderColor: '#999999', // Grey
                borderWidth: 3,
                tension: 0.1,
                pointRadius: 0,
                borderDash: [5, 5], // Dotted
                fill: 0, // Fill to dataset 0 (ABM)
                backgroundColor: 'rgba(148, 163, 184, 0.2)' // Faint Grey/Purple Shade "The Gap"
            }
        ]
    };

    const midIndex = methodological.midIndex;

    const methodologicalAnnotations = {
        annotations: {
            label1: {
                type: 'label',
                xValue: midIndex,
                yValue: (excelForecast[midIndex] + realPrice[midIndex]) / 2, // Center vertically
                backgroundColor: 'rgba(0,0,0,0.7)',
                content: ['⚠️ Unpriced Risk', '(Model Deviation)'],
                color: '#fff',
                font: { size: 10, weight: 'bold' },
                padding: 6,
                borderRadius: 4
            }
        }
    };

    const methodologicalTable = {
        headers: ['Week', 'ABM Price', 'Excel Price', 'Diff %'],
        rows: data.map((d, i) => [
            `W${d.t}`,
            formatCurrency(realPrice[i]),
            formatCurrency(excelForecast[i]),
            `${methodological.diffPct[i].toFixed(1)}%`
        ])
    };

    // --- CHART 4: SOLUTION PROOF ---
    const solution = calculateSolutionProof(data);
    const dynamicPrice = solution.dynamicPrice;
    const staticShadowPrice = solution.staticShadowPrice;

    const solutionChartData = {
        labels,
        datasets: [
            {
                label: 'Static Policy (Legacy)',
                data: staticShadowPrice,
                borderColor: '#ef4444',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [4, 4],
                tension: 0.4,
                pointRadius: 0,
                fill: false
            },
            {
                label: 'Dynamic Policy (Proposed)',
                data: dynamicPrice,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)', // Green "Wealth Saved" Area
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                fill: '-1' // Fill down to Static Policy
            }
        ]
    };

    const solutionTable = {
        headers: ['Week', 'Dynamic Price', 'Static Price', 'Saved Value'],
        rows: data.map((d, i) => [
            `W${d.t}`,
            formatCurrency(dynamicPrice[i]),
            formatCurrency(staticShadowPrice[i]),
            formatCurrency(solution.savedValue[i])
        ])
    };

    // Common Options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#cbd5e1', font: { size: 10 } }, position: 'top' as const },
            tooltip: { mode: 'index' as const, intersect: false },
            annotation: {} // Default empty
        },
        scales: {
            x: { display: false },
            y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="text-indigo-400" />
                    Thesis Defense: Master Proof Matrix for <span className="text-indigo-300 underline decoration-indigo-500/30 underline-offset-4">{profileName}</span>
                </h2>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 font-mono">
                    Generated from Live Simulation (n={data[0]?.price?.mean ? '25' : '1'})
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <ChartWithTable
                    title="1. Strategic Proof: Miner Value-at-Risk (mVaR)"
                    subtitle="Probability of Default (Active Nodes)"
                    icon={<Users size={16} className="text-emerald-500" />}
                    chartType="line"
                    chartData={strategicChartData}
                    chartOptions={{
                        ...commonOptions,
                        interaction: { mode: 'nearest', axis: 'x', intersect: false },
                        scales: { x: { display: false }, y: { stacked: true, min: 0, max: 100, grid: { color: '#334155' }, title: { display: true, text: 'Market Share of Nodes (%)', color: '#64748b', font: { size: 9 } } } },
                        plugins: {
                            ...commonOptions.plugins,
                            annotation: strategicAnnotations,
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: (ctx: any) => ` ${ctx.dataset.label}: ${formatNumber(ctx.raw as number)}%`
                                }
                            }
                        }
                    }}
                    tableData={strategicTable}
                    colorClass="border-emerald-500"
                    analystNote={
                        <>
                            <p>"Fair-weather mercenaries (Red) exit at Month 4, highlighting massive 'Value-at-Risk' exposure."</p>
                            <div className="font-mono text-[10px] text-slate-500 pt-2 border-t border-slate-700/50">
                                <strong>Analyst Note:</strong> Mercenaries (Red) have a low churn threshold. When price momentum drops &lt;0.8, they exit en masse (Dotted Line), while Professionals (Green) support the network.
                            </div>
                        </>
                    }
                />

                <ChartWithTable
                    title="2. Architectural Proof"
                    subtitle="Network Solvency (Cost vs Revenue)"
                    icon={<TrendingDown size={16} className="text-rose-500" />}
                    chartType="line" // Changed to Line for fill effect
                    chartData={architecturalChartData}
                    chartOptions={{
                        ...commonOptions,
                        plugins: {
                            ...commonOptions.plugins,
                            annotation: architecturalAnnotations,
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: (ctx: any) => ` ${ctx.dataset.label}: ${formatLargeCurrency(ctx.raw as number)}`
                                }
                            }
                        }
                    }}
                    tableData={architecturalTable}
                    colorClass="border-rose-500"
                    analystNote={
                        <>
                            <p>"Static emissions create a 'Subsidy Gap' (Red Zone), diluting token value when demand lags."</p>
                            <div className="font-mono text-[10px] text-slate-500 pt-2 border-t border-slate-700/50">
                                <strong>Analyst Note:</strong> The "Subsidy Gap" occurs when Incentive Cost (Red) exceeds Network Revenue (Blue). This deficit is funded by token dilution (inflation).
                            </div>
                        </>
                    }
                />

                <ChartWithTable
                    title="3. Methodological Proof"
                    subtitle="Agent-Based Model vs Linear Excel"
                    icon={<Activity size={16} className="text-indigo-500" />}
                    chartType="line"
                    chartData={methodologicalChartData}
                    chartOptions={{
                        ...commonOptions,
                        plugins: {
                            ...commonOptions.plugins,
                            annotation: methodologicalAnnotations,
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: (ctx: any) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw as number)}`
                                }
                            }
                        }
                    }}
                    tableData={methodologicalTable}
                    colorClass="border-indigo-500"
                    analystNote={
                        <>
                            <p>"Linear projections (Grey) mask the 'Death Spiral' risks captured by ABM volatility (Indigo)."</p>
                            <div className="font-mono text-[10px] text-slate-500 pt-2 border-t border-slate-700/50">
                                <strong>Analyst Note:</strong> Most whitepapers use linear projections (Grey). Real agent-based modeling (Indigo) reveals volatility risks that average calculations miss.
                            </div>
                        </>
                    }
                />

                <ChartWithTable
                    title="4. Solution Proof"
                    subtitle="Dynamic Emissions Safety Net"
                    icon={<ShieldCheck size={16} className="text-emerald-500" />}
                    chartType="line"
                    chartData={solutionChartData}
                    chartOptions={{
                        ...commonOptions,
                        plugins: {
                            ...commonOptions.plugins,
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: (ctx: any) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw as number)}`
                                }
                            }
                        }
                    }}
                    tableData={solutionTable}
                    colorClass="border-emerald-500"
                    analystNote={
                        <>
                            <p>"Dynamic policy (Green) arrests the crash by reducing supply, outperforming the legacy static model (Red)."</p>
                            <div className="font-mono text-[10px] text-slate-500 pt-2 border-t border-slate-700/50">
                                <strong>Analyst Note:</strong> The Dynamic Policy (Green) acts as a circuit breaker. By reducing supply during a crash, it maintains a higher price floor than the Static Policy (Red).
                            </div>
                        </>
                    }
                />

            </div>
        </div>
    );
};
