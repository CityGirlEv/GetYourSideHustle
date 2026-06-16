import { describe, it, expect } from "vitest";
import { formatTestRatePercent, testRatePercentValue } from "../test-rate-percent";

describe("test-rate-percent", () => {
  it("does not round 467/468 up to 100%", () => {
    expect(formatTestRatePercent(467, 468)).toBe("99.8%");
    expect(testRatePercentValue(467, 468)).toBeCloseTo(99.786, 2);
  });

  it("shows 100% only when complete", () => {
    expect(formatTestRatePercent(468, 468)).toBe("100%");
    expect(testRatePercentValue(468, 468)).toBe(100);
  });

  it("handles zero total", () => {
    expect(formatTestRatePercent(0, 0)).toBe("0%");
    expect(testRatePercentValue(0, 0)).toBe(0);
  });
});
