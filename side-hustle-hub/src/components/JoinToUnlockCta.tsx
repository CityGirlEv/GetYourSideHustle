import { BadgeCheck } from "lucide-react";
import {
  JOIN_TO_UNLOCK_LABEL,
  unlockCtaTierPill,
  type GuideAccessResult,
} from "../lib/guide-access";

type JoinToUnlockCtaProps = {
  access: GuideAccessResult;
  onJoin?: () => void;
  onUpgrade?: () => void;
  className?: string;
  /** Button class — defaults to green join style (same as Seniors unlock). */
  buttonClassName?: string;
};

/** Locked-guide CTA: Join / Upgrade plus the same tier phrase as the lock badge. */
export function JoinToUnlockCta({
  access,
  onJoin,
  onUpgrade,
  className,
  buttonClassName = "btn btn-join-green",
}: JoinToUnlockCtaProps) {
  if (access.unlocked) return null;

  if (access.needsUpgrade) {
    const handler = onUpgrade ?? onJoin;
    if (!handler) return null;
    return (
      <div className={className ? `join-to-unlock-cta ${className}` : "join-to-unlock-cta"}>
        <button type="button" className={buttonClassName} onClick={handler} style={{ gap: 6 }}>
          <BadgeCheck size={16} aria-hidden />
          Upgrade to Unlock
          <span className="join-to-unlock-cta__free">{unlockCtaTierPill(access.minTier)}</span>
        </button>
      </div>
    );
  }

  if (!onJoin) return null;
  return (
    <div className={className ? `join-to-unlock-cta ${className}` : "join-to-unlock-cta"}>
      <button type="button" className={buttonClassName} onClick={onJoin} style={{ gap: 6 }}>
        <BadgeCheck size={16} aria-hidden />
        {JOIN_TO_UNLOCK_LABEL}
        <span className="join-to-unlock-cta__free">{unlockCtaTierPill(access.minTier)}</span>
      </button>
    </div>
  );
}
