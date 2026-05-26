// ============================================================================
// THE MEDICARE OPTIMIZER — TEST PLAN, IMPLEMENTATION PLAN, SPRINTS, TASKS
// ----------------------------------------------------------------------------
// This file is the single source of truth for the /testing portal.
// As new functionality ships, ADD a new TestCase here so it shows up in the
// portal automatically. Test-run status (Pass/Fail/Blocked) lives in
// localStorage keyed by the test id, so this file stays purely declarative.
// ============================================================================

export type TestStatus =
  | "not_run"
  | "pass"
  | "fail"
  | "blocked"
  | "fixed_retest"   // Dev marked fixed, awaiting QA retest
  | "failed_retest"; // Dev attempted fix, QA retest still failing
export type Priority = "P0" | "P1" | "P2" | "P3";

// Human-readable labels for priority codes. Underlying codes (P0..P3) stay
// stable so localStorage / CSV exports are unaffected; only the UI changes.
export const PRIORITY_LABELS: Record<Priority, string> = {
  P0: "Severe (Show Stopper)",
  P1: "High (w/i 24h)",
  P2: "Medium (Can wait)",
  P3: "Low (Non-Priority)",
};
export const PRIORITY_SHORT: Record<Priority, string> = {
  P0: "Severe",
  P1: "High",
  P2: "Medium",
  P3: "Low",
};

export interface TestCase {
  id: string;           // stable ID, also the localStorage key
  area: string;         // grouping (Auth, Intake, Voice, …)
  title: string;
  priority: Priority;
  preconditions?: string;
  steps: string[];
  expected: string;
  notes?: string;
  assignee?: string;    // Optional explicit override; otherwise derived (see getTestAssignee)
  sprintId?: string;    // Optional explicit override; otherwise active sprint (see getTestSprintId)
  path?: string;        // Optional explicit link target (route or URL). Auto-derived from steps if omitted.
}

export interface PhaseItem {
  name: string;
  status: "done" | "in_progress" | "planned";
  description: string;
  shippedOn?: string;   // ISO date
}

export interface SprintItem {
  id: string;
  title: string;
  type: "feature" | "bug" | "infra" | "test" | "design";
  status: "done" | "in_progress" | "todo" | "blocked";
  owner?: string;
}

export interface Sprint {
  id: string;
  number: number;
  name: string;
  start: string;        // ISO date
  end: string;          // ISO date
  goal: string;
  items: SprintItem[];
}

export interface Task {
  id: string;
  title: string;
  area: string;
  status: "done" | "in_progress" | "todo" | "blocked";
  priority: Priority;
  notes?: string;
}

