import { describe, expect, it } from "vitest";
import { guideLibraryPromoCallout } from "../guide-library-promo";

describe("guideLibraryPromoCallout", () => {
  it("highlights Free Mini Hand Held Blower entry on Leaf Blowing Service", () => {
    const copy = guideLibraryPromoCallout("leaf-raking");
    expect(copy).toBeTruthy();
    expect(copy!.toLowerCase()).toContain("free mini hand held blower");
    expect(copy!.toLowerCase()).toContain("optional");
    expect(copy!.toLowerCase()).toContain("purchase");
  });

  it("returns null for unrelated guides", () => {
    expect(guideLibraryPromoCallout("dog-walk")).toBeNull();
  });
});
