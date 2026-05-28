import { describe, it, expect } from "vitest";
import { expandTestWithPlatforms, TEST_PLATFORMS } from "@/lib/platform-variants";
import { TEST_CASES } from "@/lib/test-plan";
import type { TestCase } from "@/lib/test-plan";

const scenarioSources = TEST_CASES.filter((t) => t.area === "Scenario");

describe("platform variant fan-out for Scenario tests", () => {
  it("produces one variant per platform for every scenario", () => {
    for (const t of scenarioSources) {
      const variants = expandTestWithPlatforms(t);
      expect(variants).toHaveLength(TEST_PLATFORMS.length);
    }
  });

  it("Phone + iPad scenario variants are owned only by Catria or Unassigned", () => {
    for (const t of scenarioSources) {
      for (const v of expandTestWithPlatforms(t)) {
        if (v.area.endsWith("Mobile") || v.area.endsWith("Tablet")) {
          expect(["Catria", "Unassigned"]).toContain(v.assignee);
        }
      }
    }
  });

  it("Computer scenario variants preserve the source test's owner", () => {
    const evelynSource = scenarioSources.find((t) => t.assignee === "Evelyn");
    expect(evelynSource).toBeTruthy();
    const variants = expandTestWithPlatforms(evelynSource as TestCase);
    for (const v of variants) {
      if (v.area.endsWith("Desktop")) expect(v.assignee).toBe("Evelyn");
    }
  });

  it("splits Phone + iPad scenario ownership roughly evenly between Catria and Unassigned", () => {
    let catria = 0;
    let unassigned = 0;
    for (const t of scenarioSources) {
      for (const v of expandTestWithPlatforms(t)) {
        if (v.area.endsWith("Mobile") || v.area.endsWith("Tablet")) {
          if (v.assignee === "Catria") catria++;
          else if (v.assignee === "Unassigned") unassigned++;
        }
      }
    }
    // 20 scenarios × 2 non-desktop platforms (Phone + iPad) = 40 variants
    expect(catria + unassigned).toBe(scenarioSources.length * 2);
    // Roughly balanced (within 25% of perfect 50/50)
    expect(Math.abs(catria - unassigned)).toBeLessThan(scenarioSources.length);
  });
});