// ----------------------------------------------------------------------------
// TEST CASES — one entry per piece of functionality. Add new ones as you ship.
// ----------------------------------------------------------------------------
export const TEST_CASES: TestCase[] = [
  // ===== Auth =====
  {
    id: "AUTH-001", area: "Auth", priority: "P0",
    title: "User can sign up with email + password",
    steps: ["Open /auth", "Switch to Sign-up tab", "Enter unique email + password ≥ 8 chars", "Click Sign up"],
    expected: "Account is created, profile row exists, user lands logged-in.",
  },
  {
    id: "AUTH-002", area: "Auth", priority: "P0",
    title: "User can log in with valid credentials",
    steps: ["Open /auth", "Enter existing email + password", "Click Sign in"],
    expected: "User is redirected to /advisor (or last-visited route) and session persists on reload.",
  },
  {
    id: "AUTH-003", area: "Auth", priority: "P1",
    title: "User can request password reset",
    steps: ["On /auth click 'Forgot password'", "Enter email", "Submit"],
    expected: "Reset email is sent (or toast confirms request)."
  },
  {
    id: "AUTH-004", area: "Auth", priority: "P1",
    title: "Logged-out user is gated from /admin and /agent",
    steps: ["Open an incognito window", "Visit /admin", "Visit /agent"],
    expected: "User is redirected to /auth.",
  },

  // ===== Landing / SEO =====
  {
    id: "HOME-001", area: "Landing", priority: "P1",
    title: "Landing page renders hero + CTA",
    steps: ["Open /"],
    expected: "Hero headline visible, sub-heading 'You Deserve The Best Medicare Plan…' shown centered, CTA to build a scenario is clickable.",
  },
  {
    id: "HOME-002", area: "Landing", priority: "P2",
    title: "Font-size toggle in app shell scales text",
    steps: ["Click + / − in the top-right font toggle", "Observe rem-scaled text"],
    expected: "Body text grows/shrinks across steps; size persists on reload (localStorage key font-scale).",
  },

  // ===== Intake — Manual wizard =====
  {
    id: "INTAKE-001", area: "Intake · Manual", priority: "P0",
    title: "Step 1 — birth year, ZIP3, county required",
    steps: ["Open /scenario/new", "Leave birth year empty", "Click Next"],
    expected: "Toast 'Please select your year of birth before continuing.' appears.",
  },
  {
    id: "INTAKE-002", area: "Intake · Manual", priority: "P0",
    title: "County dropdown auto-populates from ZIP3",
    steps: ["Enter ZIP3 '770'", "Observe county field"],
    expected: "County becomes a <select> listing all counties for that ZIP3; single-county ZIPs auto-select.",
  },
  {
    id: "INTAKE-003", area: "Intake · Manual", priority: "P1",
    title: "Unknown ZIP3 shows error and allows free-text county",
    steps: ["Enter ZIP3 '999' (not in lookup)", "Observe county field"],
    expected: "Red 'We don't recognize ZIP prefix 999' message; county becomes a text Input.",
  },
  {
    id: "INTAKE-004", area: "Intake · Manual", priority: "P1",
    title: "Cost preference toggle switches label and value",
    steps: ["Go to Step 2", "Toggle the switch"],
    expected: "Label flips between 'Minimize monthly cost' and 'Predictability matters more'.",
  },
  {
    id: "INTAKE-005", area: "Intake · Manual", priority: "P1",
    title: "Conditions multi-select — 'Other' opens free-text input",
    steps: ["Step 3", "Toggle 'Other'", "Type 'Glaucoma' and press Enter"],
    expected: "Glaucoma chip appears with × to remove; selection persists to summary on Step 4.",
  },

  // ===== Intake — Medications =====
  {
    id: "MED-001", area: "Intake · Meds", priority: "P0",
    title: "Medication search — local catalog hit",
    steps: ["Step 4", "Type 'metf' in drug search", "Click Metformin in dropdown"],
    expected: "Drug name, strength, form, frequency, retail cost auto-fill; coverage_uncertain is false (no warning chip).",
  },
  {
    id: "MED-002", area: "Intake · Meds", priority: "P0",
    title: "Medication search — RxNorm fallback with coverage warning",
    steps: ["Type a drug not in catalog, e.g. 'rosuvastatin'", "Wait ~300ms for RxNorm section", "Pick a RxNorm result"],
    expected: "Drug name fills in (stripped of dose annotations); amber 'Not in our pricing catalog' chip appears; generic equivalent loads asynchronously.",
  },
  {
    id: "MED-003", area: "Intake · Meds", priority: "P1",
    title: "Generic equivalent message — none available",
    steps: ["Pick a brand-only drug via RxNorm where no generic exists"],
    expected: "Chip says 'No generic equivalent available — this is a brand-only drug.'",
  },
  {
    id: "MED-004", area: "Intake · Meds", priority: "P1",
    title: "Dosage form dropdown — full list selectable",
    steps: ["Open form dropdown", "Select Inhaler"],
    expected: "Selection persists; unknown values default to 'Other'.",
  },
  {
    id: "MED-005", area: "Intake · Meds", priority: "P1",
    title: "Frequency dropdown — legacy 'Daily' maps to 'Once daily'",
    steps: ["Pick a catalog drug with freq 'Daily'"],
    expected: "Dropdown shows 'Once daily' selected.",
  },
  {
    id: "MED-006", area: "Intake · Meds", priority: "P2",
    title: "Monthly retail cost field — label visible, editable",
    steps: ["Inspect the cost column on a med card"],
    expected: "Small 'Monthly retail cost ($)' label sits above the number input; tooltip explains source.",
  },
  {
    id: "MED-007", area: "Intake · Meds", priority: "P0",
    title: "Scenario creation — RPC returns a code",
    steps: ["Complete steps 1–4 with valid data", "Click Create scenario"],
    expected: "Toast 'Scenario created'; redirected to /scenario/created/<code> where code matches SCN-YYYY-XXXX-XXXX.",
  },

  // ===== Voice on every field =====
  {
    id: "VOICE-001", area: "Voice · Inputs", priority: "P1",
    title: "Mic button appears next to text inputs (Chrome/Edge/Safari)",
    steps: ["Open /scenario/new", "Inspect drug search, strength, county, conditions, resolved-condition inputs"],
    expected: "Each shows a 🎤 button plus an A-Z spell toggle. Hidden in browsers without Web Speech API.",
  },
  {
    id: "VOICE-002", area: "Voice · Inputs", priority: "P1",
    title: "Spell mode — NATO phonetic converts to letters",
    steps: ["Toggle spell mode on the drug search mic", "Say: 'alpha tango oscar romeo'"],
    expected: "Drug input fills with 'ator'.",
  },
  {
    id: "VOICE-003", area: "Voice · Inputs", priority: "P1",
    title: "Voice-select dropdowns map spoken word to closest option",
    steps: ["Click mic next to Frequency dropdown", "Say: 'twice a day'"],
    expected: "Dropdown selects 'Twice daily' (best-match).",
  },
  {
    id: "VOICE-004", area: "Voice · Inputs", priority: "P2",
    title: "Mic permission denied — friendly toast",
    steps: ["In browser settings block mic for the site", "Click any mic"],
    expected: "Toast: 'Microphone permission denied. Enable it in your browser settings.'",
  },

  // ===== Voice wizard =====
  {
    id: "VWIZ-001", area: "Voice · Wizard", priority: "P0",
    title: "Mode toggle switches Manual ↔ Voice on /scenario/new",
    steps: ["Open /scenario/new", "Click 'Voice wizard' pill"],
    expected: "Voice intake card renders; clicking 'Manual form' returns to the original wizard without state loss.",
  },
  {
    id: "VWIZ-002", area: "Voice · Wizard", priority: "P0",
    title: "Wizard speaks intro then asks birth year",
    steps: ["Switch to Voice", "Click Start voice intake"],
    expected: "TTS speaks the intro then 'What year were you born?'; Listening badge pulses.",
  },
  {
    id: "VWIZ-003", area: "Voice · Wizard", priority: "P0",
    title: "Birth year parser accepts numerals and words",
    steps: ["Say 'nineteen fifty'", "Or say '1950'"],
    expected: "Transcript records the answer, wizard advances to ZIP step.",
  },
  {
    id: "VWIZ-004", area: "Voice · Wizard", priority: "P0",
    title: "ZIP digits parsed from spoken numbers",
    steps: ["At ZIP step say 'seven seven zero'"],
    expected: "ZIP3 set to '770'; if multiple counties, wizard lists them aloud.",
  },
  {
    id: "VWIZ-005", area: "Voice · Wizard", priority: "P1",
    title: "Single-county ZIP auto-skips county question",
    steps: ["Use a ZIP3 with exactly one county"],
    expected: "Wizard says 'Got it — <county>' and jumps to gender.",
  },
  {
    id: "VWIZ-006", area: "Voice · Wizard", priority: "P1",
    title: "Yes/No parser handles natural speech",
    steps: ["At tobacco step say 'I don't smoke'"],
    expected: "Tobacco set to false; advances to income.",
  },
  {
    id: "VWIZ-007", area: "Voice · Wizard", priority: "P1",
    title: "Income band matched from natural phrasing",
    steps: ["Say 'about fifty to one hundred thousand'"],
    expected: "Income band set to '$50k–$100k'.",
  },
  {
    id: "VWIZ-008", area: "Voice · Wizard", priority: "P1",
    title: "Conditions loop — adds multiple, exits on 'no more'",
    steps: ["Say 'diabetes', then 'hypertension', then 'no more'"],
    expected: "Both appear in running summary; wizard moves to meds.",
  },
  {
    id: "VWIZ-009", area: "Voice · Wizard", priority: "P1",
    title: "Meds loop — name + strength + 'any more?'",
    steps: ["Say 'metformin', then '500 milligrams', then 'no'"],
    expected: "Med added with mg suffix; catalog auto-fills form/frequency/retail; wizard goes to confirm.",
  },
  {
    id: "VWIZ-010", area: "Voice · Wizard", priority: "P1",
    title: "Manual controls — Repeat, Retry, Type, Skip work",
    steps: ["Click each control during a question"],
    expected: "Repeat re-speaks; Retry restarts listening; Type opens an input that submits as the answer; Skip advances on optional steps and toasts on required ones.",
  },
  {
    id: "VWIZ-011", area: "Voice · Wizard", priority: "P0",
    title: "Confirm + submit creates scenario via same RPC",
    steps: ["At confirm step say 'yes'"],
    expected: "Submitting state shows; on success TTS reads back the scenario ID and onDone navigates to /scenario/created/<code>.",
  },
  {
    id: "VWIZ-012", area: "Voice · Wizard", priority: "P2",
    title: "Unsupported browser fallback",
    steps: ["Open in Firefox (no Web Speech API)"],
    expected: "Card shows 'Voice mode not supported' with a Use manual form button.",
  },

  // ===== Scenario downstream =====
  {
    id: "SCEN-001", area: "Scenario", priority: "P0",
    title: "Created scenario detail page renders by code",
    steps: ["After creation open /scenario/created/<code>"],
    expected: "Page shows the scenario ID, summary card, share button, expert opt-in dialog trigger.",
  },
  {
    id: "ADV-001", area: "Advisor", priority: "P0",
    title: "Advisor can look up scenario by code",
    steps: ["Log in as advisor", "Open /advisor", "Enter the scenario code", "Submit"],
    expected: "Scenario is claimed if unclaimed, shown in dashboard; rate-limited after 10 failed lookups/min.",
  },
  {
    id: "AGT-001", area: "Agent", priority: "P1",
    title: "Agent sees only assigned scenarios",
    steps: ["Log in as agent", "Open /agent"],
    expected: "Only scenarios where assigned_agent_id = my uid are listed.",
  },
  {
    id: "ADM-001", area: "Admin", priority: "P1",
    title: "Admin can assign agent to scenario",
    steps: ["Log in as admin", "Open /admin", "Pick a scenario", "Assign an agent"],
    expected: "scenarios.assigned_agent_id updates; audit log row inserted.",
  },
  {
    id: "EXP-001", area: "Expert opt-in", priority: "P1",
    title: "Expert contact request submits",
    steps: ["Open scenario detail", "Click 'Talk to a licensed expert'", "Enter valid email + phone", "Submit"],
    expected: "Row inserted into expert_contact_requests; wants_contact flag flips true on the scenario; toast confirms.",
  },
  {
    id: "EXP-002", area: "Expert opt-in", priority: "P2",
    title: "Expert dialog blocks invalid email / phone",
    steps: ["Submit with 'foo' as email"],
    expected: "Toast 'Enter a valid email'; nothing inserted.",
  },
  {
    id: "PDF-001", area: "Exports", priority: "P2",
    title: "Scenario PDF download",
    steps: ["On a scenario detail page click Download PDF"],
    expected: "PDF file downloads with summary, conditions, medications.",
  },
  {
    id: "XLSX-001", area: "Exports", priority: "P2",
    title: "Scenario XLSX download",
    steps: ["Click Download XLSX"],
    expected: "Multi-sheet workbook downloads cleanly.",
  },

  // ===== Testing portal (meta) =====
  {
    id: "CMS-016", area: "CMS Compliance", priority: "P1",
    title: "Medicare & You Handbook deep link on scenario page",
    steps: [
      "Create a scenario and land on /scenario/created/<code>",
      "Click 'Download Medicare & You Handbook (PDF)'",
    ],
    expected: "Opens https://www.medicare.gov/Pubs/pdf/10050-Medicare-and-You.pdf in a new tab and the PDF downloads.",
    notes: "Official CMS publication 10050 — direct deep link, no intermediate page.",
  },

  // ===== CMS Compliance & Disclaimers =====
  {
    id: "CMS-001", area: "CMS Compliance", priority: "P0",
    title: "Not-affiliated-with-CMS disclaimer in footer",
    steps: ["Open any public page", "Scroll to footer"],
    expected: "Footer contains 'Not affiliated with or endorsed by Medicare, CMS, or any government agency.' visible on every route.",
    notes: "CMS Marketing Guidelines require third-party marketing org disclaimers (42 CFR §422.2267).",
  },
  {
    id: "CMS-002", area: "CMS Compliance", priority: "P0",
    title: "Multi-Plan Disclaimer (MPD) on plan-comparison output",
    steps: ["Generate scenario recommendations", "Inspect the plan list header"],
    expected: "Displays 'We do not offer every plan available in your area. Any information we provide is limited to those plans we do offer in your area. Please contact Medicare.gov or 1-800-MEDICARE to get information on all of your options.'",
    notes: "Required MPD language per CMS Communications & Marketing Guidelines.",
  },
  {
    id: "CMS-003", area: "CMS Compliance", priority: "P0",
    title: "Pricing-estimate disclaimer on cost projections",
    steps: ["View any annual cost / Part D total in scenario output or PDF/XLSX export"],
    expected: "An adjacent note states figures are estimates based on CMS 2026 parameters and retail/WAC pricing, not a quote, and actual costs depend on the plan and pharmacy chosen. Source links to CMS resolve.",
  },
  {
    id: "CMS-004", area: "CMS Compliance", priority: "P0",
    title: "Drug-price sourcing visible on every med line",
    steps: ["Open /sources", "Hover the monthly retail cost tooltip on a med card"],
    expected: "/sources lists CMS Drug Spending Dashboard, GoodRx, manufacturer WAC links; tooltip cites the source used for that drug.",
  },
  {
    id: "CMS-005", area: "CMS Compliance", priority: "P1",
    title: "No prohibited superlatives ('best', '#1', 'free')",
    steps: ["Grep rendered marketing copy on /, /scenario/new, plan results"],
    expected: "No unqualified use of 'best Medicare plan', 'free', '#1 plan', or 'all plans'. Hero copy 'You Deserve The Best Medicare Plan' is framed as user aspiration, not a plan claim — verify wording stays compliant.",
    notes: "CMS prohibits absolute/superlative marketing claims about plans.",
  },
  {
    id: "CMS-006", area: "CMS Compliance", priority: "P0",
    title: "TPMO (Third-Party Marketing Org) disclaimer on lead capture",
    steps: ["Open expert opt-in dialog", "Open any 'Talk to a licensed agent' CTA"],
    expected: "TPMO disclaimer text and SOA (Scope of Appointment) reference shown before submission; consent checkbox required.",
  },
  {
    id: "CMS-007", area: "CMS Compliance", priority: "P0",
    title: "Scope of Appointment captured before agent contact",
    steps: ["As admin, assign agent", "As agent, attempt to record a sales discussion"],
    expected: "System blocks the discussion until an SOA with product types (MA/PDP/Medigap) and timestamp is on file; audit row inserted.",
  },
  {
    id: "CMS-008", area: "CMS Compliance", priority: "P1",
    title: "Call recording / consent notice (if voice wizard transmits audio)",
    steps: ["Start voice wizard"],
    expected: "Intro TTS or visible notice states audio is processed locally in the browser via Web Speech API and not stored, OR a recording-consent prompt is shown before listening starts.",
  },
  {
    id: "CMS-009", area: "CMS Compliance", priority: "P0",
    title: "Non-discrimination + language assistance notice",
    steps: ["Open footer / sources page"],
    expected: "Section 1557 non-discrimination notice and taglines for top 15 languages OR a link to a page containing them is reachable from every page.",
  },
  {
    id: "CMS-010", area: "CMS Compliance", priority: "P1",
    title: "Star Ratings shown with year and source",
    steps: ["Open admin Plan catalog → expand any MA / PDP carrier"],
    expected: "Star rating cites the contract year (e.g. '2026 Star Rating') and links to medicare.gov/plan-compare or CMS Star Ratings page.",
  },
  {
    id: "CMS-011", area: "CMS Compliance", priority: "P1",
    title: "Part D 2026 redesign assumptions disclosed",
    steps: ["Open /sources", "Open any Part D cost output"],
    expected: "Notes that $2,000 OOP cap, elimination of coverage gap, and $35 insulin cap reflect IRA / CMS 2026 Part D redesign with link to CMS fact sheet.",
  },
  {
    id: "CMS-012", area: "CMS Compliance", priority: "P1",
    title: "PHI / de-identification — no name, DOB, full ZIP, full address stored",
    steps: ["Inspect scenario insert payload + DB row"],
    expected: "Only birth year, ZIP3, county, gender, tobacco, income band, conditions, meds stored; no PII fields present. Verified against schema.",
  },
  {
    id: "CMS-013", area: "CMS Compliance", priority: "P2",
    title: "Material accessibility — font scale + contrast",
    steps: ["Use font-size + toggle", "Run Lighthouse accessibility audit on key pages"],
    expected: "Contrast ≥ 4.5:1 on body text in both font sizes; no a11y errors on /, /scenario/new, /auth.",
  },
  {
    id: "CMS-014", area: "CMS Compliance", priority: "P1",
    title: "Disclaimers appear in exported PDF and XLSX",
    steps: ["Download scenario PDF", "Download scenario XLSX"],
    expected: "Both contain the not-affiliated-with-CMS line, MPD language, and pricing-estimate disclaimer on the first page / first sheet.",
  },
  {
    id: "CMS-015", area: "CMS Compliance", priority: "P2",
    title: "Last-updated stamp on CMS parameter set",
    steps: ["Open /sources or footer"],
    expected: "Shows 'CMS 2026 parameters last reviewed <date>' so users know currency of $202.90 Part B premium, $2,000 Part D OOP, etc.",
  },

  // ===== Testing portal (meta) =====
  {
    id: "TEST-001", area: "Testing portal", priority: "P2",
    title: "Test run status persists across reloads",
    steps: ["Open /testing", "Mark a case as Pass", "Reload"],
    expected: "Status remains Pass (localStorage key test-status:<id>).",
  },

  // ===== Admin notifications + registration email =====
  {
    id: "NOTIF-001", area: "Admin · Notifications", priority: "P1",
    title: "New registration creates an in-app admin notification",
    steps: [
      "Open an incognito window",
      "Register a new user at /register (sign NDA, pick a role)",
      "Sign in as an admin",
      "Click the bell icon in the top-right of the app shell",
    ],
    expected: "A notification appears at the top with title 'New beta registration — <First Last>', body shows email · phone · requested role, unread badge increments on the bell.",
  },
  {
    id: "NOTIF-002", area: "Admin · Notifications", priority: "P2",
    title: "Admin can mark notifications read and delete them",
    steps: [
      "Open the bell dropdown as admin with ≥1 unread notification",
      "Click the check icon on a notification",
      "Click 'Mark all read' on another",
      "Click the trash icon on a third",
    ],
    expected: "Single notification loses its unread highlight and the badge count drops; 'Mark all read' zeroes the badge; deleted row disappears from the list and survives reload.",
  },
  {
    id: "NOTIF-003", area: "Admin · Notifications", priority: "P2",
    title: "Bell updates in realtime without reload",
    steps: [
      "Sign in as admin and open the bell",
      "In a second window, register a new user",
      "Watch the admin bell without reloading",
    ],
    expected: "New notification appears within ~5s (Supabase realtime) and unread badge increments automatically.",
  },
  {
    id: "NOTIF-004", area: "Admin · Notifications", priority: "P2",
    title: "Non-admins cannot see admin notifications",
    steps: [
      "Sign in as an agent or qa user",
      "Inspect the top-right header",
      "Attempt to query admin_notifications from the browser console",
    ],
    expected: "Bell icon is not rendered for non-admins; direct table queries return zero rows due to RLS.",
  },
  {
    id: "EMAIL-001", area: "Registration · Email", priority: "P2",
    title: "Registration triggers Resend notification attempt (sandbox)",
    steps: [
      "Register a new user at /register",
      "Check the server logs for the registerWithNda function",
    ],
    expected: "Resend POST to /resend/emails fires; in sandbox mode delivery only succeeds to the Resend account owner address — non-owner sends are logged but may fail. Registration still completes and the in-app admin notification is created either way.",
  },
];

