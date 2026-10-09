/**
 * Follow-up for Free members who have not used their 1 complimentary Launch Guide pick.
 * Unique Unique Free stays included; the extra pick can be Starter, Pro, or Elite.
 */
import { MEMBERSHIP_ACTIVATION_ORIGIN } from "./email-verify-url";
import { isDeletedGyshUser } from "./gysh-user-delete";
import {
  explicitComplimentaryGuideId,
  storedComplimentaryPayload,
} from "./wizard-comp-pick";

export const COMPLIMENTARY_GUIDE_FOLLOWUP_SLUG = "complimentary_guide_followup";

export function complimentaryGuideFollowupUrls(origin = MEMBERSHIP_ACTIVATION_ORIGIN): {
  match: string;
  guides: string;
} {
  const base = String(origin || MEMBERSHIP_ACTIVATION_ORIGIN).replace(/\/$/, "");
  return {
    match: `${base}/match`,
    guides: `${base}/guides`,
  };
}

export function isFreeMembershipTier(tier: string | null | undefined): boolean {
  const value = String(tier || "")
    .trim()
    .toLowerCase();
  return !value || value === "free";
}

export function isComplimentaryGuideFollowupRecipient(input: {
  email?: string | null;
  status?: string | null;
  membershipTier?: string | null;
  complimentaryPayload?: unknown;
}): boolean {
  if (isDeletedGyshUser({ email: input.email, status: input.status })) return false;
  const email = String(input.email || "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) return false;
  const status = String(input.status || "")
    .trim()
    .toLowerCase();
  if (status !== "active") return false;
  if (!isFreeMembershipTier(input.membershipTier)) return false;
  return !explicitComplimentaryGuideId(storedComplimentaryPayload(input.complimentaryPayload));
}

export function complimentaryGuideFollowupAlreadySent(
  sentEmails: ReadonlySet<string>,
  email: string | null | undefined,
): boolean {
  const key = String(email || "")
    .trim()
    .toLowerCase();
  return Boolean(key) && sentEmails.has(key);
}
