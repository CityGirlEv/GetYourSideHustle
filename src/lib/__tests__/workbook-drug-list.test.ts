import { describe, expect, it } from "vitest";
import {
  applyDrugListToWorkbookState,
  drugListToCsv,
  parseDrugListFromText,
  workbookDrugListTemplateCsv,
} from "@/lib/workbook-drug-list";
import { emptyWorkbookFormState } from "@/lib/workbook-form-state";
import { getBenchmarkWorkbookContent } from "@/lib/benchmark-workbook-content";

describe("workbook-drug-list", () => {
  const workbook = getBenchmarkWorkbookContent();

  it("ships a downloadable CSV template with headers", () => {
    const csv = workbookDrugListTemplateCsv();
    expect(csv).toContain("Drug name");
    expect(csv).toContain("Dosage / how often");
    expect(csv).toContain("Lisinopril");
  });

  it("parses CSV and text uploads", () => {
    const rows = parseDrugListFromText(
      "Drug name,Dosage / how often\nAtorvastatin,20 mg · Once daily\n",
    );
    expect(rows).toEqual([{ name: "Atorvastatin", dose: "20 mg · Once daily" }]);
  });

  it("applies parsed rows to workbook prescription lines", () => {
    const state = applyDrugListToWorkbookState(emptyWorkbookFormState(workbook), [
      { name: "Metformin", dose: "500 mg" },
    ]);
    expect(state.lines["workbook-extra-prescriptions:drug-0"]).toBe("Metformin");
    expect(state.lines["workbook-extra-prescriptions:dose-0"]).toBe("500 mg");
  });

  it("exports saved drug list as CSV", () => {
    const csv = drugListToCsv([{ name: "Lisinopril", dose: "10 mg" }]);
    expect(csv).toContain("Lisinopril");
    expect(csv).toContain("10 mg");
  });
});
