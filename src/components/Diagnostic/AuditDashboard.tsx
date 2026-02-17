import React, { useState, useMemo } from 'react';
// Duplicate imports removed
import { DiagnosticInput, DiagnosticState } from './types';
import { SignalsOfDeathPanel } from './SignalsOfDeathPanel';
import { SubsidyTrapChart } from './SubsidyTrapChart';
import { HexDegradationMap } from './HexDegradationMap';
import { DensityTrapChart } from './DensityTrapChart';
import { StrategicActionsPanel } from './StrategicActionsPanel';
import { ArchetypeLogicPanel } from './ArchetypeLogicPanel';
import { HumanArchetypePanel } from './HumanArchetypePanel';
import { PeerComparisonTable } from './PeerComparisonTable';
import { StrategicRecommendationsPanel } from './StrategicRecommendationsPanel';

import { MasterProofMatrix } from './MasterProofMatrix';
import { SensitivityTornadoChart } from './SensitivityTornadoChart';
import { SensitivityHeatmap } from './SensitivityHeatmap';
import { InflationCapacityScatter } from './InflationCapacityScatter';
import { SolvencyScorecard } from './SolvencyScorecard';
import { AggregateResult, SimulationParams } from '../../model/types';
import { ShieldAlert, Activity, Info, Skull } from 'lucide-react';
import { calculateDiagnosticState } from '../../audit/diagnosticViewMath';
import { DIAGNOSTIC_ARCHETYPE_TO_PROTOCOL_ID } from '../../data/diagnosticArchetypes';

import MetricEvidenceLegend from '../ui/MetricEvidenceLegend';
import {
    GUARDRAIL_BAND_LABELS,
    RESILIENCE_GUARDRAILS,
    SOLVENCY_GUARDRAILS
} from '../../constants/guardrails';


interface Props {
    simulationData?: AggregateResult[];
    loading?: boolean;
    profileName?: string;
    onProtocolChange?: (id: string) => void;
    onRunSensitivity?: () => { parameter: string, low: number, high: number, delta: number }[];
    onParamChange?: (params: Partial<SimulationParams>) => void;
}

