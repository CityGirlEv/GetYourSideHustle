import { Link } from "@tanstack/react-router";
import { ChevronDown, Clock, Search } from "lucide-react";
import { type MouseEvent, useMemo, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  canShowMergedBenchmarkHistory,
  useBenchmarkEstimateHistory,
  type BenchmarkHistoryListKind,
} from "@/hooks/use-benchmark-estimate-history";
import { useApp } from "@/lib/app-store";
import { isBenchmarkEstimateId } from "@/lib/benchmark-id";
import {
  filterBenchmarkEstimateHistory,
  formatBenchmarkSavedAt,
  type BenchmarkEstimateHistoryEntry,
} from "@/lib/benchmark-estimate-history";
import {
  BENCHMARK_TOOL_ID_LABEL,
  BENCHMARK_TOOL_REPORTS_LABEL,
  PREVIOUS_BENCHMARK_TOOL_REPORTS_LABEL,
  PREVIOUS_ESTIMATES_LABEL,
} from "@/lib/plan-comparison-copy";
import {
  BENCHMARK_PREVIOUS_SCENARIOS_ANCHOR,
  BENCHMARK_REPORT_LINK_CLASS,
  BENCHMARK_REPORT_STICKY_SCROLL_MT,
  scrollToPreviousScenariosSection,
  type BenchmarkPreviousScenariosSectionId,
} from "@/lib/benchmark-report-ui";
import { cn } from "@/lib/utils";

/** Anchor for saved benchmarks on the Part B Optimizer Benchmark Tool page (/scenario/new). */
export const BENCHMARK_TOOL_PREVIOUS_ANCHOR = "previous-benchmarks-on-device";

const ON_DEVICE_LABEL = "On this device";
const SERVER_LABEL = "All saved reports";

