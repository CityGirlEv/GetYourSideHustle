import { describe, expect, it } from 'vitest';
import { PUBLIC_IMAGE_CACHE_VERSION } from '../spaAssets';
import {
  COLLECTION_PHOTO_DIR,
  COLLECTION_PHOTOS_BY_HANDLE,
  collectionPhotoForHandle,
  isCollectionPhotoUrl,
} from '../collectionPhotos';
import { isPublishableStorefrontImage, parseShopifyCollectionProducts } from '../shopifyStore';

describe('collectionPhotos', () => {
  it('maps live Shopify handles to on-garment collection files', () => {
    expect(COLLECTION_PHOTO_DIR).toBe('/images/collection');
    expect(COLLECTION_PHOTOS_BY_HANDLE['unisex-softstyle-logo-tee']).toBe('/images/collection/logo-tee.jpg');
    expect(COLLECTION_PHOTOS_BY_HANDLE['unisex-softstyle-letters-tee']).toBe(
      '/images/collection/checkbox-tee.jpg',
    );
    expect(COLLECTION_PHOTOS_BY_HANDLE['low-profile-baseball-cap']).toBe('/images/collection/hat-red.jpg');
    expect(collectionPhotoForHandle('unisex-softstyle-logo-tee')).toBe(
      `/images/collection/logo-tee.jpg?v=${PUBLIC_IMAGE_CACHE_VERSION}`,
    );
    expect(collectionPhotoForHandle('missing-handle')).toBe('');
    expect(isCollectionPhotoUrl('/images/collection/logo-tee.jpg?v=1')).toBe(true);
    expect(isCollectionPhotoUrl('/images/apparel_tee_lifestyle.jpg')).toBe(false);
  });

  it('uses collection photos when Shopify only has Printify placeholder files', () => {
    expect(isPublishableStorefrontImage('/images/collection/logo-tee.jpg')).toBe(true);
    expect(
      isPublishableStorefrontImage('https://cdn.shopify.com/s/files/unisex-softstyle-t-shirt-placeholder-do-not-publish.jpg'),
    ).toBe(false);
    const products = parseShopifyCollectionProducts({
      products: [
        {
          id: 1,
          title: 'Unisex Softstyle Logo Tee *FREE SHIPPING*',
          handle: 'unisex-softstyle-logo-tee',
          variants: [{ price: '34.99' }],
          images: [
            { src: 'https://cdn.shopify.com/s/files/unisex-heavy-cotton-tee-placeholder-do-not-publish.jpg' },
          ],
        },
        {
          id: 2,
          title: 'Unisex Crystal Tie-Dye Black Teal Tee',
          handle: 'unisex-crystal-tie-dye-black-teal-tee',
          variants: [{ price: '47.94' }],
          images: [{ src: 'https://cdn.shopify.com/s/files/CrystalTieBlackTealFront.jpg' }],
        },
      ],
    });
    expect(products[0]?.image).toBe(`/images/collection/logo-tee.jpg?v=${PUBLIC_IMAGE_CACHE_VERSION}`);
    expect(products[1]?.image).toBe('https://cdn.shopify.com/s/files/CrystalTieBlackTealFront.jpg');
  });
});
