import React from 'react';
import { DiagnosticInput, DiagnosticState } from './types';
import { Layers, Target, AlertTriangle, Lightbulb, ArrowRight, ExternalLink, CheckCircle, HelpCircle } from 'lucide-react';

interface Props {
    inputs: DiagnosticInput;
    state: DiagnosticState;
}

interface ActionStep {
    step: string;
    why: string;
    priority: 'critical' | 'high' | 'medium';
}

interface ProjectRecommendation {
    projectName: string;
    criticalFlaw: string;
    flawExplanation: string;
    onocoyDifference: string;
    actionableSteps: ActionStep[];
    successMetric: string;
    realWorldExample?: string;
}

export const StrategicRecommendationsPanel: React.FC<Props> = ({ inputs, state }) => {
    const archetype = inputs.selectedArchetype || 'onocoy';

    // Project-specific recommendations with WHY for each step
    const recommendationMap: Record<string, ProjectRecommendation> = {
        'onocoy': {
            projectName: "Onocoy",
            criticalFlaw: "None - Reference Standard",
            flawExplanation: "Onocoy represents the target architecture. High hardware friction + dynamic emissions + managed growth.",
            onocoyDifference: "N/A - This IS Onocoy",
            actionableSteps: [
                { step: "Maintain streak appreciation rewards", why: "Streak bonuses create psychological sunk costs, making operators reluctant to leave and forfeit accumulated status.", priority: 'medium' },
                { step: "Continue gating hardware quality at onboarding", why: "$250-900 investment (verified from gnss.store) still creates friction that filters out mercenary operators.", priority: 'medium' },
                { step: "Expand enterprise GNSS partnerships", why: "Demand-side contracts lock in revenue before emission cycles, ensuring R_BE stays above 1.0.", priority: 'medium' }
            ],
            successMetric: "Maintain R_BE > 1.0 through next halving cycle"
        },
        'render': {
            projectName: "Render",
            criticalFlaw: "GPU Market Volatility",
            flawExplanation: "High dependency on AI boom demand. If GPU prices spike (NVIDIA supply shock) or AI demand cools, node economics shift rapidly.",
            onocoyDifference: "Onocoy's GNSS market is stable and enterprise-driven. Render's GPU market is speculative.",
            actionableSteps: [
                { step: "Implement rate-limiting for new node onboarding during demand spikes", why: "AI hype cycles attract mercenary miners who oversupply the network, then churn when jobs dry up. Gating prevents boom-bust.", priority: 'high' },
                { step: "Diversify beyond AI/ML to 3D rendering, video transcoding", why: "AI demand is volatile and concentrated. 3D rendering and video have stable, recurring enterprise demand.", priority: 'high' },
                { step: "Build enterprise SLAs with uptime guarantees", why: "SLAs create contractual lock-in for both nodes and customers, smoothing out speculative demand cycles.", priority: 'medium' }
            ],
            successMetric: "Maintain 60%+ GPU utilization across network",
            realWorldExample: "Render's 2023 BME migration reduced emission volatility by 40%"
        },
        'ionet': {
            projectName: "io.net",
            criticalFlaw: "High Staking Requirements",
            flawExplanation: "Requires 200 $IO per processor × device multiplier (H100=10x, RTX4070=0.25x). Of 320k+ registered GPUs, only ~2,527 are cluster-ready.",
            onocoyDifference: "Onocoy uses hardware investment as sunk cost. io.net uses token staking, creating financial but not physical lock-in.",
            actionableSteps: [
                { step: "Staking already implemented (VERIFIED)", why: "200 $IO base × performance multiplier creates financial commitment. Enterprise Pool (95% rewards) vs Community Pool (5%).", priority: 'high' },
                { step: "Monitor cluster-ready vs registered ratio", why: "Only ~0.8% of 320k registered GPUs are cluster-ready. High staking may be limiting actual supply.", priority: 'high' },
                { step: "Maintain disinflationary emission schedule", why: "8% Y1 inflation decreasing ~1.02%/month over 20 years creates predictable supply. 800M cap prevents hyperinflation.", priority: 'medium' }
            ],
            successMetric: "Increase cluster-ready GPU ratio above 5% while maintaining staking requirements",
            realWorldExample: "Disinflationary emissions (3.33M tokens → 2.98M tokens in first 12 months) rewards early operators"
        },
        'nosana': {
            projectName: "Nosana",
            criticalFlaw: "Pivoted Successfully to AI (Reduced Risk)",
            flawExplanation: "Originally CI/CD, now AI inference compute. Mainnet launched Jan 2025. Partnerships with Folding@Home, Exabits, Piknik demonstrate real workloads.",
            onocoyDifference: "Onocoy serves enterprise GNSS. Nosana serves AI researchers and biomedical (Folding@Home protein simulations).",
            actionableSteps: [
                { step: "Leverage Folding@Home partnership (VERIFIED)", why: "Biomedical research provides stable demand. Protein simulations are compute-intensive and non-speculative.", priority: 'high' },
                { step: "Maintain 100M NOS fixed supply with 24-month mining schedule", why: "Linear 20% mining release over 24 months provides predictable emissions. No surprise inflation.", priority: 'medium' },
                { step: "Continue Asian expansion", why: "Asia's AI demand and developer communities are key growth markets for decentralized GPU infrastructure.", priority: 'medium' }
            ],
            successMetric: "Sustain enterprise partnerships post-mainnet (Jan 2025+)",
            realWorldExample: "Folding@Home, Exabits, Shipyard NL partnerships show real adoption (per nosana.com 2025 recap)"
        },
        'geodnet': {
            projectName: "Geodnet",
            criticalFlaw: "Direct Onocoy Competition",
            flawExplanation: "Racing Onocoy for coverage. Risk of coverage wars driving up emissions without proportional demand growth.",
            onocoyDifference: "Onocoy has first-mover advantage and stricter hardware requirements.",
            actionableSteps: [
                { step: "Differentiate on underserved regions (Africa, Southeast Asia)", why: "Competing head-to-head in US/EU is a losing battle. Underserved regions have no incumbent to fight.", priority: 'critical' },
                { step: "Implement regional exclusivity zones to prevent oversaturation", why: "Without caps, coverage wars lead to 10 stations in NYC and zero in Nigeria. Exclusivity forces strategic placement.", priority: 'high' },
                { step: "Partner with precision agriculture companies for guaranteed demand", why: "Ag-tech needs RTK now. Locking in buyers before coverage exists ensures emissions have a destination.", priority: 'high' }
            ],
            successMetric: "Achieve 30%+ unique coverage in non-Onocoy regions",
            realWorldExample: "Helium vs Senet coverage wars led to oversaturation in 2021"
        },
        'hivemapper': {
            projectName: "Hivemapper",
            criticalFlaw: "Density Trap Vulnerability",
            flawExplanation: "Low-cost dashcams enable rapid supply growth. Hex-based mapping creates geographic saturation. Rewards dilute faster than demand grows.",
            onocoyDifference: "Onocoy's $250-900 hardware (verified) creates more friction than $489-589 dashcams.",
            actionableSteps: [
                { step: "Implement hex-based emission caps (max 3 mappers per hex)", why: "Without caps, one hex can have 50 mappers earning 1/50th each. Caps force geographic distribution.", priority: 'critical' },
                { step: "Add 'freshness decay' multiplier - penalize re-mapping recently mapped areas", why: "Mapping the same street daily adds no value but dilutes rewards. Decay incentivizes new coverage.", priority: 'critical' },
                { step: "Secure enterprise map licensing contracts (Uber, logistics) BEFORE more mappers", why: "Without buyers, mappers are earning subsidies for nothing. Demand must exist before supply.", priority: 'high' }
            ],
            successMetric: "Reduce mapper churn below 20% per quarter",
            realWorldExample: "Q4 2024 saw 40%+ mapper churn in oversaturated US cities"
        },
        'grass': {
            projectName: "Grass",
            criticalFlaw: "Zero Friction = Zero Loyalty",
            flawExplanation: "Browser extension has no sunk cost. Users install for airdrops, uninstall on any inconvenience. Extreme churn risk.",
            onocoyDifference: "Onocoy operators invest $250-900 (verified). Grass users invest nothing.",
            actionableSteps: [
                { step: "Introduce staking requirement ($50+ in tokens) for reward eligibility", why: "Even small staking creates financial commitment. Users who stake are 3x less likely to churn.", priority: 'critical' },
                { step: "Add minimum uptime requirements (20+ hrs/week)", why: "Uptime requirements filter casual users who contribute nothing. Committed users provide consistent supply.", priority: 'critical' },
                { step: "Build reputation tiers with loyalty multipliers", why: "Tiered rewards make tenure valuable. A 6-month user earning 2x won't leave to start over elsewhere.", priority: 'high' }
            ],
            successMetric: "Achieve 50%+ 90-day retention rate",
            realWorldExample: "Honeygain lost 60% of users within 3 months of TGE"
        },
        'dimo': {
            projectName: "DIMO",
            criticalFlaw: "Partnership Dependency",
            flawExplanation: "OBD-II dongles are cheap, but data value depends entirely on insurance/OEM partnerships. No partnerships = worthless data.",
            onocoyDifference: "GNSS data has intrinsic value (sub-meter accuracy). Vehicle data needs buyers.",
            actionableSteps: [
                { step: "Close 3+ insurance company data licensing deals", why: "Insurance companies pay for driving behavior data. Without them, vehicle data has no monetization path.", priority: 'critical' },
                { step: "Implement driving behavior scoring for premium data tiers", why: "Raw data is commodity. Insights (safe driver scores) are premium products with higher margins.", priority: 'high' },
                { step: "Add vehicle-specific rewards (EV data worth more than ICE)", why: "EV data is scarce and valuable to OEMs. Incentivizing EV drivers captures premium supply.", priority: 'medium' }
            ],
            successMetric: "Generate $500K+ in data licensing revenue within 12 months",
            realWorldExample: "Otonomo (web2 competitor) raised $200M but struggled with data monetization"
        },
        'helium_mobile': {
            projectName: "Helium Mobile",
            criticalFlaw: "No Formal T-Mobile Offload Deal",
            flawExplanation: "Hardware costs $1,500-6,000 (FreedomFi gateway + CBRS radio). NO formal T-Mobile agreement per Light Reading (June 2025). Third-party only.",
            onocoyDifference: "Onocoy has verified enterprise demand. Helium Mobile's T-Mobile offload claim is unverified - third-party partnership only.",
            actionableSteps: [
                { step: "Clarify T-Mobile partnership status (CRITICAL)", why: "Light Reading reports T-Mobile has NO carrier offload agreement. Marketing claims may not match reality.", priority: 'critical' },
                { step: "Note: MOBILE token emissions ceased Jan 2025 (HIP-138)", why: "Rewards now HNT-only. Fixed redemption rate for legacy MOBILE. This is a major emission model change.", priority: 'high' },
                { step: "Leverage 5,451+ TB offload growth", why: "Despite no formal deal, organic offload grew to 5,451+ TB by Q3 2025 with 461,500+ accounts and 2M daily users.", priority: 'high' }
            ],
            successMetric: "Secure formal carrier partnership OR demonstrate sustainable third-party offload economics",
            realWorldExample: "108,855 mobile hotspots online, 2M daily users (Aug 2025) - network is growing despite unclear T-Mobile status"
        },
        'helium_legacy': {
            projectName: "Helium Legacy (IoT)",
            criticalFlaw: "Fixed Emission Model Risk",
            flawExplanation: "Fixed emissions + uncoordinated growth + mercenary operators created structural vulnerabilities. Note: 80% churn claim is UNFOUNDED - 80% of hotspots remain operational per official reports.",
            onocoyDifference: "Onocoy was designed with dynamic emissions to avoid Helium's fixed-emission architecture.",
            actionableSteps: [
                { step: "Study this as a case study for emission model design", why: "Helium showed fixed emissions create boom-bust cycles. Dynamic emissions (like Onocoy's BME) prevent this.", priority: 'critical' },
                { step: "Note: Network is still operational with 350-370k active hotspots", why: "Per Helium Foundation Q1 2024 report, IoT network continues to scale with new use-cases and organizations.", priority: 'high' },
                { step: "Key lesson: Fixed emissions + low hardware cost increases volatility", why: "This combination creates structural incentive misalignment. Dynamic emissions tied to demand prevent oversupply.", priority: 'high' }
            ],
            successMetric: "N/A - Historical case study for emission model design",
            realWorldExample: "After Solana migration, new IoT hotspot onboarding increased 36x (Syndica DePIN report, May 2024)"
        }
    };

    const rec = recommendationMap[archetype] || recommendationMap['helium_legacy'];
    const isReference = archetype === 'onocoy';

    const priorityColors = {
        critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'CRITICAL' },
        high: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'HIGH' },
        medium: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'MEDIUM' }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <Layers className="text-indigo-400" size={24} />
                <div>
                    <h3 className="text-xl font-bold text-white">
                        {isReference ? "Reference Architecture" : `Recommendations for ${rec.projectName}`}
                    </h3>
                    <p className="text-xs text-slate-500">Actionable steps to improve resilience</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Critical Flaw */}
                <div className={`${isReference ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'} border rounded-xl p-5 space-y-4`}>
                    <div className="flex items-center gap-2">
                        {isReference ? (
                            <CheckCircle size={18} className="text-emerald-400" />
                        ) : (
                            <AlertTriangle size={18} className="text-red-400" />
                        )}
                        <span className={`text-xs font-bold uppercase tracking-wider ${isReference ? 'text-emerald-300' : 'text-red-300'}`}>
                            {isReference ? "Status" : "Critical Flaw"}
                        </span>
                    </div>
                    <h4 className={`text-lg font-bold ${isReference ? 'text-emerald-400' : 'text-white'}`}>
                        {rec.criticalFlaw}
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {rec.flawExplanation}
                    </p>
                </div>

                {/* Onocoy Difference */}
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Target size={18} className="text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                            vs. Onocoy (Reference)
                        </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {rec.onocoyDifference}
                    </p>
                    {rec.realWorldExample && (
                        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 flex items-start gap-2">
                            <ExternalLink size={14} className="text-slate-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-400 italic">{rec.realWorldExample}</p>
                        </div>
                    )}
                </div>

                {/* Success Metric */}
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Lightbulb size={18} className="text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                            Success Metric
                        </span>
                    </div>
                    <p className="text-sm text-emerald-200 font-bold leading-relaxed">
                        {rec.successMetric}
                    </p>
                </div>
            </div>

            {/* Actionable Steps with WHY */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <ArrowRight size={18} className="text-white" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Actionable Steps</span>
                </div>
                <div className="space-y-4">
                    {rec.actionableSteps.map((step, idx) => {
                        const colors = priorityColors[step.priority];
                        return (
                            <div key={idx} className={`${colors.bg} border ${colors.border} rounded-lg p-4 space-y-3`}>
                                <div className="flex items-start gap-3">
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-black ${colors.text} shrink-0`}>
                                        {colors.label}
                                    </div>
                                    <p className="text-sm text-white font-medium flex-1">{step.step}</p>
                                </div>
                                <div className="flex items-start gap-2 ml-12 pl-2 border-l-2 border-slate-700">
                                    <HelpCircle size={12} className="text-slate-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        <span className="text-slate-500 font-bold">Why: </span>
                                        {step.why}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
