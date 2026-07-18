export type BudgetBillingPeriod = "monthly" | "annual" | "one_time" | "usage";

export type BudgetCatalogItem = {
  id: string;
  category: string;
  name: string;
  vendor: string;
  description: string;
  billingPeriod: BudgetBillingPeriod;
  /** Default placeholder amount (USD). */
  defaultAmount: number;
  optional?: boolean;
  link?: string;
};

export const BUDGET_BILLING_LABELS: Record<BudgetBillingPeriod, string> = {
  monthly: "Monthly",
  annual: "Annual",
  one_time: "One-time",
  usage: "Usage-based",
};

/** Project timeline used in the development summary (first commit → present). */
export const PROJECT_DEV_SUMMARY = {
  projectName: "Part B Optimizer (mypartb.com)",
  periodStart: "2026-05-21",
  periodEnd: "2026-06-29",
  calendarWeeks: 6,
  gitCommits: 57,
  contributorCommits: 79,
  summary:
    "Medicare benchmark platform built on TanStack Start with Supabase auth/data, Cloudflare hosting, Resend email, Stripe billing, TrustedForm lead certification, Meta Pixel, voice intake, content factory, and admin tooling. Work spans intake wizards, benchmark reports, lead capture, learning center, and deployment automation.",
  defaultHours: 140,
  defaultHourlyRate: 85,
} as const;

export const PROJECT_BUDGET_CATALOG: BudgetCatalogItem[] = [
  {
    id: "cloudflare-pages",
    category: "Infrastructure & Hosting",
    name: "Cloudflare Pages + Workers",
    vendor: "Cloudflare",
    description: "SSR hosting, Workers AI transcription, CDN, and DNS for mypartb.com.",
    billingPeriod: "monthly",
    defaultAmount: 20,
    link: "https://www.cloudflare.com/plans/",
  },
  {
    id: "domain-mypartb",
    category: "Infrastructure & Hosting",
    name: "Domain registration",
    vendor: "Registrar (via Cloudflare)",
    description: "mypartb.com annual domain renewal.",
    billingPeriod: "annual",
    defaultAmount: 15,
  },
  {
    id: "supabase",
    category: "Database & Auth",
    name: "Supabase Pro",
    vendor: "Supabase",
    description: "Postgres, auth, RLS, profiles, lead tables, and storage.",
    billingPeriod: "monthly",
    defaultAmount: 25,
    link: "https://supabase.com/pricing",
  },
  {
    id: "resend",
    category: "Email & Communications",
    name: "Resend",
    vendor: "Resend",
    description: "Transactional email — lead confirmations, auth relay, admin notifications.",
    billingPeriod: "monthly",
    defaultAmount: 20,
    link: "https://resend.com/pricing",
  },
  {
    id: "trustedform",
    category: "Lead Generation & Marketing",
    name: "ActiveProspect TrustedForm",
    vendor: "ActiveProspect",
    description: "Lead certification URLs on expert opt-in and contact forms.",
    billingPeriod: "monthly",
    defaultAmount: 450,
    link: "https://activeprospect.com/products/trustedform/",
  },
  {
    id: "meta-ads",
    category: "Lead Generation & Marketing",
    name: "Meta Ads spend",
    vendor: "Meta",
    description: "Paid social budget (variable — enter actual monthly ad spend).",
    billingPeriod: "monthly",
    defaultAmount: 500,
    optional: true,
  },
  {
    id: "meta-pixel",
    category: "Lead Generation & Marketing",
    name: "Meta Pixel",
    vendor: "Meta",
    description: "Site analytics and Lead events — platform fee is $0.",
    billingPeriod: "monthly",
    defaultAmount: 0,
  },
  {
    id: "openai",
    category: "AI & Automation",
    name: "OpenAI API",
    vendor: "OpenAI",
    description: "Dev transcription fallback (Whisper) and learning-center image generation scripts.",
    billingPeriod: "usage",
    defaultAmount: 25,
  },
  {
    id: "cloudflare-workers-ai",
    category: "AI & Automation",
    name: "Cloudflare Workers AI",
    vendor: "Cloudflare",
    description: "Production voice wizard transcription (Whisper model).",
    billingPeriod: "usage",
    defaultAmount: 10,
  },
  {
    id: "stripe",
    category: "Payments & Billing",
    name: "Stripe",
    vendor: "Stripe",
    description: "Agent subscription checkout — estimate flat platform fee; add transaction % separately if needed.",
    billingPeriod: "monthly",
    defaultAmount: 0,
    link: "https://stripe.com/pricing",
  },
  {
    id: "cursor",
    category: "Development Tools",
    name: "Cursor Pro",
    vendor: "Cursor",
    description: "AI-assisted IDE used during development.",
    billingPeriod: "monthly",
    defaultAmount: 20,
  },
  {
    id: "github",
    category: "Development Tools",
    name: "GitHub",
    vendor: "GitHub",
    description: "Source control and CI — free tier unless team features added.",
    billingPeriod: "monthly",
    defaultAmount: 0,
  },
  {
    id: "playwright",
    category: "Development Tools",
    name: "Playwright + Vitest",
    vendor: "Open source",
    description: "E2E and unit testing tooling — no license cost.",
    billingPeriod: "monthly",
    defaultAmount: 0,
  },
  {
    id: "lovable-legacy",
    category: "Development Tools",
    name: "Lovable (legacy origin)",
    vendor: "Lovable",
    description: "Original scaffold host — may be $0 if fully migrated to Cloudflare.",
    billingPeriod: "monthly",
    defaultAmount: 0,
    optional: true,
  },
  {
    id: "bun",
    category: "Development Tools",
    name: "Bun runtime",
    vendor: "Bun",
    description: "Package manager and CI builds — free for this project.",
    billingPeriod: "monthly",
    defaultAmount: 0,
  },
];

export const DEV_LABOR_LINE_ID = "development-labor";

export function monthlyEquivalent(amount: number, period: BudgetBillingPeriod): number {
  switch (period) {
    case "monthly":
    case "usage":
      return amount;
    case "annual":
      return amount / 12;
    case "one_time":
      return 0;
    default:
      return amount;
  }
}

export function formatBudgetUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function budgetCategories(catalog: BudgetCatalogItem[]): string[] {
  return [...new Set(catalog.map((item) => item.category))];
}
