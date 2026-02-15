import React from 'react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
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

interface RadarDataPoint {
    dimension: string;
    onocoy: number;
    fullMark: number;
    [key: string]: number | string;
}

interface StrategicEdgeRadarProps {
    selectedPeers: PeerId[];
    data: RadarDataPoint[];
}

const formatPeerName = (peerId: string) => {
    return PEER_LABELS[peerId] || peerId;
};

export const StrategicEdgeRadar: React.FC<StrategicEdgeRadarProps> = ({
    selectedPeers,
    data
}) => {
    if (data.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                <h3 className="text-sm font-bold text-white">Strategic Edge</h3>
                <p className="text-xs text-slate-400 mt-2">No simulation data available for this view yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <div className="mb-2">
                <h3 className="text-sm font-bold text-white">Strategic Edge</h3>
                <p className="text-xs text-slate-400 mt-1">
                    Derived from simulation outcomes and benchmark metrics.
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
                            domain={[0, 100]}
                            tick={{ fill: '#64748b', fontSize: 8 }}
                            tickCount={6}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                fontSize: 12
                            }}
                            formatter={(value: number) => [value.toFixed(1), 'Score']}
                        />

                        {/* Onocoy (Always shown, emphasized) */}
                        <Radar
                            name={formatPeerName('onocoy')}
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
                                name={formatPeerName(peerId)}
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
