import { ASSISTANCE_AGENCY_SHARING_NOTICE, SITE_BRAND_NAME } from "@/lib/medicare-disclaimers";

export const LEGAL_OPERATOR_NAME = "CMS Health & Wealth Insurance";
export const PRIVACY_CONTACT_EMAIL = "info@mypartb.com";

export const LEGAL_NAV = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms of Use" },
  { id: "cookies", label: "Cookie Policy" },
  { id: "delete-data", label: "Delete My Data" },
  { id: "privacy-contact", label: "Contact Us About Privacy" },
] as const;

export type LegalSectionId = (typeof LEGAL_NAV)[number]["id"];

export type LegalSection = {
  id: LegalSectionId;
  title: string;
  intro?: string;
  blocks: Array<{ heading?: string; paragraphs: string[]; bullets?: string[] }>;
};

export const LEGAL_SECTIONS: LegalSection[] = [
  {
    id: "privacy",
    title: "Privacy Policy",
    intro: `Last updated: ${new Date().getFullYear()}. This Privacy Policy describes how ${LEGAL_OPERATOR_NAME} ("we," "us," or "our") collects, uses, and protects information when you use ${SITE_BRAND_NAME} (the "Service").`,
    blocks: [
      {
        heading: "Information we collect",
        paragraphs: [
          "Scenario comparison inputs you choose to enter (for example, year of birth, ZIP3, medications, and plan preferences). By design, our public scenario builder does not require your full name, Social Security number, Medicare Beneficiary Identifier (MBI), or full date of birth.",
          "Contact information you voluntarily provide when you opt in to speak with a CMS Health & Wealth Insurance Partner (name, email, and phone number).",
          "Account information if you register as an agent, QA tester, or staff user (name, email, phone, and role-related profile data).",
          "Technical data such as browser type, device information, IP address, and cookies described in our Cookie Policy.",
        ],
      },
      {
        heading: "How we use information",
        bullets: [
          "Provide educational Medicare plan comparisons and scenario results.",
          "Connect you with a licensed partner when you opt in and authorize contact.",
          "Operate, secure, and improve the Service.",
          "Send transactional emails you request (confirmations, account notices).",
          "Comply with law and respond to privacy requests.",
        ],
        paragraphs: [],
      },
      {
        heading: "Sharing",
        paragraphs: [
          "We do not sell your personal information. We may share information with service providers who help us host the Service, send email, or operate analytics—under contracts that limit their use of your data.",
          "If you opt in to partner contact, we share the contact details and scenario information needed for a licensed agent to follow up.",
          "We may disclose information when required by law or to protect the rights and safety of users and the public.",
        ],
      },
      {
        heading: "Consent records",
        paragraphs: [
          "When you request assistance from a licensed partner, we store a lead certificate that records your name, the date and time of submission, your IP address, browser or device information (when available), the agency name shown to you, the exact consent language displayed, and your checkbox responses (privacy acknowledgment, contact authorization, and optional marketing preferences). These records help us honor your choices and respond to questions from partners or regulators.",
        ],
      },
      {
        heading: "Retention & security",
        paragraphs: [
          "De-identified scenario data may be retained for a limited period to support comparisons and operational needs. Contact opt-in records are retained as needed to honor your request and meet legal obligations.",
          "We use administrative, technical, and organizational safeguards appropriate to the data we hold. No method of transmission over the Internet is 100% secure.",
        ],
      },
      {
        heading: "Your choices & rights",
        bullets: [
          "You may decline partner contact by not checking the opt-in consent box.",
          "You may request access, correction, or deletion using the Delete My Data form on this page.",
          "You may contact us about privacy using the form below or by emailing the address listed in Contact Us About Privacy.",
          "Depending on your state of residence, you may have additional privacy rights under applicable law.",
        ],
        paragraphs: [],
      },
      {
        heading: "Children",
        paragraphs: [
          "The Service is not directed to children under 13, and we do not knowingly collect personal information from children.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised date.",
        ],
      },
    ],
  },
  {
    id: "terms",
    title: "Terms of Use",
    intro: `By accessing or using ${SITE_BRAND_NAME}, you agree to these Terms of Use. If you do not agree, do not use the Service.`,
    blocks: [
      {
        heading: "Educational purpose only",
        paragraphs: [
          `${SITE_BRAND_NAME} is an educational comparison tool. It is not a complete listing of plans available in your area, does not enroll you in coverage, and does not provide personalized legal, tax, or medical advice.`,
          "Plan names, premiums, and benefits shown are estimates based on publicly available CMS data and may differ from actual carrier offerings. Always verify details with a licensed insurance agent or Medicare.gov before enrolling.",
        ],
      },
      {
        heading: "No government affiliation",
        paragraphs: [
          `${SITE_BRAND_NAME} and ${LEGAL_OPERATOR_NAME} are not affiliated with, endorsed by, or connected to the U.S. government or the Medicare program.`,
        ],
      },
      {
        heading: "Acceptable use",
        bullets: [
          "Do not misuse the Service, attempt unauthorized access, or interfere with its operation.",
          "Do not submit false, misleading, or unlawful information.",
          "Staff and beta accounts must comply with applicable confidentiality obligations (including any signed NDA).",
        ],
        paragraphs: [],
      },
      {
        heading: "Partner contact & recordings",
        paragraphs: [
          ASSISTANCE_AGENCY_SHARING_NOTICE,
          "If you opt in to partner contact, you authorize CMS Health & Wealth Insurance Partner to reach you using the contact method you provide.",
          "If a call is conducted with an agent, you consent to being recorded for quality assurance purposes.",
        ],
      },
      {
        heading: "Disclaimer of warranties",
        paragraphs: [
          'The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied, including fitness for a particular purpose and non-infringement.',
        ],
      },
      {
        heading: "Limitation of liability",
        paragraphs: [
          "To the fullest extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: [
          "These Terms are governed by the laws of the United States and the state in which CMS Health & Wealth Insurance operates, without regard to conflict-of-law rules.",
        ],
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookie Policy",
    intro: "This Cookie Policy explains how we use cookies and similar technologies on the Service.",
    blocks: [
      {
        heading: "What are cookies?",
        paragraphs: [
          "Cookies are small text files stored on your device. They help websites remember preferences, keep you signed in, and understand how the Service is used.",
        ],
      },
      {
        heading: "Cookies we use",
        bullets: [
          "Essential cookies — required for security, authentication, and core site functions.",
          "Preference cookies — remember settings such as display preferences where available.",
          "Analytics cookies — help us understand usage patterns so we can improve the Service (aggregated where possible).",
        ],
        paragraphs: [],
      },
      {
        heading: "Your choices",
        paragraphs: [
          "You can control cookies through your browser settings. Blocking essential cookies may limit sign-in and certain features.",
          "If we add optional analytics or marketing cookies that require consent in your region, we will present a choice before setting them.",
        ],
      },
      {
        heading: "Updates",
        paragraphs: [
          "We may update this Cookie Policy when our practices change. Please review this page periodically.",
        ],
      },
    ],
  },
];
