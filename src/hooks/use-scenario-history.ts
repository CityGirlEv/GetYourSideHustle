import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  filterScenarioHistory,
  listScenarioHistory,
  type ScenarioHistoryEntry,
} from "@/lib/scenario-history";
import { mergeBenchmarkHistorySources } from "@/hooks/use-benchmark-estimate-history";
export { canShowMergedBenchmarkHistory } from "@/hooks/use-benchmark-estimate-history";
import type { BenchmarkEstimateHistoryEntry } from "@/lib/benchmark-estimate-history";
import {
  userCanViewAllScenarios,
  userHasAdminRole,
  userHasAgentRole,
  type UserRoleCheck,
} from "@/lib/user-roles";

export type ScenarioHistoryListKind = "device" | "all";

export type ScenarioHistoryState = {
  device: ScenarioHistoryEntry[];
  server: ScenarioHistoryEntry[];
  all: ScenarioHistoryEntry[];
  loadingServer: boolean;
  serverError: string | null;
};

function normalizeHistoryZip3(zip3: string | null | undefined): string {
  return (zip3 ?? "").trim() || "—";
}

function mapServerScenarioRows(
  rows: Array<{ scenario_code: string; zip3: string | null; created_at: string }>,
): ScenarioHistoryEntry[] {
  return rows.map((row) => ({
    code: row.scenario_code,
    zip3: normalizeHistoryZip3(row.zip3),
    createdAt: new Date(row.created_at).getTime(),
  }));
}

function scenarioToBenchmarkEntry(entry: ScenarioHistoryEntry): BenchmarkEstimateHistoryEntry {
  return {
    id: entry.code,
    zip3: entry.zip3,
    createdAt: entry.createdAt,
  };
}

function benchmarkToScenarioEntry(entry: BenchmarkEstimateHistoryEntry): ScenarioHistoryEntry {
  return {
    code: entry.id,
    zip3: entry.zip3,
    createdAt: entry.createdAt,
  };
}

/** Merge device + server SCN- lists; device entries win on duplicate codes. */
export function mergeScenarioHistorySources(
  device: ScenarioHistoryEntry[],
  server: ScenarioHistoryEntry[],
): ScenarioHistoryEntry[] {
  const merged = mergeBenchmarkHistorySources(
    device.map(scenarioToBenchmarkEntry),
    server.map(scenarioToBenchmarkEntry),
  );
  return merged.map(benchmarkToScenarioEntry);
}

async function fetchServerScenarioHistory(
  user: UserRoleCheck & { id: string },
): Promise<ScenarioHistoryEntry[]> {
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

/** Saved SCN- comparisons — local device list with optional merged server list for staff. */
export function useScenarioHistory(
  refreshKey?: string,
  user?: UserRoleCheck | null,
): ScenarioHistoryState {
  const [device, setDevice] = useState<ScenarioHistoryEntry[]>([]);
  const [server, setServer] = useState<ScenarioHistoryEntry[]>([]);
  const [loadingServer, setLoadingServer] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const refreshDevice = useCallback(() => {
    setDevice(listScenarioHistory());
  }, []);

  useEffect(() => {
    refreshDevice();
  }, [refreshKey, refreshDevice]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "scenario:index") {
        refreshDevice();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshDevice]);

  useEffect(() => {
    if (!canShowMergedBenchmarkHistory(user)) {
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

  const all = useMemo(() => mergeScenarioHistorySources(device, server), [device, server]);

  return { device, server, all, loadingServer, serverError };
}

export function useFilteredScenarioHistory(
  refreshKey: string | undefined,
  user: UserRoleCheck | null | undefined,
  listKind: ScenarioHistoryListKind,
  searchQuery: string,
): ScenarioHistoryEntry[] {
  const history = useScenarioHistory(refreshKey, user);
  const source = listKind === "all" ? history.all : history.device;
  return filterScenarioHistory(source, searchQuery);
}
