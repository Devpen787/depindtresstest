import React, { useState } from 'react';
import {
    Fingerprint, Database, CheckCircle2, Settings2, Shield, Zap, TrendingDown, Infinity as InfinityIcon, Swords, Sliders, Users, BarChart3, ShieldQuestion, Target, Library, Github, MessageSquare, Info
} from 'lucide-react';

import { PROTOCOL_PROFILES, ProtocolProfileV1 } from '../../data/protocols';
import { SCENARIOS } from '../../data/scenarios';
import { LegacySimulationParams as SimulationParams } from '../../model/legacy/engine';
import { IncentiveRegime } from '../../utils/regime';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import ParamLabel from '../ui/ParamLabel';

interface SimulatorSidebarProps {
    viewMode: 'sandbox' | 'comparison' | 'settings' | 'explorer';
    activeProfile: ProtocolProfileV1;
    selectedProtocolIds: string[];
    loadProfile: (p: ProtocolProfileV1) => void;
    toggleProtocolSelection: (id: string) => void;
    params: SimulationParams;
    setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
    incentiveRegime: IncentiveRegime;
    collapsedSections: Record<string, boolean>;
    toggleSection: (section: string) => void;
    activeScenarioId: string | null;
    setActiveScenarioId: (id: string | null) => void;
    setFocusChart: (chart: string | null) => void;
    setShowKnowledgeLayer: (show: boolean) => void;
    findBreakEven: () => void;
    runOptimization: (type: 'scale' | 'defense') => void;
}

