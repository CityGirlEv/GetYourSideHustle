/** Shared Medicare / TPMO disclaimer copy for web and email surfaces. */
export const MEDICARE_DISCLAIMER_SECTIONS = [
  {
    label: 'De-identification',
    body:
      'The Medicare Optimizer uses de-identified Medicare plan scenarios for educational comparison. Our scenario tools do not collect or store Social Security numbers, Medicare Beneficiary Identifiers (MBI), full dates of birth, or other protected health information.',
  },
  {
    label: 'Medicare notice',
    body:
      'This tool compares sample Medicare plan scenarios for educational purposes only. It is not a complete listing of plans available in your area. For a complete listing, contact Medicare.gov or 1-800-MEDICARE (1-800-633-4227).',
    medicareLink: true,
  },
  {
    label: 'Disclaimer',
    body:
      'The Medicare Optimizer is an educational and comparison tool only. We do not sell insurance, act as a licensed agent, or provide personalized legal, tax, or medical advice. Plan names, premiums, and benefits shown are estimated based on publicly available CMS data and may differ from actual carrier offerings in your area. Always verify details with a licensed insurance agent or by visiting Medicare.gov before enrolling. We are not affiliated with the U.S. government or the Medicare program.',
    medicareLink: true,
  },
] as const

export const MEDICARE_GOV_URL = 'https://www.medicare.gov'

export const SITE_BRAND_NAME = 'The Medicare Optimizer'

export function formatSiteCopyright(year = new Date().getFullYear()): string {
  return `© ${year} ${SITE_BRAND_NAME}. All rights reserved.`
}
