import { canPreviewAssetImage } from './imagePreview';
import { getUploadBlob } from './idbFileStore';

export function escapeAssetPdfText(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function assetImagePdfFileName(name: string): string {
  const stem = String(name ?? '')
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w\s-]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return `${stem || 'mockup'}.pdf`;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      if (!result.startsWith('data:')) {
        reject(new Error('Could not read that image.'));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(blob);
  });
}

/** Original upload bytes as a data URL so the PDF is not a scaled-up thumbnail. */
export async function assetImagePdfSource(id?: string, fallback?: string | null): Promise<string | undefined> {
  const key = String(id ?? '').trim();
  if (key) {
    const blob = await getUploadBlob(key);
    if (blob) return blobToDataUrl(blob);
  }
  const fallbackSrc = String(fallback ?? '').trim();
  if (fallbackSrc.startsWith('blob:')) {
    try {
      const response = await fetch(fallbackSrc);
      const blob = await response.blob();
      if (blob.size > 0) return blobToDataUrl(blob);
    } catch {
      /* fall through */
    }
  }
  return canPreviewAssetImage(fallbackSrc) ? fallbackSrc : undefined;
}

export function pdfSheetHtml(page: { title: string; imageSrc: string }): string {
  const title = escapeAssetPdfText(page.title.trim() || 'Mockup');
  const src = String(page.imageSrc ?? '').replace(/"/g, '%22');
  return `<div class="sheet"><h1>${title}</h1><img src="${src}" alt="${title}" /></div>`;
}

export function buildAssetImagePdfHtml(input: {
  title: string;
  imageSrc?: string;
  pages?: Array<{ title: string; imageSrc: string }>;
}): string {
  const title = escapeAssetPdfText(input.title.trim() || 'Mockup');
  const pages =
    input.pages && input.pages.length > 0
      ? input.pages
      : input.imageSrc
        ? [{ title: input.title, imageSrc: input.imageSrc }]
        : [];
  const sheets = pages.map((page) => pdfSheetHtml(page)).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title} — PDF</title>
  <style>
    @page { size: letter landscape; margin: 0.35in; }
    html, body { margin: 0; background: #ffffff; color: #1F1917; font-family: Segoe UI, Arial, sans-serif; }
    #pdf-toolbar { position: sticky; top: 0; z-index: 9; background: #1F1917; color: #fff; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #C2410C; }
    #pdf-toolbar span { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
    #pdf-toolbar button { min-height: 44px; padding: 10px 18px; font-weight: 900; border-radius: 10px; cursor: pointer; font-size: 12px; text-transform: uppercase; border: 2px solid #fff; }
    #pdf-view-btn { background: #FAF8F5; color: #1F1917; }
    #pdf-print-btn { background: #FFEDD5; color: #9A3412; }
    #pdf-save-btn { background: #C2410C; color: #fff; }
    .sheet { min-height: calc(100vh - 72px); padding: 8px 12px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; page-break-after: always; }
    h1 { margin: 0; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; text-align: center; }
    img { width: 100%; height: calc(100vh - 96px); max-width: 100%; object-fit: contain; image-rendering: auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sheet:last-of-type { page-break-after: auto; }
    @media print {
      #pdf-toolbar { display: none !important; }
      .sheet { min-height: auto; padding: 0; }
      img { width: 10.3in; height: 7.5in; max-width: 10.3in; max-height: 7.5in; }
    }
  </style>
</head>
<body>
  <div id="pdf-toolbar">
    <span>MY PLAN, NOT MY MOOD — High-resolution PDF</span>
    <div style="display:flex;gap:10px;align-items:center;">
      <button type="button" id="pdf-view-btn">View</button>
      <button type="button" id="pdf-print-btn">Print</button>
      <button type="button" id="pdf-save-btn">Save PDF</button>
    </div>
  </div>
  ${sheets}
  <script>
    (function () {
      document.getElementById('pdf-view-btn')?.addEventListener('click', function () { window.scrollTo(0, 0); });
      document.getElementById('pdf-print-btn')?.addEventListener('click', function () { window.print(); });
      document.getElementById('pdf-save-btn')?.addEventListener('click', function () { window.print(); });
    })();
  </script>
</body>
</html>`;
}

export const ASSET_PDF_WINDOW_FEATURES = 'popup=yes,width=1680,height=1100,left=24,top=16';

export function openAssetImagePdfWindow(html: string): Window | null {
  if (typeof window === 'undefined' || typeof window.open !== 'function') return null;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const pdfWindow = window.open(blobUrl, '_blank', ASSET_PDF_WINDOW_FEATURES);
  if (pdfWindow) {
    pdfWindow.focus();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } else {
    URL.revokeObjectURL(blobUrl);
  }
  return pdfWindow;
}

export async function openAssetImagePdf(item: {
  id?: string;
  name: string;
  dataUrl?: string;
}): Promise<{ ok: boolean; error?: string }> {
  return openAssetGalleryPdf(item.name, [item]);
}

export async function openAssetGalleryPdf(
  title: string,
  items: Array<{ id?: string; name: string; dataUrl?: string }>,
): Promise<{ ok: boolean; error?: string }> {
  const pages: Array<{ title: string; imageSrc: string }> = [];
  for (const item of items) {
    const imageSrc = await assetImagePdfSource(item.id, item.dataUrl);
    if (imageSrc) pages.push({ title: item.name, imageSrc });
  }
  if (pages.length === 0) return { ok: false, error: 'That image is not available yet.' };
  const html = buildAssetImagePdfHtml({ title, pages });
  const opened = openAssetImagePdfWindow(html);
  if (!opened) return { ok: false, error: 'Allow pop-ups to view the high-resolution PDF.' };
  return { ok: true };
}
