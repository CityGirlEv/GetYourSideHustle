import { describe, expect, it } from "vitest";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { guideKitForId } from "../guide-tools";

describe("launch-guide-pdf model", () => {
  it("builds a checklist model with qty supplies and no basic_supplies tool dupe", () => {
    const model = buildLaunchGuidePdfModel("car-interior-cleanup");
    expect(model.title).toBe("Car Interior Cleanup Helper");
    expect(model.title).not.toMatch(/car-interior-cleanup/);
    expect(
      buildLaunchGuidePdfModel("car-interior-cleanup", { name: "car-interior-cleanup" }).title,
    ).toBe("Car Interior Cleanup Helper");
    expect(model.supplies.length).toBeGreaterThanOrEqual(3);
    expect(model.supplies.every((s) => s.qty.trim().length > 0)).toBe(true);
    expect(model.supplies.every((s) => s.estCost.trim().length > 0)).toBe(true);
    expect(model.tools.some((t) => /basic job supplies/i.test(t))).toBe(false);
    expect(model.steps.length).toBeGreaterThanOrEqual(4);
  });

  it("includes beach shell jewelry supplies with cord quantities", () => {
    const model = buildLaunchGuidePdfModel("beach-shell-jewelry");
    expect(model.supplies.some((s) => /cord|wire/i.test(s.name))).toBe(true);
    const kit = guideKitForId("beach-shell-jewelry");
    expect(kit.supplies?.items.some((i) => i.qty.includes("spool") || /\d/.test(i.qty))).toBe(true);
  });
});
