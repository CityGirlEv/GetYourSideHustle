import { planDetailKey } from "@/lib/plan-filters";
import type { PlanDetail } from "@/lib/plan-details";

export const MAX_COMPARE_PLANS = 3;
export const PLAN_RESULTS_LIST_TAB = "list";

/** Show row checkboxes only when the user must pick from a larger list. */
export function shouldShowPlanCompareCheckboxes(planCount: number): boolean {
  return planCount > MAX_COMPARE_PLANS;
}

/** Side by Side is available with 2–3 plans (auto or manually selected). */
export function isSideBySideCompareEnabled(
  planCount: number,
  selectedCount: number,
): boolean {
  if (planCount < 2) return false;
  if (planCount <= MAX_COMPARE_PLANS) return true;
  return selectedCount >= 2;
}

/** Auto-select all plans when the result set is small enough. */
export function autoComparePlanKeys(plans: PlanDetail[]): string[] {
  if (plans.length === 0 || plans.length > MAX_COMPARE_PLANS) return [];
  return plans.slice(0, MAX_COMPARE_PLANS).map(planDetailKey);
}

/** Keep manual selections valid after filter changes. */
export function pruneComparePlanKeys(
  plans: PlanDetail[],
  selectedKeys: string[],
): string[] {
  const valid = new Set(plans.map(planDetailKey));
  return selectedKeys.filter((key) => valid.has(key)).slice(0, MAX_COMPARE_PLANS);
}

/** Plans to render in the Side by Side grid. */
export function plansForSideBySideView(
  plans: PlanDetail[],
  selectedKeys: string[],
): PlanDetail[] {
  if (plans.length <= MAX_COMPARE_PLANS) {
    return plans.slice(0, MAX_COMPARE_PLANS);
  }
  const byKey = new Map(plans.map((plan) => [planDetailKey(plan), plan]));
  return selectedKeys
    .map((key) => byKey.get(key))
    .filter((plan): plan is PlanDetail => plan != null)
    .slice(0, MAX_COMPARE_PLANS);
}

export function toggleComparePlanKey(
  selectedKeys: string[],
  plan: PlanDetail,
  max = MAX_COMPARE_PLANS,
): string[] {
  const key = planDetailKey(plan);
  if (selectedKeys.includes(key)) {
    return selectedKeys.filter((entry) => entry !== key);
  }
  if (selectedKeys.length >= max) return selectedKeys;
  return [...selectedKeys, key];
}
