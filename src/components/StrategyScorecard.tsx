import { calcPathways, usd, GUIDELINES } from "@/lib/medicare-math";
import { useApp, type Client } from "@/lib/app-store";
import { AlertTriangle, Check, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";

export function StrategyScorecard({ client }: { client: Client }) {
  const { year } = useApp();
  const g = GUIDELINES[year];
  const hasDME = client.meds.some((m) => /CGM|Pump|CPAP|DME/i.test(m.resolved_diagnosis ?? m.dosage_form));
  const { A, B } = calcPathways({ year, county: client.county, meds: client.meds, hasDME });

  const recommend = client.monthly_cost_concern && B.totalAnnual < A.totalAnnual ? "B" : "A";
  const winner = recommend === "A" ? A : B;

  return (
    <div className="space-y-4">
      <Card className="glass p-5 border-emerald/40">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-emerald-foreground"/>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Optimal pathway · {year}</div>
              <div className="font-display text-xl font-bold">{winner.label}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Predicted annual cost</div>
            <div className="text-2xl font-bold text-emerald">{usd(winner.totalAnnual)}</div>
          </div>
        </div>
      </Card>

      {client.monthly_cost_concern && (
        <Card className="glass p-4 border-warning/40 bg-warning/5">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5"/>
            <div className="text-sm">
              <div className="font-semibold">MOOP surprise risk on Medicare Advantage</div>
              <div className="text-muted-foreground">
                You've flagged monthly cost predictability as critical. Pathway B caps annual
                medical out-of-pocket between {usd(g.moopLow)}–{usd(g.moopHigh)}. Pathway A
                (Medigap Plan G) covers 100% of Part B coinsurance after the {usd(g.partBDeductible)} deductible — virtually no surprise hospital bills.
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {[A, B].map((p, i) => {
          const isWinner = (i === 0 && recommend === "A") || (i === 1 && recommend === "B");
          return (
            <Card key={p.label} className={`glass p-5 ${isWinner ? "ring-2 ring-emerald" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Pathway {i === 0 ? "A" : "B"}</div>
                  <div className="font-semibold">{p.label}</div>
                </div>
                {isWinner && <span className="text-xs bg-emerald text-emerald-foreground px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="h-3 w-3"/>Recommended</span>}
              </div>
              <div className="space-y-1.5 text-sm">
                {p.breakdown.map((b) => (
                  <div key={b.label} className="flex justify-between">
                    <span className="text-muted-foreground">{b.label}</span>
                    <span className="font-medium tabular-nums">{usd(b.value)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Expected annual</span>
                  <span className="font-bold tabular-nums">{usd(p.totalAnnual)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    {i === 0 ? <TrendingDown className="h-3 w-3 text-emerald"/> : <TrendingUp className="h-3 w-3 text-warning"/>}
                    Worst-case annual
                  </span>
                  <span className={`tabular-nums font-medium ${i === 1 ? "text-warning" : "text-emerald"}`}>{usd(p.worstCaseAnnual)}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
