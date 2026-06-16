const KEY = "scenario:index";

export type ScenarioHistoryEntry = { code: string; createdAt: number };

export function listScenarioHistory(): ScenarioHistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ScenarioHistoryEntry[];
    return Array.isArray(arr) ? arr.filter((e) => e?.code) : [];
  } catch {
    return [];
  }
}

export function rememberScenario(code: string) {
  try {
    const existing = listScenarioHistory().filter((e) => e.code !== code);
    const next = [{ code, createdAt: Date.now() }, ...existing].slice(0, 20);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
