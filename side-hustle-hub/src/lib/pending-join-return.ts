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
  /** Resume `/workshops?register=` after Free signup or sign-in. */
  workshopRegisterId?: string;
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
    workshopRegisterId: input.workshopRegisterId,
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
  workshopRegisterId?: string;
} {
  const join = input.joinReturn;
  const workshopRegisterId = String(join?.workshopRegisterId || "").trim();
  if (join?.view === "workshops" && workshopRegisterId) {
    return { view: "workshops", workshopRegisterId };
  }

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

  if (join?.view) {
    return {
      view: join.view,
      findMineMode: join.findMineMode,
      seniorsTab: join.seniorsTab,
      kidsMode: join.kidsMode,
      kidsTab: join.kidsTab,
      workshopRegisterId: join.workshopRegisterId,
    };
  }

  return { view: "guides" };
}

/** Take Free signup / sign-in back to the workshop Register form, if that is why they left. */
export function consumeWorkshopJoinReturn(): string | null {
  const pending = readPendingJoinReturn();
  const dest = resolvePostFreeSignupDestination({ joinReturn: pending });
  const id = String(dest.workshopRegisterId || "").trim();
  if (dest.view !== "workshops" || !id) return null;
  clearPendingJoinReturn();
  return id;
}
