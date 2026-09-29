import React from 'react';
import { X } from 'lucide-react';
import { GEAR_PICK_LIMITS, GEAR_UNSELECT_LABEL, type GearMockup } from '../lib/gearSelections';

export const GearPickBubbles: React.FC<{
  tees: GearMockup[];
  hats: GearMockup[];
  srcOf: (item: GearMockup) => string | undefined;
  onUnselect: (id: string) => void;
}> = ({ tees, hats, srcOf, onUnselect }) => {
  const bubble = (item: GearMockup, kind: 'tee' | 'hat') => (
    <span
      key={item.id}
      className="inline-flex items-center gap-1 pl-1 pr-0.5 h-8 rounded-full border border-[#EA580C] bg-[#FFF7ED]"
      data-testid={`gear-pick-bubble-${item.id}`}
    >
      {srcOf(item) ? (
        <img
          src={srcOf(item)}
          alt=""
          width={24}
          height={24}
          className="w-6 h-6 rounded-full object-cover border border-[#FED7AA] shrink-0"
        />
      ) : (
        <span className="w-6 h-6 rounded-full bg-[#FFEDD5] shrink-0" />
      )}
      <span className="text-xs font-semibold text-[#9A3412] max-w-[5.5rem] sm:max-w-[7rem] truncate">
        {item.name}
      </span>
      <button
        type="button"
        onClick={() => onUnselect(item.id)}
        className="min-h-[44px] min-w-[44px] -my-1.5 -mr-1.5 inline-flex items-center justify-center rounded-full text-[#9A3412] hover:bg-[#FFEDD5] cursor-pointer"
        aria-label={`${GEAR_UNSELECT_LABEL} ${item.name}`}
        data-testid={`gear-unselect-${item.id}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <span className="sr-only">{kind}</span>
    </span>
  );

  return (
    <div className="space-y-2" data-testid="gear-pick-bubbles">
      <div className="space-y-1">
        <p className="text-[10px] font-mono font-black uppercase text-[#C2410C]">
          T-Shirt designs · {tees.length}/{GEAR_PICK_LIMITS.tee}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {tees.length ? tees.map((item) => bubble(item, 'tee')) : (
            <p className="text-sm text-[#3F3832]">No tee designs selected.</p>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-mono font-black uppercase text-[#C2410C]">
          Hat colors · {hats.length}/{GEAR_PICK_LIMITS.hat}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {hats.length ? hats.map((item) => bubble(item, 'hat')) : (
            <p className="text-sm text-[#3F3832]">No hat colors selected.</p>
          )}
        </div>
      </div>
    </div>
  );
};
