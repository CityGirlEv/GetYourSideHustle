/**
 * Member/guest placeholder while Guides content is offline for updates.
 * Admin and QA bypass this via guides-online.ts.
 */

import { BookOpen, Crown, Sparkles } from "lucide-react";

export default function GuidesUpdatingPage({
  onBrowseMemberships,
}: {
  onBrowseMemberships?: () => void;
}) {
  return (
    <section
      className="glass guides-updating"
      data-testid="guides-updating"
      aria-labelledby="guides-updating-title"
    >
      <div className="guides-updating__glow" aria-hidden />
      <div className="guides-updating__mark" aria-hidden>
        <BookOpen size={28} strokeWidth={1.75} />
        <Sparkles className="guides-updating__spark" size={16} strokeWidth={2} />
      </div>
      <p className="guides-updating__eyebrow">Side Hustle Library</p>
      <h1 id="guides-updating-title" className="guides-updating__title">
        GYSH Guides are being refreshed
      </h1>
      <p className="guides-updating__lede">
        We’re refreshing every guide with the latest content — pricing, supplies, steps, and
        tools. The library will be back online soon.
      </p>
      <div className="guides-updating__divider" aria-hidden />
      <p className="guides-updating__note">
        Thank you for your patience. While we finish the refresh, take a look at membership plans
        that unlock the full library when it returns.
      </p>
      {onBrowseMemberships ? (
        <div className="guides-updating__actions">
          <button
            type="button"
            className="btn btn-primary guides-updating__cta"
            data-testid="guides-updating-browse-memberships"
            onClick={onBrowseMemberships}
          >
            <Crown size={18} aria-hidden />
            Browse Memberships
          </button>
        </div>
      ) : null}
    </section>
  );
}
