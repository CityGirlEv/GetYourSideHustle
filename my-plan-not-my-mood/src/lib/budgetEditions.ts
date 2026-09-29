import {
  PREVIOUS_BUDGET_CAPTURED_AT,
  PREVIOUS_BUDGET_LINE_ITEMS_SEED,
} from './previousBudgetSeed';

export { PREVIOUS_BUDGET_CAPTURED_AT, PREVIOUS_BUDGET_LINE_ITEMS_SEED } from './previousBudgetSeed';

/** v2 replaces any snapshot taken after the $10K rewrite. */
export const PREVIOUS_BUDGET_STORAGE_KEY = 'myplan_previous_budget_v2';
export const CURRENT_BUDGET_FLAT_RATE = 10_000;
export const PREVIOUS_BUDGET_DEFAULT_DISCOUNT = 25;

export interface PreviousBudgetSnapshot {
  capturedAt: string;
  selectedDiscountTier: number;
  lineItems: unknown[];
}

export function isPreviousBudgetEdition(tab: string): boolean {
  return tab === 'previous-budget';
}

export function isCurrentBudgetEdition(tab: string): boolean {
  return tab === 'budget';
}

/** Current Budget is a flat $10K — never apply the archived pre-payment discount. */
export function effectiveBudgetDiscount(tab: string, previousTier: number, currentTier = 0): number {
  if (isPreviousBudgetEdition(tab)) return previousTier;
  return currentTier;
}

export function formatBudgetTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Los_Angeles',
  });
}

export function previousBudgetTabLabel(capturedAt?: string): string {
  const stamp = capturedAt ? formatBudgetTimestamp(capturedAt) : '';
  return stamp ? `Previous Budget · ${stamp}` : 'Previous Budget';
}

export function capturePreviousBudgetSnapshot(input: {
  lineItems: unknown[];
  selectedDiscountTier?: number;
  capturedAt?: string;
}): PreviousBudgetSnapshot {
  return {
    capturedAt: input.capturedAt || new Date().toISOString(),
    selectedDiscountTier: Number.isFinite(input.selectedDiscountTier)
      ? Number(input.selectedDiscountTier)
      : PREVIOUS_BUDGET_DEFAULT_DISCOUNT,
    lineItems: Array.isArray(input.lineItems) ? input.lineItems : [],
  };
}

export function parsePreviousBudgetSnapshot(raw: unknown): PreviousBudgetSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<PreviousBudgetSnapshot>;
  const capturedAt = String(data.capturedAt ?? '');
  if (!capturedAt || Number.isNaN(new Date(capturedAt).getTime())) return null;
  const selectedDiscountTier = Number(data.selectedDiscountTier);
  return {
    capturedAt,
    selectedDiscountTier: Number.isFinite(selectedDiscountTier)
      ? selectedDiscountTier
      : PREVIOUS_BUDGET_DEFAULT_DISCOUNT,
    lineItems: Array.isArray(data.lineItems) ? data.lineItems : [],
  };
}

export function loadPreviousBudgetSnapshot(): PreviousBudgetSnapshot | null {
  try {
    const raw = localStorage.getItem(PREVIOUS_BUDGET_STORAGE_KEY);
    return raw ? parsePreviousBudgetSnapshot(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function persistPreviousBudgetSnapshot(snapshot: PreviousBudgetSnapshot): void {
  try {
    localStorage.setItem(PREVIOUS_BUDGET_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore quota */
  }
}

export function restoreCanonicalPreviousBudget(): PreviousBudgetSnapshot {
  const snapshot = capturePreviousBudgetSnapshot({
    lineItems: PREVIOUS_BUDGET_LINE_ITEMS_SEED,
    selectedDiscountTier: PREVIOUS_BUDGET_DEFAULT_DISCOUNT,
    capturedAt: PREVIOUS_BUDGET_CAPTURED_AT,
  });
  persistPreviousBudgetSnapshot(snapshot);
  return snapshot;
}

/** Always the pre-4:00 PM Pacific Aug 27 budget — not the current $10K flat rate. */
export function ensurePreviousBudgetSnapshot(): PreviousBudgetSnapshot {
  const existing = loadPreviousBudgetSnapshot();
  if (
    existing?.capturedAt === PREVIOUS_BUDGET_CAPTURED_AT &&
    Array.isArray(existing.lineItems) &&
    existing.lineItems.length >= PREVIOUS_BUDGET_LINE_ITEMS_SEED.length
  ) {
    return existing;
  }
  return restoreCanonicalPreviousBudget();
}
