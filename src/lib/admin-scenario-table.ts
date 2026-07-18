import { multiSelectMatches } from "@/components/ui/multi-select";
import { formatBenchmarkSavedAt } from "@/lib/benchmark-estimate-history";
import type { MultiSelectOption } from "@/components/ui/multi-select";

export interface AdminScenarioRow {
  id: string;
  scenario_code: string;
  birth_year: number;
  zip3: string;
  gender: string | null;
  tobacco: boolean;
  income_band: string | null;
  cost_preference: string;
  medications: unknown;
  conditions: unknown;
  claimed_by: string | null;
  claimed_at: string | null;
  created_at: string;
  expires_at: string;
  wants_contact?: boolean;
  assigned_agent_id?: string | null;
  assigned_at?: string | null;
  agent_notes?: string | null;
}

export interface AdminScenarioTableContext {
  contactsByCode: Map<string, unknown[]>;
  agentLabelById: Map<string, string>;
}

export type AdminScenarioColumnKey =
  | "created"
  | "scenarioId"
  | "zip3"
  | "birthYear"
  | "gender"
  | "tobacco"
  | "income"
  | "priority"
  | "meds"
  | "conditions"
  | "claimed"
  | "optIn"
  | "assignedAgent"
  | "assignedAt"
  | "agentNotes";

export const ADMIN_SCENARIO_COLUMNS: {
  key: AdminScenarioColumnKey;
  label: string;
  align?: "left" | "right";
}[] = [
  { key: "created", label: "Created" },
  { key: "assignedAgent", label: "Assigned agent" },
  { key: "assignedAt", label: "Date assigned" },
  { key: "scenarioId", label: "Benchmark ID" },
  { key: "zip3", label: "ZIP3" },
  { key: "birthYear", label: "Birth yr", align: "right" },
  { key: "gender", label: "Gender" },
  { key: "tobacco", label: "Tobacco" },
  { key: "income", label: "Income" },
  { key: "priority", label: "Priority" },
  { key: "meds", label: "Meds", align: "right" },
  { key: "conditions", label: "Conditions", align: "right" },
  { key: "claimed", label: "Claimed" },
  { key: "optIn", label: "Opt-in contact" },
  { key: "agentNotes", label: "Agent notes" },
];

export type AdminScenarioTableFilters = Record<AdminScenarioColumnKey, string[]>;

export type AdminScenarioSortKey = AdminScenarioColumnKey;
export type AdminScenarioSortDirection = "asc" | "desc";

export function emptyAdminScenarioTableFilters(): AdminScenarioTableFilters {
  return Object.fromEntries(
    ADMIN_SCENARIO_COLUMNS.map((column) => [column.key, []]),
  ) as AdminScenarioTableFilters;
}

function medCount(row: AdminScenarioRow): number {
  return Array.isArray(row.medications) ? row.medications.length : 0;
}

function condCount(row: AdminScenarioRow): number {
  return Array.isArray(row.conditions) ? row.conditions.length : 0;
}

function formatGender(gender: string | null): string {
  return (gender ?? "—").replace(/_/g, " ");
}

function formatPriority(costPreference: string): string {
  return costPreference === "predictability" ? "Predictability" : "Min monthly";
}

function hasOptIn(row: AdminScenarioRow, ctx: AdminScenarioTableContext): boolean {
  const reqs = ctx.contactsByCode.get(row.scenario_code) ?? [];
  return reqs.length > 0 || Boolean(row.wants_contact);
}

function assignedAgentLabel(row: AdminScenarioRow, ctx: AdminScenarioTableContext): string {
  if (!row.assigned_agent_id) return "Unassigned";
  return ctx.agentLabelById.get(row.assigned_agent_id) ?? "Unknown agent";
}

export function adminScenarioColumnValue(
  row: AdminScenarioRow,
  column: AdminScenarioColumnKey,
  ctx: AdminScenarioTableContext,
): string {
  switch (column) {
    case "created":
      return formatBenchmarkSavedAt(row.created_at);
    case "scenarioId":
      return row.scenario_code;
    case "zip3":
      return `${row.zip3}xx`;
    case "birthYear":
      return String(row.birth_year);
    case "gender":
      return formatGender(row.gender);
    case "tobacco":
      return row.tobacco ? "Yes" : "No";
    case "income":
      return row.income_band ?? "—";
    case "priority":
      return formatPriority(row.cost_preference);
    case "meds":
      return String(medCount(row));
    case "conditions":
      return String(condCount(row));
    case "claimed":
      return row.claimed_at ? formatBenchmarkSavedAt(row.claimed_at) : "—";
    case "optIn":
      return hasOptIn(row, ctx) ? "Yes" : "No";
    case "assignedAgent":
      return assignedAgentLabel(row, ctx);
    case "assignedAt":
      return row.assigned_at ? formatBenchmarkSavedAt(row.assigned_at) : "—";
    case "agentNotes":
      return row.agent_notes?.trim() ? "Has notes" : "—";
    default:
      return "";
  }
}

function adminScenarioSortComparable(
  row: AdminScenarioRow,
  column: AdminScenarioColumnKey,
  ctx: AdminScenarioTableContext,
): string | number {
  switch (column) {
    case "created":
      return new Date(row.created_at).getTime();
    case "birthYear":
      return row.birth_year;
    case "meds":
      return medCount(row);
    case "conditions":
      return condCount(row);
    case "claimed":
      return row.claimed_at ? new Date(row.claimed_at).getTime() : 0;
    case "assignedAt":
      return row.assigned_at ? new Date(row.assigned_at).getTime() : 0;
    default:
      return adminScenarioColumnValue(row, column, ctx).toLowerCase();
  }
}

export function adminScenarioFilterOptions(
  rows: AdminScenarioRow[],
  column: AdminScenarioColumnKey,
  ctx: AdminScenarioTableContext,
): MultiSelectOption[] {
  const seen = new Map<string, string>();
  for (const row of rows) {
    const value = adminScenarioColumnValue(row, column, ctx);
    if (!seen.has(value)) {
      seen.set(value, value);
    }
  }
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" }),
    );
}

export function filterAdminScenarioRows(
  rows: AdminScenarioRow[],
  filters: AdminScenarioTableFilters,
  ctx: AdminScenarioTableContext,
): AdminScenarioRow[] {
  return rows.filter((row) =>
    ADMIN_SCENARIO_COLUMNS.every((column) =>
      multiSelectMatches(filters[column.key], adminScenarioColumnValue(row, column.key, ctx)),
    ),
  );
}

export function hasActiveAdminScenarioFilters(filters: AdminScenarioTableFilters): boolean {
  return ADMIN_SCENARIO_COLUMNS.some((column) => filters[column.key].length > 0);
}

export function sortAdminScenarioRows(
  rows: AdminScenarioRow[],
  key: AdminScenarioSortKey,
  direction: AdminScenarioSortDirection,
  ctx: AdminScenarioTableContext,
): AdminScenarioRow[] {
  const dir = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = adminScenarioSortComparable(a, key, ctx);
    const bv = adminScenarioSortComparable(b, key, ctx);
    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * dir;
    }
    return (
      String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" }) * dir
    );
  });
}

export function nextAdminScenarioSortState(
  currentKey: AdminScenarioSortKey,
  currentDir: AdminScenarioSortDirection,
  clicked: AdminScenarioSortKey,
): { key: AdminScenarioSortKey; direction: AdminScenarioSortDirection } {
  if (currentKey !== clicked) {
    return { key: clicked, direction: "asc" };
  }
  return { key: clicked, direction: currentDir === "asc" ? "desc" : "asc" };
}
