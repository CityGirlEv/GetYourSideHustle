import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import {
  ETSY_CREATIVITY_POLICY_URL,
  ETSY_MINORS_POLICY_URL,
  ETSY_STORE_EXTERNAL_LINKS,
  ETSY_STORE_REALITY_CHECK,
} from "../etsy-store-guide";

describe("Guide #042 Build an Etsy Store callout", () => {
  it("places the creativity marketplace callout above Prerequisites copy", () => {
    expect(ETSY_STORE_REALITY_CHECK.title).toBe("⚠️ IMPORTANT: Etsy Is a Creative Marketplace");
    expect(ETSY_STORE_REALITY_CHECK.lead).toMatch(/not a general resale or dropshipping marketplace/i);
    expect(ETSY_STORE_REALITY_CHECK.intro).toMatch(/Creativity Standards/);
    expect(ETSY_STORE_REALITY_CHECK.sellHeading).toBe("What Can You Sell on Etsy?");
    expect(ETSY_STORE_REALITY_CHECK.categories.map((c) => c.heading)).toEqual([
      "🛠️ MADE BY A SELLER",
      "DESIGNED BY A SELLER",
      "HANDPICKED BY A SELLER",
      "SOURCED BY A SELLER",
    ]);
    expect(ETSY_STORE_REALITY_CHECK.categories[0]?.body).toMatch(
      /personally make, alter, assemble, or produce/i,
    );
    expect(ETSY_STORE_REALITY_CHECK.body).toMatch(/AI prompt bundles are not allowed/i);
    expect(ETSY_STORE_REALITY_CHECK.body).toMatch(/at least 20 years old/i);
    expect(ETSY_STORE_REALITY_CHECK.minorsBody).toMatch(/at least 18/);
    expect(ETSY_STORE_REALITY_CHECK.minorsBody).toMatch(/13–17/);
    expect(ETSY_STORE_REALITY_CHECK.minorsBody).toMatch(/under 13 may not use Etsy/i);
    expect(ETSY_STORE_REALITY_CHECK.creativityUrl).toBe(ETSY_CREATIVITY_POLICY_URL);
    expect(ETSY_STORE_REALITY_CHECK.minorsUrl).toBe(ETSY_MINORS_POLICY_URL);
    expect(ETSY_CREATIVITY_POLICY_URL).toBe("https://www.etsy.com/legal/creativity/");
    expect(ETSY_MINORS_POLICY_URL).toBe("https://www.etsy.com/legal/minors/");
  });

  it("keeps official Creativity and Minors links on the kit", () => {
    const kit = guideKitForId("etsy-store");
    expect(kit.prerequisites.some((p) => /what this hustle is/i.test(p.label))).toBe(true);
    expect(ETSY_STORE_EXTERNAL_LINKS.some((l) => l.url === ETSY_CREATIVITY_POLICY_URL)).toBe(true);
    expect(ETSY_STORE_EXTERNAL_LINKS.some((l) => l.url === ETSY_MINORS_POLICY_URL)).toBe(true);
  });
});
