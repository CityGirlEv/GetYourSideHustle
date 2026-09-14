/**
 * Per-guide monthly revenue / profit estimates for Launch Guide calculator tab.
 * Planning math only — not guarantees. All defaults start at 0 — user enters values.
 */

import { computeCleaningServiceProfit } from "./cleaning-service-guide";
import { computeStrCohostProfit } from "./str-cohost-guide";
import { computeAiAgentsProfit } from "./ai-agents-guide";
import { computeAiPromoVideoProfit } from "./ai-promo-video-guide";
import { computeAiTimingProfit } from "./ai-timing-guide";
import { computeStartBookClubProfit } from "./start-book-club-guide";
import { computeBeachShellJewelryProfit } from "./beach-shell-jewelry-guide";
import { computeGiftWrappingProfit } from "./gift-wrapping-guide";
import { computeAffiliateProfit } from "./affiliate-guide";
import { computeDropshippingProfit } from "./dropshipping-guide";
import { computeFbMarketplaceHelperProfit } from "./fb-marketplace-helper-guide";
import { computePorchPackageHelperProfit } from "./porch-package-helper-guide";
import { computeBookPublishingKidsProfit } from "./book-publishing-kids-guide";
import { computeAiPeersProfit } from "./ai-peers-guide";
import { computeTravelResearchAssistantProfit } from "./travel-research-assistant-guide";
import { computeTranscriptionNotesHelperProfit } from "./transcription-notes-helper-guide";
import { computeWebsiteTesterProfit } from "./website-tester-guide";
import { computeCommunityNewsletterProfit } from "./community-newsletter-creator-guide";
import { computeCommunityTeachingProfit } from "./community-teaching-workshops-guide";
import { computeReviewResponseAssistantProfit } from "./review-response-assistant-guide";
import { computeCareerIndustryConsultingProfit } from "./career-industry-consulting-guide";
import { computePartTimeNotaryProfit } from "./part-time-notary-guide";
import { computeResumeLinkedInHelperProfit } from "./resume-linkedin-helper-guide";
import { computeShortFormVideoEditorProfit } from "./short-form-video-editor-guide";
import { computeGoogleBusinessProfileHelperProfit } from "./google-business-profile-helper-guide";
import { computeUgcCreatorProfit } from "./ugc-creator-guide";
import { computeVirtualAssistantProfit } from "./virtual-assistant-guide";
import { computeVirtualReceptionistProfit } from "./virtual-receptionist-guide";
import { computeSocialInfluencerProfit } from "./social-influencer-guide";
import { computeJuniorSavingsGoal } from "./junior-savings-ceo-guide";
import { computeOnlineCommunityModeratorProfit } from "./online-community-moderator-guide";
import { computeBasicInvitationProfit } from "./basic-invitation-creator-guide";
import { computePodProfit } from "./pod-guide";
import { computePetSittingProfit } from "./pet-sitting-guide";
import { computeFriendshipBraceletProfit } from "./friendship-bracelet-maker-guide";
import { computeLeafRakingProfit } from "./leaf-raking-guide";
import { computeLemonadeStandProfit } from "./lemonade-stand-guide";
import { computeAirbnbHostingProfit } from "./airbnb-hosting-guide";
import { computeDigitalCookbookProfit } from "./digital-cookbook-creator-guide";
import { computeFamilyPhotoSlideshowProfit } from "./family-photo-slideshow-guide";
import { computeLocalResourceListProfit } from "./local-resource-list-creator-guide";
import { computeRecyclingHelperProfit } from "./recycling-helper-guide";
import { computeProofreaderProfit } from "./proofreader-guide";
import { computeToyOrganizerProfit } from "./toy-organizer-guide";
import { computeTrashCanServiceProfit } from "./trash-can-service-guide";
import { computeHomeworkHelperProfit } from "./homework-helper-guide";
import { computeCanvaFlyerProfit } from "./canva-flyer-creator-guide";
import { computeCarInteriorProfit } from "./car-interior-cleanup-guide";
import { computeNeighborhoodDogWalkerProfit } from "./neighborhood-dog-walker-guide";
import { computeGreetingCardProfit } from "./greeting-card-creator-guide";
import { computeHolidayDecoratingProfit } from "./holiday-decorating-helper-guide";
import { computeLightHandymanProfit } from "./light-handyman-home-help-guide";
import { computeTutoringSkillsProfit } from "./tutoring-skills-coaching-guide";
import { computeVacationPlantProfit } from "./vacation-plant-helper-guide";

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
  | "split"
  | "savings";

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
const LODGING_IDS = new Set(["airbnb-cohost"]);

/** Guide IDs that use product / ecom math. */
const PRODUCT_IDS = new Set([
  "amazon",
  "digital-products",
  "book-publishing",
]);

/** Guide IDs that use social monetization math. */
const SOCIAL_IDS = new Set<string>([]);

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

/** Junior savings-goal calculator (not a business revenue calculator). */
const SAVINGS_IDS = new Set(["junior-savings-ceo"]);

