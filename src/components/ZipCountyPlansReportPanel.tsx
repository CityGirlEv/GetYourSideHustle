import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileSearch, Loader2, Lock, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddToCartButton } from "@/components/AddToCartButton";
import { MultiSelect } from "@/components/ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { PlanFilterPill } from "@/components/PlanFilterPill";
import { loadArticlePdfLogo, loadPdfFooterMiniLogo } from "@/lib/article-pdf";
import { asScenarioMedications } from "@/lib/plan-drug-estimate";
import { requireCmsLandscapeLoaded } from "@/lib/cms-landscape";
import { useCmsLandscapeReady } from "@/hooks/use-cms-landscape-ready";
import type { ScenarioPdfInput } from "@/lib/scenario-pdf";
import {
  applyZipCountyReportViewFilters,
  buildZipCountyPlansReport,
  countiesForZip3ReportInput,
  filterZip3CountiesByKeys,
  hasZipCountyReportSelection,
  isCompleteZipInputForMode,
  normalizeZipCodeInput,
  pruneZipCountySelection,
  resolveCountiesForZipInput,
  zip3CountySelectOptions,
  zipCountyReportCountyOptions,
  zipCountyReportPlanFilterCounts,
  zipInputMaxLengthForMode,
  type ZipCountyPlansReport,
  type ZipReportInputMode,
} from "@/lib/zip-county-plans-report";
import { downloadZipCountyPlansPdf } from "@/lib/zip-county-plans-pdf";
import { formatUsd } from "@/lib/educational-benchmark-report";
import {
  ALL_PLANS_ROW_PRIMARY_FILTER,
  MEDICARE_ADVANTAGE_GROUP_LABEL,
  MEDIGAP_GROUP_LABEL,
  MEDIGAP_GROUP_SUBFILTERS,
  PART_D_GROUP_LABEL,
  PART_D_ROW_FILTERS,
  maRowFiltersForCatalogDisplay,
  type PlanFilterId,
} from "@/lib/plan-filters";
import {
  BENCHMARK_FILTER_LABEL_COLUMN_CLASS,
  BENCHMARK_FILTER_PILL_UNIFORM_CLASS,
  BENCHMARK_FILTER_PILLS_WRAP_CLASS,
  benchmarkFilterRowLayoutClass,
} from "@/lib/benchmark-report-ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ZipCountyPlansReportPanelProps = {
  scenario: ScenarioPdfInput & { county?: string };
  defaultZip?: string;
  canAccessCountyReportZip3?: boolean;
  canAccessCountyReportZip5?: boolean;
};

function defaultReportMode(
  canAccessZip3: boolean,
  canAccessZip5: boolean,
): ZipReportInputMode {
  if (canAccessZip3) return "zip3";
  if (canAccessZip5) return "zip5";
  return "zip3";
}

const ZIP_REPORT_MODE_OPTIONS: { mode: ZipReportInputMode; label: string }[] = [
  { mode: "zip3", label: "ZIP prefix (3 digits)" },
  { mode: "zip5", label: "Full ZIP (5 digits)" },
];

function ZipReportModeCheckbox({
  mode,
  label,
  checked,
  entitled,
  onSelect,
}: {
  mode: ZipReportInputMode;
  label: string;
  checked: boolean;
  entitled: boolean;
  onSelect: (mode: ZipReportInputMode) => void;
}) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
        BENCHMARK_FILTER_PILL_UNIFORM_CLASS,
        entitled ? "cursor-pointer" : "cursor-not-allowed opacity-70",
        checked && entitled
          ? "border-emerald bg-emerald font-semibold text-white shadow-sm"
          : entitled
            ? "border-[var(--brand-navy-light)] bg-[var(--brand-navy-light)] text-white shadow-sm hover:bg-[var(--brand-navy-accent)]"
            : "border-border bg-muted/50 text-muted-foreground",
      )}
    >
      <Checkbox
        checked={checked}
        disabled={!entitled}
        onCheckedChange={(value) => {
          if (value === true && entitled) onSelect(mode);
        }}
        aria-label={label}
        className={cn(
          "h-3.5 w-3.5 rounded-[3px] border-white/70 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-emerald",
          !entitled && "border-muted-foreground/40",
        )}
      />
      {!entitled ? <Lock className="h-3 w-3 shrink-0" aria-hidden /> : null}
      <span className="truncate">{label}</span>
    </label>
  );
}

