import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  GEAR_PICKER_PANEL_CLASS,
  gearPickerTabClass,
  gearPickerTabThumbClass,
  GEAR_SELECT_IMAGE_GRID_CLASS,
  GEAR_SELECTION_BANNER_CLASS,
  GEAR_SHIRT_HOODIE_CHANGE_HINT,
  GEAR_SHIRT_HOODIE_EMPTY_LABEL,
  GEAR_SHIRT_HOODIE_NOTE,
  GEAR_SHIRT_HOODIE_STYLE_LIMIT,
  GEAR_UNSELECT_LABEL,
  gearMockupDisclosureVisible,
  gearShirtHoodieHeading,
  gearShirtHoodiePickerStartsOpen,
  pickedShirtHoodieFamilyIds,
  pickedShirtHoodieStyles,
  type GearMockup,
  type GearSelectionsStore,
} from '../lib/gearSelections';
import { GearMockupDisclosure } from './GearMockupDisclosure';
import { UploadThumb } from './UploadThumb';

export const GearShirtHoodieStylePicker: React.FC<{
  store: GearSelectionsStore;
  srcOf: (item: GearMockup) => string | undefined;
  onToggle: (familyId: string) => void;
  onOpen?: (item: GearMockup) => void;
  startOpen?: boolean;
  selectedOnly?: boolean;
  tabOnly?: boolean;
  panelOnly?: boolean;
  active?: boolean;
  onActivate?: () => void;
}> = ({
  store,
  srcOf,
  onToggle,
  onOpen,
  startOpen = false,
  selectedOnly = false,
  tabOnly = false,
  panelOnly = false,
  active,
  onActivate,
}) => {
  const selected = pickedShirtHoodieStyles(store);
  const selectedIds = pickedShirtHoodieFamilyIds(store);
  const [open, setOpen] = useState(() => gearShirtHoodiePickerStartsOpen(selectedIds.length, startOpen));
  const tabOn = onActivate ? Boolean(active) : open;
  const showTab = !panelOnly;
  const showPanel = panelOnly || (!tabOnly && (onActivate ? Boolean(active) : open));

  return (
    <section className={panelOnly ? 'space-y-3' : 'relative shrink-0'} data-testid="gear-shirt-hoodie-picker">
      {showTab ? (
      <button
        type="button"
        role="tab"
        aria-selected={tabOn}
        aria-expanded={showPanel}
        aria-controls="gear-shirt-hoodie-panel"
        onClick={() => (onActivate ? onActivate() : setOpen((prev) => !prev))}
        className={gearPickerTabClass(tabOn, selectedIds.length > 0)}
        data-testid="gear-shirt-hoodie-toggle"
      >
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-left truncate" data-testid="gear-shirt-hoodie-heading">
          {gearShirtHoodieHeading(selectedIds.length)}
        </span>
        <span className="ml-auto inline-flex items-center gap-1" aria-label="Selected shirt and hoodie styles">
          {selected.map((style) => {
            const src = style.thumb ? srcOf(style.thumb) : undefined;
            return src ? (
              <img
                key={style.id}
                src={src}
                alt=""
                width={20}
                height={20}
                className={`w-5 h-5 rounded-md object-cover border ${gearPickerTabThumbClass(tabOn)} shrink-0`}
                title={style.label}
                data-testid={`gear-shirt-hoodie-heading-thumb-${style.id}`}
              />
            ) : (
              <span
                key={style.id}
                className={`w-5 h-5 rounded-md bg-white/20 border ${gearPickerTabThumbClass(tabOn)} shrink-0`}
                title={style.label}
              />
            );
          })}
        </span>
      </button>
      ) : null}
      {showPanel ? (
        <div
          id="gear-shirt-hoodie-panel"
          className={`${panelOnly || startOpen ? 'relative' : 'relative mt-2'} ${GEAR_PICKER_PANEL_CLASS}`}
        >
          {gearMockupDisclosureVisible(selectedOnly) ? <GearMockupDisclosure /> : null}
          <p className={GEAR_SELECTION_BANNER_CLASS} data-testid="gear-shirt-hoodie-selected-note">
            <span>{GEAR_SHIRT_HOODIE_NOTE}</span>
            {selected.length === 0 ? (
              <>
                <span aria-hidden className="opacity-80">
                  ·
                </span>
                <span data-testid="gear-shirt-hoodie-empty">{GEAR_SHIRT_HOODIE_EMPTY_LABEL}</span>
              </>
            ) : (
              <span data-testid="gear-shirt-hoodie-banner-count">
                · {selected.length}/{GEAR_SHIRT_HOODIE_STYLE_LIMIT} selected
              </span>
            )}
          </p>
          {selected.length === 0 ? null : (
            <>
              {selectedOnly ? (
                <p className="text-sm text-[#3F3832]" data-testid="gear-shirt-hoodie-change-hint">
                  {GEAR_SHIRT_HOODIE_CHANGE_HINT}
                </p>
              ) : null}
              <div className="space-y-2" data-testid="gear-shirt-hoodie-selected">
                <p className="text-[10px] font-mono font-black uppercase text-[#C2410C]">
                  Selected styles · {selected.length}/{GEAR_SHIRT_HOODIE_STYLE_LIMIT}
                </p>
                <div className={GEAR_SELECT_IMAGE_GRID_CLASS}>
                  {selected.flatMap((style) =>
                    style.items.map((item) => {
                      const src = srcOf(item);
                      return (
                        <article
                          key={item.id}
                          className="rounded-xl border-2 border-[#EA580C] bg-[#FFF7ED] p-2 flex flex-col gap-2"
                          data-testid={`gear-shirt-hoodie-chip-${item.id}`}
                        >
                          {src ? (
                            <UploadThumb
                              src={src}
                              alt={`${item.name} mockup`}
                              size="lg"
                              fill
                              contain={false}
                              onClick={onOpen ? () => onOpen(item) : undefined}
                            />
                          ) : (
                            <span className="w-full aspect-[4/5] rounded-2xl bg-[#FFEDD5]" />
                          )}
                          <p className="text-xs font-black uppercase text-[#1F1917] truncate">{item.name}</p>
                          {selectedOnly ? null : (
                            <button
                              type="button"
                              onClick={() => onToggle(style.id)}
                              className="min-h-[44px] px-2 rounded-xl text-[11px] font-black uppercase cursor-pointer inline-flex items-center justify-center gap-1 border-2 border-[#EA580C] bg-white text-[#9A3412]"
                              aria-label={`Unselect ${item.name}`}
                              data-testid={`gear-shirt-hoodie-delete-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                              {GEAR_UNSELECT_LABEL}
                            </button>
                          )}
                        </article>
                      );
                    }),
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
};
