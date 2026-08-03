/**
 * Shared content for GYSH partnership money model (Financials UI + PDF).
 * Use plain ASCII punctuation so PDF Helvetica wraps cleanly (no arrow/em-dash overflow).
 * Working partner summary — not a signed legal agreement.
 *
 * Draft 1 = original working suggestion.
 * Draft 2 = Tina (Aug 2026) decisions: Build Credit first to $10k, then 50/50;
 *           Kevina fully Tina; Platform maintain $50 only in revenue months (no accrual).
 */

export type MoneyModelDraftId = "draft1" | "draft2";

export type MoneyModelDraftMeta = {
  id: MoneyModelDraftId;
  label: string;
  title: string;
  subtitle: string;
  /** Task List id for Financials / money model work. */
  taskNumber: string;
  filename: string;
  where: string;
  lead: string;
  /** Short badge for UI tabs. */
  tabLabel: string;
};

export type MoneyModelSectionId =
  | "core"
  | "monthly"
  | "events"
  | "waterfall"
  | "example"
  | "talking";

export type MoneyModelTable = {
  headers: string[];
  rows: string[][];
  /** Relative column widths for PDF; optional for UI. */
  colWeights?: number[];
};

export type MoneyModelSection = {
  id: MoneyModelSectionId;
  title: string;
  tocLabel: string;
  intro?: string;
  bullets?: string[];
  tables?: { caption?: string; table: MoneyModelTable }[];
  note?: string;
  paragraphs?: string[];
};

export type MoneyModelDraft = {
  meta: MoneyModelDraftMeta;
  sections: MoneyModelSection[];
};

/** @deprecated Prefer getMoneyModelDraft("draft1").meta — kept for older imports. */
export const PARTNERSHIP_MONEY_MODEL_META: MoneyModelDraftMeta = {
  id: "draft1",
  tabLabel: "Draft 1",
  label: "Draft 1 (original)",
  title: "GYSH Partnership Money Model (Ev's Suggestion)",
  subtitle: "Tina Marie Barham and Evelyn Irving - working summary",
  taskNumber: "T-022",
  filename: "GYSH-Partnership-Money-Model-Draft-1.pdf",
  where: "https://getyoursidehustle.com/admin?tab=financials&sub=money-model&draft=draft1",
  lead:
    "Working partner summary for soft launch. Not legal advice and not a signed contract. Have a CPA or attorney formalize capital accounts and retainers.",
};

