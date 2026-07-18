import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  loadSubmissionChecklistProgressAdmin,
  mergeSubmissionChecklistProgressAdmin,
} from "@/lib/submission-checklist.functions";
import {
  cloneSubmissionChecklistState,
  getDirtySubmissionChecklistItemIds,
  isSubmissionChecklistDbSetupError,
  isSubmissionChecklistStateDirty,
  loadSubmissionChecklistState,
  coalesceSubmissionChecklistStatesOnLoad,
  isSubmissionChecklistProgressCleared,
  mergeSubmissionChecklistStates,
  prepareSubmissionChecklistStateForServerMerge,
  restoreLocalMetaAdAssets,
  restoreLocalMetaAdChecklistProgress,
  saveSubmissionChecklistState,
  clearAllSubmissionChecklistState,
  submissionChecklistErrorMessage,
  SUBMISSION_CHECKLIST_DB_SETUP_MESSAGE,
  SUBMISSION_CHECKLIST_SERVER_SYNC_MAX_BYTES,
  estimateSubmissionChecklistPayloadBytes,
  type SubmissionChecklistState,
} from "@/lib/submission-checklist-storage";
import { allSubmissionChecklistItems } from "@/lib/submission-checklist-data";
import { userHasAdminRole } from "@/lib/user-roles";
import type { User } from "@/lib/app-store";

const QUERY_KEY = ["submission-checklist-progress", "team"] as const;
const SAVED_INDICATOR_MS = 2500;

export type ChecklistSaveStatus = "idle" | "saving" | "saved" | "error";

