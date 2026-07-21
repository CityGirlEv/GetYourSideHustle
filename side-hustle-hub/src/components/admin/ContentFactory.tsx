import { useEffect, useMemo, useState } from "react";
import { Mic2, Sparkles, Wand2 } from "lucide-react";
import { BusyOverlay, WaitIndicator } from "../WaitFeedback";
import {
  CONTENT_STATUS_LABELS,
  CONTENT_TYPE_LABELS,
  generateWeeklyBatch,
  fetchContentState,
  persistContentState,
  type ContentDraft,
  type ContentDraftStatus,
  type ContentAssetType,
  type ContentBatch,
} from "../../lib/gysh-content-factory";
import { ApiError } from "../../lib/api";
import { WorkshopsAdmin } from "./WorkshopsAdmin";

const NEXT_STATUS: Partial<Record<ContentDraftStatus, ContentDraftStatus>> = {
  draft: "pending_review",
  pending_review: "approved",
  approved: "scheduled",
  scheduled: "published",
};

type FactoryTab = "drafts" | "workshops";

export function ContentFactory() {
  const [tab, setTab] = useState<FactoryTab>("drafts");
  const [batches, setBatches] = useState<ContentBatch[]>([]);
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("Glow Getter week + adult Airbnb tips");
  const [typeFilter, setTypeFilter] = useState<ContentAssetType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentDraftStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchContentState();
      setBatches(data.batches);
      setDrafts(data.drafts);
      setSelectedId((prev) => prev ?? data.drafts[0]?.id ?? null);
    } catch (e) {
      setBatches([]);
      setDrafts([]);
      setError(e instanceof ApiError ? e.message : "Failed to load content from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const persist = async (b: ContentBatch[], d: ContentDraft[]) => {
    setError("");
    try {
      const saved = await persistContentState(b, d);
      setBatches(saved.batches);
      setDrafts(saved.drafts);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save content.");
      throw e;
    }
  };

  const filtered = drafts.filter((d) => {
    if (typeFilter !== "all" && d.type !== typeFilter) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    return true;
  });

  const selected = drafts.find((d) => d.id === selectedId) ?? filtered[0] ?? null;

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const d of drafts) c[d.status] = (c[d.status] ?? 0) + 1;
    return c;
  }, [drafts]);

  const generate = async () => {
    const next = generateWeeklyBatch(topic.trim() || "GYSH weekly", { batches, drafts });
    try {
      await persist(next.batches, next.drafts);
      setSelectedId(next.drafts[0]?.id ?? null);
    } catch {
      /* error set */
    }
  };

  const advance = async (draft: ContentDraft) => {
    const nextStatus = NEXT_STATUS[draft.status];
    if (!nextStatus) return;
    try {
      await persist(
        batches,
        drafts.map((d) => (d.id === draft.id ? { ...d, status: nextStatus } : d)),
      );
    } catch {
      /* error set */
    }
  };

  const reject = async (draft: ContentDraft) => {
    try {
      await persist(
        batches,
        drafts.map((d) => (d.id === draft.id ? { ...d, status: "rejected" } : d)),
      );
    } catch {
      /* error set */
    }
  };

  const updateSelected = async (patch: Partial<ContentDraft>) => {
    if (!selected) return;
    const next = drafts.map((d) => (d.id === selected.id ? { ...d, ...patch } : d));
    try {
      await persist(batches, next);
    } catch {
      /* error set */
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <BusyOverlay active={loading} message="Loading content…" />
      <div className="glass" style={{ padding: "24px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(215,198,151,0.55), #fff)" }}>
        <h2 style={{ fontSize: "1.5rem", color: "var(--charcoal)", display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={22} style={{ color: "var(--bronze)" }} /> Content Factory
        </h2>
        <p style={{ color: "var(--text-primary)", marginTop: 6, fontSize: "1rem" }}>
          Create and review content drafts and manage workshop details. Drafts persist in D1.
        </p>
        {error && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(155,47,40,0.1)", border: "1px solid rgba(155,47,40,0.35)", color: "#9B2F28", fontSize: "0.95rem" }}>
            {error}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {(
            [
              ["drafts", "Drafts & batches", <Wand2 key="d" size={14} />],
              ["workshops", "Workshops", <Mic2 key="w" size={14} />],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              className={`nav-link-btn ${tab === id ? "active" : ""}`}
              style={{ borderRadius: 10 }}
              onClick={() => setTab(id)}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "workshops" && <WorkshopsAdmin />}

      {tab === "drafts" && (
        <>
          <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
              <div className="form-group" style={{ margin: 0, flex: "1 1 260px" }}>
                <label className="form-label">Weekly topic</label>
                <input className="text-input" value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>
              <button type="button" className="btn btn-primary" onClick={() => void generate()} disabled={loading || Boolean(error && drafts.length === 0 && batches.length === 0)}>
                <Wand2 size={14} /> Generate weekly batch
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
              {Object.entries(counts).map(([k, v]) => (
                <span key={k}>{CONTENT_STATUS_LABELS[k as ContentDraftStatus] ?? k}: {v}</span>
              ))}
              <span>Batches: {batches.length}</span>
            </div>
          </div>

          {loading ? (
            <WaitIndicator message="Loading content from database…" style={{ marginTop: 0 }} />
          ) : drafts.length === 0 && !error ? (
            <div className="glass" style={{ padding: 28, textAlign: "center", color: "var(--text-primary)" }}>
              No drafts yet. Generate a weekly batch to get started.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 1fr) minmax(280px, 1.2fr)", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <select className="select-input" style={{ width: 160 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as ContentAssetType | "all")}>
                    <option value="all">All types</option>
                    {(Object.keys(CONTENT_TYPE_LABELS) as ContentAssetType[]).map((t) => (
                      <option key={t} value={t}>{CONTENT_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                  <select className="select-input" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ContentDraftStatus | "all")}>
                    <option value="all">All statuses</option>
                    {(Object.keys(CONTENT_STATUS_LABELS) as ContentDraftStatus[]).map((s) => (
                      <option key={s} value={s}>{CONTENT_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                {filtered.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="glass"
                    onClick={() => setSelectedId(d.id)}
                    style={{
                      textAlign: "left",
                      padding: 14,
                      borderRadius: 12,
                      border: selected?.id === d.id ? "1px solid var(--bronze)" : "1px solid var(--border-color)",
                      cursor: "pointer",
                      background: selected?.id === d.id ? "rgba(215,198,151,0.35)" : "#fff",
                    }}
                  >
                    <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>{CONTENT_TYPE_LABELS[d.type]} · {CONTENT_STATUS_LABELS[d.status]}</div>
                    <strong style={{ color: "var(--charcoal)", fontSize: "1rem" }}>{d.title}</strong>
                    <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)", marginTop: 4 }}>{d.excerpt}</div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p style={{ color: "var(--text-primary)" }}>No drafts match filters.</p>
                )}
              </div>

              {selected && (
                <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="text-input" value={selected.title} onChange={(e) => void updateSelected({ title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Body</label>
                    <textarea className="text-input" rows={10} value={selected.body} onChange={(e) => void updateSelected({ body: e.target.value })} style={{ resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" className="btn btn-primary" onClick={() => void advance(selected)}>
                      Advance status
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => void reject(selected)}>
                      Reject
                    </button>
                    <span style={{ alignSelf: "center", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                      Owner: {selected.owner} · {CONTENT_STATUS_LABELS[selected.status]}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
