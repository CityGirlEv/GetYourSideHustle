import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ListFilter,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ADMIN_SCENARIO_COLUMNS,
  adminScenarioFilterOptions,
  emptyAdminScenarioTableFilters,
  filterAdminScenarioRows,
  hasActiveAdminScenarioFilters,
  nextAdminScenarioSortState,
  sortAdminScenarioRows,
  type AdminScenarioColumnKey,
  type AdminScenarioRow,
  type AdminScenarioSortDirection,
  type AdminScenarioSortKey,
  type AdminScenarioTableContext,
  type AdminScenarioTableFilters,
} from "@/lib/admin-scenario-table";
import {
  deselectPlanTableColumnFilter,
  isPlanTableColumnDeselected,
  isPlanTableFilterOptionChecked,
  togglePlanTableFilterOption,
} from "@/lib/plan-table-filter";
import { PLAN_TABLE_HEADER_CELL_CLASS } from "@/lib/benchmark-report-ui";
import { formatBenchmarkSavedAt } from "@/lib/benchmark-estimate-history";

const FILTER_SEARCH_THRESHOLD = 20;

interface AgentOption {
  id: string;
  full_name: string;
  email: string;
}

interface AdminContactRow {
  id: string;
  full_name: string | null;
  email: string;
  phone: string;
  scenario_code: string | null;
  submitted_at: string | null;
  created_at: string;
  ip_address: string | null;
  source_url: string | null;
}

interface AdminLeadCertificateRow {
  id: string;
  assigned_agent_name: string | null;
  ip_address: string | null;
  source_url: string | null;
  marketing_opt_in: boolean;
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: AdminScenarioSortDirection;
}) {
  if (!active) {
    return <ArrowUpDown className="h-3 w-3 shrink-0 opacity-50" aria-hidden />;
  }
  return direction === "asc" ? (
    <ArrowUp className="h-3 w-3 shrink-0" aria-hidden />
  ) : (
    <ArrowDown className="h-3 w-3 shrink-0" aria-hidden />
  );
}

