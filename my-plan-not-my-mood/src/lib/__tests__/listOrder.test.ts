import { describe, expect, it } from 'vitest';
import { clampListIndex, reorderKeyedGroups, reorderListByIndex } from '../listOrder';

describe('listOrder', () => {
  it('moves an item to a new index and leaves a no-op in place', () => {
    expect(clampListIndex(-1, 4)).toBe(0);
    expect(clampListIndex(9, 4)).toBe(3);
    expect(reorderListByIndex(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(reorderListByIndex(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
    expect(reorderListByIndex(['a', 'b'], 0, 0)).toEqual(['a', 'b']);
    expect(reorderListByIndex(['only'], 0, 1)).toEqual(['only']);
  });

  it('reorders one group without mixing in other groups', () => {
    const rows = [
      { id: 'l1', family: 'letters' },
      { id: 't1', family: 'tie-dye' },
      { id: 'l2', family: 'letters' },
      { id: 't2', family: 'tie-dye' },
    ];
    expect(reorderKeyedGroups(rows, 'tie-dye', (row) => row.family, 0, 1).map((row) => row.id)).toEqual([
      'l1',
      't2',
      'l2',
      't1',
    ]);
    expect(reorderKeyedGroups(rows, 'letters', (row) => row.family, 1, 0).map((row) => row.id)).toEqual([
      'l2',
      't1',
      'l1',
      't2',
    ]);
  });
});
