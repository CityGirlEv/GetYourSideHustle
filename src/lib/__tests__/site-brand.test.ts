import { describe, it, expect } from "vitest";
import {
  SITE_BRAND_NAME,
  SITE_BRAND_TEAM_SIGNATURE,
  SITE_BRAND_THE,
  normalizeLegacyBrandText,
  normalizeLegacyBrandJson,
} from "@/lib/site-brand";

describe("normalizeLegacyBrandText", () => {
  it("strips Get from legacy brand names", () => {
    expect(normalizeLegacyBrandText("Welcome to Get Part B Optimizer")).toBe(
      `Welcome to ${SITE_BRAND_NAME}`,
    );
    expect(normalizeLegacyBrandText("The Get Part B Optimizer team")).toBe(SITE_BRAND_TEAM_SIGNATURE);
    expect(normalizeLegacyBrandText(`${SITE_BRAND_THE} team`)).toBe(SITE_BRAND_TEAM_SIGNATURE);
    expect(normalizeLegacyBrandText(`${SITE_BRAND_THE} Team`)).toBe(SITE_BRAND_TEAM_SIGNATURE);
    expect(normalizeLegacyBrandText("GET PART B OPTIMIZER")).toBe(SITE_BRAND_NAME.toUpperCase());
    expect(normalizeLegacyBrandText("Get Part B enrollment")).toBe("Part B enrollment");
  });

  it("leaves current branding unchanged", () => {
    expect(normalizeLegacyBrandText(SITE_BRAND_NAME)).toBe(SITE_BRAND_NAME);
    expect(normalizeLegacyBrandText(SITE_BRAND_THE)).toBe(SITE_BRAND_THE);
  });

  it("normalizes nested JSON draft payloads", () => {
    expect(
      normalizeLegacyBrandJson({
        title: "Welcome to Get Part B Optimizer",
        tags: ["Get Part B Optimizer"],
      }),
    ).toEqual({
      title: `Welcome to ${SITE_BRAND_NAME}`,
      tags: [SITE_BRAND_NAME],
    });
  });
});
