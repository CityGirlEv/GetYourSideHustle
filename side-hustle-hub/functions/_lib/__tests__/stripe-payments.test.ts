import { describe, expect, it } from "vitest";
import { gyshPaymentExistsForSession } from "../stripe-payments";
import type { Env } from "../auth";

describe("gysh payments ledger helpers", () => {
  it("treats a blank Stripe session id as not recorded", async () => {
    const env = {} as Env;
    expect(await gyshPaymentExistsForSession(env, "")).toBe(false);
    expect(await gyshPaymentExistsForSession(env, "   ")).toBe(false);
  });
});
