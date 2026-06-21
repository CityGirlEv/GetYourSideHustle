import { describe, it, expect } from "vitest";
import { validateMedicationsForSubmit } from "../intake-medications-validation";

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
      expect(result.error).toMatch(/Add this Drug/i);
    }
  });
});
