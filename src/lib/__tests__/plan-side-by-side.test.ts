import { describe, expect, it } from "vitest";
import { planSideBySideDrugRows } from "@/lib/plan-side-by-side";
import { potentialTop3PlanDetails } from "@/lib/plan-details";
import type { Medication } from "@/lib/medicare-math";

const metformin: Medication = {
  id: "1",
  medication_name: "Metformin",
  strength: "500 mg",
  dosage_form: "Tablet",
  frequency: "Twice daily",
  estimated_monthly_retail: 4,
};

const lisinopril: Medication = {
  id: "2",
  medication_name: "Lisinopril",
  strength: "10 mg",
  dosage_form: "Tablet",
  frequency: "Daily",
  estimated_monthly_retail: 12,
};

describe("planSideBySideDrugRows", () => {
  it("returns tier and cost rows for each entered medication", () => {
    const meds = [metformin, lisinopril];
    const top3 = potentialTop3PlanDetails({
      year: 2026,
      zip3: "331",
      county: "Miami-Dade, FL",
      medications: meds,
    });
    expect(top3.length).toBeGreaterThan(0);

    const rows = planSideBySideDrugRows(top3, meds);
    expect(rows.map((r) => r.label)).toEqual([
      "Metformin — tier",
      "Metformin (est. /mo)",
      "Lisinopril — tier",
      "Lisinopril (est. /mo)",
    ]);

    const [plan] = top3;
    const metTier = rows[0]!.values(plan!);
    const metCost = rows[1]!.values(plan!);
    expect(metTier).toMatch(/Tier 1/i);
    expect(metTier).not.toBe("—");
    expect(metCost).not.toBe("—");
    expect(metCost).toMatch(/\$/);
  });

  it("returns an empty list when no medications were entered", () => {
    const top3 = potentialTop3PlanDetails({
      year: 2026,
      zip3: "770",
      medications: [],
    });
    expect(planSideBySideDrugRows(top3, [])).toEqual([]);
  });
});
