export const DEFAULT_FROM_ADDRESS = 'info@nonnegotiation.com';
export const DEFAULT_FROM_EMAIL = `My Plan, Not My Mood <${DEFAULT_FROM_ADDRESS}>`;
export const SIGNUP_CONFIRMATION_TEMPLATE_ID = 'signup-confirmation';
export const BETA_TESTER_CONFIRMATION_TEMPLATE_ID = 'beta-tester-confirmation';
export const TEST_SUBJECT_PREFIX = '[TEST] ';
export const MAX_EMAIL_HTML_CHARS = 150_000;
export const MAX_EMAIL_SUBJECT_CHARS = 200;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  return email.length > 3 && email.length <= 254 && EMAIL_PATTERN.test(email);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function buildOutboundSubject(subject: string, test: boolean): string {
  const trimmed = subject.trim().slice(0, MAX_EMAIL_SUBJECT_CHARS);
  if (!test) return trimmed;
  if (trimmed.toUpperCase().startsWith('[TEST]')) return trimmed;
  return `${TEST_SUBJECT_PREFIX}${trimmed}`.slice(0, MAX_EMAIL_SUBJECT_CHARS);
}

export function validateSendEmailBody(input: {
  to?: string;
  subject?: string;
  html?: string;
}): { ok: true; to: string; subject: string; html: string } | { ok: false; error: string } {
  const to = input.to ? normalizeEmail(input.to) : '';
  const subject = input.subject?.trim() || '';
  const html = input.html?.trim() || '';

  if (!isValidEmail(to)) {
    return { ok: false, error: 'A valid recipient email is required.' };
  }
  if (!subject) {
    return { ok: false, error: 'Subject is required.' };
  }
  if (!html) {
    return { ok: false, error: 'HTML body is required.' };
  }
  if (html.length > MAX_EMAIL_HTML_CHARS) {
    return { ok: false, error: 'HTML body is too large to send.' };
  }

  return { ok: true, to, subject: subject.slice(0, MAX_EMAIL_SUBJECT_CHARS), html };
}
