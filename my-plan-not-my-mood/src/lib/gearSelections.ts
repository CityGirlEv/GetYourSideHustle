import {
  describeFolderImport,
  fileNameFromRelativePath,
  localFolderPathError,
  logoMimeFromName,
  normalizeLocalFolderPath,
  planFolderImport,
  type FolderImportEntry,
} from './localFolder';
import { persistablePreviewUrl, storedPreviewForLoad } from './idbFileStore';
import { reorderKeyedGroups, reorderListByIndex } from './listOrder';
import { merchStyleFamilyFromName, namedMerchStyleFamily } from './merchStyleFamily';
import { MAX_UPLOAD_BYTES, fileTooLargeMessage } from './uploadLimits';
import { cacheBustPublicUrl } from './spaAssets';
import { shopifyHatPageUrl, shopifyHoodiePageUrl, shopifyTeePageUrl } from './shopifyStore';
import {
  BRAND_BUBBLE_ON_CLASS,
  BRAND_TAB_ACTIVE_CLASS,
  BRAND_TAB_BASE_CLASS,
  BRAND_TAB_FILLED_CLASS,
  BRAND_TAB_IDLE_CLASS,
  BRAND_TAB_ROW_CLASS,
} from './brandUi';

export const GEAR_SELECTIONS_STORAGE_KEY = 'myplan_gear_selections_v1';
export const GEAR_SELECTIONS_PATH = '/admin/gear-selections';
export const GEAR_PAGE_LABEL = 'Gear';
export const GEAR_COLLECTIONS_HEADING = 'Tee, Hoodie & Hat Collections';

export const GEAR_CATEGORIES = ['tee', 'hoodie', 'hat'] as const;
export type GearCategory = (typeof GEAR_CATEGORIES)[number];

export const GEAR_CATEGORY_LABELS: Record<GearCategory, string> = {
  tee: 'T-Shirt design',
  hoodie: 'Hoodie',
  hat: 'Hat color',
};

export const GEAR_CATEGORY_SECTION_LABELS: Record<GearCategory, string> = {
  tee: 'T-Shirts',
  hoodie: 'Hoodies',
  hat: 'Hats',
};

export const GEAR_SHOP_HREF: Record<GearCategory, string> = {
  tee: shopifyTeePageUrl(),
  hoodie: shopifyHoodiePageUrl(),
  hat: shopifyHatPageUrl(),
};
export const GEAR_SHOP_PAGE_HREF = '/gear';
export const GEAR_SHOP_LABEL = 'Accountability Gear';

/** Same merch styles as Asset Library, nested under each gear type. */
export const GEAR_STYLES = ['logo', 'tie-dye', 'unisex-fem'] as const;
export type GearStyle = (typeof GEAR_STYLES)[number];

export const GEAR_STYLE_LABELS: Record<GearStyle, string> = {
  logo: 'Logo Style',
  'tie-dye': 'Tie-Dye Style',
  'unisex-fem': 'Unisex/Fem Style',
};

/** Horizontal strip of medium thumbnails; click opens a popup. */
export const GEAR_STYLE_SCROLL_CLASS =
  'flex gap-3 overflow-x-auto snap-x snap-mandatory overscroll-x-contain pb-2 [scrollbar-width:thin]';
export const GEAR_STYLE_CARD_CLASS = 'min-w-0 w-full';
export const GEAR_TEE_CARD_CLASS = GEAR_STYLE_CARD_CLASS;
export const SHOW_ALL_GEAR_LABEL = 'Show all';
export const SHOW_CAROUSEL_GEAR_LABEL = 'Show carousel';
export const GEAR_THUMBS_LABEL = 'Thumbs';
export const GEAR_HIDE_THUMBS_LABEL = 'Hide thumbs';
export const GEAR_MINI_STRIP_CLASS =
  'flex gap-1 overflow-x-auto snap-x snap-mandatory overscroll-x-contain py-0.5 [scrollbar-width:thin]';

export function gearCarouselThumbsStartOpen(): boolean {
  return true;
}
export const GEAR_COLLECTION_SCROLL_CLASS =
  'flex gap-3 overflow-x-auto snap-x snap-mandatory overscroll-x-contain pb-1 [scrollbar-width:thin] scroll-smooth';
export const GEAR_CAROUSEL_MOBILE_VISIBLE = 2;
export const GEAR_CAROUSEL_TABLET_VISIBLE = 3;
export const GEAR_CAROUSEL_DESKTOP_VISIBLE = 4;
export const GEAR_CAROUSEL_TABLET_MQ = '(min-width: 768px)';
export const GEAR_CAROUSEL_DESKTOP_MQ = '(min-width: 1024px)';
export const GEAR_SHOW_ALL_GRID_CLASS = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3';

export type GearCarouselBreakpoint = 'mobile' | 'tablet' | 'desktop';

export function gearCarouselVisibleCount(breakpoint: GearCarouselBreakpoint | boolean): number {
  if (breakpoint === true || breakpoint === 'desktop') return GEAR_CAROUSEL_DESKTOP_VISIBLE;
  if (breakpoint === 'tablet') return GEAR_CAROUSEL_TABLET_VISIBLE;
  return GEAR_CAROUSEL_MOBILE_VISIBLE;
}

export function gearCarouselGridClass(count: number): string {
  if (count >= 4) return 'grid grid-cols-4 gap-3';
  if (count === 3) return 'grid grid-cols-3 gap-3';
  if (count === 2) return 'grid grid-cols-2 gap-3';
  return 'grid grid-cols-1 gap-3';
}

/** Always size slides to the breakpoint slot count so Selected cards match Gear. */
export function gearCarouselTrackClass(visible: number): string {
  return gearCarouselGridClass(Math.max(1, visible));
}

export function gearCarouselSlideClass(visible: number): string {
  const slots = Math.max(1, visible);
  if (slots >= 4) return 'snap-start shrink-0 w-[calc((100%-2.25rem)/4)] min-w-[9.5rem] max-w-[14rem]';
  if (slots === 3) return 'snap-start shrink-0 w-[calc((100%-1.5rem)/3)] min-w-[10rem] max-w-[16rem]';
  if (slots === 2) return 'snap-start shrink-0 w-[calc((100%-0.75rem)/2)] min-w-[11rem] max-w-[18rem]';
  return 'snap-start shrink-0 w-[min(100%,18rem)]';
}

export function clampGearCarouselStart(start: number, count: number, visible: number): number {
  if (count <= 0) return 0;
  const maxStart = Math.max(0, count - Math.max(1, visible));
  return Math.min(Math.max(0, start), maxStart);
}

export function gearCarouselWindow<T>(items: T[], start: number, visible: number): T[] {
  const first = clampGearCarouselStart(start, items.length, visible);
  return items.slice(first, first + Math.max(1, visible));
}

export function gearCarouselPositionLabel(start: number, count: number, visible: number): string {
  if (count <= 0) return '0 of 0';
  const first = clampGearCarouselStart(start, count, visible);
  const last = Math.min(count, first + Math.max(1, visible));
  const from = first + 1;
  return from === last ? `${from} of ${count}` : `${from}–${last} of ${count}`;
}

export function gearStyleCardClass(_category?: GearCategory): string {
  return GEAR_STYLE_CARD_CLASS;
}

/** 3 T-Shirt styles + 3 hat colors = 6 Phase 1 selections. */
export const GEAR_SHIRT_HOODIE_STYLE_LIMIT = 3;
export const GEAR_HAT_COLOR_LIMIT = 3;
export const GEAR_PHASE1_SELECTION_LIMIT = GEAR_SHIRT_HOODIE_STYLE_LIMIT + GEAR_HAT_COLOR_LIMIT;
export const GEAR_PICK_ROLES = ['tee', 'hat'] as const;
export type GearPickRole = (typeof GEAR_PICK_ROLES)[number];
export const GEAR_SHIRT_HOODIE_STYLE_LABEL = 'Shirt & Hoodie Style';
export const GEAR_TSHIRT_STYLE_LABEL = GEAR_SHIRT_HOODIE_STYLE_LABEL;
export const GEAR_SHIRT_HOODIE_LABEL = GEAR_SHIRT_HOODIE_STYLE_LABEL;
export const GEAR_SHIRT_HOODIE_STEP = 1;
export const GEAR_SHIRT_HOODIE_BRAND_STEP_VISIBLE = false;
export const GEAR_SHIRT_HOODIE_BRAND_STEP = 2;
export const GEAR_HAT_COLOR_STEP = 2;

export function gearStepChooseLabel(step: number, label: string): string {
  return `${step}. ${label}`;
}

export const GEAR_SHIRT_HOODIE_CHOOSE_LABEL = gearStepChooseLabel(GEAR_SHIRT_HOODIE_STEP, 'Choose T-Shirt/Hoodie');
export const GEAR_SHIRT_HOODIE_NOTE = 'Pick your Selections Below';
export const GEAR_HAT_COLOR_SELECTED_NOTE = 'These are your selections for Hat color';
export const GEAR_SHIRT_HOODIE_CHANGE_HINT = 'Tap Unselect to remove a style from Selected.';
export const GEAR_SHIRT_HOODIE_EMPTY_LABEL = 'No T-Shirt/Hoodie Style selected.';
export const GEAR_SELECTION_BANNER_CLASS =
  'min-h-[44px] w-full px-3 py-2 rounded-xl bg-[#EA580C] text-white text-sm font-black uppercase tracking-wide border-2 border-[#9A3412] shadow-[0_4px_12px_rgba(234,88,12,0.28)] inline-flex flex-wrap items-center gap-x-2 gap-y-1';

