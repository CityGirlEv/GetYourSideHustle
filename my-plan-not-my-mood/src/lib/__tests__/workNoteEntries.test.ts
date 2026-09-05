import { describe, expect, it } from 'vitest';
import {
  addWorkNote,
  canModifyWorkNote,
  deleteWorkNote,
  parseWorkNotes,
  updateWorkNote,
} from '../workNoteEntries';

describe('workNoteEntries', () => {
  const evelyn = { name: 'Evelyn Irving', email: 'evelyn@example.com', isSuperAdmin: true };
  const angela = { name: 'Angela', email: 'angela@example.com', isSuperAdmin: false };

  it('parses legacy plain text as a prior note', () => {
    const entries = parseWorkNotes('Old freeform note');
    expect(entries).toHaveLength(1);
    expect(entries[0].author).toBe('Prior note');
    expect(entries[0].text).toBe('Old freeform note');
    expect(canModifyWorkNote(entries[0], angela)).toBe(false);
    expect(canModifyWorkNote(entries[0], evelyn)).toBe(true);
  });

  it('stamps author and time on add', () => {
    const raw = addWorkNote('', angela, 'Need Zelle receipt');
    const entries = parseWorkNotes(raw);
    expect(entries).toHaveLength(1);
    expect(entries[0].author).toBe('Angela');
    expect(entries[0].authorEmail).toBe('angela@example.com');
    expect(entries[0].createdAt).toMatch(/^\d{4}-/);
    expect(entries[0].text).toBe('Need Zelle receipt');
  });

  it('lets authors edit/delete own notes; Super Admin can edit all', () => {
    let raw = addWorkNote('', angela, 'Angela note');
    raw = addWorkNote(raw, evelyn, 'Evelyn note');
    const [angelaNote, evelynNote] = parseWorkNotes(raw);

    expect(canModifyWorkNote(angelaNote, angela)).toBe(true);
    expect(canModifyWorkNote(evelynNote, angela)).toBe(false);
    expect(canModifyWorkNote(angelaNote, evelyn)).toBe(true);

    const denied = updateWorkNote(raw, evelynNote.id, 'hack', angela);
    expect(denied.ok).toBe(false);

    const edited = updateWorkNote(raw, angelaNote.id, 'Updated', angela);
    expect(edited.ok).toBe(true);
    if (edited.ok) {
      expect(parseWorkNotes(edited.notes)[0].text).toBe('Updated');
    }

    const deletedByAdmin = deleteWorkNote(raw, angelaNote.id, evelyn);
    expect(deletedByAdmin.ok).toBe(true);
    if (deletedByAdmin.ok) {
      expect(parseWorkNotes(deletedByAdmin.notes)).toHaveLength(1);
      expect(parseWorkNotes(deletedByAdmin.notes)[0].author).toBe('Evelyn Irving');
    }
  });
});
