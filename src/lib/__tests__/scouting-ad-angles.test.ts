import { describe, expect, it } from "vitest";
import {
  buildScoutingAdAngleBundles,
  findScoutingAdCmsViolations,
  SCOUTING_AD_ANGLE_DEMOGRAPHICS,
  SCOUTING_AD_ANGLE_ORDER,
  SCOUTING_AD_CMS_CREATIVE_RULES,
  SCOUTING_CARTOON_STYLE_BASE,
} from "@/lib/scouting-ad-angles";

describe("scouting-ad-angles", () => {
  it("returns all angles in stable order", () => {
    const bundles = buildScoutingAdAngleBundles({ competitors: [] });
    expect(bundles).toHaveLength(SCOUTING_AD_ANGLE_ORDER.length);
    expect(bundles.map((b) => b.angleId)).toEqual(SCOUTING_AD_ANGLE_ORDER);
  });

  it("includes full CMS disclaimers in primary text", () => {
    const bundles = buildScoutingAdAngleBundles({ competitors: [] });
    for (const bundle of bundles) {
      expect(bundle.primaryText).toMatch(/Medicare\.gov|1-800-MEDICARE/i);
      expect(bundle.primaryText).toMatch(/not affiliated|not endorsed/i);
      expect(bundle.primaryText).toMatch(/Educational only/i);
    }
  });

  it("passes CMS violation scan for every angle", () => {
    const bundles = buildScoutingAdAngleBundles({ competitors: [] });
    for (const bundle of bundles) {
      expect(findScoutingAdCmsViolations(bundle)).toEqual([]);
    }
  });

  it("uses cover-hero cartoon style in image and video prompts", () => {
    const bundles = buildScoutingAdAngleBundles({ competitors: [] });
    for (const bundle of bundles) {
      expect(bundle.imagePrompt.length).toBeGreaterThan(80);
      expect(bundle.videoPrompt.length).toBeGreaterThan(80);
      expect(bundle.imagePrompt).toMatch(/cartoon|vector|cover hero/i);
      expect(bundle.videoPrompt).toMatch(/cartoon|vector|cover hero/i);
      expect(bundle.imagePrompt).toMatch(/CMS\/Meta safe/i);
      expect(bundle.videoPrompt).toMatch(/CMS\/Meta safe/i);
      expect(bundle.imagePrompt).not.toMatch(/photorealistic/i);
    }
  });

  it("assigns a distinct demographic per angle", () => {
    const demos = SCOUTING_AD_ANGLE_ORDER.map((id) => SCOUTING_AD_ANGLE_DEMOGRAPHICS[id]);
    expect(new Set(demos).size).toBe(SCOUTING_AD_ANGLE_ORDER.length);
  });

  it("avoids prohibited superlatives in headlines", () => {
    const bundles = buildScoutingAdAngleBundles({ competitors: [] });
    for (const bundle of bundles) {
      expect(bundle.headline.toLowerCase()).not.toMatch(/\bbest\b|\bfree\b|\b#1\b|\bguaranteed\b/);
    }
  });

  it("maps competitor hooks to turning-65 angle", () => {
    const bundles = buildScoutingAdAngleBundles({
      competitors: [
        {
          companyName: "eHealth",
          topHooks: ["Turning 65 enrollment window"],
          painPoints: [],
        },
      ],
    });
    const turning = bundles.find((b) => b.angleId === "turning_65");
    expect(turning?.competitorExamples).toContain("eHealth");
    expect(turning?.hooksUsed).toContain("Turning 65 enrollment window");
  });

  it("exports shared CMS creative rules referencing cover hero", () => {
    expect(SCOUTING_AD_CMS_CREATIVE_RULES).toMatch(/Medicare card/i);
    expect(SCOUTING_AD_CMS_CREATIVE_RULES).toMatch(/cover hero/i);
    expect(SCOUTING_CARTOON_STYLE_BASE).toMatch(/home cover hero/i);
  });
});
