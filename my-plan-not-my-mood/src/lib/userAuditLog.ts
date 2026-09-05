/** Account activity for the Users Area — per-user collapsible logs plus one full list. */

export const USER_AUDIT_STORAGE_KEY = 'myplan_user_audit_log_v1';
export const MAX_AUDIT_ENTRIES = 400;
export const USER_AUDIT_LOG_LABEL = 'Audit log';
export const FULL_AUDIT_LOG_HEADING = 'Full audit log';
export const USER_AUDIT_EMPTY = 'No audit events yet.';
export const FULL_AUDIT_EMPTY = 'No audit events yet. Sign-ins, sign-ups, and account changes appear here.';
export const AUDIT_BACKFILL_DAYS = 7;
export const AUDIT_RECOVERED_DETAIL = 'Recovered from user record';

export type UserAuditAction =
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'register'
  | 'profile_update'
  | 'roles_changed'
  | 'status_changed'
  | 'password_changed'
  | 'deleted';

export const AUDIT_ACTION_LABELS: Record<UserAuditAction, string> = {
  login: 'Signed in',
  login_failed: 'Sign-in failed',
  logout: 'Signed out',
  register: 'Account created',
  profile_update: 'Profile updated',
  roles_changed: 'Roles changed',
  status_changed: 'Status changed',
  password_changed: 'Password changed',
  deleted: 'Account deleted',
};

export interface UserAuditEntry {
  id: string;
  at: string;
  action: UserAuditAction;
  userId: string;
  userName: string;
  userEmail: string;
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  summary: string;
  detail?: string;
}

const ACTIONS = new Set<string>(Object.keys(AUDIT_ACTION_LABELS));

export function isUserAuditAction(value: unknown): value is UserAuditAction {
  return typeof value === 'string' && ACTIONS.has(value);
}

export function auditActionLabel(action: UserAuditAction | string): string {
  return isUserAuditAction(action) ? AUDIT_ACTION_LABELS[action] : action;
}

export function userAuditToggleLabel(count: number): string {
  return `${USER_AUDIT_LOG_LABEL} (${Math.max(0, count)})`;
}

export function formatAuditWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso ?? '');
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
}

export function auditActorFromUser(user?: {
  id?: string;
  name?: string;
  email?: string;
} | string | null): Pick<UserAuditEntry, 'actorId' | 'actorName' | 'actorEmail'> {
  if (!user || typeof user === 'string') return {};
  const actorId = String(user.id ?? '').trim();
  const actorName = String(user.name ?? '').trim();
  const actorEmail = String(user.email ?? '').trim();
  return {
    actorId: actorId || undefined,
    actorName: actorName || undefined,
    actorEmail: actorEmail || undefined,
  };
}

function normalizeEntry(raw: unknown): UserAuditEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Partial<UserAuditEntry>;
  if (!isUserAuditAction(row.action)) return null;
  const id = String(row.id ?? '').trim();
  const at = String(row.at ?? '').trim();
  const userId = String(row.userId ?? '').trim();
  const userEmail = String(row.userEmail ?? '').trim();
  if (!id || !at || (!userId && !userEmail)) return null;
  const summary = String(row.summary ?? '').trim() || auditActionLabel(row.action);
  const detail = String(row.detail ?? '').trim();
  return {
    id,
    at,
    action: row.action,
    userId,
    userName: String(row.userName ?? '').trim() || userEmail || 'Unknown',
    userEmail,
    actorId: String(row.actorId ?? '').trim() || undefined,
    actorName: String(row.actorName ?? '').trim() || undefined,
    actorEmail: String(row.actorEmail ?? '').trim() || undefined,
    summary,
    detail: detail || undefined,
  };
}

export function sortAuditLogNewestFirst(entries: UserAuditEntry[]): UserAuditEntry[] {
  return entries
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const byTime = String(b.row.at).localeCompare(String(a.row.at));
      if (byTime !== 0) return byTime;
      return a.index - b.index;
    })
    .map((item) => item.row);
}

export function trimAuditLog(entries: UserAuditEntry[], max = MAX_AUDIT_ENTRIES): UserAuditEntry[] {
  return sortAuditLogNewestFirst(entries).slice(0, Math.max(0, max));
}

export function getUserAuditLog(): UserAuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USER_AUDIT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return trimAuditLog(parsed.map(normalizeEntry).filter((row): row is UserAuditEntry => Boolean(row)));
  } catch {
    return [];
  }
}

function writeAuditLog(entries: UserAuditEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_AUDIT_STORAGE_KEY, JSON.stringify(trimAuditLog(entries)));
  } catch {
    /* ignore QuotaExceededError */
  }
}

