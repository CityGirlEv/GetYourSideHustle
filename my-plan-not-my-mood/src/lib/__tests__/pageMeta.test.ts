import { describe, expect, it } from 'vitest';
import { applyDocumentMeta, DEFAULT_DOCUMENT_TITLE, formatPublicPageTitle } from '../pageMeta';

describe('pageMeta', () => {
  it('formats public titles and restores document meta', () => {
    expect(formatPublicPageTitle('About')).toBe('About | My Plan, Not My Mood');
    document.title = DEFAULT_DOCUMENT_TITLE;
    const restore = applyDocumentMeta({
      title: 'About | My Plan, Not My Mood',
      description: 'Founded by Angela Harris.',
    });
    expect(document.title).toBe('About | My Plan, Not My Mood');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Founded by Angela Harris.',
    );
    restore();
    expect(document.title).toBe(DEFAULT_DOCUMENT_TITLE);
  });
});
