import { describe, expect, it } from "vitest";
import {
  estimatePlanFilterDurationMs,
  estimatePlanFilterSeconds,
  formatPlanFilterCountdown,
  planFilterProgressLabel,
  PLAN_FILTER_PROGRESS_THRESHOLD,
} from "../plan-filter-loading";

describe("plan-filter-loading", () => {
  it("uses threshold constant for progress UI gating", () => {
    expect(PLAN_FILTER_PROGRESS_THRESHOLD).toBe(100);
  });

  it("estimates longer durations for large catalogs", () => {
    expect(estimatePlanFilterDurationMs(50)).toBe(0);
    expect(estimatePlanFilterDurationMs(6045)).toBeGreaterThan(estimatePlanFilterDurationMs(500));
    expect(estimatePlanFilterDurationMs(6045)).toBeLessThanOrEqual(15000);
  });

  it("formats countdown copy", () => {
    expect(formatPlanFilterCountdown(0)).toBe("Finishing up…");
    expect(formatPlanFilterCountdown(1)).toBe("About 1 second left");
    expect(formatPlanFilterCountdown(8)).toBe("About 8 seconds left");
  });

  it("builds phase labels with plan counts", () => {
    expect(planFilterProgressLabel(6045, "filtering")).toBe("Filtering 6,045 plans…");
    expect(planFilterProgressLabel(6045, "rendering")).toBe(
      "Loading 6,045 plans into the list…",
    );
  });

  it("converts duration to seconds", () => {
    expect(estimatePlanFilterSeconds(50)).toBe(0);
    expect(estimatePlanFilterSeconds(6045)).toBeGreaterThanOrEqual(1);
  });
});
