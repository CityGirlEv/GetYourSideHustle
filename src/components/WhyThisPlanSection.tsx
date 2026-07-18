import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PlanChoiceCard } from "@/components/PlanComparisonPlanCard";
import { PlanComparisonTable } from "@/components/PlanComparisonTable";
import { PlanSideBySideComparison } from "@/components/PlanSideBySideComparison";
import {
  BenchmarkReportCollapsible,
  BenchmarkReportSubsection,
} from "@/components/BenchmarkReportCollapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PlanDetail } from "@/lib/plan-details";
import {
  buildHighlyRatedComparisonReasons,
  buildHighlyRatedPlanReasons,
  buildScenarioFitReasons,
  buildTopPlanHighlights,
  buildWhyTopPlanOverRunnersUp,
  explainWinnerOverChallenger,
  formatTopPlanEstimatedSubtitle,
} from "@/lib/plan-comparison-rationale";
import type { ScenarioPdfInput } from "@/lib/scenario-pdf";
import { BENCHMARK_PLANS_SUBSECTION, benchmarkPlanDetailAnchorId, planCardAnchorId, BENCHMARK_REPORT_TAB_TRIGGER_CLASS, BENCHMARK_EMBEDDED_PLAN_TABLE_FRAME_CLASS } from "@/lib/benchmark-report-ui";
import {
  planChoiceRankSuffix,
  planDetailKey,
  planFilterRunnersUpTitle,
  planFilterWhySectionMetaForPanel,
  planRankTabLabel,
  type PlanFilterId,
  type PlanFilterScope,
  type PlanPanelId,
} from "@/lib/plan-filters";
import { PLAN_SIDE_BY_SIDE_LABEL } from "@/lib/plan-comparison-copy";
import { PLAN_RESULTS_LIST_TAB, isSideBySideCompareEnabled } from "@/lib/plan-compare-selection";
import { PLAN_SIDE_BY_SIDE_TAB } from "@/lib/plan-side-by-side";
import { cn } from "@/lib/utils";

type WhyThisPlanSectionProps = {
  scenario: ScenarioPdfInput & { county?: string };
  top: PlanDetail;
  runnersUp: PlanDetail[];
  planFilter?: PlanFilterId;
  planPanel?: PlanPanelId;
  showHeading?: boolean;
  compact?: boolean;
  embedded?: boolean;
  openSubsections?: string[];
  onSubsectionOpenChange?: (id: string, open: boolean) => void;
  activeSubsectionId?: string;
  /** Bump when the Potential Options tab opens to collapse #1 vs #2. */
  resetOneVsTwoKey?: number;
  /** Member vs national catalog — drives Top 3 list table labels. */
  filterScope?: PlanFilterScope;
  /** Regional pool for list-table “available in your area” hints. */
  myAvailablePlans?: PlanDetail[];
  /** Potential Top 3 — open the plan in the rankings table. */
  onOpenPlanInList?: (plan: PlanDetail) => void;
};

