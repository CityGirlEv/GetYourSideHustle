import { Fragment, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ListFilter,
} from "lucide-react";
import { ActiveProspectCertificationBlurb } from "@/components/ActiveProspectCertificationBlurb";
import { trustedFormVerifyDomain } from "@/lib/trustedform-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PLAN_TABLE_HEADER_CELL_CLASS } from "@/lib/benchmark-report-ui";
import {
  LEAD_CERTIFICATE_COLUMNS,
  certificateDetailPayload,
  emptyLeadCertificateTableFilters,
  filterLeadCertificateRows,
  hasActiveLeadCertificateFilters,
  leadCertificateFilterOptions,
  leadCertificateColumnValue,
  nextLeadCertificateSortState,
  sortLeadCertificateRows,
  type LeadCertificateAuditRow,
  type LeadCertificateColumnKey,
  type LeadCertificateSortDirection,
  type LeadCertificateSortKey,
  type LeadCertificateTableFilters,
} from "@/lib/lead-certificate-audit-table";
import {
  deselectPlanTableColumnFilter,
  isPlanTableColumnDeselected,
  isPlanTableFilterOptionChecked,
  togglePlanTableFilterOption,
} from "@/lib/plan-table-filter";
import { cn } from "@/lib/utils";

export type { LeadCertificateAuditRow };

const FILTER_SEARCH_THRESHOLD = 20;
const COLUMN_COUNT = LEAD_CERTIFICATE_COLUMNS.length + 1;

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: LeadCertificateSortDirection;
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

