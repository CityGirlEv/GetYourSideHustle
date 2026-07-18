import { Link } from "@tanstack/react-router";
import { CheckCircle2, BookOpen, MapPin, ClipboardList, User } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  BenchmarkReportTabBar,
  BenchmarkReportToolbar,
  type BenchmarkReportNavSection,
} from "@/components/BenchmarkReportSectionNav";
import { ResponsivePossiblePlansFilterRow } from "@/components/PlanFilterBar";
import { PreviousScenariosLink } from "@/components/PreviousBenchmarkScenarios";
import { BenchmarkReportTabFooter } from "@/components/BenchmarkReportTabFooter";
import { useBenchmarkEstimateHistory } from "@/hooks/use-benchmark-estimate-history";
import { PlanComparisonTopTen } from "@/components/PlanComparisonTopTen";
import { PlanFilterLoadingOverlay } from "@/components/PlanFilterLoadingOverlay";
import { BenchmarkWorkbookChecklist } from "@/components/BenchmarkWorkbookChecklist";
import { BenchmarkMyInputEditor } from "@/components/BenchmarkMyInputEditor";
import { benchmarkEstimateReportPath } from "@/lib/benchmark-id";
import type { BenchmarkIntakeInput, FinalizedBenchmark } from "@/lib/benchmark-intake";
import {
  benchmarkIntakeInputsEqual,
  benchmarkIntakeLocationChanged,
  finalizeBenchmarkIntake,
  rebuildBenchmarkEstimate,
} from "@/lib/benchmark-intake";
import { saveBenchmarkEstimate } from "@/lib/benchmark-estimate-storage";
import { validateBenchmarkIntakeInput } from "@/lib/benchmark-intake-validation";
import {
  benchmarkOptInSessionKeys,
  isBenchmarkAwaitingPlans,
  markBenchmarkAwaitingPlans,
} from "@/lib/benchmark-optin-trigger";
import { benchmarkToPlanComparisonScenario } from "@/lib/benchmark-plan-input";
import { openBenchmarkReportPdfInNewTab, downloadBenchmarkReportPdf } from "@/lib/benchmark-pdf";
import { openBenchmarkReportXlsxInNewTab } from "@/lib/benchmark-xlsx";
import { openLeadMagnetWorkbookPdfInNewTab } from "@/lib/lead-magnet-pdf";
import { DEFAULT_WORKBOOK_LEAD_MAGNET } from "@/lib/content-factory/batch-seed";
import { getBenchmarkWorkbookContent } from "@/lib/benchmark-workbook-content";
import { loadWorkbookFormState } from "@/lib/workbook-form-state";
import { workbookStateToPdfFill } from "@/lib/workbook-pdf-fill";
import {
  BENCHMARK_CREATED,
  BENCHMARK_REPORT_OPENED,
  BENCHMARK_WORKBOOK_OPENED,
  BENCHMARK_OPEN_PDF,
  BENCHMARK_OPENING_PDF,
  BENCHMARK_OPEN_EXCEL,
  BENCHMARK_OPENING_EXCEL,
  BENCHMARK_REPORT_XLSX_OPENED,
  BENCHMARK_SAVE_SCENARIO,
  BENCHMARK_SAVING_SCENARIO,
  BENCHMARK_SAVE_LOCATION_CHANGED_HINT,
  BENCHMARK_SCENARIO_SAVED,
  BENCHMARK_RUN_UPDATED_SCENARIO,
  BENCHMARK_RUNNING_SCENARIO,
  BENCHMARK_NEW_INPUT_HINT,
  BENCHMARK_TOOL_ID_LABEL,
  BENCHMARK_TOOL_LINK_COPIED,
  BENCHMARK_TAB_INPUT,
  BENCHMARK_TAB_LOCAL,
  BENCHMARK_TAB_POSSIBLE_PLANS,
  BENCHMARK_TAB_PBO_LOCAL,
  BENCHMARK_TAB_PREPARE,
  BENCHMARK_WORKBOOK_SECTION_TITLE,
  PBO_BLUEPRINT_SECTION_TITLE,
} from "@/lib/plan-comparison-copy";
import type { EducationalBenchmarkReport } from "@/lib/educational-benchmark-report";
import { buildEducationalBenchmarkReport, formatUsd } from "@/lib/educational-benchmark-report";
import { PUBLIC_WEBSITE_HOST } from "@/lib/site-url";
import {
  BENCHMARK_POSSIBLE_PLANS_CARD_BODY_CLASS,
  BENCHMARK_POSSIBLE_PLANS_CARD_FOOTER_CLASS,
  BENCHMARK_SECTION_HEADING_CLASS,
  BENCHMARK_REPORT_STICKY_HEADER_CLASS,
  formatBenchmarkReportZipLineText,
  previousScenariosSectionForTab,
} from "@/lib/benchmark-report-ui";
import { cn } from "@/lib/utils";
import { BenchmarkReportSubsection } from "@/components/BenchmarkReportCollapsible";
import { BenchmarkReportBackToTop } from "@/components/BenchmarkReportBackToTop";
import { BENCHMARK_WORKBOOK_SECTION_ID } from "@/lib/benchmark-workbook-content";
import { areaPlanDetails, fullCatalogPlanDetails, rankedPlanDetails } from "@/lib/plan-details";
import {
  applyMyAvailablePlanExclusions,
  fullCatalogPlanFilterCounts,
  highlyRatedSubTabCounts,
  myAvailableRowFilterCounts,
  type HighlyRatedSubTab,
  type PlanFilterScope,
  type PlanPanelId,
} from "@/lib/plan-filters";
import { useCmsLandscapeReady } from "@/hooks/use-cms-landscape-ready";
import { useReportPotentialPlansLoad } from "@/hooks/use-plan-filter-progress";
import { useApp } from "@/lib/app-store";
import {
  userCanAccessISnpCatalog,
  userCanAccessZipCountyReport,
  userCanSeeAllPlanFilterCount,
  userCanSeeAllPlansRow,
} from "@/lib/user-roles";
import {
  userCanAccessCountyReportZip3,
  userCanAccessCountyReportZip5,
} from "@/lib/agent-package-access";

