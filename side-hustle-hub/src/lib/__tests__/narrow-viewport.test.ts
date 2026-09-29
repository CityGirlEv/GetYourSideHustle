import { describe, expect, it } from "vitest";
import {
  isNarrowViewport,
  membershipBenefitsPreviewCount,
  readNarrowViewport,
  sectionStartsOpen,
  defaultGuideLibraryLayout,
} from "../narrow-viewport";

describe("narrow viewport section collapse", () => {
  it("reads matchMedia when available", () => {
    expect(isNarrowViewport({ matches: true })).toBe(true);
    expect(isNarrowViewport({ matches: false })).toBe(false);
    expect(isNarrowViewport(null)).toBe(false);
    expect(readNarrowViewport({ matchMedia: () => ({ matches: true }) })).toBe(true);
    expect(readNarrowViewport({ matchMedia: undefined })).toBe(false);
  });

  it("keeps secondary sections open on desktop and closed on phones", () => {
    expect(
      sectionStartsOpen({ defaultOpen: true, collapseOnNarrow: true, narrow: false }),
    ).toBe(true);
    expect(
      sectionStartsOpen({ defaultOpen: true, collapseOnNarrow: true, narrow: true }),
    ).toBe(false);
    expect(
      sectionStartsOpen({ defaultOpen: false, collapseOnNarrow: true, narrow: false }),
    ).toBe(false);
    expect(
      sectionStartsOpen({ defaultOpen: true, collapseOnNarrow: false, narrow: true }),
    ).toBe(true);
  });

  it("hides plan perk previews on phones", () => {
    expect(membershipBenefitsPreviewCount(false)).toBe(2);
    expect(membershipBenefitsPreviewCount(true)).toBe(0);
    expect(membershipBenefitsPreviewCount(true, 3)).toBe(0);
  });

  it("defaults Side Hustle Library to list on phones and grid on desktop", () => {
    expect(defaultGuideLibraryLayout(true)).toBe("list");
    expect(defaultGuideLibraryLayout(false)).toBe("grid");
  });
});