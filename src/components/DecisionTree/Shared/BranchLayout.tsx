import React, { ReactNode } from 'react';
import { ChevronRight, Home, LayoutGrid } from 'lucide-react';

interface BranchLayoutProps {
    title: string;
    icon: ReactNode;
    activeProfileName: string;
    scenarioName: string;
    onBack: () => void;
    onOpenSandbox: () => void;
    children: ReactNode;
    breadcrumbs: string[];
}

export const BranchLayout: React.FC<BranchLayoutProps> = ({
    title, icon, activeProfileName, scenarioName, onBack, onOpenSandbox, children, breadcrumbs
}) => {
    return (
        <div className="h-full flex flex-col bg-slate-950">

            {/* HUD HEADER */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0 backdrop-blur-md z-10 sticky top-0">

                {/* Breadcrumbs & Navigation */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50"
                        title="Back to Wizard"
                    >
                        <Home size={16} />
                    </button>

                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <span className="hover:text-slate-300 cursor-pointer transition-colors" onClick={onBack}>Wizard</span>
                        <ChevronRight size={14} />
                        {breadcrumbs.map((crumb, i) => (
                            <React.Fragment key={i}>
                                <span className={i === breadcrumbs.length - 1 ? "text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded" : ""}>
                                    {crumb}
                                </span>
                                {i < breadcrumbs.length - 1 && <ChevronRight size={14} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center gap-6 text-xs font-mono">
                    <div className="flex flex-col items-end">
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider">Protocol</span>
                        <span className="text-white font-bold text-sm">{activeProfileName}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div className="flex flex-col items-end">
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider">Scenario</span>
                        <span className="text-amber-400 font-bold">{scenarioName}</span>
                    </div>

                    <button
                        onClick={onOpenSandbox}
                        className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-all"
                    >
                        <LayoutGrid size={14} />
                        <span>Open Sandbox</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {children}
            </div>
        </div>
    );
};
