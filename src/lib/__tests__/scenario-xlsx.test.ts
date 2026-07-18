import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { openScenarioXlsxInNewTab } from "../scenario-xlsx";
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

describe("openScenarioXlsxInNewTab", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "open",
      vi.fn(() => ({
        closed: false,
        document: { title: "", body: { innerHTML: "" } },
        location: { href: "" },
        focus: vi.fn(),
        close: vi.fn(),
      })),
    );
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds and opens a workbook in a new tab", async () => {
    await openScenarioXlsxInNewTab(input);
    expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
  });
});