export function recordUserAudit(
  input: Omit<UserAuditEntry, 'id' | 'at'> & { id?: string; at?: string },
): UserAuditEntry {
  const entry: UserAuditEntry = {
    id: String(input.id ?? '').trim() || `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: String(input.at ?? '').trim() || new Date().toISOString(),
    action: input.action,
    userId: String(input.userId ?? '').trim(),
    userName: String(input.userName ?? '').trim() || input.userEmail || 'Unknown',
    userEmail: String(input.userEmail ?? '').trim(),
    actorId: input.actorId,
    actorName: input.actorName,
    actorEmail: input.actorEmail,
    summary: String(input.summary ?? '').trim() || auditActionLabel(input.action),
    detail: String(input.detail ?? '').trim() || undefined,
  };
  writeAuditLog([entry, ...getUserAuditLog()]);
  return entry;
}

export function auditLogForUser(entries: UserAuditEntry[], userId: string): UserAuditEntry[] {
  const id = String(userId ?? '').trim();
  if (!id) return [];
  return entries.filter((row) => row.userId === id);
}

export function auditCountForUser(entries: UserAuditEntry[], userId: string): number {
  return auditLogForUser(entries, userId).length;
}

export function defaultUserAuditOpen(): Record<string, boolean> {
  return {};
}

export function isUserAuditOpen(open: Record<string, boolean>, userId: string): boolean {
  return open[userId] === true;
}

export function toggleUserAuditOpen(
  open: Record<string, boolean>,
  userId: string,
): Record<string, boolean> {
  return { ...open, [userId]: !isUserAuditOpen(open, userId) };
}

export function fullAuditLogSummary(count: number): string {
  if (count <= 0) return FULL_AUDIT_EMPTY;
  return `${count} event${count === 1 ? '' : 's'} across all users`;
}

export type AuditBackfillUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  status?: string;
  wantsBeta?: boolean;
  createdAt?: string;
};

export function auditBackfillSince(now = new Date(), days = AUDIT_BACKFILL_DAYS): Date {
  return new Date(now.getTime() - Math.max(0, days) * 24 * 60 * 60 * 1000);
}

export function recoveredRegisterAuditId(userId: string): string {
  return `backfill-register-${String(userId ?? '').trim()}`;
}

function hasRegisterEvent(entries: UserAuditEntry[], user: AuditBackfillUser): boolean {
  const userId = String(user.id ?? '').trim();
  const email = String(user.email ?? '').trim().toLowerCase();
  return entries.some((row) => {
    if (row.action !== 'register') return false;
    if (userId && row.userId === userId) return true;
    return Boolean(email && row.userEmail.toLowerCase() === email);
  });
}

export function recoveredRegisterEntry(
  user: AuditBackfillUser,
  since: Date,
): UserAuditEntry | null {
  const userId = String(user.id ?? '').trim();
  const userEmail = String(user.email ?? '').trim();
  const createdAt = String(user.createdAt ?? '').trim();
  const at = new Date(createdAt);
  if (!userId && !userEmail) return null;
  if (Number.isNaN(at.getTime()) || at.getTime() < since.getTime()) return null;
  const userName = String(user.name ?? '').trim() || userEmail || 'Unknown';
  const role = String(user.role ?? 'member').trim() || 'member';
  const status = String(user.status ?? 'active').trim() || 'active';
  const bits = [AUDIT_RECOVERED_DETAIL];
  if (user.wantsBeta) bits.push('Beta Test applicant');
  return {
    id: recoveredRegisterAuditId(userId || userEmail),
    at: at.toISOString(),
    action: 'register',
    userId,
    userName,
    userEmail,
    summary: `Account created as ${role} (${status})`,
    detail: bits.join(' · '),
  };
}

export function mergeAuditLog(existing: UserAuditEntry[], incoming: UserAuditEntry[]): UserAuditEntry[] {
  const seenIds = new Set(existing.map((row) => row.id));
  const seenKeys = new Set(existing.map((row) => `${row.userId}:${row.action}:${row.at}`));
  const extra = incoming.filter((row) => {
    if (seenIds.has(row.id)) return false;
    const key = `${row.userId}:${row.action}:${row.at}`;
    if (seenKeys.has(key)) return false;
    seenIds.add(row.id);
    seenKeys.add(key);
    return true;
  });
  return trimAuditLog([...extra, ...existing]);
}

/** Reconstruct last-week register events from the user roster (audit log started later). */
export function backfillUserAuditFromUsers(
  users: AuditBackfillUser[],
  existing: UserAuditEntry[] = getUserAuditLog(),
  now = new Date(),
): UserAuditEntry[] {
  const since = auditBackfillSince(now);
  const recovered = users
    .map((user) => (hasRegisterEvent(existing, user) ? null : recoveredRegisterEntry(user, since)))
    .filter((row): row is UserAuditEntry => Boolean(row));
  const next = mergeAuditLog(existing, recovered);
  writeAuditLog(next);
  return next;
}
