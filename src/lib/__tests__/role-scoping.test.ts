import { describe, it, expect } from "vitest";
import {
  getQaFirstName,
  shouldRestrictToSelf,
  getQaVisibleOwners,
  canQaSeeOwner,
  filterToOwnAssignments,
} from "../role-scoping";

describe("role-scoping", () => {
  describe("getQaFirstName", () => {
    it("returns first name from full_name for QA users", () => {
      expect(getQaFirstName({ role: "qa", full_name: "Alice Smith" })).toBe("Alice");
    });
    it("falls back to email when full_name is missing", () => {
      expect(getQaFirstName({ role: "qa", email: "bob@example.com" })).toBe("Bob");
    });
    it("returns empty string for non-QA roles", () => {
      expect(getQaFirstName({ role: "admin", full_name: "Alice Smith" })).toBe("");
      expect(getQaFirstName({ role: "agent", full_name: "Alice Smith" })).toBe("");
    });
    it("returns empty string for null/undefined user", () => {
      expect(getQaFirstName(null)).toBe("");
      expect(getQaFirstName(undefined)).toBe("");
    });
    it("handles extra whitespace", () => {
      expect(getQaFirstName({ role: "qa", full_name: "  Carol   Jones  " })).toBe("Carol");
    });
  });

  describe("shouldRestrictToSelf", () => {
    it("is true only for QA users", () => {
      expect(shouldRestrictToSelf({ role: "qa", full_name: "A" })).toBe(true);
      expect(shouldRestrictToSelf({ role: "admin" })).toBe(false);
      expect(shouldRestrictToSelf({ role: "agent" })).toBe(false);
      expect(shouldRestrictToSelf(null)).toBe(false);
      expect(shouldRestrictToSelf(undefined)).toBe(false);
    });

    it("is false when the user also has the admin role", () => {
      expect(shouldRestrictToSelf({ role: "qa", roles: ["qa", "admin"], full_name: "A" })).toBe(
        false,
      );
    });
  });

  describe("QA visible owners", () => {
    it("limits QA users to themselves plus Unassigned", () => {
      const user = { role: "qa", full_name: "Evelyn Tester" };
      expect(getQaVisibleOwners(user)).toEqual(["Evelyn", "Unassigned"]);
      expect(canQaSeeOwner(user, "Evelyn")).toBe(true);
      expect(canQaSeeOwner(user, "Unassigned")).toBe(true);
      expect(canQaSeeOwner(user, "Catria")).toBe(false);
    });
  });

  describe("filterToOwnAssignments", () => {
    const cases = [
      { id: "1", owner: "Alice" },
      { id: "2", owner: "Bob" },
      { id: "3", owner: "Alice" },
      { id: "4", owner: "Carol" },
      { id: "5", owner: "Unassigned" },
    ];
    const getOwner = (c: { owner: string }) => c.owner;

    it("returns all items for admin users", () => {
      const out = filterToOwnAssignments(cases, { role: "admin" }, getOwner);
      expect(out).toHaveLength(5);
    });

    it("returns all items for agent users", () => {
      const out = filterToOwnAssignments(cases, { role: "agent" }, getOwner);
      expect(out).toHaveLength(5);
    });

    it("returns own and Unassigned items for QA users", () => {
      const out = filterToOwnAssignments(cases, { role: "qa", full_name: "Alice Smith" }, getOwner);
      expect(out.map((c) => c.id)).toEqual(["1", "3", "5"]);
    });

    it("still returns Unassigned for QA user with no resolvable name", () => {
      const out = filterToOwnAssignments(cases, { role: "qa", full_name: "", email: "" }, getOwner);
      expect(out.map((c) => c.id)).toEqual(["5"]);
    });

    it("still returns Unassigned when QA user has no owner matches", () => {
      const out = filterToOwnAssignments(cases, { role: "qa", full_name: "Dave" }, getOwner);
      expect(out.map((c) => c.id)).toEqual(["5"]);
    });

    it("returns a new array (does not mutate input)", () => {
      const out = filterToOwnAssignments(cases, { role: "admin" }, getOwner);
      expect(out).not.toBe(cases);
    });
  });
});
