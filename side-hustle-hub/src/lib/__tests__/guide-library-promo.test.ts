import { describe, expect, it } from "vitest";
import {
  guideLibraryPromoCallout,
  LEAF_BLOWING_BLOWER_DRAWING_COPY,
} from "../guide-library-promo";

describe("guideLibraryPromoCallout", () => {
  it("highlights Free Mini Hand-Held Blower drawing on Leaf Blowing Service", () => {
    const copy = guideLibraryPromoCallout("leaf-raking");
    expect(copy).toBe(LEAF_BLOWING_BLOWER_DRAWING_COPY);
    expect(copy!.toLowerCase()).toContain("drawing");
    expect(copy!.toLowerCase()).toContain("free mini hand-held blower");
    expect(copy!.toLowerCase()).toContain("contact form");
    expect(copy!.toLowerCase()).toContain("conditions apply");
  });

  it("returns null for unrelated guides", () => {
    expect(guideLibraryPromoCallout("dog-walk")).toBeNull();
  });
});
