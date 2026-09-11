import { useEffect, useState } from "react";
import { NARROW_VIEWPORT_QUERY, readNarrowViewport } from "./narrow-viewport";

export function useNarrowViewport(): boolean {
  const [narrow, setNarrow] = useState(readNarrowViewport);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(NARROW_VIEWPORT_QUERY);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return narrow;
}