/** Draft 1 — original always-on platform retainer + ~40% Build Credit slice. */
export const MONEY_MODEL_SECTIONS_DRAFT_1: MoneyModelSection[] = [
  {
    id: "core",
    title: "1. Core deal",
    tocLabel: "Core deal",
    bullets: [
      "Ownership: 50% Tina / 50% Evelyn.",
      "Platform valuation (working mid): about $95,000 replacement cost.",
      "Evelyn Build Credit: about $10,000 (severe discount). This repays past build work, not ongoing monthly ops.",
      "All membership revenue is one shared GYSH pot. After the waterfall, leftover profit is always 50/50. No Kids vs Adult ownership split.",
      "Intellectual property: GYSH goes to the LLC; Kevina stays with Tina; Adult and Senior characters stay with Evelyn.",
      "Soft launch cross-promo helps grow Tina's Kevina YouTube through Kids Corner traffic.",
    ],
  },
  {
    id: "monthly",
    title: "2. Every month (always on)",
    tocLabel: "Every month (always on)",
    intro: "These three items apply every month, whether or not Events run.",
    tables: [
      {
        table: {
          headers: ["Item", "Who", "Definition"],
          colWeights: [1.35, 0.95, 2.2],
          rows: [
            [
              "Platform maintain",
              "Evelyn",
              "Keep the site running: deploys, bugs, login/email, admin tools, security, uptime, small polish.",
            ],
            [
              "Membership admin",
              "Either partner",
              "Member ops: billing, upgrades, cancels, credits, access fixes, parent consent, refunds, FAQ. Pay goes to whoever did the work.",
            ],
            [
              "Build Credit",
              "Evelyn",
              "Not a stipend. About 40% of remaining profit after expenses and always-on stipends, until about $10,000 is cleared.",
            ],
          ],
        },
      },
    ],
    note: "Cash-light starting retainers (raise with revenue): Platform $100 to $500/mo; Membership admin $50 to $250/mo.",
  },
  {
    id: "events",
    title: "3. Events (usually free)",
    tocLabel: "Events",
    intro:
      "Workshops and guest sessions are usually free. The goal is memberships, not ticket sales. Partner Event pay is an acquisition cost from the membership pot (like ads). Outside speakers are unpaid (value exchange).",
    tables: [
      {
        table: {
          headers: ["Role", "Who", "Pay", "Covers"],
          colWeights: [1.35, 0.85, 0.95, 1.85],
          rows: [
            ["Workshop host", "Either partner", "$150 each", "Prep, live host, day-of, follow-up"],
            ["Workshop ops", "Either partner", "$75 each", "Calendar, registration, Zoom, materials"],
            ["Workshop alone", "One partner", "$225 total", "Host plus ops if one person ran it"],
            ["Guest speaker ops", "Either partner", "$75 each", "Invite, brief, schedule, promo, day-of"],
            ["Guest speaker fee", "Outside guest", "$0", "Audience, recording, cross-promo, free Pro"],
          ],
        },
      },
    ],
    bullets: [
      "Pay Event stipends only when a session actually runs, and only if cash allows after platform and membership admin.",
      "If a free workshop helps close even one membership, it usually more than covers $225.",
      "Any rare ticket or upsell income is GYSH revenue, then follows the same waterfall to a 50/50 split.",
    ],
  },
  {
    id: "waterfall",
    title: "4. Money waterfall",
    tocLabel: "Money waterfall",
    intro: "Cash is applied in this order each month.",
    tables: [
      {
        table: {
          headers: ["Step", "Bucket", "Rule"],
          colWeights: [0.55, 1.35, 2.6],
          rows: [
            ["1", "Hard expenses", "Hosting, domains, email, tools, ads, Stripe fees first."],
            [
              "2",
              "Role stipends",
              "Always-on: platform and membership admin. Events: per-session pay to whoever did the work, if cash allows.",
            ],
            ["3", "Cash repay", "Out-of-pocket cash either partner put in (with receipts), dollar for dollar."],
            ["4", "Build Credit", "About 40% of remaining profit to Evelyn until about $10,000 is cleared."],
            ["5", "Owner split", "Everything left splits 50/50 Tina / Evelyn."],
          ],
        },
      },
    ],
  },
  {
    id: "example",
    title: "5. Example month ($500 memberships)",
    tocLabel: "Example month ($500)",
    intro:
      "Illustrative soft-launch month. No Events ran. Membership admin is shown as Evelyn here; it could be Tina.",
    tables: [
      {
        table: {
          headers: ["Line item", "Amount", "Notes"],
          colWeights: [1.7, 0.75, 2.05],
          rows: [
            ["Membership revenue (gross)", "$500.00", "Shared GYSH pot"],
            ["Stripe fees (~3%)", "-$15.00", "Hard expense"],
            ["Hosting / tools / email", "-$80.00", "Hard expense"],
            ["Ads (optional)", "-$50.00", "Hard expense"],
            ["After hard expenses", "$355.00", "$500 minus $145"],
            ["Platform maintain", "-$100.00", "Evelyn - always on"],
            ["Membership admin", "-$50.00", "Either partner - always on"],
            ["Events", "$0.00", "None ran"],
            ["After stipends", "$205.00", "Before Build Credit"],
            ["Build Credit (40%)", "-$82.00", "Toward $10,000"],
            ["Left for owners", "$123.00", "50/50 split"],
            ["Tina 50% share", "$61.50", "Equal partner cut"],
            ["Evelyn 50% share", "$61.50", "Equal partner cut"],
          ],
        },
      },
    ],
    bullets: [
      "Evelyn cash this example: platform $100 + membership $50 + Build Credit $82 + 50% share $61.50 = about $293.50.",
      "Tina cash this example: 50% share $61.50, plus Kevina YouTube / Kids funnel value (not cash).",
      "When Build Credit is paid off, that $82 also goes into the 50/50 pot.",
    ],
  },
  {
    id: "talking",
    title: "6. Talking points",
    tocLabel: "Talking points",
    bullets: [
      "Every month we always cover platform maintain, membership admin, and Build Credit.",
      "Membership admin can be either of us - whoever does the work that month gets paid.",
      "Events: $150 host + $75 ops per workshop; $75 partner ops for a guest-speaker session; speakers unpaid.",
      "Memberships stay 50/50 after the waterfall. If GYSH earns from a ticketed event, we split that too.",
      "Soft launch also grows Tina's Kevina YouTube through Kids Corner.",
    ],
    note: "Hours and stipends are planning estimates for early stage. Revisit quarterly as member count and workshop cadence change.",
  },
];

