import React, { useEffect, useMemo } from "react";
import { navigateAdminDeepLink } from "../../lib/admin-deep-links";
import { scenePackageForItem } from "../../lib/gysh-scene-packet";
import {
  ROLLOUT_CHANNEL_LABELS,
  SOFT_LAUNCH_ROLLOUT,
  softLaunchItemRef,
} from "../../lib/gysh-soft-launch-rollout";
import { ContentFactorySectionTabs } from "./ContentFactorySectionTabs";

/** Stills and Hedra scenes, due at noon CT on the day the matching post goes live. */
export const CreativesSchedulePage: React.FC<{ focusItemId?: string | null }> = ({
  focusItemId,
}) => {
  const rows = useMemo(
    () =>
      [...SOFT_LAUNCH_ROLLOUT]
        .sort((a, b) => a.day.localeCompare(b.day) || a.title.localeCompare(b.title))
        .map((item) => ({ item, packet: scenePackageForItem(item) })),
    [],
  );

  useEffect(() => {
    if (!focusItemId) return;
    document.getElementById(`creative-${focusItemId}`)?.scrollIntoView({ block: "start" });
  }, [focusItemId, rows]);

  return (
    <div data-testid="creatives-schedule-page" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="glass" style={{ padding: "14px 16px", borderRadius: 14 }}>
        <h2 style={{ fontSize: "1.35rem", margin: 0, color: "var(--charcoal)" }}>Creatives Schedule</h2>
        <p style={{ margin: "6px 0 0", color: "var(--text-primary)", fontSize: "0.95rem" }}>
          Make each still or Hedra scene by 12:00 PM CT on the day that post goes live. Paste the ChatGPT image prompt, then the Hedra prompt with its starting and ending frame. The posting row has the caption.
        </p>
        <ContentFactorySectionTabs active="creatives" />
      </div>
      {rows.map(({ item, packet }) => (
        <article
          key={item.id}
          id={`creative-${item.id}`}
          className="glass"
          data-testid={`creative-row-${item.id}`}
          style={{ padding: "12px 14px", borderRadius: 14 }}
        >
          <h3 style={{ margin: 0, fontSize: "1.05rem" }}>
            {softLaunchItemRef(item.id)} · {item.title}
          </h3>
          <p style={{ margin: "6px 0", fontSize: "0.9rem" }}>
            Due {item.day} at 12:00 PM CT · Goes live {item.postTime ?? "Anytime"} · {ROLLOUT_CHANNEL_LABELS[item.channel]} · {packet.scenes.length} scene{packet.scenes.length === 1 ? "" : "s"}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
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
                navigateAdminDeepLink({ tab: "factory", panel: "posting", itemId: item.id })
              }
            >
              Posting Schedule
            </button>
          </div>
          {packet.scenes.map((scene) => (
            <details key={scene.number} style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", fontWeight: 650 }}>
                Scene {scene.number} — {scene.title}
              </summary>
              <div style={{ marginTop: 8, fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>
                <p>
                  <strong>ChatGPT starting image</strong>
                  <br />
                  {scene.chatgptStartPrompt}
                </p>
                <p>
                  <strong>ChatGPT ending image</strong>
                  <br />
                  {scene.chatgptEndPrompt}
                </p>
                <p>
                  <strong>Hedra prompt</strong>
                  <br />
                  {scene.hedraPrompt}
                </p>
              </div>
            </details>
          ))}
        </article>
      ))}
    </div>
  );
};
