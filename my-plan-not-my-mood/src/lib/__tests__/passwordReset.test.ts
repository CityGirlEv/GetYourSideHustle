import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  completePasswordReset,
  PASSWORD_RESET_INVALID_ERROR,
  PASSWORD_RESET_NOTICE,
  PASSWORD_RESET_PENDING_ERROR,
  PASSWORD_RESET_TTL_MS,
  requestPasswordReset,
} from '../passwordReset';
import { getAppUsers, loginUser, registerUser, updateUserProfile } from '../userAuth';

describe('password reset gate', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the same notice for unknown, pending, and active emails', () => {
    registerUser('Pending Pat', 'pending-reset@example.com', 'pending123', 'member', false, { phone: '6195550100' });
    const unknown = requestPasswordReset('nobody@example.com');
    const pending = requestPasswordReset('pending-reset@example.com');
    const active = requestPasswordReset('sarah@example.com');

    expect(unknown.message).toBe(PASSWORD_RESET_NOTICE);
    expect(pending.message).toBe(PASSWORD_RESET_NOTICE);
    expect(active.message).toBe(PASSWORD_RESET_NOTICE);
    expect(unknown.send).toBeUndefined();
    expect(pending.send).toBeUndefined();
    expect(active.send?.email).toBe('sarah@example.com');
    expect(active.send?.resetUrl).toContain('reset=');
  });

  it('does not send a reset for inactive accounts', () => {
    const created = registerUser('Blocked', 'blocked-reset@example.com', 'blocked1', 'member', true, {
      phone: '6195550100',
    });
    updateUserProfile(created.user!.id, { status: 'inactive' });
    const result = requestPasswordReset('blocked-reset@example.com');
    expect(result.send).toBeUndefined();
  });

  it('completes a reset for an active user and consumes the token', () => {
    registerUser('Tester Kim', 'tester-reset@example.com', 'oldpass1', 'member', true, { phone: '6195550100' });
    const requested = requestPasswordReset('tester-reset@example.com', 'https://nonnegotiation.com');
    const token = new URL(requested.send!.resetUrl).searchParams.get('reset');
    expect(token).toBeTruthy();

    const completed = completePasswordReset(token!, 'newpass123');
    expect(completed.success).toBe(true);
    expect(loginUser('tester-reset@example.com', 'oldpass1').success).toBe(false);
    expect(loginUser('tester-reset@example.com', 'newpass123').success).toBe(true);
    expect(completePasswordReset(token!, 'anotherpass').success).toBe(false);
    expect(completePasswordReset(token!, 'anotherpass').error).toBe(PASSWORD_RESET_INVALID_ERROR);
  });

  it('rejects expired tokens', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-02T12:00:00.000Z'));
    registerUser('Tester Kim', 'tester-expire@example.com', 'oldpass1', 'member', true, { phone: '6195550100' });
    const requested = requestPasswordReset('tester-expire@example.com');
    const token = new URL(requested.send!.resetUrl).searchParams.get('reset')!;
    vi.setSystemTime(new Date('2026-09-02T12:00:00.000Z').getTime() + PASSWORD_RESET_TTL_MS + 1);
    const expired = completePasswordReset(token, 'newpass123');
    expect(expired.success).toBe(false);
    expect(expired.error).toBe(PASSWORD_RESET_INVALID_ERROR);
  });

  it('rejects a short password', () => {
    registerUser('Tester Kim', 'tester-short@example.com', 'oldpass1', 'member', true, { phone: '6195550100' });
    const requested = requestPasswordReset('tester-short@example.com');
    const token = new URL(requested.send!.resetUrl).searchParams.get('reset')!;
    const result = completePasswordReset(token, '123');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/at least 6/);
  });

  it('rejects reset when the account is no longer active', () => {
    const created = registerUser('Temp Active', 'temp-reset@example.com', 'temppass', 'member', true, {
      phone: '6195550100',
    });
    const requested = requestPasswordReset('temp-reset@example.com');
    const token = new URL(requested.send!.resetUrl).searchParams.get('reset')!;
    updateUserProfile(created.user!.id, { status: 'pending' });
    const result = completePasswordReset(token, 'newpass123');
    expect(result.success).toBe(false);
    expect(result.error).toBe(PASSWORD_RESET_PENDING_ERROR);
    expect(getAppUsers().find((user) => user.email === 'temp-reset@example.com')?.passwordHash).toBe('temppass');
  });
});
