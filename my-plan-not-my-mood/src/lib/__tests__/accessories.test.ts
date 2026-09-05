import { describe, expect, it } from 'vitest';
import {
  ACCESSORY_BRAND_NAME,
  ACCESSORY_PAGE_LABEL,
  ACCESSORY_PHASE2_ITEM_LABELS,
  ACCESSORY_PHASE2_ITEMS,
  ACCESSORY_PHASE2_LABEL,
  ACCESSORY_PHASE3_EXAMPLES,
  accessoryBrandedName,
  accessoryPhase2Item,
  accessoriesPhase2Summary,
  DEFAULT_ACCESSORY_TAB,
  isAccessoryPhase2Id,
  resolveAccessoryTab,
} from '../accessories';

describe('accessories', () => {
  it('lists Journal, Planner, and Bracelets as branded Phase 2 accessories', () => {
    expect(ACCESSORY_PAGE_LABEL).toBe('Accessories');
    expect(ACCESSORY_PHASE2_LABEL).toBe('Phase 2');
    expect(ACCESSORY_BRAND_NAME).toBe('My Plan, Not My Mood');
    expect(ACCESSORY_PHASE2_ITEMS.map((item) => item.id)).toEqual(['journal', 'planner', 'bracelets']);
    expect(ACCESSORY_PHASE2_ITEM_LABELS).toEqual(['Journal', 'Planner', 'Bracelets']);
    expect(ACCESSORY_PHASE3_EXAMPLES).toEqual(['Journal', 'Planner', 'Bracelets']);
    expect(ACCESSORY_PHASE2_ITEMS.map((item) => item.name)).toEqual([
      'My Plan, Not My Mood Journal',
      'My Plan, Not My Mood Planner',
      'My Plan, Not My Mood Bracelets',
    ]);
    expect(accessoriesPhase2Summary()).toContain('Journal, Planner, Bracelets');
    expect(accessoriesPhase2Summary()).toContain('Phase 2');
  });

  it('resolves accessory tabs and branded names', () => {
    expect(DEFAULT_ACCESSORY_TAB).toBe('journal');
    expect(isAccessoryPhase2Id('planner')).toBe(true);
    expect(isAccessoryPhase2Id('pins')).toBe(false);
    expect(resolveAccessoryTab('bracelets')).toBe('bracelets');
    expect(resolveAccessoryTab('nope')).toBe('journal');
    expect(accessoryPhase2Item('planner').name).toBe('My Plan, Not My Mood Planner');
    expect(accessoryBrandedName('Journal')).toBe('My Plan, Not My Mood Journal');
    expect(accessoryBrandedName('My Plan, Not My Mood Bracelets')).toBe('My Plan, Not My Mood Bracelets');
    expect(accessoryBrandedName('')).toBe('My Plan, Not My Mood');
  });
});
