import { useCallback, useEffect, useState } from "react";
import {
  createAdminEntityLinkApi,
  fetchAdminEntityLinks,
  unlinkAdminEntityLinkApi,
  type AdminEntityLinkRow,
  type AdminEntityRef,
} from "../lib/admin-entity-links";
import { ApiError } from "../lib/api";

export function useAdminEntityLinks() {
  const [edges, setEdges] = useState<AdminEntityLinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setError("");
    try {
      const rows = await fetchAdminEntityLinks();
      setEdges(rows);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load links.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const link = useCallback(
    async (a: AdminEntityRef, b: AdminEntityRef) => {
      setError("");
      try {
        await createAdminEntityLinkApi(a, b);
        await reload();
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to create link.");
        throw e;
      }
    },
    [reload],
  );

  const unlink = useCallback(
    async (a: AdminEntityRef, b: AdminEntityRef) => {
      setError("");
      try {
        await unlinkAdminEntityLinkApi(a, b);
        await reload();
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to unlink.");
        throw e;
      }
    },
    [reload],
  );

  return { edges, loading, error, reload, link, unlink, setError };
}
