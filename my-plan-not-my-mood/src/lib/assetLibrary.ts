import { ACCESSORY_PHASE2_ITEM_LABELS, accessoriesPhase2Summary } from './accessories';
import { BRAND_TAB_ACTIVE_CLASS, BRAND_TAB_BASE_CLASS, BRAND_TAB_IDLE_CLASS, brandTabClass, brandTabMetaClass } from './brandUi';
import {
  ALLOWED_MOCKUP_MIME_TYPES,
  GEAR_COMPARE_LIMIT,
  MAX_MOCKUP_BYTES,
  isAllowedMockupMime,
  isImageDataUrl,
  renameGearStyleFamily,
  type GearSelectionsStore,
} from './gearSelections';
import { merchStyleFamilyFromName, namedMerchStyleFamily } from './merchStyleFamily';
import { fileTooLargeMessage } from './uploadLimits';
import { persistablePreviewUrl, storedPreviewForLoad } from './idbFileStore';
import { reorderKeyedGroups } from './listOrder';
import { logoMimeFromName } from './localFolder';

export const ASSET_LIBRARY_STORAGE_KEY = 'myplan_asset_library_v1';
export const ASSET_LIBRARY_STYLE_STORAGE_KEY = 'myplan_asset_library_styles_v1';
export const ASSET_LIBRARY_PATH = '/admin/asset-library';
export const ASSET_LIBRARY_LOGOS_TAB = 'logo-concepts' as const;
export const ASSET_LIBRARY_LOGOS_LABEL = 'Logos';

export const ASSET_LIBRARY_SHOW_ALL_TAB_ID = 'show-all';
export const ASSET_LIBRARY_SHOW_ALL_LABEL = 'Show All';

export const ASSET_LIBRARY_HUB_SECTIONS = [
  {
    id: 'show-all',
    label: ASSET_LIBRARY_SHOW_ALL_LABEL,
    phase: 'Phase 1',
    comingSoon: false,
    summary: 'Hats, Logos, Accessories, Gear, and the rest in one view.',
  },
  {
    id: 'gear',
    label: 'Gear',
    phase: 'Phase 1',
    comingSoon: false,
    summary: 'Tee, Hoodie & Hat Collections.',
  },
  {
    id: 'logos',
    label: 'Logos',
    phase: '',
    comingSoon: false,
    summary: 'Every uploaded logo in one list. The pick is highlighted as the Selected Logo.',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    phase: 'Phase 2',
    comingSoon: true,
    summary: accessoriesPhase2Summary(),
  },
] as const;

export type AssetLibraryHubSectionId = (typeof ASSET_LIBRARY_HUB_SECTIONS)[number]['id'];

export const ACCESSORY_PHASE3_EXAMPLES = ACCESSORY_PHASE2_ITEM_LABELS;

export const STUDIO_TAB_BASE_CLASS = BRAND_TAB_BASE_CLASS;
export const STUDIO_TAB_IDLE_CLASS = BRAND_TAB_IDLE_CLASS;
export const STUDIO_TAB_ACTIVE_CLASS = BRAND_TAB_ACTIVE_CLASS;

export function studioTabClass(active: boolean): string {
  return brandTabClass(active);
}

export function studioTabMetaClass(active?: boolean): string {
  return brandTabMetaClass(active);
}

export function isAssetLibraryHubSection(value: unknown): value is AssetLibraryHubSectionId {
  return typeof value === 'string' && ASSET_LIBRARY_HUB_SECTIONS.some((section) => section.id === value);
}

export function defaultOpenAssetLibraryHub(): Record<AssetLibraryHubSectionId, boolean> {
  return { 'show-all': true, logos: true, gear: true, accessories: false };
}

export const DEFAULT_ASSET_LIBRARY_HUB_TAB: AssetLibraryHubSectionId = 'gear';

export function isAssetLibraryShowAllTab(tab: string | null | undefined): boolean {
  return tab === ASSET_LIBRARY_SHOW_ALL_TAB_ID;
}

