import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FlaskConical,
  ListChecks,
  ListPlus,
  Lock,
  Mail,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  Square,
  Timer,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { ApiError } from "../../lib/api";
import type { AuthUser } from "../../lib/auth";
import { BusyOverlay } from "../WaitFeedback";
import { RichTextEmailEditor } from "./RichTextEmailEditor";
import {
  extractHttpUrls,
  htmlForVisualEmailPreview,
  isEmptyEmailHtml,
  linkifyEmailHtml,
  toEditorHtml,
} from "../../lib/email-html";
import {
  AGENDA_CATEGORY_LABELS,
  AGENDA_CATEGORY_ORDER,
  AGENDA_TIMEZONES,
  DEFAULT_AGENDA_MEETING_TIME,
  DEFAULT_AGENDA_TIMEZONE,
  formatAgendaMeetingWindow,
  MAX_AGENDA_TIME_PICKS,
  MIN_AGENDA_DURATION_MINUTES,
  MIN_AGENDA_TIME_PICKS,
  buildPartnerAgendaEmailDraft,
  createPartnerAgenda,
  deleteAgendaItem,
  fetchPartnerAgenda,
  formatAgendaSlot,
  isoToLocalInput,
  linkAgendaItems,
  localInputToIso,
  mustPickAgendaTimes,
  agendaItemSourceLabel,
  agendaItemSourceRef,
  newAgendaActionId,
  notesToActionItems,
  saveAgendaItem,
  saveAgendaMeta,
  saveAgendaPreview,
  saveAgendaTimePicks,
  sendPartnerAgendaInvite,
  type AgendaActionItem,
  type AgendaCategory,
  type AgendaItem,
  type AgendaTimePick,
  type PartnerAgendaPayload,
} from "../../lib/gysh-partner-agenda";
import {
  fetchTasks,
  nextTaskId,
  PARTNER_ASSIGNEES,
  persistTasks,
  todayMMDDYY,
  type GyshTask,
  type PartnerAssignee,
} from "../../lib/gysh-tasks";
import { BACKLOG_SPRINT, UNASSIGNED_OWNER } from "../../lib/gysh-sprints";
import { noteEntriesPlainText } from "../../lib/gysh-note-entries";

const HIDDEN_SUGGEST_TASKS_KEY = "gysh-agenda-hidden-suggest-tasks";

