// ============================================================================
// Part B Optimizer — PRODUCT BUDGET
// ----------------------------------------------------------------------------
// AI-accelerated actuals. Engineering lines reflect real time spent (prompting,
// review, testing, polish) — not traditional pre-AI estimates. Most features
// that used to take weeks were built in hours. Infrastructure, compliance, and
// ops costs remain at vendor/list price.
// ----------------------------------------------------------------------------
// Rate: $150/hr (human oversight / PM / review time)
// ============================================================================

export type BudgetCategory =
  | "Build · One-time"
  | "Infra · Recurring"
  | "Data & APIs · Recurring"
  | "Compliance & Legal"
  | "Ops & Support";

export interface BudgetLine {
  id: string;
  function: string; // user-facing function / feature
  category: BudgetCategory;
  amount: number; // USD
  unit: "one-time" | "monthly" | "annual";
  basis: string; // how the number was derived
  links?: string[]; // related phase/sprint/task ids
}

export const BUDGET_LINES: BudgetLine[] = [
  // ---- Build · One-time (AI-accelerated actuals) ---------------------------
  {
    id: "B-001",
    function: "Auth + roles (Supabase, RLS, has_role)",
    category: "Build · One-time",
    amount: 900,
    unit: "one-time",
    basis: "6h AI-accelerated @ $150 — Phase 1",
    links: ["Phase 1"],
  },
  {
    id: "B-002",
    function: "De-identified scenario intake wizard",
    category: "Build · One-time",
    amount: 1_200,
    unit: "one-time",
    basis: "8h AI-accelerated @ $150 — Phase 2",
    links: ["Phase 2"],
  },
  {
    id: "B-003",
    function: "Medications + local catalog (brand/generic/DME)",
    category: "Build · One-time",
    amount: 900,
    unit: "one-time",
    basis: "6h AI-accelerated @ $150 — Phase 3",
    links: ["Phase 3"],
  },
  {
    id: "B-004",
    function: "RxNorm integration + coverage_uncertain flag",
    category: "Build · One-time",
    amount: 450,
    unit: "one-time",
    basis: "3h AI-accelerated @ $150 — Phase 4",
    links: ["Phase 4"],
  },
  {
    id: "B-005",
    function: "Voice input on every field (NATO phonetic)",
    category: "Build · One-time",
    amount: 750,
    unit: "one-time",
    basis: "5h AI-accelerated @ $150 — Phase 5",
    links: ["Phase 5", "S9-1", "S9-2", "S9-3"],
  },
  {
    id: "B-006",
    function: "Voice-driven wizard (TTS + STT state machine)",
    category: "Build · One-time",
    amount: 900,
    unit: "one-time",
    basis: "6h AI-accelerated @ $150 — Phase 6",
    links: ["Phase 6", "S9-4", "S9-5"],
  },
  {
    id: "B-007",
    function: "Plan optimizer scoring (cost vs predictability)",
    category: "Build · One-time",
    amount: 1_200,
    unit: "one-time",
    basis: "8h AI-accelerated @ $150 — Phase 7 / Sprint 10",
    links: ["Phase 7", "S10-1", "S10-2", "S10-3", "S10-4"],
  },
  {
    id: "B-008",
    function: "Agent assignment + SOA signature capture",
    category: "Build · One-time",
    amount: 900,
    unit: "one-time",
    basis: "6h AI-accelerated @ $150 — Phase 8 / Sprint 11",
    links: ["Phase 8", "S11-1", "S11-2", "S11-3", "S11-4"],
  },
  {
    id: "B-009",
    function: "Expert contact inbox + lifecycle",
    category: "Build · One-time",
    amount: 600,
    unit: "one-time",
    basis: "4h AI-accelerated @ $150 — Phase 9",
    links: ["Phase 9"],
  },
  {
    id: "B-010",
    function: "CMS catalog nightly ingest (Part D / MA)",
    category: "Build · One-time",
    amount: 900,
    unit: "one-time",
    basis: "6h AI-accelerated @ $150 — Phase 10 / Sprint 12",
    links: ["Phase 10", "S12-1", "S12-2", "S12-3"],
  },
  {
    id: "B-011",
    function: "Testing + QA portal (test plan, dashboard)",
    category: "Build · One-time",
    amount: 450,
    unit: "one-time",
    basis: "3h AI-accelerated @ $150",
    links: ["S9-6", "S9-7"],
  },
  {
    id: "B-012",
    function: "Admin portal (staff, audit, rules, rollout)",
    category: "Build · One-time",
    amount: 750,
    unit: "one-time",
    basis: "5h AI-accelerated @ $150",
  },
  {
    id: "B-013",
    function: "Sources page + citation surfacing",
    category: "Build · One-time",
    amount: 300,
    unit: "one-time",
    basis: "2h AI-accelerated @ $150",
  },
  {
    id: "B-014",
    function: "Medicare & You handbook deep link",
    category: "Build · One-time",
    amount: 75,
    unit: "one-time",
    basis: "0.5h AI-accelerated @ $150 — CMS-016",
  },

  // ---- Infra · Recurring ---------------------------------------------------
  {
    id: "B-101",
    function: "Lovable Cloud (Supabase: Postgres, Auth, Storage, RLS)",
    category: "Infra · Recurring",
    amount: 599,
    unit: "monthly",
    basis: "Pro tier + compute add-on",
  },
  {
    id: "B-102",
    function: "Edge hosting & SSR (Cloudflare Workers)",
    category: "Infra · Recurring",
    amount: 120,
    unit: "monthly",
    basis: "Workers Paid + bundled requests",
  },
  {
    id: "B-103",
    function: "Email + transactional (Resend)",
    category: "Infra · Recurring",
    amount: 80,
    unit: "monthly",
    basis: "50k emails/mo tier",
  },
  {
    id: "B-104",
    function: "Error monitoring & logs (Sentry + log drain)",
    category: "Infra · Recurring",
    amount: 90,
    unit: "monthly",
    basis: "Team plan",
  },
  {
    id: "B-105",
    function: "DNS, TLS, WAF (Cloudflare)",
    category: "Infra · Recurring",
    amount: 25,
    unit: "monthly",
    basis: "Pro zone",
  },
  {
    id: "B-106",
    function: "Backups & PITR (Supabase add-on)",
    category: "Infra · Recurring",
    amount: 100,
    unit: "monthly",
    basis: "7-day PITR",
  },

  // ---- Data & APIs · Recurring --------------------------------------------
  {
    id: "B-201",
    function: "RxNorm / RxNav API (NLM)",
    category: "Data & APIs · Recurring",
    amount: 0,
    unit: "monthly",
    basis: "Public NIH endpoint — $0",
  },
  {
    id: "B-202",
    function: "CMS plan & formulary data (public files)",
    category: "Data & APIs · Recurring",
    amount: 0,
    unit: "monthly",
    basis: "CMS public datasets — $0 + storage",
  },
  {
    id: "B-203",
    function: "Drug pricing benchmark feed (NADAC / GoodRx-class)",
    category: "Data & APIs · Recurring",
    amount: 450,
    unit: "monthly",
    basis: "Commercial price feed license",
  },
  {
    id: "B-204",
    function: "Browser TTS / STT (Web Speech API)",
    category: "Data & APIs · Recurring",
    amount: 0,
    unit: "monthly",
    basis: "Client-side, $0",
  },
  {
    id: "B-205",
    function: "Server TTS fallback (ElevenLabs, low volume)",
    category: "Data & APIs · Recurring",
    amount: 65,
    unit: "monthly",
    basis: "Starter, ~30k chars/mo",
  },
  {
    id: "B-206",
    function: "ZIP3 → county geocoding (cached HUD-USPS)",
    category: "Data & APIs · Recurring",
    amount: 0,
    unit: "monthly",
    basis: "Quarterly free file + cache",
  },

  // ---- Compliance & Legal --------------------------------------------------
  {
    id: "B-301",
    function: "CMS marketing compliance review (annual)",
    category: "Compliance & Legal",
    amount: 6_500,
    unit: "annual",
    basis: "Outside counsel, 20h @ $325",
  },
  {
    id: "B-302",
    function: "TPMO disclaimer + scope-of-appointment audit",
    category: "Compliance & Legal",
    amount: 2_400,
    unit: "annual",
    basis: "8h compliance @ $300",
  },
  {
    id: "B-303",
    function: "Privacy / PII review (de-identified intake)",
    category: "Compliance & Legal",
    amount: 3_500,
    unit: "annual",
    basis: "Privacy counsel, 10h @ $350",
  },
  {
    id: "B-304",
    function: "E&O insurance allocation (product share)",
    category: "Compliance & Legal",
    amount: 1_800,
    unit: "annual",
    basis: "Pro-rated agency policy",
  },

  // ---- Ops & Support -------------------------------------------------------
  {
    id: "B-401",
    function: "Licensed expert / agent ops (on-call queue)",
    category: "Ops & Support",
    amount: 4_200,
    unit: "monthly",
    basis: "Avg 28h/mo @ $150 blended",
  },
  {
    id: "B-402",
    function: "QA regression pass (each sprint)",
    category: "Ops & Support",
    amount: 1_800,
    unit: "monthly",
    basis: "12h QA @ $150 per sprint",
  },
  {
    id: "B-403",
    function: "Customer support (email + scenario follow-up)",
    category: "Ops & Support",
    amount: 900,
    unit: "monthly",
    basis: "12h @ $75",
  },
  {
    id: "B-404",
    function: "Content updates (sources, handbook, disclaimers)",
    category: "Ops & Support",
    amount: 600,
    unit: "monthly",
    basis: "4h @ $150",
  },
];

