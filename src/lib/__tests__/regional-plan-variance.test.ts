import { describe, expect, it } from "vitest";
import { areaPlanDetails, potentialTop3PlanDetails, rankedPlanDetails } from "@/lib/plan-details";

describe("regional plan variance", () => {
  it("top 3 and top 10 differ across zip3/county regions", () => {
    const cases = [
      { zip3: "770", county: "Harris, TX" },
      { zip3: "331", county: "Miami-Dade, FL" },
      { zip3: "902", county: "Los Angeles, CA" },
      { zip3: "705", county: "Evangeline Parish, LA" },
    ] as const;

    const signatures = cases.map((c) => {
      const input = { year: 2026 as const, ...c, medications: [] as const[] };
      const top3 = potentialTop3PlanDetails(input);
      const top10 = rankedPlanDetails(input);
      const area = areaPlanDetails(input);
      return {
        ...c,
        top3: top3.map((p) => `${p.carrier}::${p.plan}`),
        top10First: top10[0] ? `${top10[0].carrier}::${top10[0].plan}` : "",
        areaCount: area.length,
        top3Annual: top3[0]?.annual,
      };
    });

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(signatures, null, 2));

    expect(signatures.every((s) => s.areaCount > 0)).toBe(true);
    expect(new Set(signatures.map((s) => s.top3.join("|"))).size).toBeGreaterThan(1);
  });

  it("top 3 matches first 3 of regional catalog and top 10", () => {
    const input = {
      year: 2026 as const,
      zip3: "770",
      county: "Harris, TX",
      medications: [] as const[],
    };
    const area = areaPlanDetails(input);
    const top3 = potentialTop3PlanDetails(input);
    const top10 = rankedPlanDetails(input);

    expect(top3.map((p) => p.carrier)).toEqual(area.slice(0, 3).map((p) => p.carrier));
    expect(top10.map((p) => p.carrier)).toEqual(area.slice(0, 10).map((p) => p.carrier));
  });
});
