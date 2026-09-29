import { getUploadBlob } from './idbFileStore';

export interface ImagePreview {
  src: string;
  alt: string;
  name: string;
  id?: string;
}

export function isSameOriginImagePath(src: string): boolean {
  return /^\/[\w./-]+\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(String(src ?? '').trim());
}

export function canPreviewAssetImage(src?: string | null): boolean {
  const value = String(src ?? '').trim();
  return (
    value.length > 0 &&
    (value.startsWith('data:image/') ||
      value.startsWith('blob:') ||
      /^https?:\/\//i.test(value) ||
      isSameOriginImagePath(value))
  );
}

/** Popup documents are about:blank, so relative /images paths need an origin. */
export function resolvePreviewSrc(
  src: string,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  const value = String(src ?? '').trim();
  if (isSameOriginImagePath(value) && origin) return `${origin.replace(/\/$/, '')}${value}`;
  return value;
}

/** Original upload blob when stored; otherwise the thumbnail/fallback URL. */
export async function fullResolutionImageUrl(
  id: string | undefined,
  fallback?: string | null,
): Promise<string | undefined> {
  const key = String(id ?? '').trim();
  if (key) {
    const blob = await getUploadBlob(key);
    if (blob) return URL.createObjectURL(blob);
  }
  const fallbackSrc = String(fallback ?? '').trim();
  return canPreviewAssetImage(fallbackSrc) ? fallbackSrc : undefined;
}

export function imagePreviewFromHatColor(color: {
  id: string;
  label: string;
  image: string;
}): ImagePreview | null {
  if (!canPreviewAssetImage(color.image)) return null;
  return {
    src: color.image,
    id: `hat-color-${color.id}`,
    name: color.label,
    alt: `${color.label} hat`,
  };
}

export function imagePreviewFromAsset(
  item: { id?: string; name: string; dataUrl?: string },
  altSuffix = 'preview',
): ImagePreview | null {
  const id = item.id?.trim() || undefined;
  if (!canPreviewAssetImage(item.dataUrl) && !id) return null;
  return {
    src: canPreviewAssetImage(item.dataUrl) ? item.dataUrl!.trim() : '',
    id,
    name: item.name,
    alt: `${item.name} ${altSuffix}`,
  };
}

export function escapePreviewHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const IMAGE_PREVIEW_WINDOW_RATIO = 0.88;
export const IMAGE_PREVIEW_MIN_WIDTH = 960;
export const IMAGE_PREVIEW_MIN_HEIGHT = 700;

export function imagePreviewWindowSize(availWidth: number, availHeight: number): {
  width: number;
  height: number;
  left: number;
  top: number;
} {
  const screenW = Math.max(0, availWidth);
  const screenH = Math.max(0, availHeight);
  const width = Math.min(
    screenW,
    Math.max(IMAGE_PREVIEW_MIN_WIDTH, Math.round(screenW * IMAGE_PREVIEW_WINDOW_RATIO)),
  );
  const height = Math.min(
    screenH,
    Math.max(IMAGE_PREVIEW_MIN_HEIGHT, Math.round(screenH * IMAGE_PREVIEW_WINDOW_RATIO)),
  );
  return {
    width,
    height,
    left: Math.max(0, Math.round((screenW - width) / 2)),
    top: Math.max(0, Math.round((screenH - height) / 2)),
  };
}

/** CSS pixel size that never upscales past native pixels, so retina stays sharp. */
export function imagePreviewDisplaySize(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number,
  devicePixelRatio = 1,
): { width: number; height: number } {
  const nativeW = Math.max(1, naturalWidth);
  const nativeH = Math.max(1, naturalHeight);
  const dpr = Math.max(1, devicePixelRatio);
  const cssW = nativeW / dpr;
  const cssH = nativeH / dpr;
  const boxW = Math.max(1, maxWidth);
  const boxH = Math.max(1, maxHeight);
  const scale = Math.min(1, boxW / cssW, boxH / cssH);
  return {
    width: Math.max(1, Math.round(cssW * scale)),
    height: Math.max(1, Math.round(cssH * scale)),
  };
}

export function applyImagePreviewDisplaySize(
  img: {
    naturalWidth: number;
    naturalHeight: number;
    style: { width: string; height: string };
  },
  maxWidth: number,
  maxHeight: number,
  devicePixelRatio = 1,
): { width: number; height: number } {
  const size = imagePreviewDisplaySize(
    img.naturalWidth,
    img.naturalHeight,
    maxWidth,
    maxHeight,
    devicePixelRatio,
  );
  img.style.width = `${size.width}px`;
  img.style.height = `${size.height}px`;
  return size;
}

