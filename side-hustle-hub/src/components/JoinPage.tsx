import { LogIn, MessageSquare, Smile } from "lucide-react";
import { MembershipPage } from "./MembershipPage";
import { BlueprintUnlockPanel } from "./BlueprintUnlockPanel";
import type { BlueprintAgeGroup } from "../lib/gysh-analytics";
import type { AudienceGroup } from "../lib/membership";
import { AUDIENCE_LABELS } from "../lib/membership";

type JoinPageProps = {
  onLogin: () => void;
  onCommunity: () => void;
  onKidsCorner?: () => void;
  onOpenFreeGuides?: () => void;
  /** After free Blueprint signup, restore the wizard results. */
  onBlueprintUnlocked?: (ageGroup: BlueprintAgeGroup) => void;
  /** Audience lane selected from the page that opened Join. */
  membershipAudience?: AudienceGroup | null;
};

export function JoinPage({
  onLogin,
  onCommunity,
  onKidsCorner,
  onOpenFreeGuides,
  onBlueprintUnlocked,
  membershipAudience = null,
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
          {membershipAudience
            ? `Showing ${AUDIENCE_LABELS[membershipAudience]} membership options first — change the lane anytime below.`
            : "Pick the plan that fits your Side Hustle — Free through Elite — with audience options for Kids, Teens, Adults, and Seniors."}
        </p>
        <MembershipPage
          onGoToJoin={onLogin}
          onGoToLogin={onLogin}
          onOpenFreeGuides={onOpenFreeGuides}
          initialAudience={membershipAudience}
        />
      </section>

      <div className="join-cta-row join-cta-row--footer">
        <button type="button" className="btn btn-primary" onClick={onLogin}>
          <LogIn size={16} /> Create account / Sign in
        </button>
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
