import { beforeEach, describe, expect, it } from 'vitest';
import {
  createEmailSendLogEntry,
  emailSendLogForTemplate,
  emailSendLogStatusFromResult,
  parseEmailSendLog,
  prependEmailSendLog,
  readEmailSendLog,
  recordEmailSendLog,
} from '../sendLog';

describe('email send log', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('maps send results and keeps only that template’s rows', () => {
    expect(emailSendLogStatusFromResult({ ok: true })).toBe('sent');
    expect(emailSendLogStatusFromResult({ ok: true, skipped: true })).toBe('skipped');
    expect(emailSendLogStatusFromResult({ ok: false, error: 'nope' })).toBe('failed');

    const sent = createEmailSendLogEntry({
      templateId: 'signup-confirmation',
      templateName: 'Signup confirmation',
      to: 'evelyn3@cox.net',
      subject: '[TEST] We got your signup',
      status: 'sent',
      test: true,
      now: new Date('2026-09-03T17:00:00.000Z'),
    });
    const other = createEmailSendLogEntry({
      templateId: 'password-reset',
      to: 'pat@example.com',
      subject: 'Reset',
      status: 'failed',
      now: new Date('2026-09-03T17:01:00.000Z'),
    });
    const log = prependEmailSendLog(prependEmailSendLog([], other), sent);
    const mine = emailSendLogForTemplate(log, 'signup-confirmation');
    expect(mine).toHaveLength(1);
    expect(mine[0]?.to).toBe('evelyn3@cox.net');
    expect(mine[0]?.status).toBe('sent');
    expect(emailSendLogForTemplate(log, '')).toEqual([]);
  });

  it('records a Send Test entry in local storage', () => {
    const entry = recordEmailSendLog({
      templateId: 'user-approved',
      templateName: 'User approved',
      to: 'angela@example.com',
      subject: '[TEST] You are approved',
      status: 'skipped',
      detail: 'Email service not configured',
      test: true,
    });
    expect(entry.test).toBe(true);
    expect(readEmailSendLog()[0]?.id).toBe(entry.id);
    expect(parseEmailSendLog([{ ...entry, status: 'bogus' }])).toEqual([]);
  });
});
