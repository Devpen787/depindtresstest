import React, { useState, useMemo } from 'react';
import { useSimulationRunner } from '../../hooks/useSimulationRunner';
import { WizardView } from './Wizard/WizardView';
import { BranchLayout } from './Shared/BranchLayout';
import { FinancialStabilityView } from './Branches/Financial/FinancialStabilityView';
import { MinerProfitabilityView } from './Branches/Miner/MinerProfitabilityView';
import { RealUtilityView } from './Branches/Utility/RealUtilityView';
import { RiskStabilityView } from './Branches/Risk/RiskStabilityView';
import { Activity, Zap, TrendingUp, ShieldAlert } from 'lucide-react';
import { PROTOCOL_PROFILES } from '../../data/protocols';
import { calculateWizardMetrics, calculateWizardPercentiles } from '../../audit/decisionTreeViewMath';

interface DecisionTreeDashboardProps {
    sim: ReturnType<typeof useSimulationRunner>;
    onBackToLegacy: () => void;
}

type ViewState = 'wizard' | 'financial' | 'miner' | 'utility' | 'risk';

export const DecisionTreeDashboard: React.FC<DecisionTreeDashboardProps> = ({ sim, onBackToLegacy }) => {
    const [activeView, setActiveView] = useState<ViewState>('wizard');

    // SAFEGUARD: Ensure simulation data exists before rendering
    if (!sim || !sim.aggregated || sim.aggregated.length === 0 || !sim.activeProfile) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400 font-mono animate-pulse">
                Initializing Decision Engine...
            </div>
        );
    }

    // --- 1. CALCULATE HIGH-LEVEL METRICS FOR WIZARD ---
    const wizardMetrics = useMemo(() => {
        try {
            return calculateWizardMetrics(sim.aggregated, sim.params?.hardwareCost || 1000);
        } catch (e) {
            console.error("Error calculating V2 metrics:", e);
            return {
                solvencyScore: 0,
                solvencyFloor: 0,
                paybackMonths: 0,
                networkUtilization: 0,
                resilienceScore: 0,
                maxDrawdown: 0,
                avgChurnRate: 0,
                insolvencyWeeks: 0
            };
        }
    }, [sim.aggregated, sim.params]);

    const wizardPercentiles = useMemo(() => {
        try {
            const candidateAggregates = sim.peerWizardAggregated && Object.keys(sim.peerWizardAggregated).length > 1
                ? sim.peerWizardAggregated
                : sim.multiAggregated;

            if (!candidateAggregates || !sim.activeProfile?.metadata?.id) return null;

            const peerMetrics = Object.entries(candidateAggregates)
                .map(([profileId, series]) => {
                    if (!series || series.length === 0) return null;
                    const profile = PROTOCOL_PROFILES.find((p) => p.metadata.id === profileId);
                    const hardwareCost = profile?.parameters?.hardware_cost?.value ?? sim.params?.hardwareCost ?? 1000;
                    return {
                        profileId,
                        metrics: calculateWizardMetrics(series as any, hardwareCost)
                    };
                })
                .filter((entry): entry is { profileId: string; metrics: ReturnType<typeof calculateWizardMetrics> } => Boolean(entry));

            if (peerMetrics.length < 2) return null;

            const active = peerMetrics.find((entry) => entry.profileId === sim.activeProfile?.metadata?.id);
            if (!active) return null;

            return calculateWizardPercentiles(
                active.metrics,
                peerMetrics.map((entry) => entry.metrics)
            );
        } catch (error) {
            console.error('Failed to compute wizard percentiles', error);
            return null;
        }
    }, [sim.multiAggregated, sim.peerWizardAggregated, sim.activeProfile?.metadata?.id, sim.params?.hardwareCost]);

    // --- 2. BRANCH RENDERING ---
    const renderBranch = () => {
        switch (activeView) {
            case 'financial':
                return (
                    <BranchLayout
                        title="Financial Stability"
                        icon={<Activity />}
                        activeProfileName={sim.activeProfile?.metadata?.name ?? 'Unknown Profile'}
                        scenarioName={sim.params.scenario}
                        breadcrumbs={['Financial Stability']}
                        onBack={() => setActiveView('wizard')}
                        onOpenSandbox={() => onBackToLegacy()} // TODO: Add Deep Link context
                    >
                        <FinancialStabilityView
                            data={sim.aggregated}
                            onOpenSandbox={() => onBackToLegacy()}
                        />
                    </BranchLayout>
                );
            case 'miner':
                return (
                    <BranchLayout
                        title="Miner Profitability"
                        icon={<Zap />}
                        activeProfileName={sim.activeProfile?.metadata?.name ?? 'Unknown Profile'}
                        scenarioName={sim.params.scenario}
                        breadcrumbs={['Miner Profitability']}
                        onBack={() => setActiveView('wizard')}
                        onOpenSandbox={() => onBackToLegacy()}
                    >
                        <MinerProfitabilityView
                            data={sim.aggregated}
                            hardwareCost={sim.params.hardwareCost || 1000}
                            onOpenSandbox={onBackToLegacy}
                        />
                    </BranchLayout>
                );
            case 'utility':
                return (
                    <BranchLayout
                        title="Real Utility"
                        icon={<TrendingUp />}
                        activeProfileName={sim.activeProfile?.metadata?.name ?? 'Unknown Profile'}
                        scenarioName={sim.params.scenario}
                        breadcrumbs={['Real Utility']}
                        onBack={() => setActiveView('wizard')}
                        onOpenSandbox={() => onBackToLegacy()}
                    >
                        <RealUtilityView
                            data={sim.aggregated}
                            onOpenSandbox={() => onBackToLegacy()}
                        />
                    </BranchLayout>
                );
            case 'risk':
                return (
                    <BranchLayout
                        title="Risk & Stability"
                        icon={<ShieldAlert />}
                        activeProfileName={sim.activeProfile?.metadata?.name ?? 'Unknown Profile'}
                        scenarioName={sim.params.scenario}
                        breadcrumbs={['Risk & Stress']}
                        onBack={() => setActiveView('wizard')}
                        onOpenSandbox={() => onBackToLegacy()}
                    >
                        <RiskStabilityView
                            data={sim.aggregated}
                            onRunAnalysis={sim.runSensitivityAnalysis}
                            onOpenSandbox={onBackToLegacy}
                        />
                    </BranchLayout>
                );
            default:
                return (
                    <div className="flex flex-col h-screen bg-slate-950">
                        {/* Main Wizard Layer - Header with Profile Switcher */}
                        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:inline">Decision Tree v2.0</span>

                                {/* Profile Switcher */}
                                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                                    <select
                                        className="bg-transparent text-white text-sm font-bold py-1 px-2 outline-none cursor-pointer border-none focus:ring-0"
                                        value={sim.activeProfile?.metadata?.id}
                                        onChange={(e) => {
                                            const profile = PROTOCOL_PROFILES.find(p => p.metadata.id === e.target.value);
                                            if (profile) sim.loadProfile(profile);
                                        }}
                                    >
                                        {PROTOCOL_PROFILES.map(p => (
                                            <option key={p.metadata.id} value={p.metadata.id} className="bg-slate-900 text-white">
                                                {p.metadata.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button onClick={onBackToLegacy} className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                                Exit to Sandbox
                            </button>
                        </header>

                        <WizardView
                            onSelectBranch={(b) => setActiveView(b as ViewState)}
                            metrics={wizardMetrics}
                            percentiles={wizardPercentiles}
                        />
                    </div>
                );
        }
    };

    return renderBranch();
};
