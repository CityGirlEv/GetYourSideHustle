import { api } from "./api";
import type { TierId } from "./membership";
import type { MembershipCancelAction } from "./membership-cancel";

export async function postMembershipCancel(action: MembershipCancelAction): Promise<{
  ok: boolean;
  action: MembershipCancelAction;
  message: string;
  loggedOut?: boolean;
  deletedKidCount?: number;
  user?: { membershipTier?: string };
}> {
  return api("membership/cancel", {
    method: "POST",
    body: { action },
  });
}

/** Schedule a lower plan for the next Stripe billing date. The current tier stays until then. */
export async function postMembershipDowngrade(tier: TierId): Promise<{
  ok: boolean;
  message: string;
  effectiveOn?: string | null;
  scheduledTier?: TierId;
  user?: { membershipTier?: string };
}> {
  return api("membership/cancel", {
    method: "POST",
    body: {
      action: tier === "free" ? "cancel_to_free" : "schedule_downgrade",
      tier,
    },
  });
}
