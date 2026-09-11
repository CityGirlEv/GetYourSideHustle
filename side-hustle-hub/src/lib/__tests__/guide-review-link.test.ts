import {
  guideCrossLinkLabelFromCaseId,
  guideHrefFromGuideReviewCaseId,
  guideIdFromGuideReviewCaseId,
  guideLibraryActivationPassNote,
  guideReviewCaseIdsForGuide,
  testingPortalHrefForGuide,
} from "../guide-review-link";
import {
  detailedStepsForGuide,
  stepsIncludeTakeBeforePhotos,
} from "../guide-detailed-steps";

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
    expect(guideCrossLinkLabelFromCaseId("GUIDE-REV-launch-handyman")).toBe("Guide · handyman");
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
});

describe("before-photo injection", () => {
  it("ensures car-interior-cleanup has Take Before Photos", () => {
    const steps = detailedStepsForGuide("car-interior-cleanup") ?? [];
    expect(stepsIncludeTakeBeforePhotos(steps)).toBe(true);
  });
});
