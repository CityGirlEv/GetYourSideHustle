import { describe, expect, it } from "vitest";
import {
  parseGuideLibraryAgeParam,
  readGuideLibraryAgeFromSearch,
} from "../guide-library-age";

describe("guide library age query", () => {
  it("parses canonical age facets", () => {
    expect(parseGuideLibraryAgeParam("kids")).toBe("kids");
    expect(parseGuideLibraryAgeParam("junior")).toBe("junior");
    expect(parseGuideLibraryAgeParam("adult")).toBe("adult");
    expect(parseGuideLibraryAgeParam("senior")).toBe("senior");
  });

  it("accepts teens / seniors aliases", () => {
    expect(parseGuideLibraryAgeParam("teens")).toBe("junior");
    expect(parseGuideLibraryAgeParam("seniors")).toBe("senior");
  });

  it("rejects unknown values", () => {
    expect(parseGuideLibraryAgeParam("all")).toBeNull();
    expect(parseGuideLibraryAgeParam("")).toBeNull();
    expect(parseGuideLibraryAgeParam(null)).toBeNull();
  });

  it("reads from search strings", () => {
    expect(readGuideLibraryAgeFromSearch("?age=kids")).toBe("kids");
    expect(readGuideLibraryAgeFromSearch("?hustle=x&age=teens")).toBe("junior");
    expect(readGuideLibraryAgeFromSearch("")).toBeNull();
  });
});
