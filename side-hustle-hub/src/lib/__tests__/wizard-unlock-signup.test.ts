import { describe, expect, it } from "vitest";
import { wizardUnlockSignupTarget } from "../wizard-unlock-signup";

describe("wizard unlock signup destination", () => {
  it("opens Free membership signup with the wizard audience, not plans-only Join", () => {
    expect(wizardUnlockSignupTarget("adult")).toEqual({ tier: "free", audience: "adult" });
    expect(wizardUnlockSignupTarget("senior")).toEqual({ tier: "free", audience: "senior" });
    expect(wizardUnlockSignupTarget("kids")).toEqual({ tier: "free", audience: "kids" });
    expect(wizardUnlockSignupTarget("junior")).toEqual({ tier: "free", audience: "junior" });
  });
});
