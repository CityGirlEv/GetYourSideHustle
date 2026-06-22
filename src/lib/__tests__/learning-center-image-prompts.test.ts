import { describe, expect, it } from "vitest";
import {
  buildFeaturedImagePrompt,
  CMS_IMAGE_PROMPT_REQUIRED_MARKERS,
  CMS_IMAGE_VISUAL_PROHIBITIONS,
  multiculturalSceneHint,
  MULTICULTURAL_SCENE_HINTS,
  sanitizeImagePromptContext,
} from "@/lib/learning-center-image-prompts";

describe("learning-center-image-prompts", () => {
  it("requires multicultural representation and CMS visual rules in every prompt", () => {
    const prompt = buildFeaturedImagePrompt({
      title: "Medicare Enrollment Periods",
      excerpt: "Educational overview of enrollment windows.",
      category: "enrollment",
      slug: "medicare-enrollment-periods-overview",
    });
    expect(prompt.toLowerCase()).toContain("photorealistic");
    expect(prompt.toLowerCase()).toContain("multicultural");
    expect(prompt).toContain("Cast:");
    for (const marker of CMS_IMAGE_PROMPT_REQUIRED_MARKERS) {
      expect(prompt).toContain(marker);
    }
  });

  it("forbids government and carrier imagery in CMS block", () => {
    expect(CMS_IMAGE_VISUAL_PROHIBITIONS).toMatch(/Medicare card/i);
    expect(CMS_IMAGE_VISUAL_PROHIBITIONS).toMatch(/carrier logos/i);
    expect(CMS_IMAGE_VISUAL_PROHIBITIONS).toMatch(/NO readable text/i);
    expect(CMS_IMAGE_VISUAL_PROHIBITIONS).toMatch(/infographic/i);
  });

  it("does not ask scenes to show plan summaries or legible Medicare paperwork", () => {
    for (const hint of MULTICULTURAL_SCENE_HINTS) {
      expect(hint.toLowerCase()).not.toContain("plan summar");
      expect(hint.toLowerCase()).not.toMatch(/medicare paperwork/);
    }
  });

  it("strips dollar amounts and superlatives from excerpt context", () => {
    const sanitized = sanitizeImagePromptContext(
      'Zero $0 premium means the best savings — enroll now for free coverage.',
    );
    expect(sanitized).not.toContain("$0");
    expect(sanitized.toLowerCase()).not.toContain("best");
    expect(sanitized.toLowerCase()).not.toContain("enroll now");
  });

  it("marks topic as mood-only so titles are not rendered as visible text", () => {
    const prompt = buildFeaturedImagePrompt({
      title: "Medicare Advantage $0 Premiums",
      excerpt: "Zero monthly premium does not mean zero cost.",
      category: "plan-types",
      slug: "medicare-advantage-zero-premium",
    });
    expect(prompt).toContain("mood only, not visible text");
    expect(prompt).toContain("do not render as text in image");
    expect(prompt.toLowerCase()).not.toContain("enroll now");
  });

  it("rotates cast hints by slug", () => {
    const a = multiculturalSceneHint("turning-65-medicare-guide");
    const b = multiculturalSceneHint("what-is-medicare-prior-authorization");
    expect(MULTICULTURAL_SCENE_HINTS).toContain(a);
    expect(MULTICULTURAL_SCENE_HINTS).toContain(b);
    expect(a).not.toBe(b);
  });
});
