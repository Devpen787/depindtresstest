import React, { useMemo } from 'react';
import { PEER_GROUPS } from '../../data/peerGroups';
import { PROTOCOL_PROFILES } from '../../data/protocols';

export type PeerId = string;

interface PeerToggleProps {
    selectedPeers: PeerId[];
    onToggle: (peerId: PeerId) => void;
    activeGroupId: string;
    onGroupChange: (groupId: string) => void;
}

export const PeerToggle: React.FC<PeerToggleProps> = ({
    selectedPeers,
    onToggle,
    activeGroupId,
    onGroupChange
}) => {
    // Get peers for the active group
    const activeGroup = PEER_GROUPS.find(g => g.id === activeGroupId) || PEER_GROUPS[0];

    // Map protocol IDs to display data
    const groupPeers = useMemo(() => {
        return activeGroup.members
            .filter(id => id !== 'ono_v3_calibrated') // Exclude self (Onocoy)
            .map(id => {
                const profile = PROTOCOL_PROFILES.find(p => p.metadata.id === id);
                return {
                    id,
                    name: profile?.metadata.name || id,
                    color: getPeerColor(id)
                };
            });
    }, [activeGroup]);

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6 space-y-4">
            {/* Group Selector */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-2">
                    Sector:
                </span>
                {PEER_GROUPS.map(group => (
                    <button
                        key={group.id}
                        onClick={() => onGroupChange(group.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeGroupId === group.id
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {group.name}
                    </button>
                ))}
            </div>

            {/* Peer Toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Compare Onocoy vs:
                </span>

                <div className="flex flex-wrap gap-2">
                    {groupPeers.map(peer => {
                        const isActive = selectedPeers.includes(peer.id);
                        const colors = getColorClasses(peer.color);

                        return (
                            <button
                                key={peer.id}
                                onClick={() => onToggle(peer.id)}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold
                                    ${isActive
                                        ? colors.active
                                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700/50'
                                    }
                                `}
                            >
                                <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                                {peer.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Helper: Assign stable colors to peers
function getPeerColor(id: string): string {
    if (id.includes('geodnet')) return 'orange';
    if (id.includes('helium')) return 'green';
    if (id.includes('hivemapper')) return 'yellow';
    if (id.includes('dimo')) return 'blue';
    if (id.includes('xnet')) return 'red';
    if (id.includes('render') || id.includes('elastic')) return 'purple'; // Handle adaptive_elastic_v1
    if (id.includes('aleph')) return 'cyan';
    if (id.includes('grass')) return 'emerald';
    if (id.includes('nosana')) return 'pink';
    if (id.includes('ionet')) return 'indigo';
    if (id.includes('akash')) return 'rose'; // Added Akash
    return 'slate';
}

function getColorClasses(color: string) {
    const map: Record<string, { active: string; dot: string }> = {
        orange: { active: 'bg-orange-500/20 border-orange-500/50 text-orange-400', dot: 'bg-orange-500' },
        green: { active: 'bg-green-500/20 border-green-500/50 text-green-400', dot: 'bg-green-500' },
        yellow: { active: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400', dot: 'bg-yellow-500' },
        blue: { active: 'bg-blue-500/20 border-blue-500/50 text-blue-400', dot: 'bg-blue-500' },
        red: { active: 'bg-red-500/20 border-red-500/50 text-red-400', dot: 'bg-red-500' },
        purple: { active: 'bg-purple-500/20 border-purple-500/50 text-purple-400', dot: 'bg-purple-500' },
        cyan: { active: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400', dot: 'bg-cyan-500' },
        emerald: { active: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400', dot: 'bg-emerald-500' },
        pink: { active: 'bg-pink-500/20 border-pink-500/50 text-pink-400', dot: 'bg-pink-500' },
        indigo: { active: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400', dot: 'bg-indigo-500' },
        rose: { active: 'bg-rose-500/20 border-rose-500/50 text-rose-400', dot: 'bg-rose-500' },
        slate: { active: 'bg-slate-500/20 border-slate-500/50 text-slate-400', dot: 'bg-slate-500' }
    };
    return map[color] || map.slate;
}
