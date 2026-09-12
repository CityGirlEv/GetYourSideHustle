import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { SAVE_ALL_LABEL, workBoardSaveButtonTone, workPriorityTextClass, type SprintCategory, type WorkPriority } from '../lib/workBoard';
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
  options: Array<{ value: string; label: string }>;
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
        <option key={option.value} value={option.value}>
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
  saving?: boolean;
  canSave?: boolean;
  sprint?: SprintCategory;
  testId?: string;
  codeTestId?: string;
}) {
  const titleClass = workPriorityTextClass(priority);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
    <article
      id={id}
      data-testid={testId ?? `work-row-${id}`}
      data-status={status}
      className={`w-full ${className ?? 'bg-white'}`}
    >
      <div className="flex flex-wrap items-center gap-0.5 px-0.5 min-h-[44px]">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="shrink-0 h-7 w-7 inline-flex items-center justify-center cursor-pointer"
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
            className={`shrink-0 text-[10px] font-mono font-black ${titleClass}`}
            data-testid={codeTestId ?? `work-row-code-${id}`}
          >
            {code}
          </span>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          className="min-w-0 flex-1 h-7 text-left cursor-pointer px-0.5"
        >
          <span className={`block truncate text-sm font-semibold leading-tight ${titleClass}`}>{title}</span>
        </button>
        <span className="inline-flex flex-wrap items-center gap-0.5 shrink-0">{badges}</span>
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
            className="h-7 w-7 inline-flex items-center justify-center text-[#9A8B80] hover:text-red-600 cursor-pointer"
            aria-label={deleteLabel ?? `Delete ${title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
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
