// src/fetchers/webAdScraper.ts
import type { MedicareAd } from "../types/MedicareAd";

/**
 * Curated Medicare competitor landing pages — used instead of scraping Google,
 * which blocks automated traffic and surfaces CAPTCHA pages to users.
 */
const MEDICARE_COMPETITOR_SEEDS: Omit<MedicareAd, "adUrl">[] = [
  {
    companyName: "Medicare.gov",
    websiteUrl: "https://www.medicare.gov/",
    socialMedia: { facebook: "", tiktok: "", other: [] },
    primaryText: "Official Medicare website — compare coverage options and enrollment guidance.",
    description: "Centers for Medicare & Medicaid Services public education.",
    headline: "Welcome to Medicare.gov",
    hooks: ["Official Medicare resources"],
    painPoints: [],
    keywords: ["medicare.gov", "cms"],
    hashtags: [],
    reviewSnippets: ["Government source for plan compare and eligibility basics."],
    reviews: [
      {
        text: "Government source for plan compare and eligibility basics.",
        url: "https://www.medicare.gov/about-us",
        sourceLabel: "Medicare.gov — About",
      },
    ],
  },
  {
    companyName: "eHealth Medicare",
    websiteUrl: "https://www.ehealthmedicare.com/",
    socialMedia: { facebook: "", tiktok: "", other: [] },
    primaryText:
      "Compare Medicare Advantage and Part D plans in your area. We do not offer every plan available in your area.",
    description: "Licensed broker comparison flow — third-party marketing organization.",
    headline: "Find Medicare plans near you",
    hooks: ["Free plan comparison", "Turning 65 enrollment window"],
    painPoints: ["Too many plan choices"],
    keywords: ["medicare advantage", "part d"],
    hashtags: [],
    reviewSnippets: ["Shoppers want side-by-side plan comparisons before calling."],
    reviews: [
      {
        text: "Shoppers want side-by-side plan comparisons before calling.",
        url: "https://www.trustpilot.com/review/www.ehealthinsurance.com",
        sourceLabel: "Trustpilot — eHealth",
      },
    ],
  },
  {
    companyName: "Humana Medicare",
    websiteUrl: "https://www.humana.com/medicare",
    socialMedia: { facebook: "", tiktok: "", other: [] },
    primaryText: "Explore Humana Medicare Advantage plans with extra benefits.",
    description: "Carrier-branded enrollment marketing.",
    headline: "Medicare plans with extra benefits",
    hooks: ["$0 premium plans", "Dental and vision included"],
    painPoints: ["High out-of-pocket costs"],
    keywords: ["medicare advantage", "humana"],
    hashtags: [],
    reviewSnippets: ["Members compare supplemental benefits like dental and fitness."],
    reviews: [
      {
        text: "Members compare supplemental benefits like dental and fitness.",
        url: "https://www.trustpilot.com/review/www.humana.com",
        sourceLabel: "Trustpilot — Humana",
      },
    ],
  },
  {
    companyName: "UnitedHealthcare Medicare",
    websiteUrl: "https://www.uhc.com/medicare",
    socialMedia: { facebook: "", tiktok: "", other: [] },
    primaryText: "See UnitedHealthcare Medicare plans available in your county.",
    description: "National carrier Medicare hub.",
    headline: "Medicare plans from UnitedHealthcare",
    hooks: ["Doctor and drug coverage", "Trusted national brand"],
    painPoints: ["Losing doctors or drugs"],
    keywords: ["uhc", "medicare advantage"],
    hashtags: [],
    reviewSnippets: ["County-level plan availability is a common research step."],
    reviews: [
      {
        text: "County-level plan availability is a common research step.",
        url: "https://www.trustpilot.com/review/www.uhc.com",
        sourceLabel: "Trustpilot — UHC",
      },
    ],
  },
  {
    companyName: "AARP Medicare Plans",
    websiteUrl: "https://www.aarp.org/medicare/",
    socialMedia: { facebook: "", tiktok: "", other: [] },
    primaryText: "AARP-branded Medicare educational resources and plan pathways.",
    description: "Trusted senior brand with educational funnels.",
    headline: "Medicare guidance from AARP",
    hooks: ["Turning 65 soon?", "Trusted by seniors"],
    painPoints: ["Confusion / overwhelm"],
    keywords: ["aarp", "turning 65"],
    hashtags: [],
    reviewSnippets: ["Brand trust is a primary hook for first-time enrollees."],
    reviews: [
      {
        text: "Brand trust is a primary hook for first-time enrollees.",
        url: "https://www.aarp.org/medicare/medicare-education/",
        sourceLabel: "AARP — Medicare education",
      },
    ],
  },
  {
    companyName: "GoHealth",
    websiteUrl: "https://www.gohealth.com/medicare/",
    socialMedia: { facebook: "", tiktok: "", other: [] },
    primaryText:
      "Licensed agents help compare Medicare plans at no cost to you. Speak with a licensed insurance agent today.",
    description: "Lead-gen broker with phone-first CTA patterns.",
    headline: "Talk to a licensed Medicare agent",
    hooks: ["Free consultation", "Licensed agent support"],
    painPoints: ["Too many plan choices"],
    keywords: ["medicare broker", "agent"],
    hashtags: [],
    reviewSnippets: ["Phone CTA after educational comparison is a common funnel."],
    reviews: [
      {
        text: "Phone CTA after educational comparison is a common funnel.",
        url: "https://www.trustpilot.com/review/www.gohealth.com",
        sourceLabel: "Trustpilot — GoHealth",
      },
    ],
  },
];

/**
 * Returns curated competitor landing pages for research.
 * We intentionally avoid scraping Google — it flags server IPs and returns
 * CAPTCHA URLs that break when opened in a normal browser.
 */
export async function fetchWebAds(limit: number): Promise<MedicareAd[]> {
  if (limit <= 0) return [];

  return MEDICARE_COMPETITOR_SEEDS.slice(0, limit).map((seed) => ({
    ...seed,
    adUrl: seed.websiteUrl,
  }));
}
