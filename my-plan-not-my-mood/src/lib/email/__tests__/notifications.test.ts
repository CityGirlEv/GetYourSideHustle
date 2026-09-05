import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  sendPasswordResetEmail,
  sendSignupConfirmationEmail,
  sendSignupPendingEmail,
  sendTestEmail,
  sendUserApprovedEmail,
  shouldSendApprovalEmail,
} from '../notifications';
import { shouldAutoSendSignupConfirmation } from '../sendSettings';

describe('email notifications', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('shouldSendApprovalEmail only when pending becomes active', () => {
    expect(shouldSendApprovalEmail('pending', 'active')).toBe(true);
    expect(shouldSendApprovalEmail('inactive', 'active')).toBe(false);
    expect(shouldSendApprovalEmail('pending', 'inactive')).toBe(false);
    expect(shouldSendApprovalEmail('active', 'inactive')).toBe(false);
  });

  it('does not auto-send signup confirmation until settings are turned on', () => {
    expect(shouldAutoSendSignupConfirmation()).toBe(false);
  });

  it('sendSignupConfirmationEmail posts the confirmation to the generic send endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendSignupConfirmationEmail({
      name: 'Pat',
      email: 'pat@example.com',
      wantsBeta: true,
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/email/send',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.to).toBe('pat@example.com');
    expect(body.test).toBe(false);
    expect(body.subject).toMatch(/We got your signup/i);
    expect(body.html).toContain('Pat');
    expect(body.html).not.toMatch(/^\[TEST\]/);
  });

  it('sendTestEmail prefixes the subject and marks the payload as a test', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    await sendTestEmail({
      to: 'evelyn3@cox.net',
      subject: 'We got your signup',
      html: '<p>Hello</p>',
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.to).toBe('evelyn3@cox.net');
    expect(body.test).toBe(true);
    expect(body.subject).toBe('[TEST] We got your signup');
  });

  it('rejects a test send without a valid recipient before calling the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendTestEmail({
      to: 'not-an-email',
      subject: 'Hi',
      html: '<p>Hi</p>',
    });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/valid recipient/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sendSignupPendingEmail posts to signup-pending endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendSignupPendingEmail({
      name: 'Pat',
      email: 'pat@example.com',
      wantsBeta: true,
      phone: '(619) 555-0100',
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/email/signup-pending',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.phone).toBe('(619) 555-0100');
  });

  it('sendUserApprovedEmail posts loginUrl to user-approved endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    await sendUserApprovedEmail({ name: 'Pat', email: 'pat@example.com' });

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.loginUrl).toContain('auth=login');
    expect(body.email).toBe('pat@example.com');
  });

  it('sendPasswordResetEmail posts resetUrl to password-reset endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    await sendPasswordResetEmail({
      name: 'Pat',
      email: 'pat@example.com',
      resetUrl: 'https://nonnegotiation.com/?reset=abc123',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/email/password-reset',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.resetUrl).toContain('reset=abc123');
    expect(body.email).toBe('pat@example.com');
  });

  it('treats network failure as skipped without blocking UX', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const result = await sendSignupPendingEmail({
      name: 'Pat',
      email: 'pat@example.com',
      wantsBeta: false,
    });

    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
  });

  it('returns skipped when API responds 503, 404, or 405', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({ skipped: true }) })
      .mockResolvedValueOnce({ ok: false, status: 405, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    const skipped503 = await sendSignupPendingEmail({
      name: 'Pat',
      email: 'pat@example.com',
      wantsBeta: false,
    });
    const skipped405 = await sendSignupPendingEmail({
      name: 'Pat',
      email: 'pat@example.com',
      wantsBeta: false,
    });

    expect(skipped503).toEqual({ ok: true, skipped: true });
    expect(skipped405).toEqual({ ok: true, skipped: true });
  });
});
