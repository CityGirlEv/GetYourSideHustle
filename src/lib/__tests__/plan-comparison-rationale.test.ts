import { describe, expect, it } from "vitest";
import { areaPlanDetails, rankedPlanDetails } from "@/lib/plan-details";

import {
  buildHighlyRatedComparisonReasons,
  buildHighlyRatedPlanReasons,
  buildTopPlanHighlights,
  buildWhyTopPlanOverRunnersUp,
  explainWinnerOverChallenger,
} from "@/lib/plan-comparison-rationale";
import type { ScenarioPdfInput } from "@/lib/scenario-pdf";

const baseScenario: ScenarioPdfInput = {
  scenarioCode: "TEST-001",
  year: 2026,
  birthYear: 1960,
  zip3: "331",
  gender: "female",
  tobacco: false,
  incomeBand: "middle",
  costPreference: "minimize_monthly",
  conditions: ["Type 2 diabetes"],
  medications: [
    {
      id: "1",
      medication_name: "metformin",
      strength: "500mg",
      dosage_form: "tablet",
      frequency: "daily",
      estimated_monthly_retail: 10,
    },
  ],
};

describe("plan-comparison-rationale", () => {
  it("explains #1 over #2 using real annual cost deltas", () => {
    const plans = rankedPlanDetails({
      year: baseScenario.year,
      zip3: baseScenario.zip3,
      medications: baseScenario.medications,
    });
    const top = plans[0]!;
    const second = plans[1]!;
    expect(second.annual).toBeGreaterThanOrEqual(top.annual);

    const reasons = explainWinnerOverChallenger(top, second, "minimize_monthly");
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons[0]).toMatch(/annual total/i);
    expect(reasons[0]).toContain(second.carrier);
  });

  it("builds plan-type highlights for the top plan", () => {
    const plans = rankedPlanDetails({
      year: baseScenario.year,
      zip3: baseScenario.zip3,
      medications: baseScenario.medications,
    });
    const top = plans[0]!;
    const highlights = buildTopPlanHighlights(top, baseScenario.medications.length);
    expect(highlights.length).toBeGreaterThan(0);
    expect(highlights.some((h) => /medication/i.test(h))).toBe(true);
    expect(highlights.some((h) => /A\.M\. Best/i.test(h))).toBe(true);
    expect(highlights.some((h) => /CMS Star Rating/i.test(h))).toBe(true);
    expect(highlights.some((h) => /A\.M\. Best.*CMS Star Rating/i.test(h))).toBe(false);
  });

  it("builds comparative bullets for runners-up", () => {
    const plans = rankedPlanDetails({
      year: baseScenario.year,
      zip3: baseScenario.zip3,
      medications: baseScenario.medications,
    });
    const top = plans[0]!;
    const runnersUp = plans.slice(1, 3);
    const bullets = buildWhyTopPlanOverRunnersUp(top, runnersUp, baseScenario);
    expect(bullets.length).toBeGreaterThan(0);
    expect(bullets.some((b) => b.includes("vs #2"))).toBe(true);
  });

  it("builds highly-rated qualification reasons with CMS star context", () => {
    const all = areaPlanDetails({
      year: baseScenario.year,
      zip3: baseScenario.zip3,
      medications: baseScenario.medications,
    });
    const maPlan = all.find((p) => /medicare advantage/i.test(p.planType));
    expect(maPlan).toBeDefined();
    const reasons = buildHighlyRatedPlanReasons(maPlan!);
    expect(reasons.length).toBeGreaterThanOrEqual(3);
    expect(reasons[0]).toMatch(/CMS Star Rating/);
    expect(reasons[0]).toMatch(/4\.0\+/);
    expect(reasons.some((r) => /member experience|preventive care/i.test(r))).toBe(true);
  });

  it("builds highly-rated comparison reasons including Medigap", () => {
    const reasons = buildHighlyRatedComparisonReasons(baseScenario);
    expect(reasons.length).toBeGreaterThanOrEqual(2);
    expect(reasons[0]).toMatch(/Medigap/);
    expect(reasons[0]).toMatch(/Part D/);
    expect(reasons[0]).toMatch(/4\.0\+/);
    expect(reasons[1]).toMatch(/annual total/i);
  });
});
