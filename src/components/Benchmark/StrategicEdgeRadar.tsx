import React, { useMemo } from 'react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { PeerId } from './PeerToggle';

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

interface RadarDataPoint {
    dimension: string;
    onocoy: number;
    fullMark: number;
    [key: string]: number | string;
}

interface StrategicEdgeRadarProps {
    selectedPeers: PeerId[];
    scenarioId: string;
}

// Helper for consistent mock radar data
const getRadarMock = (base: number) => {
    return {
        geodnet_v1: base * 0.95,
        hivemapper_v1: base * 0.9,
        helium_bme_v1: base * 0.85,
        dimo_v1: base * 0.92,
        xnet_v1: base * 0.88,
        adaptive_elastic_v1: base * 1.05,
        akash_v1: base * 0.9,
        aleph_v1: base * 0.94,
        grass_v1: base * 1.1,
        ionet_v1: base * 0.98,
        nosana_v1: base * 0.92,
    };
};

// Mock radar data by scenario (keyed by scenario.id)
const SCENARIO_RADAR: Record<string, RadarDataPoint[]> = {
    baseline: [
        { dimension: 'Tech Stack', onocoy: 90, fullMark: 100, ...getRadarMock(85) },
        { dimension: 'Solvency', onocoy: 85, fullMark: 100, ...getRadarMock(80) },
        { dimension: 'Coverage', onocoy: 75, fullMark: 100, ...getRadarMock(90) },
        { dimension: 'Community', onocoy: 80, fullMark: 100, ...getRadarMock(75) },
        { dimension: 'Ease of Use', onocoy: 85, fullMark: 100, ...getRadarMock(70) }
    ],
    death_spiral: [
        { dimension: 'Tech Stack', onocoy: 90, fullMark: 100, ...getRadarMock(70) },
        { dimension: 'Solvency', onocoy: 80, fullMark: 100, ...getRadarMock(60) },
        { dimension: 'Coverage', onocoy: 70, fullMark: 100, ...getRadarMock(75) },
        { dimension: 'Community', onocoy: 75, fullMark: 100, ...getRadarMock(65) },
        { dimension: 'Ease of Use', onocoy: 80, fullMark: 100, ...getRadarMock(70) }
    ],
    infinite_subsidy: [
        { dimension: 'Tech Stack', onocoy: 90, fullMark: 100, ...getRadarMock(80) },
        { dimension: 'Solvency', onocoy: 65, fullMark: 100, ...getRadarMock(60) },
        { dimension: 'Coverage', onocoy: 75, fullMark: 100, ...getRadarMock(85) },
        { dimension: 'Community', onocoy: 70, fullMark: 100, ...getRadarMock(70) },
        { dimension: 'Ease of Use', onocoy: 85, fullMark: 100, ...getRadarMock(75) }
    ],
    vampire_attack: [
        { dimension: 'Tech Stack', onocoy: 90, fullMark: 100, ...getRadarMock(80) },
        { dimension: 'Solvency', onocoy: 88, fullMark: 100, ...getRadarMock(75) },
        { dimension: 'Coverage', onocoy: 70, fullMark: 100, ...getRadarMock(85) },
        { dimension: 'Community', onocoy: 75, fullMark: 100, ...getRadarMock(60) },
        { dimension: 'Ease of Use', onocoy: 85, fullMark: 100, ...getRadarMock(80) }
    ],
    growth_shock: [
        { dimension: 'Tech Stack', onocoy: 90, fullMark: 100, ...getRadarMock(90) },
        { dimension: 'Solvency', onocoy: 95, fullMark: 100, ...getRadarMock(95) },
        { dimension: 'Coverage', onocoy: 80, fullMark: 100, ...getRadarMock(90) },
        { dimension: 'Community', onocoy: 90, fullMark: 100, ...getRadarMock(85) },
        { dimension: 'Ease of Use', onocoy: 85, fullMark: 100, ...getRadarMock(80) }
    ]
};

export const StrategicEdgeRadar: React.FC<StrategicEdgeRadarProps> = ({
    selectedPeers,
    scenarioId
}) => {
    const data = useMemo(() => {
        return SCENARIO_RADAR[scenarioId] || SCENARIO_RADAR.baseline;
    }, [scenarioId]);

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <div className="mb-2">
                <h3 className="text-sm font-bold text-white">Strategic "Edge"</h3>
                <p className="text-xs text-slate-400 mt-1">
                    Relative strengths vs Peer Set.
                </p>
            </div>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis
                            dataKey="dimension"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[50, 100]}
                            tick={{ fill: '#64748b', fontSize: 8 }}
                            tickCount={3}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                fontSize: 12
                            }}
                        />

                        {/* Onocoy (Always shown, emphasized) */}
                        <Radar
                            name="Onocoy"
                            dataKey="onocoy"
                            stroke={COLORS.onocoy}
                            fill={COLORS.onocoy}
                            fillOpacity={0.3}
                            strokeWidth={2}
                        />

                        {/* Dynamic peer radars */}
                        {selectedPeers.map(peerId => (
                            <Radar
                                key={peerId}
                                name={peerId.replace('_v1', '').replace('_bme', '').replace('adaptive_elastic', 'Render').toUpperCase()}
                                dataKey={peerId}
                                stroke={COLORS[peerId] || '#94a3b8'}
                                fill={COLORS[peerId] || '#94a3b8'}
                                fillOpacity={0.15}
                                strokeWidth={1.5}
                            />
                        ))}
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


