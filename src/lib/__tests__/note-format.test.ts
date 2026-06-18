import { describe, it, expect } from "vitest";
import {
  formatNoteTimestamp,
  displayNoteAuthor,
  displayNoteTimestamp,
  normalizeNoteEntry,
  normalizeNoteEntries,
  UNKNOWN_NOTE_AUTHOR,
  LEGACY_NOTE_AUTHOR,
  UNKNOWN_NOTE_DATE_LABEL,
} from "../note-format";

describe("formatNoteTimestamp", () => {
  it("formats ISO timestamps readably", () => {
    const formatted = formatNoteTimestamp("2026-06-09T20:12:00Z");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Jun");
  });

  it("returns the raw string when parsing fails", () => {
    expect(formatNoteTimestamp("not-a-date")).toBe("not-a-date");
  });
});

describe("displayNoteAuthor", () => {
  it("uses the provided name when present", () => {
    expect(displayNoteAuthor("Jane Doe", "user-1")).toBe("Jane Doe");
  });

  it("falls back to Unknown author when id exists but name is missing", () => {
    expect(displayNoteAuthor("", "user-1")).toBe(UNKNOWN_NOTE_AUTHOR);
    expect(displayNoteAuthor(null, "user-1")).toBe(UNKNOWN_NOTE_AUTHOR);
  });

  it("falls back to Legacy note when both name and id are missing", () => {
    expect(displayNoteAuthor("", "")).toBe(LEGACY_NOTE_AUTHOR);
    expect(displayNoteAuthor(null, null)).toBe(LEGACY_NOTE_AUTHOR);
  });
});

describe("displayNoteTimestamp", () => {
  it("formats valid timestamps", () => {
    const formatted = displayNoteTimestamp("2026-06-09T20:12:00Z");
    expect(formatted).toContain("2026");
  });

  it("returns Date unknown for missing or invalid values", () => {
    expect(displayNoteTimestamp("")).toBe(UNKNOWN_NOTE_DATE_LABEL);
    expect(displayNoteTimestamp(null)).toBe(UNKNOWN_NOTE_DATE_LABEL);
    expect(displayNoteTimestamp("not-a-date")).toBe(UNKNOWN_NOTE_DATE_LABEL);
  });
});

describe("normalizeNoteEntry", () => {
  it("converts plain string notes to legacy entries", () => {
    expect(normalizeNoteEntry("old flat note", { fallbackAt: "2026-01-15T10:00:00Z" })).toEqual({
      author_id: "",
      author_name: LEGACY_NOTE_AUTHOR,
      text: "old flat note",
      at: "2026-01-15T10:00:00Z",
    });
  });

  it("fills missing fields on partial objects", () => {
    expect(
      normalizeNoteEntry(
        { text: "partial", author_id: "user-a" },
        { fallbackAt: "2026-01-15T10:00:00Z" },
      ),
    ).toEqual({
      author_id: "user-a",
      author_name: UNKNOWN_NOTE_AUTHOR,
      text: "partial",
      at: "2026-01-15T10:00:00Z",
    });
  });

  it("preserves attachment metadata on structured entries", () => {
    expect(
      normalizeNoteEntry({
        text: "See attached log",
        author_id: "user-a",
        author_name: "Jane Doe",
        at: "2026-06-09T20:12:00Z",
        attachment_path: "user-a/T1/123-log.txt",
        attachment_name: "log.txt",
      }),
    ).toEqual({
      author_id: "user-a",
      author_name: "Jane Doe",
      text: "See attached log",
      at: "2026-06-09T20:12:00Z",
      attachment_path: "user-a/T1/123-log.txt",
      attachment_name: "log.txt",
    });
  });

  it("returns null for empty values", () => {
    expect(normalizeNoteEntry("   ")).toBeNull();
    expect(normalizeNoteEntry({ text: "" })).toBeNull();
    expect(normalizeNoteEntry(null)).toBeNull();
  });
});

describe("normalizeNoteEntries", () => {
  it("normalizes mixed legacy and structured arrays", () => {
    const rows = normalizeNoteEntries(
      [
        "legacy string",
        { text: "structured", author_name: "Catria", author_id: "u1", at: "2026-06-01T00:00:00Z" },
        { text: "missing meta", author_id: "u2" },
      ],
      "2026-05-01T12:00:00Z",
    );
    expect(rows).toHaveLength(3);
    expect(rows[0].author_name).toBe(LEGACY_NOTE_AUTHOR);
    expect(rows[0].at).toBe("2026-05-01T12:00:00Z");
    expect(rows[1].author_name).toBe("Catria");
    expect(rows[2].author_name).toBe(UNKNOWN_NOTE_AUTHOR);
    expect(rows[2].at).toBe("2026-05-01T12:00:00Z");
  });

  it("returns empty array for non-arrays", () => {
    expect(normalizeNoteEntries(null)).toEqual([]);
    expect(normalizeNoteEntries("note")).toEqual([]);
  });
});
