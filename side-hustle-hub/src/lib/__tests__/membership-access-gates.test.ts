import { describe, expect, it } from "vitest";
import { canAccessPnl, canAccessScheduleSuite } from "../hustle-schedule";
import {
  MEMBERSHIP_FEATURES,
  MEMBERSHIP_TIERS,
  canAccessCommunity,
  canAccessMemberGuides,
  canAccessNewsletter,
  featuresForTier,
  tierHasFeature,
  type TierId,
} from "../membership";
import { monthlyKidCreditAllowance } from "../member-credits";
import { buildMemberAccessSummary } from "../member-purchases";
import { supportsMembershipStripeCheckout } from "../stripe-checkout";

const TIERS: TierId[] = ["free", "starter", "pro", "elite"];

describe("membership access gatekeeping", () => {
  it("keeps schedule suite locked until Pro (admins bypass)", () => {
    expect(canAccessScheduleSuite("free")).toBe(false);
    expect(canAccessScheduleSuite("starter")).toBe(false);
    expect(canAccessScheduleSuite("pro")).toBe(true);
    expect(canAccessScheduleSuite("elite")).toBe(true);
    expect(canAccessScheduleSuite("free", { isAdmin: true })).toBe(true);
  });

  it("does not expose Pro suite features on Free or Starter", () => {
    for (const featureId of ["schedule", "tracker", "progress", "email", "pnl"] as const) {
      expect(tierHasFeature("free", featureId)).toBe(false);
      expect(tierHasFeature("starter", featureId)).toBe(false);
      expect(tierHasFeature("pro", featureId)).toBe(true);
      expect(tierHasFeature("elite", featureId)).toBe(true);
    }
  });

  it("gates full member guides behind paid plans", () => {
    expect(tierHasFeature("free", "member_guides")).toBe(false);
    expect(tierHasFeature("starter", "member_guides")).toBe(true);
    expect(tierHasFeature("pro", "member_guides")).toBe(true);
    expect(tierHasFeature("elite", "member_guides")).toBe(true);
  });

  it("gates the bi-weekly newsletter behind Starter & Above (admins bypass)", () => {
    expect(tierHasFeature("free", "newsletter")).toBe(false);
    expect(tierHasFeature("starter", "newsletter")).toBe(true);
    expect(tierHasFeature("pro", "newsletter")).toBe(true);
    expect(tierHasFeature("elite", "newsletter")).toBe(true);
    expect(canAccessNewsletter("free")).toBe(false);
    expect(canAccessNewsletter("starter")).toBe(true);
  });

  it("gates community and paid member guides behind Starter — not Free, not team join", () => {
    expect(canAccessCommunity("free")).toBe(false);
    expect(canAccessCommunity("starter")).toBe(true);
    expect(canAccessCommunity("pro")).toBe(true);
    expect(canAccessMemberGuides("free")).toBe(false);
    expect(canAccessMemberGuides("starter")).toBe(true);
  });

  it("keeps P&L on Pro/Elite only (Starter is paid but does not include it)", () => {
    expect(canAccessPnl("free")).toBe(false);
    expect(canAccessPnl("starter")).toBe(false);
    expect(canAccessPnl("pro")).toBe(true);
    expect(canAccessPnl("elite")).toBe(true);
  });

  it("featuresForTier never returns features outside the tier ladder", () => {
    for (const tierId of TIERS) {
      const allowed = new Set(MEMBERSHIP_TIERS.find((t) => t.id === tierId)?.featureIds ?? []);
      for (const feature of featuresForTier(tierId)) {
        expect(allowed.has(feature.id)).toBe(true);
      }
      // Unknown / catalog features must not leak onto free
      if (tierId === "free") {
        expect(featuresForTier(tierId).some((f) => f.id === "schedule")).toBe(false);
        expect(featuresForTier(tierId).some((f) => f.id === "member_guides")).toBe(false);
      }
    }
    expect(MEMBERSHIP_FEATURES.length).toBeGreaterThan(5);
  });

  it("Billing/Access summary reflects locked vs unlocked schedule by tier", () => {
    const free = buildMemberAccessSummary({ membershipTier: "free", audience: "adult" });
    const starter = buildMemberAccessSummary({ membershipTier: "starter", audience: "adult" });
    const pro = buildMemberAccessSummary({ membershipTier: "pro", audience: "adult" });

    expect(free.scheduleSuite).toBe(false);
    expect(free.features.some((f) => f.id === "schedule")).toBe(false);
    expect(starter.scheduleSuite).toBe(false);
    expect(starter.features.some((f) => f.id === "member_guides")).toBe(true);
    expect(pro.scheduleSuite).toBe(true);
    expect(pro.features.some((f) => f.id === "schedule")).toBe(true);
    expect(pro.enrolledLabel).toMatch(/Pro/);
  });

  it("Stripe membership checkout is Adult/Senior paid only", () => {
    expect(supportsMembershipStripeCheckout("starter", "adult")).toBe(true);
    expect(supportsMembershipStripeCheckout("pro", "senior")).toBe(true);
    expect(supportsMembershipStripeCheckout("free", "adult")).toBe(false);
    expect(supportsMembershipStripeCheckout("starter", "kids")).toBe(false);
    expect(supportsMembershipStripeCheckout("elite", "junior")).toBe(false);
  });

  it("plan Kid Credit allowances stay tier-gated (no free stipend)", () => {
    expect(monthlyKidCreditAllowance("free", "kids")).toBe(0);
    expect(monthlyKidCreditAllowance("free", "adult")).toBe(0);
    expect(monthlyKidCreditAllowance("starter", "kids")).toBe(2.5);
    expect(monthlyKidCreditAllowance("starter", "adult")).toBe(2.5);
    expect(monthlyKidCreditAllowance("pro", "junior")).toBe(5);
    expect(monthlyKidCreditAllowance("elite", "senior")).toBe(10);
  });
});