function AdminScenarioHeaderFilter({
  column,
  rows,
  ctx,
  value,
  onChange,
}: {
  column: AdminScenarioColumnKey;
  rows: AdminScenarioRow[];
  ctx: AdminScenarioTableContext;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const options = useMemo(() => adminScenarioFilterOptions(rows, column, ctx), [rows, column, ctx]);
  const allValues = useMemo(() => options.map((option) => option.value), [options]);
  const active = value.length > 0 && !(value.length === 1 && value[0] === "__none__");
  const searchable = options.length > FILTER_SEARCH_THRESHOLD;
  const visibleOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const query = search.toLowerCase().trim();
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, search, searchable]);

  const columnLabel = ADMIN_SCENARIO_COLUMNS.find((col) => col.key === column)?.label ?? column;

  return (
    <DropdownMenu onOpenChange={(open) => !open && setSearch("")}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white",
            active && "text-emerald-200",
          )}
          aria-label={`Filter ${columnLabel}`}
          onClick={(event) => event.stopPropagation()}
        >
          <ListFilter className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="z-[120] min-w-[12rem] w-max max-w-[min(28rem,calc(100vw-2rem))] overflow-x-auto p-0"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b px-2 py-1.5 min-w-0">
          <span className="text-xs font-semibold shrink-0 whitespace-nowrap">
            Filter {columnLabel}
          </span>
          <div className="flex items-center gap-2.5 shrink-0">
            <label
              className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium whitespace-nowrap"
              onPointerDown={(event) => event.preventDefault()}
            >
              <Checkbox
                checked={value.length === 0}
                onCheckedChange={(checked) =>
                  onChange(checked ? [] : deselectPlanTableColumnFilter())
                }
                className="h-3.5 w-3.5"
                aria-label="Select all"
              />
              Select all
            </label>
            <label
              className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium whitespace-nowrap"
              onPointerDown={(event) => event.preventDefault()}
            >
              <Checkbox
                checked={isPlanTableColumnDeselected(value)}
                onCheckedChange={(checked) =>
                  onChange(checked ? deselectPlanTableColumnFilter() : [])
                }
                className="h-3.5 w-3.5"
                aria-label="Deselect all"
              />
              Deselect all
            </label>
          </div>
        </div>
        {searchable ? (
          <div className="px-2 pb-2 pt-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search…"
              className="h-8 text-xs"
            />
          </div>
        ) : null}
        <div className="max-h-56 overflow-y-auto overflow-x-visible px-1 pb-1">
          {visibleOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isPlanTableFilterOptionChecked(value, option.value, allValues)}
              onCheckedChange={(checked) =>
                onChange(
                  togglePlanTableFilterOption(value, option.value, Boolean(checked), allValues),
                )
              }
              onSelect={(event) => event.preventDefault()}
              className="text-xs items-start whitespace-normal"
            >
              <span className="break-words">{option.label}</span>
            </DropdownMenuCheckboxItem>
          ))}
          {visibleOptions.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">No matches.</p>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminScenariosTable({
  scenarios,
  loadingData,
  agents,
  contactsByCode,
  certificatesByRequestId,
  onAssignAgent,
  onManageNotes,
}: {
  scenarios: AdminScenarioRow[];
  loadingData: boolean;
  agents: AgentOption[];
  contactsByCode: Map<string, AdminContactRow[]>;
  certificatesByRequestId: Map<string, AdminLeadCertificateRow>;
  onAssignAgent: (scenarioId: string, agentId: string) => void;
  onManageNotes: (scenario: AdminScenarioRow) => void;
}) {
  const [sortKey, setSortKey] = useState<AdminScenarioSortKey>("created");
  const [sortDirection, setSortDirection] = useState<AdminScenarioSortDirection>("desc");
  const [filters, setFilters] = useState<AdminScenarioTableFilters>(() =>
    emptyAdminScenarioTableFilters(),
  );

  const tableContext = useMemo<AdminScenarioTableContext>(() => {
    const agentLabelById = new Map<string, string>();
    for (const agent of agents) {
      agentLabelById.set(agent.id, agent.full_name || agent.email);
    }
    return {
      contactsByCode,
      agentLabelById,
    };
  }, [agents, contactsByCode]);

  const filteredScenarios = useMemo(
    () => filterAdminScenarioRows(scenarios, filters, tableContext),
    [scenarios, filters, tableContext],
  );

  const displayScenarios = useMemo(
    () => sortAdminScenarioRows(filteredScenarios, sortKey, sortDirection, tableContext),
    [filteredScenarios, sortKey, sortDirection, tableContext],
  );

  const handleSort = (column: AdminScenarioColumnKey) => {
    const next = nextAdminScenarioSortState(sortKey, sortDirection, column);
    setSortKey(next.key);
    setSortDirection(next.direction);
  };

  return (
    <div className="max-h-[min(70vh,640px)] overflow-y-auto overscroll-contain overflow-x-auto">
      {hasActiveAdminScenarioFilters(filters) ? (
        <p className="px-2 py-1 text-[10px] text-muted-foreground border-b border-border/40 bg-muted/20">
          Showing {displayScenarios.length.toLocaleString()} of {scenarios.length.toLocaleString()}{" "}
          scenarios
        </p>
      ) : null}
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead
          className={cn(
            "sticky top-0 z-30 shadow-[0_2px_4px_rgba(0,0,0,0.18)]",
            "[&_th]:bg-[var(--brand-navy)] [&_th]:text-white",
          )}
        >
          <tr className="bg-[var(--brand-navy)] text-white">
            {ADMIN_SCENARIO_COLUMNS.map((column) => {
              const isSorted = sortKey === column.key;
              return (
                <th
                  key={column.key}
                  className={cn(
                    PLAN_TABLE_HEADER_CELL_CLASS,
                    "text-left text-xs uppercase tracking-wider",
                    column.align === "right" && "text-right",
                  )}
                  aria-sort={
                    isSorted ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
                  }
                >
                  <div
                    className={cn(
                      "flex items-center gap-0.5",
                      column.align === "right" ? "justify-end" : "justify-start",
                    )}
                  >
                    <button
                      type="button"
                      className={cn(
                        "inline-flex min-w-0 cursor-pointer items-center gap-0.5 rounded hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white",
                        column.align === "right" && "flex-row-reverse",
                      )}
                      onClick={() => handleSort(column.key)}
                    >
                      <span>{column.label}</span>
                      <SortIndicator active={isSorted} direction={sortDirection} />
                    </button>
                    <AdminScenarioHeaderFilter
                      column={column.key}
                      rows={scenarios}
                      ctx={tableContext}
                      value={filters[column.key]}
                      onChange={(next) =>
                        setFilters((current) => ({ ...current, [column.key]: next }))
                      }
                    />
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {displayScenarios.map((s) => {
            const reqs = contactsByCode.get(s.scenario_code) ?? [];
            const medCount = Array.isArray(s.medications) ? s.medications.length : 0;
            const condCount = Array.isArray(s.conditions) ? s.conditions.length : 0;
            return (
              <tr key={s.id} className="border-t border-border align-top">
                <td className="px-3 py-2 text-muted-foreground tabular-nums whitespace-nowrap">
                  {formatBenchmarkSavedAt(s.created_at)}
                </td>
                <td className="px-3 py-2 text-xs">
                  <Select
                    value={s.assigned_agent_id ?? "__none"}
                    onValueChange={(v) => onAssignAgent(s.id, v)}
                  >
                    <SelectTrigger className="h-8 text-xs min-w-[160px]">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">— Unassigned —</SelectItem>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.full_name || a.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {s.assigned_at ? formatBenchmarkSavedAt(s.assigned_at) : "—"}
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  <Link
                    to="/scenario/$code"
                    params={{ code: s.scenario_code }}
                    className="text-primary hover:underline"
                  >
                    {s.scenario_code}
                  </Link>
                </td>
                <td className="px-3 py-2">{s.zip3}xx</td>
                <td className="px-3 py-2 tabular-nums">{s.birth_year}</td>
                <td className="px-3 py-2 capitalize">{(s.gender ?? "—").replace(/_/g, " ")}</td>
                <td className="px-3 py-2">{s.tobacco ? "Yes" : "No"}</td>
                <td className="px-3 py-2 text-xs">{s.income_band ?? "—"}</td>
                <td className="px-3 py-2 text-xs">
                  {s.cost_preference === "predictability" ? "Predictability" : "Min monthly"}
                </td>
                <td className="px-3 py-2 tabular-nums">{medCount}</td>
                <td className="px-3 py-2 tabular-nums">{condCount}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {s.claimed_at ? formatBenchmarkSavedAt(s.claimed_at) : "—"}
                </td>
                <td className="px-3 py-2 text-xs">
                  {reqs.length === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <div className="space-y-1">
                      {reqs.map((r) => {
                        const cert = certificatesByRequestId.get(r.id);
                        return (
                          <div
                            key={r.id}
                            className="rounded-md bg-emerald/5 border border-emerald/30 px-2 py-1"
                          >
                            {r.full_name && (
                              <div className="font-medium text-[11px]">{r.full_name}</div>
                            )}
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <a href={`mailto:${r.email}`} className="underline">
                                {r.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <a href={`tel:${r.phone}`} className="underline">
                                {r.phone}
                              </a>
                            </div>
                            {cert && (
                              <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                <div>Cert: {cert.id.slice(0, 8)}…</div>
                                {cert.assigned_agent_name && (
                                  <div>Agent: {cert.assigned_agent_name}</div>
                                )}
                                <div>
                                  Privacy ✓ · Contact ✓
                                  {cert.marketing_opt_in ? " · Marketing ✓" : ""}
                                </div>
                                {(r.ip_address || cert.ip_address) && (
                                  <div>IP: {r.ip_address ?? cert.ip_address}</div>
                                )}
                                {(r.source_url || cert.source_url) && (
                                  <div
                                    className="truncate max-w-[14rem]"
                                    title={r.source_url ?? cert.source_url ?? undefined}
                                  >
                                    URL: {r.source_url ?? cert.source_url}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="text-[10px] text-muted-foreground">
                              {formatBenchmarkSavedAt(r.submitted_at ?? r.created_at)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-xs max-w-xs">
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs justify-start w-fit cursor-pointer"
                      onClick={() => onManageNotes(s)}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1 text-primary" />
                      Manage notes
                    </Button>
                    {s.agent_notes && (
                      <span className="text-muted-foreground line-clamp-2 whitespace-pre-wrap text-[11px] pl-2 border-l border-border">
                        {s.agent_notes}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {!scenarios.length && !loadingData && (
            <tr>
              <td
                colSpan={ADMIN_SCENARIO_COLUMNS.length}
                className="px-3 py-6 text-center text-muted-foreground"
              >
                No scenarios yet.
              </td>
            </tr>
          )}
          {scenarios.length > 0 && displayScenarios.length === 0 && (
            <tr>
              <td
                colSpan={ADMIN_SCENARIO_COLUMNS.length}
                className="px-3 py-6 text-center text-muted-foreground"
              >
                No scenarios match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
