import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import type { AdminStudioTab } from '../lib/adminStudio';
import { BRAND_TAB_SUB_ROW_CLASS, brandTabClass } from '../lib/brandUi';
import {
  CF_ASSIGNEE_CHIPS,
  CF_CHANNEL_LABELS,
  CF_CHANNEL_TONES,
  CF_CHANNELS,
  CF_KIND_LABELS,
  CF_KIND_TONES,
  CF_POP_BTN,
  CONTENT_FACTORY_EDITS_KEY,
  CONTENT_FACTORY_STATUS_KEY,
  PHASE_1_CONTENT_FACTORY,
  cfPostIsImageOnly,
  clearContentFactoryItemEdit,
  contentFactoryLinkedTask,
  filterContentFactoryItems,
  formatCfDueChip,
  formatCfWhen,
  formatContentFactoryCode,
  groupContentFactoryByChannel,
  groupContentFactoryBySprint,
  overlayContentFactoryEdits,
  overlayContentFactoryStatuses,
  parseContentFactoryEdits,
  parseContentFactoryStatuses,
  setContentFactoryItemField,
  setContentFactoryStatus,
  type ContentFactoryEditField,
  type ContentFactoryItem,
  type ContentFactoryItemEdit,
} from '../lib/contentFactory';
import {
  ASSIGNEE_LABELS,
  SPRINT_OPTIONS,
  SPRINT_SECTION_TONES,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_STATUS_TONES,
  isWorkDueDatePast,
  sprintTextClass,
  type TaskStatus,
} from '../lib/workBoard';
import { sprintDatesForLabel } from '../lib/sprintCalendar';
import { ContentFactoryShell } from './ContentFactoryShell';

