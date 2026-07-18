/** GYSH Testing Portal — declarative test plan */

import type { QaTesterId } from "./gysh-roles";
import { api } from "./api";
import { WIZARD_SCENARIO_CASES } from "./gysh-wizard-scenarios";

export type TestSuite = "manual" | "vitest" | "playwright";

export type TestStatus =
  | "not_run"
  | "in_progress"
  | "pass"
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
  not_run: "Not Run",
  in_progress: "In Progress",
  pass: "Pass",
  fail: "Fail",
  blocked: "Blocked",
};

/** Fail and Blocked require a short written note in the Testing Portal / API. */
export const NOTE_REQUIRED_STATUSES: TestStatus[] = ["fail", "blocked"];
export const NOTE_MIN_LENGTH = 8;

export function statusRequiresNote(status: TestStatus): boolean {
  return NOTE_REQUIRED_STATUSES.includes(status);
}

export function noteMeetsRequirement(note: string): boolean {
  return note.trim().length >= NOTE_MIN_LENGTH;
}

export type TestCase = {
  id: string;
  area: string;
  title: string;
  priority: Priority;
  roles: Array<"admin" | "qa" | "kid" | "junior" | "adult" | "senior" | "all">;
  /** Who owns this case in the Testing Portal (T / E / Lyriq). */
  assignees: QaTesterId[];
  /** manual = human QA; vitest / playwright = automated suites */
  suite?: TestSuite;
  steps: string[];
  expected: string;
  path?: string;
};

/** High-level categories for portal filtering (groups related areas). */
export type TestCategory =
  | "auth_access"
  | "navigation_brand"
  | "kids_junior"
  | "seniors"
  | "adult_hustles"
  | "content_workshops"
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
  content_workshops: "Content & Workshops",
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
  "content_workshops",
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
  switch (t.area) {
    case "Auth":
    case "Join":
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
    case "Contact":
      return "content_workshops";
    case "Admin":
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
      return "automated";
    default:
      return "admin_ops";
  }
}

