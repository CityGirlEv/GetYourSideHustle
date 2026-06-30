import { describe, expect, it } from "vitest";
import {
  classifyScoutingSiteProfile,
  isCmsCertifiedOrCompliant,
  matchesEducationalTpmoFocus,
} from "@/lib/scouting-site-profile";
import type { MedicareAd } from "@/types/MedicareAd";

function ad(overrides: Partial<MedicareAd>): MedicareAd {
  return {
    companyName: "Test",
    websiteUrl: "https://example.com",
    socialMedia: { facebook: "", tiktok: "", other: [] },
    adUrl: "https://example.com",
    primaryText: "",
    description: "",
    headline: "",
    hooks: [],
    painPoints: [],
    keywords: [],
    hashtags: [],
    reviewSnippets: [],
    ...overrides,
  };
}

describe("scouting-site-profile", () => {
  it("marks medicare.gov as official and educational", () => {
    const profile = classifyScoutingSiteProfile(
      ad({
        companyName: "Medicare.gov",
        websiteUrl: "https://www.medicare.gov/",
        primaryText: "Official Medicare website — public education resources.",
      }),
    );
    expect(profile.cmsStatus).toBe("official");
    expect(profile.sitePurpose).toBe("educational");
    expect(isCmsCertifiedOrCompliant(profile.cmsStatus)).toBe(true);
  });

  it("detects TPMO + educational broker funnels as both", () => {
    const profile = classifyScoutingSiteProfile(
      ad({
        companyName: "eHealth",
        primaryText:
          "Educational Medicare comparison. We do not offer every plan available in your area. Speak with a licensed agent.",
      }),
    );
    expect(profile.sitePurpose).toBe("both");
    expect(profile.cmsStatus).toBe("cms_compliant");
    expect(matchesEducationalTpmoFocus(profile.sitePurpose)).toBe(true);
  });

  it("classifies pure TPMO lead-gen", () => {
    const profile = classifyScoutingSiteProfile(
      ad({
        primaryText: "We represent Medicare plans in your area. Call today to speak with a licensed agent.",
      }),
    );
    expect(profile.sitePurpose).toBe("tpmo");
    expect(matchesEducationalTpmoFocus(profile.sitePurpose)).toBe(true);
  });
});
