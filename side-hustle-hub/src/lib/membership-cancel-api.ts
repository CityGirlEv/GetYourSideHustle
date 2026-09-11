import { api } from "./api";
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
