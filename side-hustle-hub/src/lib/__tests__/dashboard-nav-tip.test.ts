import { describe, expect, it } from "vitest";
import { myDashboardLocationTip, myDashboardLocationTipShort } from "../dashboard-nav-tip";

describe("dashboard nav tip", () => {
  it("points members to My Dashboard next to How it works", () => {
    expect(myDashboardLocationTip()).toMatch(/My Dashboard/i);
    expect(myDashboardLocationTip()).toMatch(/How it works/i);
    expect(myDashboardLocationTipShort()).toMatch(/How it works/i);
  });
});
