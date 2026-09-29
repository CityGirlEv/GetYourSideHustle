import { describe, expect, it } from "vitest";
import {
  membershipPerkTitles,
  membershipTierDisplayName,
  membershipTierPriceLabel,
  merchCompareCell,
  merchEmailVars,
  merchItemPhrase,
  merchPerkForTier,
} from "../membership-email-copy";
import {
  MEMBERSHIP_COMPARE_ROWS,
  MEMBERSHIP_TIERS,
  MERCH_PRO_PERK,
  MERCH_STARTER_PERK,
  merchItemCount,
  numberedTierPerks,
} from "../membership";
import { GYSH_FAMILY_DISCOUNT_CODE } from "../gysh-gear-store";

describe("membership-email-copy", () => {
  it("uses membership page names, prices, and perk titles", () => {
    for (const tier of MEMBERSHIP_TIERS) {
      expect(membershipTierDisplayName(tier.id)).toBe(tier.name);
      expect(membershipPerkTitles(tier.id, "adult")).toEqual(
        numberedTierPerks(tier.id, "adult").map((perk) => perk.title),
      );
    }
    expect(membershipTierPriceLabel("starter")).toBe("$39/mo");
    expect(membershipTierPriceLabel("pro")).toBe("$69/mo");
    expect(membershipTierPriceLabel("elite")).toBe("$119/mo");
    expect(membershipTierPriceLabel("free")).toBe("$0");
  });

  it("matches membership-page merch counts for Starter vs Pro/Elite", () => {
    const merchRow = MEMBERSHIP_COMPARE_ROWS.find((row) => row.id === "merch");
    expect(merchCompareCell("starter")).toBe(merchRow?.cells.starter);
    expect(merchCompareCell("pro")).toBe(merchRow?.cells.pro);
    expect(merchCompareCell("elite")).toBe(merchRow?.cells.elite);
    expect(merchItemCount("starter")).toBe(1);
    expect(merchItemCount("pro")).toBe(2);
    expect(merchPerkForTier("starter")).toEqual(MERCH_STARTER_PERK);
    expect(merchPerkForTier("pro")).toEqual(MERCH_PRO_PERK);
    expect(merchPerkForTier("free")).toBeNull();

    const starter = merchEmailVars("starter");
    expect(starter.tier).toBe("Starter");
    expect(starter.merchCount).toBe("1");
    expect(starter.merchPerkTitle).toBe(MERCH_STARTER_PERK.title);
    expect(starter.merchPerkDetail).toBe(MERCH_STARTER_PERK.detail);
    expect(starter.merchItemPhrase).toBe(merchItemPhrase(1));
    expect(starter.merchCheckoutCode).toBe(GYSH_FAMILY_DISCOUNT_CODE);
    expect(starter.tier).not.toBe("Free");

    const pro = merchEmailVars("pro");
    expect(pro.tier).toBe("Pro");
    expect(pro.merchCount).toBe("2");
    expect(pro.merchPerkTitle).toBe(MERCH_PRO_PERK.title);
    expect(pro.merchItemPhrase).toBe(merchItemPhrase(2));
  });
});
