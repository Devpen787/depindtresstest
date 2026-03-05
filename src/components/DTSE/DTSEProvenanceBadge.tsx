import React from 'react';

export type DTSEProvenanceKind = 'model' | 'live_market' | 'derived' | 'curated' | 'mixed';

export interface DTSEProvenanceItem {
  kind: DTSEProvenanceKind;
  label: string;
}

const PROVENANCE_STYLES: Record<DTSEProvenanceKind, { chip: string; dot: string }> = {
  model: {
    chip: 'border-indigo-500/25 bg-indigo-500/10 text-indigo-200',
    dot: 'bg-indigo-300',
  },
  live_market: {
    chip: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200',
    dot: 'bg-emerald-300',
  },
  derived: {
    chip: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-200',
    dot: 'bg-cyan-300',
  },
  curated: {
    chip: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
    dot: 'bg-amber-300',
  },
  mixed: {
    chip: 'border-violet-500/25 bg-violet-500/10 text-violet-200',
    dot: 'bg-violet-300',
  },
};

interface DTSEProvenanceBadgesProps {
  items: DTSEProvenanceItem[];
}

export const DTSEProvenanceBadges: React.FC<DTSEProvenanceBadgesProps> = ({ items }) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Provenance</span>
    {items.map((item) => {
      const style = PROVENANCE_STYLES[item.kind];
      return (
        <span
          key={`${item.kind}-${item.label}`}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-black uppercase tracking-[0.16em] ${style.chip}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {item.label}
        </span>
      );
    })}
  </div>
);
