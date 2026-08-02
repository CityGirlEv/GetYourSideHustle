import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { 
  MessageSquare, 
  Sparkles,
  Search,
  Flame,
  Shield,
  LogIn,
  LogOut,
  Menu,
  X,
  Mic2,
  Info,
  UserPlus,
  Mail,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Star,
  Heart,
  Home,
  BookOpen,
  LayoutDashboard,
  Minus,
  Plus,
  ArrowRight,
} from "lucide-react";
import { FacebookIcon } from "./components/FacebookIcon";
import { BusyOverlay, WaitLabel } from "./components/WaitFeedback";
import { HustleCard } from "./components/HustleCard";
import type { Hustle } from "./components/HustleCard";
import { CalculatorSection } from "./components/CalculatorSection";
import { HustleQuiz } from "./components/HustleQuiz";
import { FindMineWizardSelector } from "./components/FindMineWizardSelector";
import { StepByStepGuides } from "./components/StepByStepGuides";
import { FreeGuidesPage } from "./components/FreeGuidesPage";
import { CommunityHub } from "./components/CommunityHub";
import { type MarketingGuideId } from "./lib/marketing-guides";
import { KidsCorner } from "./components/KidsCorner";
import { SeniorSideHustles } from "./components/SeniorSideHustles";
import { UserPortal } from "./components/UserPortal";
import { KidDashboard } from "./components/KidDashboard";
import {
  ADMIN_MENU_GROUPS,
  ADMIN_USER_GUIDE_LINKS,
  adminTabById,
  type AdminTab,
  type UserGuideId,
} from "./lib/admin-nav";
import { DailyProgressReport } from "./components/admin/DailyProgressReport";
import type { SiteMapHref } from "./lib/site-map";
import { TrainingCircles } from "./components/TrainingCircles";
import { WorkshopsHub } from "./components/WorkshopsHub";
import { SiteFooter } from "./components/SiteFooter";
import type { FooterNavView } from "./components/SiteFooter";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { JoinPage } from "./components/JoinPage";
import { MembershipSignupPage } from "./components/MembershipSignupPage";
import type { AudienceGroup, TierId } from "./lib/membership";
import {
  audienceFromAgeGroup,
  isAudienceGroup,
  readSavedJoinAudience,
  saveJoinAudience,
} from "./lib/join-audience";
import { LaunchChecklistPage } from "./components/LaunchChecklistPage";
import { ParentConsentPage } from "./components/ParentConsentPage";
import { clearConsentTokenFromUrl, readConsentTokenFromUrl } from "./lib/junior-signup";
import {
  FACEBOOK_URL,
  HOME_HEADLINE_OUTCOME,
  SITE_NAME,
  SITE_PURPOSE,
} from "./lib/site-config";
import { HomeForesightBlocks } from "./components/HomeForesightBlocks";
import {
  parseAppRoute,
  syncUrlToView,
  titleForView,
} from "./lib/app-routes";
import { readAdminDeepLink } from "./lib/admin-deep-links";
import {
  confirmPasswordReset,
  restoreSession,
  login,
  logout,
  requestPasswordReset,
  type AuthUser,
} from "./lib/auth";
import { clearResetTokenFromUrl, readResetTokenFromUrl } from "./lib/password-reset-url";
import type { GuidePeekNav } from "./lib/launch-guide-peeks";
import {
  ACT_AS_AUDIENCE_OPTIONS,
  ACT_AS_GUEST_OPTION,
  actAsAudience,
  actAsLabel,
  clearActAsTarget,
  readActAsTarget,
  writeActAsTarget,
  type ActAsTarget,
} from "./lib/admin-act-as";
import { canAccessAdminPortal } from "./lib/gysh-roles";
import {
  fetchPartnerAgenda,
  mustPickAgendaTimes,
} from "./lib/gysh-partner-agenda";
import { hasFreeMemberSession } from "./lib/free-member-session";
import { readPendingBlueprint } from "./lib/pending-blueprint";
import type { BlueprintAgeGroup } from "./lib/gysh-analytics";
import { isYouthDashboardUser, youthAgeBand } from "./lib/youth-dashboard";
import kevinaNavMark from "./assets/kevina-starr-logo.png";
import gyshLogo from "./assets/gysh-logo-rocket.png";
import "./App.css";

/** Heavy admin/PDF-only bundles — keep off the public home path. */
const AdminPortal = lazy(() =>
  import("./components/AdminPortal").then((m) => ({ default: m.AdminPortal })),
);
const MarketingManual = lazy(() =>
  import("./components/MarketingManual").then((m) => ({ default: m.MarketingManual })),
);

const DUE_POPUP_LOGIN_FLAG = "gysh_due_popup_login";

export type AppView =
  | "dashboard"
  | "quiz"
  | "calculators"
  | "guides"
  | "checklist"
  | "community"
  | "workshops"
  | "kids"
  | "seniors"
  | "login"
  | "user_portal"
  | "admin"
  | "about"
  | "contact"
  | "join"
  | "membership_signup";

const HUSTLES_DATA: Hustle[] = [
  {
    id: "airbnb",
    name: "Airbnb Hosting",
    description: "Rent out spare rooms, guest houses, or entire properties on the world's largest homestay platform for short-term travellers.",
    startupCost: "Over $1,000",
    timeReq: "10 - 20 hrs/week",
    difficulty: "Medium",
    potentialIncome: "$1,500 - $8,000/mo",
    type: "Active / Passive",
    gradient: "pink",
    category: "Real Estate",
    iconName: "airbnb",
    details: [
      "No property ownership required if doing rental arbitrage",
      "Dynamic pricing maximizes earnings based on weekends/seasonality",
      "High startup costs (furniture, decor, locks)"
    ]
  },
  {
    id: "pod",
    name: "Print-on-Demand (POD)",
    description: "Design custom shirts, mugs, and merchandise, and sell them via Etsy or Shopify with zero warehousing or inventory costs.",
    startupCost: "Less than $100",
    timeReq: "5 - 10 hrs/week",
    difficulty: "Easy",
    potentialIncome: "$200 - $3,000/mo",
    type: "Passive",
    gradient: "purple",
    category: "E-Commerce",
    iconName: "pod",
    details: [
      "100% passive once designs are published",
      "Zero upfront product cost - items printed only when sold",
      "Competitive niche requiring good keyword SEO"
    ]
  },
  {
    id: "dropshipping",
    name: "Dropshipping",
    description: "Build an online storefront and source products directly from suppliers who package and ship orders straight to customers.",
    startupCost: "$100 - $1,000",
    timeReq: "15 - 25 hrs/week",
    difficulty: "Hard",
    potentialIncome: "$500 - $10,000/mo",
    type: "Active",
    gradient: "cyan",
    category: "E-Commerce",
    iconName: "dropshipping",
    details: [
      "High dependency on Facebook/TikTok advertising campaigns",
      "Customer service & supplier relations require active attention",
      "Enormous scaling capability"
    ]
  },
  {
    id: "digital-products",
    name: "Digital Products",
    description:
      "Create and sell your own digital downloads — ebooks, printables, planners, templates, and mini-courses. Book publishing is a classic Digital path (kids can publish stories too).",
    startupCost: "Less than $100",
    timeReq: "8 - 20 hrs/week",
    difficulty: "Medium",
    potentialIncome: "$200 - $10,000/mo",
    type: "Passive / Product",
    gradient: "purple",
    category: "Digital",
    iconName: "digital-products",
    details: [
      "No inventory — deliver PDFs, files, or course access instantly",
      "Book publishing (KDP / print + ebook) is a flagship Digital example",
      "Kids and teens can start with short storybooks and simple printables",
    ],
  },
  {
    id: "affiliate",
    name: "Affiliate Marketing",
    description:
      "Earn a commission when someone buys through your unique link — Amazon, TikTok Shop, brand programs, software partners, and more. You promote other companies’ products; you don’t have to invent your own.",
    startupCost: "Less than $100",
    timeReq: "5 - 15 hrs/week",
    difficulty: "Medium",
    potentialIncome: "$100 - $15,000/mo",
    type: "Passive",
    gradient: "emerald",
    category: "Marketing",
    iconName: "affiliate",
    details: [
      "Separate from Digital Products — you promote other brands, not your own downloads",
      "Start with easy programs (Amazon, TikTok/Creator, brands you already use)",
      "Honest reviews and demos beat bare link spam — always disclose affiliates",
      "Recurring SaaS commissions are a later upgrade once you have traction",
    ],
  },
  {
    id: "amazon",
    name: "Amazon FBA Seller",
    description: "Launch your own physical product brand on Amazon. Amazon stores, packages, ships, and handles returns on your behalf.",
    startupCost: "Over $1,000",
    timeReq: "20 - 30 hrs/week",
    difficulty: "Hard",
    potentialIncome: "$1,000 - $25,000/mo",
    type: "Active",
    gradient: "amber",
    category: "E-Commerce",
    iconName: "amazon",
    details: [
      "Requires manufacturing partnerships (typically via Alibaba)",
      "High earning potential in Amazon's massive organic buyer network",
      "Complex supply chain and Amazon catalog SEO rules"
    ]
  },
  {
    id: "social",
    name: "Social Influencer",
    description: "Build a highly engaged audience around your interests, and monetize with brand sponsors, affiliate links, and creator funds.",
    startupCost: "Less than $100",
    timeReq: "15 - 30 hrs/week",
    difficulty: "Medium",
    potentialIncome: "$500 - $20,000/mo",
    type: "Active",
    gradient: "pink",
    category: "Creative",
    iconName: "social",
    details: [
      "Builds a personal brand that can launch secondary businesses",
      "Requires consistent video publishing cadences to feed algorithm",
      "High rates for sponsorship integrations with engaged audiences"
    ]
  },
  {
    id: "web-leads",
    name: "Local Website Lead Finder",
    description: "Find local businesses with weak or missing websites, then pitch audits, rebuilds, or done-for-you sites that convert walk-ins into online bookings.",
    startupCost: "$100 - $500",
    timeReq: "10 - 20 hrs/week",
    difficulty: "Medium",
    potentialIncome: "$800 - $6,000/mo",
    type: "Active",
    gradient: "cyan",
    category: "Local Services",
    iconName: "web-leads",
    details: [
      "Google Maps + website audits surface endless local prospects",
      "Sell audits first ($150–$400), then build packages ($800–$3,500+)",
      "Recurring hosting/maintenance retainers stack monthly income"
    ]
  },
  {
    id: "ai-assets",
    name: "AI Asset Studio",
    description: "Create brand logos, ad creatives, social kits, and packaging visuals with AI tools — then deliver polished asset packs to local and online clients.",
    startupCost: "Less than $100",
    timeReq: "8 - 15 hrs/week",
    difficulty: "Easy",
    potentialIncome: "$500 - $5,000/mo",
    type: "Active",
    gradient: "purple",
    category: "AI / Creative",
    iconName: "ai-assets",
    details: [
      "Low overhead: any AI image tool + a simple editor + a clean delivery folder",
      "Productize kits (logo pack, launch creatives, 30-day social set)",
      "Pairs perfectly with website lead-finder outreach",
    ],
  },
  {
    id: "property-mgmt",
    name: "Property Management",
    description: "Manage rentals or short-term stays for owners who want hands-off ops — leasing, guest turns, vendors, and owner reporting. Complements Airbnb/STR skills.",
    startupCost: "$200 - $1,000",
    timeReq: "15 - 25 hrs/week",
    difficulty: "Medium",
    potentialIncome: "$1,000 - $8,000/mo",
    type: "Active",
    gradient: "amber",
    category: "Real Estate",
    iconName: "property-mgmt",
    details: [
      "Earn 8–12% of rent (LTR) or 15–25% of booking revenue (STR)",
      "Leverage cleaning/vendor networks you already trust",
      "Scale by adding doors, not hours, once SOPs exist"
    ]
  },
  {
    id: "handyman",
    name: "Handyman Services",
    description: "Offer small repairs, installs, painting, and punch-list jobs to homeowners and landlords who need reliable local help without a full contractor.",
    startupCost: "$200 - $800",
    timeReq: "10 - 25 hrs/week",
    difficulty: "Easy",
    potentialIncome: "$800 - $5,000/mo",
    type: "Active",
    gradient: "emerald",
    category: "Local Services",
    iconName: "handyman",
    details: [
      "Start with Nextdoor, Facebook groups, and landlord referrals",
      "Tool kit + truck/van access is the main barrier",
      "Upsell recurring maintenance for Airbnb hosts & PMs"
    ]
  },
  {
    id: "rideshare",
    name: "Rideshare (Uber / Lyft)",
    description: "Drive passengers on Uber or Lyft during peak windows — airport runs, nightlife, events — for flexible cash flow with a vehicle you already own.",
    startupCost: "$50 - $300",
    timeReq: "10 - 30 hrs/week",
    difficulty: "Easy",
    potentialIncome: "$600 - $3,500/mo",
    type: "Active / Gig",
    gradient: "pink",
    category: "Gig Economy",
    iconName: "rideshare",
    details: [
      "Income hinges on hours + surge timing, not ads",
      "Track mileage for tax deductions from day one",
      "Pair with AI Timing Scout to chase higher $/hour windows"
    ]
  },
  {
    id: "food-delivery",
    name: "DoorDash / Uber Eats",
    description: "Deliver restaurant orders on DoorDash, Uber Eats, or similar apps — stack multi-app shifts and hotspot zones for fast, flexible side income.",
    startupCost: "Less than $100",
    timeReq: "8 - 25 hrs/week",
    difficulty: "Easy",
    potentialIncome: "$400 - $2,500/mo",
    type: "Active / Gig",
    gradient: "amber",
    category: "Gig Economy",
    iconName: "food-delivery",
    details: [
      "Lowest barrier: bike, scooter, or car + insulated bag",
      "Peak dinner + weekend lunch windows pay best",
      "Use AI Timing Scout to pick ZIP/time blocks before you drive"
    ]
  },
  {
    id: "ai-timing",
    name: "AI Timing Scout",
    description: "Use AI plus local ZIP data to map the best hours and areas for rideshare and delivery — then sell the playbooks (or use them yourself) for higher $/hour.",
    startupCost: "Less than $100",
    timeReq: "5 - 12 hrs/week",
    difficulty: "Medium",
    potentialIncome: "$300 - $3,000/mo",
    type: "Guide / Hybrid",
    gradient: "cyan",
    category: "AI / Gig",
    iconName: "ai-timing",
    details: [
      "Research-heavy: weather, events, airport schedules, tips forums",
      "Sell weekly hotspot guides to local drivers ($15–$49)",
      "Or keep the edge private and boost your own gig earnings"
    ]
  },
  {
    id: "ai-agents",
    name: "AI Agents for Side Hustlers",
    description: "Build and sell custom AI agents that handle lead finding, scheduling, research, and follow-ups — the Muntie Ev / GYSH agent playbook applied to other Side Hustlers' businesses.",
    startupCost: "$50 - $400",
    timeReq: "10 - 20 hrs/week",
    difficulty: "Hard",
    potentialIncome: "$1,000 - $10,000/mo",
    type: "Active / Productized",
    gradient: "purple",
    category: "AI / Tech",
    iconName: "ai-agents",
    details: [
      "Productize: lead scout, booking agent, research brief agent",
      "Charge setup ($500–$2,500) + monthly agent care retainers",
      "Ties directly to Evelyn/Muntie agent expertise & Training Circles"
    ]
  },
  {
    id: "book-publishing",
    name: "Book Publishing",
    description:
      "Write, publish, and market books (print + ebook + audiobook) — a core Digital side hustle. Tina’s expertise lane from manuscript to KDP/IngramSpark; kids can publish storybooks too.",
    startupCost: "$100 - $1,000",
    timeReq: "10 - 20 hrs/week",
    difficulty: "Medium",
    potentialIncome: "$200 - $8,000/mo",
    type: "Active / Royalty",
    gradient: "amber",
    category: "Digital",
    iconName: "book-publishing",
    details: [
      "A Digital Products path — your own content, not affiliate links",
      "KDP + wide distribution (IngramSpark) for print and ebook reach",
      "Royalties stack while you write the next title",
      "Kids & teens can start with short stories (see Kids / Teens Ideas)",
    ],
  }
];

