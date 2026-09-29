import { describe, expect, it } from "vitest";
import {
  DEFAULT_VIDEO_PROVIDER_PLANS,
  VIDEO_USAGE_DISCLAIMER,
  VSPW_ESTIMATOR_DEMO_SCENES,
  buildPlanComparison,
  buildProductionPackUsageSection,
  buildSceneUsageEstimate,
  buildVideoUsageEstimate,
  defaultVideoUsageEstimatorSettings,
  estimateCreditsPerAttempt,
  estimateTotalCredits,
  estimatedFullProductionsPerMonth,
  formatCreditsApprox,
  mergeVideoUsageEstimatorSettings,
  productionsLabel,
  readVideoUsageSettingsFromProject,
  remainingCreditsAfterProduction,
  resolveExpectedAttempts,
  totalPlannedDurationSeconds,
  withVideoUsageSettingsOnProject,
  type VideoUsageSceneInput,
} from "../vspw-video-usage";

describe("vspw video usage estimator", () => {
  const demo = [...VSPW_ESTIMATOR_DEMO_SCENES];

  it("sums scene durations", () => {
    expect(totalPlannedDurationSeconds(demo)).toBe(30);
    expect(totalPlannedDurationSeconds([])).toBe(0);
  });

  it("calculates credits per attempt and totals for 1/2/3 attempts", () => {
    expect(estimateCreditsPerAttempt(30, 10)).toBe(300);
    expect(estimateTotalCredits(300, 1)).toBe(300);
    expect(estimateTotalCredits(300, 2)).toBe(600);
    expect(estimateTotalCredits(300, 3)).toBe(900);
  });

  it("builds production estimate with defaults (2 attempts, illustrative 10 cps)", () => {
    const settings = defaultVideoUsageEstimatorSettings();
    expect(settings.expectedAttemptsChoice).toBe(2);
    expect(settings.creditsPerSecond).toBe(10);
    expect(settings.illustrative).toBe(true);

    const est = buildVideoUsageEstimate(demo, settings);
    expect(est.sceneCount).toBe(3);
    expect(est.totalSeconds).toBe(30);
    expect(est.creditsPerAttempt).toBe(300);
    expect(est.estimatedTotalCredits).toBe(600);
    expect(est.bestCaseCredits).toBe(300);
    expect(est.likelyCredits).toBe(600);
    expect(est.heavyRevisionCredits).toBe(900);
  });

  it("recalculates when duration or scenes change", () => {
    const settings = defaultVideoUsageEstimatorSettings();
    const longer: VideoUsageSceneInput[] = [
      ...demo,
      { sceneId: "4", label: "Scene 4", durationSeconds: 10 },
    ];
    expect(buildVideoUsageEstimate(longer, settings).totalSeconds).toBe(40);
    expect(buildVideoUsageEstimate(longer, settings).creditsPerAttempt).toBe(400);

    const shorter = demo.slice(0, 2);
    expect(buildVideoUsageEstimate(shorter, settings).totalSeconds).toBe(22);
    expect(buildVideoUsageEstimate(shorter, settings).estimatedTotalCredits).toBe(440);
  });

  it("recalculates when credits-per-second changes", () => {
    const settings = {
      ...defaultVideoUsageEstimatorSettings(),
      creditsPerSecond: 5,
      illustrative: true,
    };
    const est = buildVideoUsageEstimate(demo, settings);
    expect(est.creditsPerAttempt).toBe(150);
    expect(est.estimatedTotalCredits).toBe(300);
  });

  it("supports custom attempt counts", () => {
    const settings = {
      ...defaultVideoUsageEstimatorSettings(),
      expectedAttemptsChoice: "custom" as const,
      customAttempts: 4,
    };
    expect(resolveExpectedAttempts(settings)).toBe(4);
    expect(buildVideoUsageEstimate(demo, settings).estimatedTotalCredits).toBe(1200);
  });

  it("builds scene-level estimates", () => {
    const scene = buildSceneUsageEstimate(demo[1]!, 10);
    expect(scene.durationSeconds).toBe(12);
    expect(scene.creditsPerAttempt).toBe(120);
    expect(scene.oneAttempt).toBe(120);
    expect(scene.twoAttempts).toBe(240);
    expect(scene.threeAttempts).toBe(360);
  });

  it("compares plans and floors full productions", () => {
    const est = buildVideoUsageEstimate(demo, defaultVideoUsageEstimatorSettings());
    expect(estimatedFullProductionsPerMonth(100, 600)).toBe(0);
    expect(productionsLabel(0)).toBe("Less than 1");
    expect(estimatedFullProductionsPerMonth(1500, 600)).toBe(2);
    expect(estimatedFullProductionsPerMonth(5400, 600)).toBe(9);
    expect(estimatedFullProductionsPerMonth(14400, 600)).toBe(24);

    const rows = buildPlanComparison(est, DEFAULT_VIDEO_PROVIDER_PLANS, "hedra");
    expect(rows.find((r) => r.planId === "free")?.productionsLabel).toBe("Less than 1");
    expect(rows.find((r) => r.planId === "basic")?.estimatedFullProductions).toBe(2);
    expect(rows.find((r) => r.planId === "creator")?.estimatedFullProductions).toBe(9);
    expect(rows.find((r) => r.planId === "professional")?.estimatedFullProductions).toBe(24);
  });

  it("handles user-entered credit balance locally", () => {
    expect(remainingCreditsAfterProduction(3850, 600)).toBe(3250);
    expect(remainingCreditsAfterProduction(100, 600)).toBe(0);
    expect(remainingCreditsAfterProduction(null, 600)).toBeNull();
    expect(formatCreditsApprox(600)).toBe("~600");
  });

  it("merges missing/legacy project settings with safe defaults", () => {
    expect(mergeVideoUsageEstimatorSettings(undefined).expectedAttemptsChoice).toBe(2);
    expect(mergeVideoUsageEstimatorSettings({}).providerId).toBe("hedra");
    expect(mergeVideoUsageEstimatorSettings({ expectedAttemptsChoice: 3 }).expectedAttemptsChoice).toBe(
      3,
    );
    expect(readVideoUsageSettingsFromProject({ title: "Old pack" }).modelId).toBeTruthy();
  });

  it("persists estimator settings on a project without dropping other fields", () => {
    const settings = {
      ...defaultVideoUsageEstimatorSettings(),
      userPlanChoice: "creator" as const,
      userEnteredCredits: 3850,
    };
    const saved = withVideoUsageSettingsOnProject(
      { id: "p1", title: "Angela Talking Hat Commercial", scenes: 3 },
      settings,
    );
    expect(saved.id).toBe("p1");
    expect(saved.title).toContain("Angela");
    expect(saved.videoUsageEstimator.userPlanChoice).toBe("creator");
    expect(saved.videoUsageEstimator.userEnteredCredits).toBe(3850);
    expect(readVideoUsageSettingsFromProject(saved).userEnteredCredits).toBe(3850);
  });

  it("exports production pack usage values with disclaimer", () => {
    const section = buildProductionPackUsageSection({
      scenes: demo,
      settings: {
        ...defaultVideoUsageEstimatorSettings(),
        userPlanChoice: "creator",
      },
    });
    expect(section.title).toMatch(/ESTIMATED VIDEO GENERATION USAGE/);
    expect(section.provider).toBe("Hedra");
    expect(section.sceneCount).toBe(3);
    expect(section.totalSeconds).toBe(30);
    expect(section.bestCaseCredits).toBe(300);
    expect(section.likelyCredits).toBe(600);
    expect(section.heavyRevisionCredits).toBe(900);
    expect(section.selectedPlanName).toBe("Creator");
    expect(section.estimatedProductionsAtPace).toBe(9);
    expect(section.disclaimer).toBe(VIDEO_USAGE_DISCLAIMER);
    expect(section.illustrative).toBe(true);
  });

  it("keeps the estimator educational — disclaimer present, no generation API surface", () => {
    expect(VIDEO_USAGE_DISCLAIMER).toMatch(/ESTIMATE ONLY/i);
    expect(VIDEO_USAGE_DISCLAIMER).toMatch(/confirm current usage/i);
    // Pure function still works offline with zero network assumptions.
    const est = buildVideoUsageEstimate(demo, defaultVideoUsageEstimatorSettings());
    expect(est.estimatedTotalCredits).toBeGreaterThan(0);
  });
});
