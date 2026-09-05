import { describe, it, expect } from 'vitest';
import { shouldShowBetaWelcome } from '../betaWelcome';

describe('shouldShowBetaWelcome', () => {
  it('shows the Beta popup on the home page and storefront paths', () => {
    expect(shouldShowBetaWelcome('/')).toBe(true);
    expect(shouldShowBetaWelcome('')).toBe(true);
    expect(shouldShowBetaWelcome('/index.html')).toBe(true);
    expect(shouldShowBetaWelcome('/#hero')).toBe(true);
  });

  it('does not show the Beta popup on gated admin routes', () => {
    expect(shouldShowBetaWelcome('/admin')).toBe(false);
    expect(shouldShowBetaWelcome('/admin/pricing')).toBe(false);
    expect(shouldShowBetaWelcome('/admin?tab=users')).toBe(false);
  });
});
