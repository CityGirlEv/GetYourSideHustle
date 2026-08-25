import { useMemo, useState, type ReactNode } from "react";
import {
  BookMarked,
  ChevronRight,
  LayoutGrid,
  List,
  Lock,
  Unlock,
  UserPlus,
} from "lucide-react";
import { guidesForAudience, KIDS_GUIDES, themeLabel, type KidsGuide } from "../lib/kids-guides";
import { LAUNCH_GUIDES } from "../lib/launch-guides";
import {
  SENIOR_GUIDE_TEASERS,
  isSeniorGuideFree,
  orderedSeniorGuides,
} from "../lib/seniors-content";
import {
  MARKETING_GUIDES,
  type MarketingGuideId,
} from "../lib/marketing-guides";
import type { AudienceGroup, TierId } from "../lib/membership";
import {
  FREE_GUIDE_SIGNUP_NOTE,
  adultGuideMinTier,
  buildGuideCatalogRows,
  guideTierBadgeLabel,
  guideTierLadder,
  guideTierMembershipNote,
  guideTierSortRank,
  kidsGuideMinTier,
  resolveGuideAccess,
  seniorGuideMinTier,
  tierDisplayName,
  type GuideCatalogRow,
  type GuideMinTier,
} from "../lib/guide-access";
import guidesLibraryHero from "../assets/guides-library-hero.png";
import { ShowHideChevron } from "./ShowHideToggle";
import { JoinToUnlockCta } from "./JoinToUnlockCta";
import { MembershipLockBadge } from "./MembershipLockBadge";

type LibraryView = "cards" | "table";

type GuideFilter = "all" | "free" | "adult" | "kids" | "junior";

type FreeGuidesPageProps = {
  isLoggedIn?: boolean;
  membershipTier?: string | null;
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
  { id: "junior", label: "Teens" },
  { id: "kids", label: "Kids" },
];

