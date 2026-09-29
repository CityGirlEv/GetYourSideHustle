import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import {
  DUE_DATE_FILTERS,
  DUE_DATE_FILTER_LABELS,
  WORK_BOARD_SORT_KEYS,
  WORK_BOARD_SORT_LABELS,
  singleFilterValue,
  setSingleFilterValue,
  toggleWorkBoardSort,
  type DueDateFilter,
  type WorkBoardSort,
  type WorkBoardSortKey,
} from '../lib/workBoard';
import { workBoardHeaderBubbleClass } from './WorkBoardExpandableRow';

function ColumnSortButton({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: WorkBoardSortKey;
  sort: WorkBoardSort;
  onSort: (next: WorkBoardSort) => void;
}) {
  const active = sort.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(toggleWorkBoardSort(sort, sortKey))}
      className={`${workBoardHeaderBubbleClass} inline-flex items-center gap-1 ${
        active ? 'bg-[#C2410C] text-white border-[#1F1917]' : 'bg-white text-[#1F1917] border-[#E5DFD3]'
      }`}
      aria-label={`Sort by ${label}`}
      data-testid={`work-board-sort-${sortKey}`}
      data-active={active}
      data-dir={active ? sort.dir : undefined}
    >
      {label}
      {active ? (
        sort.dir === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
      ) : null}
    </button>
  );
}

function ColumnFilterSelect({
  label,
  value,
  options,
  onChange,
  testId,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  testId: string;
}) {
  return (
    <label className="inline-flex flex-col gap-0.5 min-w-[7rem]">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        aria-label={`Filter ${label}`}
        data-testid={testId}
        className={`${workBoardHeaderBubbleClass} w-full max-w-[10rem] bg-white text-[#1F1917] border-[#E5DFD3]`}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function WorkBoardColumnBar<TStatus extends string>({
  sort,
  onSort,
  sprintFilter,
  sprintOrdered,
  onSprintChange,
  statusFilter,
  statusOrdered,
  statusLabels,
  onStatusChange,
  assigneeFilter,
  assigneeOrdered,
  assigneeLabels,
  onAssigneeChange,
  dueFilter,
  onDueChange,
  testIdPrefix = 'work-board',
}: {
  sort: WorkBoardSort;
  onSort: (next: WorkBoardSort) => void;
  sprintFilter: Set<string>;
  sprintOrdered: readonly string[];
  onSprintChange: (next: Set<string>) => void;
  statusFilter: Set<TStatus>;
  statusOrdered: readonly TStatus[];
  statusLabels: Record<TStatus, string>;
  onStatusChange: (next: Set<TStatus>) => void;
  assigneeFilter: Set<string>;
  assigneeOrdered: readonly string[];
  assigneeLabels: Record<string, string>;
  onAssigneeChange: (next: Set<string>) => void;
  dueFilter: DueDateFilter;
  onDueChange: (next: DueDateFilter) => void;
  testIdPrefix?: string;
}) {
  return (
    <div
      className="flex flex-wrap items-end gap-1 px-1 py-1 border-b border-[#E8DFD2]"
      data-testid={`${testIdPrefix}-column-bar`}
      aria-label="Sort and filter columns"
    >
      {WORK_BOARD_SORT_KEYS.map((key) => (
        <ColumnSortButton
          key={key}
          label={WORK_BOARD_SORT_LABELS[key]}
          sortKey={key}
          sort={sort}
          onSort={onSort}
        />
      ))}
      <ColumnFilterSelect
        label="Sprint"
        value={singleFilterValue(sprintFilter)}
        options={[
          { value: 'all', label: 'All sprints' },
          ...sprintOrdered.map((value) => ({ value, label: value })),
        ]}
        onChange={(value) => onSprintChange(setSingleFilterValue(value, sprintOrdered))}
        testId={`${testIdPrefix}-column-filter-sprint`}
      />
      <ColumnFilterSelect
        label="Status"
        value={singleFilterValue(statusFilter)}
        options={[
          { value: 'all', label: 'All statuses' },
          ...statusOrdered.map((value) => ({ value, label: statusLabels[value] })),
        ]}
        onChange={(value) => onStatusChange(setSingleFilterValue(value, statusOrdered))}
        testId={`${testIdPrefix}-column-filter-status`}
      />
      <ColumnFilterSelect
        label="Assignee"
        value={singleFilterValue(assigneeFilter)}
        options={[
          { value: 'all', label: 'All assignees' },
          ...assigneeOrdered.map((value) => ({ value, label: assigneeLabels[value] || value })),
        ]}
        onChange={(value) => onAssigneeChange(setSingleFilterValue(value, assigneeOrdered))}
        testId={`${testIdPrefix}-column-filter-assignee`}
      />
      <ColumnFilterSelect
        label="Due date"
        value={dueFilter}
        options={DUE_DATE_FILTERS.map((value) => ({ value, label: DUE_DATE_FILTER_LABELS[value] }))}
        onChange={(value) => onDueChange(value as DueDateFilter)}
        testId={`${testIdPrefix}-column-filter-due`}
      />
    </div>
  );
}
