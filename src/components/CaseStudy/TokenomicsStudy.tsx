import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, Cell
} from 'recharts';
import { ShieldCheck, TrendingDown, RefreshCw, Zap, AlertTriangle, CheckCircle2, Flame, Database, Radio, TrendingUp, Shield, Wifi, Wallet, ArrowUpDown, ChevronDown, Map, Car, Box, Cpu, Layers, HardDrive, BrainCircuit, Cloud, Lock } from 'lucide-react';
import { CASE_STUDIES, CaseStudy } from '../../data/caseStudies';

export const TokenomicsStudy: React.FC = () => {
    // State
    const [activeStudyId, setActiveStudyId] = useState<string>('onocoy');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Derived Data
    const activeStudy = useMemo(() => {
        const study = CASE_STUDIES.find(s => s.id === activeStudyId) || CASE_STUDIES[0];
        console.log('[TokenomicsStudy] Active Study Changed:', study.id, study.meta.title);
        console.log('[TokenomicsStudy] Solvency Data:', JSON.stringify(study.charts.solvency[0]));
        return study;
    }, [activeStudyId]);

    console.log('[TokenomicsStudy] Render Cycle:', activeStudy.id);

    // Helpers
    const getScoreColor = (score: number) => {
        if (score >= 90) return 'bg-emerald-400';
        if (score >= 70) return 'bg-emerald-500';
        if (score >= 50) return 'bg-amber-400';
        if (score >= 30) return 'bg-orange-500';
        return 'bg-indigo-900';
    };

    const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
        switch (name) {
            case 'database': return <Database className={className} size={32} />;
            case 'wifi': return <Wifi className={className} size={32} />;
            case 'check': return <CheckCircle2 className={className} size={32} />;
            case 'flame': return <Flame className={className} size={32} />;
            case 'wallet': return <Wallet className={className} size={32} />;
            case 'up-down': return <ArrowUpDown className={className} size={32} />;
            case 'map': return <Map className={className} size={32} />;
            case 'car': return <Car className={className} size={32} />;
            case 'box': return <Box className={className} size={32} />;
            case 'cpu': return <Cpu className={className} size={32} />;
            case 'layers': return <Layers className={className} size={32} />;
            case 'hard-drive': return <HardDrive className={className} size={32} />;
            case 'brain': return <BrainCircuit className={className} size={32} />;
            case 'cloud': return <Cloud className={className} size={32} />;
            case 'lock': return <Lock className={className} size={32} />;
            default: return <Database className={className} size={32} />;
        }
    };

    // Color Theme Mapping
    const getThemeColors = (color: string) => {
        const themes: Record<string, any> = {
            indigo: { bg: 'from-indigo-900 to-purple-800', text: 'text-indigo-900', accent: 'text-indigo-600', border: 'border-indigo-100', bgLight: 'bg-indigo-50' },
            cyan: { bg: 'from-cyan-900 to-blue-800', text: 'text-cyan-900', accent: 'text-cyan-600', border: 'border-cyan-100', bgLight: 'bg-cyan-50' },
            emerald: { bg: 'from-emerald-900 to-teal-800', text: 'text-emerald-900', accent: 'text-emerald-600', border: 'border-emerald-100', bgLight: 'bg-emerald-50' },
            amber: { bg: 'from-amber-900 to-orange-800', text: 'text-amber-900', accent: 'text-amber-600', border: 'border-amber-100', bgLight: 'bg-amber-50' },
            rose: { bg: 'from-rose-900 to-pink-800', text: 'text-rose-900', accent: 'text-rose-600', border: 'border-rose-100', bgLight: 'bg-rose-50' },
            slate: { bg: 'from-slate-900 to-gray-800', text: 'text-slate-900', accent: 'text-slate-600', border: 'border-slate-100', bgLight: 'bg-slate-50' },
            sky: { bg: 'from-sky-900 to-blue-800', text: 'text-sky-900', accent: 'text-sky-600', border: 'border-sky-100', bgLight: 'bg-sky-50' },
        };
        return themes[color] || themes['indigo'];
    };

    const theme = getThemeColors(activeStudy.meta.color);

    return (
        <div className="flex-1 bg-slate-50 text-slate-800 font-sans overflow-y-auto custom-scrollbar">

            {/* HEADER */}
            <header className={`bg-gradient-to-r ${theme.bg} text-white py-16 px-6 shadow-2xl relative overflow-hidden transition-colors duration-500`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">

                    {/* STUDY SELECTOR */}
                    <div className="relative mb-8">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all"
                        >
                            <span className="opacity-70">Study:</span> {activeStudy.meta.title} <ChevronDown size={14} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 text-slate-800 z-50">
                                {CASE_STUDIES.map(study => (
                                    <button
                                        key={study.id}
                                        onClick={() => { setActiveStudyId(study.id); setIsMenuOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-between ${activeStudyId === study.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
                                    >
                                        <span>{study.meta.title}</span>
                                        {activeStudyId === study.id && <CheckCircle2 size={14} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-lg">
                        DePIN Tokenomics
                    </h1>
                    <p className="text-xl md:text-2xl text-indigo-100 font-light max-w-3xl mx-auto leading-relaxed">
                        {activeStudy.meta.subtitle}
                    </p>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <span className="bg-white/10 px-6 py-2 rounded-full border border-white/20 backdrop-blur-md text-sm font-bold uppercase tracking-wider shadow-sm flex items-center gap-2">
                            <Radio size={16} /> Ticker: {activeStudy.meta.ticker}
                        </span>
                        <span className="bg-orange-500 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg text-white flex items-center gap-2">
                            <Zap size={16} /> Stress Test Analysis
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-20">

                {/* 1. INTRO: THE CRISIS */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                    <div className="md:col-start-3 md:col-span-8 text-center">
                        <h2 className={`text-3xl font-black ${theme.text} mb-6 uppercase tracking-tight`}>{activeStudy.narrative.introTitle}</h2>
                        <p className="text-lg text-slate-600 leading-8">
                            {activeStudy.narrative.introText}
                        </p>
                    </div>
                </section>

                {/* 2. MECHANISM: LEARN FLOW */}
                <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-l-8 border-orange-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <RefreshCw size={200} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide">{activeStudy.narrative.mechanismTitle}</h3>
                        <p className="text-slate-500 mb-12 max-w-3xl text-lg">
                            {activeStudy.narrative.mechanismText}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-start">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-[40px] left-0 w-full h-1 bg-gradient-to-r from-indigo-100 via-orange-100 to-emerald-100 -translate-y-1/2 z-0"></div>

                            {activeStudy.narrative.steps.map((step, idx) => (
                                <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                                    <div className={`w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 border-4 border-${step.color}-100 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                                        <div className={`w-20 h-20 rounded-full bg-${step.color}-50 flex items-center justify-center text-${step.color}-600`}>
                                            <DynamicIcon name={step.icon} className={`text-${step.color}-600`} />
                                        </div>
                                    </div>
                                    <h4 className={`font-bold text-${step.color}-700 text-lg mb-2`}>{step.title}</h4>
                                    <p className="text-sm text-slate-500 px-4 leading-relaxed">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. CHART: STABILITY */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-lg flex flex-col justify-center border border-slate-100">
                        <div className="mb-8">
                            <h3 className={`text-2xl font-black ${theme.text} uppercase tracking-tight mb-4`}>Coupling vs. Speculation</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Stress-test simulations reveal the danger of fixed emission schedules.
                                <br /><br />
                                <strong className="text-indigo-600">Coupled Models (Blue)</strong> maintain value by restricting supply during low demand.
                                <br /><br />
                                <strong className="text-orange-500">Speculative Models (Orange)</strong> suffer from inflation-driven value erosion when demand fails to meet the fixed emission rate.
                            </p>
                        </div>
                        <div className={`${theme.bgLight} p-6 rounded-2xl border ${theme.border} text-center`}>
                            <span className={`text-5xl font-black ${theme.accent} block mb-2`}>-42%</span>
                            <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>Volatility Reduction</span>
                        </div>
                    </div>

                    <div className={`lg:col-span-8 bg-white p-8 rounded-3xl shadow-lg border-t-4 border-${activeStudy.meta.color}-600`}>
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Projected Token Value (36 Months)</h4>
                            <div className="flex gap-4 text-xs font-bold">
                                <div className="flex items-center gap-2"><div className={`w-3 h-3 bg-${activeStudy.meta.color}-500 rounded-full`}></div> Coupled</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> Speculative</div>
                            </div>
                        </div>
                        <div className="h-[400px]">
                            <ResponsiveContainer key={`stability-${activeStudy.id}`} width="100%" height="100%">
                                <LineChart data={activeStudy.charts.stability} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                        labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                                    />
                                    <Line type="monotone" dataKey="coupled" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 8 }} name="Coupled Model" />
                                    <Line type="monotone" dataKey="speculative" stroke="#f97316" strokeWidth={3} strokeDasharray="8 8" dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }} activeDot={{ r: 8 }} name="Speculative Model" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                {/* 4. SOLVENCY HEATMAP */}
                <section className={`bg-slate-900 rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden text-white`}>
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[128px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[128px] -ml-32 -mb-32"></div>

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-black mb-4">The Solvency Matrix ({activeStudy.meta.ticker})</h3>
                            <p className="text-slate-300 text-lg">
                                The "Solvency Score" is ratio of Network Revenue (Burn) to Token Emissions.
                                <br />The heatmap illustrates the <strong className="text-amber-400">Safe Zone</strong>. Networks with high emissions and low real-world usage face rapid insolvency.
                            </p>
                        </div>

                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                            <div className="flex gap-4">
                                {/* Y-Axis Label */}
                                <div className="hidden md:flex flex-col justify-between py-8 text-xs font-bold text-slate-500 uppercase tracking-widest text-right pr-4">
                                    <span className="flex items-center justify-end h-full">Max Emissions</span>
                                    <span className="flex items-center justify-end h-full">High Emissions</span>
                                    <span className="flex items-center justify-end h-full">Med Emissions</span>
                                    <span className="flex items-center justify-end h-full">Low Emissions</span>
                                </div>

                                <div className="flex-1">
                                    {/* Grid */}
                                    <div key={activeStudy.id} className="grid grid-cols-4 gap-1.5 aspect-[4/3] md:aspect-[2/1]">
                                        {activeStudy.charts.solvency.map((cell, idx) => (
                                            <div
                                                key={idx}
                                                className={`${getScoreColor(cell.score)} rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-[1.02] hover:shadow-lg cursor-default group relative`}
                                            >
                                                <span className="text-2xl font-black text-white/90 drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity absolute">{cell.score}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest text-white/80 group-hover:opacity-0 transition-opacity`}>{cell.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* X-Axis Label */}
                                    <div className="grid grid-cols-4 pt-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        <span>Low Usage</span>
                                        <span>Med Usage</span>
                                        <span>High Usage</span>
                                        <span>Max Usage</span>
                                    </div>
                                    <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-2">Network Verification Volume →</p>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex justify-center gap-6 mt-8">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400"><div className="w-3 h-3 bg-indigo-900 rounded"></div> Danger</div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400"><div className="w-3 h-3 bg-orange-500 rounded"></div> Risk</div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400"><div className="w-3 h-3 bg-amber-400 rounded"></div> Warning</div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400"><div className="w-3 h-3 bg-emerald-500 rounded"></div> Healthy</div>
                        </div>
                    </div>
                </section>

                {/* 5. MINER PAYBACK & RESILIENCE */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* PAYBACK CHART */}
                    <div className="bg-white p-8 rounded-3xl shadow-lg border-t-4 border-orange-500 flex flex-col">
                        <h4 className="text-lg font-bold text-slate-800 mb-2">Ensuring Contributor ROI</h4>
                        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                            Infrastructure providers (nodes) are the backbone of DePIN. The <strong>Danger Zone</strong> is &gt;36 months, triggering capitulation.
                        </p>

                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer key={`payback-${activeStudy.id}`} width="100%" height="100%">
                                <BarChart data={activeStudy.charts.payback} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="scenario" type="category" width={80} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="months" radius={[0, 4, 4, 0]} barSize={40}>
                                        {
                                            activeStudy.charts.payback.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Custom Legend for Bar Colors since Recharts simple map is tricky inside Bar */}
                        <div className="flex flex-wrap gap-4 mt-4 justify-center">
                            {activeStudy.charts.payback.map(d => (
                                <div key={d.scenario} className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500">
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.fill }}></div>
                                    {d.scenario} ({d.months}m)
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RADAR CHART */}
                    <div className={`${theme.bgLight} p-8 rounded-3xl border ${theme.border} flex flex-col`}>
                        <h4 className={`text-lg font-bold ${theme.text} mb-2`}>Resilience Radar</h4>
                        <p className={`${theme.accent} opacity-70 text-sm mb-8 leading-relaxed`}>
                            How the {activeStudy.meta.title} model scores against generic inflationary models under various attack vectors.
                        </p>

                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer key={`radar-${activeStudy.id}`} width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={activeStudy.charts.radar}>
                                    <PolarGrid stroke="#cbd5e1" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Active Model"
                                        dataKey="A"
                                        stroke="#4c1d95"
                                        strokeWidth={3}
                                        fill="#6366f1"
                                        fillOpacity={0.4}
                                    />
                                    <Radar
                                        name="Generic Model"
                                        dataKey="B"
                                        stroke="#94a3b8"
                                        strokeWidth={2}
                                        fill="#cbd5e1"
                                        fillOpacity={0.4}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="text-center py-20 border-t border-slate-200">
                    <ShieldCheck size={48} className="text-emerald-500 mx-auto mb-6" />
                    <h4 className="text-2xl font-black text-slate-800 mb-4">Case Study Key Takeaway</h4>
                    <p className="max-w-2xl mx-auto text-slate-600 mb-8 text-lg leading-relaxed">
                        {activeStudy.narrative.conclusionText}
                    </p>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                        Generated based on {activeStudy.meta.title} tokenomic case study data. Visualizations rendered using Recharts & Fabric.
                    </p>
                </footer>

            </main>
        </div>
    );
};
