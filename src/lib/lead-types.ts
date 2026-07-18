/** Unified lead / intake event types across the site. */

export const LEAD_TYPES = {
  /** User clicked a “speak to an agent” / partner CTA (intent — no PII yet). */
  AGENT_CTA_CLICK: "agent_cta_click",
  /** User completed the expert opt-in form (agent contact authorized). */
  AGENT_OPT_IN_SUBMIT: "agent_opt_in_submit",
  /** Newsletter / Learning Center email signup. */
  NEWSLETTER_SIGNUP: "newsletter_signup",
  /** Workbook or other lead-magnet download with email. */
  LEAD_MAGNET_SIGNUP: "lead_magnet_signup",
  /** Educational cost-estimator intake on /scenario/new with partner consent. */
  EDUCATIONAL_INTAKE_SUBMIT: "educational_intake_submit",
} as const;

export type LeadType = (typeof LEAD_TYPES)[keyof typeof LEAD_TYPES];

export const LEAD_STATUSES = {
  INTENT: "intent",
  COMPLETED: "completed",
} as const;

export type LeadStatus = (typeof LEAD_STATUSES)[keyof typeof LEAD_STATUSES];

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  [LEAD_TYPES.AGENT_CTA_CLICK]: "Agent CTA click",
  [LEAD_TYPES.AGENT_OPT_IN_SUBMIT]: "Agent opt-in (completed)",
  [LEAD_TYPES.NEWSLETTER_SIGNUP]: "Newsletter signup",
  [LEAD_TYPES.LEAD_MAGNET_SIGNUP]: "Lead magnet download",
  [LEAD_TYPES.EDUCATIONAL_INTAKE_SUBMIT]: "Educational intake (completed)",
};

export function isLeadType(value: string): value is LeadType {
  return Object.values(LEAD_TYPES).includes(value as LeadType);
}
