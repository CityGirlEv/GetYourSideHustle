import { describe, expect, it } from "vitest";
import { handleUpdateMemberProfile } from "../member-profile";
import type { DbUser, Env } from "../auth";

const actor = {
  id: "u-member-1",
  email: "member@example.com",
  name: "Lorraine",
  phone: "",
  role: "adult",
  status: "active",
  joined_at: "2026-01-01",
  notes: "",
  password_hash: "h",
  password_salt: "s",
  membership_tier: "free",
  audience: "adult",
} as DbUser;

function req(body: unknown, raw = false): Request {
  return new Request("http://localhost/api/auth/profile", {
    method: "POST",
    headers: raw ? undefined : { "content-type": "application/json" },
    body: raw ? "not-json" : JSON.stringify(body),
  });
}

describe("handleUpdateMemberProfile", () => {
  it("rejects invalid JSON", async () => {
    const res = await handleUpdateMemberProfile({ DB: {} } as Env, req({}, true), actor);
    expect(res.status).toBe(400);
  });

  it("rejects a missing name", async () => {
    const res = await handleUpdateMemberProfile(
      { DB: {} } as Env,
      req({ name: "  ", email: "member@example.com", phone: "" }),
      actor,
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Name is required." });
  });

  it("rejects an invalid email", async () => {
    const res = await handleUpdateMemberProfile(
      { DB: {} } as Env,
      req({ name: "Lorraine", email: "nope", phone: "" }),
      actor,
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "A valid email is required." });
  });

  it("rejects a too-short phone number", async () => {
    const res = await handleUpdateMemberProfile(
      { DB: {} } as Env,
      req({ name: "Lorraine", email: "member@example.com", phone: "123" }),
      actor,
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      error: "Enter a valid phone number, or leave it blank.",
    });
  });
});
