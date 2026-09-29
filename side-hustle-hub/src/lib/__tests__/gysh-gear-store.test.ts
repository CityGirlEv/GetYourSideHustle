import { describe, expect, it } from "vitest";
import {
  GYSH_FAMILY_DISCOUNT_CODE,
  GYSH_FAMILY_DISCOUNT_PERCENT,
  GYSH_GEAR_COLLECTION_URL,
  gyshFamilyCheckoutInstructions,
  isLegacyMerchDashboardClaimUrl,
  isLegacyMerchReadyBody,
} from "../gysh-gear-store";

describe("gysh-gear-store", () => {
  it("points complimentary Starter merch at SnatchVault with GYSHFamily 100% off", () => {
    expect(GYSH_GEAR_COLLECTION_URL).toBe("https://snatchvault.com/collections/gysh-gear");
    expect(GYSH_FAMILY_DISCOUNT_CODE).toBe("GYSHFamily");
    expect(GYSH_FAMILY_DISCOUNT_PERCENT).toBe(100);
    expect(gyshFamilyCheckoutInstructions()).toMatch(/1 hat or 1 tee/i);
    expect(gyshFamilyCheckoutInstructions(2)).toMatch(/2 hats and\/or tees/i);
    expect(gyshFamilyCheckoutInstructions()).toContain(GYSH_FAMILY_DISCOUNT_CODE);
    expect(gyshFamilyCheckoutInstructions()).toContain("100% off");
  });

  it("detects the old dashboard merch-claim email", () => {
    expect(isLegacyMerchDashboardClaimUrl("https://getyoursidehustle.com/my-dashboard#merch")).toBe(
      true,
    );
    expect(isLegacyMerchDashboardClaimUrl(GYSH_GEAR_COLLECTION_URL)).toBe(false);
    expect(isLegacyMerchReadyBody("If you were upgraded without choosing, pick a size.")).toBe(true);
    expect(isLegacyMerchReadyBody("Choose my GYSH gear")).toBe(true);
    expect(isLegacyMerchReadyBody("Enter GYSHFamily at checkout.")).toBe(false);
    expect(
      isLegacyMerchReadyBody("Your plan includes {{merchPerkTitle}} — that's {{merchItemPhrase}}."),
    ).toBe(false);
  });
});
