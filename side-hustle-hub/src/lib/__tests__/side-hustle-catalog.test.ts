import { describe, expect, it } from "vitest";
import {
  AI_SIDE_HUSTLE_ELITE_IDS,
  AI_SIDE_HUSTLE_PRO_IDS,
  FREE_WIZARD_HUSTLE_IDS,
  FREE_WIZARD_MIN,
  PRESERVED_HUSTLE_IDS,
  SIDE_HUSTLES,
  STARTER_SPREAD_HUSTLE_IDS,
  filterSideHustles,
  freeWizardPool,
  freeWizardPoolCounts,
  guideSideHustleDescription,
  hustleById,
  hustlesForAudience,
  isAiSideHustle,
  wizardPoolForMembership,
} from "../side-hustle-catalog";
import { canAccessScheduleSuite } from "../hustle-schedule";
import { SCHEDULE_SUITE_TIER } from "../membership";
import { buildLaunchKit } from "../guide-links";

describe("side-hustle-catalog expansion", () => {
  it("preserves every core existing hustle id", () => {
    for (const id of PRESERVED_HUSTLE_IDS) {
      expect(hustleById(id), id).toBeTruthy();
    }
  });

  it("has unique hustle ids", () => {
    const ids = SIDE_HUSTLES.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("caps Free Wizard pools with 5+ per demographic", () => {
    const uniqueFree = SIDE_HUSTLES.filter((h) => h.freeWizardEligible);
    expect(uniqueFree.length).toBe(FREE_WIZARD_HUSTLE_IDS.length);
    expect(uniqueFree.length).toBeGreaterThanOrEqual(10);
    expect(uniqueFree.length).toBeLessThanOrEqual(20);
    const counts = freeWizardPoolCounts();
    expect(counts.kids).toBeGreaterThanOrEqual(FREE_WIZARD_MIN);
    expect(counts.junior).toBeGreaterThanOrEqual(FREE_WIZARD_MIN);
    expect(counts.adult).toBeGreaterThanOrEqual(FREE_WIZARD_MIN);
    expect(counts.senior).toBeGreaterThanOrEqual(FREE_WIZARD_MIN);
  });

  it("keeps Free Wizard list bounded and Starter spread lean", () => {
    expect(FREE_WIZARD_HUSTLE_IDS.length).toBeLessThanOrEqual(20);
    expect(FREE_WIZARD_HUSTLE_IDS.length).toBeGreaterThanOrEqual(10);
    // Starter list stays lean (~entry local); Pro absorbs the former Starter chunk
    expect(STARTER_SPREAD_HUSTLE_IDS.length).toBeGreaterThanOrEqual(5);
    expect(STARTER_SPREAD_HUSTLE_IDS.length).toBeLessThanOrEqual(12);
  });

  it("Launch Guides include more Starter+Pro than Free alone", async () => {
    const { LAUNCH_GUIDES } = await import("../launch-guides");
    const { adultGuideMinTier } = await import("../guide-access");
    const counts = { free: 0, starter: 0, pro: 0, elite: 0 };
    for (const g of LAUNCH_GUIDES) {
      counts[adultGuideMinTier(g.id)] += 1;
    }
    expect(counts.free).toBe(FREE_WIZARD_HUSTLE_IDS.length);
    expect(counts.starter + counts.pro).toBeGreaterThanOrEqual(counts.free);
    expect(counts.starter).toBeGreaterThanOrEqual(8);
  });

  it("expands shared local hustles across age lanes without mirroring all Adults", () => {
    expect(hustleById("dog-walk")?.audiences).toEqual(
      expect.arrayContaining(["kids", "junior", "adult", "senior"]),
    );
    expect(hustleById("pet-sitting")?.audiences).toEqual(
      expect.arrayContaining(["junior", "adult", "senior"]),
    );
    expect(hustleById("handyman")?.audiences).toEqual(
      expect.arrayContaining(["adult", "senior"]),
    );
    expect(hustleById("handyman")?.audiences).not.toContain("junior");
    expect(hustleById("crafts")?.audiences).toEqual(
      expect.arrayContaining(["kids", "junior", "adult", "senior"]),
    );
  });

  it("curates senior and teen audiences instead of copying Adult", () => {
    const adultN = hustlesForAudience("adult").length;
    const seniorN = hustlesForAudience("senior").length;
    const juniorN = hustlesForAudience("junior").length;
    expect(seniorN).toBeLessThan(adultN);
    expect(juniorN).toBeLessThan(adultN);
    expect(seniorN).toBeGreaterThanOrEqual(25);
    expect(juniorN).toBeGreaterThanOrEqual(25);
    // Adult-coded hustles stay off Teens
    expect(hustleById("rideshare")?.audiences).not.toContain("junior");
    expect(hustleById("airbnb")?.audiences).not.toContain("junior");
    expect(hustleById("consulting")?.audiences).not.toContain("junior");
    expect(hustleById("dropshipping")?.audiences).not.toContain("junior");
    expect(hustleById("dropshipping")?.audiences).toContain("senior");
    expect(hustleById("amazon")?.audiences).not.toContain("senior");
    // Teen-coded stays on Teens
    expect(hustleById("create-games-junior")?.audiences).toContain("junior");
    expect(hustleById("ai-peers")?.audiences).toContain("senior");
    expect(hustleById("ai-peers")?.audiences).not.toContain("junior");
  });

  it("dedupes proposed overlaps onto existing ids", () => {
    expect(hustleById("dog-walker")).toBeUndefined();
    expect(hustleById("pet-sitter")).toBeUndefined();
    expect(hustleById("dog-walk")).toBeTruthy();
    expect(hustleById("pet-sitting")).toBeTruthy();
  });

  it("filters No Money? Start Here / zero-start collection", () => {
    const zero = filterSideHustles({ noMoneyStartHere: true });
    expect(zero.length).toBeGreaterThan(10);
    expect(zero.every((h) => h.zeroStart)).toBe(true);
  });

  it("keeps AI hustles at Elite", () => {
    expect(hustleById("ai-peers")?.minTier).toBe("elite");
    expect(hustleById("ai-peers")?.freeWizardEligible).toBe(false);
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain("ai-peers");
    for (const h of SIDE_HUSTLES.filter(isAiSideHustle)) {
      expect(h.minTier).toBe("elite");
      expect(h.freeWizardEligible).toBe(false);
      expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(h.id);
    }
    expect(AI_SIDE_HUSTLE_PRO_IDS).toHaveLength(0);
    for (const id of AI_SIDE_HUSTLE_ELITE_IDS) {
      expect(hustleById(id)?.minTier).toBe("elite");
    }
    expect(hustleById("digital-cookbook-creator")?.minTier).toBe("elite");
  });

  it("limits Free/guest wizard pools vs paid member full pools", () => {
    const freeAdult = wizardPoolForMembership("adult", {
      isLoggedIn: true,
      membershipTier: "free",
    });
    const proAdult = wizardPoolForMembership("adult", {
      isLoggedIn: true,
      membershipTier: "pro",
    });
    const guest = wizardPoolForMembership("adult", {
      isLoggedIn: false,
      previewAsGuest: true,
    });
    expect(freeAdult.length).toBe(freeWizardPool("adult").length);
    expect(guest.length).toBe(freeWizardPool("adult").length);
    expect(proAdult.length).toBe(hustlesForAudience("adult").length);
    expect(proAdult.length).toBeGreaterThan(freeAdult.length);
  });

  it("keeps Schedule Suite restricted to Pro (not Free)", () => {
    expect(SCHEDULE_SUITE_TIER).toBe("pro");
    expect(canAccessScheduleSuite("free")).toBe(false);
    expect(canAccessScheduleSuite("starter")).toBe(false);
    expect(canAccessScheduleSuite("pro")).toBe(true);
  });

  it("builds launch kits from existing guides only", () => {
    const kit = buildLaunchKit("handyman");
    expect(kit.length).toBeGreaterThan(0);
    expect(kit.some((i) => i.kind === "schedule")).toBe(true);
  });

  it("guideSideHustleDescription prefers catalog description over generic whoItsGoodFor", () => {
    const mothers = hustleById("mothers-helper");
    expect(mothers?.description).toMatch(/parent present/i);
    expect(guideSideHustleDescription("mothers-helper")).toBe(mothers!.description);
    expect(guideSideHustleDescription("mothers-helper")).not.toBe(
      "People who match the skills and schedule notes below",
    );
    expect(guideSideHustleDescription("pod")).toMatch(/shirts|mugs|merchandise/i);
  });
});
