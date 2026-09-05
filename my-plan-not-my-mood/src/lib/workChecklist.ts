/**
 * Step checklists for Tasks and QA tests.
 * When a page is under test, step 1 should be the link to open that page.
 * All steps must be checked before a task can be Done or a test can be Passed.
 */

export type WorkChecklistStep = {
  id: string;
  label: string;
  checked: boolean;
  /** Optional URL — use on step 1 when the item targets a specific page. */
  href?: string;
  /** QA: this is where the tester failed. */
  failedHere?: boolean;
};

function newStepId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeWorkChecklist(raw: unknown): WorkChecklistStep[] {
  if (!Array.isArray(raw)) return [];
  const out: WorkChecklistStep[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const label = String(row.label ?? row.text ?? '').trim();
    if (!label && !String(row.href ?? '').trim()) continue;
    const href = String(row.href ?? '').trim();
    out.push({
      id: String(row.id ?? '').trim() || newStepId(),
      label: label || href,
      checked: Boolean(row.checked),
      href: href || undefined,
      failedHere: Boolean(row.failedHere) || undefined,
    });
  }
  return out;
}

export function createChecklistStep(input: {
  label: string;
  href?: string;
  checked?: boolean;
  failedHere?: boolean;
}): WorkChecklistStep {
  const href = String(input.href ?? '').trim();
  const label = String(input.label ?? '').trim() || href || 'New step';
  return {
    id: newStepId(),
    label,
    checked: Boolean(input.checked),
    href: href || undefined,
    failedHere: input.failedHere || undefined,
  };
}

export function addChecklistStep(
  steps: WorkChecklistStep[],
  input: { label: string; href?: string } = { label: 'New step' },
): WorkChecklistStep[] {
  return [...steps, createChecklistStep(input)];
}

/** Prefer putting a page URL as step 1 when the item refers to a specific page. */
export function ensurePageLinkAsStepOne(
  steps: WorkChecklistStep[],
  pageUrl: string,
  label = 'Open the page under test',
): WorkChecklistStep[] {
  const href = String(pageUrl ?? '').trim();
  if (!href) return steps;
  const withoutDup = steps.filter(
    (s) => String(s.href ?? '').trim().toLowerCase() !== href.toLowerCase(),
  );
  return [createChecklistStep({ label, href, checked: false }), ...withoutDup];
}

/** Attach a page URL to step 1 without adding a new row or clearing checkmarks. */
export function applyFirstStepPageHref(
  steps: WorkChecklistStep[],
  pageUrl: string | undefined,
): WorkChecklistStep[] {
  const href = String(pageUrl ?? '').trim();
  if (!href) return steps;
  if (steps.length === 0) {
    return [createChecklistStep({ label: 'Open the page under test', href, checked: false })];
  }
  if (String(steps[0].href ?? '').trim() === href) return steps;
  return [{ ...steps[0], href }, ...steps.slice(1)];
}

export function checklistAllChecked(steps: WorkChecklistStep[] | null | undefined): boolean {
  const list = steps ?? [];
  if (list.length === 0) return true;
  return list.every((s) => s.checked);
}

/** Mark every remaining step checked so Done / Passed can land. */
export function checkAllChecklistSteps(
  steps: WorkChecklistStep[] | null | undefined,
): WorkChecklistStep[] {
  return (steps ?? []).map((step) => (step.checked ? step : { ...step, checked: true }));
}

export function checklistProgress(steps: WorkChecklistStep[] | null | undefined): {
  total: number;
  done: number;
} {
  const list = steps ?? [];
  return { total: list.length, done: list.filter((s) => s.checked).length };
}

export function toggleChecklistStep(
  steps: WorkChecklistStep[],
  stepId: string,
  checked?: boolean,
): WorkChecklistStep[] {
  return steps.map((step) =>
    step.id === stepId
      ? { ...step, checked: checked === undefined ? !step.checked : checked }
      : step,
  );
}

export function updateChecklistStep(
  steps: WorkChecklistStep[],
  stepId: string,
  patch: Partial<Pick<WorkChecklistStep, 'label' | 'href' | 'checked'>>,
): WorkChecklistStep[] {
  return steps.map((step) => {
    if (step.id !== stepId) return step;
    const next = { ...step };
    if (patch.label !== undefined) next.label = String(patch.label);
    if (patch.href !== undefined) {
      next.href = String(patch.href);
    }
    if (patch.checked !== undefined) next.checked = Boolean(patch.checked);
    return next;
  });
}

export function removeChecklistStep(steps: WorkChecklistStep[], stepId: string): WorkChecklistStep[] {
  return steps.filter((s) => s.id !== stepId);
}

export const FAILED_HERE_LABEL = 'Failed here';

/** First unchecked step, or step 1 when none are checked, or the last step if all are checked. */
export function failedHereStepId(steps: WorkChecklistStep[]): string | null {
  if (steps.length === 0) return null;
  if (!steps.some((step) => step.checked)) return steps[0]!.id;
  const firstOpen = steps.find((step) => !step.checked);
  return firstOpen?.id ?? steps[steps.length - 1]!.id;
}

export function failedHereStepNumber(steps: WorkChecklistStep[]): number {
  const id = failedHereStepId(steps);
  if (!id) return 1;
  const index = steps.findIndex((step) => step.id === id);
  return index >= 0 ? index + 1 : 1;
}

export function markFailedHere(steps: WorkChecklistStep[]): WorkChecklistStep[] {
  const id = failedHereStepId(steps);
  return steps.map((step) => ({ ...step, failedHere: step.id === id ? true : undefined }));
}

export function clearFailedHere(steps: WorkChecklistStep[]): WorkChecklistStep[] {
  return steps.map((step) => (step.failedHere ? { ...step, failedHere: undefined } : step));
}

export type WorkChecklistActor = {
  isSuperAdmin?: boolean;
};

/** Super Admin may rewrite or remove steps; everyone else only checks boxes. */
export function canEditWorkChecklistSteps(actor?: WorkChecklistActor | null): boolean {
  return Boolean(actor?.isSuperAdmin);
}

export function applyChecklistStepEdit(
  steps: WorkChecklistStep[],
  stepId: string,
  patch: Partial<Pick<WorkChecklistStep, 'label' | 'href' | 'checked'>>,
  actor?: WorkChecklistActor | null,
): WorkChecklistStep[] {
  if (!canEditWorkChecklistSteps(actor)) return steps;
  return updateChecklistStep(steps, stepId, patch);
}

export function applyChecklistStepDelete(
  steps: WorkChecklistStep[],
  stepId: string,
  actor?: WorkChecklistActor | null,
): WorkChecklistStep[] {
  if (!canEditWorkChecklistSteps(actor)) return steps;
  return removeChecklistStep(steps, stepId);
}

export function applyChecklistStepAdd(
  steps: WorkChecklistStep[],
  input: { label: string; href?: string } = { label: 'New step' },
  actor?: WorkChecklistActor | null,
): WorkChecklistStep[] {
  if (!canEditWorkChecklistSteps(actor)) return steps;
  return addChecklistStep(steps, input);
}

/** True when label or href looks like a URL / path. */
export function looksLikePageLink(value: string): boolean {
  const raw = String(value ?? '').trim();
  return /^(https?:\/\/|\/[a-z0-9])/i.test(raw);
}
