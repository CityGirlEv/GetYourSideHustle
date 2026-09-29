import React, { useState } from 'react';
import {
  GEAR_HAT_COLOR_LIMIT,
  GEAR_HAT_COLOR_OPTIONS,
  GEAR_HAT_COLOR_EMPTY_LABEL,
  GEAR_HAT_COLOR_GRID_CLASS,
  GEAR_HAT_COLOR_IMAGE_CLASS,
  GEAR_HAT_COLOR_PROMPT,
  GEAR_HAT_COLOR_SELECTED_NOTE,
  GEAR_OPTION_CARD_CLASS,
  GEAR_OPTION_CARD_OFF_CLASS,
  GEAR_OPTION_CARD_ON_CLASS,
  GEAR_PICKER_PANEL_CLASS,
  gearHatCompareId,
  gearPickerTabClass,
  gearPickerTabThumbClass,
  gearHatColorHeading,
  gearHatColorImage,
  gearHatColorPickerStartsOpen,
  gearMockupDisclosureVisible,
  pickedHatColorIds,
  pickedHatColorOptions,
  type GearHatColorId,
  type GearHatColorOption,
  type GearSelectionsStore,
} from '../lib/gearSelections';
import { GearCardSelectCompare } from './GearCardSelectCompare';
import { GearMockupDisclosure } from './GearMockupDisclosure';

export const GearHatColorPicker: React.FC<{
  store: GearSelectionsStore;
  onAdd: (colorId: GearHatColorId) => void;
  onRemove: (colorId: GearHatColorId) => void;
  onOpen?: (color: GearHatColorOption) => void;
  onCompare?: (colorId: GearHatColorId) => void;
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
  onOpen,
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
  const selected = pickedHatColorOptions(store);
  const selectedIds = pickedHatColorIds(store);
  const atLimit = selectedIds.length >= GEAR_HAT_COLOR_LIMIT;
  const [open, setOpen] = useState(() => gearHatColorPickerStartsOpen(selectedIds.length, startOpen));
  const tabOn = onActivate ? Boolean(active) : open;
  const showTab = !panelOnly;
  const showPanel = panelOnly || (!tabOnly && (onActivate ? Boolean(active) : open));

  return (
    <section className={panelOnly ? 'space-y-3' : 'relative shrink-0'} data-testid="gear-hat-color-picker">
      {showTab ? (
        <button
          type="button"
          role="tab"
          aria-selected={tabOn}
          aria-expanded={showPanel}
          aria-controls="gear-hat-color-panel"
          onClick={() => (onActivate ? onActivate() : setOpen((prev) => !prev))}
          className={gearPickerTabClass(tabOn, selectedIds.length > 0)}
          data-testid="gear-hat-color-toggle"
        >
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-left truncate" data-testid="gear-hat-color-heading">
            {gearHatColorHeading(selectedIds.length)}
          </span>
          <span className="ml-auto inline-flex items-center gap-1" aria-label="Selected hat colors">
            {selected.map((color) => (
              <span
                key={color.id}
                className={`w-5 h-5 rounded-full shrink-0 ${
                  color.id === 'white' ? 'border-2 border-[#1F1917]/40' : `border ${gearPickerTabThumbClass(tabOn)}`
                }`}
                style={{ backgroundColor: color.swatch }}
                title={color.label}
                data-testid={`gear-hat-color-heading-swatch-${color.id}`}
              />
            ))}
          </span>
        </button>
      ) : null}
      {showPanel ? (
        <div id="gear-hat-color-panel" className={`${panelOnly || startOpen ? 'relative' : 'relative mt-2'} ${GEAR_PICKER_PANEL_CLASS}`}>
          {gearMockupDisclosureVisible(selectedOnly) ? <GearMockupDisclosure /> : null}
          <p className="text-sm font-semibold text-[#1F1917]" data-testid="gear-hat-color-selected-note">
            {selectedOnly ? GEAR_HAT_COLOR_SELECTED_NOTE : GEAR_HAT_COLOR_PROMPT}
          </p>
          {selectedOnly && selected.length === 0 ? (
            <p className="text-sm text-[#3F3832]" data-testid="gear-hat-color-empty">
              {GEAR_HAT_COLOR_EMPTY_LABEL}
            </p>
          ) : (
            <section className="rounded-2xl border border-[#E8DFD2] bg-white overflow-hidden">
              <div className="px-3 pb-3 pt-2">
                <div
                  className={GEAR_HAT_COLOR_GRID_CLASS}
                  role="group"
                  aria-label={selectedOnly ? GEAR_HAT_COLOR_SELECTED_NOTE : GEAR_HAT_COLOR_PROMPT}
                >
                  {GEAR_HAT_COLOR_OPTIONS.map((color) => {
                    const isSelected = selectedIds.includes(color.id);
                    const blocked = atLimit && !isSelected;
                    const compareId = gearHatCompareId(color.id);
                    const comparing = comparingIds.includes(compareId);
                    const hatImage = (
                      <img
                        src={gearHatColorImage(color.id)}
                        alt={`${color.label} hat`}
                        className={GEAR_HAT_COLOR_IMAGE_CLASS}
                        data-testid={`gear-hat-color-image-${color.id}`}
                      />
                    );
                    return (
                      <article
                        key={color.id}
                        className={`${GEAR_OPTION_CARD_CLASS} ${
                          isSelected ? GEAR_OPTION_CARD_ON_CLASS : GEAR_OPTION_CARD_OFF_CLASS
                        }`}
                        data-testid={`gear-hat-color-option-${color.id}`}
                      >
                        <GearCardSelectCompare
                          selected={isSelected}
                          selectDisabled={blocked}
                          onSelect={() => (isSelected ? onRemove(color.id) : onAdd(color.id))}
                          selectTestId={`gear-hat-color-select-${color.id}`}
                          comparing={comparing}
                          compareDisabled={!comparing && comparingIds.length >= compareLimit}
                          onCompare={() => onCompare?.(color.id)}
                          compareTestId={`gear-hat-color-compare-${color.id}`}
                        />
                        {onOpen ? (
                          <button
                            type="button"
                            onClick={() => onOpen(color)}
                            className="relative block w-full bg-white rounded-lg cursor-pointer min-h-[44px]"
                            aria-label={`View ${color.label} hat larger`}
                            data-testid={`gear-hat-color-preview-${color.id}`}
                          >
                            {hatImage}
                          </button>
                        ) : (
                          <span className="relative block w-full bg-white">{hatImage}</span>
                        )}
                        <p className="text-sm font-semibold text-[#1F1917] truncate">{color.label}</p>
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
