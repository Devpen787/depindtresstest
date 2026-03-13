import React from 'react';

interface DTSECardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'nested';
}

export const DTSECard: React.FC<DTSECardProps> = ({
  children,
  className = '',
  variant = 'primary',
}) => {
  const base = variant === 'nested'
    ? 'dtse-surface-base'
    : 'dtse-surface-glass';
  const radius = variant === 'nested' ? 'rounded-lg' : 'rounded-2xl';
  return (
    <div className={`${base} ${radius} ${className}`}>
      {children}
    </div>
  );
};