const AuditDashboardComponent: React.FC<Props> = ({ simulationData = [], loading = false, profileName = 'Unknown Protocol', onProtocolChange, onRunSensitivity, onParamChange }) => {
    // --- STATE: Diagnostic Inputs ---
    const [inputs, setInputs] = useState<DiagnosticInput>({
        minerProfile: 'Professional', // Default: Onocoy style
        emissionSchedule: 'Fixed',
        growthCoordination: 'Managed', // Default for Pro/Onocoy
        demandLag: 'High',
        priceShock: 'None',
        insiderOverhang: 'Low',
        sybilResistance: 'Strong',
    });
    const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);

    // --- LOGIC: Resilience Scorecard Algorithm ---
    const diagnosticState = useMemo((): DiagnosticState => calculateDiagnosticState(inputs), [inputs]);




    const diagnosticTone = diagnosticState.resilienceScore >= RESILIENCE_GUARDRAILS.healthyMinScore
        ? 'healthy'
        : diagnosticState.resilienceScore >= RESILIENCE_GUARDRAILS.watchlistMinScore
            ? 'caution'
            : 'critical';

    const diagnosticBandLabel = diagnosticTone === 'healthy'
        ? GUARDRAIL_BAND_LABELS.healthy
        : diagnosticTone === 'caution'
            ? GUARDRAIL_BAND_LABELS.watchlist
            : GUARDRAIL_BAND_LABELS.intervention;

    const diagnosticBadgeClass = diagnosticTone === 'healthy'
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : diagnosticTone === 'caution'
            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            : 'bg-red-500/10 text-red-500 border-red-500/20';

    return (
        <div className="bg-slate-950 min-h-full text-slate-200 p-6 lg:p-10 font-sans space-y-12">

            {showAdvancedAnalysis && (
                <section className="mb-12">
                    <MasterProofMatrix data={simulationData || []} loading={loading || false} profileName={profileName} />
                </section>
            )}

            {/* 0.5. SOLVENCY SCORECARD (New Framework) */}
            <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Activity className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Solvency Scorecard</h2>
                        <p className="text-slate-400 text-sm">Live simulation summary of burn coverage, capital efficiency, and recovery after shocks.</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                    <SolvencyScorecard data={simulationData || []} />
                </div>
            </section>

            {/* 1. Header & Disclaimer */}
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <ShieldAlert className="text-indigo-500" size={32} />
                            Root-Cause Diagnostic
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                            Use this view to understand why a protocol breaks under stress assumptions.
                            <span className="text-indigo-400 font-bold ml-2">Model-based diagnostic, not a price forecast.</span>
                        </p>
                    </div>

                    {/* Peer Switcher / Preset */}
                    <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-xs font-bold text-slate-500 px-2 uppercase tracking-wider">Archetype:</span>
                        <select
                            className="bg-slate-800 text-white text-sm font-bold py-2 px-4 rounded-md border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={inputs.selectedArchetype || 'onocoy'}
                            onChange={(e) => {
                                const val = e.target.value;
                                const presets: Record<string, DiagnosticInput> = {
                                    onocoy: { minerProfile: 'Professional', emissionSchedule: 'Dynamic', growthCoordination: 'Managed', demandLag: 'Low', priceShock: 'None', insiderOverhang: 'Low', sybilResistance: 'Strong', selectedArchetype: 'onocoy' },
                                    render: { minerProfile: 'Professional', emissionSchedule: 'Dynamic', growthCoordination: 'Managed', demandLag: 'Low', priceShock: 'Moderate', insiderOverhang: 'Low', sybilResistance: 'Strong', selectedArchetype: 'render' },
                                    ionet: { minerProfile: 'Professional', emissionSchedule: 'Dynamic', growthCoordination: 'Managed', demandLag: 'Low', priceShock: 'Moderate', insiderOverhang: 'Low', sybilResistance: 'Strong', selectedArchetype: 'ionet' },
                                    nosana: { minerProfile: 'Professional', emissionSchedule: 'Dynamic', growthCoordination: 'Managed', demandLag: 'Low', priceShock: 'Moderate', insiderOverhang: 'Low', sybilResistance: 'Strong', selectedArchetype: 'nosana' },
                                    geodnet: { minerProfile: 'Professional', emissionSchedule: 'Dynamic', growthCoordination: 'Managed', demandLag: 'Low', priceShock: 'None', insiderOverhang: 'Low', sybilResistance: 'Strong', selectedArchetype: 'geodnet' },
                                    hivemapper: { minerProfile: 'Mercenary', emissionSchedule: 'Dynamic', growthCoordination: 'Uncoordinated', demandLag: 'High', priceShock: 'Severe', insiderOverhang: 'High', sybilResistance: 'Weak', selectedArchetype: 'hivemapper' },
                                    grass: { minerProfile: 'Mercenary', emissionSchedule: 'Dynamic', growthCoordination: 'Uncoordinated', demandLag: 'High', priceShock: 'Severe', insiderOverhang: 'High', sybilResistance: 'Weak', selectedArchetype: 'grass' },
                                    dimo: { minerProfile: 'Mercenary', emissionSchedule: 'Dynamic', growthCoordination: 'Managed', demandLag: 'High', priceShock: 'Moderate', insiderOverhang: 'Low', sybilResistance: 'Weak', selectedArchetype: 'dimo' },
                                    helium_mobile: { minerProfile: 'Mercenary', emissionSchedule: 'Fixed', growthCoordination: 'Uncoordinated', demandLag: 'High', priceShock: 'Moderate', insiderOverhang: 'High', sybilResistance: 'Weak', selectedArchetype: 'helium_mobile' },
                                    helium_legacy: { minerProfile: 'Mercenary', emissionSchedule: 'Fixed', growthCoordination: 'Uncoordinated', demandLag: 'High', priceShock: 'None', insiderOverhang: 'High', sybilResistance: 'Weak', selectedArchetype: 'helium_legacy' },
                                };
                                setInputs(presets[val] || presets.onocoy);

                                // Trigger global simulation update if handler provided
                                if (onProtocolChange && DIAGNOSTIC_ARCHETYPE_TO_PROTOCOL_ID[val]) {
                                    onProtocolChange(DIAGNOSTIC_ARCHETYPE_TO_PROTOCOL_ID[val]);
                                }
                            }}
                        >
                            <optgroup label="Robust (Professional)">
                                <option value="onocoy">Onocoy (GNSS - Reference)</option>
                                <option value="render">Render (Compute)</option>
                                <option value="ionet">io.net (Compute)</option>
                                <option value="nosana">Nosana (CI/Compute)</option>
                                <option value="geodnet">Geodnet (GNSS)</option>
                            </optgroup>
                            <optgroup label="Fragile (Mercenary)">
                                <option value="hivemapper">Hivemapper (Mapping)</option>
                                <option value="grass">Grass (AI Data)</option>
                                <option value="dimo">DIMO (Vehicle Data)</option>
                                <option value="helium_mobile">Helium Mobile (5G)</option>
                                <option value="helium_legacy">Helium Legacy (IoT)</option>
                            </optgroup>
                        </select>
                    </div>
                </div>

                {showAdvancedAnalysis && (
                    <>
                        {/* Archetype DNA Panel (Defensibility Layer) */}
                        <ArchetypeLogicPanel
                            inputs={inputs}
                            archetypeId={inputs.selectedArchetype || 'onocoy'}
                        />

                        <MetricEvidenceLegend />

                        {/* Peer Comparison Table */}
                        <PeerComparisonTable
                            inputs={inputs}
                            selectedPeerName={inputs.selectedArchetype || 'onocoy'}
                        />
                    </>
                )}

                {/* Epistemic Disclaimer Alert */}
                <div className="flex items-start gap-3 bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl">
                    <Info className="text-indigo-400 shrink-0 mt-0.5" size={20} />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-indigo-300">Model Scope</h4>
                        <p className="text-xs text-indigo-400/80 leading-relaxed">
                            These charts show simulated behavior from the resilience model. They are useful for comparing failure patterns, but they are not live market forecasts.
                        </p>
                    </div>
                </div>


            </div>

            {/* 2. Top Bar: Signals of Death */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity size={20} className="text-emerald-500" />
                        Overall Risk Snapshot
                    </h2>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-black border uppercase tracking-wider ${diagnosticBadgeClass}`}>
                        Status: {diagnosticBandLabel} ({diagnosticState.resilienceScore}/100) • Model: {diagnosticState.verdict}
                    </div>
                </div>
                <SignalsOfDeathPanel state={diagnosticState} />
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-white">Advanced Root-Cause Analysis</h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Open deeper modules for sensitivity tests and additional failure-mode simulations.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAdvancedAnalysis(prev => !prev)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${showAdvancedAnalysis
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500/60 hover:text-white'
                            }`}
                    >
                        {showAdvancedAnalysis ? 'Hide Advanced Analysis' : 'Open Advanced Analysis'}
                    </button>
                </div>
            </section>

            {showAdvancedAnalysis && onRunSensitivity && (
                <section>
                    <SensitivityTornadoChart onRunAnalysis={onRunSensitivity} />
                    <div className="mt-8">
                        <SensitivityHeatmap />
                    </div>
                    <div className="mt-8">
                        <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/50">
                            <h4 className="text-sm font-bold text-slate-400 mb-4">Verification: Effective Network Time (Feedback Loop)</h4>
                            <InflationCapacityScatter data={simulationData} />
                        </div>
                    </div>
                </section>
            )}

            {/* Spacer */}
            <div className="h-px bg-slate-800 w-full" />

            {/* 3. Failure Mode I: Subsidy Trap */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">I. The Subsidy Trap</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Are emissions covered by real demand? If R_BE is below {SOLVENCY_GUARDRAILS.criticalRatio.toFixed(1)}, emissions are outpacing burn.
                        </p>
                    </div>

                    {/* Control Panel */}
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Emission Regime</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['Fixed', 'Dynamic'] as const).map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setInputs(p => ({ ...p, emissionSchedule: opt }))}
                                        className={`text-xs py-2 rounded-lg font-bold border transition-all ${inputs.emissionSchedule === opt
                                            ? 'bg-indigo-600 text-white border-indigo-500'
                                            : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Demand Lag</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['Low', 'High'] as const).map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setInputs(p => ({ ...p, demandLag: opt }))}
                                        className={`text-xs py-2 rounded-lg font-bold border transition-all ${inputs.demandLag === opt
                                            ? 'bg-rose-600 text-white border-rose-500'
                                            : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Impact Translator */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border-l-4 border-indigo-500">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase mb-1">Impact Translator</h4>
                        <p className="text-sm text-slate-300">
                            {inputs.emissionSchedule} emissions with {inputs.demandLag.toLowerCase()} demand lag give an R_BE of <strong>{diagnosticState.r_be.toFixed(2)}</strong>.
                        </p>
                        <p className="text-xs text-slate-500 mt-2 italic">
                            For every $1.00 emitted, the model burns ${diagnosticState.r_be.toFixed(2)}.
                        </p>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <SubsidyTrapChart inputs={inputs} state={diagnosticState} />
                </div>
            </section>

            {showAdvancedAnalysis && (
                <>
                    {/* Spacer */}
                    <div className="h-px bg-slate-800 w-full" />

                    {/* 4. Failure Mode II: Profitability Churn */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">II. Profitability-Induced Churn</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Who stays when price drops? Mercenary operators usually leave faster, while professional operators often stay longer because of hardware sunk cost.
                        </p>
                    </div>

                    {/* Control Panel */}
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Miner Profile</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['Mercenary', 'Professional'] as const).map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setInputs(p => ({ ...p, minerProfile: opt }))}
                                        className={`text-xs py-2 rounded-lg font-bold border transition-all ${inputs.minerProfile === opt
                                            ? 'bg-indigo-600 text-white border-indigo-500'
                                            : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Price Shock Test</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['None', 'Moderate', 'Severe'] as const).map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setInputs(p => ({ ...p, priceShock: opt }))}
                                        className={`text-xs py-2 rounded-lg font-bold border transition-all ${inputs.priceShock === opt
                                            ? 'bg-rose-600 text-white border-rose-500'
                                            : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Impact Translator */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border-l-4 border-indigo-500">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase mb-1">Impact Translator</h4>
                        <p className="text-sm text-slate-300">
                            Under a {inputs.priceShock.toLowerCase()} shock, estimated retention for {inputs.minerProfile.toLowerCase()} operators falls to {diagnosticState.nrr}%.
                        </p>
                        <p className="text-xs text-slate-500 mt-2 italic">
                            Estimated hardware payback: {diagnosticState.cpv} months.
                        </p>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <HexDegradationMap inputs={inputs} state={diagnosticState} />
                </div>
                    </section>

                    {/* Spacer */}
                    <div className="h-px bg-slate-800 w-full" />

                    {/* 5. Failure Mode II: Density Trap */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">III. The Density Trap</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            When growth is uncoordinated, too many nodes chase the same demand and payback worsens.
                        </p>
                    </div>

                    {/* Control Panel */}
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Growth Coordination</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['Uncoordinated', 'Managed'] as const).map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setInputs(p => ({ ...p, growthCoordination: opt }))}
                                        className={`text-xs py-2 rounded-lg font-bold border transition-all ${inputs.growthCoordination === opt
                                            ? 'bg-indigo-600 text-white border-indigo-500'
                                            : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Insider Overhang</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['Low', 'High'] as const).map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setInputs(p => ({ ...p, insiderOverhang: opt }))}
                                        className={`text-xs py-2 rounded-lg font-bold border transition-all ${inputs.insiderOverhang === opt
                                            ? 'bg-rose-600 text-white border-rose-500'
                                            : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Impact Translator */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border-l-4 border-indigo-500">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase mb-1">Impact Translator</h4>
                        <p className="text-sm text-slate-300">
                            {inputs.growthCoordination} growth increases reward dilution risk.
                        </p>
                        <p className="text-xs text-slate-500 mt-2 italic">
                            Insider overhang: {inputs.insiderOverhang} ({inputs.insiderOverhang === 'High' ? '>50% locked' : '<30% locked'}).
                        </p>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <DensityTrapChart inputs={inputs} state={diagnosticState} />
                </div>
                    </section>

                    {/* Spacer */}
                    <div className="h-px bg-slate-800 w-full" />

                    {/* 6. Failure Mode IV: Sybil Attack (Adversarial) */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">IV. Adversarial Resilience</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            If anti-Sybil defenses are weak, fake participants can extract rewards from honest operators.
                        </p>
                    </div>

                    {/* Control Panel */}
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Sybil Resistance</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['Weak', 'Strong'] as const).map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            setInputs(p => ({ ...p, sybilResistance: opt }));
                                            // Trigger Simulation Update
                                            if (onParamChange) {
                                                onParamChange({
                                                    sybilAttackEnabled: opt === 'Weak',
                                                    sybilSize: opt === 'Weak' ? 0.3 : 0.0 // Default 30% attack
                                                });
                                            }
                                        }}
                                        className={`text-xs py-2 rounded-lg font-bold border transition-all ${inputs.sybilResistance === opt
                                            ? 'bg-rose-600 text-white border-rose-500'
                                            : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {inputs.sybilResistance === 'Weak' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Attack Magnitude</label>
                                <input
                                    type="range"
                                    min="0" max="100" step="10"
                                    defaultValue="30"
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) / 100;
                                        if (onParamChange) {
                                            onParamChange({ sybilSize: val });
                                        }
                                    }}
                                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Impact Translator */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border-l-4 border-indigo-500">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase mb-1">Impact Translator</h4>
                        <p className="text-sm text-slate-300">
                            {inputs.sybilResistance === 'Weak'
                                ? 'Weak resistance lets fake nodes dilute rewards and reduce incentive efficiency.'
                                : 'Strong resistance blocks fake-node extraction and protects reward quality.'}
                        </p>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <Skull className={`mb-4 transition-all duration-500 ${inputs.sybilResistance === 'Weak' ? 'text-rose-500 scale-125' : 'text-slate-700'}`} size={48} />
                    <h4 className="text-lg font-bold text-white mb-2">Adversarial Simulator</h4>
                    <p className="text-sm text-slate-400 max-w-md">
                        {inputs.sybilResistance === 'Weak'
                            ? 'Active attack mode: review the proof-quality panels to see reward dilution impact.'
                            : 'No active Sybil pressure detected in the current setup.'}
                    </p>
                </div>
                    </section>

                    {/* Spacer */}
                    <div className="h-px bg-slate-800 w-full" />

                    {/* 5. Human Archetype Analysis */}
                    <section className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
                    Human Response Analysis
                </h2>
                <p className="text-sm text-slate-400 max-w-2xl">
                    Technical failures trigger behavior changes. This panel shows which operator behavior is most likely under current stress conditions.
                </p>
                <HumanArchetypePanel inputs={inputs} state={diagnosticState} />
                    </section>

                    {/* Spacer */}
                    <div className="h-px bg-slate-800 w-full" />
                </>
            )}

            {/* 6. Strategic Actions Panel */}
            <section>
                <StrategicRecommendationsPanel inputs={inputs} state={diagnosticState} />
            </section>

        </div>
    );
};

export const AuditDashboard = React.memo(AuditDashboardComponent);
AuditDashboard.displayName = 'AuditDashboard';
