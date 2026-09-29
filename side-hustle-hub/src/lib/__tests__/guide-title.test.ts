import { describe, expect, it } from "vitest";
import { sanitizeGuideCatalogPatch } from "../guide-catalog-state";
import { libraryGuideDisplayName } from "../guide-library-pool";
import {
  isUnpresentableGuideTitle,
  presentableGuideTitle,
  titleFromGuideSlug,
} from "../guide-title";

describe("presentable guide titles", () => {
  it("treats kebab-case ids as unpresentable names", () => {
    expect(isUnpresentableGuideTitle("car-interior-cleanup")).toBe(true);
    expect(isUnpresentableGuideTitle("car-interior-cleanup", "car-interior-cleanup")).toBe(true);
    expect(isUnpresentableGuideTitle("airbnb", "airbnb")).toBe(true);
    expect(isUnpresentableGuideTitle("Car Interior Cleanup Helper")).toBe(false);
    expect(isUnpresentableGuideTitle("Airbnb Hosting")).toBe(false);
  });

  it("title-cases leftover slugs with common acronyms", () => {
    expect(titleFromGuideSlug("car-interior-cleanup")).toBe("Car Interior Cleanup");
    expect(titleFromGuideSlug("ai-assets")).toBe("AI Assets");
    expect(titleFromGuideSlug("property-mgmt")).toBe("Property Management");
  });

  it("uses the catalog name instead of a slug overlay", () => {
    expect(presentableGuideTitle("car-interior-cleanup")).toBe("Car Interior Cleanup Helper");
    expect(presentableGuideTitle("car-interior-cleanup", "car-interior-cleanup")).toBe(
      "Car Interior Cleanup Helper",
    );
    expect(presentableGuideTitle("airbnb", "airbnb")).toBe("Airbnb Hosting");
    expect(presentableGuideTitle("dog-walk", "Neighborhood Dog Walker")).toBe(
      "Neighborhood Dog Walker",
    );
    expect(libraryGuideDisplayName("car-interior-cleanup")).toBe("Car Interior Cleanup Helper");
  });

  it("does not keep kebab-case names on catalog patches", () => {
    const patch = sanitizeGuideCatalogPatch({
      name: "car-interior-cleanup",
      assignee: "evelyn",
    });
    expect(patch?.name).toBeUndefined();
    expect(patch?.assignee).toBe("evelyn");
  });
});
