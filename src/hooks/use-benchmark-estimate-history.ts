import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  filterBenchmarkEstimateHistory,
  listBenchmarkEstimateHistory,
  type BenchmarkEstimateHistoryEntry,
} from "@/lib/benchmark-estimate-history";
import {
  userCanViewAllScenarios,
  userHasAdminRole,
  userHasAgentRole,
  type UserRoleCheck,
} from "@/lib/user-roles";

export type BenchmarkHistoryListKind = "device" | "all";

export type BenchmarkEstimateHistoryState = {
  device: BenchmarkEstimateHistoryEntry[];
  server: BenchmarkEstimateHistoryEntry[];
  all: BenchmarkEstimateHistoryEntry[];
  loadingServer: boolean;
  serverError: string | null;
};

function normalizeHistoryZip3(zip3: string | null | undefined): string {
  return (zip3 ?? "").trim() || "—";
}

function mapServerScenarioRows(
  rows: Array<{ scenario_code: string; zip3: string | null; created_at: string }>,
): BenchmarkEstimateHistoryEntry[] {
  return rows.map((row) => ({
    id: row.scenario_code,
    zip3: normalizeHistoryZip3(row.zip3),
    createdAt: new Date(row.created_at).getTime(),
  }));
}

/** Merge device + server lists; device entries win on duplicate IDs. */
export function mergeBenchmarkHistorySources(
  device: BenchmarkEstimateHistoryEntry[],
  server: BenchmarkEstimateHistoryEntry[],
): BenchmarkEstimateHistoryEntry[] {
  const byId = new Map<string, BenchmarkEstimateHistoryEntry>();
  for (const entry of server) {
    byId.set(entry.id, entry);
  }
  for (const entry of device) {
    byId.set(entry.id, entry);
  }
  return [...byId.values()].sort((a, b) => {
    const aTime = a.createdAt || 0;
    const bTime = b.createdAt || 0;
    if (bTime !== aTime) return bTime - aTime;
    return b.id.localeCompare(a.id);
  });
}

async function fetchServerScenarioHistory(
  user: UserRoleCheck & { id: string },
): Promise<BenchmarkEstimateHistoryEntry[]> {
  if (userCanViewAllScenarios(user)) {
    const { data, error } = await supabase
      .from("scenarios")
      .select("scenario_code, zip3, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return mapServerScenarioRows(data ?? []);
  }

  if (userHasAdminRole(user) || userHasAgentRole(user)) {
    const { data, error } = await supabase
      .from("scenarios")
      .select("scenario_code, zip3, created_at")
      .or(
        `claimed_by.eq.${user.id},assigned_agent_id.eq.${user.id},created_by.eq.${user.id}`,
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return mapServerScenarioRows(data ?? []);
  }

  return [];
}

function canFetchServerScenarioHistory(user: UserRoleCheck | null | undefined): user is UserRoleCheck & {
  id: string;
} {
  if (!user?.id) return false;
  return (
    userCanViewAllScenarios(user) || userHasAdminRole(user) || userHasAgentRole(user)
  );
}

export function canShowMergedBenchmarkHistory(user: UserRoleCheck | null | undefined): boolean {
  return canFetchServerScenarioHistory(user);
}

/** Saved benchmark scenarios — local device list with optional merged server list for staff. */
export function useBenchmarkEstimateHistory(
  refreshKey?: string,
  user?: UserRoleCheck | null,
): BenchmarkEstimateHistoryState {
  const [device, setDevice] = useState<BenchmarkEstimateHistoryEntry[]>([]);
  const [server, setServer] = useState<BenchmarkEstimateHistoryEntry[]>([]);
  const [loadingServer, setLoadingServer] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const refreshDevice = useCallback(() => {
    setDevice(listBenchmarkEstimateHistory());
  }, []);

  useEffect(() => {
    refreshDevice();
  }, [refreshKey, refreshDevice]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "benchmark-estimate:index" || event.key.startsWith("benchmark-estimate:store:")) {
        refreshDevice();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshDevice]);

  useEffect(() => {
    if (!canFetchServerScenarioHistory(user)) {
      setServer([]);
      setServerError(null);
      setLoadingServer(false);
      return;
    }

    let cancelled = false;
    setLoadingServer(true);
    setServerError(null);

    fetchServerScenarioHistory(user)
      .then((rows) => {
        if (!cancelled) setServer(rows);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setServer([]);
          setServerError(error instanceof Error ? error.message : "Could not load server scenarios");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingServer(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role, user?.roles?.join(","), refreshKey]);

  const all = useMemo(() => mergeBenchmarkHistorySources(device, server), [device, server]);

  return { device, server, all, loadingServer, serverError };
}

export function useFilteredBenchmarkEstimateHistory(
  refreshKey: string | undefined,
  user: UserRoleCheck | null | undefined,
  listKind: BenchmarkHistoryListKind,
  searchQuery: string,
): BenchmarkEstimateHistoryEntry[] {
  const history = useBenchmarkEstimateHistory(refreshKey, user);
  const source = listKind === "all" ? history.all : history.device;
  return filterBenchmarkEstimateHistory(source, searchQuery);
}
