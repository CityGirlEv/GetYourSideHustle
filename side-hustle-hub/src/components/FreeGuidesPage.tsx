import { useEffect, useState, type ReactNode } from "react";
import {
  ChevronsDownUp,
  ChevronsUpDown,
  Clock,
  LayoutGrid,
  List,
  Lock,
  Search,
  Unlock,
  UserPlus,
} from "lucide-react";
import { guidesForAudience, type KidsGuide } from "../lib/kids-guides";
import { LAUNCH_GUIDES } from "../lib/launch-guides";
import {
  hustleById,
  hustleCardPeek,
  guideSideHustleDescription,
  type HustleAgeGroup,
} from "../lib/side-hustle-catalog";
import {
  SENIOR_GUIDE_TEASERS,
  orderedSeniorGuides,
} from "../lib/seniors-content";
import {
  MARKETING_GUIDES,
  type MarketingGuideId,
} from "../lib/marketing-guides";
import type { AudienceGroup, TierId } from "../lib/membership";
import {
  COMING_SOON_NOT_UNLOCKED_NOTE,
  FREE_GUIDE_SIGNUP_NOTE,
  guideTierMembershipNote,
  guideTierSortRank,
  resolveGuideAccess,
  tierDisplayName,
  type GuideMinTier,
} from "../lib/guide-access";
import { formatGuideNumber, guideNumberParenthetical } from "../lib/guide-numbers";
import {
  guideMatchesLibrarySearch,
  sideHustleLibraryPageTitle,
} from "../lib/guide-library-search";
import { defaultGuideLibraryLayout, readNarrowViewport } from "../lib/narrow-viewport";
import {
  guideIdsForLibraryAudience,
  libraryGuideDisplayName,
  libraryMinTierForAge,
  uniqueGuideLibraryCount,
} from "../lib/guide-library-pool";
import { presentableGuideTitle } from "../lib/guide-title";
import {
  applyLiveGuideLibraryCountsFromStates,
  freeMembershipGuidesTag,
  useLiveGuideLibraryCounts,
} from "../lib/guide-library-live-counts";
import { countGuideLibraryByStatus } from "../lib/guide-status-counts";
import guidesLibraryHero from "../assets/guides-library-hero.png";
import { ShowHideChevron } from "./ShowHideToggle";
import { JoinToUnlockCta } from "./JoinToUnlockCta";
import { OpenGuideButton } from "./OpenGuideButton";
import { GuideMembershipBadges } from "./GuideMembershipBadges";
import { AdminViewOnlyBadge } from "./AdminViewOnlyBadge";
import { ComplimentaryGiftNote } from "./ComplimentaryGiftNote";
import { guideLibraryPromoCallout } from "../lib/guide-library-promo";
import {
  filterGuidesByExactMembershipTier,
  filterGuidesByMembershipSelection,
  exactMembershipTabCounts,
  tierGroupOpenState,
  toggleLibraryFilterSelection,
  uniqueGuidesByLowestTier,
  sortGuidesFreeFirstThenAlphabetical,
  sortGuidesForMembershipTab,
  clampMembershipFiltersForAges,
  DEFAULT_LIBRARY_MEMBERSHIP_FILTERS,
  DEFAULT_LIBRARY_TIER_GROUPS_OPEN,
} from "../lib/guide-list-expand";
import {
  filterGuidesForViewer,
  getGuideVisibilityStatus,
  type GuideVisibilityStatus,
} from "../lib/guide-catalog-state";
import { fetchGuideCatalogStates } from "../lib/guide-catalog-client";
import {
  defaultLibraryStatusFilters,
  guideMatchesAnyStatusFilter,
  guideNavFilterIsAll,
  type GuideNavStatusFilter,
} from "../lib/guide-nav-filters";

type GuideFilter = "all" | "adult" | "kids" | "junior" | "senior";
type DemoTierTab = "all" | "free" | "starter" | "pro" | "elite";
type StatusFilterTab = GuideNavStatusFilter;
type LibraryLayout = "grid" | "list";

type FreeGuidesPageProps = {
  isLoggedIn?: boolean;
  membershipTier?: string | null;
  /** Admin self-profile: unlock every live guide. */
  isAdmin?: boolean;
  /** Admin or QA — see unpublished guides + status filters (Active / Pending / In Review / Inactive). */
  canReviewGuides?: boolean;
  onGoToJoin?: (audience?: AudienceGroup, focusTier?: TierId) => void;
  onGoToLogin?: () => void;
  onOpenAdultGuide: (hustleId: string) => void;
  onOpenKidsGuides: () => void;
  onOpenJuniorGuides: () => void;
  onOpenSeniorsGuides: () => void;
  onOpenManual?: (id: MarketingGuideId) => void;
};

const FILTERS: { id: GuideFilter; label: string }[] = [
  { id: "all", label: "Show All" },
  { id: "kids", label: "Kids" },
  { id: "junior", label: "Teens" },
  { id: "adult", label: "Adults" },
  { id: "senior", label: "Seniors" },
];

const DEMO_TIER_TABS: { id: DemoTierTab; label: string }[] = [
  { id: "all", label: "Show All" },
  { id: "free", label: "Free" },
  { id: "starter", label: "Starter" },
  { id: "pro", label: "Pro" },
  { id: "elite", label: "Elite" },
];

const STATUS_FILTER_TABS: { id: StatusFilterTab; label: string }[] = [
  { id: "all", label: "Show All" },
  { id: "active", label: "Active" },
  { id: "not_reviewed", label: "Not Reviewed" },
  { id: "reviewed", label: "Reviewed" },
  { id: "pending", label: "Pending / Needs Further Review" },
  { id: "fixed_rereview", label: "Fixed/Re-Review" },
  { id: "reviewed_by_qa", label: "Reviewed by QA / No Changes" },
  { id: "reviewed_by_dev", label: "Reviewed by Dev" },
  { id: "inactive", label: "Inactive" },
];

/** Sort guides: Free first (A–Z), then all other memberships (A–Z). */
function sortByMembershipTier<T>(
  guides: T[],
  minTierOf: (g: T) => GuideMinTier,
  nameOf: (g: T) => string,
): T[] {
  return sortGuidesFreeFirstThenAlphabetical(guides, minTierOf, nameOf);
}

type GuideSectionKey = "adult" | "kids" | "junior" | "senior" | "all";

function groupGuidesByTier<T>(
  guides: T[],
  minTierOf: (g: T) => GuideMinTier,
  nameOf?: (g: T) => string,
  opts?: { includeEmpty?: boolean },
): { tier: GuideMinTier; label: string; guides: T[] }[] {
  const groups = (["free", "starter", "pro", "elite"] as const).map((tier) => {
    let tierGuides = guides.filter((g) => minTierOf(g) === tier);
    if (nameOf) {
      tierGuides = [...tierGuides].sort((a, b) =>
        nameOf(a).localeCompare(nameOf(b), undefined, { sensitivity: "base" }),
      );
    }
    return {
      tier,
      label: tier === "free" ? "Free" : tierDisplayName(tier),
      guides: tierGuides,
    };
  });
  return opts?.includeEmpty ? groups : groups.filter((group) => group.guides.length > 0);
}

type ListExpandSignal = { open: boolean; nonce: number };

function GuidePromoCallout({ guideId }: { guideId: string }) {
  const promo = guideLibraryPromoCallout(guideId);
  if (!promo) return null;
  return (
    <p className="free-guide-promo-callout" data-testid={`guide-promo-${guideId}`} role="note">
      <span className="glow-badge amber">Highlight</span>
      <span>{promo}</span>
    </p>
  );
}

