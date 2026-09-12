import { describe, expect, it } from "vitest";
import {
  guideCrossLinkLabelFromCaseId,
  guideHrefFromGuideReviewCaseId,
  guideIdFromGuideReviewCaseId,
  guideLibraryActivationPassNote,
  guideLibraryPendingFailNote,
  guideReviewCaseIdsForGuide,
  testingPortalHrefForGuide,
} from "../guide-review-link";
import {
  detailedStepsForGuide,
  stepsIncludeTakeBeforePhotos,
} from "../guide-detailed-steps";
import {
  GUIDE_STATUS_NOTE_MIN_LENGTH,
  guideStatusNoteMeetsRequirement,
  guideStatusRequiresNote,
} from "../guide-catalog-state";

describe("guide-review-link", () => {
  it("parses GUIDE-REV case ids and lists audience variants", () => {
    expect(guideIdFromGuideReviewCaseId("GUIDE-REV-launch-handyman")).toBe("handyman");
    expect(guideIdFromGuideReviewCaseId("GUIDE-REV-kids-lemonade-stand")).toBe("lemonade-stand");
    expect(guideReviewCaseIdsForGuide("handyman")).toEqual([
      "GUIDE-REV-launch-handyman",
      "GUIDE-REV-kids-handyman",
      "GUIDE-REV-junior-handyman",
      "GUIDE-REV-senior-handyman",
    ]);
  });

  it("deep-links guides ↔ GUIDE-REV tests both ways", () => {
    expect(testingPortalHrefForGuide("handyman")).toBe(
      "/admin?tab=testing&test=GUIDE-REV-launch-handyman",
    );
    expect(guideHrefFromGuideReviewCaseId("GUIDE-REV-launch-handyman")).toBe(
      "/guides?hustle=handyman",
    );
    const label = guideCrossLinkLabelFromCaseId("GUIDE-REV-launch-handyman");
    expect(label).toMatch(/^Guide · #\d{3} /);
    expect(label).toMatch(/Handyman/i);
  });

  it("builds an activation Pass note with approver and ISO timestamp", () => {
    const note = guideLibraryActivationPassNote({
      guideId: "handyman",
      approvedBy: "Evelyn",
      approvedAt: "2026-09-10T02:00:00.000Z",
    });
    expect(note).toMatch(/Guide passed via Review in the Guide library/i);
    expect(note).toContain("handyman");
    expect(note).toContain("Evelyn");
    expect(note).toContain("2026-09-10T02:00:00.000Z");
  });

  it("builds a Pending fail note that includes the reviewer reason", () => {
    const note = guideLibraryPendingFailNote({
      guideId: "handyman",
      updatedBy: "Lyriq",
      updatedAt: "2026-09-10T02:00:00.000Z",
      reason: "Tools section missing https links",
    });
    expect(note).toMatch(/Pending \/ Needs Further Review/i);
    expect(note).toContain("handyman");
    expect(note).toContain("Lyriq");
    expect(note).toContain("Reason: Tools section missing https links");
  });
});

describe("guide status note gate", () => {
  it("requires a note only for Pending / Needs Further Review", () => {
    expect(guideStatusRequiresNote("pending")).toBe(true);
    expect(guideStatusRequiresNote("active")).toBe(false);
    expect(guideStatusRequiresNote("inactive")).toBe(false);
    expect(GUIDE_STATUS_NOTE_MIN_LENGTH).toBe(8);
    expect(guideStatusNoteMeetsRequirement("short")).toBe(false);
    expect(guideStatusNoteMeetsRequirement("long enough reason")).toBe(true);
  });
});

describe("before-photo injection", () => {
  it("ensures car-interior-cleanup has Take Before Photos", () => {
    const steps = detailedStepsForGuide("car-interior-cleanup") ?? [];
    expect(stepsIncludeTakeBeforePhotos(steps)).toBe(true);
  });
});
