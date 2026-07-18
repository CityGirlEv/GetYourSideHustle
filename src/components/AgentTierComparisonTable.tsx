import { Check, Minus } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Badge } from "@/components/ui/badge";
import {
  AGENT_TIER_ORDER,
  AGENT_TIERS,
  agentTierComparisonAttributeRows,
  formatAgentTierTabMeta,
  tierIncludesFeature,
  type AgentTierId,
} from "@/lib/agent-pricing-tiers";
import { cn } from "@/lib/utils";

const COMPARISON_HEADER_CELL =
  "bg-[var(--brand-navy)] py-2 px-3 text-left font-semibold text-white border-b border-white/15";

type AgentTierComparisonTableProps = {
  showActions?: boolean;
  className?: string;
};

export function AgentTierComparisonTable({
  showActions = true,
  className,
}: AgentTierComparisonTableProps) {
  const rows = agentTierComparisonAttributeRows();

  return (
    <div
      className={cn("glass rounded-lg border border-border/60 overflow-hidden", className)}
      data-testid="agent-tier-comparison"
    >
      <div className="overflow-x-auto overscroll-contain">
        <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-xs">
          <thead>
            <tr>
              <th
                className={cn(
                  COMPARISON_HEADER_CELL,
                  "sticky left-0 z-20 min-w-[10rem] shadow-[2px_0_4px_-1px_rgba(0,0,0,0.25)]",
                )}
              >
                Feature
              </th>
              {AGENT_TIER_ORDER.map((tierId) => {
                const tier = AGENT_TIERS[tierId];
                const isPopular = tierId === "gold";
                return (
                  <th
                    key={tierId}
                    className={cn(
                      COMPARISON_HEADER_CELL,
                      "min-w-[9rem] align-bottom",
                      isPopular && "bg-emerald/90",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span>{tier.name}</span>
                      {isPopular ? (
                        <Badge className="bg-white/15 text-white text-[10px] px-1.5 py-0">
                          Popular
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-[10px] font-normal opacity-90 leading-snug mt-0.5 tabular-nums">
                      {formatAgentTierTabMeta(tierId)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border/60">
                <td
                  className={cn(
                    "sticky left-0 z-[5] py-2 px-3 text-muted-foreground font-medium bg-background",
                    "shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]",
                  )}
                >
                  {row.label}
                </td>
                {AGENT_TIER_ORDER.map((tierId) => (
                  <td key={`${tierId}-${row.id}`} className="py-2 px-3 align-top">
                    <ComparisonCell row={row} tierId={tierId} />
                  </td>
                ))}
              </tr>
            ))}
            {showActions ? (
              <tr className="border-t border-border bg-primary/5">
                <td
                  className={cn(
                    "sticky left-0 z-[5] py-3 px-3 font-medium bg-primary/5",
                    "shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]",
                  )}
                >
                  Subscribe
                </td>
                {AGENT_TIER_ORDER.map((tierId) => (
                  <td key={`${tierId}-cart`} className="py-3 px-3">
                    <AddToCartButton payload={{ kind: "agent-tier", tierId }} />
                  </td>
                ))}
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComparisonCell({
  row,
  tierId,
}: {
  row: ReturnType<typeof agentTierComparisonAttributeRows>[number];
  tierId: AgentTierId;
}) {
  if (row.kind === "feature" && row.featureId) {
    const included = tierIncludesFeature(tierId, row.featureId);
    return included ? (
      <span className="inline-flex items-center gap-1 text-foreground">
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald" aria-hidden />
        <span className="sr-only">Included</span>
      </span>
    ) : (
      <span className="inline-flex items-center text-muted-foreground/60">
        <Minus className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="sr-only">Not included</span>
      </span>
    );
  }

  return (
    <span className={cn("tabular-nums", row.id === "monthly-price" && "font-semibold text-foreground")}>
      {row.getTextValue?.(tierId) ?? "—"}
    </span>
  );
}
