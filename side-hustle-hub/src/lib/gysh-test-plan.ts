/** GYSH Testing Portal — declarative test plan */

import type { TestOwnerId } from "./gysh-roles";
import { api } from "./api";
import { PROOFREAD_CASES } from "./gysh-proofread-cases";
import { WIZARD_SCENARIO_CASES } from "./gysh-wizard-scenarios";
import { withPageLinkInFirstStep } from "./qa-page-links";
import { noteEntriesPlainText } from "./gysh-note-entries";

export type TestSuite = "manual" | "vitest" | "playwright";

export type TestStatus =
  | "not_run"
  | "in_progress"
  | "pass"
  | "conditional_approval"
  | "fail"
  | "blocked";

export type Priority = "P0" | "P1" | "P2" | "P3";

export const PRIORITY_LABELS: Record<Priority, string> = {
  P0: "Severe",
  P1: "High",
  P2: "Medium",
  P3: "Low",
};

export const STATUS_LABELS: Record<TestStatus, string> = {
  not_run: "Not Started",
  in_progress: "In Progress",
  pass: "Pass",
  conditional_approval: "Conditional Approval",
  fail: "Fail",
  blocked: "Blocked",
};

/** All valid Testing Portal statuses (API + UI). */
export const TEST_STATUSES: TestStatus[] = [
  "not_run",
  "in_progress",
  "pass",
  "conditional_approval",
  "fail",
  "blocked",
];

/** Initial / default status for every test case until a tester changes it. */
export const DEFAULT_TEST_STATUS: TestStatus = "not_run";

/** Fail, Blocked, and Conditional Approval require a short written note. */
export const NOTE_REQUIRED_STATUSES: TestStatus[] = [
  "fail",
  "blocked",
  "conditional_approval",
];
export const NOTE_MIN_LENGTH = 8;

/** Resolved statuses (no longer open / not started). */
export function isTestStatusResolved(status: TestStatus): boolean {
  return (
    status === "pass" ||
    status === "conditional_approval" ||
    status === "fail" ||
    status === "blocked"
  );
}

export function statusRequiresNote(status: TestStatus): boolean {
  return NOTE_REQUIRED_STATUSES.includes(status);
}

export function noteMeetsRequirement(note: string): boolean {
  // Supports legacy plain notes and timestamped JSON note threads.
  return noteEntriesPlainText(note).trim().length >= NOTE_MIN_LENGTH;
}

export function allStepsChecked(checked: boolean[] | undefined, stepCount: number): boolean {
  if (stepCount <= 0) return true;
  if (!checked || checked.length < stepCount) return false;
  return checked.slice(0, stepCount).every(Boolean);
}

export type TestAttachmentMeta = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  scanStatus: string;
  scanDetail: string;
  addedAt: string;
  addedBy: string;
};

export const TEST_EVIDENCE_ACCEPT =
  "image/png,image/jpeg,image/gif,image/webp,application/pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export type TestCase = {
  id: string;
  area: string;
  title: string;
  priority: Priority;
  roles: Array<"admin" | "qa" | "kid" | "junior" | "adult" | "senior" | "all">;
  /**
   * Case owner in the Testing Portal.
   * Manual → human QA (tina / evelyn / lyriq), or [] = Unassigned.
   * Vitest → vitest suite owner. Playwright → playwright suite owner.
   */
  assignees: TestOwnerId[];
  /** manual = human QA; vitest / playwright = automated suites */
  suite?: TestSuite;
  steps: string[];
  expected: string;
  path?: string;
};

/**
 * Highest-level organization — every case is External or Internal.
 * External = what members / guests / parents see on the live site.
 * Internal = Admin Studio, Testing Portal, Schedule, suite runners, ops.
 */
export type TestFacing = "external" | "internal";

export const TEST_FACINGS: TestFacing[] = ["external", "internal"];

export const TEST_FACING_LABELS: Record<TestFacing, string> = {
  external: "External",
  internal: "Internal",
};

/** Areas that are always internal (admin / QA tooling). */
const INTERNAL_AREAS = new Set([
  "Admin",
  "Schedule",
  "Vitest",
  "Playwright",
  "Vitest Failure",
  "Playwright Failure",
]);

/** Edge cases whose area is shared but the subject under test is internal. */
const INTERNAL_CASE_IDS = new Set([
  "AUTH-001", // Admin Studio login
  "AUTH-006", // Log out clears Admin Studio
  "AUTH-007", // Testing Portal access for T / E / Lyriq
  "EMAIL-001", // API health / Resend configured
  "EMAIL-005", // Resend From domain ops check
]);

/** Map every case to External (user-facing) or Internal (admin / QA). */
export function facingForCase(t: Pick<TestCase, "area" | "id" | "suite">): TestFacing {
  if (INTERNAL_CASE_IDS.has(t.id)) return "internal";
  if (INTERNAL_AREAS.has(t.area)) return "internal";
  return "external";
}

/** Feature categories for portal filtering (under External / Internal). */
export type TestCategory =
  | "auth_access"
  | "navigation_brand"
  | "kids_junior"
  | "seniors"
  | "adult_hustles"
  | "proofread"
  | "website"
  | "facebook"
  | "contact"
  | "content"
  | "workshops"
  | "admin_ops"
  | "wizard_kids"
  | "wizard_junior"
  | "wizard_adult"
  | "wizard_senior"
  | "automated";

export const TEST_CATEGORY_LABELS: Record<TestCategory, string> = {
  auth_access: "Auth & Access",
  navigation_brand: "Navigation & Brand",
  kids_junior: "Kids & Junior",
  seniors: "Seniors",
  adult_hustles: "Adult Hub",
  proofread: "ProofRead",
  website: "Website",
  facebook: "Facebook",
  contact: "Contact",
  content: "Content",
  workshops: "Workshops",
  admin_ops: "Admin & Ops",
  wizard_kids: "Wizard · Kids FMSH",
  wizard_junior: "Wizard · Junior FMSH",
  wizard_adult: "Wizard · Adult FMSH",
  wizard_senior: "Wizard · Senior FMSH",
  automated: "Automated suites",
};

export const TEST_CATEGORIES: TestCategory[] = [
  "auth_access",
  "navigation_brand",
  "kids_junior",
  "seniors",
  "adult_hustles",
  "proofread",
  "website",
  "facebook",
  "contact",
  "content",
  "workshops",
  "admin_ops",
  "wizard_kids",
  "wizard_junior",
  "wizard_adult",
  "wizard_senior",
  "automated",
];

