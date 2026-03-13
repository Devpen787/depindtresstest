import React from 'react';

interface DTSEStageHeaderProps {
  title: string;
  description?: string;
  compact?: boolean;
}

export const DTSEStageHeader: React.FC<DTSEStageHeaderProps> = ({
  title,
  description,
  compact = false,
}) => {
  return (
    <div className={`flex flex-col ${compact ? 'gap-0.5' : 'gap-0.5'}`}>
      <h2 className={`${compact ? 'text-[15px]' : 'text-base'} font-black tracking-tight dtse-gradient-text`}>{title}</h2>
      {description && (
        <p className={`${compact ? 'max-w-2xl text-[13px]' : 'max-w-[46rem] text-[13px]'} leading-relaxed text-slate-600`}>
          {description}
        </p>
      )}
    </div>
  );
};
