import React from 'react';
import { RefreshCw, Database, Users, Banknote, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCompact } from '../utils/format';

interface FlywheelWidgetProps {
    metrics: {
        nodes: number;
        utilization: number;
        revenue: number;
        incentive: number; // ROI or attractiveness
    };
    stress: boolean; // Is the network currently under stress?
}

export const FlywheelWidget: React.FC<FlywheelWidgetProps> = ({ metrics, stress }) => {
    // 1. Supply Health
    const supplyStatus = metrics.nodes > 20000 ? 'saturated' : 'growing';

    // 2. Usage Health (The Critical Link)
    const utilizationStatus = metrics.utilization > 30 ? 'healthy' : metrics.utilization > 10 ? 'warning' : 'critical';

    // 3. Revenue Health
    const revenueStatus = metrics.revenue > 100000 ? 'healthy' : 'low';

    // 4. Incentive (The Feedback Loop)
    const incentiveStatus = metrics.incentive > 0 ? 'positive' : 'negative';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'positive': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'saturated': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'negative': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'low': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <RefreshCw size={16} className={metrics.incentive > 0 ? "text-emerald-400" : "text-rose-400"} />
                        Verified Flywheel
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Real-time health of the DePIN value loop.</p>
                </div>
                {stress && (
                    <div className="px-2 py-1 bg-rose-500/20 border border-rose-500/30 rounded text-xs text-rose-300 flex items-center gap-1 font-bold animate-pulse">
                        <AlertTriangle size={12} />
                        STRESS
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">

                {/* 1. Supply */}
                <div className={`relative z-10 p-4 rounded-lg border flex flex-col items-center text-center transition-all ${getStatusColor(supplyStatus)}`}>
                    <Database size={20} className="mb-2 opacity-70" />
                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">Supply</span>
                    <span className="text-xl font-black tracking-tight">{metrics.nodes.toLocaleString()}</span>
                    <span className="text-[9px] opacity-50 font-medium">Active Nodes</span>
                </div>

                {/* 2. Usage (Utilization) */}
                <div className={`relative z-10 p-4 rounded-lg border flex flex-col items-center text-center transition-all ${getStatusColor(utilizationStatus)}`}>
                    <Users size={20} className="mb-2 opacity-70" />
                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">Usage</span>
                    <span className="text-xl font-black tracking-tight">{metrics.utilization.toFixed(1)}%</span>
                    <span className="text-[9px] opacity-50 font-medium">Net Utilization</span>
                    {utilizationStatus === 'critical' && (
                        <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-bounce">
                            BROKEN
                        </div>
                    )}
                </div>

                {/* 3. Revenue */}
                <div className={`relative z-10 p-4 rounded-lg border flex flex-col items-center text-center transition-all ${getStatusColor(revenueStatus)}`}>
                    <Banknote size={20} className="mb-2 opacity-70" />
                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">Value Capture</span>
                    <span className="text-xl font-black tracking-tight">${formatCompact(metrics.revenue)}</span>
                    <span className="text-[9px] opacity-50 font-medium">Monthly Burn</span>
                </div>

                {/* 4. Incentive (ROI) */}
                <div className={`relative z-10 p-4 rounded-lg border flex flex-col items-center text-center transition-all ${getStatusColor(incentiveStatus)}`}>
                    <RefreshCw size={20} className="mb-2 opacity-70" />
                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">Incentive</span>
                    <span className="text-xl font-black tracking-tight flex items-center gap-1">
                        {metrics.incentive > 0 ? '+' : ''}{metrics.incentive.toFixed(1)}%
                    </span>
                    <span className="text-[9px] opacity-50 font-medium">Miner ROI</span>
                </div>
            </div>

            {/* Diagnosis Message */}
            <div className="mt-6 pt-4 border-t border-slate-700/50">
                <div className="flex items-start gap-3">
                    <div className={`mt-0.5 min-w-[4px] h-4 rounded-full ${utilizationStatus === 'critical' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <p className="text-xs text-slate-300 leading-relaxed">
                        {utilizationStatus === 'critical'
                            ? "CRITICAL FAILURE: Network oversupply has decoupled supply from demand. Incentives are attracting hardware that isn't generating revenue, leading to a 'Zombie Network' scenario."
                            : utilizationStatus === 'warning'
                                ? "WARNING: Utilization is lagging. Supply growth is outpacing organic demand. Consider pausing incentives to allow demand to catch up."
                                : "HEALTHY: Strong demand capture. The flywheel is spinning efficiently, with revenue effectively altering supply behavior."
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};
