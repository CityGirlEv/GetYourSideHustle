/**
 * Provider-neutral video generation usage estimator for VSPW.
 * Educational only — never calls Hedra/Runway/etc. APIs or consumes credits.
 */

export const VIDEO_USAGE_DISCLAIMER =
  "ESTIMATE ONLY — Actual Hedra credit usage may vary by model, resolution, duration, features, generation settings, retries, and future Hedra pricing changes. Always confirm current usage and pricing in Hedra before generating.";

export const VIDEO_USAGE_PLAN_BEFORE_COPY =
  "Review your dialogue, wardrobe, characters, images, timing, and continuity before generating video. Finalizing these elements first may reduce unnecessary video regenerations and wasted provider credits.";

export type VideoProviderId = "hedra" | "runway" | "kling" | "veo" | "other";

export type VideoProvider = {
  providerId: VideoProviderId;
  displayName: string;
  active: boolean;
};

export type VideoProviderPlan = {
  providerId: VideoProviderId;
  planId: string;
  planName: string;
  monthlyCredits: number;
  monthlyPrice: number | null;
  currency: string;
  active: boolean;
  lastVerifiedAt: string | null;
};

export type VideoModelPricing = {
  providerId: VideoProviderId;
  modelId: string;
  modelName: string;
  creditsPerSecond: number;
  resolution: string | null;
  notes: string;
  /** When true, UI must label rates as illustrative — not official. */
  illustrative: boolean;
  active: boolean;
  lastVerifiedAt: string | null;
};

export type VideoUsageSceneInput = {
  sceneId: string;
  /** Display label, e.g. "Scene 1". */
  label: string;
  durationSeconds: number;
};

export type ExpectedAttemptsChoice = 1 | 2 | 3 | "custom";

export type UserHedraPlanChoice =
  | "free"
  | "basic"
  | "creator"
  | "professional"
  | "custom"
  | "not_sure";

/** Settings persisted on a VSPW project (safe defaults for older projects). */
export type VideoUsageEstimatorSettings = {
  providerId: VideoProviderId;
  modelId: string;
  creditsPerSecond: number;
  illustrative: boolean;
  expectedAttemptsChoice: ExpectedAttemptsChoice;
  /** Used when expectedAttemptsChoice === "custom". */
  customAttempts: number;
  userPlanChoice: UserHedraPlanChoice;
  /** Optional user-entered available credits (informational only). */
  userEnteredCredits: number | null;
};

export type VideoUsageEstimate = {
  sceneCount: number;
  totalSeconds: number;
  creditsPerSecond: number;
  illustrative: boolean;
  attempts: number;
  creditsPerAttempt: number;
  estimatedTotalCredits: number;
  bestCaseCredits: number;
  likelyCredits: number;
  heavyRevisionCredits: number;
};

export type PlanComparisonRow = {
  planId: string;
  planName: string;
  monthlyCredits: number;
  monthlyPrice: number | null;
  currency: string;
  /** Whole productions that fit; 0 means less than one. */
  estimatedFullProductions: number;
  productionsLabel: string;
};

export type SceneUsageEstimate = {
  sceneId: string;
  label: string;
  durationSeconds: number;
  creditsPerAttempt: number;
  oneAttempt: number;
  twoAttempts: number;
  threeAttempts: number;
};

export type ProductionPackUsageSection = {
  title: string;
  provider: string;
  model: string | null;
  sceneCount: number;
  totalSeconds: number;
  creditsPerSecond: number;
  illustrative: boolean;
  bestCaseCredits: number;
  likelyCredits: number;
  heavyRevisionCredits: number;
  selectedPlanName: string | null;
  estimatedProductionsAtPace: number | null;
  disclaimer: string;
};

const DEFAULT_CREDITS_PER_SECOND = 10;

export const DEFAULT_VIDEO_PROVIDERS: readonly VideoProvider[] = [
  { providerId: "hedra", displayName: "Hedra", active: true },
  { providerId: "runway", displayName: "Runway", active: false },
  { providerId: "kling", displayName: "Kling", active: false },
  { providerId: "veo", displayName: "Veo", active: false },
  { providerId: "other", displayName: "Other", active: false },
] as const;

