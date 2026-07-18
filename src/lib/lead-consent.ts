import {
  AGENCY_REFERRAL_NOTICE,
  ASSISTANCE_AGENCY_SHARING_NOTICE,
  TPMO_PLATFORM_DISCLAIMER,
} from "@/lib/medicare-disclaimers";
import { LEGAL_OPERATOR_NAME } from "@/lib/legal-content";

/** Bump when checkbox labels or required flow changes (stored on each certificate). */
export const LEAD_CONSENT_FLOW_VERSION = "2026-06-17-v2";

export const DEFAULT_LEAD_AGENCY_NAME = LEGAL_OPERATOR_NAME;

export const LEAD_PRIVACY_ACK_LABEL =
  "I have read and agree to the Privacy Policy and Terms of Use.";

export function leadContactAuthorizationLabel(
  agencyName: string = DEFAULT_LEAD_AGENCY_NAME,
): string {
  return `I authorize ${agencyName} to contact me by phone, text message, and email regarding my Medicare options.`;
}

export const LEAD_MARKETING_OPT_IN_LABEL =
  "I would like to receive future educational Medicare tips and updates.";

/** Button / dialog title for partner opt-in. */
export const CMS_PARTNER_CTA = "Connect with Licensed Agent";

/** User-facing notice that a licensed agent from CMS will follow up. */
export const LICENSED_AGENT_WILL_CONTACT =
  `A licensed Medicare Agent from ${LEGAL_OPERATOR_NAME} — will contact you`;

export const LEAD_OPT_IN_INTRO =
  `Your comparison is complete! If you'd like personalized guidance, a ${LEGAL_OPERATOR_NAME} Partner can review your results and answer your questions.`;

export type LeadCheckboxSnapshot = {
  label: string;
  checked: boolean;
  required: boolean;
};

export type LeadConsentSnapshot = {
  flow_version: string;
  agency_name: string;
  scenario_code: string | null;
  notices_shown: string[];
  checkboxes: {
    privacy_acknowledgment: LeadCheckboxSnapshot;
    contact_authorization: LeadCheckboxSnapshot;
    marketing_opt_in: LeadCheckboxSnapshot;
  };
};

export function buildLeadConsentSnapshot(opts: {
  agencyName?: string;
  scenarioCode?: string | null;
  privacyAcknowledged: boolean;
  contactAuthorized: boolean;
  marketingOptIn: boolean;
}): LeadConsentSnapshot {
  const agencyName = opts.agencyName ?? DEFAULT_LEAD_AGENCY_NAME;
  return {
    flow_version: LEAD_CONSENT_FLOW_VERSION,
    agency_name: agencyName,
    scenario_code: opts.scenarioCode?.trim().toUpperCase() || null,
    notices_shown: [
      LEAD_OPT_IN_INTRO,
      TPMO_PLATFORM_DISCLAIMER,
      AGENCY_REFERRAL_NOTICE,
      ASSISTANCE_AGENCY_SHARING_NOTICE,
    ],
    checkboxes: {
      privacy_acknowledgment: {
        label: LEAD_PRIVACY_ACK_LABEL,
        checked: opts.privacyAcknowledged,
        required: true,
      },
      contact_authorization: {
        label: leadContactAuthorizationLabel(agencyName),
        checked: opts.contactAuthorized,
        required: true,
      },
      marketing_opt_in: {
        label: LEAD_MARKETING_OPT_IN_LABEL,
        checked: opts.marketingOptIn,
        required: false,
      },
    },
  };
}

/** Flat consent record for database storage and exports. */
export function formatLeadConsentText(snapshot: LeadConsentSnapshot): string {
  const lines = [
    `Flow version: ${snapshot.flow_version}`,
    `Agency: ${snapshot.agency_name}`,
  ];
  if (snapshot.scenario_code) {
    lines.push(`Scenario: ${snapshot.scenario_code}`);
  }
  lines.push("", "Notices shown:");
  for (const notice of snapshot.notices_shown) {
    lines.push(`- ${notice}`);
  }
  lines.push("", "Checkbox responses:");
  for (const box of Object.values(snapshot.checkboxes)) {
    const mark = box.checked ? "x" : " ";
    lines.push(`- [${mark}] ${box.label}${box.required ? " (required)" : ""}`);
  }
  return lines.join("\n");
}

