import { describe, expect, it } from 'vitest';
import {
  CONTACT_INBOX_EMAIL,
  buildContactMailto,
  buildContactNoteHtml,
  buildContactNoteSubject,
  contactInboxRecipients,
  validateContactForm,
} from '../contactForm';

describe('contactForm', () => {
  it('accepts a complete note and builds a branded contact email', () => {
    const result = validateContactForm({
      name: 'Pat',
      email: 'Pat@Example.com',
      subject: 'Shop question',
      message: 'I want to know when the next drop lands.',
    });
    expect(result).toMatchObject({
      ok: true,
      values: {
        name: 'Pat',
        email: 'pat@example.com',
        subject: 'Shop question',
      },
    });
    if (!result.ok) return;
    const mailto = buildContactMailto(result.values);
    expect(mailto.startsWith(`mailto:${CONTACT_INBOX_EMAIL}?`)).toBe(true);
    expect(mailto).toContain(encodeURIComponent('Shop question'));
    expect(buildContactNoteSubject(result.values.subject)).toBe('Contact: Shop question');
    const html = buildContactNoteHtml(result.values);
    expect(html).toContain('Pat');
    expect(html).toContain('pat@example.com');
    expect(html).toContain('Shop question');
    expect(html).toContain('next drop lands');
    expect(html).toContain('official_logo_seal.png');
    expect(contactInboxRecipients()).toEqual([CONTACT_INBOX_EMAIL]);
    expect(contactInboxRecipients('evelyn3@cox.net')).toEqual([CONTACT_INBOX_EMAIL, 'evelyn3@cox.net']);
    expect(contactInboxRecipients(CONTACT_INBOX_EMAIL)).toEqual([CONTACT_INBOX_EMAIL]);
  });

  it('rejects missing and invalid fields', () => {
    const missingName = validateContactForm({});
    expect(missingName.ok).toBe(false);
    if (missingName.ok) return;
    expect(missingName.field).toBe('name');

    const missingEmail = validateContactForm({ name: 'Pat' });
    expect(missingEmail.ok).toBe(false);
    if (missingEmail.ok) return;
    expect(missingEmail.field).toBe('email');

    const badEmail = validateContactForm({ name: 'Pat', email: 'nope' });
    expect(badEmail.ok).toBe(false);
    if (badEmail.ok) return;
    expect(badEmail.field).toBe('email');

    const missingSubject = validateContactForm({ name: 'Pat', email: 'pat@example.com' });
    expect(missingSubject.ok).toBe(false);
    if (missingSubject.ok) return;
    expect(missingSubject.field).toBe('subject');

    const missingMessage = validateContactForm({ name: 'Pat', email: 'pat@example.com', subject: 'Hi' });
    expect(missingMessage.ok).toBe(false);
    if (missingMessage.ok) return;
    expect(missingMessage.field).toBe('message');

    const shortMessage = validateContactForm({
      name: 'Pat',
      email: 'pat@example.com',
      subject: 'Hi',
      message: 'Too short',
    });
    expect(shortMessage.ok).toBe(false);
    if (shortMessage.ok) return;
    expect(shortMessage.field).toBe('message');
  });
});
