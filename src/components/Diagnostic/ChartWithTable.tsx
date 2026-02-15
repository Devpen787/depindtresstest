import React, { useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line, Bar, Chart } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Table, BarChart2 } from 'lucide-react';

ChartJS.register(...registerables, annotationPlugin);

interface ChartWithTableProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    chartData: any;
    chartType: 'line' | 'bar';
    chartOptions: any;
    tableData: { headers: string[]; rows: (string | number)[][] };
    analystNote: React.ReactNode;
    colorClass: string;
}

export const ChartWithTable: React.FC<ChartWithTableProps> = ({
    title,
    subtitle,
    icon,
    chartData,
    chartType,
    chartOptions,
    tableData,
    analystNote,
    colorClass
}) => {
    const [view, setView] = useState<'chart' | 'table'>('chart');

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-200">{title}</h3>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setView(view === 'chart' ? 'table' : 'chart')}
                        className={`p-1.5 rounded-lg transition-colors ${view === 'table' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                        title={view === 'chart' ? "View Data Table" : "View Chart"}
                    >
                        {view === 'chart' ? <Table size={16} /> : <BarChart2 size={16} />}
                    </button>
                    {icon}
                </div>
            </div>

            <div className="flex-grow min-h-[12rem] relative">
                {view === 'chart' ? (
                    <Chart type={chartType} data={chartData} options={chartOptions} />
                ) : (
                    <div className="absolute inset-0 overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        <table className="w-full text-xs text-left text-slate-400">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-800/50 sticky top-0">
                                <tr>
                                    {tableData.headers.map((h, i) => (
                                        <th key={i} className="px-3 py-2 font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {tableData.rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-800/30">
                                        {row.map((cell, j) => (
                                            <td key={j} className="px-3 py-1.5 whitespace-nowrap font-mono text-[10px]">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className={`mt-4 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-300 italic border-l-2 ${colorClass} space-y-2`}>
                {analystNote}
            </div>
        </div>
    );
};
