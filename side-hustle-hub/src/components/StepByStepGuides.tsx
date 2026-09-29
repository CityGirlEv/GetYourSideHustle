import React, { useEffect, useMemo, useRef, useState } from "react";
import { 
  Check, 
  AlertTriangle, 
  Award,
  TrendingUp,
  Clock,
  LogIn,
  CircleAlert,
  X,
  Search,
} from "lucide-react";
import { fetchMemberProgress, saveMemberProgress } from "../lib/gysh-member-progress";
import { guideStepChecklistItemKey } from "../lib/guide-step-checklist";
import { GuideStepDesc } from "./GuideStepDesc";
import {
  guideTierBadgeLabel,
  guideTierShortLabel,
  resolveGuideAccess,
  type GuideMinTier,
} from "../lib/guide-access";
import type { TierId } from "../lib/membership";
import { LAUNCH_GUIDES, sortGuidesFreeFirst } from "../lib/launch-guides";
import { guideSideHustleDescription } from "../lib/side-hustle-catalog";
import { resolveGuideKit } from "../lib/guide-kit-overrides";
import { kidsGuideById } from "../lib/kids-guides";
import {
  resolveLaunchGuideData,
  type LaunchGuideData,
} from "../lib/resolve-launch-guide-data";
import {
  fetchGuideCatalogStates,
  setGuideCatalogStatus,
  setGuideCatalogStatusBulk,
} from "../lib/guide-catalog-client";
import {
  applyGuideCatalogPatch,
  effectiveGuideMinTier,
  guideHoldsActive,
  getGuideVisibilityStatus,
  GUIDE_BULK_STATUS_OPTIONS,
  GUIDE_STATUS_NOTE_MIN_LENGTH,
  guideHeldVisibilityStatuses,
  guideStatusNoteMeetsRequirement,
  guideStatusRequiresNote,
  guideVisibilityStatusLabel,
  mergeGuideCatalogStateMapsPreferNewer,
  overlayGuideCatalogState,
  overlayGuideCatalogStateMap,
  type GuideCatalogStateMap,
  type GuideVisibilityStatus,
} from "../lib/guide-catalog-state";
import {
  effectiveGuideAudiences,
  effectiveGuideMembershipSelection,
} from "../lib/guide-library-update";
import {
  countGuideNavByAge,
  countGuideNavByAssignee,
  countGuideNavByMembership,
  countGuideNavByStatus,
  defaultLibraryStatusFilters,
  filterGuideNavItems,
  guideNavFilterIsAll,
  type GuideNavAgeFilter,
  type GuideNavAssigneeFilter,
  type GuideNavMembershipFilter,
  type GuideNavStatusFilter,
} from "../lib/guide-nav-filters";
import {
  guideAssigneeRoster,
} from "../lib/guide-assignee";
import { testOwnerLabel } from "../lib/gysh-roles";
import { toggleLibraryFilterSelection } from "../lib/guide-list-expand";
import {
  audiencesForLibraryGuideId,
  libraryMinTierForGuideId,
  uniqueGuideLibraryEntries,
} from "../lib/guide-library-pool";
import { presentableGuideTitle } from "../lib/guide-title";
import {
  applyLiveGuideLibraryCountsFromStates,
  patchLiveGuideLibraryCatalogState,
} from "../lib/guide-library-live-counts";
import {
  guideMatchesLibrarySearch,
  libraryGuideNotFoundCopy,
  librarySidebarCountText,
  sideHustleLibraryPageTitle,
} from "../lib/guide-library-search";
import { formatGuideNumber, guideNumberLabel, guideNumberParenthetical, orderedGuideIdsForNumbering } from "../lib/guide-numbers";
import { JoinToUnlockCta } from "./JoinToUnlockCta";
import { ComplimentaryGiftNote } from "./ComplimentaryGiftNote";
import { MembershipLockBadge } from "./MembershipLockBadge";
import { GuidePrepSections, guidePrepAfterTabsOwnsPanel } from "./GuidePrepSections";
import { GuideRevenueCalculator } from "./GuideRevenueCalculator";
import { GuideNotesTab } from "./GuideNotesTab";
import { GuideActiveToggle } from "./GuideActiveToggle";
import { GuideAdminContentEditor } from "./GuideAdminContentEditor";
import { GuideAssigneeField } from "./GuideAssigneeField";
import { GuideMembershipAgeFields } from "./GuideMembershipAgeFields";
import { GuideChangeLogPanel } from "./GuideChangeLogPanel";
import { navigateAdminDeepLink } from "../lib/admin-deep-links";
import { guideReviewCaseIdForGuide, testingPortalHrefForGuide } from "../lib/guide-review-link";
import { formatAuditTrail } from "../lib/gysh-audit";

/** First Free-sorted library guide — used when no hustle was explicitly opened. */
const FIRST_LIBRARY_GUIDE_ID = orderedGuideIdsForNumbering()[0] ?? "";

const AGE_FILTERS: { id: GuideNavAgeFilter; label: string }[] = [
  { id: "all", label: "Show All" },
  { id: "kids", label: "Kids" },
  { id: "junior", label: "Teens" },
  { id: "adult", label: "Adults" },
  { id: "senior", label: "Seniors" },
];

const MEMBERSHIP_FILTERS: { id: GuideNavMembershipFilter; label: string }[] = [
  { id: "all", label: "Show All" },
  { id: "free", label: "Free" },
  { id: "starter", label: "Starter" },
  { id: "pro", label: "Pro" },
  { id: "elite", label: "Elite" },
];

