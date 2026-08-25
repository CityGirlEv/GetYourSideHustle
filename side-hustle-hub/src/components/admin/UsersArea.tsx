import { useEffect, useMemo, useRef, useState } from "react";
import { Users, Plus, Pencil, Check, X } from "lucide-react";
import { BusyOverlay, WaitIndicator } from "../WaitFeedback";
import { PasswordField } from "../PasswordField";
import {
  GYSH_ROLE_ACCENT,
  GYSH_ROLE_DESCRIPTIONS,
  GYSH_ROLE_LABELS,
  GYSH_ROLE_SHORT,
  GYSH_ROLES,
  contrastTextForBg,
  fetchUsers,
  saveUser,
  userHasRole,
  userRoles,
  type GyshRole,
  type GyshUser,
} from "../../lib/gysh-roles";
import { ApiError } from "../../lib/api";

type EditDraft = {
  name: string;
  email: string;
  roles: GyshRole[];
  status: GyshUser["status"];
  notes: string;
  password: string;
};

function blankDraft(u: GyshUser): EditDraft {
  return {
    name: u.name,
    email: u.email,
    roles: userRoles(u),
    status: u.status,
    notes: u.notes,
    password: "",
  };
}

function toggleRole(current: GyshRole[], role: GyshRole): GyshRole[] {
  if (current.includes(role)) {
    const next = current.filter((r) => r !== role);
    return next.length > 0 ? next : current;
  }
  return [...current, role];
}

function RoleBubble({
  role,
  active,
  onClick,
  disabled,
  title,
}: {
  role: GyshRole;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  const accent = GYSH_ROLE_ACCENT[role];
  const bg = active ? accent : "#FFFFFF";
  const fg = active ? contrastTextForBg(accent) : "#181718";
  const dot = active ? (fg === "#FFFFFF" ? "rgba(255,255,255,0.95)" : accent) : accent;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title ?? GYSH_ROLE_DESCRIPTIONS[role]}
      aria-pressed={active}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 999,
        border: `1.5px solid ${accent}`,
        background: bg,
        color: fg,
        WebkitTextFillColor: fg,
        fontSize: "0.9375rem",
        fontWeight: active ? 700 : 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        boxShadow: active ? `0 1px 0 rgba(0,0,0,0.08)` : "none",
        transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: dot,
          flexShrink: 0,
          border: active && fg !== "#FFFFFF" ? `1px solid ${fg}` : undefined,
        }}
      />
      {GYSH_ROLE_SHORT[role]}
    </button>
  );
}

