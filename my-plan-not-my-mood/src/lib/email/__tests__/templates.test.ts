import { describe, expect, it } from 'vitest';
import {
  buildLoginUrl,
  buildSignupPendingHtml,
  buildSignupPendingSubject,
  buildSignupConfirmationHtml,
  buildSignupConfirmationSubject,
  buildBetaTesterConfirmationSubject,
  buildUserApprovedHtml,
  buildUserApprovedSubject,
  buildAdminNewSignupHtml,
  buildPasswordResetHtml,
  buildPasswordResetSubject,
} from '../templates';

describe('email templates', () => {
  it('builds login URL with auth query params', () => {
    expect(buildLoginUrl('https://nonnegotiation.com', 'Pat@Example.com')).toBe(
      'https://nonnegotiation.com/?auth=login&email=pat%40example.com',
    );
  });

  it('builds signup confirmation subject and html without a login button', () => {
    expect(buildSignupConfirmationSubject()).toMatch(/We got your signup/i);
    expect(buildBetaTesterConfirmationSubject()).toMatch(/Stand by, Beta Tester/i);
    const html = buildSignupConfirmationHtml({ name: 'Pat', email: 'pat@example.com', wantsBeta: true });
    expect(html).toContain('Pat');
    expect(html).toContain('pat@example.com');
    expect(html).toContain('pending activation');
    expect(html).toContain('Beta Tester');
    expect(html).toContain('Stand by');
    expect(html).toContain('instructions and assignments');
    expect(html).toContain('/beta-guide');
    expect(html).toContain('/beta-rewards');
    expect(html).not.toContain('auth=login');
    expect(html).toContain('official_logo_seal.png');
    const regular = buildSignupConfirmationHtml({ name: 'Pat', email: 'pat@example.com', wantsBeta: false });
    expect(regular).not.toContain('Stand by');
    expect(regular).toContain('We got your signup');
  });

  it('builds signup pending subject and html', () => {
    expect(buildSignupPendingSubject()).toContain('pending approval');
    const html = buildSignupPendingHtml({ name: 'Pat', email: 'pat@example.com', wantsBeta: true });
    expect(html).toContain('Pat');
    expect(html).toContain('Beta Tester');
    expect(html).toContain('instructions and assignments');
    expect(html).toContain('pending administrator approval');
    expect(html).toContain('official_logo_seal.png');
    expect(html).toContain('https://nonnegotiation.com');
    expect(html).toContain('Accountability Protocol');
  });

  it('escapes html in user-provided names', () => {
    const html = buildSignupPendingHtml({ name: '<script>', email: 'x@y.com', wantsBeta: false });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('builds approval email with login link', () => {
    const loginUrl = buildLoginUrl('https://nonnegotiation.com', 'pat@example.com');
    expect(buildUserApprovedSubject()).toContain('approved');
    const html = buildUserApprovedHtml({ name: 'Pat', email: 'pat@example.com', loginUrl });
    expect(html).toContain('auth=login');
    expect(html).toContain('pat%40example.com');
    expect(html).toContain('official_logo_seal.png');
    expect(html).toContain('https://nonnegotiation.com');
  });

  it('builds admin new signup alert', () => {
    const html = buildAdminNewSignupHtml(
      { name: 'Sam', email: 'sam@example.com', wantsBeta: false, phone: '(619) 555-0100' },
      'https://nonnegotiation.com/admin?tab=users',
    );
    expect(html).toContain('sam@example.com');
    expect(html).toContain('(619) 555-0100');
    expect(html).toContain('admin?tab=users');
    expect(html).toContain('official_logo_seal.png');
    expect(html).toContain('Feel it. Follow the Plan anyway.');
  });

  it('builds a password reset email with the reset link', () => {
    expect(buildPasswordResetSubject()).toMatch(/Reset your/i);
    const html = buildPasswordResetHtml({
      name: 'Pat',
      email: 'pat@example.com',
      resetUrl: 'https://nonnegotiation.com/?reset=abc123',
    });
    expect(html).toContain('pat@example.com');
    expect(html).toContain('reset=abc123');
    expect(html).toContain('same browser');
    expect(html).toContain('official_logo_seal.png');
  });
});
