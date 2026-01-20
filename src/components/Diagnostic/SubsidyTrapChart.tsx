import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DiagnosticInput, DiagnosticState } from './types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Props {
    inputs: DiagnosticInput;
    state: DiagnosticState;
}

export const SubsidyTrapChart: React.FC<Props> = ({ inputs, state }) => {
    // Generate SIMULATED data for Year 1 to Year 5
    // Emissions:
    // Fixed: Starts high, decays 16% per year (Halving-ish logic? Or typically fixed schedule).
    // Dynamic: Linked to Burn + buffer.

    const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];

    const emissions = [];
    const burn = [];

    let currentEmission = 100;
    let currentBurn = 10; // Starts low

    for (let i = 0; i < 5; i++) {
        // 1. Emission Logic
        if (inputs.emissionSchedule === 'Fixed') {
            currentEmission = currentEmission * 0.84; // 16% decay
        } else {
            // Dynamic: Follows demand + 20% subsidy buffer
            currentEmission = (currentBurn * 1.2) + 20;
        }

        // 2. Burn Logic (Demand)
        // Low Demand Lag = Fast growth. High Lag = Slow growth.
        const growthRate = inputs.demandLag === 'Low' ? 1.5 : 1.1;
        currentBurn = currentBurn * growthRate;

        emissions.push(Math.round(currentEmission));
        burn.push(Math.round(currentBurn));
    }

    const data = {
        labels: years,
        datasets: [
            {
                label: 'Total Emissions (Subsidy Costs)',
                data: emissions,
                borderColor: '#f43f5e', // Red-500
                backgroundColor: 'rgba(244, 63, 94, 0.2)', // Red-500/20
                fill: '+1', // Fill to next dataset (Burn) ? or 'origin'?
                // ChartJS filling is tricky. 
                // We want the AREA between Emissions and Burn to be Red.
                // If Emissions > Burn, fill the gap.
                tension: 0.4
            },
            {
                label: 'Utility Burn (Real Revenue)',
                data: burn,
                borderColor: '#10b981', // Emerald-500
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                fill: 'origin', // Fill below burn is Green (Revenue)
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
            legend: {
                position: 'top' as const,
                labels: { color: '#94a3b8' }
            },
            title: {
                display: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#334155' },
                ticks: { color: '#94a3b8' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            }
        }
    };

    return (
        <div className="w-full h-[300px] bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex gap-4 overflow-hidden">
            <div className="flex-1 min-w-0 relative">
                <Line data={data} options={options} />
                {state.r_be < 0.5 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-950/80 border border-red-500/50 p-4 rounded-xl text-center backdrop-blur-sm pointer-events-none">
                        <h3 className="text-xl font-bold text-red-500 uppercase tracking-widest">Subsidy Trap</h3>
                        <p className="text-sm text-red-300">Deficit &gt; 50%</p>
                    </div>
                )}
            </div>

            {/* LUR Visualization (Secondary Signal) */}
            <div className="w-16 bg-slate-900 rounded-lg border border-slate-700 flex flex-col justify-end p-1 relative overflow-hidden group">
                <div
                    className={`w-full rounded transition-all duration-500 ${state.lur > 20 ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                    style={{ height: `${Math.min(100, state.lur * 2)}%` }} // Scaling roughly
                />
                <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="text-[10px] font-black text-white drop-shadow-md">LUR</span>
                </div>
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm text-[10px] text-center p-1">
                    <p>Liquidity Util: {state.lur}%</p>
                </div>
            </div>
        </div>
    );
};