// ----------------------------------------------------------------------------
// IMPLEMENTATION PLAN — phases. We are currently executing PHASE 1, a 4-week
// effort delivered as four 1-week sprints (Sprint 0 → Sprint 3). Final
// production go-live lands at the end of Sprint 3 (Sunday 6/14). Beta with
// public registration opens mid-Sprint 1 on Wednesday 5/27 (alpha closes
// Tuesday 5/26 at midnight). Later phases pick up after Phase 1 ships.
// ----------------------------------------------------------------------------
export const IMPLEMENTATION_PLAN: PhaseItem[] = [
  {
    name: "Phase 1 · Beta → GA (Sprints 0–3, 5/18–6/14)",
    status: "in_progress",
    description:
      "4-week effort: alpha (S0) → beta go-live Wed 5/27 with registration (S1) → optimizer math hardening (S2) → final production go-live end of S3 (Sun 6/14). Sprint detail in SPRINTS below.",
  },
  {
    name: "Phase 2 · Agent + SOA flow",
    status: "planned",
    description:
      "Admin assigns agents, agent inbox with status filters, signature capture (draw + type), SOA PDF generation and audit trail.",
  },
  {
    name: "Phase 3 · CMS catalog ingest",
    status: "planned",
    description:
      "Nightly ingest of CMS 2026/2027 plan + formulary data; backfill scenarios with real Part D tiers instead of estimates.",
  },
  {
    name: "Phase 4 · Expert contact ops",
    status: "planned",
    description:
      "Inbox for licensed experts with lifecycle states (new / contacted / closed), reminders and SLAs.",
  },
];

