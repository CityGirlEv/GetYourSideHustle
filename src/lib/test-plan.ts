// ============================================================================
// THE MEDICARE OPTIMIZER — TEST PLAN, IMPLEMENTATION PLAN, SPRINTS, TASKS
// ----------------------------------------------------------------------------
// This file is the single source of truth for the /testing portal.
// As new functionality ships, ADD a new TestCase here so it shows up in the
// portal automatically. Test-run status (Pass/Fail/Blocked) lives in
// localStorage keyed by the test id, so this file stays purely declarative.
// ============================================================================

export type TestStatus = "not_run" | "pass" | "fail" | "blocked";
export type Priority = "P0" | "P1" | "P2" | "P3";

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
];

// ----------------------------------------------------------------------------
// IMPLEMENTATION PLAN — phases in order
// ----------------------------------------------------------------------------
export const IMPLEMENTATION_PLAN: PhaseItem[] = [
  { name: "Phase 1 · Auth + roles", status: "done", shippedOn: "2025-09-15",
    description: "Supabase auth, profiles, user_roles (admin/agent/advisor/qa/viewer), has_role() definer fn, RLS across all tables." },
  { name: "Phase 2 · De-identified scenario intake", status: "done", shippedOn: "2025-10-02",
    description: "Manual 4-step wizard, ZIP3 lookup, county selector, create_scenario RPC, scenario_code generator." },
  { name: "Phase 3 · Medications + catalog", status: "done", shippedOn: "2025-10-20",
    description: "Local MED_CATALOG with brand/generic/DME, auto-resolved diagnosis, form/frequency dropdowns, monthly retail cost." },
  { name: "Phase 4 · RxNorm integration", status: "done", shippedOn: "2026-05-15",
    description: "Search rxnav.nlm.nih.gov approximateTerm, flag coverage_uncertain, show generic equivalent via TTY=IN lookup." },
  { name: "Phase 5 · Voice input on each field", status: "done", shippedOn: "2026-05-22",
    description: "Reusable VoiceButton with NATO phonetic spell mode; voice-select on Form/Frequency dropdowns." },
  { name: "Phase 6 · Voice-driven wizard", status: "done", shippedOn: "2026-05-25",
    description: "Full TTS + STT flow with retry/repeat/type/skip; submits via same create_scenario RPC." },
  { name: "Phase 7 · Plan optimizer scoring", status: "in_progress",
    description: "Score Part D + MA plans against the scenario; rank by cost preference; surface predictability tradeoffs." },
  { name: "Phase 8 · Agent assignment + SOAs", status: "in_progress",
    description: "Admin assigns agents, agents review notes, SOA signature capture, audit trail." },
  { name: "Phase 9 · Expert contact ops", status: "planned",
    description: "Inbox for licensed experts, lifecycle states (new/contacted/closed), reminders." },
  { name: "Phase 10 · CMS catalog ingest", status: "planned",
    description: "Nightly ingest of CMS 2026/2027 formularies; replace estimates with actual Part D tiers." },
];

// ----------------------------------------------------------------------------
// SPRINT SCHEDULE
// ----------------------------------------------------------------------------
export const SPRINTS: Sprint[] = [
  {
    id: "S-2026-09", number: 9, name: "Voice everywhere",
    start: "2026-05-18", end: "2026-05-29",
    goal: "Ship voice input on every intake field and a full voice-driven wizard.",
    items: [
      { id: "S9-1", title: "VoiceButton component + Web Speech API hook", type: "feature", status: "done" },
      { id: "S9-2", title: "NATO phonetic spell mode", type: "feature", status: "done" },
      { id: "S9-3", title: "Voice-select for Form / Frequency dropdowns", type: "feature", status: "done" },
      { id: "S9-4", title: "Voice intake wizard (TTS + STT state machine)", type: "feature", status: "done" },
      { id: "S9-5", title: "Manual / Voice mode toggle on /scenario/new", type: "feature", status: "done" },
      { id: "S9-6", title: "Testing portal at /testing", type: "test", status: "done" },
      { id: "S9-7", title: "Test cases for all voice flows", type: "test", status: "done" },
    ],
  },
  {
    id: "S-2026-10", number: 10, name: "Optimizer math",
    start: "2026-06-01", end: "2026-06-12",
    goal: "Turn the scenario into a ranked list of plans with explainable scoring.",
    items: [
      { id: "S10-1", title: "Score model: monthly cost vs predictability", type: "feature", status: "in_progress" },
      { id: "S10-2", title: "Tier lookup for catalog drugs (Preferred / Non-preferred / Specialty)", type: "feature", status: "todo" },
      { id: "S10-3", title: "Coverage flag from RxNorm flows into score", type: "feature", status: "todo" },
      { id: "S10-4", title: "StrategyScorecard UI — per-plan breakdown", type: "design", status: "todo" },
      { id: "S10-5", title: "Test cases for optimizer scoring edge cases", type: "test", status: "todo" },
    ],
  },
  {
    id: "S-2026-11", number: 11, name: "Agent + SOA flow",
    start: "2026-06-15", end: "2026-06-26",
    goal: "Close the loop from scenario → assigned agent → signed SOA.",
    items: [
      { id: "S11-1", title: "Admin assign-agent UI polish", type: "feature", status: "todo" },
      { id: "S11-2", title: "Agent inbox with status filters", type: "feature", status: "todo" },
      { id: "S11-3", title: "Signature capture (draw + type modes)", type: "feature", status: "in_progress" },
      { id: "S11-4", title: "SOA PDF generation", type: "feature", status: "todo" },
    ],
  },
  {
    id: "S-2026-12", number: 12, name: "CMS catalog ingest",
    start: "2026-06-29", end: "2026-07-10",
    goal: "Replace estimates with real CMS 2026/2027 plan + formulary data.",
    items: [
      { id: "S12-1", title: "Nightly cron via /api/public/cms-ingest", type: "infra", status: "todo" },
      { id: "S12-2", title: "Schema for plan_year + formulary_drug", type: "infra", status: "todo" },
      { id: "S12-3", title: "Backfill existing scenarios with new prices", type: "infra", status: "todo" },
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