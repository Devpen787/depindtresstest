import React from 'react';
import { DiagnosticInput } from './types';
import { Cpu, ShieldCheck, AlertTriangle, TrendingDown, ArrowUpRight, Anchor, Zap, CheckCircle, XCircle } from 'lucide-react';

interface Props {
    inputs: DiagnosticInput;
    selectedPeerName: string;
}

interface CellData {
    value: string;
    desc?: string;
    isGood?: boolean;
}

interface PeerData {
    name: string;
    hardware: CellData;
    validation: CellData;
    risk: CellData;
    resilience: CellData;
    failureMode: CellData;
    outcome: CellData;
}

export const PeerComparisonTable: React.FC<Props> = ({ inputs, selectedPeerName }) => {

    // Define Onocoy (Reference) Data - VERIFIED from gnss.store 2026-01-20
    const reference: PeerData = {
        name: "Onocoy (GNSS)",
        hardware: { value: "GNSS Receiver ($250-900)", desc: "Varies by tier (Budget to Premium)" },
        validation: { value: "Validator Network", desc: "Detects fake/low-quality signals" },
        risk: { value: "Low (Quality-Gated)", isGood: true },
        resilience: { value: "Streak Appreciation", desc: "Rewards long-term operators" },
        failureMode: { value: "Low Churn", desc: "Quality-first, not quantity-first", isGood: true },
        outcome: { value: "Sustainable Network", desc: "Dynamic emissions + managed growth" }
    };

    // Define all peer archetypes
    const peerMap: Record<string, PeerData> = {
        'render': {
            name: "Render",
            hardware: { value: "NVIDIA GPU (6GB+ VRAM)", desc: "$500-2000+ - Verified" },
            validation: { value: "Proof of Render (Octane)", desc: "Cryptographic Work Verification" },
            risk: { value: "Low (Enterprise SLAs)", isGood: true },
            resilience: { value: "GPU Investment Lock", desc: "High sunk cost = commitment" },
            failureMode: { value: "Low Churn", desc: "GPU operators stay for utilization", isGood: true },
            outcome: { value: "Enterprise-Grade Network", desc: "Reliable compute infrastructure" }
        },
        'ionet': {
            name: "io.net",
            hardware: { value: "RTX 3060 to H100/H200", desc: "$300-$30k+ range - Verified" },
            validation: { value: "Staking + Performance", desc: "200 $IO base × device multiplier" },
            risk: { value: "Moderate (Staking Required)", isGood: false },
            resilience: { value: "High Staking", desc: "320k GPUs, ~2,527 cluster-ready" },
            failureMode: { value: "Moderate Churn", desc: "Enterprise pool (95%) vs Community (5%)", isGood: false },
            outcome: { value: "Largest GPU Cloud", desc: "Disinflationary 20-year emissions" }
        },
        'nosana': {
            name: "Nosana",
            hardware: { value: "Linux + NVIDIA GPU ($300+)", desc: "RTX 3060-H100, 12GB RAM, 256GB NVMe" },
            validation: { value: "AI Inference Execution", desc: "Mainnet Jan 2025" },
            risk: { value: "Low (AI Pivot)", isGood: true },
            resilience: { value: "Enterprise Partners", desc: "Folding@Home, Exabits, Piknik" },
            failureMode: { value: "Low Churn", desc: "100M NOS, 24-month mining schedule", isGood: true },
            outcome: { value: "AI Inference Network", desc: "Pivoted from CI/CD to AI" }
        },
        'geodnet': {
            name: "Geodnet",
            hardware: { value: "MobileCM ($690-695)", desc: "Triple-Band GNSS Base Station - Verified" },
            validation: { value: "Correction Quality", desc: "RTK Accuracy Metrics" },
            risk: { value: "Low (Onocoy-like)", isGood: true },
            resilience: { value: "Coverage Incentives", desc: "Gap-filling rewards" },
            failureMode: { value: "Low Churn", desc: "Professional operators", isGood: true },
            outcome: { value: "Competitor to Onocoy", desc: "GNSS corrections under $1,000" }
        },
        'hivemapper': {
            name: "Hivemapper",
            hardware: { value: "Bee Dashcam ($489-589)", desc: "LTE+WiFi or WiFi-only - Verified" },
            validation: { value: "Map Coverage + AI", desc: "Freshness + Uniqueness" },
            risk: { value: "High (Density Traps)", isGood: false },
            resilience: { value: "Low", desc: "Moderate hardware cost, easy resale" },
            failureMode: { value: "High Churn", desc: "Mass exodus when rewards drop", isGood: false },
            outcome: { value: "Boom-Bust Cycles", desc: "Coverage spikes then collapses" }
        },
        'grass': {
            name: "Grass",
            hardware: { value: "Desktop/Mobile App ($0)", desc: "Zero CapEx - Verified" },
            validation: { value: "ZK Proofs + Reputation", desc: "Completeness, Consistency, Timeliness" },
            risk: { value: "Extreme (No Friction)", isGood: false },
            resilience: { value: "Reputation Scoring", desc: "But zero sunk cost = easy exit" },
            failureMode: { value: "Extreme Churn", desc: "Uninstall on any inconvenience", isGood: false },
            outcome: { value: "Viral but Volatile", desc: "User not invested at all" }
        },
        'dimo': {
            name: "DIMO",
            hardware: { value: "OBD-II Device ($99.99)", desc: "DIMO LTE R1 - Verified" },
            validation: { value: "Vehicle Telemetry", desc: "Fuel, location, distance, speed" },
            risk: { value: "Moderate (Partnership Risk)", isGood: false },
            resilience: { value: "Data History", desc: "Value grows with time connected" },
            failureMode: { value: "Moderate Churn", desc: "Easy to unplug, moderate investment", isGood: false },
            outcome: { value: "Niche Network", desc: "Depends on auto partnerships" }
        },
        'helium_mobile': {
            name: "Helium Mobile",
            hardware: { value: "Gateway + CBRS ($1,500-6,000)", desc: "FreedomFi + radio - Verified" },
            validation: { value: "Coverage + Data Offload", desc: "108,855 hotspots, 2M daily users" },
            risk: { value: "Moderate (No T-Mo Deal)", isGood: false },
            resilience: { value: "Growing Offload", desc: "5,451+ TB offloaded by Q3 2025" },
            failureMode: { value: "Moderate Churn", desc: "HNT-only emissions since Jan 2025", isGood: false },
            outcome: { value: "Active Network", desc: "NO formal T-Mobile deal - third-party only" }
        },
        'helium_legacy': {
            name: "Helium Legacy",
            hardware: { value: "LoRa Hotspot ($300-500)", desc: "Mixed Consumer/Pro - Verified" },
            validation: { value: "Proof of Coverage", desc: "Heartbeat-based verification" },
            risk: { value: "Moderate (Fixed Emissions)", isGood: false },
            resilience: { value: "Active Network", desc: "350-370k hotspots per Helium Foundation" },
            failureMode: { value: "Fixed Emission Risk", desc: "80% churn claim UNFOUNDED", isGood: false },
            outcome: { value: "Case Study", desc: "Emission model design lessons" }
        }
    };

    const archetype = inputs.selectedArchetype || 'helium_legacy';
    const peer = peerMap[archetype] || peerMap['helium_legacy'];

    // Don't show comparison if Onocoy is selected
    if (archetype === 'onocoy') return null;

    const rows = [
        {
            label: "Hardware",
            icon: <Cpu size={16} className="text-slate-400" />,
            peer: peer.hardware,
            ref: reference.hardware
        },
        {
            label: "Validation",
            icon: <ShieldCheck size={16} className="text-slate-400" />,
            peer: peer.validation,
            ref: reference.validation
        },
        {
            label: "Risk Profile",
            icon: <AlertTriangle size={16} className="text-slate-400" />,
            peer: peer.risk,
            ref: reference.risk,
            isRisk: true
        },
        {
            label: "Resilience Mechanism",
            icon: <Anchor size={16} className="text-slate-400" />,
            peer: peer.resilience,
            ref: reference.resilience
        },
        {
            label: "Failure Mode",
            icon: <TrendingDown size={16} className="text-slate-400" />,
            peer: peer.failureMode,
            ref: reference.failureMode,
            isFailure: true
        },
        {
            label: "Outcome",
            icon: <ArrowUpRight size={16} className="text-slate-400" />,
            peer: peer.outcome,
            ref: reference.outcome
        }
    ];

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
                <div className="grid grid-cols-3">
                    {/* Headers */}
                    <div className="p-4 bg-slate-800/70 border-b border-r border-slate-700">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Feature</span>
                    </div>
                    <div className="p-4 bg-slate-800/70 border-b border-r border-slate-700">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{peer.name}</span>
                    </div>
                    <div className="p-4 bg-indigo-950/30 border-b border-slate-700">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Onocoy (Reference)</span>
                    </div>

                    {rows.map((row, idx) => (
                        <React.Fragment key={row.label}>
                            {/* Feature Label */}
                            <div className={`p-4 border-r border-slate-800 flex items-center gap-2 ${idx < rows.length - 1 ? 'border-b border-slate-800' : ''}`}>
                                {row.icon}
                                <span className="text-sm font-bold text-slate-300">{row.label}</span>
                            </div>

                            {/* Peer Value */}
                            <div className={`p-4 border-r border-slate-800 ${idx < rows.length - 1 ? 'border-b border-slate-800' : ''}`}>
                                {row.isRisk || row.isFailure ? (
                                    <div className="flex items-start gap-2">
                                        {row.peer.isGood ? (
                                            <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <div className={`font-bold text-sm ${row.peer.isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {row.peer.value}
                                            </div>
                                            {row.peer.desc && (
                                                <div className="text-xs text-slate-500 mt-0.5">{row.peer.desc}</div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="font-bold text-white text-sm">{row.peer.value}</div>
                                        {row.peer.desc && (
                                            <div className="text-xs text-slate-500 mt-0.5">{row.peer.desc}</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Reference Value */}
                            <div className={`p-4 bg-indigo-950/10 ${idx < rows.length - 1 ? 'border-b border-slate-800' : ''}`}>
                                {row.isRisk || row.isFailure ? (
                                    <div className="flex items-start gap-2">
                                        <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-emerald-400 text-sm">{row.ref.value}</div>
                                            {row.ref.desc && (
                                                <div className="text-xs text-indigo-300/60 mt-0.5">{row.ref.desc}</div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="font-bold text-emerald-400 text-sm">{row.ref.value}</div>
                                        {row.ref.desc && (
                                            <div className="text-xs text-indigo-300/60 mt-0.5">{row.ref.desc}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Hypothesis Footer */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex items-start gap-3">
                <Zap size={20} className="text-yellow-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-yellow-400 mb-1">The Hypothesis</h4>
                    <p className="text-sm text-slate-300">
                        <strong className="text-white">High Friction + High Sunk Costs = Greater Resilience during a crash.</strong>{' '}
                        "Streak Appreciation" acts as a retention anchor, making operators psychologically invested in staying.
                    </p>
                </div>
            </div>
        </div>
    );
};
