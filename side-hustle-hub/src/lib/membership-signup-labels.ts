import { isAudienceGroup, normalizeAudienceGroup } from "./join-audience";
import { MEMBERSHIP_TIERS, TIER_LADDER, type AudienceGroup, type TierId } from "./membership";

/** Plan shown in the signup / upgrade dropdown. */
export function membershipSignupDropdownTier(opts: {
  initialTier: TierId | null | undefined;
  currentTier: TierId | null | undefined;
  isLoggedIn?: boolean;
}): TierId {
  const initial = opts.initialTier ?? "free";
  const current = opts.currentTier;
  if (
    opts.isLoggedIn &&
    current &&
    TIER_LADDER.includes(current) &&
    initial === "free" &&
    current !== "free"
  ) {
    return current;
  }
  return initial;
}

/**
 * Age lane on the upgrade form. A signed-in member stays on their profile
 * audience (Senior, Adult, Kids, Teens) even if Join was last opened on Adults.
 */
export function membershipSignupDropdownAudience(opts: {
  initialAudience: AudienceGroup | null | undefined;
  memberAudience: string | null | undefined;
  isLoggedIn?: boolean;
}): AudienceGroup {
  const initial = normalizeAudienceGroup(opts.initialAudience, "adult");
  if (!opts.isLoggedIn) return initial;
  const raw = String(opts.memberAudience || "").toLowerCase();
  if (raw === "parent") return "kids";
  if (isAudienceGroup(raw)) return raw;
  return initial;
}

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

/** Logged-in Free members who just joined (or reopened signup on Free). */
export function isFreeMemberSignupNextStepsVisible(opts: {
  isLoggedIn?: boolean;
  currentTier?: TierId | null;
  initialTier?: TierId | null;
}): boolean {
  if (!opts.isLoggedIn) return false;
  const current = opts.currentTier ?? "free";
  if (current !== "free") return false;
  const initial = opts.initialTier ?? "free";
  return initial === "free";
}

/** Copy + labels for the post-Free-signup next-steps panel. */
export function freeMemberSignupNextStepsCopy(): {
  heading: string;
  body: string;
  upgradeHint: string;
  dashboardLabel: string;
  guidesLabel: string;
  wizardLabel: string;
} {
  return {
    heading: "You're in — next steps",
    body: "Your Free membership is ready. Open My Dashboard to get started, browse Unique Free guides, or take the Match Wizard.",
    upgradeHint: "Want more later? Upgrade anytime below.",
    dashboardLabel: "Open Dashboard",
    guidesLabel: "Browse free guides",
    wizardLabel: "Take Match Wizard",
  };
}

/** Rename Free Guides button copy for subscribers; leave guest wording alone. */
export function memberGuidesButtonLabel(text: string, isSubscriber: boolean): string {
  if (!isSubscriber) return text;
  return text
    .replace(/Browse free guides/gi, "Browse Member Guides")
    .replace(/Free Guides/g, "Member Guides")
    .replace(/free guides/gi, "Member Guides");
}