export function categoryForCase(t: Pick<TestCase, "area" | "suite" | "id">): TestCategory {
  if (t.suite === "vitest" || t.suite === "playwright") {
    if (t.area === "Kids Get Your Side Hustle") return "wizard_kids";
    if (t.area === "Junior Get Your Side Hustle") return "wizard_junior";
    if (t.area === "Adult Get Your Side Hustle") return "wizard_adult";
    if (t.area === "Senior Get Your Side Hustle") return "wizard_senior";
    if (t.area === "Vitest" || t.area === "Playwright") return "automated";
  }
  // ProofRead cases are area Proofread (PROOF-* ids) — keep Workshops category separate.
  if (t.area === "Proofread" || t.id.toUpperCase().startsWith("PROOF-")) {
    return "proofread";
  }
  switch (t.area) {
    case "Auth":
    case "Join":
    case "Registration":
    case "Email":
    case "Blueprint":
      return "auth_access";
    case "Navigation":
    case "Brand":
      return "navigation_brand";
    case "Kids Corner":
      return "kids_junior";
    case "Senior Side Hustles":
      return "seniors";
    case "Adult Hub":
    case "Side Hustle Checklist":
    case "Free Guides":
    case "Membership":
      return "adult_hustles";
    case "Workshops":
      return "workshops";
    case "Facebook":
      return "facebook";
    case "Contact":
      return "contact";
    case "Community":
    case "About":
    case "Family Coach":
      return "website";
    case "Admin":
    case "Schedule":
    case "Accessibility":
    case "UX Visual":
      return "admin_ops";
    case "Kids Get Your Side Hustle":
      return "wizard_kids";
    case "Junior Get Your Side Hustle":
      return "wizard_junior";
    case "Adult Get Your Side Hustle":
      return "wizard_adult";
    case "Senior Get Your Side Hustle":
      return "wizard_senior";
    case "Vitest":
    case "Playwright":
    case "Vitest Failure":
    case "Playwright Failure":
      return "automated";
    default:
      return "admin_ops";
  }
}

