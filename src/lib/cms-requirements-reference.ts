/**
 * CMS / Medicare marketing compliance reference for TPMO educational tools.
 * Used on the admin submission checklist — not consumer-facing copy.
 */

export interface CmsRequirementItem {
  id: string;
  title: string;
  summary: string;
  /** Regulation or guidance citation when applicable. */
  citation?: string;
}

export interface CmsOfficialLink {
  id: string;
  title: string;
  url: string;
  description: string;
}

/** Key CMS requirements for TPMO marketing and educational benchmark tools. */
export const CMS_REQUIREMENTS: CmsRequirementItem[] = [
  {
    id: "tpmo-disclaimer",
    title: "TPMO disclaimer on all marketing surfaces",
    summary:
      "Third-party marketing organizations must use CMS-standardized disclaimer language on websites, in electronic communications, in print/TV ads, and verbally before discussing plan benefits on sales calls.",
    citation: "42 CFR §422.2267(e)(41); §423.2267(e)(41)",
  },
  {
    id: "mpd",
    title: "Multi-Plan Disclaimer (MPD)",
    summary:
      "When not representing every plan in a service area, disclose plan count and direct beneficiaries to Medicare.gov, 1-800-MEDICARE, or SHIP for all options. Educational tools must not imply a complete carrier catalog.",
    citation: "42 CFR §422.2262; §423.2262",
  },
  {
    id: "no-misleading-enrollment",
    title: "No misleading enrollment or government endorsement",
    summary:
      "Prohibit enrollment solicitation that misrepresents coverage, implies CMS/government affiliation, or uses Medicare card imagery, CMS logos, or federal seals in a misleading way.",
    citation: "42 CFR §422.2262(a)(1); §423.2262(a)(1)",
  },
  {
    id: "educational-positioning",
    title: "Educational vs. marketing material classification",
    summary:
      "Benchmark and comparison tools must be framed as educational — not plan-finding or enrollment vehicles. Copy avoids superlatives (“best,” “#1”), inducements, and implied plan sales.",
    citation: "MCMG; 42 CFR Subpart V",
  },
  {
    id: "soa",
    title: "Scope of Appointment (SOA) before plan-specific sales",
    summary:
      "Licensed agents must document beneficiary consent to discuss specific plan types (MA, Part D, Medigap) before a marketing appointment or substantive plan discussion — not during initial educational tool use.",
    citation: "42 CFR §422.2264; §423.2264",
  },
  {
    id: "agent-phone-disclosure",
    title: "Licensed sales agent phone disclosures",
    summary:
      "Materials that include an agent phone number must state that calling will reach a licensed sales agent, immediately before the number is shown.",
    citation: "42 CFR §422.2262(c)(1)(ii); §423.2262(c)(1)(ii)",
  },
  {
    id: "smid",
    title: "SMID / marketing material filing",
    summary:
      "Marketing materials used, created, or distributed by a TPMO generally require a Sales, Marketing, and Educational Material ID (SMID) filed with the applicable MA or Part D sponsor. Document SMID, filing date, and asset mapping.",
    citation: "42 CFR §422.2261; §423.2261",
  },
  {
    id: "recordkeeping",
    title: "Lead consent and compliance recordkeeping",
    summary:
      "Retain evidence of marketing consent, TPMO disclosures shown, lead source, timestamps, and agent assignment for audit. Separate optional marketing opt-in from assistance requests.",
    citation: "42 CFR §422.2262; agent/broker training guidelines",
  },
  {
    id: "tpmo-sponsor-approval",
    title: "TPMO material submission to plan sponsors",
    summary:
      "TPMOs must submit marketing materials designed on behalf of MA or Part D organizations with prior sponsor approval before use.",
    citation: "42 CFR §422.2261(a)(2); §423.2261(a)(2)",
  },
  {
    id: "cfr-compliance",
    title: "42 CFR Part 422 / 423 Subpart V compliance",
    summary:
      "All communications and marketing materials must comply with Medicare Advantage and Part D marketing regulations — prohibited claims, required disclaimers, beneficiary protections, and TPMO oversight.",
    citation: "42 CFR §422.2260–422.2276; §423.2260–423.2276",
  },
];

/** Official CMS and Medicare.gov reference pages. */
export const CMS_OFFICIAL_LINKS: CmsOfficialLink[] = [
  {
    id: "mcmg",
    title: "Medicare Communications & Marketing Guidelines (MCMG)",
    url: "https://www.cms.gov/medicare/health-drug-plans/managed-care-marketing/medicare-guidelines",
    description:
      "CMS interpretation of MA and Part D marketing requirements under 42 CFR Parts 422 and 423.",
  },
  {
    id: "managed-care-marketing",
    title: "CMS Managed Care Marketing hub",
    url: "https://www.cms.gov/medicare/health-drug-plans/managed-care-marketing",
    description:
      "Central portal for marketing regulations, reviewer contacts, and TPMO guidance.",
  },
  {
    id: "model-materials",
    title: "Marketing models & educational material",
    url: "https://www.cms.gov/medicare/health-drug-plans/managed-care-marketing/models-standard-documents-educational-materials",
    description:
      "CMS model documents, educational material standards, and agent/broker training guidelines.",
  },
  {
    id: "cfr-422-2262",
    title: "42 CFR §422.2262 — MA communications & marketing",
    url: "https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-422/subpart-V/section-422.2262",
    description: "Federal regulation for Medicare Advantage marketing content and TPMO rules.",
  },
  {
    id: "cfr-423-2262",
    title: "42 CFR §423.2262 — Part D communications & marketing",
    url: "https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-423/subpart-V/section-423.2262",
    description: "Parallel Part D prescription drug plan marketing requirements.",
  },
  {
    id: "medicare-marketing-rules",
    title: "Medicare.gov — plan marketing rules",
    url: "https://www.medicare.gov/health-drug-plans/health-plans/your-coverage-options/plan-marketing-rules",
    description:
      "Beneficiary-facing rules for meeting with agents, SOA expectations, and prohibited sales practices.",
  },
  {
    id: "medicare-gov",
    title: "Medicare.gov",
    url: "https://www.medicare.gov",
    description: "Official Medicare program site — required reference in TPMO and MPD disclaimers.",
  },
  {
    id: "agent-training",
    title: "CY2025 Agent & Broker Training Guidelines (PDF)",
    url: "https://www.cms.gov/files/document/cy2025-agent-broker-training-testing-guidelines-revised.pdf",
    description:
      "Annual CMS training requirements for agents, brokers, and TPMOs selling Medicare products.",
  },
];

/** Total numbered reference entries (requirements + official links). */
export function cmsReferenceItemCount(): number {
  return CMS_REQUIREMENTS.length + CMS_OFFICIAL_LINKS.length;
}

/** CMS requirements with continuous numbering starting at 1. */
export function numberedCmsRequirements(): Array<CmsRequirementItem & { number: number }> {
  return CMS_REQUIREMENTS.map((item, index) => ({ ...item, number: index + 1 }));
}

/** Official links numbered after requirements. */
export function numberedCmsOfficialLinks(): Array<CmsOfficialLink & { number: number }> {
  const offset = CMS_REQUIREMENTS.length;
  return CMS_OFFICIAL_LINKS.map((item, index) => ({ ...item, number: offset + index + 1 }));
}