export function gearShirtHoodieSelectionBanner(selectedCount: number): string {
  if (selectedCount <= 0) {
    return `${GEAR_SHIRT_HOODIE_NOTE} · ${GEAR_SHIRT_HOODIE_EMPTY_LABEL}`;
  }
  return GEAR_SHIRT_HOODIE_NOTE;
}

export function gearSelectedCollectionEmptyLabel(id: string, fallback = ''): string {
  return `No ${gearCollectionTabLabel(id, fallback)} selected.`;
}
export const GEAR_HAT_COLOR_EMPTY_LABEL = 'No hat color selected.';
export const GEAR_HAT_COLOR_LABEL = 'Hat color';
export const GEAR_HAT_COLORS_LABEL = 'Hat colors';
export const GEAR_HAT_CHOOSE_LABEL = gearStepChooseLabel(GEAR_HAT_COLOR_STEP, 'Choose Hat Color');
export const GEAR_PHASE1_STEPS = ['style', 'hat'] as const;
export type GearPhase1Step = (typeof GEAR_PHASE1_STEPS)[number];
export const GEAR_PHASE1_DEFAULT_STEP: GearPhase1Step = 'style';

export function toggleGearPhase1Step(
  current: GearPhase1Step | null,
  next: GearPhase1Step,
): GearPhase1Step | null {
  return current === next ? null : next;
}

export function shouldShowGearCollectionTabs(
  step: GearPhase1Step | null,
  canBrowseWithoutStep = false,
): boolean {
  return canBrowseWithoutStep || step === 'style' || step === 'hat';
}

export const GEAR_DONE_LABEL = 'Done';
export const GEAR_HAT_COLOR_PROMPT = 'Choose 3 hat colors';
export const GEAR_MOCKUP_DISCLOSURE_LABEL = 'Disclosure';
export const GEAR_MOCKUP_DISCLOSURE_TITLE = 'Please take notice';
export const GEAR_MOCKUP_DISCLOSURE_BODY =
  'These photos are close — or near close — to the real item. Final mockups will be submitted for approval before production. Shirt and hat brands will be the brands you choose, as they are.';
export const GEAR_MOCKUP_DISCLOSURE_CLASS =
  'relative rounded-lg border-2 border-double border-[#C2410C] bg-[#FFF7ED] px-2.5 py-1.5 space-y-0.5 shadow-[inset_0_0_0_2px_#FFEDD5]';

export function gearMockupDisclosureVisible(selectedOnly = false): boolean {
  return !selectedOnly;
}
export const GEAR_TAB_ROW_CLASS = BRAND_TAB_ROW_CLASS;
export const GEAR_PHASE1_PICKER_ROW_CLASS = GEAR_TAB_ROW_CLASS;
export const GEAR_SELECT_IMAGE_GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-3 gap-3';
export const GEAR_PICKER_TAB_BASE_CLASS = BRAND_TAB_BASE_CLASS;
export const GEAR_PICKER_TAB_IDLE_CLASS = BRAND_TAB_IDLE_CLASS;
export const GEAR_PICKER_TAB_ACTIVE_CLASS = BRAND_TAB_ACTIVE_CLASS;
export const GEAR_PICKER_TAB_FILLED_CLASS = BRAND_TAB_FILLED_CLASS;
export const GEAR_COLLECTION_TAB_ACTIVE_CLASS = GEAR_PICKER_TAB_ACTIVE_CLASS;

export function gearCollectionTabClass(active: boolean, highlighted = false): string {
  if (active) return GEAR_COLLECTION_TAB_ACTIVE_CLASS;
  if (highlighted) return GEAR_PICKER_TAB_FILLED_CLASS;
  return GEAR_PICKER_TAB_IDLE_CLASS;
}

export function gearCollectionTabMetaClass(active?: boolean): string {
  return active ? 'text-white' : 'text-[#C2410C]';
}
export const GEAR_PICKER_BUTTON_CLASS = GEAR_PICKER_TAB_IDLE_CLASS;
export const GEAR_PICKER_DONE_CLASS =
  'min-h-[44px] w-full px-3 rounded-xl border-2 border-[#C2410C] bg-[#C2410C] text-white text-[11px] font-black uppercase cursor-pointer hover:bg-[#9A3412] hover:border-[#9A3412]';
export const GEAR_PICKER_PANEL_CLASS = 'rounded-xl border-2 border-[#C2410C] bg-white p-3 space-y-3';

export function gearPickerTabClass(active: boolean, highlighted = false): string {
  if (active) return GEAR_PICKER_TAB_ACTIVE_CLASS;
  if (highlighted) return GEAR_PICKER_TAB_FILLED_CLASS;
  return GEAR_PICKER_TAB_IDLE_CLASS;
}

export function gearPickerTabThumbClass(_active: boolean): string {
  return 'border-[#1F1917]/25';
}

export function gearCategorySectionHeading(
  category: GearCategory,
  selectedCount: number,
  uploadedCount = selectedCount,
): string {
  return `${GEAR_CATEGORY_SECTION_LABELS[category]} · ${Math.max(0, selectedCount)}/${Math.max(0, uploadedCount)}`;
}

export function gearCategorySectionPrompt(category: GearCategory, canUpload = false): string {
  const label = GEAR_CATEGORY_SECTION_LABELS[category];
  return canUpload ? `Upload ${label} for Angela to pick` : `Pick from ${label}`;
}

export function gearCategorySectionEmptyLabel(category: GearCategory): string {
  return `No ${GEAR_CATEGORY_SECTION_LABELS[category]} uploaded yet.`;
}

export function gearCategoryPickerStartsOpen(count: number, startOpen = false): boolean {
  return gearPickerStartsOpen(count, startOpen);
}

export function gearCategoryUploadKey(category: GearCategory): string {
  return `category-${category}`;
}

export function gearPickerStartsOpen(_count: number, startOpen = false): boolean {
  return startOpen;
}

export function gearHatColorHeading(count: number, limit = GEAR_HAT_COLOR_LIMIT): string {
  return `${GEAR_HAT_CHOOSE_LABEL} · ${Math.max(0, count)}/${limit}`;
}

export function gearHatColorPickerStartsOpen(count: number, startOpen = false): boolean {
  return gearPickerStartsOpen(count, startOpen);
}

export function gearShirtHoodieHeading(count: number, limit = GEAR_SHIRT_HOODIE_STYLE_LIMIT): string {
  return `${GEAR_SHIRT_HOODIE_CHOOSE_LABEL} · ${Math.max(0, count)}/${limit}`;
}

export function gearShirtHoodiePickerStartsOpen(count: number, startOpen = false): boolean {
  return gearPickerStartsOpen(count, startOpen);
}
export const GEAR_PICK_ROLE_LABELS: Record<GearPickRole, string> = {
  tee: GEAR_TSHIRT_STYLE_LABEL,
  hat: GEAR_HAT_COLOR_LABEL,
};
export const GEAR_PICK_AS_PROMPT = 'Use this card as';

export const GEAR_HAT_COLOR_IMAGES = {
  white: cacheBustPublicUrl('/images/apparel_hat_white.png'),
  black: cacheBustPublicUrl('/images/apparel_hat_black.png'),
  red: cacheBustPublicUrl('/images/apparel_hat_red.png'),
  blue: cacheBustPublicUrl('/images/apparel_hat_blue.png'),
  purple: cacheBustPublicUrl('/images/apparel_hat_purple.png'),
} as const;

export const GEAR_HAT_COLOR_IMAGE = GEAR_HAT_COLOR_IMAGES.white;
export const GEAR_HAT_COLOR_GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-3 gap-3';
export const GEAR_HAT_COLOR_IMAGE_CLASS = 'block max-h-56 sm:max-h-64 w-auto max-w-full mx-auto h-auto';
export const GEAR_BRAND_GRID_CLASS = GEAR_SELECT_IMAGE_GRID_CLASS;
export const GEAR_OPTION_CARD_CLASS = 'w-full min-w-0 flex flex-col gap-2 rounded-xl border p-2';
export const GEAR_OPTION_CARD_ON_CLASS = 'border-[#C2410C] bg-[#FFF7ED]';
export const GEAR_OPTION_CARD_OFF_CLASS = 'border-[#E8DFD2] bg-white';
export const GEAR_COMPARE_BRAND_PREFIX = 'brand:';
export const GEAR_COMPARE_HAT_PREFIX = 'hat:';
export const GEAR_COMPARE_STYLE_PREFIX = 'style:';

export function gearBrandCompareId(id: string): string {
  return `${GEAR_COMPARE_BRAND_PREFIX}${id}`;
}

export function gearHatCompareId(id: string): string {
  return `${GEAR_COMPARE_HAT_PREFIX}${id}`;
}

export function gearStyleCompareId(familyId: string): string {
  return `${GEAR_COMPARE_STYLE_PREFIX}${familyId}`;
}

export function parseGearCompareRef(id: string): { kind: 'mockup' | 'brand' | 'hat' | 'style'; id: string } {
  const value = String(id ?? '');
  if (value.startsWith(GEAR_COMPARE_BRAND_PREFIX)) {
    return { kind: 'brand', id: value.slice(GEAR_COMPARE_BRAND_PREFIX.length) };
  }
  if (value.startsWith(GEAR_COMPARE_HAT_PREFIX)) {
    return { kind: 'hat', id: value.slice(GEAR_COMPARE_HAT_PREFIX.length) };
  }
  if (value.startsWith(GEAR_COMPARE_STYLE_PREFIX)) {
    return { kind: 'style', id: value.slice(GEAR_COMPARE_STYLE_PREFIX.length) };
  }
  return { kind: 'mockup', id: value };
}

export function isGearStyleComparing(compareIds: string[], familyId: string): boolean {
  return compareIds.includes(gearStyleCompareId(familyId));
}