// ----------------------------------------------------------------------------
// SPRINT SCHEDULE
// ----------------------------------------------------------------------------
// PHASE 1 sprint schedule — four 1-week sprints, Mon → Sun.
//   S0 (5/18–5/24) Alpha — closed.
//   S1 (5/25–5/31) ACTIVE. Alpha continues through Tue 5/26 midnight; Beta
//                  goes live Wed 5/27 with public registration.
//   S2 (6/01–6/07) Optimizer math hardening on the beta.
//   S3 (6/08–6/14) Final production go-live Sun 6/14 (end of Phase 1).
export const ACTIVE_SPRINT_ID = "S-2026-01";

export const SPRINTS: Sprint[] = [
  {
    id: "S-2026-00", number: 0, name: "Alpha — requirements & framing",
    start: "2026-05-18", end: "2026-05-24",
    goal: "Draft initial requirements and ship an alpha release used to refine scope and surface gaps before the beta.",
    items: [
      { id: "S0-1", title: "Initial product + scenario requirements drafted", type: "design", status: "done" },
      { id: "S0-2", title: "Alpha release deployed for internal walkthrough", type: "feature", status: "done" },
      { id: "S0-3", title: "Requirements refined from alpha feedback", type: "design", status: "done" },
      { id: "S0-4", title: "Voice intake + scenario flow validated end-to-end", type: "feature", status: "done" },
    ],
  },
  {
    id: "S-2026-01", number: 1, name: "Beta go-live",
    start: "2026-05-25", end: "2026-05-31",
    goal: "Close alpha Tue 5/26 midnight; cut Beta live Wed 5/27 with public registration. Execute the full test plan against the beta. Catria leads QA (70%); owner runs the remaining 30%.",
    items: [
      { id: "S1-1", title: "Alpha testing closes Tue 5/26 midnight", type: "test", status: "in_progress" },
      { id: "S1-2", title: "Beta release live Wed 5/27 with public registration", type: "feature", status: "todo" },
      { id: "S1-3", title: "All test cases aligned to Sprint 1", type: "test", status: "in_progress" },
      { id: "S1-4", title: "Test case ownership split 70/30 (Catria / Me)", type: "test", status: "in_progress" },
      { id: "S1-5", title: "Beta smoke pass against production preview (Thu 5/28)", type: "test", status: "todo" },
      { id: "S1-6", title: "Triage + fix P0/P1 beta defects", type: "bug", status: "todo" },
      { id: "S1-7", title: "Catria recruits 10 agents (hand-picked) — NDA + Agent Agreement signed before access", type: "feature", status: "todo", owner: "Catria" },
    ],
  },
  {
    id: "S-2026-02", number: 2, name: "Optimizer math hardening",
    start: "2026-06-01", end: "2026-06-07",
    goal: "On the live beta, land the explainable scoring model and per-plan StrategyScorecard so plan rankings are defensible before GA.",
    items: [
      { id: "S2-1", title: "Score model: monthly cost vs predictability", type: "feature", status: "todo" },
      { id: "S2-2", title: "Tier lookup for catalog drugs", type: "feature", status: "todo" },
      { id: "S2-3", title: "StrategyScorecard UI — per-plan breakdown", type: "design", status: "todo" },
      { id: "S2-4", title: "Optimizer scoring test cases", type: "test", status: "todo" },
    ],
  },
  {
    id: "S-2026-03", number: 3, name: "GA hardening + final go-live",
    start: "2026-06-08", end: "2026-06-14",
    goal: "Close out Phase 1: full regression on beta, fix any remaining P0/P1s, and cut the final production go-live by end of day Sun 6/14.",
    items: [
      { id: "S3-1", title: "Full regression pass across all areas", type: "test", status: "todo" },
      { id: "S3-2", title: "P0/P1 defect burndown to zero", type: "bug", status: "todo" },
      { id: "S3-3", title: "Production cutover checklist + DNS / cache warm", type: "infra", status: "todo" },
      { id: "S3-4", title: "Final production go-live (Sun 6/14, end of Phase 1)", type: "feature", status: "todo" },
      { id: "S3-5", title: "Phase 1 retro + Phase 2 kickoff brief", type: "design", status: "todo" },
    ],
  },
];

