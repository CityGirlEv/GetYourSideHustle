import { useState, type ReactNode } from "react";
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
import { ShowHideChevron } from "./ShowHideToggle";

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
  { id: "adult", label: "Adults" },
  { id: "kids", label: "Kids" },
  { id: "junior", label: "Teens" },
];

/** Free guides first when browsing a filter (stable relative order otherwise). */
function freeGuidesFirst<T>(guides: T[], isFree: (g: T) => boolean): T[] {
  return [...guides].sort((a, b) => Number(isFree(b)) - Number(isFree(a)));
}

function partitionFree<T>(guides: T[], isFree: (g: T) => boolean): { free: T[]; gated: T[] } {
  const free: T[] = [];
  const gated: T[] = [];
  for (const g of guides) {
    if (isFree(g)) free.push(g);
    else gated.push(g);
  }
  return { free, gated };
}

type GuideSectionKey = "free" | "adult" | "kids" | "junior";

function GuideLibrarySection({
  sectionKey,
  title,
  blurb,
  collapsible,
  open,
  onOpenChange,
  testId,
  children,
}: {
  sectionKey: GuideSectionKey;
  title: string;
  blurb: string;
  collapsible: boolean;
  open: boolean;
  onOpenChange: (key: GuideSectionKey, open: boolean) => void;
  testId?: string;
  children: ReactNode;
}) {
  const panelId = `free-guides-section-panel-${sectionKey}`;
  return (
    <section className="free-guides-section" data-testid={testId}>
      <header className="free-guides-section-head">
        {collapsible ? (
          <button
            type="button"
            className="free-guides-section-toggle"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => onOpenChange(sectionKey, !open)}
            data-testid={`free-guides-section-toggle-${sectionKey}`}
          >
            <ShowHideChevron open={open} size={20} />
            <span className="free-guides-section-toggle__title">
              <BookMarked size={20} aria-hidden />
              {title}
            </span>
          </button>
        ) : (
          <h3>
            <BookMarked size={20} /> {title}
          </h3>
        )}
        <p>{blurb}</p>
      </header>
      {(!collapsible || open) && (
        <div id={panelId} className="free-guides-section-body">
          {children}
        </div>
      )}
    </section>
  );
}

