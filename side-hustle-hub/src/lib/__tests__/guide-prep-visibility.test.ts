import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import {
  GUIDE_PREP_REVIEW_TAB_LABELS,
  GUIDE_PREP_REVIEW_TABS_PHRASE,
  guidePrepSectionIds,
} from "../guide-prep-visibility";

describe("guidePrepSectionIds", () => {
  const kit = guideKitForId("handyman");

  it("locked preview is prerequisites only", () => {
    expect(
      guidePrepSectionIds({
        kit,
        prerequisitesOnly: true,
        includeSteps: true,
        includeCalculator: true,
      }),
    ).toEqual(["prereqs"]);
  });

  it("unlocked includes all seven review tabs when kit is complete", () => {
    const ids = guidePrepSectionIds({
      kit,
      includeSteps: true,
      includeCalculator: true,
    });
    expect(GUIDE_PREP_REVIEW_TAB_LABELS).toHaveLength(7);
    expect(GUIDE_PREP_REVIEW_TABS_PHRASE).toMatch(/Show All/);
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
});
