import React, { useMemo } from 'react';
import { Globe, MapPin, AlertTriangle } from 'lucide-react';
import { initializeRegions, RegionBucket } from '../model/geoModels';

interface GeoCoverageViewProps {
    totalNodes: number;
    profileType: 'urban' | 'rural' | 'balanced'; // Derived from active profile manually for now
    isStress: boolean;
}

export const GeoCoverageView: React.FC<GeoCoverageViewProps> = ({ totalNodes, profileType, isStress }) => {

    // Recalculate regions every render based on props
    const regions = useMemo(() => {
        return initializeRegions(totalNodes, profileType);
    }, [totalNodes, profileType]);

    // Calculate Global Weighted Efficiency
    const weightedEfficiency = regions.reduce((acc, r) => acc + (r.efficiency * r.currentNodes), 0) / Math.max(1, totalNodes);

    const getEfficiencyColor = (eff: number) => {
        if (eff > 0.9) return 'bg-emerald-500';
        if (eff > 0.6) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Globe className="text-blue-400" size={20} />
                        Global Coverage Saturation
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Network efficiency based on physical node density.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Global Efficiency</div>
                    <div className={`text-2xl font-black ${weightedEfficiency < 0.7 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {(weightedEfficiency * 100).toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Region Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {regions.map((region) => (
                    <div key={region.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 relative overflow-hidden group">
                        {/* Saturation Bar Background */}
                        <div
                            className={`absolute bottom-0 left-0 w-full opacity-10 transition-all duration-500 ${getEfficiencyColor(region.efficiency)}`}
                            style={{ height: `${Math.min(100, region.density * 100)}%` }}
                        />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${region.tier === 'Urban Core' ? 'bg-purple-500/20 text-purple-300' :
                                        region.tier === 'Rural' ? 'bg-amber-500/20 text-amber-300' :
                                            'bg-blue-500/20 text-blue-300'
                                    }`}>
                                    {region.tier}
                                </span>
                                {region.efficiency < 0.6 && (
                                    <AlertTriangle size={12} className="text-rose-500 animate-pulse" />
                                )}
                            </div>

                            <h4 className="text-sm font-bold text-white mb-0.5 capitalize">{region.id.replace('_', ' ')}</h4>

                            <div className="flex justify-between items-end mt-4">
                                <div>
                                    <div className="text-[10px] text-slate-400">Nodes</div>
                                    <div className="text-base font-bold text-slate-200">{region.currentNodes.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-400">Reward Scale</div>
                                    <div className={`text-sm font-bold ${region.efficiency < 0.8 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {region.efficiency.toFixed(2)}x
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tooltip hint on hover (simulated by layout) */}
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-700/50">
                            <div
                                className={`h-full ${getEfficiencyColor(region.efficiency)}`}
                                style={{ width: `${Math.min(100, region.density * 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend / Analysis */}
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-400 bg-slate-800/30 p-2 rounded border border-slate-700/50">
                <MapPin size={14} />
                <p>
                    {weightedEfficiency < 0.5
                        ? "CRITICAL SATURATION: Urban centers are over-deployed. Rewards are diluted by >50%. Expect massive churn in NYC/London tiers."
                        : weightedEfficiency < 0.8
                            ? "Diminishing Returns: Key markets are saturating. Marginal utility of new nodes is dropping."
                            : "Healthy Expansion: Network has ample physical capacity for growth without cannibalization."
                    }
                </p>
            </div>
        </div>
    );
};
