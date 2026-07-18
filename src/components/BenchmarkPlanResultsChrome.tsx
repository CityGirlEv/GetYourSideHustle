import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type BenchmarkPlanResultsChromeState = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sideBySideEnabled: boolean;
  visible: boolean;
};

type BenchmarkPlanResultsChromeContextValue = {
  chrome: BenchmarkPlanResultsChromeState | null;
  setChrome: (chrome: BenchmarkPlanResultsChromeState | null) => void;
};

const BenchmarkPlanResultsChromeContext =
  createContext<BenchmarkPlanResultsChromeContextValue | null>(null);

export function BenchmarkPlanResultsChromeProvider({ children }: { children: ReactNode }) {
  const [chrome, setChrome] = useState<BenchmarkPlanResultsChromeState | null>(null);
  const value = useMemo(() => ({ chrome, setChrome }), [chrome]);
  return (
    <BenchmarkPlanResultsChromeContext.Provider value={value}>
      {children}
    </BenchmarkPlanResultsChromeContext.Provider>
  );
}

export function useBenchmarkPlanResultsChrome() {
  return useContext(BenchmarkPlanResultsChromeContext);
}

/** Register Rankings / Side by Side tab controls for the sticky report header. */
export function useRegisterBenchmarkPlanResultsChrome(
  chrome: BenchmarkPlanResultsChromeState | null,
) {
  const ctx = useBenchmarkPlanResultsChrome();
  useEffect(() => {
    if (!ctx) return;
    ctx.setChrome(chrome);
    return () => ctx.setChrome(null);
  }, [
    ctx,
    chrome?.activeTab,
    chrome?.sideBySideEnabled,
    chrome?.visible,
    chrome?.onTabChange,
  ]);
}
