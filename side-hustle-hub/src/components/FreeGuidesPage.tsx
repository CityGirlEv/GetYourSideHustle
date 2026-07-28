import { useState } from "react";
import {
  BadgeCheck,
  BookMarked,
  ChevronRight,
  Lock,
  LogIn,
  Unlock,
  UserPlus,
} from "lucide-react";
import { guidesForAudience, themeLabel, type KidsGuide } from "../lib/kids-guides";
import { LAUNCH_GUIDES } from "../lib/launch-guides";
import { SENIOR_GUIDE_TEASERS } from "../lib/seniors-content";
import {
  MARKETING_GUIDES,
  type MarketingGuideId,
} from "../lib/marketing-guides";
import type { AudienceGroup } from "../lib/membership";
import guidesLibraryHero from "../assets/guides-library-hero.png";

type GuideFilter = "all" | "free" | "adult" | "kids" | "junior";

type FreeGuidesPageProps = {
  isLoggedIn?: boolean;
  onGoToJoin?: (audience?: AudienceGroup) => void;
  onGoToLogin?: () => void;
  onOpenAdultGuide: (hustleId: string) => void;
  onOpenKidsGuides: () => void;
  onOpenJuniorGuides: () => void;
  onOpenSeniorsGuides: () => void;
  onOpenManual?: (id: MarketingGuideId) => void;
};

const FILTERS: { id: GuideFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "adult", label: "Adult / Senior" },
  { id: "kids", label: "Kids" },
  { id: "junior", label: "Teens" },
];

function FreeKidsGuideCard({
  guide,
  isMember,
  onJoinCta,
}: {
  guide: KidsGuide;
  isMember: boolean;
  onJoinCta?: () => void;
}) {
  const unlocked = guide.free || isMember;
  const previewCount = guide.previewCount;
  const visibleSteps = unlocked ? guide.steps : guide.steps.slice(0, previewCount);
  const [stepsOpen, setStepsOpen] = useState(false);

  return (
    <article className={`glass free-guide-card ${guide.free ? "is-free" : "is-gated"}`}>
      <div className="free-guide-card-head">
        <div>
          <span className={`glow-badge ${guide.free ? "free" : "pink"}`}>
            {guide.free ? "Free guide" : "Members"}
          </span>
          <span className="kids-guide-theme">{themeLabel(guide.theme)}</span>
          <h3>{guide.title}</h3>
        </div>
        {unlocked ? (
          <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
        ) : (
          <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
        )}
      </div>
      <p className="free-guide-summary">{guide.summary}</p>

      <button
        type="button"
        className="glow-chip-btn"
        onClick={() => setStepsOpen((o) => !o)}
        aria-expanded={stepsOpen}
      >
        {stepsOpen ? "Hide steps" : `Show ${visibleSteps.length} steps`}
      </button>

      {stepsOpen && (
        <>
          <ol className="kids-guide-steps">
            {visibleSteps.map((step, i) => (
              <li key={step.title}>
                <strong>
                  Step {i + 1}: {step.title}
                </strong>
                <span>{step.body}</span>
              </li>
            ))}
          </ol>
          {!unlocked && (
            <div className="free-guide-lock-cta">
              <Lock size={16} />
              <span>Join the team to unlock the full guide.</span>
              {onJoinCta && (
                <button type="button" className="btn btn-primary" onClick={onJoinCta} style={{ gap: 6 }}>
                  <BadgeCheck size={16} /> Join the team
                </button>
              )}
            </div>
          )}
          {unlocked && (
            <p className="kids-guide-parent-tip">
              <strong>Parent tip:</strong> {guide.parentTip}
            </p>
          )}
        </>
      )}
    </article>
  );
}