export function applyImagePreviewWindowSize(
  win: Pick<Window, 'resizeTo' | 'moveTo'>,
  size: ReturnType<typeof imagePreviewWindowSize>,
): void {
  try {
    win.resizeTo(size.width, size.height);
    win.moveTo(size.left, size.top);
  } catch {
    /* some browsers block scripted resize */
  }
}

export function imagePreviewWindowFeatures(availWidth: number, availHeight: number): string {
  const size = imagePreviewWindowSize(availWidth, availHeight);
  return `popup=yes,width=${size.width},height=${size.height},left=${size.left},top=${size.top},resizable=yes,scrollbars=yes`;
}

export function imagePreviewWindowHtml(preview: ImagePreview, src: string): string {
  const name = escapePreviewHtml(preview.name);
  const alt = escapePreviewHtml(preview.alt);
  const safeSrc = escapePreviewHtml(src);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${name}</title>
  <style>
    html, body { margin: 0; height: 100%; background: #FAF8F5; color: #1F1917; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { display: flex; flex-direction: column; }
    header { padding: 12px 16px; font-size: 13px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; border-bottom: 2px solid #1F1917; }
    main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 16px; min-height: 0; overflow: hidden; }
    img { display: block; width: auto; height: auto; max-width: 100%; max-height: 100%; object-fit: contain; object-position: center; background: #fff; border-radius: 12px; image-rendering: auto; image-rendering: high-quality; }
  </style>
</head>
<body>
  <header>${name}</header>
  <main><img id="preview-img" src="${safeSrc}" alt="${alt}" decoding="async" fetchpriority="high" /></main>
  <script>
    (function () {
      var img = document.getElementById('preview-img');
      var main = img && img.parentElement;
      function fit() {
        if (!img || !main || !img.naturalWidth) return;
        var dpr = Math.max(1, window.devicePixelRatio || 1);
        var cssW = img.naturalWidth / dpr;
        var cssH = img.naturalHeight / dpr;
        var scale = Math.min(1, main.clientWidth / cssW, main.clientHeight / cssH);
        img.style.width = Math.max(1, Math.round(cssW * scale)) + 'px';
        img.style.height = Math.max(1, Math.round(cssH * scale)) + 'px';
      }
      img.addEventListener('load', fit);
      window.addEventListener('resize', fit);
      if (img.complete) fit();
    })();
  </script>
</body>
</html>`;
}

export function openImagePreviewWindow(
  preview: ImagePreview,
  src = preview.src,
  openWindow: typeof window.open = window.open.bind(window),
  availWidth = typeof window !== 'undefined' ? window.screen.availWidth : 1280,
  availHeight = typeof window !== 'undefined' ? window.screen.availHeight : 800,
): Window | null {
  const size = imagePreviewWindowSize(availWidth, availHeight);
  const win = openWindow('', `image-preview-${preview.id || 'view'}-${Date.now()}`, imagePreviewWindowFeatures(availWidth, availHeight));
  if (!win) return null;
  applyImagePreviewWindowSize(win, size);
  win.document.open();
  win.document.write(imagePreviewWindowHtml(preview, resolvePreviewSrc(src)));
  win.document.close();
  try {
    win.focus();
  } catch {
    /* ignore */
  }
  return win;
}

export async function hydrateImagePreviewWindow(win: Window, preview: ImagePreview): Promise<void> {
  const url = await fullResolutionImageUrl(preview.id, preview.src);
  if (!url || win.closed) return;
  const getEl = win.document.getElementById;
  if (typeof getEl !== 'function') return;
  const img = getEl.call(win.document, 'preview-img') as HTMLImageElement | null;
  if (img) img.src = resolvePreviewSrc(url);
}

/** Opens a large preview window. Falls back to the overlay callback if the browser blocks popups. */
export function showImagePreview(
  preview: ImagePreview | null,
  onOverlay: (preview: ImagePreview) => void,
  openWindow?: typeof window.open,
): boolean {
  if (!preview) return false;
  const opener = openWindow ?? (typeof window !== 'undefined' ? window.open.bind(window) : () => null);
  const win = openImagePreviewWindow(preview, preview.src, opener);
  if (win) {
    void hydrateImagePreviewWindow(win, preview);
    return true;
  }
  onOverlay(preview);
  return false;
}
