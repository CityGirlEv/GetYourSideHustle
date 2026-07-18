import { getEnvVariable } from "@/lib/env";

const DEFAULT_SITE_URL = "https://www.mypartb.com";

/** Production origin for links pasted on Facebook, email, etc. — never localhost. */
export const PRODUCTION_SITE_ORIGIN = DEFAULT_SITE_URL;

/** Readable website shown under logos on PDFs, emails, and printables. */
export const PUBLIC_WEBSITE_HOST = "MyPartB.com";

export function productionShareUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${PRODUCTION_SITE_ORIGIN}${normalized}`;
}

/** Public site origin used for canonical URLs, PDF links, and email merge fields. */
export function publicSiteUrl(): string {
  const url = (
    getEnvVariable("PUBLIC_SITE_URL") ??
    getEnvVariable("SITE_ORIGIN") ??
    DEFAULT_SITE_URL
  ).replace(/\/$/, "");

  // Enforce secure https protocol unless running on a local development server
  if (url.startsWith("http://") && !url.includes("localhost") && !url.includes("127.0.0.1")) {
    return url.replace("http://", "https://");
  }
  return url;
}

export function canonicalUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${publicSiteUrl()}${normalized}`;
}

export function ogImageUrl(): string {
  return `${publicSiteUrl()}/email-header-logo.png`;
}
