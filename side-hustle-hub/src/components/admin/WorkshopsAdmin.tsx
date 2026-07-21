import { useEffect, useState } from "react";
import { Mic2, Save } from "lucide-react";
import { BusyOverlay, WaitIndicator, WaitLabel } from "../WaitFeedback";
import {
  AUDIENCE_LABELS,
  STATUS_LABELS,
  WORKSHOP_FORMATS,
  fetchWorkshops,
  persistWorkshops,
  type GuestSpeaker,
  type Workshop,
  type WorkshopAudience,
  type WorkshopStatus,
} from "../../lib/workshops";
import { ApiError } from "../../lib/api";

function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function WorkshopsAdmin() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [speakers, setSpeakers] = useState<GuestSpeaker[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchWorkshops();
      setWorkshops(data.workshops);
      setSpeakers(data.speakers);
      setSelectedId((prev) => prev ?? data.workshops[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load workshops.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const selected = workshops.find((w) => w.id === selectedId) ?? workshops[0] ?? null;

  const patchSelected = (patch: Partial<Workshop>) => {
    if (!selected) return;
    setWorkshops((prev) => prev.map((w) => (w.id === selected.id ? { ...w, ...patch } : w)));
    setSavedMsg("");
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSavedMsg("");
    try {
      const saved = await persistWorkshops(workshops, speakers);
      setWorkshops(saved.workshops);
      setSpeakers(saved.speakers);
      setSavedMsg("Saved to D1.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save workshops.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <WaitIndicator message="Loading workshops…" style={{ marginTop: 0 }} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BusyOverlay active={saving} message="Saving workshops…" />
      <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
        <h3 style={{ fontSize: "1.15rem", color: "var(--charcoal)", display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Mic2 size={18} style={{ color: "var(--bronze)" }} /> Edit workshops
        </h3>
        <p style={{ color: "var(--text-primary)", fontSize: "0.95rem", margin: 0 }}>
          Title, blurb, date (use TBD until confirmed), time, status, and speakers persist to D1 and power the public Workshops hub.
        </p>
        {error && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(155,47,40,0.1)", border: "1px solid rgba(155,47,40,0.35)", color: "#9B2F28", fontSize: "0.95rem" }}>
            {error}
          </div>
        )}
        {savedMsg && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(46,125,50,0.1)", border: "1px solid rgba(46,125,50,0.35)", color: "#2e7d32", fontSize: "0.95rem" }}>
            {savedMsg}
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={saving}>
            {saving ? <WaitLabel>Saving…</WaitLabel> : <><Save size={14} /> Save workshops</>}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(200px, 1fr) minmax(280px, 1.4fr)", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {workshops.map((w) => (
            <button
              key={w.id}
              type="button"
              className="glass"
              onClick={() => setSelectedId(w.id)}
              style={{
                textAlign: "left",
                padding: 12,
                borderRadius: 12,
                border: selected?.id === w.id ? "1px solid var(--bronze)" : "1px solid var(--border-color)",
                cursor: "pointer",
                background: selected?.id === w.id ? "rgba(215,198,151,0.35)" : "#fff",
              }}
            >
              <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                {STATUS_LABELS[w.status]} · {w.date || "TBD"}
              </div>
              <strong style={{ fontSize: "1rem", color: "var(--charcoal)" }}>{w.title}</strong>
            </button>
          ))}
        </div>

        {selected && (
          <div className="glass" style={{ padding: 18, borderRadius: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Title</label>
              <input className="text-input" value={selected.title} onChange={(e) => patchSelected({ title: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Blurb</label>
              <textarea
                className="text-input"
                rows={3}
                value={selected.blurb}
                onChange={(e) => patchSelected({ blurb: e.target.value })}
                style={{ resize: "vertical" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    className="text-input"
                    type="date"
                    style={{ flex: 1 }}
                    value={/^\d{4}-\d{2}-\d{2}$/.test(selected.date) ? selected.date : ""}
                    onChange={(e) =>
                      patchSelected({ date: e.target.value || "TBD" })
                    }
                    aria-label="Workshop date"
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: "8px 12px", flexShrink: 0 }}
                    onClick={() => patchSelected({ date: "TBD" })}
                  >
                    TBD
                  </button>
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Time</label>
                <input className="text-input" value={selected.time} onChange={(e) => patchSelected({ time: e.target.value })} />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                border: selected.registrationOpen ? "1px solid rgba(46,125,50,0.4)" : "1px solid var(--border-color)",
                background: selected.registrationOpen ? "rgba(46,125,50,0.08)" : "#fff",
              }}
            >
              <div>
                <strong style={{ fontSize: "1rem", color: "var(--charcoal)" }}>
                  Registration {selected.registrationOpen ? "open" : "closed"}
                </strong>
                <p style={{ margin: "2px 0 0", fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                  Registration stays disabled for the public until you turn this on.
                </p>
              </div>
              <button
                type="button"
                className={`btn ${selected.registrationOpen ? "btn-primary" : "btn-outline"}`}
                style={{ padding: "8px 14px", flexShrink: 0 }}
                onClick={() => patchSelected({ registrationOpen: !selected.registrationOpen })}
              >
                {selected.registrationOpen ? "Close registration" : "Open registration"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Capacity (0 = unlimited)</label>
                <input
                  className="text-input"
                  type="number"
                  min={0}
                  value={selected.capacity}
                  onChange={(e) => patchSelected({ capacity: Math.max(0, Number(e.target.value) || 0) })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Registration note</label>
                <input
                  className="text-input"
                  value={selected.registrationNote}
                  onChange={(e) => patchSelected({ registrationNote: e.target.value })}
                  placeholder="Shown to visitors on the registration page"
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Status</label>
                <select
                  className="select-input"
                  value={selected.status}
                  onChange={(e) => patchSelected({ status: e.target.value as WorkshopStatus })}
                >
                  {(Object.keys(STATUS_LABELS) as WorkshopStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Audience</label>
                <select
                  className="select-input"
                  value={selected.audience}
                  onChange={(e) => patchSelected({ audience: e.target.value as WorkshopAudience })}
                >
                  {(Object.keys(AUDIENCE_LABELS) as WorkshopAudience[]).map((a) => (
                    <option key={a} value={a}>{AUDIENCE_LABELS[a]}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Format</label>
                <select
                  className="select-input"
                  value={selected.format}
                  onChange={(e) => patchSelected({ format: e.target.value as Workshop["format"] })}
                >
                  {WORKSHOP_FORMATS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Speakers</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {speakers.map((s) => {
                  const on = selected.speakerIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`btn ${on ? "btn-primary" : "btn-outline"}`}
                      style={{ padding: "6px 10px", fontSize: "0.9375rem" }}
                      onClick={() => patchSelected({ speakerIds: toggleId(selected.speakerIds, s.id) })}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tags (comma-separated)</label>
              <input
                className="text-input"
                value={selected.tags.join(", ")}
                onChange={(e) =>
                  patchSelected({
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
