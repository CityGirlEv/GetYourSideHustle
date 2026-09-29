import { describe, expect, it } from "vitest";
import {
  BLUEPRINT_DASHBOARD_HREF,
  CREDIT_PAID_DASHBOARD_LINKS,
  DASHBOARD_HREF,
  DASHBOARD_PORTAL_CHIP_IDS,
  DASHBOARD_PORTAL_TAB_IDS,
  creditPaidThankYouCopy,
  isBlueprintDashboardHash,
} from "../member-dashboard";

describe("member-dashboard helpers", () => {
  it("lists only wired dashboard tabs", () => {
    expect([...DASHBOARD_PORTAL_TAB_IDS]).toEqual([
      "blueprint",
      "profile",
      "schedule",
      "family",
      "credits",
      "referral",
      "purchases",
      "earn",
    ]);
    expect(DASHBOARD_PORTAL_TAB_IDS).not.toContain("milestones");
    expect(DASHBOARD_PORTAL_TAB_IDS).not.toContain("bookmarks");
    expect([...DASHBOARD_PORTAL_CHIP_IDS]).not.toContain("profile");
    expect([...DASHBOARD_PORTAL_CHIP_IDS]).toEqual([
      "blueprint",
      "schedule",
      "family",
      "credits",
      "referral",
      "purchases",
      "earn",
    ]);
  });

  it("points Dashboard and Blueprints at My Dashboard hashes", () => {
    expect(DASHBOARD_HREF).toBe("/my-dashboard");
    expect(BLUEPRINT_DASHBOARD_HREF).toBe("/my-dashboard#blueprint");
    expect(isBlueprintDashboardHash("#blueprint")).toBe(true);
    expect(isBlueprintDashboardHash("blueprints")).toBe(true);
    expect(isBlueprintDashboardHash("#credits")).toBe(false);
  });

  it("thanks the member after a credit payment", () => {
    expect(creditPaidThankYouCopy(40)).toEqual({
      title: "Thank you!",
      body: "Your payment of 40 credits is complete. Nothing is due in cash.",
    });
    expect(creditPaidThankYouCopy(1).body).toBe(
      "Your payment of 1 credit is complete. Nothing is due in cash.",
    );
    expect(creditPaidThankYouCopy(0).body).toBe("Your payment is complete.");
  });

  it("offers Dashboard, Credits, Billing, and Blueprints after a credit payment", () => {
    expect(CREDIT_PAID_DASHBOARD_LINKS.map((link) => link.id)).toEqual([
      "dashboard",
      "credits",
      "billing",
      "blueprints",
    ]);
    expect(CREDIT_PAID_DASHBOARD_LINKS.map((link) => link.href)).toEqual([
      "/my-dashboard",
      "/my-dashboard#credits",
      "/my-dashboard#billing",
      "/my-dashboard#blueprint",
    ]);
  });
});