/** Illustrative Hedra-style plan allowances — editable config, not UI hard-codes. */
export const DEFAULT_VIDEO_PROVIDER_PLANS: readonly VideoProviderPlan[] = [
  {
    providerId: "hedra",
    planId: "free",
    planName: "Free",
    monthlyCredits: 100,
    monthlyPrice: 0,
    currency: "USD",
    active: true,
    lastVerifiedAt: null,
  },
  {
    providerId: "hedra",
    planId: "basic",
    planName: "Basic",
    monthlyCredits: 1500,
    monthlyPrice: null,
    currency: "USD",
    active: true,
    lastVerifiedAt: null,
  },
  {
    providerId: "hedra",
    planId: "creator",
    planName: "Creator",
    monthlyCredits: 5400,
    monthlyPrice: null,
    currency: "USD",
    active: true,
    lastVerifiedAt: null,
  },
  {
    providerId: "hedra",
    planId: "professional",
    planName: "Professional",
    monthlyCredits: 14400,
    monthlyPrice: null,
    currency: "USD",
    active: true,
    lastVerifiedAt: null,
  },
] as const;

export const DEFAULT_VIDEO_MODEL_PRICING: readonly VideoModelPricing[] = [
  {
    providerId: "hedra",
    modelId: "hedra-illustrative-default",
    modelName: "Illustrative default",
    creditsPerSecond: DEFAULT_CREDITS_PER_SECOND,
    resolution: null,
    notes: "Placeholder rate until official Hedra model costs are verified.",
    illustrative: true,
    active: true,
    lastVerifiedAt: null,
  },
] as const;

export function defaultVideoUsageEstimatorSettings(): VideoUsageEstimatorSettings {
  const model = DEFAULT_VIDEO_MODEL_PRICING.find((m) => m.active) ?? DEFAULT_VIDEO_MODEL_PRICING[0]!;
  return {
    providerId: "hedra",
    modelId: model.modelId,
    creditsPerSecond: model.creditsPerSecond,
    illustrative: model.illustrative,
    expectedAttemptsChoice: 2,
    customAttempts: 2,
    userPlanChoice: "not_sure",
    userEnteredCredits: null,
  };
}

/** Merge saved project settings; older projects without estimator data get safe defaults. */
export function mergeVideoUsageEstimatorSettings(
  raw: unknown,
): VideoUsageEstimatorSettings {
  const base = defaultVideoUsageEstimatorSettings();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;

  const providerId = normalizeProviderId(o.providerId) ?? base.providerId;
  const modelId = typeof o.modelId === "string" && o.modelId.trim() ? o.modelId.trim() : base.modelId;
  const creditsPerSecond = positiveNumber(o.creditsPerSecond, base.creditsPerSecond);
  const illustrative =
    typeof o.illustrative === "boolean" ? o.illustrative : creditsPerSecond === DEFAULT_CREDITS_PER_SECOND;
  const expectedAttemptsChoice = normalizeAttemptsChoice(o.expectedAttemptsChoice) ?? base.expectedAttemptsChoice;
  const customAttempts = Math.max(1, Math.floor(positiveNumber(o.customAttempts, base.customAttempts)));
  const userPlanChoice = normalizeUserPlanChoice(o.userPlanChoice) ?? base.userPlanChoice;
  let userEnteredCredits: number | null = null;
  if (o.userEnteredCredits != null && o.userEnteredCredits !== "") {
    const n = Number(o.userEnteredCredits);
    if (Number.isFinite(n) && n >= 0) userEnteredCredits = Math.floor(n);
  }

  return {
    providerId,
    modelId,
    creditsPerSecond,
    illustrative,
    expectedAttemptsChoice,
    customAttempts,
    userPlanChoice,
    userEnteredCredits,
  };
}

export function resolveExpectedAttempts(settings: VideoUsageEstimatorSettings): number {
  if (settings.expectedAttemptsChoice === "custom") {
    return Math.max(1, Math.floor(settings.customAttempts || 1));
  }
  return settings.expectedAttemptsChoice;
}

