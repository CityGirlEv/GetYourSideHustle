import { afterEach, describe, expect, it } from 'vitest';
import {
  JOIN_THE_MOVEMENT_LABEL,
  MAILING_LIST_FIELDS,
  MAILING_LIST_HYPE,
  MAILING_LIST_NOT_MEMBERSHIP_NOTE,
  MAILING_LIST_STORAGE_KEY,
  mailingListAllowsOptionalPhone,
  mailingListCollectsPhoneOrAddress,
  mailingListIsMembership,
  readMailingListSignups,
  subscribeToMailingList,
  validateMailingListSignup,
} from '../mailingList';

describe('mailingList', () => {
  afterEach(() => {
    window.localStorage.removeItem(MAILING_LIST_STORAGE_KEY);
  });

  it('accepts email and an optional first name', () => {
    expect(MAILING_LIST_FIELDS).toEqual(['email', 'firstName', 'lastName', 'phone', 'heardAbout']);
    expect(mailingListIsMembership()).toBe(false);
    expect(mailingListCollectsPhoneOrAddress()).toBe(false);
    expect(mailingListAllowsOptionalPhone()).toBe(true);
    expect(MAILING_LIST_HYPE).toMatch(/Get in first/i);
    expect(MAILING_LIST_NOT_MEMBERSHIP_NOTE).toMatch(/not a membership/i);
    expect(MAILING_LIST_NOT_MEMBERSHIP_NOTE).toContain(JOIN_THE_MOVEMENT_LABEL);
    expect(JOIN_THE_MOVEMENT_LABEL).toBe('Join the Movement');
    expect(validateMailingListSignup({ email: 'Pat@Example.com', firstName: 'Pat' })).toMatchObject({
      ok: true,
      signup: { email: 'pat@example.com', firstName: 'Pat' },
    });
    expect(validateMailingListSignup({ email: '  pat@example.com  ' }).ok).toBe(true);
  });

  it('rejects empty, invalid, overlong, and extra-PII first names', () => {
    expect(validateMailingListSignup({ email: '' }).ok).toBe(false);
    expect(validateMailingListSignup({ email: 'not-an-email' }).ok).toBe(false);
    expect(validateMailingListSignup({ email: 'pat@example.com', firstName: 'x'.repeat(41) }).ok).toBe(false);
    expect(validateMailingListSignup({ email: 'pat@example.com', firstName: 'pat@example.com' }).ok).toBe(false);
    expect(validateMailingListSignup({ email: 'pat@example.com', firstName: '6195079568' }).ok).toBe(false);
  });

  it('persists a signup and rejects duplicates', () => {
    const first = subscribeToMailingList({ email: 'pat@example.com', firstName: 'Pat' });
    expect(first.ok).toBe(true);
    expect(readMailingListSignups()).toHaveLength(1);
    const dup = subscribeToMailingList({ email: 'PAT@example.com' });
    expect(dup.ok).toBe(false);
    expect(dup.ok === false && dup.error).toMatch(/already/i);
    expect(readMailingListSignups()).toHaveLength(1);
  });

  it('keeps phone optional and stores a valid US number', () => {
    expect(validateMailingListSignup({ email: 'pat@example.com' }).ok).toBe(true);
    expect(validateMailingListSignup({ email: 'pat@example.com', phone: '123' }).ok).toBe(false);
    const withPhone = validateMailingListSignup({ email: 'pat@example.com', phone: '6195550100' });
    expect(withPhone).toMatchObject({
      ok: true,
      signup: { phone: '(619) 555-0100' },
    });
  });
});
