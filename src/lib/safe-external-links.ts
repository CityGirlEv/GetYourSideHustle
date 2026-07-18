import { MEDICARE_GOV_URL } from "@/lib/medicare-disclaimers";

/** Official CMS plan comparison — never substitute third-party "Plan Finder" sites. */
export const MEDICARE_PLAN_COMPARE_URL = "https://www.medicare.gov/plan-compare";

/**
 * Known Medicare lead-gen / TPMO enrollment sites. Never send educational traffic here.
 * (medicare.com is eHealth — not the government.)
 */
export const BLOCKED_MEDICARE_LEAD_GEN_HOSTS = new Set([
  "medicaresolutions.com",
  "www.medicaresolutions.com",
  "medicare.com",
  "www.medicare.com",
  "ehealthmedicare.com",
  "www.ehealthmedicare.com",
  "gohealth.com",
  "www.gohealth.com",
  "selectquote.com",
  "www.selectquote.com",
  "mymedicare.com",
  "www.mymedicare.com",
  "medicareplan.com",
  "www.medicareplan.com",
  "medicareadvantage.com",
  "www.medicareadvantage.com",
  "medicaresupplement.com",
  "www.medicaresupplement.com",
  "healthmarkets.com",
  "www.healthmarkets.com",
  "smartasset.com",
  "www.smartasset.com",
]);

const EMAIL_LINK_ALLOWLIST_SUFFIXES = [
  "mypartb.com",
  "medicare.gov",
  "cms.gov",
  "ssa.gov",
  "shiphelp.org",
  "shiptacenter.org",
] as const;

function hostFromHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  if (trimmed.startsWith("mailto:")) return null;
  try {
    const url = new URL(trimmed, "https://mypartb.com");
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isBlockedMedicareLeadGenHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (BLOCKED_MEDICARE_LEAD_GEN_HOSTS.has(host)) return true;
  for (const blocked of BLOCKED_MEDICARE_LEAD_GEN_HOSTS) {
    if (host.endsWith(`.${blocked.replace(/^www\./, "")}`)) return true;
  }
  return false;
}

export function isAllowedEducationalEmailLink(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#")) return true;
  if (trimmed.startsWith("mailto:")) return true;

  const host = hostFromHref(trimmed);
  if (!host) return false;
  if (isBlockedMedicareLeadGenHost(host)) return false;

  return EMAIL_LINK_ALLOWLIST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
}

export function rewriteBlockedEducationalLink(href: string): string {
  const host = hostFromHref(href);
  if (!host || !isBlockedMedicareLeadGenHost(host)) return href;
  return MEDICARE_PLAN_COMPARE_URL;
}

/** Strip or rewrite markdown links and bare URLs before newsletter / email render. */
export function sanitizeMarkdownOutboundLinks(markdown: string): string {
  let out = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label: string, url: string) => {
    const cleanUrl = url.trim();
    if (isAllowedEducationalEmailLink(cleanUrl)) return match;
    const rewritten = rewriteBlockedEducationalLink(cleanUrl);
    if (rewritten !== cleanUrl) {
      return `[${label}](${rewritten})`;
    }
    return label;
  });

  out = out.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (match, prefix: string, rawUrl: string) => {
    const trailingMatch = rawUrl.match(/[.,;:!?)]+$/);
    const trailing = trailingMatch?.[0] ?? "";
    const cleanUrl = trailing ? rawUrl.slice(0, -trailing.length) : rawUrl;
    if (isAllowedEducationalEmailLink(cleanUrl)) return match;
    const rewritten = rewriteBlockedEducationalLink(cleanUrl);
    if (rewritten !== cleanUrl) {
      return `${prefix}${rewritten}${trailing}`;
    }
    return prefix;
  });

  return out;
}

/** Rewrite blocked hrefs in rendered email HTML (safety net after markdown). */
export function sanitizeEmailHtmlLinks(
  html: string,
  options?: { fallbackUrl?: string },
): string {
  const fallback = options?.fallbackUrl ?? MEDICARE_PLAN_COMPARE_URL;

  return html.replace(
    /<a\b([^>]*?)\bhref="([^"]+)"([^>]*)>/gi,
    (match, before: string, href: string, after: string) => {
      if (isAllowedEducationalEmailLink(href)) return match;
      const rewritten = rewriteBlockedEducationalLink(href);
      const safeHref = rewritten !== href ? rewritten : fallback;
      return `<a${before}href="${safeHref}"${after}>`;
    },
  );
}

/** Suggested copy when referring users to official plan tools (avoids vague "Plan Finder"). */
export const OFFICIAL_PLAN_COMPARE_LINK_MARKDOWN = `[Medicare.gov plan compare](${MEDICARE_PLAN_COMPARE_URL})`;

export const OFFICIAL_MEDICARE_HOME_MARKDOWN = `[Medicare.gov](${MEDICARE_GOV_URL})`;
