import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { juniorLibraryMinTier, seniorLibraryMinTier } from "../age-library-tiers";
import { uniqueGuideLibraryEntries, countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  COMMUNITY_MODERATOR_DETAILED_STEPS,
  COMMUNITY_MODERATOR_NOTES_WORKSHEET,
  COMMUNITY_MODERATOR_PRICING,
  COMMUNITY_MODERATOR_REALITY_CHECK,
  COMMUNITY_MODERATOR_SUPPLIES,
  COMMUNITY_MODERATOR_TOOLS,
  computeOnlineCommunityModeratorProfit,
  onlineCommunityModeratorToolsDisclaimer,
} from "../online-community-moderator-guide";

const GUIDE_ID = "online-community-moderator";

describe("Guide #089 Online Community Moderator", () => {
  it("keeps a single #089 id, exact title, time, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("089");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("089");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Online Community Moderator");
    expect(h.name).not.toMatch(/guide upgrade|facebook group moderator|discord moderator|member guide/i);
    expect(h.category).toBe("Digital Services / Community Management");
    expect(h.timeReq).toMatch(/10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/written rules|escalating serious issues/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("starter");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps small-project $15–$50 separate from retainers", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? COMMUNITY_MODERATOR_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).toMatch(/\$15 – \$30/);
    expect(intro).toMatch(/\$300 – \$1,200/);
    expect(intro).toMatch(/do not bill the same scheduled hour twice/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /secure digital checklist/i.test(i.name))).toBe(true);
    expect(COMMUNITY_MODERATOR_SUPPLIES.starterKitTotal).toMatch(/\$0–20/);
    expect(COMMUNITY_MODERATOR_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /meta community standards/i.test(t.name))).toBe(true);
    expect(onlineCommunityModeratorToolsDisclaimer()).toMatch(/verify CURRENT official rules/i);
    expect(COMMUNITY_MODERATOR_REALITY_CHECK.title).toMatch(/written playbook/i);
    expect(COMMUNITY_MODERATOR_REALITY_CHECK.body).toMatch(/Clear Rules\. Calm Responses\. Safer Communities\./i);
    expect(COMMUNITY_MODERATOR_NOTES_WORKSHEET).toMatch(/Owner password requested\/shared/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 5–7", () => {
    const core = COMMUNITY_MODERATOR_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define the Community, Role & Boundaries",
      "Audit the Rules, Queues, Permissions & Risks",
      "Set Your Packages, Schedule & Service Terms",
      "Build the Moderation Playbook & Escalation Matrix",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Onboard Securely & Test the Workflow",
      "Run a Consistent Daily Moderation Shift",
      "Handle Incidents, Reports & Appeals",
      "Report Results, Protect Wellbeing & Renew the Work",
    ]);
    expect(core[0]?.desc).toMatch(/24\/7 monitoring/i);
    expect(core[3]?.desc).toMatch(/never download/i);
    expect(core[4]?.desc).toMatch(/pick only 2 or 3/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
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

  it("uses monthly calculator: $540 revenue, $40 expenses, $500 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Online Community Moderator");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "moderatorSmallProjects")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const helper = computeOnlineCommunityModeratorProfit({
      moderatorSmallProjects: 4,
      averageProjectFee: 35,
      recurringHours: 20,
      averageHourlyRate: 20,
      liveEventIncome: 0,
      auditSetupIncome: 0,
      otherApprovedServiceIncome: 0,
      internetPhone: 15,
      softwareSecurity: 10,
      equipment: 5,
      advertisingPlatformFees: 5,
      paymentFees: 5,
      training: 0,
      otherExpenses: 0,
      moderationHours: 20,
      setupAuditHours: 1,
      reportsAdminHours: 3,
      marketingHours: 1,
    });
    expect(helper.projectRevenue).toBe(140);
    expect(helper.recurringRevenue).toBe(400);
    expect(helper.grossServiceRevenue).toBe(540);
    expect(helper.totalExpenses).toBe(40);
    expect(helper.estimatedProfit).toBe(500);
    expect(helper.totalHours).toBe(25);
    expect(helper.profitPerHour).toBe(20);

    const result = computeGuideCalc(
      profile.mode,
      {
        moderatorSmallProjects: 4,
        averageProjectFee: 35,
        recurringHours: 20,
        averageHourlyRate: 20,
        liveEventIncome: 0,
        auditSetupIncome: 0,
        otherApprovedServiceIncome: 0,
        internetPhone: 15,
        softwareSecurity: 10,
        equipment: 5,
        advertisingPlatformFees: 5,
        paymentFees: 5,
        training: 0,
        otherExpenses: 0,
        moderationHours: 20,
        setupAuditHours: 1,
        reportsAdminHours: 3,
        marketingHours: 1,
      },
      [],
    );
    expect(result.revenue).toBe(540);
    expect(result.expenses).toBe(40);
    expect(result.net).toBe(500);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Online Community Moderator");
    expect(pdf.steps.some((s) => /define the community, role/i.test(s.title))).toBe(true);
  });
});
