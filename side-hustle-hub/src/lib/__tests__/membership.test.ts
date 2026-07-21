import { describe, expect, it } from "vitest";
import {
  CREDIT_EARN_ACTIONS,
  CREDIT_PACKS,
  MEMBER_PERKS_BY_TIER,
  MEMBERSHIP_TIERS,
  MILITARY_VETERAN_CALLOUT,
  SCHEDULE_SUITE_FEATURE_IDS,
  SCHEDULE_SUITE_TIER,
  numberedTierPerks,
  tierHasFeature,
  tierKidCredits,
  adultCreditsFromKidCredits,
  kidCreditsFeatureLabel,
  oneOnOneFeatureLabel,
} from "../membership";

describe("membership catalog", () => {
  it("defines Free, Starter, Pro, and Elite", () => {
    expect(MEMBERSHIP_TIERS.map((t) => t.id)).toEqual(["free", "starter", "pro", "elite"]);
  });

  it("unlocks the schedule suite at Pro", () => {
    expect(SCHEDULE_SUITE_TIER).toBe("pro");
    for (const featureId of SCHEDULE_SUITE_FEATURE_IDS) {
      expect(tierHasFeature("free", featureId)).toBe(false);
      expect(tierHasFeature("starter", featureId)).toBe(false);
      expect(tierHasFeature("pro", featureId)).toBe(true);
      expect(tierHasFeature("elite", featureId)).toBe(true);
    }
  });

  it("lists credit earn actions for Kids and Juniors", () => {
    const kids = CREDIT_EARN_ACTIONS.filter((a) => a.audiences.includes("kids"));
    const juniors = CREDIT_EARN_ACTIONS.filter((a) => a.audiences.includes("junior"));
    expect(kids.length).toBeGreaterThan(3);
    expect(juniors.length).toBeGreaterThan(3);
  });

  it("offers parent-funded credit packs with volume pricing", () => {
    expect(CREDIT_PACKS.map((pack) => pack.credits)).toEqual([25, 60, 140, 300]);
    expect(CREDIT_PACKS.map((pack) => pack.priceUsd)).toEqual([5, 10, 20, 40]);

    const unitPrices = CREDIT_PACKS.map((pack) => pack.priceUsd / pack.credits);
    for (let i = 1; i < unitPrices.length; i += 1) {
      expect(unitPrices[i]).toBeLessThan(unitPrices[i - 1]);
    }
  });

  it("includes Kid Credits on paid membership packages only", () => {
    expect(tierKidCredits("free")).toBe(0);
    expect(tierKidCredits("starter")).toBe(30);
    expect(tierKidCredits("pro")).toBe(60);
    expect(tierKidCredits("elite")).toBe(120);
  });

  it("maps kid credits to adult credits at half rate", () => {
    expect(adultCreditsFromKidCredits(60)).toBe(30);
    expect(adultCreditsFromKidCredits(120)).toBe(60);
    expect(kidCreditsFeatureLabel("pro")).toBe("60 Kid Credits (30 adult credits)");
    expect(kidCreditsFeatureLabel("elite")).toBe("120 Kid Credits (60 adult credits)");
  });

  it("lists referral earn actions for every audience", () => {
    const referral = CREDIT_EARN_ACTIONS.find((a) => a.id === "refer_friend");
    expect(referral?.credits).toBe(40);
    expect(referral?.audiences).toEqual(expect.arrayContaining(["kids", "junior", "adult", "senior"]));
  });

  it("labels included consulting sessions by tier", () => {
    expect(oneOnOneFeatureLabel("starter")).toBe("1× 1-hour session");
    expect(oneOnOneFeatureLabel("pro")).toBe("3× 60-minute sessions");
    expect(oneOnOneFeatureLabel("elite")).toBe("3× 90-minute sessions");
  });

  it("surfaces military and veteran messaging for Adults and Seniors only", () => {
    expect(MILITARY_VETERAN_CALLOUT.audiences).toEqual(["adult", "senior"]);
    expect(MILITARY_VETERAN_CALLOUT.badge).toMatch(/Military/i);
    expect(MILITARY_VETERAN_CALLOUT.body).toMatch(/Veterans save even more/i);
    // No invented Stripe amounts — senior USD tiers remain the only numeric discounts.
    expect(MILITARY_VETERAN_CALLOUT.body).not.toMatch(/\$\d+/);
  });

  it("gives Free a richer all-levels perk list without paid-feature claims", () => {
    for (const audience of ["adult", "kids", "junior", "senior"] as const) {
      const perks = MEMBER_PERKS_BY_TIER.free[audience];
      expect(perks.length).toBeGreaterThanOrEqual(5);
      const titles = perks.map((p) => p.title.toLowerCase());
      expect(titles.some((t) => t.includes("guide") || t.includes("ideas"))).toBe(true);
      expect(titles.some((t) => t.includes("wizard") || t.includes("match"))).toBe(true);
      expect(titles.some((t) => t.includes("every age"))).toBe(true);
      // No duplicate “browse free guides” + “free guides library” pair.
      const browseAndLibrary =
        titles.filter((t) => t.includes("browse free guides") || t.includes("free guides library")).length;
      expect(browseAndLibrary).toBeLessThanOrEqual(1);
      const blob = perks.map((p) => `${p.title} ${p.detail}`).join(" ").toLowerCase();
      expect(blob).toMatch(/kids/);
      expect(blob).toMatch(/teen/);
      expect(blob).toMatch(/adult/);
      expect(blob).toMatch(/senior/);
      expect(blob).not.toMatch(/schedule suite|1-on-1 consulting|zip scout/);
    }
    expect(MEMBERSHIP_TIERS.find((t) => t.id === "free")?.tagline).toMatch(/kids.*teens.*adults.*seniors/i);
    expect(MEMBERSHIP_TIERS.find((t) => t.id === "free")?.featureIds).toEqual([]);
  });

  it("uses additive Everything-in perk ladders for every audience", () => {
    for (const audience of ["adult", "kids", "junior", "senior"] as const) {
      expect(MEMBER_PERKS_BY_TIER.free[audience][0]?.title).not.toMatch(/everything in/i);
      expect(MEMBER_PERKS_BY_TIER.starter[audience][0]?.title).toMatch(/everything in free/i);
      expect(MEMBER_PERKS_BY_TIER.pro[audience][0]?.title).toMatch(/everything in starter/i);
      expect(MEMBER_PERKS_BY_TIER.elite[audience][0]?.title).toMatch(/everything in pro/i);

      const starterBlob = MEMBER_PERKS_BY_TIER.starter[audience]
        .slice(1)
        .map((p) => `${p.title} ${p.detail}`)
        .join(" ")
        .toLowerCase();
      expect(starterBlob).not.toMatch(/match wizard|free for every age/);

      const numbered = numberedTierPerks("starter", audience);
      expect(numbered[0]?.numberedTitle).toMatch(/^1\.\s+Everything in Free/i);
      expect(numbered[1]?.numberedTitle).toMatch(/^2\.\s+/);
    }
  });

  it("numbers Adult Free→Elite perk titles for Membership display", () => {
    const free = numberedTierPerks("free", "adult");
    const elite = numberedTierPerks("elite", "adult");
    expect(free.map((p) => p.numberedTitle)).toEqual([
      "1. Free for every age group",
      "2. Browse free guides & hustle ideas",
      "3. Adults Match Wizard + ranked ideas",
      "4. Browse Adults Corner (and every Corner)",
      "5. Free account + Member Dashboard",
    ]);
    expect(elite[0]?.numberedTitle).toBe("1. Everything in Pro, plus:");
    expect(elite.some((p) => /zip scout/i.test(p.title))).toBe(true);
  });
});
