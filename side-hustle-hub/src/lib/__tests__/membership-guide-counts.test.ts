import { describe, expect, it } from "vitest";
import {
  membershipAudienceShortLabel,
  membershipCompareRowsWithAudienceGuideCounts,
  membershipFreeGuidesPerkTitle,
  membershipGuideCountLine,
  membershipTierGuidesPerkTitle,
  membershipTiersWithAudienceGuideCounts,
  numberedTierPerksWithAudienceGuideCount,
  copyMentionsMembershipGuideAllotment,
} from "../guide-library-live-counts";
import {
  countGuidesForMembershipAudience,
  membershipGuideCountsByTier,
} from "../guide-library-pool";
import type { AudienceGroup, TierId } from "../membership";

const AUDIENCES: AudienceGroup[] = ["kids", "junior", "adult", "senior"];

describe("membership guide counts by audience + tier", () => {
  it("counts rise (or stay flat) as membership tier increases for each demographic", () => {
    for (const audience of AUDIENCES) {
      const counts = membershipGuideCountsByTier(audience);
      expect(counts.free).toBeGreaterThan(0);
      expect(counts.starter).toBeGreaterThanOrEqual(counts.free);
      expect(counts.pro).toBeGreaterThanOrEqual(counts.starter);
      expect(counts.elite).toBeGreaterThanOrEqual(counts.pro);
      expect(counts.elite).toBe(countGuidesForMembershipAudience(audience, "elite"));
    }
  });

  it("changes when the demographic changes (not a single global number)", () => {
    const adultFree = countGuidesForMembershipAudience("adult", "free");
    const kidsFree = countGuidesForMembershipAudience("kids", "free");
    const adultElite = countGuidesForMembershipAudience("adult", "elite");
    const kidsElite = countGuidesForMembershipAudience("kids", "elite");
    // At least one pairing differs across ages for Free or Elite inventory.
    expect(adultFree !== kidsFree || adultElite !== kidsElite).toBe(true);
  });

  it("writes guide counts into membership card taglines and perks", () => {
    const audience: AudienceGroup = "adult";
    const counts = membershipGuideCountsByTier(audience);
    const tiers = membershipTiersWithAudienceGuideCounts(audience, counts);
    for (const tier of tiers) {
      expect(tier.tagline).toContain(String(counts[tier.id]));
      expect(tier.tagline).toMatch(/Side Hustle Guides?/i);
    }

    const freePerks = numberedTierPerksWithAudienceGuideCount("free", audience, counts.free);
    const freeGuidePerk = freePerks.find((p) => copyMentionsMembershipGuideAllotment(p.title));
    expect(freeGuidePerk?.title).toBe(membershipFreeGuidesPerkTitle(counts.free, audience));

    const starterPerks = numberedTierPerksWithAudienceGuideCount(
      "starter",
      audience,
      counts.starter,
    );
    const starterGuidePerk = starterPerks.find((p) =>
      copyMentionsMembershipGuideAllotment(p.title),
    );
    expect(starterGuidePerk?.title).toBe(
      membershipTierGuidesPerkTitle(counts.starter, audience, "starter"),
    );
  });

  it("puts numeric guide counts in the compare table for the selected audience", () => {
    const audience: AudienceGroup = "senior";
    const counts = membershipGuideCountsByTier(audience);
    const rows = membershipCompareRowsWithAudienceGuideCounts(audience, counts);
    const browse = rows.find((r) => r.id === "browse");
    expect(browse?.label).toContain(membershipAudienceShortLabel(audience));
    expect(browse?.cells.free).toBe(String(counts.free));
    expect(browse?.cells.elite).toBe(String(counts.elite));
  });

  it("formats the membership guide count line", () => {
    expect(membershipGuideCountLine(12, "junior")).toBe("12 Side Hustle Guides for Teens");
    expect(membershipGuideCountLine(1, "kids")).toBe("1 Side Hustle Guide for Kids");
  });
});
