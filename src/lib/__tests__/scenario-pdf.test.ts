import { describe, it, expect, vi } from "vitest";

vi.mock("@/components/DrugReport", () => ({
  buildDrugReport: () => [],
}));

import { buildScenarioPdf, buildConsumerScenarioPdf } from "../scenario-pdf";
import type { Medication } from "../medicare-math";

const med: Medication = {
  id: "1",
  medication_name: "atorvastatin",
  strength: "10mg",
  dosage_form: "tablet",
  frequency: "daily",
  estimated_monthly_retail: 12,
};

const input = {
  scenarioCode: "TEST-001",
  year: 2026 as const,
  birthYear: 1955,
  zip3: "331",
  county: "Miami-Dade",
  gender: "female",
  tobacco: false,
  incomeBand: "<$103k",
  costPreference: "predictability" as const,
  conditions: ["diabetes"],
  medications: [med],
};

describe("scenario-pdf builders", () => {
  it("buildScenarioPdf returns a jsPDF instance", () => {
    const doc = buildScenarioPdf(input);
    expect(doc.output("blob").size).toBeGreaterThan(500);
  });

  it("buildConsumerScenarioPdf returns a jsPDF instance", () => {
    const doc = buildConsumerScenarioPdf(input);
    expect(doc.output("blob").size).toBeGreaterThan(500);
  });
});