const TEST_CASES_RAW: TestCase[] = [
  {
    id: "AUTH-001",
    area: "Auth",
    title: "Admin can log into GYSH Admin Studio",
    priority: "P0",
    roles: ["admin", "qa"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Open Login from the top header",
      "Enter tinamariebarham@gmail.com / Admin123 (or evelyn3@cox.net / Admin)",
      "Click Log In",
    ],
    expected: "Lands in GYSH Admin Studio with Testing, Users, Content Factory, and Task List tabs",
    path: "login",
  },
  {
    id: "AUTH-002",
    area: "Auth",
    title: "Login rejects wrong password with clear error",
    priority: "P0",
    roles: ["admin", "qa", "adult"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Login from the top header",
      "Enter a valid-looking email and an incorrect password",
      "Click Log In",
    ],
    expected: "Stays on login page; red error message (invalid email/password or equivalent); no admin portal",
    path: "login",
  },
  {
    id: "AUTH-003",
    area: "Auth",
    title: "Login blocks empty email or password",
    priority: "P1",
    roles: ["all"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Login",
      "Leave email and/or password empty and click Log In",
      "Optionally enter email only, then password only",
    ],
    expected: "Browser required-field validation prevents submit; no success navigation",
    path: "login",
  },
  {
    id: "AUTH-004",
    area: "Auth",
    title: "Login page New here? link opens Membership Sign-up",
    priority: "P1",
    roles: ["all"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Login",
      "Click New here? → Join GYSH",
    ],
    expected: "Page title becomes GYSH Membership Sign-up; free-tier registration form is visible (not the Join plans hub)",
    path: "login",
  },
  {
    id: "AUTH-005",
    area: "Auth",
    title: "Password reset mode shows current/new/confirm fields",
    priority: "P1",
    roles: ["admin", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Login",
      "Click Forgot / Reset password?",
      "Confirm Account email, Current password, New password, Confirm new password fields",
      "Click Back to sign in",
    ],
    expected: "Reset form appears; Back returns to Log In form; mismatched confirm should fail when submitted with known account",
    path: "login",
  },
  {
    id: "JOIN-001",
    area: "Join",
    title: "Join GYSH page shows membership plans + footer CTAs",
    priority: "P0",
    roles: ["all"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Join from header (or footer)",
      "Confirm page title Join GYSH; membership hero sells membership (dashboard + referral) and GYSH Membership plans section",
      "Confirm See Memberships CTA names the selected lane’s pricing and scrolls/focuses #gysh-membership-plans",
      "Confirm footer CTAs: Create account / Join, Sign in, Browse GYSH Community, Kids / Teens Corner",
      "Confirm no standalone Kids Corner GYSH Team / Teens Side Hustle Team cards on Join (team join lives in Kids & Teens → Join)",
    ],
    expected: "Join is the membership signup hub; Free→Elite plans and audience lanes are clear; Kids/Teens team signup is via Kids & Teens Corner",
    path: "join",
  },
  {
    id: "JOIN-002",
    area: "Join",
    title: "Join CTAs open Sign-up, Login, Community, and Kids & Teens",
    priority: "P0",
    roles: ["all"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "On Join: click Create account / Join → confirm GYSH Membership Sign-up registration view",
      "Return to Join → Sign in → confirm GYSH Sign In",
      "Return to Join → Browse GYSH Community → confirm Community hub",
      "Return to Join → Kids / Teens Corner → confirm GYSH Kids & Teens Corner",
    ],
    expected: "Each Join CTA navigates to the correct view without errors",
    path: "join",
  },
  {
    id: "NAV-001",
    area: "Navigation",
    title: "Top header menu navigates all primary views",
    priority: "P0",
    roles: ["all"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Primary nav: click Home, GYSH Match Wizard, Kids & Teens, Seniors, Guides, Workshops, Community, Join",
      "Secondary/meta nav: About, Contact Us (and Login when logged out)",
      "Confirm each view title updates (Kids & Teens → GYSH Kids & Teens Corner; Match Wizard selector uses the family Match Wizard headline until an adult wizard starts)",
      "Confirm Guides is a dropdown (Guides Library + marketing manuals), not a Some Free banner",
      "Confirm Membership is not a separate top-nav item (plans live on Join)",
    ],
    expected: "Every listed nav item opens the correct page; Home is first; Guides then Workshops sit after Seniors; Join includes membership plans",
    path: "dashboard",
  },
  {
    id: "MEMBER-001",
    area: "Membership",
    title: "Join page includes membership tiers, audience tabs, credits, and price list",
    priority: "P1",
    roles: ["all"],
    assignees: ["evelyn", "tina"],
    suite: "manual",
    steps: [
      "Open Join from top nav",
      "Confirm membership plans/hero appear first; footer CTAs include Create account / Join, Sign in, Browse GYSH Community, Kids / Teens Corner (no Kids/Teens team cards above plans)",
      "Confirm Free / Starter / Pro / Elite cards, then Proposed hustle schedule suite callout after the membership tier grid",
      "On Adults and Seniors, confirm Military & Veterans callout (Veterans save even more) under membership options",
      "Switch audience tabs: Kids (4–12), Teens (13–17), Adults (18–54), Seniors (55+)",
      "On Kids and Teens, confirm parent-funded credit packs and credit earn sections appear; military callout is hidden",
      "Confirm credit packs list 25 / $5, 60 / $10, 140 / $20, and 300 / $40",
      "Scan a la carte price table for the selected audience",
    ],
    expected: "Join loads with membership section then schedule suite; Adults/Seniors show military/veteran savings callout; Kids/Teens show credit funding and earning; Pro unlocks schedule suite messaging",
    path: "join",
  },
  {
    id: "SENIOR-001",
    area: "Senior Side Hustles",
    title: "Senior Side Hustles page shows Match Wizard, Ideas, Guides, and Join",
    priority: "P1",
    roles: ["adult", "admin", "qa"],
    assignees: ["evelyn", "tina"],
    suite: "manual",
    steps: [
      "Open Seniors from top nav (or Home Seniors starting-point bubble)",
      "Confirm intro welcomes 55+ / retirees & flexible schedules without infantilizing tone",
      "Browse tabs: GYSH Match Wizard, Ideas, Guides, Join",
    ],
    expected: "Page title is GYSH Seniors Corner; tabs work; Join can mark interest or link to Join",
    path: "seniors",
  },
  {
    id: "SENIOR-002",
    area: "Senior Side Hustles",
    title: "Senior Join tab marks interest and offers Create free GYSH account",
    priority: "P1",
    roles: ["adult", "admin", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Seniors → Join as guest",
      "Click I'm interested",
      "Confirm You're on the Senior interest list",
      "Click Create free GYSH account",
    ],
    expected: "Interest flag shows; Create account navigates to Join GYSH (signup hub)",
    path: "seniors",
  },
  {
    id: "CHECK-001",
    area: "Side Hustle Checklist",
    title: "Guests see checklist preview; members see full interactive list",
    priority: "P1",
    roles: ["adult", "admin", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open GYSH Side Hustle Guide / launch checklist view (path checklist) — it is not a primary top-nav item",
      "As guest: confirm first 2 steps visible and remaining steps blurred with Join / Sign in CTA",
      "Sign in as member (or admin) and reopen checklist",
      "Confirm all steps visible and checkboxes toggle complete",
    ],
    expected: "Full checklist only when logged in; guest teaser + membership CTA otherwise",
    path: "checklist",
  },
  {
    id: "KIDS-001",
    area: "Kids Corner",
    title: "Kids Stories tab shows Kevina bio + YouTube embeds",
    priority: "P0",
    roles: ["kid", "admin", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Kids & Teens from header",
      "Stay on Kids mode → open Stories tab",
      "Confirm About Kevina / channel bio is visible",
      "Play a featured story embed",
    ],
    expected: "Page title is GYSH Kids & Teens Corner; bio matches channel About text; embeds play; Subscribe links open YouTube",
    path: "kids",
  },
  {
    id: "KIDS-002",
    area: "Kids Corner",
    title: "Kids (4–12) + Teens (13–17) modes: Match Wizard, Ideas, Piggy Bank / My Bank",
    priority: "P1",
    roles: ["junior", "admin", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Kids & Teens → confirm Kids / Teens mode toggles (Ages 4–12 / Ages 13–17) are separate from the page heading",
      "On Kids: confirm heading GYSH Kid's Side Hustles + Ages 4–12 badge; tab bar shows Stories, GYSH Match Wizard, Ideas, Piggy Bank, Guides, Join",
      "Open Stories tab → Featured Stories + Kevina embeds (Stories is a normal tab in the tab bar — not a red bubble next to Ages)",
      "Open Guides → free guides fully visible; member guides show preview + Join to unlock",
      "Open Join → Kids Corner GYSH Team copy + parental consent signup; CTA says Join Kids Corner GYSH Team",
      "Switch to Teens → heading GYSH Teens Side Hustles + Ages 13–17; tabs are GYSH Match Wizard, Ideas, My Bank, Guides, Join (no Stories / no Welcome); Join CTA says Join Teens",
    ],
    expected: "Kids/Teens mode toggles clear; Ages badge is on the heading; Stories is a kids-tab-bar tab; Guides free vs gated; Teens has no Stories/Welcome; Join uses parental consent signup",
    path: "kids",
  },
  {
    id: "KIDS-003",
    area: "Kids Corner",
    title: "Member guide gate: preview steps then unlock via team join or login",
    priority: "P1",
    roles: ["kid", "junior", "admin", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Kids & Teens → Guides as guest → confirm free guides show all steps",
      "Open a Members guide → see steps 1–2 + lock overlay",
      "Complete parental consent signup OR sign in → confirm full guide unlocks when approved/member",
    ],
    expected: "Gating works; logged-in GYSH members also unlock without local team join",
    path: "kids",
  },
  {
    id: "KIDS-004",
    area: "Kids Corner",
    title: "Kids (4–12) Join tab: parental consent signup",
    priority: "P0",
    roles: ["kid", "admin", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Kids & Teens → Kids mode → Join tab (clear site data if already a member)",
      "Click Join Kids Corner GYSH Team",
      "Confirm child first name + email + parent email form and safety copy (no address/phone from kids)",
      "Submit request → success message that parent must approve via email",
    ],
    expected: "Signup stored pending parent consent; kids never asked for address/phone",
    path: "kids",
  },
  {
    id: "KIDS-005",
    area: "Kids Corner",
    title: "Teens (13–17) Join tab: parental consent signup",
    priority: "P0",
    roles: ["junior", "admin", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Kids & Teens → Teens mode (Ages 13–17) → Join tab",
      "Click Join Teens",
      "Submit junior name + email + parent email",
      "Confirm pending-parent messaging",
    ],
    expected: "Teens signup requires distinct parent email and stays inactive until parent grants permission",
    path: "kids",
  },
  {
    id: "WORK-001",
    area: "Workshops",
    title: "Workshop cards show Reserve Spot or Join Waitlist signup CTAs",
    priority: "P1",
    roles: ["adult", "admin", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Workshops",
      "Filter Upcoming / Waitlist if needed",
      "Confirm non-past cards show Reserve Spot or Join Waitlist",
      "Click a CTA (note: booking may be placeholder until member accounts fully launch)",
    ],
    expected: "Signup CTAs visible per status; past cards show Watch Replay instead",
    path: "workshops",
  },
  {
    id: "CONTACT-001",
    area: "Contact",
    title: "Contact form sends message (happy path)",
    priority: "P1",
    roles: ["all"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Contact Us",
      "Fill Name, Email, Message with valid values",
      "Click Send message",
    ],
    expected: "Success banner (Thanks — your message was sent…) when email is configured; otherwise a clear server error, not a silent fail",
    path: "contact",
  },
  {
    id: "CONTACT-002",
    area: "Contact",
    title: "Contact form blocks empty fields and invalid email",
    priority: "P1",
    roles: ["all"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Contact Us",
      "Click Send with empty fields → browser required validation",
      "Enter name + message but invalid email (e.g. not-an-email) → attempt send",
      "Confirm valid email format is required before submit succeeds",
    ],
    expected: "Empty fields blocked; invalid email blocked by HTML5 and/or API validation message",
    path: "contact",
  },
  {
    id: "ADULT-001",
    area: "Adult Hub",
    title: "GYSH Match Wizard age selector → Adults wizard returns ranked matches",
    priority: "P1",
    roles: ["adult", "admin", "qa"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Open GYSH Match Wizard from top nav",
      "Confirm age-group selector shows Kids / Teens / Adults / Seniors cards (titles: GYSH Kids/Teens/Adults/Seniors Match Wizard)",
      "Click Adults",
      "Answer budget/time",
      "Select up to 2 ranked strengths",
      "Select 2+ ranked goals",
      "View ranked results",
    ],
    expected: "Age selector first; Adults wizard then shows ranked list best→lower with match %; header becomes GYSH Adults Match Wizard",
    path: "quiz",
  },
  {
    id: "FREE-001",
    area: "Free Guides",
    title: "Guides library filters All / Free / Adult-Senior / Kids / Teens (spot-check)",
    priority: "P2",
    roles: ["all", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Guides from the header after deploy",
      "Spot-check filter chips: All, Free, Adult / Senior, Kids, Teens — look correct on mobile + desktop",
    ],
    expected: "Visual/layout spot-check; automated coverage is PW-FREE-001",
    path: "guides",
  },
  {
    id: "ADULT-002",
    area: "Adult Hub",
    title: "Calculators produce profit estimates",
    priority: "P1",
    roles: ["adult", "admin", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: ["Open Calculators", "Adjust Airbnb / ecom / social sliders", "Read estimate panel"],
    expected: "Estimates update as sliders move",
    path: "calculators",
  },
  {
    id: "ADMIN-001",
    area: "Admin",
    title: "Testing Portal can mark a test Pass/Fail",
    priority: "P0",
    roles: ["admin", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Admin → Testing Portal",
      "Expand any test case",
      "Set status to Pass then Fail",
    ],
    expected: "Status persists after refresh (D1 database)",
    path: "admin",
  },
  {
    id: "ADMIN-002",
    area: "Admin",
    title: "Users Area filters by role (Admin / QA / Kid / Junior / Adult)",
    priority: "P1",
    roles: ["admin", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Admin → Users Area",
      "Filter by Kid, Junior, Adult, Admin, QA",
      "Change a demo user status",
    ],
    expected: "Filters work; status changes save",
    path: "admin",
  },
  {
    id: "ADMIN-003",
    area: "Admin",
    title: "Content Factory generates and advances draft statuses",
    priority: "P1",
    roles: ["admin", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Admin → Content Factory",
      "Generate weekly batch",
      "Move a draft from draft → pending_review → approved",
    ],
    expected: "Drafts appear with type badges; status workflow works",
    path: "admin",
  },
  {
    id: "ADMIN-004",
    area: "Admin",
    title: "Task List tracks T + E assignments",
    priority: "P1",
    roles: ["admin", "qa"],
    assignees: ["tina", "evelyn"],
    suite: "manual",
    steps: [
      "Admin → Task List",
      "Add a task assigned to Tina or Evelyn",
      "Change status to In Progress then Done",
    ],
    expected: "Task persists; status colors update",
    path: "admin",
  },
  {
    id: "BRAND-001",
    area: "Brand",
    title: "Light Antique Gold theme (no dark mode)",
    priority: "P2",
    roles: ["all"],
    assignees: ["tina"],
    suite: "manual",
    steps: ["Load homepage", "Confirm Soft Ivory background and Antique Gold CTAs"],
    expected: "Light luxury palette; gold primary buttons; readable charcoal text",
    path: "dashboard",
  },

  // ——— Manual sample pool: judgment / UX / a11y / tone (automation blind spots) ———
  {
    id: "UX-001",
    area: "UX Visual",
    title: "Active filter bubbles: white text readable on gold gradient",
    priority: "P0",
    roles: ["admin", "qa"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Admin → Testing Portal",
      "Click several filter bubbles (Status, Suite, Sprint, QA tester) until selected",
      "Confirm label AND count numbers (e.g. · 12/40) are clearly white on the dark gold fill",
      "Repeat on Home demographic chips / Kids age mode if present",
    ],
    expected: "No black/gray numbers or labels fading into the gradient; counts inherit white",
    path: "admin",
  },
  {
    id: "UX-002",
    area: "UX Visual",
    title: "Header logo is the clear wordmark (not tiny/cropped black canvas)",
    priority: "P1",
    roles: ["all", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Load Home on desktop and phone width",
      "Confirm top-left logo shows Get Your SIDE HUSTLE + rocket + tagline crisply",
      "Confirm footer logo matches and is not a black empty frame",
    ],
    expected: "Wordmark readable; cream logo cropped tight; no giant black padding",
    path: "dashboard",
  },
  {
    id: "UX-003",
    area: "UX Visual",
    title: "Home hero lead + outline CTAs are high contrast (not light gray on cream)",
    priority: "P0",
    roles: ["all", "qa"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Open Home",
      "Read the paragraph under the promo hero (family / Match Wizard lead)",
      "Confirm Families / Seniors outline buttons use dark red text on white with a clear border",
      "Confirm Pick your starting point descriptions are charcoal, not pale gray",
    ],
    expected: "Lead and secondary copy pass a quick readability glance at arm's length",
    path: "dashboard",
  },
  {
    id: "UX-004",
    area: "UX Visual",
    title: "Mobile menu + page zoom controls usable on phone width",
    priority: "P1",
    roles: ["all", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Resize to ~375px or use a phone",
      "Open hamburger menu; navigate to Guides, Kids & Teens, Seniors, Join",
      "Use page zoom + / − if shown; confirm layout does not clip primary CTAs",
    ],
    expected: "Menu opens/closes; navigation works; no unreadable overlapping controls",
    path: "dashboard",
  },
  {
    id: "A11Y-001",
    area: "Accessibility",
    title: "Keyboard-only path through Match Wizard age selector into Adults wizard",
    priority: "P1",
    roles: ["adult", "qa"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Click Home then GYSH Match Wizard",
      "Use Tab / Enter only (no mouse) to open Adults (GYSH Adults Match Wizard)",
      "Advance at least one question with keyboard",
      "Confirm focus ring is visible on interactive controls",
    ],
    expected: "Full keyboard path works; focus never disappears into a dead end",
    path: "quiz",
  },
  {
    id: "A11Y-002",
    area: "Accessibility",
    title: "Images and key icons have meaningful alt / aria labels",
    priority: "P2",
    roles: ["qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Spot-check Home hero, Guides hero, Kids Corner hero, logo in header",
      "Inspect alt text (DevTools or screen reader) for empty/useless alts like 'image'",
    ],
    expected: "Promotional images describe the scene or brand; logo has Get Your Side Hustle alt",
    path: "dashboard",
  },
  {
    id: "FAMILY-001",
    area: "Family Coach",
    title: "Home / Match Wizard copy positions parents as GYSH Coaches (consent through 12)",
    priority: "P0",
    roles: ["all", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Read Home lead under the family Match Wizards headline (GYSH Coaches + consent through 12)",
      "Open GYSH Match Wizard → expand More about GYSH Match Wizard if needed → confirm Kids card/details mention GYSH Coaches and parental consent through age 12",
      "Confirm parental consent through age 12 is stated clearly",
      "Confirm tone is coaching/safety — not asking kids for address/phone",
    ],
    expected: "Coach language present; consent age clear; no child PII asks in marketing copy",
    path: "dashboard",
  },
  {
    id: "FAMILY-002",
    area: "Family Coach",
    title: "Kids Piggy Bank / Teens My Bank feels safe and age-appropriate",
    priority: "P1",
    roles: ["kid", "junior", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Kids mode → Piggy Bank: set a goal, confirm give-back / savings language",
      "Teens mode → My Bank: confirm teen-appropriate wording (no adult investment jargon)",
      "Confirm no payment card fields are shown to children",
    ],
    expected: "Playful money lessons only; no real payment capture on these tools",
    path: "kids",
  },
  {
    id: "WIZ-UX-001",
    area: "Adult Hub",
    title: "Adult wizard: match quality & copy feel doable (human judgment)",
    priority: "P0",
    roles: ["adult", "qa"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Complete Adult Match Wizard with a realistic profile (low budget, few hours)",
      "Read top 3 matches aloud — do titles/reasons feel specific and achievable?",
      "Confirm match % ordering best → lower",
      "Use Back if available; confirm answers are retained or clearly reset",
    ],
    expected: "Recommendations feel personalized, not generic spam; no broken empty results",
    path: "quiz",
  },
  {
    id: "WIZ-UX-002",
    area: "Kids Corner",
    title: "Kids wizard: parent-friendly results (not teen/adult hustles)",
    priority: "P0",
    roles: ["kid", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Kids & Teens → Kids → GYSH Match Wizard (or GYSH Match Wizard nav → Kids)",
      "Complete a short path with a parent/coach mindset",
      "Confirm results are kid-safe (lemonade, crafts, chores — not adult gig apps)",
    ],
    expected: "No inappropriate adult side hustles in Kids results",
    path: "kids",
  },
  {
    id: "WIZ-UX-003",
    area: "Senior Side Hustles",
    title: "Senior wizard: respectful tone + flexible/low-intensity matches",
    priority: "P0",
    roles: ["senior", "qa"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Open Seniors → GYSH Match Wizard (or GYSH Match Wizard nav → Seniors)",
      "Complete with limited hours / second-career intent",
      "Scan copy for ageist or infantilizing language",
      "Confirm top matches fit flexible schedules",
    ],
    expected: "Tone respectful; hustles fit 55+ energy/time constraints",
    path: "seniors",
  },
  {
    id: "WIZ-UX-004",
    area: "Kids Corner",
    title: "Teens wizard: distinct from Kids and Adults",
    priority: "P1",
    roles: ["junior", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Kids & Teens → Teens (13–17) → GYSH Match Wizard",
      "Complete wizard; compare vibe to Kids results you know",
      "Confirm teen-appropriate earning ideas (not preschool crafts, not Airbnb hosting)",
    ],
    expected: "Teens path feels 13–17 specific",
    path: "kids",
  },
  {
    id: "AUTH-006",
    area: "Auth",
    title: "Log out clears Admin Studio and session",
    priority: "P0",
    roles: ["admin", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Log in as admin/QA",
      "Open Admin → Testing Portal",
      "Log out from header/profile",
      "Try opening Admin URL/state again or refresh",
    ],
    expected: "Admin portal inaccessible; prompted to log in; no leftover privileged UI",
    path: "login",
  },
  {
    id: "AUTH-007",
    area: "Auth",
    title: "Lyriq / Tina / Evelyn can each reach Testing Portal after login",
    priority: "P0",
    roles: ["admin", "qa"],
    assignees: ["lyriq", "tina", "evelyn"],
    suite: "manual",
    steps: [
      "Log in as each portal QA (Tina, Evelyn, Lyriq) in turn (or verify with known accounts)",
      "Confirm Admin Studio → Testing Portal loads",
      "Confirm suite filters Manual / Vitest / Playwright appear",
    ],
    expected: "All three QA accounts can access Testing Portal without 403/blank screen",
    path: "login",
  },
  {
    id: "COMM-001",
    area: "Community",
    title: "Community hub loads with GYSH community framing (not empty shell)",
    priority: "P2",
    roles: ["all", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Community from header or Join → Browse GYSH Community",
      "Confirm hero/content explains community purpose",
      "Spot-check no broken images or placeholder lorem",
    ],
    expected: "Page feels intentional; links back to Join/Kids where expected",
    path: "community",
  },
  {
    id: "ABOUT-001",
    area: "About",
    title: "About page tells T + E partnership story clearly",
    priority: "P2",
    roles: ["all", "qa"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Open About",
      "Confirm founders/partnership narrative readable",
      "Confirm no outdated 'Membership' top-nav claims if plans live on Join",
    ],
    expected: "Story is clear; branding consistent with rest of site",
    path: "about",
  },
  {
    id: "FB-001",
    area: "Facebook",
    title: "Header Facebook link opens the official GYSH Page",
    priority: "P1",
    roles: ["all", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Load Home (logged out)",
      "Find the Facebook icon/link in the site header",
      "Confirm it points to facebook.com/getyoursidehustleofficial (opens in a new tab)",
      "Confirm the control has a clear Follow/Facebook label or accessible name",
    ],
    expected: "Header Facebook control is visible and links to the official GYSH Facebook Page",
    path: "dashboard",
  },
  {
    id: "FB-002",
    area: "Facebook",
    title: "Footer Facebook link matches the official GYSH Page",
    priority: "P1",
    roles: ["all", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Scroll to the site footer on Home",
      "Click / inspect the Facebook link",
      "Confirm same official Page URL as header (getyoursidehustleofficial)",
    ],
    expected: "Footer Facebook link is present and consistent with the official Page",
    path: "dashboard",
  },
  {
    id: "FB-003",
    area: "Facebook",
    title: "About page Follow on Facebook CTA works",
    priority: "P2",
    roles: ["all", "qa"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Open About",
      "Find Follow on Facebook (or equivalent CTA)",
      "Confirm it opens the official GYSH Facebook Page",
    ],
    expected: "About social CTA promotes the live Facebook Page without a broken or placeholder URL",
    path: "about",
  },
  {
    id: "FB-004",
    area: "Facebook",
    title: "Home Join / Follow CTAs include Facebook follow path",
    priority: "P2",
    roles: ["all", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Load Home",
      "Locate Join and Follow (Facebook) CTAs near the hero / purpose line",
      "Confirm Follow opens the official Facebook Page; Join still goes to membership/signup",
    ],
    expected: "Home clearly offers both Join (site) and Follow (Facebook) without mixing the destinations",
    path: "dashboard",
  },
  {
    id: "GUIDE-001",
    area: "Free Guides",
    title: "Free vs member guide gating is obvious to a human (not just API)",
    priority: "P1",
    roles: ["all", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Guides as guest",
      "Open a Free guide — full steps readable",
      "Open a locked/member guide — preview + clear unlock CTA",
      "Confirm Free Membership Unlocks Perks (or equivalent) messaging is accurate",
    ],
    expected: "Humans immediately understand what is free vs gated",
    path: "guides",
  },
  {
    id: "GUIDE-002",
    area: "Free Guides",
    title: "User Guides / PDF export (if present) is usable",
    priority: "P2",
    roles: ["qa", "admin"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Open User Guides / member guide hub if available in Admin or site",
      "Expand a chapter; confirm TOC jumps work",
      "If PDF export exists, generate and open — check headings not cut off",
    ],
    expected: "Guide content readable; export not blank/corrupt",
    path: "guides",
  },
  {
    id: "ADMIN-005",
    area: "Schedule",
    title: "Schedule board: card fields readable; assignee/sprint not truncated",
    priority: "P1",
    roles: ["admin", "qa"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Admin → Schedule / Sprint board",
      "Open a test/task card; confirm labeled selects show full values",
      "Change sprint/status with a note when required for fail/blocked",
      "Confirm Sprint Status bars show done/total",
    ],
    expected: "No clipped dropdown values; saves persist after refresh",
    path: "admin",
  },
  {
    id: "ADMIN-006",
    area: "Admin",
    title: "Testing Portal All Test Cases + Suites/Sprint/Resource bars collapse",
    priority: "P2",
    roles: ["admin", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Admin → Testing Portal",
      "Expand All Test Cases under the header",
      "Collapse/expand Suites, Per Sprint, Per QA Resource",
      "Confirm passed/total summaries still visible when collapsed",
    ],
    expected: "Collapsibles work; counts remain visible on toggles",
    path: "admin",
  },
  {
    id: "ADMIN-007",
    area: "Admin",
    title: "Task List status cards tint by status (brown/yellow/red/green)",
    priority: "P2",
    roles: ["admin", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Admin → Task List",
      "Find or set tasks in Not started, In progress, Blocked, Done",
      "Confirm card backgrounds match status colors at a glance",
    ],
    expected: "Status is obvious without reading the dropdown",
    path: "admin",
  },
  {
    id: "ADMIN-008",
    area: "Admin",
    title: "Run Vitest (new only) does not wipe prior Pass cases",
    priority: "P1",
    roles: ["admin", "qa"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Note a VT-* case already marked Pass",
      "Click Run Vitest (new only)",
      "Refresh; confirm prior Pass remains Pass",
      "If a failure is forced in a future run, confirm a VT-FAIL-* case appears with severity + repro notes",
    ],
    expected: "Mode=new skips already-run cases; failures create detailed fail cases in current sprint",
    path: "admin",
  },
  {
    id: "CONTACT-003",
    area: "Contact",
    title: "Contact message actually arrives in GYSH inbox (human verify)",
    priority: "P1",
    roles: ["qa", "admin"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Send Contact form with unique subject/token in the message body",
      "Check the configured GYSH inbox (or Resend dashboard) for delivery",
      "Confirm reply-to / from is usable",
    ],
    expected: "Real email received — automation cannot fully prove inbox delivery",
    path: "contact",
  },
  {
    id: "WORK-002",
    area: "Workshops",
    title: "Workshop copy & guest speaker presentation feel trustworthy",
    priority: "P2",
    roles: ["adult", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Workshops",
      "Read 2–3 cards for tone, dates, and CTA clarity",
      "Confirm waitlist vs reserve language matches status",
    ],
    expected: "No confusing contradictory CTAs; speakers/topics look intentional",
    path: "workshops",
  },
  {
    id: "NAV-002",
    area: "Navigation",
    title: "Footer links + disclaimer readable and accurate",
    priority: "P2",
    roles: ["all", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Scroll to footer on Home",
      "Click About, Join, Contact",
      "Skim educational disclaimer — not investment advice",
    ],
    expected: "Footer nav works; disclaimer present and readable",
    path: "dashboard",
  },
  {
    id: "HOWIT-001",
    area: "UX Visual",
    title: "How it works panels open with clear steps (not empty)",
    priority: "P2",
    roles: ["all", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "On GYSH Match Wizard / Kids & Teens / Seniors (where available), open How it works",
      "Confirm numbered steps make sense to a first-time visitor",
      "Close panel; confirm page still usable",
    ],
    expected: "Helpful, non-empty guidance; toggle works",
    path: "quiz",
  },

  /* ── Email + registration (Lyriq) — Resend, contact, free signup, consent ── */
  {
    id: "EMAIL-001",
    area: "Email",
    title: "API health reports email configured when Resend key is set",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open https://getyoursidehustle.com/api/health (or site origin + /api/health)",
      "Confirm JSON includes email: \"configured\" (not \"missing\")",
      "Optional: note ok/db fields still healthy",
    ],
    expected: "Production Functions see RESEND_API_KEY; email status is configured",
  },
  {
    id: "EMAIL-002",
    area: "Email",
    title: "Contact form delivers to info@ inbox via Resend",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Contact Us logged out",
      "Send a message with a unique token in the body (e.g. LYRIQ-EMAIL-002-<date>)",
      "Confirm on-site success banner",
      "Check info@getyoursidehustle.com (or CONTACT_TO) and Resend → Emails for Delivered",
    ],
    expected: "Message arrives; Resend shows Delivered (not domain-not-verified)",
    path: "contact",
  },
  {
    id: "EMAIL-003",
    area: "Email",
    title: "Contact form From/body includes submitter email for reply",
    priority: "P1",
    roles: ["qa", "admin"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Send Contact with a known personal email as the form Email field",
      "Open the delivered admin email",
      "Confirm name + submitter email appear clearly for reply",
    ],
    expected: "Admin can identify and reply to the sender without hunting headers",
    path: "contact",
  },
  {
    id: "EMAIL-004",
    area: "Email",
    title: "Password change sends Resend confirmation to the account email",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Log in as Lyriq (leegaulden1222@icloud.com)",
      "Open Login → Forgot / Reset password? (or Users Area password change if preferred)",
      "Change password with current password → new → confirm (then change back if needed)",
      "Check Lyriq inbox + Resend for “password updated” notice",
    ],
    expected: "Confirmation email delivered when Resend domain is verified; UI still succeeds even if email fails (note any error)",
    path: "login",
  },
  {
    id: "EMAIL-005",
    area: "Email",
    title: "Resend From domain matches verified notify/apex domain",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Trigger any outbound email (Contact or password notice)",
      "In Resend → Emails, open the message",
      "Confirm From is Get Your Side Hustle <noreply@getyoursidehustle.com> OR the EMAIL_FROM override that matches a Verified domain",
      "Confirm status is Delivered (not rejected for unverified domain)",
    ],
    expected: "Sending domain is verified; no domain error in Resend",
  },
  {
    id: "EMAIL-006",
    area: "Email",
    title: "Kids parental-consent email path is documented / delivered",
    priority: "P0",
    roles: ["kid", "qa", "admin"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Kids & Teens → Kids → Join → Join Kids Corner GYSH Team with a unique child + parent email you control",
      "Submit → note pending-parent success copy",
      "Check parent inbox / Resend for consent email (or record if not yet implemented and file as blocked with note)",
      "If link arrives: open consent link → confirm grant success",
    ],
    expected: "Either consent email delivers and activates membership, or a clear blocked note that email consent is not live yet",
    path: "kids",
  },
  {
    id: "EMAIL-007",
    area: "Email",
    title: "Teens parental-consent email path is documented / delivered",
    priority: "P0",
    roles: ["junior", "qa", "admin"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Kids & Teens → Teens mode → Join → Join Teens with junior email ≠ parent email",
      "Submit → pending-parent messaging",
      "Verify parent email / Resend for consent (or mark blocked with exact UI copy if missing)",
    ],
    expected: "Teens consent email works end-to-end or is explicitly tracked as not-yet-shipped",
    path: "kids",
  },
  {
    id: "EMAIL-008",
    area: "Email",
    title: "Workshop registration confirmation email (or clear placeholder)",
    priority: "P2",
    roles: ["adult", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Workshops → Reserve Spot / Join Waitlist on a card",
      "Complete registration with a mailbox you control",
      "Check for confirmation email in inbox + Resend",
      "If no email by design, document actual UI success + note in Testing Portal",
    ],
    expected: "Either confirmation email arrives, or intentional placeholder is documented without silent failure",
    path: "workshops",
  },
  {
    id: "REG-001",
    area: "Registration",
    title: "Adult free account registers after Match Wizard (Blueprint unlock)",
    priority: "P0",
    roles: ["adult", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Log out / clear free-member session",
      "Run Adult GYSH Match Wizard to results → unlock / create free account",
      "Register with a new unique email + password",
      "Confirm full Side Hustle Blueprint unlocks and account can sign back in",
    ],
    expected: "Free adult registration succeeds; Blueprint unlocks; login works with new credentials",
    path: "quiz",
  },
  {
    id: "REG-002",
    area: "Registration",
    title: "Registration rejects duplicate email",
    priority: "P0",
    roles: ["adult", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Attempt free register / unlock with an email that already exists (e.g. a prior test account)",
      "Confirm clear error (account exists / use sign in)",
      "Sign in with that email instead — succeeds",
    ],
    expected: "No silent overwrite; user guided to sign in",
    path: "join",
  },
  {
    id: "REG-003",
    area: "Registration",
    title: "Registration rejects weak / mismatched password",
    priority: "P1",
    roles: ["adult", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open free account / unlock form",
      "Try password shorter than minimum → blocked with message",
      "Try mismatched confirm password (if UI has confirm) → blocked",
      "Complete with a valid password → success",
    ],
    expected: "Client and/or API enforce password rules; valid path still works",
    path: "join",
  },
  {
    id: "REG-004",
    area: "Registration",
    title: "Kids parent registration stores pending consent (no child password)",
    priority: "P0",
    roles: ["kid", "qa", "admin"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Kids & Teens → Kids → Join → Join Kids Corner GYSH Team with child first name + parent email (and child email if required)",
      "Confirm kids are not asked for address/phone or a child password",
      "Confirm pending state until parent approves",
      "Admin: confirm signup row appears (Junior signups / Users) if available",
    ],
    expected: "Pending kids signup stored safely; parental gate required",
    path: "kids",
  },
  {
    id: "REG-005",
    area: "Registration",
    title: "Teens registration requires distinct parent email",
    priority: "P0",
    roles: ["junior", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Kids & Teens → Teens → Join → Join Teens: submit with junior email === parent email → expect rejection",
      "Resubmit with distinct parent email → pending success",
    ],
    expected: "API/UI enforces distinct parent guardian email",
    path: "kids",
  },
  {
    id: "REG-006",
    area: "Registration",
    title: "Join page Create account / Join and Sign in reach signup or login",
    priority: "P1",
    roles: ["all", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Join GYSH",
      "Click Create account / Join → confirm Membership Sign-up UI loads",
      "From Join, click Sign in → confirm Login loads",
      "From Login, use New here? → Join GYSH if present (opens Membership Sign-up; round-trip via Back to plans / Join as available)",
    ],
    expected: "Join ↔ Sign-up ↔ Login navigation is clear for new members",
    path: "join",
  },
  {
    id: "REG-007",
    area: "Registration",
    title: "Senior / adult Join membership path explains Free → Elite",
    priority: "P1",
    roles: ["adult", "senior", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Join (membership plans are on this page — no separate Membership nav item)",
      "Confirm Free through Elite tiers visible with senior pricing note where applicable",
      "Confirm consulting / credits copy is readable",
    ],
    expected: "Registration/membership story matches live pricing; no broken Join CTAs",
    path: "join",
  },
  {
    id: "BP-001",
    area: "Blueprint",
    title: "Logged-out wizard preview → free register unlocks Blueprint",
    priority: "P0",
    roles: ["adult", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Complete Adult Match Wizard logged out → see preview / unlock panel",
      "Create free account",
      "Confirm full Blueprint content (not preview-only)",
      "Refresh; Blueprint still available while session active",
    ],
    expected: "Unlock flow is the primary adult registration conversion path",
    path: "quiz",
  },
  {
    id: "BP-002",
    area: "Blueprint",
    title: "Existing member can claim pending Blueprint after login",
    priority: "P1",
    roles: ["adult", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Start Match Wizard logged out → finish to pending Blueprint",
      "Sign in with an existing free/admin account instead of registering new",
      "Confirm Blueprint claims/saves to that account",
    ],
    expected: "Login path claims pending Blueprint without forcing a second account",
    path: "quiz",
  },
  {
    id: "BP-003",
    area: "Blueprint",
    title: "Kids/Teens Blueprint path respects parent coach unlock",
    priority: "P1",
    roles: ["kid", "junior", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Run Kids or Teens Match Wizard to results",
      "Follow unlock / parent account path shown in UI",
      "Confirm child is not asked for adult payment details",
      "Confirm unlock messaging mentions parent/coach where appropriate",
    ],
    expected: "Family unlock path is safe and understandable for parents",
    path: "kids",
  },

  // External proofread — pages + every guide + Complete Guide (Tina/Lyriq pairs → Backlog)
  ...PROOFREAD_CASES,

  // Exhaustive Get Your Side Hustle option paths (Vitest-owned matrix)
  ...WIZARD_SCENARIO_CASES,
];

