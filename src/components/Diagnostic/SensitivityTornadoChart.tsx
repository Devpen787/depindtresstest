import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Activity, Play, RefreshCw } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface SensitivityResult {
    parameter: string;
    low: number;
    high: number;
    delta: number;
}

interface Props {
    onRunAnalysis: () => SensitivityResult[];
}

export const SensitivityTornadoChart: React.FC<Props> = ({ onRunAnalysis }) => {
    const [results, setResults] = useState<SensitivityResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    const handleRun = () => {
        setLoading(true);
        // Small timeout to allow UI to show loading state before blocking thread
        setTimeout(() => {
            const data = onRunAnalysis();
            setResults(data);
            setLoading(false);
            setHasRun(true);
        }, 100);
    };

    // Auto-run on first mount if not too expensive? 
    // No, strictly manual to prevent "Browser Freeze" risk identified in Plan.

    const chartData = {
        labels: results.map(r => r.parameter),
        datasets: [
            {
                label: 'Solvency Impact Magnitude (Delta)',
                data: results.map(r => r.delta),
                backgroundColor: results.map(r => r.delta > 0.5 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)'), // Red for high sensitivity (>0.5 delta)
                borderColor: results.map(r => r.delta > 0.5 ? 'rgba(239, 68, 68, 1)' : 'rgba(59, 130, 246, 1)'),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const idx = context.dataIndex;
                        const r = results[idx];
                        return `Impact: ${r.delta.toFixed(2)} (Range: ${r.low.toFixed(2)} - ${r.high.toFixed(2)})`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#94a3b8',
                },
                title: {
                    display: true,
                    text: 'Solvency Score Impact (Δ)',
                    color: '#64748b'
                }
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#e2e8f0',
                    font: {
                        weight: 'bold'
                    }
                }
            },
        },
    };

    return (
        <div className="w-full">
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleRun}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${loading
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        }`}
                >
                    {loading ? (
                        <>
                            <RefreshCw className="animate-spin" size={18} />
                            Running Sweep...
                        </>
                    ) : (
                        <>
                            <Play size={18} fill="currentColor" />
                            {hasRun ? 'Re-Run Audit' : 'Run Sensitivity'}
                        </>
                    )}
                </button>
            </div>

            {hasRun ? (
                <div className="h-[300px] w-full">
                    <Bar data={chartData} options={options as any} />
                </div>
            ) : (
                <div className="h-[300px] w-full flex flex-col items-center justify-center bg-slate-950/50 rounded-lg border-2 border-dashed border-slate-800">
                    <Activity className="text-slate-700 mb-4" size={48} />
                    <p className="text-slate-500 font-medium">Ready to Audit</p>
                    <p className="text-xs text-slate-600 mt-2 max-w-sm text-center">
                        Click "Run Sensitivity" to execute Monte Carlo sweep on 5 key parameters (+/- 20%).
                    </p>
                </div>
            )}
        </div>
    );
};
