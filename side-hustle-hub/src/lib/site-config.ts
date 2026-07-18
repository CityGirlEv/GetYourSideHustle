/** Standalone project: GetYourSideHustle.com */

export const ROOT_DOMAIN = "getyoursidehustle.com";
export const SITE_NAME = "Get Your Side Hustle";
export const SITE_SLUG = "getyoursidehustle";
export const ADMIN_EMAIL = `info@${ROOT_DOMAIN}`;

/** Resend verified sending host (DNS required). Prefer notify subdomain like Munties. */
export const EMAIL_SENDER_DOMAIN = `notify.${ROOT_DOMAIN}`;
export const EMAIL_FROM_DOMAIN = ROOT_DOMAIN;

export const CLOUDFLARE_PAGES_PROJECT = SITE_SLUG;
export const PRODUCTION_SITE_URL = `https://${ROOT_DOMAIN}`;
export const LOCAL_DEV_SITE_URL = "http://localhost:5173";

/** Canonical public site URL (no trailing slash). */
export function siteUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return (
    import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") ||
    PRODUCTION_SITE_URL
  );
}