function loadStatuses(): Record<string, TaskStatus> {
  try {
    const raw = localStorage.getItem(CONTENT_FACTORY_STATUS_KEY);
    return raw ? parseContentFactoryStatuses(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function toggleSet(current: Set<string>, id: string): Set<string> {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export const ContentFactoryPage: React.FC<{
  onOpenTab: (tab: AdminStudioTab) => void;
}> = ({ onOpenTab }) => {
  const [statuses, setStatuses] = useState<Record<string, TaskStatus>>(() => loadStatuses());
  const [search, setSearch] = useState('');
  const [sprintFilter, setSprintFilter] = useState<Set<string>>(new Set());
  const [assigneeFilter, setAssigneeFilter] = useState<Set<string>>(new Set());
  const [channelFilter, setChannelFilter] = useState<Set<string>>(new Set());
  const [openSprints, setOpenSprints] = useState<Record<string, boolean>>({
    'Sprint 0': true,
    'Sprint 1': true,
    'Sprint 2': false,
    'Sprint 3': false,
    'Sprint 4': false,
  });
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem(CONTENT_FACTORY_STATUS_KEY, JSON.stringify(statuses));
  }, [statuses]);

  const items = useMemo(
    () => overlayContentFactoryStatuses(PHASE_1_CONTENT_FACTORY, statuses),
    [statuses],
  );
  const filtered = useMemo(
    () =>
      filterContentFactoryItems(items, {
        search,
        sprints: sprintFilter,
        assignees: assigneeFilter,
        channels: channelFilter,
      }),
    [items, search, sprintFilter, assigneeFilter, channelFilter],
  );
  const grouped = useMemo(() => groupContentFactoryBySprint(filtered), [filtered]);

  return (
    <ContentFactoryShell active="factory" onOpenTab={onOpenTab}>
      <div
        className="bg-gradient-to-br from-[#FFFCF7] to-[#FFF7ED] border-2 border-[#FDBA74] rounded-2xl p-4 sm:p-5 space-y-4 shadow-[0_8px_24px_rgba(251,146,60,0.12)]"
        data-testid="content-factory-filters"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EA580C]" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search copy, sprint, assignee, channel…"
            className="w-full min-h-[44px] bg-white border-2 border-[#FDBA74] rounded-xl pl-9 pr-9 py-2.5 text-xs font-bold focus:border-[#EA580C] focus:outline-none"
            data-testid="content-factory-search"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer text-[#EA580C]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
        <p className="text-xs font-mono font-black text-[#C2410C] tabular-nums">
          Showing {filtered.length}/{items.length}
        </p>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#EA580C] mb-2">Sprint</p>
          <div className={BRAND_TAB_SUB_ROW_CLASS} role="tablist" aria-label="Sprint">
            {SPRINT_OPTIONS.map((sprint) => {
              const active = sprintFilter.has(sprint);
              const total = items.filter((row) => row.sprint === sprint).length;
              return (
                <button
                  key={sprint}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSprintFilter((prev) => toggleSet(prev, sprint))}
                  className={`${brandTabClass(active)} ${active ? '' : sprintTextClass(sprint)}`}
                >
                  {sprint} {total}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#EA580C] mb-2">Assignee</p>
          <div className={BRAND_TAB_SUB_ROW_CLASS} role="tablist" aria-label="Assignee">
            {(['angela', 'evelyn'] as const).map((assignee) => {
              const active = assigneeFilter.has(assignee);
              const total = items.filter((row) => row.assignee === assignee).length;
              return (
                <button
                  key={assignee}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setAssigneeFilter((prev) => toggleSet(prev, assignee))}
                  className={brandTabClass(active)}
                  data-testid={`cf-assignee-${assignee}`}
                >
                  {ASSIGNEE_LABELS[assignee]} {total}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#EA580C] mb-2">Channel</p>
          <div className={BRAND_TAB_SUB_ROW_CLASS} role="tablist" aria-label="Channel" data-testid="cf-channel-filters">
            {CF_CHANNELS.map((channel) => {
              const active = channelFilter.has(channel);
              const total = items.filter((row) => row.channel === channel).length;
              return (
                <button
                  key={channel}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setChannelFilter((prev) => toggleSet(prev, channel))}
                  className={brandTabClass(active)}
                  data-testid={`cf-channel-${channel}`}
                >
                  {CF_CHANNEL_LABELS[channel]} {total}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3" data-testid="content-factory-sprints">
        {SPRINT_OPTIONS.map((sprint) => {
          const sectionItems = grouped[sprint];
          if (sectionItems.length === 0) return null;
          const byChannel = groupContentFactoryByChannel(sectionItems);
          const isOpen = openSprints[sprint];
          const tone = SPRINT_SECTION_TONES[sprint];
          const done = sectionItems.filter((row) => row.status === 'done').length;
          const dates = sprintDatesForLabel(sprint);
          return (
            <section
              key={sprint}
              className={`rounded-2xl border-2 overflow-hidden shadow-[0_8px_20px_rgba(194,65,12,0.08)] ${tone.header.split(' ').find((c) => c.startsWith('border-')) ?? 'border-[#FDBA74]'}`}
              data-testid={`cf-sprint-${sprint.replace(' ', '-').toLowerCase()}`}
            >
              <button
                type="button"
                onClick={() => setOpenSprints((prev) => ({ ...prev, [sprint]: !prev[sprint] }))}
                aria-expanded={isOpen}
                className={`w-full min-h-[52px] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-left cursor-pointer ${tone.header}`}
              >
                <span className={`inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide min-w-0 ${tone.ink}`}>
                  {isOpen ? <ChevronDown className="w-5 h-5 shrink-0" /> : <ChevronRight className="w-5 h-5 shrink-0" />}
                  <span className="min-w-0">
                    {sprint}
                    {dates ? (
                      <span className={`ml-2 font-mono font-bold normal-case tracking-normal ${tone.ink}`}>
                        {dates}
                      </span>
                    ) : null}
                  </span>
                </span>
                <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg ${tone.chip}`}>
                  {done}/{sectionItems.length} done
                </span>
              </button>
              {isOpen && (
                <div className={`p-3 space-y-3 ${tone.panel}`}>
                  {sectionItems.length === 0 ? (
                    <p className="text-sm text-[#9A3412] py-2">No items match the current filters.</p>
                  ) : (
                    CF_CHANNELS.map((channel) => {
                      const channelItems = byChannel[channel];
                      if (channelItems.length === 0) return null;
                      return (
                        <div
                          key={channel}
                          className="space-y-2 rounded-xl border border-[#FED7AA] bg-white/70 p-2.5"
                          data-testid={`cf-sprint-${sprint.replace(' ', '-').toLowerCase()}-channel-${channel}`}
                        >
                          <div className="flex items-center justify-between gap-2 px-1">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${CF_CHANNEL_TONES[channel]}`}>
                              {CF_CHANNEL_LABELS[channel]}
                            </span>
                            <span className="text-[10px] font-mono font-black uppercase text-[#9A3412]">
                              {channelItems.filter((row) => row.status === 'done').length}/{channelItems.length}
                            </span>
                          </div>
                          {channelItems.map((row: ContentFactoryItem) => {
                      const expanded = Boolean(openRows[row.id]);
                      const kindTone = CF_KIND_TONES[row.kind];
                      const assigneeChip =
                        row.assignee === 'angela' || row.assignee === 'evelyn'
                          ? CF_ASSIGNEE_CHIPS[row.assignee]
                          : 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]';
                      const linkedTask = contentFactoryLinkedTask(row.taskId);
                      const duePast = isWorkDueDatePast(row.dateIso) && row.status !== 'done';
                      return (
                        <article
                          key={row.id}
                          className={`rounded-xl border border-[#FED7AA] bg-white shadow-[0_4px_12px_rgba(234,88,12,0.08)] overflow-hidden ${kindTone.bar}`}
                          data-testid={`cf-item-${row.id}`}
                        >
                          <div
                            className="flex flex-wrap items-center gap-2 px-3 py-2.5 bg-[#FFEDD5] border-b-2 border-[#FDBA74]"
                            data-testid={`cf-item-header-${row.id}`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenRows((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                              }
                              aria-expanded={expanded}
                              aria-label={expanded ? `Collapse ${row.title}` : `Expand ${row.title}`}
                              className="flex-1 min-h-[44px] min-w-[12rem] text-left cursor-pointer inline-flex items-start gap-2"
                            >
                              {expanded ? (
                                <ChevronDown className="w-5 h-5 mt-1 shrink-0 text-[#EA580C]" aria-hidden />
                              ) : (
                                <ChevronRight className="w-5 h-5 mt-1 shrink-0 text-[#EA580C]" aria-hidden />
                              )}
                              <span className="min-w-0 flex-1">
                              <p
                                className="inline-flex max-w-full flex-wrap items-baseline gap-x-1.5 rounded-md bg-[#EA580C] px-2 py-1 text-xs sm:text-sm font-black text-white leading-snug whitespace-normal break-words shadow-[0_2px_0_#C2410C]"
                                data-testid={`cf-item-headline-${row.id}`}
                              >
                                <span className="font-mono uppercase tracking-wide">
                                  {formatContentFactoryCode(row.id)}
                                </span>
                                <span aria-hidden>·</span>
                                <span className="normal-case tracking-normal">{row.title}</span>
                                <span aria-hidden>·</span>
                                <span className="font-mono uppercase tracking-wide">{formatCfWhen(row)}</span>
                              </p>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                <span
                                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border min-h-[44px] inline-flex items-center ${
                                    duePast
                                      ? 'bg-[#E4B8A4] text-[#5C3328] border-[#C9A08C]'
                                      : 'bg-white text-[#1F1917] border-[#E5DFD3]'
                                  }`}
                                  data-testid={`cf-item-due-${row.id}`}
                                >
                                  {formatCfDueChip(row)}
                                </span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${kindTone.chip}`}>
                                  {CF_KIND_LABELS[row.kind]}
                                </span>
                                {row.kind === 'post' ? (
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                                    cfPostIsImageOnly(row) ? 'bg-[#F5F3FF] text-[#6D28D9] border-[#C4B5FD]' : 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]'
                                  }`}>
                                    {cfPostIsImageOnly(row) ? 'Image only' : 'Video + image'}
                                  </span>
                                ) : null}
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${CF_CHANNEL_TONES[row.channel]}`}>
                                  {CF_CHANNEL_LABELS[row.channel]}
                                </span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${assigneeChip}`}>
                                  {ASSIGNEE_LABELS[row.assignee]}
                                </span>
                              </div>
                              </span>
                            </button>
                            {linkedTask ? (
                              <button
                                type="button"
                                onClick={() => {
                                  window.history.pushState({}, '', `/admin/tasks#${linkedTask.id}`);
                                  onOpenTab('tasks');
                                }}
                                className="min-h-[44px] px-3 rounded-xl border-2 border-[#C4B5FD] bg-[#F5F3FF] text-[#6D28D9] text-[10px] font-black uppercase tracking-wide inline-flex items-center gap-1.5 cursor-pointer"
                                data-testid={`cf-item-task-${row.id}`}
                                aria-label={`Open ${linkedTask.code} ${linkedTask.title}`}
                              >
                                <span className="font-mono">{linkedTask.code}</span>
                                <span className="normal-case font-semibold tracking-normal max-w-[10rem] truncate">
                                  {linkedTask.title}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                              </button>
                            ) : null}
                            <select
                              value={row.status}
                              aria-label={`${row.title} status`}
                              onChange={(event) =>
                                setStatuses((prev) =>
                                  setContentFactoryStatus(prev, row.id, event.target.value as TaskStatus),
                                )
                              }
                              className={`min-h-[44px] rounded-xl border-2 px-2 text-[10px] font-black uppercase cursor-pointer ${TASK_STATUS_TONES[row.status]}`}
                            >
                              {TASK_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {TASK_STATUS_LABELS[status]}
                                </option>
                              ))}
                            </select>
                          </div>
                          {expanded && (
                            <div className="border-t border-[#FED7AA] bg-[#FFF7ED] px-3 py-3 space-y-2 text-sm text-[#9A3412]">
                              <p>
                                <span className="font-black uppercase text-[10px] text-[#EA580C]">Copy · </span>
                                {row.copy}
                              </p>
                              <p>
                                <span className="font-black uppercase text-[10px] text-[#EA580C]">Image prompt · </span>
                                {row.imagePrompt}
                              </p>
                              {row.videoPrompt ? (
                                <p>
                                  <span className="font-black uppercase text-[10px] text-[#EA580C]">Video prompt · </span>
                                  {row.videoPrompt}
                                </p>
                              ) : (
                                <p>
                                  <span className="font-black uppercase text-[10px] text-[#EA580C]">Video · </span>
                                  Image only — still post, no clip.
                                </p>
                              )}
                              {row.visualSrc ? (
                                <img
                                  src={row.visualSrc}
                                  alt=""
                                  className="w-full max-w-sm h-48 object-cover object-center rounded-xl border-2 border-[#1F1917]"
                                />
                              ) : null}
                              <p>
                                <span className="font-black uppercase text-[10px] text-[#EA580C]">Assets · </span>
                                {row.assetHint}
                              </p>
                              {row.kind === 'gear' && (
                                <button
                                  type="button"
                                  onClick={() => onOpenTab('gear-selections')}
                                  className={CF_POP_BTN}
                                >
                                  Open Gear
                                </button>
                              )}
                              {row.kind === 'prep' && (
                                <button
                                  type="button"
                                  onClick={() => onOpenTab('asset-library')}
                                  className={CF_POP_BTN}
                                >
                                  Open Asset Library
                                </button>
                              )}
                              {row.kind === 'logo' && (
                                <button
                                  type="button"
                                  onClick={() => onOpenTab('logo-concepts')}
                                  className={CF_POP_BTN}
                                >
                                  Open Logos
                                </button>
                              )}
                            </div>
                          )}
                        </article>
                      );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </ContentFactoryShell>
  );
};
