/**
 * Resolve library / launch-guide data by id.
 * Kept out of StepByStepGuides.tsx so that page can Fast Refresh (HMR) without
 * remounting the lazy route and getting stuck on “Loading…”.
 */
import { catalogToLaunchGuideData, hustleById } from "./side-hustle-catalog";
import {
  detailedStepsForGuide,
  finalizeGuidePlaybookSteps,
} from "./guide-detailed-steps";
import { ensureMarketingPlanSteps } from "./guide-marketing-plan";
import { kidsGuideById, kidsGuideToLaunchGuideData } from "./kids-guides";

export type LaunchGuideStep = {
  title: string;
  desc: string;
};

export type LaunchGuideData = {
  id: string;
  name: string;
  timeframe: string;
  estEarnings: string;
  bestFor: string;
  steps: LaunchGuideStep[];
  proTip: string;
  pitfall: string;
};

/** Resolve a guide by id — hustle-specific detailed steps always win over generics. */
export function resolveLaunchGuideData(
  guideId: string,
  authored: LaunchGuideData[],
): LaunchGuideData {
  const id = String(guideId || "").trim();
  const fromAuthored = authored.find((g) => g.id === id);
  const hustle = hustleById(id);
  const fromCatalog = hustle ? catalogToLaunchGuideData(hustle) : null;
  const kids = !fromAuthored && !fromCatalog ? kidsGuideById(id) : undefined;
  const fromKids = kids ? kidsGuideToLaunchGuideData(kids) : null;
  const base =
    fromAuthored ??
    fromCatalog ??
    fromKids ??
    ({
      id,
      name: id || "Guide",
      timeframe: "—",
      estEarnings: "—",
      bestFor: "Guide content is not available for this id yet.",
      steps: [],
      proTip: "",
      pitfall: "",
    } satisfies LaunchGuideData);
  const audiences =
    hustle?.audiences ??
    (kids
      ? kids.audience === "junior"
        ? (["junior"] as const)
        : (["kids"] as const)
      : undefined);
  const forced = detailedStepsForGuide(id, { audiences });
  const name = fromAuthored?.name ?? hustle?.name ?? fromKids?.name ?? base.name;
  if (forced?.length) {
    return {
      ...base,
      id,
      name,
      steps: finalizeGuidePlaybookSteps(
        id,
        ensureMarketingPlanSteps(forced, id),
        { audiences },
      ),
    };
  }
  const rawSteps = fromKids?.steps?.length
    ? fromKids.steps
    : fromAuthored?.steps?.length
      ? fromAuthored.steps
      : base.steps;
  return {
    ...base,
    id,
    name,
    bestFor: fromKids?.bestFor ?? base.bestFor,
    proTip: fromKids?.proTip ?? base.proTip,
    pitfall: fromKids?.pitfall ?? base.pitfall,
    steps: finalizeGuidePlaybookSteps(
      id,
      ensureMarketingPlanSteps(rawSteps, id),
      { audiences },
    ),
  };
}
