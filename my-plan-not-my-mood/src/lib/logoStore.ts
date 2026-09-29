import {
  normalizeLogoConceptsStore,
  persistLogoConceptsStore,
  type LogoConceptsStore,
} from './logoConcepts';

export const LOGO_API_PATH = '/api/logos';
export const LOGO_STORE_ID = 'v1';
export const SAVE_TO_DATABASE_LABEL = 'Save';
export const SAVING_TO_DATABASE_LABEL = 'Saving';
export const SAVED_TO_DATABASE_NOTICE = 'Saved to the database';
export const SAVE_DATABASE_SKIPPED_NOTICE = 'Saved on this device. Deploy to save to the database.';

export interface LogoStorePayload {
  store: LogoConceptsStore;
  updatedAt: string;
  updatedBy: string | null;
}

export interface LogoStoreResult {
  ok: boolean;
  skipped?: boolean;
  empty?: boolean;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function parseLogoStorePayload(value: unknown): LogoStorePayload | null {
  if (!isRecord(value)) return null;
  const rawStore = isRecord(value.store) ? value.store : value;
  const store = normalizeLogoConceptsStore(rawStore);
  return {
    store,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
    updatedBy: typeof value.updatedBy === 'string' && value.updatedBy.trim() ? value.updatedBy.trim() : null,
  };
}

export function buildLogoStorePayload(
  store: LogoConceptsStore,
  updatedBy: string | null,
  now = new Date(),
): LogoStorePayload {
  return {
    store: persistLogoConceptsStore(store),
    updatedAt: now.toISOString(),
    updatedBy: updatedBy?.trim() || null,
  };
}

export async function fetchLogoStore(): Promise<LogoStorePayload | null> {
  try {
    const response = await fetch(LOGO_API_PATH, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { empty?: boolean } & Record<string, unknown>;
    if (data.empty) return { store: normalizeLogoConceptsStore({}), updatedAt: '', updatedBy: null };
    return parseLogoStorePayload(data);
  } catch {
    return null;
  }
}

export function isLogoApiUnavailable(status: number): boolean {
  return status === 404 || status === 405 || status === 501 || status === 503;
}

export async function saveLogoStore(payload: LogoStorePayload): Promise<LogoStoreResult> {
  try {
    const response = await fetch(LOGO_API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (isLogoApiUnavailable(response.status)) {
      return { ok: true, skipped: true };
    }
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error || `Logo API failed (${response.status})` };
    }
    return { ok: true };
  } catch {
    return { ok: true, skipped: true };
  }
}