function loadHiddenSuggestTaskIds(): Set<string> {
  try {
    const raw = localStorage.getItem(HIDDEN_SUGGEST_TASKS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map((id) => String(id || "").trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}

function persistHiddenSuggestTaskIds(ids: Set<string>) {
  try {
    localStorage.setItem(HIDDEN_SUGGEST_TASKS_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore quota / private mode */
  }
}

type PreviewDraft = {
  category: AgendaCategory;
  importance: number;
  discussionNotes: string;
  questionsText: string;
  actionItemsText: string;
  sortOrder: number;
};
import { TEST_CASES } from "../../lib/gysh-test-plan";
import {
  AGENDA_MEETING_MINUTES,
  AGENDA_QA_MINUTES,
  AGENDA_TINA_PLACEHOLDER_COUNT,
  AGENDA_TINA_PLACEHOLDER_MINUTES,
  MAX_AGENDA_MEETING_MINUTES,
  MIN_AGENDA_MEETING_MINUTES,
  buildAgendaSchedule,
  clampAgendaMeetingMinutes,
  isTinaAgendaAuthor,
  openPartnerAgendaPdf,
  partnerAgendaPdfBase64,
} from "../../lib/partner-agenda-pdf";
import { reservePdfTab } from "../../lib/open-pdf";

type Props = {
  authUser?: AuthUser | null;
  /** When true, highlight the time-pick requirement (Tina / Lyriq first login). */
  forceTimePicks?: boolean;
  onTimePicksSatisfied?: () => void;
  onOpenTask?: (taskId: string) => void;
  onOpenTest?: (testId: string) => void;
};

function emptyPickInputs(count = MIN_AGENDA_TIME_PICKS): string[] {
  return Array.from({ length: count }, () => "");
}

function formatTimerMmSs(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

type MeetingTimelineEntry = {
  id: string;
  title: string;
  startOffsetSec: number;
  endOffsetSec: number;
  durationSec: number;
  kind: "item" | "tina-placeholder" | "qa";
};

/** Build agenda body from a task without duplicating identical description/notes. */
function agendaBodyFromTask(description: string, notes: string, fallbackId: string): string {
  const desc = String(description || "").trim();
  const note = noteEntriesPlainText(notes || "").trim();
  if (!desc && !note) return fallbackId;
  if (!desc) return note;
  if (!note) return desc;
  if (desc === note) return desc;
  if (note.includes(desc) && desc.length >= 12) return note;
  if (desc.includes(note) && note.length >= 12) return desc;
  return `${desc}\n${note}`;
}

/** Collapse consecutive duplicate lines (fixes older picker saves that joined desc+notes twice). */
function displayAgendaBody(body: string): string {
  // Suggestions may still arrive with JSON note threads mixed into the body — unwrap to plain text.
  const plain = noteEntriesPlainText(String(body || "")).trim() || String(body || "").trim();
  const lines = plain
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .map((l) => {
      const t = l.trim();
      if (t.startsWith("[") && t.includes('"text"')) {
        const unwrapped = noteEntriesPlainText(t).trim();
        return unwrapped || l;
      }
      return l;
    });
  const out: string[] = [];
  for (const line of lines) {
    if (out.length && out[out.length - 1].trim() === line.trim() && line.trim()) continue;
    out.push(line);
  }
  return out.join("\n").trim();
}

type AmPmParts = { hour12: number; minute: number; ampm: "AM" | "PM" };

function parseHhMm(value: string): AmPmParts {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(value || "").trim());
  // Empty → 1:30 PM Central / 11:30 AM Vegas (default partner meeting start).
  if (!m) return { hour12: 3, minute: 30, ampm: "PM" };
  const hour24 = Math.min(23, Math.max(0, Number(m[1])));
  const minute = Math.min(59, Math.max(0, Number(m[2])));
  const ampm: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, minute, ampm };
}

function toHhMm(hour12: number, minute: number, ampm: "AM" | "PM"): string {
  const h12 = Math.min(12, Math.max(1, hour12));
  let h = h12 % 12;
  if (ampm === "PM") h += 12;
  const mm = Math.min(59, Math.max(0, minute));
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function AmPmTimeSelect({
  value,
  onChange,
  testId,
}: {
  /** `HH:mm` 24-hour */
  value: string;
  onChange: (hhmm: string) => void;
  testId?: string;
}) {
  const parts = parseHhMm(value);
  return (
    <div className="agenda-ampm-time" data-testid={testId}>
      <select
        aria-label="Hour"
        value={parts.hour12}
        onChange={(e) => onChange(toHhMm(Number(e.target.value), parts.minute, parts.ampm))}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span aria-hidden>:</span>
      <select
        aria-label="Minute"
        value={parts.minute}
        onChange={(e) => onChange(toHhMm(parts.hour12, Number(e.target.value), parts.ampm))}
      >
        {Array.from({ length: 60 }, (_, m) => m).map((m) => (
          <option key={m} value={m}>
            {String(m).padStart(2, "0")}
          </option>
        ))}
      </select>
      <select
        aria-label="AM or PM"
        value={parts.ampm}
        onChange={(e) =>
          onChange(toHhMm(parts.hour12, parts.minute, e.target.value as "AM" | "PM"))
        }
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

export function AgendaPage({
  authUser = null,
  forceTimePicks = false,
  onTimePicksSatisfied,
  onOpenTask,
  onOpenTest,
}: Props) {
  const [data, setData] = useState<PartnerAgendaPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [pickInputs, setPickInputs] = useState<string[]>(() => emptyPickInputs());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerKind, setPickerKind] = useState<"task" | "test">("task");
  const [pickerQuery, setPickerQuery] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [allTasks, setAllTasks] = useState<GyshTask[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [meetingLive, setMeetingLive] = useState(false);
  /** Epoch ms when Start/Restart was pressed — drives the live section timer. */
  const [meetingStartedAt, setMeetingStartedAt] = useState<number | null>(null);
  const [meetingNow, setMeetingNow] = useState(() => Date.now());
  const sectionWarnRef = useRef<Record<string, { warned45?: boolean; warned15?: boolean }>>({});
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState(DEFAULT_AGENDA_MEETING_TIME);
  const [meetingTimezone, setMeetingTimezone] = useState(DEFAULT_AGENDA_TIMEZONE);
  const [meetingMinutes, setMeetingMinutes] = useState(AGENDA_MEETING_MINUTES);
  const [invitedText, setInvitedText] = useState("Tina, Evelyn, Lyriq, Candace");
  const [attendedText, setAttendedText] = useState("");
  const [previewDrafts, setPreviewDrafts] = useState<Record<string, PreviewDraft>>({});
  const [emailOpen, setEmailOpen] = useState(false);
  /** Bumps only when the email modal opens — keeps the editor from remounting each keystroke. */
  const [emailEditorKey, setEmailEditorKey] = useState(0);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailModalError, setEmailModalError] = useState("");
  const [emailModalNotice, setEmailModalNotice] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState("");
  const [meetingMinutesUrl, setMeetingMinutesUrl] = useState("");
  /** Run-mode sub-tab: agenda items vs meeting notes / minutes link. */
  const [agendaRunTab, setAgendaRunTab] = useState<"agenda" | "notes">("agenda");
  const [meetingActionItems, setMeetingActionItems] = useState<AgendaActionItem[]>([]);
  const [hiddenSuggestTaskIds, setHiddenSuggestTaskIds] = useState<Set<string>>(
    () => loadHiddenSuggestTaskIds(),
  );

  const mustPick = mustPickAgendaTimes(authUser);

  const syncMeetingFields = (payload: PartnerAgendaPayload) => {
    const a = payload.agenda;
    if (!a) return;
    setMeetingDate(String(a.meetingDate || ""));
    setMeetingTime(String(a.meetingTime || "").trim() || DEFAULT_AGENDA_MEETING_TIME);
    setMeetingTimezone(String(a.meetingTimezone || DEFAULT_AGENDA_TIMEZONE) || DEFAULT_AGENDA_TIMEZONE);
    setMeetingMinutes(clampAgendaMeetingMinutes(a.meetingMinutes ?? AGENDA_MEETING_MINUTES));
    setInvitedText((a.invited || []).join(", ") || "Tina, Evelyn, Lyriq, Candace");
    setAttendedText((a.attended || []).join(", "));
    setMeetingNotes(String(a.meetingNotes || ""));
    setMeetingMinutesUrl(String(a.meetingMinutesUrl || ""));
    setMeetingActionItems(
      Array.isArray(a.meetingActionItems)
        ? a.meetingActionItems.map((x) => ({
            id: x.id || newAgendaActionId(),
            text: x.text || "",
            owner: x.owner || "",
            done: Boolean(x.done),
            ...(x.backlogTaskId ? { backlogTaskId: x.backlogTaskId } : {}),
          }))
        : [],
    );
  };

  const syncPreviewDrafts = (payload: PartnerAgendaPayload) => {
    const next: Record<string, PreviewDraft> = {};
    for (const it of payload.items || []) {
      next[it.id] = {
        category: (it.category || "other") as AgendaCategory,
        importance: it.importance ?? 3,
        discussionNotes: it.discussionNotes || "",
        questionsText: (it.questions || []).map((q) => q.text).join("\n"),
        actionItemsText: (it.actionItems || []).map((a) => a.text).join("\n"),
        sortOrder: it.sortOrder ?? 0,
      };
    }
    setPreviewDrafts(next);
  };

  const reload = async () => {
    const payload = await fetchPartnerAgenda();
    setData(payload);
    syncMeetingFields(payload);
    syncPreviewDrafts(payload);
    const mine = (payload.timePicks || []).filter((p) => p.isMine);
    if (mine.length > 0) {
      setPickInputs(mine.map((p) => isoToLocalInput(p.startsAt)));
    } else if (mustPick) {
      setPickInputs(emptyPickInputs());
    }
    if (!payload.needsTimePicks) onTimePicksSatisfied?.();
    return payload;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [payload, tasks] = await Promise.all([
          fetchPartnerAgenda(),
          fetchTasks().catch(() => [] as GyshTask[]),
        ]);
        if (cancelled) return;
        setData(payload);
        syncMeetingFields(payload);
        syncPreviewDrafts(payload);
        setAllTasks(tasks);
        const mine = (payload.timePicks || []).filter((p) => p.isMine);
        if (mine.length > 0) {
          setPickInputs(mine.map((p) => isoToLocalInput(p.startsAt)));
        }
        if (!payload.needsTimePicks) onTimePicksSatisfied?.();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Could not load agenda.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount load
  }, []);

  const linkedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const it of data?.items || []) {
      if ((it.source === "task" || it.source === "test") && it.sourceId) {
        keys.add(`${it.source}:${it.sourceId}`);
      }
    }
    return keys;
  }, [data?.items]);

  const pickerRows = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (pickerKind === "task") {
      return allTasks
        .filter((t) => !linkedKeys.has(`task:${t.id}`))
        .filter((t) => {
          if (!q) return true;
          return (
            t.id.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            String(t.notes || "")
              .toLowerCase()
              .includes(q)
          );
        })
        .slice(0, 80)
        .map((t) => {
          const body = agendaBodyFromTask(t.description, t.notes, t.id);
          const label =
            String(t.description || "")
              .trim()
              .split("\n")[0]
              ?.slice(0, 80) || t.id;
          return {
            key: `task:${t.id}`,
            sourceKind: "task" as const,
            sourceId: t.id,
            label,
            body,
          };
        });
    }
    return TEST_CASES.filter((t) => !linkedKeys.has(`test:${t.id}`))
      .filter((t) => {
        if (!q) return true;
        const hay = `${t.id} ${t.title} ${(t.steps || []).join(" ")} ${t.expected || ""}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 80)
      .map((t) => ({
        key: `test:${t.id}`,
        sourceKind: "test" as const,
        sourceId: t.id,
        label: t.id,
        body: `Test ${t.id}: ${t.title}`,
      }));
  }, [allTasks, linkedKeys, pickerKind, pickerQuery]);

  const picksByPerson = useMemo(() => {
    const map = new Map<string, AgendaTimePick[]>();
    for (const p of data?.timePicks || []) {
      const key = p.userId || p.userName;
      const list = map.get(key) || [];
      list.push(p);
      map.set(key, list);
    }
    return [...map.entries()].map(([key, picks]) => ({
      key,
      name: picks[0]?.userName || key,
      picks: picks.slice().sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    }));
  }, [data?.timePicks]);

  const run = async (fn: () => Promise<PartnerAgendaPayload>, okMsg?: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = await fn();
      setData(payload);
      syncMeetingFields(payload);
      syncPreviewDrafts(payload);
      const mine = (payload.timePicks || []).filter((p) => p.isMine);
      if (mine.length > 0) setPickInputs(mine.map((p) => isoToLocalInput(p.startsAt)));
      if (!payload.needsTimePicks) onTimePicksSatisfied?.();
      if (okMsg) setNotice(okMsg);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = () =>
    void run(() => createPartnerAgenda(), "Agenda is ready — everyone can add items now.");

  const handleAddItem = () => {
    const body = draftBody.trim();
    if (!body) return;
    void run(async () => {
      const payload = await saveAgendaItem({ body });
      setDraftBody("");
      return payload;
    }, "Agenda item added.");
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const body = editBody.trim();
    if (!body) return;
    void run(async () => {
      const payload = await saveAgendaItem({ id: editingId, body });
      setEditingId(null);
      setEditBody("");
      return payload;
    }, "Agenda item updated.");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this agenda item?")) return;
    void run(() => deleteAgendaItem(id), "Agenda item deleted.");
  };

  const handleSavePicks = () => {
    const isos = pickInputs
      .map((v) => localInputToIso(v))
      .filter((v): v is string => Boolean(v));
    const unique = [...new Set(isos)];
    if (unique.length < MIN_AGENDA_TIME_PICKS || unique.length > MAX_AGENDA_TIME_PICKS) {
      setError(
        `Choose ${MIN_AGENDA_TIME_PICKS}–${MAX_AGENDA_TIME_PICKS} distinct meeting start times (each block is ${MIN_AGENDA_DURATION_MINUTES}+ minutes).`,
      );
      return;
    }
    void run(
      () => saveAgendaTimePicks(unique),
      `Saved ${unique.length} meeting time${unique.length === 1 ? "" : "s"}.`,
    );
  };

  const toggleSelected = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleAddSelected = () => {
    const items = pickerRows
      .filter((r) => selectedKeys.has(r.key))
      .map((r) => ({
        sourceKind: r.sourceKind,
        sourceId: r.sourceId,
        body: r.body,
      }));
    if (items.length === 0) {
      setError("Select at least one task or test to add.");
      return;
    }
    void run(async () => {
      const payload = await linkAgendaItems(items);
      setSelectedKeys(new Set());
      setPickerOpen(false);
      return payload;
    }, `Added ${items.length} item${items.length === 1 ? "" : "s"} to the agenda.`);
  };

  const openSource = (it: AgendaItem) => {
    if (it.source === "task" && it.sourceId) onOpenTask?.(it.sourceId);
    if (it.source === "test" && it.sourceId) onOpenTest?.(it.sourceId);
  };

  const parseNameCsv = (raw: string) =>
    [...new Set(raw.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean))];

  const handleSaveMeetingHeader = () => {
    void run(
      () =>
        saveAgendaMeta({
          meetingDate,
          meetingTime,
          meetingTimezone,
          meetingMinutes: clampAgendaMeetingMinutes(meetingMinutes),
          invited: parseNameCsv(invitedText),
          attended: parseNameCsv(attendedText),
        }),
      "Meeting header saved.",
    );
  };

  const updateDraft = (id: string, patch: Partial<PreviewDraft>) => {
    setPreviewDrafts((prev) => {
      const base = prev[id];
      if (!base) return prev;
      return { ...prev, [id]: { ...base, ...patch } };
    });
  };

  const handleSavePreviewProgress = () => {
    const items = Object.entries(previewDrafts).map(([id, d]) => ({
      id,
      category: d.category,
      importance: d.importance,
      discussionNotes: d.discussionNotes,
      questions: d.questionsText
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((text, i) => ({ id: `q-${id}-${i}`, text })),
      actionItems: d.actionItemsText
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((text, i) => ({ id: `a-${id}-${i}`, text, owner: "", done: false })),
      sortOrder: d.sortOrder,
    }));
    void run(
      () =>
        saveAgendaPreview({
          meetingDate,
          meetingTime,
          meetingTimezone,
          meetingMinutes: clampAgendaMeetingMinutes(meetingMinutes),
          invited: parseNameCsv(invitedText),
          attended: parseNameCsv(attendedText),
          meetingNotes,
          meetingMinutesUrl: meetingMinutesUrl.trim(),
          meetingActionItems: meetingActionItems.filter((a) => a.text.trim()),
          items,
        }),
      "Discussion notes, questions, and action items saved.",
    );
  };

  const topicCaptureText = (drafts: Record<string, PreviewDraft>) =>
    Object.values(drafts)
      .flatMap((d) => [
        d.discussionNotes.trim(),
        d.questionsText.trim(),
        d.actionItemsText.trim(),
      ])
      .filter(Boolean)
      .join("\n");

  const handleTranslateNotesToActions = () => {
    const combined = [meetingNotes.trim(), topicCaptureText(previewDrafts)]
      .filter(Boolean)
      .join("\n");
    if (!combined.trim()) {
      setError("Add discussion notes, questions, or action lines on topics first, then translate.");
      return;
    }
    setError("");
    const next = notesToActionItems(combined, meetingActionItems);
    const added = next.length - meetingActionItems.length;
    setMeetingActionItems(next);
    setNotice(
      added > 0
        ? `Translated ${added} note line${added === 1 ? "" : "s"} into action items. Assign owners, then save or send to backlog.`
        : "No new action items found — notes may already be translated.",
    );
  };

  const updateMeetingAction = (id: string, patch: Partial<AgendaActionItem>) => {
    setMeetingActionItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const addBlankMeetingAction = () => {
    setMeetingActionItems((prev) => [
      ...prev,
      { id: newAgendaActionId(), text: "", owner: "", done: false },
    ]);
  };

  const removeMeetingAction = (id: string) => {
    setMeetingActionItems((prev) => prev.filter((a) => a.id !== id));
  };

  const handlePushActionsToBacklog = () => {
    const pending = meetingActionItems.filter((a) => a.text.trim() && !a.backlogTaskId);
    if (pending.length === 0) {
      setError("No new action items to push — add items or they may already be in the backlog.");
      return;
    }
    void run(async () => {
      const existing = await fetchTasks();
      let working = [...existing];
      const idByAction = new Map<string, string>();
      for (const action of pending) {
        const id = nextTaskId(working);
        const owner = PARTNER_ASSIGNEES.includes(action.owner as PartnerAssignee)
          ? action.owner
          : "";
        const task: GyshTask = {
          id,
          description: action.text.trim(),
          category: "admin_ops",
          priority: "P2",
          status: "not_started",
          assignBy: authUser?.name || "Partner Agenda",
          assignedTo: UNASSIGNED_OWNER,
          dateAssigned: todayMMDDYY(),
          dueDate: "",
          dateCompleted: "",
          notes: [
            "From Partner Agenda",
            meetingDate ? `Meeting ${meetingDate}` : "",
            owner ? `Suggested owner: ${owner}` : "",
            "(Backlog stays Unassigned until moved into a sprint)",
          ]
            .filter(Boolean)
            .join(" · "),
          sprint: BACKLOG_SPRINT,
          tinaDone: false,
          evelynDone: false,
          attachments: [],
        };
        working = [...working, task];
        idByAction.set(action.id, id);
      }
      await persistTasks(working);
      const nextActions = meetingActionItems.map((a) => {
        const tid = idByAction.get(a.id);
        return tid ? { ...a, backlogTaskId: tid } : a;
      });
      setMeetingActionItems(nextActions);
      return saveAgendaPreview({
        meetingDate,
        meetingTime,
        meetingTimezone,
        invited: parseNameCsv(invitedText),
        attended: parseNameCsv(attendedText),
        meetingNotes,
        meetingMinutesUrl: meetingMinutesUrl.trim(),
        meetingActionItems: nextActions.filter((a) => a.text.trim()),
      });
    }, `Added ${pending.length} backlog task${pending.length === 1 ? "" : "s"} (suggested owners in notes).`);
  };

  const assignGlobalSortOrders = (
    drafts: Record<string, PreviewDraft>,
    orderedIdsByCategory: Partial<Record<AgendaCategory, string[]>>,
  ): Record<string, PreviewDraft> => {
    const next = { ...drafts };
    let order = 1;
    for (const cat of AGENDA_CATEGORY_ORDER) {
      const ids =
        orderedIdsByCategory[cat] ||
        Object.entries(next)
          .filter(([, d]) => d.category === cat)
          .sort((a, b) => a[1].sortOrder - b[1].sortOrder || a[0].localeCompare(b[0]))
          .map(([id]) => id);
      for (const id of ids) {
        if (!next[id]) continue;
        next[id] = { ...next[id], sortOrder: order++ };
      }
    }
    return next;
  };

  const moveItemInCategory = (category: AgendaCategory, itemId: string, delta: -1 | 1) => {
    setPreviewDrafts((prev) => {
      const ids = Object.entries(prev)
        .filter(([, d]) => d.category === category)
        .sort((a, b) => a[1].sortOrder - b[1].sortOrder || a[0].localeCompare(b[0]))
        .map(([id]) => id);
      const fromIdx = ids.indexOf(itemId);
      const toIdx = fromIdx + delta;
      if (fromIdx < 0 || toIdx < 0 || toIdx >= ids.length) return prev;
      const nextIds = [...ids];
      const [moved] = nextIds.splice(fromIdx, 1);
      nextIds.splice(toIdx, 0, moved);
      return assignGlobalSortOrders(prev, { [category]: nextIds });
    });
  };

  const openEmailComposer = () => {
    if (!data) return;
    const draft = buildPartnerAgendaEmailDraft(data);
    setEmailTo(draft.to.join(", "));
    setEmailSubject(draft.subject);
    // Always convert bare https://… text into real <a href> anchors for editor + send.
    setEmailBody(toEditorHtml(draft.bodyText));
    setEmailModalError("");
    setEmailModalNotice("");
    setEmailEditorKey((k) => k + 1);
    setEmailOpen(true);
  };

  const handleSaveEmailDraft = () => {
    const subject = emailSubject.trim();
    const bodyText = linkifyEmailHtml(emailBody.trim());
    if (!subject || isEmptyEmailHtml(bodyText)) {
      setEmailModalError("Subject and message are required to save.");
      return;
    }
    setEmailBody(bodyText);
    setEmailModalError("");
    setEmailModalNotice("");
    setBusy(true);
    void (async () => {
      try {
        const payload = await saveAgendaMeta({
          inviteSubject: subject,
          inviteBody: bodyText,
        });
        setData(payload);
        syncMeetingFields(payload);
        setEmailModalNotice("Email subject and message saved (links clickable).");
        setNotice("Email subject and message saved.");
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : "Could not save email draft.";
        setEmailModalError(msg);
        setError(msg);
      } finally {
        setBusy(false);
      }
    })();
  };

  const buildInvitePdfAttachment = async () => {
    if (!data?.agenda) throw new Error("Agenda is not ready.");
    return partnerAgendaPdfBase64({
      agenda: {
        ...data.agenda,
        meetingNotes,
        meetingActionItems: meetingActionItems.filter((a) => a.text.trim()),
        updatedByName:
          String(data.agenda.updatedByName || "").trim() ||
          String(authUser?.name || authUser?.email || "").trim() ||
          data.agenda.createdByName,
      },
      items: data.items || [],
      drafts: previewDrafts,
      meetingDate,
      meetingTime,
      meetingTimezone,
      invitedText,
      attendedText,
      meetingMinutes: clampAgendaMeetingMinutes(meetingMinutes),
      finalized: false,
    });
  };

  const handleSendEmail = (opts?: { testOnly?: boolean }) => {
    const testOnly = Boolean(opts?.testOnly);
    const testTo = String(authUser?.email || "").trim();
    if (testOnly && !testTo) {
      setEmailModalError("Sign in with an email address to send a test.");
      return;
    }
    if (!emailSubject.trim() || isEmptyEmailHtml(emailBody)) {
      setEmailModalError("Subject and message are required.");
      return;
    }

    setEmailModalError("");
    setEmailModalNotice("");
    setEmailSending(true);
    setBusy(true);
    void (async () => {
      try {
        setEmailModalNotice(
          testOnly
            ? "Building draft agenda PDF and sending test email to you…"
            : "Building draft agenda PDF and sending to admins…",
        );
        const pdf = await buildInvitePdfAttachment();
        if (!pdf.base64 || pdf.base64.length < 40) {
          throw new Error("Could not build the agenda PDF attachment.");
        }
        const linkedBody = linkifyEmailHtml(emailBody.trim());
        setEmailBody(linkedBody);
        const payload = await sendPartnerAgendaInvite({
          subject: emailSubject.trim(),
          bodyText: linkedBody,
          headline: "Partner Agenda",
          subhead: "Tentative agenda attached — add your items before we sync.",
          pdfBase64: pdf.base64,
          pdfFilename: pdf.filename,
          testOnly,
          testTo: testOnly ? testTo : undefined,
        });
        setData(payload);
        syncMeetingFields(payload);
        syncPreviewDrafts(payload);

        const results = Array.isArray(payload.results) ? payload.results : [];
        const failed = results.filter((r) => !r.ok);
        if (payload.ok === false || failed.length > 0) {
          const detail =
            failed.map((r) => `${r.email}: ${r.error || "failed"}`).join(" · ") ||
            "Email send failed.";
          throw new Error(detail);
        }
        const delivered = results.map((r) => r.email).filter(Boolean).join(", ") || testTo;
        const okMsg = testOnly
          ? `Test email sent only to you (${delivered}) with draft agenda PDF attached.`
          : `Email sent to admins (${delivered}) with draft agenda PDF attached.`;
        setEmailModalNotice(okMsg);
        setNotice(okMsg);
        if (!testOnly) setEmailOpen(false);
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Could not send email.";
        setEmailModalError(msg);
        setError(msg);
      } finally {
        setEmailSending(false);
        setBusy(false);
      }
    })();
  };

  const agendaItems: AgendaItem[] = data?.items || [];
  /** Same global order as Configure Agenda (previewDrafts.sortOrder). */
  const sortedAgendaItems = useMemo(
    () =>
      agendaItems
        .slice()
        .sort(
          (a, b) =>
            (previewDrafts[a.id]?.sortOrder ?? a.sortOrder ?? 0) -
              (previewDrafts[b.id]?.sortOrder ?? b.sortOrder ?? 0) ||
            String(a.createdAt || a.id).localeCompare(String(b.createdAt || b.id)),
        ),
    [agendaItems, previewDrafts],
  );
  const suggestedItems: AgendaItem[] = (data?.suggestedItems || data?.taskItems || []).filter(
    (it) => {
      const taskId = it.sourceId || it.id.replace(/^suggest-task:/, "");
      return !hiddenSuggestTaskIds.has(taskId);
    },
  );
  const hiddenSuggestCount = (data?.suggestedItems || data?.taskItems || []).filter((it) => {
    const taskId = it.sourceId || it.id.replace(/^suggest-task:/, "");
    return hiddenSuggestTaskIds.has(taskId);
  }).length;

  const hideSuggestTask = (taskId: string) => {
    setHiddenSuggestTaskIds((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      persistHiddenSuggestTaskIds(next);
      return next;
    });
    setNotice(`Hidden Task ${taskId} from Agenda suggestions.`);
  };

  const clearHiddenSuggestTasks = () => {
    setHiddenSuggestTaskIds(new Set());
    persistHiddenSuggestTaskIds(new Set());
    setNotice("Restored hidden Task List suggestions.");
  };
  const agendaReady = Boolean(data?.agenda?.active);
  const showForceBanner = (forceTimePicks || data?.needsTimePicks) && mustPick;

  const moveAgendaListItem = (itemId: string, delta: -1 | 1) => {
    if (meetingLive) return;
    const ids = sortedAgendaItems.map((it) => it.id);
    const fromIdx = ids.indexOf(itemId);
    const toIdx = fromIdx + delta;
    if (fromIdx < 0 || toIdx < 0 || toIdx >= ids.length) return;
    const nextIds = [...ids];
    const [moved] = nextIds.splice(fromIdx, 1);
    nextIds.splice(toIdx, 0, moved);
    const items = nextIds.map((id, idx) => ({ id, sortOrder: idx + 1 }));
    setPreviewDrafts((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const next = { ...prev };
      nextIds.forEach((id, idx) => {
        if (next[id]) next[id] = { ...next[id], sortOrder: idx + 1 };
      });
      return next;
    });
    void run(() => saveAgendaPreview({ items }), "Agenda order updated.");
  };

  const previewSections = useMemo(() => {
    const labels =
      data?.categories?.reduce(
        (acc, c) => {
          acc[c.id] = c.label;
          return acc;
        },
        {} as Record<string, string>,
      ) || AGENDA_CATEGORY_LABELS;
    // Tina's first N items (agenda order) live in reserved Tina slots — keep them out of category lists.
    const tinaSlotIds = new Set(
      agendaItems
        .slice()
        .sort(
          (a, b) =>
            (previewDrafts[a.id]?.sortOrder ?? a.sortOrder ?? 0) -
              (previewDrafts[b.id]?.sortOrder ?? b.sortOrder ?? 0) ||
            String(a.createdAt || a.id).localeCompare(String(b.createdAt || b.id)),
        )
        .filter((it) => isTinaAgendaAuthor(it.authorName))
        .slice(0, AGENDA_TINA_PLACEHOLDER_COUNT)
        .map((it) => it.id),
    );
    return AGENDA_CATEGORY_ORDER.map((cat) => {
      const items = agendaItems
        .filter(
          (it) =>
            !tinaSlotIds.has(it.id) &&
            (previewDrafts[it.id]?.category || it.category || "other") === cat,
        )
        .slice()
        .sort((a, b) => {
          const da = previewDrafts[a.id]?.sortOrder ?? a.sortOrder ?? 0;
          const db = previewDrafts[b.id]?.sortOrder ?? b.sortOrder ?? 0;
          if (da !== db) return da - db;
          return (a.importance ?? 3) - (b.importance ?? 3);
        });
      return {
        id: cat,
        label: labels[cat] || AGENDA_CATEGORY_LABELS[cat],
        items,
      };
    }).filter((s) => s.items.length > 0);
  }, [agendaItems, data?.categories, previewDrafts]);

  const agendaSchedule = useMemo(() => {
    if (!data?.agenda) return null;
    return buildAgendaSchedule({
      agenda: data.agenda,
      items: agendaItems,
      drafts: previewDrafts,
      meetingDate,
      meetingTime,
      meetingTimezone,
      invitedText,
      attendedText,
      meetingMinutes: clampAgendaMeetingMinutes(meetingMinutes),
    });
  }, [
    data?.agenda,
    agendaItems,
    previewDrafts,
    meetingDate,
    meetingTime,
    meetingTimezone,
    meetingMinutes,
    invitedText,
    attendedText,
  ]);
  const timedSlots = agendaSchedule?.itemSlots ?? new Map();

  /** Agenda items in timed schedule order (matches Configure / PDF). */
  const scheduleOrderedItems = useMemo(() => {
    return sortedAgendaItems
      .slice()
      .sort((a, b) => {
        const sa = timedSlots.get(a.id);
        const sb = timedSlots.get(b.id);
        if (sa && sb && sa.startMin !== sb.startMin) return sa.startMin - sb.startMin;
        if (sa && !sb) return -1;
        if (!sa && sb) return 1;
        return (
          (previewDrafts[a.id]?.sortOrder ?? a.sortOrder ?? 0) -
            (previewDrafts[b.id]?.sortOrder ?? b.sortOrder ?? 0) ||
          a.id.localeCompare(b.id)
        );
      });
  }, [sortedAgendaItems, timedSlots, previewDrafts]);

  const meetingWindowLabel = formatAgendaMeetingWindow({
    meetingDate,
    meetingTime: meetingTime || DEFAULT_AGENDA_MEETING_TIME,
    durationMinutes: clampAgendaMeetingMinutes(meetingMinutes),
  });

  /** Ordered sections for the live timer (discussion topics + Tina slots + Q&A). */
  const meetingTimeline = useMemo((): MeetingTimelineEntry[] => {
    if (!agendaSchedule) return [];
    const byId = new Map<
      string,
      { id: string; title: string; startMin: number; endMin: number; durationMin: number; kind: MeetingTimelineEntry["kind"] }
    >();
    for (const it of scheduleOrderedItems) {
      const slot = timedSlots.get(it.id);
      if (!slot) continue;
      const title =
        displayAgendaBody(it.body)
          .split(/\r?\n/)
          .map((l) => l.trim())
          .find(Boolean) || "Topic";
      byId.set(it.id, {
        id: it.id,
        title: title.length > 72 ? `${title.slice(0, 69)}…` : title,
        startMin: slot.startMin,
        endMin: slot.endMin,
        durationMin: slot.durationMin,
        kind: slot.kind || "item",
      });
    }
    for (const slot of agendaSchedule.reserved) {
      if (byId.has(slot.id)) continue;
      byId.set(slot.id, {
        id: slot.id,
        title:
          slot.title ||
          (slot.kind === "qa" ? "Q & A" : "Tina slot"),
        startMin: slot.startMin,
        endMin: slot.endMin,
        durationMin: slot.durationMin,
        kind: slot.kind || "tina-placeholder",
      });
    }
    const ordered = [...byId.values()].sort((a, b) => a.startMin - b.startMin);
    const base = ordered[0]?.startMin ?? 0;
    return ordered.map((s) => ({
      id: s.id,
      title: s.title,
      kind: s.kind,
      startOffsetSec: (s.startMin - base) * 60,
      endOffsetSec: (s.endMin - base) * 60,
      durationSec: Math.max(1, s.durationMin) * 60,
    }));
  }, [agendaSchedule, scheduleOrderedItems, timedSlots]);

  const meetingElapsedSec =
    meetingLive && meetingStartedAt != null
      ? Math.max(0, (meetingNow - meetingStartedAt) / 1000)
      : 0;
  const meetingTotalSec =
    meetingTimeline.length > 0
      ? meetingTimeline[meetingTimeline.length - 1]!.endOffsetSec
      : clampAgendaMeetingMinutes(meetingMinutes) * 60;

  const currentSection = useMemo(() => {
    if (!meetingTimeline.length) return null;
    if (meetingElapsedSec < meetingTimeline[0]!.startOffsetSec) return meetingTimeline[0]!;
    for (const s of meetingTimeline) {
      if (meetingElapsedSec < s.endOffsetSec) return s;
    }
    return meetingTimeline[meetingTimeline.length - 1]!;
  }, [meetingTimeline, meetingElapsedSec]);

  const sectionRemainingSec = currentSection
    ? Math.max(0, currentSection.endOffsetSec - meetingElapsedSec)
    : 0;
  const sectionWarnLevel =
    meetingLive && currentSection
      ? sectionRemainingSec <= 15
        ? "15"
        : sectionRemainingSec <= 45
          ? "45"
          : null
      : null;

  // Tick the live clock while the meeting is running.
  useEffect(() => {
    if (!meetingLive || meetingStartedAt == null) return;
    const id = window.setInterval(() => setMeetingNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [meetingLive, meetingStartedAt]);

  // 45s / 15s warnings before the next section.
  useEffect(() => {
    if (!meetingLive || !currentSection) return;
    const key = currentSection.id;
    const w = sectionWarnRef.current[key] || {};
    if (sectionRemainingSec <= 45 && sectionRemainingSec > 15 && !w.warned45) {
      w.warned45 = true;
      sectionWarnRef.current[key] = w;
      setNotice(
        `45 seconds left in “${currentSection.title}” — wrap up and get ready for the next section.`,
      );
    }
    if (sectionRemainingSec <= 15 && sectionRemainingSec > 0 && !w.warned15) {
      w.warned15 = true;
      sectionWarnRef.current[key] = w;
      setNotice(
        `15 seconds left in “${currentSection.title}” — move to the next section now.`,
      );
    }
  }, [meetingLive, currentSection, sectionRemainingSec]);

  // During a live meeting, keep the assignable action list built from topic capture fields.
  useEffect(() => {
    if (!meetingLive) return;
    const timer = window.setTimeout(() => {
      const combined = [meetingNotes.trim(), topicCaptureText(previewDrafts)]
        .filter(Boolean)
        .join("\n");
      if (!combined.trim()) return;
      setMeetingActionItems((prev) => notesToActionItems(combined, prev));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [meetingLive, meetingNotes, previewDrafts]);

  const beginMeetingClock = (mode: "start" | "restart") => {
    const now = Date.now();
    setMeetingLive(true);
    setMeetingStartedAt(now);
    setMeetingNow(now);
    sectionWarnRef.current = {};
    setError("");
    setNotice(
      mode === "restart"
        ? "Meeting restarted — timer reset to the first section. Your notes are kept; use Save notes anytime."
        : "Meeting started — timer running. Add notes under each topic and click Save notes anytime.",
    );
    void run(
      () =>
        saveAgendaMeta({
          meetingDate,
          meetingTime: meetingTime || DEFAULT_AGENDA_MEETING_TIME,
          meetingTimezone: meetingTimezone || DEFAULT_AGENDA_TIMEZONE,
          invited: parseNameCsv(invitedText),
          attended: parseNameCsv(attendedText),
        }),
      undefined,
    );
  };

  const handleStartMeeting = () => beginMeetingClock("start");

  const handleRestartMeeting = () => {
    if (
      !window.confirm(
        "Restart the meeting timer from the first section? Discussion notes, questions, and action items will be kept.",
      )
    ) {
      return;
    }
    beginMeetingClock("restart");
  };

  const handleEndMeeting = () => {
    setMeetingLive(false);
    setMeetingStartedAt(null);
    handleSavePreviewProgress();
    setNotice("Meeting ended — notes, questions, and action items saved.");
  };

  const handleOpenAgendaPdf = () => {
    if (!data?.agenda) return;
    setError("");
    // Reserve the tab in the click gesture so the branded viewer (Close + Print) opens reliably.
    const reservedTab = reservePdfTab();
    void (async () => {
      try {
        const viewerName = String(authUser?.name || authUser?.email || "").trim();
        await openPartnerAgendaPdf(
          {
            agenda: {
              ...data.agenda!,
              meetingNotes,
              meetingActionItems: meetingActionItems.filter((a) => a.text.trim()),
              // Prefer saved last editor; fall back to current viewer for draft PDF.
              updatedByName:
                String(data.agenda!.updatedByName || "").trim() ||
                viewerName ||
                data.agenda!.createdByName,
            },
            items: agendaItems,
            drafts: previewDrafts,
            meetingDate,
            meetingTime,
            meetingTimezone,
            invitedText,
            attendedText,
            meetingMinutes: clampAgendaMeetingMinutes(meetingMinutes),
          },
          reservedTab,
        );
      } catch (e) {
        try {
          reservedTab?.close();
        } catch {
          /* ignore */
        }
        setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Could not open PDF.");
      }
    })();
  };

  return (
    <div className="agenda-page" data-testid="admin-agenda-page">
      <BusyOverlay
        active={busy || loading || emailSending}
        message={
          loading
            ? "Loading agenda…"
            : emailSending
              ? "Sending email…"
              : "Saving…"
        }
      />

      <div
        className="glass"
        style={{
          padding: 24,
          borderRadius: 16,
          background: "linear-gradient(135deg, rgba(215,198,151,0.55), #fff)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1, minWidth: 220 }}>
            <h2
              style={{
                fontSize: "1.5rem",
                color: "var(--charcoal)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: 0,
              }}
            >
              <ClipboardList size={22} style={{ color: "var(--bronze)" }} />
              Partner Agenda
            </h2>
            <p className="admin-page-lede">
              Add, edit, or delete <strong>your own</strong> items. Tasks/tests with &quot;Agenda&quot; in
              the description or Notes appear automatically (read-only). Blocks are at least{" "}
              {MIN_AGENDA_DURATION_MINUTES} minutes.
            </p>
            {data?.agenda && (
              <p className="admin-page-lede" style={{ marginTop: 6, fontSize: "0.92rem" }}>
                Created by {data.agenda.createdByName}
                {data.agenda.inviteSentAt
                  ? ` · Invite emailed ${new Date(data.agenda.inviteSentAt).toLocaleString()}`
                  : ""}
              </p>
            )}
          </div>
          {agendaReady && !showForceBanner && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-outline"
                data-testid="agenda-email-admins"
                onClick={openEmailComposer}
                style={{ gap: 8 }}
              >
                <Mail size={16} /> Email Admins Agenda
              </button>
              <button
                type="button"
                className="btn btn-outline"
                data-testid="agenda-open-pdf"
                onClick={handleOpenAgendaPdf}
                style={{ gap: 8 }}
              >
                <FileText size={16} /> View/Print Agenda
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-testid="agenda-preview-toggle"
                onClick={() => setPreviewMode((v) => !v)}
                style={{ gap: 8 }}
              >
                {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                {previewMode ? "Order Agenda" : "Configure Agenda"}
              </button>
            </div>
          )}
        </div>
      </div>

      {agendaReady && !showForceBanner && (
        <section
          className="glass"
          data-testid="agenda-add-item"
          style={{ padding: 18, borderRadius: 14 }}
        >
          <h3
            style={{
              margin: "0 0 8px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--charcoal)",
            }}
          >
            <Plus size={18} style={{ color: "var(--crimson)" }} /> Add Agenda Item
          </h3>
          <p style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: "0.95rem" }}>
            Type your topic and add it to the shared agenda. Items from Tina fill her{" "}
            {AGENDA_TINA_PLACEHOLDER_COUNT} reserved {AGENDA_TINA_PLACEHOLDER_MINUTES}-minute slots.
          </p>
          <div className="agenda-add-row">
            <textarea
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              placeholder="Add your agenda item…"
              rows={3}
              data-testid="agenda-new-item"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddItem}
              disabled={!draftBody.trim()}
              style={{ gap: 8 }}
              data-testid="agenda-add-item-btn"
            >
              <Plus size={16} /> Add Agenda Item
            </button>
          </div>
        </section>
      )}

      {showForceBanner && (
        <div
          className="glass"
          data-testid="agenda-force-time-picks"
          style={{
            padding: 18,
            borderRadius: 14,
            border: "1px solid rgba(155,47,40,0.35)",
            background: "rgba(155,47,40,0.08)",
          }}
        >
          <strong style={{ color: "#9B2F28", fontSize: "1.15rem" }}>
            It&apos;s time we meet.
          </strong>
          <p style={{ margin: "8px 0 0", color: "var(--charcoal)", fontSize: "1.05rem" }}>
            I need you to give me at least {MIN_AGENDA_TIME_PICKS} suggested meeting dates
            (up to {MAX_AGENDA_TIME_PICKS}) before you can use anything else in the app. Each
            meeting block should be at least {MIN_AGENDA_DURATION_MINUTES} minutes. Save your
            times below — the rest of the site stays locked until you do.
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(155,47,40,0.1)",
            border: "1px solid rgba(155,47,40,0.35)",
            color: "#9B2F28",
          }}
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.35)",
            color: "var(--charcoal)",
          }}
        >
          {notice}
        </div>
      )}

      {!agendaReady && !loading && !showForceBanner && (
        <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
          <p style={{ marginTop: 0 }}>
            No interactive agenda yet. Create one from here or use{" "}
            <strong>Create interactive agenda</strong> on Schedule &amp; Plan.
          </p>
          <button type="button" className="btn btn-primary" onClick={handleCreate} style={{ gap: 8 }}>
            <ListPlus size={16} /> Create interactive agenda
          </button>
        </div>
      )}

      {agendaReady && previewMode && !showForceBanner && (
        <section className="glass agenda-preview" data-testid="agenda-preview" style={{ padding: 22, borderRadius: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: "var(--charcoal)" }}>Meeting preview</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-outline"
                data-testid="agenda-preview-open-pdf"
                onClick={handleOpenAgendaPdf}
                style={{ gap: 8 }}
              >
                <FileText size={14} /> View/Print Agenda
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-testid="agenda-save-preview-progress"
                onClick={handleSavePreviewProgress}
                style={{ gap: 8 }}
              >
                <Save size={14} /> Save preview progress
              </button>
              <button type="button" className="btn btn-outline" onClick={handleSaveMeetingHeader} style={{ gap: 8 }}>
                <Save size={14} /> Save header only
              </button>
            </div>
          </div>
          <p style={{ marginTop: 0, color: "var(--text-primary)" }}>
            Set meeting header, categories, importance, and order here. Capture discussion notes,
            questions, and action items on the main Agenda page during{" "}
            <strong>Start Meeting</strong>. Timing: {clampAgendaMeetingMinutes(meetingMinutes)}-minute
            meeting · topics share{" "}
            {agendaSchedule?.discussionMinutes ??
              clampAgendaMeetingMinutes(meetingMinutes) -
                AGENDA_QA_MINUTES -
                AGENDA_TINA_PLACEHOLDER_COUNT * AGENDA_TINA_PLACEHOLDER_MINUTES}{" "}
            min, then {AGENDA_TINA_PLACEHOLDER_COUNT}×{AGENDA_TINA_PLACEHOLDER_MINUTES}-minute Tina
            slots, then {AGENDA_QA_MINUTES} min Q&amp;A.
          </p>
          <div className="agenda-preview-header">
            <label>
              <span>Date</span>
              <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
            </label>
            <label>
              <span>Time</span>
              <AmPmTimeSelect
                value={meetingTime}
                onChange={setMeetingTime}
                testId="agenda-meeting-time-ampm"
              />
            </label>
            <label>
              <span>Duration (minutes)</span>
              <input
                type="number"
                min={MIN_AGENDA_MEETING_MINUTES}
                max={MAX_AGENDA_MEETING_MINUTES}
                step={5}
                value={meetingMinutes}
                onChange={(e) =>
                  setMeetingMinutes(
                    clampAgendaMeetingMinutes(
                      e.target.value === "" ? AGENDA_MEETING_MINUTES : e.target.value,
                    ),
                  )
                }
                onBlur={() => setMeetingMinutes((m) => clampAgendaMeetingMinutes(m))}
                data-testid="agenda-meeting-minutes"
                aria-label="Meeting duration in minutes"
              />
            </label>
            <label>
              <span>Time zone</span>
              <select
                value={meetingTimezone}
                onChange={(e) => setMeetingTimezone(e.target.value)}
                data-testid="agenda-meeting-timezone"
              >
                {AGENDA_TIMEZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              <span>Invited</span>
              <input
                type="text"
                value={invitedText}
                onChange={(e) => setInvitedText(e.target.value)}
                placeholder="Tina, Evelyn, Lyriq, Candace"
              />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              <span>Attended</span>
              <input
                type="text"
                value={attendedText}
                onChange={(e) => setAttendedText(e.target.value)}
                placeholder="Who showed up…"
              />
            </label>
          </div>

          {previewSections.length === 0 ? (
            <p style={{ color: "var(--text-primary)" }}>No agenda items yet — add some, then preview.</p>
          ) : (
            previewSections.map((section) => (
              <div key={section.id} className="agenda-preview-section">
                <h4>{section.label}</h4>
                <ul className="agenda-item-list">
                  {section.items.map((it, idx) => {
                    const draft = previewDrafts[it.id];
                    if (!draft) return null;
                    const canMoveUp = idx > 0;
                    const canMoveDown = idx < section.items.length - 1;
                    return (
                      <li key={it.id} className="agenda-item agenda-preview-item">
                        <div className="agenda-reorder-btns">
                          <button
                            type="button"
                            className="btn btn-outline agenda-reorder-btn"
                            aria-label="Move up"
                            title="Move up"
                            disabled={!canMoveUp}
                            onClick={() => moveItemInCategory(section.id, it.id, -1)}
                          >
                            <ChevronUp size={18} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline agenda-reorder-btn"
                            aria-label="Move down"
                            title="Move down"
                            disabled={!canMoveDown}
                            onClick={() => moveItemInCategory(section.id, it.id, 1)}
                          >
                            <ChevronDown size={18} />
                          </button>
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                          <div>
                            {timedSlots.get(it.id) && (
                              <div className="agenda-item-time" data-testid={`agenda-item-time-${it.id}`}>
                                <CalendarClock size={14} aria-hidden />
                                <span>{timedSlots.get(it.id)!.rangeLabel}</span>
                              </div>
                            )}
                            {agendaItemSourceRef(it) && (
                              <span className="agenda-source-badge" data-testid={`agenda-source-${it.id}`}>
                                {agendaItemSourceLabel(it)}
                              </span>
                            )}
                            <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{displayAgendaBody(it.body)}</p>
                            <span className="agenda-item-meta">
                              {agendaItemSourceLabel(it) || it.authorName}
                            </span>
                          </div>
                          <div className="agenda-preview-fields">
                            <label>
                              <span>Category</span>
                              <select
                                value={draft.category}
                                onChange={(e) =>
                                  updateDraft(it.id, {
                                    category: e.target.value as AgendaCategory,
                                  })
                                }
                              >
                                {AGENDA_CATEGORY_ORDER.map((c) => (
                                  <option key={c} value={c}>
                                    {AGENDA_CATEGORY_LABELS[c]}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              <span>Importance (1 = highest)</span>
                              <select
                                value={String(draft.importance)}
                                onChange={(e) =>
                                  updateDraft(it.id, { importance: Number(e.target.value) })
                                }
                              >
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <p className="agenda-item-meta" style={{ margin: 0 }}>
                            Capture discussion notes, questions, and action items on the main Agenda
                            page during the meeting (Start Meeting).
                          </p>
                        </div>
                        {(it.source === "task" || it.source === "test") && it.sourceId && (
                          <div className="agenda-item-actions">
                            <button type="button" className="btn btn-outline" onClick={() => openSource(it)}>
                              <ExternalLink size={14} /> Open
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}

          {agendaSchedule && agendaSchedule.reserved.length > 0 && (
            <div className="agenda-preview-section" data-testid="agenda-reserved-slots">
              <h4>Tina slots &amp; Q&amp;A</h4>
              <ul className="agenda-item-list">
                {agendaSchedule.reserved.map((slot) => {
                  const filledItem =
                    slot.kind === "tina-placeholder" && slot.filled
                      ? agendaItems.find((it) => it.id === slot.id)
                      : undefined;
                  return (
                    <li key={slot.id} className="agenda-item agenda-reserved-item">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="agenda-item-time">
                          <CalendarClock size={14} aria-hidden />
                          <span>{slot.rangeLabel}</span>
                        </div>
                        {slot.kind === "tina-placeholder" && slot.filled ? (
                          <>
                            <span className="agenda-source-badge">Tina slot</span>
                            <p
                              style={{
                                margin: "0 0 4px",
                                fontWeight: 650,
                                color: "var(--charcoal)",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {filledItem ? displayAgendaBody(filledItem.body) : slot.title}
                            </p>
                            <span className="agenda-item-meta">
                              {filledItem?.authorName || "Tina"} · fills reserved placeholder
                            </span>
                          </>
                        ) : (
                          <>
                            <p style={{ margin: "0 0 4px", fontWeight: 650, color: "var(--charcoal)" }}>
                              {slot.title}
                            </p>
                            <span className="agenda-item-meta">
                              {slot.kind === "tina-placeholder"
                                ? "Empty 4-minute slot — waiting for Tina to add an agenda item"
                                : `Last ${AGENDA_QA_MINUTES} minutes — closing Q & A`}
                            </span>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

        </section>
      )}

      {emailOpen && (
        <div className="agenda-email-modal" role="dialog" aria-modal="true" aria-labelledby="agenda-email-title">
          <div className="agenda-email-modal__panel glass">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <h3 id="agenda-email-title" style={{ margin: 0, color: "var(--charcoal)" }}>
                Email Admins Agenda
              </h3>
              <button type="button" className="btn btn-outline" onClick={() => setEmailOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <p style={{ color: "var(--text-primary)", marginBottom: 0 }}>
              Edit the subject and message, then <strong>Save</strong> to keep your draft. The
              tentative agenda PDF is attached automatically when you send.{" "}
              <strong>Send test email</strong> goes only to{" "}
              <strong>{authUser?.email || "your signed-in account"}</strong>.
            </p>
            {emailModalError ? (
              <div
                data-testid="agenda-email-error"
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(155,47,40,0.1)",
                  border: "1px solid rgba(155,47,40,0.35)",
                  color: "#9B2F28",
                }}
              >
                {emailModalError}
              </div>
            ) : null}
            {emailModalNotice ? (
              <div
                data-testid="agenda-email-notice"
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.35)",
                  color: "var(--charcoal)",
                }}
              >
                {emailModalNotice}
              </div>
            ) : null}
            <label className="agenda-email-field">
              <span>To (live send)</span>
              <input type="text" value={emailTo} readOnly />
            </label>
            <label className="agenda-email-field">
              <span>Test send goes to</span>
              <input type="text" value={authUser?.email || "(not signed in)"} readOnly />
            </label>
            <label className="agenda-email-field">
              <span>Subject</span>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                data-testid="agenda-email-subject"
                disabled={emailSending}
              />
            </label>
            <div className="agenda-email-field">
              <span>Message</span>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                Format with bold, italic, font, size, color, lists, and links. Use{" "}
                <strong>Auto-link</strong> so URLs show in red. In this admin preview, browser
                security may block clicks — copy/paste the URLs from{" "}
                <strong>Links in this email</strong> (or from the preview text) into a new tab. In
                the real inbox, recipients can click the links normally.
              </p>
              <RichTextEmailEditor
                key={`agenda-email-editor-${emailEditorKey}`}
                value={emailBody}
                onChange={setEmailBody}
                disabled={emailSending}
                testId="agenda-email-body"
                placeholder="Write your agenda email…"
              />
              {!isEmptyEmailHtml(emailBody) && (
                <div className="agenda-email-preview" data-testid="agenda-email-preview">
                  {extractHttpUrls(emailBody).length > 0 && (
                    <div className="agenda-email-link-list" data-testid="agenda-email-link-list">
                      <div className="agenda-email-preview__label">
                        Links in this email — copy/paste if Open is blocked
                      </div>
                      <p
                        style={{
                          margin: "0 14px 8px",
                          fontSize: "0.85rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        Select a URL below and copy it (Ctrl+C), then paste into your browser address
                        bar. Recipients of the sent email can click links normally.
                      </p>
                      <ul>
                        {extractHttpUrls(emailBody).map((url) => (
                          <li key={url}>
                            <button
                              type="button"
                              className="btn btn-outline agenda-email-open-link"
                              onClick={() => {
                                void navigator.clipboard?.writeText(url).then(
                                  () => setEmailModalNotice(`Copied: ${url}`),
                                  () => window.location.assign(url),
                                );
                              }}
                            >
                              Copy
                            </button>
                            <span className="agenda-email-open-url" title="Select and copy">
                              {url}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="agenda-email-preview__label">
                    Email preview (look only — copy URLs from the list above)
                  </div>
                  <div
                    className="agenda-email-preview__body"
                    dangerouslySetInnerHTML={{ __html: htmlForVisualEmailPreview(emailBody) }}
                    onClick={(e) => {
                      const t = e.target;
                      const el =
                        t instanceof Element ? t : t instanceof Node ? t.parentElement : null;
                      const hit = el?.closest?.("[data-href]") as HTMLElement | null;
                      const href = hit?.getAttribute("data-href")?.trim();
                      if (!href || !/^https?:\/\//i.test(href)) return;
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.assign(href);
                    }}
                  />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setEmailOpen(false)}
                disabled={emailSending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleSaveEmailDraft}
                disabled={!emailSubject.trim() || isEmptyEmailHtml(emailBody) || emailSending}
                style={{ gap: 8 }}
                data-testid="agenda-email-save"
              >
                <Save size={16} /> Save
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleSendEmail({ testOnly: true })}
                disabled={
                  !emailSubject.trim() ||
                  isEmptyEmailHtml(emailBody) ||
                  !authUser?.email ||
                  emailSending
                }
                style={{ gap: 8 }}
                data-testid="agenda-email-send-test"
                title={authUser?.email ? `Send test only to ${authUser.email}` : "Sign in required"}
              >
                <Mail size={16} /> {emailSending ? "Sending…" : "Send test email"}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSendEmail()}
                disabled={!emailSubject.trim() || isEmptyEmailHtml(emailBody) || emailSending}
                style={{ gap: 8 }}
                data-testid="agenda-email-send"
              >
                <Mail size={16} /> Send to Admins
              </button>
            </div>
          </div>
        </div>
      )}

      {/* While locked for meeting dates, show only the time-pick form first. */}
      {(agendaReady || showForceBanner) && showForceBanner && (
        <section
          className="glass"
          style={{ padding: 20, borderRadius: 14, border: "2px solid rgba(155,47,40,0.35)" }}
          data-testid="agenda-time-picks"
        >
          <h3
            style={{
              margin: "0 0 8px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--charcoal)",
            }}
          >
            <CalendarClock size={18} style={{ color: "var(--bronze)" }} /> Your meeting times
          </h3>
          <p style={{ marginTop: 0, color: "var(--text-primary)" }}>
            Choose {MIN_AGENDA_TIME_PICKS}–{MAX_AGENDA_TIME_PICKS} start times. Each meeting is
            expected to last at least {MIN_AGENDA_DURATION_MINUTES} minutes.
          </p>
          <div className="agenda-pick-grid">
            {pickInputs.map((value, idx) => (
              <label key={idx} className="agenda-pick-field">
                <span>Option {idx + 1}</span>
                <input
                  type="datetime-local"
                  value={value}
                  onChange={(e) => {
                    const next = [...pickInputs];
                    next[idx] = e.target.value;
                    setPickInputs(next);
                  }}
                  data-testid={`agenda-pick-${idx}`}
                />
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {pickInputs.length < MAX_AGENDA_TIME_PICKS && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPickInputs((prev) => [...prev, ""])}
              >
                <Plus size={14} /> Add another option
              </button>
            )}
            {pickInputs.length > MIN_AGENDA_TIME_PICKS && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPickInputs((prev) => prev.slice(0, -1))}
              >
                Remove last
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSavePicks}
              style={{ gap: 8 }}
              data-testid="agenda-save-picks"
            >
              <Save size={16} /> Save my times
            </button>
          </div>
        </section>
      )}

      {agendaReady && !showForceBanner && !previewMode && (
        <>
          <section
            className="glass"
            style={{
              padding: 20,
              borderRadius: 14,
              border: meetingLive ? "2px solid rgba(155,47,40,0.45)" : undefined,
              background: meetingLive ? "rgba(155,47,40,0.04)" : undefined,
            }}
            data-testid="agenda-run-meeting"
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, color: "var(--charcoal)" }}>
                  <ListPlus size={18} style={{ color: "var(--crimson)" }} /> Agenda items
                </h3>
                <p style={{ margin: "6px 0 0", color: "var(--text-primary)", fontSize: "0.95rem" }}>
                  Meeting: <strong>{meetingWindowLabel}</strong>
                  {meetingLive ? " · LIVE" : ""}
                </p>
                <p style={{ margin: "4px 0 0", color: "var(--text-primary)", fontSize: "0.9rem" }}>
                  Order and times match Configure Agenda (start {meetingTime || DEFAULT_AGENDA_MEETING_TIME}{" "}
                  {meetingTimezone || DEFAULT_AGENDA_TIMEZONE} ·{" "}
                  {clampAgendaMeetingMinutes(meetingMinutes)} min).
                </p>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 8,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Duration
                  <input
                    type="number"
                    min={MIN_AGENDA_MEETING_MINUTES}
                    max={MAX_AGENDA_MEETING_MINUTES}
                    step={5}
                    value={meetingMinutes}
                    onChange={(e) =>
                      setMeetingMinutes(
                        clampAgendaMeetingMinutes(
                          e.target.value === "" ? AGENDA_MEETING_MINUTES : e.target.value,
                        ),
                      )
                    }
                    onBlur={() => setMeetingMinutes((m) => clampAgendaMeetingMinutes(m))}
                    disabled={meetingLive}
                    data-testid="agenda-meeting-minutes-run"
                    aria-label="Meeting duration in minutes"
                    style={{ width: 88 }}
                  />
                  <span style={{ fontWeight: 500 }}>min</span>
                </label>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  data-testid="agenda-save-notes"
                  onClick={handleSavePreviewProgress}
                  style={{ gap: 8 }}
                  title="Save discussion notes, questions, and action items"
                >
                  <Save size={16} /> Save notes
                </button>
                {!meetingLive ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-testid="agenda-start-meeting"
                    onClick={handleStartMeeting}
                    style={{ gap: 8 }}
                  >
                    <Play size={16} /> Start Meeting
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline"
                      data-testid="agenda-restart-meeting"
                      onClick={handleRestartMeeting}
                      style={{ gap: 8 }}
                    >
                      <RotateCcw size={16} /> Restart Meeting
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      data-testid="agenda-end-meeting"
                      onClick={handleEndMeeting}
                      style={{ gap: 8 }}
                    >
                      <Square size={16} /> End Meeting
                    </button>
                  </>
                )}
                <button type="button" className="btn btn-outline" data-testid="agenda-open-picker" onClick={() => setPickerOpen((o) => !o)} style={{ gap: 8 }} disabled={meetingLive}>
                  <ListChecks size={16} />
                  {pickerOpen ? "Hide task/test picker" : "Select tasks or tests"}
                </button>
              </div>
            </div>

            {meetingLive && currentSection && (
              <div
                className={`agenda-meeting-timer${sectionWarnLevel ? ` agenda-meeting-timer--warn-${sectionWarnLevel}` : ""}`}
                data-testid="agenda-meeting-timer"
                role="status"
                aria-live="polite"
              >
                <div className="agenda-meeting-timer__main">
                  <Timer size={18} aria-hidden />
                  <div>
                    <div className="agenda-meeting-timer__label">Now discussing</div>
                    <div className="agenda-meeting-timer__title">{currentSection.title}</div>
                  </div>
                </div>
                <div className="agenda-meeting-timer__stats">
                  <div>
                    <span className="agenda-meeting-timer__label">Section left</span>
                    <strong data-testid="agenda-section-remaining">
                      {formatTimerMmSs(sectionRemainingSec)}
                    </strong>
                    {sectionWarnLevel === "45" && (
                      <em data-testid="agenda-warn-45">45s warning</em>
                    )}
                    {sectionWarnLevel === "15" && (
                      <em data-testid="agenda-warn-15">15s — move on</em>
                    )}
                  </div>
                  <div>
                    <span className="agenda-meeting-timer__label">Meeting elapsed</span>
                    <strong data-testid="agenda-meeting-elapsed">
                      {formatTimerMmSs(meetingElapsedSec)} / {formatTimerMmSs(meetingTotalSec)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {pickerOpen && (
              <div className="agenda-picker" data-testid="agenda-picker" style={{ marginBottom: 16, padding: 12, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                  <button type="button" className={`nav-link-btn${pickerKind === "task" ? " active" : ""}`} onClick={() => { setPickerKind("task"); setSelectedKeys(new Set()); }}>
                    <ListChecks size={14} /> Tasks
                  </button>
                  <button type="button" className={`nav-link-btn${pickerKind === "test" ? " active" : ""}`} onClick={() => { setPickerKind("test"); setSelectedKeys(new Set()); }}>
                    <FlaskConical size={14} /> Tests
                  </button>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 180 }}>
                    <Search size={14} aria-hidden />
                    <input type="search" value={pickerQuery} onChange={(e) => setPickerQuery(e.target.value)} placeholder={pickerKind === "task" ? "Search tasks…" : "Search tests…"} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border-color)" }} />
                  </label>
                  <button type="button" className="btn btn-primary" onClick={handleAddSelected} disabled={selectedKeys.size === 0} style={{ gap: 8 }} data-testid="agenda-add-selected">
                    <Plus size={14} /> Add selected ({selectedKeys.size})
                  </button>
                </div>
                <ul className="agenda-item-list">
                  {pickerRows.length === 0 && <li className="agenda-item agenda-item--empty">No matching {pickerKind}s.</li>}
                  {pickerRows.map((row) => (
                    <li key={row.key} className="agenda-item">
                      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", width: "100%" }}>
                        <input type="checkbox" checked={selectedKeys.has(row.key)} onChange={() => toggleSelected(row.key)} />
                        <span>
                          <strong>{row.label}</strong>
                          <em style={{ display: "block", fontStyle: "normal", whiteSpace: "pre-wrap", color: "var(--text-primary)", fontSize: "0.9rem" }}>{row.body}</em>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className="agenda-run-tabs"
              role="tablist"
              aria-label="Agenda views"
              style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "4px 0 16px" }}
              data-testid="agenda-run-tabs"
            >
              <button
                type="button"
                role="tab"
                aria-selected={agendaRunTab === "agenda"}
                className={`btn ${agendaRunTab === "agenda" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setAgendaRunTab("agenda")}
                data-testid="agenda-run-tab-agenda"
                style={{ gap: 8 }}
              >
                <ClipboardList size={14} /> Agenda
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={agendaRunTab === "notes"}
                className={`btn ${agendaRunTab === "notes" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setAgendaRunTab("notes")}
                data-testid="agenda-run-tab-notes"
                style={{ gap: 8 }}
              >
                <FileText size={14} /> Meeting notes
              </button>
            </div>

            {agendaRunTab === "notes" && (
              <div
                className="agenda-preview-section"
                data-testid="agenda-run-notes-panel"
                role="tabpanel"
                style={{ marginBottom: 16 }}
              >
                <h4 style={{ margin: "0 0 8px", color: "var(--bronze)" }}>Meeting notes</h4>
                <p style={{ marginTop: 0, color: "var(--text-primary)" }}>
                  Capture general notes here during the meeting. Topic-level notes stay on each Agenda
                  item. Paste a link to the formal minutes below when you have one.
                </p>
                <label className="agenda-meeting-notes-label" style={{ display: "block", marginBottom: 14 }}>
                  <span>General meeting notes</span>
                  <textarea
                    value={meetingNotes}
                    rows={8}
                    placeholder="Overall notes — one thought per line…"
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    data-testid="agenda-run-meeting-notes"
                    style={{ width: "100%" }}
                  />
                </label>
                <label
                  className="agenda-meeting-notes-label"
                  style={{ display: "block", marginBottom: 12 }}
                  data-testid="agenda-meeting-minutes-link-box"
                >
                  <span>Link to meeting minutes</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      type="url"
                      value={meetingMinutesUrl}
                      onChange={(e) => setMeetingMinutesUrl(e.target.value)}
                      placeholder="https://… (Google Doc, Notion, etc.)"
                      data-testid="agenda-meeting-minutes-url"
                      style={{ flex: "1 1 240px", minWidth: 200 }}
                    />
                    {/^https?:\/\//i.test(meetingMinutesUrl.trim()) && (
                      <a
                        href={meetingMinutesUrl.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        data-testid="agenda-open-meeting-minutes"
                        style={{ gap: 8, textDecoration: "none" }}
                      >
                        <ExternalLink size={14} /> Open minutes
                      </a>
                    )}
                  </div>
                </label>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSavePreviewProgress}
                  style={{ gap: 8 }}
                  data-testid="agenda-save-meeting-notes-tab"
                >
                  <Save size={14} /> Save notes &amp; minutes link
                </button>
              </div>
            )}

            {agendaRunTab === "agenda" && (suggestedItems.length > 0 || hiddenSuggestCount > 0) && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "var(--text-primary)",
                    }}
                  >
                    From Task List (description or Notes contain &quot;Agenda&quot;)
                  </div>
                  {hiddenSuggestCount > 0 && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={clearHiddenSuggestTasks}
                      style={{ gap: 6, fontSize: "0.85rem" }}
                      data-testid="agenda-restore-hidden-suggest"
                    >
                      <Eye size={14} /> Show {hiddenSuggestCount} hidden
                    </button>
                  )}
                </div>
                {suggestedItems.length === 0 ? (
                  <p style={{ margin: 0, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                    All matching Task List suggestions are hidden.
                  </p>
                ) : (
                  <ul className="agenda-item-list">
                    {suggestedItems.map((it) => {
                      const taskId = it.sourceId || it.id.replace(/^suggest-task:/, "");
                      return (
                        <li key={it.id} className="agenda-item agenda-item--task">
                          <Lock size={14} aria-hidden />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span className="agenda-source-badge">
                              {agendaItemSourceLabel({ source: "task", sourceId: taskId }) ||
                                `Task ${taskId}`}
                            </span>
                            <p style={{ whiteSpace: "pre-wrap", margin: "0 0 4px" }}>
                              {displayAgendaBody(it.body)}
                            </p>
                            <span className="agenda-item-meta">{it.authorName}</span>
                          </div>
                          <div className="agenda-item-actions agenda-item-actions--suggest">
                            {onOpenTask && (
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => onOpenTask(taskId)}
                              >
                                <ExternalLink size={14} /> Open
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() =>
                                void run(
                                  () =>
                                    linkAgendaItems([
                                      {
                                        sourceKind: "task",
                                        sourceId: taskId,
                                        body: displayAgendaBody(it.body),
                                      },
                                    ]),
                                  "Added task to agenda.",
                                )
                              }
                            >
                              <Plus size={14} /> Add
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={() => hideSuggestTask(taskId)}
                              title="Remove from this list — will not be suggested for the Agenda"
                              aria-label={`Remove Task ${taskId} from Agenda suggestions`}
                              data-testid={`agenda-hide-suggest-${taskId}`}
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {agendaRunTab === "agenda" && (
            <>
            <ul className="agenda-item-list">
              {scheduleOrderedItems.length === 0 && (
                <li className="agenda-item agenda-item--empty">No partner-added items yet.</li>
              )}
              {scheduleOrderedItems.map((it, idx) => {
                const slot = timedSlots.get(it.id);
                const draft = previewDrafts[it.id];
                const isCurrent = meetingLive && currentSection?.id === it.id;
                return (
                <li
                  key={it.id}
                  className={`agenda-item${meetingLive ? " agenda-item--live" : ""}${isCurrent ? " agenda-item--current" : ""}`}
                  data-current-section={isCurrent ? "true" : undefined}
                >
                  {editingId === it.id && !meetingLive ? (
                    <div className="agenda-item-edit" style={{ flex: 1 }}>
                      <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={3} style={{ width: "100%" }} />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button type="button" className="btn btn-primary" onClick={handleSaveEdit}><Save size={14} /> Save</button>
                        <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setEditBody(""); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {!meetingLive && (
                        <div className="agenda-reorder-btns">
                          <button
                            type="button"
                            className="btn btn-outline agenda-reorder-btn"
                            aria-label="Move up"
                            title="Move up"
                            disabled={idx === 0}
                            onClick={() => moveAgendaListItem(it.id, -1)}
                          >
                            <ChevronUp size={18} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline agenda-reorder-btn"
                            aria-label="Move down"
                            title="Move down"
                            disabled={idx >= scheduleOrderedItems.length - 1}
                            onClick={() => moveAgendaListItem(it.id, 1)}
                          >
                            <ChevronDown size={18} />
                          </button>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {slot && (
                          <div className="agenda-item-time">
                            <CalendarClock size={14} aria-hidden />
                            <span>{slot.rangeLabel}</span>
                          </div>
                        )}
                        {agendaItemSourceRef(it) && (
                          <span className="agenda-source-badge">{agendaItemSourceLabel(it)}</span>
                        )}
                        {slot?.kind === "tina-placeholder" && (
                          <span className="agenda-source-badge">Tina slot</span>
                        )}
                        <p
                          style={{
                            whiteSpace: "pre-wrap",
                            margin:
                              slot ||
                              agendaItemSourceRef(it) ||
                              isTinaAgendaAuthor(it.authorName)
                                ? "0 0 4px"
                                : undefined,
                          }}
                        >
                          {displayAgendaBody(it.body)}
                        </p>
                        <span className="agenda-item-meta">
                          {agendaItemSourceLabel(it) || it.authorName}
                          {slot?.kind === "tina-placeholder" ? " · Tina placeholder" : ""}
                          {it.updatedAt ? ` · ${new Date(it.updatedAt).toLocaleString()}` : ""}
                          {it.canEdit ? "" : " · view only"}
                        </span>
                        {draft && (
                          <div
                            className="agenda-preview-fields"
                            style={{ marginTop: 10 }}
                            data-testid={`agenda-topic-capture-${it.id}`}
                          >
                            <label style={{ gridColumn: "1 / -1" }}>
                              <span>Discussion notes{meetingLive ? " (live)" : ""}</span>
                              <textarea
                                value={draft.discussionNotes}
                                rows={meetingLive ? 3 : 2}
                                placeholder="Notes while this topic is discussed…"
                                onChange={(e) =>
                                  updateDraft(it.id, { discussionNotes: e.target.value })
                                }
                                data-testid={`agenda-topic-notes-${it.id}`}
                              />
                            </label>
                            <label style={{ gridColumn: "1 / -1" }}>
                              <span>Questions (one per line)</span>
                              <textarea
                                value={draft.questionsText}
                                rows={2}
                                placeholder="Questions that come up…"
                                onChange={(e) =>
                                  updateDraft(it.id, { questionsText: e.target.value })
                                }
                                data-testid={`agenda-topic-questions-${it.id}`}
                              />
                            </label>
                            <label style={{ gridColumn: "1 / -1" }}>
                              <span>Action items (one per line)</span>
                              <textarea
                                value={draft.actionItemsText}
                                rows={2}
                                placeholder="Action items from this topic…"
                                onChange={(e) =>
                                  updateDraft(it.id, { actionItemsText: e.target.value })
                                }
                                data-testid={`agenda-topic-actions-${it.id}`}
                              />
                            </label>
                            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button
                                type="button"
                                className="btn btn-primary"
                                style={{ gap: 8 }}
                                onClick={handleSavePreviewProgress}
                                data-testid={`agenda-topic-save-${it.id}`}
                              >
                                <Save size={14} /> Save notes
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {!meetingLive && (
                        <div className="agenda-item-actions">
                          {(it.source === "task" || it.source === "test") && it.sourceId && (
                            <button type="button" className="btn btn-outline" onClick={() => openSource(it)}>
                              <ExternalLink size={14} /> Open
                            </button>
                          )}
                          {it.canEdit && it.source === "user" && (
                            <button type="button" className="btn btn-outline" onClick={() => { setEditingId(it.id); setEditBody(it.body); }} aria-label="Edit agenda item">
                              <Pencil size={14} />
                            </button>
                          )}
                          {it.canEdit && (
                            <button type="button" className="btn btn-outline" onClick={() => handleDelete(it.id)} aria-label="Delete agenda item">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </li>
                );
              })}
            </ul>

            {agendaSchedule && agendaSchedule.reserved.length > 0 && (
              <div style={{ marginTop: 16 }} data-testid="agenda-run-reserved">
                <h4 style={{ margin: "0 0 8px", color: "var(--bronze)" }}>Tina slots &amp; Q&amp;A</h4>
                <ul className="agenda-item-list">
                  {agendaSchedule.reserved.map((slot) => (
                    <li
                      key={slot.id}
                      className={`agenda-item agenda-reserved-item${meetingLive && currentSection?.id === slot.id ? " agenda-item--current" : ""}`}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="agenda-item-time">
                          <CalendarClock size={14} aria-hidden />
                          <span>{slot.rangeLabel}</span>
                        </div>
                        <p style={{ margin: "0 0 4px", fontWeight: 650 }}>
                          {slot.kind === "qa"
                            ? "Q & A"
                            : slot.filled
                              ? `Tina: ${slot.title}`
                              : slot.title}
                        </p>
                        <span className="agenda-item-meta">
                          {slot.kind === "qa"
                            ? "Closing questions and wrap-up"
                            : slot.filled
                              ? "Filled from Tina’s agenda items"
                              : "Waiting for Tina to add a topic"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(meetingLive || meetingActionItems.length > 0) && (
              <div className="agenda-preview-section" style={{ marginTop: 20 }} data-testid="agenda-run-actions">
                <h4 style={{ margin: "0 0 8px", color: "var(--bronze)" }}>Action items (from notes)</h4>
                <p style={{ marginTop: 0, color: "var(--text-primary)" }}>
                  Built from topic notes and the Meeting notes tab. Assign owners, then send to backlog
                  when ready.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleTranslateNotesToActions}
                    style={{ gap: 8 }}
                  >
                    <ListChecks size={14} /> Refresh from notes
                  </button>
                  <button type="button" className="btn btn-outline" onClick={addBlankMeetingAction} style={{ gap: 8 }}>
                    <Plus size={14} /> Add action item
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handlePushActionsToBacklog}
                    style={{ gap: 8 }}
                  >
                    <ListPlus size={14} /> Send to backlog
                  </button>
                </div>
                <div className="agenda-action-list">
                  <div className="agenda-action-list__head">
                    <span>Action item</span>
                    <span>Assign to</span>
                    <span>Done</span>
                    <span />
                  </div>
                  {meetingActionItems.length === 0 ? (
                    <p className="agenda-item-meta" style={{ margin: "8px 0 0" }}>
                      No action items yet — add topic notes above.
                    </p>
                  ) : (
                    meetingActionItems.map((action) => (
                      <div key={action.id} className="agenda-action-row">
                        <input
                          type="text"
                          value={action.text}
                          placeholder="Action item…"
                          onChange={(e) => updateMeetingAction(action.id, { text: e.target.value })}
                        />
                        <select
                          value={action.owner || ""}
                          onChange={(e) => updateMeetingAction(action.id, { owner: e.target.value })}
                          aria-label="Assign action item"
                        >
                          <option value="">Unassigned</option>
                          {PARTNER_ASSIGNEES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        <label className="agenda-action-done">
                          <input
                            type="checkbox"
                            checked={action.done}
                            onChange={(e) => updateMeetingAction(action.id, { done: e.target.checked })}
                          />
                        </label>
                        <div className="agenda-action-row__meta">
                          {action.backlogTaskId ? (
                            <span className="agenda-item-meta">{action.backlogTaskId}</span>
                          ) : null}
                          <button
                            type="button"
                            className="btn btn-outline"
                            aria-label="Remove action item"
                            onClick={() => removeMeetingAction(action.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            </>
            )}
          </section>

          <section
            className="glass"
            style={{ padding: 20, borderRadius: 14 }}
            data-testid="agenda-time-picks"
          >
            <h3
              style={{
                margin: "0 0 8px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "var(--charcoal)",
              }}
            >
              <CalendarClock size={18} style={{ color: "var(--bronze)" }} /> Your meeting times
            </h3>
            <p style={{ marginTop: 0, color: "var(--text-primary)" }}>
              Choose {MIN_AGENDA_TIME_PICKS}–{MAX_AGENDA_TIME_PICKS} start times. Each meeting is
              expected to last at least {MIN_AGENDA_DURATION_MINUTES} minutes.
            </p>
            <div className="agenda-pick-grid">
              {pickInputs.map((value, idx) => (
                <label key={idx} className="agenda-pick-field">
                  <span>Option {idx + 1}</span>
                  <input
                    type="datetime-local"
                    value={value}
                    onChange={(e) => {
                      const next = [...pickInputs];
                      next[idx] = e.target.value;
                      setPickInputs(next);
                    }}
                    data-testid={`agenda-pick-${idx}`}
                  />
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {pickInputs.length < MAX_AGENDA_TIME_PICKS && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setPickInputs((prev) => [...prev, ""])}
                >
                  <Plus size={14} /> Add another option
                </button>
              )}
              {pickInputs.length > MIN_AGENDA_TIME_PICKS && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setPickInputs((prev) => prev.slice(0, -1))}
                >
                  Remove last
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSavePicks}
                style={{ gap: 8 }}
                data-testid="agenda-save-picks"
              >
                <Save size={16} /> Save my times
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => void reload()}
              >
                Refresh
              </button>
            </div>
          </section>

          <section className="glass" style={{ padding: 20, borderRadius: 14 }}>
            <h3
              style={{
                margin: "0 0 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "var(--charcoal)",
              }}
            >
              <Users size={18} style={{ color: "var(--accent-emerald)" }} /> Times we all selected
            </h3>
            {picksByPerson.length === 0 ? (
              <p style={{ margin: 0, color: "var(--text-primary)" }}>
                No meeting times submitted yet.
              </p>
            ) : (
              <div className="agenda-picks-board">
                {picksByPerson.map((person) => (
                  <article key={person.key} className="agenda-picks-person">
                    <strong>{person.name}</strong>
                    <ul>
                      {person.picks.map((p) => (
                        <li key={p.id}>
                          {formatAgendaSlot(p.startsAt, p.durationMinutes)}
                          {p.isMine ? " · you" : ""}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <style>{`
        .agenda-page { display: flex; flex-direction: column; gap: 16px; }
        .agenda-item-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .agenda-item {
          display: flex; justify-content: space-between; gap: 12px; align-items: flex-start;
          padding: 12px 14px; border-radius: 12px; border: 1px solid var(--border-color);
          background: rgba(255,255,255,0.55);
        }
        .agenda-item--task { align-items: flex-start; }
        .agenda-item--task svg { margin-top: 3px; color: var(--bronze); flex-shrink: 0; }
        .agenda-item p { margin: 0 0 4px; color: var(--charcoal); white-space: pre-wrap; }
        .agenda-item-meta { font-size: 0.85rem; color: var(--text-primary); }
        .agenda-item-actions { display: flex; gap: 6px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
        .agenda-item-actions--suggest { max-width: 100%; }
        .agenda-item--empty { color: var(--text-primary); border-style: dashed; }
        .agenda-add-row { margin-top: 16px; display: flex; flex-direction: column; gap: 10px; }
        .agenda-add-row textarea, .agenda-item-edit textarea {
          width: 100%; border-radius: 10px; border: 1px solid var(--border-color);
          padding: 10px 12px; font: inherit; color: var(--charcoal); background: #fff;
        }
        .agenda-pick-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;
        }
        .agenda-pick-field { display: flex; flex-direction: column; gap: 6px; font-size: 0.9rem; color: var(--charcoal); }
        .agenda-pick-field input {
          border-radius: 10px; border: 1px solid var(--border-color); padding: 8px 10px; font: inherit;
        }
        .agenda-picks-board {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;
        }
        .agenda-picks-person {
          padding: 14px; border-radius: 12px; border: 1px solid var(--border-color);
          background: rgba(255,255,255,0.6);
        }
        .agenda-picks-person ul { margin: 8px 0 0; padding-left: 18px; color: var(--charcoal); }
        .agenda-picks-person li { margin-bottom: 4px; }
        .agenda-preview-header {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;
          margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);
        }
        .agenda-preview-header label, .agenda-preview-fields label {
          display: flex; flex-direction: column; gap: 6px; font-size: 0.9rem; color: var(--charcoal);
        }
        .agenda-preview-header input, .agenda-preview-header select,
        .agenda-preview-fields textarea, .agenda-preview-fields select {
          border-radius: 10px; border: 1px solid var(--border-color); padding: 8px 10px; font: inherit;
          background: #fff; color: var(--charcoal);
        }
        .agenda-ampm-time {
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
        }
        .agenda-ampm-time select {
          border-radius: 10px; border: 1px solid var(--border-color); padding: 8px 10px; font: inherit;
          background: #fff; color: var(--charcoal);
        }
        .agenda-preview-section { margin-top: 18px; }
        .agenda-preview-section h4 {
          margin: 0 0 10px; font-size: 1.1rem; color: var(--bronze);
          border-bottom: 1px solid rgba(155,47,40,0.2); padding-bottom: 6px;
        }
        .agenda-preview-item { flex-direction: row; align-items: flex-start; }
        .agenda-item { align-items: flex-start; }
        .agenda-item-time {
          display: inline-flex; align-items: center; gap: 6px;
          margin-bottom: 6px; padding: 4px 10px; border-radius: 999px;
          background: rgba(155,47,40,0.1); color: #9B2F28;
          font-size: 0.85rem; font-weight: 600; width: fit-content;
        }
        .agenda-source-badge {
          display: inline-flex; align-items: center;
          margin: 0 0 6px; padding: 3px 10px; border-radius: 8px;
          background: rgba(45,42,38,0.08); color: var(--charcoal);
          font-size: 0.85rem; font-weight: 750; letter-spacing: 0.02em;
          width: fit-content;
        }
        .agenda-reserved-item {
          border: 1px dashed rgba(155,47,40,0.35);
          background: rgba(215,198,151,0.2);
        }
        .agenda-meeting-notes-label {
          display: flex; flex-direction: column; gap: 6px;
          font-size: 0.9rem; color: var(--charcoal);
        }
        .agenda-meeting-notes-label textarea {
          border-radius: 10px; border: 1px solid var(--border-color);
          padding: 10px 12px; font: inherit; background: #fff; color: var(--charcoal);
          width: 100%;
        }
        .agenda-action-list { margin-top: 8px; }
        .agenda-action-list__head, .agenda-action-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 140px 52px auto;
          gap: 8px;
          align-items: center;
        }
        .agenda-action-list__head {
          font-size: 0.8rem; font-weight: 700; color: var(--bronze);
          margin-bottom: 6px;
        }
        .agenda-action-row {
          margin-bottom: 8px;
        }
        .agenda-action-row input[type="text"],
        .agenda-action-row select {
          border-radius: 10px; border: 1px solid var(--border-color);
          padding: 8px 10px; font: inherit; background: #fff; color: var(--charcoal);
          width: 100%;
        }
        .agenda-action-done {
          display: flex; justify-content: center; align-items: center;
        }
        .agenda-action-row__meta {
          display: flex; align-items: center; gap: 6px; justify-content: flex-end;
        }
        @media (max-width: 720px) {
          .agenda-action-list__head { display: none; }
          .agenda-action-row {
            grid-template-columns: 1fr;
            padding: 10px; border: 1px solid var(--border-color); border-radius: 12px;
            background: rgba(255,255,255,0.55);
          }
        }
        .agenda-reorder-btns {
          display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; margin-top: 2px;
        }
        .agenda-reorder-btn {
          padding: 4px 6px !important; min-width: 0; line-height: 1;
        }
        .agenda-reorder-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .agenda-preview-fields {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;
        }
        .agenda-email-modal {
          position: fixed; inset: 0; z-index: 220; background: rgba(20, 16, 12, 0.45);
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .agenda-email-modal__panel {
          width: min(720px, 100%); max-height: min(90vh, 900px); overflow: auto;
          padding: 20px; border-radius: 14px; display: flex; flex-direction: column; gap: 12px;
        }
        .agenda-email-field { display: flex; flex-direction: column; gap: 6px; font-size: 0.9rem; color: var(--charcoal); }
        .agenda-email-field input, .agenda-email-field textarea {
          border-radius: 10px; border: 1px solid var(--border-color); padding: 8px 10px; font: inherit;
          background: #fff; color: var(--charcoal);
        }
        .agenda-email-preview {
          margin-top: 8px; border: 1px solid var(--border-color); border-radius: 10px;
          background: #fffdf8; overflow: hidden;
        }
        .agenda-email-preview__label {
          padding: 8px 12px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.04em;
          text-transform: uppercase; color: var(--text-primary);
          border-bottom: 1px solid var(--border-color); background: #faf6ee;
        }
        .agenda-email-preview__body {
          padding: 12px 14px; font-size: 0.95rem; line-height: 1.55; color: var(--charcoal);
          max-height: 220px; overflow: auto;
        }
        .agenda-email-preview__body a,
        .agenda-email-preview-linkish {
          color: #9B2F28 !important; font-weight: 700; text-decoration: underline !important;
          word-break: break-all;
        }
        .agenda-email-link-list ul {
          list-style: none; margin: 0; padding: 10px 14px 14px;
        }
        .agenda-email-link-list li {
          display: flex; gap: 10px; align-items: flex-start; margin: 0 0 10px;
        }
        .agenda-email-open-link {
          flex-shrink: 0; padding: 4px 10px !important; font-size: 0.85rem;
        }
        .agenda-email-open-url {
          color: #9B2F28; font-weight: 650; word-break: break-all; font-size: 0.9rem; padding-top: 4px;
        }
        .agenda-email-preview-linkish { cursor: pointer; }
        .agenda-meeting-timer {
          display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between; align-items: center;
          margin: 0 0 16px; padding: 14px 16px; border-radius: 12px;
          border: 1px solid rgba(155,47,40,0.28); background: rgba(155,47,40,0.07);
        }
        .agenda-meeting-timer--warn-45 {
          border-color: rgba(180,120,20,0.55); background: rgba(255,196,0,0.16);
        }
        .agenda-meeting-timer--warn-15 {
          border-color: rgba(155,47,40,0.65); background: rgba(155,47,40,0.16);
          animation: agenda-timer-pulse 1s ease-in-out infinite;
        }
        @keyframes agenda-timer-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(155,47,40,0.25); }
          50% { box-shadow: 0 0 0 6px rgba(155,47,40,0.08); }
        }
        .agenda-meeting-timer__main { display: flex; gap: 10px; align-items: flex-start; min-width: 0; }
        .agenda-meeting-timer__label {
          display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em;
          color: var(--text-primary); margin-bottom: 2px;
        }
        .agenda-meeting-timer__title {
          font-weight: 700; color: var(--charcoal); line-height: 1.3;
        }
        .agenda-meeting-timer__stats {
          display: flex; gap: 18px; flex-wrap: wrap; align-items: flex-start;
        }
        .agenda-meeting-timer__stats strong {
          display: block; font-size: 1.35rem; font-variant-numeric: tabular-nums; color: var(--charcoal);
        }
        .agenda-meeting-timer__stats em {
          display: block; margin-top: 2px; font-style: normal; font-size: 0.85rem; font-weight: 700;
          color: #9B2F28;
        }
        .agenda-item--current {
          outline: 2px solid rgba(155,47,40,0.55);
          background: rgba(155,47,40,0.06);
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}
