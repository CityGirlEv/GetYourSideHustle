import { describe, expect, it } from "vitest";
import { userCanSeeAdminMenu, userHasAdminRole } from "@/lib/user-roles";
import { hasStaffNavHint, persistStaffNavUser, clearStaffNavUser } from "@/lib/staff-nav-session";

describe("admin nav access rules", () => {
  function showAdminNav(
    user: Parameters<typeof userCanSeeAdminMenu>[0],
    opts?: { sessionUserId?: string; authLoading?: boolean },
  ) {
    const staffFromProfile = Boolean(user) && userCanSeeAdminMenu(user);
    const staffFromHint =
      Boolean(opts?.sessionUserId) &&
      (opts?.authLoading || !user) &&
      hasStaffNavHint(opts?.sessionUserId);
    return staffFromProfile || staffFromHint;
  }

  function showPricing(user: Parameters<typeof userHasAdminRole>[0]) {
    return Boolean(user) && userHasAdminRole(user);
  }

  it("shows admin nav only for admin role", () => {
    expect(showAdminNav({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(showAdminNav({ role: "qa", roles: ["qa"] })).toBe(false);
    expect(showAdminNav({ role: "editor", roles: ["editor"] })).toBe(false);
    expect(showAdminNav({ role: "leads_admin", roles: ["leads_admin"] })).toBe(false);
    expect(showAdminNav(null)).toBe(false);
    expect(showAdminNav({ role: "agent", roles: ["agent"] })).toBe(false);
  });

  it("shows admin nav from session hint while profile hydrates", () => {
    clearStaffNavUser();
    persistStaffNavUser("staff-1");
    expect(
      showAdminNav(null, { sessionUserId: "staff-1", authLoading: true }),
    ).toBe(true);
    expect(
      showAdminNav(null, { sessionUserId: "other-user", authLoading: true }),
    ).toBe(false);
    clearStaffNavUser();
  });

  it("documents subscription checkout access for admin and leads_admin", () => {
    expect(showPricing({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(showPricing({ role: "leads_admin", roles: ["leads_admin"] })).toBe(true);
    expect(showPricing({ role: "qa", roles: ["qa"] })).toBe(false);
  });
});
