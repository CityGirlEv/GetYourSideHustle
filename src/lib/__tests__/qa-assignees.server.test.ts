import { describe, it, expect } from "vitest";

import {
  buildQaAssigneeEntries,
  buildQaRosterUsers,
  qaRosterEligible,
} from "@/lib/qa-assignees.server";

describe("qaRosterEligible", () => {
  it("includes email-confirmed QA users", () => {
    expect(qaRosterEligible("u1", new Set(["u1"]), new Set())).toBe(true);
  });

  it("includes admins even when email is not confirmed", () => {
    expect(qaRosterEligible("u1", new Set(), new Set(["u1"]))).toBe(true);
  });

  it("excludes unconfirmed non-admin QA users", () => {
    expect(qaRosterEligible("u1", new Set(), new Set())).toBe(false);
  });
});

describe("buildQaAssigneeEntries", () => {
  it("lists every QA user as selectable, including unconfirmed accounts", () => {
    const entries = buildQaAssigneeEntries([
      { id: "u1", fullName: "Alex Smith", banned: false },
      { id: "u2", fullName: "Jamie Lee", banned: false },
      { id: "u3", fullName: "Taylor Jones", banned: false },
    ]);

    expect(entries.map((e) => e.name)).toEqual(["Alex", "Jamie", "Taylor"]);
    expect(entries.every((e) => e.active)).toBe(true);
  });

  it("lists banned users as selectable", () => {
    const entries = buildQaAssigneeEntries([{ id: "u1", fullName: "Alex Smith", banned: true }]);

    expect(entries).toEqual([{ name: "Alex", active: true }]);
  });

  it("dedupes shared first names into one entry", () => {
    const entries = buildQaAssigneeEntries([
      { id: "u1", fullName: "Alex Smith", banned: true },
      { id: "u2", fullName: "Alex Jones", banned: false },
    ]);

    expect(entries).toEqual([{ name: "Alex", active: true }]);
  });

  it("skips users with no display name", () => {
    const entries = buildQaAssigneeEntries([{ id: "u1", fullName: "   ", banned: false }]);

    expect(entries).toEqual([]);
  });
});

describe("buildQaRosterUsers", () => {
  it("uses profile names when auth user is missing from listUsers", () => {
    const roster = buildQaRosterUsers(
      ["ruthie-id"],
      new Map([["ruthie-id", { full_name: "Ruthie Smith" }]]),
      new Map(),
    );

    expect(roster).toEqual([{ id: "ruthie-id", fullName: "Ruthie Smith", banned: false }]);
    expect(buildQaAssigneeEntries(roster).map((e) => e.name)).toEqual(["Ruthie"]);
  });

  it("includes banned QA users in the roster", () => {
    const roster = buildQaRosterUsers(
      ["u1"],
      new Map([["u1", { full_name: "Ruthie Smith" }]]),
      new Map([
        [
          "u1",
          {
            email: "ruthie@example.com",
            banned_until: new Date(Date.now() + 86400000).toISOString(),
          },
        ],
      ]),
    );

    expect(roster[0]?.banned).toBe(true);
    expect(buildQaAssigneeEntries(roster).map((e) => e.name)).toEqual(["Ruthie"]);
  });
});
