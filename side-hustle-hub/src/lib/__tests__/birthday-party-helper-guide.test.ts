import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { juniorLibraryMinTier } from "../age-library-tiers";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  BIRTHDAY_PARTY_HELPER_DETAILED_STEPS,
  BIRTHDAY_PARTY_HELPER_NOTES_WORKSHEET,
  BIRTHDAY_PARTY_HELPER_PRICING,
  BIRTHDAY_PARTY_HELPER_REALITY_CHECK,
  BIRTHDAY_PARTY_HELPER_SUPPLIES,
  BIRTHDAY_PARTY_HELPER_TOOLS,
  computeBirthdayPartyHelperProfit,
  birthdayPartyHelperToolsDisclaimer,
} from "../birthday-party-helper-guide";

const GUIDE_ID = "birthday-party-helper";

describe("Guide #036 Birthday Party Helper", () => {
  it("keeps a single #036 id, exact title, 2 - 8 hrs/week, and Starter junior lane tier", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("036");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("036");
    const idsFor036 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "036")
      .map(([id]) => id);
    expect(idsFor036).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Birthday Party Helper");
    expect(h.name).not.toMatch(
      /guide upgrade|party assistant guide|kids party helper guide|event helper guide|starter guide|member guide/i,
    );
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$10/);
    expect(h.potentialIncome).toMatch(/\$40/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult"]));
    expect(h.minTier).toBe("free");
    expect(h.freeWizardEligible).toBe(false);
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps host-responsible / not-childcare copy", () => {
    const intro = BIRTHDAY_PARTY_HELPER_PRICING.intro;
    expect(intro).toMatch(/\$10 – \$40 \/ job/i);
    expect(intro).toMatch(/two-hour party helper/i);
    expect(intro).toMatch(/three-hour setup \+ party \+ cleanup/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(BIRTHDAY_PARTY_HELPER_SUPPLIES.items.some((i) => /closed-toe|trash bags/i.test(i.name))).toBe(true);
    expect(BIRTHDAY_PARTY_HELPER_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(birthdayPartyHelperToolsDisclaimer()).toMatch(/not automatic childcare/i);
    expect(BIRTHDAY_PARTY_HELPER_REALITY_CHECK.title).toMatch(/not automatic childcare/i);
    expect(BIRTHDAY_PARTY_HELPER_NOTES_WORKSHEET).toMatch(/RUN-OF-SHOW/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–5", () => {
    const core = BIRTHDAY_PARTY_HELPER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define Your Party-Helper Role",
      "Create 2–3 Clear Packages",
      "Build Your Pricing & Booking Rules",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Complete Party Intake",
      "Build the Run-of-Show",
      "Prep & Set Up Safely",
      "Support the Event Without Taking Over",
      "Clean Up, Get Paid & Record Profit",
      "Follow Up & Build Referrals",
    ]);
    expect(core[0]?.desc).toMatch(/sole childcare/i);
    expect(core[3]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[4]?.desc).toMatch(/enjoy the party/i);
    expect(core[6]?.title).toMatch(/run-of-show/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓|☑|✔/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
  });

  it("uses monthly calculator: $420 revenue, $95 expenses, $325 profit, ~$18.06/hour", () => {
    const example = {
      bphShortJobs: 2,
      bphAvgShortPrice: 30,
      bphFullParties: 4,
      bphAvgFullPartyPrice: 70,
      bphAddOnRevenue: 50,
      bphTipsOther: 30,
      bphSupplies: 25,
      bphTravelParking: 20,
      bphPaymentFees: 10,
      bphAdvertising: 15,
      bphInsuranceLicensing: 0,
      bphOtherExpenses: 25,
      bphEventHours: 12,
      bphPrepShoppingHours: 3,
      bphTravelAdminHours: 3,
    };
    const helper = computeBirthdayPartyHelperProfit(example);
    expect(helper.shortJobRevenue).toBe(60);
    expect(helper.fullPartyRevenue).toBe(280);
    expect(helper.totalMonthlyRevenue).toBe(420);
    expect(helper.totalExpenses).toBe(95);
    expect(helper.estimatedProfit).toBe(325);
    expect(helper.totalHours).toBe(18);
    expect(helper.profitPerHour).toBeCloseTo(18.06, 2);
  });
});
