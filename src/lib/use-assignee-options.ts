import { useEffect, useState } from "react";
import { TEST_OWNERS } from "@/lib/test-plan";
import { listQaAssignees } from "@/lib/qa-assignees.functions";

export type AssigneeOption = {
  name: string;
  selectable: boolean;
};

const BUILTIN_OPTIONS: AssigneeOption[] = [
  { name: "Unassigned", selectable: true },
  ...(TEST_OWNERS as readonly string[]).map((name) => ({ name, selectable: true })),
];

function mergeAssigneeOptions(qa: { name: string; active: boolean }[]): AssigneeOption[] {
  const builtinNames = new Set(BUILTIN_OPTIONS.map((o) => o.name));
  const merged = [...BUILTIN_OPTIONS];
  for (const entry of qa) {
    if (builtinNames.has(entry.name)) continue;
    merged.push({ name: entry.name, selectable: true });
  }
  return merged;
}

export function assigneeOptionNames(options: AssigneeOption[]): string[] {
  return options.map((o) => o.name);
}

export function formatAssigneeOptionLabel(option: AssigneeOption): string {
  return option.selectable ? option.name : `${option.name} (inactive)`;
}

// Module-level cache so we don't refetch on every component mount.
let cache: AssigneeOption[] | null = null;
let inflight: Promise<AssigneeOption[]> | null = null;
const subscribers = new Set<(v: AssigneeOption[]) => void>();

function publish(list: AssigneeOption[]) {
  cache = list;
  subscribers.forEach((cb) => cb(list));
}

function fetchOnce(force = false): Promise<AssigneeOption[]> {
  if (inflight) return inflight;
  if (!force && cache) return Promise.resolve(cache);
  inflight = listQaAssignees()
    .then((qa) => {
      const merged = mergeAssigneeOptions(qa);
      publish(merged);
      return merged;
    })
    .catch((e) => {
      console.warn("[assignees] failed to load QA list", e);
      publish([...BUILTIN_OPTIONS]);
      return [...BUILTIN_OPTIONS];
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/**
 * Bust the in-memory cache and refetch the assignee list, pushing the new
 * value to every mounted subscriber. Call this after admin actions that
 * change which accounts are enabled or which users have the QA role.
 */
export function refreshAssigneeOptions(): Promise<AssigneeOption[]> {
  cache = null;
  return fetchOnce(true);
}

/**
 * Hook returning the merged assignee list: built-in TEST_OWNERS plus every
 * QA user (all QA-role users are selectable).
 */
export function useAssigneeOptions(): AssigneeOption[] {
  const [list, setList] = useState<AssigneeOption[]>(cache ?? [...BUILTIN_OPTIONS]);
  useEffect(() => {
    subscribers.add(setList);
    fetchOnce(true).then((v) => setList(v));
    const onFocus = () => {
      fetchOnce(true);
    };
    if (typeof window !== "undefined") window.addEventListener("focus", onFocus);
    return () => {
      subscribers.delete(setList);
      if (typeof window !== "undefined") window.removeEventListener("focus", onFocus);
    };
  }, []);
  return list;
}
