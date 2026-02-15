import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DiagnosticInput, DiagnosticState } from './types';
import { calculateDensityTrapSeries } from '../../audit/diagnosticViewMath';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Props {
    inputs: DiagnosticInput;
    state: DiagnosticState;
}

export const DensityTrapChart: React.FC<Props> = ({ inputs }) => {
    const years = ['Y1', 'Y1.5', 'Y2', 'Y2.5', 'Y3', 'Y3.5', 'Y4'];
    const { earnings, costs } = calculateDensityTrapSeries(inputs.growthCoordination);

    const data = {
        labels: years,
        datasets: [
            {
                label: 'Hardware/OpEx Cost (Constant)',
                data: costs,
                borderColor: '#ef4444', // Red-500
                borderDash: [5, 5],
                fill: false,
                tension: 0
            },
            {
                label: 'Miner Earnings (Tokens)',
                data: earnings,
                borderColor: inputs.growthCoordination === 'Uncoordinated' ? '#f97316' : '#10b981', // Orange (Trap) vs Emerald (Sustainable)
                backgroundColor: inputs.growthCoordination === 'Uncoordinated' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true, display: false },
            x: { grid: { display: false } }
        },
        plugins: { legend: { labels: { color: '#94a3b8' } } }
    };

    return (
        <div className="w-full h-[300px] bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative">
            <Line data={data} options={options} />

            {inputs.growthCoordination === 'Uncoordinated' && (
                <div className="absolute top-[30%] right-[20%] text-right pointer-events-none">
                    <h4 className="text-xl font-bold text-orange-500">Dilution Trap</h4>
                    <p className="text-sm text-slate-400">Diminishing Returns</p>
                    <p className="text-xs text-slate-500">ROI approaches 0 despite emissions.</p>
                </div>
            )}
        </div>
    );
};
