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
  GROUP_SETUP_HELPER_DETAILED_STEPS,
  GROUP_SETUP_HELPER_NOTES_WORKSHEET,
  GROUP_SETUP_HELPER_REALITY_CHECK,
  computeGroupSetupHelperProfit,
} from "../group-setup-helper-guide";

const GUIDE_ID = "group-setup-helper";

describe("Guide #063 TikTok/Facebook Setup", () => {
  it("keeps a single #063 id, exact title, Starter membership, 3–10 hrs, and $15–$50/project", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("063");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("063");
    const idsFor063 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "063")
      .map(([id]) => id);
    expect(idsFor063).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("TikTok/Facebook Setup");
    expect(h.name).not.toMatch(
      /guide upgrade|group setup helper|social media setup|starter guide|member guide/i,
    );
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.category).toMatch(/Social Media\s*\/\s*Community Setup/i);
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("starter");
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|before starting|access/i.test(p.label))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.items.some((i) => /\$15|\$20|\$35|\$50/i.test(i.price))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/\$15 – \$50/i);
    expect(kit.supplies?.items.some((i) => /phone|brand|file/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /tiktok|facebook|beginner tool stack/i.test(t.name))).toBe(true);
    expect(GROUP_SETUP_HELPER_REALITY_CHECK.title).toMatch(/setup is not the same as full social media management/i);
    expect(GROUP_SETUP_HELPER_NOTES_WORKSHEET).toMatch(/MY TIKTOK\/FACEBOOK SETUP SERVICE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = GROUP_SETUP_HELPER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/community or channel goal/i);
    expect(core[1]?.title).toMatch(/starter package/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[3]?.desc).toMatch(/do not imply/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[6]?.title).toMatch(/profile\/page\/group basics/i);
    expect(core[7]?.title).toMatch(/rules & the welcome/i);
    expect(core[7]?.desc).toMatch(/tiktok/i);
    expect(core[8]?.desc).toMatch(/client-owned|licensed/i);
    expect(core[9]?.title).toMatch(/7-day launch plan/i);
    expect(core[10]?.title).toMatch(/hand off/i);
    expect(core[10]?.desc).toMatch(/remove unnecessary access/i);

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

  it("uses Social Setup Project Profit Calculator and excludes merchandise-style add-ons from per-job math", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "TikTok/Facebook Setup");
    expect(profile.title).toMatch(/social setup project profit calculator/i);
    expect(profile.disclaimerExtra).toMatch(/revenue = money received/i);

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 3,
        avgTicket: 35,
        extraEventPay: 20,
        hoursPerShoot: 2,
      },
      [
        { id: "software", label: "Software/design", amount: 5 },
        { id: "ads", label: "Advertising", amount: 5 },
        { id: "transport", label: "Travel", amount: 5 },
        { id: "other", label: "Other", amount: 0 },
      ],
    );
    expect(result.revenue).toBe(125);
    expect(result.expenses).toBe(15);
    expect(result.net).toBe(110);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);

    const helper = computeGroupSetupHelperProfit({
      averageProjectPrice: 35,
      projectsPerWeek: 3,
      addOnRevenue: 20,
      softwareDesign: 5,
      advertising: 5,
      travel: 5,
      otherExpenses: 0,
      averageHoursPerProject: 2,
    });
    expect(helper.weeklyRevenue).toBe(125);
    expect(helper.weeklyProfit).toBe(110);
    expect(helper.monthlyProfitEstimate).toBeCloseTo(476.3, 1);
    expect(helper.effectiveProfitPerHour).toBeCloseTo(18.33, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("TikTok/Facebook Setup");
    expect(pdf.pricing?.some((p) => /\$15|\$50/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /community or channel goal/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /7-day launch plan/i.test(s.title))).toBe(true);
  });
});