function FreeKidsGuideCard({
  guide,
  isMember,
  onJoinCta,
}: {
  guide: KidsGuide;
  isMember: boolean;
  /** Join membership for this guide’s audience (kids / teens). */
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
  const [sectionOpen, setSectionOpen] = useState<Record<GuideSectionKey, boolean>>({
    free: true,
    adult: false,
    kids: false,
    junior: false,
  });
  const freeOnly = filter === "free";
  const showAll = filter === "all";
  const sectionsCollapsible = showAll;

  const setSection = (key: GuideSectionKey, open: boolean) => {
    setSectionOpen((prev) => ({ ...prev, [key]: open }));
  };

  const kidsAll = guidesForAudience("kids");
  const juniorAll = guidesForAudience("junior");
  const adultAll = LAUNCH_GUIDES;
  const seniorAll = SENIOR_GUIDE_TEASERS;

  const kidsParts = partitionFree(kidsAll, (g) => g.free);
  const juniorParts = partitionFree(juniorAll, (g) => g.free);
  const adultParts = partitionFree(adultAll, (g) => !!g.free);
  const seniorParts = partitionFree(seniorAll, (g) => g.status === "preview");

  const showAdult = filter === "all" || filter === "free" || filter === "adult";
  const showKids = filter === "all" || filter === "free" || filter === "kids";
  const showJunior = filter === "all" || filter === "free" || filter === "junior";

  /**
   * All + Free: one “Free guides” block first (every audience).
   * On All, free guides also repeat inside each audience section when expanded.
   * Audience filters: free cards still sort first within that audience list.
   */
  const showFreeBundle = showAll || freeOnly;
  const freeFirstBundle = {
    adult: showFreeBundle && showAdult ? adultParts.free : [],
    senior: showFreeBundle && showAdult ? seniorParts.free : [],
    kids: showFreeBundle && showKids ? kidsParts.free : [],
    junior: showFreeBundle && showJunior ? juniorParts.free : [],
  };
  const freeFirstCount =
    freeFirstBundle.adult.length +
    freeFirstBundle.senior.length +
    freeFirstBundle.kids.length +
    freeFirstBundle.junior.length;

  // Free filter: only the Free Guides bundle. All / audience: full list, free first.
  const kidsGuides = freeOnly ? [] : freeGuidesFirst(kidsAll, (g) => g.free);
  const juniorGuides = freeOnly ? [] : freeGuidesFirst(juniorAll, (g) => g.free);
  const adultGuides = freeOnly ? [] : freeGuidesFirst(adultAll, (g) => !!g.free);
  const seniorGuides = freeOnly
    ? []
    : freeGuidesFirst(seniorAll, (g) => g.status === "preview");

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
    freeFirstCount === 0 &&
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
                  onClick={() => onGoToJoin(joinAudience)}
                  data-testid="guides-free-membership-btn"
                  aria-label="Go to membership — free plans available"
                >
                  Free
                </button>
                <div className="free-guides-perk-banner__copy">
                  <strong>Join to unlock more guides</strong>
                  <span>Free membership opens member guides &amp; saved progress.</span>
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

      {showFreeBundle && freeFirstCount > 0 && (
        <GuideLibrarySection
          sectionKey="free"
          title="Free Guides"
          blurb="Open these first — no membership required."
          collapsible={sectionsCollapsible}
          open={sectionOpen.free}
          onOpenChange={setSection}
          testId="free-guides-first"
        >
          <div className="free-guides-grid">
            {freeFirstBundle.adult.map((g) => (
              <article key={`free-adult-${g.id}`} className="glass free-guide-card is-free">
                <div className="free-guide-card-head">
                  <div>
                    <span className="glow-badge free">Free guide</span>
                    <h3>{g.name}</h3>
                  </div>
                  <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                </div>
                <p className="free-guide-summary">{g.peek}</p>
                <button type="button" className="glow-chip-btn" onClick={() => onOpenAdultGuide(g.id)}>
                  Open guide
                </button>
              </article>
            ))}
            {freeFirstBundle.senior.map((g) => (
              <article key={`free-senior-${g.id}`} className="glass free-guide-card is-free">
                <div className="free-guide-card-head">
                  <div>
                    <span className="glow-badge free">Free preview</span>
                    <h3>{g.title}</h3>
                  </div>
                  <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                </div>
                <p className="free-guide-summary">{g.blurb}</p>
                <button type="button" className="glow-chip-btn" onClick={onOpenSeniorsGuides}>
                  View in Seniors
                </button>
              </article>
            ))}
            {freeFirstBundle.kids.map((g) => (
              <FreeKidsGuideCard
                key={`free-kids-${g.id}`}
                guide={g}
                isMember={isLoggedIn}
                onJoinCta={onGoToJoin ? () => onGoToJoin("kids") : undefined}
              />
            ))}
            {freeFirstBundle.junior.map((g) => (
              <FreeKidsGuideCard
                key={`free-junior-${g.id}`}
                guide={g}
                isMember={isLoggedIn}
                onJoinCta={onGoToJoin ? () => onGoToJoin("junior") : undefined}
              />
            ))}
          </div>
        </GuideLibrarySection>
      )}

      {showAdult && (adultGuides.length > 0 || seniorGuides.length > 0) && (
        <GuideLibrarySection
          sectionKey="adult"
          title="GYSH Adult / Senior Guides"
          blurb={
            freeOnly
              ? "Free adult launch guides and senior previews."
              : "Launch guides for adults, plus senior-friendly guide teasers."
          }
          collapsible={sectionsCollapsible}
          open={sectionOpen.adult}
          onOpenChange={setSection}
        >
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
        </GuideLibrarySection>
      )}

      {showKids && kidsGuides.length > 0 && (
        <GuideLibrarySection
          sectionKey="kids"
          title="GYSH Kids Guides"
          blurb={
            freeOnly
              ? "Free starter playbooks for ages 4–12."
              : "Ages 4–12 — free starter playbooks and member team guides."
          }
          collapsible={sectionsCollapsible}
          open={sectionOpen.kids}
          onOpenChange={setSection}
        >
          <div className="free-guides-grid">
            {kidsGuides.map((g) => (
              <FreeKidsGuideCard
                key={g.id}
                guide={g}
                isMember={isLoggedIn}
                onJoinCta={onGoToJoin ? () => onGoToJoin("kids") : undefined}
              />
            ))}
          </div>
          <button type="button" className="btn btn-outline free-guides-section-link" onClick={onOpenKidsGuides}>
            Open Kids Corner Guides
          </button>
        </GuideLibrarySection>
      )}

      {showJunior && juniorGuides.length > 0 && (
        <GuideLibrarySection
          sectionKey="junior"
          title="GYSH Teens Guides"
          blurb={
            freeOnly
              ? "Free teen playbooks for ages 13–17."
              : "Ages 13–17 — free teen playbooks and member team guides."
          }
          collapsible={sectionsCollapsible}
          open={sectionOpen.junior}
          onOpenChange={setSection}
        >
          <div className="free-guides-grid">
            {juniorGuides.map((g) => (
              <FreeKidsGuideCard
                key={g.id}
                guide={g}
                isMember={isLoggedIn}
                onJoinCta={onGoToJoin ? () => onGoToJoin("junior") : undefined}
              />
            ))}
          </div>
          <button type="button" className="btn btn-outline free-guides-section-link" onClick={onOpenJuniorGuides}>
            Open Teens Side Hustle Guides
          </button>
        </GuideLibrarySection>
      )}
    </div>
  );
}
