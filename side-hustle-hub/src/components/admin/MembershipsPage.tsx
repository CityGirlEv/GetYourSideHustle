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
import {
  adminMembershipTierLabel,
  FOUNDING_STARTER_LIMIT,
  foundingStarterSlotsRemaining,
  hasFoundingStarterGrant,
  parseFoundingStarterSlot,
} from "../../lib/admin-membership";
import {
  isDeletedGyshUser,
  membershipDirectoryView,
  userMatchesDirectoryStatus,
} from "../../lib/gysh-user-delete";
import { formatKidCreditBalance } from "../../lib/member-credits";
import { UsersCreditAdjust } from "./UsersCreditAdjust";
import { UsersMembershipAdjust } from "./UsersMembershipAdjust";

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

function audienceLabelFor(user: GyshUser): string {
  const audience = normalizeAudience(user.audience);
  if (audience === "other") return user.audience || "—";
  return AUDIENCE_LABELS[audience] ?? audience;
}

export function MembershipsPage() {
  const [users, setUsers] = useState<GyshUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [tierFilter, setTierFilter] = useState<"all" | TierId>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | GyshUser["status"]>("all");

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await fetchUsers({ includeDeleted: true }));
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

  const { forCounts: liveUsers, forList: directoryUsers, deletedCount } = useMemo(
    () => membershipDirectoryView(users, showDeleted),
    [users, showDeleted],
  );
  const foundingLeft = useMemo(() => foundingStarterSlotsRemaining(liveUsers), [liveUsers]);

  const byTier = useMemo(() => {
    const map = new Map<TierId, GyshUser[]>();
    for (const id of TIER_LADDER) map.set(id, []);
    for (const u of liveUsers) {
      const tier = normalizeTier(u.membershipTier);
      map.get(tier)!.push(u);
    }
    return map;
  }, [liveUsers]);

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
    return directoryUsers.filter((u) => {
      if (tierFilter !== "all" && normalizeTier(u.membershipTier) !== tierFilter) return false;
      if (statusFilter !== "all" && isDeletedGyshUser(u) && statusFilter !== "deleted") return false;
      return userMatchesDirectoryStatus(u, statusFilter);
    });
  }, [directoryUsers, tierFilter, statusFilter]);

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

  const applyUserUpdate = (next: GyshUser, message: string) => {
    setUsers((list) => list.map((row) => (row.id === next.id ? { ...row, ...next } : row)));
    setSaveMsg(message);
  };

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
              Members grouped by Free → Elite from D1. Counts are live members only (deleted
              accounts are excluded). Change plan, first-{FOUNDING_STARTER_LIMIT} complimentary
              Starter, and credits on each card.
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

      {saveMsg && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(95,122,69,0.12)",
            border: "1px solid rgba(95,122,69,0.35)",
            color: "#3f5230",
            fontSize: "0.95rem",
          }}
        >
          {saveMsg}
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
                    opt.id === "all" ? "all" : statusFilter === opt.id ? "all" : opt.id,
                  )
                }
              >
                {opt.label}
                {opt.id !== "all" ? (
                  <span className="qa-tester-meta">
                    {liveUsers.filter((u) => u.status === opt.id).length}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <label className="users-show-deleted" data-testid="memberships-show-deleted">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => {
              const on = e.target.checked;
              setShowDeleted(on);
              if (!on && statusFilter === "deleted") setStatusFilter("all");
            }}
          />
          Show deleted users{deletedCount ? ` (${deletedCount})` : ""}
        </label>

        <p
          style={{ margin: 0, fontSize: "0.9rem", color: "var(--bronze)", fontWeight: 600 }}
          data-testid="memberships-showing-count"
        >
          Showing {filtered.filter((u) => !isDeletedGyshUser(u)).length} of {liveUsers.length}{" "}
          members
          {showDeleted && deletedCount
            ? ` · ${filtered.filter(isDeletedGyshUser).length} deleted visible`
            : ""}
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
              ({group.members.filter((u) => !isDeletedGyshUser(u)).length})
            </span>
          </h3>

          {group.members.length === 0 ? (
            <p className="daily-progress-report__muted" style={{ margin: 0 }}>
              No members at this level for the current filters.
            </p>
          ) : (
            <ul className="memberships-page__list">
              {group.members.map((u) => {
                const deleted = isDeletedGyshUser(u);
                const foundingSlot = parseFoundingStarterSlot(u.notes);
                return (
                  <li
                    key={u.id}
                    className={`memberships-page__row${deleted ? " users-card--deleted" : ""}`}
                    data-testid={`memberships-card-${u.id}`}
                  >
                    <div className="memberships-page__row-head">
                      <div>
                        <strong style={{ color: "var(--charcoal)" }}>{u.name}</strong>
                        {deleted ? (
                          <span className="users-deleted-pill" style={{ marginLeft: 8 }}>
                            Deleted
                          </span>
                        ) : null}
                        <div style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                          {u.email}
                        </div>
                      </div>
                      <div className="memberships-page__details">
                        <span
                          className="glow-badge memberships-page__pill"
                          data-testid={`memberships-tier-label-${u.id}`}
                        >
                          {adminMembershipTierLabel(u.membershipTier)}
                        </span>
                        <span className="glow-badge memberships-page__pill">
                          {audienceLabelFor(u)}
                        </span>
                        <span
                          className={`glow-badge memberships-page__pill memberships-page__pill--status memberships-page__pill--${deleted ? "disabled" : u.status}`}
                        >
                          {deleted ? "deleted" : u.status}
                        </span>
                        <span className="glow-badge memberships-page__pill">
                          {formatKidCreditBalance(u.creditBalance ?? 0)}
                        </span>
                        {hasFoundingStarterGrant(u.notes) ? (
                          <span className="users-membership-founding-pill">
                            First {FOUNDING_STARTER_LIMIT} · slot {foundingSlot}/{FOUNDING_STARTER_LIMIT}
                          </span>
                        ) : null}
                        <span style={{ fontSize: "0.85rem", color: "var(--bronze)" }}>
                          {formatRoles(u)}
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                          Joined {u.joinedAt}
                        </span>
                      </div>
                    </div>
                    {!deleted ? (
                      <>
                        <UsersMembershipAdjust
                          user={u}
                          foundingSlotsRemaining={foundingLeft}
                          onUpdated={applyUserUpdate}
                        />
                        <UsersCreditAdjust
                          user={u}
                          onBalanceChanged={(email, balance) => {
                            const target = email.toLowerCase();
                            setUsers((list) =>
                              list.map((row) =>
                                row.id === u.id || row.email.toLowerCase() === target
                                  ? { ...row, creditBalance: balance }
                                  : row,
                              ),
                            );
                          }}
                        />
                      </>
                    ) : null}
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
