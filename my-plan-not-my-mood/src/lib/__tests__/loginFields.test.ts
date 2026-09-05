import { describe, expect, it } from 'vitest';
import {
  EMPTY_LOGIN_EMAIL,
  EMPTY_LOGIN_PASSWORD,
  LOGIN_EMAIL_AUTOCOMPLETE,
  LOGIN_PASSWORD_AUTOCOMPLETE,
  emptyAuthCredentials,
  shouldPrefillLoginEmail,
} from '../loginFields';

describe('login fields', () => {
  it('starts email and password blank', () => {
    expect(emptyAuthCredentials()).toEqual({ email: '', password: '' });
    expect(EMPTY_LOGIN_EMAIL).toBe('');
    expect(EMPTY_LOGIN_PASSWORD).toBe('');
  });

  it('never prefills a login email, including staff addresses', () => {
    expect(shouldPrefillLoginEmail('evelyn3@cox.net')).toBe(false);
    expect(shouldPrefillLoginEmail('angela@angelasharris.com')).toBe(false);
    expect(shouldPrefillLoginEmail('')).toBe(false);
  });

  it('uses autocomplete values that discourage saved-password fill', () => {
    expect(LOGIN_EMAIL_AUTOCOMPLETE).toBe('off');
    expect(LOGIN_PASSWORD_AUTOCOMPLETE).toBe('new-password');
  });
});
