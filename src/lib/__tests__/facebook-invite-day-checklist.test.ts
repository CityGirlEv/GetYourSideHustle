import { describe, expect, it } from "vitest";
import {
  FACEBOOK_INVITE_DAY_STEPS,
  facebookInviteStepStorageId,
} from "@/lib/content-factory/facebook-invite-day-checklist";

describe("facebook-invite-day-checklist", () => {
  it("defines whiz-through steps for invite day", () => {
    expect(FACEBOOK_INVITE_DAY_STEPS.length).toBeGreaterThanOrEqual(6);
    expect(FACEBOOK_INVITE_DAY_STEPS.some((s) => s.id === "run-pipeline")).toBe(true);
    expect(FACEBOOK_INVITE_DAY_STEPS.some((s) => s.command?.includes("run_facebook_invite_pipeline"))).toBe(
      true,
    );
  });

  it("uses stable date-scoped storage ids per sub-step", () => {
    expect(facebookInviteStepStorageId("2026-06-24", "send-invites")).toBe(
      "2026-06-24:facebook_invite:launch:send-invites",
    );
  });
});
