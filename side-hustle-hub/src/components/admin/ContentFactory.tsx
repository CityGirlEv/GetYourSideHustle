import { useEffect, useMemo, useState } from "react";
import { CalendarRange, Mic2, Rocket, Sparkles, Wand2 } from "lucide-react";
import { BusyOverlay } from "../WaitFeedback";
import {
  CONTENT_STATUS_LABELS,
  CONTENT_TYPE_LABELS,
  fetchContentState,
  persistContentState,
  seedSoftLaunchDrafts,
  type ContentBatch,
  type ContentDraft,
  type ContentDraftStatus,
} from "../../lib/gysh-content-factory";
import {
  CONTENT_FACTORY_HOWTO,
  MARKETING_PLAN_DEFINITIONS,
  ROLLOUT_CHANNEL_LABELS,
  SOFT_LAUNCH_PROJECTIONS,
  SOFT_LAUNCH_ROLLOUT,
  rolloutItemsByDay,
  type RolloutChannel,
} from "../../lib/gysh-soft-launch-rollout";
import { ApiError } from "../../lib/api";
import { marketingLaunchPlanUrl, readAdminDeepLink } from "../../lib/admin-deep-links";
import { WorkshopsAdmin } from "./WorkshopsAdmin";

const NEXT_STATUS: Partial<Record<ContentDraftStatus, ContentDraftStatus>> = {
  draft: "pending_review",
  pending_review: "approved",
  approved: "scheduled",
  scheduled: "published",
};

type FactoryTab = "soft_launch" | "workshops";

function factoryTabFromDeepLink(): FactoryTab {
  const panel = readAdminDeepLink().panel;
  if (panel === "workshops") return "workshops";
  return "soft_launch";
}

