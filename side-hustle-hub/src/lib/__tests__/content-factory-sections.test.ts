import { describe, expect, it } from "vitest";
import {
  CONTENT_FACTORY_MENU_CHILDREN,
  CONTENT_FACTORY_SECTIONS,
  contentFactorySectionFor,
} from "../content-factory-sections";

describe("Content Factory sections", () => {
  it("nests Posting Schedule, Creatives Schedule, and Growth Studio under Content Factory", () => {
    expect(CONTENT_FACTORY_SECTIONS.map((section) => section.label)).toEqual([
      "Content Factory",
      "Posting Schedule",
      "Creatives Schedule",
      "Growth Studio",
    ]);
    expect(CONTENT_FACTORY_MENU_CHILDREN.map((section) => section.id)).toEqual([
      "posting",
      "creatives",
      "studio",
    ]);
  });

  it("resolves each page from the admin tab and panel", () => {
    expect(contentFactorySectionFor("factory", "launch-plan")).toBe("factory");
    expect(contentFactorySectionFor("factory", "posting")).toBe("posting");
    expect(contentFactorySectionFor("factory", "creatives")).toBe("creatives");
    expect(contentFactorySectionFor("studio", undefined)).toBe("studio");
  });
});
