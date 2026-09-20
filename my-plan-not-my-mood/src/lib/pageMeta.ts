export const DEFAULT_DOCUMENT_TITLE = 'MY PLAN, NOT MY MOOD — a Non-Negotiable brand';
export const DEFAULT_DOCUMENT_DESCRIPTION =
  'MY PLAN, NOT MY MOOD is a Non-Negotiable brand. Feel it. Follow the plan anyway.';
export const SITE_CANONICAL_ORIGIN = 'https://nonnegotiation.com';
export const SHARE_PREVIEW_IMAGE_PATH = '/images/home-hero.jpg';

export function sharePreviewImageUrl(origin = SITE_CANONICAL_ORIGIN): string {
  return `${String(origin).replace(/\/$/, '')}${SHARE_PREVIEW_IMAGE_PATH}`;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  if (typeof document === 'undefined') return;
  let node = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute(attr, key);
    document.head.appendChild(node);
  }
  node.setAttribute('content', content);
}

export function applySharePreviewMeta(origin = SITE_CANONICAL_ORIGIN): void {
  const image = sharePreviewImageUrl(origin);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:site_name', 'My Plan, Not My Mood');
  upsertMeta('property', 'og:url', `${String(origin).replace(/\/$/, '')}/`);
  upsertMeta('property', 'og:title', DEFAULT_DOCUMENT_TITLE);
  upsertMeta('property', 'og:description', DEFAULT_DOCUMENT_DESCRIPTION);
  upsertMeta('property', 'og:image', image);
  upsertMeta('property', 'og:image:alt', 'Angela Harris at her desk in a My Plan, Not My Mood tee');
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:image', image);
}

export function formatPublicPageTitle(pageTitle: string): string {
  const title = String(pageTitle ?? '').trim();
  return title ? `${title} | My Plan, Not My Mood` : DEFAULT_DOCUMENT_TITLE;
}

export function applyDocumentMeta(meta: { title: string; description: string }): () => void {
  if (typeof document === 'undefined') return () => {};

  const previousTitle = document.title;
  const previousNode = document.querySelector('meta[name="description"]');
  const previousContent = previousNode?.getAttribute('content') ?? null;
  const created = !previousNode;
  const node = previousNode ?? document.createElement('meta');
  if (created) {
    node.setAttribute('name', 'description');
    document.head.appendChild(node);
  }

  document.title = meta.title;
  node.setAttribute('content', meta.description);
  upsertMeta('property', 'og:title', meta.title);
  upsertMeta('property', 'og:description', meta.description);
  upsertMeta('property', 'og:image', sharePreviewImageUrl());
  upsertMeta('name', 'twitter:image', sharePreviewImageUrl());

  return () => {
    document.title = previousTitle;
    if (created) {
      node.remove();
      return;
    }
    if (previousContent === null) node.removeAttribute('content');
    else node.setAttribute('content', previousContent);
  };
}
