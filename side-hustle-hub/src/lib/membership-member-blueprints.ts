import { blueprintAgeGroupTitle, blueprintMatchLabel } from "./blueprint-match-labels";
import type { SavedBlueprint } from "./blueprints-api";

export type MemberBlueprintMatch = {
  id: string;
  rank: number;
  label: string;
  pct: number | undefined;
};

export type MemberBlueprintSummary = {
  id: string;
  title: string;
  completedAt: string;
  matchCount: number;
  matches: MemberBlueprintMatch[];
};

export function summarizeMemberBlueprint(
  bp: Pick<SavedBlueprint, "id" | "ageGroup" | "resultIds" | "resultPcts" | "completedAt">,
): MemberBlueprintSummary {
  const pcts = bp.resultPcts ?? {};
  return {
    id: bp.id,
    title: blueprintAgeGroupTitle(bp.ageGroup),
    completedAt: bp.completedAt,
    matchCount: bp.resultIds.length,
    matches: bp.resultIds.slice(0, 3).map((id, i) => ({
      id,
      rank: i + 1,
      label: blueprintMatchLabel(bp.ageGroup, id),
      pct: typeof pcts[id] === "number" ? pcts[id] : undefined,
    })),
  };
}

export function formatMemberBlueprintPct(pct: number | undefined): string {
  if (typeof pct !== "number" || !Number.isFinite(pct)) return "";
  return `${Math.round(pct)}%`;
}

export function parseMembershipBlueprintCounts(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const counts: Record<string, number> = {};
  for (const [id, n] of Object.entries(raw as Record<string, unknown>)) {
    const key = String(id || "").trim();
    const num = typeof n === "number" ? n : Number(n);
    if (!key || !Number.isFinite(num) || num < 0) continue;
    counts[key] = Math.floor(num);
  }
  return counts;
}

export function membershipBlueprintsToggleLabel(count: number | null | undefined): string {
  if (count == null || !Number.isFinite(count)) return "Blueprints";
  return `Blueprints (${Math.max(0, Math.floor(count))})`;
}
