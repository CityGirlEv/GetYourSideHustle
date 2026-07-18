import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Download, ExternalLink, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BenchmarkReportSubsection } from "@/components/BenchmarkReportCollapsible";
import { TouchCheckboxField } from "@/components/ui/touch-checkbox";
import {
  getBenchmarkWorkbookContent,
  enumerateChecklistItems,
  workbookSectionStartsNewPage,
  type BenchmarkWorkbookWritingSection,
} from "@/lib/benchmark-workbook-content";
import { DEFAULT_WORKBOOK_LEAD_MAGNET } from "@/lib/content-factory/batch-seed";
import {
  WORKBOOK_SHORT_LABEL,
  workbookDownloadFilename,
} from "@/lib/content-factory/lead-magnet-paths";
import { downloadLeadMagnetPdf } from "@/lib/lead-magnet-pdf";
import { downloadWorkbookAnswersPdf } from "@/lib/workbook-answers-export";
import { BENCHMARK_REPORT_LINK_CLASS } from "@/lib/benchmark-report-ui";
import {
  loadWorkbookFormState,
  saveWorkbookFormState,
  workbookFormHasAnswers,
  type WorkbookFormState,
} from "@/lib/workbook-form-state";
import type { Medication } from "@/lib/medicare-math";
import { WORKBOOK_PRESCRIPTIONS_SECTION_ID, applyWorkbookMedicationSeed } from "@/lib/workbook-medication-seed";
import {
  applyDrugListToWorkbookState,
  downloadSavedDrugListCsv,
  downloadWorkbookDrugListTemplateXlsx,
  extractDrugListFromWorkbookState,
  parseDrugListFromFile,
  WORKBOOK_DRUG_LIST_TEMPLATE_CSV_URL,
} from "@/lib/workbook-drug-list";
import { workbookStateToPdfFill } from "@/lib/workbook-pdf-fill";
import { cn } from "@/lib/utils";

function workbookSectionPrintClass(sectionId: string): string {
  return workbookSectionStartsNewPage(sectionId)
    ? "workbook-print-section break-before-page print:break-before-page"
    : "";
}

function RuledInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-8 rounded-none border-0 border-b border-border/80 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0 focus-visible:border-primary"
    />
  );
}

function RuledInputs({
  prefix,
  count,
  lines,
  onLineChange,
}: {
  prefix: string;
  count: number;
  lines: Record<string, string>;
  onLineChange: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-2 pt-1">
      {Array.from({ length: count }, (_, index) => {
        const key = `${prefix}:line-${index}`;
        return (
          <RuledInput
            key={key}
            id={key}
            value={lines[key] ?? ""}
            onChange={(value) => onLineChange(key, value)}
          />
        );
      })}
    </div>
  );
}

function DrugTableInputs({
  prefix,
  count,
  lines,
  onLineChange,
}: {
  prefix: string;
  count: number;
  lines: Record<string, string>;
  onLineChange: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-2 pt-1">
      <div className="grid grid-cols-2 gap-3 text-micro font-medium uppercase tracking-wide text-muted-foreground">
        <span>Drug name</span>
        <span>Dosage / how often</span>
      </div>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="grid grid-cols-2 gap-3">
          <RuledInput
            id={`${prefix}:drug-${index}`}
            value={lines[`${prefix}:drug-${index}`] ?? ""}
            onChange={(value) => onLineChange(`${prefix}:drug-${index}`, value)}
            placeholder="Drug name"
          />
          <RuledInput
            id={`${prefix}:dose-${index}`}
            value={lines[`${prefix}:dose-${index}`] ?? ""}
            onChange={(value) => onLineChange(`${prefix}:dose-${index}`, value)}
            placeholder="Dosage / frequency"
          />
        </div>
      ))}
    </div>
  );
}

