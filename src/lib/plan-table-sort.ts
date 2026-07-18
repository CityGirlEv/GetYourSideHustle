import type { PlanDetail } from "@/lib/plan-details";

export type PlanSortKey = "rank" | "carrier" | "planType" | "monthly" | "annual" | "stars";

export type PlanSortDirection = "asc" | "desc";

export function sortPlanDetails(
  plans: PlanDetail[],
  key: PlanSortKey,
  direction: PlanSortDirection,
): PlanDetail[] {
  const dir = direction === "asc" ? 1 : -1;
  const sorted = [...plans].sort((a, b) => {
    switch (key) {
      case "rank":
        return (a.rank - b.rank) * dir;
      case "carrier":
        return a.carrier.localeCompare(b.carrier) * dir;
      case "planType":
        return a.planType.localeCompare(b.planType) * dir;
      case "monthly":
        return (a.monthly - b.monthly) * dir;
      case "annual":
        return (a.annual - b.annual) * dir;
      case "stars": {
        const sa = parseFloat(a.stars);
        const sb = parseFloat(b.stars);
        const na = Number.isFinite(sa) ? sa : 0;
        const nb = Number.isFinite(sb) ? sb : 0;
        return (na - nb) * dir;
      }
      default:
        return 0;
    }
  });
  return sorted.map((plan, index) => ({ ...plan, rank: index + 1 }));
}

export function nextSortState(
  currentKey: PlanSortKey,
  currentDir: PlanSortDirection,
  clicked: PlanSortKey,
): { key: PlanSortKey; direction: PlanSortDirection } {
  if (currentKey !== clicked) {
    return { key: clicked, direction: clicked === "carrier" || clicked === "planType" ? "asc" : "asc" };
  }
  return { key: clicked, direction: currentDir === "asc" ? "desc" : "asc" };
}
