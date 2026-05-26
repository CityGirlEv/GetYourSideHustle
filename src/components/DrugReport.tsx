import { Card } from "@/components/ui/card";
import { Pill, AlertCircle } from "lucide-react";
import { INSULIN_CAP_MONTHLY, isDmeForm, usd, type Medication } from "@/lib/medicare-math";

export interface DrugReportRow {
  name: string;
  strength: string;
  form: string;
  frequency: string;
  resolvedDiagnosis?: string;
  retailMonthly: number;
  tier: string;
  tierRationale: string;
  estPlanMonthly: number;
  estPlanAnnual: number;
  notes: string[];
}

function isInsulin(m: Medication): boolean {
  return /insulin|novolog|humalog|lantus|tresiba|admelog|basaglar|levemir|toujeo/i.test(
    m.medication_name + " " + (m.resolved_diagnosis ?? ""),
  );
}

/** Heuristic CMS Part D formulary tier classification. Actual tier varies by
 * plan formulary — this estimate is based on generic vs brand status and
 * retail price thresholds aligned with CMS guidance. */
function classifyTier(m: Medication): { tier: string; rationale: string; estPlanMonthly: number } {
  const retail = m.estimated_monthly_retail ?? 0;
  if (isDmeForm(m.dosage_form)) {
    return {
      tier: "Part B (DME)",
      rationale: "Durable Medical Equipment billed under Part B — not a Part D tier.",
      estPlanMonthly: Math.round(retail * 0.2),
    };
  }
  if (isInsulin(m)) {
    return {
      tier: "Tier 3 (Insulin · IRA cap)",
      rationale: "Insulin capped at $35/mo under the Inflation Reduction Act regardless of tier.",
      estPlanMonthly: Math.min(retail, INSULIN_CAP_MONTHLY),
    };
  }
  const isBrand = !!m.generic_alternative || m.no_generic_available === true;
  if (!isBrand) {
    // Generic
    if (retail < 15) return { tier: "Tier 1 — Preferred Generic", rationale: "Low-cost generic on most formularies.", estPlanMonthly: 4 };
    return { tier: "Tier 2 — Generic", rationale: "Generic drug, typical copay $10–$20.", estPlanMonthly: 12 };
  }
  // Brand
  if (retail >= 670) {
    return {
      tier: "Tier 5 — Specialty",
      rationale: "CMS specialty threshold (~$670/mo). Coinsurance 25–33% until OOP cap.",
      estPlanMonthly: Math.round(retail * 0.3),
    };
  }
  if (m.no_generic_available) {
    return { tier: "Tier 4 — Non-Preferred Brand", rationale: "Brand-only drug with no generic equivalent.", estPlanMonthly: Math.round(retail * 0.4) };
  }
  return { tier: "Tier 3 — Preferred Brand", rationale: "Brand drug with a generic alternative available.", estPlanMonthly: Math.round(retail * 0.25) };
}

export function buildDrugReport(meds: Medication[]): DrugReportRow[] {
  return meds.map((m) => {
    const { tier, rationale, estPlanMonthly } = classifyTier(m);
    const notes: string[] = [];
    if (m.generic_alternative) notes.push(`Generic available: ${m.generic_alternative}`);
    if (m.no_generic_available) notes.push("No generic equivalent (brand-only)");
    if (m.coverage_uncertain) notes.push("Coverage estimate — verify against plan formulary");
    return {
      name: m.medication_name,
      strength: m.strength,
      form: m.dosage_form,
      frequency: m.frequency,
      tier,
      tierRationale: rationale,
      retailMonthly: m.estimated_monthly_retail ?? 0,
      estPlanMonthly,
      estPlanAnnual: estPlanMonthly * 12,
      notes,
    };
  });
}

export function DrugReport({ medications }: { medications: Medication[] }) {
  if (!medications?.length) return null;
  const rows = buildDrugReport(medications);
  const totalRetail = rows.reduce((s, r) => s + r.retailMonthly, 0);
  const totalPlanMonthly = rows.reduce((s, r) => s + r.estPlanMonthly, 0);

  return (
    <Card className="p-5 text-left space-y-4">
      <div className="flex items-center gap-2">
        <Pill className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold">Prescription Drug Report</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Estimated CMS Part D formulary tier and member cost for each medication you entered. Actual tier and copay vary by plan formulary.
      </p>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-xs border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-3 font-semibold">Drug</th>
              <th className="py-2 pr-3 font-semibold">Tier</th>
              <th className="py-2 pr-3 font-semibold text-right">Retail / mo</th>
              <th className="py-2 pr-3 font-semibold text-right">Est. plan / mo</th>
              <th className="py-2 pr-3 font-semibold text-right">Est. plan / yr</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border/50 align-top">
                <td className="py-2 pr-3">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">{[r.strength, r.form, r.frequency].filter(Boolean).join(" · ")}</div>
                  {r.notes.map((n, j) => (
                    <div key={j} className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <AlertCircle className="h-2.5 w-2.5 shrink-0" /> {n}
                    </div>
                  ))}
                </td>
                <td className="py-2 pr-3">
                  <div className="font-semibold">{r.tier}</div>
                  <div className="text-[10px] text-muted-foreground">{r.tierRationale}</div>
                </td>
                <td className="py-2 pr-3 text-right tabular-nums">{usd(r.retailMonthly)}</td>
                <td className="py-2 pr-3 text-right tabular-nums font-semibold">{usd(r.estPlanMonthly)}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{usd(r.estPlanAnnual)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="py-2 pr-3" colSpan={2}>Totals (before Part D $2,100 OOP cap)</td>
              <td className="py-2 pr-3 text-right tabular-nums">{usd(totalRetail)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{usd(totalPlanMonthly)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{usd(totalPlanMonthly * 12)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-[10px] text-muted-foreground border-t border-border pt-2">
        Tier estimates follow CMS Part D guidance: Tier 1/2 generics, Tier 3 preferred brand, Tier 4 non-preferred brand, Tier 5 specialty (≥ $670/mo). Insulin capped at $35/mo (IRA). DME billed under Part B.
      </p>
    </Card>
  );
}