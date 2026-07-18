/** Shared Medicare / TPMO disclaimer copy for web and email surfaces. */
import { SITE_BRAND_NAME, SITE_BRAND_THE, formatSiteCopyright } from "@/lib/site-brand";

export { SITE_BRAND_NAME, SITE_BRAND_THE, formatSiteCopyright };

/** Canonical legal name for the licensed partner agency (proper capitalization). */
export const CMS_HEALTH_WEALTH_INSURANCE = "CMS Health & Wealth Insurance";

/** TPMO referral disclosure — licensed agencies users may be referred to. */
export const AGENCY_REFERRAL_NOTICE =
  `${SITE_BRAND_THE} may refer to licensed insurance agencies that include ${CMS_HEALTH_WEALTH_INSURANCE} and other participating agencies.`;

export const ASSISTANCE_AGENCY_SHARING_NOTICE =
  `By requesting assistance, you agree that your information will be shared with ${CMS_HEALTH_WEALTH_INSURANCE} so they can contact you regarding your request.`;

/** CMS Multi-Plan Disclaimer (MPD) — educational tone; avoids "offer" language that implies plan sales. */
export const MPD_DISCLAIMER =
  "We may not represent every plan available in your area. Any information we provide is for educational purposes only and is not a complete listing of plans. Please contact Medicare.gov or 1-800-MEDICARE to get information on all of your options.";

export const TPMO_PLATFORM_DISCLAIMER =
  `${SITE_BRAND_THE} is an independent educational platform and Third-Party Marketing Organization (TPMO). We are not affiliated with or endorsed by Medicare, CMS, or any federal government agency. We may not represent every plan available in your area. Information is provided for educational purposes only. ${AGENCY_REFERRAL_NOTICE}`;

/** Short government affiliation notice — required on About and marketing surfaces. */
export const GOVERNMENT_MEDICARE_AFFILIATION_DISCLAIMER =
  "Not affiliated with or endorsed by the government or the federal Medicare program.";

/** Shown near benchmark outputs — not a carrier plan catalog. */
export const BENCHMARK_SCOPE_NOTE =
  "Educational benchmark results only — not a carrier plan catalog in your area.";

/** Estimates disclaimer without plan-name or plan-list language. */
export const BENCHMARK_ESTIMATES_DISCLAIMER =
  "Benchmark estimates and benefit illustrations are based on publicly available CMS data and federal guidelines and may differ from actual carrier offerings in your area.";

export const MEDICARE_BENCHMARK_NOTICE =
  `${SITE_BRAND_THE} provides educational Medicare benchmark estimates for learning purposes. It does not present a carrier plan catalog in your area. For official plan options, contact Medicare.gov or 1-800-MEDICARE (1-800-633-4227).`;

export const BENCHMARK_TOOL_DISCLAIMER =
  `${SITE_BRAND_THE} is an educational benchmark tool only. We do not sell insurance, act as a licensed agent, or provide personalized legal, tax, or medical advice. ${BENCHMARK_ESTIMATES_DISCLAIMER} Always verify details with a licensed insurance agent or by visiting Medicare.gov before enrolling. We are not affiliated with the U.S. government or the Medicare program.`;

export const MEDICARE_DISCLAIMER_SECTIONS = [
  {
    label: "Government affiliation",
    body: GOVERNMENT_MEDICARE_AFFILIATION_DISCLAIMER,
  },
  {
    label: "TPMO",
    body: TPMO_PLATFORM_DISCLAIMER,
  },
  {
    label: "De-identification",
    body: `${SITE_BRAND_THE} uses de-identified Medicare plan comparisons for educational comparison. Our tools do not collect or store Social Security numbers, Medicare Beneficiary Identifiers (MBI), full dates of birth, or other protected health information.`,
  },
  {
    label: "Medicare notice",
    body: MEDICARE_BENCHMARK_NOTICE,
    medicareLink: true,
  },
  {
    label: "Disclaimer",
    body: BENCHMARK_TOOL_DISCLAIMER,
    medicareLink: true,
  },
  {
    label: "Call recording",
    body: "If a call is conducted with an agent, the user consents to being recorded for quality assurance purposes.",
  },
  {
    label: "Agency referrals",
    body: AGENCY_REFERRAL_NOTICE,
  },
  {
    label: "Assistance requests",
    body: ASSISTANCE_AGENCY_SHARING_NOTICE,
  },
] as const;

export const MEDICARE_GOV_URL = "https://www.medicare.gov";

/** Official CMS plan comparison tool (replaces vague "Plan Finder" wording in copy). */
export const MEDICARE_PLAN_COMPARE_URL = "https://www.medicare.gov/plan-compare";
