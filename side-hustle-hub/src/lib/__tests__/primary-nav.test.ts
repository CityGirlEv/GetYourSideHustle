import { describe, expect, it } from "vitest";
import { dashboardNavTone } from "../membership";
import { COMMUNITY_NAV_CHILDREN, isCommunityNavView } from "../primary-nav";

describe("primary nav", () => {
  it("nests Blog, Workshops, Newsletter, and GEAR under Community; Guides is primary", () => {
    expect(COMMUNITY_NAV_CHILDREN.map((c) => c.label)).toEqual([
      "Blog",
      "Workshops",
      "Newsletter",
      "GEAR",
    ]);
    expect(COMMUNITY_NAV_CHILDREN[0]?.view).toBe("community");
    expect(COMMUNITY_NAV_CHILDREN.find((c) => c.id === "gear")?.view).toBe("shop");
    expect(isCommunityNavView("community")).toBe(true);
    expect(isCommunityNavView("guides")).toBe(false);
    expect(isCommunityNavView("shop")).toBe(true);
    expect(isCommunityNavView("join")).toBe(false);
  });

  it("colors My Dashboard by membership tier", () => {
    expect(dashboardNavTone("free")).toBe("free");
    expect(dashboardNavTone("starter")).toBe("starter");
    expect(dashboardNavTone("PRO")).toBe("pro");
    expect(dashboardNavTone("elite")).toBe("elite");
    expect(dashboardNavTone(null)).toBe("free");
  });
});
