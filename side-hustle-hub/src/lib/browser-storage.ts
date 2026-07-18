/** Safe key/value storage with in-memory fallback (Vitest node, SSR). */

type Store = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const memory = new Map<string, string>();

const memoryStore: Store = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => {
    memory.set(key, value);
  },
  removeItem: (key) => {
    memory.delete(key);
  },
};

function wrapWebStorage(storage: Storage): Store {
  return {
    getItem: (key) => {
      try {
        return storage.getItem(key);
      } catch {
        return memoryStore.getItem(key);
      }
    },
    setItem: (key, value) => {
      try {
        storage.setItem(key, value);
      } catch {
        memoryStore.setItem(key, value);
      }
    },
    removeItem: (key) => {
      try {
        storage.removeItem(key);
      } catch {
        memoryStore.removeItem(key);
      }
    },
  };
}

export function getLocalStore(): Store {
  if (typeof localStorage !== "undefined") return wrapWebStorage(localStorage);
  return memoryStore;
}

export function getSessionStore(): Store {
  if (typeof sessionStorage !== "undefined") return wrapWebStorage(sessionStorage);
  return memoryStore;
}

/** Test helper — clear in-memory fallback. */
export function clearMemoryStore(): void {
  memory.clear();
}
