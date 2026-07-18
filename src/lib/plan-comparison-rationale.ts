import type { PlanDetail } from "@/lib/plan-details";
import { HIGHLY_RATED_MIN_STARS, HIGHLY_RATED_MIN_STARS_LABEL } from "@/lib/plan-filters";
import type { ScenarioPdfInput } from "@/lib/scenario-pdf";

export const planUsd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Line 2 under the Potential Top 3 “why” collapsible — #1 plan cost snapshot. */
export function formatTopPlanEstimatedSubtitle(plan: Pick<PlanDetail, "monthly" | "annual">): string {
  return `Estimated ${planUsd(plan.monthly)}/month · ~${planUsd(plan.annual)}/year including drugs`;
}

function starValue(stars: string): number | null {
  const n = parseFloat(stars);
  return Number.isFinite(n) ? n : null;
}

/** Context bullets — how the member's scenario shaped the comparison. */
export function buildScenarioFitReasons(scenario: ScenarioPdfInput): string[] {
  const why: string[] = [];
  if (scenario.costPreference === "minimize_monthly") {
    why.push(
      "You asked to minimize monthly premium — plans are ranked by lowest projected annual total (premiums + capped drug costs + expected out-of-pocket).",
    );
  } else {
    why.push(
      "You asked for cost predictability — plans are ranked with extra weight on stable copays and known out-of-pocket maximums.",
    );
  }
  if (scenario.medications.length > 0) {
    why.push(
      `Drug costs modeled for your ${scenario.medications.length} medication${scenario.medications.length === 1 ? "" : "s"} using CMS Part D tier guidance and the ${scenario.year} out-of-pocket cap.`,
    );
  }
  if (scenario.conditions.length > 0) {
    why.push(
      `Network and benefit fit considered for: ${scenario.conditions.slice(0, 3).join(", ")}${scenario.conditions.length > 3 ? ", …" : ""}.`,
    );
  }
  return why;
}

/** Why a plan qualifies as "highly rated" — CMS star rating threshold and quality context. */
export function buildHighlyRatedPlanReasons(plan: PlanDetail): string[] {
  const stars = starValue(plan.stars);
  const reasons: string[] = [
    `CMS Star Rating ${plan.stars} — meets the ${HIGHLY_RATED_MIN_STARS}.0+ threshold CMS uses to identify high-performing Medicare Advantage and Part D plans.`,
    "Star ratings reflect member experience, preventive care, chronic-condition management, and customer service — published annually by CMS.",
  ];
  if (/medicare advantage/i.test(plan.planType)) {
    reasons.push(
      `As a Medicare Advantage plan, this rating covers medical care, drug coverage, and plan administration for ${plan.carrier}.`,
    );
  } else if (/medicare part d/i.test(plan.planType)) {
    reasons.push(
      `As a standalone Part D plan, this rating focuses on formulary access, pharmacy service, and drug pricing for ${plan.carrier}.`,
    );
  } else if (/medigap|supplement/i.test(plan.planType)) {
    reasons.push(
      `CMS does not assign star ratings to Medigap supplements — ${plan.stars} reflects modeled carrier quality and financial strength for ${plan.carrier}.`,
    );
  }
  if (stars !== null && stars >= 4.5) {
    reasons.push(
      `${plan.stars} places this plan in CMS's top tier — above the ${HIGHLY_RATED_MIN_STARS}.0 minimum for "highly rated" plans.`,
    );
  }
  return reasons;
}

/** How the highly-rated filter narrows and ranks the comparison pool. */
export function buildHighlyRatedComparisonReasons(scenario: ScenarioPdfInput): string[] {
  const why: string[] = [
    `Part D plans with ${HIGHLY_RATED_MIN_STARS}.0+ CMS star ratings and Medigap supplements with ${HIGHLY_RATED_MIN_STARS}.0+ modeled quality scores are included — use the Part D and Medigap tabs to browse each category.`,
    "Among qualifying plans in your area, rankings use lowest projected annual total (premiums + capped drug costs + expected out-of-pocket).",
  ];
  if (scenario.costPreference === "minimize_monthly") {
    why.push(
      "You asked to minimize monthly premium — cost ranking still applies within the highly-rated pool.",
    );
  } else {
    why.push(
      "You asked for cost predictability — copay stability and out-of-pocket caps weighed alongside star quality within the highly-rated pool.",
    );
  }
  if (scenario.medications.length > 0) {
    why.push(
      `Drug costs modeled for your ${scenario.medications.length} medication${scenario.medications.length === 1 ? "" : "s"} using CMS Part D tier guidance.`,
    );
  }
  return why;
}

/** Plan-type highlights for why #1 is a strong match — mirrors scenario PDF rationale. */
export function buildTopPlanHighlights(
  plan: PlanDetail,
  medicationCount: number,
): string[] {
  const reasons: string[] = [];
  if (plan.planType.toLowerCase().includes("medigap") || /plan [a-n]/i.test(plan.plan)) {
    reasons.push(
      "Predictable monthly cost — Medigap covers most Part B coinsurance after the small annual deductible, so doctor and hospital bills are less likely to surprise you.",
    );
    reasons.push("Use any provider nationwide that accepts Medicare — no networks, no referrals.");
  } else if (
    plan.planType.toLowerCase().includes("advantage") ||
    plan.planType.toLowerCase().includes("ma")
  ) {
    reasons.push(
      "Low or $0 plan premium with bundled medical + Part D drug coverage in a single plan.",
    );
    reasons.push(
      `Caps your annual medical out-of-pocket at ${plan.moop}, protecting you from worst-case bills.`,
    );
  } else {
    reasons.push(
      "Best balance of monthly premium, drug coverage, and out-of-pocket risk for the medications and conditions you reported.",
    );
  }
  if (medicationCount > 0) {
    reasons.push(
      `Formulary fit checked against your ${medicationCount} medication${medicationCount === 1 ? "" : "s"} — Tier 1 generics at ${plan.rxTier1}, insulin capped at ${planUsd(plan.insulinCap)}/mo.`,
    );
  }
  reasons.push(`Carrier financial strength: A.M. Best ${plan.amBest}.`);
  reasons.push(`CMS Star Rating ${plan.stars}.`);
  return reasons;
}

