import type { BenchmarkWorkbookContent } from "@/lib/benchmark-workbook-content";
import {
  applyWorkbookMedicationSeed,
  type WorkbookMedicationSeed,
} from "@/lib/workbook-medication-seed";

export const WORKBOOK_FORM_STORAGE_KEY_PREFIX = "pbo-turning-65-wkbk-form-v1";

/** @deprecated Use {@link workbookFormStorageKey} for per-scenario persistence. */
export const WORKBOOK_FORM_STORAGE_KEY = WORKBOOK_FORM_STORAGE_KEY_PREFIX;

export type WorkbookFormState = {
  checked: Record<string, boolean>;
  lines: Record<string, string>;
};

export function workbookFormStorageKey(scenarioCode?: string | null): string {
  const code = scenarioCode?.trim();
  if (!code) return WORKBOOK_FORM_STORAGE_KEY_PREFIX;
  return `${WORKBOOK_FORM_STORAGE_KEY_PREFIX}:${code.toUpperCase()}`;
}

export function emptyWorkbookFormState(workbook: BenchmarkWorkbookContent): WorkbookFormState {
  const checked: Record<string, boolean> = {};
  for (const section of workbook.checklistSections) {
    section.items.forEach((_, index) => {
      checked[`${section.id}:${index}`] = false;
    });
  }
  return { checked, lines: {} };
}

export type LoadWorkbookFormStateOptions = WorkbookMedicationSeed & {
  scenarioCode?: string | null;
  /** When false, skip intake medication pre-fill (new or incomplete scenario). */
  seedFromIntake?: boolean;
};

export function loadWorkbookFormState(
  workbook: BenchmarkWorkbookContent,
  options?: LoadWorkbookFormStateOptions,
): WorkbookFormState {
  const empty = emptyWorkbookFormState(workbook);
  let state = empty;
  const storageKey = workbookFormStorageKey(options?.scenarioCode);

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as WorkbookFormState;
        state = {
          checked: { ...empty.checked, ...parsed.checked },
          lines: parsed.lines ?? {},
        };
      }
    } catch {
      state = empty;
    }
  }

  const shouldSeed =
    options?.seedFromIntake !== false &&
    (options?.medicationNames?.length || options?.medicationDetails?.length);
  if (shouldSeed) {
    return applyWorkbookMedicationSeed(
      state,
      options?.medicationNames ?? [],
      options?.medicationDetails ?? [],
    );
  }

  return state;
}

export function saveWorkbookFormState(
  state: WorkbookFormState,
  scenarioCode?: string | null,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      workbookFormStorageKey(scenarioCode),
      JSON.stringify(state),
    );
  } catch {
    /* ignore quota */
  }
}

export function workbookFormHasAnswers(state: WorkbookFormState): boolean {
  if (Object.values(state.checked).some(Boolean)) return true;
  return Object.values(state.lines).some((value) => value.trim().length > 0);
}
