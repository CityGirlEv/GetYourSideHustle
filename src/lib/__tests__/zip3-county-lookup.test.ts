import { describe, it, expect } from "vitest";
import {
  countiesForZip3,
  normalizeCountyName,
  countyMatchesZip3,
  normalizeZip3Input,
} from "../zip3-county-lookup";

describe("countiesForZip3", () => {
  it("returns [] for invalid input", () => {
    expect(countiesForZip3("")).toEqual([]);
    expect(countiesForZip3("12")).toEqual([]);
    expect(countiesForZip3("abc")).toEqual([]);
  });
  it("returns [] for an unknown zip3", () => {
    expect(countiesForZip3("000")).toEqual([]);
  });
  it("returns counties for Denver-area ZIP prefix 802", () => {
    expect(countiesForZip3("802")).toEqual([
      { county: "Adams", stateCode: "CO" },
      { county: "Denver", stateCode: "CO" },
      { county: "Jefferson", stateCode: "CO" },
    ]);
  });
});

describe("normalizeZip3Input", () => {
  it("strips non-digits and caps at 3", () => {
    expect(normalizeZip3Input("80202")).toBe("802");
    expect(normalizeZip3Input("8 0 2")).toBe("802");
  });
});

describe("normalizeCountyName", () => {
  it("strips suffixes", () => {
    expect(normalizeCountyName("Cook County")).toBe("cook");
  });
});

describe("countyMatchesZip3", () => {
  it("returns null when zip3 has no data", () => {
    expect(countyMatchesZip3("Cook", "999")).toBeNull();
  });
  it("returns null for an empty county input", () => {
    expect(countyMatchesZip3("", "770")).toBeNull();
  });
});
