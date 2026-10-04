import { describe, expect, it } from "vitest";
import { dashboardNavPlanLabel, dashboardNavTone } from "../membership";
import {
  COMMUNITY_NAV_CHILDREN,
  MATCH_WIZARDS_NAV_LABEL,
  MATCH_WIZARD_NAV_CHILDREN,
  isCommunityNavView,
} from "../primary-nav";

describe("primary nav", () => {
  it("nests Adults, Seniors, and Kids under Match Wizards", () => {
    expect(MATCH_WIZARDS_NAV_LABEL).toBe("Match Wizards");
    expect(MATCH_WIZARD_NAV_CHILDREN.map((c) => c.label)).toEqual([
      "Adults",
      "Seniors",
      "Kids & Teens",
    ]);
  });

  it("nests Blog, Newsletter, and GEAR under Community; Workshops is a main-menu item", () => {
    expect(COMMUNITY_NAV_CHILDREN.map((c) => c.label)).toEqual([
      "Blog",
      "Newsletter",
      "GEAR",
    ]);
    expect(COMMUNITY_NAV_CHILDREN.some((c) => c.id === "workshops")).toBe(false);
    expect(COMMUNITY_NAV_CHILDREN[0]?.view).toBe("community");
    expect(COMMUNITY_NAV_CHILDREN.find((c) => c.id === "gear")?.view).toBe("shop");
    expect(isCommunityNavView("community")).toBe(true);
    expect(isCommunityNavView("guides")).toBe(false);
    expect(isCommunityNavView("shop")).toBe(true);
    expect(isCommunityNavView("workshops")).toBe(false);
    expect(isCommunityNavView("join")).toBe(false);
  });

  it("colors My Dashboard by membership tier", () => {
    expect(dashboardNavTone("free")).toBe("free");
    expect(dashboardNavTone("starter")).toBe("starter");
    expect(dashboardNavTone("PRO")).toBe("pro");
    expect(dashboardNavTone("elite")).toBe("elite");
    expect(dashboardNavTone(null)).toBe("free");
  });

  it("labels the Dashboard bubble with the membership level", () => {
    expect(dashboardNavPlanLabel("free")).toBe("Free");
    expect(dashboardNavPlanLabel("starter")).toBe("Starter");
    expect(dashboardNavPlanLabel("PRO")).toBe("Pro");
    expect(dashboardNavPlanLabel("elite")).toBe("Elite");
    expect(dashboardNavPlanLabel(null)).toBe("Free");
  });
});
