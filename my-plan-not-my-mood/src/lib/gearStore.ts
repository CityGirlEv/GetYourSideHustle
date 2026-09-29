import {
  normalizeGearSelectionsStore,
  persistGearSelectionsStore,
  type GearSelectionsStore,
} from './gearSelections';
import { isLogoApiUnavailable } from './logoStore';

export const GEAR_API_PATH = '/api/gear';
export const GEAR_STORE_ID = 'v1';

export interface GearStorePayload {
  store: GearSelectionsStore;
  updatedAt: string;
  updatedBy: string | null;
}

export interface GearStoreResult {
  ok: boolean;
  skipped?: boolean;
  empty?: boolean;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function parseGearStorePayload(value: unknown): GearStorePayload | null {
  if (!isRecord(value)) return null;
  const rawStore = isRecord(value.store) ? value.store : value;
  const store = normalizeGearSelectionsStore(rawStore);
  return {
    store,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
    updatedBy: typeof value.updatedBy === 'string' && value.updatedBy.trim() ? value.updatedBy.trim() : null,
  };
}

export function buildGearStorePayload(
  store: GearSelectionsStore,
  updatedBy: string | null,
  now = new Date(),
): GearStorePayload {
  return {
    store: persistGearSelectionsStore(store),
    updatedAt: now.toISOString(),
    updatedBy: updatedBy?.trim() || null,
  };
}

export async function fetchGearStore(): Promise<GearStorePayload | null> {
  try {
    const response = await fetch(GEAR_API_PATH, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { empty?: boolean } & Record<string, unknown>;
    if (data.empty) return { store: normalizeGearSelectionsStore({}), updatedAt: '', updatedBy: null };
    return parseGearStorePayload(data);
  } catch {
    return null;
  }
}

export const isGearApiUnavailable = isLogoApiUnavailable;

export async function saveGearStore(payload: GearStorePayload): Promise<GearStoreResult> {
  try {
    const response = await fetch(GEAR_API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (isGearApiUnavailable(response.status)) {
      return { ok: true, skipped: true };
    }
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error || `Gear API failed (${response.status})` };
    }
    return { ok: true };
  } catch {
    return { ok: true, skipped: true };
  }
}
