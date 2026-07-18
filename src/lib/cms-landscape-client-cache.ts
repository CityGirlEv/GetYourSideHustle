import manifest from "@/data/cms-landscape/2026/manifest.json";
import type { CmsLandscapePlanRecord } from "@/lib/cms-landscape-types";

const DB_NAME = "mypartb-cms-landscape";
const DB_VERSION = 1;
const STORE = "bundles";
const BUNDLE_KEY = `cms-landscape-${manifest.contractYear}`;

export type CmsLandscapeClientCacheMeta = {
  cachedAt: string;
  ingestedAt: string;
  contractYear: number;
};

export type CmsLandscapeClientCacheBundle = {
  meta: CmsLandscapeClientCacheMeta;
  plans: Record<string, CmsLandscapePlanRecord>;
  countyIndex: Record<string, string[]>;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexedDB unavailable"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("indexedDB open failed"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
  });
}

function idbGet<T>(db: IDBDatabase, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const request = store.get(key);
    request.onerror = () => reject(request.error ?? new Error("indexedDB get failed"));
    request.onsuccess = () => resolve(request.result as T | undefined);
  });
}

function idbPut(db: IDBDatabase, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("indexedDB put failed"));
  });
}

/** True when bundle was cached today and matches the current ingested manifest. */
export function isCmsLandscapeClientCacheValid(meta: CmsLandscapeClientCacheMeta): boolean {
  if (meta.contractYear !== manifest.contractYear) return false;
  if (meta.ingestedAt !== manifest.ingestedAt) return false;
  const cachedDay = meta.cachedAt.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  return cachedDay === today;
}

/** Read nationwide CMS landscape JSON from IndexedDB (browser only). */
export async function readCmsLandscapeClientCache(): Promise<CmsLandscapeClientCacheBundle | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openDb();
    const bundle = await idbGet<CmsLandscapeClientCacheBundle>(db, BUNDLE_KEY);
    db.close();
    if (!bundle?.plans || Object.keys(bundle.plans).length === 0) return null;
    if (!bundle.meta || !isCmsLandscapeClientCacheValid(bundle.meta)) return null;
    return bundle;
  } catch {
    return null;
  }
}

/** Persist CMS landscape after a successful network load — fire-and-forget. */
export function writeCmsLandscapeClientCache(
  plans: Record<string, CmsLandscapePlanRecord>,
  countyIndex: Record<string, string[]>,
): void {
  if (typeof indexedDB === "undefined") return;
  const bundle: CmsLandscapeClientCacheBundle = {
    meta: {
      cachedAt: new Date().toISOString(),
      ingestedAt: manifest.ingestedAt,
      contractYear: manifest.contractYear,
    },
    plans,
    countyIndex,
  };
  void openDb()
    .then((db) => idbPut(db, BUNDLE_KEY, bundle).finally(() => db.close()))
    .catch(() => {
      // Quota or private mode — ignore; in-memory session cache still works.
    });
}

/** Clear IndexedDB cache (e.g. after ingest or when stale bundle blocks reload). */
export async function clearCmsLandscapeClientCache(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(BUNDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("indexedDB delete failed"));
    });
    db.close();
  } catch {
    // ignore
  }
}