export function WhyThisPlanSection({
  scenario,
  top,
  runnersUp,
  planFilter = "my-available",
  planPanel,
  showHeading = true,
  compact = false,
  embedded = false,
  openSubsections,
  onSubsectionOpenChange,
  activeSubsectionId,
  resetOneVsTwoKey,
  filterScope = "member",
  myAvailablePlans = [],
  onOpenPlanInList,
}: WhyThisPlanSectionProps) {
  const sectionMeta = planFilterWhySectionMetaForPanel(planPanel, planFilter);
  const showComparisonRationale =
    planPanel === "why-this-plan" || planFilter === "why-this-plan";
  const runnersUpTitle = planFilterRunnersUpTitle(sectionMeta.runnersUpScope, runnersUp.length);
  const isHighlyRatedFilter = planFilter === "highly-rated";
  const scenarioReasons = isHighlyRatedFilter
    ? buildHighlyRatedComparisonReasons(scenario)
    : buildScenarioFitReasons(scenario);
  const planHighlights = isHighlyRatedFilter
    ? [
        ...buildHighlyRatedPlanReasons(top),
        ...buildTopPlanHighlights(top, scenario.medications.length),
      ]
    : buildTopPlanHighlights(top, scenario.medications.length);
  const rankingReasons = buildWhyTopPlanOverRunnersUp(top, runnersUp, scenario);
  const runnerUpTwo = runnersUp[0];
  const oneVsTwoReasons = runnerUpTwo
    ? explainWinnerOverChallenger(top, runnerUpTwo, scenario.costPreference)
    : [];

  const isPotentialTop3Panel = planPanel === "why-this-plan";
  const top3Plans = useMemo(() => [top, ...runnersUp].slice(0, 3), [top, runnersUp]);
  const [activeTop3Rank, setActiveTop3Rank] = useState(PLAN_RESULTS_LIST_TAB);
  const [selectedTop3PlanKey, setSelectedTop3PlanKey] = useState<string | null>(null);
  const top3SideBySideEnabled = isSideBySideCompareEnabled(top3Plans.length, top3Plans.length);
  const top3ListFilterResetKey = `why-this-plan|${filterScope}|${top3Plans.map(planDetailKey).join(",")}`;

  useEffect(() => {
    if (!isPotentialTop3Panel) return;
    setActiveTop3Rank(PLAN_RESULTS_LIST_TAB);
    setSelectedTop3PlanKey(null);
  }, [isPotentialTop3Panel, resetOneVsTwoKey, top.carrier, top.plan, top.rank]);

  useEffect(() => {
    if (!top3SideBySideEnabled && activeTop3Rank === PLAN_SIDE_BY_SIDE_TAB) {
      setActiveTop3Rank("1");
    }
  }, [top3SideBySideEnabled, activeTop3Rank]);

  const isOpen = (id: string) => openSubsections?.includes(id) ?? false;
  const onOpenChange = (id: string) => (open: boolean) => onSubsectionOpenChange?.(id, open);

  const Section = embedded ? BenchmarkReportSubsection : BenchmarkReportCollapsible;
  const OneVsTwoSection = Section;

  const isPlanRankSubsection = (id: string) =>
    id === BENCHMARK_PLANS_SUBSECTION.recommended ||
    id === benchmarkPlanDetailAnchorId(2) ||
    id === benchmarkPlanDetailAnchorId(3);

  const usesCollapsibleWhenEmbedded = (id: string) =>
    isPotentialTop3Panel &&
    !isPlanRankSubsection(id) &&
    id === BENCHMARK_PLANS_SUBSECTION.oneVsTwo;

  const rationaleDefaultOpen = new Set<string>([
    ...(!isPotentialTop3Panel ? [BENCHMARK_PLANS_SUBSECTION.oneVsTwo] : []),
    BENCHMARK_PLANS_SUBSECTION.whyNumberOne,
    BENCHMARK_PLANS_SUBSECTION.howCompared,
    BENCHMARK_PLANS_SUBSECTION.whyOverRunners,
  ]);

  const subsectionPanelProps = (id: string) =>
    embedded && !usesCollapsibleWhenEmbedded(id)
      ? { active: activeSubsectionId === id, compact: true }
      : openSubsections !== undefined
        ? {
            open: isOpen(id),
            onOpenChange: onOpenChange(id),
            ...(compact || (isPotentialTop3Panel && id === BENCHMARK_PLANS_SUBSECTION.oneVsTwo)
              ? { compact: true }
              : {}),
          }
        : {
            defaultOpen: rationaleDefaultOpen.has(id),
            ...(compact || (isPotentialTop3Panel && id === BENCHMARK_PLANS_SUBSECTION.oneVsTwo)
              ? { compact: true }
              : {}),
          };

  const planRankAnchorId = (rank: number) =>
    rank === 1 ? BENCHMARK_PLANS_SUBSECTION.recommended : benchmarkPlanDetailAnchorId(rank);

  useEffect(() => {
    if (!isPotentialTop3Panel || !activeSubsectionId) return;
    if (activeSubsectionId === BENCHMARK_PLANS_SUBSECTION.recommended) {
      setActiveTop3Rank("1");
      return;
    }
    const rankMatch = activeSubsectionId.match(/^plan-detail-(\d+)$/);
    if (rankMatch) {
      setActiveTop3Rank(rankMatch[1]!);
    }
  }, [isPotentialTop3Panel, activeSubsectionId]);

  const listClass = cn(
    "space-y-1",
    compact ? "text-xs leading-snug" : "text-sm space-y-1.5",
  );

  const oneVsTwoListClass = cn(
    isPotentialTop3Panel ? "space-y-0.5 text-xs leading-snug" : listClass,
  );

  const iconClass = compact ? "h-3 w-3" : "h-4 w-4";
  const oneVsTwoIconClass = isPotentialTop3Panel ? "h-3 w-3" : iconClass;
  const oneVsTwoItemGap = isPotentialTop3Panel ? "gap-1" : "gap-1.5";

  const planInListHandler = (plan: PlanDetail) =>
    isPotentialTop3Panel && embedded && onOpenPlanInList
      ? () => onOpenPlanInList(plan)
      : undefined;

  const whyNumberOneList = (
    <ul className={listClass}>
      {planHighlights.map((reason, i) => (
        <li key={`highlight-${i}`} className="flex items-start gap-1.5">
          <CheckCircle2 className={cn(iconClass, "text-amber-700 shrink-0 mt-0.5")} />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );

  const howComparedList = (
    <ul className={listClass}>
      {scenarioReasons.map((reason, i) => (
        <li key={`fit-${i}`} className="flex items-start gap-1.5">
          <CheckCircle2 className={cn(iconClass, "text-primary shrink-0 mt-0.5")} />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );

  const whyOverRunnersList =
    rankingReasons.length > 0 ? (
      <ul className={listClass}>
        {rankingReasons.map((reason, i) => (
          <li key={`rank-${i}`} className="flex items-start gap-1.5">
            <CheckCircle2 className={cn(iconClass, "text-emerald shrink-0 mt-0.5")} />
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    ) : null;

  const nestedRationaleBlockClass = cn(
    "scroll-mt-24 space-y-1 pt-2 border-t border-border/50",
  );

  const nestedRationaleHeadingClass = cn(
    "font-semibold leading-snug",
    compact ? "text-xs" : "text-sm",
  );

  const renderTop3PlanPanel = (plan: PlanDetail) => {
    const isTopPlan = plan.rank === 1;
    const showTopPlanRationale = isTopPlan && showComparisonRationale;

    return (
      <>
        <p className="text-xs text-muted-foreground leading-snug">
          {formatTopPlanEstimatedSubtitle(plan)}
        </p>

        {showTopPlanRationale ? (
          <>
            <div
              id={BENCHMARK_PLANS_SUBSECTION.whyNumberOne}
              className="scroll-mt-24 space-y-1"
            >
              <div className={nestedRationaleHeadingClass}>{sectionMeta.whyNumberOneTitle}</div>
              {whyNumberOneList}
            </div>

            {whyOverRunnersList ? (
              <div
                id={BENCHMARK_PLANS_SUBSECTION.whyOverRunners}
                className={nestedRationaleBlockClass}
              >
                <div className={nestedRationaleHeadingClass}>
                  {sectionMeta.whyOverRunnersTitle}
                </div>
                {whyOverRunnersList}
              </div>
            ) : null}

            {oneVsTwoReasons.length > 0 ? (
              <div
                id={BENCHMARK_PLANS_SUBSECTION.oneVsTwo}
                className={nestedRationaleBlockClass}
              >
                <div className={nestedRationaleHeadingClass}>{sectionMeta.oneVsTwoTitle}</div>
                <ul className={oneVsTwoListClass}>
                  {oneVsTwoReasons.map((reason, i) => (
                    <li key={`vs2-${i}`} className={cn("flex items-start", oneVsTwoItemGap)}>
                      <CheckCircle2
                        className={cn(oneVsTwoIconClass, "text-emerald shrink-0 mt-0.5")}
                      />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div id={BENCHMARK_PLANS_SUBSECTION.howCompared} className={nestedRationaleBlockClass}>
              <div className={nestedRationaleHeadingClass}>How we compared</div>
              {howComparedList}
            </div>
          </>
        ) : null}

        <div className={cn(showTopPlanRationale && "pt-2 border-t border-border/50")}>
          <PlanChoiceCard
            plan={plan}
            year={scenario.year}
            zip3={scenario.zip3}
            highlight={isTopPlan}
            rankLabel={isTopPlan ? sectionMeta.topRankLabel : planChoiceRankSuffix()}
            id={planCardAnchorId(plan)}
            medications={scenario.medications}
            compactDrugList={compact}
            onCarrierClick={planInListHandler(plan)}
          />
        </div>
      </>
    );
  };

  return (
    <div
      className={cn(
        isPotentialTop3Panel ? "space-y-2" : compact ? "space-y-1.5" : "space-y-4",
      )}
    >
      {showHeading && sectionMeta.sectionBrief ? (
        <p
          className={cn(
            "text-muted-foreground leading-snug",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {sectionMeta.sectionBrief}
        </p>
      ) : null}

      {showComparisonRationale && !isPotentialTop3Panel ? (
        <Section
          id={BENCHMARK_PLANS_SUBSECTION.whyNumberOne}
          title={sectionMeta.whyNumberOneTitle}
          subtitle={formatTopPlanEstimatedSubtitle(top)}
          {...subsectionPanelProps(BENCHMARK_PLANS_SUBSECTION.whyNumberOne)}
        >
          {whyNumberOneList}
        </Section>
      ) : null}

      {showComparisonRationale && !isPotentialTop3Panel && rankingReasons.length > 0 ? (
        <Section
          id={BENCHMARK_PLANS_SUBSECTION.whyOverRunners}
          title={sectionMeta.whyOverRunnersTitle}
          {...subsectionPanelProps(BENCHMARK_PLANS_SUBSECTION.whyOverRunners)}
        >
          {whyOverRunnersList}
        </Section>
      ) : null}

      {showComparisonRationale && !isPotentialTop3Panel && oneVsTwoReasons.length > 0 ? (
        <OneVsTwoSection
          id={BENCHMARK_PLANS_SUBSECTION.oneVsTwo}
          title={sectionMeta.oneVsTwoTitle}
          prominentExpandIcon
          expandIconPosition="left"
          {...subsectionPanelProps(BENCHMARK_PLANS_SUBSECTION.oneVsTwo)}
        >
          <ul className={oneVsTwoListClass}>
            {oneVsTwoReasons.map((reason, i) => (
              <li key={`vs2-${i}`} className={cn("flex items-start", oneVsTwoItemGap)}>
                <CheckCircle2
                  className={cn(oneVsTwoIconClass, "text-emerald shrink-0 mt-0.5")}
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </OneVsTwoSection>
      ) : null}

      {showComparisonRationale && !isPotentialTop3Panel ? (
        <Section
          id={BENCHMARK_PLANS_SUBSECTION.howCompared}
          title="How we compared"
          {...subsectionPanelProps(BENCHMARK_PLANS_SUBSECTION.howCompared)}
        >
          {howComparedList}
        </Section>
      ) : null}

      {isPotentialTop3Panel ? (
        <Tabs value={activeTop3Rank} onValueChange={setActiveTop3Rank}>
          <TabsList
            role="tablist"
            aria-label="Potential top 3 plans"
            className={cn(
              "flex h-auto min-w-0 flex-nowrap items-end justify-start gap-0 overflow-x-auto rounded-none bg-transparent p-0",
              "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            <TabsTrigger
              value={PLAN_RESULTS_LIST_TAB}
              className={BENCHMARK_REPORT_TAB_TRIGGER_CLASS}
            >
              Rankings
            </TabsTrigger>
            {top3SideBySideEnabled ? (
              <TabsTrigger
                value={PLAN_SIDE_BY_SIDE_TAB}
                className={BENCHMARK_REPORT_TAB_TRIGGER_CLASS}
              >
                {PLAN_SIDE_BY_SIDE_LABEL}
              </TabsTrigger>
            ) : null}
            {top3Plans.map((plan) => (
              <TabsTrigger
                key={`${plan.carrier}-${plan.plan}`}
                value={String(plan.rank)}
                className={BENCHMARK_REPORT_TAB_TRIGGER_CLASS}
              >
                <span className="truncate max-w-[14rem]">{planRankTabLabel(plan)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent
            value={PLAN_RESULTS_LIST_TAB}
            className="mt-2 space-y-2 scroll-mt-24"
          >
            <div className={cn(embedded && BENCHMARK_EMBEDDED_PLAN_TABLE_FRAME_CLASS)}>
              <PlanComparisonTable
                plans={top3Plans}
                filterResetKey={top3ListFilterResetKey}
                selectedPlanKey={selectedTop3PlanKey}
                onSelectPlan={(plan) => {
                  const key = planDetailKey(plan);
                  setSelectedTop3PlanKey((current) => (current === key ? null : key));
                }}
                scenario={scenario}
                myAvailablePlans={myAvailablePlans}
                isAreaCatalogList={filterScope === "area"}
                usesInnerScroll={false}
                stickyTableHeader={false}
              />
            </div>
          </TabsContent>
          {top3SideBySideEnabled ? (
            <TabsContent
              value={PLAN_SIDE_BY_SIDE_TAB}
              className="mt-2 space-y-2 scroll-mt-24"
            >
              <p className="text-xs text-muted-foreground leading-snug">
                Top 3 pathways — premiums, medical cost-sharing, drug tiers, and bundled benefits
                compared in one view.
              </p>
              <PlanSideBySideComparison plans={top3Plans} medications={scenario.medications} />
            </TabsContent>
          ) : null}
          {top3Plans.map((plan) => (
            <TabsContent
              key={`${plan.carrier}-${plan.plan}-panel`}
              id={planRankAnchorId(plan.rank)}
              value={String(plan.rank)}
              className="mt-2 space-y-2 scroll-mt-24"
            >
              {renderTop3PlanPanel(plan)}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <>
          <Section
            id={BENCHMARK_PLANS_SUBSECTION.recommended}
            title={sectionMeta.topPickTitle}
            {...subsectionPanelProps(BENCHMARK_PLANS_SUBSECTION.recommended)}
          >
            <PlanChoiceCard
              plan={top}
              year={scenario.year}
              zip3={scenario.zip3}
              highlight
              rankLabel={sectionMeta.topRankLabel}
              id={planCardAnchorId(top)}
              medications={scenario.medications}
              compactDrugList={compact}
              onCarrierClick={planInListHandler(top)}
            />
          </Section>

          {runnersUp.length > 0 ? (
            <Section
              id={BENCHMARK_PLANS_SUBSECTION.runnersUp}
              title={runnersUpTitle}
              {...subsectionPanelProps(BENCHMARK_PLANS_SUBSECTION.runnersUp)}
            >
              <div className={cn(compact ? "space-y-1.5" : "space-y-2")}>
                {runnersUp.map((plan) => (
                  <PlanChoiceCard
                    key={`${plan.carrier}-${plan.plan}`}
                    plan={plan}
                    year={scenario.year}
                    zip3={scenario.zip3}
                    rankLabel={planChoiceRankSuffix()}
                    id={planCardAnchorId(plan)}
                    medications={scenario.medications}
                    compactDrugList={compact}
                    onCarrierClick={planInListHandler(plan)}
                  />
                ))}
              </div>
            </Section>
          ) : null}
        </>
      )}
    </div>
  );
}
