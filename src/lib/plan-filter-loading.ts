/** Show progress UI when filtering/rendering at least this many plans. */
export const PLAN_FILTER_PROGRESS_THRESHOLD = 100;

/** Only show the hourglass if Potential Options loading exceeds this duration. */
export const PLAN_FILTER_OVERLAY_DELAY_MS = 3000;

/** Table rows rendered per animation frame batch. */
export const PLAN_FILTER_ROW_CHUNK_SIZE = 250;

/** Rough duration for filter + render — tuned for ~6k national catalog rows. */
export function estimatePlanFilterDurationMs(planCount: number): number {
  if (planCount <= PLAN_FILTER_PROGRESS_THRESHOLD) return 0;
  return Math.max(1200, Math.min(15000, 600 + planCount * 1.8));
}

export function estimatePlanFilterSeconds(planCount: number): number {
  const ms = estimatePlanFilterDurationMs(planCount);
  return ms > 0 ? Math.max(1, Math.ceil(ms / 1000)) : 0;
}

export function formatPlanFilterCountdown(seconds: number): string {
  if (seconds <= 0) return "Finishing up…";
  if (seconds === 1) return "About 1 second left";
  return `About ${seconds} seconds left`;
}

export function planFilterProgressLabel(planCount: number, phase: "filtering" | "rendering"): string {
  if (phase === "filtering") {
    return planCount > 0 ? `Filtering ${planCount.toLocaleString()} plans…` : "Applying filter…";
  }
  return planCount > 0
    ? `Loading ${planCount.toLocaleString()} plans into the list…`
    : "Loading plans…";
}

export const CMS_LANDSCAPE_LOADING_LABEL = "Plans loading, Thank you for your patience";

/** Primary copy on the full-screen plan loading overlay. */
export const PLANS_LOADING_MESSAGE = CMS_LANDSCAPE_LOADING_LABEL;
