/**
 * Shared content for GYSH partnership money model (Financials UI + PDF).
 * Use plain ASCII punctuation so PDF Helvetica wraps cleanly (no arrow/em-dash overflow).
 * Working partner summary — not a signed legal agreement.
 */

export const PARTNERSHIP_MONEY_MODEL_META = {
  title: "GYSH Partnership Money Model (Ev's Suggestion)",
  subtitle: "Tina Marie Barham and Evelyn Irving - working summary",
  /** Task List id for Financials / money model work. */
  taskNumber: "T-022",
  filename: "GYSH-Partnership-Money-Model.pdf",
  where: "https://getyoursidehustle.com/admin?tab=financials&sub=money-model",
  lead:
    "Working partner summary for soft launch. Not legal advice and not a signed contract. Have a CPA or attorney formalize capital accounts and retainers.",
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

export const MONEY_MODEL_SECTIONS: MoneyModelSection[] = [
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