export function gearStyleCompareDisabled(compareIds: string[], familyId: string, limit = GEAR_COMPARE_LIMIT): boolean {
  return !isGearStyleComparing(compareIds, familyId) && compareIds.length >= limit;
}

export interface GearCompareViewItem {
  id: string;
  name: string;
  familyLabel: string;
  src?: string;
  swatch?: string;
}

export function resolveGearCompareViewItems(
  mockups: GearMockup[],
  selectedIds: string[],
  srcOf?: (item: GearMockup) => string | undefined,
): GearCompareViewItem[] {
  const byId = new Map(mockups.map((item) => [item.id, item]));
  const items: GearCompareViewItem[] = [];
  for (const raw of selectedIds) {
    const ref = parseGearCompareRef(raw);
    if (ref.kind === 'brand') {
      const brand = gearShirtHoodieBrandOption(ref.id);
      if (brand) {
        items.push({
          id: raw,
          name: brand.label,
          familyLabel: GEAR_SHIRT_HOODIE_BRAND_LABEL,
          swatch: brand.swatch,
        });
      }
      continue;
    }
    if (ref.kind === 'hat') {
      const hat = gearHatColorOption(ref.id);
      if (hat) {
        items.push({
          id: raw,
          name: hat.label,
          familyLabel: GEAR_HAT_COLOR_LABEL,
          src: hat.image,
        });
      }
      continue;
    }
    if (ref.kind === 'style') {
      const thumb =
        mockups.find((item) => item.familyId === ref.id && isShirtHoodieCategory(item.category)) ??
        mockups.find((item) => item.familyId === ref.id);
      if (thumb) {
        items.push({
          id: raw,
          name: thumb.familyLabel,
          familyLabel: GEAR_SHIRT_HOODIE_STYLE_LABEL,
          src: srcOf?.(thumb) ?? thumb.dataUrl,
        });
      }
      continue;
    }
    const mockup = byId.get(ref.id);
    if (mockup) {
      items.push({
        id: raw,
        name: mockup.name,
        familyLabel: mockup.familyLabel,
        src: srcOf?.(mockup) ?? mockup.dataUrl,
      });
    }
  }
  return items;
}

export const GEAR_HAT_COLOR_OPTIONS = [
  { id: 'white', label: 'White', swatch: 'oklch(0.99 0.005 90)', image: GEAR_HAT_COLOR_IMAGES.white },
  { id: 'black', label: 'Black', swatch: 'oklch(0.18 0.01 80)', image: GEAR_HAT_COLOR_IMAGES.black },
  { id: 'red', label: 'Red', swatch: 'oklch(0.52 0.21 27)', image: GEAR_HAT_COLOR_IMAGES.red },
  { id: 'blue', label: 'Blue', swatch: 'oklch(0.45 0.16 255)', image: GEAR_HAT_COLOR_IMAGES.blue },
  { id: 'purple', label: 'Purple', swatch: 'oklch(0.42 0.18 305)', image: GEAR_HAT_COLOR_IMAGES.purple },
] as const;

export type GearHatColorId = (typeof GEAR_HAT_COLOR_OPTIONS)[number]['id'];
export type GearHatColorOption = (typeof GEAR_HAT_COLOR_OPTIONS)[number];

export const GEAR_SHIRT_HOODIE_BRAND_LIMIT = 2;
export const GEAR_SHIRT_HOODIE_BRAND_LABEL = 'Shirt/Hoodie Brand';
export const GEAR_SHIRT_HOODIE_BRANDS_LABEL = 'Shirt/Hoodie brands';
export const GEAR_SHIRT_HOODIE_BRAND_CHOOSE_LABEL = gearStepChooseLabel(
  GEAR_SHIRT_HOODIE_BRAND_STEP,
  'Choose Shirt/Hoodie Brand',
);
export const GEAR_SHIRT_HOODIE_BRAND_PROMPT = 'Choose the blank brand for shirts and hoodies';
export const GEAR_SHIRT_HOODIE_BRAND_SELECTED_NOTE = 'These are your selections for Shirt/Hoodie brand';
export const GEAR_SHIRT_HOODIE_BRAND_EMPTY_LABEL = 'No shirt/hoodie brand selected.';
export const GEAR_BRAND_PRICING_NOTE =
  'Pricing does not include shipping and other nominal fees.';

export const GEAR_SHIRT_HOODIE_BRAND_OPTIONS = [
  { id: 'gildan', label: 'Gildan', swatch: 'oklch(0.38 0.14 25)' },
  { id: 'comfort-colors', label: 'Comfort Colors', swatch: 'oklch(0.55 0.12 55)' },
  { id: 'bella-canvas', label: 'Bella+Canvas', swatch: 'oklch(0.22 0.02 80)' },
  { id: 'next-level', label: 'Next Level', swatch: 'oklch(0.35 0.08 250)' },
  { id: 'independent', label: 'Independent Trading', swatch: 'oklch(0.32 0.03 80)' },
  { id: 'lane-seven', label: 'Lane Seven', swatch: 'oklch(0.42 0.08 130)' },
] as const;

export type GearShirtHoodieBrandId = (typeof GEAR_SHIRT_HOODIE_BRAND_OPTIONS)[number]['id'];
export type GearShirtHoodieBrandOption = (typeof GEAR_SHIRT_HOODIE_BRAND_OPTIONS)[number];

export function isGearShirtHoodieBrandId(value: unknown): value is GearShirtHoodieBrandId {
  return GEAR_SHIRT_HOODIE_BRAND_OPTIONS.some((brand) => brand.id === value);
}

export function gearShirtHoodieBrandOption(id: string): GearShirtHoodieBrandOption | undefined {
  return GEAR_SHIRT_HOODIE_BRAND_OPTIONS.find((brand) => brand.id === id);
}

export function normalizeShirtHoodieBrandIds(raw: unknown): GearShirtHoodieBrandId[] {
  if (!Array.isArray(raw)) return [];
  const ids: GearShirtHoodieBrandId[] = [];
  for (const row of raw) {
    if (!isGearShirtHoodieBrandId(row) || ids.includes(row)) continue;
    ids.push(row);
    if (ids.length >= GEAR_SHIRT_HOODIE_BRAND_LIMIT) break;
  }
  return ids;
}

export function gearShirtHoodieBrandHeading(
  count: number,
  limit = GEAR_SHIRT_HOODIE_BRAND_LIMIT,
): string {
  return `${GEAR_SHIRT_HOODIE_BRAND_CHOOSE_LABEL} · ${Math.max(0, count)}/${limit}`;
}

export function gearShirtHoodieBrandPickerStartsOpen(count: number, startOpen = false): boolean {
  return gearPickerStartsOpen(count, startOpen);
}

export function isGearHatColorId(value: unknown): value is GearHatColorId {
  return GEAR_HAT_COLOR_OPTIONS.some((color) => color.id === value);
}

export function gearHatColorOption(id: string): GearHatColorOption | undefined {
  return GEAR_HAT_COLOR_OPTIONS.find((color) => color.id === id);
}

export function gearHatColorImage(id: string): string {
  return gearHatColorOption(id)?.image ?? GEAR_HAT_COLOR_IMAGE;
}

export function normalizeHatColorIds(raw: unknown): GearHatColorId[] {
  if (!Array.isArray(raw)) return [];
  const ids: GearHatColorId[] = [];
  for (const row of raw) {
    if (!isGearHatColorId(row) || ids.includes(row)) continue;
    ids.push(row);
    if (ids.length >= GEAR_HAT_COLOR_LIMIT) break;
  }
  return ids;
}

export interface GearAngelaPick {
  mockupId: string;
  role: GearPickRole;
}
export const GEAR_NAME_ON_BACK_LABEL = 'Name on the back';
export const GEAR_NAME_ON_BACK_PHASE_LABEL = 'Phase 2 add-on';
export const GEAR_PICK_LIMITS: Record<GearCategory, number> = {
  tee: GEAR_SHIRT_HOODIE_STYLE_LIMIT,
  hoodie: GEAR_SHIRT_HOODIE_STYLE_LIMIT,
  hat: GEAR_HAT_COLOR_LIMIT,
};

export function isShirtHoodieCategory(category: GearCategory): boolean {
  return category === 'tee' || category === 'hoodie';
}

export function isNameOnBackMockup(item: { name?: string; relativePath?: string }): boolean {
  const blob = `${item.name ?? ''} ${item.relativePath ?? ''}`.toLowerCase();
  return (
    /name[- _]?on[- _]?the[- _]?back/.test(blob) ||
    /name[- _]?on[- _]?back/.test(blob) ||
    /nameback/.test(blob)
  );
}

/** Tiny tee crop used on style tabs so they read as t-shirt collections. */
export const GEAR_STYLE_TAB_THUMB_CLASS =
  'w-6 h-6 rounded-md object-cover object-[center_35%] bg-white border border-[#1F1917]/25 shrink-0';
export const GEAR_STYLE_CHOOSE_THUMB_CLASS = GEAR_STYLE_TAB_THUMB_CLASS;
export const GEAR_STYLE_CHOOSE_GRID_CLASS = 'flex flex-wrap gap-1 w-full items-stretch';
export const GEAR_STYLE_CHOOSE_BOX_BASE_CLASS =
  'min-h-[44px] flex-1 basis-[10rem] min-w-[10rem] inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg border-2 text-[10px] leading-tight font-black uppercase tracking-wide cursor-pointer text-center';

