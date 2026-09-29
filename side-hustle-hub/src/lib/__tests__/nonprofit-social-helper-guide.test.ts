import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { juniorLibraryMinTier, seniorLibraryMinTier } from "../age-library-tiers";
import { uniqueGuideLibraryEntries } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  NONPROFIT_SOCIAL_HELPER_DETAILED_STEPS,
  NONPROFIT_SOCIAL_HELPER_NOTES_WORKSHEET,
  NONPROFIT_SOCIAL_HELPER_REALITY_CHECK,
  computeNonprofitSocialHelperProfit,
} from "../nonprofit-social-helper-guide";

const GUIDE_ID = "nonprofit-social-helper";

describe("Guide #046 Church/Nonprofit Social Media Helper", () => {
  it("keeps a single #046 id, exact title, Pro membership, 3–10 hrs, and $15–$50/project", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("046");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("046");
    const idsFor046 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "046")
      .map(([id]) => id);
    expect(idsFor046).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Church/Nonprofit Social Media Helper");
    expect(h.name).not.toMatch(
      /guide upgrade|nonprofit social media guide|church social media guide|social media manager|pro guide|member guide/i,
    );
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.audiences).not.toContain("kids");
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.minTier).toBe("pro");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.category).toMatch(/Social Media\s*\/\s*Community Support/i);
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("pro");
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("pro");
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|before starting|access/i.test(p.label))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.items.some((i) => /\$15|\$25|\$40|\$50/i.test(i.price))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/\$15 – \$50/i);
    expect(kit.suggestedPricing?.intro).toMatch(/donations or fundraising proceeds/i);
    expect(kit.supplies?.items.some((i) => /phone|logo|photo|calendar/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /canva|beginner tool stack/i.test(t.name))).toBe(true);
    expect(NONPROFIT_SOCIAL_HELPER_REALITY_CHECK.title).toMatch(
      /posting for an organization, not speaking for yourself/i,
    );
    expect(NONPROFIT_SOCIAL_HELPER_NOTES_WORKSHEET).toMatch(/MY CHURCH\/NONPROFIT SOCIAL MEDIA SERVICE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = NONPROFIT_SOCIAL_HELPER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/define the organization.?s content goals/i);
    expect(core[0]?.desc).toMatch(/content pillars/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[5]?.title).toMatch(/approval system/i);
    expect(core[6]?.desc).toMatch(/WHAT\? WHO\? WHEN\? WHERE/i);
    expect(core[7]?.desc).toMatch(/minors or vulnerable/i);
    expect(core[8]?.desc).toMatch(/Do not make every post a donation request/i);
    expect(core[9]?.title).toMatch(/publish, monitor/i);
    expect(core[10]?.title).toMatch(/recurring content system/i);

    for (const step of core) {
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
  });

  it("uses Church/Nonprofit Social Media Helper Profit Calculator", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Church/Nonprofit Social Media Helper");
    expect(profile.title).toMatch(/church\/nonprofit social media helper profit calculator/i);
    expect(profile.disclaimerExtra).toMatch(/donations or fundraising proceeds/i);

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 2,
        avgTicket: 40,
        monthlyRetainerRevenue: 324.75,
        extraEventPay: 20,
        hoursPerShoot: 2,
        nonBillableHoursPerWeek: 3,
      },
      [
        { id: "software", label: "Software", amount: 10 },
        { id: "transport", label: "Travel", amount: 5 },
        { id: "ads", label: "Advertising", amount: 5 },
        { id: "other", label: "Other", amount: 5 },
      ],
    );
    expect(result.revenue).toBe(175);
    expect(result.expenses).toBe(25);
    expect(result.net).toBe(150);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);
    expect(result.metrics?.netPerHour).toBeCloseTo(21.43, 2);

    const helper = computeNonprofitSocialHelperProfit({
      averageProjectFee: 40,
      projectsPerWeek: 2,
      monthlyRecurringClientRevenue: 324.75,
      addOnRevenue: 20,
      software: 10,
      travel: 5,
      advertising: 5,
      otherExpenses: 5,
      hoursPerProject: 2,
      recurringClientHoursPerWeek: 3,
    });
    expect(helper.weeklyRevenue).toBe(175);
    expect(helper.weeklyProfit).toBe(150);
    expect(helper.monthlyProfitEstimate).toBeCloseTo(649.5, 1);
    expect(helper.effectiveProfitPerHour).toBeCloseTo(21.43, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Church/Nonprofit Social Media Helper");
    expect(pdf.pricing?.some((p) => /\$15|\$50/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /define the organization.?s content goals/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /volunteer & impact spotlights/i.test(s.title))).toBe(true);
  });
});
