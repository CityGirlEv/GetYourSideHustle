import { describe, expect, it } from "vitest";
import {
  AUTOMATED_SUITE_OWNERS,
  FAILED_TEST_ASSIGNEE,
  GYSH_ROLE_LABELS,
  GYSH_ROLES,
  QA_TESTERS,
  rolesForPublicRegister,
  canAccessAdminPortal,
  canAccessTestingPortal,
  isQaOnlyPortalUser,
  formatRoles,
  isAutomatedSuiteOwner,
  isHumanQaTester,
  qaTesterIdForUser,
  qaTestersFromUsers,
  allQaTestersForProgress,
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

  it("collapses duplicate Evelyn accounts onto one assignee", () => {
    const list = qaTestersFromUsers([
      {
        id: "u-ev",
        name: "Evelyn Irving",
        email: "evelyn3@cox.net",
        role: "admin",
        roles: ["admin", "qa", "dev"],
        status: "active",
        joinedAt: "2026-07-01",
        notes: "",
      },
      {
        id: "u-ev-typo",
        name: "Evelyn",
        email: "evvelyn3@cox.net",
        role: "admin",
        roles: ["admin", "qa"],
        status: "active",
        joinedAt: "2026-07-01",
        notes: "",
      },
    ]);
    expect(list.filter((t) => t.shortName === "Evelyn")).toHaveLength(1);
    expect(list.filter((t) => t.id === "evelyn" || t.id.startsWith("evelyn-"))).toHaveLength(1);
  });

  it("defines a seed QA catalog (live lists come from Users with QA role)", () => {
    expect(QA_TESTERS.map((t) => t.id)).toEqual(["tina", "evelyn", "lyriq", "candace"]);
    expect(QA_TESTERS.map((t) => t.shortName)).toEqual(["Tina", "Evelyn", "Lyriq", "Candace"]);
  });

  it("lists QA testers alphabetically by displayed first name", () => {
    const list = qaTestersFromUsers([
      {
        id: "u-t",
        name: "Tina Marie Barham",
        email: "tinamariebarham@gmail.com",
        role: "admin",
        roles: ["admin", "qa"],
        status: "active",
        joinedAt: "2026-08-01",
        notes: "",
      },
      {
        id: "u-brenda",
        name: "Brenda Marene Russell",
        email: "bremar00@comcast.net",
        role: "qa",
        roles: ["qa"],
        status: "active",
        joinedAt: "2026-08-01",
        notes: "",
      },
      {
        id: "u-e",
        name: "Evelyn Irving",
        email: "evelyn3@cox.net",
        role: "admin",
        roles: ["admin", "qa"],
        status: "active",
        joinedAt: "2026-08-01",
        notes: "",
      },
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
    ]);
    expect(list.map((t) => t.shortName)).toEqual(["Brenda", "Candace", "Evelyn", "Tina"]);
  });

  it("keeps every catalog QA tester on Daily Progress even when only one live QA user is loaded", () => {
    const list = allQaTestersForProgress([
      {
        id: "u-brenda",
        name: "Brenda Marene Russell",
        email: "bremar00@comcast.net",
        role: "qa",
        roles: ["qa"],
        status: "active",
        joinedAt: "2026-08-01",
        notes: "",
      },
    ]);
    expect(list.map((t) => t.shortName)).toEqual(["Brenda", "Candace", "Evelyn", "Lyriq", "Tina"]);
  });

  it("builds QA tester list from Users with the QA role (active or pending)", () => {
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
      {
        id: "u-disabled",
        name: "Disabled QA",
        email: "d@example.com",
        role: "qa",
        roles: ["qa"],
        status: "disabled",
        joinedAt: "2026-08-01",
        notes: "",
      },
    ]);
    expect(list.map((t) => t.id)).toContain("candace");
    expect(list.map((t) => t.id)).toContain("jordan");
    expect(list.map((t) => t.id)).toContain("pending");
    expect(list.map((t) => t.shortName)).toContain("Jordan");
    expect(list.map((t) => t.shortName)).toContain("Pending");
    expect(list.every((t) => t.id !== "member")).toBe(true);
    expect(list.every((t) => t.id !== "disabled")).toBe(true);
  });

  it("puts newly assigned QA people on every assignee list source", () => {
    const before = qaTestersFromUsers([
      {
        id: "u-t",
        name: "Tina Marie Barham",
        email: "tinamariebarham@gmail.com",
        role: "admin",
        roles: ["admin", "qa"],
        status: "active",
        joinedAt: "2026-08-01",
        notes: "",
      },
    ]);
    expect(before.map((t) => t.id)).toEqual(["tina"]);

    const afterQaAssigned = qaTestersFromUsers([
      {
        id: "u-t",
        name: "Tina Marie Barham",
        email: "tinamariebarham@gmail.com",
        role: "admin",
        roles: ["admin", "qa"],
        status: "active",
        joinedAt: "2026-08-01",
        notes: "",
      },
      {
        id: "u-isaiah",
        name: "Isaiah Jackson",
        email: "igjackson777@gmail.com",
        role: "qa",
        roles: ["qa", "adult"],
        status: "active",
        joinedAt: "2026-08-01",
        notes: "",
      },
      {
        id: "u-brenda",
        name: "Brenda Marene Russell",
        email: "bremar00@comcast.net",
        role: "qa",
        roles: ["qa", "adult", "beta"],
        status: "pending",
        joinedAt: "2026-08-01",
        notes: "",
      },
    ]);
    expect(afterQaAssigned.map((t) => t.id)).toEqual(
      expect.arrayContaining(["tina", "isaiah", "brenda"]),
    );
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
    expect(GYSH_ROLE_LABELS.senior).toContain("50");
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

  it("gates Admin Studio to the admin role only", () => {
    expect(canAccessAdminPortal(null)).toBe(false);
    expect(canAccessAdminPortal({ role: "adult" })).toBe(false);
    expect(canAccessAdminPortal({ role: "admin" })).toBe(true);
    expect(canAccessAdminPortal({ role: "qa" })).toBe(false);
    expect(canAccessAdminPortal({ role: "dev" })).toBe(false);
    expect(canAccessAdminPortal({ role: "adult", roles: ["qa"] })).toBe(false);
    expect(canAccessAdminPortal({ role: "adult", roles: ["qa", "admin"] })).toBe(true);
    expect(canAccessAdminPortal({ role: "adult", roles: ["adult", "beta"] })).toBe(false);
  });

  it("gates Testing Portal to Admin or QA", () => {
    expect(canAccessTestingPortal(null)).toBe(false);
    expect(canAccessTestingPortal({ role: "adult" })).toBe(false);
    expect(canAccessTestingPortal({ role: "admin" })).toBe(true);
    expect(canAccessTestingPortal({ role: "qa" })).toBe(true);
    expect(canAccessTestingPortal({ role: "dev" })).toBe(false);
    expect(canAccessTestingPortal({ role: "adult", roles: ["qa"] })).toBe(true);
    expect(isQaOnlyPortalUser({ role: "qa" })).toBe(true);
    expect(isQaOnlyPortalUser({ role: "admin", roles: ["admin", "qa"] })).toBe(false);
  });

  it("maps Candace Jackson to the candace QA tester id", () => {
    expect(
      qaTesterIdForUser({ name: "Candace Jackson", email: "candacejackson1@icloud.com" }),
    ).toBe("candace");
    expect(qaTesterIdForUser({ name: "Candace", email: "other@example.com" })).toBe("candace");
  });
});
