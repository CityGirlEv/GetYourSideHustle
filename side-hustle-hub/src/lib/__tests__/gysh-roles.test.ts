import { describe, expect, it } from "vitest";
import {
  AUTOMATED_SUITE_OWNERS,
  FAILED_TEST_ASSIGNEE,
  GYSH_ROLE_LABELS,
  GYSH_ROLES,
  QA_TESTERS,
  formatRoles,
  isAutomatedSuiteOwner,
  isHumanQaTester,
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

  it("defines QA tester bubbles for Tina, Evelyn, and Lyriq", () => {
    expect(QA_TESTERS.map((t) => t.id)).toEqual(["tina", "evelyn", "lyriq"]);
    expect(QA_TESTERS.map((t) => t.shortName)).toEqual(["Tina", "Evelyn", "Lyriq"]);
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
});
