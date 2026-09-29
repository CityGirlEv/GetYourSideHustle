/**
 * Where GYSH keeps the bearer token + “tab alive” marker.
 * Production: session store (tab close → must sign in again).
 * Localhost: local store (survives refresh, new tabs, and browser restart).
 */

import { getLocalStore, getSessionStore } from "./browser-storage";
import { isLocalDevHost } from "./d1-errors";

export const SESSION_TOKEN_KEY = "gysh_session_token";
export const TAB_ALIVE_KEY = "gysh_tab_alive";
/** Localhost-only: last /auth/me (or login) user so HMR reloads stay signed in. */
export const CACHED_AUTH_USER_KEY = "gysh_cached_auth_user";

export function shouldPersistSessionLocally(
  hostname: string | undefined = typeof window !== "undefined" ? window.location.hostname : undefined,
): boolean {
  return isLocalDevHost(hostname);
}

/** Read token — local prefers durable store, then session (legacy same-tab). */
export function readSessionToken(): string | null {
  if (shouldPersistSessionLocally()) {
    return getLocalStore().getItem(SESSION_TOKEN_KEY) || getSessionStore().getItem(SESSION_TOKEN_KEY);
  }
  return getSessionStore().getItem(SESSION_TOKEN_KEY);
}

export function writeSessionToken(token: string | null): void {
  if (token) {
    if (shouldPersistSessionLocally()) {
      getLocalStore().setItem(SESSION_TOKEN_KEY, token);
    }
    getSessionStore().setItem(SESSION_TOKEN_KEY, token);
    return;
  }
  getSessionStore().removeItem(SESSION_TOKEN_KEY);
  getLocalStore().removeItem(SESSION_TOKEN_KEY);
  clearCachedAuthUser();
}

export function readTabAlive(): boolean {
  if (shouldPersistSessionLocally()) {
    return (
      getLocalStore().getItem(TAB_ALIVE_KEY) === "1" ||
      getSessionStore().getItem(TAB_ALIVE_KEY) === "1"
    );
  }
  return getSessionStore().getItem(TAB_ALIVE_KEY) === "1";
}

export function writeTabAlive(alive: boolean): void {
  if (alive) {
    if (shouldPersistSessionLocally()) {
      getLocalStore().setItem(TAB_ALIVE_KEY, "1");
    }
    getSessionStore().setItem(TAB_ALIVE_KEY, "1");
    return;
  }
  getSessionStore().removeItem(TAB_ALIVE_KEY);
  getLocalStore().removeItem(TAB_ALIVE_KEY);
}

export type CachedAuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  status: string;
  joinedAt: string;
  notes: string;
  canLogin: boolean;
  membershipTier?: string;
  audience?: string;
};

export function readCachedAuthUser(): CachedAuthUser | null {
  if (!shouldPersistSessionLocally()) return null;
  try {
    const raw = getLocalStore().getItem(CACHED_AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedAuthUser;
    if (!parsed?.id || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCachedAuthUser(user: CachedAuthUser | null): void {
  if (!shouldPersistSessionLocally()) return;
  if (!user) {
    getLocalStore().removeItem(CACHED_AUTH_USER_KEY);
    return;
  }
  try {
    getLocalStore().setItem(CACHED_AUTH_USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore quota */
  }
}

export function clearCachedAuthUser(): void {
  getLocalStore().removeItem(CACHED_AUTH_USER_KEY);
}