const STATUS_FILTERS: { id: GuideNavStatusFilter; label: string }[] = [
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


type GuideData = LaunchGuideData;

interface StepByStepGuidesProps {
  selectedHustleId?: string;
  isLoggedIn?: boolean;
  membershipTier?: string | null;
  /** Admin self-profile: unlock every live guide. */
  isAdmin?: boolean;
  /** Display name for note authorship stamps. */
  memberName?: string;
  /** User id for own-note edit/delete checks. */
  memberUserId?: string;
  /** Admin or QA — see unpublished guides + Lyriq Review / Pass controls. */
  canReviewGuides?: boolean;
  /** Evelyn-only: set Reviewed by Dev when marking Reviewed. */
  canSetReviewedByDev?: boolean;
  onGoToJoin?: (focusTier?: TierId) => void;
  onGoToLogin?: () => void;
}

export const StepByStepGuides: React.FC<StepByStepGuidesProps> = ({ 
  selectedHustleId,
  isLoggedIn = false,
  membershipTier = null,
  isAdmin = false,
  memberName = "",
  memberUserId = "",
  canReviewGuides = false,
  canSetReviewedByDev = false,
  onGoToJoin,
  onGoToLogin,
}) => {
  const [activeGuideId, setActiveGuideId] = useState<string>(
    () => selectedHustleId || FIRST_LIBRARY_GUIDE_ID,
  );
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  /** ☐ lines inside a step — independent of marking the whole step done. */
  const [stepChecklistItems, setStepChecklistItems] = useState<Record<string, boolean>>({});
  const [catalogStates, setCatalogStates] = useState<GuideCatalogStateMap>({});
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkNeedSelectionOpen, setBulkNeedSelectionOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [ageFilters, setAgeFilters] = useState<GuideNavAgeFilter[]>(["all"]);
  const [membershipFilters, setMembershipFilters] = useState<GuideNavMembershipFilter[]>(["all"]);
  const [statusFilters, setStatusFilters] = useState<GuideNavStatusFilter[]>(() =>
    defaultLibraryStatusFilters(isAdmin || canReviewGuides),
  );
  const [assigneeFilters, setAssigneeFilters] = useState<GuideNavAssigneeFilter[]>(["all"]);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [pendingNotePrompt, setPendingNotePrompt] = useState<{
    guideIds: string[];
    status: GuideVisibilityStatus;
  } | null>(null);
  const [pendingNoteDraft, setPendingNoteDraft] = useState("");
  /** Bump after Pending note saves so the Notes tab reloads without remounting. */
  const [guideNotesRefreshKey, setGuideNotesRefreshKey] = useState(0);
  /** Bump after catalog writes so Audit trail reloads. */
  const [guideAuditRefreshKey, setGuideAuditRefreshKey] = useState(0);
  /** Staff (Admin or QA) see Pending / Reviewed by QA / Inactive guides. */
  const staffCatalog = isAdmin || canReviewGuides;
  /** Admin or QA may edit kit tabs + status checkboxes in the library detail. */
  const canEditGuideContent = staffCatalog;
  const effectiveTier = membershipTier ?? (isLoggedIn ? "free" : null);

  const ageFilterKey = ageFilters.join(",");
  const membershipFilterKey = membershipFilters.join(",");
  const statusFilterKey = statusFilters.join(",");
  const assigneeFilterKey = assigneeFilters.join(",");
  const filterSelectionKey = `${ageFilterKey}|${membershipFilterKey}|${statusFilterKey}|${assigneeFilterKey}|${librarySearch}`;
  /** Pin the open guide only after a status *save* refilters — not when the user picks filter chips. */
  const allowPinOutsideFilter = useRef(true);
  const filterKeyForPinRef = useRef(filterSelectionKey);
  if (filterKeyForPinRef.current !== filterSelectionKey) {
    allowPinOutsideFilter.current = false;
    filterKeyForPinRef.current = filterSelectionKey;
  }

  const toggleAgeFilter = (id: GuideNavAgeFilter) => {
    setAgeFilters((prev) => toggleLibraryFilterSelection(prev, id, "all"));
  };
  const toggleMembershipFilter = (id: GuideNavMembershipFilter) => {
    setMembershipFilters((prev) => toggleLibraryFilterSelection(prev, id, "all"));
  };
  const toggleStatusFilter = (id: GuideNavStatusFilter) => {
    setStatusFilters((prev) => toggleLibraryFilterSelection(prev, id, "all"));
  };
  const toggleAssigneeFilter = (id: GuideNavAssigneeFilter) => {
    setAssigneeFilters((prev) => toggleLibraryFilterSelection(prev, id, "all"));
  };

  useEffect(() => {
    if (selectedHustleId) setActiveGuideId(selectedHustleId);
    else if (FIRST_LIBRARY_GUIDE_ID) setActiveGuideId(FIRST_LIBRARY_GUIDE_ID);
  }, [selectedHustleId]);

  useEffect(() => {
    setTipsOpen(false);
  }, [activeGuideId]);

  useEffect(() => {
    setBulkSelected(new Set());
  }, [ageFilterKey, membershipFilterKey, statusFilterKey, assigneeFilterKey, librarySearch]);

  useEffect(() => {
    let cancelled = false;
    fetchGuideCatalogStates()
      .then((states) => {
        if (cancelled) return;
        setCatalogStates((prev) => {
          const merged = mergeGuideCatalogStateMapsPreferNewer(states, prev);
          applyLiveGuideLibraryCountsFromStates(merged);
          return merged;
        });
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const commitGuideStatus = async (
    guideIds: string[],
    status: GuideVisibilityStatus,
    note?: string,
  ) => {
    const ids = [...new Set(guideIds.map((id) => String(id || "").trim()).filter(Boolean))];
    if (!ids.length) return;
    setStatusError(null);
    if (guideStatusRequiresNote(status) && !guideStatusNoteMeetsRequirement(note)) {
      setStatusError(
        `A note is required for Pending / Needs Further Review (at least ${GUIDE_STATUS_NOTE_MIN_LENGTH} characters).`,
      );
      return;
    }
    const single = ids.length === 1;
    if (single) setStatusBusyId(ids[0]!);
    else {
      setBulkBusy(true);
      setBulkError(null);
    }
    allowPinOutsideFilter.current = true;
    if (!single) {
      setCatalogStates((prev) => {
        const next = { ...prev };
        for (const id of ids) {
          next[id] = {
            ...(next[id] ?? {
              guideId: id,
              status: "inactive",
              published: false,
              deleted: false,
              custom: false,
              patch: {},
            }),
            guideId: id,
            status,
            published: guideHoldsActive(status),
            deleted: false,
          };
        }
        return next;
      });
    }
    try {
      if (single) {
        const next = await setGuideCatalogStatus(ids[0]!, status, note);
        setCatalogStates((prev) => ({
          ...prev,
          [ids[0]!]: overlayGuideCatalogState(prev[ids[0]!], next),
        }));
        patchLiveGuideLibraryCatalogState(ids[0]!, next);
      } else {
        const saved = await setGuideCatalogStatusBulk(ids, status, note);
        setCatalogStates((prev) => {
          const merged = overlayGuideCatalogStateMap(prev, saved);
          applyLiveGuideLibraryCountsFromStates(merged);
          return merged;
        });
        setBulkSelected(effectiveGuideId ? new Set([effectiveGuideId]) : new Set());
      }
      setGuideAuditRefreshKey((k) => k + 1);
      if (status === "pending" && guideStatusNoteMeetsRequirement(note)) {
        setGuideNotesRefreshKey((k) => k + 1);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Guide status update failed.";
      if (single) setStatusError(msg);
      else {
        setBulkError(msg);
        try {
          const fresh = await fetchGuideCatalogStates();
          setCatalogStates(fresh);
        } catch {
          /* keep optimistic until refresh */
        }
      }
    } finally {
      if (single) setStatusBusyId(null);
      else setBulkBusy(false);
    }
  };

  const requestGuideStatus = (guideIds: string[], status: GuideVisibilityStatus) => {
    if (guideStatusRequiresNote(status)) {
      setPendingNoteDraft("");
      setPendingNotePrompt({ guideIds, status });
      setStatusError(null);
      return;
    }
    void commitGuideStatus(guideIds, status);
  };

  const setGuideStatus = async (guideId: string, status: GuideVisibilityStatus) => {
    requestGuideStatus([guideId], status);
  };

  const applyBulkStatus = async (status: GuideVisibilityStatus) => {
    const ids = [...bulkSelected];
    if (ids.length === 0) {
      setBulkNeedSelectionOpen(true);
      return;
    }
    if (bulkBusy) return;
    requestGuideStatus(ids, status);
  };

  // Keep IDs/names aligned with src/lib/launch-guides.ts (LAUNCH_GUIDES) so
  // Admin Task List auto-creates "Review Launch Guide: …" items for new hustles.
  const guides: GuideData[] = [
    {
      id: "airbnb",
      name: "Airbnb Hosting",
      timeframe: "2 - 4 weeks",
      estEarnings: "$1,500 - $8,000 / month",
      bestFor: "Property owners or sublease managers looking to monetize space.",
      proTip: "Invest in a high-quality smart lock (e.g., Yale or Schlage) that integrates with Airbnb to auto-generate keypad codes for guests upon check-in. It saves hours of manual work.",
      pitfall: "Not checking local regulations or HOA rules. Many cities require short-term rental (STR) permits, and violating HOAs can result in major fines.",
      steps: [
        { title: "Market & Feasibility Audit", desc: "Use tools like AirDNA to check average occupancy, nightly rates, and municipal regulations in your ZipCode." },
        { title: "Secure STR Permits & Insurance", desc: "Apply for local city licenses and purchase short-term rental-specific liability insurance." },
        { title: "Furnish & Style (Cozy Aesthetic)", desc: "Buy durable, photogenic furniture. Focus on comfortable mattresses, high-speed WiFi, and guest amenities (coffee, shampoo)." },
        { title: "Professional Photography & Copy", desc: "Hire a real estate photographer. Write an engaging title focusing on unique features (e.g., 'Cozy Oasis with Hot Tub')." },
        { title: "Build the Listing & Pricing Strategy", desc: "Create your Airbnb account, set clear house rules, and turn on dynamic pricing (PriceLabs or Wheelhouse) to maximize high-season occupancy." },
        { title: "Automate Cleaning & Communication", desc: "Partner with local cleaners via TurnoverBnB to auto-schedule cleaning sessions based on checkout times." }
      ]
    },
    {
      id: "pod",
      name: "Print-on-Demand (POD)",
      timeframe: "1 - 2 weeks",
      estEarnings: "$200 - $3,000 / month",
      bestFor: "Creatives and designers who want zero inventory risk.",
      proTip: "Don't design for everyone. Focus on hyperspecific niches (e.g., 'Retro Coffee-Loving Software Engineers'). People buy items that represent their specific identity.",
      pitfall: "Copying trademarked text or copyrighted art. Etsy and Amazon will permanently ban stores that violate IP laws.",
      steps: [
        { title: "Select Niches & Run Keyword Audits", desc: "Use Etsy Search or Google Trends to find low-competition, passionate niches (hobbies, professions, humor)." },
        { title: "Create Printify or Printful Accounts", desc: "Register with a POD supplier and link it to your sales channel (Etsy shop, Shopify, or eBay)." },
        { title: "Draft Eye-Catching Designs", desc: "Create transparent PNG designs (300 DPI) using Canva, Illustrator, or Figma. Focus on clean typography and aesthetic color palettes." },
        { title: "Publish Listings with SEO Tags", desc: "Optimize title keywords, description tags, and upload realistic mockups (Placeit) so customers see how the item looks in real life." },
        { title: "Promote on Pinterest & TikTok", desc: "Create aesthetic boards showing lifestyle mockups or record short-form video hooks of the products." },
        { title: "Iterate Based on Traffic Data", desc: "Check which listings get views/favorites, double down on what works, and phase out low-performing designs." }
      ]
    },
    {
      id: "dropshipping",
      name: "Dropshipping Business",
      timeframe: "2 - 3 weeks",
      estEarnings: "$500 - $10,000 / month",
      bestFor: "Digital marketers ready to run paid advertisements.",
      proTip: "Order a sample of the product to your house first. You must verify shipping times, product build quality, and record custom video ad creatives.",
      pitfall: "Relying on low-quality suppliers with 30-day shipping times. Modern consumers expect delivery in under 10 days; long waits lead to refunds and bank chargebacks.",
      steps: [
        { title: "Perform Competitor & TikTok Research", desc: "Find viral products with high problem-solving value or a strong wow-factor using TikTok's Ad Library." },
        { title: "Source Suppliers on Alibaba or Zendrop", desc: "Establish agreements with reliable suppliers offering fast-shipping lines (5-10 days to US/Europe)." },
        { title: "Construct Shopify Landing Pages", desc: "Set up a clean, single-product Shopify store. Use trust badges, customer reviews, and clear return policies." },
        { title: "Produce High-Clickrate Video Ads", desc: "Record or edit 3 unique hook variations (first 3 seconds) and a solid call-to-action for Facebook/TikTok Ads." },
        { title: "Launch Paid Marketing Tests", desc: "Run budget testing campaigns ($20-50/day) targeting broad interest matches. Analyze CTR (aim for >2%) and CPA." },
        { title: "Optimize Cart & Scale Budgets", desc: "Use upsells to increase Average Order Value (AOV) and gradually increase ad spend on profitable target assets." }
      ]
    },
    {
      id: "digital-products",
      name: "Digital Products",
      timeframe: "2 - 6 weeks",
      estEarnings: "$200 - $10,000 / month",
      bestFor: "Teens, adults, and seniors / retirees who want to create one useful digital product — ebooks, printables, planners, templates, and mini-courses (not affiliate links).",
      proTip: "Don't build the store before you prove the product. One useful $10 product that people actually buy beats a beautiful store of 50 products nobody wants.",
      pitfall: "Mixing Digital Products with Affiliate Marketing. Your own downloads are Digital; promoting other brands’ products for commissions is Affiliate — keep the lanes separate. Do not copy another creator's product.",
      steps: [
        { title: "Pick One Product", desc: "Solve one problem for one customer with one useful product." },
        { title: "Research the Customer", desc: "Research for ideas and positioning. Do not copy another creator's product." },
        { title: "Create the Product", desc: "Build the simplest useful version and save a master copy." },
        { title: "Test & Price It", desc: "Test files, then set price using Suggested Pricing." },
        { title: "Choose Your Marketing Channels", desc: "Pick only 2 or 3 channels this month." },
        { title: "Make Your Marketing Materials", desc: "Cover, images, description, benefits, price, and CTA." },
        { title: "Set Up Your Sales Page", desc: "Choose one selling platform first and test delivery." },
        { title: "Carry Out Your Marketing Plan", desc: "Use only the selected channels. Track views, clicks, and sales." },
        { title: "Make Sales & Learn", desc: "Learn from Product #1 before creating many more." },
        { title: "Improve the Product", desc: "Use feedback to improve instructions, cover, description, or price." },
        { title: "Grow", desc: "Related product, bundle, upsell, then repeat customers." },
      ],
    },
    {
      id: "affiliate",
      name: "Affiliate Marketing",
      timeframe: "3 - 6 weeks",
      estEarnings: "$100 - $15,000 / month",
      bestFor: "Creators who share products from other companies and earn a commission when someone buys through their unique link.",
      proTip: "Start with programs that are easy to join (Amazon Associates, TikTok Shop / Creator, a brand you already use). Recurring SaaS commissions are a later upgrade — not day one.",
      pitfall: "Spamming bare links. Platforms and buyers expect honest reviews, tutorials, or demos — and a clear affiliate disclosure.",
      steps: [
        {
          title: "Pick Your Niche + Where You’ll Share",
          desc: "Choose a topic you know (beauty, gadgets, home, software, etc.) and a place you’ll post — TikTok, YouTube, Instagram, a blog, or email.",
        },
        {
          title: "Join 1–2 Beginner Programs & Get Your Links",
          desc: "Sign up for programs that give you tracking links — Amazon Associates, TikTok Shop / Creator Marketplace, Shopify apps, POD suppliers, dropshipping brands, or software partners. You promote their products; they pay you a commission on clicks that convert.",
        },
        {
          title: "Create Value-First Content",
          desc: "Film or write honest reviews, demos, and how-tos. Mention the product naturally and include your affiliate link (same idea as creators on YouTube/TikTok).",
        },
        {
          title: "Disclose & Comply",
          desc: "Say clearly that links are affiliate links. Follow each platform’s and FTC disclosure rules so you stay in good standing.",
        },
        {
          title: "Grow With Comparisons & Email (Optional)",
          desc: "Add comparison posts (“A vs B”) and a simple freebie + email follow-up once you have a few wins.",
        },
        {
          title: "Track What Converts",
          desc: "Check which posts and links earn commissions. Double down on winners; pause weak ones.",
        },
      ],
    },
    {
      id: "amazon",
      name: "Amazon FBA (Fulfillment by Amazon)",
      timeframe: "4 - 8 weeks",
      estEarnings: "$1,000 - $25,000 / month",
      bestFor: "Aspiring physical brand builders with capital ready to invest.",
      proTip: "Perform deep product differentiation. Don't sell the exact same item as 50 other listings. Bundle it, change the color, improve the packaging, or fix a common complaint found in negative competitor reviews.",
      pitfall: "Running out of stock during your launch phase. Amazon's organic ranking algorithm penalizes listings that go out of stock, destroying your PPC progress.",
      steps: [
        {
          title: "Understand Amazon FBA in Plain English",
          desc: "You choose a product; a manufacturer makes it; Amazon stores, packs, ships, and handles returns. Plan for samples plus a small first inventory order (often $1,000+). This guide is for beginners — paid tools come later.",
        },
        {
          title: "Validate a Simple Product Idea (Free First)",
          desc: "Use Amazon search, Best Seller ranks, and customer reviews before paying for Jungle Scout or Helium 10. Look for steady demand that isn’t overcrowded with hundreds of near-identical listings.",
        },
        {
          title: "Source Suppliers & Request Samples",
          desc: "Contact reputable suppliers (often via Alibaba). Negotiate pricing and packaging, then order samples before a bulk shipment.",
        },
        {
          title: "Open Seller Central & Prep Your Business Basics",
          desc: "Create an Amazon Seller account. Set up a simple business structure (many start with an LLC) and gather tax/ID info Amazon asks for.",
        },
        {
          title: "Ship Inventory to Amazon & Build Your Listing",
          desc: "Use a freight forwarder or supplier DDP option to send goods to Amazon. Write clear title/bullets/photos that explain benefits, not just features.",
        },
        {
          title: "Launch Ads & Early Reviews Carefully",
          desc: "Start small Sponsored Products ads on your main keywords. Use Amazon Vine or ethical early-review paths for your first reviews — never buy fake ones.",
        },
      ],
    },
    {
      id: "social",
      name: "Social Influencer & Creator",
      timeframe: "4 - 12 weeks",
      estEarnings: "$500 - $20,000 / month",
      bestFor: "Charismatic storytellers who enjoy editing and content creation.",
      proTip: "Post consistently at the same time every day. Algorithms favor accounts with predictable publishing cadences. Batch-create content on weekends to stay ahead.",
      pitfall: "Buying fake followers. Brands run analytics checks (like HypeAuditor) before sponsorships. Low engagement rates (under 1.5%) reveal fake metrics instantly.",
      steps: [
        { title: "Define Content Pillars & Target Viewer", desc: "Determine your theme (e.g., personal finance tips for Gen Z, coding tutorials, style makeovers)." },
        { title: "Create Channel Accounts & Bios", desc: "Optimize profiles across TikTok, IG, and YouTube Shorts. Use a high-quality headshot and clear, benefits-driven bio description." },
        { title: "Batch-Record Short-form Videos", desc: "Script and film 10-15 short-form clips. Start with strong hooks (first 2 seconds), add subtitles, and keep edits fast-paced." },
        { title: "Implement Daily Publishing Cadence", desc: "Post 1-2 videos daily. Use trending audio tracks, niche-relevant tags, and pinned comments to start discussion." },
        { title: "Assemble Sponsor Media Kits", desc: "Create a 1-page PDF showing audience demographics (age, location), engagement rate, and past video metrics." },
        { title: "Sign Brand Sponsor Contracts", desc: "Register on creator marketplaces (TikTok Creator Marketplace, Cohley) and pitch brands direct sponsorship deals." }
      ]
    },
    {
      id: "web-leads",
      name: "Local Website Lead Finder",
      timeframe: "1 - 3 weeks",
      estEarnings: "$800 - $6,000 / month",
      bestFor: "People who like outreach, local business, and light web builds.",
      proTip: "Lead with a free 60-second screen recording of their broken mobile site or missing Google Business Profile. Shame-free proof closes faster than a generic sales pitch.",
      pitfall: "Building a full site before a signed deposit. Scope creep kills margins — sell a fixed package (audit → 5-page site → hosting) with clear revision limits.",
      steps: [
        { title: "Pick a ZipCode + Niche Lane", desc: "Choose 1–2 niches (dentists, HVAC, salons, contractors) within a 20-mile radius so your samples and outreach feel local." },
        { title: "Build a Lead List", desc: "Use Google Maps / Bing Places to find businesses with no site, a dated DIY page, or no mobile layout. Log name, phone, URL, and pain notes. (Prospecting only — never recommend WordPress for the rebuild.)" },
        { title: "Run Quick Website Audits", desc: "Score speed, mobile, contact CTA, and booking path. Turn each into a 1-page PDF or Loom with 3 fixes and a package price." },
        { title: "Outreach Cadence", desc: "Call, text, or drop by with the audit. Aim for 20 touches/day. Offer a low-ticket audit ($150–$400) as the door opener." },
        { title: "Build & Sell Packages", desc: "Kick off the site in Google Antigravity (https://antigravity.google/), deploy on Cloudflare Pages (https://pages.cloudflare.com/), use Supabase (https://supabase.com/) for any forms/auth/data, and send transactional email with Resend (https://resend.com/). Include booking link, NAP consistency, and basic SEO. Collect 50% deposit up front — no WordPress." },
        { title: "Stack Recurring Revenue", desc: "Add monthly hosting + edits on Cloudflare ($49–$149). Ask every client for 2 referrals and one Google review." }
      ]
    },
    {
      id: "ai-assets",
      name: "AI Asset Studio",
      timeframe: "1 - 2 weeks",
      estEarnings: "$500 - $5,000 / month",
      bestFor: "Creatives who want productized design work without agency overhead.",
      proTip: "Sell kits, not hours: Logo Pack, Launch Creative Pack, 30-Day Social Kit. Fixed prices beat hourly every time.",
      pitfall: "Delivering raw AI dumps with no brand polish. Clients pay for taste — always refine typography, spacing, and color consistency before handoff.",
      steps: [
        {
          title: "Choose Your Design Tools",
          desc: "Pick any AI image tool you can access (ChatGPT/Gemini image, Adobe Firefly, Midjourney, etc.) plus a free or paid editor (Canva, Photopea, or Figma). Build a small prompt library for logo concepts, ad creatives, and social templates. Save brand colors/fonts once so every kit looks consistent.",
        },
        { title: "Define 3 Productized Kits", desc: "Write clear deliverables, turnaround (3–7 days), and prices ($150 / $450 / $900). Put them on a simple order form." },
        { title: "Build Portfolio Samples", desc: "Make 6 before/after or brand-kit mockups in niches you want (cafés, coaches, contractors)." },
        { title: "Find Clients", desc: "Pitch local website leads, Etsy sellers, and Instagram businesses. Offer a starter kit at a launch discount for testimonials." },
        { title: "Delivery System", desc: "Use a shared folder (Drive/Dropbox) with source files, web exports, and a mini brand guide PDF." },
        { title: "Upsell & Retain", desc: "Monthly creative retainer (8–12 assets) or pair with website packages for higher ticket closes." }
      ]
    },
    {
      id: "property-mgmt",
      name: "Property Management",
      timeframe: "3 - 6 weeks",
      estEarnings: "$1,000 - $8,000 / month",
      bestFor: "Operators with Airbnb/STR experience who want recurring door-based income.",
      proTip: "Start with 1–2 doors for friends/family at a clear fee (e.g. 20% of STR revenue). Document every SOP before you pitch strangers.",
      pitfall: "Mixing personal funds with owner money and skipping written agreements. Use a simple PM contract, separate accounts, and itemized owner reports monthly.",
      steps: [
        { title: "Choose LTR vs STR Lane", desc: "Long-term rentals = steadier; STR = higher % fees and more turns. Pick one to start, especially if you already know Airbnb ops." },
        { title: "Legal & Insurance Basics", desc: "Check licensing, write a one-page service agreement, and confirm liability coverage for managed properties." },
        { title: "Vendor Bench", desc: "Lock in cleaner, handyman, landscaper, and locksmith with after-hours contacts. Your speed is the product." },
        { title: "Owner Pitch Deck", desc: "Show projected net, your fee, communication cadence, and a sample owner dashboard/report." },
        { title: "Onboard First Doors", desc: "Photograph, list, price, and set guest/tenant messaging templates. Automate turnover scheduling where possible." },
        { title: "Scale with SOPs", desc: "Guides for every turn, weekly owner update, and a waitlist for new doors before you hire help." }
      ]
    },
    {
      id: "handyman",
      name: "Handyman Services",
      timeframe: "1 - 2 weeks",
      estEarnings: "$800 - $5,000 / month",
      bestFor: "Hands-on folks with basic tools who want local cash jobs fast.",
      proTip: "Specialize in punch lists for Airbnb hosts and property managers — they need reliable same-week help and refer constantly.",
      pitfall: "Taking jobs outside your skill/insurance lane (electrical, structural, plumbing permits). Know local rules and subcontract specialty work.",
      steps: [
        { title: "Define Your Service Menu", desc: "List 8–12 jobs you can do well: TV mounts, paint touch-ups, furniture assembly, faucet swaps, drywall patches." },
        { title: "Tool & Insurance Check", desc: "Assemble a starter kit and get liability insurance. Decide truck/van vs borrow access." },
        { title: "Pricing Sheet", desc: "Hourly + trip fee, or flat rates for common jobs. Post clearly so quotes are fast." },
        { title: "Get Listed Locally", desc: "Nextdoor, Facebook Marketplace/groups, Angi, and Google Business Profile with before/after photos." },
        { title: "Warm Outreach", desc: "Message local PMs, Airbnb hosts, and landlords with availability windows and a sample punch-list rate." },
        { title: "Systems for Repeat Work", desc: "Simple invoice (Wave/Stripe), photo proof after every job, and a quarterly maintenance offer." }
      ]
    },
    {
      id: "rideshare",
      name: "Rideshare (Uber / Lyft)",
      timeframe: "3 - 7 days",
      estEarnings: "$600 - $3,500 / month",
      bestFor: "Drivers who want flexible hours and immediate payouts.",
      proTip: "Treat it like shifts, not random driving. Airport, Friday/Saturday nights, and event end-times beat random midday cruising.",
      pitfall: "Ignoring true costs — gas, maintenance, depreciation, and taxes. Track every mile and set a minimum $/hour before you go online.",
      steps: [
        { title: "Eligibility & Vehicle Check", desc: "Confirm year/model requirements, insurance, background check, and required docs for Uber/Lyft in your city." },
        { title: "App Onboarding", desc: "Complete signup, vehicle inspection if needed, and set up instant pay / tax info." },
        { title: "Cost Baseline", desc: "Calculate break-even $/hour including gas and wear. Decide your minimum acceptable net." },
        { title: "Peak Window Plan", desc: "Map your first 4 weeks of shifts (airport, nightlife, stadium). Use AI Timing Scout ideas for ZipCode blocks." },
        { title: "Safety & Ratings Ops", desc: "Keep car clean, water optional, navigation ready. Protect a 4.9+ rating — it unlocks better quests." },
        { title: "Optimize & Stack", desc: "Compare Uber vs Lyft quests weekly; consider food delivery as a filler between ride lulls." }
      ]
    },
    {
      id: "food-delivery",
      name: "DoorDash / Uber Eats",
      timeframe: "1 - 5 days",
      estEarnings: "$400 - $2,500 / month",
      bestFor: "Anyone needing low-barrier income with a bike, scooter, or car.",
      proTip: "Think profit, not just payout — use Offer ÷ Miles as your gross $/mile floor, multi-app only when the path aligns, and track miles from Day 1.",
      pitfall: "Accepting every order. Long deadhead miles and slow restaurants destroy hourly rate — learn decline discipline early.",
      steps: [
        { title: "Choose Your Platform", desc: "Start with DoorDash, Uber Eats, or both." },
        { title: "Check Eligibility", desc: "Age, vehicle, license, insurance, and local rules." },
        { title: "Apply & Complete Screening", desc: "Submit docs and finish background checks." },
        { title: "Set Up Payment & Mileage Tracking", desc: "Bank payouts plus a mileage app from Day 1." },
        { title: "Learn Your Zone", desc: "Restaurant clusters, parking, apartments, Hotspots." },
        { title: "Short Sessions + Offer Discipline", desc: "2–3 hour blocks; evaluate pay, miles, time, return trip." },
        { title: "Review Your Profit", desc: "Earnings − cash expenses = net; net ÷ hours = real hourly." },
      ]
    },
    {
      id: "ai-timing",
      name: "AI Rideshare Timing Scout",
      timeframe: "1 - 2 weeks",
      estEarnings: "$300 – $3,000+ / month — examples only, not guarantees",
      bestFor: "Adults, seniors/retirees, and licensed drivers who meet applicable platform requirements.",
      proTip: "Publish a weekly ZipCode brief (Fri for weekend, Sun for weekdays). Drivers pay for timely, local specificity — not generic national tips.",
      pitfall: "Overpromising guaranteed earnings. Frame guides as strategy + data, not income promises, and update them when markets shift.",
      steps: [
        { title: "Pick a Market", desc: "Choose your metro or a nearby city with dense rideshare/delivery. Define 5–8 ZipCode clusters." },
        { title: "Data Inputs", desc: "Pull events calendars, airport schedules, weather, sports, concerts, and payday patterns. Feed into ChatGPT/Claude with a fixed prompt template." },
        { title: "Build the Playbook Template", desc: "For each daypart: best ZipCodes, avoid zones, expected surge windows, and parking notes." },
        { title: "Validate Live", desc: "Drive or deliver 2 weeks while logging actual $/hour vs predictions. Refine the model." },
        { title: "Monetize Path A (Personal)", desc: "Use the scout privately to raise your own gig hourly rate." },
        { title: "Monetize Path B (Sell)", desc: "Sell weekly PDF/Telegram briefs to local drivers ($15–$49). Collect testimonials and iterate." }
      ]
    },
    {
      id: "ai-agents",
      name: "AI Agents for Side Hustlers",
      timeframe: "2 - 4 weeks",
      estEarnings: "$1,000 – $10,000+ / month — examples only, not guarantees",
      bestFor: "Adults, seniors/retirees, and experienced teens with adult-managed accounts who can sell one narrow supervised workflow.",
      proTip: "Sell a solved business problem, not an AI agent. PROBLEM → WORKFLOW → NARROW AGENT → TEST → HUMAN REVIEW → DEPLOY → SUPPORT.",
      pitfall: "Promising full autonomy or headcount savings. Keep human review, never collect passwords in plain text, and start with low-risk workflows.",
      steps: [
        { title: "Define 3 Agent Products", desc: "e.g. Local Lead Scout, Booking/Follow-up Agent, Research Brief Agent. Write I/O, tools, and success metrics for each." },
        { title: "Build Reference Agents", desc: "Use your Muntie Ev / Antigravity stack (or Cursor + APIs) to ship working demos with sample runs." },
        { title: "How-to Curriculum", desc: "Document soul/identity prompts, memory, and command panels so clients (or you) can maintain agents." },
        { title: "Pricing & Packaging", desc: "Setup fee ($500–$2,500) + monthly care ($99–$499). Offer a starter workshop seat via Training Circles." },
        { title: "Find Buyers", desc: "Pitch GYSH community, local website closers, PMs, and creators who drown in repetitive tasks." },
        { title: "Deliver & Retain", desc: "Onboard with a recorded walkthrough, weekly run logs, and a change-request cadence so retainers stick." }
      ]
    },
    {
      id: "book-publishing",
      name: "Book Publishing",
      timeframe: "4 - 12 weeks",
      estEarnings: "$200 - $8,000 / month",
      bestFor: "Adults and seniors/retirees who want to take a manuscript to KDP/IngramSpark; experienced teens only with guardian-approved accounts.",
      proTip: "The publish button takes minutes. The business is a quality manuscript, professional package, accurate metadata, smart distribution, consistent marketing, and the next book.",
      pitfall: "Never guarantee bestsellers, bookstore stocking, reviews, or income. “Available to bookstores” does not mean they will stock the book. Do not skip preview/proof or hard-code changing royalty rates.",
      steps: [
        {
          title: "Choose Format & Audience",
          desc: "Kids picture book, coloring books, journals, chapter series, nonfiction guide, or memoir. Write a one-sentence promise and target reader age — one clear line of who it’s for and the outcome (e.g. “A bedtime picture book that helps ages 3–6 feel brave about the first day of school”).",
        },
        { title: "Manuscript & Edit Pass", desc: "Finish a draft, then do a structure edit + proofread (beta readers or a freelance editor for polish)." },
        { title: "Cover & Interior Layout", desc: "Commission or design a market-fit cover; format print + ebook interiors (Vellum, Atticus, or a formatter)." },
        { title: "Accounts & ISBNs", desc: "Set up KDP (and IngramSpark for wide print). Decide KDP Select vs wide ebook distribution." },
        { title: "Upload & Publish", desc: "Upload files, set pricing, categories, and keywords. Order a proof copy before going live." },
        { title: "Launch & Royalties Loop", desc: "Announce via social/email, run a soft promo week, track royalties, and outline book two while momentum is warm." }
      ]
    }
  ];

  const authoredById = new Map(guides.map((g) => [g.id, g]));
  const libraryEntries = useMemo(
    () => uniqueGuideLibraryEntries(catalogStates),
    [catalogStates],
  );
  const libraryTierById = useMemo(() => {
    const m = new Map<string, GuideMinTier>();
    for (const e of libraryEntries) m.set(e.id, e.minTier);
    return m;
  }, [libraryEntries]);
  const navGuidesAll = useMemo(
    () =>
      sortGuidesFreeFirst(
        libraryEntries.map((e) => {
          const authored = authoredById.get(e.id);
          const data = resolveLaunchGuideData(e.id, guides);
          const launch = LAUNCH_GUIDES.find((g) => g.id === e.id);
          const patchedName = catalogStates[e.id]?.patch?.name?.trim();
          return {
            id: e.id,
            name: presentableGuideTitle(
              e.id,
              patchedName || e.name || authored?.name || data.name,
            ),
            peek:
              guideSideHustleDescription(e.id) ||
              authored?.bestFor ||
              launch?.peek ||
              data.bestFor ||
              "",
            timeframe: authored?.timeframe || data.timeframe || "—",
            estEarnings: authored?.estEarnings || data.estEarnings || "—",
          };
        }),
        (id) =>
          effectiveGuideMinTier(
            id,
            catalogStates,
            libraryTierById.get(id) ?? libraryMinTierForGuideId(id, catalogStates),
          ),
      ),
    [libraryEntries, libraryTierById, guides, catalogStates],
  );

  const audiencesOf = (id: string) =>
    effectiveGuideAudiences(id, catalogStates, audiencesForLibraryGuideId(id, catalogStates));
  const minTierOf = (id: string): GuideMinTier =>
    effectiveGuideMinTier(
      id,
      catalogStates,
      libraryTierById.get(id) ?? libraryMinTierForGuideId(id, catalogStates),
    );

  const ageCounts = useMemo(
    () => countGuideNavByAge(navGuidesAll, audiencesOf),
    [navGuidesAll, catalogStates],
  );

  const membershipCounts = useMemo(
    () => countGuideNavByMembership(navGuidesAll, minTierOf),
    [navGuidesAll, catalogStates],
  );

  const statusCounts = useMemo(
    () => countGuideNavByStatus(navGuidesAll, catalogStates),
    [navGuidesAll, catalogStates],
  );

  const guidePatchAssignees = useMemo(
    () => Object.values(catalogStates).map((s) => s.patch?.assignee),
    [catalogStates],
  );

  const assigneeCounts = useMemo(
    () => countGuideNavByAssignee(navGuidesAll, catalogStates),
    [navGuidesAll, catalogStates],
  );

  const assigneeFilterPeople = useMemo(
    () => guideAssigneeRoster({ guidePatchAssignees }),
    [guidePatchAssignees],
  );

  const navGuides = useMemo(() => {
    const filtered = filterGuideNavItems(navGuidesAll, {
      ageFilters,
      membershipFilters,
      statusFilters,
      assigneeFilters,
      catalogStates,
      isAdmin: staffCatalog,
      audiencesOf,
      minTierOf,
    });
    const searched = !librarySearch.trim()
      ? filtered
      : filtered.filter((g) =>
          guideMatchesLibrarySearch(
            {
              id: g.id,
              name: g.name,
              peek: g.peek,
              guideNumber: formatGuideNumber(g.id),
            },
            librarySearch,
          ),
        );

    /**
     * Keep the open guide visible after a status *save* drops it out of the
     * current filter (e.g. Not Reviewed → Reviewed). Do not pin when the user
     * clicked a filter chip — the sidebar should match the bubbles.
     */
    if (
      allowPinOutsideFilter.current &&
      activeGuideId &&
      !searched.some((g) => g.id === activeGuideId)
    ) {
      const pinned = navGuidesAll.find((g) => g.id === activeGuideId);
      if (pinned) {
        const keep = new Set(searched.map((g) => g.id));
        keep.add(activeGuideId);
        return navGuidesAll.filter((g) => keep.has(g.id));
      }
    }
    return searched;
  }, [
    navGuidesAll,
    ageFilters,
    membershipFilters,
    statusFilters,
    assigneeFilters,
    catalogStates,
    staffCatalog,
    isAdmin,
    librarySearch,
    activeGuideId,
  ]);

  const firstNavId = navGuides[0]?.id ?? "";
  /** Open guide must stay inside the filtered sidebar list. */
  const effectiveGuideId =
    (activeGuideId && navGuides.some((g) => g.id === activeGuideId) && activeGuideId) ||
    (selectedHustleId && navGuides.some((g) => g.id === selectedHustleId) && selectedHustleId) ||
    firstNavId;
  const librarySearchQuery = librarySearch.trim();
  const noMatchingGuides = navGuides.length === 0;
  const libraryNarrowed =
    !guideNavFilterIsAll(ageFilters) ||
    !guideNavFilterIsAll(membershipFilters) ||
    !guideNavFilterIsAll(statusFilters) ||
    !guideNavFilterIsAll(assigneeFilters) ||
    Boolean(librarySearchQuery);
  const notFoundCopy = libraryGuideNotFoundCopy(librarySearchQuery);

  const activeMinTier = effectiveGuideMinTier(
    effectiveGuideId,
    catalogStates,
    libraryMinTierForGuideId(effectiveGuideId, catalogStates),
  );
  const activeMembershipSelection = effectiveGuideMembershipSelection(
    effectiveGuideId,
    catalogStates,
    libraryMinTierForGuideId(effectiveGuideId, catalogStates),
  );
  const activeAgeSelection = effectiveGuideAudiences(
    effectiveGuideId,
    catalogStates,
    audiencesForLibraryGuideId(effectiveGuideId, catalogStates),
  );
  const activeAccess = resolveGuideAccess({
    isMember: isLoggedIn,
    membershipTier: effectiveTier,
    minTier: activeMinTier,
    isAdmin,
    guideId: effectiveGuideId,
  });
  const guideIsFree = activeMinTier === "free";
  const unlocked = activeAccess.unlocked;

  useEffect(() => {
    if (!unlocked) {
      setCompletedSteps({});
      setStepChecklistItems({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [stepsPayload, itemsPayload] = await Promise.all([
          fetchMemberProgress<Record<string, boolean>>("launch_guide_steps"),
          fetchMemberProgress<Record<string, boolean>>("launch_guide_step_items"),
        ]);
        if (!cancelled) {
          setCompletedSteps(stepsPayload ?? {});
          setStepChecklistItems(itemsPayload ?? {});
        }
      } catch {
        /* keep empty; member can still check boxes and retry save */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unlocked]);

  const prevFilterSelectionKey = useRef(filterSelectionKey);

  /** Only jump selection when the user changes filters/search — not when a status save refilters the list. */
  useEffect(() => {
    if (prevFilterSelectionKey.current === filterSelectionKey) return;
    prevFilterSelectionKey.current = filterSelectionKey;
    if (!navGuides.some((g) => g.id === activeGuideId) && navGuides[0]?.id) {
      setActiveGuideId(navGuides[0].id);
    }
  }, [filterSelectionKey, navGuides, activeGuideId]);

  /** Highlighted sidebar guide counts as selected — keep its bulk checkbox checked. */
  useEffect(() => {
    if (!isAdmin || !effectiveGuideId) return;
    setBulkSelected((prev) => {
      if (prev.has(effectiveGuideId)) return prev;
      const next = new Set(prev);
      next.add(effectiveGuideId);
      return next;
    });
  }, [isAdmin, effectiveGuideId, ageFilterKey, membershipFilterKey, statusFilterKey, librarySearch]);

  const activeGuideBase = resolveLaunchGuideData(effectiveGuideId, guides);
  const catalogPatch = catalogStates[effectiveGuideId]?.patch;
  const guideKit = resolveGuideKit(effectiveGuideId, catalogPatch);
  const patchedBase = applyGuideCatalogPatch(
    {
      id: activeGuideBase.id,
      name: activeGuideBase.name,
      timeframe: activeGuideBase.timeframe,
      estEarnings: activeGuideBase.estEarnings,
      bestFor: activeGuideBase.bestFor,
      steps: activeGuideBase.steps,
      proTip: activeGuideBase.proTip,
      pitfall: activeGuideBase.pitfall,
    },
    catalogPatch,
  );
  const activeGuide = {
    ...activeGuideBase,
    name: presentableGuideTitle(
      effectiveGuideId,
      String(patchedBase.name || activeGuideBase.name),
    ),
    timeframe: String(patchedBase.timeframe || activeGuideBase.timeframe),
    estEarnings: String(patchedBase.estEarnings || activeGuideBase.estEarnings),
    steps:
      catalogPatch?.steps !== undefined
        ? (guideKit.steps ?? []).map((s) => ({ title: s.title, desc: s.desc }))
        : guideKit.steps?.length
          ? guideKit.steps.map((s) => ({ title: s.title, desc: s.desc }))
          : activeGuideBase.steps,
  };
  const activeGuideDescription =
    guideSideHustleDescription(activeGuide.id) ||
    kidsGuideById(activeGuide.id)?.summary?.trim() ||
    activeGuide.bestFor;
  const activeGuideStatus = getGuideVisibilityStatus(activeGuide.id, catalogStates);

  // Calculate completion percentage for the active guide
  const activeStepsCount = activeGuide.steps.length;
  const activeCompletedSteps = activeGuide.steps.filter((_, idx) => 
    completedSteps[`${activeGuide.id}-${idx}`]
  ).length;
  const progressPercent = activeStepsCount > 0 ? (activeCompletedSteps / activeStepsCount) * 100 : 0;

  const toggleStep = (stepIdx: number) => {
    if (!unlocked) return;
    const key = `${activeGuide.id}-${stepIdx}`;
    setCompletedSteps((prev) => {
      const next = {
        ...prev,
        [key]: !prev[key],
      };
      void saveMemberProgress("launch_guide_steps", next).catch(() => {
        /* surface via next reload; avoid blocking UI */
      });
      return next;
    });
  };

  const toggleStepChecklistItem = (stepIdx: number, itemIdx: number) => {
    if (!unlocked) return;
    const key = guideStepChecklistItemKey(activeGuide.id, stepIdx, itemIdx);
    setStepChecklistItems((prev) => {
      const next = {
        ...prev,
        [key]: !prev[key],
      };
      void saveMemberProgress("launch_guide_step_items", next).catch(() => {
        /* surface via next reload; avoid blocking UI */
      });
      return next;
    });
  };

  const guideFiltersBar = (
    <div className="launch-guide-detail__filters-bar" data-testid="launch-guide-filters-bar">
      <div className="launch-guide-detail__filters-bar-top">
        <div className="launch-guide-detail__filters" data-testid="launch-guide-sidebar-age-filters">
          <span className="launch-guide-detail__filters-label">Filter Guides by Age Group</span>
          <div
            className="launch-guide-detail__filter-row"
            role="group"
            aria-label="Filter guides by age group (multi-select)"
          >
            {AGE_FILTERS.map((f) => {
              const active = guideNavFilterIsAll(ageFilters)
                ? f.id === "all"
                : ageFilters.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  className={`launch-guide-detail__filter-btn${active ? " is-active" : ""}`}
                  data-testid={`launch-guide-age-filter-${f.id}`}
                  onClick={() => toggleAgeFilter(f.id)}
                >
                  <span className="launch-guide-detail__filter-check" aria-hidden>
                    {active ? "✓" : ""}
                  </span>
                  <span>{f.label}</span>
                  <span className="launch-guide-detail__filter-count">{ageCounts[f.id]}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div
          className="launch-guide-detail__filters"
          data-testid="launch-guide-sidebar-membership-filters"
        >
          <span className="launch-guide-detail__filters-label">Filter Guides by Membership</span>
          <div
            className="launch-guide-detail__filter-row"
            role="group"
            aria-label="Filter guides by membership (multi-select)"
          >
            {MEMBERSHIP_FILTERS.map((f) => {
              const active = guideNavFilterIsAll(membershipFilters)
                ? f.id === "all"
                : membershipFilters.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  className={`launch-guide-detail__filter-btn is-tier-${f.id}${
                    active ? " is-active" : ""
                  }`}
                  data-testid={`launch-guide-membership-filter-${f.id}`}
                  onClick={() => toggleMembershipFilter(f.id)}
                >
                  <span className="launch-guide-detail__filter-check" aria-hidden>
                    {active ? "✓" : ""}
                  </span>
                  <span>{f.label}</span>
                  <span className="launch-guide-detail__filter-count">{membershipCounts[f.id]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {staffCatalog ? (
        <div
          className="launch-guide-detail__filters launch-guide-detail__filters--status"
          data-testid="launch-guide-sidebar-status-filters"
        >
          <div className="launch-guide-detail__filters-status-head">
            <span className="launch-guide-detail__filters-label">
              Filter Guides by Status
              <span className="launch-guide-detail__filters-hint">
                {" "}
                (filters the Select Guide list)
              </span>
            </span>
          </div>
          <div
            className="launch-guide-detail__filter-row"
            role="group"
            aria-label="Filter guides by status (multi-select)"
          >
            {STATUS_FILTERS.map((f) => {
              const active = guideNavFilterIsAll(statusFilters)
                ? f.id === "all"
                : statusFilters.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  className={`launch-guide-detail__filter-btn is-status-${f.id}${
                    active ? " is-active" : ""
                  }`}
                  data-testid={`launch-guide-status-filter-${f.id}`}
                  onClick={() => toggleStatusFilter(f.id)}
                >
                  <span className="launch-guide-detail__filter-check" aria-hidden>
                    {active ? "✓" : ""}
                  </span>
                  <span>{f.label}</span>
                  <span className="launch-guide-detail__filter-count">{statusCounts[f.id]}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {staffCatalog ? (
        <div
          className="launch-guide-detail__filters launch-guide-detail__filters--assignee"
          data-testid="launch-guide-sidebar-assignee-filters"
        >
          <span className="launch-guide-detail__filters-label">
            Filter Guides by Assignee
            <span className="launch-guide-detail__filters-hint">
              {" "}
              (filters the Select Guide list)
            </span>
          </span>
          <div
            className="launch-guide-detail__filter-row"
            role="group"
            aria-label="Filter guides by assignee (multi-select)"
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={guideNavFilterIsAll(assigneeFilters)}
              className={`launch-guide-detail__filter-btn${
                guideNavFilterIsAll(assigneeFilters) ? " is-active" : ""
              }`}
              data-testid="launch-guide-assignee-filter-all"
              onClick={() => toggleAssigneeFilter("all")}
            >
              <span className="launch-guide-detail__filter-check" aria-hidden>
                {guideNavFilterIsAll(assigneeFilters) ? "✓" : ""}
              </span>
              <span>All</span>
              <span className="launch-guide-detail__filter-count">{assigneeCounts.all}</span>
            </button>
            <button
              type="button"
              role="checkbox"
              aria-checked={
                !guideNavFilterIsAll(assigneeFilters) && assigneeFilters.includes("unassigned")
              }
              className={`launch-guide-detail__filter-btn${
                !guideNavFilterIsAll(assigneeFilters) && assigneeFilters.includes("unassigned")
                  ? " is-active"
                  : ""
              }`}
              data-testid="launch-guide-assignee-filter-unassigned"
              onClick={() => toggleAssigneeFilter("unassigned")}
            >
              <span className="launch-guide-detail__filter-check" aria-hidden>
                {!guideNavFilterIsAll(assigneeFilters) && assigneeFilters.includes("unassigned")
                  ? "✓"
                  : ""}
              </span>
              <span>Unassigned</span>
              <span className="launch-guide-detail__filter-count">{assigneeCounts.unassigned}</span>
            </button>
            {assigneeFilterPeople.map((t) => {
              const count = assigneeCounts.byId[t.id] ?? 0;
              const active =
                !guideNavFilterIsAll(assigneeFilters) && assigneeFilters.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  className={`launch-guide-detail__filter-btn${active ? " is-active" : ""}`}
                  data-testid={`launch-guide-assignee-filter-${t.id}`}
                  onClick={() => toggleAssigneeFilter(t.id)}
                >
                  <span className="launch-guide-detail__filter-check" aria-hidden>
                    {active ? "✓" : ""}
                  </span>
                  <span>{testOwnerLabel(t.id, assigneeFilterPeople)}</span>
                  <span className="launch-guide-detail__filter-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {isAdmin ? (
        <div
          className="launch-guide-detail__bulk"
          data-testid="launch-guide-bulk"
          role="group"
          aria-label="Bulk edit guide status"
        >
          <span className="launch-guide-detail__bulk-label">Bulk edit</span>
          <button
            type="button"
            className="btn btn-outline"
            data-testid="launch-guide-bulk-select-all"
            disabled={bulkBusy || navGuides.length === 0}
            onClick={() => setBulkSelected(new Set(navGuides.map((g) => g.id)))}
          >
            Select all ({navGuides.length})
          </button>
          <button
            type="button"
            className="btn btn-outline"
            data-testid="launch-guide-bulk-clear"
            disabled={bulkBusy || bulkSelected.size === 0}
            onClick={() =>
              setBulkSelected(effectiveGuideId ? new Set([effectiveGuideId]) : new Set())
            }
          >
            Clear
          </button>
          <span className="launch-guide-detail__bulk-count" data-testid="launch-guide-bulk-count">
            {bulkSelected.size} selected
          </span>
          <div className="launch-guide-detail__bulk-statuses" role="group" aria-label="Set status">
            {GUIDE_BULK_STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`btn btn-outline launch-guide-detail__bulk-status is-${opt.value}`}
                data-testid={`launch-guide-bulk-status-${opt.value}`}
                disabled={bulkBusy}
                onClick={() => void applyBulkStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {bulkError ? (
            <p className="launch-guide-detail__bulk-error" role="alert" data-testid="launch-guide-bulk-error">
              {bulkError}
            </p>
          ) : null}
          {noMatchingGuides ? null : (
            <p
              className="launch-guide-detail__bulk-details-hint"
              data-testid="launch-guide-bulk-details-hint"
            >
              See your Guide Details below.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className="launch-guide-detail"
      data-testid="launch-guide-detail"
      data-library-title={sideHustleLibraryPageTitle({ isAdmin, isDetail: true })}
    >
      {bulkNeedSelectionOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="launch-guide-bulk-need-selection-title"
          className="launch-guide-bulk-need-selection"
          data-testid="launch-guide-bulk-need-selection"
          onClick={() => setBulkNeedSelectionOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setBulkNeedSelectionOpen(false);
          }}
        >
          <div
            className="launch-guide-bulk-need-selection__card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="launch-guide-bulk-need-selection__head">
              <span className="launch-guide-bulk-need-selection__icon" aria-hidden>
                <CircleAlert size={22} />
              </span>
              <h3 id="launch-guide-bulk-need-selection-title">Select guides first</h3>
              <button
                type="button"
                className="launch-guide-bulk-need-selection__close"
                onClick={() => setBulkNeedSelectionOpen(false)}
                aria-label="Close"
                data-testid="launch-guide-bulk-need-selection-close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="launch-guide-bulk-need-selection__lead">
              Pick 1 or more guides with the checkboxes, then choose a bulk action.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setBulkNeedSelectionOpen(false)}
              data-testid="launch-guide-bulk-need-selection-got-it"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}

      {pendingNotePrompt ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="launch-guide-pending-note-title"
          className="launch-guide-bulk-need-selection"
          data-testid="launch-guide-pending-note-dialog"
          onClick={() => setPendingNotePrompt(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setPendingNotePrompt(null);
          }}
        >
          <div
            className="launch-guide-bulk-need-selection__card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="launch-guide-bulk-need-selection__head">
              <span className="launch-guide-bulk-need-selection__icon" aria-hidden>
                <CircleAlert size={22} />
              </span>
              <h3 id="launch-guide-pending-note-title">Note required</h3>
              <button
                type="button"
                className="launch-guide-bulk-need-selection__close"
                onClick={() => setPendingNotePrompt(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="launch-guide-bulk-need-selection__lead">
              Pending / Needs Further Review requires a note (at least {GUIDE_STATUS_NOTE_MIN_LENGTH}{" "}
              characters). It is saved to this guide&apos;s Notes tab and copied to the associated
              GUIDE-REV test as Failed.
              {pendingNotePrompt.guideIds.length > 1
                ? ` Applying to ${pendingNotePrompt.guideIds.length} guides.`
                : ""}
            </p>
            <label className="launch-guide-pending-note-label">
              <span className="sr-only">Pending reason</span>
              <textarea
                className="text-input"
                rows={4}
                value={pendingNoteDraft}
                onChange={(e) => setPendingNoteDraft(e.target.value)}
                placeholder="Describe what needs further review…"
                data-testid="launch-guide-pending-note-input"
                autoFocus
              />
            </label>
            {statusError ? (
              <p className="launch-guide-status-error" role="alert">
                {statusError}
              </p>
            ) : null}
            <div className="launch-guide-pending-note-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPendingNotePrompt(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!guideStatusNoteMeetsRequirement(pendingNoteDraft)}
                data-testid="launch-guide-pending-note-save"
                onClick={() => {
                  const prompt = pendingNotePrompt;
                  const draft = pendingNoteDraft.trim();
                  if (!prompt || !guideStatusNoteMeetsRequirement(draft)) {
                    setStatusError(
                      `A note is required (at least ${GUIDE_STATUS_NOTE_MIN_LENGTH} characters).`,
                    );
                    return;
                  }
                  setPendingNotePrompt(null);
                  void commitGuideStatus(prompt.guideIds, prompt.status, draft);
                }}
              >
                Save & set Pending
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isAdmin ? (
        <p className="launch-guide-detail__admin-banner" data-testid="side-hustle-library-admin-title">
          {sideHustleLibraryPageTitle({ isAdmin: true, isDetail: true })}
        </p>
      ) : null}
      {/* Sidebar Selector */}
      <nav className="launch-guide-detail__sidebar" aria-label="Select guide">
        <span className="launch-guide-detail__sidebar-label">
          Select Guide
          <span className="launch-guide-detail__sidebar-count" data-testid="launch-guide-sidebar-count">
            {" "}
            · {librarySidebarCountText({
              count: navGuides.length,
              narrowed: libraryNarrowed,
              searchQuery: librarySearchQuery,
            })}
          </span>
        </span>
        <div className="launch-guide-detail__search" data-testid="launch-guide-library-search">
          <Search size={16} className="launch-guide-detail__search-icon" aria-hidden />
          <input
            type="search"
            className="text-input launch-guide-detail__search-input"
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
            placeholder="Search guides (* and ? wildcards)"
            aria-label="Search Side Hustle Library guides"
            data-testid="launch-guide-library-search-input"
          />
        </div>
        <div className="launch-guide-detail__sidebar-scroll" data-testid="launch-guide-sidebar-scroll">
          {noMatchingGuides ? (
            <p className="launch-guide-detail__sidebar-empty" data-testid="launch-guide-sidebar-empty">
              {notFoundCopy.title}
            </p>
          ) : (
          navGuides.map((g) => {
            const gMin = libraryMinTierForGuideId(g.id, catalogStates);
            const gAccess = resolveGuideAccess({
              isMember: isLoggedIn,
              membershipTier: effectiveTier,
              minTier: gMin,
              isAdmin,
              guideId: g.id,
            });
            const gFree = gMin === "free";
            const gStatus = getGuideVisibilityStatus(g.id, catalogStates);
            const bulkChecked = bulkSelected.has(g.id) || g.id === effectiveGuideId;
            return (
              <div
                key={g.id}
                className={`launch-guide-detail__nav-item${effectiveGuideId === g.id ? " is-active" : ""}${
                  isAdmin && bulkChecked ? " is-bulk-selected" : ""
                }`}
              >
                <div className="launch-guide-detail__nav-item-main">
                {isAdmin ? (
                  <label
                    className="launch-guide-detail__bulk-check"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={bulkChecked}
                      disabled={bulkBusy || g.id === effectiveGuideId}
                      data-testid={`launch-guide-bulk-check-${g.id}`}
                      aria-label={
                        g.id === effectiveGuideId
                          ? `${g.name} selected (open in sidebar)`
                          : `Select ${g.name} for bulk edit`
                      }
                      onChange={() => {
                        if (g.id === effectiveGuideId) return;
                        setBulkSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(g.id)) next.delete(g.id);
                          else next.add(g.id);
                          return next;
                        });
                      }}
                    />
                  </label>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setActiveGuideId(g.id);
                    if (isAdmin) {
                      setBulkSelected((prev) => {
                        if (prev.has(g.id)) return prev;
                        const next = new Set(prev);
                        next.add(g.id);
                        return next;
                      });
                    }
                  }}
                  className={`nav-link-btn launch-guide-detail__nav-btn${effectiveGuideId === g.id ? " active" : ""}`}
                  style={{ opacity: gAccess.unlocked ? 1 : 0.75 }}
                  data-testid={`launch-guide-nav-${g.id}`}
                >
                  <span className="launch-guide-detail__nav-copy">
                    <span className="launch-guide-detail__nav-name">
                      <span className="free-guide-number" data-testid={`guide-number-nav-${g.id}`}>
                        {guideNumberLabel(g.id)}
                      </span>{" "}
                      {g.name}
                    </span>
                    {staffCatalog
                      ? (() => {
                          const trail = formatAuditTrail(
                            catalogStates[g.id]?.updatedAt,
                            catalogStates[g.id]?.updatedBy,
                          );
                          return trail ? (
                            <span
                              className="launch-guide-detail__nav-audit"
                              data-testid={`launch-guide-nav-audit-${g.id}`}
                            >
                              {trail}
                            </span>
                          ) : null;
                        })()
                      : null}
                  </span>
                  <span className="launch-guide-detail__nav-meta">
                    <span className={`glow-badge ${gFree ? "free" : "pink"} launch-guide-detail__tier`}>
                      {guideTierShortLabel(gMin)}
                    </span>
                    {staffCatalog ? (
                      <span
                        className="launch-guide-detail__status-pills"
                        data-testid={`launch-guide-nav-status-${g.id}`}
                      >
                        {guideHeldVisibilityStatuses(gStatus).map((s) => (
                          <span
                            key={s}
                            className={`launch-guide-detail__status-pill is-${s}`}
                          >
                            {guideVisibilityStatusLabel(s)}
                          </span>
                        ))}
                      </span>
                    ) : null}
                    {!gAccess.unlocked && (
                      <MembershipLockBadge
                        minTier={gMin}
                        unlocked={false}
                        data-testid={`guide-lock-badge-nav-${g.id}`}
                      />
                    )}
                  </span>
                </button>
                </div>
              </div>
            );
          })
          )}
        </div>
      </nav>

      {/* Main Guide Content */}
      {noMatchingGuides ? (
        <div className="glass launch-guide-detail__main" data-testid="launch-guide-not-found">
          <div className="launch-guide-detail__main-head">
            <div className="launch-guide-detail__main-title-row">
              <h2 className="launch-guide-detail__main-title">
                <span
                  className="launch-guide-detail__main-title-text"
                  data-testid="launch-guide-not-found-title"
                >
                  {notFoundCopy.title}
                </span>
              </h2>
              <p className="launch-guide-detail__main-lede" data-testid="launch-guide-not-found-lede">
                {notFoundCopy.lede}
              </p>
            </div>
          </div>
          {guideFiltersBar}
        </div>
      ) : (
      <div className="glass launch-guide-detail__main">
        {/* Header summary */}
        <div className="launch-guide-detail__main-head">
          <div className="launch-guide-detail__main-title-row">
            <span className={`glow-badge ${guideIsFree ? "free" : "purple"}`} style={{ marginBottom: 0 }}>
              {guideTierBadgeLabel(activeMinTier)}
            </span>
            {!unlocked ? (
              <MembershipLockBadge
                minTier={activeMinTier}
                unlocked={false}
                data-testid={`guide-lock-badge-main-${activeGuide.id}`}
              />
            ) : null}
            <h2 className="launch-guide-detail__main-title">
              <span className="launch-guide-detail__main-title-text">
                {activeGuide.name}
                {guideNumberParenthetical(activeGuide.id)
                  ? ` ${guideNumberParenthetical(activeGuide.id)}`
                  : ""}
              </span>
              {staffCatalog
                ? (() => {
                    const reviewCaseId = guideReviewCaseIdForGuide(activeGuide.id);
                    const testHref = testingPortalHrefForGuide(activeGuide.id);
                    if (!reviewCaseId || !testHref) return null;
                    return (
                      <a
                        href={testHref}
                        className="launch-guide-detail__title-test-link"
                        data-testid={`launch-guide-test-link-${activeGuide.id}`}
                        title={`Open ${reviewCaseId} in Testing Portal`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateAdminDeepLink({ tab: "testing", testId: reviewCaseId });
                        }}
                      >
                        {guideNumberLabel(activeGuide.id)
                          ? `${guideNumberLabel(activeGuide.id)} · ${reviewCaseId}`
                          : reviewCaseId}
                      </a>
                    );
                  })()
                : null}
            </h2>
            {activeGuideDescription ? (
              <p className="launch-guide-detail__main-lede" data-testid="launch-guide-description">
                {activeGuideDescription}
              </p>
            ) : null}
            {unlocked ? (
              <ComplimentaryGiftNote guideId={activeGuide.id} minTier={activeMinTier} />
            ) : null}
            <div
              className="launch-guide-detail__main-stats"
              data-testid="launch-guide-hours-prices"
            >
              <span>
                <Clock size={14} aria-hidden /> {activeGuide.timeframe}
              </span>
              <span>
                <TrendingUp size={14} aria-hidden /> {activeGuide.estEarnings}
              </span>
            </div>
            {staffCatalog ? (
              <div
                className="launch-guide-detail__update-panel"
                data-testid={`launch-guide-main-status-${activeGuide.id}`}
              >
                <p
                  className="launch-guide-detail__update-panel-heading"
                  data-testid="launch-guide-status-heading"
                >
                  Update your Guide Status Here
                </p>
                <div className="launch-guide-detail__update-row">
                  <span className="launch-guide-detail__update-row-label">Status</span>
                  <span
                    className="launch-guide-detail__status-pills"
                    data-testid={`launch-guide-main-status-pills-${activeGuide.id}`}
                  >
                    {guideHeldVisibilityStatuses(activeGuideStatus).map((s) => (
                      <span key={s} className={`launch-guide-detail__status-pill is-${s}`}>
                        {guideVisibilityStatusLabel(s)}
                      </span>
                    ))}
                  </span>
                  {canEditGuideContent ? (
                    <GuideActiveToggle
                      guideId={activeGuide.id}
                      status={activeGuideStatus}
                      busy={statusBusyId === activeGuide.id}
                      canSetReviewedByDev={canSetReviewedByDev}
                      onChange={(next) => void setGuideStatus(activeGuide.id, next)}
                    />
                  ) : null}
                </div>
                {canEditGuideContent ? (
                  <>
                    <div className="launch-guide-detail__update-row launch-guide-detail__update-row--assignee">
                      <GuideAssigneeField
                        guideId={activeGuide.id}
                        patchAssignee={catalogPatch?.assignee}
                        guidePatchAssignees={guidePatchAssignees}
                        onSaved={(state) => {
                          setCatalogStates((prev) => ({
                            ...prev,
                            [activeGuide.id]: overlayGuideCatalogState(prev[activeGuide.id], state),
                          }));
                          patchLiveGuideLibraryCatalogState(activeGuide.id, state);
                          setGuideAuditRefreshKey((k) => k + 1);
                        }}
                      />
                    </div>
                    <GuideMembershipAgeFields
                      guideId={activeGuide.id}
                      membershipSelected={activeMembershipSelection}
                      ageSelected={activeAgeSelection}
                      busy={statusBusyId === activeGuide.id}
                      onError={setStatusError}
                      onSaved={(state) => {
                        setCatalogStates((prev) => ({
                          ...prev,
                          [activeGuide.id]: overlayGuideCatalogState(prev[activeGuide.id], state),
                        }));
                        patchLiveGuideLibraryCatalogState(activeGuide.id, state);
                        setGuideAuditRefreshKey((k) => k + 1);
                      }}
                    />
                    {statusError ? (
                      <p
                        className="launch-guide-status-error"
                        role="alert"
                        data-testid="launch-guide-status-error"
                      >
                        {statusError}
                      </p>
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {guideFiltersBar}

        <GuidePrepSections
          key={activeGuide.id}
          guideId={activeGuide.id}
          kit={guideKit}
          testIdPrefix="launch-guide"
          expandAllSections
          guideUnlocked={unlocked}
          lockCta={
            <>
              {onGoToLogin && !isLoggedIn ? (
                <button type="button" className="btn btn-outline" onClick={onGoToLogin}>
                  <LogIn size={16} /> Log in
                </button>
              ) : null}
              <JoinToUnlockCta
                access={activeAccess}
                onJoin={onGoToJoin ? () => onGoToJoin(activeMinTier) : undefined}
                onUpgrade={onGoToJoin ? () => onGoToJoin(activeMinTier) : undefined}
              />
            </>
          }
          afterTabsOwnsPanel={guidePrepAfterTabsOwnsPanel(canEditGuideContent)}
          afterTabs={(tab) => {
            if (!canEditGuideContent) return null;
            if (tab === "notes") {
              return (
                <section
                  className="guide-admin-content-editor"
                  data-testid={`guide-notes-editor-${activeGuide.id}`}
                >
                  <div className="guide-admin-content-editor__bar">
                    <div>
                      <h3 className="guide-admin-content-editor__heading">Edit Notes</h3>
                      <p className="guide-admin-content-editor__lede">
                        Add, edit, and attach files to notes for this Side Hustle.
                      </p>
                    </div>
                  </div>
                  <GuideNotesTab
                    guideId={activeGuide.id}
                    isLoggedIn={isLoggedIn}
                    isAdmin={canEditGuideContent}
                    actorName={memberName}
                    actorUserId={memberUserId}
                    onGoToLogin={onGoToLogin}
                    refreshKey={guideNotesRefreshKey}
                  />
                </section>
              );
            }
            const focusSection =
              tab === "prereqs"
                ? "prereqs"
                : tab === "tools"
                  ? "tools"
                  : tab === "steps"
                    ? "steps"
                    : tab === "pricing"
                      ? "pricing"
                      : tab === "supplies"
                        ? "supplies"
                        : tab === "all"
                          ? "all"
                          : null;
            if (!focusSection) return null;
            return (
              <GuideAdminContentEditor
                key={`editor-${activeGuide.id}`}
                guideId={activeGuide.id}
                name={activeGuide.name}
                kit={guideKit}
                focusSection={focusSection}
                onStepsLocalChange={(steps) => {
                  setCatalogStates((prev) => {
                    const prior = prev[activeGuide.id];
                    return {
                      ...prev,
                      [activeGuide.id]: {
                        guideId: activeGuide.id,
                        status: prior?.status ?? getGuideVisibilityStatus(activeGuide.id, prev),
                        published: prior?.published ?? true,
                        deleted: prior?.deleted === true,
                        custom: prior?.custom === true,
                        patch: { ...(prior?.patch ?? {}), steps },
                        updatedAt: prior?.updatedAt,
                        updatedBy: prior?.updatedBy,
                      },
                    };
                  });
                }}
                onSaved={(state) => {
                  setCatalogStates((prev) => ({
                    ...prev,
                    [activeGuide.id]: overlayGuideCatalogState(prev[activeGuide.id], state),
                  }));
                  setGuideAuditRefreshKey((k) => k + 1);
                }}
              />
            );
          }}
          stepsTab={{
            count: activeStepsCount,
            content: (
              <>
                <div className="launch-guide-steps-progress">
                  <div className="launch-guide-steps-progress__meta">
                    <span>Launch Roadmap Progress</span>
                    <span
                      className={
                        progressPercent === 100
                          ? "launch-guide-steps-progress__done"
                          : "launch-guide-steps-progress__count"
                      }
                    >
                      {activeCompletedSteps} of {activeStepsCount} Completed (
                      {Math.round(progressPercent)}%)
                    </span>
                  </div>
                  <div className="launch-guide-steps-progress__track">
                    <div
                      className="launch-guide-steps-progress__fill"
                      style={{
                        width: `${progressPercent}%`,
                        background:
                          progressPercent === 100 ? "var(--grad-emerald)" : "var(--grad-primary)",
                      }}
                    />
                  </div>
                </div>
                <div className="launch-guide-steps-list">
                  {activeGuide.steps.map((step, idx) => {
                    const isDone = !!completedSteps[`${activeGuide.id}-${idx}`];
                    return (
                      <div
                        key={idx}
                        className={`checklist-item ${isDone ? "completed" : ""}`}
                        data-testid={`launch-guide-step-${idx}`}
                      >
                        <button
                          type="button"
                          className="checklist-checkbox"
                          aria-pressed={isDone}
                          aria-label={
                            isDone
                              ? `Mark step ${idx + 1} not done`
                              : `Mark step ${idx + 1} done`
                          }
                          data-testid={`launch-guide-step-done-${idx}`}
                          onClick={() => toggleStep(idx)}
                        >
                          {isDone && <Check size={12} />}
                        </button>
                        <div className="checklist-text">
                          <strong
                            style={{
                              color: isDone ? "var(--text-muted)" : "var(--charcoal)",
                              fontSize: "0.95rem",
                              display: "block",
                              marginBottom: 4,
                            }}
                          >
                            {idx + 1}. {step.title}
                          </strong>
                          <GuideStepDesc
                            guideId={activeGuide.id}
                            stepIdx={idx}
                            desc={step.desc}
                            muted={isDone}
                            checkedItems={stepChecklistItems}
                            onToggleItem={(itemIdx) => toggleStepChecklistItem(idx, itemIdx)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ),
          }}
          calculatorTab={{
            content: (
              <GuideRevenueCalculator
                guideId={activeGuide.id}
                guideName={activeGuide.name}
              />
            ),
          }}
          notesTab={{
            content: (
              <GuideNotesTab
                guideId={activeGuide.id}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                actorName={memberName}
                actorUserId={memberUserId}
                onGoToLogin={onGoToLogin}
                refreshKey={guideNotesRefreshKey}
              />
            ),
          }}
        />

        <div className="launch-guide-detail__tips">
          <button
            type="button"
            className="launch-guide-detail__tips-toggle"
            aria-expanded={tipsOpen}
            data-testid="launch-guide-tips-toggle"
            onClick={() => setTipsOpen((o) => !o)}
          >
            <span>{tipsOpen ? "▾" : "▸"} Tips & pitfalls</span>
          </button>
          {tipsOpen ? (
            <div className="launch-guide-detail__tips-grid">
              <div className="launch-guide-detail__tip is-pro">
                <h4>
                  <Award size={16} aria-hidden /> Professional Secret
                </h4>
                <p>{activeGuide.proTip}</p>
              </div>
              <div className="launch-guide-detail__tip is-risk">
                <h4>
                  <AlertTriangle size={16} aria-hidden /> High-Risk Pitfall
                </h4>
                <p>{activeGuide.pitfall}</p>
              </div>
            </div>
          ) : null}
        </div>

        {staffCatalog ? (
          <div
            className="launch-guide-detail__audit-area"
            data-testid={`launch-guide-audit-area-${activeGuide.id}`}
          >
            {(() => {
              const trail = formatAuditTrail(
                catalogStates[activeGuide.id]?.updatedAt,
                catalogStates[activeGuide.id]?.updatedBy,
              );
              return trail ? (
                <p
                  className="launch-guide-detail__main-audit"
                  data-testid={`launch-guide-main-audit-${activeGuide.id}`}
                >
                  {trail}
                </p>
              ) : null;
            })()}
            <GuideChangeLogPanel
              guideId={activeGuide.id}
              refreshKey={guideAuditRefreshKey}
            />
          </div>
        ) : null}
      </div>
      )}
    </div>
  );
};
