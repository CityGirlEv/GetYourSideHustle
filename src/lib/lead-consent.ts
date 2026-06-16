import { ASSISTANCE_AGENCY_SHARING_NOTICE, TPMO_PLATFORM_DISCLAIMER } from "@/lib/medicare-disclaimers";
import { LEGAL_OPERATOR_NAME } from "@/lib/legal-content";

/** Bump when checkbox labels or required flow changes (stored on each certificate). */
export const LEAD_CONSENT_FLOW_VERSION = "2026-06-15-v1";

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
export const CMS_PARTNER_CTA = "Connect with a CMS Health & Wealth Insurance Partner";

/** User-facing notice that a licensed agent from CMS will follow up. */
export const LICENSED_AGENT_WILL_CONTACT =
  "A licensed Medicare Agent from CMS Health & Wealth Insurance — will contact you";

export const LEAD_OPT_IN_INTRO =
  `Your comparison is complete! If you'd like personalized guidance, ${CMS_PARTNER_CTA.toLowerCase()} who can review your results and answer your questions.`;

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
    notices_shown: [LEAD_OPT_IN_INTRO, TPMO_PLATFORM_DISCLAIMER, ASSISTANCE_AGENCY_SHARING_NOTICE],
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

/** Browser/device hints sent with the lead (never trust for security). */
export function collectLeadClientMetadata(): Record<string, unknown> {
  if (typeof navigator === "undefined") return {};
  return {
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
}
