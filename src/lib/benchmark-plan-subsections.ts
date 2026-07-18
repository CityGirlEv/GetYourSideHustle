import { BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE } from "@/lib/plan-comparison-copy";
import {
  BENCHMARK_PLANS_SUBSECTION,
  benchmarkPlanDetailAnchorId,
  type BenchmarkReportNavChild,
} from "@/lib/benchmark-report-ui";
import { potentialTop3PlanDetails } from "@/lib/plan-details";
import {
  buildWhyTopPlanOverRunnersUp,
  explainWinnerOverChallenger,
} from "@/lib/plan-comparison-rationale";
import { planRankCollapsibleTitle } from "@/lib/plan-filters";
import type { ScenarioPdfInput } from "@/lib/scenario-pdf";

/** TOC children under Possible Plans — mirrors embedded plan comparison collapsibles. */
export function buildBenchmarkPlanNavChildren(
  scenario: ScenarioPdfInput & { county?: string },
): BenchmarkReportNavChild[] {
  const plans = potentialTop3PlanDetails({
    year: scenario.year,
    zip3: scenario.zip3,
    county: scenario.county,
    medications: scenario.medications,
  });

  if (plans.length === 0) return [];

  const top = plans[0]!;
  const runnersUp = plans.slice(1, 3);
  const runnerUpTwo = runnersUp[0];
  const children: BenchmarkReportNavChild[] = [];

  children.push({ id: BENCHMARK_PLANS_SUBSECTION.whyNumberOne, label: "#1 plan highlights" });

  if (buildWhyTopPlanOverRunnersUp(top, runnersUp, scenario).length > 0) {
    children.push({
      id: BENCHMARK_PLANS_SUBSECTION.whyOverRunners,
      label: "Why #1 over #2 and #3",
    });
  }

  if (
    runnerUpTwo &&
    explainWinnerOverChallenger(top, runnerUpTwo, scenario.costPreference).length > 0
  ) {
    children.push({ id: BENCHMARK_PLANS_SUBSECTION.oneVsTwo, label: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE });
  }

  children.push({ id: BENCHMARK_PLANS_SUBSECTION.howCompared, label: "How we compared plans" });

  children.push({
    id: BENCHMARK_PLANS_SUBSECTION.recommended,
    label: planRankCollapsibleTitle(top, {
      topPickTitle: "Top pick (#1)",
      runnersUpScope: "",
    }),
  });

  for (const runner of runnersUp) {
    children.push({
      id: benchmarkPlanDetailAnchorId(runner.rank),
      label: planRankCollapsibleTitle(runner, {
        topPickTitle: "Top pick (#1)",
        runnersUpScope: "",
      }),
    });
  }

  children.push(
    { id: BENCHMARK_PLANS_SUBSECTION.top10Rankings, label: "Top 10 rankings" },
    { id: BENCHMARK_PLANS_SUBSECTION.fullDetails, label: "Full plan details (#2–10)" },
  );

  return children;
}
