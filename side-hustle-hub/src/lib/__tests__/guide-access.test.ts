import { describe, expect, it } from "vitest";
import {
  resolveGuideAccess,
  tierMeetsMinimum,
  normalizeGuideTier,
  membershipLockedBadgeLabel,
  membershipFeatureLockedBadgeLabel,
  ADULT_GUIDE_MIN_TIER,
  SCHEDULE_SUITE_MIN_TIER,
} from "../guide-access";
import { canAccessScheduleSuite } from "../hustle-schedule";
import { tierHasFeature } from "../membership";

describe("guide access gatekeeping", () => {
  it("normalizes unknown tiers to free", () => {
    expect(normalizeGuideTier("gold")).toBe("free");
    expect(normalizeGuideTier("PRO")).toBe("pro");
  });

  it("enforces tier ladder comparisons", () => {
    expect(tierMeetsMinimum("free", "free")).toBe(true);
    expect(tierMeetsMinimum("free", "starter")).toBe(false);
    expect(tierMeetsMinimum("starter", "starter")).toBe(true);
    expect(tierMeetsMinimum("starter", "pro")).toBe(false);
    expect(tierMeetsMinimum("elite", "pro")).toBe(true);
  });

  it("locks guests out of paid guides", () => {
    const locked = resolveGuideAccess({
      isMember: false,
      membershipTier: null,
      minTier: "starter",
    });
    expect(locked.unlocked).toBe(false);
  });

  it("unlocks free guides for free members; guests stay locked", () => {
    const guestFree = resolveGuideAccess({
      isMember: false,
      membershipTier: null,
      minTier: "free",
    });
    expect(guestFree.unlocked).toBe(false);
    expect(guestFree.needsJoin).toBe(true);

    const freeMember = resolveGuideAccess({
      isMember: true,
      membershipTier: "free",
      minTier: "free",
    });
    expect(freeMember.unlocked).toBe(true);

    const freeOnStarterGuide = resolveGuideAccess({
      isMember: true,
      membershipTier: "free",
      minTier: "starter",
    });
    expect(freeOnStarterGuide.unlocked).toBe(false);
    expect(freeOnStarterGuide.needsUpgrade).toBe(true);

    const starterOnStarterGuide = resolveGuideAccess({
      isMember: true,
      membershipTier: "starter",
      minTier: "starter",
    });
    expect(starterOnStarterGuide.unlocked).toBe(true);
  });

  it("keeps elite-only adult guides locked for Starter/Pro", () => {
    const eliteId = Object.entries(ADULT_GUIDE_MIN_TIER).find(([, t]) => t === "elite")?.[0];
    expect(eliteId).toBeTruthy();
    const minTier = ADULT_GUIDE_MIN_TIER[eliteId!];
    expect(
      resolveGuideAccess({ isMember: true, membershipTier: "starter", minTier }).unlocked,
    ).toBe(false);
    expect(
      resolveGuideAccess({ isMember: true, membershipTier: "pro", minTier }).unlocked,
    ).toBe(false);
    expect(
      resolveGuideAccess({ isMember: true, membershipTier: "elite", minTier }).unlocked,
    ).toBe(true);
  });

  it("names the required tier on lock badges", () => {
    expect(membershipLockedBadgeLabel("free")).toBe("Locked · Join Free");
    expect(membershipLockedBadgeLabel("starter")).toBe("Locked · Needs Starter");
    expect(membershipLockedBadgeLabel("pro")).toBe("Locked · Needs Pro");
    expect(membershipLockedBadgeLabel("elite")).toBe("Locked · Needs Elite");
    expect(membershipFeatureLockedBadgeLabel("pnl")).toBe("Locked · Needs Pro");
    expect(membershipFeatureLockedBadgeLabel("schedule_suite")).toBe("Locked · Needs Pro");
    expect(SCHEDULE_SUITE_MIN_TIER).toBe("pro");
  });

  it("aligns Schedule Suite + P&L feature gates with Pro+", () => {
    expect(canAccessScheduleSuite("starter")).toBe(false);
    expect(canAccessScheduleSuite("pro")).toBe(true);
    expect(tierHasFeature("starter", "pnl")).toBe(false);
    expect(tierHasFeature("pro", "pnl")).toBe(true);
    expect(tierHasFeature("elite", "schedule")).toBe(true);
  });
});
