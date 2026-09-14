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
  TRANSCRIPTION_NOTES_DETAILED_STEPS,
  TRANSCRIPTION_NOTES_NOTES_WORKSHEET,
  TRANSCRIPTION_NOTES_PRICING,
  TRANSCRIPTION_NOTES_REALITY_CHECK,
  TRANSCRIPTION_NOTES_SUPPLIES,
  TRANSCRIPTION_NOTES_TOOLS,
  computeTranscriptionNotesHelperProfit,
  transcriptionNotesHelperToolsDisclaimer,
} from "../transcription-notes-helper-guide";

const GUIDE_ID = "transcription-notes-helper";

describe("Guide #107 Transcription & Notes Helper", () => {
  it("keeps a single #107 id, exact title, Starter, 10 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("107");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("107");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Transcription & Notes Helper");
    expect(h.name).not.toMatch(/guide upgrade|ai notetaker|member guide/i);
    expect(h.category).toBe("Digital Services / Transcription & Meeting Notes");
    expect(h.timeReq).toMatch(/10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/authorized voice memos|meeting recordings/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("starter");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and treats automation as a draft", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? TRANSCRIPTION_NOTES_PRICING.intro);
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).toMatch(/\$15 – \$25/);
    expect(intro).toMatch(/do not charge both a full flat project fee/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /headphones/i.test(i.name))).toBe(true);
    expect(TRANSCRIPTION_NOTES_SUPPLIES.starterKitTotal).toMatch(/\$0–25/);
    expect(TRANSCRIPTION_NOTES_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /vlc/i.test(t.name))).toBe(true);
    expect(transcriptionNotesHelperToolsDisclaimer()).toMatch(/authorized recording/i);
    expect(TRANSCRIPTION_NOTES_REALITY_CHECK.title).toMatch(/confirm permission/i);
    expect(TRANSCRIPTION_NOTES_NOTES_WORKSHEET).toMatch(/lawful recording/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = TRANSCRIPTION_NOTES_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define Your Services, Outputs & Boundaries",
      "Set Prices, Audio Limits, Turnaround & Revisions",
      "Create the Consent, Privacy & Secure-File Process",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Complete Intake, Review a Sample & Confirm the Job",
      "Prepare the Audio & Create a Controlled First Draft",
      "Turn the Draft into Clean, Actionable Notes",
      "Perform the Human Quality Check & Deliver Securely",
      "Handle Corrections, Delete Files & Build Recurring Work",
    ]);
    expect(core[0]?.desc).toMatch(/never secretly record|secret recording/i);
    expect(core[3]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[7]?.desc).toMatch(/unverified draft/i);
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

  it("uses monthly calculator: $351.55 revenue, $40 expenses, $311.55 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Transcription & Notes Helper");
    expect(profile.title).toMatch(/monthly profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "transcriptionFlatFeeProjectsPerWeek")).toBe(true);
    expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);

    const helper = computeTranscriptionNotesHelperProfit({
      transcriptionFlatFeeProjectsPerWeek: 1,
      averageFlatFeeProjectPrice: 35,
      perAudioMinuteProjectsPerMonth: 2,
      averageAudioMinutesPerPerMinuteProject: 20,
      averageRatePerAudioMinute: 1.25,
      recurringPackageRevenue: 120,
      timestampRushFormattingAddOns: 30,
      internetPhone: 10,
      softwareTools: 10,
      cloudStorage: 5,
      equipment: 5,
      advertisingPortfolio: 5,
      paymentFees: 5,
      otherExpenses: 0,
      intakeHours: 2,
      listeningDraftHours: 6,
      editingQualityHours: 4,
      revisionHours: 1,
      fileDeliveryHours: 1,
      marketingAdminHours: 2,
    });
    expect(helper.monthlyFlatFeeRevenue).toBeCloseTo(151.55, 2);
    expect(helper.perMinuteRevenue).toBe(50);
    expect(helper.grossServiceRevenue).toBeCloseTo(351.55, 2);
    expect(helper.totalExpenses).toBe(40);
    expect(helper.estimatedProfit).toBeCloseTo(311.55, 2);
    expect(helper.totalHours).toBe(16);
    expect(helper.profitPerHour).toBeCloseTo(19.47, 2);

    const result = computeGuideCalc(
      profile.mode,
      {
        transcriptionFlatFeeProjectsPerWeek: 1,
        averageFlatFeeProjectPrice: 35,
        perAudioMinuteProjectsPerMonth: 2,
        averageAudioMinutesPerPerMinuteProject: 20,
        averageRatePerAudioMinute: 1.25,
        recurringPackageRevenue: 120,
        timestampRushFormattingAddOns: 30,
        internetPhone: 10,
        softwareTools: 10,
        cloudStorage: 5,
        equipment: 5,
        advertisingPortfolio: 5,
        paymentFees: 5,
        otherExpenses: 0,
        intakeHours: 2,
        listeningDraftHours: 6,
        editingQualityHours: 4,
        revisionHours: 1,
        fileDeliveryHours: 1,
        marketingAdminHours: 2,
      },
      [],
    );
    expect(result.revenue).toBeCloseTo(351.55, 2);
    expect(result.expenses).toBe(40);
    expect(result.net).toBeCloseTo(311.55, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Transcription & Notes Helper");
    expect(pdf.steps.some((s) => /define your services/i.test(s.title))).toBe(true);
  });
});
