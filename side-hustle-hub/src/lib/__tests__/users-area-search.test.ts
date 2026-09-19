import { describe, expect, it } from "vitest";
import {
  userMatchesAdminSearch,
  usersAreaSearchEmptyCopy,
} from "../users-area-search";

const evelyn = {
  name: "Evelyn Irving",
  email: "evelyn3@cox.net",
  notes: "Admin partner",
  membershipTier: "starter",
  audience: "adult",
  status: "active",
  role: "admin",
  roles: ["admin", "adult"],
};

describe("userMatchesAdminSearch", () => {
  it("matches everyone when the query is empty", () => {
    expect(userMatchesAdminSearch(evelyn, "")).toBe(true);
    expect(userMatchesAdminSearch(evelyn, "   ")).toBe(true);
  });

  it("uses case-insensitive substring without wildcards", () => {
    expect(userMatchesAdminSearch(evelyn, "evelyn")).toBe(true);
    expect(userMatchesAdminSearch(evelyn, "COX")).toBe(true);
    expect(userMatchesAdminSearch(evelyn, "starter")).toBe(true);
    expect(userMatchesAdminSearch({ ...evelyn, heardAbout: "Facebook" }, "facebook")).toBe(true);
    expect(userMatchesAdminSearch(evelyn, "zzz")).toBe(false);
  });

  it("supports * and ? wildcards on name or email", () => {
    expect(userMatchesAdminSearch(evelyn, "evelyn*")).toBe(true);
    expect(userMatchesAdminSearch(evelyn, "*@cox.net")).toBe(true);
    expect(userMatchesAdminSearch(evelyn, "evelyn3@cox.?et")).toBe(true);
    expect(userMatchesAdminSearch(evelyn, "*gmail*")).toBe(false);
    expect(userMatchesAdminSearch(evelyn, "admin")).toBe(true);
  });
});

describe("usersAreaSearchEmptyCopy", () => {
  it("mentions wildcards when a search has no hits", () => {
    expect(usersAreaSearchEmptyCopy({ searchQuery: "zzz", roleFiltered: false, statusFiltered: false })).toMatch(
      /\* or \? wildcards/i,
    );
  });

  it("mentions filters when the list is empty for a role/status chip", () => {
    expect(
      usersAreaSearchEmptyCopy({ searchQuery: "", roleFiltered: true, statusFiltered: false }),
    ).toMatch(/current filters/i);
  });
});
