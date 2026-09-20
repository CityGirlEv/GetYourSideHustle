import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  applyDocumentMeta,
  applySharePreviewMeta,
  DEFAULT_DOCUMENT_DESCRIPTION,
  DEFAULT_DOCUMENT_TITLE,
  formatPublicPageTitle,
  SHARE_PREVIEW_IMAGE_PATH,
  sharePreviewImageUrl,
  SITE_CANONICAL_ORIGIN,
} from '../pageMeta';

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
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      sharePreviewImageUrl(),
    );
    restore();
    expect(document.title).toBe(DEFAULT_DOCUMENT_TITLE);
  });

  it('uses the home hero as the shared-link preview image', () => {
    expect(SHARE_PREVIEW_IMAGE_PATH).toBe('/images/home-hero.jpg');
    expect(sharePreviewImageUrl()).toBe(`${SITE_CANONICAL_ORIGIN}/images/home-hero.jpg`);
    applySharePreviewMeta();
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      'https://nonnegotiation.com/images/home-hero.jpg',
    );
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
      'summary_large_image',
    );
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(
      'https://nonnegotiation.com/images/home-hero.jpg',
    );

    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('https://nonnegotiation.com/images/home-hero.jpg');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain(DEFAULT_DOCUMENT_DESCRIPTION);
  });
});
