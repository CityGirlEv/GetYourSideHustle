/** Root-absolute base so nested routes like /admin/plan load /assets, not /admin/assets. */
export const SPA_PUBLIC_BASE = '/';

/** Bump when replacing files in public/images so production does not keep a cached copy. */
export const PUBLIC_IMAGE_CACHE_VERSION = '20261003b';

export function cacheBustPublicUrl(path: string, version = PUBLIC_IMAGE_CACHE_VERSION): string {
  const value = String(path ?? '').trim();
  if (!value.startsWith('/images/') && !value.startsWith('/videos/')) return value;
  const join = value.includes('?') ? '&' : '?';
  return `${value}${join}v=${version}`;
}

export function resolveSpaAssetUrl(assetPath: string, base = SPA_PUBLIC_BASE): string {
  const clean = assetPath.replace(/^\.?\//, '');
  if (base === './') {
    return `./${clean}`;
  }
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${clean}`.replace(/\/{2,}/g, '/');
}
