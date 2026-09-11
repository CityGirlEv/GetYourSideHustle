import { describe, expect, it } from "vitest";
import {
  alacarteCreditPrice,
  audiencePaysMembershipWithCredits,
  cartCreditCost,
  membershipPlanRequiresCreditCheckout,
  membershipUpgradeCreditCost,
  clampCreditsByItem,
  clampCreditsToApply,
  mixedCheckoutButtonLabel,
  parseCreditSpendRequest,
  quoteCreditPurchase,
  quoteMixedCartPayment,
  quoteMixedUsdPayment,
  creditApplyView,
  lineCreditNeed,
  maxCreditsForLine,
  creditsByItemFromTotal,
  suggestedCreditPack,
  type MixedCartLine,
} from "../credit-checkout";

describe("credit checkout", () => {
  it("bills Kids/Teens memberships in credits and Adults in Stripe", () => {
    expect(audiencePaysMembershipWithCredits("kids")).toBe(true);
    expect(audiencePaysMembershipWithCredits("junior")).toBe(true);
    expect(audiencePaysMembershipWithCredits("adult")).toBe(false);
    expect(membershipPlanRequiresCreditCheckout("kids", "starter")).toBe(true);
    expect(membershipPlanRequiresCreditCheckout("kids", "free")).toBe(false);
    expect(membershipPlanRequiresCreditCheckout("adult", "starter")).toBe(false);
  });

  it("charges the membership credit difference so an upgrade is not free", () => {
    expect(membershipUpgradeCreditCost("free", "starter", "kids")).toBe(39);
    expect(membershipUpgradeCreditCost("starter", "pro", "kids")).toBe(30);
    expect(membershipUpgradeCreditCost("starter", "starter", "kids")).toBe(0);
    expect(membershipUpgradeCreditCost("free", "starter", "adult")).toBe(0);
  });

  it("prices a-la-carte items dollar-for-dollar in Kid Credits", () => {
    expect(alacarteCreditPrice("story-time", 1)).toBe(15);
    expect(alacarteCreditPrice("consult-30", 2)).toBe(90);
    expect(alacarteCreditPrice("workshop-general")).toBe(40);
    expect(alacarteCreditPrice("boost")).toBeNull();
  });

  it("quotes shortfall and suggests the smallest covering pack", () => {
    const quote = quoteCreditPurchase({ label: "Starter", costCredits: 39, balance: 25 });
    expect(quote.canAfford).toBe(false);
    expect(quote.shortfall).toBe(14);
    expect(quote.suggestedPack?.id).toBe("launcher");
    expect(suggestedCreditPack(5)?.id).toBe("boost");
    expect(quoteCreditPurchase({ label: "Story Time", costCredits: 15, balance: 15 }).canAfford).toBe(
      true,
    );
  });

  it("spends only credit-priced cart lines and skips credit packs", () => {
    const cart = cartCreditCost([
      { itemId: "story-time", quantity: 1 },
      { itemId: "boost", quantity: 1 },
    ]);
    expect(cart.costCredits).toBe(15);
    expect(cart.spendable.map((r) => r.itemId)).toEqual(["story-time"]);
    expect(cart.skipped).toContain("boost");
  });

  it("applies Kid Credits against cart dollars and leaves remaining cash", () => {
    const story: MixedCartLine = {
      itemId: "story-time",
      name: "Story Time",
      quantity: 1,
      priceUsd: 15,
      kind: "alacarte",
      credits: 15,
    };
    const full = quoteMixedCartPayment({ lines: [story], balance: 41, creditsToApply: 15 });
    expect(full.creditsApplied).toBe(15);
    expect(full.cashDueCents).toBe(0);
    expect(full.fullyCoveredByCredits).toBe(true);

    const half = quoteMixedCartPayment({ lines: [story], balance: 10, creditsToApply: 10 });
    expect(half.creditsApplied).toBe(10);
    expect(half.cashDueUsd).toBe(5);
    expect(half.creditValueUsd).toBe(10);

    const withPack = quoteMixedCartPayment({
      lines: [
        story,
        { itemId: "boost", name: "Boost Pack", quantity: 1, priceUsd: 5, kind: "credit_pack" },
      ],
      balance: 15,
      creditsToApply: 15,
    });
    expect(withPack.cashDueUsd).toBe(5);
    expect(withPack.packUsd).toBe(5);

    const workshop = quoteMixedCartPayment({
      lines: [
        {
          itemId: "workshop-general",
          name: "Workshops (Starter & Above Workshops Free)",
          quantity: 1,
          priceUsd: 40,
          kind: "alacarte",
        },
      ],
      balance: 25,
      creditsToApply: 25,
    });
    expect(workshop.creditValueUsd).toBe(25);
    expect(workshop.cashDueUsd).toBe(15);

    expect(clampCreditsToApply(99, 12)).toBe(12);
    expect(quoteMixedUsdPayment({ amountUsd: 39, balance: 25, creditsToApply: 25 }).cashDueUsd).toBe(
      14,
    );
    expect(mixedCheckoutButtonLabel(half)).toMatch(/\$5/);
    const payWithCredits = quoteMixedCartPayment({
      lines: [story],
      balance: 145,
      creditsToApply: 15,
    });
    expect(payWithCredits.creditsAvailable).toBe(145);
    expect(payWithCredits.fullyCoveredByCredits).toBe(true);
    expect(mixedCheckoutButtonLabel(payWithCredits)).toBe("Pay 15 credits");
  });

  it("clamps per-item credit qty to line cost and remaining balance", () => {
    const workshop: MixedCartLine = {
      itemId: "workshop-general",
      name: "Workshop",
      quantity: 1,
      priceUsd: 40,
      kind: "alacarte",
      credits: 40,
    };
    const consult: MixedCartLine = {
      itemId: "consult-30",
      name: "1-on-1",
      quantity: 1,
      priceUsd: 75,
      kind: "alacarte",
      credits: 75,
    };
    expect(lineCreditNeed(workshop)).toBe(40);
    expect(lineCreditNeed({ ...workshop, kind: "credit_pack" })).toBe(0);
    expect(
      clampCreditsByItem([workshop, consult], 50, {
        "workshop-general": 40,
        "consult-30": 75,
      }),
    ).toEqual({ "workshop-general": 40, "consult-30": 10 });
    expect(maxCreditsForLine([workshop, consult], 50, { "workshop-general": 40 }, "consult-30")).toBe(
      10,
    );
    expect(creditsByItemFromTotal([workshop, consult], 50, 50)).toEqual({
      "workshop-general": 40,
      "consult-30": 10,
    });
  });

  it("parses spend requests and rejects Stripe-only memberships", () => {
    expect(parseCreditSpendRequest({ kind: "membership", tier: "starter", audience: "kids" })).toEqual({
      ok: true,
      request: { kind: "membership", tier: "starter", audience: "kids" },
    });
    expect(parseCreditSpendRequest({ kind: "membership", tier: "starter", audience: "adult" }).ok).toBe(
      false,
    );
    expect(parseCreditSpendRequest({ kind: "alacarte", itemId: "story-time" })).toMatchObject({
      ok: true,
      request: { kind: "alacarte", itemId: "story-time", quantity: 1 },
    });
    expect(parseCreditSpendRequest({ kind: "alacarte", itemId: "zip-timing" })).toMatchObject({
      ok: true,
      request: { kind: "alacarte", itemId: "zip-timing", quantity: 1 },
    });
  });

  it("does not treat a loading credit balance as zero", () => {
    expect(
      creditApplyView({
        signedIn: true,
        loading: true,
        creditsAvailable: 0,
        creditsMax: 0,
        cartItemCount: 1,
      }),
    ).toBe("loading");
    expect(
      creditApplyView({
        signedIn: true,
        loading: false,
        creditsAvailable: 145,
        creditsMax: 40,
        cartItemCount: 1,
      }),
    ).toBe("ready");
    expect(
      creditApplyView({
        signedIn: true,
        loading: false,
        creditsAvailable: 145,
        creditsMax: 0,
        cartItemCount: 0,
      }),
    ).toBe("empty-cart");
  });
});
