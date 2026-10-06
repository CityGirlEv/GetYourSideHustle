import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { SAVE_ALL_LABEL, workBoardSaveButtonTone, workDueDateControlClass, workOverdueTextClass, type SprintCategory, type WorkPriority } from '../lib/workBoard';
import { AreYouSureDialog } from './AreYouSureDialog';

export function RolledOverStatusBadge({ testId }: { testId?: string }) {
  return (
    <span
      className="text-[9px] font-mono font-black uppercase px-1.5 min-h-[44px] inline-flex items-center rounded border bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]"
      data-testid={testId ?? 'rolled-over-status'}
    >
      Rolled Over
    </span>
  );
}

export const workBoardHeaderBubbleClass =
  'text-[9px] font-mono font-bold leading-none px-1.5 py-0.5 min-h-[44px] rounded border cursor-pointer';

export function WorkBoardHeaderDate({
  value,
  onChange,
  overdue = false,
  ariaLabel = 'Due date',
  testId,
}: {
  value?: string;
  onChange: (value: string) => void;
  overdue?: boolean;
  ariaLabel?: string;
  testId?: string;
}) {
  return (
    <input
      type="date"
      value={value ?? ''}
      aria-label={ariaLabel}
      data-testid={testId}
      className={`${workBoardHeaderBubbleClass} w-[8.75rem] ${workDueDateControlClass(overdue)}`}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onChange={(event) => {
        event.stopPropagation();
        onChange(event.target.value);
      }}
    />
  );
}

export function WorkBoardHeaderSelect({
  value,
  onChange,
  options,
  className,
  ariaLabel,
  testId,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  className?: string;
  ariaLabel: string;
  testId?: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid={testId}
      className={`${workBoardHeaderBubbleClass} w-max max-w-[10rem] ${className ?? 'bg-white text-[#1F1917] border-[#E5DFD3]'}`}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onInput={(event) => {
        event.stopPropagation();
        onChange((event.target as HTMLSelectElement).value);
      }}
      onChange={(event) => {
        event.stopPropagation();
        onChange(event.target.value);
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function WorkBoardExpandableRow({
  id,
  code,
  title,
  open,
  onToggle,
  badges,
  children,
  onDelete,
  onSave,
  deleteLabel,
  saveLabel,
  className,
  status,
  priority,
  overdue = false,
  saving,
  canSave = false,
  testId,
  codeTestId,
}: {
  id: string;
  code?: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  badges?: React.ReactNode;
  children: React.ReactNode;
  onDelete?: () => void;
  onSave?: () => void;
  deleteLabel?: string;
  saveLabel?: string;
  className?: string;
  status?: string;
  priority?: WorkPriority | string;
  overdue?: boolean;
  saving?: boolean;
  canSave?: boolean;
  sprint?: SprintCategory;
  testId?: string;
  codeTestId?: string;
}) {
  const titleClass = workOverdueTextClass(overdue);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
    <article
      id={id}
      data-testid={testId ?? `work-row-${id}`}
      data-status={status}
      className={`w-full ${className ?? 'bg-white'}`}
    >
      <div className="flex flex-col gap-0.5 px-0.5 py-0.5">
        <div className="flex items-start gap-0.5 min-h-[44px]">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="shrink-0 h-11 w-11 inline-flex items-center justify-center cursor-pointer"
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          >
            {open ? (
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${titleClass}`} />
            ) : (
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${titleClass}`} />
            )}
          </button>
          {code ? (
            <span
              className={`shrink-0 pt-3 text-[10px] font-mono font-black ${titleClass}`}
              data-testid={codeTestId ?? `work-row-code-${id}`}
            >
              {code}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onToggle}
            className="min-w-0 flex-1 min-h-[44px] text-left cursor-pointer px-0.5 py-2"
            data-testid={`work-row-title-${id}`}
          >
            <span className={`block text-sm font-semibold leading-snug break-words whitespace-normal ${titleClass}`}>{title}</span>
          </button>
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={!canSave}
              className={`min-h-[44px] min-w-[44px] px-2 shrink-0 inline-flex items-center justify-center text-[9px] font-black uppercase tracking-wide rounded border ${workBoardSaveButtonTone(Boolean(canSave))}`}
              aria-label={saveLabel ?? `Save ${title} to database`}
              data-testid={`work-row-save-${id}`}
            >
              {saving ? 'Saving' : 'Save'}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setConfirmOpen(true);
              }}
              className="h-11 w-11 inline-flex items-center justify-center text-[#9A8B80] hover:text-red-600 cursor-pointer"
              aria-label={deleteLabel ?? `Delete ${title}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {badges ? (
          <span className="inline-flex flex-wrap items-center gap-0.5 pl-11">{badges}</span>
        ) : null}
      </div>
      {open && (
        <div className="px-2 pb-1 border-t border-[#F0E8DC] space-y-1" data-testid={`work-row-fields-${id}`}>
          {children}
        </div>
      )}
    </article>
    <AreYouSureDialog
      open={confirmOpen}
      onCancel={() => setConfirmOpen(false)}
      onConfirm={() => {
        setConfirmOpen(false);
        onDelete?.();
      }}
    />
    </>
  );
}

export function WorkBoardFieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1">{children}</div>;
}

export function WorkBoardField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-[10px] font-mono font-bold uppercase tracking-wide text-[#6B5344]">
      {label}
      {children}
    </label>
  );
}

export const workBoardFieldClassName =
  'w-full min-h-[44px] bg-[#FFFCF7] border border-[#E8DFD2] rounded-xl px-3 text-xs font-semibold text-[#1F1917] focus:border-[#C4A574] focus:outline-none';

export function WorkBoardSaveAllButton({
  onSave,
  saving = false,
  enabled = false,
  testId = 'work-board-save-all',
}: {
  onSave: () => void;
  saving?: boolean;
  enabled?: boolean;
  testId?: string;
}) {
  const saveEnabled = Boolean(enabled);
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={!saveEnabled}
      data-testid={testId}
      className={`min-h-[44px] px-2 inline-flex items-center justify-center text-[9px] font-black uppercase tracking-wide rounded border ${workBoardSaveButtonTone(saveEnabled)}`}
    >
      {saving ? 'Saving' : SAVE_ALL_LABEL}
    </button>
  );
}