// ----------------------------------------------------------------------------
// TASKS — granular cross-sprint backlog (visible in Tasks tab)
// ----------------------------------------------------------------------------
export const TASKS: Task[] = [
  { id: "T-001", title: "Wire VoiceButton onto Strength input", area: "Voice · Inputs", status: "done", priority: "P1" },
  { id: "T-002", title: "Add Spell mode toggle with NATO phonetic alphabet", area: "Voice · Inputs", status: "done", priority: "P1" },
  { id: "T-003", title: "Voice-driven wizard state machine", area: "Voice · Wizard", status: "done", priority: "P0" },
  { id: "T-004", title: "Confirm summary read-back before submit", area: "Voice · Wizard", status: "done", priority: "P1" },
  { id: "T-005", title: "Skip control limited to optional steps", area: "Voice · Wizard", status: "done", priority: "P2" },
  { id: "T-006", title: "Testing portal route + tabs", area: "Testing portal", status: "done", priority: "P1" },
  { id: "T-007", title: "Persist test status to localStorage", area: "Testing portal", status: "done", priority: "P2" },
  { id: "T-008", title: "Scoring model formula doc", area: "Optimizer", status: "in_progress", priority: "P0" },
  { id: "T-009", title: "Coverage-flagged drugs penalize MA-only plans", area: "Optimizer", status: "todo", priority: "P1" },
  { id: "T-010", title: "Per-plan StrategyScorecard component", area: "Optimizer", status: "todo", priority: "P1" },
  { id: "T-011", title: "Admin: drag-drop assign agent", area: "Agent", status: "todo", priority: "P2" },
  { id: "T-012", title: "Signature capture polish (Type-mode font)", area: "SOA", status: "in_progress", priority: "P2" },
  { id: "T-013", title: "CMS 2026 ingest job (pg_cron + /api/public)", area: "CMS Ingest", status: "todo", priority: "P0" },
  { id: "T-014", title: "RxNorm cache to cut latency on repeat lookups", area: "RxNorm", status: "todo", priority: "P3" },
  { id: "T-015", title: "QA: cross-browser voice matrix (Chrome / Edge / Safari)", area: "QA", status: "todo", priority: "P1" },
];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
export const TEST_STATUS_KEY = (id: string) => `test-status:${id}`;

