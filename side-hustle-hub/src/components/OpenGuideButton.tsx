import { guideTierBadgeClass, type GuideMinTier } from "../lib/guide-access";
import type { ReactNode } from "react";

type OpenGuideButtonProps = {
  onClick: () => void;
  minTier: GuideMinTier;
  label?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
};

/**
 * Opens a launch guide. Styled like the membership bubble for that tier
 * (Free / Starter / Pro / Elite) so card CTAs match card badges.
 */
export function OpenGuideButton({
  onClick,
  minTier,
  label = "Open guide",
  className = "",
  "data-testid": testId,
  children,
}: OpenGuideButtonProps) {
  const tone = guideTierBadgeClass(minTier);
  return (
    <button
      type="button"
      className={`glow-chip-btn open-guide-btn is-${tone}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      data-testid={testId}
      data-tier={tone}
    >
      {tone === "free" ? (
        <span className="glow-badge free open-guide-btn__badge" data-testid="open-guide-free-badge">
          Free
        </span>
      ) : null}
      {label}
      {children}
    </button>
  );
}