export function guideCalcModeForId(guideId: string): GuideCalcMode {
  const id = String(guideId || "").trim();
  if (KINDNESS_IDS.has(id)) return "kindness";
  if (IMPACT_IDS.has(id)) return "impact";
  if (SPLIT_IDS.has(id)) return "split";
  if (SAVINGS_IDS.has(id)) return "savings";
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

  if (mode === "savings") {
    return {
      mode,
      title: `${name} — Savings Goal Calculator`,
      blurb:
        "Goal cost minus already saved = still needed. Still needed ÷ weeks remaining = weekly savings goal. Compare estimated weekly savings (tasks × earnings × save portion) with that goal. ON TRACK or NEEDS ADJUSTMENT — never overwork.",
      disclaimerExtra:
        "This is a savings-goal calculator, not a business revenue calculator. Examples are for learning only. Earnings vary. Do not borrow money or use credit to reach the goal.",
      defaults: {
        juniorSavingsGoalCost: 0,
        amountAlreadySaved: 0,
        weeksRemaining: 0,
        averageEarningsPerTask: 0,
        tasksPerWeek: 0,
        savingsPortionPercent: 0,
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

  if (id === "str-cohost") {
    return {
      mode: "service",
      title: `${name} — Unit Economics Calculator`,
      blurb:
        "Enter available nights, booked nights, average nightly revenue, and other eligible host revenue. Expenses: rent, utilities, internet, insurance, cleaning paid by host, laundry, platform/payment fees, supplies, maintenance, permit/license allocation, software, parking, other. Occupancy = booked ÷ available. Do not count refundable guest deposits as revenue. Examples only — not guarantees.",
      disclaimerExtra:
        "MARKET-DEPENDENT — EXAMPLES ONLY, NOT GUARANTEES. Do not invent a fixed monthly income range. Gross booking revenue is not profit. Refundable guest deposits are not revenue.",
      defaults: {
        availableNights: 0,
        bookedNights: 0,
        avgNightlyRevenue: 0,
        otherHostRevenue: 0,
        initialSetupInvestment: 0,
      },
      budget: [
        { id: "rent", label: "Rent ($ / month)", amount: 0 },
        { id: "utilities", label: "Utilities ($ / month)", amount: 0 },
        { id: "internet", label: "Internet ($ / month)", amount: 0 },
        { id: "insurance", label: "Insurance ($ / month)", amount: 0 },
        { id: "cleaningPaidByHost", label: "Cleaning cost paid by host ($ / month)", amount: 0 },
        { id: "laundry", label: "Laundry ($ / month)", amount: 0 },
        { id: "platformFees", label: "Platform / payment fees ($ / month)", amount: 0 },
        { id: "supplies", label: "Supplies ($ / month)", amount: 0 },
        { id: "maintenance", label: "Maintenance reserve ($ / month)", amount: 0 },
        { id: "permitAllocation", label: "Permit / license allocation ($ / month)", amount: 0 },
        { id: "software", label: "Software ($ / month)", amount: 0 },
        { id: "parking", label: "Parking ($ / month)", amount: 0 },
        { id: "other", label: "Other operating costs ($ / month)", amount: 0 },
      ],
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
    const isBookPublishing = id === "book-publishing";
    return {
      mode,
      title: isDigitalProducts
        ? `${name} — Digital Product Profit Calculator`
        : isBookPublishing
          ? `${name} — Book Publishing Profit Calculator`
        : `${name} — monthly profit`,
      blurb: isDigitalProducts
        ? "Enter product price, sales per month, fees, ads, software, refunds, and other expenses. See gross revenue, estimated profit, profit per sale, margin, and sales needed for a monthly profit goal (rounded up)."
        : isBookPublishing
          ? "Enter units and actual revenue/compensation per unit by format, plus direct/other book revenue and production/marketing expenses. Revenue is money received. Profit is money remaining after expenses. Use current platform reports — do not use list price alone."
        : "Enter sales volume, product cost, and ads to estimate monthly profit.",
      disclaimerExtra: isDigitalProducts
        ? "Planning estimates only. Revenue is not profit. Fees, ads, software, refunds, and other expenses reduce profit. Examples are not income guarantees."
        : isBookPublishing
          ? "Planning estimates only. Displayed $200 – $8,000 / month is example only. Use actual current platform reports and calculators. Do not hard-code changing fees or royalties. Examples are not income guarantees."
        : undefined,
      defaults: isBookPublishing
        ? {
            ebookUnits: 0,
            ebookRevPerUnit: 0,
            paperbackUnits: 0,
            paperbackRevPerUnit: 0,
            hardcoverUnits: 0,
            hardcoverRevPerUnit: 0,
            audiobookUnits: 0,
            audiobookRevPerUnit: 0,
            directOtherRevenue: 0,
            unrecoveredProductionCost: 0,
            avgProfitContributionPerSale: 0,
          }
        : {
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
        : isBookPublishing
          ? [
              { id: "ads", label: "Ads ($ / month)", amount: 0 },
              { id: "editing", label: "Editing allocation ($ / month)", amount: 0 },
              { id: "cover", label: "Cover allocation ($ / month)", amount: 0 },
              { id: "formatting", label: "Formatting allocation ($ / month)", amount: 0 },
              { id: "audio", label: "Audio production allocation ($ / month)", amount: 0 },
              { id: "proofs", label: "Proofs / author copies ($ / month)", amount: 0 },
              { id: "shipping", label: "Shipping ($ / month)", amount: 0 },
              { id: "returns", label: "Returns / refunds ($ / month)", amount: 0 },
              { id: "software", label: "Software / platform ($ / month)", amount: 0 },
              { id: "other", label: "Other expenses ($ / month)", amount: 0 },
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

  if (id === "cleaning-service") {
    return {
      mode: "service",
      title: `${name} — Cleaning Profit Calculator`,
      blurb:
        "Enter standard cleans per week and average standard price, plus specialty jobs (deep/move-out/turnovers), add-ons, and tips. Expenses: supplies, fuel/travel, parking, laundry, payment fees, advertising, insurance/licensing, other. Monthly standard revenue = weekly standard × 4.33. Profit = revenue − expenses. Effective profit per hour = profit ÷ cleaning + travel/admin hours. Examples only — not guarantees.",
      disclaimerExtra:
        "Displayed $600 – $4,000+ / month is example only, not a guarantee. Gross revenue is not profit. Do not count client reimbursement for separately purchased supplies as cleaning-service profit without accounting for the corresponding cost.",
      defaults: {
        standardCleansPerWeek: 0,
        averageStandardPrice: 0,
        specialtyJobsPerMonth: 0,
        averageSpecialtyPrice: 0,
        monthlyAddOnRevenue: 0,
        tipsOtherRevenue: 0,
        cleaningHours: 0,
        travelAdminHours: 0,
      },
      budget: [
        { id: "supplies", label: "Supplies ($ / month)", amount: 0 },
        { id: "fuelTravel", label: "Fuel / travel ($ / month)", amount: 0 },
        { id: "parking", label: "Parking ($ / month)", amount: 0 },
        { id: "laundry", label: "Laundry ($ / month)", amount: 0 },
        { id: "paymentFees", label: "Payment fees ($ / month)", amount: 0 },
        { id: "advertising", label: "Advertising ($ / month)", amount: 0 },
        { id: "insuranceLicensing", label: "Insurance / licensing if applicable ($ / month)", amount: 0 },
        { id: "other", label: "Other ($ / month)", amount: 0 },
      ],
    };
  }

  if (id === "start-gardening-club") {
    return {
      mode: "service",
      title: `${name} — Club Money Tracker`,
      blurb:
        "Enter paying members, monthly dues, workshop attendees and price, kits sold and kit price, plus other revenue. Expenses: venue, workshop materials, kit materials, printing/marketing, speaker/instructor, payment fees, insurance/permits, other. Net = revenue − expenses. Do not automatically treat net as personal profit.",
      disclaimerExtra:
        "Planning estimates only. Displayed $0 – $750 / month is example only. Club money may belong to the club, reimburse expenses, fund activities, or represent legitimate organizer/instructor income — keep records. Examples are not income guarantees.",
      defaults: {
        payingMembers: 0,
        monthlyDues: 0,
        workshopAttendees: 0,
        workshopPrice: 0,
        kitsSold: 0,
        kitPrice: 0,
        otherRevenue: 0,
      },
      budget: [
        { id: "venue", label: "Venue ($ / month)", amount: 0 },
        { id: "workshopMaterials", label: "Workshop materials ($ / month)", amount: 0 },
        { id: "kitMaterials", label: "Kit materials ($ / month)", amount: 0 },
        { id: "printing", label: "Printing / marketing ($ / month)", amount: 0 },
        { id: "speaker", label: "Speaker / instructor ($ / month)", amount: 0 },
        { id: "paymentFees", label: "Payment fees ($ / month)", amount: 0 },
        { id: "insurance", label: "Insurance / permits ($ / month)", amount: 0 },
        { id: "other", label: "Other expenses ($ / month)", amount: 0 },
      ],
    };
  }

  if (id === "start-book-club") {
    return {
      mode: "service",
      title: `${name} — Club Money Tracker`,
      blurb:
        "Enter paying members and monthly dues, event attendees and ticket price, reading kits sold and kit price, workshop revenue, and other revenue. Subtract venue, refreshments, kit materials, author/speaker, printing, marketing, payment fees, and other. Net = revenue − expenses. Do not automatically treat net as personal profit.",
      disclaimerExtra:
        "Planning estimates only. Displayed $0 – $500+ / month is examples only. Club money may belong to the club, reimburse expenses, fund future activities, or represent legitimate organizer/facilitator income — keep records. Track organizer compensation separately. Examples are not income guarantees.",
      defaults: {
        payingMembers: 0,
        monthlyDues: 0,
        eventAttendees: 0,
        eventPrice: 0,
        kitsSold: 0,
        kitPrice: 0,
        workshopRevenue: 0,
        otherRevenue: 0,
        venue: 0,
        refreshments: 0,
        kitMaterials: 0,
        authorSpeaker: 0,
        printing: 0,
        marketing: 0,
        paymentFees: 0,
        otherExpenses: 0,
      },
      budget: [],
    };
  }

  if (id === "foreclosure-properties") {
    return {
      mode: "service",
      title: `${name} — Foreclosure Deal Analyzer`,
      blurb:
        "Flip: conservative ARV, purchase/bid, buyer premium/fees, closing/title/legal, repairs, contingency, financing, monthly holding × months, selling costs, taxes/insurance/HOA, other. Estimated profit = ARV − total project cost. Max offer = ARV − non-purchase costs − desired profit. Rental: rent − vacancy − operating − debt service. Estimates only — not promises of return.",
      disclaimerExtra:
        "Educational estimates only. Do not promise appreciation, rent increases, resale price, tax outcomes, or returns. Rules vary by state, county, auction, lender, and property. This is not legal, tax, lending, title, or investment advice.",
      defaults: {
        conservativeArv: 0,
        purchasePrice: 0,
        buyerPremium: 0,
        closingTitleLegal: 0,
        repairs: 0,
        repairContingency: 0,
        financingCosts: 0,
        monthlyHoldingCosts: 0,
        expectedHoldingMonths: 0,
        sellingCosts: 0,
        taxesInsuranceHoa: 0,
        otherCosts: 0,
        desiredProfit: 0,
        rentalPurchase: 0,
        rehabClosingInitial: 0,
        monthlyRent: 0,
        vacancyAllowance: 0,
        rentalTaxes: 0,
        rentalInsurance: 0,
        maintenance: 0,
        capexReserve: 0,
        management: 0,
        hoaOwnerUtilities: 0,
        debtService: 0,
        otherOperating: 0,
      },
      budget: [],
    };
  }

  if (id === "ai-agents") {
    return {
      mode: "service",
      title: `${name} — Agent Profit Calculator`,
      blurb:
        "Enter starter, standard, and advanced builds plus monthly retainers. Revenue = starter + standard + advanced + retainers. Subtract AI/API, automation, hosting/database, contractors, software, payment fees, marketing, and other. Effective profit per hour = monthly profit ÷ build + testing + support + sales/admin hours. Examples only — not guarantees.",
      disclaimerExtra:
        "Displayed $1,000 – $10,000+ / month is examples only, not a guarantee. Revenue is not profit. Do not promise full autonomy, headcount savings, or guaranteed time savings.",
      defaults: {
        starterBuilds: 0,
        starterPrice: 0,
        standardBuilds: 0,
        standardPrice: 0,
        advancedBuilds: 0,
        advancedPrice: 0,
        monthlyRetainers: 0,
        retainerPrice: 0,
        aiApiCosts: 0,
        automationTools: 0,
        hostingDatabase: 0,
        contractors: 0,
        software: 0,
        paymentFees: 0,
        marketing: 0,
        otherExpenses: 0,
        buildHours: 0,
        testingHours: 0,
        supportHours: 0,
        salesAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "ai-promo-video") {
    return {
      mode: "service",
      title: `${name} — Promo Video Profit Calculator`,
      blurb:
        "Enter quick, standard, and premium promos plus monthly package and add-on revenue. Subtract AI generation credits, stock, music/voice, software, payment fees, marketing, and other. Effective profit per hour = profit ÷ production + revision + client/admin + marketing hours. Examples only — not guarantees.",
      disclaimerExtra:
        "Package prices are examples, not income guarantees. Do not use $15–$50/project as the primary price. Do not promise viral results or guaranteed sales.",
      defaults: {
        quickPromos: 0,
        averageQuickPrice: 0,
        standardPromos: 0,
        averageStandardPrice: 0,
        premiumPromos: 0,
        averagePremiumPrice: 0,
        monthlyPackageRevenue: 0,
        addOnRevenue: 0,
        aiGenerationCredits: 0,
        stockAssets: 0,
        musicVoice: 0,
        software: 0,
        paymentFees: 0,
        marketing: 0,
        otherExpenses: 0,
        productionHours: 0,
        revisionHours: 0,
        clientAdminHours: 0,
        marketingHours: 0,
      },
      budget: [],
    };
  }

  if (id === "ai-timing") {
    return {
      mode: "service",
      title: `${name} — Timing Scout Profit Calculator`,
      blurb:
        "Mode A: snapshots, city playbooks, custom playbooks, and updates minus AI/software, data/tools, marketing, payment fees, and other. Mode B: gross driving revenue minus fuel/charging, tolls/parking, vehicle costs, and other. Profit/hour and profit/mile are operating estimates — not guaranteed earnings.",
      disclaimerExtra:
        "Displayed $300 – $3,000+ / month is examples only, not a guarantee. Never invent live surge, wait times, or guaranteed hot zones. Do not count a tax mileage deduction as a cash vehicle expense.",
      defaults: {
        snapshotsSold: 0,
        averageSnapshotPrice: 0,
        cityPlaybooksSold: 0,
        averageCityPrice: 0,
        customPlaybooksSold: 0,
        averageCustomPrice: 0,
        updatesSubscriptions: 0,
        aiSoftware: 0,
        dataTools: 0,
        marketing: 0,
        paymentFees: 0,
        otherExpenses: 0,
        researchHours: 0,
        customizationHours: 0,
        marketingAdminHours: 0,
        grossDrivingRevenue: 0,
        onlineHours: 0,
        miles: 0,
        fuelCharging: 0,
        tollsParking: 0,
        estimatedVehicleCosts: 0,
        otherDrivingCosts: 0,
      },
      budget: [],
    };
  }

  if (id === "kids-games-ai") {
    return {
      mode: "service",
      title: `${name} — Tiny Game Project Calculator`,
      blurb:
        "Track projects made and free projects. Gross project money = parent-managed paid projects × average project price. Amount remaining = gross − approved tool/supply costs − other parent-approved costs. Optional Save / Enjoy / Grow split if the parent chooses percentages that add to 100%. Any sale/payment is parent-managed.",
      disclaimerExtra:
        "Learning first. Do not encourage children to privately negotiate with strangers, accept direct payments, share payment handles, or independently create seller accounts. Examples are not income guarantees.",
      defaults: {
        projectsMade: 0,
        freeProjects: 0,
        paidProjects: 0,
        avgProjectPrice: 0,
        supplyToolCost: 0,
        otherApprovedCost: 0,
        savePercent: 0,
        enjoyPercent: 0,
        growPercent: 0,
      },
      budget: [],
    };
  }

  if (id === "ai-peers") {
    return {
      mode: "service",
      title: `${name} — Coffee Chat Profit Calculator`,
      blurb:
        "1:1 sessions + small-group participant revenue + private groups + workshops + series + add-ons = gross revenue. Subtract venue, printing, software/subscriptions, travel/parking, payment fees, ads, host-paid refreshments, and other. Teaching + prep + travel + setup/cleanup + follow-up/admin = total time. Profit ÷ total time = profit per total hour. Examples only — not income guarantees.",
      disclaimerExtra:
        "Displayed $15 – $40 / hour is examples only, not a guarantee. Revenue is not profit. Never guarantee AI accuracy or income. Never request or record passwords.",
      defaults: {
        aiPeersOneOnOneSessions: 0,
        aiPeersOneOnOneRate: 0,
        aiPeersSmallGroupParticipants: 0,
        aiPeersSmallGroupPricePerPerson: 0,
        aiPeersPrivateGroupSessions: 0,
        aiPeersPrivateGroupFee: 0,
        aiPeersWorkshopSessions: 0,
        aiPeersWorkshopFee: 0,
        aiPeersSeriesRevenue: 0,
        aiPeersAddOnRevenue: 0,
        aiPeersVenueCost: 0,
        aiPeersPrintingCost: 0,
        aiPeersSoftwareSubscriptions: 0,
        aiPeersTravelParking: 0,
        aiPeersPaymentFees: 0,
        aiPeersAds: 0,
        aiPeersHostPaidRefreshments: 0,
        aiPeersOtherExpenses: 0,
        aiPeersTeachingHours: 0,
        aiPeersPrepHours: 0,
        aiPeersTravelHours: 0,
        aiPeersSetupCleanupHours: 0,
        aiPeersFollowUpAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "book-publishing-kids") {
    return {
      mode: "service",
      title: `${name} — Parent-Managed Storybook Profit Calculator`,
      blurb:
        "Direct-sale revenue = printed copies sold × average direct sale price. eBook royalties = eBook sales × actual average royalty per sale. Print royalties = print-on-demand sales × actual average print royalty per sale. Total earned revenue adds other earned book income. Subtract proofs, inventory/printing, art, software/assets, events, packaging/shipping, payment fees, advertising, and other. Free gifts are not revenue. List price is not royalty or profit.",
      disclaimerExtra:
        "Displayed gifts · fair sales · ebook royalties are examples only, not a guarantee. Enter the actual royalty shown in the parent’s platform report. The parent/guardian manages payments, taxes, and records. This is not legal, tax, investment, or child-employment advice.",
      defaults: {
        storybookDirectPrintedCopiesSold: 0,
        averageDirectSalePrice: 0,
        ebookSales: 0,
        averageActualEbookRoyaltyPerSale: 0,
        printOnDemandSales: 0,
        averageActualPrintRoyaltyPerSale: 0,
        otherEarnedBookIncome: 0,
        proofCopies: 0,
        directSaleInventoryPrinting: 0,
        artSupplies: 0,
        softwareLicensedAssets: 0,
        eventBoothFees: 0,
        packagingShipping: 0,
        paymentFees: 0,
        advertisingPrinting: 0,
        otherExpenses: 0,
        writingRevisionHours: 0,
        illustrationHours: 0,
        layoutProofingHours: 0,
        publishingMarketingSalesAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "beach-shell-jewelry") {
    return {
      mode: "service",
      title: `${name} — Jewelry Profit Calculator`,
      blurb:
        "Earrings, bracelets, necklaces, and set/custom revenue make gross revenue. Subtract findings/materials, packaging, selling/platform fees, shipping you pay, advertising, booth/event fees, and other. Profit per piece, margin, average selling price, and profit per hour are estimates only.",
      disclaimerExtra:
        "Displayed $8 – $35 / piece is examples only, not a guarantee. Revenue is not profit. Do not price a piece only because the shell was free.",
      defaults: {
        earringPairs: 0,
        earringPrice: 0,
        braceletsSold: 0,
        braceletPrice: 0,
        necklacesSold: 0,
        necklacePrice: 0,
        setsSold: 0,
        setPrice: 0,
        findingsMaterials: 0,
        packaging: 0,
        sellingFees: 0,
        shippingPaidBySeller: 0,
        advertising: 0,
        boothFees: 0,
        otherExpenses: 0,
        laborHours: 0,
      },
      budget: [],
    };
  }

  if (id === "gift-wrapping") {
    return {
      mode: "service",
      title: `${name} — Gift Wrapping Profit Calculator`,
      blurb:
        "Small, medium, large/specialty, package, add-on, and pickup/delivery revenue make gross revenue. Subtract wrapping paper, ribbon/bows, boxes/bags/tissue, tags/decorations, travel, payment fees, advertising, and other. Profit per gift, per job, per hour, and material cost per gift are estimates only.",
      disclaimerExtra:
        "Displayed $10 – $40 / job is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        smallGifts: 0,
        smallGiftPrice: 0,
        mediumGifts: 0,
        mediumGiftPrice: 0,
        largeGifts: 0,
        largeGiftPrice: 0,
        packagesSold: 0,
        packagePrice: 0,
        addOnRevenue: 0,
        pickupDeliveryRevenue: 0,
        wrappingPaper: 0,
        ribbonBows: 0,
        boxesBagsTissue: 0,
        tagsDecorations: 0,
        travel: 0,
        paymentFees: 0,
        advertising: 0,
        otherExpenses: 0,
        laborHours: 0,
        jobsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "affiliate") {
    return {
      mode: "service",
      title: `${name} — Affiliate Earnings Calculator`,
      blurb:
        "Views × click rate × conversion rate × average commission = estimated gross commissions. Subtract website/hosting, software, content production, advertising, contractors, and other. Earnings per click and per 1,000 views are estimates only.",
      disclaimerExtra:
        "Displayed $100 – $15,000+ / month is examples only, not a guarantee. A new affiliate may earn $0 while testing. Revenue is not profit. Always check CURRENT program terms.",
      defaults: {
        monthlyViews: 0,
        clickRatePercent: 0,
        conversionRatePercent: 0,
        averageCommission: 0,
        websiteHosting: 0,
        software: 0,
        contentProduction: 0,
        advertising: 0,
        contractors: 0,
        otherExpenses: 0,
      },
      budget: [],
    };
  }

  if (id === "dropshipping") {
    return {
      mode: "service",
      title: `${name} — Dropshipping Profit Calculator`,
      blurb:
        "Orders × average selling price = revenue. Subtract product cost, supplier shipping, fees, ad cost, refund/chargeback reserve, other variable cost, store/app costs, and other monthly expenses. Do not treat sales revenue as profit.",
      disclaimerExtra:
        "Displayed $500 – $10,000+ / month is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        dropshipOrders: 0,
        averageSellingPrice: 0,
        averageProductCost: 0,
        averageSupplierShipping: 0,
        paymentPlatformFeesPerOrder: 0,
        averageAdCostPerOrder: 0,
        refundChargebackCostPerOrder: 0,
        otherVariableCostPerOrder: 0,
        monthlyStoreAppCosts: 0,
        otherMonthlyExpenses: 0,
      },
      budget: [],
    };
  }

  if (id === "fb-marketplace-helper") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Projects × average base fee + refresh + research + message/sale support + rush/travel + other earned service income = monthly service revenue. Subtract supplies, mileage, parking, software/phone, advertising/printing, payment fees, and other. Do not count the client’s merchandise or buyer payments.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. Client sale proceeds are not helper revenue. Revenue is not profit.",
      defaults: {
        fbMarketplaceProjects: 0,
        averageBaseProjectFee: 0,
        listingRefreshIncome: 0,
        complexResearchIncome: 0,
        buyerMessageSupportIncome: 0,
        rushTravelAddOnIncome: 0,
        otherEarnedServiceIncome: 0,
        supplies: 0,
        mileageTransportation: 0,
        parking: 0,
        softwarePhone: 0,
        advertisingPrinting: 0,
        paymentFees: 0,
        otherExpenses: 0,
        clientSessionHours: 0,
        travelHours: 0,
        researchWritingPostingHours: 0,
        messageFollowUpAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "porch-package-helper") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Standard jobs per week × average fee × 4.33 + vacation/multi-visit + weather/rush + tips = monthly service revenue. Subtract mileage, parking/tolls, phone/internet, supplies, advertising, payment fees, insurance, and other. Do not count the value of a client’s package.",
      disclaimerExtra:
        "Displayed $10 – $40 / job is examples only, not a guarantee. Package value is not helper revenue. Revenue is not profit.",
      defaults: {
        porchStandardJobsPerWeek: 0,
        averageStandardJobFee: 0,
        vacationPackageRevenue: 0,
        weatherRushAddOnRevenue: 0,
        tipsOtherEarnedIncome: 0,
        mileageTransportation: 0,
        parkingTolls: 0,
        phoneInternet: 0,
        supplies: 0,
        advertisingPrinting: 0,
        paymentFees: 0,
        insuranceLicensing: 0,
        otherExpenses: 0,
        travelHours: 0,
        serviceHours: 0,
        waitingHours: 0,
        adminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "travel-research-assistant") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Quick comparisons per week × fee × 4.33 + one-page briefs + refresh/add-ons + tips = monthly research-fee revenue. Subtract internet/phone, software/storage, advertising, payment fees, registration/insurance, supplies, and other. Do not count flight, hotel, or activity prices the client pays providers.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. Research only — not booked. Revenue is not profit.",
      defaults: {
        travelQuickComparisonsPerWeek: 0,
        averageQuickComparisonFee: 0,
        onePageBriefsPerMonth: 0,
        averageOnePageBriefFee: 0,
        refreshAddOnRevenue: 0,
        tipsOtherResearchIncome: 0,
        internetPhone: 0,
        softwareStorage: 0,
        advertisingPortfolio: 0,
        paymentFees: 0,
        registrationInsurance: 0,
        supplies: 0,
        otherExpenses: 0,
        intakeHours: 0,
        researchHours: 0,
        briefHours: 0,
        revisionHours: 0,
        marketingAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "transcription-notes-helper") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Flat-fee projects per week × fee × 4.33 + per-audio-minute projects + recurring package + add-ons + tips = monthly service revenue. Do not double-count a project in both flat-fee and per-audio-minute revenue. One hour of audio is rarely one hour of work.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        transcriptionFlatFeeProjectsPerWeek: 0,
        averageFlatFeeProjectPrice: 0,
        perAudioMinuteProjectsPerMonth: 0,
        averageAudioMinutesPerPerMinuteProject: 0,
        averageRatePerAudioMinute: 0,
        recurringPackageRevenue: 0,
        timestampRushFormattingAddOns: 0,
        tipsOtherEarnedServiceIncome: 0,
        internetPhone: 0,
        softwareTools: 0,
        cloudStorage: 0,
        equipment: 0,
        advertisingPortfolio: 0,
        paymentFees: 0,
        registrationInsurance: 0,
        otherExpenses: 0,
        intakeHours: 0,
        listeningDraftHours: 0,
        editingQualityHours: 0,
        revisionHours: 0,
        fileDeliveryHours: 0,
        marketingAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "website-tester") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Quick checks per week × fee × 4.33 + expanded projects + retest + recurring package + add-on/rush + tips = monthly testing-fee revenue. Do not count the client’s website sales as your service revenue.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        websiteTesterQuickChecksPerWeek: 0,
        averageQuickCheckFee: 0,
        expandedProjectsPerMonth: 0,
        averageExpandedProjectFee: 0,
        retestRevenuePerMonth: 0,
        recurringPackageRevenue: 0,
        addOnRushRevenue: 0,
        tipsOtherEarnedServiceIncome: 0,
        internetPhone: 0,
        softwareStorage: 0,
        equipment: 0,
        advertisingPortfolio: 0,
        paymentFees: 0,
        registrationInsurance: 0,
        otherExpenses: 0,
        intakeHours: 0,
        testingHours: 0,
        screenshotReportHours: 0,
        retestHours: 0,
        marketingAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "community-newsletter-creator") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Newsletter issues × fee + template/setup + research add-ons + email/distribution + print + sponsor-ad service + other earned newsletter income = monthly revenue. Do not count the client’s sponsorships, donations, dues, or ticket sales as your revenue.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        newsletterIssuesPerMonth: 0,
        averageFeePerIssue: 0,
        templateSetupRevenue: 0,
        interviewResearchAddOns: 0,
        emailDistributionRevenue: 0,
        printReadyRevenue: 0,
        sponsorAdServiceRevenue: 0,
        otherEarnedNewsletterIncome: 0,
        phoneInternet: 0,
        writingDesignEmailSoftware: 0,
        domainWebsiteStorage: 0,
        licensedAssets: 0,
        unreimbursedPrintingPostage: 0,
        paymentFees: 0,
        advertisingNetworking: 0,
        travelParking: 0,
        officeEquipment: 0,
        otherExpenses: 0,
        contentCollectionHours: 0,
        researchInterviewHours: 0,
        writingEditingHours: 0,
        designFormattingHours: 0,
        proofingRevisionHours: 0,
        emailDistributionHours: 0,
        marketingAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "teaching") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Sessions × fee + per-participant + series/private + workbook/materials + other earned workshop income = monthly revenue. Subtract materials, venue/platform, insurance, travel, software, payment fees, advertising, and other.",
      disclaimerExtra:
        "Displayed $50 – $200 / session is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        workshopSessionsPerMonth: 0,
        averageSessionFee: 0,
        perParticipantRevenue: 0,
        seriesPrivateGroupRevenue: 0,
        workbookMaterialsRevenue: 0,
        otherEarnedWorkshopIncome: 0,
        materialsSupplies: 0,
        printing: 0,
        venuePlatformFees: 0,
        insurancePermitsChecks: 0,
        travelParking: 0,
        softwareEquipment: 0,
        paymentFees: 0,
        advertising: 0,
        otherExpenses: 0,
        curriculumPrepHours: 0,
        marketingSalesHours: 0,
        venueCoordinationHours: 0,
        setupCleanupHours: 0,
        teachingHours: 0,
        travelHours: 0,
        followUpAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "review-response-assistant") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Completed reviews × allocated fee + backlog + tone/playbook setup + retainer + other earned income = monthly revenue. Never count fake-review or rating-manipulation work.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        reviewResponsesCompletedPerMonth: 0,
        averageFeePerReviewOrBatch: 0,
        backlogProjectRevenue: 0,
        tonePlaybookSetupRevenue: 0,
        monthlyRetainerRevenue: 0,
        otherEarnedIncome: 0,
        phoneInternet: 0,
        softwareStorage: 0,
        paymentFees: 0,
        advertising: 0,
        professionalServicesInsurance: 0,
        otherExpenses: 0,
        setupOnboardingHours: 0,
        reviewAuditHours: 0,
        draftingHours: 0,
        approvalRevisionHours: 0,
        publishingReportingHours: 0,
        marketingAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "consulting") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Billable hours per week × rate × 4.33 + fixed-fee projects + workshops + retainers + approved reimbursements + other earned consulting income = monthly revenue. Do not count a client’s salary increase or business results as your revenue.",
      disclaimerExtra:
        "Displayed $50 – $200 / hour is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        consultingBillableHoursPerWeek: 0,
        averageHourlyRate: 0,
        fixedFeeProjectRevenue: 0,
        workshopRevenue: 0,
        retainerRevenue: 0,
        approvedExpenseReimbursements: 0,
        otherEarnedConsultingIncome: 0,
        phoneInternet: 0,
        schedulingVideoSoftware: 0,
        insurance: 0,
        legalAccountingFees: 0,
        continuingEducation: 0,
        advertisingNetworking: 0,
        unreimbursedTravel: 0,
        paymentFees: 0,
        officeEquipment: 0,
        otherExpenses: 0,
        billableDeliveryHours: 0,
        preparationResearchHours: 0,
        proposalSalesHours: 0,
        writtenDeliverableHours: 0,
        followUpRevisionHours: 0,
        travelHours: 0,
        marketingAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "notary") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Appointments × average lawful notarial fees + permitted travel/convenience fees + contracted signing-service revenue + authorized remote/electronic revenue + other lawful earned income = monthly revenue. Do not invent fees above jurisdiction caps.",
      disclaimerExtra:
        "Displayed $15 – $75 / appointment is examples only, not a guarantee. Charge only lawful, disclosed fees. Revenue is not profit.",
      defaults: {
        notaryAppointmentsPerMonth: 0,
        averageLawfulNotarialFeesPerAppointment: 0,
        permittedTravelConvenienceFees: 0,
        contractedSigningServiceRevenue: 0,
        authorizedRemoteElectronicRevenue: 0,
        otherLawfulEarnedIncome: 0,
        commissionRenewalAllocation: 0,
        bondInsuranceAllocation: 0,
        sealJournalCertificates: 0,
        trainingBackgroundScreening: 0,
        remotePlatformTechnology: 0,
        printingScanningShipping: 0,
        mileageParkingTolls: 0,
        phoneInternet: 0,
        paymentFeesAdvertising: 0,
        otherExpenses: 0,
        appointmentHours: 0,
        travelWaitingHours: 0,
        printingPreparationHours: 0,
        recordsShippingHours: 0,
        marketingAdminTrainingHours: 0,
      },
      budget: [],
    };
  }

  if (id === "resume-linkedin-helper") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Small projects × average fee + resume rewrite + résumé + LinkedIn package + add-ons + other earned income = monthly revenue. Never invent credentials. Do not count a client’s job or salary outcome as helper revenue.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        resumeSmallProjectsCompleted: 0,
        averageSmallProjectFee: 0,
        resumeRewriteRevenue: 0,
        resumeLinkedInPackageRevenue: 0,
        addOnRevenue: 0,
        otherEarnedIncome: 0,
        phoneInternet: 0,
        writingPdfStorageSoftware: 0,
        paymentFees: 0,
        advertisingNetworking: 0,
        trainingProfessionalServices: 0,
        otherExpenses: 0,
        salesIntakeHours: 0,
        clientInterviewHours: 0,
        researchTargetingHours: 0,
        writingFormattingHours: 0,
        revisionsFactCheckHours: 0,
        deliveryAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "short-form-video-editor") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Clips × average fee + batch/retainer + caption/graphics add-ons + rush/extra versions + other earned income = monthly revenue. Do not count the client’s views, followers, or sales as editor revenue.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        shortFormClipsCompleted: 0,
        averageFeePerClip: 0,
        batchRetainerRevenue: 0,
        captionGraphicsAddOnRevenue: 0,
        rushExtraVersionRevenue: 0,
        otherEarnedIncome: 0,
        editingSoftware: 0,
        storageTransfer: 0,
        licensedMusicStockFonts: 0,
        equipmentAllocation: 0,
        phoneInternet: 0,
        paymentFeesAdvertising: 0,
        otherExpenses: 0,
        salesIntakeHours: 0,
        sourceReviewHours: 0,
        editingHours: 0,
        captionsGraphicsAudioHours: 0,
        revisionsExportsHours: 0,
        deliveryAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "google-business-helper") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Small projects × average fee + setup/cleanup + monthly maintenance + photo/post add-ons + other earned income = monthly revenue. Never fake profiles, keyword-stuff names, or promise ranking.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        gbpSmallProjectsCompleted: 0,
        averageSmallProjectFee: 0,
        setupCleanupRevenue: 0,
        monthlyMaintenanceRevenue: 0,
        photoPostAddOnRevenue: 0,
        otherEarnedIncome: 0,
        phoneInternet: 0,
        softwareStorage: 0,
        travelParking: 0,
        equipmentAllocation: 0,
        paymentFees: 0,
        advertisingNetworking: 0,
        insuranceProfessionalServices: 0,
        otherExpenses: 0,
        salesIntakeHours: 0,
        eligibilityOwnershipResearchHours: 0,
        auditPreparationHours: 0,
        editingContentHours: 0,
        approvalRevisionHours: 0,
        handoffReportingHours: 0,
        marketingAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "ugc-creator") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Videos delivered × average production fee + usage rights + raw footage add-ons + whitelisting/exclusivity + other earned income = monthly revenue. Do not count client views, followers, or sales as creator revenue. Never fake testimonials.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. Price production separately from usage rights. Revenue is not profit.",
      defaults: {
        ugcVideosDelivered: 0,
        averageProductionFee: 0,
        usageRightsRevenue: 0,
        rawFootageAddOnRevenue: 0,
        whitelistingExclusivityRevenue: 0,
        otherEarnedIncome: 0,
        productsPropsNotReimbursed: 0,
        equipmentSoftwareAssets: 0,
        shippingTravel: 0,
        paymentFees: 0,
        insuranceProfessionalServices: 0,
        otherExpenses: 0,
        salesBriefsHours: 0,
        conceptScriptHours: 0,
        filmingHours: 0,
        editingHours: 0,
        revisionsDeliveryAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "virtual-assistant") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Starter tasks × average fee + retainers collected + special projects + approved add-ons + other earned revenue = monthly revenue. Do not count unsigned proposals or unpaid invoices. Never ask for passwords in email or chat.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. Assist the work; do not impersonate the owner. Revenue is not profit.",
      defaults: {
        vaStarterTasksCompleted: 0,
        averageStarterTaskFee: 0,
        retainerRevenueCollected: 0,
        specialProjectRevenueCollected: 0,
        approvedAddOnRevenue: 0,
        otherEarnedRevenue: 0,
        softwareSubscriptions: 0,
        equipmentInternetAllocation: 0,
        paymentFees: 0,
        trainingInsuranceProfessionalServices: 0,
        approvedCostsNotReimbursed: 0,
        otherExpenses: 0,
        taskWorkHours: 0,
        meetingsMessagesAdminHours: 0,
        marketingSalesHours: 0,
        revisionReworkHours: 0,
      },
      budget: [],
    };
  }

  if (id === "virtual-receptionist") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Coverage blocks × average fee + monthly retainer + overage/after-hours + setup/reporting add-ons + other earned revenue = monthly revenue. Count reserved coverage hours, not talk time alone.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. A receptionist is a router, not an unlicensed adviser or emergency dispatcher. Revenue is not profit.",
      defaults: {
        vrCoverageBlocksCompleted: 0,
        averageFeePerBlock: 0,
        monthlyRetainerRevenueCollected: 0,
        overageAfterHoursRevenue: 0,
        setupReportingAddOnRevenue: 0,
        otherEarnedRevenue: 0,
        phoneVoipCrmSoftware: 0,
        equipmentInternetAllocation: 0,
        paymentFees: 0,
        trainingInsuranceProfessionalServices: 0,
        backupCoverageSubcontractors: 0,
        otherExpenses: 0,
        reservedCoverageHours: 0,
        setupTrainingReportingHours: 0,
        marketingAdminHours: 0,
      },
      budget: [],
    };
  }

  if (id === "social") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Sponsored campaigns + affiliate commissions collected + platform monetization + product gross + services/subscriptions + licensing/other earned = monthly revenue. Followers are not revenue.",
      disclaimerExtra:
        "Displayed $500 - $20,000/mo is examples only, not a guarantee. Disclose material connections. Revenue is not profit.",
      defaults: {
        sponsoredCampaignRevenue: 0,
        affiliateCommissionsCollected: 0,
        platformMonetizationCollected: 0,
        productGrossRevenue: 0,
        serviceSubscriptionRevenue: 0,
        licensingOtherEarnedIncome: 0,
        productCostFulfillmentRefunds: 0,
        platformPaymentAffiliateReversals: 0,
        equipmentSoftwareAssets: 0,
        contractors: 0,
        advertising: 0,
        travelPropsSamples: 0,
        insuranceLegalAccounting: 0,
        phoneInternetWebsite: 0,
        otherExpenses: 0,
        planningResearchHours: 0,
        productionEditingHours: 0,
        publishingCommunityHours: 0,
        brandSalesNegotiationHours: 0,
        reportingAdminSupportHours: 0,
      },
      budget: [],
    };
  }

  if (id === "online-community-moderator") {
    return {
      mode: "service",
      title: `${name} — Monthly Profit Calculator`,
      blurb:
        "Small projects × average fee + recurring hours × hourly rate + live-event + audit/setup + other approved service income = monthly revenue. Subtract internet/phone, software/security, equipment, advertising, payment fees, training, and other.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only for small starter projects, not a guarantee. Do not bill the same scheduled hour twice. Revenue is not profit.",
      defaults: {
        moderatorSmallProjects: 0,
        averageProjectFee: 0,
        recurringHours: 0,
        averageHourlyRate: 0,
        liveEventIncome: 0,
        auditSetupIncome: 0,
        otherApprovedServiceIncome: 0,
        internetPhone: 0,
        softwareSecurity: 0,
        equipment: 0,
        advertisingPlatformFees: 0,
        paymentFees: 0,
        training: 0,
        otherExpenses: 0,
        moderationHours: 0,
        setupAuditHours: 0,
        reportsAdminHours: 0,
        marketingHours: 0,
      },
      budget: [],
    };
  }

  if (id === "basic-invitation-creator") {
    return {
      mode: "service",
      title: `${name} — Invitation Profit Calculator`,
      blurb:
        "Template + custom + add-on + rush + extra revision revenue = gross revenue. Subtract paid assets, software, payment processing, advertising, test printing, and other. Revenue is not profit.",
      disclaimerExtra:
        "Displayed $15 – $50 / project is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        templateInvites: 0,
        templatePrice: 0,
        customDesigns: 0,
        customPrice: 0,
        addOnRevenue: 0,
        rushFees: 0,
        extraRevisionRevenue: 0,
        paidAssets: 0,
        software: 0,
        paymentProcessing: 0,
        advertising: 0,
        testPrinting: 0,
        otherExpenses: 0,
        laborHours: 0,
        projectsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "pod") {
    return {
      mode: "service",
      title: `${name} — POD Profit Calculator`,
      blurb:
        "Units × selling price = gross sales. Subtract POD production, shipping you pay, fees, advertising, discounts, refunds/replacements, software, samples, and other operating expenses. Optional second product lets you compare SKUs. Gross sales are not profit.",
      disclaimerExtra:
        "Displayed $200 – $3,000 / month is examples only, not a guarantee. POD is not a zero-cost business. Check current official costs and fees.",
      defaults: {
        podUnitsSold: 0,
        averageSellingPrice: 0,
        productionCostPerUnit: 0,
        shippingPaidBySellerPerUnit: 0,
        feesPerUnit: 0,
        advertisingPerUnit: 0,
        discounts: 0,
        refundsReplacements: 0,
        softwareApps: 0,
        sampleCosts: 0,
        otherOperatingExpenses: 0,
        secondProductUnits: 0,
        secondProductPrice: 0,
        secondProductCostPerUnit: 0,
      },
      budget: [],
    };
  }

  if (id === "pet-sitting") {
    return {
      mode: "service",
      title: `${name} — Pet Sitting Profit Calculator`,
      blurb:
        "Walk + drop-in + overnight + add-on revenue = gross revenue. Subtract mileage, supplies, payment/platform fees, insurance allocation, advertising, and other. Revenue is not profit.",
      disclaimerExtra:
        "Displayed $25 – $75 / day drop-in is examples only, not a guarantee. Revenue is not profit.",
      defaults: {
        dogWalkVisits: 0,
        walkPrice: 0,
        dropInVisits: 0,
        dropInPrice: 0,
        overnightNights: 0,
        overnightPrice: 0,
        addOnRevenue: 0,
        mileageTravel: 0,
        supplies: 0,
        paymentPlatformFees: 0,
        insuranceAllocation: 0,
        advertising: 0,
        otherExpenses: 0,
        laborHours: 0,
        totalVisits: 0,
        clientsServed: 0,
      },
      budget: [],
    };
  }

  if (id === "friendship-bracelet-maker") {
    return {
      mode: "service",
      title: `${name} — Bracelet Profit Calculator`,
      blurb:
        "Simple + pattern + personalized + set + custom sales = gross sales. Gifted bracelets are $0 revenue. Subtract thread, beads, packaging, fees, ads, and other. Gross sales are not profit.",
      disclaimerExtra: "Displayed $15 – $50 / project is examples only, not a guarantee. Gifted bracelets are $0 sales.",
      defaults: {
        friendshipBraceletsSimple: 0,
        simplePrice: 0,
        patternCount: 0,
        patternPrice: 0,
        personalizedCount: 0,
        personalizedPrice: 0,
        setCount: 0,
        setPrice: 0,
        customOrderRevenue: 0,
        braceletsGifted: 0,
        threadCord: 0,
        beadsFindings: 0,
        packaging: 0,
        displayEvent: 0,
        paymentFees: 0,
        advertising: 0,
        shippingPostage: 0,
        otherExpenses: 0,
        laborHours: 0,
        braceletsSold: 0,
      },
      budget: [],
    };
  }

  if (id === "leaf-raking") {
    return {
      mode: "service",
      title: `${name} — Leaf Blowing Profit Calculator`,
      blurb:
        "Small + standard + large jobs + bagging + removal + recurring = gross. Subtract fuel, bags, travel, disposal, maintenance, fees, ads, and other. Revenue is not profit.",
      disclaimerExtra: "Displayed $15 – $50 / job is examples only, not a guarantee.",
      defaults: {
        leafBlowingSmallJobs: 0,
        smallJobPrice: 0,
        standardJobs: 0,
        standardJobPrice: 0,
        largeJobs: 0,
        largeJobPrice: 0,
        baggingRevenue: 0,
        removalRevenue: 0,
        recurringRevenue: 0,
        fuelCharging: 0,
        bagsConsumables: 0,
        travel: 0,
        disposal: 0,
        equipmentMaintenance: 0,
        paymentFees: 0,
        advertising: 0,
        otherExpenses: 0,
        laborHours: 0,
        jobsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "lemonade-stand") {
    return {
      mode: "service",
      title: `${name} — Drink Stand Profit Calculator`,
      blurb:
        "Servings sold × price per drink = gross sales. Subtract ingredients, ice, cups, other direct costs, fees, and other. Price per drink — not a job fee. Parent-supplied ingredients are not free.",
      disclaimerExtra: "Price primarily per drink (~$1–$3). $10–$40 / job does not fit this hustle. Examples only.",
      defaults: {
        lemonadeServingsSold: 0,
        averageSellingPrice: 0,
        servingsPrepared: 0,
        ingredientCost: 0,
        iceCost: 0,
        cupLidStrawCost: 0,
        otherDirectCosts: 0,
        paymentFees: 0,
        otherExpenses: 0,
        laborHours: 0,
      },
      budget: [],
    };
  }

  if (id === "airbnb") {
    return {
      mode: "service",
      title: `${name} — Hosting Profit Calculator`,
      blurb:
        "Booked nights × ADR + other host revenue = gross booking revenue. Subtract operating expenses. Cash flow uses the full housing cash payment, not just the mortgage/rent allocation. Gross is not profit.",
      disclaimerExtra:
        "Displayed $1,500 – $8,000 / month is examples only, not a guarantee. Non-owners: use Arbitrage Hosting or Co-Host.",
      defaults: {
        airbnbHostBookedNights: 0,
        availableNights: 0,
        avgNightlyRevenue: 0,
        otherHostRevenue: 0,
        mortgageRentAllocation: 0,
        propertyTaxAllocation: 0,
        insurance: 0,
        utilities: 0,
        internet: 0,
        cleaningPaidByHost: 0,
        laundry: 0,
        platformFees: 0,
        guestSupplies: 0,
        restocking: 0,
        maintenanceReserve: 0,
        permitsAllocation: 0,
        software: 0,
        advertising: 0,
        parkingHoa: 0,
        otherExpenses: 0,
        housingCashPayment: 0,
      },
      budget: [],
    };
  }

  if (id === "digital-cookbook-creator") {
    return {
      mode: "service",
      title: `${name} — Cookbook Profit Calculator`,
      blurb:
        "Mini + small + medium projects + add-ons = gross. Subtract software, fees, test prints, storage, ads, and other. Revenue is not profit.",
      disclaimerExtra: "Displayed $15 – $50 / project is examples only, not a guarantee.",
      defaults: {
        cookbookMiniProjects: 0,
        miniPrice: 0,
        smallProjects: 0,
        smallPrice: 0,
        mediumProjects: 0,
        mediumPrice: 0,
        transcriptionAddOns: 0,
        photoCleanupAddOns: 0,
        printReadyAddOn: 0,
        rushFees: 0,
        extraRevisionFees: 0,
        softwareAssets: 0,
        paymentFees: 0,
        testPrinting: 0,
        storageDelivery: 0,
        advertising: 0,
        otherExpenses: 0,
        laborHours: 0,
        projectsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "family-photo-slideshow") {
    return {
      mode: "service",
      title: `${name} — Slideshow Profit Calculator`,
      blurb:
        "Basic + large projects + scanning + rush + extra revisions/versions = gross. Subtract software, licensed music, storage, fees, ads, scanning/travel, and other.",
      disclaimerExtra: "Displayed $15 – $50 / project is examples only, not a guarantee. Streaming apps are not sync licenses.",
      defaults: {
        slideshowBasicProjects: 0,
        basicPrice: 0,
        largeProjects: 0,
        largePrice: 0,
        scanningAddOns: 0,
        rushFees: 0,
        extraRevisionRevenue: 0,
        extraVersionRevenue: 0,
        softwareAllocation: 0,
        licensedMusic: 0,
        cloudStorage: 0,
        paymentFees: 0,
        advertising: 0,
        scanningTravel: 0,
        otherExpenses: 0,
        laborHours: 0,
        projectsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "local-resource-list-creator") {
    return {
      mode: "service",
      title: `${name} — Resource List Profit Calculator`,
      blurb:
        "Copies sold × copy price + custom projects + updates + add-ons = gross. Subtract software, fees, printing, ads, research travel, and other. Future copy sales are not guaranteed.",
      disclaimerExtra: "Displayed $15 – $50 / project is examples only, not a guarantee.",
      defaults: {
        resourceListCopiesSold: 0,
        copyPrice: 0,
        customProjects: 0,
        customPrice: 0,
        updateRevenue: 0,
        addOnRevenue: 0,
        softwareDesign: 0,
        platformPaymentFees: 0,
        printing: 0,
        advertising: 0,
        travelResearch: 0,
        otherExpenses: 0,
        laborHours: 0,
      },
      budget: [],
    };
  }

  if (id === "recycling-helper") {
    return {
      mode: "service",
      title: `${name} — Recycling Helper Profit Calculator`,
      blurb:
        "Curb-out + return + sorting visits + packages + add-ons = gross. Subtract travel, gloves, fees, ads, and other. Bottle deposits are not helper revenue unless separately agreed.",
      disclaimerExtra: "Displayed $10 – $40 / job is examples only. Recurring visits fit better.",
      defaults: {
        recyclingCurbOutVisits: 0,
        curbOutPrice: 0,
        curbReturnVisits: 0,
        curbReturnPrice: 0,
        sortingVisits: 0,
        sortingPrice: 0,
        monthlyPackageRevenue: 0,
        addOnRevenue: 0,
        travel: 0,
        glovesConsumables: 0,
        paymentFees: 0,
        advertising: 0,
        otherExpenses: 0,
        laborHours: 0,
        visitsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "proofreader") {
    return {
      mode: "service",
      title: `${name} — Proofreading Profit Calculator`,
      blurb:
        "Short + standard + long projects + hourly + rush + extra revisions = gross. Subtract software, fees, ads, printing, subcontracting, and other.",
      disclaimerExtra: "Displayed $15 – $50 / project is examples only. Proofreading is not rewriting or completing graded work.",
      defaults: {
        proofreadingShortProjects: 0,
        shortPrice: 0,
        standardProjects: 0,
        standardPrice: 0,
        longProjects: 0,
        longPrice: 0,
        hourlyHours: 0,
        hourlyRate: 0,
        rushFees: 0,
        extraRevisionFees: 0,
        softwareTools: 0,
        paymentFees: 0,
        advertising: 0,
        printing: 0,
        subcontracting: 0,
        otherExpenses: 0,
        laborHours: 0,
        projectsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "toy-organizer") {
    return {
      mode: "service",
      title: `${name} — Toy Organizer Profit Calculator`,
      blurb:
        "Small + standard + large projects + add-ons + maintenance = gross service revenue. Client storage reimbursements are not profit. Subtract consumable supplies, travel, fees, ads, and other.",
      disclaimerExtra: "Storage products the client pays for are reimbursements — not organizer profit.",
      defaults: {
        toyOrganizerSmallProjects: 0,
        smallPrice: 0,
        standardProjects: 0,
        standardPrice: 0,
        largeProjects: 0,
        largePrice: 0,
        addOnServiceRevenue: 0,
        maintenanceRevenue: 0,
        storageReimbursements: 0,
        consumableSupplies: 0,
        travel: 0,
        paymentFees: 0,
        advertising: 0,
        otherExpenses: 0,
        laborHours: 0,
        projectsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "trash-can-service") {
    return {
      mode: "service",
      title: `${name} — Trash Can Service Profit Calculator`,
      blurb:
        "Curb-out + return visits + packages + extra-bin + vacation + extra = gross. Subtract travel, gloves, fees, ads, and other.",
      disclaimerExtra: "Displayed $10 – $40 / job is examples only. Recurring visits fit better.",
      defaults: {
        trashCanCurbOutVisits: 0,
        curbOutPrice: 0,
        curbReturnVisits: 0,
        curbReturnPrice: 0,
        monthlyPackageRevenue: 0,
        multiBinAddOnRevenue: 0,
        vacationCoverageRevenue: 0,
        extraRevenue: 0,
        travel: 0,
        glovesConsumables: 0,
        paymentFees: 0,
        advertising: 0,
        otherExpenses: 0,
        laborHours: 0,
        visitsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "homework") {
    return {
      mode: "service",
      title: `${name} — Session Profit Calculator`,
      blurb:
        "30 / 45 / 60 minute sessions + packages = gross. Subtract materials, travel, fees, ads, and other. You never charge for completing graded work.",
      disclaimerExtra: "Displayed $15 – $40 / session is examples only, not a guarantee.",
      defaults: {
        homeworkHelperSessions30: 0,
        price30: 0,
        sessions45: 0,
        price45: 0,
        sessions60: 0,
        price60: 0,
        packageRevenue: 0,
        materials: 0,
        travel: 0,
        paymentFees: 0,
        advertising: 0,
        otherExpenses: 0,
        laborHours: 0,
        sessionsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "canva-flyer-creator") {
    return {
      mode: "service",
      title: `${name} — Flyer Profit Calculator`,
      blurb:
        "Simple + standard + detailed projects + social packs + recurring + add-ons = gross. Subtract software/assets, ads, fees, printing/proofs, contractors, and other. Revenue is not profit.",
      disclaimerExtra: "Displayed $15 – $50 / project is examples only, not a guarantee.",
      defaults: {
        canvaFlyerSimpleProjects: 0,
        simplePrice: 0,
        standardProjects: 0,
        standardPrice: 0,
        detailedProjects: 0,
        detailedPrice: 0,
        socialPackRevenue: 0,
        recurringRevenue: 0,
        addOnRevenue: 0,
        softwareAssets: 0,
        advertising: 0,
        paymentFees: 0,
        printingProofs: 0,
        contractors: 0,
        otherExpenses: 0,
        laborHours: 0,
        projectsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "car-interior-cleanup") {
    return {
      mode: "service",
      title: `${name} — Interior Cleanup Profit Calculator`,
      blurb:
        "Quick + standard + larger jobs + add-ons + recurring = gross. Subtract supplies, equipment, travel, fees, ads, and other. Revenue is not profit.",
      disclaimerExtra: "Displayed $10 – $40 / job is examples only. Light cleanup, not professional detailing.",
      defaults: {
        carInteriorQuickJobs: 0,
        quickPrice: 0,
        standardJobs: 0,
        standardPrice: 0,
        largerJobs: 0,
        largerPrice: 0,
        addOnRevenue: 0,
        recurringRevenue: 0,
        supplies: 0,
        equipmentCosts: 0,
        travel: 0,
        paymentFees: 0,
        advertising: 0,
        otherExpenses: 0,
        laborHours: 0,
        vehiclesCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "dog-walk") {
    return {
      mode: "service",
      title: `${name} — Walk Profit Calculator`,
      blurb:
        "Walk fees + extra-dog + add-ons = gross. Subtract supplies, travel, fees, ads, and insurance/business costs where they apply. Revenue is not profit.",
      disclaimerExtra: "Displayed $10 – $20 / walk is examples only, not a guarantee. Never walk a dog you cannot control.",
      defaults: {
        neighborhoodWalks15: 0,
        price15: 0,
        walks30: 0,
        price30: 0,
        walks45: 0,
        price45: 0,
        extraDogFees: 0,
        addOnRevenue: 0,
        supplies: 0,
        travel: 0,
        paymentFees: 0,
        advertising: 0,
        insuranceBusiness: 0,
        otherExpenses: 0,
        laborHours: 0,
        walksCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "greeting-card-creator") {
    return {
      mode: "service",
      title: `${name} — Card Profit Calculator`,
      blurb:
        "Handmade + personalized + digital + custom Canva = gross. Subtract paper/ink/envelopes, packaging, shipping, software, fees, ads, and other. Keep physical and digital costs separate.",
      disclaimerExtra: "Displayed $15 – $50 / project is examples only.",
      defaults: {
        greetingCardHandmadeSold: 0,
        handmadePrice: 0,
        personalizedHandmade: 0,
        personalizedPrice: 0,
        digitalSold: 0,
        digitalPrice: 0,
        customCanvaOrders: 0,
        customCanvaPrice: 0,
        paperInkEnvelopes: 0,
        embellishmentsPackaging: 0,
        shipping: 0,
        softwareAssets: 0,
        paymentFees: 0,
        advertising: 0,
        otherExpenses: 0,
        laborHours: 0,
        cardsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "holiday-decorating-helper") {
    return {
      mode: "service",
      title: `${name} — Decorating Profit Calculator`,
      blurb:
        "Quick + standard + larger + hourly + take-down + packages + add-ons = gross. Subtract supplies, travel, parking/tolls, fees, ads, helpers, and other. Indoor only.",
      disclaimerExtra: "Displayed $10 – $40 / job is examples only. Ladders only with adults.",
      defaults: {
        holidayDecoratingQuickJobs: 0,
        quickPrice: 0,
        standardSessions: 0,
        standardPrice: 0,
        largerSessions: 0,
        largerPrice: 0,
        hourlyHours: 0,
        hourlyRate: 0,
        takeDownRevenue: 0,
        packageRevenue: 0,
        addOnRevenue: 0,
        supplies: 0,
        travel: 0,
        parkingTolls: 0,
        paymentFees: 0,
        advertising: 0,
        helperCosts: 0,
        otherExpenses: 0,
        laborHours: 0,
        jobsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "handyman-light") {
    return {
      mode: "service",
      title: `${name} — Light Home Help Profit Calculator`,
      blurb:
        "Hourly + flat-rate + packages = gross. Subtract unreimbursed materials, supplies, travel, parking, fees, ads, tool wear, insurance/business, and other. Materials reimbursement is not profit.",
      disclaimerExtra: "Displayed $40 – $80 / hour is examples only. Stay in light-job scope.",
      defaults: {
        lightHandymanHours: 0,
        hourlyRate: 0,
        flatRateRevenue: 0,
        packageRevenue: 0,
        materialsReimbursed: 0,
        materialsCost: 0,
        supplies: 0,
        fuelTravel: 0,
        parkingTolls: 0,
        paymentFees: 0,
        advertising: 0,
        toolWear: 0,
        insuranceBusiness: 0,
        otherExpenses: 0,
        laborHours: 0,
        jobsCompleted: 0,
      },
      budget: [],
    };
  }

  if (id === "tutoring") {
    return {
      mode: "service",
      title: `${name} — Tutoring Profit Calculator`,
      blurb:
        "1-on-1 + group + packages = gross. Subtract materials, software, fees, ads, travel/parking, and other. Track profit per teaching hour and per total hour.",
      disclaimerExtra: "Displayed $20 – $60 / hour is examples only. No grade or outcome guarantees.",
      defaults: {
        tutoringSessions1on1: 0,
        oneOnOnePrice: 0,
        groupParticipants: 0,
        groupPrice: 0,
        packageRevenue: 0,
        otherRevenue: 0,
        materials: 0,
        software: 0,
        paymentFees: 0,
        advertising: 0,
        travelParking: 0,
        otherExpenses: 0,
        teachingHours: 0,
        laborHours: 0,
      },
      budget: [],
    };
  }

  if (id === "vacation-mail-plant-helper") {
    return {
      mode: "service",
      title: `${name} — Plant Visit Profit Calculator`,
      blurb:
        "Quick + standard + larger visits + packages + add-ons = gross. Subtract travel, parking/tolls, supplies, fees, ads, and other. Price per visit vs trip total.",
      disclaimerExtra: "Displayed $10 – $40 / job is examples only. Plants only — never mail or packages.",
      defaults: {
        vacationPlantQuickVisits: 0,
        quickPrice: 0,
        standardVisits: 0,
        standardPrice: 0,
        largerVisits: 0,
        largerPrice: 0,
        packageRevenue: 0,
        addOnRevenue: 0,
        travel: 0,
        parkingTolls: 0,
        supplies: 0,
        paymentFees: 0,
        advertising: 0,
        otherExpenses: 0,
        laborHours: 0,
        visitsCompleted: 0,
      },
      budget: [],
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
                            : id === "errand-runner"
                              ? `${name} — Errand Runner Profit Calculator`
                              : id === "homework-organizer"
                                ? `${name} — Homework Organizer Profit Calculator`
                              : id === "group-setup-helper"
                                ? `${name} — Social Setup Project Profit Calculator`
                              : id === "house-sitter"
                                ? `${name} — House Sitter Profit Calculator`
                              : id === "bookkeeping"
                                ? `${name} — Bookkeeping & Admin Support Profit Calculator`
                              : id === "closet-cleanout-listing"
                                ? `${name} — Closet Clean-Out Listing Helper Profit Calculator`
                              : id === "nonprofit-social-helper"
                                ? `${name} — Church/Nonprofit Social Media Helper Profit Calculator`
                              : id === "junior-games-ai"
                                ? `${name} — AI Game Prototype Project Calculator`
                              : id === "tech-helper"
                                ? `${name} — Senior Tech Helper Profit Calculator`
                              : id === "yard-help"
                                ? `${name} — Yard & Garden Helper Profit Calculator`
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
                            : id === "errand-runner"
                              ? "Enter average service fee, jobs per week, tips/extra approved pay, hours per job including travel, and expenses. Client merchandise reimbursements are not revenue. Weekly profit × 4.33 = monthly estimate."
                              : id === "homework-organizer"
                                ? "Enter average project price, projects per week, recurring check-in revenue, hours per project, and expenses. Revenue is money received. Profit is money left after business expenses."
                              : id === "group-setup-helper"
                                ? "Enter average project price, projects per week, add-on revenue, hours per project, and expenses. Weekly profit × 4.33 = monthly estimate. Revenue is money received. Profit is money remaining after business expenses."
                              : id === "house-sitter"
                                ? "Enter average fee per job/visit, paid visits per week, add-on revenue, hours per visit including travel, and expenses. Weekly profit × 4.33 = monthly estimate. Revenue is money received. Profit is money remaining after business expenses."
                              : id === "bookkeeping"
                                ? "Enter hourly rate, billable hours per week, monthly retainer revenue, non-billable admin hours, and weekly expenses. Weekly retainer equivalent = monthly retainer ÷ 4.33. Billable hours = time charged to clients. Non-billable time is marketing, learning, and your own admin."
                              : id === "closet-cleanout-listing"
                                ? "Enter average project fee, projects per week, add-on revenue, hours per project, and expenses. Client merchandise proceeds are not your service revenue. Weekly profit × 4.33 = monthly estimate."
                              : id === "nonprofit-social-helper"
                                ? "Enter average project fee, projects per week, monthly recurring client revenue, add-on revenue, hours per project, recurring client hours, and expenses. Weekly equivalent of monthly recurring = monthly ÷ 4.33. Do not count organization donations or fundraising proceeds as your revenue. Weekly profit × 4.33 = monthly estimate."
                              : id === "junior-games-ai"
                                ? "Optional paid-project math only. Enter project fee, add-on revenue, software/asset/advertising/other expenses, and planning + build + testing/revision hours. Revenue = money received. Profit = money remaining after expenses. A prototype is an early playable demonstration, not automatically a finished commercial game. Guardian-approved payment/client arrangements for minors."
                              : id === "tech-helper"
                                ? "Enter average session fee, sessions per week, package/follow-up revenue, travel/printing/advertising/supplies/other expenses, session hours, and travel/admin hours per session. Weekly profit × 4.33 = monthly estimate. Revenue = money received from clients. Profit = money remaining after business expenses."
                              : id === "yard-help"
                                ? "Enter average yard fee, yards per week, add-on revenue, supplies/bags, fuel/travel, disposal, advertising, other expenses, job hours, and travel/admin hours. Job hours and travel/admin hours are weekly totals. Weekly profit × 4.33 = monthly estimate. Revenue = money received. Profit = money remaining after business expenses."
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
                            : id === "errand-runner"
                              ? "Planning estimates only. Client money used to buy groceries, medicine, household goods, returns, or other merchandise is not earned revenue. Only count service fees, tips, and other compensation you actually earn. Examples are not income guarantees."
                              : id === "homework-organizer"
                                ? "Planning estimates only. Revenue is money received. Profit is money left after business expenses. Examples are not income guarantees."
                              : id === "group-setup-helper"
                                ? "Planning estimates only. Revenue = money received. Profit = money remaining after business expenses. Examples are not income guarantees."
                              : id === "house-sitter"
                                ? "Planning estimates only. Revenue = money received. Profit = money remaining after business expenses. Examples are not income guarantees."
                              : id === "bookkeeping"
                                ? "Planning estimates only. Billable hours = time charged to clients. Non-billable time = marketing, bookkeeping, learning, proposals, and business administration. Revenue = money earned from clients. Profit = revenue remaining after business expenses. Examples are not income guarantees."
                              : id === "closet-cleanout-listing"
                                ? "Planning estimates only. If a client’s item sells for $80, that $80 is not automatically your revenue. Your revenue is the agreed listing-helper/service fee plus any separately agreed commission or add-on. Profit = revenue remaining after business expenses. Examples are not income guarantees."
                              : id === "nonprofit-social-helper"
                                ? "Planning estimates only. Revenue = money received from clients. Profit = money remaining after business expenses. Do not count donations or fundraising proceeds collected by the organization as your business revenue. Examples are not income guarantees."
                              : id === "junior-games-ai"
                                ? "Planning estimates only. Optional paid prototype work for minors requires guardian-approved processes. Revenue = money received. Profit = money remaining after expenses. Prototype = early playable demonstration, not a finished commercial game. Examples are not income guarantees."
                              : id === "tech-helper"
                                ? "Planning estimates only. Revenue = money received from clients. Profit = money remaining after business expenses. This is tutoring/basic setup, not repair, cybersecurity, or professional IT. Examples are not income guarantees."
                              : id === "yard-help"
                                ? "Planning estimates only. Revenue = money received. Profit = money remaining after business expenses. This is light yard help, not dangerous landscaping. Examples are not income guarantees."
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
      ...(id === "errand-runner" ? { extraEventPay: 0, hoursPerShoot: 0 } : {}),
      ...(id === "homework-organizer" ? { recurringClientRevenue: 0, hoursPerShoot: 0 } : {}),
      ...(id === "group-setup-helper" ? { extraEventPay: 0, hoursPerShoot: 0 } : {}),
      ...(id === "house-sitter" ? { extraEventPay: 0, hoursPerShoot: 0 } : {}),
      ...(id === "bookkeeping" ? { monthlyRetainerRevenue: 0, nonBillableHoursPerWeek: 0 } : {}),
      ...(id === "closet-cleanout-listing" ? { extraEventPay: 0, hoursPerShoot: 0 } : {}),
      ...(id === "nonprofit-social-helper"
        ? { extraEventPay: 0, hoursPerShoot: 0, monthlyRetainerRevenue: 0, nonBillableHoursPerWeek: 0 }
        : {}),
      ...(id === "junior-games-ai"
        ? { extraEventPay: 0, hoursPerShoot: 0, editingHoursPerShoot: 0, testingHoursPerProject: 0 }
        : {}),
      ...(id === "tech-helper"
        ? { extraEventPay: 0, hoursPerShoot: 0, editingHoursPerShoot: 0 }
        : {}),
      ...(id === "yard-help"
        ? { extraEventPay: 0, hoursWorkedPerWeek: 0, hoursPerShoot: 0 }
        : {}),
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
                        : id === "errand-runner"
                          ? [
                              { id: "transport", label: "Fuel / travel ($ / week)", amount: 0 },
                              { id: "tolls", label: "Parking / tolls ($ / week)", amount: 0 },
                              { id: "supplies", label: "Business supplies ($ / week)", amount: 0 },
                              { id: "other", label: "Other business expenses ($ / week)", amount: 0 },
                            ]
                          : id === "homework-organizer"
                            ? [
                                { id: "supplies", label: "Printing / supplies ($ / week)", amount: 0 },
                                { id: "transport", label: "Travel ($ / week)", amount: 0 },
                                { id: "ads", label: "Advertising ($ / week)", amount: 0 },
                                { id: "other", label: "Other business expenses ($ / week)", amount: 0 },
                              ]
                          : id === "group-setup-helper"
                            ? [
                                { id: "software", label: "Software/design costs ($ / week)", amount: 0 },
                                { id: "ads", label: "Advertising ($ / week)", amount: 0 },
                                { id: "transport", label: "Travel ($ / week)", amount: 0 },
                                { id: "other", label: "Other business expenses ($ / week)", amount: 0 },
                              ]
                          : id === "house-sitter"
                            ? [
                                { id: "transport", label: "Travel/fuel ($ / week)", amount: 0 },
                                { id: "tolls", label: "Parking/tolls ($ / week)", amount: 0 },
                                { id: "supplies", label: "Supplies ($ / week)", amount: 0 },
                                { id: "ads", label: "Advertising ($ / week)", amount: 0 },
                                { id: "other", label: "Other business expenses ($ / week)", amount: 0 },
                              ]
                          : id === "bookkeeping"
                            ? [
                                { id: "software", label: "Software cost ($ / week)", amount: 0 },
                                { id: "insurance", label: "Insurance / business cost ($ / week)", amount: 0 },
                                { id: "ads", label: "Advertising ($ / week)", amount: 0 },
                                { id: "transport", label: "Travel ($ / week)", amount: 0 },
                                { id: "other", label: "Other business expenses ($ / week)", amount: 0 },
                              ]
                          : id === "closet-cleanout-listing"
                            ? [
                                { id: "transport", label: "Travel ($ / week)", amount: 0 },
                                { id: "supplies", label: "Supplies ($ / week)", amount: 0 },
                                { id: "ads", label: "Advertising ($ / week)", amount: 0 },
                                { id: "other", label: "Other business expenses ($ / week)", amount: 0 },
                              ]
                          : id === "nonprofit-social-helper"
                            ? [
                                { id: "software", label: "Software ($ / week)", amount: 0 },
                                { id: "transport", label: "Travel ($ / week)", amount: 0 },
                                { id: "ads", label: "Advertising ($ / week)", amount: 0 },
                                { id: "other", label: "Other business expenses ($ / week)", amount: 0 },
                              ]
                          : id === "junior-games-ai"
                            ? [
                                { id: "software", label: "Software/tool cost ($)", amount: 0 },
                                { id: "supplies", label: "Asset cost ($)", amount: 0 },
                                { id: "ads", label: "Advertising/portfolio cost ($)", amount: 0 },
                                { id: "other", label: "Other expenses ($)", amount: 0 },
                              ]
                          : id === "tech-helper"
                            ? [
                                { id: "transport", label: "Travel/fuel ($ / week)", amount: 0 },
                                { id: "printing", label: "Printing ($ / week)", amount: 0 },
                                { id: "ads", label: "Advertising ($ / week)", amount: 0 },
                                { id: "supplies", label: "Supplies ($ / week)", amount: 0 },
                                { id: "other", label: "Other business expenses ($ / week)", amount: 0 },
                              ]
                          : id === "yard-help"
                            ? [
                                { id: "supplies", label: "Supplies / bags ($ / week)", amount: 0 },
                                { id: "transport", label: "Fuel / travel ($ / week)", amount: 0 },
                                { id: "disposal", label: "Disposal ($ / week)", amount: 0 },
                                { id: "ads", label: "Advertising ($ / week)", amount: 0 },
                                { id: "other", label: "Other expenses ($ / week)", amount: 0 },
                              ]
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
    stillNeeded?: number;
    weeklySavingsGoal?: number;
    estimatedWeeklyEarnings?: number;
    estimatedWeeklySavings?: number;
    percentComplete?: number;
    savingsOnTrack?: boolean | null;
    savingsStatusLabel?: string;
    salesNeeded?: number;
    profitPerSale?: number;
    breakEvenUnits?: number;
    monthlyCashFlow?: number;
    annualCashFlow?: number;
    cashInvested?: number;
    cashOnCashPercent?: number;
    occupancyPercent?: number;
    monthsToRecoverSetup?: number;
    utilizationPercent?: number;
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

  if (Object.prototype.hasOwnProperty.call(inputs, "airbnbHostBookedNights")) {
    const calc = computeAirbnbHostingProfit({
      airbnbHostBookedNights: inputs.airbnbHostBookedNights || 0,
      availableNights: inputs.availableNights || 0,
      avgNightlyRevenue: inputs.avgNightlyRevenue || 0,
      otherHostRevenue: inputs.otherHostRevenue || 0,
      mortgageRentAllocation: inputs.mortgageRentAllocation || 0,
      propertyTaxAllocation: inputs.propertyTaxAllocation || 0,
      insurance: inputs.insurance || 0,
      utilities: inputs.utilities || 0,
      internet: inputs.internet || 0,
      cleaningPaidByHost: inputs.cleaningPaidByHost || 0,
      laundry: inputs.laundry || 0,
      platformFees: inputs.platformFees || 0,
      guestSupplies: inputs.guestSupplies || 0,
      restocking: inputs.restocking || 0,
      maintenanceReserve: inputs.maintenanceReserve || 0,
      permitsAllocation: inputs.permitsAllocation || 0,
      software: inputs.software || 0,
      advertising: inputs.advertising || 0,
      parkingHoa: inputs.parkingHoa || 0,
      otherExpenses: inputs.otherExpenses || 0,
      housingCashPayment: inputs.housingCashPayment || 0,
    });
    if (calc.grossBookingRevenue > 0 || calc.operatingExpenses > 0) {
      notes.push(
        `ADR × booked nights + other host revenue = $${calc.grossBookingRevenue.toFixed(2)}. Operating expenses $${calc.operatingExpenses.toFixed(2)}.`,
      );
      if (calc.occupancyPercent != null) notes.push(`Occupancy ${calc.occupancyPercent.toFixed(1)}%.`);
      notes.push(
        `Operating profit $${calc.estimatedOperatingProfit.toFixed(2)}. Cash flow $${calc.cashFlow.toFixed(2)} (uses full housing cash payment).`,
      );
      notes.push("MARKET-DEPENDENT — examples only, not guarantees. Gross booking revenue is not profit.");
    }
    return {
      revenue: calc.grossBookingRevenue,
      expenses: calc.operatingExpenses,
      net: calc.estimatedOperatingProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        occupancyPercent: calc.occupancyPercent ?? undefined,
        monthlyCashFlow: calc.cashFlow,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "friendshipBraceletsSimple")) {
    const calc = computeFriendshipBraceletProfit({
      friendshipBraceletsSimple: inputs.friendshipBraceletsSimple || 0,
      simplePrice: inputs.simplePrice || 0,
      patternCount: inputs.patternCount || 0,
      patternPrice: inputs.patternPrice || 0,
      personalizedCount: inputs.personalizedCount || 0,
      personalizedPrice: inputs.personalizedPrice || 0,
      setCount: inputs.setCount || 0,
      setPrice: inputs.setPrice || 0,
      customOrderRevenue: inputs.customOrderRevenue || 0,
      braceletsGifted: inputs.braceletsGifted || 0,
      threadCord: inputs.threadCord || 0,
      beadsFindings: inputs.beadsFindings || 0,
      packaging: inputs.packaging || 0,
      displayEvent: inputs.displayEvent || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      shippingPostage: inputs.shippingPostage || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      braceletsSold: inputs.braceletsSold || 0,
    });
    if (calc.grossSales > 0 || calc.totalExpenses > 0) {
      notes.push(
        `Gross sales $${calc.grossSales.toFixed(2)}. Gifted bracelets (${calc.braceletsGifted}) are $0 revenue.`,
      );
      if (calc.profitPerBracelet != null) notes.push(`Profit/bracelet ≈ $${calc.profitPerBracelet.toFixed(2)}`);
      notes.push("Examples only; not guaranteed. Gross sales are not profit.");
    }
    return {
      revenue: calc.grossSales,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "leafBlowingSmallJobs")) {
    const calc = computeLeafRakingProfit({
      leafBlowingSmallJobs: inputs.leafBlowingSmallJobs || 0,
      smallJobPrice: inputs.smallJobPrice || 0,
      standardJobs: inputs.standardJobs || 0,
      standardJobPrice: inputs.standardJobPrice || 0,
      largeJobs: inputs.largeJobs || 0,
      largeJobPrice: inputs.largeJobPrice || 0,
      baggingRevenue: inputs.baggingRevenue || 0,
      removalRevenue: inputs.removalRevenue || 0,
      recurringRevenue: inputs.recurringRevenue || 0,
      fuelCharging: inputs.fuelCharging || 0,
      bagsConsumables: inputs.bagsConsumables || 0,
      travel: inputs.travel || 0,
      disposal: inputs.disposal || 0,
      equipmentMaintenance: inputs.equipmentMaintenance || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      jobsCompleted: inputs.jobsCompleted || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerJob != null) notes.push(`Profit/job ≈ $${calc.profitPerJob.toFixed(2)}`);
      notes.push("Examples only; not guaranteed. Revenue is not profit.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "lemonadeServingsSold")) {
    const calc = computeLemonadeStandProfit({
      lemonadeServingsSold: inputs.lemonadeServingsSold || 0,
      averageSellingPrice: inputs.averageSellingPrice || 0,
      servingsPrepared: inputs.servingsPrepared || 0,
      ingredientCost: inputs.ingredientCost || 0,
      iceCost: inputs.iceCost || 0,
      cupLidStrawCost: inputs.cupLidStrawCost || 0,
      otherDirectCosts: inputs.otherDirectCosts || 0,
      paymentFees: inputs.paymentFees || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
    });
    if (calc.grossSales > 0 || calc.totalCosts > 0) {
      notes.push(
        `Servings sold ${calc.servingsSold} × price = $${calc.grossSales.toFixed(2)}. Unsold ${calc.unsoldServings}.`,
      );
      if (calc.profitPerDrink != null) notes.push(`Profit/drink ≈ $${calc.profitPerDrink.toFixed(2)}`);
      notes.push("Price per drink. Parent-supplied ingredients are not free. Examples only.");
    }
    return {
      revenue: calc.grossSales,
      expenses: calc.totalCosts,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "cookbookMiniProjects")) {
    const calc = computeDigitalCookbookProfit({
      cookbookMiniProjects: inputs.cookbookMiniProjects || 0,
      miniPrice: inputs.miniPrice || 0,
      smallProjects: inputs.smallProjects || 0,
      smallPrice: inputs.smallPrice || 0,
      mediumProjects: inputs.mediumProjects || 0,
      mediumPrice: inputs.mediumPrice || 0,
      transcriptionAddOns: inputs.transcriptionAddOns || 0,
      photoCleanupAddOns: inputs.photoCleanupAddOns || 0,
      printReadyAddOn: inputs.printReadyAddOn || 0,
      rushFees: inputs.rushFees || 0,
      extraRevisionFees: inputs.extraRevisionFees || 0,
      softwareAssets: inputs.softwareAssets || 0,
      paymentFees: inputs.paymentFees || 0,
      testPrinting: inputs.testPrinting || 0,
      storageDelivery: inputs.storageDelivery || 0,
      advertising: inputs.advertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      projectsCompleted: inputs.projectsCompleted || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerProject != null) notes.push(`Profit/project ≈ $${calc.profitPerProject.toFixed(2)}`);
      notes.push("Examples only; not guaranteed. Revenue is not profit.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "slideshowBasicProjects")) {
    const calc = computeFamilyPhotoSlideshowProfit({
      slideshowBasicProjects: inputs.slideshowBasicProjects || 0,
      basicPrice: inputs.basicPrice || 0,
      largeProjects: inputs.largeProjects || 0,
      largePrice: inputs.largePrice || 0,
      scanningAddOns: inputs.scanningAddOns || 0,
      rushFees: inputs.rushFees || 0,
      extraRevisionRevenue: inputs.extraRevisionRevenue || 0,
      extraVersionRevenue: inputs.extraVersionRevenue || 0,
      softwareAllocation: inputs.softwareAllocation || 0,
      licensedMusic: inputs.licensedMusic || 0,
      cloudStorage: inputs.cloudStorage || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      scanningTravel: inputs.scanningTravel || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      projectsCompleted: inputs.projectsCompleted || 0,
    });
    if (calc.grossRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossRevenue.toFixed(2)}.`);
      if (calc.profitPerProject != null) notes.push(`Profit/project ≈ $${calc.profitPerProject.toFixed(2)}`);
      notes.push("Examples only; not guaranteed. Licensed music is a cost.");
    }
    return {
      revenue: calc.grossRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "resourceListCopiesSold")) {
    const calc = computeLocalResourceListProfit({
      resourceListCopiesSold: inputs.resourceListCopiesSold || 0,
      copyPrice: inputs.copyPrice || 0,
      customProjects: inputs.customProjects || 0,
      customPrice: inputs.customPrice || 0,
      updateRevenue: inputs.updateRevenue || 0,
      addOnRevenue: inputs.addOnRevenue || 0,
      softwareDesign: inputs.softwareDesign || 0,
      platformPaymentFees: inputs.platformPaymentFees || 0,
      printing: inputs.printing || 0,
      advertising: inputs.advertising || 0,
      travelResearch: inputs.travelResearch || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
    });
    if (calc.grossRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(
        `Copies $${calc.copyRevenue.toFixed(2)} · Custom $${calc.customRevenue.toFixed(2)}. Future copy sales are not guaranteed.`,
      );
      notes.push("Examples only; not guaranteed. Revenue is not profit.");
    }
    return {
      revenue: calc.grossRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "recyclingCurbOutVisits")) {
    const calc = computeRecyclingHelperProfit({
      recyclingCurbOutVisits: inputs.recyclingCurbOutVisits || 0,
      curbOutPrice: inputs.curbOutPrice || 0,
      curbReturnVisits: inputs.curbReturnVisits || 0,
      curbReturnPrice: inputs.curbReturnPrice || 0,
      sortingVisits: inputs.sortingVisits || 0,
      sortingPrice: inputs.sortingPrice || 0,
      monthlyPackageRevenue: inputs.monthlyPackageRevenue || 0,
      addOnRevenue: inputs.addOnRevenue || 0,
      travel: inputs.travel || 0,
      glovesConsumables: inputs.glovesConsumables || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      visitsCompleted: inputs.visitsCompleted || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerVisit != null) notes.push(`Profit/visit ≈ $${calc.profitPerVisit.toFixed(2)}`);
      notes.push("Examples only; not guaranteed. Deposits are not helper revenue unless separately agreed.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "proofreadingShortProjects")) {
    const calc = computeProofreaderProfit({
      proofreadingShortProjects: inputs.proofreadingShortProjects || 0,
      shortPrice: inputs.shortPrice || 0,
      standardProjects: inputs.standardProjects || 0,
      standardPrice: inputs.standardPrice || 0,
      longProjects: inputs.longProjects || 0,
      longPrice: inputs.longPrice || 0,
      hourlyHours: inputs.hourlyHours || 0,
      hourlyRate: inputs.hourlyRate || 0,
      rushFees: inputs.rushFees || 0,
      extraRevisionFees: inputs.extraRevisionFees || 0,
      softwareTools: inputs.softwareTools || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      printing: inputs.printing || 0,
      subcontracting: inputs.subcontracting || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      projectsCompleted: inputs.projectsCompleted || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerProject != null) notes.push(`Profit/project ≈ $${calc.profitPerProject.toFixed(2)}`);
      notes.push("Examples only; not guaranteed. Proofreading is not rewriting.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "toyOrganizerSmallProjects")) {
    const calc = computeToyOrganizerProfit({
      toyOrganizerSmallProjects: inputs.toyOrganizerSmallProjects || 0,
      smallPrice: inputs.smallPrice || 0,
      standardProjects: inputs.standardProjects || 0,
      standardPrice: inputs.standardPrice || 0,
      largeProjects: inputs.largeProjects || 0,
      largePrice: inputs.largePrice || 0,
      addOnServiceRevenue: inputs.addOnServiceRevenue || 0,
      maintenanceRevenue: inputs.maintenanceRevenue || 0,
      storageReimbursements: inputs.storageReimbursements || 0,
      consumableSupplies: inputs.consumableSupplies || 0,
      travel: inputs.travel || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      projectsCompleted: inputs.projectsCompleted || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(
        `Service revenue $${calc.grossServiceRevenue.toFixed(2)}. Storage reimbursements $${calc.storageReimbursements.toFixed(2)} are not profit.`,
      );
      if (calc.profitPerProject != null) notes.push(`Profit/project ≈ $${calc.profitPerProject.toFixed(2)}`);
      notes.push("Examples only; not guaranteed.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "trashCanCurbOutVisits")) {
    const calc = computeTrashCanServiceProfit({
      trashCanCurbOutVisits: inputs.trashCanCurbOutVisits || 0,
      curbOutPrice: inputs.curbOutPrice || 0,
      curbReturnVisits: inputs.curbReturnVisits || 0,
      curbReturnPrice: inputs.curbReturnPrice || 0,
      monthlyPackageRevenue: inputs.monthlyPackageRevenue || 0,
      multiBinAddOnRevenue: inputs.multiBinAddOnRevenue || 0,
      vacationCoverageRevenue: inputs.vacationCoverageRevenue || 0,
      extraRevenue: inputs.extraRevenue || 0,
      travel: inputs.travel || 0,
      glovesConsumables: inputs.glovesConsumables || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      visitsCompleted: inputs.visitsCompleted || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerVisit != null) notes.push(`Profit/visit ≈ $${calc.profitPerVisit.toFixed(2)}`);
      notes.push("Examples only; not guaranteed.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "homeworkHelperSessions30")) {
    const calc = computeHomeworkHelperProfit({
      homeworkHelperSessions30: inputs.homeworkHelperSessions30 || 0,
      price30: inputs.price30 || 0,
      sessions45: inputs.sessions45 || 0,
      price45: inputs.price45 || 0,
      sessions60: inputs.sessions60 || 0,
      price60: inputs.price60 || 0,
      packageRevenue: inputs.packageRevenue || 0,
      materials: inputs.materials || 0,
      travel: inputs.travel || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      sessionsCompleted: inputs.sessionsCompleted || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerSession != null) notes.push(`Profit/session ≈ $${calc.profitPerSession.toFixed(2)}`);
      notes.push("Examples only; not guaranteed. Do not complete graded work.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "canvaFlyerSimpleProjects")) {
    const calc = computeCanvaFlyerProfit({
      canvaFlyerSimpleProjects: inputs.canvaFlyerSimpleProjects || 0,
      simplePrice: inputs.simplePrice || 0,
      standardProjects: inputs.standardProjects || 0,
      standardPrice: inputs.standardPrice || 0,
      detailedProjects: inputs.detailedProjects || 0,
      detailedPrice: inputs.detailedPrice || 0,
      socialPackRevenue: inputs.socialPackRevenue || 0,
      recurringRevenue: inputs.recurringRevenue || 0,
      addOnRevenue: inputs.addOnRevenue || 0,
      softwareAssets: inputs.softwareAssets || 0,
      advertising: inputs.advertising || 0,
      paymentFees: inputs.paymentFees || 0,
      printingProofs: inputs.printingProofs || 0,
      contractors: inputs.contractors || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      projectsCompleted: inputs.projectsCompleted || 0,
    });
    if (calc.grossRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossRevenue.toFixed(2)}.`);
      if (calc.profitPerProject != null) notes.push(`Profit/project ≈ $${calc.profitPerProject.toFixed(2)}`);
      notes.push("Examples only; not guaranteed. Revenue is not profit.");
    }
    return {
      revenue: calc.grossRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "carInteriorQuickJobs")) {
    const calc = computeCarInteriorProfit({
      carInteriorQuickJobs: inputs.carInteriorQuickJobs || 0,
      quickPrice: inputs.quickPrice || 0,
      standardJobs: inputs.standardJobs || 0,
      standardPrice: inputs.standardPrice || 0,
      largerJobs: inputs.largerJobs || 0,
      largerPrice: inputs.largerPrice || 0,
      addOnRevenue: inputs.addOnRevenue || 0,
      recurringRevenue: inputs.recurringRevenue || 0,
      supplies: inputs.supplies || 0,
      equipmentCosts: inputs.equipmentCosts || 0,
      travel: inputs.travel || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      vehiclesCompleted: inputs.vehiclesCompleted || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerVehicle != null) notes.push(`Profit/vehicle ≈ $${calc.profitPerVehicle.toFixed(2)}`);
      notes.push("Examples only; not guaranteed. Light cleanup, not detailing.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "neighborhoodWalks15")) {
    const calc = computeNeighborhoodDogWalkerProfit({
      neighborhoodWalks15: inputs.neighborhoodWalks15 || 0,
      price15: inputs.price15 || 0,
      walks30: inputs.walks30 || 0,
      price30: inputs.price30 || 0,
      walks45: inputs.walks45 || 0,
      price45: inputs.price45 || 0,
      extraDogFees: inputs.extraDogFees || 0,
      addOnRevenue: inputs.addOnRevenue || 0,
      supplies: inputs.supplies || 0,
      travel: inputs.travel || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      insuranceBusiness: inputs.insuranceBusiness || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      walksCompleted: inputs.walksCompleted || 0,
    });
    if (calc.grossRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossRevenue.toFixed(2)}.`);
      if (calc.profitPerWalk != null) notes.push(`Profit/walk ≈ $${calc.profitPerWalk.toFixed(2)}`);
      notes.push("Examples only; not guaranteed. Never walk a dog you cannot control.");
    }
    return {
      revenue: calc.grossRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "greetingCardHandmadeSold")) {
    const calc = computeGreetingCardProfit({
      greetingCardHandmadeSold: inputs.greetingCardHandmadeSold || 0,
      handmadePrice: inputs.handmadePrice || 0,
      personalizedHandmade: inputs.personalizedHandmade || 0,
      personalizedPrice: inputs.personalizedPrice || 0,
      digitalSold: inputs.digitalSold || 0,
      digitalPrice: inputs.digitalPrice || 0,
      customCanvaOrders: inputs.customCanvaOrders || 0,
      customCanvaPrice: inputs.customCanvaPrice || 0,
      paperInkEnvelopes: inputs.paperInkEnvelopes || 0,
      embellishmentsPackaging: inputs.embellishmentsPackaging || 0,
      shipping: inputs.shipping || 0,
      softwareAssets: inputs.softwareAssets || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      cardsCompleted: inputs.cardsCompleted || 0,
    });
    if (calc.grossRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossRevenue.toFixed(2)}.`);
      notes.push("Examples only. Keep physical and digital costs separate.");
    }
    return {
      revenue: calc.grossRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "holidayDecoratingQuickJobs")) {
    const calc = computeHolidayDecoratingProfit({
      holidayDecoratingQuickJobs: inputs.holidayDecoratingQuickJobs || 0,
      quickPrice: inputs.quickPrice || 0,
      standardSessions: inputs.standardSessions || 0,
      standardPrice: inputs.standardPrice || 0,
      largerSessions: inputs.largerSessions || 0,
      largerPrice: inputs.largerPrice || 0,
      hourlyHours: inputs.hourlyHours || 0,
      hourlyRate: inputs.hourlyRate || 0,
      takeDownRevenue: inputs.takeDownRevenue || 0,
      packageRevenue: inputs.packageRevenue || 0,
      addOnRevenue: inputs.addOnRevenue || 0,
      supplies: inputs.supplies || 0,
      travel: inputs.travel || 0,
      parkingTolls: inputs.parkingTolls || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      helperCosts: inputs.helperCosts || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      jobsCompleted: inputs.jobsCompleted || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossServiceRevenue.toFixed(2)}.`);
      notes.push("Examples only. Indoor / light work. Ladders only with adults.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "lightHandymanHours")) {
    const calc = computeLightHandymanProfit({
      lightHandymanHours: inputs.lightHandymanHours || 0,
      hourlyRate: inputs.hourlyRate || 0,
      flatRateRevenue: inputs.flatRateRevenue || 0,
      packageRevenue: inputs.packageRevenue || 0,
      materialsReimbursed: inputs.materialsReimbursed || 0,
      materialsCost: inputs.materialsCost || 0,
      supplies: inputs.supplies || 0,
      fuelTravel: inputs.fuelTravel || 0,
      parkingTolls: inputs.parkingTolls || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      toolWear: inputs.toolWear || 0,
      insuranceBusiness: inputs.insuranceBusiness || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      jobsCompleted: inputs.jobsCompleted || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossServiceRevenue.toFixed(2)}.`);
      notes.push("Examples only. Materials reimbursement is not profit.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "tutoringSessions1on1")) {
    const calc = computeTutoringSkillsProfit({
      tutoringSessions1on1: inputs.tutoringSessions1on1 || 0,
      oneOnOnePrice: inputs.oneOnOnePrice || 0,
      groupParticipants: inputs.groupParticipants || 0,
      groupPrice: inputs.groupPrice || 0,
      packageRevenue: inputs.packageRevenue || 0,
      otherRevenue: inputs.otherRevenue || 0,
      materials: inputs.materials || 0,
      software: inputs.software || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      travelParking: inputs.travelParking || 0,
      otherExpenses: inputs.otherExpenses || 0,
      teachingHours: inputs.teachingHours || 0,
      laborHours: inputs.laborHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerTeachingHour != null) notes.push(`Profit/teaching hour ≈ $${calc.profitPerTeachingHour.toFixed(2)}`);
      notes.push("Examples only. No grade or outcome guarantees.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "vacationPlantQuickVisits")) {
    const calc = computeVacationPlantProfit({
      vacationPlantQuickVisits: inputs.vacationPlantQuickVisits || 0,
      quickPrice: inputs.quickPrice || 0,
      standardVisits: inputs.standardVisits || 0,
      standardPrice: inputs.standardPrice || 0,
      largerVisits: inputs.largerVisits || 0,
      largerPrice: inputs.largerPrice || 0,
      packageRevenue: inputs.packageRevenue || 0,
      addOnRevenue: inputs.addOnRevenue || 0,
      travel: inputs.travel || 0,
      parkingTolls: inputs.parkingTolls || 0,
      supplies: inputs.supplies || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      visitsCompleted: inputs.visitsCompleted || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Gross $${calc.grossServiceRevenue.toFixed(2)}.`);
      notes.push("Examples only. Plants only — never mail or packages.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "bookedNights")) {
    const amt = (lineId: string) =>
      Math.max(0, budget.find((l) => l.id === lineId)?.amount || 0);
    const calc = computeStrCohostProfit({
      availableNights: inputs.availableNights || 0,
      bookedNights: inputs.bookedNights || 0,
      avgNightlyRevenue: inputs.avgNightlyRevenue || 0,
      otherHostRevenue: inputs.otherHostRevenue,
      rent: amt("rent"),
      utilities: amt("utilities"),
      internet: amt("internet"),
      insurance: amt("insurance"),
      cleaningPaidByHost: amt("cleaningPaidByHost"),
      laundry: amt("laundry"),
      platformFees: amt("platformFees"),
      supplies: amt("supplies"),
      maintenance: amt("maintenance"),
      permitAllocation: amt("permitAllocation"),
      software: amt("software"),
      parking: amt("parking"),
      otherExpenses: amt("other"),
      initialSetupInvestment: inputs.initialSetupInvestment,
    });
    if (calc.grossBookingRevenue > 0 || calc.monthlyExpenses > 0) {
      notes.push(
        `Booked nights × ADR + other host revenue = $${calc.grossBookingRevenue.toFixed(2)}. Do not count refundable guest deposits as revenue.`,
      );
      if (calc.occupancyPercent != null) {
        notes.push(`Occupancy ${calc.occupancyPercent.toFixed(1)}% (booked ÷ available).`);
      }
      if (calc.monthsToRecoverSetup != null) {
        notes.push(`Setup recovery ≈ ${calc.monthsToRecoverSetup.toFixed(1)} months at this operating profit.`);
      }
      notes.push("MARKET-DEPENDENT — examples only, not guarantees. Gross booking revenue is not profit.");
    }
    return {
      revenue: calc.grossBookingRevenue,
      expenses: calc.monthlyExpenses,
      net: calc.operatingProfit,
      marginPercent: calc.operatingMarginPercent ?? 0,
      notes,
      metrics: {
        occupancyPercent: calc.occupancyPercent ?? undefined,
        monthsToRecoverSetup: calc.monthsToRecoverSetup ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "starterBuilds")) {
    const calc = computeAiAgentsProfit({
      starterBuilds: inputs.starterBuilds || 0,
      starterPrice: inputs.starterPrice || 0,
      standardBuilds: inputs.standardBuilds || 0,
      standardPrice: inputs.standardPrice || 0,
      advancedBuilds: inputs.advancedBuilds || 0,
      advancedPrice: inputs.advancedPrice || 0,
      monthlyRetainers: inputs.monthlyRetainers || 0,
      retainerPrice: inputs.retainerPrice || 0,
      aiApiCosts: inputs.aiApiCosts || 0,
      automationTools: inputs.automationTools || 0,
      hostingDatabase: inputs.hostingDatabase || 0,
      contractors: inputs.contractors || 0,
      software: inputs.software || 0,
      paymentFees: inputs.paymentFees || 0,
      marketing: inputs.marketing || 0,
      otherExpenses: inputs.otherExpenses || 0,
      buildHours: inputs.buildHours || 0,
      testingHours: inputs.testingHours || 0,
      supportHours: inputs.supportHours || 0,
      salesAdminHours: inputs.salesAdminHours || 0,
    });
    if (calc.monthlyRevenue > 0 || calc.monthlyExpenses > 0) {
      notes.push(
        `Starter $${calc.starterRevenue.toFixed(2)} · Standard $${calc.standardRevenue.toFixed(2)} · Advanced $${calc.advancedRevenue.toFixed(2)} · Retainers $${calc.retainerRevenue.toFixed(2)}`,
      );
      notes.push("Examples only; not guaranteed. Revenue is not profit.");
    }
    return {
      revenue: calc.monthlyRevenue,
      expenses: calc.monthlyExpenses,
      net: calc.monthlyProfit,
      marginPercent: calc.monthlyRevenue > 0 ? (calc.monthlyProfit / calc.monthlyRevenue) * 100 : 0,
      notes,
      metrics: {
        netPerHour: calc.effectiveProfitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "quickPromos")) {
    const calc = computeAiPromoVideoProfit({
      quickPromos: inputs.quickPromos || 0,
      averageQuickPrice: inputs.averageQuickPrice || 0,
      standardPromos: inputs.standardPromos || 0,
      averageStandardPrice: inputs.averageStandardPrice || 0,
      premiumPromos: inputs.premiumPromos || 0,
      averagePremiumPrice: inputs.averagePremiumPrice || 0,
      monthlyPackageRevenue: inputs.monthlyPackageRevenue || 0,
      addOnRevenue: inputs.addOnRevenue || 0,
      aiGenerationCredits: inputs.aiGenerationCredits || 0,
      stockAssets: inputs.stockAssets || 0,
      musicVoice: inputs.musicVoice || 0,
      software: inputs.software || 0,
      paymentFees: inputs.paymentFees || 0,
      marketing: inputs.marketing || 0,
      otherExpenses: inputs.otherExpenses || 0,
      productionHours: inputs.productionHours || 0,
      revisionHours: inputs.revisionHours || 0,
      clientAdminHours: inputs.clientAdminHours || 0,
      marketingHours: inputs.marketingHours || 0,
    });
    if (calc.monthlyRevenue > 0 || calc.monthlyExpenses > 0) {
      notes.push(
        `Quick $${calc.quickRevenue.toFixed(2)} · Standard $${calc.standardRevenue.toFixed(2)} · Premium $${calc.premiumRevenue.toFixed(2)} · Packages $${calc.packageRevenue.toFixed(2)} · Add-ons $${calc.addOnRevenue.toFixed(2)}`,
      );
      notes.push("Examples only; not guaranteed. Revenue is not profit.");
    }
    return {
      revenue: calc.monthlyRevenue,
      expenses: calc.monthlyExpenses,
      net: calc.monthlyProfit,
      marginPercent: calc.monthlyRevenue > 0 ? (calc.monthlyProfit / calc.monthlyRevenue) * 100 : 0,
      notes,
      metrics: {
        netPerHour: calc.effectiveProfitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "snapshotsSold")) {
    const calc = computeAiTimingProfit({
      snapshotsSold: inputs.snapshotsSold || 0,
      averageSnapshotPrice: inputs.averageSnapshotPrice || 0,
      cityPlaybooksSold: inputs.cityPlaybooksSold || 0,
      averageCityPrice: inputs.averageCityPrice || 0,
      customPlaybooksSold: inputs.customPlaybooksSold || 0,
      averageCustomPrice: inputs.averageCustomPrice || 0,
      updatesSubscriptions: inputs.updatesSubscriptions || 0,
      aiSoftware: inputs.aiSoftware || 0,
      dataTools: inputs.dataTools || 0,
      marketing: inputs.marketing || 0,
      paymentFees: inputs.paymentFees || 0,
      otherExpenses: inputs.otherExpenses || 0,
      researchHours: inputs.researchHours || 0,
      customizationHours: inputs.customizationHours || 0,
      marketingAdminHours: inputs.marketingAdminHours || 0,
      grossDrivingRevenue: inputs.grossDrivingRevenue || 0,
      onlineHours: inputs.onlineHours || 0,
      miles: inputs.miles || 0,
      fuelCharging: inputs.fuelCharging || 0,
      tollsParking: inputs.tollsParking || 0,
      estimatedVehicleCosts: inputs.estimatedVehicleCosts || 0,
      otherDrivingCosts: inputs.otherDrivingCosts || 0,
    });
    const revenue = calc.playbookRevenue + Math.max(0, Number(inputs.grossDrivingRevenue) || 0);
    const expenses = calc.playbookExpenses + calc.drivingCosts;
    const net = calc.playbookProfit + calc.drivingProfit;
    if (revenue > 0 || expenses > 0) {
      notes.push(
        `Snapshots $${calc.snapshotRevenue.toFixed(2)} · City $${calc.cityRevenue.toFixed(2)} · Custom $${calc.customRevenue.toFixed(2)} · Updates $${calc.updateRevenue.toFixed(2)}`,
      );
      if (calc.playbookProfitPerHour != null) {
        notes.push(`Playbook profit/hour ≈ $${calc.playbookProfitPerHour.toFixed(2)}`);
      }
      if (calc.profitPerOnlineHour != null) {
        notes.push(`Driving profit/online hour ≈ $${calc.profitPerOnlineHour.toFixed(2)}`);
      }
      if (calc.profitPerMile != null) {
        notes.push(`Driving profit/mile ≈ $${calc.profitPerMile.toFixed(2)}`);
      }
      notes.push(
        "Examples only; not guaranteed. Never invent live surge or earnings. Do not count a tax mileage deduction as cash expense.",
      );
    }
    return {
      revenue,
      expenses,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
      metrics: {
        netPerHour: calc.playbookProfitPerHour ?? calc.profitPerOnlineHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "earringPairs")) {
    const calc = computeBeachShellJewelryProfit({
      earringPairs: inputs.earringPairs || 0,
      earringPrice: inputs.earringPrice || 0,
      braceletsSold: inputs.braceletsSold || 0,
      braceletPrice: inputs.braceletPrice || 0,
      necklacesSold: inputs.necklacesSold || 0,
      necklacePrice: inputs.necklacePrice || 0,
      setsSold: inputs.setsSold || 0,
      setPrice: inputs.setPrice || 0,
      findingsMaterials: inputs.findingsMaterials || 0,
      packaging: inputs.packaging || 0,
      sellingFees: inputs.sellingFees || 0,
      shippingPaidBySeller: inputs.shippingPaidBySeller || 0,
      advertising: inputs.advertising || 0,
      boothFees: inputs.boothFees || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
    });
    if (calc.grossRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(
        `Earrings $${calc.earringRevenue.toFixed(2)} · Bracelets $${calc.braceletRevenue.toFixed(2)} · Necklaces $${calc.necklaceRevenue.toFixed(2)} · Sets $${calc.setRevenue.toFixed(2)}`,
      );
      if (calc.estimatedProfitPerPiece != null) {
        notes.push(`Profit/piece ≈ $${calc.estimatedProfitPerPiece.toFixed(2)}`);
      }
      if (calc.averageSellingPrice != null) {
        notes.push(`Average selling price ≈ $${calc.averageSellingPrice.toFixed(2)}`);
      }
      notes.push("Examples only; not guaranteed. Revenue is not profit. Do not price a piece only because the shell was free.");
    }
    return {
      revenue: calc.grossRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "smallGifts")) {
    const calc = computeGiftWrappingProfit({
      smallGifts: inputs.smallGifts || 0,
      smallGiftPrice: inputs.smallGiftPrice || 0,
      mediumGifts: inputs.mediumGifts || 0,
      mediumGiftPrice: inputs.mediumGiftPrice || 0,
      largeGifts: inputs.largeGifts || 0,
      largeGiftPrice: inputs.largeGiftPrice || 0,
      packagesSold: inputs.packagesSold || 0,
      packagePrice: inputs.packagePrice || 0,
      addOnRevenue: inputs.addOnRevenue || 0,
      pickupDeliveryRevenue: inputs.pickupDeliveryRevenue || 0,
      wrappingPaper: inputs.wrappingPaper || 0,
      ribbonBows: inputs.ribbonBows || 0,
      boxesBagsTissue: inputs.boxesBagsTissue || 0,
      tagsDecorations: inputs.tagsDecorations || 0,
      travel: inputs.travel || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      jobsCompleted: inputs.jobsCompleted || 0,
    });
    if (calc.grossRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(
        `Small $${calc.smallGiftRevenue.toFixed(2)} · Medium $${calc.mediumGiftRevenue.toFixed(2)} · Large $${calc.largeGiftRevenue.toFixed(2)} · Packages $${calc.packageRevenue.toFixed(2)} · Add-ons $${calc.addOnRevenue.toFixed(2)} · Pickup/delivery $${calc.pickupDeliveryRevenue.toFixed(2)}`,
      );
      if (calc.estimatedProfitPerGift != null) {
        notes.push(`Profit/gift ≈ $${calc.estimatedProfitPerGift.toFixed(2)}`);
      }
      if (calc.estimatedProfitPerJob != null) {
        notes.push(`Profit/job ≈ $${calc.estimatedProfitPerJob.toFixed(2)}`);
      }
      if (calc.averageRevenuePerCustomer != null) {
        notes.push(`Avg revenue/customer ≈ $${calc.averageRevenuePerCustomer.toFixed(2)}`);
      }
      if (calc.materialCostPerGift != null) {
        notes.push(`Material cost/gift ≈ $${calc.materialCostPerGift.toFixed(2)}`);
      }
      if (calc.holidayEventProfit != null) {
        notes.push(`Holiday/event package revenue ≈ $${calc.holidayEventProfit.toFixed(2)}`);
      }
      notes.push("Examples only; not guaranteed. Revenue is not profit.");
    }
    return {
      revenue: calc.grossRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "monthlyViews")) {
    const calc = computeAffiliateProfit({
      monthlyViews: inputs.monthlyViews || 0,
      clickRatePercent: inputs.clickRatePercent || 0,
      conversionRatePercent: inputs.conversionRatePercent || 0,
      averageCommission: inputs.averageCommission || 0,
      websiteHosting: inputs.websiteHosting || 0,
      software: inputs.software || 0,
      contentProduction: inputs.contentProduction || 0,
      advertising: inputs.advertising || 0,
      contractors: inputs.contractors || 0,
      otherExpenses: inputs.otherExpenses || 0,
    });
    if (calc.grossCommissions > 0 || calc.expenses > 0) {
      notes.push(
        `${calc.clicks.toFixed(0)} clicks · ${calc.conversions.toFixed(1)} conversions · $${calc.grossCommissions.toFixed(2)} gross commissions`,
      );
      if (calc.earningsPerClick != null) {
        notes.push(`Earnings/click ≈ $${calc.earningsPerClick.toFixed(2)}`);
      }
      if (calc.earningsPerThousandViews != null) {
        notes.push(`Earnings per 1,000 views ≈ $${calc.earningsPerThousandViews.toFixed(2)}`);
      }
      notes.push("Examples only; not guaranteed. A new affiliate may earn $0 while testing. Revenue is not profit.");
    }
    return {
      revenue: calc.grossCommissions,
      expenses: calc.expenses,
      net: calc.netProfit,
      marginPercent: calc.grossCommissions > 0 ? (calc.netProfit / calc.grossCommissions) * 100 : 0,
      notes,
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "dropshipOrders")) {
    const calc = computeDropshippingProfit({
      ordersPerMonth: inputs.dropshipOrders || 0,
      averageSellingPrice: inputs.averageSellingPrice || 0,
      averageProductCost: inputs.averageProductCost || 0,
      averageSupplierShipping: inputs.averageSupplierShipping || 0,
      paymentPlatformFeesPerOrder: inputs.paymentPlatformFeesPerOrder || 0,
      averageAdCostPerOrder: inputs.averageAdCostPerOrder || 0,
      refundChargebackCostPerOrder: inputs.refundChargebackCostPerOrder || 0,
      otherVariableCostPerOrder: inputs.otherVariableCostPerOrder || 0,
      monthlyStoreAppCosts: inputs.monthlyStoreAppCosts || 0,
      otherMonthlyExpenses: inputs.otherMonthlyExpenses || 0,
    });
    if (calc.revenue > 0 || calc.monthlyVariableCosts > 0 || calc.monthlyFixedCosts > 0) {
      notes.push(
        `${inputs.dropshipOrders || 0} orders · variable $${calc.variableCostPerOrder.toFixed(2)}/order · profit/order ${calc.profitPerOrder == null ? "—" : `$${calc.profitPerOrder.toFixed(2)}`}`,
      );
      notes.push("Examples only; not guaranteed. Do not treat sales revenue as profit.");
    }
    return {
      revenue: calc.revenue,
      expenses: calc.monthlyVariableCosts + calc.monthlyFixedCosts,
      net: calc.monthlyProfit,
      marginPercent: calc.profitMargin,
      notes,
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "templateInvites")) {
    const calc = computeBasicInvitationProfit({
      templateInvites: inputs.templateInvites || 0,
      templatePrice: inputs.templatePrice || 0,
      customDesigns: inputs.customDesigns || 0,
      customPrice: inputs.customPrice || 0,
      addOnRevenue: inputs.addOnRevenue || 0,
      rushFees: inputs.rushFees || 0,
      extraRevisionRevenue: inputs.extraRevisionRevenue || 0,
      paidAssets: inputs.paidAssets || 0,
      software: inputs.software || 0,
      paymentProcessing: inputs.paymentProcessing || 0,
      advertising: inputs.advertising || 0,
      testPrinting: inputs.testPrinting || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      projectsCompleted: inputs.projectsCompleted || 0,
    });
    if (calc.grossRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(
        `Templates $${calc.templateRevenue.toFixed(2)} · Custom $${calc.customRevenue.toFixed(2)} · Add-ons $${calc.addOnRevenue.toFixed(2)} · Rush $${calc.rushFees.toFixed(2)} · Extra revisions $${calc.extraRevisionRevenue.toFixed(2)}`,
      );
      if (calc.profitPerProject != null) notes.push(`Profit/project ≈ $${calc.profitPerProject.toFixed(2)}`);
      if (calc.averageProjectPrice != null) notes.push(`Avg project price ≈ $${calc.averageProjectPrice.toFixed(2)}`);
      notes.push("Examples only; not guaranteed. Revenue is not profit.");
    }
    return {
      revenue: calc.grossRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "podUnitsSold")) {
    const calc = computePodProfit({
      podUnitsSold: inputs.podUnitsSold || 0,
      averageSellingPrice: inputs.averageSellingPrice || 0,
      productionCostPerUnit: inputs.productionCostPerUnit || 0,
      shippingPaidBySellerPerUnit: inputs.shippingPaidBySellerPerUnit || 0,
      feesPerUnit: inputs.feesPerUnit || 0,
      advertisingPerUnit: inputs.advertisingPerUnit || 0,
      discounts: inputs.discounts || 0,
      refundsReplacements: inputs.refundsReplacements || 0,
      softwareApps: inputs.softwareApps || 0,
      sampleCosts: inputs.sampleCosts || 0,
      otherOperatingExpenses: inputs.otherOperatingExpenses || 0,
      secondProductUnits: inputs.secondProductUnits || 0,
      secondProductPrice: inputs.secondProductPrice || 0,
      secondProductCostPerUnit: inputs.secondProductCostPerUnit || 0,
    });
    if (calc.grossSales > 0 || calc.totalCosts > 0) {
      notes.push(
        `Product A $${calc.productASales.toFixed(2)} · Product B $${calc.productBSales.toFixed(2)} · Gross sales $${calc.grossSales.toFixed(2)}`,
      );
      if (calc.profitPerUnit != null) notes.push(`Profit/unit ≈ $${calc.profitPerUnit.toFixed(2)}`);
      if (calc.breakEvenUnits != null) notes.push(`Break-even units (product A contribution vs monthly ops) ≈ ${calc.breakEvenUnits}`);
      notes.push("Examples only; not guaranteed. Gross sales are not profit. Check current official costs and fees.");
    }
    return {
      revenue: calc.grossSales,
      expenses: calc.totalCosts,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "dogWalkVisits")) {
    const calc = computePetSittingProfit({
      dogWalkVisits: inputs.dogWalkVisits || 0,
      walkPrice: inputs.walkPrice || 0,
      dropInVisits: inputs.dropInVisits || 0,
      dropInPrice: inputs.dropInPrice || 0,
      overnightNights: inputs.overnightNights || 0,
      overnightPrice: inputs.overnightPrice || 0,
      addOnRevenue: inputs.addOnRevenue || 0,
      mileageTravel: inputs.mileageTravel || 0,
      supplies: inputs.supplies || 0,
      paymentPlatformFees: inputs.paymentPlatformFees || 0,
      insuranceAllocation: inputs.insuranceAllocation || 0,
      advertising: inputs.advertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      laborHours: inputs.laborHours || 0,
      totalVisits: inputs.totalVisits || 0,
      clientsServed: inputs.clientsServed || 0,
    });
    if (calc.grossRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(
        `Walks $${calc.walkRevenue.toFixed(2)} · Drop-ins $${calc.dropInRevenue.toFixed(2)} · Overnight $${calc.overnightRevenue.toFixed(2)} · Add-ons $${calc.addOnRevenue.toFixed(2)}`,
      );
      if (calc.profitPerVisit != null) notes.push(`Profit/visit ≈ $${calc.profitPerVisit.toFixed(2)}`);
      if (calc.averageRevenuePerClient != null) {
        notes.push(`Avg revenue/client ≈ $${calc.averageRevenuePerClient.toFixed(2)}`);
      }
      notes.push("Examples only; not guaranteed. Revenue is not profit.");
    }
    return {
      revenue: calc.grossRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "fbMarketplaceProjects")) {
    const calc = computeFbMarketplaceHelperProfit({
      fbMarketplaceProjects: inputs.fbMarketplaceProjects || 0,
      averageBaseProjectFee: inputs.averageBaseProjectFee || 0,
      listingRefreshIncome: inputs.listingRefreshIncome || 0,
      complexResearchIncome: inputs.complexResearchIncome || 0,
      buyerMessageSupportIncome: inputs.buyerMessageSupportIncome || 0,
      rushTravelAddOnIncome: inputs.rushTravelAddOnIncome || 0,
      otherEarnedServiceIncome: inputs.otherEarnedServiceIncome || 0,
      supplies: inputs.supplies || 0,
      mileageTransportation: inputs.mileageTransportation || 0,
      parking: inputs.parking || 0,
      softwarePhone: inputs.softwarePhone || 0,
      advertisingPrinting: inputs.advertisingPrinting || 0,
      paymentFees: inputs.paymentFees || 0,
      otherExpenses: inputs.otherExpenses || 0,
      clientSessionHours: inputs.clientSessionHours || 0,
      travelHours: inputs.travelHours || 0,
      researchWritingPostingHours: inputs.researchWritingPostingHours || 0,
      messageFollowUpAdminHours: inputs.messageFollowUpAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Base $${calc.baseRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Do not count client merchandise or buyer payments as helper revenue.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "aiPeersOneOnOneSessions")) {
    const calc = computeAiPeersProfit({
      aiPeersOneOnOneSessions: inputs.aiPeersOneOnOneSessions || 0,
      aiPeersOneOnOneRate: inputs.aiPeersOneOnOneRate || 0,
      aiPeersSmallGroupParticipants: inputs.aiPeersSmallGroupParticipants || 0,
      aiPeersSmallGroupPricePerPerson: inputs.aiPeersSmallGroupPricePerPerson || 0,
      aiPeersPrivateGroupSessions: inputs.aiPeersPrivateGroupSessions || 0,
      aiPeersPrivateGroupFee: inputs.aiPeersPrivateGroupFee || 0,
      aiPeersWorkshopSessions: inputs.aiPeersWorkshopSessions || 0,
      aiPeersWorkshopFee: inputs.aiPeersWorkshopFee || 0,
      aiPeersSeriesRevenue: inputs.aiPeersSeriesRevenue || 0,
      aiPeersAddOnRevenue: inputs.aiPeersAddOnRevenue || 0,
      aiPeersVenueCost: inputs.aiPeersVenueCost || 0,
      aiPeersPrintingCost: inputs.aiPeersPrintingCost || 0,
      aiPeersSoftwareSubscriptions: inputs.aiPeersSoftwareSubscriptions || 0,
      aiPeersTravelParking: inputs.aiPeersTravelParking || 0,
      aiPeersPaymentFees: inputs.aiPeersPaymentFees || 0,
      aiPeersAds: inputs.aiPeersAds || 0,
      aiPeersHostPaidRefreshments: inputs.aiPeersHostPaidRefreshments || 0,
      aiPeersOtherExpenses: inputs.aiPeersOtherExpenses || 0,
      aiPeersTeachingHours: inputs.aiPeersTeachingHours || 0,
      aiPeersPrepHours: inputs.aiPeersPrepHours || 0,
      aiPeersTravelHours: inputs.aiPeersTravelHours || 0,
      aiPeersSetupCleanupHours: inputs.aiPeersSetupCleanupHours || 0,
      aiPeersFollowUpAdminHours: inputs.aiPeersFollowUpAdminHours || 0,
    });
    if (calc.grossRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(
        `1:1 $${calc.oneOnOneRevenue.toFixed(2)} · small-group $${calc.smallGroupRevenue.toFixed(2)} · private groups $${calc.privateGroupRevenue.toFixed(2)} · workshops $${calc.workshopRevenue.toFixed(2)} · gross $${calc.grossRevenue.toFixed(2)}.`,
      );
      if (calc.profitPerHour != null) notes.push(`Profit per total hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Revenue is not profit. Never guarantee AI accuracy or income.");
    }
    return {
      revenue: calc.grossRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "storybookDirectPrintedCopiesSold")) {
    const calc = computeBookPublishingKidsProfit({
      storybookDirectPrintedCopiesSold: inputs.storybookDirectPrintedCopiesSold || 0,
      averageDirectSalePrice: inputs.averageDirectSalePrice || 0,
      ebookSales: inputs.ebookSales || 0,
      averageActualEbookRoyaltyPerSale: inputs.averageActualEbookRoyaltyPerSale || 0,
      printOnDemandSales: inputs.printOnDemandSales || 0,
      averageActualPrintRoyaltyPerSale: inputs.averageActualPrintRoyaltyPerSale || 0,
      otherEarnedBookIncome: inputs.otherEarnedBookIncome || 0,
      proofCopies: inputs.proofCopies || 0,
      directSaleInventoryPrinting: inputs.directSaleInventoryPrinting || 0,
      artSupplies: inputs.artSupplies || 0,
      softwareLicensedAssets: inputs.softwareLicensedAssets || 0,
      eventBoothFees: inputs.eventBoothFees || 0,
      packagingShipping: inputs.packagingShipping || 0,
      paymentFees: inputs.paymentFees || 0,
      advertisingPrinting: inputs.advertisingPrinting || 0,
      otherExpenses: inputs.otherExpenses || 0,
      writingRevisionHours: inputs.writingRevisionHours || 0,
      illustrationHours: inputs.illustrationHours || 0,
      layoutProofingHours: inputs.layoutProofingHours || 0,
      publishingMarketingSalesAdminHours: inputs.publishingMarketingSalesAdminHours || 0,
    });
    if (calc.totalEarnedRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(
        `Direct-sale $${calc.directSaleRevenue.toFixed(2)} · eBook royalties $${calc.ebookRoyalties.toFixed(2)} · print royalties $${calc.printRoyalties.toFixed(2)} · earned revenue $${calc.totalEarnedRevenue.toFixed(2)}.`,
      );
      if (calc.profitPerHour != null) notes.push(`Effective profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Free gifts are not revenue. List price is not royalty or profit. Parent-managed.");
    }
    return {
      revenue: calc.totalEarnedRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "porchStandardJobsPerWeek")) {
    const calc = computePorchPackageHelperProfit({
      porchStandardJobsPerWeek: inputs.porchStandardJobsPerWeek || 0,
      averageStandardJobFee: inputs.averageStandardJobFee || 0,
      vacationPackageRevenue: inputs.vacationPackageRevenue || 0,
      weatherRushAddOnRevenue: inputs.weatherRushAddOnRevenue || 0,
      tipsOtherEarnedIncome: inputs.tipsOtherEarnedIncome || 0,
      mileageTransportation: inputs.mileageTransportation || 0,
      parkingTolls: inputs.parkingTolls || 0,
      phoneInternet: inputs.phoneInternet || 0,
      supplies: inputs.supplies || 0,
      advertisingPrinting: inputs.advertisingPrinting || 0,
      paymentFees: inputs.paymentFees || 0,
      insuranceLicensing: inputs.insuranceLicensing || 0,
      otherExpenses: inputs.otherExpenses || 0,
      travelHours: inputs.travelHours || 0,
      serviceHours: inputs.serviceHours || 0,
      waitingHours: inputs.waitingHours || 0,
      adminHours: inputs.adminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Standard $${calc.monthlyStandardRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Package value is not helper revenue.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "travelQuickComparisonsPerWeek")) {
    const calc = computeTravelResearchAssistantProfit({
      travelQuickComparisonsPerWeek: inputs.travelQuickComparisonsPerWeek || 0,
      averageQuickComparisonFee: inputs.averageQuickComparisonFee || 0,
      onePageBriefsPerMonth: inputs.onePageBriefsPerMonth || 0,
      averageOnePageBriefFee: inputs.averageOnePageBriefFee || 0,
      refreshAddOnRevenue: inputs.refreshAddOnRevenue || 0,
      tipsOtherResearchIncome: inputs.tipsOtherResearchIncome || 0,
      internetPhone: inputs.internetPhone || 0,
      softwareStorage: inputs.softwareStorage || 0,
      advertisingPortfolio: inputs.advertisingPortfolio || 0,
      paymentFees: inputs.paymentFees || 0,
      registrationInsurance: inputs.registrationInsurance || 0,
      supplies: inputs.supplies || 0,
      otherExpenses: inputs.otherExpenses || 0,
      intakeHours: inputs.intakeHours || 0,
      researchHours: inputs.researchHours || 0,
      briefHours: inputs.briefHours || 0,
      revisionHours: inputs.revisionHours || 0,
      marketingAdminHours: inputs.marketingAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Quick $${calc.monthlyQuickRevenue.toFixed(2)} · briefs $${calc.monthlyBriefRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Do not count flight/hotel prices as helper revenue.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "transcriptionFlatFeeProjectsPerWeek")) {
    const calc = computeTranscriptionNotesHelperProfit({
      transcriptionFlatFeeProjectsPerWeek: inputs.transcriptionFlatFeeProjectsPerWeek || 0,
      averageFlatFeeProjectPrice: inputs.averageFlatFeeProjectPrice || 0,
      perAudioMinuteProjectsPerMonth: inputs.perAudioMinuteProjectsPerMonth || 0,
      averageAudioMinutesPerPerMinuteProject: inputs.averageAudioMinutesPerPerMinuteProject || 0,
      averageRatePerAudioMinute: inputs.averageRatePerAudioMinute || 0,
      recurringPackageRevenue: inputs.recurringPackageRevenue || 0,
      timestampRushFormattingAddOns: inputs.timestampRushFormattingAddOns || 0,
      tipsOtherEarnedServiceIncome: inputs.tipsOtherEarnedServiceIncome || 0,
      internetPhone: inputs.internetPhone || 0,
      softwareTools: inputs.softwareTools || 0,
      cloudStorage: inputs.cloudStorage || 0,
      equipment: inputs.equipment || 0,
      advertisingPortfolio: inputs.advertisingPortfolio || 0,
      paymentFees: inputs.paymentFees || 0,
      registrationInsurance: inputs.registrationInsurance || 0,
      otherExpenses: inputs.otherExpenses || 0,
      intakeHours: inputs.intakeHours || 0,
      listeningDraftHours: inputs.listeningDraftHours || 0,
      editingQualityHours: inputs.editingQualityHours || 0,
      revisionHours: inputs.revisionHours || 0,
      fileDeliveryHours: inputs.fileDeliveryHours || 0,
      marketingAdminHours: inputs.marketingAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Flat-fee $${calc.monthlyFlatFeeRevenue.toFixed(2)} · per-minute $${calc.perMinuteRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Do not double-count the same project as both flat-fee and per-audio-minute revenue.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "websiteTesterQuickChecksPerWeek")) {
    const calc = computeWebsiteTesterProfit({
      websiteTesterQuickChecksPerWeek: inputs.websiteTesterQuickChecksPerWeek || 0,
      averageQuickCheckFee: inputs.averageQuickCheckFee || 0,
      expandedProjectsPerMonth: inputs.expandedProjectsPerMonth || 0,
      averageExpandedProjectFee: inputs.averageExpandedProjectFee || 0,
      retestRevenuePerMonth: inputs.retestRevenuePerMonth || 0,
      recurringPackageRevenue: inputs.recurringPackageRevenue || 0,
      addOnRushRevenue: inputs.addOnRushRevenue || 0,
      tipsOtherEarnedServiceIncome: inputs.tipsOtherEarnedServiceIncome || 0,
      internetPhone: inputs.internetPhone || 0,
      softwareStorage: inputs.softwareStorage || 0,
      equipment: inputs.equipment || 0,
      advertisingPortfolio: inputs.advertisingPortfolio || 0,
      paymentFees: inputs.paymentFees || 0,
      registrationInsurance: inputs.registrationInsurance || 0,
      otherExpenses: inputs.otherExpenses || 0,
      intakeHours: inputs.intakeHours || 0,
      testingHours: inputs.testingHours || 0,
      screenshotReportHours: inputs.screenshotReportHours || 0,
      retestHours: inputs.retestHours || 0,
      marketingAdminHours: inputs.marketingAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Quick $${calc.monthlyQuickRevenue.toFixed(2)} · expanded $${calc.expandedProjectRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Do not count the client’s website sales as helper revenue.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "newsletterIssuesPerMonth")) {
    const calc = computeCommunityNewsletterProfit({
      newsletterIssuesPerMonth: inputs.newsletterIssuesPerMonth || 0,
      averageFeePerIssue: inputs.averageFeePerIssue || 0,
      templateSetupRevenue: inputs.templateSetupRevenue || 0,
      interviewResearchAddOns: inputs.interviewResearchAddOns || 0,
      emailDistributionRevenue: inputs.emailDistributionRevenue || 0,
      printReadyRevenue: inputs.printReadyRevenue || 0,
      sponsorAdServiceRevenue: inputs.sponsorAdServiceRevenue || 0,
      otherEarnedNewsletterIncome: inputs.otherEarnedNewsletterIncome || 0,
      phoneInternet: inputs.phoneInternet || 0,
      writingDesignEmailSoftware: inputs.writingDesignEmailSoftware || 0,
      domainWebsiteStorage: inputs.domainWebsiteStorage || 0,
      licensedAssets: inputs.licensedAssets || 0,
      unreimbursedPrintingPostage: inputs.unreimbursedPrintingPostage || 0,
      paymentFees: inputs.paymentFees || 0,
      advertisingNetworking: inputs.advertisingNetworking || 0,
      travelParking: inputs.travelParking || 0,
      officeEquipment: inputs.officeEquipment || 0,
      otherExpenses: inputs.otherExpenses || 0,
      contentCollectionHours: inputs.contentCollectionHours || 0,
      researchInterviewHours: inputs.researchInterviewHours || 0,
      writingEditingHours: inputs.writingEditingHours || 0,
      designFormattingHours: inputs.designFormattingHours || 0,
      proofingRevisionHours: inputs.proofingRevisionHours || 0,
      emailDistributionHours: inputs.emailDistributionHours || 0,
      marketingAdminHours: inputs.marketingAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Issue revenue $${calc.monthlyIssueRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Do not count the client’s sponsorships, donations, or ticket sales as creator revenue.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "workshopSessionsPerMonth")) {
    const calc = computeCommunityTeachingProfit({
      workshopSessionsPerMonth: inputs.workshopSessionsPerMonth || 0,
      averageSessionFee: inputs.averageSessionFee || 0,
      perParticipantRevenue: inputs.perParticipantRevenue || 0,
      seriesPrivateGroupRevenue: inputs.seriesPrivateGroupRevenue || 0,
      workbookMaterialsRevenue: inputs.workbookMaterialsRevenue || 0,
      otherEarnedWorkshopIncome: inputs.otherEarnedWorkshopIncome || 0,
      materialsSupplies: inputs.materialsSupplies || 0,
      printing: inputs.printing || 0,
      venuePlatformFees: inputs.venuePlatformFees || 0,
      insurancePermitsChecks: inputs.insurancePermitsChecks || 0,
      travelParking: inputs.travelParking || 0,
      softwareEquipment: inputs.softwareEquipment || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      curriculumPrepHours: inputs.curriculumPrepHours || 0,
      marketingSalesHours: inputs.marketingSalesHours || 0,
      venueCoordinationHours: inputs.venueCoordinationHours || 0,
      setupCleanupHours: inputs.setupCleanupHours || 0,
      teachingHours: inputs.teachingHours || 0,
      travelHours: inputs.travelHours || 0,
      followUpAdminHours: inputs.followUpAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Session revenue $${calc.monthlySessionRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Revenue is not profit.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "reviewResponsesCompletedPerMonth")) {
    const calc = computeReviewResponseAssistantProfit({
      reviewResponsesCompletedPerMonth: inputs.reviewResponsesCompletedPerMonth || 0,
      averageFeePerReviewOrBatch: inputs.averageFeePerReviewOrBatch || 0,
      backlogProjectRevenue: inputs.backlogProjectRevenue || 0,
      tonePlaybookSetupRevenue: inputs.tonePlaybookSetupRevenue || 0,
      monthlyRetainerRevenue: inputs.monthlyRetainerRevenue || 0,
      otherEarnedIncome: inputs.otherEarnedIncome || 0,
      phoneInternet: inputs.phoneInternet || 0,
      softwareStorage: inputs.softwareStorage || 0,
      paymentFees: inputs.paymentFees || 0,
      advertising: inputs.advertising || 0,
      professionalServicesInsurance: inputs.professionalServicesInsurance || 0,
      otherExpenses: inputs.otherExpenses || 0,
      setupOnboardingHours: inputs.setupOnboardingHours || 0,
      reviewAuditHours: inputs.reviewAuditHours || 0,
      draftingHours: inputs.draftingHours || 0,
      approvalRevisionHours: inputs.approvalRevisionHours || 0,
      publishingReportingHours: inputs.publishingReportingHours || 0,
      marketingAdminHours: inputs.marketingAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Review revenue $${calc.baseReviewRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Never post fake reviews or offer incentives for ratings.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "consultingBillableHoursPerWeek")) {
    const calc = computeCareerIndustryConsultingProfit({
      consultingBillableHoursPerWeek: inputs.consultingBillableHoursPerWeek || 0,
      averageHourlyRate: inputs.averageHourlyRate || 0,
      fixedFeeProjectRevenue: inputs.fixedFeeProjectRevenue || 0,
      workshopRevenue: inputs.workshopRevenue || 0,
      retainerRevenue: inputs.retainerRevenue || 0,
      approvedExpenseReimbursements: inputs.approvedExpenseReimbursements || 0,
      otherEarnedConsultingIncome: inputs.otherEarnedConsultingIncome || 0,
      phoneInternet: inputs.phoneInternet || 0,
      schedulingVideoSoftware: inputs.schedulingVideoSoftware || 0,
      insurance: inputs.insurance || 0,
      legalAccountingFees: inputs.legalAccountingFees || 0,
      continuingEducation: inputs.continuingEducation || 0,
      advertisingNetworking: inputs.advertisingNetworking || 0,
      unreimbursedTravel: inputs.unreimbursedTravel || 0,
      paymentFees: inputs.paymentFees || 0,
      officeEquipment: inputs.officeEquipment || 0,
      otherExpenses: inputs.otherExpenses || 0,
      billableDeliveryHours: inputs.billableDeliveryHours || 0,
      preparationResearchHours: inputs.preparationResearchHours || 0,
      proposalSalesHours: inputs.proposalSalesHours || 0,
      writtenDeliverableHours: inputs.writtenDeliverableHours || 0,
      followUpRevisionHours: inputs.followUpRevisionHours || 0,
      travelHours: inputs.travelHours || 0,
      marketingAdminHours: inputs.marketingAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Hourly $${calc.monthlyHourlyRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push(`Utilization ${calc.utilizationPercent.toFixed(2)}%. Do not count a client’s salary increase or business results as consulting revenue.`);
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
        utilizationPercent: calc.utilizationPercent,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "notaryAppointmentsPerMonth")) {
    const calc = computePartTimeNotaryProfit({
      notaryAppointmentsPerMonth: inputs.notaryAppointmentsPerMonth || 0,
      averageLawfulNotarialFeesPerAppointment: inputs.averageLawfulNotarialFeesPerAppointment || 0,
      permittedTravelConvenienceFees: inputs.permittedTravelConvenienceFees || 0,
      contractedSigningServiceRevenue: inputs.contractedSigningServiceRevenue || 0,
      authorizedRemoteElectronicRevenue: inputs.authorizedRemoteElectronicRevenue || 0,
      otherLawfulEarnedIncome: inputs.otherLawfulEarnedIncome || 0,
      commissionRenewalAllocation: inputs.commissionRenewalAllocation || 0,
      bondInsuranceAllocation: inputs.bondInsuranceAllocation || 0,
      sealJournalCertificates: inputs.sealJournalCertificates || 0,
      trainingBackgroundScreening: inputs.trainingBackgroundScreening || 0,
      remotePlatformTechnology: inputs.remotePlatformTechnology || 0,
      printingScanningShipping: inputs.printingScanningShipping || 0,
      mileageParkingTolls: inputs.mileageParkingTolls || 0,
      phoneInternet: inputs.phoneInternet || 0,
      paymentFeesAdvertising: inputs.paymentFeesAdvertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      appointmentHours: inputs.appointmentHours || 0,
      travelWaitingHours: inputs.travelWaitingHours || 0,
      printingPreparationHours: inputs.printingPreparationHours || 0,
      recordsShippingHours: inputs.recordsShippingHours || 0,
      marketingAdminTrainingHours: inputs.marketingAdminTrainingHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Notarial revenue $${calc.monthlyNotarialRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Count only lawful notarial fees plus disclosed travel / contracted signing / authorized remote revenue.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "resumeSmallProjectsCompleted")) {
    const calc = computeResumeLinkedInHelperProfit({
      resumeSmallProjectsCompleted: inputs.resumeSmallProjectsCompleted || 0,
      averageSmallProjectFee: inputs.averageSmallProjectFee || 0,
      resumeRewriteRevenue: inputs.resumeRewriteRevenue || 0,
      resumeLinkedInPackageRevenue: inputs.resumeLinkedInPackageRevenue || 0,
      addOnRevenue: inputs.addOnRevenue || 0,
      otherEarnedIncome: inputs.otherEarnedIncome || 0,
      phoneInternet: inputs.phoneInternet || 0,
      writingPdfStorageSoftware: inputs.writingPdfStorageSoftware || 0,
      paymentFees: inputs.paymentFees || 0,
      advertisingNetworking: inputs.advertisingNetworking || 0,
      trainingProfessionalServices: inputs.trainingProfessionalServices || 0,
      otherExpenses: inputs.otherExpenses || 0,
      salesIntakeHours: inputs.salesIntakeHours || 0,
      clientInterviewHours: inputs.clientInterviewHours || 0,
      researchTargetingHours: inputs.researchTargetingHours || 0,
      writingFormattingHours: inputs.writingFormattingHours || 0,
      revisionsFactCheckHours: inputs.revisionsFactCheckHours || 0,
      deliveryAdminHours: inputs.deliveryAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Small-project revenue $${calc.smallProjectRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Never invent credentials. Do not count a client’s job or salary outcome as helper revenue.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "shortFormClipsCompleted")) {
    const calc = computeShortFormVideoEditorProfit({
      shortFormClipsCompleted: inputs.shortFormClipsCompleted || 0,
      averageFeePerClip: inputs.averageFeePerClip || 0,
      batchRetainerRevenue: inputs.batchRetainerRevenue || 0,
      captionGraphicsAddOnRevenue: inputs.captionGraphicsAddOnRevenue || 0,
      rushExtraVersionRevenue: inputs.rushExtraVersionRevenue || 0,
      otherEarnedIncome: inputs.otherEarnedIncome || 0,
      editingSoftware: inputs.editingSoftware || 0,
      storageTransfer: inputs.storageTransfer || 0,
      licensedMusicStockFonts: inputs.licensedMusicStockFonts || 0,
      equipmentAllocation: inputs.equipmentAllocation || 0,
      phoneInternet: inputs.phoneInternet || 0,
      paymentFeesAdvertising: inputs.paymentFeesAdvertising || 0,
      otherExpenses: inputs.otherExpenses || 0,
      salesIntakeHours: inputs.salesIntakeHours || 0,
      sourceReviewHours: inputs.sourceReviewHours || 0,
      editingHours: inputs.editingHours || 0,
      captionsGraphicsAudioHours: inputs.captionsGraphicsAudioHours || 0,
      revisionsExportsHours: inputs.revisionsExportsHours || 0,
      deliveryAdminHours: inputs.deliveryAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Clip revenue $${calc.baseClipRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Do not count the client’s views, followers, or sales as editor revenue.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "gbpSmallProjectsCompleted")) {
    const calc = computeGoogleBusinessProfileHelperProfit({
      gbpSmallProjectsCompleted: inputs.gbpSmallProjectsCompleted || 0,
      averageSmallProjectFee: inputs.averageSmallProjectFee || 0,
      setupCleanupRevenue: inputs.setupCleanupRevenue || 0,
      monthlyMaintenanceRevenue: inputs.monthlyMaintenanceRevenue || 0,
      photoPostAddOnRevenue: inputs.photoPostAddOnRevenue || 0,
      otherEarnedIncome: inputs.otherEarnedIncome || 0,
      phoneInternet: inputs.phoneInternet || 0,
      softwareStorage: inputs.softwareStorage || 0,
      travelParking: inputs.travelParking || 0,
      equipmentAllocation: inputs.equipmentAllocation || 0,
      paymentFees: inputs.paymentFees || 0,
      advertisingNetworking: inputs.advertisingNetworking || 0,
      insuranceProfessionalServices: inputs.insuranceProfessionalServices || 0,
      otherExpenses: inputs.otherExpenses || 0,
      salesIntakeHours: inputs.salesIntakeHours || 0,
      eligibilityOwnershipResearchHours: inputs.eligibilityOwnershipResearchHours || 0,
      auditPreparationHours: inputs.auditPreparationHours || 0,
      editingContentHours: inputs.editingContentHours || 0,
      approvalRevisionHours: inputs.approvalRevisionHours || 0,
      handoffReportingHours: inputs.handoffReportingHours || 0,
      marketingAdminHours: inputs.marketingAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Small-project revenue $${calc.smallProjectRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Never fake profiles, keyword-stuff names, or promise ranking.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "ugcVideosDelivered")) {
    const calc = computeUgcCreatorProfit({
      ugcVideosDelivered: inputs.ugcVideosDelivered || 0,
      averageProductionFee: inputs.averageProductionFee || 0,
      usageRightsRevenue: inputs.usageRightsRevenue || 0,
      rawFootageAddOnRevenue: inputs.rawFootageAddOnRevenue || 0,
      whitelistingExclusivityRevenue: inputs.whitelistingExclusivityRevenue || 0,
      otherEarnedIncome: inputs.otherEarnedIncome || 0,
      productsPropsNotReimbursed: inputs.productsPropsNotReimbursed || 0,
      equipmentSoftwareAssets: inputs.equipmentSoftwareAssets || 0,
      shippingTravel: inputs.shippingTravel || 0,
      paymentFees: inputs.paymentFees || 0,
      insuranceProfessionalServices: inputs.insuranceProfessionalServices || 0,
      otherExpenses: inputs.otherExpenses || 0,
      salesBriefsHours: inputs.salesBriefsHours || 0,
      conceptScriptHours: inputs.conceptScriptHours || 0,
      filmingHours: inputs.filmingHours || 0,
      editingHours: inputs.editingHours || 0,
      revisionsDeliveryAdminHours: inputs.revisionsDeliveryAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Production revenue $${calc.baseProductionRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Do not count client views, followers, or sales as creator revenue. Never fake testimonials.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "vaStarterTasksCompleted")) {
    const calc = computeVirtualAssistantProfit({
      vaStarterTasksCompleted: inputs.vaStarterTasksCompleted || 0,
      averageStarterTaskFee: inputs.averageStarterTaskFee || 0,
      retainerRevenueCollected: inputs.retainerRevenueCollected || 0,
      specialProjectRevenueCollected: inputs.specialProjectRevenueCollected || 0,
      approvedAddOnRevenue: inputs.approvedAddOnRevenue || 0,
      otherEarnedRevenue: inputs.otherEarnedRevenue || 0,
      softwareSubscriptions: inputs.softwareSubscriptions || 0,
      equipmentInternetAllocation: inputs.equipmentInternetAllocation || 0,
      paymentFees: inputs.paymentFees || 0,
      trainingInsuranceProfessionalServices: inputs.trainingInsuranceProfessionalServices || 0,
      approvedCostsNotReimbursed: inputs.approvedCostsNotReimbursed || 0,
      otherExpenses: inputs.otherExpenses || 0,
      taskWorkHours: inputs.taskWorkHours || 0,
      meetingsMessagesAdminHours: inputs.meetingsMessagesAdminHours || 0,
      marketingSalesHours: inputs.marketingSalesHours || 0,
      revisionReworkHours: inputs.revisionReworkHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Starter-task revenue $${calc.starterTaskRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Do not count unsigned proposals or unpaid invoices. Never ask for passwords in email or chat.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "vrCoverageBlocksCompleted")) {
    const calc = computeVirtualReceptionistProfit({
      vrCoverageBlocksCompleted: inputs.vrCoverageBlocksCompleted || 0,
      averageFeePerBlock: inputs.averageFeePerBlock || 0,
      monthlyRetainerRevenueCollected: inputs.monthlyRetainerRevenueCollected || 0,
      overageAfterHoursRevenue: inputs.overageAfterHoursRevenue || 0,
      setupReportingAddOnRevenue: inputs.setupReportingAddOnRevenue || 0,
      otherEarnedRevenue: inputs.otherEarnedRevenue || 0,
      phoneVoipCrmSoftware: inputs.phoneVoipCrmSoftware || 0,
      equipmentInternetAllocation: inputs.equipmentInternetAllocation || 0,
      paymentFees: inputs.paymentFees || 0,
      trainingInsuranceProfessionalServices: inputs.trainingInsuranceProfessionalServices || 0,
      backupCoverageSubcontractors: inputs.backupCoverageSubcontractors || 0,
      otherExpenses: inputs.otherExpenses || 0,
      reservedCoverageHours: inputs.reservedCoverageHours || 0,
      setupTrainingReportingHours: inputs.setupTrainingReportingHours || 0,
      marketingAdminHours: inputs.marketingAdminHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Coverage-block revenue $${calc.blockRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Count reserved coverage hours, not talk time alone.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "sponsoredCampaignRevenue")) {
    const calc = computeSocialInfluencerProfit({
      sponsoredCampaignRevenue: inputs.sponsoredCampaignRevenue || 0,
      affiliateCommissionsCollected: inputs.affiliateCommissionsCollected || 0,
      platformMonetizationCollected: inputs.platformMonetizationCollected || 0,
      productGrossRevenue: inputs.productGrossRevenue || 0,
      serviceSubscriptionRevenue: inputs.serviceSubscriptionRevenue || 0,
      licensingOtherEarnedIncome: inputs.licensingOtherEarnedIncome || 0,
      productCostFulfillmentRefunds: inputs.productCostFulfillmentRefunds || 0,
      platformPaymentAffiliateReversals: inputs.platformPaymentAffiliateReversals || 0,
      equipmentSoftwareAssets: inputs.equipmentSoftwareAssets || 0,
      contractors: inputs.contractors || 0,
      advertising: inputs.advertising || 0,
      travelPropsSamples: inputs.travelPropsSamples || 0,
      insuranceLegalAccounting: inputs.insuranceLegalAccounting || 0,
      phoneInternetWebsite: inputs.phoneInternetWebsite || 0,
      otherExpenses: inputs.otherExpenses || 0,
      planningResearchHours: inputs.planningResearchHours || 0,
      productionEditingHours: inputs.productionEditingHours || 0,
      publishingCommunityHours: inputs.publishingCommunityHours || 0,
      brandSalesNegotiationHours: inputs.brandSalesNegotiationHours || 0,
      reportingAdminSupportHours: inputs.reportingAdminSupportHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Collected creator revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Followers are not revenue. Disclose material connections.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: { netPerHour: calc.profitPerHour ?? undefined },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "moderatorSmallProjects")) {
    const calc = computeOnlineCommunityModeratorProfit({
      moderatorSmallProjects: inputs.moderatorSmallProjects || 0,
      averageProjectFee: inputs.averageProjectFee || 0,
      recurringHours: inputs.recurringHours || 0,
      averageHourlyRate: inputs.averageHourlyRate || 0,
      liveEventIncome: inputs.liveEventIncome || 0,
      auditSetupIncome: inputs.auditSetupIncome || 0,
      otherApprovedServiceIncome: inputs.otherApprovedServiceIncome || 0,
      internetPhone: inputs.internetPhone || 0,
      softwareSecurity: inputs.softwareSecurity || 0,
      equipment: inputs.equipment || 0,
      advertisingPlatformFees: inputs.advertisingPlatformFees || 0,
      paymentFees: inputs.paymentFees || 0,
      training: inputs.training || 0,
      otherExpenses: inputs.otherExpenses || 0,
      moderationHours: inputs.moderationHours || 0,
      setupAuditHours: inputs.setupAuditHours || 0,
      reportsAdminHours: inputs.reportsAdminHours || 0,
      marketingHours: inputs.marketingHours || 0,
    });
    if (calc.grossServiceRevenue > 0 || calc.totalExpenses > 0) {
      notes.push(`Projects $${calc.projectRevenue.toFixed(2)} · recurring $${calc.recurringRevenue.toFixed(2)} · service revenue $${calc.grossServiceRevenue.toFixed(2)}.`);
      if (calc.profitPerHour != null) notes.push(`Profit/hour ≈ $${calc.profitPerHour.toFixed(2)}`);
      notes.push("Examples only. Do not bill the same scheduled hour twice.");
    }
    return {
      revenue: calc.grossServiceRevenue,
      expenses: calc.totalExpenses,
      net: calc.estimatedProfit,
      marginPercent: calc.profitMarginPercent,
      notes,
      metrics: {
        netPerHour: calc.profitPerHour ?? undefined,
      },
    };
  }

  if (mode === "savings") {
    const calc = computeJuniorSavingsGoal({
      juniorSavingsGoalCost: inputs.juniorSavingsGoalCost || 0,
      amountAlreadySaved: inputs.amountAlreadySaved || 0,
      weeksRemaining: inputs.weeksRemaining || 0,
      averageEarningsPerTask: inputs.averageEarningsPerTask || 0,
      tasksPerWeek: inputs.tasksPerWeek || 0,
      savingsPortionPercent: inputs.savingsPortionPercent || 0,
    });
    if (calc.weeklySavingsGoal > 0 || calc.estimatedWeeklySavings > 0 || calc.stillNeeded > 0) {
      notes.push(
        `Still needed $${calc.stillNeeded.toFixed(2)} · weekly goal $${calc.weeklySavingsGoal.toFixed(2)} · estimated weekly savings $${calc.estimatedWeeklySavings.toFixed(2)}`,
      );
      if (calc.statusLabel) notes.push(calc.statusLabel);
    }
    notes.push("Learning math only — not a promise. Never overwork or borrow to catch up.");
    return {
      revenue: calc.stillNeeded,
      expenses: 0,
      net: calc.weeklySavingsGoal,
      marginPercent: calc.percentComplete,
      notes,
      metrics: {
        stillNeeded: calc.stillNeeded,
        weeklySavingsGoal: calc.weeklySavingsGoal,
        estimatedWeeklyEarnings: calc.estimatedWeeklyEarnings,
        estimatedWeeklySavings: calc.estimatedWeeklySavings,
        percentComplete: calc.percentComplete,
        savingsOnTrack: calc.onTrack,
        savingsStatusLabel: calc.statusLabel,
      },
    };
  }

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
    if (Object.prototype.hasOwnProperty.call(inputs, "ebookUnits")) {
      const ebookRev =
        Math.max(0, inputs.ebookUnits || 0) * Math.max(0, inputs.ebookRevPerUnit || 0);
      const paperRev =
        Math.max(0, inputs.paperbackUnits || 0) * Math.max(0, inputs.paperbackRevPerUnit || 0);
      const hardRev =
        Math.max(0, inputs.hardcoverUnits || 0) * Math.max(0, inputs.hardcoverRevPerUnit || 0);
      const audioRev =
        Math.max(0, inputs.audiobookUnits || 0) * Math.max(0, inputs.audiobookRevPerUnit || 0);
      const direct = Math.max(0, inputs.directOtherRevenue || 0);
      const revenue = ebookRev + paperRev + hardRev + audioRev + direct;
      const net = revenue - expenses;
      const contribution = Math.max(0, inputs.avgProfitContributionPerSale || 0);
      const unrecovered = Math.max(0, inputs.unrecoveredProductionCost || 0);
      const breakEvenUnits = contribution > 0 ? unrecovered / contribution : 0;
      if (revenue > 0 || expenses > 0) {
        notes.push(
          "Revenue = actual compensation received (not list price). Profit = revenue remaining after expenses.",
        );
      }
      if (contribution > 0 && unrecovered > 0) {
        notes.push(
          `Break-even units (unrecovered production ÷ avg contribution/sale): ${breakEvenUnits.toFixed(1)}`,
        );
      }
      return {
        revenue,
        expenses,
        net,
        marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
        notes,
        metrics: {
          breakEvenUnits: contribution > 0 ? breakEvenUnits : undefined,
        },
      };
    }
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
  if (Object.prototype.hasOwnProperty.call(inputs, "conservativeArv")) {
    const holdingTotal =
      Math.max(0, inputs.monthlyHoldingCosts || 0) * Math.max(0, inputs.expectedHoldingMonths || 0);
    const nonPurchase =
      Math.max(0, inputs.buyerPremium || 0) +
      Math.max(0, inputs.closingTitleLegal || 0) +
      Math.max(0, inputs.repairs || 0) +
      Math.max(0, inputs.repairContingency || 0) +
      Math.max(0, inputs.financingCosts || 0) +
      holdingTotal +
      Math.max(0, inputs.sellingCosts || 0) +
      Math.max(0, inputs.taxesInsuranceHoa || 0) +
      Math.max(0, inputs.otherCosts || 0);
    const purchase = Math.max(0, inputs.purchasePrice || 0);
    const arv = Math.max(0, inputs.conservativeArv || 0);
    const desired = Math.max(0, inputs.desiredProfit || 0);
    const totalProjectCost = purchase + nonPurchase;
    const estimatedProfit = arv - totalProjectCost;
    const maxPurchase = arv - nonPurchase - desired;
    const rent = Math.max(0, inputs.monthlyRent || 0);
    const rentalOperating =
      Math.max(0, inputs.vacancyAllowance || 0) +
      Math.max(0, inputs.rentalTaxes || 0) +
      Math.max(0, inputs.rentalInsurance || 0) +
      Math.max(0, inputs.maintenance || 0) +
      Math.max(0, inputs.capexReserve || 0) +
      Math.max(0, inputs.management || 0) +
      Math.max(0, inputs.hoaOwnerUtilities || 0) +
      Math.max(0, inputs.otherOperating || 0);
    const monthlyCashFlow = rent - rentalOperating - Math.max(0, inputs.debtService || 0);
    const cashInvested =
      Math.max(0, inputs.rentalPurchase || 0) + Math.max(0, inputs.rehabClosingInitial || 0);
    const annualCashFlow = monthlyCashFlow * 12;
    if (arv > 0 || purchase > 0 || rent > 0) {
      notes.push(
        `Flip profit $${estimatedProfit.toFixed(2)} · Max bid/offer $${maxPurchase.toFixed(2)} · Holding $${holdingTotal.toFixed(2)}`,
      );
      notes.push(
        `Rental cash flow $${monthlyCashFlow.toFixed(2)}/mo · Annual $${annualCashFlow.toFixed(2)}${
          cashInvested > 0
            ? ` · Cash-on-cash ${((annualCashFlow / cashInvested) * 100).toFixed(1)}%`
            : ""
        }`,
      );
      notes.push(
        "Estimates only — not promises of return, appreciation, rent increases, resale price, or tax outcomes.",
      );
    }
    return {
      revenue: arv,
      expenses: totalProjectCost,
      net: estimatedProfit,
      marginPercent: arv > 0 ? (estimatedProfit / arv) * 100 : 0,
      notes,
      metrics: {
        maxBuyPrice: maxPurchase,
        monthlyCashFlow,
        annualCashFlow,
        cashInvested,
        cashOnCashPercent: cashInvested > 0 ? (annualCashFlow / cashInvested) * 100 : 0,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "paidProjects")) {
    const paid = Math.max(0, inputs.paidProjects || 0);
    const price = Math.max(0, inputs.avgProjectPrice || 0);
    const supply = Math.max(0, inputs.supplyToolCost || 0);
    const other = Math.max(0, inputs.otherApprovedCost || 0);
    const savePercent = Math.max(0, inputs.savePercent || 0);
    const enjoyPercent = Math.max(0, inputs.enjoyPercent || 0);
    const growPercent = Math.max(0, inputs.growPercent || 0);
    const revenue = paid * price;
    const projectCosts = supply + other;
    const net = revenue - projectCosts;
    const percentTotal = savePercent + enjoyPercent + growPercent;
    if (revenue > 0 || projectCosts > 0) {
      notes.push(`Gross project money $${revenue.toFixed(2)} · Costs $${projectCosts.toFixed(2)}`);
      notes.push("Any sale/payment is parent-managed. Learning first.");
    }
    if (percentTotal > 0 && percentTotal !== 100) {
      notes.push(`Save/Enjoy/Grow currently total ${percentTotal}% — they MUST equal 100% before the split.`);
    } else if (percentTotal === 100 && net > 0) {
      notes.push(
        `Split remaining: Save $${(net * (savePercent / 100)).toFixed(2)} · Enjoy $${(net * (enjoyPercent / 100)).toFixed(2)} · Grow $${(net * (growPercent / 100)).toFixed(2)}`,
      );
    }
    return {
      revenue,
      expenses: projectCosts,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
      metrics: {
        saveAmount: percentTotal === 100 && net > 0 ? net * (savePercent / 100) : 0,
        enjoyAmount: percentTotal === 100 && net > 0 ? net * (enjoyPercent / 100) : 0,
        growAmount: percentTotal === 100 && net > 0 ? net * (growPercent / 100) : 0,
        percentagesValid: percentTotal === 100 || percentTotal === 0,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "standardCleansPerWeek")) {
    const amt = (lineId: string) =>
      Math.max(0, budget.find((l) => l.id === lineId)?.amount || 0);
    const calc = computeCleaningServiceProfit({
      standardCleansPerWeek: inputs.standardCleansPerWeek || 0,
      averageStandardPrice: inputs.averageStandardPrice || 0,
      specialtyJobsPerMonth: inputs.specialtyJobsPerMonth,
      averageSpecialtyPrice: inputs.averageSpecialtyPrice,
      monthlyAddOnRevenue: inputs.monthlyAddOnRevenue,
      tipsOtherRevenue: inputs.tipsOtherRevenue,
      supplies: amt("supplies"),
      fuelTravel: amt("fuelTravel"),
      parking: amt("parking"),
      laundry: amt("laundry"),
      paymentFees: amt("paymentFees"),
      advertising: amt("advertising"),
      insuranceLicensing: amt("insuranceLicensing"),
      otherExpenses: amt("other"),
      cleaningHours: inputs.cleaningHours,
      travelAdminHours: inputs.travelAdminHours,
    });
    if (calc.monthlyRevenue > 0 || calc.monthlyExpenses > 0) {
      notes.push(
        `Weekly standard $${calc.weeklyStandardRevenue.toFixed(2)} × 4.33 = $${calc.monthlyStandardRevenue.toFixed(2)} · Specialty $${calc.specialtyRevenue.toFixed(2)}`,
      );
      notes.push("Examples only; not guaranteed. Gross revenue is not profit.");
    }
    return {
      revenue: calc.monthlyRevenue,
      expenses: calc.monthlyExpenses,
      net: calc.monthlyProfit,
      marginPercent: calc.monthlyRevenue > 0 ? (calc.monthlyProfit / calc.monthlyRevenue) * 100 : 0,
      notes,
      metrics: {
        netPerHour: calc.effectiveProfitPerHour ?? undefined,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "eventAttendees")) {
    const calc = computeStartBookClubProfit({
      payingMembers: inputs.payingMembers || 0,
      monthlyDues: inputs.monthlyDues || 0,
      eventAttendees: inputs.eventAttendees || 0,
      eventPrice: inputs.eventPrice || 0,
      kitsSold: inputs.kitsSold || 0,
      kitPrice: inputs.kitPrice || 0,
      workshopRevenue: inputs.workshopRevenue || 0,
      otherRevenue: inputs.otherRevenue || 0,
      venue: inputs.venue || 0,
      refreshments: inputs.refreshments || 0,
      kitMaterials: inputs.kitMaterials || 0,
      authorSpeaker: inputs.authorSpeaker || 0,
      printing: inputs.printing || 0,
      marketing: inputs.marketing || 0,
      paymentFees: inputs.paymentFees || 0,
      otherExpenses: inputs.otherExpenses || 0,
    });
    if (calc.monthlyRevenue > 0 || calc.monthlyExpenses > 0) {
      notes.push(
        `Dues $${calc.duesRevenue.toFixed(2)} · Events $${calc.eventRevenue.toFixed(2)} · Kits $${calc.kitRevenue.toFixed(2)} · Workshops $${calc.workshopRevenue.toFixed(2)}`,
      );
      notes.push(
        "Net is money remaining after expenses — not automatically personal profit. Track organizer compensation separately where legitimate.",
      );
    }
    return {
      revenue: calc.monthlyRevenue,
      expenses: calc.monthlyExpenses,
      net: calc.monthlyNet,
      marginPercent: calc.monthlyRevenue > 0 ? (calc.monthlyNet / calc.monthlyRevenue) * 100 : 0,
      notes,
    };
  }

  if (Object.prototype.hasOwnProperty.call(inputs, "payingMembers")) {
    const duesRevenue =
      Math.max(0, inputs.payingMembers || 0) * Math.max(0, inputs.monthlyDues || 0);
    const workshopRevenue =
      Math.max(0, inputs.workshopAttendees || 0) * Math.max(0, inputs.workshopPrice || 0);
    const kitRevenue = Math.max(0, inputs.kitsSold || 0) * Math.max(0, inputs.kitPrice || 0);
    const other = Math.max(0, inputs.otherRevenue || 0);
    const revenue = duesRevenue + workshopRevenue + kitRevenue + other;
    const net = revenue - expenses;
    if (revenue > 0 || expenses > 0) {
      notes.push(
        `Dues $${duesRevenue.toFixed(2)} · Workshops $${workshopRevenue.toFixed(2)} · Kits $${kitRevenue.toFixed(2)} · Other $${other.toFixed(2)}`,
      );
      notes.push(
        "Net is money remaining after expenses — not automatically personal profit. Track organizer compensation separately where legitimate.",
      );
    }
    return {
      revenue,
      expenses,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
    };
  }
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
  if (
    Object.prototype.hasOwnProperty.call(inputs, "monthlyRetainerRevenue") &&
    Object.prototype.hasOwnProperty.call(inputs, "extraEventPay") &&
    Object.prototype.hasOwnProperty.call(inputs, "hoursPerShoot")
  ) {
    const monthlyRetainer = Math.max(0, inputs.monthlyRetainerRevenue || 0);
    const weeklyRetainer = monthlyRetainer / 4.33;
    const revenue = sale * jobs + weeklyRetainer + extraEventPay;
    const net = revenue - expenses;
    const projectHours = hoursPerShoot * jobs;
    const recurringHours = Math.max(0, inputs.nonBillableHoursPerWeek || 0);
    const totalHours = projectHours + recurringHours;
    if (jobs > 0 || sale > 0 || monthlyRetainer > 0 || extraEventPay > 0) {
      notes.push(
        `${jobs} projects/week × $${sale} + $${weeklyRetainer.toFixed(2)} weekly recurring + $${extraEventPay} add-ons`,
      );
    }
    if (totalHours > 0) {
      notes.push(
        `Estimated working hours per week: ${totalHours} (projects ${projectHours} + recurring ${recurringHours})`,
      );
    }
    if (jobs > 0 || sale > 0 || monthlyRetainer > 0 || extraEventPay > 0 || expenses > 0) {
      notes.push(`Approx. monthly profit (weekly × 4.33): $${(net * 4.33).toFixed(2)}`);
    }
    return {
      revenue,
      expenses,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
      metrics: {
        netPerHour: totalHours > 0 ? net / totalHours : undefined,
      },
    };
  }
  if (Object.prototype.hasOwnProperty.call(inputs, "monthlyRetainerRevenue")) {
    const monthlyRetainer = Math.max(0, inputs.monthlyRetainerRevenue || 0);
    const weeklyRetainer = monthlyRetainer / 4.33;
    const revenue = sale * jobs + weeklyRetainer;
    const net = revenue - expenses;
    const nonBillable = Math.max(0, inputs.nonBillableHoursPerWeek || 0);
    const totalHours = jobs + nonBillable;
    if (jobs > 0 || sale > 0 || monthlyRetainer > 0) {
      notes.push(
        `${jobs} billable hrs/week × $${sale}/hr + $${weeklyRetainer.toFixed(2)} weekly retainer equivalent`,
      );
    }
    if (totalHours > 0) {
      notes.push(
        `Estimated working hours per week: ${totalHours} (billable ${jobs} + non-billable ${nonBillable})`,
      );
    }
    if (jobs > 0 || sale > 0 || monthlyRetainer > 0 || expenses > 0) {
      notes.push(`Approx. monthly profit (weekly × 4.33): $${(net * 4.33).toFixed(2)}`);
    }
    return {
      revenue,
      expenses,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
      metrics: {
        netPerHour: totalHours > 0 ? net / totalHours : undefined,
      },
    };
  }
  if (Object.prototype.hasOwnProperty.call(inputs, "testingHoursPerProject")) {
    const testingHours = Math.max(0, inputs.testingHoursPerProject || 0);
    const revenue = sale + extraEventPay;
    const net = revenue - expenses;
    const totalHours = hoursPerShoot + editingHours + testingHours;
    if (sale > 0 || extraEventPay > 0) {
      notes.push(`Project fee $${sale} + $${extraEventPay} add-ons`);
    }
    if (totalHours > 0) {
      notes.push(
        `Estimated project hours: ${totalHours} (planning ${hoursPerShoot} + build ${editingHours} + testing/revision ${testingHours})`,
      );
    }
    if (sale > 0 || extraEventPay > 0 || expenses > 0) {
      notes.push(
        "Revenue = money received. Profit = money remaining after expenses. Prototype = early playable demonstration, not automatically a finished commercial game.",
      );
    }
    return {
      revenue,
      expenses,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
      metrics: {
        netPerHour: totalHours > 0 ? net / totalHours : undefined,
      },
    };
  }
  if (
    Object.prototype.hasOwnProperty.call(inputs, "extraEventPay") &&
    Object.prototype.hasOwnProperty.call(inputs, "hoursPerShoot") &&
    Object.prototype.hasOwnProperty.call(inputs, "editingHoursPerShoot")
  ) {
    const revenue = sale * jobs + extraEventPay;
    const net = revenue - expenses;
    const totalHours = (hoursPerShoot + editingHours) * jobs;
    if (jobs > 0 || sale > 0 || extraEventPay > 0) {
      notes.push(
        `${jobs} sessions/week × $${sale} + $${extraEventPay} package/follow-up`,
      );
    }
    if (totalHours > 0) {
      notes.push(
        `Estimated working hours per week: ${totalHours} (session ${hoursPerShoot} + travel/admin ${editingHours} per session)`,
      );
    }
    if (jobs > 0 || sale > 0 || extraEventPay > 0 || expenses > 0) {
      notes.push(`Approx. monthly profit (weekly × 4.33): $${(net * 4.33).toFixed(2)}`);
      notes.push(
        "Revenue = money received from clients. Profit = money remaining after business expenses.",
      );
    }
    return {
      revenue,
      expenses,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
      metrics: {
        netPerHour: totalHours > 0 ? net / totalHours : undefined,
      },
    };
  }
  if (
    Object.prototype.hasOwnProperty.call(inputs, "extraEventPay") &&
    Object.prototype.hasOwnProperty.call(inputs, "hoursWorkedPerWeek") &&
    Object.prototype.hasOwnProperty.call(inputs, "hoursPerShoot") &&
    !Object.prototype.hasOwnProperty.call(inputs, "editingHoursPerShoot")
  ) {
    const revenue = sale * jobs + extraEventPay;
    const net = revenue - expenses;
    const totalHours = hoursWorkedPerWeek + hoursPerShoot;
    if (jobs > 0 || sale > 0 || extraEventPay > 0) {
      notes.push(`${jobs} yards/week × $${sale} + $${extraEventPay} add-ons`);
    }
    if (totalHours > 0) {
      notes.push(
        `Estimated working hours per week: ${totalHours} (job ${hoursWorkedPerWeek} + travel/admin ${hoursPerShoot})`,
      );
    }
    if (jobs > 0 || sale > 0 || extraEventPay > 0 || expenses > 0) {
      notes.push(`Approx. monthly profit (weekly × 4.33): $${(net * 4.33).toFixed(2)}`);
      notes.push("Revenue = money received. Profit = money remaining after business expenses.");
    }
    return {
      revenue,
      expenses,
      net,
      marginPercent: revenue > 0 ? (net / revenue) * 100 : 0,
      notes,
      metrics: {
        netPerHour: totalHours > 0 ? net / totalHours : undefined,
      },
    };
  }
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
          ? hasHoursWorkedPerWeek ||
            Object.prototype.hasOwnProperty.call(inputs, "hoursPerShoot")
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