export function gearStyleChooseBoxClass(active: boolean, highlighted = false): string {
  if (active) return `${GEAR_STYLE_CHOOSE_BOX_BASE_CLASS} ${BRAND_BUBBLE_ON_CLASS}`;
  if (highlighted) {
    return `${GEAR_STYLE_CHOOSE_BOX_BASE_CLASS} border-[#1F1917] bg-[#FFF7ED] text-[#C2410C]`;
  }
  return `${GEAR_STYLE_CHOOSE_BOX_BASE_CLASS} border-[#1F1917] bg-[#FAF8F5] text-[#3F3832] hover:text-[#C2410C] hover:bg-[#FFF7ED]`;
}

export function gearHeadingRenameVisible(canRename: boolean | undefined): boolean {
  return canRename === true;
}

export function gearStyleTabThumb<T extends { category: GearCategory; name?: string; relativePath?: string }>(
  items: T[],
): T | undefined {
  const usable = items.filter((item) => !isNameOnBackMockup(item));
  return (
    usable.find((item) => item.category === 'tee') ??
    usable.find((item) => isShirtHoodieCategory(item.category)) ??
    usable[0]
  );
}
export const GEAR_SELECT_LABEL = 'Select';
export const GEAR_UNSELECT_LABEL = 'Unselect';
export const GEAR_DELETE_LABEL = 'Delete';
export const GEAR_DUPLICATE_CARD_ERROR = 'That card is already loaded.';

export function gearCardDeleteVisible(canDelete: boolean | undefined): boolean {
  return canDelete === true;
}
export const GEAR_UNSELECT_ALL_LABEL = 'Unselect All';
export const GEAR_COMPARE_LABEL = 'Compare';
export const GEAR_COMPARE_LIMIT = 8;
export const GEAR_COMPARE_UP_TO_LABEL = `Compare up to ${GEAR_COMPARE_LIMIT}`;
export const GEAR_COMPARE_TAB_ID = 'compare';
export const GEAR_SHOW_ALL_TAB_ID = 'show-all';
export const GEAR_SHOW_ALL_TAB_LABEL = 'All Style';
export const GEAR_ALL_STYLES_TAB_ID = 'all';
export const GEAR_ALL_STYLES_TAB_LABEL = 'All Style';
export const GEAR_PINNED_COLLECTION_IDS = ['letters', 'tie-dye'] as const;
export const GEAR_COLLECTION_TAB_LABELS: Record<string, string> = {
  letters: 'Letters/Logo Style',
  'tie-dye': 'Tie-Die Style',
};

export function isDefaultGearCollectionLabel(id: string, label: string): boolean {
  const cleaned = String(label ?? '')
    .replace(/^My Plan\s+/i, '')
    .replace(/\s+Collection$/i, '')
    .trim()
    .toLowerCase();
  if (!cleaned) return true;
  if (id === 'letters') return /^(letters|letters\/logo style|logo style)$/i.test(cleaned);
  if (id === 'tie-dye') return /^(tie[- ]?dye|tie[- ]?die)( style)?$/i.test(cleaned);
  return false;
}

export function gearCollectionTabLabel(id: string, fallback = ''): string {
  const cleaned = fallback.replace(/^My Plan\s+/i, '').replace(/\s+Collection$/i, '').trim();
  if (cleaned && !isDefaultGearCollectionLabel(id, fallback)) return cleaned;
  if (GEAR_COLLECTION_TAB_LABELS[id]) return GEAR_COLLECTION_TAB_LABELS[id];
  return cleaned || fallback || id;
}

