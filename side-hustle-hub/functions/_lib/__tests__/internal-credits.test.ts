import { describe, expect, it } from "vitest";
import { handleAdminGrantInternalCredits } from "../member-credits";
import type { DbUser, Env } from "../auth";

const actor = {
  id: "u-ev",
  email: "evelyn@getyoursidehustle.com",
  name: "Evelyn",
} as DbUser;

describe("handleAdminGrantInternalCredits", () => {
  it("rejects invalid JSON", async () => {
    const req = new Request("http://localhost/api/admin/internal-credits", {
      method: "POST",
      body: "not-json",
    });
    const res = await handleAdminGrantInternalCredits({} as Env, req, actor);
    expect(res.status).toBe(400);
  });

  it("rejects a missing email", async () => {
    const req = new Request("http://localhost/api/admin/internal-credits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ credits: 100 }),
    });
    const res = await handleAdminGrantInternalCredits({} as Env, req, actor);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Enter the member account email." });
  });

  it("rejects an invalid add/remove action", async () => {
    const req = new Request("http://localhost/api/admin/internal-credits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", credits: 5, action: "gift" }),
    });
    const res = await handleAdminGrantInternalCredits({} as Env, req, actor);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Choose add or remove." });
  });
});
