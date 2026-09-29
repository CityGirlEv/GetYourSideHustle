/** Client identity for Implementation Plan documents and on-screen headers. */
export const CLIENT_NAME = 'Angela Harris';
export const CLIENT_TITLE = 'Empowerment Speaker | Author';
export const CLIENT_ROLE = 'Client';
export const CLIENT_EMAIL = 'Angela@AngelaHarris.com';
export const CLIENT_DISPLAY_NAME = `${CLIENT_NAME} (${CLIENT_TITLE})`;
export const LEGACY_CLIENT_DISPLAY_NAME = 'Angela Harris (Muntie Ev)';

export function replaceLegacyClientDisplayName(text: string): string {
  return text.split(LEGACY_CLIENT_DISPLAY_NAME).join(CLIENT_DISPLAY_NAME);
}
