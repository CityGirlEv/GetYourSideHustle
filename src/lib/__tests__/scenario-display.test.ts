import { describe, it, expect } from "vitest";
import {
  formatScenarioConditions,
  formatScenarioMedicationLine,
  formatScenarioMedicationsList,
  scenarioMedicationRetailMonthly,
} from "../scenario-display";
import type { Medication } from "../medicare-math";

const med: Medication = {
  id: "1",
  medication_name: "Losartan",
  strength: "50 mg",
  dosage_form: "tablet",
  frequency: "daily",
  estimated_monthly_retail: 7,
};

describe("scenario-display", () => {
  it("formats conditions as a comma-separated list", () => {
    expect(formatScenarioConditions(["Asthma", "GERD"])).toBe("Asthma, GERD");
    expect(formatScenarioConditions([])).toBe("None reported");
  });

  it("formats medication lines like the wizard", () => {
    expect(formatScenarioMedicationLine(med)).toBe("Losartan 50 mg tablet (daily) = $7/mo");
  });

  it("joins medications for export headers", () => {
    expect(formatScenarioMedicationsList([med])).toBe("Losartan 50 mg tablet (daily) = $7/mo");
  });

  it("sums medication retail monthly", () => {
    expect(scenarioMedicationRetailMonthly([med, { ...med, id: "2", estimated_monthly_retail: 10 }])).toBe(
      17,
    );
  });
});
