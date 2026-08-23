import { LogIn, MessageSquare, Smile, UserPlus } from "lucide-react";
import { MembershipPage } from "./MembershipPage";
import { BlueprintUnlockPanel } from "./BlueprintUnlockPanel";
import type { BlueprintAgeGroup } from "../lib/gysh-analytics";
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
  onBlueprintUnlocked?: (ageGroup: BlueprintAgeGroup) => void;
  /** Audience lane selected from the page that opened Join. */
  membershipAudience?: AudienceGroup | null;
  /** Scroll to Free–Elite plans (in-page See Memberships CTAs only — not header/footer Join). */
  scrollToPlans?: boolean;
  onScrolledToPlans?: () => void;
  /** Scroll to a-la-carte cart checkout (header Cart button). */
  scrollToCart?: boolean;
  onScrolledToCart?: () => void;
  /** Logged-in member upgrading — plan cards use Upgrade CTAs. */
  isLoggedIn?: boolean;
  currentTier?: TierId | null;
  /** Prefill a-la-carte Stripe checkout email. */
  checkoutEmail?: string | null;
};

export function JoinPage({
  onLogin,
  onSignup,
  onCommunity,
  onKidsCorner,
  onOpenFreeGuides,
  onBlueprintUnlocked,
  membershipAudience = null,
  scrollToPlans = false,
  onScrolledToPlans,
  scrollToCart = false,
  onScrolledToCart,
  isLoggedIn = false,
  currentTier = null,
  checkoutEmail = null,
}: JoinPageProps) {
  return (
    <div className="join-page-combined" data-testid="join-page">
      {onBlueprintUnlocked && (
        <BlueprintUnlockPanel onUnlocked={onBlueprintUnlocked} onSignIn={onLogin} />
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
              : "Pick the plan that fits your Side Hustle — Free through Elite — with audience options for Kids, Teens, Adults, and Seniors."}
        </p>
        <MembershipPage
          onGoToJoin={(tier, audience) => onSignup(tier, audience ?? membershipAudience ?? undefined)}
          onGoToLogin={onLogin}
          onOpenFreeGuides={onOpenFreeGuides}
          initialAudience={membershipAudience}
          autoScrollToPlans={scrollToPlans}
          onAutoScrolledToPlans={onScrolledToPlans}
          autoScrollToCart={scrollToCart}
          onAutoScrolledToCart={onScrolledToCart}
          isLoggedIn={isLoggedIn}
          currentTier={currentTier}
          checkoutEmail={checkoutEmail}
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
            <LogIn size={16} /> Sign in
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
