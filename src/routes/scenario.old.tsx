import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { IntakeWizard } from "@/components/IntakeWizard";
import { VoiceIntakeWizard } from "@/components/VoiceIntakeWizard";
import { ScenarioNewHowItWorks } from "@/components/ScenarioNewHowItWorks";
import { ComparisonIdLookupForm } from "@/components/ComparisonIdLookupForm";
import { AppShell } from "@/components/AppShell";
import { ChevronDown, Clock, Mic, Keyboard, Search } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  canShowMergedBenchmarkHistory,
  useScenarioHistory,
  type ScenarioHistoryListKind,
} from "@/hooks/use-scenario-history";
import { useApp } from "@/lib/app-store";
import { filterScenarioHistory, type ScenarioHistoryEntry } from "@/lib/scenario-history";
import { VOICE_WIZARD_ENABLED, isVoiceWizardAvailable } from "@/lib/feature-flags";
import {
  BUILD_COMPARISON_HEADLINE,
  BUILD_COMPARISON_SUBTITLE,
  COMPARISON_ID_LABEL,
  PREVIOUS_COMPARISONS_LABEL,
} from "@/lib/plan-comparison-copy";
import { cn } from "@/lib/utils";

export type ScenarioOldSearch = {
  mode?: "manual" | "voice";
};

export const Route = createFileRoute("/scenario/old")({
  validateSearch: (search: Record<string, unknown>): ScenarioOldSearch => ({
    mode:
      VOICE_WIZARD_ENABLED && search.mode === "voice"
        ? "voice"
        : search.mode === "manual"
          ? "manual"
          : undefined,
  }),
  head: () => ({
    meta: [
      { title: `${BUILD_COMPARISON_HEADLINE} — No Personal Info Required` },
      {
        name: "description",
        content:
          "Compare sample Medicare plans for educational purposes. Build a de-identified plan comparison — we never collect your name, address, phone, or date of birth.",
      },
      { property: "og:title", content: `${BUILD_COMPARISON_HEADLINE} — No Personal Info Required` },
      {
        property: "og:description",
        content:
          "Create a zero-PII Medicare plan comparison in 2 minutes and get a shareable Comparison ID.",
      },
      { property: "og:url", content: "https://mypartb.com/scenario/old" },
    ],
    links: [{ rel: "canonical", href: "https://mypartb.com/scenario/old" }],
  }),
  component: ScenarioOld,
});

const ON_DEVICE_LABEL = "On this device";
const ALL_REPORTS_LABEL = "All reports";

function previousComparisonsTitle(count: number, total?: number): string {
  if (total != null && total !== count) {
    return `${PREVIOUS_COMPARISONS_LABEL} (${count} of ${total})`;
  }
  return `${PREVIOUS_COMPARISONS_LABEL} (${count})`;
}

function formatScenarioSavedAt(createdAt: number): string {
  if (!createdAt) return "Recovered";
  return new Date(createdAt).toLocaleDateString();
}

