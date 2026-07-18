const INDEX_KEY = "scenario:index";

/** sessionStorage prefix for SCN- comparison payloads (created in this tab/session). */
export const SCENARIO_SESSION_PREFIX = "scenario:";

export type ScenarioHistoryEntry = {
  code: string;
  zip3: string;
  createdAt: number;
};

export type ScenarioHistorySource = "index" | "storage";

export type ScenarioHistoryEntryWithSource = ScenarioHistoryEntry & {
  source: ScenarioHistorySource;
};

function parseIndexEntries(raw: string | null): ScenarioHistoryEntry[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Array<Partial<ScenarioHistoryEntry>>;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((entry) => entry?.code)
      .map((entry) => ({
        code: String(entry.code).trim(),
        zip3: (entry.zip3 ?? "").trim() || "—",
        createdAt:
          typeof entry.createdAt === "number" && Number.isFinite(entry.createdAt)
            ? entry.createdAt
            : 0,
      }));
  } catch {
    return [];
  }
}

function parseStoredScenarioIndexEntry(
  key: string,
  raw: string,
): ScenarioHistoryEntry | null {
  const code = key.slice(SCENARIO_SESSION_PREFIX.length).trim();
  if (!code) return null;
  try {
    const parsed = JSON.parse(raw) as {
      scenarioCode?: string;
      zip3?: string;
    };
    const resolvedCode = (parsed?.scenarioCode ?? code).trim();
    if (!resolvedCode) return null;
    const zip3 = (parsed?.zip3 ?? "").trim() || "—";
    return { code: resolvedCode, zip3, createdAt: 0 };
  } catch {
    return null;
  }
}

/** Scan sessionStorage for SCN- payloads missing from the index. */
export function discoverScenariosFromStorage(): ScenarioHistoryEntry[] {
  if (typeof sessionStorage === "undefined") return [];
  const discovered: ScenarioHistoryEntry[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key?.startsWith(SCENARIO_SESSION_PREFIX)) continue;
    const entry = parseStoredScenarioIndexEntry(key, sessionStorage.getItem(key) ?? "");
    if (entry) discovered.push(entry);
  }
  return discovered;
}

/** Merge index + orphaned session payloads; persist newly discovered rows. */
export function syncScenarioIndexFromStorage(): ScenarioHistoryEntry[] {
  const indexed = parseIndexEntries(localStorage.getItem(INDEX_KEY));
  const byCode = new Map<string, ScenarioHistoryEntry>();
  for (const entry of indexed) {
    byCode.set(entry.code, entry);
  }

  let changed = false;
  for (const stored of discoverScenariosFromStorage()) {
    const existing = byCode.get(stored.code);
    if (!existing) {
      byCode.set(stored.code, stored);
      changed = true;
      continue;
    }
    if (existing.zip3 === "—" && stored.zip3 !== "—") {
      byCode.set(stored.code, { ...existing, zip3: stored.zip3 });
      changed = true;
    }
  }

  if (!changed) {
    return indexed;
  }

  const indexedCodes = new Set(indexed.map((entry) => entry.code));
  const mergedIndexed = indexed.map((entry) => byCode.get(entry.code) ?? entry);
  const appended = [...byCode.values()].filter((entry) => !indexedCodes.has(entry.code));
  const merged = [...mergedIndexed, ...appended];

  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(merged));
  } catch {
    /* ignore quota */
  }

  return merged;
}

export function listScenarioHistory(): ScenarioHistoryEntry[] {
  try {
    return syncScenarioIndexFromStorage();
  } catch {
    return [];
  }
}

export function listScenarioHistoryWithSources(): ScenarioHistoryEntryWithSource[] {
  const indexed = new Set(parseIndexEntries(localStorage.getItem(INDEX_KEY)).map((entry) => entry.code));
  return listScenarioHistory().map((entry) => ({
    ...entry,
    source: indexed.has(entry.code) ? "index" : "storage",
  }));
}

/** Match SCN- codes or ZIP3 prefixes (e.g. "705"). */
export function filterScenarioHistory(
  entries: ScenarioHistoryEntry[],
  query: string,
): ScenarioHistoryEntry[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return entries;
  return entries.filter((entry) => {
    const code = entry.code.toLowerCase();
    const zip3 = entry.zip3.toLowerCase();
    return code.includes(trimmed) || zip3.startsWith(trimmed) || zip3.includes(trimmed);
  });
}

export function rememberScenario(code: string, zip3?: string) {
  try {
    const normalizedCode = code.trim();
    const normalizedZip3 = (zip3 ?? "").trim() || "—";
    const existing = listScenarioHistory().filter((e) => e.code !== normalizedCode);
    const next = [
      { code: normalizedCode, zip3: normalizedZip3, createdAt: Date.now() },
      ...existing,
    ];
    localStorage.setItem(INDEX_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
