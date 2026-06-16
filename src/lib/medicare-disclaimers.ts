/** Shared Medicare / TPMO disclaimer copy for web and email surfaces. */
import { SITE_BRAND_NAME, formatSiteCopyright } from "@/lib/site-brand";

export { SITE_BRAND_NAME, formatSiteCopyright };

export const ASSISTANCE_AGENCY_SHARING_NOTICE =
  "By requesting assistance, you agree that your information will be shared with CMS Health & Wealth Insurance agency so they can contact you regarding your request.";

export const TPMO_PLATFORM_DISCLAIMER =
  "The Get Part B Optimizer is an independent educational platform and Third-Party Marketing Organization (TPMO). We are not affiliated with or endorsed by Medicare, CMS, or any federal government agency. We do not offer every plan available in your area. Information is provided for educational purposes only. If requested, we may connect you with a licensed Medicare professional.";

export const MEDICARE_DISCLAIMER_SECTIONS = [
  {
    label: "TPMO",
    body: TPMO_PLATFORM_DISCLAIMER,
  },
  {
    label: "De-identification",
    body: "Get Part B Optimizer uses de-identified Medicare plan scenarios for educational comparison. Our scenario tools do not collect or store Social Security numbers, Medicare Beneficiary Identifiers (MBI), full dates of birth, or other protected health information.",
  },
  {
    label: "Medicare notice",
    body: "This tool compares sample Medicare plan scenarios for educational purposes only. It is not a complete listing of plans available in your area. For a complete listing, contact Medicare.gov or 1-800-MEDICARE (1-800-633-4227).",
    medicareLink: true,
  },
  {
    label: "Disclaimer",
    body: "Get Part B Optimizer is an educational and comparison tool only. We do not sell insurance, act as a licensed agent, or provide personalized legal, tax, or medical advice. Plan names, premiums, and benefits shown are estimated based on publicly available CMS data and may differ from actual carrier offerings in your area. Always verify details with a licensed insurance agent or by visiting Medicare.gov before enrolling. We are not affiliated with the U.S. government or the Medicare program.",
    medicareLink: true,
  },
  {
    label: "Call recording",
    body: "If a call is conducted with an agent, the user consents to being recorded for quality assurance purposes.",
  },
  {
    label: "Assistance requests",
    body: ASSISTANCE_AGENCY_SHARING_NOTICE,
  },
] as const;

export const MEDICARE_GOV_URL = "https://www.medicare.gov";
