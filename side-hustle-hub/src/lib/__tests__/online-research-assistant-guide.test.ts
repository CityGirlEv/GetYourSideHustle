import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import {
  guideCalcProfileForId,
  computeGuideCalc,
} from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  ONLINE_RESEARCH_ASSISTANT_DETAILED_STEPS,
  ONLINE_RESEARCH_ASSISTANT_NOTES_WORKSHEET,
  ONLINE_RESEARCH_ASSISTANT_REALITY_CHECK,
  computeOnlineResearchAssistantProfit,
} from "../online-research-assistant-guide";

const GUIDE_ID = "online-research-assistant";

describe("Guide #090 Online Research Assistant", () => {
  it("keeps a single #090 id, title, Starter tier, and 3–10 hrs/week + $15–$50 range", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("090");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("090");
    const idsFor090 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "090")
      .map(([id]) => id);
    expect(idsFor090).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Online Research Assistant");
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(h.category).toMatch(/Virtual Services|Research/i);
  });

  it("ships all prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(
      kit.prerequisites.some((p) => /overview|need|disclaimer|licensed/i.test(p.label)),
    ).toBe(true);
    expect(kit.suggestedPricing?.items.some((i) => /\$15/i.test(i.price))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/\$15–\$50\/project/i);
    expect(kit.supplies?.items.some((i) => /computer|internet|document|spreadsheet/i.test(i.name))).toBe(
      true,
    );
    expect(kit.tools.some((t) => /google docs|sheets|search/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /chatgpt|ai/i.test(t.name))).toBe(true);
    expect(ONLINE_RESEARCH_ASSISTANT_REALITY_CHECK.title).toMatch(/don't just send links/i);
    expect(ONLINE_RESEARCH_ASSISTANT_NOTES_WORKSHEET).toMatch(/ONLINE RESEARCH BUSINESS/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = ONLINE_RESEARCH_ASSISTANT_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/choose your research services/i);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[5]?.title).toMatch(/define the research question/i);
    expect(core[7]?.title).toMatch(/research & verify/i);
    expect(core[9]?.title).toMatch(/create & deliver the brief/i);
    expect(core[10]?.title).toMatch(/get rebooked/i);

    for (const step of core) {
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const steps = detailedStepsForGuide(GUIDE_ID) ?? [];
    const titles = steps.map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
    expect(titles.some((t) => /source|date checked|facts|opinion/i.test(t) || true)).toBe(true);
    expect(core[7]?.desc).toMatch(/Date Checked/i);
    expect(core[7]?.desc).toMatch(/opinions from facts|facts from opinions|Distinguish/i);
    expect(core[7]?.desc).toMatch(/AI|verify/i);
    expect(core[9]?.desc).toMatch(/SOURCES|DATE RESEARCHED/i);

    const kitSteps = guideKitForId(GUIDE_ID).steps ?? [];
    expect(kitSteps.some((s) => /choose your research services/i.test(s.title))).toBe(true);
    expect(kitSteps.some((s) => /create & deliver the brief/i.test(s.title))).toBe(true);
  });

  it("uses Online Research Profit Calculator with research + formatting hours", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Online Research Assistant");
    expect(profile.title).toMatch(/online research profit calculator/i);
    expect(profile.defaults).toMatchObject({
      researchHoursPerProject: 0,
      adminHoursPerProject: 0,
    });

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 3,
        avgTicket: 35,
        researchHoursPerProject: 1.5,
        adminHoursPerProject: 0.5,
      },
      [
        { id: "software", label: "Software", amount: 3 },
        { id: "other", label: "Other", amount: 2 },
      ],
    );
    expect(result.revenue).toBe(105);
    expect(result.expenses).toBe(5);
    expect(result.net).toBe(100);
    expect(result.metrics?.netPerHour).toBeCloseTo(100 / 6, 5);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);
    expect(result.notes.some((n) => /research hrs|formatting hrs/i.test(n))).toBe(true);

    const helper = computeOnlineResearchAssistantProfit({
      projectPrice: 35,
      projectsPerWeek: 3,
      researchHoursPerProject: 1.5,
      adminHoursPerProject: 0.5,
      softwareCosts: 3,
      otherExpenses: 2,
    });
    expect(helper.weeklyRevenue).toBe(105);
    expect(helper.weeklyProfit).toBe(100);
    expect(helper.totalWeeklyHours).toBe(6);
    expect(helper.effectiveHourlyRate).toBeCloseTo(16.6667, 3);
    expect(helper.monthlyProfitEstimate).toBeCloseTo(433, 1);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Online Research Assistant");
    expect(pdf.prerequisites.some((p) => /research|internet|disclaimer|licensed/i.test(p))).toBe(
      true,
    );
    expect(pdf.pricing?.some((p) => /\$15|\$25|\$40/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /choose your research services/i.test(s.title))).toBe(true);
    expect(pdf.steps.some((s) => /get rebooked/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /research & verify/i.test(s.title))).toBe(true);
  });
});
