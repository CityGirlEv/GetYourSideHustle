import { describe, it, expect } from "vitest";
import {
  INCOME_BANDS,
  DEFAULT_INCOME_BAND,
  isIncomeBand,
  isIncomeAboveFederalPovertyLevel,
  FEDERAL_POVERTY_LEVEL_NOTE,
} from "../income-bands";

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

describe("isIncomeAboveFederalPovertyLevel", () => {
  it("returns false for Under $15k and Prefer not to say", () => {
    expect(isIncomeAboveFederalPovertyLevel("Under $15k")).toBe(false);
    expect(isIncomeAboveFederalPovertyLevel("Prefer not to say")).toBe(false);
  });

  it("returns true for $15k–$35k and higher bands", () => {
    expect(isIncomeAboveFederalPovertyLevel("$15k–$35k")).toBe(true);
    expect(isIncomeAboveFederalPovertyLevel("$55k–$75k")).toBe(true);
    expect(isIncomeAboveFederalPovertyLevel("Over $115k")).toBe(true);
  });

  it("returns false for unknown strings", () => {
    expect(isIncomeAboveFederalPovertyLevel("middle")).toBe(false);
  });
});

describe("FEDERAL_POVERTY_LEVEL_NOTE", () => {
  it("mentions D-SNP and Medicaid", () => {
    expect(FEDERAL_POVERTY_LEVEL_NOTE).toMatch(/D-SNP/i);
    expect(FEDERAL_POVERTY_LEVEL_NOTE).toMatch(/Medicaid/i);
  });
});