function ZipCountyReportFilterRow({
  label,
  filters,
  activeFilter,
  counts,
  onFilterChange,
}: {
  label: string;
  filters: { id: PlanFilterId; label: string }[];
  activeFilter: PlanFilterId;
  counts: Record<PlanFilterId, number>;
  onFilterChange: (filter: PlanFilterId) => void;
}) {
  if (filters.length === 0) return null;

  return (
    <div className={benchmarkFilterRowLayoutClass(filters.length)}>
      <div className={cn(BENCHMARK_FILTER_LABEL_COLUMN_CLASS, "pr-0.5")}>
        <span className="block text-right text-[10px] font-bold text-foreground leading-snug sm:whitespace-nowrap">
          {label}:
        </span>
      </div>
      <div className={BENCHMARK_FILTER_PILLS_WRAP_CLASS}>
        {filters.map((option) => (
          <PlanFilterPill
            key={option.id}
            label={option.label}
            count={counts[option.id]}
            active={activeFilter === option.id}
            onClick={() => onFilterChange(option.id)}
            variant="pill"
            uniformSize
          />
        ))}
      </div>
    </div>
  );
}

export function ZipCountyPlansReportPanel({
  scenario,
  defaultZip,
  canAccessCountyReportZip3 = false,
  canAccessCountyReportZip5 = false,
  canAccessISnpCatalog = true,
}: ZipCountyPlansReportPanelProps & { canAccessISnpCatalog?: boolean }) {
  const landscapeReady = useCmsLandscapeReady();
  const [reportMode, setReportMode] = useState<ZipReportInputMode>(() =>
    defaultReportMode(canAccessCountyReportZip3, canAccessCountyReportZip5),
  );
  const [zipInput, setZipInput] = useState(() =>
    normalizeZipCodeInput(defaultZip ?? scenario.zip3 ?? "").slice(
      0,
      zipInputMaxLengthForMode(defaultReportMode(canAccessCountyReportZip3, canAccessCountyReportZip5)),
    ),
  );
  const [report, setReport] = useState<ZipCountyPlansReport | null>(null);
  const [planTypeFilter, setPlanTypeFilter] = useState<PlanFilterId>("all");
  const [selectedCountyKeys, setSelectedCountyKeys] = useState<string[]>([]);
  const [countyPreview, setCountyPreview] = useState<
    Awaited<ReturnType<typeof resolveCountiesForZipInput>>
  >([]);
  const [countyPreviewLoading, setCountyPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const maRowFilters = maRowFiltersForCatalogDisplay({
    incomeBand: scenario.incomeBand,
    scope: "area",
    canAccessISnp: canAccessISnpCatalog,
  });

  const modeEntitled =
    reportMode === "zip3" ? canAccessCountyReportZip3 : canAccessCountyReportZip5;
  const zipInputMaxLength = zipInputMaxLengthForMode(reportMode);
  const zipCode = normalizeZipCodeInput(zipInput).slice(0, zipInputMaxLength);
  const zipInputComplete = isCompleteZipInputForMode(zipCode, reportMode);
  const hasCountySelection = hasZipCountyReportSelection(selectedCountyKeys);
  const canRun =
    modeEntitled &&
    zipInputComplete &&
    countyPreview.length > 0 &&
    hasCountySelection &&
    landscapeReady &&
    !countyPreviewLoading;

  const countyOptions = useMemo(
    () => (report ? zipCountyReportCountyOptions(report, planTypeFilter) : []),
    [report, planTypeFilter],
  );

  const previewCountyOptions = useMemo(
    () => (reportMode === "zip3" ? zip3CountySelectOptions(countyPreview) : []),
    [reportMode, countyPreview],
  );

  const countySelectOptions = report ? countyOptions : previewCountyOptions;
  const showCountyMultiselect = reportMode === "zip3" && countySelectOptions.length > 0;

  useEffect(() => {
    setReportMode((current) => {
      if (current === "zip3" && canAccessCountyReportZip3) return current;
      if (current === "zip5" && canAccessCountyReportZip5) return current;
      return defaultReportMode(canAccessCountyReportZip3, canAccessCountyReportZip5);
    });
  }, [canAccessCountyReportZip3, canAccessCountyReportZip5]);

  useEffect(() => {
    setZipInput((current) =>
      normalizeZipCodeInput(current).slice(0, zipInputMaxLengthForMode(reportMode)),
    );
  }, [reportMode]);

  const filterCounts = useMemo(
    () => (report ? zipCountyReportPlanFilterCounts(report) : null),
    [report],
  );

  useEffect(() => {
    setReport(null);
    setSelectedCountyKeys([]);
    setPlanTypeFilter("all");
  }, [zipCode, reportMode]);

  useEffect(() => {
    if (!modeEntitled || !zipInputComplete) {
      setCountyPreview([]);
      setCountyPreviewLoading(false);
      return;
    }
    if (reportMode === "zip3") {
      setCountyPreview(countiesForZip3ReportInput(zipCode));
      setCountyPreviewLoading(false);
      return;
    }
    let cancelled = false;
    setCountyPreview([]);
    setCountyPreviewLoading(true);
    void resolveCountiesForZipInput(zipCode, "zip5").then((counties) => {
      if (cancelled) return;
      setCountyPreview(counties);
      setCountyPreviewLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [zipCode, zipInputComplete, reportMode, modeEntitled]);

  useEffect(() => {
    if (!report) return;
    setSelectedCountyKeys((current) =>
      pruneZipCountySelection(
        current,
        countyOptions.map((option) => option.value),
      ),
    );
  }, [report, planTypeFilter, countyOptions]);

  const filteredReport = useMemo(() => {
    if (!report) return null;
    return applyZipCountyReportViewFilters(report, {
      planFilter: planTypeFilter,
      countyKeys: selectedCountyKeys,
    });
  }, [report, planTypeFilter, selectedCountyKeys]);

  const filteredCounties = filteredReport?.counties ?? [];
  const filteredPlanTotal = filteredReport?.totalPlans ?? 0;

  const runReport = useCallback(async () => {
    if (!modeEntitled) {
      toast.error("Add the county report add-on for this mode on the pricing page.");
      return;
    }
    if (!canRun) {
      if (!landscapeReady) {
        toast.error("Plan catalog is still loading. Try again in a moment.");
        return;
      }
      if (!zipInputComplete) {
        toast.error(
          reportMode === "zip3"
            ? "Enter a 3-digit ZIP prefix."
            : "Enter a full 5-digit ZIP code.",
        );
        return;
      }
      if (countyPreviewLoading) {
        toast.error("County lookup is still loading. Try again in a moment.");
        return;
      }
      if (reportMode === "zip3" && !hasCountySelection) {
        toast.error("Select at least one county.");
        return;
      }
      toast.error(`No counties found for ZIP ${zipCode}.`);
      return;
    }

    setLoading(true);
    try {
      requireCmsLandscapeLoaded();
      const allCounties = await resolveCountiesForZipInput(zipCode, reportMode);
      const counties =
        reportMode === "zip3"
          ? filterZip3CountiesByKeys(allCounties, selectedCountyKeys)
          : allCounties;
      if (counties.length === 0) {
        toast.error("Select at least one county.");
        return;
      }
      const next = buildZipCountyPlansReport({
        zipCode,
        inputMode: reportMode,
        counties,
        year: scenario.year,
        zip3: zipCode.slice(0, 3),
        medications: asScenarioMedications(scenario.medications),
      });
      setReport(next);
      setPlanTypeFilter("all");
    } catch (err) {
      console.error("[zip-county-report] build failed", err);
      toast.error("Could not build the county report.");
    } finally {
      setLoading(false);
    }
  }, [
    canRun,
    countyPreviewLoading,
    hasCountySelection,
    landscapeReady,
    modeEntitled,
    reportMode,
    selectedCountyKeys,
    zipCode,
    zipInputComplete,
    scenario,
  ]);

  const handleDownloadPdf = useCallback(async () => {
    if (!filteredReport) return;
    setDownloading(true);
    try {
      const [logoDataUrl, miniLogoDataUrl] = await Promise.all([
        loadArticlePdfLogo(),
        loadPdfFooterMiniLogo(),
      ]);
      await downloadZipCountyPlansPdf(filteredReport, { logoDataUrl, miniLogoDataUrl });
      toast.success("PDF downloaded.");
    } catch (err) {
      console.error("[zip-county-report] pdf failed", err);
      toast.error("Could not save PDF.");
    } finally {
      setDownloading(false);
    }
  }, [filteredReport]);

  return (
    <div className="space-y-3 px-2 pb-2">
      <div className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-2.5">
        <div className="flex flex-col gap-2 w-full sm:w-auto min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            County report mode
          </div>
          <div
            className={cn(BENCHMARK_FILTER_PILLS_WRAP_CLASS, "justify-start")}
            role="group"
            aria-label="County report ZIP mode"
          >
            {ZIP_REPORT_MODE_OPTIONS.map(({ mode, label }) => {
              const entitled =
                mode === "zip3" ? canAccessCountyReportZip3 : canAccessCountyReportZip5;
              return (
                <ZipReportModeCheckbox
                  key={mode}
                  mode={mode}
                  label={label}
                  checked={reportMode === mode}
                  entitled={entitled}
                  onSelect={setReportMode}
                />
              );
            })}
          </div>
        </div>
        {!modeEntitled ? (
          <div className="text-[10px] text-muted-foreground leading-snug w-full space-y-2">
            <p>
              This report mode requires an à la carte add-on.{" "}
              <Link
                to="/features"
                search={{ tab: "agents" }}
                hash="agent-pricing"
                className="text-primary underline underline-offset-2"
              >
                View platform pricing
              </Link>
            </p>
            <AddToCartButton
              payload={{
                kind: "agent-addon",
                addOnId: reportMode === "zip3" ? "county-report-zip3" : "county-report-zip5",
              }}
            />
          </div>
        ) : null}
        <div className="flex flex-wrap items-end gap-2 min-w-0 flex-1">
          <div className="space-y-1 min-w-[8rem]">
            <Label htmlFor="zip-county-report-zip" className="text-[11px] text-muted-foreground">
              {reportMode === "zip3" ? "ZIP prefix" : "ZIP code"}
            </Label>
            <Input
              id="zip-county-report-zip"
              inputMode="numeric"
              pattern="\d*"
              maxLength={zipInputMaxLength}
              value={zipInput}
              onChange={(e) =>
                setZipInput(
                  normalizeZipCodeInput(e.target.value).slice(0, zipInputMaxLength),
                )
              }
              placeholder={reportMode === "zip3" ? "802" : "80202"}
              className="h-9 w-28 font-mono text-sm"
              disabled={!modeEntitled}
            />
          </div>
          {showCountyMultiselect ? (
            <div className="space-y-1 min-w-[12rem]">
              <Label
                htmlFor="zip-county-report-counties"
                className="text-[11px] text-muted-foreground"
              >
                Counties
              </Label>
              <MultiSelect
                options={countySelectOptions}
                value={selectedCountyKeys}
                onChange={setSelectedCountyKeys}
                placeholder="Counties"
                allLabel="All counties"
                searchable={countySelectOptions.length > 6}
                searchPlaceholder="Search counties…"
                triggerClassName="w-full min-w-[12rem] max-w-xs text-xs"
              />
            </div>
          ) : null}
          {countyPreviewLoading ? (
            <p className="text-[10px] text-muted-foreground pb-1.5 leading-snug max-w-xs">
              Looking up counties…
            </p>
          ) : countyPreview.length > 0 ? (
            <p className="text-[10px] text-muted-foreground pb-1.5 leading-snug max-w-xs">
              {reportMode === "zip3" ? (
                <>
                  {countyPreview.length} {countyPreview.length === 1 ? "county" : "counties"} for
                  prefix {zipCode}
                  {showCountyMultiselect && !hasCountySelection ? " · select at least one" : null}
                </>
              ) : (
                <>
                  County for ZIP {zipCode}: {countyPreview[0]?.county}, {countyPreview[0]?.stateCode}
                </>
              )}
            </p>
          ) : zipInputComplete && modeEntitled ? (
            <p className="text-[10px] text-destructive pb-1.5">
              {reportMode === "zip5" ? "Could not resolve county for this ZIP." : "Unknown ZIP prefix."}
            </p>
          ) : null}
          <Button
            type="button"
            size="sm"
            className="grad-indigo"
            disabled={!canRun || loading || !modeEntitled}
            onClick={() => void runReport()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <FileSearch className="h-4 w-4 mr-1.5" />
                View report
              </>
            )}
          </Button>
        </div>
      </div>

      {report ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">
                {report.inputMode === "zip3" ? `ZIP prefix ${report.zip3}` : `ZIP ${report.zipCode}`}
              </span>
              <Badge variant="secondary">
                {filteredPlanTotal} plans
                {planTypeFilter !== "all" ? ` (${report.totalPlans} total)` : null}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {filteredCounties.length} of {report.counties.length}{" "}
                {report.counties.length === 1 ? "county" : "counties"}
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!filteredReport || filteredPlanTotal === 0 || downloading}
              onClick={() => void handleDownloadPdf()}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1.5" />
                  Save as PDF
                </>
              )}
            </Button>
          </div>

          {filterCounts ? (
            <div
              className="space-y-1.5 rounded-lg border border-border/60 bg-slate-100/60 px-3 py-2.5"
              role="toolbar"
              aria-label="Filter county report by plan type"
            >
              <ZipCountyReportFilterRow
                label="All plans"
                filters={[ALL_PLANS_ROW_PRIMARY_FILTER]}
                activeFilter={planTypeFilter}
                counts={filterCounts}
                onFilterChange={setPlanTypeFilter}
              />
              <ZipCountyReportFilterRow
                label={MEDIGAP_GROUP_LABEL}
                filters={MEDIGAP_GROUP_SUBFILTERS}
                activeFilter={planTypeFilter}
                counts={filterCounts}
                onFilterChange={setPlanTypeFilter}
              />
              <ZipCountyReportFilterRow
                label={PART_D_GROUP_LABEL}
                filters={PART_D_ROW_FILTERS}
                activeFilter={planTypeFilter}
                counts={filterCounts}
                onFilterChange={setPlanTypeFilter}
              />
              <ZipCountyReportFilterRow
                label={MEDICARE_ADVANTAGE_GROUP_LABEL}
                filters={maRowFilters}
                activeFilter={planTypeFilter}
                counts={filterCounts}
                onFilterChange={setPlanTypeFilter}
              />
            </div>
          ) : null}

          {filteredCounties.length === 0 ? (
            <p className="text-xs text-muted-foreground rounded border border-border bg-muted/20 px-3 py-2">
              No plans match this filter for ZIP {report.zipCode}.
            </p>
          ) : (
            <Accordion type="multiple" defaultValue={filteredCounties.map((c) => c.countyLabel)}>
              {filteredCounties.map((entry) => (
                <AccordionItem key={entry.countyLabel} value={entry.countyLabel}>
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      {entry.countyLabel}
                      <Badge variant="outline" className="font-normal">
                        {entry.totalPlans} plans
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-1">
                      {entry.groups.map((group) => (
                        <div key={group.category} className="space-y-1.5">
                          <p className="text-xs font-semibold text-primary">
                            {group.label} ({group.plans.length})
                          </p>
                          <ul className="space-y-1 max-h-48 overflow-y-auto rounded border border-border/60 bg-muted/20 px-2 py-1.5">
                            {group.plans.slice(0, 25).map((plan) => (
                              <li
                                key={`${plan.carrier}-${plan.plan}-${plan.rank}`}
                                className="text-[11px] leading-snug flex flex-wrap gap-x-2 justify-between"
                              >
                                <span>
                                  <span className="font-medium">{plan.carrier}</span>
                                  {" — "}
                                  {plan.plan}
                                </span>
                                <span className="text-muted-foreground tabular-nums shrink-0">
                                  {formatUsd(plan.monthly, 0)}/mo · {plan.stars}
                                </span>
                              </li>
                            ))}
                            {group.plans.length > 25 ? (
                              <li className="text-[10px] text-muted-foreground italic pt-1">
                                +{group.plans.length - 25} more in PDF export
                              </li>
                            ) : null}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      ) : null}
    </div>
  );
}
