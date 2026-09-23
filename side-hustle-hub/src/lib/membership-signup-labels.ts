import { MEMBERSHIP_TIERS, TIER_LADDER, type TierId } from "./membership";

/** Primary CTA label on register / upgrade steps (includes selected plan name). */
export function membershipSignupSubmitLabel(
  tierName: string,
  opts: {
    tierId: TierId;
    isPaid: boolean;
    stripeReady: boolean;
    /** Logged-in member changing plan on their profile. */
    mode?: "register" | "upgrade";
  },
): string {
  if (opts.isPaid && opts.stripeReady) return `Continue to ${tierName} checkout`;
  if (opts.mode === "upgrade") {
    if (opts.tierId === "free") return "Switch to Free";
    return `Upgrade to ${tierName}`;
  }
  if (opts.tierId === "free") return "Create Free account";
  return `Create ${tierName} account`;
}

/** Plan-card CTA on Join / Membership (Choose vs Upgrade). */
export function membershipPlanChooseLabel(
  tierName: string,
  opts: {
    tierId: TierId;
    isLoggedIn?: boolean;
    currentTier?: TierId | null;
  },
): string {
  if (!opts.isLoggedIn) {
    return opts.tierId === "free" ? "Start Free" : `Choose ${tierName}`;
  }
  const current = opts.currentTier ?? "free";
  if (opts.tierId === current) return `Current plan · ${tierName}`;
  if (opts.tierId === "free") return "Switch to Free";
  const ladder: TierId[] = ["free", "starter", "pro", "elite"];
  const curIdx = ladder.indexOf(current);
  const nextIdx = ladder.indexOf(opts.tierId);
  if (curIdx >= 0 && nextIdx > curIdx) return `Upgrade to ${tierName}`;
  return `Switch to ${tierName}`;
}

export type MembershipPlanBubbleKind = "current" | "upgrade" | "switch";

export type MembershipPlanBubble = {
  tierId: TierId;
  name: string;
  label: string;
  kind: MembershipPlanBubbleKind;
};

/** Logged-in Join bubbles: current plan, Switch to lower, Upgrade to higher. */
export function membershipPlanBubbles(
  currentTier: TierId | null | undefined,
): MembershipPlanBubble[] {
  const current = currentTier && TIER_LADDER.includes(currentTier) ? currentTier : "free";
  return MEMBERSHIP_TIERS.map((tier) => {
    const label = membershipPlanChooseLabel(tier.name, {
      tierId: tier.id,
      isLoggedIn: true,
      currentTier: current,
    });
    const kind: MembershipPlanBubbleKind =
      tier.id === current ? "current" : label.startsWith("Upgrade") ? "upgrade" : "switch";
    return { tierId: tier.id, name: tier.name, label, kind };
  });
}

/** Upgrade-form buttons: every plan except the one already on the profile. */
export function membershipUpgradeActionBubbles(
  currentTier: TierId | null | undefined,
): MembershipPlanBubble[] {
  return membershipPlanBubbles(currentTier).filter((bubble) => bubble.kind !== "current");
}

/** Paid checkout copy — never list Stripe test card numbers on the public site. */
export function membershipStripeCheckoutHint(): string {
  return "You'll finish on Stripe's secure checkout page.";
}

export function membershipAlaCarteCheckoutNote(): string {
  return "Secure Stripe Checkout.";
}

/** Guest browse CTA vs subscriber Member Guides. */
export function browseGuidesButtonLabel(isSubscriber: boolean): string {
  return isSubscriber ? "Browse Member Guides" : "Browse free guides";
}

/** Rename Free Guides button copy for subscribers; leave guest wording alone. */
export function memberGuidesButtonLabel(text: string, isSubscriber: boolean): string {
  if (!isSubscriber) return text;
  return text
    .replace(/Browse free guides/gi, "Browse Member Guides")
    .replace(/Free Guides/g, "Member Guides")
    .replace(/free guides/gi, "Member Guides");
}
