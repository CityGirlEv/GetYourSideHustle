import { getEnvVariable } from "@/lib/env";

const DEFAULT_SITE_URL = "https://mypartb.com";

/** Public site origin used for canonical URLs, PDF links, and email merge fields. */
export function publicSiteUrl(): string {
  return (
    getEnvVariable("PUBLIC_SITE_URL") ??
    getEnvVariable("SITE_ORIGIN") ??
    DEFAULT_SITE_URL
  ).replace(/\/$/, "");
}

export function canonicalUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${publicSiteUrl()}${normalized}`;
}

export function ogImageUrl(): string {
  return `${publicSiteUrl()}/email-header-logo.png`;
}
