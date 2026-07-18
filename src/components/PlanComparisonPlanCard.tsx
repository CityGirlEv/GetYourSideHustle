import { PlanDrugCostList } from "@/components/PlanDrugCostList";
import { medicationsForPlanDrugEstimates } from "@/lib/plan-drug-estimate";
import { isMedigapPlan, type PlanDetail } from "@/lib/plan-details";
import { partBMedicationsFromIntake, partBDrugNoteForPlan } from "@/lib/part-b-drugs";
import { planUsd } from "@/lib/plan-comparison-rationale";
import type { Medication } from "@/lib/medicare-math";
import { BENCHMARK_REPORT_LINK_CLASS } from "@/lib/benchmark-report-ui";
import { cn } from "@/lib/utils";

function PlanStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background/50 border border-border p-2">
      <div className="text-micro uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

export function PlanChoiceCard({
  plan,
  year,
  highlight = false,
  rankLabel,
  id,
  medications,
  compactDrugList = false,
  onCarrierClick,
}: {
  plan: PlanDetail;
  year: number;
  highlight?: boolean;
  rankLabel?: string;
  zip3?: string;
  id?: string;
  medications?: Medication[];
  compactDrugList?: boolean;
  /** Opens the plan in the rankings table (Potential Top 3). */
  onCarrierClick?: () => void;
}) {
  const rankText =
    rankLabel ??
    (highlight ? `· Best match for ${year}` : plan.rank <= 3 ? "· Also consider" : "· Available in your area");

  const partBNote =
    medications && medications.length > 0
      ? partBDrugNoteForPlan(plan, partBMedicationsFromIntake(medications))
      : null;

  return (
    <div
      id={id}
      tabIndex={id ? -1 : undefined}
      className={
        highlight
          ? "scroll-mt-28 rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3"
          : id
            ? "scroll-mt-28 rounded-lg border border-border bg-background/40 p-4 space-y-3"
            : "rounded-lg border border-border bg-background/40 p-4 space-y-3"
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            #{plan.rank} {rankText}
          </div>
          <div
            className={`font-display font-bold ${highlight ? "text-lg" : "text-base"}`}
          >
            {onCarrierClick ? (
              <button
                type="button"
                onClick={onCarrierClick}
                className={cn(
                  "text-left hover:text-primary",
                  BENCHMARK_REPORT_LINK_CLASS,
                )}
              >
                {plan.carrier}
              </button>
            ) : (
              plan.carrier
            )}
            {" — "}
            {plan.plan}
          </div>
          <div className="text-xs text-muted-foreground">
            {plan.planType} · {plan.network}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Est. monthly</div>
          <div className={`font-display font-bold tabular-nums ${highlight ? "text-2xl" : "text-xl"}`}>
            {planUsd(plan.monthly)}
          </div>
          <div className="text-xs text-muted-foreground">
            ~{planUsd(plan.annual)} / yr incl. drugs
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <PlanStat label="PCP / Specialist" value={`${plan.pcpCopay} / ${plan.specCopay}`} />
        <PlanStat label="ER / Hospital" value={`${plan.erCopay} · ${plan.hospCopay}`} />
        <PlanStat label="Med MOOP" value={plan.moop} />
        <PlanStat label="Stars / AM Best" value={`${plan.stars} · ${plan.amBest}`} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">Part B:</span> {planUsd(plan.premiumPartB)}/mo
        </div>
        <div>
          <span className="font-medium text-foreground">Plan premium:</span>{" "}
          {planUsd(plan.premiumPlan)}/mo
        </div>
        <div>
          <span className="font-medium text-foreground">Part D / Rx:</span> {planUsd(plan.premiumRx)}/mo
        </div>
        <div>
          <span className="font-medium text-foreground">Dental:</span> {plan.dentalBenefit}
        </div>
        <div>
          <span className="font-medium text-foreground">Vision:</span> {plan.visionBenefit}
        </div>
        <div>
          <span className="font-medium text-foreground">Rx tiers:</span> T1 {plan.rxTier1} · T3{" "}
          {plan.rxTier3}
        </div>
      </div>
      {partBNote ? (
        <p className="text-[10px] text-muted-foreground leading-snug rounded border border-primary/15 bg-primary/5 px-2 py-1.5">
          {partBNote}
        </p>
      ) : null}
      {medications && medicationsForPlanDrugEstimates(plan, medications).length > 0 ? (
        <div
          className={cn(
            "border-t border-border pt-2",
            isMedigapPlan(plan) && "space-y-1",
          )}
        >
          <PlanDrugCostList
            plan={plan}
            medications={medications}
            compact={compactDrugList}
            embedded={compactDrugList}
          />
        </div>
      ) : null}
      {plan.extras ? (
        <div className="border-t border-border pt-2 text-xs text-muted-foreground">{plan.extras}</div>
      ) : null}
    </div>
  );
}
