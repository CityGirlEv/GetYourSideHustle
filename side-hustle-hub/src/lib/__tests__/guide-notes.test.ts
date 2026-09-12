import { describe, expect, it } from "vitest";
import {
  GUIDE_NOTE_ATTACHMENT_MAX_BYTES,
  guideNoteAttachmentMaxMbLabel,
} from "../guide-note-limits";
import { guideKitForId } from "../guide-tools";
import { guidePrepSectionIds } from "../guide-prep-visibility";

describe("guide note limits", () => {
  it("exposes a generous 25MB ceiling for guide attachments", () => {
    expect(GUIDE_NOTE_ATTACHMENT_MAX_BYTES).toBe(25_000_000);
    expect(guideNoteAttachmentMaxMbLabel()).toBe("25");
  });
});

describe("guidePrepSectionIds notes tab", () => {
  const kit = guideKitForId("handyman");

  it("includes Notes when unlocked and includeNotes is set", () => {
    const ids = guidePrepSectionIds({
      kit,
      includeSteps: true,
      includeCalculator: true,
      includeNotes: true,
    });
    expect(ids).toContain("notes");
    expect(ids[ids.length - 1]).toBe("notes");
  });

  it("keeps Notes on locked preview when includeNotes is set", () => {
    expect(
      guidePrepSectionIds({
        kit,
        prerequisitesOnly: true,
        includeNotes: true,
      }),
    ).toEqual(["prereqs", "notes"]);
  });
});
