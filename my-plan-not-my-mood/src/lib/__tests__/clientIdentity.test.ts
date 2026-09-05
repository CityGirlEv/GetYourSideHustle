import { describe, expect, it } from 'vitest';
import {
  CLIENT_DISPLAY_NAME,
  CLIENT_EMAIL,
  CLIENT_NAME,
  CLIENT_ROLE,
  CLIENT_TITLE,
  LEGACY_CLIENT_DISPLAY_NAME,
  replaceLegacyClientDisplayName,
} from '../clientIdentity';

describe('clientIdentity', () => {
  it('uses Angela Harris Empowerment Speaker | Author display name and client email', () => {
    expect(CLIENT_NAME).toBe('Angela Harris');
    expect(CLIENT_TITLE).toBe('Empowerment Speaker | Author');
    expect(CLIENT_DISPLAY_NAME).toBe('Angela Harris (Empowerment Speaker | Author)');
    expect(CLIENT_ROLE).toBe('Client');
    expect(CLIENT_EMAIL).toBe('Angela@AngelaHarris.com');
  });

  it('replaces the legacy Muntie Ev parenthetical on Angela Harris only', () => {
    const source = `Founded by ${LEGACY_CLIENT_DISPLAY_NAME}, powered by Muntie Ev's AI Studio.`;
    expect(replaceLegacyClientDisplayName(source)).toBe(
      "Founded by Angela Harris (Empowerment Speaker | Author), powered by Muntie Ev's AI Studio.",
    );
  });
});
