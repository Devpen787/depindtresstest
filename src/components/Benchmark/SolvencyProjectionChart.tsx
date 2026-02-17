import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { PeerId } from './PeerToggle';
import { ChartContextHeader } from '../ui/ChartContextHeader';
import {
    GUARDRAIL_BAND_LABELS,
    GUARDRAIL_COPY,
    SOLVENCY_GUARDRAILS
} from '../../constants/guardrails';

interface SolvencyDataPoint {
    week: number;
    label: string;
    onocoy: number;
    [key: string]: number | string;
}

// Peer colors matching PeerToggle & HealthMetricsBarChart
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

interface SolvencyProjectionChartProps {
    selectedPeers: PeerId[];
    data: SolvencyDataPoint[];
}

const CRITICAL_THRESHOLD = SOLVENCY_GUARDRAILS.criticalIndex;
const HEALTHY_THRESHOLD = SOLVENCY_GUARDRAILS.healthyIndex;

const formatPeerName = (peerId: string) => {
    return PEER_LABELS[peerId] || peerId;
};

export const SolvencyProjectionChart: React.FC<SolvencyProjectionChartProps> = ({
    selectedPeers,
    data
}) => {
    const horizonWeek = data.length > 0 ? (data[data.length - 1].week as number) : 0;

    const onocoySeries = useMemo(() => {
        return data
            .map(point => ({ week: Number(point.week), value: Number(point.onocoy) || 0 }))
            .filter(point => Number.isFinite(point.week) && Number.isFinite(point.value));
    }, [data]);

    const slopePerWeek = useMemo(() => {
        if (onocoySeries.length < 2) return 0;
        const trailing = onocoySeries.slice(-6);
        const first = trailing[0];
        const last = trailing[trailing.length - 1];
        const span = Math.max(1, last.week - first.week);
        return (last.value - first.value) / span;
    }, [onocoySeries]);

    const breachWeek = useMemo(() => {
        const actualBreach = onocoySeries.find(point => point.value <= CRITICAL_THRESHOLD)?.week;
        if (actualBreach) return actualBreach;

        if (onocoySeries.length < 2 || slopePerWeek >= -0.01) return null;
        const last = onocoySeries[onocoySeries.length - 1];
        if (last.value <= CRITICAL_THRESHOLD) return Math.round(last.week);

        const weeksToBreach = (last.value - CRITICAL_THRESHOLD) / Math.abs(slopePerWeek);
        if (!Number.isFinite(weeksToBreach) || weeksToBreach <= 0) return null;
        return Math.ceil(last.week + weeksToBreach);
    }, [onocoySeries, slopePerWeek]);

    const healthStatus = useMemo(() => {
        if (data.length === 0) {
            return {
                label: 'No Data',
                color: 'text-slate-400',
                bg: 'bg-slate-500/10',
                border: 'border-slate-500/30'
            };
        }

        const lastOnocoy = onocoySeries.length > 0 ? onocoySeries[onocoySeries.length - 1].value : 0;
        const projectedBreachSoon = breachWeek !== null && breachWeek <= horizonWeek + 12;
        if (lastOnocoy < CRITICAL_THRESHOLD) {
            return {
                label: GUARDRAIL_BAND_LABELS.intervention,
                color: 'text-rose-400',
                bg: 'bg-rose-500/10',
                border: 'border-rose-500/30'
            };
        }

        if (lastOnocoy < HEALTHY_THRESHOLD || slopePerWeek < -1 || projectedBreachSoon) {
            return {
                label: GUARDRAIL_BAND_LABELS.watchlist,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/30'
            };
        }

        return {
            label: GUARDRAIL_BAND_LABELS.healthy,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30'
        };
    }, [data.length, breachWeek, horizonWeek, onocoySeries, slopePerWeek]);

    if (data.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                <h3 className="text-sm font-bold text-white">Solvency Projection</h3>
                <p className="text-xs text-slate-400 mt-2">No simulation data available for this view yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            {/* Header with Breach Horizon Badge */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-sm font-bold text-white">Solvency Projection</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Smoothed solvency index from simulation output (index = solvency ratio x 100).
                    </p>
                </div>

                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${healthStatus.bg} ${healthStatus.border}`}>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide">Critical Breach</div>
                        <div className="text-sm font-bold text-white">
                            {breachWeek === null ? `W>${horizonWeek}` : `W${Math.round(breachWeek)}`}
                        </div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded ${healthStatus.bg} ${healthStatus.color}`}>
                        {healthStatus.label}
                    </div>
                </div>
            </div>

            <ChartContextHeader
                title="How To Read This"
                what="This line chart shows whether Onocoy and peers are getting more stable or less stable over time."
                why="The line goes down when incentives become harder to sustain. It goes up when burn/revenue support the incentive load."
                reference={GUARDRAIL_COPY.benchmarkSolvencyReference}
                nextQuestion="If Onocoy is trending down, what should move first: emissions, demand growth, or retention?"
                actionTrigger="If Onocoy sits below the healthy line for multiple periods, treat the recommendation as hold until Root Causes confirms a fix."
                className="mb-4"
            />

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="label"
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            domain={[0, 'dataMax + 20']}
                            label={{
                                value: 'Solvency Index',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#64748b',
                                fontSize: 10
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                fontSize: 12
                            }}
                            labelStyle={{ color: '#f1f5f9' }}
                            formatter={(value: number) => [value.toFixed(1), 'Index']}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: 10 }}
                            iconType="circle"
                        />
                        <ReferenceLine
                            y={CRITICAL_THRESHOLD}
                            stroke="#ef4444"
                            strokeDasharray="4 4"
                            label={{ value: `Critical floor (~${SOLVENCY_GUARDRAILS.criticalRatio.toFixed(1)}x)`, position: 'right', fill: '#ef4444', fontSize: 9 }}
                        />
                        <ReferenceLine
                            y={HEALTHY_THRESHOLD}
                            stroke="#10b981"
                            strokeDasharray="4 4"
                            label={{ value: `Healthy buffer (~${SOLVENCY_GUARDRAILS.healthyRatio.toFixed(1)}x)`, position: 'right', fill: '#10b981', fontSize: 9 }}
                        />

                        {/* Onocoy (Always shown) */}
                        <Line
                            type="monotone"
                            dataKey="onocoy"
                            name={formatPeerName('onocoy')}
                            stroke={COLORS.onocoy}
                            strokeWidth={3}
                            dot={{ fill: COLORS.onocoy, r: 3 }}
                            activeDot={{ r: 5 }}
                        />

                        {/* Dynamic peer lines */}
                        {selectedPeers.map(peerId => (
                            <Line
                                key={peerId}
                                type="monotone"
                                dataKey={peerId}
                                name={formatPeerName(peerId)}
                                stroke={COLORS[peerId] || '#94a3b8'}
                                strokeWidth={2}
                                dot={{ fill: COLORS[peerId] || '#94a3b8', r: 2 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
