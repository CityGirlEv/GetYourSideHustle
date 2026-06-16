import { useEffect, useState } from "react";
import { listQaAssignees } from "@/lib/qa-assignees.functions";
import type { AssigneeOption } from "@/lib/use-assignee-options";
import { formatAssigneeOptionLabel } from "@/lib/use-assignee-options";

export { formatAssigneeOptionLabel };
export type { AssigneeOption };

const UNASSIGNED: AssigneeOption = { name: "Unassigned", selectable: true };

function mergeQaOwnerOptions(qa: { name: string; active: boolean }[]): AssigneeOption[] {
  return [UNASSIGNED, ...qa.map((entry) => ({ name: entry.name, selectable: true }))];
}

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
      const merged = mergeQaOwnerOptions(qa);
      publish(merged);
      return merged;
    })
    .catch((e) => {
      console.warn("[qa-owner] failed to load QA roster", e);
      publish([UNASSIGNED]);
      return [UNASSIGNED];
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Refetch QA owner options (e.g. after admin enables a QA account). */
export function refreshQaOwnerOptions(): Promise<AssigneeOption[]> {
  cache = null;
  return fetchOnce(true);
}

/** QA Owner dropdown options: Unassigned + every QA-role user (all selectable). */
export function useQaOwnerOptions(): AssigneeOption[] {
  const [list, setList] = useState<AssigneeOption[]>(cache ?? [UNASSIGNED]);
  useEffect(() => {
    subscribers.add(setList);
    // Always refetch on mount so HMR / prior failed loads don't serve a stale roster.
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

export function qaOwnerOptionNames(options: AssigneeOption[]): string[] {
  return options.filter((o) => o.name !== "Unassigned").map((o) => o.name);
}
