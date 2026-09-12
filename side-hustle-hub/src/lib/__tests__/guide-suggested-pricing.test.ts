import { describe, expect, it } from "vitest";
import { formatPricingLine, type GuidePricingItem } from "../guide-suggested-pricing";

describe("formatPricingLine", () => {
  it("uses label + price + notes", () => {
    expect(
      formatPricingLine({
        id: "quick",
        label: "Quick Help",
        price: "$10–$15/job",
        notes: "30–60 minutes of simple parent-present help",
      }),
    ).toBe("Quick Help: $10–$15/job — 30–60 minutes of simple parent-present help");
  });

  it("falls back to name when label is missing", () => {
    const item = {
      id: "quick",
      name: "Quick Help",
      price: "$10–$15/job",
    } as GuidePricingItem;
    expect(formatPricingLine(item)).toBe("Quick Help: $10–$15/job");
  });
});
