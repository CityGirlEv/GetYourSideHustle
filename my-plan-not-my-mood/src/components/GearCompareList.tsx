import React from 'react';
import { STYLE_COMPARE_LIMIT } from '../lib/assetLibrary';
import { GEAR_COMPARE_LIST_TITLE } from '../lib/gearSelections';
import { UploadThumb } from './UploadThumb';

export type GearCompareListItem = {
  id: string;
  name: string;
  subtitle: string;
  src?: string;
  swatch?: string;
};

export const GearCompareList: React.FC<{
  items: GearCompareListItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}> = ({ items, selectedIds, onToggle }) => (
  <form
    className="rounded-2xl border border-[#E8DFD2] bg-white p-3 space-y-2"
    data-testid="gear-compare-list"
    onSubmit={(event) => event.preventDefault()}
  >
    <p className="text-[10px] font-mono font-black uppercase text-[#C2410C]">
      {GEAR_COMPARE_LIST_TITLE} · {selectedIds.length}/{STYLE_COMPARE_LIMIT}
    </p>
    {items.length === 0 ? (
      <p className="text-sm text-[#3F3832]">No cards to compare yet.</p>
    ) : (
      <ul className="divide-y divide-[#F0E8DC]">
        {items.map((item) => {
          const checked = selectedIds.includes(item.id);
          return (
            <li key={item.id}>
              <label
                className="flex items-center gap-3 min-h-[44px] py-1.5 cursor-pointer"
                data-testid={`gear-compare-row-${item.id}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!checked && selectedIds.length >= STYLE_COMPARE_LIMIT}
                  onChange={() => onToggle(item.id)}
                  className="w-5 h-5 accent-[#EA580C] shrink-0 disabled:opacity-40"
                  data-testid={`gear-compare-check-${item.id}`}
                />
                {item.src ? (
                  <UploadThumb src={item.src} alt="" size="xs" />
                ) : item.swatch ? (
                  <span
                    className="w-8 h-8 rounded-md border border-[#E5DFD3] shrink-0"
                    style={{ backgroundColor: item.swatch }}
                    aria-hidden
                  />
                ) : (
                  <span className="w-8 h-8 rounded-md bg-[#FFEDD5] shrink-0" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#1F1917] truncate">{item.name}</span>
                  <span className="block text-[10px] font-mono font-black uppercase text-[#C2410C]">
                    {item.subtitle}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    )}
  </form>
);
