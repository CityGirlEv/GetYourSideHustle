import { wrapEmailHtml } from './email/emailChrome';
import { DEFAULT_FROM_ADDRESS, isValidEmail, normalizeEmail } from './email/sendPayload';
import { HEAR_ABOUT_US_LABEL, hearAboutUsLabel, validateHearAboutUs } from './hearAboutUs';

export const CONTACT_NAME_MAX = 40;
export const CONTACT_SUBJECT_MAX = 120;
export const CONTACT_MESSAGE_MIN = 10;
export const CONTACT_MESSAGE_MAX = 2000;
export const CONTACT_INBOX_EMAIL = DEFAULT_FROM_ADDRESS;
export const CONTACT_EMAIL_API_PATH = '/api/email/contact';
export const CONTACT_TEMPLATE_ID = 'contact-note';
export const CONTACT_TEMPLATE_NAME = 'Contact form';

export type ContactFormField = 'firstName' | 'lastName' | 'email' | 'heardAbout' | 'subject' | 'message';

export type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  heardAbout: string;
  subject: string;
  message: string;
};

export type ContactFormInput = Partial<Record<ContactFormField | 'name', string>>;

export type ContactFormResult =
  | { ok: true; values: ContactFormValues }
  | { ok: false; error: string; field: ContactFormField };

function clip(value: string | undefined): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function splitLegacyName(name: string): { firstName: string; lastName: string } {
  const parts = clip(name).split(' ');
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
}

export function contactDisplayName(values: Pick<ContactFormValues, 'firstName' | 'lastName'>): string {
  return [values.firstName, values.lastName].filter(Boolean).join(' ');
}

function looksLikeExtraPii(value: string): boolean {
  return value.includes('@') || /\d{6,}/.test(value);
}

export function validateContactForm(input: ContactFormInput): ContactFormResult {
  const legacy = splitLegacyName(input.name ?? '');
  const firstName = clip(input.firstName) || legacy.firstName;
  const lastName = clip(input.lastName) || legacy.lastName;
  const email = input.email ? normalizeEmail(input.email) : '';
  const subject = clip(input.subject);
  const message = String(input.message ?? '').replace(/\r\n/g, '\n').trim();
  const heard = validateHearAboutUs(input.heardAbout, true);

  if (!firstName) return { ok: false, field: 'firstName', error: 'First name is required.' };
  if (firstName.length > CONTACT_NAME_MAX) {
    return { ok: false, field: 'firstName', error: `First name must be ${CONTACT_NAME_MAX} characters or fewer.` };
  }
  if (looksLikeExtraPii(firstName)) {
    return { ok: false, field: 'firstName', error: 'First name cannot include an email or phone number.' };
  }
  if (!lastName) return { ok: false, field: 'lastName', error: 'Last name is required.' };
  if (lastName.length > CONTACT_NAME_MAX) {
    return { ok: false, field: 'lastName', error: `Last name must be ${CONTACT_NAME_MAX} characters or fewer.` };
  }
  if (looksLikeExtraPii(lastName)) {
    return { ok: false, field: 'lastName', error: 'Last name cannot include an email or phone number.' };
  }
  if (!heard.ok) return { ok: false, field: 'heardAbout', error: heard.error };
  if (!email) return { ok: false, field: 'email', error: 'Email is required.' };
  if (!isValidEmail(email)) return { ok: false, field: 'email', error: 'Enter a valid email address.' };
  if (!subject) return { ok: false, field: 'subject', error: 'Subject is required.' };
  if (subject.length > CONTACT_SUBJECT_MAX) {
    return { ok: false, field: 'subject', error: `Subject must be ${CONTACT_SUBJECT_MAX} characters or fewer.` };
  }
  if (!message) return { ok: false, field: 'message', error: 'Message is required.' };
  if (message.length < CONTACT_MESSAGE_MIN) {
    return { ok: false, field: 'message', error: `Message must be at least ${CONTACT_MESSAGE_MIN} characters.` };
  }
  if (message.length > CONTACT_MESSAGE_MAX) {
    return { ok: false, field: 'message', error: `Message must be ${CONTACT_MESSAGE_MAX} characters or fewer.` };
  }

  return {
    ok: true,
    values: { firstName, lastName, email, heardAbout: heard.value, subject, message },
  };
}

export function buildContactMailto(values: ContactFormValues, to = CONTACT_INBOX_EMAIL): string {
  const heard = hearAboutUsLabel(values.heardAbout) || values.heardAbout;
  const body = [
    `First name: ${values.firstName}`,
    `Last name: ${values.lastName}`,
    `Email: ${values.email}`,
    `${HEAR_ABOUT_US_LABEL}: ${heard}`,
    '',
    values.message,
  ].join('\n');
  return `mailto:${to}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;
}

export function buildContactNoteSubject(subject: string): string {
  const trimmed = clip(subject);
  return `Contact: ${trimmed}`.slice(0, 200);
}

export function buildContactNoteHtml(values: ContactFormValues): string {
  const message = escapeHtml(values.message).replace(/\n/g, '<br />');
  const heard = escapeHtml(hearAboutUsLabel(values.heardAbout) || values.heardAbout);
  return wrapEmailHtml(`
    <div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
      <h1 style="color: #C2410C; font-size: 20px;">New contact note</h1>
      <p><strong>First name:</strong> ${escapeHtml(values.firstName)}</p>
      <p><strong>Last name:</strong> ${escapeHtml(values.lastName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(values.email)}</p>
      <p><strong>${escapeHtml(HEAR_ABOUT_US_LABEL)}:</strong> ${heard}</p>
      <p><strong>Subject:</strong> ${escapeHtml(values.subject)}</p>
      <p style="margin-top:16px;">${message}</p>
    </div>
  `);
}

export function contactInboxRecipients(
  adminNotify?: string | null,
  brandInbox = CONTACT_INBOX_EMAIL,
): string[] {
  const inbox = normalizeEmail(brandInbox || CONTACT_INBOX_EMAIL);
  const extra = adminNotify ? normalizeEmail(adminNotify) : '';
  if (extra && extra !== inbox && isValidEmail(extra)) return [inbox, extra];
  return [inbox];
}
