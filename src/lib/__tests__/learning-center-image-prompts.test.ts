import { describe, expect, it } from "vitest";
import {
  buildFeaturedImagePrompt,
  multiculturalSceneHint,
  MULTICULTURAL_SCENE_HINTS,
} from "@/lib/learning-center-image-prompts";

describe("learning-center-image-prompts", () => {
  it("requires multicultural representation in every prompt", () => {
    const prompt = buildFeaturedImagePrompt({
      title: "Medicare Enrollment Periods",
      excerpt: "Educational overview of enrollment windows.",
      category: "enrollment",
      slug: "medicare-enrollment-periods-overview",
    });
    expect(prompt.toLowerCase()).toContain("photorealistic");
    expect(prompt.toLowerCase()).toContain("multicultural");
    expect(prompt.toLowerCase()).toContain("no cartoon");
    expect(prompt).toContain("Cast:");
  });

  it("rotates cast hints by slug", () => {
    const a = multiculturalSceneHint("turning-65-medicare-guide");
    const b = multiculturalSceneHint("what-is-medicare-prior-authorization");
    expect(MULTICULTURAL_SCENE_HINTS).toContain(a);
    expect(MULTICULTURAL_SCENE_HINTS).toContain(b);
    expect(a).not.toBe(b);
  });
});
