import { describe, expect, it } from "vitest";
import { updateUserMembership } from "../data";
import type { DbUser, Env } from "../auth";

const actor = {
  id: "u-ev",
  email: "evelyn@getyoursidehustle.com",
  name: "Evelyn",
} as DbUser;

function req(body: unknown, raw = false): Request {
  return new Request("http://localhost/api/users/u-member-1/membership", {
    method: "PUT",
    headers: raw ? undefined : { "content-type": "application/json" },
    body: raw ? "not-json" : JSON.stringify(body),
  });
}

describe("updateUserMembership", () => {
  it("rejects invalid JSON", async () => {
    const res = await updateUserMembership({} as Env, req({}, true), "u-member-1", actor);
    expect(res.status).toBe(400);
  });

  it("rejects an invalid membership level", async () => {
    const res = await updateUserMembership({} as Env, req({ membershipTier: "gold" }), "u-member-1", actor);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Choose Free, Starter, Pro, or Elite." });
  });

  it("rejects a missing user id", async () => {
    const res = await updateUserMembership({} as Env, req({ membershipTier: "starter" }), "  ", actor);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "User id is required." });
  });
});
