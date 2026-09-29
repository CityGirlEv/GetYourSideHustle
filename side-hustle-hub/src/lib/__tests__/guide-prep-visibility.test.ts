import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import {
  GUIDE_PREP_ABOUT_TAB_LABEL,
  GUIDE_PREP_DEFAULT_TAB,
  GUIDE_PREP_REVIEW_TAB_LABELS,
  GUIDE_PREP_REVIEW_TABS_PHRASE,
  guidePrepSectionIds,
  guidePrepTabIsLocked,
} from "../guide-prep-visibility";

describe("guidePrepSectionIds", () => {
  const kit = guideKitForId("handyman");

  it("keeps About public and lists other tabs so they can show membership locks", () => {
    expect(GUIDE_PREP_ABOUT_TAB_LABEL).toBe("About");
    expect(GUIDE_PREP_DEFAULT_TAB).toBe("prereqs");
    expect(guidePrepTabIsLocked("prereqs", false)).toBe(false);
    expect(guidePrepTabIsLocked("all", false)).toBe(true);
    expect(guidePrepTabIsLocked("steps", false)).toBe(true);
    expect(guidePrepTabIsLocked("steps", true)).toBe(false);
    expect(
      guidePrepSectionIds({
        kit,
        prerequisitesOnly: true,
        includeSteps: true,
        includeCalculator: true,
      }),
    ).toEqual(["all", "prereqs", "pricing", "supplies", "tools", "steps", "calculator"]);
  });

  it("unlocked includes all seven review tabs when kit is complete", () => {
    const ids = guidePrepSectionIds({
      kit,
      includeSteps: true,
      includeCalculator: true,
    });
    expect(GUIDE_PREP_REVIEW_TAB_LABELS).toHaveLength(7);
    expect(GUIDE_PREP_REVIEW_TABS_PHRASE).toMatch(/Show All/);
    expect(GUIDE_PREP_REVIEW_TABS_PHRASE).toMatch(/About/);
    expect(ids).toEqual([
      "all",
      "prereqs",
      "pricing",
      "supplies",
      "tools",
      "steps",
      "calculator",
    ]);
    expect(ids).not.toContain("notes");
  });

  it("always includes pricing and supplies tabs even when those lists are empty", () => {
    expect(
      guidePrepSectionIds({
        kit: {
          prerequisites: [],
          suggestedPricing: { items: [] },
          supplies: { items: [], starterKitTotal: "" },
          tools: [],
        },
        includeSteps: true,
        includeCalculator: true,
      }),
    ).toEqual(["all", "prereqs", "pricing", "supplies", "tools", "steps", "calculator"]);
  });

  it("puts Complete Prerequisite / What this side-hustle is above the About callout", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
    const src = readFileSync(join(root, "src/components/GuidePrepSections.tsx"), "utf8");
    const aboutStart = src.indexOf('id: "prereqs"');
    expect(aboutStart).toBeGreaterThan(-1);
    const aboutSlice = src.slice(aboutStart, src.indexOf("list.push({", aboutStart));
    const disclaimerIdx = aboutSlice.indexOf("prerequisitesDisclaimer()");
    const listIdx = aboutSlice.indexOf("kit.prerequisites.map");
    const calloutIdx = aboutSlice.indexOf("{realityCheck}");
    expect(disclaimerIdx).toBeGreaterThan(-1);
    expect(listIdx).toBeGreaterThan(disclaimerIdx);
    expect(calloutIdx).toBeGreaterThan(listIdx);
  });
});