const MAX_LEAD_SOURCE_URL_LENGTH = 2048;

/** Normalize page URL from client metadata (browser-only). */
export function resolveLeadSourceUrl(metadata: Record<string, unknown> | null | undefined): string | null {
  const raw = metadata?.pageUrl;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.href.slice(0, MAX_LEAD_SOURCE_URL_LENGTH);
  } catch {
    return null;
  }
}

/** Browser/device hints sent with the lead (never trust for security). */
export function collectLeadClientMetadata(): Record<string, unknown> {
  if (typeof navigator === "undefined") return {};
  const metadata: Record<string, unknown> = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages ? [...navigator.languages] : [],
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    screen:
      typeof screen !== "undefined"
        ? { width: screen.width, height: screen.height, colorDepth: screen.colorDepth }
        : null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  if (typeof window !== "undefined") {
    metadata.pageUrl = window.location.href.slice(0, MAX_LEAD_SOURCE_URL_LENGTH);
  }
  if (typeof document !== "undefined" && document.referrer) {
    metadata.referrer = document.referrer.slice(0, MAX_LEAD_SOURCE_URL_LENGTH);
  }
  return metadata;
}

/** Bump when newsletter signup checkbox labels change. */
export const NEWSLETTER_SIGNUP_FLOW_VERSION = "2026-06-25-v1";

/** Bump when lead-magnet email gate labels change. */
export const LEAD_MAGNET_SIGNUP_FLOW_VERSION = "2026-06-25-v1";

export const NEWSLETTER_EDUCATIONAL_OPT_IN_LABEL =
  "Send me the weekly Learning Center roundup and educational Medicare tips by email.";

export function leadMagnetPdfDeliveryLabel(workbookTitle: string): string {
  return `Email me the ${workbookTitle} PDF at the address above.`;
}

export type EmailSignupConsentSnapshot = {
  flow_version: string;
  signup_kind: "newsletter" | "lead_magnet";
  lead_magnet_slug: string | null;
  notices_shown: string[];
  checkboxes: Record<string, LeadCheckboxSnapshot>;
};

export function buildNewsletterSignupConsentSnapshot(opts: {
  privacyAcknowledged: boolean;
  educationalOptIn: boolean;
}): EmailSignupConsentSnapshot {
  return {
    flow_version: NEWSLETTER_SIGNUP_FLOW_VERSION,
    signup_kind: "newsletter",
    lead_magnet_slug: null,
    notices_shown: [TPMO_PLATFORM_DISCLAIMER],
    checkboxes: {
      privacy_acknowledgment: {
        label: LEAD_PRIVACY_ACK_LABEL,
        checked: opts.privacyAcknowledged,
        required: true,
      },
      educational_opt_in: {
        label: NEWSLETTER_EDUCATIONAL_OPT_IN_LABEL,
        checked: opts.educationalOptIn,
        required: true,
      },
    },
  };
}

export function buildLeadMagnetSignupConsentSnapshot(opts: {
  workbookTitle: string;
  slug: string;
  privacyAcknowledged: boolean;
  pdfDeliveryAuthorized: boolean;
  newsletterOptIn: boolean;
}): EmailSignupConsentSnapshot {
  return {
    flow_version: LEAD_MAGNET_SIGNUP_FLOW_VERSION,
    signup_kind: "lead_magnet",
    lead_magnet_slug: opts.slug,
    notices_shown: [TPMO_PLATFORM_DISCLAIMER],
    checkboxes: {
      privacy_acknowledgment: {
        label: LEAD_PRIVACY_ACK_LABEL,
        checked: opts.privacyAcknowledged,
        required: true,
      },
      pdf_delivery: {
        label: leadMagnetPdfDeliveryLabel(opts.workbookTitle),
        checked: opts.pdfDeliveryAuthorized,
        required: true,
      },
      newsletter_opt_in: {
        label: LEAD_MARKETING_OPT_IN_LABEL,
        checked: opts.newsletterOptIn,
        required: false,
      },
    },
  };
}

