/**
 * Remember membership plan when a visitor leaves signup to Sign in,
 * then resume Stripe checkout after a successful login.
 */
import type { AudienceGroup, MerchItemId, TierId } from "./membership";
import { isAudienceGroup } from "./join-audience";

const STORAGE_KEY = "gysh_pending_membership_checkout";
const MERCH_STORAGE_KEY = "gysh_pending_merch_choices";

export type PendingMembershipCheckout = {
  tierId: TierId;
  audience: AudienceGroup;
  /** Prefer opening the Stripe checkout step after login. */
  resumeCheckout: boolean;
  merchChoices?: MerchItemId[];
};

const TIERS: TierId[] = ["free", "starter", "pro", "elite"];

function isTierId(value: unknown): value is TierId {
  return typeof value === "string" && (TIERS as string[]).includes(value);
}

function isStoredMerchItem(value: unknown): value is MerchItemId {
  return value === "tshirt" || value === "hat";
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
    const merchChoices = Array.isArray(parsed.merchChoices)
      ? parsed.merchChoices.filter(isStoredMerchItem)
      : [];
    return {
      tierId: parsed.tierId,
      audience: parsed.audience,
      resumeCheckout: parsed.resumeCheckout !== false,
      ...(merchChoices.length ? { merchChoices } : {}),
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

export function savePendingMerchChoices(choices: MerchItemId[]): void {
  try {
    sessionStorage.setItem(MERCH_STORAGE_KEY, JSON.stringify(choices));
  } catch {
    /* ignore */
  }
}

export function readPendingMerchChoices(): MerchItemId[] | null {
  try {
    const raw = sessionStorage.getItem(MERCH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const items = Array.isArray(parsed) ? parsed.filter(isStoredMerchItem) : [];
    return items.length ? items : null;
  } catch {
    return null;
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
