import { Gift } from "lucide-react";
import {
  complimentaryExtraGiftNote,
  isComplimentaryExtraUnlock,
  type GuideMinTier,
} from "../lib/guide-access";

/** Callout on the one Match Wizard extra (100% match gift). Hidden for every other guide. */
export function ComplimentaryGiftNote({
  guideId,
  minTier,
  className,
}: {
  guideId: string;
  minTier: GuideMinTier;
  className?: string;
}) {
  if (!isComplimentaryExtraUnlock(guideId)) return null;
  return (
    <p
      role="note"
      className={className ? `complimentary-gift-note ${className}` : "complimentary-gift-note"}
      data-testid="complimentary-gift-note"
    >
      <Gift size={16} aria-hidden />
      <span>{complimentaryExtraGiftNote(minTier)}</span>
    </p>
  );
}
