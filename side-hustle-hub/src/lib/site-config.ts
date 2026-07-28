/** Standalone project: GetYourSideHustle.com */

export const ROOT_DOMAIN = "getyoursidehustle.com";
export const SITE_NAME = "Get Your Side Hustle";
export const SITE_SLUG = "getyoursidehustle";
export const ADMIN_EMAIL = `info@${ROOT_DOMAIN}`;
/** Official GYSH Facebook page */
export const FACEBOOK_URL = "https://www.facebook.com/getyoursidehustleofficial";
export const FACEBOOK_HANDLE = "@getyoursidehustle";

/** One-line site purpose for home and social CTAs */
export const SITE_PURPOSE =
  "Get Your Side Hustle helps families — kids, teens, adults, and seniors — find safe, age-appropriate Side Hustles, and take the next learning and earning step together.";

/** Resend verified sending host (DNS required). Prefer notify subdomain like Munties. */
export const EMAIL_SENDER_DOMAIN = ROOT_DOMAIN;
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

/** Open Graph / social share image (logo on branded card). */
export const SHARE_IMAGE_URL = `${PRODUCTION_SITE_URL}/brand/gysh-og-share.png`;
export const SHARE_LOGO_URL = `${PRODUCTION_SITE_URL}/brand/gysh-logo-rocket.png`;
