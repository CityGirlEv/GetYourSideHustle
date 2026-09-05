import React from 'react';
import { CF_CHIP_OFF } from '../lib/contentFactory';
import { GEAR_COMPARE_LABEL, GEAR_SELECT_LABEL, GEAR_UNSELECT_LABEL } from '../lib/gearSelections';

export const GearCardSelectCompare: React.FC<{
  selected: boolean;
  selectDisabled?: boolean;
  onSelect: () => void;
  selectTestId: string;
  comparing: boolean;
  compareDisabled?: boolean;
  onCompare: () => void;
  compareTestId: string;
}> = ({
  selected,
  selectDisabled = false,
  onSelect,
  selectTestId,
  comparing,
  compareDisabled = false,
  onCompare,
  compareTestId,
}) => (
  <div className="flex flex-wrap items-center gap-1.5 w-full">
    <button
      type="button"
      disabled={selectDisabled}
      aria-pressed={selected}
      onClick={onSelect}
      className={`min-h-[44px] flex-1 px-2 rounded-xl text-[11px] font-black uppercase inline-flex items-center justify-center border-2 disabled:opacity-40 disabled:cursor-not-allowed ${
        selected
          ? 'bg-[#EA580C] text-white border-[#FDBA74] shadow-[0_4px_12px_rgba(234,88,12,0.28)] cursor-pointer'
          : `${CF_CHIP_OFF} cursor-pointer`
      }`}
      data-testid={selectTestId}
    >
      {selected ? GEAR_UNSELECT_LABEL : GEAR_SELECT_LABEL}
    </button>
    <button
      type="button"
      disabled={compareDisabled}
      aria-pressed={comparing}
      onClick={onCompare}
      className={`min-h-[44px] flex-1 px-2 rounded-xl text-[11px] font-black uppercase inline-flex items-center justify-center border-2 disabled:opacity-40 disabled:cursor-not-allowed ${
        comparing
          ? 'bg-[#EA580C] text-white border-[#FDBA74] shadow-[0_4px_12px_rgba(234,88,12,0.28)] cursor-pointer'
          : `${CF_CHIP_OFF} cursor-pointer`
      }`}
      data-testid={compareTestId}
    >
      {GEAR_COMPARE_LABEL}
    </button>
  </div>
);
