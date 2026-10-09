import { describe, expect, it } from 'vitest';
import { PUBLIC_IMAGE_CACHE_VERSION, SPA_PUBLIC_BASE, cacheBustPublicUrl, resolveSpaAssetUrl } from '../spaAssets';

describe('spaAssets', () => {
  it('uses a root-absolute base so /admin/plan does not look under /admin/assets', () => {
    expect(SPA_PUBLIC_BASE).toBe('/');
    expect(resolveSpaAssetUrl('assets/index.js')).toBe('/assets/index.js');
    expect(resolveSpaAssetUrl('./assets/index.js', './')).toBe('./assets/index.js');
    expect(cacheBustPublicUrl('/images/apparel_hat_white.png')).toBe(
      `/images/apparel_hat_white.png?v=${PUBLIC_IMAGE_CACHE_VERSION}`,
    );
    expect(cacheBustPublicUrl('/videos/welcome-about.mp4')).toBe(
      `/videos/welcome-about.mp4?v=${PUBLIC_IMAGE_CACHE_VERSION}`,
    );
    expect(cacheBustPublicUrl('data:image/png;base64,aa')).toBe('data:image/png;base64,aa');
  });
});
