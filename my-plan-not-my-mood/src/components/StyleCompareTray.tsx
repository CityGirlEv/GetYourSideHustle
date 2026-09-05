import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { STYLE_COMPARE_LIMIT, styleCompareGridClass } from '../lib/assetLibrary';
import { CF_CHIP_OFF } from '../lib/contentFactory';
import { GEAR_UNSELECT_LABEL } from '../lib/gearSelections';
import { RotatingPedestal } from './RotatingPedestal';

export interface StyleCompareItem {
  id: string;
  name: string;
  familyLabel: string;
  src?: string;
  swatch?: string;
}

export const StyleCompareTray: React.FC<{
  items: StyleCompareItem[];
  title?: string;
  selectedIds?: string[];
  onOpen: (item: StyleCompareItem) => void;
  onSelect?: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}> = ({ items, title, selectedIds = [], onOpen, onSelect, onRemove, onClear }) => {
  if (items.length === 0) return null;
  return (
    <section
      className="rounded-[1.75rem] border-2 border-[#FDBA74] bg-[#FFF7ED] p-4 space-y-3"
      data-testid="style-compare-tray"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-black uppercase tracking-wide text-[#9A3412]">
          {title ?? 'Compare versions'} · {items.length}/{STYLE_COMPARE_LIMIT}
        </h3>
        <button
          type="button"
          onClick={onClear}
          className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] bg-white text-[11px] font-black uppercase cursor-pointer"
          data-testid="style-compare-clear"
        >
          Clear
        </button>
      </div>
      <div className={styleCompareGridClass()} data-testid="style-compare-grid">
        {items.slice(0, STYLE_COMPARE_LIMIT).map((item) => (
          <div
            key={item.id}
            className="min-h-[16rem] rounded-2xl border border-[#FED7AA] bg-white p-3 flex flex-col items-center justify-center gap-2"
            data-testid={`style-compare-slot-${item.id}`}
          >
            {item.src ? (
              <RotatingPedestal src={item.src} alt={`${item.name} ${item.familyLabel}`} onClick={() => onOpen(item)} />
            ) : item.swatch ? (
              <button
                type="button"
                onClick={() => onOpen(item)}
                className="w-full aspect-square max-h-48 rounded-2xl border border-[#E5DFD3] cursor-pointer"
                style={{ backgroundColor: item.swatch }}
                aria-label={`${item.name} ${item.familyLabel}`}
              />
            ) : (
              <span className="w-full aspect-square max-h-48 rounded-2xl bg-[#FFEDD5]" />
            )}
            <p className="text-xs font-semibold text-[#1F1917] text-center truncate w-full">{item.name}</p>
            <p className="text-[10px] font-mono font-black uppercase text-[#C2410C]">{item.familyLabel}</p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`min-h-[44px] px-3 rounded-xl text-[11px] font-black uppercase cursor-pointer inline-flex items-center justify-center gap-1 border-2 ${
                    selectedIds.includes(item.id)
                      ? 'bg-[#EA580C] text-white border-[#FDBA74] shadow-[0_4px_12px_rgba(234,88,12,0.28)]'
                      : CF_CHIP_OFF
                  }`}
                  data-testid={`style-compare-select-${item.id}`}
                >
                  {selectedIds.includes(item.id) ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                  {selectedIds.includes(item.id) ? GEAR_UNSELECT_LABEL : 'Select'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#9A3412] hover:bg-[#FFEDD5] cursor-pointer"
                aria-label={`Remove ${item.name} from compare`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