function LeadCertificateHeaderFilter({
  column,
  rows,
  value,
  onChange,
}: {
  column: LeadCertificateColumnKey;
  rows: LeadCertificateAuditRow[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const options = useMemo(
    () => leadCertificateFilterOptions(rows, column),
    [rows, column],
  );
  const allValues = useMemo(() => options.map((option) => option.value), [options]);
  const active = value.length > 0 && !(value.length === 1 && value[0] === "__none__");
  const searchable = options.length > FILTER_SEARCH_THRESHOLD;
  const visibleOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const query = search.toLowerCase().trim();
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, search, searchable]);

  const columnLabel = LEAD_CERTIFICATE_COLUMNS.find((col) => col.key === column)?.label ?? column;

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
        <div className="flex min-w-0 items-center justify-between gap-2 border-b px-2 py-1.5">
          <span className="shrink-0 whitespace-nowrap text-xs font-semibold">
            Filter {columnLabel}
          </span>
          <div className="flex shrink-0 items-center gap-2.5">
            <label
              className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap text-[11px] font-medium"
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
              className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap text-[11px] font-medium"
              onPointerDown={(event) => event.preventDefault()}
            >
              <Checkbox
                checked={isPlanTableColumnDeselected(value)}
                onCheckedChange={(checked) =>
                  onChange(checked ? deselectPlanTableColumnFilter() : [])
                }
                className="h-3.5 w-3.5"
                aria-label="Clear filter"
              />
              Clear
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
              className="items-start whitespace-normal text-xs"
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

export function LeadCertificateAuditTable({
  certificates,
}: {
  certificates: LeadCertificateAuditRow[];
}) {
  const [sortKey, setSortKey] = useState<LeadCertificateSortKey>("submitted");
  const [sortDirection, setSortDirection] = useState<LeadCertificateSortDirection>("desc");
  const [filters, setFilters] = useState<LeadCertificateTableFilters>(() =>
    emptyLeadCertificateTableFilters(),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredCertificates = useMemo(
    () => filterLeadCertificateRows(certificates, filters),
    [certificates, filters],
  );

  const displayCertificates = useMemo(
    () => sortLeadCertificateRows(filteredCertificates, sortKey, sortDirection),
    [filteredCertificates, sortKey, sortDirection],
  );

  const handleSort = (column: LeadCertificateColumnKey) => {
    const next = nextLeadCertificateSortState(sortKey, sortDirection, column);
    setSortKey(next.key);
    setSortDirection(next.direction);
  };

  const toggleExpanded = (certId: string) => {
    setExpandedId((current) => (current === certId ? null : certId));
  };

  const subtitle =
    certificates.length === 0
      ? "TrustedForm certificate links appear here after someone successfully submits the expert opt-in form. None recorded yet."
      : "Immutable record of consent language shown and checkbox responses at submission. Click a row for full JSON. Most recent 500 shown.";

  return (
    <Card id="lead-certificates" className="glass scroll-mt-24 overflow-hidden">
      <div className="space-y-1 border-b border-border/40 p-4">
        <h3 className="font-display font-bold">Lead certificates (consent audit trail)</h3>
        <p className="text-xs leading-snug text-muted-foreground">{subtitle}</p>
      </div>

      <ActiveProspectCertificationBlurb embedded className="border-b border-border/40 px-4 py-3" />

      {certificates.length > 0 ? (
        <div className="space-y-3 px-4 pb-4 pt-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            TrustedForm certificate URLs appear when ActiveProspect domain{" "}
            <strong>{trustedFormVerifyDomain()}</strong> is verified and Auto-Retain is enabled.
            ActiveProspect setup: My Account → Domains → add {trustedFormVerifyDomain()} → Verify
            Ownership (TXT in Cloudflare DNS) → TrustedForm → Issuing Certificates → enable
            Auto-Retain for the verified domain.
          </p>
          <div className="max-h-[min(70vh,640px)] overflow-y-auto overscroll-contain overflow-x-auto rounded-md border border-border/60">
            {hasActiveLeadCertificateFilters(filters) ? (
              <p className="border-b border-border/40 bg-muted/20 px-2 py-1 text-[10px] text-muted-foreground">
                Showing {displayCertificates.length.toLocaleString()} of{" "}
                {certificates.length.toLocaleString()} certificates
              </p>
            ) : null}
            <table className="w-full min-w-[60rem] border-separate border-spacing-0 text-sm">
              <thead
                className={cn(
                  "sticky top-0 z-10 shadow-[0_2px_4px_rgba(0,0,0,0.18)]",
                  "[&_th]:bg-[var(--brand-navy)] [&_th]:text-white",
                )}
              >
                <tr className="bg-[var(--brand-navy)] text-white">
                  <th
                    className={cn(
                      PLAN_TABLE_HEADER_CELL_CLASS,
                      "w-8 px-2 py-2 text-left text-xs uppercase tracking-wider",
                    )}
                    aria-label="Expand"
                  />
                  {LEAD_CERTIFICATE_COLUMNS.map((column) => {
                    const isSorted = sortKey === column.key;
                    return (
                      <th
                        key={column.key}
                        className={cn(
                          PLAN_TABLE_HEADER_CELL_CLASS,
                          "px-3 py-2 text-left text-xs uppercase tracking-wider",
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
                          <LeadCertificateHeaderFilter
                            column={column.key}
                            rows={certificates}
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
                {displayCertificates.map((cert) => {
                  const expanded = expandedId === cert.id;
                  return (
                    <Fragment key={cert.id}>
                      <tr
                        className="cursor-pointer border-t border-border align-top hover:bg-secondary/30"
                        onClick={() => toggleExpanded(cert.id)}
                      >
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded p-0.5 hover:bg-secondary/50"
                            aria-expanded={expanded}
                            aria-label={expanded ? "Collapse details" : "Expand details"}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleExpanded(cert.id);
                            }}
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 tabular-nums text-muted-foreground">
                          {new Date(cert.submitted_at).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {leadCertificateColumnValue(cert, "zip")}
                        </td>
                        <td className="px-3 py-2">{cert.consumer_name}</td>
                        <td className="px-3 py-2 font-mono text-xs">{cert.scenario_code ?? "—"}</td>
                        <td className="px-3 py-2 text-xs">{cert.agency_name}</td>
                        <td className="px-3 py-2 text-xs">
                          {cert.assigned_agent_name ?? (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          Privacy {cert.privacy_acknowledged ? "✓" : "✗"} · Contact{" "}
                          {cert.contact_authorized ? "✓" : "✗"} · Marketing{" "}
                          {cert.marketing_opt_in ? "✓" : "—"}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{cert.ip_address ?? "—"}</td>
                        <td
                          className="max-w-[12rem] truncate px-3 py-2 text-xs"
                          title={cert.source_url ?? undefined}
                        >
                          {cert.source_url ? (
                            <a
                              href={cert.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                              onClick={(event) => event.stopPropagation()}
                            >
                              {cert.source_url.replace(/^https?:\/\//, "")}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {cert.trustedform_cert_url ? (
                            <a
                              href={cert.trustedform_cert_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                              onClick={(event) => event.stopPropagation()}
                            >
                              View cert
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{cert.id.slice(0, 8)}…</td>
                      </tr>
                      {expanded ? (
                        <tr className="border-t border-border bg-secondary/20">
                          <td colSpan={COLUMN_COUNT} className="px-3 py-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Full certificate record
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void navigator.clipboard.writeText(
                                    JSON.stringify(certificateDetailPayload(cert), null, 2),
                                  );
                                }}
                              >
                                Copy JSON
                              </Button>
                            </div>
                            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-md border bg-background p-3 font-mono text-[11px] leading-relaxed">
                              {JSON.stringify(certificateDetailPayload(cert), null, 2)}
                            </pre>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
                {displayCertificates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMN_COUNT}
                      className="px-3 py-6 text-center text-muted-foreground"
                    >
                      No certificates match the current filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
