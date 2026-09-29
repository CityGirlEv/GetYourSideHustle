import React from 'react';

export const ComingSoonBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    data-testid="coming-soon-badge"
    className={`inline-flex shrink-0 items-center justify-center box-border px-2 py-[3px] min-h-[18px] rounded-full bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74] text-[8px] font-black uppercase tracking-wide leading-none whitespace-nowrap ${className}`}
  >
    Coming Soon
  </span>
);