/** All catalog cases with Open [Page](/path) injected into step 1 when `path` is set. */
export const TEST_CASES: TestCase[] = TEST_CASES_RAW.map(withPageLinkInFirstStep);

export const SUITE_LABELS: Record<TestSuite, string> = {
  manual: "Manual QA",
  vitest: "Vitest",
  playwright: "Playwright",
};

export type GeneratedTestCase = {
  id: string;
  area: string;
  title: string;
  priority: Priority;
  suite: TestSuite;
  steps: string[];
  expected: string;
  failureDetail: string;
  fixSteps: string[];
  severity: Priority;
  sourceFile: string;
};

export type TestStatusesPayload = {
  statuses: Record<string, TestStatus>;
  notes: Record<string, string>;
  assignees: Record<string, string>;
  sprints: Record<string, number>;
  /** MM/DD/YY per case */
  dueDates: Record<string, string>;
  checkedSteps: Record<string, boolean[]>;
  failedStepIndex: Record<string, number | null>;
  /** Who assigned the case (System until a human reassigns). */
  assignedBy: Record<string, string>;
  /** MM/DD/YY when Assigned By was set / last reassigned. */
  dateAssigned: Record<string, string>;
  updatedAt: Record<string, string>;
  updatedBy: Record<string, string>;
  attachments: Record<string, TestAttachmentMeta[]>;
  generatedCases: GeneratedTestCase[];
};

