import { describe, expect, it } from "vitest";
import {
  buildScoutingReport,
  extractHooksFromText,
  isBlockedResearchUrl,
  sanitizeAdUrls,
  synthesizeMetaAdCopy,
  tagAdPlatform,
} from "@/lib/scouting-research";
import type { MedicareAd } from "@/types/MedicareAd";

function sampleAd(overrides: Partial<MedicareAd> = {}): MedicareAd {
  return {
    companyName: "Test Carrier",
    websiteUrl: "https://example.com/medicare",
    socialMedia: { facebook: "", tiktok: "", other: [] },
    adUrl: "https://example.com/ad",
    primaryText: "Turning 65? Compare Medicare plans before enrollment ends.",
    description: "Educational broker funnel.",
    headline: "Free Medicare comparison",
    hooks: [],
    painPoints: [],
    keywords: [],
    hashtags: [],
    reviewSnippets: ["Shoppers want clarity before calling."],
    ...overrides,
  };
}

describe("scouting-research", () => {
  it("flags Google search URLs as blocked", () => {
    expect(isBlockedResearchUrl("https://www.google.com/search?q=medicare+ads")).toBe(true);
    expect(isBlockedResearchUrl("https://www.humana.com/medicare")).toBe(false);
  });

  it("tags Kalodata-sourced ads by source marker", () => {
    const platform = tagAdPlatform(
      sampleAd({
        adUrl: "https://www.tiktok.com/@shop/video/1",
        websiteUrl: "https://www.tiktok.com/@shop/video/1",
        socialMedia: {
          facebook: "",
          tiktok: "https://www.tiktok.com/@shop/video/1",
          other: ["source:kalodata"],
        },
      }),
    );
    expect(platform).toBe("kalodata");
  });

  it("sanitizes blocked URLs from ads", () => {
    const cleaned = sanitizeAdUrls(
      sampleAd({
        websiteUrl: "https://www.google.com/search?q=medicare",
        adUrl: "https://www.google.com/search?q=medicare",
      }),
    );
    expect(cleaned.websiteUrl).toBe("");
    expect(cleaned.adUrl).toBe("");
  });

  it("extracts hooks from ad copy", () => {
    const hooks = extractHooksFromText(
      "Turning 65 soon? Don't pick the wrong plan.",
      "Free Medicare comparison",
    );
    expect(hooks.some((h) => /turning\s*65/i.test(h))).toBe(true);
  });

  it("builds top competitors and ad copy drafts", () => {
    const report = buildScoutingReport([
      sampleAd(),
      sampleAd({ companyName: "Other Broker", websiteUrl: "https://broker.example" }),
    ]);
    expect(report.competitors.length).toBe(2);
    expect(report.adCopies.length).toBe(2);
    expect(report.adAngleBundles.length).toBeGreaterThan(0);
    expect(report.allHooks.length).toBeGreaterThan(0);
    expect(report.categoryCounts).toBeDefined();
    expect(report.ads[0]?.sitePurpose).toBeDefined();
    expect(report.reviewsByCompetitor.length).toBeGreaterThan(0);
  });

  it("synthesizes meta ad copy with angle", () => {
    const copy = synthesizeMetaAdCopy({
      companyName: "Humana",
      hooks: ["Turning 65 enrollment window", "$0 premium plans"],
      painPoints: ["Too many plan choices"],
      reviewSnippets: ["Members compare benefits."],
    });
    expect(copy.primaryText.length).toBeGreaterThan(20);
    expect(copy.headline.length).toBeGreaterThan(5);
    expect(copy.bestAngle.length).toBeGreaterThan(5);
  });
});
