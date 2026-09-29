/** Live GYSH merch on SnatchVault. Starter complimentary pick: 1 hat or 1 tee. */
export const GYSH_GEAR_COLLECTION_URL = "https://snatchvault.com/collections/gysh-gear";
export const GYSH_FAMILY_DISCOUNT_CODE = "GYSHFamily";
export const GYSH_FAMILY_DISCOUNT_PERCENT = 100;

export function gyshFamilyCheckoutInstructions(itemCount: 1 | 2 = 1): string {
  const pick =
    itemCount === 2
      ? "pick 2 hats and/or tees (mix and match)"
      : "pick either 1 hat or 1 tee";
  return `${pick}. At checkout, enter discount code ${GYSH_FAMILY_DISCOUNT_CODE} for ${GYSH_FAMILY_DISCOUNT_PERCENT}% off.`;
}

/** Stored Admin merch email still pointed at the in-app size picker. */
export function isLegacyMerchDashboardClaimUrl(url: string): boolean {
  return /my-dashboard#merch/i.test(String(url || ""));
}

/** Stored Admin merch email still asked members to pick size in the dashboard. */
export function isLegacyMerchReadyBody(bodyHtml: string): boolean {
  const body = String(bodyHtml || "");
  return (
    /upgraded without choosing/i.test(body) ||
    /Choose my GYSH gear/i.test(body) ||
    /pick your size/i.test(body) ||
    /my-dashboard#merch/i.test(body)
  );
}
