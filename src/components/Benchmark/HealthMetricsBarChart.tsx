import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { PeerId } from './PeerToggle';
import { ChartContextHeader } from '../ui/ChartContextHeader';
import { GUARDRAIL_COPY, PAYBACK_GUARDRAILS } from '../../constants/guardrails';

// Peer colors matching PeerToggle
const COLORS: Record<string, string> = {
    onocoy: '#6366f1', // Indigo
    // Wireless
    geodnet_v1: '#f97316', // Orange
    hivemapper_v1: '#facc15', // Yellow
    helium_bme_v1: '#22c55e', // Green
    dimo_v1: '#3b82f6', // Blue
    xnet_v1: '#ef4444', // Red
    // Compute
    adaptive_elastic_v1: '#a855f7', // Purple (Render)
    akash_v1: '#f43f5e', // Rose
    aleph_v1: '#06b6d4', // Cyan
    grass_v1: '#10b981', // Emerald
    ionet_v1: '#8b5cf6', // Violet
    nosana_v1: '#ec4899' // Pink
};

const PEER_LABELS: Record<string, string> = {
    onocoy: 'Onocoy',
    geodnet_v1: 'Geodnet',
    hivemapper_v1: 'Hivemapper',
    helium_bme_v1: 'Helium',
    dimo_v1: 'DIMO',
    xnet_v1: 'XNET',
    adaptive_elastic_v1: 'Render',
    akash_v1: 'Akash',
    aleph_v1: 'Aleph.im',
    grass_v1: 'Grass',
    ionet_v1: 'io.net',
    nosana_v1: 'Nosana'
};

const getPeerLabel = (peerId: string) => PEER_LABELS[peerId] || peerId;

interface HealthMetricsBarChartProps {
    selectedPeers: PeerId[];
    onocoyData: Record<string, number>;
    peerData: Record<PeerId, Record<string, number>>;
}

// Normalize metrics to 0-100 scale
const normalizeMetric = (value: number, metric: string): number => {
    switch (metric) {
        case 'payback':
            // Lower is better: healthy threshold maps to 0, 0 months maps to 100.
            return Math.max(0, Math.min(100, (PAYBACK_GUARDRAILS.healthyMaxMonths - value) / PAYBACK_GUARDRAILS.healthyMaxMonths * 100));
        case 'efficiency':
            // Already 0-100
            return value;
        case 'sustain':
            // 0x = 0, 2x = 100
            return Math.max(0, Math.min(100, value * 50));
        case 'retention':
            // Retention tends to cluster high; spread 50-100 into full scale.
            return Math.max(0, Math.min(100, (value - 50) * 2));
        default:
            return value;
    }
};

export const HealthMetricsBarChart: React.FC<HealthMetricsBarChartProps> = ({
    selectedPeers,
    onocoyData,
    peerData
}) => {
    const chartData = useMemo(() => {
        const metrics = ['payback', 'efficiency', 'sustain', 'retention'];
        const labels: Record<string, string> = {
            payback: 'Payback Score',
            efficiency: 'Efficiency',
            sustain: 'Sustainability',
            retention: 'Retention'
        };

        return metrics.map(metric => {
            const dataPoint: Record<string, string | number> = {
                metric: labels[metric],
                onocoy: normalizeMetric(onocoyData[metric] ?? 0, metric)
            };

            selectedPeers.forEach(peer => {
                dataPoint[peer] = normalizeMetric(peerData[peer]?.[metric] ?? 0, metric);
            });

            return dataPoint;
        });
    }, [onocoyData, peerData, selectedPeers]);

    const allBars = ['onocoy', ...selectedPeers];

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <div className="mb-4">
                <h3 className="text-sm font-bold text-white">Key Health Metrics Comparison</h3>
                <p className="text-xs text-slate-400 mt-1">
                    Normalized scores (0-100 scale) for direct comparison.
                </p>
            </div>

            <ChartContextHeader
                title="How To Read This"
                what="Each bar is a 0-100 score. Higher is better on every metric."
                why="We convert different units into one score so comparison is quick: faster payback = higher score, stronger retention/efficiency/solvency = higher score."
                reference={GUARDRAIL_COPY.benchmarkRelativeScoreReference}
                nextQuestion="Which single metric is pulling the total result down the most?"
                actionTrigger="If Onocoy is 10+ points behind peers on two or more metrics, stop the recommendation and move to Root Causes."
                className="mb-4"
            />

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="metric"
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                fontSize: 12
                            }}
                            labelStyle={{ color: '#f1f5f9' }}
                            formatter={(value: number) => [value.toFixed(0), 'Score']}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: 10 }}
                            iconType="square"
                        />

                        {allBars.map(key => (
                            <Bar
                                key={key}
                                dataKey={key}
                                name={getPeerLabel(key)}
                                fill={COLORS[key]}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
