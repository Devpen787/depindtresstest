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

// Generic data point for dynamic keys
interface SolvencyDataPoint {
    month: string;
    onocoy: number;
    [key: string]: number | string | undefined;
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

interface SolvencyProjectionChartProps {
    selectedPeers: PeerId[];
    scenarioId: string;
}

// Helper to generate consistent mock data for all peers
const getMockData = (base: number, volatility: number) => {
    return {
        geodnet_v1: base,
        hivemapper_v1: base * 0.95,
        helium_bme_v1: base * 0.9,
        dimo_v1: base * 0.98,
        xnet_v1: base * 0.88,
        adaptive_elastic_v1: base * 1.05,
        akash_v1: base * 0.92,
        aleph_v1: base * 0.96,
        grass_v1: base * 1.1,
        ionet_v1: base * 1.02,
        nosana_v1: base * 0.94
    };
};

// Mock solvency projection data by scenario (keyed by scenario.id)
const SCENARIO_DATA: Record<string, SolvencyDataPoint[]> = {
    baseline: [
        { month: 'Now', onocoy: 100, ...getMockData(100, 0) },
        { month: 'M3', onocoy: 102, ...getMockData(100, 0.05) },
        { month: 'M6', onocoy: 105, ...getMockData(98, 0.05) },
        { month: 'M9', onocoy: 108, ...getMockData(97, 0.05) },
        { month: 'M12', onocoy: 112, ...getMockData(96, 0.05) },
        { month: 'M18', onocoy: 118, ...getMockData(94, 0.05) },
        { month: 'M24', onocoy: 125, ...getMockData(92, 0.05) }
    ],
    death_spiral: [
        { month: 'Now', onocoy: 100, ...getMockData(100, 0) },
        { month: 'M3', onocoy: 85, ...getMockData(70, 0.1) },
        { month: 'M6', onocoy: 80, ...getMockData(60, 0.1) },
        { month: 'M9', onocoy: 85, ...getMockData(50, 0.1) },
        { month: 'M12', onocoy: 92, ...getMockData(45, 0.1) },
        { month: 'M18', onocoy: 100, ...getMockData(40, 0.1) },
        { month: 'M24', onocoy: 108, ...getMockData(35, 0.1) }
    ],
    infinite_subsidy: [
        { month: 'Now', onocoy: 100, ...getMockData(100, 0) },
        { month: 'M3', onocoy: 95, ...getMockData(90, 0.05) },
        { month: 'M6', onocoy: 88, ...getMockData(80, 0.05) },
        { month: 'M9', onocoy: 82, ...getMockData(70, 0.05) },
        { month: 'M12', onocoy: 78, ...getMockData(65, 0.05) },
        { month: 'M18', onocoy: 70, ...getMockData(55, 0.05) },
        { month: 'M24', onocoy: 65, ...getMockData(45, 0.05) }
    ],
    vampire_attack: [
        { month: 'Now', onocoy: 100, ...getMockData(100, 0) },
        { month: 'M3', onocoy: 98, ...getMockData(92, 0.05) },
        { month: 'M6', onocoy: 97, ...getMockData(88, 0.05) },
        { month: 'M9', onocoy: 98, ...getMockData(85, 0.05) },
        { month: 'M12', onocoy: 100, ...getMockData(82, 0.05) },
        { month: 'M18', onocoy: 104, ...getMockData(80, 0.05) },
        { month: 'M24', onocoy: 108, ...getMockData(78, 0.05) }
    ],
    growth_shock: [
        { month: 'Now', onocoy: 100, ...getMockData(100, 0) },
        { month: 'M3', onocoy: 120, ...getMockData(110, 0.1) },
        { month: 'M6', onocoy: 140, ...getMockData(120, 0.1) },
        { month: 'M9', onocoy: 160, ...getMockData(135, 0.1) },
        { month: 'M12', onocoy: 180, ...getMockData(150, 0.1) },
        { month: 'M18', onocoy: 210, ...getMockData(175, 0.1) },
        { month: 'M24', onocoy: 250, ...getMockData(200, 0.1) }
    ]
};

// Runway estimates by scenario (keyed by scenario.id)
const RUNWAY_ESTIMATES: Record<string, { months: number; date: string }> = {
    baseline: { months: 36, date: 'Jan 2029' },
    death_spiral: { months: 12, date: 'Jan 2027' },       // Liquidity Shock
    infinite_subsidy: { months: 14, date: 'Mar 2027' },   // Subsidy Trap
    vampire_attack: { months: 18, date: 'Jul 2027' },     // Vampire Attack
    growth_shock: { months: 48, date: 'Jan 2030' }        // Aggressive Expansion
};

// Critical threshold (solvency index below this = danger)
const CRITICAL_THRESHOLD = 70;

export const SolvencyProjectionChart: React.FC<SolvencyProjectionChartProps> = ({
    selectedPeers,
    scenarioId
}) => {
    const data = useMemo(() => {
        return SCENARIO_DATA[scenarioId] || SCENARIO_DATA.baseline;
    }, [scenarioId]);

    const runway = useMemo(() => {
        return RUNWAY_ESTIMATES[scenarioId] || RUNWAY_ESTIMATES.baseline;
    }, [scenarioId]);

    // Determine health status
    const healthStatus = useMemo(() => {
        if (runway.months >= 24) return { label: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
        if (runway.months >= 12) return { label: 'Caution', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
        return { label: 'Critical', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    }, [runway]);

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            {/* Header with Runway Badge */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-sm font-bold text-white">Solvency Projection (24 Months)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Runway projection based on selected scenario parameters.
                    </p>
                </div>

                {/* Treasury Runway Badge */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${healthStatus.bg} ${healthStatus.border}`}>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide">Treasury Runway</div>
                        <div className="text-sm font-bold text-white">{runway.date}</div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded ${healthStatus.bg} ${healthStatus.color}`}>
                        {healthStatus.label}
                    </div>
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="month"
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            domain={['auto', 'auto']}
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
                        />
                        <Legend
                            wrapperStyle={{ fontSize: 10 }}
                            iconType="circle"
                        />
                        <ReferenceLine y={100} stroke="#475569" strokeDasharray="5 5" label={{ value: 'Baseline', position: 'right', fill: '#64748b', fontSize: 9 }} />
                        <ReferenceLine y={CRITICAL_THRESHOLD} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical', position: 'right', fill: '#ef4444', fontSize: 9 }} />

                        {/* Onocoy (Always shown) */}
                        <Line
                            type="monotone"
                            dataKey="onocoy"
                            name="Onocoy"
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
                                name={peerId.replace('_v1', '').replace('_bme', '').replace('adaptive_elastic', 'Render').toUpperCase()}
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