function TierGroupedGuideList<T>({
  guides,
  minTierOf,
  nameOf,
  testIdPrefix,
  renderGuides,
  expandSignal,
  navStyle = "tabs",
  membershipTab,
  onMembershipTabChange,
}: {
  guides: T[];
  minTierOf: (g: T) => GuideMinTier;
  /** Display title for Free-first A–Z sorting. */
  nameOf?: (g: T) => string;
  testIdPrefix: string;
  renderGuides: (guides: T[]) => ReactNode;
  expandSignal?: ListExpandSignal;
  /**
   * Tier nav: compact one-row tabs, stacked accordion, or panel-only
   * (no second membership row — hero filters already control the tier).
   */
  navStyle?: "tabs" | "accordion" | "panel";
  /** Controlled membership filter (keeps Free/Starter/Pro/Elite tabs mounted). */
  membershipTab?: DemoTierTab;
  onMembershipTabChange?: (tab: DemoTierTab) => void;
}) {
  const groups = groupGuidesByTier(guides, minTierOf, nameOf);
  const allTier = groupGuidesByTier(guides, minTierOf, nameOf, { includeEmpty: true });
  type TierNavTab = DemoTierTab;
  const [openTiers, setOpenTiers] = useState<Record<GuideMinTier, boolean>>(() => ({
    free: true,
    starter: true,
    pro: true,
    elite: true,
  }));
  const [internalTab, setInternalTab] = useState<TierNavTab>("all");
  const activeTab = membershipTab ?? internalTab;
  const setActiveTab = (tab: TierNavTab) => {
    onMembershipTabChange?.(tab);
    if (membershipTab === undefined) setInternalTab(tab);
  };

  useEffect(() => {
    if (!expandSignal) return;
    if (navStyle === "accordion" || activeTab === "all") {
      setOpenTiers(tierGroupOpenState(expandSignal.open));
    }
  }, [expandSignal?.nonce, expandSignal?.open, navStyle, activeTab]);

  const renderAccordionGroups = () => (
    <div className="free-guides-tier-groups" data-testid={`${testIdPrefix}-tier-groups-accordion`}>
      {groups.map((group) => {
        const open = openTiers[group.tier] !== false;
        const accordionPanelId = `${testIdPrefix}-tier-panel-${group.tier}`;
        return (
          <div
            key={group.tier}
            className="free-guides-tier-group"
            data-testid={`${testIdPrefix}-tier-group-${group.tier}`}
          >
            <button
              type="button"
              className="free-guides-tier-group__toggle"
              aria-expanded={open}
              aria-controls={accordionPanelId}
              data-testid={`${testIdPrefix}-tier-toggle-${group.tier}`}
              onClick={() => setOpenTiers((prev) => ({ ...prev, [group.tier]: !open }))}
            >
              <ShowHideChevron open={open} size={18} />
              <span>
                {group.label} <em>({group.guides.length})</em>
              </span>
            </button>
            {open ? (
              <div id={accordionPanelId} className="free-guides-tier-group__body">
                {renderGuides(group.guides)}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  if (navStyle === "tabs" || navStyle === "panel") {
    if (!guides.length && !allTier.length) return null;
    const showAll = activeTab === "all";
    const filteredPanel = showAll
      ? guides
      : filterGuidesByExactMembershipTier(guides, activeTab, minTierOf);
    const sortedPanel = nameOf
      ? sortGuidesForMembershipTab(activeTab, filteredPanel, minTierOf, nameOf)
      : [...filteredPanel];
    const tabCounts = exactMembershipTabCounts(guides, minTierOf);
    const panelId = showAll
      ? `${testIdPrefix}-tier-panel-all`
      : `${testIdPrefix}-tier-panel-${activeTab}`;
    const tabId = showAll
      ? `${testIdPrefix}-tier-tab-all`
      : `${testIdPrefix}-tier-tab-${activeTab}`;
    const panelBody =
      showAll ? (
        groups.length > 0 ? (
          renderAccordionGroups()
        ) : (
          <div className="free-guides-tier-group__body">
            <p className="free-guides-empty-tier">No guides in this view yet.</p>
          </div>
        )
      ) : (
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={navStyle === "panel" ? "free-guides-membership-levels-label" : tabId}
          className="free-guides-tier-group__body"
          data-testid={`${testIdPrefix}-tier-group-${activeTab}`}
        >
          {sortedPanel.length > 0 ? (
            renderGuides(sortedPanel)
          ) : (
            <p className="free-guides-empty-tier">
              No {activeTab === "free" ? "Free" : activeTab} guides in this view yet.
            </p>
          )}
        </div>
      );

    if (navStyle === "panel") {
      return (
        <div
          className="free-guides-tier-groups free-guides-tier-groups--panel"
          data-testid={`${testIdPrefix}-tier-groups`}
        >
          {panelBody}
        </div>
      );
    }

    return (
      <div className="free-guides-tier-groups free-guides-tier-groups--tabs" data-testid={`${testIdPrefix}-tier-groups`}>
        <div
          className="free-guides-tier-tabs"
          role="tablist"
          aria-label="Membership tier"
          data-testid={`${testIdPrefix}-tier-tabs`}
        >
          <button
            type="button"
            role="tab"
            id={`${testIdPrefix}-tier-tab-all`}
            aria-selected={showAll}
            aria-controls={`${testIdPrefix}-tier-panel-all`}
            tabIndex={showAll ? 0 : -1}
            data-testid={`${testIdPrefix}-tier-toggle-all`}
            className={`free-guides-tier-tab is-tier-all${showAll ? " is-active" : ""}`}
            data-tier="all"
            onClick={() => setActiveTab("all")}
          >
            <span>Show All</span>
            <span className="free-guides-tab-count">{tabCounts.all}</span>
          </button>
          {allTier.map((group) => {
            const selectedTab = !showAll && group.tier === activeTab;
            return (
              <button
                key={group.tier}
                type="button"
                role="tab"
                id={`${testIdPrefix}-tier-tab-${group.tier}`}
                aria-selected={selectedTab}
                aria-controls={`${testIdPrefix}-tier-panel-${group.tier}`}
                tabIndex={selectedTab ? 0 : -1}
                data-testid={`${testIdPrefix}-tier-toggle-${group.tier}`}
                className={`free-guides-tier-tab is-tier-${group.tier}${selectedTab ? " is-active" : ""}`}
                data-tier={group.tier}
                onClick={() => setActiveTab(group.tier)}
              >
                <span>{group.label}</span>
                <span className="free-guides-tab-count">{tabCounts[group.tier]}</span>
              </button>
            );
          })}
        </div>
        {panelBody}
      </div>
    );
  }

  return renderAccordionGroups();
}

function GuideTabPanel({
  sectionKey,
  blurb,
  testId,
  children,
}: {
  sectionKey: GuideSectionKey;
  blurb?: string;
  testId?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="free-guides-section free-guides-tab-panel"
      data-testid={testId ?? `free-guides-tab-panel-${sectionKey}`}
      role="tabpanel"
      aria-labelledby={`free-guides-filter-${sectionKey}`}
    >
      {blurb ? (
        <header className="free-guides-section-head">
          <p>{blurb}</p>
        </header>
      ) : null}
      <div className="free-guides-section-body">{children}</div>
    </section>
  );
}


/** Membership badge on line 1; guide Name (#000) on line 2 — shared by all library cards. */
function FreeGuideCardTitle({
  guideId,
  title,
  minTier,
  comingSoon = false,
}: {
  guideId: string;
  title: string;
  minTier?: GuideMinTier;
  comingSoon?: boolean;
}) {
  const numberParen = guideNumberParenthetical(guideId);
  return (
    <div className="free-guide-card-title-block">
      <div className="free-guide-card-badges">
        {comingSoon ? (
          <span className="glow-badge amber">Coming soon</span>
        ) : minTier ? (
          <GuideMembershipBadges minTier={minTier} data-testid={`guide-memberships-${guideId}`} />
        ) : null}
      </div>
      <h3 className="free-guide-card-title">
        <span className="free-guide-card-title-text">{presentableGuideTitle(guideId, title)}</span>
        {numberParen ? (
          <span className="free-guide-number" data-testid={`guide-number-${guideId}`}>
            {" "}
            {numberParen}
          </span>
        ) : null}
      </h3>
    </div>
  );
}

function FreeKidsGuideCard({
  guide,
  isMember,
  membershipTier,
  isAdmin = false,
  staffCatalog = false,
  guideStatus = "inactive",
  minTier: minTierProp,
  onJoinCta,
  onOpenGuide,
}: {
  guide: KidsGuide;
  isMember: boolean;
  membershipTier?: string | null;
  isAdmin?: boolean;
  /** Admin or QA — status chip styling in the library list. */
  staffCatalog?: boolean;
  guideStatus?: GuideVisibilityStatus;
  /** Catalog-aware membership floor (falls back to code defaults when omitted). */
  minTier?: GuideMinTier;
  /** Join membership for this guide’s audience (kids / teens) — optional required tier for Upgrade focus. */
  onJoinCta?: (focusTier?: TierId) => void;
  /** Open the full guide (detail view) — no inline steps on the library card. */
  onOpenGuide: () => void;
}) {
  const minTier: GuideMinTier =
    minTierProp ??
    (guide.audience === "junior"
      ? libraryMinTierForAge(guide.id, "junior")
      : libraryMinTierForAge(guide.id, "kids"));
  const access = resolveGuideAccess({
    isMember,
    membershipTier,
    minTier,
    isAdmin,
    guideId: guide.id,
  });
  const isFreePlan = minTier === "free";
  const showStatus = staffCatalog || isAdmin;

  return (
    <article
      className={`glass free-guide-card ${isFreePlan ? "is-free" : "is-gated"}${
        showStatus && guideStatus !== "active" ? " is-guide-inactive" : ""
      }${showStatus && guideStatus === "pending" ? " is-guide-pending" : ""}${
        showStatus && guideStatus === "fixed_rereview" ? " is-guide-fixed-rereview" : ""
      }${showStatus && guideStatus === "reviewed_by_qa" ? " is-guide-reviewed-by-qa" : ""
      }${showStatus && guideStatus === "reviewed_by_dev" ? " is-guide-reviewed-by-dev" : ""}`}
    >
      <div className="free-guide-card-head">
        <div>
          <FreeGuideCardTitle guideId={guide.id} title={guide.title} minTier={minTier} />
          {access.adminViewOnly ? (
            <div className="free-guide-card-badges">
              <AdminViewOnlyBadge data-testid={`admin-view-only-${guide.id}`} />
            </div>
          ) : null}
          <p className="free-guide-tier-note">{guideTierMembershipNote(minTier)}</p>
          {access.unlocked ? <ComplimentaryGiftNote guideId={guide.id} minTier={minTier} /> : null}
        </div>
        {access.unlocked ? (
          <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
        ) : (
          <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
        )}
      </div>
      <p className="free-guide-summary">{guide.summary}</p>
      <GuidePromoCallout guideId={guide.id} />

      {access.unlocked ? (
        <OpenGuideButton minTier={minTier} onClick={onOpenGuide} />
      ) : (
        <div className="free-guide-lock-cta">
          <Lock size={16} />
          <JoinToUnlockCta
            access={access}
            onJoin={onJoinCta ? () => onJoinCta(minTier) : undefined}
            onUpgrade={onJoinCta ? () => onJoinCta(minTier) : undefined}
          />
        </div>
      )}
    </article>
  );
}

export function FreeGuidesPage({
  isLoggedIn = false,
  membershipTier = null,
  isAdmin = false,
  canReviewGuides = false,
  onGoToJoin,
  onGoToLogin: _onGoToLogin,
  onOpenAdultGuide,
  onOpenKidsGuides,
  onOpenJuniorGuides,
  onOpenSeniorsGuides,
  onOpenManual,
}: FreeGuidesPageProps) {
  void _onGoToLogin;
  const liveGuideCounts = useLiveGuideLibraryCounts();
  /** Live D1 catalog (membership + age patches) — same cache Admin Update writes. */
  const catalogStates = liveGuideCounts.states;
  const [ageFilters, setAgeFilters] = useState<GuideFilter[]>(["all"]);
  const [membershipFilters, setMembershipFilters] = useState<DemoTierTab[]>(() => [
    ...DEFAULT_LIBRARY_MEMBERSHIP_FILTERS,
  ]);
  const [statusFilters, setStatusFilters] = useState<StatusFilterTab[]>(() =>
    defaultLibraryStatusFilters(isAdmin || canReviewGuides),
  );
  const [libraryLayout, setLibraryLayout] = useState<LibraryLayout>(() =>
    defaultGuideLibraryLayout(readNarrowViewport()),
  );
  const [listExpand, setListExpand] = useState<ListExpandSignal>({
    open: DEFAULT_LIBRARY_TIER_GROUPS_OPEN,
    nonce: 0,
  });
  const [librarySearch, setLibrarySearch] = useState("");
  /** Admin or QA — status filters + unpublished guides in the library. */
  const staffCatalog = isAdmin || canReviewGuides;
  const libraryTitle = sideHustleLibraryPageTitle({ isAdmin });
  const bumpListExpand = (open: boolean) =>
    setListExpand((prev) => ({ open, nonce: prev.nonce + 1 }));

  const matchesLibrarySearch = (id: string, name: string, peek?: string) =>
    guideMatchesLibrarySearch(
      { id, name, peek, guideNumber: formatGuideNumber(id) },
      librarySearch,
    );

  useEffect(() => {
    let cancelled = false;
    fetchGuideCatalogStates()
      .then((states) => {
        if (cancelled) return;
        applyLiveGuideLibraryCountsFromStates(states);
      })
      .catch(() => {
        /* keep env defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const forViewer = <T extends { id: string }>(list: T[]) =>
    filterGuidesForViewer(list, catalogStates, { isAdmin: staffCatalog });

  const byStatus = <T extends { id: string }>(list: T[]) => {
    if (!staffCatalog || guideNavFilterIsAll(statusFilters)) return list;
    return list.filter((g) =>
      guideMatchesAnyStatusFilter(getGuideVisibilityStatus(g.id, catalogStates), statusFilters),
    );
  };

  const guideStatusOf = (guideId: string) => getGuideVisibilityStatus(guideId, catalogStates);

  const effectiveTier = membershipTier ?? (isLoggedIn ? "free" : null);

  const openKidsLibraryGuide = (guide: KidsGuide) => {
    // Always open the real launch/library guide detail (membership-gated there).
    // Do not bounce to Kids Corner / Teens hub — those are browse surfaces, not the guide.
    onOpenAdultGuide(guide.id);
  };

  const toggleAgeFilter = (next: GuideFilter) => {
    setAgeFilters((prev) => {
      const ages = toggleLibraryFilterSelection(prev, next, "all");
      setMembershipFilters((mem) => clampMembershipFiltersForAges(mem, ages));
      return ages;
    });
    setLibraryLayout("list");
  };

  const toggleMembershipFilter = (next: DemoTierTab) => {
    setMembershipFilters((prev) => {
      const nextMem = toggleLibraryFilterSelection(prev, next, "all");
      return clampMembershipFiltersForAges(nextMem, ageFilters);
    });
    setLibraryLayout("list");
  };

  const toggleStatusFilter = (next: StatusFilterTab) => {
    setStatusFilters((prev) => toggleLibraryFilterSelection(prev, next, "all"));
  };

  /** Single tab passed into tier-group UI when only one membership is selected. */
  const membershipTab: DemoTierTab =
    membershipFilters.length === 1 ? membershipFilters[0]! : "all";

  /** Tier-group tabs inside a section set a single membership filter. */
  const setMembershipTab = (next: DemoTierTab) => {
    setMembershipFilters([next]);
  };

  const kidsAll = guidesForAudience("kids");
  const juniorAll = guidesForAudience("junior");
  const seniorAll = orderedSeniorGuides(SENIOR_GUIDE_TEASERS);

  const guideDisplayName = (id: string) =>
    presentableGuideTitle(
      id,
      catalogStates[id]?.patch?.name?.trim() ||
        libraryGuideDisplayName(id) ||
        hustleById(id)?.name ||
        LAUNCH_GUIDES.find((g) => g.id === id)?.name,
    );

  const guidePeek = (id: string) =>
    guideSideHustleDescription(id) ||
    LAUNCH_GUIDES.find((g) => g.id === id)?.peek ||
    (hustleById(id) ? hustleCardPeek(hustleById(id)!) : "") ||
    "";

  /** Kids/Teens card row from catalog id (respects Admin age patches). */
  const toKidsGuide = (id: string, audience: "kids" | "junior"): KidsGuide => {
    const existing =
      audience === "junior"
        ? juniorAll.find((g) => g.id === id)
        : kidsAll.find((g) => g.id === id);
    if (existing) {
      return {
        ...existing,
        title: guideDisplayName(id) || existing.title,
        free: libraryMinTierForAge(id, audience, catalogStates) === "free",
      };
    }
    return {
      id,
      audience,
      title: guideDisplayName(id),
      theme: "savings",
      free: libraryMinTierForAge(id, audience, catalogStates) === "free",
      summary: guidePeek(id),
      previewCount: 0,
      steps: [],
      parentTip: "",
    };
  };

  const showAllAges = guideNavFilterIsAll(ageFilters);
  /** Single-age lanes only — Age Show All uses one unique combined list (no repeated Free/Starter/Pro/Elite). */
  const showAdult = showAllAges ? false : ageFilters.includes("adult");
  const showSenior = showAllAges ? false : ageFilters.includes("senior");
  const showKids = showAllAges ? false : ageFilters.includes("kids");
  const showJunior = showAllAges ? false : ageFilters.includes("junior");

  /** Library rows for one age — Admin `patch.audiences` overrides code catalog. */
  const launchForAge = (age: HustleAgeGroup) =>
    guideIdsForLibraryAudience(age, catalogStates).map((id) => ({
      id,
      name: guideDisplayName(id),
      peek: guidePeek(id),
    }));

  const kidsGuidesAll = forViewer(
    sortByMembershipTier(
      guideIdsForLibraryAudience("kids", catalogStates).map((id) => toKidsGuide(id, "kids")),
      (g) => libraryMinTierForAge(g.id, "kids", catalogStates),
      (g) => g.title,
    ),
  );
  const juniorGuidesAll = forViewer(
    sortByMembershipTier(
      guideIdsForLibraryAudience("junior", catalogStates).map((id) =>
        toKidsGuide(id, "junior"),
      ),
      (g) => libraryMinTierForAge(g.id, "junior", catalogStates),
      (g) => g.title,
    ),
  );
  const adultGuidesAll = forViewer(
    sortByMembershipTier(
      launchForAge("adult"),
      (g) => libraryMinTierForAge(g.id, "adult", catalogStates),
      (g) => g.name,
    ),
  );
  const seniorGuidesAll = forViewer(
    sortByMembershipTier(
      (() => {
        const launchRows = launchForAge("senior").map((g) => ({
          id: g.id,
          title: g.name,
          blurb: g.peek,
          status: "live" as const,
          launchGuideId: g.id,
        }));
        const seen = new Set(launchRows.map((g) => g.id));
        // Keep coming-soon teasers only when still in the senior audience after Admin patches.
        const teasers = seniorAll.filter((g) => {
          if (g.launchGuideId && seen.has(g.launchGuideId)) return false;
          if (seen.has(g.id)) return false;
          // Respect Admin age patches for live teasers; always keep coming-soon rows visible to staff.
          if (g.status === "coming_soon") return true;
          return guideIdsForLibraryAudience("senior", catalogStates).includes(g.id) ||
            (g.launchGuideId
              ? guideIdsForLibraryAudience("senior", catalogStates).includes(g.launchGuideId)
              : false);
        });
        return [...launchRows, ...teasers];
      })(),
      (g) =>
        libraryMinTierForAge(
          g.id,
          "senior",
          catalogStates,
          "launchGuideId" in g ? g.launchGuideId : undefined,
        ),
      (g) => g.title,
    ),
  );

  const kidsEffectiveTier = (g: KidsGuide): GuideMinTier =>
    libraryMinTierForAge(g.id, "kids", catalogStates);
  const juniorEffectiveTier = (g: KidsGuide): GuideMinTier =>
    libraryMinTierForAge(g.id, "junior", catalogStates);
  const adultEffectiveTier = (g: { id: string }): GuideMinTier =>
    libraryMinTierForAge(g.id, "adult", catalogStates);
  const seniorEffectiveTier = (g: (typeof seniorGuidesAll)[number]): GuideMinTier =>
    libraryMinTierForAge(
      g.id,
      "senior",
      catalogStates,
      "launchGuideId" in g ? g.launchGuideId : undefined,
    );

  const filterByDemoTier = <T,>(
    guides: T[],
    minTierOf: (g: T) => GuideMinTier,
    nameOf: (g: T) => string,
  ): T[] => {
    const filtered = filterGuidesByMembershipSelection(guides, membershipFilters, minTierOf);
    if (membershipFilters.length === 1) {
      return sortGuidesForMembershipTab(membershipFilters[0]!, filtered, minTierOf, nameOf);
    }
    return sortByMembershipTier(filtered, minTierOf, nameOf);
  };

  const kidsGuides = sortByMembershipTier(kidsGuidesAll, kidsEffectiveTier, (g) => g.title);
  const juniorGuides = sortByMembershipTier(juniorGuidesAll, juniorEffectiveTier, (g) => g.title);
  const adultGuides = sortByMembershipTier(
    adultGuidesAll,
    (g) => adultEffectiveTier(g),
    (g) => g.name,
  );
  const seniorGuides = sortByMembershipTier(seniorGuidesAll, seniorEffectiveTier, (g) => g.title);

  const kidsGuidesFiltered = byStatus(
    filterByDemoTier(kidsGuidesAll, kidsEffectiveTier, (g) => g.title),
  ).filter((g) => matchesLibrarySearch(g.id, g.title, g.summary));
  const juniorGuidesFiltered = byStatus(
    filterByDemoTier(juniorGuidesAll, juniorEffectiveTier, (g) => g.title),
  ).filter((g) => matchesLibrarySearch(g.id, g.title, g.summary));
  const adultGuidesFiltered = byStatus(
    filterByDemoTier(
      adultGuidesAll,
      (g) => adultEffectiveTier(g),
      (g) => g.name,
    ),
  ).filter((g) => matchesLibrarySearch(g.id, g.name, "peek" in g ? String(g.peek ?? "") : ""));
  const seniorGuidesFiltered = byStatus(
    filterByDemoTier(seniorGuidesAll, seniorEffectiveTier, (g) => g.title),
  ).filter((g) => matchesLibrarySearch(g.id, g.title, g.blurb));

  const kidsGuidesForView = kidsGuides.filter((g) => matchesLibrarySearch(g.id, g.title, g.summary));
  const juniorGuidesForView = juniorGuides.filter((g) =>
    matchesLibrarySearch(g.id, g.title, g.summary),
  );
  const adultGuidesForView = adultGuides.filter((g) =>
    matchesLibrarySearch(g.id, g.name, "peek" in g ? String(g.peek ?? "") : ""),
  );
  const seniorGuidesForView = seniorGuides.filter((g) =>
    matchesLibrarySearch(g.id, g.title, g.blurb),
  );

  type AllAgesCard =
    | { kind: "adult"; guide: (typeof adultGuidesAll)[number] }
    | { kind: "senior"; guide: (typeof seniorGuidesAll)[number] }
    | { kind: "junior"; guide: KidsGuide }
    | { kind: "kids"; guide: KidsGuide };

  const allAgesCardName = (card: AllAgesCard): string =>
    card.kind === "adult" ? card.guide.name : card.guide.title;

  /** Age Show All: one Free-first A–Z list — unique ids (matches membership badges). */
  const allAgesUnique = showAllAges
    ? sortGuidesFreeFirstThenAlphabetical(
        uniqueGuidesByLowestTier<AllAgesCard>([
          adultGuides.map((g) => ({
            id: g.id,
            tier: adultEffectiveTier(g),
            item: { kind: "adult" as const, guide: g },
          })),
          seniorGuides.map((g) => ({
            id: g.id,
            tier: seniorEffectiveTier(g),
            item: { kind: "senior" as const, guide: g },
          })),
          juniorGuides.map((g) => ({
            id: g.id,
            tier: juniorEffectiveTier(g),
            item: { kind: "junior" as const, guide: g },
          })),
          kidsGuides.map((g) => ({
            id: g.id,
            tier: kidsEffectiveTier(g),
            item: { kind: "kids" as const, guide: g },
          })),
        ]),
        (e) => e.tier,
        (e) => allAgesCardName(e.item),
      )
    : [];

  const countByTier = <T,>(
    guides: T[],
    minTierOf: (g: T) => GuideMinTier,
  ): Record<DemoTierTab, number> => exactMembershipTabCounts(guides, minTierOf);

  /** Membership counts for the current Age Group filter. */
  const membershipTabCounts: Record<DemoTierTab, number> = (() => {
    const onlyKids = !showAllAges && ageFilters.length === 1 && ageFilters[0] === "kids";
    const onlyJunior = !showAllAges && ageFilters.length === 1 && ageFilters[0] === "junior";
    const onlyAdult = !showAllAges && ageFilters.length === 1 && ageFilters[0] === "adult";
    const onlySenior = !showAllAges && ageFilters.length === 1 && ageFilters[0] === "senior";
    if (onlyKids) return countByTier(kidsGuidesAll, kidsEffectiveTier);
    if (onlyJunior) return countByTier(juniorGuidesAll, juniorEffectiveTier);
    if (onlyAdult) return countByTier(adultGuidesAll, (g) => adultEffectiveTier(g));
    if (onlySenior) return countByTier(seniorGuidesAll, seniorEffectiveTier);

    // Age Show All or multi-age — unique guide ids across selected ages.
    const byId = new Map<string, GuideMinTier>();
    const take = (id: string, tier: GuideMinTier) => {
      const prev = byId.get(id);
      if (!prev || guideTierSortRank(tier) < guideTierSortRank(prev)) byId.set(id, tier);
    };
    const includeKids = showAllAges || ageFilters.includes("kids");
    const includeJunior = showAllAges || ageFilters.includes("junior");
    const includeAdult = showAllAges || ageFilters.includes("adult");
    const includeSenior = showAllAges || ageFilters.includes("senior");
    if (includeAdult) for (const g of adultGuidesAll) take(g.id, adultEffectiveTier(g));
    if (includeKids) for (const g of kidsGuidesAll) take(g.id, kidsEffectiveTier(g));
    if (includeJunior) for (const g of juniorGuidesAll) take(g.id, juniorEffectiveTier(g));
    if (includeSenior) for (const g of seniorGuidesAll) take(g.id, seniorEffectiveTier(g));
    return countByTier([...byId.entries()], ([, tier]) => tier);
  })();

  const uniqueGuideCount = (() => {
    /** Guests/members: live Active unique count from D1. Staff: visible inventory size. */
    if (!staffCatalog) {
      return liveGuideCounts.loaded
        ? liveGuideCounts.totalActive
        : uniqueGuideLibraryCount();
    }
    const ids = new Set<string>();
    for (const g of adultGuidesAll) ids.add(g.id);
    for (const g of kidsGuidesAll) ids.add(g.id);
    for (const g of juniorGuidesAll) ids.add(g.id);
    for (const g of seniorGuidesAll) ids.add(g.id);
    return ids.size;
  })();

  const ageTabCounts: Record<GuideFilter, number> = {
    kids: kidsGuidesAll.length,
    junior: juniorGuidesAll.length,
    adult: adultGuidesAll.length,
    senior: seniorGuidesAll.length,
    all: uniqueGuideCount,
  };

  /** Status chips: pool = current Age + Membership (+ admin search). Faceted — ignores status filter itself. */
  const statusPoolIds = (() => {
    type Row = { id: string; tier: GuideMinTier; name: string; peek?: string };
    let rows: Row[] = [];
    const pushAge = (age: GuideFilter) => {
      if (age === "kids") {
        for (const g of kidsGuidesAll) {
          rows.push({
            id: g.id,
            tier: kidsEffectiveTier(g),
            name: g.title,
            peek: g.summary,
          });
        }
      } else if (age === "junior") {
        for (const g of juniorGuidesAll) {
          rows.push({
            id: g.id,
            tier: juniorEffectiveTier(g),
            name: g.title,
            peek: g.summary,
          });
        }
      } else if (age === "adult") {
        for (const g of adultGuidesAll) {
          rows.push({
            id: g.id,
            tier: adultEffectiveTier(g),
            name: g.name,
            peek: "peek" in g ? String(g.peek ?? "") : "",
          });
        }
      } else if (age === "senior") {
        for (const g of seniorGuidesAll) {
          rows.push({
            id: g.id,
            tier: seniorEffectiveTier(g),
            name: g.title,
            peek: g.blurb,
          });
        }
      }
    };

    if (showAllAges) {
      const byId = new Map<string, Row>();
      const take = (row: Row) => {
        const prev = byId.get(row.id);
        if (!prev || guideTierSortRank(row.tier) < guideTierSortRank(prev.tier)) {
          byId.set(row.id, row);
        }
      };
      for (const g of adultGuidesAll) {
        take({
          id: g.id,
          tier: adultEffectiveTier(g),
          name: g.name,
          peek: "peek" in g ? String(g.peek ?? "") : "",
        });
      }
      for (const g of kidsGuidesAll) {
        take({ id: g.id, tier: kidsEffectiveTier(g), name: g.title, peek: g.summary });
      }
      for (const g of juniorGuidesAll) {
        take({ id: g.id, tier: juniorEffectiveTier(g), name: g.title, peek: g.summary });
      }
      for (const g of seniorGuidesAll) {
        take({ id: g.id, tier: seniorEffectiveTier(g), name: g.title, peek: g.blurb });
      }
      rows = [...byId.values()];
    } else {
      for (const age of ageFilters) {
        if (age !== "all") pushAge(age);
      }
      const byId = new Map<string, Row>();
      for (const row of rows) {
        const prev = byId.get(row.id);
        if (!prev || guideTierSortRank(row.tier) < guideTierSortRank(prev.tier)) {
          byId.set(row.id, row);
        }
      }
      rows = [...byId.values()];
    }
    if (!guideNavFilterIsAll(membershipFilters)) {
      const allowed = new Set(
        filterGuidesByMembershipSelection(rows, membershipFilters, (r) => r.tier).map((r) => r.id),
      );
      rows = rows.filter((r) => allowed.has(r.id));
    }
    if (librarySearch.trim()) {
      rows = rows.filter((r) => matchesLibrarySearch(r.id, r.name, r.peek));
    }
    return rows.map((r) => r.id);
  })();

  const statusTabCounts = countGuideLibraryByStatus(catalogStates, statusPoolIds);

  const allAgesUniqueFiltered = byStatus(
    filterByDemoTier(
      allAgesUnique,
      (e) => e.tier,
      (e) => allAgesCardName(e.item),
    ),
  ).filter((e) => {
    const card = e.item;
    if (card.kind === "adult") {
      return matchesLibrarySearch(card.guide.id, card.guide.name, String(card.guide.peek ?? ""));
    }
    if (card.kind === "senior") {
      return matchesLibrarySearch(card.guide.id, card.guide.title, card.guide.blurb);
    }
    return matchesLibrarySearch(card.guide.id, card.guide.title, card.guide.summary);
  });

  const empty = showAllAges
    ? allAgesUniqueFiltered.length === 0
    : !(
        (showAdult && adultGuidesFiltered.length > 0) ||
        (showSenior && seniorGuidesFiltered.length > 0) ||
        (showKids && kidsGuidesFiltered.length > 0) ||
        (showJunior && juniorGuidesFiltered.length > 0)
      );

  const joinAudience: AudienceGroup =
    showKids && !showJunior && !showAdult && !showSenior
      ? "kids"
      : showJunior && !showKids && !showAdult && !showSenior
        ? "junior"
        : showSenior && !showKids && !showJunior && !showAdult
          ? "senior"
          : "adult";

  const libraryToolbar = (
    <div className="free-guides-list-toolbar" data-testid="free-guides-list-toolbar">
      <div className="free-guides-list-toolbar__actions">
        <div className="free-guides-view-toggle" role="group" aria-label="Guide layout">
          <button
            type="button"
            className={`free-guides-view-btn${libraryLayout === "grid" ? " is-active" : ""}`}
            aria-pressed={libraryLayout === "grid"}
            onClick={() => setLibraryLayout("grid")}
            data-testid="guides-view-grid"
          >
            <LayoutGrid size={16} aria-hidden /> Grid
          </button>
          <button
            type="button"
            className={`free-guides-view-btn${libraryLayout === "list" ? " is-active" : ""}`}
            aria-pressed={libraryLayout === "list"}
            onClick={() => setLibraryLayout("list")}
            data-testid="guides-view-list"
          >
            <List size={16} aria-hidden /> List
          </button>
        </div>
        {!empty && (
          <div className="free-guides-list-expand" role="group" aria-label="Guide lists">
            <button
              type="button"
              className="free-guides-list-expand__btn"
              data-testid="free-guides-expand-all"
              onClick={() => bumpListExpand(true)}
            >
              <ChevronsUpDown size={16} aria-hidden /> Expand all
            </button>
            <button
              type="button"
              className="free-guides-list-expand__btn"
              data-testid="free-guides-collapse-all"
              onClick={() => bumpListExpand(false)}
            >
              <ChevronsDownUp size={16} aria-hidden /> Collapse all
            </button>
          </div>
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
  );

  const blueprintTabs = (
    <div className="free-guides-tab-row free-guides-tab-row--boxed free-guides-tab-row--blueprints">
      <span className="free-guides-tab-row__label" id="free-guides-blueprints-label">
        Side Hustle BluePrint Guides
      </span>
      <div
        className="free-guides-filters free-guides-filters--blueprint"
        role="group"
        aria-labelledby="free-guides-blueprints-label"
        data-testid="free-guides-blueprints"
      >
        {(
          [
            { id: "adult" as const, shortLabel: "Adult Guide" },
            { id: "kids" as const, shortLabel: "Kids Guide" },
            { id: "teens" as const, shortLabel: "Teens Guide" },
            { id: "seniors" as const, shortLabel: "Seniors Guide" },
          ] as const
        ).map((item) => {
          const g = MARKETING_GUIDES.find((m) => m.id === item.id);
          if (!g) return null;
          return (
            <button
              key={g.id}
              type="button"
              className="free-guides-filter-btn free-guides-blueprint-tab"
              onClick={() => onOpenManual?.(g.id)}
              data-testid={`hero-open-manual-${g.id}`}
            >
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className={`free-guides-page free-guides-page--${libraryLayout}`}
      data-testid="free-guides-page"
      data-layout={libraryLayout}
    >
      <section className="free-guides-hero" aria-label={libraryTitle}>
        <div className="free-guides-hero-left">
          <div className="free-guides-hero-media">
            <img
              src={guidesLibraryHero}
              alt={`${libraryTitle} — practical side hustle guides for every age, every stage, every dream.`}
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="free-guides-hero-under" data-testid="free-guides-hero-under">
            {staffCatalog ? (
              <div className="free-guides-tab-row free-guides-tab-row--boxed free-guides-tab-row--status">
                <span className="free-guides-tab-row__label" id="free-guides-status-levels-label">
                  Filter Guides by Status
                </span>
                <div
                  className="free-guides-filters"
                  role="group"
                  aria-labelledby="free-guides-status-levels-label"
                  data-testid="free-guides-status-filters"
                >
                  {STATUS_FILTER_TABS.map((tab) => {
                    const active = guideNavFilterIsAll(statusFilters)
                      ? tab.id === "all"
                      : statusFilters.includes(tab.id);
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="checkbox"
                        aria-checked={active}
                        data-testid={`free-guides-status-filter-${tab.id}`}
                        className={`free-guides-filter-btn is-status-${tab.id}${
                          active ? " is-active" : ""
                        }`}
                        onClick={() => toggleStatusFilter(tab.id)}
                      >
                        <span className="free-guides-filter-check" aria-hidden>
                          {active ? "✓" : ""}
                        </span>
                        <span>{tab.label}</span>
                        <span
                          className="free-guides-tab-count"
                          data-testid={`free-guides-status-count-${tab.id}`}
                        >
                          {statusTabCounts[tab.id]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {libraryToolbar}
          </div>
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
                <span
                  className="glow-badge free free-guides-free-guides-tag"
                  data-testid="guides-free-membership-guides-tag"
                >
                  {freeMembershipGuidesTag(liveGuideCounts.freeActive)}
                </span>
                <div className="free-guides-perk-banner__copy">
                  <strong>Browse freely — register to unlock (including Free Guides)</strong>
                  <span>
                    {FREE_GUIDE_SIGNUP_NOTE}. {uniqueGuideCount} unique guides across all ages
                    {staffCatalog
                      ? ` — ${LAUNCH_GUIDES.length} are core adult launch playbooks; age tabs overlap so Kids+Teens+Adults+Seniors add up higher`
                      : ""}
                    .
                  </span>
                </div>
              </div>
            )}
            <div className="free-guides-hero-intro">
              <h1 className="side-hustle-library-title" data-testid="side-hustle-library-title">
                {libraryTitle}
              </h1>
              <p className="free-guides-hero-intro__lead">
                Age-ready how-to playbooks for Kids, Teens, Adults, and Seniors — {uniqueGuideCount}{" "}
                Side-Hustle options total. Some Side-Hustles cross age groups. Filter below by Groups or
                by Membership. Free Guides need Free Membership; others unlock with Starter, Pro, or
                Elite. The last row is the Side Hustle BluePrint Guides for each group. Happy Side-Hustling.
              </p>
            </div>

            <div className="free-guides-library-search" data-testid="free-guides-library-search">
              <Search size={16} className="free-guides-library-search__icon" aria-hidden />
              <input
                type="search"
                className="text-input free-guides-library-search__input"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Search guides — use * and ? as wildcards"
                aria-label="Search Side Hustle Library"
                data-testid="free-guides-library-search-input"
              />
            </div>
            <p className="free-guides-library-search__hint">
              Examples: <code>handy*</code>, <code>*airbnb*</code>, <code>0?2</code> — <code>*</code> is
              any text, <code>?</code> is one character.
            </p>
            <div className="free-guides-library-bar__tabs free-guides-hero-tabs">
              <div className="free-guides-library-bar__tabs-top">
              <div className="free-guides-tab-row free-guides-tab-row--boxed">
                <span className="free-guides-tab-row__label" id="free-guides-age-levels-label">
                  Filter Guides by Age Group
                </span>
                <div
                  className="free-guides-filters"
                  role="group"
                  aria-labelledby="free-guides-age-levels-label"
                  data-testid="free-guides-filters"
                >
                  {FILTERS.map((f) => {
                    const active = guideNavFilterIsAll(ageFilters)
                      ? f.id === "all"
                      : ageFilters.includes(f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        role="checkbox"
                        aria-checked={active}
                        id={`free-guides-filter-${f.id}`}
                        data-testid={`free-guides-filter-${f.id}`}
                        className={`free-guides-filter-btn${active ? " is-active" : ""}`}
                        onClick={() => toggleAgeFilter(f.id)}
                      >
                        <span className="free-guides-filter-check" aria-hidden>
                          {active ? "✓" : ""}
                        </span>
                        <span>{f.label}</span>
                        <span className="free-guides-tab-count" data-testid={`free-guides-filter-count-${f.id}`}>
                          {ageTabCounts[f.id]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="free-guides-tab-row free-guides-tab-row--boxed">
                <span className="free-guides-tab-row__label" id="free-guides-membership-levels-label">
                  Filter Guides by Membership
                </span>
                <div
                  className="free-guides-subtabs free-guides-subtabs--tier"
                  role="group"
                  aria-labelledby="free-guides-membership-levels-label"
                  data-testid="free-guides-demo-tier-tabs"
                >
                  {DEMO_TIER_TABS.map((tab) => {
                    const active = guideNavFilterIsAll(membershipFilters)
                      ? tab.id === "all"
                      : membershipFilters.includes(tab.id);
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="checkbox"
                        aria-checked={active}
                        data-testid={`free-guides-demo-tier-${tab.id}`}
                        data-tier={tab.id}
                        className={`free-guides-subtab is-tier-${tab.id}${active ? " is-active" : ""}`}
                        onClick={() => toggleMembershipFilter(tab.id)}
                      >
                        <span className="free-guides-filter-check" aria-hidden>
                          {active ? "✓" : ""}
                        </span>
                        <span>{tab.label}</span>
                        <span
                          className="free-guides-tab-count"
                          data-testid={`free-guides-demo-tier-count-${tab.id}`}
                        >
                          {membershipTabCounts[tab.id]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              </div>

              {blueprintTabs}
            </div>
          </div>
        </div>
      </section>

      <>
          {empty && (
            <div className="glass free-guides-empty">
              <p>
                {librarySearch.trim()
                  ? `No guides match “${librarySearch.trim()}”. Try * or ? wildcards, or clear search.`
                  : "No guides match this filter yet."}
              </p>
            </div>
          )}

          {showAllAges && allAgesUnique.length > 0 && (
            <GuideTabPanel
              sectionKey="all"
              testId="free-guides-tab-panel-all-ages"
            >
              {(() => {
                const renderAllAgesGrid = (entries: typeof allAgesUnique) => (
                  <div className="free-guides-grid">
                    {entries.map((entry) => {
                      const card = entry.item;
                      if (card.kind === "kids" || card.kind === "junior") {
                        return (
                          <FreeKidsGuideCard
                            key={`${card.kind}-${card.guide.id}`}
                            guide={card.guide}
                            isMember={isLoggedIn}
                            membershipTier={effectiveTier}
                            isAdmin={isAdmin}
                            staffCatalog={staffCatalog}
                            guideStatus={guideStatusOf(card.guide.id)}
                            minTier={entry.tier}
                            onJoinCta={
                              onGoToJoin
                                ? (focusTier) =>
                                    onGoToJoin(
                                      card.kind === "junior" ? "junior" : "kids",
                                      focusTier,
                                    )
                                : undefined
                            }
                            onOpenGuide={() => openKidsLibraryGuide(card.guide)}
                          />
                        );
                      }
                      if (card.kind === "senior") {
                        const g = card.guide;
                        const comingSoon = g.status === "coming_soon";
                        const minTier = entry.tier;
                        const access = resolveGuideAccess({
                          isMember: comingSoon ? false : isLoggedIn,
                          membershipTier: effectiveTier,
                          minTier,
                          isAdmin: comingSoon ? false : isAdmin,
                          guideId: g.launchGuideId || g.id,
                        });
                        const isFreePlan = minTier === "free";
                        return (
                          <article
                            key={`senior-${g.id}`}
                            className={`glass free-guide-card ${
                                comingSoon ? "is-gated" : isFreePlan ? "is-free" : "is-gated"
                              }${staffCatalog && guideStatusOf(g.id) !== "active" ? " is-guide-inactive" : ""}`}
                          >
                            <div className="free-guide-card-head">
                              <div>
                                <FreeGuideCardTitle
                                  guideId={g.id}
                                  title={g.title}
                                  minTier={minTier}
                                  comingSoon={comingSoon}
                                />
                                {!comingSoon && (
                                  <p className="free-guide-tier-note">{guideTierMembershipNote(minTier)}</p>
                                )}
                                {!comingSoon && access.unlocked ? (
                                  <ComplimentaryGiftNote
                                    guideId={g.launchGuideId || g.id}
                                    minTier={minTier}
                                  />
                                ) : null}
                              </div>
                              {comingSoon ? (
                                <Clock
                                  size={18}
                                  style={{ color: "var(--amber, #c9a227)", flexShrink: 0 }}
                                  aria-hidden
                                />
                              ) : access.unlocked ? (
                                <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                              ) : (
                                <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
                              )}
                            </div>
                            <p className="free-guide-summary">
                              {guideSideHustleDescription(g.id) || g.blurb}
                            </p>
                            {comingSoon ? (
                              <p className="free-guide-tier-note">{COMING_SOON_NOT_UNLOCKED_NOTE}</p>
                            ) : null}
                            {comingSoon ? (
                              <button type="button" className="glow-chip-btn" onClick={onOpenSeniorsGuides}>
                                See Seniors page
                              </button>
                            ) : access.unlocked ? (
                              <OpenGuideButton
                                minTier={minTier}
                                label={g.launchGuideId ? "Open guide" : "View in Seniors"}
                                onClick={
                                  g.launchGuideId
                                    ? () => onOpenAdultGuide(g.launchGuideId!)
                                    : onOpenSeniorsGuides
                                }
                              />
                            ) : (
                              <div className="free-guide-lock-cta">
                                <Lock size={16} />
                                <JoinToUnlockCta
                                  access={access}
                                  onJoin={
                                    onGoToJoin
                                      ? () => onGoToJoin("senior", minTier)
                                      : undefined
                                  }
                                  onUpgrade={
                                    onGoToJoin
                                      ? () => onGoToJoin("senior", minTier)
                                      : undefined
                                  }
                                />
                              </div>
                            )}
                          </article>
                        );
                      }
                      const g = card.guide;
                      const minTier = entry.tier;
                      const access = resolveGuideAccess({
                        isMember: isLoggedIn,
                        membershipTier: effectiveTier,
                        minTier,
                        isAdmin,
                        guideId: g.id,
                      });
                      const isFreePlan = minTier === "free";
                      return (
                        <article
                          key={`adult-${g.id}`}
                          className={`glass free-guide-card ${isFreePlan ? "is-free" : "is-gated"}${
                              staffCatalog && guideStatusOf(g.id) !== "active" ? " is-guide-inactive" : ""
                            }`}
                        >
                          <div className="free-guide-card-head">
                            <div>
                              <FreeGuideCardTitle guideId={g.id} title={g.name} minTier={minTier} />
                              <p className="free-guide-tier-note">{guideTierMembershipNote(minTier)}</p>
                              {access.unlocked ? (
                                <ComplimentaryGiftNote guideId={g.id} minTier={minTier} />
                              ) : null}
                            </div>
                            {access.unlocked ? (
                              <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                            ) : (
                              <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
                            )}
                          </div>
                          <p className="free-guide-summary">
                            {guideSideHustleDescription(g.id) || g.peek}
                          </p>
                          {access.unlocked ? (
                            <OpenGuideButton minTier={minTier} onClick={() => onOpenAdultGuide(g.id)} />
                          ) : (
                            <div className="free-guide-lock-cta">
                              <Lock size={16} />
                              <JoinToUnlockCta
                                access={access}
                                onJoin={onGoToJoin ? () => onGoToJoin("adult", minTier) : undefined}
                                onUpgrade={onGoToJoin ? () => onGoToJoin("adult", minTier) : undefined}
                              />
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                );
                return (
                  <TierGroupedGuideList
                    guides={allAgesUnique}
                    minTierOf={(e) => e.tier}
                    nameOf={(e) => allAgesCardName(e.item)}
                    testIdPrefix="all-ages"
                    renderGuides={renderAllAgesGrid}
                    expandSignal={listExpand}
                    navStyle="panel"
                    membershipTab={membershipTab}
                    onMembershipTabChange={setMembershipTab}
                  />
                );
              })()}
            </GuideTabPanel>
          )}

          {showAdult && adultGuides.length > 0 && (
            <GuideTabPanel sectionKey="adult">
              {(() => {
                const renderAdultGrid = (guides: typeof adultGuides) => (
                  <div className="free-guides-grid">
                    {guides.map((g) => {
                      const minTier = adultEffectiveTier(g);
                      const access = resolveGuideAccess({
                        isMember: isLoggedIn,
                        membershipTier: effectiveTier,
                        minTier,
                        isAdmin,
                        guideId: g.id,
                      });
                      const isFreePlan = minTier === "free";
                      return (
                        <article
                          key={g.id}
                          className={`glass free-guide-card ${isFreePlan ? "is-free" : "is-gated"}${
                              staffCatalog && guideStatusOf(g.id) !== "active" ? " is-guide-inactive" : ""
                            }`}
                        >
                          <div className="free-guide-card-head">
                            <div>
                              <FreeGuideCardTitle guideId={g.id} title={g.name} minTier={minTier} />
                              <p className="free-guide-tier-note">{guideTierMembershipNote(minTier)}</p>
                              {access.unlocked ? (
                                <ComplimentaryGiftNote guideId={g.id} minTier={minTier} />
                              ) : null}
                            </div>
                            {access.unlocked ? (
                              <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                            ) : (
                              <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
                            )}
                          </div>
                          <p className="free-guide-summary">
                            {guideSideHustleDescription(g.id) || g.peek}
                          </p>
                          {access.unlocked ? (
                            <OpenGuideButton minTier={minTier} onClick={() => onOpenAdultGuide(g.id)} />
                          ) : (
                            <div className="free-guide-lock-cta">
                              <Lock size={16} />
                              <JoinToUnlockCta
                                access={access}
                                onJoin={onGoToJoin ? () => onGoToJoin("adult", minTier) : undefined}
                                onUpgrade={onGoToJoin ? () => onGoToJoin("adult", minTier) : undefined}
                              />
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                );
                return (
                  <TierGroupedGuideList
                    guides={adultGuidesForView}
                    minTierOf={(g) => adultEffectiveTier(g)}
                    nameOf={(g) => g.name}
                    testIdPrefix="adult"
                    renderGuides={renderAdultGrid}
                    expandSignal={listExpand}
                    navStyle="panel"
                    membershipTab={membershipTab}
                    onMembershipTabChange={setMembershipTab}
                  />
                );
              })()}
            </GuideTabPanel>
          )}

          {showSenior && seniorGuides.length > 0 && (
            <GuideTabPanel sectionKey="senior">
              {(() => {
                const renderSeniorGrid = (guides: typeof seniorGuides) => (
                  <div className="free-guides-grid">
                    {guides.map((g) => {
                      const comingSoon = g.status === "coming_soon";
                      const minTier = seniorEffectiveTier(g);
                      const access = resolveGuideAccess({
                        isMember: comingSoon ? false : isLoggedIn,
                        membershipTier: effectiveTier,
                        minTier,
                        isAdmin: comingSoon ? false : isAdmin,
                        guideId: g.launchGuideId || g.id,
                      });
                      const isFreePlan = minTier === "free";
                      return (
                        <article
                          key={g.id}
                          className={`glass free-guide-card ${
                              comingSoon ? "is-gated" : isFreePlan ? "is-free" : "is-gated"
                            }${staffCatalog && guideStatusOf(g.id) !== "active" ? " is-guide-inactive" : ""}`}
                        >
                          <div className="free-guide-card-head">
                            <div>
                              <FreeGuideCardTitle
                                guideId={g.id}
                                title={g.title}
                                minTier={minTier}
                                comingSoon={comingSoon}
                              />
                              {!comingSoon && (
                                <p className="free-guide-tier-note">{guideTierMembershipNote(minTier)}</p>
                              )}
                              {!comingSoon && access.unlocked ? (
                                <ComplimentaryGiftNote
                                  guideId={g.launchGuideId || g.id}
                                  minTier={minTier}
                                />
                              ) : null}
                            </div>
                            {comingSoon ? (
                              <Clock
                                size={18}
                                style={{ color: "var(--amber, #c9a227)", flexShrink: 0 }}
                                aria-hidden
                              />
                            ) : access.unlocked ? (
                              <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                            ) : (
                              <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
                            )}
                          </div>
                          <p className="free-guide-summary">
                            {guideSideHustleDescription(g.id) || g.blurb}
                          </p>
                          {comingSoon ? (
                            <p className="free-guide-tier-note">{COMING_SOON_NOT_UNLOCKED_NOTE}</p>
                          ) : null}
                          {comingSoon ? (
                            <button type="button" className="glow-chip-btn" onClick={onOpenSeniorsGuides}>
                              See Seniors page
                            </button>
                          ) : access.unlocked ? (
                            <OpenGuideButton
                              minTier={minTier}
                              label={g.launchGuideId ? "Open guide" : "View in Seniors"}
                              onClick={
                                g.launchGuideId
                                  ? () => onOpenAdultGuide(g.launchGuideId!)
                                  : onOpenSeniorsGuides
                              }
                            />
                          ) : (
                            <div className="free-guide-lock-cta">
                              <Lock size={16} />
                              <JoinToUnlockCta
                                access={access}
                                onJoin={
                                  onGoToJoin ? () => onGoToJoin("senior", minTier) : undefined
                                }
                                onUpgrade={
                                  onGoToJoin ? () => onGoToJoin("senior", minTier) : undefined
                                }
                              />
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                );
                return (
                  <TierGroupedGuideList
                    guides={seniorGuidesForView}
                    minTierOf={seniorEffectiveTier}
                    nameOf={(g) => g.title}
                    testIdPrefix="senior"
                    renderGuides={renderSeniorGrid}
                    expandSignal={listExpand}
                    navStyle="panel"
                    membershipTab={membershipTab}
                    onMembershipTabChange={setMembershipTab}
                  />
                );
              })()}
            </GuideTabPanel>
          )}

          {showJunior && juniorGuides.length > 0 && (
            <GuideTabPanel sectionKey="junior">
              <TierGroupedGuideList
                  guides={juniorGuidesForView}
                  minTierOf={juniorEffectiveTier}
                  nameOf={(g) => g.title}
                  testIdPrefix="junior"
                  expandSignal={listExpand}
                  navStyle="panel"
                  membershipTab={membershipTab}
                  onMembershipTabChange={setMembershipTab}
                  renderGuides={(guides) => (
                    <div className="free-guides-grid">
                      {guides.map((g) => (
                        <FreeKidsGuideCard
                          key={g.id}
                          guide={g}
                          isMember={isLoggedIn}
                          membershipTier={effectiveTier}
                          isAdmin={isAdmin}
                          staffCatalog={staffCatalog}
                          guideStatus={guideStatusOf(g.id)}
                          minTier={juniorEffectiveTier(g)}
                          onJoinCta={onGoToJoin ? (focusTier) => onGoToJoin("junior", focusTier) : undefined}
                          onOpenGuide={() => openKidsLibraryGuide(g)}
                        />
                      ))}
                    </div>
                  )}
                />
              <button
                type="button"
                className="btn btn-outline free-guides-section-link"
                onClick={onOpenJuniorGuides}
              >
                Open Teens Side Hustle Guides
              </button>
            </GuideTabPanel>
          )}

          {showKids && kidsGuides.length > 0 && (
            <GuideTabPanel sectionKey="kids">
              <TierGroupedGuideList
                  guides={kidsGuidesForView}
                  minTierOf={kidsEffectiveTier}
                  nameOf={(g) => g.title}
                  testIdPrefix="kids"
                  expandSignal={listExpand}
                  navStyle="panel"
                  membershipTab={membershipTab}
                  onMembershipTabChange={setMembershipTab}
                  renderGuides={(guides) => (
                    <div className="free-guides-grid">
                      {guides.map((g) => (
                        <FreeKidsGuideCard
                          key={g.id}
                          guide={g}
                          isMember={isLoggedIn}
                          membershipTier={effectiveTier}
                          isAdmin={isAdmin}
                          staffCatalog={staffCatalog}
                          guideStatus={guideStatusOf(g.id)}
                          minTier={kidsEffectiveTier(g)}
                          onJoinCta={onGoToJoin ? (focusTier) => onGoToJoin("kids", focusTier) : undefined}
                          onOpenGuide={() => openKidsLibraryGuide(g)}
                        />
                      ))}
                    </div>
                  )}
                />
              <button
                type="button"
                className="btn btn-outline free-guides-section-link"
                onClick={onOpenKidsGuides}
              >
                Open Kids Corner Guides
              </button>
            </GuideTabPanel>
          )}
        </>
    </div>
  );
}
