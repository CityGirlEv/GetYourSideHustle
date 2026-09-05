import { describe, expect, it } from 'vitest';
import {
  EMAIL_FOOTER_COPY,
  EMAIL_SITE_URL,
  EMAIL_TAGLINE,
  emailLogoUrl,
  hasEmailChrome,
  wrapEmailHtml,
} from '../emailChrome';

describe('emailChrome', () => {
  it('wraps every message with logo, website, header, and footer', () => {
    const html = wrapEmailHtml('<p>Hello</p>');
    expect(hasEmailChrome(html)).toBe(true);
    expect(html).toContain(emailLogoUrl());
    expect(html).toContain('official_logo_seal.png');
    expect(html).toContain(EMAIL_SITE_URL);
    expect(html).toContain('MY PLAN');
    expect(html).toContain('NOT MY MOOD');
    expect(html).toContain('Accountability Protocol');
    expect(html).toContain(EMAIL_TAGLINE);
    expect(html).toContain(EMAIL_FOOTER_COPY);
    expect(html).toContain('Hello');
    expect(wrapEmailHtml(html)).toBe(html);
  });
});
