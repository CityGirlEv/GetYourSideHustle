/**
 * Path-based deep links for GYSH pages.
 * Cloudflare Pages SPA fallback serves index.html for these paths.
 */

import { PRODUCTION_SITE_URL, siteUrl } from "./site-config";

export type AppRouteView =
  | "dashboard"
  | "quiz"
  | "calculators"
  | "guides"
  | "checklist"
  | "community"
  | "newsletter"
  | "workshops"
  | "kids"
  | "seniors"
  | "login"
  | "user_portal"
  | "admin"
  | "about"
  | "contact"
  | "privacy"
  | "beta_nda"
  | "beta_testing"
  | "join"
  | "membership_signup";

/** Canonical path for each main page (no trailing slash except home). */
export const VIEW_PATH: Record<AppRouteView, string> = {
  dashboard: "/",
  quiz: "/match",
  calculators: "/calculators",
  guides: "/guides",
  checklist: "/checklist",
  community: "/community",
  newsletter: "/newsletter",
  workshops: "/workshops",
  kids: "/kids",
  seniors: "/seniors",
  login: "/login",
  user_portal: "/my-dashboard",
  admin: "/admin",
  about: "/about",
  contact: "/contact",
  privacy: "/privacy",
  beta_nda: "/beta-nda",
  beta_testing: "/beta-testing",
  join: "/join",
  membership_signup: "/membership",
};

const PATH_ALIASES: Record<string, AppRouteView> = {
  "/": "dashboard",
  "/home": "dashboard",
  "/match": "quiz",
  "/quiz": "quiz",
  "/find-my-hustle": "quiz",
  "/calculators": "calculators",
  "/guides": "guides",
  "/checklist": "checklist",
  "/community": "community",
  "/newsletter": "newsletter",
  "/newsletters": "newsletter",
  "/workshops": "workshops",
  "/kids": "kids",
  "/seniors": "seniors",
  "/login": "login",
  "/sign-in": "login",
  "/signin": "login",
  "/my-dashboard": "user_portal",
  "/portal": "user_portal",
  "/dashboard": "user_portal",
  "/admin": "admin",
  "/about": "about",
  "/contact": "contact",
  "/privacy": "privacy",
  "/privacy-policy": "privacy",
  "/beta-nda": "beta_nda",
  "/beta-tester-nda": "beta_nda",
  "/beta-testing": "beta_testing",
  "/beta-tester": "beta_testing",
  "/join": "join",
  "/membership": "membership_signup",
  "/membership-signup": "membership_signup",
};

export type GuideManualSlug = "adult" | "kids" | "teens" | "seniors" | "master";

const GUIDE_MANUAL_SLUGS = new Set<string>(["adult", "kids", "teens", "seniors", "master"]);

export type ParsedAppRoute = {
  view: AppRouteView;
  guidesManualId?: GuideManualSlug | null;
};

/** Normalize pathname: lowercase, no trailing slash (except root). */
export function normalizePath(pathname: string): string {
  let p = (pathname || "/").split("?")[0].split("#")[0];
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p.toLowerCase() || "/";
}

export function parseAppRoute(pathname: string = typeof window !== "undefined" ? window.location.pathname : "/"): ParsedAppRoute {
  const path = normalizePath(pathname);

  // /consent/<token> — parent approval deep link (handled in App via readConsentTokenFromUrl)
  if (/^\/consent\/[a-f0-9]+$/.test(path)) {
    return { view: "dashboard", guidesManualId: null };
  }

  // /guides/adult | /guides/kids | …
  const guidesMatch = path.match(/^\/guides\/([a-z]+)$/);
  if (guidesMatch && GUIDE_MANUAL_SLUGS.has(guidesMatch[1])) {
    return { view: "guides", guidesManualId: guidesMatch[1] as GuideManualSlug };
  }

  const view = PATH_ALIASES[path];
  if (view) return { view, guidesManualId: null };

  return { view: "dashboard", guidesManualId: null };
}

export function pathForView(
  view: AppRouteView,
  opts?: { guidesManualId?: GuideManualSlug | string | null },
): string {
  if (view === "guides" && opts?.guidesManualId && GUIDE_MANUAL_SLUGS.has(opts.guidesManualId)) {
    return `/guides/${opts.guidesManualId}`;
  }
  return VIEW_PATH[view] ?? "/";
}

/** Absolute shareable URL for a page. */
export function pageUrl(
  view: AppRouteView,
  opts?: { guidesManualId?: GuideManualSlug | string | null; origin?: string },
): string {
  const origin = (opts?.origin ?? siteUrl()).replace(/\/$/, "");
  const path = pathForView(view, opts);
  return path === "/" ? `${origin}/` : `${origin}${path}`;
}

/** Stable production share image (1200×630) with the GYSH logo. */
export const OG_IMAGE_PATH = "/brand/gysh-og-share.png";
export const OG_IMAGE_URL = `${PRODUCTION_SITE_URL}${OG_IMAGE_PATH}`;

export function titleForView(view: AppRouteView, pageTitle?: string): string {
  if (pageTitle?.trim()) return `${pageTitle.trim()} | Get Your Side Hustle`;
  const labels: Record<AppRouteView, string> = {
    dashboard: "Get Your Side Hustle",
    quiz: "GYSH Match Wizard",
    calculators: "GYSH Profit Estimator",
    guides: "GYSH Guides",
    checklist: "GYSH Side Hustle Guide",
    community: "GYSH Community",
    newsletter: "GYSH Newsletter",
    workshops: "GYSH Workshops",
    kids: "GYSH Kids & Teens Corner",
    seniors: "GYSH Seniors Corner",
    login: "Sign In",
    user_portal: "My Dashboard",
    admin: "Admin Studio",
    about: "About GYSH",
    contact: "Contact Us",
    privacy: "Privacy Policy",
    beta_nda: "Beta Tester NDA",
    beta_testing: "Beta Tester Dashboard",
    join: "Join GYSH",
    membership_signup: "Membership Sign-up",
  };
  const label = labels[view] ?? "Get Your Side Hustle";
  return view === "dashboard" ? `${label} — Learn, Calculate, and Connect` : `${label} | Get Your Side Hustle`;
}

/**
 * Update the browser URL to match the active view without a full reload.
 * Preserves reset/consent/ref query params; drops legacy next=join once routed.
 */
export function syncUrlToView(
  view: AppRouteView,
  opts?: { guidesManualId?: GuideManualSlug | string | null; replace?: boolean },
): void {
  if (typeof window === "undefined") return;
  const desiredPath = pathForView(view, opts);
  const params = new URLSearchParams(window.location.search);
  // Legacy deep link — path is canonical now
  if (params.get("next") === "join") {
    params.delete("next");
    params.delete("from");
    params.delete("tier");
    // keep audience if present for join page consumers
  }
  const qs = params.toString();
  const hash = window.location.hash || "";
  const nextUrl = `${desiredPath}${qs ? `?${qs}` : ""}${hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (current === nextUrl) return;
  if (opts?.replace) {
    window.history.replaceState({ view }, "", nextUrl);
  } else {
    window.history.pushState({ view }, "", nextUrl);
  }
}
