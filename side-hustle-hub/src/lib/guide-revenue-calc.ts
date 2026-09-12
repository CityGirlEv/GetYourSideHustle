/**
 * Per-guide monthly revenue / profit estimates for Launch Guide calculator tab.
 * Planning math only — not guarantees. All defaults start at 0 — user enters values.
 */

export type GuideCalcMode =
  | "service"
  | "lodging"
  | "product"
  | "social"
  | "delivery"
  | "resale"
  | "research"
  | "impact"
  | "kindness"
  | "split";

export type GuideCalcBudgetLine = { id: string; label: string; amount: number };

export type GuideCalcProfile = {
  mode: GuideCalcMode;
  title: string;
  blurb: string;
  /** Default revenue inputs (mode-specific keys) — always start at 0. */
  defaults: Record<string, number>;
  budget: GuideCalcBudgetLine[];
  /** Extra disclaimer under the header (e.g. delivery cash vs tax mileage). */
  disclaimerExtra?: string;
};

const SERVICE_BUDGET: GuideCalcBudgetLine[] = [
  { id: "supplies", label: "Supplies / materials", amount: 0 },
  { id: "transport", label: "Transport / mileage", amount: 0 },
  { id: "software", label: "Advertising", amount: 0 },
  { id: "insurance", label: "Insurance / permits", amount: 0 },
  { id: "other", label: "Other monthly costs", amount: 0 },
];

const DELIVERY_BUDGET: GuideCalcBudgetLine[] = [
  { id: "fuel", label: "Fuel cost ($)", amount: 0 },
  { id: "tolls", label: "Tolls / parking ($)", amount: 0 },
  { id: "other", label: "Other expenses ($)", amount: 0 },
];

