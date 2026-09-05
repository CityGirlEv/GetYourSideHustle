import { describe, expect, it } from "vitest";
import { ALL_ROLES, canAccessAdminPortal, canAccessTestingPortal, primaryRole, rolesForPublicRegister } from "../roles";

/** Must match users.role CHECK in D1 (see ensure-users-role-check.ts). */
const DB_ROLE_CHECK = new Set([
  "admin",
  "qa",
  "dev",
  "kid",
  "junior",
  "adult",
  "senior",
  "beta",
]);

describe("rolesForPublicRegister", () => {
  it("includes beta as a first-class role", () => {
    expect(ALL_ROLES).toContain("beta");
  });

  it("gates Admin Studio to admin only; QA/Dev alone cannot enter", () => {
    expect(canAccessAdminPortal(["admin"])).toBe(true);
    expect(canAccessAdminPortal(["admin", "qa"])).toBe(true);
    expect(canAccessAdminPortal(["qa"])).toBe(false);
    expect(canAccessAdminPortal(["dev"])).toBe(false);
    expect(canAccessAdminPortal(["adult", "beta"])).toBe(false);
  });

  it("gates Testing Portal to Admin or QA", () => {
    expect(canAccessTestingPortal(["admin"])).toBe(true);
    expect(canAccessTestingPortal(["qa"])).toBe(true);
    expect(canAccessTestingPortal(["dev"])).toBe(false);
    expect(canAccessTestingPortal(["adult"])).toBe(false);
  });

  it("keeps the age-band role primary when applying as Beta Tester", () => {
    const roles = rolesForPublicRegister("adult", true);
    expect(roles).toEqual(["adult", "beta"]);
    expect(primaryRole(roles)).toBe("adult");
  });

  it("maps kids parent accounts to adult + optional beta", () => {
    expect(rolesForPublicRegister("kids", true)).toEqual(["adult", "beta"]);
  });

  it("stores a DB-legal primary role for every membership lane + beta", () => {
    for (const age of ["kids", "junior", "adult", "senior"] as const) {
      const withBeta = rolesForPublicRegister(age, true);
      const without = rolesForPublicRegister(age, false);
      expect(DB_ROLE_CHECK.has(primaryRole(withBeta))).toBe(true);
      expect(DB_ROLE_CHECK.has(primaryRole(without))).toBe(true);
      expect(withBeta).toContain("beta");
      expect(without).not.toContain("beta");
    }
    expect(primaryRole(rolesForPublicRegister("senior", true))).toBe("senior");
    expect(primaryRole(rolesForPublicRegister("junior", true))).toBe("junior");
  });

  it("does not grant Admin Studio for a beta application", () => {
    expect(canAccessAdminPortal(rolesForPublicRegister("adult", true))).toBe(false);
    expect(canAccessAdminPortal(rolesForPublicRegister("senior", true))).toBe(false);
  });
});
