/** IndexedDB local cache for GYSH task / plan attachment binaries.
 * Source of truth is D1 `content_base64` via /api/task-attachments and /api/plan-attachments.
 */

const DB_NAME = "gysh_task_files";
const STORE = "files";
const DB_VERSION = 1;

export type StoredFileRecord = {
  key: string;
  taskId: string;
  fileId: string;
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
        const store = db.createObjectStore(STORE, { keyPath: "key" });
        store.createIndex("taskId", "taskId", { unique: false });
      }
    };
  });
}

function fileKey(taskId: string, fileId: string) {
  return `${taskId}::${fileId}`;
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

export async function putTaskFile(record: Omit<StoredFileRecord, "key">): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ ...record, key: fileKey(record.taskId, record.fileId) });
    await txDone(tx);
  } finally {
    db.close();
  }
}

export async function getTaskFile(taskId: string, fileId: string): Promise<StoredFileRecord | null> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(fileKey(taskId, fileId));
    const result = await new Promise<StoredFileRecord | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result as StoredFileRecord | undefined);
      req.onerror = () => reject(req.error ?? new Error("IndexedDB get failed"));
    });
    await txDone(tx);
    return result ?? null;
  } finally {
    db.close();
  }
}

export async function deleteTaskFile(taskId: string, fileId: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(fileKey(taskId, fileId));
    await txDone(tx);
  } finally {
    db.close();
  }
}

export async function deleteAllFilesForTask(taskId: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const index = store.index("taskId");
    const req = index.getAllKeys(IDBKeyRange.only(taskId));
    const keys = await new Promise<IDBValidKey[]>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result as IDBValidKey[]);
      req.onerror = () => reject(req.error ?? new Error("IndexedDB getAllKeys failed"));
    });
    for (const key of keys) store.delete(key);
    await txDone(tx);
  } finally {
    db.close();
  }
}

export async function clearAllTaskFiles(): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    await txDone(tx);
  } finally {
    db.close();
  }
}

export function newFileId(): string {
  return `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
