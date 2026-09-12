import { describe, expect, it } from "vitest";
import { uniqueGuideLibraryEntries } from "../guide-library-pool";
import { guideKitForId } from "../guide-tools";
import {
  ensurePricingBeforeMarketingMaterials,
  isGuidePricingStepTitle,
} from "../guide-marketing-plan";

describe("ensurePricingBeforeMarketingMaterials", () => {
  it("moves pricing steps to immediately before Make your marketing materials", () => {
    const out = ensurePricingBeforeMarketingMaterials([
      { title: "Pick how you will tell people about your side hustle", desc: "a" },
      { title: "Make your marketing materials", desc: "b" },
      { title: "Carry out the marketing plan", desc: "c" },
      { title: "Price packages and lock recurring slots", desc: "d" },
      { title: "Do the first job", desc: "e" },
    ]);
    expect(out.map((s) => s.title)).toEqual([
      "Pick how you will tell people about your side hustle",
      "Price packages and lock recurring slots",
      "Make your marketing materials",
      "Carry out the marketing plan",
      "Do the first job",
    ]);
  });

  it("leaves PriceLabs tooling titles alone", () => {
    expect(isGuidePricingStepTitle("Connect PriceLabs")).toBe(false);
    expect(isGuidePricingStepTitle("Pricing strategy")).toBe(true);
  });

  it("every library guide has no pricing step after Make your marketing materials", () => {
    for (const e of uniqueGuideLibraryEntries()) {
      const steps = guideKitForId(e.id).steps ?? [];
      const materialsAt = steps.findIndex((s) =>
        /make your marketing materials/i.test(s.title),
      );
      if (materialsAt < 0) continue;
      const after = steps
        .slice(materialsAt + 1)
        .filter((s) => isGuidePricingStepTitle(s.title))
        .map((s) => s.title);
      expect(after, `${e.id} still has pricing after marketing`).toEqual([]);
    }
  });
});
