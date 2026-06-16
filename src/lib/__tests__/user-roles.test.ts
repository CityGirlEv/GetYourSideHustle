import { describe, it, expect } from "vitest";
import { userHasAdminRole, userHasLeadsAdminRole, userCanViewAllScenarios } from "../user-roles";

describe("userHasAdminRole", () => {
  it("returns true for primary admin role", () => {
    expect(userHasAdminRole({ role: "admin", roles: ["admin"] })).toBe(true);
  });

  it("returns true for Leads Admin role", () => {
    expect(userHasAdminRole({ role: "leads_admin", roles: ["admin", "leads_admin"] })).toBe(true);
  });

  it("returns true when admin is in roles even if primary role differs", () => {
    expect(userHasAdminRole({ role: "qa", roles: ["qa", "admin"] })).toBe(true);
  });

  it("returns false for non-admin users", () => {
    expect(userHasAdminRole({ role: "qa", roles: ["qa"] })).toBe(false);
    expect(userHasAdminRole(null)).toBe(false);
  });
});

describe("userHasLeadsAdminRole", () => {
  it("returns true only for leads_admin", () => {
    expect(userHasLeadsAdminRole({ role: "leads_admin", roles: ["admin", "leads_admin"] })).toBe(
      true,
    );
    expect(userHasLeadsAdminRole({ role: "admin", roles: ["admin"] })).toBe(false);
  });
});

describe("userCanViewAllScenarios", () => {
  it("returns true only for Leads Admin", () => {
    expect(userCanViewAllScenarios({ role: "leads_admin", roles: ["leads_admin"] })).toBe(true);
    expect(userCanViewAllScenarios({ role: "admin", roles: ["admin"] })).toBe(false);
  });
});