/** Draft 2 — Tina Aug 2026 decisions (Build Credit first; Kevina control; $50 platform only in revenue months). */
export const MONEY_MODEL_SECTIONS_DRAFT_2: MoneyModelSection[] = [
  {
    id: "core",
    title: "1. Core deal (Draft 2)",
    tocLabel: "Core deal",
    bullets: [
      "Ownership: 50% Tina / 50% Evelyn of GYSH.",
      "Evelyn Build Credit: $10,000 for past platform build. This is paid back FIRST from remaining profit after hard expenses and any allowed platform fee, until Evelyn is paid in full.",
      "After Build Credit is cleared, membership (and other GYSH) profit splits 50/50 Tina / Evelyn.",
      "All membership revenue is one shared GYSH pot. No Kids vs Adult ownership split.",
      "Kevina Starr: Tina retains complete control. GYSH may promote Kids Corner / soft-launch traffic, but Kevina IP and creative control stay with Tina.",
      "Adult and Senior characters (when created) stay with Evelyn; GYSH LLC holds the platform product.",
      "Soft launch cross-promo may still help grow Tina's Kevina YouTube through Kids Corner traffic, under Tina's control.",
    ],
  },
  {
    id: "monthly",
    title: "2. Monthly fees (Draft 2)",
    tocLabel: "Monthly fees",
    intro:
      "Platform maintain is only charged in months GYSH generates revenue. Unpaid months do not accrue.",
    tables: [
      {
        table: {
          headers: ["Item", "Who", "Definition"],
          colWeights: [1.35, 0.95, 2.2],
          rows: [
            [
              "Platform maintain",
              "Evelyn",
              "$50 only in a month with GYSH revenue (memberships or other GYSH cash in). Keep the site running: deploys, bugs, login/email, admin tools, security, uptime, small polish. If revenue is $0 that month: $0 fee. Does not accumulate.",
            ],
            [
              "Membership admin",
              "Either partner",
              "Member ops: billing, upgrades, cancels, credits, access fixes, parent consent, refunds, FAQ. Pay goes to whoever did the work (same spirit as Draft 1).",
            ],
            [
              "Build Credit",
              "Evelyn",
              "Payback of $10,000 for past build. After hard expenses and the $50 platform fee (if any), remaining profit goes to Build Credit until Evelyn is paid in full. Then stop this bucket.",
            ],
          ],
        },
      },
    ],
    note:
      "Agreed with Tina (Aug 2026): Platform maintain = $50, revenue months only, no accrual. Build Credit to $10,000 first; then 50/50. Kevina = Tina complete control. Logged on Task T-022.",
  },
  {
    id: "events",
    title: "3. Events (usually free)",
    tocLabel: "Events",
    intro:
      "Workshops and guest sessions are usually free. The goal is memberships, not ticket sales. Partner Event pay is an acquisition cost from the membership pot (like ads). Outside speakers are unpaid (value exchange).",
    tables: [
      {
        table: {
          headers: ["Role", "Who", "Pay", "Covers"],
          colWeights: [1.35, 0.85, 0.95, 1.85],
          rows: [
            ["Workshop host", "Either partner", "$150 each", "Prep, live host, day-of, follow-up"],
            ["Workshop ops", "Either partner", "$75 each", "Calendar, registration, Zoom, materials"],
            ["Workshop alone", "One partner", "$225 total", "Host plus ops if one person ran it"],
            ["Guest speaker ops", "Either partner", "$75 each", "Invite, brief, schedule, promo, day-of"],
            ["Guest speaker fee", "Outside guest", "$0", "Audience, recording, cross-promo, free Pro"],
          ],
        },
      },
    ],
    bullets: [
      "Pay Event stipends only when a session actually runs, and only if cash allows after hard expenses, platform fee (if charged), and Build Credit priority.",
      "If a free workshop helps close even one membership, it usually more than covers $225.",
      "Any rare ticket or upsell income is GYSH revenue and follows the Draft 2 waterfall.",
    ],
  },
  {
    id: "waterfall",
    title: "4. Money waterfall (Draft 2)",
    tocLabel: "Money waterfall",
    intro: "Cash is applied in this order each month.",
    tables: [
      {
        table: {
          headers: ["Step", "Bucket", "Rule"],
          colWeights: [0.55, 1.35, 2.6],
          rows: [
            ["1", "Hard expenses", "Hosting, domains, email, tools, ads, Stripe fees first."],
            [
              "2",
              "Platform maintain ($50)",
              "Only if GYSH revenue > $0 that month. Else $0. Does not roll forward or accumulate.",
            ],
            [
              "3",
              "Membership admin",
              "Pay whoever did member ops that month (if cash allows after steps 1-2).",
            ],
            [
              "4",
              "Build Credit ($10,000)",
              "Remaining profit pays Evelyn until $10,000 is cleared. Priority before owner split.",
            ],
            [
              "5",
              "Owner split 50/50",
              "Only after Build Credit is fully paid. Everything left splits Tina / Evelyn equally.",
            ],
          ],
        },
      },
    ],
  },
  {
    id: "example",
    title: "5. Example month ($500 memberships) — Draft 2",
    tocLabel: "Example month ($500)",
    intro:
      "Illustrative soft-launch month with revenue, so the $50 platform fee applies. No Events. Build Credit still outstanding.",
    tables: [
      {
        table: {
          headers: ["Line item", "Amount", "Notes"],
          colWeights: [1.7, 0.75, 2.05],
          rows: [
            ["Membership revenue (gross)", "$500.00", "Shared GYSH pot"],
            ["Stripe fees (~3%)", "-$15.00", "Hard expense"],
            ["Hosting / tools / email", "-$80.00", "Hard expense"],
            ["Ads (optional)", "-$50.00", "Hard expense"],
            ["After hard expenses", "$355.00", "$500 minus $145"],
            ["Platform maintain", "-$50.00", "Evelyn - revenue month only"],
            ["Membership admin", "-$50.00", "Either partner (example)"],
            ["Events", "$0.00", "None ran"],
            ["After fees", "$255.00", "Before Build Credit"],
            ["Build Credit (payback first)", "-$255.00", "Toward $10,000 until cleared"],
            ["Left for owners", "$0.00", "No 50/50 until Build Credit paid"],
            ["Tina 50% share", "$0.00", "Starts after Build Credit done"],
            ["Evelyn 50% share", "$0.00", "Starts after Build Credit done"],
          ],
        },
      },
    ],
    bullets: [
      "Evelyn cash this example: platform $50 + membership admin $50 + Build Credit $255 = about $355.",
      "Tina cash this example: $0 owner split while Build Credit is still paying down; Kevina remains fully under Tina's control.",
      "Zero-revenue month example: Platform maintain = $0 (does not accumulate). Hard expenses still apply if paid from partner pockets/cash repay.",
      "After Build Credit hits $10,000 cleared, the same leftover after fees becomes 50/50.",
    ],
  },
  {
    id: "talking",
    title: "6. Talking points (Draft 2)",
    tocLabel: "Talking points",
    bullets: [
      "Tina agreed (Aug 2026): Evelyn Build Credit $10,000 paid first; then membership profit 50/50.",
      "Tina retains complete control of Kevina Starr.",
      "Platform maintain is $50, only in months with GYSH revenue, and never accrues for skipped months.",
      "Membership admin can be either partner - whoever does the work that month gets paid.",
      "Events pay stays per-session to whoever ran the work; speakers unpaid.",
      "Tentative banking follow-up: Evelyn explores another Navy Federal business account (Task T-052); cross-ref Task T-022.",
      "Logged on Task T-022; Financials Money model Draft 2 tab is the living copy.",
    ],
    note: "Working partner summary - not a signed contract. Revisit when Build Credit clears or membership scale changes.",
  },
];

