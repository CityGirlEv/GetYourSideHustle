/** Channel tags for compliance checklist matrix (Page / Ads / Website). */

export type ChecklistChannelId = "facebook-page" | "meta-ads" | "website";

export const CHECKLIST_CHANNEL_LABELS: Record<ChecklistChannelId, string> = {
  "facebook-page": "Facebook",
  "meta-ads": "Meta",
  website: "Website",
};

export const CHECKLIST_CHANNEL_SHORT: Record<ChecklistChannelId, string> = {
  "facebook-page": "Page",
  "meta-ads": "Ads",
  website: "Web",
};

/**
 * Single primary channel per checklist item — no overlap across Page / Ads / Web tabs.
 * Items that touch multiple surfaces are assigned to the best-fit owner category.
 */
export const ITEM_CHANNEL_MAP: Record<string, ChecklistChannelId> = {
  "fb-business-manager": "meta-ads",
  "fb-special-ad-category": "meta-ads",
  "fb-landing-url": "meta-ads",
  "fb-ad-copy-draft": "meta-ads",
  "fb-creative-assets": "meta-ads",
  "fb-lead-forms": "meta-ads",
  "fb-privacy-policy": "website",
  "fb-page-branding": "facebook-page",
  "fb-copy-review": "meta-ads",
  "fb-creative-review": "meta-ads",
  "fb-targeting-review": "meta-ads",
  "fb-meta-submission": "meta-ads",

  "cms-tpmo-disclaimer": "website",
  "cms-mpd-disclaimer": "meta-ads",
  "cms-government-affiliation": "website",
  "cms-educational-only": "website",
  "cms-benchmark-disclaimers": "website",
  "cms-lead-consent": "website",
  "cms-smid": "meta-ads",
  "cms-soa": "website",
  "cms-privacy-legal": "website",
  "cms-lead-audit": "website",
  "cms-copy-audit": "website",
  "cms-disclaimer-placement": "website",
  "cms-smid-signoff": "meta-ads",
  "cms-compliance-signoff": "meta-ads",

  "launch-phi-note": "website",
  "launch-trust-banner": "website",
  "launch-email-footers": "website",
  "launch-admin-noindex": "website",
  "launch-production-url": "website",
  "launch-guidde-walkthrough": "website",
  "launch-analytics": "meta-ads",
  "launch-e2e-qa": "website",
  "launch-readiness": "meta-ads",

  "gap-meta-pixel-live": "meta-ads",
  "gap-intake-disclaimers-above-fold": "website",
  "gap-fb-business-manager": "meta-ads",
  "gap-fb-page-branding": "facebook-page",
  "gap-smid-registry": "meta-ads",
  "gap-soa-agent-docs": "website",
  "gap-mobile-disclaimer-placement": "website",
  "gap-email-template-qa": "website",
};

export function channelForItem(itemId: string): ChecklistChannelId {
  return ITEM_CHANNEL_MAP[itemId] ?? "website";
}

/** @deprecated Use {@link channelForItem}. */
export function channelsForItem(itemId: string): ChecklistChannelId {
  return channelForItem(itemId);
}

/** Checklist tab filters — all items, one channel, or gaps. */
export type ChecklistChannelFilter = ChecklistChannelId | "all" | "gaps";

export const CHECKLIST_CHANNEL_TABS: { id: ChecklistChannelFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "facebook-page", label: "Facebook List" },
  { id: "meta-ads", label: "Meta List" },
  { id: "website", label: "Website List" },
  { id: "gaps", label: "Meta Ads" },
];

export function itemMatchesChannelFilter(
  item: { id: string; channel: ChecklistChannelId },
  filter: ChecklistChannelFilter,
): boolean {
  if (filter === "gaps") return item.id.startsWith("gap-");
  if (filter === "all") return !item.id.startsWith("gap-");
  return item.channel === filter;
}
