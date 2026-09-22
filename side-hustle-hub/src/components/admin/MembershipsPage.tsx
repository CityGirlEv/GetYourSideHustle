import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, LayoutDashboard, RefreshCw, Trash2, Users } from "lucide-react";
import { BusyOverlay } from "../WaitFeedback";
import { ApiError } from "../../lib/api";
import {
  clearUserMembership,
  deleteUser,
  fetchUsers,
  formatRoles,
  updateUserMembership,
  type GyshUser,
} from "../../lib/gysh-roles";
import {
  MEMBERSHIP_TIERS,
  TIER_LADDER,
  type AudienceGroup,
  type TierId,
} from "../../lib/membership";
import {
  gyshMembershipClearBlockReason,
  gyshUserDeleteBlockReason,
} from "../../lib/gysh-user-delete";
import { memberPreviewLinks } from "../../lib/admin-act-as";
import { fetchMembershipBlueprintCounts } from "../../lib/blueprints-api";
import { parseMembershipBlueprintCounts } from "../../lib/membership-member-blueprints";
import { membershipChargeStatus } from "../../lib/membership-expiry";
import { ConfirmDeleteUserBanner } from "./ConfirmDeleteUserBanner";
import { FoundingStarterTracker } from "./FoundingStarterTracker";
import { MembershipMemberBlueprints } from "./MembershipMemberBlueprints";

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

