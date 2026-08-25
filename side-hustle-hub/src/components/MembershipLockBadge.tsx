import { Lock } from "lucide-react";
import {
  membershipFeatureLockedBadgeLabel,
  membershipLockedBadgeLabel,
  type GuideMinTier,
} from "../lib/guide-access";

type MembershipLockBadgeProps = {
  /** Required membership tier to unlock. */
  minTier: GuideMinTier;
  /** When true, badge is hidden (content is open). */
  unlocked?: boolean;
  /** Optional override label (defaults to Locked · Needs {Tier}). */
  label?: string;
  className?: string;
  "data-testid"?: string;
};

/**
 * Shows a lock badge naming the required membership level.
 * Hidden when unlocked.
 */
export function MembershipLockBadge({
  minTier,
  unlocked = false,
  label,
  className = "",
  "data-testid": testId = "membership-lock-badge",
}: MembershipLockBadgeProps) {
  if (unlocked) return null;
  const text = label ?? membershipLockedBadgeLabel(minTier);
  return (
    <span
      className={`glow-badge membership-lock-badge ${className}`.trim()}
      data-testid={testId}
      title={text}
    >
      <Lock size={12} aria-hidden /> {text}
    </span>
  );
}

type FeatureLockBadgeProps = {
  feature: "schedule_suite" | "pnl" | "tracker" | "progress";
  unlocked?: boolean;
  "data-testid"?: string;
};

/** Schedule Suite / P&L lock badge (Pro+). */
export function MembershipFeatureLockBadge({
  feature,
  unlocked = false,
  "data-testid": testId = "membership-feature-lock-badge",
}: FeatureLockBadgeProps) {
  if (unlocked) return null;
  return (
    <span
      className="glow-badge membership-lock-badge"
      data-testid={testId}
      title={membershipFeatureLockedBadgeLabel(feature)}
    >
      <Lock size={12} aria-hidden /> {membershipFeatureLockedBadgeLabel(feature)}
    </span>
  );
}
