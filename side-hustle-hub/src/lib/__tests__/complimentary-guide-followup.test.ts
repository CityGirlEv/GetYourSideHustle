import { describe, expect, it } from "vitest";
import {
  complimentaryGuideFollowupAlreadySent,
  complimentaryGuideFollowupUrls,
  COMPLIMENTARY_GUIDE_FOLLOWUP_SLUG,
  isComplimentaryGuideFollowupRecipient,
  isFreeMembershipTier,
} from "../complimentary-guide-followup";

describe("complimentary guide follow-up audience", () => {
  it("targets active Free members who have not picked their extra guide", () => {
    expect(COMPLIMENTARY_GUIDE_FOLLOWUP_SLUG).toBe("complimentary_guide_followup");
    expect(isFreeMembershipTier(null)).toBe(true);
    expect(isFreeMembershipTier("")).toBe(true);
    expect(isFreeMembershipTier("free")).toBe(true);
    expect(isFreeMembershipTier("starter")).toBe(false);
    expect(
      isComplimentaryGuideFollowupRecipient({
        email: "pat@example.com",
        status: "active",
        membershipTier: "free",
        complimentaryPayload: {},
      }),
    ).toBe(true);
    expect(
      isComplimentaryGuideFollowupRecipient({
        email: "pat@example.com",
        status: "active",
        membershipTier: "free",
        complimentaryPayload: { extra: "airbnb", source: "pick" },
      }),
    ).toBe(false);
    expect(
      isComplimentaryGuideFollowupRecipient({
        email: "pat@example.com",
        status: "active",
        membershipTier: "free",
        complimentaryPayload: { extra: "airbnb" },
      }),
    ).toBe(true);
    expect(
      isComplimentaryGuideFollowupRecipient({
        email: "pat@example.com",
        status: "pending",
        membershipTier: "free",
      }),
    ).toBe(false);
    expect(
      isComplimentaryGuideFollowupRecipient({
        email: "pat@example.com",
        status: "active",
        membershipTier: "pro",
      }),
    ).toBe(false);
    expect(
      isComplimentaryGuideFollowupRecipient({
        email: "deleted.u-1@users.deleted.local",
        status: "active",
        membershipTier: "free",
      }),
    ).toBe(false);
  });

  it("points the CTA at Match Wizard and skips addresses already emailed", () => {
    const urls = complimentaryGuideFollowupUrls();
    expect(urls.match).toBe("https://getyoursidehustle.com/match");
    expect(urls.guides).toBe("https://getyoursidehustle.com/guides");
    const sent = new Set(["pat@example.com"]);
    expect(complimentaryGuideFollowupAlreadySent(sent, "Pat@example.com")).toBe(true);
    expect(complimentaryGuideFollowupAlreadySent(sent, "new@example.com")).toBe(false);
  });
});
