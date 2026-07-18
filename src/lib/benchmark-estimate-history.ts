import {
  BENCHMARK_ESTIMATE_STORE_PREFIX,
  normalizeBenchmarkEstimateId,
} from "@/lib/benchmark-id";

const KEY = "benchmark-estimate:index";

/** Locale-aware date+time for saved benchmark list entries (e.g. "Jul 4, 2026, 2:15 AM"). */
export function formatBenchmarkSavedAt(value: number | string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export type BenchmarkEstimateHistoryEntry = {
  id: string;
  zip3: string;
  createdAt: number;
};

export type BenchmarkEstimateHistorySource = "index" | "storage";

export type BenchmarkEstimateHistoryEntryWithSource = BenchmarkEstimateHistoryEntry & {
  source: BenchmarkEstimateHistorySource;
};

function parseIndexEntries(raw: string | null): BenchmarkEstimateHistoryEntry[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as BenchmarkEstimateHistoryEntry[];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((entry) => entry?.id)
      .map((entry) => ({
        id: normalizeBenchmarkEstimateId(entry.id),
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

function parseStoredBenchmarkIndexEntry(
  key: string,
  raw: string,
): BenchmarkEstimateHistoryEntry | null {
  const idFromKey = normalizeBenchmarkEstimateId(key.slice(BENCHMARK_ESTIMATE_STORE_PREFIX.length));
  if (!idFromKey) return null;
  try {
    const parsed = JSON.parse(raw) as {
      estimateId?: string;
      intake?: { zip3?: string };
      report?: { zip3?: string };
    };
    if (!parsed?.report) return null;
    const id = normalizeBenchmarkEstimateId(parsed.estimateId ?? idFromKey);
    const zip3 =
      (parsed.intake?.zip3 ?? parsed.report?.zip3 ?? "").trim() || "—";
    return { id, zip3, createdAt: 0 };
  } catch {
    return null;
  }
}

/** Scan localStorage store keys for benchmark payloads missing from the index. */
export function discoverBenchmarkEstimatesFromStorage(): BenchmarkEstimateHistoryEntry[] {
  if (typeof localStorage === "undefined") return [];
  const discovered: BenchmarkEstimateHistoryEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(BENCHMARK_ESTIMATE_STORE_PREFIX)) continue;
    const entry = parseStoredBenchmarkIndexEntry(key, localStorage.getItem(key) ?? "");
    if (entry) discovered.push(entry);
  }
  return discovered;
}

/** Merge index + orphaned store payloads; persist newly discovered rows. */
export function syncBenchmarkEstimateIndexFromStorage(): BenchmarkEstimateHistoryEntry[] {
  const indexed = parseIndexEntries(localStorage.getItem(KEY));
  const byId = new Map<string, BenchmarkEstimateHistoryEntry>();
  for (const entry of indexed) {
    byId.set(entry.id, entry);
  }

  let changed = false;
  for (const stored of discoverBenchmarkEstimatesFromStorage()) {
    const existing = byId.get(stored.id);
    if (!existing) {
      byId.set(stored.id, stored);
      changed = true;
      continue;
    }
    if (existing.zip3 === "—" && stored.zip3 !== "—") {
      byId.set(stored.id, { ...existing, zip3: stored.zip3 });
      changed = true;
    }
  }

  if (!changed) {
    return indexed;
  }

  const indexedIds = new Set(indexed.map((entry) => entry.id));
  const mergedIndexed = indexed.map((entry) => byId.get(entry.id) ?? entry);
  const appended = [...byId.values()].filter((entry) => !indexedIds.has(entry.id));
  const merged = [...mergedIndexed, ...appended];

  try {
    localStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    /* ignore quota */
  }

  return merged;
}

export function listBenchmarkEstimateHistory(): BenchmarkEstimateHistoryEntry[] {
  try {
    return syncBenchmarkEstimateIndexFromStorage();
  } catch {
    return [];
  }
}

export function listBenchmarkEstimateHistoryWithSources(): BenchmarkEstimateHistoryEntryWithSource[] {
  const indexed = new Set(parseIndexEntries(localStorage.getItem(KEY)).map((entry) => entry.id));
  return listBenchmarkEstimateHistory().map((entry) => ({
    ...entry,
    source: indexed.has(entry.id) ? "index" : "storage",
  }));
}

/** Match benchmark IDs or ZIP3 prefixes (e.g. "705"). */
export function filterBenchmarkEstimateHistory(
  entries: BenchmarkEstimateHistoryEntry[],
  query: string,
): BenchmarkEstimateHistoryEntry[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return entries;
  return entries.filter((entry) => {
    const id = entry.id.toLowerCase();
    const zip3 = entry.zip3.toLowerCase();
    return id.includes(trimmed) || zip3.startsWith(trimmed) || zip3.includes(trimmed);
  });
}

export function rememberBenchmarkEstimate(entry: { id: string; zip3: string }) {
  try {
    const id = normalizeBenchmarkEstimateId(entry.id);
    const zip3 = (entry.zip3 ?? "").trim() || "—";
    const existing = listBenchmarkEstimateHistory().filter((e) => e.id !== id);
    const next = [{ id, zip3, createdAt: Date.now() }, ...existing];
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function createBenchmarkEstimateId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BM-${stamp}-${rand}`;
}
