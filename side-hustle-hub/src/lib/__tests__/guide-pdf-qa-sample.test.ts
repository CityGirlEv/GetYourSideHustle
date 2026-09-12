import { describe, expect, it } from "vitest";
import {
  GUIDE_PDF_QA_SAMPLE_SEED,
  buildGuidePdfQaSample,
  guidePdfQaChecklist,
  pickGuidePdfQaSampleIds,
} from "../guide-pdf-qa-sample";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { guideReviewCaseIdForGuide } from "../guide-review-link";

describe("guide PDF QA sample pool", () => {
  it("picks a stable 10-guide pool (5 Tina + 5 Evelyn)", () => {
    const a = buildGuidePdfQaSample();
    const b = buildGuidePdfQaSample();
    expect(a).toHaveLength(10);
    expect(b.map((r) => r.guideId)).toEqual(a.map((r) => r.guideId));
    expect(a.filter((r) => r.assignee === "tina")).toHaveLength(5);
    expect(a.filter((r) => r.assignee === "evelyn")).toHaveLength(5);
    expect(a.every((r) => r.caseId === guideReviewCaseIdForGuide(r.guideId))).toBe(true);
  });

  it("keeps seed-locked ids for CI (bump GUIDE_PDF_QA_SAMPLE_SEED to reshuffle)", () => {
    const ids = pickGuidePdfQaSampleIds(10, GUIDE_PDF_QA_SAMPLE_SEED);
    expect(ids).toEqual([
      "fb-marketplace-helper",
      "ai-assets",
      "junior-reinvest-ceo",
      "kids-kindness-share",
      "greeting-card-creator",
      "toy-organizer",
      "trash-can-service",
      "youth-sports-helper",
      "ai-prompt-helper",
      "digital-product-formatter",
    ]);
  });

  it("builds a PDF model for every sample guide", () => {
    for (const row of buildGuidePdfQaSample()) {
      const model = buildLaunchGuidePdfModel(row.guideId);
      expect(model.title.length).toBeGreaterThan(2);
      expect(model.steps.length).toBeGreaterThan(0);
      expect(guidePdfQaChecklist(row)).toContain(row.caseId);
      expect(guidePdfQaChecklist(row)).toContain("Download PDF");
      expect(guidePdfQaChecklist(row)).toMatch(/all 7 prep tabs/i);
      expect(guidePdfQaChecklist(row)).toMatch(/Suggested Pricing/);
      expect(guidePdfQaChecklist(row)).toMatch(/Supply List/);
      expect(guidePdfQaChecklist(row)).toMatch(/Revenue Calculator/);
    }
  });
});
