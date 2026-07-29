import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  ClipboardList,
  ExternalLink,
  FlaskConical,
  ListChecks,
  ListPlus,
  Lock,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { ApiError } from "../../lib/api";
import type { AuthUser } from "../../lib/auth";
import { BusyOverlay } from "../WaitFeedback";
import {
  MAX_AGENDA_TIME_PICKS,
  MIN_AGENDA_DURATION_MINUTES,
  MIN_AGENDA_TIME_PICKS,
  createPartnerAgenda,
  deleteAgendaItem,
  fetchPartnerAgenda,
  formatAgendaSlot,
  isoToLocalInput,
  linkAgendaItems,
  localInputToIso,
  mustPickAgendaTimes,
  saveAgendaItem,
  saveAgendaTimePicks,
  type AgendaItem,
  type AgendaTimePick,
  type PartnerAgendaPayload,
} from "../../lib/gysh-partner-agenda";
import { fetchTasks, type GyshTask } from "../../lib/gysh-tasks";
import { TEST_CASES } from "../../lib/gysh-test-plan";

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

  const mustPick = mustPickAgendaTimes(authUser);

  const reload = async () => {
    const payload = await fetchPartnerAgenda();
    setData(payload);
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
        .map((t) => ({
          key: `task:${t.id}`,
          sourceKind: "task" as const,
          sourceId: t.id,
          label: t.id,
          body: [t.description, t.notes].filter(Boolean).join("\n").trim() || t.id,
        }));
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

  const agendaItems: AgendaItem[] = data?.items || [];
  const suggestedItems: AgendaItem[] = data?.suggestedItems || data?.taskItems || [];
  const agendaReady = Boolean(data?.agenda?.active);
  const showForceBanner = (forceTimePicks || data?.needsTimePicks) && mustPick;

  return (
    <div className="agenda-page" data-testid="admin-agenda-page">
      <BusyOverlay active={busy || loading} message={loading ? "Loading agenda…" : "Saving…"} />

      <div
        className="glass"
        style={{
          padding: 24,
          borderRadius: 16,
          background: "linear-gradient(135deg, rgba(215,198,151,0.55), #fff)",
        }}
      >
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
        <p style={{ color: "var(--text-primary)", fontSize: "1rem", marginTop: 8 }}>
          Shared meeting agenda for the partners. Add, edit, or delete <strong>your own</strong>{" "}
          items. Tasks with &quot;Agenda&quot; in the description <strong>or Notes</strong> appear
          here automatically (read-only). Meeting blocks are at least{" "}
          {MIN_AGENDA_DURATION_MINUTES} minutes.
        </p>
        {data?.agenda && (
          <p style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginTop: 6 }}>
            Created by {data.agenda.createdByName}
            {data.agenda.inviteSentAt
              ? ` · Invite emailed ${new Date(data.agenda.inviteSentAt).toLocaleString()}`
              : ""}
          </p>
        )}
      </div>

      {showForceBanner && (
        <div
          className="glass"
          data-testid="agenda-force-time-picks"
          style={{
            padding: 16,
            borderRadius: 14,
            border: "1px solid rgba(155,47,40,0.35)",
            background: "rgba(155,47,40,0.08)",
          }}
        >
          <strong style={{ color: "#9B2F28" }}>Action required</strong>
          <p style={{ margin: "6px 0 0", color: "var(--charcoal)" }}>
            Pick {MIN_AGENDA_TIME_PICKS}–{MAX_AGENDA_TIME_PICKS} meeting times that work for you
            before leaving this page. Each meeting is expected to last at least{" "}
            {MIN_AGENDA_DURATION_MINUTES} minutes.
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

      {!agendaReady && !loading && (
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

      {agendaReady && (
        <>
          <section className="glass" style={{ padding: 20, borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, color: "var(--charcoal)" }}>
                <ListPlus size={18} style={{ color: "var(--crimson)" }} /> Agenda items
              </h3>
              <button type="button" className="btn btn-outline" data-testid="agenda-open-picker" onClick={() => setPickerOpen((o) => !o)} style={{ gap: 8 }}>
                <ListChecks size={16} />
                {pickerOpen ? "Hide task/test picker" : "Select tasks or tests"}
              </button>
            </div>

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

            {suggestedItems.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-primary)", marginBottom: 8 }}>
                  From Task List (description or Notes contain &quot;Agenda&quot;)
                </div>
                <ul className="agenda-item-list">
                  {suggestedItems.map((it) => {
                    const taskId = it.sourceId || it.id.replace(/^suggest-task:/, "");
                    return (
                      <li key={it.id} className="agenda-item agenda-item--task">
                        <Lock size={14} aria-hidden />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ whiteSpace: "pre-wrap" }}>{it.body}</p>
                          <span className="agenda-item-meta">Task {taskId} · {it.authorName}</span>
                        </div>
                        <div className="agenda-item-actions">
                          {onOpenTask && (
                            <button type="button" className="btn btn-outline" onClick={() => onOpenTask(taskId)}>
                              <ExternalLink size={14} /> Open
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                              void run(
                                () => linkAgendaItems([{ sourceKind: "task", sourceId: taskId, body: it.body }]),
                                "Added task to agenda.",
                              )
                            }
                          >
                            <Plus size={14} /> Add
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <ul className="agenda-item-list">
              {agendaItems.length === 0 && (
                <li className="agenda-item agenda-item--empty">No partner-added items yet.</li>
              )}
              {agendaItems.map((it) => (
                <li key={it.id} className="agenda-item">
                  {editingId === it.id ? (
                    <div className="agenda-item-edit">
                      <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={3} style={{ width: "100%" }} />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button type="button" className="btn btn-primary" onClick={handleSaveEdit}><Save size={14} /> Save</button>
                        <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setEditBody(""); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ whiteSpace: "pre-wrap" }}>{it.body}</p>
                        <span className="agenda-item-meta">
                          {it.source === "task" ? `Task ${it.sourceId}` : it.source === "test" ? `Test ${it.sourceId}` : it.authorName}
                          {it.updatedAt ? ` · ${new Date(it.updatedAt).toLocaleString()}` : ""}
                          {it.canEdit ? "" : " · view only"}
                        </span>
                      </div>
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
                    </>
                  )}
                </li>
              ))}
            </ul>

            <div className="agenda-add-row">
              <textarea value={draftBody} onChange={(e) => setDraftBody(e.target.value)} placeholder="Add your agenda item…" rows={3} data-testid="agenda-new-item" />
              <button type="button" className="btn btn-primary" onClick={handleAddItem} disabled={!draftBody.trim()} style={{ gap: 8 }}>
                <Plus size={16} /> Add my item
              </button>
            </div>
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
        .agenda-item-actions { display: flex; gap: 6px; flex-shrink: 0; }
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
      `}</style>
    </div>
  );
}
