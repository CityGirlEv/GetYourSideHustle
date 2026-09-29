/**
 * Client → D1 user/auth API (shared directory for Angela, Evelyn, testers).
 */

import type { AppUser, UserRole, UserStatus } from './userAuth';

const SESSION_TOKEN_KEY = 'nmp_session_token';

export function getStoredSessionToken(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(SESSION_TOKEN_KEY) || localStorage.getItem(SESSION_TOKEN_KEY) || '';
}

export function storeSessionToken(token: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  const value = String(token || '').trim();
  if (!value) {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    return;
  }
  sessionStorage.setItem(SESSION_TOKEN_KEY, value);
  localStorage.setItem(SESSION_TOKEN_KEY, value);
}

function authHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  const token = getStoredSessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseJson<T>(res: Response): Promise<T & { error?: string }> {
  const text = await res.text();
  try {
    return (text ? JSON.parse(text) : {}) as T & { error?: string };
  } catch {
    return { error: text.slice(0, 200) || `HTTP ${res.status}` } as T & { error?: string };
  }
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(true),
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJson<{ ok?: boolean; user?: AppUser; sessionToken?: string; error?: string }>(
    res,
  );
  if (!res.ok || !data.user) {
    return { success: false, error: data.error || 'Sign-in failed.' };
  }
  storeSessionToken(data.sessionToken);
  return { success: true, user: data.user };
}

export async function apiRegister(input: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  wantsBeta?: boolean;
  phone?: string;
  createdByAdmin?: boolean;
}): Promise<{ success: boolean; user?: AppUser; error?: string; message?: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(true),
    body: JSON.stringify(input),
  });
  const data = await parseJson<{
    ok?: boolean;
    user?: AppUser;
    sessionToken?: string;
    message?: string;
    error?: string;
  }>(res);
  if (!res.ok || !data.user) {
    return { success: false, error: data.error || 'Registration failed.' };
  }
  if (data.sessionToken) storeSessionToken(data.sessionToken);
  return { success: true, user: data.user, message: data.message };
}

export async function apiLogout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: authHeaders(true),
      body: '{}',
    });
  } catch {
    /* ignore */
  }
  storeSessionToken(null);
}

export async function apiMe(): Promise<AppUser | null> {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  const data = await parseJson<{ user?: AppUser | null }>(res);
  return data.user ?? null;
}

export async function apiListUsers(): Promise<AppUser[]> {
  const res = await fetch('/api/users', {
    method: 'GET',
    credentials: 'include',
    headers: authHeaders(),
  });
  const data = await parseJson<{ users?: AppUser[]; error?: string }>(res);
  if (!res.ok) throw new Error(data.error || 'Failed to load users');
  return data.users ?? [];
}

export async function apiCreateUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  wantsBeta?: boolean;
}): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const res = await fetch('/api/users', {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(true),
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ ok?: boolean; user?: AppUser; error?: string }>(res);
  if (!res.ok || !data.user) return { success: false, error: data.error || 'Create failed' };
  return { success: true, user: data.user };
}

export async function apiUpdateUser(
  id: string,
  updates: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    roles?: UserRole[];
    status?: UserStatus;
    wantsBeta?: boolean;
    phone?: string;
  },
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const res = await fetch('/api/users', {
    method: 'PUT',
    credentials: 'include',
    headers: authHeaders(true),
    body: JSON.stringify({ id, ...updates }),
  });
  const data = await parseJson<{ ok?: boolean; user?: AppUser; error?: string }>(res);
  if (!res.ok || !data.user) return { success: false, error: data.error || 'Update failed' };
  return { success: true, user: data.user };
}

export async function apiDeleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch('/api/users', {
    method: 'DELETE',
    credentials: 'include',
    headers: authHeaders(true),
    body: JSON.stringify({ id }),
  });
  const data = await parseJson<{ ok?: boolean; error?: string }>(res);
  if (!res.ok) return { success: false, error: data.error || 'Delete failed' };
  return { success: true };
}

export async function apiImportLocalUsers(
  users: unknown[],
): Promise<{ imported: number; skipped: number; error?: string }> {
  const res = await fetch('/api/users', {
    method: 'POST',
    credentials: 'include',
    headers: authHeaders(true),
    body: JSON.stringify({ action: 'import', users }),
  });
  const data = await parseJson<{ ok?: boolean; imported?: number; skipped?: number; error?: string }>(
    res,
  );
  if (!res.ok) return { imported: 0, skipped: 0, error: data.error || 'Import failed' };
  return { imported: data.imported ?? 0, skipped: data.skipped ?? 0 };
}

export async function apiRequestPasswordReset(
  email: string,
  appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nonnegotiation.com',
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const res = await fetch('/api/auth/password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'request', email, appUrl }),
  });
  const data = await parseJson<{ ok?: boolean; message?: string; error?: string }>(res);
  if (!res.ok) return { ok: false, error: data.error || 'Reset request failed' };
  return { ok: true, message: data.message };
}

export async function apiConfirmPasswordReset(
  token: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('/api/auth/password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'confirm', token, password }),
  });
  const data = await parseJson<{ ok?: boolean; error?: string }>(res);
  if (!res.ok) return { ok: false, error: data.error || 'Reset failed' };
  return { ok: true };
}
