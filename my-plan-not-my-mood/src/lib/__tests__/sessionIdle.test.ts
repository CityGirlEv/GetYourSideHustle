import { afterEach, describe, expect, it } from 'vitest';
import {
  SESSION_IDLE_RELOGIN_MESSAGE,
  SESSION_IDLE_STORAGE_KEY,
  SESSION_IDLE_TIMEOUT_MS,
  clearLastActivityAt,
  idleSessionMustRelogin,
  readLastActivityAt,
  resolveSessionIdle,
  sessionIdleExpired,
  touchSessionActivity,
  writeLastActivityAt,
} from '../sessionIdle';

describe('sessionIdle', () => {
  afterEach(() => {
    clearLastActivityAt();
  });

  it('keeps a signed-in session before one hour of idle time', () => {
    expect(SESSION_IDLE_TIMEOUT_MS).toBe(60 * 60 * 1000);
    expect(SESSION_IDLE_RELOGIN_MESSAGE).toMatch(/1 hour/i);
    const now = 1_000_000;
    expect(sessionIdleExpired(now - SESSION_IDLE_TIMEOUT_MS + 1, now)).toBe(false);
    expect(idleSessionMustRelogin(true, now - 30 * 60 * 1000, now)).toBe(false);
    expect(resolveSessionIdle({ hasSession: true, lastActivityAt: now - 1, now }).ok).toBe(true);
  });

  it('requires sign-in again after one hour idle, including the exact hour mark', () => {
    const now = 2_000_000;
    expect(sessionIdleExpired(now - SESSION_IDLE_TIMEOUT_MS, now)).toBe(true);
    expect(sessionIdleExpired(now - SESSION_IDLE_TIMEOUT_MS - 1, now)).toBe(true);
    expect(idleSessionMustRelogin(true, now - SESSION_IDLE_TIMEOUT_MS, now)).toBe(true);
    expect(resolveSessionIdle({ hasSession: true, lastActivityAt: now - SESSION_IDLE_TIMEOUT_MS, now })).toEqual({
      ok: false,
      reason: 'idle_expired',
    });
  });

  it('does not force login when nobody is signed in, and seeds a missing stamp', () => {
    const now = 3_000_000;
    expect(idleSessionMustRelogin(false, null, now)).toBe(false);
    expect(sessionIdleExpired(null, now)).toBe(false);
    expect(resolveSessionIdle({ hasSession: true, lastActivityAt: null, now })).toEqual({
      ok: true,
      lastActivityAt: now,
      seeded: true,
    });
  });

  it('persists activity and clears it on demand', () => {
    writeLastActivityAt(12345);
    expect(readLastActivityAt()).toBe(12345);
    expect(window.localStorage.getItem(SESSION_IDLE_STORAGE_KEY)).toBe('12345');
    touchSessionActivity(99999);
    expect(readLastActivityAt()).toBe(99999);
    clearLastActivityAt();
    expect(readLastActivityAt()).toBeNull();
  });
});