function WritingBlock({
  section,
  lines,
  onLineChange,
  compact,
}: {
  section: BenchmarkWorkbookWritingSection;
  lines: Record<string, string>;
  onLineChange: (key: string, value: string) => void;
  compact?: boolean;
}) {
  return (
    <BenchmarkReportSubsection
      id={section.id}
      title={section.title}
      compact={compact}
      className={workbookSectionPrintClass(section.id)}
    >
      <p className="text-xs leading-snug text-muted-foreground">{section.hint}</p>
      {section.variant === "drug-table" ? (
        <DrugTableInputs
          prefix={section.id}
          count={section.lines}
          lines={lines}
          onLineChange={onLineChange}
        />
      ) : (
        <RuledInputs
          prefix={section.id}
          count={section.lines}
          lines={lines}
          onLineChange={onLineChange}
        />
      )}
    </BenchmarkReportSubsection>
  );
}

export function WorkbookDownloadButton({
  className,
  size = "sm",
  variant = "default",
  label,
  formState,
}: {
  className?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline";
  /** Button label; defaults to the workbook PDF filename. */
  label?: string;
  /** When set, prescription lines and other saved fields are included in the PDF. */
  formState?: WorkbookFormState;
}) {
  const [downloading, setDownloading] = useState(false);

  const downloadWorkbook = async () => {
    setDownloading(true);
    try {
      await downloadLeadMagnetPdf(
        {
          title: DEFAULT_WORKBOOK_LEAD_MAGNET.title,
          excerpt: DEFAULT_WORKBOOK_LEAD_MAGNET.excerpt,
          body: DEFAULT_WORKBOOK_LEAD_MAGNET.body,
        },
        workbookDownloadFilename(),
        formState ? { fill: workbookStateToPdfFill(formState) } : undefined,
      );
      toast.success("Workbook PDF downloaded");
    } catch (err) {
      console.error("[workbook] download failed", err);
      toast.error("Could not download the workbook. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn(variant === "default" && "grad-indigo", className)}
      onClick={() => void downloadWorkbook()}
      disabled={downloading}
    >
      <Download className="h-4 w-4 mr-2 shrink-0" />
      {downloading ? "Preparing PDF…" : (label ?? `Download ${workbookDownloadFilename()}`)}
    </Button>
  );
}

export function WorkbookSaveAnswersButton({
  formState,
  className,
  size = "sm",
  variant = "outline",
}: {
  formState: WorkbookFormState;
  className?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline";
}) {
  const workbook = getBenchmarkWorkbookContent();
  const [saving, setSaving] = useState(false);
  const hasAnswers = workbookFormHasAnswers(formState);

  const saveAnswers = async () => {
    if (!hasAnswers) {
      toast.error("Add at least one checklist item or note before saving.");
      return;
    }
    setSaving(true);
    try {
      await downloadWorkbookAnswersPdf(workbook, formState);
      toast.success("Your workbook answers were downloaded");
    } catch (err) {
      console.error("[workbook] save answers failed", err);
      toast.error("Could not save your answers. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={() => void saveAnswers()}
      disabled={saving || !hasAnswers}
      title={
        hasAnswers
          ? "Download a PDF copy of your checklist answers and notes"
          : "Check items or fill in notes to save a copy"
      }
    >
      <Save className="h-4 w-4 mr-2 shrink-0" />
      {saving ? "Preparing PDF…" : "Save my answers"}
    </Button>
  );
}

type WorkbookChecklistFormProps = {
  compact?: boolean;
  downloadAtTop?: boolean;
  downloadAtBottom?: boolean;
  showWorkbookPageLink?: boolean;
  /** Benchmark / scenario code — isolates saved answers per comparison. */
  scenarioCode?: string | null;
  /** When false, workbook stays blank (no intake bleed-over from other scenarios). */
  seedFromIntake?: boolean;
  /** Medication names from benchmark intake — pre-fills prescription rows only. */
  medicationNames?: string[];
  /** Full medication rows from intake — used for dosage column in workbook PDF. */
  medicationDetails?: Medication[];
};

export function WorkbookChecklistForm({
  compact = false,
  downloadAtTop = false,
  downloadAtBottom = false,
  showWorkbookPageLink = false,
  scenarioCode = null,
  seedFromIntake = false,
  medicationNames = [],
  medicationDetails = [],
}: WorkbookChecklistFormProps) {
  const workbook = getBenchmarkWorkbookContent();
  const medSeed = { medicationNames, medicationDetails, scenarioCode, seedFromIntake };
  const [formState, setFormState] = useState<WorkbookFormState>(() =>
    loadWorkbookFormState(workbook, medSeed),
  );
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const uploadInputId = useId();
  const scenarioRef = useRef(scenarioCode);
  scenarioRef.current = scenarioCode;

  const intakeMedCount = Math.max(medicationDetails.length, medicationNames.length);
  const prescriptionRowCount = Math.max(
    workbook.writingSections.find((section) => section.id === WORKBOOK_PRESCRIPTIONS_SECTION_ID)
      ?.lines ?? 4,
    intakeMedCount,
    Object.keys(formState.lines).filter((key) =>
      key.startsWith(`${WORKBOOK_PRESCRIPTIONS_SECTION_ID}:drug-`),
    ).length,
  );

  useEffect(() => {
    setFormState(loadWorkbookFormState(workbook, medSeed));
  }, [scenarioCode, seedFromIntake]);

  useEffect(() => {
    if (!seedFromIntake || intakeMedCount === 0) return;
    setFormState((prev) =>
      applyWorkbookMedicationSeed(prev, medicationNames, medicationDetails),
    );
  }, [seedFromIntake, intakeMedCount, medicationNames, medicationDetails]);

  useEffect(() => {
    saveWorkbookFormState(formState, scenarioRef.current);
  }, [formState]);

  const setChecked = useCallback((key: string, checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      checked: { ...prev.checked, [key]: checked },
    }));
  }, []);

  const setLine = useCallback((key: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      lines: { ...prev.lines, [key]: value },
    }));
  }, []);

  const handleDrugListUpload = async (file: File) => {
    try {
      const rows = await parseDrugListFromFile(file);
      if (rows.length === 0) {
        toast.error("No drug rows found in that file.");
        return;
      }
      setFormState((prev) => applyDrugListToWorkbookState(prev, rows));
      toast.success(`Imported ${rows.length} medication${rows.length === 1 ? "" : "s"}`);
    } catch (err) {
      console.error("[workbook] drug list upload failed", err);
      toast.error("Could not read that file. Use the template format.");
    }
  };

  const saveDrugList = () => {
    const rows = extractDrugListFromWorkbookState(formState);
    if (rows.length === 0) {
      toast.error("Add at least one prescription row before saving your drug list.");
      return;
    }
    try {
      downloadSavedDrugListCsv(rows, scenarioCode ?? undefined);
      toast.success("Drug list downloaded");
    } catch (err) {
      console.error("[workbook] drug list save failed", err);
      toast.error("Could not download your drug list.");
    }
  };

  const handleTemplateXlsxDownload = async () => {
    try {
      await downloadWorkbookDrugListTemplateXlsx();
    } catch (err) {
      console.error("[workbook] Excel template download failed", err);
      toast.error("Could not download the Excel template. Try the CSV template instead.");
    }
  };

  return (
    <div className="space-y-4">
      {downloadAtTop ? (
        <div className="pb-2">
          <WorkbookDownloadButton className="w-full sm:w-auto" size="default" formState={formState} />
        </div>
      ) : null}

      {showWorkbookPageLink ? (
        <p className="text-xs leading-snug text-muted-foreground">
          Printable checklist to gather facts before you meet with a licensed agent or advisor.{" "}
          <Link to="/workbook" className={cn("text-primary font-medium", BENCHMARK_REPORT_LINK_CLASS)}>
            {WORKBOOK_SHORT_LABEL}
            <ExternalLink className="inline h-3 w-3 ml-0.5 align-text-bottom" aria-hidden />
          </Link>
        </p>
      ) : null}

      <BenchmarkReportSubsection title={workbook.title} subtitle={workbook.excerpt} compact={compact}>
        <div className="space-y-6">
          {workbook.checklistSections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className={cn("scroll-mt-24 space-y-2.5", workbookSectionPrintClass(section.id))}
            >
              <h4 className="text-xs font-semibold text-primary">{section.title}</h4>
              <ul className="space-y-2">
                {enumerateChecklistItems(workbook)
                  .filter((entry) => entry.sectionId === section.id)
                  .map((entry) => {
                    const key = `${entry.sectionId}:${entry.itemIndex}`;
                    return (
                      <li key={key}>
                        <TouchCheckboxField
                          checked={formState.checked[key] ?? false}
                          onChange={(event) => setChecked(key, event.target.checked)}
                          className="items-start gap-2 text-xs leading-snug"
                        >
                          <span className="font-medium tabular-nums text-muted-foreground shrink-0">
                            {entry.globalNumber}.
                          </span>
                          {entry.item}
                        </TouchCheckboxField>
                      </li>
                    );
                  })}
              </ul>
              {section.id === "workbook-agent-questions" ? (
                <div className="pt-1">
                  <p className="text-micro font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    Your notes
                  </p>
                  <RuledInputs
                    prefix={`${section.id}:notes`}
                    count={3}
                    lines={formState.lines}
                    onLineChange={setLine}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </BenchmarkReportSubsection>

      {workbook.writingSections.map((section) => (
        <WritingBlock
          key={section.id}
          section={
            section.id === WORKBOOK_PRESCRIPTIONS_SECTION_ID
              ? { ...section, lines: prescriptionRowCount }
              : section
          }
          lines={formState.lines}
          onLineChange={setLine}
          compact={compact}
        />
      ))}

      {workbook.writingSections.some((section) => section.id === WORKBOOK_PRESCRIPTIONS_SECTION_ID) ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-muted/15 px-3 py-2">
          <span className="text-micro font-medium uppercase tracking-wide text-muted-foreground w-full sm:w-auto">
            Drug list tools
          </span>
          <Button type="button" size="sm" variant="outline" asChild>
            <a href={WORKBOOK_DRUG_LIST_TEMPLATE_CSV_URL} download="workbook-drug-list-template.csv">
              <Download className="h-4 w-4 mr-1.5 shrink-0" />
              Template (CSV)
            </a>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void handleTemplateXlsxDownload()}
          >
            <Download className="h-4 w-4 mr-1.5 shrink-0" />
            Template (Excel)
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={saveDrugList}>
            <Save className="h-4 w-4 mr-1.5 shrink-0" />
            Save drug list
          </Button>
          <input
            id={uploadInputId}
            ref={uploadInputRef}
            type="file"
            accept=".csv,.txt,.xlsx,.xls,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void handleDrugListUpload(file);
            }}
          />
          <label
            htmlFor={uploadInputId}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "cursor-pointer inline-flex",
            )}
          >
            <Upload className="h-4 w-4 mr-1.5 shrink-0" />
            Upload list
          </label>
          <p className="text-micro text-muted-foreground w-full leading-snug">
            Fill the template with drug name and dosage, then upload a CSV, text, or Excel file.
          </p>
        </div>
      ) : null}

      <p className="text-micro leading-snug text-muted-foreground px-0.5">{workbook.disclaimer}</p>

      <div className="flex flex-wrap gap-2 pt-1">
        <WorkbookSaveAnswersButton formState={formState} size={downloadAtBottom ? "sm" : "default"} />
        {downloadAtBottom ? (
          <>
            <WorkbookDownloadButton formState={formState} />
            {showWorkbookPageLink ? (
              <Button type="button" size="sm" variant="outline" asChild>
                <Link to="/workbook">{WORKBOOK_SHORT_LABEL}</Link>
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
