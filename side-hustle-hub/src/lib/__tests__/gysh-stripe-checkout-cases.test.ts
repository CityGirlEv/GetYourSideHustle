import { describe, expect, it } from "vitest";
import { suggestedSprintForTest } from "../gysh-sprint-board";
import {
  ALA_CARTE_PRICE_LIST,
  CREDIT_PACKS,
} from "../membership";
import {
  STRIPE_CHECKOUT_CASES,
  STRIPE_CHECKOUT_SPRINT,
  STRIPE_FREE_NO_CHECKOUT_CASE,
  STRIPE_MEMBERSHIP_CHECKOUT_MATRIX,
  isStripeCheckoutCaseId,
  needsStripeCheckoutPlacementHeal,
  stripeAlaCarteCaseId,
  stripeCreditPackCaseId,
  stripeMembershipCaseId,
} from "../gysh-stripe-checkout-cases";
import { TEST_CASES } from "../gysh-test-plan";
import { membershipStripePrice } from "../stripe-catalog";

describe("stripe checkout QA cases", () => {
  it("covers every paid Adult/Senior membership Stripe price (month + year)", () => {
    expect(STRIPE_MEMBERSHIP_CHECKOUT_MATRIX).toHaveLength(12);
    for (const row of STRIPE_MEMBERSHIP_CHECKOUT_MATRIX) {
      const price = membershipStripePrice(row.tierId, row.audience, row.interval);
      expect(price?.priceId).toMatch(/^price_/);
      const id = stripeMembershipCaseId(row.tierId, row.audience, row.interval);
      const c = STRIPE_CHECKOUT_CASES.find((x) => x.id === id);
      expect(c).toBeTruthy();
      expect(c!.assignees).toEqual([]);
      expect(suggestedSprintForTest(c!)).toBe(STRIPE_CHECKOUT_SPRINT);
    }
  });

  it("covers every a-la-carte SKU and credit pack", () => {
    expect(ALA_CARTE_PRICE_LIST.length).toBeGreaterThanOrEqual(9);
    expect(CREDIT_PACKS.length).toBe(4);
    for (const item of ALA_CARTE_PRICE_LIST) {
      const id = stripeAlaCarteCaseId(item.id);
      expect(STRIPE_CHECKOUT_CASES.some((c) => c.id === id)).toBe(true);
    }
    for (const pack of CREDIT_PACKS) {
      const id = stripeCreditPackCaseId(pack.id);
      expect(STRIPE_CHECKOUT_CASES.some((c) => c.id === id)).toBe(true);
    }
  });

  it("includes Free Adult no-checkout coverage and wires into TEST_CASES", () => {
    expect(STRIPE_FREE_NO_CHECKOUT_CASE.assignees).toEqual([]);
    expect(isStripeCheckoutCaseId(STRIPE_FREE_NO_CHECKOUT_CASE.id)).toBe(true);
    const ids = new Set(TEST_CASES.map((t) => t.id));
    for (const c of STRIPE_CHECKOUT_CASES) {
      expect(ids.has(c.id)).toBe(true);
      expect(c.assignees).toEqual([]);
      expect(c.suite).toBe("manual");
      expect(suggestedSprintForTest(c)).toBe(4);
    }
    expect(STRIPE_CHECKOUT_CASES.length).toBe(
      STRIPE_MEMBERSHIP_CHECKOUT_MATRIX.length + 1 + ALA_CARTE_PRICE_LIST.length + CREDIT_PACKS.length,
    );
  });

  it("does not heal placement for graded cases", () => {
    expect(
      needsStripeCheckoutPlacementHeal({
        status: "fail",
        sprint: 3,
        due: "08/01/26",
        assignee: "evelyn",
        wantDue: "08/25/26",
      }),
    ).toBe(false);
    expect(
      needsStripeCheckoutPlacementHeal({
        status: "not_run",
        sprint: 3,
        due: "08/01/26",
        assignee: "evelyn",
        wantDue: "08/25/26",
      }),
    ).toBe(true);
  });

  it("does not heal solely because an admin assigned a QA owner", () => {
    expect(
      needsStripeCheckoutPlacementHeal({
        status: "not_run",
        sprint: STRIPE_CHECKOUT_SPRINT,
        due: "08/25/26",
        assignee: "tina",
        wantDue: "08/25/26",
      }),
    ).toBe(false);
    expect(
      needsStripeCheckoutPlacementHeal({
        status: "not_run",
        sprint: STRIPE_CHECKOUT_SPRINT,
        due: "08/25/26",
        assignee: "",
        wantDue: "08/25/26",
      }),
    ).toBe(false);
  });
});