function scrollToBenchmarkToolPrevious(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document
    .getElementById(BENCHMARK_TOOL_PREVIOUS_ANCHOR)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToPreviousScenarios(
  event: MouseEvent<HTMLAnchorElement>,
  section: BenchmarkPreviousScenariosSectionId,
) {
  event.preventDefault();
  scrollToPreviousScenariosSection(section);
}

function previousBenchmarkListTitle(label: string, count: number, total?: number): string {
  if (total != null && total !== count) {
    return `${label} (${count} of ${total})`;
  }
  return `${label} (${count})`;
}

function benchmarkHistoryLinkProps(entry: BenchmarkEstimateHistoryEntry, listKind: BenchmarkHistoryListKind) {
  if (listKind === "all" && !isBenchmarkEstimateId(entry.id)) {
    return {
      to: "/scenario/$code" as const,
      params: { code: entry.id },
    };
  }
  return {
    to: "/scenario/estimate/$code" as const,
    params: { code: entry.id },
  };
}

function canShowServerBenchmarkHistory(user: ReturnType<typeof useApp>["user"]): boolean {
  return canShowMergedBenchmarkHistory(user);
}

function PreviousBenchmarkHistoryList({
  entries,
  totalEntries,
  label,
  currentEstimateId,
  defaultOpen = true,
  listKind = "device",
  searchQuery = "",
  onSearchQueryChange,
  showSearch = false,
}: {
  entries: BenchmarkEstimateHistoryEntry[];
  totalEntries?: number;
  label: string;
  currentEstimateId?: string;
  defaultOpen?: boolean;
  listKind?: BenchmarkHistoryListKind;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  showSearch?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const total = totalEntries ?? entries.length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="mb-2 flex w-full cursor-pointer items-center gap-1.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1">
          {previousBenchmarkListTitle(label, entries.length, total)}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {showSearch && onSearchQueryChange ? (
          <div className="mb-2 relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search by ZIP, BM-, or SCN- ID…"
              className="h-8 pl-8 text-xs"
              aria-label="Search previous benchmark reports"
            />
          </div>
        ) : null}
        {entries.length > 0 ? (
          <ul className="max-h-64 overflow-y-auto overscroll-contain flex flex-wrap gap-2 pr-1">
            {entries.map((entry) => {
              const isCurrent = entry.id === currentEstimateId;
              const linkProps = benchmarkHistoryLinkProps(entry, listKind);
              return (
                <li key={`${listKind}-${entry.id}`}>
                  <Link
                    {...linkProps}
                    className={cn(
                      "inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                      isCurrent
                        ? "border-emerald/50 bg-emerald/10 hover:bg-emerald/15"
                        : "border-border bg-background hover:border-primary/40 hover:bg-primary/5",
                    )}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    <span className="font-mono text-primary">{entry.id}</span>
                    <span className="text-muted-foreground">
                      {entry.zip3 === "—" ? "ZIP —" : `ZIP ${entry.zip3}xx`}
                    </span>
                    <span className="text-micro text-muted-foreground">
                      {entry.createdAt ? formatBenchmarkSavedAt(entry.createdAt) : "Recovered"}
                    </span>
                    {isCurrent ? (
                      <span className="text-micro font-semibold text-emerald-700">Current</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {searchQuery.trim()
              ? "No reports match your search."
              : "No saved reports in this list yet."}
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function PreviousBenchmarkHistoryPanel({
  currentEstimateId,
  label,
  className,
  anchorId,
}: {
  currentEstimateId?: string;
  label: string;
  className?: string;
  anchorId?: string;
}) {
  const { user } = useApp();
  const history = useBenchmarkEstimateHistory(currentEstimateId, user);
  const showServerTab = canShowServerBenchmarkHistory(user);
  const defaultListKind: BenchmarkHistoryListKind = showServerTab ? "all" : "device";

  const [searchQuery, setSearchQuery] = useState("");
  const [listKind, setListKind] = useState<BenchmarkHistoryListKind>(defaultListKind);

  const activeSource = listKind === "all" ? history.all : history.device;
  const filteredEntries = useMemo(
    () => filterBenchmarkEstimateHistory(activeSource, searchQuery),
    [activeSource, searchQuery],
  );

  const hasAnyEntries = history.device.length > 0 || history.all.length > 0;
  const showSearch = activeSource.length > 5 || searchQuery.trim().length > 0;

  return (
    <div className={className}>
      {anchorId ? (
        <div
          id={anchorId}
          tabIndex={-1}
          className={cn("outline-none", BENCHMARK_REPORT_STICKY_SCROLL_MT)}
        />
      ) : null}
      {showServerTab ? (
        <div className="mb-2 inline-flex rounded-md border border-border bg-muted/30 p-0.5 text-[11px] font-medium">
          <button
            type="button"
            className={cn(
              "rounded px-2.5 py-1 transition-colors",
              listKind === "device"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setListKind("device")}
          >
            {ON_DEVICE_LABEL}
          </button>
          <button
            type="button"
            className={cn(
              "rounded px-2.5 py-1 transition-colors",
              listKind === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setListKind("all")}
          >
            {SERVER_LABEL}
          </button>
        </div>
      ) : null}
      {hasAnyEntries || history.loadingServer ? (
        <PreviousBenchmarkHistoryList
          entries={filteredEntries}
          totalEntries={activeSource.length}
          label={label}
          currentEstimateId={currentEstimateId}
          listKind={listKind}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          showSearch={showSearch}
        />
      ) : (
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {label}
        </div>
      )}
      {!hasAnyEntries && !history.loadingServer ? (
        <p className="text-xs text-muted-foreground leading-relaxed">
          No saved {BENCHMARK_TOOL_REPORTS_LABEL.toLowerCase()} on this device yet. Complete the
          intake wizard and your {BENCHMARK_TOOL_ID_LABEL} will appear here.
        </p>
      ) : null}
      {history.loadingServer && listKind === "all" ? (
        <p className="text-xs text-muted-foreground">Loading saved reports from server…</p>
      ) : null}
      {history.serverError && listKind === "all" ? (
        <p className="text-xs text-destructive">{history.serverError}</p>
      ) : null}
    </div>
  );
}

/** In-page link — scrolls to saved scenarios at the bottom of the active report tab. */
export function PreviousScenariosLink({
  section,
  className,
}: {
  section: BenchmarkPreviousScenariosSectionId;
  className?: string;
}) {
  const anchorId = BENCHMARK_PREVIOUS_SCENARIOS_ANCHOR[section];

  return (
    <a
      href={`#${anchorId}`}
      onClick={(event) => scrollToPreviousScenarios(event, section)}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80",
        BENCHMARK_REPORT_LINK_CLASS,
        className,
      )}
    >
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {PREVIOUS_BENCHMARK_TOOL_REPORTS_LABEL}
    </a>
  );
}

/** Saved benchmarks on this device — anchor target at the bottom of a report tab. */
export function PreviousScenariosSection({
  section,
  currentEstimateId,
  className,
}: {
  section: BenchmarkPreviousScenariosSectionId;
  currentEstimateId?: string;
  className?: string;
}) {
  const anchorId = BENCHMARK_PREVIOUS_SCENARIOS_ANCHOR[section];

  return (
    <div className={cn("border-t border-border/60 px-5 py-4", className)}>
      <PreviousBenchmarkHistoryPanel
        currentEstimateId={currentEstimateId}
        label={PREVIOUS_BENCHMARK_TOOL_REPORTS_LABEL}
        anchorId={anchorId}
      />
    </div>
  );
}

/** Bottom-of-page link on /scenario/new — only when saved benchmarks exist on this device. */
export function PreviousBenchmarksOnDeviceLink({ className }: { className?: string }) {
  const { user } = useApp();
  const history = useBenchmarkEstimateHistory(undefined, user);
  if (history.device.length === 0 && history.all.length === 0) return null;

  return (
    <a
      href={`#${BENCHMARK_TOOL_PREVIOUS_ANCHOR}`}
      onClick={scrollToBenchmarkToolPrevious}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80",
        BENCHMARK_REPORT_LINK_CLASS,
        className,
      )}
    >
      <Clock className="h-4 w-4 shrink-0" aria-hidden />
      {PREVIOUS_ESTIMATES_LABEL}
    </a>
  );
}

/** Saved benchmark list at the bottom of /scenario/new — hidden when none on device. */
export function PreviousBenchmarksOnDevicePanel({ className }: { className?: string }) {
  const { user } = useApp();
  const history = useBenchmarkEstimateHistory(undefined, user);
  if (history.device.length === 0 && history.all.length === 0) return null;

  return (
    <div
      id={BENCHMARK_TOOL_PREVIOUS_ANCHOR}
      className={cn(
        "scroll-mt-24 rounded-lg border border-border bg-white/60 p-3",
        BENCHMARK_REPORT_STICKY_SCROLL_MT,
        className,
      )}
    >
      <PreviousBenchmarkHistoryPanel label={PREVIOUS_ESTIMATES_LABEL} />
    </div>
  );
}
