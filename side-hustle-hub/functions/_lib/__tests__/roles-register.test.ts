import { describe, expect, it } from "vitest";
import { ALL_ROLES, canAccessAdminPortal, primaryRole, rolesForPublicRegister } from "../roles";

describe("rolesForPublicRegister", () => {
  it("includes beta as a first-class role", () => {
    expect(ALL_ROLES).toContain("beta");
  });

  it("keeps the age-band role primary when applying as Beta Tester", () => {
    const roles = rolesForPublicRegister("adult", true);
    expect(roles).toEqual(["adult", "beta"]);
    expect(primaryRole(roles)).toBe("adult");
  });

  it("maps kids parent accounts to adult + optional beta", () => {
    expect(rolesForPublicRegister("kids", true)).toEqual(["adult", "beta"]);
  });

  it("does not grant Admin Studio for a beta application", () => {
    expect(canAccessAdminPortal(rolesForPublicRegister("adult", true))).toBe(false);
  });
});
