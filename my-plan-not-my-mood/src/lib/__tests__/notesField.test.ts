import { describe, expect, it } from 'vitest';
import {
  NOTES_VISIBLE_ROWS,
  notesLineCount,
  notesNeedFullPopup,
  notesOverflow,
} from '../notesField';

describe('notesField', () => {
  it('keeps inline notes at six visible rows, not two or three', () => {
    expect(NOTES_VISIBLE_ROWS).toBeGreaterThanOrEqual(6);
    expect(notesLineCount('one')).toBe(1);
    expect(notesLineCount('a\nb\nc')).toBe(3);
  });

  it('opens a full popup when notes would overflow the inline box', () => {
    expect(notesNeedFullPopup('Short note')).toBe(false);
    expect(notesNeedFullPopup(['one', 'two', 'three', 'four', 'five', 'six', 'seven'].join('\n'))).toBe(true);
    expect(notesNeedFullPopup('x'.repeat(500))).toBe(true);
    expect(notesOverflow(240, 160)).toBe(true);
    expect(notesOverflow(160, 160)).toBe(false);
  });
});
