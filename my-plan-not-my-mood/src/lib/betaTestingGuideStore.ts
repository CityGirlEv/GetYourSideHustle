import {
  INITIAL_BETA_GUIDE_ITEMS,
  parseBetaGuideItems,
  type BetaGuideItem,
} from './betaTestingGuide';

export const BETA_TESTING_GUIDE_API_PATH = '/api/beta-testing-guide';
export const BETA_TESTING_GUIDE_STORE_ID = 'v1';
export const BETA_TESTING_GUIDE_STORAGE_KEY = 'myplan_beta_testing_guide_v1';

export interface BetaTestingGuideStorePayload {
  items: BetaGuideItem[];
  updatedAt: string;
  updatedBy: string | null;
  empty?: boolean;
}

export interface BetaTestingGuideStoreResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function parseBetaTestingGuideStorePayload(value: unknown): BetaTestingGuideStorePayload | null {
  if (!isRecord(value)) return null;
  const items = parseBetaGuideItems(value.items);
  if (!items) return null;
  return {
    items,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
    updatedBy: typeof value.updatedBy === 'string' && value.updatedBy.trim() ? value.updatedBy.trim() : null,
  };
}

export function buildBetaTestingGuideStorePayload(
  items: BetaGuideItem[],
  updatedBy: string | null,
  now = new Date(),
): BetaTestingGuideStorePayload {
  return {
    items,
    updatedAt: now.toISOString(),
    updatedBy: updatedBy?.trim() || null,
  };
}

export function seedBetaGuideItems(): BetaGuideItem[] {
  return INITIAL_BETA_GUIDE_ITEMS.map((item) => ({ ...item }));
}

export function loadBetaTestingGuideFromStorage(): BetaGuideItem[] {
  if (typeof window === 'undefined') return seedBetaGuideItems();
  try {
    const raw = localStorage.getItem(BETA_TESTING_GUIDE_STORAGE_KEY);
    if (!raw) return seedBetaGuideItems();
    const parsed = parseBetaTestingGuideStorePayload(JSON.parse(raw));
    if (!parsed) return seedBetaGuideItems();
    return parsed.items;
  } catch {
    return seedBetaGuideItems();
  }
}

export function saveBetaTestingGuideToStorage(payload: BetaTestingGuideStorePayload): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BETA_TESTING_GUIDE_STORAGE_KEY, JSON.stringify(payload));
}

export async function fetchBetaTestingGuideStore(): Promise<BetaTestingGuideStorePayload | null> {
  try {
    const response = await fetch(BETA_TESTING_GUIDE_API_PATH, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { empty?: boolean } & Record<string, unknown>;
    if (data.empty) return null;
    return parseBetaTestingGuideStorePayload(data);
  } catch {
    return null;
  }
}

export async function saveBetaTestingGuideStore(
  payload: BetaTestingGuideStorePayload,
): Promise<BetaTestingGuideStoreResult> {
  try {
    const response = await fetch(BETA_TESTING_GUIDE_API_PATH, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.status === 503) {
      return { ok: true, skipped: true, error: 'Beta testing guide database is not configured' };
    }
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error || `Beta testing guide API failed (${response.status})` };
    }
    return { ok: true };
  } catch {
    return { ok: true, skipped: true };
  }
}
