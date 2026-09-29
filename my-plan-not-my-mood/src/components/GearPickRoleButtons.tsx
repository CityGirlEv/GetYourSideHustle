import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CF_CHIP_OFF } from '../lib/contentFactory';
import {
  GEAR_SHIRT_HOODIE_STYLE_LIMIT,
  GEAR_TSHIRT_STYLE_LABEL,
  isPicked,
  pickedShirtHoodieMockups,
  type GearSelectionsStore,
} from '../lib/gearSelections';

export const GearPickRoleButtons: React.FC<{
  store: GearSelectionsStore;
  mockupId: string;
  onPick: (id: string, role: 'tee') => void;
}> = ({ store, mockupId, onPick }) => {
  const on = isPicked(store, mockupId, 'tee');
  const count = pickedShirtHoodieMockups(store).length;
  return (
    <div className="space-y-1.5" data-testid={`gear-pick-roles-${mockupId}`}>
      <p className="text-[10px] font-mono font-black uppercase text-[#C2410C]">
        {on ? `Selected as ${GEAR_TSHIRT_STYLE_LABEL}` : `Use this card as ${GEAR_TSHIRT_STYLE_LABEL}`}
      </p>
      <button
        type="button"
        onClick={() => onPick(mockupId, 'tee')}
        className={`min-h-[44px] w-full px-2 rounded-xl text-[11px] font-black uppercase cursor-pointer inline-flex items-center justify-center gap-1 border-2 ${
          on
            ? 'bg-[#EA580C] text-white border-[#FDBA74] shadow-[0_4px_12px_rgba(234,88,12,0.28)]'
            : CF_CHIP_OFF
        }`}
        data-testid={`gear-pick-tee-${mockupId}`}
      >
        {on ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
        {GEAR_TSHIRT_STYLE_LABEL} · {count}/{GEAR_SHIRT_HOODIE_STYLE_LIMIT}
      </button>
    </div>
  );
};
