import { describe, expect, it } from "vitest";
import {
  memberDashboardPath,
  memberPreviewAudience,
  memberPreviewLinks,
  memberWizardLinkLabel,
  memberWizardPath,
} from "../admin-act-as";
import type { GyshUser } from "../gysh-roles";

function member(over: Partial<GyshUser>): GyshUser {
  return {
    id: "u-1",
    name: "Pat",
    email: "pat@example.com",
    role: "adult",
    status: "active",
    joinedAt: "2026-01-01",
    notes: "",
    audience: "adult",
    ...over,
  };
}

describe("admin member dashboard / wizard links", () => {
  it("sends adults to My Dashboard and the adult Match Wizard", () => {
    const links = memberPreviewLinks(member({ audience: "adult", role: "adult" }));
    expect(links.dashboardHref).toBe("/my-dashboard");
    expect(links.dashboardLabel).toBe("Dashboard");
    expect(links.wizardHref).toBe("/match");
    expect(links.wizardLabel).toBe("Match Wizard");
    expect(memberDashboardPath()).toBe("/my-dashboard");
  });

  it("routes kids, teens, and seniors to their wizards", () => {
    expect(memberPreviewAudience(member({ audience: "kids", role: "kid" }))).toBe("kids");
    expect(memberWizardPath("kids")).toBe("/kids?tab=wizard&mode=kids");
    expect(memberWizardPath("junior")).toBe("/kids?tab=wizard&mode=junior");
    expect(memberWizardPath("senior")).toBe("/seniors?tab=match");
    expect(memberWizardLinkLabel("junior")).toBe("Teens Match Wizard");
    expect(memberPreviewAudience(member({ audience: "teens", role: "adult" }))).toBe("junior");
  });

  it("falls back to roles when audience is missing", () => {
    expect(memberPreviewAudience(member({ audience: "", role: "senior" }))).toBe("senior");
    expect(memberPreviewAudience(member({ audience: "", role: "kid" }))).toBe("kids");
  });
});
