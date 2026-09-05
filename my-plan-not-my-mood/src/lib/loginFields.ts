/** Sign-in fields start empty. Browsers still try to autofill saved staff logins. */

export const EMPTY_LOGIN_EMAIL = '';
export const EMPTY_LOGIN_PASSWORD = '';
export const LOGIN_FORM_AUTOCOMPLETE = 'off';
export const LOGIN_EMAIL_AUTOCOMPLETE = 'off';
export const LOGIN_PASSWORD_AUTOCOMPLETE = 'new-password';
export const LOGIN_EMAIL_FIELD_NAME = 'nmp-login-email';
export const LOGIN_PASSWORD_FIELD_NAME = 'nmp-login-password';

export function emptyAuthCredentials(): { email: string; password: string } {
  return { email: EMPTY_LOGIN_EMAIL, password: EMPTY_LOGIN_PASSWORD };
}

export function shouldPrefillLoginEmail(_email?: string): boolean {
  return false;
}
