const DB_NAME = 'myplan_uploads_v1';
const STORE_NAME = 'blobs';
const IDB_TIMEOUT_MS = 800;
const IDB_READ_TIMEOUT_MS = 8000;
const THUMB_TIMEOUT_MS = 800;
const memory = new Map<string, Blob>();
let idbDisabled = false;

function canUseIdb(): boolean {
  return !idbDisabled && typeof indexedDB !== 'undefined';
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Storage timed out.')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open file storage.'));
  });
}

async function idbPut(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not save that file.'));
    tx.objectStore(STORE_NAME).put(blob, id);
  });
  db.close();
}

async function idbGet(id: string): Promise<Blob | undefined> {
  const db = await openDb();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error ?? new Error('Could not read that file.'));
  });
  db.close();
  return blob;
}

async function idbDelete(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not remove that file.'));
    tx.objectStore(STORE_NAME).delete(id);
  });
  db.close();
}

/** Stores the raw File/Blob so 20 MB mockups are not stuffed into localStorage. */
export async function putUploadBlob(id: string, blob: Blob): Promise<void> {
  memory.set(id, blob);
  if (!canUseIdb()) return;
  try {
    await withTimeout(idbPut(id, blob), IDB_TIMEOUT_MS);
  } catch {
    idbDisabled = true;
  }
}

export async function getUploadBlob(id: string): Promise<Blob | undefined> {
  if (memory.has(id)) return memory.get(id);
  if (!canUseIdb()) return undefined;
  try {
    return await withTimeout(idbGet(id), IDB_READ_TIMEOUT_MS);
  } catch {
    return undefined;
  }
}

export async function deleteUploadBlob(id: string): Promise<void> {
  memory.delete(id);
  if (!canUseIdb()) return;
  try {
    await withTimeout(idbDelete(id), IDB_TIMEOUT_MS);
  } catch {
    idbDisabled = true;
  }
}

const THUMB_MAX_EDGE = 256;
const THUMB_JPEG_QUALITY = 0.82;

function drawThumbnail(
  source: CanvasImageSource & { width: number; height: number },
  maxEdge: number,
): string | undefined {
  const width = Number(source.width) || 0;
  const height = Number(source.height) || 0;
  if (width < 1 || height < 1) return undefined;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', THUMB_JPEG_QUALITY);
}

function loadImageElement(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not decode image.'));
    };
    img.src = url;
  });
}

/** Small JPEG of the real file so lists show the mockup, not a broken/blank tile. */
export async function makeThumbnailDataUrl(blob: Blob, maxEdge = THUMB_MAX_EDGE): Promise<string | undefined> {
  try {
    return await withTimeout(
      (async () => {
        if (typeof createImageBitmap === 'function') {
          const bitmap = await createImageBitmap(blob);
          const url = drawThumbnail(bitmap, maxEdge);
          bitmap.close();
          return url;
        }
        const img = await loadImageElement(blob);
        return drawThumbnail(img, maxEdge);
      })(),
      THUMB_TIMEOUT_MS,
    );
  } catch {
    return undefined;
  }
}

export function isUsablePreviewUrl(value: string | undefined): value is string {
  if (!value) return false;
  if (value.startsWith('data:image/') && value.length > 32) return true;
  return false;
}

/** Drop dead blob: URLs from JSON so lists can hydrate a real thumbnail. */
export function storedPreviewForLoad(value: string | undefined): string {
  return isUsablePreviewUrl(value) ? value : '';
}

/** Prefer a real JPEG thumbnail, then a live blob URL. Ignore stale blob: URLs from a previous session. */
export async function hydrateStoredPreview(id: string, existing?: string): Promise<string | undefined> {
  if (isUsablePreviewUrl(existing)) return existing;
  const blob = await getUploadBlob(id);
  if (blob) {
    const thumb = await makeThumbnailDataUrl(blob);
    if (thumb) return thumb;
    return URL.createObjectURL(blob);
  }
  return undefined;
}

export async function withHydratedPreviews<T extends { id: string; dataUrl?: string }>(items: T[]): Promise<T[]> {
  return Promise.all(
    items.map(async (item) => {
      const dataUrl = await hydrateStoredPreview(item.id, item.dataUrl);
      return dataUrl && dataUrl !== item.dataUrl ? { ...item, dataUrl } : item;
    }),
  );
}

export async function previewUrlForUpload(id: string, existing?: string): Promise<string | undefined> {
  return hydrateStoredPreview(id, existing);
}

export async function storeFilePreview(id: string, file: Blob): Promise<string> {
  await putUploadBlob(id, file);
  const thumb = await makeThumbnailDataUrl(file);
  if (thumb) return thumb;
  return URL.createObjectURL(file);
}

export function newUploadId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isBlobPreviewUrl(value: string): boolean {
  return /^blob:/i.test(value);
}

/** Keep tiny legacy data URLs in JSON; never persist blob: URLs (they die on reload). */
export function persistablePreviewUrl(dataUrl: string | undefined): string | undefined {
  if (!dataUrl || isBlobPreviewUrl(dataUrl)) return undefined;
  if (dataUrl.startsWith('data:') && dataUrl.length > 200_000) return undefined;
  return dataUrl;
}

/** Browser quota is not an app-imposed library cap — never throw on save. */
export function writeLocalJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore QuotaExceededError */
  }
}
