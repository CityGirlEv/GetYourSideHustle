import { describe, it, expect } from "vitest";
import { expandTestWithPlatforms, TEST_PLATFORMS } from "@/lib/platform-variants";
import { TEST_CASES } from "@/lib/test-plan";
import type { TestCase } from "@/lib/test-plan";

const scenarioSources = TEST_CASES.filter((t) => t.area === "Scenario");
const MULTI_AREAS = [
  "Scenario",
  "Voice",
  "Intake",
  "Auth",
  "Registration",
  "Landing",
  "Expert opt-in",
  "Exports",
  "CMS Compliance",
];
const isMulti = (a: string) =>
  MULTI_AREAS.some((p) => a === p || a.startsWith(`${p} `) || a.startsWith(`${p}·`));
const multiSources = TEST_CASES.filter((t) => isMulti(t.area));
const ALLOWED_NON_DESKTOP = ["Catria", "Unassigned", "Evelyn"] as const;

describe("platform variant fan-out", () => {
  it("produces one variant per platform for every scenario", () => {
    for (const t of scenarioSources) {
      const variants = expandTestWithPlatforms(t);
      expect(variants).toHaveLength(TEST_PLATFORMS.length);
    }
  });

  it("Phone + iPad variants are owned by Catria, Unassigned, or Evelyn", () => {
    for (const t of multiSources) {
      for (const v of expandTestWithPlatforms(t)) {
        if (v.area.endsWith("Mobile") || v.area.endsWith("Tablet")) {
          expect(ALLOWED_NON_DESKTOP).toContain(v.assignee);
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

  it("spreads Phone + iPad ownership across all three owners", () => {
    const counts: Record<string, number> = { Catria: 0, Unassigned: 0, Evelyn: 0 };
    for (const t of multiSources) {
      for (const v of expandTestWithPlatforms(t)) {
        if (v.area.endsWith("Mobile") || v.area.endsWith("Tablet")) {
          const a = v.assignee;
          if (a && a in counts) counts[a]++;
        }
      }
    }
    // Each owner gets at least one Phone/iPad variant somewhere.
    expect(counts.Catria).toBeGreaterThan(0);
    expect(counts.Unassigned).toBeGreaterThan(0);
    expect(counts.Evelyn).toBeGreaterThan(0);
  });

  it("fans out Voice, Intake, Auth, and Registration tests", () => {
    const probeAreas = ["Voice · Inputs", "Intake · Manual", "Auth", "Registration · Email"];
    for (const area of probeAreas) {
      const src = TEST_CASES.find((t) => t.area === area);
      expect(src, `missing source test for ${area}`).toBeTruthy();
      const variants = expandTestWithPlatforms(src as TestCase);
      expect(variants).toHaveLength(TEST_PLATFORMS.length);
    }
  });
});
