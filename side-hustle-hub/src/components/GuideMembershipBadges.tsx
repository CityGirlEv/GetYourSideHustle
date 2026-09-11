import {
  guideTierBadgeClass,
  guideTierShortLabel,
  membershipsIncludedForMinTier,
  type GuideMinTier,
} from "../lib/guide-access";

/** Colored bubble for the plan this guide belongs to (Free / Starter / Pro / Elite). */
export function GuideMembershipBadges({
  minTier,
  "data-testid": testId,
}: {
  minTier: GuideMinTier;
  "data-testid"?: string;
}) {
  const tiers = membershipsIncludedForMinTier(minTier);
  if (tiers.length === 0) return null;
  const labels = tiers.map((tier) => guideTierShortLabel(tier));
  return (
    <div
      className="guide-membership-badges"
      data-testid={testId}
      aria-label={`${labels.join(", ")} plan guide`}
    >
      {tiers.map((tier) => (
        <span key={tier} className={`glow-badge ${guideTierBadgeClass(tier)}`}>
          {guideTierShortLabel(tier)}
        </span>
      ))}
    </div>
  );
}
