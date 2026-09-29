import { describe, expect, it } from "vitest";
import { handleSaveMemberMerch, handleSendMerchClaimEmail } from "../member-merch";
import type { DbUser, Env } from "../auth";

const starter = {
  id: "u-member-1",
  email: "member@example.com",
  name: "Lorraine",
  membership_tier: "starter",
  notes: "FOUNDING-STARTER 2/5",
} as DbUser;

const free = { ...starter, membership_tier: "free" } as DbUser;

function req(body: unknown, raw = false): Request {
  return new Request("http://localhost/api/auth/merch", {
    method: "POST",
    headers: raw ? undefined : { "content-type": "application/json" },
    body: raw ? "not-json" : JSON.stringify(body),
  });
}

describe("member merch claim", () => {
  it("rejects Free accounts", async () => {
    const res = await handleSaveMemberMerch({ DB: {} } as Env, req({ merchChoices: ["hat"] }), free);
    expect(res.status).toBe(403);
  });

  it("rejects invalid JSON", async () => {
    const res = await handleSaveMemberMerch({ DB: {} } as Env, req({}, true), starter);
    expect(res.status).toBe(400);
  });

  it("requires a T-shirt or hat and a size for T-shirts", async () => {
    const noChoice = await handleSaveMemberMerch(
      { DB: {} } as Env,
      req({ merchChoices: [] }),
      starter,
    );
    expect(noChoice.status).toBe(400);
    expect(await noChoice.json()).toMatchObject({ error: expect.stringMatching(/T-shirt or hat/i) });

    const noSize = await handleSaveMemberMerch(
      { DB: {} } as Env,
      req({ merchChoices: ["tshirt"], merchTshirtSizes: [""] }),
      starter,
    );
    expect(noSize.status).toBe(400);
    expect(await noSize.json()).toMatchObject({ error: expect.stringMatching(/size/i) });
  });

  it("admin merch email requires a user id", async () => {
    const res = await handleSendMerchClaimEmail({ DB: {} } as Env, req({}), starter);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "User id is required." });
  });
});
