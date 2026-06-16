/** How the user heard about the site — stored in scenario preferences (marketing attribution only). */
export const REFERRAL_SOURCES = [
  { value: "agent_referral", label: "Agent referral" },
  { value: "friend_family", label: "Friend or family" },
  { value: "google", label: "Google search" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "email_newsletter", label: "Email or newsletter" },
  { value: "tv_radio", label: "TV or radio" },
  { value: "medicare_event", label: "Medicare event or seminar" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
  { value: "other", label: "Other" },
] as const;

export type ReferralSource = (typeof REFERRAL_SOURCES)[number]["value"];

/** Sources that show an optional detail field when selected. */
export const REFERRAL_SOURCES_WITH_DETAIL = [
  "agent_referral",
  "friend_family",
  "medicare_event",
] as const;

export type ReferralDetailSource = (typeof REFERRAL_SOURCES_WITH_DETAIL)[number];

export const REFERRAL_DETAIL_FIELDS: Record<
  ReferralDetailSource,
  { label: string; placeholder: string; hint: string }
> = {
  agent_referral: {
    label: "Referring agent or agency name (optional)",
    placeholder: "e.g. Smith Insurance Group",
    hint: "Licensed agent or agency only — not your personal information.",
  },
  friend_family: {
    label: "Referral details (optional)",
    placeholder: "e.g. Word of mouth from a neighbor",
    hint: "No names, email addresses, or phone numbers.",
  },
  medicare_event: {
    label: "Event or seminar name (optional)",
    placeholder: "e.g. Springfield Senior Center Medicare 101",
    hint: "Event or organization name only — no personal contact information.",
  },
};

const REFERRAL_SOURCE_SET = new Set<string>(REFERRAL_SOURCES.map((s) => s.value));

export function isReferralSource(value: string): value is ReferralSource {
  return REFERRAL_SOURCE_SET.has(value);
}

/** Reject email, phone, or SSN-like patterns in free-text referral fields. */
export function referralTextLooksLikePii(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/@[\w.-]+\.\w{2,}/.test(t)) return true;
  if (/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/.test(t)) return true;
  if (/\b(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(t)) return true;
  return false;
}

export function sanitizeReferralDetail(text: string, maxLen = 80): string {
  return text.trim().slice(0, maxLen);
}

export type ReferralDetailValues = {
  agent_referral?: string;
  friend_family?: string;
  medicare_event?: string;
  other?: string;
};

export type ReferralPreferences = {
  /** Primary storage — user may select multiple channels. */
  referralSources?: ReferralSource[];
  /** @deprecated Legacy single-value field; first source when present. */
  referralSource?: ReferralSource;
  referralAgentName?: string;
  referralFriendFamily?: string;
  referralMedicareEvent?: string;
  referralOther?: string;
};

export function buildReferralPreferences(
  sources: ReferralSource[],
  details: ReferralDetailValues,
): ReferralPreferences {
  if (sources.length === 0) return {};
  const prefs: ReferralPreferences = {
    referralSources: sources,
    referralSource: sources[0],
  };
  if (sources.includes("agent_referral")) {
    const name = sanitizeReferralDetail(details.agent_referral ?? "");
    if (name) prefs.referralAgentName = name;
  }
  if (sources.includes("friend_family")) {
    const text = sanitizeReferralDetail(details.friend_family ?? "");
    if (text) prefs.referralFriendFamily = text;
  }
  if (sources.includes("medicare_event")) {
    const text = sanitizeReferralDetail(details.medicare_event ?? "");
    if (text) prefs.referralMedicareEvent = text;
  }
  if (sources.includes("other")) {
    const other = sanitizeReferralDetail(details.other ?? "");
    if (other) prefs.referralOther = other;
  }
  return prefs;
}
