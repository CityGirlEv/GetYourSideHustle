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

  it("rewrites legacy getpartb.com URLs", () => {
    expect(normalizeLegacyBrandText("Download at https://www.getpartb.com/downloads/workbook.pdf")).toBe(
      "Download at https://www.mypartb.com/downloads/workbook.pdf",
    );
    expect(normalizeLegacyBrandText("https://getpartb.com/learning-center")).toBe(
      "https://www.mypartb.com/learning-center",
    );
    expect(normalizeLegacyBrandText("notify.getpartb.com")).toBe("notify.mypartb.com");
    expect(normalizeLegacyBrandText("Visit GetPartB.com today")).toBe("Visit MyPartB.com today");
    expect(normalizeLegacyBrandText("www.getpartb.com")).toBe("MyPartB.com");
  });

  it("rewrites legacy Medicare Optimizer branding", () => {
    expect(normalizeLegacyBrandText("Welcome to The Medicare Optimizer")).toBe(
      `Welcome to ${SITE_BRAND_NAME}`,
    );
    expect(normalizeLegacyBrandText("© 2026 The Medicare Optimizer. All rights reserved.")).toBe(
      `© 2026 ${SITE_BRAND_NAME}. All rights reserved.`,
    );
    expect(normalizeLegacyBrandText("The Medicare Optimizer team")).toBe(SITE_BRAND_TEAM_SIGNATURE);
  });

  it("upgrades legacy Part B Optimizer branding", () => {
    expect(normalizeLegacyBrandText("Welcome to The Part B Optimizer")).toBe(
      `Welcome to ${SITE_BRAND_THE}`,
    );
    expect(normalizeLegacyBrandText("Part B Optimizer team")).toBe(`${SITE_BRAND_NAME} team`);
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
