import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  SPRINT_OPTIONS,
  SPRINT_SECTION_TONES,
  defaultOpenSprintSections,
  groupAndSortItemsBySprint,
  formatRolledOverCount,
  sprintSectionStats,
  toggleSprintSection,
  type SprintCategory,
  type WorkBoardSort,
} from '../lib/workBoard';
import { sprintDatesForLabel } from '../lib/sprintCalendar';
import { isSprintLocked, sprintSectionTitle } from '../lib/sprintRollover';
import { WorkBoardSaveAllButton } from './WorkBoardExpandableRow';

export function WorkBoardSprintSections<T extends { id: string; title: string; sprint: SprintCategory; status: string; assignee: string; dueDate?: string; priority?: string }>({
  items,
  openSections,
  onToggleSection,
  isDone,
  selectedIds,
  onToggleSelected,
  onToggleSectionSelected,
  bulkBar,
  renderItem,
  hideEmptySections = false,
  saveAll,
  columnBar,
  sort = { key: 'status', dir: 'asc' },
}: {
  items: T[];
  openSections: Record<SprintCategory, boolean>;
  onToggleSection: (sprint: SprintCategory) => void;
  isDone: (item: T) => boolean;
  selectedIds: Set<string>;
  onToggleSelected: (id: string) => void;
  onToggleSectionSelected: (ids: string[], selectAll: boolean) => void;
  bulkBar: (sectionIds: string[]) => React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
  hideEmptySections?: boolean;
  saveAll?: {
    onSave: () => void;
    saving?: boolean;
    enabled?: boolean;
  };
  columnBar?: React.ReactNode;
  sort?: WorkBoardSort;
}) {
  const grouped = groupAndSortItemsBySprint(items, sort);
  const stats = sprintSectionStats(items, isDone);

  return (
    <div className="space-y-0" data-testid="work-board-sprint-sections">
      {saveAll ? (
        <div className="flex items-center gap-1 px-1 min-h-7" data-testid="work-board-save-all-row">
          <div className="w-4 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1" />
          <WorkBoardSaveAllButton
            onSave={saveAll.onSave}
            saving={saveAll.saving}
            enabled={saveAll.enabled}
          />
          <div className="w-7 shrink-0" aria-hidden />
        </div>
      ) : null}
      {columnBar}
      {SPRINT_OPTIONS.map((sprint) => {
        const sectionItems = grouped[sprint];
        if (hideEmptySections && sectionItems.length === 0) return null;
        const stat = stats.find((s) => s.sprint === sprint);
        const dates = sprintDatesForLabel(sprint);
        const isOpen = openSections[sprint];
        const tone = SPRINT_SECTION_TONES[sprint];
        const sectionIds = sectionItems.map((item) => item.id);
        const selectedInSection = sectionIds.filter((id) => selectedIds.has(id));
        const allSelected = sectionIds.length > 0 && selectedInSection.length === sectionIds.length;

        return (
          <section
            key={sprint}
            className="rounded-2xl border-2 border-[#1F1917] overflow-hidden"
            data-testid={`sprint-section-${sprint.replace(' ', '-').toLowerCase()}`}
          >
            <button
              type="button"
              onClick={() => onToggleSection(sprint)}
              aria-expanded={isOpen}
              className={`w-full min-h-[44px] px-3 py-1.5 flex flex-wrap items-center justify-between gap-1.5 text-left cursor-pointer ${tone.header}`}
            >
              <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans font-black uppercase tracking-wide min-w-0 ${tone.ink}`}>
                {isOpen ? <ChevronDown className="w-5 h-5 shrink-0" /> : <ChevronRight className="w-5 h-5 shrink-0" />}
                <span className="min-w-0">
                  {sprintSectionTitle(sprint)}
                  {dates ? (
                    <span className={`ml-2 font-mono font-bold normal-case tracking-normal ${tone.ink}`}>
                      {dates}
                    </span>
                  ) : null}
                  {isSprintLocked(sprint) ? (
                    <span className="ml-2 font-mono font-bold normal-case tracking-normal opacity-80">Closed</span>
                  ) : null}
                </span>
              </span>
              <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg ${tone.chip}`}>
                {stat?.done ?? 0}/{stat?.total ?? 0} done · {stat?.percent ?? 0}%
                {(stat?.blocked ?? 0) > 0 ? ` · ${stat?.blocked} blocked` : ''}
                {(stat?.rolledOver ?? 0) > 0 ? ` · ${formatRolledOverCount(stat?.rolledOver ?? 0)}` : ''}
              </span>
            </button>
            {isOpen && (
              <div className={`${tone.panel}`}>
                {sectionItems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 px-2 border-b border-[#1F1917]/10">
                    <label className="inline-flex items-center gap-2 text-[10px] font-mono font-black uppercase text-[#1F1917] min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => onToggleSectionSelected(sectionIds, !allSelected)}
                        className="w-4 h-4 accent-[#D9A892]"
                      />
                      Select all in {sprint}
                    </label>
                    {selectedInSection.length > 0 && (
                      <span className="text-[10px] font-mono font-bold text-[#6B3A2C]">
                        {selectedInSection.length} selected
                      </span>
                    )}
                    {bulkBar(selectedInSection.length ? selectedInSection : sectionIds)}
                  </div>
                )}
                {sectionItems.length === 0 ? (
                  <p className="text-xs text-[#3F3832] font-medium px-2 py-2">No items in this sprint.</p>
                ) : (
                  <div className="divide-y divide-[#E8DFD2]" data-testid="work-board-list">
                    {sectionItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-1 px-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => onToggleSelected(item.id)}
                          className="w-4 h-4 accent-[#D9A892] shrink-0"
                          aria-label={`Select ${item.id}`}
                        />
                        <div className="min-w-0 flex-1">{renderItem(item)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function useSprintSectionState(initial: Record<SprintCategory, boolean>) {
  const [openSections, setOpenSections] = React.useState(initial);
  const toggleSection = (sprint: SprintCategory) => {
    setOpenSections((prev) => toggleSprintSection(prev, sprint));
  };
  const expandAll = React.useCallback(() => {
    setOpenSections(defaultOpenSprintSections());
  }, []);
  return { openSections, toggleSection, expandAll };
}
