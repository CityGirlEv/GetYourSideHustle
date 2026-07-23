import { describe, expect, it } from "vitest";
import {
  LEGACY_EPOCH,
  PRIOR_NOTE_AUTHOR,
  appendActorNote,
  applyNoteDrafts,
  authorsMatch,
  canEditNoteEntry,
  createNoteEntry,
  formatNoteEntryStamp,
  mergeNoteEntries,
  noteEntriesPlainText,
  parseNoteEntries,
  serializeNoteEntries,
} from "../gysh-note-entries";

describe("gysh-note-entries", () => {
  it("parses prior plain text as a read-only note with author + date when known", () => {
    const entries = parseNoteEntries("Old note from before", {
      author: "Tina Marie",
      at: "2026-06-15T18:00:00.000Z",
    });
    expect(entries).toHaveLength(1);
    expect(entries[0]!.author).toBe("Tina Marie");
    expect(entries[0]!.createdAt).toBe("2026-06-15T18:00:00.000Z");
    expect(entries[0]!.text).toBe("Old note from before");
    expect(canEditNoteEntry(entries[0]!, "Tina Marie")).toBe(false);
    expect(formatNoteEntryStamp(entries[0]!)).toContain("Tina Marie · ");
  });

  it("does not show epoch Legacy stamp for unattributed prior notes", () => {
    const entries = parseNoteEntries("Old note from before");
    expect(entries[0]!.author).toBe(PRIOR_NOTE_AUTHOR);
    expect(entries[0]!.createdAt).toBe("");
    expect(formatNoteEntryStamp(entries[0]!)).toBe(PRIOR_NOTE_AUTHOR);
    expect(formatNoteEntryStamp(entries[0]!)).not.toContain("1969");
  });

  it("heals stored Legacy + epoch JSON using task audit attribution", () => {
    const stored = serializeNoteEntries([
      {
        id: "legacy",
        author: "Legacy",
        createdAt: LEGACY_EPOCH,
        updatedAt: LEGACY_EPOCH,
        text: "Previous note body",
      },
    ]);
    const entries = parseNoteEntries(stored, {
      author: "Evelyn Irving",
      at: "2026-07-01T12:00:00.000Z",
    });
    expect(entries[0]!.author).toBe("Evelyn Irving");
    expect(entries[0]!.updatedAt).toBe("2026-07-01T12:00:00.000Z");
    expect(entries[0]!.text).toBe("Previous note body");
  });

  it("round-trips structured notes", () => {
    const a = createNoteEntry("Tina", "First look", "2026-07-20T12:00:00.000Z");
    const b = createNoteEntry("Evelyn", "Follow-up", "2026-07-21T08:00:00.000Z");
    const raw = serializeNoteEntries([a, b]);
    const back = parseNoteEntries(raw);
    expect(back).toHaveLength(2);
    expect(back[0]!.author).toBe("Tina");
    expect(back[1]!.text).toBe("Follow-up");
    expect(noteEntriesPlainText(raw)).toContain("First look");
  });

  it("retains other authors' notes and only lets actor edit their own", () => {
    const tina = createNoteEntry("Tina", "Tina note", "2026-07-20T12:00:00.000Z");
    const evelyn = createNoteEntry("Evelyn", "Evelyn note", "2026-07-20T13:00:00.000Z");
    const prev = serializeNoteEntries([tina, evelyn]);

    const tampered = serializeNoteEntries([
      { ...tina, text: "Hijacked" },
      { ...evelyn, text: "Evelyn edited her note" },
    ]);
    const merged = mergeNoteEntries(prev, tampered, "Evelyn", "2026-07-21T10:00:00.000Z");
    expect(merged.ok).toBe(true);
    if (!merged.ok) return;
    const entries = parseNoteEntries(merged.notes);
    expect(entries.find((e) => e.id === tina.id)?.text).toBe("Tina note");
    expect(entries.find((e) => e.id === evelyn.id)?.text).toBe("Evelyn edited her note");
    expect(entries.find((e) => e.id === evelyn.id)?.updatedAt).toBe("2026-07-21T10:00:00.000Z");
  });

  it("lets actor add a note and delete only their own", () => {
    const tina = createNoteEntry("Tina", "Keep me", "2026-07-20T12:00:00.000Z");
    const evelyn = createNoteEntry("Evelyn", "Remove me", "2026-07-20T13:00:00.000Z");
    const prev = serializeNoteEntries([tina, evelyn]);
    const incoming = serializeNoteEntries([
      tina,
      createNoteEntry("Evelyn", "Brand new", "2026-07-21T11:00:00.000Z"),
    ]);
    const merged = mergeNoteEntries(prev, incoming, "Evelyn");
    expect(merged.ok).toBe(true);
    if (!merged.ok) return;
    const entries = parseNoteEntries(merged.notes);
    expect(entries.map((e) => e.text)).toEqual(["Keep me", "Brand new"]);
  });

  it("formats stamp as author name with date/time", () => {
    const entry = createNoteEntry("Tina Marie", "Hello", "2026-07-21T14:30:00.000Z");
    const stamp = formatNoteEntryStamp(entry);
    expect(stamp.startsWith("Tina Marie · ")).toBe(true);
    expect(stamp.length).toBeGreaterThan("Tina Marie · ".length);
  });

  it("appendActorNote skips duplicate of latest own text", () => {
    const once = appendActorNote("", "Tina", "Hello");
    const twice = appendActorNote(once, "Tina", "Hello");
    expect(parseNoteEntries(once)).toHaveLength(1);
    expect(parseNoteEntries(twice)).toHaveLength(1);
    const third = appendActorNote(twice, "Tina", "Hello again");
    expect(parseNoteEntries(third)).toHaveLength(2);
  });

  it("applyNoteDrafts updates own note and appends new", () => {
    const mine = createNoteEntry("Tina", "Draft me", "2026-07-20T12:00:00.000Z");
    const other = createNoteEntry("Evelyn", "Other", "2026-07-20T13:00:00.000Z");
    const prev = serializeNoteEntries([mine, other]);
    const next = applyNoteDrafts(
      prev,
      "Tina",
      { [mine.id]: "Updated draft" },
      "Extra note",
      "2026-07-21T12:00:00.000Z",
    );
    const entries = parseNoteEntries(next);
    expect(entries.find((e) => e.id === mine.id)?.text).toBe("Updated draft");
    expect(entries.find((e) => e.id === other.id)?.text).toBe("Other");
    expect(entries.some((e) => e.text === "Extra note" && authorsMatch(e.author, "Tina"))).toBe(
      true,
    );
  });
});
