/** Signed-in users must sign in again after an hour of no screen activity. */

export const SESSION_IDLE_TIMEOUT_MS = 60 * 60 * 1000;
export const SESSION_IDLE_STORAGE_KEY = 'myplan_session_last_activity_v1';
export const SESSION_IDLE_RELOGIN_MESSAGE =
  'You were signed out after 1 hour of inactivity. Please sign in again.';

export const SESSION_IDLE_ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'pointerdown',
  'wheel',
] as const;

export type SessionIdleCheck =
  | { ok: true; lastActivityAt: number; seeded?: boolean }
  | { ok: false; reason: 'idle_expired' };

function storage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

export function sessionIdleExpired(lastActivityAt: number | null | undefined, now = Date.now()): boolean {
  if (!lastActivityAt || !Number.isFinite(lastActivityAt)) return false;
  return now - lastActivityAt >= SESSION_IDLE_TIMEOUT_MS;
}

export function readLastActivityAt(store: Pick<Storage, 'getItem'> | null = storage()): number | null {
  if (!store) return null;
  const raw = Number(store.getItem(SESSION_IDLE_STORAGE_KEY) || '');
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}

export function writeLastActivityAt(
  now = Date.now(),
  store: Pick<Storage, 'getItem' | 'setItem'> | null = storage(),
): number {
  if (store) store.setItem(SESSION_IDLE_STORAGE_KEY, String(now));
  return now;
}

export function clearLastActivityAt(store: Pick<Storage, 'removeItem'> | null = storage()): void {
  store?.removeItem(SESSION_IDLE_STORAGE_KEY);
}

export function touchSessionActivity(now = Date.now()): number {
  return writeLastActivityAt(now);
}

/** Logged-in session with no stamp starts the hour now. Idle ≥ 1 hour must re-login. */
export function resolveSessionIdle(input: {
  hasSession: boolean;
  lastActivityAt: number | null;
  now?: number;
}): SessionIdleCheck {
  if (!input.hasSession) {
    return { ok: true, lastActivityAt: input.lastActivityAt ?? 0 };
  }
  const now = input.now ?? Date.now();
  if (!input.lastActivityAt) {
    return { ok: true, lastActivityAt: now, seeded: true };
  }
  if (sessionIdleExpired(input.lastActivityAt, now)) {
    return { ok: false, reason: 'idle_expired' };
  }
  return { ok: true, lastActivityAt: input.lastActivityAt };
}

export function idleSessionMustRelogin(
  hasSession: boolean,
  lastActivityAt: number | null,
  now = Date.now(),
): boolean {
  return resolveSessionIdle({ hasSession, lastActivityAt, now }).ok === false;
}
