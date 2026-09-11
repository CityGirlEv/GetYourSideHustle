import { describe, expect, it } from "vitest";
import {
  resolveGuideAccess,
  tierMeetsMinimum,
  normalizeGuideTier,
  membershipLockedBadgeLabel,
  membershipFeatureLockedBadgeLabel,
  openGuideFreeBadgeLabel,
  unlockCtaTierPill,
  tierAndAboveLabel,
  tierAndAbovePlans,
  TIER_LADDER_GLOSSARY,
  CREDITS_AND_CONSULTING_BLURB,
  NOW_VS_COMING_SOON_BLURB,
  COMING_SOON_NOT_UNLOCKED_NOTE,
  NO_PLUS_PLAN_NOTE,
  ADULT_GUIDE_MIN_TIER,
  SCHEDULE_SUITE_MIN_TIER,
  GUIDE_PDF_MIN_TIER,
  guidePdfAvailableLabel,
  adultGuideMinTier,
  kidsGuideMinTier,
  seniorGuideMinTier,
  type GuideMinTier,
} from "../guide-access";
import { canAccessPnl, canAccessScheduleSuite } from "../hustle-schedule";
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

  it("gates guide PDF downloads to Starter or higher", () => {
    expect(GUIDE_PDF_MIN_TIER).toBe("starter");
    expect(guidePdfAvailableLabel()).toBe("Available on Starter or higher");
    expect(
      resolveGuideAccess({
        isMember: true,
        membershipTier: "free",
        minTier: GUIDE_PDF_MIN_TIER,
      }).unlocked,
    ).toBe(false);
    expect(
      resolveGuideAccess({
        isMember: true,
        membershipTier: "starter",
        minTier: GUIDE_PDF_MIN_TIER,
      }).unlocked,
    ).toBe(true);
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

  it("unlocks every guide for Admin (including Elite-only)", () => {
    const eliteId = Object.entries(ADULT_GUIDE_MIN_TIER).find(([, t]) => t === "elite")?.[0];
    expect(eliteId).toBeTruthy();
    const minTier = ADULT_GUIDE_MIN_TIER[eliteId!];
    const admin = resolveGuideAccess({
      isMember: true,
      membershipTier: "free",
      minTier,
      isAdmin: true,
    });
    expect(admin.unlocked).toBe(true);
    expect(admin.needsUpgrade).toBe(false);
    expect(admin.adminViewOnly).toBe(true);
    expect(
      resolveGuideAccess({
        isMember: false,
        membershipTier: null,
        minTier: "elite",
        isAdmin: true,
      }).unlocked,
    ).toBe(true);
  });

  it("marks Admin view only only when membership would not unlock the guide", () => {
    expect(
      resolveGuideAccess({
        isMember: true,
        membershipTier: "free",
        minTier: "free",
        isAdmin: true,
      }).adminViewOnly,
    ).toBe(false);
    expect(
      resolveGuideAccess({
        isMember: true,
        membershipTier: "elite",
        minTier: "elite",
        isAdmin: true,
      }).adminViewOnly,
    ).toBe(false);
    expect(
      resolveGuideAccess({
        isMember: true,
        membershipTier: "free",
        minTier: "starter",
        isAdmin: true,
      }).adminViewOnly,
    ).toBe(true);
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
    expect(membershipLockedBadgeLabel("starter")).toBe("Locked · Needs Starter or higher");
    expect(membershipLockedBadgeLabel("pro")).toBe("Locked · Needs Pro or higher");
    expect(membershipLockedBadgeLabel("elite")).toBe("Locked · Needs Elite");
    expect(membershipFeatureLockedBadgeLabel("pnl")).toBe("Locked · Needs Elite");
    expect(membershipFeatureLockedBadgeLabel("schedule_suite")).toBe("Locked · Needs Pro or higher");
    expect(SCHEDULE_SUITE_MIN_TIER).toBe("pro");
  });

  it("keeps unlock CTA pills aligned with lock badges (or higher, never Starter+/Pro+)", () => {
    expect(unlockCtaTierPill("free")).toBe("(FREE)");
    expect(unlockCtaTierPill("starter")).toBe("Starter or higher");
    expect(unlockCtaTierPill("pro")).toBe("Pro or higher");
    expect(unlockCtaTierPill("elite")).toBe("Elite");
    expect(tierAndAboveLabel("starter")).toBe("Starter or higher");
    expect(tierAndAbovePlans("starter")).toBe("Starter, Pro, or Elite");
    expect(tierAndAbovePlans("pro")).toBe("Pro or Elite");
    const paidTiers: GuideMinTier[] = ["starter", "pro", "elite"];
    for (const t of paidTiers) {
      expect(membershipLockedBadgeLabel(t)).toBe(`Locked · Needs ${unlockCtaTierPill(t)}`);
    }
  });

  it("explains four plans only, credits vs packs, and coming soon vs available now", () => {
    expect(TIER_LADDER_GLOSSARY).toMatch(/exactly four plans/i);
    expect(TIER_LADDER_GLOSSARY).toMatch(/Starter or higher/i);
    expect(TIER_LADDER_GLOSSARY).toMatch(/not a fifth plan/i);
    expect(TIER_LADDER_GLOSSARY).not.toMatch(/& Above/);
    expect(NO_PLUS_PLAN_NOTE).toMatch(/no Starter\+ or Pro\+/i);
    expect(CREDITS_AND_CONSULTING_BLURB).toMatch(/credit pack/i);
    expect(CREDITS_AND_CONSULTING_BLURB).toMatch(/consulting/i);
    expect(NOW_VS_COMING_SOON_BLURB).toMatch(/Available now/i);
    expect(NOW_VS_COMING_SOON_BLURB).toMatch(/Coming soon/i);
    expect(NOW_VS_COMING_SOON_BLURB).toMatch(/does not unlock/i);
    expect(COMING_SOON_NOT_UNLOCKED_NOTE).toMatch(/not unlocked by membership/i);
  });

  it("puts a Free badge on Open-guide buttons only for Free-plan guides", () => {
    expect(openGuideFreeBadgeLabel("free")).toBe("Free");
    expect(openGuideFreeBadgeLabel("starter")).toBeNull();
    expect(openGuideFreeBadgeLabel("pro")).toBeNull();
    expect(openGuideFreeBadgeLabel("elite")).toBeNull();
  });

  it("omits membership bubbles on Free guides; paid guides show plans that include them", async () => {
    const { membershipsIncludedForMinTier, guideTierBadgeClass } = await import("../guide-access");
    expect(membershipsIncludedForMinTier("free")).toEqual(["free"]);
    expect(membershipsIncludedForMinTier("starter")).toEqual(["starter"]);
    expect(membershipsIncludedForMinTier("pro")).toEqual(["pro"]);
    expect(membershipsIncludedForMinTier("elite")).toEqual(["elite"]);
    expect(guideTierBadgeClass("free")).toBe("free");
    expect(guideTierBadgeClass("pro")).toBe("pro");
    expect(guideTierBadgeClass("elite")).toBe("elite");
  });

  it("aligns Schedule Suite with Pro or higher and P&L with Elite", () => {
    expect(canAccessScheduleSuite("starter")).toBe(false);
    expect(canAccessScheduleSuite("pro")).toBe(true);
    expect(canAccessPnl("starter")).toBe(false);
    expect(canAccessPnl("pro")).toBe(false);
    expect(canAccessPnl("elite")).toBe(true);
    expect(tierHasFeature("starter", "pnl")).toBe(false);
    expect(tierHasFeature("pro", "pnl")).toBe(false);
    expect(tierHasFeature("elite", "pnl")).toBe(true);
    expect(tierHasFeature("elite", "schedule")).toBe(true);
  });

  it("gates AI guides — coffee chat Starter; other AI + Digital Cookbook Elite", () => {
    expect(adultGuideMinTier("ai-peers")).toBe("starter");
    expect(seniorGuideMinTier("ai-peer-class")).toBe("starter");
    expect(adultGuideMinTier("amazon")).toBe("elite");
    expect(adultGuideMinTier("ai-social-helper")).toBe("elite");
    expect(adultGuideMinTier("ai-prompt-helper")).toBe("elite");
    expect(adultGuideMinTier("create-games-kids")).toBe("elite");
    expect(adultGuideMinTier("digital-cookbook-creator")).toBe("elite");
    expect(adultGuideMinTier("ai-assets")).toBe("elite");
    expect(adultGuideMinTier("ai-agents")).toBe("elite");
    expect(adultGuideMinTier("ai-promo-video")).toBe("elite");
    expect(kidsGuideMinTier("kids-games-ai")).toBe("elite");
    expect(kidsGuideMinTier("junior-games-ai")).toBe("elite");
    expect(kidsGuideMinTier("digital-cookbook-creator")).toBe("elite");
    expect(kidsGuideMinTier("create-games-junior")).toBe("elite");
    expect(
      resolveGuideAccess({
        isMember: true,
        membershipTier: "free",
        minTier: adultGuideMinTier("ai-peers"),
      }).unlocked,
    ).toBe(false);
    expect(
      resolveGuideAccess({
        isMember: true,
        membershipTier: "starter",
        minTier: adultGuideMinTier("ai-peers"),
      }).unlocked,
    ).toBe(true);
    for (const id of ["ai-assets", "ai-social-helper", "create-games-kids", "digital-cookbook-creator"]) {
      expect(
        resolveGuideAccess({
          isMember: true,
          membershipTier: "free",
          minTier: adultGuideMinTier(id),
        }).unlocked,
      ).toBe(false);
      expect(
        resolveGuideAccess({
          isMember: true,
          membershipTier: "pro",
          minTier: adultGuideMinTier(id),
        }).unlocked,
      ).toBe(false);
      expect(
        resolveGuideAccess({
          isMember: true,
          membershipTier: "elite",
          minTier: adultGuideMinTier(id),
        }).unlocked,
      ).toBe(true);
    }
  });
});
