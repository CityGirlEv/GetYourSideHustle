import React from 'react';
import { Save } from 'lucide-react';
import { SAVING_TO_DATABASE_LABEL } from '../lib/logoStore';
import { SAVE_ALL_LABEL, workBoardSaveButtonTone } from '../lib/workBoard';

export interface WorkBoardBulkField {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  onApply: (value: string) => void;
}

export function WorkBoardBulkBar({
  selectedCount,
  visibleCount,
  allVisibleSelected,
  onToggleSelectAllVisible,
  onClearSelection,
  fields,
  testId,
  onSave,
  saving = false,
  canSave = false,
}: {
  selectedCount: number;
  visibleCount: number;
  allVisibleSelected: boolean;
  onToggleSelectAllVisible: () => void;
  onClearSelection: () => void;
  fields: WorkBoardBulkField[];
  testId: string;
  onSave?: () => void;
  saving?: boolean;
  canSave?: boolean;
}) {
  const saveEnabled = Boolean(canSave);
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border-2 border-[#C9A08C] bg-[#F6EBE4] p-3 sm:p-4"
      data-testid={testId}
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 min-h-[44px] text-[10px] font-mono font-black uppercase text-[#1F1917] cursor-pointer">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={onToggleSelectAllVisible}
            className="w-4 h-4 accent-[#D9A892]"
            data-testid={`${testId}-select-all`}
          />
          Select all visible ({visibleCount})
        </label>
        <span className="text-[10px] font-mono font-black uppercase text-[#6B3A2C] tabular-nums">
          {selectedCount} selected
        </span>
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onClearSelection}
            className="min-h-[44px] px-3 text-[10px] font-black uppercase text-[#3F3832] hover:text-[#6B3A2C] cursor-pointer"
          >
            Clear selection
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono font-black uppercase text-[#3F3832]">
          Bulk edit{selectedCount === 0 ? ' (select rows first)' : ''}
        </span>
        {fields.map((field) => (
          <select
            key={field.id}
            disabled={selectedCount === 0}
            defaultValue=""
            onChange={(event) => {
              const value = event.target.value;
              if (!value) return;
              field.onApply(value);
              event.target.value = '';
            }}
            className="min-h-[44px] text-[10px] font-mono font-bold px-2 rounded-xl bg-white border-2 border-[#1F1917] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Bulk ${field.label}`}
            data-testid={`${testId}-${field.id}`}
          >
            <option value="">{field.label}…</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
        {onSave ? (
          <button
            type="button"
            onClick={onSave}
            disabled={!saveEnabled}
            data-testid={`${testId}-save`}
            className={`min-h-[44px] px-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-wide inline-flex items-center justify-center gap-1.5 shrink-0 ${workBoardSaveButtonTone(saveEnabled)}`}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? SAVING_TO_DATABASE_LABEL : SAVE_ALL_LABEL}
          </button>
        ) : null}
      </div>
    </div>
  );
}
