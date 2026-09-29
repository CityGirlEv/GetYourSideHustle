import { describe, expect, it } from 'vitest';
import { deleteUploadBlob, putUploadBlob } from '../idbFileStore';
import {
  canPreviewAssetImage,
  escapePreviewHtml,
  fullResolutionImageUrl,
  imagePreviewFromAsset,
  imagePreviewFromHatColor,
  applyImagePreviewDisplaySize,
  applyImagePreviewWindowSize,
  IMAGE_PREVIEW_MIN_HEIGHT,
  IMAGE_PREVIEW_MIN_WIDTH,
  imagePreviewDisplaySize,
  imagePreviewWindowFeatures,
  imagePreviewWindowHtml,
  imagePreviewWindowSize,
  openImagePreviewWindow,
  resolvePreviewSrc,
  showImagePreview,
} from '../imagePreview';

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('imagePreview', () => {
  it('opens a preview for stored image data and skips empty tiles', () => {
    expect(canPreviewAssetImage(PNG)).toBe(true);
    expect(canPreviewAssetImage('blob:http://localhost:3001/abc')).toBe(true);
    expect(canPreviewAssetImage('/images/apparel_hat_white.png')).toBe(true);
    expect(canPreviewAssetImage('')).toBe(false);
    expect(canPreviewAssetImage('not-an-image')).toBe(false);
    expect(resolvePreviewSrc('/images/apparel_hat_white.png', 'https://nonnegotiation.com')).toBe(
      'https://nonnegotiation.com/images/apparel_hat_white.png',
    );
    expect(imagePreviewFromHatColor({ id: 'white', label: 'White', image: '/images/apparel_hat_white.png' })).toEqual({
      src: '/images/apparel_hat_white.png',
      id: 'hat-color-white',
      name: 'White',
      alt: 'White hat',
    });
    expect(imagePreviewFromHatColor({ id: 'x', label: 'Nope', image: '' })).toBeNull();
    expect(imagePreviewFromAsset({ id: 'm1', name: 'Plan Tee', dataUrl: PNG }, 'mockup')).toEqual({
      src: PNG,
      id: 'm1',
      name: 'Plan Tee',
      alt: 'Plan Tee mockup',
    });
    expect(imagePreviewFromAsset({ name: 'Missing' })).toBeNull();
  });

  it('uses the original stored file for a full-size preview instead of the thumbnail', async () => {
    const png = Uint8Array.from(
      atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='),
      (ch) => ch.charCodeAt(0),
    );
    const id = 'preview-hires-1';
    await putUploadBlob(id, new Blob([png], { type: 'image/png' }));
    const url = await fullResolutionImageUrl(id, PNG);
    expect(url?.startsWith('blob:')).toBe(true);
    expect(url).not.toBe(PNG);
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    await deleteUploadBlob(id);
    expect(await fullResolutionImageUrl(undefined, PNG)).toBe(PNG);
    expect(await fullResolutionImageUrl(undefined, '')).toBeUndefined();
  });

  it('opens a large preview window with escaped title and image', () => {
    expect(escapePreviewHtml('A <tee> & "hat"')).toBe('A &lt;tee&gt; &amp; &quot;hat&quot;');
    expect(IMAGE_PREVIEW_MIN_WIDTH).toBe(960);
    expect(IMAGE_PREVIEW_MIN_HEIGHT).toBe(700);
    expect(imagePreviewWindowSize(1600, 1000)).toEqual({ width: 1408, height: 880, left: 96, top: 60 });
    expect(imagePreviewWindowFeatures(1600, 1000)).toContain('width=1408');
    expect(imagePreviewWindowFeatures(1600, 1000)).toContain('height=880');
    expect(imagePreviewWindowSize(800, 600)).toEqual({ width: 800, height: 600, left: 0, top: 0 });
    expect(imagePreviewDisplaySize(1200, 1200, 900, 700, 1)).toEqual({ width: 700, height: 700 });
    expect(imagePreviewDisplaySize(1200, 1200, 900, 700, 2)).toEqual({ width: 600, height: 600 });
    expect(imagePreviewDisplaySize(256, 256, 900, 700, 1)).toEqual({ width: 256, height: 256 });
    const styled = { naturalWidth: 1200, naturalHeight: 800, style: { width: '', height: '' } };
    expect(applyImagePreviewDisplaySize(styled, 1000, 1000, 1)).toEqual({ width: 1000, height: 667 });
    expect(styled.style.width).toBe('1000px');
    const sized: Array<[number, number]> = [];
    const moved: Array<[number, number]> = [];
    applyImagePreviewWindowSize(
      {
        resizeTo: (width: number, height: number) => sized.push([width, height]),
        moveTo: (left: number, top: number) => moved.push([left, top]),
      },
      { width: 1408, height: 880, left: 96, top: 60 },
    );
    expect(sized).toEqual([[1408, 880]]);
    expect(moved).toEqual([[96, 60]]);
    const preview = imagePreviewFromAsset({ id: 'm1', name: 'Plan Tee', dataUrl: PNG }, 'mockup')!;
    const html = imagePreviewWindowHtml(preview, PNG);
    expect(html).toContain('Plan Tee');
    expect(html).toContain('width: auto');
    expect(html).toContain('height: auto');
    expect(html).toContain('object-fit: contain');
    expect(html).toContain('image-rendering: high-quality');
    expect(html).toContain(PNG);
    const written: string[] = [];
    const fakeWin = {
      resizeTo: () => undefined,
      moveTo: () => undefined,
      focus: () => undefined,
      document: {
        open: () => undefined,
        write: (chunk: string) => written.push(chunk),
        close: () => undefined,
      },
    } as unknown as Window;
    const opened = openImagePreviewWindow(preview, PNG, () => fakeWin, 1600, 1000);
    expect(opened).toBe(fakeWin);
    expect(written.join('')).toContain('preview-img');
    expect(openImagePreviewWindow(preview, PNG, () => null)).toBeNull();
    const overlays: unknown[] = [];
    expect(showImagePreview(preview, (next) => overlays.push(next), () => fakeWin)).toBe(true);
    expect(overlays).toEqual([]);
    expect(showImagePreview(preview, (next) => overlays.push(next), () => null)).toBe(false);
    expect(overlays).toHaveLength(1);
    expect(showImagePreview(null, (next) => overlays.push(next))).toBe(false);
  });
});
