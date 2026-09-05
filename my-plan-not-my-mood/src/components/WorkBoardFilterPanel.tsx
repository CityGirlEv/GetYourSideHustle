import React, { useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { studioTabClass, studioTabMetaClass } from '../lib/assetLibrary';
import type { DueDateFilter, FilterChipCount, FilterSectionId } from '../lib/workBoard';
import {
  applyFilterChipClick,
  defaultFilterSectionTab,
  FILTER_SECTION_LABELS,
  FILTER_SECTION_TONES,
  FILTER_TABS_HINT,
  isFilterShowingAll,
  selectAllFilterValues,
} from '../lib/workBoard';

interface FilterChipPanelProps<T extends string> {
  sectionId: FilterSectionId;
  chips: FilterChipCount[];
  selected: Set<T>;
  ordered: readonly T[];
  onChange: (next: Set<T>) => void;
  testId?: string;
}

function FilterChipPanel<T extends string>({
  sectionId,
  chips,
  selected,
  ordered,
  onChange,
  testId,
}: FilterChipPanelProps<T>) {
  const lastIndexRef = useRef<number | null>(null);
  const tone = FILTER_SECTION_TONES[sectionId];
  const total = chips.reduce((sum, chip) => sum + chip.total, 0);

  const handleChipClick = (id: T, e: React.MouseEvent) => {
    const { next, lastIndex } = applyFilterChipClick(selected, id, {
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      ordered,
      lastIndex: lastIndexRef.current,
    });
    lastIndexRef.current = lastIndex;
    onChange(next);
  };

  return (
    <div className={`flex flex-wrap gap-1 p-1.5 rounded-b-xl border-2 border-t-0 border-[#1F1917] ${tone.panel}`} data-testid={testId}>
      {selected.size > 0 ? (
        <button
          type="button"
          onClick={() => onChange(new Set())}
          className="min-h-[44px] px-3 text-[9px] font-mono font-bold underline cursor-pointer"
        >
          Clear
        </button>
      ) : null}
      <button
        type="button"
        data-active={isFilterShowingAll(selected, ordered)}
        data-testid={testId ? `${testId}-all` : undefined}
        onClick={() => onChange(selectAllFilterValues(ordered))}
        title="Show every item in this list"
        className={`inline-flex flex-col items-start gap-0.5 px-3 py-2 rounded-xl border-2 text-left transition-all cursor-pointer min-w-[5.5rem] min-h-[44px] ${
          isFilterShowingAll(selected, ordered)
            ? `${tone.selectedAll} shadow-sm`
            : 'border-black/10 bg-white/80 hover:border-black/25'
        }`}
      >
        <span className="text-[10px] font-black uppercase">All</span>
        <span className="text-[9px] font-mono font-bold tabular-nums text-[#3F3832]">{total}</span>
      </button>
      {chips.map((chip) => {
        const active = !isFilterShowingAll(selected, ordered) && selected.has(chip.id as T);
        return (
          <button
            key={chip.id}
            type="button"
            data-active={active}
            data-testid={testId ? `${testId}-${chip.id}` : undefined}
            onClick={(e) => handleChipClick(chip.id as T, e)}
            title={`${chip.label}: ${chip.done}/${chip.total} done · Click to multi-select`}
            className={`inline-flex flex-col items-start gap-0.5 px-3 py-2 rounded-xl border-2 text-left transition-all cursor-pointer min-w-[7rem] min-h-[44px] ${
              active
                ? `${tone.selected} shadow-sm`
                : 'border-black/10 bg-white/80 hover:border-black/25'
            }`}
          >
            <span
              className="flex items-center gap-1.5 text-[10px] font-black uppercase"
              style={chip.accent ? { color: chip.accent } : undefined}
            >
              {chip.accent ? (
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: chip.accent }} />
              ) : null}
              {chip.label}
            </span>
            <span className="text-[9px] font-mono font-bold tabular-nums text-[#3F3832]">
              {chip.done}/{chip.total}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface WorkBoardFilterPanelProps<TStatus extends string> {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  sprintChips: FilterChipCount[];
  statusChips: FilterChipCount[];
  priorityChips: FilterChipCount[];
  assigneeChips: FilterChipCount[];
  categoryChips: FilterChipCount[];
  sprintFilter: Set<string>;
  statusFilter: Set<TStatus>;
  priorityFilter: Set<string>;
  assigneeFilter: Set<string>;
  categoryFilter: Set<string>;
  dueFilter?: DueDateFilter;
  sprintOrdered: readonly string[];
  statusOrdered: readonly TStatus[];
  priorityOrdered: readonly string[];
  assigneeOrdered: readonly string[];
  categoryOrdered: readonly string[];
  onSprintChange: (next: Set<string>) => void;
  onStatusChange: (next: Set<TStatus>) => void;
  onPriorityChange: (next: Set<string>) => void;
  onAssigneeChange: (next: Set<string>) => void;
  onCategoryChange: (next: Set<string>) => void;
  onDueChange?: (next: DueDateFilter) => void;
  filteredCount: number;
  totalCount: number;
  testIdPrefix?: string;
}

function filterTabCount(selected: Set<string>, ordered: readonly string[], chips: FilterChipCount[]): number {
  const total = chips.reduce((sum, chip) => sum + chip.total, 0);
  return isFilterShowingAll(selected, ordered) ? total : selected.size;
}

export function WorkBoardFilterPanel<TStatus extends string>({
  search,
  onSearchChange,
  searchPlaceholder = 'Search title, category, sprint, assignee…',
  sprintChips,
  statusChips,
  priorityChips,
  assigneeChips,
  categoryChips,
  sprintFilter,
  statusFilter,
  priorityFilter,
  assigneeFilter,
  categoryFilter,
  dueFilter = 'all',
  sprintOrdered,
  statusOrdered,
  priorityOrdered,
  assigneeOrdered,
  categoryOrdered,
  onSprintChange,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onCategoryChange,
  onDueChange,
  filteredCount,
  totalCount,
  testIdPrefix = 'work-board',
}: WorkBoardFilterPanelProps<TStatus>) {
  const [activeTab, setActiveTab] = useState<FilterSectionId>(defaultFilterSectionTab);
  const hasFilters =
    sprintFilter.size > 0 ||
    statusFilter.size > 0 ||
    priorityFilter.size > 0 ||
    assigneeFilter.size > 0 ||
    categoryFilter.size > 0 ||
    dueFilter !== 'all' ||
    search.trim().length > 0;

  const clearAll = () => {
    onSearchChange('');
    onSprintChange(new Set());
    onStatusChange(new Set());
    onPriorityChange(new Set());
    onAssigneeChange(new Set());
    onCategoryChange(new Set());
    onDueChange?.('all');
  };

  const tabs: Array<{
    id: FilterSectionId;
    selected: Set<string>;
    ordered: readonly string[];
    chips: FilterChipCount[];
  }> = [
    { id: 'assignee', selected: assigneeFilter as Set<string>, ordered: assigneeOrdered, chips: assigneeChips },
    { id: 'sprint', selected: sprintFilter as Set<string>, ordered: sprintOrdered, chips: sprintChips },
    { id: 'priority', selected: priorityFilter as Set<string>, ordered: priorityOrdered, chips: priorityChips },
    { id: 'category', selected: categoryFilter as Set<string>, ordered: categoryOrdered, chips: categoryChips },
    { id: 'status', selected: statusFilter as Set<string>, ordered: statusOrdered, chips: statusChips },
  ];

  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0]!;

  return (
    <div
      className="bg-[#FAF8F5] border-2 border-[#1F1917] rounded-xl p-2.5 space-y-2"
      data-testid={`${testIdPrefix}-filters`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3F3832]" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-white border-2 border-[#C9A08C] rounded-xl pl-9 pr-9 py-2.5 text-xs font-bold focus:border-[#D9A892] focus:outline-none"
            data-testid={`${testIdPrefix}-search`}
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[#E5DFD3] cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5 text-[#3F3832]" />
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-black text-[#1F1917] tabular-nums">
            Showing {filteredCount}/{totalCount}
          </span>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-1.5 rounded-xl border-2 border-[#C9A08C] text-[#6B3A2C] text-[10px] font-black uppercase cursor-pointer hover:bg-[#F6EBE4]"
              data-testid={`${testIdPrefix}-clear-all`}
            >
              Clear all
            </button>
          ) : null}
        </div>
      </div>

      <p className="text-[9px] font-mono text-[#3F3832]">{FILTER_TABS_HINT}</p>

      <div>
        <div
          className="flex flex-wrap gap-0 border-b-2 border-[#E8DFD2]"
          role="tablist"
          aria-label="Work board filters"
        >
          {tabs.map((tab) => {
            const selected = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${testIdPrefix}-filter-panel-${tab.id}`}
                id={`${testIdPrefix}-filter-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={studioTabClass(selected)}
                data-testid={`${testIdPrefix}-${tab.id}-tab`}
              >
                {FILTER_SECTION_LABELS[tab.id]}
                <span className={studioTabMetaClass(selected)}>
                  {filterTabCount(tab.selected, tab.ordered, tab.chips)}
                </span>
              </button>
            );
          })}
        </div>
        <div
          role="tabpanel"
          id={`${testIdPrefix}-filter-panel-${active.id}`}
          aria-labelledby={`${testIdPrefix}-filter-tab-${active.id}`}
        >
          {active.id === 'status' ? (
            <FilterChipPanel
              sectionId="status"
              chips={statusChips}
              selected={statusFilter}
              ordered={statusOrdered}
              onChange={onStatusChange}
              testId={`${testIdPrefix}-status`}
            />
          ) : (
            <FilterChipPanel
              sectionId={active.id}
              chips={active.chips}
              selected={active.selected}
              ordered={active.ordered}
              onChange={
                active.id === 'assignee'
                  ? onAssigneeChange
                  : active.id === 'sprint'
                    ? onSprintChange
                    : active.id === 'priority'
                      ? onPriorityChange
                      : onCategoryChange
              }
              testId={`${testIdPrefix}-${active.id}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