export function sortGearStyleFamilies<T extends { id: string; label: string }>(families: T[]): T[] {
  return [...families].sort((a, b) => {
    const order = GEAR_PINNED_COLLECTION_IDS as readonly string[];
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export const GEAR_MOVE_STYLE_LEFT_LABEL = 'Move left';
export const GEAR_MOVE_STYLE_RIGHT_LABEL = 'Move right';
export const GEAR_REORDER_STYLES_HINT = 'Drag a style tab or use the arrows to reorder';

/** Keep saved tab order; pin Letters/Tie-Dye then A–Z for styles that were never arranged. */
export function normalizeGearFamilyOrder(
  order: unknown,
  familyIds: string[],
  labels: Record<string, string> = {},
): string[] {
  const known = [...new Set(familyIds.map((id) => String(id ?? '').trim()).filter(Boolean))];
  if (known.length === 0) return [];
  const knownSet = new Set(known);
  const saved: string[] = [];
  const seen = new Set<string>();
  if (Array.isArray(order)) {
    for (const id of order) {
      if (typeof id !== 'string' || !knownSet.has(id) || seen.has(id)) continue;
      seen.add(id);
      saved.push(id);
    }
  }
  const missing = sortGearStyleFamilies(
    known.filter((id) => !seen.has(id)).map((id) => ({ id, label: labels[id] || id })),
  ).map((family) => family.id);
  return [...saved, ...missing];
}

export function gearFamilyIdList(store: Pick<GearSelectionsStore, 'mockups'>): string[] {
  return [...new Set(store.mockups.map((item) => item.familyId).filter(Boolean))];
}

export function gearFamilyLabelMap(store: Pick<GearSelectionsStore, 'mockups'>): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const item of store.mockups) {
    if (item.familyId && !labels[item.familyId]) labels[item.familyId] = item.familyLabel;
  }
  return labels;
}

export function persistGearFamilyOrder(store: GearSelectionsStore): string[] {
  return normalizeGearFamilyOrder(store.familyOrder, gearFamilyIdList(store), gearFamilyLabelMap(store));
}
export const GEAR_SELECTED_TAB_ID = 'selected';
export const GEAR_SELECTED_TAB_LABEL = 'Selected';
export const GEAR_SAVED_USERS_TAB_ID = 'logged-in-users';
export const GEAR_SAVED_USERS_TAB_LABEL = 'Logged in Users Selection';
export const GEAR_OPEN_SAVED_SELECTION_LABEL = 'Open and update';
export const GEAR_SAVED_USERS_EMPTY_LABEL = 'No logged in user has saved selections yet.';
export const GEAR_SIDE_BY_SIDE_TAB_ID = 'side-by-side';
export const GEAR_SIDE_BY_SIDE_LABEL = 'Side by Side';
export const GEAR_SIDE_BY_SIDE_TAB_TEXT_CLASS = '';
export const GEAR_SIDE_BY_SIDE_BLINK_CLASS = 'animate-gear-tab-blink';
export const GEAR_TAB_HAS_ITEMS_CLASS = GEAR_PICKER_TAB_FILLED_CLASS;

export function gearFilledTabClass(active: boolean, highlighted: boolean): string {
  if (active) return GEAR_PICKER_TAB_ACTIVE_CLASS;
  if (highlighted) return GEAR_TAB_HAS_ITEMS_CLASS;
  return GEAR_PICKER_TAB_IDLE_CLASS;
}

export function gearSideBySideTabBlinks(selectedCount: number, viewingSideBySide = false): boolean {
  return selectedCount >= 2 && !viewingSideBySide;
}

export function gearCompareTabHighlights(compareCount: number, viewingCompare = false): boolean {
  return compareCount > 0 && !viewingCompare;
}

export function gearSelectedTabHighlights(
  shirtHoodieCount: number,
  hatCount: number,
  viewingSelected = false,
  brandCount = 0,
): boolean {
  return (shirtHoodieCount > 0 || hatCount > 0 || brandCount > 0) && !viewingSelected;
}

export function gearCompareResultTabVisible(selectedCount: number, opened = false): boolean {
  return selectedCount >= 2 || (opened && selectedCount > 0);
}
export const GEAR_COMPARE_LIST_TITLE = GEAR_COMPARE_UP_TO_LABEL;
export const GEAR_COMPARE_SELECTED_LABEL = 'Compare';
/** Compare opens this tab for the side-by-side view. */
export const GEAR_COMPARE_RESULT_TAB_ID = GEAR_SIDE_BY_SIDE_TAB_ID;

export function gearCollectionTabIds(
  familyIds: string[],
  includeCompare: boolean,
  showSideBySide = includeCompare,
  includeSelected = false,
  includeShowAll = true,
): string[] {
  const tabs = includeShowAll ? [GEAR_SHOW_ALL_TAB_ID] : [];
  tabs.push(...familyIds);
  if (includeCompare) tabs.push(GEAR_COMPARE_TAB_ID);
  if (includeCompare && showSideBySide) tabs.push(GEAR_SIDE_BY_SIDE_TAB_ID);
  if (includeSelected) tabs.push(GEAR_SELECTED_TAB_ID);
  if (includeSelected) tabs.push(GEAR_SAVED_USERS_TAB_ID);
  return tabs;
}

export function isGearSavedUsersTab(tabId: string | null): boolean {
  return tabId === GEAR_SAVED_USERS_TAB_ID;
}

export function isGearShowAllTab(tabId: string | null): boolean {
  return tabId === GEAR_SHOW_ALL_TAB_ID;
}

export function isGearAllStylesTab(tabId: string | null): boolean {
  return tabId === GEAR_ALL_STYLES_TAB_ID || tabId == null;
}

export function isGearCompareTab(tabId: string | null): boolean {
  return tabId === GEAR_COMPARE_TAB_ID;
}

export function isGearSelectedTab(tabId: string | null): boolean {
  return tabId === GEAR_SELECTED_TAB_ID;
}

export function isGearSideBySideTab(tabId: string | null): boolean {
  return tabId === GEAR_SIDE_BY_SIDE_TAB_ID;
}

export const ALLOWED_MOCKUP_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const MAX_MOCKUP_BYTES = MAX_UPLOAD_BYTES;

export type GearMockupFileInput = {
  name?: string;
  type?: string;
  size?: number;
  webkitRelativePath?: string;
};

export interface GearMockup {
  id: string;
  category: GearCategory;
  style: GearStyle;
  familyId: string;
  familyLabel: string;
  name: string;
  relativePath: string;
  dataUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface GearSavedUserSelection {
  id: string;
  userKey: string;
  userName: string;
  userEmail: string;
  savedAt: string;
  cards: GearAngelaPick[];
  hatColorIds: GearHatColorId[];
  shirtHoodieBrandIds: GearShirtHoodieBrandId[];
}

export interface GearSelectionsStore {
  mockups: GearMockup[];
  picks: GearAngelaPick[];
  hatColorIds: GearHatColorId[];
  shirtHoodieBrandIds: GearShirtHoodieBrandId[];
  familyOrder: string[];
  sourceFolderPath: string;
  savedUserSelections: GearSavedUserSelection[];
}

export function emptyGearSelectionsStore(): GearSelectionsStore {
  return {
    mockups: [],
    picks: [],
    hatColorIds: [],
    shirtHoodieBrandIds: [],
    familyOrder: [],
    sourceFolderPath: '',
    savedUserSelections: [],
  };
}

/** Keep every card from both copies so a newer local upload is not wiped by an older database row. */
export function mergeGearSelectionsStores(
  local: GearSelectionsStore,
  remote: GearSelectionsStore,
): GearSelectionsStore {
  const byId = new Map<string, GearMockup>();
  const localById = new Map(local.mockups.map((item) => [item.id, item]));
  for (const item of remote.mockups) {
    const extra = localById.get(item.id);
    byId.set(item.id, extra
      ? {
          ...extra,
          ...item,
          dataUrl: item.dataUrl || extra.dataUrl,
        }
      : item);
  }
  for (const item of local.mockups) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  const mockups = dedupeGearMockups([...byId.values()]);
  const ids = new Set(mockups.map((item) => item.id));
  const picks = mergeAngelaPicks(remote.picks, local.picks, ids, local.mockups.length > 0);
  const hatColorIds =
    local.mockups.length > 0 || local.hatColorIds.length > 0 ? local.hatColorIds : remote.hatColorIds;
  const shirtHoodieBrandIds =
    local.mockups.length > 0 || (local.shirtHoodieBrandIds?.length ?? 0) > 0
      ? local.shirtHoodieBrandIds
      : remote.shirtHoodieBrandIds;
  return {
    mockups,
    picks,
    hatColorIds: normalizeHatColorIds(hatColorIds),
    shirtHoodieBrandIds: normalizeShirtHoodieBrandIds(shirtHoodieBrandIds),
    familyOrder: normalizeGearFamilyOrder(
      local.familyOrder?.length ? local.familyOrder : remote.familyOrder,
      mockups.map((item) => item.familyId),
      Object.fromEntries(mockups.map((item) => [item.familyId, item.familyLabel])),
    ),
    sourceFolderPath: local.sourceFolderPath || remote.sourceFolderPath,
    savedUserSelections:
      local.savedUserSelections.length > 0 ? local.savedUserSelections : remote.savedUserSelections,
  };
}

export function gearFamilyLabelsChanged(local: GearSelectionsStore, remote: GearSelectionsStore): boolean {
  const remoteById = new Map(remote.mockups.map((item) => [item.id, item]));
  return local.mockups.some((item) => {
    const other = remoteById.get(item.id);
    return Boolean(other && (other.familyId !== item.familyId || other.familyLabel !== item.familyLabel));
  });
}

export function gearFamilyOrderChanged(local: GearSelectionsStore, remote: GearSelectionsStore): boolean {
  return persistGearFamilyOrder(local).join('\0') !== persistGearFamilyOrder(remote).join('\0');
}

export function isGearCategory(value: unknown): value is GearCategory {
  return typeof value === 'string' && (GEAR_CATEGORIES as readonly string[]).includes(value);
}

export function isGearPickRole(value: unknown): value is GearPickRole {
  return value === 'tee' || value === 'hat';
}

export function gearPickKey(pick: GearAngelaPick): string {
  return `${pick.mockupId}:${pick.role}`;
}

export function inferPickRoleFromMockup(mockup: Pick<GearMockup, 'category'>): GearPickRole {
  return mockup.category === 'hat' ? 'hat' : 'tee';
}

export function normalizeAngelaPicks(raw: unknown, mockups: GearMockup[]): GearAngelaPick[] {
  if (!Array.isArray(raw)) return [];
  const byId = new Map(mockups.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const picks: GearAngelaPick[] = [];
  for (const row of raw) {
    if (typeof row === 'string') {
      const mockup = byId.get(row);
      if (!mockup) continue;
      const pick = { mockupId: row, role: inferPickRoleFromMockup(mockup) };
      const key = gearPickKey(pick);
      if (seen.has(key)) continue;
      seen.add(key);
      picks.push(pick);
      continue;
    }
    if (!row || typeof row !== 'object') continue;
    const data = row as Partial<GearAngelaPick>;
    const mockupId = String(data.mockupId ?? '').trim();
    if (!byId.has(mockupId) || !isGearPickRole(data.role)) continue;
    const pick = { mockupId, role: data.role };
    const key = gearPickKey(pick);
    if (seen.has(key)) continue;
    seen.add(key);
    picks.push(pick);
  }
  return picks;
}

export function mergeAngelaPicks(
  remote: GearAngelaPick[],
  local: GearAngelaPick[],
  mockupIds: Set<string>,
  preferLocalPicks = false,
): GearAngelaPick[] {
  const source = preferLocalPicks ? local : [...remote, ...local];
  const seen = new Set<string>();
  const picks: GearAngelaPick[] = [];
  for (const pick of source) {
    if (!mockupIds.has(pick.mockupId)) continue;
    const key = gearPickKey(pick);
    if (seen.has(key)) continue;
    seen.add(key);
    picks.push(pick);
  }
  return picks;
}

export function isGearStyle(value: unknown): value is GearStyle {
  return typeof value === 'string' && (GEAR_STYLES as readonly string[]).includes(value);
}

export function inferGearStyleFromRelativePath(relativePath: string, fallback: GearStyle = 'logo'): GearStyle {
  const blob = String(relativePath ?? '')
    .replace(/\\/g, '/')
    .toLowerCase();
  if (/(^|\/)(tie[-_ ]?dye|tiedye)(\/|$)/.test(blob) || /tie[-_ ]?dye|tiedye/.test(blob)) return 'tie-dye';
  if (/(^|\/)(unisex[-_ ]?fem|unisexfem|unisex|fem)(\/|$)/.test(blob) || /unisex[-_ ]?fem|unisexfem|\bunisex\b|\bfem\b/.test(blob)) {
    return 'unisex-fem';
  }
  if (/(^|\/)(logo|logostyle)(\/|$)/.test(blob) || /\blogo\b/.test(blob)) return 'logo';
  return fallback;
}

export function gearStyleKey(category: GearCategory, style: GearStyle): string {
  return `${category}:${style}`;
}

export function isAllowedMockupMime(type: string): boolean {
  return (ALLOWED_MOCKUP_MIME_TYPES as readonly string[]).includes(type.toLowerCase());
}

export function inferGearCategoryFromRelativePath(relativePath: string, fallback: GearCategory): GearCategory {
  const blob = String(relativePath ?? '')
    .replace(/\\/g, '/')
    .toLowerCase();
  if (/(^|\/)(hoodies?|sweatshirts?)(\/|$)/.test(blob) || /hoodie|sweatshirt/.test(blob)) return 'hoodie';
  if (/(^|\/)(hats?|caps?|beanies?)(\/|$)/.test(blob) || /(?:^|\/|-)(hat|cap|beanie)(?:-|\.|$)/.test(blob)) {
    return 'hat';
  }
  if (/(^|\/)(tees?|t-shirts?|tshirts?|shirts?)(\/|$)/.test(blob) || /t-shirt|tshirt|\btee\b/.test(blob)) {
    return 'tee';
  }
  return fallback;
}

/** Happy path returns null. Each reject path returns a reason. */
export function gearMockupFileError(file: GearMockupFileInput): string | null {
  const name = String(file.name ?? file.webkitRelativePath ?? '').trim();
  const type = logoMimeFromName(name, file.type);
  const size = Number(file.size ?? 0);
  if (!fileNameFromRelativePath(name)) return 'Choose an image file to upload.';
  if (!Number.isFinite(size) || size <= 0) return 'That file is empty.';
  if (!isAllowedMockupMime(type)) return 'Upload a JPEG, PNG, WebP, or GIF mockup.';
  if (size > MAX_MOCKUP_BYTES) return fileTooLargeMessage('Mockups');
  return null;
}

export function setGearSourceFolderPath(
  store: GearSelectionsStore,
  rawPath: string,
): { store: GearSelectionsStore; error?: string } {
  const value = normalizeLocalFolderPath(rawPath);
  if (!value) return { store: { ...store, sourceFolderPath: '' } };
  const error = localFolderPathError(value);
  if (error) return { store, error };
  return { store: { ...store, sourceFolderPath: value } };
}

export function isImageDataUrl(value: string): boolean {
  return /^data:image\/(jpeg|png|webp|gif);base64,/i.test(value);
}

export function isImagePreviewUrl(value: string): boolean {
  return isImageDataUrl(value) || /^blob:/i.test(value);
}

export function mockupsInCategory(store: GearSelectionsStore, category: GearCategory): GearMockup[] {
  return store.mockups.filter((item) => item.category === category);
}

export function gearHatPreviewSrc(
  store?: GearSelectionsStore,
  _srcOf?: (item: GearMockup) => string | undefined,
): string {
  const first = store ? pickedHatColorIds(store)[0] : undefined;
  return first ? gearHatColorImage(first) : GEAR_HAT_COLOR_IMAGE;
}

export function mockupsInCategoryStyle(
  store: GearSelectionsStore,
  category: GearCategory,
  style: GearStyle,
): GearMockup[] {
  return store.mockups.filter((item) => item.category === category && item.style === style);
}

export function mockupsInStyleFamily(store: GearSelectionsStore, familyId: string): GearMockup[] {
  return store.mockups.filter((item) => item.familyId === familyId);
}

export function gearStyleFamilies(
  store: GearSelectionsStore,
): Array<{ id: string; label: string; items: GearMockup[] }> {
  const groups = new Map<string, { id: string; label: string; items: GearMockup[] }>();
  for (const item of store.mockups) {
    const current = groups.get(item.familyId);
    if (current) current.items.push(item);
    else groups.set(item.familyId, { id: item.familyId, label: item.familyLabel, items: [item] });
  }
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function orderedGearStyleFamilies(
  store: GearSelectionsStore,
): Array<{ id: string; label: string; items: GearMockup[] }> {
  const families = gearStyleFamilies(store);
  const order = normalizeGearFamilyOrder(
    store.familyOrder,
    families.map((family) => family.id),
    Object.fromEntries(families.map((family) => [family.id, family.label])),
  );
  const byId = new Map(families.map((family) => [family.id, family]));
  return order.flatMap((id) => {
    const family = byId.get(id);
    return family ? [family] : [];
  });
}

export function resolveActiveCollectionId(
  familyIds: string[],
  currentId: string | null,
): string | null {
  if (!familyIds.length) return null;
  if (currentId && familyIds.includes(currentId)) return currentId;
  return familyIds[0] ?? null;
}

/** Cards for the open collection tab — one style only, unless All Style is selected. */
export function itemsForGearCollectionTab<T extends { id: string }>(
  families: Array<{ id: string; items: T[] }>,
  tabId: string | null,
): T[] {
  if (isGearShowAllTab(tabId) || isGearAllStylesTab(tabId)) {
    return families.flatMap((family) => family.items);
  }
  if (
    !tabId ||
    isGearCompareTab(tabId) ||
    isGearSideBySideTab(tabId) ||
    isGearSelectedTab(tabId) ||
    isGearSavedUsersTab(tabId)
  ) {
    return [];
  }
  return families.find((family) => family.id === tabId)?.items ?? [];
}

export function reorderGearMockupsInFamily(
  store: GearSelectionsStore,
  familyId: string,
  fromIndex: number,
  toIndex: number,
): GearSelectionsStore {
  return {
    ...store,
    mockups: reorderKeyedGroups(store.mockups, familyId, (item) => item.familyId, fromIndex, toIndex),
  };
}

export function reorderGearStyleFamilies(
  store: GearSelectionsStore,
  fromIndex: number,
  toIndex: number,
): GearSelectionsStore {
  const ids = orderedGearStyleFamilies(store).map((family) => family.id);
  const next = reorderListByIndex(ids, fromIndex, toIndex);
  if (next === ids) return store;
  return { ...store, familyOrder: next };
}

export function moveGearStyleFamily(
  store: GearSelectionsStore,
  familyId: string,
  delta: number,
): GearSelectionsStore {
  const ids = orderedGearStyleFamilies(store).map((family) => family.id);
  const from = ids.indexOf(familyId);
  if (from < 0 || delta === 0) return store;
  return reorderGearStyleFamilies(store, from, from + delta);
}

export function reorderGearStyleFamilyById(
  store: GearSelectionsStore,
  fromId: string,
  toId: string,
): GearSelectionsStore {
  if (fromId === toId) return store;
  const ids = orderedGearStyleFamilies(store).map((family) => family.id);
  const from = ids.indexOf(fromId);
  const to = ids.indexOf(toId);
  if (from < 0 || to < 0) return store;
  return reorderGearStyleFamilies(store, from, to);
}

export function moveGearMockup(
  store: GearSelectionsStore,
  mockupId: string,
  toFamilyId: string,
): { store: GearSelectionsStore; error?: string } {
  const mockup = store.mockups.find((item) => item.id === mockupId);
  if (!mockup) return { store, error: 'That card is not on the list.' };
  const dest = gearStyleFamilies(store).find((family) => family.id === toFamilyId);
  if (!dest) return { store, error: 'Choose a style to move this card to.' };
  if (mockup.familyId === dest.id) return { store };
  return {
    store: {
      ...store,
      mockups: store.mockups.map((item) =>
        item.id === mockupId ? { ...item, familyId: dest.id, familyLabel: dest.label } : item,
      ),
    },
  };
}

export function pickedMockupIds(store: GearSelectionsStore): string[] {
  return [...new Set(store.picks.map((pick) => pick.mockupId))];
}

export function pickedRoles(store: GearSelectionsStore, mockupId: string): GearPickRole[] {
  return store.picks.filter((pick) => pick.mockupId === mockupId).map((pick) => pick.role);
}

export function pickedMockups(store: GearSelectionsStore): GearMockup[] {
  const byId = new Map(store.mockups.map((item) => [item.id, item]));
  return pickedMockupIds(store)
    .map((id) => byId.get(id))
    .filter((item): item is GearMockup => Boolean(item));
}

export function pickedMockupsForRole(store: GearSelectionsStore, role: GearPickRole): GearMockup[] {
  const byId = new Map(store.mockups.map((item) => [item.id, item]));
  return store.picks
    .filter((pick) => pick.role === role)
    .map((pick) => byId.get(pick.mockupId))
    .filter((item): item is GearMockup => Boolean(item));
}

export function picksInCategory(store: GearSelectionsStore, category: GearCategory): GearMockup[] {
  return pickedMockups(store).filter((item) => item.category === category);
}

export function shirtHoodieMockupsInFamily(store: GearSelectionsStore, familyId: string): GearMockup[] {
  return store.mockups.filter(
    (item) =>
      item.familyId === familyId && isShirtHoodieCategory(item.category) && !isNameOnBackMockup(item),
  );
}

export function pickedShirtHoodieFamilyIds(store: GearSelectionsStore): string[] {
  const ids: string[] = [];
  for (const item of pickedMockups(store)) {
    if (!isShirtHoodieCategory(item.category) || isNameOnBackMockup(item) || ids.includes(item.familyId)) {
      continue;
    }
    ids.push(item.familyId);
  }
  return ids;
}

export function pickedShirtHoodieMockups(store: GearSelectionsStore): GearMockup[] {
  return pickedMockupsForRole(store, 'tee').filter((item) => !isNameOnBackMockup(item));
}

export function pickedShirtHoodieCount(store: GearSelectionsStore): number {
  return pickedShirtHoodieMockups(store).length;
}

export function pickedShirtHoodieStyleCount(store: GearSelectionsStore): number {
  return pickedShirtHoodieFamilyIds(store).length;
}

export function isShirtHoodieFamilyPicked(store: GearSelectionsStore, familyId: string): boolean {
  return pickedShirtHoodieFamilyIds(store).includes(familyId);
}

export function gearSelectAtLimit(store: GearSelectionsStore): boolean {
  return pickedShirtHoodieStyleCount(store) >= GEAR_SHIRT_HOODIE_STYLE_LIMIT;
}

export function gearCollectionSelectDisabled(store: GearSelectionsStore, familyId: string): boolean {
  return !isShirtHoodieFamilyPicked(store, familyId) && gearSelectAtLimit(store);
}

export function gearSelectButtonDisabled(store: GearSelectionsStore, mockupId: string): boolean {
  const mockup = store.mockups.find((item) => item.id === mockupId);
  if (!mockup) return true;
  if (isPicked(store, mockupId) || isShirtHoodieFamilyPicked(store, mockup.familyId)) return false;
  return gearSelectAtLimit(store);
}

export function sortGearMockupsSelectedFirst<T extends { id: string }>(
  items: T[],
  pickedIds: Iterable<string>,
): T[] {
  const picked = new Set(pickedIds);
  const selected: T[] = [];
  const rest: T[] = [];
  for (const item of items) {
    if (picked.has(item.id)) selected.push(item);
    else rest.push(item);
  }
  return [...selected, ...rest];
}

export function shirtHoodieStyleChoices(
  store: GearSelectionsStore,
): Array<{ id: string; label: string; items: GearMockup[]; thumb?: GearMockup }> {
  return orderedGearStyleFamilies(store)
    .map((family) => {
      const items = shirtHoodieMockupsInFamily(store, family.id);
      return { id: family.id, label: family.label, items, thumb: items[0] };
    })
    .filter((family) => family.items.length > 0);
}

export function pickedMockupsInFamily(store: GearSelectionsStore, familyId: string): GearMockup[] {
  return pickedMockups(store).filter(
    (item) => item.familyId === familyId && !isNameOnBackMockup(item),
  );
}

export function pickedShirtHoodieStyles(store: GearSelectionsStore) {
  const pickedIds = new Set(pickedShirtHoodieMockups(store).map((item) => item.id));
  return shirtHoodieStyleChoices(store)
    .map((family) => {
      const items = family.items.filter((item) => pickedIds.has(item.id));
      return { ...family, items, thumb: items[0] };
    })
    .filter((family) => family.items.length > 0);
}

export function toggleShirtHoodieStyle(
  store: GearSelectionsStore,
  familyId: string,
): { store: GearSelectionsStore; error?: string } {
  const items = shirtHoodieMockupsInFamily(store, familyId);
  if (items.length === 0) return { store, error: 'That style has no Shirt & Hoodie cards.' };
  const ids = new Set(items.map((item) => item.id));
  if (pickedShirtHoodieFamilyIds(store).includes(familyId)) {
    return { store: { ...store, picks: store.picks.filter((pick) => !ids.has(pick.mockupId)) } };
  }
  if (gearSelectAtLimit(store)) {
    return {
      store,
      error: `Angela can pick up to ${GEAR_SHIRT_HOODIE_STYLE_LIMIT} ${GEAR_SHIRT_HOODIE_STYLE_LABEL}s.`,
    };
  }
  const picks = [...store.picks];
  for (const item of items) {
    if (!picks.some((pick) => pick.mockupId === item.id && pick.role === 'tee')) {
      picks.push({ mockupId: item.id, role: 'tee' });
    }
  }
  return { store: { ...store, picks } };
}

export function pickedHatColorIds(store: GearSelectionsStore): GearHatColorId[] {
  return normalizeHatColorIds(store.hatColorIds);
}

export function pickedHatColorOptions(store: GearSelectionsStore): GearHatColorOption[] {
  return pickedHatColorIds(store)
    .map((id) => gearHatColorOption(id))
    .filter((color): color is GearHatColorOption => Boolean(color));
}

export function addHatColor(
  store: GearSelectionsStore,
  colorId: string,
): { store: GearSelectionsStore; error?: string } {
  if (!isGearHatColorId(colorId)) return { store, error: 'Choose a hat color from the list.' };
  const current = pickedHatColorIds(store);
  if (current.includes(colorId)) return { store };
  if (current.length >= GEAR_HAT_COLOR_LIMIT) {
    return { store, error: `Angela can pick up to ${GEAR_HAT_COLOR_LIMIT} ${GEAR_HAT_COLORS_LABEL}.` };
  }
  return { store: { ...store, hatColorIds: [...current, colorId] } };
}

export function removeHatColor(store: GearSelectionsStore, colorId: string): GearSelectionsStore {
  return { ...store, hatColorIds: pickedHatColorIds(store).filter((id) => id !== colorId) };
}

export function pickedShirtHoodieBrandIds(store: GearSelectionsStore): GearShirtHoodieBrandId[] {
  return normalizeShirtHoodieBrandIds(store.shirtHoodieBrandIds);
}

export function pickedShirtHoodieBrandOptions(store: GearSelectionsStore): GearShirtHoodieBrandOption[] {
  return pickedShirtHoodieBrandIds(store)
    .map((id) => gearShirtHoodieBrandOption(id))
    .filter((brand): brand is GearShirtHoodieBrandOption => Boolean(brand));
}

export function addShirtHoodieBrand(
  store: GearSelectionsStore,
  brandId: string,
): { store: GearSelectionsStore; error?: string } {
  if (!isGearShirtHoodieBrandId(brandId)) return { store, error: 'Choose a shirt/hoodie brand from the list.' };
  const current = pickedShirtHoodieBrandIds(store);
  if (current.includes(brandId)) return { store };
  if (current.length >= GEAR_SHIRT_HOODIE_BRAND_LIMIT) {
    return { store, error: `Angela can pick up to ${GEAR_SHIRT_HOODIE_BRAND_LIMIT} ${GEAR_SHIRT_HOODIE_BRANDS_LABEL}.` };
  }
  return { store: { ...store, shirtHoodieBrandIds: [...current, brandId] } };
}

export function removeShirtHoodieBrand(store: GearSelectionsStore, brandId: string): GearSelectionsStore {
  return {
    ...store,
    shirtHoodieBrandIds: pickedShirtHoodieBrandIds(store).filter((id) => id !== brandId),
  };
}

export function pickedHatColors(store: GearSelectionsStore): GearMockup[] {
  return pickedMockupsForRole(store, 'hat').filter((item) => !isNameOnBackMockup(item));
}

export function angelaPickRoleLabel(store: GearSelectionsStore, mockupId: string): string {
  return pickedRoles(store, mockupId)
    .map((role) => GEAR_PICK_ROLE_LABELS[role])
    .join(' · ');
}

export function gearPhase1SelectionCount(store: GearSelectionsStore): number {
  return pickedShirtHoodieCount(store) + pickedHatColorIds(store).length;
}

export function filterGearCompareItems(mockups: GearMockup[], selectedIds: string[]): GearMockup[] {
  const order = new Map(selectedIds.map((id, index) => [id, index]));
  return mockups
    .filter((item) => order.has(item.id))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export function isPicked(store: GearSelectionsStore, mockupId: string, role?: GearPickRole): boolean {
  if (role) return store.picks.some((pick) => pick.mockupId === mockupId && pick.role === role);
  return store.picks.some((pick) => pick.mockupId === mockupId);
}

export function gearMockupNameKey(name: string): string {
  return fileNameFromRelativePath(String(name ?? ''))
    .replace(/\.[^.]+$/, '')
    .trim()
    .toLowerCase();
}

export function gearMockupDuplicateKeys(item: {
  name: string;
  familyId?: string;
  relativePath?: string;
}): string[] {
  const family = String(item.familyId ?? '').trim().toLowerCase();
  const name = gearMockupNameKey(item.name);
  const path = String(item.relativePath ?? '')
    .replace(/\\/g, '/')
    .trim()
    .toLowerCase();
  const keys = name ? [`${family}|name:${name}`] : [];
  if (path) keys.push(`${family}|path:${path}`);
  return keys;
}

export function findDuplicateGearMockup(
  mockups: GearMockup[],
  candidate: { id?: string; name: string; familyId?: string; relativePath?: string },
): GearMockup | undefined {
  const candidateId = String(candidate.id ?? '').trim();
  const candidateKeys = new Set(gearMockupDuplicateKeys(candidate));
  return mockups.find((item) => {
    if (candidateId && item.id === candidateId) return true;
    return gearMockupDuplicateKeys(item).some((key) => candidateKeys.has(key));
  });
}

export function dedupeGearMockups(mockups: GearMockup[]): GearMockup[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const kept: GearMockup[] = [];
  for (const item of mockups) {
    if (seenIds.has(item.id)) continue;
    const keys = gearMockupDuplicateKeys(item);
    if (keys.some((key) => seenKeys.has(key))) continue;
    seenIds.add(item.id);
    keys.forEach((key) => seenKeys.add(key));
    kept.push(item);
  }
  return kept;
}

export function canPickAnother(store: GearSelectionsStore, slot: GearPickRole | GearCategory): boolean {
  const role: GearPickRole = slot === 'hat' ? 'hat' : 'tee';
  if (role === 'hat') return pickedHatColorIds(store).length < GEAR_HAT_COLOR_LIMIT;
  return !gearSelectAtLimit(store);
}

export function addGearMockup(
  store: GearSelectionsStore,
  input: {
    id?: string;
    category: GearCategory;
    style?: GearStyle | null;
    familyId?: string;
    familyLabel?: string;
    name: string;
    relativePath?: string;
    dataUrl: string;
    uploadedBy?: string;
    uploadedAt?: string;
  },
): { store: GearSelectionsStore; error?: string; mockup?: GearMockup } {
  if (!isGearCategory(input.category)) {
    return { store, error: 'Choose T-Shirt, Hoodie, or Hat.' };
  }
  const name = input.name.trim();
  if (!name) return { store, error: 'Name the mockup.' };
  if (!isImagePreviewUrl(input.dataUrl)) {
    return { store, error: 'Upload a JPEG, PNG, WebP, or GIF mockup.' };
  }
  const relativePath = (input.relativePath ?? '').trim();
  const style = isGearStyle(input.style)
    ? input.style
    : inferGearStyleFromRelativePath(`${relativePath} ${name}`);
  const family = merchStyleFamilyFromName(name, relativePath);
  const familyId = input.familyId?.trim() || family.familyId;
  const familyLabel = input.familyLabel?.trim() || family.familyLabel;
  const duplicate = findDuplicateGearMockup(store.mockups, {
    id: input.id,
    name,
    familyId,
    relativePath,
  });
  if (duplicate) {
    return { store, error: GEAR_DUPLICATE_CARD_ERROR };
  }
  const mockup: GearMockup = {
    id: input.id?.trim() || `gear-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category: input.category,
    style,
    familyId,
    familyLabel,
    name,
    relativePath,
    dataUrl: input.dataUrl,
    uploadedAt: input.uploadedAt || new Date().toISOString(),
    uploadedBy: (input.uploadedBy || 'Evelyn').trim() || 'Evelyn',
  };
  const next: GearSelectionsStore = {
    ...store,
    mockups: [mockup, ...store.mockups],
  };
  return { store: next, mockup };
}

/** One image per style — a new upload replaces the current card on that pedestal. */
export function setGearStyleMockup(
  store: GearSelectionsStore,
  input: Parameters<typeof addGearMockup>[1],
): { store: GearSelectionsStore; error?: string; mockup?: GearMockup; replaced?: boolean } {
  const result = addGearMockup(store, input);
  if (result.error || !result.mockup) return result;
  const familyId = result.mockup.familyId;
  const replaced = store.mockups.some((item) => item.familyId === familyId);
  const removedIds = new Set(
    store.mockups.filter((item) => item.familyId === familyId && item.id !== result.mockup!.id).map((item) => item.id),
  );
  return {
    store: {
      ...result.store,
      mockups: result.store.mockups.filter((item) => item.familyId !== familyId || item.id === result.mockup!.id),
      picks: result.store.picks.filter((pick) => !removedIds.has(pick.mockupId)),
    },
    mockup: result.mockup,
    replaced,
  };
}

export function addGearMockupsFromEntries(
  store: GearSelectionsStore,
  entries: Array<{
    id?: string;
    name: string;
    relativePath?: string;
    dataUrl: string;
    category?: GearCategory | null;
    style?: GearStyle | null;
    familyId?: string;
    familyLabel?: string;
  }>,
  fallbackCategory: GearCategory,
  uploadedBy: string,
): { store: GearSelectionsStore; added: number; skipped: number; notice: string; error?: string } {
  let next = store;
  let added = 0;
  let skipped = 0;
  let error: string | undefined;
  for (const entry of entries) {
    const relativePath = entry.relativePath || entry.name;
    const category = isGearCategory(entry.category)
      ? entry.category
      : inferGearCategoryFromRelativePath(relativePath, fallbackCategory);
    const style = isGearStyle(entry.style)
      ? entry.style
      : inferGearStyleFromRelativePath(`${relativePath} ${entry.name}`);
    const result = addGearMockup(next, {
      id: entry.id,
      category,
      style,
      familyId: entry.familyId,
      familyLabel: entry.familyLabel,
      name: fileNameFromRelativePath(entry.name).replace(/\.[^.]+$/, '') || entry.name,
      relativePath,
      dataUrl: entry.dataUrl,
      uploadedBy,
    });
    if (result.error) {
      skipped += 1;
      error = result.error;
      continue;
    }
    next = result.store;
    added += 1;
  }
  return { store: next, added, skipped, notice: describeFolderImport(added, skipped, 'mockup'), error };
}

export function planGearFolderFiles(entries: FolderImportEntry[]): ReturnType<typeof planFolderImport> {
  return planFolderImport(entries, { maxBytes: MAX_MOCKUP_BYTES, allowSvg: false });
}

export function renameGearStyleFamily(
  store: GearSelectionsStore,
  familyId: string,
  label: string,
): { store: GearSelectionsStore; error?: string } {
  const named = namedMerchStyleFamily(label);
  if ('error' in named) return { store, error: named.error };
  if (!store.mockups.some((item) => item.familyId === familyId)) {
    return { store, error: 'That style is not on the list.' };
  }
  return {
    store: {
      ...store,
      mockups: store.mockups.map((item) =>
        item.familyId === familyId
          ? { ...item, familyId: named.family.familyId, familyLabel: named.family.familyLabel }
          : item,
      ),
    },
  };
}

export function renameGearMockup(
  store: GearSelectionsStore,
  mockupId: string,
  name: string,
): { store: GearSelectionsStore; error?: string } {
  const nextName = name.trim();
  if (!nextName) return { store, error: 'Name this card.' };
  if (nextName.length > 80) return { store, error: 'Card names must be 80 characters or fewer.' };
  if (!store.mockups.some((item) => item.id === mockupId)) {
    return { store, error: 'That card is not on the list.' };
  }
  return {
    store: {
      ...store,
      mockups: store.mockups.map((item) => (item.id === mockupId ? { ...item, name: nextName } : item)),
    },
  };
}

export function removeGearMockup(store: GearSelectionsStore, mockupId: string): GearSelectionsStore {
  return {
    ...store,
    mockups: store.mockups.filter((item) => item.id !== mockupId),
    picks: store.picks.filter((pick) => pick.mockupId !== mockupId),
  };
}

export function toggleAngelaPick(
  store: GearSelectionsStore,
  mockupId: string,
  role?: GearPickRole,
): { store: GearSelectionsStore; error?: string } {
  const mockup = store.mockups.find((item) => item.id === mockupId);
  if (!mockup) return { store, error: 'That mockup is not on the list.' };
  if (isNameOnBackMockup(mockup)) {
    return { store, error: `${GEAR_NAME_ON_BACK_LABEL} is a ${GEAR_NAME_ON_BACK_PHASE_LABEL}.` };
  }
  if (!role || role === 'hat') {
    if (!isPicked(store, mockupId)) {
      return { store, error: `Choose ${GEAR_TSHIRT_STYLE_LABEL}. Hat colors are picked from the dropdown.` };
    }
    return { store: { ...store, picks: store.picks.filter((pick) => pick.mockupId !== mockupId) } };
  }
  if (isPicked(store, mockupId, role)) {
    return { store: { ...store, picks: store.picks.filter((pick) => !(pick.mockupId === mockupId && pick.role === role)) } };
  }
  if (!isShirtHoodieFamilyPicked(store, mockup.familyId) && !canPickAnother(store, role)) {
    return {
      store,
      error: `Select up to ${GEAR_SHIRT_HOODIE_STYLE_LIMIT} ${GEAR_SHIRT_HOODIE_STYLE_LABEL}s.`,
    };
  }
  return { store: { ...store, picks: [...store.picks, { mockupId, role }] } };
}

export function angelaPickSummary(store: GearSelectionsStore): string {
  const styles = pickedShirtHoodieStyleCount(store);
  const hats = pickedHatColorIds(store).length;
  const brands = pickedShirtHoodieBrandIds(store).length;
  return `${styles}/${GEAR_SHIRT_HOODIE_STYLE_LIMIT} ${GEAR_SHIRT_HOODIE_STYLE_LABEL}s · ${hats}/${GEAR_HAT_COLOR_LIMIT} ${GEAR_HAT_COLORS_LABEL} · ${brands}/${GEAR_SHIRT_HOODIE_BRAND_LIMIT} ${GEAR_SHIRT_HOODIE_BRANDS_LABEL}`;
}

export function clearAngelaPicks(store: GearSelectionsStore): GearSelectionsStore {
  if (store.picks.length === 0 && store.hatColorIds.length === 0 && (store.shirtHoodieBrandIds?.length ?? 0) === 0) {
    return store;
  }
  return { ...store, picks: [], hatColorIds: [], shirtHoodieBrandIds: [] };
}

export function normalizeGearSelectionsStore(raw: unknown): GearSelectionsStore {
  if (!raw || typeof raw !== 'object') return emptyGearSelectionsStore();
  const data = raw as Partial<GearSelectionsStore>;
  const mockups = Array.isArray(data.mockups)
    ? data.mockups.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const row = item as Partial<GearMockup>;
        if (!isGearCategory(row.category)) return [];
        if (!row.id || !row.name) return [];
        const rawPreview = String(row.dataUrl ?? '');
        if (rawPreview && !isImagePreviewUrl(rawPreview)) return [];
        const relativePath = String(row.relativePath ?? '');
        const family = merchStyleFamilyFromName(String(row.name), relativePath);
        return [
          {
            id: String(row.id),
            category: row.category,
            style: isGearStyle(row.style)
              ? row.style
              : inferGearStyleFromRelativePath(`${relativePath} ${row.name}`),
            familyId: String(row.familyId || family.familyId),
            familyLabel: String(row.familyLabel || family.familyLabel),
            name: String(row.name),
            relativePath,
            dataUrl: storedPreviewForLoad(rawPreview),
            uploadedAt: String(row.uploadedAt ?? ''),
            uploadedBy: String(row.uploadedBy ?? 'Evelyn'),
          },
        ];
      })
    : [];
  const rawPicks = data.picks as unknown;
  const wrappedPicks =
    rawPicks && typeof rawPicks === 'object' && !Array.isArray(rawPicks)
      ? (rawPicks as {
          cards?: unknown;
          hatColorIds?: unknown;
          shirtHoodieBrandIds?: unknown;
          familyOrder?: unknown;
          savedUserSelections?: unknown;
        })
      : null;
  const picks = normalizeAngelaPicks(wrappedPicks ? wrappedPicks.cards : rawPicks, mockups);
  const hatColorIds = normalizeHatColorIds(wrappedPicks?.hatColorIds ?? data.hatColorIds);
  const shirtHoodieBrandIds = normalizeShirtHoodieBrandIds(
    wrappedPicks?.shirtHoodieBrandIds ?? data.shirtHoodieBrandIds,
  );
  const pathValue = typeof data.sourceFolderPath === 'string' ? normalizeLocalFolderPath(data.sourceFolderPath) : '';
  const sourceFolderPath = pathValue && !localFolderPathError(pathValue) ? pathValue : '';
  const savedUserSelections = Array.isArray(data.savedUserSelections)
    ? data.savedUserSelections
    : Array.isArray(wrappedPicks?.savedUserSelections)
      ? wrappedPicks.savedUserSelections
      : [];
  const normalizedMockups = dedupeGearMockups(mockups);
  const familyOrder = normalizeGearFamilyOrder(
    Array.isArray(data.familyOrder) ? data.familyOrder : wrappedPicks?.familyOrder,
    normalizedMockups.map((item) => item.familyId),
    Object.fromEntries(normalizedMockups.map((item) => [item.familyId, item.familyLabel])),
  );
  return {
    mockups: normalizedMockups,
    picks,
    hatColorIds,
    shirtHoodieBrandIds,
    familyOrder,
    sourceFolderPath,
    savedUserSelections: savedUserSelections.filter(
      (row): row is GearSavedUserSelection => Boolean(row && typeof row === 'object'),
    ),
  };
}

export function persistGearSelectionsStore(store: GearSelectionsStore): GearSelectionsStore {
  return {
    ...store,
    hatColorIds: pickedHatColorIds(store),
    shirtHoodieBrandIds: pickedShirtHoodieBrandIds(store),
    familyOrder: persistGearFamilyOrder(store),
    mockups: dedupeGearMockups(store.mockups).map((item) => ({
      ...item,
      dataUrl: persistablePreviewUrl(item.dataUrl) ?? '',
    })),
  };
}

export function persistAngelaPickMeta(store: GearSelectionsStore): {
  cards: GearAngelaPick[];
  hatColorIds: GearHatColorId[];
  shirtHoodieBrandIds: GearShirtHoodieBrandId[];
  familyOrder: string[];
} {
  return {
    cards: store.picks,
    hatColorIds: pickedHatColorIds(store),
    shirtHoodieBrandIds: pickedShirtHoodieBrandIds(store),
    familyOrder: persistGearFamilyOrder(store),
  };
}
