import { describe, it, expect } from "vitest";
import {
  countiesForZip3,
  normalizeCountyName,
  countyMatchesZip3,
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