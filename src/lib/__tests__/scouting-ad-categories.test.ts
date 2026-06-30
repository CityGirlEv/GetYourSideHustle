import { describe, expect, it } from "vitest";
import {
  classifyScoutingAdCategories,
  countAdsByCategory,
  mergeScoutingAdCategories,
} from "@/lib/scouting-ad-categories";
import type { MedicareAd } from "@/types/MedicareAd";

function sampleAd(overrides: Partial<MedicareAd> = {}): MedicareAd {
  return {
    companyName: "Test Co",
    websiteUrl: "https://example.com",
    socialMedia: { facebook: "", tiktok: "", other: [] },
    adUrl: "https://example.com/ad",
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

describe("scouting-ad-categories", () => {
  it("tags medicare.gov as Medicare / Gov", () => {
    const cats = classifyScoutingAdCategories(
      sampleAd({
        companyName: "Medicare.gov",
        websiteUrl: "https://www.medicare.gov/",
        primaryText: "Official Medicare website",
      }),
    );
    expect(cats).toContain("medicare_gov");
  });

  it("tags broker funnels as FMO and TPMO", () => {
    const cats = classifyScoutingAdCategories(
      sampleAd({
        companyName: "eHealth Medicare",
        websiteUrl: "https://www.ehealthmedicare.com/",
        primaryText:
          "Compare plans in your area. We do not offer every plan available in your area.",
      }),
    );
    expect(cats).toContain("fmo");
    expect(cats).toContain("tpmo");
  });

  it("tags agent-led copy", () => {
    const cats = classifyScoutingAdCategories(
      sampleAd({
        companyName: "GoHealth",
        primaryText: "Speak with a licensed insurance agent today.",
      }),
    );
    expect(cats).toContain("agent");
  });

  it("allows multiple categories on one ad", () => {
    const cats = classifyScoutingAdCategories(
      sampleAd({
        companyName: "GoHealth",
        websiteUrl: "https://www.gohealth.com/medicare/",
        primaryText:
          "Licensed agents compare Medicare plans. We do not offer every plan in your area.",
      }),
    );
    expect(cats.length).toBeGreaterThan(1);
  });

  it("merges competitor categories from ads", () => {
    const merged = mergeScoutingAdCategories([["fmo"], ["tpmo", "agent"]]);
    expect(merged).toEqual(["fmo", "tpmo", "agent"]);
  });

  it("counts ads per category (multi-tag counts each)", () => {
    const counts = countAdsByCategory([
      { adCategories: ["fmo", "tpmo"] },
      { adCategories: ["agent"] },
    ]);
    expect(counts.fmo).toBe(1);
    expect(counts.tpmo).toBe(1);
    expect(counts.agent).toBe(1);
  });
});
