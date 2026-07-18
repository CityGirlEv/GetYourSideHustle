/** IndexedDB blob store for GYSH financial receipts / contract PDFs (phase 1).
 * Metadata lives in D1. Blobs are browser-local until R2 is wired.
 */

const DB_NAME = "gysh_financial_files";
const STORE = "files";
const DB_VERSION = 1;

export type StoredFinancialFile = {
  key: string;
  fileId: string;
  itemId: string | null;
  scope: "receipt" | "contract";
  name: string;
  mimeType: string;
  size: number;
  blob: Blob;
  addedAt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

export async function putFinancialFile(
  record: Omit<StoredFinancialFile, "key">,
): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ ...record, key: record.fileId });
    await txDone(tx);
  } finally {
    db.close();
  }
}

export async function getFinancialFile(
  fileId: string,
): Promise<StoredFinancialFile | null> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(fileId);
    const result = await new Promise<StoredFinancialFile | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result as StoredFinancialFile | undefined);
      req.onerror = () => reject(req.error ?? new Error("IndexedDB get failed"));
    });
    await txDone(tx);
    return result ?? null;
  } finally {
    db.close();
  }
}

export async function deleteFinancialFile(fileId: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(fileId);
    await txDone(tx);
  } finally {
    db.close();
  }
}

export function openFinancialBlob(file: StoredFinancialFile) {
  const url = URL.createObjectURL(file.blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