function mapStatusesResponse(data: {
  statuses?: Record<string, TestStatus>;
  notes?: Record<string, string>;
  assignees?: Record<string, string>;
  sprints?: Record<string, number>;
  dueDates?: Record<string, string>;
  checkedSteps?: Record<string, boolean[]>;
  failedStepIndex?: Record<string, number | null>;
  assignedBy?: Record<string, string>;
  dateAssigned?: Record<string, string>;
  updatedAt?: Record<string, string>;
  updatedBy?: Record<string, string>;
  attachments?: Record<string, TestAttachmentMeta[]>;
  generatedCases?: GeneratedTestCase[];
}): TestStatusesPayload {
  return {
    statuses: data.statuses ?? {},
    notes: data.notes ?? {},
    assignees: data.assignees ?? {},
    sprints: data.sprints ?? {},
    dueDates: data.dueDates ?? {},
    checkedSteps: data.checkedSteps ?? {},
    failedStepIndex: data.failedStepIndex ?? {},
    assignedBy: data.assignedBy ?? {},
    dateAssigned: data.dateAssigned ?? {},
    updatedAt: data.updatedAt ?? {},
    updatedBy: data.updatedBy ?? {},
    attachments: data.attachments ?? {},
    generatedCases: (data.generatedCases ?? []).map((c) => ({
      ...c,
      priority: (c.priority as Priority) || "P1",
      suite: (c.suite as TestSuite) || "vitest",
      severity: (c.severity as Priority) || "P1",
      steps: Array.isArray(c.steps) ? c.steps : [],
      fixSteps: Array.isArray(c.fixSteps) ? c.fixSteps : [],
    })),
  };
}

