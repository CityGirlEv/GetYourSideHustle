import { LogIn, MessageSquare, Smile, UserPlus } from "lucide-react";
import { MembershipPage } from "./MembershipPage";
import { BlueprintUnlockPanel } from "./BlueprintUnlockPanel";
import type { BlueprintAgeGroup } from "../lib/gysh-analytics";
import type { AuthUser } from "../lib/auth";
import type { BetaNdaReceipt } from "../lib/beta-tester-dashboard";
import {
  AUDIENCE_LABELS,
  nextTierId,
  TIER_LADDER,
  type AudienceGroup,
  type TierId,
} from "../lib/membership";

type JoinPageProps = {
  onLogin: () => void;
  /** Open membership registration / sign-up (tier + audience lane in focus). */
  onSignup: (tier?: TierId, audience?: AudienceGroup) => void;
  onCommunity: () => void;
  onKidsCorner?: () => void;
  onOpenFreeGuides?: () => void;
  /** After free Blueprint signup, restore the wizard results. */
  onBlueprintUnlocked?: (ageGroup: BlueprintAgeGroup, user?: AuthUser | null) => void;
  onOpenBetaNda?: () => void;
  onBetaTesterRegistered?: () => void;
  onBetaTestingUnlocked?: (receipt: BetaNdaReceipt) => void;
  /** Audience lane selected from the page that opened Join. */
  membershipAudience?: AudienceGroup | null;
  /** Scroll to Free–Elite plans (in-page See Memberships CTAs only — not header/footer Join). */
  scrollToPlans?: boolean;
  onScrolledToPlans?: () => void;
  /** Highlight / focus Upgrade–Choose for this plan after scroll. */
  focusTier?: TierId | null;
  /** Scroll to a-la-carte cart checkout (header Cart button). */
  scrollToCart?: boolean;
  onScrolledToCart?: () => void;
  /** Logged-in member upgrading — plan cards use Upgrade CTAs. */
  isLoggedIn?: boolean;
  currentTier?: TierId | null;
  /** Prefill a-la-carte Stripe checkout email. */
  checkoutEmail?: string | null;
  /** Open My Dashboard → Schedule Suite. */
  onOpenScheduleSuite?: () => void;
  onOpenBilling?: () => void;
  onOpenCredits?: () => void;
  onOpenDashboard?: () => void;
  onOpenBlueprints?: () => void;
};

export function JoinPage({
  onLogin,
  onSignup,
  onCommunity,
  onKidsCorner,
  onOpenFreeGuides,
  onBlueprintUnlocked,
  onOpenBetaNda,
  onBetaTesterRegistered,
  onBetaTestingUnlocked,
  membershipAudience = null,
  scrollToPlans = false,
  onScrolledToPlans,
  focusTier = null,
  scrollToCart = false,
  onScrolledToCart,
  isLoggedIn = false,
  currentTier = null,
  checkoutEmail = null,
  onOpenScheduleSuite,
  onOpenBilling,
  onOpenCredits,
  onOpenDashboard,
  onOpenBlueprints,
}: JoinPageProps) {
  return (
    <div className="join-page-combined" data-testid="join-page">
      {onBlueprintUnlocked && !isLoggedIn && (
        <BlueprintUnlockPanel
          onUnlocked={onBlueprintUnlocked}
          onSignIn={onLogin}
          onOpenBetaNda={onOpenBetaNda}
          onBetaTesterRegistered={onBetaTesterRegistered}
          onBetaTestingUnlocked={onBetaTestingUnlocked}
        />
      )}

      <section className="join-membership-section" aria-labelledby="join-membership-heading">
        <h2 id="join-membership-heading" className="join-membership-heading">
          GYSH Membership plans
        </h2>
        <p className="join-membership-lead">
          {isLoggedIn
            ? "You're signed in — pick a higher plan to upgrade your membership, or switch plans anytime."
            : membershipAudience
              ? `Showing ${AUDIENCE_LABELS[membershipAudience]} membership options first — change the lane under the picture anytime.`
              : "Four plans — Free, Starter, Pro, and Elite. Pick the plan that fits your Side Hustle, with audience options for Kids, Teens, Adults, and Seniors."}
        </p>
        <MembershipPage
          onGoToJoin={(tier, audience) => onSignup(tier, audience ?? membershipAudience ?? undefined)}
          onGoToLogin={onLogin}
          onOpenFreeGuides={onOpenFreeGuides}
          initialAudience={membershipAudience}
          autoScrollToPlans={scrollToPlans || Boolean(focusTier)}
          focusTier={focusTier}
          onAutoScrolledToPlans={onScrolledToPlans}
          autoScrollToCart={scrollToCart}
          onAutoScrolledToCart={onScrolledToCart}
          isLoggedIn={isLoggedIn}
          currentTier={currentTier}
          checkoutEmail={checkoutEmail}
          onOpenScheduleSuite={onOpenScheduleSuite}
          onOpenBilling={onOpenBilling}
          onOpenCredits={onOpenCredits}
          onOpenDashboard={onOpenDashboard}
          onOpenBlueprints={onOpenBlueprints}
        />
      </section>

      <div className="join-cta-row join-cta-row--footer">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            const cur = currentTier && TIER_LADDER.includes(currentTier) ? currentTier : "free";
            const upgradeTarget = isLoggedIn ? nextTierId(cur) ?? "elite" : "free";
            onSignup(upgradeTarget, membershipAudience ?? undefined);
          }}
          data-testid="join-create-or-upgrade"
        >
          <UserPlus size={16} />{" "}
          {isLoggedIn ? "Upgrade membership" : "Create account / Join"}
        </button>
        {!isLoggedIn && (
          <button type="button" className="btn btn-outline" onClick={onLogin}>
            <LogIn size={16} /> Log in
          </button>
        )}
        <button type="button" className="btn btn-outline" onClick={onCommunity}>
          <MessageSquare size={16} /> Browse GYSH Community
        </button>
        {onKidsCorner && (
          <button type="button" className="btn btn-outline" onClick={onKidsCorner}>
            <Smile size={16} /> Kids / Teens Corner
          </button>
        )}
      </div>
    </div>
  );
}
