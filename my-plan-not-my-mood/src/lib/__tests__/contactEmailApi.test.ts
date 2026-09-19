import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sendViaResend, persistEmailSendLog } = vi.hoisted(() => ({
  sendViaResend: vi.fn(),
  persistEmailSendLog: vi.fn(),
}));

vi.mock('../../../functions/_shared/resend', async () => {
  const actual = await vi.importActual<typeof import('../../../functions/_shared/resend')>(
    '../../../functions/_shared/resend',
  );
  return { ...actual, sendViaResend };
});

vi.mock('../../../functions/_shared/emailSendLog', () => ({
  persistEmailSendLog,
}));

import { onRequest, onRequestPost } from '../../../functions/api/email/contact';

function request(body: unknown) {
  return new Request('https://nonnegotiation.com/api/email/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const valid = {
  name: 'Pat',
  email: 'pat@example.com',
  subject: 'Shop question',
  message: 'I want to know when the next drop lands.',
};

describe('contact email API', () => {
  beforeEach(() => {
    sendViaResend.mockReset();
    persistEmailSendLog.mockReset().mockResolvedValue(undefined);
  });

  it('accepts POST through onRequest and rejects other methods', async () => {
    sendViaResend.mockResolvedValue({ ok: true, id: 're_123' });
    const posted = await onRequest({
      request: request(valid),
      env: { RESEND_API_KEY: 're_test' },
    });
    expect(posted.status).toBe(200);
    const get = await onRequest({
      request: new Request('https://nonnegotiation.com/api/email/contact', { method: 'GET' }),
      env: {},
    });
    expect(get.status).toBe(405);
  });

  it('rejects an incomplete note', async () => {
    const response = await onRequestPost({ request: request({ name: 'Pat' }), env: {} });
    expect(response.status).toBe(400);
    const data = (await response.json()) as { error?: string };
    expect(data.error).toMatch(/email/i);
    expect(sendViaResend).not.toHaveBeenCalled();
  });

  it('returns 503 when Resend is not configured', async () => {
    const response = await onRequestPost({ request: request(valid), env: {} });
    expect(response.status).toBe(503);
    const data = (await response.json()) as { skipped?: boolean };
    expect(data.skipped).toBe(true);
    expect(sendViaResend).not.toHaveBeenCalled();
    expect(persistEmailSendLog).toHaveBeenCalled();
  });

  it('sends to the brand inbox with the visitor as reply-to', async () => {
    sendViaResend.mockResolvedValue({ ok: true, id: 're_123', html: '<p>ok</p>' });
    const response = await onRequestPost({
      request: request(valid),
      env: { RESEND_API_KEY: 're_test', ADMIN_NOTIFY_EMAIL: 'evelyn3@cox.net' },
    });
    expect(response.status).toBe(200);
    expect(sendViaResend).toHaveBeenCalledWith(
      expect.objectContaining({ RESEND_API_KEY: 're_test' }),
      expect.objectContaining({
        to: ['info@nonnegotiation.com', 'evelyn3@cox.net'],
        replyTo: 'pat@example.com',
        subject: 'Contact: Shop question',
      }),
    );
  });
});
