import { describe, expect, it } from "vitest";
import {
  AUTOMATED_SUITE_OWNERS,
  FAILED_TEST_ASSIGNEE,
  GYSH_ROLE_LABELS,
  GYSH_ROLES,
  QA_TESTERS,
  rolesForPublicRegister,
  canAccessAdminPortal,
  formatRoles,
  isAutomatedSuiteOwner,
  isHumanQaTester,
  qaTesterIdForUser,
  qaTestersFromUsers,
  userHasRole,
  userRoles,
  type GyshUser,
} from "../gysh-roles";

describe("gysh-roles", () => {
  it("includes QA and Dev roles in labels", () => {
    expect(GYSH_ROLE_LABELS.qa).toBe("QA");
    expect(GYSH_ROLE_LABELS.dev).toBe("Dev");
    expect(GYSH_ROLES).toContain("dev");
  });

  it("routes failed tests to Evelyn", () => {
    expect(FAILED_TEST_ASSIGNEE).toBe("evelyn");
  });

  it("defines a seed QA catalog (live lists come from Users with QA role)", () => {
    expect(QA_TESTERS.map((t) => t.id)).toEqual(["tina", "evelyn", "lyriq", "candace"]);
    expect(QA_TESTERS.map((t) => t.shortName)).toEqual(["Tina", "Evelyn", "Lyriq", "Candace"]);
  });

  it("builds QA tester list from active Users with the QA role", () => {
    const list = qaTestersFromUsers([
      {
        id: "u-c",
        name: "Candace Jackson",
        email: "candacejackson1@icloud.com",
        role: "admin",
        roles: ["admin", "qa"],
        status: "active",
        joinedAt: "2026-08-01",
        notes: "",
      },
      {
        id: "u-new",
        name: "Jordan Lee",
        email: "jordan@example.com",
        role: "qa",
        roles: ["qa"],
        status: "active",
        joinedAt: "2026-08-01",
        notes: "",
      },
      {
        id: "u-adult",
        name: "Member",
        email: "m@example.com",
        role: "adult",
        roles: ["adult"],
        status: "active",
        joinedAt: "2026-08-01",
        notes: "",
      },
      {
        id: "u-pending",
        name: "Pending QA",
        email: "p@example.com",
        role: "qa",
        roles: ["qa"],
        status: "pending",
        joinedAt: "2026-08-01",
        notes: "",
      },
    ]);
    expect(list.map((t) => t.id)).toContain("candace");
    expect(list.map((t) => t.id)).toContain("jordan");
    expect(list.map((t) => t.shortName)).toContain("Jordan");
    expect(list.every((t) => t.id !== "member")).toBe(true);
  });

  it("treats any non-automated assignee id as a human QA tester", () => {
    expect(isHumanQaTester("candace")).toBe(true);
    expect(isHumanQaTester("jordan")).toBe(true);
    expect(isHumanQaTester("vitest")).toBe(false);
    expect(isHumanQaTester("")).toBe(false);
  });

  it("defines Vitest and Playwright suite owners (not human testers)", () => {
    expect(AUTOMATED_SUITE_OWNERS.map((t) => t.id)).toEqual(["vitest", "playwright"]);
    expect(isHumanQaTester("vitest")).toBe(false);
    expect(isAutomatedSuiteOwner("vitest")).toBe(true);
    expect(isAutomatedSuiteOwner("playwright")).toBe(true);
  });

  it("keeps Kid age band at 3–12 in label", () => {
    expect(GYSH_ROLE_LABELS.kid).toContain("3");
  });

  it("includes Senior role for Seniors Corner login", () => {
    expect(GYSH_ROLE_LABELS.senior).toContain("55");
  });

  it("offers Beta Tester as a self-select role at public register", () => {
    expect(GYSH_ROLES).toContain("beta");
    expect(GYSH_ROLE_LABELS.beta).toBe("Beta Tester");
    expect(rolesForPublicRegister("adult", false)).toEqual(["adult"]);
    expect(rolesForPublicRegister("adult", true)).toEqual(["adult", "beta"]);
    expect(rolesForPublicRegister("senior", true)).toEqual(["senior", "beta"]);
    expect(rolesForPublicRegister("junior", true)).toEqual(["junior", "beta"]);
    expect(rolesForPublicRegister("kids", true)).toEqual(["adult", "beta"]);
    expect(rolesForPublicRegister("adult", true)).not.toContain("qa");
    expect(rolesForPublicRegister("adult", true)).not.toContain("admin");
  });

  it("supports multi-role admin + QA", () => {
    const u: GyshUser = {
      id: "u-lyriq",
      name: "Lyriq",
      email: "leegaulden1222@icloud.com",
      role: "admin",
      roles: ["admin", "qa"],
      status: "active",
      joinedAt: "2026-07-01",
      notes: "",
    };
    expect(userRoles(u)).toEqual(["admin", "qa"]);
    expect(userHasRole(u, "admin")).toBe(true);
    expect(userHasRole(u, "qa")).toBe(true);
    expect(formatRoles(u)).toBe("Admin · QA");
  });

  it("supports Evelyn admin + QA + Dev", () => {
    const u: GyshUser = {
      id: "u-ev",
      name: "Evelyn Irving",
      email: "evelyn3@cox.net",
      role: "admin",
      roles: ["admin", "qa", "dev"],
      status: "active",
      joinedAt: "2026-07-01",
      notes: "",
    };
    expect(userRoles(u)).toEqual(["admin", "qa", "dev"]);
    expect(userHasRole(u, "dev")).toBe(true);
    expect(formatRoles(u)).toBe("Admin · QA · Dev");
  });

  it("falls back to single role when roles array missing", () => {
    const u: GyshUser = {
      id: "u-1",
      name: "Adult",
      email: "a@example.com",
      role: "adult",
      status: "active",
      joinedAt: "2026-07-01",
      notes: "",
    };
    expect(userRoles(u)).toEqual(["adult"]);
    expect(userHasRole(u, "adult")).toBe(true);
  });

  it("gates Admin Studio to admin, qa, or dev only", () => {
    expect(canAccessAdminPortal(null)).toBe(false);
    expect(canAccessAdminPortal({ role: "adult" })).toBe(false);
    expect(canAccessAdminPortal({ role: "admin" })).toBe(true);
    expect(canAccessAdminPortal({ role: "qa" })).toBe(true);
    expect(canAccessAdminPortal({ role: "dev" })).toBe(true);
    expect(canAccessAdminPortal({ role: "adult", roles: ["qa"] })).toBe(true);
    expect(canAccessAdminPortal({ role: "adult", roles: ["adult", "beta"] })).toBe(false);
  });

  it("maps Candace Jackson to the candace QA tester id", () => {
    expect(
      qaTesterIdForUser({ name: "Candace Jackson", email: "candacejackson1@icloud.com" }),
    ).toBe("candace");
    expect(qaTesterIdForUser({ name: "Candace", email: "other@example.com" })).toBe("candace");
  });
});