/** Sort guides Free → Starter → Pro → Elite (stable by name within a tier). */
function sortByMembershipTier<T>(
  guides: T[],
  minTierOf: (g: T) => GuideMinTier,
  nameOf: (g: T) => string,
): T[] {
  return [...guides].sort((a, b) => {
    const tr = guideTierSortRank(minTierOf(a)) - guideTierSortRank(minTierOf(b));
    if (tr !== 0) return tr;
    return nameOf(a).localeCompare(nameOf(b));
  });
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

type MatrixDemoTab = "all" | "Adults" | "Teens" | "Seniors" | "Kids";

const MATRIX_DEMO_TABS: { id: MatrixDemoTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Adults", label: "Adults" },
  { id: "Teens", label: "Teens" },
  { id: "Seniors", label: "Seniors" },
  { id: "Kids", label: "Kids" },
];

function GuidesMembershipTable({
  rows,
  onOpenAdultGuide,
  onOpenKidsGuides,
  onOpenJuniorGuides,
  onOpenSeniorsGuides,
}: {
  rows: GuideCatalogRow[];
  onOpenAdultGuide: (id: string) => void;
  onOpenKidsGuides: () => void;
  onOpenJuniorGuides: () => void;
  onOpenSeniorsGuides: () => void;
}) {
  const [demoTab, setDemoTab] = useState<MatrixDemoTab>("all");
  const [tierTab, setTierTab] = useState<GuideMinTier | "all">("all");
  const [open, setOpen] = useState(true);
  const panelId = "guides-membership-panel";

  const filteredRows = useMemo(() => {
    if (demoTab === "all") return rows;
    return rows.filter((row) => row.audience === demoTab);
  }, [rows, demoTab]);

  const byTier = useMemo(() => {
    const map = new Map<GuideMinTier, GuideCatalogRow[]>();
    for (const tier of guideTierLadder()) map.set(tier, []);
    for (const row of filteredRows) {
      const list = map.get(row.minTier) ?? [];
      list.push(row);
      map.set(row.minTier, list);
    }
    return map;
  }, [filteredRows]);

  const tierTabs = useMemo(() => {
    const levels = guideTierLadder().map((tier) => ({
      id: tier as GuideMinTier | "all",
      label: tier === "free" ? "Free" : tierDisplayName(tier as TierId),
      count: (byTier.get(tier) ?? []).length,
    }));
    return [{ id: "all" as const, label: "All", count: filteredRows.length }, ...levels];
  }, [byTier, filteredRows.length]);

  const selectDemo = (id: MatrixDemoTab) => {
    setDemoTab(id);
    // Keep "All" membership; otherwise ensure the selected tier still has guides.
    if (tierTab === "all") return;
    const nextRows = id === "all" ? rows : rows.filter((row) => row.audience === id);
    const count = nextRows.filter((row) => row.minTier === tierTab).length;
    if (count === 0) setTierTab("all");
  };

  const guides = useMemo(() => {
    const list = tierTab === "all" ? filteredRows : (byTier.get(tierTab) ?? []);
    if (tierTab !== "all") return list;
    return [...list].sort((a, b) => {
      const tr = guideTierSortRank(a.minTier) - guideTierSortRank(b.minTier);
      if (tr !== 0) return tr;
      return a.title.localeCompare(b.title);
    });
  }, [tierTab, filteredRows, byTier]);

  const openRow = (row: GuideCatalogRow) => {
    if (row.audience === "Adults" && row.openId) {
      onOpenAdultGuide(row.openId);
      return;
    }
    if (row.audience === "Seniors") {
      if (row.openId) onOpenAdultGuide(row.openId);
      else onOpenSeniorsGuides();
      return;
    }
    if (row.audience === "Kids") onOpenKidsGuides();
    else onOpenJuniorGuides();
  };

  const panelLabel =
    tierTab === "all"
      ? "All memberships"
      : tierTab === "free"
        ? "Free Membership"
        : `${tierDisplayName(tierTab as TierId)} Membership`;

  const panelNote =
    tierTab === "all"
      ? "Guides grouped by unlock level — tap a membership tab to focus one plan."
      : tierTab === "free"
        ? FREE_GUIDE_SIGNUP_NOTE
        : `Included with ${tierDisplayName(tierTab as TierId)} plan`;

  return (
    <section className="glass free-guides-matrix" data-testid="guides-membership-table">
      <header className="free-guides-matrix__head">
        <button
          type="button"
          className="free-guides-section-toggle free-guides-matrix__toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          data-testid="guides-membership-toggle"
        >
          <ShowHideChevron open={open} size={20} />
          <span className="free-guides-section-toggle__title">
            <BookMarked size={20} aria-hidden />
            Guides by membership level
          </span>
        </button>
        <p>
          Free Guides unlock with Free Membership ({FREE_GUIDE_SIGNUP_NOTE}). Higher plans unlock
          Starter, Pro, and Elite guides.
        </p>
      </header>

      {open ? (
        <div id={panelId} className="free-guides-matrix__body">
          <div className="free-guides-matrix__filter-block">
            <span className="free-guides-matrix__filter-label" id="guides-matrix-demo-label">
              Audience
            </span>
            <div
              className="free-guides-matrix__tabs"
              role="tablist"
              aria-labelledby="guides-matrix-demo-label"
              data-testid="guides-matrix-demo-tabs"
            >
              {MATRIX_DEMO_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={demoTab === tab.id}
                  data-testid={`guides-matrix-tab-${tab.id}`}
                  className={`glow-chip-btn free-guides-matrix__tab${demoTab === tab.id ? " is-active" : ""}`}
                  onClick={() => selectDemo(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="free-guides-matrix__filter-block">
            <span className="free-guides-matrix__filter-label" id="guides-matrix-tier-label">
              Membership
            </span>
            <div
              className="free-guides-matrix__tabs free-guides-matrix__tabs--tiers"
              role="tablist"
              aria-labelledby="guides-matrix-tier-label"
              data-testid="guides-matrix-tier-tabs"
            >
              {tierTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={tierTab === tab.id}
                  disabled={tab.count === 0 && tab.id !== "all"}
                  data-testid={`guides-matrix-tier-${tab.id}`}
                  className={`glow-chip-btn free-guides-matrix__tab${tierTab === tab.id ? " is-active" : ""}`}
                  onClick={() => {
                    if (tab.count === 0 && tab.id !== "all") return;
                    setTierTab(tab.id);
                  }}
                >
                  {tab.label}
                  <span className="free-guides-matrix__tab-count">{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {filteredRows.length === 0 ? (
            <div className="free-guides-matrix__empty">
              <p>No guides for this demographic yet.</p>
            </div>
          ) : guides.length === 0 ? (
            <div className="free-guides-matrix__empty">
              <p>No guides at this membership level for the selected audience.</p>
            </div>
          ) : (
            <div
              className="free-guides-matrix__panel"
              data-testid={`guides-matrix-panel-${tierTab}`}
            >
              <div className="free-guides-matrix__panel-head">
                <span
                  className={`glow-badge ${tierTab === "all" || tierTab === "free" ? "free" : "pink"}`}
                >
                  {tierTab === "all"
                    ? "All levels"
                    : tierTab === "free"
                      ? "Free Guide"
                      : guideTierBadgeLabel(tierTab)}
                </span>
                <div>
                  <strong>{panelLabel}</strong>
                  <small>{panelNote}</small>
                </div>
              </div>
              <ul className="free-guides-matrix__list">
                {guides.map((row) => (
                  <li key={row.id} className="free-guides-matrix__list-item">
                    <button
                      type="button"
                      className="free-guides-matrix__guide-btn"
                      onClick={() => openRow(row)}
                      data-testid={`guides-matrix-guide-${row.id}`}
                    >
                      <span className="free-guides-matrix__guide-title">{row.title}</span>
                      {tierTab === "all" ? (
                        <span className="free-guides-matrix__guide-tier">
                          {row.minTier === "free"
                            ? "Free"
                            : tierDisplayName(row.minTier as TierId)}
                        </span>
                      ) : null}
                      {demoTab === "all" ? (
                        <span className="free-guides-matrix__guide-audience">{row.audience}</span>
                      ) : null}
                      <ChevronRight size={16} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function FreeKidsGuideCard({
  guide,
  isMember,
  membershipTier,
  onJoinCta,
}: {
  guide: KidsGuide;
  isMember: boolean;
  membershipTier?: string | null;
  /** Join membership for this guide’s audience (kids / teens). */
  onJoinCta?: () => void;
}) {
  const minTier = kidsGuideMinTier(guide.id);
  const access = resolveGuideAccess({ isMember, membershipTier, minTier });
  const isFreePlan = minTier === "free";
  const [stepsOpen, setStepsOpen] = useState(false);

  return (
    <article className={`glass free-guide-card ${isFreePlan ? "is-free" : "is-gated"}`}>
      <div className="free-guide-card-head">
        <div>
          <div className="free-guide-card-badges">
            <span className={`glow-badge ${isFreePlan ? "free" : "pink"}`}>
              {guideTierBadgeLabel(minTier)}
            </span>
            <MembershipLockBadge
              minTier={minTier}
              unlocked={access.unlocked}
              data-testid={`guide-lock-badge-${guide.id}`}
            />
          </div>
          <span className="kids-guide-theme">{themeLabel(guide.theme)}</span>
          <h3>{guide.title}</h3>
          <p className="free-guide-tier-note">{guideTierMembershipNote(minTier)}</p>
        </div>
        {access.unlocked ? (
          <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
        ) : (
          <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
        )}
      </div>
      <p className="free-guide-summary">{guide.summary}</p>

      {access.unlocked ? (
        <>
          <button
            type="button"
            className="glow-chip-btn"
            onClick={() => setStepsOpen((o) => !o)}
            aria-expanded={stepsOpen}
          >
            {stepsOpen ? "Hide steps" : `Show ${guide.steps.length} steps`}
          </button>

          {stepsOpen && (
            <>
              <ol className="kids-guide-steps">
                {guide.steps.map((step, i) => (
                  <li key={step.title}>
                    <strong>
                      Step {i + 1}: {step.title}
                    </strong>
                    <span>{step.body}</span>
                  </li>
                ))}
              </ol>
              <p className="kids-guide-parent-tip">
                <strong>Parent tip:</strong> {guide.parentTip}
              </p>
            </>
          )}
        </>
      ) : (
        <div className="free-guide-lock-cta">
          <Lock size={16} />
          <JoinToUnlockCta access={access} onJoin={onJoinCta} onUpgrade={onJoinCta} />
        </div>
      )}
    </article>
  );
}

export function FreeGuidesPage({
  isLoggedIn = false,
  membershipTier = null,
  onGoToJoin,
  onGoToLogin,
  onOpenAdultGuide,
  onOpenKidsGuides,
  onOpenJuniorGuides,
  onOpenSeniorsGuides,
  onOpenManual,
}: FreeGuidesPageProps) {
  const [filter, setFilter] = useState<GuideFilter>("all");
  const [libraryView, setLibraryView] = useState<LibraryView>("cards");
  const [sectionOpen, setSectionOpen] = useState<Record<GuideSectionKey, boolean>>({
    free: true,
    adult: true,
    kids: true,
    junior: true,
  });
  const freeOnly = filter === "free";
  const showAll = filter === "all";
  const sectionsCollapsible = showAll;
  const effectiveTier = membershipTier ?? (isLoggedIn ? "free" : null);

  const setSection = (key: GuideSectionKey, open: boolean) => {
    setSectionOpen((prev) => ({ ...prev, [key]: open }));
  };

  const kidsAll = guidesForAudience("kids");
  const juniorAll = guidesForAudience("junior");
  const adultAll = LAUNCH_GUIDES;
  const freeLaunchIds = new Set(
    LAUNCH_GUIDES.filter((g) => adultGuideMinTier(g.id) === "free").map((g) => g.id),
  );
  const isSeniorFree = (g: (typeof SENIOR_GUIDE_TEASERS)[number]) =>
    isSeniorGuideFree(g, freeLaunchIds) ||
    seniorGuideMinTier(g.id, g.launchGuideId) === "free";
  const seniorAll = orderedSeniorGuides(SENIOR_GUIDE_TEASERS);

  const kidsParts = partitionFree(kidsAll, (g) => kidsGuideMinTier(g.id) === "free");
  const juniorParts = partitionFree(juniorAll, (g) => kidsGuideMinTier(g.id) === "free");
  const adultParts = partitionFree(adultAll, (g) => adultGuideMinTier(g.id) === "free");
  const seniorParts = partitionFree(seniorAll, isSeniorFree);

  /** Full catalog for the membership table (demographic tabs live on that view). */
  const catalogRows = useMemo(
    () =>
      buildGuideCatalogRows({
        adult: LAUNCH_GUIDES,
        kids: KIDS_GUIDES,
        seniors: SENIOR_GUIDE_TEASERS,
      }).filter((row) => (filter === "free" ? row.minTier === "free" : true)),
    [filter],
  );

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

  // Free filter: only the Free Guides bundle. All / audience: full list, Free → Elite.
  const kidsGuides = freeOnly
    ? []
    : sortByMembershipTier(
        kidsAll,
        (g) => kidsGuideMinTier(g.id),
        (g) => g.title,
      );
  const juniorGuides = freeOnly
    ? []
    : sortByMembershipTier(
        juniorAll,
        (g) => kidsGuideMinTier(g.id),
        (g) => g.title,
      );
  const adultGuides = freeOnly
    ? []
    : sortByMembershipTier(
        adultAll,
        (g) => adultGuideMinTier(g.id),
        (g) => g.name,
      );
  const seniorGuides = freeOnly
    ? []
    : sortByMembershipTier(
        seniorAll,
        (g) => seniorGuideMinTier(g.id, g.launchGuideId),
        (g) => g.title,
      );

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

  /** Compact free openers for the hero panel — fill empty space under audience manuals. */
  const heroFreeOpeners = [
    ...adultParts.free.slice(0, 2).map((g) => ({
      key: `adult-${g.id}`,
      label: g.name,
      meta: "Adult · Free Guide",
      onClick: () => onOpenAdultGuide(g.id),
    })),
    ...seniorParts.free.slice(0, 1).map((g) => ({
      key: `senior-${g.id}`,
      label: g.title,
      meta: "Seniors · Free Guide",
      onClick:
        g.status === "live" && g.launchGuideId
          ? () => onOpenAdultGuide(g.launchGuideId!)
          : onOpenSeniorsGuides,
    })),
    ...kidsParts.free.slice(0, 1).map((g) => ({
      key: `kids-${g.id}`,
      label: g.title,
      meta: "Kids · Free Guide",
      onClick: onOpenKidsGuides,
    })),
    ...juniorParts.free.slice(0, 1).map((g) => ({
      key: `junior-${g.id}`,
      label: g.title,
      meta: "Teens · Free Guide",
      onClick: onOpenJuniorGuides,
    })),
  ];

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
                  <strong>Join to unlock guides by membership level</strong>
                  <span>{FREE_GUIDE_SIGNUP_NOTE}</span>
                </div>
              </div>
            )}
            <div className="free-guides-hero-intro">
              <p>
                Age-ready how-to playbooks for Kids, Teens, Adults, and Seniors. Free Guides need Free
                Membership; others unlock with Starter, Pro, or Elite. Filter the library below.
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
            {heroFreeOpeners.length > 0 && (
              <div className="free-guides-hero-freebies" data-testid="hero-free-openers">
                <h3 className="free-guides-hero-freebies__title">
                  <Unlock size={16} aria-hidden /> Free Guides — with Free Membership
                </h3>
                <p className="free-guides-hero-freebies__note">{FREE_GUIDE_SIGNUP_NOTE}</p>
                <nav className="free-guides-hero-freebies__grid" aria-label="Free guide openers">
                  {heroFreeOpeners.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className="free-guides-hero-freebie"
                      onClick={item.onClick}
                      data-testid={`hero-free-opener-${item.key}`}
                    >
                      <span className="glow-badge free">Free Guide</span>
                      <span className="free-guides-hero-freebie__text">
                        <strong>{item.label}</strong>
                        <small>{item.meta}</small>
                      </span>
                      <ChevronRight size={14} aria-hidden />
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="free-guides-library-bar">
        <p className="free-guides-library-bar__lead">
          Each guide unlocks with a membership level. Free Guides need Free Membership (
          {FREE_GUIDE_SIGNUP_NOTE}).
        </p>
        <div className="free-guides-hero-actions free-guides-library-bar__actions">
          <div className="free-guides-view-toggle" role="group" aria-label="Library layout">
            <button
              type="button"
              className={`glow-chip-btn${libraryView === "cards" ? " is-active" : ""}`}
              aria-pressed={libraryView === "cards"}
              onClick={() => setLibraryView("cards")}
              data-testid="guides-view-cards"
            >
              <LayoutGrid size={16} aria-hidden /> Cards
            </button>
            <button
              type="button"
              className={`glow-chip-btn${libraryView === "table" ? " is-active" : ""}`}
              aria-pressed={libraryView === "table"}
              onClick={() => setLibraryView("table")}
              data-testid="guides-view-table"
            >
              <List size={16} aria-hidden /> By membership
            </button>
          </div>
          {onGoToLogin && (
            <button type="button" className="btn btn-outline" onClick={onGoToLogin}>
              Sign in
            </button>
          )}
          {onGoToJoin && (
            <button
              type="button"
              className="btn btn-join-green"
              onClick={() => onGoToJoin(joinAudience)}
            >
              <UserPlus size={16} /> Join GYSH
            </button>
          )}
        </div>
      </div>

      {libraryView === "table" ? (
        catalogRows.length > 0 ? (
          <GuidesMembershipTable
            rows={catalogRows}
            onOpenAdultGuide={onOpenAdultGuide}
            onOpenKidsGuides={onOpenKidsGuides}
            onOpenJuniorGuides={onOpenJuniorGuides}
            onOpenSeniorsGuides={onOpenSeniorsGuides}
          />
        ) : (
          <div className="glass free-guides-empty">
            <p>No guides match this filter yet.</p>
          </div>
        )
      ) : (
        <>
          {empty && (
            <div className="glass free-guides-empty">
              <p>No guides match this filter yet.</p>
            </div>
          )}

          {showFreeBundle && freeFirstCount > 0 && (
            <GuideLibrarySection
              sectionKey="free"
              title="Free with Free Membership"
              blurb={`Free Guides — ${FREE_GUIDE_SIGNUP_NOTE}.`}
              collapsible={sectionsCollapsible}
              open={sectionOpen.free}
              onOpenChange={setSection}
              testId="free-guides-first"
            >
              <div className="free-guides-grid">
                {freeFirstBundle.adult.map((g) => {
                  const minTier = adultGuideMinTier(g.id);
                  const access = resolveGuideAccess({
                    isMember: isLoggedIn,
                    membershipTier: effectiveTier,
                    minTier,
                  });
                  return (
                    <article key={`free-adult-${g.id}`} className="glass free-guide-card is-free">
                      <div className="free-guide-card-head">
                        <div>
                          <div className="free-guide-card-badges">
                            <span className="glow-badge free">Free Guide</span>
                            <MembershipLockBadge
                              minTier={minTier}
                              unlocked={access.unlocked}
                              data-testid={`guide-lock-badge-${g.id}`}
                            />
                          </div>
                          <h3>{g.name}</h3>
                          <p className="free-guide-tier-note">{guideTierMembershipNote(minTier)}</p>
                        </div>
                        {access.unlocked ? (
                          <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                        ) : (
                          <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
                        )}
                      </div>
                      <p className="free-guide-summary">{g.peek}</p>
                      {access.unlocked ? (
                        <button
                          type="button"
                          className="glow-chip-btn"
                          onClick={() => onOpenAdultGuide(g.id)}
                        >
                          Open guide
                        </button>
                      ) : (
                        <div className="free-guide-lock-cta">
                          <Lock size={16} />
                          <JoinToUnlockCta
                            access={access}
                            onJoin={onGoToJoin ? () => onGoToJoin("adult") : undefined}
                            onUpgrade={onGoToJoin ? () => onGoToJoin("adult") : undefined}
                          />
                        </div>
                      )}
                    </article>
                  );
                })}
                {freeFirstBundle.senior.map((g) => {
                  const minTier = seniorGuideMinTier(g.id, g.launchGuideId);
                  const access = resolveGuideAccess({
                    isMember: isLoggedIn,
                    membershipTier: effectiveTier,
                    minTier,
                  });
                  const openLive = g.status === "live" && !!g.launchGuideId;
                  return (
                    <article key={`free-senior-${g.id}`} className="glass free-guide-card is-free">
                      <div className="free-guide-card-head">
                        <div>
                          <div className="free-guide-card-badges">
                            <span className="glow-badge free">Free Guide</span>
                            <MembershipLockBadge
                              minTier={minTier}
                              unlocked={access.unlocked}
                              data-testid={`guide-lock-badge-${g.id}`}
                            />
                          </div>
                          <h3>{g.title}</h3>
                          <p className="free-guide-tier-note">{guideTierMembershipNote(minTier)}</p>
                        </div>
                        {access.unlocked ? (
                          <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                        ) : (
                          <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
                        )}
                      </div>
                      <p className="free-guide-summary">{g.blurb}</p>
                      {access.unlocked ? (
                        <button
                          type="button"
                          className="glow-chip-btn"
                          onClick={
                            openLive ? () => onOpenAdultGuide(g.launchGuideId!) : onOpenSeniorsGuides
                          }
                        >
                          {openLive ? "Open guide" : "View in Seniors"}
                        </button>
                      ) : (
                        <div className="free-guide-lock-cta">
                          <Lock size={16} />
                          <JoinToUnlockCta
                            access={access}
                            onJoin={onGoToJoin ? () => onGoToJoin("senior") : undefined}
                            onUpgrade={onGoToJoin ? () => onGoToJoin("senior") : undefined}
                          />
                        </div>
                      )}
                    </article>
                  );
                })}
                {freeFirstBundle.junior.map((g) => (
                  <FreeKidsGuideCard
                    key={`free-junior-${g.id}`}
                    guide={g}
                    isMember={isLoggedIn}
                    membershipTier={effectiveTier}
                    onJoinCta={onGoToJoin ? () => onGoToJoin("junior") : undefined}
                  />
                ))}
                {freeFirstBundle.kids.map((g) => (
                  <FreeKidsGuideCard
                    key={`free-kids-${g.id}`}
                    guide={g}
                    isMember={isLoggedIn}
                    membershipTier={effectiveTier}
                    onJoinCta={onGoToJoin ? () => onGoToJoin("kids") : undefined}
                  />
                ))}
              </div>
            </GuideLibrarySection>
          )}

          {showAdult && (adultGuides.length > 0 || seniorGuides.length > 0) && (
            <GuideLibrarySection
              sectionKey="adult"
              title="GYSH Adult / Senior Guides"
              blurb="Launch guides for adults and seniors — each card shows the membership level required."
              collapsible={sectionsCollapsible}
              open={sectionOpen.adult}
              onOpenChange={setSection}
            >
              {adultGuides.length > 0 && (
                <>
                  <h4 className="free-guides-subsection">Adult launch guides</h4>
                  <div className="free-guides-grid">
                    {adultGuides.map((g) => {
                      const minTier = adultGuideMinTier(g.id);
                      const access = resolveGuideAccess({
                        isMember: isLoggedIn,
                        membershipTier: effectiveTier,
                        minTier,
                      });
                      const isFreePlan = minTier === "free";
                      return (
                        <article
                          key={g.id}
                          className={`glass free-guide-card ${isFreePlan ? "is-free" : "is-gated"}`}
                        >
                          <div className="free-guide-card-head">
                            <div>
                              <div className="free-guide-card-badges">
                                <span className={`glow-badge ${isFreePlan ? "free" : "pink"}`}>
                                  {guideTierBadgeLabel(minTier)}
                                </span>
                                <MembershipLockBadge
                                  minTier={minTier}
                                  unlocked={access.unlocked}
                                  data-testid={`guide-lock-badge-${g.id}`}
                                />
                              </div>
                              <h3>{g.name}</h3>
                              <p className="free-guide-tier-note">
                                {guideTierMembershipNote(minTier)}
                              </p>
                            </div>
                            {access.unlocked ? (
                              <Unlock
                                size={18}
                                style={{ color: "var(--accent-emerald)", flexShrink: 0 }}
                              />
                            ) : (
                              <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
                            )}
                          </div>
                          <p className="free-guide-summary">{g.peek}</p>
                          {access.unlocked ? (
                            <button
                              type="button"
                              className="glow-chip-btn"
                              onClick={() => onOpenAdultGuide(g.id)}
                            >
                              Open guide
                            </button>
                          ) : (
                            <div className="free-guide-lock-cta">
                              <Lock size={16} />
                              <JoinToUnlockCta
                                access={access}
                                onJoin={onGoToJoin ? () => onGoToJoin("adult") : undefined}
                                onUpgrade={onGoToJoin ? () => onGoToJoin("adult") : undefined}
                              />
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
                      const comingSoon = g.status === "coming_soon";
                      const minTier = seniorGuideMinTier(g.id, g.launchGuideId);
                      const access = resolveGuideAccess({
                        isMember: comingSoon ? false : isLoggedIn,
                        membershipTier: effectiveTier,
                        minTier,
                      });
                      const isFreePlan = minTier === "free";
                      return (
                        <article
                          key={g.id}
                          className={`glass free-guide-card ${
                            comingSoon ? "is-gated" : isFreePlan ? "is-free" : "is-gated"
                          }`}
                        >
                          <div className="free-guide-card-head">
                            <div>
                              <div className="free-guide-card-badges">
                                <span
                                  className={`glow-badge ${
                                    comingSoon ? "amber" : isFreePlan ? "free" : "pink"
                                  }`}
                                >
                                  {comingSoon ? "Coming soon" : guideTierBadgeLabel(minTier)}
                                </span>
                                {!comingSoon ? (
                                  <MembershipLockBadge
                                    minTier={minTier}
                                    unlocked={access.unlocked}
                                    data-testid={`guide-lock-badge-${g.id}`}
                                  />
                                ) : null}
                              </div>
                              <h3>{g.title}</h3>
                              {!comingSoon && (
                                <p className="free-guide-tier-note">
                                  {guideTierMembershipNote(minTier)}
                                </p>
                              )}
                            </div>
                            {!comingSoon && access.unlocked ? (
                              <Unlock
                                size={18}
                                style={{ color: "var(--accent-emerald)", flexShrink: 0 }}
                              />
                            ) : (
                              <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
                            )}
                          </div>
                          <p className="free-guide-summary">{g.blurb}</p>
                          {comingSoon ? (
                            <button
                              type="button"
                              className="glow-chip-btn"
                              onClick={onOpenSeniorsGuides}
                            >
                              See Seniors page
                            </button>
                          ) : access.unlocked ? (
                            <button
                              type="button"
                              className="glow-chip-btn"
                              onClick={
                                g.launchGuideId
                                  ? () => onOpenAdultGuide(g.launchGuideId!)
                                  : onOpenSeniorsGuides
                              }
                            >
                              {g.launchGuideId ? "Open guide" : "View in Seniors"}
                            </button>
                          ) : (
                            <div className="free-guide-lock-cta">
                              <Lock size={16} />
                              <JoinToUnlockCta
                                access={access}
                                onJoin={onGoToJoin ? () => onGoToJoin("senior") : undefined}
                                onUpgrade={onGoToJoin ? () => onGoToJoin("senior") : undefined}
                              />
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </GuideLibrarySection>
          )}

          {showJunior && juniorGuides.length > 0 && (
            <GuideLibrarySection
              sectionKey="junior"
              title="GYSH Teens Guides"
              blurb="Ages 13–17 — Free with Free Membership, or Starter / Pro / Elite as labeled."
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
                    membershipTier={effectiveTier}
                    onJoinCta={onGoToJoin ? () => onGoToJoin("junior") : undefined}
                  />
                ))}
              </div>
              <button
                type="button"
                className="btn btn-outline free-guides-section-link"
                onClick={onOpenJuniorGuides}
              >
                Open Teens Side Hustle Guides
              </button>
            </GuideLibrarySection>
          )}

          {showKids && kidsGuides.length > 0 && (
            <GuideLibrarySection
              sectionKey="kids"
              title="GYSH Kids Guides"
              blurb="Ages 4–12 — Free with Free Membership, or Starter / Pro / Elite as labeled."
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
                    membershipTier={effectiveTier}
                    onJoinCta={onGoToJoin ? () => onGoToJoin("kids") : undefined}
                  />
                ))}
              </div>
              <button
                type="button"
                className="btn btn-outline free-guides-section-link"
                onClick={onOpenKidsGuides}
              >
                Open Kids Corner Guides
              </button>
            </GuideLibrarySection>
          )}
        </>
      )}
    </div>
  );
}