export async function fetchTestStatuses(): Promise<TestStatusesPayload> {
  const data = await api<Parameters<typeof mapStatusesResponse>[0]>("test-statuses");
  return mapStatusesResponse(data);
}

export async function saveTestStatus(
  id: string,
  status: TestStatus,
  note = "",
  assignee = "",
  sprint = 0,
  opts?: {
    checkedSteps?: boolean[];
    failedStepIndex?: number | null;
    stepCount?: number;
    dueDate?: string;
    assignedBy?: string;
    dateAssigned?: string;
  },
): Promise<TestStatusesPayload> {
  const data = await api<Parameters<typeof mapStatusesResponse>[0]>("test-statuses", {
    method: "PUT",
    body: {
      caseId: id,
      status,
      note,
      assignee,
      sprint,
      ...(opts?.dueDate !== undefined ? { dueDate: opts.dueDate } : {}),
      ...(opts?.assignedBy !== undefined ? { assignedBy: opts.assignedBy } : {}),
      ...(opts?.dateAssigned !== undefined ? { dateAssigned: opts.dateAssigned } : {}),
      checkedSteps: opts?.checkedSteps,
      failedStepIndex: opts?.failedStepIndex ?? null,
      stepCount: opts?.stepCount ?? 0,
    },
  });
  return mapStatusesResponse(data);
}

