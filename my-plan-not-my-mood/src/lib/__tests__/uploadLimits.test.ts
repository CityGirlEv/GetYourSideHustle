import { describe, expect, it } from 'vitest';
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  fileTooLargeMessage,
  folderFileTooLargeReason,
} from '../uploadLimits';
import {
  persistablePreviewUrl,
  storeFilePreview,
  deleteUploadBlob,
  getUploadBlob,
  hydrateStoredPreview,
  makeThumbnailDataUrl,
  putUploadBlob,
  writeLocalJson,
} from '../idbFileStore';
import { assetFileError } from '../assetLibrary';
import { gearMockupFileError } from '../gearSelections';

describe('uploadLimits', () => {
  it('allows mockups up to 20 MB and rejects anything larger', () => {
    expect(MAX_UPLOAD_BYTES).toBe(20 * 1024 * 1024);
    expect(MAX_UPLOAD_LABEL).toBe('20 MB');
    expect(fileTooLargeMessage('Mockups')).toBe('Mockups must be 20 MB or smaller.');
    expect(folderFileTooLargeReason('hero.png')).toBe('hero.png is larger than 20 MB.');
    expect(assetFileError({ name: 'hero.jpg', type: 'image/jpeg', size: MAX_UPLOAD_BYTES }, 'mockup')).toBeNull();
    expect(assetFileError({ name: 'hero.jpg', type: '', size: 8_000_000 }, 'mockup')).toBeNull();
    expect(assetFileError({ name: 'hero.jpg', type: 'image/jpeg', size: MAX_UPLOAD_BYTES + 1 }, 'mockup')).toBe(
      'Mockups must be 20 MB or smaller.',
    );
    expect(gearMockupFileError({ name: 'tee.png', type: 'image/png', size: 12_000_000 })).toBeNull();
    expect(gearMockupFileError({ name: 'tee.png', type: 'image/png', size: MAX_UPLOAD_BYTES + 1 })).toBe(
      'Mockups must be 20 MB or smaller.',
    );
  });

  it('stores the file blob instead of a data URL and strips blob previews from JSON', () => {
    expect(persistablePreviewUrl('blob:http://localhost:3001/abc')).toBeUndefined();
    expect(persistablePreviewUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    writeLocalJson('myplan_cap_test', { ok: true });
    expect(JSON.parse(String(localStorage.getItem('myplan_cap_test')))).toEqual({ ok: true });
  });
});

describe('idbFileStore', () => {
  it('round-trips a blob preview for a mockup id', async () => {
    const id = 'asset-test-1';
    const blob = new Blob(['mockup-bytes'], { type: 'image/jpeg' });
    const url = await storeFilePreview(id, blob);
    expect(url.startsWith('blob:') || url.startsWith('data:image/')).toBe(true);
    expect(await getUploadBlob(id)).toBe(blob);
    await deleteUploadBlob(id);
    expect(await getUploadBlob(id)).toBeUndefined();
  });

  it('makes a persistable JPEG thumbnail and restores it from IndexedDB', async () => {
    const png = Uint8Array.from(
      atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='),
      (ch) => ch.charCodeAt(0),
    );
    const blob = new Blob([png], { type: 'image/png' });
    const thumb = await makeThumbnailDataUrl(blob);
    if (thumb) {
      expect(thumb.startsWith('data:image/jpeg')).toBe(true);
      expect(persistablePreviewUrl(thumb)).toBe(thumb);
    }
    const id = 'asset-thumb-1';
    await putUploadBlob(id, blob);
    const restored = await hydrateStoredPreview(id, '');
    expect(restored).toBeTruthy();
    expect(restored?.startsWith('data:image/') || restored?.startsWith('blob:')).toBe(true);
    await deleteUploadBlob(id);
  });
});