export const SimulatorSidebar: React.FC<SimulatorSidebarProps> = ({
    viewMode,
    activeProfile,
    selectedProtocolIds,
    loadProfile,
    toggleProtocolSelection,
    params,
    setParams,
    incentiveRegime,
    collapsedSections,
    toggleSection,
    activeScenarioId,
    setActiveScenarioId,
    setFocusChart,
    findBreakEven,
    runOptimization,
    setShowKnowledgeLayer
}) => {

    return (
        <aside className="w-[340px] border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 h-full">
            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* AGENT TOOLS (Review & Verify Phase 5.5) */}
                {viewMode === 'sandbox' && (
                    <div className="p-4 border-b border-indigo-500/30 bg-indigo-900/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap size={14} className="text-indigo-400" />
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                                Analyst Suite
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={findBreakEven}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                title="Optimizes Initial Price until Solvency > 1.0"
                            >
                                <Target size={14} /> Find Break-Even Price
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => runOptimization('scale')}
                                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-widest border border-slate-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
                                    title="Finds Max Providers before Solvency breaks"
                                >
                                    <Swords size={12} className="text-emerald-500" />
                                    <span>Max Scale</span>
                                </button>
                                <button
                                    onClick={() => runOptimization('defense')}
                                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-widest border border-slate-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
                                    title="Optimizes Emission (Max Mint) to retain nodes against competition"
                                >
                                    <Shield size={12} className="text-purple-500" />
                                    <span>Defense</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-6 border-b border-slate-800/50">
                    <div className="flex items-center gap-2 mb-6">
                        <Fingerprint size={14} className="text-emerald-500" />
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            {viewMode === 'sandbox' ? 'Active Archetype' : 'Select Protocols'}
                        </h2>
                    </div>
                    <div className="flex flex-col gap-2">
                        {PROTOCOL_PROFILES.map(p => {
                            const isSelected = selectedProtocolIds.includes(p.metadata.id);
                            const isActive = activeProfile.metadata.id === p.metadata.id;
                            const isHighlighted = (viewMode === 'sandbox' && isActive) || (viewMode === 'comparison' && isSelected);

                            return (
                                <button
                                    key={p.metadata.id}
                                    onClick={() => viewMode === 'sandbox' ? loadProfile(p) : toggleProtocolSelection(p.metadata.id)}
                                    className={`p-4 rounded-xl text-left transition-all border group active:scale-[0.98] ${isHighlighted
                                        ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.1)]'
                                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[11px] font-extrabold uppercase tracking-tight ${isHighlighted ? 'text-indigo-400' : 'text-slate-300'}`}>
                                            {p.metadata.name}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {p.metadata.model_type === 'location_based' ?
                                                <Fingerprint size={10} className="text-emerald-500" title="Category A: Location-Based (Physical Density)" /> :
                                                <Database size={10} className="text-amber-500" title="Category B: Fungible Resource (Compute/Storage)" />
                                            }
                                            {isHighlighted && <CheckCircle2 size={12} className="text-indigo-400" />}
                                        </div>
                                    </div>
                                    <div className="text-[9px] text-slate-500 font-medium leading-tight">{p.metadata.mechanism}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    {/* STRESS CONTROLS */}
                    <CollapsibleSection
                        id="section-stress"
                        title="Stress Controls"
                        icon={<Settings2 size={14} />}
                        iconColor="text-indigo-400"
                        summary={`${params.T}wk • ${params.demandType} • ${params.macro}`}
                        isOpen={!collapsedSections.stress}
                        onToggle={() => toggleSection('stress')}
                    >
                        <div>
                            <ParamLabel label="Time Horizon" paramKey="T" locked={viewMode === 'comparison'} />
                            <input type="range" min="12" max="104" value={params.T} onChange={e => setParams({ ...params, T: parseInt(e.target.value) })} className="w-full accent-indigo-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer mb-2" />
                            <div className="flex justify-between text-[10px] font-mono text-slate-400"><span>Duration</span><span className="text-indigo-400 font-bold">{params.T} weeks</span></div>
                        </div>

                        <div className="space-y-3">
                            <ParamLabel label="Exogenous Load (Demand)" paramKey="demandType" locked={viewMode === 'comparison'} />
                            <div className="grid grid-cols-2 gap-2">
                                {['consistent', 'growth', 'volatile', 'high-to-decay'].map(d => (
                                    <button key={d} onClick={() => setParams({ ...params, demandType: d as any })} className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all border active:scale-95 ${params.demandType === d ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>{d}</button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <ParamLabel label="Macro Condition" paramKey="macro" />
                            <div className="grid grid-cols-3 gap-2">
                                {(['bearish', 'sideways', 'bullish'] as const).map(m => (
                                    <button key={m} onClick={() => setParams({ ...params, macro: m })} className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all border active:scale-95 ${params.macro === m ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>{m}</button>
                                ))}
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* COMPETITIVE & VAMPIRE */}
                    <CollapsibleSection
                        id="section-competitive"
                        title="Vampire & Treasury"
                        icon={<Shield size={14} />}
                        iconColor="text-purple-400"
                        summary={`Competitor: +${(params.competitorYield * 100).toFixed(0)}% • ${params.revenueStrategy === 'reserve' ? 'Reserve' : 'Burn'}`}
                        isOpen={!collapsedSections.competitive}
                        onToggle={() => toggleSection('competitive')}
                    >
                        {/* Vampire Attack Slider */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <ParamLabel label="Competitor Yield Advantage" paramKey="competitorYield" />
                                <span className="text-purple-400 text-[10px] font-mono font-bold">
                                    +{(params.competitorYield * 100).toFixed(0)}%
                                </span>
                            </div>
                            <input
                                type="range" min="0" max="2" step="0.1"
                                value={params.competitorYield}
                                onChange={e => setParams({ ...params, competitorYield: parseFloat(e.target.value) })}
                                className="w-full accent-purple-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                                <span>No Threat</span>
                                <span>200% (Critical)</span>
                            </div>
                            <p className="text-[9px] text-slate-500 mt-2 italic">
                                Simulates a competitor offering higher APY to steal your nodes.
                            </p>
                        </div>

                        {/* Emission Model Toggle */}
                        <div className="mt-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Emission Model</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setParams({ ...params, emissionModel: 'fixed' })} className={`px-3 py-2 rounded-lg border text-xs font-bold uppercase transition-all ${params.emissionModel === 'fixed' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}>Fixed Schedule</button>
                                <button onClick={() => setParams({ ...params, emissionModel: 'kpi' })} className={`px-3 py-2 rounded-lg border text-xs font-bold uppercase transition-all ${params.emissionModel === 'kpi' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}>KPI-Based</button>
                            </div>
                        </div>

                        {/* Revenue Strategy Toggle */}
                        <div className="mt-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Revenue Strategy</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setParams({ ...params, revenueStrategy: 'burn' })} className={`px-3 py-2 rounded-lg border text-xs font-bold uppercase transition-all ${params.revenueStrategy === 'burn' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}>Buy & Burn</button>
                                <button onClick={() => setParams({ ...params, revenueStrategy: 'reserve' })} className={`px-3 py-2 rounded-lg border text-xs font-bold uppercase transition-all ${params.revenueStrategy === 'reserve' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}>Sinking Fund</button>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* SCENARIOS */}
                    <CollapsibleSection
                        id="section-scenarios"
                        title="Quick Presets"
                        icon={<Zap size={14} />}
                        iconColor="text-pink-500"
                        summary="Crypto Winter • Saturation • Utility"
                        isOpen={!collapsedSections.scenarios}
                        onToggle={() => toggleSection('scenarios')}
                    >
                        <div className="grid grid-cols-1 gap-2">
                            {SCENARIOS.map((scenario) => {
                                const Icon = scenario.iconName === 'TrendingDown' ? TrendingDown :
                                    scenario.iconName === 'Infinity' ? InfinityIcon :
                                        scenario.iconName === 'Swords' ? Swords : Zap;
                                const isActive = activeScenarioId === scenario.id;

                                return (
                                    <button
                                        key={scenario.id}
                                        onClick={() => {
                                            setParams(prev => ({ ...prev, ...scenario.params }));
                                            setActiveScenarioId(scenario.id);
                                            if (scenario.focusChart) setFocusChart(scenario.focusChart);
                                        }}
                                        className={`p-3 rounded-xl border text-left transition-all group ${isActive ? 'bg-indigo-600/20 border-indigo-500 shadow-earthquake' : 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20'}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-white' : 'text-indigo-400'}`}>{scenario.name}</span>
                                            <Icon size={12} className={isActive ? 'text-white' : 'text-indigo-400'} />
                                        </div>
                                        <p className="text-[10px] text-slate-400">{scenario.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </CollapsibleSection>

                    {/* TOKENOMICS */}
                    <CollapsibleSection
                        id="section-tokenomics"
                        title="Tokenomics"
                        icon={<Database size={14} />}
                        iconColor="text-violet-500"
                        summary={`$${params.initialPrice} • ${(params.burnPct * 100).toFixed(0)}% burn`}
                        isOpen={!collapsedSections.tokenomics}
                        onToggle={() => toggleSection('tokenomics')}
                    >
                        <div>
                            <ParamLabel label="Initial Token Price" paramKey="initialPrice" />
                            <div className="flex items-center gap-3">
                                <input type="number" step="0.1" min="0.01" max="100" value={params.initialPrice} onChange={e => setParams({ ...params, initialPrice: parseFloat(e.target.value) || 0.01 })} className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-indigo-500 outline-none" />
                                <span className="text-[10px] text-slate-500 font-bold">USD</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <ParamLabel label="Burn Percentage" paramKey="burnPct" />
                                <span className="text-indigo-400 text-[10px] font-mono font-bold">{(params.burnPct * 100).toFixed(0)}%</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.05" value={params.burnPct} onChange={e => setParams({ ...params, burnPct: parseFloat(e.target.value) })} className="w-full accent-indigo-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                            <div className="flex justify-between text-[9px] text-slate-600 mt-1"><span>0% (Inflationary)</span><span>100% (Deflationary)</span></div>
                        </div>
                        <div>
                            <ParamLabel label="Weekly Emission Cap" paramKey="maxMintWeekly" />
                            <div className="flex items-center gap-3 mt-2">
                                <input type="number" min="0" step="1000" value={params.maxMintWeekly} onChange={e => setParams({ ...params, maxMintWeekly: parseFloat(e.target.value) || 0 })} className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-indigo-500 outline-none" />
                                <span className="text-[10px] text-slate-500 font-bold">TOKENS</span>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* ADVANCED */}
                    <CollapsibleSection
                        id="section-advanced"
                        title="Advanced Configuration"
                        icon={<Sliders size={14} />}
                        iconColor="text-slate-400"
                        summary="Economics • Simulation"
                        isOpen={!collapsedSections.advanced}
                        onToggle={() => toggleSection('advanced')}
                    >
                        <div className="space-y-6">
                            <CollapsibleSection
                                id="section-providers"
                                title="Provider Economics"
                                icon={<Users size={14} />}
                                iconColor="text-emerald-500"
                                summary={`$${params.providerCostPerWeek}/wk OpEx • $${params.churnThreshold} churn`}
                                isOpen={!collapsedSections.providers}
                                onToggle={() => toggleSection('providers')}
                            >
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <ParamLabel label="Initial Node Count" paramKey="initialProviders" />
                                        <div className="flex items-center gap-1">
                                            <span className="text-emerald-400 text-[10px] font-mono font-bold">
                                                {params.initialProviders?.toLocaleString() || 30}
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="50000"
                                        step="10"
                                        value={params.initialProviders || 30}
                                        onChange={e => setParams({ ...params, initialProviders: parseInt(e.target.value) })}
                                        className="w-full accent-emerald-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer mb-2"
                                    />
                                    <div className="flex justify-between text-[9px] text-slate-600 mb-6">
                                        <span>10 Nodes</span>
                                        <span>50k Nodes</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <ParamLabel label="Pro Hardware (Quality)" paramKey="proTierPct" />
                                        <span className="text-emerald-400 text-[10px] font-mono font-bold">{(params.proTierPct * 100).toFixed(0)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={params.proTierPct || 0}
                                        onChange={e => setParams({ ...params, proTierPct: parseFloat(e.target.value) })}
                                        className="w-full accent-emerald-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer mb-2"
                                    />
                                    <div className="flex justify-between text-[9px] text-slate-600 mb-6">
                                        <span>All Basic</span>
                                        <span>All Pro</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <ParamLabel label="Weekly OpEx Cost" paramKey="providerCostPerWeek" />
                                        <span className="text-emerald-400 text-[10px] font-mono font-bold">${params.providerCostPerWeek.toFixed(0)}</span>
                                    </div>
                                    <input type="range" min="5" max="200" step="5" value={params.providerCostPerWeek} onChange={e => setParams({ ...params, providerCostPerWeek: parseFloat(e.target.value) })} className="w-full accent-emerald-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer mb-6" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <ParamLabel label="Hardware Cost (Capex)" paramKey="hardwareCost" />
                                        <span className="text-emerald-400 text-[10px] font-mono font-bold">${params.hardwareCost.toFixed(0)}</span>
                                    </div>
                                    <input type="range" min="200" max="2000" step="50" value={params.hardwareCost} onChange={e => setParams({ ...params, hardwareCost: parseFloat(e.target.value) })} className="w-full accent-emerald-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <ParamLabel label="Churn Threshold" paramKey="churnThreshold" />
                                        <span className="text-amber-400 text-[10px] font-mono font-bold">${params.churnThreshold.toFixed(0)}/wk</span>
                                    </div>
                                    <input type="range" min="-20" max="50" step="5" value={params.churnThreshold} onChange={e => setParams({ ...params, churnThreshold: parseFloat(e.target.value) })} className="w-full accent-amber-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                                </div>
                            </CollapsibleSection>

                            <CollapsibleSection
                                id="section-simulation"
                                title="Simulation"
                                icon={<BarChart3 size={14} />}
                                iconColor="text-blue-500"
                                summary={`${params.nSims} runs • seed ${params.seed}`}
                                isOpen={!collapsedSections.simulation}
                                onToggle={() => toggleSection('simulation')}
                            >
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <ParamLabel label="Monte Carlo Runs" paramKey="nSims" />
                                        <span className="text-blue-400 text-[10px] font-mono font-bold">{params.nSims}</span>
                                    </div>
                                    <input type="range" min="20" max="500" step="20" value={params.nSims} onChange={e => setParams({ ...params, nSims: parseInt(e.target.value) })} className="w-full accent-blue-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <ParamLabel label="Random Seed" paramKey="seed" />
                                    <div className="flex items-center gap-2">
                                        <input type="number" min="1" max="999999" value={params.seed} onChange={e => setParams({ ...params, seed: parseInt(e.target.value) || 42 })} className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-indigo-500 outline-none" />
                                        <button onClick={() => setParams({ ...params, seed: Math.floor(Math.random() * 999999) })} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[9px] font-bold text-slate-400 transition-colors" title="Randomise seed">🎲</button>
                                    </div>
                                </div>
                            </CollapsibleSection>
                        </div>
                    </CollapsibleSection>

                    {/* INCENTIVE REGIME BOX */}
                    {viewMode === 'sandbox' && (
                        <section className={`bg-slate-900/80 border border-${incentiveRegime.color}-500/30 rounded-2xl p-5 space-y-4 transition-all duration-500`}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <ShieldQuestion size={14} className={`text-${incentiveRegime.color}-400`} />
                                    <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Incentive Regime</h3>
                                </div>
                                <Target size={12} className={`text-${incentiveRegime.color}-400 animate-pulse`} />
                            </div>
                            <div className="space-y-3">
                                <div className={`px-2 py-1.5 rounded-lg bg-${incentiveRegime.color}-500/10 border border-${incentiveRegime.color}-500/20 shadow-inner`}>
                                    <span className={`text-[10px] font-extrabold uppercase tracking-widest text-${incentiveRegime.color}-400`}>{incentiveRegime.regime}</span>
                                </div>
                                <button onClick={() => setShowKnowledgeLayer(true)} className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                                    <Library size={12} /> Knowledge Layer
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* FOOTER LINKS */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80">
                <div className="grid grid-cols-3 gap-2">
                    <a
                        href="https://github.com/volt-capital/depin-stress-test"
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-900 group transition-colors"
                    >
                        <Github size={16} className="text-slate-500 group-hover:text-white mb-1" />
                        <span className="text-[9px] font-bold text-slate-500 group-hover:text-slate-300">GitHub</span>
                    </a>
                    <button
                        onClick={() => setShowKnowledgeLayer(true)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-900 group transition-colors"
                    >
                        <Info size={16} className="text-slate-500 group-hover:text-emerald-400 mb-1" />
                        <span className="text-[9px] font-bold text-slate-500 group-hover:text-slate-300">Why?</span>
                    </button>
                    <a
                        href="mailto:hello@depinstresstest.com"
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-900 group transition-colors"
                    >
                        <MessageSquare size={16} className="text-slate-500 group-hover:text-indigo-400 mb-1" />
                        <span className="text-[9px] font-bold text-slate-500 group-hover:text-slate-300">Feedback</span>
                    </a>
                </div>
            </div>
        </aside>
    );
};