export interface BudgetTotals {
  oneTime: number;
  monthly: number;
  annual: number; // includes monthly × 12 + annual lines
  year1: number; // oneTime + annual
}

export function computeBudgetTotals(lines: BudgetLine[] = BUDGET_LINES): BudgetTotals {
  let oneTime = 0;
  let monthly = 0;
  let annualOnly = 0;
  for (const l of lines) {
    if (l.unit === "one-time") oneTime += l.amount;
    else if (l.unit === "monthly") monthly += l.amount;
    else if (l.unit === "annual") annualOnly += l.amount;
  }
  const annual = monthly * 12 + annualOnly;
  return { oneTime, monthly, annual, year1: oneTime + annual };
}

export function totalsByCategory(lines: BudgetLine[] = BUDGET_LINES) {
  const m = new Map<
    BudgetCategory,
    { monthly: number; annual: number; oneTime: number; year1: number }
  >();
  for (const l of lines) {
    const k = l.category;
    const cur = m.get(k) ?? { monthly: 0, annual: 0, oneTime: 0, year1: 0 };
    if (l.unit === "one-time") cur.oneTime += l.amount;
    else if (l.unit === "monthly") cur.monthly += l.amount;
    else if (l.unit === "annual") cur.annual += l.amount;
    cur.year1 = cur.oneTime + cur.annual + cur.monthly * 12;
    m.set(k, cur);
  }
  return m;
}

export const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