function PreviousComparisonsList({
  entries,
  totalEntries,
  searchQuery,
  onSearchQueryChange,
  showSearch,
}: {
  entries: ScenarioHistoryEntry[];
  totalEntries?: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  showSearch: boolean;
}) {
  const [open, setOpen] = useState(true);
  const total = totalEntries ?? entries.length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="mb-2 flex w-full cursor-pointer items-center gap-1.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1">{previousComparisonsTitle(entries.length, total)}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {showSearch ? (
          <div className="mb-2 relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search by ZIP or SCN- ID…"
              className="h-8 pl-8 text-xs"
              aria-label="Search previous comparisons"
            />
          </div>
        ) : null}
        {entries.length > 0 ? (
          <ul className="max-h-64 overflow-y-auto overscroll-contain flex flex-wrap gap-2 pr-1">
            {entries.map((entry) => (
              <li key={entry.code}>
                <Link
                  to="/scenario/$code"
                  params={{ code: entry.code }}
                  className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="font-mono text-primary">{entry.code}</span>
                  <span className="text-muted-foreground">
                    {entry.zip3 === "—" ? "ZIP —" : `ZIP ${entry.zip3}xx`}
                  </span>
                  <span className="text-micro text-muted-foreground">
                    {formatScenarioSavedAt(entry.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {searchQuery.trim()
              ? "No comparisons match your search."
              : "No saved comparisons in this list yet."}
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function PreviousComparisonsPanel({ className }: { className?: string }) {
  const { user } = useApp();
  const history = useScenarioHistory(undefined, user);
  const showMergedTab = canShowMergedBenchmarkHistory(user);
  const defaultListKind: ScenarioHistoryListKind = showMergedTab ? "all" : "device";
  const [searchQuery, setSearchQuery] = useState("");
  const [listKind, setListKind] = useState<ScenarioHistoryListKind>(defaultListKind);

  const activeSource = listKind === "all" ? history.all : history.device;
  const filteredEntries = useMemo(
    () => filterScenarioHistory(activeSource, searchQuery),
    [activeSource, searchQuery],
  );
  const hasAnyEntries = history.device.length > 0 || history.all.length > 0;
  const showSearch = activeSource.length > 5 || searchQuery.trim().length > 0;

  if (!hasAnyEntries && !history.loadingServer) return null;

  return (
    <div className={cn("max-w-3xl mx-auto mt-6 rounded-lg border border-border bg-white/60 p-3", className)}>
      {showMergedTab ? (
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
            {ALL_REPORTS_LABEL}
          </button>
        </div>
      ) : null}
      <PreviousComparisonsList
        entries={filteredEntries}
        totalEntries={activeSource.length}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showSearch={showSearch}
      />
      {history.loadingServer && listKind === "all" ? (
        <p className="text-xs text-muted-foreground">Loading saved comparisons from server…</p>
      ) : null}
      {history.serverError && listKind === "all" ? (
        <p className="text-xs text-destructive">{history.serverError}</p>
      ) : null}
    </div>
  );
}

function ScenarioOld() {
  const router = useRouter();
  const { user } = useApp();
  const voiceWizardAvailable = isVoiceWizardAvailable(user);
  const { mode: searchMode } = Route.useSearch();
  const [mode, setMode] = useState<"manual" | "voice">(() =>
    voiceWizardAvailable && searchMode === "voice" ? "voice" : "manual",
  );

  useEffect(() => {
    if (!voiceWizardAvailable && mode === "voice") setMode("manual");
  }, [voiceWizardAvailable, mode]);

  useEffect(() => {
    if (voiceWizardAvailable && searchMode === "voice") setMode("voice");
  }, [voiceWizardAvailable, searchMode]);

  const showModeToggle = voiceWizardAvailable;
  const activeMode = voiceWizardAvailable && mode === "voice" ? "voice" : "manual";

  return (
    <AppShell
      title={BUILD_COMPARISON_HEADLINE}
      subtitle={`${BUILD_COMPARISON_SUBTITLE} You'll get a ${COMPARISON_ID_LABEL} at the end — share it with the agent of your choice.`}
    >
      <ScenarioNewHowItWorks className="max-w-3xl mx-auto mb-6" />

      {showModeToggle ? (
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-full border border-border bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full transition ${activeMode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              {activeMode === "manual" ? (
                <span className="flex flex-col items-start leading-tight text-left">
                  <span>You are in Manual Wizard mode</span>
                  <span className="text-micro font-normal opacity-90">(complete form below)</span>
                </span>
              ) : (
                <span>Go back to Manual Wizard</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMode("voice")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full transition ${activeMode === "voice" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Mic className="h-3.5 w-3.5" /> Voice
            </button>
          </div>
        </div>
      ) : null}

      {activeMode === "manual" ? (
        <IntakeWizard
          onDone={(code) => router.navigate({ to: "/scenario/created/$code", params: { code } })}
        />
      ) : (
        <VoiceIntakeWizard
          onDone={(code) => router.navigate({ to: "/scenario/created/$code", params: { code } })}
          onSwitchToManual={() => setMode("manual")}
        />
      )}
      <ComparisonIdLookupForm className="max-w-3xl mx-auto mt-8" />
      <PreviousComparisonsPanel />
    </AppShell>
  );
}
