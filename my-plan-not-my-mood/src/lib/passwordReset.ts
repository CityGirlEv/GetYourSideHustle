import { updateAdminPasswordByEmail } from './adminAuth';
import {
  canonicalizeEmail,
  getAppUsers,
  STORAGE_USERS_KEY,
  useLocalUserStore,
} from './userAuth';

export const PASSWORD_RESET_STORAGE_KEY = 'myplan_password_reset_tokens_v1';
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export const PASSWORD_RESET_NOTICE =
  'If that email belongs to an activated account, we sent a reset link. Check your inbox and spam folder.';

export const PASSWORD_RESET_INVALID_ERROR =
  'This reset link is invalid or has expired. Request a new one from the same browser where you signed up.';

export const PASSWORD_RESET_PENDING_ERROR =
  'This account is not active yet. You will get an email when it is activated, then you can sign in or reset your password.';

export const PASSWORD_RESET_MIN_LENGTH = 6;

export interface PasswordResetTokenRecord {
  token: string;
  email: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface PasswordResetSendPayload {
  name: string;
  email: string;
  resetUrl: string;
}

export interface PasswordResetRequestResult {
  ok: true;
  message: string;
  send?: PasswordResetSendPayload;
}

function readTokens(): PasswordResetTokenRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(PASSWORD_RESET_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTokens(tokens: PasswordResetTokenRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PASSWORD_RESET_STORAGE_KEY, JSON.stringify(tokens));
}

function pruneExpiredTokens(now = Date.now()): PasswordResetTokenRecord[] {
  const live = readTokens().filter((entry) => entry.expiresAt > now);
  writeTokens(live);
  return live;
}

export function createPasswordResetToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`;
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

export function buildPasswordResetUrl(appUrl: string, token: string): string {
  const base = appUrl.replace(/\/$/, '');
  const params = new URLSearchParams({ reset: token });
  return `${base}/?${params.toString()}`;
}

export function requestPasswordReset(
  email: string,
  appUrl = 'https://nonnegotiation.com',
): PasswordResetRequestResult {
  const message = PASSWORD_RESET_NOTICE;
  pruneExpiredTokens();

  const normalizedEmail = canonicalizeEmail(email);
  if (!normalizedEmail) {
    return { ok: true, message };
  }

  const found = getAppUsers().find((user) => canonicalizeEmail(user.email) === normalizedEmail);
  if (!found || found.status !== 'active') {
    return { ok: true, message };
  }

  const now = Date.now();
  const token = createPasswordResetToken();
  const remaining = pruneExpiredTokens(now).filter((entry) => entry.email !== found.email);
  remaining.push({
    token,
    email: found.email,
    userId: found.id,
    createdAt: now,
    expiresAt: now + PASSWORD_RESET_TTL_MS,
  });
  writeTokens(remaining);

  return {
    ok: true,
    message,
    send: {
      name: found.name,
      email: found.email,
      resetUrl: buildPasswordResetUrl(appUrl, token),
    },
  };
}

export async function requestPasswordResetAsync(
  email: string,
  appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nonnegotiation.com',
): Promise<PasswordResetRequestResult> {
  if (useLocalUserStore()) return requestPasswordReset(email, appUrl);
  const { apiRequestPasswordReset } = await import('./usersApi');
  const res = await apiRequestPasswordReset(email, appUrl);
  return { ok: true, message: res.message || PASSWORD_RESET_NOTICE };
}

export function readPasswordResetToken(token: string): PasswordResetTokenRecord | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  const found = pruneExpiredTokens().find((entry) => entry.token === trimmed);
  return found ?? null;
}

export function completePasswordReset(
  token: string,
  newPassword: string,
): { success: boolean; error?: string } {
  const password = newPassword.trim();
  if (password.length < PASSWORD_RESET_MIN_LENGTH) {
    return {
      success: false,
      error: `Password must be at least ${PASSWORD_RESET_MIN_LENGTH} characters.`,
    };
  }

  const record = readPasswordResetToken(token);
  if (!record) {
    return { success: false, error: PASSWORD_RESET_INVALID_ERROR };
  }

  const users = getAppUsers();
  const index = users.findIndex(
    (user) =>
      user.id === record.userId || canonicalizeEmail(user.email) === canonicalizeEmail(record.email),
  );
  if (index < 0) {
    writeTokens(readTokens().filter((entry) => entry.token !== record.token));
    return { success: false, error: PASSWORD_RESET_INVALID_ERROR };
  }

  const user = users[index];
  if (user.status !== 'active') {
    writeTokens(readTokens().filter((entry) => entry.token !== record.token));
    return { success: false, error: PASSWORD_RESET_PENDING_ERROR };
  }

  users[index] = { ...user, passwordHash: password };
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  updateAdminPasswordByEmail(user.email, password);
  writeTokens(readTokens().filter((entry) => entry.token !== record.token));

  return { success: true };
}

export async function completePasswordResetAsync(
  token: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  if (useLocalUserStore()) return completePasswordReset(token, newPassword);
  const { apiConfirmPasswordReset } = await import('./usersApi');
  const res = await apiConfirmPasswordReset(token, newPassword);
  if (!res.ok) return { success: false, error: res.error || PASSWORD_RESET_INVALID_ERROR };
  return { success: true };
}
