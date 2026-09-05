import React from 'react';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import {
  applyChecklistStepAdd,
  applyChecklistStepDelete,
  applyChecklistStepEdit,
  canEditWorkChecklistSteps,
  checklistProgress,
  toggleChecklistStep,
  type WorkChecklistActor,
  type WorkChecklistStep,
} from '../lib/workChecklist';
import { confirmDelete } from '../lib/confirmDelete';

export function WorkItemDescriptionChecklist({
  kind,
  steps,
  onStepsChange,
  relatedLinks,
  testId,
  actor,
}: {
  kind: 'task' | 'test';
  steps: WorkChecklistStep[];
  onStepsChange: (next: WorkChecklistStep[]) => void;
  relatedLinks?: Array<{ code: string; title: string; href?: string }>;
  testId: string;
  actor?: WorkChecklistActor | null;
}) {
  const progress = checklistProgress(steps);
  const canEdit = canEditWorkChecklistSteps(actor);

  return (
    <div className="space-y-0" data-testid={testId}>
      {relatedLinks && relatedLinks.length > 0 ? (
        <ul className="flex flex-wrap gap-1 py-1">
          {relatedLinks.map((link) => (
            <li key={link.code}>
              {link.href ? (
                <a
                  href={link.href}
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-[#1F1917] bg-white px-2 text-[10px] font-black uppercase text-[#1F1917]"
                >
                  <span className="font-mono">{link.code}</span>
                  <span className="normal-case font-semibold tracking-normal max-w-[12rem] truncate">
                    {link.title}
                  </span>
                </a>
              ) : (
                <span className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-[#E8DFD2] bg-[#FFFCF7] px-2 text-[10px] font-black uppercase text-[#1F1917]">
                  <span className="font-mono">{link.code}</span>
                  <span className="normal-case font-semibold tracking-normal max-w-[12rem] truncate">
                    {link.title}
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-baseline justify-between gap-x-2 px-1">
        <p className="text-[10px] font-mono font-black uppercase tracking-wide text-[#6B5344]">Steps</p>
        <p className="text-[10px] font-mono font-bold text-[#6B5344] tabular-nums">
          {progress.done}/{progress.total}
          {kind === 'test' ? ' to Pass' : ' to Done'}
        </p>
      </div>

      {steps.length === 0 ? (
        <p className="text-xs text-[#6B5344] px-1">No steps.</p>
      ) : (
        <ul className="divide-y divide-[#E8DFD2]">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className="flex items-start gap-1 min-h-[44px] py-1"
              data-testid={`${testId}-step-${step.id}`}
            >
              <label className="inline-flex items-center min-h-[44px] min-w-[44px] justify-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={step.checked}
                  onChange={() => onStepsChange(toggleChecklistStep(steps, step.id))}
                  className="w-4 h-4 accent-[#C2410C]"
                  aria-label={`Step ${index + 1} done`}
                />
              </label>
              <span className="font-mono font-bold text-[#6B5344] text-xs min-h-[44px] inline-flex items-center shrink-0">
                {index + 1}.
              </span>
              {canEdit ? (
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1">
                  <input
                    type="text"
                    value={step.label}
                    onChange={(event) =>
                      onStepsChange(
                        applyChecklistStepEdit(steps, step.id, { label: event.target.value }, actor),
                      )
                    }
                    onKeyDown={(event) => event.stopPropagation()}
                    onBlur={(event) => {
                      const trimmed = event.target.value.trim();
                      if (trimmed === step.label) return;
                      onStepsChange(
                        applyChecklistStepEdit(steps, step.id, { label: trimmed || step.label }, actor),
                      );
                    }}
                    className="w-full min-h-[44px] px-2 rounded-lg border-2 border-[#E5DFD3] bg-white text-xs text-[#1F1917]"
                    aria-label={`Step ${index + 1} label`}
                    data-testid={`${testId}-step-label-${step.id}`}
                  />
                  {step.href ? (
                    <a
                      href={step.href}
                      {...(/^https?:\/\//i.test(step.href)
                        ? { target: '_blank', rel: 'noreferrer' }
                        : {})}
                      className="inline-flex items-center justify-center gap-1 min-h-[44px] px-2.5 shrink-0 rounded-lg border border-[#C2410C]/40 text-[10px] font-black uppercase tracking-wide text-[#C2410C]"
                      data-testid={`${testId}-step-open-${step.id}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open
                    </a>
                  ) : null}
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#1F1917] leading-tight min-h-[44px] inline-flex items-center">
                    {step.href ? (
                      <a
                        href={step.href}
                        {...(/^https?:\/\//i.test(step.href)
                          ? { target: '_blank', rel: 'noreferrer' }
                          : {})}
                        className="font-semibold text-[#C2410C] underline underline-offset-2 min-h-[44px] inline-flex items-center"
                      >
                        {step.label}
                      </a>
                    ) : (
                      step.label
                    )}
                  </p>
                </div>
              )}
              {canEdit ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!confirmDelete()) return;
                    onStepsChange(applyChecklistStepDelete(steps, step.id, actor));
                  }}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-[#E8DFD2] text-red-700 cursor-pointer shrink-0"
                  aria-label={`Delete step ${index + 1}`}
                  data-testid={`${testId}-step-delete-${step.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {canEdit ? (
        <button
          type="button"
          onClick={() => onStepsChange(applyChecklistStepAdd(steps, { label: 'New step' }, actor))}
          className="min-h-[44px] px-3 mt-1 inline-flex items-center gap-1.5 rounded-xl border-2 border-[#1F1917] text-[10px] font-black uppercase tracking-wide cursor-pointer"
          data-testid={`${testId}-add-step`}
        >
          <Plus className="w-3.5 h-3.5" /> Add step
        </button>
      ) : null}
    </div>
  );
}
