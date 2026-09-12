import { useEffect, useState } from "react";
import {
  guideTierBadgeClass,
  guideTierShortLabel,
} from "../lib/guide-access";
import { saveGuideCatalogContent } from "../lib/guide-catalog-client";
import type { GuideCatalogState } from "../lib/guide-catalog-state";
import {
  GUIDE_AGE_GROUP_OPTIONS,
  GUIDE_MEMBERSHIP_LEVELS,
  minTierFromMembershipSelection,
  toggleAgeAudienceSelection,
  toggleMembershipSelection,
} from "../lib/guide-library-update";
import type { TierId } from "../lib/membership";
import type { HustleAgeGroup } from "../lib/side-hustle-catalog";

/**
 * Membership Level + Age Group bubble editors for Library Admin Update panel.
 */
export function GuideMembershipAgeFields({
  guideId,
  membershipSelected,
  ageSelected,
  busy = false,
  onSaved,
  onError,
}: {
  guideId: string;
  membershipSelected: readonly TierId[];
  ageSelected: readonly HustleAgeGroup[];
  busy?: boolean;
  onSaved: (state: GuideCatalogState) => void;
  onError?: (message: string | null) => void;
}) {
  const [membership, setMembership] = useState<TierId[]>(() => [...membershipSelected]);
  const [ages, setAges] = useState<HustleAgeGroup[]>(() => [...ageSelected]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMembership([...membershipSelected]);
  }, [guideId, membershipSelected.join(",")]);

  useEffect(() => {
    setAges([...ageSelected]);
  }, [guideId, ageSelected.join(",")]);

  const persist = async (nextMembership: TierId[], nextAges: HustleAgeGroup[]) => {
    setSaving(true);
    onError?.(null);
    try {
      const state = await saveGuideCatalogContent(guideId, {
        minTier: minTierFromMembershipSelection(nextMembership),
        membershipTiers: nextMembership,
        audiences: nextAges,
      });
      onSaved(state);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Could not save membership / age groups.");
      setMembership([...membershipSelected]);
      setAges([...ageSelected]);
    } finally {
      setSaving(false);
    }
  };

  const disabled = busy || saving;

  return (
    <>
      <div
        className="launch-guide-detail__update-row"
        data-testid={`launch-guide-update-membership-${guideId}`}
      >
        <span className="launch-guide-detail__update-row-label" id={`guide-membership-label-${guideId}`}>
          Membership Level
        </span>
        <div
          className="launch-guide-detail__update-bubbles"
          role="radiogroup"
          aria-labelledby={`guide-membership-label-${guideId}`}
        >
          {GUIDE_MEMBERSHIP_LEVELS.map((tier) => {
            const checked = membership.includes(tier);
            return (
              <button
                key={tier}
                type="button"
                role="radio"
                aria-checked={checked}
                disabled={disabled}
                className={`launch-guide-detail__update-bubble glow-badge ${guideTierBadgeClass(tier)}${
                  checked ? " is-active" : ""
                }`}
                data-testid={`launch-guide-membership-${tier}-${guideId}`}
                onClick={() => {
                  if (disabled) return;
                  const next = toggleMembershipSelection(membership, tier);
                  setMembership(next);
                  void persist(next, ages);
                }}
              >
                <span className="launch-guide-detail__update-bubble-check" aria-hidden>
                  {checked ? "✓" : ""}
                </span>
                {guideTierShortLabel(tier)}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="launch-guide-detail__update-row"
        data-testid={`launch-guide-update-ages-${guideId}`}
      >
        <span className="launch-guide-detail__update-row-label" id={`guide-ages-label-${guideId}`}>
          Age Group
        </span>
        <div
          className="launch-guide-detail__update-bubbles"
          role="group"
          aria-labelledby={`guide-ages-label-${guideId}`}
        >
          {GUIDE_AGE_GROUP_OPTIONS.map((opt) => {
            const checked = ages.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                disabled={disabled}
                className={`launch-guide-detail__update-bubble is-age${checked ? " is-active" : ""}`}
                data-testid={`launch-guide-age-${opt.id}-${guideId}`}
                onClick={() => {
                  if (disabled) return;
                  const next = toggleAgeAudienceSelection(ages, opt.id);
                  if (next.length === ages.length && next.every((a, i) => a === ages[i])) {
                    return;
                  }
                  setAges(next);
                  void persist(membership, next);
                }}
              >
                <span className="launch-guide-detail__update-bubble-check" aria-hidden>
                  {checked ? "✓" : ""}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
