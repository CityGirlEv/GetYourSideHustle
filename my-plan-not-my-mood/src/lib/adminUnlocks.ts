const LINE_ITEM_UNLOCK_KEY = 'myplan_unlock_line_item_breakdown';

export function isLineItemBreakdownUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(LINE_ITEM_UNLOCK_KEY) === '1';
}

export function setLineItemBreakdownUnlocked(unlocked: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LINE_ITEM_UNLOCK_KEY, unlocked ? '1' : '0');
}

export function canSeeLineItemBreakdown(opts: {
  canViewBudget: boolean;
  unlockedForAdmins: boolean;
}): boolean {
  return opts.canViewBudget || opts.unlockedForAdmins;
}