export function loadStatus(id: string): TestStatus {
  if (typeof window === "undefined") return "not_run";
  return (localStorage.getItem(TEST_STATUS_KEY(id)) as TestStatus) || "not_run";
}

export function saveStatus(id: string, s: TestStatus) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TEST_STATUS_KEY(id), s);
}

export function loadAllStatuses(): Record<string, TestStatus> {
  const out: Record<string, TestStatus> = {};
  for (const t of TEST_CASES) out[t.id] = loadStatus(t.id);
  return out;
}

// ----------------------------------------------------------------------------
// Test notes — QA failure reasons + Dev retest notes, persisted per test id.
// ----------------------------------------------------------------------------
export const TEST_QA_NOTE_KEY = (id: string) => `test-qa-note:${id}`;
export const TEST_DEV_NOTE_KEY = (id: string) => `test-dev-note:${id}`;

export function loadQaNote(id: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TEST_QA_NOTE_KEY(id)) || "";
}
export function saveQaNote(id: string, note: string) {
  if (typeof window === "undefined") return;
  if (note) localStorage.setItem(TEST_QA_NOTE_KEY(id), note);
  else localStorage.removeItem(TEST_QA_NOTE_KEY(id));
}
export function loadDevNote(id: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TEST_DEV_NOTE_KEY(id)) || "";
}
export function saveDevNote(id: string, note: string) {
  if (typeof window === "undefined") return;
  if (note) localStorage.setItem(TEST_DEV_NOTE_KEY(id), note);
  else localStorage.removeItem(TEST_DEV_NOTE_KEY(id));
}
export function loadAllQaNotes(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const t of TEST_CASES) out[t.id] = loadQaNote(t.id);
  return out;
}
export function loadAllDevNotes(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const t of TEST_CASES) out[t.id] = loadDevNote(t.id);
  return out;
}

