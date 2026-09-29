import { describe, expect, it } from "vitest";
import {
  formatHeardAboutStamp,
  heardAboutFromNotes,
  mergeHeardAboutNote,
  parseHeardAboutInput,
} from "../heard-about";

describe("heard about us", () => {
  it("requires a known source on signup", () => {
    expect(parseHeardAboutInput({})).toEqual({
      ok: false,
      error: "Tell us how you heard about us.",
    });
    expect(parseHeardAboutInput({ heardAboutSource: "billboard" })).toEqual({
      ok: false,
      error: "Tell us how you heard about us.",
    });
  });

  it("accepts a listed source and stamps notes", () => {
    expect(parseHeardAboutInput({ heardAbout: { sourceId: "Facebook" } })).toEqual({
      ok: true,
      sourceId: "facebook",
      detail: "",
      label: "Facebook",
      stamp: "Heard about us: Facebook",
    });
    expect(formatHeardAboutStamp("referral")).toBe("Heard about us: GYSH referral link");
  });

  it("requires a short note when the source is Other", () => {
    expect(parseHeardAboutInput({ sourceId: "other" })).toEqual({
      ok: false,
      error: "Please add a short note for Other.",
    });
    expect(parseHeardAboutInput({ sourceId: "other", detail: "Neighbor on my street" })).toMatchObject({
      ok: true,
      sourceId: "other",
      stamp: "Heard about us: Other — Neighbor on my street",
    });
  });

  it("reads and merges the notes stamp without duplicating it", () => {
    const notes = mergeHeardAboutNote("Free GYSH member", "Heard about us: Facebook");
    expect(notes).toBe("Free GYSH member · Heard about us: Facebook");
    expect(heardAboutFromNotes(notes)).toBe("Facebook");
    expect(mergeHeardAboutNote(notes, "Heard about us: Instagram")).toBe(
      "Free GYSH member · Heard about us: Instagram",
    );
    expect(heardAboutFromNotes("plain notes")).toBeNull();
  });
});
