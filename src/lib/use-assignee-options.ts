import { useEffect, useState } from "react";
import { TEST_OWNERS } from "@/lib/test-plan";
import { listQaAssignees } from "@/lib/qa-assignees.functions";

// Module-level cache so we don't refetch on every component mount.
let cache: string[] | null = null;
let inflight: Promise<string[]> | null = null;
const subscribers = new Set<(v: string[]) => void>();

function publish(list: string[]) {
  cache = list;
  subscribers.forEach((cb) => cb(list));
}

function fetchOnce(force = false): Promise<string[]> {
  if (inflight) return inflight;
  if (!force && cache) return Promise.resolve(cache);
  inflight = listQaAssignees()
    .then((qa) => {
      const merged = Array.from(new Set(["Unassigned", ...(TEST_OWNERS as readonly string[]), ...qa]));
      publish(merged);
      return merged;
    })
    .catch((e) => {
      console.warn("[assignees] failed to load QA list", e);
      const merged = ["Unassigned", ...(TEST_OWNERS as readonly string[])];
      publish(merged);
      return merged;
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
export function refreshAssigneeOptions(): Promise<string[]> {
  cache = null;
  return fetchOnce(true);
}

/**
 * Hook returning the merged assignee list: built-in TEST_OWNERS plus every
 * enabled QA user. Refreshes on mount but de-dupes requests app-wide.
 */
export function useAssigneeOptions(): string[] {
  const [list, setList] = useState<string[]>(cache ?? ["Unassigned", ...(TEST_OWNERS as readonly string[])]);
  useEffect(() => {
    subscribers.add(setList);
    fetchOnce().then((v) => setList(v));
    // Refetch when the tab regains focus so admin changes made in another
    // tab (or just now in this one) propagate without a full reload.
    const onFocus = () => { fetchOnce(true); };
    if (typeof window !== "undefined") window.addEventListener("focus", onFocus);
    return () => {
      subscribers.delete(setList);
      if (typeof window !== "undefined") window.removeEventListener("focus", onFocus);
    };
  }, []);
  return list;
}