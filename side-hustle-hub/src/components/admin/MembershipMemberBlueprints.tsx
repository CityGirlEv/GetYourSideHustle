import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ApiError } from "../../lib/api";
import { listSavedBlueprintsForUser, type SavedBlueprint } from "../../lib/blueprints-api";
import {
  formatMemberBlueprintPct,
  membershipBlueprintsToggleLabel,
  summarizeMemberBlueprint,
} from "../../lib/membership-member-blueprints";

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; blueprints: SavedBlueprint[] }
  | { status: "error"; message: string };

export function MembershipMemberBlueprints({
  userId,
  open,
  onToggle,
  countHint = null,
}: {
  userId: string;
  open: boolean;
  onToggle: () => void;
  countHint?: number | null;
}) {
  const [load, setLoad] = useState<LoadState>({ status: "idle" });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoad({ status: "loading" });
    void listSavedBlueprintsForUser(userId)
      .then((blueprints) => {
        if (!cancelled) setLoad({ status: "ok", blueprints });
      })
      .catch((err) => {
        if (cancelled) return;
        setLoad({
          status: "error",
          message: err instanceof ApiError ? err.message : "Could not load Blueprints.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  const count = load.status === "ok" ? load.blueprints.length : countHint;

  return (
    <div className="memberships-page__blueprints">
      <button
        type="button"
        className="memberships-page__blueprint-toggle"
        aria-expanded={open}
        aria-label={membershipBlueprintsToggleLabel(count)}
        data-testid={`memberships-blueprints-toggle-${userId}`}
        data-blueprint-count={count != null ? String(count) : undefined}
        onClick={onToggle}
      >
        <ChevronDown
          size={14}
          aria-hidden
          className="memberships-page__chevron"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
        Blueprints
        {count != null ? (
          <span className="memberships-page__blueprint-count">({count})</span>
        ) : null}
      </button>
      {open ? (
        <div
          className="memberships-page__blueprint-panel"
          data-testid={`memberships-blueprints-${userId}`}
        >
          {load.status === "loading" || load.status === "idle" ? (
            <p className="memberships-page__blueprint-muted">Loading Blueprints…</p>
          ) : null}
          {load.status === "error" ? (
            <p className="memberships-page__blueprint-error" role="alert">
              {load.message}
            </p>
          ) : null}
          {load.status === "ok" && load.blueprints.length === 0 ? (
            <p className="memberships-page__blueprint-muted">No Blueprint saved yet.</p>
          ) : null}
          {load.status === "ok"
            ? load.blueprints.map((bp) => {
                const summary = summarizeMemberBlueprint(bp);
                const when = summary.completedAt
                  ? new Date(summary.completedAt).toLocaleDateString()
                  : "";
                return (
                  <div
                    key={bp.id}
                    className="memberships-page__blueprint-block"
                    data-testid={`memberships-blueprint-${bp.id}`}
                  >
                    <strong>{summary.title}</strong>
                    <div className="memberships-page__blueprint-meta">
                      {summary.matchCount
                        ? `Top ${Math.min(3, summary.matchCount)} of ${summary.matchCount}`
                        : "No matches"}
                      {when ? ` · ${when}` : ""}
                    </div>
                    {summary.matches.length ? (
                      <ol className="memberships-page__blueprint-matches">
                        {summary.matches.map((m) => {
                          const pct = formatMemberBlueprintPct(m.pct);
                          return (
                            <li key={m.id}>
                              {m.rank}. {m.label}
                              {pct ? ` · ${pct}` : ""}
                            </li>
                          );
                        })}
                      </ol>
                    ) : null}
                  </div>
                );
              })
            : null}
        </div>
      ) : null}
    </div>
  );
}
