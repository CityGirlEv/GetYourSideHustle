import { describe, expect, it } from "vitest";
import { rankedPlanDetails } from "@/lib/plan-details";
import {
  carrierPortalUrl,
  medicarePlanCompareUrl,
  planDetailExternalUrl,
} from "@/lib/plan-external-links";
import { MEDICARE_PLAN_COMPARE_URL } from "@/lib/safe-external-links";

describe("plan-external-links", () => {
  it("resolves known carrier portals from the CMS catalog", () => {
    const url = carrierPortalUrl("Humana");
    expect(url).toMatch(/^https:\/\//);
    expect(url).toContain("humana");
  });

  it("falls back to Medicare.gov plan compare for unknown carriers", () => {
    expect(carrierPortalUrl("Not A Real Carrier LLC")).toBeNull();
    const plans = rankedPlanDetails({ year: 2026, zip3: "770", medications: [] });
    const top = plans[0]!;
    const url = planDetailExternalUrl(top, { zip3: "770", year: 2026 });
    expect(url.startsWith(MEDICARE_PLAN_COMPARE_URL) || url.includes("humana") || url.includes("uhc")).toBe(
      true,
    );
  });

  it("adds zip context to Medicare.gov plan compare URLs", () => {
    const url = medicarePlanCompareUrl({ zip3: "770", year: 2026 });
    expect(url).toContain("medicare.gov/plan-compare");
    expect(url).toContain("zip=77000");
    expect(url).toContain("year=2026");
  });
});
