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

function fetchOnce(): Promise<string[]> {
  if (inflight) return inflight;
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
 * Hook returning the merged assignee list: built-in TEST_OWNERS plus every
 * enabled QA user. Refreshes on mount but de-dupes requests app-wide.
 */
export function useAssigneeOptions(): string[] {
  const [list, setList] = useState<string[]>(cache ?? ["Unassigned", ...(TEST_OWNERS as readonly string[])]);
  useEffect(() => {
    subscribers.add(setList);
    fetchOnce().then((v) => setList(v));
    return () => {
      subscribers.delete(setList);
    };
  }, []);
  return list;
}