import { useEffect, useState } from "react";
import { recoverComplimentaryFromWizard } from "./pending-blueprint";
import {
  cachedComplimentaryGuideIds,
  complimentaryGuideIds,
  loadComplimentaryGuides,
} from "./wizard-comp-guide";

/** Load claimed extra ids for guide gates. Guests keep their one lifetime extra. */
export function useComplimentaryGuideIds(isLoggedIn: boolean, reloadToken = 0): string[] {
  const [ids, setIds] = useState<string[]>(() => cachedComplimentaryGuideIds());
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let map = await loadComplimentaryGuides(isLoggedIn);
      if (cancelled) return;
      let next = complimentaryGuideIds(map);
      if (!next.length) {
        await recoverComplimentaryFromWizard(isLoggedIn);
        if (cancelled) return;
        map = await loadComplimentaryGuides(isLoggedIn);
        next = complimentaryGuideIds(map);
      }
      setIds(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, reloadToken]);
  return ids;
}
