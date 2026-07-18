import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  loadEditorialCalendarProgressAdmin,
  mergeEditorialCalendarProgressAdmin,
  setEditorialCalendarTaskAdmin,
} from "@/lib/content-factory.functions";
import {
  hasLocalOnlyCalendarProgress,
  loadCalendarCompletedEvents,
  mergeCalendarProgressMaps,
  persistCalendarProgressLocally,
  setCalendarTaskCompleted,
} from "@/lib/content-factory/editorial-calendar-progress";
import { userHasAdminRole } from "@/lib/user-roles";
import type { User } from "@/lib/app-store";

export function useEditorialCalendarProgress(user: User | null) {
  const queryClient = useQueryClient();
  const loadProgress = useServerFn(loadEditorialCalendarProgressAdmin);
  const setTaskRemote = useServerFn(setEditorialCalendarTaskAdmin);
  const mergeProgress = useServerFn(mergeEditorialCalendarProgressAdmin);
  const syncStartedRef = useRef(false);

  const [completedEvents, setCompletedEvents] = useState<Record<string, boolean>>(() =>
    loadCalendarCompletedEvents(),
  );

  const progressQuery = useQuery({
    queryKey: ["editorial-calendar-progress", "team"],
    queryFn: () => loadProgress({ data: undefined }),
    enabled: Boolean(user && userHasAdminRole(user)),
    staleTime: 15_000,
    retry: 2,
  });

  useEffect(() => {
    syncStartedRef.current = false;
  }, [user?.id]);

  useEffect(() => {
    if (!progressQuery.data || syncStartedRef.current) return;
    syncStartedRef.current = true;

    const local = loadCalendarCompletedEvents();
    const merged = mergeCalendarProgressMaps(progressQuery.data, local);
    setCompletedEvents(merged);
    persistCalendarProgressLocally(merged);

    if (hasLocalOnlyCalendarProgress(progressQuery.data, local)) {
      void mergeProgress({ data: { tasks: merged } })
        .then((saved) => {
          queryClient.setQueryData(["editorial-calendar-progress", "team"], saved);
          setCompletedEvents(saved);
          persistCalendarProgressLocally(saved);
        })
        .catch(() => {
          toast.error("Could not sync calendar checkboxes to the server. Retrying on next change.");
        });
    }
  }, [progressQuery.data, mergeProgress, queryClient, user?.id]);

  useEffect(() => {
    if (!progressQuery.isError) return;
    toast.error("Could not load saved calendar progress. Checkboxes are local-only until sync works.");
  }, [progressQuery.isError]);

  const toggleEventCompleted = useCallback(
    (storageId: string, legacyId?: string) => {
      setCompletedEvents((prev) => {
        const wasDone = !!(prev[storageId] ?? (legacyId ? prev[legacyId] : false));
        const completed = !wasDone;
        const next = { ...prev };
        if (completed) next[storageId] = true;
        else delete next[storageId];
        if (legacyId) delete next[legacyId];

        setCalendarTaskCompleted(storageId, completed);
        if (legacyId) setCalendarTaskCompleted(legacyId, false);

        void setTaskRemote({ data: { storageId, completed } })
          .then((saved) => {
            setCompletedEvents(saved);
            persistCalendarProgressLocally(saved);
            queryClient.setQueryData(["editorial-calendar-progress", "team"], saved);
          })
          .catch(() => {
            toast.error("Could not save checkbox — will retry when you toggle again.");
            void mergeProgress({ data: { tasks: next } })
              .then((saved) => {
                setCompletedEvents(saved);
                persistCalendarProgressLocally(saved);
                queryClient.setQueryData(["editorial-calendar-progress", "team"], saved);
              })
              .catch(() => {
                /* local cache remains */
              });
          });

        return next;
      });
    },
    [mergeProgress, queryClient, setTaskRemote, user?.id],
  );

  return {
    completedEvents,
    toggleEventCompleted,
    progressLoading: progressQuery.isLoading,
    progressSyncError: progressQuery.isError,
  };
}
