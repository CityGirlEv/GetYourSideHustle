import type { PlanDetail } from "@/lib/plan-details";
import type { PlanSortKey } from "@/lib/plan-table-sort";
import { planDetailKey } from "@/lib/plan-filters";
import { planUsd } from "@/lib/plan-comparison-rationale";
import { multiSelectMatches } from "@/components/ui/multi-select";
import type { MultiSelectOption } from "@/components/ui/multi-select";

export type PlanTableColumnKey =
  | "rank"
  | "carrierPlan"
  | "planType"
  | "monthly"
  | "annual"
  | "stars";

export const PLAN_TABLE_COLUMNS: {
  key: PlanTableColumnKey;
  label: string;
  align?: "left" | "right";
}[] = [
  { key: "rank", label: "#", align: "left" },
  { key: "carrierPlan", label: "Carrier / plan", align: "left" },
  { key: "planType", label: "Type", align: "left" },
  { key: "monthly", label: "/mo", align: "right" },
  { key: "annual", label: "/yr", align: "right" },
  { key: "stars", label: "★", align: "right" },
];

export type PlanTableFilters = Record<PlanTableColumnKey, string[]>;

export function emptyPlanTableFilters(): PlanTableFilters {
  return {
    rank: [],
    carrierPlan: [],
    planType: [],
    monthly: [],
    annual: [],
    stars: [],
  };
}

export function planTableColumnValue(plan: PlanDetail, column: PlanTableColumnKey): string {
  switch (column) {
    case "rank":
      return String(plan.rank);
    case "carrierPlan":
      return planDetailKey(plan);
    case "planType":
      return plan.planType;
    case "monthly":
      return String(plan.monthly);
    case "annual":
      return String(plan.annual);
    case "stars":
      return plan.stars;
    default:
      return "";
  }
}

export function planTableColumnOptionLabel(
  plan: PlanDetail,
  column: PlanTableColumnKey,
): string {
  switch (column) {
    case "rank":
      return `#${plan.rank}`;
    case "carrierPlan":
      return `${plan.carrier} — ${plan.plan}`;
    case "monthly":
      return planUsd(plan.monthly);
    case "annual":
      return planUsd(plan.annual);
    default:
      return planTableColumnValue(plan, column);
  }
}

export function planTableFilterOptions(
  plans: PlanDetail[],
  column: PlanTableColumnKey,
): MultiSelectOption[] {
  const seen = new Map<string, string>();
  for (const plan of plans) {
    const value = planTableColumnValue(plan, column);
    if (!seen.has(value)) {
      seen.set(value, planTableColumnOptionLabel(plan, column));
    }
  }
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" }));
}

export function filterPlanTableRows(
  plans: PlanDetail[],
  filters: PlanTableFilters,
): PlanDetail[] {
  return plans.filter((plan) =>
    PLAN_TABLE_COLUMNS.every((column) =>
      multiSelectMatches(filters[column.key], planTableColumnValue(plan, column.key)),
    ),
  );
}

export function hasActivePlanTableFilters(filters: PlanTableFilters): boolean {
  return PLAN_TABLE_COLUMNS.some((column) => filters[column.key].length > 0);
}

export function isPlanTableFilterOptionChecked(
  selected: string[],
  optionValue: string,
  allValues: string[],
): boolean {
  if (selected.length === 0 || selected.length === allValues.length) return true;
  if (selected.length === 1 && selected[0] === "__none__") return false;
  return selected.includes(optionValue);
}

export function togglePlanTableFilterOption(
  selected: string[],
  optionValue: string,
  checked: boolean,
  allValues: string[],
): string[] {
  if (selected.length === 0) {
    if (checked) return [];
    return allValues.filter((value) => value !== optionValue);
  }
  if (selected.length === 1 && selected[0] === "__none__") {
    return checked ? [optionValue] : ["__none__"];
  }
  const set = new Set(selected);
  if (checked) set.add(optionValue);
  else set.delete(optionValue);
  const next = Array.from(set);
  if (next.length === 0) return ["__none__"];
  if (next.length === allValues.length) return [];
  return next;
}

export function clearPlanTableColumnFilter(): string[] {
  return [];
}

/** Match nothing — opposite of select-all (empty array). */
export function deselectPlanTableColumnFilter(): string[] {
  return ["__none__"];
}

export function isPlanTableColumnDeselected(selected: string[]): boolean {
  return selected.length === 1 && selected[0] === "__none__";
}

export function planTableSortKeyForColumn(column: PlanTableColumnKey): PlanSortKey {
  return column === "carrierPlan" ? "carrier" : column;
}