export function assetLibraryCatalogSections() {
  return ASSET_LIBRARY_HUB_SECTIONS.filter((section) => section.id !== 'show-all');
}

export function defaultOpenAssetLibraryShowAll(): Record<'gear' | 'logos' | 'accessories', boolean> {
  return { gear: true, logos: true, accessories: true };
}

export const ASSET_LIBRARY_SHOW_ALL_FOCUS_IDS = ['gear', 'logos', 'accessories'] as const;
export type AssetLibraryShowAllFocus = (typeof ASSET_LIBRARY_SHOW_ALL_FOCUS_IDS)[number];
export const DEFAULT_ASSET_LIBRARY_SHOW_ALL_FOCUS: AssetLibraryShowAllFocus = 'gear';

export function resolveAssetLibraryShowAllFocus(
  tab: string | null | undefined,
): AssetLibraryShowAllFocus {
  return ASSET_LIBRARY_SHOW_ALL_FOCUS_IDS.includes(tab as AssetLibraryShowAllFocus)
    ? (tab as AssetLibraryShowAllFocus)
    : DEFAULT_ASSET_LIBRARY_SHOW_ALL_FOCUS;
}

export function resolveAssetLibraryHubTab(tab: string | null | undefined): AssetLibraryHubSectionId {
  if (tab === 'compare') return DEFAULT_ASSET_LIBRARY_HUB_TAB;
  return isAssetLibraryHubSection(tab) ? tab : DEFAULT_ASSET_LIBRARY_HUB_TAB;
}

/** Legacy coarse buckets — still accepted when migrating older uploads. */
export const ASSET_LIBRARY_STYLES = ['tie-dye', 'logo', 'unisex-fem'] as const;
export type AssetLibraryStyleId = string;

export const ASSET_LIBRARY_STYLE_LABELS: Record<string, string> = {
  'tie-dye': 'Tie Dye',
  logo: 'Logo',
  'unisex-fem': 'Unisex Fem',
};

export const ASSET_LIBRARY_EXAMPLE_STYLES = ['E-ShirtLebberingBeige', 'TShirtTieDieRainbowSpiral'] as const;
export const ADD_CARDS_TO_STYLE_LABEL = 'Add Cards to this Style';
export const ADD_CARDS_TO_NEW_STYLE_LABEL = 'Add Cards to a New Style';
export const STYLE_COMPARE_LIMIT = GEAR_COMPARE_LIMIT;
/** Up to 8 compare cards: 2 on phones, 3 on tablet, 4 on desktop. */
export const STYLE_COMPARE_GRID_CLASS = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3';

export function styleCompareGridClass(): string {
  return STYLE_COMPARE_GRID_CLASS;
}

export type AssetLibrarySectionId = string;