export function MembershipsPage({
  currentUserId = null,
  onViewMemberDashboard,
}: {
  currentUserId?: string | null;
  onViewMemberDashboard?: (user: GyshUser) => void;
}) {
  const [users, setUsers] = useState<GyshUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyKind, setBusyKind] = useState<"clear" | "delete">("clear");
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | TierId>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | GyshUser["status"]>("all");
  const [pendingDelete, setPendingDelete] = useState<GyshUser | null>(null);
  const [openBlueprintIds, setOpenBlueprintIds] = useState<Record<string, boolean>>({});
  const [blueprintCounts, setBlueprintCounts] = useState<Record<string, number> | null>(null);
  const [expiryEdits, setExpiryEdits] = useState<Record<string, string>>({});
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersOutcome, countsOutcome] = await Promise.allSettled([
        fetchUsers(),
        fetchMembershipBlueprintCounts(),
      ]);
      if (usersOutcome.status === "rejected") {
        setError(
          usersOutcome.reason instanceof ApiError
            ? usersOutcome.reason.message
            : "Failed to load memberships.",
        );
        setUsers([]);
        setBlueprintCounts(null);
      } else {
        setUsers(usersOutcome.value);
        setBlueprintCounts(
          countsOutcome.status === "fulfilled"
            ? parseMembershipBlueprintCounts(countsOutcome.value)
            : null,
        );
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load memberships.");
      setUsers([]);
      setBlueprintCounts(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const removePlan = async (u: GyshUser) => {
    const blocked = gyshMembershipClearBlockReason({
      targetId: u.id,
      currentTier: u.membershipTier,
    });
    if (blocked) {
      setError(blocked);
      return;
    }
    const plan = tierName(normalizeTier(u.membershipTier));
    if (
      !window.confirm(
        `Remove ${u.name}'s ${plan} membership and set them to Free? The account stays. Cancel any Stripe subscription separately if they pay every 3 months.`,
      )
    ) {
      return;
    }
    setBusyKind("clear");
    setBusy(true);
    setError("");
    setSaveMsg("");
    try {
      await clearUserMembership(u.id);
      await reload();
      setSaveMsg(`Removed ${plan} for ${u.name}. They are on Free now.`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to remove membership.");
    } finally {
      setBusy(false);
    }
  };

  const requestRemoveMember = (u: GyshUser) => {
    const blocked = gyshUserDeleteBlockReason({ targetId: u.id, actorId: currentUserId });
    if (blocked) {
      setError(blocked);
      setPendingDelete(null);
      return;
    }
    setError("");
    setPendingDelete(u);
  };

  const jumpToMember = (userId: string) => {
    setHighlightId(userId);
    const node = document.querySelector(`[data-testid="memberships-row-${userId}"]`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => setHighlightId((cur) => (cur === userId ? null : cur)), 2400);
  };

  const saveExpiry = async (u: GyshUser) => {
    const next = (expiryEdits[u.id] ?? u.membershipExpiresAt ?? "").trim();
    setBusyKind("clear");
    setBusy(true);
    setError("");
    setSaveMsg("");
    try {
      const result = await updateUserMembership(u.id, {
        membershipTier: u.membershipTier || "free",
        notify: false,
        membershipExpiresAt: next,
      });
      setUsers((prev) => prev.map((row) => (row.id === u.id ? { ...row, ...result.user } : row)));
      setExpiryEdits((prev) => {
        const copy = { ...prev };
        delete copy[u.id];
        return copy;
      });
      setSaveMsg(`Saved expiration for ${u.name}.`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save expiration.");
    } finally {
      setBusy(false);
    }
  };

  const confirmRemoveMember = async () => {
    const u = pendingDelete;
    if (!u) return;
    const blocked = gyshUserDeleteBlockReason({ targetId: u.id, actorId: currentUserId });
    if (blocked) {
      setError(blocked);
      setPendingDelete(null);
      return;
    }
    setBusyKind("delete");
    setBusy(true);
    setError("");
    setSaveMsg("");
    try {
      await deleteUser(u.id);
      setPendingDelete(null);
      await reload();
      setSaveMsg(`Deleted ${u.name}.`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete member.");
    } finally {
      setBusy(false);
    }
  };

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
      <BusyOverlay
        active={loading || busy}
        message={
          loading
            ? "Loading memberships…"
            : busyKind === "delete"
              ? "Deleting member…"
              : "Removing membership…"
        }
      />

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
              Members grouped by Free → Elite level from D1. Open Blueprints under Dashboard to see
              that member’s saved Match Wizard results. Dashboard opens their My Dashboard. Change a
              member’s plan on their Users Area profile (including the first-5 complimentary
              Starter). Remove plan drops a paid member to Free without deleting the account.
              Delete member asks “Are you sure?” on that member’s row (Tina and Evelyn stay
              protected).
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

      <FoundingStarterTracker users={users} onJumpToMember={jumpToMember} />

      {saveMsg && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 8,
            background: "rgba(74,107,82,0.12)",
            border: "1px solid rgba(74,107,82,0.35)",
            color: "#4A6B52",
            fontSize: "0.95rem",
          }}
        >
          {saveMsg}
        </div>
      )}

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
                const blueprintsOpen = Boolean(openBlueprintIds[u.id]);
                const links = memberPreviewLinks(u);
                return (
                  <li
                    key={u.id}
                    className={`memberships-page__card${pendingDelete?.id === u.id ? " memberships-page__row--pending-delete" : ""}${blueprintsOpen ? " is-open" : ""}${highlightId === u.id ? " is-highlight" : ""}`}
                    data-testid={`memberships-row-${u.id}`}
                    ref={(node) => {
                      if (node && pendingDelete?.id === u.id) {
                        node.scrollIntoView({ behavior: "smooth", block: "nearest" });
                      }
                    }}
                  >
                    <div className="memberships-page__row">
                    <div>
                      <strong style={{ color: "var(--charcoal)" }}>{u.name}</strong>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                        {u.email}
                      </div>
                      <div className="memberships-page__member-links">
                        <a
                          href={links.dashboardHref}
                          className="memberships-page__member-link"
                          data-testid={`memberships-dashboard-${u.id}`}
                          onClick={(e) => {
                            if (!onViewMemberDashboard) return;
                            e.preventDefault();
                            onViewMemberDashboard(u);
                          }}
                        >
                          <LayoutDashboard size={14} aria-hidden />
                          Dashboard
                        </a>
                        <MembershipMemberBlueprints
                          userId={u.id}
                          open={blueprintsOpen}
                          countHint={blueprintCounts ? (blueprintCounts[u.id] ?? 0) : null}
                          onToggle={() =>
                            setOpenBlueprintIds((prev) => ({ ...prev, [u.id]: !prev[u.id] }))
                          }
                        />
                      </div>
                      {pendingDelete?.id === u.id ? (
                        <ConfirmDeleteUserBanner
                          name={pendingDelete.name}
                          email={pendingDelete.email}
                          userId={u.id}
                          busy={busy}
                          onCancel={() => setPendingDelete(null)}
                          onConfirm={() => void confirmRemoveMember()}
                        />
                      ) : null}
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
                    <div className="memberships-page__expiry">
                      <label className="memberships-page__expiry-label" htmlFor={`membership-expires-${u.id}`}>
                        Expires
                      </label>
                      <input
                        id={`membership-expires-${u.id}`}
                        type="date"
                        className="memberships-page__expiry-input"
                        data-testid={`memberships-expires-${u.id}`}
                        value={expiryEdits[u.id] ?? (u.membershipExpiresAt || "")}
                        onChange={(e) =>
                          setExpiryEdits((prev) => ({ ...prev, [u.id]: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-outline memberships-page__expiry-save"
                        data-testid={`memberships-expires-save-${u.id}`}
                        disabled={busy}
                        onClick={() => void saveExpiry(u)}
                      >
                        Save date
                      </button>
                      <span className="memberships-page__charge">
                        {membershipChargeStatus({
                          membershipTier: u.membershipTier,
                          notes: u.notes,
                          lastPaidAt: u.membershipLastPaidAt,
                        }).label}
                      </span>
                    </div>
                    <div className="memberships-page__actions">
                      {(() => {
                        const clearBlocked = gyshMembershipClearBlockReason({
                          targetId: u.id,
                          currentTier: u.membershipTier,
                        });
                        const deleteBlocked = gyshUserDeleteBlockReason({
                          targetId: u.id,
                          actorId: currentUserId,
                        });
                        return (
                          <>
                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={() => void removePlan(u)}
                              disabled={busy || Boolean(clearBlocked)}
                              title={clearBlocked ?? "Set this member to Free"}
                              data-testid={`memberships-clear-${u.id}`}
                            >
                              Remove plan
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => requestRemoveMember(u)}
                              disabled={busy || Boolean(deleteBlocked)}
                              title={deleteBlocked ?? "Permanently delete this member"}
                              data-testid={`memberships-delete-${u.id}`}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </>
                        );
                      })()}
                    </div>
                    </div>
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
