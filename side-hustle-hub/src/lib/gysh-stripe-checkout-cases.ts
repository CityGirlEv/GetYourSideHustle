/**
 * Manual QA — Stripe Checkout coverage for every paid membership price,
 * every a-la-carte SKU, and every credit pack. Sprint 4 · Unassigned.
 *
 * Keep in sync with:
 * - src/lib/membership.ts (tiers, ALA_CARTE_PRICE_LIST, CREDIT_PACKS)
 * - src/lib/stripe-catalog.generated.ts (test-mode price IDs)
 */

import type { TestCase } from "./gysh-test-plan";
import {
  ALA_CARTE_PRICE_LIST,
  CREDIT_PACKS,
} from "./membership";
import { dueDatePlusDays } from "./gysh-sprints";

/** Paid Adult/Senior memberships that open Stripe Checkout. */
export const STRIPE_MEMBERSHIP_CHECKOUT_MATRIX = [
  { tierId: "starter", audience: "adult", interval: "month" },
  { tierId: "starter", audience: "adult", interval: "year" },
  { tierId: "starter", audience: "senior", interval: "month" },
  { tierId: "starter", audience: "senior", interval: "year" },
  { tierId: "pro", audience: "adult", interval: "month" },
  { tierId: "pro", audience: "adult", interval: "year" },
  { tierId: "pro", audience: "senior", interval: "month" },
  { tierId: "pro", audience: "senior", interval: "year" },
  { tierId: "elite", audience: "adult", interval: "month" },
  { tierId: "elite", audience: "adult", interval: "year" },
  { tierId: "elite", audience: "senior", interval: "month" },
  { tierId: "elite", audience: "senior", interval: "year" },
] as const satisfies ReadonlyArray<{
  tierId: "starter" | "pro" | "elite";
  audience: "adult" | "senior";
  interval: "month" | "year";
}>;

export const STRIPE_CHECKOUT_SPRINT = 4;

const AUDIENCE_LABEL: Record<"adult" | "senior", string> = {
  adult: "Adults",
  senior: "Seniors",
};

const TIER_LABEL: Record<"starter" | "pro" | "elite", string> = {
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
};

const INTERVAL_LABEL = { month: "Monthly", year: "Yearly" } as const;

export function stripeMembershipCaseId(
  tierId: string,
  audience: string,
  interval: string,
): string {
  return `STRIPE-MEM-${tierId}-${audience}-${interval}`;
}

export function stripeAlaCarteCaseId(itemId: string): string {
  return `STRIPE-ALC-${itemId}`;
}

export function stripeCreditPackCaseId(packId: string): string {
  return `STRIPE-CRED-${packId}`;
}

export function isStripeCheckoutCaseId(caseId: string): boolean {
  const id = String(caseId || "").toUpperCase();
  return id.startsWith("STRIPE-MEM-") || id.startsWith("STRIPE-ALC-") || id.startsWith("STRIPE-CRED-");
}

export function stripeCheckoutDueDate(_caseId: string, ref: Date = new Date()): string {
  return dueDatePlusDays(0, ref);
}

/**
 * Place ungraded STRIPE-* rows on Sprint 4 (due today).
 * Never rewrite Fail/Pass/Cond, and never treat a human assignee as “wrong” —
 * admins reassign from Unassigned; wiping owners on every portal reload hid chip counts.
 */
export function needsStripeCheckoutPlacementHeal(input: {
  status: string | null | undefined;
  sprint: number | null | undefined;
  due: string | null | undefined;
  /** Kept for call-site compatibility; ignored (owners are preserved). */
  assignee?: string | null | undefined;
  wantSprint?: number;
  wantDue: string;
}): boolean {
  const st = String(input.status || "not_run").trim() || "not_run";
  if (st !== "not_run") return false;
  const wantSprint = input.wantSprint ?? STRIPE_CHECKOUT_SPRINT;
  const due = String(input.due ?? "").trim();
  return input.sprint !== wantSprint || due !== input.wantDue;
}

const STRIPE_TEST_CARD_STEPS = [
  "Confirm redirect to checkout.stripe.com (Stripe test Checkout)",
  "Pay with test card 4242 4242 4242 4242, any future expiry, any CVC, any ZIP",
  "Confirm return to GYSH with checkout=success (or Payment complete) messaging",
];

