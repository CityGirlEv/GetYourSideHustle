import {
  INITIAL_INVENTORY_ITEMS,
  parseInventoryItems,
  type InventoryItem,
} from './inventoryPricing';

export const INVENTORY_PRICING_API_PATH = '/api/inventory-pricing';
export const INVENTORY_PRICING_STORE_ID = 'v1';
export const INVENTORY_PRICING_STORAGE_KEY = 'myplan_inventory_pricing_v1';

export interface InventoryPricingStorePayload {
  items: InventoryItem[];
  updatedAt: string;
  updatedBy: string | null;
  empty?: boolean;
}

export interface InventoryPricingStoreResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function parseInventoryPricingStorePayload(value: unknown): InventoryPricingStorePayload | null {
  if (!isRecord(value)) return null;
  const items = parseInventoryItems(value.items);
  if (!items) return null;
  return {
    items,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
    updatedBy: typeof value.updatedBy === 'string' && value.updatedBy.trim() ? value.updatedBy.trim() : null,
  };
}

export function buildInventoryPricingStorePayload(
  items: InventoryItem[],
  updatedBy: string | null,
  now = new Date(),
): InventoryPricingStorePayload {
  return {
    items,
    updatedAt: now.toISOString(),
    updatedBy: updatedBy?.trim() || null,
  };
}

export function loadInventoryPricingFromStorage(): InventoryItem[] {
  if (typeof window === 'undefined') return INITIAL_INVENTORY_ITEMS.map((item) => ({ ...item }));
  try {
    const raw = localStorage.getItem(INVENTORY_PRICING_STORAGE_KEY);
    if (!raw) return INITIAL_INVENTORY_ITEMS.map((item) => ({ ...item }));
    const parsed = parseInventoryPricingStorePayload(JSON.parse(raw));
    if (!parsed) return INITIAL_INVENTORY_ITEMS.map((item) => ({ ...item }));
    return parsed.items;
  } catch {
    return INITIAL_INVENTORY_ITEMS.map((item) => ({ ...item }));
  }
}

export function saveInventoryPricingToStorage(payload: InventoryPricingStorePayload): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INVENTORY_PRICING_STORAGE_KEY, JSON.stringify(payload));
}

export async function fetchInventoryPricingStore(): Promise<InventoryPricingStorePayload | null> {
  try {
    const response = await fetch(INVENTORY_PRICING_API_PATH, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { empty?: boolean } & Record<string, unknown>;
    if (data.empty) return null;
    return parseInventoryPricingStorePayload(data);
  } catch {
    return null;
  }
}

export async function saveInventoryPricingStore(
  payload: InventoryPricingStorePayload,
): Promise<InventoryPricingStoreResult> {
  try {
    const response = await fetch(INVENTORY_PRICING_API_PATH, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.status === 503) {
      return { ok: true, skipped: true, error: 'Inventory pricing database is not configured' };
    }
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error || `Inventory pricing API failed (${response.status})` };
    }
    return { ok: true };
  } catch {
    return { ok: true, skipped: true };
  }
}