export function totalPlannedDurationSeconds(scenes: readonly VideoUsageSceneInput[]): number {
  return scenes.reduce((sum, s) => sum + Math.max(0, Number(s.durationSeconds) || 0), 0);
}

export function estimateCreditsPerAttempt(
  totalSeconds: number,
  creditsPerSecond: number,
): number {
  const secs = Math.max(0, Number(totalSeconds) || 0);
  const rate = Math.max(0, Number(creditsPerSecond) || 0);
  return Math.round(secs * rate);
}

export function estimateTotalCredits(creditsPerAttempt: number, attempts: number): number {
  const a = Math.max(1, Math.floor(Number(attempts) || 1));
  return Math.round(Math.max(0, creditsPerAttempt) * a);
}

export function estimatedFullProductionsPerMonth(
  monthlyPlanCredits: number,
  estimatedTotalCredits: number,
): number {
  const monthly = Math.max(0, Number(monthlyPlanCredits) || 0);
  const per = Math.max(0, Number(estimatedTotalCredits) || 0);
  if (per <= 0) return 0;
  return Math.floor(monthly / per);
}

export function productionsLabel(count: number): string {
  if (count < 1) return "Less than 1";
  return `~${count}`;
}

export function buildVideoUsageEstimate(
  scenes: readonly VideoUsageSceneInput[],
  settings: VideoUsageEstimatorSettings,
): VideoUsageEstimate {
  const totalSeconds = totalPlannedDurationSeconds(scenes);
  const creditsPerSecond = Math.max(0, settings.creditsPerSecond);
  const creditsPerAttempt = estimateCreditsPerAttempt(totalSeconds, creditsPerSecond);
  const attempts = resolveExpectedAttempts(settings);
  return {
    sceneCount: scenes.length,
    totalSeconds,
    creditsPerSecond,
    illustrative: settings.illustrative,
    attempts,
    creditsPerAttempt,
    estimatedTotalCredits: estimateTotalCredits(creditsPerAttempt, attempts),
    bestCaseCredits: estimateTotalCredits(creditsPerAttempt, 1),
    likelyCredits: estimateTotalCredits(creditsPerAttempt, 2),
    heavyRevisionCredits: estimateTotalCredits(creditsPerAttempt, 3),
  };
}

export function buildSceneUsageEstimate(
  scene: VideoUsageSceneInput,
  creditsPerSecond: number,
): SceneUsageEstimate {
  const durationSeconds = Math.max(0, Number(scene.durationSeconds) || 0);
  const rate = Math.max(0, Number(creditsPerSecond) || 0);
  const creditsPerAttempt = estimateCreditsPerAttempt(durationSeconds, rate);
  return {
    sceneId: scene.sceneId,
    label: scene.label,
    durationSeconds,
    creditsPerAttempt,
    oneAttempt: estimateTotalCredits(creditsPerAttempt, 1),
    twoAttempts: estimateTotalCredits(creditsPerAttempt, 2),
    threeAttempts: estimateTotalCredits(creditsPerAttempt, 3),
  };
}

export function buildPlanComparison(
  estimate: VideoUsageEstimate,
  plans: readonly VideoProviderPlan[] = DEFAULT_VIDEO_PROVIDER_PLANS,
  providerId: VideoProviderId = "hedra",
): PlanComparisonRow[] {
  return plans
    .filter((p) => p.active && p.providerId === providerId)
    .map((p) => {
      const estimatedFullProductions = estimatedFullProductionsPerMonth(
        p.monthlyCredits,
        estimate.estimatedTotalCredits,
      );
      return {
        planId: p.planId,
        planName: p.planName,
        monthlyCredits: p.monthlyCredits,
        monthlyPrice: p.monthlyPrice,
        currency: p.currency,
        estimatedFullProductions,
        productionsLabel: productionsLabel(estimatedFullProductions),
      };
    });
}

export function remainingCreditsAfterProduction(
  userEnteredCredits: number | null | undefined,
  estimatedTotalCredits: number,
): number | null {
  if (userEnteredCredits == null || !Number.isFinite(userEnteredCredits)) return null;
  return Math.max(0, Math.floor(userEnteredCredits) - Math.max(0, estimatedTotalCredits));
}