export function formatEmailSignupConsentText(snapshot: EmailSignupConsentSnapshot): string {
  const lines = [
    `Flow version: ${snapshot.flow_version}`,
    `Signup kind: ${snapshot.signup_kind}`,
  ];
  if (snapshot.lead_magnet_slug) {
    lines.push(`Lead magnet: ${snapshot.lead_magnet_slug}`);
  }
  lines.push("", "Notices shown:");
  for (const notice of snapshot.notices_shown) {
    lines.push(`- ${notice}`);
  }
  lines.push("", "Checkbox responses:");
  for (const box of Object.values(snapshot.checkboxes)) {
    const mark = box.checked ? "x" : " ";
    lines.push(`- [${mark}] ${box.label}${box.required ? " (required)" : ""}`);
  }
  return lines.join("\n");
}

export function normalizeSignupEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Bump when educational intake consent language changes. */
export const EDUCATIONAL_INTAKE_CONSENT_FLOW_VERSION = "2026-06-09-v1";

export const EDUCATIONAL_INTAKE_AGENCY_NAME = "CMS Health & Wealth Insurance company";

export const EDUCATIONAL_INTAKE_CONTACT_CONSENT_LABEL =
  "By checking this box, I provide my express written consent authorizing this website to share my information with a licensed insurance professional from CMS Health & Wealth Insurance company, and authorize them to contact me via phone, text, or email to discuss my private Medicare options.";

export const EDUCATIONAL_INTAKE_AGENCY_NOTICE =
  "Notice: CMS Health & Wealth Insurance company is a private insurance agency. It is NOT a government agency and is NOT affiliated with, or endorsed by, the Centers for Medicare & Medicaid Services (CMS) or the federal Medicare program.";

export type LeadComplianceRecord = {
  consent_text: string;
  checked: boolean;
  ip_address: string | null;
  recorded_at_utc: string;
};

export type EducationalIntakeConsentSnapshot = {
  flow_version: string;
  agency_name: string;
  intake_kind: "educational_cost_estimator";
  notices_shown: string[];
  checkboxes: {
    partner_contact_consent: LeadCheckboxSnapshot;
  };
  compliance_records: LeadComplianceRecord[];
};

export function buildEducationalIntakeConsentSnapshot(opts: {
  partnerContactConsent: boolean;
  ipAddress: string | null;
  recordedAtUtc: string;
}): EducationalIntakeConsentSnapshot {
  return {
    flow_version: EDUCATIONAL_INTAKE_CONSENT_FLOW_VERSION,
    agency_name: EDUCATIONAL_INTAKE_AGENCY_NAME,
    intake_kind: "educational_cost_estimator",
    notices_shown: [EDUCATIONAL_INTAKE_AGENCY_NOTICE],
    checkboxes: {
      partner_contact_consent: {
        label: EDUCATIONAL_INTAKE_CONTACT_CONSENT_LABEL,
        checked: opts.partnerContactConsent,
        required: true,
      },
    },
    compliance_records: [
      {
        consent_text: EDUCATIONAL_INTAKE_CONTACT_CONSENT_LABEL,
        checked: opts.partnerContactConsent,
        ip_address: opts.ipAddress,
        recorded_at_utc: opts.recordedAtUtc,
      },
    ],
  };
}

export function formatEducationalIntakeConsentText(snapshot: EducationalIntakeConsentSnapshot): string {
  const lines = [
    `Flow version: ${snapshot.flow_version}`,
    `Intake kind: ${snapshot.intake_kind}`,
    `Agency: ${snapshot.agency_name}`,
    "",
    "Notices shown:",
  ];
  for (const notice of snapshot.notices_shown) {
    lines.push(`- ${notice}`);
  }
  lines.push("", "Checkbox responses:");
  for (const box of Object.values(snapshot.checkboxes)) {
    const mark = box.checked ? "x" : " ";
    lines.push(`- [${mark}] ${box.label}${box.required ? " (required)" : ""}`);
  }
  lines.push("", "Compliance records:");
  for (const record of snapshot.compliance_records) {
    lines.push(
      `- checked=${record.checked} ip=${record.ip_address ?? "unknown"} at=${record.recorded_at_utc}`,
    );
    lines.push(`  text: ${record.consent_text}`);
  }
  return lines.join("\n");
}