export function useSubmissionChecklistProgress(user: User | null) {
  const queryClient = useQueryClient();
  const loadRemote = useServerFn(loadSubmissionChecklistProgressAdmin);
  const mergeRemote = useServerFn(mergeSubmissionChecklistProgressAdmin);
  const syncStartedRef = useRef(false);
  const savedIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<SubmissionChecklistState>(loadSubmissionChecklistState());
  const serverBaselineRef = useRef<SubmissionChecklistState>(loadSubmissionChecklistState());
  const dbSetupToastShownRef = useRef(false);
  const loadErrorToastShownRef = useRef(false);

  const [state, setStateInternal] = useState<SubmissionChecklistState>(() =>
    loadSubmissionChecklistState(),
  );
  const [serverBaseline, setServerBaseline] = useState<SubmissionChecklistState>(() =>
    loadSubmissionChecklistState(),
  );
  const [saveStatus, setSaveStatus] = useState<ChecklistSaveStatus>("idle");
  const [serverSyncAvailable, setServerSyncAvailable] = useState(true);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  stateRef.current = state;
  serverBaselineRef.current = serverBaseline;

  const checklistItemIds = useMemo(
    () => allSubmissionChecklistItems().map((item) => item.id),
    [],
  );

  const dirtyItemIds = useMemo(
    () => getDirtySubmissionChecklistItemIds(state, serverBaseline, checklistItemIds),
    [checklistItemIds, serverBaseline, state],
  );

  const hasUnsavedChanges = useMemo(
    () => isSubmissionChecklistStateDirty(state, serverBaseline),
    [serverBaseline, state],
  );

  const progressQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => loadRemote({ data: undefined }),
    enabled: Boolean(user && userHasAdminRole(user)),
    staleTime: 10_000,
    retry: (failureCount, error) => {
      const message = error instanceof Error ? error.message : String(error ?? "");
      if (isSubmissionChecklistDbSetupError(message)) return false;
      return failureCount < 2;
    },
  });

  const showDbSetupToast = useCallback(() => {
    if (dbSetupToastShownRef.current) return;
    dbSetupToastShownRef.current = true;
    toast.error(SUBMISSION_CHECKLIST_DB_SETUP_MESSAGE);
  }, []);

  const markSaved = useCallback(() => {
    setSaveStatus("saved");
    if (savedIndicatorTimerRef.current) clearTimeout(savedIndicatorTimerRef.current);
    savedIndicatorTimerRef.current = setTimeout(() => {
      setSaveStatus("idle");
    }, SAVED_INDICATOR_MS);
  }, []);

  const applyServerSnapshot = useCallback(
    (saved: SubmissionChecklistState, localDraft: SubmissionChecklistState) => {
      const withAssets = restoreLocalMetaAdAssets(saved, localDraft);
      const withProgress = restoreLocalMetaAdChecklistProgress(withAssets, localDraft);
      queryClient.setQueryData(QUERY_KEY, withProgress);
      setStateInternal(withProgress);
      setServerBaseline(withProgress);
      serverBaselineRef.current = withProgress;
      saveSubmissionChecklistState(withProgress);
      return withProgress;
    },
    [queryClient],
  );

  const pushToServer = useCallback(
    async (next: SubmissionChecklistState): Promise<boolean> => {
      if (!user || !userHasAdminRole(user)) {
        markSaved();
        return true;
      }

      if (!serverSyncAvailable) {
        toast.info("Saved locally — team database is not set up yet.");
        markSaved();
        return true;
      }

      const payload = prepareSubmissionChecklistStateForServerMerge(next, serverBaselineRef.current);
      const payloadBytes = estimateSubmissionChecklistPayloadBytes(payload);
      if (payloadBytes > SUBMISSION_CHECKLIST_SERVER_SYNC_MAX_BYTES) {
        setSaveStatus("error");
        toast.error(
          "Checklist is too large to sync — remove large Meta ad uploads or reset unused records.",
        );
        return false;
      }

      setSaveStatus("saving");
      try {
        const saved = await mergeRemote({ data: { state: payload } });
        applyServerSnapshot(saved, next);
        markSaved();
        return true;
      } catch (err: unknown) {
        setSaveStatus("error");
        console.error("[submission-checklist] save failed", err);
        const message = submissionChecklistErrorMessage(err);
        if (isSubmissionChecklistDbSetupError(message)) {
          setServerSyncAvailable(false);
          showDbSetupToast();
        } else {
          toast.error(`Could not save checklist — ${message}`);
        }
        return false;
      }
    },
    [applyServerSnapshot, markSaved, mergeRemote, serverSyncAvailable, showDbSetupToast, user],
  );

  useEffect(() => {
    syncStartedRef.current = false;
    dbSetupToastShownRef.current = false;
    loadErrorToastShownRef.current = false;
  }, [user?.id]);

  useEffect(() => {
    if (syncStartedRef.current || progressQuery.isLoading) return;
    if (progressQuery.data === undefined && !progressQuery.isError) return;
    syncStartedRef.current = true;

    const local = loadSubmissionChecklistState();
    const server = progressQuery.isError ? null : (progressQuery.data ?? null);

    if (progressQuery.isError) {
      const message = submissionChecklistErrorMessage(progressQuery.error);
      if (isSubmissionChecklistDbSetupError(message)) {
        setServerSyncAvailable(false);
        showDbSetupToast();
      } else if (!loadErrorToastShownRef.current) {
        loadErrorToastShownRef.current = true;
        toast.error("Could not load saved checklist progress. Using local copy.");
      }
    }

    const localCleared = isSubmissionChecklistProgressCleared(local);
    const merged = coalesceSubmissionChecklistStatesOnLoad(server, local);
    const withAssets = restoreLocalMetaAdAssets(merged, local);
    const withProgress = localCleared
      ? merged
      : restoreLocalMetaAdChecklistProgress(withAssets, local);
    const baselineSnapshot = server
      ? restoreLocalMetaAdChecklistProgress(
          restoreLocalMetaAdAssets(server, local),
          local,
        )
      : withProgress;
    setStateInternal(withProgress);
    setServerBaseline(baselineSnapshot);
    serverBaselineRef.current = baselineSnapshot;
    saveSubmissionChecklistState(withProgress);
  }, [
    progressQuery.data,
    progressQuery.error,
    progressQuery.isError,
    progressQuery.isLoading,
    showDbSetupToast,
    user?.id,
  ]);

  const setState = useCallback(
    (updater: SubmissionChecklistState | ((prev: SubmissionChecklistState) => SubmissionChecklistState)) => {
      setStateInternal((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        saveSubmissionChecklistState(next);
        setSaveStatus((status) => (status === "saved" ? "idle" : status));
        return next;
      });
    },
    [],
  );

  const saveNow = useCallback(async (): Promise<boolean> => {
    const current = stateRef.current;
    saveSubmissionChecklistState(current);
    if (!user || !userHasAdminRole(user)) {
      setServerBaseline(current);
      markSaved();
      return true;
    }
    return pushToServer(current);
  }, [markSaved, pushToServer, user]);

  const saveItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      if (!dirtyItemIds.includes(itemId)) return true;
      setSavingItemId(itemId);
      try {
        return await saveNow();
      } finally {
        setSavingItemId((current) => (current === itemId ? null : current));
      }
    },
    [dirtyItemIds, saveNow],
  );

  const resetChecklist = useCallback(() => {
    const baseline = cloneSubmissionChecklistState(serverBaselineRef.current);
    setStateInternal(baseline);
    serverBaselineRef.current = baseline;
    saveSubmissionChecklistState(baseline);
    queryClient.setQueryData(QUERY_KEY, baseline);
    setSaveStatus("idle");
  }, [queryClient]);

  const clearChecklist = useCallback(() => {
    const cleared = clearAllSubmissionChecklistState();
    setStateInternal(cleared);
    saveSubmissionChecklistState(cleared);
    setSaveStatus("idle");
  }, []);

  useEffect(
    () => () => {
      if (savedIndicatorTimerRef.current) clearTimeout(savedIndicatorTimerRef.current);
    },
    [],
  );

  return {
    state,
    setState,
    resetChecklist,
    clearChecklist,
    saveNow,
    saveItem,
    saveStatus,
    hasUnsavedChanges,
    dirtyItemIds,
    savingItemId,
    isLoading: progressQuery.isLoading,
    syncError: progressQuery.isError,
    serverSyncAvailable,
  };
}
