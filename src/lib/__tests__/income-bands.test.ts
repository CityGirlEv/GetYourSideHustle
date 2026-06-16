import { describe, it, expect } from "vitest";
import { INCOME_BANDS, DEFAULT_INCOME_BAND, isIncomeBand } from "../income-bands";

describe("INCOME_BANDS", () => {
  it("starts with Under $15k and uses $20k-wide ranges", () => {
    expect(INCOME_BANDS[0]).toBe("Under $15k");
    expect(INCOME_BANDS).toContain("$15k–$35k");
    expect(INCOME_BANDS).toContain("$35k–$55k");
    expect(INCOME_BANDS).toContain("$55k–$75k");
    expect(INCOME_BANDS).toContain("$75k–$95k");
    expect(INCOME_BANDS).toContain("$95k–$115k");
    expect(INCOME_BANDS).toContain("Over $115k");
    expect(INCOME_BANDS.at(-1)).toBe("Prefer not to say");
  });

  it("default is a selectable mid-range band", () => {
    expect(isIncomeBand(DEFAULT_INCOME_BAND)).toBe(true);
  });
});
