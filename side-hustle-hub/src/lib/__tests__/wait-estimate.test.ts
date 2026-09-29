import { describe, expect, it } from "vitest";
import {
  BILLING_ACCESS_WAIT_MS,
  CART_CREDITS_WAIT_MS,
  CREDITS_TAB_WAIT_MS,
  WAIT_PROGRESS_CAP,
  formatApproxRemaining,
  waitProgress,
} from "../wait-estimate";

describe("wait-estimate", () => {
  it("formats remaining time in seconds, then minutes", () => {
    expect(formatApproxRemaining(0)).toBe("~1s remaining");
    expect(formatApproxRemaining(1_400)).toBe("~2s remaining");
    expect(formatApproxRemaining(59_000)).toBe("~59s remaining");
    expect(formatApproxRemaining(60_000)).toBe("~1 min remaining");
    expect(formatApproxRemaining(90_000)).toBe("~2 min remaining");
  });

  it("uses the same Stripe-sync wait budget on Credits as Billing/Access", () => {
    expect(CREDITS_TAB_WAIT_MS).toBe(BILLING_ACCESS_WAIT_MS);
    expect(CREDITS_TAB_WAIT_MS).toBe(60_000);
    expect(CART_CREDITS_WAIT_MS).toBeLessThan(CREDITS_TAB_WAIT_MS);
    expect(CART_CREDITS_WAIT_MS).toBeGreaterThan(0);
  });

  it("caps progress and reports time remaining for long Billing/Access loads", () => {
    const start = waitProgress(0, BILLING_ACCESS_WAIT_MS);
    expect(start.progressPct).toBe(0);
    expect(start.remainingLabel).toContain("% time remaining");
    expect(start.remainingLabel).toContain("~1 min remaining");

    const mid = waitProgress(30_000, BILLING_ACCESS_WAIT_MS);
    expect(mid.progressPct).toBe(50);
    expect(mid.atCap).toBe(false);
    expect(mid.remainingLabel).toContain("~30s remaining");

    const late = waitProgress(BILLING_ACCESS_WAIT_MS, BILLING_ACCESS_WAIT_MS);
    expect(late.progressPct).toBe(WAIT_PROGRESS_CAP);
    expect(late.atCap).toBe(true);
    expect(late.remainingLabel).toBe("Almost there…");
  });
});
