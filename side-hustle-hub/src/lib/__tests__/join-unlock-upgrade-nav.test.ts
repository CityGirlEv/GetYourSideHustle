import { describe, expect, it } from "vitest";
import { joinUnlockNavOpts } from "../join-unlock-nav";

describe("join unlock upgrade navigation", () => {
  it("always scrolls to membership plans", () => {
    expect(joinUnlockNavOpts("starter").scrollToPlans).toBe(true);
    expect(joinUnlockNavOpts("free").scrollToPlans).toBe(true);
    expect(joinUnlockNavOpts(undefined).scrollToPlans).toBe(true);
  });

  it("focuses paid tiers so Upgrade/Choose is ready for checkout", () => {
    expect(joinUnlockNavOpts("starter").focusTier).toBe("starter");
    expect(joinUnlockNavOpts("pro").focusTier).toBe("pro");
    expect(joinUnlockNavOpts("elite").focusTier).toBe("elite");
  });

  it("does not focus Free (join Free starts at plans without a paid Upgrade button)", () => {
    expect(joinUnlockNavOpts("free").focusTier).toBeUndefined();
    expect(joinUnlockNavOpts(null).focusTier).toBeUndefined();
  });
});
