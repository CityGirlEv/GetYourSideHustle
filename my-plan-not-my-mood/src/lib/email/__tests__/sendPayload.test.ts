import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FROM_EMAIL,
  MAX_EMAIL_HTML_CHARS,
  buildOutboundSubject,
  isValidEmail,
  validateSendEmailBody,
} from '../sendPayload';

describe('email send payload', () => {
  it('uses info@nonnegotiation.com as the default from address', () => {
    expect(DEFAULT_FROM_EMAIL).toContain('info@nonnegotiation.com');
    expect(DEFAULT_FROM_EMAIL).toMatch(/^My Plan, Not My Mood </);
  });

  it('accepts only plausible email addresses', () => {
    expect(isValidEmail('evelyn3@cox.net')).toBe(true);
    expect(isValidEmail('  Pat@Example.com  ')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('prefixes test subjects once', () => {
    expect(buildOutboundSubject('We got your signup', true)).toBe('[TEST] We got your signup');
    expect(buildOutboundSubject('[TEST] already', true)).toBe('[TEST] already');
    expect(buildOutboundSubject('We got your signup', false)).toBe('We got your signup');
  });

  it('rejects missing recipient, subject, html, and oversized bodies', () => {
    expect(validateSendEmailBody({ to: 'x', subject: 'Hi', html: '<p>Hi</p>' }).ok).toBe(false);
    expect(validateSendEmailBody({ to: 'pat@example.com', subject: '', html: '<p>Hi</p>' }).ok).toBe(false);
    expect(validateSendEmailBody({ to: 'pat@example.com', subject: 'Hi', html: '' }).ok).toBe(false);
    expect(
      validateSendEmailBody({
        to: 'pat@example.com',
        subject: 'Hi',
        html: 'x'.repeat(MAX_EMAIL_HTML_CHARS + 1),
      }).ok,
    ).toBe(false);
    const ok = validateSendEmailBody({
      to: 'Pat@Example.com',
      subject: 'Hi',
      html: '<p>Hello</p>',
    });
    expect(ok).toEqual({ ok: true, to: 'pat@example.com', subject: 'Hi', html: '<p>Hello</p>' });
  });
});
