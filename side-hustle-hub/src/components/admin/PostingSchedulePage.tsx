import React, { useEffect, useMemo } from "react";
import { navigateAdminDeepLink } from "../../lib/admin-deep-links";
import {
  ROLLOUT_CHANNEL_LABELS,
  SOFT_LAUNCH_ROLLOUT,
  softLaunchItemRef,
} from "../../lib/gysh-soft-launch-rollout";
import { ContentFactorySectionTabs } from "./ContentFactorySectionTabs";

function previewCopy(copy: string | undefined): string {
  const text = (copy ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "Copy is on the Content Factory card.";
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

/** One calendar of what goes live: date, channel, time, and caption. */
export const PostingSchedulePage: React.FC<{ focusItemId?: string | null }> = ({
  focusItemId,
}) => {
  const days = useMemo(() => {
    const byDay = new Map<string, typeof SOFT_LAUNCH_ROLLOUT>();
    for (const item of SOFT_LAUNCH_ROLLOUT) {
      const list = byDay.get(item.day) ?? [];
      list.push(item);
      byDay.set(item.day, list);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, items]) => ({
        day,
        items: [...items].sort((a, b) => (a.postTime ?? "").localeCompare(b.postTime ?? "")),
      }));
  }, []);

  useEffect(() => {
    if (!focusItemId) return;
    document.getElementById(`post-${focusItemId}`)?.scrollIntoView({ block: "start" });
  }, [focusItemId, days]);

  return (
    <div data-testid="posting-schedule-page" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="glass" style={{ padding: "14px 16px", borderRadius: 14 }}>
        <h2 style={{ fontSize: "1.35rem", margin: 0, color: "var(--charcoal)" }}>Posting Schedule</h2>
        <p style={{ margin: "6px 0 0", color: "var(--text-primary)", fontSize: "0.95rem" }}>
          Same Content Factory calendar: date, channel, time, and what to post. Open the card for the full caption, or open Creatives Schedule for the ChatGPT and Hedra scene packet.
        </p>
        <ContentFactorySectionTabs active="posting" />
      </div>
      {days.map(({ day, items }) => (
        <section key={day} className="glass" style={{ padding: "12px 14px", borderRadius: 14 }} data-testid={`posting-day-${day}`}>
          <h3 style={{ margin: "0 0 8px", fontSize: "1rem" }}>
            {day} · {items.length} post{items.length === 1 ? "" : "s"}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((item) => (
              <article
                key={item.id}
                id={`post-${item.id}`}
                data-testid={`posting-row-${item.id}`}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border-color)",
                  background: "#fff",
                }}
              >
                <strong>
                  {softLaunchItemRef(item.id)} · {ROLLOUT_CHANNEL_LABELS[item.channel]} · {item.postTime ?? "Anytime"} · {item.owner}
                </strong>
                <div style={{ marginTop: 4 }}>{item.title}</div>
                <p style={{ margin: "6px 0", fontSize: "0.9rem", color: "var(--text-primary)" }}>{previewCopy(item.copy)}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      navigateAdminDeepLink({ tab: "factory", panel: "launch-plan", itemId: item.id })
                    }
                  >
                    Content Factory
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      navigateAdminDeepLink({ tab: "factory", panel: "creatives", itemId: item.id })
                    }
                  >
                    Creatives Schedule
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