/** Role bubbles: assigned roles highlighted; click toggles; + adds a missing role. */
function RoleBubbles({
  value,
  onChange,
  disabled,
  showAll = false,
  onMenuOpenChange,
}: {
  value: GyshRole[];
  onChange: (roles: GyshRole[]) => void;
  disabled?: boolean;
  /** When true, show every role (muted if not assigned). When false, only assigned + add. */
  showAll?: boolean;
  /** Notify parent so the card can raise above sibling sections while the menu is open. */
  onMenuOpenChange?: (open: boolean) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const missing = GYSH_ROLES.filter((r) => !value.includes(r));
  const visible = showAll ? GYSH_ROLES : value;

  const setOpen = (open: boolean) => {
    setMenuOpen(open);
    onMenuOpenChange?.(open);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        onMenuOpenChange?.(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen, onMenuOpenChange]);

  return (
    <div
      ref={wrapRef}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        position: "relative",
        zIndex: menuOpen ? 2 : "auto",
      }}
    >
      {visible.map((r) => {
        const active = value.includes(r);
        return (
          <RoleBubble
            key={r}
            role={r}
            active={active}
            disabled={disabled || (active && value.length === 1)}
            title={
              active && value.length === 1
                ? "At least one role is required"
                : active
                  ? `Remove ${GYSH_ROLE_LABELS[r]}`
                  : `Add ${GYSH_ROLE_LABELS[r]}`
            }
            onClick={() => onChange(toggleRole(value, r))}
          />
        );
      })}

      {missing.length > 0 && (
        <div style={{ position: "relative", zIndex: menuOpen ? 3 : "auto" }}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(!menuOpen)}
            title="Add a role"
            aria-label="Add a role"
            aria-expanded={menuOpen}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1.5px dashed var(--bronze)",
              background: menuOpen ? "rgba(215,198,151,0.35)" : "#fff",
              color: "var(--bronze)",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <Plus size={16} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                zIndex: 1000,
                minWidth: 180,
                padding: 8,
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "#fff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)", padding: "2px 6px 6px" }}>
                Add role
              </div>
              {missing.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onChange([...value, r]);
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "0.95rem",
                    color: "var(--charcoal)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(215,198,151,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: GYSH_ROLE_ACCENT[r],
                    }}
                  />
                  {GYSH_ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function UsersArea() {
  const [users, setUsers] = useState<GyshUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | GyshRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | GyshUser["status"]>("all");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newRoles, setNewRoles] = useState<GyshRole[]>(["adult"]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [roleBusyId, setRoleBusyId] = useState<string | null>(null);
  const [roleMenuUserId, setRoleMenuUserId] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await fetchUsers());
    } catch (e) {
      setUsers([]);
      setError(e instanceof ApiError ? e.message : "Failed to load users from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && !userHasRole(u, roleFilter)) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const counts = useMemo(() => {
    return GYSH_ROLES.reduce(
      (acc, r) => {
        acc[r] = users.filter((u) => userHasRole(u, r)).length;
        return acc;
      },
      {} as Record<GyshRole, number>,
    );
  }, [users]);

  const addUser = async () => {
    if (!name.trim() || !email.trim()) return;
    const rolesToSave: GyshRole[] =
      newRoles.length > 0 ? newRoles : roleFilter !== "all" ? [roleFilter] : ["adult"];
    setBusy(true);
    setSaveMsg("");
    setError("");
    try {
      await saveUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        roles: rolesToSave,
        status: "pending",
        notes: "",
        joinedAt: new Date().toISOString().slice(0, 10),
      });
      setName("");
      setEmail("");
      await reload();
      setSaveMsg(
        roleFilter !== "all"
          ? `User added with ${GYSH_ROLE_SHORT[roleFilter]} role. Adjust roles on their card if needed.`
          : "User added with Adult role. Adjust roles on their card if needed.",
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to add user.");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (u: GyshUser) => {
    setEditingId(u.id);
    setDraft(blankDraft(u));
    setSaveMsg("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const persistRoles = async (u: GyshUser, nextRoles: GyshRole[]) => {
    if (nextRoles.length === 0) {
      setSaveMsg("At least one role is required.");
      return;
    }
    const prev = userRoles(u);
    if (prev.length === nextRoles.length && prev.every((r) => nextRoles.includes(r))) return;

    setRoleBusyId(u.id);
    setError("");
    setSaveMsg("");
    // Optimistic update
    setUsers((list) =>
      list.map((row) =>
        row.id === u.id ? { ...row, roles: nextRoles, role: nextRoles[0] ?? row.role } : row,
      ),
    );
    try {
      const saved = await saveUser({
        id: u.id,
        name: u.name,
        email: u.email,
        roles: nextRoles,
        status: u.status,
        notes: u.notes,
        joinedAt: u.joinedAt,
      });
      setUsers((list) => list.map((row) => (row.id === u.id ? saved : row)));
      setSaveMsg(`Roles updated for ${u.name}.`);
    } catch (e) {
      setUsers((list) => list.map((row) => (row.id === u.id ? u : row)));
      setError(e instanceof ApiError ? e.message : "Failed to update roles.");
    } finally {
      setRoleBusyId(null);
    }
  };

  const saveEdit = async (id: string) => {
    if (!draft) return;
    const existing = users.find((u) => u.id === id);
    if (!existing) return;

    const nextEmail = draft.email.trim().toLowerCase();
    const nextName = draft.name.trim();
    if (!nextName || !nextEmail) {
      setSaveMsg("Name and email are required.");
      return;
    }
    if (draft.roles.length === 0) {
      setSaveMsg("Select at least one role.");
      return;
    }
    if (draft.password.trim() && draft.password.trim().length < 5) {
      setSaveMsg("Password must be at least 5 characters.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await saveUser(
        {
          id,
          name: nextName,
          email: nextEmail,
          roles: draft.roles,
          status: draft.status,
          notes: draft.notes.trim(),
          joinedAt: existing.joinedAt,
        },
        draft.password.trim() || undefined,
      );
      setEditingId(null);
      setDraft(null);
      await reload();
      setSaveMsg(draft.password.trim() ? "User saved. Login password updated." : "User saved.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save user.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <BusyOverlay
        active={busy || loading || roleBusyId !== null}
        message={loading ? "Loading users…" : "Saving user…"}
      />
      <div className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
        <h2 style={{ fontSize: "1.5rem", color: "var(--charcoal)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={22} style={{ color: "var(--bronze)" }} /> Users Area
        </h2>
        <p style={{ color: "var(--text-primary)", marginTop: "6px", fontSize: "1rem" }}>
          GYSH audiences in production D1 — Admin, QA, Dev, Kids, Teens, Adult, Senior, and Beta Tester. Assigned roles show as
          highlighted bubbles; click a bubble to toggle, or use + to add a role. Failed tests assign to Evelyn (Dev).
          Passwords are never shown — only set or reset from Edit.
        </p>

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginTop: "18px" }}
          role="group"
          aria-label="Filter users by role"
        >
          <button
            type="button"
            className="glass"
            onClick={() => setRoleFilter("all")}
            aria-pressed={roleFilter === "all"}
            data-testid="users-filter-all"
            style={{
              padding: "14px",
              textAlign: "left",
              cursor: "pointer",
              border: roleFilter === "all" ? "1.5px solid var(--bronze)" : "1px solid var(--border-color)",
              background: roleFilter === "all" ? "rgba(215,198,151,0.45)" : "#fff",
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--charcoal)", display: "flex", alignItems: "center", gap: 8 }}>
              <span
                aria-hidden
                style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--bronze)" }}
              />
              All
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--bronze)" }}>{users.length}</div>
            <div style={{ fontSize: "1rem", color: "var(--text-primary)", marginTop: 4 }}>All users</div>
          </button>
          {GYSH_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              className="glass"
              onClick={() => setRoleFilter(r)}
              aria-pressed={roleFilter === r}
              data-testid={`users-filter-${r}`}
              style={{
                padding: "14px",
                textAlign: "left",
                cursor: "pointer",
                border: roleFilter === r ? `1.5px solid ${GYSH_ROLE_ACCENT[r]}` : "1px solid var(--border-color)",
                background: roleFilter === r ? "rgba(215,198,151,0.45)" : "#fff",
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--charcoal)", display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  aria-hidden
                  style={{ width: 8, height: 8, borderRadius: "50%", background: GYSH_ROLE_ACCENT[r] }}
                />
                {GYSH_ROLE_SHORT[r]}
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: GYSH_ROLE_ACCENT[r] }}>{counts[r]}</div>
              <div style={{ fontSize: "1rem", color: "var(--text-primary)", marginTop: 4 }}>{GYSH_ROLE_LABELS[r]}</div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(155,47,40,0.1)", border: "1px solid rgba(155,47,40,0.35)", color: "#9B2F28", fontSize: "0.95rem" }}>
          {error}
        </div>
      )}

      <div className="glass" style={{ padding: "18px", borderRadius: "14px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "end" }}>
          <div className="form-group" style={{ margin: 0, flex: "1 1 160px" }}>
            <label className="form-label">Name</label>
            <input className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
          <div className="form-group" style={{ margin: 0, flex: "1 1 180px" }}>
            <label className="form-label">Email</label>
            <input className="text-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@…" />
          </div>
          <button type="button" className="btn btn-primary" onClick={() => void addUser()} disabled={busy || Boolean(error && loading)}>
            <Plus size={14} /> Add user
          </button>
          <select
            className="select-input"
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | GyshUser["status"])}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Roles</label>
          <RoleBubbles value={newRoles} onChange={setNewRoles} showAll disabled={busy} />
        </div>
      </div>

      {saveMsg && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(95,122,69,0.12)", border: "1px solid rgba(95,122,69,0.35)", color: "#3f5230", fontSize: "0.95rem" }}>
          {saveMsg}
        </div>
      )}

      {loading ? (
        <WaitIndicator message="Loading users from database…" style={{ marginTop: 0 }} />
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--text-primary)" }}>
          {roleFilter !== "all" || statusFilter !== "all"
            ? "No users match the current filters. Choose All users (and All statuses) to see everyone."
            : "No users yet."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((u) => {
            const isEditing = editingId === u.id && draft;
            const currentRoles = userRoles(u);
            const menuOpenHere = roleMenuUserId === u.id;
            return (
              <div
                key={u.id}
                className="glass"
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  position: "relative",
                  zIndex: menuOpenHere ? 40 : "auto",
                }}
              >
                {!isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr auto", gap: "12px", alignItems: "start" }}>
                      <div>
                        <strong style={{ color: "var(--charcoal)" }}>{u.name}</strong>
                        <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>{u.email}</div>
                        <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)", marginTop: 4 }}>{u.notes || "—"}</div>
                        {u.canLogin && (
                          <div style={{ fontSize: "0.9375rem", color: "var(--bronze)", marginTop: 4 }}>Portal login account</div>
                        )}
                      </div>
                      <div style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>
                        {u.status} · Joined {u.joinedAt}
                      </div>
                      <button type="button" className="btn btn-outline" onClick={() => startEdit(u)} style={{ padding: "8px 12px" }}>
                        <Pencil size={14} /> Edit
                      </button>
                    </div>
                    <div>
                      <div style={{ fontSize: "1rem", color: "var(--text-primary)", marginBottom: 6, fontWeight: 600 }}>
                        Roles
                      </div>
                      <RoleBubbles
                        value={currentRoles}
                        onChange={(next) => void persistRoles(u, next)}
                        disabled={busy || roleBusyId === u.id}
                        onMenuOpenChange={(open) => setRoleMenuUserId(open ? u.id : null)}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Name</label>
                        <input className="text-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Email</label>
                        <input className="text-input" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Status</label>
                        <select className="select-input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as GyshUser["status"] })}>
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                      <PasswordField
                        label="Password (login)"
                        value={draft.password}
                        onChange={(value) => setDraft({ ...draft, password: value })}
                        placeholder="Leave blank to keep current"
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Roles</label>
                      <RoleBubbles
                        value={draft.roles}
                        onChange={(next) => setDraft({ ...draft, roles: next })}
                        showAll
                        disabled={busy}
                        onMenuOpenChange={(open) => setRoleMenuUserId(open ? u.id : null)}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Notes</label>
                      <textarea className="text-input" rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} style={{ resize: "vertical" }} />
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button type="button" className="btn btn-primary" onClick={() => void saveEdit(u.id)} disabled={busy}>
                        <Check size={14} /> Save
                      </button>
                      <button type="button" className="btn btn-outline" onClick={cancelEdit}>
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
