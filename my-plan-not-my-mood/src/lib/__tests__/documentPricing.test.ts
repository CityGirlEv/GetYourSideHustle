import { describe, expect, it } from 'vitest';
import { allowDocumentPricing } from '../documentPricing';

describe('allowDocumentPricing', () => {
  it('never includes pricing for Admins even if a budget export is requested', () => {
    expect(allowDocumentPricing(false, true)).toBe(false);
    expect(allowDocumentPricing(false, false)).toBe(false);
  });

  it('includes pricing for Super Admin only when a budget export is requested', () => {
    expect(allowDocumentPricing(true, true)).toBe(true);
    expect(allowDocumentPricing(true, false)).toBe(false);
  });
});
