import React, { useRef, useState } from 'react';
import { Check, ChevronDown, Upload } from 'lucide-react';
import { CF_CHIP_OFF } from '../lib/contentFactory';
import {
  GEAR_CATEGORY_SECTION_LABELS,
  GEAR_COMPARE_LABEL,
  GEAR_DONE_LABEL,
  GEAR_PICKER_DONE_CLASS,
  GEAR_PICKER_PANEL_CLASS,
  gearPickerTabClass,
  gearPickerTabThumbClass,
  GEAR_SELECT_IMAGE_GRID_CLASS,
  GEAR_SELECT_LABEL,
  GEAR_UNSELECT_LABEL,
  gearCategoryPickerStartsOpen,
  gearCategorySectionEmptyLabel,
  gearCategorySectionHeading,
  gearCategorySectionPrompt,
  gearSelectButtonDisabled,
  isPicked,
  isShirtHoodieCategory,
  mockupsInCategory,
  picksInCategory,
  sortGearMockupsSelectedFirst,
  type GearCategory,
  type GearMockup,
  type GearSelectionsStore,
} from '../lib/gearSelections';
import { UploadThumb } from './UploadThumb';

export const GearCategoryStylePicker: React.FC<{
  category: GearCategory;
  store: GearSelectionsStore;
  srcOf: (item: GearMockup) => string | undefined;
  onToggle: (item: GearMockup) => void;
  onOpen?: (item: GearMockup) => void;
  onCompare?: (item: GearMockup) => void;
  comparingIds?: string[];
  onUpload?: (files: File[]) => void;
  uploading?: boolean;
  canUpload?: boolean;
  allowSelect?: boolean;
  startOpen?: boolean;
  selectedOnly?: boolean;
}> = ({
  category,
  store,
  srcOf,
  onToggle,
  onOpen,
  onCompare,
  comparingIds = [],
  onUpload,
  uploading = false,
  canUpload = false,
  allowSelect = true,
  startOpen = false,
  selectedOnly = false,
}) => {
  const uploaded = mockupsInCategory(store, category);
  const selected = picksInCategory(store, category);
  const items = selectedOnly ? selected : sortGearMockupsSelectedFirst(uploaded, selected.map((item) => item.id));
  const [open, setOpen] = useState(() => gearCategoryPickerStartsOpen(uploaded.length, startOpen));
  const fileInput = useRef<HTMLInputElement>(null);
  const label = GEAR_CATEGORY_SECTION_LABELS[category];
  const canSelect = allowSelect && isShirtHoodieCategory(category);
  const headingThumbs = (selected.length > 0 ? selected : uploaded).slice(0, 4);

  return (
    <section className="relative shrink-0" data-testid={`gear-category-picker-${category}`}>
      <button
        type="button"
        role="tab"
        aria-selected={open}
        aria-expanded={open}
        aria-controls={`gear-category-panel-${category}`}
        onClick={() => setOpen((prev) => !prev)}
        className={gearPickerTabClass(open, selected.length > 0)}
        data-testid={`gear-category-toggle-${category}`}
      >
        <span
          className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-left truncate"
          data-testid={`gear-category-heading-${category}`}
        >
          {gearCategorySectionHeading(category, selected.length, uploaded.length)}
        </span>
        <span className="ml-auto inline-flex items-center gap-1" aria-label={`${label} thumbnails`}>
          {headingThumbs.map((item) => {
            const src = srcOf(item);
            return src ? (
              <img
                key={item.id}
                src={src}
                alt=""
                width={20}
                height={20}
                className={`w-5 h-5 rounded-md object-cover border ${gearPickerTabThumbClass(open)} shrink-0`}
                title={item.name}
                data-testid={`gear-category-heading-thumb-${item.id}`}
              />
            ) : (
              <span
                key={item.id}
                className={`w-5 h-5 rounded-md bg-white/20 border ${gearPickerTabThumbClass(open)} shrink-0`}
                title={item.name}
              />
            );
          })}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div
          id={`gear-category-panel-${category}`}
          className={`${
            startOpen ? 'relative mt-2' : 'absolute z-20 left-0 right-0 mt-1 shadow-lg max-h-[26rem] overflow-y-auto'
          } ${GEAR_PICKER_PANEL_CLASS}`}
        >
          <p className="text-sm font-semibold text-[#1F1917]" data-testid={`gear-category-prompt-${category}`}>
            {gearCategorySectionPrompt(category, canUpload && !selectedOnly)}
          </p>
          {items.length === 0 ? (
            <p className="text-sm text-[#3F3832]" data-testid={`gear-category-empty-${category}`}>
              {gearCategorySectionEmptyLabel(category)}
            </p>
          ) : (
            <div
              className={GEAR_SELECT_IMAGE_GRID_CLASS}
              role="group"
              aria-label={label}
              data-testid={`gear-category-grid-${category}`}
            >
              {items.map((item) => {
                const src = srcOf(item);
                const picked = isPicked(store, item.id);
                const comparing = comparingIds.includes(item.id);
                const selectBlocked = canSelect && gearSelectButtonDisabled(store, item.id);
                return (
                  <article
                    key={item.id}
                    className={`rounded-xl border-2 p-2 flex flex-col gap-2 ${
                      picked ? 'border-[#EA580C] bg-[#FFF7ED]' : 'border-[#1F1917] bg-white'
                    }`}
                    data-testid={`gear-category-card-${item.id}`}
                  >
                    <div className="flex flex-col gap-1.5">
                      {canSelect ? (
                        <button
                          type="button"
                          disabled={selectBlocked}
                          aria-pressed={picked}
                          onClick={() => onToggle(item)}
                          className={`min-h-[44px] px-2 rounded-xl text-[11px] font-black uppercase inline-flex items-center justify-center border-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                            picked
                              ? 'bg-[#EA580C] text-white border-[#FDBA74] cursor-pointer'
                              : `${CF_CHIP_OFF} cursor-pointer`
                          }`}
                          data-testid={`gear-category-select-${item.id}`}
                        >
                          {picked ? GEAR_UNSELECT_LABEL : GEAR_SELECT_LABEL}
                        </button>
                      ) : null}
                      {onCompare ? (
                        <button
                          type="button"
                          onClick={() => onCompare(item)}
                          className={`min-h-[44px] px-2 rounded-xl text-[11px] font-black uppercase cursor-pointer inline-flex items-center justify-center border-2 ${
                            comparing
                              ? 'bg-[#EA580C] text-white border-[#FDBA74]'
                              : CF_CHIP_OFF
                          }`}
                          data-testid={`gear-category-compare-${item.id}`}
                        >
                          {GEAR_COMPARE_LABEL}
                        </button>
                      ) : null}
                    </div>
                    <span className="relative inline-flex w-full">
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
                      {picked ? (
                        <span className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-[#EA580C] text-white inline-flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : null}
                    </span>
                    <p className="text-xs font-black uppercase text-[#1F1917] truncate">{item.name}</p>
                  </article>
                );
              })}
            </div>
          )}
          {canUpload && onUpload && !selectedOnly ? (
            <>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                aria-label={`Upload ${label}`}
                data-testid={`gear-category-upload-input-${category}`}
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = '';
                  if (files.length) onUpload(files);
                }}
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className={`${GEAR_PICKER_DONE_CLASS} inline-flex items-center justify-center gap-1.5 disabled:opacity-60`}
                data-testid={`gear-category-upload-${category}`}
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Loading' : `Upload ${label}`}
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={GEAR_PICKER_DONE_CLASS}
            data-testid={`gear-category-done-${category}`}
          >
            {GEAR_DONE_LABEL}
          </button>
        </div>
      ) : null}
    </section>
  );
};
