import { describe, expect, it } from "vitest";
import { nextGearGalleryIndex } from "../gear-gallery";

describe("nextGearGalleryIndex", () => {
  it("advances and wraps", () => {
    expect(nextGearGalleryIndex(0, 3)).toBe(1);
    expect(nextGearGalleryIndex(2, 3)).toBe(0);
  });

  it("handles empty and negative current", () => {
    expect(nextGearGalleryIndex(0, 0)).toBe(0);
    expect(nextGearGalleryIndex(-1, 4)).toBe(0);
  });
});