function App() {
  const bootRoute = parseAppRoute();
  const [activeView, setActiveView] = useState<AppView>(bootRoute.view as AppView);
  const [consentToken, setConsentToken] = useState<string | null>(() => readConsentTokenFromUrl());
  /** Skip pushState when the URL change came from back/forward. */
  const skipNextUrlSync = useRef(false);
  const urlSyncReady = useRef(false);
  const [selectedHustleId, setSelectedHustleId] = useState<string>("airbnb");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "admin">("user");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  /** False until /auth/me finishes so /admin never flashes Schedule to anonymous visitors. */
  const [authReady, setAuthReady] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<"login" | "forgot" | "set-password">(() =>
    readResetTokenFromUrl() ? "set-password" : "login",
  );
  const [resetToken, setResetToken] = useState<string | null>(() => readResetTokenFromUrl());
  const [resetEmail, setResetEmail] = useState("");
  const [resetNew, setResetNew] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [showResetNew, setShowResetNew] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminSessionKey, setAdminSessionKey] = useState(0);
  const [adminTab, setAdminTab] = useState<AdminTab>(() => readAdminDeepLink().tab ?? "schedule");
  /** Tina / Lyriq must submit ≥3 meeting dates before any other navigation. */
  const [meetingGateLocked, setMeetingGateLocked] = useState(false);
  const [adminUserGuide, setAdminUserGuide] = useState<UserGuideId>("master");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const [actAsTarget, setActAsTarget] = useState<ActAsTarget>(() => readActAsTarget());
  const [actAsMenuOpen, setActAsMenuOpen] = useState(false);
  const actAsMenuRef = useRef<HTMLDivElement>(null);
  const [kidsEntryFocus, setKidsEntryFocus] = useState<{
    mode: "kids" | "junior";
    tab: "stories" | "wizard" | "jobs" | "piggy" | "guides" | "join";
  } | null>(null);
  /** Parent coach viewing a linked kid’s dedicated dashboard (not Match Wizard). */
  const [parentKidDashboard, setParentKidDashboard] = useState<{
    id: string;
    displayName: string;
    ageBand: "kids" | "junior";
  } | null>(null);
  const [seniorsEntryTab, setSeniorsEntryTab] = useState<
    "match" | "opportunities" | "guides" | "join" | null
  >(null);
  const [joinAudience, setJoinAudience] = useState<AudienceGroup | null>(null);
  /** Optional: scroll Join to Free–Elite plans (in-page See Memberships CTAs only). */
  const [joinScrollToPlans, setJoinScrollToPlans] = useState(false);
  const [signupTier, setSignupTier] = useState<TierId>("free");
  const [howOpen, setHowOpen] = useState(false);
  const [homeHowOpen, setHomeHowOpen] = useState(false);
  const [guidesDetailId, setGuidesDetailId] = useState<string | null>(null);
  const [guidesManualId, setGuidesManualId] = useState<MarketingGuideId | null>(
    () => (bootRoute.guidesManualId as MarketingGuideId | null) ?? null,
  );
  const [findMineMode, setFindMineMode] = useState<"select" | "adult">("select");
  /** Bump when free Blueprint signup succeeds so member access re-reads storage. */
  const [memberAccessTick, setMemberAccessTick] = useState(0);
  void memberAccessTick;
  /** Portal login OR free Blueprint member session */
  const hasMemberAccess = isLoggedIn || hasFreeMemberSession();
  const previewingAsGuest = actAsTarget.type === "guest";
  /** Guest Profile Switcher pretends there is no member session. */
  const effectiveMemberAccess = previewingAsGuest ? false : hasMemberAccess;
  const effectivePortalLogin = previewingAsGuest ? false : isLoggedIn;
  const [pageZoom, setPageZoom] = useState(() => {
    try {
      const raw = Number(localStorage.getItem("gysh-page-zoom"));
      if (Number.isFinite(raw) && raw >= 90 && raw <= 150) return raw;
    } catch {
      /* ignore */
    }
    return 100;
  });

  useEffect(() => {
    // Never set zoom on <html> — Chromium CSS zoom breaks sticky-header hit-testing,
    // so Login/nav clicks miss when zoom ≠ 100% (value is persisted per-origin).
    // Zoom is applied to .app-zoom-content only (below the header).
    document.documentElement.style.zoom = "";
    try {
      localStorage.setItem("gysh-page-zoom", String(pageZoom));
    } catch {
      /* ignore */
    }
  }, [pageZoom]);

  const contentZoomStyle =
    pageZoom === 100 ? undefined : ({ zoom: `${pageZoom}%` } as React.CSSProperties);

  // Keep the address bar in sync so pages are shareable deep links.
  // Skip while a consent (or password-reset) deep link is active so we don't drop the token.
  useEffect(() => {
    if (consentToken || resetToken) return;
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }
    syncUrlToView(activeView, {
      guidesManualId,
      replace: !urlSyncReady.current,
    });
    urlSyncReady.current = true;
  }, [activeView, guidesManualId, consentToken, resetToken]);

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseAppRoute(window.location.pathname);
      skipNextUrlSync.current = true;
      setActiveView(parsed.view as AppView);
      setGuidesManualId((parsed.guidesManualId as MarketingGuideId | null) ?? null);
      if (parsed.view !== "guides") {
        setGuidesDetailId(null);
      }
      setHowOpen(false);
      setHomeHowOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.title = titleForView(activeView);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const origin = window.location.origin.replace(/\/$/, "");
      const path = window.location.pathname === "/" ? "/" : window.location.pathname;
      canonical.setAttribute("href", `${origin}${path}`);
    }
  }, [activeView, guidesManualId]);

  const canUseAdminPortal =
    isLoggedIn && (userRole === "admin" || canAccessAdminPortal(authUser));
  /** Profile Switcher is previewing a member audience (hide Admin chrome). */
  const previewingAsMember = actAsTarget.type !== "self";
  const actAsAudienceNow = actAsAudience(actAsTarget);
  /**
   * Kids/Teens member guides unlock for:
   * - Profile Switcher → Kids/Teens Member
   * - Real non-staff members (or free Blueprint session)
   * - Lightweight team join (handled inside KidsCorner via localStorage)
   * Staff (Tina/Evelyn/Lyriq admin|qa) browsing as themselves stay gated.
   */
  const kidsCornerMemberAccess =
    !previewingAsGuest &&
    (actAsAudienceNow === "kids" ||
      actAsAudienceNow === "junior" ||
      (hasMemberAccess && !canUseAdminPortal));

  // Restore session for this tab only — closing the page requires a fresh login.
  useEffect(() => {
    let cancelled = false;
    void restoreSession()
      .then((user) => {
        if (cancelled) return;
        if (user) {
          setIsLoggedIn(true);
          setAuthUser(user);
          setUserRole(canAccessAdminPortal(user) ? "admin" : "user");
        }
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Deep link /admin must not render Admin Studio (Schedule) without portal roles.
  useEffect(() => {
    if (!authReady) return;
    if (activeView !== "admin") return;
    if (canUseAdminPortal) return;
    setActiveView("login");
  }, [authReady, activeView, canUseAdminPortal]);

  // Tina / Lyriq admins: lock to Agenda until ≥3 meeting dates are saved.
  // Never run for member/parent accounts (even if name/email looks like "Tina").
  useEffect(() => {
    if (!authReady || !authUser || !canUseAdminPortal || !mustPickAgendaTimes(authUser)) {
      setMeetingGateLocked(false);
      return;
    }
    let cancelled = false;
    void fetchPartnerAgenda()
      .then((payload) => {
        if (cancelled) return;
        const locked = Boolean(payload.needsTimePicks);
        setMeetingGateLocked(locked);
        if (locked) {
          setAdminTab("agenda");
          setActiveView("admin");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setMeetingGateLocked(true);
        setAdminTab("agenda");
        setActiveView("admin");
      });
    return () => {
      cancelled = true;
    };
  }, [authReady, authUser, canUseAdminPortal]);

  useEffect(() => {
    if (!meetingGateLocked) return;
    if (!canUseAdminPortal) {
      setMeetingGateLocked(false);
      return;
    }
    if (activeView !== "admin" || adminTab !== "agenda") {
      setAdminTab("agenda");
      setActiveView("admin");
    }
  }, [meetingGateLocked, activeView, adminTab, canUseAdminPortal]);

  const goTo = (
    view: AppView,
    opts?: {
      scroll?: boolean;
      /** Open a specific adult Launch Guide on /guides (clears marketing manuals). */
      launchGuideId?: string | null;
    },
  ) => {
    if (meetingGateLocked && view !== "admin") return;
    setActiveView(view);
    // Kid dashboard is opened in-place (no goTo); any nav clears the parent coach preview.
    setParentKidDashboard(null);
    setMobileMenuOpen(false);
    setAdminMenuOpen(false);
    if (view === "guides" && opts && "launchGuideId" in opts) {
      const id = opts.launchGuideId ? String(opts.launchGuideId) : null;
      setGuidesManualId(null);
      setGuidesDetailId(id);
      if (id) setSelectedHustleId(id);
    } else if (view !== "guides") {
      setGuidesDetailId(null);
      setGuidesManualId(null);
    }
    if (view !== "join") {
      setJoinAudience(null);
    }
    setHowOpen(false);
    if (view !== "dashboard") setHomeHowOpen(false);
    if (view === "quiz") setFindMineMode("select");
    if (opts?.scroll !== false) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openJoin = (
    audience?: AudienceGroup | null,
    opts?: { scrollToPlans?: boolean },
  ) => {
    if (audience) {
      const next = audienceFromAgeGroup(audience);
      saveJoinAudience(next);
      setJoinAudience(next);
    } else {
      setJoinAudience(null);
    }
    const scrollToPlans = opts?.scrollToPlans === true;
    setJoinScrollToPlans(scrollToPlans);
    goTo("join", { scroll: !scrollToPlans });
  };

  /** Membership registration + optional demo checkout for paid tiers. */
  const openMembershipSignup = (tier: TierId = "free", audience?: AudienceGroup | null) => {
    const next =
      audience != null
        ? audienceFromAgeGroup(audience)
        : joinAudience ?? readSavedJoinAudience("adult");
    saveJoinAudience(next);
    setJoinAudience(next);
    setSignupTier(tier);
    goTo("membership_signup");
  };

  const openGuidesLibrary = () => {
    setGuidesDetailId(null);
    setGuidesManualId(null);
    goTo("guides");
  };

  const openGuidesManual = (id: MarketingGuideId) => {
    setGuidesDetailId(null);
    setGuidesManualId(id);
    setActiveView("guides");
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getHowItWorksContent = (): { title: string; steps: string[] } => {
    switch (activeView) {
      case "quiz":
        if (findMineMode === "adult") {
          return {
            title: "How the GYSH Adults Match Wizard works",
            steps: [
              "Tell us your startup budget and how many hours you can commit each week.",
              "Rank your strengths — what you’re naturally good at (pick up to two).",
              "Rank your goals — passive income, local gigs, and more.",
              "See hustles ranked for adults — best match first from your answers.",
            ],
          };
        }
        return {
          title: "How the GYSH Match Wizard works",
          steps: [
            "Pick your age group — Kids, Teens, Adults, or Seniors — so we open the right wizard.",
            "Kids match ages 4–8 and 9–12; Teens match ages 13–14 and 15–17; Adult and Senior wizards use stage-fit questions.",
            "Parents become GYSH Coaches for kids (parental consent required through age 12; not required for ages 13+) and stay coach-friendly for teens.",
            "See ranked matches, then take the next step with ideas, guides, and tools that fit your stage.",
          ],
        };
      case "kids":
        return {
          title: "How GYSH Kids & Teens Corner works",
          steps: [
            "Choose Kids (ages 4–12) or Teens (ages 13–17).",
            "Use the GYSH Match Wizard, Ideas, savings tools, Guides, and Join the Team.",
            "Kids can also watch Kevina Starr Stories for confidence and kindness.",
            "Parents act as GYSH Coaches — consent is required through age 12 (not for ages 13+); keep a parent nearby for safety.",
          ],
        };
      case "seniors":
        return {
          title: "How GYSH Seniors Corner works",
          steps: [
            "Choose a pace that fits your life — gentle, balanced, or active.",
            "Rank your strengths — teaching, crafts, hosting, tech, and more.",
            "Share how much time you can give and what you want most.",
            "Get hustles ranked for 55+ / flexible schedules — best match first.",
          ],
        };
      case "guides":
        return {
          title: "How GYSH Guides work",
          steps: [
            "Browse free guides open to everyone.",
            "Member guides stay locked until you join a GYSH plan or team.",
            "Open Adult/Senior, Kids, or Teens guides that match your stage.",
            "Follow the steps, then use calculators and the GYSH Match Wizard when you’re ready.",
          ],
        };
      case "workshops":
        return {
          title: "How GYSH Workshops work",
          steps: [
            "Browse live and replay sessions from Tina, Evelyn, and guest experts.",
            "Pick a track that fits — adult hustles, AI agents, or family-friendly Kids Glow.",
            "Join or waitlist when a date is announced.",
            "Use the takeaways with Guides and the GYSH Match Wizard afterward.",
          ],
        };
      case "join":
        return {
          title: "How Join GYSH & Membership works",
          steps: [
            "Create a free account or compare Free through Elite plans.",
            "Kids and Teens can join age-group teams for member guides.",
            "Paid plans unlock consulting time and deeper launch support.",
            "Log in anytime to track progress and bookmarks.",
          ],
        };
      case "community":
        return {
          title: "How GYSH Community works",
          steps: [
            "Ask questions and share updates with other Side Hustlers.",
            "Exchange tips that match your age group and goals.",
            "Keep it kind, practical, and parent-aware for Kids/Teens topics.",
            "Bring workshop and guide questions here when you get stuck.",
          ],
        };
      case "about":
        return {
          title: "About GYSH",
          steps: [
            "Tina dreamed Get Your Side Hustle; Evelyn helped build the platform.",
            "Kids Glow, Teen hustles, adult pilots, and senior paths share one mission.",
            "Explore the GYSH Match Wizard, Guides, Workshops, and Join to get started.",
            "Questions? Use Contact Us anytime.",
          ],
        };
      case "contact":
        return {
          title: "How GYSH Contact works",
          steps: [
            "Send questions about hustles, partnerships, or workshops.",
            "Include your age group if you want Kids, Teens, Adult, or Senior help.",
            "We read messages through the GYSH inbox.",
            "For account help, try Login or Join first.",
          ],
        };
      case "calculators":
        return {
          title: "How GYSH Profit Estimator works",
          steps: [
            "Pick a hustle calculator that matches what you’re exploring.",
            "Enter realistic costs, prices, and hours.",
            "Review the estimate — it’s educational, not a guarantee.",
            "Open the matching guide when you want step-by-step next actions.",
          ],
        };
      case "checklist":
        return {
          title: "How the GYSH Side Hustle Guide checklist works",
          steps: [
            "Preview practical launch steps even before you join.",
            "Sign in to unlock the full member checklist.",
            "Work through milestones at your own pace.",
            "Jump into Guides or the GYSH Match Wizard when a step needs more detail.",
          ],
        };
      default:
        return {
          title: "How Get Your Side Hustle works",
          steps: [
            "Open the GYSH Match Wizard to match a hustle to your stage of life.",
            "Use Guides, Workshops, and calculators to learn the next steps.",
            "Join when you’re ready for member tools and support.",
            "Kids, Teens, Adults, and Seniors each get paths that fit.",
          ],
        };
    }
  };

  const openKidsCorner = (
    entry?: {
      mode: "kids" | "junior";
      tab: "stories" | "wizard" | "jobs" | "piggy" | "guides" | "join";
    } | null,
  ) => {
    setKidsEntryFocus(entry ?? null);
    goTo("kids");
  };

  const openSeniors = (entryTab?: "match" | "opportunities" | "guides" | "join" | null) => {
    setSeniorsEntryTab(entryTab ?? null);
    goTo("seniors");
  };

  const goToAdmin = (tab: AdminTab, guide?: UserGuideId) => {
    if (!canUseAdminPortal) {
      setActiveView("login");
      setAdminMenuOpen(false);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (meetingGateLocked && tab !== "agenda") {
      setAdminTab("agenda");
      setActiveView("admin");
      setAdminMenuOpen(false);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setAdminTab(tab);
    if (guide) setAdminUserGuide(guide);
    setActiveView("admin");
    setAdminMenuOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateFromSiteMap = (href: SiteMapHref) => {
    switch (href.kind) {
      case "home":
        goTo("dashboard");
        break;
      case "quiz":
        setFindMineMode("select");
        goTo("quiz");
        break;
      case "quiz-adult":
        openAdultFindMine();
        break;
      case "kids":
        openKidsCorner({ mode: href.mode, tab: href.tab ?? "wizard" });
        break;
      case "seniors":
        openSeniors(href.tab ?? "match");
        break;
      case "guides":
        if (href.manual) openGuidesManual(href.manual);
        else openGuidesLibrary();
        break;
      case "workshops":
        goTo("workshops");
        break;
      case "community":
        goTo("community");
        break;
      case "join":
        openJoin();
        break;
      case "join-signup":
        openMembershipSignup("free");
        break;
      case "login":
        goTo("login");
        break;
      case "about":
        goTo("about");
        break;
      case "contact":
        goTo("contact");
        break;
      case "admin":
        goToAdmin(href.tab, href.guide);
        break;
      default:
        break;
    }
  };

  const openAdultFindMine = () => {
    setFindMineMode("adult");
    setActiveView("quiz");
    setMobileMenuOpen(false);
    setAdminMenuOpen(false);
    setActAsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyActAsTarget = (target: ActAsTarget) => {
    writeActAsTarget(target);
    setActAsTarget(target);
    setActAsMenuOpen(false);
    setAdminMenuOpen(false);
    setMobileMenuOpen(false);
    const audience = actAsAudience(target);
    if (audience === "admin") {
      goToAdmin("schedule");
      return;
    }
    if (audience === "guest") {
      goTo("dashboard");
      return;
    }
    if (audience === "kids") {
      openKidsCorner({ mode: "kids", tab: "wizard" });
      return;
    }
    if (audience === "junior") {
      openKidsCorner({ mode: "junior", tab: "wizard" });
      return;
    }
    if (audience === "senior") {
      openSeniors(null);
      return;
    }
    goTo("dashboard");
  };

  /** After free unlock / login claim — land on My Dashboard (Blueprint + credits). */
  const restoreBlueprintAfterUnlock = (_ageGroup: BlueprintAgeGroup) => {
    setActiveView("user_portal");
    setMobileMenuOpen(false);
    setAdminMenuOpen(false);
    setActAsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!adminMenuOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = adminMenuRef.current;
      if (el && !el.contains(e.target as Node)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [adminMenuOpen]);

  useEffect(() => {
    if (!actAsMenuOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = actAsMenuRef.current;
      if (el && !el.contains(e.target as Node)) {
        setActAsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [actAsMenuOpen]);

  const handleFooterNav = (view: FooterNavView) => {
    if (view === "join") {
      openJoin();
      return;
    }
    if (view === "memberships") {
      // Differentiate from Join GYSH: land on Free–Elite pricing.
      openJoin(null, { scrollToPlans: true });
      return;
    }
    goTo(view);
  };

  const handleSelectHustleAction = (hustleId: string, actionType: "calculator" | "guide") => {
    setSelectedHustleId(hustleId);
    if (actionType === "calculator") {
      setActiveView("calculators");
    } else {
      goTo("guides", { launchGuideId: hustleId });
    }
  };

  const handleGoToCalculatorFromGuide = (hustleId: string) => {
    setSelectedHustleId(hustleId);
    setActiveView("calculators");
  };

  const handleGoToGuideFromCalculator = (hustleId: string) => {
    goTo("guides", { launchGuideId: hustleId });
  };

  const handleOpenGuidePeek = (nav: GuidePeekNav) => {
    if (nav.view === "guides") {
      goTo("guides", { launchGuideId: nav.hustleId });
      return;
    }
    if (nav.view === "kids") {
      openKidsCorner({ mode: nav.mode, tab: "guides" });
      return;
    }
    openSeniors("guides");
  };

  // Login handler — only partner admin accounts; everything else stays logged out
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginBusy) return;
    setLoginError("");
    setLoginBusy(true);

    try {
      const { outcome, error, user } = await login(emailInput, passInput);

      if (outcome === "admin" || outcome === "member") {
        setIsLoggedIn(true);
        setUserRole(outcome === "admin" ? "admin" : "user");
        setAuthUser(user ?? null);
        setEmailInput("");
        setPassInput("");
        setShowPassword(false);
        setMemberAccessTick((n) => n + 1);

        const pending = readPendingBlueprint();
        if (pending?.claimToken) {
          // Kids/Teens pending claims land on the parent/family profile (childProfileId null).
          // Parents can assign to a linked kid later from My Dashboard.
          void import("./lib/blueprints-api").then(({ claimBlueprint, saveBlueprintToAccount }) =>
            claimBlueprint(pending.claimToken!, null)
              .catch(() =>
                saveBlueprintToAccount({
                  ageGroup: pending.ageGroup,
                  answers: pending.answers,
                  resultIds: pending.resultIds,
                  resultPcts: pending.resultPcts,
                  claimToken: pending.claimToken,
                  childProfileId: null,
                }),
              )
              .catch(() => {
                /* portal still shows pending locally */
              }),
          );
        }

        if (outcome === "admin") {
          sessionStorage.setItem(DUE_POPUP_LOGIN_FLAG, "1");
          setAdminSessionKey((k) => k + 1);
          const email = String(user?.email || "").toLowerCase();
          const name = String(user?.name || "").toLowerCase();
          const forceAgenda =
            email.includes("tina") ||
            name.includes("tina") ||
            email.includes("lyriq") ||
            email.includes("leegaulden") ||
            name.includes("lyriq");
          setAdminTab(forceAgenda ? "agenda" : "schedule");
          setActiveView("admin");
        } else {
          /* Members (incl. after Blueprint claim) land on My Dashboard first */
          restoreBlueprintAfterUnlock(pending?.ageGroup ?? "adult");
        }
      } else if (outcome === "unavailable") {
        setLoginError(error || "Database unavailable. Try again after deploy/bindings are fixed.");
      } else {
        setLoginError(error || "Invalid email or password.");
      }
    } finally {
      setLoginBusy(false);
    }
  };

  const openResetMode = () => {
    setLoginMode("forgot");
    setLoginError("");
    setResetError("");
    setResetSuccess("");
    setResetEmail(emailInput);
    setResetNew("");
    setResetConfirm("");
    setResetToken(null);
  };

  const backToLogin = () => {
    setLoginMode("login");
    setResetError("");
    setResetSuccess("");
    setShowResetNew(false);
    setResetToken(null);
    clearResetTokenFromUrl();
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    setResetBusy(true);
    const result = await requestPasswordReset(resetEmail);
    setResetBusy(false);
    if (!result.ok) {
      setResetError(result.error);
      return;
    }
    setResetSuccess(
      result.message ||
        "We emailed a password reset link to that address. Check your inbox (and spam).",
    );
    setEmailInput(resetEmail.trim().toLowerCase());
  };

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    if (!resetToken) {
      setResetError("This reset link is missing or invalid. Request a new one.");
      return;
    }
    setResetBusy(true);
    const result = await confirmPasswordReset({
      token: resetToken,
      newPassword: resetNew,
      confirmPassword: resetConfirm,
    });
    setResetBusy(false);
    if (!result.ok) {
      setResetError(result.error);
      return;
    }
    setResetSuccess(result.message || "Password updated. Sign in with your new password.");
    setPassInput("");
    setResetNew("");
    setResetConfirm("");
    if (result.email) setEmailInput(result.email);
    clearResetTokenFromUrl();
    setResetToken(null);
    setLoginMode("login");
  };

  useEffect(() => {
    const token = readResetTokenFromUrl();
    if (!token) return;
    setResetToken(token);
    setLoginMode("set-password");
    setActiveView("login");
    setResetError("");
    setResetSuccess("");
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const audienceParam = params.get("audience");
      // Legacy: /?next=join → /join (path deep links are preferred)
      if (params.get("next") === "join") {
        if (isAudienceGroup(audienceParam)) {
          openJoin(audienceParam);
        } else {
          openJoin();
        }
        return;
      }
      // /join?audience=kids|teens|adult|senior
      if (bootRoute.view === "join" && isAudienceGroup(audienceParam)) {
        const next = audienceFromAgeGroup(audienceParam);
        saveJoinAudience(next);
        setJoinAudience(next);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot deep link on load
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setUserRole("user");
    setAuthUser(null);
    clearActAsTarget();
    setActAsTarget({ type: "self" });
    sessionStorage.removeItem(DUE_POPUP_LOGIN_FLAG);
    goTo("dashboard");
    setLoginMode("login");
  };

  // Filter Categories
  const categories = [
    "all",
    "E-Commerce",
    "Real Estate",
    "Digital",
    "Marketing",
    "Creative",
    "Local Services",
    "Gig Economy",
    "AI / Creative",
    "AI / Gig",
    "AI / Tech",
  ];

  // Filter & Search Hustles
  const filteredHustles = HUSTLES_DATA.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || h.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getHeaderTitle = () => {
    switch (activeView) {
      case "dashboard":
        return `Get Your Side Hustle — ${HOME_HEADLINE_OUTCOME}`;
      case "quiz":
        return findMineMode === "adult"
          ? "GYSH Adults Match Wizard"
          : "Four “Get Your Side Hustle” Match Wizards. One Family Adventure.";
      case "calculators": return "GYSH Profit Estimator";
      case "guides":
        if (guidesManualId) {
          const labels: Record<MarketingGuideId, string> = {
            adult: "GYSH Adult Guide",
            kids: "GYSH Kids Guide",
            teens: "GYSH Teens Guide",
            seniors: "GYSH Seniors Guide",
            master: "GYSH Complete Guide",
          };
          return labels[guidesManualId];
        }
        return "GYSH Guides";
      case "checklist": return "GYSH Side Hustle Guide";
      case "community": return "GYSH Community";
      case "workshops": return "GYSH Workshops & Speakers";
      case "kids": return "GYSH Kids & Teens Corner";
      case "seniors": return "GYSH Seniors Corner";
      case "about": return "About GYSH";
      case "contact": return "GYSH Contact Us";
      case "join": return "Join GYSH";
      case "membership_signup": return "GYSH Membership Sign-up";
      case "login": return "GYSH Sign In";
      case "user_portal":
        return isYouthDashboardUser(authUser)
          ? youthAgeBand(authUser) === "junior"
            ? "GYSH Teens Dashboard"
            : "GYSH Kids Dashboard"
          : "GYSH My Dashboard";
      case "admin": return "GYSH Admin Studio";
      default: return SITE_NAME;
    }
  };

  const getHeaderDesc = () => {
    switch (activeView) {
      case "dashboard": return SITE_PURPOSE;
      case "quiz": return "";
      case "calculators": return "Estimate cash flow, product margins, and affiliate returns.";
      case "guides":
        return guidesManualId
          ? "Downloadable showcase guide with checklists, journey arrows, membership perks, and CTAs."
          : "Browse Adult, Senior, Kids, and Teens guides — plus downloadable audience guides from each Corner.";
      case "checklist": return "Practical launch steps — preview is open; the full list unlocks when you sign in.";
      case "workshops": return "Live sessions and guest experts for adult Side Hustles, AI agents, and Kids Glow nights.";
      case "community": return "Ask questions, share updates, and exchange tips with other Side Hustlers.";
      case "kids": return "Stories, GYSH Match Wizard, ideas, savings, and guides for Kids and Teens — parents coach the journey.";
      case "seniors": return "GYSH Match Wizard and flexible Side Hustles for 55+, retirees, and second careers.";
      case "about": return "Meet Tina Marie Barham and Evelyn Irving — the partnership behind Get Your Side Hustle.";
      case "contact": return "Questions, partnerships, or workshop inquiries — we’d love to hear from you.";
      case "join": return "Create an account, explore teams, and compare Free through Elite plans.";
      case "login": return "Sign in to save bookmarks, unlock badges, and track launch milestones.";
      case "user_portal":
        return isYouthDashboardUser(authUser)
          ? "Your Blueprint, credits, and shortcuts into Kids & Teens Corner."
          : "Check guide progress, badges, and launch milestones.";
      case "admin": return "Manage content calendars, growth guides, and monetization models.";
      default: return "";
    }
  };

  if (consentToken) {
    return (
      <ParentConsentPage
        token={consentToken}
        onClose={() => {
          clearConsentTokenFromUrl();
          setConsentToken(null);
        }}
      />
    );
  }

  const renderHomeHowSteps = (titleId: string) => (
    <aside className="home-promo-hero__steps" aria-labelledby={titleId}>
      <h2 id={titleId} className="home-promo-hero__steps-heading">
        <span className="home-promo-hero__steps-title">Who is GYSH for?</span>
      </h2>
      <p className="home-promo-hero__steps-note">
        Building with family or going solo — WE GOT YOU! Pick the path that matches your stage, then
        run the wizard built for you.
      </p>
      <ol className="home-promo-hero__bubbles" aria-label="Ways to start with GYSH">
        <li>
          <button type="button" className="home-step-bubble" onClick={() => goTo("quiz")}>
            <span className="home-step-bubble__num" aria-hidden="true">
              1
            </span>
            <span className="home-step-bubble__body">
              <strong>GYSH Match Wizard</strong>
              <span>Four age wizards for Kids, Teens, Adults &amp; Seniors — family fun.</span>
            </span>
            <Sparkles size={16} className="home-step-bubble__icon" aria-hidden="true" />
          </button>
        </li>
        <li>
          <button type="button" className="home-step-bubble" onClick={() => openKidsCorner()}>
            <span className="home-step-bubble__num" aria-hidden="true">
              2
            </span>
            <span className="home-step-bubble__body">
              <strong>Families</strong>
              <span>Safe hustles, stories, and parents as GYSH Coaches.</span>
            </span>
            <Star size={16} className="home-step-bubble__icon" aria-hidden="true" />
          </button>
        </li>
        <li>
          <button type="button" className="home-step-bubble" onClick={() => openSeniors()}>
            <span className="home-step-bubble__num" aria-hidden="true">
              3
            </span>
            <span className="home-step-bubble__body">
              <strong>Seniors</strong>
              <span>Flexible hustles for 55+, retirees, and second careers.</span>
            </span>
            <Heart size={16} className="home-step-bubble__icon" aria-hidden="true" />
          </button>
        </li>
        <li>
          <button
            type="button"
            className="home-step-bubble"
            onClick={() => setActiveView("workshops")}
          >
            <span className="home-step-bubble__num" aria-hidden="true">
              4
            </span>
            <span className="home-step-bubble__body">
              <strong>Workshops</strong>
              <span>Live sessions and guest experts to launch with support.</span>
            </span>
            <Mic2 size={16} className="home-step-bubble__icon" aria-hidden="true" />
          </button>
        </li>
        <li>
          <button type="button" className="home-step-bubble" onClick={() => openJoin()}>
            <span className="home-step-bubble__num" aria-hidden="true">
              5
            </span>
            <span className="home-step-bubble__body">
              <strong>Join</strong>
              <span>Create a free account and start tracking your pilot.</span>
            </span>
            <UserPlus size={16} className="home-step-bubble__icon" aria-hidden="true" />
          </button>
        </li>
      </ol>
    </aside>
  );

  return (
    <div className="app-container">
      <header className={`top-header${mobileMenuOpen ? " open" : ""}`}>
        <div className="top-header-inner">
          <button type="button" className="brand-section" onClick={() => goTo("dashboard")} aria-label="Home">
            <img
              src={gyshLogo}
              alt="Get Your Side Hustle"
              className="brand-header-logo"
              width={584}
              height={280}
            />
          </button>

          <button
            type="button"
            className="menu-toggle"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="top-header-menus">
            <nav className="nav-primary" aria-label="Primary">
              <ul className="nav-links nav-links--primary">
                <li>
                  <button
                    type="button"
                    onClick={() => goTo("dashboard")}
                    className={`nav-link-btn ${activeView === "dashboard" ? "active" : ""}`}
                    data-testid="nav-home"
                  >
                    <Home size={16} className="nav-icon nav-icon--home" aria-hidden />
                    Home
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => goTo("quiz")}
                    className={`nav-link-btn ${activeView === "quiz" ? "active" : ""}`}
                    data-testid="nav-find-mine"
                  >
                    <Sparkles size={16} className="nav-icon nav-icon--quiz" aria-hidden />
                    GYSH Match Wizard
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openKidsCorner()}
                    className={`nav-link-btn ${activeView === "kids" ? "active" : ""}`}
                    data-testid="nav-kids"
                  >
                    <img
                      src={kevinaNavMark}
                      alt="Kevina Starr"
                      aria-hidden="true"
                      className="nav-kevina-mark"
                      width={28}
                      height={28}
                    />
                    Kids & Teens
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openSeniors()}
                    className={`nav-link-btn ${activeView === "seniors" ? "active" : ""}`}
                    data-testid="nav-seniors"
                  >
                    <Heart size={16} className="nav-icon nav-icon--seniors" aria-hidden />
                    Seniors
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openGuidesLibrary()}
                    className={`nav-link-btn ${activeView === "guides" ? "active" : ""}`}
                    data-testid="nav-guides"
                  >
                    <BookOpen size={16} className="nav-icon nav-icon--guides" aria-hidden />
                    Guides
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => goTo("workshops")}
                    className={`nav-link-btn ${activeView === "workshops" ? "active" : ""}`}
                    data-testid="nav-workshops"
                  >
                    <Mic2 size={16} className="nav-icon nav-icon--workshops" aria-hidden />
                    Workshops
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => goTo("community")}
                    className={`nav-link-btn ${activeView === "community" ? "active" : ""}`}
                  >
                    <MessageSquare size={16} className="nav-icon nav-icon--community" aria-hidden />
                    Community
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openJoin()}
                    className={`nav-link-btn ${activeView === "join" ? "active" : ""}`}
                    data-testid="nav-join"
                  >
                    <UserPlus size={16} className="nav-icon nav-icon--join" aria-hidden />
                    Join
                  </button>
                </li>
              </ul>
            </nav>

          <div className="top-header-row top-header-row--meta">
            <nav className="nav-secondary" aria-label="Account and info">
              <ul className="nav-links nav-links--secondary">
                <li>
                  <button
                    type="button"
                    onClick={() => goTo("about")}
                    className={`nav-link-btn ${activeView === "about" ? "active" : ""}`}
                    data-testid="nav-about"
                  >
                    <Info size={16} className="nav-icon nav-icon--about" aria-hidden />
                    About
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => goTo("contact")}
                    className={`nav-link-btn ${activeView === "contact" ? "active" : ""}`}
                    data-testid="nav-contact"
                  >
                    <Mail size={16} className="nav-icon nav-icon--contact" aria-hidden />
                    Contact Us
                  </button>
                </li>
              </ul>
              <a
                href={FACEBOOK_URL}
                className="header-social-link header-social-link--icon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                data-testid="header-facebook"
                title="Follow Get Your Side Hustle on Facebook — facebook.com/getyoursidehustleofficial"
              >
                <FacebookIcon size={24} aria-hidden />
                <span className="header-social-link__label">Facebook</span>
              </a>
            </nav>

            <div className="header-actions">
            {isLoggedIn ? (
              <>
                {userRole === "admin" && !previewingAsMember ? (
                  <div
                    ref={adminMenuRef}
                    className={`admin-nav-dropdown${adminMenuOpen ? " open" : ""}`}
                    onMouseEnter={() => setAdminMenuOpen(true)}
                    onMouseLeave={() => setAdminMenuOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setAdminMenuOpen((open) => !open)}
                      className={`nav-link-btn admin-nav-trigger${activeView === "admin" ? " active" : ""}`}
                      aria-expanded={adminMenuOpen}
                      aria-haspopup="menu"
                      data-testid="nav-admin"
                    >
                      <Shield size={16} className="nav-icon nav-icon--admin" aria-hidden />
                      Admin
                      <ChevronDown size={14} className="admin-nav-chevron" aria-hidden />
                    </button>
                    <ul className="admin-nav-menu admin-nav-menu--grouped" role="menu" hidden={!adminMenuOpen}>
                      {ADMIN_MENU_GROUPS.map((group) => {
                        const roles = authUser?.roles?.length
                          ? authUser.roles
                          : authUser?.role
                            ? [authUser.role]
                            : [];
                        const tabs = group.tabs
                          .map((id) => adminTabById(id))
                          .filter((tab): tab is NonNullable<typeof tab> => Boolean(tab))
                          .filter((tab) => !tab.adminOnly || roles.includes("admin"));
                        if (tabs.length === 0) return null;
                        return (
                          <li key={group.id} className="admin-nav-group" role="none">
                            <p className="admin-nav-group__label" aria-hidden>
                              {group.label}
                            </p>
                            <ul className="admin-nav-group__list" role="group" aria-label={group.label}>
                              {tabs.map((tab) =>
                                tab.id === "user-guides" ? (
                                  <li key={tab.id} role="none">
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className={`admin-nav-item${
                                        activeView === "admin" && adminTab === "user-guides" ? " active" : ""
                                      }`}
                                      onClick={() => goToAdmin("user-guides")}
                                    >
                                      {tab.label}
                                    </button>
                                    <ul className="admin-nav-submenu" role="group" aria-label="User Guides">
                                      {ADMIN_USER_GUIDE_LINKS.map((guide) => (
                                        <li key={guide.id} role="none">
                                          <button
                                            type="button"
                                            role="menuitem"
                                            className={`admin-nav-item admin-nav-item--sub${
                                              activeView === "admin" &&
                                              adminTab === "user-guides" &&
                                              adminUserGuide === guide.id
                                                ? " active"
                                                : ""
                                            }`}
                                            onClick={() => goToAdmin("user-guides", guide.id)}
                                          >
                                            {guide.label}
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </li>
                                ) : (
                                  <li key={tab.id} role="none">
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className={`admin-nav-item${
                                        activeView === "admin" && adminTab === tab.id ? " active" : ""
                                      }`}
                                      onClick={() => goToAdmin(tab.id)}
                                    >
                                      {tab.label}
                                    </button>
                                  </li>
                                ),
                              )}
                            </ul>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
                {userRole === "admin" ? (
                  <div
                    ref={actAsMenuRef}
                    className={`admin-nav-dropdown profile-switch-dropdown${actAsMenuOpen ? " open" : ""}`}
                    data-testid="admin-profile-switcher"
                  >
                    <button
                      type="button"
                      className="nav-link-btn profile-switch-trigger"
                      aria-expanded={actAsMenuOpen}
                      aria-haspopup="menu"
                      onClick={() => setActAsMenuOpen((o) => !o)}
                      data-testid="admin-profile-switch-trigger"
                    >
                      <div className="avatar" style={{ background: "var(--grad-primary)", width: 28, height: 28 }} />
                      <div className="user-info">
                        <span className="user-name">{authUser?.name || "GYSH Admin"}</span>
                        <span className="user-role">
                          {actAsTarget.type === "self" ? "Admin · switch profile" : `Viewing as ${actAsLabel(actAsTarget)}`}
                        </span>
                      </div>
                      <ChevronDown size={14} className="admin-nav-chevron" aria-hidden />
                    </button>
                    <ul className="admin-nav-menu profile-switch-menu" role="menu" hidden={!actAsMenuOpen}>
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className={`admin-nav-item${actAsTarget.type === "self" ? " active" : ""}`}
                          onClick={() => applyActAsTarget({ type: "self" })}
                        >
                          Admin (me)
                        </button>
                      </li>
                      <li className="profile-switch-heading" role="presentation">
                        Use app as
                      </li>
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className={`admin-nav-item${actAsTarget.type === "guest" ? " active" : ""}`}
                          data-testid="admin-profile-switch-guest"
                          onClick={() => applyActAsTarget({ type: "guest" })}
                        >
                          <span className="profile-switch-item-label">{ACT_AS_GUEST_OPTION.label}</span>
                          <span className="profile-switch-item-desc">
                            {ACT_AS_GUEST_OPTION.description}
                          </span>
                        </button>
                      </li>
                      {ACT_AS_AUDIENCE_OPTIONS.map((opt) => (
                        <li key={opt.audience} role="none">
                          <button
                            type="button"
                            role="menuitem"
                            className={`admin-nav-item${
                              actAsTarget.type === "audience" && actAsTarget.audience === opt.audience
                                ? " active"
                                : ""
                            }`}
                            onClick={() =>
                              applyActAsTarget({ type: "audience", audience: opt.audience })
                            }
                          >
                            <span className="profile-switch-item-label">{opt.label}</span>
                            <span className="profile-switch-item-desc">{opt.description}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="user-profile" data-testid="header-member-profile">
                    <div className="avatar" style={{ background: "var(--grad-pink)" }} />
                    <div className="user-info">
                      <span className="user-name" data-testid="header-member-name">
                        {(authUser?.name || "").trim() ||
                          (authUser?.email || "").split("@")[0] ||
                          "Member"}
                      </span>
                      <span className="user-role" data-testid="header-member-role">
                        {(() => {
                          const roles = authUser?.roles?.length
                            ? authUser.roles
                            : authUser?.role
                              ? [authUser.role]
                              : [];
                          const audience = String(authUser?.audience || "").toLowerCase();
                          if (roles.includes("junior") || audience === "junior") return "Teen member";
                          if (roles.includes("kid") || audience === "kids") return "Kid member";
                          if (audience === "parent") return "Parent coach";
                          if (audience === "senior" || roles.includes("senior")) return "Senior member";
                          return "Member";
                        })()}
                      </span>
                    </div>
                  </div>
                )}
                {previewingAsGuest ? (
                  <button
                    type="button"
                    onClick={() => {
                      goTo("login");
                      setMobileMenuOpen(false);
                      setAdminMenuOpen(false);
                      setActAsMenuOpen(false);
                    }}
                    className="btn btn-primary"
                    style={{ padding: "8px 14px", fontSize: "0.95rem", gap: "6px" }}
                    data-testid="guest-preview-login"
                  >
                    <LogIn size={14} />
                    Login
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                      setAdminMenuOpen(false);
                      setActAsMenuOpen(false);
                    }}
                    className="btn btn-outline"
                    style={{ padding: "6px 12px", fontSize: "0.9375rem", gap: "6px" }}
                    data-testid="header-logout"
                  >
                    <LogOut size={12} /> Log Out
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => goTo("login")}
                className={`btn btn-primary ${activeView === "login" ? "" : ""}`}
                style={{ padding: "8px 14px", fontSize: "0.95rem", gap: "6px" }}
                data-testid="header-login"
              >
                <LogIn size={14} />
                Login
              </button>
            )}
            <div className="page-zoom-controls" role="group" aria-label="Page zoom">
              <button
                type="button"
                className="page-zoom-btn"
                aria-label="Zoom out"
                data-testid="page-zoom-out"
                disabled={pageZoom <= 90}
                onClick={() => setPageZoom((z) => Math.max(90, z - 10))}
              >
                <Minus size={16} aria-hidden />
              </button>
              <span className="page-zoom-value" aria-live="polite">
                {pageZoom}%
              </span>
              <button
                type="button"
                className="page-zoom-btn"
                aria-label="Zoom in"
                data-testid="page-zoom-in"
                disabled={pageZoom >= 150}
                onClick={() => setPageZoom((z) => Math.min(150, z + 10))}
              >
                <Plus size={16} aria-hidden />
              </button>
            </div>
            </div>
          </div>
          </div>
        </div>
      </header>

      <div className="app-zoom-content" style={contentZoomStyle}>
      <main className="main-content">
        {activeView !== "dashboard" && (
          <>
            <div
              className={`header-row header-row--how${
                activeView === "guides" ? " header-row--guides" : ""
              }${activeView === "kids" ? " header-row--kids" : ""}${
                activeView === "seniors" ? " header-row--seniors" : ""
              }${activeView === "about" ? " header-row--about" : ""}`}
            >
              <div className="header-title-block">
                <div className="header-title-top">
                  <h1 data-testid="page-title">
                    {getHeaderTitle()}
                    {(activeView === "join" || activeView === "membership_signup") && (
                      <span className="header-title-aside">(FREE PLANS AVAILABLE)</span>
                    )}
                    {effectivePortalLogin ? (
                      <button
                        type="button"
                        className={`header-title-dashboard-badge${
                          activeView === "user_portal" ? " is-active" : ""
                        }`}
                        onClick={() => goTo("user_portal")}
                        data-testid="header-dashboard"
                        aria-current={activeView === "user_portal" ? "page" : undefined}
                      >
                        <span className="header-title-dashboard-badge__glow" aria-hidden />
                        <LayoutDashboard size={16} aria-hidden />
                        <span>My Dashboard</span>
                      </button>
                    ) : null}
                  </h1>
                  {activeView === "admin" && adminTab !== "daily-progress" && (
                    <DailyProgressReport onOpen={() => goToAdmin("daily-progress")} />
                  )}
                  {!(activeView === "admin" && adminTab === "daily-progress") && (
                    <button
                      type="button"
                      className="match-finder-adult-how-toggle page-how-toggle"
                      onClick={() => setHowOpen((o) => !o)}
                      aria-expanded={howOpen}
                      data-testid="page-how-it-works"
                    >
                      {howOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      How it works
                    </button>
                  )}
                </div>
                {getHeaderDesc() ? (
                  <p className="header-title-desc">{getHeaderDesc()}</p>
                ) : null}
              </div>
            </div>
            {howOpen && !(activeView === "admin" && adminTab === "daily-progress") && (() => {
              const how = getHowItWorksContent();
              return (
                <div className="match-finder-adult-how-panel page-how-panel" data-testid="page-how-panel">
                  <strong>{how.title}</strong>
                  <ol>
                    {how.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              );
            })()}
          </>
        )}

        {/* View Switcher */}
        {activeView === "dashboard" && (
          <div className="dashboard-home">
            <header className="home-page-header" data-testid="home-page-header">
              <h1 className="home-page-header__title" data-testid="page-title">
                <span className="home-page-header__brand-block">
                  <em className="home-page-header__brand">Get Your Side Hustle</em>
                  {effectivePortalLogin ? (
                    <button
                      type="button"
                      className="header-title-dashboard-badge"
                      onClick={() => goTo("user_portal")}
                      data-testid="header-dashboard"
                    >
                      <span className="header-title-dashboard-badge__glow" aria-hidden />
                      <LayoutDashboard size={16} aria-hidden />
                      <span>My Dashboard</span>
                    </button>
                  ) : null}
                </span>
                <span className="home-page-header__headline">{HOME_HEADLINE_OUTCOME}</span>
              </h1>
              <p className="home-page-header__purpose" data-testid="home-site-purpose">
                {SITE_PURPOSE}
              </p>
              <button
                type="button"
                className="home-how-intro-toggle"
                onClick={() => setHomeHowOpen((o) => !o)}
                aria-expanded={homeHowOpen}
                aria-controls="home-how-lead"
                data-testid="home-how-it-works"
              >
                {homeHowOpen ? <ChevronDown size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
                How It Works
              </button>
              <p
                id="home-how-lead"
                className={`home-page-header__lead${homeHowOpen ? " is-open" : ""}`}
                data-testid="home-how-panel"
              >
                Each wizard asks age-appropriate questions so matches feel doable—not generic. Parents become{" "}
                <strong>GYSH Coaches</strong> for kids and teens: cheer, set boundaries, and help turn ideas into
                safe first wins. Parental consent required through age 12 — not required for ages 13+.
              </p>
            </header>

            <section className="home-promo-hero" aria-label="Get Your Side Hustle family promotion">
              <div className="home-promo-hero__band">
                <div className="home-promo-hero__layout">
                  <div className="home-promo-hero__frame">
                    <picture>
                      <source srcSet="/brand/gysh-home-hero.webp" type="image/webp" />
                      <img
                        src="/brand/gysh-home-hero.png"
                        alt="Get Your Side Hustle — Ideas, Action, Income, Freedom. For Kids, Teens, Adults & Seniors. Start your journey today."
                        className="home-promo-hero__img"
                        width={960}
                        height={639}
                        decoding="async"
                        fetchPriority="high"
                      />
                    </picture>
                  </div>
                  <div className="home-promo-hero__steps--desktop">
                    {renderHomeHowSteps("home-steps-title")}
                  </div>
                </div>
              </div>
            </section>

            <section
              className="glass home-match-family"
              data-testid="home-match-family"
              aria-labelledby="home-match-family-title"
            >
              <div className="home-match-family__section-head">
                <div className="home-match-family__cta-stack">
                  <button
                    type="button"
                    className="btn btn-primary home-match-family__side-cta"
                    onClick={() => openJoin()}
                    data-testid="home-join-cta"
                  >
                    <UserPlus size={16} aria-hidden /> Join GYSH free
                  </button>
                  <p className="home-match-family__cta-expect" data-testid="home-join-expectation">
                    Start free — explore tools and join in under 2 minutes.
                  </p>
                </div>
                <div className="home-match-family__section-copy">
                  <span className="glow-badge free home-match-family__eyebrow">
                    <Sparkles size={13} /> Your age · Your wizard
                  </span>
                  <h2 id="home-match-family-title" className="home-match-family__section-title">
                    Pick Your Path
                    <br />
                    Kids · Teens · Adults · Seniors
                  </h2>
                  <p className="home-match-family__section-sub">
                    Four demographic lanes. One family adventure. Choose the wizard built for your stage of
                    life — then validate with margin calculators before you spend.
                  </p>
                </div>
                <a
                  href={FACEBOOK_URL}
                  className="btn btn-outline home-match-family__side-cta home-match-family__facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow on Facebook"
                  data-testid="home-facebook"
                  title="Follow Get Your Side Hustle on Facebook — facebook.com/getyoursidehustleofficial"
                >
                  <FacebookIcon size={22} aria-hidden />
                  <span>Follow on Facebook</span>
                </a>
              </div>
              <ul className="home-match-family__grid">
                <li className="home-match-family__card home-match-family__card--kids">
                  <div className="home-match-family__title-row">
                    <strong>Kids (4–12)</strong>
                    <button
                      type="button"
                      className="home-match-family__card-cta home-match-family__card-cta--kids"
                      data-testid="home-path-cta-kids"
                      aria-label="Open Kids page"
                      onClick={() => openKidsCorner({ mode: "kids", tab: "wizard" })}
                    >
                      Open <ArrowRight size={14} aria-hidden />
                    </button>
                  </div>
                  <span className="home-match-family__bands" aria-label="Match ages 4–8 and 9–12">
                    <span className="home-match-family__band">4–8</span>
                    <span className="home-match-family__band">9–12</span>
                  </span>
                  <span className="home-match-family__desc">
                    Confidence, kindness, and parent-guided first hustles.
                  </span>
                </li>
                <li className="home-match-family__card home-match-family__card--teens">
                  <div className="home-match-family__title-row">
                    <strong>Teens (13–17)</strong>
                    <button
                      type="button"
                      className="home-match-family__card-cta home-match-family__card-cta--teens"
                      data-testid="home-path-cta-teens"
                      aria-label="Open Teens page"
                      onClick={() => openKidsCorner({ mode: "junior", tab: "wizard" })}
                    >
                      Open <ArrowRight size={14} aria-hidden />
                    </button>
                  </div>
                  <span className="home-match-family__bands" aria-label="Match ages 13–14 and 15–17">
                    <span className="home-match-family__band">13–14</span>
                    <span className="home-match-family__band">15–17</span>
                  </span>
                  <span className="home-match-family__desc">
                    Bigger skills, safer independence, still coach-friendly.
                  </span>
                </li>
                <li className="home-match-family__card home-match-family__card--adult">
                  <div className="home-match-family__title-row">
                    <strong>Adult (18–54)</strong>
                    <button
                      type="button"
                      className="home-match-family__card-cta home-match-family__card-cta--adult"
                      data-testid="home-path-cta-adult"
                      aria-label="Open Adults page"
                      onClick={openAdultFindMine}
                    >
                      Open <ArrowRight size={14} aria-hidden />
                    </button>
                  </div>
                  <span className="home-match-family__desc">
                    Ranked matches from budget, hours, strengths, and goals — built for real adult schedules.
                  </span>
                </li>
                <li className="home-match-family__card home-match-family__card--senior">
                  <div className="home-match-family__title-row">
                    <strong>Senior (55+)</strong>
                    <button
                      type="button"
                      className="home-match-family__card-cta home-match-family__card-cta--senior"
                      data-testid="home-path-cta-senior"
                      aria-label="Open Seniors page"
                      onClick={() => openSeniors(null)}
                    >
                      Open <ArrowRight size={14} aria-hidden />
                    </button>
                  </div>
                  <span className="home-match-family__desc">
                    Flexible pacing for retirees, second careers, and experience-powered side hustles.
                  </span>
                </li>
              </ul>
              <p className="home-match-family__note">
                Make GYSH Match Wizard night a family ritual: kids and teens take their path with a GYSH Coach
                nearby, while adults and seniors run theirs — then compare results and celebrate together.
              </p>
              <button
                type="button"
                className="btn btn-primary home-match-family__cta"
                onClick={() => goTo("quiz")}
              >
                Choose your GYSH Match Wizard <Sparkles size={16} />
              </button>
            </section>

            {/* Filter & Search — [logo] [All Hustles] [categories…] */}
            <div className="hustle-filter-bar" aria-label="Filter side hustles by category">
              <div className="hustle-filter-bar__filters">
                <div className="hustle-filter-bar__logo brand-logo" aria-hidden="true">
                  <Flame size={16} style={{ fill: "white" }} />
                </div>
                {categories.map((c) => {
                  const isActive = filterCategory === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFilterCategory(c)}
                      className={`glow-badge hustle-filter-badge${isActive ? " hustle-filter-badge--active purple" : ""}`}
                      aria-pressed={isActive}
                    >
                      {c === "all" ? "All Hustles" : c}
                    </button>
                  );
                })}
              </div>

              <div className="hustle-filter-bar__search">
                <Search
                  size={16}
                  className="hustle-filter-bar__search-icon"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-input hustle-filter-bar__search-input"
                  aria-label="Search opportunities"
                />
              </div>
            </div>

            {/* Grid List */}
            {filteredHustles.length > 0 ? (
              <div className="hustle-grid">
                {filteredHustles.map((hustle) => (
                  <HustleCard 
                    key={hustle.id} 
                    hustle={hustle} 
                    onSelectAction={handleSelectHustleAction}
                  />
                ))}
              </div>
            ) : (
              <div className="glass" style={{ padding: "48px", textAlign: "center", borderRadius: "16px" }}>
                <p style={{ color: "var(--text-primary)", marginBottom: "16px" }}>No side hustles match your search criteria.</p>
                <button onClick={() => { setSearchQuery(""); setFilterCategory("all"); }} className="btn btn-outline">
                  Clear Filters
                </button>
              </div>
            )}

            <TrainingCircles
              onOpenGuides={() => setActiveView("guides")}
              onOpenKids={() => openKidsCorner()}
            />

            <HomeForesightBlocks onJoin={() => openJoin()} />
          </div>
        )}

        {activeView === "quiz" && (
          <>
            {findMineMode === "select" ? (
              <FindMineWizardSelector
                onKids={() => openKidsCorner({ mode: "kids", tab: "wizard" })}
                onJunior={() => openKidsCorner({ mode: "junior", tab: "wizard" })}
                onAdult={openAdultFindMine}
                onSenior={() => openSeniors(null)}
              />
            ) : (
              <HustleQuiz
                hustles={HUSTLES_DATA}
                onSelectAction={handleSelectHustleAction}
                isLoggedIn={effectiveMemberAccess}
                previewAsGuest={previewingAsGuest}
                onUnlockBlueprint={() => openJoin("adult")}
              />
            )}
            <TrainingCircles
              onOpenGuides={() => setActiveView("guides")}
              onOpenKids={() => openKidsCorner()}
            />
          </>
        )}

        {activeView === "calculators" && (
          <CalculatorSection 
            initialActiveTab={
              selectedHustleId === "pod" || selectedHustleId === "dropshipping" || selectedHustleId === "amazon" 
                ? "ecom" 
                : selectedHustleId === "social" ||
                    selectedHustleId === "affiliate" ||
                    selectedHustleId === "digital-products" ||
                    selectedHustleId === "book-publishing"
                ? "social"
                : "airbnb"
            }
            onGoToGuide={handleGoToGuideFromCalculator}
          />
        )}

        {activeView === "guides" && (
          guidesManualId ? (
            <Suspense
              fallback={
                <div className="glass" style={{ padding: 32, textAlign: "center" }}>
                  <WaitLabel>Loading…</WaitLabel>
                </div>
              }
            >
              <MarketingManual
                guideId={guidesManualId}
                onBack={openGuidesLibrary}
                onGoToJoin={() =>
                  openJoin(
                    guidesManualId === "kids"
                      ? "kids"
                      : guidesManualId === "teens"
                        ? "junior"
                        : guidesManualId === "seniors"
                          ? "senior"
                          : "adult",
                  )
                }
                onOpenMatchWizard={() => {
                  if (guidesManualId === "kids") openKidsCorner({ mode: "kids", tab: "wizard" });
                  else if (guidesManualId === "teens") openKidsCorner({ mode: "junior", tab: "wizard" });
                  else if (guidesManualId === "seniors") openSeniors(null);
                  else goTo("quiz");
                }}
              />
            </Suspense>
          ) : guidesDetailId ? (
            <StepByStepGuides
              selectedHustleId={guidesDetailId}
              onGoToCalculator={handleGoToCalculatorFromGuide}
              isLoggedIn={effectivePortalLogin}
              membershipTier={
                authUser?.membershipTier ?? (effectivePortalLogin ? "free" : null)
              }
              onGoToJoin={() => openJoin("adult")}
              onGoToLogin={() => goTo("login")}
              onBackToCatalog={() => setGuidesDetailId(null)}
            />
          ) : (
            <FreeGuidesPage
              isLoggedIn={effectivePortalLogin}
              membershipTier={
                authUser?.membershipTier ?? (effectivePortalLogin ? "free" : null)
              }
              onGoToJoin={(audience) => openJoin(audience ?? "adult")}
              onGoToLogin={() => goTo("login")}
              onOpenAdultGuide={(id) => {
                setGuidesManualId(null);
                setSelectedHustleId(id);
                setGuidesDetailId(id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenKidsGuides={() => openKidsCorner({ mode: "kids", tab: "guides" })}
              onOpenJuniorGuides={() => openKidsCorner({ mode: "junior", tab: "guides" })}
              onOpenSeniorsGuides={() => openSeniors("guides")}
              onOpenManual={openGuidesManual}
            />
          )
        )}

        {activeView === "checklist" && (
          <LaunchChecklistPage
            isLoggedIn={effectivePortalLogin}
            onGoToJoin={() => openJoin("adult")}
            onGoToLogin={() => goTo("login")}
            onOpenGuide={handleOpenGuidePeek}
          />
        )}

        {activeView === "workshops" && (
          <WorkshopsHub />
        )}

        {activeView === "community" && (
          <CommunityHub />
        )}

        {activeView === "kids" && (
          <KidsCorner
            isLoggedIn={kidsCornerMemberAccess}
            hasAccountLogin={effectivePortalLogin}
            previewAsGuest={previewingAsGuest}
            membershipTier={
              authUser?.membershipTier ?? (kidsCornerMemberAccess ? "free" : null)
            }
            onGoToJoin={(audience) => openJoin(audience)}
            onOpenDashboard={
              isLoggedIn && !previewingAsGuest ? () => goTo("user_portal") : undefined
            }
            onOpenGuidesLibrary={() => goTo("guides")}
            onOpenSeniors={() => openSeniors("guides")}
            entryFocus={kidsEntryFocus}
          />
        )}

        {activeView === "seniors" && (
          <SeniorSideHustles
            isLoggedIn={
              !previewingAsGuest &&
              (actAsAudienceNow === "senior" || (hasMemberAccess && !canUseAdminPortal))
            }
            previewAsGuest={previewingAsGuest}
            membershipTier={
              authUser?.membershipTier ??
              (!previewingAsGuest &&
              (actAsAudienceNow === "senior" || (hasMemberAccess && !canUseAdminPortal))
                ? "free"
                : null)
            }
            onGoToJoin={() => openJoin("senior")}
            onOpenGuides={() => goTo("guides")}
            onOpenLaunchGuide={(launchGuideId) => goTo("guides", { launchGuideId })}
            entryTab={seniorsEntryTab}
          />
        )}

        {/* View: User / Admin Login form */}
        {activeView === "login" && (
          <div style={{ maxWidth: "420px", margin: "40px auto" }} className="glass" data-testid="login-page">
            <div style={{ padding: "32px", borderRadius: "16px" }}>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <img
                  src={gyshLogo}
                  alt="Get Your Side Hustle"
                  className="login-box-logo"
                  width={234}
                  height={112}
                  decoding="async"
                />
                <h2 style={{ fontSize: "1.4rem", color: "var(--text-primary)", marginBottom: "6px" }}>
                  {loginMode === "login"
                    ? "Sign In"
                    : loginMode === "set-password"
                      ? "Choose a new password"
                      : "Reset Password"}
                </h2>
                <p style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
                  {loginMode === "login"
                    ? "Sign in to unlock bookmarks, calendars, and admin tools."
                    : loginMode === "set-password"
                      ? "Enter and confirm your new password for this GYSH account."
                      : "Enter the email on your GYSH account. We’ll send you a reset link."}
                </p>
              </div>

              {loginMode === "login" ? (
                <>
                  <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {loginError && (
                      <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "0.9375rem", textAlign: "center" }}>
                        {loginError}
                      </div>
                    )}

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.9375rem" }}>Email Address</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="text-input"
                        required
                        autoComplete="username"
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.9375rem" }}>Password</label>
                      <div className="password-field">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={passInput}
                          onChange={(e) => setPassInput(e.target.value)}
                          className="text-input"
                          required
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: "100%", marginTop: "10px" }}
                      disabled={loginBusy}
                    >
                      {loginBusy ? <WaitLabel>Signing in…</WaitLabel> : "Log In"}
                    </button>
                  </form>

                  <p style={{ marginTop: "16px", fontSize: "0.9375rem", color: "var(--text-primary)", textAlign: "center" }}>
                    <button type="button" className="inline-text-link" onClick={openResetMode}>
                      Forgot / Reset password?
                    </button>
                  </p>

                  <p style={{ marginTop: "12px", fontSize: "0.9375rem", color: "var(--text-primary)", textAlign: "center" }}>
                    New here?{" "}
                    <button
                      type="button"
                      className="inline-text-link"
                      onClick={() => openMembershipSignup("free")}
                    >
                      Join GYSH
                    </button>
                  </p>
                </>
              ) : loginMode === "forgot" ? (
                <>
                  <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {resetError && (
                      <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "0.9375rem", textAlign: "center" }}>
                        {resetError}
                      </div>
                    )}
                    {resetSuccess && (
                      <div style={{ padding: "10px", background: "rgba(95, 122, 69, 0.12)", border: "1px solid rgba(95, 122, 69, 0.35)", borderRadius: "8px", color: "#3f5230", fontSize: "0.9375rem", textAlign: "center" }}>
                        {resetSuccess}
                      </div>
                    )}

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.9375rem" }}>Account email</label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="text-input"
                        required
                        autoComplete="username"
                        placeholder="you@example.com"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: "100%", marginTop: "10px" }}
                      disabled={resetBusy}
                    >
                      {resetBusy ? <WaitLabel>Sending…</WaitLabel> : "Email me a reset link"}
                    </button>
                  </form>

                  <p style={{ marginTop: "16px", fontSize: "0.9375rem", color: "var(--text-primary)", textAlign: "center" }}>
                    <button type="button" className="inline-text-link" onClick={backToLogin}>
                      Back to sign in
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <form onSubmit={handleSetPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {resetError && (
                      <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "0.9375rem", textAlign: "center" }}>
                        {resetError}
                      </div>
                    )}
                    {resetSuccess && (
                      <div style={{ padding: "10px", background: "rgba(95, 122, 69, 0.12)", border: "1px solid rgba(95, 122, 69, 0.35)", borderRadius: "8px", color: "#3f5230", fontSize: "0.9375rem", textAlign: "center" }}>
                        {resetSuccess}
                      </div>
                    )}

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.9375rem" }}>New password</label>
                      <div className="password-field">
                        <input
                          type={showResetNew ? "text" : "password"}
                          value={resetNew}
                          onChange={(e) => setResetNew(e.target.value)}
                          className="text-input"
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowResetNew((v) => !v)}
                          aria-label={showResetNew ? "Hide password" : "Show password"}
                        >
                          {showResetNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.9375rem" }}>Confirm new password</label>
                      <div className="password-field">
                        <input
                          type={showResetConfirm ? "text" : "password"}
                          value={resetConfirm}
                          onChange={(e) => setResetConfirm(e.target.value)}
                          className="text-input"
                          required
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowResetConfirm((v) => !v)}
                          aria-label={showResetConfirm ? "Hide confirm password" : "Show confirm password"}
                        >
                          {showResetConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: "100%", marginTop: "10px" }}
                      disabled={resetBusy}
                    >
                      {resetBusy ? <WaitLabel>Saving…</WaitLabel> : "Save new password"}
                    </button>
                  </form>

                  <p style={{ marginTop: "16px", fontSize: "0.9375rem", color: "var(--text-primary)", textAlign: "center" }}>
                    <button type="button" className="inline-text-link" onClick={openResetMode}>
                      Request a new reset link
                    </button>
                    {" · "}
                    <button type="button" className="inline-text-link" onClick={backToLogin}>
                      Back to sign in
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {activeView === "about" && (
          <AboutPage onJoin={() => openJoin()} onOpenKids={() => setActiveView("kids")} />
        )}

        {activeView === "contact" && <ContactPage />}

        {activeView === "join" && (
          <JoinPage
            key={joinAudience ? `join-${joinAudience}` : "join-saved"}
            onLogin={() => goTo("login")}
            onSignup={(tier, audience) =>
              openMembershipSignup(tier ?? "free", audience ?? joinAudience)
            }
            onCommunity={() => goTo("community")}
            onKidsCorner={() => openKidsCorner()}
            onOpenFreeGuides={() => {
              setGuidesDetailId(null);
              goTo("guides");
            }}
            membershipAudience={joinAudience}
            scrollToPlans={joinScrollToPlans}
            onScrolledToPlans={() => setJoinScrollToPlans(false)}
            onBlueprintUnlocked={(ageGroup) => {
              setMemberAccessTick((n) => n + 1);
              restoreBlueprintAfterUnlock(ageGroup);
            }}
          />
        )}

        {activeView === "membership_signup" && (
          <MembershipSignupPage
            key={`signup-${joinAudience ?? "adult"}-${signupTier}`}
            initialAudience={joinAudience ?? readSavedJoinAudience("adult")}
            initialTier={signupTier}
            onBackToPlans={() => openJoin(joinAudience)}
            onGoToLogin={() => goTo("login")}
            onOpenFreeGuides={() => {
              setGuidesDetailId(null);
              goTo("guides");
            }}
          />
        )}

        {activeView === "user_portal" &&
          (isYouthDashboardUser(authUser) ? (
            <KidDashboard
              memberName={authUser?.name}
              ageBand={youthAgeBand(authUser)}
              onOpenMatchWizard={() =>
                openKidsCorner({
                  mode: youthAgeBand(authUser),
                  tab: "wizard",
                })
              }
              onOpenCorner={(tab) =>
                openKidsCorner({
                  mode: youthAgeBand(authUser),
                  tab: tab ?? "wizard",
                })
              }
              onOpenGuide={(ageGroup) => {
                openKidsCorner({
                  mode: ageGroup === "junior" ? "junior" : "kids",
                  tab: "guides",
                });
              }}
            />
          ) : parentKidDashboard ? (
            <KidDashboard
              key={parentKidDashboard.id}
              memberName={parentKidDashboard.displayName}
              ageBand={parentKidDashboard.ageBand}
              childProfileId={parentKidDashboard.id}
              parentCoachView
              onBack={() => setParentKidDashboard(null)}
              onOpenMatchWizard={() =>
                openKidsCorner({
                  mode: parentKidDashboard.ageBand,
                  tab: "wizard",
                })
              }
              onOpenCorner={(tab) =>
                openKidsCorner({
                  mode: parentKidDashboard.ageBand,
                  tab: tab ?? "wizard",
                })
              }
              onOpenGuide={(ageGroup) => {
                openKidsCorner({
                  mode: ageGroup === "junior" ? "junior" : "kids",
                  tab: "guides",
                });
              }}
            />
          ) : (
            <UserPortal
              memberName={authUser?.name}
              onOpenMatchWizard={() => {
                setFindMineMode("select");
                goTo("quiz");
              }}
              onOpenJoin={() => openJoin("adult")}
              onOpenKidDashboard={(kid) => {
                setParentKidDashboard(kid);
              }}
              onOpenGuide={(ageGroup, hustleId) => {
                if (ageGroup === "kids") {
                  openKidsCorner({ mode: "kids", tab: "guides" });
                  return;
                }
                if (ageGroup === "junior") {
                  openKidsCorner({ mode: "junior", tab: "guides" });
                  return;
                }
                if (ageGroup === "senior") {
                  openSeniors("guides");
                  return;
                }
                // Adult Blueprint matches share Launch Guide ids — open that guide detail.
                goTo("guides", { launchGuideId: hustleId });
              }}
            />
          ))}

        {activeView === "admin" && authReady && canUseAdminPortal && (
          <Suspense
            fallback={
              <div className="glass" style={{ padding: 32, textAlign: "center" }}>
                <WaitLabel>Loading…</WaitLabel>
              </div>
            }
          >
            <AdminPortal
              key={adminSessionKey}
              authUser={authUser}
              activeTab={adminTab}
              onTabChange={setAdminTab}
              userGuide={adminUserGuide}
              onUserGuideChange={setAdminUserGuide}
              onSiteMapNavigate={navigateFromSiteMap}
            />
          </Suspense>
        )}
      </main>

      <SiteFooter onNavigate={handleFooterNav} />
      <BusyOverlay
        active={loginBusy || resetBusy}
        message={
          loginBusy
            ? "Signing in…"
            : loginMode === "forgot"
              ? "Sending reset link…"
              : "Saving new password…"
        }
      />
      </div>
    </div>
  );
}

export default App;
