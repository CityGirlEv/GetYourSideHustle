import {
  ALLOWED_MOCKUP_MIME_TYPES,
  MAX_MOCKUP_BYTES,
  isImageDataUrl,
} from './gearSelections';
import { persistablePreviewUrl, storedPreviewForLoad } from './idbFileStore';
import { reorderListByIndex } from './listOrder';
import { fileTooLargeMessage } from './uploadLimits';
import {
  describeFolderImport,
  fileNameFromRelativePath,
  localFolderPathError,
  logoMimeFromName,
  normalizeLocalFolderPath,
  planFolderImport,
  type FolderImportEntry,
} from './localFolder';

export const LOGO_CONCEPTS_STORAGE_KEY = 'myplan_logo_concepts_v1';
export const LOGO_CONCEPTS_PATH = '/admin/logo-concepts';
export const MAX_LOGO_BYTES = MAX_MOCKUP_BYTES;

export const DEFAULT_LOGO_KIND = 'logo' as const;
export const LOGO_KINDS = ['logo', 'seal', 'wordmark', 'lockup', 'colorway'] as const;
export type LogoKind = (typeof LOGO_KINDS)[number];

export const LOGO_KIND_LABELS: Record<LogoKind, string> = {
  logo: 'Logo',
  seal: 'Seal',
  wordmark: 'Wordmark',
  lockup: 'Lockup',
  colorway: 'Colorway',
};

export const MAIN_LOGO_LABEL = 'Main Logo';
export const SELECTED_LOGO_LABEL = MAIN_LOGO_LABEL;
export const LOGO_ALL_TAB_ID = 'logos';
export const LOGO_ALL_TAB_LABEL = 'Logos';
export const LOGO_SELECTED_TAB_ID = 'selected';
export const LOGO_SELECTED_TAB_LABEL = 'Selected';
export const UNSELECT_LABEL = 'Unselect';

export function logoPageTabIds(): string[] {
  return [LOGO_ALL_TAB_ID, LOGO_SELECTED_TAB_ID];
}

export function isLogoSelectedTab(tabId: string | null): boolean {
  return tabId === LOGO_SELECTED_TAB_ID;
}
export const SHOW_ALL_LOGOS_LABEL = 'Show all';
export const SHOW_CAROUSEL_LOGOS_LABEL = 'Show carousel';
export const LOGO_SHOW_ALL_STARTS_OPEN = false;

export function logoShowAllStartsOpen(): boolean {
  return LOGO_SHOW_ALL_STARTS_OPEN;
}
export const LOGO_MINI_STRIP_CLASS =
  'flex gap-1.5 overflow-x-auto snap-x snap-mandatory overscroll-x-contain py-1 [scrollbar-width:thin]';
export const MAX_LOGO_NAME_LENGTH = 80;

export const ALLOWED_LOGO_MIME_TYPES = [...ALLOWED_MOCKUP_MIME_TYPES, 'image/svg+xml'] as const;

export type LogoConceptFileInput = {
  name?: string;
  type?: string;
  size?: number;
  webkitRelativePath?: string;
};

