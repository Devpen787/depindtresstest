import React from 'react';
import MetricEvidenceBadge from './MetricEvidenceBadge';

export const MetricEvidenceLegend: React.FC = () => {
    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[11px] text-slate-400">
                    Evidence tags show source grade and reproducibility for each KPI.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                    <MetricEvidenceBadge evidence={{
                        metricId: 'legend_primary',
                        definition: 'Primary-source metric example',
                        sourceUrlOrQueryId: 'https://docs.onocoy.com/documentation/tokenomics',
                        sourceGrade: 'primary',
                        timeWindow: 'N/A',
                        reproducibilityStatus: 'runnable'
                    }} compact />
                    <MetricEvidenceBadge evidence={{
                        metricId: 'legend_proxy',
                        definition: 'Model-derived metric example',
                        sourceUrlOrQueryId: 'model://src/model/simulation.ts',
                        sourceGrade: 'proxy',
                        timeWindow: 'simulation_horizon_weeks',
                        reproducibilityStatus: 'runnable'
                    }} compact />
                    <MetricEvidenceBadge evidence={{
                        metricId: 'legend_interpolated',
                        definition: 'Interpolated/synthetic metric example',
                        sourceUrlOrQueryId: 'synthetic://src/data/historical_events.ts',
                        sourceGrade: 'interpolated',
                        timeWindow: '52_weeks_standardized',
                        reproducibilityStatus: 'runnable'
                    }} compact />
                </div>
            </div>
        </div>
    );
};

export default MetricEvidenceLegend;
