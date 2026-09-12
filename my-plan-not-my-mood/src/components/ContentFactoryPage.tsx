import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import type { AdminStudioTab } from '../lib/adminStudio';
import { BRAND_TAB_SUB_ROW_CLASS, brandTabClass } from '../lib/brandUi';
import {
  CF_ASSIGNEE_CHIPS,
  CF_ASSIGNEE_OPTIONS,
  CF_CHANNEL_LABELS,
  CF_CHANNEL_TONES,
  CF_CHANNELS,
  CF_KIND_LABELS,
  CF_KIND_TONES,
  CF_KINDS,
  CF_POP_BTN,
  CONTENT_FACTORY_EDITS_KEY,
  CONTENT_FACTORY_STATUS_KEY,
  PHASE_1_CONTENT_FACTORY,
  cfPostIsImageOnly,
  clearContentFactoryItemEdit,
  clearContentFactoryStatus,
  contentFactoryHasItemEdits,
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
import { isSprintLocked, ROLLOVER_NOTE_TEXT, ROLLOVER_STATUS_ID, ROLLOVER_STATUS_LABEL, sprintSectionTitle } from '../lib/sprintRollover';
import { RolledOverStatusBadge } from './WorkBoardExpandableRow';
import { ContentFactoryShell } from './ContentFactoryShell';

const CF_FIELD_CLASS =
  'w-full min-h-[44px] rounded-xl border-2 border-[#FDBA74] bg-white px-3 py-2 text-sm text-[#1F1917] focus:border-[#EA580C] focus:outline-none';
const CF_LABEL_CLASS = 'block text-[10px] font-black uppercase tracking-wider text-[#EA580C] mb-1';

function loadStatuses(): Record<string, TaskStatus> {
  try {
    const raw = localStorage.getItem(CONTENT_FACTORY_STATUS_KEY);
    return raw ? parseContentFactoryStatuses(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function loadEdits(): Record<string, ContentFactoryItemEdit> {
  try {
    const raw = localStorage.getItem(CONTENT_FACTORY_EDITS_KEY);
    return raw ? parseContentFactoryEdits(JSON.parse(raw)) : {};
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
  const [edits, setEdits] = useState<Record<string, ContentFactoryItemEdit>>(() => loadEdits());
  const [search, setSearch] = useState('');
  const [sprintFilter, setSprintFilter] = useState<Set<string>>(new Set());
  const [assigneeFilter, setAssigneeFilter] = useState<Set<string>>(new Set());
  const [channelFilter, setChannelFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [openSprints, setOpenSprints] = useState<Record<string, boolean>>({
    'Sprint 0': false,
    'Sprint 1': true,
    'Sprint 2': false,
    'Sprint 3': false,
    'Sprint 4': false,
  });
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem(CONTENT_FACTORY_STATUS_KEY, JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem(CONTENT_FACTORY_EDITS_KEY, JSON.stringify(edits));
  }, [edits]);

  const items = useMemo(
    () =>
      overlayContentFactoryEdits(
        overlayContentFactoryStatuses(PHASE_1_CONTENT_FACTORY, statuses),
        edits,
      ),
    [statuses, edits],
  );

  const updateField = (item: ContentFactoryItem, field: ContentFactoryEditField, value: string) => {
    const seed = PHASE_1_CONTENT_FACTORY.find((row) => row.id === item.id);
    if (!seed) return;
    setEdits((prev) => setContentFactoryItemField(prev, seed, field, value));
  };

  const resetItem = (id: string) => {
    setEdits((prev) => clearContentFactoryItemEdit(prev, id));
    setStatuses((prev) => clearContentFactoryStatus(prev, id));
  };
  const filtered = useMemo(
    () =>
      filterContentFactoryItems(items, {
        search,
        sprints: sprintFilter,
        assignees: assigneeFilter,
        channels: channelFilter,
        statuses: statusFilter,
      }),
    [items, search, sprintFilter, assigneeFilter, channelFilter, statusFilter],
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
            {CF_ASSIGNEE_OPTIONS.map((assignee) => {
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
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#EA580C] mb-2">Status</p>
          <div className={BRAND_TAB_SUB_ROW_CLASS} role="tablist" aria-label="Status" data-testid="cf-status-filters">
            {[...TASK_STATUSES, ROLLOVER_STATUS_ID].map((status) => {
              const active = statusFilter.has(status);
              const total =
                status === ROLLOVER_STATUS_ID
                  ? items.filter((row) => row.rolledOver).length
                  : items.filter((row) => row.status === status).length;
              return (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter((prev) => toggleSet(prev, status))}
                  className={brandTabClass(active)}
                  data-testid={`cf-status-${status}`}
                >
                  {status === ROLLOVER_STATUS_ID ? ROLLOVER_STATUS_LABEL : TASK_STATUS_LABELS[status]} {total}
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
                    {sprintSectionTitle(sprint)}
                    {isSprintLocked(sprint) ? (
                      <span className="ml-2 font-mono font-bold normal-case tracking-normal opacity-80">Closed</span>
                    ) : null}
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
                        CF_ASSIGNEE_CHIPS[row.assignee] ?? 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]';
                      const hasEdits = contentFactoryHasItemEdits(edits, row.id) || Boolean(statuses[row.id]);
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
                                {row.rolledOver ? <RolledOverStatusBadge testId={`cf-rolled-over-${row.id}`} /> : null}
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
                              value={row.assignee}
                              aria-label={`${row.title} assignee`}
                              data-testid={`cf-item-assignee-${row.id}`}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) => updateField(row, 'assignee', event.target.value)}
                              className={`min-h-[44px] rounded-xl border-2 px-2 text-[10px] font-black uppercase cursor-pointer ${assigneeChip}`}
                            >
                              {CF_ASSIGNEE_OPTIONS.map((assignee) => (
                                <option key={assignee} value={assignee}>
                                  {ASSIGNEE_LABELS[assignee]}
                                </option>
                              ))}
                            </select>
                            <select
                              value={row.status}
                              aria-label={`${row.title} status`}
                              data-testid={`cf-item-status-${row.id}`}
                              onClick={(event) => event.stopPropagation()}
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
                            <div
                              className="border-t border-[#FED7AA] bg-[#FFF7ED] px-3 py-3 space-y-3 text-sm text-[#9A3412]"
                              data-testid={`cf-item-editor-${row.id}`}
                            >
                              {row.note ? (
                                <p
                                  className="rounded-xl border-2 border-[#FDBA74] bg-[#FFEDD5] px-3 py-2 text-xs font-black uppercase tracking-wide text-[#C2410C]"
                                  data-testid={`cf-item-note-${row.id}`}
                                >
                                  {row.note || ROLLOVER_NOTE_TEXT}
                                </p>
                              ) : null}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label className="sm:col-span-2">
                                  <span className={CF_LABEL_CLASS}>Title</span>
                                  <input
                                    type="text"
                                    value={row.title}
                                    onChange={(event) => updateField(row, 'title', event.target.value)}
                                    className={CF_FIELD_CLASS}
                                    data-testid={`cf-item-title-${row.id}`}
                                  />
                                </label>
                                <label>
                                  <span className={CF_LABEL_CLASS}>Date</span>
                                  <input
                                    type="date"
                                    value={row.dateIso}
                                    onChange={(event) => updateField(row, 'dateIso', event.target.value)}
                                    className={CF_FIELD_CLASS}
                                    data-testid={`cf-item-date-${row.id}`}
                                  />
                                </label>
                                <label>
                                  <span className={CF_LABEL_CLASS}>Post time</span>
                                  <input
                                    type="text"
                                    value={row.postTime}
                                    onChange={(event) => updateField(row, 'postTime', event.target.value)}
                                    className={CF_FIELD_CLASS}
                                    data-testid={`cf-item-time-${row.id}`}
                                  />
                                </label>
                                <label>
                                  <span className={CF_LABEL_CLASS}>Channel</span>
                                  <select
                                    value={row.channel}
                                    onChange={(event) => updateField(row, 'channel', event.target.value)}
                                    className={CF_FIELD_CLASS}
                                    data-testid={`cf-item-channel-${row.id}`}
                                  >
                                    {CF_CHANNELS.map((channel) => (
                                      <option key={channel} value={channel}>
                                        {CF_CHANNEL_LABELS[channel]}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label>
                                  <span className={CF_LABEL_CLASS}>Kind</span>
                                  <select
                                    value={row.kind}
                                    onChange={(event) => updateField(row, 'kind', event.target.value)}
                                    className={CF_FIELD_CLASS}
                                    data-testid={`cf-item-kind-${row.id}`}
                                  >
                                    {CF_KINDS.map((kind) => (
                                      <option key={kind} value={kind}>
                                        {CF_KIND_LABELS[kind]}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label>
                                  <span className={CF_LABEL_CLASS}>Linked task</span>
                                  <input
                                    type="text"
                                    value={row.taskId ?? ''}
                                    onChange={(event) => updateField(row, 'taskId', event.target.value)}
                                    placeholder="t-74"
                                    className={CF_FIELD_CLASS}
                                    data-testid={`cf-item-taskid-${row.id}`}
                                  />
                                </label>
                                <label>
                                  <span className={CF_LABEL_CLASS}>Image URL</span>
                                  <input
                                    type="text"
                                    value={row.visualSrc ?? ''}
                                    onChange={(event) => updateField(row, 'visualSrc', event.target.value)}
                                    className={CF_FIELD_CLASS}
                                    data-testid={`cf-item-visualsrc-${row.id}`}
                                  />
                                </label>
                                <label className="sm:col-span-2">
                                  <span className={CF_LABEL_CLASS}>Copy</span>
                                  <textarea
                                    value={row.copy}
                                    onChange={(event) => updateField(row, 'copy', event.target.value)}
                                    rows={4}
                                    className={`${CF_FIELD_CLASS} min-h-[6rem]`}
                                    data-testid={`cf-item-copy-${row.id}`}
                                  />
                                </label>
                                <label className="sm:col-span-2">
                                  <span className={CF_LABEL_CLASS}>Visual direction</span>
                                  <textarea
                                    value={row.visualPrompt}
                                    onChange={(event) => updateField(row, 'visualPrompt', event.target.value)}
                                    rows={3}
                                    className={`${CF_FIELD_CLASS} min-h-[5rem]`}
                                    data-testid={`cf-item-visual-${row.id}`}
                                  />
                                </label>
                                <label className="sm:col-span-2">
                                  <span className={CF_LABEL_CLASS}>Image prompt</span>
                                  <textarea
                                    value={row.imagePrompt}
                                    onChange={(event) => updateField(row, 'imagePrompt', event.target.value)}
                                    rows={3}
                                    className={`${CF_FIELD_CLASS} min-h-[5rem]`}
                                    data-testid={`cf-item-image-${row.id}`}
                                  />
                                </label>
                                <label className="sm:col-span-2">
                                  <span className={CF_LABEL_CLASS}>Video prompt</span>
                                  <textarea
                                    value={row.videoPrompt ?? ''}
                                    onChange={(event) => updateField(row, 'videoPrompt', event.target.value)}
                                    rows={3}
                                    placeholder="Leave blank for image only"
                                    className={`${CF_FIELD_CLASS} min-h-[5rem]`}
                                    data-testid={`cf-item-video-${row.id}`}
                                  />
                                </label>
                                <label className="sm:col-span-2">
                                  <span className={CF_LABEL_CLASS}>Assets</span>
                                  <input
                                    type="text"
                                    value={row.assetHint}
                                    onChange={(event) => updateField(row, 'assetHint', event.target.value)}
                                    className={CF_FIELD_CLASS}
                                    data-testid={`cf-item-assets-${row.id}`}
                                  />
                                </label>
                              </div>
                              {row.visualSrc ? (
                                <img
                                  src={row.visualSrc}
                                  alt=""
                                  className="w-full max-w-sm h-48 object-cover object-center rounded-xl border-2 border-[#1F1917]"
                                />
                              ) : null}
                              <div className="flex flex-wrap gap-2">
                                {hasEdits ? (
                                  <button
                                    type="button"
                                    onClick={() => resetItem(row.id)}
                                    className="min-h-[44px] px-3.5 rounded-xl border-2 border-[#FDBA74] bg-white text-[#9A3412] text-[11px] font-black uppercase tracking-wide cursor-pointer"
                                    data-testid={`cf-item-reset-${row.id}`}
                                  >
                                    Reset to plan
                                  </button>
                                ) : null}
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
