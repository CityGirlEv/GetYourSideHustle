import { useEffect, useState } from "react";
import {
  cmsLandscapeIsLoaded,
  ensureCmsLandscapeLoaded,
  getCmsLandscapeLoadError,
  isCmsLandscapeLoading,
  subscribeCmsLandscapeLoadState,
} from "@/lib/cms-landscape";

/** True once nationwide CMS landscape JSON is in memory (re-renders when load completes). */
export function useCmsLandscapeReady(): boolean {
  const [ready, setReady] = useState(() => cmsLandscapeIsLoaded());

  useEffect(() => {
    if (cmsLandscapeIsLoaded()) {
      setReady(true);
      return;
    }

    let cancelled = false;

    const syncReady = () => {
      if (!cancelled && cmsLandscapeIsLoaded()) setReady(true);
    };

    void ensureCmsLandscapeLoaded()
      .then(syncReady)
      .catch((err) => {
        console.error("[cms-landscape] load failed in useCmsLandscapeReady:", err);
      });

    const unsubscribe = subscribeCmsLandscapeLoadState(() => {
      syncReady();
      if (!cancelled && !cmsLandscapeIsLoaded() && !isCmsLandscapeLoading() && getCmsLandscapeLoadError()) {
        // Retry once after a failed attempt (e.g. dev server restart mid-fetch).
        void ensureCmsLandscapeLoaded().then(syncReady).catch(() => {});
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return ready;
}