// ----------------------------------------------------------------------------
// Test failure severity — required when QA marks a test as fail / failed_retest
// ----------------------------------------------------------------------------
export type FailSeverity = "high" | "medium" | "low";
export const FAIL_SEVERITY_LABELS: Record<FailSeverity, string> = {
  high: "High — Show stopper",
  medium: "Medium — Fix soon",
  low: "Low — Can wait",
};
export const TEST_SEVERITY_KEY = (id: string) => `test-severity:${id}`;

export function loadSeverity(id: string): FailSeverity | "" {
  if (typeof window === "undefined") return "";
  return (localStorage.getItem(TEST_SEVERITY_KEY(id)) as FailSeverity) || "";
}
export function saveSeverity(id: string, s: FailSeverity | "") {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(TEST_SEVERITY_KEY(id), s);
  else localStorage.removeItem(TEST_SEVERITY_KEY(id));
}
export function loadAllSeverities(): Record<string, FailSeverity | ""> {
  const out: Record<string, FailSeverity | ""> = {};
  for (const t of TEST_CASES) out[t.id] = loadSeverity(t.id);
  return out;
}

// ----------------------------------------------------------------------------
// TEST OWNERSHIP — 70/30 split, Catria lead. All tests are aligned to the
// active sprint (Sprint 1 · beta go-live) unless a TestCase overrides it.
// ----------------------------------------------------------------------------
export const TEST_OWNERS = ["Catria", "Evelyn", "Dev"] as const;
export type TestOwner = (typeof TEST_OWNERS)[number];

/**
 * "Dev" is the merged engineering + design user. Any test that QA marks as
 * failing (fail / failed_retest) is auto-routed to Dev for triage + fix,
 * regardless of the original QA owner.
 */
export const DEV_OWNER: TestOwner = "Dev";

/**
 * Deterministic 70/30 split across the TEST_CASES list. The first 7 of every
 * 10 (by source order) go to Catria, the remaining 3 to "Evelyn". A TestCase can
 * override by setting `assignee` explicitly.
 */
export function getTestAssignee(t: TestCase, status?: TestStatus): TestOwner | string {
  // Manual override (set via the test plan UI) wins over derived logic.
  const override = loadAssigneeOverride(t.id);
  if (override) return override;
  // Failed tests are automatically reassigned to the Dev user.
  if (status === "fail" || status === "failed_retest") return DEV_OWNER;
  if (t.assignee) return t.assignee;
  const idx = TEST_CASES.findIndex((x) => x.id === t.id);
  if (idx < 0) return "Catria";
  return idx % 10 < 7 ? "Catria" : "Evelyn";
}

// ----------------------------------------------------------------------------
// Assignee override — let QA re-assign a test inline from the test plan UI.
// ----------------------------------------------------------------------------
export const TEST_ASSIGNEE_KEY = (id: string) => `test-assignee:${id}`;