export function isAssetLibraryStyle(value: unknown): value is AssetLibraryStyleId {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isAssetLibrarySection(value: unknown): value is AssetLibrarySectionId {
  return isAssetLibraryStyle(value);
}

/** Same medium thumbnail strip used on Gear Selections. */
export const ASSET_LIBRARY_SCROLL_CLASS =
  'flex gap-3 overflow-x-auto snap-x snap-mandatory overscroll-x-contain pb-2 [scrollbar-width:thin]';
export const ASSET_LIBRARY_THUMB_CARD_CLASS = 'snap-start shrink-0 w-36 sm:w-40';

export function defaultOpenAssetLibrarySections(
  familyIds: string[] = [],
): Record<string, boolean> {
  return Object.fromEntries(familyIds.map((id) => [id, true]));
}

export function toggleAssetLibraryOpen(
  open: Record<string, boolean>,
  id: string,
): Record<string, boolean> {
  return { ...open, [id]: !open[id] };
}

export function assetLibraryGroupKey(sectionId: string, groupId: string): string {
  return `${sectionId}:${groupId}`;
}

/** Gear Selections and Logo Concepts stay nested under Asset Library. */
export function isAssetLibraryAliasTab(tab: string | null | undefined): boolean {
  return tab === 'gear-selections' || tab === 'logo-concepts';
}

export function assetLibrarySectionFromTab(tab: string | null | undefined): AssetLibrarySectionId {
  if (tab === 'logo-concepts' || tab === 'logos' || tab === 'logo') return 'logo';
  if (tab === 'unisex-fem') return 'unisex-fem';
  return 'tie-dye';
}

export interface AssetLibraryStyleFile {
  id: string;
  style: AssetLibraryStyleId;
  familyId: string;
  familyLabel: string;
  name: string;
  dataUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface AssetLibraryStyleFamily {
  id: string;
  label: string;
  files: AssetLibraryStyleFile[];
}

export interface AssetLibraryStyleStore {
  files: AssetLibraryStyleFile[];
}

export function emptyAssetLibraryStyleStore(): AssetLibraryStyleStore {
  return { files: [] };
}

function familyForAsset(name: string, style?: string): { familyId: string; familyLabel: string } {
  return merchStyleFamilyFromName(style?.trim() || name);
}

export function assetLibraryStyleFamilies(store: AssetLibraryStyleStore): AssetLibraryStyleFamily[] {
  const groups = new Map<string, AssetLibraryStyleFamily>();
  for (const file of store.files) {
    const current = groups.get(file.familyId);
    if (current) current.files.push(file);
    else groups.set(file.familyId, { id: file.familyId, label: file.familyLabel, files: [file] });
  }
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function reorderAssetLibraryFilesInFamily(
  store: AssetLibraryStyleStore,
  familyId: string,
  fromIndex: number,
  toIndex: number,
): AssetLibraryStyleStore {
  return {
    files: reorderKeyedGroups(store.files, familyId, (file) => file.familyId, fromIndex, toIndex),
  };
}

export function assetLibraryStyleFile(
  store: AssetLibraryStyleStore,
  style: AssetLibraryStyleId,
): AssetLibraryStyleFile | undefined {
  return store.files.find((file) => file.familyId === style || file.style === style);
}

export function assetLibraryStyleFiles(store: AssetLibraryStyleStore): AssetLibraryStyleFile[] {
  return store.files;
}

export function filesInAssetLibraryFamily(store: AssetLibraryStyleStore, familyId: string): AssetLibraryStyleFile[] {
  return store.files.filter((file) => file.familyId === familyId);
}

export function assetLibraryFilledStyleCount(store: AssetLibraryStyleStore): number {
  return assetLibraryStyleFamilies(store).length;
}

export function assetLibraryStyleSummary(store: AssetLibraryStyleStore): string {
  const families = assetLibraryFilledStyleCount(store);
  const files = store.files.length;
  return `${files} card${files === 1 ? '' : 's'} · ${families} style${families === 1 ? '' : 's'}`;
}

export type AssetLibraryFileInput = {
  name?: string;
  type?: string;
  size?: number;
};

export function assetLibraryStyleFileError(file: AssetLibraryFileInput): string | null {
  const name = String(file.name ?? '').trim();
  const type = logoMimeFromName(name, file.type);
  const size = Number(file.size ?? 0);
  if (!name) return 'Choose an image file to upload.';
  if (!Number.isFinite(size) || size <= 0) return 'That file is empty.';
  if (!isAllowedMockupMime(type)) return 'Upload a JPEG, PNG, WebP, or GIF.';
  if (size > MAX_MOCKUP_BYTES) return fileTooLargeMessage('Style files');
  return null;
}

export function setAssetLibraryStyle(
  store: AssetLibraryStyleStore,
  input: {
    id?: string;
    style?: AssetLibraryStyleId;
    familyId?: string;
    familyLabel?: string;
    name: string;
    dataUrl?: string;
    uploadedBy?: string;
    uploadedAt?: string;
  },
): { store: AssetLibraryStyleStore; error?: string; file?: AssetLibraryStyleFile; replaced?: boolean } {
  const name = input.name.trim();
  if (!name) return { store, error: 'Name the asset.' };
  const inferred = familyForAsset(name, input.style);
  const familyId = (input.familyId || inferred.familyId).trim();
  const familyLabel = (input.familyLabel || inferred.familyLabel).trim();
  if (!familyId) return { store, error: 'Choose a style.' };
  const dataUrl = input.dataUrl?.trim();
  if (!dataUrl || (!isImageDataUrl(dataUrl) && !/^blob:/i.test(dataUrl))) {
    return { store, error: 'Upload a JPEG, PNG, WebP, or GIF.' };
  }
  const id = input.id?.trim() || `style-${familyId}-${Date.now()}`;
  const previous = store.files.find((row) => row.id === id);
  const file: AssetLibraryStyleFile = {
    id,
    style: familyId,
    familyId,
    familyLabel,
    name,
    dataUrl,
    uploadedAt: input.uploadedAt || new Date().toISOString(),
    uploadedBy: (input.uploadedBy || 'Evelyn').trim() || 'Evelyn',
  };
  const files = previous
    ? store.files.map((row) => (row.id === id ? file : row))
    : [file, ...store.files];
  return { store: { files }, file, replaced: Boolean(previous) };
}

export function removeAssetLibraryStyle(
  store: AssetLibraryStyleStore,
  style: AssetLibraryStyleId,
): AssetLibraryStyleStore {
  return { files: store.files.filter((file) => file.familyId !== style && file.style !== style) };
}

export function moveAssetLibraryCard(
  store: AssetLibraryStyleStore,
  fileId: string,
  toFamilyId: string,
): { store: AssetLibraryStyleStore; error?: string } {
  const file = store.files.find((row) => row.id === fileId);
  if (!file) return { store, error: 'That card is not in the library.' };
  const dest = assetLibraryStyleFamilies(store).find((family) => family.id === toFamilyId);
  if (!dest) return { store, error: 'Choose a style to move this card to.' };
  if (file.familyId === dest.id) return { store };
  return {
    store: {
      files: store.files.map((row) =>
        row.id === fileId
          ? { ...row, familyId: dest.id, familyLabel: dest.label, style: dest.id }
          : row,
      ),
    },
  };
}

export function moveAssetLibraryCardToNewStyle(
  store: AssetLibraryStyleStore,
  fileId: string,
  label: string,
): { store: AssetLibraryStyleStore; error?: string } {
  const named = namedMerchStyleFamily(label);
  if ('error' in named) return { store, error: named.error };
  const file = store.files.find((row) => row.id === fileId);
  if (!file) return { store, error: 'That card is not in the library.' };
  return {
    store: {
      files: store.files.map((row) =>
        row.id === fileId
          ? {
              ...row,
              familyId: named.family.familyId,
              familyLabel: named.family.familyLabel,
              style: named.family.familyId,
            }
          : row,
      ),
    },
  };
}

export function toggleStyleCompare(
  selected: string[],
  id: string,
  limit = STYLE_COMPARE_LIMIT,
): { selected: string[]; error?: string } {
  const current = selected.filter(Boolean);
  if (current.includes(id)) return { selected: current.filter((row) => row !== id) };
  if (current.length >= limit) {
    return { selected: current, error: `Compare up to ${limit}.` };
  }
  return { selected: [...current, id] };
}

export function removeAssetLibraryStyleFile(
  store: AssetLibraryStyleStore,
  fileId: string,
): AssetLibraryStyleStore {
  return { files: store.files.filter((file) => file.id !== fileId) };
}

export function renameAssetLibraryFamily(
  store: AssetLibraryStyleStore,
  familyId: string,
  label: string,
): { store: AssetLibraryStyleStore; error?: string } {
  const named = namedMerchStyleFamily(label);
  if ('error' in named) return { store, error: named.error };
  if (!store.files.some((file) => file.familyId === familyId)) {
    return { store, error: 'That style is not in the library.' };
  }
  return {
    store: {
      files: store.files.map((file) =>
        file.familyId === familyId
          ? { ...file, familyId: named.family.familyId, familyLabel: named.family.familyLabel, style: named.family.familyId }
          : file,
      ),
    },
  };
}

/** One collection name is shared by Gear and the Asset Library style list. */
export function renameSharedMerchCollection(
  gear: GearSelectionsStore,
  library: AssetLibraryStyleStore,
  familyId: string,
  label: string,
): { gear: GearSelectionsStore; library: AssetLibraryStyleStore; familyId: string; error?: string } {
  const named = namedMerchStyleFamily(label);
  if ('error' in named) return { gear, library, familyId, error: named.error };
  const nextGear = renameGearStyleFamily(gear, familyId, label);
  if (nextGear.error) return { gear, library, familyId, error: nextGear.error };
  const nextLibrary = library.files.some((file) => file.familyId === familyId)
    ? renameAssetLibraryFamily(library, familyId, label)
    : { store: library };
  return {
    gear: nextGear.store,
    library: nextLibrary.store,
    familyId: named.family.familyId,
  };
}

function normalizeStyleFile(row: Partial<AssetLibraryStyleFile>, fallbackStyle?: string): AssetLibraryStyleFile | null {
  if (!row.id || !row.name) return null;
  const rawPreview = String(row.dataUrl ?? '');
  if (rawPreview && !isImageDataUrl(rawPreview) && !/^blob:/i.test(rawPreview)) return null;
  const family = row.familyId
    ? { familyId: String(row.familyId), familyLabel: String(row.familyLabel || row.familyId) }
    : familyForAsset(String(row.name), fallbackStyle || row.style);
  return {
    id: String(row.id),
    style: family.familyId,
    familyId: family.familyId,
    familyLabel: family.familyLabel,
    name: String(row.name),
    dataUrl: storedPreviewForLoad(rawPreview) || undefined,
    uploadedAt: String(row.uploadedAt ?? ''),
    uploadedBy: String(row.uploadedBy ?? 'Evelyn'),
  };
}

export function normalizeAssetLibraryStyleStore(raw: unknown): AssetLibraryStyleStore {
  if (!raw || typeof raw !== 'object') return emptyAssetLibraryStyleStore();
  const data = raw as Partial<AssetLibraryStyleStore> & {
    styles?: Partial<Record<string, Partial<AssetLibraryStyleFile>>>;
  };
  if (Array.isArray(data.files)) {
    return { files: data.files.flatMap((row) => {
      const file = normalizeStyleFile(row ?? {});
      return file ? [file] : [];
    }) };
  }
  if (!data.styles || typeof data.styles !== 'object') return emptyAssetLibraryStyleStore();
  const files: AssetLibraryStyleFile[] = [];
  for (const [style, row] of Object.entries(data.styles)) {
    if (!row || typeof row !== 'object') continue;
    const file = normalizeStyleFile(row, style);
    if (file) files.push(file);
  }
  return { files };
}

export function persistAssetLibraryStyleStore(store: AssetLibraryStyleStore): AssetLibraryStyleStore {
  return {
    files: store.files.map((file) => ({ ...file, dataUrl: persistablePreviewUrl(file.dataUrl) })),
  };
}

export const ASSET_CATEGORIES = ['brand', 'quote', 'mockup', 'caption', 'product'] as const;
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

/** Legacy library categories stay in the type for stored data. */
export const VISIBLE_ASSET_CATEGORIES = ['mockup'] as const;
export type VisibleAssetCategory = (typeof VISIBLE_ASSET_CATEGORIES)[number];

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  brand: 'Brand',
  quote: 'Quote cards',
  mockup: 'Mockups',
  caption: 'Captions',
  product: 'Product shots',
};

export function isVisibleAssetCategory(value: unknown): value is VisibleAssetCategory {
  return value === 'mockup';
}

export interface ContentAsset {
  id: string;
  category: AssetCategory;
  name: string;
  body: string;
  dataUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface AssetLibraryStore {
  assets: ContentAsset[];
}

export function emptyAssetLibraryStore(): AssetLibraryStore {
  return { assets: [] };
}

export function isAssetCategory(value: unknown): value is AssetCategory {
  return typeof value === 'string' && (ASSET_CATEGORIES as readonly string[]).includes(value);
}

export function assetFileError(file: AssetLibraryFileInput, category: AssetCategory): string | null {
  if (category === 'caption') return null;
  const name = String(file.name ?? '').trim();
  const type = logoMimeFromName(name, file.type);
  const size = Number(file.size ?? 0);
  if (!name) return 'Choose an image file to upload.';
  if (!Number.isFinite(size) || size <= 0) return 'That file is empty.';
  if (!isAllowedMockupMime(type)) return 'Upload a JPEG, PNG, WebP, or GIF.';
  if (size > MAX_MOCKUP_BYTES) return fileTooLargeMessage('Mockups');
  return null;
}

export function assetsInCategory(store: AssetLibraryStore, category: AssetCategory): ContentAsset[] {
  return store.assets.filter((item) => item.category === category);
}

export function addContentAsset(
  store: AssetLibraryStore,
  input: {
    id?: string;
    category: AssetCategory;
    name: string;
    body?: string;
    dataUrl?: string;
    uploadedBy?: string;
    uploadedAt?: string;
  },
): { store: AssetLibraryStore; error?: string; asset?: ContentAsset } {
  if (!isAssetCategory(input.category)) {
    return { store, error: 'Choose a library category.' };
  }
  const name = input.name.trim();
  if (!name) return { store, error: 'Name the asset.' };
  const body = (input.body ?? '').trim();
  const dataUrl = input.dataUrl?.trim();
  if (input.category === 'caption') {
    if (!body) return { store, error: 'Paste caption copy for a Caption asset.' };
  } else if (!dataUrl || (!isImageDataUrl(dataUrl) && !/^blob:/i.test(dataUrl))) {
    return { store, error: 'Upload a JPEG, PNG, WebP, or GIF.' };
  }
  const asset: ContentAsset = {
    id: input.id?.trim() || `asset-${Date.now()}`,
    category: input.category,
    name,
    body,
    dataUrl: input.category === 'caption' ? undefined : dataUrl,
    uploadedAt: input.uploadedAt || new Date().toISOString(),
    uploadedBy: (input.uploadedBy || 'Evelyn').trim() || 'Evelyn',
  };
  const next: AssetLibraryStore = { assets: [asset, ...store.assets] };
  return { store: next, asset };
}

export function removeContentAsset(store: AssetLibraryStore, assetId: string): AssetLibraryStore {
  return { assets: store.assets.filter((item) => item.id !== assetId) };
}

export function normalizeAssetLibraryStore(raw: unknown): AssetLibraryStore {
  if (!raw || typeof raw !== 'object') return emptyAssetLibraryStore();
  const data = raw as Partial<AssetLibraryStore>;
  const assets = Array.isArray(data.assets)
    ? data.assets.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const row = item as Partial<ContentAsset>;
        if (!isAssetCategory(row.category) || !row.id || !row.name) return [];
        const rawPreview = String(row.dataUrl ?? '');
        if (row.category !== 'caption') {
          if (rawPreview && !isImageDataUrl(rawPreview) && !/^blob:/i.test(rawPreview)) return [];
        }
        if (row.category === 'caption' && !String(row.body ?? '').trim()) return [];
        return [
          {
            id: String(row.id),
            category: row.category,
            name: String(row.name),
            body: String(row.body ?? ''),
            dataUrl: row.category === 'caption' ? undefined : storedPreviewForLoad(rawPreview) || undefined,
            uploadedAt: String(row.uploadedAt ?? ''),
            uploadedBy: String(row.uploadedBy ?? 'Evelyn'),
          },
        ];
      })
    : [];
  return { assets };
}

export function persistAssetLibraryStore(store: AssetLibraryStore): AssetLibraryStore {
  return {
    assets: store.assets.map((asset) => ({
      ...asset,
      dataUrl: persistablePreviewUrl(asset.dataUrl),
    })),
  };
}

export { ALLOWED_MOCKUP_MIME_TYPES, MAX_MOCKUP_BYTES };