type Props = {
  estimateId: string;
  report: EducationalBenchmarkReport;
  benchmark?: FinalizedBenchmark;
  leadCaptured?: boolean;
  showActions?: boolean;
  /** True immediately after intake submit — shows save-your-ID panel and expands report sections. */
  justCreated?: boolean;
  /** Called after Save Scenario updates the benchmark in place. */
  onBenchmarkUpdate?: (benchmark: FinalizedBenchmark) => void;
};

const SECTION_POSSIBLE_PLANS = "benchmark-possible-plans";
const SECTION_WORKBOOK = BENCHMARK_WORKBOOK_SECTION_ID;
const SECTION_PBO_LOCAL = "benchmark-part-b";
const SECTION_UTILIZATION = "benchmark-utilization";

function SectionHeading({
  number,
  title,
  icon: Icon,
}: {
  number: number;
  title: string;
  icon: typeof BookOpen;
}) {
  return (
    <div className="flex items-start gap-3 text-left">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-display font-bold text-sm">
        {number}
      </div>
      <div className="min-w-0 pt-0.5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary shrink-0" />
          <h3
            className={cn(
              "font-display text-lg font-bold leading-snug",
              BENCHMARK_SECTION_HEADING_CLASS,
            )}
          >
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between border-b border-border/60 last:border-0",
        compact ? "py-1" : "py-2.5",
      )}
    >
      <dt className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>{label}</dt>
      <dd
        className={cn(
          "font-semibold text-foreground sm:text-right",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function BenchmarkReportBrandFooter() {
  return (
    <Card className="glass overflow-hidden">
      <div className="flex items-center justify-center px-4 py-3 sm:px-5">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label={`Visit ${PUBLIC_WEBSITE_HOST}`}
        >
          <BrandLogo size="footer" />
          <span className="font-display text-sm font-semibold text-primary group-hover:underline">
            {PUBLIC_WEBSITE_HOST}
          </span>
        </Link>
      </div>
    </Card>
  );
}

function BenchmarkReportActionBar({
  showActions,
  benchmark,
  downloading,
  downloadingXlsx = false,
  saving,
  running = false,
  showRunUpdatedScenario = false,
  intakeDirty = false,
  canSaveReport = false,
  saveDisabledReason,
  onCopyLink,
  onDownloadReport,
  onDownloadExcel,
  onSaveScenario,
  onRunUpdatedScenario,
}: {
  showActions: boolean;
  benchmark?: FinalizedBenchmark;
  downloading: boolean;
  downloadingXlsx?: boolean;
  saving: boolean;
  running?: boolean;
  showRunUpdatedScenario?: boolean;
  intakeDirty?: boolean;
  canSaveReport?: boolean;
  saveDisabledReason?: string;
  onCopyLink: () => void;
  onDownloadReport: () => void;
  onDownloadExcel?: () => void;
  onSaveScenario?: () => void;
  onRunUpdatedScenario?: () => void;
}) {
  const toolbarActions = [
    ...(benchmark != null && onSaveScenario
      ? [
          {
            id: "save-scenario",
            label: saving ? BENCHMARK_SAVING_SCENARIO : BENCHMARK_SAVE_SCENARIO,
            onClick: onSaveScenario,
            variant: "save" as const,
            disabled: saving || running || !canSaveReport,
            title:
              !canSaveReport && saveDisabledReason
                ? saveDisabledReason
                : undefined,
          },
        ]
      : []),
    ...(showActions
      ? [
          {
            id: "copy-link",
            label: "Copy link",
            onClick: onCopyLink,
          },
        ]
      : []),
    ...(showRunUpdatedScenario && benchmark != null && onRunUpdatedScenario
      ? [
          {
            id: "run-updated-scenario",
            label: running ? BENCHMARK_RUNNING_SCENARIO : BENCHMARK_RUN_UPDATED_SCENARIO,
            onClick: onRunUpdatedScenario,
            variant: intakeDirty ? ("save" as const) : ("default" as const),
            disabled: running || saving || !intakeDirty,
          },
        ]
      : []),
    ...(benchmark != null
      ? [
          {
            id: "download-pdf",
            label: downloading ? BENCHMARK_OPENING_PDF : BENCHMARK_OPEN_PDF,
            onClick: onDownloadReport,
            disabled: downloading || downloadingXlsx || running,
          },
        ]
      : []),
    ...(benchmark != null && onDownloadExcel
      ? [
          {
            id: "open-excel",
            label: downloadingXlsx ? BENCHMARK_OPENING_EXCEL : BENCHMARK_OPEN_EXCEL,
            onClick: onDownloadExcel,
            disabled: downloading || downloadingXlsx || running,
          },
        ]
      : []),
  ];

  if (toolbarActions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
      <BenchmarkReportToolbar actions={toolbarActions} />
    </div>
  );
}

export function BenchmarkReportZipLine({ report }: { report: EducationalBenchmarkReport }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {formatBenchmarkReportZipLineText(report)}
    </span>
  );
}

function BenchmarkReportHeaderToolbar({
  showActions,
  benchmark,
  downloading,
  downloadingXlsx = false,
  saving,
  running = false,
  showRunUpdatedScenario = false,
  intakeDirty = false,
  canSaveReport = false,
  saveDisabledReason,
  estimateId,
  onCopyLink,
  onDownloadReport,
  onDownloadExcel,
  onSaveScenario,
  onRunUpdatedScenario,
  className,
}: {
  showActions: boolean;
  benchmark?: FinalizedBenchmark;
  downloading: boolean;
  downloadingXlsx?: boolean;
  saving: boolean;
  running?: boolean;
  showRunUpdatedScenario?: boolean;
  intakeDirty?: boolean;
  canSaveReport?: boolean;
  saveDisabledReason?: string;
  estimateId: string;
  onCopyLink: () => void;
  onDownloadReport: () => void;
  onDownloadExcel?: () => void;
  onSaveScenario?: () => void;
  onRunUpdatedScenario?: () => void;
  className?: string;
}) {
  if (!showActions && benchmark == null) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-x-2 gap-y-1.5", className)}>
      {showActions ? (
        <>
          <span className="font-semibold uppercase tracking-wide text-[10px] text-muted-foreground shrink-0">
            Report ID
          </span>
          <code className="rounded-md border border-primary/30 bg-background px-2 py-0.5 font-mono text-[11px] select-all">
            {estimateId}
          </code>
        </>
      ) : null}
      <BenchmarkReportActionBar
        showActions={showActions}
        benchmark={benchmark}
        downloading={downloading}
        downloadingXlsx={downloadingXlsx}
        saving={saving}
        running={running}
        showRunUpdatedScenario={showRunUpdatedScenario}
        intakeDirty={intakeDirty}
        canSaveReport={canSaveReport}
        saveDisabledReason={saveDisabledReason}
        onCopyLink={onCopyLink}
        onDownloadReport={onDownloadReport}
        onDownloadExcel={onDownloadExcel}
        onSaveScenario={onSaveScenario}
        onRunUpdatedScenario={onRunUpdatedScenario}
      />
    </div>
  );
}

