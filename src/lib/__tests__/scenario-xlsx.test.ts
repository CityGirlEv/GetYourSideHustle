import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadScenarioXlsx } from "../scenario-xlsx";
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

beforeEach(() => {
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:mock"),
    revokeObjectURL: vi.fn(),
  });
});

describe("downloadScenarioXlsx", () => {
  it("builds and triggers a workbook download", async () => {
    const clicked: HTMLAnchorElement[] = [];
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = origCreate(tag) as HTMLElement;
      if (tag === "a") {
        (el as HTMLAnchorElement).click = () => { clicked.push(el as HTMLAnchorElement); };
      }
      return el;
    });

    await downloadScenarioXlsx(input);
    expect(clicked.length).toBe(1);
    expect(clicked[0].download).toMatch(/\.xlsx$/);
  });
});