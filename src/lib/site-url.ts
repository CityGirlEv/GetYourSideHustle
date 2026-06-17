import { getEnvVariable } from "@/lib/env";

const DEFAULT_SITE_URL = "https://mypartb.com";

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
