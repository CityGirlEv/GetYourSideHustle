import { getLocalStore } from "./browser-storage";

export const PENDING_JOIN_RETURN_KEY = "gysh_pending_join_return_v1";
export const PENDING_JOIN_RETURN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Where to send the member after Free account creation. */
export type PendingJoinReturn = {
  version: 1;
  /** App activeView id (quiz, guides, seniors, kids, dashboard, …). */
  view: string;
  findMineMode?: "select" | "adult";
  seniorsTab?: "match" | "opportunities" | "guides" | "join";
  kidsMode?: "kids" | "junior";
  kidsTab?: string;
  savedAt: string;
};

export function isPendingJoinReturnFresh(pending: PendingJoinReturn, now = Date.now()): boolean {
  const saved = Date.parse(pending.savedAt);
  if (Number.isNaN(saved)) return false;
  return now - saved <= PENDING_JOIN_RETURN_TTL_MS;
}

export function savePendingJoinReturn(
  input: Omit<PendingJoinReturn, "version" | "savedAt"> & { savedAt?: string },
): PendingJoinReturn {
  const payload: PendingJoinReturn = {
    version: 1,
    view: input.view,
    findMineMode: input.findMineMode,
    seniorsTab: input.seniorsTab,
    kidsMode: input.kidsMode,
    kidsTab: input.kidsTab,
    savedAt: input.savedAt ?? new Date().toISOString(),
  };
  getLocalStore().setItem(PENDING_JOIN_RETURN_KEY, JSON.stringify(payload));
  return payload;
}

export function readPendingJoinReturn(): PendingJoinReturn | null {
  try {
    const raw = getLocalStore().getItem(PENDING_JOIN_RETURN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingJoinReturn;
    if (!parsed || parsed.version !== 1 || !parsed.view) {
      clearPendingJoinReturn();
      return null;
    }
    if (!isPendingJoinReturnFresh(parsed)) {
      clearPendingJoinReturn();
      return null;
    }
    return parsed;
  } catch {
    clearPendingJoinReturn();
    return null;
  }
}

export function clearPendingJoinReturn(): void {
  getLocalStore().removeItem(PENDING_JOIN_RETURN_KEY);
}

/** Prefer wizard returnView; otherwise the page that opened Join / signup. */
export function resolvePostFreeSignupDestination(input: {
  blueprintReturnView?: string | null;
  blueprintReturnTab?: string | null;
  blueprintAgeGroup?: string | null;
  joinReturn?: PendingJoinReturn | null;
}): {
  view: string;
  findMineMode?: "select" | "adult";
  seniorsTab?: "match" | "opportunities" | "guides" | "join";
  kidsMode?: "kids" | "junior";
  kidsTab?: string;
} {
  const bpView = input.blueprintReturnView;
  if (bpView === "quiz") {
    return { view: "quiz", findMineMode: "adult" };
  }
  if (bpView === "kids") {
    const age = input.blueprintAgeGroup;
    return {
      view: "kids",
      kidsMode: age === "junior" ? "junior" : "kids",
      kidsTab: input.blueprintReturnTab || "wizard",
    };
  }
  if (bpView === "seniors") {
    const tab = input.blueprintReturnTab;
    const seniorsTab =
      tab === "opportunities" || tab === "guides" || tab === "join" || tab === "match"
        ? tab
        : "match";
    return { view: "seniors", seniorsTab };
  }

  const join = input.joinReturn;
  if (join?.view) {
    return {
      view: join.view,
      findMineMode: join.findMineMode,
      seniorsTab: join.seniorsTab,
      kidsMode: join.kidsMode,
      kidsTab: join.kidsTab,
    };
  }

  return { view: "guides" };
}
