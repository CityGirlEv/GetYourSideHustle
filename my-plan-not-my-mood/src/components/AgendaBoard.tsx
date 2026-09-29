import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Download, Eye, FileText, Forward, GripVertical, History, Mail, Maximize2, Play, Plus, Save, Square, Trash2, X, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import {
  agendaFileSlug,
  buildAgendaDocumentHtml,
  buildAgendaExcelHtml,
} from '../lib/agendaDocuments';
import {
  AGENDA_DRAG_HINT,
  AGENDA_STORAGE_KEY,
  addCustomAgendaItem,
  agendaBoardTabs,
  agendaDetailFieldLabel,
  agendaDetailFieldValue,
  agendaProgress,
  agendaStageLabel,
  canFacilitateAgenda,
  canMutateAgendaItem,
  canRemoveAgendaItem,
  defaultMeetingIdForAgendaTab,
  deferAgendaItem,
  agendaItemRemainingSeconds,
  formatAgendaDuration,
  formatAgendaTimer,
  isAgendaItemDirty,
  isPreviousAgendaMenu,
  itemsForMeeting,
  startAgendaItem,
  stopAgendaItem,
  kickoffAgendaMeeting,
  listAgendaMeetings,
  loadAgendaState,
  MEETING_SCHEDULE_LABEL,
  mergeAgendaStateMaps,
  meetingsForAgendaTab,
  OVERALL_MEETING_SCHEDULE_LABEL,
  isScheduledAgendaMeeting,
  nextAgendaMeeting,
  splitAgendaMeetings,
  moveAgendaItem,
  parseAgendaStage,
  placeAgendaItem,
  removeAgendaItem,
  saveFinalAgenda,
  setAllAgendaItemsOpen,
  totalAgendaMinutes,
  updateAgendaItem,
  updateAgendaItemMinutes,
  toggleAgendaItemOpen,
  WORKING_AGENDA_ID,
  writeMeetingItems,
  workingAgendaTitle,
  type AgendaActor,
  type AgendaAttendee,
  type AgendaBoardTab,
  type AgendaDetailField,
  type AgendaItem,
  type AgendaStage,
  type AgendaStateMap,
} from '../lib/sprintAgenda';
import {
  DEFAULT_KICKOFF_ATTENDEES,
  KICKOFF_AGENDA_ID,
  KICKOFF_MEETING_TITLE,
  KICKOFF_MEETING_TOPIC,
  addAgendaAttendee,
  draftKickoffFromWork,
  kickoffMailto,
  removeAgendaAttendee,
} from '../lib/kickoffAgenda';
import { parseAgendaMeetingParam, seedSavedKickoffIfMissing } from '../lib/savedMeetings';
import { AGENDA_META_STORAGE_KEY, buildAgendaStorePayload, fetchAgendaStore, saveAgendaStore } from '../lib/agendaStore';
import { BRAND_TAB_ROW_CLASS, brandTabClass } from '../lib/brandUi';
import type { TaskItem } from '../lib/workBoard';

const META_KEY = AGENDA_META_STORAGE_KEY;

interface AgendaMeta {
  title: string;
  topic: string;
  attendees: AgendaAttendee[];
  stage: AgendaStage;
}

type AgendaView = 'edit' | 'word' | 'excel' | 'pdf';
type AgendaItemDraft = Pick<AgendaItem, 'label' | 'minutes' | 'notes' | 'actionItems'>;

