import React, { useState } from 'react';
import {
  GEAR_BRAND_GRID_CLASS,
  GEAR_OPTION_CARD_CLASS,
  GEAR_OPTION_CARD_OFF_CLASS,
  GEAR_OPTION_CARD_ON_CLASS,
  GEAR_PICKER_PANEL_CLASS,
  GEAR_BRAND_PRICING_NOTE,
  GEAR_SHIRT_HOODIE_BRAND_EMPTY_LABEL,
  GEAR_SHIRT_HOODIE_BRAND_LIMIT,
  GEAR_SHIRT_HOODIE_BRAND_OPTIONS,
  GEAR_SHIRT_HOODIE_BRAND_PROMPT,
  GEAR_SHIRT_HOODIE_BRAND_SELECTED_NOTE,
  gearBrandCompareId,
  gearMockupDisclosureVisible,
  gearPickerTabClass,
  gearPickerTabThumbClass,
  gearShirtHoodieBrandHeading,
  gearShirtHoodieBrandPickerStartsOpen,
  pickedShirtHoodieBrandIds,
  pickedShirtHoodieBrandOptions,
  type GearShirtHoodieBrandId,
  type GearSelectionsStore,
} from '../lib/gearSelections';
import { GearCardSelectCompare } from './GearCardSelectCompare';
import { GearMockupDisclosure } from './GearMockupDisclosure';

export const GearShirtHoodieBrandPicker: React.FC<{
  store: GearSelectionsStore;
  onAdd: (brandId: GearShirtHoodieBrandId) => void;
  onRemove: (brandId: GearShirtHoodieBrandId) => void;
  onCompare?: (brandId: GearShirtHoodieBrandId) => void;
  comparingIds?: string[];
  compareLimit?: number;
  startOpen?: boolean;
  selectedOnly?: boolean;
  tabOnly?: boolean;
  panelOnly?: boolean;
  active?: boolean;
  onActivate?: () => void;
}> = ({
  store,
  onAdd,
  onRemove,
  onCompare,
  comparingIds = [],
  compareLimit = 8,
  startOpen = false,
  selectedOnly = false,
  tabOnly = false,
  panelOnly = false,
  active,
  onActivate,
}) => {
  const selected = pickedShirtHoodieBrandOptions(store);
  const selectedIds = pickedShirtHoodieBrandIds(store);
  const atLimit = selectedIds.length >= GEAR_SHIRT_HOODIE_BRAND_LIMIT;
  const [open, setOpen] = useState(() => gearShirtHoodieBrandPickerStartsOpen(selectedIds.length, startOpen));
  const tabOn = onActivate ? Boolean(active) : open;
  const showTab = !panelOnly;
  const showPanel = panelOnly || (!tabOnly && (onActivate ? Boolean(active) : open));

  return (
    <section className={panelOnly ? 'space-y-3' : 'relative shrink-0'} data-testid="gear-shirt-hoodie-brand-picker">
      {showTab ? (
      <button
        type="button"
        role="tab"
        aria-selected={tabOn}
        aria-expanded={showPanel}
        aria-controls="gear-shirt-hoodie-brand-panel"
        onClick={() => (onActivate ? onActivate() : setOpen((prev) => !prev))}
        className={gearPickerTabClass(tabOn, selectedIds.length > 0)}
        data-testid="gear-shirt-hoodie-brand-toggle"
      >
        <span
          className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-left truncate"
          data-testid="gear-shirt-hoodie-brand-heading"
        >
          {gearShirtHoodieBrandHeading(selectedIds.length)}
        </span>
        <span className="ml-auto inline-flex items-center gap-1" aria-label="Selected shirt and hoodie brands">
          {selected.map((brand) => (
            <span
              key={brand.id}
              className={`w-5 h-5 rounded-full shrink-0 border ${gearPickerTabThumbClass(tabOn)}`}
              style={{ backgroundColor: brand.swatch }}
              title={brand.label}
              data-testid={`gear-shirt-hoodie-brand-heading-swatch-${brand.id}`}
            />
          ))}
        </span>
      </button>
      ) : null}
      {showPanel ? (
        <div
          id="gear-shirt-hoodie-brand-panel"
          className={`${panelOnly || startOpen ? 'relative' : 'relative mt-2'} ${GEAR_PICKER_PANEL_CLASS}`}
        >
          {gearMockupDisclosureVisible(selectedOnly) ? <GearMockupDisclosure /> : null}
          <p className="text-sm font-semibold text-[#1F1917]" data-testid="gear-shirt-hoodie-brand-selected-note">
            {selectedOnly ? GEAR_SHIRT_HOODIE_BRAND_SELECTED_NOTE : GEAR_SHIRT_HOODIE_BRAND_PROMPT}
          </p>
          <p
            className="text-xs font-semibold text-[#9A3412]"
            data-testid="gear-shirt-hoodie-brand-pricing-note"
          >
            {GEAR_BRAND_PRICING_NOTE}
          </p>
          {selectedOnly && selected.length === 0 ? (
            <p className="text-sm text-[#3F3832]" data-testid="gear-shirt-hoodie-brand-empty">
              {GEAR_SHIRT_HOODIE_BRAND_EMPTY_LABEL}
            </p>
          ) : (
            <section className="rounded-2xl border border-[#E8DFD2] bg-white overflow-hidden">
              <div className="px-3 pb-3 pt-2">
                <div
                  className={GEAR_BRAND_GRID_CLASS}
                  role="group"
                  aria-label={selectedOnly ? GEAR_SHIRT_HOODIE_BRAND_SELECTED_NOTE : GEAR_SHIRT_HOODIE_BRAND_PROMPT}
                >
                  {GEAR_SHIRT_HOODIE_BRAND_OPTIONS.map((brand) => {
                    const isSelected = selectedIds.includes(brand.id);
                    const blocked = atLimit && !isSelected;
                    const compareId = gearBrandCompareId(brand.id);
                    const comparing = comparingIds.includes(compareId);
                    return (
                      <article
                        key={brand.id}
                        className={`${GEAR_OPTION_CARD_CLASS} ${
                          isSelected ? GEAR_OPTION_CARD_ON_CLASS : GEAR_OPTION_CARD_OFF_CLASS
                        }`}
                        data-testid={`gear-shirt-hoodie-brand-option-${brand.id}`}
                      >
                        <GearCardSelectCompare
                          selected={isSelected}
                          selectDisabled={blocked}
                          onSelect={() => (isSelected ? onRemove(brand.id) : onAdd(brand.id))}
                          selectTestId={`gear-shirt-hoodie-brand-select-${brand.id}`}
                          comparing={comparing}
                          compareDisabled={!comparing && comparingIds.length >= compareLimit}
                          onCompare={() => onCompare?.(brand.id)}
                          compareTestId={`gear-shirt-hoodie-brand-compare-${brand.id}`}
                        />
                        <span
                          className="relative block w-full aspect-square rounded-2xl border border-[#E5DFD3]"
                          style={{ backgroundColor: brand.swatch }}
                          aria-hidden
                        />
                        <p className="text-sm font-semibold text-[#1F1917] truncate">{brand.label}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      ) : null}
    </section>
  );
};