const RIDESHARE_BUDGET: GuideCalcBudgetLine[] = [
  { id: "fuel", label: "Fuel / charging ($)", amount: 0 },
  { id: "tolls", label: "Tolls / parking paid by driver ($)", amount: 0 },
  { id: "cleaning", label: "Cleaning ($)", amount: 0 },
  { id: "maintenance", label: "Maintenance reserve ($)", amount: 0 },
  { id: "insurance", label: "Insurance / rideshare coverage allocation ($)", amount: 0 },
  { id: "other", label: "Other expenses ($)", amount: 0 },
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
const LODGING_IDS = new Set(["airbnb", "str-cohost", "airbnb-cohost"]);

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

/** DoorDash / Uber Eats–style delivery driver session math (cash expenses, not IRS mileage). */
const DELIVERY_IDS = new Set(["food-delivery", "rideshare"]);

/** Per-item resale profit math (estate / antique reseller). */
const RESALE_IDS = new Set(["estate-sale-listing-helper"]);

/** Per-project genealogy / research service profit math. */
const RESEARCH_IDS = new Set(["family-history-organizer"]);

/** Free give-back impact hours (not revenue). */
const IMPACT_IDS = new Set(["junior-give-back-teach"]);

/** Kids kindness counter (not revenue) — Guide #008. */
const KINDNESS_IDS = new Set(["kids-kindness-share"]);

/** Fun/Save/Grow or Save/Enjoy/Grow money splitter — Guides #074 / #099. */
const SPLIT_IDS = new Set(["kids-reinvest-jar", "junior-reinvest-ceo"]);

export function guideCalcModeForId(guideId: string): GuideCalcMode {
  const id = String(guideId || "").trim();
  if (KINDNESS_IDS.has(id)) return "kindness";
  if (IMPACT_IDS.has(id)) return "impact";
  if (SPLIT_IDS.has(id)) return "split";
  if (DELIVERY_IDS.has(id)) return "delivery";
  if (RESALE_IDS.has(id)) return "resale";
  if (RESEARCH_IDS.has(id)) return "research";
  if (LODGING_IDS.has(id)) return "lodging";
  if (PRODUCT_IDS.has(id)) return "product";
  if (SOCIAL_IDS.has(id)) return "social";
  return "service";
}

export function guideCalcProfileForId(guideId: string, guideName?: string): GuideCalcProfile {
  const mode = guideCalcModeForId(guideId);
  const name = (guideName || guideId || "this hustle").trim();
  const id = String(guideId || "").trim();

  if (mode === "kindness") {
    return {
      mode,
      title: `${name} — My Kindness Counter`,
      blurb:
        "This activity is FREE. Count give-back activities, people helped, and helping minutes — not dollars.",
      disclaimerExtra:
        "No revenue or profit for #008. Kindness Counter tracks impact only.",
      defaults: {
        activitiesCompleted: 0,
        peopleHelped: 0,
        minutesHelping: 0,
        monthlyGoal: 0,
      },
      budget: [],
    };
  }

  if (mode === "split") {
    const kids = id === "kids-reinvest-jar";
    return {
      mode,
      title: kids ? `${name} — Money Splitter` : `${name} — CEO Money Splitter`,
      blurb: kids
        ? "Enter money earned, costs, and Fun / Save / Grow percentages (must total 100%). Split only the money left after costs."
        : "Enter money collected, hustle expenses, and Save / Enjoy / Grow percentages (must total 100%). Split only Money Available after expenses.",
      disclaimerExtra: kids
        ? "Do not call all the money you collected “profit.” Fun / Save / Grow percentages MUST add to 100%."
        : "Do not call gross money collected “profit.” Expenses must be deducted BEFORE the split. Percentages MUST total 100%.",
      defaults: {
        moneyCollected: 0,
        hustleExpenses: 0,
        savePercent: 0,
        enjoyPercent: 0,
        growPercent: 0,
      },
      budget: [],
    };
  }

  if (mode === "impact") {
    return {
      mode,
      title: `${name} — My Give-Back Impact Calculator`,
      blurb:
        "Track people helped and hours given — this session is FREE. Optional future paid example is labeled separately and is not current income.",
      disclaimerExtra:
        "Current #009 session is FREE. Any “if I later charged” figure is a FUTURE EXAMPLE ONLY — not a promise or current price.",
      defaults: {
        sessions: 0,
        peoplePerSession: 0,
        minutesPerSession: 0,
        prepMinutesPerSession: 0,
        futureRatePerSession: 0,
        futureSessionCount: 0,
      },
      budget: [],
    };
  }

  if (mode === "delivery") {
    const rideshare = id === "rideshare";
    return {
      mode,
      title: rideshare ? `${name} — Rideshare Profit Calculator` : `${name} — Delivery Driver mode`,
      blurb: rideshare
        ? "Enter app earnings, tips, bonuses, online hours, miles, and cash vehicle expenses. Gross in the app is not profit."
        : "Enter session hours, deliveries, base pay, tips, promotions, miles, and cash expenses (fuel, tolls, other). Estimates are for planning only.",
      disclaimerExtra:
        "Estimates are for planning purposes only. Actual earnings, expenses and tax treatment vary. This calculator uses cash vehicle costs you enter — it does NOT subtract the IRS standard mileage deduction (a tax deduction is not the same as cash spent).",
      defaults: {
        hoursWorked: 0,
        deliveries: 0,
        baseEarnings: 0,
        tips: 0,
        promotions: 0,
        totalMiles: 0,
      },
      budget: (rideshare ? RIDESHARE_BUDGET : DELIVERY_BUDGET).map((l) => ({ ...l })),
    };
  }

  if (mode === "resale") {
    return {
      mode,
      title: `${name} — Resale Profit Calculator`,
      blurb:
        "Enter one item’s purchase price, expected selling price, fees, and costs. See estimated net profit, margin, ROI, and the maximum you should pay.",
      disclaimerExtra:
        "Planning estimates only. Actual prices, fees, shipping, taxes, and expenses vary.",
      defaults: {
        purchasePrice: 0,
        expectedSellingPrice: 0,
        marketplaceFees: 0,
        paymentFees: 0,
        shippingPaidBySeller: 0,
        packagingCost: 0,
        cleaningRepairCost: 0,
        otherCosts: 0,
        desiredProfit: 0,
      },
      budget: [],
    };
  }

  if (mode === "research") {
    return {
      mode,
      title: `${name} — Service Profit Calculator`,
      blurb:
        "Enter hourly rate, research hours, optional package price, and project expenses. See net profit, effective hourly rate, and a recommended quote.",
      disclaimerExtra:
        "Planning estimates only. Actual time, record availability, travel, subscriptions, and research expenses vary.",
      defaults: {
        hourlyRate: 0,
        researchHours: 0,
        clientPackagePrice: 0,
        databaseCosts: 0,
        recordFees: 0,
        printingScanning: 0,
        travelMileage: 0,
        otherExpenses: 0,
      },
      budget: [],
    };
  }

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
    const isDigitalProducts = id === "digital-products";
    return {
      mode,
      title: isDigitalProducts
        ? `${name} — Digital Product Profit Calculator`
        : `${name} — monthly profit`,
      blurb: isDigitalProducts
        ? "Enter product price, sales per month, fees, ads, software, refunds, and other expenses. See gross revenue, estimated profit, profit per sale, margin, and sales needed for a monthly profit goal (rounded up)."
        : "Enter sales volume, product cost, and ads to estimate monthly profit.",
      disclaimerExtra: isDigitalProducts
        ? "Planning estimates only. Revenue is not profit. Fees, ads, software, refunds, and other expenses reduce profit. Examples are not income guarantees."
        : undefined,
      defaults: {
        units: 0,
        price: 0,
        unitCost: 0,
        adSpend: 0,
        ...(isDigitalProducts ? { monthlyProfitGoal: 0 } : {}),
      },
      budget: isDigitalProducts
        ? [
            { id: "platform", label: "Platform fees", amount: 0 },
            { id: "payment", label: "Payment processing fees", amount: 0 },
            { id: "advertising", label: "Advertising", amount: 0 },
            { id: "software", label: "Software", amount: 0 },
            { id: "refunds", label: "Refunds", amount: 0 },
            { id: "other", label: "Other expenses", amount: 0 },
          ]
        : PRODUCT_BUDGET.map((l) => ({ ...l })),
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
    title:
      id === "kids-party-game-host"
        ? `${name} — Service Profit Calculator`
        : id === "lead-followup-assistant"
          ? `${name} — Service Revenue Calculator`
          : id === "personal-shopper"
            ? `${name} — Personal Shopper Profit Calculator`
            : id === "youth-sports-helper"
              ? `${name} — Practice Helper Earnings Calculator`
              : id === "local-content-photographer"
                ? `${name} — Service Profit Calculator`
                : id === "appointment-setter"
                  ? `${name} — Appointment Setter Profit Calculator`
                  : id === "online-research-assistant"
                    ? `${name} — Online Research Profit Calculator`
                    : id === "mothers-helper"
                      ? `${name} — Mother's Helper Earnings Calculator`
                      : id === "babysitting"
                        ? `${name} — Babysitting Earnings Calculator`
                        : id === "local-event-content-creator"
                          ? `${name} — Local Event Content Profit Calculator`
                          : id === "property-mgmt"
                            ? `${name} — Property Management Profit Calculator`
                : `${name} — monthly profit`,
    blurb:
      id === "kids-party-game-host"
        ? "Enter party price, number of parties, and expenses (supplies, prizes, travel, other). See gross revenue, net profit, and profit per party."
        : id === "lead-followup-assistant"
          ? "Enter monthly client fee, number of clients, software/other expenses, and hours per client. See monthly profit and effective hourly earnings."
          : id === "personal-shopper"
            ? "Enter shopping fee, jobs per week, add-ons, and travel/other expenses. See weekly profit and approximate monthly profit. Do NOT count merchandise reimbursement as income."
            : id === "youth-sports-helper"
              ? "Enter pay per practice, practices per week, extra event pay, travel/other expenses, and hours per practice. See weekly profit, monthly estimate, hours, and effective hourly earnings."
              : id === "local-content-photographer"
                ? "Enter price per shoot, number of shoots, travel/other expenses, and shoot + editing hours. See net profit and effective hourly earnings."
                : id === "appointment-setter"
                  ? "Enter project price, projects per week, recurring client revenue, hours worked, and software/phone expenses. See weekly profit, monthly estimate, and effective hourly rate."
                  : id === "online-research-assistant"
                    ? "Enter project price, projects per week, research hours and admin/formatting hours per project, plus software and other expenses. See weekly profit, monthly estimate, total hours, and effective hourly rate."
                    : id === "mothers-helper"
                      ? "Enter average job price, jobs per week, tips/extra approved pay, weekly expenses, and hours worked per week. See weekly revenue, weekly profit, monthly estimate, and effective hourly rate. Parent must remain present."
                      : id === "babysitting"
                        ? "Enter hourly rate, hours per job, jobs per week, add-on income, and weekly expenses. Job pay = rate × hours. Weekly revenue = job pay × jobs + add-ons. Monthly estimate = weekly profit × 4.33."
                        : id === "local-event-content-creator"
                          ? "Enter project price, projects per week, tips/extra approved pay, hours per project, and expenses. Weekly profit × 4.33 = monthly estimate. Effective profit per hour = weekly profit ÷ total weekly hours."
                          : id === "property-mgmt"
                            ? "Enter number of properties, average management/service fee per property, one-time/other earned fees, and business expenses. Recurring revenue = properties × fee. Do not count owner/client funds as your revenue."
                : "Enter jobs (or clients) per month, average sale, and your operating costs.",
    disclaimerExtra:
      id === "kids-party-game-host"
        ? "Planning estimates only. Actual prices and expenses vary."
        : id === "lead-followup-assistant"
          ? "Examples are planning estimates only. Actual pricing, workload, expenses, and results vary."
          : id === "personal-shopper"
            ? "Planning estimates only. Actual fees, expenses, demand, and earnings vary. Merchandise reimbursement is not shopper income."
            : id === "youth-sports-helper"
              ? "Planning estimates only. Rates, schedules, expenses, and requirements vary."
              : id === "local-content-photographer"
                ? "Planning estimates only. Actual prices, expenses, workload, and earnings vary."
                : id === "appointment-setter"
                  ? "Planning estimates only. Actual project volume, retainers, expenses, and booking rates vary. Do not promise every lead will book."
                  : id === "online-research-assistant"
                    ? "Planning estimates only. Actual project volume, hours, expenses, and earnings vary. A low project price with high hours means a weak effective hourly rate."
                    : id === "mothers-helper"
                      ? "Planning estimates only. Actual job volume, tips, expenses, and earnings vary. This calculator is for parent-present Mother's Helper work — not solo babysitting."
                      : id === "babysitting"
                        ? "Planning estimates only. Actual rates, hours, add-ons, expenses, and earnings vary. Examples are not income guarantees."
                        : id === "local-event-content-creator"
                          ? "Planning estimates only. Revenue is money received. Profit is money remaining after business expenses. Examples are not income guarantees."
                          : id === "property-mgmt"
                            ? "Owner rent, tenant security deposits, taxes, guest payments, repair funds, or other client money should NOT be counted as earned revenue. Only count fees your business actually earns."
                : undefined,
    defaults: {
      jobsPerMonth: 0,
      avgTicket: 0,
      ...(id === "lead-followup-assistant" ? { hoursPerClient: 0 } : {}),
      ...(id === "personal-shopper" ? { addOnFees: 0 } : {}),
      ...(id === "youth-sports-helper" ? { extraEventPay: 0, hoursPerPractice: 0 } : {}),
      ...(id === "local-event-content-creator" ? { extraEventPay: 0, hoursPerShoot: 0 } : {}),
      ...(id === "property-mgmt" ? { addOnFees: 0 } : {}),
      ...(id === "local-content-photographer"
        ? { hoursPerShoot: 0, editingHoursPerShoot: 0 }
        : {}),
      ...(id === "appointment-setter"
        ? { recurringClientRevenue: 0, hoursPerClient: 0 }
        : {}),
      ...(id === "online-research-assistant"
        ? { researchHoursPerProject: 0, adminHoursPerProject: 0 }
        : {}),
      ...(id === "mothers-helper" ? { extraEventPay: 0, hoursWorkedPerWeek: 0 } : {}),
      ...(id === "babysitting" ? { hoursPerJob: 0, extraEventPay: 0 } : {}),
    },
    budget:
      id === "kids-party-game-host"
        ? [
            { id: "supplies", label: "Supply cost", amount: 0 },
            { id: "prizes", label: "Prize cost", amount: 0 },
            { id: "transport", label: "Travel cost", amount: 0 },
            { id: "other", label: "Other expenses", amount: 0 },
          ]
        : id === "lead-followup-assistant"
          ? [
              { id: "software", label: "Monthly software cost", amount: 0 },
              { id: "other", label: "Other monthly expenses", amount: 0 },
            ]
          : id === "personal-shopper"
            ? [
                { id: "transport", label: "Mileage / travel cost", amount: 0 },
                { id: "other", label: "Other expenses", amount: 0 },
              ]
            : id === "youth-sports-helper"
              ? [
                  { id: "transport", label: "Weekly travel expenses", amount: 0 },
                  { id: "other", label: "Other expenses", amount: 0 },
                ]
              : id === "local-content-photographer"
                ? [
                    { id: "transport", label: "Travel cost per shoot (total for period)", amount: 0 },
                    { id: "other", label: "Other expenses", amount: 0 },
                  ]
                : id === "appointment-setter"
                  ? [
                      { id: "software", label: "Software / phone expense ($)", amount: 0 },
                      { id: "other", label: "Other expenses ($)", amount: 0 },
                    ]
                      : id === "online-research-assistant"
                    ? [
                        { id: "software", label: "Software costs ($ / week)", amount: 0 },
                        { id: "other", label: "Other expenses ($ / week)", amount: 0 },
                      ]
                    : id === "local-event-content-creator"
                      ? [
                          { id: "transport", label: "Travel/mileage cost ($ / week)", amount: 0 },
                          { id: "tolls", label: "Parking/tolls ($ / week)", amount: 0 },
                          { id: "software", label: "Editing/app costs ($ / week)", amount: 0 },
                          { id: "other", label: "Other expenses ($ / week)", amount: 0 },
                        ]
                      : id === "property-mgmt"
                        ? [
                            { id: "software", label: "Software ($)", amount: 0 },
                            { id: "internet", label: "Phone/internet business allocation ($)", amount: 0 },
                            { id: "transport", label: "Travel ($)", amount: 0 },
                            { id: "insurance", label: "Insurance ($)", amount: 0 },
                            { id: "admin", label: "Contractor/admin help ($)", amount: 0 },
                            { id: "ads", label: "Marketing ($)", amount: 0 },
                            { id: "other", label: "Other business expenses ($)", amount: 0 },
                          ]
                    : id === "mothers-helper"
                      ? [{ id: "other", label: "Weekly expenses ($)", amount: 0 }]
                      : id === "babysitting"
                        ? [{ id: "other", label: "Weekly expenses ($)", amount: 0 }]
                : SERVICE_BUDGET.map((l) => ({ ...l })),
  };
}

export type GuideCalcResult = {
  revenue: number;
  expenses: number;
  net: number;
  marginPercent: number;
  notes: string[];
  /** Delivery / resale / research extras (optional). */
  metrics?: {
    grossPerMile?: number;
    grossPerHour?: number;
    netPerHour?: number;
    netPerDelivery?: number;
    maxBuyPrice?: number;
    roiPercent?: number;
    totalInvestment?: number;
    totalSellingCosts?: number;
    totalCost?: number;
    recommendedQuote?: number;
    hourlyRevenue?: number;
    totalPeopleHelped?: number;
    teachingHours?: number;
    prepHours?: number;
    totalGiveBackHours?: number;
    futureExampleRevenue?: number;
    totalActivities?: number;
    totalPeopleHelpedKindness?: number;
    totalHelpingMinutes?: number;
    totalHelpingHours?: number;
    kindnessMonthlyGoal?: number;
    kindnessStillToGo?: number;
    moneyAvailable?: number;
    saveAmount?: number;
    enjoyAmount?: number;
    growAmount?: number;
    percentTotal?: number;
    percentagesValid?: boolean;
    salesNeeded?: number;
    profitPerSale?: number;
  };
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

  if (mode === "kindness") {
    const activities = Math.max(0, inputs.activitiesCompleted || 0);
    const people = Math.max(0, inputs.peopleHelped || 0);
    const minutes = Math.max(0, inputs.minutesHelping || 0);
    const monthlyGoal = Math.max(0, inputs.monthlyGoal || 0);
    const totalHelpingHours = minutes / 60;
    const stillToGo = Math.max(0, monthlyGoal - activities);
    if (activities > 0 || people > 0 || minutes > 0) {
      notes.push(
        `${activities} activit${activities === 1 ? "y" : "ies"} · ${people} people helped · ${minutes} minutes (${totalHelpingHours.toFixed(1)} hrs)`,
      );
    }
    if (monthlyGoal > 0) {
      notes.push(
        `Monthly kindness goal: ${monthlyGoal} · completed ${activities} · still to go ${stillToGo}`,
      );
    }
    return {
      revenue: 0,
      expenses: 0,
      net: totalHelpingHours,
      marginPercent: 0,
      notes,
      metrics: {
        totalActivities: activities,
        totalPeopleHelpedKindness: people,
        totalHelpingMinutes: minutes,
        totalHelpingHours,
        kindnessMonthlyGoal: monthlyGoal,
        kindnessStillToGo: stillToGo,
      },
    };
  }

  if (mode === "split") {
    const collected = Math.max(0, inputs.moneyCollected || 0);
    const expensesIn = Math.max(0, inputs.hustleExpenses || 0);
    const savePercent = Math.max(0, inputs.savePercent || 0);
    const enjoyPercent = Math.max(0, inputs.enjoyPercent || 0);
    const growPercent = Math.max(0, inputs.growPercent || 0);
    const moneyAvailable = Math.max(0, collected - expensesIn);
    const percentTotal = savePercent + enjoyPercent + growPercent;
    const percentagesValid = Math.abs(percentTotal - 100) < 0.01;
    const saveAmount = percentagesValid ? (moneyAvailable * savePercent) / 100 : 0;
    const enjoyAmount = percentagesValid ? (moneyAvailable * enjoyPercent) / 100 : 0;
    const growAmount = percentagesValid ? (moneyAvailable * growPercent) / 100 : 0;
    notes.push("Money collected is not automatically profit. Split only money left after costs.");
    if (!percentagesValid) {
      notes.push(
        `Percentages currently total ${percentTotal}% — they MUST equal 100% before the split.`,
      );
    } else {
      notes.push(
        `Split of $${moneyAvailable.toFixed(2)}: Save $${saveAmount.toFixed(2)} · Enjoy/Fun $${enjoyAmount.toFixed(2)} · Grow $${growAmount.toFixed(2)}`,
      );
    }
    return {
      revenue: collected,
      expenses: expensesIn,
      net: moneyAvailable,
      marginPercent: percentagesValid ? growPercent : 0,
      notes,
      metrics: {
        moneyAvailable,
        saveAmount,
        enjoyAmount,
        growAmount,
        percentTotal,
        percentagesValid,
      },
    };
  }

  if (mode === "impact") {
    const sessions = Math.max(0, inputs.sessions || 0);
    const people = Math.max(0, inputs.peoplePerSession || 0);
    const minutes = Math.max(0, inputs.minutesPerSession || 0);
    const prep = Math.max(0, inputs.prepMinutesPerSession || 0);
    const rate = Math.max(0, inputs.futureRatePerSession || 0);
    const futureSessions = Math.max(0, inputs.futureSessionCount || 0);
    const totalPeopleHelped = sessions * people;
    const teachingHours = (sessions * minutes) / 60;
    const prepHours = (sessions * prep) / 60;
    const totalGiveBackHours = teachingHours + prepHours;
    const futureExampleRevenue =
      rate > 0 && futureSessions > 0 ? rate * futureSessions : undefined;
    if (sessions > 0 || people > 0) {
      notes.push(
        `${sessions} session(s) · ${people} people/session · ${minutes} min teaching · ${prep} min prep`,
      );
    }
    if (futureExampleRevenue != null) {
      notes.push(
        `FUTURE EXAMPLE ONLY: ${futureSessions} session(s) × $${rate} = $${futureExampleRevenue.toFixed(2)} (not current income — #009 is FREE)`,
      );
    }
    return {
      revenue: 0,
      expenses: 0,
      net: totalGiveBackHours,
      marginPercent: 0,
      notes,
      metrics: {
        totalPeopleHelped,
        teachingHours,
        prepHours,
        totalGiveBackHours,
        futureExampleRevenue,
      },
    };
  }

  if (mode === "delivery") {
    const hours = Math.max(0, inputs.hoursWorked || 0);
    const deliveries = Math.max(0, inputs.deliveries || 0);
    const base = Math.max(0, inputs.baseEarnings || 0);
    const tips = Math.max(0, inputs.tips || 0);
    const promos = Math.max(0, inputs.promotions || 0);
    const miles = Math.max(0, inputs.totalMiles || 0);
    const revenue = base + tips + promos;
    const net = revenue - expenses;
    if (base > 0 || tips > 0 || promos > 0) {
      notes.push(
        `Gross $${revenue.toFixed(0)} (base $${base.toFixed(0)} + tips $${tips.toFixed(0)} + promos $${promos.toFixed(0)})`,
      );
    }
    const metrics = {
      grossPerMile: miles > 0 ? revenue / miles : undefined,
      grossPerHour: hours > 0 ? revenue / hours : undefined,
      netPerHour: hours > 0 ? net / hours : undefined,
      netPerDelivery: deliveries > 0 ? net / deliveries : undefined,
    };
    return {
      revenue,
      expenses,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
      metrics,
    };
  }

  if (mode === "resale") {
    const purchase = Math.max(0, inputs.purchasePrice || 0);
    const selling = Math.max(0, inputs.expectedSellingPrice || 0);
    const marketplaceFees = Math.max(0, inputs.marketplaceFees || 0);
    const paymentFees = Math.max(0, inputs.paymentFees || 0);
    const shipping = Math.max(0, inputs.shippingPaidBySeller || 0);
    const packaging = Math.max(0, inputs.packagingCost || 0);
    const cleaning = Math.max(0, inputs.cleaningRepairCost || 0);
    const other = Math.max(0, inputs.otherCosts || 0);
    const desiredProfit = Math.max(0, inputs.desiredProfit || 0);

    const totalInvestment = purchase + packaging + cleaning + other;
    const totalSellingCosts = marketplaceFees + paymentFees + shipping;
    const totalCost = totalInvestment + totalSellingCosts;
    const net = selling - totalCost;
    const feesAndExpenses =
      marketplaceFees + paymentFees + shipping + packaging + cleaning + other;
    const maxBuyPrice = selling - feesAndExpenses - desiredProfit;
    const roiPercent = totalInvestment > 0 ? (net / totalInvestment) * 100 : 0;

    if (selling > 0 || purchase > 0) {
      notes.push(
        `Investment $${totalInvestment.toFixed(2)} · Selling costs $${totalSellingCosts.toFixed(2)} · Total cost $${totalCost.toFixed(2)}`,
      );
    }

    return {
      revenue: selling,
      expenses: totalCost,
      net,
      marginPercent: selling > 0 ? (net / selling) * 100 : 0,
      notes,
      metrics: {
        maxBuyPrice,
        roiPercent,
        totalInvestment,
        totalSellingCosts,
        totalCost,
      },
    };
  }

  if (mode === "research") {
    const hourlyRate = Math.max(0, inputs.hourlyRate || 0);
    const researchHours = Math.max(0, inputs.researchHours || 0);
    const packagePrice = Math.max(0, inputs.clientPackagePrice || 0);
    const databaseCosts = Math.max(0, inputs.databaseCosts || 0);
    const recordFees = Math.max(0, inputs.recordFees || 0);
    const printingScanning = Math.max(0, inputs.printingScanning || 0);
    const travelMileage = Math.max(0, inputs.travelMileage || 0);
    const otherExpenses = Math.max(0, inputs.otherExpenses || 0);

    const hourlyRevenue = hourlyRate * researchHours;
    const revenue = packagePrice > 0 ? packagePrice : hourlyRevenue;
    const totalExpenses =
      databaseCosts + recordFees + printingScanning + travelMileage + otherExpenses;
    const net = revenue - totalExpenses;
    const recommendedQuote = hourlyRevenue + totalExpenses;

    if (packagePrice > 0) {
      notes.push(`Using client package price $${packagePrice.toFixed(2)} as gross revenue`);
    } else if (hourlyRevenue > 0) {
      notes.push(`Hourly revenue $${hourlyRevenue.toFixed(2)} (${researchHours} hrs × $${hourlyRate})`);
    }
    if (recommendedQuote > 0) {
      notes.push(`Recommended quote (hours × rate + expenses): $${recommendedQuote.toFixed(2)}`);
    }

    return {
      revenue,
      expenses: totalExpenses,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
      metrics: {
        hourlyRevenue,
        recommendedQuote,
        netPerHour: researchHours > 0 ? net / researchHours : undefined,
        totalCost: totalExpenses,
      },
    };
  }

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
    const hasGoal = Object.prototype.hasOwnProperty.call(inputs, "monthlyProfitGoal");
    const profitPerSale = units > 0 ? net / units : 0;
    const goal = Math.max(0, inputs.monthlyProfitGoal || 0);
    const salesNeeded = profitPerSale > 0 ? Math.ceil(goal / profitPerSale) : 0;
    if (hasGoal) {
      notes.push(
        `${units} sales · $${price} price · profit per sale $${profitPerSale.toFixed(2)}`,
      );
      if (goal > 0) notes.push(`Sales needed for $${goal} profit goal (rounded up): ${salesNeeded}`);
    } else if (units > 0 || adSpend > 0) {
      notes.push(`${units} units · COGS ${unitCost}/unit · ads $${adSpend}`);
    }
    return {
      revenue,
      expenses: expensesTotal,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
      metrics: hasGoal ? { profitPerSale, salesNeeded } : undefined,
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
  const hasAddOnField = Object.prototype.hasOwnProperty.call(inputs, "addOnFees");
  const hasExtraEventPay = Object.prototype.hasOwnProperty.call(inputs, "extraEventPay");
  const hasRecurringClientRevenue = Object.prototype.hasOwnProperty.call(
    inputs,
    "recurringClientRevenue",
  );
  const addOns = Math.max(0, inputs.addOnFees || 0);
  const extraEventPay = Math.max(0, inputs.extraEventPay || 0);
  const recurringClientRevenue = Math.max(0, inputs.recurringClientRevenue || 0);
  const hoursPerClient = Math.max(0, inputs.hoursPerClient || 0);
  const hoursPerShoot = Math.max(0, inputs.hoursPerShoot || 0);
  const editingHours = Math.max(0, inputs.editingHoursPerShoot || 0);
  const hoursPerPractice = Math.max(0, inputs.hoursPerPractice || 0);
  const hasResearchAdminHours =
    Object.prototype.hasOwnProperty.call(inputs, "researchHoursPerProject") ||
    Object.prototype.hasOwnProperty.call(inputs, "adminHoursPerProject");
  const researchHoursPerProject = Math.max(0, inputs.researchHoursPerProject || 0);
  const adminHoursPerProject = Math.max(0, inputs.adminHoursPerProject || 0);
  const hasHoursWorkedPerWeek = Object.prototype.hasOwnProperty.call(
    inputs,
    "hoursWorkedPerWeek",
  );
  const hoursWorkedPerWeek = Math.max(0, inputs.hoursWorkedPerWeek || 0);
  const hasHoursPerJob = Object.prototype.hasOwnProperty.call(inputs, "hoursPerJob");
  const hoursPerJob = Math.max(0, inputs.hoursPerJob || 0);
  const revenue = hasHoursPerJob
    ? jobs * (sale * hoursPerJob) + extraEventPay
    : hasRecurringClientRevenue
    ? jobs * sale + recurringClientRevenue
    : hasExtraEventPay
      ? jobs * sale + extraEventPay
      : jobs * (sale + addOns);
  const net = revenue - expenses;
  const totalHoursFromClient = hasRecurringClientRevenue
    ? hoursPerClient
    : hoursPerClient * jobs;
  const totalHoursFromShoot = (hoursPerShoot + editingHours) * jobs;
  const totalHoursFromPractice = hoursPerPractice * jobs;
  const totalHoursFromResearch = hasResearchAdminHours
    ? (researchHoursPerProject + adminHoursPerProject) * jobs
    : 0;
  const totalHours = hasHoursPerJob
    ? hoursPerJob * jobs
    : hasHoursWorkedPerWeek
    ? hoursWorkedPerWeek
    : totalHoursFromResearch > 0
      ? totalHoursFromResearch
      : totalHoursFromClient > 0
        ? totalHoursFromClient
        : totalHoursFromShoot > 0
          ? totalHoursFromShoot
          : totalHoursFromPractice;
  if (jobs > 0 || sale > 0 || addOns > 0 || extraEventPay > 0 || recurringClientRevenue > 0) {
    notes.push(
      hasHoursPerJob
        ? `${jobs} jobs/week × $${sale}/hr × ${hoursPerJob} hrs + $${extraEventPay} add-ons`
        : hasRecurringClientRevenue
        ? `${jobs} projects/week × $${sale} + $${recurringClientRevenue} recurring`
        : hasExtraEventPay
          ? hasHoursWorkedPerWeek
            ? `${jobs} jobs/week × $${sale} + $${extraEventPay} tips/extra`
            : `${jobs} practices/week × $${sale} + $${extraEventPay} extra event pay`
          : hasAddOnField
            ? `${jobs} jobs/week × ($${sale} fee + $${addOns} add-ons)`
            : hasResearchAdminHours
              ? `${jobs} projects/week × $${sale}`
              : `${jobs} jobs × $${sale} avg sale`,
    );
  }
  if (hasResearchAdminHours && (researchHoursPerProject > 0 || adminHoursPerProject > 0)) {
    notes.push(
      `${researchHoursPerProject} research hrs + ${adminHoursPerProject} formatting hrs per project`,
    );
  }
  if (totalHours > 0) notes.push(`Estimated hours per week: ${totalHours}`);
  if (
    (hasAddOnField ||
      hasExtraEventPay ||
      hasRecurringClientRevenue ||
      hasResearchAdminHours ||
      hasHoursWorkedPerWeek ||
      hasHoursPerJob) &&
    (jobs > 0 ||
      sale > 0 ||
      addOns > 0 ||
      extraEventPay > 0 ||
      recurringClientRevenue > 0 ||
      expenses > 0)
  ) {
    notes.push(`Approx. monthly profit (weekly × 4.33): $${(net * 4.33).toFixed(2)}`);
  }
  return {
    revenue,
    expenses,
    net,
    marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
    notes,
    metrics: {
      netPerDelivery: jobs > 0 ? net / jobs : undefined,
      netPerHour: totalHours > 0 ? net / totalHours : undefined,
    },
  };
}

export function formatGuideCalcMoney(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatGuideCalcMoneyPrecise(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
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
