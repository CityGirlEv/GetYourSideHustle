/** Client helpers for GYSH Stripe Checkout. */
import { api } from "./api";
import type { AuthUser } from "./auth";
import {
  membershipStripePrice,
  type MembershipBillingInterval,
} from "./stripe-catalog";
import type { AudienceGroup, TierId } from "./membership";

export function supportsMembershipStripeCheckout(
  tierId: TierId,
  audience: AudienceGroup,
): boolean {
  return membershipStripePrice(tierId, audience, "month") != null;
}

export async function startMembershipCheckout(input: {
  email: string;
  name?: string;
  tierId: TierId;
  audience: AudienceGroup;
  interval: MembershipBillingInterval;
}): Promise<{ url: string; sessionId: string; label: string; amountUsd: number }> {
  return api("stripe/checkout", {
    method: "POST",
    auth: false,
    body: {
      kind: "membership",
      email: input.email,
      name: input.name,
      tierId: input.tierId,
      audience: input.audience,
      interval: input.interval,
      returnOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
    },
    timeoutMs: 60_000,
  });
}

export async function startAlaCarteCheckout(input: {
  email: string;
  itemId: string;
}): Promise<{ url: string; sessionId: string; label?: string; amountUsd?: number }> {
  return api("stripe/checkout", {
    method: "POST",
    auth: false,
    body: {
      kind: "alacarte",
      email: input.email,
      itemId: input.itemId,
      returnOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
    },
    timeoutMs: 60_000,
  });
}

/** Multi-line a-la-carte cart → Stripe Checkout (one-time payment). */
export async function startAlaCarteCartCheckout(input: {
  email: string;
  items: Array<{ itemId: string; quantity: number }>;
}): Promise<{ url: string; sessionId: string; label?: string; amountUsd?: number }> {
  return api("stripe/checkout", {
    method: "POST",
    auth: false,
    body: {
      kind: "alacarte",
      email: input.email,
      items: input.items.map((i) => ({
        itemId: i.itemId,
        quantity: i.quantity,
      })),
      returnOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
    },
    timeoutMs: 60_000,
  });
}

export async function startCreditPackCheckout(input: {
  email: string;
  packId: string;
}): Promise<{ url: string; sessionId: string }> {
  return api("stripe/checkout", {
    method: "POST",
    auth: false,
    body: {
      kind: "credit_pack",
      email: input.email,
      packId: input.packId,
      returnOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
    },
    timeoutMs: 60_000,
  });
}

export async function confirmStripeCheckout(sessionId: string): Promise<{
  paid: boolean;
  email: string | null;
  tier: string | null;
  audience: string | null;
  user?: AuthUser | null;
}> {
  return api("stripe/confirm", {
    method: "POST",
    // Send session cookie when present so the server can update the logged-in profile.
    auth: true,
    body: { sessionId },
    timeoutMs: 60_000,
  });
}
