import { describe, expect, it } from 'vitest';
import {
  PHONE_INVALID_ERROR,
  PHONE_REQUIRED_ERROR,
  formatPhoneDisplay,
  isValidPhoneNumber,
  normalizePhoneDigits,
  phoneSignupError,
  phoneTelHref,
  storePhoneNumber,
} from '../phoneNumber';

describe('phoneNumber', () => {
  it('normalizes US numbers with punctuation or a leading 1', () => {
    expect(normalizePhoneDigits('(619) 555-0100')).toBe('6195550100');
    expect(normalizePhoneDigits('1-619-555-0100')).toBe('6195550100');
    expect(normalizePhoneDigits('+1 619 555 0100')).toBe('6195550100');
  });

  it('accepts valid 10-digit US numbers and rejects incomplete ones', () => {
    expect(isValidPhoneNumber('6195550100')).toBe(true);
    expect(isValidPhoneNumber('(619) 555-0100')).toBe(true);
    expect(isValidPhoneNumber('555-0100')).toBe(false);
    expect(isValidPhoneNumber('0195550100')).toBe(false);
    expect(isValidPhoneNumber('')).toBe(false);
  });

  it('requires a valid phone on signup so staff can call the person', () => {
    expect(phoneSignupError(undefined)).toBe(PHONE_REQUIRED_ERROR);
    expect(phoneSignupError('')).toBe(PHONE_REQUIRED_ERROR);
    expect(phoneSignupError('123')).toBe(PHONE_INVALID_ERROR);
    expect(phoneSignupError('6195550100')).toBeNull();
  });

  it('formats a stored number and builds a click-to-call link', () => {
    expect(storePhoneNumber('6195550100')).toBe('(619) 555-0100');
    expect(formatPhoneDisplay('6195550100')).toBe('(619) 555-0100');
    expect(phoneTelHref('619-555-0100')).toBe('tel:+16195550100');
    expect(phoneTelHref('')).toBeNull();
  });
});
