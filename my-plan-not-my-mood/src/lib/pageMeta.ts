export const DEFAULT_DOCUMENT_TITLE = 'MY PLAN, NOT MY MOOD — a Non-Negotiable brand';
export const DEFAULT_DOCUMENT_DESCRIPTION =
  'MY PLAN, NOT MY MOOD is a Non-Negotiable brand. Feel it. Follow the plan anyway.';

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
