import { describe, expect, it, beforeEach } from 'vitest';
import {
  canSeeLineItemBreakdown,
  isLineItemBreakdownUnlocked,
  setLineItemBreakdownUnlocked,
} from '../adminUnlocks';

describe('adminUnlocks line item breakdown', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps the breakdown locked for Admins until Super Admin unlocks it', () => {
    expect(isLineItemBreakdownUnlocked()).toBe(false);
    expect(canSeeLineItemBreakdown({ canViewBudget: false, unlockedForAdmins: false })).toBe(false);
  });

  it('lets Super Admin see the breakdown even while Admins stay locked', () => {
    expect(canSeeLineItemBreakdown({ canViewBudget: true, unlockedForAdmins: false })).toBe(true);
  });

  it('shows the breakdown to Admins after Super Admin unlocks it', () => {
    setLineItemBreakdownUnlocked(true);
    expect(isLineItemBreakdownUnlocked()).toBe(true);
    expect(canSeeLineItemBreakdown({ canViewBudget: false, unlockedForAdmins: true })).toBe(true);
  });

  it('hides the breakdown from Admins again after Super Admin locks it', () => {
    setLineItemBreakdownUnlocked(true);
    setLineItemBreakdownUnlocked(false);
    expect(isLineItemBreakdownUnlocked()).toBe(false);
    expect(canSeeLineItemBreakdown({ canViewBudget: false, unlockedForAdmins: false })).toBe(false);
  });
});
