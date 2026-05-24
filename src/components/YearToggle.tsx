import { useApp } from "@/lib/app-store";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GUIDELINES } from "@/lib/medicare-math";

export function YearToggle() {
  const { year, setYear } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-full p-1 flex items-center gap-1 shadow-sm">
      {[2026, 2027].map((y) => (
        <button
          key={y}
          onClick={() => setYear(y as 2026 | 2027)}
          className={`px-2 py-0.5 rounded-full text-xs font-semibold transition ${
            year === y ? "grad-indigo shadow" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {y} rules
        </button>
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="ml-1 p-1.5 rounded-full hover:bg-secondary" aria-label="Compare years">
            <Sparkles className="h-4 w-4 text-primary" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>2026 vs 2027 Regulatory Shifts</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="font-semibold text-muted-foreground">Metric</div>
            <div className="font-semibold">2026</div>
            <div className="font-semibold">2027</div>
            {([
              ["Part B premium / mo", "partBPremiumMonthly"],
              ["Part B deductible", "partBDeductible"],
              ["Part D OOP cap", "partDOOPCap"],
              ["MA MOOP (low)", "moopLow"],
              ["MA MOOP (high)", "moopHigh"],
            ] as const).map(([label, key]) => (
              <ContextRow key={key} label={label} k={key} />
            ))}
            <div className="col-span-3 mt-2 text-muted-foreground">
              Insulin remains capped at $35/mo. Plan G continues to cover Part B coinsurance after
              the annual deductible. MA introduces a 20% DME co-insurance not covered by Medigap.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContextRow({ label, k }: { label: string; k: keyof typeof GUIDELINES[2026] }) {
  const a = GUIDELINES[2026][k];
  const b = GUIDELINES[2027][k];
  return (
    <>
      <div className="text-muted-foreground">{label}</div>
      <div>{typeof a === "number" ? `$${a.toLocaleString()}` : a}</div>
      <div className="text-emerald font-medium">{typeof b === "number" ? `$${b.toLocaleString()}` : b}</div>
    </>
  );
}
