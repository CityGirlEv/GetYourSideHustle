import { BENCHMARK_TOOL_ID_LABEL, PBO_BLUEPRINT_LABEL } from "@/lib/plan-comparison-copy";
import { cn } from "@/lib/utils";
import { ClipboardList, FileBarChart, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: PBO_BLUEPRINT_LABEL,
    body: "ZIP, eligibility, meds, and priorities — nothing that identifies you personally.",
  },
  {
    icon: FileBarChart,
    title: "See your benchmark report",
    body: "Federal Part B baselines and regional frameworks from your inputs — educational only.",
  },
  {
    icon: ShieldCheck,
    title: `Get your ${BENCHMARK_TOOL_ID_LABEL}`,
    body: `Private ${BENCHMARK_TOOL_ID_LABEL} and report link on this device — partner contact only if you choose.`,
  },
] as const;

export function ScenarioNewHowItWorks({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <section
        className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-3 sm:px-4 sm:py-3.5"
        aria-labelledby="scenario-how-it-works-heading"
      >
        <div className="flex flex-col gap-2.5 sm:gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              How it works
            </p>
            <h2
              id="scenario-how-it-works-heading"
              className="mt-0.5 font-display text-base font-bold text-primary text-balance sm:text-lg"
            >
              A few easy steps — private from start to finish
            </h2>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Understand your Medicare options before anyone asks for your phone number or email.
            </p>
          </div>

          <ol className="grid gap-2 sm:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-2 sm:px-3"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1 text-xs font-semibold text-foreground leading-tight">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                        {step.title}
                      </div>
                      <p className="text-[11px] leading-snug text-muted-foreground">{step.body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="text-[10px] leading-tight text-muted-foreground">
            Educational only — we do not sell insurance or enroll you in coverage. We may not
            represent every plan available in your area.
          </p>
        </div>
      </section>
    </div>
  );
}
