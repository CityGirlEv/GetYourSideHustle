import { describe, expect, it } from "vitest";
import { getBenchmarkWorkbookContent } from "@/lib/benchmark-workbook-content";
import type { Medication } from "@/lib/medicare-math";
import {
  applyWorkbookMedicationSeed,
  formatWorkbookMedicationDose,
  intakeMedicationsForWorkbook,
  seedWorkbookMedicationLines,
  WORKBOOK_PRESCRIPTIONS_SECTION_ID,
} from "@/lib/workbook-medication-seed";
import { emptyWorkbookFormState } from "@/lib/workbook-form-state";

const lisinopril: Medication = {
  id: "m1",
  medication_name: "Lisinopril",
  strength: "10 mg",
  dosage_form: "tablet",
  frequency: "daily",
  estimated_monthly_retail: 7,
};

describe("workbook-medication-seed", () => {
  const workbook = getBenchmarkWorkbookContent();

  it("formats dose from intake medication details", () => {
    expect(formatWorkbookMedicationDose(lisinopril)).toBe("10 mg · tablet · daily");
  });

  it("pre-fills drug names and doses from medication details", () => {
    const lines = seedWorkbookMedicationLines({}, [], [lisinopril, {
      ...lisinopril,
      id: "m2",
      medication_name: "Metformin",
      strength: "500 mg",
    }]);

    expect(lines[`${WORKBOOK_PRESCRIPTIONS_SECTION_ID}:drug-0`]).toBe("Lisinopril");
    expect(lines[`${WORKBOOK_PRESCRIPTIONS_SECTION_ID}:dose-0`]).toBe("10 mg · tablet · daily");
    expect(lines[`${WORKBOOK_PRESCRIPTIONS_SECTION_ID}:drug-1`]).toBe("Metformin");
    expect(lines[`${WORKBOOK_PRESCRIPTIONS_SECTION_ID}:dose-1`]).toBe("500 mg · tablet · daily");
  });

  it("falls back to medication names when details are empty", () => {
    const rows = intakeMedicationsForWorkbook(["Atorvastatin"], []);
    expect(rows).toEqual([{ name: "Atorvastatin", dose: "" }]);
  });

  it("does not overwrite user-entered drug or dose fields", () => {
    const lines = seedWorkbookMedicationLines(
      {
        [`${WORKBOOK_PRESCRIPTIONS_SECTION_ID}:drug-0`]: "Custom med",
        [`${WORKBOOK_PRESCRIPTIONS_SECTION_ID}:dose-0`]: "Custom dose",
      },
      ["Lisinopril"],
      [lisinopril],
    );

    expect(lines[`${WORKBOOK_PRESCRIPTIONS_SECTION_ID}:drug-0`]).toBe("Custom med");
    expect(lines[`${WORKBOOK_PRESCRIPTIONS_SECTION_ID}:dose-0`]).toBe("Custom dose");
  });

  it("applies seed to workbook form state without checking boxes", () => {
    const seeded = applyWorkbookMedicationSeed(emptyWorkbookFormState(workbook), [], [lisinopril]);

    expect(seeded.lines[`${WORKBOOK_PRESCRIPTIONS_SECTION_ID}:drug-0`]).toBe("Lisinopril");
    expect(seeded.lines[`${WORKBOOK_PRESCRIPTIONS_SECTION_ID}:dose-0`]).toBe("10 mg · tablet · daily");
    expect(Object.values(seeded.checked).every((value) => value === false)).toBe(true);
  });
});
