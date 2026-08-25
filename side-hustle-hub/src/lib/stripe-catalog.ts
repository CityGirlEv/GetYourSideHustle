/**
 * GYSH Stripe catalog helpers — Price IDs from scripts/sync-stripe-catalog.mjs.
 */
import type { AudienceGroup, TierId } from "./membership";
import { STRIPE_CATALOG, type StripeCatalogPrice } from "./stripe-catalog.generated";

export { STRIPE_CATALOG };
export type { StripeCatalogPrice };

export type MembershipBillingInterval = "month" | "year";

/** Adult/Senior USD memberships only — Kids/Teens use credit packs. */
export function membershipStripePrice(
  tierId: TierId,
  audience: AudienceGroup,
  interval: MembershipBillingInterval,
): StripeCatalogPrice | null {
  if (tierId === "free") return null;
  if (audience !== "adult" && audience !== "senior") return null;
  return STRIPE_CATALOG.memberships[tierId]?.[audience]?.[interval] ?? null;
}

export function alaCarteStripePrice(itemId: string): StripeCatalogPrice | null {
  return STRIPE_CATALOG.alaCarte[itemId] ?? null;
}

export function creditPackStripePrice(packId: string): StripeCatalogPrice | null {
  return STRIPE_CATALOG.creditPacks[packId] ?? null;
}

export function stripeCatalogMode(): "test" | "live" {
  return STRIPE_CATALOG.mode;
}
