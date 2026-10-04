import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ScrollText } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { hustleById } from "../../lib/side-hustle-catalog";
import { freeGuideCardLine } from "../../lib/wizard-comp-pick";
import type { GyshRole, GyshUser } from "../../lib/gysh-roles";
import { WaitIndicator } from "../WaitFeedback";

type WizardBlueprintRow = {
  userId: string;
  userName: string;
  email: string;
  status: string;
  audience: string;
  role: GyshRole;
  roles: GyshRole[];
  membershipTier: string;
  ageGroup: string;
  topResultId: string;
  resultIds: string[];
  completedAt: string;
  source: string;
  childName: string;
  freeGuideId: string;
};

type SortMode = "user" | "blueprint";

type UserCard = {
  key: string;
  label: string;
  email: string;
  user: GyshUser | null;
  topBlueprint: string;
  freeGuideLine: string;
  rows: WizardBlueprintRow[];
};

function hustleName(id: string): string {
  const name = hustleById(id)?.name;
  return name || id || "—";
}

function userLabel(row: WizardBlueprintRow): string {
  const name = row.userName.trim() || row.email || "Unknown user";
  return row.childName ? `${name} · ${row.childName}` : name;
}

function rowAsUser(row: WizardBlueprintRow): GyshUser | null {
  if (!row.userId || row.status === "deleted") return null;
  const status =
    row.status === "pending" || row.status === "disabled" ? row.status : "active";
  return {
    id: row.userId,
    name: row.userName.trim() || row.email || "Member",
    email: row.email,
    role: row.role || "adult",
    roles: row.roles?.length ? row.roles : [row.role || "adult"],
    status,
    joinedAt: row.completedAt || "",
    notes: "",
    audience: row.audience || row.ageGroup,
    membershipTier: row.membershipTier || undefined,
  };
}

function groupUsers(rows: WizardBlueprintRow[], sort: SortMode): UserCard[] {
  const byKey = new Map<string, WizardBlueprintRow[]>();
  for (const row of rows) {
    const key = row.userId || row.email || userLabel(row);
    const list = byKey.get(key) ?? [];
    list.push(row);
    byKey.set(key, list);
  }
  const cards: UserCard[] = [];
  for (const [key, list] of byKey) {
    const sample = list[0];
    const latest = [...list].sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0] ?? sample;
    const freeGuideId = list.map((row) => row.freeGuideId).find((id) => id.trim()) || "";
    cards.push({
      key,
      label: userLabel(sample),
      email: sample.email,
      user: rowAsUser(sample),
      topBlueprint: hustleName(latest.topResultId),
      freeGuideLine: freeGuideCardLine(freeGuideId ? hustleName(freeGuideId) : ""),
      rows: [...list].sort((a, b) => hustleName(a.topResultId).localeCompare(hustleName(b.topResultId))),
    });
  }
  cards.sort((a, b) => {
    if (sort === "blueprint") {
      const byBlueprint = a.topBlueprint.localeCompare(b.topBlueprint);
      if (byBlueprint !== 0) return byBlueprint;
    }
    return a.label.localeCompare(b.label);
  });
  return cards;
}

