/**
 * Video Scene Production Wizard (VSPW) — Pro / Elite member tool.
 * Production stays "Coming soon" while the wizard is built locally.
 */
import type { TierId } from "./membership";
import { normalizeTierId } from "./member-credits";

export const VSPW_PRODUCT_NAME = "Video Scene Production Wizard";
export const VSPW_SHORT_NAME = "VSPW";
export const VSPW_MIN_TIER: TierId = "pro";

/** Pro and Elite (admins always). */
export function canAccessVspw(
  tier: string | null | undefined,
  opts?: { isAdmin?: boolean },
): boolean {
  if (opts?.isAdmin) return true;
  const id = normalizeTierId(tier);
  return id === "pro" || id === "elite";
}

/**
 * Deployed builds show Coming Soon.
 * Local Vite (`import.meta.env.DEV`) unlocks the WIP shell for build/test.
 */
export function vspwIsComingSoon(isDev: boolean = Boolean(import.meta.env.DEV)): boolean {
  return !isDev;
}

export function vspwStatusLabel(isDev: boolean = Boolean(import.meta.env.DEV)): string {
  return vspwIsComingSoon(isDev) ? "Coming soon" : "Local build — under construction";
}

export function vspwMemberBlurb(): string {
  return `${VSPW_PRODUCT_NAME} helps Pro and Elite members craft scene dialogue, wardrobe continuity, and production packets — without rebuilding the whole shoot for a one-line change.`;
}