/** Why the #1 plan ranks above a specific runner-up — uses real ranked plan fields. */
export function explainWinnerOverChallenger(
  winner: PlanDetail,
  challenger: PlanDetail,
  costPreference: ScenarioPdfInput["costPreference"],
): string[] {
  const reasons: string[] = [];
  const rank = challenger.rank;
  const annualDelta = challenger.annual - winner.annual;

  if (annualDelta > 0) {
    reasons.push(
      `Estimated annual total is ${planUsd(annualDelta)} lower than #${rank} (${planUsd(winner.annual)} vs ${planUsd(challenger.annual)} for ${challenger.carrier} — ${challenger.plan}).`,
    );
  } else if (annualDelta === 0) {
    reasons.push(
      `Same projected annual total as #${rank} (${planUsd(winner.annual)} for ${challenger.carrier}), but stronger fit on copays, network, or carrier quality.`,
    );
  } else {
    reasons.push(
      `Lower projected annual total than #${rank} (${planUsd(winner.annual)} vs ${planUsd(challenger.annual)}).`,
    );
  }

  const monthlyDelta = challenger.monthly - winner.monthly;
  if (monthlyDelta >= 20) {
    reasons.push(
      `All-in monthly premium is ${planUsd(monthlyDelta)} lower than #${rank} (${planUsd(winner.monthly)}/mo vs ${planUsd(challenger.monthly)}/mo).`,
    );
  } else if (monthlyDelta <= -20 && costPreference === "minimize_monthly") {
    reasons.push(
      `Despite a higher monthly premium, #1 still wins on total annual cost once drug and expected medical spending are included.`,
    );
  }

  const winnerIsMedigap = /medigap|supplement/i.test(winner.planType);
  const challengerIsMedigap = /medigap|supplement/i.test(challenger.planType);
  if (winnerIsMedigap && !challengerIsMedigap) {
    reasons.push(
      `#${rank} is ${challenger.planType} with ${challenger.network.toLowerCase()}; #1 keeps any Medicare provider nationwide with ${winner.moop} exposure.`,
    );
  } else if (!winnerIsMedigap && challengerIsMedigap) {
    reasons.push(
      `#${rank} is supplement + standalone Part D (${planUsd(challenger.monthly)}/mo all-in); #1 bundles medical and drug coverage with ${winner.moop} in-network cap and included extras (${winner.extras}).`,
    );
  }

  if (costPreference === "predictability") {
    if (winner.pcpCopay !== challenger.pcpCopay || winner.specCopay !== challenger.specCopay) {
      reasons.push(
        `Routine visit costs: PCP ${winner.pcpCopay} / specialist ${winner.specCopay} vs #${rank} at ${challenger.pcpCopay} / ${challenger.specCopay}.`,
      );
    }
    if (winner.moop !== challenger.moop) {
      reasons.push(`Medical out-of-pocket exposure: ${winner.moop} vs ${challenger.moop} for #${rank}.`);
    }
  }

  const wStars = starValue(winner.stars);
  const cStars = starValue(challenger.stars);
  if (wStars !== null && cStars !== null && wStars > cStars) {
    const amBestNote =
      winner.amBest && challenger.amBest
        ? `; A.M. Best ${winner.amBest} vs ${challenger.amBest}`
        : "";
    reasons.push(`CMS Star Rating ${winner.stars} vs ${challenger.stars} for #${rank}${amBestNote}.`);
  }

  if (winner.rxTier1 !== challenger.rxTier1 || winner.insulinCap !== challenger.insulinCap) {
    reasons.push(
      `Prescription cost structure: Tier 1 at ${winner.rxTier1}, insulin cap ${planUsd(winner.insulinCap)}/mo vs #${rank} Tier 1 ${challenger.rxTier1}, insulin ${planUsd(challenger.insulinCap)}/mo.`,
    );
  }

  return reasons.slice(0, 3);
}

/** Headline reasons why #1 beat #2 and #3. */
export function buildWhyTopPlanOverRunnersUp(
  top: PlanDetail,
  runnersUp: PlanDetail[],
  scenario: ScenarioPdfInput,
): string[] {
  const bullets: string[] = [];
  for (const challenger of runnersUp) {
    const vs = explainWinnerOverChallenger(top, challenger, scenario.costPreference);
    if (vs.length > 0) {
      bullets.push(`vs #${challenger.rank} (${challenger.carrier}): ${vs[0]}`);
    }
  }
  if (bullets.length === 0) {
    bullets.push(
      `Lowest projected annual total among compared plans for ZIP ${scenario.zip3}xx (${planUsd(top.annual)}/yr).`,
    );
  }
  return bullets;
}