export function BlueprintList({
  onViewMemberDashboard,
}: {
  onViewMemberDashboard?: (user: GyshUser) => void;
}) {
  const [rows, setRows] = useState<WizardBlueprintRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<SortMode>("user");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api<{ blueprints: WizardBlueprintRow[] }>("admin/wizard-blueprints")
      .then((data) => {
        if (!cancelled) setRows(data.blueprints ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Failed to load blueprint list.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(() => {
    const list = includeDeleted ? rows : rows.filter((row) => row.status !== "deleted");
    return groupUsers(list, sort);
  }, [rows, sort, includeDeleted]);

  const deletedCount = rows.filter((row) => row.status === "deleted").length;

  const toggleCard = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div data-testid="blueprint-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
        <h3 style={{ fontSize: "1.15rem", color: "var(--charcoal)", display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <ScrollText size={18} style={{ color: "var(--bronze)" }} /> Blueprint list
        </h3>
        <p style={{ color: "var(--text-primary)", fontSize: "0.95rem", margin: 0 }}>
          Each member is a card. Open a card to see the blueprints from their Match Wizard.
        </p>
        {error && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(155,47,40,0.1)", border: "1px solid rgba(155,47,40,0.35)", color: "#9B2F28", fontSize: "0.95rem" }}>
            {error}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 14 }}>
          <span style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>Sort by</span>
          <button
            type="button"
            className={`btn ${sort === "user" ? "btn-primary" : "btn-outline"}`}
            data-testid="blueprint-sort-user"
            onClick={() => setSort("user")}
          >
            User
          </button>
          <button
            type="button"
            className={`btn ${sort === "blueprint" ? "btn-primary" : "btn-outline"}`}
            data-testid="blueprint-sort-blueprint"
            onClick={() => setSort("blueprint")}
          >
            Blueprint
          </button>
          {deletedCount > 0 && (
            <label style={{ marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-primary)", fontSize: "0.95rem" }}>
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
              />
              Include deleted accounts ({deletedCount})
            </label>
          )}
        </div>
      </div>

      {loading ? (
        <WaitIndicator message="Loading blueprint list…" style={{ marginTop: 0 }} />
      ) : cards.length === 0 ? (
        <p style={{ margin: 0, color: "var(--text-primary)" }} data-testid="blueprint-list-empty">
          No wizard blueprints yet.
        </p>
      ) : (
        cards.map((card) => {
          const open = openKeys.has(card.key);
          return (
            <article
              key={card.key}
              className="glass"
              data-testid={`blueprint-user-${card.email || card.key}`}
              style={{ borderRadius: 14, padding: "12px 16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  aria-expanded={open}
                  aria-label={`${open ? "Collapse" : "Expand"} ${card.label}`}
                  onClick={() => toggleCard(card.key)}
                  style={{ padding: "6px 8px" }}
                >
                  <ChevronRight
                    size={16}
                    style={{ transform: open ? "rotate(90deg)" : undefined, transition: "transform 0.15s ease" }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => toggleCard(card.key)}
                  style={{
                    flex: 1,
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "inherit",
                  }}
                >
                  <strong style={{ color: "var(--charcoal)", fontSize: "1rem" }}>{card.label}</strong>
                  <div style={{ color: "var(--text-primary)", fontSize: "0.92rem" }}>
                    {card.email || "No email"}
                    {" · "}
                    {card.freeGuideLine}
                  </div>
                </button>
                {card.user ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    data-testid={`blueprint-dashboard-${card.email}`}
                    onClick={() => onViewMemberDashboard?.(card.user as GyshUser)}
                  >
                    Dashboard
                  </button>
                ) : null}
              </div>
              {open && (
                <div style={{ marginTop: 12, overflowX: "auto" }}>
                  <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "8px 6px" }}>Audience</th>
                        <th style={{ textAlign: "left", padding: "8px 6px" }}>Blueprint</th>
                        <th style={{ textAlign: "left", padding: "8px 6px" }}>Also matched</th>
                        <th style={{ textAlign: "left", padding: "8px 6px" }}>Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {card.rows.map((row, index) => {
                        const others = row.resultIds
                          .filter((id) => id && id !== row.topResultId)
                          .map(hustleName);
                        return (
                          <tr key={`${row.completedAt}-${row.topResultId}-${index}`}>
                            <td style={{ padding: "8px 6px" }}>{row.ageGroup || row.audience || "—"}</td>
                            <td style={{ padding: "8px 6px" }}>{hustleName(row.topResultId)}</td>
                            <td style={{ padding: "8px 6px" }}>{others.length ? others.join(", ") : "—"}</td>
                            <td style={{ padding: "8px 6px" }}>{row.completedAt?.slice(0, 10) || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