function membershipCases(): TestCase[] {
  return STRIPE_MEMBERSHIP_CHECKOUT_MATRIX.map((row) => {
    const tier = TIER_LABEL[row.tierId];
    const aud = AUDIENCE_LABEL[row.audience];
    const bill = INTERVAL_LABEL[row.interval];
    return {
      id: stripeMembershipCaseId(row.tierId, row.audience, row.interval),
      area: "Membership",
      title: `Stripe Checkout · ${aud} ${tier} (${bill})`,
      priority: "P0" as const,
      roles: ["qa", "admin"] as TestCase["roles"],
      assignees: [] as TestCase["assignees"],
      suite: "manual" as const,
      steps: [
        `Open Join → ${aud} → ${tier} → Create account / Continue to checkout`,
        "Complete registration with a unique email (or sign in), then open Membership Sign-up Secure checkout",
        `Choose ${bill} billing, then Pay with Stripe`,
        ...STRIPE_TEST_CARD_STEPS,
        `Confirm the account reflects ${tier} / ${aud} after payment (or pending admin activation messaging)`,
      ],
      expected: `${aud} ${tier} ${bill} opens Stripe Checkout; test card succeeds; return URL confirms payment`,
      path: "membership_signup",
    };
  });
}

function alaCarteCases(): TestCase[] {
  return ALA_CARTE_PRICE_LIST.map((item) => ({
    id: stripeAlaCarteCaseId(item.id),
    area: "Membership",
    title: `Stripe Checkout · A-la-carte · ${item.name}`,
    priority: "P0" as const,
    roles: ["qa", "admin"] as TestCase["roles"],
    assignees: [] as TestCase["assignees"],
    suite: "manual" as const,
    steps: [
      "Log in as a member first (guests do not see an active cart)",
      "Open Join and scroll to A la carte (data-testid membership-alacarte)",
      `Switch audience tabs until “${item.name}” is listed (sku ${item.id}, $${item.priceUsd})`,
      `Click Add for ${item.id} (membership-alacarte-add-${item.id})`,
      "Open the cart, enter a unique email, then Checkout with Stripe",
      ...STRIPE_TEST_CARD_STEPS,
      "Confirm cart clears or purchase is recorded for that email",
    ],
    expected: `A-la-carte “${item.name}” ($${item.priceUsd}) reaches Stripe Checkout; test payment succeeds`,
    path: "join",
  }));
}

function creditPackCases(): TestCase[] {
  return CREDIT_PACKS.map((pack) => ({
    id: stripeCreditPackCaseId(pack.id),
    area: "Membership",
    title: `Stripe Checkout · Credit pack · ${pack.name}`,
    priority: "P0" as const,
    roles: ["qa", "admin"] as TestCase["roles"],
    assignees: [] as TestCase["assignees"],
    suite: "manual" as const,
    steps: [
      "Log in as a member first (guests do not see an active cart)",
      "Open Join → Parent-funded Kid Credit packs (Kids, Teens, Adults, or Seniors)",
      `Confirm “${pack.name}” shows ${pack.credits} Kid Credits for $${pack.priceUsd} (membership-credit-pack-${pack.id})`,
      `Click Add to cart (membership-credit-pack-add-${pack.id}) and check out the shared Join cart with Stripe (pack prices from the Stripe credit-pack catalog)`,
      ...STRIPE_TEST_CARD_STEPS,
      "Confirm success return and that the pack purchase is acknowledged (credits / receipt messaging)",
    ],
    expected: `${pack.name} ($${pack.priceUsd} / ${pack.credits} credits) completes Stripe Checkout in test mode`,
    path: "join",
  }));
}

/** Free Adult — no USD membership Stripe Checkout (level coverage). */
export const STRIPE_FREE_NO_CHECKOUT_CASE: TestCase = {
  id: "STRIPE-MEM-free-adult-no-checkout",
  area: "Membership",
  title: "Stripe Checkout · Free Adult does not open USD membership Checkout",
  priority: "P1",
  roles: ["qa", "admin"],
  assignees: [],
  suite: "manual",
  steps: [
    "Open Membership Sign-up with Adults → Free",
    "Create account / continue",
    "Confirm there is no Pay with Stripe / Secure checkout card step for Free",
    "Confirm account-created / activation messaging (not checkout.stripe.com)",
  ],
  expected: "Free membership never starts USD Stripe membership Checkout",
  path: "membership_signup",
};

/** All Sprint 4 Unassigned Stripe checkout cases. */
export const STRIPE_CHECKOUT_CASES: TestCase[] = [
  ...membershipCases(),
  STRIPE_FREE_NO_CHECKOUT_CASE,
  ...alaCarteCases(),
  ...creditPackCases(),
];
