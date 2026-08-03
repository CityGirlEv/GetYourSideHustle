import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, RefreshCw, Users } from "lucide-react";
import { BusyOverlay } from "../WaitFeedback";
import { ApiError } from "../../lib/api";
import { fetchUsers, formatRoles, type GyshUser } from "../../lib/gysh-roles";
import {
  MEMBERSHIP_TIERS,
  TIER_LADDER,
  type AudienceGroup,
  type TierId,
} from "../../lib/membership";

const AUDIENCE_LABELS: Record<string, string> = {
  kids: "Kids",
  junior: "Teens",
  adult: "Adult",
  senior: "Senior",
};

function normalizeTier(raw: string | undefined | null): TierId {
  const t = (raw || "free").toLowerCase();
  if (t === "starter" || t === "pro" || t === "elite") return t;
  return "free";
}

function normalizeAudience(raw: string | undefined | null): AudienceGroup | "other" {
  const a = (raw || "adult").toLowerCase();
  if (a === "kids" || a === "junior" || a === "adult" || a === "senior") return a;
  if (a === "teens" || a === "teen") return "junior";
  return "other";
}

function tierName(id: TierId): string {
  return MEMBERSHIP_TIERS.find((t) => t.id === id)?.name ?? id;
}

export function MembershipsPage() {
  const [users, setUsers] = useState<GyshUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | TierId>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | GyshUser["status"]>("all");

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await fetchUsers());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load memberships.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const byTier = useMemo(() => {
    const map = new Map<TierId, GyshUser[]>();
    for (const id of TIER_LADDER) map.set(id, []);
    for (const u of users) {
      const tier = normalizeTier(u.membershipTier);
      map.get(tier)!.push(u);
    }
    return map;
  }, [users]);

  const tierStats = useMemo(() => {
    return TIER_LADDER.map((id) => {
      const list = byTier.get(id) ?? [];
      const active = list.filter((u) => u.status === "active").length;
      const pending = list.filter((u) => u.status === "pending").length;
      const disabled = list.filter((u) => u.status === "disabled").length;
      const byAudience: Record<string, number> = {};
      for (const u of list) {
        const a = normalizeAudience(u.audience);
        const key = a === "other" ? "Other" : AUDIENCE_LABELS[a] ?? a;
        byAudience[key] = (byAudience[key] ?? 0) + 1;
      }
      return { id, name: tierName(id), total: list.length, active, pending, disabled, byAudience };
    });
  }, [byTier]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (tierFilter !== "all" && normalizeTier(u.membershipTier) !== tierFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, tierFilter, statusFilter]);

  const groupedMembers = useMemo(() => {
    const groups: { id: TierId; name: string; members: GyshUser[] }[] = [];
    for (const id of TIER_LADDER) {
      if (tierFilter !== "all" && tierFilter !== id) continue;
      const members = filtered
        .filter((u) => normalizeTier(u.membershipTier) === id)
        .sort((a, b) => a.name.localeCompare(b.name));
      groups.push({ id, name: tierName(id), members });
    }
    return groups;
  }, [filtered, tierFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <BusyOverlay active={loading} message="Loading memberships…" />

      <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
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
              <BadgeCheck size={22} style={{ color: "var(--bronze)" }} />
              Memberships
            </h2>
            <p style={{ color: "var(--text-primary)", marginTop: 6, fontSize: "1rem" }}>
              Members grouped by Free → Elite level from D1. Counts by status and audience lane;
              drill into any tier below.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void reload()}
            disabled={loading}
            data-testid="memberships-refresh"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginTop: 18,
          }}
        >
          {tierStats.map((t) => (
            <button
              key={t.id}
              type="button"
              className="glass"
              onClick={() => setTierFilter(tierFilter === t.id ? "all" : t.id)}
              data-testid={`memberships-tier-${t.id}`}
              style={{
                padding: 14,
                textAlign: "left",
                cursor: "pointer",
                border:
                  tierFilter === t.id
                    ? "1.5px solid var(--crimson)"
                    : "1px solid var(--border-color)",
                background: tierFilter === t.id ? "rgba(215,198,151,0.45)" : "#fff",
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--charcoal)" }}>{t.name}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--bronze)" }}>
                {t.total}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", marginTop: 4 }}>
                {t.active} active · {t.pending} pending · {t.disabled} disabled
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--bronze)", marginTop: 6 }}>
                {Object.entries(t.byAudience)
                  .map(([k, n]) => `${k} ${n}`)
                  .join(" · ") || "—"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 8,
            background: "rgba(155,47,40,0.1)",
            border: "1px solid rgba(155,47,40,0.35)",
            color: "#9B2F28",
            fontSize: "0.95rem",
          }}
        >
          {error}
        </div>
      )}

      <div
        className="glass memberships-page__filters"
        style={{
          padding: 18,
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div className="memberships-page__filter-group">
          <span className="form-label memberships-page__filter-label">Level</span>
          <div
            className="memberships-page__bubbles"
            role="group"
            aria-label="Filter by membership level"
          >
            <button
              type="button"
              className="qa-tester-bubble qa-filter-chip"
              data-active={tierFilter === "all" ? "true" : "false"}
              data-testid="memberships-level-all"
              onClick={() => setTierFilter("all")}
            >
              All levels
            </button>
            {TIER_LADDER.map((id) => (
              <button
                key={id}
                type="button"
                className="qa-tester-bubble qa-filter-chip"
                data-active={tierFilter === id ? "true" : "false"}
                data-testid={`memberships-level-${id}`}
                onClick={() => setTierFilter(tierFilter === id ? "all" : id)}
              >
                {tierName(id)}
                <span className="qa-tester-meta">{byTier.get(id)?.length ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="memberships-page__filter-group">
          <span className="form-label memberships-page__filter-label">Status</span>
          <div
            className="memberships-page__bubbles"
            role="group"
            aria-label="Filter by account status"
          >
            {(
              [
                { id: "all", label: "All statuses" },
                { id: "active", label: "Active" },
                { id: "pending", label: "Pending" },
                { id: "disabled", label: "Disabled" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="qa-tester-bubble qa-filter-chip"
                data-active={statusFilter === opt.id ? "true" : "false"}
                data-testid={`memberships-status-${opt.id}`}
                onClick={() =>
                  setStatusFilter(
                    opt.id === "all"
                      ? "all"
                      : statusFilter === opt.id
                        ? "all"
                        : opt.id,
                  )
                }
              >
                {opt.label}
                {opt.id !== "all" ? (
                  <span className="qa-tester-meta">
                    {users.filter((u) => u.status === opt.id).length}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--bronze)", fontWeight: 600 }}>
          Showing {filtered.length} of {users.length} members
        </p>
      </div>

      {groupedMembers.map((group) => (
        <div key={group.id} className="glass" style={{ padding: 20, borderRadius: 14 }}>
          <h3
            style={{
              margin: "0 0 12px",
              color: "var(--bronze)",
              fontSize: "1.15rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Users size={18} />
            {group.name}
            <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
              ({group.members.length})
            </span>
          </h3>

          {group.members.length === 0 ? (
            <p className="daily-progress-report__muted" style={{ margin: 0 }}>
              No members at this level for the current filters.
            </p>
          ) : (
            <ul className="memberships-page__list">
              {group.members.map((u) => {
                const audience = normalizeAudience(u.audience);
                const audienceLabel =
                  audience === "other" ? u.audience || "—" : AUDIENCE_LABELS[audience] ?? audience;
                return (
                  <li key={u.id} className="memberships-page__row">
                    <div>
                      <strong style={{ color: "var(--charcoal)" }}>{u.name}</strong>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                        {u.email}
                      </div>
                    </div>
                    <span className="glow-badge memberships-page__pill">{audienceLabel}</span>
                    <span
                      className={`glow-badge memberships-page__pill memberships-page__pill--status memberships-page__pill--${u.status}`}
                    >
                      {u.status}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--bronze)" }}>
                      {formatRoles(u)}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                      Joined {u.joinedAt}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
