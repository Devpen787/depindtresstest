import React, { useMemo } from 'react';
import { Scatter, Chart } from 'react-chartjs-2';
import { AggregateResult } from '../../model/types';
import { calculateInflationCapacityRegression } from '../../audit/diagnosticViewMath';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    ChartOptions,
    LineController,
    ScatterController
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, LineController, ScatterController);

interface Props {
    data: AggregateResult[];
}

export const InflationCapacityScatter: React.FC<Props> = ({ data }) => {
    const stats = useMemo(() => {
        return calculateInflationCapacityRegression(data, 10);
    }, [data]);

    const chartData = {
        datasets: [
            {
                type: 'scatter' as const,
                label: 'Weekly State (Capacity vs Emission)',
                data: stats.points,
                backgroundColor: 'rgba(99, 102, 241, 0.6)', // Indigo
                borderColor: 'rgba(99, 102, 241, 1)',
                pointRadius: 4,
            },
            {
                type: 'line' as const,
                label: 'Trend Line',
                data: stats.points.map(p => ({
                    x: p.x,
                    y: (stats.slope * p.x) + stats.intercept
                })),
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 2,
                pointRadius: 0,
                borderDash: [5, 5],
            }
        ],
    };

    const options: any = { // Cast to any to allow mixed types
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: `Feedback Strength (R² = ${stats.rSquared.toFixed(2)})`,
                color: '#94a3b8'
            },
            tooltip: {
                callbacks: {
                    label: (ctx: any) => `Cap: ${(ctx.parsed.x / 1000).toFixed(1)}k, Emit: ${(ctx.parsed.y / 1000).toFixed(1)}k`
                }
            }
        },
        scales: {
            x: {
                title: { display: true, text: 'Network Capacity (GB)', color: '#64748b' },
                grid: { color: '#334155' },
                ticks: { color: '#94a3b8' }
            },
            y: {
                title: { display: true, text: 'Emission (Tokens)', color: '#64748b' },
                grid: { color: '#334155' },
                ticks: { color: '#94a3b8' }
            }
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-64 flex flex-col items-center justify-center">
            {data.length === 0 ? (
                <div className="text-slate-500 text-sm">Run simulation to see correlation.</div>
            ) : (
                <div className="w-full h-full">
                    <Chart type='scatter' data={chartData as any} options={options} />
                </div>
            )}
        </div>
    );
};