export const MONEY_MODEL_DRAFT_2_META: MoneyModelDraftMeta = {
  id: "draft2",
  tabLabel: "Draft 2",
  label: "Draft 2 (Tina Aug 2026)",
  title: "GYSH Partnership Money Model (Draft 2)",
  subtitle: "Tina Marie Barham and Evelyn Irving - Tina-agreed working summary",
  taskNumber: "T-022",
  filename: "GYSH-Partnership-Money-Model-Draft-2.pdf",
  where: "https://getyoursidehustle.com/admin?tab=financials&sub=money-model&draft=draft2",
  lead:
    "Draft 2 reflects Tina's Aug 2026 decisions: Build Credit to $10,000 first, then 50/50; Kevina under Tina's complete control; Platform maintain $50 only in revenue months (no accrual). Not legal advice.",
};

export const MONEY_MODEL_DRAFTS: MoneyModelDraft[] = [
  { meta: PARTNERSHIP_MONEY_MODEL_META, sections: MONEY_MODEL_SECTIONS_DRAFT_1 },
  { meta: MONEY_MODEL_DRAFT_2_META, sections: MONEY_MODEL_SECTIONS_DRAFT_2 },
];

/** Default export alias — Draft 1 sections (backward compatible). */
export const MONEY_MODEL_SECTIONS = MONEY_MODEL_SECTIONS_DRAFT_1;

export function getMoneyModelDraft(id: MoneyModelDraftId | string | null | undefined): MoneyModelDraft {
  const found = MONEY_MODEL_DRAFTS.find((d) => d.meta.id === id);
  return found ?? MONEY_MODEL_DRAFTS[0]!;
}

export function normalizeMoneyModelDraftId(
  raw: string | null | undefined,
): MoneyModelDraftId {
  if (raw === "draft2" || raw === "2") return "draft2";
  return "draft1";
}

/** Short note text for Task T-022 when Draft 2 was agreed. */
export const T022_DRAFT2_AGREEMENT_NOTE = [
  "Draft 2 money model (Tina Aug 2026):",
  "1) Evelyn Build Credit $10,000 paid back first from remaining profit until paid in full; then membership splits 50/50.",
  "2) Tina retains complete control of Kevina Starr.",
  "3) Platform maintain fee = $50, only chargeable in months GYSH generates revenue; does not accumulate if skipped.",
  "See Admin → Financials → Money model → Draft 2.",
  "Banking follow-up: T-052 (Explore Navy Federal business account).",
].join(" ");
