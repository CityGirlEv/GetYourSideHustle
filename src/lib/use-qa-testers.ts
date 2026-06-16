import { useEffect, useState } from "react";
import { listQaTestersWithDevices, type QaTesterProfile } from "@/lib/qa-testers.functions";

let cache: QaTesterProfile[] | null = null;
let inflight: Promise<QaTesterProfile[]> | null = null;
const subscribers = new Set<(v: QaTesterProfile[]) => void>();

function publish(list: QaTesterProfile[]) {
  cache = list;
  subscribers.forEach((cb) => cb(list));
}

function fetchOnce(force = false): Promise<QaTesterProfile[]> {
  if (inflight) return inflight;
  if (!force && cache) return Promise.resolve(cache);
  inflight = listQaTestersWithDevices()
    .then((rows) => {
      publish(rows);
      return rows;
    })
    .catch((e) => {
      console.warn("[qa-testers] failed to load roster", e);
      publish([]);
      return [];
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function refreshQaTesters(): Promise<QaTesterProfile[]> {
  cache = null;
  return fetchOnce(true);
}

/** Admin-only QA roster with registered devices. No-op fetch when disabled. */
export function useQaTesters(enabled: boolean): QaTesterProfile[] {
  const [list, setList] = useState<QaTesterProfile[]>(enabled ? (cache ?? []) : []);
  useEffect(() => {
    if (!enabled) {
      setList([]);
      return;
    }
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
  }, [enabled]);
  return list;
}
