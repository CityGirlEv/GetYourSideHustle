/**
 * Per-guide monthly revenue / profit estimates for Launch Guide calculator tab.
 * Planning math only — not guarantees. All defaults start at 0 — user enters values.
 */

export type GuideCalcMode = "service" | "lodging" | "product" | "social";

export type GuideCalcBudgetLine = { id: string; label: string; amount: number };

export type GuideCalcProfile = {
  mode: GuideCalcMode;
  title: string;
  blurb: string;
  /** Default revenue inputs (mode-specific keys) — always start at 0. */
  defaults: Record<string, number>;
  budget: GuideCalcBudgetLine[];
};

const SERVICE_BUDGET: GuideCalcBudgetLine[] = [
  { id: "supplies", label: "Supplies / materials", amount: 0 },
  { id: "transport", label: "Transport / mileage", amount: 0 },
  { id: "software", label: "Advertising", amount: 0 },
  { id: "insurance", label: "Insurance / permits", amount: 0 },
  { id: "other", label: "Other monthly costs", amount: 0 },
];

const LODGING_BUDGET: GuideCalcBudgetLine[] = [
  { id: "mortgage", label: "Mortgage / rent", amount: 0 },
  { id: "utilities", label: "Utilities", amount: 0 },
  { id: "insurance", label: "Insurance / STR coverage", amount: 0 },
  { id: "supplies", label: "Supplies & restocking", amount: 0 },
  { id: "cleaning_labor", label: "Cleaning labor (host-paid)", amount: 0 },
  { id: "internet", label: "Internet / Wi‑Fi", amount: 0 },
  { id: "software", label: "Software & channel tools", amount: 0 },
  { id: "taxes", label: "Taxes / HOA / permits", amount: 0 },
  { id: "other", label: "Other monthly costs", amount: 0 },
];

const PRODUCT_BUDGET: GuideCalcBudgetLine[] = [
  { id: "ads", label: "Ads / marketing (override if using slider)", amount: 0 },
  { id: "tools", label: "Software / apps", amount: 0 },
  { id: "other", label: "Other monthly costs", amount: 0 },
];

const SOCIAL_BUDGET: GuideCalcBudgetLine[] = [
  { id: "tools", label: "Camera / editing / tools", amount: 0 },
  { id: "ads", label: "Boost / ads", amount: 0 },
  { id: "other", label: "Other monthly costs", amount: 0 },
];

/** Guide IDs that use lodging (STR) math. */
const LODGING_IDS = new Set(["airbnb", "str-cohost", "airbnb-cohost", "property-mgmt"]);

/** Guide IDs that use product / ecom math. */
const PRODUCT_IDS = new Set([
  "pod",
  "dropshipping",
  "amazon",
  "digital-products",
  "book-publishing",
  "canva-flyer-creator",
]);

/** Guide IDs that use social monetization math. */
const SOCIAL_IDS = new Set(["social", "affiliate"]);

export function guideCalcModeForId(guideId: string): GuideCalcMode {
  const id = String(guideId || "").trim();
  if (LODGING_IDS.has(id)) return "lodging";
  if (PRODUCT_IDS.has(id)) return "product";
  if (SOCIAL_IDS.has(id)) return "social";
  return "service";
}

export function guideCalcProfileForId(guideId: string, guideName?: string): GuideCalcProfile {
  const mode = guideCalcModeForId(guideId);
  const name = (guideName || guideId || "this hustle").trim();

  if (mode === "lodging") {
    return {
      mode,
      title: `${name} — monthly profit`,
      blurb:
        "Enter booking revenue vs. your monthly hosting costs. No ZIP required — edit budget lines for your market.",
      defaults: {
        nightlyRate: 0,
        occupancyPercent: 0,
        cleaningFee: 0,
        avgStayNights: 0,
      },
      budget: LODGING_BUDGET.map((l) => ({ ...l })),
    };
  }

  if (mode === "product") {
    return {
      mode,
      title: `${name} — monthly profit`,
      blurb: "Enter sales volume, product cost, and ads to estimate monthly profit.",
      defaults: {
        units: 0,
        price: 0,
        unitCost: 0,
        adSpend: 0,
      },
      budget: PRODUCT_BUDGET.map((l) => ({ ...l })),
    };
  }

  if (mode === "social") {
    return {
      mode,
      title: `${name} — monthly profit`,
      blurb: "Enter followers, engagement, and sponsored posts to estimate monthly profit.",
      defaults: {
        followers: 0,
        engagementPercent: 0,
        sponsorPosts: 0,
        cpm: 0,
      },
      budget: SOCIAL_BUDGET.map((l) => ({ ...l })),
    };
  }

  return {
    mode: "service",
    title: `${name} — monthly profit`,
    blurb: "Enter jobs (or clients) per month, average sale, and your operating costs.",
    defaults: {
      jobsPerMonth: 0,
      avgTicket: 0,
    },
    budget: SERVICE_BUDGET.map((l) => ({ ...l })),
  };
}