export function EducationalBenchmarkReportView({
  estimateId,
  report,
  benchmark,
  leadCaptured: _leadCaptured,
  showActions = false,
  justCreated = false,
  onBenchmarkUpdate,
}: Props) {
  const router = useRouter();
  const { user } = useApp();
  const showAllPlanCount = userCanSeeAllPlanFilterCount(user);
  const canAccessAllPlansRow = userCanSeeAllPlansRow(user);
  const canAccessZipCountyReport = userCanAccessZipCountyReport(user);
  const canAccessCountyReportZip3 = userCanAccessCountyReportZip3(user);
  const canAccessCountyReportZip5 = userCanAccessCountyReportZip5(user);
  const canAccessISnpCatalog = userCanAccessISnpCatalog(user);
  const { partBBase, localBenchmarks } = report;
  const [downloading, setDownloading] = useState(false);
  const [downloadingXlsx, setDownloadingXlsx] = useState(false);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [editedIntake, setEditedIntake] = useState<BenchmarkIntakeInput | null>(
    benchmark?.intake ?? null,
  );
  const [activeTab, setActiveTab] = useState<string>(() =>
    justCreated ? SECTION_POSSIBLE_PLANS : SECTION_UTILIZATION,
  );
  const [planPanel, setPlanPanel] = useState<PlanPanelId>("why-this-plan");
  const [planFilterScope, setPlanFilterScope] = useState<PlanFilterScope>("member");
  const [potentialTop3Visit, setPotentialTop3Visit] = useState(0);
  const [highlyRatedSubTab, setHighlyRatedSubTab] = useState<HighlyRatedSubTab>("all");
  const history = useBenchmarkEstimateHistory(estimateId, user);
  const hasPreviousScenarios = history.device.length > 0 || history.all.length > 0;

  const intakeDirty = useMemo(() => {
    if (!benchmark || !editedIntake) return false;
    return !benchmarkIntakeInputsEqual(benchmark.intake, editedIntake);
  }, [benchmark, editedIntake]);

  const locationChanged = useMemo(() => {
    if (!benchmark || !editedIntake) return false;
    return benchmarkIntakeLocationChanged(benchmark.intake, editedIntake);
  }, [benchmark, editedIntake]);

  const canSaveReport = intakeDirty && !locationChanged;

  const saveDisabledReason = locationChanged ? BENCHMARK_SAVE_LOCATION_CHANGED_HINT : undefined;

  const planScenario =
    benchmark != null
      ? benchmarkToPlanComparisonScenario(benchmark.intake, benchmark.report)
      : null;

  const cmsLandscapeReady = useCmsLandscapeReady();

  const inputPreviewReport = useMemo(() => {
    if (!editedIntake) return report;
    const next = buildEducationalBenchmarkReport(editedIntake);
    if (cmsLandscapeReady) return next;
    // Non-regional preview fields update immediately; regional MA ranges wait for CMS catalog.
    return {
      ...next,
      localBenchmarks: report.localBenchmarks,
    };
  }, [editedIntake, report, cmsLandscapeReady]);

  const handleIntakeChange = useCallback((intake: BenchmarkIntakeInput) => {
    setEditedIntake(intake);
  }, []);

  useEffect(() => {
    if (benchmark) setEditedIntake(benchmark.intake);
  }, [benchmark?.estimateId, benchmark?.intake]);

  const validateEditedIntake = useCallback((): boolean => {
    if (!editedIntake) return false;
    const confirmedIds = editedIntake.medicationDetails.map((m) => m.id);
    const error = validateBenchmarkIntakeInput(
      editedIntake,
      editedIntake.medicationDetails,
      confirmedIds,
    );
    if (error) {
      toast.error(error);
      return false;
    }
    return true;
  }, [editedIntake]);

  const handleSaveScenario = useCallback(async () => {
    if (!benchmark || !editedIntake || !validateEditedIntake() || locationChanged) return;
    setSaving(true);
    try {
      const updated = rebuildBenchmarkEstimate(estimateId, editedIntake);
      saveBenchmarkEstimate(updated);
      onBenchmarkUpdate?.(updated);

      const workbook = getBenchmarkWorkbookContent();
      const workbookFormState = loadWorkbookFormState(workbook, {
        scenarioCode: estimateId,
        seedFromIntake: true,
        medicationNames: updated.intake.medications,
        medicationDetails: updated.intake.medicationDetails,
      });
      await downloadBenchmarkReportPdf(updated, {
        workbookFormState,
      });

      toast.success(BENCHMARK_SCENARIO_SAVED);
    } catch (err) {
      console.error("[benchmark-report] save scenario failed", err);
      toast.error("Could not save your report. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [benchmark, editedIntake, estimateId, locationChanged, onBenchmarkUpdate, validateEditedIntake]);

  const handleRunUpdatedScenario = useCallback(async () => {
    if (!editedIntake || !validateEditedIntake()) return;
    setRunning(true);
    try {
      const finalized = finalizeBenchmarkIntake(editedIntake);
      saveBenchmarkEstimate(finalized);
      const { justCreated: justCreatedKey } = benchmarkOptInSessionKeys(finalized.estimateId);
      sessionStorage.setItem(justCreatedKey, "1");
      markBenchmarkAwaitingPlans(finalized.estimateId);
      await router.navigate({
        to: "/scenario/estimate/$code",
        params: { code: finalized.estimateId },
      });
    } catch (err) {
      console.error("[benchmark-report] run updated scenario failed", err);
      toast.error("Could not build your updated Benchmark Tool Report. Please try again.");
    } finally {
      setRunning(false);
    }
  }, [editedIntake, router, validateEditedIntake]);

  const [catalogPlanCount, setCatalogPlanCount] = useState(0);
  const plansLoad = useReportPotentialPlansLoad(
    estimateId,
    catalogPlanCount,
    planScenario ? { year: planScenario.year, medications: planScenario.medications } : undefined,
  );

  const planFilterCountsForRow = useMemo(() => {
    if (!planScenario || !plansLoad.catalogEnabled || !cmsLandscapeReady) return null;
    const memberPlanInput = {
      year: planScenario.year,
      zip3: planScenario.zip3,
      county: planScenario.county,
      medications: planScenario.medications,
    };
    const fullCatalogInput = {
      year: planScenario.year,
      medications: planScenario.medications,
    };
    const memberPlans = applyMyAvailablePlanExclusions(areaPlanDetails(memberPlanInput), {
      incomeBand: planScenario?.incomeBand,
    });
    const fullCatalogPlans = fullCatalogPlanDetails(fullCatalogInput);
    const myAvailablePlans = applyMyAvailablePlanExclusions(rankedPlanDetails(memberPlanInput), {
      incomeBand: planScenario?.incomeBand,
    });
    const areaCounts = fullCatalogPlanFilterCounts(fullCatalogPlans, myAvailablePlans);
    return {
      myAvailableCounts: myAvailableRowFilterCounts(memberPlans, myAvailablePlans),
      areaCounts,
      fullCatalogCount: fullCatalogPlans.length,
    };
  }, [planScenario, plansLoad.catalogEnabled, cmsLandscapeReady, canAccessISnpCatalog]);

  useEffect(() => {
    setCatalogPlanCount(0);
  }, [estimateId]);

  useEffect(() => {
    const count = planFilterCountsForRow?.fullCatalogCount ?? 0;
    if (count !== catalogPlanCount) setCatalogPlanCount(count);
  }, [planFilterCountsForRow, catalogPlanCount]);

  const highlyRatedTabCounts = useMemo(() => {
    if (!planScenario || !plansLoad.catalogEnabled || !cmsLandscapeReady) return null;
    const memberPlanInput = {
      year: planScenario.year,
      zip3: planScenario.zip3,
      county: planScenario.county,
      medications: planScenario.medications,
    };
    const fullCatalogInput = {
      year: planScenario.year,
      medications: planScenario.medications,
    };
    const catalogRaw =
      planFilterScope === "area"
        ? fullCatalogPlanDetails(fullCatalogInput)
        : areaPlanDetails(memberPlanInput);
    const catalog =
      planFilterScope === "area"
        ? catalogRaw
        : applyMyAvailablePlanExclusions(catalogRaw, {
            incomeBand: planScenario.incomeBand,
          });
    return highlyRatedSubTabCounts(catalog);
  }, [
    planScenario,
    planFilterScope,
    plansLoad.catalogEnabled,
    cmsLandscapeReady,
    canAccessISnpCatalog,
  ]);

  const navSections = useMemo((): BenchmarkReportNavSection[] => {
    const sections: BenchmarkReportNavSection[] = [
      {
        id: SECTION_UTILIZATION,
        label: BENCHMARK_TAB_INPUT,
        number: 1,
      },
    ];
    let sectionNumber = 2;
    if (planScenario) {
      sections.push({
        id: SECTION_POSSIBLE_PLANS,
        label: BENCHMARK_TAB_POSSIBLE_PLANS,
        number: sectionNumber++,
      });
    }
    sections.push({
      id: SECTION_PBO_LOCAL,
      label: BENCHMARK_TAB_PBO_LOCAL,
      number: sectionNumber++,
    });
    sections.push({
      id: SECTION_WORKBOOK,
      label: BENCHMARK_TAB_PREPARE,
      number: sectionNumber++,
    });
    return sections;
  }, [planScenario]);

  useEffect(() => {
    const landOnPotentialOptions =
      justCreated || plansLoad.awaitingOnMount || isBenchmarkAwaitingPlans(estimateId);
    if (landOnPotentialOptions) {
      setActiveTab(SECTION_POSSIBLE_PLANS);
      setPlanPanel("why-this-plan");
      setPlanFilterScope("member");
      return;
    }
    setActiveTab(SECTION_UTILIZATION);
    setPlanPanel("why-this-plan");
    setPlanFilterScope("member");
  }, [estimateId, justCreated, plansLoad.awaitingOnMount]);

  const handlePlanPanelChange = (panel: PlanPanelId, scope: PlanFilterScope = "member") => {
    const effectiveScope = !canAccessAllPlansRow && scope === "area" ? "member" : scope;
    setPlanPanel(panel);
    setPlanFilterScope(effectiveScope);
  };

  useEffect(() => {
    if (!canAccessAllPlansRow && planFilterScope === "area") {
      setPlanFilterScope("member");
    }
  }, [canAccessAllPlansRow, planFilterScope]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === SECTION_POSSIBLE_PLANS) {
      setPlanPanel("why-this-plan");
      setPlanFilterScope("member");
      setPotentialTop3Visit((visit) => visit + 1);
    }
  };

  const copyLink = async () => {
    try {
      const url = `${window.location.origin}${benchmarkEstimateReportPath(estimateId)}`;
      await navigator.clipboard.writeText(url);
      toast.success(BENCHMARK_TOOL_LINK_COPIED);
    } catch {
      toast.error("Copy failed — please write the link down");
    }
  };

  const openActiveTabPdf = async () => {
    if (!benchmark) return;
    setDownloading(true);
    try {
      const workbook = getBenchmarkWorkbookContent();
      const workbookFormState = loadWorkbookFormState(workbook, {
        scenarioCode: estimateId,
        seedFromIntake: true,
        medicationNames: benchmark.intake.medications,
        medicationDetails: benchmark.intake.medicationDetails,
      });

      if (activeTab === SECTION_WORKBOOK) {
        await openLeadMagnetWorkbookPdfInNewTab(
          {
            title: workbook.title,
            excerpt: workbook.excerpt,
            body: DEFAULT_WORKBOOK_LEAD_MAGNET.body,
          },
          { fill: workbookStateToPdfFill(workbookFormState) },
        );
        toast.success(BENCHMARK_WORKBOOK_OPENED);
        return;
      }

      await openBenchmarkReportPdfInNewTab(benchmark, {
        workbookFormState,
      });
      toast.success(BENCHMARK_REPORT_OPENED);
    } catch (err) {
      console.error("[benchmark-report] pdf open failed", err);
      toast.error(
        activeTab === SECTION_WORKBOOK
          ? "Could not open the workbook. Please try again."
          : "Could not open the report. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  };

  const openBenchmarkExcel = async () => {
    if (!benchmark) return;
    setDownloadingXlsx(true);
    try {
      const workbook = getBenchmarkWorkbookContent();
      const workbookFormState = loadWorkbookFormState(workbook, {
        scenarioCode: estimateId,
        seedFromIntake: true,
        medicationNames: benchmark.intake.medications,
        medicationDetails: benchmark.intake.medicationDetails,
      });
      await openBenchmarkReportXlsxInNewTab(benchmark, { workbookFormState });
      toast.success(BENCHMARK_REPORT_XLSX_OPENED);
    } catch (err) {
      console.error("[benchmark-report] excel open failed", err);
      toast.error("Could not open the Excel report. Please try again.");
    } finally {
      setDownloadingXlsx(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <PlanFilterLoadingOverlay
        open={plansLoad.overlayOpen}
        phase={plansLoad.overlayState.phase}
        planCount={plansLoad.overlayState.planCount}
        secondsLeft={plansLoad.overlayState.secondsLeft}
        progress={plansLoad.overlayState.progress}
        label={plansLoad.overlayLabel}
        variant="fixed"
      />
      <p className="text-xs sm:text-sm text-muted-foreground leading-snug whitespace-nowrap overflow-x-auto md:overflow-x-visible">
        Federal baselines and regional frameworks from your inputs — not a plan recommendation or
        enrollment offer.
      </p>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div
          className={cn(BENCHMARK_REPORT_STICKY_HEADER_CLASS, "space-y-2")}
          data-benchmark-sticky-header
        >
          <BenchmarkReportTabBar sections={navSections} />

          <div className="space-y-1">
            {benchmark && activeTab !== SECTION_UTILIZATION ? (
              <p className="text-xs font-bold text-muted-foreground leading-snug px-1">
                {BENCHMARK_NEW_INPUT_HINT}
              </p>
            ) : null}
            {activeTab === SECTION_POSSIBLE_PLANS && planFilterCountsForRow ? (
              <ResponsivePossiblePlansFilterRow
                activePanel={planPanel}
                activeScope={planFilterScope}
                onPanelChange={handlePlanPanelChange}
                myAvailableCounts={planFilterCountsForRow.myAvailableCounts}
                areaCounts={planFilterCountsForRow.areaCounts}
                highlyRatedSubTab={planPanel === "highly-rated" ? highlyRatedSubTab : undefined}
                highlyRatedTabCounts={
                  planPanel === "highly-rated" ? (highlyRatedTabCounts ?? undefined) : undefined
                }
                onHighlyRatedSubTabChange={
                  planPanel === "highly-rated" ? setHighlyRatedSubTab : undefined
                }
                showAllPlanCount={showAllPlanCount}
                incomeBand={planScenario?.incomeBand}
                canAccessAllPlansRow={canAccessAllPlansRow}
                canAccessZipCountyReport={canAccessZipCountyReport}
                canAccessISnpCatalog={canAccessISnpCatalog}
              />
            ) : null}
            {!justCreated && (hasPreviousScenarios || showActions || benchmark != null) ? (
              <div
                className={cn(
                  "flex flex-wrap items-center gap-x-2 gap-y-1.5 px-1 pb-0.5",
                  hasPreviousScenarios ? "justify-between" : "justify-end",
                )}
              >
                {hasPreviousScenarios ? (
                  <PreviousScenariosLink
                    section={previousScenariosSectionForTab(activeTab)}
                    className="shrink-0"
                  />
                ) : null}
                <BenchmarkReportHeaderToolbar
                  showActions={showActions}
                  benchmark={benchmark}
                  downloading={downloading}
                  downloadingXlsx={downloadingXlsx}
                  saving={saving}
                  running={running}
                  showRunUpdatedScenario={activeTab === SECTION_UTILIZATION}
                  intakeDirty={intakeDirty}
                  canSaveReport={canSaveReport}
                  saveDisabledReason={saveDisabledReason}
                  estimateId={estimateId}
                  onCopyLink={() => void copyLink()}
                  onDownloadReport={() => void openActiveTabPdf()}
                  onDownloadExcel={() => void openBenchmarkExcel()}
                  onSaveScenario={() => void handleSaveScenario()}
                  onRunUpdatedScenario={() => void handleRunUpdatedScenario()}
                />
              </div>
            ) : null}
          </div>
        </div>

        {justCreated ? (
          <div className="space-y-3">
            <div
              className={cn(
                "text-xs text-muted-foreground leading-snug flex flex-wrap items-center gap-x-2 gap-y-1.5 px-1",
                hasPreviousScenarios ? "justify-between" : "justify-end",
              )}
            >
              {hasPreviousScenarios ? (
                <PreviousScenariosLink
                  section={previousScenariosSectionForTab(activeTab)}
                  className="shrink-0"
                />
              ) : null}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>
                    <strong className="text-foreground">{BENCHMARK_CREATED}.</strong> Save your{" "}
                    {BENCHMARK_TOOL_ID_LABEL}{" "}
                    <code className="rounded border border-primary/30 bg-background px-1.5 py-0.5 font-mono text-xs">
                      {estimateId}
                    </code>{" "}
                    to reopen on another device.
                  </span>
                </span>
                {showActions || benchmark != null ? (
                  <BenchmarkReportActionBar
                    showActions={showActions}
                    benchmark={benchmark}
                    downloading={downloading}
                    downloadingXlsx={downloadingXlsx}
                    saving={saving}
                    running={running}
                    showRunUpdatedScenario={activeTab === SECTION_UTILIZATION}
                    intakeDirty={intakeDirty}
                    canSaveReport={canSaveReport}
                    saveDisabledReason={saveDisabledReason}
                    onCopyLink={() => void copyLink()}
                    onDownloadReport={() => void openActiveTabPdf()}
                    onDownloadExcel={() => void openBenchmarkExcel()}
                    onSaveScenario={() => void handleSaveScenario()}
                    onRunUpdatedScenario={() => void handleRunUpdatedScenario()}
                  />
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <TabsContent
          value={SECTION_UTILIZATION}
          id={SECTION_UTILIZATION}
          className="scroll-mt-24 mt-4"
        >
          <Card className="glass overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60">
              <SectionHeading
                number={navSections.find((s) => s.id === SECTION_UTILIZATION)?.number ?? 1}
                title={BENCHMARK_TAB_INPUT}
                icon={User}
              />
            </div>
            <div className="px-5 pb-4 pt-3 space-y-2">
              {benchmark && editedIntake ? (
                <BenchmarkReportSubsection title="Your answers" compact>
                  {locationChanged ? (
                    <p className="text-xs text-muted-foreground leading-snug mb-2">
                      {BENCHMARK_SAVE_LOCATION_CHANGED_HINT}. Click{" "}
                      {BENCHMARK_RUN_UPDATED_SCENARIO} below to rebuild with your new location.
                    </p>
                  ) : null}
                  {intakeDirty && !cmsLandscapeReady && !locationChanged ? (
                    <p className="text-xs text-muted-foreground leading-snug mb-2">
                      Plan catalog is loading — regional benchmark ranges will refresh when ready.
                    </p>
                  ) : null}
                  <BenchmarkMyInputEditor
                    key={estimateId}
                    intake={benchmark.intake}
                    onIntakeChange={handleIntakeChange}
                  />
                </BenchmarkReportSubsection>
              ) : null}

              <BenchmarkReportSubsection title="Prescription tier summary" compact>
                <p className="text-xs leading-snug">{inputPreviewReport.prescriptionTierSummary}</p>
              </BenchmarkReportSubsection>

              <BenchmarkReportSubsection title="Utilization context" compact>
                <p className="text-xs leading-snug">{inputPreviewReport.utilizationContext}</p>
              </BenchmarkReportSubsection>

              <BenchmarkReportSubsection title="Ancillary needs breakdown" compact>
                {inputPreviewReport.ancillaryNeeds.selected.length > 0 ? (
                  <ul className="text-xs list-disc pl-4 space-y-0.5 leading-snug">
                    {inputPreviewReport.ancillaryNeeds.selected.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                <p className="text-xs leading-snug">{inputPreviewReport.ancillaryNeeds.note}</p>
              </BenchmarkReportSubsection>

              {inputPreviewReport.hasPreferredPharmacy &&
              inputPreviewReport.preferredPharmacyName ? (
                <p className="text-xs leading-snug text-muted-foreground px-0.5">
                  Preferred pharmacy:{" "}
                  <strong className="text-foreground">
                    {inputPreviewReport.preferredPharmacyName}
                  </strong>
                  . Confirm network participation before enrolling.
                </p>
              ) : null}

              {benchmark && editedIntake ? (
                <div className="flex justify-end pt-2 border-t border-border/60">
                  <Button
                    type="button"
                    onClick={() => void handleRunUpdatedScenario()}
                    disabled={running || saving || !intakeDirty}
                    className={cn(
                      "gap-1.5",
                      intakeDirty
                        ? "bg-emerald hover:bg-emerald/90 text-emerald-foreground border-transparent"
                        : "grad-indigo",
                    )}
                  >
                    {running ? BENCHMARK_RUNNING_SCENARIO : BENCHMARK_RUN_UPDATED_SCENARIO}
                  </Button>
                </div>
              ) : null}
            </div>
            <BenchmarkReportTabFooter section="input" currentEstimateId={estimateId} />
          </Card>
        </TabsContent>

        <TabsContent
          value={SECTION_PBO_LOCAL}
          id={SECTION_PBO_LOCAL}
          className="scroll-mt-24 mt-4 space-y-4"
        >
          <Card className="glass overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60">
              <SectionHeading
                number={navSections.find((s) => s.id === SECTION_PBO_LOCAL)?.number ?? 2}
                title={BENCHMARK_TAB_PBO_LOCAL}
                icon={BookOpen}
              />
            </div>
            <div className="px-6 pb-6 pt-4 space-y-4">
              <div className="space-y-4">
                <h4
                  className={cn(
                    "font-display text-base font-bold",
                    BENCHMARK_SECTION_HEADING_CLASS,
                  )}
                >
                  {PBO_BLUEPRINT_SECTION_TITLE}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {report.partBBase.source}. These figures apply nationwide before any private
                  supplemental or Advantage framework.
                </p>
                <BenchmarkReportSubsection title="Premium & deductible">
                  <dl className="rounded-lg border border-border/60 bg-background/40 px-4">
                    <StatRow
                      label="Standard Part B monthly premium"
                      value={`${formatUsd(partBBase.standardMonthlyPremium)}/month`}
                    />
                    <StatRow
                      label="Annual Part B deductible"
                      value={formatUsd(partBBase.annualDeductible, 0)}
                    />
                  </dl>
                </BenchmarkReportSubsection>
                <BenchmarkReportSubsection title="Income band & co-insurance">
                  <p className="text-sm leading-relaxed border-l-2 border-primary/30 pl-3 text-muted-foreground">
                    <strong className="text-foreground font-medium">Income band (annually):</strong>{" "}
                    {report.incomeBand}
                  </p>
                  <p className="text-sm leading-relaxed border-l-2 border-primary/30 pl-3 text-muted-foreground">
                    {report.incomeBandNote}
                  </p>
                  <p className="text-sm leading-relaxed border-l-2 border-primary/30 pl-3 text-muted-foreground">
                    <strong className="text-foreground font-medium">Co-insurance:</strong> After
                    meeting the annual deductible, standard Original Medicare generally covers 80%
                    of Medicare-approved medical costs. You remain responsible for the remaining 20%
                    co-insurance, which is not capped under Original Medicare alone.
                  </p>
                </BenchmarkReportSubsection>
              </div>

              <div className="border-t border-border/60 pt-6 space-y-4">
                <h4
                  className={cn(
                    "font-display text-base font-bold",
                    BENCHMARK_SECTION_HEADING_CLASS,
                  )}
                >
                  {BENCHMARK_TAB_LOCAL}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Regional cost ranges for private-market frameworks near ZIP prefix {report.zip3}
                  xx, derived from {report.catalogRevision}. These are educational estimates — not
                  live quotes, carrier offers, or policy selections.
                </p>

                <div className="space-y-3">
                  <BenchmarkReportSubsection
                    title={localBenchmarks.medicareAdvantage.label}
                    subtitle="Typical premium and MOOP ranges"
                  >
                    <dl>
                      <StatRow
                        label="Typical premium bracket"
                        value={`${formatUsd(localBenchmarks.medicareAdvantage.premiumRangeMonthly.low, 0)} – ${formatUsd(localBenchmarks.medicareAdvantage.premiumRangeMonthly.high, 0)}/month`}
                      />
                      <StatRow
                        label="Common regional MOOP averages"
                        value={`${formatUsd(localBenchmarks.medicareAdvantage.moopRangeAnnual.low, 0)} – ${formatUsd(localBenchmarks.medicareAdvantage.moopRangeAnnual.high, 0)}/year`}
                      />
                    </dl>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {localBenchmarks.medicareAdvantage.moopSourceNote}
                    </p>
                    <p className="text-micro text-muted-foreground/80 leading-relaxed">
                      {localBenchmarks.medicareAdvantage.source}
                    </p>
                  </BenchmarkReportSubsection>

                  <BenchmarkReportSubsection
                    title={localBenchmarks.partD.label}
                    subtitle="Standalone prescription drug frameworks"
                  >
                    <dl>
                      <StatRow
                        label="Typical premium bracket"
                        value={`${formatUsd(localBenchmarks.partD.premiumRangeMonthly.low, 0)} – ${formatUsd(localBenchmarks.partD.premiumRangeMonthly.high, 0)}/month`}
                      />
                      <StatRow
                        label={`Federal statutory out-of-pocket cap (${partBBase.year})`}
                        value={`${formatUsd(localBenchmarks.partD.federalOopCap, 0)}/year`}
                      />
                    </dl>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {localBenchmarks.partD.source}
                    </p>
                  </BenchmarkReportSubsection>

                  {localBenchmarks.medigap ? (
                    <BenchmarkReportSubsection
                      title={localBenchmarks.medigap.label}
                      subtitle="Medicare Supplement (Medigap) premium ranges"
                    >
                      <dl>
                        <StatRow
                          label="Typical premium bracket"
                          value={`${formatUsd(localBenchmarks.medigap.premiumRangeMonthly.low, 0)} – ${formatUsd(localBenchmarks.medigap.premiumRangeMonthly.high, 0)}/month`}
                        />
                      </dl>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {localBenchmarks.medigap.source}
                      </p>
                    </BenchmarkReportSubsection>
                  ) : null}
                </div>
              </div>
            </div>
            <BenchmarkReportTabFooter section="pboLocal" currentEstimateId={estimateId} />
          </Card>
        </TabsContent>

        {planScenario ? (
          <TabsContent
            value={SECTION_POSSIBLE_PLANS}
            id={SECTION_POSSIBLE_PLANS}
            className="scroll-mt-24 mt-4"
          >
            <Card className="glass overflow-hidden">
              <div className={BENCHMARK_POSSIBLE_PLANS_CARD_BODY_CLASS}>
                <PlanComparisonTopTen
                  scenario={planScenario}
                  embedded
                  activePanel={planPanel}
                  onPanelChange={handlePlanPanelChange}
                  planFilterScope={planFilterScope}
                  resetOneVsTwoKey={potentialTop3Visit}
                  highlyRatedSubTab={highlyRatedSubTab}
                  onHighlyRatedSubTabChange={setHighlyRatedSubTab}
                  hideHighlyRatedCategoryRow={planPanel === "highly-rated"}
                  sectionNumber={
                    navSections.find((s) => s.id === SECTION_POSSIBLE_PLANS)?.number ?? 3
                  }
                  sectionTitle={BENCHMARK_TAB_POSSIBLE_PLANS}
                  initialCatalogDeferred={!plansLoad.catalogEnabled}
                  onInitialCatalogReady={plansLoad.completeInitialLoad}
                  showAllPlanCount={showAllPlanCount}
                  canAccessZipCountyReport={canAccessZipCountyReport}
                  canAccessCountyReportZip3={canAccessCountyReportZip3}
                  canAccessCountyReportZip5={canAccessCountyReportZip5}
                  canAccessISnpCatalog={canAccessISnpCatalog}
                />
              </div>
              <div className={BENCHMARK_POSSIBLE_PLANS_CARD_FOOTER_CLASS}>
                <BenchmarkReportTabFooter section="possiblePlans" currentEstimateId={estimateId} />
              </div>
            </Card>
          </TabsContent>
        ) : null}

        <TabsContent value={SECTION_WORKBOOK} id={SECTION_WORKBOOK} className="scroll-mt-24 mt-4">
          <Card className="glass overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60">
              <SectionHeading
                number={navSections.find((s) => s.id === SECTION_WORKBOOK)?.number ?? 4}
                title={BENCHMARK_WORKBOOK_SECTION_TITLE}
                icon={ClipboardList}
              />
            </div>
            <div className="px-6 pb-6 pt-4">
              <BenchmarkWorkbookChecklist
                scenarioCode={estimateId}
                seedFromIntake={!!benchmark}
                medicationNames={benchmark?.intake.medications ?? []}
                medicationDetails={benchmark?.intake.medicationDetails ?? []}
              />
            </div>
            <BenchmarkReportTabFooter section="workbook" currentEstimateId={estimateId} />
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
        This communication is for educational purposes only. It does not constitute personalized
        enrollment advice or a carrier plan catalog. Premiums, networks, and benefits vary by
        contract year and geography.
      </p>

      <BenchmarkReportBrandFooter />
      <BenchmarkReportBackToTop />
    </div>
  );
}
