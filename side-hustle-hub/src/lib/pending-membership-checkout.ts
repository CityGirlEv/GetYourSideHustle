/**
 * Remember membership plan when a visitor leaves signup to Sign in,
 * then resume Stripe checkout after a successful login.
 */
import type { AudienceGroup, TierId } from "./membership";
import { isAudienceGroup } from "./join-audience";

const STORAGE_KEY = "gysh_pending_membership_checkout";

export type PendingMembershipCheckout = {
  tierId: TierId;
  audience: AudienceGroup;
  /** Prefer opening the Stripe checkout step after login. */
  resumeCheckout: boolean;
};

const TIERS: TierId[] = ["free", "starter", "pro", "elite"];

function isTierId(value: unknown): value is TierId {
  return typeof value === "string" && (TIERS as string[]).includes(value);
}

export function savePendingMembershipCheckout(pending: PendingMembershipCheckout): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    /* ignore */
  }
}

export function readPendingMembershipCheckout(): PendingMembershipCheckout | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingMembershipCheckout>;
    if (!isTierId(parsed.tierId) || !isAudienceGroup(parsed.audience)) return null;
    return {
      tierId: parsed.tierId,
      audience: parsed.audience,
      resumeCheckout: parsed.resumeCheckout !== false,
    };
  } catch {
    return null;
  }
}

export function clearPendingMembershipCheckout(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Paid Adult/Senior plans should resume on the checkout step after login. */
export function pendingShouldResumeCheckout(
  tierId: TierId,
  audience: AudienceGroup,
): boolean {
  return (
    tierId !== "free" &&
    (audience === "adult" || audience === "senior")
  );
}
