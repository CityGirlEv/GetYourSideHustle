import { describe, expect, it } from "vitest";
import {
  CREDIT_EARN_ACTIONS,
  CREDIT_PACKS,
  MEMBERSHIP_TIERS,
  SCHEDULE_SUITE_FEATURE_IDS,
  SCHEDULE_SUITE_TIER,
  tierHasFeature,
  tierKidCredits,
  adultCreditsFromKidCredits,
  kidCreditsFeatureLabel,
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
});
