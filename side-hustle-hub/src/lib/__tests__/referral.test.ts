import { describe, expect, it } from "vitest";
import {
  buildReferralUrl,
  isReferralDashboardHash,
  REFERRAL_DASHBOARD_HREF,
} from "../referral";
import { inviteFriendSteps } from "../invite-friend";

describe("referral dashboard helpers", () => {
  it("points the Referral tab at My Dashboard with a referral hash", () => {
    expect(REFERRAL_DASHBOARD_HREF).toBe("/my-dashboard#referral");
    expect(isReferralDashboardHash("#referral")).toBe(true);
    expect(isReferralDashboardHash("referral")).toBe(true);
    expect(isReferralDashboardHash("#schedule")).toBe(false);
  });

  it("builds a ref query URL for a known code", () => {
    expect(buildReferralUrl("GYSHTEST")).toMatch(/[?&]ref=GYSHTEST(?:&|$)/);
  });

  it("tells logged-in members the invite link lives next to My Dashboard", () => {
    const steps = inviteFriendSteps(true);
    expect(steps[0]).toMatch(/My Dashboard/i);
    expect(steps[0]).toMatch(/header|next to/i);
  });
});
