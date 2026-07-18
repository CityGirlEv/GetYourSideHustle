import { describe, it, expect } from "vitest";

import { buildAgentAssigneeOptions } from "@/lib/agent-assignees.server";

describe("buildAgentAssigneeOptions", () => {
  it("lists every agent-role user with profile name and email", () => {
    const options = buildAgentAssigneeOptions(
      ["u1", "u2"],
      new Map([
        ["u1", { full_name: "Alex Morgan" }],
        ["u2", { full_name: "Jamie Lee" }],
      ]),
      new Map([
        ["u1", { email: "alex@example.com" }],
        ["u2", { email: "jamie@example.com" }],
      ]),
    );

    expect(options).toEqual([
      { id: "u1", full_name: "Alex Morgan", email: "alex@example.com" },
      { id: "u2", full_name: "Jamie Lee", email: "jamie@example.com" },
    ]);
  });

  it("uses profile names when auth user is missing from listUsers", () => {
    const options = buildAgentAssigneeOptions(
      ["agent-id"],
      new Map([["agent-id", { full_name: "Taylor Jones" }]]),
      new Map(),
    );

    expect(options).toEqual([{ id: "agent-id", full_name: "Taylor Jones", email: "" }]);
  });

  it("falls back to auth metadata and email when profile name is empty", () => {
    const options = buildAgentAssigneeOptions(
      ["u1", "u2"],
      new Map([["u1", { full_name: "" }]]),
      new Map([
        ["u1", { email: "meta@example.com", user_metadata: { full_name: "Meta Name" } }],
        ["u2", { email: "only@example.com" }],
      ]),
    );

    expect(options).toEqual([
      { id: "u1", full_name: "Meta Name", email: "meta@example.com" },
      { id: "u2", full_name: "only@example.com", email: "only@example.com" },
    ]);
  });

  it("sorts by full name", () => {
    const options = buildAgentAssigneeOptions(
      ["u2", "u1"],
      new Map([
        ["u1", { full_name: "Zara Adams" }],
        ["u2", { full_name: "Alex Brown" }],
      ]),
      new Map([
        ["u1", { email: "z@example.com" }],
        ["u2", { email: "a@example.com" }],
      ]),
    );

    expect(options.map((o) => o.full_name)).toEqual(["Alex Brown", "Zara Adams"]);
  });
});