export async function saveTestStatusesBatch(
  items: Array<{
    caseId: string;
    status: TestStatus;
    note?: string;
    assignee?: string;
    sprint?: number;
    dueDate?: string;
    assignedBy?: string;
    dateAssigned?: string;
    checkedSteps?: boolean[];
    failedStepIndex?: number | null;
    stepCount?: number;
  }>,
): Promise<TestStatusesPayload> {
  if (items.length === 0) {
    return fetchTestStatuses();
  }
  const data = await api<Parameters<typeof mapStatusesResponse>[0]>("test-statuses", {
    method: "PUT",
    body: { items },
  });
  return mapStatusesResponse(data);
}

export async function uploadTestEvidence(input: {
  caseId: string;
  name: string;
  mimeType: string;
  contentBase64: string;
}): Promise<TestAttachmentMeta> {
  const data = await api<{ attachment: TestAttachmentMeta }>("test-attachments", {
    method: "POST",
    body: input,
  });
  return data.attachment;
}

export async function deleteTestEvidence(id: string): Promise<void> {
  await api("test-attachments", { method: "DELETE", body: { id } });
}

export async function fetchTestEvidenceContent(id: string): Promise<{
  name: string;
  mimeType: string;
  contentBase64: string;
}> {
  return api(`test-attachments?id=${encodeURIComponent(id)}`);
}