export interface LogoConcept {
  id: string;
  kind: LogoKind;
  name: string;
  notes: string;
  relativePath: string;
  dataUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface LogoConceptsStore {
  concepts: LogoConcept[];
  chosenId: string | null;
  sourceFolderPath: string;
}

export function emptyLogoConceptsStore(): LogoConceptsStore {
  return { concepts: [], chosenId: null, sourceFolderPath: '' };
}

export function isLogoKind(value: unknown): value is LogoKind {
  return typeof value === 'string' && (LOGO_KINDS as readonly string[]).includes(value);
}

export function isAllowedLogoMime(type: string): boolean {
  return (ALLOWED_LOGO_MIME_TYPES as readonly string[]).includes(type.toLowerCase());
}

export function inferLogoKindFromRelativePath(relativePath: string, fallback: LogoKind): LogoKind {
  const blob = String(relativePath ?? '')
    .replace(/\\/g, '/')
    .toLowerCase();
  if (/(^|\/)(wordmarks?|word-mark|logotype)(\/|$)/.test(blob) || /wordmark/.test(blob)) return 'wordmark';
  if (/(^|\/)(lockups?|stacked)(\/|$)/.test(blob) || /lockup/.test(blob)) return 'lockup';
  if (/(^|\/)(colorways?|colourways?|palette)(\/|$)/.test(blob) || /colorway|colourway/.test(blob)) {
    return 'colorway';
  }
  if (/(^|\/)(seals?|badge|emblem|icon)(\/|$)/.test(blob) || /(?:^|\/|-)seal(?:-|\.|$)/.test(blob)) return 'seal';
  return fallback;
}

export function isLogoDataUrl(value: string): boolean {
  return isImageDataUrl(value) || /^data:image\/svg\+xml;base64,/i.test(value);
}

export function isLogoPreviewUrl(value: string): boolean {
  return isLogoDataUrl(value) || /^blob:/i.test(value);
}

/** Happy path returns null. Each reject path returns a reason. */
export function logoConceptFileError(file: LogoConceptFileInput): string | null {
  const name = String(file.name ?? file.webkitRelativePath ?? '').trim();
  const type = logoMimeFromName(name, file.type);
  const size = Number(file.size ?? 0);
  if (!fileNameFromRelativePath(name)) return 'Choose a logo file to upload.';
  if (!Number.isFinite(size) || size <= 0) return 'That file is empty.';
  if (!isAllowedLogoMime(type)) return 'Upload a JPEG, PNG, WebP, GIF, or SVG logo.';
  if (size > MAX_LOGO_BYTES) return fileTooLargeMessage('Logo files');
  return null;
}

export function setLogoSourceFolderPath(
  store: LogoConceptsStore,
  rawPath: string,
): { store: LogoConceptsStore; error?: string } {
  const value = normalizeLocalFolderPath(rawPath);
  if (!value) return { store: { ...store, sourceFolderPath: '' } };
  const error = localFolderPathError(value);
  if (error) return { store, error };
  return { store: { ...store, sourceFolderPath: value } };
}

export function conceptsInKind(store: LogoConceptsStore, kind: LogoKind): LogoConcept[] {
  return store.concepts.filter((item) => item.kind === kind);
}

export function chosenLogo(store: LogoConceptsStore): LogoConcept | undefined {
  if (!store.chosenId) return undefined;
  return store.concepts.find((item) => item.id === store.chosenId);
}

export function isChosenLogo(store: LogoConceptsStore, conceptId: string): boolean {
  return store.chosenId === conceptId;
}

export function allLogoConcepts(store: LogoConceptsStore): LogoConcept[] {
  return store.concepts;
}

export function reorderLogoConcepts(
  store: LogoConceptsStore,
  fromIndex: number,
  toIndex: number,
): LogoConceptsStore {
  return { ...store, concepts: reorderListByIndex(store.concepts, fromIndex, toIndex) };
}

export const LOGO_CAROUSEL_MOBILE_VISIBLE = 1;
export const LOGO_CAROUSEL_DESKTOP_VISIBLE = 2;
export const LOGO_CAROUSEL_DESKTOP_MQ = '(min-width: 768px)';

export function wrapLogoCarouselIndex(index: number, count: number, delta = 0): number {
  if (count <= 0) return 0;
  if (delta === 0 && index >= count) return count - 1;
  return (((index + delta) % count) + count) % count;
}

/** One mini-thumbnail is focused at a time, even when two logos are in the carousel. */
export function clampLogoMiniFocus(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(0, index), count - 1);
}

export function logoCarouselVisibleCount(desktop: boolean): number {
  return desktop ? LOGO_CAROUSEL_DESKTOP_VISIBLE : LOGO_CAROUSEL_MOBILE_VISIBLE;
}

export function clampLogoCarouselStart(start: number, count: number, visible: number): number {
  if (count <= 0) return 0;
  const maxStart = Math.max(0, count - Math.max(1, visible));
  return Math.min(Math.max(0, start), maxStart);
}

export function logoCarouselWindow<T>(items: T[], start: number, visible: number): T[] {
  const first = clampLogoCarouselStart(start, items.length, visible);
  return items.slice(first, first + Math.max(1, visible));
}

/** "2 of 5" on mobile, "2–3 of 5" when two are in view. */
export function logoCarouselPositionLabel(start: number, count: number, visible: number): string {
  if (count <= 0) return '0 of 0';
  const first = clampLogoCarouselStart(start, count, visible);
  const last = Math.min(count, first + Math.max(1, visible));
  const from = first + 1;
  return from === last ? `${from} of ${count}` : `${from}–${last} of ${count}`;
}