export function loadAssigneeOverride(id: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TEST_ASSIGNEE_KEY(id)) || "";
}
export function saveAssigneeOverride(id: string, owner: string) {
  if (typeof window === "undefined") return;
  if (owner) localStorage.setItem(TEST_ASSIGNEE_KEY(id), owner);
  else localStorage.removeItem(TEST_ASSIGNEE_KEY(id));
}
export function loadAllAssigneeOverrides(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const t of TEST_CASES) out[t.id] = loadAssigneeOverride(t.id);
  return out;
}

export function getTestSprintId(t: TestCase): string {
  const override = loadSprintOverride(t.id);
  if (override) return override;
  return t.sprintId || ACTIVE_SPRINT_ID;
}

// ----------------------------------------------------------------------------
// Sprint override — let QA re-assign a test to a different sprint from the UI.
// ----------------------------------------------------------------------------
export const TEST_SPRINT_KEY = (id: string) => `test-sprint:${id}`;

export function loadSprintOverride(id: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TEST_SPRINT_KEY(id)) || "";
}
export function saveSprintOverride(id: string, sprintId: string) {
  if (typeof window === "undefined") return;
  if (sprintId) localStorage.setItem(TEST_SPRINT_KEY(id), sprintId);
  else localStorage.removeItem(TEST_SPRINT_KEY(id));
}
export function loadAllSprintOverrides(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const t of TEST_CASES) out[t.id] = loadSprintOverride(t.id);
  return out;
}

// ----------------------------------------------------------------------------
// Test description override — admins can edit title / preconditions / steps /
// expected / notes for any test case. Overrides persist in localStorage and
// are merged on top of the static TEST_CASES via applyDescriptionOverride().
// ----------------------------------------------------------------------------
export interface TestDescriptionOverride {
  title?: string;
  preconditions?: string;
  steps?: string[];
  expected?: string;
  notes?: string;
}
export const TEST_DESC_KEY = (id: string) => `test-desc:${id}`;

export function loadDescriptionOverride(id: string): TestDescriptionOverride {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TEST_DESC_KEY(id));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TestDescriptionOverride;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
export function saveDescriptionOverride(id: string, ov: TestDescriptionOverride) {
  if (typeof window === "undefined") return;
  // Drop empty fields so we don't shadow defaults with blanks unintentionally.
  const cleaned: TestDescriptionOverride = {};
  if (ov.title && ov.title.trim()) cleaned.title = ov.title.trim();
  if (ov.preconditions && ov.preconditions.trim()) cleaned.preconditions = ov.preconditions.trim();
  if (ov.steps && ov.steps.length) {
    const steps = ov.steps.map((s) => s.trim()).filter(Boolean);
    if (steps.length) cleaned.steps = steps;
  }
  if (ov.expected && ov.expected.trim()) cleaned.expected = ov.expected.trim();
  if (ov.notes && ov.notes.trim()) cleaned.notes = ov.notes.trim();
  if (Object.keys(cleaned).length === 0) {
    localStorage.removeItem(TEST_DESC_KEY(id));
  } else {
    localStorage.setItem(TEST_DESC_KEY(id), JSON.stringify(cleaned));
  }
}
export function clearDescriptionOverride(id: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TEST_DESC_KEY(id));
}
export function applyDescriptionOverride(t: TestCase): TestCase {
  const ov = loadDescriptionOverride(t.id);
  if (!ov || Object.keys(ov).length === 0) return t;
  return {
    ...t,
    title: ov.title ?? t.title,
    preconditions: ov.preconditions ?? t.preconditions,
    steps: ov.steps ?? t.steps,
    expected: ov.expected ?? t.expected,
    notes: ov.notes ?? t.notes,
  };
}

export function testAssignmentCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of TEST_CASES) {
    const a = getTestAssignee(t);
    counts[a] = (counts[a] || 0) + 1;
  }
  return counts;
}

// ----------------------------------------------------------------------------
// BETA TESTER CREDIT REWARDS
// ----------------------------------------------------------------------------
// Beta testers (Sprint 1 cohort hand-picked by Catria) earn credit tokens for
// every test case they execute and submit with evidence. Token amount scales
// with complexity, proxied by Priority:
//   P0 = 15 (critical / high-complexity flows: auth, intake, wizard, CMS)
//   P1 = 10 (core feature paths)
//   P2 = 5  (secondary paths, exports, edge UI)
//   P3 = 3  (nice-to-have / polish)
// Tokens redeem 1:1 against `advisor_credits` and can be spent on scenario
// lookups inside the product. A test must reach status "pass" or a
// reproducible "fail" with notes to be eligible; "blocked" and "not_run"
// award 0. Bonus: +5 tokens for the first reproducible "fail" filed on a
// given test id (paid manually by admin during sprint retro).
// ----------------------------------------------------------------------------
export const CREDIT_REWARDS: Record<Priority, number> = {
  P0: 15,
  P1: 10,
  P2: 5,
  P3: 3,
};
export const REPRO_FAIL_BONUS = 5;

export function getTestCreditReward(t: TestCase): number {
  return CREDIT_REWARDS[t.priority] ?? 0;
}

export function totalCreditBudget(): number {
  return TEST_CASES.reduce((sum, t) => sum + getTestCreditReward(t), 0);
}

export function creditBudgetByOwner(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of TEST_CASES) {
    const a = getTestAssignee(t);
    out[a] = (out[a] || 0) + getTestCreditReward(t);
  }
  return out;
}