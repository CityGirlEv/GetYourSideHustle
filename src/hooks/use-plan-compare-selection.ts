import { useCallback, useEffect, useMemo, useState } from "react";
import type { PlanDetail } from "@/lib/plan-details";
import {
  autoComparePlanKeys,
  isSideBySideCompareEnabled,
  plansForSideBySideView,
  pruneComparePlanKeys,
  shouldShowPlanCompareCheckboxes,
  toggleComparePlanKey,
} from "@/lib/plan-compare-selection";

/** Shared compare selection for plan list and Potential Top 3 views. */
export function usePlanCompareSelection(availablePlans: PlanDetail[], resetKey: string) {
  const [manualKeys, setManualKeys] = useState<string[]>([]);

  useEffect(() => {
    setManualKeys([]);
  }, [resetKey]);

  const showCompareCheckboxes = shouldShowPlanCompareCheckboxes(availablePlans.length);

  const comparePlanKeys = useMemo(() => {
    if (availablePlans.length === 0) return [];
    if (!showCompareCheckboxes) {
      return autoComparePlanKeys(availablePlans);
    }
    return pruneComparePlanKeys(availablePlans, manualKeys);
  }, [availablePlans, manualKeys, showCompareCheckboxes]);

  const sideBySideEnabled = isSideBySideCompareEnabled(
    availablePlans.length,
    comparePlanKeys.length,
  );

  const sideBySidePlans = useMemo(
    () => plansForSideBySideView(availablePlans, comparePlanKeys),
    [availablePlans, comparePlanKeys],
  );

  const toggleComparePlan = useCallback(
    (plan: PlanDetail) => {
      if (!showCompareCheckboxes) return;
      setManualKeys((current) => toggleComparePlanKey(current, plan));
    },
    [showCompareCheckboxes],
  );

  const clearCompareSelection = useCallback(() => {
    setManualKeys([]);
  }, []);

  return {
    comparePlanKeys,
    showCompareCheckboxes,
    sideBySideEnabled,
    sideBySidePlans,
    toggleComparePlan,
    clearCompareSelection,
  };
}
