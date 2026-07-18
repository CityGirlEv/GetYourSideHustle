import { describe, expect, it } from "vitest";
import {
  INTAKE_FREQUENCIES,
  INTAKE_INSULIN_PUMP_DOSAGE_FORM,
  intakeCountPerDoseHeading,
  intakeCountPerDoseOptions,
  intakeDosageFormsForMedication,
  intakeDosageFormSupportsCount,
  isInsulinMedication,
  migrateCountPerDoseToForm,
} from "@/lib/intake-constants";

describe("intake count per dose labels", () => {
  it("supports tablet, capsule, and pill", () => {
    expect(intakeDosageFormSupportsCount("Tablet")).toBe(true);
    expect(intakeDosageFormSupportsCount("Capsule")).toBe(true);
    expect(intakeDosageFormSupportsCount("Pill")).toBe(true);
    expect(intakeDosageFormSupportsCount("Injection")).toBe(false);
  });

  it("uses the selected form in headings and dropdown options", () => {
    expect(intakeCountPerDoseHeading("Capsule")).toBe("# of capsules");
    expect(intakeCountPerDoseOptions("Capsule")).toEqual([
      "1/2 capsule",
      "1 capsule",
      "2 capsules",
    ]);
    expect(intakeCountPerDoseOptions("Pill")).toEqual(["1/2 pill", "1 pill", "2 pills"]);
  });

  it("migrates saved counts when the dosage form changes", () => {
    expect(migrateCountPerDoseToForm("2 tablets", "Capsule")).toBe("2 capsules");
    expect(migrateCountPerDoseToForm("1/2 tablet", "Pill")).toBe("1/2 pill");
  });
});

describe("intake frequencies", () => {
  it("includes Before Meals after With meals", () => {
    const withMealsIndex = INTAKE_FREQUENCIES.indexOf("With meals");
    const beforeMealsIndex = INTAKE_FREQUENCIES.indexOf("Before Meals");
    expect(beforeMealsIndex).toBeGreaterThan(withMealsIndex);
    expect(beforeMealsIndex).toBe(withMealsIndex + 1);
  });
});

describe("insulin dosage forms", () => {
  it("detects insulin medication names", () => {
    expect(isInsulinMedication("Novolog (insulin)")).toBe(true);
    expect(isInsulinMedication("Lantus")).toBe(true);
    expect(isInsulinMedication("Metformin")).toBe(false);
  });

  it("adds Pump only for insulin medications", () => {
    const insulinForms = intakeDosageFormsForMedication("Humalog (insulin)");
    const nonInsulinForms = intakeDosageFormsForMedication("Metformin");
    expect(insulinForms).toContain(INTAKE_INSULIN_PUMP_DOSAGE_FORM);
    expect(nonInsulinForms).not.toContain(INTAKE_INSULIN_PUMP_DOSAGE_FORM);
    expect(insulinForms.indexOf("Pump")).toBe(insulinForms.indexOf("Pen") + 1);
  });
});
