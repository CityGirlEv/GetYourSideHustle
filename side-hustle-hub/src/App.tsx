import { useEffect, useRef, useState } from "react";
import { 
  MessageSquare, 
  Sparkles,
  Search,
  Flame,
  User,
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
  BookOpen,
  Home,
  Minus,
  Plus,
} from "lucide-react";
import { FacebookIcon } from "./components/FacebookIcon";
import { HustleCard } from "./components/HustleCard";
import type { Hustle } from "./components/HustleCard";
import { CalculatorSection } from "./components/CalculatorSection";
import { HustleQuiz } from "./components/HustleQuiz";
import { FindMineWizardSelector } from "./components/FindMineWizardSelector";
import { StepByStepGuides } from "./components/StepByStepGuides";
import { FreeGuidesPage } from "./components/FreeGuidesPage";
import { MarketingManual } from "./components/MarketingManual";
import { CommunityHub } from "./components/CommunityHub";
import {
  MARKETING_GUIDE_MENU,
  type MarketingGuideId,
} from "./lib/marketing-guides";
import { KidsCorner } from "./components/KidsCorner";
import { SeniorSideHustles } from "./components/SeniorSideHustles";
import { UserPortal } from "./components/UserPortal";
import {
  AdminPortal,
  ADMIN_MENU_GROUPS,
  ADMIN_USER_GUIDE_LINKS,
  adminTabById,
  type AdminTab,
} from "./components/AdminPortal";
import type { UserGuideId } from "./components/admin/UserGuidesHub";
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
import { FACEBOOK_URL, SITE_NAME, SITE_PURPOSE } from "./lib/site-config";
import {
  confirmPasswordReset,
  login,
  logout,
  requestPasswordReset,
  type AuthUser,
} from "./lib/auth";
import { clearResetTokenFromUrl, readResetTokenFromUrl } from "./lib/password-reset-url";
import type { GuidePeekNav } from "./lib/launch-guide-peeks";
import {
  ACT_AS_AUDIENCE_OPTIONS,
  actAsAudience,
  actAsLabel,
  clearActAsTarget,
  readActAsTarget,
  toActAsUserTarget,
  writeActAsTarget,
  type ActAsTarget,
} from "./lib/admin-act-as";
import { fetchUsers, type GyshUser } from "./lib/gysh-roles";
import { hasFreeMemberSession } from "./lib/free-member-session";
import { readPendingBlueprint } from "./lib/pending-blueprint";
import type { BlueprintAgeGroup } from "./lib/gysh-analytics";
import kevinaNavMark from "./assets/kevina-starr-logo.png";
import gyshHomeHero from "./assets/gysh-home-hero.png";
import gyshLogo from "./assets/gysh-logo-rocket.png";
import "./App.css";

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
    id: "affiliate",
    name: "Affiliate Marketing",
    description: "Earn passive referral commissions by creating helpful reviews and tutorials promoting other brands' products.",
    startupCost: "Less than $100",
    timeReq: "5 - 15 hrs/week",
    difficulty: "Medium",
    potentialIncome: "$100 - $15,000/mo",
    type: "Passive",
    gradient: "emerald",
    category: "Digital",
    iconName: "affiliate",
    details: [
      "Focuses heavily on search SEO and value-first content hubs",
      "Best with recurring software programs (SaaS affiliate fees)",
      "Slow launch but creates long-term recurring profit"
    ]
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
      "Low overhead: Midjourney/Canva Pro + a clean delivery folder",
      "Productize kits (logo pack, launch creatives, 30-day social set)",
      "Pairs perfectly with website lead-finder outreach"
    ]
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
    description: "Write, publish, and market books (print + ebook + audiobook) — Tina's expertise lane, from manuscript to KDP/IngramSpark and launch funnels.",
    startupCost: "$100 - $1,000",
    timeReq: "10 - 20 hrs/week",
    difficulty: "Medium",
    potentialIncome: "$200 - $8,000/mo",
    type: "Active / Royalty",
    gradient: "amber",
    category: "Publishing",
    iconName: "book-publishing",
    details: [
      "KDP + wide distribution (IngramSpark) for print and ebook reach",
      "Royalties stack while you write the next title",
      "Pairs with Kids Corner / Kevina Starr storytelling brand"
    ]
  }
];

