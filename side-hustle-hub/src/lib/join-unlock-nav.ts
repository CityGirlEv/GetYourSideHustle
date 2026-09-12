import type { TierId } from "./membership";

/**
 * Nav options for library "Upgrade to Unlock" / "Join to Unlock".
 * Always open Membership plans; focus the required paid tier's Upgrade/Choose button.
 */
export function joinUnlockNavOpts(
  focusTier: TierId | null | undefined,
): { scrollToPlans: true; focusTier?: TierId } {
  const tier = focusTier && focusTier !== "free" ? focusTier : undefined;
  return tier
    ? { scrollToPlans: true, focusTier: tier }
    : { scrollToPlans: true };
}
