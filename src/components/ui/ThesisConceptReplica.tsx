import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import {
    Activity, BarChart2, DollarSign, Download, MoreHorizontal,
    PieChart, Settings, Shield, TrendingUp, Users, Zap
} from 'lucide-react';

export const ThesisConceptReplica: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="flex flex-col lg:flex-row bg-slate-950 text-slate-50 font-sans border-4 border-indigo-500/20 rounded-xl shadow-2xl min-h-[800px]">
            {/* Sidebar Visual Replica */}
            <aside className="w-full lg:w-64 border-r border-slate-800 bg-slate-950 flex flex-col p-4 gap-4 shrink-0">
                <div className="flex items-center gap-2 px-2 py-4">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Zap size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-lg hidden lg:block tracking-tight">DePIN Sim</span>
                </div>

                <nav className="flex-1 space-y-1">
                    {[
                        { id: 'dashboard', icon: Activity, label: 'Dashboard' },
                        { id: 'analytics', icon: BarChart2, label: 'Analytics' },
                        { id: 'miners', icon: Users, label: 'Miners' },
                        { id: 'risk', icon: Shield, label: 'Risk' },
                        { id: 'settings', icon: Settings, label: 'Settings' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activeTab === item.id ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
                        >
                            <item.icon size={20} />
                            <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 hidden lg:block mt-auto">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-400">CREDITS</span>
                        <Badge variant="success" size="sm" dot>Online</Badge>
                    </div>
                    <div className="text-lg font-mono font-bold text-white">4,291.50</div>
                </div>
            </aside>

            {/* Main Content Area Replica */}
            <main className="flex-1 bg-slate-950 relative">
                {activeTab === 'dashboard' && (
                    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 pb-20">
                        <header className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Thesis Validation</h1>
                                <p className="text-slate-400 text-sm">Real-time simulation showing 98% retention probability.</p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" icon={<Download size={16} />}>Export</Button>
                                <Button icon={<Activity size={16} />}>Run Simulation</Button>
                            </div>
                        </header>

                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card variant="glass" className="relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <DollarSign size={80} className="text-indigo-400" />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Network Solvency</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white mb-2">14.2 Months</div>
                                    <Badge variant="success" dot>Stable</Badge>
                                </CardContent>
                            </Card>

                            <Card variant="glass" className="relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Users size={80} className="text-emerald-400" />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Miner Retention</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white mb-2">98.5%</div>
                                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                                        <TrendingUp size={12} />
                                        <span>+2.4% vs last run</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card variant="glass" className="relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Activity size={80} className="text-rose-400" />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Stress Factor</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white mb-2">Low Risk</div>
                                    <Badge variant="neutral">0.15 Delta</Badge>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Visual - Chart Placeholder */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card variant="default" className="lg:col-span-2 flex flex-col min-h-[400px]">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Token Emission Curve</CardTitle>
                                    <div className="flex gap-2">
                                        <Badge variant="outline">Linear</Badge>
                                        <Badge variant="default">Exponential</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex items-center justify-center bg-slate-900/50 m-4 rounded-lg border border-slate-800 border-dashed">
                                    <div className="text-center">
                                        <Activity size={48} className="text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-500 text-sm">Chart Visualization Placeholder</p>
                                        <p className="text-slate-600 text-xs mt-1">(Using Chart.js in production)</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card variant="gradient" className="flex flex-col h-full">
                                <CardHeader>
                                    <CardTitle>Key Drivers</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { label: 'Token Price', value: '$1.42', trend: 'up' },
                                        { label: 'Hardware Cost', value: '$450', trend: 'stable' },
                                        { label: 'Energy Rate', value: '$0.12/kWh', trend: 'down' },
                                        { label: 'Network Difficulty', value: '42.5 T', trend: 'up' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/30 border border-slate-800/50">
                                            <span className="text-sm text-slate-300">{item.label}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-sm font-bold text-white">{item.value}</span>
                                                {item.trend === 'up' && <TrendingUp size={14} className="text-emerald-400" />}
                                                {item.trend === 'down' && <TrendingUp size={14} className="text-rose-400 rotate-180" />}
                                                {item.trend === 'stable' && <MoreHorizontal size={14} className="text-slate-500" />}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-8 pt-4 border-t border-white/10">
                                        <Button variant="secondary" className="w-full">Adjust Assumptions</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab !== 'dashboard' && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in duration-300">
                        <Activity size={48} className="mb-4 text-slate-700" />
                        <h2 className="text-xl font-bold text-slate-300 mb-2">Work in Progress</h2>
                        <p className="max-w-md text-center">
                            The <span className="text-indigo-400 font-mono">{activeTab}</span> view is not part of this initial concept replica.
                            Switch back to <b>Dashboard</b> to see the implemented design.
                        </p>
                        <Button variant="secondary" className="mt-6" onClick={() => setActiveTab('dashboard')}>
                            Return to Dashboard
                        </Button>
                    </div>
                )}

            </main>
        </div>
    );
};
