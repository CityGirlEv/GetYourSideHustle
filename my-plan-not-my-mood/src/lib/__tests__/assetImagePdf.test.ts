import { describe, expect, it, vi, afterEach } from 'vitest';
import { deleteUploadBlob, putUploadBlob } from '../idbFileStore';
import {
  assetImagePdfFileName,
  assetImagePdfSource,
  ASSET_PDF_WINDOW_FEATURES,
  buildAssetImagePdfHtml,
  escapeAssetPdfText,
  openAssetImagePdfWindow,
} from '../assetImagePdf';

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('assetImagePdf', () => {
  it('builds a print PDF around the original image, not a popup thumbnail', async () => {
    expect(escapeAssetPdfText('Hat <Logo>')).toBe('Hat &lt;Logo&gt;');
    expect(assetImagePdfFileName('Plan Tee.png')).toBe('Plan-Tee.pdf');
    const html = buildAssetImagePdfHtml({ title: 'Plan Tee', imageSrc: PNG });
    expect(html).toContain('Plan Tee');
    expect(html).toContain(PNG);
    expect(html).toContain('Save PDF');
    expect(html).toContain('Print');
    expect(html).toContain('@media print');
    expect(html).toContain('height: calc(100vh - 96px)');
    expect(html).toContain('width: 10.3in');
    expect(html).toContain('High-resolution PDF');

    const png = Uint8Array.from(
      atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='),
      (ch) => ch.charCodeAt(0),
    );
    const id = 'pdf-hires-1';
    await putUploadBlob(id, new Blob([png], { type: 'image/png' }));
    const src = await assetImagePdfSource(id, 'data:image/jpeg;base64,tinythumb');
    expect(src?.startsWith('data:image/png')).toBe(true);
    expect(src).not.toBe('data:image/jpeg;base64,tinythumb');
    await deleteUploadBlob(id);
    expect(await assetImagePdfSource(undefined, PNG)).toBe(PNG);
    expect(await assetImagePdfSource(undefined, '')).toBeUndefined();
  });

  it('opens the PDF HTML in a new window', () => {
    const opened = { focus: vi.fn() };
    const open = vi.spyOn(window, 'open').mockReturnValue(opened as unknown as Window);
    const win = openAssetImagePdfWindow(buildAssetImagePdfHtml({ title: 'Logo', imageSrc: PNG }));
    expect(open).toHaveBeenCalledWith(expect.any(String), '_blank', ASSET_PDF_WINDOW_FEATURES);
    expect(ASSET_PDF_WINDOW_FEATURES).toMatch(/1680/);
    expect(ASSET_PDF_WINDOW_FEATURES).toMatch(/1100/);
    expect(win).toBe(opened);
    expect(opened.focus).toHaveBeenCalled();
  });

  it('builds a multi-page PDF so a style row can print every mockup', () => {
    const html = buildAssetImagePdfHtml({
      title: 'T-Shirts Logo Style',
      pages: [
        { title: 'Front', imageSrc: PNG },
        { title: 'Back', imageSrc: PNG },
      ],
    });
    expect(html).toContain('Front');
    expect(html).toContain('Back');
    expect(html).toContain('page-break-after: always');
    expect(html).toContain('Print');
    expect(html).toContain('Save PDF');
  });
});
