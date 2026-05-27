import { describe, it, expect } from "vitest";
import {
  normalizeCountyName,
  countyMatchesList,
  type CountyMatch,
} from "../zip-county-lookup";

const list: CountyMatch[] = [
  { county: "Harris County", state: "Texas", stateCode: "TX" },
  { county: "Orleans Parish", state: "Louisiana", stateCode: "LA" },
];

describe("normalizeCountyName", () => {
  it("strips county/parish suffixes and punctuation", () => {
    expect(normalizeCountyName("Harris County")).toBe("harris");
    expect(normalizeCountyName("Orleans Parish")).toBe("orleans");
    expect(normalizeCountyName("St. Louis")).toBe("stlouis");
  });
});

describe("countyMatchesList", () => {
  it("finds a county regardless of suffix/casing", () => {
    expect(countyMatchesList("harris", list)?.stateCode).toBe("TX");
    expect(countyMatchesList("Orleans Parish", list)?.stateCode).toBe("LA");
  });
  it("returns null when nothing matches", () => {
    expect(countyMatchesList("nope", list)).toBeNull();
    expect(countyMatchesList("", list)).toBeNull();
  });
});