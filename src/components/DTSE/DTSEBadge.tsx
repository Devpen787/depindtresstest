import React from 'react';

type DTSEBadgeVariant = 'healthy' | 'watchlist' | 'intervention' | 'neutral';

interface DTSEBadgeProps {
  children: React.ReactNode;
  variant?: DTSEBadgeVariant;
  className?: string;
}

const VARIANT_STYLES: Record<DTSEBadgeVariant, string> = {
  healthy: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  watchlist: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  intervention: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
  neutral: 'border-slate-600/85 bg-slate-900/88 text-slate-100',
};

export const DTSEBadge: React.FC<DTSEBadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
