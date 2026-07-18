import { describe, expect, it } from "vitest";
import {
  GYSH_ROLE_LABELS,
  QA_TESTERS,
  formatRoles,
  userHasRole,
  userRoles,
  type GyshUser,
} from "../gysh-roles";

describe("gysh-roles", () => {
  it("includes QA role in labels", () => {
    expect(GYSH_ROLE_LABELS.qa).toBe("QA");
  });

  it("defines QA tester bubbles for Tina, Evelyn, and Lyriq", () => {
    expect(QA_TESTERS.map((t) => t.id)).toEqual(["tina", "evelyn", "lyriq"]);
    expect(QA_TESTERS.map((t) => t.shortName)).toEqual(["Tina", "Evelyn", "Lyriq"]);
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