export function FreeGuidesPage({
  isLoggedIn = false,
  onGoToJoin,
  onGoToLogin,
  onOpenAdultGuide,
  onOpenKidsGuides,
  onOpenJuniorGuides,
  onOpenSeniorsGuides,
  onOpenManual,
}: FreeGuidesPageProps) {
  const [filter, setFilter] = useState<GuideFilter>("all");
  const freeOnly = filter === "free";

  const kidsGuides = guidesForAudience("kids").filter((g) => !freeOnly || g.free);
  const juniorGuides = guidesForAudience("junior").filter((g) => !freeOnly || g.free);
  const adultGuides = LAUNCH_GUIDES.filter((g) => !freeOnly || g.free);
  const seniorGuides = SENIOR_GUIDE_TEASERS.filter((g) => !freeOnly || g.status === "preview");

  const showAdult = filter === "all" || filter === "free" || filter === "adult";
  const showKids = filter === "all" || filter === "free" || filter === "kids";
  const showJunior = filter === "all" || filter === "free" || filter === "junior";

  const manuals = MARKETING_GUIDES.filter((g) => {
    if (filter === "all" || filter === "free") return true;
    if (g.id === "master") return true;
    if (filter === "adult") return g.id === "adult" || g.id === "seniors";
    if (filter === "kids") return g.id === "kids";
    if (filter === "junior") return g.id === "teens";
    return true;
  });

  const empty =
    manuals.length === 0 &&
    (!showAdult || (adultGuides.length === 0 && seniorGuides.length === 0)) &&
    (!showKids || kidsGuides.length === 0) &&
    (!showJunior || juniorGuides.length === 0);

  const joinAudience: AudienceGroup =
    filter === "kids" ? "kids" : filter === "junior" ? "junior" : "adult";

  return (
    <div className="free-guides-page" data-testid="free-guides-page">
      <section className="free-guides-hero" aria-label="GYSH Guides library">
        <div className="free-guides-hero-media">
          <img
            src={guidesLibraryHero}
            alt="GYSH Guides — practical side hustle guides for every age, every stage, every dream."
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="free-guides-hero-side">
          <div className="free-guides-hero-copy glass">
            {onGoToJoin && (
              <div className="free-guides-perk-banner free-guides-perk-banner--panel" role="note">
                <button
                  type="button"
                  className="glow-badge free free-guides-perk-free-btn"
                  onClick={() => onGoToJoin("adult")}
                  data-testid="guides-free-membership-btn"
                  aria-label="Go to membership — free plans available"
                >
                  Free
                </button>
                <div className="free-guides-perk-banner__copy">
                  <strong>Free Membership Unlocks Perks</strong>
                  <span>Join free for member guides &amp; saved progress.</span>
                </div>
              </div>
            )}
            <div className="free-guides-hero-intro">
              <p>
                Age-ready how-to playbooks for Kids, Teens, Adults, and Seniors. Browse free previews;
                open a guide, or filter the library below.
              </p>
            </div>
            <div
              className="free-guides-filters"
              role="tablist"
              aria-label="Filter guides"
              data-testid="free-guides-filters"
            >
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  data-testid={`free-guides-filter-${f.id}`}
                  className={`glow-chip-btn free-guides-filter-btn${filter === f.id ? " is-active" : ""}${f.id === "free" ? " is-free-filter" : ""}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {onOpenManual && manuals.length > 0 && (
              <nav className="free-guides-hero-links" aria-label="Open GYSH guides">
                {manuals.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`free-guides-hero-link${g.id === "master" ? " is-master" : ""}`}
                    onClick={() => onOpenManual(g.id)}
                    data-testid={`hero-open-manual-${g.id}`}
                  >
                    <BookMarked size={18} aria-hidden />
                    <span className="free-guides-hero-link__text">
                      <span className="free-guides-hero-link__label">{g.menuLabel}</span>
                      <span className="free-guides-hero-link__meta">{g.audienceBadge}</span>
                    </span>
                    <ChevronRight size={16} className="free-guides-hero-link__chev" aria-hidden />
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>
      </section>

      {(onGoToLogin || onGoToJoin) && (
        <div className="free-guides-library-bar">
          <p className="free-guides-library-bar__lead">
            Browse launch playbooks below — free previews are open; open an audience guide above for
            the full story.
          </p>
          <div className="free-guides-hero-actions free-guides-library-bar__actions">
            {onGoToLogin && (
              <button type="button" className="btn btn-outline" onClick={onGoToLogin}>
                <LogIn size={16} /> Sign in
              </button>
            )}
            {onGoToJoin && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onGoToJoin(joinAudience)}
              >
                <UserPlus size={16} /> Join GYSH
              </button>
            )}
          </div>
        </div>
      )}

      {empty && (
        <div className="glass free-guides-empty">
          <p>No guides match this filter yet.</p>
        </div>
      )}

      {showAdult && (adultGuides.length > 0 || seniorGuides.length > 0) && (
        <section className="free-guides-section">
          <header className="free-guides-section-head">
            <h3>
              <BookMarked size={20} /> GYSH Adult / Senior Guides
            </h3>
            <p>
              {freeOnly
                ? "Free adult launch guides and senior previews."
                : "Launch guides for adults, plus senior-friendly guide teasers."}
            </p>
          </header>

          {adultGuides.length > 0 && (
            <>
              <h4 className="free-guides-subsection">Adult launch guides</h4>
              <div className="free-guides-grid">
                {adultGuides.map((g) => {
                  const isFree = !!g.free;
                  const unlocked = isFree || isLoggedIn;
                  return (
                    <article key={g.id} className={`glass free-guide-card ${isFree ? "is-free" : "is-gated"}`}>
                      <div className="free-guide-card-head">
                        <div>
                          <span className={`glow-badge ${isFree ? "free" : "pink"}`}>
                            {isFree ? "Free guide" : "Members"}
                          </span>
                          <h3>{g.name}</h3>
                        </div>
                        {unlocked ? (
                          <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                        ) : (
                          <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
                        )}
                      </div>
                      <p className="free-guide-summary">{g.peek}</p>
                      {unlocked ? (
                        <button type="button" className="glow-chip-btn" onClick={() => onOpenAdultGuide(g.id)}>
                          Open guide
                        </button>
                      ) : (
                        <div className="free-guide-lock-cta">
                          <Lock size={16} />
                          <span>Sign in to unlock this launch guide.</span>
                          {onGoToLogin && (
                            <button type="button" className="btn btn-outline" onClick={onGoToLogin} style={{ gap: 6 }}>
                              <LogIn size={14} /> Sign in
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {seniorGuides.length > 0 && (
            <>
              <h4 className="free-guides-subsection">Senior guides</h4>
              <div className="free-guides-grid">
                {seniorGuides.map((g) => {
                  const isFree = g.status === "preview";
                  return (
                    <article key={g.id} className={`glass free-guide-card ${isFree ? "is-free" : "is-gated"}`}>
                      <div className="free-guide-card-head">
                        <div>
                          <span className={`glow-badge ${isFree ? "free" : "amber"}`}>
                            {isFree ? "Free preview" : "Coming soon"}
                          </span>
                          <h3>{g.title}</h3>
                        </div>
                        {isFree ? (
                          <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                        ) : (
                          <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
                        )}
                      </div>
                      <p className="free-guide-summary">{g.blurb}</p>
                      <button type="button" className="glow-chip-btn" onClick={onOpenSeniorsGuides}>
                        {isFree ? "View in Seniors" : "See Seniors page"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      {showKids && kidsGuides.length > 0 && (
        <section className="free-guides-section">
          <header className="free-guides-section-head">
            <h3>
              <BookMarked size={20} /> GYSH Kids Guides
            </h3>
            <p>
              {freeOnly
                ? "Free starter playbooks for ages 4–12."
                : "Ages 4–12 — free starter playbooks and member team guides."}
            </p>
          </header>
          <div className="free-guides-grid">
            {kidsGuides.map((g) => (
              <FreeKidsGuideCard key={g.id} guide={g} isMember={false} onJoinCta={onOpenKidsGuides} />
            ))}
          </div>
          <button type="button" className="btn btn-outline free-guides-section-link" onClick={onOpenKidsGuides}>
            Open Kids Corner Guides
          </button>
        </section>
      )}

      {showJunior && juniorGuides.length > 0 && (
        <section className="free-guides-section">
          <header className="free-guides-section-head">
            <h3>
              <BookMarked size={20} /> GYSH Teens Guides
            </h3>
            <p>
              {freeOnly
                ? "Free teen playbooks for ages 13–17."
                : "Ages 13–17 — free teen playbooks and member team guides."}
            </p>
          </header>
          <div className="free-guides-grid">
            {juniorGuides.map((g) => (
              <FreeKidsGuideCard key={g.id} guide={g} isMember={false} onJoinCta={onOpenJuniorGuides} />
            ))}
          </div>
          <button type="button" className="btn btn-outline free-guides-section-link" onClick={onOpenJuniorGuides}>
            Open Teens Side Hustle Guides
          </button>
        </section>
      )}
    </div>
  );
}