export const TEST_CASES: TestCase[] = [
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
      "Enter tinabarham@gmail.com / Admin123 (or evelyn3@cox.net / Admin)",
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
    title: "Login page New here? link opens Join GYSH",
    priority: "P1",
    roles: ["all"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Login",
      "Click New here? → Join GYSH",
    ],
    expected: "Page title becomes Join GYSH; Join hero and Create account / Sign in CTA visible",
    path: "login",
  },
  {
    id: "AUTH-005",
    area: "Auth",
    title: "Password reset mode shows current/new/confirm fields",
    priority: "P1",
    roles: ["admin", "qa"],
    assignees: ["tina"],
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
    title: "Join GYSH page shows member + Kids/Junior team paths",
    priority: "P0",
    roles: ["all"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Join from header (or footer)",
      "Confirm Join GYSH hero and Create account / Sign in CTA",
      "Confirm Browse GYSH Community and Kids Corner teams CTAs",
      "Confirm Kids Corner GYSH Team and Junior Side Hustle Team cards with ages + perk bullets",
    ],
    expected: "Join page is the signup hub; kids/junior teams and adult portal paths are clear",
    path: "join",
  },
  {
    id: "JOIN-002",
    area: "Join",
    title: "Join CTAs open Login, Community, and Kids Corner",
    priority: "P0",
    roles: ["all"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "On Join: click Create account / Sign in → confirm Login / Portal Access view",
      "Return to Join → Browse GYSH Community first → confirm Community hub",
      "Return to Join → Kids Corner teams (or Open Kids Corner) → confirm Kids Corner",
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
      "Click Home, Find Mine, Kids/Juniors Corner, Seniors, Guides (Some Free banner), Workshops, Community, Join, About, Contact Us",
      "Confirm each view title updates",
      "Confirm Membership is not a separate top-nav item (plans live on Join)",
    ],
    expected: "Every top-nav item opens the correct page; Home is first; Guides then Workshops sit after Seniors; Join includes membership plans",
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
      "Confirm join CTAs and Kids/Junior team cards appear above membership plans",
      "Confirm Free / Starter / Pro / Elite cards and schedule suite callout",
      "Switch audience tabs: Adult, Senior, Kids, Juniors",
      "On Kids and Juniors, confirm parent-funded credit packs and credit earn sections appear",
      "Confirm credit packs list 25 / $5, 60 / $10, 140 / $20, and 300 / $40",
      "Scan a la carte price table for the selected audience",
    ],
    expected: "Join loads with membership section; Kids/Juniors show credit funding and earning; Pro unlocks schedule suite messaging",
    path: "join",
  },
  {
    id: "SENIOR-001",
    area: "Senior Side Hustles",
    title: "Senior Side Hustles page shows opportunities, guides teaser, and join",
    priority: "P1",
    roles: ["adult", "admin", "qa"],
    assignees: ["evelyn", "tina"],
    suite: "manual",
    steps: [
      "Open Seniors from top nav (or home Seniors bubble / CTA)",
      "Confirm intro welcomes 55+ / retirees & flexible schedules without infantilizing tone",
      "Browse Side Hustle Ideas, Guides, and Join Senior Team tabs",
    ],
    expected: "Page title is GYSH Seniors Corner; tabs work; Join can mark interest or link to Join",
    path: "seniors",
  },
  {
    id: "SENIOR-002",
    area: "Senior Side Hustles",
    title: "Senior Join Team marks interest and offers Create free GYSH account",
    priority: "P1",
    roles: ["adult", "admin", "qa"],
    assignees: ["lyriq"],
    suite: "manual",
    steps: [
      "Open Seniors → Join Senior Team as guest",
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
      "Open Side Hustle Checklist from top nav (after Launch Guides)",
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
    title: "Kids Side Hustle Corner shows Kevina bio + YouTube embeds",
    priority: "P0",
    roles: ["kid", "admin", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Kids Corner",
      "Select Kids Side Hustle Corner tab",
      "Confirm Kevina Starr bio from YouTube About is visible",
      "Play a featured story embed",
    ],
    expected: "Bio matches channel About text; embeds play; Subscribe links open YouTube",
    path: "kids",
  },
  {
    id: "KIDS-002",
    area: "Kids Corner",
    title: "Kids (4–12) + Junior (13–17) modes: Get Your Side Hustle, Side Hustle Ideas, Piggy Bank",
    priority: "P1",
    roles: ["junior", "admin", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Kids/Juniors Corner → Kids (Ages 4–12) → Stories bubble next to Ages scrolls down to Featured Stories",
      "Confirm Get Your Side Hustle, Side Hustle Ideas, Piggy Bank, Guides, Join the Team tabs (Stories lives next to Ages, not in the tab bar)",
      "Open Guides → free guides fully visible; member guides show preview + Join to unlock",
      "Open Join the Team → Kids Corner GYSH Team copy + parental consent signup form",
      "Switch to Juniors (Ages 13–17) → Get Your Side Hustle + Side Hustle Ideas + My Bank + Guides + Join the Team (no Welcome tab); Join button says Join Juniors",
    ],
    expected: "Age modes clear; Stories sits beside Ages 4–12; Guides free vs gated; Junior has no Welcome tab; Join uses parental consent signup",
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
      "Open Kids/Juniors Corner → Guides as guest → confirm free guides show all steps",
      "Open a Members guide → see steps 1–2 + lock overlay",
      "Complete parental consent signup OR sign in → confirm full guide unlocks when approved/member",
    ],
    expected: "Gating works; logged-in GYSH members also unlock without local team join",
    path: "kids",
  },
  {
    id: "KIDS-004",
    area: "Kids Corner",
    title: "Kids (4–12) Join the Team: parental consent signup",
    priority: "P0",
    roles: ["kid", "admin", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Kids/Juniors Corner → Kids Side Hustle (Ages 4–12) → Join the Team (clear site data if already a member)",
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
    title: "Junior (13–17) Join the Team: parental consent signup",
    priority: "P0",
    roles: ["junior", "admin", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Kids/Juniors Corner → Junior Side Hustle (Ages 13–17) → Join the Team",
      "Submit junior name + email + parent email",
      "Confirm pending-parent messaging",
    ],
    expected: "Junior signup requires distinct parent email and stays inactive until parent grants permission",
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
    assignees: ["tina"],
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
    title: "Find Mine age selector → Adult Side Hustle Wizard returns ranked matches",
    priority: "P1",
    roles: ["adult", "admin", "qa"],
    assignees: ["evelyn"],
    suite: "manual",
    steps: [
      "Open Find Mine",
      "Confirm age-group selector shows Kids / Junior / Adult / Senior Side Hustle Wizard cards",
      "Click Adult Side Hustle Wizard",
      "Answer budget/time",
      "Select up to 2 ranked strengths",
      "Select 2+ ranked goals",
      "View ranked results",
    ],
    expected: "Age selector first; Adult wizard then shows ranked list best→lower with match %",
    path: "quiz",
  },
  {
    id: "FREE-001",
    area: "Free Guides",
    title: "Guides library filters All / Free / Adult-Senior / Kids / Junior (spot-check)",
    priority: "P2",
    roles: ["all", "qa"],
    assignees: ["tina"],
    suite: "manual",
    steps: [
      "Open Free in the header after deploy",
      "Spot-check filter chips look correct on mobile + desktop",
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
  },
  // Exhaustive Get Your Side Hustle option paths (Tina = all Kids+Junior)
  ...WIZARD_SCENARIO_CASES,
];

export const SUITE_LABELS: Record<TestSuite, string> = {
  manual: "Manual QA",
  vitest: "Vitest",
  playwright: "Playwright",
};

export async function fetchTestStatuses(): Promise<{
  statuses: Record<string, TestStatus>;
  notes: Record<string, string>;
  assignees: Record<string, string>;
  sprints: Record<string, number>;
}> {
  const data = await api<{
    statuses: Record<string, TestStatus>;
    notes?: Record<string, string>;
    assignees?: Record<string, string>;
    sprints?: Record<string, number>;
  }>("test-statuses");
  return {
    statuses: data.statuses ?? {},
    notes: data.notes ?? {},
    assignees: data.assignees ?? {},
    sprints: data.sprints ?? {},
  };
}

export async function saveTestStatus(
  id: string,
  status: TestStatus,
  note = "",
  assignee = "",
  sprint = 0,
): Promise<{
  statuses: Record<string, TestStatus>;
  notes: Record<string, string>;
  assignees: Record<string, string>;
  sprints: Record<string, number>;
}> {
  const data = await api<{
    statuses: Record<string, TestStatus>;
    notes?: Record<string, string>;
    assignees?: Record<string, string>;
    sprints?: Record<string, number>;
  }>("test-statuses", {
    method: "PUT",
    body: { caseId: id, status, note, assignee, sprint },
  });
  return {
    statuses: data.statuses ?? {},
    notes: data.notes ?? {},
    assignees: data.assignees ?? {},
    sprints: data.sprints ?? {},
  };
}

export async function saveTestStatusesBatch(
  items: Array<{
    caseId: string;
    status: TestStatus;
    note?: string;
    assignee?: string;
    sprint?: number;
  }>,
): Promise<{
  statuses: Record<string, TestStatus>;
  notes: Record<string, string>;
  assignees: Record<string, string>;
  sprints: Record<string, number>;
}> {
  if (items.length === 0) {
    return fetchTestStatuses();
  }
  const data = await api<{
    statuses: Record<string, TestStatus>;
    notes?: Record<string, string>;
    assignees?: Record<string, string>;
    sprints?: Record<string, number>;
  }>("test-statuses", {
    method: "PUT",
    body: { items },
  });
  return {
    statuses: data.statuses ?? {},
    notes: data.notes ?? {},
    assignees: data.assignees ?? {},
    sprints: data.sprints ?? {},
  };
}

export async function resetTestStatuses(): Promise<void> {
  await api("test-statuses", { method: "DELETE" });
}

export type AutomatedSuite = "vitest" | "playwright" | "all";

export type AutomatedTestRunResult = {
  ok: boolean;
  runId: string;
  suite: AutomatedSuite;
  summary: string;
  details: string[];
  updatedCases: number;
  commands: { vitest: string; playwright: string };
};

export async function runAutomatedSuite(suite: AutomatedSuite): Promise<AutomatedTestRunResult> {
  return api<AutomatedTestRunResult>("automated-tests/run", {
    method: "POST",
    body: { suite },
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

export function testerCaseCount(testerId: QaTesterId, cases: TestCase[]): number {
  return cases.filter((t) => t.assignees.includes(testerId)).length;
}

export function withDefaultSuite(cases: TestCase[]): Array<TestCase & { suite: TestSuite }> {
  return cases.map((t) => ({ ...t, suite: t.suite ?? "manual" }));
}
