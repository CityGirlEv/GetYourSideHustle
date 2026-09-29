import { describe, expect, it } from "vitest";
import { guideKitForId, formatGuideToolLine } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import {
  FOOD_DELIVERY_NOTES_WORKSHEET,
  FOOD_DELIVERY_REALITY_CHECK,
} from "../food-delivery-guide";

describe("food-delivery guide rewrite", () => {
  it("ships DoorDash/Uber Eats prereqs, earnings strategy, supplies, and tools", () => {
    const kit = guideKitForId("food-delivery");
    expect(kit.prerequisites.some((p) => /doordash/i.test(p.label))).toBe(true);
    expect(kit.prerequisites.some((p) => /uber eats/i.test(p.label))).toBe(true);
    expect(kit.suggestedPricing?.tabLabel).toMatch(/earnings/i);
    expect(kit.suggestedPricing?.intro).toMatch(/offer amount ÷ estimated miles/i);
    expect(kit.supplies?.items.some((i) => /insulated/i.test(i.name))).toBe(true);
    expect(kit.supplies?.items.some((i) => /phone mount/i.test(i.name))).toBe(true);
    expect(kit.supplies?.items.some((i) => /charger/i.test(i.name))).toBe(true);
    expect(kit.supplies?.items.some((i) => /roadside|flashlight|sanitizer/i.test(i.name))).toBe(
      false,
    );
    expect(kit.tools.some((t) => t.id === "doordash")).toBe(true);
    expect(kit.tools.some((t) => t.id === "uber_eats")).toBe(true);
    expect(kit.tools.some((t) => t.id === "mileage_tracker")).toBe(true);
    expect(kit.tools.some((t) => /roadside/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /flashlight/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /tire inflator/i.test(t.name))).toBe(true);
    for (const tool of kit.tools) {
      expect(formatGuideToolLine(tool), tool.id).not.toMatch(/free plan available/i);
      expect(formatGuideToolLine(tool), tool.id).not.toMatch(/\bfree app\b/i);
    }
    expect(FOOD_DELIVERY_REALITY_CHECK.title).toMatch(/real profit/i);
    expect(FOOD_DELIVERY_NOTES_WORKSHEET).toMatch(/Minimum Target \$\/Mile/i);
  });

  it("includes the 11-step launch plan titles", () => {
    const steps = detailedStepsForGuide("food-delivery") ?? [];
    const titles = steps.map((s) => s.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Choose Your Platform",
        "Check Eligibility",
        "Apply",
        "Complete Screening",
        "Set Up Payment",
        "Prepare Your Vehicle",
        "Set Up Mileage Tracking",
        "Learn Your Delivery Zone",
        "Start Your First Delivery Session",
        "Evaluate Offers Before Accepting",
        "Review Your Profit",
        "Make Your First Sale",
        "Ask for a Short Review",
      ]),
    );
  });
});