export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const i = result.indexOf(",");
      resolve(i >= 0 ? result.slice(i + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

export async function resetTestStatuses(confirmReset?: string): Promise<void> {
  await api("test-statuses", {
    method: "DELETE",
    body: { confirmReset: confirmReset ?? "" },
  });
}

export type AutomatedSuite = "vitest" | "playwright" | "all";

export type AutomatedRunMode = "all" | "new";

export type AutomatedTestRunResult = {
  ok: boolean;
  runId: string;
  suite: AutomatedSuite;
  mode?: AutomatedRunMode;
  sprint?: number;
  summary: string;
  details: string[];
  updatedCases: number;
  createdFailureCases?: string[];
  commands: { vitest: string; playwright: string; report?: string };
};

export async function runAutomatedSuite(
  suite: AutomatedSuite,
  mode: AutomatedRunMode = "new",
): Promise<AutomatedTestRunResult> {
  return api<AutomatedTestRunResult>("automated-tests/run", {
    method: "POST",
    body: { suite, mode },
  });
}

export async function fetchAutomatedTestRuns(): Promise<{
  runs: Array<{
    id: string;
    suite: string;
    status: string;
    summary: string;
    details: string[];
    startedAt: string;
    finishedAt: string | null;
    startedBy: string | null;
  }>;
}> {
  return api("automated-tests/runs");
}

export function testerCaseCount(testerId: TestOwnerId, cases: TestCase[]): number {
  return cases.filter((t) => t.assignees.includes(testerId)).length;
}

export function withDefaultSuite(cases: TestCase[]): Array<TestCase & { suite: TestSuite }> {
  return cases.map((t) => ({ ...t, suite: t.suite ?? "manual" }));
}
