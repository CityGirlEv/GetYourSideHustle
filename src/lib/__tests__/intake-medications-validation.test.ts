import { describe, it, expect } from "vitest";
import {
  prepareMedicationsForStepFinish,
  validateMedicationEntry,
  validateMedicationNotDuplicate,
  validateMedicationsForSubmit,
} from "../intake-medications-validation";

describe("validateMedicationsForSubmit", () => {
  it("allows creating a scenario with zero medications", () => {
    const result = validateMedicationsForSubmit(
      [{ id: "blank", medication_name: "" }],
      [],
    );
    expect(result).toEqual({ ok: true, submitted: [] });
  });

  it("returns confirmed medications only", () => {
    const meds = [
      { id: "a", medication_name: "Losartan" },
      { id: "b", medication_name: "" },
    ];
    const result = validateMedicationsForSubmit(meds, ["a"]);
    expect(result).toEqual({ ok: true, submitted: [meds[0]] });
  });

  it("blocks submit when a filled card was not confirmed", () => {
    const result = validateMedicationsForSubmit(
      [{ id: "a", medication_name: "Losartan" }],
      [],
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/Save & Finish/i);
    }
  });
});

describe("validateMedicationEntry", () => {
  it("requires a medication name", () => {
    expect(validateMedicationEntry({ id: "a", medication_name: "" })).toMatch(/Enter a medication/i);
    expect(validateMedicationEntry({ id: "a", medication_name: "  " })).toMatch(/Enter a medication/i);
    expect(validateMedicationEntry({ id: "a", medication_name: "Metformin" })).toBeNull();
  });
});

describe("validateMedicationNotDuplicate", () => {
  it("blocks duplicate confirmed drug names", () => {
    const meds = [
      { id: "a", medication_name: "Losartan" },
      { id: "b", medication_name: "losartan" },
    ];
    expect(validateMedicationNotDuplicate(meds[1]!, meds, ["a"])).toMatch(/already in your list/i);
    expect(validateMedicationNotDuplicate(meds[0]!, meds, ["a"])).toBeNull();
  });
});

describe("prepareMedicationsForStepFinish", () => {
  it("confirms the current card and allows finish when valid", () => {
    const meds = [{ id: "a", medication_name: "Losartan" }];
    const result = prepareMedicationsForStepFinish(meds, [], "a");
    expect(result).toEqual({ ok: true, nextConfirmedIds: ["a"] });
  });

  it("allows finish on an empty last card when nothing else is pending", () => {
    const meds = [{ id: "blank", medication_name: "" }];
    const result = prepareMedicationsForStepFinish(meds, [], "blank");
    expect(result).toEqual({ ok: true, nextConfirmedIds: [] });
  });

  it("blocks finish when another card has unsaved data", () => {
    const meds = [
      { id: "a", medication_name: "Losartan" },
      { id: "b", medication_name: "Metformin" },
    ];
    const result = prepareMedicationsForStepFinish(meds, ["a"], "a");
    expect(result.ok).toBe(false);
  });
});
