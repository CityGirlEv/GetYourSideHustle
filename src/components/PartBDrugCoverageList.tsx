import { ChevronRight, Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PART_B_DRUG_CATEGORIES, partBMedicationsFromIntake } from "@/lib/part-b-drugs";
import type { Medication } from "@/lib/medicare-math";

export function PartBDrugCoverageList({
  medications,
  className,
  defaultOpen = false,
  variant = "collapsible",
}: {
  medications: Medication[];
  className?: string;
  defaultOpen?: boolean;
  /** `panel` — expanded content for the Part B meds tab (no collapsible chrome). */
  variant?: "collapsible" | "panel";
}) {
  const partBMeds = partBMedicationsFromIntake(medications);
  if (medications.length === 0) return null;

  const content = (
    <>
      <p className="text-[10px] text-muted-foreground leading-snug">
        Part B covers certain outpatient drugs and DME supplies — separate from Part D prescription
        drug plans. These are generally not on a Part D formulary.
      </p>
      {partBMeds.length > 0 ? (
        <div className="rounded border border-primary/20 bg-primary/5 px-2 py-1.5">
          <p className="text-[10px] font-semibold text-foreground mb-1">
            From your medication list (estimated Part B):
          </p>
          <ul className="space-y-0.5 text-[10px] text-muted-foreground">
            {partBMeds.map((med) => (
              <li key={med.id}>
                <span className="font-medium text-foreground">{med.medication_name}</span>
                {[med.strength, med.dosage_form].filter(Boolean).length > 0
                  ? ` · ${[med.strength, med.dosage_form].filter(Boolean).join(" · ")}`
                  : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="space-y-1.5">
        {PART_B_DRUG_CATEGORIES.map((entry) => (
          <div key={entry.category}>
            <p className="text-[10px] font-semibold text-foreground">{entry.category}</p>
            <p className="text-[10px] text-muted-foreground leading-snug">
              {entry.examples.join(" · ")}
            </p>
            {entry.note ? (
              <p className="text-[10px] text-muted-foreground/80 leading-snug mt-0.5">
                {entry.note}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );

  if (variant === "panel") {
    return (
      <div className={cn("space-y-2 rounded border border-border/60 bg-muted/10 px-2.5 py-2", className)}>
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Pill className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          <span>Drugs covered under Medicare Part B</span>
          {partBMeds.length > 0 ? (
            <span className="ml-auto text-[10px] font-normal text-muted-foreground tabular-nums">
              {partBMeds.length} in your list
            </span>
          ) : null}
        </div>
        {content}
      </div>
    );
  }

  return (
    <Collapsible
      defaultOpen={defaultOpen || partBMeds.length > 0}
      className={cn("rounded border border-border/60 bg-muted/10", className)}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted/20 [&[data-state=open]>svg]:rotate-90">
        <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform" aria-hidden />
        <Pill className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        <span>Drugs covered under Medicare Part B</span>
        {partBMeds.length > 0 ? (
          <span className="ml-auto text-[10px] font-normal text-muted-foreground tabular-nums">
            {partBMeds.length} in your list
          </span>
        ) : null}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 px-2.5 pb-2.5 pt-0">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );
}