function loadMeta(): AgendaMeta {
  if (typeof window === 'undefined') {
    return {
      title: KICKOFF_MEETING_TITLE,
      topic: KICKOFF_MEETING_TOPIC,
      attendees: DEFAULT_KICKOFF_ATTENDEES,
      stage: 'draft',
    };
  }
  try {
    const parsed = JSON.parse(localStorage.getItem(META_KEY) || 'null');
    if (parsed && typeof parsed === 'object') {
      return {
        title: parsed.title || KICKOFF_MEETING_TITLE,
        topic: parsed.topic || KICKOFF_MEETING_TOPIC,
        attendees: Array.isArray(parsed.attendees) && parsed.attendees.length
          ? parsed.attendees
          : DEFAULT_KICKOFF_ATTENDEES,
        stage: parseAgendaStage(parsed.stage),
      };
    }
  } catch {
    /* use defaults */
  }
  return {
    title: KICKOFF_MEETING_TITLE,
    topic: KICKOFF_MEETING_TOPIC,
    attendees: DEFAULT_KICKOFF_ATTENDEES,
    stage: 'draft',
  };
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob(['\ufeff', content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function openPrintWindow(html: string, autoPrint: boolean) {
  const win = window.open('', '_blank', 'width=1280,height=920');
  if (!win) return null;
  win.document.write(html);
  win.document.close();
  if (autoPrint) win.setTimeout(() => win.print(), 400);
  return win;
}

export const AgendaBoard: React.FC<{ tasks?: TaskItem[]; actor?: AgendaActor | null }> = ({
  tasks = [],
  actor = null,
}) => {
  const meetings = useMemo(() => listAgendaMeetings(), []);
  const [state, setState] = useState<AgendaStateMap>(() => {
    if (typeof window === 'undefined') return {};
    const loaded = seedSavedKickoffIfMissing(loadAgendaState(localStorage.getItem(AGENDA_STORAGE_KEY)));
    if (!loaded[KICKOFF_AGENDA_ID]) {
      return writeMeetingItems(loaded, KICKOFF_AGENDA_ID, draftKickoffFromWork(tasks));
    }
    return loaded;
  });
  const [meetingId, setMeetingId] = useState(() =>
    parseAgendaMeetingParam(
      typeof window !== 'undefined' ? window.location.search : '',
      listAgendaMeetings().map((item) => item.id),
    ),
  );
  const [boardTab, setBoardTab] = useState<AgendaBoardTab>(() => {
    const selected = listAgendaMeetings().find((item) => item.id === meetingId);
    return selected && isPreviousAgendaMenu(selected) ? 'previous-menus' : 'agenda';
  });
  const [meta, setMeta] = useState<AgendaMeta>(loadMeta);
  const [newTopic, setNewTopic] = useState('');
  const [newMinutes, setNewMinutes] = useState(10);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [view, setView] = useState<AgendaView>('edit');
  const [configureOpen, setConfigureOpen] = useState(true);
  const tabMeetings = useMemo(
    () => meetingsForAgendaTab(meetings, boardTab),
    [meetings, boardTab],
  );
  const { current: currentMeetings, scheduled: scheduledMeetings } = useMemo(
    () => splitAgendaMeetings(tabMeetings),
    [tabMeetings],
  );
  const selectBoardTab = (tab: AgendaBoardTab) => {
    setBoardTab(tab);
    const visible = meetingsForAgendaTab(meetings, tab);
    if (!visible.some((item) => item.id === meetingId)) {
      setMeetingId(defaultMeetingIdForAgendaTab(tab));
    }
  };
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, AgendaItemDraft>>({});
  const [persistNotice, setPersistNotice] = useState<string | null>(null);
  const [dragHint, setDragHint] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [detailPopup, setDetailPopup] = useState<{ itemId: string; field: AgendaDetailField } | null>(null);

  const meeting = meetings.find((item) => item.id === meetingId) ?? kickoffAgendaMeeting();
  const nextMeeting = nextAgendaMeeting(meetings, meeting.id);
  const items = itemsForMeeting(state, meeting);
  const progress = agendaProgress(items);
  const minutes = totalAgendaMinutes(items);
  const titledMeeting = { ...meeting, title: meta.title || meeting.title };
  const model = { meeting: titledMeeting, items };
  const documentChrome = {
    logoUrl: `${typeof window !== 'undefined' ? window.location.origin : 'https://nonnegotiation.com'}/images/official_logo_seal.png`,
    siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://nonnegotiation.com',
  };
  const sectionRunning = items.some((item) => typeof item.startedAt === 'number');

  useEffect(() => {
    if (isScheduledAgendaMeeting(meeting)) setScheduleOpen(true);
  }, [meeting]);

  useEffect(() => {
    setOpenItems({});
    setDetailPopup(null);
  }, [meeting.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const next = `/admin/agenda?meeting=${encodeURIComponent(meetingId)}`;
    const current = `${window.location.pathname}${window.location.search}`;
    if (window.location.pathname.startsWith('/admin/agenda') && current !== next) {
      window.history.replaceState({}, '', next);
    }
  }, [meetingId]);

  useEffect(() => {
    if (!detailPopup) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDetailPopup(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailPopup]);

  useEffect(() => {
    if (!sectionRunning) return undefined;
    const tick = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, [sectionRunning]);

  useEffect(() => {
    localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }, [meta]);

  useEffect(() => {
    let cancelled = false;
    void fetchAgendaStore().then((remote) => {
      if (cancelled || !remote) return;
      setState((current) => {
        const merged = mergeAgendaStateMaps(current, remote.meetings);
        if (!merged[KICKOFF_AGENDA_ID]) {
          return writeMeetingItems(merged, KICKOFF_AGENDA_ID, draftKickoffFromWork(tasks));
        }
        return merged;
      });
      if (remote.meta) {
        setMeta({
          title: remote.meta.title || KICKOFF_MEETING_TITLE,
          topic: remote.meta.topic || KICKOFF_MEETING_TOPIC,
          attendees: remote.meta.attendees.length ? remote.meta.attendees : DEFAULT_KICKOFF_ATTENDEES,
          stage: parseAgendaStage(remote.meta.stage),
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tasks]);

  const flushAgendaStore = (meetingsState: AgendaStateMap, nextMeta: AgendaMeta) => {
    void saveAgendaStore(buildAgendaStorePayload(meetingsState, nextMeta, actor?.email ?? null)).then((result) => {
      if (result.skipped) {
        setPersistNotice('Saved on this device. Database is unavailable in local preview.');
        return;
      }
      if (!result.ok) {
        setPersistNotice(result.error || 'Could not save to the database');
        return;
      }
      setPersistNotice('Saved to the database');
    });
  };

  const persist = (nextItems: AgendaItem[]) => {
    setState((current) => {
      const next = writeMeetingItems(current, meeting.id, nextItems);
      flushAgendaStore(next, meta);
      return next;
    });
  };

  const commitFinalAgenda = () => {
    const finalized = items.map((item) => displayedItem(item));
    const nextMeta: AgendaMeta = {
      ...meta,
      title: workingAgendaTitle(meta.title),
      stage: 'working',
    };
    setMeta(nextMeta);
    setDrafts({});
    setState((current) => {
      const next = saveFinalAgenda(current, meeting, finalized);
      flushAgendaStore(next, nextMeta);
      return next;
    });
    setMeetingId(WORKING_AGENDA_ID);
    setPersistNotice('Final agenda saved as the Working Agenda');
  };

  const draftKey = (itemId: string) => `${meetingId}:${itemId}`;

  const displayedItem = (item: AgendaItem): AgendaItem => {
    const draft = drafts[draftKey(item.id)];
    return draft ? { ...item, ...draft } : item;
  };

  const patchDraft = (item: AgendaItem, patch: Partial<AgendaItemDraft>) => {
    const key = draftKey(item.id);
    setDrafts((current) => {
      const previous = current[key] ?? {
        label: item.label,
        minutes: item.minutes,
        notes: item.notes,
        actionItems: item.actionItems,
      };
      return { ...current, [key]: { ...previous, ...patch } };
    });
  };

  const saveItem = (item: AgendaItem) => {
    const displayed = displayedItem(item);
    persist(updateAgendaItem(items, item.id, {
      label: displayed.label,
      minutes: displayed.minutes,
      notes: displayed.notes,
      actionItems: displayed.actionItems,
    }, actor));
    setDrafts((current) => {
      const next = { ...current };
      delete next[draftKey(item.id)];
      return next;
    });
  };

  const deferItem = (itemId: string) => {
    setState((current) => {
      const next = deferAgendaItem(current, meetings, meeting, itemId, actor);
      flushAgendaStore(next, meta);
      return next;
    });
  };

  const toggleStartItem = (item: AgendaItem) => {
    persist(item.startedAt ? stopAgendaItem(items, item.id) : startAgendaItem(items, item.id));
  };

  const canFacilitate = canFacilitateAgenda(actor);

  const setTopicMinutes = (item: AgendaItem, minutes: number) => {
    persist(updateAgendaItemMinutes(items, item.id, minutes, actor));
    setDrafts((current) => {
      const key = draftKey(item.id);
      const draft = current[key];
      if (!draft) return current;
      return { ...current, [key]: { ...draft, minutes } };
    });
  };

  const setTopicLabel = (item: AgendaItem, label: string) => {
    persist(updateAgendaItem(items, item.id, { label }, actor));
    setDrafts((current) => {
      const key = draftKey(item.id);
      const draft = current[key];
      if (!draft) return current;
      return { ...current, [key]: { ...draft, label } };
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn" data-testid="agenda-board">
      <div
        className={BRAND_TAB_ROW_CLASS}
        role="tablist"
        aria-label="Agenda menus"
        data-testid="agenda-board-tabs"
      >
        {agendaBoardTabs().map((tab) => {
          const active = boardTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`agenda-board-tab-${tab.id}`}
              onClick={() => selectBoardTab(tab.id)}
              className={brandTabClass(active)}
            >
              {tab.id === 'previous-menus' ? <History className="w-4 h-4 shrink-0" /> : <ClipboardList className="w-4 h-4 shrink-0" />}
              {tab.label}
            </button>
          );
        })}
      </div>
      {boardTab === 'previous-menus' && (
        <p className="text-xs font-medium text-[#3F3832] px-1" data-testid="previous-menus-note">
          Archived meeting menus, including the August 27 kickoff. Current Working Agenda stays on the Agenda tab.
        </p>
      )}

      <div
        className="bg-white border-2 border-[#1F1917] rounded-2xl p-3 sm:p-4 space-y-2"
        data-testid="agenda-topic-times"
      >
        <button
          type="button"
          onClick={() => setTopicsOpen((open) => !open)}
          aria-expanded={topicsOpen}
          data-testid="agenda-topic-times-toggle"
          className="w-full min-h-[44px] rounded-xl inline-flex items-center gap-2 text-left cursor-pointer hover:bg-[#FAF8F5]"
        >
          {topicsOpen ? (
            <ChevronDown className="w-4 h-4 shrink-0 text-[#9A7B3C]" />
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0 text-[#9A7B3C]" />
          )}
          <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#9A7B3C]">
            {OVERALL_MEETING_SCHEDULE_LABEL}
          </h3>
          <p className="ml-auto text-[11px] font-black uppercase text-[#C2410C]" data-testid="agenda-meeting-length">
            {meeting.whenLabel} · {formatAgendaDuration(minutes)}
          </p>
        </button>
        {topicsOpen && (
          <>
            <p className="text-[10px] font-bold uppercase text-[#3F3832]">
              Meeting Topics &amp; Times · {AGENDA_DRAG_HINT}
            </p>
            <ol className="space-y-1.5">
              {items.map((item, index) => {
                const displayed = displayedItem(item);
                const isDragging = draggingId === item.id;
                return (
                  <li
                    key={item.id}
                    data-testid={`agenda-topic-time-${item.id}`}
                    onDragOver={(event) => {
                      if (!draggingId || draggingId === item.id) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const id = event.dataTransfer.getData('text/plain') || draggingId;
                      if (!id) return;
                      persist(placeAgendaItem(items, id, index, actor, true));
                      setDraggingId(null);
                    }}
                    className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 min-h-[44px] px-2 rounded-xl border-2 ${
                      isDragging ? 'border-[#C2410C] bg-[#FFEDD5] opacity-70' : 'border-[#E5DFD3] bg-[#FAF8F5]'
                    }`}
                  >
                    <button
                      type="button"
                      draggable={canFacilitate}
                      disabled={!canFacilitate}
                      aria-label={`Drag ${displayed.label} to reorder`}
                      title={AGENDA_DRAG_HINT}
                      onDragStart={(event) => {
                        if (!canFacilitate) return;
                        setDraggingId(item.id);
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', item.id);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      className="min-h-[44px] min-w-[44px] rounded-lg inline-flex items-center justify-center disabled:opacity-40 cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="w-4 h-4 text-[#3F3832]" />
                    </button>
                    <label className="min-w-0 flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-[#9A7B3C] shrink-0">{index + 1}.</span>
                      <input
                        value={displayed.label}
                        readOnly={!canMutateAgendaItem(item, actor)}
                        aria-label={`Topic ${index + 1} title`}
                        onChange={(event) => setTopicLabel(item, event.target.value)}
                        className={`min-w-0 flex-1 min-h-[44px] px-2 rounded-lg border-2 border-[#E5DFD3] text-xs font-bold text-[#1F1917] ${
                          canMutateAgendaItem(item, actor) ? 'bg-white' : 'bg-[#EFE8DC] cursor-not-allowed'
                        }`}
                      />
                    </label>
                    <label className="inline-flex items-center gap-1 shrink-0">
                      <span className="sr-only">Minutes for {displayed.label}</span>
                      <input
                        type="number"
                        min={0}
                        value={displayed.minutes}
                        readOnly={!canFacilitate}
                        onChange={(event) => setTopicMinutes(item, Number(event.target.value) || 0)}
                        className={`w-14 min-h-[44px] px-2 rounded-lg border-2 border-[#E5DFD3] text-sm font-black text-center ${
                          canFacilitate ? 'bg-white' : 'bg-[#EFE8DC] cursor-not-allowed'
                        }`}
                      />
                      <span className="text-[10px] font-black uppercase text-[#3F3832]">min</span>
                    </label>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>

      <div className="bg-[#F3E6C8] border-2 border-[#D4C4A0] rounded-2xl p-2 sm:p-3" data-testid="meeting-schedule">
        <button
          type="button"
          onClick={() => setScheduleOpen((open) => !open)}
          aria-expanded={scheduleOpen}
          data-testid="meeting-schedule-toggle"
          className="w-full min-h-[44px] px-3 rounded-xl inline-flex items-center gap-2 text-left cursor-pointer hover:bg-[#E8D9B0]"
        >
          {scheduleOpen ? (
            <ChevronDown className="w-4 h-4 shrink-0 text-[#9A7B3C]" />
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0 text-[#9A7B3C]" />
          )}
          <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#9A7B3C]">
            {MEETING_SCHEDULE_LABEL}
          </span>
          <span className="ml-auto text-[10px] font-mono font-black text-[#3F3832]">
            {scheduledMeetings.length}
          </span>
        </button>
        {scheduleOpen && (
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-1.5" data-testid="meeting-schedule-list">
            {scheduledMeetings.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMeetingId(item.id)}
                className={`w-full min-h-[44px] text-left px-3 py-2 rounded-xl border-2 cursor-pointer ${
                  item.id === meeting.id ? 'bg-[#FFEDD5] border-[#C2410C]' : 'bg-white border-[#E5DFD3]'
                }`}
              >
                <div className="text-[11px] font-black uppercase">{item.title}</div>
                <div className="text-[10px] text-[#3F3832]">{item.whenLabel}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <section
        className="bg-[#F3E6C8] border border-[#D4C4A0] rounded-3xl p-4 sm:p-5 shadow-sm"
        data-testid="agenda-top"
      >
        <div className={`grid grid-cols-1 gap-4 ${configureOpen ? 'xl:grid-cols-3' : 'xl:grid-cols-2'}`}>
          <div className="min-w-0 space-y-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1F1917] inline-flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#9A7B3C]" />
                {agendaStageLabel(meta.stage)}
              </h2>
              <p className="text-xs text-[#3F3832] font-medium mt-1">
                {meta.stage === 'working'
                  ? 'This is the working agenda for today’s meeting. Add, edit, or delete your own items.'
                  : 'This is still a draft. Save Final Agenda to lock it in as the Working Agenda.'}
              </p>
              <p className="text-[11px] text-[#3F3832] mt-1">
                {meeting.whenLabel} · Created by Evelyn Irving · {meta.attendees.length} attendees · {formatAgendaDuration(minutes)} · {progress.done}/{progress.total} topics done
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={kickoffMailto({
                  title: meta.title,
                  topic: meta.topic,
                  attendees: meta.attendees,
                  items,
                })}
                className="min-h-[44px] px-3 rounded-xl bg-white border-2 border-[#9B2F28] text-[#9B2F28] text-[11px] font-black uppercase inline-flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" /> Email Admins
              </a>
              <button
                type="button"
                onClick={() => openPrintWindow(buildAgendaDocumentHtml(model, documentChrome), false)}
                className="min-h-[44px] px-3 rounded-xl bg-white border-2 border-[#9B2F28] text-[#9B2F28] text-[11px] font-black uppercase inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" /> View/Print Agenda
              </button>
              <button
                type="button"
                onClick={() => setConfigureOpen((open) => !open)}
                className="min-h-[44px] px-3 rounded-xl bg-[#3F5A3A] text-white text-[11px] font-black uppercase inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4" /> {configureOpen ? 'Hide Setup' : 'Show Setup'}
              </button>
              <button
                type="button"
                data-testid="save-final-agenda-top"
                onClick={commitFinalAgenda}
                className="min-h-[44px] px-3 rounded-xl bg-[#C2410C] text-white text-[11px] font-black uppercase inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Final Agenda
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadBlob(buildAgendaDocumentHtml(model, documentChrome), `${agendaFileSlug(titledMeeting)}.doc`, 'application/msword')}
                className="min-h-[44px] px-3 rounded-xl text-[11px] font-black uppercase border-2 border-[#FDBA74] bg-[#EA580C] text-white cursor-pointer inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Word
              </button>
              {([
                ['excel', 'View Excel Agenda'],
                ['pdf', 'View PDF Agenda'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setView((current) => (current === id ? 'edit' : id))}
                  className={`min-h-[44px] px-3 rounded-xl text-[11px] font-black uppercase border-2 cursor-pointer ${
                    view === id ? 'bg-[#C2410C] text-white border-[#1F1917]' : 'bg-white text-[#1F1917] border-[#E5DFD3]'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => downloadBlob(buildAgendaExcelHtml(model, documentChrome), `${agendaFileSlug(titledMeeting)}.xls`, 'application/vnd.ms-excel')}
                className="min-h-[44px] px-3 rounded-xl text-[11px] font-black uppercase border-2 border-[#1F1917] bg-white cursor-pointer inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Excel Agenda
              </button>
              <button
                type="button"
                onClick={() => openPrintWindow(buildAgendaDocumentHtml(model, documentChrome), true)}
                className="min-h-[44px] px-3 rounded-xl text-[11px] font-black uppercase border-2 border-[#C2410C] bg-[#C2410C] text-white cursor-pointer inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> PDF Agenda
              </button>
            </div>
          </div>

          {configureOpen && (
          <div className="bg-white border-2 border-[#1F1917] rounded-2xl p-3 space-y-3 min-w-0">
                <label className="text-[10px] font-black uppercase text-[#3F3832] space-y-1 block">
                  Meeting title
                  <input
                    value={meta.title}
                    onChange={(event) => setMeta((current) => ({ ...current, title: event.target.value }))}
                    className="w-full min-h-[44px] px-3 rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] text-sm font-black text-[#1F1917] focus:border-[#C2410C] focus:outline-none"
                  />
                </label>
                <label className="text-[10px] font-black uppercase text-[#3F3832] space-y-1 block">
                  Meeting topic
                  <input
                    value={meta.topic}
                    onChange={(event) => setMeta((current) => ({ ...current, topic: event.target.value }))}
                    className="w-full min-h-[44px] px-3 rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] text-sm font-medium text-[#1F1917] focus:border-[#C2410C] focus:outline-none"
                  />
                </label>
                <button
                  type="button"
                  data-testid="save-final-agenda"
                  onClick={commitFinalAgenda}
                  className="w-full min-h-[44px] px-4 rounded-xl bg-[#C2410C] text-white text-[11px] font-black uppercase cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Final Agenda
                </button>
                {actor?.isSuperAdmin && meta.stage === 'draft' && (
                  <button
                    type="button"
                    data-testid="draft-agenda-from-work"
                    onClick={() => persist(draftKickoffFromWork(tasks))}
                    className="w-full min-h-[44px] px-4 rounded-xl border-2 border-[#1F1917] bg-white text-[#1F1917] text-[11px] font-black uppercase cursor-pointer"
                  >
                    Draft Agenda from Work
                  </button>
                )}
          </div>
          )}

          {configureOpen && (
            <div className="bg-white border-2 border-[#1F1917] rounded-2xl p-3 space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-[#9A7B3C]">Attendees</h3>
              <ul className="flex flex-col gap-2">
                {meta.attendees.map((person) => (
                  <li
                    key={person.id}
                    className="inline-flex items-center gap-2 min-h-[44px] px-3 rounded-xl bg-[#FAF8F5] border-2 border-[#E5DFD3] text-xs font-bold"
                  >
                    <span className="min-w-0 truncate">{person.name}</span>
                    {person.role && <span className="text-[#3F3832] font-medium truncate">{person.role}</span>}
                    <button
                      type="button"
                      aria-label={`Remove ${person.name}`}
                      onClick={() => setMeta((current) => ({ ...current, attendees: removeAgendaAttendee(current.attendees, person.id) }))}
                      className="ml-auto min-h-[32px] min-w-[32px] inline-flex items-center justify-center text-[#C2410C] cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <form
                className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  setMeta((current) => ({
                    ...current,
                    attendees: addAgendaAttendee(current.attendees, { name: attendeeName, email: attendeeEmail }),
                  }));
                  setAttendeeName('');
                  setAttendeeEmail('');
                }}
              >
                <input
                  value={attendeeName}
                  onChange={(event) => setAttendeeName(event.target.value)}
                  placeholder="Add attendee name"
                  className="min-h-[44px] px-3 rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] text-sm font-medium"
                />
                <input
                  value={attendeeEmail}
                  onChange={(event) => setAttendeeEmail(event.target.value)}
                  placeholder="Email"
                  type="email"
                  className="min-h-[44px] px-3 rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] text-sm font-medium"
                />
                <button type="submit" className="min-h-[44px] px-4 rounded-xl bg-[#EA580C] text-white text-[11px] font-black uppercase cursor-pointer">
                  Add
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[16rem_1fr] gap-4">
        <aside className="bg-white border-2 border-[#1F1917] rounded-3xl p-3 space-y-1.5" data-testid="agenda-meetings">
          {currentMeetings.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMeetingId(item.id)}
              className={`w-full min-h-[44px] text-left px-3 py-2 rounded-xl border-2 cursor-pointer ${
                item.id === meeting.id ? 'bg-[#FFEDD5] border-[#C2410C]' : 'bg-[#FAF8F5] border-transparent'
              }`}
            >
              <div className="text-[11px] font-black uppercase">{item.title}</div>
              <div className="text-[10px] text-[#3F3832]">{item.whenLabel}</div>
            </button>
          ))}
        </aside>

        {view === 'edit' ? (
          <section className="space-y-3">
            <form
              className="flex flex-col sm:flex-row gap-2 bg-white border-2 border-[#1F1917] rounded-2xl p-3"
              onSubmit={(event) => {
                event.preventDefault();
                const next = addCustomAgendaItem(items, newTopic, newMinutes, actor);
                if (next === items) return;
                persist(next);
                setOpenItems((current) => ({ ...current, [next[0]!.id]: true }));
                setDragHint(true);
                setNewTopic('');
              }}
            >
              <input
                value={newTopic}
                onChange={(event) => setNewTopic(event.target.value)}
                placeholder="Add a kickoff topic"
                className="flex-1 min-h-[44px] px-3 rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] text-sm font-medium"
              />
              <input
                type="number"
                min={0}
                value={newMinutes}
                onChange={(event) => setNewMinutes(Number(event.target.value) || 0)}
                className="w-24 min-h-[44px] px-3 rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] text-sm font-black"
              />
              <button type="submit" className="min-h-[44px] px-4 rounded-xl bg-[#C2410C] text-white text-[11px] font-black uppercase cursor-pointer inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add topic
              </button>
            </form>

            {persistNotice && (
              <p className="text-[11px] font-bold uppercase text-[#9A7B3C]" data-testid="agenda-persist-notice">
                {persistNotice}
              </p>
            )}
            {dragHint && (
              <p className="text-[11px] font-black uppercase tracking-wide text-[#C2410C]" data-testid="agenda-drag-hint">
                {AGENDA_DRAG_HINT}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-black uppercase tracking-wide text-[#3F3832]">
                Agenda items · {items.length}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  data-testid="expand-all-agenda-items"
                  onClick={() => setOpenItems(setAllAgendaItemsOpen(items.map((item) => item.id), true))}
                  className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] text-[10px] font-black uppercase cursor-pointer"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  data-testid="collapse-all-agenda-items"
                  onClick={() => setOpenItems(setAllAgendaItemsOpen(items.map((item) => item.id), false))}
                  className="min-h-[44px] px-3 rounded-xl border-2 border-[#E5DFD3] text-[10px] font-black uppercase cursor-pointer"
                >
                  Collapse all
                </button>
              </div>
            </div>
            <ol className="space-y-2" data-testid="agenda-item-list">
              {items.map((item, index) => {
                const canEdit = canMutateAgendaItem(item, actor);
                const canRemove = canRemoveAgendaItem(item, actor);
                const displayed = displayedItem(item);
                const dirty = isAgendaItemDirty(item, displayed);
                const remaining = agendaItemRemainingSeconds(item, nowMs);
                const running = remaining !== null;
                const isOpen = Boolean(openItems[item.id]) || running;
                const isDragging = draggingId === item.id;
                return (
                <li
                  key={item.id}
                  data-testid={`agenda-item-${item.id}`}
                  data-open={isOpen ? 'true' : 'false'}
                  onDragOver={(event) => {
                    if (!draggingId || draggingId === item.id) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const id = event.dataTransfer.getData('text/plain') || draggingId;
                    if (!id) return;
                    persist(placeAgendaItem(items, id, index, actor));
                    setDraggingId(null);
                  }}
                  className={`bg-white border-2 rounded-2xl ${isOpen ? 'p-4 space-y-2' : 'px-3 py-2'} ${
                    running ? 'border-[#C2410C]' : 'border-[#1F1917]'
                  } ${isDragging ? 'opacity-60' : ''}`}
                >
                  <div className="flex flex-wrap items-start gap-2">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        draggable={canEdit}
                        disabled={!canEdit}
                        aria-label={`Drag ${displayed.label} to reorder`}
                        title={AGENDA_DRAG_HINT}
                        onDragStart={(event) => {
                          if (!canEdit) return;
                          setDraggingId(item.id);
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('text/plain', item.id);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        className="min-h-[44px] min-w-[44px] rounded-xl border-2 border-[#E5DFD3] disabled:opacity-40 cursor-grab active:cursor-grabbing inline-flex items-center justify-center"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      {isOpen && (
                        <>
                          <button type="button" disabled={!canEdit || index === 0} onClick={() => persist(moveAgendaItem(items, item.id, -1, actor))} className="min-h-[44px] min-w-[44px] rounded-xl border-2 border-[#E5DFD3] disabled:opacity-40 cursor-pointer inline-flex items-center justify-center">
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button type="button" disabled={!canEdit || index === items.length - 1} onClick={() => persist(moveAgendaItem(items, item.id, 1, actor))} className="min-h-[44px] min-w-[44px] rounded-xl border-2 border-[#E5DFD3] disabled:opacity-40 cursor-pointer inline-flex items-center justify-center">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-[12rem] space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          data-testid={`toggle-agenda-item-${item.id}`}
                          aria-expanded={isOpen}
                          aria-label={isOpen ? `Collapse ${displayed.label}` : `Expand ${displayed.label}`}
                          onClick={() => setOpenItems((current) => toggleAgendaItemOpen(current, item.id))}
                          className="min-h-[44px] min-w-[44px] rounded-xl border-2 border-[#E5DFD3] cursor-pointer inline-flex items-center justify-center"
                        >
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <input
                          value={displayed.label}
                          readOnly={!canEdit}
                          aria-label={`${displayed.label} title`}
                          onChange={(event) => setTopicLabel(item, event.target.value)}
                          className={`flex-1 min-h-[44px] px-3 rounded-xl border-2 border-[#E5DFD3] text-sm font-black uppercase ${canEdit ? 'bg-[#FAF8F5]' : 'bg-[#EFE8DC] cursor-not-allowed'}`}
                        />
                        <input
                          type="number"
                          min={0}
                          value={displayed.minutes}
                          readOnly={!canEdit}
                          aria-label={`${displayed.label} minutes`}
                          onChange={(event) => setTopicMinutes(item, Number(event.target.value) || 0)}
                          className={`w-16 min-h-[44px] px-2 rounded-xl border-2 border-[#E5DFD3] text-sm font-black ${canEdit ? 'bg-white' : 'bg-[#EFE8DC] cursor-not-allowed'}`}
                        />
                        <button
                          type="button"
                          onClick={() => toggleStartItem(item)}
                          data-testid={`start-agenda-item-${item.id}`}
                          aria-label={running ? `Stop ${displayed.label}` : `Start ${displayed.label}`}
                          className={`min-h-[44px] px-3 rounded-xl cursor-pointer inline-flex items-center gap-1.5 text-[10px] font-black uppercase ${
                            running ? 'bg-[#C2410C] text-white' : 'border-2 border-[#1F1917] text-[#1F1917] bg-white'
                          }`}
                        >
                          {running ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {running ? formatAgendaTimer(remaining) : 'Start'}
                        </button>
                        {canEdit && dirty && (
                          <button
                            type="button"
                            onClick={() => saveItem(item)}
                            data-testid={`save-agenda-item-${item.id}`}
                            className="min-h-[44px] px-3 rounded-xl bg-[#C2410C] text-white cursor-pointer inline-flex items-center gap-1.5 text-[10px] font-black uppercase"
                          >
                            <Save className="w-4 h-4" /> Save
                          </button>
                        )}
                        {isOpen && (
                          <button
                            type="button"
                            onClick={() => deferItem(item.id)}
                            disabled={!canEdit || !nextMeeting}
                            title={!canEdit ? 'You can only defer your own agenda item' : nextMeeting ? `Defer to ${nextMeeting.title}` : 'No next meeting'}
                            aria-label={!canEdit ? 'Cannot defer someone else\'s item' : nextMeeting ? `Defer to ${nextMeeting.title}` : 'No next meeting'}
                            data-testid={`defer-agenda-item-${item.id}`}
                            className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] text-[#1F1917] disabled:opacity-40 cursor-pointer inline-flex items-center gap-1.5 text-[10px] font-black uppercase"
                          >
                            <Forward className="w-4 h-4" /> Defer
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => persist(removeAgendaItem(items, item.id, actor))}
                          disabled={!canRemove}
                          title={!canRemove ? 'You can only delete your own agenda item' : 'Remove item'}
                          aria-label={!canRemove ? 'Cannot remove someone else\'s item' : 'Remove item'}
                          className="min-h-[44px] min-w-[44px] rounded-xl border-2 border-[#1F1917] text-[#C2410C] disabled:opacity-40 cursor-pointer inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {isOpen && (
                        <>
                          {(item.createdByName || item.createdBy) && (
                            <p className="text-[10px] font-mono font-bold uppercase text-[#9A7B3C]">
                              Added by {item.createdByName || item.createdBy}
                            </p>
                          )}
                          {([
                            ['notes', 'Meeting notes', 'bg-[#FAF8F5]'],
                            ['actionItems', 'Add a description', 'bg-[#FFF7ED]'],
                          ] as const).map(([field, placeholder, bg]) => (
                            <div key={field} className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#9A7B3C]">
                                  {agendaDetailFieldLabel(field)}
                                </span>
                                <button
                                  type="button"
                                  data-testid={`expand-agenda-${field}-${item.id}`}
                                  aria-label={`Open ${agendaDetailFieldLabel(field)} larger`}
                                  onClick={() => setDetailPopup({ itemId: item.id, field })}
                                  className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] text-[10px] font-black uppercase cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" /> Open larger
                                </button>
                              </div>
                              <textarea
                                value={agendaDetailFieldValue(displayed, field)}
                                readOnly={!canEdit}
                                onChange={(event) => patchDraft(item, { [field]: event.target.value })}
                                placeholder={placeholder}
                                rows={6}
                                className={`w-full min-h-[10rem] px-3 py-3 rounded-xl border-2 border-[#E5DFD3] text-sm leading-relaxed ${canEdit ? bg : 'bg-[#EFE8DC] cursor-not-allowed'}`}
                              />
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </li>
                );
              })}
            </ol>
          </section>
        ) : (
          <iframe
            title={`${view} preview`}
            className="w-full min-h-[32rem] bg-white border-2 border-[#1F1917] rounded-3xl"
            srcDoc={view === 'excel' ? buildAgendaExcelHtml(model, documentChrome) : buildAgendaDocumentHtml(model, documentChrome)}
          />
        )}
      </div>

      {detailPopup && (() => {
        const popupItem = items.find((item) => item.id === detailPopup.itemId);
        if (!popupItem) return null;
        const displayed = displayedItem(popupItem);
        const canEditPopup = canMutateAgendaItem(popupItem, actor);
        const field = detailPopup.field;
        const title = agendaDetailFieldLabel(field);
        return (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#1F1917]/80 backdrop-blur-sm"
            data-testid="agenda-detail-popup"
            role="dialog"
            aria-modal="true"
            aria-label={`${title} for ${displayed.label}`}
            onClick={() => setDetailPopup(null)}
          >
            <div
              className="w-full max-w-4xl bg-white border-2 border-[#1F1917] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#9A7B3C]">{title}</p>
                  <h3 className="text-lg font-black text-[#1F1917] uppercase leading-snug">{displayed.label}</h3>
                </div>
                <button
                  type="button"
                  aria-label={`Close ${title}`}
                  onClick={() => setDetailPopup(null)}
                  className="min-h-[44px] min-w-[44px] rounded-xl border-2 border-[#1F1917] cursor-pointer inline-flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                autoFocus
                value={agendaDetailFieldValue(displayed, field)}
                readOnly={!canEditPopup}
                onChange={(event) => patchDraft(popupItem, { [field]: event.target.value })}
                placeholder={field === 'notes' ? 'Meeting notes' : 'Add a description'}
                className={`w-full min-h-[22rem] px-4 py-4 rounded-2xl border-2 border-[#E5DFD3] text-base leading-relaxed ${
                  canEditPopup ? 'bg-[#FAF8F5]' : 'bg-[#EFE8DC] cursor-not-allowed'
                }`}
              />
              <div className="flex flex-wrap justify-end gap-2">
                {canEditPopup && isAgendaItemDirty(popupItem, displayed) && (
                  <button
                    type="button"
                    onClick={() => saveItem(popupItem)}
                    className="min-h-[44px] px-4 rounded-xl bg-[#C2410C] text-white text-[11px] font-black uppercase cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDetailPopup(null)}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-[#1F1917] text-[11px] font-black uppercase cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AgendaBoard;