export function ContentFactory() {
  const [tab, setTab] = useState<FactoryTab>(factoryTabFromDeepLink);
  const [rolloutSprint, setRolloutSprint] = useState<2 | 3 | 4 | 5 | "all">(3);
  const [channelFilter, setChannelFilter] = useState<RolloutChannel | "all">("all");
  const [batches, setBatches] = useState<ContentBatch[]>([]);
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seedMsg, setSeedMsg] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSeeded, setShowSeeded] = useState(false);

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

  const seededDrafts = useMemo(
    () => drafts.filter((d) => d.title.startsWith("[S") || d.batchId.startsWith("BATCH-SL-")),
    [drafts],
  );

  const selected = seededDrafts.find((d) => d.id === selectedId) ?? seededDrafts[0] ?? null;

  const rolloutDays = useMemo(() => {
    const days = rolloutItemsByDay(rolloutSprint === "all" ? undefined : rolloutSprint);
    if (channelFilter === "all") return days;
    return days
      .map(({ day, items }) => ({
        day,
        items: items.filter((i) => i.channel === channelFilter),
      }))
      .filter((d) => d.items.length > 0);
  }, [rolloutSprint, channelFilter]);

  const setFactoryTab = (id: FactoryTab) => {
    setTab(id);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "factory");
    url.searchParams.set("panel", id === "workshops" ? "workshops" : "launch-plan");
    window.history.replaceState(window.history.state, "", url.toString());
  };

  const seedRollout = async (mode: "visible" | "all") => {
    setSeedMsg("");
    const next = seedSoftLaunchDrafts(
      { batches, drafts },
      mode === "all" ? {} : rolloutSprint === "all" ? {} : { sprint: rolloutSprint },
    );
    if (next.added === 0) {
      setSeedMsg("No new drafts — those calendar items are already seeded.");
      setShowSeeded(true);
      return;
    }
    try {
      await persist(next.batches, next.drafts);
      setSelectedId(next.drafts[0]?.id ?? null);
      setSeedMsg(`Seeded ${next.added} draft(s). Open Seeded drafts below to edit copy/status.`);
      setShowSeeded(true);
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

  const updateSelected = async (patch: Partial<ContentDraft>) => {
    if (!selected) return;
    try {
      await persist(
        batches,
        drafts.map((d) => (d.id === selected.id ? { ...d, ...patch } : d)),
      );
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
          GYSH Marketing/Launch Plan (Sprints 3–5): Facebook, Kevina Starr, website/newsletter, ads, and new channels. Admin only.
        </p>
        {error && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(155,47,40,0.1)", border: "1px solid rgba(155,47,40,0.35)", color: "#9B2F28", fontSize: "0.95rem" }}>
            {error}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {(
            [
              ["soft_launch", "GYSH Marketing/Launch Plan", <Rocket key="s" size={14} />],
              ["workshops", "Workshops", <Mic2 key="w" size={14} />],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              className={`nav-link-btn ${tab === id ? "active" : ""}`}
              style={{ borderRadius: 10 }}
              onClick={() => setFactoryTab(id)}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "workshops" && <WorkshopsAdmin />}

      {tab === "soft_launch" && (
        <>
          <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
            <h3 style={{ margin: 0, color: "var(--charcoal)", fontSize: "1.15rem" }}>{CONTENT_FACTORY_HOWTO.title}</h3>
            <p style={{ marginTop: 10, color: "var(--text-primary)", fontSize: "0.975rem", lineHeight: 1.55 }}>
              {CONTENT_FACTORY_HOWTO.summary}
            </p>
            <ol style={{ margin: "12px 0 0", paddingLeft: 20, color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: 1.5 }}>
              {CONTENT_FACTORY_HOWTO.steps.map((step) => (
                <li key={step} style={{ marginBottom: 4 }}>{step}</li>
              ))}
            </ol>
            <p style={{ marginTop: 14, fontSize: "0.9rem", color: "var(--text-primary)" }}>
              Share this report:{" "}
              <a href={marketingLaunchPlanUrl()} style={{ color: "var(--bronze)", wordBreak: "break-all" }}>
                {marketingLaunchPlanUrl()}
              </a>
            </p>
          </div>

          <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
            <h3 style={{ margin: 0, color: "var(--charcoal)", fontSize: "1.15rem" }}>Definitions</h3>
            <dl style={{ margin: "12px 0 0", display: "flex", flexDirection: "column", gap: 12 }}>
              {MARKETING_PLAN_DEFINITIONS.map((d) => (
                <div key={d.term}>
                  <dt style={{ fontWeight: 700, color: "var(--charcoal)", fontSize: "0.975rem" }}>{d.term}</dt>
                  <dd style={{ margin: "4px 0 0", color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                    {d.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Sprint</label>
                <select
                  className="select-input"
                  style={{ width: 160 }}
                  value={String(rolloutSprint)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRolloutSprint(v === "all" ? "all" : (Number(v) as 2 | 3 | 4 | 5));
                  }}
                >
                  <option value="all">All (S2–S5)</option>
                  <option value="2">Sprint 2 (kickoff)</option>
                  <option value="3">Sprint 3</option>
                  <option value="4">Sprint 4</option>
                  <option value="5">Sprint 5</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Channel</label>
                <select
                  className="select-input"
                  style={{ width: 200 }}
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value as RolloutChannel | "all")}
                >
                  <option value="all">All channels</option>
                  {(Object.keys(ROLLOUT_CHANNEL_LABELS) as RolloutChannel[]).map((c) => (
                    <option key={c} value={c}>{ROLLOUT_CHANNEL_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => void seedRollout("visible")} disabled={loading}>
                <Wand2 size={14} /> Seed visible sprint → drafts
              </button>
              <button type="button" className="btn btn-outline" onClick={() => void seedRollout("all")} disabled={loading}>
                Seed all S2–S5
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowSeeded((v) => !v)} disabled={loading}>
                Seeded drafts ({seededDrafts.length})
              </button>
            </div>
            {seedMsg && (
              <p style={{ marginTop: 12, color: "var(--text-primary)", fontSize: "0.95rem" }}>{seedMsg}</p>
            )}
            <p style={{ marginTop: 12, color: "var(--text-primary)", fontSize: "0.95rem" }}>
              <CalendarRange size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
              {SOFT_LAUNCH_ROLLOUT.length} calendar items · Seed copies calendar copy/prompts/artifacts into editable D1 drafts (does not post live).
              Tina owns Kevina Starr FB; Evelyn owns TikTok / YouTube / IG / ads / tech website.
            </p>
          </div>

          {showSeeded && (
            <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
              <h3 style={{ margin: 0, color: "var(--charcoal)", fontSize: "1.1rem" }}>Seeded drafts</h3>
              <p style={{ marginTop: 6, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                Editable working copies of plan items. Advance status as you publish.
              </p>
              {seededDrafts.length === 0 ? (
                <p style={{ marginTop: 12, color: "var(--text-primary)" }}>None yet — use Seed visible sprint or Seed all S2–S5.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) minmax(280px, 1.2fr)", gap: 16, marginTop: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {seededDrafts.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className="glass"
                        onClick={() => setSelectedId(d.id)}
                        style={{
                          textAlign: "left",
                          padding: 12,
                          borderRadius: 12,
                          border: selected?.id === d.id ? "1px solid var(--bronze)" : "1px solid var(--border-color)",
                          cursor: "pointer",
                          background: selected?.id === d.id ? "rgba(215,198,151,0.35)" : "#fff",
                        }}
                      >
                        <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
                          {CONTENT_TYPE_LABELS[d.type]} · {CONTENT_STATUS_LABELS[d.status]}
                        </div>
                        <strong style={{ color: "var(--charcoal)", fontSize: "0.95rem" }}>{d.title}</strong>
                      </button>
                    ))}
                  </div>
                  {selected && (
                    <div>
                      <div className="form-group">
                        <label className="form-label">Title</label>
                        <input className="text-input" value={selected.title} onChange={(e) => void updateSelected({ title: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Body</label>
                        <textarea
                          className="text-input"
                          rows={12}
                          value={selected.body}
                          onChange={(e) => void updateSelected({ body: e.target.value })}
                          style={{ resize: "vertical" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <button type="button" className="btn btn-primary" onClick={() => void advance(selected)}>
                          Advance status
                        </button>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                          Owner: {selected.owner} · {CONTENT_STATUS_LABELS[selected.status]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {SOFT_LAUNCH_PROJECTIONS.filter((p) => rolloutSprint === "all" || p.sprint === rolloutSprint).map((p) => (
              <div key={p.sprint} className="glass" style={{ padding: 16, borderRadius: 14 }}>
                <strong style={{ color: "var(--charcoal)" }}>{p.label}</strong>
                <div style={{ fontSize: "0.875rem", color: "var(--text-primary)", marginTop: 4 }}>{p.rangeLabel}</div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", marginTop: 8 }}>{p.theme}</p>
                <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                  {p.metrics.slice(0, 3).map((m) => (
                    <li key={m.label}>{m.label}: {m.low}–{m.high}</li>
                  ))}
                </ul>
                <div style={{ marginTop: 10, fontSize: "0.875rem", color: "var(--charcoal)" }}>
                  {p.revenue.map((r) => (
                    <div key={r.label}>
                      {r.label}: ${r.lowUsd}–${r.highUsd}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {rolloutDays.map(({ day, items }) => (
            <div key={day} className="glass" style={{ padding: 18, borderRadius: 14 }}>
              <h3 style={{ margin: 0, color: "var(--charcoal)", fontSize: "1.1rem" }}>{day}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderTop: "1px solid var(--border-color)",
                      paddingTop: 12,
                    }}
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
                      <strong style={{ color: "var(--charcoal)", fontSize: "1rem" }}>{item.title}</strong>
                      <span style={{ fontSize: "0.875rem", color: "var(--bronze)" }}>
                        {ROLLOUT_CHANNEL_LABELS[item.channel]}
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
                        {item.postTime ?? "Anytime"} · {item.owner}
                      </span>
                    </div>
                    {item.copy && (
                      <pre
                        style={{
                          marginTop: 8,
                          whiteSpace: "pre-wrap",
                          fontFamily: "inherit",
                          fontSize: "0.9375rem",
                          color: "var(--charcoal)",
                          background: "rgba(247,241,227,0.65)",
                          padding: 12,
                          borderRadius: 10,
                        }}
                      >
                        {item.copy}
                      </pre>
                    )}
                    {(item.imagePrompt || item.videoPrompt) && (
                      <div style={{ marginTop: 8, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                        {item.imagePrompt && <p style={{ margin: "0 0 6px" }}><strong>Image:</strong> {item.imagePrompt}</p>}
                        {item.videoPrompt && <p style={{ margin: 0 }}><strong>Video:</strong> {item.videoPrompt}</p>}
                      </div>
                    )}
                    {item.websiteActions && item.websiteActions.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <strong style={{ fontSize: "0.875rem" }}>Website</strong>
                        <ol style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: "0.875rem" }}>
                          {item.websiteActions.map((a) => <li key={a}>{a}</li>)}
                        </ol>
                      </div>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <strong style={{ fontSize: "0.875rem" }}>Artifacts</strong>
                      <ol style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                        {item.artifacts.map((a) => <li key={a}>{a}</li>)}
                      </ol>
                    </div>
                    {item.notes && (
                      <p style={{ marginTop: 8, fontSize: "0.875rem", color: "#9B2F28" }}>{item.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