function App() {
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [consentToken, setConsentToken] = useState<string | null>(() => readConsentTokenFromUrl());
  const [selectedHustleId, setSelectedHustleId] = useState<string>("airbnb");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "admin">("user");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [loginError, setLoginError] = useState("");
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
  const [adminTab, setAdminTab] = useState<AdminTab>("schedule");
  const [adminUserGuide, setAdminUserGuide] = useState<UserGuideId>("master");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const [guidesMenuOpen, setGuidesMenuOpen] = useState(false);
  const guidesMenuRef = useRef<HTMLDivElement>(null);
  const [actAsTarget, setActAsTarget] = useState<ActAsTarget>(() => readActAsTarget());
  const [actAsMenuOpen, setActAsMenuOpen] = useState(false);
  const actAsMenuRef = useRef<HTMLDivElement>(null);
  const [profileUsers, setProfileUsers] = useState<GyshUser[]>([]);
  const [kidsEntryFocus, setKidsEntryFocus] = useState<{
    mode: "kids" | "junior";
    tab: "guides" | "wizard";
  } | null>(null);
  const [seniorsEntryTab, setSeniorsEntryTab] = useState<"guides" | null>(null);
  const [joinAudience, setJoinAudience] = useState<AudienceGroup | null>(null);
  const [signupTier, setSignupTier] = useState<TierId>("free");
  const [howOpen, setHowOpen] = useState(false);
  const [guidesDetailId, setGuidesDetailId] = useState<string | null>(null);
  const [guidesManualId, setGuidesManualId] = useState<MarketingGuideId | null>(null);
  const [findMineMode, setFindMineMode] = useState<"select" | "adult">("select");
  /** Bump when free Blueprint signup succeeds so member access re-reads storage. */
  const [memberAccessTick, setMemberAccessTick] = useState(0);
  void memberAccessTick;
  /** Portal login OR free Blueprint member session */
  const hasMemberAccess = isLoggedIn || hasFreeMemberSession();
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
    document.documentElement.style.zoom = `${pageZoom}%`;
    try {
      localStorage.setItem("gysh-page-zoom", String(pageZoom));
    } catch {
      /* ignore */
    }
    return () => {
      document.documentElement.style.zoom = "";
    };
  }, [pageZoom]);

  const goTo = (view: AppView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    setAdminMenuOpen(false);
    setGuidesMenuOpen(false);
    if (view !== "guides") {
      setGuidesDetailId(null);
      setGuidesManualId(null);
    }
    if (view !== "join") {
      setJoinAudience(null);
    }
    setHowOpen(false);
    if (view === "quiz") setFindMineMode("select");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openJoin = (audience?: AudienceGroup | null) => {
    if (audience) {
      const next = audienceFromAgeGroup(audience);
      saveJoinAudience(next);
      setJoinAudience(next);
    } else {
      setJoinAudience(null);
    }
    goTo("join");
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
    setGuidesMenuOpen(false);
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
            "Parents become GYSH Coaches for kids (parental consent required through age 12) and stay coach-friendly for teens.",
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
            "Parents act as GYSH Coaches — consent is required through age 12; keep a parent nearby for safety.",
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

  const openKidsCorner = (entry?: { mode: "kids" | "junior"; tab: "guides" | "wizard" } | null) => {
    setKidsEntryFocus(entry ?? null);
    goTo("kids");
  };

  const openSeniors = (entryTab?: "guides" | null) => {
    setSeniorsEntryTab(entryTab ?? null);
    goTo("seniors");
  };

  const goToAdmin = (tab: AdminTab, guide?: UserGuideId) => {
    setAdminTab(tab);
    if (guide) setAdminUserGuide(guide);
    setActiveView("admin");
    setAdminMenuOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const restoreBlueprintAfterUnlock = (ageGroup: BlueprintAgeGroup) => {
    if (ageGroup === "adult") {
      openAdultFindMine();
      return;
    }
    if (ageGroup === "kids") {
      openKidsCorner({ mode: "kids", tab: "wizard" });
      return;
    }
    if (ageGroup === "junior") {
      openKidsCorner({ mode: "junior", tab: "wizard" });
      return;
    }
    openSeniors(null);
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
    if (!guidesMenuOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = guidesMenuRef.current;
      if (el && !el.contains(e.target as Node)) {
        setGuidesMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [guidesMenuOpen]);

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

  useEffect(() => {
    if (!isLoggedIn || userRole !== "admin") {
      setProfileUsers([]);
      return;
    }
    let cancelled = false;
    void fetchUsers()
      .then((users) => {
        if (!cancelled) {
          setProfileUsers(users.filter((u) => u.status === "active"));
        }
      })
      .catch(() => {
        if (!cancelled) setProfileUsers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, userRole, adminSessionKey]);

  const handleFooterNav = (view: FooterNavView) => {
    goTo(view);
  };

  const handleSelectHustleAction = (hustleId: string, actionType: "calculator" | "guide") => {
    setSelectedHustleId(hustleId);
    if (actionType === "calculator") {
      setActiveView("calculators");
    } else {
      setGuidesDetailId(hustleId);
      setActiveView("guides");
    }
  };

  const handleGoToCalculatorFromGuide = (hustleId: string) => {
    setSelectedHustleId(hustleId);
    setActiveView("calculators");
  };

  const handleGoToGuideFromCalculator = (hustleId: string) => {
    setSelectedHustleId(hustleId);
    setGuidesDetailId(hustleId);
    setActiveView("guides");
  };

  const handleOpenGuidePeek = (nav: GuidePeekNav) => {
    if (nav.view === "guides") {
      setSelectedHustleId(nav.hustleId);
      setGuidesDetailId(nav.hustleId);
      goTo("guides");
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
    setLoginError("");

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
        void import("./lib/blueprints-api").then(({ claimBlueprint, saveBlueprintToAccount }) =>
          claimBlueprint(pending.claimToken!)
            .catch(() =>
              saveBlueprintToAccount({
                ageGroup: pending.ageGroup,
                answers: pending.answers,
                resultIds: pending.resultIds,
                resultPcts: pending.resultPcts,
                claimToken: pending.claimToken,
              }),
            )
            .finally(() => {
              /* local restore still runs below */
            }),
        );
      }

      if (pending) {
        restoreBlueprintAfterUnlock(pending.ageGroup);
      } else if (outcome === "admin") {
        sessionStorage.setItem(DUE_POPUP_LOGIN_FLAG, "1");
        setAdminSessionKey((k) => k + 1);
        setAdminTab("schedule");
        setActiveView("admin");
      } else {
        setActiveView("user_portal");
      }
    } else if (outcome === "unavailable") {
      setLoginError(error || "Database unavailable. Try again after deploy/bindings are fixed.");
    } else {
      setLoginError(error || "Invalid email or password.");
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
      if (params.get("next") !== "join") return;
      const audienceParam = params.get("audience");
      if (isAudienceGroup(audienceParam)) {
        openJoin(audienceParam);
      } else {
        openJoin();
      }
      params.delete("next");
      params.delete("audience");
      params.delete("from");
      const next = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`);
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
    setActiveView("dashboard");
    setLoginMode("login");
  };

  // Filter Categories
  const categories = [
    "all",
    "E-Commerce",
    "Real Estate",
    "Digital",
    "Creative",
    "Publishing",
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
      case "dashboard": return "Four GYSH Match Wizards. One Family Adventure.";
      case "quiz":
        return findMineMode === "adult"
          ? "GYSH Adults Match Wizard"
          : "Four GYSH Match Wizards. One Family Adventure.";
      case "calculators": return "GYSH Profit Estimator";
      case "guides":
        if (guidesManualId) {
          const labels: Record<MarketingGuideId, string> = {
            adult: "Adult Marketing Manual",
            kids: "Kids Marketing Manual",
            teens: "Teens Marketing Manual",
            seniors: "Seniors Marketing Manual",
            master: "Complete GYSH Guide",
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
      case "user_portal": return "GYSH My Dashboard";
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
          ? "Downloadable showcase manual with checklists, journey arrows, membership perks, and CTAs."
          : "Browse Adult, Senior, Kids, and Teens guides — plus downloadable marketing manuals from the Guides menu.";
      case "checklist": return "Practical launch steps — preview is open; the full list unlocks when you sign in.";
      case "workshops": return "Live sessions and guest experts for adult Side Hustles, AI agents, and Kids Glow nights.";
      case "community": return "Ask questions, share updates, and exchange tips with other Side Hustlers.";
      case "kids": return "Stories, GYSH Match Wizard, ideas, savings, and guides for Kids and Teens — parents coach the journey.";
      case "seniors": return "GYSH Match Wizard and flexible Side Hustles for 55+, retirees, and second careers.";
      case "about": return "Meet Tina Marie Barham and Evelyn Irving — the partnership behind Get Your Side Hustle.";
      case "contact": return "Questions, partnerships, or workshop inquiries — we’d love to hear from you.";
      case "join": return "Create an account, explore teams, and compare Free through Elite plans.";
      case "login": return "Sign in to save bookmarks, unlock badges, and track launch milestones.";
      case "user_portal": return "Check guide progress, badges, and launch milestones.";
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

  return (
    <div className="app-container">
      <header className={`top-header${mobileMenuOpen ? " open" : ""}`}>
        <div className="top-header-inner">
          <div className="top-header-row top-header-row--main">
            <button type="button" className="brand-section" onClick={() => goTo("dashboard")} aria-label="Home">
              <img src={gyshLogo} alt="Get Your Side Hustle" className="brand-header-logo" />
            </button>

            <button
              type="button"
              className="menu-toggle"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

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
                      alt=""
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
                  <div
                    ref={guidesMenuRef}
                    className={`admin-nav-dropdown guides-nav-dropdown${guidesMenuOpen ? " open" : ""}`}
                    onMouseEnter={() => setGuidesMenuOpen(true)}
                    onMouseLeave={() => setGuidesMenuOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => openGuidesLibrary()}
                      className={`nav-link-btn admin-nav-trigger${activeView === "guides" ? " active" : ""}`}
                      data-testid="nav-free-guides"
                      aria-label="Guides"
                      aria-expanded={guidesMenuOpen}
                      aria-haspopup="menu"
                    >
                      <BookOpen size={16} className="nav-icon nav-icon--guides" aria-hidden />
                      Guides
                      <ChevronDown size={14} className="admin-nav-chevron" aria-hidden />
                    </button>
                    <ul className="admin-nav-menu" role="menu" hidden={!guidesMenuOpen}>
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className={`admin-nav-item${
                            activeView === "guides" && !guidesManualId && !guidesDetailId ? " active" : ""
                          }`}
                          onClick={openGuidesLibrary}
                        >
                          Guides Library
                        </button>
                      </li>
                      {MARKETING_GUIDE_MENU.map((guide) => (
                        <li key={guide.id} role="none">
                          <button
                            type="button"
                            role="menuitem"
                            className={`admin-nav-item${
                              activeView === "guides" && guidesManualId === guide.id ? " active" : ""
                            }`}
                            onClick={() => openGuidesManual(guide.id)}
                            data-testid={`nav-guide-manual-${guide.id}`}
                          >
                            {guide.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
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
          </div>

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
                aria-label="Follow Get Your Side Hustle on Facebook"
                data-testid="header-facebook"
                title="Follow us on Facebook — facebook.com/getyoursidehustle"
              >
                <FacebookIcon size={20} />
                <span className="header-social-link__label">Facebook</span>
              </a>
            </nav>

            <div className="header-actions">
            {isLoggedIn ? (
              <>
                {userRole === "admin" ? (
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
                ) : (
                  <button
                    type="button"
                    onClick={() => goTo("user_portal")}
                    className={`nav-link-btn ${activeView === "user_portal" ? "active" : ""}`}
                  >
                    <User size={16} className="nav-icon nav-icon--portal" aria-hidden />
                    Portal
                  </button>
                )}
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
                      {profileUsers.length > 0 && (
                        <>
                          <li className="profile-switch-heading" role="presentation">
                            User profiles
                          </li>
                          {profileUsers.map((u) => (
                            <li key={u.id} role="none">
                              <button
                                type="button"
                                role="menuitem"
                                className={`admin-nav-item${
                                  actAsTarget.type === "user" && actAsTarget.id === u.id ? " active" : ""
                                }`}
                                onClick={() => applyActAsTarget(toActAsUserTarget(u))}
                              >
                                <span className="profile-switch-item-label">{u.name}</span>
                                <span className="profile-switch-item-desc">{u.email}</span>
                              </button>
                            </li>
                          ))}
                        </>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="user-profile">
                    <div className="avatar" style={{ background: "var(--grad-pink)" }} />
                    <div className="user-info">
                      <span className="user-name">Guest</span>
                      <span className="user-role">Member</span>
                    </div>
                  </div>
                )}
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
                >
                  <LogOut size={12} /> Log Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => goTo("login")}
                className={`btn btn-primary ${activeView === "login" ? "" : ""}`}
                style={{ padding: "8px 14px", fontSize: "0.95rem", gap: "6px" }}
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
      </header>

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
                  {activeView === "guides" && !guidesManualId && !guidesDetailId ? (
                    <>
                      <div className="header-title-guides-main">
                        <h1 data-testid="page-title">{getHeaderTitle()}</h1>
                        <div className="free-guides-perk-banner free-guides-perk-banner--header" role="note">
                          <button
                            type="button"
                            className="glow-badge free free-guides-perk-free-btn"
                            onClick={() => openJoin("adult")}
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
                      </div>
                      <div className="header-title-guides-aside">
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
                      </div>
                    </>
                  ) : (
                    <>
                      <h1 data-testid="page-title">
                        {getHeaderTitle()}
                        {(activeView === "join" || activeView === "membership_signup") && (
                          <span className="header-title-aside">(FREE PLANS AVAILABLE)</span>
                        )}
                      </h1>
                      {(activeView === "kids" ||
                        activeView === "seniors" ||
                        activeView === "about") &&
                      getHeaderDesc() ? (
                        <p className="header-title-desc header-title-desc--inline">{getHeaderDesc()}</p>
                      ) : null}
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
                    </>
                  )}
                </div>
                {activeView !== "kids" &&
                activeView !== "seniors" &&
                activeView !== "about" &&
                getHeaderDesc() ? (
                  <p className="header-title-desc">{getHeaderDesc()}</p>
                ) : null}
              </div>
            </div>
            {howOpen && (() => {
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
              <p className="home-page-header__eyebrow">
                <Sparkles size={14} aria-hidden="true" /> GYSH Match Wizard
              </p>
              <h1 className="home-page-header__title" data-testid="page-title">
                <span>Four</span>
                <span>GYSH</span>
                <span>Match</span>
                <span>Wizards.</span>
                <span>One</span>
                <span>Family</span>
                <span>Adventure.</span>
              </h1>
              <p className="home-page-header__purpose" data-testid="home-site-purpose">
                {SITE_PURPOSE}
              </p>
              <p className="home-page-header__lead">
                Each wizard asks age-right questions so matches feel doable—not generic. Parents become{" "}
                <strong>GYSH Coaches</strong> for kids and teens: cheer, set boundaries, and help turn ideas into
                safe first wins. Parental consent required through age 12.
              </p>
              <div className="home-follow-cta">
                <button type="button" className="btn btn-primary" onClick={() => openJoin()}>
                  <UserPlus size={16} aria-hidden /> Join GYSH free
                </button>
                <a
                  href={FACEBOOK_URL}
                  className="btn btn-outline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FacebookIcon size={16} /> Follow on Facebook
                </a>
              </div>
            </header>

            <section className="home-promo-hero" aria-label="Get Your Side Hustle family promotion">
              <div className="home-promo-hero__band">
                <div className="home-promo-hero__layout">
                  <div className="home-promo-hero__frame">
                    <img
                      src={gyshHomeHero}
                      alt="Get Your Side Hustle — Ideas, Action, Income, Freedom. For adults, kids, teens, and seniors. Start your journey today."
                      className="home-promo-hero__img"
                      width={1600}
                      height={900}
                      decoding="async"
                      fetchPriority="high"
                    />
                  </div>
                  <aside className="home-promo-hero__steps" aria-labelledby="home-steps-title">
                    <h2 id="home-steps-title" className="home-promo-hero__steps-heading">
                      <span className="home-promo-hero__steps-eyebrow">Start here</span>
                      <span className="home-promo-hero__steps-title">Pick your starting point</span>
                    </h2>
                    <p className="home-promo-hero__steps-note">
                      Kids, Teens, Adults, and Seniors each get a GYSH Match Wizard matched to their age and pace.
                    </p>
                    <ol className="home-promo-hero__bubbles">
                      <li>
                        <button
                          type="button"
                          className="home-step-bubble"
                          onClick={() => goTo("quiz")}
                        >
                          <span className="home-step-bubble__num" aria-hidden="true">1</span>
                          <span className="home-step-bubble__body">
                            <strong>GYSH Match Wizard</strong>
                            <span>Four age wizards for Kids, Teens, Adults &amp; Seniors — family fun.</span>
                          </span>
                          <Sparkles size={16} className="home-step-bubble__icon" aria-hidden="true" />
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="home-step-bubble"
                          onClick={() => openKidsCorner()}
                        >
                          <span className="home-step-bubble__num" aria-hidden="true">2</span>
                          <span className="home-step-bubble__body">
                            <strong>Families</strong>
                            <span>Safe hustles, stories, and parents as GYSH Coaches.</span>
                          </span>
                          <Star size={16} className="home-step-bubble__icon" aria-hidden="true" />
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="home-step-bubble"
                          onClick={() => openSeniors()}
                        >
                          <span className="home-step-bubble__num" aria-hidden="true">3</span>
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
                          <span className="home-step-bubble__num" aria-hidden="true">4</span>
                          <span className="home-step-bubble__body">
                            <strong>Workshops</strong>
                            <span>Live sessions and guest experts to launch with support.</span>
                          </span>
                          <Mic2 size={16} className="home-step-bubble__icon" aria-hidden="true" />
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="home-step-bubble"
                          onClick={() => openJoin()}
                        >
                          <span className="home-step-bubble__num" aria-hidden="true">5</span>
                          <span className="home-step-bubble__body">
                            <strong>Join</strong>
                            <span>Create a free account and start tracking your pilot.</span>
                          </span>
                          <UserPlus size={16} className="home-step-bubble__icon" aria-hidden="true" />
                        </button>
                      </li>
                    </ol>
                  </aside>
                </div>
              </div>
            </section>

            <section
              className="glass home-match-family"
              data-testid="home-match-family"
              aria-labelledby="home-match-family-title"
            >
              <div className="home-match-family__section-head">
                <span className="glow-badge free home-match-family__eyebrow">
                  <Sparkles size={13} /> Your age · Your wizard
                </span>
                <h2 id="home-match-family-title" className="home-match-family__section-title">
                  Pick Your Path — Kids · Teens · Adults · Seniors
                </h2>
                <p className="home-match-family__section-sub">
                  Four demographic lanes. One family adventure. Choose the wizard built for your stage of life.
                </p>
              </div>
              <ul className="home-match-family__grid">
                <li>
                  <strong>Kids (4–12)</strong>
                  <span>
                    Custom matches for ages <strong>4–8</strong> and <strong>9–12</strong> — confidence,
                    kindness, and parent-guided first hustles.
                  </span>
                </li>
                <li>
                  <strong>Teens (13–17)</strong>
                  <span>
                    Custom matches for ages <strong>13–14</strong> and <strong>15–17</strong> — bigger skills,
                    safer independence, still coach-friendly.
                  </span>
                </li>
                <li>
                  <strong>Adult (18–54)</strong>
                  <span>
                    Ranked matches from budget, hours, strengths, and goals — built for real adult schedules.
                  </span>
                </li>
                <li>
                  <strong>Senior (55+)</strong>
                  <span>
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
                isLoggedIn={hasMemberAccess}
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
                : selectedHustleId === "social" || selectedHustleId === "affiliate"
                ? "social"
                : "airbnb"
            }
            onGoToGuide={handleGoToGuideFromCalculator}
          />
        )}

        {activeView === "guides" && (
          guidesManualId ? (
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
          ) : guidesDetailId ? (
            <StepByStepGuides
              selectedHustleId={guidesDetailId}
              onGoToCalculator={handleGoToCalculatorFromGuide}
              isLoggedIn={isLoggedIn}
              onGoToJoin={() => openJoin("adult")}
              onGoToLogin={() => goTo("login")}
              onBackToCatalog={() => setGuidesDetailId(null)}
            />
          ) : (
            <FreeGuidesPage
              isLoggedIn={isLoggedIn}
              onGoToJoin={(audience) => openJoin(audience ?? "adult")}
              onGoToLogin={() => goTo("login")}
              onOpenAdultGuide={(id) => {
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
            isLoggedIn={isLoggedIn}
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
            isLoggedIn={hasMemberAccess}
            onGoToJoin={(audience) => openJoin(audience)}
            entryFocus={kidsEntryFocus}
          />
        )}

        {activeView === "seniors" && (
          <SeniorSideHustles
            isLoggedIn={hasMemberAccess}
            onGoToJoin={() => openJoin("senior")}
            onOpenGuides={() => goTo("guides")}
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
                  style={{
                    display: "block",
                    margin: "0 auto 18px",
                    height: "120px",
                    width: "auto",
                    maxWidth: "100%",
                    objectFit: "contain",
                    background: "transparent",
                    mixBlendMode: "multiply",
                  }}
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

                    <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}>
                      Log In
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
                      {resetBusy ? "Sending…" : "Email me a reset link"}
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
                      {resetBusy ? "Saving…" : "Save new password"}
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

        {activeView === "about" && <AboutPage onJoin={() => openJoin()} />}

        {activeView === "contact" && <ContactPage />}

        {activeView === "join" && (
          <JoinPage
            key={joinAudience ? `join-${joinAudience}` : "join-saved"}
            onLogin={() => goTo("login")}
            onSignup={(tier) => openMembershipSignup(tier ?? "free")}
            onCommunity={() => goTo("community")}
            onKidsCorner={() => openKidsCorner()}
            onOpenFreeGuides={() => {
              setGuidesDetailId(null);
              goTo("guides");
            }}
            membershipAudience={joinAudience}
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

        {activeView === "user_portal" && (
          <UserPortal />
        )}

        {activeView === "admin" && (
          <AdminPortal
            key={adminSessionKey}
            authUser={authUser}
            activeTab={adminTab}
            onTabChange={setAdminTab}
            userGuide={adminUserGuide}
            onUserGuideChange={setAdminUserGuide}
          />
        )}
      </main>

      <SiteFooter onNavigate={handleFooterNav} />
    </div>
  );
}

export default App;