export function addLogoConcept(
  store: LogoConceptsStore,
  input: {
    id?: string;
    kind?: LogoKind | null;
    name: string;
    notes?: string;
    relativePath?: string;
    dataUrl: string;
    uploadedBy?: string;
    uploadedAt?: string;
  },
): { store: LogoConceptsStore; error?: string; concept?: LogoConcept } {
  const kind = isLogoKind(input.kind) ? input.kind : DEFAULT_LOGO_KIND;
  const name = input.name.trim();
  if (!name) return { store, error: 'Name the logo concept.' };
  if (!isLogoPreviewUrl(input.dataUrl)) {
    return { store, error: 'Upload a JPEG, PNG, WebP, GIF, or SVG logo.' };
  }
  const concept: LogoConcept = {
    id: input.id?.trim() || `logo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    name,
    notes: (input.notes ?? '').trim(),
    relativePath: (input.relativePath ?? '').trim(),
    dataUrl: input.dataUrl,
    uploadedAt: input.uploadedAt || new Date().toISOString(),
    uploadedBy: (input.uploadedBy || 'Evelyn').trim() || 'Evelyn',
  };
  const next: LogoConceptsStore = {
    ...store,
    concepts: [concept, ...store.concepts],
  };
  return { store: next, concept };
}

export function addLogoConceptsFromEntries(
  store: LogoConceptsStore,
  entries: Array<{
    id?: string;
    name: string;
    relativePath?: string;
    dataUrl: string;
    kind?: LogoKind | null;
  }>,
  fallbackKind: LogoKind,
  uploadedBy: string,
): { store: LogoConceptsStore; added: number; skipped: number; notice: string; error?: string } {
  let next = store;
  let added = 0;
  let skipped = 0;
  let error: string | undefined;
  for (const entry of entries) {
    const relativePath = entry.relativePath || entry.name;
    const kind = isLogoKind(entry.kind) ? entry.kind : inferLogoKindFromRelativePath(relativePath, fallbackKind);
    const result = addLogoConcept(next, {
      id: entry.id,
      kind,
      name: fileNameFromRelativePath(entry.name).replace(/\.[^.]+$/, '') || entry.name,
      notes: relativePath,
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
  return { store: next, added, skipped, notice: describeFolderImport(added, skipped, 'logo'), error };
}

export function planLogoFolderFiles(entries: FolderImportEntry[]): ReturnType<typeof planFolderImport> {
  return planFolderImport(entries, { maxBytes: MAX_LOGO_BYTES });
}

export function removeLogoConcept(store: LogoConceptsStore, conceptId: string): LogoConceptsStore {
  return {
    ...store,
    concepts: store.concepts.filter((item) => item.id !== conceptId),
    chosenId: store.chosenId === conceptId ? null : store.chosenId,
  };
}

export function setMainLogo(
  store: LogoConceptsStore,
  conceptId: string,
): { store: LogoConceptsStore; error?: string } {
  const concept = store.concepts.find((item) => item.id === conceptId);
  if (!concept) return { store, error: 'That logo is not on the list.' };
  return { store: { ...store, chosenId: conceptId } };
}

export function chooseLogoConcept(
  store: LogoConceptsStore,
  conceptId: string,
): { store: LogoConceptsStore; error?: string } {
  const concept = store.concepts.find((item) => item.id === conceptId);
  if (!concept) return { store, error: 'That logo concept is not on the list.' };
  if (store.chosenId === conceptId) {
    return { store: { ...store, chosenId: null } };
  }
  return setMainLogo(store, conceptId);
}

export function renameLogoConcept(
  store: LogoConceptsStore,
  conceptId: string,
  name: string,
): { store: LogoConceptsStore; error?: string } {
  const concept = store.concepts.find((item) => item.id === conceptId);
  if (!concept) return { store, error: 'That logo is not on the list.' };
  const nextName = String(name ?? '').trim().replace(/\s+/g, ' ');
  if (!nextName) return { store, error: 'Enter a name for this logo.' };
  if (nextName.length > MAX_LOGO_NAME_LENGTH) {
    return { store, error: `Logo names must be ${MAX_LOGO_NAME_LENGTH} characters or fewer.` };
  }
  return {
    store: {
      ...store,
      concepts: store.concepts.map((item) => (item.id === conceptId ? { ...item, name: nextName } : item)),
    },
  };
}

export function logoConceptsSummary(store: LogoConceptsStore): string {
  const chosen = chosenLogo(store);
  const count = store.concepts.length;
  const logos = `${count} logo${count === 1 ? '' : 's'}`;
  const folder = store.sourceFolderPath ? ` · Folder ${store.sourceFolderPath}` : '';
  return chosen ? `${MAIN_LOGO_LABEL}: ${chosen.name} · ${logos}${folder}` : `No main logo · ${logos}${folder}`;
}

export function normalizeLogoConceptsStore(raw: unknown): LogoConceptsStore {
  if (!raw || typeof raw !== 'object') return emptyLogoConceptsStore();
  const data = raw as Partial<LogoConceptsStore>;
  const concepts = Array.isArray(data.concepts)
    ? data.concepts.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const row = item as Partial<LogoConcept>;
        if (!row.id || !row.name) return [];
        const kind = isLogoKind(row.kind) ? row.kind : DEFAULT_LOGO_KIND;
        const rawPreview = String(row.dataUrl ?? '');
        if (rawPreview && !isLogoPreviewUrl(rawPreview)) return [];
        return [
          {
            id: String(row.id),
            kind,
            name: String(row.name),
            notes: String(row.notes ?? ''),
            relativePath: String(row.relativePath ?? ''),
            dataUrl: storedPreviewForLoad(rawPreview),
            uploadedAt: String(row.uploadedAt ?? ''),
            uploadedBy: String(row.uploadedBy ?? 'Evelyn'),
          },
        ];
      })
    : [];
  const ids = new Set(concepts.map((item) => item.id));
  const chosenId = typeof data.chosenId === 'string' && ids.has(data.chosenId) ? data.chosenId : null;
  const pathValue = typeof data.sourceFolderPath === 'string' ? normalizeLocalFolderPath(data.sourceFolderPath) : '';
  const sourceFolderPath = pathValue && !localFolderPathError(pathValue) ? pathValue : '';
  return { concepts, chosenId, sourceFolderPath };
}

export function persistLogoConceptsStore(store: LogoConceptsStore): LogoConceptsStore {
  return {
    ...store,
    concepts: store.concepts.map((item) => ({
      ...item,
      dataUrl: persistablePreviewUrl(item.dataUrl) ?? '',
    })),
  };
}
