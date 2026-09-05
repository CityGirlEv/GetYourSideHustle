import { describe, expect, it } from 'vitest';
import {
  CURRENT_BUDGET_FLAT_RATE,
  PREVIOUS_BUDGET_CAPTURED_AT,
  PREVIOUS_BUDGET_DEFAULT_DISCOUNT,
  PREVIOUS_BUDGET_LINE_ITEMS_SEED,
  capturePreviousBudgetSnapshot,
  effectiveBudgetDiscount,
  formatBudgetTimestamp,
  parsePreviousBudgetSnapshot,
  previousBudgetTabLabel,
  restoreCanonicalPreviousBudget,
} from '../budgetEditions';
import { previousBudgetGrandTotal, previousBudgetPhaseTotal } from '../previousBudgetSeed';

describe('budgetEditions', () => {
  it('keeps the current budget at a flat $10K with no pre-payment discount', () => {
    expect(CURRENT_BUDGET_FLAT_RATE).toBe(10_000);
    expect(effectiveBudgetDiscount('budget', 25)).toBe(0);
    expect(effectiveBudgetDiscount('pay', 25)).toBe(0);
  });

  it('shows the archived discount tier only on the previous budget', () => {
    expect(effectiveBudgetDiscount('previous-budget', PREVIOUS_BUDGET_DEFAULT_DISCOUNT)).toBe(25);
    expect(effectiveBudgetDiscount('previous-budget', 10)).toBe(10);
  });

  it('archives the pre-4:00 PM Pacific Aug 27 meeting budget', () => {
    expect(PREVIOUS_BUDGET_CAPTURED_AT).toBe('2026-08-27T16:00:00-07:00');
    expect(PREVIOUS_BUDGET_LINE_ITEMS_SEED).toHaveLength(11);
    expect(previousBudgetPhaseTotal('phase1_build')).toBe(17_800);
    expect(previousBudgetPhaseTotal('phase2_addons')).toBe(6_200);
    expect(previousBudgetGrandTotal()).toBe(24_000);
    const snap = restoreCanonicalPreviousBudget();
    expect(snap.capturedAt).toBe(PREVIOUS_BUDGET_CAPTURED_AT);
    expect(snap.selectedDiscountTier).toBe(25);
    expect(snap.lineItems).toHaveLength(11);
    expect(previousBudgetTabLabel(snap.capturedAt)).toMatch(/Previous Budget · .+4:00 PM/);
  });

  it('date/time stamps the previous budget tab and snapshot', () => {
    const capturedAt = '2026-08-15T18:30:00.000Z';
    expect(formatBudgetTimestamp(capturedAt).length).toBeGreaterThan(6);
    expect(previousBudgetTabLabel(capturedAt)).toMatch(/^Previous Budget · /);
    expect(previousBudgetTabLabel()).toBe('Previous Budget');
    expect(formatBudgetTimestamp('not-a-date')).toBe('');
    const snap = capturePreviousBudgetSnapshot({
      lineItems: [{ id: 'sprint0' }],
      selectedDiscountTier: 25,
      capturedAt,
    });
    expect(parsePreviousBudgetSnapshot(snap)).toEqual(snap);
    expect(parsePreviousBudgetSnapshot(null)).toBeNull();
  });
});
