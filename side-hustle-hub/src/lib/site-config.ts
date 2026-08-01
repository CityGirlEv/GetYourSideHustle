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
  "Start on your own or with family. Age-ready Match Wizards and calculators for kids through seniors—so you validate the idea and estimate profit before you spend.";

/** Branded evaluation method (Foresight differentiation). */
export const GYSH_METHOD_NAME = "Margin Match";

/** Homepage H1 outcome line — brand stays in the title markup. */
export const HOME_HEADLINE_OUTCOME =
  "Find and launch a side hustle—whether you're building as a family or going solo. We Got You!";

/** Short CTA expectation near primary join control. */
export const HOME_CTA_EXPECTATION =
  "Start free — explore tools and join in under 2 minutes. Free tools today; optional membership unlocks deeper guides and community.";

/** Contrast / differentiator line vs generic idea lists. */
export const HOME_DIFFERENTIATOR =
  `Unlike generic idea lists, ${SITE_NAME} pairs every hustle with calculators and community guidance through ${GYSH_METHOD_NAME} — so you evaluate before you spend.`;

export const HOME_ICP = [
  {
    id: "kids",
    label: "Kids (4–12) & parents",
    problem: "Need safe first hustles with a GYSH Coach nearby — not random online gigs.",
  },
  {
    id: "teens",
    label: "Teens (13–17)",
    problem: "Want real skills and pocket money with clear boundaries and parent-aware tools.",
  },
  {
    id: "adults",
    label: "Adults & first-time solopreneurs",
    problem: "Tired of guesswork — need ranked matches plus margin math before quitting nights and weekends.",
  },
] as const;

export const HOME_FAQ = [
  {
    q: "How do the calculators help me avoid bad side hustle ideas?",
    a: `${GYSH_METHOD_NAME} walks your idea through costs, pricing, and time so you can see profit potential before you buy inventory, ads, or equipment.`,
  },
  {
    q: "Is GYSH free to start?",
    a: "Yes. Match Wizards, free guides, and core calculators are available without paying. Optional membership unlocks deeper launch guides, progress tracking, and community access.",
  },
  {
    q: "Who is Get Your Side Hustle for?",
    a: "Anyone ready to start—solo or with family. Kids and teens with a coach, adults validating ideas, and seniors seeking flexible second-act income. Veterans paths are coming soon.",
  },
  {
    q: "What makes GYSH different from idea lists?",
    a: HOME_DIFFERENTIATOR,
  },
] as const;

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