export function formatCreditsApprox(n: number): string {
  const v = Math.max(0, Math.round(Number(n) || 0));
  return `~${v.toLocaleString("en-US")}`;
}

export function buildProductionPackUsageSection(opts: {
  scenes: readonly VideoUsageSceneInput[];
  settings: VideoUsageEstimatorSettings;
  providers?: readonly VideoProvider[];
  models?: readonly VideoModelPricing[];
  plans?: readonly VideoProviderPlan[];
}): ProductionPackUsageSection {
  const settings = mergeVideoUsageEstimatorSettings(opts.settings);
  const estimate = buildVideoUsageEstimate(opts.scenes, settings);
  const providers = opts.providers ?? DEFAULT_VIDEO_PROVIDERS;
  const models = opts.models ?? DEFAULT_VIDEO_MODEL_PRICING;
  const plans = opts.plans ?? DEFAULT_VIDEO_PROVIDER_PLANS;

  const provider =
    providers.find((p) => p.providerId === settings.providerId)?.displayName ?? settings.providerId;
  const model = models.find((m) => m.modelId === settings.modelId) ?? null;
  const plan =
    settings.userPlanChoice !== "not_sure" && settings.userPlanChoice !== "custom"
      ? plans.find((p) => p.planId === settings.userPlanChoice && p.providerId === settings.providerId)
      : null;
  const estimatedProductionsAtPace = plan
    ? estimatedFullProductionsPerMonth(plan.monthlyCredits, estimate.estimatedTotalCredits)
    : null;

  return {
    title: "ESTIMATED VIDEO GENERATION USAGE",
    provider,
    model: model?.modelName ?? null,
    sceneCount: estimate.sceneCount,
    totalSeconds: estimate.totalSeconds,
    creditsPerSecond: estimate.creditsPerSecond,
    illustrative: estimate.illustrative,
    bestCaseCredits: estimate.bestCaseCredits,
    likelyCredits: estimate.likelyCredits,
    heavyRevisionCredits: estimate.heavyRevisionCredits,
    selectedPlanName: plan?.planName ?? null,
    estimatedProductionsAtPace,
    disclaimer: VIDEO_USAGE_DISCLAIMER,
  };
}

/** Attach estimator settings onto a VSPW project blob without breaking unknown fields. */
export function withVideoUsageSettingsOnProject<T extends Record<string, unknown>>(
  project: T,
  settings: VideoUsageEstimatorSettings,
): T & { videoUsageEstimator: VideoUsageEstimatorSettings } {
  return {
    ...project,
    videoUsageEstimator: mergeVideoUsageEstimatorSettings(settings),
  };
}

export function readVideoUsageSettingsFromProject(project: unknown): VideoUsageEstimatorSettings {
  if (!project || typeof project !== "object") return defaultVideoUsageEstimatorSettings();
  const raw = (project as Record<string, unknown>).videoUsageEstimator;
  return mergeVideoUsageEstimatorSettings(raw);
}

function positiveNumber(raw: unknown, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

function normalizeProviderId(raw: unknown): VideoProviderId | null {
  const v = String(raw || "").toLowerCase();
  if (v === "hedra" || v === "runway" || v === "kling" || v === "veo" || v === "other") {
    return v;
  }
  return null;
}

function normalizeAttemptsChoice(raw: unknown): ExpectedAttemptsChoice | null {
  if (raw === "custom") return "custom";
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3) return n;
  return null;
}

function normalizeUserPlanChoice(raw: unknown): UserHedraPlanChoice | null {
  const v = String(raw || "").toLowerCase();
  if (
    v === "free" ||
    v === "basic" ||
    v === "creator" ||
    v === "professional" ||
    v === "custom" ||
    v === "not_sure"
  ) {
    return v;
  }
  return null;
}

/** Sample scenes for admin/dev preview only — not live Hedra data. */
export const VSPW_ESTIMATOR_DEMO_SCENES: readonly VideoUsageSceneInput[] = [
  { sceneId: "demo-1", label: "Scene 1", durationSeconds: 10 },
  { sceneId: "demo-2", label: "Scene 2", durationSeconds: 12 },
  { sceneId: "demo-3", label: "Scene 3", durationSeconds: 8 },
] as const;