export type GuideCalcResult = {
  revenue: number;
  expenses: number;
  net: number;
  marginPercent: number;
  notes: string[];
};

export function sumBudget(lines: GuideCalcBudgetLine[]): number {
  return lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
}

export function computeGuideCalc(
  mode: GuideCalcMode,
  inputs: Record<string, number>,
  budget: GuideCalcBudgetLine[],
): GuideCalcResult {
  const notes: string[] = [];
  const expenses = sumBudget(budget);

  if (mode === "lodging") {
    const nightly = Math.max(0, inputs.nightlyRate || 0);
    const occ = Math.min(100, Math.max(0, inputs.occupancyPercent || 0)) / 100;
    const cleaning = Math.max(0, inputs.cleaningFee || 0);
    const avgStay = Math.max(1, inputs.avgStayNights || 1);
    const nightsBooked = 30 * occ;
    const bookings = nightsBooked <= 0 ? 0 : Math.round(nightsBooked / avgStay);
    const revenue = nightly * nightsBooked + cleaning * bookings;
    const net = revenue - expenses;
    if (bookings > 0) notes.push(`~${bookings} bookings/mo (avg ${avgStay}-night stay)`);
    if (occ > 0) notes.push(`${Math.round(occ * 100)}% occupancy`);
    return {
      revenue,
      expenses,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
    };
  }

  if (mode === "product") {
    const units = Math.max(0, inputs.units || 0);
    const price = Math.max(0, inputs.price || 0);
    const unitCost = Math.max(0, inputs.unitCost || 0);
    const adSpend = Math.max(0, inputs.adSpend || 0);
    const revenue = units * price;
    const cogs = units * unitCost;
    const budgetSansAds = sumBudget(budget.filter((l) => l.id !== "ads"));
    const expensesTotal = budgetSansAds + adSpend + cogs;
    const net = revenue - expensesTotal;
    if (units > 0 || adSpend > 0) {
      notes.push(`${units} units · COGS ${unitCost}/unit · ads $${adSpend}`);
    }
    return {
      revenue,
      expenses: expensesTotal,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
    };
  }

  if (mode === "social") {
    const followers = Math.max(0, inputs.followers || 0);
    const eng = Math.min(100, Math.max(0, inputs.engagementPercent || 0)) / 100;
    const posts = Math.max(0, inputs.sponsorPosts || 0);
    const cpm = Math.max(0, inputs.cpm || 0);
    const feePerPost =
      followers <= 0 || posts <= 0
        ? 0
        : Math.max(
            0,
            Math.round((followers * eng * cpm) / 100) + Math.round(followers * 0.005),
          );
    const revenue = feePerPost * posts;
    const net = revenue - expenses;
    if (feePerPost > 0) notes.push(`Est. $${feePerPost}/sponsored post`);
    return {
      revenue,
      expenses,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
    };
  }

  // service
  const jobs = Math.max(0, inputs.jobsPerMonth || 0);
  const sale = Math.max(0, inputs.avgTicket || 0);
  const revenue = jobs * sale;
  const net = revenue - expenses;
  if (jobs > 0 || sale > 0) notes.push(`${jobs} jobs × $${sale} avg sale`);
  return {
    revenue,
    expenses,
    net,
    marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
    notes,
  };
}

export function formatGuideCalcMoney(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Parse a calculator number field without trapping the user on 0.
 * Empty / in-progress input counts as 0 for math but stays blank in the UI.
 */
export function parseGuideCalcField(raw: string): number {
  const trimmed = String(raw).trim();
  if (trimmed === "" || trimmed === "." || trimmed === "-") return 0;
  const n = Number(trimmed);
  if (Number.isFinite(n)) return Math.max(0, n);
  const fallback = Number(String(raw).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(fallback) ? Math.max(0, fallback) : 0;
}

/** Show blank instead of 0 so the user can type over the field. */
export function guideCalcFieldDisplay(numeric: number, draft?: string): string {
  if (draft !== undefined) return draft;
  if (numeric === 0) return "";
  return String(numeric);
}
