import type { GyshRole } from "./gysh-roles";
import { GYSH_ROLES } from "./gysh-roles";
import { gyshUserDeleteBlockReason } from "./gysh-user-delete";

export type GyshBulkRolesMode = "set" | "add" | "remove";

export type GyshBulkUserStatus = "active" | "pending" | "disabled";

const BULK_STATUSES: readonly GyshBulkUserStatus[] = ["active", "pending", "disabled"];

/** Normalize and de-dupe user ids for bulk ops. */
export function normalizeBulkUserIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of ids) {
    const id = String(raw || "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function parseBulkUserStatus(value: unknown): GyshBulkUserStatus | null {
  const status = String(value || "").trim().toLowerCase();
  return (BULK_STATUSES as readonly string[]).includes(status)
    ? (status as GyshBulkUserStatus)
    : null;
}

export function parseBulkRolesMode(value: unknown): GyshBulkRolesMode {
  const mode = String(value || "set").trim().toLowerCase();
  if (mode === "add" || mode === "remove") return mode;
  return "set";
}

export function parseBulkRoles(value: unknown): GyshRole[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<string>(GYSH_ROLES);
  const seen = new Set<GyshRole>();
  const out: GyshRole[] = [];
  for (const raw of value) {
    const role = String(raw || "").trim().toLowerCase() as GyshRole;
    if (!allowed.has(role) || seen.has(role)) continue;
    seen.add(role);
    out.push(role);
  }
  return out;
}

/** Apply set/add/remove to current roles. Returns null when result would be empty. */
export function applyBulkRolesChange(
  current: readonly GyshRole[],
  next: readonly GyshRole[],
  mode: GyshBulkRolesMode,
): GyshRole[] | null {
  const base = [...current];
  let result: GyshRole[];
  if (mode === "add") {
    const seen = new Set(base);
    result = [...base];
    for (const role of next) {
      if (seen.has(role)) continue;
      seen.add(role);
      result.push(role);
    }
  } else if (mode === "remove") {
    const remove = new Set(next);
    result = base.filter((r) => !remove.has(r));
  } else {
    result = [...next];
  }
  return result.length > 0 ? result : null;
}

export function gyshBulkDeleteEligibleIds(opts: {
  ids: string[];
  actorId?: string | null;
}): { eligible: string[]; skipped: { id: string; reason: string }[] } {
  const eligible: string[] = [];
  const skipped: { id: string; reason: string }[] = [];
  for (const id of normalizeBulkUserIds(opts.ids)) {
    const reason = gyshUserDeleteBlockReason({ targetId: id, actorId: opts.actorId });
    if (reason) skipped.push({ id, reason });
    else eligible.push(id);
  }
  return { eligible, skipped };
}

export function gyshBulkUpdateBlockReason(opts: {
  ids: unknown;
  status?: unknown;
  roles?: unknown;
  rolesMode?: unknown;
}): string | null {
  const ids = normalizeBulkUserIds(opts.ids);
  if (ids.length === 0) return "Select at least one user.";

  const hasStatus = opts.status != null && String(opts.status).trim() !== "";
  const roles = parseBulkRoles(opts.roles);
  const hasRoles = roles.length > 0;

  if (!hasStatus && !hasRoles) {
    return "Choose a status and/or at least one role to update.";
  }
  if (hasStatus && !parseBulkUserStatus(opts.status)) {
    return "Status must be active, pending, or disabled.";
  }
  if (hasRoles) {
    const mode = parseBulkRolesMode(opts.rolesMode);
    if (mode === "set" && roles.length === 0) {
      return "Select at least one role.";
    }
  }
  return null;
}

export function gyshBulkDeleteConfirmMessage(count: number): string {
  const n = Math.max(0, Math.floor(count));
  if (n <= 0) return "Select at least one user to delete.";
  if (n === 1) {
    return "Are you sure you want to delete 1 selected user? The account will be flagged deleted (kept on file). That email can sign up again as a new account.";
  }
  return `Are you sure you want to delete ${n} selected users? Accounts will be flagged deleted (kept on file). Those emails can sign up again as new accounts.`;
}
