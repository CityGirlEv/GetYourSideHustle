import { describe, it, expect } from "vitest";
import {
  getQaFirstName,
  shouldRestrictToSelf,
  filterToOwnAssignments,
} from "../role-scoping";

describe("role-scoping", () => {
  describe("getQaFirstName", () => {
    it("returns first name from full_name for QA users", () => {
      expect(getQaFirstName({ role: "qa", full_name: "Alice Smith" })).toBe("Alice");
    });
    it("falls back to email when full_name is missing", () => {
      expect(getQaFirstName({ role: "qa", email: "bob@example.com" })).toBe("bob@example.com");
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
  });

  describe("filterToOwnAssignments", () => {
    const cases = [
      { id: "1", owner: "Alice" },
      { id: "2", owner: "Bob" },
      { id: "3", owner: "Alice" },
      { id: "4", owner: "Carol" },
    ];
    const getOwner = (c: { owner: string }) => c.owner;

    it("returns all items for admin users", () => {
      const out = filterToOwnAssignments(cases, { role: "admin" }, getOwner);
      expect(out).toHaveLength(4);
    });

    it("returns all items for agent users", () => {
      const out = filterToOwnAssignments(cases, { role: "agent" }, getOwner);
      expect(out).toHaveLength(4);
    });

    it("returns only own items for QA users", () => {
      const out = filterToOwnAssignments(
        cases,
        { role: "qa", full_name: "Alice Smith" },
        getOwner,
      );
      expect(out.map((c) => c.id)).toEqual(["1", "3"]);
    });

    it("returns empty array for QA user with no resolvable name", () => {
      const out = filterToOwnAssignments(
        cases,
        { role: "qa", full_name: "", email: "" },
        getOwner,
      );
      expect(out).toEqual([]);
    });

    it("returns empty array when QA user has no matches", () => {
      const out = filterToOwnAssignments(
        cases,
        { role: "qa", full_name: "Dave" },
        getOwner,
      );
      expect(out).toEqual([]);
    });

    it("returns a new array (does not mutate input)", () => {
      const out = filterToOwnAssignments(cases, { role: "admin" }, getOwner);
      expect(out).not.toBe(cases);
    });
  });
});