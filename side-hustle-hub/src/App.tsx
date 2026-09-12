import { Suspense, useEffect, useRef, useState } from "react";
import { 
  MessageSquare, 
  Sparkles,
  Search,
  Flame,
  Shield,
  FlaskConical,
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
  LayoutDashboard,
  Minus,
  Plus,
  ArrowRight,
  ShoppingCart,
  ShoppingBag,
  Crown,
  BookOpen,
  Users,
} from "lucide-react";
import { FacebookIcon } from "./components/FacebookIcon";
import { HeaderReferralBadge } from "./components/HeaderReferralBadge";
import { BusyOverlay, WaitLabel } from "./components/WaitFeedback";
import { HustleCard } from "./components/HustleCard";
import { type MarketingGuideId } from "./lib/marketing-guides";
import {
  filterSideHustles,
  toHustleCard,
  wizardPoolForMembership,
  type LibraryTag,
  SIDE_HUSTLE_CATALOG,
} from "./lib/side-hustle-catalog";
import { filterGuidesForWizardResults } from "./lib/guide-catalog-state";
import { joinUnlockNavOpts } from "./lib/join-unlock-nav";
import { hasLaunchGuide } from "./lib/launch-guides";
import {
  BETA_PHASE_NOTICE,
  BETA_TESTER_SIGNUP_NOTICE,
  betaNoticePreviewRequested,
  shouldOpenBetaNoticeAfterLogin,
  type BetaPhaseNoticeCopy,
} from "./lib/beta-phase-notice";
import {
  isScheduleSuiteDashboardHash,
} from "./lib/hustle-schedule";
import { isReferralDashboardHash } from "./lib/referral";
import { isCreditsDashboardHash } from "./lib/member-credits";
import { isBillingDashboardHash } from "./lib/member-purchases";
import { isBlueprintDashboardHash } from "./lib/member-dashboard";
import { userHasAdminRole, canSetGuideReviewedByDev } from "./lib/gysh-assignment";
import {
  ADMIN_MENU_GROUPS,
  ADMIN_USER_GUIDE_LINKS,
  adminTabById,
  type AdminTab,
  type UserGuideId,
} from "./lib/admin-nav";
import {
  AboutPage,
  AdminPortal,
  BetaCreditsGuidePage,
  BetaNdaPage,
  BetaPhasePopup,
  BetaPointsPage,
  BetaTesterDashboard,
  CalculatorSection,
  CommunityHub,
  ContactPage,
  DailyProgressReport,
  FindMineWizardSelector,
  FreeGuidesPage,
  HustleQuiz,
  JoinPage,
  KidDashboard,
  KidsCorner,
  LaunchChecklistPage,
  MarketingManual,
  MembershipSignupPage,
  NewsletterPage,
  ParentConsentPage,
  PrivacyPolicyPage,
  SeniorSideHustles,
  ShopPage,
  StepByStepGuides,
  UserPortal,
  WorkshopsHub,
} from "./lazy-app-pages";
import type { SiteMapHref } from "./lib/site-map";
import { TrainingCircles } from "./components/TrainingCircles";
import GuidesUpdatingPage from "./components/GuidesUpdatingPage";
import { SiteFooter } from "./components/SiteFooter";
import { showGuidesUpdatingScreen, showHomeGuidesLibraryTag } from "./lib/guides-online";
import type { FooterNavView } from "./components/SiteFooter";
import type { AudienceGroup, TierId } from "./lib/membership";
import { dashboardNavTone } from "./lib/membership";
import { myDashboardLocationTip } from "./lib/dashboard-nav-tip";
import { COMMUNITY_NAV_CHILDREN, isCommunityNavView } from "./lib/primary-nav";
import {
  audienceFromAgeGroup,
  isAudienceGroup,
  readSavedJoinAudience,
  saveJoinAudience,
} from "./lib/join-audience";
import {
  clearPendingMembershipCheckout,
  readPendingMembershipCheckout,
} from "./lib/pending-membership-checkout";
import {
  addAlaCarteToCart,
  alacarteCartItemCount,
  subscribeAlaCarteCart,
} from "./lib/alacarte-cart";
import { clearConsentTokenFromUrl, readConsentTokenFromUrl } from "./lib/junior-signup";
import {
  FACEBOOK_URL,
  HOME_HEADLINE_OUTCOME,
  SITE_NAME,
  SITE_PURPOSE,
  homeLibrarySpotlight,
} from "./lib/site-config";
import {
  refreshLiveGuideLibraryCounts,
  useLiveGuideLibraryCounts,
} from "./lib/guide-library-live-counts";
import { HomeForesightBlocks } from "./components/HomeForesightBlocks";
import {
  parseAppRoute,
  syncUrlToView,
  titleForView,
  viewRequiresMemberLogin,
} from "./lib/app-routes";
import { readAdminDeepLink } from "./lib/admin-deep-links";
import {
  confirmPasswordReset,
  hasActiveTabSession,
  LOGIN_BUTTON_LABEL,
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
import { canAccessAdminPortal, canAccessTestingPortal, isQaOnlyPortalUser } from "./lib/gysh-roles";
import type { BetaNdaReceipt } from "./lib/beta-tester-dashboard";
import { adminLandingTabAfterLogin } from "./lib/admin-login-landing";
import {
  fetchPartnerAgenda,
  mustPickAgendaTimes,
} from "./lib/gysh-partner-agenda";
import { attachPendingWizardToAccount, readPendingBlueprint } from "./lib/pending-blueprint";
import type { BlueprintAgeGroup } from "./lib/gysh-analytics";
import { isYouthDashboardUser, youthAgeBand } from "./lib/youth-dashboard";
import { authReadySafetyMs } from "./lib/first-load";
import { isLocalDevHost } from "./lib/d1-errors";
import { readCachedAuthUser, readSessionToken } from "./lib/session-storage";
import kevinaNavMark from "./assets/kevina-starr-logo.png";
import gyshLogo from "./assets/gysh-logo-rocket.png";
import "./App.css";

const PAGE_FALLBACK = (
  <div className="glass page-route-fallback" style={{ padding: 32, textAlign: "center" }}>
    <WaitLabel>Loading…</WaitLabel>
  </div>
);

const DUE_POPUP_LOGIN_FLAG = "gysh_due_popup_login";
const SCHEDULE_DUE_POPUP_LOGIN_FLAG = "gysh_schedule_due_popup_login";

export type AppView =
  | "dashboard"
  | "quiz"
  | "calculators"
  | "guides"
  | "checklist"
  | "community"
  | "newsletter"
  | "workshops"
  | "kids"
  | "seniors"
  | "login"
  | "user_portal"
  | "admin"
  | "about"
  | "contact"
  | "privacy"
  | "beta_nda"
  | "beta_testing"
  | "beta_credits"
  | "beta_points"
  | "join"
  | "membership_signup"
  | "shop";

/** Adult browse + quiz cards — derived from shared catalog (preserves existing ids). */

function resolveLaunchGuideId(hustleId: string): string {
  if (hasLaunchGuide(hustleId)) return hustleId;
  // Catalog hustle with generated guide body — open it on Guides (do not remap).
  if (SIDE_HUSTLE_CATALOG.some((h) => h.id === hustleId)) return hustleId;
  const rec = SIDE_HUSTLE_CATALOG.find((h) => h.id === hustleId);
  const related = rec?.relatedGuideIds?.find((id) => hasLaunchGuide(id));
  return related ?? hustleId;
}

function App() {
  const bootRoute = parseAppRoute();
  const [activeView, setActiveView] = useState<AppView>(bootRoute.view as AppView);
  const [consentToken, setConsentToken] = useState<string | null>(() => readConsentTokenFromUrl());
  /** Skip pushState when the URL change came from back/forward. */
  const skipNextUrlSync = useRef(false);
  const urlSyncReady = useRef(false);
  /** Guest hit /my-dashboard — after session restore, put them back on the portal. */
  const resumeDashboardAfterAuth = useRef(viewRequiresMemberLogin(bootRoute.view));
  const [selectedHustleId, setSelectedHustleId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [libraryTagFilter, setLibraryTagFilter] = useState<LibraryTag | "zero-start-collection" | "all">("all");
  const [libraryAudienceFilter, setLibraryAudienceFilter] = useState<"all" | "kids" | "junior" | "adult" | "senior">("adult");
  const [libraryLocationFilter, setLibraryLocationFilter] = useState<"all" | "online" | "local" | "both">("all");

  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [betaUnlockPreview, setBetaUnlockPreview] = useState<BetaNdaReceipt | null>(null);
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
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);
  const communityMenuRef = useRef<HTMLLIElement>(null);
  const [adminSessionKey, setAdminSessionKey] = useState(0);
  const [adminTab, setAdminTab] = useState<AdminTab>(() => readAdminDeepLink().tab ?? "schedule");
  /** Tina / Lyriq must submit ≥3 meeting dates before any other navigation. */
  const [meetingGateLocked, setMeetingGateLocked] = useState(false);
  const [betaNoticeOpen, setBetaNoticeOpen] = useState(false);
  const [betaNoticeCopy, setBetaNoticeCopy] =
    useState<BetaPhaseNoticeCopy>(BETA_PHASE_NOTICE);
  const [focusScheduleId, setFocusScheduleId] = useState<string | null>(null);
  const [portalInitialTab, setPortalInitialTab] = useState<
    "blueprint" | "schedule" | "referral" | "purchases" | "credits" | null
  >(() => {
    if (isScheduleSuiteDashboardHash(window.location.hash)) return "schedule";
    if (isReferralDashboardHash(window.location.hash)) return "referral";
    if (isCreditsDashboardHash(window.location.hash)) return "credits";
    if (isBillingDashboardHash(window.location.hash)) return "purchases";
    if (isBlueprintDashboardHash(window.location.hash)) return "blueprint";
    return null;
  });
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
  /** Optional: highlight/focus Upgrade–Choose for this plan on Membership. */
  const [joinFocusTier, setJoinFocusTier] = useState<TierId | null>(null);
  /** Optional: scroll Join to a-la-carte cart checkout (header Cart). */
  const [joinScrollToCart, setJoinScrollToCart] = useState(false);
  const [headerCartCount, setHeaderCartCount] = useState(0);
  const [signupTier, setSignupTier] = useState<TierId>("free");
  const [signupResumeCheckout, setSignupResumeCheckout] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  /** How It Works: open on desktop, collapsed on phones so CTAs stay above the fold. */
  const [homeHowOpen, setHomeHowOpen] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
    return !window.matchMedia("(max-width: 640px)").matches;
  });
  /** Active Side Hustle Library count for Home — fetched once per session. */
  const liveGuideCounts = useLiveGuideLibraryCounts();
  const [dashboardNavTipOpen, setDashboardNavTipOpen] = useState(false);
  const [guidesDetailId, setGuidesDetailId] = useState<string | null>(() => {
    if (bootRoute.view !== "guides" || bootRoute.guidesManualId) return null;
    try {
      return new URLSearchParams(window.location.search).get("hustle")?.trim() || null;
    } catch {
      return null;
    }
  });
  const [guidesManualId, setGuidesManualId] = useState<MarketingGuideId | null>(
    () => (bootRoute.guidesManualId as MarketingGuideId | null) ?? null,
  );
  const [findMineMode, setFindMineMode] = useState<"select" | "adult">("select");
  /** Bump after Blueprint/account signup so member UI re-renders. */
  const [memberAccessTick, setMemberAccessTick] = useState(0);
  void memberAccessTick;
  const previewingAsGuest = actAsTarget.type === "guest";
  /** Real portal login only — localStorage “free session” and team join do not count. */
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

  /** Narrow phones: persisted 110–150% zoom overflows bubbles/chips — force 100%. */
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => {
      if (mq.matches) setPageZoom(100);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(
    () =>
      subscribeAlaCarteCart((cart) => {
        setHeaderCartCount(alacarteCartItemCount(cart));
      }),
    [],
  );

  /** Live Active / Free Active guide counts from D1 — boot + refresh on login. */
  useEffect(() => {
    void refreshLiveGuideLibraryCounts();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    void refreshLiveGuideLibraryCounts({ force: true });
  }, [isLoggedIn]);

  useEffect(() => {
    if (!effectivePortalLogin) {
      setHeaderCartCount(0);
      return;
    }
    setHeaderCartCount(alacarteCartItemCount());
  }, [effectivePortalLogin]);

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

  const contentZoomStyle = (() => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
      return undefined;
    }
    if (pageZoom === 100) return undefined;
    const scale = pageZoom / 100;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    // iPhone/iPad/Safari: CSS zoom is flaky — use transform so +/- controls work.
    const preferTransformZoom =
      /iP(hone|ad|od)/i.test(ua) ||
      (/Safari/i.test(ua) && !/Chrome|Chromium|Edg|Android/i.test(ua));
    if (!preferTransformZoom) {
      return { zoom: `${pageZoom}%` } as React.CSSProperties;
    }
    return {
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      width: `${100 / scale}%`,
    } as React.CSSProperties;
  })();

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
      guidesHustleId: activeView === "guides" && !guidesManualId ? guidesDetailId : null,
      replace: !urlSyncReady.current,
    });
    urlSyncReady.current = true;
  }, [activeView, guidesManualId, guidesDetailId, consentToken, resetToken]);

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseAppRoute(window.location.pathname);
      skipNextUrlSync.current = true;
      setActiveView(parsed.view as AppView);
      setGuidesManualId((parsed.guidesManualId as MarketingGuideId | null) ?? null);
      if (parsed.view === "guides" && !parsed.guidesManualId) {
        try {
          const hustle = new URLSearchParams(window.location.search).get("hustle")?.trim() || null;
          setGuidesDetailId(hustle);
          if (hustle) setSelectedHustleId(hustle);
        } catch {
          setGuidesDetailId(null);
        }
      } else if (parsed.view !== "guides") {
        setGuidesDetailId(null);
      }
      if (parsed.view === "kids") {
        try {
          const q = new URLSearchParams(window.location.search);
          const mode = q.get("mode") === "junior" ? "junior" : "kids";
          const tabRaw = q.get("tab");
          const tab =
            tabRaw === "guides" ||
            tabRaw === "wizard" ||
            tabRaw === "jobs" ||
            tabRaw === "piggy" ||
            tabRaw === "stories" ||
            tabRaw === "join"
              ? tabRaw
              : "guides";
          setKidsEntryFocus({ mode, tab });
          setActiveView("kids");
        } catch {
          /* ignore */
        }
      }
      if (parsed.view === "seniors") {
        try {
          const tabRaw = new URLSearchParams(window.location.search).get("tab");
          if (
            tabRaw === "guides" ||
            tabRaw === "match" ||
            tabRaw === "opportunities" ||
            tabRaw === "join"
          ) {
            setSeniorsEntryTab(tabRaw);
          }
        } catch {
          /* ignore */
        }
      }
      const adminDeepLink =
        parsed.view === "admin" &&
        Boolean((window.history.state as { adminDeepLink?: boolean } | null)?.adminDeepLink);
      if (parsed.view === "user_portal" && isScheduleSuiteDashboardHash(window.location.hash)) {
        setPortalInitialTab("schedule");
      }
      if (parsed.view === "user_portal" && isReferralDashboardHash(window.location.hash)) {
        setPortalInitialTab("referral");
      }
      if (parsed.view === "user_portal" && isCreditsDashboardHash(window.location.hash)) {
        setPortalInitialTab("credits");
      }
      if (parsed.view === "user_portal" && isBillingDashboardHash(window.location.hash)) {
        setPortalInitialTab("purchases");
      }
      if (parsed.view === "user_portal" && isBlueprintDashboardHash(window.location.hash)) {
        setPortalInitialTab("blueprint");
      }
      if (parsed.view === "admin") {
        const link = readAdminDeepLink();
        if (link.tab) setAdminTab(link.tab);
      }
      setHowOpen(false);
      setHomeHowOpen(false);
      // Admin deep links scroll the focused task/test/item into view — don't jump to top.
      if (!adminDeepLink) {
        window.scrollTo(0, 0);
      }
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

  const canUseAdminPortal = isLoggedIn && canAccessAdminPortal(authUser);
  const canUseTestingPortal = isLoggedIn && canAccessTestingPortal(authUser);
  const qaOnlyPortal = isLoggedIn && isQaOnlyPortalUser(authUser);
  /** Profile Switcher is previewing a member audience (hide Admin chrome). */
  const previewingAsMember = actAsTarget.type !== "self";
  const actAsAudienceNow = actAsAudience(actAsTarget);
  /**
   * Kids/Teens member guides + wizard unlock for a real GYSH login (or act-as kids/teens).
   * Lightweight team join and a localStorage free-session marker are not membership.
   * Staff browsing as themselves stay gated.
   */
  const kidsCornerMemberAccess =
    !previewingAsGuest &&
    (actAsAudienceNow === "kids" ||
      actAsAudienceNow === "junior" ||
      (effectivePortalLogin && !canUseAdminPortal && !canUseTestingPortal));

  // Restore session: localhost persists across tabs/restarts/HMR; production is tab-scoped.
  // Local Dev: hydrate from cached user immediately so Vite remounts don't bounce to Login
  // while remote D1 /auth/me is still warming up.
  useEffect(() => {
    let cancelled = false;
    const localDev = isLocalDevHost(window.location.hostname);
    const applyUser = (user: AuthUser | null) => {
      if (cancelled || !user) return;
      setIsLoggedIn(true);
      setAuthUser(user);
    };
    if (localDev && readSessionToken()) {
      const cached = readCachedAuthUser();
      if (cached) applyUser(cached);
    }
    const safety = window.setTimeout(() => {
      if (!cancelled) setAuthReady(true);
    }, authReadySafetyMs(localDev));
    void restoreSession()
      .then((user) => {
        if (cancelled) return;
        if (user) applyUser(user);
        else if (!localDev) {
          setIsLoggedIn(false);
          setAuthUser(null);
        } else if (!readSessionToken()) {
          setIsLoggedIn(false);
          setAuthUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(safety);
    };
  }, []);

  // Mobile menu: lock page scroll so content cannot slide behind the drawer.
  useEffect(() => {
    const root = document.documentElement;
    if (!mobileMenuOpen) {
      root.classList.remove("gysh-mobile-menu-open");
      return;
    }
    root.classList.add("gysh-mobile-menu-open");
    const prevBody = document.body.style.overflow;
    const prevHtml = root.style.overflow;
    document.body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    return () => {
      root.classList.remove("gysh-mobile-menu-open");
      document.body.style.overflow = prevBody;
      root.style.overflow = prevHtml;
    };
  }, [mobileMenuOpen]);

  // Expand Admin tabs in the hamburger drawer so staff can see them without an extra tap.
  useEffect(() => {
    if (mobileMenuOpen && canUseAdminPortal && !previewingAsMember) {
      setAdminMenuOpen(true);
      return;
    }
    if (!mobileMenuOpen) {
      setAdminMenuOpen(false);
    }
  }, [mobileMenuOpen, canUseAdminPortal, previewingAsMember]);

  // Schedule Suite overdue popup on login — disabled (go straight into the app).
  useEffect(() => {
    try {
      sessionStorage.removeItem(SCHEDULE_DUE_POPUP_LOGIN_FLAG);
    } catch {
      /* ignore */
    }
  }, [authReady, isLoggedIn, authUser]);

  // Deep link /admin: Admin Studio for admins; Testing Portal for QA-only.
  useEffect(() => {
    if (!authReady) return;
    if (activeView !== "admin") return;
    if (canUseAdminPortal) return;
    if (canUseTestingPortal) {
      if (adminTab !== "testing") setAdminTab("testing");
      return;
    }
    // A slow or blipped /auth/me must not dump a still-marked tab onto Login.
    if (hasActiveTabSession()) return;
    setActiveView("login");
  }, [authReady, activeView, canUseAdminPortal, canUseTestingPortal, adminTab]);

  // Deep link /my-dashboard: members only. Guests see Sign in, never the portal.
  useEffect(() => {
    if (!viewRequiresMemberLogin(activeView)) return;
    if (effectivePortalLogin) return;
    resumeDashboardAfterAuth.current = true;
    setActiveView("login");
  }, [activeView, effectivePortalLogin]);

  useEffect(() => {
    if (!effectivePortalLogin) return;
    if (!resumeDashboardAfterAuth.current) return;
    resumeDashboardAfterAuth.current = false;
    if (activeView === "login") setActiveView("user_portal");
  }, [effectivePortalLogin, activeView]);

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
    const dest: AppView =
      viewRequiresMemberLogin(view) && !effectivePortalLogin ? "login" : view;
    setActiveView(dest);
    // Kid dashboard is opened in-place (no goTo); any nav clears the parent coach preview.
    setParentKidDashboard(null);
    setMobileMenuOpen(false);
    setCommunityMenuOpen(false);
    setAdminMenuOpen(false);
    if (dest === "guides") {
      if (opts && "launchGuideId" in opts) {
        const id = opts.launchGuideId ? String(opts.launchGuideId) : null;
        setGuidesManualId(null);
        setGuidesDetailId(id);
        if (id) setSelectedHustleId(id);
      } else {
        // Library list (home count bubble, nav, Browse Library) — never keep a stale detail open.
        setGuidesDetailId(null);
        setGuidesManualId(null);
      }
    } else {
      setGuidesDetailId(null);
      setGuidesManualId(null);
    }
    // Keep lane when opening membership signup from a plan card (Choose Starter, etc.).
    if (dest !== "join" && dest !== "membership_signup") {
      setJoinAudience(null);
    }
    setHowOpen(false);
    if (dest !== "dashboard") setHomeHowOpen(false);
    if (dest === "quiz") setFindMineMode("select");
    if (opts?.scroll !== false) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openJoin = (
    audience?: AudienceGroup | null,
    opts?: { scrollToPlans?: boolean; scrollToCart?: boolean; focusTier?: TierId | null },
  ) => {
    if (audience) {
      const next = audienceFromAgeGroup(audience);
      saveJoinAudience(next);
      setJoinAudience(next);
    } else {
      setJoinAudience(null);
    }
    const focusTier = opts?.focusTier ?? null;
    const scrollToCart = opts?.scrollToCart === true;
    const scrollToPlans =
      opts?.scrollToPlans === true || (Boolean(focusTier) && !scrollToCart);
    setJoinFocusTier(focusTier && focusTier !== "free" ? focusTier : null);
    setJoinScrollToPlans(scrollToPlans && !scrollToCart);
    setJoinScrollToCart(scrollToCart);
    goTo("join", { scroll: !scrollToPlans && !scrollToCart });
  };

  /** Membership registration + Stripe checkout for paid tiers. */
  const openMembershipSignup = (
    tier: TierId = "free",
    audience?: AudienceGroup | null,
    opts?: { resumeCheckout?: boolean },
  ) => {
    const next =
      audience != null
        ? audienceFromAgeGroup(audience)
        : joinAudience ?? readSavedJoinAudience("adult");
    saveJoinAudience(next);
    setJoinAudience(next);
    setSignupTier(tier);
    setSignupResumeCheckout(opts?.resumeCheckout === true);
    goTo("membership_signup");
  };

  const openGuidesLibrary = () => {
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
            "Get hustles ranked for 50+ / flexible schedules — best match first.",
          ],
        };
      case "guides":
        return {
          title: "How the Side Hustle Library works",
          steps: [
            "Browse every guide without logging in — titles, peeks, and membership levels are public.",
            "Register (Free or higher) to unlock guide content — including Free Guides.",
            "Higher plans unlock Starter, Pro, and Elite guides and tools.",
            "Open Adult/Senior, Kids, or Teens guides that match your stage.",
            "Follow the steps, then use the in-guide Revenue Calculator and the GYSH Match Wizard when you’re ready.",
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
      case "newsletter":
        return {
          title: "How the GYSH Weekly Newsletter works",
          steps: [
            "Starter or higher members get a Friday dual-audience issue — kids glow + adult hustle tip.",
            "Read the archive on this page; the same issue lands in your inbox.",
            "Content Factory drafts appear here after they are marked Published.",
            "Free accounts can browse titles, then upgrade to unlock the full issue.",
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
      case "privacy":
        return {
          title: "How GYSH Privacy Policy works",
          steps: [
            "Read how GYSH may collect, use, and share information.",
            "Families: review Children’s Privacy and Teen Users before a child or teen joins.",
            "Use Contact Us for privacy requests or parental requests.",
            "We update this page when our practices or legal requirements change.",
          ],
        };
      case "beta_nda":
        return {
          title: "How the GYSH Beta Tester NDA works",
          steps: [
            "Create your tester profile on membership signup.",
            "Read the NDA, type your full legal name, and check I have read and agree.",
            "GYSH stores the NDA version, timestamp, IP, and your user ID.",
            "Testing unlocks on your Beta Tester dashboard.",
          ],
        };
      case "beta_testing":
        return {
          title: "How the Beta Tester dashboard works",
          steps: [
            "Accept GYSH-BETA-NDA-v1.1 to unlock testing.",
            "Track completed tests and recorded testing time.",
            "Reward level grows as you complete eligible cases.",
            "Open the Credit Guide to see how Kid Credits are earned and spent.",
          ],
        };
      case "beta_credits":
        return {
          title: "How Beta Tester credits work",
          steps: [
            "Earn Kid Credits for Pass, Conditional Pass, or documented Fail.",
            "Priority sets the payout: P0 = 15, P1 = 10, P2 = 5, P3 = 3. Re-tests add +5.",
            "Download the PDF or Word program briefing, or open Points earned.",
            "Not Run and Blocked earn 0 — fair-play rules still apply.",
          ],
        };
      case "beta_points":
        return {
          title: "How Beta Tester points work",
          steps: [
            "Each passed or documented Fail pays the case priority.",
            "A required re-test adds five more points.",
            "Open a tester’s name to see the cases that produced the total.",
            "Download the program briefing from the Credit Guide.",
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

  const goToTestingPortal = () => {
    if (!canUseTestingPortal) {
      setActiveView("login");
      setAdminMenuOpen(false);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setAdminTab("testing");
    setActiveView("admin");
    setAdminMenuOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToAdmin = (tab: AdminTab, guide?: UserGuideId) => {
    if (qaOnlyPortal || (!canUseAdminPortal && canUseTestingPortal)) {
      goToTestingPortal();
      return;
    }
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
      case "newsletter":
        goTo("newsletter");
        break;
      case "shop":
        goTo("shop");
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
      case "user_portal":
        goTo("user_portal");
        break;
      case "about":
        goTo("about");
        break;
      case "contact":
        goTo("contact");
        break;
      case "privacy":
        goTo("privacy");
        break;
      case "beta_nda":
        goTo("beta_nda");
        break;
      case "beta_testing":
        goTo("beta_testing");
        break;
      case "beta_credits":
        goTo("beta_credits");
        break;
      case "beta_points":
        goTo("beta_points");
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
    if (!communityMenuOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = communityMenuRef.current;
      if (el && !el.contains(e.target as Node)) {
        setCommunityMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [communityMenuOpen]);

  useEffect(() => {
    if (!adminMenuOpen || mobileMenuOpen) return;
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
  }, [adminMenuOpen, mobileMenuOpen]);

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
      goTo("guides", { launchGuideId: resolveLaunchGuideId(hustleId) });
    }
  };

  const handleGoToCalculatorFromGuide = (_hustleId: string) => {
    void _hustleId;
    // Kept for guide→calculator deep links; currently unused from this surface.
  };
  void handleGoToCalculatorFromGuide;

  const handleGoToGuideFromCalculator = (hustleId: string) => {
    goTo("guides", { launchGuideId: hustleId });
  };

  const handleOpenGuidePeek = (nav: GuidePeekNav) => {
    if (nav.view === "guides") {
      goTo("guides", { launchGuideId: nav.hustleId });
      return;
    }
    if (nav.view === "kids") {
      // Hub-only fallback (legacy peeks). Prefer guide-detail nav above.
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
        setAuthUser(user ?? null);
        if (shouldOpenBetaNoticeAfterLogin(outcome)) {
          setBetaNoticeCopy(BETA_PHASE_NOTICE);
          setBetaNoticeOpen(true);
        }
        setEmailInput("");
        setPassInput("");
        setShowPassword(false);
        setMemberAccessTick((n) => n + 1);

        const pending = readPendingBlueprint();
        if (pending?.resultIds?.length) {
          void attachPendingWizardToAccount(null);
        }

        if (outcome === "admin") {
          const pendingMembership = readPendingMembershipCheckout();
          if (pendingMembership) {
            clearPendingMembershipCheckout();
            openMembershipSignup(pendingMembership.tierId, pendingMembership.audience, {
              resumeCheckout: pendingMembership.resumeCheckout,
            });
          } else {
            setAdminSessionKey((k) => k + 1);
            setAdminTab(adminLandingTabAfterLogin(user));
            setActiveView("admin");
          }
        } else if (user && canAccessTestingPortal(user)) {
          /* QA testers (no Admin role) → Testing Portal */
          const pendingMembership = readPendingMembershipCheckout();
          if (pendingMembership) {
            clearPendingMembershipCheckout();
            openMembershipSignup(pendingMembership.tierId, pendingMembership.audience, {
              resumeCheckout: pendingMembership.resumeCheckout,
            });
          } else {
            setAdminSessionKey((k) => k + 1);
            setAdminTab("testing");
            setActiveView("admin");
          }
        } else {
          /* Members: resume membership checkout if they left signup to Sign in */
          const pendingMembership = readPendingMembershipCheckout();
          if (pendingMembership) {
            clearPendingMembershipCheckout();
            openMembershipSignup(pendingMembership.tierId, pendingMembership.audience, {
              resumeCheckout: pendingMembership.resumeCheckout,
            });
          } else {
            restoreBlueprintAfterUnlock(pending?.ageGroup ?? "adult");
          }
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
    try {
      if (betaNoticePreviewRequested(window.location.search)) {
        setBetaNoticeCopy(BETA_PHASE_NOTICE);
        setBetaNoticeOpen(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthUser(null);
    setHeaderCartCount(0);
    setBetaNoticeOpen(false);
    clearActAsTarget();
    setActAsTarget({ type: "self" });
    sessionStorage.removeItem(DUE_POPUP_LOGIN_FLAG);
    goTo("dashboard");
    setLoginMode("login");
    void logout();
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

  // Filter & Search Hustles (catalog-backed library filters)
  const filteredHustles = filterSideHustles({
    audience: libraryAudienceFilter === "all" ? undefined : libraryAudienceFilter,
    search: searchQuery,
    category: filterCategory === "all" ? undefined : filterCategory,
    zeroStart: libraryTagFilter === "zero-start" || libraryTagFilter === "zero-start-collection" ? true : undefined,
    libraryTags:
      libraryTagFilter !== "all" &&
      libraryTagFilter !== "zero-start-collection" &&
      libraryTagFilter !== "zero-start"
        ? [libraryTagFilter]
        : undefined,
    locationMode: libraryLocationFilter === "all" ? undefined : libraryLocationFilter,
  })
    .filter((h) => {
      // Default dashboard still emphasizes adult+browse; when audience=adult keep adult cards.
      if (libraryAudienceFilter === "adult" || libraryAudienceFilter === "all") {
        return h.audiences.includes("adult") || libraryAudienceFilter === "all";
      }
      return true;
    })
    .map(toHustleCard);

  const quizHustles = filterGuidesForWizardResults(
    wizardPoolForMembership("adult", {
      isLoggedIn: effectivePortalLogin,
      membershipTier: authUser?.membershipTier ?? (effectivePortalLogin ? "free" : null),
      previewAsGuest: previewingAsGuest,
    }),
    liveGuideCounts.states,
  ).map(toHustleCard);

  const getHeaderTitle = () => {
    if (viewRequiresMemberLogin(activeView) && !effectivePortalLogin) {
      return "GYSH Sign In";
    }
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
        return "Side Hustle Library";
      case "checklist": return "GYSH Side Hustle Guide";
      case "community": return "GYSH Blog";
      case "newsletter": return "GYSH Weekly Newsletter";
      case "workshops": return "GYSH Workshops & Speakers";
      case "shop": return "GYSH Shop";
      case "kids": return "GYSH Kids & Teens Corner";
      case "seniors": return "GYSH Seniors Corner";
      case "about": return "About GYSH";
      case "contact": return "GYSH Contact Us";
      case "privacy": return "GYSH Privacy Policy";
      case "beta_nda": return "GYSH Beta Tester NDA";
      case "beta_testing": return "GYSH Beta Tester Dashboard";
      case "beta_credits": return "GYSH Beta Tester Credit Guide";
      case "beta_points": return "GYSH Beta Tester Points";
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
    if (viewRequiresMemberLogin(activeView) && !effectivePortalLogin) {
      return "Sign in to save bookmarks, unlock badges, and track launch milestones.";
    }
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
      case "newsletter": return "Friday dual-audience issue for members — kids glow story + adult hustle tip.";
      case "shop": return "GYSH tees, caps, and Gang merch — Ideas. Action. Income. Freedom.";
      case "kids": return "Stories, GYSH Match Wizard, ideas, savings, and guides for Kids and Teens — parents coach the journey.";
      case "seniors": return "GYSH Match Wizard and flexible Side Hustles for 50+, retirees, and second careers.";
      case "about": return "Meet Tina Marie Barham and Evelyn Irving — the partnership behind Get Your Side Hustle.";
      case "contact": return "Questions, partnerships, or workshop inquiries — we’d love to hear from you.";
      case "privacy": return "How Get Your Side Hustle collects, uses, stores, and protects your information.";
      case "beta_nda": return "Confidentiality terms for the GYSH beta testing program.";
      case "beta_testing": return "Your beta testing progress, recorded time, and reward level.";
      case "beta_credits": return "How Beta Testers earn and spend Kid Credits for testing.";
      case "beta_points": return "Live points board for Beta Testers — passes, re-tests, and totals.";
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
      <Suspense fallback={PAGE_FALLBACK}>
        <ParentConsentPage
          token={consentToken}
          onClose={() => {
            clearConsentTokenFromUrl();
            setConsentToken(null);
          }}
        />
      </Suspense>
    );
  }

  /** Audience list — full-width below hero (was beside the poster). */
  const renderHomeAudience = (titleId: string) => (
    <aside className="home-audience__inner" aria-labelledby={titleId}>
      <h2 id={titleId} className="home-audience__heading">
        <span className="home-audience__title">Who is GYSH for?</span>
      </h2>
      <p className="home-audience__note">
        Building with family or going solo — WE GOT YOU! Pick the path that matches your stage, then
        run the wizard built for you.
      </p>
      <ol className="home-audience__bubbles" aria-label="Ways to start with GYSH">
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
              <span>Flexible hustles for 50+, retirees, and second careers.</span>
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

  /** Age-lane wizards — sits beside the hero poster so “what you do” is first. */
  const renderHomePickYourPath = () => (
    <div
      className="home-match-family home-match-family--hero"
      data-testid="home-match-family"
      aria-labelledby="home-match-family-title"
    >
      <div className="home-match-family__section-head">
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
            <strong>Adult (18–49)</strong>
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
            <strong>Senior (50+)</strong>
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
            <div className="top-header-row top-header-row--primary">
              <nav className="nav-primary" aria-label="Primary">
                <ul className="nav-links nav-links--primary">
                  {canUseAdminPortal && !previewingAsMember ? (
                    <li className="nav-item-admin">
                      <div
                        ref={adminMenuRef}
                        className={`admin-nav-dropdown${adminMenuOpen ? " open" : ""}`}
                        onMouseEnter={() => setAdminMenuOpen(true)}
                        onMouseLeave={() => {
                          if (!mobileMenuOpen) setAdminMenuOpen(false);
                        }}
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
                    </li>
                  ) : null}
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
                      onClick={() => openJoin(null, { scrollToPlans: true })}
                      className={`nav-link-btn ${activeView === "join" ? "active" : ""}`}
                      data-testid="nav-memberships"
                    >
                      <Crown size={16} className="nav-icon nav-icon--memberships" aria-hidden />
                      Memberships
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goTo("shop")}
                      className={`nav-link-btn ${activeView === "shop" ? "active" : ""}`}
                      data-testid="nav-gear"
                    >
                      <ShoppingBag size={16} className="nav-icon nav-icon--shop" aria-hidden />
                      Gear
                    </button>
                  </li>
                  <li className="nav-item-signup">
                    <button
                      type="button"
                      onClick={() => openMembershipSignup("free")}
                      className={`nav-link-btn ${
                        activeView === "membership_signup" ? "active" : ""
                      }`}
                      data-testid="nav-join"
                    >
                      <UserPlus size={16} className="nav-icon nav-icon--join" aria-hidden />
                      Join Free
                    </button>
                  </li>
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
                  {isLoggedIn && canUseAdminPortal ? (
                    <li className="nav-item-profile">
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
                              {actAsTarget.type === "self"
                                ? "Admin · switch profile"
                                : `Viewing as ${actAsLabel(actAsTarget)}`}
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
                    </li>
                  ) : isLoggedIn ? (
                    <li className="nav-item-profile">
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
                    </li>
                  ) : null}
                </ul>
              </nav>

              <div className="header-actions header-actions--primary">
                {isLoggedIn ? (
                  previewingAsGuest ? (
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
                      {LOGIN_BUTTON_LABEL}
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
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => goTo("login")}
                    className={`btn btn-primary ${activeView === "login" ? "" : ""}`}
                    style={{ padding: "8px 14px", fontSize: "0.95rem", gap: "6px" }}
                    data-testid="header-login"
                  >
                    <LogIn size={14} />
                    {LOGIN_BUTTON_LABEL}
                  </button>
                )}
              </div>
            </div>

            <div className="top-header-row top-header-row--meta">
              <nav className="nav-secondary" aria-label="Audience and resources">
                <ul className="nav-links nav-links--secondary">
                  <li>
                    <button
                      type="button"
                      onClick={() => openGuidesLibrary()}
                      className={`nav-link-btn ${activeView === "guides" ? "active" : ""}`}
                      data-testid="nav-guides"
                    >
                      <BookOpen size={16} className="nav-icon nav-icon--guides" aria-hidden />
                      Side Hustle Guides
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goTo("quiz")}
                      className={`nav-link-btn ${
                        activeView === "quiz" && findMineMode !== "adult" ? "active" : ""
                      }`}
                      data-testid="nav-find-mine"
                    >
                      <Sparkles size={16} className="nav-icon nav-icon--quiz" aria-hidden />
                      Match Wizard
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={openAdultFindMine}
                      className={`nav-link-btn ${
                        activeView === "quiz" && findMineMode === "adult" ? "active" : ""
                      }`}
                      data-testid="nav-adults"
                    >
                      <Users size={16} className="nav-icon nav-icon--adults" aria-hidden />
                      Adults
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
                  <li
                    ref={communityMenuRef}
                    className={`nav-dropdown${communityMenuOpen ? " open" : ""}`}
                  >
                    <button
                      type="button"
                      className={`nav-link-btn ${isCommunityNavView(activeView) ? "active" : ""}`}
                      data-testid="nav-community"
                      aria-expanded={communityMenuOpen}
                      aria-haspopup="true"
                      onClick={() => setCommunityMenuOpen((open) => !open)}
                    >
                      <MessageSquare size={16} className="nav-icon nav-icon--community" aria-hidden />
                      Community
                      <ChevronDown size={14} className="nav-dropdown-chevron" aria-hidden />
                    </button>
                    <ul className="nav-dropdown-menu" hidden={!communityMenuOpen}>
                      {COMMUNITY_NAV_CHILDREN.map((child) => (
                        <li key={child.id}>
                          <button
                            type="button"
                            className={`nav-dropdown-item ${activeView === child.view ? "active" : ""}`}
                            data-testid={child.testId}
                            onClick={() => goTo(child.view)}
                          >
                            {child.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>

              <div className="header-actions">
                {isLoggedIn && qaOnlyPortal && !previewingAsMember ? (
                  <button
                    type="button"
                    className={`nav-link-btn${
                      activeView === "admin" && adminTab === "testing" ? " active" : ""
                    }`}
                    onClick={() => goToTestingPortal()}
                    data-testid="nav-testing-portal"
                    aria-current={
                      activeView === "admin" && adminTab === "testing" ? "page" : undefined
                    }
                  >
                    <FlaskConical size={16} className="nav-icon" aria-hidden />
                    Testing Portal
                  </button>
                ) : null}
                {effectivePortalLogin && authUser ? (
                  <button
                    type="button"
                    className={`header-cart-btn header-cart-btn--end${headerCartCount > 0 ? " has-items" : ""}`}
                    data-testid="header-cart"
                    aria-label={
                      headerCartCount > 0
                        ? `Shopping cart, ${headerCartCount} item${headerCartCount === 1 ? "" : "s"}`
                        : "Shopping cart"
                    }
                    title="A-la-carte cart & checkout"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openJoin(null, { scrollToCart: true });
                    }}
                  >
                    <ShoppingCart size={18} aria-hidden />
                    <span className="header-cart-btn__label">Cart</span>
                    {headerCartCount > 0 ? (
                      <span className="header-cart-btn__badge" data-testid="header-cart-count">
                        {headerCartCount}
                      </span>
                    ) : null}
                  </button>
                ) : null}
                <div
                  className="page-zoom-controls page-zoom-controls--icon"
                  role="group"
                  aria-label="Page zoom"
                >
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
                  <span
                    className="page-zoom-value sr-only"
                    data-testid="page-zoom-value"
                    aria-live="polite"
                  >
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
        {dashboardNavTipOpen && effectivePortalLogin ? (
          <div className="dashboard-nav-tip" data-testid="dashboard-nav-tip" role="status">
            <p>{myDashboardLocationTip()}</p>
            <button
              type="button"
              className="btn btn-outline dashboard-nav-tip__dismiss"
              onClick={() => setDashboardNavTipOpen(false)}
              data-testid="dashboard-nav-tip-dismiss"
            >
              Got it
            </button>
          </div>
        ) : null}
        {activeView !== "dashboard" && (
          <>
            <div
              className={`header-row header-row--how${
                activeView === "guides" ? " header-row--guides" : ""
              }${activeView === "kids" ? " header-row--kids" : ""}${
                activeView === "seniors" ? " header-row--seniors" : ""
              }${activeView === "quiz" ? " header-row--quiz" : ""}${activeView === "about" ? " header-row--about" : ""}`}
            >
              <div className="header-title-block header-title-block--compact">
                <div className="header-title-top">
                  <h1 data-testid="page-title">
                    {getHeaderTitle()}
                    {(activeView === "join" || activeView === "membership_signup") && (
                      <span className="header-title-aside">(FREE PLANS AVAILABLE)</span>
                    )}
                    {activeView === "guides" && guidesDetailId ? (
                      <button
                        type="button"
                        className="btn btn-outline header-guides-back-btn header-guides-back-btn--icon"
                        onClick={() => setGuidesDetailId(null)}
                        data-testid="header-back-to-guides"
                        aria-label="Back to all guides"
                        title="Back to all guides"
                      >
                        ←
                      </button>
                    ) : null}
                    {isLoggedIn &&
                    authUser &&
                    (authUser.role === "beta" || (authUser.roles ?? []).includes("beta")) ? (
                      <button
                        type="button"
                        className={`header-title-dashboard-badge header-title-dashboard-badge--compact${
                          activeView === "beta_testing" ? " is-active" : ""
                        }`}
                        onClick={() => goTo("beta_testing")}
                        data-testid="header-beta-testing"
                        aria-current={activeView === "beta_testing" ? "page" : undefined}
                      >
                        <span>Beta Testing</span>
                      </button>
                    ) : null}
                  </h1>
                  {activeView === "admin" && adminTab !== "daily-progress" && (
                    <Suspense fallback={null}>
                      <DailyProgressReport onOpen={() => goToAdmin("daily-progress")} />
                    </Suspense>
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
                  {effectivePortalLogin ? (
                    <>
                      <HeaderReferralBadge />
                      <button
                        type="button"
                        className={`header-title-dashboard-badge header-title-dashboard-badge--compact nav-dashboard-btn${
                          activeView === "user_portal" ? " is-active" : ""
                        }`}
                        data-tier={dashboardNavTone(authUser?.membershipTier)}
                        onClick={() => goTo("user_portal")}
                        data-testid="page-focus-dashboard"
                        aria-current={activeView === "user_portal" ? "page" : undefined}
                      >
                        <LayoutDashboard size={14} aria-hidden />
                        <span>My Dashboard</span>
                      </button>
                    </>
                  ) : null}
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

        {/* Home is eager — keep it out of Suspense so lazy routes can't flash Loading… */}
        {activeView === "dashboard" && (
          <div className="dashboard-home">
            {(() => {
              const libraryCopy = homeLibrarySpotlight(
                liveGuideCounts.totalActive,
                liveGuideCounts.freeActive,
              );
              return (
            <header className="home-page-header" data-testid="home-page-header">
              <div className="home-page-header__top">
                <h1 className="home-page-header__title" data-testid="page-title">
                  <span className="home-page-header__brand-block">
                    <em className="home-page-header__brand">Get Your Side Hustle</em>
                    {showHomeGuidesLibraryTag() ? (
                      <button
                        type="button"
                        className="home-library-count home-library-count--blink"
                        onClick={() => openGuidesLibrary()}
                        data-testid="home-library-spotlight"
                        aria-label={libraryCopy.cta}
                        title={libraryCopy.body}
                      >
                        <BookOpen size={14} aria-hidden />
                        <span data-testid="home-library-count-label">{libraryCopy.inlineLabel}</span>
                      </button>
                    ) : null}
                  </span>
                  <span className="home-page-header__title-actions">
                    <button
                      type="button"
                      className="btn btn-join-green home-library-spotlight__cta"
                      onClick={() => goTo("quiz")}
                      data-testid="home-match-wizard-cta"
                    >
                      <Sparkles size={16} aria-hidden />
                      {libraryCopy.wizardCta}
                    </button>
                    <button
                      type="button"
                      className="btn btn-join-green home-library-spotlight__cta"
                      onClick={() => openGuidesLibrary()}
                      data-testid="home-library-spotlight-cta"
                    >
                      <BookOpen size={16} aria-hidden />
                      {libraryCopy.cta}
                    </button>
                  </span>
                </h1>
                <div className="home-page-header__actions">
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
                  {effectivePortalLogin ? (
                    <span className="header-title-badges">
                      <HeaderReferralBadge />
                      <button
                        type="button"
                        className="header-title-dashboard-badge header-title-dashboard-badge--compact nav-dashboard-btn"
                        data-tier={dashboardNavTone(authUser?.membershipTier)}
                        onClick={() => goTo("user_portal")}
                        data-testid="page-focus-dashboard"
                      >
                        <LayoutDashboard size={14} aria-hidden />
                        <span>My Dashboard</span>
                      </button>
                    </span>
                  ) : null}
                </div>
              </div>
              <div
                id="home-how-lead"
                className={`home-page-header__lead${homeHowOpen ? " is-open" : ""}`}
                data-testid="home-how-panel"
              >
                <p className="home-page-header__headline" data-testid="home-headline-outcome">
                  {HOME_HEADLINE_OUTCOME}
                </p>
                <p className="home-page-header__purpose" data-testid="home-site-purpose">
                  {SITE_PURPOSE}
                </p>
                <p className="home-page-header__lead-body">
                  Each wizard asks age-appropriate questions so matches feel doable—not generic. Parents become{" "}
                  <strong>GYSH Coaches</strong> for kids and teens: cheer, set boundaries, and help turn ideas into
                  safe first wins. Parental consent required through age 12 — not required for ages 13+.
                </p>
              </div>
            </header>
              );
            })()}

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
                  <div className="home-promo-hero__path--desktop">
                    {renderHomePickYourPath()}
                  </div>
                </div>
              </div>
            </section>

            <section
              className="glass home-audience"
              data-testid="home-audience"
              aria-labelledby="home-audience-title"
            >
              {renderHomeAudience("home-audience-title")}
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

            <div
              className="hustle-filter-bar hustle-filter-bar--library"
              aria-label="Library filters"
              style={{ marginTop: 8 }}
            >
              <div className="hustle-filter-bar__filters">
                {(
                  [
                    ["zero-start-collection", "No Money? Start Here"],
                    ["zero-start", "$0 Start"],
                    ["ai-powered", "AI-Powered"],
                    ["fastest-dollar", "Fastest $"],
                    ["no-experience", "No Experience"],
                    ["weekend", "Weekend"],
                    ["after-work", "After Work"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      setLibraryTagFilter((prev) => (prev === id ? "all" : id))
                    }
                    className={`glow-badge hustle-filter-badge${libraryTagFilter === id ? " hustle-filter-badge--active purple" : ""}`}
                    aria-pressed={libraryTagFilter === id}
                  >
                    {label}
                  </button>
                ))}
                {(
                  [
                    ["adult", "Adults"],
                    ["junior", "Teens"],
                    ["kids", "Kids"],
                    ["senior", "Seniors"],
                    ["all", "All Ages"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={`aud-${id}`}
                    type="button"
                    onClick={() => setLibraryAudienceFilter(id)}
                    className={`glow-badge hustle-filter-badge${libraryAudienceFilter === id ? " hustle-filter-badge--active purple" : ""}`}
                    aria-pressed={libraryAudienceFilter === id}
                  >
                    {label}
                  </button>
                ))}
                {(
                  [
                    ["all", "Any Place"],
                    ["online", "Online"],
                    ["local", "Local"],
                    ["both", "Both"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={`loc-${id}`}
                    type="button"
                    onClick={() => setLibraryLocationFilter(id)}
                    className={`glow-badge hustle-filter-badge${libraryLocationFilter === id ? " hustle-filter-badge--active purple" : ""}`}
                    aria-pressed={libraryLocationFilter === id}
                  >
                    {label}
                  </button>
                ))}
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
              <div className="glass empty-state-panel" style={{ textAlign: "center", borderRadius: "16px" }}>
                <p style={{ color: "var(--text-primary)", marginBottom: "16px" }}>No side hustles match your search criteria.</p>
                <button onClick={() => { setSearchQuery(""); setFilterCategory("all"); setLibraryTagFilter("all"); setLibraryAudienceFilter("adult"); setLibraryLocationFilter("all"); }} className="btn btn-outline">
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

        <Suspense fallback={PAGE_FALLBACK}>
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
                hustles={quizHustles}
                catalogStates={liveGuideCounts.states}
                onSelectAction={handleSelectHustleAction}
                isLoggedIn={effectivePortalLogin}
                previewAsGuest={previewingAsGuest}
                onUnlockBlueprint={() => openJoin("adult")}
              />
            )}
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

        {activeView === "guides" &&
          (showGuidesUpdatingScreen({
            isAdmin: canUseAdminPortal,
            isQa: canUseTestingPortal,
            previewingAsMember,
          }) ? (
            <GuidesUpdatingPage
              onBrowseMemberships={() => openJoin(null, { scrollToPlans: true })}
            />
          ) : guidesManualId ? (
              <MarketingManual
                guideId={guidesManualId}
                onBack={openGuidesLibrary}
                isLoggedIn={effectivePortalLogin}
                onGoToLogin={() => goTo("login")}
                onGoToDashboard={() => goTo("user_portal")}
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
          ) : guidesDetailId ? (
            <StepByStepGuides
              selectedHustleId={guidesDetailId}
              isLoggedIn={effectivePortalLogin}
              membershipTier={
                authUser?.membershipTier ?? (effectivePortalLogin ? "free" : null)
              }
              isAdmin={canUseAdminPortal && !previewingAsMember}
              memberName={authUser?.name ?? ""}
              memberUserId={authUser?.id ?? ""}
              canReviewGuides={
                canAccessTestingPortal(authUser) && !previewingAsMember
              }
              canSetReviewedByDev={
                canSetGuideReviewedByDev(authUser) && !previewingAsMember
              }
              onGoToJoin={(focusTier?: TierId) =>
                openJoin("adult", joinUnlockNavOpts(focusTier))
              }
              onGoToLogin={() => goTo("login")}
            />
          ) : (
            <FreeGuidesPage
              isLoggedIn={effectivePortalLogin}
              membershipTier={
                authUser?.membershipTier ?? (effectivePortalLogin ? "free" : null)
              }
              isAdmin={canUseAdminPortal && !previewingAsMember}
              canReviewGuides={
                canAccessTestingPortal(authUser) && !previewingAsMember
              }
              onGoToJoin={(audience: AudienceGroup, focusTier?: TierId) =>
                openJoin(audience ?? "adult", joinUnlockNavOpts(focusTier))
              }
              onGoToLogin={() => goTo("login")}
              onOpenAdultGuide={(id: string) => {
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
          ))}

        {activeView === "checklist" && (
          <LaunchChecklistPage
            isLoggedIn={effectivePortalLogin}
            onGoToJoin={() => openJoin("adult", { scrollToPlans: true })}
            onGoToLogin={() => goTo("login")}
            onOpenGuide={handleOpenGuidePeek}
          />
        )}

        {activeView === "workshops" && (
          <WorkshopsHub
            onAddWorkshopSeat={() => {
              addAlaCarteToCart("workshop-general");
              if (!effectivePortalLogin) goTo("login");
              else openJoin(null, { scrollToCart: true });
            }}
          />
        )}

        {activeView === "community" && (
          <CommunityHub
            isLoggedIn={effectivePortalLogin}
            isAdmin={canAccessAdminPortal(authUser)}
            membershipTier={
              authUser?.membershipTier === "starter" ||
              authUser?.membershipTier === "pro" ||
              authUser?.membershipTier === "elite" ||
              authUser?.membershipTier === "free"
                ? authUser.membershipTier
                : null
            }
            onLogin={() => goTo("login")}
            onJoin={() => openJoin(null, { scrollToPlans: true })}
          />
        )}

        {activeView === "newsletter" && (
          <NewsletterPage
            isLoggedIn={effectivePortalLogin}
            isAdmin={canAccessAdminPortal(authUser)}
            membershipTier={
              authUser?.membershipTier === "starter" ||
              authUser?.membershipTier === "pro" ||
              authUser?.membershipTier === "elite" ||
              authUser?.membershipTier === "free"
                ? authUser.membershipTier
                : null
            }
            onLogin={() => goTo("login")}
            onJoin={() => openJoin(null, { scrollToPlans: true })}
          />
        )}

        {activeView === "shop" && <ShopPage onContact={() => goTo("contact")} />}

        {activeView === "kids" && (
          <KidsCorner
            isLoggedIn={kidsCornerMemberAccess}
            hasAccountLogin={kidsCornerMemberAccess}
            previewAsGuest={previewingAsGuest}
            membershipTier={
              authUser?.membershipTier ?? (kidsCornerMemberAccess ? "free" : null)
            }
            onGoToJoin={(audience: AudienceGroup, focusTier?: TierId) =>
              openJoin(audience, joinUnlockNavOpts(focusTier))
            }
            onOpenDashboard={
              isLoggedIn && !previewingAsGuest ? () => goTo("user_portal") : undefined
            }
            onOpenGuidesLibrary={openGuidesLibrary}
            onOpenSeniors={() => openSeniors("guides")}
            entryFocus={kidsEntryFocus}
          />
        )}

        {activeView === "seniors" && (
          <SeniorSideHustles
            isLoggedIn={
              !previewingAsGuest &&
              (actAsAudienceNow === "senior" ||
                (effectivePortalLogin && !canUseAdminPortal))
            }
            previewAsGuest={previewingAsGuest}
            membershipTier={
              authUser?.membershipTier ??
              (!previewingAsGuest &&
              (actAsAudienceNow === "senior" ||
                (effectivePortalLogin && !canUseAdminPortal))
                ? "free"
                : null)
            }
            onGoToJoin={(focusTier?: TierId) =>
              openJoin("senior", joinUnlockNavOpts(focusTier))
            }
            onOpenGuides={openGuidesLibrary}
            onOpenLaunchGuide={(launchGuideId: string) => goTo("guides", { launchGuideId })}
            entryTab={seniorsEntryTab}
          />
        )}

        {/* View: User / Admin Login form */}
        {(activeView === "login" ||
          (viewRequiresMemberLogin(activeView) && !effectivePortalLogin)) && (
          <div className="glass login-page-shell" data-testid="login-page">
            <div className="login-page-shell__inner">
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
                      {loginBusy ? <WaitLabel>Logging in…</WaitLabel> : LOGIN_BUTTON_LABEL}
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

        {activeView === "privacy" && <PrivacyPolicyPage onContact={() => goTo("contact")} />}

        {activeView === "beta_nda" && (
          <BetaNdaPage onContact={() => goTo("contact")} onJoin={() => openMembershipSignup("free")} />
        )}

        {activeView === "beta_credits" && (
          <BetaCreditsGuidePage
            onOpenDashboard={() => goTo("beta_testing")}
            onOpenNda={() => goTo("beta_nda")}
            onOpenJoin={() => goTo("join")}
            onOpenPoints={() => goTo("beta_points")}
          />
        )}

        {activeView === "beta_points" && (
          <BetaPointsPage onOpenProgram={() => goTo("beta_credits")} />
        )}

        {activeView === "join" && (
          <JoinPage
            key={joinAudience ? `join-${joinAudience}` : "join-saved"}
            onLogin={() => goTo("login")}
            onSignup={(tier: TierId, audience: AudienceGroup | null) =>
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
            focusTier={joinFocusTier}
            onScrolledToPlans={() => {
              setJoinScrollToPlans(false);
              setJoinFocusTier(null);
            }}
            scrollToCart={joinScrollToCart}
            onScrolledToCart={() => setJoinScrollToCart(false)}
            isLoggedIn={effectivePortalLogin && Boolean(authUser)}
            currentTier={
              authUser?.membershipTier === "starter" ||
              authUser?.membershipTier === "pro" ||
              authUser?.membershipTier === "elite" ||
              authUser?.membershipTier === "free"
                ? authUser.membershipTier
                : "free"
            }
            checkoutEmail={authUser?.email ?? null}
            onOpenScheduleSuite={() => {
              setPortalInitialTab("schedule");
              goTo("user_portal");
            }}
            onOpenBilling={() => {
              setPortalInitialTab("purchases");
              goTo("user_portal");
            }}
            onOpenCredits={() => {
              setPortalInitialTab("credits");
              goTo("user_portal");
            }}
            onOpenDashboard={() => {
              setPortalInitialTab("blueprint");
              goTo("user_portal");
            }}
            onOpenBlueprints={() => {
              setPortalInitialTab("blueprint");
              goTo("user_portal");
            }}
            onOpenBetaNda={() => goTo("beta_nda")}
            onBetaTesterRegistered={() => {
              setBetaNoticeCopy(BETA_TESTER_SIGNUP_NOTICE);
              setBetaNoticeOpen(true);
            }}
            onBetaTestingUnlocked={(receipt: BetaNdaReceipt) => {
              setBetaUnlockPreview(receipt);
              goTo("beta_testing");
            }}
            onBlueprintUnlocked={(ageGroup: BlueprintAgeGroup, user: AuthUser | null) => {
              if (user) {
                setIsLoggedIn(true);
                setAuthUser(user);
              }
              setMemberAccessTick((n) => n + 1);
              restoreBlueprintAfterUnlock(ageGroup);
            }}
          />
        )}

        {activeView === "membership_signup" && (
          <MembershipSignupPage
            key={`signup-${joinAudience ?? "adult"}-${signupTier}-${signupResumeCheckout ? "resume" : "new"}-${isLoggedIn ? "in" : "out"}`}
            initialAudience={joinAudience ?? readSavedJoinAudience("adult")}
            initialTier={signupTier}
            resumeCheckout={signupResumeCheckout}
            loggedInEmail={authUser?.email ?? null}
            isLoggedIn={isLoggedIn && Boolean(authUser)}
            isAdmin={canUseAdminPortal && !previewingAsMember}
            currentTier={
              authUser?.membershipTier === "starter" ||
              authUser?.membershipTier === "pro" ||
              authUser?.membershipTier === "elite" ||
              authUser?.membershipTier === "free"
                ? authUser.membershipTier
                : null
            }
            onProfileUpdated={(user: AuthUser) => {
              setAuthUser(user);
              setIsLoggedIn(true);
              setMemberAccessTick((n) => n + 1);
            }}
            onShowDashboardTip={() => setDashboardNavTipOpen(true)}
            onBackToPlans={() => {
              setSignupResumeCheckout(false);
              openJoin(joinAudience);
            }}
            onGoToLogin={() => goTo("login")}
            onOpenFreeGuides={() => {
              setGuidesDetailId(null);
              goTo("guides");
            }}
            onOpenBetaNda={() => goTo("beta_nda")}
            onBetaTesterRegistered={() => {
              setBetaNoticeCopy(BETA_TESTER_SIGNUP_NOTICE);
              setBetaNoticeOpen(true);
            }}
            onBetaTestingUnlocked={(receipt: BetaNdaReceipt) => {
              setBetaUnlockPreview(receipt);
              goTo("beta_testing");
            }}
          />
        )}

        {activeView === "beta_testing" && (
          <BetaTesterDashboard
            preview={betaUnlockPreview}
            memberName={authUser?.name ?? betaUnlockPreview?.legalName ?? ""}
            memberEmail={authUser?.email ?? ""}
            onOpenNda={() => goTo("beta_nda")}
            onOpenCredits={() => goTo("beta_credits")}
            onOpenPoints={() => goTo("beta_points")}
            onJoin={() => openMembershipSignup("free")}
          />
        )}

        {activeView === "user_portal" &&
          effectivePortalLogin &&
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
              onOpenCorner={(tab?: "wizard" | "piggy" | "guides" | "jobs") =>
                openKidsCorner({
                  mode: youthAgeBand(authUser),
                  tab: tab ?? "wizard",
                })
              }
              onOpenGuide={(ageGroup: "kids" | "junior", hustleId?: string) => {
                if (hustleId) {
                  goTo("guides", { launchGuideId: hustleId });
                  return;
                }
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
              onOpenCorner={(tab?: "wizard" | "piggy" | "guides" | "jobs") =>
                openKidsCorner({
                  mode: parentKidDashboard.ageBand,
                  tab: tab ?? "wizard",
                })
              }
              onOpenGuide={(ageGroup: "kids" | "junior", hustleId?: string) => {
                if (hustleId) {
                  goTo("guides", { launchGuideId: hustleId });
                  return;
                }
                openKidsCorner({
                  mode: ageGroup === "junior" ? "junior" : "kids",
                  tab: "guides",
                });
              }}
            />
          ) : (
            <UserPortal
              memberName={authUser?.name}
              membershipTier={authUser?.membershipTier}
              isAdmin={userHasAdminRole(authUser)}
              initialPortalTab={portalInitialTab ?? undefined}
              focusScheduleId={focusScheduleId}
              onFocusScheduleConsumed={() => {
                setFocusScheduleId(null);
                setPortalInitialTab(null);
              }}
              onOpenMatchWizard={() => {
                setFindMineMode("select");
                goTo("quiz");
              }}
              onOpenJoin={() => openJoin("adult", { scrollToPlans: true })}
              onMembershipChanged={(tier: string) => {
                setAuthUser((prev) => (prev ? { ...prev, membershipTier: tier } : prev));
              }}
              onAccountDeactivated={() => {
                handleLogout();
              }}
              onOpenKidDashboard={(kid: {
                id: string;
                displayName: string;
                ageBand: "kids" | "junior";
              }) => {
                setParentKidDashboard(kid);
              }}
              onOpenGuide={(
                _ageGroup: "kids" | "junior" | "senior" | "adult",
                hustleId: string,
              ) => {
                // Blueprint "Guide" always opens the actual guide detail (membership-gated there).
                goTo("guides", { launchGuideId: hustleId });
              }}
            />
          ))}

        </Suspense>

        <Suspense fallback={null}>
        {betaNoticeOpen ? (
          <BetaPhasePopup
            open={betaNoticeOpen}
            notice={betaNoticeCopy}
            onClose={() => setBetaNoticeOpen(false)}
          />
        ) : null}
        </Suspense>

        {activeView === "admin" &&
          (!authReady || (hasActiveTabSession() && !canUseAdminPortal && !canUseTestingPortal)) &&
          PAGE_FALLBACK}

        {activeView === "admin" && authReady && (canUseAdminPortal || canUseTestingPortal) && (
          <Suspense fallback={PAGE_FALLBACK}>
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
