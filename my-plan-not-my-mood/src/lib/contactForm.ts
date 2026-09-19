import { wrapEmailHtml } from './email/emailChrome';
import { DEFAULT_FROM_ADDRESS, isValidEmail, normalizeEmail } from './email/sendPayload';

export const CONTACT_NAME_MAX = 80;
export const CONTACT_SUBJECT_MAX = 120;
export const CONTACT_MESSAGE_MIN = 10;
export const CONTACT_MESSAGE_MAX = 2000;
export const CONTACT_INBOX_EMAIL = DEFAULT_FROM_ADDRESS;
export const CONTACT_EMAIL_API_PATH = '/api/email/contact';
export const CONTACT_TEMPLATE_ID = 'contact-note';
export const CONTACT_TEMPLATE_NAME = 'Contact form';

export type ContactFormField = 'name' | 'email' | 'subject' | 'message';

export type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactFormInput = Partial<Record<ContactFormField, string>>;

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

export function validateContactForm(input: ContactFormInput): ContactFormResult {
  const name = clip(input.name);
  const email = input.email ? normalizeEmail(input.email) : '';
  const subject = clip(input.subject);
  const message = String(input.message ?? '').replace(/\r\n/g, '\n').trim();

  if (!name) return { ok: false, field: 'name', error: 'Name is required.' };
  if (name.length > CONTACT_NAME_MAX) {
    return { ok: false, field: 'name', error: `Name must be ${CONTACT_NAME_MAX} characters or fewer.` };
  }
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

  return { ok: true, values: { name, email, subject, message } };
}

export function buildContactMailto(values: ContactFormValues, to = CONTACT_INBOX_EMAIL): string {
  const body = [`Name: ${values.name}`, `Email: ${values.email}`, '', values.message].join('\n');
  return `mailto:${to}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;
}

export function buildContactNoteSubject(subject: string): string {
  const trimmed = clip(subject);
  return `Contact: ${trimmed}`.slice(0, 200);
}

export function buildContactNoteHtml(values: ContactFormValues): string {
  const message = escapeHtml(values.message).replace(/\n/g, '<br />');
  return wrapEmailHtml(`
    <div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
      <h1 style="color: #C2410C; font-size: 20px;">New contact note</h1>
      <p><strong>Name:</strong> ${escapeHtml(values.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(values.email)}</p>
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
