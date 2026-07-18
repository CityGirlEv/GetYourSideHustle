import { buildDrugReport } from "@/components/DrugReport";
import { buildPlanDrugEstimates } from "@/lib/plan-drug-estimate";
import {
  isMedigapPlan,
  isStandalonePartDPlan,
  type PlanDetail,
} from "@/lib/plan-details";
import { usd, type Medication } from "@/lib/medicare-math";
import { cn } from "@/lib/utils";
import { planUsd } from "@/lib/plan-comparison-rationale";

function planDrugListHeading(plan: PlanDetail): string {
  if (isMedigapPlan(plan)) {
    return `Paired Part D — est. drug costs — ${plan.carrier}`;
  }
  if (isStandalonePartDPlan(plan)) {
    return `Part D formulary — est. drug costs — ${plan.carrier}`;
  }
  return `Est. drug costs — ${plan.carrier}`;
}

function medigapPartDCoverageIntro(plan: PlanDetail): string {
  const deductible =
    plan.deductibleRx > 0 ? `${planUsd(plan.deductibleRx)} Rx deductible` : "$0 Rx deductible";
  return `Standalone Part D modeled with this supplement — ${planUsd(plan.premiumRx)}/mo premium · ${deductible} · T1 ${plan.rxTier1} · T2 ${plan.rxTier2} · T3 ${plan.rxTier3} · ${planUsd(plan.rxOOPCap)} OOP cap`;
}

/** Intake medication tiers — Part D formulary placement for list-header summaries. */
export function PlanEnteredDrugSummary({
  medications,
  compact = false,
  title = "Your medications — CMS tier placement",
  hint = "Expand any plan row below for modeled tier copays and estimated costs on that contract.",
}: {
  medications: Medication[];
  compact?: boolean;
  title?: string;
  hint?: string;
}) {
  const rows = buildDrugReport(medications);
  if (!rows.length) return null;

  return (
    <div className={cn("space-y-1", compact ? "text-[10px]" : "text-xs")}>
      <div className="font-semibold text-foreground leading-snug">
        {title}
      </div>
      <ul className="space-y-0.5 text-muted-foreground leading-snug">
        {rows.map((row) => (
          <li key={row.name}>
            <span className="font-medium text-foreground">{row.name}</span>
            {" · "}
            {row.tier}
            {" · "}
            <span className="tabular-nums">guide {usd(row.estPlanMonthly)}/mo</span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-muted-foreground leading-snug">
        {hint}
      </p>
    </div>
  );
}

export function PlanDrugCostList({
  plan,
  medications,
  compact = false,
  embedded = false,
}: {
  plan: PlanDetail;
  medications: Medication[];
  compact?: boolean;
  /** Nested under a plan row — compact list, no repeated disclaimer. */
  embedded?: boolean;
}) {
  const rows = buildPlanDrugEstimates(plan, medications);
  if (!rows.length) return null;

  const totalMonthly = rows.reduce((sum, row) => sum + row.estMonthly, 0);
  const totalAnnual = Math.min(
    rows.reduce((sum, row) => sum + row.estAnnual, 0),
    plan.rxOOPCap,
  );

  if (embedded) {
    return (
      <div className={cn("space-y-0.5", compact ? "text-[10px]" : "text-xs")}>
        {isMedigapPlan(plan) ? (
          <p className="text-[10px] text-muted-foreground leading-snug">
            Medigap covers medical costs under Original Medicare. Prescription coverage comes from
            the paired Part D plan below.
          </p>
        ) : null}
        {isMedigapPlan(plan) ? (
          <p className="text-[10px] text-muted-foreground leading-snug">
            {medigapPartDCoverageIntro(plan)}
          </p>
        ) : null}
        <div className={cn("font-semibold text-foreground leading-snug", compact && "text-[10px]")}>
          {planDrugListHeading(plan)}
        </div>
        <ul className="space-y-0.5 text-muted-foreground leading-snug">
          {rows.map((row) => (
            <li key={`${row.name}-${row.tier}`}>
              <span className="font-medium text-foreground">{row.name}</span>
              {" · "}
              {row.tier}
              {" · "}
              <span className="text-[10px]">copay {row.tierCopay}</span>
              {" · "}
              <span className="tabular-nums text-foreground">{usd(row.estMonthly)}/mo</span>
              <span className="tabular-nums"> ({usd(row.estAnnual)}/yr)</span>
            </li>
          ))}
        </ul>
        <p className="font-semibold tabular-nums text-foreground leading-snug">
          Rx total (est.): {usd(totalMonthly)}/mo · {usd(totalAnnual)}/yr
          <span className="font-normal text-muted-foreground">
            {" "}
            (before {usd(plan.rxOOPCap)} cap)
          </span>
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-1.5",
        !embedded && "border-t border-border pt-2",
        compact ? "text-[10px]" : "text-xs",
      )}
    >
      <div className={cn("font-semibold text-foreground", compact ? "text-[10px]" : "text-xs")}>
        Your medications on this plan
      </div>
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full border-collapse min-w-[420px]">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border/60">
              <th className="py-1 pr-2 font-medium">Drug</th>
              <th className="py-1 pr-2 font-medium">Tier</th>
              <th className="py-1 pr-2 font-medium text-right">Est. /mo</th>
              <th className="py-1 font-medium text-right">Est. /yr</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.name}-${row.tier}`} className="border-b border-border/40 align-top">
                <td className="py-1 pr-2 font-medium text-foreground">{row.name}</td>
                <td className="py-1 pr-2">
                  <div>{row.tier}</div>
                  <div className="text-[10px] text-muted-foreground">Copay: {row.tierCopay}</div>
                </td>
                <td className="py-1 pr-2 text-right tabular-nums">{usd(row.estMonthly)}</td>
                <td className="py-1 text-right tabular-nums">{usd(row.estAnnual)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold text-foreground">
              <td className="py-1 pr-2" colSpan={2}>
                Total (before {usd(plan.rxOOPCap)} Rx cap)
              </td>
              <td className="py-1 pr-2 text-right tabular-nums">{usd(totalMonthly)}</td>
              <td className="py-1 text-right tabular-nums">{usd(totalAnnual)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground leading-snug">
        Tier placement follows CMS Part D guidance; copays are modeled from plan type and CMS star
        rating — confirm tier and cost on the plan formulary before enrolling.
      </p>
    </div>
  );
}
