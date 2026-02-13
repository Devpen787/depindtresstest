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
import { DecisionPromptCard } from '../ui/DecisionPromptCard';
import MetricEvidenceLegend from '../ui/MetricEvidenceLegend';


interface Props {
    simulationData?: AggregateResult[];
    loading?: boolean;
    profileName?: string;
    onProtocolChange?: (id: string) => void;
    onRunSensitivity?: () => { parameter: string, low: number, high: number, delta: number }[];
    onParamChange?: (params: Partial<SimulationParams>) => void;
}

export const AuditDashboard: React.FC<Props> = ({ simulationData = [], loading = false, profileName = 'Unknown Protocol', onProtocolChange, onRunSensitivity, onParamChange }) => {
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

    // --- LOGIC: Resilience Scorecard Algorithm ---
    const diagnosticState = useMemo((): DiagnosticState => calculateDiagnosticState(inputs), [inputs]);

    const diagnosticTone = diagnosticState.verdict === 'Robust'
        ? 'healthy'
        : diagnosticState.verdict === 'Fragile'
            ? 'caution'
            : 'critical';

    return (
        <div className="bg-slate-950 min-h-full text-slate-200 p-6 lg:p-10 font-sans space-y-12">

            {/* 0. MASTER PROOF MATRIX (Thesis Defense) */}
            <section className="mb-12">
                <MasterProofMatrix data={simulationData || []} loading={loading || false} profileName={profileName} />
            </section>

            {/* 0.5. SOLVENCY SCORECARD (New Framework) */}
            <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Activity className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Solvency Scorecard</h2>
                        <p className="text-slate-400 text-sm">Real-time simulation metrics for Coverage Insolvency, Capital Efficiency, and Network Hysteresis.</p>
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
                            Engineering Audit: Signals of Death
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                            Diagnostic instrument for structural insolvency. Illustrating stress responses under fixed assumptions.
                            <span className="text-indigo-400 font-bold ml-2">Not a price predictor.</span>
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

                {/* Epistemic Disclaimer Alert */}
                <div className="flex items-start gap-3 bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl">
                    <Info className="text-indigo-400 shrink-0 mt-0.5" size={20} />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-indigo-300">Epistemic Disclaimer</h4>
                        <p className="text-xs text-indigo-400/80 leading-relaxed">
                            This dashboard simulates <strong>structural mechanics</strong> based on the "DePIN Resilience Diagnostic" framework.
                            It does not use live market data for these specific charts. Verdicts are illustrative of the <em>model's</em> fragility, not necessarily the live project's current price action.
                        </p>
                    </div>
                </div>

                <DecisionPromptCard
                    title="Diagnostic Storyline"
                    tone={diagnosticTone}
                    statusLabel={diagnosticState.verdict}
                    statusDetail={`Resilience ${diagnosticState.resilienceScore}/100`}
                    provenance={`Archetype: ${inputs.selectedArchetype || 'onocoy'} • Framework verdict from stress assumptions`}
                    decisions={[
                        'Do we change emission regime now or monitor one more cycle?',
                        'Is the current miner profile resilient enough for the selected shock path?',
                        'Should growth coordination become stricter under this risk profile?'
                    ]}
                    questions={[
                        `Which signal drives most fragility right now: BER ${diagnosticState.r_be.toFixed(2)} or NRR ${diagnosticState.nrr}%?`,
                        'What policy is least costly while still lifting the resilience score by 10+ points?',
                        'What threshold should trigger immediate governance intervention?'
                    ]}
                />
            </div>

            {/* 2. Top Bar: Signals of Death */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity size={20} className="text-emerald-500" />
                        Global Resilience Scorecard
                    </h2>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-black border uppercase tracking-wider ${diagnosticState.verdict === 'Robust' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        diagnosticState.verdict === 'Fragile' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                        Verdict: {diagnosticState.verdict} ({diagnosticState.resilienceScore}/100)
                    </div>
                </div>
                <SignalsOfDeathPanel state={diagnosticState} />
            </section>

            {/* 1.5. [NEW] Sensitivity Analysis */}
            {onRunSensitivity && (
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
                            Are we paying for utility or just presence? If R_BE &lt; 1.0, the protocol is printing money it hasn't earned.
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
                            "{inputs.emissionSchedule === 'Fixed' ? 'Fixed' : 'Dynamic'} emissions with {inputs.demandLag} demand lag results in a BER of <strong>{diagnosticState.r_be.toFixed(2)}</strong>."
                        </p>
                        <p className="text-xs text-slate-500 mt-2 italic">
                            "For every $1.00 printed, we burn ${diagnosticState.r_be.toFixed(2)}."
                        </p>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <SubsidyTrapChart inputs={inputs} state={diagnosticState} />
                </div>
            </section>

            {/* Spacer */}
            <div className="h-px bg-slate-800 w-full" />

            {/* 4. Failure Mode II: Profitability Churn */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">II. Profitability-Induced Churn</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Who stays when the price crashes? Mercenaries exit immediately; Professionals are anchored by CapEx.
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
                            "Under a {inputs.priceShock} shock, {100 - diagnosticState.nrr}% of {inputs.minerProfile} miners unplug."
                        </p>
                        <p className="text-xs text-slate-500 mt-2 italic">
                            "CapEx Payback: {diagnosticState.cpv} Months."
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
                            Uncoordinated growth dilutes rewards. 500 nodes in one city = broken math.
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
                            "{inputs.growthCoordination} growth leads to ROI dilution."
                        </p>
                        <p className="text-xs text-slate-500 mt-2 italic">
                            "Insider Overhang: {inputs.insiderOverhang} ({inputs.insiderOverhang === 'High' ? '>50% locked' : '<30% locked'})."
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
                            If Proof-of-Physical-Work is weak, Sybils extract value.
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
                                ? "Weak resistance allows Sybils to dilute rewards. Incentive Efficiency drops."
                                : "Strong resistance (PoPW) prevents value leakage."}
                        </p>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <Skull className={`mb-4 transition-all duration-500 ${inputs.sybilResistance === 'Weak' ? 'text-rose-500 scale-125' : 'text-slate-700'}`} size={48} />
                    <h4 className="text-lg font-bold text-white mb-2">Adversarial Simulator</h4>
                    <p className="text-sm text-slate-400 max-w-md">
                        {inputs.sybilResistance === 'Weak'
                            ? "Active Attack! Check 'Strategic Proof' chart above to see Mercenary/Sybil impact."
                            : "System Secure. No Sybil capacity detected."}
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
                    Engineering failures trigger human responses. This panel identifies the behavioral archetype most likely to emerge under the current stress conditions.
                </p>
                <HumanArchetypePanel inputs={inputs} state={diagnosticState} />
            </section>

            {/* Spacer */}
            <div className="h-px bg-slate-800 w-full" />

            {/* 6. Strategic Actions Panel */}
            <section>
                <StrategicRecommendationsPanel inputs={inputs} state={diagnosticState} />
            </section>

        </div>
    );
};
