import { describe, expect, it } from "vitest";
import {
  cmsLandscapeIsLoaded,
  cmsLandscapePlanIdsForCounty,
  cmsLandscapePlansForZip3,
  formatCmsLandscapeLastLoadedNote,
} from "@/lib/cms-landscape";
import { areaPlanDetails } from "@/lib/plan-details";

describe("cms-landscape nationwide data", () => {
  it("formats last-loaded note from manifest ingestedAt", () => {
    const note = formatCmsLandscapeLastLoadedNote("2026-07-03T03:14:42.812Z", "en-US");
    expect(note).toContain("CMS Medicare Advantage & Part D landscape last loaded");
    expect(note).toMatch(/Jul 2, 2026|Jul 3, 2026/);
  });

  it("loads ingested CMS landscape plans", () => {
    expect(cmsLandscapeIsLoaded()).toBe(true);
  });

  it("ZIP 705 Evangeline — includes real Healthy Blue and UHC D-SNP contract IDs", () => {
    const ids = cmsLandscapePlanIdsForCounty("LA", "Evangeline Parish");
    expect(ids.some((id) => id.startsWith("H1947_001"))).toBe(true);
    expect(ids.some((id) => id.startsWith("H1947_004"))).toBe(true);
    expect(ids.some((id) => id.startsWith("H5008_010"))).toBe(true);
    expect(ids.some((id) => id.startsWith("H1889_031"))).toBe(true);

    const plans = cmsLandscapePlansForZip3("705", 2026, [], "Evangeline Parish, LA");
    const names = plans.map((p) => p.plan).join(" | ");
    expect(names).toMatch(/Healthy Blue Dual Advantage/i);
    expect(names).toMatch(/UHC Dual Complete LA-S4/i);
    expect(names).toMatch(/H1947-004/);
  });

  it("area catalog uses CMS landscape MA/PDP for member ZIP", () => {
    const plans = areaPlanDetails({
      year: 2026,
      zip3: "705",
      county: "Evangeline Parish, LA",
      medications: [],
    });
    const maPlans = plans.filter((p) => /medicare advantage/i.test(p.planType));
    expect(maPlans.length).toBeGreaterThan(10);
    expect(maPlans.some((p) => /H1947-004/.test(p.plan))).toBe(true);
  });
});
